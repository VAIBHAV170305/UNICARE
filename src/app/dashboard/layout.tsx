"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Heart, 
  Brain, 
  Flame, 
  Utensils, 
  Activity, 
  ShieldAlert, 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Info,
  TrendingUp,
  Trash2
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CommandPalette from "@/components/CommandPalette";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout, deleteUserAccount } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: This action is permanent. All your health data, symptom logs, active profiles, and AI chat history will be permanently and irreversibly purged from our databases.\n\nAre you sure you want to delete your account?"
    );
    if (confirmDelete) {
      const res = await deleteUserAccount();
      if (res.success) {
        alert("Your account and all associated health records have been permanently purged.");
      } else {
        alert(`Failed to delete account: ${res.error}`);
      }
    }
  };
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Time for your scheduled breathing exercise", time: "10m ago", read: false },
    { id: 2, text: "Your deep sleep was 14% higher than last week", time: "2h ago", read: false },
    { id: 3, text: "Don't forget to log your water intake today", time: "5h ago", read: true },
  ]);

  const menuItems: SidebarItem[] = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-brand-blue" },
    { name: "AI Companion", href: "/dashboard/ai-companion", icon: Sparkles, color: "text-brand-purple" },
    { name: "Mental Wellness", href: "/dashboard/mental-wellness", icon: Brain, color: "text-brand-purple" },
    { name: "Women's Wellness", href: "/dashboard/womens-wellness", icon: Heart, color: "text-rose-500" },
    { name: "Men's Wellness", href: "/dashboard/mens-wellness", icon: Flame, color: "text-amber-500" },
    { name: "Nutrition & Water", href: "/dashboard/nutrition", icon: Utensils, color: "text-emerald-500" },
    { name: "Fitness & Activity", href: "/dashboard/fitness", icon: Activity, color: "text-cyan-500" },
    { name: "Predictive Health", href: "/dashboard/predictions", icon: TrendingUp, color: "text-indigo-500" },
    { name: "Emergency SOS", href: "/dashboard/emergency", icon: ShieldAlert, color: "text-red-500 animate-pulse" },
  ];

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <Heart className="h-10 w-10 text-brand-purple animate-pulse mb-3" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading UniCare Profile...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-gray-950 font-sans transition-colors duration-300 flex overflow-hidden">
      
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-blue/5 dark:bg-brand-blue/2 pointer-events-none blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-brand-purple/5 dark:bg-brand-purple/2 pointer-events-none blur-[80px]" />

      {/* SIDEBAR - DESKTOP */}
      <motion.aside
        animate={{ width: isCollapsed ? "80px" : "260px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-white/70 dark:bg-slate-900/60 border-r border-slate-200/50 dark:border-slate-800/40 glass-panel backdrop-blur-xl z-30 shrink-0 select-none"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/30 dark:border-slate-800/30">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo.png"
              alt="UniCare Logo"
              className="h-9 w-9 rounded-xl shadow shrink-0 object-cover"
            />
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-left"
              >
                <span className="font-extrabold text-base tracking-tight text-slate-800 dark:text-white">
                  UniCare
                </span>
                <p className="text-[8px] tracking-wider uppercase font-bold text-brand-emerald">
                  Companion
                </p>
              </motion.div>
            )}
          </Link>
          
          <button
            onClick={handleToggleCollapse}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive
                    ? "bg-brand-blue/10 dark:bg-brand-purple/20 text-brand-blue dark:text-brand-purple-light border-l-2 border-brand-blue dark:border-brand-purple pl-2.5"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                }`}
              >
                {item.name === "Women's Wellness" ? (
                  <img
                    src="/womens-logo.png"
                    alt="Women's Wellness"
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                ) : (
                  <Icon className={`h-5 w-5 shrink-0 ${item.color}`} />
                )}
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User profile */}
        <div className="p-3 border-t border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/20 dark:border-slate-800/20">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-extrabold text-sm shadow shrink-0 select-none">
                {(user?.profile?.name || user?.name || "U")[0].toUpperCase()}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-brand-emerald" />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-left overflow-hidden"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {user?.profile?.name || user?.name || "User Account"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Health Score</span>
                    <span className="text-[10px] font-black text-brand-emerald">88%</span>
                  </div>
                </motion.div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleDeleteAccount}
                  title="Delete Account permanently"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-600/10 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={logout}
                  title="Logout from Account"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/40 dark:bg-slate-900/20 border-b border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md z-20 select-none">
          <div className="flex items-center gap-4">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all text-xs w-[180px] sm:w-[260px] text-left shadow-sm"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate flex-1">Search dashboard (Ctrl K)</span>
              <kbd className="hidden sm:inline-block text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all relative shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-purple ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                )}
              </button>

              {/* Notifications dropdown panel */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 text-left"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[10px] font-bold text-brand-blue dark:text-brand-purple hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              notif.read
                                ? "bg-slate-50/50 dark:bg-slate-950/20 border-transparent"
                                : "bg-brand-blue/5 dark:bg-brand-purple/10 border-slate-100 dark:border-slate-800"
                            }`}
                          >
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {notif.text}
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 block">
                              {notif.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Quick Profile Info (only on mobile) */}
            <div className="h-9 w-9 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow md:hidden">
              U
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-24 md:pb-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/40 glass-panel backdrop-blur-xl z-30 flex items-center justify-around px-2 select-none shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all ${
                isActive ? "text-brand-blue dark:text-brand-purple-light scale-[1.05]" : ""
              }`}
            >
              {item.name === "Women's Wellness" ? (
                <img
                  src="/womens-logo.png"
                  alt="Women's Wellness"
                  className="h-5 w-5 shrink-0 rounded object-cover"
                />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-[9px] font-bold mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        {/* Extra: direct route to Emergency */}
        <Link
          href="/dashboard/emergency"
          className={`flex flex-col items-center justify-center flex-1 h-full text-red-500 ${
            pathname === "/dashboard/emergency" ? "scale-[1.05] font-black" : ""
          }`}
        >
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          <span className="text-[9px] font-bold mt-1 tracking-tight">SOS</span>
        </Link>
      </nav>

      {/* Command Palette Overlay */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}
