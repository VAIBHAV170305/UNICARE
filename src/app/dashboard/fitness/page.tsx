"use client";

import React, { useState } from "react";
import { 
  Activity, 
  Flame, 
  TrendingUp, 
  Plus, 
  CheckCircle, 
  Compass, 
  Award,
  Zap,
  Trash2,
  Trash
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface WorkoutItem {
  id: string;
  type: string;
  duration: number; // in mins
  calories: number; // in kcal
}

export default function FitnessActivity() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    { id: "w1", type: "Morning Trail Run", duration: 35, calories: 380 },
    { id: "w2", type: "Mobility & Stretch Flow", duration: 15, calories: 75 }
  ]);

  const [addType, setAddType] = useState("Strength");
  const [addDuration, setAddDuration] = useState("");
  const [addCalories, setAddCalories] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const stepsData = [
    { day: "Mon", steps: 8400 },
    { day: "Tue", steps: 9240 },
    { day: "Wed", steps: 6100 },
    { day: "Thu", steps: 11200 },
    { day: "Fri", steps: 9800 },
    { day: "Sat", steps: 12400 },
    { day: "Sun", steps: 10100 },
  ];

  const badges = [
    { name: "Century Walk", desc: "Logged 10,000+ steps in a single day.", icon: "👟", unlocked: true },
    { name: "Iron Will", desc: "Logged 4 strength training sessions.", icon: "💪", unlocked: true },
    { name: "Sleep Champion", desc: "Met your sleep duration target 5 nights in a row.", icon: "😴", unlocked: false },
    { name: "Hydration Hero", desc: "Drank 3.0L water for 7 consecutive days.", icon: "💧", unlocked: false },
  ];

  const handleAddWorkout = () => {
    if (!addDuration || !addCalories) return;

    const dur = parseInt(addDuration) || 0;
    const cal = parseInt(addCalories) || 0;

    const newItem: WorkoutItem = {
      id: `w-${Date.now()}`,
      type: addType,
      duration: dur,
      calories: cal
    };

    setWorkouts(prev => [newItem, ...prev]);
    setAddDuration("");
    setAddCalories("");
    
    setSuccessMsg(`Workout logged successfully`);
    confetti({
      particleCount: 50,
      spread: 45,
      colors: ["#22d3ee", "#3b82f6"]
    });
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const totalDuration = workouts.reduce((acc, item) => acc + item.duration, 0);
  const totalCalories = workouts.reduce((acc, item) => acc + item.calories, 0);

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity className="h-7 w-7 text-cyan-500 animate-spin-slow" /> Fitness & Activity Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Workout scheduling, steps analytics, and lifestyle milestones.
          </p>
        </div>
      </div>

      {/* Grid 1: Steps progress and Steps trends chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step Counter circular dial */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Steps Today</span>
          
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
                stroke="#06b6d4"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402.1}
                initial={{ strokeDashoffset: 402.1 }}
                animate={{ strokeDashoffset: 402.1 - (402.1 * 9240) / 10000 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">9,240</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 10,000 steps</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6 w-full text-left">
            <div>
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase">Distance</span>
              <p className="text-sm font-black text-slate-700 dark:text-white mt-0.5">6.8 km</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-455 dark:text-slate-400 uppercase">Active Time</span>
              <p className="text-sm font-black text-slate-700 dark:text-white mt-0.5">50 min</p>
            </div>
          </div>
        </div>

        {/* Weekly Steps Recharts Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-cyan-500" /> Weekly Step Trends
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Target: 10,000 steps/day</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={{ 
                    background: "rgba(15, 23, 42, 0.8)", 
                    border: "none", 
                    borderRadius: "12px", 
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }} 
                />
                <Bar 
                  dataKey="steps" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
            <span>Weekly Average: 9,560 steps</span>
            <span className="text-cyan-500 flex items-center gap-1 font-bold"><Zap className="h-3.5 w-3.5" /> High activity rate</span>
          </div>
        </div>

      </div>

      {/* Grid 2: Workout Planner (Left) & Achievements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Workout Planner / Log */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-brand-blue" /> Workout Logs
            </h3>

            {/* List */}
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pt-2">
              {workouts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No workouts logged today.</p>
              ) : (
                workouts.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 text-xs">
                    <div className="text-left">
                      <p className="font-bold text-slate-700 dark:text-slate-350">{w.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {w.duration} min &bull; {w.calories} kcal burned
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-550/10 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add workout panel */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase mb-3">Log Today&rsquo;s Workout</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold outline-none text-slate-600 dark:text-slate-350"
              >
                <option value="Strength Training">Strength Training</option>
                <option value="Running">Running</option>
                <option value="Swimming">Swimming</option>
                <option value="Yoga & Core">Yoga & Core</option>
                <option value="Cycling">Cycling</option>
              </select>

              <input
                type="number"
                value={addDuration}
                onChange={(e) => setAddDuration(e.target.value)}
                placeholder="Duration (min)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none"
              />

              <input
                type="number"
                value={addCalories}
                onChange={(e) => setAddCalories(e.target.value)}
                placeholder="Calories (kcal)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none"
              />

            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Totals: {totalDuration}m &bull; {totalCalories} kcal
              </span>
              <button
                onClick={handleAddWorkout}
                className="py-2 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs shadow-sm transition-all"
              >
                Log Workout
              </button>
            </div>

            <AnimatePresence>
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-brand-emerald font-bold text-center mt-3"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Achievements / Badges */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-amber-500" /> Milestone Badges
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {badges.map(badge => (
                <div 
                  key={badge.name} 
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center ${
                    badge.unlocked
                      ? "bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/10 opacity-100"
                      : "bg-slate-100/20 dark:bg-slate-900/10 border-dashed border-slate-200 dark:border-slate-800 opacity-50"
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-md">{badge.icon}</span>
                  <div className="mt-2.5">
                    <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-350">{badge.name}</h4>
                    <p className="text-[8px] text-slate-400 leading-normal font-semibold mt-1">{badge.desc}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase mt-2 px-1.5 py-0.5 rounded ${
                    badge.unlocked ? "text-brand-emerald bg-brand-emerald/10" : "text-slate-400 bg-slate-100 dark:bg-slate-800"
                  }`}>
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-[9px] text-slate-400 font-bold uppercase">
            Unlock achievements to synchronize custom health indicators.
          </div>
        </div>

      </div>

    </div>
  );
}
