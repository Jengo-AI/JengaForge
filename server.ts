import express, { Request, Response, NextFunction } from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { TOOLS_REGISTRY, FEATURED_STACKS } from "./constants";
import { isAllowedOrigin } from "./services/securityUtils";

/**
 * Dynamically synthesizes the system prompt from the active TOOLS_REGISTRY and FEATURED_STACKS,
 * ensuring no out-of-sync or hard-coded assumptions drift between server and app catalog.
 */
function buildSystemInstruction(): string {
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
- Catalog Size: ${TOOLS_REGISTRY.length} curated tools across categories: ${categories.join(', ')}.
- Active Verified Tools: ${activeTools.length}
- Deprecated/Archived Tools: ${deprecatedTools.map(t => `${t.name} (${t.deprecatedReason || 'superseded'})`).join('; ')}
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Deliberately configure trust proxy:
  // - If TRUST_PROXY is explicitly specified (e.g. "loopback", "1", "true", or a hop count), use it.
  // - In production or containerized environments (Cloud Run/K8s), default to 1 trusted reverse proxy hop.
  // - In local development without proxies, disable it (false) to prevent header spoofing.
  const rawTrustProxy = process.env.TRUST_PROXY;
  if (rawTrustProxy !== undefined) {
    const parsedNumber = Number(rawTrustProxy);
    app.set("trust proxy", isNaN(parsedNumber) ? rawTrustProxy : parsedNumber);
  } else if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  } else {
    app.set("trust proxy", false);
  }

  // Apply Security Headers. We disable contentSecurityPolicy in dev to allow Vite HMR.
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }));
  
  // Enable CORS with strict, explicit origin allowlist
  app.use(cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        // Disallow cross-origin requests cleanly without throwing an unhandled route error
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  }));
  
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

  // Live tool registry (initialized from canonical TOOLS_REGISTRY)
  const liveTools = JSON.parse(JSON.stringify(TOOLS_REGISTRY));
  
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
        lastUpdated: "2026-10-01T00:00:00.000Z",
        ecosystemEra: "October 2026",
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
    const toolId = String(req.params.id);
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
  // Security Architecture: Client BYOK keys never cross this server.
  // When a user provides their personal Gemini API key, it executes browser-side via the SDK.
  // This proxy only operates with the server's own GEMINI_API_KEY environment variable.
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

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(503).json({
          error: "Server-side Gemini assistant is not configured with an API key. Please use client-side BYOK mode by adding your Gemini API key in Profile Settings.",
          code: "SERVER_API_KEY_NOT_CONFIGURED",
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
          systemInstruction: buildSystemInstruction(),
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

