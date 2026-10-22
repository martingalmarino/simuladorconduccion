import { getSiteConfig } from './content';
import { assertProductionReadiness } from './validate';

export interface SiteRuntime {
  siteName: string;
  locale: string;
  /** Origen canónico con barra final, por ejemplo https://www.practicavial.com.ar/ */
  siteUrl: string | null;
  indexable: boolean;
  trailingSlash: true;
}

const PRODUCTION_ORIGIN = 'https://www.practicavial.com.ar/';

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

function originFrom(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return `${parsed.origin}/`;
  } catch {
    return null;
  }
}

function resolvePublication(): { siteUrl: string | null; indexable: boolean } {
  const config = getSiteConfig();
  const siteUrl = originFrom(import.meta.env.SITE_URL) ?? originFrom(config.siteUrl) ?? PRODUCTION_ORIGIN;
  const indexableRequested = parseBool(
    import.meta.env.INDEXABLE_PRODUCTION as string | undefined,
    config.indexableProduction,
  );
  const readiness = assertProductionReadiness({
    siteUrl,
    indexableProduction: indexableRequested,
  });
  return {
    siteUrl,
    indexable: indexableRequested && readiness.ok,
  };
}

export function getSiteRuntime(): SiteRuntime {
  const config = getSiteConfig();
  const publication = resolvePublication();

  return {
    siteName: config.siteName,
    locale: config.locale,
    siteUrl: publication.siteUrl,
    indexable: publication.indexable,
    trailingSlash: true,
  };
}

export function absoluteUrl(pathname: string): string | null {
  const runtime = getSiteRuntime();
  if (!runtime.siteUrl || !runtime.indexable) return null;
  const path = withTrailingSlash(pathname.startsWith('/') ? pathname : `/${pathname}`);
  return new URL(path, runtime.siteUrl).toString();
}

export function withTrailingSlash(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function productionReadinessReport(): {
  ok: boolean;
  messages: string[];
  indexable: boolean;
  siteUrl: string | null;
} {
  const runtime = getSiteRuntime();
  const check = assertProductionReadiness({
    siteUrl: runtime.siteUrl,
    indexableProduction: runtime.indexable,
  });
  return {
    ok: check.ok && runtime.indexable,
    messages: check.messages,
    indexable: runtime.indexable,
    siteUrl: runtime.siteUrl,
  };
}
