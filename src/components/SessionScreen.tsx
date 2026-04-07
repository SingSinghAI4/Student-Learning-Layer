import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star, Bot, Target, Plus } from "lucide-react";
import { ActivityMode } from "../types";
import { AVATARS, STORY_PAGES, STORY_PAGES_2, ACTIVITIES, ACTIVITIES_2,
         MATHS_STORY_PAGES, MATHS_ACTIVITIES_MERI, MATHS_ACTIVITIES_SIONE,
         MathsActivity, MathsStoryPage } from "../data";
import { StudentProfile } from "../LoginScreen";
import VoiceWaveform from "./VoiceWaveform";
import { useSpeech } from "../hooks/useSpeech";
import TeachMoment from "./TeachMoment";
import MathsStoryScene from "./MathsStoryScene";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  selectedAvatar: number;
  selectedGrade: number;
  diagPlacement: string;
  sessionMode: ActivityMode;
  storyPage: number;
  litWordIdx: number;
  actIdx: number;
  actSelected: string | null;
  actWrong: string | null;
  sessionProgress: number;
  showTutor: boolean;
  tutorMsg: { tok: string; en: string };
  chapter: number;
  consecutiveCorrect: number;
  mathsPath?: "meri" | "sione" | null;
  onNextStoryPage: () => void;
  onActivityAnswer: (val: string) => void;
}

