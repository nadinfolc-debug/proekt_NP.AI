/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DRAFTS?: string;
  /** Public URL of the RU applications backend. Never put secrets in VITE_*. */
  readonly VITE_API_URL?: string;
  /** Yandex Metrika counter id. Loaded only after cookie-banner analytics consent. */
  readonly VITE_YANDEX_METRIKA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
