import { Router, Request, Response } from "express";
import { TOOLS_REGISTRY, FEATURED_STACKS } from "../../constants";
import { chatLimiter } from "../middleware/security";
import { generateChatResponse } from "../services/aiService";

export const apiRouter = Router();

// Live tool registry copy
const liveTools = JSON.parse(JSON.stringify(TOOLS_REGISTRY));

// Health Check
apiRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// System Info
apiRouter.get("/sysinfo", (req: Request, res: Response) => {
  res.json({
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    version: "3.3.0",
    apiVersion: "v2.0",
    registeredTools: liveTools.length,
    featuredStacks: FEATURED_STACKS.length,
  });
});

// Platform Ecosystem Stats
apiRouter.get("/v2/stats", (req: Request, res: Response) => {
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
      lastUpdated: new Date().toISOString(),
    }
  });
});

// Tools Query Handler
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

apiRouter.get("/v2/tools", getToolsHandler);
apiRouter.get("/tools", getToolsHandler);

// Single Tool Query Handler
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

apiRouter.get("/v2/tools/:id", getToolByIdHandler);
apiRouter.get("/tools/:id", getToolByIdHandler);

// Featured Stacks Handler
const getStacksHandler = (req: Request, res: Response) => {
  res.json({
    status: "success",
    data: FEATURED_STACKS,
    meta: { total: FEATURED_STACKS.length }
  });
};

apiRouter.get("/v2/stacks/featured", getStacksHandler);
apiRouter.get("/stacks/featured", getStacksHandler);
apiRouter.get("/stacks", getStacksHandler);

// Chat AI Route
apiRouter.post("/chat", chatLimiter, async (req: Request, res: Response) => {
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

    try {
      const text = await generateChatResponse(message, history);
      res.json({ status: "success", text });
    } catch (err: any) {
      if (err.message === "SERVER_API_KEY_NOT_CONFIGURED") {
        res.status(503).json({
          error: "Server-side Gemini assistant is not configured with an API key. Please use client-side BYOK mode by adding your Gemini API key in Profile Settings.",
          code: "SERVER_API_KEY_NOT_CONFIGURED",
        });
        return;
      }

      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("API key not valid") || errMsg.includes("403")) {
        res.status(403).json({
          error: "The provided Gemini API key is invalid or unauthorized. Please check your Profile Settings.",
          code: "INVALID_API_KEY",
        });
        return;
      }

      console.error("Gemini Chat Route Error:", errMsg);
      res.status(500).json({
        error: "Failed to generate AI response. Please try again later.",
      });
    }
  } catch (error: any) {
    console.error("Unhandled Chat Controller Error:", error?.message || error);
    res.status(500).json({ error: "Failed to process chat request." });
  }
});
