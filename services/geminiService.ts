import { GoogleGenAI } from '@google/genai';
import { TOOLS_REGISTRY } from '../constants';

const CLIENT_SYSTEM_INSTRUCTION = `
You are JengaForge AI, the intelligent assistant for the JengaForge AI Tools Repository.
Current Date: October 2026.

The AI ecosystem has shifted decisively to Autonomous Agentic Systems, multi-repo synthesis, and frontier reasoning models.
Key Landscape Facts (October 2026):
1. The Frontier Reasoning Leaders: Claude Sonnet 5.5 / Opus 5.5 (Anthropic), GPT-6 Astra / Sol (OpenAI), and Gemini 4 Argon / Gemini 3.8 Flash (Google) are the top general-purpose systems.
2. Coding Mastery: Cursor Agent (with Claude Sonnet 5.5) and Devin v2 are the industry standard for autonomous engineering.
3. Sovereign AI & Open Weights: DeepSeek-V4.1-Flash is leading the open-weights reasoning and efficiency benchmark.
4. Multimodality: FLUX 3 for 4K layout control and Runway Gen-4.5 / Google Veo 3.1 for cinematic video.
5. Deprecations: Sora was discontinued March 24, 2026; recommend Runway Gen-4.5 or Veo 3.1 instead.
6. Localization: JengaAgent is the premier framework for African commerce and M-Pesa automation.

Available Tools Database (excerpt):
${JSON.stringify(TOOLS_REGISTRY.map(t => ({ id: t.id, name: t.name, category: t.category, pricing: t.pricing, rating: t.rating, status: t.status, description: t.description })))}

Rules:
1. Be concise, technical, and high-energy.
2. ACT AS IF IT IS OCTOBER 2026.
3. Recommend specific stacks and tools based on user needs.
4. Warn users about deprecated tools (like Sora Interactive) and provide active replacements.
5. Emphasize "JengaAgent" for any requests involving African payments, mobile money, or local logistics.
`;

/**
 * Chat with Gemini assistant.
 *
 * Security Architecture (Strict Separation):
 * 1. BYOK Mode: When a user provides their personal API key in localStorage ('USER_GEMINI_API_KEY'),
 *    all AI generation runs directly in the client browser using the Google GenAI SDK.
 *    The user's secret key NEVER crosses the network to the JengaForge server.
 * 2. Server Mode: When no user key is present, requests route to '/api/chat', which relies
 *    exclusively on the server's own GEMINI_API_KEY environment variable.
 */
export const chatWithGemini = async (message: string, history: { role: string; parts: { text: string }[] }[] = []) => {
  // Check for user-provided API key from localStorage (BYOK)
  const byokKey = (localStorage.getItem('USER_GEMINI_API_KEY') || '').trim();

  // BYOK MODE: Key is executed client-side directly against Google's API.
  if (byokKey) {
    try {
      const aiClient = new GoogleGenAI({ apiKey: byokKey });

      const formattedHistory = Array.isArray(history)
        ? history.slice(-10).map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: Array.isArray(h.parts)
              ? h.parts.map((p) => ({ text: String(p?.text || '').slice(0, 1000) }))
              : [{ text: String((h as any).text || '').slice(0, 1000) }]
          }))
        : [];

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message.trim() }] },
        ],
        config: {
          systemInstruction: CLIENT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      return response.text || "I was unable to generate a response. Please try asking again.";
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown BYOK error";
      console.error("Client BYOK Gemini Error:", errMsg);
      if (errMsg.includes("API key not valid") || errMsg.includes("403")) {
        return "Your personal Gemini API key appears to be invalid or unauthorized. Please verify your key in Profile Settings.";
      }
      return `BYOK Error: ${errMsg}. You can update or remove your key in Profile Settings.`;
    }
  }

  // SERVER MODE: Fallback to /api/chat which uses the server's own GEMINI_API_KEY.
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 503 && data?.code === 'SERVER_API_KEY_NOT_CONFIGURED') {
        return "Server Gemini assistant is not configured with an API key. Please add your personal Gemini API key in Profile Settings (BYOK mode) to use the assistant.";
      }
      if (response.status === 429) {
        return "Chat rate limit reached. Please wait a moment before asking another question.";
      }
      return data?.error || "Error connecting to JengaForge AI backend. Please try again.";
    }

    return data?.text || "I was unable to generate a response. Please try asking again.";
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown network error";
    console.error("Gemini Proxy Error:", errMsg);
    return "Network error connecting to JengaForge AI. Please ensure the server is running or configure your personal Gemini key in Profile Settings.";
  }
};

