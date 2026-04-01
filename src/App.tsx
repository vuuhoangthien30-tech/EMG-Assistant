import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Mic,
  Send, 
  Sparkles, 
  Calculator, 
  Languages, 
  Beaker,
  ChevronRight,
  AlertCircle,
  Bell,
  X,
  Check,
  Loader2,
  Volume2,
  BookOpen,
  HelpCircle,
  Bot
} from 'lucide-react';
import { format, addWeeks, differenceInDays, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { Task, WEEKLY_SCHEDULE, COURSE_LINKS } from './types';
import { getAssistantResponseStream } from './services/gemini';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Quiz } from './components/Quiz';
import { generateSpeechStream } from './services/tts';
import { GoogleGenAI } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'w30m', title: 'Week 30 Maths - End Term 2 Review Week ⭐ Currently Learning', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w28s', title: 'Week 28 Science | End Term Review (Term 2) (00/03)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w28m', title: 'Week 28 Maths - End Term 2 Review (01/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w27s', title: 'Week 27 Science | Ecology 1 - Interaction of Organisms (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w27m', title: 'Week 27 Maths - Transformations 1 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w26s', title: 'Week 26 Science | Magnetism (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w26m', title: 'Week 26 Maths - Probability 2 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w25s', title: 'Week 25 Science | Electricity 2 - Voltage and Resistance (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w25m', title: 'Week 25 Maths - Probability 1 (01/05)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w24s', title: 'Week 24 Science | Regular Assessment (Term 2) (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w24m', title: 'Week 24 Maths - Regular Assessment 2 Exam (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w23s', title: 'Week 23 Science | Regular Assessment (Term 2) Review (00/03)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w23m', title: 'Week 23 Maths - Review Week (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w22bs', title: 'Week 22B Science | Electricity 1 - Series and Parallel Circuits (01/05)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w22bm', title: 'Week 22B Maths - Symmetry (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w22s', title: 'Week 22 Science | Light 3 - Colours (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w22m', title: 'Week 22 Maths - Geometry 5 - Area and Perimeter (00/05)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w21s', title: 'Week 21 Science | Light 2 - Refraction (01/08)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w21m', title: 'Week 21 Maths - Geometry 4 - Circles 2 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w20s', title: 'Week 20 Science | Light 1 - Reflection (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w20m', title: 'Week 20 Maths - Geometry 3 - Circles 1 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w19s', title: 'Week 19 Science | Sound 2 (05/08)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w19m', title: 'Week 19 Maths - Geometry 2 - 3D Shapes and Nets (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w18s', title: 'Week 18 Science | Sound 1 (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w18m', title: 'Week 18 Maths - Gemoetry 1 - Angles (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w17s', title: 'Week 17 Science | Forces 2 - Newton\'s Laws of Motion (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w17m', title: 'Week 17 Maths (00/05)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w16s', title: 'Week 16 Science | Forces 1 - Speed and Resistance (00/08)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w16m', title: 'Week 16 Maths (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w15s', title: 'Week 15 Science | Introduction to Reproduction (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w15m', title: 'Week 15 Maths | Algebraic Expressions 2 (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w14s', title: 'Week 14 Science | End Term 1 (00/02)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w14m', title: 'Week 14 Maths | End Term 1 (02/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w13s', title: 'Week 13 Science | End Term 1 Review (03/03)', course: 'Science & Math', category: 'Science', completed: true },
    { id: 'w13m', title: 'Week 13 Maths | End Term 1 Review (02/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w12s', title: 'Week 12 Science | STEM Group Project (00/04)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w12m', title: 'Week 12 Maths | Algebraic Expressions 1 (01/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w11s', title: 'Week 11 Science | Neutralization (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w11m', title: 'Week 11 Maths | Algebraic Sequences (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w10s', title: 'Week 10 Science | Acids and Alkalis (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w10m', title: 'Week 10 Maths | Powers and Roots (00/05)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w9s', title: 'Week 9 Science | Plants 2 - Transpiration and Transport of Nutrients (00/04)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w9m', title: 'Week 9 Maths | Units and Conversions (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w8s', title: 'Week 8 Science | Regular Assessment 1 (00/03)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w8m', title: 'Week 8 Maths | Regular Assessment 1 (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w7s', title: 'Week 7 Science | Regular Assessment 1 Review (00/05)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w7m', title: 'Week 7 Maths | Regular Assessment 1 Review (06/06)', course: 'Science & Math', category: 'Math', completed: true },
    { id: 'w6s', title: 'Week 6 Science | Plants 1 - Germination and Growth (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w6m', title: 'Week 6 Maths | Percentage Changes (04/04)', course: 'Science & Math', category: 'Math', completed: true },
    { id: 'w5s', title: 'Week 5 Science | Introduction to Respiration (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w5m', title: 'Week 5 Maths | Ratios and Proportions (06/06)', course: 'Science & Math', category: 'Math', completed: true },
    { id: 'w4s', title: 'Week 4 Science | Atoms and Elements 2 (00/07)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w4m', title: 'Week 4 Maths | Fractions 2 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w3s', title: 'Week 3 Science | Atoms and Elements 1 (00/06)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w3m', title: 'Week 3 Maths | Fractions 1 (00/04)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w2s', title: 'Week 2 Science | Scientific Method and Fair Test (00/04)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w2m', title: 'Week 2 Maths | Multiples, Factors, Primes (00/03)', course: 'Science & Math', category: 'Math', completed: false },
    { id: 'w1s', title: 'Week 1 Science | Introduction to Science (00/05)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'w1m', title: 'Week 1 Maths | Integers (04/04)', course: 'Science & Math', category: 'Math', completed: true },
    { id: 'studyplans', title: 'Study Plans & Glossaries (00/08)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'g6stem', title: 'Grade 6 STEM Project Recap (00/12)', course: 'Science & Math', category: 'Science', completed: false },
    { id: 'e1', title: 'English Week 1 - Grammar Basics', course: 'English', category: 'English', completed: false },
    { id: 'e2', title: 'English Week 2 - Vocabulary Building', course: 'English', category: 'English', completed: false },
    { id: 'e3', title: 'English Week 3 - Reading Comprehension', course: 'English', category: 'English', completed: false },
  ]);

  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your EMG assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingChat, setIsSpeakingChat] = useState<number | null>(null);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Math' | 'Science' | 'English'>('Math');
  const [claps, setClaps] = useState<{ 
    id: number; 
    x: number; 
    sway: number; 
    duration: number; 
    delay: number; 
    scale: number;
    rotation: number;
  }[]>([]);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // STEM Project target (7 weeks from last Thursday, March 5, 2026)
  const stemTargetDate = new Date(2026, 3, 23); // April 23, 2026
  const daysToStem = Math.max(0, differenceInDays(stemTargetDate, new Date()));

  useEffect(() => {
    const messages = [
      "It's time to review your lessons! Let's get started now!",
      "Don't forget to do your homework! The exams are coming soon!",
      "Take 15 minutes to review today's lessons right now!",
      "Hard work pays off! Start your study session now!",
      "Try a quick quiz to test your knowledge right away!"
    ];
    
    const timer = setTimeout(() => {
      setReminderMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowReminder(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const currentContext = `
    Schedule: ${WEEKLY_SCHEDULE.map(s => `${s.day}: ${s.subject}`).join(', ')}
    Science STEM Project: ${daysToStem} days left.
    Incomplete tasks: ${tasks.filter(t => !t.completed).map(t => t.title).join(', ')}
  `;

  const handleExpandTask = async (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }

    setExpandedTaskId(taskId);
    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.content) {
      setIsGeneratingContent(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate a summary and a 5-question multiple choice quiz for the lesson: "${task.title}". 
          The summary should be concise (2-3 paragraphs).
          The quiz should have 5 questions, each with 4 options and 1 correct answer (index 0-3).
          Return the response in JSON format matching this schema:
          {
            "summary": "string",
            "quiz": [
              {
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "answer": 0
              }
            ]
          }`,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const content = JSON.parse(response.text);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, content } : t));
      } catch (error) {
        console.error('Error generating task content:', error);
      } finally {
        setIsGeneratingContent(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Add placeholder for assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const stream = getAssistantResponseStream(userMsg, currentContext);
      let fullContent = '';
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });
      }

      // Automatically speak the response if it's short enough or user preference (here we just provide the button)
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string, index: number) => {
    if (isSpeakingChat !== null) return;
    
    setIsSpeakingChat(index);
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass({ sampleRate: 24000 });
    let nextStartTime = 0;

    try {
      const stream = generateSpeechStream(text);
      let hasStarted = false;

      for await (const pcmData of stream) {
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        const buffer = audioCtx.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        const startTime = Math.max(audioCtx.currentTime, nextStartTime);
        source.start(startTime);
        nextStartTime = startTime + buffer.duration;
        hasStarted = true;

        source.onended = () => {
          // We don't close here because more chunks might come
        };
      }

      // Wait for the last chunk to finish
      const waitTime = (nextStartTime - audioCtx.currentTime) * 1000;
      setTimeout(() => {
        setIsSpeakingChat(null);
        audioCtx.close();
      }, Math.max(0, waitTime + 100));

      if (!hasStarted) {
        setIsSpeakingChat(null);
        audioCtx.close();
      }
    } catch (error) {
      console.error("TTS Streaming Playback Error:", error);
      setIsSpeakingChat(null);
      audioCtx.close();
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const newTasks = prev.map(t => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          if (newCompleted) {
            // Play clapping sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Audio play failed:", err));

            // Trigger claps
            const newClaps = Array.from({ length: 35 }).map((_, i) => ({
              id: Math.random(),
              x: Math.random() * 100,
              sway: (Math.random() - 0.5) * 20, // Random horizontal sway
              duration: 1.5 + Math.random() * 1.5, // Random speed
              delay: Math.random() * 0.5, // Staggered start
              scale: 0.5 + Math.random() * 1, // Random sizes
              rotation: (Math.random() - 0.5) * 60, // Random initial rotation
            }));
            setClaps(prevClaps => [...prevClaps, ...newClaps]);
            setTimeout(() => {
              setClaps(prevClaps => prevClaps.filter(c => !newClaps.includes(c)));
            }, 4000); // Increased timeout to match longer durations
          }
          return { ...t, completed: newCompleted };
        }
        return t;
      });
      return newTasks;
    });
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
    <div className="min-h-screen bg-transparent text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0056B3] to-[#00A3FF] rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,86,179,0.5)]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">EMG Assistant</h1>
            <p className="text-[10px] text-[#00A3FF] font-bold uppercase tracking-[0.2em]">AI Powered Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-white/60 hover:bg-white/10 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00A3FF] rounded-full shadow-[0_0_8px_#00A3FF]"></span>
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{format(new Date(), 'EEEE, d MMMM', { locale: enUS })}</p>
            <p className="text-xs text-white/40">Happy studying!</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Schedule & STEM */}
        <div className="lg:col-span-4 space-y-8">
          {/* Today's Focus */}
          <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-[#00A3FF]" /> What to study today?
            </h2>
            <div className="bg-gradient-to-br from-[#0056B3]/20 to-transparent rounded-2xl p-5 border border-white/5">
              {todaySchedule && todaySchedule.subject !== 'Off' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[#00A3FF] shadow-inner">
                    {todaySchedule.subject === 'Maths' && <Calculator size={24} />}
                    {todaySchedule.subject === 'English' && <Languages size={24} />}
                    {todaySchedule.subject === 'Science' && <Beaker size={24} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#00A3FF] uppercase tracking-wider">Main Subject</p>
                    <p className="text-xl font-bold text-white">{todaySchedule.subject}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Today</p>
                    <p className="text-xl font-bold text-white/60">Self-study time</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* STEM Countdown */}
          <section className="bg-gradient-to-br from-[#151619] to-[#050505] text-white rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056B3] opacity-10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-[#00A3FF]" /> Science STEM Project
            </h2>
            <div className="text-center py-4">
              <div className="text-7xl font-bold mb-2 tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20">{daysToStem}</div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Days remaining</p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Progress: 7 weeks</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#151619] bg-[#0056B3] flex items-center justify-center text-[10px] font-bold shadow-lg">
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Weekly Schedule Mini */}
          <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Weekly Schedule</h3>
            <div className="space-y-3">
              {WEEKLY_SCHEDULE.map((item, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  item.subject !== 'Off' ? "bg-white/5 border-white/10" : "bg-transparent border-transparent opacity-30"
                )}>
                  <span className="text-xs font-bold w-12 text-white/60">{item.day}</span>
                  <span className={cn("text-sm font-bold", item.subject !== 'Off' ? "text-white" : "text-white/40")}>
                    {item.subject}
                  </span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                    item.subject === 'Maths' && "text-blue-400 bg-blue-400",
                    item.subject === 'English' && "text-purple-400 bg-purple-400",
                    item.subject === 'Science' && "text-emerald-400 bg-emerald-400",
                    item.subject === 'Off' && "text-white/20 bg-white/20"
                  )}></div>
                </div>
              ))}
            </div>
          </section>

          {/* Creator Credit */}
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-xl flex items-center justify-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse"></div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">
              This website was created by <span className="text-[#00A3FF]">Tommy</span>.
            </p>
          </section>
        </div>

        {/* Right Column: Tasks & LMS Links */}
        <div className="lg:col-span-8 space-y-8">
          {/* LMS Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a 
              href={COURSE_LINKS.scienceMath} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-br from-[#0056B3]/20 to-transparent p-8 rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-[#00A3FF] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00A3FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white/10 text-[#00A3FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Beaker size={28} />
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 group-hover:text-[#00A3FF] group-hover:bg-white/10 transition-all">
                  <ExternalLink size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Section 1</h3>
              <p className="text-sm font-bold text-[#00A3FF] uppercase tracking-widest mb-2">Science & Maths</p>
              <p className="text-sm text-white/40 leading-relaxed">Access LMS lectures, interactive exercises, and weekly assessments.</p>
            </a>
            <a 
              href={COURSE_LINKS.english} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-br from-[#9333EA]/20 to-transparent p-8 rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-[#A855F7] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white/10 text-[#A855F7] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Languages size={28} />
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 group-hover:text-[#A855F7] group-hover:bg-white/10 transition-all">
                  <ExternalLink size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Section 2</h3>
              <p className="text-sm font-bold text-[#A855F7] uppercase tracking-widest mb-2">English</p>
              <p className="text-sm text-white/40 leading-relaxed">Access EMG English materials, vocabulary lists, and grammar guides.</p>
            </a>
          </div>

          {/* Pending Tasks */}
          <section className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col space-y-6 px-10 py-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Learning Tasks</h2>
                  <p className="text-sm text-white/40 mt-1">
                    You have <span className="text-[#00A3FF] font-bold">{tasks.filter(t => !t.completed && t.category === activeCategory).length}</span> incomplete {activeCategory} tasks
                  </p>
                </div>
                <button 
                  onClick={() => setTasksExpanded(!tasksExpanded)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-[#00A3FF]"
                >
                  <ChevronRight size={24} className={cn("transition-transform duration-300", tasksExpanded ? "-rotate-90" : "rotate-90")} />
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {(['Math', 'Science', 'English'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border",
                      activeCategory === category
                        ? "bg-[#00A3FF] text-white border-[#00A3FF] shadow-lg shadow-[#00A3FF]/20"
                        : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="divide-y divide-white/5">
              {tasks.filter(t => t.category === activeCategory).length > 0 ? (
                (tasksExpanded ? tasks.filter(t => t.category === activeCategory) : tasks.filter(t => t.category === activeCategory).slice(0, 7)).map(task => (
                  <div key={task.id} className="group">
                    <div 
                      className={cn(
                        "px-10 py-6 flex items-center gap-6 hover:bg-white/[0.03] transition-all cursor-pointer",
                        task.completed && "opacity-30",
                        expandedTaskId === task.id && "bg-white/[0.05]"
                      )}
                      onClick={() => handleExpandTask(task.id)}
                    >
                      <button 
                        className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-lg",
                          task.completed ? "bg-[#00A3FF] text-white" : "bg-white/5 border border-white/10 text-transparent group-hover:border-[#00A3FF] group-hover:bg-white/10"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                      >
                        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className={cn("font-bold text-lg transition-all", task.completed ? "text-white/40" : "text-white group-hover:text-[#00A3FF]")}>
                            {task.title}
                          </h4>
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-[#00A3FF]"
                            >
                              <Check size={20} className="stroke-[3px]" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md border",
                            task.course === 'Science & Math' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}>
                            {task.course}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className={cn(
                        "text-white/20 transition-all",
                        expandedTaskId === task.id ? "rotate-90 text-[#00A3FF]" : "group-hover:text-[#00A3FF]"
                      )} />
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedTaskId === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-black/20"
                        >
                          <div className="px-10 py-8 space-y-8 border-t border-white/5">
                            {isGeneratingContent ? (
                              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-8 h-8 text-[#00A3FF] animate-spin" />
                                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Generating lesson content...</p>
                              </div>
                            ) : task.content ? (
                              <div className="space-y-10">
                                {/* Summary Section */}
                                <section className="space-y-4">
                                  <div className="flex items-center gap-3 text-[#00A3FF]">
                                    <BookOpen size={18} />
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.25em]">Lesson Summary</h5>
                                  </div>
                                  <div className="text-white/70 text-sm leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                                    {task.content.summary}
                                  </div>
                                </section>

                                {/* Quiz Section */}
                                <section className="space-y-4">
                                  <div className="flex items-center gap-3 text-[#00A3FF]">
                                    <HelpCircle size={18} />
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.25em]">Practice Quiz</h5>
                                  </div>
                                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                                    <Quiz 
                                      questions={task.content.quiz} 
                                      onComplete={(score) => {
                                        if (score === task.content?.quiz.length && !task.completed) {
                                          toggleTask(task.id);
                                        }
                                      }}
                                    />
                                  </div>
                                </section>
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#00A3FF] shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">No Tasks</h3>
                  <p className="text-white/40 mt-2">There are no tasks in this category.</p>
                </div>
              )}
            </div>
            
            <div className="bg-white/[0.02] px-10 py-6 text-center border-t border-white/5">
              <button className="text-xs font-bold text-[#00A3FF] hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-3 mx-auto">
                View all on LMS <ExternalLink size={14} />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Clapping Animation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {claps.map((clap) => (
            <motion.div
              key={clap.id}
              initial={{ 
                y: "110vh", 
                opacity: 0, 
                x: `${clap.x}vw`, 
                scale: clap.scale,
                rotate: clap.rotation 
              }}
              animate={{ 
                y: "-20vh", 
                opacity: [0, 1, 1, 0],
                x: [`${clap.x}vw`, `${clap.x + clap.sway}vw`, `${clap.x - clap.sway}vw`, `${clap.x}vw`],
                rotate: [clap.rotation, clap.rotation + 45, clap.rotation - 45, clap.rotation]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: clap.duration, 
                delay: clap.delay,
                ease: "linear" 
              }}
              className="absolute text-4xl sm:text-6xl"
            >
              👏
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Slogan */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0056B3]/10 via-transparent to-[#9333EA]/10"></div>
          <p className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 relative z-10">
            One AI assistant – helping every EMG student learn better.
          </p>
        </motion.div>
      </div>

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
          onClick={() => setVoiceOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-[#00A3FF] to-[#0056B3] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Mic size={28} className="group-hover:scale-110 transition-transform" />
        </button>

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
            <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row relative">
              {/* Sidebar (Desktop) */}
              <div className="hidden sm:flex w-64 bg-[#F9FAFB] border-r border-[#E5E7EB] flex-col p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-[#0056B3] rounded-lg flex items-center justify-center text-white">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-slate-900">EMG Assistant</span>
                </div>
                
                <button 
                  onClick={() => setMessages([{ role: 'assistant', content: 'Hello! I am your EMG assistant. How can I help you today?' }])}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] transition-all text-sm font-medium mb-auto text-slate-900"
                >
                  <MessageSquare size={16} /> New Chat
                </button>

                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggestions</p>
                  <button onClick={() => setInput('🤖 Explain AI')} className="text-xs text-left text-slate-600 hover:text-[#0056B3] transition-colors block font-medium">🤖 Explain AI</button>
                  <button onClick={() => setInput('💡 STEM project idea')} className="text-xs text-left text-slate-600 hover:text-[#0056B3] transition-colors block font-medium">💡 STEM project idea</button>
                  <button onClick={() => setInput('🧑🏫 Ask like a teacher')} className="text-xs text-left text-slate-600 hover:text-[#0056B3] transition-colors block font-medium">🧑🏫 Ask like a teacher</button>
                  
                  <div className="pt-4">
                    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center justify-center">
                      <img 
                        src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png" 
                        alt="Cute Robot" 
                        className="w-24 h-24 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E0F2FE] rounded-full flex items-center justify-center text-[#0056B3] font-bold text-xs">HV</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900">EMG Student</p>
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
                    <span className="font-bold text-sm text-slate-900">EMG Assistant</span>
                  </div>
                  <div className="hidden sm:block">
                    <h3 className="font-bold text-lg text-slate-900">Current Conversation</h3>
                    <p className="text-xs text-slate-500">Ultra-fast response by Gemini 3.1</p>
                  </div>
                  <button 
                    onClick={() => setChatOpen(false)}
                    className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors text-slate-900"
                  >
                    <X size={24} />
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                            <>
                              <Markdown>{msg.content}</Markdown>
                              {msg.role === 'assistant' && msg.content !== '' && (
                                <button 
                                  onClick={() => speakMessage(msg.content, idx)}
                                  disabled={isSpeakingChat !== null}
                                  className={cn(
                                    "mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all",
                                    isSpeakingChat === idx 
                                      ? "bg-[#0056B3] text-white border-[#0056B3]" 
                                      : "bg-white text-[#0056B3] border-[#0056B3]/20 hover:bg-[#0056B3]/5"
                                  )}
                                >
                                  {isSpeakingChat === idx ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin" />
                                      Speaking...
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={12} />
                                      Read Aloud
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 sm:p-10 bg-white">
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
                        className="w-full bg-transparent px-6 py-5 pr-16 focus:outline-none resize-none text-base text-slate-900 placeholder:text-slate-400"
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

      {/* Reminder Notification */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="fixed bottom-24 right-8 z-[100] max-w-xs"
          >
            <div className="bg-[#00A3FF] text-white p-5 rounded-3xl shadow-2xl border border-white/20 relative group overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full group-hover:bg-white/30 transition-all"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Bot size={28} className="text-white animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">EMG Assistant</span>
                    <button 
                      onClick={() => setShowReminder(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-bold leading-snug">
                    {reminderMessage}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar (Auto-hide after 10s) */}
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                onAnimationComplete={() => setShowReminder(false)}
                className="absolute bottom-0 left-0 h-1 bg-white/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceAssistant isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} context={currentContext} />
    </div>
  );
}
