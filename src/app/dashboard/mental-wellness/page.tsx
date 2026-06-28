"use client";

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Smile, 
  Wind, 
  Sparkles, 
  Plus, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  RefreshCw,
  Info
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface JournalEntry {
  id: string;
  time: string;
  mood: string;
  text: string;
}

export default function MentalWellness() {
  // Breathing Coach states: "idle" | "inhale" | "hold-in" | "exhale" | "hold-out"
  const [breathState, setBreathState] = useState<"idle" | "inhale" | "hold-in" | "exhale" | "hold-out">("idle");
  const [breathTimer, setBreathTimer] = useState(4);
  const [journalText, setJournalText] = useState("");
  const [journalMood, setJournalMood] = useState("Calm");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { id: "j1", time: "Yesterday, 4:20 PM", mood: "Reflective", text: "Finished the core UniCare modules. Feeling accomplished and excited about the design language." },
    { id: "j2", time: "2 days ago, 9:00 AM", mood: "Energetic", text: "Morning run was fantastic. Slept deeply. Excited for a productive session." }
  ]);

  const [affirmation, setAffirmation] = useState("My mind is calm, clear, and fully focused on the present moment.");

  const affirmations = [
    "My mind is calm, clear, and fully focused on the present moment.",
    "I possess the strength to navigate work stress with composure and grace.",
    "I choose to inhale confidence and exhale anxiety.",
    "My body is recovering, my mind is relaxing, and my vitality is high.",
    "I am in full control of my emotions and my physiological response."
  ];

  // Breathing Coach logic
  useEffect(() => {
    if (breathState === "idle") return;

    const timer = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          // Transition states
          if (breathState === "inhale") {
            setBreathState("hold-in");
            return 4;
          } else if (breathState === "hold-in") {
            setBreathState("exhale");
            return 4;
          } else if (breathState === "exhale") {
            setBreathState("hold-out");
            return 4;
          } else {
            setBreathState("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathState]);

  const handleStartBreathing = () => {
    setBreathState("inhale");
    setBreathTimer(4);
  };

  const handleStopBreathing = () => {
    setBreathState("idle");
  };

  const handleAddJournal = () => {
    if (!journalText.trim()) return;

    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      time: "Just now",
      mood: journalMood,
      text: journalText
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    setJournalText("");
    confetti({
      particleCount: 40,
      spread: 30,
      colors: ["#8b5cf6", "#3b82f6"]
    });
  };

  const handleNewAffirmation = () => {
    const filter = affirmations.filter(a => a !== affirmation);
    const random = filter[Math.floor(Math.random() * filter.length)];
    setAffirmation(random);
  };

  const emotionData = [
    { day: "Mon", calmness: 60, fatigue: 40 },
    { day: "Tue", calmness: 74, fatigue: 30 },
    { day: "Wed", calmness: 68, fatigue: 50 },
    { day: "Thu", calmness: 80, fatigue: 25 },
    { day: "Fri", calmness: 85, fatigue: 20 },
  ];

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-brand-purple fill-current" /> Mental Wellness Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Box breathing trainers, emotional mapping diaries, and mental resilience.
          </p>
        </div>
      </div>

      {/* Grid 1: Breathing coach and Positive Affirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Box Breathing Coach */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-between text-center min-h-[360px]">
          <div className="w-full flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wind className="h-4.5 w-4.5 text-brand-purple" /> Box Breathing Trainer
            </h3>
            {breathState !== "idle" && (
              <button 
                onClick={handleStopBreathing}
                className="text-[10px] font-bold text-red-500 uppercase hover:underline"
              >
                Stop Session
              </button>
            )}
          </div>

          {/* Breathing Animated Circle */}
          <div className="relative flex items-center justify-center py-10 w-full">
            
            {/* Ambient glowing backdrops */}
            <AnimatePresence>
              {breathState !== "idle" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0.1, 0.25, 0.1], 
                      scale: 
                        breathState === "inhale" || breathState === "hold-in" ? 1.6 : 1.1 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
                    className="absolute h-48 w-48 rounded-full bg-brand-purple/15 blur-xl pointer-events-none"
                  />
                  {/* Expanding secondary ring */}
                  <motion.div
                    animate={{
                      scale: 
                        breathState === "inhale" ? [1.0, 1.6] :
                        breathState === "hold-in" ? 1.6 :
                        breathState === "exhale" ? [1.6, 1.0] : 1.0,
                      opacity: 
                        breathState === "inhale" ? [0.6, 0.2] :
                        breathState === "hold-in" ? 0.3 :
                        breathState === "exhale" ? [0.2, 0.6] : 0.4
                    }}
                    transition={{ duration: 4.0, ease: "easeInOut" }}
                    className="absolute h-36 w-36 rounded-full border-2 border-brand-purple/40 pointer-events-none"
                  />
                  {/* Outer spinning dash ring */}
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: 
                        breathState === "inhale" || breathState === "hold-in" ? 1.8 : 1.2
                    }}
                    transition={{ rotate: { repeat: Infinity, duration: 15, ease: "linear" }, scale: { duration: 4.0, ease: "easeInOut" } }}
                    className="absolute h-36 w-36 rounded-full border border-dashed border-brand-purple/35 pointer-events-none"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Pulsing Breathing Ring */}
            <motion.div
              animate={{
                scale: 
                  breathState === "inhale" ? 1.4 :
                  breathState === "hold-in" ? 1.4 :
                  breathState === "exhale" ? 0.9 :
                  breathState === "hold-out" ? 0.9 : 1.0
              }}
              transition={{ duration: breathState === "idle" ? 1.0 : 4.0, ease: "easeInOut" }}
              className={`h-36 w-36 rounded-full flex flex-col items-center justify-center border-4 relative z-10 ${
                breathState === "idle" 
                  ? "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800" 
                  : "bg-brand-purple/10 border-brand-purple shadow-2xl shadow-brand-purple/25"
              }`}
            >
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {breathState === "idle" ? "Ready" : breathTimer}
              </span>
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mt-1">
                {breathState === "idle" ? "Box method" : breathState.replace("-", " ")}
              </span>
            </motion.div>
          </div>

          <div className="w-full space-y-4">
            {breathState === "idle" ? (
              <button
                onClick={handleStartBreathing}
                className="w-full py-3 rounded-2xl bg-brand-purple hover:bg-brand-purple/95 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                Start Breathing Exercise (4-4-4-4)
              </button>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold italic">
                {breathState === "inhale" && "Inhale deeply through your nose, expanding your abdomen."}
                {breathState === "hold-in" && "Hold the breath gently. Keep shoulders relaxed."}
                {breathState === "exhale" && "Exhale slowly through your mouth, releasing all tension."}
                {breathState === "hold-out" && "Hold empty. Prepare for the next cycle."}
              </p>
            )}
          </div>
        </div>

        {/* Positive Affirmations Generator */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-brand-blue" /> Daily Positive Affirmation
            </h3>
            
            <div className="pt-8">
              <p className="text-xl font-extrabold text-slate-700 dark:text-slate-200 leading-relaxed italic text-left pl-4 border-l-4 border-brand-purple">
                &ldquo;{affirmation}&rdquo;
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <button
              onClick={handleNewAffirmation}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Next Affirmation</span>
            </button>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Affirmations trigger parasympathetic nervous alignment.
            </p>
          </div>
        </div>

      </div>

      {/* Grid 2: Mood Journal & Emotion Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mood Journal logging */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-[420px]">
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-brand-blue" /> Interactive Mood Journal
            </h3>

            {/* Mood selector */}
            <div className="flex gap-2">
              {["Calm", "Reflective", "Stressful", "Energetic"].map(m => (
                <button
                  key={m}
                  onClick={() => setJournalMood(m)}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                    journalMood === m
                      ? "bg-brand-blue/15 border-brand-blue text-brand-blue"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Journal text area */}
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write down your thoughts, fears, or goals..."
              rows={3}
              className="w-full bg-white/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-brand-blue/50"
            />

            <button
              onClick={handleAddJournal}
              disabled={!journalText.trim()}
              className={`py-2 px-4 rounded-xl text-xs font-bold text-white transition-all shadow ${
                journalText.trim()
                  ? "bg-brand-blue hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              Log Entry
            </button>
          </div>

          {/* List of recent journals */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-4 overflow-y-auto no-scrollbar max-h-36 space-y-3">
            {journalEntries.map(entry => (
              <div key={entry.id} className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/10 text-left">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 dark:text-slate-400">
                  <span>{entry.time}</span>
                  <span className="text-brand-purple uppercase tracking-wider">{entry.mood}</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mt-1">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion trends */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-[420px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-brand-emerald" /> Emotional Variance (Calmness Index)
            </h3>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">Last 5 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="calmGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
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
                  dataKey="calmness" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5} 
                  name="Calmness Level" 
                  fillOpacity={1} 
                  fill="url(#calmGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-105/30 dark:border-slate-800/60 pt-4 mt-2">
            <span>Overall rating: Stable calmness trajectory</span>
            <span className="text-brand-emerald flex items-center gap-1 font-bold"><CheckCircle className="h-3.5 w-3.5" /> Normal</span>
          </div>
        </div>

      </div>

    </div>
  );
}
