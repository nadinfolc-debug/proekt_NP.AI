/**
 * CI / local guard: VITE_API_URL must not target foreign form/captcha endpoints (152-FZ).
 * Empty value is allowed (messengers-only mode).
 */

const BLOCKED_HOST_RE =
  /(^|\.)workers\.dev$|(^|\.)pages\.dev$|cloudflare\.com|challenges\.cloudflare|googleapis\.com|google\.com|gstatic\.com|facebook\.net|facebook\.com|doubleclick\.net|formspree\.io|getform\.io|basin\.com|web3forms\.com|api\.telegram\.org/i;

const raw = (process.env.VITE_API_URL || "").trim().replace(/\/$/, "");

if (!raw) {
  console.log("[check-api-url] VITE_API_URL is empty — OK (API disabled).");
  process.exit(0);
}

let url;
try {
  url = new URL(raw);
} catch {
  console.error(`[check-api-url] Invalid VITE_API_URL: ${raw}`);
  process.exit(1);
}

if (url.protocol !== "http:" && url.protocol !== "https:") {
  console.error(`[check-api-url] VITE_API_URL must be http(s): ${raw}`);
  process.exit(1);
}

if (BLOCKED_HOST_RE.test(url.hostname) || BLOCKED_HOST_RE.test(url.href)) {
  console.error(
    `[check-api-url] Blocked foreign endpoint in VITE_API_URL (152-FZ): ${raw}\nUse a Russian backend URL from /server instead.`,
  );
  process.exit(1);
}

console.log(`[check-api-url] VITE_API_URL looks allowed: ${raw}`);
