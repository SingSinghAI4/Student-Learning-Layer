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
import DavidCharacter from "./DavidCharacter";

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
}

// ── Arcade background scenes ─────────────────────────────────────────────────

function ArcadeBackground({ slideIndex }: { slideIndex: number }) {
  const scenes = [
    // 0 — Dawn: Beni wakes up
    { sky: ["#0d1b4b", "#bf4f00"], horizon: "#ff8c00", groundCol: "#1a3a0a", label: "Dawn" },
    // 1 — Village morning
    { sky: ["#1565c0", "#29b6f6"], horizon: "#00e5ff", groundCol: "#2d6a1a", label: "Village" },
    // 2 — Walking to market
    { sky: ["#29b6f6", "#81d4fa"], horizon: "#40c4ff", groundCol: "#2d5a0a", label: "Walking" },
    // 3 — Tap mangoes
    { sky: ["#e65100", "#ff9800"], horizon: "#FFD93D", groundCol: "#3d2b1f", label: "Mango" },
    // 4 — Basket with mangoes
    { sky: ["#f57f17", "#ffd54f"], horizon: "#ffea00", groundCol: "#3d2b1f", label: "Basket" },
    // 5 — Tap coconuts
    { sky: ["#006064", "#00bcd4"], horizon: "#00e5ff", groundCol: "#1b3a2a", label: "Coconut" },
    // 6 — Basket with coconuts
    { sky: ["#1a237e", "#5c6bc0"], horizon: "#7c4dff", groundCol: "#1a2a1a", label: "Basket2" },
    // 7 — Add them together
    { sky: ["#4a148c", "#9c27b0"], horizon: "#52B788", groundCol: "#1a0a2a", label: "AddUp" },
    // 8 — Celebration! Total = 5
    { sky: ["#b71c1c", "#f57f17"], horizon: "#FFD93D", groundCol: "#1a2a0a", label: "Win" },
    // 9 — Your turn
    { sky: ["#1b0033", "#4a148c"], horizon: "#7c4dff", groundCol: "#0a0a1a", label: "Turn" },
  ];

  const sc = scenes[Math.min(slideIndex, scenes.length - 1)];
  const id = `sky-${slideIndex}`;

  return (
    <svg
      viewBox="0 0 400 700"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sc.sky[0]} />
          <stop offset="100%" stopColor={sc.sky[1]} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect x={0} y={0} width={400} height={700} fill={`url(#${id})`} />

      {/* Horizon neon glow */}
      <ellipse cx={200} cy={520} rx={260} ry={80} fill={sc.horizon} opacity={0.18} filter="url(#glow)" />

      {/* Stars (night/dawn scenes) */}
      {(slideIndex === 0 || slideIndex === 9) && (
        <>
          {[30,80,145,200,255,320,370,50,290,170].map((x, i) => (
            <motion.circle key={i} cx={x} cy={30 + (i * 22) % 120} r={1.5}
              fill="white" opacity={0.7}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </>
      )}

      {/* Animated clouds */}
      {slideIndex >= 1 && slideIndex <= 6 && (
        <>
          {[0, 1].map(i => (
            <motion.rect key={i}
              y={40 + i * 50} height={28} rx={14}
              fill="rgba(255,255,255,0.18)"
              initial={{ x: i === 0 ? -120 : -80, width: i === 0 ? 100 : 70 }}
              animate={{ x: i === 0 ? 500 : 480 }}
              transition={{ duration: i === 0 ? 18 : 22, repeat: Infinity, ease: "linear", delay: i * 6 }}
            />
          ))}
        </>
      )}

      {/* Ground */}
      <rect x={0} y={555} width={400} height={145} fill={sc.groundCol} />
      {/* Ground edge neon line */}
      <line x1={0} y1={556} x2={400} y2={556} stroke={sc.horizon} strokeWidth={2} opacity={0.55} />

      {/* Scene-specific props */}
      {slideIndex === 0 && (
        // Dawn: house silhouette + rising sun
        <>
          <rect x={245} y={470} width={90} height={70} rx={4} fill="#2a1a0a" />
          <polygon points="240,470 290,430 340,470" fill="#1a0f06" />
          <rect x={265} y={490} width={22} height={28} rx={2} fill="#0a0a0a" />
          <motion.circle cx={340} cy={490} r={22} fill="#FFD93D" opacity={0.7}
            animate={{ cy: [520, 480] }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
        </>
      )}
      {slideIndex === 1 && (
        // Village: 2 palm trees + houses
        <>
          <rect x={50} y={440} width={10} height={100} rx={5} fill="#5c3317" />
          <ellipse cx={55} cy={435} rx={28} ry={20} fill="#2d6a1a" />
          <rect x={310} y={450} width={8} height={90} rx={4} fill="#5c3317" />
          <ellipse cx={314} cy={445} rx={22} ry={16} fill="#2d6a1a" />
          <rect x={150} y={480} width={60} height={60} rx={4} fill="#3d2518" />
          <polygon points="145,480 180,455 215,480" fill="#2a1a10" />
        </>
      )}
      {slideIndex === 2 && (
        // Walking: dirt path + trees
        <>
          <polygon points="160,555 240,555 220,350 180,350" fill="#8B5A2B" opacity={0.6} />
          <rect x={30} y={460} width={8} height={90} rx={4} fill="#5c3317" />
          <ellipse cx={34} cy={455} rx={22} ry={16} fill="#2d6a1a" />
          <rect x={340} y={470} width={8} height={80} rx={4} fill="#5c3317" />
          <ellipse cx={344} cy={465} rx={20} ry={15} fill="#2d6a1a" />
          {/* Market sign */}
          <rect x={175} y={375} width={52} height={20} rx={4} fill="#8B5A2B" />
          <text x={201} y={389} textAnchor="middle" fontSize={9} fontWeight={900} fill="#FFD93D" fontFamily="'Baloo 2', cursive">MAKET</text>
        </>
      )}
      {(slideIndex === 3 || slideIndex === 4) && (
        // Market: stall frame + mango tree
        <>
          <rect x={20} y={430} width={14} height={120} rx={4} fill="#5c3317" />
          <rect x={18} y={430} width={120} height={10} rx={3} fill="#8B5A2B" />
          <rect x={120} y={430} width={14} height={120} rx={4} fill="#5c3317" />
          <rect x={14} y={425} width={130} height={14} rx={4} fill="#e65100" />
        </>
      )}
      {(slideIndex === 5 || slideIndex === 6) && (
        // Coconut palm + beach hint
        <>
          <rect x={295} y={400} width={12} height={150} rx={6} fill="#8B5A2B" />
          <ellipse cx={301} cy={395} rx={35} ry={22} fill="#2d6a1a" />
          <ellipse cx={301} cy={395} rx={25} ry={15} fill="#3d8a2a" />
          <rect x={0} y={540} width={400} height={20} fill="rgba(0,191,255,0.12)" />
        </>
      )}
      {slideIndex === 7 && (
        // Table with glow
        <>
          <rect x={100} y={490} width={200} height={20} rx={6} fill="#5c3317" />
          <rect x={110} y={510} width={12} height={40} rx={4} fill="#5c3317" />
          <rect x={278} y={510} width={12} height={40} rx={4} fill="#5c3317" />
          <line x1={200} y1={470} x2={200} y2={550} stroke="rgba(82,183,136,0.4)" strokeWidth={2} strokeDasharray="4 4" />
        </>
      )}
      {slideIndex === 8 && (
        // Celebration fireworks
        <>
          {[80, 200, 330].map((cx, i) => (
            <motion.g key={i}>
              {[0,45,90,135,180,225,270,315].map((angle, j) => {
                const rad = (angle * Math.PI) / 180;
                const r = 55 + i * 15;
                return (
                  <motion.line key={j}
                    x1={cx} y1={150 + i * 60}
                    x2={cx + r * Math.cos(rad)} y2={150 + i * 60 + r * Math.sin(rad)}
                    stroke={["#FFD93D","#52B788","#E63946"][j % 3]}
                    strokeWidth={2.5} strokeLinecap="round" opacity={0.7}
                    animate={{ opacity: [0, 0.8, 0], scale: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, delay: i * 0.3 + j * 0.04, repeat: Infinity, repeatDelay: 0.8 }}
                    style={{ transformOrigin: `${cx}px ${150 + i * 60}px` }}
                  />
                );
              })}
            </motion.g>
          ))}
        </>
      )}
      {slideIndex === 9 && (
        // Trophy pedestal + spotlight
        <>
          <polygon points="150,530 250,530 270,555 130,555" fill="#FFD93D" opacity={0.8} />
          <rect x={175} y={480} width={50} height={50} rx={4} fill="#FFD93D" opacity={0.85} />
          <rect x={165} y={475} width={70} height={12} rx={4} fill="#FFA000" />
          <polygon points="200,200 170,480 230,480" fill="rgba(255,255,255,0.06)" />
          <motion.text x={200} y={535} textAnchor="middle" fontSize={24} fill="#1a0a00"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ transformOrigin: "200px 520px" }}
          >🏆</motion.text>
        </>
      )}
    </svg>
  );
}

// ── Ambient floating particles ─────────────────────────────────────────────
function AmbientParticles({ slideIndex }: { slideIndex: number }) {
  const palettes = [
    ["#ff8c00","#FFD93D"],
    ["#52B788","#A8DADC"],
    ["#40c4ff","#80d8ff"],
    ["#FFD93D","#ff6b35"],
    ["#ffd54f","#ffea00"],
    ["#00bcd4","#00e5ff"],
    ["#7c4dff","#A8DADC"],
    ["#52B788","#FFD93D"],
    ["#FFD93D","#ff6b35"],
    ["#7c4dff","#52B788"],
  ];
  const cols = palettes[slideIndex % palettes.length];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {[...Array(10)].map((_, i) => (
        <motion.div key={i}
          style={{
            position: "absolute",
            left: `${8 + (i * 9) % 84}%`,
            width: 6 + (i % 3) * 3,
            height: 6 + (i % 3) * 3,
            borderRadius: "50%",
            background: cols[i % 2],
            opacity: 0.22,
          }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, ((i % 3) - 1) * 25],
            opacity: [0, 0.22, 0.22, 0],
          }}
          transition={{
            duration: 7 + i * 1.1,
            repeat: Infinity,
            delay: i * 0.9,
            ease: "linear",
          }}
        />
      ))}
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
      <div className="mcl-speech-tok">
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
  sessionProgress,
  actIdx,
  actSelected,
  actWrong,
  onNextStoryPage,
  onActivityAnswer,
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
    }
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
      startX: 22,   // tree left side (% of viewport)
      startY: 52,   // tree height (% of viewport)
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
          <ArcadeBackground slideIndex={storyPage} />
        </motion.div>
      </AnimatePresence>

      {/* Layer 1 — Ambient particles */}
      <AmbientParticles slideIndex={storyPage} />

      {/* Layer 2 — HUD strip */}
      <div className="mcl-hud">
        <div className="mcl-slide-counter">{storyPage + 1} / {MATHS_STORY_PAGES.length}</div>
        <div className="mcl-xp-bar-track">
          <motion.div
            className="mcl-xp-bar-fill"
            animate={{ width: `${sessionProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <DavidCharacter size={38} state="idle" />
      </div>

      {/* Layer 3 — Characters + interactive scene */}
      <div className="mcl-characters">

        {/* ── Beni walk-in/out ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`beni-${storyPage}`}
            style={{
              position: "absolute",
              bottom: sessionMode === "activity" ? "54%" : "16%",
              left: storyPage >= 7 ? "4%" : storyPage >= 4 ? "6%" : "8%",
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
            {/* Tree / source — left side */}
            <motion.div
              style={{
                position: "absolute", left: "18%", top: "28%",
                fontSize: 72, cursor: "pointer", userSelect: "none", zIndex: 9,
              }}
              whileTap={{ scale: 0.8 }}
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              onClick={handleFruitTap}
            >
              {storyPage === 3 ? "🌳" : "🌴"}
            </motion.div>

            {/* Tap hint */}
            {interactionStep < tapTarget && (
              <motion.div
                style={{
                  position: "absolute", left: "14%", top: "22%",
                  background: "rgba(255,217,61,0.95)",
                  borderRadius: 20, padding: "5px 12px",
                  fontSize: 11, fontWeight: 900, color: "#1a0a00",
                  zIndex: 10, pointerEvents: "none",
                }}
                animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {lang === "tok" ? "Pres!" : "Tap!"} ({interactionStep}/{tapTarget})
              </motion.div>
            )}

            {/* Basket — right side */}
            <motion.div
              style={{
                position: "absolute", right: "12%", bottom: "22%",
                fontSize: 58, zIndex: 9,
              }}
              animate={basketShake ? { rotate: [-5, 5, -4, 4, 0], y: [0, -6, 0] } : { rotate: 0 }}
              transition={{ duration: 0.4 }}
            >
              🧺
            </motion.div>

            {/* Count badge pops from basket */}
            <AnimatePresence>
              {interactionStep > 0 && (
                <motion.div
                  key={`badge-${interactionStep}`}
                  style={{
                    position: "absolute", right: "8%", bottom: "38%",
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
            {/* Group A — left */}
            <div style={{
              position: "absolute", left: "18%", top: "38%",
              display: "flex", gap: 8, zIndex: 9,
            }}>
              {[...Array(slide?.tapCountA ?? 0)].map((_, i) => (
                <motion.span key={i} style={{ fontSize: 44 }}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                >{slide?.tapGroupA}</motion.span>
              ))}
            </div>

            {/* Group B — right */}
            <div style={{
              position: "absolute", right: "14%", top: "38%",
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
                position: "absolute", left: "50%", top: "40%",
                transform: "translateX(-50%)",
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
              left:   [`${fruit.startX}%`, `${fruit.startX + 30}%`, "72%"],
              top:    [`${fruit.startY}%`, `${fruit.startY - 22}%`, "72%`"],
              rotate: [0, 270, 540],
              scale:  [1.3, 1.0, 0.65],
            }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {fruit.emoji}
          </motion.div>
        ))}
      </div>

      {/* Layer 4 — Speech bubble (story mode) */}
      {sessionMode === "story" && slide && (
        <AnimatePresence mode="wait">
          <SpeechBubble
            key={`speech-${storyPage}`}
            words={slide.words}
            en={slide.en}
            litWordIdx={litWordIdx}
          />
        </AnimatePresence>
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

      {/* Profile chip — top left */}
      <div style={{
        position: "absolute", top: 58, left: 14, zIndex: 20,
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
    </div>
  );
}
