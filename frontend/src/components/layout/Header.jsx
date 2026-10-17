import React from 'react';
import { Menu, Calendar, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ onMenuClick, title, subtitle }) {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-white font-display flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{todayFormatted}</span>
        </div>

        <Link
          to="/assistant"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/30 hover:to-violet-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Ask AI</span>
        </Link>
      </div>
    </header>
  );
}
