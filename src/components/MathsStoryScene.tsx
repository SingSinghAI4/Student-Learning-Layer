/**
 * MathsStoryScene — richly animated story scenes for Grade 2 Maths Ch.2
 * Replaces the flat emoji row in the story card with a proper illustrated,
 * animated scene stage. Each of the 10 slides gets its own layout.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, Sparkles as SparklesIcon, Target, PartyPopper, Plus } from "lucide-react";
import { MathsStoryPage } from "../data";
import BeniCharacter from "./BeniCharacter";

interface Props {
  slideIndex: number;
  slide: MathsStoryPage;
  interactionStep: number;
  addCombined: boolean;
  onTapCount: () => void;
  onTapAdd: () => void;
}

// ─── palette per slide group ───────────────────────────────────────────────────
const BKGS = [
  "linear-gradient(175deg,#0d1b4b 0%,#bf4f00 55%,#2d6a4f 100%)", // 0 dawn
  "linear-gradient(175deg,#1565c0 0%,#64b5f6 40%,#388e3c 100%)", // 1 village
  "linear-gradient(175deg,#29b6f6 0%,#66bb6a 65%,#2e7d32 100%)", // 2 walk
  "linear-gradient(175deg,#e65100 0%,#ffa726 45%,#558b2f 100%)", // 3 tap mangoes
  "linear-gradient(175deg,#f57f17 0%,#ffd54f 55%,#33691e 100%)", // 4 basket
  "linear-gradient(175deg,#4e342e 0%,#a5d6a7 50%,#1b5e20 100%)", // 5 tap coconuts
  "linear-gradient(175deg,#1a237e 0%,#5c6bc0 55%,#2e7d32 100%)", // 6 basket2
  "linear-gradient(175deg,#1a237e 0%,#283593 50%,#1565c0 100%)", // 7 tap-add
  "linear-gradient(175deg,#b71c1c 0%,#f57f17 40%,#1b5e20 100%)", // 8 celebration
  "linear-gradient(175deg,#4a148c 0%,#7b1fa2 50%,#ab47bc 100%)", // 9 your-turn
];

// ─── tiny sparkle particles ────────────────────────────────────────────────────
function Sparkles({ count = 6, colors = ["#FFD93D","#fff","#A8DADC","#52B788"] }: { count?: number; colors?: string[] }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          style={{
            position: "absolute",
            width: 6, height: 6, borderRadius: "50%",
            background: colors[i % colors.length],
            left: `${10 + (i * 16) % 82}%`,
            top: `${5 + (i * 23) % 80}%`,
            pointerEvents: "none",
          }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

// ─── spark burst on tap ────────────────────────────────────────────────────────
function SparkBurst({ active }: { active: boolean }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <AnimatePresence>
      {active && angles.map((a, i) => (
        <motion.div key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((a * Math.PI) / 180) * 55,
            y: Math.sin((a * Math.PI) / 180) * 55,
            opacity: 0, scale: 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: 10, height: 10, borderRadius: "50%",
            background: ["#FFD93D","#52B788","#A8DADC","#ff6b6b"][i % 4],
            marginLeft: -5, marginTop: -5,
            pointerEvents: "none", zIndex: 10,
          }}
        />
      ))}
    </AnimatePresence>
  );
}

// ─── floating character ────────────────────────────────────────────────────────
function Char({
  emoji, x, y, size, anim, delay = 0,
}: {
  emoji: string | React.ReactNode; x: string; y: string; size: number;
  anim: "float"|"sway"|"bounce"|"pulse"|"spin"|"static";
  delay?: number;
}) {
  const animProps: Record<string, any> = {
    float:  { y: [0, -14, 0], transition: { duration: 3, repeat: Infinity, delay, ease: "easeInOut" } },
    sway:   { rotate: [-8, 8, -8], transition: { duration: 2.5, repeat: Infinity, delay, ease: "easeInOut" } },
    bounce: { y: [0, -20, 0], scale: [1, 1.15, 1], transition: { duration: 0.9, repeat: Infinity, delay, ease: "easeOut" } },
    pulse:  { scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8], transition: { duration: 2, repeat: Infinity, delay } },
    spin:   { rotate: 360, transition: { duration: 8, repeat: Infinity, ease: "linear" } },
    static: {},
  };
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, ...animProps[anim] }}
      transition={{ duration: 0.5, delay, type: "spring", bounce: 0.5 }}
      style={{ position: "absolute", left: x, top: y, fontSize: size, lineHeight: 1, userSelect: "none" }}
    >
      {emoji}
    </motion.div>
  );
}

// ─── slide layouts for passive slides ─────────────────────────────────────────
function PassiveScene({ idx }: { idx: number }) {
  if (idx === 0) return ( // Dawn — Beni waking up
    <>
      <Char emoji="🌅" x="5%"  y="5%"  size={72} anim="pulse" delay={0} />
      <Char emoji={<Star size={22} fill="#FFD93D" stroke="#FFD93D" />} x="65%" y="4%"  size={22} anim="float" delay={0.3} />
      <Char emoji={<Star size={16} fill="#FFD93D" stroke="#FFD93D" />} x="80%" y="10%" size={16} anim="float" delay={0.7} />
      <Char emoji="🏡" x="50%" y="28%" size={68} anim="static" delay={0.2} />
      <Char emoji="🌿" x="74%" y="40%" size={50} anim="sway"   delay={0} />
      <Char emoji="🦜" x="76%" y="8%"  size={40} anim="float"  delay={0.5} />
      {/* Beni character waking up excited */}
      <motion.div style={{ position: "absolute", left: "4%", bottom: "5%", zIndex: 3 }}
        initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.4 }}>
        <BeniCharacter state="excited" size={68} />
      </motion.div>
      <Sparkles count={5} colors={["#ffb74d","#ffe082","#fff","#ff7043"]} />
    </>
  );
  if (idx === 1) return ( // Mama calls to go to market
    <>
      <Char emoji="🌴" x="4%"  y="4%"  size={80} anim="sway"  delay={0} />
      <Char emoji="🌴" x="76%" y="4%"  size={70} anim="sway"  delay={0.4} />
      <Char emoji="🏘️" x="55%" y="12%" size={58} anim="static" delay={0.5} />
      {/* Mama emoji + Beni SVG */}
      <motion.div style={{ position: "absolute", left: "20%", bottom: "8%" }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}>
        <span style={{ fontSize: 72 }}>👩</span>
      </motion.div>
      <motion.div style={{ position: "absolute", left: "48%", bottom: "6%", zIndex: 3 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}>
        <BeniCharacter state="excited" size={72} />
      </motion.div>
      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.9, type: "spring", bounce: 0.6 }}
        style={{
          position: "absolute", left: "10%", top: "8%",
          background: "#fff", borderRadius: 14, padding: "5px 12px",
          fontSize: 13, fontWeight: 700, color: "#333",
          boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
        }}
      >Maket tude! 🏪</motion.div>
      <Sparkles count={4} colors={["#ffeb3b","#fff","#81c784"]} />
    </>
  );
  if (idx === 2) return ( // Walking to market
    <>
      <Char emoji="🏪" x="64%" y="8%" size={66} anim="pulse" delay={0.6} />
      <Char emoji="🌿" x="4%"  y="18%" size={58} anim="sway"  delay={0} />
      <Char emoji="🌿" x="82%" y="28%" size={50} anim="sway"  delay={0.3} />
      {/* Road */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ position: "absolute", bottom: "12%", left: "5%", width: "90%", height: 7, background: "#a0522d", borderRadius: 3, transformOrigin: "left" }}
      />
      {/* Mama walking */}
      <motion.div style={{ position: "absolute", left: "14%", bottom: "14%" }}
        animate={{ x: [0, 6, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
        <span style={{ fontSize: 56 }}>👩</span>
      </motion.div>
      {/* Beni walking */}
      <motion.div style={{ position: "absolute", left: "36%", bottom: "12%", zIndex: 3 }}
        animate={{ x: [0, 6, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}>
        <BeniCharacter state="walk" size={62} />
      </motion.div>
      <Sparkles count={3} colors={["#fff","#b3e5fc","#c8e6c9"]} />
    </>
  );
  if (idx === 4) return ( // 2 mangoes in basket
    <>
      <Char emoji="🛒" x="30%" y="18%" size={82} anim="pulse"  delay={0} />
      <Char emoji="🥭" x="14%" y="8%"  size={68} anim="bounce" delay={0.3} />
      <Char emoji="🥭" x="58%" y="6%"  size={68} anim="bounce" delay={0.5} />
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 0.8, duration: 0.6, times: [0, 0.6, 1] }}
        style={{
          position: "absolute", right: "8%", top: "6%",
          background: "#FFD93D", color: "#000", borderRadius: "50%",
          width: 54, height: 54, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26, fontWeight: 900,
          boxShadow: "0 4px 16px rgba(255,217,61,0.6)",
        }}
      >2</motion.div>
      <motion.div style={{ position: "absolute", left: "4%", bottom: "4%", zIndex: 3 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}>
        <BeniCharacter state="excited" size={62} />
      </motion.div>
      <Sparkles count={6} colors={["#FFD93D","#fff","#ff8f00"]} />
    </>
  );
  if (idx === 6) return ( // 3 coconuts
    <>
      <Char emoji="🛒" x="32%" y="16%" size={82} anim="pulse"  delay={0} />
      <Char emoji="🥥" x="6%"  y="6%"  size={62} anim="bounce" delay={0.2} />
      <Char emoji="🥥" x="52%" y="4%"  size={62} anim="bounce" delay={0.4} />
      <Char emoji="🥥" x="76%" y="8%"  size={62} anim="bounce" delay={0.6} />
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 1, duration: 0.6, times: [0, 0.6, 1] }}
        style={{
          position: "absolute", left: "6%", bottom: "8%",
          background: "#52B788", color: "#fff", borderRadius: "50%",
          width: 54, height: 54, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26, fontWeight: 900,
          boxShadow: "0 4px 16px rgba(82,183,136,0.6)",
        }}
      >3</motion.div>
      <motion.div style={{ position: "absolute", right: "4%", bottom: "4%", zIndex: 3 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}>
        <BeniCharacter state="thinking" size={62} flipX />
      </motion.div>
      <Sparkles count={5} colors={["#a5d6a7","#fff","#FFD93D"]} />
    </>
  );
  if (idx === 8) return ( // 5 altogether — celebration with Beni
    <>
      {["🥭","🥭","🥥","🥥","🥥"].map((e, i) => (
        <Char key={i} emoji={e}
          x={`${8 + i * 17}%`} y={`${8 + (i % 2) * 22}%`}
          size={58} anim="bounce" delay={i * 0.12}
        />
      ))}
      {/* Checkmark */}
      <motion.div style={{ position: "absolute", right: "4%", top: "4%", width: 52, height: 52 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring", bounce: 0.7 }}>
        <svg viewBox="0 0 52 52" width={52} height={52}>
          <circle cx={26} cy={26} r={24} fill="#52B788"/>
          <polyline points="14,26 22,34 38,18" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{
          position: "absolute", left: "50%", bottom: "4%", transform: "translateX(-50%)",
          background: "#FFD93D", color: "#000", borderRadius: 24,
          padding: "5px 18px", fontSize: 24, fontWeight: 900,
          boxShadow: "0 4px 20px rgba(255,217,61,0.7)",
        }}
      >5 <Star size={20} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle"}} /></motion.div>
      {/* Beni celebrating */}
      <motion.div style={{ position: "absolute", left: "4%", bottom: "4%", zIndex: 3 }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}>
        <BeniCharacter state="correct" size={60} />
      </motion.div>
      <Sparkles count={8} colors={["#FFD93D","#fff","#52B788","#ff7043","#A8DADC"]} />
    </>
  );
  if (idx === 9) return ( // your turn — Lottie trophy + Beni pointing
    <>
      {/* Trophy */}
      <motion.div style={{ position: "absolute", left: "50%", top: "4%", transform: "translateX(-50%)", width: 90, height: 90 }}
        initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1], rotate: [-8, 8, 0] }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}>
        <svg viewBox="0 0 90 90" width={90} height={90}>
          <rect x={35} y={68} width={20} height={8} rx={3} fill="#F39C12"/>
          <rect x={28} y={75} width={34} height={7} rx={3} fill="#F39C12"/>
          <path d="M20,18 Q18,38 30,46 Q38,52 45,52 Q52,52 60,46 Q72,38 70,18 Z" fill="#FFD93D"/>
          <path d="M20,18 Q10,18 10,30 Q10,42 24,44" stroke="#F39C12" strokeWidth={4} fill="none" strokeLinecap="round"/>
          <path d="M70,18 Q80,18 80,30 Q80,42 66,44" stroke="#F39C12" strokeWidth={4} fill="none" strokeLinecap="round"/>
          <polyline points="33,34 40,41 57,26" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </motion.div>
      <Char emoji={<SparklesIcon size={38} />} x="6%"  y="8%"  size={38} anim="spin"  delay={0.2} />
      <Char emoji={<SparklesIcon size={38} />} x="78%" y="6%"  size={38} anim="spin"  delay={0.5} />
      <Char emoji={<Star size={30} fill="#FFD93D" stroke="#FFD93D" />} x="16%" y="52%" size={30} anim="float" delay={0.3} />
      <Char emoji={<Star size={30} fill="#FFD93D" stroke="#FFD93D" />} x="66%" y="54%" size={30} anim="float" delay={0.6} />
      {/* Beni pointing toward activities */}
      <motion.div style={{ position: "absolute", left: "2%", bottom: "4%", zIndex: 3 }}
        initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}>
        <BeniCharacter state="excited" size={66} />
      </motion.div>
      <motion.div
        initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
        style={{
          position: "absolute", bottom: "4%", right: "4%",
          color: "#FFD93D", fontSize: 15, fontWeight: 900,
          textShadow: "0 2px 12px rgba(0,0,0,0.7)", textAlign: "right",
          letterSpacing: 0.5, lineHeight: 1.4,
        }}
      >YU TEM!{"\n"}YOUR TURN! <Target size={16} style={{verticalAlign:"middle",marginLeft:3}} /></motion.div>
      <Sparkles count={7} colors={["#FFD93D","#fff","#ce93d8","#80deea"]} />
    </>
  );
  return <Sparkles count={4} />;
}

