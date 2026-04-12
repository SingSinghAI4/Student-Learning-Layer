/**
 * AssessmentScreen — full-screen quiz that replaces the lesson view
 * during activity mode. Rich dark-green classroom aesthetic with
 * Beni + confetti on correct, shake on wrong.
 */
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import BeniCharacter from "./BeniCharacter";
import { MathsActivity } from "../data";
import { StudentProfile } from "../LoginScreen";

type BeniState = "idle" | "excited" | "correct" | "sad" | "thinking" | "walk";

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
}

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
}: Props) {
  const beniState: BeniState = actSelected
    ? (actSelected === activity.correct ? "correct" : "sad")
    : "thinking";

  const didFireRef = useRef(false);
  useEffect(() => {
    if (actSelected && beniState === "correct" && !didFireRef.current) {
      didFireRef.current = true;
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 }, colors: ["#FFD93D","#52B788","#A8DADC","#E63946"] });
    }
    if (!actSelected) didFireRef.current = false;
  }, [actSelected, beniState]);

  const progressPct = totalActs > 1 ? (actIdx / (totalActs - 1)) * 100 : 0;

  return (
    <motion.div
      key={`assess-${actIdx}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0,
        background: "linear-gradient(160deg, #0a1f14 0%, #1B3A2A 45%, #0d2a1e 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        zIndex: 1100,
        overflow: "hidden",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ── Subtle background texture: floating dots ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.06 }}>
        {[...Array(28)].map((_, i) => (
          <circle
            key={i}
            cx={`${(i * 37 + 7) % 100}%`}
            cy={`${(i * 29 + 13) % 100}%`}
            r={3 + (i % 4)}
            fill="#52B788"
          />
        ))}
      </svg>

      {/* ── Top bar: progress + label ── */}
      <div style={{
        width: "100%", maxWidth: 640,
        padding: "18px 24px 0",
        display: "flex", flexDirection: "column", gap: 6,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, color: "#52B788", textTransform: "uppercase" }}>
            {lang === "tok" ? "Askim" : "Quiz"} {actIdx + 1} / {totalActs}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(168,218,220,0.6)", letterSpacing: 1 }}>
            {profile.name}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #52B788, #A8DADC)", borderRadius: 4 }}
          />
        </div>
      </div>

      {/* ── Beni + question card — grows to fill ── */}
      <div style={{
        flex: 1,
        width: "100%", maxWidth: 640,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px",
        gap: 0,
      }}>

        {/* Beni */}
        <motion.div
          animate={beniState === "correct" ? { y: [0, -28, 0] } : {}}
          transition={{ duration: 0.6, type: "spring", bounce: 0.7 }}
          style={{ marginBottom: 8 }}
        >
          <BeniCharacter state={beniState} size={110} />
        </motion.div>

        {/* Question card */}
        <motion.div
          key={`card-${actIdx}`}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.55 }}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(82,183,136,0.22)",
            borderRadius: 24,
            padding: "22px 24px 28px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.45)",
          }}
        >
          {/* Label */}
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2, color: "#52B788", textTransform: "uppercase", marginBottom: 6 }}>
            {activity.label}
          </div>

          {/* Question */}
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.35, marginBottom: 4 }}>
            {activity.q}
          </div>

          {/* Tok Pisin */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#A8DADC", fontStyle: "italic", marginBottom: 14 }}>
            {activity.tok}
          </div>

          {/* Visual (emoji row) */}
          {activity.visual && (
            <div style={{
              fontSize: 34, textAlign: "center", letterSpacing: 6,
              marginBottom: 18,
              background: "rgba(255,255,255,0.05)", borderRadius: 14,
              padding: "12px 0",
            }}>
              {activity.visual}
            </div>
          )}

          {/* Options grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${activity.options.length <= 2 ? 2 : 3}, 1fr)`,
            gap: 10,
          }}>
            {activity.options.map((opt, i) => {
              const isCorrect = actSelected === opt.val && actSelected === activity.correct;
              const isWrong   = actWrong === opt.val;
              return (
                <motion.button
                  key={opt.val}
                  initial={{ opacity: 0, y: 24 }}
                  animate={
                    isWrong
                      ? { x: [-7, 7, -6, 6, 0], opacity: 1, y: 0 }
                      : { opacity: 1, y: 0 }
                  }
                  transition={isWrong
                    ? { duration: 0.35 }
                    : { delay: 0.1 + i * 0.08, type: "spring", bounce: 0.5 }
                  }
                  whileHover={!actSelected ? { scale: 1.06, y: -4 } : {}}
                  whileTap={!actSelected ? { scale: 0.92 } : {}}
                  onClick={() => { if (!actSelected) onAnswer(opt.val); }}
                  disabled={!!actSelected}
                  style={{
                    background: isCorrect
                      ? "rgba(82,183,136,0.25)"
                      : isWrong
                      ? "rgba(230,57,70,0.18)"
                      : "rgba(255,255,255,0.07)",
                    border: `2.5px solid ${
                      isCorrect ? "#52B788"
                      : isWrong  ? "#E63946"
                      : "rgba(255,255,255,0.14)"
                    }`,
                    borderRadius: 18,
                    padding: "14px 10px 10px",
                    cursor: actSelected ? "default" : "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 4,
                    boxShadow: isCorrect ? "0 0 28px rgba(82,183,136,0.5)" : "none",
                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Correct shimmer overlay */}
                  {isCorrect && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.35, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        position: "absolute", inset: 0,
                        background: "radial-gradient(circle at 50% 40%, rgba(82,183,136,0.45), transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <span style={{
                    fontSize: 28, fontWeight: 900, color: "#fff",
                    fontFamily: "'Baloo 2', cursive",
                  }}>{opt.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: "rgba(168,218,220,0.55)",
                    letterSpacing: 0.5, fontFamily: "'Nunito', sans-serif",
                  }}>{opt.tok}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback row */}
          <AnimatePresence>
            {actSelected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  marginTop: 18, textAlign: "center",
                  fontSize: 15, fontWeight: 900,
                  color: beniState === "correct" ? "#52B788" : "#E63946",
                }}
              >
                {beniState === "correct"
                  ? (lang === "tok" ? "Gutpela tru! 🎉" : "Correct! Well done! 🎉")
                  : (lang === "tok" ? "Traim gen! 💪" : "Try again! 💪")}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Next button ── */}
      <div style={{ width: "100%", maxWidth: 640, padding: "0 24px 28px", flexShrink: 0 }}>
        <AnimatePresence>
          {actSelected && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #52B788, #2d9a68)",
                border: "none", borderRadius: 22,
                fontSize: 18, fontWeight: 900, color: "#fff",
                cursor: "pointer",
                fontFamily: "'Baloo 2', cursive",
                boxShadow: "0 6px 32px rgba(82,183,136,0.45)",
                letterSpacing: 0.5,
              }}
            >
              {lang === "tok" ? "Nekis ▶" : "Next ▶"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
