import React, { useState, useEffect } from "react";

// ── TYPES ──────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  name: string;
  avatarIdx: number;
  grade: number;
  lessonProgress: number;
  streak: number;
  bilumItems: string[];
  lastSeen: string;
  placement: string;
}

interface LoginScreenProps {
  onLogin: (profile: StudentProfile, isNew: boolean) => void;
}

// ── CONSTANTS ──────────────────────────────────────────
const AVATARS = [
  { emoji: "🦜", name: "Bird of Paradise", tok: "Pisin Paradais" },
  { emoji: "🦘", name: "Cassowary", tok: "Muruk" },
  { emoji: "🐊", name: "Crocodile", tok: "Pukpuk" },
  { emoji: "🐢", name: "Turtle", tok: "Honu" },
  { emoji: "🦋", name: "Butterfly", tok: "Bataplai" },
  { emoji: "🐠", name: "Coral Fish", tok: "Pis Solwara" },
];

const GRADES = [1, 2, 3, 4, 5];

const MOCK_PROFILES: StudentProfile[] = [
  {
    id: "beni-001",
    name: "Beni",
    avatarIdx: 1,
    grade: 2,
    lessonProgress: 68,
    streak: 4,
    bilumItems: ["🥭", "🐚", "🌺", "⭐", "🪸"],
    lastSeen: "Today",
    placement: "Grade 2 — On Track",
  },
  {
    id: "kila-002",
    name: "Kila",
    avatarIdx: 0,
    grade: 2,
    lessonProgress: 87,
    streak: 7,
    bilumItems: ["🥭", "🐚", "🌺", "⭐", "🪸", "🌿", "🦋"],
    lastSeen: "Today",
    placement: "Grade 3 — Flying Ahead",
  },
  {
    id: "meri-003",
    name: "Meri",
    avatarIdx: 3,
    grade: 2,
    lessonProgress: 45,
    streak: 2,
    bilumItems: ["🥭", "🌺"],
    lastSeen: "Yesterday",
    placement: "Grade 2 — Building",
  },
];

// ── PROGRESS RING ──────────────────────────────────────
function ProgressRing({
  pct,
  size = 88,
  emoji,
}: {
  pct: number;
  size?: number;
  emoji: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F5A623"
          strokeWidth={7}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.42,
        }}
      >
        {emoji}
      </div>
    </div>
  );
}

// ── BILUM ICON ─────────────────────────────────────────
function BilumIcon({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg viewBox="0 0 32 40" width={30} height={37}>
        <path d="M4 11 Q3 35 16 38 Q29 35 28 11 Z" fill="#C0392B" />
        <path
          d="M4 11 Q3 35 16 38 Q29 35 28 11 Z"
          fill="none"
          stroke="#922B21"
          strokeWidth="1"
        />
        <path
          d="M10 11 Q10 4 16 3 Q22 4 22 11"
          fill="none"
          stroke="#C0392B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 11 Q10 4 16 3 Q22 4 22 11"
          fill="none"
          stroke="#E74C3C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polygon
          points="16,15 19,19 16,23 13,19"
          fill="#F1948A"
          opacity="0.7"
        />
        <polygon
          points="10,21 12.5,25 10,29 7.5,25"
          fill="#F9E79F"
          opacity="0.5"
        />
        <polygon
          points="22,21 24.5,25 22,29 19.5,25"
          fill="#F9E79F"
          opacity="0.5"
        />
      </svg>
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#F5A623",
            lineHeight: 1,
          }}
        >
          {count} items
        </div>
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.4,
          }}
        >
          in bilum
        </div>
      </div>
    </div>
  );
}

