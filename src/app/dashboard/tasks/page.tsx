"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Brain, 
  Utensils, 
  Moon, 
  Briefcase, 
  Clock, 
  Zap, 
  Filter, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Flame, 
  Award, 
  RotateCcw, 
  Pill, 
  Lightbulb,
  Sun,
  Sunset,
  Calendar,
  Timer,
  Check,
  Wand2,
  ChevronUp,
  Bell,
  BellOff,
  Volume2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { 
  addNotification, 
  requestNotificationPermission, 
  sendBrowserNotification, 
  playNotificationChime, 
  evaluateTaskReminders 
} from "@/utils/notifications";

export type TaskCategory = "fitness" | "nutrition" | "mindfulness" | "work" | "recovery" | "medical";
export type TaskPriority = "high" | "medium" | "low";
export type TimeSlot = "morning" | "afternoon" | "evening" | "night";
export type EnergyLevel = "low" | "moderate" | "high";
export type RecurrenceType = "once" | "daily" | "weekdays";

export interface DailyTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  timeSlot: TimeSlot;
  energyLevel: EnergyLevel;
  completed: boolean;
  dueTime?: string;
  durationMins?: number;
  caloriesBurned?: number;
  recurrence?: RecurrenceType;
  reminderEnabled?: boolean;
  reminderOffsetMins?: number;
  notes?: string;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<TaskCategory, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
  bg: string; 
  border: string; 
  activeBg: string;
  desc: string;
}> = {
  fitness: { 
    label: "Physical & Fitness", 
    icon: Activity, 
    color: "text-cyan-500", 
    bg: "bg-cyan-500/10 dark:bg-cyan-950/30", 
    border: "border-cyan-500/20",
    activeBg: "border-cyan-500 bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-500/30",
    desc: "Workouts, runs, stretching"
  },
  nutrition: { 
    label: "Nutrition & Water", 
    icon: Utensils, 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10 dark:bg-emerald-950/30", 
    border: "border-emerald-500/20",
    activeBg: "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/30",
    desc: "Hydration, meals, vitamins"
  },
  mindfulness: { 
    label: "Mindfulness & Mental", 
    icon: Brain, 
    color: "text-purple-500", 
    bg: "bg-purple-500/10 dark:bg-purple-950/30", 
    border: "border-purple-500/20",
    activeBg: "border-purple-500 bg-purple-500/20 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30",
    desc: "Breathing, meditation, journaling"
  },
  work: { 
    label: "Focus & Work", 
    icon: Briefcase, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10 dark:bg-blue-950/30", 
    border: "border-blue-500/20",
    activeBg: "border-blue-500 bg-blue-500/20 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500/30",
    desc: "Deep focus blocks, milestones"
  },
  recovery: { 
    label: "Rest & Sleep", 
    icon: Moon, 
    color: "text-indigo-400", 
    bg: "bg-indigo-500/10 dark:bg-indigo-950/30", 
    border: "border-indigo-500/20",
    activeBg: "border-indigo-500 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/30",
    desc: "Wind-down, sleep hygiene"
  },
  medical: { 
    label: "Care & Meds", 
    icon: Pill, 
    color: "text-rose-500", 
    bg: "bg-rose-500/10 dark:bg-rose-950/30", 
    border: "border-rose-500/20",
    activeBg: "border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/30",
    desc: "Prescriptions, appointments, vitals"
  },
};

