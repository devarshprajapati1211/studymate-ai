import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export default function StudyPlanPage() {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalanceBanner, setRebalanceBanner] = useState(null);
  const [filterView, setFilterView] = useState('all'); // 'today', 'all', 'upcoming'

  const { addToast } = useToast();

  const fetchPlan = async () => {
    try {
      const data = await api.getStudyPlan();
      setPlanData(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load study plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const updated = await api.regenerateStudyPlan();
      setPlanData(updated);
      addToast('Study plan regenerated based on your remaining days & prep!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to regenerate study plan', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSmartRebalance = async () => {
    setRebalancing(true);
    try {
      const res = await api.rescheduleMissedTasks();
      if (res.status === 'rescheduled') {
        setRebalanceBanner(res.message);
        addToast(res.message, 'success');
        fetchPlan();
      } else {
        addToast('No missed past tasks found! Your schedule is on track.', 'info');
      }
    } catch (err) {
      addToast('Could not rebalance schedule', 'error');
    } finally {
      setRebalancing(false);
    }
  };

  if (loading) {
    return <LoadingState count={3} message="Loading your 7-day adaptive roadmap..." />;
  }

  if (!planData || !planData.schedule || planData.schedule.length === 0) {
    return (
      <EmptyState
        title="No study plan generated yet"
        description="Click below to generate a tailored 7-day study plan."
        actionText="Generate Study Plan"
        onAction={handleRegenerate}
      />
    );
  }

  const { ai_summary, recommendation, is_fallback_mode, schedule, daily_hours, total_tasks, completed_tasks } = planData;
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter schedule days
  const displayedSchedule = schedule.filter((day) => {
    if (filterView === 'today') {
      return day.date === todayStr;
    } else if (filterView === 'upcoming') {
      return day.date > todayStr;
    }
    return true; // 'all' (This Week)
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">7-Day Study Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">
            Allocates {daily_hours} hours/day with weighted focus on your closest high-difficulty examinations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSmartRebalance}
            disabled={rebalancing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-amber-300 border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer"
            title="Redistribute missed tasks from past days"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rebalancing ? 'animate-spin' : ''}`} />
            Rebalance Missed Tasks
          </button>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Recalculating Plan...' : 'Regenerate My Plan'}
          </button>
        </div>
      </div>

      {/* Smart Plan Adjustment Alert Banner */}
      {rebalanceBanner && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-300">Schedule Updated by AI</span>
            <p className="mt-0.5 leading-relaxed">{rebalanceBanner}</p>
          </div>
        </div>
      )}

      {/* AI Strategy Summary Card */}
      <div className="glass-card rounded-2xl p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900/60 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                AI Schedule Analysis & Recommendation
              </span>
              {is_fallback_mode ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Deterministic Priority Mode
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  LLM Enhanced
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">{ai_summary}</p>
            <p className="text-xs text-slate-300/80 leading-relaxed pt-1">{recommendation}</p>
          </div>
        </div>
      </div>

      {/* View Filter Tabs: Today / This Week / Upcoming */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setFilterView('all')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterView === 'all'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          This Week (7 Days)
        </button>
        <button
          onClick={() => setFilterView('today')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterView === 'today'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Today Only
        </button>
        <button
          onClick={() => setFilterView('upcoming')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterView === 'upcoming'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming Days
        </button>
      </div>

      {/* Daily Roadmap Schedule Cards */}
      <div className="space-y-4">
        {displayedSchedule.map((day, idx) => {
          const isToday = day.date === todayStr;
          const totalHours = (day.total_minutes / 60).toFixed(1);

          return (
            <div
              key={day.date}
              className={`rounded-2xl p-5 border transition-all ${
                isToday
                  ? 'glass-card border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 to-slate-900 shadow-lg shadow-indigo-950/30'
                  : 'glass-card border-slate-800/80'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/70">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {day.day_name}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{day.date}</span>
                  {isToday && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-200">{totalHours} hrs</span>
                  <span className="text-slate-500 font-normal">({day.tasks.length} tasks)</span>
                </div>
              </div>

              {/* Tasks for the Day */}
              {day.tasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No tasks scheduled for this day.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {day.tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        t.completed
                          ? 'bg-slate-900/30 border-slate-800 text-slate-500'
                          : 'bg-slate-900/70 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-400">{t.subject_name}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[11px] text-slate-400">{t.duration_minutes} min</span>
                        </div>
                        <p className={`text-xs font-medium truncate ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.title}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <PriorityBadge level={t.priority} showScore={false} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
