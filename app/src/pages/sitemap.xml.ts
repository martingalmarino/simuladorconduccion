import type { APIRoute } from 'astro';
import { getSiteRuntime, withTrailingSlash } from '../lib/site';

const INDEXABLE_PATHS = [
  '/',
  '/test-de-conducir/',
  '/test-de-conducir/caba/',
  '/test-de-conducir/cordoba-capital/',
  '/fuentes-y-metodologia/',
];

export const GET: APIRoute = () => {
  const runtime = getSiteRuntime();

  if (!runtime.indexable || !runtime.siteUrl) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Sitemap omitido: INDEXABLE_PRODUCTION=false o SITE_URL ausente. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`,
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
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  }).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
