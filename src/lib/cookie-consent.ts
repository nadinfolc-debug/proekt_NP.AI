export type CookieConsentChoice = "all" | "necessary";

export const COOKIE_CONSENT_KEY = "np-cookie-consent";

export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "all" || value === "necessary") return value;
  } catch {
    // ignore
  }
  return null;
}

export function setCookieConsent(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("np-cookie-consent", { detail: choice }));
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === "all";
}
