import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import "./load-env.mjs";
import {
  bearerToken,
  createSession,
  isSessionValid,
  revokeSession,
  verifyAdminCredentials,
} from "./auth.mjs";
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "./persistence.mjs";
import { validateApplication } from "./validate.mjs";
import { notifyMail } from "./mail.mjs";
import { serverRoot } from "./load-env.mjs";

const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");
const PORT = Number(process.env.PORT || 8788);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 8);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

const rateBuckets = new Map();
const loginBuckets = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function loginAllowed() {
  const now = Date.now();
  // One owner: a global limit also prevents bypass through forged proxy headers.
  const recent = (loginBuckets.get("owner") || []).filter((time) => now - time < LOGIN_WINDOW_MS);
  if (recent.length >= 10) return false;
  recent.push(now);
  loginBuckets.set("owner", recent);
  return true;
}

function allowedOrigins() {
  const raw = String(process.env.ALLOWED_ORIGINS || "http://127.0.0.1:5173,http://localhost:5173");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function originAllowed(origin, hostHeader) {
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost = String(hostHeader || "").split(",")[0].trim();
    if (originHost && originHost === requestHost) return true;
  } catch {
    return false;
  }
  return allowedOrigins().includes(origin);
}
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || allowedOrigins()[0] || "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function sendJson(res, status, data, origin) {
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, private",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function clientIp(req) {
  return (
    String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function rateLimitOk(ip) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT_MAX;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32768) {
      const error = new Error("Request too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function requireAuth(req, res, origin) {
  const token = bearerToken(req);
  if (!isSessionValid(token)) {
    sendJson(res, 401, { ok: false, error: "Unauthorized" }, origin);
    return null;
  }
  return token;
}

const distDir = join(serverRoot, "..", "dist");

const STATIC_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function serveSite(req, res, pathname) {
  if (!existsSync(distDir)) return false;
  const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (relative.includes("..")) return false;
  let file = join(distDir, relative);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) || !statSync(file).isFile()) file = join(distDir, "index.html");
  if (!existsSync(file)) return false;
  const type = STATIC_TYPES[extname(file)] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": file.endsWith("index.html") ? "no-cache" : "public, max-age=86400",
  });
  if (req.method === "HEAD") {
    res.end();
    return true;
  }
  createReadStream(file).pipe(res);
  return true;
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  if (req.method === "OPTIONS") {
    if (origin && !originAllowed(origin, req.headers.host)) {
      sendJson(res, 403, { ok: false, error: "Origin not allowed" }, origin);
      return;
    }
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (origin && !originAllowed(origin, req.headers.host)) {
    sendJson(res, 403, { ok: false, error: "Origin not allowed" }, origin);
    return;
  }

  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const path = url.pathname;

  try {
    if (req.method === "GET" && path === "/api/health") {
      sendJson(res, 200, { ok: true, service: "npai-ru-backend" }, origin);
      return;
    }

    if (req.method === "POST" && path === "/api/auth/login") {
      if (!loginAllowed()) {
        res.setHeader("Retry-After", "900");
        sendJson(res, 429, { ok: false, error: "Too many login attempts. Try again in 15 minutes." }, origin);
        return;
      }
      const body = await readJson(req);
      const login = String(body.login || "").trim();
      const password = String(body.password || "");
      if (!verifyAdminCredentials(login, password)) {
        sendJson(res, 401, { ok: false, error: "Invalid credentials" }, origin);
        return;
      }
      const token = createSession();
      sendJson(res, 200, { ok: true, token }, origin);
      return;
    }

    if (req.method === "POST" && path === "/api/auth/logout") {
      revokeSession(bearerToken(req));
      sendJson(res, 200, { ok: true }, origin);
      return;
    }

    if (req.method === "GET" && path === "/api/auth/me") {
      const token = requireAuth(req, res, origin);
      if (!token) return;
      sendJson(res, 200, { ok: true }, origin);
      return;
    }

    if (req.method === "POST" && path === "/api/applications") {
      if (!rateLimitOk(clientIp(req))) {
        sendJson(res, 429, { ok: false, error: "Too many requests" }, origin);
        return;
      }
      const body = await readJson(req);
      const validated = validateApplication(body);
      if (validated.honeypot) {
        sendJson(res, 200, { ok: true }, origin);
        return;
      }
      if (validated.error) {
        sendJson(res, 400, { ok: false, error: validated.error }, origin);
        return;
      }

      const item = await createApplication(validated.value);
      const mail = await notifyMail(item);
      if (!mail.ok && !mail.skipped) {
        console.warn("Mail notify failed", mail.error);
      } else if (mail.skipped) {
        console.info("Mail notify skipped:", mail.reason);
      }

      sendJson(res, 200, { ok: true, number: item.number }, origin);
      return;
    }

    if (req.method === "GET" && path === "/api/applications") {
      if (!requireAuth(req, res, origin)) return;
      sendJson(res, 200, { ok: true, items: await listApplications() }, origin);
      return;
    }

    const appMatch = /^\/api\/applications\/([^/]+)$/.exec(path);
    if (appMatch) {
      if (!requireAuth(req, res, origin)) return;
      const id = decodeURIComponent(appMatch[1]);

      if (req.method === "PATCH") {
        const body = await readJson(req);
        const updated = await updateApplication(id, body);
        if (!updated) {
          sendJson(res, 404, { ok: false, error: "Not found" }, origin);
          return;
        }
        sendJson(res, 200, { ok: true, item: updated }, origin);
        return;
      }

      if (req.method === "DELETE") {
        if (!await deleteApplication(id)) {
          sendJson(res, 404, { ok: false, error: "Not found" }, origin);
          return;
        }
        sendJson(res, 200, { ok: true }, origin);
        return;
      }
    }

    if ((req.method === "GET" || req.method === "HEAD") && serveSite(req, res, path)) return;

    sendJson(res, 404, { ok: false, error: "Not found" }, origin);
  } catch (error) {
    const status = error.status === 413 ? 413 : error instanceof SyntaxError ? 400 : 500;
    if (status === 500) console.error("Request failed");
    sendJson(res, status, { ok: false, error: status === 413 ? "Request too large" : status === 400 ? "Invalid JSON" : "Server error" }, origin);
  }
});

if (!process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD is not set. Login will fail until you configure server/.env");
}

server.listen(PORT, HOST, () => {
  console.log(`NP.AI RU backend listening on http://${HOST}:${PORT}`);
  console.log("Applications stay on this server and open in /admin. Nothing is sent to VK.");
});
