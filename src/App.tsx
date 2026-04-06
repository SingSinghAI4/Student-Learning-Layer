import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { StudentProfile } from "./LoginScreen";

// ── TYPES ──────────────────────────────────────────────
type Screen = "diagnostic" | "session" | "dashboard" | "celebration";
type ActivityMode = "story" | "activity" | "redirect";

interface AppProps {
  profile: StudentProfile;
  isNew: boolean;
}

// ── DATA ───────────────────────────────────────────────
const AVATARS = [
  { emoji: "🦜", name: "Bird of Paradise", tok: "Pisin Paradais" },
  { emoji: "🦘", name: "Cassowary", tok: "Muruk" },
  { emoji: "🐊", name: "Crocodile", tok: "Pukpuk" },
  { emoji: "🐢", name: "Turtle", tok: "Honu" },
  { emoji: "🦋", name: "Butterfly", tok: "Bataplai" },
  { emoji: "🐠", name: "Coral Fish", tok: "Pis Solwara" },
];

const DIAG_QUESTIONS = [
  {
    q: "Which picture shows 3 coconuts?",
    tok: "Wanem piksa i soim 3 kokonas?",
    options: [
      { emoji: "🥥🥥", label: "2", tok: "Tu" },
      { emoji: "🥥🥥🥥", label: "3", tok: "Tri" },
      { emoji: "🥥", label: "1", tok: "Wan" },
      { emoji: "🥥🥥🥥🥥", label: "4", tok: "Foa" },
    ],
    correct: 1,
  },
  {
    q: 'Which word starts with the letter "M"?',
    tok: 'Wanem wod i stat long leta "M"?',
    options: [
      { emoji: "🍌", label: "Banana", tok: "Banana" },
      { emoji: "🥭", label: "Mango", tok: "Mango" },
      { emoji: "🍠", label: "Potato", tok: "Poteito" },
      { emoji: "🐟", label: "Fish", tok: "Pis" },
    ],
    correct: 1,
  },
  {
    q: "Meri has 5 mangoes. She gives 2 away. How many left?",
    tok: "Meri i gat 5 mango. Em i givim 2. Hamas i stap?",
    options: [
      { emoji: "2", label: "2", tok: "Tu" },
      { emoji: "4", label: "4", tok: "Foa" },
      { emoji: "3", label: "3", tok: "Tri" },
      { emoji: "7", label: "7", tok: "Sevn" },
    ],
    correct: 2,
  },
  {
    q: "Which animal lives in the sea?",
    tok: "Wanem animal i stap long solwara?",
    options: [
      { emoji: "🐊", label: "Crocodile", tok: "Pukpuk" },
      { emoji: "🦜", label: "Bird", tok: "Pisin" },
      { emoji: "🐠", label: "Fish", tok: "Pis" },
      { emoji: "🐷", label: "Pig", tok: "Pik" },
    ],
    correct: 2,
  },
  {
    q: "Which sentence is correct?",
    tok: "Wanem tok i stret?",
    options: [
      { emoji: "📝", label: "Dog run fast", tok: "Dok i ran fas" },
      { emoji: "📝", label: "The dog runs fast", tok: "Dok i ran fas tru" },
      { emoji: "📝", label: "Run dog fast the", tok: "Ran dok fas" },
      { emoji: "📝", label: "Fast dog the run", tok: "Fas dok ran" },
    ],
    correct: 1,
  },
];

const STORY_PAGES = [
  {
    scene: "🌄🏡🌿",
    tok: "Long moning tru, Beni i kirap.",
    en: "Early in the morning, Beni woke up.",
    words: ["Long", "moning", "tru,", "Beni", "i", "kirap."],
  },
  {
    scene: "🌿🥭🧺",
    tok: "Em i go long gaden bilong mama.",
    en: "He went to his mother's garden.",
    words: ["Em", "i", "go", "long", "gaden", "bilong", "mama."],
  },
  {
    scene: "🥭🥭🥭🥭🥭",
    tok: "Beni i lukim 5-pela mango i stap.",
    en: "Beni saw 5 mangoes on the tree.",
    words: ["Beni", "i", "lukim", "5-pela", "mango", "i", "stap."],
  },
  {
    scene: "👵🥭🥭🥭",
    tok: "Tumbuna meri i kam na kisim 3.",
    en: "Grandmother came and took 3.",
    words: ["Tumbuna", "meri", "i", "kam", "na", "kisim", "3."],
  },
  {
    scene: "🤔🥭🥭",
    tok: "Hamas mango i stap yet?",
    en: "How many mangoes are left?",
    words: ["Hamas", "mango", "i", "stap", "yet?"],
  },
];

