/**
 * AssessmentScreen — full-screen quiz matching the cf77c37 session-screen style.
 * Dark jungle-green background, floating maths particles, white activity card,
 * large white answer buttons with jungle-green correct / red wrong states.
 */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { MathsActivity, AVATARS } from "../data";
import { StudentProfile } from "../LoginScreen";
import TeachMoment from "./TeachMoment";

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
}: Props) {
  const isCorrectAnswer = actSelected === activity.correct;

  // Mascot animation state
  const [mascotState, setMascotState] = useState<"idle" | "correct" | "wrong">("idle");
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
      setMascotState("wrong");
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
      background: `
        radial-gradient(ellipse 65% 55% at 12% 8%, rgba(40,110,18,0.65) 0%, transparent 58%),
        radial-gradient(ellipse 50% 45% at 90% 88%, rgba(210,90,10,0.38) 0%, transparent 52%),
        radial-gradient(ellipse 38% 55% at 78% 18%, rgba(22,80,10,0.42) 0%, transparent 48%),
        radial-gradient(ellipse 55% 38% at 28% 82%, rgba(8,52,4,0.5) 0%, transparent 48%),
        #0A1A07
      `,
      display: "flex", flexDirection: "column",
      fontFamily: "'Nunito', sans-serif",
      overflow: "hidden",
    }}>

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

      {/* ── Top bar ── */}
      <div className="session-topbar">
        <div className="session-avatar-wrap">
          <div className="s-avatar">
            {AVATARS[profile.avatarIdx]?.emoji ?? "🧒"}
          </div>
          <div>
            <div className="s-name">{profile.name}</div>
            <div className="s-level">⭐ Maths · Quiz {actIdx + 1} of {totalActs}</div>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-label">
            {lang === "tok" ? "Askim" : "Quiz Progress"} — {Math.round(progressPct)}% {lang === "tok" ? "Pinis" : "Complete"}
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ width: 0 }}
            />
          </div>
        </div>
        <div className="offline-pill">
          <span>●</span> Offline — Works Anywhere
        </div>
      </div>

      {/* ── Role banner ── */}
      <div className="role-banner">
        <div className="role-pill role-ai">
          <span className="role-icon">🤖</span>
          <div className="role-text">
            <span className="role-label">AI Tutor</span>
            <span className="role-desc">Curriculum · Pacing · Assessment</span>
          </div>
        </div>
        <div className="role-divider">+</div>
        <div className="role-pill role-human">
          <span className="role-icon">👩‍🏫</span>
          <div className="role-text">
            <span className="role-label">Lab Supervisor</span>
            <span className="role-desc">Coaching · Wellbeing · Order</span>
          </div>
        </div>
        <div className="role-tagline">Every child. Every session. No exceptions.</div>
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

      {/* ── Mascot ── */}
      <div className="mascot-wrap">
        <motion.div
          className="mascot-char"
          animate={
            mascotState === "correct"
              ? { y: [0, -60, -20, 0], scale: [1, 1.45, 1.2, 1], rotate: [0, 18, -14, 0] }
              : mascotState === "wrong"
              ? { x: [0, -14, 14, -10, 10, -6, 6, 0] }
              : { y: [0, -11, 0] }
          }
          transition={
            mascotState === "idle"
              ? { repeat: Infinity, duration: 2.9, ease: "easeInOut" }
              : { duration: 0.7, type: "spring", bounce: 0.38 }
          }
        >
          🦜
        </motion.div>
      </div>

    </div>
  );
}
