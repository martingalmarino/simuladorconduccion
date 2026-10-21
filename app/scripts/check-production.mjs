#!/usr/bin/env node
/**
 * Comprueba inputs de lanzamiento sin inventar dominio ni marcar el build como listo.
 * Uso: INDEXABLE_PRODUCTION=true SITE_URL=https://ejemplo.com npm run check:production
 */

function parseBool(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

const indexable = parseBool(process.env.INDEXABLE_PRODUCTION, false);
const siteUrl = process.env.SITE_URL?.trim() || null;
const messages = [];

if (indexable) {
  if (!siteUrl) {
    messages.push('INDEXABLE_PRODUCTION=true requiere SITE_URL absoluto HTTPS.');
  } else {
    try {
      const url = new URL(siteUrl);
      if (url.protocol !== 'https:') {
        messages.push('SITE_URL debe usar HTTPS.');
      }
      if (url.pathname !== '/' && url.pathname !== '') {
        messages.push('SITE_URL no debe incluir una ruta distinta de /.');
      }
    } catch {
      messages.push('SITE_URL no es una URL válida.');
    }
  }
} else {
  messages.push(
    'INDEXABLE_PRODUCTION=false: build de preview/desarrollo (noindex). Correcto para trabajo local.',
  );
}

const unresolved = [
  'Marca / nombre comercial definitivo (hoy: “Test de conducir” genérico)',
  'Dominio HTTPS definitivo (SITE_URL)',
  'Revisión editorial humana del banco',
  'Canal de contacto o reporte de errores',
  'Herramienta de analítica (opcional; deshabilitada por defecto)',
];

const ok = messages.every((m) => m.includes('Correcto') || !m.includes('requiere') && !m.includes('debe') && !m.includes('no es'));

console.log(
  JSON.stringify(
    {
      status: indexable && messages.length === 0 ? 'READY_TO_INDEX' : 'NOT_INDEXABLE_YET',
      indexableProduction: indexable,
      siteUrl,
      checks: messages,
      unresolvedLaunchInputs: unresolved,
    },
    null,
    2,
  ),
);

process.exit(indexable && messages.length > 0 ? 1 : 0);
