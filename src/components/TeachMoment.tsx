import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Target, Sparkles } from "lucide-react";

interface Props {
  addends: [number, number];
  emojiA: string;
  emojiB: string;
  attemptNumber: number; // 1st wrong = 1, 2nd = 2, etc.
  onDismiss: () => void;
}

// Rotate through 3 techniques
function getTechnique(n: number): 0 | 1 | 2 {
  return ((n - 1) % 3) as 0 | 1 | 2;
}

const TECH_LABELS = [
  "Kauntim wantaim",       // count together
  "Namba Lain",            // number line
  "Kauntim long Boks",     // ten frame
];
const TECH_LABELS_EN = [
  "Count Together",
  "Number Line",
  "Ten Frame",
];

// ─── Overlay + card wrapper ───────────────────────────────────────────────────
export default function TeachMoment({ addends, emojiA, emojiB, attemptNumber, onDismiss }: Props) {
  const technique = getTechnique(attemptNumber);
  const [showRetry, setShowRetry] = useState(false);
  const total = addends[0] + addends[1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: "inherit",
      }}
    >
      <motion.div
        initial={{ scale: 0.82, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.32 }}
        style={{
          background: "linear-gradient(160deg, #1a3a2a 0%, #0d1f15 100%)",
          border: "2px solid #52B788",
          borderRadius: 24,
          padding: "24px 20px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <motion.div
          animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{ fontSize: 44, lineHeight: 1, marginBottom: 6 }}
        >
          🦜
        </motion.div>
        <div style={{ color: "#52B788", fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
          Em i orait! No wari.
        </div>
        <div style={{ color: "#aaa", fontSize: 12, marginBottom: 10 }}>
          Let's try a different way: <span style={{ color: "#FFD93D" }}>{TECH_LABELS[technique]}</span>
          <span style={{ color: "#555" }}> — {TECH_LABELS_EN[technique]}</span>
        </div>

        <div style={{ borderTop: "1px solid #2a4a3a", marginBottom: 16 }} />

        {/* Technique body */}
        {technique === 0 && (
          <CountTechnique addends={addends} emojiA={emojiA} emojiB={emojiB} total={total} onComplete={() => setShowRetry(true)} />
        )}
        {technique === 1 && (
          <NumberLineTechnique addends={addends} total={total} onComplete={() => setShowRetry(true)} />
        )}
        {technique === 2 && (
          <TenFrameTechnique addends={addends} total={total} onComplete={() => setShowRetry(true)} />
        )}

        {/* Retry button — appears after teaching completes */}
        <AnimatePresence>
          {showRetry && (
            <motion.div
              key="retry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              style={{ marginTop: 18 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.45 }}
                style={{ color: "#52B788", fontSize: 22, fontWeight: 700, marginBottom: 4 }}
              >
                {total} olgeta! <Star size={18} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle",marginLeft:3}} />
              </motion.div>
              <div style={{ color: "#aaa", fontSize: 12, marginBottom: 16 }}>
                {total} altogether! You can do it — yu inap!
              </div>
              <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                style={{
                  background: "linear-gradient(135deg,#52B788,#2d6a4f)",
                  color: "#fff", border: "none", borderRadius: 16,
                  padding: "13px 34px", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Traim Gen! Try Again <Target size={15} style={{verticalAlign:"middle",marginLeft:4}} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Technique 0: Count Together ─────────────────────────────────────────────
// Emoji groups appear one-by-one with numbered badges, then merge
function CountTechnique({ addends, emojiA, emojiB, total, onComplete }:
  { addends: [number,number]; emojiA: string; emojiB: string; total: number; onComplete: ()=>void }) {
  const [phase, setPhase] = useState(1);
  const [visibleA, setVisibleA] = useState(0);
  const [visibleB, setVisibleB] = useState(0);
  const [countVis, setCountVis] = useState(0);

  useEffect(() => {
    if (phase !== 1) return;
    let i = 0;
    const iv = setInterval(() => { i++; setVisibleA(i); if (i >= addends[0]) { clearInterval(iv); setTimeout(() => setPhase(2), 600); } }, 520);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 2) return;
    let i = 0;
    const iv = setInterval(() => { i++; setVisibleB(i); if (i >= addends[1]) { clearInterval(iv); setTimeout(() => setPhase(3), 600); } }, 520);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 3) return;
    let i = 0;
    const all = [...Array(addends[0]).fill(null), ...Array(addends[1]).fill(null)];
    const iv = setInterval(() => { i++; setCountVis(i); if (i >= all.length) { clearInterval(iv); setTimeout(onComplete, 500); } }, 320);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const allItems = [...Array(addends[0]).fill(emojiA), ...Array(addends[1]).fill(emojiB)];

  return (
    <div>
      {/* Group A */}
      {phase >= 1 && (
        <div>
          <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
            ▸ KAUNTIM DISPELA SAIT
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            {Array.from({ length: addends[0] }).map((_, i) => (
              <div key={i} style={{ textAlign: "center", width: 42 }}>
                {i < visibleA ? (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.7 }}>
                    <div style={{ fontSize: 34 }}>{emojiA}</div>
                    <NumberBadge n={i + 1} color="#52B788" />
                  </motion.div>
                ) : <div style={{ height: 54 }} />}
              </div>
            ))}
          </div>
          {visibleA >= addends[0] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: "#52B788", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              ✓ {addends[0]} {emojiA}
            </motion.div>
          )}
        </div>
      )}

      {/* Group B */}
      {phase >= 2 && (
        <div>
          <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1, marginBottom: 8, marginTop: 6 }}>
            ▸ NAU KAUNTIM DISPELA
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            {Array.from({ length: addends[1] }).map((_, i) => (
              <div key={i} style={{ textAlign: "center", width: 42 }}>
                {i < visibleB ? (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.7 }}>
                    <div style={{ fontSize: 34 }}>{emojiB}</div>
                    <NumberBadge n={i + 1} color="#FFD93D" />
                  </motion.div>
                ) : <div style={{ height: 54 }} />}
              </div>
            ))}
          </div>
          {visibleB >= addends[1] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: "#FFD93D", fontWeight: 700, fontSize: 14 }}>
              ✓ {addends[1]} {emojiB}
            </motion.div>
          )}
        </div>
      )}

      {/* Combined count */}
      {phase >= 3 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: "#fff", fontSize: 13, marginBottom: 8 }}>
            <Sparkles size={14} style={{verticalAlign:"middle",marginRight:4}} />Putim wantaim — {addends[0]} + {addends[1]}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
            {allItems.map((emoji, i) => (
              <motion.div key={i}
                animate={{ scale: i < countVis ? 1 : 0, opacity: i < countVis ? 1 : 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                style={{ textAlign: "center", width: 32 }}>
                <div style={{ fontSize: 24 }}>{emoji}</div>
                <div style={{
                  background: "#A8DADC", color: "#000", borderRadius: "50%",
                  width: 16, height: 16, margin: "2px auto 0",
                  fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Technique 1: Number Line ─────────────────────────────────────────────────
// Frog starts at 0, jumps to addends[0], then hops addends[1] more times
function NumberLineTechnique({ addends, total, onComplete }:
  { addends: [number,number]; total: number; onComplete: ()=>void }) {
  const [frogPos, setFrogPos] = useState(0);
  const [phase, setPhase] = useState<"intro"|"jump1"|"hopping"|"done">("intro");
  const [hopsDone, setHopsDone] = useState(0);
  const maxNum = Math.max(total + 1, 7);

  // Phase intro → jump1: frog jumps to addends[0]
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => {
      setPhase("jump1");
      // Animate frog to addends[0] in one jump
      let step = 0;
      const iv = setInterval(() => {
        step++;
        setFrogPos(step);
        if (step >= addends[0]) {
          clearInterval(iv);
          setTimeout(() => setPhase("hopping"), 700);
        }
      }, 200);
      return () => clearInterval(iv);
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase hopping: frog hops 1 at a time for addends[1] hops
  useEffect(() => {
    if (phase !== "hopping") return;
    if (hopsDone < addends[1]) {
      const t = setTimeout(() => {
        setFrogPos(p => p + 1);
        setHopsDone(h => h + 1);
      }, 480);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setPhase("done"); onComplete(); }, 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, hopsDone]);

  return (
    <div>
      <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>
        {phase === "intro"    && "▸ NAMBA LAIN — Frog i go antap long namba!"}
        {phase === "jump1"    && `▸ STAT LONG ${addends[0]} — start at ${addends[0]}!`}
        {phase === "hopping"  && `▸ JAM ${hopsDone} BILONG ${addends[1]} — hop ${hopsDone} of ${addends[1]}!`}
        {phase === "done"     && `▸ LAN LONG ${total}! — landed on ${total}!`}
      </div>

      {/* Number row */}
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, minWidth: "max-content", margin: "0 auto" }}>
          {Array.from({ length: maxNum + 1 }).map((_, n) => {
            const isFrog    = n === frogPos;
            const isStart   = n === addends[0];
            const isAnswer  = phase === "done" && n === total;
            const isHopped  = n > addends[0] && n <= frogPos;
            return (
              <div key={n} style={{ textAlign: "center", width: 32, flexShrink: 0 }}>
                {/* Frog row */}
                <div style={{ height: 24, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <AnimatePresence>
                    {isFrog && (
                      <motion.div
                        key={`frog-${n}`}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.7 }}
                        style={{ fontSize: 18, lineHeight: 1 }}
                      >
                        🐸
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Number circle */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: isAnswer ? "#FFD93D"
                    : isStart   ? "#52B78844"
                    : isHopped  ? "#52B78866"
                    : "#1a2a22",
                  border: `2px solid ${isAnswer ? "#FFD93D" : isStart ? "#52B788" : isHopped ? "#52B788" : "#2a4a3a"}`,
                  color: isAnswer ? "#000" : "#fff",
                  transition: "background 0.3s, border-color 0.3s",
                }}>
                  {n}
                </div>
                {/* Hop marker */}
                {isHopped && !isAnswer && (
                  <div style={{ fontSize: 10, color: "#52B788", marginTop: 2 }}>↑</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, fontSize: 11, color: "#aaa" }}>
        <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#4ade80",marginRight:4,verticalAlign:"middle"}} />Start: {addends[0]}</span>
        <span>⬆️ Hops: {addends[1]}</span>
        {phase === "done" && <span style={{ color: "#FFD93D" }}><Star size={13} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle",marginRight:3}} />Answer: {total}</span>}
      </div>

      {/* Equation building */}
      {phase !== "intro" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: "#fff", fontSize: 14, marginTop: 10 }}>
          {addends[0]} + {hopsDone} = {addends[0] + hopsDone}
          {phase === "done" && <span style={{ color: "#FFD93D" }}> ✓</span>}
        </motion.div>
      )}
    </div>
  );
}

// ─── Technique 2: Ten Frame ───────────────────────────────────────────────────
// Dots fill a 2×5 grid — green for addends[0], yellow for addends[1]
function TenFrameTechnique({ addends, total, onComplete }:
  { addends: [number,number]; total: number; onComplete: ()=>void }) {
  const [filled, setFilled] = useState(0);

  // Fill one dot at a time until total reached
  useEffect(() => {
    if (filled >= total) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFilled(f => f + 1), 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filled, total]);

  const rows = [0, 1]; // 2 rows
  const cols = [0, 1, 2, 3, 4]; // 5 cols

  return (
    <div>
      <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
        ▸ KAUNTIM LONG BOKS — Fill the frame!
      </div>

      {/* Ten frame grid */}
      <div style={{ display: "inline-block", margin: "0 auto" }}>
        {rows.map(row => (
          <div key={row} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
            {cols.map(col => {
              const idx = row * 5 + col;
              const isFilledA = idx < addends[0] && idx < filled;
              const isFilledB = idx >= addends[0] && idx < total && idx < filled;
              return (
                <motion.div key={col}
                  animate={{
                    background: isFilledA ? "#52B788"
                      : isFilledB ? "#FFD93D"
                      : "#1a2a22",
                    scale: (isFilledA || isFilledB) && idx === filled - 1 ? [1, 1.25, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 38, height: 38, borderRadius: 8,
                    border: `2px solid ${isFilledA ? "#52B788" : isFilledB ? "#FFD93D" : "#2a4a3a"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: "#000",
                  }}
                >
                  {isFilledA || isFilledB
                    ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.7 }}>
                        ●
                      </motion.span>
                    : null}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Progress labels */}
      <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 10, fontSize: 12 }}>
        <span style={{ color: "#52B788" }}>
          <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#4ade80",marginRight:4,verticalAlign:"middle"}} />{Math.min(filled, addends[0])} / {addends[0]}
        </span>
        {filled > addends[0] && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ color: "#FFD93D" }}>
            <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#fbbf24",marginRight:4,verticalAlign:"middle"}} />{Math.min(filled - addends[0], addends[1])} / {addends[1]}
          </motion.span>
        )}
      </div>

      {/* Running equation */}
      <div style={{ color: "#fff", fontSize: 14, marginTop: 10 }}>
        {filled <= addends[0]
          ? <span style={{ color: "#52B788" }}>{filled} filled</span>
          : <span>{addends[0]} <span style={{ color: "#52B788" }}>+</span> {filled - addends[0]} = <span style={{ color: filled >= total ? "#FFD93D" : "#fff" }}>{filled}</span></span>
        }
      </div>
    </div>
  );
}

// ─── Shared badge ─────────────────────────────────────────────────────────────
function NumberBadge({ n, color }: { n: number; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.18, type: "spring", bounce: 0.7 }}
      style={{
        background: color, color: "#000", borderRadius: "50%",
        width: 20, height: 20, display: "flex", alignItems: "center",
        justifyContent: "center", margin: "3px auto 0",
        fontSize: 11, fontWeight: 700,
      }}
    >{n}</motion.div>
  );
}
