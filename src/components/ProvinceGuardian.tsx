/**
 * ProvinceGuardian — cultural cartoon character in traditional PNG dress
 * 4 regional styles: highlands, momase, papuan, islands
 * Fixed viewBox 0 0 100 160 — scales from 40px to 220px cleanly
 * States: idle (sway), excited (jump), thinking (head tilt)
 */
import React from "react";
import { motion, type Transition } from "framer-motion";
import { type CulturalRegion, CULTURAL_REGIONS } from "../data";

type GuardianState = "idle" | "excited" | "thinking";

interface Props {
  region: CulturalRegion;
  state?: GuardianState;
  size?: number;
  style?: React.CSSProperties;
  showGlow?: boolean;
}

export default function ProvinceGuardian({
  region,
  state = "idle",
  size = 120,
  style,
  showGlow = true,
}: Props) {
  const R = CULTURAL_REGIONS[region];
  const W = 100;
  const H = 160;

  // ── Body animation ──
  const bodyAnim =
    state === "excited"
      ? { y: [0, -16, 3, -10, 0], scale: [1, 1.08, 1.02, 1.05, 1] }
      : state === "thinking"
      ? { rotate: [-3, 3, -3] }
      : { y: [0, -5, 0] };

  const bodyTrans: Transition =
    state === "excited"
      ? { duration: 0.65, repeat: 3, repeatType: "mirror", ease: "easeOut" }
      : state === "thinking"
      ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
      : { duration: 2.8, repeat: Infinity, ease: "easeInOut" };

  // ── Head tilt ──
  const headAnim = state === "thinking" ? { rotate: [-8, 12, -8] } : { rotate: [0, 0, 0] };
  const headTrans: Transition = state === "thinking"
    ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    : { duration: 1 };

  // ── Arm swing ──
  const armRotL = state === "excited" ? [-25, 40, -25] : [0, 8, 0];
  const armRotR = armRotL.map(v => -v);
  const armTrans: Transition = state === "excited"
    ? { duration: 0.4, repeat: 4, repeatType: "mirror" }
    : { duration: 2.8, repeat: Infinity, ease: "easeInOut" };

  // ── Eye blink ──
  const [blink, setBlink] = React.useState(false);
  React.useEffect(() => {
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 100);
    }, 2800 + Math.random() * 1400);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      animate={bodyAnim}
      transition={bodyTrans}
      style={{
        display: "inline-block",
        width: size,
        height: size * (H / W),
        flexShrink: 0,
        position: "relative",
        ...style,
      }}
    >
      {/* Glow behind */}
      {showGlow && (
        <motion.div
          animate={{
            boxShadow: [
              `0 8px 32px 0px ${R.glow}`,
              `0 12px 48px 8px ${R.glow}`,
              `0 8px 32px 0px ${R.glow}`,
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: 0, left: "10%", right: "10%",
            height: "30%",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={size}
        height={size * (H / W)}
        style={{ overflow: "visible", display: "block" }}
      >
        {/* ── Drop shadow ── */}
        <ellipse cx={50} cy={156} rx={20} ry={5} fill="rgba(0,0,0,0.22)" />

        {/* ── Legs / lower body ── */}
        {region === "highlands" || region === "momase" ? (
          // Grass skirt — multiple strips
          <>
            {[-14,-10,-6,-2,2,6,10,14].map((dx, i) => (
              <motion.rect
                key={i}
                x={50 + dx - 2}
                y={105}
                width={5}
                height={32 + (i % 2) * 4}
                rx={2.5}
                fill={i % 2 === 0 ? R.skirtColor : `${R.skirtColor}cc`}
                animate={{ rotate: [0, (i % 2 === 0 ? 3 : -3), 0] }}
                transition={{ duration: 1.8 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                style={{ transformOrigin: `${50 + dx}px 105px` }}
              />
            ))}
            {/* Legs below skirt */}
            <rect x={40} y={132} width={9} height={22} rx={4} fill="#7b4a1e" />
            <rect x={51} y={132} width={9} height={22} rx={4} fill="#7b4a1e" />
            {/* Feet */}
            <ellipse cx={44} cy={155} rx={8} ry={4} fill="#6b3a14" />
            <ellipse cx={56} cy={155} rx={8} ry={4} fill="#6b3a14" />
          </>
        ) : region === "islands" ? (
          // Woven mat skirt — horizontal bands
          <>
            {[0,1,2,3,4,5].map(i => (
              <rect
                key={i}
                x={34}
                y={105 + i * 7}
                width={32}
                height={6}
                rx={1}
                fill={i % 2 === 0 ? R.skirtColor : "#c9a85e"}
                opacity={0.9}
              />
            ))}
            <rect x={40} y={144} width={9} height={14} rx={4} fill="#7b4a1e" />
            <rect x={51} y={144} width={9} height={14} rx={4} fill="#7b4a1e" />
            <ellipse cx={44} cy={158} rx={8} ry={4} fill="#6b3a14" />
            <ellipse cx={56} cy={158} rx={8} ry={4} fill="#6b3a14" />
          </>
        ) : (
          // Papuan — wrapped laplap / bark cloth
          <>
            <rect x={36} y={105} width={28} height={38} rx={4} fill={R.skirtColor} />
            {/* Laplap pattern stripes */}
            <rect x={38} y={110} width={24} height={3} rx={1} fill="rgba(255,255,255,0.18)" />
            <rect x={38} y={118} width={24} height={3} rx={1} fill="rgba(255,255,255,0.18)" />
            <rect x={38} y={126} width={24} height={3} rx={1} fill="rgba(255,255,255,0.18)" />
            <rect x={40} y={140} width={9} height={16} rx={4} fill="#7b4a1e" />
            <rect x={51} y={140} width={9} height={16} rx={4} fill="#7b4a1e" />
            <ellipse cx={44} cy={156} rx={8} ry={4} fill="#6b3a14" />
            <ellipse cx={56} cy={156} rx={8} ry={4} fill="#6b3a14" />
          </>
        )}

        {/* ── Torso / bare chest ── */}
        <rect x={32} y={70} width={36} height={38} rx={8} fill="#7b4a1e" />

        {/* Necklace — kina shell or shell beads */}
        {region === "highlands" || region === "papuan" ? (
          // Kina shell (crescent)
          <path
            d="M 38 76 Q 50 88 62 76"
            stroke={R.shellColor} strokeWidth={3.5} fill="none" strokeLinecap="round"
            opacity={0.95}
          />
        ) : (
          // Shell bead necklace
          <>
            {[38, 42, 46, 50, 54, 58, 62].map((cx, i) => (
              <circle key={i} cx={cx} cy={76 + (i === 3 ? 4 : i % 2 === 0 ? 2 : 1)} r={2.8}
                fill={R.shellColor} opacity={0.9} />
            ))}
          </>
        )}

        {/* Belt / waist decoration */}
        <rect x={32} y={103} width={36} height={5} rx={2} fill={R.featherColor} opacity={0.7} />

        {/* ── Left arm — pivot at (32, 76) ── */}
        <motion.g
          animate={{ rotate: armRotL }}
          transition={armTrans}
          style={{ transformOrigin: "32px 76px" }}
        >
          <rect x={18} y={76} width={14} height={26} rx={7} fill="#7b4a1e" />
          <circle cx={25} cy={104} r={7} fill="#7b4a1e" />
          {/* Arm band */}
          <rect x={18} y={88} width={14} height={4} rx={2} fill={R.featherColor} opacity={0.6} />
        </motion.g>

        {/* ── Right arm — pivot at (68, 76) ── */}
        <motion.g
          animate={{ rotate: armRotR }}
          transition={armTrans}
          style={{ transformOrigin: "68px 76px" }}
        >
          <rect x={68} y={76} width={14} height={26} rx={7} fill="#7b4a1e" />
          <circle cx={75} cy={104} r={7} fill="#7b4a1e" />
          <rect x={68} y={88} width={14} height={4} rx={2} fill={R.featherColor} opacity={0.6} />
        </motion.g>

        {/* ── Neck ── */}
        <rect x={44} y={65} width={12} height={10} rx={5} fill="#7b4a1e" />

        {/* ══ HEAD GROUP — pivot at chin (50, 66) ══ */}
        <motion.g
          animate={headAnim}
          transition={headTrans}
          style={{ transformOrigin: "50px 66px" }}
        >
          {/* Head */}
          <ellipse cx={50} cy={45} rx={24} ry={26} fill="#7b4a1e" />

          {/* ── Headdress base ── */}
          <ellipse cx={50} cy={24} rx={24} ry={10} fill={R.headdressColor} />

          {/* ── Feathers / headdress style per region ── */}
          {region === "highlands" && (
            // Bird of Paradise feathers — tall and dramatic
            <>
              <ellipse cx={50} cy={8}  rx={4} ry={18} fill={R.featherColor} opacity={0.9} />
              <ellipse cx={38} cy={10} rx={3} ry={14} fill={R.headdressColor} opacity={0.85} transform="rotate(-18, 38, 10)" />
              <ellipse cx={62} cy={10} rx={3} ry={14} fill={R.headdressColor} opacity={0.85} transform="rotate(18, 62, 10)" />
              <ellipse cx={28} cy={15} rx={2.5} ry={10} fill={R.featherColor} opacity={0.7} transform="rotate(-28, 28, 15)" />
              <ellipse cx={72} cy={15} rx={2.5} ry={10} fill={R.featherColor} opacity={0.7} transform="rotate(28, 72, 15)" />
              {/* White feather tips */}
              <ellipse cx={50} cy={-2} rx={2} ry={6} fill="white" opacity={0.8} />
              <ellipse cx={38} cy={0}  rx={1.5} ry={5} fill="white" opacity={0.6} transform="rotate(-18, 38, 0)" />
              <ellipse cx={62} cy={0}  rx={1.5} ry={5} fill="white" opacity={0.6} transform="rotate(18, 62, 0)" />
              {/* Shell band on headdress */}
              <path d="M 30 22 Q 50 26 70 22" stroke={R.shellColor} strokeWidth={2.5} fill="none" />
            </>
          )}
          {region === "momase" && (
            // Rattan headband + upright feathers
            <>
              <rect x={26} y={18} width={48} height={8} rx={4} fill="#5C3D2E" />
              {/* Feathers sticking up from band */}
              {[-14,-6,0,6,14].map((dx, i) => (
                <ellipse key={i} cx={50+dx} cy={8+(i===2?-4:0)} rx={2.5}
                  ry={i===2?14:10} fill={i===2?R.featherColor:R.headdressColor}
                  opacity={0.9}
                  style={{ transform: `rotate(${dx*1.5}deg)`, transformOrigin: `${50+dx}px 18px` }}
                />
              ))}
              {/* Tattoo/face paint dots on forehead */}
              <circle cx={44} cy={20} r={2} fill={R.faceMarkColor} opacity={0.7} />
              <circle cx={50} cy={19} r={2} fill={R.faceMarkColor} opacity={0.7} />
              <circle cx={56} cy={20} r={2} fill={R.faceMarkColor} opacity={0.7} />
            </>
          )}
          {region === "papuan" && (
            // Floral wreath (hibiscus flowers)
            <>
              {[0,45,90,135,180,225,270,315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const r = 22;
                const cx = 50 + r * Math.cos(rad - Math.PI/2);
                const cy = 23 + r * 0.5 * Math.sin(rad - Math.PI/2);
                return (
                  <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 4 : 3}
                    fill={i % 2 === 0 ? "#E63946" : R.featherColor}
                    opacity={0.88}
                  />
                );
              })}
              {/* Leaf base */}
              <ellipse cx={50} cy={23} rx={20} ry={6} fill="#2E5C18" opacity={0.55} />
            </>
          )}
          {region === "islands" && (
            // Frangipani / tropical flower crown
            <>
              {[0,60,120,180,240,300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 50 + 20 * Math.cos(rad - Math.PI/2);
                const cy = 23 + 9 * Math.sin(rad - Math.PI/2);
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={5} fill={i%2===0 ? "#FF8C00" : R.featherColor} opacity={0.9} />
                    <circle cx={cx} cy={cy} r={2} fill="#FFD700" opacity={0.8} />
                  </g>
                );
              })}
            </>
          )}

          {/* Ears */}
          <ellipse cx={26} cy={46} rx={5} ry={7} fill="#6b3a14" />
          <ellipse cx={74} cy={46} rx={5} ry={7} fill="#6b3a14" />
          {/* Ear rings */}
          <circle cx={26} cy={46} r={2.5} fill={R.shellColor} opacity={0.8} />
          <circle cx={74} cy={46} r={2.5} fill={R.shellColor} opacity={0.8} />

          {/* ── Face paint (region-specific) ── */}
          {region === "highlands" && (
            <>
              {/* Bold red/black face paint — classic highlands */}
              <path d="M 36 42 Q 50 48 64 42" fill={R.faceMarkColor} opacity={0.5} />
              <ellipse cx={50} cy={38} rx={18} ry={6} fill={R.faceMarkColor} opacity={0.22} />
              <circle cx={35} cy={44} r={4} fill={R.faceMarkColor} opacity={0.45} />
              <circle cx={65} cy={44} r={4} fill={R.faceMarkColor} opacity={0.45} />
            </>
          )}
          {region === "momase" && (
            <>
              {/* Thin tattoo lines */}
              <line x1={36} y1={38} x2={44} y2={52} stroke={R.faceMarkColor} strokeWidth={1.2} opacity={0.5} />
              <line x1={64} y1={38} x2={56} y2={52} stroke={R.faceMarkColor} strokeWidth={1.2} opacity={0.5} />
            </>
          )}

          {/* ── Eyes ── */}
          <ellipse cx={40} cy={42} rx={7} ry={8} fill="white" />
          <ellipse cx={60} cy={42} rx={7} ry={8} fill="white" />

          {!blink && (
            <>
              <circle cx={41} cy={43} r={4.2} fill="#1a0f06" />
              <circle cx={61} cy={43} r={4.2} fill="#1a0f06" />
              <circle cx={43} cy={41} r={1.4} fill="white" />
              <circle cx={63} cy={41} r={1.4} fill="white" />
            </>
          )}
          {blink && (
            <>
              <line x1={33} y1={42} x2={47} y2={42} stroke="#1a0f06" strokeWidth={2.8} strokeLinecap="round" />
              <line x1={53} y1={42} x2={67} y2={42} stroke="#1a0f06" strokeWidth={2.8} strokeLinecap="round" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M 33 31 Q 40 27 47 31" stroke="#1a0f06" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M 53 31 Q 60 27 67 31" stroke="#1a0f06" strokeWidth={2.5} fill="none" strokeLinecap="round" />

          {/* Cheeks */}
          <ellipse cx={29} cy={50} rx={6} ry={3.5} fill="#c0603a" opacity={0.35} />
          <ellipse cx={71} cy={50} rx={6} ry={3.5} fill="#c0603a" opacity={0.35} />

          {/* Smile */}
          <path
            d={state === "excited" ? "M 37 55 Q 50 66 63 55" : "M 38 55 Q 50 62 62 55"}
            stroke="#5c2a0a" strokeWidth={2.4} fill="none" strokeLinecap="round"
          />

          {/* Teeth on excited */}
          {state === "excited" && (
            <path d="M 43 57 L 57 57 L 55 63 L 45 63 Z" fill="white" opacity={0.9} />
          )}

          {/* Thinking bubble */}
          {state === "thinking" && (
            <>
              <circle cx={78} cy={32} r={4}   fill="rgba(255,255,255,0.72)" />
              <circle cx={84} cy={24} r={5.5} fill="rgba(255,255,255,0.72)" />
              <circle cx={77} cy={17} r={8}   fill="rgba(255,255,255,0.85)" />
              <text x={77} y={20} textAnchor="middle" fontSize={9} fill="#555" fontWeight="bold">?</text>
            </>
          )}

          {/* Excited stars */}
          {state === "excited" && (
            <>
              <text x={74} y={28} fontSize={14} style={{ filter: "drop-shadow(0 1px 4px gold)" }}>⭐</text>
              <text x={10} y={32} fontSize={10}>✨</text>
            </>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}
