/**
 * Локальный сервер уведомлений (тест без Cloudflare).
 *
 * telegram-bot/.env:
 *   BOT_TOKEN=...
 *   CHAT_ID=...
 *   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
 *   PORT=8787
 *
 * Корень сайта (.env):
 *   VITE_NOTIFY_URL=http://127.0.0.1:8787
 *   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
 *
 * Cloudflare dummy keys always pass siteverify — только для локальных тестов.
 */

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const envPath = join(root, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const CHAT_ID = process.env.CHAT_ID || "";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
const PORT = Number(process.env.PORT || 8787);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

const CONTACT_METHODS = new Set(["Telegram", "ВКонтакте", "MAX"]);
const SERVICES = new Set([
  "Создание сайтов",
  "Приложения и цифровые сервисы",
  "AI-изображения для бизнеса",
  "Рекламные и AI-ролики",
  "Контент для социальных сетей",
  "Поддержка и развитие сайтов",
  "Другая задача",
]);

const rateBuckets = new Map();

const T = {
  title:
    "\u041d\u043e\u0432\u0430\u044f \u0437\u0430\u044f\u0432\u043a\u0430 \u0441 \u0441\u0430\u0439\u0442\u0430",
  name: "\u0418\u043c\u044f",
  contactMethod:
    "\u0421\u043f\u043e\u0441\u043e\u0431 \u0441\u0432\u044f\u0437\u0438",
  contactHandle: "\u041f\u0440\u043e\u0444\u0438\u043b\u044c",
  service: "\u0423\u0441\u043b\u0443\u0433\u0430",
  task: "\u0417\u0430\u0434\u0430\u0447\u0430",
};

function cors(res, origin = "*") {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function sendJson(res, status, data, origin = "*") {
  cors(res, origin);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clientIp(req) {
  return (
    req.headers["cf-connecting-ip"] ||
    String(req.headers["x-forwarded-for"] || "")
      .split(",")[0]
      .trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function rateLimitOk(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || [];
  const fresh = bucket.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, fresh);
    return false;
  }
  fresh.push(now);
  rateBuckets.set(ip, fresh);
  return true;
}

function validateFields(body) {
  const name = String(body.name || "").trim();
  const contactMethod = String(body.contactMethod || "").trim();
  const contactHandle = String(body.contactHandle || "").trim();
  const service = String(body.service || "").trim();
  const task = String(body.task || "").trim();
  const turnstileToken = String(body.turnstileToken || "").trim();

  if (!name || name.length > 100) return { error: "Invalid name" };
  if (!CONTACT_METHODS.has(contactMethod)) return { error: "Invalid contact method" };
  if (!contactHandle || contactHandle.length > 200) return { error: "Invalid contact handle" };
  if (!SERVICES.has(service)) return { error: "Invalid service" };
  if (!task || task.length > 4000) return { error: "Invalid task" };
  if (!turnstileToken || turnstileToken.length > 4096) return { error: "Missing captcha" };

  return {
    value: { name, contactMethod, contactHandle, service, task, turnstileToken },
  };
}

function buildMessage(fields) {
  return [
    `<b>${T.title}</b>`,
    "",
    `<b>${T.name}:</b> ${escapeHtml(fields.name)}`,
    `<b>${T.contactMethod}:</b> ${escapeHtml(fields.contactMethod)}`,
    `<b>${T.contactHandle}:</b> ${escapeHtml(fields.contactHandle)}`,
    `<b>${T.service}:</b> ${escapeHtml(fields.service)}`,
    "",
    `<b>${T.task}:</b>`,
    escapeHtml(fields.task),
  ].join("\n");
}

async function verifyTurnstile(token, ip) {
  const form = new URLSearchParams();
  form.set("secret", TURNSTILE_SECRET_KEY);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  return Boolean(data.success);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "*";

  if (req.method === "OPTIONS") {
    cors(res, origin);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" }, origin);
    return;
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    sendJson(res, 500, { ok: false, error: "Set BOT_TOKEN and CHAT_ID in telegram-bot/.env" }, origin);
    return;
  }

  if (!TURNSTILE_SECRET_KEY) {
    sendJson(res, 500, { ok: false, error: "Set TURNSTILE_SECRET_KEY in telegram-bot/.env" }, origin);
    return;
  }

  const ip = clientIp(req);
  if (!rateLimitOk(ip)) {
    sendJson(res, 429, { ok: false, error: "Too many requests" }, origin);
    return;
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { ok: false, error: "Invalid JSON" }, origin);
    return;
  }

  const validated = validateFields(body);
  if (validated.error) {
    sendJson(res, 400, { ok: false, error: validated.error }, origin);
    return;
  }

  const fields = validated.value;
  const captchaOk = await verifyTurnstile(fields.turnstileToken, ip);
  if (!captchaOk) {
    sendJson(res, 403, { ok: false, error: "Captcha failed" }, origin);
    return;
  }

  const text = buildMessage(fields);
  const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const tgData = await tgResponse.json().catch(() => ({}));
  if (!tgResponse.ok || !tgData.ok) {
    sendJson(
      res,
      502,
      {
        ok: false,
        error: "Telegram API error",
        details: tgData.description || tgResponse.statusText,
      },
      origin,
    );
    return;
  }

  sendJson(res, 200, { ok: true }, origin);
});

server.listen(PORT, () => {
  console.log(`NP.AI notify listening on http://127.0.0.1:${PORT}`);
});
