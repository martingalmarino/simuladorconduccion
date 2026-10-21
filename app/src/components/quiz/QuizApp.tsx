import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
  JurisdictionConfig,
  PracticeHistoryEntry,
  PracticeModeId,
  PracticeSession,
  ScoreSummary,
  SiteConfig,
} from '../../types/content';
import { computeScore, gradeAnswer } from '../../lib/engine';
import {
  createPracticeSession,
  type PreparedQuestion,
} from '../../lib/createSession';
import {
  appendHistory,
  clearHistory,
  clearSession,
  loadHistory,
  loadSession,
  saveSession,
} from '../../lib/session';
import { topicLabel } from '../../lib/topics';
import './quiz.css';

export interface QuizAppProps {
  jurisdiction: JurisdictionConfig;
  questions: PreparedQuestion[];
  practiceModes: SiteConfig['practiceModes'];
  contentVersion: string;
  notice: string;
}

type Phase = 'setup' | 'active' | 'results';

function scoreFromSession(session: PracticeSession): ScoreSummary {
  const correctById = new Map(
    session.questions.map((q) => [q.id, q.correctOptionId]),
  );
  const topicsById = new Map(session.questions.map((q) => [q.id, q.topic]));
  return computeScore(session.questionIds, session.answers, correctById, topicsById);
}

