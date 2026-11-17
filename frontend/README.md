# Fake News Detector — Frontend

A single-page React app that lets users paste news text, classify it as real or fake using an ML backend, and see which words drove the prediction through interactive LIME explanations.

## Prerequisites

- **Node.js** 18+ and **npm**
- The Python backend running on `http://localhost:8000` (see root project README)

## Setup

```bash
# From the frontend/ directory
npm install

# Copy the env file (defaults are fine for local dev)
cp .env.example .env
```

## Running

**Start the backend first** (from the project root):

```bash
cd fake-news-detector

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Train the baseline model (only needed once)
python src/train_baseline.py --model logreg

# Start the API server
uvicorn api.main:app --reload --port 8000
```

**Then start the frontend:**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
frontend/
  index.html              Entry HTML
  package.json
  vite.config.js
  .env.example             API URL config
  src/
    main.jsx               React entry point
    App.jsx                App shell, routing, main Detector page
    api.js                 All backend API calls (health, predict, explain)
    components/
      Header.jsx           Title bar with health status dot
      InputPanel.jsx        Textarea, model selector, example buttons
      VerdictCard.jsx       FAKE/REAL verdict with confidence bar
      HighlightedText.jsx   Text with per-word color highlighting
      WordContributions.jsx Horizontal bar chart of contributing words
      History.jsx           Collapsible sidebar of past analyses
    utils/
      highlight.js          Word matching and color scaling logic
      storage.js            localStorage helpers for history
    styles/
      app.css               All styles (plain CSS)
```

## Extending This

### Adding a new model

1. Train the model on the backend (e.g., `python src/train_baseline.py --model svm`).
2. In `src/components/InputPanel.jsx`, find the `MODEL_OPTIONS` array and change `disabled: true` to `disabled: false` for the matching entry.
3. The `model` value is already passed through `api.js` to the backend — no other changes needed.

### Adding a new page

1. Create a new component file in `src/components/` (e.g., `ModelComparison.jsx`).
2. In `App.jsx`, import it and add a `<Route>` inside the `<Routes>` block.
3. Add a matching `<NavLink>` in the `tab-nav` section.

### Adding a new API endpoint

1. Add the fetch function in `src/api.js` using the `apiFetch` helper.
2. Call it from whichever component or page needs it.

### Changing the API URL

Set `VITE_API_URL` in a `.env` file (or `.env.local`):

```
VITE_API_URL=http://your-server:8000
```

Restart the dev server after changing env variables.

## Design Notes

- Light theme with neutral palette; red/green reserved for fake/real semantics.
- Dark blue (`#1b3a5c`) accent for buttons and headings.
- Responsive down to phone screens.
- No external UI framework — plain CSS for full control and readability.
- History capped at 50 entries in localStorage.