const DEFAULT_TASKS: DailyTask[] = [
  {
    id: "t1",
    title: "Morning 30-min cardiovascular brisk walk or jog",
    category: "fitness",
    priority: "high",
    timeSlot: "morning",
    energyLevel: "high",
    completed: true,
    dueTime: "07:30",
    durationMins: 30,
    caloriesBurned: 220,
    recurrence: "daily",
    reminderEnabled: true,
    reminderOffsetMins: 10,
    notes: "Target heart rate zone 2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Drink 750ml mineralized water & take multivitamin",
    category: "nutrition",
    priority: "high",
    timeSlot: "morning",
    energyLevel: "low",
    completed: true,
    dueTime: "08:15",
    durationMins: 5,
    recurrence: "daily",
    reminderEnabled: true,
    reminderOffsetMins: 0,
    notes: "Ensure electrolytes before work session",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Deep focus session on core project deliverable",
    category: "work",
    priority: "high",
    timeSlot: "morning",
    energyLevel: "high",
    completed: false,
    dueTime: "10:00",
    durationMins: 90,
    recurrence: "weekdays",
    reminderEnabled: true,
    reminderOffsetMins: 10,
    notes: "No social media, 90 mins uninterrupted block",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t4",
    title: "Post-lunch 10-min box breathing reset session",
    category: "mindfulness",
    priority: "medium",
    timeSlot: "afternoon",
    energyLevel: "low",
    completed: false,
    dueTime: "14:00",
    durationMins: 10,
    recurrence: "daily",
    reminderEnabled: true,
    reminderOffsetMins: 10,
    notes: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t5",
    title: "High-protein afternoon snack & 500ml water refill",
    category: "nutrition",
    priority: "medium",
    timeSlot: "afternoon",
    energyLevel: "low",
    completed: false,
    dueTime: "16:30",
    durationMins: 15,
    recurrence: "daily",
    reminderEnabled: true,
    reminderOffsetMins: 0,
    notes: "Greek yogurt with chia seeds",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t6",
    title: "Evening digital screen wind-down & mobility stretching",
    category: "recovery",
    priority: "high",
    timeSlot: "night",
    energyLevel: "low",
    completed: false,
    dueTime: "22:00",
    durationMins: 20,
    recurrence: "daily",
    reminderEnabled: true,
    reminderOffsetMins: 30,
    notes: "Turn off blue light screens 45 mins before sleep",
    createdAt: new Date().toISOString(),
  },
];

