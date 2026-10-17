import React from 'react';

export default function LoadingState({ count = 3, message = 'Loading StudyMate data...' }) {
  return (
    <div className="w-full space-y-4 py-6">
      <div className="flex items-center gap-3 text-sm text-indigo-400 font-medium">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
        <span>{message}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 space-y-3 animate-pulse">
            <div className="w-1/3 h-4 bg-slate-800 rounded-md" />
            <div className="w-3/4 h-8 bg-slate-700/60 rounded-lg" />
            <div className="w-1/2 h-3 bg-slate-800 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
