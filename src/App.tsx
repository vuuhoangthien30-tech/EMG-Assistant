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

  // STEM Project target (7 weeks from now)
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

    const context = `
    You are an AI assistant for the EMG LMS learning system.

Your role:
- Help grade 6–7 students understand STEM subjects
- Explain science concepts simply
- Suggest creative STEM project ideas
- Help students with homework questions

      Schedule: ${WEEKLY_SCHEDULE.map(s => `${s.day}: ${s.subject}`).join(', ')}
      Science STEM Project: ${daysToStem} days left.
      Incomplete tasks: ${tasks.filter(t => !t.completed).map(t => t.title).join(', ')}
    `;

    // Add placeholder for assistant message
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
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    const mapping: Record<number, string> = {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      0: 'Sun'
    };
    return s.day === mapping[dayOfWeek];
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0056B3] rounded-xl flex items-center justify-center text-white">
            <Sparkles size={24} />
          </div>
        </div>
        </h1 className="text-xl font-bold tracking-tight">EMG Assistant>
            <div className="max-w-3xl mx-auto text-center mb-4">
  <h1 className="text-3xl font-bold">EMG AI Assistant</h1>
            </div>
    </div>
    
  <p className="text-gray-600 mt-2">
    An AI chatbot designed to support students in the EMG LMS system.
    It helps explain STEM concepts, answer science questions,
    and suggest creative STEM project ideas.
  </p>
