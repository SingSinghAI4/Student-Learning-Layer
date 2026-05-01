import { useState, useCallback, useRef } from "react";

export interface SpeakOptions {
  onWordChange?: (wordIdx: number) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const EL_API_KEY  = "sk_038eb11c08e10490e8ad208c724a37120929fa72d140ec4f";
const EL_VOICE_ID = "CzB4M3PjIseM76XNOtZe";
const EL_ENDPOINT = `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/with-timestamps`;

// Module-level singleton so narration + AI responses never clash
let activeAudio: HTMLAudioElement | null = null;
let activeAbort: AbortController | null  = null;
let activeRaf:   number                  = 0;

function stopAll() {
  activeAbort?.abort();
  activeAbort = null;
  cancelAnimationFrame(activeRaf);
  activeRaf = 0;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  window.speechSynthesis?.cancel();
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const pendingRef = useRef(false);

  const stop = useCallback(() => {
    stopAll();
    pendingRef.current = false;
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    const { onWordChange } = options;

    if (pendingRef.current) return;
    stopAll();
    pendingRef.current = true;
    setSpeaking(true);

    // ── ElevenLabs ──
    const controller = new AbortController();
    activeAbort = controller;
    try {
      const friendlyText = text.replace(/\.\s+/g, "... ").replace(/!/g, "! ");
      const res = await fetch(EL_ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "xi-api-key":   EL_API_KEY,
          "Content-Type": "application/json",
          "Accept":       "application/json",
        },
        body: JSON.stringify({
          text: friendlyText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability:         0.52,
            similarity_boost:  0.78,
            style:             0.42,
            use_speaker_boost: true,
          },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const binary = atob(data.audio_base64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url  = URL.createObjectURL(blob);

      // Build word-level timing from character-level alignment
      const alignment = data.alignment as {
        characters: string[];
        character_start_times_seconds: number[];
        character_end_times_seconds: number[];
      } | undefined;
      const wordTimings: { start: number }[] = [];
      if (alignment) {
        const { characters: chars, character_start_times_seconds: starts } = alignment;
        let inWord = false;
        for (let i = 0; i < chars.length; i++) {
          const isSpace = chars[i] === " " || chars[i] === "\n";
          if (!isSpace && !inWord) {
            wordTimings.push({ start: starts[i] });
            inWord = true;
          } else if (isSpace) {
            inWord = false;
          }
        }
      }

      const audio = new Audio(url);
      activeAudio = audio;
      let wordIdx = 0;

      const tick = () => {
        if (!activeAudio || activeAudio.paused) return;
        const t = activeAudio.currentTime;
        while (wordIdx < wordTimings.length && t >= wordTimings[wordIdx].start) {
          onWordChange?.(wordIdx);
          wordIdx++;
        }
        activeRaf = requestAnimationFrame(tick);
      };

      audio.onplay = () => { activeRaf = requestAnimationFrame(tick); };
      audio.onended = () => {
        cancelAnimationFrame(activeRaf);
        URL.revokeObjectURL(url);
        pendingRef.current = false;
        setSpeaking(false);
        onWordChange?.(-1);
      };
      audio.onerror = () => {
        cancelAnimationFrame(activeRaf);
        URL.revokeObjectURL(url);
        pendingRef.current = false;
        setSpeaking(false);
      };
      audio.play();
      return;
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("[EL] TTS failed:", err);
      pendingRef.current = false;
      setSpeaking(false);
      return;
    }
  }, [stop]);

  return { speaking, speak, stop };
}
