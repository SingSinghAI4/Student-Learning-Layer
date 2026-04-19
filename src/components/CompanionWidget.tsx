import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanionAvatar } from "./AvatarPicker";

export type CompanionState = "idle" | "listening" | "thinking" | "pointing" | "celebrating";

interface Props {
  avatar: CompanionAvatar;
  state: CompanionState;
  speech?: string;
}

const STATE_LABELS: Record<CompanionState, string> = {
  idle:        "",
  listening:   "I'm listening...",
  thinking:    "Let me think...",
  pointing:    "",
  celebrating: "Amazing work!",
};

export default function CompanionWidget({ avatar, state, speech }: Props) {
  return (
    <div style={{ position: "relative", width: 180, userSelect: "none" }}>

      {/* Character image */}
      <div style={{
        width: 180, height: 220,
        borderRadius: 24,
        overflow: "hidden",
        border: `2px solid ${avatar.accentColor}44`,
        background: `radial-gradient(circle at 50% 80%, ${avatar.accentColor}22, transparent 70%)`,
        boxShadow: state === "celebrating"
          ? `0 0 40px ${avatar.accentColor}66`
          : `0 0 20px ${avatar.accentColor}22`,
        transition: "box-shadow 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <motion.img
          src={avatar.image}
          alt={avatar.name}
          animate={
            state === "celebrating"
              ? { scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }
              : state === "listening"
              ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 1.4 } }
              : state === "thinking"
              ? { rotate: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 2 } }
              : { scale: 1, rotate: 0 }
          }
          style={{
            width: "90%", height: "90%",
            objectFit: "contain",
            filter: `drop-shadow(0 6px 18px ${avatar.accentColor}55)`,
          }}
        />
      </div>

      {/* State label */}
      <AnimatePresence>
        {STATE_LABELS[state] && (
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: "center", marginTop: 8,
              fontSize: 12, fontWeight: 700,
              color: avatar.accentColor,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {STATE_LABELS[state]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            key={speech}
            initial={{ opacity: 0, x: 10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            style={{
              position: "absolute",
              left: "calc(100% + 14px)",
              top: 16,
              width: 220,
              background: "rgba(10,26,7,0.92)",
              border: `1.5px solid ${avatar.accentColor}55`,
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: `0 4px 24px ${avatar.accentColor}22`,
              zIndex: 10,
            }}
          >
            <div style={{
              position: "absolute",
              left: -8, top: 20,
              width: 0, height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: `8px solid ${avatar.accentColor}55`,
            }} />
            <p style={{
              margin: 0, fontSize: 14, lineHeight: 1.55,
              color: "rgba(255,255,255,0.88)",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
            }}>
              {speech}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
