"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Search, Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import CommandPalette from "./CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function FloatingNavbar() {
  const { user } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Statistics", href: "#statistics" },
    { label: "Timeline", href: "#timeline" },
    { label: "Reviews", href: "#testimonials" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl rounded-2xl glass-panel shadow-lg border border-slate-200/50 dark:border-slate-800/40 px-4 md:px-6 py-2 flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="UniCare Logo"
            className="h-9 w-9 rounded-xl shadow-md shadow-brand-blue/20 object-cover"
          />
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              UniCare
            </span>
            <span className="hidden sm:block text-[8px] tracking-widest uppercase font-bold text-brand-emerald">
              AI companion
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-purple-light transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Command Palette trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-all text-xs"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
            <kbd className="text-[10px] font-semibold bg-slate-200/50 dark:bg-slate-800 px-1 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">
              Ctrl K
            </kbd>
          </button>

          <ThemeSwitcher />

          <Link
            href={user ? "/dashboard" : "/login"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white text-xs font-semibold shadow-md shadow-brand-blue/15 hover:shadow-brand-blue/25 hover:scale-[1.02] transition-all"
          >
            <span>{user ? "Enter Dashboard" : "Sign In"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeSwitcher />
          
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-39 w-[95%] rounded-2xl glass-panel shadow-xl border border-slate-200/50 dark:border-slate-800/40 p-5 md:hidden flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-blue transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <Link
              href={user ? "/dashboard" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-sm shadow-md"
            >
              <span>{user ? "Enter Dashboard" : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
