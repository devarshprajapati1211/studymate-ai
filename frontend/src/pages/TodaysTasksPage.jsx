import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Filter,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';
import PriorityBadge from '../components/common/PriorityBadge';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export default function TodaysTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject_name: 'DBMS',
    duration_minutes: 45,
    priority: 'HIGH',
    learning_mode: 'Practice',
  });

  const { addToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks(`scheduled_date=${todayStr}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (taskId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await api.toggleTaskComplete(taskId, newStatus);
      if (newStatus) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
        addToast('Task marked complete!', 'success');
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: newStatus } : t))
      );
    } catch (err) {
      addToast('Error toggling task', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask({
        ...newTask,
        scheduled_date: todayStr,
      });
      addToast('Custom task added to today’s list', 'success');
      setModalOpen(false);
      setNewTask({
        title: '',
        subject_name: 'DBMS',
        duration_minutes: 45,
        priority: 'HIGH',
        learning_mode: 'Practice',
      });
      fetchTasks();
    } catch (err) {
      addToast('Failed to create task', 'error');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
  const completedMinutes = tasks.filter((t) => t.completed).reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
  const completedCount = tasks.filter((t) => t.completed).length;

  if (loading) {
    return <LoadingState count={3} message="Retrieving today's study checklist..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Today's Study Checklist</h2>
          <p className="text-xs text-slate-400 mt-1">
            Focus mode for your planned daily study sprints.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Extra Task
        </button>
      </div>

      {/* Progress banner */}
      <div className="glass-card rounded-2xl p-5 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {(completedMinutes / 60).toFixed(1)} / {(totalMinutes / 60).toFixed(1)} hours logged
              </span>
              <span className="text-xs text-slate-400">
                ({completedCount} of {tasks.length} tasks)
              </span>
            </div>
            <div className="w-48 sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'pending' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'completed' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No tasks scheduled for today' : `No ${filter} tasks found`}
          description={
            filter === 'completed'
              ? 'Complete tasks from your checklist to see them here.'
              : 'Add an extra study task or regenerate your study plan.'
          }
          actionText={filter === 'all' ? 'Add Extra Task' : undefined}
          onAction={filter === 'all' ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggle(t.id, t.completed)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                t.completed
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'glass-card border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <button
                  type="button"
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    t.completed
                      ? 'bg-emerald-500 border border-emerald-500 text-white'
                      : 'border border-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {t.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="overflow-hidden">
                  <p
                    className={`text-sm font-semibold truncate transition-all ${
                      t.completed ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="font-semibold text-indigo-400">{t.subject_name}</span>
                    <span>•</span>
                    <span>{t.duration_minutes} min</span>
                    <span>•</span>
                    <span className="text-slate-500">{t.learning_mode}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 ml-3">
                <PriorityBadge level={t.priority} showScore={false} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Task Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Extra Study Task">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Task Title / Topic</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. DBMS — B-Tree Indexing PYQs"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={newTask.subject_name}
                onChange={(e) => setNewTask({ ...newTask, subject_name: e.target.value })}
                placeholder="e.g. DBMS"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="15"
                max="180"
                step="15"
                value={newTask.duration_minutes}
                onChange={(e) => setNewTask({ ...newTask, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              >
                <option value="HIGH">HIGH 🔴</option>
                <option value="MEDIUM">MEDIUM 🟠</option>
                <option value="LOW">LOW 🟢</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Study Mode</label>
              <select
                value={newTask.learning_mode}
                onChange={(e) => setNewTask({ ...newTask, learning_mode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-indigo-500"
              >
                <option value="Concept Revision">Concept Revision</option>
                <option value="Practice">Practice Questions</option>
                <option value="PYQ Review">Previous-Year Questions (PYQs)</option>
                <option value="Mock Test">Mock Assessment</option>
              </select>
            </div>
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
              Add to Today's Tasks
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
