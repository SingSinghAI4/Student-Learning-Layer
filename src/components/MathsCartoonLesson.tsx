/**
 * MathsCartoonLesson — full-screen arcade cartoon maths lesson
 * Replaces the 220px story card with a proper animated world
 * 10 unique neon-glow SVG backgrounds, Beni at 140px, physics fruit arcs
 * Chalkboard activity panel slides up from bottom
 */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import confetti from "canvas-confetti";
import {
  MATHS_STORY_PAGES, MATHS_ACTIVITIES_MERI, MATHS_ACTIVITIES_SIONE,
  MathsActivity,
} from "../data";
import { StudentProfile } from "../LoginScreen";
import { ActivityMode } from "../types";
import BeniCharacter from "./BeniCharacter";
import AssessmentScreen from "./AssessmentScreen";

type BeniState = "idle" | "excited" | "correct" | "sad" | "thinking" | "walk";

interface FlyingFruit {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
}

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  mathsPath: "meri" | "sione";
  storyPage: number;
  litWordIdx: number;
  sessionMode: ActivityMode;
  sessionProgress: number;
  actIdx: number;
  actSelected: string | null;
  actWrong: string | null;
  onNextStoryPage: () => void;
  onActivityAnswer: (val: string) => void;
  onLangToggle?: () => void;
}

// ── Scene ground & horizon colours (used in CSS ground layer + SVG background) ─
// Sky top → bottom gradient per slide
const SCENE_SKY: [string, string][] = [
  ["#0d1b4b", "#bf4f00"],  // 0 dawn
  ["#1565c0", "#4fc3f7"],  // 1 village
  ["#0288d1", "#81d4fa"],  // 2 walking
  ["#e65100", "#ff9800"],  // 3 mango
  ["#f57f17", "#ffd54f"],  // 4 basket
  ["#006064", "#00bcd4"],  // 5 coconut
  ["#1a237e", "#5c6bc0"],  // 6 basket2
  ["#4a148c", "#9c27b0"],  // 7 add
  ["#b71c1c", "#f57f17"],  // 8 win
  ["#1b0033", "#4a148c"],  // 9 turn
];

const SCENE_GROUND: string[] = [
  "#4a3020", // 0 dawn
  "#2d6a1a", // 1 village
  "#2d5a0a", // 2 walking
  "#4a3020", // 3 mango
  "#4a3020", // 4 basket
  "#1b3a2a", // 5 coconut
  "#1a2a1a", // 6 basket2
  "#1a0a2a", // 7 add
  "#1a2a0a", // 8 win
  "#0a0a1a", // 9 turn
];
const SCENE_HORIZON: string[] = [
  "#ff8c00", "#00e5ff", "#40c4ff", "#FFD93D", "#ffea00",
  "#00e5ff", "#7c4dff", "#52B788", "#FFD93D", "#7c4dff",
];

// ── David encouragement messages (Tok Pisin + English) ───────────────────────
const DAVID_MESSAGES: Array<{ tok: string; en: string }> = [
  { tok: "Yu save!",              en: "You know it!" },
  { tok: "Gutpela wok!",          en: "Great work!" },
  { tok: "Continue, yu strong!",  en: "Keep going, you're strong!" },
  { tok: "Bravoo! Yu nambawan!", en: "Bravo! You're number one!" },
  { tok: "Yu save maths tru!",    en: "You really know your maths!" },
  { tok: "Olgeta i praim yu!",    en: "Everyone is proud of you!" },
  { tok: "Excellent tru!",        en: "Truly excellent!" },
  { tok: "Yu mekim gut!",         en: "You're doing great!" },
];

// ── Small inline SVG waypoint icons ──────────────────────────────────────────
// Each icon is drawn in a 10×10 viewBox, rendered at ~8px
// ── PNG journey map — fixed 220×28 viewBox, no distortion ────────────────
// 10 waypoints at evenly-spaced x, slight y-wave to feel like a path
const MAP_PTS: [number, number][] = [
  [10, 20], [34, 12], [58, 22], [82, 11], [106, 20],
  [130, 11], [154, 22], [178, 12], [196, 20], [214, 13],
];

function PNGJourneyMap({ step }: { step: number }) {
  const pathD = `M ${MAP_PTS.map(([x, y]) => `${x},${y}`).join(" L ")}`;
  const doneD = step > 0
    ? `M ${MAP_PTS.slice(0, step + 1).map(([x, y]) => `${x},${y}`).join(" L ")}`
    : "";
  const [cx, cy] = MAP_PTS[Math.min(step, MAP_PTS.length - 1)];

  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: "flex", alignItems: "center",
      padding: "0 8px", overflow: "visible",
    }}>
      <svg
        width="100%" height="42"
        viewBox="0 0 224 42"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible", display: "block" }}
      >
        {/* Road track shadow */}
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.35)"
          strokeWidth={7} strokeLinecap="round" />

        {/* Ghost road */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.12)"
          strokeWidth={5} strokeLinecap="round" />

        {/* Road dashes */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.2} strokeDasharray="5 4" strokeLinecap="round" />

        {/* Completed gold road */}
        {step > 0 && (
          <>
            <path d={doneD} fill="none" stroke="rgba(255,217,61,0.35)"
              strokeWidth={8} strokeLinecap="round" />
            <path d={doneD} fill="none" stroke="#FFD93D"
              strokeWidth={3.5} strokeLinecap="round" />
            <path d={doneD} fill="none" stroke="rgba(255,255,255,0.45)"
              strokeWidth={1} strokeDasharray="4 5" strokeLinecap="round" />
          </>
        )}

        {/* Waypoint dots */}
        {MAP_PTS.map(([x, y], i) => (
          <g key={i}>
            {i < step && (
              <circle cx={x} cy={y} r={6} fill="rgba(255,217,61,0.25)" />
            )}
            <circle cx={x} cy={y}
              r={i < step ? 4 : 3}
              fill={i < step ? "#FFD93D" : "rgba(255,255,255,0.2)"}
              stroke={i < step ? "#c49000" : "rgba(255,255,255,0.12)"}
              strokeWidth={1}
            />
            {i < step && <circle cx={x} cy={y} r={1.5} fill="#fff" opacity={0.7} />}
          </g>
        ))}

        {/* Current-position pulse ring */}
        <motion.circle cx={cx} cy={cy} r={6} fill="none" stroke="#FFD93D" strokeWidth={2}
          animate={{ r: [6, 14, 6], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Gold marker */}
        <circle cx={cx} cy={cy} r={6} fill="#FFD93D"
          style={{ filter: "drop-shadow(0 0 4px rgba(255,217,61,0.8))" }} />
        <circle cx={cx} cy={cy} r={2.5} fill="#fff" opacity={0.9} />

        {/* Step label above current marker */}
        <text x={cx} y={cy - 10} textAnchor="middle"
          fontSize="6" fontWeight="900" fill="#FFD93D" opacity={0.85}
          fontFamily="'Baloo 2', cursive">
          {step + 1}/{MAP_PTS.length}
        </text>
      </svg>
    </div>
  );
}

// ── Scene background — CSS sky + SVG props (no more xMidYMid slice cropping) ──

