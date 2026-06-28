"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Sparkles, Activity, ShieldAlert, BookOpen, Brain, Flame, ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: "Navigation" | "Wellness Modules" | "Emergency";
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: "dashboard",
      title: "Go to Dashboard",
      description: "Overview of your health metrics and tasks",
      icon: Activity,
      action: () => { router.push("/dashboard"); onClose(); },
      category: "Navigation",
    },
    {
      id: "ai-companion",
      title: "Ask AI Companion",
      description: "Chat with UniCare AI health advisor",
      icon: Sparkles,
      action: () => { router.push("/dashboard/ai-companion"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "mental-wellness",
      title: "Mental Wellness",
      description: "Mood journal, breathing exercises, affirmations",
      icon: Brain,
      action: () => { router.push("/dashboard/mental-wellness"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "womens-wellness",
      title: "Women's Wellness",
      description: "Cycle tracker, symptom logger, calendar",
      icon: Heart,
      action: () => { router.push("/dashboard/womens-wellness"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "mens-wellness",
      title: "Men's Wellness",
      description: "Sleep score, stress tracker, burnout levels",
      icon: Flame,
      action: () => { router.push("/dashboard/mens-wellness"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "nutrition",
      title: "Nutrition & Hydration",
      description: "Meal planner, water logger, calorie count",
      icon: BookOpen,
      action: () => { router.push("/dashboard/nutrition"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "fitness",
      title: "Fitness & Workouts",
      description: "Activity tracker, step counters, goals",
      icon: Activity,
      action: () => { router.push("/dashboard/fitness"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "predictions",
      title: "Predictive Health & Forecaster",
      description: "AI-driven wellness forecasts, behavior simulator, early warnings",
      icon: TrendingUp,
      action: () => { router.push("/dashboard/predictions"); onClose(); },
      category: "Wellness Modules",
    },
    {
      id: "emergency",
      title: "SOS / Emergency",
      description: "Emergency contacts, Medical ID, pulse trigger",
      icon: ShieldAlert,
      action: () => { router.push("/dashboard/emergency"); onClose(); },
      category: "Emergency",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles it
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 glass-panel shadow-2xl"
          >
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages, health modules..."
                className="w-full bg-transparent py-1 text-slate-900 dark:text-white outline-none placeholder-slate-400 dark:placeholder-slate-500 text-base"
              />
              <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 ml-2 shadow-sm">
                ESC
              </span>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                Object.entries(
                  filtered.reduce((groups, item) => {
                    if (!groups[item.category]) groups[item.category] = [];
                    groups[item.category].push(item);
                    return groups;
                  }, {} as Record<string, CommandItem[]>)
                ).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h3 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((cmd) => {
                        const Icon = cmd.icon;
                        const index = filtered.indexOf(cmd);
                        const isSelected = index === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                              isSelected
                                ? "bg-brand-blue/10 dark:bg-brand-purple/20 text-brand-blue dark:text-brand-purple-light border-l-2 border-brand-blue dark:border-brand-purple pl-2.5"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isSelected
                                    ? "bg-brand-blue/20 dark:bg-brand-purple/30 text-brand-blue dark:text-brand-purple"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{cmd.title}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  {cmd.description}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-brand-blue dark:text-brand-purple" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
              </div>
              <div>
                <span>Press <kbd className="font-semibold">Ctrl+K</kbd> to toggle</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
