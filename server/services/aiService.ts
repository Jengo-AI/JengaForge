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
    model: "gemini-2.5-flash",
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
