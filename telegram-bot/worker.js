/**
 * DISABLED for 152-FZ compliance.
 *
 * This Cloudflare Worker previously accepted form PDn and forwarded them to
 * Telegram + verified Cloudflare Turnstile. That path must not be used.
 *
 * Use `server/` (Russian hosting) instead. See DEPRECATED.md.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 410) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return json({
      ok: false,
      error:
        "This endpoint is disabled (152-FZ). Submit applications only to the RU server in /server.",
    });
  },
};
