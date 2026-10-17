import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

export default function CountdownPill({ days }) {
  const numDays = Number(days);

  if (isNaN(numDays)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <Calendar className="w-3.5 h-3.5" /> Date pending
      </span>
    );
  }

  if (numDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-500 border border-slate-700">
        Exam concluded
      </span>
    );
  }

  if (numDays === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> EXAM TODAY
      </span>
    );
  }

  if (numDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
        <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} /> {numDays} {numDays === 1 ? 'DAY' : 'DAYS'} LEFT
      </span>
    );
  }

  if (numDays <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <Clock className="w-3.5 h-3.5 text-amber-400" /> {numDays} DAYS LEFT
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {numDays} DAYS LEFT
    </span>
  );
}