const ACTIVITIES = [
  {
    mode: "count" as const,
    label: "Kauntim (Counting)",
    q: "How many mangoes are left?",
    tok: "Hamas mango i stap yet?",
    visual: "🥭🥭",
    options: [
      { val: "1", label: "1", tok: "Wan" },
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
    ],
    correct: "2",
  },
  {
    mode: "word" as const,
    label: "Ritim (Reading)",
    q: 'Which picture matches the word "MANGO"?',
    tok: 'Wanem piksa i makim wod "MANGO"?',
    visual: "",
    options: [
      { val: "mango", label: "🥭", tok: "Mango" },
      { val: "fish", label: "🐟", tok: "Pis" },
      { val: "bird", label: "🦜", tok: "Pisin" },
    ],
    correct: "mango",
  },
  {
    mode: "math" as const,
    label: "Matematik",
    q: "5 take away 3 equals?",
    tok: "5 mainas 3 em i wanem namba?",
    visual: "🥭🥭🥭🥭🥭  ➡  🥭🥭🥭❌❌",
    options: [
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
      { val: "4", label: "4", tok: "Foa" },
    ],
    correct: "2",
  },
];

const CLASS_STUDENTS = [
  {
    name: "Kila",
    emoji: "🦜",
    grade: 2,
    status: "flying" as const,
    mastery: 87,
    skill: "Addition",
    time: "12m",
  },
  {
    name: "Beni",
    emoji: "🦘",
    grade: 2,
    status: "attention" as const,
    mastery: 34,
    skill: "Letter b/d",
    time: "18m",
  },
  {
    name: "Meri",
    emoji: "🐢",
    grade: 2,
    status: "on-track" as const,
    mastery: 65,
    skill: "Counting",
    time: "15m",
  },
  {
    name: "Tama",
    emoji: "🐠",
    grade: 2,
    status: "on-track" as const,
    mastery: 71,
    skill: "Sentences",
    time: "14m",
  },
  {
    name: "Saina",
    emoji: "🦋",
    grade: 2,
    status: "on-track" as const,
    mastery: 68,
    skill: "Subtraction",
    time: "16m",
  },
  {
    name: "Peni",
    emoji: "🦜",
    grade: 2,
    status: "inactive" as const,
    mastery: 20,
    skill: "Phonics",
    time: "3d ago",
  },
  {
    name: "Hera",
    emoji: "🐊",
    grade: 2,
    status: "flying" as const,
    mastery: 91,
    skill: "Word Matching",
    time: "10m",
  },
  {
    name: "Walo",
    emoji: "🐢",
    grade: 2,
    status: "attention" as const,
    mastery: 41,
    skill: "Number bonds",
    time: "20m",
  },
  {
    name: "Karo",
    emoji: "🦋",
    grade: 2,
    status: "on-track" as const,
    mastery: 73,
    skill: "Reading",
    time: "13m",
  },
  {
    name: "Naomi",
    emoji: "🐠",
    grade: 2,
    status: "on-track" as const,
    mastery: 60,
    skill: "Counting",
    time: "17m",
  },
  {
    name: "Soki",
    emoji: "🦜",
    grade: 2,
    status: "flying" as const,
    mastery: 84,
    skill: "Sentences",
    time: "11m",
  },
  {
    name: "Waina",
    emoji: "🐊",
    grade: 2,
    status: "attention" as const,
    mastery: 38,
    skill: "Letter sounds",
    time: "22m",
  },
  {
    name: "John",
    emoji: "🦘",
    grade: 2,
    status: "on-track" as const,
    mastery: 55,
    skill: "Addition",
    time: "15m",
  },
  {
    name: "Rosa",
    emoji: "🦋",
    grade: 2,
    status: "on-track" as const,
    mastery: 62,
    skill: "Subtraction",
    time: "14m",
  },
  {
    name: "Peter",
    emoji: "🐢",
    grade: 2,
    status: "inactive" as const,
    mastery: 15,
    skill: "Phonics",
    time: "5d ago",
  },
  {
    name: "Mary",
    emoji: "🐠",
    grade: 2,
    status: "on-track" as const,
    mastery: 70,
    skill: "Reading",
    time: "16m",
  },
  {
    name: "James",
    emoji: "🦜",
    grade: 2,
    status: "flying" as const,
    mastery: 89,
    skill: "Math",
    time: "9m",
  },
  {
    name: "Grace",
    emoji: "🦋",
    grade: 2,
    status: "on-track" as const,
    mastery: 64,
    skill: "Sentences",
    time: "15m",
  },
];

