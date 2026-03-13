import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Clock, ExternalLink, MessageSquare, 
  Send, Sparkles, Calculator, Languages, Beaker, ChevronRight, AlertCircle, Bell 
} from 'lucide-react';
import { format, addWeeks, differenceInDays, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { Task, WEEKLY_SCHEDULE, COURSE_LINKS } from './types';
import { getAssistantResponseStream } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'w28s', title: 'Week 28 Science | Ecology 1 - Interaction', course: 'Science & Math', completed: false },
    { id: 'w28m', title: 'Week 28 Maths - Transformations 1', course: 'Science & Math', completed: false },
    { id: 'w1m', title: 'Week 1 Maths | Integers (04/04)', course: 'Science & Math', completed: true },
    // ... Bạn có thể thêm lại danh sách task đầy đủ của bạn ở đây để tránh file quá dài
  ]);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your EMG assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stemTargetDate = addWeeks(new Date(), 7);
  const daysToStem = differenceInDays(stemTargetDate, new Date());

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    const context = `You are an AI assistant for EMG LMS. Help students with STEM.`;

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = getAssistantResponseStream(messageToSend, context);
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const todaySchedule = WEEKLY_SCHEDULE.find(s => {
    const dayOfWeek = new Date().getDay();
    const mapping: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
    return s.day === mapping[dayOfWeek];
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20">
      {/* --- FIXED HEADER --- */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0056B3] rounded-xl flex items-center justify-center text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">EMG Assistant</h1>
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">LMS Reminder & Planner</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{format(new Date(), 'EEEE, d MMMM', { locale: enUS })}</p>
            <p className="text-xs text-[#6B7280]">Happy studying!</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={16} /> Today's Focus
            </h2>
            <div className="bg-[#F0F7FF] rounded-2xl p-5 border border-[#D1E9FF]">
              {todaySchedule ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0056B3]">
                    {todaySchedule.subject === 'Science' ? <Beaker size={24} /> : <Calculator size={24} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0056B3] uppercase">Subject</p>
                    <p className="text-xl font-bold">{todaySchedule.subject}</p>
                  </div>
                </div>
              ) : <p>Self-study day</p>}
            </div>
          </section>

          <section className="bg-[#151619] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h2 className="text-xs font-bold text-[#8E9299] uppercase mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-[#0056B3]" /> STEM Project
            </h2>
            <div className="text-center py-4">
              <div className="text-6xl font-bold mb-2">{daysToStem}</div>
              <p className="text-sm text-[#8E9299]">Days remaining</p>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={COURSE_LINKS.scienceMath} target="_blank" className="bg-white p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#0056B3] transition-all">
              <Beaker className="mb-4 text-[#0369A1]" />
              <h3 className="font-bold">Science & Maths</h3>
            </a>
            <a href={COURSE_LINKS.english} target="_blank" className="bg-white p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#9333EA] transition-all">
              <Languages className="mb-4 text-[#7E22CE]" />
              <h3 className="font-bold">English</h3>
            </a>
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-8 py-6 border-b">
              <h2 className="text-xl font-bold">Tasks to complete</h2>
            </div>
            <div className="divide-y">
              {tasks.map(task => (
                <div key={task.id} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer" onClick={() => toggleTask(task.id)}>
                  <div className={cn("w-6 h-6 rounded-full border-2", task.completed && "bg-green-500 border-green-500 text-white flex items-center justify-center")}>
                    {task.completed && <CheckCircle2 size={16} />}
                  </div>
                  <span className={cn("flex-1", task.completed && "line-through text-gray-400")}>{task.title}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* --- ROBOT ASSISTANT --- */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
        <AnimatePresence>
          {!chatOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-end">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border mb-4 relative text-xs font-bold text-[#0056B3]">
                Hello! 👋 I'm your assistant!
                <div className="absolute bottom-0 right-6 translate-y-full border-t-8 border-t-white border-x-8 border-x-transparent"></div>
              </div>
              <div className="cursor-pointer" onClick={() => setChatOpen(true)}>
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle cx="50" cy="55" r="35" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  <rect x="25" y="30" width="50" height="35" rx="15" fill="#151619" />
                  <circle cx="40" cy="47" r="4" fill="#00FF00" />
                  <circle cx="60" cy="47" r="4" fill="#00FF00" />
                  <motion.rect x="15" y="50" width="12" height="6" rx="3" fill="#0056B3" animate={{ rotate: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                  <rect x="73" y="50" width="12" height="6" rx="3" fill="#0056B3" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(true)} className="w-16 h-16 bg-[#0056B3] text-white rounded-2xl shadow-2xl flex items-center justify-center">
          <MessageSquare size={28} />
        </button>
      </div>

      {/* --- CHAT INTERFACE WITH SUGGESTIONS --- */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="w-full max-w-5xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row">
              {/* SIDEBAR SUGGESTIONS */}
              <div className="hidden sm:flex w-64 bg-[#F9FAFB] border-r border-[#E5E7EB] flex-col p-6">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="text-[#0056B3]" size={18} />
                  <span className="font-bold text-sm">EMG Assistant</span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Smart Actions</p>
                  <button onClick={() => handleSendMessage("Explain this like a teacher")} className="w-full text-left text-xs p-3 rounded-xl border bg-white hover:bg-blue-50 transition-colors">🎓 Ask like a teacher</button>
                  <button onClick={() => handleSendMessage("Summarize my incomplete tasks")} className="w-full text-left text-xs p-3 rounded-xl border bg-white hover:bg-blue-50 transition-colors">📝 Summarize tasks</button>
                  <button onClick={() => handleSendMessage("Give me STEM project ideas")} className="w-full text-left text-xs p-3 rounded-xl border bg-white hover:bg-blue-50 transition-colors">💡 STEM Project ideas</button>
                  <button onClick={() => handleSendMessage("What is my schedule tomorrow?")} className="w-full text-left text-xs p-3 rounded-xl border bg-white hover:bg-blue-50 transition-colors">📅 Tomorrow's schedule</button>
                </div>

                <div className="mt-auto pt-6 border-t">
                  <p className="text-xs font-bold">EMG Student</p>
                  <p className="text-[10px] text-gray-400">Grade 7</p>
                </div>
              </div>

              {/* MAIN CHAT AREA */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold text-lg">Chat with Gemini 3.1</h3>
                  <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="rotate-90 sm:rotate-0" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", msg.role === 'user' ? "bg-gray-100" : "bg-blue-600 text-white")}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={cn("max-w-[80%] p-4 rounded-2xl", msg.role === 'user' ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-800")}>
                        <Markdown className="prose prose-sm">{msg.content}</Markdown>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t flex gap-3">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type your question..." className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button onClick={() => handleSendMessage()} disabled={isLoading} className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50"><Send size={20} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
