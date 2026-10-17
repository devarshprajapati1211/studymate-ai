import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Zap,
  RotateCcw,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your **StudyMate AI** academic strategist.\n\nI have direct access to your registered subjects, upcoming exam countdowns, preparation levels, and today's task list.\n\nHow can I help optimize your study session right now?`,
      suggested_actions: [
        'What should I study today?',
        'I only have 1 hour today. Make me a plan.',
        'Which subject should I prioritize?',
        'How can I improve my study schedule?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const s = await api.getAIStatus();
        setAiStatus(s);
      } catch (e) {
        console.error(e);
      }
    }
    loadStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chatWithAI(text, history);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          suggested_actions: res.suggested_actions || [],
          is_fallback: res.is_fallback,
        },
      ]);
    } catch (err) {
      addToast(err.message || 'AI Assistant unavailable', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'StudyMate AI encountered a temporary issue. Please verify your connection or try another question.',
          suggested_actions: ['What should I study today?', 'Which subject should I prioritize?'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleChips = [
    'What should I study today?',
    'I only have 1 hour today. Make me a plan.',
    'Which subject should I prioritize?',
    'My DBMS exam is in 3 days. What should I do?',
    "I completed today's tasks. What should I study next?",
    'How can I improve my study schedule?',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-card rounded-3xl border-slate-800 overflow-hidden relative">
      {/* Assistant Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
              StudyMate AI Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">
              {aiStatus?.llm_enabled ? 'LLM Enhanced Assistant' : 'Smart Study Planner Mode (Data-Grounded)'}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content: `Chat session cleared. How can I help with your exam preparation today, ${user?.name || 'Alex'}?`,
                suggested_actions: sampleChips.slice(0, 3),
              },
            ])
          }
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Suggested Action Chips */}
                {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggested_actions.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSend(chip)}
                        className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/40 text-[11px] font-medium text-slate-300 hover:text-indigo-300 transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing your subjects & schedule...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts quick chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/40 hidden sm:flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
        {sampleChips.slice(0, 3).map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask StudyMate AI about your study schedule or exams..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
