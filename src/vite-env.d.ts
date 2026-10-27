/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DRAFTS?: string;
  readonly VITE_ADMIN_LOGIN?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_NOTIFY_URL?: string;
  readonly VITE_NOTIFY_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
