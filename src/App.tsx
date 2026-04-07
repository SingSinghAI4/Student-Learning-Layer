import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { StudentProfile } from "./LoginScreen";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { Screen, ActivityMode, AIEntry, MasteryItem } from "./types";
import { DIAG_QUESTIONS, AVATARS, STORY_PAGES, STORY_PAGES_2, ACTIVITIES, ACTIVITIES_2,
         MATHS_STORY_PAGES, MATHS_ACTIVITIES_MERI, MATHS_ACTIVITIES_SIONE } from "./data";
import { nowStr } from "./utils";
import DiagnosticScreen from "./components/DiagnosticScreen";
import SessionScreen from "./components/SessionScreen";
import CelebrationScreen from "./components/CelebrationScreen";
import Dashboard from "./components/Dashboard";
import SubjectScreen from "./components/SubjectScreen";
import ChapterScreen from "./components/ChapterScreen";
import AIPanel from "./components/AIPanel";
import { SubjectId } from "./data";


interface AppProps {
  profile: StudentProfile;
  isNew: boolean;
  onSessionEnd: () => void;
}

export default function App({ profile, isNew, onSessionEnd }: AppProps) {
  const [lang, setLang] = useState<"tok" | "en">("tok");
  const [screen, setScreen] = useState<Screen>("subject");
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>("english");
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [mathsPath, setMathsPath] = useState<"meri" | "sione" | null>(null);

  const [selectedAvatar] = useState<number>(profile.avatarIdx);
  const [selectedGrade] = useState<number>(profile.grade);

  // ── Diagnostic state ──
  const [diagStep, setDiagStep] = useState(0);
  const [diagAnswered, setDiagAnswered] = useState<(number | null)[]>(Array(5).fill(null));
  const [diagAILog, setDiagAILog] = useState<AIEntry[]>([]);
  const [diagPlaced, setDiagPlaced] = useState(false);
  const [diagPlacement, setDiagPlacement] = useState("");

  // ── Session state ──
  const [sessionMode, setSessionMode] = useState<ActivityMode>("story");
  const [storyPage, setStoryPage] = useState(0);
  const [litWordIdx, setLitWordIdx] = useState(-1);
  const [actIdx, setActIdx] = useState(0);
  const [actSelected, setActSelected] = useState<string | null>(null);
  const [actWrong, setActWrong] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(20);
  const [sessionAILog, setSessionAILog] = useState<AIEntry[]>([]);
  const [currentDecision, setCurrentDecision] = useState("Waiting for student interaction...");
  const [masteryData, setMasteryData] = useState<MasteryItem[]>([
    { name: "Counting",      pct: 34 },
    { name: "Letter sounds", pct: 22 },
    { name: "Subtraction",   pct: 18 },
    { name: "Sentences",     pct: 10 },
  ]);
  const [responseTime, setResponseTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [accuracy, setAccuracy] = useState("—");
  const [tutorMsg, setTutorMsg] = useState({
    tok: `${profile.name}, welkam! Tude bai yumi lainim counting wantaim.`,
    en:  `${profile.name}, welcome! Today we will learn counting together.`,
  });
  const [showTutor, setShowTutor] = useState(true);
  const startTimeRef = useRef(Date.now());

  // ── Dashboard state ──
  const [dashFilter, setDashFilter] = useState<"all" | "attention" | "flying" | "inactive">("all");

  // ── AI confidence + streak tracking ──
  const [confidence, setConfidence] = useState(50);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  // ── Chapter progression ──
  const [chapter, setChapter] = useState(1);

  const logRef = useRef<HTMLDivElement>(null);

  // ── Initialise returning student ──
  useEffect(() => {
    if (!isNew && profile.placement) {
      setDiagPlaced(true);
      setDiagPlacement(profile.placement);
      setSessionProgress(profile.lessonProgress > 0 ? profile.lessonProgress : 20);
      setConfidence(Math.min(40 + profile.lessonProgress / 2, 85));
      // Returning users still start at subject screen — they can continue or pick new subject
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Subject / Chapter handlers ──
  function handleSubjectSelect(id: SubjectId) {
    setSelectedSubject(id);
    setScreen("chapter");
  }

  function handleChapterSelect(chapterId: number) {
    setSelectedChapter(chapterId);

    // Maths Ch.2 — individualised demo (Meri = slow, Sione = fast, others = Meri path)
    if (selectedSubject === "maths" && chapterId === 2) {
      // Path determined by student's actual learning history — not by name
      // High progress (≥55%) + consistent streak (≥3) → challenge path
      const isConfident = profile.lessonProgress >= 55 && profile.streak >= 3;
      setMathsPath(isConfident ? "sione" : "meri");
      const learnerType = isConfident ? "Fast Learner" : "Needs Support";
      const pathNote = isConfident
        ? `High prior performance detected. Skipping visual scaffolding. Harder numbers loaded (4+3, 5+4, 6+2, word problem with Kina).`
        : `Slower response pattern in prior sessions. Visual emoji aids enabled. Tok Pisin first. Smaller numbers (2+1, 3+2, 4+1).`;
      const langNote = isConfident
        ? `Language: English primary. Tok Pisin as secondary label only.`
        : `Language: Tok Pisin first. English translation shown below each question.`;
      setScreen("session");
      setSessionMode("story");
      setStoryPage(0);
      setSessionProgress(20);
      setConsecutiveCorrect(0);
      setConfidence(isConfident ? 68 : 35);
      setSessionAILog([
        { type: "info",     label: "Maths Ch.2 — Putim Wantaim",   text: `${profile.name} · Grade 2 Maths · Adding Up. Story: "Beni long Maket".`, time: nowStr() },
        { type: "decision", label: "AI: Profile Analysis",          text: `${profile.name} — Progress: ${profile.lessonProgress}% · Streak: ${profile.streak} days. Path assigned: ${learnerType}.`, time: nowStr() },
        { type: "decision", label: "AI: Content Loaded",            text: pathNote, time: nowStr() },
        { type: "info",     label: "Language Setting",              text: langNote, time: nowStr() },
      ]);
      setCurrentDecision(`${profile.name} — ${learnerType} path. Story loading…`);
      return;
    }

    if (!isNew && profile.placement) {
      // Returning student — skip diagnostic, go straight to session
      const streakBonus = profile.streak >= 5 ? "🔥 5-day streak — AI boosting difficulty." : profile.streak >= 3 ? `${profile.streak}-day streak active.` : "Returning student.";
      setScreen("session");
      setSessionMode("story");
      setStoryPage(0);
      setSessionAILog([
        { type: "info",     label: "Session Resumed",  text: `${profile.name} is back. ${streakBonus} Last session: ${profile.lessonProgress}% complete.`, time: nowStr() },
        { type: "decision", label: "Placement Active", text: `Level confirmed: ${profile.placement}. Chapter ${chapterId} selected. No re-testing needed.`, time: nowStr() },
      ]);
      setCurrentDecision(`${profile.name} resumed — story narration loading`);
    } else {
      setScreen("diagnostic");
    }
  }

  // ── Auto-scroll AI log ──
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [sessionAILog, diagAILog]);

  // ── Word highlight ──
  useEffect(() => {
    if (sessionMode !== "story") return;
    const pages = mathsPath != null ? MATHS_STORY_PAGES
      : chapter === 1 ? STORY_PAGES : STORY_PAGES_2;
    if (!pages[storyPage]) return;
    const { words } = pages[storyPage];
    setLitWordIdx(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= words.length) { clearInterval(iv); setLitWordIdx(-1); }
      else setLitWordIdx(i);
    }, 600);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyPage, sessionMode]);

  // ── Diagnostic handlers ──
  function addDiagLog(entry: AIEntry) {
    setDiagAILog(prev => [...prev, entry]);
  }

  function handleDiagAnswer(optIdx: number) {
    if (diagAnswered[diagStep] !== null) return;
    const q = DIAG_QUESTIONS[diagStep];
    const correct = q.correct === optIdx;
    const newAnswered = [...diagAnswered];
    newAnswered[diagStep] = optIdx;
    setDiagAnswered(newAnswered);

    addDiagLog({
      type: correct ? "success" : "warning",
      label: correct ? `Q${diagStep + 1} — ${q.topic}` : `Gap Detected — ${q.topic}`,
      text: `${profile.name}: ${correct ? q.correctReason : q.wrongReason}`,
      time: nowStr(),
    });

    setTimeout(() => {
      if (diagStep < 4) {
        setDiagStep(s => s + 1);
        const nextQ = DIAG_QUESTIONS[diagStep + 1];
        addDiagLog({ type: "info", label: "Next Assessment", text: `Testing: ${nextQ.topic}. Watching for response pattern.`, time: nowStr() });
      } else {
        const score = newAnswered.filter((a, i) => a === DIAG_QUESTIONS[i].correct).length;
        const gaps = newAnswered
          .map((a, i) => a !== DIAG_QUESTIONS[i].correct ? DIAG_QUESTIONS[i].topic : null)
          .filter(Boolean);
        const placement = score <= 2 ? "Early Grade 1 — Foundational" : score <= 3 ? "Mid Grade 1 — Building" : "Grade 2 — On Track";
        const placementNote = score <= 2
          ? `Multiple gaps found (${gaps.slice(0, 2).join(", ")}). Starting with visual-first foundational content.`
          : score <= 3
          ? `Counting solid, some literacy gaps. Balanced story + phonics approach selected.`
          : `Strong across all domains. Pushing to higher-level content immediately.`;
        setDiagPlacement(placement);
        setDiagPlaced(true);
        setConfidence(30 + score * 10);
        addDiagLog({ type: "decision", label: "AI Placement Complete", text: `Score ${score}/5 · ${placement}. ${placementNote}`, time: nowStr() });
      }
    }, 900);
  }

  // ── Session handlers ──
  function addSessionLog(entry: AIEntry) {
    setSessionAILog(prev => [...prev.slice(-20), entry]);
  }

  function startSession() {
    setScreen("session");
    setSessionMode("story");
    setStoryPage(0);
    setSessionProgress(20);
    setConsecutiveCorrect(0);
    setSessionAILog([
      { type: "info",     label: "Session Started",  text: `${profile.name} · Grade ${selectedGrade} · Placement: ${diagPlacement}. Narration language: Tok Pisin.`, time: nowStr() },
      { type: "decision", label: "Content Matched",  text: `Story "Beni na Mango" selected — mango counting aligns with ${profile.name}'s diagnostic gaps. Dual-language captions active.`, time: nowStr() },
    ]);
    setCurrentDecision(`${profile.name} — story mode. Word-by-word narration active.`);
  }

  function handleNextStoryPage() {
    const isMathsDemo = mathsPath != null;
    const pages = isMathsDemo ? MATHS_STORY_PAGES
      : chapter === 1 ? STORY_PAGES : STORY_PAGES_2;
    if (storyPage < pages.length - 1) {
      setStoryPage(p => p + 1);
      setSessionProgress(p => Math.min(p + 6, isMathsDemo ? 45 : chapter === 1 ? 45 : 90));
    } else {
      setSessionMode("activity");
      setActIdx(0);
      setActSelected(null);
      setActWrong(null);
      startTimeRef.current = Date.now();
      const chLabel = chapter === 1 ? "Chapter 1" : "Chapter 2";
      setCurrentDecision(`${chLabel} activities — monitoring response time and accuracy`);
      setShowTutor(true);
      setTutorMsg({ tok: "Gutpela! Nau yumi traim wanpela askim.", en: "Well done! Now let's try a question." });
      addSessionLog({ type: "info", label: `${chLabel} Story Complete`, text: `Story finished. Switching to ${chLabel} activities. AI monitoring response latency.`, time: nowStr() });
    }
  }

  function handleActivityAnswer(val: string) {
    if (actSelected) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setResponseTime(elapsed);
    const isMathsDemo = mathsPath !== null;
    const currentActivities = isMathsDemo
      ? (mathsPath === "sione" ? MATHS_ACTIVITIES_SIONE : MATHS_ACTIVITIES_MERI)
      : chapter === 1 ? ACTIVITIES : ACTIVITIES_2;
    const act = currentActivities[actIdx];
    const correct = val === act.correct;

    if (correct) {
      setActSelected(val);
      const fast = elapsed < 8;
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setConfidence(c => Math.min(c + (fast ? 14 : 7), 99));

      const newMastery = masteryData.map((m, i) =>
        i === 0 ? { ...m, pct: Math.min(m.pct + (fast ? 12 : 6), 99) } : m,
      );
      setMasteryData(newMastery);
      setAccuracy("Correct ✓");

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ["#FFD93D", "#52B788", "#A8DADC"] });

      const streakNote = newStreak >= 3 ? ` ${newStreak} correct in a row — confidence threshold crossed.` : newStreak === 2 ? " 2 correct in a row." : "";
      addSessionLog({
        type: fast ? "success" : "info",
        label: fast && hintsUsed === 0 ? "Strong Mastery Signal" : "Correct",
        text: `${profile.name} answered ${act.label} in ${elapsed}s — ${hintsUsed === 0 ? "no hints" : `${hintsUsed} hint`}.${streakNote} Mastery: ${masteryData[0].pct}% → ${newMastery[0].pct}%.`,
        time: nowStr(),
      });

      if (fast && hintsUsed === 0) {
        const advanceNote = newStreak >= 3
          ? `${profile.name} on a ${newStreak}-answer streak — bumping to harder content.`
          : `${profile.name} answered in ${elapsed}s with no hints — advancing difficulty.`;
        setCurrentDecision(advanceNote);
        addSessionLog({ type: "decision", label: "AI Decision", text: `Fast + no hints = advancing. Next activity will be harder. Mastery ceiling raised.`, time: nowStr() });
      } else {
        setCurrentDecision(`${profile.name} correct (${elapsed}s) — reinforcing same concept level`);
      }

      setSessionProgress(p => Math.min(p + 15, 95));
      setShowTutor(true);
      setTutorMsg({ tok: `YES! Gutpela wok tru, ${AVATARS[selectedAvatar].tok}!`, en: "YES! Excellent work!" });

      setTimeout(() => {
        const currentActivities = isMathsDemo
          ? (mathsPath === "sione" ? MATHS_ACTIVITIES_SIONE : MATHS_ACTIVITIES_MERI)
          : chapter === 1 ? ACTIVITIES : ACTIVITIES_2;
        if (actIdx < currentActivities.length - 1) {
          setActIdx(i => i + 1);
          setActSelected(null);
          setActWrong(null);
          setHintsUsed(0);
          startTimeRef.current = Date.now();
          setShowTutor(false);
          // Maths demo: live AI log on advancement
          if (isMathsDemo) {
            if (mathsPath === "sione" && fast && hintsUsed === 0) {
              addSessionLog({ type: "decision", label: "⚡ AI: Scaffolding Removed", text: `${profile.name} — no hints, fast response. Visual aids hidden. Moving to harder number combination.`, time: nowStr() });
            } else if (mathsPath === "meri" && !fast) {
              addSessionLog({ type: "info", label: "⚡ AI: Pace Noted", text: `${profile.name} — slower response (${elapsed}s). Tok Pisin label kept. Visual emoji aids maintained for next question.`, time: nowStr() });
            }
          }
        } else if (isMathsDemo) {
          // Maths demo complete → celebration
          addSessionLog({ type: "success", label: "✅ Lesson Complete", text: `${profile.name} finished all ${currentActivities.length} Adding Up activities. Grade 2 Maths Ch.2 — Putim Wantaim ✓`, time: nowStr() });
          setScreen("celebration");
        } else if (chapter === 1) {
          // Chapter 1 done → transition to Chapter 2
          const diffNote = confidence >= 70
            ? `${profile.name}'s confidence: ${confidence}%. Bumping Chapter 2 to Grade 2 difficulty.`
            : `Moving to Chapter 2 — literacy focus. Adjusting content for ${profile.name}.`;
          setChapter(2);
          setSessionMode("chapter-break" as any);
          setConsecutiveCorrect(0);
          addSessionLog({ type: "decision", label: "Chapter 2 Unlocked", text: diffNote, time: nowStr() });
          addSessionLog({ type: "info", label: "Lab Supervisor Alert", text: "Peni (3d inactive) — AI flagging for in-person check-in. Digital reach failed. Human follow-up needed.", time: nowStr() });
          setTimeout(() => {
            setSessionMode("story");
            setStoryPage(0);
            setActSelected(null);
            setActWrong(null);
            setHintsUsed(0);
            setShowTutor(true);
            setTutorMsg({ tok: "Gutpela tru! Nau yumi ritim narapela stori.", en: "Excellent! Now let's read another story." });
            setCurrentDecision(`Chapter 2 — "Kila na Solwara" — phonics + comprehension`);
            addSessionLog({ type: "info", label: "Story 2 Loading", text: `"Kila na Solwara" — beach & animals theme. Targeting phonics and reading comprehension.`, time: nowStr() });
          }, 2200);
        } else {
          setScreen("celebration");
        }
      }, 1400);
    } else {
      setActWrong(val);
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setHintsUsed(h => h + 1);
      setConsecutiveCorrect(0);
      setConfidence(c => Math.max(c - 8, 5));
      setAccuracy("Needs Support");

      const isMathsDemoWrong = selectedSubject === "maths" && selectedChapter === 2;
      addSessionLog({
        type: "warning",
        label: newWrong >= 2 ? "Pattern Detected" : "Incorrect Response",
        text: newWrong >= 2
          ? `${profile.name} — 2nd error on ${act.label}. Consistent gap. AI switching to visual scaffold.`
          : `${profile.name} selected wrong on ${act.label}. Error #${newWrong}. Gentle redirect — no penalty recorded.`,
        time: nowStr(),
      });

      if (newWrong >= 2) {
        setCurrentDecision(`${profile.name} — 2 errors on this concept. Visual support activated.`);
        addSessionLog({ type: "decision", label: "AI Intervention", text: `Visual scaffold activated. Simplified layout. No shame message. ${profile.name} gets full support.`, time: nowStr() });
        if (isMathsDemoWrong) {
          addSessionLog({ type: "decision", label: "⚡ AI: Maths Support", text: `Emoji visual restored. Question re-phrased in Tok Pisin. Reducing answer choices from 3 to visual match.`, time: nowStr() });
        }
        setShowTutor(true);
        setTutorMsg({ tok: "No wari. Yumi lukim dispela wantaim.", en: "No worries. Let's look at this together." });
      } else {
        setShowTutor(true);
        setTutorMsg(
          isMathsDemoWrong
            ? { tok: "Mmm... kauntim gen wantaim mi. Yu inap!", en: "Hmm... count again with me. You can do it!" }
            : { tok: "Mmm... traim gen. Yu inap!", en: "Hmm... try again. You can do it!" }
        );
        setCurrentDecision(`${profile.name} — one error, staying at same difficulty. Encouragement active.`);
      }

      setTimeout(() => setActWrong(null), 800);
    }
  }

  // ── Render ──
  return (
    <div className="app">
      {/* Student info bar — top left */}
      <div className="student-bar">
        {/* Avatar */}
        <div className="sbar-avatar" style={{ background: "#1a3a2a", borderColor: "#52B788" }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        {/* Name + grade */}
        <div className="sbar-info">
          <div className="sbar-name">{profile.name}</div>
          <div className="sbar-grade">Grade {profile.grade}</div>
        </div>
        {/* Divider */}
        <div className="sbar-divider"/>
        {/* Streak */}
        <div className="sbar-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-5-6-11-6-11z" fill="#FF6B35"/>
            <path d="M12 8C12 8 9 12 9 14.5a3 3 0 006 0C15 12 12 8 12 8z" fill="#FFD93D"/>
          </svg>
          <span>{profile.streak ?? 0}</span>
        </div>
        {/* Stars */}
        <div className="sbar-stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.9 6.4 7 .7-5.1 4.8 1.5 6.9L12 17.7l-6.3 3.1 1.5-6.9L2.1 9.1l7-.7z" fill="#FFD93D"/>
          </svg>
          <span>12</span>
        </div>
      </div>

      {/* Language toggle */}
      <div className="lang-toggle-wrap">
        <button className={`lang-btn${lang === "tok" ? " active" : ""}`} onClick={() => setLang("tok")}>Tok Pisin</button>
        <button className={`lang-btn${lang === "en"  ? " active" : ""}`} onClick={() => setLang("en")}>English</button>
      </div>

      {/* Screens */}
      <AnimatePresence mode="wait">
        {screen === "subject" && (
          <motion.div key="subject" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "contents" }}>
            <SubjectScreen profile={profile} onSelect={handleSubjectSelect} />
          </motion.div>
        )}

        {screen === "chapter" && (
          <motion.div key="chapter" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} style={{ display: "contents" }}>
            <ChapterScreen profile={profile} subjectId={selectedSubject} onSelect={handleChapterSelect} onBack={() => setScreen("subject")} />
          </motion.div>
        )}

        {screen === "diagnostic" && (
          <motion.div key="diagnostic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "contents" }}>
            <DiagnosticScreen
              profile={profile} lang={lang}
              diagStep={diagStep} diagAnswered={diagAnswered}
              diagAILog={diagAILog} diagPlaced={diagPlaced} diagPlacement={diagPlacement}
              onAnswer={handleDiagAnswer} onStartSession={startSession}
              logRef={logRef}
            />
          </motion.div>
        )}

        {screen === "session" && (
          <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "contents" }}>
            <SessionScreen
              profile={profile} lang={lang}
              selectedAvatar={selectedAvatar} selectedGrade={selectedGrade}
              diagPlacement={diagPlacement} sessionMode={sessionMode}
              storyPage={storyPage} litWordIdx={litWordIdx}
              actIdx={actIdx} actSelected={actSelected} actWrong={actWrong}
              sessionProgress={sessionProgress} showTutor={showTutor} tutorMsg={tutorMsg}
              chapter={chapter} consecutiveCorrect={consecutiveCorrect}
              mathsPath={mathsPath}
              onNextStoryPage={handleNextStoryPage} onActivityAnswer={handleActivityAnswer}
            />
          </motion.div>
        )}

        {screen === "celebration" && (
          <motion.div key="celebration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "contents" }}>
            <CelebrationScreen
              profile={profile} lang={lang}
              onDashboard={() => setScreen("dashboard")}
              onSessionEnd={onSessionEnd}
            />
          </motion.div>
        )}

        {screen === "dashboard" && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: "contents" }}>
            <Dashboard
              lang={lang} dashFilter={dashFilter}
              setDashFilter={setDashFilter} onSessionEnd={onSessionEnd}
            />
          </motion.div>
        )}

        {screen === "ai-monitor" && (
          <motion.div key="ai-monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ display: "flex", flex: 1, overflow: "hidden", background: "#0a1a0f" }}>
            <div style={{ width: "100%", overflowY: "auto", padding: "24px 0" }}>
              <div style={{ textAlign: "center", color: "#52B788", fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12, opacity: 0.6 }}>
                TEACHER VIEW — NOT VISIBLE TO STUDENT
              </div>
              <AIPanel
                profile={profile}
                selectedGrade={selectedGrade}
                responseTime={responseTime}
                hintsUsed={hintsUsed}
                accuracy={accuracy}
                confidence={confidence}
                sessionMode={sessionMode}
                masteryData={masteryData}
                currentDecision={currentDecision}
                sessionAILog={sessionAILog}
                logRef={logRef}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav tabs */}
      <div className="nav-tabs">
        <button className={`nav-tab${screen === "subject" || screen === "chapter" ? " active" : ""}`} onClick={() => setScreen("subject")}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <rect x="9" y="14" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>Subjects
        </button>
        <button className={`nav-tab${screen === "diagnostic" ? " active" : ""}`} onClick={() => setScreen("diagnostic")}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12h2l2-4 2 8 2-4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>Diagnostic
        </button>
        <button className={`nav-tab${screen === "session" ? " active" : ""}`} onClick={() => { if (diagPlaced) startSession(); }}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 14l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>Session
        </button>
        <button className={`nav-tab${screen === "celebration" ? " active" : ""}`} onClick={() => setScreen("celebration")}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.9 6.4 7 .7-5.1 4.8 1.5 6.9L12 17.7l-6.3 3.1 1.5-6.9L2.1 9.1l7-.7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </span>Celebrate
        </button>
        <button className={`nav-tab${screen === "dashboard" ? " active" : ""}`} onClick={() => setScreen("dashboard")}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="13" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="10" y="8" width="5" height="13" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="17" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>Class View
        </button>
        <button className={`nav-tab${screen === "ai-monitor" ? " active" : ""}`} onClick={() => setScreen("ai-monitor")}>
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>AI Log
        </button>
      </div>
    </div>
  );
}