// ─── tap-count scene ───────────────────────────────────────────────────────────
function TapCountScene({
  slide, interactionStep, onTapCount,
}: { slide: MathsStoryPage; interactionStep: number; onTapCount: () => void }) {
  const count = slide.tapCount ?? 0;
  const emoji = slide.tapEmoji ?? "🥭";
  const done = interactionStep >= count;
  const [burstIdx, setBurstIdx] = useState<number | null>(null);

  function handleTap() {
    if (done) return;
    setBurstIdx(interactionStep);
    setTimeout(() => setBurstIdx(null), 600);
    onTapCount();
  }

  const isCoconut = emoji === "🥥";
  const color = isCoconut ? "#52B788" : "#FFD93D";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around" }}>
      {/* Slots row */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {i < interactionStep ? (
              <motion.div
                key={`filled-${i}`}
                initial={{ scale: 0, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.7 }}
                className="tap-slot-filled"
              >
                {emoji}
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="tap-slot-empty"
                style={{
                  borderRadius: 14,
                  border: `3px dashed ${color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0.4,
                }}
              >
                ?
              </motion.div>
            )}
            {/* Number badge */}
            {i < interactionStep && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.8 }}
                style={{
                  background: color, color: "#000", borderRadius: "50%",
                  width: 22, height: 22, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13, fontWeight: 700,
                  marginTop: 4,
                }}
              >{i + 1}</motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Big tap target */}
      {!done ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Pulsing glow ring */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              position: "absolute", inset: -16,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}55, transparent)`,
              pointerEvents: "none",
            }}
          />
          <motion.button
            whileTap={{ scale: 0.82 }}
            animate={{ scale: [1, 1.08, 1], y: [0, -6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            onClick={handleTap}
            className="tap-emoji-main"
            style={{
              lineHeight: 1, background: "none", border: "none",
              cursor: "pointer", display: "block", userSelect: "none",
              filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.4))",
            }}
          >
            {emoji}
          </motion.button>
          <SparkBurst active={burstIdx !== null} />
          {/* "Tap!" hint */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ textAlign: "center", color, fontSize: 13, fontWeight: 700, marginTop: 4 }}
          >
            👆 Pres! Tap!
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.5, times: [0, 0.7, 1] }}
          style={{ fontSize: 28, fontWeight: 900, color }}
        >
          {count} ✓ Gutpela! <PartyPopper size={22} style={{verticalAlign:"middle",marginLeft:4}} />
        </motion.div>
      )}

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i}
            animate={{ background: i < interactionStep ? color : "#ffffff22" }}
            transition={{ duration: 0.3 }}
            style={{ width: 10, height: 10, borderRadius: "50%" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── tap-add scene ─────────────────────────────────────────────────────────────
function TapAddScene({
  slide, addCombined, onTapAdd,
}: { slide: MathsStoryPage; addCombined: boolean; onTapAdd: () => void }) {
  const countA = slide.tapCountA ?? 0;
  const countB = slide.tapCountB ?? 0;
  const emojiA = slide.tapGroupA ?? "🥭";
  const emojiB = slide.tapGroupB ?? "🥥";
  const total  = countA + countB;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around" }}>
      {!addCombined ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%" }}>
          {/* Group A */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 110 }}>
            {Array.from({ length: countA }).map((_, i) => (
              <motion.div key={i}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: "spring", bounce: 0.7 }}
                className="tap-add-emoji"
              >{emojiA}</motion.div>
            ))}
            <div style={{ width: "100%", textAlign: "center", color: "#FFD93D", fontWeight: 700, fontSize: 13 }}>{countA}</div>
          </div>

          {/* Plus button */}
          <div style={{ position: "relative" }}>
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{
                position: "absolute", inset: -14, borderRadius: "50%",
                background: "radial-gradient(circle, #52B78844, transparent)",
                pointerEvents: "none",
              }}
            />
            <motion.button
              whileTap={{ scale: 0.8, rotate: 180 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              onClick={onTapAdd}
              className="tap-add-plus"
              style={{
                background: "linear-gradient(135deg,#52B788,#2d6a4f)",
                border: "3px solid #a8dadc",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(82,183,136,0.55)",
              }}
            >
              <Plus size={28} strokeWidth={3} />
            </motion.button>
          </div>

          {/* Group B */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 110 }}>
            {Array.from({ length: countB }).map((_, i) => (
              <motion.div key={i}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: "spring", bounce: 0.7 }}
                className="tap-add-emoji"
              >{emojiB}</motion.div>
            ))}
            <div style={{ width: "100%", textAlign: "center", color: "#A8DADC", fontWeight: 700, fontSize: 13 }}>{countB}</div>
          </div>
        </div>
      ) : (
        // Combined
        <div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {[...Array(countA).fill(emojiA), ...Array(countB).fill(emojiB)].map((e, i) => (
              <motion.div key={i}
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: i * 0.22, type: "spring", bounce: 0.65 }}
                style={{ textAlign: "center" }}
              >
                <div className="tap-add-emoji">{e}</div>
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.22 + 0.18 }}
                  style={{
                    background: i < countA ? "#FFD93D" : "#A8DADC",
                    color: "#000", borderRadius: "50%", width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "3px auto 0", fontSize: 11, fontWeight: 700,
                  }}
                >{i + 1}</motion.div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ delay: total * 0.22 + 0.3, duration: 0.5, times: [0, 0.7, 1] }}
            style={{ color: "#FFD93D", fontSize: 26, fontWeight: 900, textAlign: "center" }}
          >
            {total} olgeta! <Star size={22} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle",marginLeft:3}} />
          </motion.div>
        </div>
      )}

      {!addCombined && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ color: "#A8DADC", fontSize: 13 }}
        >
          👆 Pres PLUS bilong putim wantaim!
        </motion.div>
      )}
    </div>
  );
}

