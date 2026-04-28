import { useState, useCallback, useRef } from "react";

export interface SpeakOptions {
  onWordChange?: (wordIdx: number) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// ── ElevenLabs config (commented out to preserve API credits) ──
// const EL_API_KEY  = "sk_038eb11c08e10490e8ad208c724a37120929fa72d140ec4f";
// const EL_VOICE_ID = "CzB4M3PjIseM76XNOtZe";
// const EL_ENDPOINT = `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/with-timestamps`;

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
    const { onWordChange, rate = 1, pitch = 1, volume = 1 } = options;

    if (pendingRef.current) return;
    stopAll();
    pendingRef.current = true;
    setSpeaking(true);

    // ── ElevenLabs (disabled — uncomment to re-enable) ──
    /*
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
      // ... (word timestamps + audio playback)
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("[EL] TTS failed:", err);
      pendingRef.current = false;
      setSpeaking(false);
    }
    */

    // ── Fallback: browser Web Speech API ──
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate   = rate;
      utterance.pitch  = pitch;
      utterance.volume = volume;

      utterance.onboundary = (e) => {
        if (e.name === "word" && onWordChange) {
          // approximate word index from char position
          const upTo = text.slice(0, e.charIndex);
          const idx  = upTo.split(/\s+/).filter(Boolean).length;
          onWordChange(idx);
        }
      };

      utterance.onend = () => {
        pendingRef.current = false;
        setSpeaking(false);
        onWordChange?.(-1);
      };

      utterance.onerror = () => {
        pendingRef.current = false;
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("[Speech] TTS failed:", err);
      pendingRef.current = false;
      setSpeaking(false);
    }
  }, [stop]);

  return { speaking, speak, stop };
}
