import { GoogleGenAI } from "@google/genai";
import { TOOLS_REGISTRY, FEATURED_STACKS } from "../../constants";

/**
 * Dynamically synthesizes the system prompt from the active TOOLS_REGISTRY and FEATURED_STACKS.
 * The AI assistant consumes the current registry directly as the source of truth rather than
 * relying on static hard-coded assertions.
 */
export function buildSystemInstruction(): string {
  const activeTools = TOOLS_REGISTRY.filter(t => t.status === "Active");
  const deprecatedTools = TOOLS_REGISTRY.filter(t => t.status === "Deprecated");
  const categories = Array.from(new Set(TOOLS_REGISTRY.map(t => t.category)));

  const serializedRegistry = JSON.stringify(
    TOOLS_REGISTRY.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      pricing: t.pricing,
      rating: t.rating,
      status: t.status,
      description: t.description,
      tags: t.tags,
      lastVerified: t.lastVerified,
    }))
  );

  return `
You are JengaForge AI, the intelligent assistant for the JengaForge AI Tools Repository.
You represent the Bunifu Suite "Jengo" architectural ethos: direct, technical, and high-energy.

Live Registry Overview:
- Curated Tools Total: ${TOOLS_REGISTRY.length} tools across categories: ${categories.join(', ')}.
- Active Verified Tools: ${activeTools.length}
- Deprecated Tools: ${deprecatedTools.map(t => `${t.name} (${t.deprecatedReason || 'superseded'})`).join('; ')}
- Featured Stacks Available: ${FEATURED_STACKS.map(s => `"${s.name}" (${s.tools.join(', ')})`).join(' | ')}

Structured Registry Database:
${serializedRegistry}

Core Operating Rules:
1. Ground all recommendations strictly in the structured tools catalog provided above.
2. When a user asks about deprecated tools, advise them of their deprecated status and immediately recommend modern, active alternatives from the catalog.
3. Recommend specific stacks, pairings, and workflows based on user use-cases.
4. Keep answers concise, actionable, and free of vague hype.
`;
}

/**
 * System instruction strictly constraining the AI to ONLY suggest AI workflows
 * using ONLY models and tools from the JengaForge repository.
 */
export function buildWorkflowSystemInstruction(): string {
  const activeTools = TOOLS_REGISTRY.filter(t => t.status === "Active");
  const toolWhitelist = activeTools.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    pricing: t.pricing,
    rating: t.rating,
    tags: t.tags,
    description: t.description,
  }));

  const validToolIds = activeTools.map(t => t.id);

  return `
You are the JengaForge Workflow Synthesis Engine.
YOUR SINGLE EXCLUSIVE TASK: You suggest step-by-step AI workflow toolchains to fulfill user project goals.

ABSOLUTE BOUNDARY RULES (STRICT ENFORCEMENT):
1. TASK CONSTRAINT: You ONLY formulate workflow suggestions and pipeline toolchains. Reject any non-workflow questions, chit-chat, unrelated coding questions, or general queries by stating you only construct AI workflows.
2. REPOSITORY WHITELIST CONSTRAINT: You are STRICTLY FORBIDDEN from suggesting, inventing, or referencing any model or tool NOT present in the JengaForge catalog below. Every single tool in your suggested steps MUST have a 'toolId' exactly matching one of the following canonical IDs:
[${validToolIds.map(id => `"${id}"`).join(', ')}]
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
${JSON.stringify(toolWhitelist)}
`;
}

export async function generateWorkflowSuggestion(userPrompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("SERVER_API_KEY_NOT_CONFIGURED");
  }

  const aiClient = new GoogleGenAI({ apiKey });

  const response = await aiClient.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      { 
        role: "user", 
        parts: [{ 
          text: `Design an optimal AI workflow for the following project requirement using ONLY repository models and tools:\n"${userPrompt.trim()}"` 
        }] 
      }
    ],
    config: {
      systemInstruction: buildWorkflowSystemInstruction(),
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 1500,
    },
  });

  const rawText = response.text || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Fallback if markdown fence was included
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  // Double check canonical enforcement: filter canonicalToolIds against actual registry
  const validIds = new Set(TOOLS_REGISTRY.map(t => t.id));
  if (Array.isArray(parsed.steps)) {
    parsed.steps = parsed.steps.filter((s: any) => validIds.has(s.toolId));
    parsed.canonicalToolIds = Array.from(new Set(parsed.steps.map((s: any) => s.toolId)));
  }

  return parsed;
}

export async function generateChatResponse(message: string, history: any[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("SERVER_API_KEY_NOT_CONFIGURED");
  }

  const aiClient = new GoogleGenAI({ apiKey });

  const formattedHistory = Array.isArray(history)
    ? history.slice(-10).map((h: any) => ({
        role: h.role === "model" ? "model" : "user",
        parts: Array.isArray(h.parts)
          ? h.parts.map((p: any) => ({ text: String(p?.text || "").slice(0, 1000) }))
          : [{ text: String(h.text || "").slice(0, 1000) }]
      }))
    : [];

  const response = await aiClient.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      ...formattedHistory,
      { role: "user", parts: [{ text: message.trim() }] },
    ],
    config: {
      systemInstruction: buildSystemInstruction(),
      temperature: 0.7,
    },
  });

  return response.text || "I was unable to generate a response. Please try asking again.";
}
