import { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import VerdictCard from './components/VerdictCard';
import HighlightedText from './components/HighlightedText';
import WordContributions from './components/WordContributions';
import History from './components/History';
import InteractiveCharts from './components/InteractiveCharts';
import SpotTheFakeGame from './components/SpotTheFakeGame';
import TrustGuide from './components/TrustGuide';
import NetworkIllustration from './components/NetworkIllustration';
import { explainText, getMetrics } from './api';
import { saveAnalysis, loadHistory, clearHistory } from './utils/storage';

function DetectorPage() {
  const [text, setText] = useState('');
  const [model, setModel] = useState('logreg');
  const [method, setMethod] = useState('lime');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(loadHistory());
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (text.length < 20) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await explainText(text, model, method);
      setResult({ ...data, text });

      // Save to history
      const entry = {
        text,
        label: data.label,
        confidence: data.confidence,
        explanation: data.explanation,
        method: data.method || method,
        model,
        timestamp: new Date().toISOString(),
      };
      const updated = saveAnalysis(entry);
      setHistory(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleHistoryClick = (entry) => {
    setText(entry.text);
    setResult({
      label: entry.label,
      confidence: entry.confidence,
      explanation: entry.explanation,
      text: entry.text,
    });
    setError(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Subtle 3D tilt tracking for mouse on results card
  const handleResultsMouseMove = (e) => {
    const el = resultsRef.current;
    if (!el || window.innerWidth < 768) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  const handleResultsMouseLeave = () => {
    const el = resultsRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  // Summary line from explanation data
  const summaryLine = result
    ? generateSummary(result.label, result.explanation)
    : null;

  return (
    <div className="detector-page-wrapper">
      <div className="detector-layout">
      <div className="detector-main">
        <InputPanel
          text={text}
          setText={setText}
          model={model}
          setModel={setModel}
          method={method}
          setMethod={setMethod}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          loading={loading}
        />

        {error && <div className="error-banner">{error}</div>}

        {/* Skeleton Shimmer Loading State */}
        {loading && (
          <div className="skeleton-loading-panel">
            <div className="skeleton-card">
              <div className="skeleton-row-header">
                <div className="skeleton-pill shimmer" style={{ width: '35%', height: '32px' }} />
                <div className="skeleton-pill shimmer" style={{ width: '25%', height: '32px' }} />
              </div>
              <div className="skeleton-bar-track shimmer" style={{ marginTop: '1.25rem', height: '14px' }} />
            </div>
            <div className="skeleton-card">
              <div className="skeleton-line shimmer" style={{ width: '45%', height: '22px', marginBottom: '1.25rem' }} />
              <div className="skeleton-line shimmer" style={{ width: '100%', height: '16px', marginBottom: '0.75rem' }} />
              <div className="skeleton-line shimmer" style={{ width: '92%', height: '16px', marginBottom: '0.75rem' }} />
              <div className="skeleton-line shimmer" style={{ width: '65%', height: '16px' }} />
            </div>
            <div className="skeleton-card">
              <div className="skeleton-line shimmer" style={{ width: '50%', height: '22px', marginBottom: '1.25rem' }} />
              <div className="skeleton-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="skeleton-box shimmer" style={{ flex: 1, height: '90px' }} />
                <div className="skeleton-box shimmer" style={{ flex: 1, height: '90px' }} />
              </div>
            </div>
          </div>
        )}

        {result && (
          <div
            ref={resultsRef}
            className="results-section"
            onMouseMove={handleResultsMouseMove}
            onMouseLeave={handleResultsMouseLeave}
          >
            <VerdictCard label={result.label} confidence={result.confidence} />

            {summaryLine && <p className="summary-line">{summaryLine}</p>}

            <HighlightedText
              text={result.text}
              explanation={result.explanation}
            />

            <WordContributions explanation={result.explanation} />
          </div>
        )}
      </div>

        <div className="detector-sidebar">
          <History
            history={history}
            onSelect={handleHistoryClick}
            onClear={handleClearHistory}
          />
          <SpotTheFakeGame />
          <NetworkIllustration />
        </div>
      </div>

      {/* Exploration & Deepening Sections */}
      <div className="detector-bottom-grid">
        <InteractiveCharts />
        <TrustGuide />
      </div>
    </div>
  );
}

/* Build a one-line summary from the explanation data */
function generateSummary(label, explanation) {
  if (!explanation || explanation.length === 0) return null;

  const isFake = label === 'fake';
  const direction = isFake ? 'FAKE' : 'REAL';
  // Pick words that push toward the predicted label
  const pushingWords = explanation.filter((e) =>
    isFake ? e.weight > 0 : e.weight < 0
  );

  if (pushingWords.length === 0) return null;

  const topWords = pushingWords
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 3)
    .map((e) => `"${e.word}"`);

  return `Flagged as ${direction} primarily due to high attribution on: ${topWords.join(', ')}.`;
}

function ComparisonPage() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMetrics()
      .then((data) => {
        if (mounted) {
          setMetrics(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <span className="comparison-badge">BENCHMARK EVALUATION</span>
        <h2>Model Performance Comparison</h2>
        <p>
          Comparative evaluation of baseline TF-IDF classifiers trained on stratified news datasets.
        </p>
      </div>

      {loading && <p className="loading-metrics-text">Loading metrics...</p>}
      {error && (
        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
          Could not load metrics: {error}
        </div>
      )}

      {!loading && metrics.length > 0 && (
        <div className="metrics-table-wrapper">
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Classifier Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.model}>
                  <td className="model-name-cell">
                    <span className="model-indicator-dot" />
                    {row.model === 'logreg' ? 'Logistic Regression' : row.model.toUpperCase()}
                  </td>
                  <td className="metric-highlight">{(row.accuracy * 100).toFixed(1)}%</td>
                  <td>{(row.precision * 100).toFixed(1)}%</td>
                  <td>{(row.recall * 100).toFixed(1)}%</td>
                  <td>{(row.f1 * 100).toFixed(1)}%</td>
                  <td>{(row.roc_auc * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="insights-card">
        <h4 className="insights-title">
          <span className="insights-icon">✦</span> Key Interpretability Architecture
        </h4>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-name">TF-IDF + Logistic Regression</span>
            <p className="insight-desc">Fast, linear decision boundaries with direct probabilistic interpretation via sigmoid link.</p>
          </div>
          <div className="insight-item">
            <span className="insight-name">TF-IDF + Linear SVM</span>
            <p className="insight-desc">Maximum margin hyperplane with calibrated decision distances for boundary sharpness.</p>
          </div>
          <div className="insight-item">
            <span className="insight-name">LIME (Local Explanations)</span>
            <p className="insight-desc">Perturbation-based local surrogate model generating sparse word attribution scores.</p>
          </div>
          <div className="insight-item">
            <span className="insight-name">SHAP (Shapley Values)</span>
            <p className="insight-desc">Game-theoretic Shapley values computing exact marginal contributions per token.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      {/* 3 Large Drifting Background Glow Blobs */}
      <div className="ambient-canvas" aria-hidden="true">
        <div className="glow-blob blob-purple" />
        <div className="glow-blob blob-green" />
        <div className="glow-blob blob-blue" />
        <div className="noise-texture" />
      </div>

      <div className="app">
        <Header />
        <nav className="tab-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            <span className="tab-icon">⚡</span>
            <span>Credibility Detector</span>
          </NavLink>
          <NavLink to="/comparison" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            <span className="tab-icon">📊</span>
            <span>Model Benchmarks</span>
          </NavLink>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DetectorPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
