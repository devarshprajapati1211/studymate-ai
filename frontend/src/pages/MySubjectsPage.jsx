import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import PriorityBadge from '../components/common/PriorityBadge';
import CountdownPill from '../components/common/CountdownPill';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export default function MySubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'Medium',
    exam_date: '',
    preparation_percentage: 30,
    importance: 'Medium',
  });

  const { addToast } = useToast();

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 10);
    setEditingSubject(null);
    setFormData({
      name: '',
      difficulty: 'Medium',
      exam_date: defaultDate.toISOString().split('T')[0],
      preparation_percentage: 30,
      importance: 'Medium',
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSubject(s);
    setFormData({
      name: s.name,
      difficulty: s.difficulty,
      exam_date: s.exam_date,
      preparation_percentage: s.preparation_percentage,
      importance: s.importance || 'Medium',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, formData);
        addToast(`Updated ${formData.name} successfully! Priority recalculated.`, 'success');
      } else {
        await api.createSubject(formData);
        addToast(`Added ${formData.name}! AI calculated priority score.`, 'success');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      addToast(err.message || 'Error saving subject', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteSubject(id);
      addToast('Subject deleted successfully', 'info');
      setDeleteConfirmId(null);
      fetchSubjects();
    } catch (err) {
      addToast('Failed to delete subject', 'error');
    }
  };

  const handleQuickPrepChange = async (subject, newPrep) => {
    try {
      await api.updateSubject(subject.id, { preparation_percentage: newPrep });
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? { ...s, preparation_percentage: newPrep } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState count={3} message="Recalculating subject priority rankings..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar with Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Registered Subjects</h2>
          <p className="text-xs text-slate-400 mt-1">
            Priorities are automatically adjusted as exam dates approach and your preparation increases.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="You haven't added any subjects yet"
          description="Add your first college course, exam date, and difficulty to let AI score its priority."
          actionText="Add Subject"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="glass-card rounded-2xl p-6 border-slate-800/80 hover:border-indigo-500/30 flex flex-col justify-between relative group"
            >
              <div>
                {/* Card Top: Title & Badges */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                        {s.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">• {s.importance || 'Medium'} Importance</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <PriorityBadge level={s.priority_level} score={s.priority_score} />
                    <CountdownPill days={s.days_until_exam} />
                  </div>
                </div>

                {/* Preparation progress */}
                <div className="my-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                    <span>Preparation Level</span>
                    <span className="text-white font-bold">{s.preparation_percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.preparation_percentage >= 70
                          ? 'bg-emerald-500'
                          : s.preparation_percentage >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${s.preparation_percentage}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.preparation_percentage}
                    onChange={(e) => handleQuickPrepChange(s, parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 opacity-60 hover:opacity-100 transition-opacity"
                    title="Slide to update your preparation percentage"
                  />
                </div>

                {/* AI Priority Explanation */}
                {s.priority_explanation && (
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Priority Engine Rationale:</span>
                    </div>
                    {s.priority_explanation}
                  </div>
                )}
              </div>

              {/* Card Footer: Exam date and Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exam: {s.exam_date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Subject"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deleteConfirmId === s.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-slate-400 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? `Edit ${editingSubject.name}` : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. DBMS, Operating Systems, AI"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              >
                <option value="Easy">Easy (Foundation)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Complex / Heavy)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Importance</label>
              <select
                value={formData.importance}
                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              >
                <option value="High">High (Core Subject)</option>
                <option value="Medium">Medium (Elective)</option>
                <option value="Low">Low (General)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Exam Date</label>
            <input
              type="date"
              required
              value={formData.exam_date}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Current Preparation Level: <span className="text-indigo-400 font-bold">{formData.preparation_percentage}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.preparation_percentage}
              onChange={(e) => setFormData({ ...formData, preparation_percentage: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
            >
              {editingSubject ? 'Save Changes' : 'Add Subject & Calculate Priority'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