// ── STUDENT CARD ───────────────────────────────────────
function StudentCard({
  profile,
  onSelect,
  delay,
}: {
  profile: StudentProfile;
  onSelect: () => void;
  delay: number;
}) {
  const av = AVATARS[profile.avatarIdx];
  const statusColor =
    profile.lessonProgress >= 75
      ? "#4ADE80"
      : profile.lessonProgress >= 50
        ? "#F5A623"
        : "#FB923C";

  return (
    <button
      onClick={onSelect}
      style={{
        background:
          "linear-gradient(155deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1.5px solid rgba(255,255,255,0.13)",
        borderRadius: 24,
        padding: "28px 22px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "all 0.25s ease",
        width: "100%",
        backdropFilter: "blur(16px)",
        position: "relative",
        overflow: "hidden",
        animation: `cardReveal 0.5s ease ${delay}s both`,
        textAlign: "center" as const,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background =
          "linear-gradient(155deg, rgba(245,166,35,0.2) 0%, rgba(255,107,53,0.08) 100%)";
        el.style.borderColor = "#F5A623";
        el.style.transform = "translateY(-8px)";
        el.style.boxShadow = "0 24px 64px rgba(245,166,35,0.22)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background =
          "linear-gradient(155deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)";
        el.style.borderColor = "rgba(255,255,255,0.13)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top status bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${statusColor} 0%, transparent 100%)`,
          borderRadius: "24px 24px 0 0",
        }}
      />

      {/* Streak badge */}
      {profile.streak >= 1 && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "linear-gradient(135deg, #FF6B35, #F5A623)",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 900,
            color: "#1A0A00",
            letterSpacing: 0.3,
          }}
        >
          🔥 {profile.streak}d
        </div>
      )}

      {/* Progress ring */}
      <ProgressRing pct={profile.lessonProgress} size={88} emoji={av.emoji} />

      {/* Name */}
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            fontFamily: "'Baloo 2', cursive",
            color: "#FFFFFF",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            letterSpacing: 0.3,
            lineHeight: 1,
            marginBottom: 5,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {profile.placement}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          background: "rgba(0,0,0,0.25)",
          borderRadius: 12,
          padding: "10px 14px",
        }}
      >
        <BilumIcon count={profile.bilumItems.length} />
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            LAST SEEN
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color:
                profile.lastSeen === "Today"
                  ? "#4ADE80"
                  : "rgba(255,255,255,0.65)",
            }}
          >
            {profile.lastSeen}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            PROGRESS
          </span>
          <span style={{ fontSize: 13, fontWeight: 900, color: statusColor }}>
            {profile.lessonProgress}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            borderRadius: 8,
            height: 7,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 8,
              background: "linear-gradient(90deg, #F5A623, #FF6B35)",
              width: `${profile.lessonProgress}%`,
              transition: "width 1.4s ease",
              boxShadow: "0 0 10px rgba(245,166,35,0.4)",
            }}
          />
        </div>
      </div>

      {/* CTA button */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 100%)",
          borderRadius: 14,
          padding: "13px",
          fontWeight: 900,
          fontSize: 15,
          color: "#1A0A00",
          fontFamily: "'Baloo 2', cursive",
          letterSpacing: 0.3,
          boxShadow: "0 4px 20px rgba(245,166,35,0.35)",
        }}
      >
        Continue Learning →
      </div>
    </button>
  );
}

