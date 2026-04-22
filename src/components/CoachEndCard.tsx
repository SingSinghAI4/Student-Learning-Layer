import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "../LoginScreen";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  onContinue: () => void;
}

const MESSAGES = [
  {
    tok: "Yu mekim gutpela wok tru!",
    en:  "You did an amazing job!",
  },
  {
    tok: "Mi amamas tumas long yu!",
    en:  "I'm so proud of you!",
  },
  {
    tok: "Yu save maths — kamap, kamap!",
    en:  "You know your maths — keep going!",
  },
];

export default function CoachEndCard({ profile, lang, onContinue }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [showButton, setShowButton] = useState(false);

  // Cycle through messages every 2.2 s
  useEffect(() => {
    if (msgIdx < MESSAGES.length - 1) {
      const t = setTimeout(() => setMsgIdx(i => i + 1), 2200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowButton(true), 1600);
      return () => clearTimeout(t);
    }
  }, [msgIdx]);

  const msg = MESSAGES[msgIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "linear-gradient(165deg, #0d0d0d 0%, #1a0000 30%, #8b0000 60%, #c8102e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* PNG diagonal flag split — black upper-left, red lower-right */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "linear-gradient(135deg, #000000 0%, #0d0000 42%, #8b0000 58%, #c8102e 100%)",
      }} />

      {/* PNG flag diagonal line */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
      </svg>

      {/* Southern Cross — top-left corner (black half of flag) */}
      {[
        { top: "6%",  left: "6%",  size: 28 },
        { top: "14%", left: "16%", size: 18 },
        { top: "22%", left: "8%",  size: 22 },
        { top: "10%", left: "26%", size: 14 },
        { top: "28%", left: "20%", size: 16 },
      ].map((s, i) => (
        <motion.div key={`sc-${i}`}
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 2 + i * 0.6, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: "absolute", top: s.top, left: s.left,
            fontSize: s.size, pointerEvents: "none", zIndex: 2,
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
          }}
        >✦</motion.div>
      ))}

      {/* Bird of Paradise — golden feathers floating (right/red half) */}
      {[
        { top: "8%",  right: "6%",  size: 36, delay: 0   },
        { top: "20%", right: "18%", size: 26, delay: 0.5 },
        { top: "55%", right: "4%",  size: 32, delay: 1   },
        { top: "68%", right: "22%", size: 22, delay: 0.3 },
        { top: "38%", right: "10%", size: 28, delay: 0.8 },
      ].map((f, i) => (
        <motion.div key={`bop-${i}`}
          animate={{ opacity: [0.4, 0.95, 0.4], y: [0, -10, 0], rotate: [-8, 8, -8] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: f.delay }}
          style={{
            position: "absolute", top: f.top, right: f.right,
            fontSize: f.size, pointerEvents: "none", zIndex: 2,
            filter: "drop-shadow(0 0 8px rgba(255,200,0,0.6))",
          }}
        >🪶</motion.div>
      ))}

      {/* Tropical flora — scattered */}
      {[
        { emoji: "🌺", top: "72%", left: "5%",  size: 28, delay: 0.2 },
        { emoji: "🌴", top: "62%", left: "12%", size: 34, delay: 0.7 },
        { emoji: "🌺", top: "80%", left: "85%", size: 24, delay: 0.4 },
        { emoji: "🌴", top: "65%", left: "80%", size: 30, delay: 1.1 },
        { emoji: "🦜", top: "30%", left: "4%",  size: 30, delay: 0.9 },
        { emoji: "🌿", top: "85%", left: "45%", size: 22, delay: 0.6 },
      ].map((f, i) => (
        <motion.div key={`flora-${i}`}
          animate={{ opacity: [0.5, 0.9, 0.5], y: [0, -6, 0] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: f.delay }}
          style={{
            position: "absolute", top: f.top, left: f.left,
            fontSize: f.size, pointerEvents: "none", zIndex: 2,
          }}
        >{f.emoji}</motion.div>
      ))}

      {/* PNG flag gold + black stripe at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 5,
        height: 12,
        background: "linear-gradient(90deg, #000 0%, #000 33%, #FFD700 33%, #FFD700 66%, #c8102e 66%, #c8102e 100%)",
      }} />

      {/* Name + congratulations header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}
        style={{
          position: "absolute",
          top: 32,
          textAlign: "center",
          width: "100%",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div style={{
          fontSize: 15, fontWeight: 800, letterSpacing: 3,
          color: "#FFD700", fontFamily: "'Nunito', sans-serif",
          textTransform: "uppercase", marginBottom: 6,
        }}>
          {lang === "tok" ? "Gutpela wok" : "Well done"}
        </div>
        <div style={{
          fontSize: 38, fontWeight: 900,
          color: "#fff", fontFamily: "'Baloo 2', cursive",
          textShadow: "0 0 32px rgba(255,255,255,0.6), 0 4px 16px rgba(0,0,0,0.4)",
          lineHeight: 1.1,
        }}>
          {profile.name}!
        </div>
      </motion.div>

      {/* Speech bubble — floats above the coach image */}
      <div style={{
        position: "absolute",
        top: "16%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(440px, 88vw)",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, scale: 0.82, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.4 }}
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "3.5px solid #FFD700",
              padding: "18px 24px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 5px rgba(255,215,0,0.2)",
              textAlign: "center",
              transformOrigin: "bottom center",
            }}
          >
            <p style={{
              margin: 0,
              fontSize: 22, fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              color: "#1a0a00",
              lineHeight: 1.35,
            }}>
              {lang === "tok" ? msg.tok : msg.en}
            </p>
            {lang === "tok" && (
              <p style={{
                margin: "6px 0 0",
                fontSize: 13, fontStyle: "italic",
                color: "#666", fontFamily: "'Nunito', sans-serif",
              }}>
                {msg.en}
              </p>
            )}
            {/* Tail pointing down to coach */}
            <div style={{
              position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "16px solid #FFD700",
            }} />
            <div style={{
              position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop: "13px solid #fff",
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coach image — centred, large */}
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: "spring", bounce: 0.3, duration: 0.8 }}
        style={{ position: "relative", zIndex: 5, marginTop: 24 }}
      >
        <motion.img
          src="/davidemoji.png"
          alt="Coach"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            height: "min(60vh, 520px)",
            width: "auto",
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 20px 48px rgba(0,0,0,0.5))",
          }}
        />
      </motion.div>

      {/* Continue button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            onClick={onContinue}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              position: "absolute",
              bottom: 36,
              left: 0,
              right: 0,
              margin: "0 auto",
              width: "fit-content",
              background: "linear-gradient(135deg, #FFD700, #c8102e)",
              border: "none",
              borderRadius: 50,
              padding: "16px 48px",
              fontSize: 20,
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 0 36px rgba(255,215,0,0.5), 0 8px 24px rgba(200,16,46,0.4)",
              letterSpacing: 0.5,
              zIndex: 20,
            }}
          >
            {lang === "tok" ? "Lukim skoa bilong yu ▶" : "See your results ▶"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dot progress indicators for messages */}
      <div style={{
        position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 20,
      }}>
        {MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === msgIdx ? 1.4 : 1, opacity: i === msgIdx ? 1 : 0.35 }}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FFD700",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
