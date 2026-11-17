/**
 * localStorage helpers for analysis history.
 * Cap at 50 entries, newest first.
 */

const STORAGE_KEY = 'fnd_history';
const MAX_ENTRIES = 50;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(entry) {
  const history = loadHistory();
  history.unshift(entry); // newest first
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
