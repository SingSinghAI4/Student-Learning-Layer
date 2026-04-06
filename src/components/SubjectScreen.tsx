import React from "react";
import { motion } from "framer-motion";
import { StudentProfile } from "../LoginScreen";
import { SUBJECTS, SubjectId } from "../data";

interface Props {
  profile: StudentProfile;
  onSelect: (id: SubjectId) => void;
}

const BG_PARTICLES = [
  { emoji:"🌿", left:"4%",  size:18, dur:9,  delay:0   },
  { emoji:"⭐", left:"14%", size:14, dur:11, delay:2   },
  { emoji:"🌺", left:"26%", size:16, dur:8,  delay:4   },
  { emoji:"🦋", left:"40%", size:18, dur:13, delay:1   },
  { emoji:"✨", left:"55%", size:12, dur:10, delay:5   },
  { emoji:"🍃", left:"68%", size:16, dur:12, delay:3   },
  { emoji:"⭐", left:"80%", size:14, dur:8,  delay:6   },
  { emoji:"🌿", left:"91%", size:18, dur:11, delay:2.5 },
];

export default function SubjectScreen({ profile, onSelect }: Props) {
  return (
    <div className="screen subj-screen">
      {/* Floating particles */}
      {BG_PARTICLES.map((p, i) => (
        <div key={i} className="float-particle" style={{
          left: p.left, bottom: "-60px",
          fontSize: p.size,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }}>{p.emoji}</div>
      ))}

      <div className="subj-inner">
        {/* Header */}
        <motion.div
          className="subj-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          <motion.div
            className="subj-wave"
            animate={{ rotate: [0, 20, -10, 20, 0] }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            👋
          </motion.div>
          <div className="subj-greeting">Gutpela moning, {profile.name}!</div>
          <div className="subj-title">What are you learning today?</div>
          <div className="subj-tok">Wanem subject yu laik lainim tude?</div>
        </motion.div>

        {/* Subject cards */}
        <div className="subj-cards">
          {SUBJECTS.map((s, i) => {
            const starsFull  = Math.min(s.starsEarned, s.starsTotal);
            const pct        = Math.round((starsFull / s.starsTotal) * 100);
            return (
              <motion.div
                key={s.id}
                className="subj-card"
                style={{ "--sc": s.color, "--sh": s.shadow, background: s.bg } as React.CSSProperties}
                initial={{ opacity: 0, y: 70, scale: 0.82 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                transition={{ delay: 0.15 + i * 0.13, type: "spring", bounce: 0.48 }}
                whileHover={{ y: -14, scale: 1.045, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(s.id)}
              >
                {/* Glow ring */}
                <div className="subj-card-glow" />

                {/* Icon */}
                <motion.div
                  className="sc-icon"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.6 + i * 0.4, ease: "easeInOut" }}
                >
                  {s.icon}
                </motion.div>

                <div className="sc-name">{s.name}</div>
                <div className="sc-tok">{s.tok}</div>
                <div className="sc-desc">{s.desc}</div>

                {/* Stars */}
                <div className="sc-stars">
                  {[1,2,3].map(n => (
                    <motion.span
                      key={n}
                      className={starsFull / (s.starsTotal / 3) >= n ? "star-on" : "star-off"}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.13 + n * 0.06, type: "spring", bounce: 0.6 }}
                    >
                      {starsFull / (s.starsTotal / 3) >= n ? "⭐" : "☆"}
                    </motion.span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="sc-bar-track">
                  <motion.div
                    className="sc-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.1, delay: 0.5 + i * 0.13, ease: "easeOut" }}
                  />
                </div>
                <div className="sc-bar-lbl">{starsFull}/{s.starsTotal} ⭐ earned</div>

                {/* CTA */}
                <motion.div
                  className="sc-cta"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.3 }}
                >
                  Tap to Start ▶
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
