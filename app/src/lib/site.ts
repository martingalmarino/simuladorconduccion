import { getSiteConfig } from './content';
import { assertProductionReadiness } from './validate';

export interface SiteRuntime {
  siteName: string;
  locale: string;
  /** Solo presente cuando la publicación es indexable con SITE_URL válido. */
  siteUrl: string | null;
  indexable: boolean;
  trailingSlash: true;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

export function getSiteRuntime(): SiteRuntime {
  const config = getSiteConfig();
  const envUrl = import.meta.env.SITE_URL as string | undefined;
  const envIndexable = parseBool(
    import.meta.env.INDEXABLE_PRODUCTION as string | undefined,
    false,
  );

  let siteUrl: string | null = null;
  if (envUrl && envUrl.trim()) {
    try {
      const parsed = new URL(envUrl.trim());
      siteUrl = `${parsed.origin}/`;
    } catch {
      siteUrl = null;
    }
  }

  const readiness = assertProductionReadiness({
    siteUrl,
    indexableProduction: envIndexable,
  });

  const indexable = envIndexable && readiness.ok;

  return {
    siteName: config.siteName,
    locale: config.locale,
    siteUrl: indexable ? siteUrl : null,
    indexable,
    trailingSlash: true,
  };
}

export function absoluteUrl(pathname: string): string | null {
  const runtime = getSiteRuntime();
  if (!runtime.siteUrl || !runtime.indexable) return null;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
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
  const envUrl = (import.meta.env.SITE_URL as string | undefined)?.trim() || null;
  let siteUrl: string | null = null;
  if (envUrl) {
    try {
      siteUrl = `${new URL(envUrl).origin}/`;
    } catch {
      siteUrl = null;
    }
  }
  const envIndexable = parseBool(
    import.meta.env.INDEXABLE_PRODUCTION as string | undefined,
    false,
  );
  const check = assertProductionReadiness({
    siteUrl,
    indexableProduction: envIndexable,
  });
  const runtime = getSiteRuntime();
  return {
    ok: check.ok,
    messages: check.messages,
    indexable: runtime.indexable,
    siteUrl: runtime.siteUrl,
  };
}
