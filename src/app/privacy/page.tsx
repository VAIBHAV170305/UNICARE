"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

/**
 * Privacy Policy page displaying details of health data encryption,
 * audit logging, AI boundaries, and full user data purging.
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Last Updated: June 28, 2026
            </p>
          </div>
        </div>

        <section className="space-y-4 leading-relaxed">
          <p className="text-sm">
            At UniCare, we hold your healthcare data privacy to clinical-grade standards. We believe in absolute transparency, user consent, and security-first policies in alignment with standard healthcare regulations (HIPAA-inspired practices).
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
            1. Information We Collect
          </h2>
          <p className="text-sm">
            We collect personal health telemetry data (age, weight, height, gender), health logs (symptoms, sleep duration, water intake, active calories), and medical information (medical history, allergies, health goals) only with your explicit consent.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
            2. How We Store and Protect Your Data
          </h2>
          <p className="text-sm">
            Any sensitive health information, including your medical history and allergies, is encrypted client-side or symmetrically encrypted server-side (using AES-256 standards) before being stored at rest in our databases.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
            3. AI Disclaimers & Limitations
          </h2>
          <p className="text-sm border-l-4 border-amber-500 pl-4 bg-amber-500/5 dark:bg-amber-500/10 py-3 rounded-r-lg">
            <strong>AI Disclaimer:</strong> UniCare provides educational and wellness guidance only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
            4. Access Logs & Activity Audits
          </h2>
          <p className="text-sm">
            For security audits, we log activities such as user logins, profile updates, and deletions. These audit logs record event signatures (timestamps, action type) but never store clinical responses, chat logs, or plaintext biometrics.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
            5. Your Rights: Purging & Account Deletion
          </h2>
          <p className="text-sm">
            You maintain absolute ownership of your data. You can delete your account at any time through your Profile/Settings page. Upon initiating account deletion, all user profile info, telemetry logs, and chat records are purged permanently and irreversibly.
          </p>
        </section>
      </main>
    </div>
  );
}
