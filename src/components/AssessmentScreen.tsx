/**
 * AssessmentScreen — full-screen quiz styled to match MathsCartoonLesson.
 * Bright cartoon sky + ground scene, Beni mascot, frosted-glass topbar.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MathsActivity, AVATARS } from "../data";
import { StudentProfile } from "../LoginScreen";
import TeachMoment from "./TeachMoment";
import BeniCharacter from "./BeniCharacter";

interface Props {
  activity: MathsActivity;
  actIdx: number;
  totalActs: number;
  actSelected: string | null;
  actWrong: string | null;
  lang: "tok" | "en";
  profile: StudentProfile;
  onAnswer: (v: string) => void;
  onNext: () => void;
  onLangToggle?: () => void;
}

const PARTICLES = [
  { emoji: "🥭", left: "4%",  size: 20, dur: 9,  delay: 0   },
  { emoji: "🥥", left: "15%", size: 22, dur: 12, delay: 2   },
  { emoji: "🍌", left: "27%", size: 18, dur: 8,  delay: 1   },
  { emoji: "🔢", left: "40%", size: 16, dur: 11, delay: 4   },
  { emoji: "🏪", left: "54%", size: 20, dur: 10, delay: 3   },
  { emoji: "⭐", left: "66%", size: 14, dur: 9,  delay: 5   },
  { emoji: "🥭", left: "78%", size: 22, dur: 13, delay: 1.5 },
  { emoji: "💰", left: "90%", size: 18, dur: 10, delay: 6   },
  { emoji: "➕", left: "50%", size: 16, dur: 12, delay: 3.5 },
];

export default function AssessmentScreen({
  activity,
  actIdx,
  totalActs,
  actSelected,
  actWrong,
  lang,
  profile,
  onAnswer,
  onNext,
  onLangToggle,
}: Props) {
  const isCorrectAnswer = actSelected === activity.correct;

  // Mascot animation state
  const [mascotState, setMascotState] = useState<"idle" | "correct" | "sad">("idle");
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash,   setShowWrongFlash]   = useState(false);
  const [showXP, setShowXP] = useState(false);

  const [showTeachMoment, setShowTeachMoment] = useState(false);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);

  const prevActSelected = useRef<string | null>(null);
  const prevActWrong    = useRef<string | null>(null);
  const prevActWrongTM  = useRef<string | null>(null);

  useEffect(() => {
    prevActSelected.current = null;
    prevActWrong.current    = null;
    prevActWrongTM.current  = null;
    setMascotState("idle");
    setShowTeachMoment(false);
    setWrongAttemptCount(0);
  }, [actIdx]);

  useEffect(() => {
    if (actSelected && actSelected !== prevActSelected.current) {
      prevActSelected.current = actSelected;
      setMascotState("correct");
      setShowCorrectFlash(true);
      setShowXP(true);
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.55 }, colors: ["#FFD93D","#52B788","#A8DADC","#E63946"] });
      setTimeout(() => setMascotState("idle"), 1300);
      setTimeout(() => setShowCorrectFlash(false), 450);
      setTimeout(() => setShowXP(false), 1100);
    }
  }, [actSelected]);

  useEffect(() => {
    if (actWrong && actWrong !== prevActWrong.current) {
      prevActWrong.current = actWrong;
      setMascotState("sad");
      setShowWrongFlash(true);
      setTimeout(() => setMascotState("idle"), 750);
      setTimeout(() => setShowWrongFlash(false), 420);
    }
    if (actWrong && actWrong !== prevActWrongTM.current) {
      prevActWrongTM.current = actWrong;
      setWrongAttemptCount(c => c + 1);
      const t = setTimeout(() => setShowTeachMoment(true), 520);
      return () => clearTimeout(t);
    }
  }, [actWrong]);

  const progressPct = totalActs > 1 ? (actIdx / (totalActs - 1)) * 100 : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      display: "flex", flexDirection: "column",
      fontFamily: "'Baloo 2', cursive",
      overflow: "hidden",
    }}>

      {/* ── Cartoon sky background ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: "22%",
        background: "linear-gradient(to bottom, #0d47a1 0%, #1976d2 45%, #64b5f6 100%)",
        zIndex: 0,
        overflow: "hidden",
      }}>
        {/* Sun */}
        <motion.div style={{
          position: "absolute", top: "10%", right: "8%",
          width: 60, height: 60, borderRadius: "50%",
          background: "radial-gradient(circle, #FFE566 35%, #FFB300 100%)",
          boxShadow: "0 0 44px 22px rgba(255,190,0,0.38), 0 0 88px 44px rgba(255,150,0,0.16)",
          pointerEvents: "none",
        }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Clouds */}
        <motion.div style={{
          position: "absolute", top: "16%",
          width: 180, height: 48, borderRadius: 24,
          background: "rgba(255,255,255,0.92)",
          boxShadow: "34px -16px 0 9px rgba(255,255,255,0.92), -20px -10px 0 4px rgba(255,255,255,0.92), 80px -20px 0 14px rgba(255,255,255,0.92)",
          pointerEvents: "none",
        }}
          animate={{ x: ["-220px", "110vw"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <motion.div style={{
          position: "absolute", top: "38%",
          width: 130, height: 34, borderRadius: 17,
          background: "rgba(255,255,255,0.78)",
          boxShadow: "24px -12px 0 6px rgba(255,255,255,0.78), 60px -14px 0 10px rgba(255,255,255,0.78)",
          pointerEvents: "none",
        }}
          animate={{ x: ["-160px", "110vw"] }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear", delay: 14 }}
        />
      </div>

      {/* ── Ground strip ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: "22%",
        background: "linear-gradient(to bottom, #2d6a1a 0%, #1a4a0a 100%)",
        zIndex: 0,
      }}>
        {/* Grass texture line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: "linear-gradient(to right, #52B788 0%, #40916C 30%, #74c69d 60%, #52B788 100%)",
        }} />
      </div>

      {/* ── Floating background particles ── */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="float-particle" style={{
          left: p.left, bottom: "-60px",
          fontSize: p.size,
          animationDuration: `${p.dur}s`,
          animationDelay:    `${p.delay}s`,
        }}>{p.emoji}</div>
      ))}

      {/* ── Screen flash overlays ── */}
      <AnimatePresence>
        {showCorrectFlash && (
          <motion.div key="cfl" className="screen-flash correct-fl"
            initial={{ opacity: 0.65 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.45 }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWrongFlash && (
          <motion.div key="wfl" className="screen-flash wrong-fl"
            initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.42 }} />
        )}
      </AnimatePresence>

      {/* ── Flying XP ── */}
      <AnimatePresence>
        {showXP && (
          <motion.div key="xp" className="flying-xp"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -100, scale: 1.8 }}
            transition={{ duration: 1.0, ease: "easeOut" }}>
            +⭐
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TeachMoment overlay ── */}
      <AnimatePresence>
        {showTeachMoment && (
          <TeachMoment
            addends={activity.addends}
            emojiA={activity.emojiA}
            emojiB={activity.emojiB}
            attemptNumber={wrongAttemptCount}
            onDismiss={() => {
              setShowTeachMoment(false);
              prevActWrongTM.current = null;
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Frosted-glass topbar ── */}
      <div style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        {/* Avatar chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.1)", borderRadius: 20,
          padding: "4px 12px 4px 6px",
          border: "1px solid rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #52B788, #2d6a4f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            {AVATARS[profile.avatarIdx]?.emoji ?? "🧒"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{profile.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
              ⭐ Quiz {actIdx + 1} of {totalActs}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>
            {lang === "tok" ? "Askim" : "Quiz"} — {Math.round(progressPct)}% {lang === "tok" ? "Pinis" : "done"}
          </div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(to right, #FFD93D, #ff8f00)", borderRadius: 4, width: 0 }}
            />
          </div>
        </div>

        {/* Lang toggle pill */}
        {onLangToggle && (
          <button
            onClick={onLangToggle}
            style={{
              fontSize: 11, fontWeight: 800, whiteSpace: "nowrap",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12, padding: "4px 10px",
              color: "#FFD93D", cursor: "pointer", flexShrink: 0,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {lang === "tok" ? "EN" : "TOK"}
          </button>
        )}

        {/* Offline pill */}
        <div style={{
          fontSize: 10, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "3px 8px",
          flexShrink: 0,
        }}>
          ● Offline
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "16px 36px 100px",
        gap: 16, overflow: "hidden",
        position: "relative", zIndex: 1,
      }}>

        {/* Activity card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`activity-${actIdx}`}
            className="activity-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35 }}
          >
            <div className="act-label">{activity.label}</div>
            <div className="act-q">{activity.q}</div>
            <div className="act-q-tok">{activity.tok}</div>
            {activity.visual && (
              <motion.div
                className="act-visual"
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                {activity.visual}
              </motion.div>
            )}
            <div className="act-options">
              {activity.options.map((opt, i) => {
                const isCorrect = actSelected === opt.val;
                const isWrong   = !showTeachMoment && actWrong === opt.val;
                return (
                  <motion.button
                    key={i}
                    className={`act-opt${isCorrect ? " correct" : isWrong ? " wrong" : ""}`}
                    onClick={() => onAnswer(opt.val)}
                    disabled={!!actSelected}
                    whileHover={!actSelected ? { scale: 1.06, y: -3 } : {}}
                    whileTap={!actSelected ? { scale: 0.94 } : {}}
                    animate={
                      isCorrect
                        ? { scale: [1, 1.18, 1], opacity: 1, y: 0 }
                        : isWrong
                        ? { x: [-10, 10, -8, 8, 0], opacity: 1, y: 0 }
                        : { opacity: 1, y: 0 }
                    }
                    initial={{ opacity: 0, y: 16 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  >
                    <div>{opt.label}</div>
                    <div className="act-opt-sub">{opt.tok}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Next button appears inside card after answering */}
            <AnimatePresence>
              {actSelected && (
                <motion.button
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onNext}
                  style={{
                    marginTop: 18, width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #2D6A4F, #40916C)",
                    border: "none", borderRadius: 18,
                    fontSize: 17, fontWeight: 900, color: "#fff",
                    cursor: "pointer",
                    fontFamily: "'Baloo 2', cursive",
                    boxShadow: "0 6px 24px rgba(45,106,79,0.45)",
                  }}
                >
                  {isCorrectAnswer
                    ? (lang === "tok" ? "Gutpela! Nekis ▶" : "Correct! Next ▶")
                    : (lang === "tok" ? "Nekis ▶" : "Next ▶")}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Beni mascot (bottom-right, standing on ground) ── */}
      <div style={{
        position: "absolute", bottom: "20%", right: "5%",
        zIndex: 10, pointerEvents: "none",
        filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
      }}>
        <BeniCharacter
          state={mascotState}
          size={110}
          flipX
        />
      </div>

    </div>
  );
}
