import type {
  PracticeHistoryEntry,
  PracticeSession,
  SessionAnswerMap,
} from '../types/content';

const SESSION_PREFIX = 'tdc.session.v1.';
const HISTORY_KEY = 'tdc.history.v1';

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: 'unavailable' | 'corrupt' | 'incompatible' };

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const testKey = '__tdc_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function sessionStorageKey(jurisdictionSlug: string): string {
  return `${SESSION_PREFIX}${jurisdictionSlug}`;
}

export function loadSession(
  jurisdictionSlug: string,
  expectedContentVersion: string,
): StorageResult<PracticeSession | null> {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: 'unavailable' };

  const raw = storage.getItem(sessionStorageKey(jurisdictionSlug));
  if (!raw) return { ok: true, value: null };

  try {
    const parsed = JSON.parse(raw) as PracticeSession;
    if (parsed.schemaVersion !== 1) {
      storage.removeItem(sessionStorageKey(jurisdictionSlug));
      return { ok: false, reason: 'incompatible' };
    }
    if (parsed.contentVersion !== expectedContentVersion) {
      storage.removeItem(sessionStorageKey(jurisdictionSlug));
      return { ok: false, reason: 'incompatible' };
    }
    if (parsed.jurisdictionSlug !== jurisdictionSlug) {
      storage.removeItem(sessionStorageKey(jurisdictionSlug));
      return { ok: false, reason: 'corrupt' };
    }
    return { ok: true, value: parsed };
  } catch {
    try {
      storage.removeItem(sessionStorageKey(jurisdictionSlug));
    } catch {
      /* ignore */
    }
    return { ok: false, reason: 'corrupt' };
  }
}

export function saveSession(session: PracticeSession): StorageResult<true> {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: 'unavailable' };
  try {
    storage.setItem(sessionStorageKey(session.jurisdictionSlug), JSON.stringify(session));
    return { ok: true, value: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function clearSession(jurisdictionSlug: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(sessionStorageKey(jurisdictionSlug));
  } catch {
    /* ignore */
  }
}

export function loadHistory(): StorageResult<PracticeHistoryEntry[]> {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: 'unavailable' };
  const raw = storage.getItem(HISTORY_KEY);
  if (!raw) return { ok: true, value: [] };
  try {
    const parsed = JSON.parse(raw) as PracticeHistoryEntry[];
    if (!Array.isArray(parsed)) {
      storage.removeItem(HISTORY_KEY);
      return { ok: false, reason: 'corrupt' };
    }
    return { ok: true, value: parsed };
  } catch {
    try {
      storage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
    return { ok: false, reason: 'corrupt' };
  }
}

export function appendHistory(entry: PracticeHistoryEntry): StorageResult<true> {
  const current = loadHistory();
  if (!current.ok) return { ok: false, reason: current.reason };
  const next = [entry, ...current.value].slice(0, 20);
  const storage = getStorage();
  if (!storage) return { ok: false, reason: 'unavailable' };
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
    return { ok: true, value: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function clearHistory(): StorageResult<true> {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: 'unavailable' };
  try {
    storage.removeItem(HISTORY_KEY);
    return { ok: true, value: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function emptyAnswers(questionIds: readonly string[]): SessionAnswerMap {
  return Object.fromEntries(questionIds.map((id) => [id, null]));
}
