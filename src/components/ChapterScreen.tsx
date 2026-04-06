import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "../LoginScreen";
import { SUBJECTS, CHAPTERS, SubjectId } from "../data";

interface Props {
  profile: StudentProfile;
  subjectId: SubjectId;
  onSelect: (chapterId: number) => void;
  onBack: () => void;
}

export default function ChapterScreen({ profile, subjectId, onSelect, onBack }: Props) {
  const subject  = SUBJECTS.find(s => s.id === subjectId)!;
  const chapters = CHAPTERS[subjectId];

  // First unlocked chapter with no stars = "current"
  const currentId = chapters.find(c => c.unlocked && c.stars === 0)?.id ?? null;

  return (
    <div className="screen chap-screen" style={{ "--sc": subject.color, "--sh": subject.shadow } as React.CSSProperties}>

      {/* Animated background glow */}
      <div className="chap-bg-glow" />

      <div className="chap-inner">

        {/* Header */}
        <motion.div
          className="chap-header"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
        >
          <motion.button
            className="chap-back"
            onClick={onBack}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Subjects
          </motion.button>

          <div className="chap-subject-badge">
            <span className="csb-icon">{subject.icon}</span>
            <div>
              <div className="csb-name">{subject.name}</div>
              <div className="csb-tok">{subject.tok}</div>
            </div>
          </div>

          <div className="chap-title">{profile.name}'s {subject.name} Journey</div>
          <div className="chap-sub">Choose a chapter to begin</div>
        </motion.div>

        {/* Chapter grid */}
        <div className="chap-grid">
          {chapters.map((ch, i) => {
            const isCurrent  = ch.id === currentId;
            const isComplete = ch.stars === 3;
            const isLocked   = !ch.unlocked;

            return (
              <motion.div
                key={ch.id}
                className={`chap-card${isCurrent ? " current" : ""}${isComplete ? " complete" : ""}${isLocked ? " locked" : ""}`}
                initial={{ opacity: 0, y: 40, scale: 0.78 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                transition={{ delay: i * 0.07, type: "spring", bounce: 0.42 }}
                whileHover={!isLocked ? { y: -8, scale: 1.05, transition: { duration: 0.18 } } : {}}
                whileTap={!isLocked ? { scale: 0.96 } : {}}
                onClick={() => !isLocked && onSelect(ch.id)}
              >
                {/* Current pulse ring */}
                {isCurrent && (
                  <motion.div
                    className="chap-pulse-ring"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  />
                )}

                {/* Lock overlay */}
                {isLocked && <div className="chap-lock-overlay"><span>🔒</span></div>}

                {/* Complete badge */}
                {isComplete && (
                  <motion.div
                    className="chap-complete-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.07, type: "spring", bounce: 0.6 }}
                  >
                    ✓
                  </motion.div>
                )}

                <div className="cc-num">Ch {ch.id}</div>
                <motion.div
                  className="cc-icon"
                  animate={isCurrent ? { rotate: [0, -8, 8, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.2 }}
                >
                  {ch.icon}
                </motion.div>
                <div className="cc-title">{ch.title}</div>
                <div className="cc-tok">{ch.tok}</div>
                <div className="cc-desc">{ch.desc}</div>

                {/* Stars */}
                <div className="cc-stars">
                  {[1, 2, 3].map(n => (
                    <motion.span
                      key={n}
                      className={ch.stars >= n ? "cstar-on" : "cstar-off"}
                      initial={{ scale: 0 }}
                      animate={{ scale: ch.stars >= n ? [1.3, 1] : 1 }}
                      transition={{ delay: 0.4 + i * 0.07 + n * 0.07, type: "spring" }}
                    >
                      {ch.stars >= n ? "⭐" : "☆"}
                    </motion.span>
                  ))}
                </div>

                {isCurrent && !isLocked && (
                  <motion.div
                    className="cc-start"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    ▶ Start
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
