import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Clock, ExternalLink, MessageSquare, 
  Send, Sparkles, Calculator, Languages, Beaker, ChevronRight, AlertCircle, Bell,
  BookOpen, Lightbulb, Search, ListChecks
} from 'lucide-react';
import { format, addWeeks, differenceInDays } from 'date-fns';
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

  const handleSendMessage = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim() || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = getAssistantResponseStream(messageToSend, "You are a helpful EMG assistant.");
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20">
      {/* FIXED HEADER - ĐÃ SỬA LỖI H1 LỒNG TRONG HEADER */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0056B3] rounded-xl flex items-center justify-center text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">EMG Assistant</h1>
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
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={16} /> Today's Focus
            </h2>
            <div className="bg-[#F0F7FF] rounded-2xl p-5 border border-[#D1E9FF] flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0056B3]">
                <Beaker size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0056B3] uppercase">Subject</p>
                <p className="text-xl font-bold text-gray-900">Science</p>
              </div>
            </div>
          </section>

          <section className="bg-[#151619] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056B3] blur-[80px] opacity-20"></div>
             <h2 className="text-xs font-bold text-[#8E9299] uppercase mb-6 flex items-center gap-2">
               <Sparkles size={14} className="text-[#0056B3]" /> STEM Project
             </h2>
             <div className="text-center py-4">
               <div className="text-6xl font-bold mb-2">{daysToStem}</div>
               <p className="text-sm text-[#8E9299]">Days remaining</p>
             </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={COURSE_LINKS.scienceMath} target="_blank" className="bg-white p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#0056B3] transition-all group shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0369A1] mb-4 group-hover:bg-[#0056B3] group-hover:text-white transition-colors">
                <Beaker size={24} />
              </div>
              <h3 className="font-bold text-lg">Science & Maths</h3>
              <p className="text-sm text-gray-500 mt-1">Check your weekly lessons</p>
            </a>
            <a href={COURSE_LINKS.english} target="_blank" className="bg-white p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#9333EA] transition-all group shadow-sm">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-[#7E22CE] mb-4 group-hover:bg-[#9333EA] group-hover:text-white transition-colors">
                <Languages size={24} />
              </div>
              <h3 className="font-bold text-lg">English</h3>
              <p className="text-sm text-gray-500 mt-1">LMS English activities</p>
            </a>
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Tasks to complete</h2>
              <span className="bg-blue-50 text-[#0056B3] px-3 py-1 rounded-full text-xs font-bold">{tasks.filter(t => !t.completed).length} Pending</span>
            </div>
            <div className="divide-y">
              {tasks.map(task => (
                <div key={task.id} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                   <button onClick={() => {/* Toggle Logic */}} className={cn("w-6 h-6 rounded-full border-2 transition-all", task.completed ? "bg-green-500 border-green-500 text-white flex items-center justify-center" : "border-gray-300 hover:border-blue-500")}>
                    {task.completed && <CheckCircle2 size={16} />}
                  </button>
                  <span className={cn("flex-1 font-medium", task.completed && "line-through text-gray-400")}>{task.title}</span>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{task.course}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* FLOATING ROBOT */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
        <AnimatePresence>
          {!chatOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-end">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border mb-4 text-xs font-bold text-[#0056B3]">Need help? Ask me! 👋</div>
              <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer" onClick={() => setChatOpen(true)}>
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle cx="50" cy="55" r="35" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  <rect x="25" y="30" width="50" height="35" rx="15" fill="#151619" />
                  <motion.circle cx="40" cy="47" r="4" fill="#00FF00" animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                  <motion.circle cx="60" cy="47" r="4" fill="#00FF00" animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} />
                  <motion.rect x="15" y="50" width="12" height="6" rx="3" fill="#0056B3" animate={{ rotate: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FULL CHAT MODAL WITH ALL FEATURES */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex">
              
              {/* SIDEBAR SUGGESTIONS - TRẢ LẠI CHO BẠN ĐÂY */}
              <div className="hidden sm:flex w-72 bg-[#F9FAFB] border-r border-[#E5E7EB] flex-col p-8">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-8 h-8 bg-[#0056B3] rounded-lg flex items-center justify-center text-white">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-bold text-gray-900">Smart Actions</span>
                </div>
                
                <div className="space-y-3">
                  <button onClick={() => handleSendMessage("Explain this like a teacher")} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-transparent hover:border-blue-200 hover:shadow-md transition-all text-left text-sm
