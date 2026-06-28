"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Brain, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  Moon, 
  Utensils, 
  UserCheck, 
  Check, 
  Users, 
  Smile, 
  ChevronRight, 
  Clock, 
  Award,
  Zap
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useAuth } from "@/context/AuthContext";
import AIParticleSphere from "@/components/AIParticleSphere";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

interface StatItemProps {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

function StatItem({ end, label, prefix = "", suffix = "" }: StatItemProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000; // ms
    const incrementTime = 30;
    const totalSteps = duration / incrementTime;
    const stepValue = end / totalSteps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center p-6 rounded-2xl glass-card relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <p className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setHealthScore(88), 600);
    return () => clearTimeout(timer);
  }, []);

  const timelineStages = [
    {
      age: "Ages 18-30",
      title: "Foundation & Performance",
      description: "Establish baseline fitness, optimize active nutrition, monitor hydration, and support high cognitive demands.",
      recommendations: ["Activity optimization", "Hydration targets", "Sleep structure logs", "Symptom logs"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      age: "Ages 30-45",
      title: "Balance & Resilience",
      description: "Manage occupational stress, sleep architecture, cardiac resilience, and support hormonal transitions.",
      recommendations: ["Stress & HRV tracking", "Cardiovascular checks", "Reproductive wellness tracking", "Sleep hygiene score"],
      color: "from-emerald-500 to-teal-500",
    },
    {
      age: "Ages 45-60",
      title: "Preventive Optimization",
      description: "Focus on bone density, cardiovascular elasticity, metabolic efficiency, and mental acuity.",
      recommendations: ["Metabolic screenings", "Vascular risk index", "Joint flexibility score", "Longevity dietary plans"],
      color: "from-purple-500 to-indigo-500",
    },
    {
      age: "Ages 60+",
      title: "Longevity & Vitality",
      description: "Active memory retention, motor coordination, custom cardiac schedules, and cellular nutrition support.",
      recommendations: ["Cognitive checkups", "Gait stability tracker", "Anti-inflammatory diets", "Preventive check alerts"],
      color: "from-amber-500 to-orange-500",
    },
  ];

  const features = [
    {
      title: "AI Companion",
      desc: "Instant clinical-grade insights, symptoms analyses, and customized lifestyle suggestions.",
      icon: Sparkles,
      color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20",
      link: "/dashboard/ai-companion"
    },
    {
      title: "Mental Wellness",
      desc: "Guided mindfulness, interactive breathing coaches, anxiety tracking, and emotional diaries.",
      icon: Brain,
      color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20",
      link: "/dashboard/mental-wellness"
    },
    {
      title: "Women's Wellness",
      desc: "Menstrual cycles tracking, dynamic hormonal advice, wellness logging, and cycle predictions.",
      icon: Heart,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      link: "/dashboard/womens-wellness"
    },
    {
      title: "Men's Wellness",
      desc: "Burnout analytics, physical load parameters, sleep quality trackers, and cardiac scores.",
      icon: Flame,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      link: "/dashboard/mens-wellness"
    },
    {
      title: "Nutrition & Hydration",
      desc: "Macro-nutritional distribution, customized meal planners, healthy recipes, and water reminders.",
      icon: Utensils,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      link: "/dashboard/nutrition"
    },
    {
      title: "Fitness Planner",
      desc: "Dynamic workout configurations, steps dashboard, activity graphs, and milestones.",
      icon: Activity,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      link: "/dashboard/fitness"
    },
    {
      title: "Emergency Support",
      desc: "Medical QR profiles, emergency phone numbers, and instant SOS beacons with safety timers.",
      icon: ShieldAlert,
      color: "text-red-500 bg-red-500/10 border-red-500/20",
      link: "/dashboard/emergency"
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-brand-blue/10 dark:bg-brand-blue/5 blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 dark:bg-brand-purple/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[350px] h-[350px] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[90px]" />
      </div>

      <FloatingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs font-semibold text-brand-blue dark:text-brand-purple-light shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-brand-emerald animate-pulse" />
              <span>Next-Generation Predictive Healthcare</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              One Companion. <br />
              <span className="gradient-text-blue-green">Every Body.</span> <br />
              Every Stage of Life.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg font-medium leading-relaxed"
            >
              UniCare is an AI-powered personalized health platform. Understand your metrics, get clinical-grade suggestions, track physical milestones, and keep your mental wellness at its peak.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link
                href={user ? "/dashboard" : "/login"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold text-sm shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/35 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span>{user ? "Enter Personal Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <a
                href="#features"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
              >
                <span>Explore Features</span>
              </a>
            </motion.div>

            {/* Mock Sync Integrations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-8 border-t border-slate-200 dark:border-slate-900"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Seamlessly Syncs With
              </p>
              <div className="flex flex-wrap items-center gap-6 opacity-60 dark:opacity-40">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight flex items-center gap-1.5"><Zap className="h-4 w-4 text-red-500" /> Apple Health</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight flex items-center gap-1.5"><Activity className="h-4 w-4 text-blue-500" /> Google Fit</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight flex items-center gap-1.5"><Heart className="h-4 w-4 text-emerald-500" /> Fitbit</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight flex items-center gap-1.5"><Moon className="h-4 w-4 text-indigo-500" /> Oura Ring</span>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Element (AI Particle Sphere & Floating Metric Cards) */}
          <div className="lg:col-span-5 relative flex items-center justify-center h-[400px] md:h-[500px]">
            
            {/* The 3D Canvas Sphere */}
            <div className="absolute inset-0">
              <AIParticleSphere />
            </div>

            {/* Floating Card 1: Heart Rate */}
            <motion.div
              initial={{ x: -60, y: 50, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              className="absolute top-[10%] left-[-5%] sm:left-[5%] p-4 rounded-2xl glass-card flex items-center gap-3 shadow-lg select-none border-l-4 border-l-brand-blue"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue animate-pulse">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white">72 <span className="text-xs font-medium text-slate-400">bpm</span></p>
              </div>
            </motion.div>

            {/* Floating Card 2: Sleep Score */}
            <motion.div
              initial={{ x: 60, y: -40, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="absolute bottom-[15%] right-[-5%] sm:right-[5%] p-4 rounded-2xl glass-card flex items-center gap-3 shadow-lg select-none border-l-4 border-l-brand-purple"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Moon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sleep Quality</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white">88% <span className="text-xs font-semibold text-brand-emerald">Optimal</span></p>
              </div>
            </motion.div>

            {/* Floating Card 3: Health Score (Central Circle) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="absolute z-20 flex flex-col items-center justify-center p-6 rounded-full glass-card h-40 w-40 shadow-2xl border-2 border-brand-emerald/30 bg-white/80 dark:bg-slate-900/80"
            >
              <div className="relative flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="44"
                    stroke="url(#heroGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={276.4}
                    initial={{ strokeDashoffset: 276.4 }}
                    animate={{ strokeDashoffset: 276.4 - (276.4 * healthScore) / 100 }}
                    transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{healthScore}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Health Index</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 md:px-8 border-t border-slate-200/60 dark:border-slate-900/60 bg-white/40 dark:bg-slate-950/20 scroll-mt-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-brand-emerald uppercase tracking-widest">Wellness Ecosystem</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Complete Platform for Total Health
            </p>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              UniCare aggregates multi-device telemetry data, physical symptoms logs, nutritional entries, and emotional metrics to generate a holistic, clinical-grade overview of your body.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.title} variants={cardVariants}>
                  <Link
                    href={feat.link}
                    className="group relative block p-6 rounded-2xl glass-card hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300 text-left border border-slate-200/60 dark:border-slate-900/60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className={`inline-flex p-3 rounded-xl border ${feat.color} mb-4 group-hover:scale-110 transition-transform`}>
                      {feat.title === "Women's Wellness" ? (
                        <Image
                          src="/womens-logo.png"
                          alt="Women's Wellness"
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded object-cover"
                        />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-purple-light transition-colors mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-bold text-slate-400 group-hover:text-brand-blue dark:group-hover:text-brand-purple-light transition-colors gap-1">
                      <span>Open Module</span>
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-brand-purple uppercase tracking-widest">Global Impact</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Trusted by Patients & Physicians Worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatItem end={12450} label="Active Users" suffix="+" />
            <StatItem end={489000} label="Health Scans Completed" suffix="+" />
            <StatItem end={45} label="Countries Covered" suffix="+" />
            <StatItem end={850} label="Clinical Advisors" suffix="+" />
          </div>
        </div>
      </section>

      {/* Interactive Timeline Journey */}
      <section id="timeline" className="py-24 px-4 md:px-8 bg-white/40 dark:bg-slate-950/20 border-y border-slate-200/60 dark:border-slate-900/60 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-brand-blue uppercase tracking-widest">Health Journey</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Every Stage of Life, Covered
            </p>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              Our clinical companion is tailored dynamically as you age. Switch below to see how UniCare updates recommendations according to your physical maturity.
            </p>
          </div>

          {/* Timeline Selector tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-2xl relative z-10">
            {timelineStages.map((stage, idx) => (
              <button
                key={stage.age}
                onClick={() => setActiveTimeline(idx)}
                className={`relative py-3 px-4 rounded-xl text-xs font-bold transition-colors duration-250 ${
                  activeTimeline === idx
                    ? "text-brand-blue dark:text-white animate-pulse-slow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <span className="relative z-10">{stage.age}</span>
                {activeTimeline === idx && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/40 dark:border-slate-700/40 z-0"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Display active stage panel */}
          <motion.div
            key={activeTimeline}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl glass-card border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left"
          >
            <div className="md:col-span-7 space-y-4">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${timelineStages[activeTimeline].color} uppercase tracking-widest`}>
                {timelineStages[activeTimeline].age}
              </span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                {timelineStages[activeTimeline].title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {timelineStages[activeTimeline].description}
              </p>
            </div>

            <div className="md:col-span-5 bg-slate-50/70 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200/30 dark:border-slate-800/30 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Trackers & Preventive Actions
              </h4>
              <ul className="space-y-2">
                {timelineStages[activeTimeline].recommendations.map((rec) => (
                  <li key={rec} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-brand-emerald shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 md:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-brand-blue uppercase tracking-widest">User Stories</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              What Our Community Says
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            
            {/* Card 1 */}
            <motion.div variants={cardVariants} className="p-6 rounded-2xl glass-card text-left border border-slate-200/60 dark:border-slate-900/60 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;UniCare has fundamentally transformed how I manage my stress. The AI Companion analyzes my biometric inputs from my Oura ring and suggests tailored breathing cycles. I feel like I have a medical consultant in my pocket.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-800/30 mt-6">
                <div className="h-9 w-9 rounded-full bg-brand-blue/20 flex items-center justify-center font-bold text-brand-blue text-xs">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Jonathan Davis</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Software Architect, age 34</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={cardVariants} className="p-6 rounded-2xl glass-card text-left border border-slate-200/60 dark:border-slate-900/60 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;The women&rsquo;s wellness component is so much cleaner and more premium than typical cycle tracking apps. The symptom checker correlates with my sleep metrics to help me understand how my hormones affect my recovery.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-800/30 mt-6">
                <div className="h-9 w-9 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple text-xs">
                  SC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Sarah Connor</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Product Designer, age 29</p>
                </div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={cardVariants} className="p-6 rounded-2xl glass-card text-left border border-slate-200/60 dark:border-slate-900/60 relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-amber-400">
                  {"★".repeat(5)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;As a runner over 50, preventive cardiac tracking is vital. UniCare matches my weekly cardio output with dynamic hydration targets. It&rsquo;s incredibly simple, readable, and visually stunning.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-800/30 mt-6">
                <div className="h-9 w-9 rounded-full bg-brand-emerald/20 flex items-center justify-center font-bold text-brand-emerald text-xs">
                  MH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Marcus Harris</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Marathon Runner, age 52</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Call to Action */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-slate-200/50 dark:border-slate-800/40 glass-card">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-brand-emerald/5 -z-10" />
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-brand-blue/10 dark:bg-brand-blue/5 blur-[50px] pointer-events-none" />
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to Optimize Your Vitality?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Join thousands of users tracking, analyzing, and improving their health score. Create your free dashboard now.
            </p>
            <div className="pt-2">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <span>{user ? "Initialize Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-12 px-6 bg-white/40 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs font-semibold">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-blue text-white flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">UniCare</span>
          </div>
          <div>
            <p>&copy; {new Date().getFullYear()} UniCare Inc. One Companion. Every Body. Every Stage of Life.</p>
          </div>
          <div className="flex gap-4 uppercase tracking-widest text-[9px] text-slate-400">
            <span className="hover:text-slate-600 dark:hover:text-white cursor-pointer">Privacy</span>
            <span>&middot;</span>
            <span className="hover:text-slate-600 dark:hover:text-white cursor-pointer">Terms</span>
            <span>&middot;</span>
            <span className="hover:text-slate-600 dark:hover:text-white cursor-pointer">Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
