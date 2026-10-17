import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  BarChart3,
  Bot,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 lg:px-8 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Study Planner for College Students</span>
          </div>

          {/* Hero Tagline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Study smarter.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400">
              Plan better.
            </span>{' '}
            Achieve more.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            StudyMate AI creates personalized, realistic study plans based on your upcoming exams, subjects, difficulty levels, and available daily hours.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Create My Study Plan
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={handleDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl glass-card text-slate-200 hover:text-white hover:border-indigo-500/50 font-medium text-base transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              1-Click Demo (Alex)
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              Explore Features
            </a>
          </div>

          {/* Micro social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exam Countdown Engine
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart Plan Rebalancing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Study Assistant
            </span>
          </div>
        </div>

        {/* Visual Dashboard Preview Mockup */}
        <div id="preview" className="max-w-6xl mx-auto mt-16 relative">
          <div className="rounded-3xl p-3 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-slate-900/60 border border-white/10 shadow-2xl shadow-indigo-950/50">
            <div className="rounded-2xl glass-panel p-6 overflow-hidden">
              {/* Fake Dashboard Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Good Morning, Alex 👋</h3>
                  <p className="text-xs text-slate-400">Semester VI Examination Roadmap Active</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                    🔴 DBMS Exam in 5 Days
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    Streak: 5 Days 🔥
                  </span>
                </div>
              </div>

              {/* Fake Dashboard Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Overall Prep</span>
                  <p className="text-2xl font-bold text-white font-display mt-1">68%</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[68%]" />
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Today's Study</span>
                  <p className="text-2xl font-bold text-emerald-400 font-display mt-1">2.5 / 3 hrs</p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[83%]" />
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Registered Subjects</span>
                  <p className="text-2xl font-bold text-white font-display mt-1">4 Active</p>
                  <p className="text-[10px] text-slate-500 mt-1">DBMS, Python, CN, AI</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Top Priority</span>
                  <p className="text-2xl font-bold text-rose-400 font-display mt-1">DBMS (91)</p>
                  <p className="text-[10px] text-rose-300/80 mt-1">Exam in 5 days • 45% prep</p>
                </div>
              </div>

              {/* Fake Tasks sample */}
              <div className="mt-6 glass-card p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today's Study Checklist</span>
                  <span className="text-xs text-indigo-400 font-medium">3 of 4 Completed</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-slate-400 line-through">
                      <span className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[10px]">✓</span>
                      <span>DBMS — SQL Joins & Subqueries Practice</span>
                    </div>
                    <span className="text-slate-500">45 min</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-slate-200">
                    <div className="flex items-center gap-2.5 font-medium">
                      <span className="w-4 h-4 rounded-md border border-indigo-400 flex items-center justify-center" />
                      <span>DBMS — Transactions & ACID Properties Concept Revision</span>
                    </div>
                    <span className="text-indigo-300 font-semibold">60 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8 border-t border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Step-by-Step</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
              How StudyMate AI Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
              Simple 4-phase workflow engineered to transform exam stress into predictable academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Student Input',
                desc: 'Add your semester subjects, difficulty levels, target exam dates, and daily study availability.',
                icon: Calendar,
              },
              {
                step: '02',
                title: 'AI Priority Analysis',
                desc: 'Deterministic smart algorithm scores every subject (0–100) based on days left, prep deficit, and importance.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Adaptive Study Plan',
                desc: 'Receive a personalized 7-day schedule with balanced time chunks, concept revisions, and PYQ mock tests.',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Track & Rebalance',
                desc: 'Check off completed tasks. If you ever miss a session, AI dynamically redistributes the workload without stress.',
                icon: BarChart3,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-card rounded-2xl p-6 relative group hover:border-indigo-500/40">
                  <span className="text-3xl font-black text-slate-800 group-hover:text-indigo-500/30 transition-colors font-display block mb-3">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 lg:px-8 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Intelligent Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-2">
              Everything College Students Need
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-3">
              Designed specifically for engineering and college curricula with rigorous deadline management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Personalized Planning</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AI customizes daily study time blocks based on your preferred learning style (Reading, Videos, Practice, or Mixed) and daily available hours.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Smart Priorities Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Subjects with closer exams, higher difficulty, and low preparation automatically rise to the top with clear HIGH 🔴, MEDIUM 🟠, and LOW 🟢 indicators.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Daily Execution & Checklist</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Converts multi-week semester plans into actionable 30–60 minute study sprints with real-time checkbox progress tracking.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Visual Progress Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive Recharts charts for subject-wise preparation %, weekly study hours logged, task completion rates, and daily study streaks.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">AI Study Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ask questions like "What should I study today?" or "I only have 1 hour today" and receive grounded answers based on your actual subjects.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">Smart Plan Rebalancing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Missed a study session yesterday? Rather than discarding it, the AI gracefully redistributes missed hours across upcoming days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 px-4 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 lg:p-14 bg-gradient-to-r from-indigo-900/60 via-indigo-950/80 to-slate-900 border border-indigo-500/30 text-center relative z-10 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-4">
            Ready to master your upcoming exams?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create your account in seconds, add your subjects, and let StudyMate AI build your personalized roadmap.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemo}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              Explore Alex's Demo Profile
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-400">StudyMate AI</span>
            <span>— Study smarter. Plan better. Achieve more.</span>
          </div>
          <p>© 2026 StudyMate AI. Built for College Students.</p>
        </div>
      </footer>
    </div>
  );
}