// ─── main export ───────────────────────────────────────────────────────────────
export default function MathsStoryScene({ slideIndex, slide, interactionStep, addCombined, onTapCount, onTapAdd }: Props) {
  const isTapCount = slide.interactive === "tap-count";
  const isTapAdd   = slide.interactive === "tap-add";
  const bg = BKGS[slideIndex] ?? BKGS[0];

  return (
    <motion.div
      key={`scene-${slideIndex}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      style={{
        width: "100%",
        height: "clamp(150px, 26vw, 220px)",
        background: bg,
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Ground strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "22%",
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(1px)",
      }} />

      {/* Scene content */}
      <div style={{ position: "absolute", inset: 0, padding: "10px 16px" }}>
        {isTapCount ? (
          <TapCountScene slide={slide} interactionStep={interactionStep} onTapCount={onTapCount} />
        ) : isTapAdd ? (
          <TapAddScene slide={slide} addCombined={addCombined} onTapAdd={onTapAdd} />
        ) : (
          <PassiveScene idx={slideIndex} />
        )}
      </div>

      {/* Slide number indicator */}
      <div style={{
        position: "absolute", top: 8, right: 12,
        background: "rgba(0,0,0,0.3)", borderRadius: 20,
        padding: "3px 10px", fontSize: 11, color: "rgba(255,255,255,0.7)",
      }}>
        {slideIndex + 1} / 10
      </div>
    </motion.div>
  );
}
