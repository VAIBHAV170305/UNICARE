"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password.trim());
      if (!res.success) {
        setError(res.error || "Login failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsSubmitting(true);

    const demoEmail = "demo@unicare.ai";
    const demoPassword = "password123";

    try {
      const res = await login(demoEmail, demoPassword);
      if (!res.success) {
        // If demo user is missing from DB (e.g. cleared storage), register it first
        const demoName = "Alex";
        await signup(demoEmail, demoPassword, demoName);
        
        // Save full onboarding profile for demo user to bypass onboarding
        const usersStr = localStorage.getItem("unicare_users_db") || "[]";
        const users = JSON.parse(usersStr);
        const demoProfile = {
          name: "Alex",
          age: 28,
          gender: "Male",
          height: 180,
          weight: 75,
          medicalHistory: "Mild seasonal asthma",
          allergies: "None",
          healthGoals: "Cardiovascular endurance"
        };
        
        const updatedUsers = users.map((u: { email: string; profile?: unknown }) => 
          u.email.toLowerCase() === demoEmail.toLowerCase()
            ? { ...u, profile: demoProfile }
            : u
        );
        localStorage.setItem("unicare_users_db", JSON.stringify(updatedUsers));
        
        // Re-login to fetch the profile
        await login(demoEmail, demoPassword);
      }
    } catch (err) {
      setError("An error occurred launching the demo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/15 blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[90px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-4"
          >
            <Image
              src="/logo.png"
              alt="UniCare Logo"
              width={56}
              height={56}
              className="h-14 w-14 rounded-2xl shadow-lg shadow-brand-purple/20 object-cover"
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent"
          >
            Welcome back to <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">UniCare</span>
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 tracking-wide uppercase"
          >
            Your AI Healthcare Companion
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
          className="glass-card relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-white/[0.08] bg-white/70 dark:bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl"
        >
          {error && (
            <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/40 dark:bg-slate-950/40 py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 focus:bg-white dark:focus:bg-slate-950/60"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200/60 dark:border-white/[0.08] bg-white/40 dark:bg-slate-950/40 py-3.5 pl-11 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 focus:bg-white dark:focus:bg-slate-950/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-purple py-4 text-xs font-black uppercase text-white shadow-lg shadow-brand-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]" />
            <span className="mx-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              OR
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]" />
          </div>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 py-4 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch with Demo Account</span>
          </button>

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to UniCare?{" "}
              <Link
                href="/signup"
                className="font-bold text-brand-blue hover:text-brand-purple hover:underline transition-all"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
