import { useState, useRef, useEffect } from 'react';
import { sampleModelScores, sampleTrainingTrajectory } from '../data/sampleMetrics';

export default function InteractiveCharts() {
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredEpochPoint, setHoveredEpochPoint] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLineHovered, setIsLineHovered] = useState(false);
  const [animated, setAnimated] = useState(false);
  const lineSvgRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Line chart coordinates calculation
  // SVG dimensions: 480 x 220, padding: left 45, right 25, top 30, bottom 40
  const svgWidth = 460;
  const svgHeight = 220;
  const padding = { left: 45, right: 25, top: 30, bottom: 40 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const minAcc = 0.5;
  const maxAcc = 1.0;

  const points = sampleTrainingTrajectory.map((pt, idx) => {
    const x = padding.left + (idx / (sampleTrainingTrajectory.length - 1)) * plotWidth;
    const y = padding.top + (1 - (pt.acc - minAcc) / (maxAcc - minAcc)) * plotHeight;
    return { ...pt, x, y };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

  // Line chart mouse move handler
  const handleLineMouseMove = (e) => {
    if (!lineSvgRef.current) return;
    const rect = lineSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Find nearest point along x
    let nearest = points[0];
    let minDistance = Math.abs(clientX - points[0].x);

    points.forEach((pt) => {
      const dist = Math.abs(clientX - pt.x);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = pt;
      }
    });

    setHoveredEpochPoint(nearest);
    setMousePos({ x: clientX, y: clientY });
    setIsLineHovered(true);
  };

  const handleLineMouseLeave = () => {
    setIsLineHovered(false);
    setHoveredEpochPoint(null);
  };

  return (
    <section className="interactive-charts-card">
      <div className="charts-header">
        <div className="charts-title-group">
          <span className="charts-badge">EVALUATION METRICS</span>
          <h3 className="charts-title">Model Performance & Learning Trajectory</h3>
        </div>
        <span className="sample-data-tag">Sample data. Real results appear after training</span>
      </div>

      <div className="charts-grid">
        {/* Bar Chart: 5 Scores */}
        <div className="chart-wrapper">
          <div className="chart-top-bar">
            <span className="chart-name">Baseline Multi-Metric Comparison</span>
            <span className="chart-subtag">Sample data. Real results appear after training</span>
          </div>

          <div className="bar-chart-container">
            <svg
              className="chart-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Horizontal Grid lines */}
              {[0.6, 0.7, 0.8, 0.9, 1.0].map((val) => {
                const y = padding.top + (1 - (val - 0.5) / 0.5) * plotHeight;
                return (
                  <g key={val} className="chart-grid-line">
                    <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                    <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="10">
                      {(val * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {sampleModelScores.map((item, idx) => {
                const barWidth = 44;
                const totalBars = sampleModelScores.length;
                const slotWidth = plotWidth / totalBars;
                const x = padding.left + idx * slotWidth + (slotWidth - barWidth) / 2;
                const barHeight = ((item.score - 0.5) / 0.5) * plotHeight;
                const targetY = padding.top + (plotHeight - barHeight);
                const isHovered = hoveredBarIndex === idx;
                const hasHover = hoveredBarIndex !== null;

                return (
                  <g
                    key={item.metric}
                    className={`bar-group ${isHovered ? 'bar-hovered' : ''} ${hasHover && !isHovered ? 'bar-dimmed' : ''}`}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <defs>
                      <linearGradient id={`barGrad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-green)" />
                        <stop offset="100%" stopColor="var(--accent-purple)" />
                      </linearGradient>
                    </defs>

                    {/* Bar Rectangle */}
                    <rect
                      x={x}
                      y={animated ? targetY : padding.top + plotHeight}
                      width={barWidth}
                      height={animated ? barHeight : 0}
                      rx="6"
                      fill={`url(#barGrad-${idx})`}
                      className="metric-bar"
                      style={{
                        transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        filter: isHovered
                          ? 'drop-shadow(0 0 16px rgba(124, 255, 178, 0.8))'
                          : 'drop-shadow(0 4px 10px rgba(124, 255, 178, 0.25))',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                      }}
                    />

                    {/* Metric Label */}
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'}
                      fontSize="11"
                      fontWeight="600"
                    >
                      {item.metric}
                    </text>

                    {/* Score value above bar */}
                    {animated && (
                      <text
                        x={x + barWidth / 2}
                        y={targetY - 8}
                        textAnchor="middle"
                        fill="var(--accent-green)"
                        fontSize="11"
                        fontWeight="700"
                        opacity={isHovered ? 1 : 0.85}
                      >
                        {item.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Tooltip */}
            {hoveredBarIndex !== null && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${padding.left + (hoveredBarIndex + 0.5) * (plotWidth / 5)}px`,
                  top: '18px',
                }}
              >
                <div className="tooltip-title">{sampleModelScores[hoveredBarIndex].metric}</div>
                <div className="tooltip-value">Score: {sampleModelScores[hoveredBarIndex].label}</div>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart: Training Accuracy across 10 Epochs */}
        <div className="chart-wrapper">
          <div className="chart-top-bar">
            <span className="chart-name">Training Convergence (10 Epochs)</span>
            <span className="chart-subtag">Sample data. Real results appear after training</span>
          </div>

          <div className="line-chart-container" onMouseMove={handleLineMouseMove} onMouseLeave={handleLineMouseLeave}>
            <svg
              ref={lineSvgRef}
              className="chart-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent-purple)" />
                  <stop offset="100%" stopColor="var(--accent-green)" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0.6, 0.7, 0.8, 0.9, 1.0].map((val) => {
                const y = padding.top + (1 - (val - 0.5) / 0.5) * plotHeight;
                return (
                  <g key={val} className="chart-grid-line">
                    <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                    <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="10">
                      {(val * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Bottom Epoch Labels */}
              {points.map((pt) => (
                <text
                  key={pt.epoch}
                  x={pt.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="var(--text-tertiary)"
                  fontSize="10"
                >
                  e{pt.epoch}
                </text>
              ))}

              {/* Area Gradient */}
              <path
                d={areaD}
                fill="url(#areaGrad)"
                opacity={animated ? 1 : 0}
                style={{ transition: 'opacity 800ms ease' }}
              />

              {/* Self-drawing line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`training-line ${isLineHovered ? 'line-glowing' : ''}`}
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: animated ? 0 : 800,
                  transition: 'stroke-dashoffset 850ms cubic-bezier(0.25, 1, 0.5, 1)',
                  filter: isLineHovered
                    ? 'drop-shadow(0 0 10px rgba(124, 255, 178, 0.85))'
                    : 'drop-shadow(0 2px 6px rgba(183, 148, 255, 0.35))',
                }}
              />

              {/* Data points */}
              {animated &&
                points.map((pt) => {
                  const isSnapped = hoveredEpochPoint && hoveredEpochPoint.epoch === pt.epoch;
                  return (
                    <circle
                      key={pt.epoch}
                      cx={pt.x}
                      cy={pt.y}
                      r={isSnapped ? 6 : 3.5}
                      fill={isSnapped ? 'var(--accent-green)' : 'var(--bg-base)'}
                      stroke={isSnapped ? '#ffffff' : 'var(--accent-purple)'}
                      strokeWidth={isSnapped ? 2.5 : 2}
                      style={{
                        transition: 'all 200ms ease',
                        filter: isSnapped ? 'drop-shadow(0 0 8px var(--accent-green))' : 'none',
                      }}
                    />
                  );
                })}

              {/* Vertical Guide Line */}
              {hoveredEpochPoint && (
                <line
                  x1={hoveredEpochPoint.x}
                  y1={padding.top}
                  x2={hoveredEpochPoint.x}
                  y2={padding.top + plotHeight}
                  stroke="rgba(124, 255, 178, 0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* Interactive Tooltip */}
            {hoveredEpochPoint && (
              <div
                className="chart-tooltip line-tooltip"
                style={{
                  left: `${hoveredEpochPoint.x}px`,
                  top: `${Math.max(hoveredEpochPoint.y - 42, 10)}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="tooltip-title">Epoch {hoveredEpochPoint.epoch}</div>
                <div className="tooltip-value">Accuracy: {(hoveredEpochPoint.acc * 100).toFixed(1)}%</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
