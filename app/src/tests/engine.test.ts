import { describe, expect, it } from 'vitest';
import {
  computeScore,
  filterByBank,
  gradeAnswer,
  selectQuestionIds,
  shuffleOptions,
} from '../lib/engine';
import { createPracticeSession, type PreparedQuestion } from '../lib/createSession';
import { loadSession, saveSession, clearSession, emptyAnswers } from '../lib/session';
import type { JurisdictionConfig, PracticeSession } from '../types/content';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makePrepared(
  overrides: Partial<PreparedQuestion> & { id: string; topic: string },
): PreparedQuestion {
  return {
    jurisdictionId: 'ar-caba',
    prompt: `Pregunta ${overrides.id}`,
    options: [
      { id: `${overrides.id}-o1`, text: 'A' },
      { id: `${overrides.id}-o2`, text: 'B' },
      { id: `${overrides.id}-o3`, text: 'C' },
    ],
    correctOptionId: `${overrides.id}-o1`,
    explanation: 'Explicación',
    image: null,
    sources: [
      {
        sourceId: 'caba-2148',
        locator: 'art 1',
        title: 'Fuente',
        publisher: 'Test',
        url: 'https://example.com',
        accessedAt: '2026-10-20',
      },
    ],
    sourceCheckedAt: '2026-10-20',
    version: 1,
    ...overrides,
  };
}

const cabaJurisdiction: JurisdictionConfig = {
  id: 'ar-caba',
  label: 'CABA',
  slug: 'caba',
  bankId: 'caba-b1',
  geographicScope: 'CABA',
  licenseClasses: ['B1'],
  fullSyllabus: false,
};

const practiceModes = [
  {
    id: 'learn' as const,
    label: 'Aprender',
    feedback: 'immediate' as const,
    questionCounts: [10, 20],
    timeLimitSeconds: null,
  },
  {
    id: 'practice' as const,
    label: 'Práctica',
    feedback: 'at-end' as const,
    questionCounts: [20],
    timeLimitSeconds: null,
  },
];

describe('selectQuestionIds', () => {
  it('no duplica IDs', () => {
    const questions = Array.from({ length: 20 }, (_, i) =>
      makePrepared({
        id: `q-${i}`,
        topic: `t-${i % 5}`,
      }),
    );
    const ids = selectQuestionIds(questions, 10, seededRandom(7));
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
  });

  it('usa todas las preguntas en práctica de 20', () => {
    const questions = Array.from({ length: 20 }, (_, i) =>
      makePrepared({ id: `q-${i}`, topic: `t-${i % 4}` }),
    );
    const ids = selectQuestionIds(questions, 20, seededRandom(3));
    expect(ids.sort()).toEqual(questions.map((q) => q.id).sort());
  });
});

describe('filterByBank / jurisdicción', () => {
  it('filtra por jurisdictionId del banco', () => {
    const mixed = [
      {
        id: 'c1',
        jurisdictionId: 'ar-caba' as const,
        licenseClasses: ['B1'] as ['B1'],
        topic: 'a',
        prompt: 'p',
        options: [
          { id: 'c1-o1', text: 'A' },
          { id: 'c1-o2', text: 'B' },
          { id: 'c1-o3', text: 'C' },
        ],
        correctOptionId: 'c1-o1',
        explanation: 'e',
        imageId: null,
        sources: [{ sourceId: 'caba-2148', locator: '1' }],
        contentStatus: 'source-checked-draft' as const,
        sourceCheckedAt: '2026-10-20',
        humanReviewedAt: null,
        humanReviewer: null,
        authorship: 'original-editorial' as const,
        version: 1,
      },
      {
        id: 'x1',
        jurisdictionId: 'ar-x-cordoba-capital' as const,
        licenseClasses: ['B1'] as ['B1'],
        topic: 'a',
        prompt: 'p2',
        options: [
          { id: 'x1-o1', text: 'A' },
          { id: 'x1-o2', text: 'B' },
          { id: 'x1-o3', text: 'C' },
        ],
        correctOptionId: 'x1-o1',
        explanation: 'e',
        imageId: null,
        sources: [{ sourceId: 'cordoba-9981', locator: '1' }],
        contentStatus: 'source-checked-draft' as const,
        sourceCheckedAt: '2026-10-20',
        humanReviewedAt: null,
        humanReviewer: null,
        authorship: 'original-editorial' as const,
        version: 1,
      },
    ];
    expect(filterByBank(mixed, 'ar-caba').map((q) => q.id)).toEqual(['c1']);
  });

  it('createPracticeSession falla con preguntas cruzadas', () => {
    const questions = [
      makePrepared({ id: 'c1', topic: 'a', jurisdictionId: 'ar-caba' }),
      makePrepared({
        id: 'x1',
        topic: 'b',
        jurisdictionId: 'ar-x-cordoba-capital',
      }),
    ];
    expect(() =>
      createPracticeSession({
        questions,
        jurisdiction: cabaJurisdiction,
        mode: 'learn',
        questionCount: 2,
        contentVersion: 'v1',
        practiceModes,
        random: seededRandom(1),
      }),
    ).toThrow(/otra jurisdicción/);
  });
});

