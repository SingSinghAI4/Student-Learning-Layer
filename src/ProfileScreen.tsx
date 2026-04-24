import React, { useEffect, useState } from "react";
import { StudentProfile } from "./LoginScreen";

interface ProfileScreenProps {
  profile: StudentProfile;
  onContinue: () => void;
  onBack: () => void;
  lang: "tok" | "en";
  setLang: (l: "tok" | "en") => void;
}

// ── AVATAR COLOURS (matches LoginScreen) ───────────────
const AVATAR_COLORS = [
  { bg: "#1B4332", accent: "#52B788" },
  { bg: "#1A3A5C", accent: "#60A5FA" },
  { bg: "#4A1A2C", accent: "#F9A8D4" },
  { bg: "#3B2800", accent: "#F5A623" },
  { bg: "#1A2C1A", accent: "#86EFAC" },
  { bg: "#2C1A3B", accent: "#C4B5FD" },
];

// ── INITIAL AVATAR ──────────────────────────────────────
function InitialAvatar({ name, avatarIdx, size = 96 }: { name: string; avatarIdx: number; size?: number }) {
  const c = AVATAR_COLORS[avatarIdx % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: c.bg, border: `3px solid ${c.accent}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 32px ${c.accent}44`, flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Baloo 2', cursive", fontWeight: 900,
        fontSize: size * 0.44, color: c.accent, lineHeight: 1, userSelect: "none",
      }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ── SVG ICONS ───────────────────────────────────────────
function IconFlame({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-2-1-4-2-5 0 2-1 3-2 3-1 0-2-1-2-2 0-2 1-4 1-4s-1 2-1 4c0 1.5 1 2.5 2 2.5S15 10.5 15 9c0-2-3-7-3-7z" fill="currentColor"/>
    </svg>
  );
}

function IconTutor({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="19" cy="6" r="3" fill="currentColor" opacity="0.5"/>
      <path d="M19 4v4M17 6h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconStar({ filled, color, size = 28 }: { filled: boolean; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.9 6.3 6.8.7-5 4.7 1.4 6.8L12 17.3l-6.1 3.2 1.4-6.8-5-4.7 6.8-.7z"
        fill={filled ? color : "none"}
        stroke={filled ? color : "rgba(255,255,255,0.18)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRocket({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 8 6 8 12l4 4 4-4c0-6-4-10-4-10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
      <path d="M8 12l-2 4 4-1M16 12l2 4-4-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  );
}

// ── TUTOR GREETING ──────────────────────────────────────
function getTutorGreeting(name: string, grade: number, lang: "tok" | "en", isNew: boolean) {
  if (isNew) return lang === "tok" ? `Welkam, ${name}! Mi happe tumas long mitim yu.` : `Welcome, ${name}! I am so happy to meet you.`;
  if (grade <= 2) return lang === "tok" ? `Welkam bek, ${name}! Yumi go lainim moa!` : `Welcome back, ${name}! Let's keep learning!`;
  if (grade <= 4) return lang === "tok" ? `Gutpela ${name}! Tude bai yumi lainim sampela samting nupela.` : `Great ${name}! Today we learn something new.`;
  return lang === "tok" ? `Welkam bek, ${name}. Yu bin wok hat. Tude bai yumi go moa.` : `Welcome back, ${name}. You've been working hard. Let's go further today.`;
}

// ── STAR PROGRESS (Grade 1–2) ───────────────────────────
function StarProgress({ pct, color }: { pct: number; color: string }) {
  const total = 5;
  const filled = Math.round((pct / 100) * total);
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          transform: i < filled ? "scale(1.15)" : "scale(0.9)",
          transition: `all 0.4s ease ${i * 0.1}s`,
        }}>
          <IconStar filled={i < filled} color={color} size={32} />
        </div>
      ))}
    </div>
  );
}

