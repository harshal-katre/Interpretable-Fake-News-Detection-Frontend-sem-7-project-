import { buildHighlightMap, getWordColor } from '../utils/highlight';

export default function HighlightedText({ text, explanation }) {
  const highlightMap = buildHighlightMap(explanation);
  const maxAbsWeight = Math.max(
    ...explanation.map((e) => Math.abs(e.weight)),
    0.001 // avoid division by zero
  );

  // Split text into words while keeping separators (spaces, punctuation)
  const tokens = text.split(/(\s+)/);

  return (
    <div className="highlighted-text">
      <h3 className="section-title">Text Analysis</h3>
      <p className="highlighted-paragraph">
        {tokens.map((token, i) => {
          // Strip surrounding punctuation to match against explanation words
          const stripped = token.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
          const key = stripped.toLowerCase();
          const entry = highlightMap[key];

          if (!entry || !stripped) {
            return <span key={i}>{token}</span>;
          }

          const { backgroundColor, boxShadow, border, color, tooltip } = getWordColor(
            entry.weight,
            maxAbsWeight
          );

          return (
            <span
              key={i}
              className="highlighted-word"
              style={{ backgroundColor, boxShadow, border, color }}
              title={tooltip}
            >
              {token}
            </span>
          );
        })}
      </p>
    </div>
  );
}
