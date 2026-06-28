import React, { useState } from "react";
import { Volume2, VolumeX, Settings2, Sliders, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoicePlayerProps {
  isSpeaking: boolean;
  onStop: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  onRateChange: (rate: number) => void;
}

export function VoicePlayer({
  isSpeaking,
  onStop,
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange
}: VoicePlayerProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Filter voices to keep the list clean (only English & Hindi voices)
  const filteredVoices = voices.filter(
    v => v.lang.toLowerCase().startsWith("en") || v.lang.toLowerCase().startsWith("hi")
  );

  if (!isSpeaking && !showSettings) return null;

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 select-none">
      <div className="p-4 rounded-2xl glass-card border border-brand-emerald/30 bg-slate-950/95 text-white shadow-2xl space-y-3 text-left">
        
        {/* Top Speaking Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : null}
            <span className="text-xs font-black uppercase tracking-wider text-brand-emerald flex items-center gap-1.5">
              <Volume2 className="h-4 w-4" />
              {isSpeaking ? "Assistant speaking..." : "Voice Settings"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-all ${
                showSettings ? "bg-slate-800/80 border-slate-700 text-white" : ""
              }`}
              title="Voice Settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
            {isSpeaking && (
              <button
                onClick={onStop}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[10px] font-bold text-white uppercase flex items-center gap-1 transition-all shadow shadow-red-600/20"
              >
                <VolumeX className="h-3.5 w-3.5" />
                Stop Speech
              </button>
            )}
          </div>
        </div>

        {/* Real-time speaking waves */}
        {isSpeaking && !showSettings && (
          <div className="flex items-center gap-1.5 h-4 justify-start px-1 py-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-brand-emerald rounded-full"
                animate={{
                  height: ["15%", "100%", "15%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5 + i * 0.08,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Expanded Voice Controls */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2 border-t border-slate-900 overflow-hidden text-xs font-semibold text-slate-400"
            >
              {/* Voice Selector */}
              {filteredVoices.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Speaker Voice</label>
                  <div className="relative">
                    <select
                      value={selectedVoice?.name || ""}
                      onChange={(e) => {
                        const voice = voices.find(v => v.name === e.target.value);
                        if (voice) onVoiceChange(voice);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 outline-none text-white text-xs font-bold appearance-none cursor-pointer focus:border-brand-emerald/40"
                    >
                      {filteredVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Sliders className="h-3 w-3" />
                    Speech Speed
                  </label>
                  <span className="font-extrabold text-brand-emerald">{rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg accent-brand-emerald cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-600">
                  <span>Slow (0.5x)</span>
                  <span>Normal</span>
                  <span>Fast (2.0x)</span>
                </div>
              </div>

              {/* Close settings button */}
              {!isSpeaking && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:text-white rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all"
                >
                  Close Settings
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default VoicePlayer;
