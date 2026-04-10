/**
 * PNGJourneyMap — SVG outline of Papua New Guinea with province markers
 * Beni animates to the student's home province position
 * Province dots pulse and light up as the student unlocks them
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROVINCE_DATA, CULTURAL_REGIONS } from "../data";
import BeniCharacter from "./BeniCharacter";

interface Props {
  homeProvince?: string;
  unlockedCount: number;
  lang?: "tok" | "en";
}

// ── Simplified but recognisable SVG path for Papua New Guinea ──
// viewBox: 0 0 520 380
// Includes main island + key island groups
const PNG_PATH =
  "M 35,55 C 58,40 92,27 128,23 C 164,19 196,21 225,30 C 254,39 272,39 292,37 " +
  "L 310,43 C 322,52 335,63 344,78 C 353,92 364,108 370,124 " +
  "C 374,140 370,157 362,172 C 356,184 350,196 354,212 " +
  "C 358,228 367,248 370,264 C 371,272 367,278 360,277 " +
  "C 350,272 338,262 325,258 C 310,255 296,258 280,265 " +
  "C 262,271 240,275 218,274 C 195,273 170,267 145,260 " +
  "C 118,253 94,248 70,243 C 50,239 34,232 30,218 " +
  "C 26,202 27,175 29,148 C 31,120 33,90 35,65 Z";

// Manus Island
const MANUS_PATH = "M 278,10 C 290,6 306,6 318,11 C 326,16 326,24 318,28 C 306,33 290,33 278,28 C 270,24 270,16 278,10 Z";

// New Britain (large elongated)
const NEW_BRITAIN_PATH =
  "M 378,132 C 395,122 415,118 435,124 C 450,130 458,144 455,158 " +
  "C 451,172 436,180 416,177 C 394,174 378,164 376,150 Z";

// New Ireland (slim)
const NEW_IRELAND_PATH =
  "M 428,88 C 438,80 452,79 460,86 C 466,93 466,106 458,114 " +
  "C 448,124 434,125 426,117 C 418,109 418,96 428,88 Z";

// Bougainville
const BOUGAINVILLE_PATH =
  "M 468,100 C 478,92 492,92 500,100 C 508,108 507,124 498,132 " +
  "C 487,141 472,140 464,132 C 456,123 456,108 468,100 Z";

// Province name labels for small dots
const DOT_LABELS: Record<string, string> = {
  "NCD": "Port Moresby",
  "Morobe": "Lae",
  "E. Highlands": "Goroka",
  "W. Highlands": "Mt Hagen",
  "Madang": "Madang",
  "Milne Bay": "Milne Bay",
  "Gulf": "Gulf",
  "Chimbu": "Kundiawa",
  "Oro": "Popondetta",
  "Manus": "Manus",
};

export default function PNGJourneyMap({ homeProvince, unlockedCount, lang = "tok" }: Props) {
  const [hoveredProv, setHoveredProv] = React.useState<string | null>(null);

  // Find home province position for Beni
  const homeData = PROVINCE_DATA.find(p => p.name === homeProvince);
  const beniX = homeData ? homeData.mapX - 14 : 305 - 14; // centre Beni on dot
  const beniY = homeData ? homeData.mapY - 38 : 230 - 38;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox="0 0 520 300"
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      >
        {/* ── Glow filters ── */}
        <defs>
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="mapFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1B4332" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0d2818" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* ── Ocean background ── */}
        <rect x={0} y={0} width={520} height={300} fill="rgba(6,28,50,0.0)" />

        {/* ── Subtle sea texture dots ── */}
        {[...Array(18)].map((_, i) => (
          <motion.circle
            key={i}
            cx={20 + (i * 28) % 490}
            cy={15 + (i * 17) % 270}
            r={1.5}
            fill="rgba(82,183,136,0.12)"
            animate={{ opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* ── Main island border glow ── */}
        <path
          d={PNG_PATH}
          fill="none"
          stroke="rgba(82,183,136,0.3)"
          strokeWidth={8}
          filter="url(#mapGlow)"
        />
        {/* Island fills */}
        <path d={MANUS_PATH}       fill="rgba(82,183,136,0.3)" stroke="rgba(82,183,136,0.5)" strokeWidth={4} filter="url(#mapGlow)" />
        <path d={NEW_BRITAIN_PATH} fill="rgba(82,183,136,0.3)" stroke="rgba(82,183,136,0.5)" strokeWidth={4} filter="url(#mapGlow)" />
        <path d={NEW_IRELAND_PATH} fill="rgba(82,183,136,0.3)" stroke="rgba(82,183,136,0.5)" strokeWidth={4} filter="url(#mapGlow)" />
        <path d={BOUGAINVILLE_PATH} fill="rgba(82,183,136,0.3)" stroke="rgba(82,183,136,0.5)" strokeWidth={4} filter="url(#mapGlow)" />

        {/* ── Main island fill ── */}
        <path d={PNG_PATH} fill="url(#mapFill)" />
        {/* Inner terrain texture lines */}
        <path d={PNG_PATH} fill="none" stroke="rgba(82,183,136,0.12)" strokeWidth={1} />

        {/* ── Island fills ── */}
        <path d={MANUS_PATH}        fill="#163d28" />
        <path d={NEW_BRITAIN_PATH}  fill="#163d28" />
        <path d={NEW_IRELAND_PATH}  fill="#163d28" />
        <path d={BOUGAINVILLE_PATH} fill="#163d28" />

        {/* ── River lines (Sepik / Fly) ── */}
        <path d="M 35,130 C 60,125 85,118 110,120 C 140,122 162,128 185,125" fill="none" stroke="rgba(168,218,220,0.22)" strokeWidth={2} />
        <path d="M 85,160 C 100,155 118,148 135,152 C 148,155 158,162 170,158" fill="none" stroke="rgba(168,218,220,0.18)" strokeWidth={1.5} />

        {/* ── Province markers ── */}
        {PROVINCE_DATA.map((p, i) => {
          const isHome     = p.name === homeProvince;
          const isUnlocked = i < unlockedCount;
          const isHovered  = hoveredProv === p.name;
          const region     = p.region;
          const dotColor   = isHome
            ? "#FFD93D"
            : isUnlocked
            ? CULTURAL_REGIONS[region].glow.replace("0.5)", "1)").replace("0.55)", "1)")
            : "rgba(255,255,255,0.18)";

          return (
            <g key={p.name}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredProv(p.name)}
              onMouseLeave={() => setHoveredProv(null)}
            >
              {/* Pulse ring on home province */}
              {isHome && (
                <>
                  {[0, 0.4, 0.8].map((delay, ri) => (
                    <motion.circle
                      key={ri}
                      cx={p.mapX} cy={p.mapY}
                      r={10 + ri * 5}
                      fill="none"
                      stroke="#FFD93D"
                      strokeWidth={1.5}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
                      style={{ transformOrigin: `${p.mapX}px ${p.mapY}px` }}
                    />
                  ))}
                </>
              )}

              {/* Glow for unlocked */}
              {isUnlocked && !isHome && (
                <motion.circle
                  cx={p.mapX} cy={p.mapY} r={8}
                  fill={CULTURAL_REGIONS[region].glow}
                  filter="url(#dotGlow)"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
                />
              )}

              {/* Main dot */}
              <motion.circle
                cx={p.mapX} cy={p.mapY}
                r={isHome ? 7 : 5}
                fill={dotColor}
                filter={isUnlocked || isHome ? "url(#dotGlow)" : undefined}
                animate={isUnlocked || isHome ? {
                  scale: isHome ? [1, 1.15, 1] : [1, 1.08, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                style={{ transformOrigin: `${p.mapX}px ${p.mapY}px` }}
              />

              {/* Centre dot (home only) */}
              {isHome && (
                <circle cx={p.mapX} cy={p.mapY} r={3} fill="white" />
              )}

              {/* Hover label */}
              <AnimatePresence>
                {isHovered && (
                  <motion.g
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <rect
                      x={p.mapX - 28} y={p.mapY - 24}
                      width={56} height={16}
                      rx={4}
                      fill="rgba(0,0,0,0.82)"
                    />
                    <text
                      x={p.mapX} y={p.mapY - 12}
                      textAnchor="middle"
                      fontSize={7.5}
                      fontWeight={800}
                      fill={isHome ? "#FFD93D" : "rgba(255,255,255,0.85)"}
                      fontFamily="'Nunito', sans-serif"
                    >
                      {DOT_LABELS[p.name] || p.name}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* ── Beni on home province ── */}
        {homeData && (
          <motion.foreignObject
            x={beniX}
            y={beniY}
            width={28}
            height={38}
            initial={{ scale: 0, y: beniY + 10, opacity: 0 }}
            animate={{ scale: 1, y: beniY, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
            style={{ overflow: "visible" }}
          >
            <BeniCharacter state="excited" size={28} />
          </motion.foreignObject>
        )}

        {/* ── PNG text label ── */}
        <text x={155} y={290} textAnchor="middle" fontSize={9}
          fill="rgba(255,255,255,0.18)" fontWeight={800} fontFamily="'Nunito', sans-serif"
          letterSpacing={2}
        >
          PAPUA NEW GUINEA
        </text>

        {/* ── Compass rose (mini) ── */}
        <g transform="translate(490, 30)">
          <circle cx={0} cy={0} r={10} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <text x={0} y={-14} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.4)" fontWeight={900}>N</text>
          <line x1={0} y1={-8} x2={0} y2={8} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <line x1={-8} y1={0} x2={8} y2={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <circle cx={0} cy={0} r={2} fill="rgba(255,255,255,0.4)" />
        </g>
      </svg>
    </div>
  );
}
