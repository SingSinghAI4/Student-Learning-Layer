import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanionAvatar } from "./AvatarPicker";
import { useSpeech } from "../hooks/useSpeech";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface Props {
  companion: CompanionAvatar;
  studentName: string;
  lessonContext: string;
  lang: "tok" | "en";
}

const BAR_COUNT = 40;

// ── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({
  voiceState,
  barHeights,
  accent,
}: {
  voiceState: VoiceState;
  barHeights: number[];
  accent: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 4, height: 72, width: "100%",
    }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        let height = 4;
        if (voiceState === "listening") {
          height = barHeights[Math.floor(i * barHeights.length / BAR_COUNT)] ?? 4;
        } else if (voiceState === "speaking") {
          height = barHeights[i] ?? 4;
        } else if (voiceState === "thinking") {
          // ripple from centre
          const dist = Math.abs(i - BAR_COUNT / 2);
          height = barHeights[i] ?? Math.max(4, 18 - dist * 1.2);
        }

        return (
          <motion.div
            key={i}
            animate={{ height, opacity: voiceState === "idle" ? 0.25 : 1 }}
            transition={{ duration: 0.06, ease: "linear" }}
            style={{
              width: 5, borderRadius: 3,
              background: accent,
              minHeight: 4,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CompanionAssistant({ companion, studentName, lessonContext, lang }: Props) {
  const [open, setOpen]             = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [response, setResponse]     = useState("");
  const [question, setQuestion]     = useState("");
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(4));

  // Web Audio for mic visualisation
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const animFrameRef   = useRef<number>(0);
  // Sine wave phase for speaking animation
  const phaseRef       = useRef(0);
  const speakTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const { speak, speaking, stop } = useSpeech();

  const SYSTEM_PROMPT = `You are ${companion.name}, a warm, encouraging learning companion for ${studentName}, a Grade 2 student in Papua New Guinea.
Lesson context: ${lessonContext}.
Rules:
- Maximum 2 sentences per reply. Short and simple.
- Use vocabulary a 6–7 year old understands.
- Never make the student feel bad.
- Occasionally use Tok Pisin words: "gutpela" (good), "yu save" (you know it), "kamap" (keep going).
- Always end with encouragement.`;

  // ── Mic / Web Audio helpers ──────────────────────────────────────────────
  function stopAudio() {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  function startMicVisualisation() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);

      function tick() {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        // mirror the spectrum for symmetry
        const half = Array.from(data).slice(0, BAR_COUNT / 2).map(v => Math.max(4, (v / 255) * 68));
        setBarHeights([...half.slice().reverse(), ...half]);
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    }).catch(() => {
      // No mic permission — use pulsing fallback
      setBarHeights(Array(BAR_COUNT).fill(0).map((_, i) =>
        Math.abs(Math.sin(i * 0.4)) * 30 + 8
      ));
    });
  }

  function startSpeakingVisualisation() {
    phaseRef.current = 0;
    speakTimerRef.current = setInterval(() => {
      phaseRef.current += 0.22;
      const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
        const wave1 = Math.sin(phaseRef.current + i * 0.38) * 28;
        const wave2 = Math.sin(phaseRef.current * 1.7 + i * 0.6) * 14;
        return Math.max(4, 36 + wave1 + wave2);
      });
      setBarHeights(heights);
    }, 45);
  }

  function startThinkingVisualisation() {
    phaseRef.current = 0;
    speakTimerRef.current = setInterval(() => {
      phaseRef.current += 0.14;
      const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
        const dist = Math.abs(i - BAR_COUNT / 2);
        return Math.max(4, (Math.sin(phaseRef.current - dist * 0.45) * 16) + 20 - dist * 0.5);
      });
      setBarHeights(heights);
    }, 55);
  }

  function stopAllVisualisation() {
    stopAudio();
    if (speakTimerRef.current) { clearInterval(speakTimerRef.current); speakTimerRef.current = null; }
    setBarHeights(Array(BAR_COUNT).fill(4));
  }

  // ── Voice state transitions ────────────────────────────────────────────────
  function enterIdle() {
    stopAllVisualisation();
    setVoiceState("idle");
  }

  function enterListening() {
    stop();
    stopAllVisualisation();
    setVoiceState("listening");
    startMicVisualisation();
    startSpeechRecognition();
  }

  function enterThinking() {
    stopAllVisualisation();
    setVoiceState("thinking");
    startThinkingVisualisation();
  }

  function enterSpeaking(text: string) {
    stopAllVisualisation();
    setVoiceState("speaking");
    startSpeakingVisualisation();
    speak(text);
  }

  // ── Speech recognition ───────────────────────────────────────────────────
  function startSpeechRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { enterIdle(); return; }

    let live = "";
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onresult = (e: any) => {
      live = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join("");
      setQuestion(live);
    };
    rec.onend = () => {
      stopAudio();
      if (live.trim()) sendToAI(live);
      else enterIdle();
    };
    rec.onerror = () => enterIdle();
    rec.start();
  }

  // ── AI call ──────────────────────────────────────────────────────────────
  const sendToAI = useCallback(async (text: string) => {
    enterThinking();
    try {
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("no-key");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const reply: string = data.content?.[0]?.text ?? "Yu save tumas! Keep trying!";
      setResponse(reply);
      enterSpeaking(reply);
    } catch {
      const fallback = "Gutpela question! Keep going — you can do it!";
      setResponse(fallback);
      enterSpeaking(fallback);
    }
  }, [companion, SYSTEM_PROMPT]); // eslint-disable-line react-hooks/exhaustive-deps

  // When TTS finishes → go back to idle
  useEffect(() => {
    if (voiceState === "speaking" && !speaking) {
      setTimeout(enterIdle, 600);
    }
  }, [speaking, voiceState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Greet on open
  useEffect(() => {
    if (!open) { enterIdle(); setResponse(""); setQuestion(""); return; }
    const greeting = lang === "tok"
      ? `Gutpela! Mi ${companion.nameTok}. Yu gat askim? Tokim mi!`
      : `Hi ${studentName}! I'm ${companion.name}. Tap the mic and ask me anything!`;
    setResponse(greeting);
    setTimeout(() => enterSpeaking(greeting), 300);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => () => { stopAllVisualisation(); stop(); recognitionRef.current?.stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accent = companion.accentColor;

  const STATUS_LABELS: Record<VoiceState, string> = {
    idle:      "Tap the mic to ask a question",
    listening: "Listening…",
    thinking:  "Let me think…",
    speaking:  "Speaking…",
  };

  // Track whether last pointer action was a drag so click doesn't fire
  const wasDraggingRef = useRef(false);

  return (
    <>
      {/* ── Draggable companion icon ────────────────────────────────────── */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => { wasDraggingRef.current = true; }}
        onDragEnd={() => { setTimeout(() => { wasDraggingRef.current = false; }, 80); }}
        style={{
          position: "absolute", bottom: 90, left: 14, zIndex: 52,
          touchAction: "none", userSelect: "none",
          cursor: "grab",
        }}
        whileDrag={{ scale: 1.08, cursor: "grabbing" }}
      >
        <motion.button
          onClick={() => { if (!wasDraggingRef.current) setOpen(o => !o); }}
          animate={speaking ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.75 } } : { scale: 1 }}
          title={`Ask ${companion.name}`}
          style={{
            width: 110, height: 110, borderRadius: "50%",
            padding: 0, overflow: "hidden",
            border: `3px solid ${accent}`,
            background: `radial-gradient(circle at 50% 60%, ${accent}44, #07120400)`,
            boxShadow: open
              ? `0 0 0 5px ${accent}44, 0 4px 20px rgba(0,0,0,0.7)`
              : `0 0 14px ${accent}88, 0 4px 14px rgba(0,0,0,0.55)`,
            cursor: "pointer", display: "block",
            transition: "box-shadow 0.3s",
          }}
        >
          <img src={companion.image} alt={companion.name}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", pointerEvents: "none" }}
          />
        </motion.button>

        {/* Live dot */}
        {open && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={{
              position: "absolute", bottom: 2, right: 2,
              width: 13, height: 13, borderRadius: "50%",
              background: voiceState === "listening" ? "#ff3b3b" : accent,
              border: "2px solid #07120a",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.div>

      {/* ── Voice overlay ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="voice-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0,
              zIndex: 60,
              background: "rgba(3,10,2,0.84)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: "spring", bounce: 0.28 }}
              style={{
                width: "88%", maxWidth: 360,
                background: `linear-gradient(170deg, rgba(12,28,8,0.98), rgba(5,14,3,0.99))`,
                border: `1.5px solid ${accent}44`,
                borderRadius: 32,
                padding: "28px 24px 32px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 0,
                boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 48px ${accent}18`,
                position: "relative",
              }}
            >
              {/* Close */}
              <button
                onClick={() => { stop(); recognitionRef.current?.stop(); setOpen(false); }}
                style={{
                  position: "absolute", top: 16, right: 16,
                  background: "rgba(255,255,255,0.08)", border: "none",
                  color: "rgba(255,255,255,0.5)", width: 30, height: 30,
                  borderRadius: "50%", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>

              {/* Companion avatar */}
              <motion.div
                animate={
                  voiceState === "speaking"
                    ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.9 } }
                    : voiceState === "listening"
                    ? { boxShadow: [`0 0 0 0 ${accent}44`, `0 0 0 16px ${accent}00`] as any,
                        transition: { repeat: Infinity, duration: 1 } }
                    : { scale: 1 }
                }
                style={{
                  width: 120, height: 120, borderRadius: "50%",
                  overflow: "hidden",
                  border: `4px solid ${accent}`,
                  background: `radial-gradient(circle at 50% 65%, ${accent}44, transparent 70%)`,
                  boxShadow: voiceState === "speaking"
                    ? `0 0 32px ${accent}bb`
                    : voiceState === "listening"
                    ? `0 0 24px #ff3b3b88`
                    : `0 0 18px ${accent}55`,
                  marginBottom: 14,
                  transition: "box-shadow 0.4s",
                }}
              >
                <img src={companion.image} alt={companion.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              </motion.div>

              {/* Name */}
              <div style={{
                fontFamily: "'Baloo 2', cursive", fontWeight: 900,
                fontSize: 20, color: "#fff", marginBottom: 4,
              }}>
                {companion.name}
              </div>

              {/* Status */}
              <motion.div
                key={voiceState}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 13, fontWeight: 700, color: accent,
                  fontFamily: "'Nunito', sans-serif",
                  marginBottom: 20,
                  letterSpacing: 0.3,
                }}
              >
                {STATUS_LABELS[voiceState]}
              </motion.div>

              {/* Waveform */}
              <div style={{ width: "100%", marginBottom: 20 }}>
                <Waveform voiceState={voiceState} barHeights={barHeights} accent={accent} />
              </div>

              {/* Response / question text */}
              <div style={{
                minHeight: 64, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24, padding: "0 8px",
              }}>
                <AnimatePresence mode="wait">
                  {voiceState === "listening" && question ? (
                    <motion.p key="q"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{
                        fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700,
                        color: "rgba(255,255,255,0.5)", textAlign: "center",
                        fontStyle: "italic", margin: 0,
                      }}
                    >
                      "{question}"
                    </motion.p>
                  ) : response ? (
                    <motion.p key="r"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 700,
                        color: "rgba(255,255,255,0.92)", textAlign: "center",
                        lineHeight: 1.55, margin: 0,
                      }}
                    >
                      {response}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Mic button */}
              <motion.button
                onClick={() => {
                  if (voiceState === "listening") {
                    recognitionRef.current?.stop();
                  } else if (voiceState === "idle") {
                    setQuestion("");
                    enterListening();
                  }
                }}
                whileTap={{ scale: 0.9 }}
                animate={
                  voiceState === "listening"
                    ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.55 } }
                    : { scale: 1 }
                }
                disabled={voiceState === "thinking" || voiceState === "speaking"}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "none", cursor: voiceState === "thinking" || voiceState === "speaking" ? "default" : "pointer",
                  background: voiceState === "listening"
                    ? "radial-gradient(circle, #ff5555, #cc2222)"
                    : voiceState === "thinking" || voiceState === "speaking"
                    ? "rgba(255,255,255,0.1)"
                    : `radial-gradient(circle, ${accent}, ${accent}bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                  boxShadow: voiceState === "listening"
                    ? "0 0 32px #ff555588, 0 4px 16px rgba(0,0,0,0.5)"
                    : voiceState === "idle"
                    ? `0 0 24px ${accent}99, 0 4px 16px rgba(0,0,0,0.5)`
                    : "0 4px 12px rgba(0,0,0,0.4)",
                  transition: "background 0.25s, box-shadow 0.25s",
                }}
              >
                {voiceState === "thinking" ? "⋯" : voiceState === "speaking" ? "🔊" : "🎤"}
              </motion.button>

              {voiceState === "listening" && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.4)",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 600,
                  }}
                >
                  Tap again to stop
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