const PROVINCES = [
  { name: "NCD", status: "active" as const },
  { name: "Morobe", status: "active" as const },
  { name: "E. Highlands", status: "active" as const },
  { name: "W. Highlands", status: "active" as const },
  { name: "Madang", status: "active" as const },
  { name: "Milne Bay", status: "warn" as const },
  { name: "Gulf", status: "warn" as const },
  { name: "Chimbu", status: "active" as const },
  { name: "Oro", status: "off" as const },
  { name: "Manus", status: "active" as const },
];

// ── AI LOG ENTRIES ──────────────────────────────────────
interface AIEntry {
  type: "info" | "decision" | "warning" | "success";
  label: string;
  text: string;
  time: string;
}

function nowStr() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── MAIN APP ────────────────────────────────────────────
export default function App({ profile, isNew }: AppProps) {
  const [lang, setLang] = useState<"tok" | "en">("tok");
  const [screen, setScreen] = useState<Screen>("diagnostic");

  // Seeded from profile
  const [selectedAvatar, setSelectedAvatar] = useState<number>(
    profile.avatarIdx,
  );
  const [selectedGrade, setSelectedGrade] = useState<number>(profile.grade);

  // Diagnostic state
  const [diagStep, setDiagStep] = useState(0);
  const [diagAnswered, setDiagAnswered] = useState<(number | null)[]>(
    Array(5).fill(null),
  );
  const [diagAILog, setDiagAILog] = useState<AIEntry[]>([]);
  const [diagPlaced, setDiagPlaced] = useState(false);
  const [diagPlacement, setDiagPlacement] = useState("");

  // Session state
  const [sessionMode, setSessionMode] = useState<ActivityMode>("story");
  const [storyPage, setStoryPage] = useState(0);
  const [litWordIdx, setLitWordIdx] = useState(-1);
  const [actIdx, setActIdx] = useState(0);
  const [actSelected, setActSelected] = useState<string | null>(null);
  const [actWrong, setActWrong] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(20);
  const [sessionAILog, setSessionAILog] = useState<AIEntry[]>([]);
  const [currentDecision, setCurrentDecision] = useState(
    "Waiting for student interaction...",
  );
  const [masteryData, setMasteryData] = useState([
    { name: "Counting", pct: 34 },
    { name: "Letter sounds", pct: 22 },
    { name: "Subtraction", pct: 18 },
    { name: "Sentences", pct: 10 },
  ]);
  const [responseTime, setResponseTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [accuracy, setAccuracy] = useState("—");
  const [tutorMsg, setTutorMsg] = useState({
    tok: `${profile.name}, welkam! Tude bai yumi lainim counting wantaim.`,
    en: `${profile.name}, welcome! Today we will learn counting together.`,
  });
  const [showTutor, setShowTutor] = useState(true);
  const startTimeRef = useRef(Date.now());

  // Dashboard state
  const [dashFilter, setDashFilter] = useState<
    "all" | "attention" | "flying" | "inactive"
  >("all");

  const logRef = useRef<HTMLDivElement>(null);

  // ── INITIALISE FROM PROFILE ──
  useEffect(() => {
    if (!isNew && profile.placement) {
      // Returning student — skip diagnostic, go straight to session
      setDiagPlaced(true);
      setDiagPlacement(profile.placement);
      setSessionProgress(
        profile.lessonProgress > 0 ? profile.lessonProgress : 20,
      );
      setScreen("session");
      setSessionMode("story");
      setStoryPage(0);
      setSessionAILog([
        {
          type: "info",
          label: "Session Resumed",
          text: `Welcome back, ${profile.name}! Resuming from last session. Streak: ${profile.streak} days.`,
          time: nowStr(),
        },
        {
          type: "decision",
          label: "Content Selected",
          text: `Placement: ${profile.placement}. Loading personalised content.`,
          time: nowStr(),
        },
      ]);
      setCurrentDecision("Story mode active — word-by-word narration playing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll AI log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [sessionAILog, diagAILog]);

  // Word highlight in story
  useEffect(() => {
    if (sessionMode !== "story") return;
    const words = STORY_PAGES[storyPage]?.words ?? [];
    if (words.length === 0) return;
    setLitWordIdx(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= words.length) {
        clearInterval(iv);
        setLitWordIdx(-1);
      } else setLitWordIdx(i);
    }, 600);
    return () => clearInterval(iv);
  }, [storyPage, sessionMode]);

  // ── DIAGNOSTIC HANDLERS ──
  function addDiagLog(entry: AIEntry) {
    setDiagAILog((prev) => [...prev, entry]);
  }

  function handleDiagAnswer(optIdx: number) {
    if (diagAnswered[diagStep] !== null) return;
    const correct = DIAG_QUESTIONS[diagStep].correct === optIdx;
    const newAnswered = [...diagAnswered];
    newAnswered[diagStep] = optIdx;
    setDiagAnswered(newAnswered);

    addDiagLog({
      type: correct ? "success" : "warning",
      label: correct ? "Correct" : "Incorrect",
      text: `Q${diagStep + 1}: Student selected option ${optIdx + 1}. ${correct ? "Response correct." : "Response incorrect — noting gap."}`,
      time: nowStr(),
    });

    setTimeout(() => {
      if (diagStep < 4) {
        setDiagStep((s) => s + 1);
        addDiagLog({
          type: "info",
          label: "Next Question",
          text: `Advancing to question ${diagStep + 2} of 5.`,
          time: nowStr(),
        });
      } else {
        const score = newAnswered.filter(
          (a, i) => a === DIAG_QUESTIONS[i].correct,
        ).length;
        const placement =
          score <= 2
            ? "Early Grade 1 — Foundational"
            : score <= 3
              ? "Mid Grade 1 — Building"
              : "Grade 2 — On Track";
        setDiagPlacement(placement);
        setDiagPlaced(true);
        addDiagLog({
          type: "decision",
          label: "AI Placement Complete",
          text: `Score: ${score}/5. Placing student at: ${placement}. Starting content at correct level — no grade label shown to student.`,
          time: nowStr(),
        });
      }
    }, 900);
  }

  // ── SESSION HANDLERS ──
  function addSessionLog(entry: AIEntry) {
    setSessionAILog((prev) => [...prev.slice(-20), entry]);
  }

  function startSession() {
    setScreen("session");
    setSessionMode("story");
    setStoryPage(0);
    setSessionProgress(20);
    setSessionAILog([
      {
        type: "info",
        label: "Session Started",
        text: `Student: ${profile.name} — Grade ${selectedGrade}. Loading personalised content.`,
        time: nowStr(),
      },
      {
        type: "decision",
        label: "Content Selected",
        text: 'Starting with story: "Beni na Mango" — matches student level. Tok Pisin narration active.',
        time: nowStr(),
      },
    ]);
    setCurrentDecision("Story mode active — word-by-word narration playing");
  }

  function handleNextStoryPage() {
    if (storyPage < STORY_PAGES.length - 1) {
      setStoryPage((p) => p + 1);
      setSessionProgress((p) => Math.min(p + 8, 60));
    } else {
      setSessionMode("activity");
      setActIdx(0);
      setActSelected(null);
      setActWrong(null);
      startTimeRef.current = Date.now();
      setCurrentDecision(
        "Activity mode — monitoring response time and accuracy",
      );
      setShowTutor(true);
      setTutorMsg({
        tok: "Gutpela! Nau yumi traim wanpela askim.",
        en: "Well done! Now let's try a question.",
      });
      addSessionLog({
        type: "info",
        label: "Story Complete",
        text: "Story finished. Transitioning to activity. Monitoring response latency.",
        time: nowStr(),
      });
    }
  }

  function handleActivityAnswer(val: string) {
    if (actSelected) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setResponseTime(elapsed);
    const correct = val === ACTIVITIES[actIdx].correct;

    if (correct) {
      setActSelected(val);
      const newMastery = masteryData.map((m, i) =>
        i === 0
          ? { ...m, pct: Math.min(m.pct + (elapsed < 8 ? 12 : 6), 99) }
          : m,
      );
      setMasteryData(newMastery);
      const newPct = newMastery[0].pct;
      setAccuracy("Correct ✓");

      const fast = elapsed < 8;
      addSessionLog({
        type: fast ? "success" : "info",
        label: fast ? "Strong Mastery Signal" : "Correct — Moderate Confidence",
        text: `Response: CORRECT in ${elapsed}s. ${hintsUsed} hints used. Mastery updated: ${masteryData[0].pct}% → ${newPct}%.`,
        time: nowStr(),
      });

      if (fast && hintsUsed === 0) {
        setCurrentDecision(
          `Student answered in ${elapsed}s with no hints — advancing difficulty`,
        );
        addSessionLog({
          type: "decision",
          label: "AI Decision",
          text: "Fast correct response detected. Bumping to harder content next.",
          time: nowStr(),
        });
      } else {
        setCurrentDecision(
          `Correct but slow (${elapsed}s) — reinforcing same concept`,
        );
      }

      setSessionProgress((p) => Math.min(p + 15, 95));
      setShowTutor(true);
      setTutorMsg({
        tok: `YES! Gutpela wok tru, ${AVATARS[selectedAvatar].tok}!`,
        en: "YES! Excellent work!",
      });

      setTimeout(() => {
        if (actIdx < ACTIVITIES.length - 1) {
          setActIdx((i) => i + 1);
          setActSelected(null);
          setActWrong(null);
          setHintsUsed(0);
          startTimeRef.current = Date.now();
          setShowTutor(false);
        } else {
          setScreen("celebration");
        }
      }, 1400);
    } else {
      setActWrong(val);
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setHintsUsed((h) => h + 1);
      setAccuracy("Needs Support");

      addSessionLog({
        type: "warning",
        label: "Incorrect Response",
        text: `Student selected wrong answer. Wrong count: ${newWrong}. ${newWrong >= 2 ? "Switching to visual support mode." : "Showing gentle redirect."}`,
        time: nowStr(),
      });

      if (newWrong >= 2) {
        setCurrentDecision(
          "2+ errors detected — switching to visual/audio support mode",
        );
        addSessionLog({
          type: "decision",
          label: "AI Intervention",
          text: "Activating visual scaffold. Simplifying presentation. No shame message shown to student.",
          time: nowStr(),
        });
        setShowTutor(true);
        setTutorMsg({
          tok: "No wari. Yumi lukim dispela wantaim.",
          en: "No worries. Let's look at this together.",
        });
      } else {
        setShowTutor(true);
        setTutorMsg({
          tok: "Mmm... traim gen. Yu inap!",
          en: "Hmm... try again. You can do it!",
        });
        setCurrentDecision("One error — gentle redirect active, no penalty");
      }

      setTimeout(() => setActWrong(null), 800);
    }
  }

  // ── FILTERED STUDENTS ──
  const filteredStudents =
    dashFilter === "all"
      ? CLASS_STUDENTS
      : CLASS_STUDENTS.filter((s) => s.status === dashFilter);

  // ── RENDER ──────────────────────────────────────────
  return (
    <div className="app">
      {/* ════ LANGUAGE TOGGLE ════ */}
      <div className="lang-toggle-wrap">
        <button
          className={`lang-btn${lang === "tok" ? " active" : ""}`}
          onClick={() => setLang("tok")}
        >
          Tok Pisin
        </button>
        <button
          className={`lang-btn${lang === "en" ? " active" : ""}`}
          onClick={() => setLang("en")}
        >
          English
        </button>
      </div>

      {/* ════ DIAGNOSTIC ════ */}
      {screen === "diagnostic" && (
        <div className="screen diagnostic-screen">
          <div className="diag-left">
            <div style={{ textAlign: "center" }}>
              <div className="diag-badge">
                🤖 AI Diagnostic — Finding Your Level
              </div>
              <div className="diag-title">
                Let's see what you know, {profile.name}!
              </div>
              <div className="diag-sub">
                5 quick questions · No wrong answers · Just for the AI to
                understand you
              </div>
            </div>

            <div className="diag-dots">
              {DIAG_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`diag-dot${diagAnswered[i] !== null ? " done" : i === diagStep ? " active" : ""}`}
                />
              ))}
            </div>

            {!diagPlaced ? (
              <div className="diag-card">
                <div className="diag-q-num">Question {diagStep + 1} of 5</div>
                <div className="diag-q-text">{DIAG_QUESTIONS[diagStep].q}</div>
                <div className="diag-q-tok">{DIAG_QUESTIONS[diagStep].tok}</div>
                <div className="diag-options">
                  {DIAG_QUESTIONS[diagStep].options.map((opt, i) => (
                    <button
                      key={i}
                      className={`diag-option${
                        diagAnswered[diagStep] === i
                          ? i === DIAG_QUESTIONS[diagStep].correct
                            ? " correct"
                            : " wrong"
                          : ""
                      }`}
                      onClick={() => handleDiagAnswer(i)}
                      disabled={diagAnswered[diagStep] !== null}
                    >
                      <div>{opt.emoji}</div>
                      <div className="diag-option-label">{opt.tok}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="diag-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#1A1A2E",
                    marginBottom: 8,
                  }}
                >
                  AI Ready!
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#4A4A6A",
                    marginBottom: 24,
                    lineHeight: 1.5,
                  }}
                >
                  Your personal tutor knows exactly where to start.
                  <br />
                  <em>Content placed — no grade label shown to student.</em>
                </div>
                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: 16,
                    borderRadius: 14,
                  }}
                  onClick={startSession}
                >
                  Stat Lainim wantaim Tutor! 🌟
                </button>
              </div>
            )}
          </div>

          {/* AI LOG PANEL */}
          <div className="diag-right">
            <div className="ai-panel-title">🤖 AI Thinking Panel</div>
            {diagPlaced && (
              <div className="placement-result">
                <div className="pr-label">AI Placement</div>
                <div className="pr-value">{diagPlacement}</div>
                <div className="pr-sub">
                  Student starts here — silently, no labels shown
                </div>
              </div>
            )}
            {diagAILog.map((e, i) => (
              <div key={i} className={`ai-log-entry ${e.type}`}>
                <div className="log-time">{e.time}</div>
                <span className="log-key">[{e.label}]</span>{" "}
                <span className="log-val">{e.text}</span>
              </div>
            ))}
            {diagAILog.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  fontStyle: "italic",
                }}
              >
                Waiting for student to begin...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ SESSION ════ */}
      {screen === "session" && (
        <div className="screen session-screen">
          <div className="session-main">
            {/* Top bar */}
            <div className="session-topbar">
              <div className="session-avatar-wrap">
                <div className="s-avatar">{AVATARS[selectedAvatar].emoji}</div>
                <div>
                  <div className="s-name">{profile.name}</div>
                  <div className="s-level">
                    ⭐ {diagPlacement || "Grade 2 — AI Guided"}
                  </div>
                </div>
              </div>
              <div className="progress-wrap">
                <div className="progress-label">
                  Today's Journey — {sessionProgress}% Complete
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${sessionProgress}%` }}
                  />
                </div>
              </div>
              <div className="offline-pill">
                <span>●</span> Offline — Works Anywhere
              </div>
            </div>

            {/* Content */}
            <div className="session-content">
              {showTutor && (
                <div className="tutor-msg">
                  <div className="tutor-face">🦜</div>
                  <div className="tutor-bubble">
                    <div className="tutor-tok">{tutorMsg.tok}</div>
                    <div className="tutor-en">{tutorMsg.en}</div>
                  </div>
                </div>
              )}

              {sessionMode === "story" && (
                <div className="story-card">
                  <div className="story-scene">
                    {STORY_PAGES[storyPage].scene}
                  </div>
                  <div className="story-text">
                    {STORY_PAGES[storyPage].words.map((w, i) => (
                      <span
                        key={i}
                        className={`story-word${litWordIdx === i ? " lit" : ""}`}
                      >
                        {w}{" "}
                      </span>
                    ))}
                  </div>
                  <div className="story-tr">{STORY_PAGES[storyPage].en}</div>
                  <div className="story-btns">
                    <button
                      className="btn-primary"
                      onClick={handleNextStoryPage}
                    >
                      {storyPage < STORY_PAGES.length - 1
                        ? "Next ▶"
                        : "Start Activity! 🎯"}
                    </button>
                  </div>
                </div>
              )}

              {sessionMode === "activity" && (
                <div className="activity-card">
                  <div className="act-label">{ACTIVITIES[actIdx].label}</div>
                  <div className="act-q">{ACTIVITIES[actIdx].q}</div>
                  <div className="act-q-tok">{ACTIVITIES[actIdx].tok}</div>
                  {ACTIVITIES[actIdx].visual && (
                    <div className="act-visual">
                      {ACTIVITIES[actIdx].visual}
                    </div>
                  )}
                  <div className="act-options">
                    {ACTIVITIES[actIdx].options.map((opt, i) => (
                      <button
                        key={i}
                        className={`act-opt${
                          actSelected === opt.val
                            ? " correct"
                            : actWrong === opt.val
                              ? " wrong"
                              : ""
                        }`}
                        onClick={() => handleActivityAnswer(opt.val)}
                        disabled={!!actSelected}
                      >
                        <div>{opt.label}</div>
                        <div className="act-opt-sub">{opt.tok}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI THINKING PANEL */}
          <div className="ai-thinking-panel">
            <div className="aip-head">
              <div className="aip-head-title">🤖 AI Tutor — Live View</div>
              <div className="aip-student">
                <div className="aip-sname">
                  {profile.name} · Grade {selectedGrade}
                </div>
                <div className="aip-metrics">
                  <div className="aip-m">
                    <div className="aip-m-lbl">Response</div>
                    <div
                      className={`aip-m-val${
                        responseTime > 0 && responseTime < 8
                          ? " good"
                          : responseTime >= 8 && responseTime < 20
                            ? " warn"
                            : responseTime >= 20
                              ? " bad"
                              : ""
                      }`}
                    >
                      {responseTime > 0 ? `${responseTime}s` : "—"}
                    </div>
                  </div>
                  <div className="aip-m">
                    <div className="aip-m-lbl">Hints</div>
                    <div
                      className={`aip-m-val${
                        hintsUsed === 0
                          ? " good"
                          : hintsUsed === 1
                            ? " warn"
                            : " bad"
                      }`}
                    >
                      {hintsUsed}
                    </div>
                  </div>
                  <div className="aip-m">
                    <div className="aip-m-lbl">Accuracy</div>
                    <div
                      className={`aip-m-val${
                        accuracy === "Correct ✓"
                          ? " good"
                          : accuracy === "Needs Support"
                            ? " bad"
                            : ""
                      }`}
                      style={{ fontSize: 11 }}
                    >
                      {accuracy}
                    </div>
                  </div>
                  <div className="aip-m">
                    <div className="aip-m-lbl">Mode</div>
                    <div
                      className="aip-m-val"
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}
                    >
                      {sessionMode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mastery-section">
              <div className="m-title">Skill Mastery</div>
              {masteryData.map((m, i) => (
                <div key={i} className="m-item">
                  <div className="m-item-row">
                    <span className="m-item-name">{m.name}</span>
                    <span className="m-item-pct">{m.pct}%</span>
                  </div>
                  <div className="m-bar">
                    <div
                      className={`m-fill ${m.pct < 35 ? "low" : m.pct < 65 ? "mid" : "high"}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="aip-decision-box">
              <div className="aip-d-lbl">Current AI Decision</div>
              <div className="aip-d-text">{currentDecision}</div>
            </div>

            <div className="aip-log-scroll" ref={logRef}>
              {sessionAILog.map((e, i) => (
                <div key={i} className={`aip-entry ${e.type}`}>
                  <div className="aip-e-time">{e.time}</div>
                  <div className="aip-e-lbl">{e.label}</div>
                  <div>{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════ CELEBRATION ════ */}
      {screen === "celebration" && (
        <div className="screen celebration-screen">
          <div className="cel-content">
            <div className="cel-emoji">🎉</div>
            <div className="cel-title">Gutpela Wok, {profile.name}! 🌟</div>
            <div className="cel-sub">
              You completed today's lesson. Your tutor is proud of you. See you
              tomorrow!
            </div>
            <div className="bilum-row">
              {["🥭", "🦜", "🐚", "🌺", "⭐"].map((item, i) => (
                <div
                  key={i}
                  className="bilum-item"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                marginTop: 4,
              }}
            >
              Bilum bilong yu i pulap! (Your bilum is filling up!)
            </div>
            <button className="cel-btn" onClick={() => setScreen("dashboard")}>
              View Class Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* ════ DASHBOARD ════ */}
      {screen === "dashboard" && (
        <div className="screen dashboard-screen">
          <div className="dash-top">
            <div>
              <div className="dash-logo-text">
                🇵🇬 SingSinghAI — Government Dashboard
              </div>
              <div className="dash-logo-sub">
                PNG Department of Education · Live Data · Offline Sync
              </div>
            </div>
            <div className="dash-pills">
              <div className="dash-pill live">
                <span className="dp-val green">●</span>
                <span className="dp-lbl">Live Now</span>
              </div>
              <div className="dash-pill">
                <span className="dp-val">347</span>
                <span className="dp-lbl">Active Sessions</span>
              </div>
              <div className="dash-pill">
                <span className="dp-val">12,480</span>
                <span className="dp-lbl">Students Today</span>
              </div>
              <div className="dash-pill">
                <span className="dp-val">8</span>
                <span className="dp-lbl">Provinces Live</span>
              </div>
            </div>
          </div>

          <div className="dash-body">
            {/* Map panel */}
            <div className="dash-map">
              <div className="dp-title">Province Activity</div>
              <div className="map-box">
                <div className="map-box-title">🗺 Papua New Guinea — Live</div>
                <div className="province-grid">
                  {PROVINCES.map((p, i) => (
                    <div key={i} className={`prov ${p.status}`}>
                      <span className="prov-name">{p.name}</span>
                      <span className="prov-dot" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="dp-title" style={{ marginTop: 4 }}>
                Summary
              </div>
              <div className="sum-cards">
                <div className="sum-card g">
                  <div className="sc-val">14</div>
                  <div className="sc-lbl">Flying — Ready to Advance</div>
                </div>
                <div className="sum-card y">
                  <div className="sc-val">8</div>
                  <div className="sc-lbl">Needs Attention Today</div>
                </div>
                <div className="sum-card r">
                  <div className="sc-val">2</div>
                  <div className="sc-lbl">Inactive 3+ Days — Alert Sent</div>
                </div>
                <div className="sum-card b">
                  <div className="sc-val">68%</div>
                  <div className="sc-lbl">Avg Session Completion</div>
                </div>
              </div>
            </div>

            {/* Class grid */}
            <div className="dash-class">
              <div className="dash-class-head">
                <div className="dp-title">
                  Grade 2 — Waigani Primary · {filteredStudents.length} Students
                </div>
                <div className="filter-row">
                  {(["all", "flying", "attention", "inactive"] as const).map(
                    (f) => (
                      <button
                        key={f}
                        className={`f-btn${dashFilter === f ? " active" : ""}`}
                        onClick={() => setDashFilter(f)}
                      >
                        {f === "all"
                          ? "All"
                          : f === "flying"
                            ? "🔵 Flying"
                            : f === "attention"
                              ? "🟡 Attention"
                              : "🔴 Inactive"}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="class-grid">
                {filteredStudents.map((s, i) => (
                  <div
                    key={i}
                    className={`s-card ${s.status === "attention" ? "attention" : s.status}`}
                  >
                    <div className="s-card-bar" />
                    <div className="sc-emoji">{s.emoji}</div>
                    <div className="sc-sname">{s.name}</div>
                    <div className="sc-grade">
                      Grade {s.grade} · {s.time}
                    </div>
                    <div className="sc-mbar">
                      <div
                        className="sc-mfill"
                        style={{ width: `${s.mastery}%` }}
                      />
                    </div>
                    <div className="sc-status">
                      {s.status === "flying"
                        ? "🔵 Flying"
                        : s.status === "attention"
                          ? "🟡 Needs Attention"
                          : s.status === "inactive"
                            ? "🔴 Inactive"
                            : "🟢 On Track"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="dash-alerts">
              <div className="dp-title">AI Alerts</div>
              <div className="alert-card crit">
                <div className="al-title">Peni — Inactive 3 Days</div>
                <div className="al-body">
                  No session activity. Struggling with phonics. WhatsApp alert
                  sent to teacher this morning.
                </div>
                <div className="al-action">→ Alert Sent to Teacher</div>
              </div>
              <div className="alert-card crit">
                <div className="al-title">Peter — Inactive 5 Days</div>
                <div className="al-body">
                  Persistent absence. Stuck on letter recognition. Field visit
                  may be needed.
                </div>
                <div className="al-action">→ Escalate to School</div>
              </div>
              <div className="alert-card">
                <div className="al-title">Beni — b/d Confusion</div>
                <div className="al-body">
                  3 sessions stuck on same concept. AI switched to visual mode.
                  Teacher notified.
                </div>
                <div className="al-action">→ Support Active</div>
              </div>
              <div className="alert-card">
                <div className="al-title">Walo — Slowing Down</div>
                <div className="al-body">
                  Response times increasing over last 2 sessions. Possible
                  fatigue or difficulty spike.
                </div>
                <div className="al-action">→ Monitoring</div>
              </div>
              <div className="alert-card info">
                <div className="al-title">Kila — Ready to Advance</div>
                <div className="al-body">
                  Mastery at 87%. Flying through Grade 2 content. AI bumped to
                  Grade 3 subtraction.
                </div>
                <div className="al-action">→ Advanced Automatically</div>
              </div>
              <div className="alert-card info">
                <div className="al-title">Hera — 91% Mastery</div>
                <div className="al-body">
                  Fastest learner in class. Recommended for Grade 3 track next
                  week.
                </div>
                <div className="al-action">→ Teacher Review Suggested</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ NAV TABS ════ */}
      <div className="nav-tabs">
        <button
          className={`nav-tab${screen === "diagnostic" ? " active" : ""}`}
          onClick={() => setScreen("diagnostic")}
        >
          <span className="nav-icon">🎯</span>Diagnostic
        </button>
        <button
          className={`nav-tab${screen === "session" ? " active" : ""}`}
          onClick={() => {
            if (diagPlaced) startSession();
          }}
        >
          <span className="nav-icon">📚</span>Tutor Session
        </button>
        <button
          className={`nav-tab${screen === "celebration" ? " active" : ""}`}
          onClick={() => setScreen("celebration")}
        >
          <span className="nav-icon">🎉</span>Celebration
        </button>
        <button
          className={`nav-tab${screen === "dashboard" ? " active" : ""}`}
          onClick={() => setScreen("dashboard")}
        >
          <span className="nav-icon">📊</span>Dashboard
        </button>
      </div>
    </div>
  );
}
