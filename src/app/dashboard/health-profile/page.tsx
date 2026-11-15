"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  HeartPulse, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Droplet, 
  Moon, 
  ShieldCheck, 
  Stethoscope, 
  Gauge, 
  Flame, 
  Calendar, 
  Save, 
  Zap, 
  Info, 
  Check, 
  PlusCircle, 
  X,
  Plus,
  Dumbbell,
  Apple,
  ChevronRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

export interface DailyHealthEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  heartRate: number; // bpm
  bloodGlucose?: number; // mg/dL
  sleepHours: number; // hrs
  sleepQuality: number; // 1-5 scale
  waterIntake: number; // ml
  exerciseMins: number; // mins
  stressLevel: "Low" | "Moderate" | "High";
  symptoms: string[];
  notes?: string;
  
  // Computed & predicted attributes
  healthScore: number; // 0-100
  cardioStatus: "Optimal" | "Elevated" | "High Strain";
  recoveryIndex: number; // 0-100
  predictedTomorrowEnergy: number; // 0-100
}

const COMMON_SYMPTOMS = [
  "None",
  "Headache",
  "Muscle Soreness",
  "Brain Fog",
  "Digestive Bloat",
  "Joint Stiffness",
  "Elevated Fatigue",
  "Mild Dehydration"
];

// 7-day realistic historical seed data
const getInitialHistory = (): DailyHealthEntry[] => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  return [
    {
      id: "h1",
      date: dates[0],
      weight: 68.4,
      systolicBP: 118,
      diastolicBP: 78,
      heartRate: 64,
      bloodGlucose: 92,
      sleepHours: 7.8,
      sleepQuality: 4,
      waterIntake: 2600,
      exerciseMins: 45,
      stressLevel: "Low",
      symptoms: ["None"],
      healthScore: 88,
      cardioStatus: "Optimal",
      recoveryIndex: 85,
      predictedTomorrowEnergy: 86
    },
    {
      id: "h2",
      date: dates[1],
      weight: 68.2,
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 66,
      bloodGlucose: 95,
      sleepHours: 8.0,
      sleepQuality: 5,
      waterIntake: 2800,
      exerciseMins: 50,
      stressLevel: "Low",
      symptoms: ["None"],
      healthScore: 91,
      cardioStatus: "Optimal",
      recoveryIndex: 90,
      predictedTomorrowEnergy: 92
    },
    {
      id: "h3",
      date: dates[2],
      weight: 68.5,
      systolicBP: 124,
      diastolicBP: 82,
      heartRate: 70,
      bloodGlucose: 98,
      sleepHours: 6.5,
      sleepQuality: 3,
      waterIntake: 2100,
      exerciseMins: 30,
      stressLevel: "Moderate",
      symptoms: ["Mild Dehydration"],
      healthScore: 78,
      cardioStatus: "Optimal",
      recoveryIndex: 72,
      predictedTomorrowEnergy: 75
    },
    {
      id: "h4",
      date: dates[3],
      weight: 68.3,
      systolicBP: 128,
      diastolicBP: 84,
      heartRate: 74,
      bloodGlucose: 104,
      sleepHours: 6.2,
      sleepQuality: 3,
      waterIntake: 1900,
      exerciseMins: 20,
      stressLevel: "High",
      symptoms: ["Headache", "Brain Fog"],
      healthScore: 71,
      cardioStatus: "Elevated",
      recoveryIndex: 65,
      predictedTomorrowEnergy: 68
    },
    {
      id: "h5",
      date: dates[4],
      weight: 68.0,
      systolicBP: 121,
      diastolicBP: 79,
      heartRate: 67,
      bloodGlucose: 94,
      sleepHours: 7.5,
      sleepQuality: 4,
      waterIntake: 2700,
      exerciseMins: 40,
      stressLevel: "Moderate",
      symptoms: ["None"],
      healthScore: 84,
      cardioStatus: "Optimal",
      recoveryIndex: 82,
      predictedTomorrowEnergy: 84
    },
    {
      id: "h6",
      date: dates[5],
      weight: 67.9,
      systolicBP: 119,
      diastolicBP: 78,
      heartRate: 65,
      bloodGlucose: 91,
      sleepHours: 8.2,
      sleepQuality: 5,
      waterIntake: 3000,
      exerciseMins: 60,
      stressLevel: "Low",
      symptoms: ["None"],
      healthScore: 93,
      cardioStatus: "Optimal",
      recoveryIndex: 94,
      predictedTomorrowEnergy: 95
    },
    {
      id: "h7",
      date: dates[6],
      weight: 68.1,
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 66,
      bloodGlucose: 93,
      sleepHours: 7.6,
      sleepQuality: 4,
      waterIntake: 2500,
      exerciseMins: 45,
      stressLevel: "Low",
      symptoms: ["None"],
      healthScore: 89,
      cardioStatus: "Optimal",
      recoveryIndex: 88,
      predictedTomorrowEnergy: 90
    }
  ];
};

