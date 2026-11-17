import { useState, useEffect } from 'react';

export default function VerdictCard({ label, confidence }) {
  const isFake = label === 'fake';
  const targetPct = confidence * 100;
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 550; // ms animation

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayPct((ease * targetPct).toFixed(1));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [confidence, targetPct]);

  const lowConfidence = confidence < 0.65;
  const finalPct = targetPct.toFixed(1);

  return (
    <div className={`verdict-card ${isFake ? 'verdict-fake' : 'verdict-real'}`}>
      <div className="verdict-header">
        <div className="verdict-label-group">
          <span className="verdict-badge">
            {isFake ? 'FLAGGED CLAIM' : 'CREDIBLE SOURCE'}
          </span>
          <div className="verdict-label">{label.toUpperCase()}</div>
        </div>
        <div className="verdict-confidence">
          <span className="confidence-pct">{displayPct}%</span>
          <span className="confidence-text">model confidence</span>
        </div>
      </div>
      <div className="confidence-bar-track">
        <div
          className="confidence-bar-fill"
          style={{ width: `${finalPct}%` }}
        />
      </div>
      {lowConfidence && (
        <p className="low-confidence-note">
          Low confidence (&lt;65%). Treat this automated evaluation as uncertain.
        </p>
      )}
    </div>
  );
}
