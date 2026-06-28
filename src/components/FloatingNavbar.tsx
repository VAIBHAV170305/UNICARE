"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import CommandPalette from "./CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Features",   href: "#features"     },
  { label: "Statistics", href: "#statistics"   },
  { label: "Timeline",   href: "#timeline"     },
  { label: "Reviews",    href: "#testimonials" },
];

export default function FloatingNavbar() {
  const { user } = useAuth();
  const [isCommandOpen, setIsCommandOpen]     = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection]     = useState<string>("");
  const [scrolled, setScrolled]               = useState(false);

  // Track scroll depth for navbar backdrop enhancement
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver — highlight the nav link for the visible section
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35, rootMargin: "-60px 0px 0px 0px" }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Smooth-scroll handler — no full-page navigation, just scrollIntoView
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#")) return;
      e.preventDefault();
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
      }
      setIsMobileMenuOpen(false);
    },
    []
  );

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl rounded-2xl px-4 md:px-6 py-2 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "glass-panel shadow-lg border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-xl"
            : "glass-panel shadow-md border border-slate-200/40 dark:border-slate-800/30 backdrop-blur-md"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="UniCare Logo"
            width={36}
            height={36}
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

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive  = activeSection === sectionId;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-brand-blue dark:text-brand-purple"
                    : "text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-purple"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navActiveIndicator"
                    className="absolute inset-0 rounded-xl bg-brand-blue/8 dark:bg-brand-purple/10 border border-brand-blue/20 dark:border-brand-purple/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
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

        {/* Mobile Controls */}
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
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const sectionId = link.href.replace("#", "");
                const isActive  = activeSection === sectionId;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-base font-semibold transition-colors px-3 py-2 rounded-xl ${
                      isActive
                        ? "text-brand-blue dark:text-brand-purple bg-brand-blue/8 dark:bg-brand-purple/10"
                        : "text-slate-700 dark:text-slate-200 hover:text-brand-blue hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
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
