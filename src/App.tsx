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
    { id: 'w22m', title: 'Week 22 Maths - Geometry 5 - Area and Perimeter (00/05)', course: 'Science & Math', completed: false },
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

  const handleSendMessage = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim() || isLoading) return;

    const context = "You are a helpful EMG assistant. " +
      "Schedule: " + WEEKLY_SCHEDULE.map(s => s.day + ": " + s.subject).join(", ") + ". " +
      "Science STEM Project: " + daysToStem + " days left. " +
      "Incomplete tasks: " + tasks.filter(t => !t.completed).map(t => t.title).join(", ");

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);
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
      console.error(error);
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

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-4">Weekly Schedule</h3>
            <div className="space-y-3">
              {WEEKLY_SCHEDULE.map((item, idx) => (
                <div key={idx} className={cn("flex items-center justify-between p-3 rounded-xl border", item.subject !== 'Off' ? "bg-white border-[#E5E7EB]" : "bg-[#F9FAFB] opacity-60")}>
                  <span className="text-sm font-bold w-12">{item.day}</span>
                  <span className="text-sm font-medium">{item.subject}</span>
                  <div className={cn("w-2 h-2 rounded-full", item.subject === 'Maths' ? "bg-blue-500" : item.subject === 'Science' ? "bg-emerald-500" : "bg-gray-300")}></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(COURSE_LINKS).map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-3xl border border-[#E5E7EB] hover:border-[#0056B3] transition-all group">
                <div className="flex justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0056B3]">
                    {key.includes('science') ? <Beaker size={24} /> : <Languages size={24} />}
                  </div>
                  <ExternalLink size={18} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
              </a>
            ))}
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Tasks</h2>
                <p className="text-sm text-[#6B7280]">{incompleteTasks.length} pending</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task.id)} className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", task.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300")}>
                    {task.completed && <CheckCircle2 size={16} />}
                  </div>
                  <span className={cn("flex-1 font-bold", task.completed && "line-through text-gray-400")}>{task.title}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-40">
        <button onClick={() => setChatOpen(true)} className="w-16 h-16 bg-[#0056B3] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
          <MessageSquare size={28} />
        </button>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-5xl h-[80vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row">
              <div className="hidden sm:flex w-64 bg-gray-50 border-r p-6 flex-col">
                <div className="font-bold mb-8 flex items-center gap-2 text-[#0056B3]"><Sparkles size={20}/> EMG AI</div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Quick Actions</p>
                  <button onClick={() => handleSendMessage("Suggest STEM project ideas")} className="text-xs text-left text-gray-600 hover:text-blue-600 block">STEM Ideas</button>
                  <button onClick={() => handleSendMessage("What is my schedule tomorrow?")} className="text-xs text-left text-gray-600 hover:text-blue-600 block">Check Schedule</button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold">Chat Assistant</h3>
                  <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                      <div className={cn("p-4 rounded-2xl max-w-[80%]", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-100")}>
                        <Markdown className="text-sm prose prose-sm max-w-none">{msg.content}</Markdown>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-6 border-t">
                  <div className="flex gap-2">
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 p-3 bg-gray-100 rounded-xl outline-none" placeholder="Ask me anything..." />
                    <button onClick={() => handleSendMessage()} className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20}/></button>
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
