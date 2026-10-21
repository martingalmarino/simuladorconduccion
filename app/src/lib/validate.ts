import { existsSync } from 'node:fs';
import path from 'node:path';
import type {
  Asset,
  QuestionBank,
  SiteConfig,
  Source,
} from '../types/content';

const APP_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(APP_ROOT, 'public');

export class ContentValidationError extends Error {
  constructor(messages: string[]) {
    super(`Validación de contenido fallida:\n- ${messages.join('\n- ')}`);
    this.name = 'ContentValidationError';
  }
}

export function validateContentBundle(input: {
  siteConfig: SiteConfig;
  sources: Source[];
  assets: Asset[];
  banks: QuestionBank[];
}): void {
  const errors: string[] = [];
  const sourceById = new Map(input.sources.map((s) => [s.id, s]));
  const assetById = new Map(input.assets.map((a) => [a.id, a]));
  const bankById = new Map(input.banks.map((b) => [b.bankId, b]));
  const usedAssets = new Set<string>();
  const allQuestionIds = new Set<string>();

  if (input.sources.length !== sourceById.size) {
    errors.push('Hay IDs de fuente duplicados.');
  }
  if (input.assets.length !== assetById.size) {
    errors.push('Hay IDs de imagen duplicados.');
  }

  for (const asset of input.assets) {
    if (!asset.src.startsWith('/images/questions/')) {
      errors.push(`Ruta de imagen inesperada: ${asset.id}`);
      continue;
    }
    const filePath = path.resolve(PUBLIC_ROOT, asset.src.replace(/^\//, ''));
    if (!filePath.startsWith(PUBLIC_ROOT + path.sep) && filePath !== PUBLIC_ROOT) {
      errors.push(`La imagen escapa de public/: ${asset.id}`);
    }
    if (!existsSync(filePath)) {
      errors.push(`Falta el archivo de imagen: ${asset.id} (${asset.src})`);
    }
    if (!asset.alt.trim()) {
      errors.push(`Falta texto alternativo: ${asset.id}`);
    }
  }

  for (const jurisdiction of input.siteConfig.jurisdictions) {
    const bank = bankById.get(jurisdiction.bankId);
    if (!bank) {
      errors.push(`Banco ausente para ${jurisdiction.id}: ${jurisdiction.bankId}`);
      continue;
    }
    if (bank.questions.length !== 50) {
      errors.push(`El banco ${bank.bankId} debe tener 50 preguntas (tiene ${bank.questions.length}).`);
    }
    for (const question of bank.questions) {
      if (allQuestionIds.has(question.id)) {
        errors.push(`ID de pregunta duplicado: ${question.id}`);
      }
      allQuestionIds.add(question.id);

      if (question.jurisdictionId !== jurisdiction.id) {
        errors.push(`Pregunta de otra jurisdicción: ${question.id}`);
      }

      const optionIds = question.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length) {
        errors.push(`Opciones duplicadas: ${question.id}`);
      }
      if (!optionIds.includes(question.correctOptionId)) {
        errors.push(`correctOptionId no resuelve en ${question.id}`);
      }

      for (const ref of question.sources) {
        const source = sourceById.get(ref.sourceId);
        if (!source) {
          errors.push(`Fuente inexistente ${ref.sourceId} en ${question.id}`);
        } else if (source.jurisdictionId !== jurisdiction.id) {
          errors.push(`Fuente de otra jurisdicción en ${question.id}`);
        }
        if (!ref.locator.trim()) {
          errors.push(`Localizador vacío en ${question.id}`);
        }
      }

      if (question.imageId) {
        if (!assetById.has(question.imageId)) {
          errors.push(`Imagen desconocida ${question.imageId} en ${question.id}`);
        } else {
          usedAssets.add(question.imageId);
        }
      }
    }
  }

  for (const assetId of assetById.keys()) {
    if (!usedAssets.has(assetId)) {
      errors.push(`Imagen sin referencias: ${assetId}`);
    }
  }

  if (input.siteConfig.officialExamMode.enabled) {
    errors.push('El modo de examen oficial está habilitado sin perfiles verificados.');
  }

  const jurisdictionSlugs = new Set(input.siteConfig.jurisdictions.map((j) => j.slug));
  const upcomingSlugs = new Set<string>();
  for (const test of input.siteConfig.upcomingTests) {
    if (test.status !== 'proximamente') {
      errors.push(`Estado inesperado en test anunciado: ${test.id}`);
    }
    if (!test.slug.trim() || !test.title.trim() || !test.subtitle.trim()) {
      errors.push(`Faltan datos del test anunciado: ${test.id}`);
    }
    if (upcomingSlugs.has(test.slug) || jurisdictionSlugs.has(test.slug)) {
      errors.push(`Slug de test anunciado en conflicto: ${test.slug}`);
    }
    upcomingSlugs.add(test.slug);
  }

  if (errors.length > 0) {
    throw new ContentValidationError(errors);
  }
}

export function assertProductionReadiness(env: {
  siteUrl: string | null | undefined;
  indexableProduction: boolean;
}): { ok: boolean; messages: string[] } {
  const messages: string[] = [];
  if (env.indexableProduction) {
    if (!env.siteUrl) {
      messages.push('INDEXABLE_PRODUCTION=true requiere SITE_URL absoluto HTTPS.');
    } else {
      try {
        const url = new URL(env.siteUrl);
        if (url.protocol !== 'https:') {
          messages.push('SITE_URL debe usar HTTPS en producción indexable.');
        }
        if (url.pathname !== '/' && url.pathname !== '') {
          messages.push('SITE_URL no debe incluir una ruta distinta de /.');
        }
      } catch {
        messages.push('SITE_URL no es una URL válida.');
      }
    }
  }
  return { ok: messages.length === 0, messages };
}
