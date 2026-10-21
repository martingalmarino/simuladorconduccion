import type {
  AnswerOption,
  PracticeModeId,
  Question,
  ScoreSummary,
  SessionAnswerMap,
} from '../types/content';

/** Fisher–Yates shuffle on a copy; never mutates the input. */
export function shuffleCopy<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function filterByBank(
  questions: readonly Question[],
  bankJurisdictionId: string,
): Question[] {
  return questions.filter((q) => q.jurisdictionId === bankJurisdictionId);
}

export interface SelectableQuestion {
  id: string;
  topic: string;
}

/**
 * Select unique question IDs without replacement.
 * For counts below the full bank, distribute across topics when possible.
 * A full-bank selection returns every question ID (still shuffled).
 */
export function selectQuestionIds(
  questions: readonly SelectableQuestion[],
  count: number,
  random: () => number = Math.random,
): string[] {
  if (count < 1) {
    throw new Error('La cantidad de preguntas debe ser al menos 1.');
  }
  if (count > questions.length) {
    throw new Error(
      `Se pidieron ${count} preguntas, pero el banco solo tiene ${questions.length}.`,
    );
  }

  if (count === questions.length) {
    return shuffleCopy(
      questions.map((q) => q.id),
      random,
    );
  }

  const byTopic = new Map<string, SelectableQuestion[]>();
  for (const q of questions) {
    const list = byTopic.get(q.topic) ?? [];
    list.push(q);
    byTopic.set(q.topic, list);
  }

  for (const [topic, list] of byTopic) {
    byTopic.set(topic, shuffleCopy(list, random));
  }

  const topics = shuffleCopy([...byTopic.keys()], random);
  const selected: string[] = [];
  const remaining = new Map(
    [...byTopic.entries()].map(([topic, list]) => [topic, [...list]]),
  );

  while (selected.length < count) {
    let progressed = false;
    for (const topic of topics) {
      if (selected.length >= count) break;
      const pool = remaining.get(topic);
      if (!pool || pool.length === 0) continue;
      const next = pool.shift();
      if (!next) continue;
      selected.push(next.id);
      progressed = true;
    }
    if (!progressed) break;
  }

  if (selected.length < count) {
    throw new Error('No se pudieron seleccionar suficientes preguntas únicas.');
  }

  return shuffleCopy(selected, random);
}

export function shuffleOptions(
  options: readonly AnswerOption[],
  random: () => number = Math.random,
): AnswerOption[] {
  return shuffleCopy(options, random);
}

export function gradeAnswer(
  selectedOptionId: string | null | undefined,
  correctOptionId: string,
): boolean {
  if (!selectedOptionId) return false;
  return selectedOptionId === correctOptionId;
}

export function computeScore(
  questionIds: readonly string[],
  answers: SessionAnswerMap,
  correctById: ReadonlyMap<string, string>,
  topicsById: ReadonlyMap<string, string>,
): ScoreSummary {
  let correct = 0;
  let incorrect = 0;
  const missedQuestionIds: string[] = [];
  const unansweredQuestionIds: string[] = [];
  const reviewTopics = new Set<string>();

  for (const id of questionIds) {
    const selected = answers[id];
    const expected = correctById.get(id);
    if (expected === undefined) {
      throw new Error(`Pregunta desconocida en el puntaje: ${id}`);
    }
    if (selected == null) {
      unansweredQuestionIds.push(id);
      const topic = topicsById.get(id);
      if (topic) reviewTopics.add(topic);
      continue;
    }
    if (gradeAnswer(selected, expected)) {
      correct += 1;
    } else {
      incorrect += 1;
      missedQuestionIds.push(id);
      const topic = topicsById.get(id);
      if (topic) reviewTopics.add(topic);
    }
  }

  const total = questionIds.length;
  const unanswered = unansweredQuestionIds.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    total,
    correct,
    incorrect,
    unanswered,
    percentage,
    missedQuestionIds,
    unansweredQuestionIds,
    topicsToReview: [...reviewTopics],
  };
}

export function createAttemptId(random: () => number = Math.random): string {
  const rand = Math.floor(random() * 1e9)
    .toString(36)
    .padStart(6, '0');
  return `attempt-${Date.now().toString(36)}-${rand}`;
}

export function isLearnMode(mode: PracticeModeId): boolean {
  return mode === 'learn';
}
