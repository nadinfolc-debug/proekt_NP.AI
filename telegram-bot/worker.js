/**
 * Cloudflare Worker: site form -> Telegram admin alert.
 *
 * Secrets (wrangler secret put ...):
 *   BOT_TOKEN              — token from @BotFather
 *   CHAT_ID                — numeric chat id
 *   TURNSTILE_SECRET_KEY   — Cloudflare Turnstile secret key (server only)
 *
 * Optional vars:
 *   ALLOWED_ORIGINS        — comma-separated origins (default: GitHub Pages + localhost)
 *   RATE_LIMIT_MAX         — max requests per window (default: 5)
 *   RATE_LIMIT_WINDOW_MS   — window length in ms (default: 600000 = 10 min)
 *
 * Do NOT put BOT_TOKEN / TURNSTILE_SECRET_KEY / old shared secrets in the website bundle.
 */

const DEFAULT_ORIGINS = [
  "https://nadinfolc-debug.github.io",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "http://127.0.0.1:8787",
  "http://localhost:8787",
];

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
  contact: "\u0421\u0432\u044f\u0437\u044c",
  service: "\u0423\u0441\u043b\u0443\u0433\u0430",
  task: "\u0417\u0430\u0434\u0430\u0447\u0430",
};

function allowedOrigins(env) {
  if (env.ALLOWED_ORIGINS && String(env.ALLOWED_ORIGINS).trim()) {
    return String(env.ALLOWED_ORIGINS)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}

function corsHeadersFor(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = allowedOrigins(env);
  const reflect = allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": reflect,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimitOk(ip, env) {
  const max = Number(env.RATE_LIMIT_MAX || 5);
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || [];
  const fresh = bucket.filter((ts) => now - ts < windowMs);
  if (fresh.length >= max) {
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
  const contact = String(body.contact || "").trim();
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
    value: {
      name,
      contactMethod,
      contactHandle,
      contact: contact || `${contactMethod}: ${contactHandle}`,
      service,
      task,
      turnstileToken,
    },
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

async function verifyTurnstile(token, secret, ip) {
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  return Boolean(data.success);
}

export default {
  async fetch(request, env) {
    const cors = corsHeadersFor(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405, cors);
    }

    const origin = request.headers.get("Origin") || "";
    if (origin && !allowedOrigins(env).includes(origin)) {
      return json({ ok: false, error: "Origin not allowed" }, 403, cors);
    }

    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      return json({ ok: false, error: "Bot is not configured" }, 500, cors);
    }

    if (!env.TURNSTILE_SECRET_KEY) {
      return json({ ok: false, error: "Captcha is not configured" }, 500, cors);
    }

    const ip = clientIp(request);
    if (!rateLimitOk(ip, env)) {
      return json({ ok: false, error: "Too many requests" }, 429, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400, cors);
    }

    const validated = validateFields(body);
    if (validated.error) {
      return json({ ok: false, error: validated.error }, 400, cors);
    }

    const fields = validated.value;
    const captchaOk = await verifyTurnstile(fields.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!captchaOk) {
      return json({ ok: false, error: "Captcha failed" }, 403, cors);
    }

    const text = buildMessage(fields);
    const telegramUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgResponse.json().catch(() => ({}));
    if (!tgResponse.ok || !tgData.ok) {
      return json(
        {
          ok: false,
          error: "Telegram API error",
          details: tgData.description || tgResponse.statusText,
        },
        502,
        cors,
      );
    }

    return json({ ok: true }, 200, cors);
  },
};
