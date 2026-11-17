export default function TrustGuide() {
  const safePoints = [
    {
      title: 'Verified Byline & Organization',
      desc: 'Transparent author credentials, editorial contact details, and institutional corrections policy.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Primary Source Attribution',
      desc: 'Direct quotes, hyperlinks to public datasets, research papers, or official institutional reports.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      title: 'Corroboration by Independent Media',
      desc: 'Significant stories are contemporaneously corroborated across independent newsrooms.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      ),
    },
    {
      title: 'Neutral & Contextual Tone',
      desc: 'Even-handed analysis avoiding panic verbs, emotional baiting, or speculative absolutes.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  const redFlags = [
    {
      title: 'Sensational All-Caps Phrasing',
      desc: 'Headlines shouting "EXPOSED!", "SHOCKING TRUTH", or "DOCTORS LIED" to trigger emotional outrage.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      title: 'Unverifiable Anonymous Insiders',
      desc: 'Sweeping national assertions founded entirely on unverifiable, single clandestine sources.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <line x1="18" y1="8" x2="23" y2="13" />
          <line x1="23" y1="8" x2="18" y2="13" />
        </svg>
      ),
    },
    {
      title: 'Missing Date or Masqueraded URL',
      desc: 'Doctored domain names cloning respected institutions (e.g., .co.com) or recycled historical articles.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: 'Absolute Miracle / Danger Claims',
      desc: 'Promises of 100% cure-alls, universal conspiracies, or secret remedies suppressed by authorities.',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="trust-guide-card">
      <div className="guide-header">
        <span className="guide-badge">FACT-CHECKING HANDBOOK</span>
        <h3 className="guide-title">Click or Don't Click: Verification Guide</h3>
        <p className="guide-subtitle">
          Essential heuristic markers to evaluate claim credibility before sharing online content.
        </p>
      </div>

      <div className="guide-columns">
        {/* Safe Signs Column */}
        <div className="guide-column column-safe">
          <div className="column-header">
            <span className="column-icon safe-icon">✓</span>
            <h4 className="column-title">Safe Signs (Trustworthy)</h4>
          </div>
          <div className="guide-list">
            {safePoints.map((item, idx) => (
              <div key={idx} className="guide-item guide-item-safe">
                <div className="guide-item-icon safe-icon-bg">{item.icon}</div>
                <div className="guide-item-content">
                  <h5 className="guide-item-title">{item.title}</h5>
                  <p className="guide-item-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Red Flags Column */}
        <div className="guide-column column-flags">
          <div className="column-header">
            <span className="column-icon flag-icon">⚠</span>
            <h4 className="column-title">Red Flags (Caution)</h4>
          </div>
          <div className="guide-list">
            {redFlags.map((item, idx) => (
              <div key={idx} className="guide-item guide-item-flag">
                <div className="guide-item-icon flag-icon-bg">{item.icon}</div>
                <div className="guide-item-content">
                  <h5 className="guide-item-title">{item.title}</h5>
                  <p className="guide-item-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
