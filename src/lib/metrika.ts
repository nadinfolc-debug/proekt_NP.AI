import { hasAnalyticsConsent } from "./cookie-consent";

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
    __npMetrikaLoaded?: boolean;
  }
}

function metrikaId() {
  const raw = (import.meta.env.VITE_YANDEX_METRIKA_ID as string | undefined)?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function isMetrikaConfigured() {
  return metrikaId() !== null;
}

/** Load Yandex Metrika only after analytics cookie consent. */
export function initMetrikaIfAllowed() {
  if (!hasAnalyticsConsent()) return;
  const id = metrikaId();
  if (!id || window.__npMetrikaLoaded) return;
  window.__npMetrikaLoaded = true;

  const m = window;
  const e = document;
  const i = "ym";
  m[i] =
    m[i] ||
    function (...args: unknown[]) {
      (m[i]!.a = m[i]!.a || []).push(args);
    };
  m[i]!.l = Date.now();
  const k = e.createElement("script");
  const a = e.getElementsByTagName("script")[0];
  k.async = true;
  k.src = "https://mc.yandex.ru/metrika/tag.js";
  a?.parentNode?.insertBefore(k, a);

  window.ym?.(id, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  });
}
