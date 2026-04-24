import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROVINCE_DATA, CULTURAL_REGIONS } from "./data";
import ProvinceGuardian from "./components/ProvinceGuardian";

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
  province?: string;
  // Grade 3-5 only
  studentId?: string;
  pin?: string;
}

// Demo class code — teacher writes this on the board each day
const CLASS_CODE = "PNG1";

// Full pool of bilum items shown in the picker
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BILUM_POOL = [
  "🥭",
  "🐚",
  "🌺",
  "⭐",
  "🪸",
  "🌿",
  "🦋",
  "🌟",
  "🪴",
  "🥥",
  "🌸",
  "🍃",
  "🐦",
  "🌊",
  "🪨",
];

interface LoginScreenProps {
  onLogin: (profile: StudentProfile, isNew: boolean) => void;
}

// ── CONSTANTS ──────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#1B4332", accent: "#52B788" },
  { bg: "#1A3A5C", accent: "#60A5FA" },
  { bg: "#4A1A2C", accent: "#F9A8D4" },
  { bg: "#3B2800", accent: "#F5A623" },
  { bg: "#1A2C1A", accent: "#86EFAC" },
  { bg: "#2C1A3B", accent: "#C4B5FD" },
];

const AVATAR_ANIMALS = [
  { symbol: "B", name: "Bird of Paradise", tok: "Pisin Paradais" },
  { symbol: "C", name: "Cassowary", tok: "Muruk" },
  { symbol: "K", name: "Crocodile", tok: "Pukpuk" },
  { symbol: "T", name: "Turtle", tok: "Honu" },
  { symbol: "F", name: "Butterfly", tok: "Bataplai" },
  { symbol: "S", name: "Coral Fish", tok: "Pis Solwara" },
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
    province: "NCD",
  },
  {
    id: "kila-002",
    name: "Kila",
    avatarIdx: 0,
    grade: 3,
    lessonProgress: 87,
    streak: 7,
    bilumItems: ["🥭", "🐚", "🌺", "⭐", "🪸", "🌿", "🦋"],
    lastSeen: "Today",
    placement: "Grade 3 — Flying Ahead",
    studentId: "STU-002",
    pin: "4721",
    province: "Morobe",
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
    province: "E. Highlands",
  },
  {
    id: "peni-004",
    name: "Peni",
    avatarIdx: 2,
    grade: 1,
    lessonProgress: 32,
    streak: 0,
    bilumItems: ["🥭"],
    lastSeen: "3 days ago",
    placement: "Grade 1 — Foundational",
    province: "Gulf",
  },
  {
    id: "hana-005",
    name: "Hana",
    avatarIdx: 4,
    grade: 4,
    lessonProgress: 72,
    streak: 5,
    bilumItems: ["🥭", "🐚", "🌺", "⭐"],
    lastSeen: "Today",
    placement: "Grade 4 — On Track",
    studentId: "STU-005",
    pin: "1834",
    province: "Madang",
  },
  {
    id: "sione-006",
    name: "Sione",
    avatarIdx: 5,
    grade: 2,
    lessonProgress: 55,
    streak: 3,
    bilumItems: ["🥭", "🐚", "🌺"],
    lastSeen: "Today",
    placement: "Grade 2 — On Track",
    province: "W. Highlands",
  },
  {
    id: "raka-007",
    name: "Raka",
    avatarIdx: 0,
    grade: 2,
    lessonProgress: 20,
    streak: 1,
    bilumItems: ["🥭"],
    lastSeen: "Today",
    placement: "Grade 2 — Building",
    province: "Manus",
  },
  {
    id: "tura-008",
    name: "Tura",
    avatarIdx: 3,
    grade: 2,
    lessonProgress: 91,
    streak: 9,
    bilumItems: ["🥭", "🐚", "🌺", "⭐", "🪸", "🌿", "🦋", "🌟", "🪴"],
    lastSeen: "Today",
    placement: "Grade 3 — Flying Ahead",
    province: "Milne Bay",
  },
  {
    id: "garo-009",
    name: "Garo",
    avatarIdx: 1,
    grade: 2,
    lessonProgress: 38,
    streak: 0,
    bilumItems: ["🥭", "🌺"],
    lastSeen: "2 days ago",
    placement: "Grade 2 — Building",
    province: "Chimbu",
  },
];

// ── INITIAL AVATAR ──────────────────────────────────────
function InitialAvatar({
  name,
  avatarIdx,
  size = 72,
}: {
  name: string;
  avatarIdx: number;
  size?: number;
}) {
  const c = AVATAR_COLORS[avatarIdx % AVATAR_COLORS.length];
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: c.bg,
        border: `2.5px solid ${c.accent}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 20px ${c.accent}33`,
      }}
    >
      <span
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 900,
          fontSize: size * 0.44,
          color: c.accent,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {initial}
      </span>
    </div>
  );
}

// ── PROGRESS BAR ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 75 ? "#4ADE80" : pct >= 50 ? "#F5A623" : "#FB923C";
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          Progress
        </span>
        <span style={{ fontSize: 12, fontWeight: 900, color }}>{pct}%</span>
      </div>
      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.07)",
          borderRadius: 6,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 6,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            width: `${pct}%`,
            transition: "width 1.2s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── TAPA BORDER ────────────────────────────────────────
