import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, loginAsDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Account created! Let us set up your student schedule.', 'success');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    try {
      await loginAsDemo();
      addToast('Loaded demo student profile (Alex Mercer)!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

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
          <h2 className="text-2xl font-bold font-display text-white">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">Get your personalized AI study schedule</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">College Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Creating Account...' : 'Continue to Student Setup'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleDemo}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> Or jump straight into the demo with Alex
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
