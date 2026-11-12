/**
 * DISABLED for 152-FZ compliance.
 *
 * Former local stand-in for Cloudflare Worker + Turnstile + Telegram PDn relay.
 * Do not use. Run `npm run server` (catalog `server/`) instead.
 *
 * See DEPRECATED.md.
 */

import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);

const server = createServer((req, res) => {
  const body = JSON.stringify({
    ok: false,
    error:
      "telegram-bot local server is disabled (152-FZ). Use the RU backend in /server.",
  });
  res.writeHead(410, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.error(
    `[152-FZ] telegram-bot/local-server.mjs is DISABLED. Listening on 127.0.0.1:${PORT} only to return 410. Use server/ instead.`,
  );
});
