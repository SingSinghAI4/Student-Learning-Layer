/**
 * CelebrationScreen — PNG-themed post-lesson celebration
 * Enhancements:
 *  • Province fun fact reveal
 *  • Kina shell money earned counter
 *  • Kundu drum streak display
 *  • PNG flag confetti (red, black, yellow)
 */
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

// ── Province fun facts ────────────────────────────────────────────────────
const PROVINCE_FACTS: Record<string, { tok: string; en: string }> = {
  "NCD":          { tok: "Port Moresby em kapital siti bilong PNG!", en: "Port Moresby is the capital city of PNG!" },
  "Gulf":         { tok: "Gulf i gat bikpela bus na naispela riva!", en: "Gulf has vast rainforests and beautiful rivers!" },
  "W. Highlands": { tok: "W. Highlands i save long bikpela Sing-sing!", en: "W. Highlands is famous for its grand Sing-sing festivals!" },
  "Chimbu":       { tok: "Chimbu i gat namba wan antap maunten long PNG!", en: "Chimbu has some of the highest mountains in PNG!" },
  "E. Highlands": { tok: "E. Highlands i save long naispela kopi bilong world!", en: "E. Highlands grows world-famous coffee!" },
  "Madang":       { tok: "Madang em naispela ples tru long Pasifik!", en: "Madang is called the prettiest place in the Pacific!" },
  "Manus":        { tok: "Manus i gat klia tumas wara bilong solwara!", en: "Manus has some of the clearest ocean waters in the world!" },
  "Morobe":       { tok: "Lae long Morobe em namba 2 bikpela taun bilong PNG!", en: "Lae in Morobe is PNG's second-largest city!" },
  "Oro":          { tok: "Bikpela Kokoda Trek i stap long Oro!", en: "The famous Kokoda Track runs through Oro Province!" },
  "Milne Bay":    { tok: "Milne Bay i gat moa long 160 ailan!", en: "Milne Bay has over 160 beautiful islands!" },
};

// ── Kundu drum SVG ────────────────────────────────────────────────────────
function KunduDrum({ size = 48, beat = false }: { size?: number; beat?: boolean }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 48 48"
      animate={beat ? { scaleY: [1, 0.88, 1.06, 1], scaleX: [1, 1.06, 0.96, 1] } : {}}
      transition={{ duration: 0.35, repeat: beat ? Infinity : 0, repeatDelay: 0.65 }}
      style={{ transformOrigin: "50% 100%" }}
    >
      {/* Drum body */}
      <ellipse cx={24} cy={40} rx={14} ry={5} fill="#5a2c0a" opacity={0.7} />
      <rect x={10} y={14} width={28} height={26} rx={6} fill="#8B4a1e" stroke="#1a0800" strokeWidth={2} />
      {/* Drum head */}
      <ellipse cx={24} cy={14} rx={14} ry={5} fill="#c8a46e" stroke="#1a0800" strokeWidth={2} />
      <ellipse cx={24} cy={14} rx={10} ry={3.5} fill="#e0c090" opacity={0.7} />
      {/* Lashing lines */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={10 + i * 9} y1={14} x2={10 + i * 9} y2={40}
          stroke="#5a2c0a" strokeWidth={1.5} opacity={0.6} />
      ))}
      {/* Decorative band */}
      <rect x={10} y={25} width={28} height={6} rx={2} fill="rgba(255,200,80,0.25)" stroke="rgba(255,180,50,0.4)" strokeWidth={1} />
    </motion.svg>
  );
}

// ── PNG flag confetti ─────────────────────────────────────────────────────
function firePNGConfetti() {
  confetti({
    particleCount: 140, spread: 90, origin: { y: 0.5 },
    colors: ["#FFD93D", "#c8102e", "#000000", "#ffffff"],
  });
  setTimeout(() => confetti({
    particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.55 },
    colors: ["#FFD93D", "#c8102e", "#000000"],
  }), 200);
  setTimeout(() => confetti({
    particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.55 },
    colors: ["#FFD93D", "#c8102e", "#000000"],
  }), 350);
}

// ── Kina coin SVG ─────────────────────────────────────────────────────────
function KinaCoin({ size = 36, delay = 0 }: { size?: number; delay?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 36 36"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", bounce: 0.6, delay }}
    >
      <circle cx={18} cy={18} r={17} fill="#FFD93D" stroke="#c49000" strokeWidth={2} />
      <circle cx={18} cy={18} r={13} fill="none" stroke="#c49000" strokeWidth={1} opacity={0.5} />
      {/* K symbol */}
      <text x={18} y={23} textAnchor="middle" fontSize={13} fontWeight={900}
        fill="#c49000" fontFamily="'Baloo 2', cursive">K</text>
      {/* Shine */}
      <ellipse cx={12} cy={11} rx={4} ry={2.5} fill="rgba(255,255,255,0.35)" transform="rotate(-30 12 11)" />
    </motion.svg>
  );
}

