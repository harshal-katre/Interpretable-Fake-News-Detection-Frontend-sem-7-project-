/**
 * API client — all backend calls live here.
 * To add a new model, just pass its key as the `model` parameter.
 */

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TIMEOUT_MS = 30000;

/* Wrapper that adds a timeout and translates errors to plain-language messages. */
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });

    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        body.detail ||
          'Model not trained yet. Run the training script on the backend first.'
      );
    }

    if (!res.ok) {
      throw new Error(`Server error (${res.status}). Please try again.`);
    }

    const data = await res.json();
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Empty response from the server.');
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds. Is the backend running?');
    }
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Cannot reach the backend. Make sure the API server is running on port 8000.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /health */
export async function checkHealth() {
  const data = await apiFetch('/health');
  return data.status === 'ok';
}

/** POST /predict */
export async function predictText(text, model = 'logreg') {
  return apiFetch('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model }),
  });
}

/** POST /explain */
export async function explainText(text, model = 'logreg', method = 'lime') {
  return apiFetch('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model, method }),
  });
}

/** GET /metrics */
export async function getMetrics() {
  return apiFetch('/metrics');
}
