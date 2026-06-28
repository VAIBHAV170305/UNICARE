import { useState, useEffect, useRef, useCallback } from "react";
import { isSpeechRecognitionSupported } from "../utils/speech";

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    lang = "en-US",
    continuous = false,
    interimResults = true,
    onResult,
    onEnd,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState(lang);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Store callbacks in refs to avoid re-initializing SpeechRecognition on every render
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
  }, [onResult, onEnd, onError]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognitionClass = (window as unknown as { SpeechRecognition: new () => ISpeechRecognition }).SpeechRecognition || 
                                  (window as unknown as { webkitSpeechRecognition: new () => ISpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = currentLang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const activeTranscript = finalTranscript || interimTranscript;
      setTranscript(activeTranscript);

      if (onResultRef.current) {
        onResultRef.current(activeTranscript, !!finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore abort errors caused by intentional start/stops or switching states
      if (event.error === "aborted") {
        return;
      }
      setError(event.error);
      if (onErrorRef.current) {
        onErrorRef.current(event);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEndRef.current) {
        onEndRef.current();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, currentLang]); // Only reinitialize when settings change, not when callbacks do

  const startListening = useCallback((selectedLang?: string) => {
    if (selectedLang && selectedLang !== currentLang) {
      setCurrentLang(selectedLang);
      // Wait for useEffect to reinitialize recognition with the correct language
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (err) {
          console.error("SpeechRecognition start failed:", err);
        }
      }, 100);
      return;
    }

    try {
      setTranscript("");
      recognitionRef.current?.start();
    } catch (err) {
      console.error("SpeechRecognition start failed:", err);
    }
  }, [currentLang]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error("SpeechRecognition stop failed:", err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    error,
    hasSupport: isSpeechRecognitionSupported(),
    startListening,
    stopListening,
    resetTranscript,
    language: currentLang,
    setLanguage: setCurrentLang
  };
}
