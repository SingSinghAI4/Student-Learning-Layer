import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { CompanionAvatar } from "./AvatarPicker";
import { useSpeech } from "../hooks/useSpeech";

type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "counting";

interface Props {
  companion: CompanionAvatar;
  studentName: string;
  lessonContext: string;
  lang: "tok" | "en";
  sessionMode?: string;
  onHelpCount?: () => void;
  overrideExpr?: string;
}

// ── Cartoon speech bubble — centred above avatar, tail from avatar top-centre ──
function CompanionBubble({ text, accent }: { text: string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 6 }}
      transition={{ type: "spring", bounce: 0.45, duration: 0.4 }}
      style={{
        position: "absolute",
        /* sit 14px above the avatar top, centred over it */
        bottom: "calc(100% + 14px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: 210,
        background: "#fffdf4",
        borderRadius: 20,
        border: `3px solid ${accent}`,
        padding: "12px 14px",
        boxShadow: `0 6px 24px rgba(0,0,0,0.35), 0 0 0 4px ${accent}22`,
        transformOrigin: "bottom center",
        pointerEvents: "none",
        zIndex: 55,
      }}
    >
      <p style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 800,
        fontFamily: "'Baloo 2', cursive",
        color: "#1a1a2e",
        lineHeight: 1.45,
        textAlign: "center",
      }}>
        {text}
      </p>
      {/* Tail outer — centred, pointing DOWN to avatar head */}
      <div style={{
        position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "11px solid transparent",
        borderRight: "11px solid transparent",
        borderTop: `14px solid ${accent}`,
      }} />
      {/* Tail inner */}
      <div style={{
        position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "9px solid transparent",
        borderRight: "9px solid transparent",
        borderTop: "11px solid #fffdf4",
      }} />
    </motion.div>
  );
}

