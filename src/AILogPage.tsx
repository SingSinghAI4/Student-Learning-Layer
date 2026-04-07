import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LogEntry {
  type: "info" | "decision" | "warning" | "success";
  label: string;
  text: string;
  time: string;
  phase?: string; // e.g. "Story — Slide 4" | "Activity 2" | "Session"
}

interface MasteryItem { name: string; pct: number; }

interface AILogPageProps {
  studentName: string;
  grade: number;
  subject: string;
  chapter: string;
  path: "Support Path" | "Challenge Path";
  pathColor: string;
  confidence: number;
  responseTime: string;
  hints: number;
  accuracy: string;
  currentDecision: string;
  mastery: MasteryItem[];
  log: LogEntry[];
}

const LEVEL_COLOR: Record<string, string> = {
  info:     "#4fc3f7",
  decision: "#69ff47",
  warning:  "#ffd740",
  success:  "#b9f6ca",
};
const LEVEL_TAG: Record<string, string> = {
  info:     "INFO    ",
  decision: "DECISION",
  warning:  "WARN    ",
  success:  "SUCCESS ",
};

// ASCII progress bar: [████████░░░░] 82%
function AsciiBar({ pct, color, width = 16 }: { pct: number; color: string; width?: number }) {
  const filled = Math.round((pct / 100) * width);
  const empty  = width - filled;
  return (
    <span style={{ color }}>
      {"["}
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: "#333" }}>{"░".repeat(empty)}</span>
      {"] "}
      <span style={{ color }}>{pct}%</span>
    </span>
  );
}