export default function SessionScreen({
  profile,
  lang,
  selectedAvatar,
  selectedGrade,
  diagPlacement,
  sessionMode,
  storyPage,
  litWordIdx,
  actIdx,
  actSelected,
  actWrong,
  sessionProgress,
  showTutor,
  tutorMsg,
  chapter,
  consecutiveCorrect,
  mathsPath,
  onNextStoryPage,
  onActivityAnswer,
}: Props) {
  const isMathsDemo = mathsPath != null;
  const storyPages = isMathsDemo ? MATHS_STORY_PAGES
    : chapter === 1 ? STORY_PAGES : STORY_PAGES_2;
  const activities = isMathsDemo
    ? (mathsPath === "sione" ? MATHS_ACTIVITIES_SIONE : MATHS_ACTIVITIES_MERI)
    : chapter === 1 ? ACTIVITIES : ACTIVITIES_2;

  const { speaking: storySpeaking, speak: speakStory, stop: stopStory } = useSpeech();
  const { speaking: tutorSpeaking, speak: speakTutor } = useSpeech();
  const { speak: speakAct } = useSpeech();

  // ── Interactive story state ──
  // tap-count: interactionStep counts taps up to tapCount
  // tap-add:   interactionStep goes 0 → 1 when + is tapped
  const [interactionStep, setInteractionStep] = useState(0);
  const [addCombined, setAddCombined] = useState(false); // true after tap-add animation done

  // ── TeachMoment state ──
  const [showTeachMoment, setShowTeachMoment] = useState(false);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0); // per activity, selects technique
  const prevActWrongRef = useRef<string | null>(null);

  // ── Pokémon-energy animation state ──
  const [mascotState, setMascotState] = useState<"idle"|"correct"|"wrong"|"excited">("idle");
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash,   setShowWrongFlash]   = useState(false);
  const [showXP,    setShowXP]    = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const prevActSelected = useRef<string|null>(null);
  const prevActWrong    = useRef<string|null>(null);

  useEffect(() => {
    if (actSelected && actSelected !== prevActSelected.current) {
      prevActSelected.current = actSelected;
      setMascotState("correct");
      setShowCorrectFlash(true);
      setShowXP(true);
      setTimeout(() => { setMascotState("idle"); }, 1300);
      setTimeout(() => setShowCorrectFlash(false), 450);
      setTimeout(() => setShowXP(false), 1100);
    }
  }, [actSelected]);

  useEffect(() => {
    if (actWrong && actWrong !== prevActWrong.current) {
      prevActWrong.current = actWrong;
      setMascotState("wrong");
      setShowWrongFlash(true);
      setTimeout(() => setMascotState("idle"), 750);
      setTimeout(() => setShowWrongFlash(false), 420);
    }
  }, [actWrong]);

  useEffect(() => {
    if ((sessionMode as string) === "chapter-break") {
      setMascotState("excited");
    } else {
      prevActSelected.current = null;
      prevActWrong.current    = null;
    }
  }, [sessionMode]);

  useEffect(() => {
    if (consecutiveCorrect >= 2) {
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 1700);
    }
  }, [consecutiveCorrect]);

  // Reset interactive state when story page changes
  useEffect(() => {
    setInteractionStep(0);
    setAddCombined(false);
  }, [storyPage]);

  // Reset TeachMoment tracking when activity changes
  useEffect(() => {
    setShowTeachMoment(false);
    setWrongAttemptCount(0);
    prevActWrongRef.current = null;
  }, [actIdx]);

  // Show TeachMoment on wrong answer (with a short delay for shake to complete)
  // Increments wrongAttemptCount so each wrong attempt picks a different technique
  useEffect(() => {
    if (actWrong && actWrong !== prevActWrongRef.current && sessionMode === "activity" && isMathsDemo) {
      prevActWrongRef.current = actWrong;
      setWrongAttemptCount(c => c + 1);
      const t = setTimeout(() => setShowTeachMoment(true), 520);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actWrong]);

  // Floating particles per chapter / subject
  const particles = isMathsDemo ? [
    { emoji:"🥭", left:"4%",  size:20, dur:9,  delay:0   },
    { emoji:"🥥", left:"15%", size:22, dur:12, delay:2   },
    { emoji:"🍌", left:"27%", size:18, dur:8,  delay:1   },
    { emoji:"🔢", left:"40%", size:16, dur:11, delay:4   },
    { emoji:"🏪", left:"54%", size:20, dur:10, delay:3   },
    { emoji:"⭐", left:"66%", size:14, dur:9,  delay:5   },
    { emoji:"🥭", left:"78%", size:22, dur:13, delay:1.5 },
    { emoji:"💰", left:"90%", size:18, dur:10, delay:6   },
    { emoji:"➕", left:"50%", size:16, dur:12, delay:3.5 },
  ] : chapter === 2
    ? [
        { emoji:"🌊", left:"4%",  size:20, dur:9,  delay:0   },
        { emoji:"🐠", left:"16%", size:22, dur:12, delay:3   },
        { emoji:"💧", left:"28%", size:16, dur:8,  delay:1   },
        { emoji:"🦀", left:"44%", size:18, dur:11, delay:4   },
        { emoji:"🐚", left:"58%", size:20, dur:10, delay:2   },
        { emoji:"✨", left:"71%", size:14, dur:9,  delay:5   },
        { emoji:"🌊", left:"84%", size:22, dur:13, delay:1.5 },
        { emoji:"🐠", left:"93%", size:18, dur:10, delay:6   },
        { emoji:"💙", left:"50%", size:14, dur:12, delay:3.5 },
      ]
    : [
        { emoji:"🌿", left:"4%",  size:18, dur:8,  delay:0   },
        { emoji:"🍃", left:"13%", size:16, dur:11, delay:2   },
        { emoji:"🥭", left:"25%", size:20, dur:9,  delay:4   },
        { emoji:"🌺", left:"40%", size:18, dur:13, delay:1   },
        { emoji:"⭐", left:"53%", size:14, dur:10, delay:5   },
        { emoji:"🦋", left:"65%", size:20, dur:12, delay:3   },
        { emoji:"🌿", left:"77%", size:16, dur:8,  delay:6   },
        { emoji:"🍃", left:"89%", size:18, dur:11, delay:2.5 },
        { emoji:"✨", left:"60%", size:14, dur:9,  delay:7   },
      ];

  // Speak story page Tok Pisin text when page changes
  useEffect(() => {
    if (sessionMode !== "story") return;
    const page = storyPages[storyPage];
    if (page) speakStory(page.tok, { rate: 0.78 });
    return () => stopStory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyPage, sessionMode]);

  // Speak tutor message when it appears
  useEffect(() => {
    if (showTutor) speakTutor(tutorMsg.tok, { rate: 0.85, pitch: 1.1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTutor, tutorMsg.tok]);

  // Speak activity question when activity changes
  useEffect(() => {
    if (sessionMode !== "activity") return;
    const act = activities[actIdx];
    if (act) speakAct(act.tok, { rate: 0.82 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actIdx, sessionMode]);

  return (
    <div className={`screen session-screen ch${chapter}`}>

      {/* ── Floating background particles ── */}
      {particles.map((p, i) => (
        <div key={i} className="float-particle" style={{
          left: p.left, bottom: "-60px",
          fontSize: p.size,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }}>{p.emoji}</div>
      ))}

      <div className="session-main">

        {/* ── Screen flash overlays ── */}
        <AnimatePresence>
          {showCorrectFlash && (
            <motion.div key="cfl" className="screen-flash correct-fl"
              initial={{ opacity: 0.65 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.45 }} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showWrongFlash && (
            <motion.div key="wfl" className="screen-flash wrong-fl"
              initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.42 }} />
          )}
        </AnimatePresence>

        {/* ── Combo banner ── */}
        <AnimatePresence>
          {showCombo && (
            <motion.div key={`combo-${consecutiveCorrect}`} className="combo-banner"
              initial={{ opacity: 0, scale: 0.4, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.4, y: -40 }}
              transition={{ type: "spring", bounce: 0.65, duration: 0.5 }}>
              <Flame size={16} style={{verticalAlign:"middle",marginRight:4}} />{consecutiveCorrect} in a row!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Flying XP ── */}
        <AnimatePresence>
          {showXP && (
            <motion.div key="xp" className="flying-xp"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -100, scale: 1.8 }}
              transition={{ duration: 1.0, ease: "easeOut" }}>
              +<Star size={16} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle"}} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Top bar ── */}
        <div className="session-topbar">
          <div className="session-avatar-wrap">
            <motion.div
              className="s-avatar"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {AVATARS[selectedAvatar].emoji}
            </motion.div>
            <div>
              <div className="s-name">{profile.name}</div>
              <div className="s-level"><Star size={12} fill="#FFD93D" stroke="#FFD93D" style={{verticalAlign:"middle",marginRight:3}} />{diagPlacement || "Grade 2 — AI Guided"}</div>
            </div>
            <div className={`chapter-badge ch${chapter}`}>Ch {chapter}</div>
          </div>
          <div className="progress-wrap">
            <div className="progress-label">
              Today's Journey — {sessionProgress}% Complete
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                animate={{ width: `${sessionProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ width: 0 }}
              />
            </div>
          </div>
          <div className="offline-pill">
            <span>●</span> Offline — Works Anywhere
          </div>
        </div>

        {/* ── Role Banner ── */}
        <div className="role-banner">
          <div className="role-pill role-ai">
            <span className="role-icon"><Bot size={16} /></span>
            <div className="role-text">
              <span className="role-label">AI Tutor</span>
              <span className="role-desc">Curriculum · Pacing · Assessment</span>
            </div>
          </div>
          <div className="role-divider">+</div>
          <div className="role-pill role-human">
            <span className="role-icon">👩‍🏫</span>
            <div className="role-text">
              <span className="role-label">Lab Supervisor</span>
              <span className="role-desc">Coaching · Wellbeing · Order</span>
            </div>
          </div>
          <div className="role-tagline">Every child. Every session. No exceptions.</div>
        </div>

        {/* ── Content ── */}
        <div className="session-content">

          {/* Tutor message */}
          <AnimatePresence>
            {showTutor && (
              <motion.div
                className="tutor-msg"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="tutor-face"
                  animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  🦜
                </motion.div>
                <div className="tutor-bubble">
                  <div className="tutor-tok">{tutorMsg.tok}</div>
                  <div className="tutor-en">{tutorMsg.en}</div>
                  <div style={{ marginTop: 8 }}>
                    <VoiceWaveform active={tutorSpeaking} lang={lang} size="sm" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story card */}
          <AnimatePresence mode="wait">
            {sessionMode === "story" && (() => {
              const page = storyPages[storyPage];
              const mp = isMathsDemo ? (page as MathsStoryPage) : null;
              const isTapCount = mp?.interactive === "tap-count";
              const isTapAdd   = mp?.interactive === "tap-add";
              const tapTarget  = isTapCount ? (mp?.tapCount ?? 0) : isTapAdd ? 1 : 0;
              const interactionDone = mp?.interactive ? interactionStep >= tapTarget : true;

              return (
                <motion.div
                  key={`story-${storyPage}`}
                  className="story-card"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* ── Maths demo: rich animated scene ── */}
                  {isMathsDemo ? (
                    <MathsStoryScene
                      slideIndex={storyPage}
                      slide={page as MathsStoryPage}
                      interactionStep={interactionStep}
                      addCombined={addCombined}
                      onTapCount={() => setInteractionStep(s => s + 1)}
                      onTapAdd={() => { setInteractionStep(1); setAddCombined(true); }}
                    />
                  ) : (
                    /* Non-maths: plain emoji scene */
                    <motion.div
                      className="story-scene"
                      key={storyPage}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                    >
                      {page.scene}
                    </motion.div>
                  )}

                  {/* Story text */}
                  <div className="story-text">
                    {page.words.map((w, i) => (
                      <motion.span
                        key={i}
                        className={`story-word${litWordIdx === i ? " lit" : ""}`}
                        animate={litWordIdx === i ? { scale: 1.18, y: -3 } : { scale: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {w}{" "}
                      </motion.span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 2px" }}>
                    <VoiceWaveform active={storySpeaking} lang={lang} size="md" />
                  </div>

                  <div className="story-tr">{page.en}</div>

                  <div className="story-btns">
                    {interactionDone ? (
                      <motion.button
                        className="btn-primary"
                        onClick={onNextStoryPage}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        {storyPage < storyPages.length - 1 ? "Next ▶" : <span>Start Activity! <Target size={14} style={{verticalAlign:"middle",marginLeft:3}} /></span>}
                      </motion.button>
                    ) : (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ color: "#52B788", fontSize: 13, padding: "10px 0" }}
                      >
                        {isTapCount ? `Tap to count all ${mp!.tapCount} items first` : <span>Tap <Plus size={12} style={{verticalAlign:"middle"}} /> to add the groups together</span>}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Chapter break card */}
          <AnimatePresence mode="wait">
            {(sessionMode as string) === "chapter-break" && (
              <motion.div
                key="chapter-break"
                className="chapter-break-card"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.45, type: "spring", bounce: 0.3 }}
              >
                <motion.div
                  className="cb-star"
                  animate={{ rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                ><Star size={16} fill="#FFD93D" stroke="#FFD93D" /></motion.div>
                <div className="cb-title">Chapter 1 Complete!</div>
                <div className="cb-sub">Counting · Reading · Maths</div>
                <div className="cb-unlock">🔓 Chapter 2 Unlocking — Phonics &amp; Comprehension</div>
                <motion.div
                  className="cb-bar-track"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="cb-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity card */}
          <AnimatePresence mode="wait">
            {sessionMode === "activity" && (
              <motion.div
                key={`activity-${actIdx}`}
                className="activity-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <div className="act-label">{activities[actIdx].label}</div>
                <div className="act-q">{activities[actIdx].q}</div>
                <div className="act-q-tok">{activities[actIdx].tok}</div>
                {activities[actIdx].visual && (
                  <motion.div
                    className="act-visual"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    {activities[actIdx].visual}
                  </motion.div>
                )}
                <div className="act-options">
                  {activities[actIdx].options.map((opt, i) => {
                    const isCorrect = actSelected === opt.val;
                    const isWrong = !showTeachMoment && actWrong === opt.val;
                    return (
                      <motion.button
                        key={i}
                        className={`act-opt${isCorrect ? " correct" : isWrong ? " wrong" : ""}`}
                        onClick={() => onActivityAnswer(opt.val)}
                        disabled={!!actSelected}
                        whileHover={!actSelected ? { scale: 1.06, y: -3 } : {}}
                        whileTap={!actSelected ? { scale: 0.94 } : {}}
                        animate={
                          isCorrect
                            ? { scale: [1, 1.18, 1], opacity: 1, y: 0 }
                            : isWrong
                            ? { x: [-10, 10, -8, 8, 0], opacity: 1, y: 0 }
                            : { opacity: 1, y: 0 }
                        }
                        initial={{ opacity: 0, y: 16 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                      >
                        <div>{opt.label}</div>
                        <div className="act-opt-sub">{opt.tok}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── TeachMoment overlay (fires on wrong answer for maths) ── */}
        <AnimatePresence>
          {showTeachMoment && isMathsDemo && (() => {
            const act = activities[actIdx] as MathsActivity;
            return (
              <TeachMoment
                addends={act.addends}
                emojiA={act.emojiA}
                emojiB={act.emojiB}
                attemptNumber={wrongAttemptCount}
                onDismiss={() => {
                  setShowTeachMoment(false);
                  prevActWrongRef.current = null; // allow re-trigger on next wrong
                }}
              />
            );
          })()}
        </AnimatePresence>

        {/* ── Mascot character ── */}
        <div className="mascot-wrap">
          <motion.div
            className="mascot-char"
            animate={
              mascotState === "correct"
                ? { y: [0, -60, -20, 0], scale: [1, 1.45, 1.2, 1], rotate: [0, 18, -14, 0] }
                : mascotState === "wrong"
                ? { x: [0, -14, 14, -10, 10, -6, 6, 0] }
                : mascotState === "excited"
                ? { y: [0, -45, 0, -32, 0, -20, 0], rotate: [0, 22, -22, 16, -16, 0], scale: [1, 1.55, 1.2, 1.45, 1] }
                : { y: [0, -11, 0] }
            }
            transition={
              mascotState === "idle"
                ? { repeat: Infinity, duration: 2.9, ease: "easeInOut" }
                : { duration: 0.7, type: "spring", bounce: 0.38 }
            }
          >
            🦜
          </motion.div>
        </div>
      </div>

    </div>
  );
}
