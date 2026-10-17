import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  icon: Icon = Sparkles,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 lg:p-12 text-center rounded-2xl glass-card border border-dashed border-slate-700/60 my-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-950/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
