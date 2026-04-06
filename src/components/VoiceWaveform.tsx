import React from "react";
import { motion } from "framer-motion";

interface Props {
  active: boolean;       // true = animating, false = flat/idle
  lang?: "tok" | "en";  // shows language tag when active
  size?: "sm" | "md";
}

// Each bar has its own height profile and animation speed for a natural waveform feel
const BARS = [
  { h: 0.35, dur: 0.52 },
  { h: 0.65, dur: 0.41 },
  { h: 0.85, dur: 0.63 },
  { h: 0.50, dur: 0.38 },
  { h: 1.00, dur: 0.55 },
  { h: 0.75, dur: 0.44 },
  { h: 0.90, dur: 0.60 },
  { h: 0.55, dur: 0.47 },
  { h: 1.00, dur: 0.39 },
  { h: 0.70, dur: 0.58 },
  { h: 0.85, dur: 0.43 },
  { h: 0.40, dur: 0.50 },
  { h: 0.60, dur: 0.65 },
  { h: 0.30, dur: 0.46 },
];

export default function VoiceWaveform({ active, lang = "tok", size = "md" }: Props) {
  const maxH  = size === "sm" ? 18 : 28;
  const minH  = size === "sm" ? 3  : 4;
  const width = size === "sm" ? 3  : 4;
  const gap   = size === "sm" ? 2  : 3;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Waveform bars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap,
          height: maxH,
        }}
      >
        {BARS.map((bar, i) => (
          <motion.div
            key={i}
            style={{
              width,
              borderRadius: width,
              background: active
                ? `rgba(82, 183, 136, ${0.55 + bar.h * 0.45})`
                : "rgba(255,255,255,0.12)",
              transformOrigin: "center",
            }}
            animate={
              active
                ? {
                    height: [
                      minH,
                      maxH * bar.h,
                      minH + 2,
                      maxH * bar.h * 0.7,
                      minH,
                    ],
                  }
                : { height: minH }
            }
            transition={
              active
                ? {
                    duration: bar.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.04,
                  }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>

      {/* Language label — only when active */}
      <motion.div
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : -4 }}
        transition={{ duration: 0.25 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: size === "sm" ? 9 : 10,
          fontWeight: 800,
          color: "rgba(82,183,136,0.85)",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        <span>🎙</span>
        <span>{lang === "tok" ? "Tok Pisin" : "English"}</span>
      </motion.div>
    </div>
  );
}