</div>
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
        {/* Left Column: Schedule & STEM */}
        <div className="lg:col-span-4 space-y-8">
          {/* Today's Focus */}
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

          {/* STEM Countdown */}
          <section className="bg-[#151619] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056B3] opacity-20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            <h2 className="text-xs font-bold text-[#8E9299] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-[#0056B3]" /> Science STEM Project
            </h2>
            <div className="text-center py-4">
              <div className="text-6xl font-bold mb-2 tabular-nums">{daysToStem}</div>
              <p className="text-sm text-[#8E9299] font-medium">Days remaining for project</p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E9299]">Progress: 7 weeks</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#151619] bg-[#0056B3] flex items-center justify-center text-[10px] font-bold">
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Weekly Schedule Mini */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-4">Weekly Schedule</h3>
            <div className="space-y-3">
              {WEEKLY_SCHEDULE.map((item, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  item.subject !== 'Off' ? "bg-white border-[#E5E7EB]" : "bg-[#F9FAFB] border-transparent opacity-60"
                )}>
                  <span className="text-sm font-bold w-12">{item.day}</span>
                  <span className={cn("text-sm font-medium", item.subject !== 'Off' ? "text-[#1A1A1A]" : "text-[#6B7280]")}>
                    {item.subject}
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.subject === 'Maths' && "bg-blue-500",
                    item.subject === 'English' && "bg-purple-500",
                    item.subject === 'Science' && "bg-emerald-500",
                    item.subject === 'Off' && "bg-gray-300"
                  )}></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Tasks & LMS Links */}
        <div className="lg:col-span-8 space-y-8">
          {/* LMS Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href={COURSE_LINKS.scienceMath} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#0056B3] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#E0F2FE] text-[#0369A1] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Beaker size={24} />
                </div>
                <ExternalLink size={18} className="text-[#9CA3AF] group-hover:text-[#0056B3]" />
              </div>
              <h3 className="text-lg font-bold mb-1">Section 1: Science & Maths</h3>
              <p className="text-sm text-[#6B7280]">Access LMS lectures and exercises</p>
            </a>
            <a 
              href={COURSE_LINKS.english} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#9333EA] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3E8FF] text-[#7E22CE] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Languages size={24} />
                </div>
                <ExternalLink size={18} className="text-[#9CA3AF] group-hover:text-[#9333EA]" />
              </div>
              <h3 className="text-lg font-bold mb-1">Section 2: English</h3>
              <p className="text-sm text-[#6B7280]">Access EMG English materials</p>
            </a>
          </div>

          {/* Pending Tasks */}
          <section className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Tasks to complete</h2>
                <p className="text-sm text-[#6B7280]">You have {incompleteTasks.length} incomplete tasks</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0056B3] bg-[#F0F7FF] px-3 py-1.5 rounded-full">
                <AlertCircle size={14} />
                Updated daily
              </div>
            </div>
            
            <div className="divide-y divide-[#F3F4F6]">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "group px-8 py-5 flex items-center gap-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer",
                      task.completed && "opacity-60"
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <button className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      task.completed ? "bg-[#10B981] text-white" : "border-2 border-[#D1D5DB] text-transparent group-hover:border-[#0056B3]"
                    )}>
                      {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </button>
                    <div className="flex-1">
                      <h4 className={cn("font-bold text-base", task.completed && "line-through")}>{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                          task.course === 'Science & Math' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        )}>
                          {task.course}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-[#6B7280] flex items-center gap-1">
                            <Clock size={12} /> Due: {format(parseISO(task.dueDate), 'd/M')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#D1D5DB] group-hover:text-[#9CA3AF]" />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#9CA3AF]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold">Excellent!</h3>
                  <p className="text-[#6B7280]">You have completed all tasks.</p>
                </div>
              )}
            </div>
            
            <div className="bg-[#F9FAFB] px-8 py-4 text-center">
              <button className="text-sm font-bold text-[#0056B3] hover:underline flex items-center gap-2 mx-auto">
                View all on LMS <ExternalLink size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Assistant Button */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
        {/* Cute Robot Assistant */}
        <AnimatePresence>
          {!chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative flex flex-col items-end"
            >
              {/* Chat Bubble */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-[#E5E7EB] mb-4 mr-2 relative"
              >
                <p className="text-xs font-bold text-[#0056B3]">Hello! 👋</p>
                <p className="text-[10px] text-[#6B7280] font-medium">I'm your EMG assistant!</p>
                {/* Bubble Tail */}
                <div className="absolute bottom-0 right-6 transform translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
              </motion.div>

              {/* The Robot */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative cursor-pointer group"
                onClick={() => setChatOpen(true)}
              >
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shadow */}
                  <ellipse cx="50" cy="90" rx="20" ry="5" fill="black" fillOpacity="0.1" />
                  
                  {/* Body */}
                  <circle cx="50" cy="55" r="35" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  <circle cx="50" cy="55" r="28" fill="#F9FAFB" />
                  
                  {/* Head/Screen */}
                  <rect x="25" y="30" width="50" height="35" rx="15" fill="#151619" />
                  
                  {/* Eyes */}
                  <motion.circle 
                    cx="40" cy="47" r="4" fill="#00FF00" 
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                  <motion.circle 
                    cx="60" cy="47" r="4" fill="#00FF00" 
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />

                  {/* Waving Arm */}
                  <motion.g
                    animate={{ rotate: [0, -20, 0, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: '25px', originY: '55px' }}
                  >
                    <rect x="15" y="50" width="12" height="6" rx="3" fill="#0056B3" />
                  </motion.g>

                  {/* Other Arm */}
                  <rect x="73" y="50" width="12" height="6" rx="3" fill="#0056B3" />

                  {/* Antenna */}
                  <line x1="50" y1="30" x2="50" y2="20" stroke="#0056B3" strokeWidth="2" />
                  <motion.circle 
                    cx="50" cy="18" r="3" fill="#0056B3"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </svg>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-[#0056B3]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setChatOpen(true)}
          className="w-16 h-16 bg-[#0056B3] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-4 border-[#F8F9FA] rounded-full"></span>
        </button>
      </div>

      {/* ChatGPT-like Chat Interface */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
          >
            <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row relative">
              {/* Sidebar (Desktop) */}
              <div className="hidden sm:flex w-64 bg-[#F9FAFB] border-r border-[#E5E7EB] flex-col p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-[#0056B3] rounded-lg flex items-center justify-center text-white">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-bold text-sm tracking-tight">EMG Assistant</span>
                </div>
                
                <button 
                  onClick={() => setMessages([{ role: 'assistant', content: 'Hello! I am your EMG assistant. How can I help you today?' }])}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] transition-all text-sm font-medium mb-auto"
                >
                  <MessageSquare size={16} /> New Chat
                </button>

                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Suggestions</p>
                  <button onClick={() => setInput('Summarize incomplete tasks')} className="text-xs text-left text-[#6B7280] hover:text-[#0056B3] transition-colors block">Summarize incomplete tasks</button>
                  <button onClick={() => setInput('Tomorrow\'s schedule')} className="text-xs text-left text-[#6B7280] hover:text-[#0056B3] transition-colors block">Tomorrow's schedule</button>
                  <button onClick={() => setInput('What is the STEM project?')} className="text-xs text-left text-[#6B7280] hover:text-[#0056B3] transition-colors block">What is the STEM project?</button>
                </div>

                <div className="mt-auto pt-6 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E0F2FE] rounded-full flex items-center justify-center text-[#0056B3] font-bold text-xs">HV</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">EMG Student</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">Grade 7 Student</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:hidden">
                    <div className="w-8 h-8 bg-[#0056B3] rounded-lg flex items-center justify-center text-white">
                      <Sparkles size={18} />
                    </div>
                    <span className="font-bold text-sm">EMG Assistant</span>
                  </div>
                  <div className="hidden sm:block">
                    <h3 className="font-bold text-lg">Current Conversation</h3>
                    <p className="text-xs text-[#6B7280]">Ultra-fast response by Gemini 3.1</p>
                  </div>
                  <button 
                    onClick={() => setChatOpen(false)}
                    className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors"
                  >
                    <ChevronRight size={24} className="rotate-90 sm:rotate-0" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                      "flex gap-4 sm:gap-6",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center",
                        msg.role === 'user' ? "bg-[#F3F4F6] text-[#6B7280]" : "bg-[#0056B3] text-white"
                      )}>
                        {msg.role === 'user' ? <MessageSquare size={18} /> : <Sparkles size={18} />}
                      </div>
                      <div className={cn(
                        "flex-1 max-w-3xl space-y-2",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                          {msg.role === 'user' ? 'You' : 'EMG Assistant'}
                        </p>
                        <div className={cn(
                          "prose prose-sm sm:prose-base max-w-none leading-relaxed",
                          msg.role === 'user' ? "text-[#1A1A1A]" : "text-[#1A1A1A]"
                        )}>
                          {msg.content === '' && isLoading ? (
                            <div className="flex gap-1 py-2">
                              <div className="w-1.5 h-1.5 bg-[#0056B3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-[#0056B3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1.5 h-1.5 bg-[#0056B3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          ) : (
                            <Markdown>{msg.content}</Markdown>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 sm:p-10 bg-white"> 
                <div className="max-w-3xl mx-auto mb-3 flex flex-wrap gap-2">
  <button 
    onClick={()=>setInput("Explain AI simply")}
    className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
 >
🤖 Explain AI
</button>

<button
onClick={()=>setInput("Give me a STEM project idea")}
className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
>
💡 STEM project idea
</button>

<button
onClick={()=>setInput("Explain this like a teacher for grade 7 students")}
className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
>
🧑‍🏫 Ask like a teacher
</button>

</div>
                  <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute inset-0 bg-[#0056B3]/5 blur-xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative bg-white border border-[#E5E7EB] rounded-3xl shadow-lg focus-within:border-[#0056B3] focus-within:ring-4 focus-within:ring-[#0056B3]/5 transition-all overflow-hidden">
                      <textarea 
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Message EMG assistant..."
                        className="w-full bg-transparent px-6 py-5 pr-16 focus:outline-none resize-none text-base"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 bottom-3 w-10 h-10 bg-[#0056B3] text-white rounded-2xl flex items-center justify-center hover:bg-[#004494] disabled:opacity-30 disabled:hover:bg-[#0056B3] transition-all shadow-md"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    <p className="text-[10px] text-center text-[#9CA3AF] mt-4 font-medium uppercase tracking-widest">
                      Gemini 3.1 Flash Lite • Ultra-fast response
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
