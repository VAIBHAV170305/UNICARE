"use client";

import React, { useState, useEffect } from "react";
import { 
  Moon, 
  Sun, 
  Clock, 
  Zap, 
  Sparkles, 
  Coffee, 
  AlertCircle, 
  Check, 
  Plus, 
  Brain,
  Timer
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

interface SleepLog {
  day: string;
  hours: number;
  quality: number; // percentage
}

export default function SleepTrackerPage() {
  const { user } = useAuth();
  
  // Local states
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([
    { day: "Mon", hours: 6.8, quality: 78 },
    { day: "Tue", hours: 7.2, quality: 84 },
    { day: "Wed", hours: 6.0, quality: 65 },
    { day: "Thu", hours: 7.5, quality: 88 },
    { day: "Fri", hours: 8.0, quality: 92 },
    { day: "Sat", hours: 8.5, quality: 95 },
    { day: "Sun", hours: 8.2, quality: 90 },
  ]);

  const [inputHours, setInputHours] = useState("7.5");
  const [inputQuality, setInputQuality] = useState("85");
  const [currentHour, setCurrentHour] = useState(12);

  // Sync user profile state or questionnaire sleep state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const qSleep = localStorage.getItem("unicare_sleep_hours");
      if (qSleep) {
        // Log the onboarding preference if it exists
        const hours = parseFloat(qSleep);
        setInputHours(qSleep);
      }
      
      const now = new Date();
      setCurrentHour(now.getHours());
    }
  }, []);

  // Sleep Debt Calculation (Recommended sleep is 8 hours)
  const targetSleep = 8.0;
  const totalActual = sleepLogs.reduce((acc, log) => acc + log.hours, 0);
  const totalTarget = targetSleep * sleepLogs.length;
  const sleepDebt = Math.max(0, parseFloat((totalTarget - totalActual).toFixed(1)));

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(inputHours);
    const quality = parseInt(inputQuality);

    if (isNaN(hours) || hours <= 0 || hours > 24) return;
    if (isNaN(quality) || quality < 0 || quality > 100) return;

    // Get current weekday abbreviation
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[new Date().getDay()];

    setSleepLogs(prev => {
      // If we already have logs for today, replace, otherwise append
      const existsIdx = prev.findIndex(l => l.day === currentDay);
      const newLogs = [...prev];
      if (existsIdx !== -1) {
        newLogs[existsIdx] = { day: currentDay, hours, quality };
      } else {
        newLogs.push({ day: currentDay, hours, quality });
        if (newLogs.length > 7) newLogs.shift();
      }
      return newLogs;
    });

    // Trigger celebration
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.8 },
      colors: ["#6366f1", "#a855f7", "#3b82f6"]
    });
  };

  // Dynamic Circadian Phase indicator
  const getCircadianPhase = (hour: number) => {
    if (hour >= 6 && hour < 9) {
      return {
        phase: "Cortisol Peak (Alertness)",
        description: "Your cortisol level rises rapidly to wake your system up. Ideal for light activity and setting intentions.",
        tip: "Avoid coffee for the first hour; let natural hydration wake your metabolism.",
        icon: Sun,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
      };
    } else if (hour >= 9 && hour < 13) {
      return {
        phase: "High Cognitive Focus Window",
        description: "Body temperature and alertness are at peak performance. Ideal for deep work, planning, and focus tasks.",
        tip: "Tackle your hardest tasks now. Maintain steady hydration.",
        icon: Brain,
        color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20"
      };
    } else if (hour >= 13 && hour < 17) {
      return {
        phase: "Post-Prandial Dip (Slump)",
        description: "Slight dip in core body temperature. Natural drowsiness is normal around 1-3 PM.",
        tip: "Take a 10-minute restorative breath cycle or step outside for bright sunlight.",
        icon: Coffee,
        color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        phase: "Physical Efficiency Peak",
        description: "Muscular strength, joint flexibility, and cardiovascular output peak. Good time for heavy exercise.",
        tip: "Complete high-load workouts. Ensure protein intake follows shortly.",
        icon: Zap,
        color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
      };
    } else if (hour >= 21 && hour < 23) {
      return {
        phase: "Melatonin Release Window",
        description: "Dim-light melatonin onset (DLMO) starts. Core body temperature begins lowering.",
        tip: "Reduce blue screen exposure. Enable night-shift mode to signal rest states.",
        icon: Timer,
        color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
      };
    } else {
      return {
        phase: "Deep Sleep & Reconstruction",
        description: "Your growth hormone levels peak to rebuild tissue, consolidate memories, and purge metabolic waste.",
        tip: "Ensure your room is cool (18°C) and completely dark for optimal REM cycles.",
        icon: Moon,
        color: "text-violet-500 bg-violet-500/10 border-violet-500/20"
      };
    }
  };

  const activePhase = getCircadianPhase(currentHour);

  // Average calculations
  const averageHours = parseFloat((sleepLogs.reduce((acc, l) => acc + l.hours, 0) / sleepLogs.length).toFixed(1));
  const averageQuality = Math.round(sleepLogs.reduce((acc, l) => acc + l.quality, 0) / sleepLogs.length);

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Moon className="h-8 w-8 text-indigo-500 animate-pulse" />
            Sleep & Circadian Rhythm
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Analyze your melatonin peaks, sleep architecture consistency, and physical rest recovery indices.
          </p>
        </div>
      </div>

      {/* Grid 1: Circadian Phase & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Circadian Phase Widget */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col justify-between relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl border ${activePhase.color}`}>
                <activePhase.icon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Circadian Phase</span>
                <h2 className="text-base font-black text-slate-800 dark:text-white mt-0.5">{activePhase.phase}</h2>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {activePhase.description}
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-indigo-950/20 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-400">Circadian Optimization Advice</h4>
              <p className="text-xs text-indigo-700/80 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                {activePhase.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Vitals Log */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Log Last Night&apos;s Sleep</h2>
          
          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sleep Duration (hours)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="24"
                value={inputHours}
                onChange={(e) => setInputHours(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Rating ({inputQuality}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={inputQuality}
                onChange={(e) => setInputQuality(e.target.value)}
                className="w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-800 accent-indigo-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Update Diary
            </button>
          </form>
        </div>
      </div>

      {/* Grid 2: Average Cards & Sleep Debt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Average Sleep Hours */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-Day Sleep Avg</span>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 flex items-baseline gap-1.5">
            {averageHours} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">hours / night</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-emerald mt-4">
            <Check className="h-4 w-4" />
            <span>Optimal biological maintenance</span>
          </div>
        </div>

        {/* Average Sleep Quality */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Recovery Quality</span>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 flex items-baseline gap-1.5">
            {averageQuality}% <span className="text-xs font-bold text-slate-500 dark:text-slate-400">recovery index</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-purple mt-4">
            <Sparkles className="h-4 w-4 text-brand-purple animate-pulse" />
            <span>Deep restorative sleep achieved</span>
          </div>
        </div>

        {/* Accumulated Sleep Debt */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-red-500/5 blur-2xl" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Sleep Debt</span>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 flex items-baseline gap-1.5">
            {sleepDebt} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">hours deficit</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-4">
            {sleepDebt > 2 ? (
              <span className="text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4 shrink-0" /> Target earlier bedtime tonight</span>
            ) : (
              <span className="text-brand-emerald flex items-center gap-1"><Check className="h-4 w-4 shrink-0" /> Rest debt is fully balanced</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid 3: Trends Graph */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left relative overflow-hidden">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Sleep Duration & Efficiency Index</h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sleepLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(15, 23, 42, 0.9)", 
                  borderColor: "rgba(255, 255, 255, 0.1)", 
                  borderRadius: "16px",
                  color: "#fff"
                }}
              />
              <Area type="monotone" name="Sleep Duration (hrs)" dataKey="hours" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              <Area type="monotone" name="Recovery Quality (%)" dataKey="quality" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorQuality)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
