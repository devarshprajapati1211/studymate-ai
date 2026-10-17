import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  RefreshCw,
  Bell,
  ShieldCheck,
  Zap,
  Database,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { loginAsDemo } = useAuth();
  const { addToast } = useToast();

  const [aiStatus, setAiStatus] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [notifications, setNotifications] = useState({
    daily_reminder: true,
    exam_countdown_alerts: true,
    task_reschedule_alert: true,
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await api.getAIStatus();
        setAiStatus(res);
      } catch (e) {
        console.error(e);
      }
    }
    loadStatus();
  }, []);

  const handleResetDemo = async () => {
    setSeeding(true);
    try {
      await loginAsDemo();
      addToast('Demo student profile (Alex) freshly re-seeded!', 'success');
    } catch (e) {
      addToast('Failed to seed demo data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Application Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure AI planner preferences, system diagnostics, and sample college demonstration data.
        </p>
      </div>

      {/* AI Strategy Engine Status Card */}
      <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">AI Engine & Fallback Status</h3>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              aiStatus?.llm_enabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {aiStatus?.llm_enabled ? 'LLM API Connected' : 'Smart Planner Mode Active'}
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            StudyMate AI incorporates a hybrid intelligence architecture.
            Even if an external LLM API key is not supplied in <code className="text-indigo-400 bg-slate-900 px-1 py-0.5 rounded">.env</code>,
            the built-in deterministic Priority Engine calculates exact scores (0–100), generates 7-day adaptive schedules,
            and answers contextual study questions based on real student data.
          </p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{aiStatus?.message || 'Smart Study Planner mode is operational and ready.'}</span>
          </div>
        </div>
      </div>

      {/* Demo Data Management Card */}
      <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Demonstration & Seeding</h3>
        </div>

        <div className="text-xs text-slate-300 space-y-3">
          <p>
            Reset or reload the official college demonstration profile (<strong>Alex Mercer</strong> — DBMS, Python, Computer Networks, AI)
            with pre-computed priority levels and completed task history for presentations.
          </p>

          <button
            onClick={handleResetDemo}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Resetting Demo Data...' : 'Reload Alex Demo Profile'}
          </button>
        </div>
      </div>

      {/* Study Preferences & Notifications */}
      <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Smart Study Reminders</h3>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              id: 'daily_reminder',
              title: 'Daily Study Session Reminder',
              desc: 'Notifies you at your preferred study start time with today’s top-priority subject.',
            },
            {
              id: 'exam_countdown_alerts',
              title: 'Exam Urgency Escalation Alerts',
              desc: 'Automatically boosts subject priority when an exam approaches within 5 days.',
            },
            {
              id: 'task_reschedule_alert',
              title: 'Missed Task Smart Rebalancing',
              desc: 'Offers to redistribute overdue tasks across the next 3 days without burnout.',
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-0.5">
                <span className="font-semibold text-white">{item.title}</span>
                <p className="text-slate-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.id]}
                onChange={(e) =>
                  setNotifications({ ...notifications, [item.id]: e.target.checked })
                }
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer shrink-0 ml-3"
              />
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="text-center text-[11px] text-slate-500 pt-2">
        <span>StudyMate AI Production Release v1.0.0 • Connected to MongoDB (Local) • FastAPI + React 19</span>
      </div>
    </div>
  );
}
