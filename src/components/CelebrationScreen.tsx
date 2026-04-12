import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import confetti from "canvas-confetti";
import { StudentProfile } from "../LoginScreen";
import { PROVINCE_DATA, CULTURAL_REGIONS, AVATARS } from "../data";
import BeniCharacter from "./BeniCharacter";
import PNGRoadMap from "./PNGRoadMap";
import ProvinceGuardian from "./ProvinceGuardian";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  onDashboard: () => void;
  onSessionEnd: () => void;
}

const BILUM_ITEMS = ["🥭", "🦜", "🐚", "🌺", "⭐"];


function fireConfetti() {
  confetti({
    particleCount: 140, spread: 90, origin: { y: 0.5 },
    colors: ["#FFD93D", "#52B788", "#A8DADC", "#E63946", "#ffffff"],
  });
  setTimeout(() => confetti({ particleCount: 70, angle: 60,  spread: 60, origin: { x: 0, y: 0.55 } }), 200);
  setTimeout(() => confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.55 } }), 350);
}

export default function CelebrationScreen({ profile, lang, onDashboard, onSessionEnd }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showXPPop, setShowXPPop] = useState(false);

  useEffect(() => {
    fireConfetti();
    const t1 = setTimeout(fireConfetti, 1300);
    const t2 = setTimeout(() => setShowXPPop(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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

  const unlockedCount = Math.max(1, Math.floor((profile.lessonProgress || 20) / 20));
  const homeProvData  = PROVINCE_DATA.find(p => p.name === profile.province);
  const guardianRegion = homeProvData?.region ?? "papuan";
  const regionInfo     = CULTURAL_REGIONS[guardianRegion];
  const regionGlow     = regionInfo.glow.replace(/[\d.]+\)$/, "1)");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      display: "flex", flexDirection: "column",
      fontFamily: "'Baloo 2', cursive",
      overflow: "hidden",
      background: "linear-gradient(to bottom, #0a1628 0%, #0d2240 50%, #0a1628 100%)",
    }}>

      {/* ── Gold top accent bar ── */}
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 5, zIndex: 30,
          background: "linear-gradient(to right, #FFD93D, #ff8f00, #FFD93D)",
          boxShadow: "0 0 20px rgba(255,217,61,0.7)",
        }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* ── Floating particles ── */}
      {["⭐","🌺","🥭","🐚","🦜","✨","🏆"].map((em, i) => (
        <motion.div key={i}
          style={{
            position: "absolute", fontSize: 18 + (i % 3) * 4,
            left: `${8 + i * 13}%`, top: "-30px",
            pointerEvents: "none", zIndex: 2,
          }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360], opacity: [0, 0.9, 0] }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
        >{em}</motion.div>
      ))}

      {/* ════════ HEADER ════════ */}
      <div style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 20px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
      }}>

        {/* Avatar chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.08)", borderRadius: 20,
          padding: "4px 12px 4px 6px",
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #52B788, #2d6a4f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17,
          }}>
            {AVATARS[profile.avatarIdx]?.emoji ?? "🧒"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{profile.name}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: "'Nunito', sans-serif" }}>
              {profile.province} · Grade {profile.grade}
            </div>
          </div>
        </div>

        {/* XP Badge */}
        <AnimatePresence>
          {showXPPop && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
              style={{
                background: "linear-gradient(135deg, #FFD93D, #ff8f00)",
                borderRadius: 12, padding: "6px 16px",
                fontSize: 18, fontWeight: 900, color: "#1a0a00",
                boxShadow: "0 0 24px rgba(255,217,61,0.55)",
                flexShrink: 0,
              }}
            >
              +{profile.lessonProgress || 20} XP ⭐
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title — absolutely centred so it ignores left/right flex items */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 22, fontWeight: 900, color: "#FFD93D", lineHeight: 1.1 }}
          >
            {lang === "tok" ? "Gutpela Wok!" : "Great Work!"}
            <Star size={18} fill="#FFD93D" stroke="#FFD93D" style={{ verticalAlign: "middle", marginLeft: 6 }} />
          </motion.div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito', sans-serif" }}>
            {lang === "tok" ? "Yu pinisim leson bilong tude!" : "You completed today's lesson!"}
          </div>
        </div>

      </div>

      {/* ════════ MAIN CONTENT ════════ */}
      <div style={{
        flex: 1, display: "flex", gap: 0,
        position: "relative", overflow: "hidden",
        minHeight: 0,
      }}>

        {/* ── LEFT: Map takes most of the screen ── */}
        <div style={{
          flex: "1 1 60%", position: "relative",
          display: "flex", flexDirection: "column",
          alignItems: "stretch", justifyContent: "center",
          padding: "12px 8px 12px 16px",
          minWidth: 0,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            style={{ width: "100%", maxHeight: "100%", overflow: "hidden" }}
          >
            <PNGRoadMap
              homeProvince={profile.province}
              unlockedCount={visibleCount}
              lang={lang}
            />
          </motion.div>
        </div>

        {/* ── RIGHT: Stats panel ── */}
        <div style={{
          flex: "0 0 320px",
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          gap: 14,
          padding: "16px 20px 16px 8px",
          overflow: "hidden",
        }}>

          {/* Province Guardian */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(12px)",
              border: `1.5px solid ${regionInfo.glow.replace(/[\d.]+\)$/, "0.4)")}`,
              borderRadius: 20, padding: "12px 16px",
              boxShadow: `0 0 28px ${regionInfo.glow.replace(/[\d.]+\)$/, "0.2)")}`,
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ProvinceGuardian region={guardianRegion} state="excited" size={68} />
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: 1.5,
                color: regionGlow, textTransform: "uppercase", marginBottom: 4,
              }}>
                {profile.province} · {regionInfo.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>
                {lang === "tok"
                  ? `${regionInfo.tok} i praut long yu!`
                  : `${regionInfo.label} is proud of you!`}
              </div>
            </div>
          </motion.div>

          {/* Beni hero */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.7, delay: 0.3 }}
            style={{
              display: "flex", justifyContent: "center",
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
            }}
          >
            <BeniCharacter state="excited" size={140} />
          </motion.div>

          {/* Bilum items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 18, padding: "12px 16px",
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
              {lang === "tok" ? "BILUM BILONG YU I PULAP!" : "YOUR BILUM IS FILLING UP!"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {BILUM_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 12, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.09, type: "spring", bounce: 0.6 }}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    borderRadius: "50%",
                    width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <motion.button
              onClick={onDashboard}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", padding: "14px 0",
                background: "linear-gradient(135deg, #FFD93D, #ff8f00)",
                border: "none", borderRadius: 18,
                fontSize: 16, fontWeight: 900, color: "#1a0a00",
                cursor: "pointer", fontFamily: "'Baloo 2', cursive",
                boxShadow: "0 6px 24px rgba(255,217,61,0.4)",
              }}
            >
              View Class Dashboard →
            </motion.button>
            <motion.button
              onClick={onSessionEnd}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", padding: "13px 0",
                background: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(255,255,255,0.16)",
                borderRadius: 18,
                fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.72)",
                cursor: "pointer", fontFamily: "'Baloo 2', cursive",
              }}
            >
              {lang === "tok" ? "Pinis — Nekis Student ▶" : "Done — Next Student ▶"}
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
