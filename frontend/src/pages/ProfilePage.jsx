import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/common/LoadingState';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    college: '',
    degree: '',
    branch: '',
    year: '',
    available_hours: 3.0,
    preferred_start_time: '09:00',
    preferred_end_time: '21:00',
    preferred_break_duration: 15,
    learning_preference: 'Mixed',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        addToast('Failed to load profile details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      if (user) {
        setUser({ ...user, name: updated.name });
      }
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState count={3} message="Retrieving student profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Student Profile</h2>
        <p className="text-xs text-slate-400 mt-1">
          Update your college details and daily study availability.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academics Card */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Academic Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Student Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">College / University</label>
              <input
                type="text"
                value={profile.college}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Degree</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Branch / Major</label>
              <input
                type="text"
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={profile.year}
                onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Timing Card */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Daily Study Availability</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Target Hours / Day: <span className="text-indigo-400 font-bold">{profile.available_hours} hrs</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={profile.available_hours}
                onChange={(e) => setProfile({ ...profile, available_hours: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Break Duration</label>
              <select
                value={profile.preferred_break_duration}
                onChange={(e) => setProfile({ ...profile, preferred_break_duration: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Start Time</label>
              <input
                type="time"
                value={profile.preferred_start_time}
                onChange={(e) => setProfile({ ...profile, preferred_start_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred End Time</label>
              <input
                type="time"
                value={profile.preferred_end_time}
                onChange={(e) => setProfile({ ...profile, preferred_end_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Learning Preferences Card */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Learning Preference</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Mixed', 'Practice', 'Reading', 'Videos'].map((style) => (
              <div
                key={style}
                onClick={() => setProfile({ ...profile, learning_preference: style })}
                className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                  profile.learning_preference === style
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-md shadow-indigo-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs">{style}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
