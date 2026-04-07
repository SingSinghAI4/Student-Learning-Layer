/**
 * BeniCharacter — SVG cartoon character for the Maths story
 * A Pacific Islander boy — dark skin, round face, school shirt, big eyes
 * Animates in 4 states: idle (gentle breathe), excited (jump), thinking (head tilt), sad (droop)
 */
import React from "react";
import { motion, type Transition } from "framer-motion";

type BeniState = "idle" | "excited" | "thinking" | "sad" | "correct" | "walk";

interface Props {
  state?: BeniState;
  size?: number;
  style?: React.CSSProperties;
  flipX?: boolean;
}

export default function BeniCharacter({ state = "idle", size = 120, style, flipX }: Props) {
  const s = size;

  // Body bob based on state
  const bodyAnim =
    state === "excited"  ? { y: [0, -s * 0.18, 0, -s * 0.12, 0], scale: [1, 1.06, 1, 1.04, 1] }
    : state === "correct" ? { y: [0, -s * 0.22, s * 0.03, 0], scale: [1, 1.1, 1.02, 1] }
    : state === "sad"     ? { y: [0, s * 0.04, 0], scale: [1, 0.97, 1] }
    : state === "walk"    ? { x: [0, s * 0.04, 0, -s * 0.04, 0] }
    : { y: [0, -s * 0.025, 0] }; // idle breathe

  const bodyTrans: Transition =
    state === "excited"  ? { duration: 0.55, repeat: 3, repeatType: "mirror", ease: "easeOut" }
    : state === "correct" ? { duration: 0.7, type: "spring", bounce: 0.6 }
    : state === "sad"     ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
    : state === "walk"    ? { duration: 0.4, repeat: Infinity, ease: "linear" }
    : { duration: 2.2, repeat: Infinity, ease: "easeInOut" };

  const headAnim =
    state === "thinking" ? { rotate: [-4, 8, -4] }
    : state === "sad"    ? { rotate: [0, -12, 0] }
    : { rotate: [0, 0, 0] };

  const headTrans: Transition =
    state === "thinking" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    : state === "sad"    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
    : { duration: 1 };

  // Eye blink
  const [blink, setBlink] = React.useState(false);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Arm swing for excited/walk
  const armAnim = state === "excited" || state === "correct"
    ? { rotate: [-15, 30, -15] }
    : state === "walk"
    ? { rotate: [-20, 20, -20] }
    : { rotate: [0, 5, 0] };
  const armTrans: Transition = state === "walk"
    ? { duration: 0.4, repeat: Infinity, ease: "linear" }
    : state === "excited" || state === "correct"
    ? { duration: 0.4, repeat: 4, repeatType: "mirror" }
    : { duration: 2.5, repeat: Infinity, ease: "easeInOut" };

  // Smile / frown / neutral
  const mouthPath =
    state === "sad"     ? `M ${s*0.37} ${s*0.465} Q ${s*0.5} ${s*0.45} ${s*0.63} ${s*0.465}` // subtle frown
    : state === "thinking" ? `M ${s*0.40} ${s*0.46} L ${s*0.60} ${s*0.46}` // flat line
    : `M ${s*0.36} ${s*0.46} Q ${s*0.5} ${s*0.54} ${s*0.64} ${s*0.46}`; // big smile

  return (
    <motion.div
      animate={bodyAnim}
      transition={bodyTrans}
      style={{
        display: "inline-block",
        width: s, height: s * 1.35,
        position: "relative",
        transform: flipX ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <svg
        width={s}
        height={s * 1.35}
        viewBox={`0 0 ${s} ${s * 1.35}`}
        style={{ overflow: "visible" }}
      >
        {/* ── Shadow ── */}
        <ellipse cx={s * 0.5} cy={s * 1.3} rx={s * 0.22} ry={s * 0.04}
          fill="rgba(0,0,0,0.18)" />

        {/* ── Legs ── */}
        <motion.g
          animate={state === "walk" ? { rotate: [10, -10, 10] } : {}}
          transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
          style={{ originX: `${s * 0.42}px`, originY: `${s}px` }}
        >
          <rect x={s*0.35} y={s*0.98} width={s*0.14} height={s*0.28} rx={s*0.07}
            fill="#2c1a0e" />
        </motion.g>
        <motion.g
          animate={state === "walk" ? { rotate: [-10, 10, -10] } : {}}
          transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
          style={{ originX: `${s * 0.58}px`, originY: `${s}px` }}
        >
          <rect x={s*0.51} y={s*0.98} width={s*0.14} height={s*0.28} rx={s*0.07}
            fill="#2c1a0e" />
        </motion.g>
        {/* Shoes */}
        <ellipse cx={s*0.42} cy={s*1.27} rx={s*0.1} ry={s*0.05} fill="#111" />
        <ellipse cx={s*0.58} cy={s*1.27} rx={s*0.1} ry={s*0.05} fill="#111" />

        {/* ── Body — red/orange school shirt ── */}
        <rect x={s*0.28} y={s*0.62} width={s*0.44} height={s*0.38} rx={s*0.1}
          fill="#e84b2e" />
        {/* Shirt collar */}
        <path d={`M ${s*0.42} ${s*0.62} L ${s*0.5} ${s*0.7} L ${s*0.58} ${s*0.62}`}
          fill="#fff" opacity={0.9} />
        {/* Shirt pocket */}
        <rect x={s*0.33} y={s*0.71} width={s*0.1} height={s*0.08} rx={s*0.02}
          fill="rgba(255,255,255,0.3)" />

        {/* ── Left arm ── */}
        <motion.g
          animate={armAnim}
          transition={armTrans}
          style={{ transformOrigin: `${s * 0.28}px ${s * 0.67}px` }}
        >
          <rect x={s*0.12} y={s*0.67} width={s*0.16} height={s*0.32} rx={s*0.08}
            fill="#7b4a1e" />
          {/* Hand */}
          <circle cx={s*0.2} cy={s*1.02} r={s*0.07} fill="#7b4a1e" />
        </motion.g>

        {/* ── Right arm ── */}
        <motion.g
          animate={{ ...armAnim, rotate: armAnim.rotate ? (armAnim.rotate as number[]).map(v => -v) : [0] }}
          transition={armTrans}
          style={{ transformOrigin: `${s * 0.72}px ${s * 0.67}px` }}
        >
          <rect x={s*0.72} y={s*0.67} width={s*0.16} height={s*0.32} rx={s*0.08}
            fill="#7b4a1e" />
          <circle cx={s*0.8} cy={s*1.02} r={s*0.07} fill="#7b4a1e" />
        </motion.g>

        {/* ── Neck ── */}
        <rect x={s*0.44} y={s*0.58} width={s*0.12} height={s*0.08} rx={s*0.04}
          fill="#7b4a1e" />

        {/* ── Head ── */}
        <motion.g
          animate={headAnim}
          transition={headTrans}
          style={{ transformOrigin: `${s * 0.5}px ${s * 0.38}px` }}
        >
          {/* Head shape */}
          <ellipse cx={s*0.5} cy={s*0.38} rx={s*0.24} ry={s*0.26} fill="#7b4a1e" />

          {/* Hair — dark, short, curved */}
          <ellipse cx={s*0.5} cy={s*0.15} rx={s*0.25} ry={s*0.12} fill="#1a0f06" />
          <ellipse cx={s*0.5} cy={s*0.22} rx={s*0.24} ry={s*0.08} fill="#1a0f06" />

          {/* Ears */}
          <ellipse cx={s*0.27} cy={s*0.39} rx={s*0.05} ry={s*0.07} fill="#6b3e16" />
          <ellipse cx={s*0.73} cy={s*0.39} rx={s*0.05} ry={s*0.07} fill="#6b3e16" />

          {/* Eyes */}
          <ellipse cx={s*0.40} cy={s*0.37} rx={s*0.06} ry={state === "thinking" ? s*0.04 : s*0.07}
            fill="white" />
          <ellipse cx={s*0.60} cy={s*0.37} rx={s*0.06} ry={state === "thinking" ? s*0.04 : s*0.07}
            fill="white" />
          {/* Pupils */}
          {!blink && <>
            <circle cx={s*0.41} cy={s*0.38} r={s*0.038} fill="#1a0f06" />
            <circle cx={s*0.61} cy={s*0.38} r={s*0.038} fill="#1a0f06" />
            {/* Shine */}
            <circle cx={s*0.425} cy={s*0.365} r={s*0.012} fill="white" />
            <circle cx={s*0.625} cy={s*0.365} r={s*0.012} fill="white" />
          </>}
          {/* Blink */}
          {blink && <>
            <line x1={s*0.34} y1={s*0.37} x2={s*0.46} y2={s*0.37} stroke="#1a0f06" strokeWidth={s*0.025} strokeLinecap="round" />
            <line x1={s*0.54} y1={s*0.37} x2={s*0.66} y2={s*0.37} stroke="#1a0f06" strokeWidth={s*0.025} strokeLinecap="round" />
          </>}

          {/* Eyebrows */}
          <path d={`M ${s*0.34} ${s*0.27} Q ${s*0.40} ${state === "sad" ? s*0.28 : s*0.24} ${s*0.46} ${s*0.27}`}
            stroke="#1a0f06" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />
          <path d={`M ${s*0.54} ${s*0.27} Q ${s*0.60} ${state === "sad" ? s*0.28 : s*0.24} ${s*0.66} ${s*0.27}`}
            stroke="#1a0f06" strokeWidth={s*0.025} fill="none" strokeLinecap="round" />

          {/* Cheek blush */}
          <ellipse cx={s*0.31} cy={s*0.44} rx={s*0.06} ry={s*0.035} fill="#c0603a" opacity={0.4} />
          <ellipse cx={s*0.69} cy={s*0.44} rx={s*0.06} ry={s*0.035} fill="#c0603a" opacity={0.4} />

          {/* Mouth */}
          <path d={mouthPath}
            stroke="#5c2a0a" strokeWidth={s*0.022} fill="none" strokeLinecap="round" />

          {/* Teeth when smiling */}
          {(state === "excited" || state === "correct") && (
            <path d={`M ${s*0.41} ${s*0.465} L ${s*0.59} ${s*0.465} L ${s*0.57} ${s*0.495} L ${s*0.43} ${s*0.495} Z`}
              fill="white" opacity={0.9} />
          )}

          {/* Thinking bubble */}
          {state === "thinking" && (
            <>
              <circle cx={s*0.78} cy={s*0.2} r={s*0.04} fill="rgba(255,255,255,0.7)" />
              <circle cx={s*0.84} cy={s*0.12} r={s*0.06} fill="rgba(255,255,255,0.7)" />
              <circle cx={s*0.76} cy={s*0.06} r={s*0.09} fill="rgba(255,255,255,0.85)" />
              <text x={s*0.76} y={s*0.075} textAnchor="middle" fontSize={s*0.09} fill="#555">?</text>
            </>
          )}

          {/* Stars when correct */}
          {state === "correct" && (
            <>
              <text x={s*0.78} y={s*0.15} fontSize={s*0.18} style={{ filter: "drop-shadow(0 1px 4px gold)" }}>⭐</text>
              <text x={s*0.14} y={s*0.18} fontSize={s*0.14}>✨</text>
            </>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}
