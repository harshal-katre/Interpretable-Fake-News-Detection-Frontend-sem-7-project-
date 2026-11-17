import { useState, useRef } from 'react';

export default function NetworkIllustration() {
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    setShift({ x, y });
  };

  const handleMouseLeave = () => {
    setShift({ x: 0, y: 0 });
  };

  // Fixed graph nodes with coordinates
  const nodes = [
    { id: 1, cx: 60, cy: 70, r: 5, color: 'var(--accent-green)', pulseDelay: '0s' },
    { id: 2, cx: 140, cy: 40, r: 7, color: 'var(--accent-purple)', pulseDelay: '0.8s' },
    { id: 3, cx: 220, cy: 80, r: 6, color: 'var(--accent-green)', pulseDelay: '1.6s' },
    { id: 4, cx: 100, cy: 130, r: 8, color: 'var(--accent-violet)', pulseDelay: '0.4s' },
    { id: 5, cx: 180, cy: 150, r: 5.5, color: 'var(--accent-green)', pulseDelay: '1.2s' },
    { id: 6, cx: 250, cy: 130, r: 7, color: 'var(--accent-purple)', pulseDelay: '2.0s' },
    { id: 7, cx: 50, cy: 180, r: 4.5, color: 'var(--accent-green)', pulseDelay: '0.6s' },
    { id: 8, cx: 130, cy: 210, r: 6.5, color: 'var(--accent-purple)', pulseDelay: '1.4s' },
    { id: 9, cx: 210, cy: 200, r: 5, color: 'var(--accent-green)', pulseDelay: '1.8s' },
  ];

  // Connections between nodes
  const edges = [
    [1, 2], [1, 4], [2, 3], [2, 4], [3, 5], [3, 6],
    [4, 5], [4, 7], [4, 8], [5, 6], [5, 8], [5, 9],
    [6, 9], [7, 8], [8, 9]
  ];

  return (
    <div
      ref={containerRef}
      className="network-illustration-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="network-canvas-wrapper"
        style={{
          transform: `translate(${shift.x.toFixed(2)}px, ${shift.y.toFixed(2)}px)`,
          transition: 'transform 200ms ease-out',
        }}
      >
        <svg
          viewBox="0 0 300 250"
          className="network-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="nodeGlowGreen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="nodeGlowPurple" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Connected edges */}
          {edges.map(([fromId, toId], idx) => {
            const fromNode = nodes.find((n) => n.id === fromId);
            const toNode = nodes.find((n) => n.id === toId);
            return (
              <line
                key={idx}
                x1={fromNode.cx}
                y1={fromNode.cy}
                x2={toNode.cx}
                y2={toNode.cy}
                stroke="url(#edgeGrad)"
                strokeWidth="1.2"
                className="network-edge"
              />
            );
          })}

          {/* Network Nodes with Pulsing Rings */}
          {nodes.map((node) => (
            <g key={node.id} className="node-group">
              {/* Outer Pulse Halo */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 2.8}
                fill={node.color === 'var(--accent-green)' ? 'url(#nodeGlowGreen)' : 'url(#nodeGlowPurple)'}
                className="node-pulse"
                style={{ animationDelay: node.pulseDelay }}
              />
              {/* Core Node */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill={node.color}
                filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
