import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Target, Rocket } from "lucide-react";
import { AIEntry } from "../types";
import { DIAG_QUESTIONS } from "../data";
import { StudentProfile } from "../LoginScreen";
import VoiceWaveform from "./VoiceWaveform";
import { useSpeech } from "../hooks/useSpeech";

interface Props {
  profile: StudentProfile;
  lang: "tok" | "en";
  diagStep: number;
  diagAnswered: (number | null)[];
  diagAILog: AIEntry[];
  diagPlaced: boolean;
  diagPlacement: string;
  onAnswer: (optIdx: number) => void;
  onStartSession: () => void;
  logRef: React.RefObject<HTMLDivElement | null>;
}

export default function DiagnosticScreen({
  profile,
  lang,
  diagStep,
  diagAnswered,
  diagAILog,
  diagPlaced,
  diagPlacement,
  onAnswer,
  onStartSession,
  logRef,
}: Props) {
  const { speaking, speak } = useSpeech();

  // Speak placement result when AI places the student
  useEffect(() => {
    if (!diagPlaced || !diagPlacement) return;
    const msg = lang === "tok"
      ? `AI i save pinis long yu. ${diagPlacement}. Lesong bai stat nau.`
      : `Assessment complete. ${diagPlacement}. Your lesson is ready.`;
    speak(msg, { rate: 0.80, pitch: 1.05 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagPlaced]);

  return (
    <div className="screen diagnostic-screen">
      {/* ── Left: Questions ── */}
      <div className="diag-left">
        <div style={{ textAlign: "center" }}>
          <div className="diag-badge"><Bot size={13} style={{verticalAlign:"middle",marginRight:4}} />AI Diagnostic — Finding Your Level</div>
          <div className="diag-title">
            Let's see what you know, {profile.name}!
          </div>
          <div className="diag-sub">
            5 quick questions · No wrong answers · Just for the AI to understand you
          </div>
        </div>

        {/* Progress dots */}
        <div className="diag-dots">
          {DIAG_QUESTIONS.map((_, i) => (
            <motion.div
              key={i}
              className={`diag-dot${diagAnswered[i] !== null ? " done" : i === diagStep ? " active" : ""}`}
              animate={{ scale: i === diagStep && !diagPlaced ? [1, 1.25, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!diagPlaced ? (
            <motion.div
              key={diagStep}
              className="diag-card"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="diag-q-num">Question {diagStep + 1} of 5</div>
              <div className="diag-q-text">{DIAG_QUESTIONS[diagStep].q}</div>
              <div className="diag-q-tok">{DIAG_QUESTIONS[diagStep].tok}</div>
              <div className="diag-options">
                {DIAG_QUESTIONS[diagStep].options.map((opt, i) => {
                  const answered = diagAnswered[diagStep];
                  const isCorrect = i === DIAG_QUESTIONS[diagStep].correct;
                  const isSelected = answered === i;
                  return (
                    <motion.button
                      key={i}
                      className={`diag-option${
                        answered !== null
                          ? isSelected
                            ? isCorrect ? " correct" : " wrong"
                            : isCorrect ? " correct" : ""
                          : ""
                      }`}
                      onClick={() => onAnswer(i)}
                      disabled={answered !== null}
                      whileHover={answered === null ? { scale: 1.04, y: -2 } : {}}
                      whileTap={answered === null ? { scale: 0.96 } : {}}
                      animate={
                        isSelected && isCorrect
                          ? { scale: [1, 1.15, 1] }
                          : isSelected && !isCorrect
                          ? { x: [-8, 8, -6, 6, 0] }
                          : {}
                      }
                      transition={{ duration: 0.35 }}
                    >
                      <span className="diag-opt-emoji">{opt.emoji}</span>
                      <span className="diag-opt-label">{opt.label}</span>
                      <span className="diag-opt-tok">{opt.tok}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placement"
              className="diag-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <motion.div
                className="diag-placed-emoji"
                animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Target size={48} strokeWidth={1.5} />
              </motion.div>
              <div className="diag-placed-title">
                {lang === "tok" ? "AI i save pinis long yu!" : "AI Assessment Complete!"}
              </div>
              <div className="diag-placed-level">{diagPlacement}</div>
              <div className="diag-placed-sub">
                {lang === "tok"
                  ? "Lesong bai stat long namba bilong yu."
                  : "Content personalised to your exact level."}
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 4px" }}>
                <VoiceWaveform active={speaking} lang={lang} size="md" />
              </div>
              <motion.button
                className="btn-primary"
                onClick={onStartSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {lang === "tok" ? "Stat Laninim!" : "Start Learning!"} <Rocket size={15} style={{verticalAlign:"middle",marginLeft:4}} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: AI Log ── */}
      <div className="diag-right">
        <div className="aip-head-title"><Bot size={13} style={{verticalAlign:"middle",marginRight:4}} />AI — Reading {profile.name}</div>
        <div className="aip-log-scroll" ref={logRef}>
          <AnimatePresence>
            {diagAILog.map((e, i) => (
              <motion.div
                key={i}
                className={`aip-entry ${e.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="aip-e-time">{e.time}</div>
                <div className="aip-e-lbl">{e.label}</div>
                <div>{e.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {diagAILog.length === 0 && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
              Waiting for student to begin...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
