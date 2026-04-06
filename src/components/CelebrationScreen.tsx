import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { StudentProfile } from "../LoginScreen";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  onDashboard: () => void;
  onSessionEnd: () => void;
}

const BILUM_ITEMS = ["🥭", "🦜", "🐚", "🌺", "⭐"];

function fireConfetti() {
  // Centre burst
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
    colors: ["#FFD93D", "#52B788", "#A8DADC", "#E63946", "#ffffff"],
  });
  // Left cannon
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
  }, 200);
  // Right cannon
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
  }, 350);
}

export default function CelebrationScreen({ profile, lang, onDashboard, onSessionEnd }: Props) {
  useEffect(() => {
    fireConfetti();
    // Second burst after a beat
    const t = setTimeout(fireConfetti, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen celebration-screen">
      <div className="cel-content">

        <motion.div
          className="cel-emoji"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 0.7 }}
        >
          🎉
        </motion.div>

        <motion.div
          className="cel-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          Gutpela Wok, {profile.name}! 🌟
        </motion.div>

        <motion.div
          className="cel-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          You completed today's lesson. Your tutor is proud of you. See you tomorrow!
        </motion.div>

        {/* Bilum items */}
        <div className="bilum-row">
          {BILUM_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className="bilum-item"
              initial={{ scale: 0, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", bounce: 0.55 }}
            >
              {item}
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Bilum bilong yu i pulap! (Your bilum is filling up!)
        </motion.div>

        <motion.button
          className="cel-btn"
          onClick={onDashboard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          View Class Dashboard →
        </motion.button>

        <motion.button
          onClick={onSessionEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          whileHover={{ color: "rgba(255,255,255,0.85)" }}
          style={{
            marginTop: 8,
            background: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 50,
            padding: "10px 28px",
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {lang === "tok" ? "Pinis — Nekis Student ▶" : "Done — Next Student ▶"}
        </motion.button>

      </div>
    </div>
  );
}
