import React from 'react';

export default function PriorityBadge({ level = 'MEDIUM', score, showScore = true }) {
  const normalized = String(level).toUpperCase();

  let colors = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  let dotColor = 'bg-amber-400';
  let label = 'MEDIUM';

  if (normalized === 'HIGH' || score >= 70) {
    colors = 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-950/40';
    dotColor = 'bg-rose-500';
    label = 'HIGH';
  } else if (normalized === 'LOW' || (score !== undefined && score < 40)) {
    colors = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
    label = 'LOW';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase transition-all ${colors}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono text-[11px] ml-0.5">({score}/100)</span>
      )}
    </span>
  );
}