// ── Mouth dots (thinking / speaking visualiser) ────────────────────────────────
function MouthDots({ voiceState, accent }: { voiceState: VoiceState; accent: string }) {
  if (voiceState === "idle") return null;
  const dots = [0, 1, 2];
  return (
    <div style={{
      position: "absolute", bottom: 22, left: "50%",
      transform: "translateX(-50%)",
      display: "flex", gap: 5, alignItems: "flex-end",
      pointerEvents: "none",
    }}>
      {dots.map(i => (
        <motion.div
          key={i}
          animate={voiceState === "thinking"
            ? { y: [0, -8, 0], opacity: [0.6, 1, 0.6] }
            : voiceState === "speaking"
            ? { scaleY: [0.5, 1.6, 0.5], opacity: [0.7, 1, 0.7] }
            : { y: 0 }}
          transition={{
            duration: voiceState === "speaking" ? 0.35 : 0.55,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          style={{
            width: voiceState === "speaking" ? 5 : 7,
            height: voiceState === "speaking" ? 14 : 7,
            borderRadius: voiceState === "speaking" ? 3 : "50%",
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────
const KUMI_EXPR: Record<string, string> = {
  idle:        "/kumi-happy.png",
  happy:       "/kumi-happy.png",
  listening:   "/kumi-curious.png",
  curious:     "/kumi-curious.png",
  thinking:    "/kumi-thinking.png",
  speaking:    "/kumi-cheering.png",
  cheering:    "/kumi-cheering.png",
  correct:     "/kumi-excited.png",
  excited:     "/kumi-excited.png",
  wrong:       "/kumi-oops.png",
  oops:        "/kumi-oops.png",
  hint:        "/kumi-wink.png",
  wink:        "/kumi-wink.png",
  proud:       "/kumi-proud.png",
  done:        "/kumi-thumbsup.png",
  thumbsup:    "/kumi-thumbsup.png",
  reading:     "/kumi-reading.png",
  magnify:     "/kumi-magnify.png",
  celebrating: "/kumi-celebrating.png",
};

function kumiSrc(voiceState: string, companionId: string, overrideExpr?: string) {
  if (companionId !== "bird") return "/char-bird.png";
  const key = overrideExpr ?? voiceState;
  return KUMI_EXPR[key] ?? KUMI_EXPR.idle;
}

export default function CompanionAssistant({
  companion, studentName, lessonContext, lang, sessionMode, onHelpCount, overrideExpr,
}: Props) {
  const [voiceState, setVoiceState]   = useState<VoiceState>("idle");
  const [response, setResponse]       = useState("");
  const [question, setQuestion]       = useState("");
  const [showBubble, setShowBubble]   = useState(false);
  const [greeted, setGreeted]         = useState(false);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const animFrameRef   = useRef<number>(0);
  const phaseRef       = useRef(0);
  const speakTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recognitionRef    = useRef<any>(null);
  const { speak, speaking, stop } = useSpeech();

  const SYSTEM_PROMPT = `You are ${companion.name}, a warm, encouraging learning companion for ${studentName}, a Grade 2 student in Papua New Guinea.
Lesson context: ${lessonContext}.
Rules:
- Maximum 2 sentences per reply. Short and simple.
- Use vocabulary a 6–7 year old understands.
- Never make the student feel bad.
- Occasionally use Tok Pisin words: "gutpela" (good), "yu save" (you know it), "kamap" (keep going).
- Always end with encouragement.`;

  // ── Audio helpers ─────────────────────────────────────────────────────────
  function stopAudio() {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  function stopAllVisualisation() {
    stopAudio();
    if (speakTimerRef.current) { clearInterval(speakTimerRef.current); speakTimerRef.current = null; }
  }

  // ── Bubble helpers ────────────────────────────────────────────────────────
  function showResponseBubble(text: string) {
    setResponse(text);
    setShowBubble(true);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setShowBubble(false);
    }, 5000);
  }

  // ── Voice state transitions ───────────────────────────────────────────────
  function enterIdle() {
    stopAllVisualisation();
    setVoiceState("idle");
  }

  function enterListening() {
    stop();
    stopAllVisualisation();
    setShowBubble(false);
    setVoiceState("listening");
    startMicVisualisation();
    startSpeechRecognition();
  }

  function enterThinking() {
    stopAllVisualisation();
    setVoiceState("thinking");
    showResponseBubble("…");
  }

  function enterSpeaking(text: string) {
    stopAllVisualisation();
    setVoiceState("speaking");
    showResponseBubble(text);
    speak(text);
  }

  // ── Mic visualisation ─────────────────────────────────────────────────────
  function startMicVisualisation() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      function tick() {
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    }).catch(() => {});
  }

  // ── Help-request detection ────────────────────────────────────────────────
  function isHelpRequest(text: string) {
    const t = text.toLowerCase();
    return ["help", "solve", "answer", "how many", "what is", "count", "show me", "tell me"].some(kw => t.includes(kw));
  }

  // ── Counting mode — launches the overlay and narrates along ─────────────────
  function triggerCountingMode() {
    stop();
    stopAllVisualisation();
    setVoiceState("counting");
    countingTimersRef.current.forEach(clearTimeout);
    countingTimersRef.current = [];

    // Launch the visual overlay in the lesson
    onHelpCount?.();

    // Narrate in sync with the overlay's 1.1s-per-item pace
    const lines = [
      { text: lang === "tok" ? "Kauntim wantaim mi! 👆" : "Let's count together! 👆", spoken: lang === "tok" ? "Kauntim wantaim mi!" : "Let's count together!" },
      { text: lang === "tok" ? "Wan… Tu…" : "One… Two…", spoken: lang === "tok" ? "Wan… Tu…" : "One… Two…" },
      { text: lang === "tok" ? "Tri… Foa… Faiv!" : "Three… Four… Five!", spoken: lang === "tok" ? "Tri… Foa… Faiv!" : "Three… Four… Five!" },
      { text: lang === "tok" ? "Yu save!" : "You got it!", spoken: lang === "tok" ? "Yu save!" : "You got it!" },
    ];

    lines.forEach(({ text, spoken }, i) => {
      const t = setTimeout(() => {
        showResponseBubble(text);
        speak(spoken);
      }, i * 2200);
      countingTimersRef.current.push(t);
    });

    const doneTimer = setTimeout(() => setVoiceState("idle"), lines.length * 2200 + 500);
    countingTimersRef.current.push(doneTimer);
  }

  // ── Speech recognition ────────────────────────────────────────────────────
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
      if (live.trim()) {
        if (isHelpRequest(live)) triggerCountingMode();
        else sendToAI(live);
      } else enterIdle();
    };
    rec.onerror = () => enterIdle();
    rec.start();
  }

  // ── AI call ───────────────────────────────────────────────────────────────
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
      enterSpeaking(reply);
    } catch {
      enterSpeaking("Gutpela question! Keep going — you can do it!");
    }
  }, [companion, SYSTEM_PROMPT]); // eslint-disable-line react-hooks/exhaustive-deps

  // TTS finished → idle
  useEffect(() => {
    if (voiceState === "speaking" && !speaking) {
      setTimeout(enterIdle, 800);
    }
  }, [speaking, voiceState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Greeting on mount
  useEffect(() => {
    if (greeted) return;
    const t = setTimeout(() => {
      const greeting = lang === "tok"
        ? `Gutpela! Mi ${companion.nameTok}. Presim mi na askim samting!`
        : `Hi ${studentName}! I'm ${companion.name}. Tap me to ask anything!`;
      setGreeted(true);
      enterSpeaking(greeting);
    }, 1200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => () => {
    stopAllVisualisation();
    stop();
    recognitionRef.current?.stop();
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    countingTimersRef.current.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tap handler ───────────────────────────────────────────────────────────
  function handleTap() {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
    } else if (voiceState === "idle") {
      setQuestion("");
      enterListening();
    }
    // thinking / speaking: ignore taps
  }

  const accent     = companion.accentColor;
  const isActivity = sessionMode === "activity";
  const avatarSize = isActivity ? 60 : 170;

  // ── State → animation map ─────────────────────────────────────────────────
  const avatarAnimate = (() => {
    if (voiceState === "counting")  return { y: [0, -10, 0], scale: [1, 1.07, 1] };
    if (voiceState === "speaking")  return { y: [0, -12, 0, -8, 0], scale: [1, 1.06, 1, 1.04, 1] };
    if (voiceState === "listening") return { scale: [1, 1.05, 1] };
    if (voiceState === "thinking")  return { rotate: [-2, 2, -2] };
    return { y: [0, -6, 0] };
  })();

  const avatarTransition = (() => {
    if (voiceState === "counting")  return { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const };
    if (voiceState === "speaking")  return { duration: 0.7, repeat: Infinity, ease: "easeInOut" as const };
    if (voiceState === "listening") return { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const };
    if (voiceState === "thinking")  return { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const };
    return { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const };
  })();

  const glowColor = voiceState === "listening" ? "#ff4444" : accent;
  const glowSize  = voiceState === "idle" ? "0 0 18px" : "0 0 36px";

  const bubbleText = voiceState === "listening" && question ? `"${question}"` : response;
  const wasDraggingRef = useRef(false);

  return (
    /* Fixed-size anchor — draggable, anchored bottom-right by default */
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { wasDraggingRef.current = true; }}
      onDragEnd={() => { setTimeout(() => { wasDraggingRef.current = false; }, 80); }}
      whileDrag={{ scale: 1.06, cursor: "grabbing" }}
      style={{
        position: "absolute",
        bottom: "22%",
        right: "4%",
        width: avatarSize,
        height: avatarSize,
        zIndex: 32,
        pointerEvents: "all",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    >

      {/* Avatar — bubble and label live INSIDE so they bob with the avatar */}
      <motion.div
        animate={avatarAnimate}
        transition={avatarTransition}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: voiceState === "thinking" || voiceState === "speaking" ? "default" : "pointer",
          pointerEvents: "all",
        }}
        onClick={() => { if (!wasDraggingRef.current) handleTap(); }}
      >
        {/* Speech bubble — above the avatar, moves with it */}
        <AnimatePresence>
          {showBubble && !isActivity && (
            <CompanionBubble key={response} text={bubbleText} accent={accent} />
          )}
        </AnimatePresence>

        {/* Listening label */}
        <AnimatePresence>
          {voiceState === "listening" && !isActivity && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 11,
                fontWeight: 800,
                color: "#ff6666",
                fontFamily: "'Nunito', sans-serif",
                background: "rgba(0,0,0,0.65)",
                borderRadius: 12,
                padding: "3px 10px",
                pointerEvents: "none",
              }}
            >
              Listening… tap to stop
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring — listening */}
        <AnimatePresence>
          {voiceState === "listening" && (
            <motion.div
              key="listen-ring"
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" as const }}
              style={{
                position: "absolute", inset: -6,
                borderRadius: "50%",
                border: "3px solid #ff4444",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Speaking glow ring */}
        <AnimatePresence>
          {voiceState === "speaking" && (
            <motion.div
              key="speak-ring"
              initial={{ scale: 0.95, opacity: 0.6 }}
              animate={{ scale: 1.22, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" as const }}
              style={{
                position: "absolute", inset: -5,
                borderRadius: "50%",
                border: `3px solid ${accent}`,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Avatar image */}
        <div style={{
          width: "100%", height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          border: `4px solid ${glowColor}`,
          boxShadow: `${glowSize} ${glowColor}cc, 0 6px 24px rgba(0,0,0,0.55)`,
          background: `radial-gradient(circle at 50% 65%, ${accent}44, transparent 70%)`,
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}>
          <img
            src={kumiSrc(voiceState, companion.id, overrideExpr)}
            alt={companion.name}
            draggable={false}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Mouth dots */}
        {!isActivity && <MouthDots voiceState={voiceState} accent={accent} />}

        {/* State badge */}
        <motion.div
          key={voiceState}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          style={{
            position: "absolute",
            bottom: 6, right: 6,
            width: 30, height: 30,
            borderRadius: "50%",
            background: voiceState === "listening"
              ? "radial-gradient(circle, #ff5555, #cc0000)"
              : voiceState === "counting"
              ? "radial-gradient(circle, #FFD93D, #ff8f00)"
              : voiceState !== "idle"
              ? `radial-gradient(circle, ${accent}, ${accent}aa)`
              : "rgba(20,20,20,0.88)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        >
          {voiceState === "counting" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#1a0a00" stroke="#1a0a00" strokeWidth="1">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#1a0a00"/>
            </svg>
          ) : voiceState === "idle" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="rgba(255,255,255,0.25)" stroke="#fff" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="9" y1="22" x2="15" y2="22" />
            </svg>
          ) : voiceState === "listening" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
              <circle cx="12" cy="12" r="6" />
            </svg>
          ) : voiceState === "thinking" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="1.5" fill="#fff" />
              <circle cx="6.5" cy="12" r="1.5" fill="#fff" />
              <circle cx="17.5" cy="12" r="1.5" fill="#fff" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(255,255,255,0.25)" stroke="#fff" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </motion.div>

        {/* Name tag */}
        {!isActivity && (
          <div style={{
            position: "absolute",
            bottom: -24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "'Nunito', sans-serif",
            padding: "2px 10px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            border: `1px solid ${accent}55`,
            pointerEvents: "none",
          }}>
            {companion.name}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
