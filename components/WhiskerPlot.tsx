import React from 'react';

interface WhiskerStats {
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  count: number;
}

export const WhiskerPlot: React.FC<{ stats: WhiskerStats; label: string; color: string }> = ({ stats, label, color }) => {
  if (stats.count === 0) return null;

  const width = 300;
  const height = 60;
  const padding = 20;
  
  // Scale based on max time found in session (let's assume 120s is safe max for scaling, or dynamic)
  const maxScale = Math.max(120, stats.max + 10);
  const scale = (val: number) => padding + (val / maxScale) * (width - 2 * padding);

  const minX = scale(stats.min);
  const maxX = scale(stats.max);
  const meanX = scale(stats.mean);
  const sdLeft = scale(Math.max(0, stats.mean - stats.stdDev));
  const sdRight = scale(Math.min(maxScale, stats.mean + stats.stdDev));

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-slate-400 mb-1 px-1">
        <span className="font-bold" style={{ color }}>{label}</span>
        <span>Avg: {stats.mean.toFixed(1)}s • Min: {stats.min}s • Max: {stats.max}s</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-slate-900/50 rounded-lg border border-slate-800">
        {/* Main whisker line */}
        <line x1={minX} y1={height / 2} x2={maxX} y2={height / 2} stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Min/Max T-bars */}
        <line x1={minX} y1={height / 2 - 8} x2={minX} y2={height / 2 + 8} stroke="#94a3b8" strokeWidth="2" />
        <line x1={maxX} y1={height / 2 - 8} x2={maxX} y2={height / 2 + 8} stroke="#94a3b8" strokeWidth="2" />

        {/* SD Range Box */}
        <rect x={sdLeft} y={height / 2 - 12} width={sdRight - sdLeft} height="24" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />

        {/* Mean Marker */}
        <line x1={meanX} y1={height / 2 - 15} x2={meanX} y2={height / 2 + 15} stroke={color} strokeWidth="4" />
        
        {/* Labels for ticks */}
        <text x={minX} y={height - 5} fontSize="8" fill="#94a3b8" textAnchor="middle">{stats.min}s</text>
        <text x={maxX} y={height - 5} fontSize="8" fill="#94a3b8" textAnchor="middle">{stats.max}s</text>
        <text x={meanX} y={12} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">{stats.mean.toFixed(1)}s</text>
      </svg>
    </div>
  );
};