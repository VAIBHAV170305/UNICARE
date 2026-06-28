"use client";

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Moon, 
  Droplet, 
  Flame, 
  Activity, 
  TrendingUp, 
  Clock, 
  BadgeAlert, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Brain, 
  Coffee, 
  Monitor, 
  RotateCcw,
  Sparkle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

interface SimulationState {
  sleepHours: number;
  waterIntake: number;
  screenTime: number;
  exerciseMins: number;
  caffeineCutoff: number;
}

export default function PredictiveHealth() {
  const { user } = useAuth();
  // 1. Simulation inputs
  const [inputs, setInputs] = useState<SimulationState>({
    sleepHours: 8,
    waterIntake: 2500,
    screenTime: 6,
    exerciseMins: 45,
    caffeineCutoff: 6
  });

  const [isSaved, setIsSaved] = useState(false);

  // Reset inputs to default
  const handleReset = () => {
    setInputs({
      sleepHours: 8,
      waterIntake: 2500,
      screenTime: 6,
      exerciseMins: 45,
      caffeineCutoff: 6
    });
    setIsSaved(false);
  };

  // 2. Core predictive engine (mathematical model)
  const predictions = useMemo(() => {
    const { sleepHours, waterIntake, screenTime, exerciseMins, caffeineCutoff } = inputs;

    // Calculate score impacts
    let sleepImpact = 0;
    if (sleepHours < 7) {
      sleepImpact = (7 - sleepHours) * -8;
    } else if (sleepHours > 9) {
      sleepImpact = (sleepHours - 9) * -3; // Sluggishness
    } else {
      sleepImpact = (sleepHours - 7) * 4;
    }

    let waterImpact = 0;
    if (waterIntake < 2000) {
      waterImpact = ((2000 - waterIntake) / 100) * -3;
    } else if (waterIntake >= 3000) {
      waterImpact = 6;
    }

    let screenImpact = 0;
    if (screenTime > 6) {
      screenImpact = (screenTime - 6) * -4;
    } else if (screenTime < 3) {
      screenImpact = 5;
    }

    let exerciseImpact = 0;
    if (exerciseMins < 20) {
      exerciseImpact = -5;
    } else if (exerciseMins >= 30 && exerciseMins <= 75) {
      exerciseImpact = 8;
    } else if (exerciseMins > 90) {
      exerciseImpact = -((exerciseMins - 90) / 15) * 1.5; // Overtraining fatigue
    }

    let caffeineImpact = 0;
    if (caffeineCutoff < 6) {
      caffeineImpact = (6 - caffeineCutoff) * -4;
    } else {
      caffeineImpact = 3;
    }

    // Base scores
    const vitalityBase = 72;
    const sleepBase = 75;
    const stressBase = 55;

    // Calculate simulated metrics
    const simulatedVitality = Math.max(10, Math.min(100, Math.round(vitalityBase + sleepImpact * 0.4 + waterImpact * 0.3 + screenImpact * 0.2 + exerciseImpact * 0.4 + caffeineImpact * 0.2)));
    const simulatedSleep = Math.max(10, Math.min(100, Math.round(sleepBase + sleepImpact * 0.7 + exerciseImpact * 0.15 + caffeineImpact * 0.4 + screenImpact * 0.25)));
    const simulatedStress = Math.max(5, Math.min(100, Math.round(stressBase - sleepImpact * 0.3 - waterImpact * 0.1 - screenImpact * 0.4 - exerciseImpact * 0.3 - caffeineImpact * 0.25)));

    // Generate 7-day projections
    // Introduce cumulative effects over the days
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartData = days.map((day, idx) => {
      // Create slight progressive curves
      const sleepDebtAccum = sleepHours < 7 ? idx * -1.8 : 0;
      const dehydrationAccum = waterIntake < 2000 ? idx * -0.8 : 0;
      const fitnessGain = exerciseMins >= 30 ? Math.min(idx * 1.5, 6) : 0;
      
      const dayVitality = Math.max(15, Math.min(100, Math.round(simulatedVitality + sleepDebtAccum + dehydrationAccum + fitnessGain + Math.sin(idx) * 2)));
      const daySleep = Math.max(15, Math.min(100, Math.round(simulatedSleep + sleepDebtAccum * 0.6 + Math.cos(idx) * 1.5)));
      const dayStress = Math.max(5, Math.min(100, Math.round(simulatedStress - sleepDebtAccum * 0.4 - fitnessGain * 0.3 + Math.sin(idx + 1) * 3)));

      return {
        day,
        "Vitality Index": dayVitality,
        "Sleep Quality": daySleep,
        "Stress Level": dayStress
      };
    });

    return {
      vitality: simulatedVitality,
      sleep: simulatedSleep,
      stress: simulatedStress,
      chartData
    };
  }, [inputs]);

  // 3. AI Alerts derived dynamically
  const alerts = useMemo(() => {
    const list = [];
    const { sleepHours, waterIntake, screenTime, exerciseMins, caffeineCutoff } = inputs;

    // Fatigue
    if (sleepHours < 6.5) {
      list.push({
        id: "fatigue",
        type: "danger",
        title: "Cumulative Fatigue Alert",
        desc: "Sleep target under 6.5 hours will trigger a 15% increase in your heart rate variance (HRV) instability by Thursday. Rest recommended.",
        icon: Moon
      });
    } else if (sleepHours < 7.2) {
      list.push({
        id: "fatigue-moderate",
        type: "warning",
        title: "Moderate Sleep Debt",
        desc: "Your recovery pattern shows a slow decline. Aim for 7.5+ hours to fully flush metabolic waste.",
        icon: Moon
      });
    }

    // Dehydration
    if (waterIntake < 2000) {
      list.push({
        id: "dehydration",
        type: "danger",
        title: "Hypohydration Risks",
        desc: "Water logging under 2.0L indicates high blood density predictions. Restrict salt intake and drink 500ml before sleeping.",
        icon: Droplet
      });
    }

    // Stress / Screen time
    if (screenTime > 8 && sleepHours < 7) {
      list.push({
        id: "burnout",
        type: "danger",
        title: "High Burnout Risk",
        desc: "Combining high screen time (>8 hrs) with inadequate sleep creates a high probability of mental fatigue by Wednesday afternoon.",
        icon: Monitor
      });
    }

    // Caffeine cutoff warning
    if (caffeineCutoff < 4) {
      list.push({
        id: "caffeine-sleep",
        type: "warning",
        title: "Late Caffeine Intake",
        desc: "Caffeine consumed within 4 hours of bedtime will disrupt your deep sleep cycles and elevate overnight resting heart rate.",
        icon: Coffee
      });
    }

    // Overtraining
    if (exerciseMins > 90 && sleepHours < 7.5) {
      list.push({
        id: "overtraining",
        type: "warning",
        title: "Muscle Recovery Lag",
        desc: "Your training volume is high (>90m) but sleep is sub-optimal. Risk of minor connective tissue strain predicted.",
        icon: Flame
      });
    }

    // Good Opportunities
    if (sleepHours >= 8 && waterIntake >= 3000 && exerciseMins >= 30 && exerciseMins <= 75) {
      list.push({
        id: "peak-performance",
        type: "success",
        title: "Peak Performance Window",
        desc: "Optimized recovery peaks predicted! Your cognitive alertness and muscle glycogen synthesis will match perfectly tomorrow.",
        icon: CheckCircle2
      });
    }

    // Default neutral advice if no warnings
    if (list.length === 0) {
      list.push({
        id: "optimal",
        type: "info",
        title: "Balanced Routine Projected",
        desc: "Your configured metrics show high homeostatic stability. Maintain this baseline for optimal health indices.",
        icon: Info
      });
    }

    return list;
  }, [inputs]);

  // Handle saving targets
  const handleSave = () => {
    setIsSaved(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#10b981", "#3b82f6"]
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-indigo-500 animate-pulse" />
            Predictive AI Health Forecaster
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Simulate habits &middot; Anticipate risks &middot; Optimize physiological outcomes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Dynamic Profile Baseline Badges */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">User:</span>
          <span className="font-black text-slate-700 dark:text-slate-200">{user?.profile?.name || user?.name || "Demo User"} ({user?.profile?.age || 28} yrs)</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">Gender:</span>
          <span className="font-black text-slate-700 dark:text-slate-200">{user?.profile?.gender || "Male"}</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">Vitals:</span>
          <span className="font-black text-slate-700 dark:text-slate-200">{user?.profile?.height || 180}cm / {user?.profile?.weight || 75}kg</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">Medical History:</span>
          <span className="font-black text-amber-500 dark:text-amber-400">{user?.profile?.medicalHistory || "Mild seasonal asthma"}</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">Allergies:</span>
          <span className="font-black text-slate-700 dark:text-slate-200">{user?.profile?.allergies || "None"}</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-2 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase">Goal:</span>
          <span className="font-black text-brand-purple dark:text-brand-purple/90">{user?.profile?.healthGoals || "Cardiovascular endurance"}</span>
        </div>
      </div>

      {/* Main Grid: Simulator on left, Charts & circular visual on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Sandbox */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col justify-between space-y-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Activity className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Behavior Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              Adjust your daily lifestyle targets below to project how they influence your upcoming week&rsquo;s biomarkers.
            </p>

            <div className="space-y-6">
              {/* Sleep Target */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Daily Sleep Target
                  </span>
                  <span className="font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {inputs.sleepHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={inputs.sleepHours}
                  onChange={(e) => setInputs({ ...inputs, sleepHours: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>4 hrs (Low)</span>
                  <span>8 hrs (Ideal)</span>
                  <span>12 hrs (High)</span>
                </div>
              </div>

              {/* Water Intake */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Droplet className="h-4 w-4 text-brand-blue" />
                    Water Hydration
                  </span>
                  <span className="font-black text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
                    {(inputs.waterIntake / 1000).toFixed(1)} L
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4500"
                  step="250"
                  value={inputs.waterIntake}
                  onChange={(e) => setInputs({ ...inputs, waterIntake: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 accent-brand-blue cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>1.0 L</span>
                  <span>3.0 L (Target)</span>
                  <span>4.5 L</span>
                </div>
              </div>

              {/* Screen Time Limit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Monitor className="h-4 w-4 text-purple-500" />
                    Daily Screen Time
                  </span>
                  <span className="font-black text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {inputs.screenTime} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={inputs.screenTime}
                  onChange={(e) => setInputs({ ...inputs, screenTime: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>1 hr (Low)</span>
                  <span>6 hrs (Average)</span>
                  <span>16 hrs (Heavy)</span>
                </div>
              </div>

              {/* Exercise Duration */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-brand-emerald" />
                    Physical Exercise
                  </span>
                  <span className="font-black text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-md">
                    {inputs.exerciseMins} mins
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={inputs.exerciseMins}
                  onChange={(e) => setInputs({ ...inputs, exerciseMins: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 accent-brand-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>0m (Rest)</span>
                  <span>45m (Active)</span>
                  <span>180m (Extreme)</span>
                </div>
              </div>

              {/* Caffeine Cutoff */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Coffee className="h-4 w-4 text-amber-600" />
                    Caffeine Cutoff
                  </span>
                  <span className="font-black text-amber-600 bg-amber-600/10 px-2 py-0.5 rounded-md">
                    {inputs.caffeineCutoff}h before bed
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={inputs.caffeineCutoff}
                  onChange={(e) => setInputs({ ...inputs, caffeineCutoff: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>0h (Immediate)</span>
                  <span>6h (Recommended)</span>
                  <span>12h (Strict)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow transition-all duration-300 ${
              isSaved 
                ? "bg-brand-emerald border-brand-emerald" 
                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Habit Baseline Saved!</span>
              </>
            ) : (
              <>
                <Sparkle className="h-4.5 w-4.5" />
                <span>Adopt Simulated Targets</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Outputs (Score Circular display & Analytics Chart) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          
          {/* Top of Right: Score & Short Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            
            {/* Vitality Score Ring */}
            <div className="sm:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Projected Vitality</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="50"
                    stroke="url(#predictiveGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={314.16}
                    initial={{ strokeDashoffset: 314.16 }}
                    animate={{ strokeDashoffset: 314.16 - (314.16 * predictions.vitality) / 100 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="predictiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    {predictions.vitality}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Score Index</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-3">
                Calculated homeostatic adaptability based on simulated loads.
              </p>
            </div>

            {/* Quick Prognosis Metrics */}
            <div className="sm:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-indigo-500" />
                  Simulated Outcomes
                </h4>

                <div className="space-y-3.5">
                  {/* Sleep outcome */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Sleep Architecture Index</span>
                      <span className={`${predictions.sleep >= 75 ? "text-brand-emerald" : "text-amber-500"}`}>
                        {predictions.sleep}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-emerald rounded-full"
                        animate={{ width: `${predictions.sleep}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      />
                    </div>
                  </div>

                  {/* Stress outcome */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Autonomic Stress Index (HRV)</span>
                      <span className={`${predictions.stress <= 50 ? "text-brand-emerald" : "text-red-400"}`}>
                        {predictions.stress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-red-400 rounded-full"
                        animate={{ width: `${predictions.stress}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4 text-[10px] text-slate-400 font-bold">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Steady state projection achieves in 4 days.</span>
              </div>
            </div>

          </div>

          {/* Recharts Forecast Projections Chart */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                7-Day Predictive Trends
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Projections</span>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictions.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
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
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(15, 23, 42, 0.9)", 
                      border: "none", 
                      borderRadius: "16px", 
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)"
                    }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Vitality Index" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#vitalityGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Sleep Quality" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#sleepGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Stress Level" 
                    stroke="#f87171" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    fill="none" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: AI Alerts and Risk Assessments */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-6">
          <BadgeAlert className="h-4.5 w-4.5 text-indigo-500" />
          AI Risk Warnings & Preventive Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-4 p-4 rounded-2xl border text-xs font-semibold ${
                    alert.type === "danger" 
                      ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/40 dark:border-rose-900/25" 
                      : alert.type === "warning"
                      ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/40 dark:border-amber-900/20"
                      : alert.type === "success"
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/40 dark:border-emerald-900/20"
                      : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/30 dark:border-slate-800/30"
                  }`}
                >
                  <div className={`p-2 rounded-xl h-fit shrink-0 ${
                    alert.type === "danger"
                      ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500"
                      : alert.type === "warning"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500"
                      : alert.type === "success"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-brand-emerald"
                      : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500"
                  }`}>
                    {alert.type === "danger" ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className={`font-extrabold text-sm ${
                      alert.type === "danger"
                        ? "text-rose-700 dark:text-rose-300"
                        : alert.type === "warning"
                        ? "text-amber-700 dark:text-amber-400"
                        : alert.type === "success"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-800 dark:text-slate-200"
                    }`}>
                      {alert.title}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {alert.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
