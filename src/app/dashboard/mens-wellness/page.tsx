"use client";

import React, { useState } from "react";
import { 
  Flame, 
  Heart, 
  Moon, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Zap, 
  CheckCircle,
  Clock,
  Battery
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function MensWellness() {
  const [stressLevel, setStressLevel] = useState(28); // 0-100 %
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const hrTrends = [
    { day: "Mon", rhr: 55, hrv: 70 },
    { day: "Tue", rhr: 54, hrv: 72 },
    { day: "Wed", rhr: 58, hrv: 64 },
    { day: "Thu", rhr: 56, hrv: 74 },
    { day: "Fri", rhr: 55, hrv: 76 },
    { day: "Sat", rhr: 53, hrv: 80 },
    { day: "Sun", rhr: 54, hrv: 78 },
  ];

  const handleRecalibrate = () => {
    setIsScanning(true);
    setScanMessage(null);
    
    // Simulate biometric scan
    setTimeout(() => {
      setIsScanning(false);
      const newStress = Math.floor(20 + Math.random() * 20);
      setStressLevel(newStress);
      setScanMessage("Stress calibration complete. Autonomic balance is stable.");
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ["#3b82f6", "#10b981"]
      });
    }, 2500);
  };

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <Flame className="h-7 w-7 text-amber-500 fill-current animate-pulse" /> Men&rsquo;s Wellness Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Biometric analysis, stress load monitoring, and preventive cardiology.
          </p>
        </div>
      </div>

      {/* Grid 1: Lifestyle score & Burnout insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vitality Lifestyle Score */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lifestyle Score</span>
          
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
                stroke="#f59e0b"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402.1}
                initial={{ strokeDashoffset: 402.1 }}
                animate={{ strokeDashoffset: 402.1 - (402.1 * 78) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">78</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Good index</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold border border-amber-500/20 text-amber-500 bg-amber-500/10">
              Metabolic Peak
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-xs mx-auto">
              Your recovery matches your aerobic workload. Continue focusing on deep sleep quality.
            </p>
          </div>
        </div>

        {/* Burnout Insights */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Battery className="h-4.5 w-4.5 text-brand-emerald" /> Burnout & Cortisol Analysis
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Telemetry synced today</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">Cortisol Predictor</span>
                <p className="text-lg font-black text-slate-700 dark:text-white mt-1">Normal</p>
                <p className="text-[9px] text-slate-400 leading-relaxed font-semibold mt-1">Salivary cortisol equivalent values stable.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">Active Load</span>
                <p className="text-lg font-black text-slate-700 dark:text-white mt-1">680 <span className="text-xs font-semibold text-slate-400">TSS</span></p>
                <p className="text-[9px] text-slate-400 leading-relaxed font-semibold mt-1">Weekly Training Stress Score is inside threshold.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">Autonomic Balance</span>
                <p className="text-lg font-black text-brand-emerald mt-1">Symmetric</p>
                <p className="text-[9px] text-slate-400 leading-relaxed font-semibold mt-1">Sympathetic vs parasympathetic recovery is optimal.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-200/20 bg-slate-50/30 dark:bg-slate-900/30 text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-blue" />
            <span>Optimal windows for sleep focus is between 10:15 PM and 10:45 PM.</span>
          </div>
        </div>

      </div>

      {/* Grid 2: Stress Tracker Widget & Cardiovascular trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stress Calibration Widget */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-[340px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-amber-500" /> Real-time Stress Calibration
            </h3>
            
            <div className="flex items-end justify-between pt-2">
              <div>
                <p className="text-4xl font-black text-slate-800 dark:text-white">{stressLevel}%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Autonomic stress index</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                stressLevel < 35 ? "text-brand-emerald bg-brand-emerald/15" : "text-amber-500 bg-amber-500/15"
              }`}>
                {stressLevel < 35 ? "Relaxed / Stable" : "Mild Tension"}
              </span>
            </div>

            {/* Simulated Scanning Animations */}
            <div className="h-16 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/15 rounded-2xl overflow-hidden relative">
              {isScanning ? (
                <>
                  {/* Holographic scanner laser line */}
                  <motion.div 
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-blue to-transparent shadow-[0_0_8px_#3b82f6]"
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  />
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[9px] font-bold text-brand-blue uppercase animate-pulse">Scanning watch telemetry...</span>
                  </div>
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase">Telemetry link active</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRecalibrate}
              disabled={isScanning}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow ${
                isScanning 
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isScanning ? "Evaluating wearable sensors..." : "Calibrate Wearable Sensors"}
            </button>
            <AnimatePresence>
              {scanMessage && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-brand-emerald font-bold flex items-center gap-1 justify-center"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> {scanMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cardiovascular ECG Trends */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between h-[340px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5 text-red-500 fill-current" /> Cardiovascular ECG Sync
            </h3>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase">Resting HR (bpm) & HRV (ms)</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line 
                  type="monotone" 
                  dataKey="rhr" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  name="Resting Heart Rate" 
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hrv" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  name="Heart Rate Variability" 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-105/30 dark:border-slate-800/60 pt-4 mt-2">
            <span>Average HRV: 74.3 ms &bull; Resting HR: 54.8 bpm</span>
            <span className="text-brand-emerald flex items-center gap-1 font-bold"><TrendingUp className="h-3.5 w-3.5" /> High cardiac elasticity</span>
          </div>
        </div>

      </div>

    </div>
  );
}
