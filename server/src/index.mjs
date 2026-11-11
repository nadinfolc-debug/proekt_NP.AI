import { createServer } from "node:http";
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
} from "./store.mjs";
import { validateApplication } from "./validate.mjs";
import { notifyVkShort } from "./vk.mjs";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8788);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 8);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

const rateBuckets = new Map();

function allowedOrigins() {
  const raw = String(process.env.ALLOWED_ORIGINS || "http://127.0.0.1:5173,http://localhost:5173");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(origin) {
  const list = allowedOrigins();
  const allow = origin && list.includes(origin) ? origin : list[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function sendJson(res, status, data, origin) {
  const headers = {
    ...corsHeaders(origin),
    "Content-Type": "application/json; charset=utf-8",
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
  for await (const chunk of req) chunks.push(chunk);
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

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const list = allowedOrigins();

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin && list.includes(origin) ? origin : list[0]));
    res.end();
    return;
  }

  if (origin && !list.includes(origin)) {
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

      const item = createApplication(validated.value);
      const vk = await notifyVkShort({ number: item.number, createdAt: item.createdAt });
      if (!vk.ok && !vk.skipped) {
        console.warn("VK notify failed", vk);
      } else if (vk.skipped) {
        console.info("VK notify skipped:", vk.reason);
      }

      sendJson(res, 200, { ok: true, number: item.number }, origin);
      return;
    }

    if (req.method === "GET" && path === "/api/applications") {
      if (!requireAuth(req, res, origin)) return;
      sendJson(res, 200, { ok: true, items: listApplications() }, origin);
      return;
    }

    const appMatch = /^\/api\/applications\/([^/]+)$/.exec(path);
    if (appMatch) {
      if (!requireAuth(req, res, origin)) return;
      const id = decodeURIComponent(appMatch[1]);

      if (req.method === "PATCH") {
        const body = await readJson(req);
        const updated = updateApplication(id, body);
        if (!updated) {
          sendJson(res, 404, { ok: false, error: "Not found" }, origin);
          return;
        }
        sendJson(res, 200, { ok: true, item: updated }, origin);
        return;
      }

      if (req.method === "DELETE") {
        if (!deleteApplication(id)) {
          sendJson(res, 404, { ok: false, error: "Not found" }, origin);
          return;
        }
        sendJson(res, 200, { ok: true }, origin);
        return;
      }
    }

    sendJson(res, 404, { ok: false, error: "Not found" }, origin);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { ok: false, error: "Server error" }, origin);
  }
});

if (!process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD is not set. Login will fail until you configure server/.env");
}

server.listen(PORT, HOST, () => {
  console.log(`NP.AI RU backend listening on http://${HOST}:${PORT}`);
  console.log("Personal data stays on this server. VK gets number + date/time only.");
});
