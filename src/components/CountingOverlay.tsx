import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SKIP_CHARS = new Set(["➕", "＝", "❓", "➡", "❌", "+", "=", "?", " ", "　", " "]);

export function parseCountableItems(visual: string): string[] {
  return Array.from(visual).filter(ch => !SKIP_CHARS.has(ch) && ch.trim() !== "");
}

interface Props {
  visual: string;
  lang: "tok" | "en";
  onDone: () => void;
}

export default function CountingOverlay({ visual, lang, onDone }: Props) {
  const items = parseCountableItems(visual);
  const total = items.length;
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const delay = step === -1 ? 600 : step < total ? 1100 : 2200;
    const t = setTimeout(() => {
      if (step < total) setStep(s => s + 1);
      else onDone();
    }, delay);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = lang === "tok" ? "Kauntim wantaim mi!" : "Let's count together!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(5,10,30,0.82)",
        backdropFilter: "blur(4px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 40,
        pointerEvents: "all",
      }}
      onClick={onDone}
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: 26, fontWeight: 900, color: "#FFD93D", fontFamily: "'Baloo 2', cursive", letterSpacing: 0.5 }}
      >
        {title}
      </motion.div>

      {/* Items row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: "90%" }}>
        {items.map((item, i) => {
          const isCurrent = step === i;
          const isDone    = step > i;
          return (
            <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <AnimatePresence>
                {isDone && (
                  <motion.div
                    key={`n${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    style={{ fontSize: 22, fontWeight: 900, color: "#FFD93D", fontFamily: "'Baloo 2', cursive", textShadow: "0 0 12px #FFD93D88" }}
                  >
                    {i + 1}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                animate={
                  isCurrent
                    ? { scale: [1, 1.55, 1.35], filter: ["brightness(1) drop-shadow(0 0 0px #FFD93D)", "brightness(1.6) drop-shadow(0 0 22px #FFD93D)", "brightness(1.35) drop-shadow(0 0 12px #FFD93D)"] }
                    : isDone
                    ? { scale: 1.12, filter: "brightness(1.2) drop-shadow(0 0 8px #FFD93D88)" }
                    : { scale: 1, filter: "brightness(0.45)" }
                }
                transition={{ duration: 0.45, ease: "easeOut" as const }}
                style={{ fontSize: 52, lineHeight: 1, userSelect: "none" }}
              >
                {item}
              </motion.div>

              <AnimatePresence>
                {isCurrent && (
                  <motion.div
                    key={`ring${i}`}
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "easeOut" as const }}
                    style={{ position: "absolute", inset: -8, bottom: 0, borderRadius: "50%", border: "3px solid #FFD93D", pointerEvents: "none" }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Total reveal */}
      <AnimatePresence>
        {step >= total && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.55 }}
            style={{ fontSize: 58, fontWeight: 900, color: "#FFD93D", fontFamily: "'Baloo 2', cursive", textShadow: "0 0 32px #FFD93D, 0 0 64px #FFD93D88" }}
          >
            = {total}!{" "}
            <svg width="52" height="52" viewBox="0 0 64 64" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }}>
              {[0,45,90,135,180,225,270,315].map((deg, i) => (
                <line key={i} x1="32" y1="32"
                  x2={32 + Math.cos(deg * Math.PI / 180) * 28}
                  y2={32 + Math.sin(deg * Math.PI / 180) * 28}
                  stroke="#FFD93D" strokeWidth="3.5" strokeLinecap="round"
                />
              ))}
              <polygon
                points="32,10 35.5,22 48,22 38,30 41.5,43 32,35 22.5,43 26,30 16,22 28.5,22"
                fill="#FFD93D" stroke="#c49000" strokeWidth="1.5" strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: "absolute", bottom: 20, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Nunito', sans-serif" }}>
        tap anywhere to close
      </div>
    </motion.div>
  );
}
