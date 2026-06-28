import React, { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { VoiceButton } from "./VoiceButton";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoicePlayer } from "./VoicePlayer";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  streaming?: boolean;
}

interface VoiceAssistantProps {
  setInputVal: (val: string) => void;
  onSendMessage: (text: string) => void;
  messages: Message[];
  onListeningStateChange?: (isListening: boolean) => void;
}

export function VoiceAssistant({
  setInputVal,
  onSendMessage,
  messages,
  onListeningStateChange
}: VoiceAssistantProps) {
  const [lang, setLang] = useState("en-US");
  const lastReadMessageIdRef = useRef<string | null>(null);

  // 1. Speech Recognition Hook
  const {
    isListening,
    transcript,
    error: recognitionError,
    hasSupport: hasRecSupport,
    startListening,
    stopListening
  } = useSpeechRecognition({
    lang,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      setInputVal(text);
      if (isFinal && text.trim()) {
        setTimeout(() => {
          onSendMessage(text);
          setInputVal("");
        }, 800);
      }
    }
  });

  // Synchronize listening state with parent component
  useEffect(() => {
    if (onListeningStateChange) {
      onListeningStateChange(isListening);
    }
  }, [isListening, onListeningStateChange]);

  // 2. Speech Synthesis Hook
  const {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  // 3. Monitor new messages to speak AI responses
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.sender === "ai" && 
      !lastMsg.streaming && 
      lastMsg.id !== lastReadMessageIdRef.current
    ) {
      // Mark as read immediately to prevent loops
      lastReadMessageIdRef.current = lastMsg.id;
      
      // Auto-speak the AI response
      // Give a tiny delay for natural audio transition after streaming stops
      setTimeout(() => {
        speak(lastMsg.text);
      }, 300);
    }
  }, [messages, speak]);

  // Click handler for floating button
  const handleAssistantClick = () => {
    if (isListening) {
      stopListening();
    } else if (isSpeaking) {
      stopSpeaking();
    } else {
      // Stop any active speaking before starting to record
      stopSpeaking();
      startListening(lang);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    if (isListening) {
      stopListening();
      // Restart with new language
      setTimeout(() => {
        startListening(newLang);
      }, 200);
    }
  };

  const hasSupport = hasRecSupport;

  return (
    <>
      {/* Floating Microphone Trigger */}
      <VoiceButton
        isListening={isListening}
        isSpeaking={isSpeaking}
        onClick={handleAssistantClick}
        hasSupport={hasSupport}
      />

      {/* Voice Recorder Overlay (Listening/Recognition State) */}
      <VoiceRecorder
        isListening={isListening}
        transcript={transcript}
        onStop={stopListening}
        onCancel={() => {
          stopListening();
          setInputVal("");
        }}
        language={lang}
        onLanguageChange={handleLanguageChange}
        error={recognitionError}
      />

      {/* Voice Player Overlay (Speaking/Text-to-Speech State) */}
      <VoicePlayer
        isSpeaking={isSpeaking}
        onStop={stopSpeaking}
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        rate={rate}
        onRateChange={setRate}
      />
    </>
  );
}

export default VoiceAssistant;
