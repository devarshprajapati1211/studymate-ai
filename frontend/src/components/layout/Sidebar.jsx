import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  BarChart3,
  Bot,
  User,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Study Plan', path: '/study-plan', icon: Calendar },
    { name: "Today's Tasks", path: '/tasks', icon: CheckSquare },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'AI Study Assistant', path: '/assistant', icon: Bot, isAi: true },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                StudyMate <span className="text-indigo-400">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Student Hub</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Study Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.isAi && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* AI Mode Banner */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Strategy Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Personalized exam countdowns & smart priority scoring active.
          </p>
        </div>

        {/* Student Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'student@studymate.ai'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
