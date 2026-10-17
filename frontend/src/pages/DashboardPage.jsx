import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { api } from '../api/client';
import StatCard from '../components/common/StatCard';
import PriorityBadge from '../components/common/PriorityBadge';
import CountdownPill from '../components/common/CountdownPill';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      addToast('Could not load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId, currentStatus) => {
    setTogglingTaskId(taskId);
    try {
      const newStatus = !currentStatus;
      await api.toggleTaskComplete(taskId, newStatus);

      if (newStatus) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
        addToast('Task completed! Progress updated.', 'success');
      }

      // Re-fetch dashboard stats
      await fetchDashboard();
    } catch (err) {
      addToast('Failed to update task', 'error');
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (loading) {
    return <LoadingState count={4} message="Analyzing priorities and preparing your dashboard..." />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="No dashboard data found"
        description="Configure your subjects and exam schedule to get started."
        actionText="Add Subjects"
        onAction={() => navigate('/subjects')}
      />
    );
  }

  const {
    greeting,
    student_name,
    overall_study_progress,
    today_study_hours,
    subjects_count,
    upcoming_exam,
    today_priority,
    today_tasks = [],
    tasks_completed_count,
    tasks_total_count,
  } = dashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight">
            {greeting}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is your daily study breakdown aligned with upcoming college exam deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/study-plan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Full Weekly Plan
          </Link>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Advice
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Progress"
          value={`${overall_study_progress}%`}
          subtitle="Average syllabus completion"
          icon={CheckCircle2}
          progress={overall_study_progress}
          color="indigo"
        />

        <StatCard
          title="Today's Study Time"
          value={`${today_study_hours.completed} / ${today_study_hours.target} hrs`}
          subtitle={`${Math.round((today_study_hours.completed / Math.max(0.1, today_study_hours.target)) * 100)}% of daily target`}
          icon={Clock}
          progress={(today_study_hours.completed / Math.max(0.1, today_study_hours.target)) * 100}
          color="emerald"
        />

        <StatCard
          title="Active Subjects"
          value={`${subjects_count}`}
          subtitle="Monitored in curriculum"
          icon={BookOpen}
          color="violet"
        />

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closest Exam</span>
            <div className="p-2.5 rounded-xl border bg-rose-500/10 text-rose-400 border-rose-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold font-display text-white truncate">
              {upcoming_exam ? upcoming_exam.name : 'No exams listed'}
            </div>
            <div className="mt-2">
              {upcoming_exam && <CountdownPill days={upcoming_exam.days_remaining} />}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Today's Priority & Today's Study Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Priority Spotlight (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Today's Priority
            </h3>
            {today_priority && (
              <PriorityBadge level={today_priority.priority_level} score={today_priority.priority_score} />
            )}
          </div>

          {today_priority ? (
            <div className="glass-card rounded-2xl p-6 border-indigo-500/20 relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-950">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">High-Impact Target</span>
                <CountdownPill days={today_priority.days_remaining} />
              </div>

              <h4 className="text-2xl font-bold text-white font-display mb-1">{today_priority.subject_name}</h4>
              <p className="text-xs text-slate-400 mb-5">
                Difficulty: <span className="text-slate-200 font-semibold">{today_priority.difficulty}</span>
              </p>

              {/* Progress Slider representation */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>Current Preparation</span>
                  <span className="text-indigo-400 font-bold">{today_priority.preparation_percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${today_priority.preparation_percentage}%` }}
                  />
                </div>
              </div>

              {/* AI Priority Explanation */}
              {today_priority.explanation && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-6 leading-relaxed">
                  <span className="text-indigo-400 font-semibold block mb-0.5">Why this priority?</span>
                  {today_priority.explanation}
                </div>
              )}

              <Link
                to="/tasks"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Studying
              </Link>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs">
              No subjects registered yet.
            </div>
          )}
        </div>

        {/* Right Column: Today's Study Plan Tasks Checklist (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Today's Study Plan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed {tasks_completed_count} of {tasks_total_count} tasks planned for today
              </p>
            </div>

            <Link
              to="/tasks"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              Task View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {today_tasks.length === 0 ? (
            <EmptyState
              title="No tasks scheduled for today"
              description="Click 'Regenerate Plan' to generate personalized study tasks for today based on your exam deadlines."
              actionText="Go to Study Plan"
              onAction={() => navigate('/study-plan')}
            />
          ) : (
            <div className="space-y-3">
              {today_tasks.map((task) => {
                const isCompleted = task.completed;
                const isToggling = togglingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => !isToggling && handleToggleTask(task.id, isCompleted)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group select-none ${
                      isCompleted
                        ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                        : 'glass-card border-slate-800 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <button
                        type="button"
                        disabled={isToggling}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 border border-emerald-500 text-white'
                            : 'border border-slate-600 group-hover:border-indigo-400'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-semibold truncate transition-all ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-indigo-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-300">{task.subject_name}</span>
                          <span>•</span>
                          <span className="text-indigo-400 font-mono">{task.duration_minutes} min</span>
                          <span>•</span>
                          <span className="text-slate-500">{task.learning_mode || 'Concept'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <PriorityBadge level={task.priority} showScore={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
