/**
 * PNGRoadMap — kid-friendly game map
 *
 * Road order = unlock order = dot numbers.
 * Dot "1" connects to "2", "2" to "3", etc. — always sequential.
 *
 * Route (clean snake, no crossings):
 *   1-NCD → 2-Gulf → 3-W.High → 4-Chimbu → 5-E.High →
 *   6-Madang → 7-Manus → 8-Morobe → 9-Oro → 10-Milne Bay
 *
 * Manus sits between Madang and Morobe so the road arches up to the
 * island and comes back — no disconnected diagonal.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PNG_PROVINCE_GEO } from "../data/pngProvinceGeo";
import BeniCharacter from "./BeniCharacter";

interface Props {
  homeProvince?: string;
  unlockedCount: number;
  lang?: "tok" | "en";
  compact?: boolean;
}

// ── Road order = game level order = unlock order ────────────────────────────
// Dot number matches road position so 1→2→3→4 is always sequential.
const GAME_ORDER = [
  "NCD",          // 1  Port Moresby (capital, start)
  "Gulf",         // 2  south-west coast
  "W. Highlands", // 3  inland west
  "Chimbu",       // 4  highlands centre
  "E. Highlands", // 5  highlands east
  "Madang",       // 6  north coast
  "Manus",        // 7  island — arches up then back down
  "Morobe",       // 8  north-east coast
  "Oro",          // 9  south-east
  "Milne Bay",    // 10 far east tip (final)
];

// Hand-placed positions for a clean, evenly spread snake across the map
// (not geographic centroids — designed so the road looks good visually)
// Spread across the full 600×380 viewBox — far-left to far-right
const PT: Record<string, { x: number; y: number }> = {
  "NCD":          { x: 220, y: 312 },   // 1 — Port Moresby, south centre
  "Gulf":         { x: 115, y: 268 },   // 2 — south-west coast
  "W. Highlands": { x:  52, y: 188 },   // 3 — pushed to far left
  "Chimbu":       { x: 155, y: 196 },   // 4 — highlands centre
  "E. Highlands": { x: 250, y: 188 },   // 5 — highlands right
  "Madang":       { x: 214, y: 122 },   // 6 — north coast
  "Manus":        { x: 142, y:  40 },   // 7 — island, arches up-left
  "Morobe":       { x: 342, y: 178 },   // 8 — centre-right
  "Oro":          { x: 418, y: 268 },   // 9 — further right
  "Milne Bay":    { x: 522, y: 326 },   // 10 — far east
};

const LABEL: Record<string, string> = {
  "NCD":          "Port Moresby",
  "Gulf":         "Gulf",
  "W. Highlands": "W. Highlands",
  "Chimbu":       "Chimbu",
  "E. Highlands": "E. Highlands",
  "Madang":       "Madang",
  "Manus":        "Manus Is.",
  "Morobe":       "Morobe",
  "Oro":          "Oro",
  "Milne Bay":    "Milne Bay",
};

// Smooth quadratic bezier road through custom points
function buildRoad(upTo: number): string {
  const pts = GAME_ORDER.map(n => PT[n]);
  const limit = Math.min(upTo + 1, pts.length);
  if (limit < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < limit; i++) {
    const p = pts[i - 1], c = pts[i];
    const mx = (p.x + c.x) / 2;
    const my = (p.y + c.y) / 2 - 10;
    d += ` Q ${mx},${my} ${c.x},${c.y}`;
  }
  return d;
}

// All-provinces silhouette fill
const LAND_FILL = "#3d6e50";

export default function PNGRoadMap({ homeProvince, unlockedCount, lang = "tok", compact = false }: Props) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  // unlockedCount = how many provinces are unlocked in GAME_ORDER
  const unlockedIdx = Math.min(unlockedCount, GAME_ORDER.length); // 0-based unlocked count

  const fullRoad = buildRoad(GAME_ORDER.length - 1);
  const doneRoad = buildRoad(Math.max(0, unlockedIdx - 1));

  // Beni stands on the last unlocked checkpoint (or checkpoint 2 as minimum for visual)
  const beniProvince = unlockedIdx > 0 ? GAME_ORDER[unlockedIdx - 1] : GAME_ORDER[1];
  const homePt = PT[beniProvince] ?? PT["Gulf"];
  const vbH = compact ? 200 : 380;
  const DR  = compact ? 5 : 11;   // dot radius
  const HDR = compact ? 7 : 14;   // home dot radius

  return (
    <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
      <svg
        viewBox={`0 0 600 ${vbH}`}
        style={{ width: "100%", display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="ocean" cx="40%" cy="60%" r="60%">
            <stop offset="0%"   stopColor="#0e2d45" stopOpacity="0" />
            <stop offset="100%" stopColor="#040e1a" stopOpacity="0" />
          </radialGradient>
          <filter id="rglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={compact ? 4 : 7} result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dglow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={compact ? 3 : 4} result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <rect x={0} y={0} width={600} height={vbH} fill="url(#ocean)" rx={compact ? 8 : 14} />

        {/* Land silhouette hidden — background image provides the map */}

        {/* ══ ROAD ══════════════════════════════════════════════════════════ */}

        {/* Ghost guide (full path, dashed) */}
        <path d={fullRoad} fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth={compact ? 2 : 3}
          strokeDasharray={compact ? "5 5" : "7 7"}
          strokeLinecap="round"
        />

        {/* Completed section */}
        {unlockedIdx > 0 && (
          <>
            {/* Glow bloom */}
            <motion.path d={doneRoad} fill="none"
              stroke="#FFD93D"
              strokeWidth={compact ? 12 : 18}
              strokeLinecap="round"
              filter="url(#rglow)"
              animate={{ opacity: [0.28, 0.55, 0.28] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            {/* Solid gold line */}
            <path d={doneRoad} fill="none"
              stroke="#FFD93D"
              strokeWidth={compact ? 3.5 : 5}
              strokeLinecap="round"
            />
            {/* White centre dashes */}
            <path d={doneRoad} fill="none"
              stroke="rgba(255,255,255,0.68)"
              strokeWidth={compact ? 1 : 1.5}
              strokeDasharray={compact ? "4 6" : "5 8"}
              strokeLinecap="round"
            />
          </>
        )}

        {/* ══ CHECKPOINTS ═══════════════════════════════════════════════════ */}
        {GAME_ORDER.map((name, i) => {
          const pt         = PT[name];
          const level      = i + 1;                    // 1-based road level
          const isUnlocked = i < unlockedIdx;
          const isHome     = name === beniProvince;   // highlight where Beni stands
          const r          = isHome ? HDR : DR;
          const isManus    = name === "Manus";

          return (
            <g key={name}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Home pulse rings */}
              {isHome && !compact && [0, 0.5, 1.0].map((delay, ri) => (
                <motion.circle key={ri}
                  cx={pt.x} cy={pt.y}
                  r={r + 5 + ri * 7}
                  fill="none"
                  stroke={isManus ? "#64C8FF" : "#FFD93D"}
                  strokeWidth={1.8}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.65, 0, 0.65] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeOut" }}
                  style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                />
              ))}

              {/* Glow halo (unlocked) */}
              {isUnlocked && !compact && (
                <motion.circle cx={pt.x} cy={pt.y} r={r + 6}
                  fill={
                    isHome ? (isManus ? "rgba(100,200,255,0.5)" : "rgba(255,217,61,0.5)")
                    : isManus ? "rgba(100,200,255,0.25)" : "rgba(255,217,61,0.25)"
                  }
                  filter="url(#dglow)"
                  animate={{ opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.18 }}
                />
              )}

              {/* Dot */}
              <circle cx={pt.x} cy={pt.y} r={r}
                fill={
                  isHome
                    ? (isManus ? "#64C8FF" : "#FFD93D")
                    : isUnlocked
                      ? (isManus ? "#0e2a3a" : "#1e3824")
                      : "rgba(8,18,36,0.85)"
                }
                stroke={
                  isHome
                    ? (isManus ? "#2288bb" : "#ffb800")
                    : isUnlocked
                      ? (isManus ? "#64C8FF" : "#FFD93D")
                      : "rgba(255,255,255,0.28)"
                }
                strokeWidth={isHome ? 3.5 : isUnlocked ? 2.5 : 1.5}
              />

              {/* Level number */}
              {!compact && (
                <text x={pt.x} y={pt.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHome ? 8.5 : 7.5} fontWeight={900}
                  fill={
                    isHome
                      ? "#1a0a00"
                      : isUnlocked
                        ? (isManus ? "#64C8FF" : "#FFD93D")
                        : "rgba(255,255,255,0.28)"
                  }
                  fontFamily="'Nunito', sans-serif"
                >{level}</text>
              )}


              {/* Hover tooltip for locked */}
              <AnimatePresence>
                {hovered === name && !isUnlocked && !compact && (
                  <motion.g
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <rect x={pt.x - 42} y={pt.y - r - 26}
                      width={84} height={17} rx={5}
                      fill="rgba(0,0,0,0.92)"
                      stroke={isManus ? "rgba(100,200,255,0.3)" : "rgba(255,217,61,0.2)"}
                      strokeWidth={0.8}
                    />
                    <text x={pt.x} y={pt.y - r - 13}
                      textAnchor="middle" fontSize={7.5} fontWeight={900}
                      fill={isManus ? "rgba(100,200,255,0.65)" : "rgba(255,217,61,0.6)"}
                      fontFamily="'Nunito', sans-serif"
                    >🔒 Level {level} · {LABEL[name]}</text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Beni on home province */}
        {!compact && (
          <motion.foreignObject
            x={homePt.x - 13} y={homePt.y - 46}
            width={26} height={46}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring", bounce: 0.6 }}
            style={{ overflow: "visible" }}
          >
            <BeniCharacter state="excited" size={26} />
          </motion.foreignObject>
        )}


        {!compact && (
          <text x={300} y={372} textAnchor="middle" fontSize={8}
            fill="rgba(255,255,255,0.22)" fontWeight={900}
            fontFamily="'Nunito', sans-serif" letterSpacing={3}
          >PAPUA NEW GUINEA</text>
        )}
      </svg>
    </div>
  );
}
