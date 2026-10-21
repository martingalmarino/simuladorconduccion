import type {
  AnswerOption,
  JurisdictionConfig,
  PracticeModeId,
  PracticeSession,
  SessionQuestion,
  SiteConfig,
} from '../types/content';
import {
  createAttemptId,
  selectQuestionIds,
  shuffleOptions,
} from './engine';
import { emptyAnswers } from './session';

/** Pregunta ya resuelta (imagen y fuentes) lista para el cliente. */
export interface PreparedQuestion {
  id: string;
  jurisdictionId: string;
  topic: string;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  explanation: string;
  image: SessionQuestion['image'];
  sources: SessionQuestion['sources'];
  sourceCheckedAt: string;
  version: number;
  scopeNote?: string | null;
}

export function createPracticeSession(input: {
  questions: PreparedQuestion[];
  jurisdiction: JurisdictionConfig;
  mode: PracticeModeId;
  questionCount: number;
  contentVersion: string;
  practiceModes: SiteConfig['practiceModes'];
  random?: () => number;
}): PracticeSession {
  const random = input.random ?? Math.random;

  const foreign = input.questions.find(
    (q) => q.jurisdictionId !== input.jurisdiction.id,
  );
  if (foreign) {
    throw new Error('Se detectaron preguntas de otra jurisdicción en el banco.');
  }

  const modeConfig = input.practiceModes.find((m) => m.id === input.mode);
  if (!modeConfig) {
    throw new Error(`Modalidad desconocida: ${input.mode}`);
  }
  if (!modeConfig.questionCounts.includes(input.questionCount)) {
    throw new Error(
      `La modalidad ${input.mode} no admite ${input.questionCount} preguntas.`,
    );
  }

  const questionIds = selectQuestionIds(
    input.questions.map((q) => ({ id: q.id, topic: q.topic })),
    input.questionCount,
    random,
  );

  const byId = new Map(input.questions.map((q) => [q.id, q]));
  const questions: SessionQuestion[] = questionIds.map((id) => {
    const question = byId.get(id);
    if (!question) throw new Error(`Pregunta no encontrada: ${id}`);
    return {
      id: question.id,
      prompt: question.prompt,
      topic: question.topic,
      explanation: question.explanation,
      correctOptionId: question.correctOptionId,
      options: shuffleOptions(question.options, random),
      image: question.image,
      sources: question.sources,
      sourceCheckedAt: question.sourceCheckedAt,
      version: question.version,
      scopeNote: question.scopeNote ?? null,
    };
  });

  return {
    schemaVersion: 1,
    contentVersion: input.contentVersion,
    attemptId: createAttemptId(random),
    bankId: input.jurisdiction.bankId,
    jurisdictionId: input.jurisdiction.id,
    jurisdictionSlug: input.jurisdiction.slug,
    jurisdictionLabel: input.jurisdiction.label,
    licenseClasses: [...input.jurisdiction.licenseClasses],
    mode: input.mode,
    feedback: modeConfig.feedback,
    questionCount: input.questionCount,
    questionIds,
    questions,
    answers: emptyAnswers(questionIds),
    submittedLearn: {},
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: 'active',
  };
}
