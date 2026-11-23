import { Router, Request, Response } from "express";
import { TOOLS_REGISTRY, FEATURED_STACKS, getToolById, queryToolsRegistry, getRelatedTools } from "../../constants";
import { chatLimiter, workflowSynthesisLimiter } from "../middleware/security";
import { generateChatResponse, generateWorkflowSuggestion } from "../services/aiService";

export const apiRouter = Router();

// Health Check
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// System Info
apiRouter.get("/sysinfo", (_req: Request, res: Response) => {
  res.json({
    status: "operational",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    version: "4.1.0",
    apiVersion: "v2.0",
    totalTools: TOOLS_REGISTRY.length,
    registeredTools: TOOLS_REGISTRY.length,
    featuredStacks: FEATURED_STACKS.length,
  });
});

// Platform Ecosystem Stats
apiRouter.get("/v2/stats", (_req: Request, res: Response) => {
  const categoryBreakdown: Record<string, number> = {};
  let totalScore = 0;

  TOOLS_REGISTRY.forEach((t) => {
    categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;
    totalScore += t.rating;
  });

  const avgRating = TOOLS_REGISTRY.length > 0 ? Number((totalScore / TOOLS_REGISTRY.length).toFixed(2)) : 5.0;

  res.json({
    status: "success",
    data: {
      totalTools: TOOLS_REGISTRY.length,
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
  const parsedPage = Number.parseInt(String(req.query.page ?? "1"), 10);
  const parsedLimit = Number.parseInt(String(req.query.limit ?? "20"), 10);

  const { data, meta } = queryToolsRegistry({
    q: req.query.q as string | undefined,
    category: req.query.category as string | undefined,
    pricing: req.query.pricing as string | undefined,
    sort: req.query.sort as string | undefined,
    page: parsedPage,
    limit: parsedLimit,
  });

  res.json({
    status: "success",
    data,
    meta,
  });
};

apiRouter.get("/v2/tools", getToolsHandler);
apiRouter.get("/tools", getToolsHandler);

// Single Tool Query Handler
const getToolByIdHandler = (req: Request, res: Response) => {
  const toolId = String(req.params.id);
  const tool = getToolById(toolId);
  if (!tool) {
    res.status(404).json({ error: `Tool with id '${toolId}' not found.` });
    return;
  }

  res.json({ status: "success", data: tool, related: getRelatedTools(tool) });
};

apiRouter.get("/v2/tools/:id", getToolByIdHandler);
apiRouter.get("/tools/:id", getToolByIdHandler);

// Featured Stacks Handler
const getStacksHandler = (_req: Request, res: Response) => {
  res.json({
    status: "success",
    data: FEATURED_STACKS,
    meta: { total: FEATURED_STACKS.length }
  });
};

apiRouter.get("/v2/stacks/featured", getStacksHandler);
apiRouter.get("/stacks/featured", getStacksHandler);
apiRouter.get("/stacks", getStacksHandler);

function handleAiRouteError(
  res: Response,
  err: unknown,
  routeLabel: string,
  unconfiguredMessage: string,
  fallbackMessage: string
) {
  const errMsg = err instanceof Error ? err.message : String(err);
  if (errMsg === "SERVER_API_KEY_NOT_CONFIGURED") {
    res.status(503).json({
      error: unconfiguredMessage,
      code: "SERVER_API_KEY_NOT_CONFIGURED",
    });
    return;
  }

  if (errMsg.includes("API key not valid") || errMsg.includes("403")) {
    res.status(403).json({
      error: "The configured server Gemini API key is invalid or unauthorized.",
      code: "INVALID_API_KEY",
    });
    return;
  }

  console.error(`${routeLabel}:`, errMsg);
  res.status(500).json({ error: fallbackMessage });
}

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
    } catch (err: unknown) {
      handleAiRouteError(
        res,
        err,
        "Gemini Chat Route Error",
        "Gemini API key is not configured on the server. Set GEMINI_API_KEY in Secrets or your server environment.",
        "Failed to generate AI response. Please try again later."
      );
    }
  } catch (error: unknown) {
    console.error("Unhandled Chat Controller Error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to process chat request." });
  }
});

// Workflow Synthesis Route - strictly limited to suggesting workflows using repository tools
apiRouter.post("/workflow/suggest", workflowSynthesisLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Workflow goal prompt is required and must be non-empty text." });
      return;
    }

    if (prompt.length > 1000) {
      res.status(400).json({ error: "Prompt is too long. Maximum allowed length is 1000 characters." });
      return;
    }

    try {
      const suggestion = await generateWorkflowSuggestion(prompt);
      res.json({ status: "success", data: suggestion });
    } catch (err: unknown) {
      handleAiRouteError(
        res,
        err,
        "Workflow Suggest Route Error",
        "Gemini workflow service is not configured on the server. Set GEMINI_API_KEY in Secrets or your server environment.",
        "Failed to synthesize workflow suggestion. Please try again."
      );
    }
  } catch (error: unknown) {
    console.error("Unhandled Workflow Controller Error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to process workflow synthesis request." });
  }
});
