// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  integrations: [react()],
  site: 'https://www.practicavial.com.ar',
});
