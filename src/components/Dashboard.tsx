import React from "react";
import { motion } from "framer-motion";
import { CLASS_STUDENTS, PROVINCES } from "../data";

type DashFilter = "all" | "attention" | "flying" | "inactive";

interface Props {
  lang: "tok" | "en";
  dashFilter: DashFilter;
  setDashFilter: (f: DashFilter) => void;
  onSessionEnd: () => void;
}

const ALERTS = [
  { title: "Peni — Inactive 3 Days",   body: "No session activity. Struggling with phonics. WhatsApp alert sent to teacher this morning.",  action: "→ Alert Sent to Teacher",      type: "crit" },
  { title: "Peter — Inactive 5 Days",  body: "Persistent absence. Stuck on letter recognition. Field visit may be needed.",                   action: "→ Escalate to School",         type: "crit" },
  { title: "Beni — b/d Confusion",     body: "3 sessions stuck on same concept. AI switched to visual mode. Teacher notified.",                action: "→ Support Active",             type: "" },
  { title: "Walo — Slowing Down",      body: "Response times increasing over last 2 sessions. Possible fatigue or difficulty spike.",          action: "→ Monitoring",                 type: "" },
  { title: "Kila — Ready to Advance",  body: "Mastery at 87%. Flying through Grade 2 content. AI bumped to Grade 3 subtraction.",              action: "→ Advanced Automatically",     type: "info" },
  { title: "Hera — 91% Mastery",       body: "Fastest learner in class. Recommended for Grade 3 track next week.",                             action: "→ Teacher Review Suggested",   type: "info" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Dashboard({ lang, dashFilter, setDashFilter, onSessionEnd }: Props) {
  const filtered = dashFilter === "all"
    ? CLASS_STUDENTS
    : CLASS_STUDENTS.filter((s) => s.status === dashFilter);

  return (
    <div className="screen dashboard-screen">
      {/* Top bar */}
      <div className="dash-top">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button
            onClick={onSessionEnd}
            style={{
              alignSelf: "flex-start", marginBottom: 4,
              background: "none", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 50, padding: "5px 14px",
              color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            ← {lang === "tok" ? "Nekis Student" : "Next Student"}
          </button>
          <div className="dash-logo-text">SingSinghAI — Government Dashboard</div>
          <div className="dash-logo-sub">PNG Department of Education · Live Data · Offline Sync</div>
        </div>

        <div className="dash-pills">
          <div className="dash-pill live">
            <span className="dp-val green">●</span>
            <span className="dp-lbl">Live Now</span>
          </div>
          {[
            { val: "347",    lbl: "Active Sessions" },
            { val: "12,480", lbl: "Students Today" },
            { val: "8",      lbl: "Provinces Live" },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="dash-pill"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <span className="dp-val">{p.val}</span>
              <span className="dp-lbl">{p.lbl}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="dash-body">
        {/* Province map */}
        <div className="dash-map">
          <div className="dp-title">Province Activity</div>
          <div className="map-box">
            <div className="map-box-title">🗺 Papua New Guinea — Live</div>
            <div className="province-grid">
              {PROVINCES.map((p, i) => (
                <motion.div
                  key={i}
                  className={`prov ${p.status}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="prov-name">{p.name}</span>
                  <motion.span
                    className="prov-dot"
                    animate={p.status === "active" ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.2 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="dp-title" style={{ marginTop: 4 }}>Summary</div>
          <div className="sum-cards">
            {[
              { val: "14",  lbl: "Flying — Ready to Advance",   cls: "g" },
              { val: "8",   lbl: "Needs Attention Today",        cls: "y" },
              { val: "2",   lbl: "Inactive 3+ Days — Alert Sent",cls: "r" },
              { val: "68%", lbl: "Avg Session Completion",       cls: "b" },
            ].map((c, i) => (
              <motion.div
                key={i}
                className={`sum-card ${c.cls}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.07, type: "spring", bounce: 0.4 }}
              >
                <div className="sc-val">{c.val}</div>
                <div className="sc-lbl">{c.lbl}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Class grid */}
        <div className="dash-class">
          <div className="dash-class-head">
            <div className="dp-title">
              Grade 2 — Waigani Primary · {filtered.length} Students
            </div>
            <div className="filter-row">
              {(["all", "flying", "attention", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  className={`f-btn${dashFilter === f ? " active" : ""}`}
                  onClick={() => setDashFilter(f)}
                >
                  {f === "all" ? "All" : f === "flying" ? "🔵 Flying" : f === "attention" ? "🟡 Attention" : "🔴 Inactive"}
                </button>
              ))}
            </div>
          </div>
          <motion.div
            className="class-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={dashFilter}
          >
            {filtered.map((s, i) => (
              <motion.div
                key={i}
                className={`s-card ${s.status === "attention" ? "attention" : s.status}`}
                variants={cardVariants}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
              >
                <div className="s-card-bar" />
                <div className="sc-emoji">{s.emoji}</div>
                <div className="sc-sname">{s.name}</div>
                <div className="sc-grade">Grade {s.grade} · {s.time}</div>
                <div className="sc-mbar">
                  <motion.div
                    className="sc-mfill"
                    initial={{ width: 0 }}
                    animate={{ width: `${s.mastery}%` }}
                    transition={{ duration: 0.7, delay: i * 0.03 }}
                  />
                </div>
                <div className="sc-status">
                  {s.status === "flying" ? "🔵 Flying"
                    : s.status === "attention" ? "🟡 Needs Attention"
                    : s.status === "inactive" ? "🔴 Inactive"
                    : "🟢 On Track"}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* AI Alerts */}
        <div className="dash-alerts">
          <div className="dp-title">AI Alerts</div>
          {ALERTS.map((a, i) => (
            <motion.div
              key={i}
              className={`alert-card ${a.type}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <div className="al-title">{a.title}</div>
              <div className="al-body">{a.body}</div>
              <div className="al-action">{a.action}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