export default function AILogPage({
  studentName, grade, subject, chapter, path,
  confidence, responseTime, hints, accuracy, currentDecision,
  mastery, log,
}: AILogPageProps) {
  const logRef  = useRef<HTMLDivElement>(null);
  const [blink, setBlink]     = useState(true);
  const [visibleCount, setVisible] = useState(0);
  const done = visibleCount >= log.length;

  // Click anywhere on log panel (or press Space/→) to reveal next entry
  function revealNext() {
    setVisible(v => Math.min(v + 1, log.length));
  }

  // Keyboard: Space or ArrowRight to advance
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowRight") { e.preventDefault(); revealNext(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleCount]);

  const confColor = confidence >= 80 ? "#69ff47" : confidence >= 55 ? "#4fc3f7" : "#ffd740";
  const confLabel = confidence >= 80 ? "HIGH" : confidence >= 55 ? "BUILDING" : "LOW";
  const pathCol   = path === "Challenge Path" ? "#69ff47" : "#ffd740";
  const isChallenge = path === "Challenge Path";

  const mono: React.CSSProperties = {
    fontFamily: "'JetBrains Mono','Fira Mono','Cascadia Code','Courier New',monospace",
    fontSize: 13,
  };

  const sideLabel = (txt: string) => (
    <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1.5, marginBottom: 8, marginTop: 4 }}>
      # {txt}
    </div>
  );

  const kv = (k: string, v: string, vc: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ color: "#bbb" }}>{k}</span>
      <span style={{ color: vc, fontWeight: 700 }}>{v}</span>
    </div>
  );

  return (
    <div style={{ ...mono, background: "#0d0d0d", color: "#eee", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── tmux-style top bar ── */}
      <div style={{
        background: "#1a1a1a", borderBottom: "1px solid #555",
        padding: "0 16px", height: 36, display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 7, marginRight: 8 }}>
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#27c93f" }} />
        </div>
        <span style={{ color: "#bbb" }}>singsingai-ai-engine</span>
        <span style={{ color: "#333" }}>›</span>
        <span style={{ color: "#ddd" }}>student-session-log</span>
        <span style={{ color: "#333" }}>›</span>
        <span style={{ color: pathCol }}>{studentName.toLowerCase()}</span>

        {/* right side — tmux window tabs */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 0 }}>
          <span style={{ background: pathCol, color: "#000", padding: "2px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            {isChallenge ? "CHALLENGE PATH" : "SUPPORT PATH"}
          </span>
          <span style={{ background: "#222", color: "#555", padding: "2px 14px", fontSize: 11 }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ── main body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT PANE — stats ── */}
        <div style={{
          width: 280, minWidth: 280, borderRight: "1px solid #555",
          background: "#0d0d0d", overflowY: "auto", flexShrink: 0, padding: "14px 16px",
        }}>
          {/* Pane title */}
          <div style={{ color: "#777", marginBottom: 14, fontSize: 11 }}>
            ─── session::state ────────────────
          </div>

          {sideLabel("STUDENT")}
          <div style={{ color: "#fff",  fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{studentName}</div>
          <div style={{ color: "#ddd",  fontSize: 12, marginBottom: 2 }}>grade: {grade} · {subject}</div>
          <div style={{ color: "#aaa",  fontSize: 11, marginBottom: 14 }}>{chapter}</div>

          <div style={{ color: "#555", marginBottom: 14 }}>────────────────────────────────</div>

          {sideLabel("SESSION_METRICS")}
          {kv("response_time", responseTime, "#4fc3f7")}
          {kv("hints_used",    String(hints),  hints === 0 ? "#69ff47" : "#ffd740")}
          {kv("accuracy",      accuracy,       accuracy === "100%" ? "#69ff47" : "#ffd740")}
          {kv("mode",          "activity",     "#888")}
          {kv("path",          isChallenge ? "challenge" : "support", pathCol)}

          <div style={{ color: "#555", margin: "14px 0" }}>────────────────────────────────</div>

          {sideLabel("AI_CONFIDENCE")}
          {kv("level", confLabel, confColor)}
          {kv("score", `${confidence}%`, confColor)}
          <div style={{ marginBottom: 14 }}>
            <AsciiBar pct={confidence} color={confColor} />
          </div>

          <div style={{ color: "#555", marginBottom: 14 }}>────────────────────────────────</div>

          {sideLabel("SKILL_MASTERY")}
          {mastery.map((m, i) => {
            const c = m.pct < 35 ? "#ff6b6b" : m.pct < 65 ? "#ffd740" : "#69ff47";
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ color: "#ccc", fontSize: 11, marginBottom: 3 }}>{m.name.toLowerCase().replace(/ /g, "_")}</div>
                <AsciiBar pct={m.pct} color={c} width={14} />
              </div>
            );
          })}

          <div style={{ color: "#555", margin: "14px 0" }}>────────────────────────────────</div>

          {sideLabel("CURRENT_DECISION")}
          <div style={{ color: "#69ff47", fontSize: 12, lineHeight: 1.8 }}>
            {currentDecision}
          </div>
        </div>

        {/* ── RIGHT PANE — log ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Log pane title bar */}
          <div style={{
            background: "#111", borderBottom: "1px solid #555",
            padding: "6px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          }}>
            <span style={{ color: done ? "#555" : "#27c93f", fontWeight: 700 }}>{done ? "● IDLE" : "● LIVE"}</span>
            <span style={{ color: "#333" }}>│</span>
            <span style={{ color: "#ccc" }}>ai-engine/adaptive-session</span>
            <span style={{ color: "#666" }}>│</span>
            <span style={{ color: "#bbb" }}>pid:42811</span>
            <span style={{ color: "#666" }}>│</span>
            <span style={{ color: "#bbb" }}>{visibleCount}/{log.length} events</span>
            {/* Progress bar */}
            <div style={{ flex: 1, height: 4, background: "#222", borderRadius: 2, marginLeft: 8, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${(visibleCount / log.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%", background: pathCol, borderRadius: 2 }}
              />
            </div>
            {/* Click hint */}
            {!done && (
              <span style={{ color: "#555", fontSize: 11, flexShrink: 0 }}>
                SPACE / → / click
              </span>
            )}
          </div>

          {/* Log scroll area — click to advance */}
          <div
            ref={logRef}
            onClick={revealNext}
            style={{
              flex: 1, overflowY: "auto", padding: "16px 24px 48px", background: "#0d0d0d",
              cursor: done ? "default" : "pointer",
            }}
          >
            {/* Shell prompt + boot */}
            <div style={{ color: "#69ff47", marginBottom: 4 }}>
              root@singsingai:~$ python3 session_engine.py --student={studentName.toLowerCase()} --grade={grade} --subject=maths-ch2
            </div>
            <div style={{ color: "#eee", marginBottom: 2 }}>SingSinghAI Engine v2.4.1 — initialising adaptive session</div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Loading student profile  →  {studentName.toLowerCase()}-grade{grade}.json  <span style={{ color: "#69ff47" }}>✓</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Curriculum               →  PNG-DoE-2024 · grade{grade} · maths-ch2  <span style={{ color: "#69ff47" }}>✓</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Adaptive engine          →  <span style={{ color: "#69ff47" }}>ACTIVE</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Path resolver            →  <span style={{ color: pathCol }}>{path.toUpperCase()}</span></div>
            <div style={{ color: "#555", margin: "14px 0 16px" }}>{"─".repeat(72)}</div>

            {/* Log entries */}
            {log.slice(0, visibleCount).map((e, i) => {
              const lineNum = String(i + 1).padStart(3, "0");
              const sentences = e.text.split(". ").filter(s => s.trim());
              // Show a phase divider when the phase changes
              const prevPhase = i > 0 ? log[i - 1].phase : undefined;
              const showDivider = e.phase && e.phase !== prevPhase;
              return (
                <div key={i}>
                  {/* Phase divider */}
                  {showDivider && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ color: "#444", fontSize: 11, margin: "16px 0 10px", letterSpacing: 1 }}
                    >
                      {"─".repeat(8)} {e.phase} {"─".repeat(8)}
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ marginBottom: 14, display: "flex", gap: 0 }}
                  >
                    <span style={{ color: "#444", userSelect: "none", marginRight: 14, flexShrink: 0 }}>{lineNum}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 4 }}>
                        <span style={{ color: "#666" }}>[{e.time}]</span>
                        <span style={{ color: LEVEL_COLOR[e.type], fontWeight: 700 }}>[{LEVEL_TAG[e.type]}]</span>
                        <span style={{ color: "#888" }}>ai.session ›</span>
                        <span style={{ color: "#fff", fontWeight: 700 }}>{e.label}</span>
                      </div>
                      {sentences.map((s, si) => (
                        <div key={si} style={{ color: "#e8e8e8", paddingLeft: 20, lineHeight: 1.8, marginTop: 1 }}>
                          <span style={{ color: "#555" }}>│ </span>{s.trim()}{si < sentences.length - 1 ? "." : ""}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {/* Waiting cursor / done state */}
            {done ? (
              <div style={{ display: "flex", marginTop: 6 }}>
                <span style={{ color: "#333", marginRight: 14 }}>{String(log.length + 1).padStart(3, "0")}</span>
                <span style={{ color: "#555" }}>[{log[log.length - 1]?.time}] [INFO    ] ai.session · session closed&nbsp;</span>
                <span style={{ color: "#69ff47", opacity: blink ? 1 : 0 }}>█</span>
              </div>
            ) : (
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ color: "#444", fontSize: 11, marginTop: 10, userSelect: "none" }}
              >
                ▸ click · space · → to reveal next event ({log.length - visibleCount} remaining)
              </motion.div>
            )}
          </div>

          {/* ── tmux bottom status bar ── */}
          <div style={{
            background: isChallenge ? "#003300" : "#2a2000",
            borderTop: `1px solid ${pathCol}33`,
            padding: "4px 20px", display: "flex", gap: 24, flexShrink: 0, fontSize: 11,
          }}>
            <span style={{ color: pathCol }}>● {path.toUpperCase()}</span>
            <span style={{ color: "#888" }}>│</span>
            <span style={{ color: "#ccc" }}>student: <span style={{ color: "#fff" }}>{studentName}</span></span>
            <span style={{ color: "#888" }}>│</span>
            <span style={{ color: "#ccc" }}>confidence: <span style={{ color: confColor }}>{confidence}%</span></span>
            <span style={{ color: "#888" }}>│</span>
            <span style={{ color: "#ccc" }}>accuracy: <span style={{ color: accuracy === "100%" ? "#69ff47" : "#ffd740" }}>{accuracy}</span></span>
            <span style={{ color: "#888" }}>│</span>
            <span style={{ color: "#ccc" }}>hints: <span style={{ color: hints === 0 ? "#69ff47" : "#ffd740" }}>{hints}</span></span>
            <span style={{ marginLeft: "auto", color: "#888" }}>SingSinghAI v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pre-baked data ─────────────────────────────────────────────────────────────

export const MERI_LOG_DATA: AILogPageProps = {
  studentName: "Meri",
  grade: 2,
  subject: "Grade 2 Maths",
  chapter: "Ch.2 — Putim Wantaim (Adding Up)",
  path: "Support Path",
  pathColor: "#ffd740",
  confidence: 44,
  responseTime: "16s avg",
  hints: 3,
  accuracy: "75%",
  currentDecision: "Meri — 2 errors on Q5 (3+3). Visual scaffold re-enabled. Tok Pisin first throughout. sum=6 gap flagged for next session.",
  mastery: [
    { name: "Addition visual", pct: 48 },
    { name: "Number bonds",    pct: 31 },
    { name: "Word problems",   pct: 22 },
    { name: "Tok Pisin read",  pct: 55 },
  ],
  log: [
    // ── SESSION INIT ─────────────────────────────────────────────────────────
    { phase: "Session Init", type: "info",     label: "Session Started — Support Path",   text: "Meri · Grade 2 · Maths Ch.2 — Putim Wantaim. Profile loaded: lessonProgress 45%, streak 2 days, avg_response 18s. Support path assigned.", time: "14:28:01" },
    { phase: "Session Init", type: "decision", label: "AI: Path Selection",               text: "lessonProgress=45% below threshold (55%) AND streak=2 below threshold (3). → Support path. Visual emoji aids ON. Tok Pisin first. Numbers: 1+1, 2+1, 3+2, 4+1, 2+4, 3+3, 4+2 (scaffolded).", time: "14:28:01" },
    { phase: "Session Init", type: "info",     label: "AI: Language Config",              text: "Language mode: Tok Pisin primary. English below as translation. No countdown timer on student UI. hint_budget: 3.", time: "14:28:02" },

    // ── STORY ────────────────────────────────────────────────────────────────
    { phase: "Story — 10 Slides", type: "info",     label: "Story Loaded — Slide 1/10",        text: "Scene: 🌅 Dawn at Beni's house. Word-by-word narration active. AI observing dwell time and hesitation between word highlights.", time: "14:28:10" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 2/10",               text: "Scene: Mama calls Beni to market. Tap-next pace: 7s. Normal for support profile.", time: "14:28:18" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 3/10",               text: "Scene: Walking to market. Pace 8s. AI noting no hesitation — comprehension intact.", time: "14:28:27" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 4/10 ✋ TAP",        text: "Interactive: tap each 🥭 to count to 2. Meri completed in 9s — tapped twice, deliberate. Interaction recorded.", time: "14:28:36" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 5/10",               text: "Scene: 2 mangoes in basket confirmed. 6s dwell — Meri looking at the number badge.", time: "14:28:43" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 6/10 ✋ TAP",        text: "Interactive: tap each 🥥 to count to 3. Meri tapped slowly — 14s. Counted aloud likely. interaction_time: 14s.", time: "14:28:52" },
    { phase: "Story — 10 Slides", type: "warning",  label: "AI: Slow Tap Noted — Slide 6",     text: "14s on tap-count for 3 coconuts suggests manual counting needed. Flag: counting_by_one=likely. Will use emoji visual aids throughout activities.", time: "14:28:53" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 7/10",               text: "Scene: 3 coconuts in basket. Meri nodded at screen (observed by supervisor). Comprehension signal: strong.", time: "14:29:01" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 8/10 ✋ TAP-ADD",    text: "Interactive: tap ➕ to merge 2 mangoes + 3 coconuts. Meri hesitated 5s before tapping. Then watched animation fully. Engaged.", time: "14:29:10" },
    { phase: "Story — 10 Slides", type: "decision", label: "AI: Story Comprehension Check",    text: "Slide 8 hesitation (5s before ➕) suggests Meri is processing the concept, not confused. Positive signal. Q1 will anchor to this exact scene.", time: "14:29:11" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 9/10",               text: "Scene: 5 olgeta celebration. Meri smiled (supervisor note). Total = revealed. 4s dwell.", time: "14:29:16" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 10/10 — Complete",   text: "YOUR TURN slide. Story total time: 82s (10 slides). Above average — consistent with support profile. Launching activities.", time: "14:29:24" },

    // ── ACTIVITY 1 ────────────────────────────────────────────────────────────
    { phase: "Activity 1 — Story Check 2+3", type: "info",     label: "Q1 Loaded — Story Check 2+3",      text: "🥭🥭 + 🥥🥥🥥 = ? Visual emoji displayed. Tok Pisin: Mama i baim 2 mango na 3 kokonas. Hamas olgeta? difficulty=1. This mirrors slide 8 exactly.", time: "14:29:27" },
    { phase: "Activity 1 — Story Check 2+3", type: "success",  label: "✓ Correct — Q1 (1st attempt)",     text: "Meri answered 5 in 18s. Correct. Story anchor worked — same scene recalled. mastery[addition_visual]: 28% → 38%. hint_count: 0.", time: "14:29:45" },
    { phase: "Activity 1 — Story Check 2+3", type: "decision", label: "AI: Baseline Set",                 text: "18s response is within support-profile expected range (<25s). No hints needed. Story-anchored recall confirmed. Scaffold maintained for Q2.", time: "14:29:46" },

    // ── ACTIVITY 2 ────────────────────────────────────────────────────────────
    { phase: "Activity 2 — 1+1 Banana",      type: "info",     label: "Q2 Loaded — Isi Isi 1+1",          text: "🍌 + 🍌 = ? Smallest possible sum. Warm-up question. Tok Pisin: Beni i painim 1 banana, em i painim 1 moa. difficulty=1.", time: "14:29:50" },
    { phase: "Activity 2 — 1+1 Banana",      type: "success",  label: "✓ Correct — Q2 (1st attempt)",     text: "Meri answered 2 in 9s. Correct. Fast for support profile. consecutive_correct: 1. mastery[addition_visual]: 38% → 41%.", time: "14:29:59" },
    { phase: "Activity 2 — 1+1 Banana",      type: "info",     label: "AI: Warm-up Passed",               text: "9s on 1+1 — good. Not a meaningful signal yet. Moving to 2+1 with same emoji scaffold retained.", time: "14:30:00" },

    // ── ACTIVITY 3 ────────────────────────────────────────────────────────────
    { phase: "Activity 3 — 2+1 Banana",      type: "info",     label: "Q3 Loaded — Kauntim Banana 2+1",   text: "🍌🍌 + 🍌 = ? Tok Pisin: Beni i gat 2 banana. Em i kisim 1 moa. Hamas nau? difficulty=1. AI watching response time.", time: "14:30:04" },
    { phase: "Activity 3 — 2+1 Banana",      type: "warning",  label: "✗ Incorrect — Q3 attempt 1",       text: "Meri selected 4. Correct: 3. Error #1 this session. Likely counted starting from 2 and added 2 instead of 1. hint_count: 1.", time: "14:30:18" },
    { phase: "Activity 3 — 2+1 Banana",      type: "decision", label: "AI: TeachMoment Triggered",        text: "Wrong answer → Count Together technique shown. Emoji group A (🍌🍌) revealed one-by-one, then group B (🍌). Student must watch full animation before retry.", time: "14:30:19" },
    { phase: "Activity 3 — 2+1 Banana",      type: "success",  label: "✓ Correct — Q3 attempt 2",         text: "Meri answered 3 in 26s total. Self-corrected after TeachMoment counting sequence. mastery[addition_visual]: 41% → 46%. No penalty recorded.", time: "14:30:30" },
    { phase: "Activity 3 — 2+1 Banana",      type: "info",     label: "AI: Pace Noted",                   text: "26s total across 2 attempts. TeachMoment helped. Visual scaffold retained. consecutive_correct reset to 0. error_total: 1.", time: "14:30:31" },

    // ── ACTIVITY 4 ────────────────────────────────────────────────────────────
    { phase: "Activity 4 — 3+2 Coconuts",    type: "info",     label: "Q4 Loaded — Kokonas Basket 3+2",   text: "🥥🥥🥥 + 🥥🥥 = ? Tok Pisin: Em i putim 3 kokonas, bai em i kisim 2 moa. Hamas? difficulty=1.", time: "14:30:35" },
    { phase: "Activity 4 — 3+2 Coconuts",    type: "success",  label: "✓ Correct — Q4 (1st attempt)",     text: "Meri answered 5 in 14s. Correct. Faster than Q3 (26s). consecutive_correct: 1. mastery[addition_visual]: 46% → 52%.", time: "14:30:49" },
    { phase: "Activity 4 — 3+2 Coconuts",    type: "info",     label: "AI: Improvement Detected",         text: "14s vs 26s previous — significant speed gain. 1st attempt correct. Confidence score nudged. Still need 2 consecutive before scaffold removal.", time: "14:30:50" },

    // ── ACTIVITY 5 ────────────────────────────────────────────────────────────
    { phase: "Activity 5 — 4+1 Banana+Pine", type: "info",     label: "Q5 Loaded — Kauntim Frut 4+1",     text: "🍌🍌🍌🍌 + 🍍 = ? Tok Pisin: Stol i gat 4 banana, Mama i baim 1 painap. Hamas frut? difficulty=1. Two different fruit types.", time: "14:30:53" },
    { phase: "Activity 5 — 4+1 Banana+Pine", type: "success",  label: "✓ Correct — Q5 (1st attempt)",     text: "Meri answered 5 in 11s. Fastest response this session. consecutive_correct: 2. mastery[addition_visual]: 52% → 58%. Confidence: 28% → 38%.", time: "14:31:04" },
    { phase: "Activity 5 — 4+1 Banana+Pine", type: "decision", label: "⚡ AI: 2-Streak — Advancing",       text: "consecutive_correct=2. Threshold reached. Advancing difficulty to sum=6 (3+3). New object type (papaya). Emoji scaffold retained — not enough signal to remove.", time: "14:31:05" },

    // ── ACTIVITY 6 ────────────────────────────────────────────────────────────
    { phase: "Activity 6 — 3+3 Papaya",      type: "info",     label: "Q6 Loaded — Strong Askim 3+3",     text: "🍈🍈🍈 + 🍈🍈🍈 = ? Tok Pisin: 3 kapaia long dispela han, 3 long narapela. Hamas? difficulty=2. sum=6 is a statistically common error point.", time: "14:31:09" },
    { phase: "Activity 6 — 3+3 Papaya",      type: "warning",  label: "✗ Incorrect — Q6 attempt 1",       text: "Meri selected 5. Correct: 6. Error #2 this session. sum=6 gap triggered. Gentle redirect shown. hint_count: 2.", time: "14:31:23" },
    { phase: "Activity 6 — 3+3 Papaya",      type: "warning",  label: "✗ Pattern — Q6 attempt 2",         text: "Meri selected 7. Correct: 6. Error #3 same question. Consistent mis-estimation around sum=6. Flag: sum_to_6_gap=true.", time: "14:31:35" },
    { phase: "Activity 6 — 3+3 Papaya",      type: "decision", label: "AI: Full Support Mode + Number Line", text: "2nd wrong on same Q → TeachMoment technique 2: Number Line. 🐸 hops from 3, then 3 more hops to land on 6. Full support mode active. No shame message.", time: "14:31:36" },
    { phase: "Activity 6 — 3+3 Papaya",      type: "success",  label: "✓ Correct — Q6 attempt 3",         text: "Meri answered 6 in 41s total. Correct with Number Line scaffold. mastery[number_bonds]: 22% → 31%. Flag persists — needs next-session revision.", time: "14:31:52" },

    // ── ACTIVITY 7 ────────────────────────────────────────────────────────────
    { phase: "Activity 7 — 2+4 Papaya+Mango",type: "info",     label: "Q7 Loaded — Popo na Mango 2+4",    text: "🍈🍈 + 🥭🥭🥭🥭 = ? Tok Pisin: Beni i kisim 2 popo na putim wantaim 4 mango. difficulty=2. Flipped order — testing commutativity.", time: "14:31:56" },
    { phase: "Activity 7 — 2+4 Papaya+Mango",type: "success",  label: "✓ Correct — Q7 (1st attempt)",     text: "Meri answered 6 in 18s. Correct. Commutativity handled — sum=6 worked this time with visual. consecutive_correct: 1. mastery[addition_visual]: 58% → 63%.", time: "14:32:14" },
    { phase: "Activity 7 — 2+4 Papaya+Mango",type: "info",     label: "AI: sum=6 Progress",               text: "Meri got 2+4=6 correct (18s) after failing 3+3. Visual layout (2 left, 4 right) easier than equal groups (3+3). Interesting error pattern. Logged.", time: "14:32:15" },

    // ── ACTIVITY 8 ────────────────────────────────────────────────────────────
    { phase: "Activity 8 — 4+2 Basket Story",type: "info",     label: "Q8 Loaded — Stori Maths 4+2",      text: "🧺 Beni i putim 4 mango na 2 kokonas long basket. Hamas samting? difficulty=2. First word-problem format. No equation shown — full narrative.", time: "14:32:18" },
    { phase: "Activity 8 — 4+2 Basket Story",type: "success",  label: "✓ Correct — Q8 (1st attempt)",     text: "Meri answered 6 in 16s. Correct. Read narrative, extracted numbers, added. mastery[word_problems]: 15% → 22%. Confidence: 38% → 44%.", time: "14:32:34" },
    { phase: "Activity 8 — 4+2 Basket Story",type: "success",  label: "✅ Lesson Complete",               text: "Meri finished all 8 activities. overall_mastery: 28% → 48%. streak: 2 → 3 days. total_errors: 3. hint_total: 3. avg_response: 16s.", time: "14:32:35" },
    { phase: "Activity 8 — 4+2 Basket Story",type: "decision", label: "AI: Next Session Written",         text: "sum_to_6_gap=true. Next session: open with 3+3 visual revision before new content. Word problem format showed promise — include 1 per session going forward.", time: "14:32:36" },
  ],
};

export const TURA_LOG_DATA: AILogPageProps = {
  studentName: "Tura",
  grade: 2,
  subject: "Grade 2 Maths",
  chapter: "Ch.2 — Putim Wantaim (Adding Up)",
  path: "Challenge Path",
  pathColor: "#69ff47",
  confidence: 95,
  responseTime: "4.5s avg",
  hints: 0,
  accuracy: "100%",
  currentDecision: "Tura — 8/8 correct, 0 hints, avg 4.5s. Expert Q8 (8+5=13) solved in 6s. Full mastery confirmed. Recommend Ch.3 Kisim Ausait next session.",
  mastery: [
    { name: "Addition visual", pct: 95 },
    { name: "Number bonds",    pct: 88 },
    { name: "Word problems",   pct: 81 },
    { name: "Tok Pisin read",  pct: 72 },
  ],
  log: [
    // ── SESSION INIT ─────────────────────────────────────────────────────────
    { phase: "Session Init", type: "info",     label: "Session Started — Challenge Path",  text: "Tura · Grade 2 · Maths Ch.2 — Putim Wantaim. Profile loaded: lessonProgress 72%, streak 5 days, avg_response 5s. Challenge path assigned.", time: "14:31:10" },
    { phase: "Session Init", type: "decision", label: "AI: Path Selection",               text: "lessonProgress=72% above threshold (55%) AND streak=5 above threshold (3). → Challenge path. Visual scaffolding OFF. English primary. Numbers: 2+3, 4+3, 5+4, 3+5, 6+2, K7+K3, 8+4, 8+5 expert.", time: "14:31:10" },
    { phase: "Session Init", type: "info",     label: "AI: No Scaffold Config",           text: "hint_budget: 0 pre-loaded. Visual aids disabled. No emoji groups. English primary, Tok Pisin secondary only. Harder number pairs queued.", time: "14:31:11" },

    // ── STORY ────────────────────────────────────────────────────────────────
    { phase: "Story — 10 Slides", type: "info",     label: "Story Loaded — Slide 1/10",        text: "Scene: 🌅 Dawn. Tura tapped next in 4s. Fast traversal expected — story is context-setting, not the challenge.", time: "14:31:16" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slides 2–3 Fast",           text: "Slides 2 and 3 tapped in 3s each. Pace consistent with high-performance profile. AI reducing observation weight.", time: "14:31:23" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slide 4/10 ✋ TAP",        text: "Interactive: tap 🥭 ×2. Tura completed in 3s — tapped twice rapidly. No hesitation. counted_by_group=likely.", time: "14:31:27" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slides 5–6 Fast",           text: "Slides 5 and 6 tapped in 3s each. Slide 6 tap-count (🥥×3) done in 4s.", time: "14:31:35" },
    { phase: "Story — 10 Slides", type: "decision", label: "AI: Story Pace Signal",             text: "Tura avg 3.6s per slide (benchmark: 7s). Fast = confident. No comprehension flags. Skipping extra story observation. Activities will confirm.", time: "14:31:36" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slides 7–8 + TAP-ADD",     text: "Slide 8 tap-add (2+3): Tura tapped ➕ immediately (1s hesitation). Watched merge animation 2s then tapped next. Engaged but fast.", time: "14:31:43" },
    { phase: "Story — 10 Slides", type: "info",     label: "Story — Slides 9–10 Complete",      text: "Story total time: 34s (10 slides). Fastest story completion on record for this class. Activities launching.", time: "14:31:50" },

    // ── ACTIVITY 1 ────────────────────────────────────────────────────────────
    { phase: "Activity 1 — Story Check 2+3", type: "info",     label: "Q1 Loaded — Story Check 2+3",      text: "2+3=? Text only, no emoji. English only. difficulty=1. Baseline calibration question.", time: "14:31:52" },
    { phase: "Activity 1 — Story Check 2+3", type: "success",  label: "⚡ Strong Signal — Q1",             text: "Tura answered 5 in 2s. Instant recall. mastery[addition_visual]: 82% → 87%. hint_count: 0. No story context needed.", time: "14:31:54" },
    { phase: "Activity 1 — Story Check 2+3", type: "decision", label: "AI: Scaffolding Confirmed Off",    text: "2s response on baseline — well above threshold. Visual aids remain hidden for entire session. Advancing to difficulty=2 immediately.", time: "14:31:55" },

    // ── ACTIVITY 2 ────────────────────────────────────────────────────────────
    { phase: "Activity 2 — Think Fast 4+3",  type: "info",     label: "Q2 Loaded — Round 1: 4+3",         text: "4+3=? No visual. Text only. difficulty=2. AI monitoring whether response time holds under harder numbers.", time: "14:31:57" },
    { phase: "Activity 2 — Think Fast 4+3",  type: "success",  label: "⚡ Strong Signal — Q2",             text: "Tura answered 7 in 4s. No hints. consecutive_correct: 2. mastery[number_bonds]: 75% → 82%. confidence: 68% → 76%.", time: "14:32:01" },
    { phase: "Activity 2 — Think Fast 4+3",  type: "decision", label: "AI: Pattern Confirmed",            text: "2 correct in avg 3s. High performance consistent. No-scaffold mode confirmed. Q3 escalates to word-problem narrative format.", time: "14:32:02" },

    // ── ACTIVITY 3 ────────────────────────────────────────────────────────────
    { phase: "Activity 3 — Word Problem 5+4",type: "info",     label: "Q3 Loaded — Market Word Prob 5+4", text: "Beni has 5 mangoes, buys 4 more. Total? No visual. English. difficulty=2. Tests: can Tura extract numbers from narrative?", time: "14:32:04" },
    { phase: "Activity 3 — Word Problem 5+4",type: "success",  label: "⚡ Strong Signal — Q3",             text: "Tura answered 9 in 5s. Extracted numbers from narrative, computed correctly. consecutive_correct: 3. mastery[word_problems]: 58% → 71%.", time: "14:32:09" },
    { phase: "Activity 3 — Word Problem 5+4",type: "decision", label: "⚡ AI: 3-Streak — Escalating",      text: "3-answer streak confirmed. Word-problem comprehension strong. Advancing to multi-object grouping: 3+5 (flipped order).", time: "14:32:10" },

    // ── ACTIVITY 4 ────────────────────────────────────────────────────────────
    { phase: "Activity 4 — Flip Order 3+5",  type: "info",     label: "Q4 Loaded — Flip It 3+5",          text: "Mama has 3 fish + 5 sweet potatoes. Total? difficulty=2. Tests commutativity awareness. Small visual hint: 🐟🐟🐟 ➕ 🍠🍠🍠🍠🍠.", time: "14:32:12" },
    { phase: "Activity 4 — Flip Order 3+5",  type: "success",  label: "⚡ Strong Signal — Q4",             text: "Tura answered 8 in 4s. Correct. Handled flipped order without hesitation. consecutive_correct: 4. mastery[addition_visual]: 87% → 92%.", time: "14:32:16" },
    { phase: "Activity 4 — Flip Order 3+5",  type: "decision", label: "⚡ AI: Escalating — Market Stall",  text: "4-answer streak. Commutativity implicit — no sign of confusion. Advancing to 6+2 grouped emoji notation.", time: "14:32:17" },

    // ── ACTIVITY 5 ────────────────────────────────────────────────────────────
    { phase: "Activity 5 — Market 6+2",      type: "info",     label: "Q5 Loaded — Market Stall 6+2",     text: "🥥×6 ➕ 🍈×2 = ? Compact emoji. difficulty=3. Two object types. Tests grouped counting vs individual counting.", time: "14:32:19" },
    { phase: "Activity 5 — Market 6+2",      type: "success",  label: "⚡ Strong Signal — Q5",             text: "Tura answered 8 in 5s. Handled compact grouping without slowing. consecutive_correct: 5. mastery[addition_visual]: 92% → 95%.", time: "14:32:24" },
    { phase: "Activity 5 — Market 6+2",      type: "decision", label: "⚡ AI: Escalating — Kina Currency", text: "5-answer streak. confidence: 87%. Unlocking real-world financial context. Kina (PNG currency) format — Grade 2 ceiling content.", time: "14:32:25" },

    // ── ACTIVITY 6 ────────────────────────────────────────────────────────────
    { phase: "Activity 6 — Kina K7+K3",      type: "info",     label: "Q6 Loaded — Kina Maths K7+K3",     text: "Mama spent K7 on fruit and K3 on fish. Total? difficulty=3. PNG financial context. Tests: abstract addition without visual anchor.", time: "14:32:27" },
    { phase: "Activity 6 — Kina K7+K3",      type: "success",  label: "⚡ Strong Signal — Q6",             text: "Tura answered K10 in 5s. Extracted addition from financial narrative, no hesitation. mastery[word_problems]: 71% → 81%. confidence: 87% → 92%.", time: "14:32:32" },
    { phase: "Activity 6 — Kina K7+K3",      type: "decision", label: "⚡ AI: Expert Level Unlocked",      text: "6-answer streak. confidence: 92%. Unlocking Q7 (8+4) as pre-expert, then Q8 (8+5) full expert ceiling probe. Double-digit results.", time: "14:32:33" },

    // ── ACTIVITY 7 ────────────────────────────────────────────────────────────
    { phase: "Activity 7 — Level Up 8+4",    type: "info",     label: "Q7 Loaded — Level Up 8+4",          text: "Beni's family harvested 8 coconuts morning + 4 afternoon. Total? difficulty=3. Pre-expert: double digits but sum=12.", time: "14:32:35" },
    { phase: "Activity 7 — Level Up 8+4",    type: "success",  label: "⚡ Strong Signal — Q7",              text: "Tura answered 12 in 5s. Correct. Double-digit addition no hesitation. consecutive_correct: 7. session_mastery approaching ceiling.", time: "14:32:40" },
    { phase: "Activity 7 — Level Up 8+4",    type: "decision", label: "⚡ AI: Expert Q8 Confirmed",         text: "7-answer streak. All correct, avg 4.2s, 0 hints. Proceeding to Q8 (8+5=13) — hardest question in Grade 2 scope.", time: "14:32:41" },

    // ── ACTIVITY 8 ────────────────────────────────────────────────────────────
    { phase: "Activity 8 — Expert 8+5",      type: "info",     label: "Q8 Loaded — Expert Round 8+5",     text: "Uncle sold 8 corn baskets morning + 5 afternoon. Total? difficulty=4. Double-digit result=13. Outside standard Grade 2 scope. Ceiling probe.", time: "14:32:43" },
    { phase: "Activity 8 — Expert 8+5",      type: "success",  label: "✅ Expert Mastery — Q8",            text: "Tura answered 13 in 6s. Correct. 8+5 solved without visual. 8/8 correct. hints: 0. avg_response: 4.5s. session_mastery: 95%.", time: "14:32:49" },
    { phase: "Activity 8 — Expert 8+5",      type: "success",  label: "✅ Lesson Complete — Full Mastery", text: "Tura finished all 8 activities. accuracy: 100%. hints: 0. avg: 4.5s. Ch.2 complete at expert ceiling. streak: 5 → 6 days.", time: "14:32:50" },
    { phase: "Activity 8 — Expert 8+5",      type: "decision", label: "AI: Next Session Written",         text: "Tura exceeded Grade 2 Ch.2 ceiling. Expert 8+5 in 6s confirms readiness. Recommend Ch.3 Kisim Ausait (Subtraction). Writing to student profile.", time: "14:32:51" },
  ],
};
