/**
 * DavidCharacter — PNG sticker mascot for SingSinghAI
 * Uses the real David sticker (PNG flag cap, thumbs up, red shirt)
 * Animates in 3 states: idle (float), excited (bounce+rotate), thinking (sway)
 */
import React from "react";
import { motion, type Transition } from "framer-motion";
import davidSticker from "../assets/david-sticker.png";

type DavidState = "idle" | "excited" | "thinking";

interface Props {
  state?: DavidState;
  size?: number;
  style?: React.CSSProperties;
}

export default function DavidCharacter({ state = "idle", size = 120, style }: Props) {

  const bodyAnim =
    state === "excited"
      ? { y: [0, -size * 0.18, size * 0.04, -size * 0.10, 0], rotate: [0, 6, -4, 3, 0], scale: [1, 1.12, 1.05, 1.08, 1] }
      : state === "thinking"
      ? { rotate: [-4, 6, -4], scale: [1, 1.02, 1] }
      : { y: [0, -size * 0.05, 0] }; // idle — gentle float

  const bodyTrans: Transition =
    state === "excited"
      ? { duration: 0.65, repeat: 3, repeatType: "mirror", ease: "easeOut" }
      : state === "thinking"
      ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
      : { duration: 2.8, repeat: Infinity, ease: "easeInOut" };

  // Glow color per state
  const glowColor =
    state === "excited"  ? "rgba(255,217,61,0.55)"
    : state === "thinking" ? "rgba(168,218,220,0.45)"
    : "rgba(82,183,136,0.35)";

  const glowSize =
    state === "excited" ? size * 0.18 : size * 0.1;

  return (
    <motion.div
      animate={bodyAnim}
      transition={bodyTrans}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Glow behind sticker — changes with state */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 ${glowSize}px 0px ${glowColor}`,
            `0 0 ${glowSize * 1.8}px 4px ${glowColor}`,
            `0 0 ${glowSize}px 0px ${glowColor}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* The sticker image */}
      <img
        src={davidSticker}
        alt="David"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center top",
          userSelect: "none",
          pointerEvents: "none",
          filter: state === "excited"
            ? "drop-shadow(0 4px 12px rgba(255,217,61,0.6))"
            : state === "thinking"
            ? "drop-shadow(0 2px 8px rgba(168,218,220,0.5))"
            : "drop-shadow(0 3px 10px rgba(0,0,0,0.35))",
        }}
      />

      {/* Excited — star burst particles */}
      {state === "excited" && (
        <>
          {[0, 60, 120, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((angle * Math.PI) / 180) * size * 0.55,
                y: Math.sin((angle * Math.PI) / 180) * size * 0.55,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut", repeat: Infinity, repeatDelay: 1.8 }}
              style={{
                position: "absolute",
                top: "40%", left: "50%",
                width: 7, height: 7,
                borderRadius: "50%",
                background: ["#FFD93D", "#52B788", "#A8DADC", "#ff7043", "#fff"][i % 5],
                marginLeft: -3.5, marginTop: -3.5,
                pointerEvents: "none",
              }}
            />
          ))}
        </>
      )}

      {/* Thinking — small question bubble */}
      {state === "thinking" && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
          style={{
            position: "absolute",
            top: -size * 0.08,
            right: -size * 0.05,
            background: "rgba(255,255,255,0.92)",
            borderRadius: "50%",
            width: size * 0.28,
            height: size * 0.28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.16,
            fontWeight: 900,
            color: "#555",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >?</motion.div>
      )}
    </motion.div>
  );
}
