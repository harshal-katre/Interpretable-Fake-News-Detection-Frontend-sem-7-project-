const EXAMPLES = [
  {
    label: 'Fake example',
    text: 'BREAKING: Anonymous insider reveals that drinking bleach mixed with essential oils cures all known diseases. Big Pharma is desperately trying to suppress this miracle cure that doctors do not want you to know about.',
  },
  {
    label: 'Real example',
    text: 'The Federal Reserve announced on Wednesday that it would raise its benchmark interest rate by 0.25 percentage points, citing persistent inflation. The decision was supported by a majority of committee members according to the official statement.',
  },
  {
    label: 'Ambiguous',
    text: 'A new study suggests that a common household spice may have significant health benefits, but researchers say more clinical trials are needed before drawing conclusions.',
  },
];

const MODEL_OPTIONS = [
  { value: 'logreg', label: 'Logistic Regression (TF-IDF)', disabled: false },
  { value: 'svm', label: 'Linear SVM (TF-IDF)', disabled: false },
  { value: 'bert', label: 'BERT (coming soon)', disabled: true, note: 'Not connected yet' },
];

const METHOD_OPTIONS = [
  { value: 'lime', label: 'LIME (Local Explanations)' },
  { value: 'shap', label: 'SHAP (Shapley Values)' },
];

export default function InputPanel({
  text,
  setText,
  model,
  setModel,
  method,
  setMethod,
  onAnalyze,
  onClear,
  loading,
}) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tooShort = charCount < 20;

  return (
    <section className="input-panel">
      <div className="hero-banner">
        <h2 className="hero-heading">
          Paste an article. See <span className="hero-gradient-text">why</span> it's real or fake.
        </h2>
        <p className="hero-subheading">
          Transparent, interpretable machine learning with token attribution explanations.
        </p>
      </div>

      <div className="input-controls-row">
        <div className="control-group">
          <label className="control-label">Classifier Model</label>
          <select
            className="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}{opt.note ? ` — ${opt.note}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Explanation Method</label>
          <select
            className="model-select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="textarea-container">
        <textarea
          className="text-input"
          placeholder="Paste a news article, claim, or headline here to inspect its validity..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
        />
      </div>

      <div className="input-meta">
        <span className="char-count">
          {charCount} characters &middot; {wordCount} words
        </span>
        {tooShort && charCount > 0 && (
          <span className="min-warning">Minimum 20 characters required</span>
        )}
      </div>

      <div className="button-row">
        <button
          className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
          onClick={onAnalyze}
          disabled={tooShort || loading}
        >
          {loading ? (
            <span className="btn-spinner-wrapper">
              <span className="btn-spinner" />
              <span>Analyzing Claim...</span>
            </span>
          ) : (
            <span className="btn-content">
              <span>Analyze Credibility</span>
              <span className="btn-arrow">→</span>
            </span>
          )}
        </button>
        <button className="btn btn-secondary" onClick={onClear} disabled={loading}>
          Clear
        </button>
      </div>

      <div className="examples-wrapper">
        <span className="examples-title">Sample Prompts:</span>
        <div className="examples-row">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              className="btn btn-example"
              onClick={() => setText(ex.text)}
              disabled={loading}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
