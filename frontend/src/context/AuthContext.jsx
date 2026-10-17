import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('studymate_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studymate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('studymate_onboarded') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
          setIsOnboarded(me.is_onboarded);
          localStorage.setItem('studymate_user', JSON.stringify(me));
          localStorage.setItem('studymate_onboarded', String(me.is_onboarded));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const saveAuthSession = (data) => {
    localStorage.setItem('studymate_token', data.access_token);
    localStorage.setItem('studymate_user', JSON.stringify(data.user));
    localStorage.setItem('studymate_onboarded', String(data.is_onboarded));
    setToken(data.access_token);
    setUser(data.user);
    setIsOnboarded(data.is_onboarded);
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    saveAuthSession(res);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    saveAuthSession(res);
    return res;
  };

  const loginAsDemo = async () => {
    const res = await api.seedDemo();
    saveAuthSession(res);
    return res;
  };

  const markOnboarded = () => {
    setIsOnboarded(true);
    localStorage.setItem('studymate_onboarded', 'true');
    if (user) {
      const updated = { ...user, is_onboarded: true };
      setUser(updated);
      localStorage.setItem('studymate_user', JSON.stringify(updated));
    }
  };

  const logout = () => {
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_user');
    localStorage.removeItem('studymate_onboarded');
    setToken(null);
    setUser(null);
    setIsOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isOnboarded,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        loginAsDemo,
        markOnboarded,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
