/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DRAFTS?: string;
  /** Public URL of the RU applications backend. Never put secrets in VITE_*. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