function SceneBackground({ slideIndex }: { slideIndex: number }) {
  const [skyTop, skyBot] = SCENE_SKY[Math.min(slideIndex, SCENE_SKY.length - 1)];
  const horizon         = SCENE_HORIZON[Math.min(slideIndex, SCENE_HORIZON.length - 1)];
  const isDaytime = slideIndex >= 1 && slideIndex <= 7;
  const isNight   = slideIndex === 0 || slideIndex === 9;

  return (
    <>
      {/* ── Sky — CSS gradient, always fills sky area above ground strip ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: "26%",
        background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyBot} 100%)`,
        zIndex: 0,
        overflow: "hidden",
      }}>

        {/* Stars — night/dawn slides */}
        {isNight && (
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {[8,18,30,44,56,72,85,14,62,48,25,78,92,38,67].map((xPct, i) => (
              <motion.circle key={i}
                cx={`${xPct}%`} cy={`${(i * 9 + 4) % 55}%`} r={1.5}
                fill="white"
                animate={{ opacity: [0.25, 0.9, 0.25] }}
                transition={{ duration: 2.2 + i * 0.28, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </svg>
        )}

        {/* Sun — daytime */}
        {isDaytime && (
          <motion.div
            style={{
              position: "absolute", top: "10%", right: "10%",
              width: 64, height: 64, borderRadius: "50%",
              background: "radial-gradient(circle, #FFE566 35%, #FFB300 100%)",
              boxShadow: `0 0 44px 22px rgba(255,190,0,0.38), 0 0 88px 44px rgba(255,150,0,0.16)`,
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Rising sun — dawn */}
        {slideIndex === 0 && (
          <motion.div
            style={{
              position: "absolute", right: "18%",
              width: 58, height: 58, borderRadius: "50%",
              background: "radial-gradient(circle, #FFE033 35%, #ff8c00 100%)",
              boxShadow: "0 0 55px 28px rgba(255,140,0,0.42)",
              pointerEvents: "none",
            }}
            initial={{ bottom: "-8%" }}
            animate={{ bottom: "18%" }}
            transition={{ duration: 4, ease: "easeOut" }}
          />
        )}

        {/* Clouds — daytime */}
        {isDaytime && (
          <>
            <motion.div
              style={{
                position: "absolute", top: "14%",
                width: 190, height: 52, borderRadius: 26,
                background: "rgba(255,255,255,0.9)",
                boxShadow: "36px -18px 0 10px rgba(255,255,255,0.9), -24px -12px 0 5px rgba(255,255,255,0.9), 85px -22px 0 16px rgba(255,255,255,0.9), 130px -12px 0 10px rgba(255,255,255,0.9)",
                pointerEvents: "none",
              }}
              animate={{ x: ["-250px", "110vw"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              style={{
                position: "absolute", top: "32%",
                width: 140, height: 38, borderRadius: 19,
                background: "rgba(255,255,255,0.78)",
                boxShadow: "26px -14px 0 7px rgba(255,255,255,0.78), 65px -16px 0 11px rgba(255,255,255,0.78), 95px -8px 0 7px rgba(255,255,255,0.78)",
                pointerEvents: "none",
              }}
              animate={{ x: ["-180px", "110vw"] }}
              transition={{ duration: 34, repeat: Infinity, ease: "linear", delay: 13 }}
            />
            <motion.div
              style={{
                position: "absolute", top: "52%",
                width: 100, height: 28, borderRadius: 14,
                background: "rgba(255,255,255,0.62)",
                boxShadow: "20px -10px 0 5px rgba(255,255,255,0.62), 48px -12px 0 8px rgba(255,255,255,0.62)",
                pointerEvents: "none",
              }}
              animate={{ x: ["-130px", "110vw"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 6 }}
            />
          </>
        )}

        {/* Horizon glow */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: "40%",
          background: `linear-gradient(to top, ${horizon}55 0%, transparent 100%)`,
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Scene props SVG — preserveAspectRatio="xMidYMax meet" keeps props grounded ── */}
      {/* Bottom edge always aligns with top of CSS ground strip */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMax meet"
        style={{
          position: "absolute",
          bottom: "26%",
          left: 0, right: 0,
          width: "100%",
          height: "74%",
          zIndex: 1,
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        {/* ── Slide 0: Dawn — PNG village huts ── */}
        {slideIndex === 0 && (
          <>
            {/* Big hut left — narrower wall, steeper roof */}
            <rect x={52}  y={158} width={94}  height={82}  rx={4} fill="#6b4228" stroke="#1a0800" strokeWidth={2.5} />
            <path d="M 38,161 Q 99,116 160,161 Z" fill="#3d2010" stroke="#1a0800" strokeWidth={2.5} />
            <rect x={90}  y={204} width={22}  height={36}  rx={3} fill="#1a0800" />
            <rect x={60}  y={174} width={20}  height={14}  rx={2} fill="#FFD93D" opacity={0.6} stroke="#1a0800" strokeWidth={1.5} />
            <rect x={118} y={174} width={20}  height={14}  rx={2} fill="#FFD93D" opacity={0.6} stroke="#1a0800" strokeWidth={1.5} />
            {/* Smaller hut right */}
            <rect x={242} y={172} width={78}  height={68}  rx={4} fill="#4a2e18" stroke="#1a0800" strokeWidth={2} />
            <path d="M 230,175 Q 281,136 332,175 Z" fill="#2e1a08" stroke="#1a0800" strokeWidth={2} />
            <rect x={272} y={208} width={18}  height={32}  rx={2} fill="#1a0800" />
            <rect x={250} y={185} width={16}  height={12}  rx={2} fill="#FFD93D" opacity={0.5} stroke="#1a0800" strokeWidth={1.5} />
          </>
        )}

        {/* ── Slide 1: Village — house + palms right ── */}
        {slideIndex === 1 && (
          <>
            {/* House — ~100 units tall (y=140→240) */}
            <rect x={182} y={140} width={130} height={100} rx={4} fill="#3d2518" stroke="#1a0800" strokeWidth={2.5} />
            <path d="M 166,143 Q 247,100 328,143 Z" fill="#2a1a10" stroke="#1a0800" strokeWidth={2.5} />
            <rect x={232} y={198} width={28}  height={42}  rx={2} fill="#1a0800" />
            <rect x={190} y={158} width={26}  height={18}  rx={2} fill="#FFD93D" opacity={0.45} stroke="#1a0800" strokeWidth={1.5} />
            <rect x={270} y={158} width={26}  height={18}  rx={2} fill="#FFD93D" opacity={0.45} stroke="#1a0800" strokeWidth={1.5} />
            {/* Palm 1 — ~130 units tall (y=108→240) */}
            <rect x={346} y={108} width={11}  height={132} rx={5} fill="#5c3317" stroke="#1a0800" strokeWidth={2} />
            <ellipse cx={352} cy={102} rx={34} ry={26} fill="#2d6a1a" stroke="#1a4006" strokeWidth={2} />
            <ellipse cx={352} cy={102} rx={22} ry={16} fill="#3d8a2a" />
            {/* Palm 2 — ~118 units tall (y=122→240) */}
            <rect x={382} y={122} width={9}   height={118} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <ellipse cx={387} cy={116} rx={28} ry={20} fill="#2d6a1a" stroke="#1a4006" strokeWidth={1.5} />
            <ellipse cx={387} cy={116} rx={18} ry={12} fill="#3d8a2a" />
          </>
        )}

        {/* ── Slide 2: Walking — dirt path + trees right ── */}
        {slideIndex === 2 && (
          <>
            {/* Shorter path — vanishes at y=100 so sign stays visible */}
            <polygon points="155,240 245,240 218,100 182,100" fill="#8B5A2B" opacity={0.55} />
            {/* Market sign — just above path vanishing point */}
            <rect x={168} y={78}  width={66} height={26} rx={5} fill="#8B5A2B" stroke="#1a0800" strokeWidth={2} />
            <text x={201} y={96} textAnchor="middle" fontSize={12} fontWeight={900} fill="#FFD93D" fontFamily="'Baloo 2', cursive">MAKET</text>
            {/* Tree 1 */}
            <rect x={300} y={108} width={10} height={132} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <ellipse cx={305} cy={102} rx={30} ry={22} fill="#2d6a1a" stroke="#1a4006" strokeWidth={2} />
            <ellipse cx={305} cy={102} rx={20} ry={14} fill="#3d8a2a" />
            {/* Tree 2 */}
            <rect x={356} y={120} width={9}  height={120} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <ellipse cx={361} cy={114} rx={26} ry={19} fill="#2d6a1a" stroke="#1a4006" strokeWidth={1.5} />
            <ellipse cx={361} cy={114} rx={17} ry={12} fill="#3d8a2a" />
          </>
        )}

        {/* ── Slides 3 & 4: Market stall ── */}
        {(slideIndex === 3 || slideIndex === 4) && (
          <>
            <rect x={18}  y={140} width={14} height={100} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <rect x={136} y={140} width={14} height={100} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <rect x={12}  y={132} width={148} height={16} rx={4} fill="#e65100" stroke="#1a0800" strokeWidth={2} />
            <rect x={12}  y={142} width={148} height={10} rx={3} fill="#ff7043" opacity={0.55} />
          </>
        )}

        {/* ── Slides 5 & 6: Coconut palm + water strip ── */}
        {(slideIndex === 5 || slideIndex === 6) && (
          <>
            <rect x={298} y={108} width={12} height={132} rx={6} fill="#8B5A2B" stroke="#1a0800" strokeWidth={2} />
            <ellipse cx={304} cy={102} rx={38} ry={28} fill="#2d6a1a" stroke="#1a4006" strokeWidth={2} />
            <ellipse cx={304} cy={102} rx={25} ry={18} fill="#3d8a2a" />
            <rect x={0}   y={218} width={400} height={22} fill="rgba(0,180,240,0.18)" />
          </>
        )}

        {/* ── Slide 7: Table with glow ── */}
        {slideIndex === 7 && (
          <>
            <rect x={90}  y={188} width={220} height={20} rx={6} fill="#5c3317" stroke="#1a0800" strokeWidth={2} />
            <rect x={100} y={208} width={12}  height={32} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <rect x={288} y={208} width={12}  height={32} rx={4} fill="#5c3317" stroke="#1a0800" strokeWidth={1.5} />
            <line x1={200} y1={60} x2={200} y2={188} stroke="rgba(82,183,136,0.35)" strokeWidth={2} strokeDasharray="5 4" />
          </>
        )}

        {/* ── Slide 8: Celebration fireworks ── */}
        {slideIndex === 8 && (
          <>
            {[70, 200, 330].map((cx, i) => (
              <motion.g key={i}>
                {[0,45,90,135,180,225,270,315].map((angle, j) => {
                  const rad = (angle * Math.PI) / 180;
                  const r = 50 + i * 14;
                  return (
                    <motion.line key={j}
                      x1={cx} y1={50 + i * 55}
                      x2={cx + r * Math.cos(rad)} y2={50 + i * 55 + r * Math.sin(rad)}
                      stroke={["#FFD93D","#52B788","#E63946"][j % 3]}
                      strokeWidth={2.5} strokeLinecap="round"
                      animate={{ opacity: [0, 0.85, 0], scale: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, delay: i * 0.3 + j * 0.04, repeat: Infinity, repeatDelay: 0.8 }}
                      style={{ transformOrigin: `${cx}px ${50 + i * 55}px` }}
                    />
                  );
                })}
              </motion.g>
            ))}
          </>
        )}

        {/* ── Slide 9: Trophy pedestal ── */}
        {slideIndex === 9 && (
          <>
            <polygon points="148,228 252,228 270,240 130,240" fill="#FFD93D" opacity={0.85} />
            <rect x={174} y={178} width={52} height={50} rx={4} fill="#FFD93D" opacity={0.9} />
            <rect x={164} y={174} width={72} height={12} rx={4} fill="#FFA000" />
            <polygon points="200,30 170,174 230,174" fill="rgba(255,255,255,0.06)" />
            <motion.text x={200} y={216} textAnchor="middle" fontSize={26} fill="#1a0a00"
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ transformOrigin: "200px 200px" }}
            >🏆</motion.text>
          </>
        )}
      </svg>
    </>
  );
}

// ── Ambient floating particles — PNG cultural SVG shapes ──────────────────
// 4 shape types drawn as SVG: kina-shell ring, bilum-diamond, hibiscus flower, leaf
function AmbientShape({ type, color, size }: { type: number; color: string; size: number }) {
  if (type === 0) return ( // Kina shell — concentric ring
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={2.5} />
      <circle cx={12} cy={12} r={6}  fill="none" stroke={color} strokeWidth={1.8} />
      <circle cx={12} cy={12} r={2.5} fill={color} />
    </svg>
  );
  if (type === 1) return ( // Bilum diamond — traditional woven pattern
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon points="12,2 22,12 12,22 2,12" fill={color} />
      <polygon points="12,7 17,12 12,17 7,12" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
  if (type === 2) return ( // Hibiscus — PNG national flower
    <svg width={size} height={size} viewBox="0 0 24 24">
      <ellipse cx={12} cy={5}  rx={3.5} ry={6}   fill={color} />
      <ellipse cx={19} cy={12} rx={6}   ry={3.5}  fill={color} />
      <ellipse cx={12} cy={19} rx={3.5} ry={6}   fill={color} />
      <ellipse cx={5}  cy={12} rx={6}   ry={3.5}  fill={color} />
      <circle  cx={12} cy={12} r={3.5}  fill="rgba(255,255,255,0.65)" />
    </svg>
  );
  // type === 3 — PNG leaf / fern frond
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12,2 Q20,8 20,16 Q16,22 12,23 Q8,22 4,16 Q4,8 12,2 Z" fill={color} />
      <line x1={12} y1={3} x2={12} y2={22} stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} />
      <line x1={12} y1={8}  x2={7}  y2={12} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      <line x1={12} y1={13} x2={17} y2={17} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
    </svg>
  );
}

function AmbientParticles({ slideIndex }: { slideIndex: number }) {
  // PNG flag + tropical palette per scene
  const palettes = [
    ["#E63946","#FFD93D"],   // 0 dawn
    ["#52B788","#A8DADC"],   // 1 village
    ["#40c4ff","#52B788"],   // 2 walking
    ["#FFD93D","#E63946"],   // 3 mango
    ["#ffd54f","#ff6b35"],   // 4 basket
    ["#00bcd4","#A8DADC"],   // 5 coconut
    ["#7c4dff","#52B788"],   // 6 basket2
    ["#52B788","#FFD93D"],   // 7 add
    ["#FFD93D","#E63946"],   // 8 win
    ["#7c4dff","#A8DADC"],   // 9 turn
  ];
  const cols = palettes[slideIndex % palettes.length];

  // 8 particles — smaller sizes, spawn only from top so they don't clutter the scene
  const particles = [
    { type: 1, size: 20, left: "6%",  startY: "-40px", dur: 12, delay: 0,   xDrift: [0, 18, -8, 0],  spinDir:  1 },
    { type: 2, size: 24, left: "18%", startY: "-40px", dur: 15, delay: 1.2, xDrift: [0, -20, 10, 0], spinDir: -1 },
    { type: 0, size: 18, left: "32%", startY: "-40px", dur: 11, delay: 0.5, xDrift: [0, 14, -6, 0],  spinDir:  1 },
    { type: 3, size: 22, left: "48%", startY: "-40px", dur: 14, delay: 2,   xDrift: [0, -16, 8, 0],  spinDir: -1 },
    { type: 1, size: 18, left: "62%", startY: "-40px", dur: 13, delay: 0.8, xDrift: [0, 16, -8, 0],  spinDir:  1 },
    { type: 2, size: 20, left: "74%", startY: "-40px", dur: 16, delay: 1.6, xDrift: [0, -14, 7, 0],  spinDir: -1 },
    { type: 3, size: 16, left: "84%", startY: "-40px", dur: 10, delay: 0.3, xDrift: [0, 12, -6, 0],  spinDir:  1 },
    { type: 0, size: 22, left: "44%", startY: "-40px", dur: 13, delay: 2.5, xDrift: [0, -18, 9, 0],  spinDir: -1 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {particles.map((p, i) => (
        <motion.div key={i}
          style={{ position: "absolute", left: p.left, top: p.startY, opacity: 0 }}
          animate={{
            y:       ["0px", "110vh"],
            x:       p.xDrift,
            rotate:  [0, p.spinDir * 270, p.spinDir * 540],
            scale:   [0.6, 1.15, 0.95, 1.05, 1],
            opacity: [0, 0.28, 0.28, 0.18, 0],
          }}
          transition={{
            duration: p.dur,
            repeat:   Infinity,
            delay:    p.delay,
            ease:     "easeInOut",
            times:    [0, 0.12, 0.5, 0.88, 1],
          }}
        >
          <AmbientShape type={p.type} color={cols[i % 2]} size={p.size} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Subtle PNG map background overlay ────────────────────────────────────
// Simplified silhouette of Papua New Guinea in a 360×240 viewBox.
// Rendered as a semi-transparent fill behind all characters.
function PNGMapBackground() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 2,
      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
      pointerEvents: "none", overflow: "hidden",
      paddingRight: "4%", paddingBottom: "32%",
    }}>
      <motion.svg
        viewBox="0 0 360 240"
        width="38%" height="auto"
        style={{ maxWidth: 180, opacity: 0 }}
        animate={{ opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* PNG mainland silhouette — simplified path */}
        <path
          d={`
            M 18,68
            Q 45,38 90,34
            Q 135,30 175,38
            Q 210,44 235,52
            Q 252,56 262,48
            L 278,44
            Q 292,46 298,60
            L 295,78
            Q 308,95 318,118
            Q 325,140 315,162
            Q 305,182 285,194
            Q 260,208 228,216
            Q 195,224 162,220
            Q 130,218 108,208
            Q 88,198 72,182
            Q 52,162 38,140
            Q 22,115 18,90
            Z
          `}
          fill="white"
          stroke="white"
          strokeWidth={1}
        />

        {/* Coastal detail lines for texture */}
        <path
          d="M 60,55 Q 110,36 175,40 Q 235,46 275,52"
          fill="none" stroke="white" strokeWidth={0.8} opacity={0.5}
          strokeDasharray="4 3"
        />
        <path
          d="M 30,110 Q 50,165 90,195 Q 140,220 200,218"
          fill="none" stroke="white" strokeWidth={0.8} opacity={0.5}
          strokeDasharray="4 3"
        />

        {/* Grid of small cross marks — traditional map aesthetic */}
        {[
          [100,80],[150,70],[200,75],[250,85],
          [80,120],[130,110],[180,115],[240,120],[290,130],
          [100,155],[155,150],[210,155],[265,160],
          [120,190],[175,188],[230,192],
        ].map(([x, y], i) => (
          <g key={i} opacity={0.4}>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke="white" strokeWidth={0.7} />
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="white" strokeWidth={0.7} />
          </g>
        ))}

        {/* "Papua New Guinea" label */}
        <text x="180" y="132" textAnchor="middle"
          fontSize="11" fill="white" opacity={0.45}
          fontFamily="'Baloo 2', cursive" letterSpacing="2" fontWeight="900">
          PAPUA NEW GUINEA
        </text>
      </motion.svg>
    </div>
  );
}

// ── Speech bubble ─────────────────────────────────────────────────────────
function SpeechBubble({ words, en, litWordIdx }: { words: string[]; en: string; litWordIdx: number }) {
  return (
    <motion.div
      className="mcl-speech"
      key={words.join("")}
      initial={{ scale: 0, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
    >
      {/* Bilum woven stripe — traditional PNG pattern across bubble top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 6,
        borderRadius: "20px 20px 0 0",
        background: "repeating-linear-gradient(90deg,#E63946 0,#E63946 5px,#000 5px,#000 10px,#FFD93D 10px,#FFD93D 15px,#000 15px,#000 20px)",
        pointerEvents: "none",
      }} />
      <div className="mcl-speech-tok" style={{ marginTop: 8 }}>
        {words.map((w, i) => (
          <motion.span key={i}
            animate={litWordIdx === i
              ? { scale: 1.22, color: "#FFD93D", y: -3 }
              : { scale: 1, color: "#fff", y: 0 }
            }
            transition={{ duration: 0.15 }}
            style={{ display: "inline-block", marginRight: 4 }}
          >{w}</motion.span>
        ))}
      </div>
      <div className="mcl-speech-en">{en}</div>
    </motion.div>
  );
}

// ── Chalkboard activity panel ─────────────────────────────────────────────
function ChalkboardPanel({
  activity, actSelected, actWrong, onAnswer, beniStateRef,
}: {
  activity: MathsActivity;
  actSelected: string | null;
  actWrong: string | null;
  onAnswer: (v: string) => void;
  beniStateRef: React.MutableRefObject<(s: BeniState) => void>;
}) {
  return (
    <motion.div
      className="mcl-chalkboard"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "105%" }}
      transition={{ type: "spring", bounce: 0.22, duration: 0.55 }}
    >
      <div className="chk-label">{activity.label}</div>
      <div className="chk-q">{activity.q}</div>
      <div className="chk-tok">{activity.tok}</div>
      {activity.visual && (
        <div className="chk-visual">{activity.visual}</div>
      )}
      <div className="chk-options">
        {activity.options.map((opt, i) => {
          const isCorrect = actSelected === opt.val;
          const isWrong   = actWrong === opt.val;
          return (
            <motion.button
              key={opt.val}
              className={`chk-opt${isCorrect ? " correct" : isWrong ? " wrong" : ""}`}
              whileHover={!actSelected ? { scale: 1.08, y: -5 } : {}}
              whileTap={!actSelected ? { scale: 0.91 } : {}}
              animate={isWrong ? { x: [-6, 6, -5, 5, 0] } : {}}
              initial={{ opacity: 0, y: 32 }}
              transition={isWrong
                ? { duration: 0.35 }
                : { delay: 0.18 + i * 0.1, type: "spring", bounce: 0.5 }
              }
              onClick={() => {
                if (!actSelected) onAnswer(opt.val);
              }}
              disabled={!!actSelected}
            >
              <div className="chk-opt-main">{opt.label}</div>
              <div className="chk-opt-tok">{opt.tok}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Correct glow overlay */}
      <AnimatePresence>
        {actSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, borderRadius: "28px 28px 0 0",
              background: "radial-gradient(ellipse at center top, rgba(82,183,136,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function MathsCartoonLesson({
  profile,
  lang,
  mathsPath,
  storyPage,
  litWordIdx,
  sessionMode,
  sessionProgress: _sessionProgress,
  actIdx,
  actSelected,
  actWrong,
  onNextStoryPage,
  onActivityAnswer,
  onLangToggle,
}: Props) {
  const activities = mathsPath === "sione" ? MATHS_ACTIVITIES_SIONE : MATHS_ACTIVITIES_MERI;
  const activity   = activities[actIdx] as MathsActivity | undefined;

  const [beniState, setBeniState] = useState<BeniState>("idle");
  const [interactionStep, setInteractionStep] = useState(0);
  const [addCombined, setAddCombined] = useState(false);
  const [flyingFruits, setFlyingFruits] = useState<FlyingFruit[]>([]);
  const [basketShake, setBasketShake] = useState(false);
  const beniStateCallbackRef = useRef<(s: BeniState) => void>(setBeniState);
  beniStateCallbackRef.current = setBeniState;

  // ── David encouragement system ──────────────────────────────────────────
  const [davidMsgIdx,  setDavidMsgIdx]  = useState(0);
  const [showDavidMsg, setShowDavidMsg] = useState(false);
  const davidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function triggerDavidMsg(idx?: number) {
    if (davidTimerRef.current) clearTimeout(davidTimerRef.current);
    setDavidMsgIdx(idx !== undefined ? idx : Math.floor(Math.random() * DAVID_MESSAGES.length));
    setShowDavidMsg(true);
    davidTimerRef.current = setTimeout(() => {
      setShowDavidMsg(false);
    }, 3400);
  }

  // Cleanup timer on unmount
  useEffect(() => () => { if (davidTimerRef.current) clearTimeout(davidTimerRef.current); }, []);

  // Welcome message 2 s after lesson starts
  useEffect(() => {
    const t = setTimeout(() => triggerDavidMsg(0), 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire encouragement every 2nd story slide (pages 2, 4, 6, 8 …)
  useEffect(() => {
    if (storyPage > 0 && storyPage % 2 === 0) {
      const t = setTimeout(() => triggerDavidMsg(), 1000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyPage]);

  const slide = MATHS_STORY_PAGES[storyPage];
  const isTapCount = slide?.interactive === "tap-count";
  const isTapAdd   = slide?.interactive === "tap-add";
  const tapTarget  = isTapCount ? (slide?.tapCount ?? 0) : isTapAdd ? 1 : 0;
  const interactionDone = slide?.interactive ? interactionStep >= tapTarget : true;

  // Reset interaction when page changes
  useEffect(() => {
    setInteractionStep(0);
    setAddCombined(false);
    setFlyingFruits([]);
    setBeniState("idle");
  }, [storyPage]);

  // React to answer events
  const prevActSelected = useRef<string | null>(null);
  const prevActWrong    = useRef<string | null>(null);
  useEffect(() => {
    if (actSelected && actSelected !== prevActSelected.current) {
      prevActSelected.current = actSelected;
      setBeniState("correct");
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 }, colors: ["#FFD93D","#52B788","#A8DADC"] });
      setTimeout(() => setBeniState("idle"), 1400);
      // David celebrates correct answer
      triggerDavidMsg(Math.floor(Math.random() * DAVID_MESSAGES.length));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actSelected]);
  useEffect(() => {
    if (actWrong && actWrong !== prevActWrong.current) {
      prevActWrong.current = actWrong;
      setBeniState("sad");
      setTimeout(() => setBeniState("idle"), 1000);
    }
  }, [actWrong]);
  useEffect(() => {
    prevActSelected.current = null;
    prevActWrong.current    = null;
  }, [actIdx]);

  // Physics fruit tap handler
  function handleFruitTap() {
    if (interactionStep >= tapTarget || !slide) return;
    const fruit: FlyingFruit = {
      id: Date.now(),
      emoji: slide.tapEmoji ?? "🥭",
      startX: 26,   // tree centre (% of viewport from left)
      startY: 45,   // mango height in tree (% from top)
    };
    setFlyingFruits(prev => [...prev, fruit]);
    setTimeout(() => {
      setFlyingFruits(prev => prev.filter(f => f.id !== fruit.id));
      setBasketShake(true);
      setTimeout(() => setBasketShake(false), 500);
      const next = interactionStep + 1;
      setInteractionStep(next);
      setBeniState("excited");
      setTimeout(() => setBeniState("idle"), 900);
    }, 680);
  }

  function handleTapAdd() {
    if (addCombined || !slide) return;
    setInteractionStep(1);
    setAddCombined(true);
    setBeniState("correct");
    confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 }, colors: ["#52B788","#FFD93D"] });
    setTimeout(() => setBeniState("idle"), 1200);
  }

  // Determine Beni state on story slides
  const displayBeniState: BeniState = sessionMode === "activity"
    ? beniState
    : storyPage === 2 ? "walk"
    : storyPage === 9 ? "excited"
    : storyPage === 8 ? "correct"
    : beniState;

  const beniSize = storyPage === 8 ? 158 : 140;

  // ── Full-screen assessment takes over entirely ──
  if (sessionMode === "activity" && activity) {
    return (
      <AssessmentScreen
        activity={activity}
        actIdx={actIdx}
        totalActs={activities.length}
        actSelected={actSelected}
        actWrong={actWrong}
        lang={lang}
        profile={profile}
        onAnswer={onActivityAnswer}
        onNext={onNextStoryPage}
        onLangToggle={onLangToggle}
      />
    );
  }

  return (
    <div className="mcl-screen">

      {/* Layer 0 — Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${storyPage}`}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SceneBackground slideIndex={storyPage} />
        </motion.div>
      </AnimatePresence>

      {/* Layer 1 — Ambient particles (hidden during activity to avoid clutter) */}
      {sessionMode === "story" && <AmbientParticles slideIndex={storyPage} />}

      {/* Layer 1.5 — Subtle PNG map silhouette */}
      <PNGMapBackground />

      {/* Layer 1.8 — CSS ground strip (always anchored to screen bottom regardless of SVG crop) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ground-${storyPage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "26%",
            background: SCENE_GROUND[Math.min(storyPage, SCENE_GROUND.length - 1)],
            borderTop: `3px solid ${SCENE_HORIZON[Math.min(storyPage, SCENE_HORIZON.length - 1)]}`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {/* Grass tufts along ground top edge */}
          <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="none"
            style={{ position: "absolute", top: -14, left: 0 }}>
            {[14,38,66,94,122,150,178,206,234,262,290,318,346,374].map((x, i) => (
              <g key={i}>
                <path d={`M${x},14 Q${x-3},0 ${x+2},6`}   stroke="#1a0800" strokeWidth={3}   fill="none" strokeLinecap="round" />
                <path d={`M${x},14 Q${x-3},0 ${x+2},6`}   stroke="#4aaa28" strokeWidth={2}   fill="none" strokeLinecap="round" />
                <path d={`M${x+8},14 Q${x+10},1 ${x+7},7`} stroke="#1a0800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                <path d={`M${x+8},14 Q${x+10},1 ${x+7},7`} stroke="#5abe30" strokeWidth={1.8} fill="none" strokeLinecap="round" />
              </g>
            ))}
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Layer 2 — HUD strip */}
      <div className="mcl-hud">
        <div className="mcl-slide-counter">{storyPage + 1} / {MATHS_STORY_PAGES.length}</div>
        <PNGJourneyMap step={storyPage} />
      </div>

      {/* Layer 3 — Characters + interactive scene */}
      <div className="mcl-characters">

        {/* ── Beni walk-in/out ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`beni-${storyPage}`}
            style={{
              position: "absolute",
              bottom: sessionMode === "activity" ? "54%" : "24%",
              left: storyPage >= 7 ? "4%" : isTapCount ? "38%" : storyPage >= 4 ? "6%" : "8%",
              zIndex: 8,
              transition: "bottom 0.4s ease",
            }}
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.28, duration: 0.55 }}
          >
            <BeniCharacter state={displayBeniState} size={beniSize} />
          </motion.div>
        </AnimatePresence>

        {/* ── Tap-count interactive: tappable items + basket ── */}
        {isTapCount && sessionMode === "story" && (
          <>
            {/* Tree / source — left side (SVG, no emoji) */}
            <motion.div
              style={{
                position: "absolute", left: "4%", bottom: "24%",
                cursor: "pointer", userSelect: "none", zIndex: 9,
                width: storyPage === 4 ? 260 : 200, height: storyPage === 4 ? 340 : 280,
                pointerEvents: "all",
              }}
              whileTap={{ scale: 0.93 }}
              animate={{ rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              onClick={handleFruitTap}
            >
              {storyPage === 3 ? (
                /* ── Cartoon mango tree — Chhota Bheem style: thick outlines, baked shadows ── */
                <svg viewBox="0 0 130 180" width={200} height={280} style={{ overflow: "visible" }}>
                  {/* Ground shadow blob */}
                  <ellipse cx={68} cy={175} rx={56} ry={9}  fill="rgba(0,0,0,0.22)" />
                  {/* Ground patch */}
                  <ellipse cx={65} cy={172} rx={52} ry={9}  fill="#2d6614" stroke="#1a0800" strokeWidth={2} />
                  <ellipse cx={65} cy={172} rx={40} ry={6.5} fill="#3d8a1e" />

                  {/* Grass tufts — thick outlines */}
                  {[22,40,58,78,96,110].map((x,i) => (
                    <g key={i}>
                      <path d={`M${x},172 Q${x-3},159 ${x+1},165`} stroke="#1a0800" strokeWidth={4}   fill="none" strokeLinecap="round" />
                      <path d={`M${x},172 Q${x-3},159 ${x+1},165`} stroke="#4aaa28" strokeWidth={3}   fill="none" strokeLinecap="round" />
                      <path d={`M${x+5},172 Q${x+6},157 ${x+4},164`} stroke="#1a0800" strokeWidth={3.5} fill="none" strokeLinecap="round" />
                      <path d={`M${x+5},172 Q${x+6},157 ${x+4},164`} stroke="#5abe30" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                    </g>
                  ))}

                  {/* Root shadow blobs */}
                  <path d="M 52,152 Q 38,162 20,170" stroke="#3d1a06" strokeWidth={10} fill="none" strokeLinecap="round" />
                  <path d="M 78,152 Q 92,162 110,170" stroke="#3d1a06" strokeWidth={10} fill="none" strokeLinecap="round" />
                  {/* Roots — gnarled, spread wide */}
                  <path d="M 50,150 Q 36,160 18,169" stroke="#1a0800" strokeWidth={8}   fill="none" strokeLinecap="round" />
                  <path d="M 50,150 Q 36,160 18,169" stroke="#8B5A2B" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 80,150 Q 94,160 112,169" stroke="#1a0800" strokeWidth={8}   fill="none" strokeLinecap="round" />
                  <path d="M 80,150 Q 94,160 112,169" stroke="#8B5A2B" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 57,153 Q 42,166 28,173"  stroke="#1a0800" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 57,153 Q 42,166 28,173"  stroke="#a06830" strokeWidth={4}   fill="none" strokeLinecap="round" />
                  <path d="M 73,153 Q 88,166 102,173" stroke="#1a0800" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 73,153 Q 88,166 102,173" stroke="#a06830" strokeWidth={4}   fill="none" strokeLinecap="round" />

                  {/* Trunk shadow blob */}
                  <path d="M 60,152 Q 56,104 58,74 Q 70,70 82,74 Q 84,104 76,152 Z" fill="#3d1a06" />
                  {/* Trunk main body */}
                  <path d="M 50,152 Q 44,102 46,70 Q 60,64 84,70 Q 88,102 80,152 Z" fill="#a06830" />
                  {/* Trunk highlight strip */}
                  <path d="M 50,152 Q 46,102 48,70 L 57,70 Q 55,102 56,152 Z" fill="#c07840" opacity={0.6} />
                  {/* Trunk outline */}
                  <path d="M 50,152 Q 44,102 46,70 Q 60,64 84,70 Q 88,102 80,152"
                    fill="none" stroke="#1a0800" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />

                  {/* Bark texture lines */}
                  <path d="M 53,108 Q 66,103 79,108" stroke="#1a0800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                  <path d="M 52,122 Q 65,117 79,122" stroke="#1a0800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                  <path d="M 53,136 Q 65,131 78,136" stroke="#1a0800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                  <path d="M 54,94  Q 66,90  77,94"  stroke="#1a0800" strokeWidth={2}   fill="none" strokeLinecap="round" />

                  {/* Knot hole */}
                  <ellipse cx={64} cy={84} rx={9}   ry={11}  fill="#1a0800" />
                  <ellipse cx={64} cy={84} rx={5.5} ry={7.5} fill="#0a0400" />
                  <path d="M 57,82 Q 64,79 71,82" stroke="#c07840" strokeWidth={1.5} fill="none" strokeLinecap="round" />

                  {/* ── Canopy shadow blob ── */}
                  <circle cx={68} cy={54} r={52} fill="#1a4006" opacity={0.7} />
                  {/* Canopy layers (back → front) */}
                  <circle cx={63} cy={47} r={50} fill="#2d7a10" />
                  <circle cx={42} cy={56} r={34} fill="#2d7a10" />
                  <circle cx={88} cy={54} r={32} fill="#2d7a10" />
                  <circle cx={63} cy={44} r={46} fill="#3d9420" />
                  <circle cx={44} cy={52} r={30} fill="#3d9420" />
                  <circle cx={86} cy={50} r={28} fill="#3d9420" />
                  <circle cx={65} cy={34} r={32} fill="#4ebc2a" />
                  <circle cx={52} cy={26} r={20} fill="#5ece30" />
                  <circle cx={74} cy={22} r={17} fill="#5ece30" />
                  <circle cx={44} cy={36} r={13} fill="#72de3e" opacity={0.9} />
                  <circle cx={50} cy={20} r={9}  fill="#88f048" opacity={0.7} />
                  <circle cx={72} cy={17} r={7}  fill="#98f858" opacity={0.55} />

                  {/* Mangoes peeking through canopy — thick outlines */}
                  {/* Shadow blobs for mangoes */}
                  <ellipse cx={44} cy={66} rx={9}   ry={11}  fill="#1a0800" opacity={0.4} />
                  <ellipse cx={86} cy={62} rx={8}   ry={10}  fill="#1a0800" opacity={0.4} />
                  <ellipse cx={68} cy={70} rx={8.5} ry={10.5} fill="#1a0800" opacity={0.4} />
                  {/* Mango fills */}
                  <ellipse cx={42} cy={64} rx={8}   ry={10}  fill="#ffc400" />
                  <ellipse cx={42} cy={64} rx={8}   ry={10}  fill="none" stroke="#1a0800" strokeWidth={2.5} />
                  <line   x1={42} y1={54} x2={44}  y2={50}  stroke="#1a0800" strokeWidth={2.5} strokeLinecap="round" />
                  <line   x1={42} y1={54} x2={44}  y2={50}  stroke="#2d7a10" strokeWidth={1.5} strokeLinecap="round" />

                  <ellipse cx={84} cy={60} rx={7}   ry={9}   fill="#ff6200" />
                  <ellipse cx={84} cy={60} rx={7}   ry={9}   fill="none" stroke="#1a0800" strokeWidth={2.5} />
                  <line   x1={84} y1={51} x2={82}  y2={47}  stroke="#1a0800" strokeWidth={2.5} strokeLinecap="round" />
                  <line   x1={84} y1={51} x2={82}  y2={47}  stroke="#2d7a10" strokeWidth={1.5} strokeLinecap="round" />

                  <ellipse cx={66} cy={68} rx={7.5} ry={9.5} fill="#ff9000" />
                  <ellipse cx={66} cy={68} rx={7.5} ry={9.5} fill="none" stroke="#1a0800" strokeWidth={2.5} />
                  <line   x1={66} y1={59} x2={67}  y2={55}  stroke="#1a0800" strokeWidth={2.5} strokeLinecap="round" />
                  <line   x1={66} y1={59} x2={67}  y2={55}  stroke="#2d7a10" strokeWidth={1.5} strokeLinecap="round" />

                  {/* Canopy outer outlines — thick Chhota Bheem */}
                  <circle cx={63} cy={47} r={50} fill="none" stroke="#1a0800" strokeWidth={4} />
                  <circle cx={42} cy={56} r={34} fill="none" stroke="#1a0800" strokeWidth={3} />
                  <circle cx={88} cy={54} r={32} fill="none" stroke="#1a0800" strokeWidth={3} />
                </svg>
              ) : (
                /* ── Cartoon coconut palm — Chhota Bheem style: thick outlines, baked shadows ── */
                <svg viewBox="0 0 130 180" width={260} height={340} style={{ overflow: "visible" }}>
                  {/* Ground shadow blob */}
                  <ellipse cx={68} cy={175} rx={52} ry={9}  fill="rgba(0,0,0,0.22)" />
                  {/* Ground patch */}
                  <ellipse cx={65} cy={172} rx={48} ry={9}  fill="#2d6614" stroke="#1a0800" strokeWidth={2} />
                  <ellipse cx={65} cy={172} rx={36} ry={6}  fill="#3d8a1e" />

                  {/* Grass tufts — thick outlines */}
                  {[28,44,60,76,92,105].map((x,i) => (
                    <g key={i}>
                      <path d={`M${x},172 Q${x-2},160 ${x+1},166`} stroke="#1a0800" strokeWidth={4}   fill="none" strokeLinecap="round" />
                      <path d={`M${x},172 Q${x-2},160 ${x+1},166`} stroke="#4aaa28" strokeWidth={3}   fill="none" strokeLinecap="round" />
                      <path d={`M${x+4},172 Q${x+5},158 ${x+3},165`} stroke="#1a0800" strokeWidth={3.5} fill="none" strokeLinecap="round" />
                      <path d={`M${x+4},172 Q${x+5},158 ${x+3},165`} stroke="#5abe30" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                    </g>
                  ))}

                  {/* Root shadow blobs */}
                  <path d="M 57,154 Q 41,164 27,171" stroke="#3d1a06" strokeWidth={10} fill="none" strokeLinecap="round" />
                  <path d="M 73,154 Q 87,164 101,171" stroke="#3d1a06" strokeWidth={10} fill="none" strokeLinecap="round" />
                  {/* Roots */}
                  <path d="M 56,152 Q 40,162 26,170" stroke="#1a0800" strokeWidth={8}   fill="none" strokeLinecap="round" />
                  <path d="M 56,152 Q 40,162 26,170" stroke="#8B5A2B" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 74,152 Q 88,162 102,170" stroke="#1a0800" strokeWidth={8}   fill="none" strokeLinecap="round" />
                  <path d="M 74,152 Q 88,162 102,170" stroke="#8B5A2B" strokeWidth={6}   fill="none" strokeLinecap="round" />
                  <path d="M 58,154 Q 44,165 32,172" stroke="#1a0800" strokeWidth={5.5} fill="none" strokeLinecap="round" />
                  <path d="M 58,154 Q 44,165 32,172" stroke="#a06830" strokeWidth={3.5} fill="none" strokeLinecap="round" />

                  {/* Trunk shadow blob */}
                  <path d="M 56,157 Q 52,110 56,73 Q 62,69 78,73 Q 82,110 78,157 Z" fill="#3d1a06" />
                  {/* Trunk main */}
                  <path d="M 53,157 Q 48,108 52,70 Q 58,65 74,70 Q 78,108 77,157 Z" fill="#a06830" />
                  {/* Trunk highlight */}
                  <path d="M 53,157 Q 50,108 54,70 L 60,70 Q 57,108 58,157 Z" fill="#c07840" opacity={0.55} />
                  {/* Bark ring marks */}
                  {[90,105,120,138].map((y,i) => (
                    <path key={i} d={`M 54,${y} Q 65,${y-4} 76,${y}`} stroke="#1a0800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                  ))}
                  {/* Trunk outline */}
                  <path d="M 53,157 Q 48,108 52,70 Q 58,65 74,70 Q 78,108 77,157"
                    fill="none" stroke="#1a0800" strokeWidth={4} strokeLinecap="round" />

                  {/* Frond shadow outlines first */}
                  {[
                    { d: "M63,68 Q 30,50 10,38" },
                    { d: "M63,68 Q 42,42 36,20"  },
                    { d: "M63,68 Q 56,38 58,10"  },
                    { d: "M63,68 Q 72,36 82,14"  },
                    { d: "M63,68 Q 86,44 104,36" },
                    { d: "M63,68 Q 90,60 116,58" },
                  ].map(({ d }, i) => (
                    <path key={i} d={d} stroke="#1a0800" strokeWidth={13} fill="none" strokeLinecap="round" />
                  ))}
                  {/* Fronds — thick, feathery */}
                  {[
                    { d: "M63,68 Q 30,50 10,38", col: "#2d7a10" },
                    { d: "M63,68 Q 42,42 36,20",  col: "#3d9420" },
                    { d: "M63,68 Q 56,38 58,10",  col: "#2d7a10" },
                    { d: "M63,68 Q 72,36 82,14",  col: "#3d9420" },
                    { d: "M63,68 Q 86,44 104,36", col: "#2d7a10" },
                    { d: "M63,68 Q 90,60 116,58", col: "#3d9420" },
                  ].map(({ d, col }, i) => (
                    <path key={i} d={d} stroke={col} strokeWidth={9} fill="none" strokeLinecap="round" />
                  ))}
                  {/* Frond midrib highlight */}
                  {[
                    "M63,68 Q 30,50 10,38",
                    "M63,68 Q 56,38 58,10",
                    "M63,68 Q 86,44 104,36",
                  ].map((d, i) => (
                    <path key={i} d={d} stroke="#5ece30" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.75} />
                  ))}

                  {/* Crown base — shadow then fill */}
                  <circle cx={65} cy={68} r={14} fill="#1a4006" />
                  <circle cx={63} cy={68} r={13} fill="#4ebc2a" stroke="#1a0800" strokeWidth={3} />

                  {/* Coconuts — shadow blobs then fills */}
                  <circle cx={57} cy={74} r={11} fill="#1a0800" opacity={0.4} />
                  <circle cx={71} cy={72} r={10} fill="#1a0800" opacity={0.4} />
                  <circle cx={63} cy={80} r={9}  fill="#1a0800" opacity={0.4} />
                  <circle cx={55} cy={72} r={9}  fill="#8B5A2B" stroke="#1a0800" strokeWidth={2.5} />
                  <circle cx={69} cy={70} r={8}  fill="#7a4520" stroke="#1a0800" strokeWidth={2.5} />
                  <circle cx={61} cy={78} r={7}  fill="#a06830" stroke="#1a0800" strokeWidth={2.5} />
                  {/* Coconut highlights */}
                  <circle cx={53} cy={69} r={3}  fill="rgba(255,255,255,0.3)" />
                  <circle cx={67} cy={67} r={2.5} fill="rgba(255,255,255,0.25)" />
                </svg>
              )}
            </motion.div>

            {/* Tap hint */}
            {interactionStep < tapTarget && (
              <motion.div
                style={{
                  position: "absolute", left: "18%", top: "28%",
                  background: "rgba(255,217,61,0.95)",
                  borderRadius: 28, padding: "10px 22px",
                  fontSize: 16, fontWeight: 900, color: "#1a0a00",
                  zIndex: 10, pointerEvents: "none",
                  boxShadow: "0 4px 18px rgba(255,217,61,0.5)",
                }}
                animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {lang === "tok" ? "Pres!" : "Tap!"} ({interactionStep}/{tapTarget})
              </motion.div>
            )}

            {/* Basket — right side (SVG woven basket, no emoji) */}
            <motion.div
              style={{
                position: "absolute", right: "8%", bottom: "24%",
                zIndex: 9, width: 160, height: 160,
              }}
              animate={basketShake
                ? { rotate: [-5, 5, -4, 4, 0], y: [0, -8, 0] }
                : { rotate: [0, 1, -1, 0] }
              }
              transition={basketShake ? { duration: 0.4 } : { duration: 3, repeat: Infinity }}
            >
              <svg viewBox="0 0 72 72" width={160} height={160}>
                {/* Ground shadow */}
                <ellipse cx={38} cy={69} rx={28} ry={5} fill="rgba(0,0,0,0.22)" />

                {/* Handle shadow */}
                <path d="M22,26 Q36,6 50,26" fill="none" stroke="#3d1a06" strokeWidth={8} strokeLinecap="round" />
                {/* Handle */}
                <path d="M20,24 Q36,4 52,24" fill="none" stroke="#1a0800" strokeWidth={8} strokeLinecap="round" />
                <path d="M20,24 Q36,4 52,24" fill="none" stroke="#8B5A2B" strokeWidth={5} strokeLinecap="round" />
                {/* Handle highlight */}
                <path d="M22,24 Q36,7 50,24" fill="none" stroke="#c07840" strokeWidth={2} strokeLinecap="round" opacity={0.6} />

                {/* Basket shadow blob */}
                <path d="M14,30 L22,66 L56,66 L64,30 Z" fill="#3d1a06" />
                {/* Basket body */}
                <path d="M10,28 L18,64 L54,64 L62,28 Z" fill="#e8913e" />
                {/* Left highlight panel */}
                <path d="M10,28 L18,64 L26,64 L18,28 Z" fill="rgba(255,180,100,0.3)" />
                {/* Woven horizontal stripes */}
                <path d="M11,36 L61,36" stroke="#1a0800" strokeWidth={2}   opacity={0.4} />
                <path d="M13,44 L59,44" stroke="#1a0800" strokeWidth={2}   opacity={0.4} />
                <path d="M15,52 L57,52" stroke="#1a0800" strokeWidth={2}   opacity={0.4} />
                <path d="M16,60 L56,60" stroke="#1a0800" strokeWidth={2}   opacity={0.4} />
                {/* Woven vertical stripes */}
                <path d="M22,28 L18,64" stroke="#1a0800" strokeWidth={1.5} opacity={0.3} />
                <path d="M36,28 L36,64" stroke="#1a0800" strokeWidth={1.5} opacity={0.3} />
                <path d="M50,28 L54,64" stroke="#1a0800" strokeWidth={1.5} opacity={0.3} />
                {/* Bilum weave colour bands */}
                <path d="M11,36 L61,36" stroke="#E63946" strokeWidth={1.5} opacity={0.55} />
                <path d="M13,44 L59,44" stroke="#FFD93D" strokeWidth={1.5} opacity={0.55} />
                <path d="M15,52 L57,52" stroke="#E63946" strokeWidth={1.5} opacity={0.55} />
                {/* Basket outline */}
                <path d="M10,28 L18,64 L54,64 L62,28 Z" fill="none" stroke="#1a0800" strokeWidth={3} strokeLinejoin="round" />
                {/* Top rim */}
                <path d="M10,28 L62,28" stroke="#1a0800" strokeWidth={4} strokeLinecap="round" />
                <path d="M11,28 L61,28" stroke="#c07840" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
              </svg>
            </motion.div>

            {/* Count badge pops from basket */}
            <AnimatePresence>
              {interactionStep > 0 && (
                <motion.div
                  key={`badge-${interactionStep}`}
                  style={{
                    position: "absolute", right: "8%", bottom: "47%",
                    width: 56, height: 56,
                    background: "linear-gradient(135deg, #FFD93D, #ff8f00)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, fontWeight: 900, color: "#1a0a00",
                    boxShadow: "0 0 28px rgba(255,217,61,0.85)",
                    fontFamily: "'Baloo 2', cursive",
                    zIndex: 12,
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: [0, 1.5, 1], y: -10 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "spring", bounce: 0.7 }}
                >
                  {interactionStep}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── Tap-add: two groups + PLUS button ── */}
        {isTapAdd && sessionMode === "story" && !addCombined && (
          <>
            {/* Group A — left of centre, above table */}
            <div style={{
              position: "absolute", left: "32%", top: "36%",
              display: "flex", gap: 8, zIndex: 9,
            }}>
              {[...Array(slide?.tapCountA ?? 0)].map((_, i) => (
                <motion.span key={i} style={{ fontSize: 44 }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                >{slide?.tapGroupA}</motion.span>
              ))}
            </div>

            {/* Group B — right of centre, above table */}
            <div style={{
              position: "absolute", right: "26%", top: "36%",
              display: "flex", gap: 8, zIndex: 9,
            }}>
              {[...Array(slide?.tapCountB ?? 0)].map((_, i) => (
                <motion.span key={i} style={{ fontSize: 44 }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
                >{slide?.tapGroupB}</motion.span>
              ))}
            </div>

            {/* PLUS button — centre */}
            <motion.button
              onClick={handleTapAdd}
              animate={{
                scale: [1, 1.12, 1],
                boxShadow: [
                  "0 0 18px rgba(82,183,136,0.5)",
                  "0 0 40px rgba(82,183,136,0.95)",
                  "0 0 18px rgba(82,183,136,0.5)",
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity }}
              whileTap={{ scale: 0.8, rotate: 90 }}
              style={{
                position: "absolute", left: "calc(50% - 36px)", top: "38%",
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #52B788, #2d6a4f)",
                border: "3px solid #A8DADC",
                fontSize: 34, color: "#fff", cursor: "pointer",
                fontFamily: "'Baloo 2', cursive", fontWeight: 900,
                zIndex: 12,
              }}
            >+</motion.button>
          </>
        )}

        {/* After tap-add: combined total */}
        {isTapAdd && addCombined && sessionMode === "story" && (
          <motion.div
            style={{
              position: "absolute", left: "50%", top: "32%",
              transform: "translateX(-50%)",
              textAlign: "center", zIndex: 12,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.7 }}
          >
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
              {[...Array(slide?.tapCountA ?? 0)].map((_, i) => (
                <span key={`a${i}`} style={{ fontSize: 38 }}>{slide?.tapGroupA}</span>
              ))}
              {[...Array(slide?.tapCountB ?? 0)].map((_, i) => (
                <span key={`b${i}`} style={{ fontSize: 38 }}>{slide?.tapGroupB}</span>
              ))}
            </div>
            <motion.div
              style={{
                background: "linear-gradient(135deg, #FFD93D, #ff8f00)",
                borderRadius: 16, padding: "8px 20px",
                fontSize: 32, fontWeight: 900, color: "#1a0a00",
                fontFamily: "'Baloo 2', cursive",
                boxShadow: "0 0 32px rgba(255,217,61,0.8)",
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              = {(slide?.tapCountA ?? 0) + (slide?.tapCountB ?? 0)}
            </motion.div>
          </motion.div>
        )}

        {/* ── Flying fruits (physics arcs) ── */}
        {flyingFruits.map(fruit => (
          <motion.div
            key={fruit.id}
            style={{
              position: "absolute",
              fontSize: 44,
              pointerEvents: "none",
              zIndex: 15,
              left: `${fruit.startX}%`,
              top: `${fruit.startY}%`,
            }}
            animate={{
              left:   [`${fruit.startX}%`, `${fruit.startX + 28}%`, "80%"],
              top:    [`${fruit.startY}%`, `${fruit.startY - 20}%`, "68%"],
              rotate: [0, 270, 540],
              scale:  [1.3, 1.0, 0.65],
            }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {fruit.emoji}
          </motion.div>
        ))}
      </div>

      {/* Layer 4 — Speech bubble (story mode) — flex wrapper aligns to top without fighting Framer Motion y */}
      {sessionMode === "story" && slide && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          paddingTop: 60,
          zIndex: 6, pointerEvents: "none",
        }}>
          <AnimatePresence mode="wait">
            <SpeechBubble
              key={`speech-${storyPage}`}
              words={slide.words}
              en={slide.en}
              litWordIdx={litWordIdx}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Layer 5 — Chalkboard (activity mode) */}
      <AnimatePresence>
        {sessionMode === "activity" && activity && (
          <ChalkboardPanel
            activity={activity}
            actSelected={actSelected}
            actWrong={actWrong}
            onAnswer={onActivityAnswer}
            beniStateRef={beniStateCallbackRef}
          />
        )}
      </AnimatePresence>

      {/* Layer 6 — Next button (story mode, interaction done) */}
      {sessionMode === "story" && (
        <AnimatePresence>
          {interactionDone && (
            <motion.button
              className="mcl-next-btn"
              onClick={onNextStoryPage}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.5 }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
            >
              {storyPage < MATHS_STORY_PAGES.length - 1
                ? (lang === "tok" ? "Nekis ▶" : "Next ▶")
                : (lang === "tok" ? "Stat Askim! 🎯" : "Start Quiz! 🎯")}
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Next button after correct answer */}
      {sessionMode === "activity" && actSelected && (
        <motion.button
          className="mcl-next-btn"
          onClick={onNextStoryPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.94 }}
        >
          {lang === "tok" ? "Nekis ▶" : "Next ▶"}
        </motion.button>
      )}

      {/* Layer 7 — David cartoon thought cloud drifts in from top-right */}
      <AnimatePresence>
        {showDavidMsg && (
          <motion.div
            key={`david-cloud-${davidMsgIdx}`}
            style={{
              position: "absolute",
              top: "8%",
              right: "4%",
              zIndex: 35,
              pointerEvents: "none",
              width: 240,
            }}
            initial={{ y: -180, opacity: 0, rotate: 6 }}
            animate={{ y: 0,    opacity: 1, rotate: 0 }}
            exit={{    y: -160, opacity: 0, rotate: -5 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.6 }}
          >
            {/* Gentle float while visible */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 1.5, -1, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "relative" }}
            >
              {/* ── Cloud SVG shape ── */}
              <svg viewBox="0 0 240 130" width={240} height={130}
                style={{ display: "block", overflow: "visible", filter: "drop-shadow(3px 6px 10px rgba(0,0,0,0.28))" }}>
                <defs>
                  {/* Morphology filter creates a clean unified outline around all overlapping circles */}
                  <filter id="cloud-outline" x="-8%" y="-8%" width="116%" height="116%">
                    <feMorphology in="SourceGraphic" operator="dilate" radius="3.5" result="dilated" />
                    <feFlood floodColor="#1a0a2e" result="col" />
                    <feComposite in="col" in2="dilated" operator="in" result="border" />
                    <feMerge><feMergeNode in="border" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Cloud puffs + thought dots — all white, outline comes from filter */}
                <g filter="url(#cloud-outline)">
                  {/* Main puff circles */}
                  <circle cx={50}  cy={74} r={30} fill="white" />
                  <circle cx={90}  cy={54} r={36} fill="white" />
                  <circle cx={138} cy={44} r={42} fill="white" />
                  <circle cx={186} cy={52} r={34} fill="white" />
                  <circle cx={216} cy={68} r={25} fill="white" />
                  {/* Bottom fill to close the cloud */}
                  <rect x={26} y={74} width={214} height={30} rx={6} fill="white" />
                  {/* Thought dots trailing bottom-left */}
                  <circle cx={32}  cy={112} r={8}   fill="white" />
                  <circle cx={20}  cy={126} r={5.5} fill="white" />
                  <circle cx={12}  cy={137} r={3.5} fill="white" />
                </g>

                {/* Inner shadow tint on bottom of puffs for depth */}
                <circle cx={90}  cy={54} r={36} fill="rgba(200,220,255,0.18)" />
                <circle cx={138} cy={44} r={42} fill="rgba(200,220,255,0.12)" />
              </svg>

              {/* Text sits inside the cloud body */}
              <div style={{
                position: "absolute",
                top: 22, left: 28, right: 16,
                textAlign: "center",
              }}>
                <motion.div
                  style={{ fontSize: 17, fontWeight: 900, color: "#1a0a2e", fontFamily: "'Baloo 2', cursive", lineHeight: 1.35 }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                >
                  {DAVID_MESSAGES[davidMsgIdx].tok}
                </motion.div>
                <motion.div
                  style={{ fontSize: 11, color: "#666", fontStyle: "italic", marginTop: 4 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {DAVID_MESSAGES[davidMsgIdx].en}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile chip — top left */}
      <div style={{
        position: "absolute", top: 68, left: 14, zIndex: 20,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
        borderRadius: 20, padding: "4px 10px 4px 6px",
        display: "flex", alignItems: "center", gap: 6,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "linear-gradient(135deg, #52B788, #2d6a4f)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900, color: "#fff",
          fontFamily: "'Baloo 2', cursive",
        }}>
          {profile.name.charAt(0)}
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>
          {profile.name}
        </span>
      </div>

      {/* Language toggle — top right */}
      {onLangToggle && (
        <button
          onClick={onLangToggle}
          style={{
            position: "absolute", top: 68, right: 14, zIndex: 20,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" as any,
            borderRadius: 20, padding: "5px 14px",
            border: "1px solid rgba(255,217,61,0.35)",
            fontSize: 12, fontWeight: 900, color: "#FFD93D",
            cursor: "pointer", fontFamily: "'Nunito', sans-serif",
            letterSpacing: 1,
          }}
        >
          {lang === "tok" ? "EN" : "TOK"}
        </button>
      )}
    </div>
  );
}