// ── MAIN LOGIN SCREEN ──────────────────────────────────
export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [lang, setLang] = useState<"tok" | "en">("tok");
  const [view, setView] = useState<"profiles" | "new">("profiles");
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<number | null>(null);
  const [newGrade, setNewGrade] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  function handleNewStudent() {
    if (!newName.trim() || newAvatar === null || newGrade === null) return;
    const profile: StudentProfile = {
      id: `${newName.toLowerCase()}-${Date.now()}`,
      name: newName.trim(),
      avatarIdx: newAvatar,
      grade: newGrade,
      lessonProgress: 0,
      streak: 0,
      bilumItems: [],
      lastSeen: "Today",
      placement: "",
    };
    onLogin(profile, true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        body { background: #0A1A07; overflow-x: hidden; font-family: 'Nunito', sans-serif; }

        .ls-root {
          width: 100vw; min-height: 100vh;
          background:
            radial-gradient(ellipse 65% 55% at 12% 8%, rgba(40,110,18,0.65) 0%, transparent 58%),
            radial-gradient(ellipse 50% 45% at 90% 88%, rgba(210,90,10,0.38) 0%, transparent 52%),
            radial-gradient(ellipse 38% 55% at 78% 18%, rgba(22,80,10,0.42) 0%, transparent 48%),
            radial-gradient(ellipse 55% 38% at 28% 82%, rgba(8,52,4,0.5) 0%, transparent 48%),
            #0A1A07;
          display: grid;
          grid-template-columns: 420px 1fr;
          min-height: 100vh;
        }

        /* ── LEFT PANEL ── */
        .ls-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 56px 48px;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative; z-index: 1;
          opacity: 0; transition: opacity 0.7s ease;
        }
        .ls-left.vis { opacity: 1; }

        .ls-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 6px 16px;
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.4);
          letter-spacing: 1.8px; text-transform: uppercase;
          margin-bottom: 32px; width: fit-content;
        }

        .ls-logo {
          font-family: 'Baloo 2', cursive;
          font-size: clamp(48px, 5.5vw, 72px);
          font-weight: 900; line-height: 1; margin-bottom: 18px;
          background: linear-gradient(135deg, #F5A623 0%, #FF6B35 45%, #FFD700 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 4px 24px rgba(245,166,35,0.45));
        }

        .ls-tagline {
          font-size: 16px; color: rgba(255,255,255,0.48);
          font-weight: 600; line-height: 1.65;
          max-width: 340px; margin-bottom: 44px;
        }

        .ls-leaf-row { font-size: 26px; letter-spacing: 8px; opacity: 0.45; margin-bottom: 52px; }

        .ls-stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 0; }
        .ls-stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 18px 14px; text-align: center;
        }
        .ls-stat-val {
          font-family: 'Baloo 2', cursive;
          font-size: 26px; font-weight: 900; color: #F5A623;
          line-height: 1; margin-bottom: 4px;
        }
        .ls-stat-lbl {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.3); letter-spacing: 0.8px; text-transform: uppercase;
        }

        .ls-offline-pill {
          display: flex; align-items: center; gap: 8px; margin-top: 32px;
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.22); letter-spacing: 0.4px;
        }
        .ls-offline-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;
          box-shadow: 0 0 10px rgba(74,222,128,0.7); flex-shrink: 0;
        }

        /* ── RIGHT PANEL ── */
        .ls-right {
          display: flex; flex-direction: column;
          padding: 44px 52px 44px 48px;
          overflow-y: auto; position: relative; z-index: 1;
        }

        .ls-right-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 36px; flex-shrink: 0;
        }

        .ls-section-title {
          font-family: 'Baloo 2', cursive;
          font-size: 28px; font-weight: 900; color: #fff; letter-spacing: 0.2px;
        }
        .ls-section-sub {
          font-size: 14px; color: rgba(255,255,255,0.32);
          font-weight: 600; margin-top: 4px;
        }

        .ls-lang-toggle { display: flex; gap: 8px; flex-shrink: 0; margin-top: 4px; }
        .ls-lang-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 7px 18px;
          font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.32);
          cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; letter-spacing: 0.3px;
        }
        .ls-lang-btn:hover { color: rgba(255,255,255,0.65); }
        .ls-lang-btn.active { background: rgba(245,166,35,0.15); border-color: #F5A623; color: #F5A623; }

        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
          flex: 1;
          align-content: start;
        }

        .divider {
          display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text {
          font-size: 11px; color: rgba(255,255,255,0.22);
          font-weight: 800; white-space: nowrap; letter-spacing: 1.5px;
        }

        .new-student-btn {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px dashed rgba(255,255,255,0.14);
          border-radius: 18px; padding: 18px;
          color: rgba(255,255,255,0.38);
          font-size: 15px; font-weight: 800; font-family: 'Nunito', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .new-student-btn:hover {
          border-color: #F5A623; color: #F5A623;
          background: rgba(245,166,35,0.05);
        }

        /* ── NEW STUDENT FORM ── */
        .new-form { animation: fadeUp 0.35s ease both; max-width: 640px; }

        .form-back-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.28); font-size: 13px; font-weight: 800;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          padding: 0; margin-bottom: 26px; transition: color 0.2s;
        }
        .form-back-btn:hover { color: rgba(255,255,255,0.6); }

        .form-title {
          font-family: 'Baloo 2', cursive;
          font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 30px;
        }
        .form-label {
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.28);
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 10px; display: block;
        }

        .name-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 15px 20px;
          font-size: 18px; font-weight: 800; color: #fff;
          font-family: 'Nunito', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s; margin-bottom: 30px;
        }
        .name-input::placeholder { color: rgba(255,255,255,0.16); font-weight: 600; }
        .name-input:focus { border-color: #F5A623; background: rgba(245,166,35,0.04); }

        .avatar-grid-new {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 10px; margin-bottom: 30px;
        }
        .avatar-btn-new {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 14px 8px;
          cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .avatar-btn-new:hover { border-color: rgba(245,166,35,0.5); transform: translateY(-3px); }
        .avatar-btn-new.sel {
          border-color: #F5A623; background: rgba(245,166,35,0.12);
          box-shadow: 0 4px 20px rgba(245,166,35,0.22);
        }
        .avatar-btn-new .av-em { font-size: 32px; }
        .avatar-btn-new .av-nm {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.45); text-align: center; line-height: 1.2;
        }

        .grade-grid-new { display: flex; gap: 10px; margin-bottom: 30px; }
        .grade-btn-new {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 16px 6px;
          cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
        }
        .grade-btn-new:hover { border-color: rgba(245,166,35,0.5); transform: translateY(-3px); }
        .grade-btn-new.sel {
          border-color: #F5A623; background: rgba(245,166,35,0.12);
          box-shadow: 0 4px 18px rgba(245,166,35,0.2);
        }
        .grade-btn-new .gn {
          font-size: 26px; font-weight: 900; color: #fff;
          font-family: 'Baloo 2', cursive;
        }
        .grade-btn-new .gl {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.32); letter-spacing: 0.8px; text-transform: uppercase;
        }

        .start-btn {
          width: 100%;
          background: linear-gradient(135deg, #F5A623 0%, #FF6B35 100%);
          border: none; border-radius: 16px; padding: 18px;
          font-size: 18px; font-weight: 900; color: #1A0A00;
          font-family: 'Baloo 2', cursive; cursor: pointer;
          transition: all 0.22s; letter-spacing: 0.3px;
          box-shadow: 0 6px 28px rgba(245,166,35,0.42);
        }
        .start-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(245,166,35,0.58);
        }
        .start-btn:disabled { opacity: 0.28; cursor: not-allowed; transform: none; }

        /* floating decorations */
        .ls-decor {
          position: fixed; pointer-events: none; user-select: none; z-index: 0;
          animation: floatDecor 5s ease-in-out infinite alternate;
        }

        @keyframes floatDecor {
          from { transform: translateY(0) rotate(0deg); }
          to   { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1000px) {
          .ls-root { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
          .ls-left { padding: 36px 32px 28px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); justify-content: flex-start; }
          .ls-right { padding: 28px 24px; }
          .profiles-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .profiles-grid { grid-template-columns: 1fr 1fr; }
          .avatar-grid-new { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Background floating decorations */}
      {["🌺", "🥥", "🌿", "🦋", "🌸", "🥭", "🐚", "⭐", "🪸", "🌴"].map(
        (item, i) => (
          <div
            key={i}
            className="ls-decor"
            style={{
              fontSize: 18 + (i % 4) * 9,
              opacity: 0.04 + (i % 3) * 0.018,
              top: `${8 + ((i * 9) % 82)}%`,
              left: i % 2 === 0 ? `${(i * 5) % 10}%` : `${87 + ((i * 2) % 9)}%`,
              animationDuration: `${4 + i * 0.65}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {item}
          </div>
        ),
      )}

      <div className="ls-root">
        {/* ══ LEFT PANEL ══ */}
        <div className={`ls-left${mounted ? " vis" : ""}`}>
          <div className="ls-badge">🇵🇬 Papua New Guinea · AI Tutor</div>
          <div className="ls-logo">SingSinghAI</div>
          <div className="ls-tagline">
            {lang === "tok"
              ? "Skul bilong yu i stap hia. Lainim wantaim AI tutor — long olgeta hap, no nid internet."
              : "Your school is here. Learn with an AI tutor — anywhere, no internet needed."}
          </div>
          <div className="ls-leaf-row">🌿 🌺 🥭 🌺 🌿</div>
          <div className="ls-stats-row">
            <div className="ls-stat">
              <div className="ls-stat-val">12,480</div>
              <div className="ls-stat-lbl">Students Today</div>
            </div>
            <div className="ls-stat">
              <div className="ls-stat-val">8</div>
              <div className="ls-stat-lbl">Provinces Live</div>
            </div>
            <div className="ls-stat">
              <div className="ls-stat-val">68%</div>
              <div className="ls-stat-lbl">Avg Completion</div>
            </div>
          </div>
          <div className="ls-offline-pill">
            <span className="ls-offline-dot" />
            {lang === "tok"
              ? "Wok long olgeta hap — no nid internet"
              : "Works everywhere — no internet needed"}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="ls-right">
          <div className="ls-right-top">
            <div>
              <div className="ls-section-title">
                {view === "profiles"
                  ? lang === "tok"
                    ? "Husait yu?"
                    : "Who are you?"
                  : lang === "tok"
                    ? "Nupela Studen"
                    : "New Student"}
              </div>
              <div className="ls-section-sub">
                {view === "profiles"
                  ? lang === "tok"
                    ? "Makim nem bilong yu long lo"
                    : "Tap your name below to continue"
                  : lang === "tok"
                    ? "Putim details bilong yu"
                    : "Fill in your details to get started"}
              </div>
            </div>
            <div className="ls-lang-toggle">
              <button
                className={`ls-lang-btn${lang === "tok" ? " active" : ""}`}
                onClick={() => setLang("tok")}
              >
                Tok Pisin
              </button>
              <button
                className={`ls-lang-btn${lang === "en" ? " active" : ""}`}
                onClick={() => setLang("en")}
              >
                English
              </button>
            </div>
          </div>

          {view === "profiles" && (
            <>
              <div className="profiles-grid">
                {MOCK_PROFILES.map((profile, i) => (
                  <StudentCard
                    key={profile.id}
                    profile={profile}
                    onSelect={() => onLogin(profile, false)}
                    delay={i * 0.12}
                  />
                ))}
              </div>

              <div className="divider">
                <div className="divider-line" />
                <div className="divider-text">
                  {lang === "tok" ? "NUPELA STUDEN?" : "NEW STUDENT?"}
                </div>
                <div className="divider-line" />
              </div>

              <button
                className="new-student-btn"
                onClick={() => setView("new")}
              >
                <span style={{ fontSize: 20 }}>＋</span>
                {lang === "tok"
                  ? "Stat Nupela — Stat Lainim"
                  : "Add New Student — Start Fresh"}
              </button>
            </>
          )}

          {view === "new" && (
            <div className="new-form">
              <button
                className="form-back-btn"
                onClick={() => setView("profiles")}
              >
                ← {lang === "tok" ? "Go Bek" : "Back"}
              </button>
              <div className="form-title">
                {lang === "tok"
                  ? "👋 Welkam, nupela studen!"
                  : "👋 Welcome, new student!"}
              </div>

              <label className="form-label">
                {lang === "tok" ? "Wanem nem bilong yu?" : "What is your name?"}
              </label>
              <input
                className="name-input"
                placeholder={
                  lang === "tok"
                    ? "Raitim nem bilong yu..."
                    : "Type your name..."
                }
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
              />

              <label className="form-label">
                {lang === "tok"
                  ? "Makim animal bilong yu"
                  : "Choose your animal"}
              </label>
              <div className="avatar-grid-new">
                {AVATARS.map((av, i) => (
                  <button
                    key={i}
                    className={`avatar-btn-new${newAvatar === i ? " sel" : ""}`}
                    onClick={() => setNewAvatar(i)}
                  >
                    <span className="av-em">{av.emoji}</span>
                    <span className="av-nm">
                      {lang === "tok" ? av.tok : av.name}
                    </span>
                  </button>
                ))}
              </div>

              <label className="form-label">
                {lang === "tok"
                  ? "Wanem klas bilong yu?"
                  : "Which grade are you in?"}
              </label>
              <div className="grade-grid-new">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    className={`grade-btn-new${newGrade === g ? " sel" : ""}`}
                    onClick={() => setNewGrade(g)}
                  >
                    <span className="gn">{g}</span>
                    <span className="gl">Grade</span>
                  </button>
                ))}
              </div>

              <button
                className="start-btn"
                disabled={
                  !newName.trim() || newAvatar === null || newGrade === null
                }
                onClick={handleNewStudent}
              >
                {lang === "tok" ? "Stat Lainim! 🌟" : "Start Learning! 🌟"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
