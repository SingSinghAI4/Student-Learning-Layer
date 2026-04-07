import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { AIEntry, MasteryItem } from "../types";
import { StudentProfile } from "../LoginScreen";

interface Props {
  profile: StudentProfile;
  selectedGrade: number;
  responseTime: number;
  hintsUsed: number;
  accuracy: string;
  confidence: number;
  sessionMode: string;
  masteryData: MasteryItem[];
  currentDecision: string;
  sessionAILog: AIEntry[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

export default function AIPanel({
  profile,
  selectedGrade,
  responseTime,
  hintsUsed,
  accuracy,
  confidence,
  sessionMode,
  masteryData,
  currentDecision,
  sessionAILog,
  logRef,
}: Props) {
  const confLabel = confidence >= 80 ? "High" : confidence >= 55 ? "Building" : confidence >= 30 ? "Low" : "Baseline";
  const confColor = confidence >= 80 ? "#52B788" : confidence >= 55 ? "#A8DADC" : confidence >= 30 ? "#FFD93D" : "rgba(255,255,255,0.3)";
  return (
    <div className="ai-thinking-panel">
      <div className="aip-head">
        <div className="aip-head-title"><Bot size={14} style={{verticalAlign:"middle",marginRight:5}} />AI Tutor — Live View</div>
        <div className="aip-student">
          <div className="aip-sname">{profile.name} · Grade {selectedGrade}</div>
          <div className="aip-metrics">
            <div className="aip-m">
              <div className="aip-m-lbl">Response</div>
              <div className={`aip-m-val${
                responseTime > 0 && responseTime < 8 ? " good"
                : responseTime >= 8 && responseTime < 20 ? " warn"
                : responseTime >= 20 ? " bad" : ""
              }`}>
                {responseTime > 0 ? `${responseTime}s` : "—"}
              </div>
            </div>
            <div className="aip-m">
              <div className="aip-m-lbl">Hints</div>
              <div className={`aip-m-val${
                hintsUsed === 0 ? " good" : hintsUsed === 1 ? " warn" : " bad"
              }`}>
                {hintsUsed}
              </div>
            </div>
            <div className="aip-m">
              <div className="aip-m-lbl">Accuracy</div>
              <div className={`aip-m-val${
                accuracy === "Correct ✓" ? " good"
                : accuracy === "Needs Support" ? " bad" : ""
              }`} style={{ fontSize: 11 }}>
                {accuracy}
              </div>
            </div>
            <div className="aip-m">
              <div className="aip-m-lbl">Mode</div>
              <div className="aip-m-val" style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                {sessionMode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Confidence Meter */}
      <div className="aip-confidence">
        <div className="aip-conf-row">
          <span className="aip-conf-lbl">AI Confidence</span>
          <span className="aip-conf-val" style={{ color: confColor }}>{confLabel} · {confidence}%</span>
        </div>
        <div className="aip-conf-track">
          <motion.div
            className="aip-conf-fill"
            animate={{ width: `${confidence}%`, background: confColor }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ width: 0 }}
          />
        </div>
      </div>

      {/* Skill Mastery */}
      <div className="mastery-section">
        <div className="m-title">Skill Mastery</div>
        {masteryData.map((m, i) => (
          <div key={i} className="m-item">
            <div className="m-item-row">
              <span className="m-item-name">{m.name}</span>
              <span className="m-item-pct">{m.pct}%</span>
            </div>
            <div className="m-bar">
              <motion.div
                className={`m-fill ${m.pct < 35 ? "low" : m.pct < 65 ? "mid" : "high"}`}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ width: 0 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Current Decision */}
      <div className="aip-decision-box">
        <div className="aip-d-lbl">Current AI Decision</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDecision}
            className="aip-d-text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {currentDecision}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Log */}
      <div className="aip-log-scroll" ref={logRef}>
        <AnimatePresence>
          {sessionAILog.map((e, i) => (
            <motion.div
              key={i}
              className={`aip-entry ${e.type}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="aip-e-time">{e.time}</div>
              <div className="aip-e-lbl">{e.label}</div>
              <div>{e.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