export default function CelebrationScreen({ profile, lang, onDashboard, onSessionEnd }: Props) {
  const [visibleCount,  setVisibleCount]  = useState(0);
  const [showXPPop,     setShowXPPop]     = useState(false);
  const [showFact,      setShowFact]      = useState(false);
  const [drumBeating,   setDrumBeating]   = useState(false);
  const [kinaCount,     setKinaCount]     = useState(0);

  const unlockedCount   = Math.max(1, Math.floor((profile.lessonProgress || 20) / 20));
  const kinaEarned      = Math.max(1, Math.floor((profile.lessonProgress || 20) / 10));
  const streakDays      = (profile as any).streak || 1;
  const homeProvData    = PROVINCE_DATA.find(p => p.name === profile.province);
  const guardianRegion  = homeProvData?.region ?? "papuan";
  const regionInfo      = CULTURAL_REGIONS[guardianRegion];
  const regionGlow      = regionInfo.glow.replace(/[\d.]+\)$/, "1)");
  const fact            = PROVINCE_FACTS[profile.province ?? "NCD"] ?? PROVINCE_FACTS["NCD"];

  useEffect(() => {
    firePNGConfetti();
    const t1 = setTimeout(firePNGConfetti, 1300);
    const t2 = setTimeout(() => setShowXPPop(true), 800);
    const t3 = setTimeout(() => setShowFact(true), 1600);
    const t4 = setTimeout(() => setDrumBeating(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Province unlock counter animation
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

  // Kina coin counter animation
  useEffect(() => {
    let k = 0;
    const iv = setInterval(() => {
      k++;
      setKinaCount(k);
      if (k >= kinaEarned) clearInterval(iv);
    }, 160);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      display: "flex", flexDirection: "column",
      fontFamily: "'Baloo 2', cursive",
      overflow: "hidden",
      backgroundImage: "url('/Lastimage.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Dark overlay so UI elements stay readable over the illustration */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 0, pointerEvents: "none" }} />

      {/* Gold accent bar */}
      <motion.div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5, zIndex: 30,
        background: "linear-gradient(to right, #FFD93D, #c8102e, #FFD93D)",
        boxShadow: "0 0 20px rgba(255,217,61,0.7)",
      }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Floating cultural particles */}
      {["⭐","🌺","🥭","🐚","🦜","✨","🏆","🪶","🥁"].map((em, i) => (
        <motion.div key={i} style={{
          position: "absolute", fontSize: 18 + (i % 3) * 4,
          left: `${6 + i * 11}%`, top: "-30px",
          pointerEvents: "none", zIndex: 2,
        }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360], opacity: [0, 0.9, 0] }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
        >{em}</motion.div>
      ))}

      {/* ════ HEADER ════ */}
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

        {/* Title — absolutely centred */}
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

      {/* ════ MAIN CONTENT ════ */}
      <div style={{
        flex: 1, display: "flex", gap: 0,
        position: "relative", overflow: "hidden", minHeight: 0,
      }}>


        {/* LEFT: Map */}
        <div style={{
          flex: "1 1 60%", position: "relative",
          display: "flex", flexDirection: "column",
          alignItems: "stretch", justifyContent: "center",
          padding: "12px 8px 12px 16px", minWidth: 0,
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

          {/* Province fun fact — overlaid at bottom of map */}
          <AnimatePresence>
            {showFact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                style={{
                  position: "absolute", bottom: 18, left: 20, right: 12,
                  background: "rgba(0,0,0,0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,217,61,0.3)",
                  borderRadius: 14, padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.2, color: "#FFD93D", marginBottom: 3 }}>
                    {lang === "tok" ? "YU SAVE?" : "DID YOU KNOW?"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    {lang === "tok" ? fact.tok : fact.en}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Stats panel */}
        <div style={{
          flex: "0 0 300px",
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          gap: 12,
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
              <ProvinceGuardian region={guardianRegion} state="excited" size={62} />
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


          {/* Kina shell money earned */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,217,61,0.25)",
              borderRadius: 18, padding: "12px 16px",
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              {lang === "tok" ? "KINA YU KISIM TUDE!" : "KINA EARNED TODAY!"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: kinaEarned }).map((_, i) => (
                <KinaCoin key={i} size={34} delay={0.8 + i * 0.12} />
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + kinaEarned * 0.12 }}
                style={{ fontSize: 16, fontWeight: 900, color: "#FFD93D", marginLeft: 4 }}
              >
                = K{kinaCount}
              </motion.div>
            </div>
          </motion.div>

          {/* Kundu drum streak */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,140,0,0.25)",
              borderRadius: 18, padding: "10px 16px",
            }}
          >
            <KunduDrum size={46} beat={drumBeating} />
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>
                {lang === "tok" ? "STRIK BILONG YU" : "YOUR STREAK"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <motion.span
                  key={streakDays}
                  initial={{ scale: 1.6, color: "#FFD93D" }}
                  animate={{ scale: 1,   color: "#ff8f00" }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}
                >
                  {streakDays}
                </motion.span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>
                  {lang === "tok" ? "de" : streakDays === 1 ? "day" : "days"} 🔥
                </span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Nunito', sans-serif" }}>
                {streakDays >= 7
                  ? (lang === "tok" ? "Yu strongpela tumas!" : "Incredible streak!")
                  : streakDays >= 3
                  ? (lang === "tok" ? "Kirapim yet!" : "Keep it going!")
                  : (lang === "tok" ? "Stat bilong bikpela wok!" : "Great start!")}
              </div>
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

      {/* Kumi — big, bottom-right, above everything */}
      <motion.img
        src="/imagecopy.png"
        alt="Kumi"
        initial={{ x: 120, y: 80, opacity: 0, scale: 0.6 }}
        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.5 }}
        style={{
          position: "fixed",
          bottom: -30,
          right: "22%",
          width: "min(520px, 42vw)",
          height: "auto",
          zIndex: 100,
          pointerEvents: "none",
          filter: "drop-shadow(0 0 40px rgba(255,200,0,0.55)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}
