import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { StudentProfile } from "../LoginScreen";
import { PROVINCE_DATA, CULTURAL_REGIONS } from "../data";
import DavidCharacter from "./DavidCharacter";
import BeniCharacter from "./BeniCharacter";
import PNGJourneyMap from "./PNGJourneyMap";
import ProvinceGuardian from "./ProvinceGuardian";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  onDashboard: () => void;
  onSessionEnd: () => void;
}

const BILUM_ITEMS = ["🥭", "🦜", "🐚", "🌺", "⭐"];

const DAVID_MESSAGES = [
  { tok: "Gutpela wok tru! Yu save!", en: "Excellent work! You know this!" },
  { tok: "Bikpela man bilong lainim!", en: "A great learner!" },
  { tok: "PNG i praut long yu!", en: "PNG is proud of you!" },
  { tok: "Yu strong tru — kirapim!", en: "You're strong — keep going!" },
];

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

// ── Floating sparkle micro-particle ──
function MicroStar({ delay, x, color }: { delay: number; x: string; color: string }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: "10%",
        fontSize: 8, color, pointerEvents: "none", userSelect: "none",
      }}
      animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5], scale: [0.8, 1.3, 0.8] }}
      transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeInOut" }}
    >✦</motion.div>
  );
}

// ── Beacon rings (concentric pulses) for home province ──
function BeaconRings() {
  return (
    <>
      {[0, 0.35, 0.7].map((delay, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            inset: -(i + 1) * 5,
            borderRadius: 14 + (i + 1) * 4,
            border: `1.5px solid #FFD93D`,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.28 + i * 0.1, 1], opacity: [0.7 - i * 0.15, 0, 0.7 - i * 0.15] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

export default function CelebrationScreen({ profile, lang, onDashboard, onSessionEnd }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    fireConfetti();
    const t = setTimeout(fireConfetti, 1200);
    return () => clearTimeout(t);
  }, []);

  const unlockedCount = Math.max(1, Math.floor((profile.lessonProgress || 20) / 20));
  const davidMsg = DAVID_MESSAGES[(profile.lessonProgress || 0) % DAVID_MESSAGES.length];

  // Find cultural region of home province
  const homeProvData = PROVINCE_DATA.find(p => p.name === profile.province);
  const guardianRegion = homeProvData?.region ?? "papuan";
  const regionInfo = CULTURAL_REGIONS[guardianRegion];

  // Sequentially "illuminate" provinces for visual drama
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= unlockedCount) clearInterval(iv);
    }, 110);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <PartyPopper size={64} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          className="cel-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          Gutpela Wok, {profile.name}! <Star size={20} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle",marginLeft:4}} />
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

        {/* ── Cultural Province Guardian ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.85, type: "spring", bounce: 0.5 }}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            background: `linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))`,
            border: `1.5px solid ${regionInfo.glow.replace("0.5)", "0.35)").replace("0.55)", "0.35)")}`,
            borderRadius: 20, padding: "14px 18px",
            boxShadow: `0 0 30px ${regionInfo.glow.replace("0.5)", "0.2)").replace("0.55)", "0.2)")}`,
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ProvinceGuardian region={guardianRegion} state="excited" size={80} />
          </motion.div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 10, fontWeight: 900, letterSpacing: 2,
              color: regionInfo.glow.replace("0.5)", "1)").replace("0.55)", "1)"),
              textTransform: "uppercase", marginBottom: 4,
            }}>
              {profile.province} · {regionInfo.label} {lang === "tok" ? "Gaden" : "Region"}
            </div>
            <motion.div
              style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.5 }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              {lang === "tok"
                ? `Gaden bilong ${regionInfo.tok} i praut long yu!`
                : `${regionInfo.label} is proud of you!`}
            </motion.div>
            <motion.div
              style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3, fontStyle: "italic" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {homeProvData?.food && `${homeProvData.food} ${profile.province} · PNG`}
            </motion.div>
          </div>
        </motion.div>

        {/* ── PNG Journey Map ── */}
        <motion.div
          className="journey-section"
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.0, type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="journey-header">
            <div>
              <div className="journey-title">
                {lang === "tok" ? "YU TRAMP LONG PNG!" : "YOUR PNG JOURNEY"}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700, marginTop: 2, letterSpacing: 1 }}>
                Papua New Guinea · AI Learning Map
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: "spring", bounce: 0.6 }}
              style={{
                background: "rgba(82,183,136,0.15)",
                border: "1px solid rgba(82,183,136,0.3)",
                borderRadius: 20, padding: "4px 10px",
                fontSize: 11, fontWeight: 800, color: "#52B788",
              }}
            >
              {unlockedCount} / {PROVINCE_DATA.length}
            </motion.div>
          </div>

          {/* Real PNG Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{
              background: "rgba(6,28,50,0.5)",
              borderRadius: 14,
              border: "1px solid rgba(82,183,136,0.15)",
              padding: "10px 6px 4px",
              marginBottom: 10,
            }}
          >
            <PNGJourneyMap
              homeProvince={profile.province}
              unlockedCount={visibleCount}
              lang={lang}
            />
          </motion.div>

          {/* Journey progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", fontWeight: 700, letterSpacing: 1 }}>
                {lang === "tok" ? "TRAMP BILONG YU" : "JOURNEY PROGRESS"}
              </span>
              <span style={{ fontSize: 9, color: "#52B788", fontWeight: 800 }}>
                {Math.round((unlockedCount / PROVINCE_DATA.length) * 100)}%
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / PROVINCE_DATA.length) * 100}%` }}
                transition={{ delay: 1.4, duration: 0.9, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 10,
                  background: "linear-gradient(90deg, #52B788, #A8DADC, #FFD93D)",
                  boxShadow: "0 0 8px rgba(82,183,136,0.6)",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── David encouragement bubble ── */}
        <motion.div
          className="david-cel-bubble"
          initial={{ opacity: 0, x: -30, scale: 0.88 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.7, type: "spring", bounce: 0.55 }}
        >
          <motion.div
            style={{ flexShrink: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <DavidCharacter state="excited" size={58} />
          </motion.div>
          <div style={{ flex: 1 }}>
            <motion.div
              className="david-cel-speech"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.35 }}
            >{davidMsg.tok}</motion.div>
            <motion.div
              className="david-cel-speech-en"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.35 }}
            >{davidMsg.en}</motion.div>
          </div>
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