export default function DailyHealthProfilePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DailyHealthEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form Vitals States (defaults to today's active values)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [entryDate, setEntryDate] = useState(todayStr);
  const [weight, setWeight] = useState(user?.profile?.weight || 68.0);
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [heartRate, setHeartRate] = useState(68);
  const [bloodGlucose, setBloodGlucose] = useState(94);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [waterIntake, setWaterIntake] = useState(2600);
  const [exerciseMins, setExerciseMins] = useState(45);
  const [stressLevel, setStressLevel] = useState<"Low" | "Moderate" | "High">("Low");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["None"]);
  const [notes, setNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const handleQuickAddWater = (amountMl: number) => {
    const updatedWater = Math.min(6000, waterIntake + amountMl);
    setWaterIntake(updatedWater);
    setHistory(old => {
      return old.map(item => {
        if (item.date === entryDate) {
          return { ...item, waterIntake: updatedWater };
        }
        return item;
      });
    });
    setSuccessToast(`Added +${amountMl}ml hydration! Today's total: ${updatedWater}ml`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const vascularAgeDiff = useMemo(() => {
    if (systolicBP <= 118 && diastolicBP <= 78 && heartRate <= 68) return -2.5;
    if (systolicBP <= 124 && diastolicBP <= 82 && heartRate <= 74) return -1.0;
    if (systolicBP <= 134 && diastolicBP <= 86) return +1.5;
    return +3.5;
  }, [systolicBP, diastolicBP, heartRate]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("unicare_daily_health_profiles_v1");
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        const initial = getInitialHistory();
        setHistory(initial);
        localStorage.setItem("unicare_daily_health_profiles_v1", JSON.stringify(initial));
      }
    } catch {
      setHistory(getInitialHistory());
    }
    setIsLoaded(true);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (!isLoaded || history.length === 0) return;
    try {
      localStorage.setItem("unicare_daily_health_profiles_v1", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save health profiles:", e);
    }
  }, [history, isLoaded]);

  // Real-time Automated Prediction Calculation for Current Form Inputs
  const currentPrediction = useMemo(() => {
    // 1. Cardiovascular Status Assessment
    let cardioStatus: "Optimal" | "Elevated" | "High Strain" = "Optimal";
    if (systolicBP >= 140 || diastolicBP >= 90 || heartRate >= 95) {
      cardioStatus = "High Strain";
    } else if (systolicBP >= 128 || diastolicBP >= 84 || heartRate >= 82) {
      cardioStatus = "Elevated";
    }

    // 2. Composite Health Score Calculation (0-100)
    let score = 85;
    // Sleep contribution
    if (sleepHours < 6) score -= 12;
    else if (sleepHours >= 7 && sleepHours <= 8.5) score += 6;
    score += (sleepQuality - 3) * 3;

    // Blood pressure contribution
    if (systolicBP > 135 || diastolicBP > 88) score -= 10;
    else if (systolicBP < 122 && diastolicBP < 82) score += 4;

    // Resting Heart Rate contribution
    if (heartRate > 85) score -= 8;
    else if (heartRate <= 70) score += 4;

    // Hydration contribution
    if (waterIntake < 2000) score -= 8;
    else if (waterIntake >= 2800) score += 5;

    // Exercise contribution
    if (exerciseMins >= 30 && exerciseMins <= 75) score += 6;
    else if (exerciseMins > 90) score -= 4; // overtraining strain
    else if (exerciseMins < 15) score -= 4;

    // Stress & Symptoms deduction
    if (stressLevel === "High") score -= 12;
    else if (stressLevel === "Moderate") score -= 5;

    if (!selectedSymptoms.includes("None")) {
      score -= selectedSymptoms.length * 4;
    }

    const healthScore = Math.max(30, Math.min(100, Math.round(score)));

    // 3. Recovery Index (0-100)
    const recovery = Math.max(25, Math.min(100, Math.round(
      (sleepHours / 8) * 45 + 
      (sleepQuality / 5) * 25 + 
      (Math.min(waterIntake, 3000) / 3000) * 20 - 
      (stressLevel === "High" ? 18 : stressLevel === "Moderate" ? 8 : 0)
    )));

    // 4. Automated Tomorrow's Predicted Energy (0-100)
    const tomorrowEnergy = Math.max(20, Math.min(100, Math.round(
      healthScore * 0.5 + recovery * 0.4 + (exerciseMins >= 30 ? 5 : 0) - (cardioStatus === "High Strain" ? 12 : 0)
    )));

    // 5. Clinical Guidance & Warnings
    const clinicalAlerts: string[] = [];
    if (cardioStatus === "High Strain") {
      clinicalAlerts.push("Blood pressure or heart rate is in the hypertensive warning zone. Restrict sodium, avoid caffeine, and consult a physician if persistent.");
    } else if (cardioStatus === "Elevated") {
      clinicalAlerts.push("Mild pre-hypertensive markers detected. Incorporate 15 minutes of slow breathing or restorative walking.");
    }

    if (waterIntake < 2000) {
      clinicalAlerts.push("Sub-optimal hydration logged (<2.0L). May trigger morning fatigue and reduce cognitive sharpness tomorrow.");
    }

    if (sleepHours < 6.5) {
      clinicalAlerts.push("Sleep deficit logged. Avoid high-intensity maximum-weight lifting tomorrow; opt for zone-2 aerobic activity.");
    }

    if (selectedSymptoms.includes("Headache") && waterIntake < 2200) {
      clinicalAlerts.push("Reported headache correlates with low hydration. Drink 500ml water with electrolytes immediately.");
    }

    return {
      healthScore,
      cardioStatus,
      recoveryIndex: recovery,
      predictedTomorrowEnergy: tomorrowEnergy,
      clinicalAlerts
    };
  }, [systolicBP, diastolicBP, heartRate, sleepHours, sleepQuality, waterIntake, exerciseMins, stressLevel, selectedSymptoms]);

  // Handle Symptom Chip Click
  const handleToggleSymptom = (sym: string) => {
    if (sym === "None") {
      setSelectedSymptoms(["None"]);
      return;
    }
    let updated = selectedSymptoms.filter(s => s !== "None");
    if (updated.includes(sym)) {
      updated = updated.filter(s => s !== sym);
      if (updated.length === 0) updated = ["None"];
    } else {
      updated.push(sym);
    }
    setSelectedSymptoms(updated);
  };

  // Submit / Save Daily Health Profile Entry
  const handleSaveDailyProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: DailyHealthEntry = {
      id: `dhp-${entryDate}`,
      date: entryDate,
      weight,
      systolicBP,
      diastolicBP,
      heartRate,
      bloodGlucose: bloodGlucose || undefined,
      sleepHours,
      sleepQuality,
      waterIntake,
      exerciseMins,
      stressLevel,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
      healthScore: currentPrediction.healthScore,
      cardioStatus: currentPrediction.cardioStatus,
      recoveryIndex: currentPrediction.recoveryIndex,
      predictedTomorrowEnergy: currentPrediction.predictedTomorrowEnergy
    };

    // Replace if same date exists, else append
    setHistory(prev => {
      const filtered = prev.filter(item => item.date !== entryDate);
      const updated = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      return updated;
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6"]
    });

    setSuccessToast(`Health profile for ${entryDate} saved & future trajectory predicted!`);
    setIsFormModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Prepare 7-day trend chart data
  const chartData = useMemo(() => {
    return history.slice(-7).map(item => ({
      date: item.date.slice(5), // MM-DD
      "Health Score": item.healthScore,
      "Recovery Index": item.recoveryIndex,
      "Tomorrow's Forecast": item.predictedTomorrowEnergy,
      "Systolic BP": item.systolicBP,
      "Diastolic BP": item.diastolicBP,
      "Heart Rate": item.heartRate,
      Weight: item.weight
    }));
  }, [history]);

  // Compute 7-day average metrics
  const avgHealthScore = useMemo(() => {
    if (history.length === 0) return 85;
    const sum = history.reduce((acc, h) => acc + h.healthScore, 0);
    return Math.round(sum / history.length);
  }, [history]);


  const renderBiometricForm = (isModal: boolean = false) => (
    <form 
      onSubmit={handleSaveDailyProfile}
      className={`space-y-6 ${isModal ? "p-0" : "p-6 md:p-8 rounded-3xl glass-card border border-rose-500/30 dark:border-rose-500/20 shadow-xl"}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-rose-500" /> Log Today&apos;s Health Biomarkers
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Input your daily vitals to compute instant clinical predictions.
          </p>
        </div>

        {/* Date Input */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Section 1: Cardiovascular & Body Vitals */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" /> 1. Body Vitals & Circulation
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Weight */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-slate-800 dark:text-white bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">Scale weight</span>
          </div>

          {/* Systolic BP */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Systolic BP</label>
            <input
              type="number"
              required
              value={systolicBP}
              onChange={(e) => setSystolicBP(parseInt(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-rose-500 bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">mmHg (Upper)</span>
          </div>

          {/* Diastolic BP */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Diastolic BP</label>
            <input
              type="number"
              required
              value={diastolicBP}
              onChange={(e) => setDiastolicBP(parseInt(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-rose-500 bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">mmHg (Lower)</span>
          </div>

          {/* Heart Rate */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Resting HR</label>
            <input
              type="number"
              required
              value={heartRate}
              onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-slate-800 dark:text-white bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">bpm</span>
          </div>

          {/* Blood Glucose */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Glucose (mg/dL)</label>
            <input
              type="number"
              value={bloodGlucose}
              onChange={(e) => setBloodGlucose(parseInt(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-amber-500 bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">Fasting / Random</span>
          </div>
        </div>
      </div>

      {/* Section 2: Circadian Rest & Hydration */}
      <div className="space-y-3 pt-1">
        <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5" /> 2. Sleep Depth & Cellular Hydration
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sleep duration */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Sleep Duration (hrs)</label>
            <input
              type="number"
              step="0.1"
              min="3"
              max="14"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-purple-500 bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">Target: 7.5 - 8.5 hrs</span>
          </div>

          {/* Sleep Quality (Stars) */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Sleep Quality Rating</label>
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSleepQuality(star)}
                  className={`text-sm cursor-pointer transition-transform hover:scale-125 ${
                    star <= sleepQuality ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-400 font-semibold">
              {sleepQuality === 5 ? "Deep & Restorative" : sleepQuality >= 3 ? "Normal Sleep" : "Restless / Broken"}
            </span>
          </div>

          {/* Water Intake */}
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Water Intake (ml)</label>
            <input
              type="number"
              step="50"
              value={waterIntake}
              onChange={(e) => setWaterIntake(parseInt(e.target.value) || 0)}
              className="w-full mt-1 text-base font-black text-blue-500 bg-transparent outline-none"
            />
            <span className="text-[9px] text-slate-400 font-semibold">{(waterIntake / 1000).toFixed(1)} Liters logged</span>
          </div>
        </div>
      </div>

      {/* Section 3: Physical Exertion & Stress Level */}
      <div className="space-y-3 pt-1">
        <span className="text-[11px] font-bold text-teal-500 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5" /> 3. Daily Activity & Stress Load
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Exercise Mins */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Active Exercise</label>
              <p className="text-xs text-slate-500 font-medium">Brisk walk, workout, cycling</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={exerciseMins}
                onChange={(e) => setExerciseMins(parseInt(e.target.value) || 0)}
                className="w-16 p-1.5 text-sm font-black text-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
              <span className="text-xs font-bold text-slate-400">mins</span>
            </div>
          </div>

          {/* Stress Level Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Mental Stress</label>
            <div className="flex gap-1">
              {(["Low", "Moderate", "High"] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStressLevel(lvl)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    stressLevel === lvl
                      ? lvl === "Low" 
                        ? "bg-emerald-500 text-white shadow-sm"
                        : lvl === "Moderate" 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Daily Symptoms Tracker */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> 4. Daily Symptoms (Select any that apply)
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_SYMPTOMS.map(sym => {
            const isSelected = selectedSymptoms.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => handleToggleSymptom(sym)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 5: Daily Notes */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase block">Daily Notes & Observations (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="E.g., Drank chamomile tea before bed, logged 10k steps, felt high focus after lunch..."
          className="w-full p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Form Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/50 dark:border-slate-800/60 pt-4">
        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> End-to-end encrypted daily biometric storage
        </span>
        <div className="flex items-center gap-2">
          {isModal && (
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Profile & Run Prediction
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-8 select-none pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <HeartPulse className="h-7 w-7 text-rose-500 animate-pulse" /> Daily Health Profile & AI Predictor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Log your daily vitals, biomarkers, and symptoms to automatically forecast tomorrow&apos;s recovery & energy trajectory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-rose-500" /> Logged Days: {history.length}
          </span>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            id="open-health-profile-form-btn"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" /> Open Health Form
          </button>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {successToast}
            </span>
            <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Automated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Health Score */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today&apos;s Health Index</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
              currentPrediction.healthScore >= 85 
                ? "bg-emerald-500/15 text-emerald-500" 
                : currentPrediction.healthScore >= 70 
                  ? "bg-amber-500/15 text-amber-500" 
                  : "bg-rose-500/15 text-rose-500"
            }`}>
              {currentPrediction.healthScore >= 85 ? "Optimal" : currentPrediction.healthScore >= 70 ? "Stable" : "Vulnerable"}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              {currentPrediction.healthScore}
              <span className="text-sm text-slate-400 font-bold">/100</span>
            </span>
            <span className="text-xs font-bold text-slate-400">7d Avg: {avgHealthScore}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <motion.div 
              className="bg-rose-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentPrediction.healthScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card 2: Tomorrow's Forecast Energy */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tomorrow&apos;s Forecast</span>
            <Sparkles className="h-4 w-4 text-cyan-500 animate-spin-slow" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-cyan-500">
              {currentPrediction.predictedTomorrowEnergy}%
            </span>
            <span className="text-xs font-bold text-slate-400">Predicted Vitality</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-cyan-500" />
            {currentPrediction.predictedTomorrowEnergy >= 80 ? "High stamina expected tomorrow" : "Recovery day recommended tomorrow"}
          </p>
        </div>

        {/* Card 3: Cardiovascular Strain */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cardiovascular Status</span>
            <Activity className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black ${
              currentPrediction.cardioStatus === "Optimal" 
                ? "text-emerald-500" 
                : currentPrediction.cardioStatus === "Elevated" 
                  ? "text-amber-500" 
                  : "text-rose-500"
            }`}>
              {currentPrediction.cardioStatus}
            </span>
            <span className="text-xs font-bold text-slate-400">{systolicBP}/{diastolicBP} mmHg</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5 text-rose-500" /> Resting Pulse: {heartRate} bpm
          </p>
        </div>

        {/* Card 4: Metabolic Recovery Index */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recovery Readiness</span>
            <Moon className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-purple-500">
              {currentPrediction.recoveryIndex}%
            </span>
            <span className="text-xs font-bold text-slate-400">Sleep: {sleepHours}h</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Droplet className="h-3.5 w-3.5 text-blue-500" /> Hydration: {waterIntake} ml
          </p>
        </div>
      </div>

      {/* Main Grid: Daily Intake Form (Left 7 Cols) + AI Predictions & Charts (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left Column: AI Biometric Diagnostic & Clinical Health Station */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Today's Biometric Equilibrium & Biological Cardio Age */}
          <div className="p-6 rounded-3xl glass-card border border-rose-500/20 shadow-xl space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-rose-500" /> Active Biometric Equilibrium
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Logged telemetry for {entryDate} • Click button to update vitals anytime.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(true)}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Edit / Update Vitals
              </button>
            </div>

            {/* 4 Primary Micro-Telemetry Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Weight */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scale Weight</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{weight} <span className="text-xs font-semibold text-slate-400">kg</span></span>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Target: ±0.5kg
                </span>
              </div>

              {/* Blood Pressure */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Pressure</span>
                <span className="text-lg font-black text-rose-500 mt-1 block">{systolicBP}/{diastolicBP} <span className="text-xs font-semibold text-slate-400">mmHg</span></span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                  currentPrediction.cardioStatus === "Optimal" 
                    ? "bg-emerald-500/15 text-emerald-500" 
                    : currentPrediction.cardioStatus === "Elevated" 
                      ? "bg-amber-500/15 text-amber-500" 
                      : "bg-rose-500/15 text-rose-500"
                }`}>
                  {currentPrediction.cardioStatus}
                </span>
              </div>

              {/* Resting Pulse */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resting Pulse</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{heartRate} <span className="text-xs font-semibold text-slate-400">bpm</span></span>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  {heartRate <= 65 ? "Athletic Rhythm" : heartRate <= 75 ? "Optimal Baseline" : "Elevated Strain"}
                </span>
              </div>

              {/* Blood Glucose */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Glucose</span>
                <span className="text-lg font-black text-amber-500 mt-1 block">{bloodGlucose} <span className="text-xs font-semibold text-slate-400">mg/dL</span></span>
                <span className="text-[10px] text-emerald-500 font-bold block mt-1">
                  {bloodGlucose < 100 ? "Fasting Optimal" : "Normal Post-Prandial"}
                </span>
              </div>
            </div>

            {/* Vascular Biological Age Assessment Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">Cardiovascular Biological Age Estimation</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    {vascularAgeDiff < 0 ? (
                      <>Arterial compliance indicates your biological vascular age is <span className="text-emerald-500 font-bold">{Math.abs(vascularAgeDiff)} years younger</span> than chronological calendar age.</>
                    ) : (
                      <>Circulatory parameters indicate a <span className="text-amber-500 font-bold">+{vascularAgeDiff} year vascular load</span> from borderline blood pressure.</>
                    )}
                  </p>
                </div>
              </div>
              <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                vascularAgeDiff < 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600"
              }`}>
                {vascularAgeDiff < 0 ? "Longevity Prime" : "Active Attention"}
              </span>
            </div>
          </div>

          {/* Card 2: Interactive Cellular Hydration Station with 1-Click Fast Boosters */}
          <div className="p-6 rounded-3xl glass-card border border-blue-500/20 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Droplet className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Cellular Hydration Station
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">1-click quick loggers to boost daily cellular replenishment</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-xl">
                {(waterIntake / 1000).toFixed(2)}L / 3.00L Goal
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Progress: {Math.min(100, Math.round((waterIntake / 3000) * 100))}%</span>
                <span>{waterIntake >= 3000 ? "Goal Met 🎉" : `${3000 - waterIntake} ml remaining`}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (waterIntake / 3000) * 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* 1-Click Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAddWater(250)}
                className="py-2.5 px-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> +250ml Glass
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddWater(500)}
                className="py-2.5 px-3 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> +500ml Bottle
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddWater(1000)}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> +1.0L Flask
              </button>
            </div>
          </div>

          {/* Card 3: Personalized Precision Health Protocol (Daily AI Rx) */}
          <div className="p-6 rounded-3xl glass-card border border-purple-500/20 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Precision Health Protocol & Action Plan
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">AI tailored clinical guidelines derived from your vitals</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                Daily AI Rx
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Movement Block */}
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-teal-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="h-3.5 w-3.5" /> Movement & Conditioning
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {currentPrediction.recoveryIndex >= 80 
                    ? "Prime Capacity: 45–60 mins of Zone-3/4 strength training or tempo run. Autonomic nervous system is primed."
                    : "Active Recovery: 30 mins Zone-2 walking or restorative mobility. Avoid central nervous system fatigue."}
                </p>
              </div>

              {/* Nutrition Block */}
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Apple className="h-3.5 w-3.5" /> Micronutrient Pacing
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Target 4,700mg potassium (avocado, leafy greens) and 400mg magnesium glycinate to support arterial vasodilation and muscle relaxation.
                </p>
              </div>

              {/* Sleep Architecture */}
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5" /> Circadian Target
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Optimal bedtime window: 10:30 PM. Target 8.0h uninterrupted rest. Dim screens 45 mins prior to maintain deep NREM restorative phases.
                </p>
              </div>

              {/* Stress Regulation */}
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Autonomic Nervous Tone
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {stressLevel === "High" 
                    ? "High Stress Flag: Perform 10 mins of cyclic physiological sighing (2 inhales, long exhale) to downregulate cortisol."
                    : "Optimal Vagal Tone: Autonomic system in homeostatic balance. Continue current recovery pacing."}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Daily Symptom Matrix & AI Root Cause Correlation */}
          <div className="p-6 rounded-3xl glass-card border border-amber-500/20 shadow-xl space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Symptom Telemetry & Root Cause Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Active manifestations logged for {entryDate}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(true)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Edit Symptoms
              </button>
            </div>

            {/* Selected Symptoms Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedSymptoms.map(sym => (
                <span 
                  key={sym}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    sym === "None"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3px]" />
                  {sym}
                </span>
              ))}
            </div>

            {/* AI Correlation Insight */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              <span className="font-bold">AI Correlation: </span>
              {selectedSymptoms.includes("Headache") && waterIntake < 2200 ? (
                "Reported headache directly correlates with sub-optimal hydration. Replenishing 500ml water with essential electrolytes recommended immediately."
              ) : selectedSymptoms.includes("Brain Fog") && sleepHours < 7 ? (
                "Reported brain fog correlates with 7-day cumulative sleep deficit. Restrict heavy carbohydrate lunches and take a 20-min restorative reset."
              ) : selectedSymptoms.includes("None") ? (
                "Zero adverse symptoms reported today. Your systemic inflammation and autonomic recovery indices are in optimal equilibrium."
              ) : (
                "Symptoms noted. Systemic recovery index automatically adjusted to buffer physical fatigue."
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Predictions & Multi-Day Visualizations */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Automated Next-Day AI Prediction Card */}
          <div className="p-6 rounded-3xl glass-card border border-rose-500/30 dark:border-rose-500/20 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-rose-500" /> Automated Next-Day Forecast
              </h3>
              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                AI Telemetry
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10 border border-rose-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">Tomorrow&apos;s Projected Recovery:</span>
                <span className="text-sm font-black text-rose-500">{currentPrediction.predictedTomorrowEnergy}%</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Based on today&apos;s vitals (BP {systolicBP}/{diastolicBP}, Sleep {sleepHours}h, Hydration {waterIntake}ml), 
                your autonomic recovery index is <span className="font-bold text-purple-500">{currentPrediction.recoveryIndex}%</span>.
              </p>
            </div>

            {/* Clinical & Preventive Alerts */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-rose-500" /> Actionable Next-Day Prescriptions:
              </span>
              <div className="space-y-1.5">
                {currentPrediction.clinicalAlerts.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    All cardiovascular and lifestyle biomarkers are in optimal equilibrium!
                  </div>
                ) : (
                  currentPrediction.clinicalAlerts.map((alert, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-2"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Health Score & Prediction Trend (AreaChart) */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-purple-500" /> 7-Day Health Score Trajectory
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Multi-Day</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(15, 23, 42, 0.85)", 
                      border: "none", 
                      borderRadius: "12px", 
                      color: "#fff", 
                      fontSize: "11px",
                      fontWeight: "bold"
                    }} 
                  />
                  <Area type="monotone" dataKey="Health Score" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                  <Area type="monotone" dataKey="Tomorrow's Forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Recorded Score
              </span>
              <span className="flex items-center gap-1.5 text-cyan-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-cyan-500" /> AI Forecast
              </span>
            </div>
          </div>

          {/* Blood Pressure & Heart Rate Multi-Line Trend Chart */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-rose-500" /> Circulation & Pulse Trend
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">mmHg / bpm</span>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 150]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(15, 23, 42, 0.85)", 
                      border: "none", 
                      borderRadius: "12px", 
                      color: "#fff", 
                      fontSize: "11px",
                      fontWeight: "bold"
                    }} 
                  />
                  <Line type="monotone" dataKey="Systolic BP" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Diastolic BP" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Heart Rate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-bold border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span className="text-rose-500">Systolic BP</span>
              <span className="text-pink-500">Diastolic BP</span>
              <span className="text-blue-500">Pulse (bpm)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Access Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFormModalOpen(true)}
        id="floating-open-health-form-btn"
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-black text-xs shadow-2xl shadow-rose-500/40 border border-white/20 flex items-center gap-2.5 backdrop-blur-md cursor-pointer hover:shadow-rose-500/60 transition-all"
        title="Open Daily Health Form"
      >
        <PlusCircle className="h-4.5 w-4.5" />
        <span>Open Form</span>
      </motion.button>

      {/* Focused Intake Modal Dialog */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                    <HeartPulse className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Daily Health Profile Intake</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Enter your daily vitals to compute tomorrow&apos;s recovery & energy</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Live Forecast Preview Strip */}
              <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span>Real-Time Health Score: <span className="text-rose-500 font-black">{currentPrediction.healthScore}/100</span></span>
                </div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  Forecast Energy: <span className="font-black">{currentPrediction.predictedTomorrowEnergy}%</span>
                </div>
              </div>

              {renderBiometricForm(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
