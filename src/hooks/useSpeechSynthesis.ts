import { useState, useEffect, useCallback, useRef } from "react";
import { isSpeechSynthesisSupported, getAvailableVoices, findVoiceForLanguage } from "../utils/speech";

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { onStart, onEnd, onError } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!isSpeechSynthesisSupported()) return;
    const available = getAvailableVoices();
    setVoices(available);

    // Default to an English female voice if available
    const defaultVoice = findVoiceForLanguage("en-US", "female") || findVoiceForLanguage("en", "female");
    setSelectedVoice(prev => prev || defaultVoice || available[0] || null);
  }, []);

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    loadVoices();

    // Chrome loaded voices asynchronously
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  const stop = useCallback(() => {
    // 1. Stop HTML5 audio player if running
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch (err) {
        console.error("Error stopping audio playback:", err);
      }
    }
    // 2. Stop browser native synthesis
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    // Stop current synthesis or playback if any
    stop();

    if (!text.trim()) return;

    // Clean text of markdown formatting so it reads nicely
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold markdown
      .replace(/\*([^*]+)\*/g, "$1") // Italic markdown
      .replace(/#+\s+([^\n]+)/g, "$1") // Headers
      .replace(/-\s+/g, "") // Lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Links

    // Auto-detect Hindi characters (Devanagari script)
    const isHindi = /[\u0900-\u097F]/.test(cleanText);
    const lang = isHindi ? "hi-IN" : "en-IN";

    // Try Sarvam AI API first
    try {
      setIsSpeaking(true);
      if (onStart) onStart();

      const token = typeof window !== "undefined" ? localStorage.getItem("unicare_token") : null;
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          text: cleanText,
          lang,
          speaker: isHindi ? "neha" : "aditya"
        })
      });

      if (!response.ok) {
        throw new Error(`Sarvam TTS API returned error ${response.status}`);
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error("Missing audio payload in Sarvam TTS API response");
      }

      // Play audio bytes using blob url
      const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.warn("Using browser SpeechSynthesis fallback due to:", err);
      
      // Fallback to browser native SpeechSynthesis
      const utterance = new SpeechSynthesisUtterance(cleanText);
      let voiceToUse = selectedVoice;

      if (isHindi) {
        const hindiVoice = findVoiceForLanguage("hi-IN", "female") || 
                           findVoiceForLanguage("hi", "female") ||
                           findVoiceForLanguage("hi-IN", "male") ||
                           findVoiceForLanguage("hi", "male");
        if (hindiVoice) {
          voiceToUse = hindiVoice;
        }
      }

      if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error:", event);
        setIsSpeaking(false);
        if (onError) onError(event);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [selectedVoice, rate, pitch, onStart, onEnd, onError, stop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error("Error resuming audio:", err));
    }
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.resume();
    }
  }, []);

  const updateVoiceByLanguage = useCallback((lang: string, gender: "male" | "female" = "female") => {
    const matchedVoice = findVoiceForLanguage(lang, gender);
    if (matchedVoice) {
      setSelectedVoice(matchedVoice);
    }
  }, []);

  return {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    speak,
    stop,
    pause,
    resume,
    updateVoiceByLanguage,
    hasSupport: isSpeechSynthesisSupported(),
    error
  };
}
