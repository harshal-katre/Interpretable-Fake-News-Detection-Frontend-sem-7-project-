export default function WordContributions({ explanation }) {
  if (!explanation || explanation.length === 0) return null;

  const fakeWords = explanation
    .filter((e) => e.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const realWords = explanation
    .filter((e) => e.weight < 0)
    .sort((a, b) => a.weight - b.weight); // most negative first

  const maxAbs = Math.max(
    ...explanation.map((e) => Math.abs(e.weight)),
    0.001
  );

  return (
    <div className="word-contributions">
      <div className="contrib-column">
        <h3 className="section-title contrib-title-fake">Pushes toward FAKE</h3>
        {fakeWords.length === 0 && <p className="contrib-empty">None</p>}
        {fakeWords.map((e) => (
          <div key={e.word} className="contrib-row">
            <span className="contrib-word">{e.word}</span>
            <div className="contrib-bar-track">
              <div
                className="contrib-bar-fill contrib-bar-fake"
                style={{ width: `${(Math.abs(e.weight) / maxAbs) * 100}%` }}
              />
            </div>
            <span className="contrib-value">{e.weight.toFixed(4)}</span>
          </div>
        ))}
      </div>

      <div className="contrib-column">
        <h3 className="section-title contrib-title-real">Pushes toward REAL</h3>
        {realWords.length === 0 && <p className="contrib-empty">None</p>}
        {realWords.map((e) => (
          <div key={e.word} className="contrib-row">
            <span className="contrib-word">{e.word}</span>
            <div className="contrib-bar-track">
              <div
                className="contrib-bar-fill contrib-bar-real"
                style={{ width: `${(Math.abs(e.weight) / maxAbs) * 100}%` }}
              />
            </div>
            <span className="contrib-value">{e.weight.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
