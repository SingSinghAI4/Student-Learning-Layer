/**
 * MathsStoryScene — richly animated story scenes for Grade 2 Maths Ch.2
 * Replaces the flat emoji row in the story card with a proper illustrated,
 * animated scene stage. Each of the 10 slides gets its own layout.
 */
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import { MathsStoryPage } from "../data";

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
  emoji: string; x: string; y: string; size: number;
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
  if (idx === 0) return (
    <>
      {/* Dawn sky */}
      <Char emoji="🌅" x="8%"  y="8%"  size={70} anim="pulse" delay={0} />
      <Char emoji="⭐" x="62%" y="6%"  size={26} anim="float" delay={0.3} />
      <Char emoji="⭐" x="78%" y="12%" size={20} anim="float" delay={0.7} />
      <Char emoji="🏡" x="36%" y="30%" size={72} anim="static" delay={0.2} />
      <Char emoji="🌿" x="68%" y="42%" size={52} anim="sway"   delay={0} />
      <Char emoji="🦜" x="55%" y="10%" size={54} anim="float" delay={0.5} />
      <Sparkles count={5} colors={["#ffb74d","#ffe082","#fff","#ff7043"]} />
    </>
  );
  if (idx === 1) return (
    <>
      <Char emoji="🌴" x="5%"  y="5%"  size={80} anim="sway"   delay={0} />
      <Char emoji="🌴" x="75%" y="5%"  size={70} anim="sway"   delay={0.4} />
      <Char emoji="👩" x="22%" y="30%" size={78} anim="bounce" delay={0.1} />
      <Char emoji="🧒" x="48%" y="35%" size={70} anim="bounce" delay={0.3} />
      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
        style={{
          position: "absolute", left: "18%", top: "5%",
          background: "#fff", borderRadius: 14, padding: "5px 12px",
          fontSize: 13, fontWeight: 700, color: "#333",
          boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
        }}
      >
        Maket tude! 🏪
      </motion.div>
      <Char emoji="🏘️" x="55%" y="15%" size={60} anim="static" delay={0.5} />
      <Sparkles count={4} colors={["#ffeb3b","#fff","#81c784"]} />
    </>
  );
  if (idx === 2) return (
    <>
      <Char emoji="🏪" x="62%" y="10%" size={65} anim="pulse" delay={0.6} />
      <Char emoji="🌿" x="5%"  y="20%" size={58} anim="sway"  delay={0} />
      <Char emoji="🌿" x="80%" y="30%" size={50} anim="sway"  delay={0.3} />
      {/* Walking path */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: "90%", height: 6, background: "#a0522d",
          borderRadius: 3, transformOrigin: "left",
        }}
      />
      <Char emoji="🚶‍♀️" x="18%" y="38%" size={60} anim="bounce" delay={0} />
      <Char emoji="🧒"  x="36%" y="40%" size={56} anim="bounce" delay={0.2} />
      <Sparkles count={3} colors={["#fff","#b3e5fc","#c8e6c9"]} />
    </>
  );
  if (idx === 4) return ( // 2 mangoes in basket
    <>
      <Char emoji="🛒" x="30%" y="20%" size={80} anim="pulse"  delay={0} />
      <Char emoji="🥭" x="16%" y="10%" size={65} anim="bounce" delay={0.3} />
      <Char emoji="🥭" x="58%" y="8%"  size={65} anim="bounce" delay={0.5} />
      {/* "2!" badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 0.8, duration: 0.6, times: [0, 0.6, 1] }}
        style={{
          position: "absolute", right: "10%", top: "8%",
          background: "#FFD93D", color: "#000", borderRadius: "50%",
          width: 52, height: 52, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24, fontWeight: 900,
          boxShadow: "0 4px 16px rgba(255,217,61,0.6)",
        }}
      >2</motion.div>
      <Sparkles count={6} colors={["#FFD93D","#fff","#ff8f00"]} />
    </>
  );
  if (idx === 6) return ( // 3 coconuts
    <>
      <Char emoji="🛒" x="32%" y="18%" size={80} anim="pulse"  delay={0} />
      <Char emoji="🥥" x="8%"  y="8%"  size={60} anim="bounce" delay={0.2} />
      <Char emoji="🥥" x="52%" y="5%"  size={60} anim="bounce" delay={0.4} />
      <Char emoji="🥥" x="76%" y="10%" size={60} anim="bounce" delay={0.6} />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ delay: 1, duration: 0.6, times: [0, 0.6, 1] }}
        style={{
          position: "absolute", left: "8%", bottom: "10%",
          background: "#52B788", color: "#fff", borderRadius: "50%",
          width: 52, height: 52, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24, fontWeight: 900,
          boxShadow: "0 4px 16px rgba(82,183,136,0.6)",
        }}
      >3</motion.div>
      <Sparkles count={5} colors={["#a5d6a7","#fff","#FFD93D"]} />
    </>
  );
  if (idx === 8) return ( // 5 altogether — big celebration
    <>
      {["🥭","🥭","🥥","🥥","🥥"].map((e, i) => (
        <Char key={i} emoji={e}
          x={`${10 + i * 18}%`} y={`${20 + (i % 2) * 20}%`}
          size={60} anim="bounce" delay={i * 0.15}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 1], opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        style={{
          position: "absolute", left: "50%", bottom: "8%", transform: "translateX(-50%)",
          background: "#FFD93D", color: "#000", borderRadius: 24,
          padding: "6px 22px", fontSize: 26, fontWeight: 900,
          boxShadow: "0 4px 20px rgba(255,217,61,0.7)",
        }}
      >5 ⭐</motion.div>
      <Sparkles count={8} colors={["#FFD93D","#fff","#52B788","#ff7043","#A8DADC"]} />
    </>
  );
  if (idx === 9) return ( // your turn
    <>
      <Char emoji="🏆" x="35%" y="8%"  size={90} anim="bounce" delay={0} />
      <Char emoji="✨" x="8%"  y="10%" size={44} anim="spin"   delay={0.2} />
      <Char emoji="✨" x="76%" y="8%"  size={44} anim="spin"   delay={0.5} />
      <Char emoji="⭐" x="18%" y="50%" size={36} anim="float"  delay={0.3} />
      <Char emoji="⭐" x="65%" y="52%" size={36} anim="float"  delay={0.6} />
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
        style={{
          position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)",
          color: "#FFD93D", fontSize: 17, fontWeight: 900,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)", whiteSpace: "nowrap",
          letterSpacing: 1,
        }}
      >YU TEM! — YOUR TURN! 🎯</motion.div>
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
                style={{ fontSize: 54, lineHeight: 1 }}
              >
                {emoji}
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  width: 54, height: 54, borderRadius: 14,
                  border: `3px dashed ${color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, opacity: 0.4,
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
            style={{
              fontSize: 90, lineHeight: 1, background: "none", border: "none",
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
          {count} ✓ Gutpela! 🎉
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
                style={{ fontSize: 46 }}
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
              style={{
                background: "linear-gradient(135deg,#52B788,#2d6a4f)",
                border: "3px solid #a8dadc",
                borderRadius: "50%",
                width: 64, height: 64,
                fontSize: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(82,183,136,0.55)",
              }}
            >
              ➕
            </motion.button>
          </div>

          {/* Group B */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 110 }}>
            {Array.from({ length: countB }).map((_, i) => (
              <motion.div key={i}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: "spring", bounce: 0.7 }}
                style={{ fontSize: 46 }}
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
                <div style={{ fontSize: 44 }}>{e}</div>
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
            {total} olgeta! ⭐
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
        height: 200,
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
