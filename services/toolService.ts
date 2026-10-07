import { Tool, ToolSubmission, PlatformStats, ToolsApiResponse } from '../types';
import { TOOLS_REGISTRY, getToolById as getLocalToolById } from '../constants';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { isValidHttpUrl } from './securityUtils';

export interface FetchToolsParams {
  q?: string;
  category?: string;
  pricing?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface UpvoteResult {
  status: 'success' | 'error';
  action?: 'added' | 'removed';
  upvotes?: number;
  toolId?: string;
  message?: string;
}

export const toolService = {
  /**
   * Fetch tools from the backend REST API with fallback to constants
   */
  fetchTools: async (params: FetchToolsParams = {}): Promise<ToolsApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.category && params.category !== 'All') searchParams.set('category', params.category);
    if (params.pricing && params.pricing !== 'All') searchParams.set('pricing', params.pricing);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    try {
      const response = await fetch(`/api/v2/tools?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json as ToolsApiResponse;
      }
      throw new Error('Malformed API response');
    } catch (err) {
      console.warn('[toolService] Backend unreachable, falling back to local registry:', err);
      
      // Resilient client-side fallback
      const q = (params.q || '').toLowerCase().trim();
      const category = params.category;
      const pricing = params.pricing;
      const sort = params.sort || 'relevance';
      const page = params.page || 1;
      const limit = params.limit || 9;

      let filtered = TOOLS_REGISTRY.filter(tool => {
        const matchQ = !q || tool.name.toLowerCase().includes(q) || 
          tool.description.toLowerCase().includes(q) || 
          tool.tags.some(t => t.toLowerCase().includes(q));
        const matchCat = !category || category === 'All' || tool.category.toLowerCase() === category.toLowerCase();
        const matchPrice = !pricing || pricing === 'All' || tool.pricing.toLowerCase() === pricing.toLowerCase();
        return matchQ && matchCat && matchPrice;
      });

      if (sort === 'rating') {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      } else if (sort === 'reviews') {
        filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
      } else if (sort === 'name') {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        status: 'fallback',
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        }
      };
    }
  },

  /**
   * Fetch single tool details by ID with related tools
   */
  fetchToolById: async (id: string): Promise<{ tool: Tool | null; related: Tool[] }> => {
    try {
      const response = await fetch(`/api/v2/tools/${encodeURIComponent(id)}`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success' && json.data) {
          return {
            tool: json.data as Tool,
            related: (json.related || []) as Tool[],
          };
        }
      }
    } catch (err) {
      console.warn(`[toolService] Error fetching tool ${id} from API:`, err);
    }

    // Fallback
    const local = getLocalToolById(id) || null;
    const related = local 
      ? TOOLS_REGISTRY.filter(t => t.id !== local.id && (t.category === local.category || t.tags.some(tag => local.tags.includes(tag)))).slice(0, 5)
      : [];

    return { tool: local, related };
  },

  /**
   * Check if the currently authenticated user has upvoted this tool
   */
  hasUserUpvoted: async (toolId: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      const voteRef = doc(db, 'toolUpvotes', `${toolId}_${user.uid}`);
      const snap = await getDoc(voteRef);
      return snap.exists();
    } catch {
      return false;
    }
  },

  /**
   * Toggle persistent upvote for a tool via Firestore (1 user + 1 tool = 1 vote).
   * Survives restarts and scales seamlessly across multi-instance infrastructure.
   */
  upvoteTool: async (toolId: string): Promise<UpvoteResult> => {
    const user = auth.currentUser;
    if (!user) {
      return {
        status: 'error',
        message: 'Please sign in to upvote tools and save them to your workflow.',
      };
    }

    if (!getLocalToolById(toolId)) {
      return {
        status: 'error',
        message: `Cannot upvote tool '${toolId}': It is not part of the canonical registry.`,
      };
    }

    const voteDocId = `${toolId}_${user.uid}`;
    const voteRef = doc(db, 'toolUpvotes', voteDocId);

    try {
      const voteSnap = await getDoc(voteRef);
      if (voteSnap.exists()) {
        await deleteDoc(voteRef);
        return {
          status: 'success',
          action: 'removed',
          toolId,
          message: 'Upvote removed.',
        };
      } else {
        await setDoc(voteRef, {
          toolId,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
        return {
          status: 'success',
          action: 'added',
          toolId,
          message: 'Upvote recorded.',
        };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Database error recording upvote';
      console.error('[toolService] Upvote error:', errMsg);
      return { status: 'error', message: errMsg };
    }
  },

  /**
   * Submit a new tool to the persistent Firestore moderation queue.
   * Derives verified user identity from Firebase Auth (preventing spoofing).
   */
  submitTool: async (submission: ToolSubmission): Promise<{ success: boolean; message: string; data?: any }> => {
    const user = auth.currentUser;
    if (!user) {
      return { 
        success: false, 
        message: 'Authentication required: You must be signed in with your verified account to submit a tool.' 
      };
    }

    if (!submission.websiteUrl || !isValidHttpUrl(submission.websiteUrl.trim(), true)) {
      return {
        success: false,
        message: 'Invalid URL: A valid, publicly accessible HTTPS website URL is required.'
      };
    }

    const newId = submission.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const submissionId = `${newId}_${Date.now()}`;
    const submissionRef = doc(db, 'toolSubmissions', submissionId);

    const submissionPayload = {
      id: newId,
      name: submission.name.trim().slice(0, 80),
      category: submission.category,
      pricing: submission.pricing,
      description: submission.description.trim().slice(0, 2000),
      websiteUrl: submission.websiteUrl.trim().slice(0, 2000),
      tags: Array.isArray(submission.tags) ? submission.tags.slice(0, 10) : [submission.category.toLowerCase()],
      submittedBy: user.uid,
      status: 'PENDING_REVIEW' as const,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(submissionRef, submissionPayload);
      return {
        success: true,
        message: `Tool "${submissionPayload.name}" submitted successfully to the moderation queue.`,
        data: submissionPayload,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error submitting tool to moderation queue';
      console.error('[toolService] Tool submission error:', errMsg);
      return { success: false, message: errMsg };
    }
  },

  /**
   * Fetch platform ecosystem metrics
   */
  fetchPlatformStats: async (): Promise<PlatformStats | null> => {
    try {
      const response = await fetch('/api/v2/stats');
      if (response.ok) {
        const json = await response.json();
        return json.data as PlatformStats;
      }
    } catch (err) {
      console.warn('[toolService] Failed to load platform stats:', err);
    }
    return null;
  },

  /**
   * Check backend health and ping latency
   */
  checkServerHealth: async (): Promise<{ ok: boolean; latencyMs: number; statusText: string }> => {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        return { ok: true, latencyMs, statusText: 'ONLINE' };
      }
      return { ok: false, latencyMs, statusText: `HTTP ${res.status}` };
    } catch {
      return { ok: false, latencyMs: 0, statusText: 'OFFLINE' };
    }
  },
};
