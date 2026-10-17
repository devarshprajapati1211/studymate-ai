import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Personalized study progress & today’s roadmap' };
      case '/subjects':
        return { title: 'My Subjects', subtitle: 'Track syllabus, exam countdowns & smart priority levels' };
      case '/study-plan':
        return { title: 'Study Plan', subtitle: '7-day adaptive roadmap tailored to your exams' };
      case '/tasks':
        return { title: "Today's Tasks", subtitle: 'Execute and check off your daily study schedule' };
      case '/progress':
        return { title: 'Progress & Analytics', subtitle: 'Visualize study hours, streaks & completion rates' };
      case '/assistant':
        return { title: 'AI Study Assistant', subtitle: 'Instant schedule advice grounded in your real academic data' };
      case '/profile':
        return { title: 'Student Profile', subtitle: 'Manage your academic details & study availability' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Configure study preferences, AI engine & demo data' };
      default:
        return { title: 'StudyMate AI', subtitle: 'Study smarter. Plan better. Achieve more.' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
