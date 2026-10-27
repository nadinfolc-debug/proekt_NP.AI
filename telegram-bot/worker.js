/**
 * Cloudflare Worker: принимает заявки с сайта и шлёт их админу в Telegram.
 *
 * Secrets (wrangler secret put ...):
 *   BOT_TOKEN  — токен от @BotFather
 *   CHAT_ID    — ваш числовой chat_id
 *   SECRET     — общий секрет с сайтом (тот же, что VITE_NOTIFY_SECRET)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Notify-Secret",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      return json({ ok: false, error: "Bot is not configured" }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400);
    }

    const headerSecret = request.headers.get("X-Notify-Secret") || "";
    const bodySecret = typeof body.secret === "string" ? body.secret : "";
    if (env.SECRET && headerSecret !== env.SECRET && bodySecret !== env.SECRET) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const task = String(body.task || "").trim();

    if (!name || !contact || !task) {
      return json({ ok: false, error: "Missing fields" }, 400);
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

    const telegramUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      );
    }

    return json({ ok: true });
  },
};
