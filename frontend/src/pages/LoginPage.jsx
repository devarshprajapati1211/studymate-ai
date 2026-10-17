import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginAsDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      addToast('Welcome back to StudyMate AI!', 'success');
      if (res.is_onboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await loginAsDemo();
      addToast('Loaded demo student profile (Alex Mercer)!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not load demo profile');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 group z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            StudyMate <span className="text-indigo-400">AI</span>
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-white">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to resume your study schedule</p>
        </div>

        {/* 1-Click Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 hover:border-indigo-500/80 text-indigo-300 font-semibold text-xs shadow-md transition-all mb-6 cursor-pointer group"
        >
          <Zap className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          {demoLoading ? 'Seeding Demo Profile...' : '1-Click Demo Login (Alex — DBMS in 5 days)'}
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 font-medium absolute uppercase tracking-wider">
            Or sign in with email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
