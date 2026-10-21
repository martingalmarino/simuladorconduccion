// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  integrations: [react()],
  // SITE_URL se valida en runtime vía getSiteRuntime(); no inventamos un dominio.
  // Solo asignar `site` cuando INDEXABLE_PRODUCTION=true y SITE_URL es HTTPS válido.
  site:
    process.env.INDEXABLE_PRODUCTION === 'true' && process.env.SITE_URL
      ? process.env.SITE_URL
      : undefined,
});
