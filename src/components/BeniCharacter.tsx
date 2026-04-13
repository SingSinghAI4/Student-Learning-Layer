/**
 * BeniCharacter — PNG boy mascot, Chhota Bheem art style
 * Thick black outlines on every shape, baked-in shadow blobs,
 * vivid saturated colours, big expressive eyes.
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

const OL = "#1a0800";   // outline colour
const OW = 3;            // default outline stroke-width

export default function BeniCharacter({ state = "idle", size = 120, style, flipX }: Props) {
  const W = 100;
  const H = 140;

  // ── Body bounce ──
  const bodyAnim =
    state === "excited"  ? { y: [0, -16, 3, -10, 0] }
    : state === "correct" ? { y: [0, -20, 4, -12, 0], scale: [1, 1.12, 1.03, 1.08, 1] }
    : state === "sad"     ? { y: [0, 4, 0] }
    : state === "walk"    ? { x: [0, 4, 0, -4, 0] }
    : { y: [0, -4, 0] };

  const bodyTrans: Transition =
    state === "excited"  ? { duration: 0.5, repeat: 3, repeatType: "mirror", ease: "easeOut" }
    : state === "correct" ? { duration: 0.7, type: "spring", bounce: 0.65 }
    : state === "sad"     ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
    : state === "walk"    ? { duration: 0.38, repeat: Infinity, ease: "linear" }
    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" };

  // ── Head tilt ──
  const headAnim =
    state === "thinking" ? { rotate: [-6, 12, -6] }
    : state === "sad"    ? { rotate: [0, -16, 0] }
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
      setTimeout(() => setBlink(false), 120);
    }, 2800 + Math.random() * 1400);
    return () => clearInterval(iv);
  }, []);

  // ── Arm swing ──
  // Negative = counterclockwise = left arm raises UP; positive = right arm raises UP
  const armRotL =
    state === "excited" || state === "correct" ? [-130, -100, -130]
    : state === "walk"  ? [-26, 26, -26]
    : [0, 8, 0];
  const armRotR =
    state === "excited" || state === "correct" ? [130, 100, 130]
    : state === "walk"  ? [26, -26, 26]
    : [0, -8, 0];
  const armTrans: Transition =
    state === "walk"      ? { duration: 0.38, repeat: Infinity, ease: "linear" }
    : state === "excited" || state === "correct"
    ? { duration: 0.4, repeat: 4, repeatType: "mirror" }
    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" };

  // ── Leg swing ──
  const legAnimL = state === "walk" ? { rotate: [16, -16, 16] } : {};
  const legAnimR = state === "walk" ? { rotate: [-16, 16, -16] } : {};
  const legTrans: Transition = { duration: 0.38, repeat: Infinity, ease: "linear" };

  // ── Mouth ── (nose=y38, head-bottom=y56 → mouth at ~y47)
  const mouthPath =
    state === "sad"       ? "M 37 48 Q 50 44 63 48"
    : state === "thinking" ? "M 40 47 L 60 47"
    : (state === "excited" || state === "correct")
    ? "M 36 46 Q 50 58 64 46"   // wide open smile
    : "M 37 47 Q 50 56 63 47";  // normal smile

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

        {/* ── Ground shadow ── */}
        <ellipse cx={50} cy={136} rx={20} ry={4.5} fill="rgba(0,0,0,0.22)" />

        {/* ══ LEGS ══ */}
        <motion.g animate={legAnimL} transition={legTrans} style={{ transformOrigin: "39px 97px" }}>
          {/* Leg shadow */}
          <rect x={36} y={96} width={10} height={30} rx={5} fill="#0d0a2a" />
          {/* Leg main — dark blue school trousers */}
          <rect x={33} y={95} width={13} height={31} rx={6} fill="#1e1a5a" stroke={OL} strokeWidth={OW} />
          {/* Shoe shadow */}
          <ellipse cx={41} cy={128} rx={9}  ry={4.5} fill="#050505" />
          {/* Shoe */}
          <ellipse cx={39} cy={127} rx={10} ry={5}   fill="#111" stroke={OL} strokeWidth={2} />
        </motion.g>

        <motion.g animate={legAnimR} transition={legTrans} style={{ transformOrigin: "61px 97px" }}>
          <rect x={57} y={96} width={10} height={30} rx={5} fill="#0d0a2a" />
          <rect x={54} y={95} width={13} height={31} rx={6} fill="#1e1a5a" stroke={OL} strokeWidth={OW} />
          <ellipse cx={63} cy={128} rx={9}  ry={4.5} fill="#050505" />
          <ellipse cx={61} cy={127} rx={10} ry={5}   fill="#111" stroke={OL} strokeWidth={2} />
        </motion.g>

        {/* ══ BODY — vivid PNG school red ══ */}
        {/* Shadow blob right side */}
        <rect x={42} y={53} width={30} height={44} rx={9} fill="#b02810" />
        {/* Main shirt */}
        <rect x={27} y={51} width={46} height={46} rx={11} fill="#e63b1e" stroke={OL} strokeWidth={OW} />
        {/* Collar V */}
        <path d="M 41 51 L 50 64 L 59 51" fill="#fff" stroke={OL} strokeWidth={2} />
        {/* Collar inner line */}
        <path d="M 43 51 L 50 61 L 57 51" fill="none" stroke="#ddd" strokeWidth={1} />
        {/* Pocket */}
        <rect x={32} y={63} width={13} height={10} rx={2.5} fill="rgba(255,255,255,0.28)" stroke={OL} strokeWidth={1.5} />
        {/* Shirt highlight strip */}
        <rect x={28} y={52} width={14} height={44} rx={8} fill="rgba(255,120,80,0.22)" />

        {/* ══ LEFT ARM — pivot exactly at shoulder in scaled CSS px ══ */}
        <motion.g animate={{ rotate: armRotL }} transition={armTrans}
          style={{ transformOrigin: `${27 * size / 100}px ${57 * size / 100}px` }}>
          <rect x={16} y={58} width={11} height={27} rx={6} fill="#5a2c0a" />
          <rect x={13} y={57} width={14} height={29} rx={7} fill="#8B4a1e" stroke={OL} strokeWidth={OW} />
          <circle cx={20} cy={89} r={8}  fill="#a05a28" stroke={OL} strokeWidth={OW} />
          <circle cx={18} cy={87} r={3}  fill="#c07038" opacity={0.5} />
        </motion.g>

        {/* ══ RIGHT ARM — pivot exactly at shoulder in scaled CSS px ══ */}
        <motion.g animate={{ rotate: armRotR }} transition={armTrans}
          style={{ transformOrigin: `${73 * size / 100}px ${57 * size / 100}px` }}>
          <rect x={73} y={58} width={11} height={27} rx={6} fill="#5a2c0a" />
          <rect x={73} y={57} width={14} height={29} rx={7} fill="#8B4a1e" stroke={OL} strokeWidth={OW} />
          <circle cx={80} cy={89} r={8}  fill="#a05a28" stroke={OL} strokeWidth={OW} />
          <circle cx={78} cy={87} r={3}  fill="#c07038" opacity={0.5} />
        </motion.g>

        {/* ══ NECK ══ */}
        <rect x={43} y={47} width={14} height={10} rx={5} fill="#8B4a1e" stroke={OL} strokeWidth={2} />

        {/* ══ HEAD GROUP ══ */}
        <motion.g animate={headAnim} transition={headTrans} style={{ transformOrigin: "50px 50px" }}>

          {/* Head shadow blob */}
          <ellipse cx={55} cy={32} rx={21} ry={23} fill="#5a2c0a" opacity={0.45} />
          {/* Head main */}
          <ellipse cx={50} cy={29} rx={25} ry={27} fill="#8B4a1e" stroke={OL} strokeWidth={OW} />

          {/* Hair — full dark top, Chhota Bheem style chunky */}
          <ellipse cx={50} cy={8}  rx={26} ry={14} fill="#1a0f06" />
          <ellipse cx={50} cy={14} rx={25} ry={10} fill="#1a0f06" stroke={OL} strokeWidth={2} />
          {/* Hair highlight */}
          <ellipse cx={42} cy={9}  rx={8}  ry={4}  fill="#2a1a0a" opacity={0.6} />

          {/* Ears */}
          <ellipse cx={25} cy={30} rx={5.5} ry={7.5} fill="#7a3a14" stroke={OL} strokeWidth={2} />
          <ellipse cx={75} cy={30} rx={5.5} ry={7.5} fill="#7a3a14" stroke={OL} strokeWidth={2} />
          {/* Inner ear */}
          <ellipse cx={25} cy={30} rx={2.5} ry={4}   fill="#c06030" opacity={0.5} />
          <ellipse cx={75} cy={30} rx={2.5} ry={4}   fill="#c06030" opacity={0.5} />

          {/* ── Eyes — big Chhota Bheem style ── */}
          {/* Eye shadow */}
          <ellipse cx={41} cy={30} rx={10} ry={11} fill="#3a1a06" opacity={0.35} />
          <ellipse cx={61} cy={30} rx={10} ry={11} fill="#3a1a06" opacity={0.35} />
          {/* White sclera — large */}
          <ellipse cx={40} cy={28}
            rx={9} ry={state === "thinking" ? 5.5 : 10}
            fill="white" stroke={OL} strokeWidth={2.5} />
          <ellipse cx={60} cy={28}
            rx={9} ry={state === "thinking" ? 5.5 : 10}
            fill="white" stroke={OL} strokeWidth={2.5} />

          {/* Pupils */}
          {!blink && (
            <>
              <circle cx={41} cy={29} r={5.5} fill="#1a0f06" />
              <circle cx={61} cy={29} r={5.5} fill="#1a0f06" />
              {/* Iris glint */}
              <circle cx={43} cy={27} r={2}   fill="white" />
              <circle cx={63} cy={27} r={2}   fill="white" />
              {/* Second smaller glint */}
              <circle cx={40} cy={31} r={1}   fill="white" opacity={0.5} />
              <circle cx={60} cy={31} r={1}   fill="white" opacity={0.5} />
            </>
          )}
          {blink && (
            <>
              <path d="M 31 28 Q 40 22 49 28" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 51 28 Q 60 22 69 28" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Eyebrows — thick, expressive */}
          <path
            d={`M 31 17 Q 40 ${state === "sad" ? 21 : 12} 49 17`}
            stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path
            d={`M 51 17 Q 60 ${state === "sad" ? 21 : 12} 69 17`}
            stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" />

          {/* Cheek blush — big rounds */}
          <ellipse cx={28} cy={37} rx={7} ry={4.5} fill="#d4603a" opacity={0.5} />
          <ellipse cx={72} cy={37} rx={7} ry={4.5} fill="#d4603a" opacity={0.5} />

          {/* Nose — simple dot */}
          <circle cx={50} cy={38} r={2.5} fill="#5a2c0a" opacity={0.7} />

          {/* Teeth — rendered BEFORE mouth stroke so the lip line draws on top */}
          {(state === "excited" || state === "correct") && (
            <>
              {/* Mouth cavity dark fill */}
              <path d="M 38 47 Q 50 58 62 47 L 60 51 L 40 51 Z" fill="#1a0800" />
              {/* Teeth block */}
              <path d="M 40 47 L 60 47 L 58 53 L 42 53 Z" fill="white" />
              {/* Tooth divider */}
              <line x1={50} y1={47} x2={50} y2={53} stroke={OL} strokeWidth={1} />
              {/* Teeth outline */}
              <path d="M 40 47 L 60 47 L 58 53 L 42 53 Z"
                fill="none" stroke={OL} strokeWidth={1.2} />
            </>
          )}

          {/* Mouth stroke — drawn on top so it overlaps the top edge of teeth */}
          <path d={mouthPath}
            stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />

          {/* Thinking bubble */}
          {state === "thinking" && (
            <>
              <circle cx={80} cy={16} r={4.5} fill="rgba(255,255,255,0.8)" stroke={OL} strokeWidth={1.5} />
              <circle cx={86} cy={8}  r={6}   fill="rgba(255,255,255,0.8)" stroke={OL} strokeWidth={1.5} />
              <circle cx={80} cy={1}  r={8.5} fill="rgba(255,255,255,0.88)" stroke={OL} strokeWidth={1.5} />
              <text x={80} y={4} textAnchor="middle" fontSize={9} fill="#333" fontWeight="bold">?</text>
            </>
          )}

          {/* Stars — correct */}
          {state === "correct" && (
            <>
              {/* Star left */}
              <polygon points="14,14 15.8,19 21,19 16.8,22 18.5,27 14,24 9.5,27 11.2,22 7,19 12.2,19"
                fill="#FFD93D" stroke="#c49000" strokeWidth={1} />
              {/* Star right */}
              <polygon points="86,10 87.5,14.5 92,14.5 88.4,17 89.8,21.5 86,18.8 82.2,21.5 83.6,17 80,14.5 84.5,14.5"
                fill="#FFD93D" stroke="#c49000" strokeWidth={1} />
            </>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}
