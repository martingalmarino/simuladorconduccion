import type { APIRoute } from 'astro';
import { getSiteRuntime, withTrailingSlash } from '../lib/site';

const INDEXABLE_PATHS = [
  '/',
  '/test-de-conducir/',
  '/test-de-conducir/argentina/',
  '/test-de-conducir/caba/',
  '/test-de-conducir/cordoba-capital/',
  '/test-de-conducir/categoria-a/',
  '/fuentes-y-metodologia/',
  '/privacidad/',
  '/terminos/',
  '/acerca/',
  '/contacto/',
  '/aviso-legal/',
];

/** Fecha real de publicación del sitio en el dominio, no la hora del build. */
const LASTMOD = '2026-10-22';
const LASTMOD_BY_PATH: Record<string, string> = {
  '/test-de-conducir/categoria-a/': '2026-10-23',
  '/privacidad/': '2026-10-23',
  '/terminos/': '2026-10-23',
  '/acerca/': '2026-10-23',
  '/contacto/': '2026-10-23',
  '/aviso-legal/': '2026-10-23',
};

export const GET: APIRoute = () => {
  const runtime = getSiteRuntime();

  if (!runtime.indexable || !runtime.siteUrl) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`,
      {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'X-Robots-Tag': 'noindex',
        },
      },
    );
  }

  const urls = INDEXABLE_PATHS.map((path) => {
    const loc = new URL(withTrailingSlash(path), runtime.siteUrl!).toString();
    const lastmod = LASTMOD_BY_PATH[path] ?? LASTMOD;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  }).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
