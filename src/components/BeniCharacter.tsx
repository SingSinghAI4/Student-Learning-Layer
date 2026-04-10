/**
 * BeniCharacter — SVG cartoon mascot, Grade 2 PNG boy
 * Fixed 0 0 100 135 viewBox — scales cleanly from 28px to 200px
 * Proper cartoon proportions: big head (44% of height), bold shapes
 * States: idle, excited, correct, thinking, sad, walk
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
  // All drawing is in fixed 100×135 space — size only controls rendered dimensions
  const W = 100;
  const H = 135;

  // ── Body bounce ──
  const bodyAnim =
    state === "excited"  ? { y: [0, -14, 2, -8, 0] }
    : state === "correct" ? { y: [0, -18, 3, -10, 0], scale: [1, 1.1, 1.02, 1.06, 1] }
    : state === "sad"     ? { y: [0, 3, 0] }
    : state === "walk"    ? { x: [0, 3, 0, -3, 0] }
    : { y: [0, -3, 0] };

  const bodyTrans: Transition =
    state === "excited"  ? { duration: 0.5, repeat: 3, repeatType: "mirror", ease: "easeOut" }
    : state === "correct" ? { duration: 0.7, type: "spring", bounce: 0.65 }
    : state === "sad"     ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
    : state === "walk"    ? { duration: 0.38, repeat: Infinity, ease: "linear" }
    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" };

  // ── Head tilt ──
  const headAnim =
    state === "thinking" ? { rotate: [-5, 10, -5] }
    : state === "sad"    ? { rotate: [0, -14, 0] }
    : { rotate: [0, 0, 0] };

  const headTrans: Transition =
    state === "thinking" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    : state === "sad"    ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
    : { duration: 1 };

  // ── Eye blink ──
  const [blink, setBlink] = React.useState(false);
  React.useEffect(() => {
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 110);
    }, 3000 + Math.random() * 1200);
    return () => clearInterval(iv);
  }, []);

  // ── Arm swing ──
  const armRotL =
    state === "excited" || state === "correct" ? [-20, 35, -20]
    : state === "walk"  ? [-22, 22, -22]
    : [0, 6, 0];
  const armRotR = armRotL.map(v => -v);
  const armTrans: Transition =
    state === "walk"    ? { duration: 0.38, repeat: Infinity, ease: "linear" }
    : state === "excited" || state === "correct"
    ? { duration: 0.4, repeat: 4, repeatType: "mirror" }
    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" };

  // ── Leg swing (walk only) ──
  const legAnimL = state === "walk" ? { rotate: [14, -14, 14] } : {};
  const legAnimR = state === "walk" ? { rotate: [-14, 14, -14] } : {};
  const legTrans: Transition = { duration: 0.38, repeat: Infinity, ease: "linear" };

  // ── Mouth path ──
  const mouthPath =
    state === "sad"      ? "M 38 62 Q 50 59 62 62"        // subtle frown
    : state === "thinking" ? "M 40 62 L 60 62"              // flat
    : "M 37 61 Q 50 70 63 61";                              // big smile

  return (
    <motion.div
      animate={bodyAnim}
      transition={bodyTrans}
      style={{
        display: "inline-block",
        width: size,
        height: size * (H / W),
        flexShrink: 0,
        transform: flipX ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={size}
        height={size * (H / W)}
        style={{ overflow: "visible", display: "block" }}
      >
        {/* ── Drop shadow ── */}
        <ellipse cx={50} cy={131} rx={18} ry={4} fill="rgba(0,0,0,0.18)" />

        {/* ── Legs ── */}
        <motion.g
          animate={legAnimL}
          transition={legTrans}
          style={{ transformOrigin: "39px 95px" }}
        >
          <rect x={33} y={94} width={13} height={30} rx={6} fill="#1a1040" />
          <ellipse cx={39} cy={126} rx={9} ry={5} fill="#111" />
        </motion.g>
        <motion.g
          animate={legAnimR}
          transition={legTrans}
          style={{ transformOrigin: "61px 95px" }}
        >
          <rect x={54} y={94} width={13} height={30} rx={6} fill="#1a1040" />
          <ellipse cx={61} cy={126} rx={9} ry={5} fill="#111" />
        </motion.g>

        {/* ── Body — red PNG school shirt ── */}
        <rect x={28} y={52} width={44} height={44} rx={10} fill="#d93b20" />
        {/* Collar V */}
        <path d="M 42 52 L 50 63 L 58 52" fill="#fff" opacity={0.88} />
        {/* Pocket */}
        <rect x={33} y={63} width={11} height={9} rx={2} fill="rgba(255,255,255,0.25)" />

        {/* ── Left arm — pivot at shoulder (28, 57) ── */}
        <motion.g
          animate={{ rotate: armRotL }}
          transition={armTrans}
          style={{ transformOrigin: "28px 57px" }}
        >
          <rect x={14} y={57} width={14} height={28} rx={7} fill="#7b4a1e" />
          <circle cx={21} cy={88} r={7} fill="#7b4a1e" />
        </motion.g>

        {/* ── Right arm — pivot at shoulder (72, 57) ── */}
        <motion.g
          animate={{ rotate: armRotR }}
          transition={armTrans}
          style={{ transformOrigin: "72px 57px" }}
        >
          <rect x={72} y={57} width={14} height={28} rx={7} fill="#7b4a1e" />
          <circle cx={79} cy={88} r={7} fill="#7b4a1e" />
        </motion.g>

        {/* ── Neck ── */}
        <rect x={44} y={48} width={12} height={9} rx={5} fill="#7b4a1e" />

        {/* ══ HEAD GROUP — pivot at chin (50, 50) ══ */}
        <motion.g
          animate={headAnim}
          transition={headTrans}
          style={{ transformOrigin: "50px 50px" }}
        >
          {/* Head shape — big cartoon circle */}
          <ellipse cx={50} cy={30} rx={24} ry={26} fill="#7b4a1e" />

          {/* Hair — dark, full top */}
          <ellipse cx={50} cy={10} rx={25} ry={13} fill="#1a0f06" />
          <ellipse cx={50} cy={17} rx={24} ry={9}  fill="#1a0f06" />

          {/* Ears */}
          <ellipse cx={26} cy={31} rx={5} ry={7} fill="#6b3a14" />
          <ellipse cx={74} cy={31} rx={5} ry={7} fill="#6b3a14" />

          {/* ── Eyes ── */}
          <ellipse cx={40} cy={28}
            rx={7} ry={state === "thinking" ? 4.5 : 8}
            fill="white"
          />
          <ellipse cx={60} cy={28}
            rx={7} ry={state === "thinking" ? 4.5 : 8}
            fill="white"
          />

          {/* Pupils + shine */}
          {!blink && (
            <>
              <circle cx={41} cy={29} r={4.2} fill="#1a0f06" />
              <circle cx={61} cy={29} r={4.2} fill="#1a0f06" />
              <circle cx={43} cy={27} r={1.4} fill="white" />
              <circle cx={63} cy={27} r={1.4} fill="white" />
            </>
          )}
          {blink && (
            <>
              <line x1={33} y1={28} x2={47} y2={28} stroke="#1a0f06" strokeWidth={2.8} strokeLinecap="round" />
              <line x1={53} y1={28} x2={67} y2={28} stroke="#1a0f06" strokeWidth={2.8} strokeLinecap="round" />
            </>
          )}

          {/* Eyebrows */}
          <path
            d={`M 33 18 Q 40 ${state === "sad" ? 20 : 14} 47 18`}
            stroke="#1a0f06" strokeWidth={2.5} fill="none" strokeLinecap="round"
          />
          <path
            d={`M 53 18 Q 60 ${state === "sad" ? 20 : 14} 67 18`}
            stroke="#1a0f06" strokeWidth={2.5} fill="none" strokeLinecap="round"
          />

          {/* Cheek blush */}
          <ellipse cx={29} cy={36} rx={6} ry={3.5} fill="#c0603a" opacity={0.38} />
          <ellipse cx={71} cy={36} rx={6} ry={3.5} fill="#c0603a" opacity={0.38} />

          {/* Mouth */}
          <path
            d={mouthPath}
            stroke="#5c2a0a" strokeWidth={2.4} fill="none" strokeLinecap="round"
          />

          {/* Teeth — excited/correct */}
          {(state === "excited" || state === "correct") && (
            <path
              d="M 42 63 L 58 63 L 56 69 L 44 69 Z"
              fill="white" opacity={0.92}
            />
          )}

          {/* Thinking bubble */}
          {state === "thinking" && (
            <>
              <circle cx={78} cy={17} r={4}   fill="rgba(255,255,255,0.72)" />
              <circle cx={84} cy={10} r={5.5} fill="rgba(255,255,255,0.72)" />
              <circle cx={77} cy={4}  r={8}   fill="rgba(255,255,255,0.85)" />
              <text x={77} y={7} textAnchor="middle" fontSize={9} fill="#555" fontWeight="bold">?</text>
            </>
          )}

          {/* Stars — correct */}
          {state === "correct" && (
            <>
              <text x={76} y={14} fontSize={16} style={{ filter: "drop-shadow(0 1px 4px gold)" }}>⭐</text>
              <text x={12} y={18} fontSize={12}>✨</text>
            </>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}
