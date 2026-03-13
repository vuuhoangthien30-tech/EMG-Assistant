import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Calculator, 
  Languages, 
  Beaker,
  ChevronRight,
  AlertCircle,
  Bell
} from 'lucide-react';
import { format, addWeeks, differenceInDays, isToday, parseISO } from 'date-fns';
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
    { id: 'w27s', title: 'Week 27 Science | Magnetism', course: 'Science & Math', completed: false },
    { id: 'w27m', title: 'Week 27 Maths - Probability 2', course: 'Science & Math', completed: false },
    { id: 'w26s', title: 'Week 26 Science | Electricity 2 - Voltage', course: 'Science & Math', completed: false },
    { id: 'w25m', title: 'Week 25 Maths - Probability 1 (01/04)', course: 'Science & Math', completed: false },
    { id: 'w24s', title: 'Week 24 Science | Regular Assessment (Term 2) (00/06)', course: 'Science & Math', completed: false },
    { id: 'w24m', title: 'Week 24 Maths - Regular Assessment 2 Exam (00/03)', course: 'Science & Math', completed: false },
    { id: 'w23s', title: 'Week 23 Science | Regular Assessment (Term 2) Review (00/03)', course: 'Science & Math', completed: false },
    { id: 'w23m', title: 'Week 23 Maths - Review Week (00/03)', course: 'Science & Math', completed: false },
    { id: 'w22bs', title: 'Week 22B Science | Electricity 1 - Series and Parallel Circuits (00/05)', course: 'Science & Math', completed: false },
    { id: 'w22bm', title: 'Week 22B Maths - Symmetry (00/04)', course: 'Science & Math', completed: false },
    { id: 'w22s', title: 'Week 22 Science | Light 3 - Colours (00/07)', course: 'Science & Math', completed: false },
    { id: 'w22m', title: 'Week 22 Maths - Geometry 5 - Area and Perimeter (00/05) ⭐ Currently Learning', course: 'Science & Math', completed: false },
    { id: 'w21s', title: 'Week 21 Science | Light 2 - Refraction (01/08)', course: 'Science & Math', completed: false },
    { id: 'w21m', title: 'Week 21 Maths - Geometry 4 - Circles 2 (00/04)', course: 'Science & Math', completed: false },
    { id: 'w20s', title: 'Week 20 Science | Light 1 - Reflection (00/07)', course: 'Science & Math', completed: false },
    { id: 'w20m', title: 'Week 20 Maths - Geometry 3 - Circles 1 (00/04)', course: 'Science & Math', completed: false },
    { id: 'w19s', title: 'Week 19 Science | Sound 2 (05/08)', course: 'Science & Math', completed: false },
    { id: 'w19m', title: 'Week 19 Maths - Geometry 2 - 3D Shapes and Nets (00/03)', course: 'Science & Math', completed: false },
    { id: 'w18s', title: 'Week 18 Science | Sound 1 (00/06)', course: 'Science & Math', completed: false },
    { id: 'w18m', title: 'Week 18 Maths - Gemoetry 1 - Angles (00/03)', course: 'Science & Math', completed: false },
    { id: 'w17s', title: 'Week 17 Science | Forces 2 - Newton\'s Laws of Motion (00/06)', course: 'Science & Math', completed: false },
    { id: 'w17m', title: 'Week 17 Maths (00/05)', course: 'Science & Math', completed: false },
    { id: 'w16s', title: 'Week 16 Science | Forces 1 - Speed and Resistance (00/08)', course: 'Science & Math', completed: false },
    { id: 'w16m', title: 'Week 16 Maths (00/04)', course: 'Science & Math', completed: false },
    { id: 'w15s', title: 'Week 15 Science | Introduction to Reproduction (00/06)', course: 'Science & Math', completed: false },
    { id: 'w15m', title: 'Week 15 Maths | Algebraic Expressions 2 (00/03)', course: 'Science & Math', completed: false },
    { id: 'w14s', title: 'Week 14 Science | End Term 1 (00/02)', course: 'Science & Math', completed: false },
    { id: 'w14m', title: 'Week 14 Maths | End Term 1 (02/03)', course: 'Science & Math', completed: false },
    { id: 'w13s', title: 'Week 13 Science | End Term 1 Review (03/03)', course: 'Science & Math', completed: true },
    { id: 'w13m', title: 'Week 13 Maths | End Term 1 Review (02/03)', course: 'Science & Math', completed: false },
    { id: 'w12s', title: 'Week 12 Science | STEM Group Project (00/04)', course: 'Science & Math', completed: false },
    { id: 'w12m', title: 'Week 12 Maths | Algebraic Expressions 1 (01/04)', course: 'Science & Math', completed: false },
    { id: 'w11s', title: 'Week 11 Science | Neutralization (00/06)', course: 'Science & Math', completed: false },
    { id: 'w11m', title: 'Week 11 Maths | Algebraic Sequences (00/04)', course: 'Science & Math', completed: false },
    { id: 'w10s', title: 'Week 10 Science | Acids and Alkalis (00/07)', course: 'Science & Math', completed: false },
    { id: 'w10m', title: 'Week 10 Maths | Powers and Roots (00/05)', course: 'Science & Math', completed: false },
    { id: 'w9s', title: 'Week 9 Science | Plants 2 - Transpiration and Transport of Nutrients (00/04)', course: 'Science & Math', completed: false },
    { id: 'w9m', title: 'Week 9 Maths | Units and Conversions (00/04)', course: 'Science & Math', completed: false },
    { id: 'w8s', title: 'Week 8 Science | Regular Assessment 1 (00/03)', course: 'Science & Math', completed: false },
    { id: 'w8m', title: 'Week 8 Maths | Regular Assessment 1 (00/03)', course: 'Science & Math', completed: false },
    { id: 'w7s', title: 'Week 7 Science | Regular Assessment 1 Review (00/05)', course: 'Science & Math', completed: false },
    { id: 'w7m', title: 'Week 7 Maths | Regular Assessment 1 Review (06/06)', course: 'Science & Math', completed: true },
    { id: 'w6s', title: 'Week 6 Science | Plants 1 - Germination and Growth (00/06)', course: 'Science & Math', completed: false },
    { id: 'w6m', title: 'Week 6 Maths | Percentage Changes (04/04)', course: 'Science & Math', completed: true },
    { id: 'w5s', title: 'Week 5 Science | Introduction to Respiration (00/07)', course: 'Science & Math', completed: false },
    { id: 'w5m', title: 'Week 5 Maths | Ratios and Proportions (06/06)', course: 'Science & Math', completed: true },
    { id: 'w4s', title: 'Week 4 Science | Atoms and Elements 2 (00/07)', course: 'Science & Math', completed: false },
    { id: 'w4m', title: 'Week 4 Maths | Fractions 2 (00/04)', course: 'Science & Math', completed: false },
    { id: 'w3s', title: 'Week 3 Science | Atoms and Elements 1 (00/06)', course: 'Science & Math', completed: false },
    { id: 'w3m', title: 'Week 3 Maths | Fractions 1 (00/04)', course: 'Science & Math', completed: false },
    { id: 'w2s', title: 'Week 2 Science | Scientific Method and Fair Test (00/04)', course: 'Science & Math', completed: false },
    { id: 'w2m', title: 'Week 2 Maths | Multiples, Factors, Primes (00/03)', course: 'Science & Math', completed: false },
    { id: 'w1s', title: 'Week 1 Science | Introduction to Science (00/05)', course: 'Science & Math', completed: false },
    { id: 'w1m', title: 'Week 1 Maths | Integers (04/04)', course: 'Science & Math', completed: true },
    { id: 'studyplans', title: 'Study Plans & Glossaries (00/08)', course: 'Science & Math', completed: false },
    { id: 'g6stem', title: 'Grade 6 STEM Project Recap (00/06)', course: 'Science & Math', completed: false },
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const context = `You are an AI assistant for the EMG LMS system. Grade 6–7 students.
      Schedule: ${WEEKLY_SCHEDULE.map(s => `${s.day}: ${s.subject}`).join(', ')}
      Science STEM Project: ${daysToStem} days left.`;

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = getAssistantResponseStream(userMsg, context);
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
      {/* Header Fixed */}
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
          <button className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-full transition-colors relative">
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
              <Calendar size={16} /> What to study today?
            </h2>
            <div className="bg-[#F0F7FF] rounded-2xl p-5 border border-[#D1E9FF]">
              {todaySchedule && todaySchedule.subject !== 'Off' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0056B3]">
                    {todaySchedule.subject === 'Maths' && <Calculator size={24} />}
                    {todaySchedule.subject === 'English' && <Languages size={24} />}
                    {todaySchedule.subject === 'Science' && <Beaker size={24} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0056B3] uppercase">Main Subject</p>
                    <p className="text-xl font-bold">{todaySchedule.subject}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#6B7280]">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#6B7280] uppercase">Today</p>
                    <p className="text-xl font-bold">Self-study time</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#151619] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056B3] opacity-20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            <h2 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-[#0056B3]" /> Science STEM Project
            </h2>
            <div className="text-center py-4">
              <div className="text-6xl font-bold mb-2 tabular-nums">{daysToStem}</div>
              <p className="text-sm text-[#8E9299] font-medium">Days remaining</p>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={COURSE_LINKS.scienceMath} target="_blank" rel="noopener noreferrer" className="group bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#E0F2FE] text-[#0369A1] rounded-2xl flex items-center justify-center"><Beaker size={24} /></div>
                <ExternalLink size={18} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-bold mb-1">Science & Maths</h3>
              <p className="text-sm text-[#6B7280]">LMS lectures and exercises</p>
            </a>
            <a href={COURSE_LINKS.english} target="_blank" rel="noopener noreferrer" className="group bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3E8FF] text-[#7E22CE] rounded-2xl flex items-center justify-center"><Languages size={24} /></div>
                <ExternalLink size={18} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-bold mb-1">English</h3>
              <p className="text-sm text-[#6B7280]">EMG English materials</p>
            </a>
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Tasks to complete</h2>
                <p className="text-sm text-[#6B7280]">{incompleteTasks.length} tasks pending</p>
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {tasks.map(task => (
                <div key={task.id} className={cn("px-8 py-5 flex items-center gap-4 hover:bg-[#F9FAFB] cursor-pointer", task.completed && "opacity-60")} onClick={() => toggleTask(task.id)}>
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", task.completed ? "bg-[#10B981] text-white" : "border-2 border-[#D1D5DB]")}>
                    {task.completed && <CheckCircle2 size={16} />}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("font-bold text-base", task.completed && "line-through")}>{task.title}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">{task.course}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Chat Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button onClick={() => setChatOpen(true)} className="w-16 h-16 bg-[#0056B3] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
          <MessageSquare size={28} />
        </button>
      </div>

      {/* Simple Chat Overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl h-[80vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-[#0056B3] text-white">
                <span className="font-bold">EMG AI Assistant</span>
                <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-1 rounded">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] p-4 rounded-2xl", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800")}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask me anything..." className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleSendMessage} disabled={isLoading} className="bg-[#0056B3] text-white p-2 px-4 rounded-xl disabled:opacity-50">Send</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