export default function QuizApp(props: QuizAppProps) {
  const { jurisdiction, questions, practiceModes, contentVersion, notice } = props;
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<PracticeModeId>('learn');
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);
  const [announce, setAnnounce] = useState('');
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  const modeConfig = practiceModes.find((m) => m.id === mode) ?? practiceModes[0];
  const availableCounts = modeConfig?.questionCounts ?? [10];

  useEffect(() => {
    const loaded = loadSession(jurisdiction.slug, contentVersion);
    if (!loaded.ok) {
      if (loaded.reason === 'incompatible') {
        setStorageMessage(
          'Había un intento guardado de una versión anterior del contenido. Empezá uno nuevo.',
        );
      } else if (loaded.reason === 'corrupt') {
        setStorageMessage(
          'No se pudo leer un intento guardado. Empezá una práctica nueva.',
        );
      } else {
        setStorageMessage(
          'El almacenamiento local no está disponible. Podés practicar igual, pero el progreso no se guardará al refrescar.',
        );
      }
    } else if (loaded.value && loaded.value.status === 'active') {
      setSession(loaded.value);
      setPhase('active');
      const current = loaded.value.questions[loaded.value.currentIndex];
      setSelected(current ? loaded.value.answers[current.id] : null);
    } else if (loaded.value && loaded.value.status === 'finished') {
      setSession(loaded.value);
      setPhase('results');
    }

    const hist = loadHistory();
    if (hist.ok) setHistory(hist.value);
  }, [jurisdiction.slug, contentVersion]);

  useEffect(() => {
    if (mode === 'practice') setCount(20);
    else if (!availableCounts.includes(count)) setCount(availableCounts[0] ?? 10);
  }, [mode, availableCounts, count]);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (phase === 'active' && questionHeadingRef.current) {
      questionHeadingRef.current.focus();
    }
  }, [phase, session?.currentIndex]);

  const persist = (next: PracticeSession) => {
    setSession(next);
    const saved = saveSession(next);
    if (!saved.ok && !storageMessage) {
      setStorageMessage(
        'No se pudo guardar el intento en este dispositivo. Seguí practicando; al refrescar puede perderse el progreso.',
      );
    }
  };

  const goTo = (index: number) => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;
    const next = { ...currentSession, currentIndex: index };
    persist(next);
    const q = next.questions[index];
    setSelected(q ? next.answers[q.id] : null);
  };

  useEffect(() => {
    if (phase !== 'active') return;
    const onKey = (event: KeyboardEvent) => {
      const currentSession = sessionRef.current;
      if (!currentSession) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowLeft' && currentSession.currentIndex > 0) {
        event.preventDefault();
        goTo(currentSession.currentIndex - 1);
      }
      if (
        event.key === 'ArrowRight' &&
        currentSession.currentIndex < currentSession.questionCount - 1
      ) {
        event.preventDefault();
        goTo(currentSession.currentIndex + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const startNew = () => {
    const next = createPracticeSession({
      questions,
      jurisdiction,
      mode,
      questionCount: count,
      contentVersion,
      practiceModes,
    });
    clearSession(jurisdiction.slug);
    persist(next);
    setSelected(null);
    setPhase('active');
    setAnnounce('Práctica iniciada.');
  };

  const current = session?.questions[session.currentIndex];
  const isLearn = session?.feedback === 'immediate';
  const learnSubmitted = current
    ? Boolean(session?.submittedLearn[current.id])
    : false;

  const submitLearn = () => {
    if (!session || !current || !selected) return;
    const next: PracticeSession = {
      ...session,
      answers: { ...session.answers, [current.id]: selected },
      submittedLearn: { ...session.submittedLearn, [current.id]: true },
    };
    persist(next);
    const ok = gradeAnswer(selected, current.correctOptionId);
    setAnnounce(ok ? 'Respuesta correcta.' : 'Respuesta incorrecta.');
  };

  const savePracticeAnswer = (optionId: string) => {
    if (!session || !current) return;
    setSelected(optionId);
    const next: PracticeSession = {
      ...session,
      answers: { ...session.answers, [current.id]: optionId },
    };
    persist(next);
  };

  const finish = (force = false) => {
    if (!session) return;
    const unanswered = session.questionIds.filter((id) => session.answers[id] == null);
    if (!force && unanswered.length > 0) {
      const ok = window.confirm(
        `Tenés ${unanswered.length} pregunta${unanswered.length === 1 ? '' : 's'} sin responder. ¿Terminás igual? Las sin responder cuentan como no acertadas.`,
      );
      if (!ok) return;
    }
    const finished: PracticeSession = {
      ...session,
      status: 'finished',
      finishedAt: new Date().toISOString(),
    };
    persist(finished);
    const summary = scoreFromSession(finished);
    appendHistory({
      attemptId: finished.attemptId,
      bankId: finished.bankId,
      jurisdictionLabel: finished.jurisdictionLabel,
      mode: finished.mode,
      questionCount: finished.questionCount,
      correctCount: summary.correct,
      unansweredCount: summary.unanswered,
      percentage: summary.percentage,
      finishedAt: finished.finishedAt!,
    });
    const hist = loadHistory();
    if (hist.ok) setHistory(hist.value);
    setPhase('results');
    setAnnounce(
      `Práctica finalizada. ${summary.correct} de ${summary.total} correctas (${summary.percentage}%).`,
    );
  };

  const resetAttempt = () => {
    clearSession(jurisdiction.slug);
    setSession(null);
    setSelected(null);
    setPhase('setup');
    setAnnounce('Listo para un nuevo intento.');
  };

  const onClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const summary = useMemo(
    () => (session && phase === 'results' ? scoreFromSession(session) : null),
    [session, phase],
  );

  return (
    <div className="quiz-app">
      <div className="quiz-meta" aria-live="polite">
        <span>{jurisdiction.label}</span>
        <span>Autos · {jurisdiction.licenseClasses.join(', ')}</span>
        {session && (
          <span>
            {session.mode === 'learn' ? 'Aprender' : 'Práctica de 20'} ·{' '}
            {session.questionCount} preguntas
          </span>
        )}
      </div>

      {storageMessage && <p className="storage-note">{storageMessage}</p>}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {phase === 'setup' && (
        <section className="card quiz-setup" aria-labelledby={headingId}>
          <h1 id={headingId} style={{ maxWidth: 'none', fontSize: '1.6rem' }}>
            Configurá tu práctica
          </h1>
          <p className="muted">{notice}</p>
          <p className="muted">
            Banco de {questions.length} preguntas. Si elegís 20, usás todas las del banco (no son 20
            nuevas cada vez).
          </p>

          <label id="mode-label">Modalidad</label>
          <div className="mode-grid" role="group" aria-labelledby="mode-label">
            {practiceModes.map((item) => (
              <button
                key={item.id}
                type="button"
                className="quiz-choice"
                aria-pressed={mode === item.id}
                onClick={() => setMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: '-0.35rem', marginBottom: '1rem' }}>
            {mode === 'learn'
              ? 'Sin tiempo. Corrección y explicación después de cada respuesta.'
              : 'Sin tiempo. Corrección al final. Es práctica, no un examen oficial.'}
          </p>

          {mode === 'learn' && (
            <>
              <label id="count-label">Cantidad</label>
              <div className="count-grid" role="group" aria-labelledby="count-label">
                {availableCounts.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="quiz-choice"
                    aria-pressed={count === n}
                    onClick={() => setCount(n)}
                  >
                    {n} preguntas
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={startNew}>
              Empezar a practicar
            </button>
            <a className="btn btn--secondary" href={`/test-de-conducir/${jurisdiction.slug}/`}>
              Estudiar las preguntas
            </a>
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Historial en este dispositivo</h2>
              <ul className="muted" style={{ paddingLeft: '1.1rem' }}>
                {history
                  .filter((h) => h.bankId === jurisdiction.bankId)
                  .slice(0, 5)
                  .map((h) => (
                    <li key={h.attemptId}>
                      {new Date(h.finishedAt).toLocaleString('es-AR')}: {h.correctCount}/
                      {h.questionCount} ({h.percentage}%)
                    </li>
                  ))}
              </ul>
              <button type="button" className="btn btn--ghost" onClick={onClearHistory}>
                Borrar historial local
              </button>
            </div>
          )}
        </section>
      )}

      {phase === 'active' && session && current && (
        <section className="card quiz-card" aria-labelledby={headingId}>
          <div className="quiz-progress">
            <p className="muted" style={{ margin: '0 0 0.4rem' }}>
              Pregunta {session.currentIndex + 1} de {session.questionCount} ·{' '}
              {topicLabel(current.topic)}
            </p>
            <div
              className="quiz-progress__bar"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={session.questionCount}
              aria-valuenow={session.currentIndex + 1}
              aria-label="Progreso de la práctica"
            >
              <div
                className="quiz-progress__fill"
                style={{
                  width: `${((session.currentIndex + 1) / session.questionCount) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 id={headingId} tabIndex={-1} ref={questionHeadingRef}>
            {current.prompt}
          </h2>

          {current.image && (
            <figure className="question-image">
              <img
                src={current.image.src}
                alt={current.image.alt}
                width={current.image.width}
                height={current.image.height}
                decoding="async"
              />
            </figure>
          )}

          <fieldset className="quiz-options">
            <legend>Elegí una opción</legend>
            {current.options.map((option) => {
              const isSelected = selected === option.id;
              let state: 'correct' | 'incorrect' | undefined;
              if (isLearn && learnSubmitted) {
                if (option.id === current.correctOptionId) state = 'correct';
                else if (isSelected) state = 'incorrect';
              }
              return (
                <button
                  key={option.id}
                  type="button"
                  className="quiz-option"
                  data-selected={isSelected}
                  data-state={state}
                  disabled={isLearn && learnSubmitted}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isLearn && learnSubmitted) return;
                    if (isLearn) setSelected(option.id);
                    else savePracticeAnswer(option.id);
                  }}
                >
                  <span className="quiz-option__marker" aria-hidden="true" />
                  <span>{option.text}</span>
                </button>
              );
            })}
          </fieldset>

          {isLearn && learnSubmitted && (
            <div
              className={`quiz-feedback ${
                gradeAnswer(selected, current.correctOptionId)
                  ? 'quiz-feedback--ok'
                  : 'quiz-feedback--err'
              }`}
              role="status"
            >
              <p>
                <strong>
                  {gradeAnswer(selected, current.correctOptionId)
                    ? 'Correcto'
                    : 'Incorrecto'}
                </strong>
              </p>
              <p>{current.explanation}</p>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                Consulta de fuente: {current.sourceCheckedAt}
              </p>
              <ul className="source-list">
                {current.sources.map((source) => (
                  <li key={`${source.sourceId}-${source.locator}`}>
                    <a href={source.url} rel="noopener noreferrer" target="_blank">
                      {source.title}
                    </a>{' '}
                    <span className="muted">
                      ({source.locator} · {source.publisher})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="quiz-nav">
            <button
              type="button"
              className="btn btn--secondary"
              disabled={session.currentIndex === 0}
              onClick={() => goTo(session.currentIndex - 1)}
            >
              Anterior
            </button>

            {isLearn && !learnSubmitted && (
              <button
                type="button"
                className="btn btn--primary"
                disabled={!selected}
                onClick={submitLearn}
              >
                Responder
              </button>
            )}

            {isLearn && learnSubmitted && session.currentIndex < session.questionCount - 1 && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => goTo(session.currentIndex + 1)}
              >
                Siguiente
              </button>
            )}

            {isLearn && learnSubmitted && session.currentIndex === session.questionCount - 1 && (
              <button type="button" className="btn btn--primary" onClick={() => finish(true)}>
                Ver resultados
              </button>
            )}

            {!isLearn && session.currentIndex < session.questionCount - 1 && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => goTo(session.currentIndex + 1)}
              >
                Siguiente
              </button>
            )}

            {!isLearn && (
              <button type="button" className="btn btn--secondary" onClick={() => finish(false)}>
                Terminar práctica
              </button>
            )}
          </div>

          {!isLearn && (
            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Podés volver a preguntas anteriores antes de terminar. Las sin responder se cuentan como
              no acertadas.
            </p>
          )}
        </section>
      )}

      {phase === 'results' && session && summary && (
        <section className="card results-summary" aria-labelledby={headingId}>
          <h1 id={headingId} style={{ maxWidth: 'none', fontSize: '1.6rem' }}>
            Resultado de la práctica
          </h1>
          <p className="muted">
            Esto es un ejercicio de repaso, no un veredicto de examen oficial. No usamos un umbral de
            “aprobado”.
          </p>
          <dl>
            <dt>Aciertos</dt>
            <dd>
              {summary.correct} de {summary.total} ({summary.percentage}%)
            </dd>
            <dt>Incorrectas</dt>
            <dd>{summary.incorrect}</dd>
            <dt>Sin responder</dt>
            <dd>{summary.unanswered}</dd>
            {summary.topicsToReview.length > 0 && (
              <>
                <dt>Temas para repasar</dt>
                <dd>{summary.topicsToReview.map(topicLabel).join(', ')}</dd>
              </>
            )}
          </dl>

          {(summary.missedQuestionIds.length > 0 ||
            summary.unansweredQuestionIds.length > 0) && (
            <div style={{ marginTop: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Repaso</h2>
              <ul className="review-list">
                {[...summary.missedQuestionIds, ...summary.unansweredQuestionIds].map((id) => {
                  const q = session.questions.find((item) => item.id === id);
                  if (!q) return null;
                  const answered = session.answers[id];
                  const unanswered = answered == null;
                  return (
                    <li key={id} className="card" style={{ boxShadow: 'none' }}>
                      <p className="muted" style={{ margin: '0 0 0.35rem', fontSize: '0.85rem' }}>
                        {unanswered ? 'Sin responder' : 'Incorrecta'} · {topicLabel(q.topic)} ·{' '}
                        {id}
                      </p>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>{q.prompt}</p>
                      <p>
                        <strong>Correcta:</strong>{' '}
                        {q.options.find((o) => o.id === q.correctOptionId)?.text}
                      </p>
                      <p>{q.explanation}</p>
                      <ul className="source-list">
                        {q.sources.map((source) => (
                          <li key={`${source.sourceId}-${source.locator}`}>
                            <a href={source.url} rel="noopener noreferrer" target="_blank">
                              {source.title}
                            </a>{' '}
                            <span className="muted">({source.locator})</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="btn-row" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn--primary" onClick={resetAttempt}>
              Nuevo intento
            </button>
            <a className="btn btn--secondary" href={`/test-de-conducir/${jurisdiction.slug}/`}>
              Estudiar el banco
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