// ── PROGRESS PATH (Grade 3–4) ───────────────────────────
function ProgressPath({ pct }: { pct: number }) {
  const steps = 8;
  const reached = Math.round((pct / 100) * steps);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: steps }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: i < reached ? 16 : 12, height: i < reached ? 16 : 12,
            borderRadius: "50%",
            background: i < reached ? "linear-gradient(135deg, #F5A623, #FF6B35)" : i === reached ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.1)",
            border: i === reached ? "2px solid #F5A623" : "none",
            boxShadow: i < reached ? "0 0 8px rgba(245,166,35,0.5)" : "none",
            transition: `all 0.4s ease ${i * 0.08}s`, flexShrink: 0,
          }} />
          {i < steps - 1 && (
            <div style={{
              width: 20, height: 2,
              background: i < reached - 1 ? "linear-gradient(90deg, #F5A623, #FF6B35)" : "rgba(255,255,255,0.08)",
              borderRadius: 2, transition: `all 0.4s ease ${i * 0.08}s`,
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────
export default function ProfileScreen({ profile, onContinue, onBack, lang, setLang }: ProfileScreenProps) {
  const [visible, setVisible] = useState(false);
  const [avatarPop, setAvatarPop] = useState(false);

  const isLowGrade  = profile.grade <= 2;
  const isMidGrade  = profile.grade >= 3 && profile.grade <= 4;
  const isHighGrade = profile.grade >= 5;
  const isNew       = profile.lessonProgress === 0 && profile.streak === 0;
  const accentColor = AVATAR_COLORS[profile.avatarIdx % AVATAR_COLORS.length].accent;

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
    setTimeout(() => setAvatarPop(true), 300);
  }, []);

  const greeting = getTutorGreeting(profile.name, profile.grade, lang, isNew);

  return (
    <>
      <style>{`
        @keyframes profileFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes avatarPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes bilumItem { from{opacity:0;transform:scale(0) rotate(-20deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 24px 64px rgba(0,0,0,0.6),0 0 40px rgba(255,184,47,0.15)} 50%{box-shadow:0 24px 64px rgba(0,0,0,0.6),0 0 60px rgba(255,184,47,0.3)} }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        backgroundImage: "url('/ClasscodeScreen.png')",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 32,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
      }}>

        {/* Back button */}
        <button onClick={onBack} style={{
          position: "absolute", top: 24, left: 28,
          background: "rgba(13,27,38,0.75)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 50, padding: "8px 16px",
          color: "#F5E6D3", fontSize: 14, fontWeight: 800,
          fontFamily: "'Nunito', sans-serif", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          backdropFilter: "blur(8px)",
        }}>
          ← {lang === "tok" ? "Go Bek" : "Back"}
        </button>

        {/* Lang toggle */}
        <div style={{ position: "absolute", top: 24, right: 28, display: "flex", gap: 8 }}>
          {(["tok", "en"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? "linear-gradient(135deg, #FFB82F, #E84D2A)" : "rgba(13,27,38,0.75)",
              border: "none", borderRadius: 50, padding: "10px 22px",
              fontSize: 14, fontWeight: 800,
              color: lang === l ? "#fff" : "rgba(255,255,255,0.85)",
              cursor: "pointer", fontFamily: "'Nunito', sans-serif",
              backdropFilter: "blur(8px)",
            }}>
              {l === "tok" ? "Tok Pisin" : "English"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(42,16,4,0.88)",
          border: "2px solid rgba(255,184,47,0.3)",
          borderRadius: 32,
          padding: isLowGrade ? "44px 48px 60px" : "36px 48px 60px",
          width: "100%", maxWidth: isLowGrade ? 520 : 580,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: isLowGrade ? 28 : 22,
          backdropFilter: "blur(20px)",
          animation: "glowPulse 3s ease infinite",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,184,47,0.15)",
        }}>

          {/* Grade badge */}
          <div style={{
            position: "absolute", top: 20, left: 24,
            background: "rgba(255,184,47,0.15)",
            border: "1px solid rgba(255,184,47,0.4)",
            borderRadius: 20, padding: "4px 14px",
            fontSize: 11, fontWeight: 800,
            color: "#FFD96A",
            letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            Grade {profile.grade}
          </div>

          {/* Streak badge */}
          {profile.streak >= 1 && (
            <div style={{
              position: "absolute", top: 20, right: 24,
              background: "linear-gradient(135deg, #FF6B35, #F5A623)",
              borderRadius: 20, padding: "4px 12px",
              fontSize: 12, fontWeight: 900, color: "#1A0A00",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <IconFlame size={14} />
              {profile.streak} {lang === "tok" ? "de" : "day"}{profile.streak > 1 ? "s" : ""}
            </div>
          )}

          {/* Avatar */}
          <div style={{ animation: avatarPop ? "avatarPop 0.6s ease both" : "none" }}>
            <InitialAvatar name={profile.name} avatarIdx={profile.avatarIdx} size={isLowGrade ? 110 : 88} />
          </div>

          {/* Name */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: isLowGrade ? 48 : 36, fontWeight: 900,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              background: "linear-gradient(135deg, #F5A623, #FFD700)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", lineHeight: 1.2, marginBottom: 6,
            }}>
              {profile.name}
            </div>
            {!isLowGrade && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                {profile.placement || `Grade ${profile.grade} — AI Guided`}
              </div>
            )}
          </div>

          {/* Tutor message */}
          <div style={{
            background: "rgba(255,184,47,0.08)",
            border: "1px solid rgba(255,184,47,0.2)",
            borderRadius: "16px 16px 16px 4px",
            padding: "14px 20px", width: "100%",
            animation: "profileFadeUp 0.5s ease 0.2s both",
          }}>
            <div style={{
              fontSize: 11, color: "#FFB82F",
              fontWeight: 700, textTransform: "uppercase",
              letterSpacing: 1, marginBottom: 6,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <IconTutor size={13} />
              {lang === "tok" ? "Tutor bilong yu" : "Your Tutor"}
            </div>
            <div style={{ fontSize: isLowGrade ? 18 : 15, fontWeight: 700, color: "white", lineHeight: 1.5 }}>
              {greeting}
            </div>
          </div>

          {/* Progress */}
          <div style={{ width: "100%", animation: "profileFadeUp 0.5s ease 0.35s both" }}>
            {isLowGrade && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FFB82F", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
                  {lang === "tok" ? "Wok bilong yu" : "Your Progress"}
                </div>
                <StarProgress pct={profile.lessonProgress} color={accentColor} />
              </div>
            )}
            {isMidGrade && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FFB82F", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
                  {lang === "tok" ? "Rot bilong lainim" : "Learning Path"}
                </div>
                <ProgressPath pct={profile.lessonProgress} />
              </div>
            )}
            {isHighGrade && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {lang === "tok" ? "Progres" : "Progress"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#F5A623" }}>{profile.lessonProgress}%</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${profile.lessonProgress}%`, background: "linear-gradient(90deg, #F5A623, #FF6B35)", borderRadius: 8, transition: "width 1.2s ease", boxShadow: "0 0 12px rgba(245,166,35,0.5)" }} />
                </div>
              </div>
            )}
          </div>

          {/* Bilum collectibles — emoji kept intentionally as cultural collectibles */}
          {profile.bilumItems.length > 0 && (
            <div style={{ width: "100%", animation: "profileFadeUp 0.5s ease 0.45s both" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FFB82F", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, textAlign: "center" }}>
                {lang === "tok" ? "Bilum bilong yu" : "Your Bilum"}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {profile.bilumItems.map((item, i) => (
                  <div key={i} style={{
                    fontSize: isLowGrade ? 28 : 22,
                    background: "rgba(255,184,47,0.1)",
                    border: "1px solid rgba(255,184,47,0.25)",
                    borderRadius: "50%",
                    width: isLowGrade ? 50 : 40, height: isLowGrade ? 50 : 40,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: `bilumItem 0.4s ease ${0.5 + i * 0.07}s both`,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={onContinue}
            style={{
              width: "100%",
              padding: isLowGrade ? "20px" : "16px",
              background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 100%)",
              border: "none", borderRadius: 18,
              fontSize: isLowGrade ? 22 : 18,
              fontWeight: 900, color: "#1A0A00",
              cursor: "pointer", fontFamily: "'Baloo 2', cursive",
              boxShadow: "0 8px 32px rgba(245,166,35,0.4)",
              transition: "all 0.2s",
              animation: "profileFadeUp 0.5s ease 0.55s both",
              letterSpacing: 0.3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(245,166,35,0.55)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(245,166,35,0.4)";
            }}
          >
            {isNew ? (
              <><IconRocket size={isLowGrade ? 22 : 18} />{lang === "tok" ? "Stat Lainim!" : "Start Learning!"}</>
            ) : (
              <>{lang === "tok" ? "Go Go Go!" : "Continue Learning"}<IconArrow size={isLowGrade ? 22 : 18} /></>
            )}
          </button>

          {/* Tapa border */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, borderRadius: "0 0 30px 30px", overflow: "hidden" }}>
            <svg width="100%" height="40" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="tapa-profile" x="0" y="0" width="64" height="40" patternUnits="userSpaceOnUse">
                  <rect width="64" height="40" fill="#1C0900"/>
                  <rect x="0" y="0" width="64" height="4" fill="#F5E6D3" opacity="0.2"/>
                  <rect x="0" y="36" width="64" height="4" fill="#F5E6D3" opacity="0.2"/>
                  <polygon points="2,6 28,20 2,34" fill="#F5E6D3" opacity="0.15"/>
                  <polygon points="6,12 20,20 6,28" fill="#1C0900"/>
                  <polygon points="62,6 36,20 62,34" fill="#F5E6D3" opacity="0.15"/>
                  <polygon points="58,12 44,20 58,28" fill="#1C0900"/>
                  <polygon points="32,8 44,20 32,32 20,20" fill="#F5E6D3" opacity="0.1"/>
                  <polygon points="32,13 39,20 32,27 25,20" fill="#1C0900"/>
                </pattern>
              </defs>
              <rect width="100%" height="40" fill="url(#tapa-profile)"/>
            </svg>
          </div>

        </div>

        {/* Bottom hint */}
        <div style={{
          marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.55)",
          fontWeight: 600, letterSpacing: 0.3,
          animation: "profileFadeUp 0.5s ease 0.7s both",
        }}>
          {lang === "tok"
            ? "Ol narapela student i wet long yu — pinis kwik na givim PC long ol."
            : "Other students are waiting — finish up and pass the computer along."}
        </div>

      </div>
    </>
  );
}
