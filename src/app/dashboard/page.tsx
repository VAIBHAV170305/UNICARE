"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Heart, 
  Flame, 
  Activity, 
  Moon, 
  Droplet, 
  Smile, 
  CheckSquare, 
  Square,
  Calendar, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Plus, 
  Compass, 
  Info,
  BadgeAlert,
  Check
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export default function DashboardOverview() {
  const { user, logout } = useAuth();
  const [waterIntake, setWaterIntake] = useState(1500); // in ml
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [liveDateTime, setLiveDateTime] = useState<Date | null>(null);

  // Live clock — updates every second
  useEffect(() => {
    setLiveDateTime(new Date()); // Hydrate immediately
    const timer = setInterval(() => setLiveDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic greeting based on hour
  const getGreeting = () => {
    if (!liveDateTime) return "Hello";
    const h = liveDateTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  };

  // Format live date: "Saturday, June 28, 2026"
  const formattedDate = liveDateTime
    ? liveDateTime.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Format live time: "06:49 AM"
  const formattedTime = liveDateTime
    ? liveDateTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

  useEffect(() => {
    const consented = localStorage.getItem("unicare_health_data_consent");
    if (consented !== "true") {
      setShowConsentModal(true);
    }
  }, []);

  const handleAgreeConsent = () => {
    localStorage.setItem("unicare_health_data_consent", "true");
    setShowConsentModal(false);
  };

  const handleDisagreeConsent = () => {
    logout();
  };
  const [loggedMood, setLoggedMood] = useState<string | null>("Calm");
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", text: "Drink 3.0L of water (1,500ml logged)", completed: false },
    { id: "2", text: "Complete 30-min cardiovascular exercise", completed: true },
    { id: "3", text: "Log sleep quality", completed: true },
    { id: "4", text: "Complete 10-min mindful breathing session", completed: false },
  ]);

  const activityData = [
    { day: "Mon", activeCalories: 620, sleepHours: 7.2 },
    { day: "Tue", activeCalories: 740, sleepHours: 8.0 },
    { day: "Wed", activeCalories: 510, sleepHours: 6.8 },
    { day: "Thu", activeCalories: 820, sleepHours: 7.5 },
    { day: "Fri", activeCalories: 690, sleepHours: 8.1 },
    { day: "Sat", activeCalories: 950, sleepHours: 8.5 },
    { day: "Sun", activeCalories: 740, sleepHours: 8.2 },
  ];

  // Increment water intake
  const handleAddWater = () => {
    const nextWater = Math.min(waterIntake + 250, 4000);
    setWaterIntake(nextWater);

    // Update goal text
    setGoals(prev => prev.map(g => {
      if (g.id === "1") {
        const isDone = nextWater >= 3000;
        return {
          ...g,
          text: `Drink 3.0L of water (${nextWater.toLocaleString()}ml logged)`,
          completed: isDone
        };
      }
      return g;
    }));

    if (nextWater === 3000) {
      triggerConfetti();
    }
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          triggerConfetti();
        }
        return { ...g, completed: nextState };
      }
      return g;
    }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#3b82f6", "#10b981", "#8b5cf6"]
    });
  };

  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsCount = goals.length;
  const progressPercent = Math.round((completedGoalsCount / totalGoalsCount) * 100);

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Good Morning Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {getGreeting()}, {user?.profile?.name || user?.name || "User"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            {formattedDate}&nbsp;&bull;&nbsp;Your biomarkers indicate steady recovery.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 font-mono tracking-tight">
          <Clock className="h-4 w-4 text-brand-blue" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Grid 1: AI Summary & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Health Summary */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card relative overflow-hidden text-left border border-slate-200/60 dark:border-slate-900/60 flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-purple/10 text-brand-purple">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">AI Medical Summary</h2>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Based on your sleep architecture last night (Deep Sleep 2.2 hrs, HRV +12%) and active calories yesterday (740 active kcal), your physical recovery index is optimal. We recommend a moderate aerobic run today rather than high intensity lifting. Hydration levels are low; your customized fluid intake target is 3.0L to counteract thermal loads.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/60 mt-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sleep Index</span>
              <span className="text-base font-black text-slate-700 dark:text-white mt-1">Excellent (8.2 hrs)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Stress State</span>
              <span className="text-base font-black text-slate-700 dark:text-white mt-1">Low (HRV: 74 ms)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Metabolic Load</span>
              <span className="text-base font-black text-slate-700 dark:text-white mt-1">Moderate (1.8k kcal)</span>
            </div>
          </div>
        </div>

        {/* Health Score Circular ring */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Vitality Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <motion.circle
                cx="72"
                cy="72"
                r="56"
                stroke="url(#dashboardGradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={351.8}
                initial={{ strokeDashoffset: 351.8 }}
                animate={{ strokeDashoffset: 351.8 - (351.8 * 84) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">84</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score index</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-brand-emerald mt-4 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +2% higher than last week
          </p>
        </div>

      </div>

      {/* Grid 2: Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Mood Widget */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mood State</span>
            <Smile className="h-4.5 w-4.5 text-brand-purple" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {loggedMood || "Select Mood"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Log your emotional state below</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {[
              { label: "Anxious", emoji: "😢" },
              { label: "Neutral", emoji: "😐" },
              { label: "Calm", emoji: "🙂" },
              { label: "Energetic", emoji: "🤩" }
            ].map(m => (
              <button
                key={m.label}
                onClick={() => setLoggedMood(m.label)}
                title={m.label}
                className={`text-lg p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all ${
                  loggedMood === m.label ? "bg-brand-purple/10 border border-brand-purple/30 scale-110" : "opacity-75 hover:opacity-100"
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Water Hydration Widget */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Hydration Tracker</span>
            <Droplet className="h-4.5 w-4.5 text-brand-blue" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {waterIntake} <span className="text-xs font-semibold text-slate-400">ml</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Target: 3,000ml (3.0L)</p>
          </div>
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative w-full h-8 rounded-xl bg-slate-100 dark:bg-slate-900/60 overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
              {/* Wavy background fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-brand-blue"
                initial={{ height: 0 }}
                animate={{ height: `${Math.min((waterIntake / 3000) * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              >
                {/* SVG Wave */}
                <svg
                  className="absolute left-0 w-[200%] h-3 text-brand-blue fill-current -top-[7px] animate-wave"
                  viewBox="0 0 120 28"
                  preserveAspectRatio="none"
                >
                  <path d="M0 15 Q 30 0, 60 15 T 120 15 T 180 15 T 240 15 L 240 28 L 0 28 Z" />
                </svg>
              </motion.div>
              {/* Text indicator overlaid on the wave tank */}
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-700 dark:text-slate-200 mix-blend-difference">
                {Math.round(Math.min((waterIntake / 3000) * 100, 100))}%
              </div>
            </div>
            <button 
              onClick={handleAddWater}
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white text-xs font-bold transition-all border border-brand-blue/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add 250ml</span>
            </button>
          </div>
        </div>

        {/* Sleep Widget */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sleep duration</span>
            <Moon className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              8h 12m
            </p>
            <p className="text-[10px] text-brand-emerald mt-1 font-bold">Deep sleep: 2h 14m (27%)</p>
          </div>
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-200/10 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Efficiency: 92%</span>
            <span>Resting HR: 54 bpm</span>
          </div>
        </div>

        {/* Exercise Tracker */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Physical Activity</span>
            <Activity className="h-4.5 w-4.5 text-brand-emerald" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              640 <span className="text-xs font-semibold text-slate-400">kcal</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Active target: 800 kcal</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-brand-emerald rounded-full transition-all duration-500" 
                style={{ width: `${(640 / 800) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Steps: 9,240</span>
              <span>Time: 45m</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid 3: Goals & Reminders (Left) + Weekly Activity Charts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Goals & Checklists */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-4.5 w-4.5 text-brand-blue" /> Today&rsquo;s Targets
              </h3>
              <span className="text-xs font-bold text-slate-400">{progressPercent}% done</span>
            </div>

            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleToggleGoal(g.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    g.completed
                      ? "bg-slate-100/30 dark:bg-slate-950/20 border-slate-200/30 dark:border-slate-800/30 opacity-70"
                      : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 shadow-sm"
                  }`}
                >
                  <div className="shrink-0">
                    {g.completed ? (
                      <Check className="h-4.5 w-4.5 text-brand-emerald stroke-[3px]" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded border border-slate-400 dark:border-slate-600" />
                    )}
                  </div>
                  <span className={`text-xs font-bold ${g.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                    {g.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Upcoming: Cardio session &bull; 5:00 PM</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-brand-emerald" /> Weekly Activity Analytics
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last 7 Days</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeCaloriesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(15, 23, 42, 0.8)", 
                    border: "none", 
                    borderRadius: "12px", 
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="activeCalories" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#activeCaloriesGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
            <span>Average energy: 710 kcal/day</span>
            <span className="text-brand-emerald flex items-center gap-1 font-bold"><Flame className="h-3.5 w-3.5" /> High caloric week</span>
          </div>
        </div>

      </div>

      {/* Grid 4: Health Journey Timeline (Preventive Health Alerts) */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-6">
          <Compass className="h-4.5 w-4.5 text-brand-emerald" /> Preventive Care Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Segment 1 */}
          <div className="space-y-3 relative p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-brand-blue bg-brand-blue/15 uppercase">
              Completed
            </span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Basic Blood Chemistry</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Metabolic panel completed on March 14, 2026. Triglycerides, glucose indices normal.
            </p>
          </div>

          {/* Segment 2 */}
          <div className="space-y-3 relative p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 border-l-4 border-l-brand-purple">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-brand-purple bg-brand-purple/15 uppercase">
              Today
            </span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Cardiac ECG Sync Check</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Evaluate wearable HRV telemetry over the past 30 days. Action recommended inside chat.
            </p>
          </div>

          {/* Segment 3 */}
          <div className="space-y-3 relative p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-amber-500 bg-amber-500/15 uppercase">
              In 3 Months
            </span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Dermatology Skin Mapping</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Annual preventative dermoscopy mole monitoring. Calendar hold scheduled.
            </p>
          </div>

          {/* Segment 4 */}
          <div className="space-y-3 relative p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 uppercase">
              Scheduled
            </span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Hearing & Auditory Response</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Next scheduled test set for October 2026. Age-related decibel threshold checking.
            </p>
          </div>

        </div>
      </div>

      {/* Consent Modal Overlay */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6 text-center animate-in fade-in zoom-in-95 duration-250">
            <div className="mx-auto w-16 h-16 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-2xl flex items-center justify-center text-brand-blue">
              <Info className="h-8 w-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                Health Data Privacy Consent
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To provide you with personalized wellness plans, symptoms guidance, and biometrics analysis, UniCare requires processing your health data.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                🔒 <strong>AES-256 Encryption:</strong> Sensitive health logs (medical history, allergies) are encrypted at rest.
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                🔍 <strong>Audit Trail:</strong> Logins and profile updates are logged securely to prevent unauthorized access.
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                ❌ <strong>Right to be Forgotten:</strong> You can purge your entire data footprint at any time by deleting your account.
              </p>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              By consenting, you agree to our{" "}
              <Link href="/privacy" target="_blank" className="text-brand-blue underline hover:opacity-80">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" target="_blank" className="text-brand-blue underline hover:opacity-80">
                Terms of Service
              </Link>.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleDisagreeConsent}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-slate-500 transition-all active:scale-95"
              >
                Decline & Exit
              </button>
              <button
                onClick={handleAgreeConsent}
                className="flex-1 px-4 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-xs font-bold text-white transition-all active:scale-95 shadow-md shadow-brand-blue/20"
              >
                I Agree & Consent
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
