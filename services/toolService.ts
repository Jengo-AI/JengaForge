import { Tool, ToolSubmission, PlatformStats, ToolsApiResponse } from '../types';
import { getToolById as getLocalToolById, queryToolsRegistry, getRelatedTools } from '../constants';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { isValidHttpUrl, sanitizeClientErrorMessage, normalizeIsoTimestamp } from './securityUtils';

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
      const { data, meta } = queryToolsRegistry({
        ...params,
        limit: params.limit || 9,
      });

      return {
        status: 'fallback',
        data,
        meta,
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
    return { tool: local, related: local ? getRelatedTools(local) : [] };
  },

  /**
   * Fetch the persisted aggregate community upvote count for a canonical tool.
   */
  getToolUpvotes: async (toolId: string): Promise<number> => {
    if (!getLocalToolById(toolId)) return 0;
    try {
      const statsSnap = await getDoc(doc(db, 'toolStats', toolId));
      if (statsSnap.exists()) {
        const count = statsSnap.data()?.upvotesCount;
        return typeof count === 'number' && count >= 0 ? count : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  /**
   * Check if the currently authenticated user has upvoted this tool.
   * Validates toolId against the canonical registry to prevent querying arbitrary document paths.
   */
  hasUserUpvoted: async (toolId: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !getLocalToolById(toolId)) return false;
    try {
      const voteRef = doc(db, 'toolUpvotes', `${toolId}_${user.uid}`);
      const snap = await getDoc(voteRef);
      return snap.exists();
    } catch {
      return false;
    }
  },

  /**
   * Toggle persistent upvote for a tool via atomic Firestore transaction (1 user + 1 tool = 1 vote).
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
    const statsRef = doc(db, 'toolStats', toolId);

    try {
      const result = await runTransaction(db, async (tx) => {
        const voteSnap = await tx.get(voteRef);
        const statsSnap = await tx.get(statsRef);
        const currentCount = statsSnap.exists() && typeof statsSnap.data()?.upvotesCount === 'number'
          ? Math.max(0, Math.floor(statsSnap.data().upvotesCount))
          : 0;

        if (voteSnap.exists()) {
          const nextCount = Math.max(0, currentCount - 1);
          tx.delete(voteRef);
          if (statsSnap.exists()) {
            tx.update(statsRef, {
              upvotesCount: nextCount,
              updatedAt: serverTimestamp(),
            });
          }
          return { action: 'removed' as const, upvotes: nextCount };
        } else {
          const nextCount = currentCount + 1;
          tx.set(voteRef, {
            toolId,
            userId: user.uid,
            createdAt: serverTimestamp(),
          });
          if (statsSnap.exists()) {
            tx.update(statsRef, {
              upvotesCount: nextCount,
              updatedAt: serverTimestamp(),
            });
          } else {
            tx.set(statsRef, {
              upvotesCount: 1,
              updatedAt: serverTimestamp(),
            });
          }
          return { action: 'added' as const, upvotes: nextCount };
        }
      });

      return {
        status: 'success',
        action: result.action,
        upvotes: result.upvotes,
        toolId,
        message: result.action === 'added' ? 'Upvote recorded.' : 'Upvote removed.',
      };
    } catch (err: unknown) {
      const userMessage = sanitizeClientErrorMessage(err, 'Unable to update upvote. Please try again.');
      return { status: 'error', message: userMessage };
    }
  },

  /**
   * Fetch the signed-in creator's own community tool submissions.
   */
  getUserSubmissions: async (): Promise<ToolSubmission[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'toolSubmissions'),
        where('submittedBy', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: data.id || docSnap.id,
            name: data.name,
            category: data.category,
            pricing: data.pricing,
            description: data.description,
            websiteUrl: data.websiteUrl,
            tags: Array.isArray(data.tags) ? data.tags : [],
            submittedBy: data.submittedBy,
            status: data.status || 'PENDING_REVIEW',
            createdAt: normalizeIsoTimestamp(data.createdAt),
          } as ToolSubmission;
        })
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch {
      return [];
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

    const cleanTags = Array.isArray(submission.tags)
      ? submission.tags.map(t => String(t).trim().slice(0, 50)).filter(Boolean).slice(0, 10)
      : [];

    const submissionPayload = {
      id: newId,
      name: submission.name.trim().slice(0, 80),
      category: submission.category,
      pricing: submission.pricing,
      description: submission.description.trim().slice(0, 2000),
      websiteUrl: submission.websiteUrl.trim().slice(0, 2000),
      tags: cleanTags.length > 0 ? cleanTags : [submission.category.toLowerCase()],
      submittedBy: user.uid,
      status: 'PENDING_REVIEW' as const,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(submissionRef, submissionPayload);
      return {
        success: true,
        message: `Tool "${submissionPayload.name}" submitted successfully to the moderation queue.`,
        data: submissionPayload,
      };
    } catch (err: unknown) {
      const userMessage = sanitizeClientErrorMessage(err, 'Unable to submit tool to the moderation queue. Please check your network and try again.');
      return { success: false, message: userMessage };
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
