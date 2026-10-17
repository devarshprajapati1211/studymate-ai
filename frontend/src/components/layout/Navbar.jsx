import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-white/5 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg lg:text-xl text-white tracking-tight flex items-center gap-1.5">
              StudyMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 tracking-wider uppercase font-medium">Smart Study Planner</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#priority-engine" className="hover:text-white transition-colors">Priority Engine</a>
          <a href="#preview" className="hover:text-white transition-colors">Dashboard Preview</a>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
            title="Instant access with pre-filled Alex student demo data"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            1-Click Demo
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
