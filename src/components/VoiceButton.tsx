import React from "react";

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  hasSupport: boolean;
}

export function VoiceButton({ onClick, hasSupport }: VoiceButtonProps) {
  if (!hasSupport) return null;

  // Use an off-screen invisible button instead of hidden (display: none).
  // Some browsers block programmatic .click() triggers on display:none elements.
  return (
    <button
      id="floating-voice-btn"
      onClick={onClick}
      className="absolute opacity-0 pointer-events-none w-0 h-0 left-[-9999px]"
      aria-hidden="true"
      type="button"
    />
  );
}

export default VoiceButton;
