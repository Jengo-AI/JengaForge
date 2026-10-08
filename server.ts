import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { configureSecurity, apiLimiter, requestLogger, errorHandler } from "./server/middleware/security";
import { apiRouter } from "./server/routes/apiRoutes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Configure security headers, CORS, body parsers, trust proxy, and static assets
  configureSecurity(app);

  // 2. Request Telemetry & Observability Logging
  app.use(requestLogger);

  // 3. API Rate Limiting & Routes
  app.use("/api", apiLimiter);
  app.use("/api", apiRouter);

  // 4. Vite middleware for development / Static bundle serving for production
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

  // 5. Global Error Handling Middleware to prevent leaking stack traces
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JengaForge] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
