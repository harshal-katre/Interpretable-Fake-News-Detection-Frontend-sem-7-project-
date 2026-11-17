import { useState } from 'react';

export default function History({ history, onSelect, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <aside className="history-panel">
      <button
        className="history-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        History ({history.length})
        <span className="toggle-arrow">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div className="history-list">
          {history.length > 0 ? (
            <>
              <button className="btn btn-danger btn-small" onClick={handleClear}>
                {confirmClear ? 'Confirm clear?' : 'Clear history'}
              </button>

              {history.map((entry, i) => {
                const preview =
                  entry.text.length > 80
                    ? entry.text.slice(0, 80) + '...'
                    : entry.text;
                const time = new Date(entry.timestamp).toLocaleString();

                return (
                  <div
                    key={i}
                    className="history-item"
                    onClick={() => onSelect(entry)}
                  >
                    <span
                      className={`history-badge ${
                        entry.label === 'fake' ? 'badge-fake' : 'badge-real'
                      }`}
                    >
                      {entry.label.toUpperCase()}
                    </span>
                    <span className="history-preview">{preview}</span>
                    <span className="history-time">{time}</span>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="contrib-empty">No analyses saved yet.</p>
          )}
        </div>
      )}
    </aside>
  );
}
