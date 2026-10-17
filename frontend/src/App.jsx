import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';

// Dashboard layout & pages
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import MySubjectsPage from './pages/MySubjectsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import TodaysTasksPage from './pages/TodaysTasksPage';
import ProgressPage from './pages/ProgressPage';
import AIAssistantPage from './pages/AIAssistantPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-indigo-400">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-sm font-semibold">Loading StudyMate AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Protected App Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/subjects" element={<MySubjectsPage />} />
              <Route path="/study-plan" element={<StudyPlanPage />} />
              <Route path="/tasks" element={<TodaysTasksPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/assistant" element={<AIAssistantPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