function TapaBorder({ id }: { id: string }) {
  const pid = `tapa-${id}`;
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, borderRadius: "0 0 18px 18px", overflow: "hidden" }}>
      <svg width="100%" height="40" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={pid} x="0" y="0" width="64" height="40" patternUnits="userSpaceOnUse">
            {/* Dark background */}
            <rect width="64" height="40" fill="#1C0900"/>
            {/* Top gold band */}
            <rect x="0" y="0" width="64" height="4" fill="#F5E6D3"/>
            {/* Bottom gold band */}
            <rect x="0" y="36" width="64" height="4" fill="#F5E6D3"/>
            {/* Left arrow/chevron pointing right */}
            <polygon points="2,6 28,20 2,34" fill="#F5E6D3" opacity="0.15"/>
            <polygon points="6,12 20,20 6,28" fill="#1C0900"/>
            {/* Right arrow/chevron pointing left */}
            <polygon points="62,6 36,20 62,34" fill="#F5E6D3" opacity="0.15"/>
            <polygon points="58,12 44,20 58,28" fill="#1C0900"/>
            {/* Center diamond */}
            <polygon points="32,8 44,20 32,32 20,20" fill="#F5E6D3" opacity="0.1"/>
            <polygon points="32,13 39,20 32,27 25,20" fill="#1C0900"/>
          </pattern>
        </defs>
        <rect width="100%" height="40" fill={`url(#${pid})`}/>
      </svg>
    </div>
  );
}

// ── STUDENT CARD (name + avatar only — no private data) ──
function StudentCard({
  profile,
  onSelect,
  delay,
}: {
  profile: StudentProfile;
  onSelect: () => void;
  delay: number;
}) {
  const c = AVATAR_COLORS[profile.avatarIdx % AVATAR_COLORS.length];

  return (
    <button
      onClick={onSelect}
      style={{
        background: "rgba(13,27,38,0.85)",
        border: `2px solid ${c.accent}55`,
        borderRadius: 20,
        padding: "32px 20px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.22s ease",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        animation: `cardReveal 0.45s ease ${delay}s both`,
        textAlign: "center" as const,
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = c.accent;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = `0 20px 48px rgba(0,0,0,0.5), 0 0 24px ${c.accent}44`;
        el.style.background = "rgba(13,27,38,0.95)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = `${c.accent}55`;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)";
        el.style.background = "rgba(13,27,38,0.85)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: c.accent,
          borderRadius: "20px 20px 0 0",
          opacity: 0.65,
        }}
      />

      <InitialAvatar
        name={profile.name}
        avatarIdx={profile.avatarIdx}
        size={80}
      />

      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "'Baloo 2', cursive",
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {profile.name}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 700,
          marginBottom: 24,
        }}
      >
        Grade {profile.grade}
      </div>

      <TapaBorder id={profile.id} />
    </button>
  );
}

// ── SHARED PAGE SHELL ──────────────────────────────────
const PAGE_BG =
  "radial-gradient(ellipse 70% 60% at 15% 10%, rgba(34,95,15,0.55) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 88% 85%, rgba(200,80,8,0.32) 0%, transparent 50%), #091507";

