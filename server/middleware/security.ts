import { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import hpp from "hpp";
import express from "express";
import path from "path";
import { isIP } from "node:net";
import { isAllowedOrigin } from "../../services/securityUtils";

export function parseForwardedForIp(forwardedHeader: string | string[] | undefined): string | null {
  const raw = Array.isArray(forwardedHeader) ? forwardedHeader[0] : forwardedHeader;
  if (!raw || typeof raw !== "string") return null;

  const segments = raw.split(",");
  for (let i = segments.length - 1; i >= 0; i--) {
    const match = segments[i].match(/(?:^|;)\s*for=(?:"([^"]+)"|([^;\s]+))/i);
    let candidate = (match?.[1] || match?.[2] || "").trim();
    if (!candidate || candidate.toLowerCase() === "unknown" || candidate.startsWith("_")) {
      continue;
    }

    if (candidate.startsWith("[")) {
      const closingBracket = candidate.indexOf("]");
      if (closingBracket !== -1) {
        candidate = candidate.slice(1, closingBracket);
      }
    } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
      candidate = candidate.slice(0, candidate.lastIndexOf(":"));
    }

    if (isIP(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function getRateLimitClientIp(req: Request): string {
  const trustProxyEnabled = req.app?.get("trust proxy") !== false;
  const socketIp = req.socket?.remoteAddress || "127.0.0.1";
  const expressIp = req.ip;

  if (trustProxyEnabled) {
    if (expressIp && expressIp !== socketIp && isIP(expressIp)) {
      return expressIp;
    }
    const forwardedIp = parseForwardedForIp(req.headers?.forwarded);
    if (forwardedIp) {
      return forwardedIp;
    }
  }

  return expressIp && isIP(expressIp) ? expressIp : socketIp;
}

export function configureSecurity(app: Express) {
  // Configure trust proxy safely for Cloud Run / reverse-proxy deployments (dev preview & production):
  // - If TRUST_PROXY is explicitly set ("false", hop count like "1", or subnet name like "loopback"), honor it.
  // - Never set boolean `true` directly (avoid permissive bypass); map "true" to 1 hop.
  // - Default to 1 reverse proxy hop so X-Forwarded-For / Forwarded headers from Cloud Run are handled cleanly.
  const rawTrustProxy = process.env.TRUST_PROXY;
  if (rawTrustProxy !== undefined) {
    if (rawTrustProxy === "false") {
      app.set("trust proxy", false);
    } else if (rawTrustProxy === "true") {
      app.set("trust proxy", 1);
    } else {
      const parsedNumber = Number(rawTrustProxy);
      app.set("trust proxy", Number.isFinite(parsedNumber) ? parsedNumber : rawTrustProxy);
    }
  } else {
    app.set("trust proxy", 1);
  }

  // Security Headers
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: process.env.NODE_ENV === "production"
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://www.google.com/recaptcha/",
              "https://www.gstatic.com/recaptcha/",
              "https://apis.google.com",
            ],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: [
              "'self'",
              "https://*.googleapis.com",
              "https://*.firebaseio.com",
              "https://*.firebaseapp.com",
              "https://*.gstatic.com",
              "https://www.google.com/recaptcha/",
              "wss://*.firebaseio.com",
            ],
            frameSrc: [
              "'self'",
              "https://*.firebaseapp.com",
              "https://accounts.google.com",
              "https://www.google.com/recaptcha/",
            ],
            workerSrc: ["'self'", "blob:"],
          },
        }
      : false,
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
  keyGenerator: (req: Request) => ipKeyGenerator(getRateLimitClientIp(req)),
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});

export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => ipKeyGenerator(getRateLimitClientIp(req)),
  message: { error: "Chat rate limit exceeded. Please wait a moment before sending another message." }
});

export const workflowSynthesisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 workflow generations per minute per IP to prevent Gemini cost amplification & abuse
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => ipKeyGenerator(getRateLimitClientIp(req)),
  message: { error: "AI workflow synthesis rate limit reached. Please wait a moment before synthesizing another workflow." }
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
