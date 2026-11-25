import express from "express";
import { configureSecurity, apiLimiter, requestLogger, errorHandler } from "../server/middleware/security.js";
import { apiRouter } from "../server/routes/apiRoutes.js";

const app = express();
const origin = "http://jengaforge.invalid";
const routeKey = "__jf_route";

// Vercel may pass the original path or the rewritten function URL.
app.use((req, res, next) => {
  const url = new URL(req.url, origin);
  if (url.origin !== origin) {
    res.status(400).json({ error: "Invalid API request." });
    return;
  }

  if (url.pathname === "/api/index") {
    const segments = url.searchParams.get(routeKey)?.split("/") ?? [];
    if (segments.length && segments.every((part) => part && part !== "." && part !== "..")) {
      url.pathname = "/api/" + segments.map(encodeURIComponent).join("/");
    }
  }
  url.searchParams.delete(routeKey);
  req.url = url.pathname + url.search;
  next();
});

configureSecurity(app);
app.use(requestLogger);
app.use("/api", apiLimiter, apiRouter);
app.use((_req, res) => {
  res.status(404).json({ error: "API route not found." });
});
app.use(errorHandler);

export default app;
