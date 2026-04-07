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
  // Grade 3-5 only
  studentId?: string;
  pin?: string;
}

// Demo class code — teacher writes this on the board each day
const CLASS_CODE = "PNG1";

// Full pool of bilum items shown in the picker
const BILUM_POOL = [
  "🥭","🐚","🌺","⭐","🪸","🌿","🦋","🌟","🪴","🥥","🌸","🍃","🐦","🌊","🪨",
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
  { symbol: "C", name: "Cassowary",        tok: "Muruk" },
  { symbol: "K", name: "Crocodile",        tok: "Pukpuk" },
  { symbol: "T", name: "Turtle",           tok: "Honu" },
  { symbol: "F", name: "Butterfly",        tok: "Bataplai" },
  { symbol: "S", name: "Coral Fish",       tok: "Pis Solwara" },
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
    grade: 3,
    lessonProgress: 87,
    streak: 7,
    bilumItems: ["🥭", "🐚", "🌺", "⭐", "🪸", "🌿", "🦋"],
    lastSeen: "Today",
    placement: "Grade 3 — Flying Ahead",
    studentId: "STU-002",
    pin: "4721",
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
        <span style={{ fontSize: 12, fontWeight: 900, color }}>
          {pct}%
        </span>
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
        background: "rgba(255,255,255,0.045)",
        border: `1.5px solid rgba(255,255,255,0.1)`,
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
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = c.accent;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = `0 20px 48px ${c.accent}28`;
        el.style.background = `${c.accent}0e`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "rgba(255,255,255,0.1)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.background = "rgba(255,255,255,0.045)";
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.accent, borderRadius: "20px 20px 0 0", opacity: 0.65 }} />

      <InitialAvatar name={profile.name} avatarIdx={profile.avatarIdx} size={80} />

      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Baloo 2', cursive", color: "#fff", lineHeight: 1 }}>
        {profile.name}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
        Grade {profile.grade}
      </div>
    </button>
  );
}

// ── SHARED PAGE SHELL ──────────────────────────────────
const PAGE_BG = "radial-gradient(ellipse 70% 60% at 15% 10%, rgba(34,95,15,0.55) 0%, transparent 55%), radial-gradient(ellipse 55% 50% at 88% 85%, rgba(200,80,8,0.32) 0%, transparent 50%), #091507";

