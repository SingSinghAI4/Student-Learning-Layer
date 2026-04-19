import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CompanionAvatar {
  id: string;
  name: string;
  nameTok: string;
  description: string;
  personality: string;
  image: string;
  accentColor: string;
}

export const COMPANIONS: CompanionAvatar[] = [
  {
    id: "bird",
    name: "Bird of Paradise",
    nameTok: "Pisin Paradais",
    description: "Energetic & curious. Loves stories and adventures.",
    personality: "enthusiastic",
    image: "/char-bird.png",
    accentColor: "#52B788",
  },
  {
    id: "girl",
    name: "Meri",
    nameTok: "Meri",
    description: "Cheerful & kind. Always ready to help a friend.",
    personality: "friendly",
    image: "/char-girl.png",
    accentColor: "#FFD93D",
  },
  {
    id: "teacher",
    name: "Teacher Ben",
    nameTok: "Tisa Ben",
    description: "Patient & wise. Explains everything clearly.",
    personality: "calm",
    image: "/char-teacher.png",
    accentColor: "#2E86AB",
  },
  {
    id: "boy-left",
    name: "Beni",
    nameTok: "Beni",
    description: "Brave & bold. Never backs down from a challenge.",
    personality: "confident",
    image: "/char-boy-left.png",
    accentColor: "#E84A4A",
  },
  {
    id: "boy-trophy",
    name: "Sione",
    nameTok: "Sione",
    description: "Champion mindset. Every lesson is a win waiting to happen.",
    personality: "competitive",
    image: "/char-boy-trophy.png",
    accentColor: "#B8860B",
  },
];

function CharacterImage({ src, accent, selected }: { src: string; accent: string; selected: boolean }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: selected
        ? `radial-gradient(circle at 50% 80%, ${accent}33 0%, transparent 70%)`
        : "transparent",
      transition: "background 0.3s",
    }}>
      <img
        src={src}
        alt=""
        style={{
          height: "100%", width: "100%",
          objectFit: "contain",
          filter: selected ? `drop-shadow(0 8px 24px ${accent}88)` : "none",
          transform: selected ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.25s ease, filter 0.25s ease",
        }}
      />
    </div>
  );
}

interface Props {
  onSelect: (avatar: CompanionAvatar) => void;
}

export default function AvatarPicker({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  function handleConfirm() {
    const avatar = COMPANIONS.find(c => c.id === selected);
    if (avatar) onSelect(avatar);
  }

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(34,95,15,0.45) 0%, transparent 60%), #091507",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      paddingBottom: 100,
      padding: "40px 24px 100px", fontFamily: "'Nunito', sans-serif",
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 2,
          color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12,
        }}>
          Choose Your Learning Companion
        </div>
        <h1 style={{
          fontFamily: "'Baloo 2', cursive", fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1.2,
        }}>
          Who will guide you?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginTop: 10, fontWeight: 600 }}>
          Your companion stays with you the whole chapter
        </p>
      </motion.div>

      {/* Avatar grid — 3 top row + 2 centred bottom row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20, maxWidth: 860, width: "100%",
        marginBottom: 40,
      }}>
        {COMPANIONS.map((c, i) => {
          const isSelected = selected === c.id;
          const isHovered = hovered === c.id;
          // 4th card starts at col 1 (centre), 5th at col 2 — centres the bottom pair
          const gridColumn = i === 3 ? "1 / 2" : i === 4 ? "2 / 3" : undefined;
          // Centre the bottom row by offsetting it half a column
          const gridColumnStart = i === 3 ? 1 : i === 4 ? 2 : undefined;
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isSelected
                  ? `linear-gradient(160deg, ${c.accentColor}22, ${c.accentColor}0a)`
                  : "rgba(255,255,255,0.04)",
                border: `2px solid ${isSelected ? c.accentColor : isHovered ? c.accentColor + "66" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 24, padding: 0, cursor: "pointer",
                overflow: "hidden", position: "relative",
                boxShadow: isSelected ? `0 0 32px ${c.accentColor}44, 0 0 60px ${c.accentColor}18` : "none",
                transition: "all 0.25s ease",
                textAlign: "left",
                gridColumn,
              }}
            >
              {/* Character image */}
              <div style={{ width: "100%", height: 200, position: "relative" }}>
                <CharacterImage src={c.image} accent={c.accentColor} selected={isSelected} />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      width: 28, height: 28, borderRadius: "50%",
                      background: c.accentColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: "#000", fontWeight: 900,
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800,
                    color: isSelected ? c.accentColor : "#fff",
                    transition: "color 0.2s",
                  }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                    {c.nameTok}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                  {c.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Confirm button — sticky at bottom */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed", bottom: 80, left: 0, right: 0,
              display: "flex", justifyContent: "center",
              zIndex: 50,
            }}
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleConfirm}
              style={{
                background: `linear-gradient(135deg, ${COMPANIONS.find(c => c.id === selected)!.accentColor}, #FFD93D)`,
                border: "none", borderRadius: 18,
                padding: "18px 80px", fontSize: 18, fontWeight: 900,
                color: "#0A1A07", fontFamily: "'Baloo 2', cursive",
                cursor: "pointer", letterSpacing: 0.4,
                boxShadow: `0 8px 32px ${COMPANIONS.find(c => c.id === selected)!.accentColor}66`,
              }}
            >
              Let's Go! →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
