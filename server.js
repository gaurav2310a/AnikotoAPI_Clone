/*
 * ======= • ======= • ======= • ======= • =======• =======
 * AniKotoAPI — server.js
 * Repository: https://github.com/gaurav2310a/AnikotoAPI_Clone
 *
 * @description
 *   Main entry point for the AniKotoAPI Express server.
 *   Configures CORS, middleware, static files, API routes,
 *   and 404 handling. Exposes the Express server through the
 *   Cloudflare Workers HTTP server adapter.
 *
 * @author  Gaurav
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import crypto from "crypto";
import { httpServerHandler } from "cloudflare:node";
import { createApiRoutes } from "./src/routes/apiRoutes.js";
import { addCreatorInfo } from "./src/middleware/creatorInfo.js";

dotenv.config();

// ══════════════════════════════════════════════════════════════
// SERVER CONFIGURATION
// ══════════════════════════════════════════════════════════════

const app = express();
const PORT = Number(process.env.PORT) || 4444;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");

// ---- FEATURE: Response compression ----
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// ---- FEATURE: Request body size limits ----
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ══════════════════════════════════════════════════════════════
// REQUEST ID TRACKING
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Unique request ID for debugging ----
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// ══════════════════════════════════════════════════════════════
// CORS MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// NOTE: Single unified CORS middleware — handles all origin validation
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!allowedOrigins || allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// ---- FEATURE: Security headers ----
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  next();
});

// ══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Standardized JSON response wrapper ----
/**
 * Wraps data in a standardized success JSON response.
 *
 * @param {object} res - Express response object
 * @param {*} data - The data to return in the response
 * @param {number} status - HTTP status code (default: 200)
 */
const jsonResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, results: data });

// ---- FEATURE: Standardized error response wrapper ----
/**
 * Returns a standardized error JSON response.
 *
 * @param {object} res - Express response object
 * @param {string} message - Error message to return (default: "Internal server error")
 * @param {number} status - HTTP status code (default: 500)
 */
const jsonError = (res, message = "Internal server error", status = 500) =>
  res.status(status).json({ success: false, message });

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Rate limiting (configurable, default 100 requests per minute per IP) ----
const requestCounts = new Map();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT) || 100;
const RATE_WINDOW = parseInt(process.env.RATE_WINDOW) || 60000;

// Cloudflare Workers do not allow timers during module initialization.
// Stale entries are pruned lazily when a request arrives instead.
app.use((req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();

  // Lazy cleanup: remove expired timestamps for the current IP.
  const existing = requestCounts.get(ip);
  if (existing) {
    const valid = existing.filter(t => now - t < RATE_WINDOW);
    if (valid.length === 0) requestCounts.delete(ip);
    else requestCounts.set(ip, valid);
  }

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  const timestamps = requestCounts.get(ip).filter(t => now - t < RATE_WINDOW);
  requestCounts.set(ip, timestamps);
  if (timestamps.length >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Try again later.",
      retryAfter: Math.ceil((timestamps[0] + RATE_WINDOW - now) / 1000)
    });
  }
  timestamps.push(now);
  res.setHeader("X-RateLimit-Limit", RATE_LIMIT);
  res.setHeader("X-RateLimit-Remaining", RATE_LIMIT - timestamps.length);
  next();
});

// ---- FEATURE: Creator info middleware (injects attribution into all responses) ----
app.use(addCreatorInfo);

// ---- FEATURE: Request timeout middleware (30 seconds) ----
app.use((req, res, next) => {
  const timeout = parseInt(process.env.REQUEST_TIMEOUT) || 30000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: "Request timeout" });
    }
  });
  next();
});

createApiRoutes(app, jsonResponse, jsonError);

// ══════════════════════════════════════════════════════════════
// 404 HANDLER
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Global error handler ----
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.id} ${err.message}`, err.stack);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: "Request entity too large" });
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Internal server error" : err.message
  });
});

// ---- FEATURE: Catch-all 404 handler for undefined routes ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    availableEndpoints: [
      "/api/", "/api/search", "/api/search/suggest", "/api/info", "/api/watch",
      "/api/episodes/:id", "/api/episodes-ajax/:id", "/api/stream", "/api/servers",
      "/api/mapper-servers", "/api/download", "/api/stream/resolve",
      "/api/stream/qualities", "/api/stream/proxy", "/api/stream/ts-proxy",
      "/api/spotlight", "/api/trending", "/api/top-ten", "/api/suggestions",
      "/api/random", "/api/most-popular", "/api/upcoming", "/api/top-rankings",
      "/api/recently-updated", "/api/completed", "/api/new-release",
      "/api/newly-added", "/api/latest-updated", "/api/trending-sidebar",
      "/api/seasons/:id", "/api/watch-order/:id", "/api/az-list/:letter",
      "/api/filter", "/api/genre/:genre", "/api/type/:type", "/api/status/:status",
      "/api/schedule", "/api/health", "/api/stats", "/api/cache/stats",
      "/api/mirrors", "/api/openapi", "/api/proxy/status"
    ]
  });
});

// ══════════════════════════════════════════════════════════════
// SERVER START
// ══════════════════════════════════════════════════════════════

const server = app.listen(PORT, () => {
  console.info(`AniKotoAPI listening at ${PORT}`);
});

// Cloudflare Workers adapter. The port is a routing key inside Workers,
// not a public network port.
export default httpServerHandler({ port: PORT });
