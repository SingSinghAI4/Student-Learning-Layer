import React, { useEffect, useState } from "react";
import { StudentProfile } from "./LoginScreen";

interface ProfileScreenProps {
  profile: StudentProfile;
  onContinue: () => void;
  lang: "tok" | "en";
}

const AVATARS = [
  { emoji: "🦜", name: "Bird of Paradise", tok: "Pisin Paradais" },
  { emoji: "🦘", name: "Cassowary", tok: "Muruk" },
  { emoji: "🐊", name: "Crocodile", tok: "Pukpuk" },
  { emoji: "🐢", name: "Turtle", tok: "Honu" },
  { emoji: "🦋", name: "Butterfly", tok: "Bataplai" },
  { emoji: "🐠", name: "Coral Fish", tok: "Pis Solwara" },
];

// Grade-appropriate tutor greeting
function getTutorGreeting(name: string, grade: number, lang: "tok" | "en", isNew: boolean) {
  if (isNew) {
    return lang === "tok"
      ? `Welkam, ${name}! Mi happe tumas long mitim yu.`
      : `Welcome, ${name}! I am so happy to meet you.`;
  }
  if (grade <= 2) {
    return lang === "tok"
      ? `Welkam bek, ${name}! Yumi go lainim moa!`
      : `Welcome back, ${name}! Let's keep learning!`;
  }
  if (grade <= 4) {
    return lang === "tok"
      ? `Gutpela ${name}! Yu kam bek. Tude bai yumi lainim sampela samting nupela.`
      : `Great ${name}! You came back. Today we learn something new.`;
  }
  return lang === "tok"
    ? `Welkam bek, ${name}. Yu bin wok hat. Tude bai yumi go moa.`
    : `Welcome back, ${name}. You have been working hard. Let's go further today.`;
}

