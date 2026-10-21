import { readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  Asset,
  JurisdictionConfig,
  Question,
  QuestionBank,
  ResolvedSource,
  SessionQuestion,
  SiteConfig,
  Source,
  UpcomingTest,
} from '../types/content';
import { validateContentBundle } from './validate';

/** Datos del paquete padre; el cwd de npm scripts es siempre `app/`. */
const DATA_ROOT = path.resolve(process.cwd(), '../data');

function readJson<T>(relativePath: string): T {
  const fullPath = path.join(DATA_ROOT, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8')) as T;
}

let cached:
  | {
      siteConfig: SiteConfig;
      sources: Source[];
      assets: Asset[];
      banks: Map<string, QuestionBank>;
      sourceById: Map<string, Source>;
      assetById: Map<string, Asset>;
      contentVersion: string;
    }
  | undefined;

function loadBundle() {
  if (cached) return cached;

  const siteConfig = readJson<SiteConfig>('site-config.json');
  const sources = readJson<Source[]>('sources.json');
  const assets = readJson<Asset[]>('assets.json');
  const banksList = siteConfig.jurisdictions.map((j) =>
    readJson<QuestionBank>(`${j.bankId}.json`),
  );

  validateContentBundle({
    siteConfig,
    sources,
    assets,
    banks: banksList,
  });

  const banks = new Map(banksList.map((b) => [b.bankId, b]));
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const versionParts = banksList.flatMap((bank) =>
    bank.questions.map((q) => `${q.id}:${q.version}`),
  );
  versionParts.sort();
  const contentVersion = `1.0.0:${versionParts.join('|')}`;

  cached = {
    siteConfig,
    sources,
    assets,
    banks,
    sourceById,
    assetById,
    contentVersion,
  };
  return cached;
}

export function getSiteConfig(): SiteConfig {
  return loadBundle().siteConfig;
}

export function getSources(): Source[] {
  return loadBundle().sources;
}

export function getAssets(): Asset[] {
  return loadBundle().assets;
}

export function getContentVersion(): string {
  return loadBundle().contentVersion;
}

export function getUpcomingTests(): UpcomingTest[] {
  return getSiteConfig().upcomingTests;
}

export function getUpcomingTestBySlug(slug: string): UpcomingTest | undefined {
  return getUpcomingTests().find((test) => test.slug === slug);
}

export function getJurisdictionBySlug(slug: string): JurisdictionConfig | undefined {
  return getSiteConfig().jurisdictions.find((j) => j.slug === slug);
}

export function requireJurisdiction(slug: string): JurisdictionConfig {
  const jurisdiction = getJurisdictionBySlug(slug);
  if (!jurisdiction) {
    throw new Error(`Jurisdicción desconocida: ${slug}`);
  }
  return jurisdiction;
}

export function getBank(bankId: string): QuestionBank {
  const bank = loadBundle().banks.get(bankId);
  if (!bank) {
    throw new Error(`Banco desconocido: ${bankId}`);
  }
  return bank;
}

export function getBankForSlug(slug: string): QuestionBank {
  const jurisdiction = requireJurisdiction(slug);
  return getBank(jurisdiction.bankId);
}

export function getQuestionsForSlug(slug: string): Question[] {
  return getBankForSlug(slug).questions;
}

export function getAsset(imageId: string | null): Asset | null {
  if (!imageId) return null;
  return loadBundle().assetById.get(imageId) ?? null;
}

export function resolveQuestionSources(question: Question): ResolvedSource[] {
  const { sourceById } = loadBundle();
  return question.sources.map((ref) => {
    const source = sourceById.get(ref.sourceId);
    if (!source) {
      throw new Error(`Fuente sin resolver: ${ref.sourceId}`);
    }
    return {
      sourceId: ref.sourceId,
      locator: ref.locator,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      accessedAt: source.accessedAt,
    };
  });
}

export function toSessionQuestion(
  question: Question,
  shuffledOptions: Question['options'],
): SessionQuestion {
  return {
    id: question.id,
    prompt: question.prompt,
    topic: question.topic,
    explanation: question.explanation,
    correctOptionId: question.correctOptionId,
    options: shuffledOptions,
    image: getAsset(question.imageId),
    sources: resolveQuestionSources(question),
    sourceCheckedAt: question.sourceCheckedAt,
    version: question.version,
  };
}

export function prepareQuestionsForClient(questions: Question[]) {
  return questions.map((question) => ({
    id: question.id,
    jurisdictionId: question.jurisdictionId,
    topic: question.topic,
    prompt: question.prompt,
    options: question.options,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    image: getAsset(question.imageId),
    sources: resolveQuestionSources(question),
    sourceCheckedAt: question.sourceCheckedAt,
    version: question.version,
  }));
}

export function sourcesForJurisdiction(jurisdictionId: string): Source[] {
  return getSources().filter((s) => s.jurisdictionId === jurisdictionId);
}

export function groupQuestionsByTopic(questions: Question[]): {
  topic: string;
  questions: Question[];
}[] {
  const map = new Map<string, Question[]>();
  for (const q of questions) {
    const list = map.get(q.topic) ?? [];
    list.push(q);
    map.set(q.topic, list);
  }
  return [...map.entries()].map(([topic, list]) => ({ topic, questions: list }));
}
