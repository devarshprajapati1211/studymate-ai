import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  color = 'indigo',
}) {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      bar: 'bg-indigo-500',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      bar: 'bg-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      bar: 'bg-amber-500',
    },
    rose: {
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      bar: 'bg-rose-500',
    },
    violet: {
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      bar: 'bg-violet-500',
    }
  }[color] || {
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    bar: 'bg-indigo-500',
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg} transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-2xl lg:text-3xl font-bold font-display text-white mb-1 tracking-tight">
        {value}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Progress</span>
            <span className="text-slate-200">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colorStyles.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
