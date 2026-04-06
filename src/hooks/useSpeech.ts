import { useState, useCallback, useEffect, useRef } from "react";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Preferred voices in order — soft, warm, female voices that work well for kids
const PREFERRED_VOICES = [
  "Moana",            // macOS — Hawaiian/Pacific, warm and soft
  "Karen",            // macOS — Australian female, gentle
  "Samantha",         // macOS — default US female, clear
  "Tessa",            // macOS — South African female, soft
  "Serena",           // macOS — UK female, warm
  "Google UK English Female",
  "Google US English",
  "Microsoft Zira",   // Windows — female, soft
  "Microsoft Aria",   // Windows — modern female
];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Try preferred list first
  for (const name of PREFERRED_VOICES) {
    const match = voices.find(v => v.name.includes(name));
    if (match) return match;
  }

  // Fall back to any English female-sounding voice
  const female = voices.find(v =>
    v.lang.startsWith("en") &&
    /female|girl|woman|zira|aria|karen|samantha|moana/i.test(v.name)
  );
  if (female) return female;

  // Last resort: any English voice
  return voices.find(v => v.lang.startsWith("en")) ?? null;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Voices load asynchronously — wait for them
  useEffect(() => {
    function loadVoices() {
      const v = pickVoice();
      voiceRef.current = v;
      setVoiceReady(true);
    }

    // Already loaded (common in Chrome)
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }
    // Safari / Firefox fire this event
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang   = "en-US";
    utterance.rate   = options.rate   ?? 0.78;  // slow and clear for kids
    utterance.pitch  = options.pitch  ?? 1.25;  // warm, slightly higher = friendlier
    utterance.volume = options.volume ?? 0.95;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop };
}
