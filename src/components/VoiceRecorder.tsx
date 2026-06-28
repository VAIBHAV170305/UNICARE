import React from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  isListening: boolean;
  transcript: string;
  onStop: () => void;
  onCancel: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  error: string | null;
}

export function VoiceRecorder({
  isListening,
  transcript,
  onStop,
  onCancel,
  language,
  onLanguageChange,
  error
}: VoiceRecorderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isListening && !error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="absolute inset-x-4 bottom-4 z-30 p-5 rounded-2xl glass-card border border-red-500/30 bg-slate-950/95 text-white shadow-2xl flex flex-col justify-between space-y-4"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-400">
              {error ? "Voice Error" : "Listening Live..."}
            </span>
          </div>

          {/* Language Switcher */}
          {!error && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
              <button
                onClick={() => onLanguageChange("en-US")}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  language === "en-US" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange("hi-IN")}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  language === "hi-IN" 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-semibold text-red-400 italic py-1">{error}</p>
        ) : (
          <div className="flex-1 min-h-[40px] flex flex-col justify-center">
            {transcript ? (
              <p className="text-xs font-bold text-slate-100 leading-relaxed text-left line-clamp-2">
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-500 italic text-left">
                Start speaking now... Say &quot;Suggest healthy breakfast&quot; or speak in Hindi.
              </p>
            )}
          </div>
        )}

        {/* Waves and Action buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
          {/* Waveforms */}
          {!error && isListening && mounted ? (
            <div className="flex items-center gap-1 h-6 shrink-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="w-0.75 bg-red-400 rounded-full animate-bounce"
                  style={{
                    height: `${Math.max(10, Math.random() * 95)}%`,
                    animationDuration: `${0.35 + Math.random() * 0.45}s`
                  }}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white uppercase transition-all"
            >
              Cancel
            </button>
            {!error && (
              <button
                onClick={onStop}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[10px] font-bold text-white uppercase flex items-center gap-1 transition-all hover:scale-[1.02] shadow shadow-red-600/30"
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VoiceRecorder;
