import { useState, useEffect, useRef } from 'react';
import { checkHealth } from '../api';

export default function Header() {
  const [healthy, setHealthy] = useState(null); // null = unknown, true/false
  const intervalRef = useRef(null);

  const ping = async () => {
    try {
      const ok = await checkHealth();
      setHealthy(ok);
    } catch {
      setHealthy(false);
    }
  };

  useEffect(() => {
    ping();
    intervalRef.current = setInterval(ping, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const dotClass =
    healthy === null ? 'status-dot unknown' : healthy ? 'status-dot online' : 'status-dot offline';
  const tooltip =
    healthy === null
      ? 'Checking backend...'
      : healthy
        ? 'Backend is online'
        : 'Backend is offline';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-mark">
          <span className="logo-symbol">✦</span>
          <div className="logo-glow" />
        </div>
        <div>
          <h1 className="app-title">Fake News Detector</h1>
          <p className="app-subtitle">Interpretable NLP with Explainable AI</p>
        </div>
      </div>
      <div className="header-status-pill" title={tooltip}>
        <span className={dotClass} />
        <span className="status-label">
          {healthy === null ? 'Connecting...' : healthy ? 'System Online' : 'API Offline'}
        </span>
      </div>
    </header>
  );
}
