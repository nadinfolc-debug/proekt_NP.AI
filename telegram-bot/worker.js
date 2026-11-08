/**
 * Cloudflare Worker: site form -> Telegram admin alert.
 *
 * Secrets (wrangler secret put ...):
 *   BOT_TOKEN  — token from @BotFather
 *   CHAT_ID    — numeric chat id
 *   SECRET     — shared with VITE_NOTIFY_SECRET
 *
 * Message labels use \u escapes so Cyrillic survives any deploy encoding.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Notify-Secret",
};

/** Cyrillic labels (UTF-16 escapes — encoding-safe). */
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildMessage({ name, contactMethod, contactHandle, contact, service, task }) {
  const lines = [`<b>${T.title}</b>`, "", `<b>${T.name}:</b> ${escapeHtml(name)}`];

  if (contactMethod) {
    lines.push(`<b>${T.contactMethod}:</b> ${escapeHtml(contactMethod)}`);
  }
  if (contactHandle) {
    lines.push(`<b>${T.contactHandle}:</b> ${escapeHtml(contactHandle)}`);
  } else if (contact) {
    lines.push(`<b>${T.contact}:</b> ${escapeHtml(contact)}`);
  }
  if (service) {
    lines.push(`<b>${T.service}:</b> ${escapeHtml(service)}`);
  }

  lines.push("", `<b>${T.task}:</b>`, escapeHtml(task));
  return lines.join("\n");
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
    const contactMethod = String(body.contactMethod || "").trim();
    const contactHandle = String(body.contactHandle || "").trim();
    const contact = String(body.contact || "").trim();
    const service = String(body.service || "").trim();
    const task = String(body.task || "").trim();

    const hasContact = Boolean(contactHandle || contact);
    if (!name || !hasContact || !task) {
      return json({ ok: false, error: "Missing fields" }, 400);
    }

    const text = buildMessage({
      name,
      contactMethod,
      contactHandle,
      contact,
      service,
      task,
    });

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
      );
    }

    return json({ ok: true });
  },
};