function PageShell({
  children,
  onBack,
  lang,
  bgImage,
}: {
  children: React.ReactNode;
  onBack: () => void;
  lang: "tok" | "en";
  bgImage?: string;
}) {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: bgImage ? undefined : PAGE_BG,
        backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
        backgroundSize: bgImage ? "cover" : undefined,
        backgroundPosition: bgImage ? "center" : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .v-shake { animation: shake 0.45s ease; }
        .pin-digit { width:52px; height:64px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.12); border-radius:12px; font-size:28px; font-weight:900; color:#fff; font-family:'Baloo 2',cursive; text-align:center; outline:none; transition:border-color 0.2s; }
        .pin-digit:focus { border-color:#F5A623; background:rgba(245,166,35,0.06); }
        .id-input { width:100%; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px 18px; font-size:17px; font-weight:800; color:#fff; font-family:'Nunito',sans-serif; outline:none; transition:border-color 0.2s; letter-spacing:2px; }
        .id-input:focus { border-color:#F5A623; background:rgba(245,166,35,0.04); }
        .id-input::placeholder { color:rgba(255,255,255,0.16); letter-spacing:0; font-weight:600; }
      `}</style>
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 24,
          left: 28,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.3)",
          fontSize: 13,
          fontWeight: 800,
          fontFamily: "'Nunito',sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 4px",
        }}
      >
        ← {lang === "tok" ? "Go Bek" : "Back"}
      </button>
      {children}
    </div>
  );
}

// ── CLASS CODE SCREEN (Grade 1–2) ──────────────────────
function ClassCodeScreen({
  lang,
  onSuccess,
  onBack,
}: {
  lang: "tok" | "en";
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [error, setError] = React.useState(false);

  function handleSubmit() {
    if (code.trim().toUpperCase() === CLASS_CODE) {
      onSuccess();
    } else {
      setShake(true);
      setError(true);
      setTimeout(() => setShake(false), 450);
      setTimeout(() => {
        setError(false);
        setCode("");
      }, 1800);
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang} bgImage="/ClasscodeScreen.png">
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        {/* Icon */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(245,166,35,0.12)",
              border: "1.5px solid rgba(245,166,35,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect
                x="3"
                y="9"
                width="28"
                height="20"
                rx="4"
                stroke="#F5A623"
                strokeWidth="2"
              />
              <path
                d="M11 9V7a6 6 0 0112 0v2"
                stroke="#F5A623"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="17" cy="19" r="3" fill="#F5A623" opacity="0.7" />
            </svg>
          </div>
        </div>

        <div
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 30,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {lang === "tok" ? "Putim Kod Bilong Klas" : "Enter Class Code"}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {lang === "tok"
            ? "Lukim bord — tisa i raitim kod tude"
            : "Look at the board — your teacher wrote today's code"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
            fontWeight: 600,
            marginBottom: 36,
            fontStyle: "italic",
          }}
        >
          Demo code:{" "}
          <span
            style={{ color: "#F5A623", fontStyle: "normal", fontWeight: 800 }}
          >
            PNG1
          </span>
        </div>

        <div className={shake ? "v-shake" : ""} style={{ marginBottom: 24 }}>
          <input
            className="id-input"
            style={{
              fontSize: 28,
              fontWeight: 900,
              textAlign: "center",
              letterSpacing: 8,
              borderColor: error ? "#FB923C" : undefined,
            }}
            placeholder="____"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        {error && (
          <div
            style={{
              color: "#FB923C",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {lang === "tok"
              ? "Kod i no stret — traim gen"
              : "Wrong code — try again"}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={code.trim().length < 3}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #F5A623, #FF6B35)",
            border: "none",
            borderRadius: 14,
            padding: "16px",
            fontSize: 17,
            fontWeight: 900,
            color: "#1A0A00",
            fontFamily: "'Baloo 2', cursive",
            cursor: code.length < 3 ? "not-allowed" : "pointer",
            opacity: code.length < 3 ? 0.35 : 1,
            transition: "all 0.2s",
          }}
        >
          {lang === "tok" ? "Go Insait" : "Enter Class"}
        </button>
      </div>
    </PageShell>
  );
}

// ── COLOUR VERIFY (Grade 1–2) ──────────────────────────
const COLOUR_OPTIONS = [
  { label: "Green", tok: "Grin", hex: "#52B788" },
  { label: "Blue", tok: "Blu", hex: "#60A5FA" },
  { label: "Pink", tok: "Pik", hex: "#F9A8D4" },
  { label: "Orange", tok: "Orens", hex: "#F5A623" },
  { label: "Yellow", tok: "Yelo", hex: "#86EFAC" },
  { label: "Purple", tok: "Popol", hex: "#C4B5FD" },
];

function ColourVerifyScreen({
  profile,
  lang,
  onSuccess,
  onBack,
}: {
  profile: StudentProfile;
  lang: "tok" | "en";
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [shake, setShake] = React.useState<number | null>(null);
  const [error, setError] = React.useState(false);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [locked, setLocked] = React.useState(false);

  // Correct colour index matches avatarIdx
  const correctIdx = profile.avatarIdx % COLOUR_OPTIONS.length;

  // Shuffle once per profile
  const shuffled = React.useMemo(() => {
    return [...COLOUR_OPTIONS.map((c, i) => ({ ...c, origIdx: i }))].sort(
      () => Math.random() - 0.5,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  function handlePick(origIdx: number, btnIdx: number) {
    if (locked) return;
    if (origIdx === correctIdx) {
      onSuccess();
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      setShake(btnIdx);
      setError(true);
      setTimeout(() => setShake(null), 450);
      setTimeout(() => setError(false), 1800);
      if (newCount >= 3) {
        setLocked(true);
        setTimeout(() => {
          setWrongCount(0);
          setLocked(false);
        }, 5000);
      }
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang}>
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%" }}>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <InitialAvatar
            name={profile.name}
            avatarIdx={profile.avatarIdx}
            size={88}
          />
        </div>

        <div
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 30,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.38)",
            fontWeight: 600,
            marginBottom: 48,
          }}
        >
          {lang === "tok"
            ? "Wanem colour bilong yu?"
            : "What's your favourite colour?"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {shuffled.map(({ hex, label, tok, origIdx }, btnIdx) => (
            <button
              key={btnIdx}
              className={shake === btnIdx ? "v-shake" : ""}
              onClick={() => handlePick(origIdx, btnIdx)}
              disabled={locked}
              style={{
                background: `${hex}18`,
                border: `2.5px solid ${hex}55`,
                borderRadius: 20,
                padding: "28px 16px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                cursor: locked ? "not-allowed" : "pointer",
                transition: "all 0.18s ease",
                opacity: locked ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                if (!locked) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    hex;
                  (e.currentTarget as HTMLButtonElement).style.background =
                    `${hex}28`;
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-4px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  `${hex}55`;
                (e.currentTarget as HTMLButtonElement).style.background =
                  `${hex}18`;
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: hex,
                  boxShadow: `0 0 20px ${hex}55`,
                }}
              />
              <div
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 900,
                  fontSize: 16,
                  color: hex,
                }}
              >
                {lang === "tok" ? tok : label}
              </div>
            </button>
          ))}
        </div>

        {error && !locked && (
          <div style={{ color: "#FB923C", fontWeight: 700, fontSize: 13 }}>
            {lang === "tok" ? "Nogat — traim gen" : "Not quite — try again"}
          </div>
        )}
        {locked && (
          <div style={{ color: "#FB923C", fontWeight: 700, fontSize: 13 }}>
            {lang === "tok"
              ? "Tupela taim rong. Wet liklik..."
              : "Too many attempts. Please wait..."}
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ── PIN VERIFY (Grade 3–5) ─────────────────────────────
function PinVerifyScreen({
  profile,
  lang,
  onSuccess,
  onBack,
}: {
  profile: StudentProfile;
  lang: "tok" | "en";
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [studentId, setStudentId] = React.useState("");
  const [pin, setPin] = React.useState(["", "", "", ""]);
  const [shake, setShake] = React.useState(false);
  const [error, setError] = React.useState("");
  const [wrongCount, setWrongCount] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const pinRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  function handlePinChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);
    if (val && idx < 3) pinRefs[idx + 1].current?.focus();
  }

  function handlePinKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      pinRefs[idx - 1].current?.focus();
    }
  }

  function handleSubmit() {
    if (locked) return;
    const idOk =
      studentId.trim().toUpperCase() ===
      (profile.studentId || "").toUpperCase();
    const pinOk = pin.join("") === (profile.pin || "");

    if (idOk && pinOk) {
      onSuccess();
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      setShake(true);
      setError(
        !idOk
          ? lang === "tok"
            ? "ID i no stret"
            : "Student ID not recognised"
          : lang === "tok"
            ? "PIN i no stret"
            : "Incorrect PIN",
      );
      setPin(["", "", "", ""]);
      pinRefs[0].current?.focus();
      setTimeout(() => setShake(false), 450);
      setTimeout(() => setError(""), 2500);
      if (newCount >= 4) {
        setLocked(true);
        setTimeout(() => {
          setWrongCount(0);
          setLocked(false);
        }, 8000);
      }
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang}>
      <div style={{ textAlign: "center", maxWidth: 420, width: "100%" }}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <InitialAvatar
            name={profile.name}
            avatarIdx={profile.avatarIdx}
            size={80}
          />
        </div>
        <div
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 28,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          {lang === "tok"
            ? "Grade {profile.grade} — Putim ID na PIN bilong yu"
            : `Grade ${profile.grade} — Enter your Student ID and PIN`}
        </div>

        <div
          className={shake ? "v-shake" : ""}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Student ID */}
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {lang === "tok" ? "Namba Bilong Studen" : "Student ID"}
            </div>
            <input
              className="id-input"
              placeholder={lang === "tok" ? "e.g. STU-002" : "e.g. STU-002"}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={locked}
              autoFocus
            />
          </div>

          {/* PIN dots */}
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              PIN
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  className="pin-digit"
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  disabled={locked}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "#FB923C",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
        {locked && (
          <div
            style={{
              color: "#FB923C",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {lang === "tok"
              ? "Tupela taim rong. Wet liklik..."
              : "Too many attempts. Please wait..."}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!studentId.trim() || pin.some((d) => !d) || locked}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #F5A623, #FF6B35)",
            border: "none",
            borderRadius: 14,
            padding: "15px",
            fontSize: 17,
            fontWeight: 900,
            color: "#1A0A00",
            fontFamily: "'Baloo 2', cursive",
            cursor: "pointer",
            opacity:
              !studentId.trim() || pin.some((d) => !d) || locked ? 0.3 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {lang === "tok" ? "Go Insait" : "Log In"}
        </button>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "rgba(255,255,255,0.18)",
            fontWeight: 600,
          }}
        >
          {lang === "tok"
            ? "Bagarapim PIN? Askim tisa bilong yu."
            : "Forgotten your PIN? Ask your teacher."}
        </div>
      </div>
    </PageShell>
  );
}

// ── GRADE CARD ─────────────────────────────────────────
function GradeCard({
  grade,
  onSelect,
  delay,
}: {
  grade: number;
  onSelect: () => void;
  delay: number;
}) {
  const gradeLabels: Record<
    number,
    { tok: string; en: string; color: string }
  > = {
    1: { tok: "Klas Wan", en: "Grade One", color: "#FFD96A" },
    2: { tok: "Klas Tu", en: "Grade Two", color: "#FFB82F" },
    3: { tok: "Klas Tri", en: "Grade Three", color: "#E84D2A" },
    4: { tok: "Klas Foa", en: "Grade Four", color: "#FFD96A" },
    5: { tok: "Klas Faiv", en: "Grade Five", color: "#FFB82F" },
  };
  const info = gradeLabels[grade];

  return (
    <button
      onClick={onSelect}
      style={{
        background: "rgba(13,27,38,0.82)",
        border: `2px solid ${info.color}55`,
        borderRadius: 24,
        padding: "48px 24px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.22s ease",
        animation: `cardReveal 0.45s ease ${delay}s both`,
        backdropFilter: "blur(8px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = info.color;
        el.style.transform = "translateY(-8px)";
        el.style.boxShadow = `0 24px 48px rgba(0,0,0,0.5), 0 0 32px ${info.color}44`;
        el.style.background = `rgba(13,27,38,0.92)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = `${info.color}55`;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
        el.style.background = "rgba(13,27,38,0.82)";
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `${info.color}22`,
          border: `2.5px solid ${info.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 24px ${info.color}66`,
        }}
      >
        <span
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontWeight: 900,
            fontSize: 42,
            color: info.color,
            lineHeight: 1,
          }}
        >
          {grade}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 900,
          fontSize: 20,
          color: "#fff",
          marginTop: 4,
        }}
      >
        {info.tok}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 700,
        }}
      >
        {info.en}
      </div>
    </button>
  );
}

