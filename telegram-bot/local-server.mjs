/**
 * Локальный сервер уведомлений (для теста без Cloudflare).
 *
 * 1. Создайте файл telegram-bot/.env:
 *    BOT_TOKEN=...
 *    CHAT_ID=...
 *    SECRET=npai-secret-2026
 *    PORT=8787
 *
 * 2. node local-server.mjs
 *
 * 3. В корне сайта .env:
 *    VITE_NOTIFY_URL=http://localhost:8787
 *    VITE_NOTIFY_SECRET=npai-secret-2026
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
const SECRET = process.env.SECRET || "";
const PORT = Number(process.env.PORT || 8787);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Notify-Secret");
}

function sendJson(res, status, data) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    sendJson(res, 500, { ok: false, error: "Set BOT_TOKEN and CHAT_ID in telegram-bot/.env" });
    return;
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { ok: false, error: "Invalid JSON" });
    return;
  }

  const headerSecret = req.headers["x-notify-secret"] || "";
  const bodySecret = typeof body.secret === "string" ? body.secret : "";
  if (SECRET && headerSecret !== SECRET && bodySecret !== SECRET) {
    sendJson(res, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  const name = String(body.name || "").trim();
  const contact = String(body.contact || "").trim();
  const task = String(body.task || "").trim();
  if (!name || !contact || !task) {
    sendJson(res, 400, { ok: false, error: "Missing fields" });
    return;
  }

  const text = [
    "<b>Новая заявка с сайта</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Связь:</b> ${escapeHtml(contact)}`,
    "",
    "<b>Задача:</b>",
    escapeHtml(task),
  ].join("\n");

  const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const tgData = await tgResponse.json().catch(() => ({}));
  if (!tgResponse.ok || !tgData.ok) {
    sendJson(res, 502, {
      ok: false,
      error: "Telegram API error",
      details: tgData.description || tgResponse.statusText,
    });
    return;
  }

  sendJson(res, 200, { ok: true });
});

server.listen(PORT, () => {
  console.log(`NP.AI notify listening on http://localhost:${PORT}`);
});
