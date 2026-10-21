/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly INDEXABLE_PRODUCTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