function PageShell({ children, onBack, lang }: { children: React.ReactNode; onBack: () => void; lang: "tok" | "en" }) {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: PAGE_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", position: "relative" }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .v-shake { animation: shake 0.45s ease; }
        .pin-digit { width:52px; height:64px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.12); border-radius:12px; font-size:28px; font-weight:900; color:#fff; font-family:'Baloo 2',cursive; text-align:center; outline:none; transition:border-color 0.2s; }
        .pin-digit:focus { border-color:#F5A623; background:rgba(245,166,35,0.06); }
        .id-input { width:100%; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.12); border-radius:14px; padding:14px 18px; font-size:17px; font-weight:800; color:#fff; font-family:'Nunito',sans-serif; outline:none; transition:border-color 0.2s; letter-spacing:2px; }
        .id-input:focus { border-color:#F5A623; background:rgba(245,166,35,0.04); }
        .id-input::placeholder { color:rgba(255,255,255,0.16); letter-spacing:0; font-weight:600; }
      `}</style>
      <button onClick={onBack} style={{ position:"absolute", top:24, left:28, background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:800, fontFamily:"'Nunito',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:"6px 4px" }}>
        ← {lang === "tok" ? "Go Bek" : "Back"}
      </button>
      {children}
    </div>
  );
}

// ── CLASS CODE SCREEN (Grade 1–2) ──────────────────────
function ClassCodeScreen({ lang, onSuccess, onBack }: { lang: "tok" | "en"; onSuccess: () => void; onBack: () => void }) {
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
      setTimeout(() => { setError(false); setCode(""); }, 1800);
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang}>
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        {/* Icon */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(245,166,35,0.12)", border: "1.5px solid rgba(245,166,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect x="3" y="9" width="28" height="20" rx="4" stroke="#F5A623" strokeWidth="2"/>
              <path d="M11 9V7a6 6 0 0112 0v2" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="17" cy="19" r="3" fill="#F5A623" opacity="0.7"/>
            </svg>
          </div>
        </div>

        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
          {lang === "tok" ? "Putim Kod Bilong Klas" : "Enter Class Code"}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 12 }}>
          {lang === "tok" ? "Lukim bord — tisa i raitim kod tude" : "Look at the board — your teacher wrote today's code"}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 600, marginBottom: 36, fontStyle: "italic" }}>
          Demo code: <span style={{ color: "#F5A623", fontStyle: "normal", fontWeight: 800 }}>PNG1</span>
        </div>

        <div className={shake ? "v-shake" : ""} style={{ marginBottom: 24 }}>
          <input
            className="id-input"
            style={{ fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: 8, borderColor: error ? "#FB923C" : undefined }}
            placeholder="____"
            value={code}
            maxLength={6}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        {error && (
          <div style={{ color: "#FB923C", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
            {lang === "tok" ? "Kod i no stret — traim gen" : "Wrong code — try again"}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={code.trim().length < 3}
          style={{ width: "100%", background: "linear-gradient(135deg, #F5A623, #FF6B35)", border: "none", borderRadius: 14, padding: "16px", fontSize: 17, fontWeight: 900, color: "#1A0A00", fontFamily: "'Baloo 2', cursive", cursor: code.length < 3 ? "not-allowed" : "pointer", opacity: code.length < 3 ? 0.35 : 1, transition: "all 0.2s" }}>
          {lang === "tok" ? "Go Insait" : "Enter Class"}
        </button>
      </div>
    </PageShell>
  );
}

// ── COLOUR VERIFY (Grade 1–2) ──────────────────────────
const COLOUR_OPTIONS = [
  { label: "Green",  tok: "Grin",    hex: "#52B788" },
  { label: "Blue",   tok: "Blu",     hex: "#60A5FA" },
  { label: "Pink",   tok: "Pik",     hex: "#F9A8D4" },
  { label: "Orange", tok: "Orens",   hex: "#F5A623" },
  { label: "Yellow", tok: "Yelo",    hex: "#86EFAC" },
  { label: "Purple", tok: "Popol",   hex: "#C4B5FD" },
];

function ColourVerifyScreen({ profile, lang, onSuccess, onBack }: { profile: StudentProfile; lang: "tok" | "en"; onSuccess: () => void; onBack: () => void }) {
  const [shake, setShake] = React.useState<number | null>(null);
  const [error, setError] = React.useState(false);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [locked, setLocked] = React.useState(false);

  // Correct colour index matches avatarIdx
  const correctIdx = profile.avatarIdx % COLOUR_OPTIONS.length;

  // Shuffle once per profile
  const shuffled = React.useMemo(() => {
    return [...COLOUR_OPTIONS.map((c, i) => ({ ...c, origIdx: i }))]
      .sort(() => Math.random() - 0.5);
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
        setTimeout(() => { setWrongCount(0); setLocked(false); }, 5000);
      }
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang}>
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%" }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <InitialAvatar name={profile.name} avatarIdx={profile.avatarIdx} size={88} />
        </div>

        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.38)", fontWeight: 600, marginBottom: 48 }}>
          {lang === "tok" ? "Wanem colour bilong yu?" : "What's your favourite colour?"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
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
              onMouseEnter={e => {
                if (!locked) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = hex;
                  (e.currentTarget as HTMLButtonElement).style.background = `${hex}28`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${hex}55`;
                (e.currentTarget as HTMLButtonElement).style.background = `${hex}18`;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: hex, boxShadow: `0 0 20px ${hex}55` }} />
              <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: 16, color: hex }}>
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
            {lang === "tok" ? "Tupela taim rong. Wet liklik..." : "Too many attempts. Please wait..."}
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ── PIN VERIFY (Grade 3–5) ─────────────────────────────
function PinVerifyScreen({ profile, lang, onSuccess, onBack }: { profile: StudentProfile; lang: "tok" | "en"; onSuccess: () => void; onBack: () => void }) {
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
    const idOk = studentId.trim().toUpperCase() === (profile.studentId || "").toUpperCase();
    const pinOk = pin.join("") === (profile.pin || "");

    if (idOk && pinOk) {
      onSuccess();
    } else {
      const newCount = wrongCount + 1;
      setWrongCount(newCount);
      setShake(true);
      setError(!idOk
        ? (lang === "tok" ? "ID i no stret" : "Student ID not recognised")
        : (lang === "tok" ? "PIN i no stret" : "Incorrect PIN"));
      setPin(["", "", "", ""]);
      pinRefs[0].current?.focus();
      setTimeout(() => setShake(false), 450);
      setTimeout(() => setError(""), 2500);
      if (newCount >= 4) {
        setLocked(true);
        setTimeout(() => { setWrongCount(0); setLocked(false); }, 8000);
      }
    }
  }

  return (
    <PageShell onBack={onBack} lang={lang}>
      <div style={{ textAlign: "center", maxWidth: 420, width: "100%" }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <InitialAvatar name={profile.name} avatarIdx={profile.avatarIdx} size={80} />
        </div>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 36 }}>
          {lang === "tok" ? "Grade {profile.grade} — Putim ID na PIN bilong yu" : `Grade ${profile.grade} — Enter your Student ID and PIN`}
        </div>

        <div className={shake ? "v-shake" : ""} style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
          {/* Student ID */}
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
              {lang === "tok" ? "Namba Bilong Studen" : "Student ID"}
            </div>
            <input
              className="id-input"
              placeholder={lang === "tok" ? "e.g. STU-002" : "e.g. STU-002"}
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              disabled={locked}
              autoFocus
            />
          </div>

          {/* PIN dots */}
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
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
                  onChange={e => handlePinChange(i, e.target.value)}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  disabled={locked}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: "#FB923C", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {locked && (
          <div style={{ color: "#FB923C", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
            {lang === "tok" ? "Tupela taim rong. Wet liklik..." : "Too many attempts. Please wait..."}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!studentId.trim() || pin.some(d => !d) || locked}
          style={{ width: "100%", background: "linear-gradient(135deg, #F5A623, #FF6B35)", border: "none", borderRadius: 14, padding: "15px", fontSize: 17, fontWeight: 900, color: "#1A0A00", fontFamily: "'Baloo 2', cursive", cursor: "pointer", opacity: (!studentId.trim() || pin.some(d => !d) || locked) ? 0.3 : 1, transition: "opacity 0.2s" }}>
          {lang === "tok" ? "Go Insait" : "Log In"}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.18)", fontWeight: 600 }}>
          {lang === "tok" ? "Bagarapim PIN? Askim tisa bilong yu." : "Forgotten your PIN? Ask your teacher."}
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
  const gradeLabels: Record<number, { tok: string; en: string; color: string }> = {
    1: { tok: "Klas Wan",  en: "Grade One",   color: "#60A5FA" },
    2: { tok: "Klas Tu",   en: "Grade Two",   color: "#52B788" },
    3: { tok: "Klas Tri",  en: "Grade Three", color: "#F5A623" },
    4: { tok: "Klas Foa",  en: "Grade Four",  color: "#F9A8D4" },
    5: { tok: "Klas Faiv", en: "Grade Five",  color: "#C4B5FD" },
  };
  const info = gradeLabels[grade];

  return (
    <button
      onClick={onSelect}
      style={{
        background: "rgba(255,255,255,0.045)",
        border: `1.5px solid rgba(255,255,255,0.1)`,
        borderRadius: 24,
        padding: "48px 24px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.22s ease",
        animation: `cardReveal 0.45s ease ${delay}s both`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = info.color;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = `0 20px 48px ${info.color}28`;
        el.style.background = `${info.color}10`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "rgba(255,255,255,0.1)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.background = "rgba(255,255,255,0.045)";
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `${info.color}1A`,
          border: `2.5px solid ${info.color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 28px ${info.color}22`,
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
          color: "rgba(255,255,255,0.35)",
          fontWeight: 600,
        }}
      >
        {info.en}
      </div>
    </button>
  );
}

// ── MAIN LOGIN SCREEN ──────────────────────────────────
type View = "welcome" | "grade" | "classCode" | "profiles" | "verify" | "new";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [lang, setLang] = useState<"tok" | "en">("tok");
  const [view, setView] = useState<View>("welcome");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [pendingProfile, setPendingProfile] = useState<StudentProfile | null>(null);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState<number | null>(null);
  const [newGrade, setNewGrade] = useState<number | null>(null);
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
    setView(g <= 2 ? "classCode" : "profiles");
  }

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
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 6px 16px;
          font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.32);
          cursor: pointer; font-family: 'Nunito', sans-serif;
          transition: all 0.2s; letter-spacing: 0.3px;
        }
        .ls-lang-btn:hover { color: rgba(255,255,255,0.6); }
        .ls-lang-btn.active {
          background: rgba(245,166,35,0.14);
          border-color: #F5A623; color: #F5A623;
        }

        /* ── BACK BUTTON ── */
        .ls-back {
          position: absolute; top: 24px; left: 28px;
          background: none; border: none;
          color: rgba(255,255,255,0.3); font-size: 13px; font-weight: 800;
          font-family: 'Nunito', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 4px; transition: color 0.2s; z-index: 10;
        }
        .ls-back:hover { color: rgba(255,255,255,0.65); }

        /* ══ WELCOME SCREEN ══ */
        .welcome-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 48px 48px;
          opacity: 0; transition: opacity 0.7s ease;
          max-width: 800px; width: 100%; margin: 0 auto;
          overflow: hidden;
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
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 800; line-height: 1.35; margin-bottom: 20px;
          background: linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #FFD700 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 4px 24px rgba(245,166,35,0.4));
          letter-spacing: -0.5px;
          white-space: nowrap;
          padding-bottom: 0.15em;
        }

        .ls-tagline {
          font-size: 17px; color: rgba(255,255,255,0.45);
          font-weight: 600; line-height: 1.7;
          max-width: 440px; margin: 0 auto 44px;
        }

        .ls-decorative { font-size: 24px; letter-spacing: 10px; opacity: 0.4; margin-bottom: 48px; }

        .ls-stats-row {
          display: flex; gap: 16px; margin-bottom: 48px;
        }
        .ls-stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 18px 28px; text-align: center;
        }
        .ls-stat-val {
          font-family: 'Baloo 2', cursive;
          font-size: 28px; font-weight: 900; color: #F5A623;
          line-height: 1; margin-bottom: 4px;
        }
        .ls-stat-lbl {
          font-size: 10px; font-weight: 800;
          color: rgba(255,255,255,0.28); letter-spacing: 1px; text-transform: uppercase;
        }

        .ls-start-btn {
          background: linear-gradient(135deg, #F5A623 0%, #FF6B35 100%);
          border: none; border-radius: 18px; padding: 18px 64px;
          font-size: 20px; font-weight: 900; color: #1A0A00;
          font-family: 'Baloo 2', cursive; cursor: pointer;
          transition: all 0.22s; letter-spacing: 0.4px;
          box-shadow: 0 8px 32px rgba(245,166,35,0.45);
          margin-bottom: 20px;
        }
        .ls-start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(245,166,35,0.6);
        }

        .ls-offline-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.2);
          letter-spacing: 0.4px;
        }
        .ls-offline-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ADE80;
          box-shadow: 0 0 10px rgba(74,222,128,0.7); flex-shrink: 0;
        }

        /* ══ GRADE SCREEN ══ */
        .grade-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 100px 64px 64px;
          width: 100%; max-width: 1100px; margin: 0 auto;
        }

        .screen-title {
          font-family: 'Baloo 2', cursive;
          font-size: 42px; font-weight: 900; color: #fff;
          margin-bottom: 10px; text-align: center;
        }
        .screen-sub {
          font-size: 16px; color: rgba(255,255,255,0.3);
          font-weight: 600; margin-bottom: 56px; text-align: center;
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
        <div className="ls-page">
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
            <div className="ls-badge">Papua New Guinea · AI Tutor</div>
            <div className="ls-logo">
              SingSinghAI
              <span style={{
                WebkitTextFillColor: "rgba(255,255,255,0.3)",
                margin: "0 12px",
                fontWeight: 400,
              }}>·</span>
              <span style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>LiteHaus</span>
            </div>
            <div className="ls-tagline">
              {lang === "tok"
                ? "Skul bilong yu i stap hia. Lainim wantaim AI tutor — long olgeta hap, no nid internet."
                : "Your school is here. Learn with an AI tutor — anywhere, no internet needed."}
            </div>

            <div className="ls-decorative">🌿 🌺 🥭 🌺 🌿</div>

            <div className="ls-stats-row">
              <div className="ls-stat">
                <div className="ls-stat-val">12,480</div>
                <div className="ls-stat-lbl">
                  {lang === "tok" ? "Studen Tude" : "Students Today"}
                </div>
              </div>
              <div className="ls-stat">
                <div className="ls-stat-val">8</div>
                <div className="ls-stat-lbl">
                  {lang === "tok" ? "Provins Live" : "Provinces Live"}
                </div>
              </div>
              <div className="ls-stat">
                <div className="ls-stat-val">68%</div>
                <div className="ls-stat-lbl">
                  {lang === "tok" ? "Avg Komplisin" : "Avg Completion"}
                </div>
              </div>
            </div>

            <button
              className="ls-start-btn"
              onClick={() => setView("grade")}
            >
              {lang === "tok" ? "Stat Lainim" : "Start Learning"}
            </button>

            <div className="ls-offline-pill">
              <span className="ls-offline-dot" />
              {lang === "tok"
                ? "Wok long olgeta hap — no nid internet"
                : "Works everywhere — no internet needed"}
            </div>
          </div>
        </div>
      )}

      {/* ══ GRADE SELECTION SCREEN ══ */}
      {view === "grade" && (
        <div className="ls-page">
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
              {lang === "tok" ? "Wanem klas bilong yu?" : "Which grade are you in?"}
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
        <div className="ls-page">
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
                  onSelect={() => { setPendingProfile(profile); setView("verify"); }}
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

            <button
              className="new-student-btn"
              onClick={() => setView("new")}
            >
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
      {view === "verify" && pendingProfile && (pendingProfile.grade <= 2 ? (
        <ColourVerifyScreen
          profile={pendingProfile}
          lang={lang}
          onSuccess={() => onLogin(pendingProfile, false)}
          onBack={() => { setPendingProfile(null); setView("profiles"); }}
        />
      ) : (
        <PinVerifyScreen
          profile={pendingProfile}
          lang={lang}
          onSuccess={() => onLogin(pendingProfile, false)}
          onBack={() => { setPendingProfile(null); setView("profiles"); }}
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
              {lang === "tok" ? "Putim details bilong yu" : "Fill in your details to get started"}
            </div>

            <div className="new-form">
              <div className="form-section">
                <label className="form-label">
                  {lang === "tok" ? "Wanem nem bilong yu?" : "What is your name?"}
                </label>
                <input
                  className="name-input"
                  placeholder={lang === "tok" ? "Raitim nem bilong yu..." : "Type your name..."}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="form-section">
                <label className="form-label">
                  {lang === "tok" ? "Makim animal bilong yu" : "Choose your animal"}
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
                  {lang === "tok" ? "Wanem klas bilong yu?" : "Which grade are you in?"}
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
                disabled={!newName.trim() || newAvatar === null || newGrade === null}
                onClick={handleNewStudent}
              >
                {lang === "tok" ? "Stat Lainim!" : "Start Learning!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
