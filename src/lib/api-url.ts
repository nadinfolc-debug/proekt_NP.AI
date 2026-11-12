/**
 * 152-FZ: applications API must not point at foreign form/captcha endpoints.
 * Empty URL = API disabled (messengers-only) — allowed.
 */
const BLOCKED_HOST_RE =
  /(^|\.)workers\.dev$|(^|\.)pages\.dev$|cloudflare\.com|challenges\.cloudflare|googleapis\.com|google\.com|gstatic\.com|facebook\.net|facebook\.com|doubleclick\.net|formspree\.io|getform\.io|basin\.com|web3forms\.com|api\.telegram\.org/i;

export function normalizeApiBase(raw: string | undefined | null): string {
  const value = (raw || "").trim().replace(/\/$/, "");
  return value;
}

export function isBlockedApiBase(base: string): boolean {
  if (!base) return false;
  try {
    const url = new URL(base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return true;
    return BLOCKED_HOST_RE.test(url.hostname) || BLOCKED_HOST_RE.test(url.href);
  } catch {
    return true;
  }
}

export function assertApiBaseAllowed(base: string): string | null {
  if (!base) return null;
  if (isBlockedApiBase(base)) {
    return "VITE_API_URL points to a blocked foreign endpoint (152-FZ)";
  }
  return null;
}
