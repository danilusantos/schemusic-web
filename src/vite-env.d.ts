/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SESSION_TIMEOUT_SECONDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
