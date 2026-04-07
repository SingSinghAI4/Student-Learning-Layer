import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LogEntry {
  type: "info" | "decision" | "warning" | "success";
  label: string;
  text: string;
  time: string;
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
  const [blink, setBlink]           = useState(true);
  const [visibleCount, setVisible]  = useState(0);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { i++; setVisible(i); if (i >= log.length) clearInterval(iv); }, 160);
    return () => clearInterval(iv);
  }, [log.length]);

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
            <span style={{ color: "#27c93f", fontWeight: 700 }}>● LIVE</span>
            <span style={{ color: "#333" }}>│</span>
            <span style={{ color: "#ccc" }}>ai-engine/adaptive-session</span>
            <span style={{ color: "#666" }}>│</span>
            <span style={{ color: "#bbb" }}>pid:42811</span>
            <span style={{ color: "#666" }}>│</span>
            <span style={{ color: "#bbb" }}>{log.length} events</span>
            <span style={{ marginLeft: "auto", color: "#888", fontSize: 11 }}>↓ scroll</span>
          </div>

          {/* Log scroll area */}
          <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "16px 24px 48px", background: "#0d0d0d" }}>

            {/* Shell prompt + boot */}
            <div style={{ color: "#69ff47", marginBottom: 4 }}>
              root@singsingai:~$ python3 session_engine.py --student={studentName.toLowerCase()} --grade={grade} --subject=maths-ch2
            </div>
            <div style={{ color: "#eee", marginBottom: 2 }}>SingSinghAI Engine v2.4.1 — initialising adaptive session</div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Loading student profile  →  {studentName.toLowerCase()}-grade{grade}.json  <span style={{ color: "#69ff47" }}>✓</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Curriculum               →  PNG-DoE-2024 · grade{grade} · maths-ch2  <span style={{ color: "#69ff47" }}>✓</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Adaptive engine          →  <span style={{ color: "#69ff47" }}>ACTIVE</span></div>
            <div style={{ color: "#eee", marginBottom: 2 }}>Path resolver            →  <span style={{ color: pathCol }}>{path.toUpperCase()}</span></div>
            <div style={{ color: "#555", margin: "14px 0 16px" }}>{"─".repeat(88)}</div>

            {/* Log entries */}
            {log.slice(0, visibleCount).map((e, i) => {
              const lineNum = String(i + 1).padStart(3, "0");
              const sentences = e.text.split(". ").filter(s => s.trim());
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ marginBottom: 14, display: "flex", gap: 0 }}
                >
                  {/* Line number */}
                  <span style={{ color: "#666", userSelect: "none", marginRight: 14, flexShrink: 0 }}>{lineNum}</span>

                  {/* Entry content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
                      <span style={{ color: "#ddd" }}>[{e.time}]&nbsp;</span>
                      <span style={{ color: LEVEL_COLOR[e.type], fontWeight: 700 }}>[{LEVEL_TAG[e.type]}]&nbsp;</span>
                      <span style={{ color: "#ccc" }}>ai.session.{e.type} ›</span>
                      <span style={{ color: "#fff", fontWeight: 700 }}>{e.label}</span>
                    </div>
                    {sentences.map((s, si) => (
                      <div key={si} style={{ color: "#f0f0f0", paddingLeft: 20, lineHeight: 1.75, marginTop: 1 }}>
                        <span style={{ color: "#aaa" }}>│ </span>{s.trim()}{si < sentences.length - 1 ? "." : ""}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Waiting cursor */}
            {visibleCount >= log.length && (
              <div style={{ display: "flex", marginTop: 6 }}>
                <span style={{ color: "#333", marginRight: 14 }}>{String(log.length + 1).padStart(3, "0")}</span>
                <span style={{ color: "#ddd" }}>[{log[log.length - 1]?.time}] [INFO    ] ai.session · awaiting next event&nbsp;</span>
                <span style={{ color: "#69ff47", opacity: blink ? 1 : 0 }}>█</span>
              </div>
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
  confidence: 38,
  responseTime: "16s avg",
  hints: 2,
  accuracy: "75%",
  currentDecision: "Meri — 2 errors on Q5 (3+3). Visual scaffold re-enabled. Tok Pisin first throughout. sum=6 gap flagged for next session.",
  mastery: [
    { name: "Addition visual", pct: 48 },
    { name: "Number bonds",    pct: 31 },
    { name: "Word problems",   pct: 22 },
    { name: "Tok Pisin read",  pct: 55 },
  ],
  log: [
    { type: "info",     label: "Session Started — Support Path",    text: "Meri · Grade 2 · Maths Ch.2. Profile analysis: lessonProgress 45%, streak 2 days. Support path assigned. Visual aids + Tok Pisin first enabled. 6 activities queued.", time: "14:28:01" },
    { type: "decision", label: "AI: Content Loaded",                text: "Slower response pattern in prior sessions detected. Visual emoji aids ON. Tok Pisin first. Smaller numbers selected: 2+3 story check, 2+1, 3+2, 4+1, 3+3, 4+2 basket.", time: "14:28:01" },
    { type: "info",     label: "Language Setting",                  text: "Language: Tok Pisin first. English translation shown below each question. No timer pressure on student-facing UI.", time: "14:28:02" },
    { type: "info",     label: "Story — Beni long Maket",           text: "Story loaded. Meri reading slide 1 of 6. Word-by-word narration active. AI observing reading pace and hesitation patterns.", time: "14:28:10" },
    { type: "info",     label: "Story — Slide 3",                   text: "Meri paused on slide 3 — Mama buys 2 mangoes. 8s dwell time. AI flagging this as a potential comprehension check point for Q1.", time: "14:28:42" },
    { type: "info",     label: "Story Complete",                    text: "All 6 story slides read. Total story time: 74s. Normal pace for support profile. Moving to activities.", time: "14:29:24" },
    { type: "info",     label: "Q1 — Story Check: 2+3",            text: "Question: 🥭🥭 + 🥥🥥🥥 = ? Visual emoji displayed. Tok Pisin: Mama i baim 2 mango na 3 kokonas. Hamas olgeta? Difficulty: 1.", time: "14:29:27" },
    { type: "success",  label: "Correct — Q1 (1st attempt)",        text: "Meri answered 5 in 18s. Correct. Story context aided recall. mastery[addition_visual]: 28% → 38%. hint_count: 0. Good start.", time: "14:29:45" },
    { type: "info",     label: "⚡ AI: Baseline Signal",             text: "Q1 correct — story-anchored question as expected. 18s response acceptable for support profile. Retaining full visual scaffold for Q2.", time: "14:29:46" },
    { type: "info",     label: "Q2 — Kauntim Banana: 2+1",         text: "Question: 🍌🍌 + 🍌 = ? Tok Pisin: Beni i gat 2 banana. Em i kisim 1 moa. Hamas nau? Difficulty: 1. AI watching for response time.", time: "14:29:50" },
    { type: "warning",  label: "Incorrect — Q2 attempt 1",         text: "Meri selected 4. Correct answer: 3. Error #1. Gentle redirect shown: Mmm kauntim gen wantaim mi. No penalty. hint_count: 1.", time: "14:30:04" },
    { type: "decision", label: "AI: Stay at Same Level",           text: "1 error on Q2 — insufficient signal to escalate. Keeping visual scaffold. Will not remove aids until 2 consecutive correct.", time: "14:30:05" },
    { type: "success",  label: "Correct — Q2 attempt 2",           text: "Meri answered 3 in 26s total. Self-corrected with emoji count. mastery[addition_visual]: 38% → 43%. Gentle praise rendered.", time: "14:30:16" },
    { type: "info",     label: "⚡ AI: Pace Noted",                 text: "Q2 took 26s across 2 attempts. Tok Pisin label retained. Visual emoji aids maintained. 1 error this session so far.", time: "14:30:17" },
    { type: "info",     label: "Q3 — Kokonas Basket: 3+2",         text: "Question: 🥥🥥🥥 + 🥥🥥 = ? Tok Pisin: Em i putim 3 kokonas long basket, bai em i kisim 2 moa. Hamas olgeta? Difficulty: 1.", time: "14:30:20" },
    { type: "success",  label: "Correct — Q3 (1st attempt)",        text: "Meri answered 5 in 14s. Correct. Faster than Q2. mastery[addition_visual]: 43% → 50%. consecutive_correct: 1. Improvement detected.", time: "14:30:34" },
    { type: "info",     label: "⚡ AI: Slight Improvement",         text: "Q3: 14s vs Q2: 26s. 1st attempt correct. Confidence score rising. Still retaining visual aids — need 2 consecutive to remove scaffold.", time: "14:30:35" },
    { type: "info",     label: "Q4 — Maket Maths: 4+1",           text: "Question: 🍌🍌🍌🍌 + 🍍 = ? Tok Pisin: Beni i holim 4 banana, em i kisim 1 pineapple. Hamas frut olgeta? Difficulty: 1.", time: "14:30:38" },
    { type: "success",  label: "Correct — Q4 (1st attempt)",        text: "Meri answered 5 in 11s. Fastest response so far. consecutive_correct: 2. mastery[addition_visual]: 50% → 56%. Confidence: 28% → 38%.", time: "14:30:49" },
    { type: "decision", label: "⚡ AI: Streak — Advancing",         text: "2 consecutive correct. Confidence rising. Advancing to next difficulty. Q5: 3+3 — both object groups new (papaya + papaya). Emoji scaffold retained.", time: "14:30:50" },
    { type: "info",     label: "Q5 — Papaya: 3+3",                 text: "Question: 🍈🍈🍈 + 🍈🍈🍈 = ? Tok Pisin: 3 kapaia long dispela han, 3 kapaia long narapela han. Hamas olgeta? Difficulty: 2. sum=6 is a common gap.", time: "14:30:53" },
    { type: "warning",  label: "Incorrect — Q5 attempt 1",         text: "Meri selected 5. Correct: 6. Error #1 on Q5. sum=6 gap confirmed. Gentle retry prompt shown. No penalty. total_errors: 2.", time: "14:31:09" },
    { type: "warning",  label: "Pattern — Q5 attempt 2",           text: "Meri selected 7. Correct: 6. Error #2 on same question. Consistent mis-estimation around sum=6. Flag: sum_to_6_gap=true.", time: "14:31:21" },
    { type: "decision", label: "AI: Full Support Mode",            text: "Emoji scaffold restored. Question re-phrased: count left group first, then right group, then add. No shame message. Full support mode active.", time: "14:31:22" },
    { type: "success",  label: "Correct — Q5 attempt 3",          text: "Meri answered 6 in 41s total with guided scaffold. Correct. mastery[number_bonds]: 22% → 31%. Flag persists for next session revision.", time: "14:31:38" },
    { type: "info",     label: "Q6 — Basket Story: 4+2",          text: "Question: 🧺 Meri i putim 4 mango na 2 kokonas long basket. Hamas frut i stap long basket? Difficulty: 2. First word-problem format.", time: "14:31:41" },
    { type: "success",  label: "Correct — Q6 (1st attempt)",       text: "Meri answered 6 in 16s. Correct. Read narrative, extracted numbers, added correctly. mastery[word_problems]: 15% → 22%. Confidence: 38% → 44%.", time: "14:31:57" },
    { type: "success",  label: "✅ Lesson Complete",               text: "Meri finished all 6 Adding Up activities. Grade 2 Maths Ch.2 complete. overall_mastery: 28% → 48%. streak: 2 → 3 days. total_errors: 3.", time: "14:31:58" },
    { type: "decision", label: "AI: Next Session Plan",            text: "Flag: sum_to_6_gap=true. Next session opens with visual 3+3 revision before advancing. Word-problem format showed promise — include 1 per session. Writing to student profile.", time: "14:31:59" },
  ],
};

export const TURA_LOG_DATA: AILogPageProps = {
  studentName: "Tura",
  grade: 2,
  subject: "Grade 2 Maths",
  chapter: "Ch.2 — Putim Wantaim (Adding Up)",
  path: "Challenge Path",
  pathColor: "#69ff47",
  confidence: 82,
  responseTime: "5s avg",
  hints: 0,
  accuracy: "100%",
  currentDecision: "Tura — 6/6 correct, 0 hints, avg 5s. Expert Q6 (8+5=13) solved in 6s. Full mastery. Recommend Ch.3 Kisim Ausait next session.",
  mastery: [
    { name: "Addition visual", pct: 95 },
    { name: "Number bonds",    pct: 88 },
    { name: "Word problems",   pct: 81 },
    { name: "Tok Pisin read",  pct: 72 },
  ],
  log: [
    { type: "info",     label: "Session Started — Challenge Path",  text: "Tura · Grade 2 · Maths Ch.2. Profile analysis: lessonProgress 72%, streak 5 days. Challenge path assigned. Visual scaffolding OFF. English primary. 6 activities queued.", time: "14:31:10" },
    { type: "decision", label: "AI: Content Loaded",               text: "High prior performance detected. Skipping visual scaffolding. Harder sequence loaded: story check 2+3 fast, 4+3, 5+4 word problem, 6+2 market, K7+K3 kina, 8+5 expert.", time: "14:31:10" },
    { type: "info",     label: "Language Setting",                 text: "Language: English primary. Tok Pisin shown as secondary label only. No emoji scaffold. No retry hints pre-loaded.", time: "14:31:11" },
    { type: "info",     label: "Story — Beni long Maket",          text: "Story loaded. Tura reading slide 1 of 6. AI observing navigation pace. Fast story traversal expected based on profile history.", time: "14:31:18" },
    { type: "info",     label: "Story — Fast Pace Detected",       text: "Tura tapped through slides 1–3 in under 20s. Comprehension signal strong from prior sessions. AI reducing observation weight on story slides.", time: "14:31:38" },
    { type: "info",     label: "Story Complete",                   text: "All 6 story slides tapped in 42s — above-average pace. Comprehension confirmed from profile. Moving to activities.", time: "14:32:00" },
    { type: "info",     label: "Q1 — Story Check: 2+3",           text: "Question: 2+3=? Text only — no emoji visual. Tok Pisin label only as secondary. difficulty: 1. Baseline signal for session calibration.", time: "14:32:02" },
    { type: "success",  label: "Strong Signal — Q1",              text: "Tura answered 5 in 2s. Correct on 1st attempt. Instant recall — story context not needed. mastery[addition_visual]: 82% → 87%. hint_count: 0.", time: "14:32:04" },
    { type: "decision", label: "⚡ AI: Scaffolding Confirmed Off",  text: "Q1 answered in 2s — well above threshold. Visual aids remain hidden for entire session. Advancing immediately to higher difficulty.", time: "14:32:05" },
    { type: "info",     label: "Q2 — Think Fast: 4+3",            text: "Question: 4+3=? No visual. Text only. difficulty: 2. Slightly harder number pair. AI monitoring response speed continuity.", time: "14:32:07" },
    { type: "success",  label: "Strong Signal — Q2",              text: "Tura answered 7 in 4s. Correct. No hints. consecutive_correct: 2. mastery[number_bonds]: 75% → 82%. confidence: 68% → 76%.", time: "14:32:11" },
    { type: "decision", label: "⚡ AI: Pattern Confirmed",         text: "2 correct in avg 3s. Consistent high performance. No-scaffold mode maintained. Q3 escalates to full word problem format.", time: "14:32:12" },
    { type: "info",     label: "Q3 — Word Problem: 5+4",          text: "Question: Beni has 5 mangoes in his bag. He buys 4 more at the market. How many does he have now? difficulty: 2. No visual. Narrative extraction required.", time: "14:32:14" },
    { type: "success",  label: "Strong Signal — Q3",              text: "Tura answered 9 in 5s. Extracted numbers from narrative, computed correctly. consecutive_correct: 3. mastery[word_problems]: 58% → 71%.", time: "14:32:19" },
    { type: "decision", label: "⚡ AI: Streak — Escalating",       text: "3-answer streak confirmed. Advancing to compact multi-object problem. Q4: 6 coconuts + 2 papayas. Grouping complexity increased.", time: "14:32:20" },
    { type: "info",     label: "Q4 — Market Stall: 6+2",          text: "Question: 🥥×6 ➕ 🍈×2 = ? Compact emoji notation — compact grouping challenge. difficulty: 3. Two different object types.", time: "14:32:22" },
    { type: "success",  label: "Correct — Q4",                   text: "Tura answered 8 in 5s. Correct. Handled grouped emoji notation without slowing. consecutive_correct: 4. mastery[addition_visual]: 87% → 92%.", time: "14:32:27" },
    { type: "decision", label: "⚡ AI: Escalating to Currency",    text: "4-answer streak. Advancing to real-world financial context — Kina (PNG currency). Grade 2 ceiling content unlocked.", time: "14:32:28" },
    { type: "info",     label: "Q5 — Real World: K7+K3",          text: "Question: Mama spent K7 on fruit and K3 on fish at the market. How many kina did she spend? difficulty: 3. PNG financial context.", time: "14:32:30" },
    { type: "success",  label: "Strong Signal — Q5",              text: "Tura answered K10 in 5s. Correct. Extracted addition from financial narrative. No hesitation. mastery[word_problems]: 71% → 81%. confidence: 76% → 87%.", time: "14:32:35" },
    { type: "decision", label: "⚡ AI: Expert Level Unlocked",     text: "5-answer streak. confidence: 87%. Unlocking expert Q6 — double-digit addition (8+5). Outside standard Grade 2 scope. Flagging as ceiling probe.", time: "14:32:36" },
    { type: "info",     label: "Q6 — Expert: 8+5",               text: "Question: Uncle has 8 baskets of corn. He brings 5 more from the garden. How many baskets now? difficulty: 4. Double-digit result. Expert ceiling probe.", time: "14:32:38" },
    { type: "success",  label: "✅ Expert Mastery — Q6",          text: "Tura answered 13 in 6s. Correct. Double-digit addition solved without visual aid. 6/6 correct. hints: 0. avg_response: 4.5s. session_mastery: 95%.", time: "14:32:44" },
    { type: "success",  label: "✅ Lesson Complete — Full Mastery", text: "Tura finished all 6 activities. accuracy: 100%. hints: 0. avg_response: 4.5s. Grade 2 Maths Ch.2 complete at expert level. streak: 5 → 6 days.", time: "14:32:45" },
    { type: "decision", label: "AI: Next Session Plan",           text: "Tura exceeded Grade 2 Ch.2 ceiling. Expert Q6 (8+5) solved in 6s confirms high readiness. Recommend: Ch.3 Kisim Ausait (Taking Away). Writing to student profile.", time: "14:32:46" },
  ],
};
