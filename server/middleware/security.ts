import { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import express from "express";
import path from "path";
import { isAllowedOrigin } from "../../services/securityUtils";

export function configureSecurity(app: Express) {
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

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }));

  // Strict CORS policy
  app.use(cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  }));

  // Strict payload limits
  app.use(express.json({ limit: "50kb" }));
  app.use(express.urlencoded({ extended: true, limit: "50kb" }));
  app.use(hpp());

  // Static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});

export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: "Chat rate limit exceeded. Please wait a moment before sending another message." }
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    });
  }
  next();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Unhandled Server Error:", err?.message || "Unknown error");
  res.status(500).json({ error: "Internal Server Error" });
}
