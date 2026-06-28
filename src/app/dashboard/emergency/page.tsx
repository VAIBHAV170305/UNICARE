"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Phone, 
  Plus, 
  Trash2, 
  UserCheck, 
  MapPin, 
  AlertTriangle,
  QrCode,
  Info,
  CheckCircle,
  XCircle,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export default function EmergencySOS() {
  const [sosState, setSosState] = useState<"idle" | "countdown" | "active">("idle");
  const [countdown, setCountdown] = useState(5);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "c1", name: "Jane Doe", relation: "Spouse", phone: "+1 (555) 019-2834" },
    { id: "c2", name: "Dr. Robert Chen", relation: "Primary Physician", phone: "+1 (555) 014-9988" },
  ]);

  const [addName, setAddName] = useState("");
  const [addRelation, setAddRelation] = useState("");
  const [addPhone, setAddPhone] = useState("");

  const hospitals = [
    { name: "St. Jude Medical Center", dist: "1.2 miles", status: "24/7 ER Active", phone: "911" },
    { name: "Mercy General Hospital", dist: "3.4 miles", status: "24/7 ER Active", phone: "911" },
  ];

  // SOS Countdown timer loop
  useEffect(() => {
    if (sosState !== "countdown") return;

    if (countdown === 0) {
      setSosState("active");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sosState, countdown]);

  const handleTriggerSOS = () => {
    setSosState("countdown");
    setCountdown(5);
  };

  const handleCancelSOS = () => {
    setSosState("idle");
    setCountdown(5);
  };

  const handleAddContact = () => {
    if (!addName.trim() || !addPhone.trim()) return;
    
    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name: addName,
      relation: addRelation || "Other",
      phone: addPhone
    };

    setContacts(prev => [...prev, newContact]);
    setAddName("");
    setAddRelation("");
    setAddPhone("");
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="h-7 w-7 text-red-500 animate-pulse" /> Emergency SOS Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            SOS broadcast triggers, emergency contact routing, and digital Medical ID.
          </p>
        </div>
      </div>

      {/* Grid 1: Massive SOS Trigger & Medical ID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SOS Pulse Trigger Card */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center justify-between text-center min-h-[380px] ${
          sosState === "idle" ? "glass-card border-slate-200/60 dark:border-slate-900/60" :
          sosState === "countdown" ? "bg-amber-500/10 border-amber-500 shadow-2xl shadow-amber-500/25" :
          "bg-red-500/10 border-red-500 shadow-2xl shadow-red-500/25 animate-pulse"
        }`}>
          <div className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>SOS Alarm Console</span>
            {sosState !== "idle" && (
              <span className={sosState === "countdown" ? "text-amber-500" : "text-red-500 animate-ping"}>
                {sosState === "countdown" ? "Pending..." : "Active"}
              </span>
            )}
          </div>

          {/* Trigger Button */}
          <div className="relative flex items-center justify-center py-6">
            <AnimatePresence mode="wait">
              {sosState === "idle" && (
                <motion.button
                  key="idle-btn"
                  onClick={handleTriggerSOS}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-40 w-40 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white flex flex-col items-center justify-center shadow-xl shadow-red-500/20 border-8 border-red-500/20 animate-breath cursor-pointer"
                >
                  <ShieldAlert className="h-10 w-10 text-white" />
                  <span className="text-sm font-extrabold uppercase tracking-widest mt-2">Trigger SOS</span>
                </motion.button>
              )}

              {sosState === "countdown" && (
                <motion.div
                  key="countdown-btn"
                  className="h-40 w-40 rounded-full bg-amber-500 text-white flex flex-col items-center justify-center border-8 border-amber-500/20 shadow-xl"
                >
                  <span className="text-5xl font-black">{countdown}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Hold to cancel</span>
                </motion.div>
              )}

              {sosState === "active" && (
                <motion.div
                  key="active-btn"
                  className="h-40 w-40 rounded-full bg-red-600 text-white flex flex-col items-center justify-center border-8 border-red-600/30 shadow-2xl"
                >
                  <AlertTriangle className="h-10 w-10 text-white animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-widest mt-2">SOS Active</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full space-y-4">
            {sosState === "idle" ? (
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Tapping broadcast coordinates and Medical ID to contacts.
              </p>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleCancelSOS}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel SOS Broadcast
                </button>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {sosState === "countdown" ? "Broadcasting in progress... Click cancel to stop dispatch." : "Emergency dispatch alerted. Coordinates uploaded: Lat 37.7749, Lon -122.4194"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Digital Medical ID Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-4.5 w-4.5 text-red-500" /> Digital Medical ID
              </h3>
              <span className="text-[9px] font-black text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 rounded px-1.5 py-0.5 uppercase">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Allergies</span>
                  <p className="text-xs font-bold text-red-500 mt-0.5">Penicillin, Peanuts</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Medications</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-0.5">Albuterol (Asthma Inhaler)</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Blood Type</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-0.5">O Positive (O+)</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Conditions</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-0.5">Mild Asthma</p>
                </div>
              </div>

              {/* QR Code SVG */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/20 w-fit mx-auto sm:mr-0">
                <QrCode className="h-28 w-28 text-slate-800 dark:text-slate-200" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-2">Scan for Medical Profile</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-200/20 bg-slate-50/30 dark:bg-slate-900/30 text-[9px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-brand-blue" />
            <span>Show this QR code to first responders or medical staff.</span>
          </div>
        </div>

      </div>

      {/* Grid 2: Contacts (Left) & Hospitals (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Emergency Contacts manager */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-4.5 w-4.5 text-brand-blue" /> Emergency Contacts
            </h3>

            {/* List */}
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pt-2">
              {contacts.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 text-xs">
                  <div className="text-left">
                    <p className="font-bold text-slate-700 dark:text-slate-350">{c.name} <span className="text-[9px] text-slate-400 font-semibold uppercase">({c.relation})</span></p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-0.5">{c.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className="p-1.5 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
                      title="Call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <button 
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add contact */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase mb-3">Add Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Name"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                value={addRelation}
                onChange={(e) => setAddRelation(e.target.value)}
                placeholder="Relation (e.g. Spouse)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                placeholder="Phone (e.g. +1...)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddContact}
                className="py-2 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs shadow-sm transition-all"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Nearby Hospitals */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-900/60 text-left flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-brand-emerald" /> Nearest Medical Centers
            </h3>

            <div className="space-y-3 pt-2">
              {hospitals.map(h => (
                <div key={h.name} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/10 flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-extrabold text-slate-700 dark:text-slate-200 text-xs">{h.name}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-normal font-semibold">
                      {h.dist} &bull; <span className="text-brand-emerald">{h.status}</span>
                    </p>
                  </div>
                  <a
                    href={`tel:${h.phone}`}
                    className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.03] transition-all flex items-center justify-center font-bold text-[10px] uppercase gap-1 shrink-0"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call ER
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-200/20 bg-slate-50/30 dark:bg-slate-900/30 text-[9px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-brand-blue" />
            <span>Map routing links are updated in real-time based on GPS location data.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
