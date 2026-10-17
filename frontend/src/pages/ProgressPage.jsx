import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import StatCard from '../components/common/StatCard';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingState from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.getProgress();
        setData(res);
      } catch (err) {
        console.error(err);
        addToast('Failed to load progress analytics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return <LoadingState count={4} message="Crunching study metrics and chart data..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-400">
        No progress data available yet. Complete tasks to generate your charts!
      </div>
    );
  }

  const {
    overall_progress_percentage,
    completed_tasks_count,
    pending_tasks_count,
    total_tasks_count,
    completion_rate_percentage,
    weekly_study_hours,
    streak_days,
    subject_progress = [],
    weekly_hours_chart = [],
    efficiency_rating,
  } = data;

  const getBarColor = (score) => {
    if (score >= 70) return '#10b981'; // emerald
    if (score >= 40) return '#f59e0b'; // amber
    return '#6366f1'; // indigo
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Progress & Academic Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your study consistency, topic completion rates, and weekly hours distribution.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Preparation"
          value={`${overall_progress_percentage}%`}
          subtitle="Curriculum average"
          icon={TrendingUp}
          progress={overall_progress_percentage}
          color="indigo"
        />

        <StatCard
          title="Study Streak"
          value={`${streak_days} Days 🔥`}
          subtitle="Consecutive daily study"
          icon={Flame}
          color="amber"
        />

        <StatCard
          title="Tasks Completed"
          value={`${completed_tasks_count} / ${total_tasks_count}`}
          subtitle={`${completion_rate_percentage}% completion rate`}
          icon={CheckCircle2}
          progress={completion_rate_percentage}
          color="emerald"
        />

        <StatCard
          title="Weekly Study Time"
          value={`${weekly_study_hours} hrs`}
          subtitle={`Efficiency: ${efficiency_rating}`}
          icon={Clock}
          color="violet"
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject Preparation Level */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Subject Preparation %</h3>
              <p className="text-xs text-slate-400">Current self-assessed and task-weighted readiness</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
              Target: 100%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subject_progress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="subject_name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#818cf8' }}
                  formatter={(val) => [`${val}%`, 'Preparation Level']}
                />
                <Bar dataKey="preparation_percentage" radius={[6, 6, 0, 0]}>
                  {subject_progress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.preparation_percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Study Hours Area Chart */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Weekly Study Hours</h3>
              <p className="text-xs text-slate-400">Planned vs completed study time per day</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly_hours_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="planned_hours"
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPlanned)"
                  name="Planned Hours"
                />
                <Area
                  type="monotone"
                  dataKey="completed_hours"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Completed Hours"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress Bars List (as specified in prompt) */}
      <div className="glass-card rounded-2xl p-6 border-slate-800">
        <h3 className="text-base font-bold text-white font-display mb-4">Subject-Wise Breakdown</h3>
        <div className="space-y-4">
          {subject_progress.map((s) => (
            <div key={s.subject_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <span className="w-28 sm:w-36 truncate">{s.subject_name}</span>
                  <PriorityBadge level={s.priority_level} score={s.priority_score} showScore={false} />
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{s.exam_countdown} days left</span>
                  <span>{s.completed_tasks} / {s.total_tasks} tasks</span>
                  <span className="font-bold text-white font-mono w-10 text-right">
                    {s.preparation_percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with modern gradient */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    s.preparation_percentage >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : s.preparation_percentage >= 40
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-indigo-500'
                  }`}
                  style={{ width: `${s.preparation_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