describe('grading after shuffle', () => {
  it('califica por ID de opción, no por posición', () => {
    const options = [
      { id: 'o1', text: 'uno' },
      { id: 'o2', text: 'dos' },
      { id: 'o3', text: 'tres' },
    ];
    const shuffled = shuffleOptions(options, seededRandom(99));
    expect(shuffled.map((o) => o.id).sort()).toEqual(['o1', 'o2', 'o3']);
    expect(gradeAnswer('o2', 'o2')).toBe(true);
    expect(gradeAnswer(shuffled[0].id, 'o2')).toBe(shuffled[0].id === 'o2');
    expect(gradeAnswer('o1', 'o2')).toBe(false);
  });
});

describe('score unanswered and reset', () => {
  it('cuenta sin responder como no correctas', () => {
    const ids = ['a', 'b', 'c'];
    const summary = computeScore(
      ids,
      { a: 'a-ok', b: null, c: 'c-wrong' },
      new Map([
        ['a', 'a-ok'],
        ['b', 'b-ok'],
        ['c', 'c-ok'],
      ]),
      new Map([
        ['a', 'semaforos'],
        ['b', 'prioridades'],
        ['c', 'seguridad'],
      ]),
    );
    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(1);
    expect(summary.unanswered).toBe(1);
    expect(summary.percentage).toBe(33);
    expect(summary.unansweredQuestionIds).toEqual(['b']);
    expect(summary.topicsToReview.sort()).toEqual(['prioridades', 'seguridad']);
  });

  it('un nuevo intento reinicia respuestas', () => {
    const questions = Array.from({ length: 10 }, (_, i) =>
      makePrepared({ id: `q-${i}`, topic: `t-${i % 3}` }),
    );
    const first = createPracticeSession({
      questions,
      jurisdiction: cabaJurisdiction,
      mode: 'learn',
      questionCount: 10,
      contentVersion: 'v1',
      practiceModes,
      random: seededRandom(2),
    });
    first.answers[first.questionIds[0]] = first.questions[0].correctOptionId;

    const second = createPracticeSession({
      questions,
      jurisdiction: cabaJurisdiction,
      mode: 'learn',
      questionCount: 10,
      contentVersion: 'v1',
      practiceModes,
      random: seededRandom(5),
    });

    expect(Object.values(second.answers).every((v) => v === null)).toBe(true);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(emptyAnswers(second.questionIds)[second.questionIds[0]]).toBeNull();
  });
});

describe('session resume grading', () => {
  it('mantiene la calificación tras reanudar orden congelado', () => {
    const questions = Array.from({ length: 10 }, (_, i) =>
      makePrepared({
        id: `q-${i}`,
        topic: `t-${i % 3}`,
        correctOptionId: `q-${i}-o2`,
        options: [
          { id: `q-${i}-o1`, text: 'A' },
          { id: `q-${i}-o2`, text: 'B' },
          { id: `q-${i}-o3`, text: 'C' },
        ],
      }),
    );
    const session = createPracticeSession({
      questions,
      jurisdiction: cabaJurisdiction,
      mode: 'learn',
      questionCount: 10,
      contentVersion: 'content-v1',
      practiceModes,
      random: seededRandom(11),
    });

    const q0 = session.questions[0];
    session.answers[q0.id] = q0.correctOptionId;
    session.submittedLearn[q0.id] = true;

    // Simula reanudación: mismas opciones/orden serializados
    const resumed: PracticeSession = JSON.parse(JSON.stringify(session));
    expect(gradeAnswer(resumed.answers[q0.id], resumed.questions[0].correctOptionId)).toBe(
      true,
    );
    expect(resumed.questions[0].options.map((o) => o.id)).toEqual(
      session.questions[0].options.map((o) => o.id),
    );
  });
});

describe('corrupt storage fallback', () => {
  it('descarta JSON corrupto sin lanzar', () => {
    // jsdom-less: stub localStorage on globalThis
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
    // @ts-expect-error test stub
    globalThis.window = { localStorage: storage };

    store.set('tdc.session.v1.caba', '{not-json');
    const result = loadSession('caba', 'v1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('corrupt');

    const session = createPracticeSession({
      questions: Array.from({ length: 10 }, (_, i) =>
        makePrepared({ id: `q-${i}`, topic: `t-${i % 2}` }),
      ),
      jurisdiction: cabaJurisdiction,
      mode: 'learn',
      questionCount: 10,
      contentVersion: 'v1',
      practiceModes,
      random: seededRandom(4),
    });
    expect(saveSession(session).ok).toBe(true);
    clearSession('caba');
    expect(loadSession('caba', 'v1')).toEqual({ ok: true, value: null });

    // @ts-expect-error cleanup
    delete globalThis.window;
  });

  it('invalida sesiones con contentVersion distinta', () => {
    const store = new Map<string, string>();
    // @ts-expect-error test stub
    globalThis.window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    };

    const session = createPracticeSession({
      questions: Array.from({ length: 10 }, (_, i) =>
        makePrepared({ id: `q-${i}`, topic: `t-${i % 2}` }),
      ),
      jurisdiction: cabaJurisdiction,
      mode: 'learn',
      questionCount: 10,
      contentVersion: 'old',
      practiceModes,
      random: seededRandom(8),
    });
    saveSession(session);
    const loaded = loadSession('caba', 'new');
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) expect(loaded.reason).toBe('incompatible');

    // @ts-expect-error cleanup
    delete globalThis.window;
  });
});
