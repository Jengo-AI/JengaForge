import { Tool, ToolSubmission, PlatformStats, ToolsApiResponse } from '../types';
import { TOOLS_REGISTRY, getToolById as getLocalToolById } from '../constants';

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
   * Toggle upvote for a tool on the backend
   */
  upvoteTool: async (toolId: string): Promise<UpvoteResult> => {
    try {
      const response = await fetch(`/api/v2/tools/${encodeURIComponent(toolId)}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        return {
          status: 'success',
          action: data.action,
          upvotes: data.upvotes,
          toolId: data.toolId,
          message: data.message,
        };
      }
      return { status: 'error', message: data.error || 'Failed to register upvote' };
    } catch (err: any) {
      return { status: 'error', message: err?.message || 'Network error' };
    }
  },

  /**
   * Submit a new tool to the community directory
   */
  submitTool: async (submission: ToolSubmission): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await fetch('/api/v2/tools/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        return { success: true, message: data.message, data: data.data };
      }
      return { success: false, message: data.error || 'Submission failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error submitting tool' };
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
