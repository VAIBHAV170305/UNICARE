"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Scale, 
  Ruler, 
  Calendar,
  Sparkle,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function OnboardingPage() {
  const { user, saveOnboardingProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [medicalHistory, setMedicalHistory] = useState("None");
  const [allergies, setAllergies] = useState("None");
  const [healthGoals, setHealthGoals] = useState("Cardiovascular endurance");

  const totalSteps = 3;

  const nextStep = () => { if (step < totalSteps) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== totalSteps) return;
    setIsSubmitting(true);
    try {
      await saveOnboardingProfile({ age, gender, height, weight, medicalHistory, allergies, healthGoals });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Basic Profile", "Body Vitals", "Goals & History"];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">

      {/* Background ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-brand-blue/8 dark:bg-brand-blue/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-brand-purple/8 dark:bg-brand-purple/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-brand-emerald/5 blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-800 dark:text-white">UniCare</span>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* Hero header */}
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 dark:bg-brand-purple/15 border border-brand-purple/20 dark:border-brand-purple/30 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand-purple animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">
                Health Profiling
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Let&apos;s customize
              <span className="block bg-gradient-to-r from-brand-blue via-brand-purple to-brand-emerald bg-clip-text text-transparent">
                your companion
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Hey <strong className="text-slate-700 dark:text-white">{user?.name || "there"}</strong>, a few quick details help us optimize your personalized advice.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              const isActive = s === step;
              const isDone = s < step;
              return (
                <React.Fragment key={s}>
                  <button
                    type="button"
                    onClick={() => s < step && setStep(s)}
                    disabled={s >= step}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border-2 ${
                        isActive
                          ? "bg-gradient-to-tr from-brand-blue to-brand-purple border-transparent text-white scale-110 shadow-lg shadow-brand-purple/30"
                          : isDone
                          ? "bg-brand-emerald/10 border-brand-emerald text-brand-emerald"
                          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block transition-colors ${
                      isActive ? "text-brand-purple dark:text-brand-purple" : isDone ? "text-brand-emerald" : "text-slate-400 dark:text-slate-600"
                    }`}>
                      {label}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < stepLabels.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 relative mb-5">
                      <div className="absolute inset-0 rounded-full bg-slate-200 dark:bg-white/[0.06]" />
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-500"
                        style={{ width: s < step ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Wizard Card */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-slate-900/60 p-7 md:p-8 shadow-xl dark:shadow-black/30 backdrop-blur-xl">
              <AnimatePresence mode="wait">

                {/* ── Step 1: Basic Profile ── */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-brand-blue" />
                        Basic Profile
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Age and gender help customize metabolic rates and exercise capacity targets.
                      </p>
                    </div>

                    {/* Age Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Age</span>
                        <span className="text-sm font-black text-brand-blue">{age} yrs</span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="18" max="90"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-800 accent-brand-blue cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>18</span><span>90</span>
                      </div>
                    </div>

                    {/* Gender Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Gender Identity
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Male", "Female", "Non-binary", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                              gender === g
                                ? "bg-brand-blue/10 dark:bg-brand-blue/15 border-brand-blue text-brand-blue"
                                : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:bg-slate-900"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Body Vitals ── */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Scale className="h-5 w-5 text-brand-purple" />
                        Physiological Vitals
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Height and weight help calculate BMI, hydration targets, and cardiovascular metrics.
                      </p>
                    </div>

                    {/* Height Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Ruler className="h-3 w-3" />Height
                        </span>
                        <span className="text-sm font-black text-brand-purple">{height} cm</span>
                      </div>
                      <input
                        type="range"
                        min="120" max="220"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-800 accent-brand-purple cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>120 cm</span><span>220 cm</span>
                      </div>
                    </div>

                    {/* Weight Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Scale className="h-3 w-3" />Weight
                        </span>
                        <span className="text-sm font-black text-brand-purple">{weight} kg</span>
                      </div>
                      <input
                        type="range"
                        min="30" max="150"
                        value={weight}
                        onChange={(e) => setWeight(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-800 accent-brand-purple cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>30 kg</span><span>150 kg</span>
                      </div>
                    </div>

                    {/* BMI Preview */}
                    {(() => {
                      const bmi = weight / ((height / 100) ** 2);
                      const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
                      const bmiColor = bmi < 18.5 ? "text-amber-500" : bmi < 25 ? "text-brand-emerald" : bmi < 30 ? "text-orange-500" : "text-red-500";
                      return (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/[0.06]">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Est. BMI</span>
                          <span className={`text-sm font-black ${bmiColor}`}>{bmi.toFixed(1)} — {bmiCategory}</span>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ── Step 3: Clinical & Goals ── */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ x: 24, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -24, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-brand-emerald" />
                        Goals & Clinical Background
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Help us understand your health history and what you want to achieve with UniCare.
                      </p>
                    </div>

                    {/* Medical History */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Medical History / Pre-existing Conditions
                      </label>
                      <input
                        type="text"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="e.g. Mild asthma, None"
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/40 py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-brand-purple/60 dark:focus:border-brand-purple/50 transition-colors"
                        required
                      />
                    </div>

                    {/* Allergies */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Food / Drug Allergies
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="e.g. Peanuts, Penicillin, None"
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/40 py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-brand-purple/60 dark:focus:border-brand-purple/50 transition-colors"
                        required
                      />
                    </div>

                    {/* Health Goals */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Primary Health Goal
                      </label>
                      <select
                        value={healthGoals}
                        onChange={(e) => setHealthGoals(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/40 py-3.5 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-purple/60 dark:focus:border-brand-purple/50 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="Cardiovascular endurance">Cardiovascular endurance</option>
                        <option value="Weight loss">Weight loss & toning</option>
                        <option value="General fitness & wellness">General fitness & wellness</option>
                        <option value="Stress reduction & sleep improvement">Stress reduction & sleep improvement</option>
                        <option value="Chronic condition management">Chronic condition management</option>
                        <option value="Women's hormonal wellness">{"Women's hormonal wellness"}</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1.5 py-3 px-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/40 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:bg-slate-900 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple text-xs font-black uppercase text-white shadow-lg shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 py-3.5 px-7 rounded-2xl bg-gradient-to-r from-brand-emerald to-teal-500 text-xs font-black uppercase text-white shadow-lg shadow-brand-emerald/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkle className="h-4 w-4 animate-spin-slow" />
                    {isSubmitting ? "Saving Profile..." : "Complete Setup"}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Footer note */}
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
            🔒 Your health data is encrypted and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