export default function DailyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form Mode & Visibility
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [activeFormTab, setActiveFormTab] = useState<"detailed" | "quick">("detailed");

  // Form states
  const [title, setTitle] = useState("");
  const [quickInput, setQuickInput] = useState("");
  const [category, setCategory] = useState<TaskCategory>("fitness");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("morning");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("moderate");
  const [dueTime, setDueTime] = useState("08:00");
  const [durationMins, setDurationMins] = useState<number>(30);
  const [caloriesBurned, setCaloriesBurned] = useState<string>("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("daily");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderOffsetMins, setReminderOffsetMins] = useState<number>(10);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<{ taskTitle: string; dueTime: string } | null>(null);
  const [notes, setNotes] = useState("");

  // Feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summary: string;
    burnoutRisk: "Low" | "Moderate" | "Elevated";
    wellnessRatio: number;
    actionableTips: string[];
  } | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("unicare_daily_tasks_v1");
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        setTasks(DEFAULT_TASKS);
      }
    } catch {
      setTasks(DEFAULT_TASKS);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("unicare_daily_tasks_v1", JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to save tasks", e);
    }
  }, [tasks, isLoaded]);

  // Check browser notification permission status on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  // Periodic reminder checking
  useEffect(() => {
    if (!isLoaded || tasks.length === 0) return;
    const check = () => {
      const triggered = evaluateTaskReminders(tasks);
      if (triggered.length > 0) {
        setActiveAlert(triggered[0]);
      }
    };
    check();
    const interval = setInterval(check, 20000);
    return () => clearInterval(interval);
  }, [tasks, isLoaded]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    if (res === "granted") {
      setHasPermission(true);
      sendBrowserNotification("🔔 UniCare Reminders Activated", "You will now receive desktop alerts for scheduled tasks!");
      setFeedbackMsg("Browser notifications enabled! Timely alerts will ring.");
    } else {
      setFeedbackMsg("Browser notifications blocked. Alerts will display in-app.");
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleTestReminderAlert = () => {
    playNotificationChime();
    sendBrowserNotification("⏰ UniCare Reminder Test", "Task reminder chime and desktop notifications are active!");
    setActiveAlert({
      taskTitle: title.trim() || "Daily Hydration & Mindful Break",
      dueTime: dueTime || "Now",
    });
    setFeedbackMsg("Played test chime and displayed notification alert!");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleToggleTaskReminder = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.reminderEnabled;
        if (nextState) {
          addNotification({
            title: "⏰ Reminder Enabled",
            text: `Reminder activated for: "${t.title}" (${t.dueTime || 'scheduled time'})`,
            type: "task_reminder",
            taskId: t.id,
            dueTime: t.dueTime
          });
          playNotificationChime();
          setFeedbackMsg(`Reminder enabled for "${t.title}"!`);
        } else {
          setFeedbackMsg(`Reminder muted for "${t.title}".`);
        }
        setTimeout(() => setFeedbackMsg(null), 3000);
        return { ...t, reminderEnabled: nextState };
      }
      return t;
    }));
  };

  // Quick Natural Language Parser
  const handleQuickMentionParse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickInput.trim()) return;

    const text = quickInput.toLowerCase();
    let detectedCategory: TaskCategory = "work";
    let detectedSlot: TimeSlot = "morning";
    let detectedPriority: TaskPriority = "medium";
    let detectedEnergy: EnergyLevel = "moderate";
    let detectedTime = "09:00";
    let detectedDuration = 30;

    // Detect category
    if (text.includes("run") || text.includes("jog") || text.includes("gym") || text.includes("workout") || text.includes("walk") || text.includes("exercise") || text.includes("swim") || text.includes("stretch") || text.includes("yoga")) {
      detectedCategory = "fitness";
      detectedEnergy = "high";
    } else if (text.includes("water") || text.includes("drink") || text.includes("meal") || text.includes("lunch") || text.includes("dinner") || text.includes("breakfast") || text.includes("snack") || text.includes("protein") || text.includes("tea")) {
      detectedCategory = "nutrition";
      detectedEnergy = "low";
    } else if (text.includes("meditat") || text.includes("breath") || text.includes("journal") || text.includes("calm") || text.includes("mindful") || text.includes("mental")) {
      detectedCategory = "mindfulness";
      detectedEnergy = "low";
    } else if (text.includes("sleep") || text.includes("rest") || text.includes("nap") || text.includes("bed") || text.includes("wind down")) {
      detectedCategory = "recovery";
      detectedEnergy = "low";
      detectedSlot = "night";
      detectedTime = "22:00";
    } else if (text.includes("med") || text.includes("pill") || text.includes("vitamin") || text.includes("dose") || text.includes("doctor") || text.includes("prescri")) {
      detectedCategory = "medical";
      detectedEnergy = "low";
    }

    // Detect time slot
    if (text.includes("morning") || text.includes("am") || text.includes("sunrise")) {
      detectedSlot = "morning";
      detectedTime = "08:00";
    } else if (text.includes("afternoon") || text.includes("pm") || text.includes("lunch")) {
      detectedSlot = "afternoon";
      detectedTime = "14:00";
    } else if (text.includes("evening") || text.includes("sunset") || text.includes("dusk")) {
      detectedSlot = "evening";
      detectedTime = "18:00";
    } else if (text.includes("night") || text.includes("bed") || text.includes("late")) {
      detectedSlot = "night";
      detectedTime = "22:00";
    }

    // Detect priority
    if (text.includes("urgent") || text.includes("important") || text.includes("must") || text.includes("critical") || text.includes("priority")) {
      detectedPriority = "high";
    } else if (text.includes("optional") || text.includes("maybe") || text.includes("light")) {
      detectedPriority = "low";
    }

    // Detect duration
    const durMatch = text.match(/(\d+)\s*(?:min|minute|m\b)/);
    if (durMatch && durMatch[1]) {
      detectedDuration = parseInt(durMatch[1]);
    }

    // Directly populate form fields
    setTitle(quickInput.trim());
    setCategory(detectedCategory);
    setTimeSlot(detectedSlot);
    setPriority(detectedPriority);
    setEnergyLevel(detectedEnergy);
    setDueTime(detectedTime);
    setDurationMins(detectedDuration);
    setReminderEnabled(true);
    setActiveFormTab("detailed");

    setFeedbackMsg(`Smart-detected: ${CATEGORY_CONFIG[detectedCategory].label} (${detectedSlot}, ${detectedPriority} priority). Review and save!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      category,
      priority,
      timeSlot,
      energyLevel,
      completed: false,
      dueTime: dueTime || undefined,
      durationMins: durationMins || undefined,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
      recurrence,
      reminderEnabled,
      reminderOffsetMins: reminderEnabled ? reminderOffsetMins : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    // Send reminder notification & chime if enabled
    if (reminderEnabled && dueTime) {
      const offsetLabel = reminderOffsetMins === 0 ? "at task time" : `${reminderOffsetMins}m before`;
      addNotification({
        title: "⏰ Task Reminder Scheduled",
        text: `Reminder set: "${newTask.title}" scheduled for ${dueTime} (${offsetLabel})`,
        type: "task_reminder",
        taskId: newTask.id,
        dueTime
      });
      playNotificationChime();
    }

    setTitle("");
    setQuickInput("");
    setNotes("");
    setCaloriesBurned("");

    setFeedbackMsg(
      reminderEnabled 
        ? `Task "${newTask.title.slice(0, 25)}..." scheduled with reminder!`
        : `Task "${newTask.title.slice(0, 25)}..." scheduled successfully!`
    );
    setTimeout(() => setFeedbackMsg(null), 3500);

    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.6 },
      colors: ["#14b8a6", "#06b6d4", "#3b82f6"]
    });
  };

  // Toggle task completion
  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#22d3ee", "#10b981", "#8b5cf6"]
            });
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Preset routines
  const handleAddPreset = (type: "morning" | "postworkout" | "night") => {
    let presetItems: DailyTask[] = [];
    const now = new Date().toISOString();

    if (type === "morning") {
      presetItems = [
        { id: `t-${Date.now()}-1`, title: "Morning hydration (500ml water + lemon)", category: "nutrition", priority: "high", timeSlot: "morning", energyLevel: "low", completed: false, dueTime: "07:00", durationMins: 5, recurrence: "daily", createdAt: now },
        { id: `t-${Date.now()}-2`, title: "20-minute sunlight exposure & brisk walk", category: "fitness", priority: "high", timeSlot: "morning", energyLevel: "moderate", completed: false, dueTime: "07:30", durationMins: 20, caloriesBurned: 130, recurrence: "daily", createdAt: now },
        { id: `t-${Date.now()}-3`, title: "5-minute mindfulness gratitude reflection", category: "mindfulness", priority: "medium", timeSlot: "morning", energyLevel: "low", completed: false, dueTime: "08:00", durationMins: 5, recurrence: "daily", createdAt: now },
      ];
    } else if (type === "postworkout") {
      presetItems = [
        { id: `t-${Date.now()}-1`, title: "Post-workout whey / plant protein shake (30g)", category: "nutrition", priority: "high", timeSlot: "afternoon", energyLevel: "low", completed: false, dueTime: "13:30", durationMins: 10, recurrence: "daily", createdAt: now },
        { id: `t-${Date.now()}-2`, title: "Hamstring, hip flexor & spine mobility stretch", category: "fitness", priority: "medium", timeSlot: "afternoon", energyLevel: "low", completed: false, dueTime: "13:45", durationMins: 15, caloriesBurned: 60, recurrence: "daily", createdAt: now },
      ];
    } else {
      presetItems = [
        { id: `t-${Date.now()}-1`, title: "Dim ambient lights & switch phone to night mode", category: "recovery", priority: "high", timeSlot: "night", energyLevel: "low", completed: false, dueTime: "21:30", durationMins: 15, recurrence: "daily", createdAt: now },
        { id: `t-${Date.now()}-2`, title: "Magnesium supplement & 250ml chamomile tea", category: "medical", priority: "medium", timeSlot: "night", energyLevel: "low", completed: false, dueTime: "22:00", durationMins: 10, recurrence: "daily", createdAt: now },
      ];
    }

    setTasks(prev => [...presetItems, ...prev]);
    setFeedbackMsg(`Added preset routine with ${presetItems.length} tasks!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Reset to default
  const handleResetTasks = () => {
    if (confirm("Reset task list to recommended daily baseline?")) {
      setTasks(DEFAULT_TASKS);
      setAiReport(null);
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchCat = filterCategory === "all" || t.category === filterCategory;
      const matchStatus = 
        filterStatus === "all" 
          ? true 
          : filterStatus === "completed" 
            ? t.completed 
            : !t.completed;
      return matchCat && matchStatus;
    });
  }, [tasks, filterCategory, filterStatus]);

  // Analytics Computations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Wellness vs Workload ratio
  const wellnessTasks = tasks.filter(t => ["fitness", "nutrition", "mindfulness", "recovery", "medical"].includes(t.category));
  const workTasks = tasks.filter(t => t.category === "work");
  const wellnessRatio = totalTasks > 0 ? Math.round((wellnessTasks.length / totalTasks) * 100) : 100;

  // Chart: Category breakdown
  const categoryChartData = useMemo(() => {
    const counts: Record<TaskCategory, { total: number; completed: number }> = {
      fitness: { total: 0, completed: 0 },
      nutrition: { total: 0, completed: 0 },
      mindfulness: { total: 0, completed: 0 },
      work: { total: 0, completed: 0 },
      recovery: { total: 0, completed: 0 },
      medical: { total: 0, completed: 0 },
    };

    tasks.forEach(t => {
      if (counts[t.category]) {
        counts[t.category].total += 1;
        if (t.completed) counts[t.category].completed += 1;
      }
    });

    return Object.entries(counts)
      .filter(([, data]) => data.total > 0)
      .map(([cat, data]) => ({
        name: CATEGORY_CONFIG[cat as TaskCategory].label.split(" ")[0],
        total: data.total,
        completed: data.completed,
      }));
  }, [tasks]);

  // Pie chart for wellness balance
  const pieData = useMemo(() => {
    return [
      { name: "Wellness & Health", value: wellnessTasks.length || 1, color: "#10b981" },
      { name: "Focus & Work", value: workTasks.length || 1, color: "#3b82f6" },
    ];
  }, [wellnessTasks.length, workTasks.length]);

  // Run AI Task & Lifestyle Analysis
  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const highEnergyCount = tasks.filter(t => t.energyLevel === "high").length;
      const recoveryCount = tasks.filter(t => t.category === "recovery" || t.category === "mindfulness").length;
      const uncompletedHighPriority = tasks.filter(t => !t.completed && t.priority === "high").length;

      let risk: "Low" | "Moderate" | "Elevated" = "Low";
      if (highEnergyCount >= 3 && recoveryCount === 0) {
        risk = "Elevated";
      } else if (highEnergyCount > 2 && completionRate < 40) {
        risk = "Moderate";
      }

      const tips: string[] = [];
      if (wellnessRatio < 50) {
        tips.push("Over 50% of your agenda is concentrated on work blocks. Schedule at least one 15-minute restorative walk or hydration check to avoid afternoon cognitive slump.");
      } else {
        tips.push("Optimal wellness allocation! Your routine effectively balances physiological care with your daily objectives.");
      }

      if (highEnergyCount >= 3) {
        tips.push(`You have scheduled ${highEnergyCount} high-intensity tasks today. Ensure you refuel with complex carbohydrates and hydrate with at least 2.5L water.`);
      }

      if (uncompletedHighPriority > 0) {
        tips.push(`You still have ${uncompletedHighPriority} high-priority item${uncompletedHighPriority > 1 ? 's' : ''} awaiting completion. Prioritize completing them before 4:00 PM for optimal circadian energy.`);
      } else {
        tips.push("All high-priority core tasks are completed or pacing on schedule. Great discipline!");
      }

      setAiReport({
        summary: `Analysis of ${totalTasks} scheduled items indicates a ${wellnessRatio}% lifestyle wellness ratio with ${completionRate}% day completion.`,
        burnoutRisk: risk,
        wellnessRatio,
        actionableTips: tips,
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 select-none pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-7 w-7 text-teal-500 animate-pulse" /> {user?.name ? `${user.name}'s Daily Tasks & Activity Analysis` : "Daily Tasks & Activity Analysis"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Mention your daily activities, schedule habits & work milestones, and analyze lifestyle balance in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormOpen ? "Hide Task Form" : "Open Schedule Form"}
          </button>
          <button
            onClick={handleResetTasks}
            title="Reset to recommended routine"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" /> {feedbackMsg}
            </span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Task Reminder Banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-4 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-teal-500 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500 text-white shadow-lg animate-bounce">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-300 uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded-full">
                  ⏰ Task Reminder Alert
                </span>
                <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                  Time for: {activeAlert.taskTitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Scheduled time: {activeAlert.dueTime} &bull; Stay consistent with your daily routine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveAlert(null)}
                className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Acknowledge Alert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completion */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Rate</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{completionRate}%</span>
            <span className="text-xs font-bold text-teal-500">{completedTasks} / {totalTasks} done</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <motion.div 
              className="bg-teal-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card 2: Wellness Ratio */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wellness Balance</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-500">{wellnessRatio}%</span>
            <span className="text-xs font-semibold text-slate-400">{wellnessTasks.length} health tasks</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2">
            {wellnessRatio >= 60 ? "Optimal life-work health balance" : "Work heavy; consider adding rest"}
          </p>
        </div>

        {/* Card 3: Energy Demand */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Energy Tasks</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-cyan-500">
              {tasks.filter(t => t.energyLevel === "high").length}
            </span>
            <span className="text-xs font-bold text-slate-400">Intensive</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Planned high-output blocks
          </p>
        </div>

        {/* Card 4: Daily Streak */}
        <div className="p-5 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discipline Streak</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amber-500 flex items-center gap-1">
              5 <Flame className="h-6 w-6 text-amber-500 animate-bounce" />
            </span>
            <span className="text-xs font-bold text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-teal-500" /> Consistent habit logger
          </p>
        </div>
      </div>

      {/* COMPREHENSIVE MENTION & SCHEDULE FORM */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 rounded-3xl glass-card border border-teal-500/30 dark:border-teal-500/20 text-left shadow-xl space-y-6">
              
              {/* Form Title & Tab Switcher */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-500" /> Mention & Schedule Daily Task
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Structure your day with biometric-informed scheduling and AI balance analytics.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("detailed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeFormTab === "detailed"
                        ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    Structured Scheduler
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("quick")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFormTab === "quick"
                        ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    }`}
                  >
                    <Wand2 className="h-3.5 w-3.5 text-teal-500" /> Quick Mention (AI)
                  </button>
                </div>
              </div>

              {/* QUICK MENTION TAB (AI NATURAL LANGUAGE) */}
              {activeFormTab === "quick" && (
                <div className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-teal-500" /> Mention what you did or plan to do in plain English:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleQuickMentionParse()}
                      placeholder="e.g., '45 min resistance training at 6:30 PM', 'Drink 1L water at 9am', 'Deep work block 2 hours'..."
                      className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickMentionParse()}
                      className="py-3 px-5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
                    >
                      <Wand2 className="h-4 w-4" /> Auto-Detect & Fill
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Tip: UniCare AI will auto-detect your activity category, time slot, estimated duration, and energy intensity.
                  </p>
                </div>
              )}

              {/* DETAILED FORM */}
              <form onSubmit={handleAddTask} className="space-y-6">
                {/* 1. Title Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Task Title / Activity Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 40-min resistance training workout, drink 1L hydration with electrolyte, review research paper..."
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-teal-500 text-slate-800 dark:text-white shadow-sm"
                  />
                </div>

                {/* 2. Visual Category Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Select Life & Health Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(catKey => {
                      const cfg = CATEGORY_CONFIG[catKey];
                      const Icon = cfg.icon;
                      const isSelected = category === catKey;

                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setCategory(catKey)}
                          className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[78px] ${
                            isSelected
                              ? cfg.activeBg
                              : "bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                            {isSelected && <Check className="h-3.5 w-3.5 text-teal-500 stroke-[3px]" />}
                          </div>
                          <div className="mt-1">
                            <p className="text-xs font-bold leading-tight">{cfg.label}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 truncate">{cfg.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Schedule Time & Slot */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                  {/* Time of Day Segmented Pills */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Time of Day
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "morning", label: "Morning", icon: Sun, color: "text-amber-500" },
                        { id: "afternoon", label: "Afternoon", icon: Sun, color: "text-orange-500" },
                        { id: "evening", label: "Evening", icon: Sunset, color: "text-indigo-400" },
                        { id: "night", label: "Night", icon: Moon, color: "text-purple-400" },
                      ].map(slot => {
                        const Icon = slot.icon;
                        const isSelected = timeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setTimeSlot(slot.id as TimeSlot)}
                            className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              isSelected
                                ? "border-teal-500 bg-teal-500/15 text-teal-600 dark:text-teal-300 ring-2 ring-teal-500/20"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${slot.color}`} />
                            <span className="text-[10px]">{slot.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Time & Quick Chips */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Target Time (24h / clock)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none focus:border-teal-500 text-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-1">
                        {["07:30", "10:00", "14:00", "18:30", "22:00"].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDueTime(t)}
                            className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              dueTime === t 
                                ? "border-teal-500 bg-teal-500/15 text-teal-500" 
                                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Priority & Energy Level & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                  {/* Priority Selector */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "high", label: "High", color: "border-rose-500/40 text-rose-500 bg-rose-500/10", active: "ring-2 ring-rose-500/40 font-black" },
                        { id: "medium", label: "Medium", color: "border-amber-500/40 text-amber-500 bg-amber-500/10", active: "ring-2 ring-amber-500/40 font-black" },
                        { id: "low", label: "Low", color: "border-slate-400/40 text-slate-400 bg-slate-500/10", active: "ring-2 ring-slate-400/40 font-black" },
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPriority(p.id as TaskPriority)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            priority === p.id 
                              ? `${p.color} ${p.active}` 
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Demand */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Energy Exertion
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "low", label: "Low", icon: "🌱", color: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10" },
                        { id: "moderate", label: "Moderate", icon: "⚡", color: "text-amber-500 border-amber-500/40 bg-amber-500/10" },
                        { id: "high", label: "High", icon: "🔥", color: "text-cyan-500 border-cyan-500/40 bg-cyan-500/10" },
                      ].map(e => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setEnergyLevel(e.id as EnergyLevel)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            energyLevel === e.id
                              ? `${e.color} ring-2 ring-teal-500/30 font-black`
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          }`}
                        >
                          <span>{e.icon}</span>
                          <span>{e.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Recurrence */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Duration & Frequency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Duration */}
                      <div className="relative">
                        <Timer className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <select
                          value={durationMins}
                          onChange={(e) => setDurationMins(parseInt(e.target.value))}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none text-slate-700 dark:text-slate-200"
                        >
                          <option value={5}>5 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                          <option value={90}>90 mins</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>

                      {/* Recurrence */}
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <select
                          value={recurrence}
                          onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none text-slate-700 dark:text-slate-200"
                        >
                          <option value="once">One-time</option>
                          <option value="daily">Daily Habit</option>
                          <option value="weekdays">Weekdays</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Fitness Extra: Calories Burned (if category is fitness) */}
                {category === "fitness" && (
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-cyan-500" /> Estimated Calorie Burn (optional):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={caloriesBurned}
                        onChange={(e) => setCaloriesBurned(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-28 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none text-slate-800 dark:text-white"
                      />
                      <span className="text-xs text-slate-400 font-bold">kcal</span>
                    </div>
                  </div>
                )}

                {/* 6. Reminder Notification Settings */}
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setReminderEnabled(!reminderEnabled)}
                        className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          reminderEnabled ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full bg-white transition-transform block absolute top-1 ${
                          reminderEnabled ? "left-6" : "left-1"
                        }`} />
                      </button>
                      <div>
                        <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Bell className="h-3.5 w-3.5 text-teal-500" /> Reminder Notification
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {reminderEnabled ? "Audio chime & in-app notification when task is due" : "No reminder alert will be sent"}
                        </span>
                      </div>
                    </div>

                    {reminderEnabled && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Alert timing:</span>
                        {[
                          { offset: 0, label: "At task time" },
                          { offset: 10, label: "10m before" },
                          { offset: 30, label: "30m before" },
                          { offset: 60, label: "1h before" },
                        ].map(opt => (
                          <button
                            key={opt.offset}
                            type="button"
                            onClick={() => setReminderOffsetMins(opt.offset)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              reminderOffsetMins === opt.offset
                                ? "border-teal-500 bg-teal-500/20 text-teal-600 dark:text-teal-300 font-black"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Test Alert Button & Desktop Permission */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-500/15 text-[11px]">
                    <div>
                      {!hasPermission ? (
                        <button
                          type="button"
                          onClick={handleRequestPermission}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Bell className="h-3.5 w-3.5" /> Enable Desktop Reminders
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Desktop Alerts Active
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleTestReminderAlert}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-300 font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="h-3 w-3" /> Test Chime & Alert
                    </button>
                  </div>
                </div>

                {/* 7. Notes Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Notes / Health Guidelines (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., maintain posture, take electrolyte fluids, avoid screen exposure afterwards"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500 text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/60 pt-4">
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" /> All inputs auto-sync to health analytics
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTitle("")}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Save Task to Daily Agenda
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Presets:</span>
        <button
          onClick={() => handleAddPreset("morning")}
          className="py-1.5 px-3 rounded-xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold hover:bg-teal-500/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" /> + Morning Wellness Routine
        </button>
        <button
          onClick={() => handleAddPreset("postworkout")}
          className="py-1.5 px-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Activity className="h-3.5 w-3.5" /> + Post-Workout Recovery
        </button>
        <button
          onClick={() => handleAddPreset("night")}
          className="py-1.5 px-3 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Moon className="h-3.5 w-3.5" /> + Night Wind-Down Routine
        </button>
      </div>

      {/* Main Grid: Task List (Left 7 cols) + AI & Analytics (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Col: Task Manager */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            {/* Status pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              {(["all", "pending", "completed"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    filterStatus === st 
                      ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="fitness">Physical & Fitness</option>
                <option value="nutrition">Nutrition & Water</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="work">Focus & Work</option>
                <option value="recovery">Rest & Sleep</option>
                <option value="medical">Care & Meds</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="p-8 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-center space-y-3">
                <CheckSquare className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No daily tasks found</p>
                <p className="text-xs text-slate-400">
                  You have no tasks matching this filter. Use the form above to mention your daily activities!
                </p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const config = CATEGORY_CONFIG[task.category];
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`p-4 rounded-2xl glass-card border transition-all duration-200 flex items-start justify-between gap-3 ${
                      task.completed 
                        ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 opacity-75" 
                        : "border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Toggle check button */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-teal-500 transition-colors cursor-pointer shrink-0"
                      title={task.completed ? "Mark as pending" : "Mark as completed"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400 hover:text-teal-500" />
                      )}
                    </button>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Category Badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.bg} ${config.color} ${config.border}`}>
                          <IconComponent className="h-3 w-3" />
                          {config.label}
                        </span>

                        {/* Priority */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          task.priority === "high" 
                            ? "bg-rose-500/10 text-rose-500 dark:bg-rose-950/30" 
                            : task.priority === "medium" 
                              ? "bg-amber-500/10 text-amber-500 dark:bg-amber-950/30" 
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}>
                          {task.priority}
                        </span>

                        {/* Energy demand */}
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                          <Zap className={`h-2.5 w-2.5 ${task.energyLevel === "high" ? "text-cyan-500" : "text-slate-400"}`} />
                          {task.energyLevel} energy
                        </span>

                        {/* Duration */}
                        {task.durationMins && (
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                            <Timer className="h-2.5 w-2.5 text-teal-500" /> {task.durationMins}m
                          </span>
                        )}

                        {/* Calories */}
                        {task.caloriesBurned && (
                          <span className="text-[10px] font-semibold text-cyan-500 flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5" /> {task.caloriesBurned} kcal
                          </span>
                        )}

                        {/* Reminder Badge */}
                        {task.dueTime && (
                          <button
                            type="button"
                            onClick={() => handleToggleTaskReminder(task.id)}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                              task.reminderEnabled
                                ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                            title={task.reminderEnabled ? "Reminder active (click to mute)" : "Reminder muted (click to activate)"}
                          >
                            {task.reminderEnabled ? (
                              <Bell className="h-2.5 w-2.5 text-teal-500" />
                            ) : (
                              <BellOff className="h-2.5 w-2.5 text-slate-400" />
                            )}
                            <span>{task.reminderEnabled ? (task.reminderOffsetMins ? `${task.reminderOffsetMins}m before` : "At time") : "Alert Off"}</span>
                          </button>
                        )}

                        {/* Due Time */}
                        {task.dueTime && (
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5 ml-auto">
                            <Clock className="h-2.5 w-2.5" /> {task.dueTime}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p className={`text-sm font-bold tracking-tight ${
                        task.completed 
                          ? "line-through text-slate-400 dark:text-slate-500" 
                          : "text-slate-800 dark:text-white"
                      }`}>
                        {task.title}
                      </p>

                      {/* Notes */}
                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                          &quot;{task.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: AI Analysis & Analytics Breakdowns */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Task & Lifestyle Analyzer Card */}
          <div className="p-6 rounded-3xl glass-card border border-teal-500/30 dark:border-teal-500/20 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-teal-500" /> AI Lifestyle & Task Analysis
              </h3>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-500/10 px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Analyzes your scheduled daily workload against physical exertion, recovery breaks, and burnout risk.
            </p>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Synthesizing Lifestyle Telemetry..." : "Run AI Task Analysis"}
            </button>

            {/* AI Report output */}
            <AnimatePresence>
              {aiReport && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Burnout & Strain Risk:</span>
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
                      aiReport.burnoutRisk === "Low" 
                        ? "bg-emerald-500/15 text-emerald-500" 
                        : aiReport.burnoutRisk === "Moderate" 
                          ? "bg-amber-500/15 text-amber-500" 
                          : "bg-rose-500/15 text-rose-500"
                    }`}>
                      {aiReport.burnoutRisk}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {aiReport.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Actionable Recommendations:
                    </span>
                    <div className="space-y-1.5">
                      {aiReport.actionableTips.map((tip, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Distribution Chart */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-500" /> Task Categories Distribution
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{totalTasks} items</span>
            </div>

            <div className="h-44 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
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
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                      contentStyle={{ 
                        background: "rgba(15, 23, 42, 0.8)", 
                        border: "none", 
                        borderRadius: "12px", 
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "bold"
                      }} 
                    />
                    <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total Tasks" />
                    <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No task data available
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" /> Total Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
              </span>
            </div>
          </div>

          {/* Wellness vs Workload Balance Pie */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-teal-500" /> Life Balance Breakdown
            </h3>

            <div className="flex items-center justify-center h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Wellness</p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{wellnessTasks.length} tasks</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-950/20">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Work / Focus</p>
                <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{workTasks.length} tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