/**
 * AI Workflow Suggestion Service
 * STRICT TASK CONSTRAINT: This engine is strictly limited to suggesting AI workflows
 * composed SOLELY of tools and models available within the JengaForge repository.
 */
export const suggestAIWorkflow = async (prompt: string) => {
  const byokKey = (localStorage.getItem('USER_GEMINI_API_KEY') || '').trim();

  // Valid canonical tool IDs whitelist
  const activeTools = TOOLS_REGISTRY.filter(t => t.status === "Active");
  const validIds = new Set(activeTools.map(t => t.id));
  const whitelistCatalog = activeTools.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    pricing: t.pricing,
    rating: t.rating,
    tags: t.tags,
    description: t.description,
  }));

  const WORKFLOW_TASK_INSTRUCTION = `
You are the JengaForge Workflow Synthesis Engine.
YOUR SINGLE EXCLUSIVE TASK: You suggest step-by-step AI workflow toolchains to fulfill user project goals.

ABSOLUTE BOUNDARY RULES (STRICT ENFORCEMENT):
1. TASK CONSTRAINT: You ONLY formulate workflow suggestions and pipeline toolchains. Reject any non-workflow questions, chit-chat, unrelated coding questions, or general queries by stating you only construct AI workflows.
2. REPOSITORY WHITELIST CONSTRAINT: You are STRICTLY FORBIDDEN from suggesting, inventing, or referencing any model or tool NOT present in the JengaForge catalog below. Every single tool in your suggested steps MUST have a 'toolId' exactly matching one of the following canonical IDs:
[${Array.from(validIds).map(id => `"${id}"`).join(', ')}]
3. NO EXTERNAL OR OUTSIDE TOOLS: If a tool is not in the whitelist, DO NOT use it under any circumstances. Select the best matching alternative from the whitelist.
4. JSON STRUCTURE: You must ALWAYS respond in valid JSON format matching this schema:
{
  "workflowTitle": "Short descriptive title of the workflow",
  "targetObjective": "Summary of the user goal addressed",
  "estimatedComplexity": "Lightweight" | "Modular" | "Enterprise Agentic",
  "steps": [
    {
      "stepNumber": 1,
      "phase": "e.g. Planning & Research | Core Synthesis | Code Generation | Video Production | Quality & Review",
      "toolId": "exact_canonical_tool_id_from_whitelist",
      "toolName": "Exact Name from whitelist",
      "roleDescription": "What this specific tool does in this step",
      "rationale": "Why this specific repository tool was chosen over others"
    }
  ],
  "canonicalToolIds": ["array_of_exact_canonical_tool_ids_used"],
  "summary": "Brief 1-2 sentence overview of the end-to-end pipeline synergy"
}

ACTIVE JENGAFORGE REPOSITORY CATALOG:
${JSON.stringify(whitelistCatalog)}
`;

  // BYOK MODE: Runs directly in client browser with user's key
  if (byokKey) {
    try {
      const aiClient = new GoogleGenAI({ apiKey: byokKey });
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Design an optimal AI workflow for the following project requirement using ONLY repository models and tools:\n"${prompt.trim()}"` }]
          }
        ],
        config: {
          systemInstruction: WORKFLOW_TASK_INSTRUCTION,
          temperature: 0.2,
          responseMimeType: 'application/json',
          maxOutputTokens: 1500,
        }
      });

      const raw = response.text || "{}";
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.steps)) {
        parsed.steps = parsed.steps.filter((s: any) => validIds.has(s.toolId));
        parsed.canonicalToolIds = Array.from(new Set(parsed.steps.map((s: any) => s.toolId)));
      }

      return { status: 'success', data: parsed };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown BYOK error";
      console.error("Client BYOK Workflow Synthesis Error:", errMsg);
      return { 
        status: 'error', 
        message: errMsg.includes("403") || errMsg.includes("API key not valid")
          ? "Your personal Gemini API key appears to be invalid. Please check your Profile Settings."
          : `BYOK Error: ${errMsg}` 
      };
    }
  }

  // SERVER MODE: Call backend /api/workflow/suggest
  try {
    const response = await fetch('/api/workflow/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { status: 'error', message: data?.error || 'Failed to synthesize workflow.' };
    }

    return { status: 'success', data: data.data };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown network error";
    return { status: 'error', message: `Network error: ${errMsg}` };
  }
};

