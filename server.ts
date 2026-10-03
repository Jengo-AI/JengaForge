import express, { Request, Response, NextFunction } from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { TOOLS_REGISTRY, FEATURED_STACKS } from "./constants";

const SYSTEM_INSTRUCTION = `
You are JengaForge AI, the intelligent assistant for the JengaForge AI Tools Repository.
Current Date: April 20, 2026.

The AI ecosystem has shifted from "Chatbots" to "Agentic Systems" (models that use computers/tools).
Key Landscape Facts (April 2026):
1. The "Frontier" Leaders: Gemini 3.1 Pro (Google), ChatGPT 5.4 (OpenAI), Claude 4.7 Opus (Anthropic), and Grok 4.3 (xAI) are the top general-purpose systems.
2. Coding Mastery: Cursor Agent and Claude 4.7 Sonnet (Computer Use 4.0) are the industry standard for development.
3. Sovereign AI: DeepSeek-V4 (China) is leading the open-weights efficiency race.
4. Multimodality: Flux.2 Pro for images and Runway Gen-4 for video are the pro choices.
5. Localization: JengaAgent v2.0 is the premier choice for African commerce and M-Pesa automation.

Available Tools Database (excerpt):
${JSON.stringify(TOOLS_REGISTRY.map(t => ({ id: t.id, name: t.name, category: t.category, pricing: t.pricing, rating: t.rating, description: t.description })))}

Rules:
1. Be concise, technical, and high-energy.
2. ACT AS IF IT IS APRIL 20, 2026.
3. Recommend specific stacks and tools based on user needs.
4. Emphasize "JengaAgent" for any requests involving African payments, mobile money, or local logistics.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy headers (e.g. Cloud Run / Nginx) so client IP and rate-limiting function correctly
  app.set("trust proxy", 1);

  // Apply Security Headers. We disable contentSecurityPolicy in dev to allow Vite HMR.
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }));
  
  // Enable CORS with secure defaults
  app.use(cors());
  
  // Parse JSON payloads with a strict size limit to prevent Denial of Service (DoS) attacks
  app.use(express.json({ limit: "50kb" }));

  // Parse URL-encoded bodies and prevent HTTP Parameter Pollution (HPP)
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));
  app.use(hpp());

  // Serve static assets from public folder (favicons, OpenGraph social cards, badges)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // General API Rate Limiting to prevent brute-force and DDoS
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  });

  // Dedicated Chat API Rate Limiter
  const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: "Chat rate limit exceeded. Please wait a moment before sending another message." }
  });

  // Dedicated Upvote Rate Limiter
  const upvoteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: "Too many upvotes submitted. Please pause before voting again." }
  });

  // Dedicated Submission Rate Limiter
  const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: "Submission limit reached. Please wait before submitting more tools." }
  });

  // Request Telemetry & Observability Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
      });
    }
    next();
  });

  app.use("/api/", apiLimiter);

  // Live mutable tool registry (initialized from TOOLS_REGISTRY)
  const liveTools = JSON.parse(JSON.stringify(TOOLS_REGISTRY));
  const toolSubmissions: Array<{
    id: string;
    name: string;
    category: string;
    pricing: string;
    description: string;
    websiteUrl: string;
    tags: string[];
    submittedBy?: string;
    createdAt: string;
    status: "PENDING_REVIEW" | "APPROVED";
  }> = [];

  // IP/Client upvote tracker to prevent repeated double-voting
  const upvotedMap = new Map<string, Set<string>>();
  
  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  });

  // System info endpoint
  app.get("/api/sysinfo", (req: Request, res: Response) => {
    res.json({
      environment: process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime()),
      version: "3.2.0",
      apiVersion: "v2.0",
      registeredTools: liveTools.length,
      featuredStacks: FEATURED_STACKS.length,
      totalSubmissions: toolSubmissions.length,
    });
  });

  // Platform Ecosystem Stats
  app.get("/api/v2/stats", (req: Request, res: Response) => {
    const categoryBreakdown: Record<string, number> = {};
    let totalScore = 0;

    liveTools.forEach((t: any) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;
      totalScore += t.rating;
    });

    const avgRating = liveTools.length > 0 ? Number((totalScore / liveTools.length).toFixed(2)) : 5.0;

    res.json({
      status: "success",
      data: {
        totalTools: liveTools.length,
        totalCategories: Object.keys(categoryBreakdown).length,
        categoryBreakdown,
        avgRating,
        totalStacks: FEATURED_STACKS.length,
        uptime: Math.floor(process.uptime()),
        lastUpdated: "2026-04-20T00:00:00.000Z",
        ecosystemEra: "April 2026",
      }
    });
  });

  // Tools REST API (v2 and alias)
  const getToolsHandler = (req: Request, res: Response) => {
    const q = (req.query.q as string || "").toLowerCase().trim();
    const category = (req.query.category as string || "").trim();
    const pricing = (req.query.pricing as string || "").trim();
    const sort = (req.query.sort as string || "relevance").toLowerCase().trim();
    const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || "20", 10)));

    let filtered = liveTools.filter((tool: any) => {
      const matchQuery = !q || tool.name.toLowerCase().includes(q) || 
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag: string) => tag.toLowerCase().includes(q));
      const matchCategory = !category || category === "All" || tool.category.toLowerCase() === category.toLowerCase();
      const matchPricing = !pricing || pricing === "All" || tool.pricing.toLowerCase() === pricing.toLowerCase();
      return matchQuery && matchCategory && matchPricing;
    });

    if (sort === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sort === "reviews") {
      filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
    } else if (sort === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      status: "success",
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  };

  app.get("/api/v2/tools", getToolsHandler);
  app.get("/api/tools", getToolsHandler);

  // Single Tool API
  const getToolByIdHandler = (req: Request, res: Response) => {
    const toolId = req.params.id;
    const tool = liveTools.find((t: any) => t.id === toolId);
    if (!tool) {
      res.status(404).json({ error: `Tool with id '${toolId}' not found.` });
      return;
    }

    const related = liveTools
      .filter((t: any) => t.id !== tool.id && (t.category === tool.category || t.tags.some((tag: string) => tool.tags.includes(tag))))
      .slice(0, 5);

    res.json({ status: "success", data: tool, related });
  };

  app.get("/api/v2/tools/:id", getToolByIdHandler);
  app.get("/api/tools/:id", getToolByIdHandler);

  // Tool Upvote API
  app.post("/api/v2/tools/:id/upvote", upvoteLimiter, (req: Request, res: Response) => {
    const toolId = req.params.id;
    const tool = liveTools.find((t: any) => t.id === toolId);

    if (!tool) {
      res.status(404).json({ error: `Tool with id '${toolId}' not found.` });
      return;
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const clientKey = String(clientIp);

    if (!upvotedMap.has(toolId)) {
      upvotedMap.set(toolId, new Set<string>());
    }

    const voters = upvotedMap.get(toolId)!;
    const alreadyVoted = voters.has(clientKey);

    if (alreadyVoted) {
      voters.delete(clientKey);
      tool.reviews = Math.max(0, tool.reviews - 1);
      res.json({
        status: "success",
        action: "removed",
        upvotes: tool.reviews,
        toolId,
        message: `Upvote removed for ${tool.name}.`,
      });
      return;
    } else {
      voters.add(clientKey);
      tool.reviews += 1;
      res.json({
        status: "success",
        action: "added",
        upvotes: tool.reviews,
        toolId,
        message: `Upvote recorded for ${tool.name}.`,
      });
      return;
    }
  });

  // Tool Submission API
  app.post("/api/v2/tools/submit", submitLimiter, (req: Request, res: Response) => {
    try {
      const { name, category, pricing, description, websiteUrl, tags, submittedBy } = req.body;

      if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
        res.status(400).json({ error: "Tool name is required (2-80 characters)." });
        return;
      }

      if (!category || typeof category !== "string") {
        res.status(400).json({ error: "Tool category is required." });
        return;
      }

      if (!description || typeof description !== "string" || description.trim().length < 10) {
        res.status(400).json({ error: "Tool description must be at least 10 characters." });
        return;
      }

      if (!websiteUrl || typeof websiteUrl !== "string" || !websiteUrl.startsWith("http")) {
        res.status(400).json({ error: "A valid website URL starting with http:// or https:// is required." });
        return;
      }

      const validPricing = ["Free", "Freemium", "Paid", "Enterprise"].includes(pricing) ? pricing : "Freemium";
      const sanitizedTags = Array.isArray(tags) 
        ? tags.map(t => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8)
        : ["ai", category.toLowerCase()];

      const newId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const submission = {
        id: newId,
        name: name.trim(),
        category: category.trim(),
        pricing: validPricing,
        description: description.trim(),
        websiteUrl: websiteUrl.trim(),
        tags: sanitizedTags,
        submittedBy: submittedBy ? String(submittedBy).slice(0, 100) : "Anonymous Creator",
        createdAt: new Date().toISOString(),
        status: "APPROVED" as const,
      };

      toolSubmissions.push(submission);

      // Auto-register in liveTools so creator can see their tool immediately
      const existingIdx = liveTools.findIndex((t: any) => t.id === newId);
      if (existingIdx === -1) {
        liveTools.unshift({
          id: newId,
          name: submission.name,
          category: submission.category,
          pricing: submission.pricing,
          rating: 5.0,
          reviews: 1,
          tags: submission.tags,
          websiteUrl: submission.websiteUrl,
          description: submission.description,
          specs: {
            easeOfUse: 85,
            power: 80,
            community: 70,
            costEfficiency: 85,
            integration: 75,
          }
        });
      }

      res.status(201).json({
        status: "success",
        message: `Tool "${submission.name}" submitted and published to directory.`,
        data: submission,
      });
    } catch (err: any) {
      console.error("Tool submission error:", err?.message || err);
      res.status(500).json({ error: "Failed to process tool submission." });
    }
  });

  // Featured Stacks REST API
  const getStacksHandler = (req: Request, res: Response) => {
    res.json({
      status: "success",
      data: FEATURED_STACKS,
      meta: { total: FEATURED_STACKS.length }
    });
  };

  app.get("/api/v2/stacks/featured", getStacksHandler);
  app.get("/api/stacks/featured", getStacksHandler);
  app.get("/api/stacks", getStacksHandler);

  // Server-Side Gemini AI Chat Route
  app.post("/api/chat", chatLimiter, async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "Message is required and must be non-empty text." });
        return;
      }

      if (message.length > 2000) {
        res.status(400).json({ error: "Message is too long. Maximum allowed length is 2000 characters." });
        return;
      }

      // Resolve API key: Check custom BYOK header first, fallback to server environment
      const customKey = (req.headers["x-gemini-api-key"] as string || "").trim();
      const apiKey = customKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(401).json({
          error: "No Gemini API key available. Please provide your personal API key in Profile Settings (BYOK).",
          code: "MISSING_API_KEY",
        });
        return;
      }

      const aiClient = new GoogleGenAI({ apiKey });

      // Format previous message parts safely
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
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I was unable to generate a response. Please try asking again.";
      res.json({ status: "success", text: responseText });
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Server-side Gemini Chat Error:", errMsg);

      if (errMsg.includes("API key not valid") || errMsg.includes("403")) {
        res.status(403).json({
          error: "The provided Gemini API key is invalid or unauthorized. Please check your Profile Settings.",
          code: "INVALID_API_KEY",
        });
        return;
      }

      res.status(500).json({
        error: "Failed to generate AI response. Please try again later.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handling Middleware to prevent leaking stack traces
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err?.message || "Unknown error");
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