// ── PROVINCE PICKER ───────────────────────────────────
function ProvincePicker({
  lang,
  newProvince,
  setNewProvince,
  handleCreateProfile,
  onBack,
}: {
  lang: "tok" | "en";
  newProvince: string | null;
  setNewProvince: (p: string) => void;
  handleCreateProfile: (p: string) => void;
  onBack: () => void;
}) {
  const [hoveredProv, setHoveredProv] = React.useState<string | null>(null);
  const previewProv = hoveredProv || newProvince;
  const previewData = PROVINCE_DATA.find((p) => p.name === previewProv);
  const previewRegion = previewData?.region ?? null;

  return (
    <div className="ls-page">
      <button className="ls-back" onClick={onBack}>
        ← {lang === "tok" ? "Go Bek" : "Back"}
      </button>
      <motion.div
        className="province-pick-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: 760,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <motion.div
          className="screen-title"
          style={{ marginBottom: 4 }}
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.45 }}
        >
          {lang === "tok"
            ? "Wanem provins bilong yu?"
            : "Which province are you from?"}
        </motion.div>
        <motion.div
          className="screen-sub"
          style={{ marginBottom: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          {lang === "tok"
            ? "Makim provins bilong yu long PNG"
            : "Select your province in Papua New Guinea"}
        </motion.div>

        {/* Guardian preview + province grid side by side */}
        <div
          style={{
            display: "flex",
            gap: 20,
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Guardian preview panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              width: 140,
              flexShrink: 0,
              background: "rgba(0,0,0,0.3)",
              border: previewRegion
                ? `1.5px solid ${CULTURAL_REGIONS[previewRegion].glow.replace("0.5)", "0.4)").replace("0.55)", "0.4)")}`
                : "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              minHeight: 200,
              transition: "border-color 0.3s",
            }}
          >
            <AnimatePresence mode="wait">
              {previewRegion ? (
                <motion.div
                  key={previewRegion}
                  initial={{ scale: 0.7, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                >
                  <ProvinceGuardian
                    region={previewRegion}
                    state="excited"
                    size={96}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    width: 96,
                    height: 135,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    opacity: 0.15,
                  }}
                >
                  🗺
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {previewRegion ? (
                <motion.div
                  key={`label-${previewRegion}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: "center" }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#fff",
                      marginBottom: 2,
                      fontFamily: "'Baloo 2', cursive",
                    }}
                  >
                    {previewData?.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: CULTURAL_REGIONS[previewRegion].glow
                        .replace("0.5)", "1)")
                        .replace("0.55)", "1)"),
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {CULTURAL_REGIONS[previewRegion].label}
                  </div>
                  <div style={{ fontSize: 18, marginTop: 4 }}>
                    {previewData?.food}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.2)",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {lang === "tok" ? "Makim provins" : "Hover a province"}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Province grid */}
          <motion.div
            className="province-pick-grid"
            style={{ flex: 1 }}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {PROVINCE_DATA.map((p, i) => {
              const regionColor = CULTURAL_REGIONS[p.region].glow
                .replace("0.5)", "0.85)")
                .replace("0.55)", "0.85)");
              return (
                <motion.button
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 22, scale: 0.84, rotateX: -18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      rotateX: 0,
                      transition: {
                        type: "spring",
                        bounce: 0.52,
                        duration: 0.55,
                      },
                    },
                  }}
                  whileHover={{
                    y: -5,
                    scale: 1.07,
                    transition: { duration: 0.14 },
                  }}
                  whileTap={{ scale: 0.91 }}
                  className={`prov-pick-btn${newProvince === p.name ? " sel" : ""}`}
                  onMouseEnter={() => setHoveredProv(p.name)}
                  onMouseLeave={() => setHoveredProv(null)}
                  onClick={() => {
                    setNewProvince(p.name);
                    handleCreateProfile(p.name);
                  }}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  <motion.span
                    className={`prov-pick-dot${p.status === "warn" ? " warn" : ""}`}
                    animate={{
                      scale: [1, 1.7, 1],
                      opacity: [1, 0.35, 1],
                      boxShadow:
                        p.status === "warn"
                          ? [
                              "0 0 4px rgba(255,217,61,0.5)",
                              "0 0 14px rgba(255,217,61,0.9)",
                              "0 0 4px rgba(255,217,61,0.5)",
                            ]
                          : [
                              `0 0 4px ${CULTURAL_REGIONS[p.region].glow.replace("0.5)", "0.5)").replace("0.55)", "0.55)")}`,
                              `0 0 14px ${CULTURAL_REGIONS[p.region].glow.replace("0.5)", "0.9)").replace("0.55)", "0.9)")}`,
                              `0 0 4px ${CULTURAL_REGIONS[p.region].glow.replace("0.5)", "0.5)").replace("0.55)", "0.55)")}`,
                            ],
                    }}
                    style={{
                      background: p.status === "warn" ? "#FFD93D" : regionColor,
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: i * 0.17,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="prov-pick-name">{p.name}</span>
                  {newProvince === p.name && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.8 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        background:
                          "radial-gradient(circle, rgba(255,217,61,0.5) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <motion.button
          className="start-btn"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
          whileHover={{ opacity: 0.6 }}
          style={{ fontSize: 13, padding: "12px", marginTop: 16 }}
          onClick={() => handleCreateProfile("PNG")}
        >
          {lang === "tok" ? "Skip — Provins Narapela" : "Skip — Other Province"}
        </motion.button>
      </motion.div>
    </div>
  );
}

// ── MAIN LOGIN SCREEN ──────────────────────────────────
type View =
  | "welcome"
  | "grade"
  | "classCode"
  | "profiles"
  | "verify"
  | "new"
  | "province";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [lang, setLang] = useState<"tok" | "en">("tok");
  const [view, setView] = useState<View>("welcome");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [pendingProfile, setPendingProfile] = useState<StudentProfile | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<number | null>(null);
  const [newGrade, setNewGrade] = useState<number | null>(null);
  const [newProvince, setNewProvince] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const filteredProfiles =
    selectedGrade !== null
      ? MOCK_PROFILES.filter((p) => p.grade === selectedGrade)
      : MOCK_PROFILES;

  // Fall back to all profiles if grade has none
  const displayProfiles =
    filteredProfiles.length > 0 ? filteredProfiles : MOCK_PROFILES;

  function handleGradeSelect(g: number) {
    setSelectedGrade(g);
    // Grade 1-2 → class code first; Grade 3-5 → straight to name list
    // setView(g <= 2 ? "classCode" : "profiles"); // class code skipped for demo
    setView("profiles");
  }

  function handleNewStudent() {
    if (!newName.trim() || newAvatar === null || newGrade === null) return;
    setView("province");
  }

  function handleCreateProfile(province: string) {
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
      province,
    };
    onLogin(profile, true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800;900&family=Playfair+Display:ital,wght@1,700;1,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        body { background: #091507; overflow-x: hidden; font-family: 'Nunito', sans-serif; }

        .ls-page {
          width: 100vw; min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 60% at 15% 10%, rgba(34,95,15,0.55) 0%, transparent 55%),
            radial-gradient(ellipse 55% 50% at 88% 85%, rgba(200,80,8,0.32) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 75% 20%, rgba(18,65,8,0.38) 0%, transparent 48%),
            #091507;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        /* ── LANG TOGGLE ── */
        .ls-lang-bar {
          position: absolute; top: 24px; right: 28px;
          display: flex; gap: 8px; z-index: 10;
        }
        .ls-lang-btn {
          background: rgba(20,10,0,0.75);
          border: none;
          border-radius: 50px; padding: 10px 22px;
          font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.85);
          cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; letter-spacing: 0.3px;
          backdrop-filter: blur(8px);
        }
        .ls-lang-btn:hover { background: rgba(40,20,0,0.85); }
        .ls-lang-btn.active {
          background: linear-gradient(135deg, #FFB82F 0%, #E84D2A 100%);
          color: #fff;
        }

        /* ── BACK BUTTON ── */
        .ls-back {
          position: absolute; top: 24px; left: 28px;
          background: rgba(13,27,38,0.75); border: none;
          color: #F5E6D3; font-size: 14px; font-weight: 800;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px;
          transition: all 0.2s; z-index: 10;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .ls-back:hover { background: rgba(13,27,38,0.92); color: #FFD96A; }

        /* ══ WELCOME SCREEN ══ */
        .welcome-wrap {
          position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column;
          align-items: center; z-index: 1;
          text-align: center;
          opacity: 0; transition: opacity 0.7s ease;
          width: 100%;
        }
        .welcome-wrap.vis { opacity: 1; }

        .ls-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 6px 18px;
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.38);
          letter-spacing: 1.8px; text-transform: uppercase;
          margin-bottom: 28px;
        }

        .ls-logo {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ls-logo-trio {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ls-trio-word {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(28px, 4.2vw, 56px);
          font-weight: 800;
          letter-spacing: -0.5px;
          white-space: nowrap;
          padding: 0;
          background: transparent;
          position: relative;
          z-index: 2;
        }

        .ls-trio-left {
          color: #FFD93D;
          filter: drop-shadow(0 0 18px rgba(255,217,61,0.75));
          margin-right: -22px;
        }

        .ls-trio-right {
          color: rgba(255,255,255,0.95);
          filter: drop-shadow(0 0 14px rgba(255,255,255,0.4));
          margin-left: -22px;
        }

        .ls-trio-bird {
          background: transparent;
          border: none;
          padding: 0;
          z-index: 1;
          position: relative;
        }

        .ls-tagline {
          font-size: 17px; color: rgba(255,255,255,0.45);
          font-weight: 600; line-height: 1.7;
          max-width: 440px; margin: 0 auto 44px;
        }

        .ls-decorative { font-size: 24px; letter-spacing: 10px; opacity: 0.4; margin-bottom: 48px; }

        .ls-stats-row {
          display: flex; align-items: center;
          background: rgba(20,10,0,0.72);
          backdrop-filter: blur(12px);
          border-radius: 50px; padding: 16px 36px;
          gap: 0; margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ls-stat {
          display: flex; align-items: center; gap: 10px;
          padding: 0 28px; text-align: left;
        }
        .ls-stat + .ls-stat {
          border-left: 1px solid rgba(255,255,255,0.15);
        }
        .ls-stat-icon { flex-shrink: 0; display: block; }
        .ls-stat-val {
          font-family: 'Baloo 2', cursive;
          font-size: 26px; font-weight: 900; color: #FFB82F;
          line-height: 1; margin-bottom: 2px;
        }
        .ls-stat-lbl {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.45); letter-spacing: 1px; text-transform: uppercase;
        }

        .ls-start-btn {
          background: linear-gradient(135deg, #FFD96A 0%, #FFB82F 50%, #E84D2A 100%);
          border: none;
          border-radius: 50px; padding: 14px 64px;
          font-size: 20px; font-weight: 900; color: #3B1500;
          font-family: 'Baloo 2', cursive; cursor: pointer;
          transition: all 0.22s; letter-spacing: 0.5px;
          box-shadow: 0 6px 32px rgba(0,0,0,0.5), 0 0 48px rgba(255,184,47,0.35);
          margin-bottom: 16px;
        }
        .ls-start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.55), 0 0 64px rgba(255,184,47,0.5);
        }

        .ls-offline-pill {
          position: absolute; bottom: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 14px; font-weight: 800; color: #fff;
          letter-spacing: 0.4px;
          background: rgba(20,10,0,0.85);
          backdrop-filter: blur(12px);
          padding: 14px 28px;
          z-index: 10;
        }
        .ls-offline-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #4ADE80;
          box-shadow: 0 0 10px rgba(74,222,128,0.9); flex-shrink: 0;
        }

        /* ══ GRADE SCREEN ══ */
        .grade-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 100px 64px 64px;
          width: 100%; max-width: 1100px; margin: 0 auto;
        }

        .screen-title {
          font-family: 'Baloo 2', cursive;
          font-size: 42px; font-weight: 900; color: #5A2E19;
          margin-bottom: 10px; text-align: center;
          text-shadow: 0 2px 8px rgba(255,220,150,0.6), 0 1px 0 rgba(255,255,255,0.3);
        }
        .screen-sub {
          font-size: 22px; color: #0D1B26;
          font-weight: 800; margin-bottom: 56px; text-align: center;
          text-shadow: 0 1px 4px rgba(255,220,150,0.5);
        }

        .grade-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px; width: 100%;
        }

        /* ══ PROFILES SCREEN ══ */
        .profiles-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 100px 48px 48px;
          width: 100%; max-width: 1100px; margin: 0 auto;
        }

        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px; width: 100%; margin-bottom: 24px;
        }

        .divider {
          display: flex; align-items: center; gap: 14px;
          width: 100%; margin-bottom: 16px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text {
          font-size: 11px; color: rgba(255,255,255,0.2);
          font-weight: 800; white-space: nowrap; letter-spacing: 1.5px;
        }

        .new-student-btn {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1.5px dashed rgba(255,255,255,0.12);
          border-radius: 16px; padding: 16px;
          color: rgba(255,255,255,0.3);
          font-size: 14px; font-weight: 800; font-family: 'Nunito', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .new-student-btn:hover {
          border-color: #F5A623; color: #F5A623;
          background: rgba(245,166,35,0.04);
        }

        /* ══ NEW STUDENT FORM ══ */
        .new-form-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 100px 48px 48px;
          width: 100%; max-width: 680px; margin: 0 auto;
        }
        .new-form { width: 100%; animation: fadeUp 0.35s ease both; }

        .form-section { margin-bottom: 28px; }
        .form-label {
          font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.28);
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 10px; display: block;
        }

        .name-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 15px 20px;
          font-size: 18px; font-weight: 800; color: #fff;
          font-family: 'Nunito', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .name-input::placeholder { color: rgba(255,255,255,0.16); font-weight: 600; }
        .name-input:focus { border-color: #F5A623; background: rgba(245,166,35,0.04); }

        .avatar-grid-new {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        .avatar-btn-new {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 14px 6px;
          cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .avatar-btn-new:hover { border-color: rgba(245,166,35,0.5); transform: translateY(-3px); }
        .avatar-btn-new.sel {
          border-color: #F5A623; background: rgba(245,166,35,0.1);
          box-shadow: 0 4px 18px rgba(245,166,35,0.2);
        }
        .avatar-btn-new .av-nm {
          font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.4); text-align: center; line-height: 1.2;
        }

        .grade-grid-new { display: flex; gap: 10px; }
        .grade-btn-new {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 14px 6px;
          cursor: pointer; transition: all 0.2s; font-family: 'Nunito', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
        }
        .grade-btn-new:hover { border-color: rgba(245,166,35,0.5); transform: translateY(-3px); }
        .grade-btn-new.sel {
          border-color: #F5A623; background: rgba(245,166,35,0.1);
          box-shadow: 0 4px 18px rgba(245,166,35,0.18);
        }
        .grade-btn-new .gn {
          font-size: 24px; font-weight: 900; color: #fff;
          font-family: 'Baloo 2', cursive;
        }
        .grade-btn-new .gl {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.3); letter-spacing: 0.8px; text-transform: uppercase;
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
        .start-btn:disabled { opacity: 0.25; cursor: not-allowed; transform: none; }

        /* floating bg decorations */
        .ls-decor {
          position: fixed; pointer-events: none; user-select: none; z-index: 0;
          animation: floatDecor 5s ease-in-out infinite alternate;
        }

        @keyframes floatDecor {
          from { transform: translateY(0) rotate(0deg); }
          to   { transform: translateY(-18px) rotate(10deg); }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══ PROVINCE PICKER ══ */
        .province-pick-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 100px 48px 48px;
          width: 100%; max-width: 680px; margin: 0 auto;
        }
        .province-pick-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; width: 100%; margin-bottom: 28px;
          perspective: 900px;
        }
        .prov-pick-btn {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 14px; padding: 14px 12px;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          will-change: transform;
          transform-style: preserve-3d;
        }
        .prov-pick-btn.sel {
          border: 2px solid #FFD93D;
          background: rgba(255,217,61,0.1);
          box-shadow: 0 0 20px rgba(255,217,61,0.35), 0 0 40px rgba(255,217,61,0.1);
        }
        .prov-pick-name {
          font-size: 14px; font-weight: 800; color: #fff; letter-spacing: 0.2px;
        }
        .prov-pick-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #52B788;
          display: inline-block;
        }
        .prov-pick-dot.warn { background: #FFD93D; }

        @media (max-width: 700px) {
          .grade-grid { grid-template-columns: repeat(3, 1fr); }
          .profiles-grid { grid-template-columns: 1fr 1fr; }
          .ls-stats-row { gap: 10px; }
          .ls-stat { padding: 14px 16px; }
          .avatar-grid-new { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Background decorations */}
      {["🌺", "🥥", "🌿", "🌸", "🥭", "🐚", "🌴"].map((item, i) => (
        <div
          key={i}
          className="ls-decor"
          style={{
            fontSize: 20 + (i % 4) * 10,
            opacity: 0.03 + (i % 3) * 0.015,
            top: `${10 + ((i * 13) % 76)}%`,
            left: i % 2 === 0 ? `${(i * 5) % 8}%` : `${89 + ((i * 2) % 8)}%`,
            animationDuration: `${4 + i * 0.7}s`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {item}
        </div>
      ))}

      {/* ══ WELCOME SCREEN ══ */}
      {view === "welcome" && (
        <div
          className="ls-page"
          style={{
            backgroundImage: "url('/Login-Background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          <div className="ls-lang-bar">
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

          <div className={`welcome-wrap${mounted ? " vis" : ""}`}>
            <div className="ls-stats-row">
              <div className="ls-stat">
                <svg
                  className="ls-stat-icon"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="9"
                    cy="7"
                    r="3.5"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="8"
                    r="2.5"
                    stroke="#FFB82F"
                    strokeWidth="1.6"
                    opacity="0.6"
                  />
                  <path
                    d="M21.5 20c0-2.485-1.567-4.5-3.5-4.5"
                    stroke="#FFB82F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
                <div>
                  <div className="ls-stat-val">12,480</div>
                  <div className="ls-stat-lbl">
                    {lang === "tok" ? "Studen Tude" : "Students Today"}
                  </div>
                </div>
              </div>
              <div className="ls-stat">
                <svg
                  className="ls-stat-icon"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="8" r="2.2" fill="#FFB82F" />
                </svg>
                <div>
                  <div className="ls-stat-val">8</div>
                  <div className="ls-stat-lbl">
                    {lang === "tok" ? "Provins Live" : "Provinces Live"}
                  </div>
                </div>
              </div>
              <div className="ls-stat">
                <svg
                  className="ls-stat-icon"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 9l9-5 9 5-9 5-9-5z"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 11.5V17c0 1.657 2.239 3 5 3s5-1.343 5-3v-5.5"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="21"
                    y1="9"
                    x2="21"
                    y2="14"
                    stroke="#FFB82F"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <div className="ls-stat-val">68%</div>
                  <div className="ls-stat-lbl">
                    {lang === "tok" ? "Avg Komplisin" : "Avg Completion"}
                  </div>
                </div>
              </div>
            </div>

            <button className="ls-start-btn" onClick={() => setView("grade")}>
              {lang === "tok" ? "Stat Lainim" : "Start Learning"}
            </button>
          </div>

          <div className="ls-offline-pill">
            <span className="ls-offline-dot" />
            {lang === "tok"
              ? "Wok long olgeta hap — no nid internet"
              : "Works everywhere — no internet needed"}
          </div>
        </div>
      )}

      {/* ══ GRADE SELECTION SCREEN ══ */}
      {view === "grade" && (
        <div className="ls-page" style={{ backgroundImage: "url('/GradeScreen.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <button className="ls-back" onClick={() => setView("welcome")}>
            ← {lang === "tok" ? "Go Bek" : "Back"}
          </button>
          <div className="ls-lang-bar">
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

          <div className="grade-wrap">
            <div className="screen-title">
              {lang === "tok"
                ? "Wanem klas bilong yu?"
                : "Which grade are you in?"}
            </div>
            <div className="screen-sub">
              {lang === "tok"
                ? "Makim klas bilong yu pas"
                : "Select your grade to continue"}
            </div>

            <div className="grade-grid">
              {GRADES.map((g, i) => (
                <GradeCard
                  key={g}
                  grade={g}
                  onSelect={() => handleGradeSelect(g)}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CLASS CODE SCREEN (Grade 1–2) ══ */}
      {view === "classCode" && (
        <ClassCodeScreen
          lang={lang}
          onSuccess={() => setView("profiles")}
          onBack={() => setView("grade")}
        />
      )}

      {/* ══ STUDENT SELECTION SCREEN ══ */}
      {view === "profiles" && (
        <div className="ls-page" style={{ backgroundImage: "url('/ClasscodeScreen.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <button className="ls-back" onClick={() => setView("grade")}>
            ← {lang === "tok" ? "Go Bek" : "Back"}
          </button>
          <div className="ls-lang-bar">
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

          <div className="profiles-wrap">
            <div className="screen-title">
              {lang === "tok" ? "Husait yu?" : "Who are you?"}
            </div>
            <div className="screen-sub">
              {lang === "tok"
                ? `Klas ${selectedGrade} — Makim nem bilong yu`
                : `Grade ${selectedGrade} — Tap your name to continue`}
            </div>

            <div className="profiles-grid">
              {displayProfiles.map((profile, i) => (
                <StudentCard
                  key={profile.id}
                  profile={profile}
                  onSelect={() => {
                    onLogin(profile, false); // skipping verify for demo
                  }}
                  delay={i * 0.1}
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

            <button className="new-student-btn" onClick={() => setView("new")}>
              <span style={{ fontSize: 18, fontWeight: 400 }}>+</span>
              {lang === "tok"
                ? "Stat Nupela — Stat Lainim"
                : "Add New Student — Start Fresh"}
            </button>
          </div>
        </div>
      )}

      {/* ══ NEW STUDENT FORM ══ */}
      {/* ══ VERIFY SCREEN — routes by grade ══ */}
      {view === "verify" &&
        pendingProfile &&
        (pendingProfile.grade <= 2 ? (
          <ColourVerifyScreen
            profile={pendingProfile}
            lang={lang}
            onSuccess={() => onLogin(pendingProfile, false)}
            onBack={() => {
              setPendingProfile(null);
              setView("profiles");
            }}
          />
        ) : (
          <PinVerifyScreen
            profile={pendingProfile}
            lang={lang}
            onSuccess={() => onLogin(pendingProfile, false)}
            onBack={() => {
              setPendingProfile(null);
              setView("profiles");
            }}
          />
        ))}

      {view === "new" && (
        <div className="ls-page">
          <button className="ls-back" onClick={() => setView("profiles")}>
            ← {lang === "tok" ? "Go Bek" : "Back"}
          </button>
          <div className="ls-lang-bar">
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

          <div className="new-form-wrap">
            <div className="screen-title" style={{ marginBottom: 8 }}>
              {lang === "tok" ? "Nupela Studen" : "New Student"}
            </div>
            <div className="screen-sub">
              {lang === "tok"
                ? "Putim details bilong yu"
                : "Fill in your details to get started"}
            </div>

            <div className="new-form">
              <div className="form-section">
                <label className="form-label">
                  {lang === "tok"
                    ? "Wanem nem bilong yu?"
                    : "What is your name?"}
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
              </div>

              <div className="form-section">
                <label className="form-label">
                  {lang === "tok"
                    ? "Makim animal bilong yu"
                    : "Choose your animal"}
                </label>
                <div className="avatar-grid-new">
                  {AVATAR_ANIMALS.map((av, i) => {
                    const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
                    return (
                      <button
                        key={i}
                        className={`avatar-btn-new${newAvatar === i ? " sel" : ""}`}
                        onClick={() => setNewAvatar(i)}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: c.bg,
                            border: `2px solid ${c.accent}55`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Baloo 2', cursive",
                              fontWeight: 900,
                              fontSize: 18,
                              color: c.accent,
                            }}
                          >
                            {av.symbol}
                          </span>
                        </div>
                        <span className="av-nm">
                          {lang === "tok" ? av.tok : av.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-section">
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
              </div>

              <button
                className="start-btn"
                disabled={
                  !newName.trim() || newAvatar === null || newGrade === null
                }
                onClick={handleNewStudent}
              >
                {lang === "tok" ? "Nekis →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PROVINCE PICKER ══ */}
      {view === "province" && (
        <ProvincePicker
          lang={lang}
          newProvince={newProvince}
          setNewProvince={setNewProvince}
          handleCreateProfile={handleCreateProfile}
          onBack={() => setView("new")}
        />
      )}
    </>
  );
}
