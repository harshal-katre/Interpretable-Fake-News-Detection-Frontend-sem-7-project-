/**
 * Highlight helpers — word matching and color scaling.
 */

/**
 * Build a lookup map from explanation words to their weights.
 * Keys are lowercased for case-insensitive matching.
 */
export function buildHighlightMap(explanation) {
  const map = {};
  for (const entry of explanation) {
    map[entry.word.toLowerCase()] = entry;
  }
  return map;
}

/**
 * Returns glowing styling and tooltip for a highlighted word in dark mode.
 * Coral-Red (#FF4D6D) = pushes toward fake (positive weight).
 * Mint-Cyan (#2DE2C4) = pushes toward real (negative weight).
 * Glowing intensity & opacity scale with |weight| / maxAbsWeight.
 */
export function getWordColor(weight, maxAbsWeight) {
  const ratio = Math.min(Math.abs(weight) / maxAbsWeight, 1);
  const alpha = 0.14 + ratio * 0.45;
  const direction = weight > 0 ? 'fake' : 'real';

  const isFake = weight > 0;
  const rgb = isFake ? '255, 77, 109' : '45, 226, 196';

  const backgroundColor = `rgba(${rgb}, ${alpha})`;
  const boxShadow = `0 0 ${Math.round(8 + ratio * 12)}px rgba(${rgb}, ${0.3 + ratio * 0.45})`;
  const border = `1px solid rgba(${rgb}, ${0.35 + ratio * 0.5})`;
  const color = isFake ? '#FFCAD4' : '#C2FBF3';

  const tooltip = `${weight > 0 ? '+' : ''}${weight.toFixed(4)} (toward ${direction.toUpperCase()})`;

  return { backgroundColor, boxShadow, border, color, tooltip };
}
