import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OnboardingPage() {
  const { user, markOnboarded } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Academics
  const [academics, setAcademics] = useState({
    name: user?.name || '',
    college: 'Apex Institute of Technology',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
  });

  // Step 2: Subjects
  const todayDefault = new Date();
  const defaultExamDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [subjects, setSubjects] = useState([
    {
      name: 'DBMS',
      difficulty: 'Hard',
      exam_date: defaultExamDate(5),
      preparation_percentage: 45,
      importance: 'High',
    },
    {
      name: 'Python',
      difficulty: 'Medium',
      exam_date: defaultExamDate(10),
      preparation_percentage: 65,
      importance: 'Medium',
    },
    {
      name: 'Computer Networks',
      difficulty: 'Hard',
      exam_date: defaultExamDate(12),
      preparation_percentage: 50,
      importance: 'High',
    },
  ]);

  // Step 3: Availability
  const [availability, setAvailability] = useState({
    available_hours: 3.0,
    preferred_start_time: '09:00',
    preferred_end_time: '21:00',
    preferred_break_duration: 15,
  });

  // Step 4: Learning Preference
  const [learningPref, setLearningPref] = useState('Mixed');

  const addSubjectRow = () => {
    setSubjects([
      ...subjects,
      {
        name: '',
        difficulty: 'Medium',
        exam_date: defaultExamDate(14),
        preparation_percentage: 30,
        importance: 'Medium',
      },
    ]);
  };

  const removeSubjectRow = (idx) => {
    if (subjects.length <= 1) {
      setError('You need at least one subject to generate a study plan');
      return;
    }
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubjectRow = (idx, field, value) => {
    const updated = [...subjects];
    updated[idx][field] = value;
    setSubjects(updated);
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!academics.name.trim()) {
        setError('Please enter your full name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const invalid = subjects.find((s) => !s.name.trim() || !s.exam_date);
      if (invalid) {
        setError('Please make sure all subjects have a name and exam date');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    setSubmitting(true);

    const payload = {
      name: academics.name,
      college: academics.college,
      degree: academics.degree,
      branch: academics.branch,
      year: academics.year,
      subjects: subjects.map((s) => ({
        ...s,
        preparation_percentage: Number(s.preparation_percentage),
      })),
      available_hours: Number(availability.available_hours),
      preferred_start_time: availability.preferred_start_time,
      preferred_end_time: availability.preferred_end_time,
      preferred_break_duration: Number(availability.preferred_break_duration),
      learning_preference: learningPref,
    };

    try {
      await api.submitOnboarding(payload);
      markOnboarded();
      addToast('Personalized AI study plan generated successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save onboarding setup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] py-12 px-4 relative flex flex-col items-center">
      <div className="w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative z-10">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Setup Wizard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Let's configure your study routine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            StudyMate AI uses these parameters to dynamically optimize your daily study hours
          </p>

          {/* Stepper pills */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6">
            {[
              { num: 1, label: 'Academics' },
              { num: 2, label: 'Subjects' },
              { num: 3, label: 'Availability' },
              { num: 4, label: 'Preferences' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white font-semibold'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-xs block font-mono">Step {s.num}</span>
                  <span className="text-xs hidden sm:block font-medium truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Academics */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={academics.name}
                  onChange={(e) => setAcademics({ ...academics, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
                <input
                  type="text"
                  value={academics.college}
                  onChange={(e) => setAcademics({ ...academics, college: e.target.value })}
                  placeholder="e.g. Apex Institute of Technology"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree</label>
                <input
                  type="text"
                  value={academics.degree}
                  onChange={(e) => setAcademics({ ...academics, degree: e.target.value })}
                  placeholder="e.g. B.Tech / B.E."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Department</label>
                <input
                  type="text"
                  value={academics.branch}
                  onChange={(e) => setAcademics({ ...academics, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Year / Semester</label>
                <input
                  type="text"
                  value={academics.year}
                  onChange={(e) => setAcademics({ ...academics, year: e.target.value })}
                  placeholder="e.g. 3rd Year (Semester VI)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Subjects */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Subjects, Exam Dates & Difficulties
              </h3>
              <button
                type="button"
                onClick={addSubjectRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {subjects.map((subj, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Subject #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSubjectRow(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject Name</label>
                      <input
                        type="text"
                        value={subj.name}
                        onChange={(e) => updateSubjectRow(idx, 'name', e.target.value)}
                        placeholder="e.g. DBMS"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
                      <select
                        value={subj.difficulty}
                        onChange={(e) => updateSubjectRow(idx, 'difficulty', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Exam Date</label>
                      <input
                        type="date"
                        value={subj.exam_date}
                        onChange={(e) => updateSubjectRow(idx, 'exam_date', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Prep: {subj.preparation_percentage}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={subj.preparation_percentage}
                        onChange={(e) => updateSubjectRow(idx, 'preparation_percentage', e.target.value)}
                        className="w-full accent-indigo-500 cursor-pointer mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Study Availability */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Clock className="w-5 h-5 text-indigo-400" />
              Daily Study Availability & Timing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Available Hours Per Day: <span className="text-indigo-400 font-bold">{availability.available_hours} hours</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={availability.available_hours}
                  onChange={(e) => setAvailability({ ...availability, available_hours: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>1 hr/day</span>
                  <span>6 hrs/day</span>
                  <span>12 hrs/day</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preferred Break Duration: <span className="text-indigo-400 font-bold">{availability.preferred_break_duration} mins</span>
                </label>
                <select
                  value={availability.preferred_break_duration}
                  onChange={(e) => setAvailability({ ...availability, preferred_break_duration: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-sm text-white"
                >
                  <option value={10}>10 minutes (Short Sprint)</option>
                  <option value={15}>15 minutes (Standard Pomodoro)</option>
                  <option value={20}>20 minutes (Deep Recovery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Study Start Time</label>
                <input
                  type="time"
                  value={availability.preferred_start_time}
                  onChange={(e) => setAvailability({ ...availability, preferred_start_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Study End Time</label>
                <input
                  type="time"
                  value={availability.preferred_end_time}
                  onChange={(e) => setAvailability({ ...availability, preferred_end_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Learning Preferences */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Primary Learning Style
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              Select how you retain syllabus information best. AI will tailor tasks (e.g. concept notes vs practice problem sets).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  type: 'Mixed',
                  label: 'Mixed / Balanced',
                  desc: 'Optimal balance of concept revision, derivations, and previous-year questions (PYQs). Recommended for engineering.',
                },
                {
                  type: 'Practice',
                  label: 'Practice & Problem Solving',
                  desc: 'Focus on coding exercises, numerical problem sets, and full-length mock examinations.',
                },
                {
                  type: 'Reading',
                  label: 'Reading & Textbooks',
                  desc: 'Emphasis on textbook deep dives, summary notes, formula cards, and active recall.',
                },
                {
                  type: 'Videos',
                  label: 'Video Lectures & Animations',
                  desc: 'Structured video walkthroughs, animation breakdowns, and visual mind maps.',
                },
              ].map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => setLearningPref(opt.type)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    learningPref === opt.type
                      ? 'bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">{opt.label}</span>
                    {learningPref === opt.type && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between mt-10 pt-5 border-t border-slate-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-card text-xs font-medium text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {submitting ? 'Generating AI Study Plan...' : 'Generate My Study Plan 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