// Star display for low grades — visual progress not percentage
function StarProgress({ pct }: { pct: number }) {
  const total = 5;
  const filled = Math.round((pct / 100) * total);
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            fontSize: 32,
            filter: i < filled ? "none" : "grayscale(1) opacity(0.25)",
            transform: i < filled ? "scale(1.1)" : "scale(0.9)",
            transition: `all 0.4s ease ${i * 0.1}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}

// Progress path for mid grades — dots journey
function ProgressPath({ pct }: { pct: number }) {
  const steps = 8;
  const reached = Math.round((pct / 100) * steps);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
      {Array.from({ length: steps }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: i < reached ? 16 : 12,
            height: i < reached ? 16 : 12,
            borderRadius: "50%",
            background: i < reached
              ? "linear-gradient(135deg, #F5A623, #FF6B35)"
              : i === reached
                ? "rgba(245,166,35,0.4)"
                : "rgba(255,255,255,0.1)",
            border: i === reached ? "2px solid #F5A623" : "none",
            boxShadow: i < reached ? "0 0 8px rgba(245,166,35,0.5)" : "none",
            transition: `all 0.4s ease ${i * 0.08}s`,
            flexShrink: 0,
          }} />
          {i < steps - 1 && (
            <div style={{
              width: 20, height: 2,
              background: i < reached - 1
                ? "linear-gradient(90deg, #F5A623, #FF6B35)"
                : "rgba(255,255,255,0.08)",
              borderRadius: 2,
              transition: `all 0.4s ease ${i * 0.08}s`,
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ProfileScreen({ profile, onContinue, lang }: ProfileScreenProps) {
  const [visible, setVisible] = useState(false);
  const [avatarPop, setAvatarPop] = useState(false);
  const av = AVATARS[profile.avatarIdx];
  const isLowGrade = profile.grade <= 2;
  const isMidGrade = profile.grade >= 3 && profile.grade <= 4;
  const isHighGrade = profile.grade >= 5;
  const isNew = profile.lessonProgress === 0 && profile.streak === 0;

  useEffect(() => {
    setTimeout(() => setVisible(true), 60);
    setTimeout(() => setAvatarPop(true), 300);
  }, []);

  const greeting = getTutorGreeting(profile.name, profile.grade, lang, isNew);

  return (
    <>
      <style>{`
        @keyframes profileFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes avatarPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bilumItem {
          from { opacity: 0; transform: scale(0) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 32px rgba(245,166,35,0.2); }
          50% { box-shadow: 0 0 64px rgba(245,166,35,0.45); }
        }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh",
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(40,110,18,0.4) 0%, transparent 60%), #0A1A07",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 32, gap: 0,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
      }}>

        {/* Card */}
        <div style={{
          background: "linear-gradient(155deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 32,
          padding: isLowGrade ? "44px 48px" : "36px 48px",
          width: "100%",
          maxWidth: isLowGrade ? 520 : 580,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: isLowGrade ? 28 : 22,
          backdropFilter: "blur(20px)",
          animation: "glowPulse 3s ease infinite",
          position: "relative",
        }}>

          {/* Grade badge */}
          <div style={{
            position: "absolute", top: 20, left: 24,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: "4px 14px",
            fontSize: 11, fontWeight: 800,
            color: "rgba(255,255,255,0.35)",
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
            }}>
              🔥 {profile.streak} {lang === "tok" ? "de" : "day"}{profile.streak > 1 ? "s" : ""}
            </div>
          )}

          {/* Avatar */}
          <div style={{
            fontSize: isLowGrade ? 100 : 80,
            lineHeight: 1,
            animation: avatarPop ? "avatarPop 0.6s ease both" : "none",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
          }}>
            {av.emoji}
          </div>

          {/* Name */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: isLowGrade ? 48 : 36,
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              background: "linear-gradient(135deg, #F5A623, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
              marginBottom: 6,
              filter: "drop-shadow(0 2px 12px rgba(245,166,35,0.4))",
            }}>
              {profile.name}
            </div>
            {!isLowGrade && (
              <div style={{
                fontSize: 13, color: "rgba(255,255,255,0.4)",
                fontWeight: 600, letterSpacing: 0.2,
              }}>
                {profile.placement || `Grade ${profile.grade} — AI Guided`}
              </div>
            )}
          </div>

          {/* Tutor message bubble */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px 16px 16px 4px",
            padding: "14px 20px",
            width: "100%",
            animation: "profileFadeUp 0.5s ease 0.2s both",
          }}>
            <div style={{
              fontSize: 12, color: "rgba(255,255,255,0.3)",
              fontWeight: 700, textTransform: "uppercase",
              letterSpacing: 1, marginBottom: 6,
            }}>
              🦜 {lang === "tok" ? "Tutor bilong yu" : "Your Tutor"}
            </div>
            <div style={{
              fontSize: isLowGrade ? 18 : 15,
              fontWeight: 700, color: "white", lineHeight: 1.5,
            }}>
              {greeting}
            </div>
          </div>

          {/* Progress — grade appropriate */}
          <div style={{ width: "100%", animation: "profileFadeUp 0.5s ease 0.35s both" }}>

            {/* G1–2: Stars */}
            {isLowGrade && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 11, fontWeight: 800,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase", letterSpacing: 1.5,
                  marginBottom: 14,
                }}>
                  {lang === "tok" ? "Wok bilong yu" : "Your Progress"}
                </div>
                <StarProgress pct={profile.lessonProgress} />
              </div>
            )}

            {/* G3–4: Path */}
            {isMidGrade && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 11, fontWeight: 800,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase", letterSpacing: 1.5,
                  marginBottom: 14,
                }}>
                  {lang === "tok" ? "Rot bilong lainim" : "Learning Path"}
                </div>
                <ProgressPath pct={profile.lessonProgress} />
              </div>
            )}

            {/* G5: Full bar + % */}
            {isHighGrade && (
              <div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {lang === "tok" ? "Progres" : "Progress"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#F5A623" }}>
                    {profile.lessonProgress}%
                  </span>
                </div>
                <div style={{
                  width: "100%", height: 8,
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 8, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${profile.lessonProgress}%`,
                    background: "linear-gradient(90deg, #F5A623, #FF6B35)",
                    borderRadius: 8,
                    transition: "width 1.2s ease",
                    boxShadow: "0 0 12px rgba(245,166,35,0.5)",
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Bilum collectibles */}
          {profile.bilumItems.length > 0 && (
            <div style={{ width: "100%", animation: "profileFadeUp 0.5s ease 0.45s both" }}>
              <div style={{
                fontSize: 11, fontWeight: 800,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase", letterSpacing: 1.5,
                marginBottom: 10, textAlign: "center",
              }}>
                {lang === "tok" ? "Bilum bilong yu" : "Your Bilum"}
              </div>
              <div style={{
                display: "flex", gap: 8,
                justifyContent: "center", flexWrap: "wrap",
              }}>
                {profile.bilumItems.map((item, i) => (
                  <div key={i} style={{
                    fontSize: isLowGrade ? 28 : 22,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    width: isLowGrade ? 50 : 40,
                    height: isLowGrade ? 50 : 40,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: `bilumItem 0.4s ease ${0.5 + i * 0.07}s both`,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onContinue}
            style={{
              width: "100%",
              padding: isLowGrade ? "20px" : "16px",
              background: "linear-gradient(135deg, #F5A623 0%, #FF6B35 100%)",
              border: "none", borderRadius: 18,
              fontSize: isLowGrade ? 22 : 18,
              fontWeight: 900, color: "#1A0A00",
              cursor: "pointer",
              fontFamily: "'Baloo 2', cursive",
              boxShadow: "0 8px 32px rgba(245,166,35,0.4)",
              transition: "all 0.2s",
              animation: "profileFadeUp 0.5s ease 0.55s both",
              letterSpacing: 0.3,
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
            {isNew
              ? (lang === "tok" ? "Stat Lainim! 🚀" : "Start Learning! 🚀")
              : (lang === "tok" ? "Go Go Go! ▶" : "Continue Learning ▶")
            }
          </button>

        </div>

        {/* Bottom hint */}
        <div style={{
          marginTop: 20,
          fontSize: 12, color: "rgba(255,255,255,0.18)",
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
