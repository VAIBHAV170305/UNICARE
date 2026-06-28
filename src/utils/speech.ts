/**
 * Utility functions for browser-based Web Speech APIs (Speech Recognition & Speech Synthesis)
 */

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const globalWindow = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  const SpeechRecognition = globalWindow.SpeechRecognition || globalWindow.webkitSpeechRecognition;
  return !!SpeechRecognition;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.speechSynthesis;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Tries to find a suitable voice based on language and keywords
 */
export function findVoiceForLanguage(lang: string, genderPreference?: "male" | "female"): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // Filter voices matching language prefix (e.g. 'en' or 'hi')
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().split("-")[0]));
  if (langVoices.length === 0) return null;

  // Look for exact locale match if provided (e.g. 'en-US', 'hi-IN')
  const exactLocaleVoices = langVoices.filter(v => v.lang.toLowerCase() === lang.toLowerCase());
  const pool = exactLocaleVoices.length > 0 ? exactLocaleVoices : langVoices;

  // Try to find a voice that matches name preferences
  if (genderPreference === "female") {
    const femaleKeywords = ["samantha", "zira", "hazel", "google", "female", "moira", "tessa", "veena", "kalpana"];
    const bestFemale = pool.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
    if (bestFemale) return bestFemale;
  } else if (genderPreference === "male") {
    const maleKeywords = ["david", "ravi", "google", "male", "microsoft", "mark", "george"];
    const bestMale = pool.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
    if (bestMale) return bestMale;
  }

  // Fallback to first matching language voice, or browser default
  const defaultVoice = pool.find(v => v.default);
  return defaultVoice || pool[0];
}
