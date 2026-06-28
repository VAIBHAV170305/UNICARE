"use client";

import React, { useState } from "react";
import { 
  Heart, 
  Calendar as CalIcon, 
  Smile, 
  Sparkles, 
  ChevronRight, 
  Info,
  CheckCircle,
  FileText,
  Activity,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Symptom {
  id: string;
  name: string;
  logged: boolean;
}

export default function WomensWellness() {
  const [cycleDay, setCycleDay] = useState(8); // Current day in cycle
  const [cycleLength, setCycleLength] = useState(28);
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: "s1", name: "Cramps", logged: false },
    { id: "s2", name: "Fatigue", logged: true },
    { id: "s3", name: "Headache", logged: false },
    { id: "s4", name: "Bloating", logged: false },
    { id: "s5", name: "Acne", logged: false },
    { id: "s6", name: "Mood Swings", logged: false },
  ]);
  const [logSuccess, setLogSuccess] = useState(false);

  const handleToggleSymptom = (id: string) => {
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, logged: !s.logged } : s));
  };

  const handleSaveLog = () => {
    setLogSuccess(true);
    confetti({
      particleCount: 50,
      spread: 45,
      colors: ["#ec4899", "#8b5cf6", "#10b981"]
    });
    setTimeout(() => setLogSuccess(false), 3000);
  };

  // Phases calculation (28 day standard model)
  // Days 1-5: Menstrual (Menses)
  // Days 6-12: Follicular
  // Days 13-15: Ovulatory
  // Days 16-28: Luteal
  const getCyclePhase = (day: number) => {
    if (day <= 5) return { name: "Menstrual Phase", desc: "Low hormones. Focus on gentle recovery, iron-rich foods, and rest.", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
    if (day <= 12) return { name: "Follicular Phase", desc: "Estrogen rising. High energy, excellent for strength workouts, progressive planning.", color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20" };
    if (day <= 15) return { name: "Ovulatory Phase", desc: "Peak fertility and peak estrogen. High endurance, high verbal fluency, social peak.", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { name: "Luteal Phase", desc: "Progesterone rising. Calm down intensity. Focus on steady cardio, magnesium, and hydration.", color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20" };
  };

  const activePhase = getCyclePhase(cycleDay);

  // Generate calendar days
  const calendarDays = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <img
              src="/womens-logo.png"
              alt="Women's Wellness Logo"
              className="h-7 w-7 rounded-lg object-cover"
            /> Women&rsquo;s Wellness Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Dynamic hormonal tracking & biometric synchronization.
          </p>
        </div>
      </div>

      {/* Grid 1: Cycle tracker ring and Forecast calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cycle Progress Ring */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cycle Progress</span>
          
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="64"
                stroke="#ec4899"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402.1}
                initial={{ strokeDashoffset: 402.1 }}
                animate={{ strokeDashoffset: 402.1 - (402.1 * cycleDay) / cycleLength }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Day {cycleDay}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">of 28 days</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${activePhase.color}`}>
              {activePhase.name}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-xs mx-auto">
              {activePhase.desc}
            </p>
          </div>

          {/* Quick adjust buttons */}
          <div className="flex gap-2 mt-6">
            <button 
              onClick={() => setCycleDay(prev => Math.max(1, prev - 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Prev Day
            </button>
            <button 
              onClick={() => setCycleDay(prev => Math.min(28, prev + 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Next Day
            </button>
          </div>
        </div>

        {/* 28 Day Forecast Calendar */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CalIcon className="h-4.5 w-4.5 text-rose-500" /> Cycle Forecast Calendar
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Next Period predicted in 20 days</span>
            </div>

            {/* Grid calendar */}
            <div className="grid grid-cols-7 gap-2.5 pt-2">
              {calendarDays.map((day) => {
                const isCurrent = day === cycleDay;
                const isPeriod = day <= 5;
                const isFertile = day >= 11 && day <= 16;
                const isOvulation = day === 14;

                let borderStyle = "border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/20";
                let textStyle = "text-slate-600 dark:text-slate-400";
                
                if (isPeriod) {
                  borderStyle = "bg-rose-500/10 border-rose-500/30";
                  textStyle = "text-rose-500 font-bold";
                } else if (isOvulation) {
                  borderStyle = "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-400/20";
                  textStyle = "text-amber-500 font-bold";
                } else if (isFertile) {
                  borderStyle = "bg-brand-purple/10 border-brand-purple/30";
                  textStyle = "text-brand-purple font-bold";
                }

                if (isCurrent) {
                  borderStyle = "bg-rose-500 border-rose-600 scale-[1.05] shadow-md shadow-rose-500/20";
                  textStyle = "text-white font-extrabold";
                }

                return (
                  <div
                    key={day}
                    onClick={() => setCycleDay(day)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs cursor-pointer select-none transition-all hover:scale-105 ${borderStyle} ${textStyle}`}
                  >
                    <span>{day}</span>
                    {/* Visual markers */}
                    {!isCurrent && isPeriod && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-500" />
                    )}
                    {!isCurrent && isOvulation && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-500 animate-ping" />
                    )}
                    {!isCurrent && isFertile && !isOvulation && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-purple" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 items-center justify-start text-[9px] text-slate-400 font-bold uppercase pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-rose-500/20 border border-rose-500/40" />
              <span>Period</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-brand-purple/20 border border-brand-purple/40" />
              <span>Fertility Window</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded bg-amber-500/20 border border-amber-500/40" />
              <span>Ovulation</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded bg-rose-500 border border-rose-600" />
              <span>Active Day</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid 2: Symptoms Logger & Hormone Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Symptom Checklist Logger */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Smile className="h-4.5 w-4.5 text-rose-500" /> Symptom Logging
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {symptoms.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleToggleSymptom(s.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    s.logged
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                      : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{s.name}</span>
                  {s.logged && <CheckCircle className="h-4 w-4 text-rose-500 fill-rose-500/10" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-4">
            <button 
              onClick={handleSaveLog}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-md shadow-rose-500/10"
            >
              Save Today&rsquo;s Log
            </button>
            <AnimatePresence>
              {logSuccess && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-brand-emerald flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" /> Logged successfully
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Hormonal Advice */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-brand-purple" /> Hormonal Phase Synced Insights
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
                <div className="p-1 rounded bg-brand-emerald/10 text-brand-emerald h-fit">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Training Recommendations</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">
                    Estrogen levels are supporting high aerobic capacity. Excellent window for HIIT (High-Intensity Interval Training) or heavy weight lifts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
                <div className="p-1 rounded bg-rose-500/10 text-rose-500 h-fit">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Nutritional Recommendations</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">
                    Add complex carbohydrates and seeds (sunflower, sesame) to support phase metabolic changes. Iron replenishment is stable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-brand-blue" /> Evaluated by UniCare Medical AI Engine
          </div>
        </div>

      </div>

    </div>
  );
}
