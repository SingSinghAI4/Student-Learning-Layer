import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { StudentProfile } from "../LoginScreen";
import { SUBJECTS, CHAPTERS, SubjectId } from "../data";

interface Props {
  profile: StudentProfile;
  subjectId: SubjectId;
  onSelect: (chapterId: number) => void;
  onBack: () => void;
}

// ── SUBJECT BADGE ICONS ───────────────────────────────
function SubjectBadgeIcon({ id, color }: { id: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    english: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <rect x="4" y="5" width="24" height="22" rx="3" stroke={color} strokeWidth="2.2"/>
        <rect x="4" y="5" width="12" height="22" rx="3" fill={color} opacity="0.12"/>
        <line x1="16" y1="5" x2="16" y2="27" stroke={color} strokeWidth="1.5" opacity="0.4"/>
        <rect x="6" y="11" width="8" height="2" rx="1" fill={color} opacity="0.7"/>
        <rect x="6" y="15" width="6" height="2" rx="1" fill={color} opacity="0.5"/>
        <rect x="18" y="11" width="8" height="2" rx="1" fill={color} opacity="0.7"/>
        <rect x="18" y="15" width="6" height="2" rx="1" fill={color} opacity="0.5"/>
      </svg>
    ),
    maths: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke={color} strokeWidth="2.2"/>
        <line x1="16" y1="4" x2="16" y2="28" stroke={color} strokeWidth="1.5" opacity="0.3"/>
        <line x1="4" y1="16" x2="28" y2="16" stroke={color} strokeWidth="1.5" opacity="0.3"/>
        <line x1="9" y1="11" x2="13" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="11" y1="9" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="11" x2="23" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="20" x2="13" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="24" x2="13" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="20" x2="23" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    science: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M12 5 L12 16 L5 25 Q3 29 7 29 L25 29 Q29 29 27 25 L20 16 L20 5 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
        <line x1="12" y1="5" x2="20" y2="5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
        <ellipse cx="16" cy="24" rx="7" ry="4" fill={color} opacity="0.25"/>
        <circle cx="10" cy="23" r="2" fill={color} opacity="0.6"/>
        <circle cx="20" cy="21" r="1.5" fill={color} opacity="0.5"/>
      </svg>
    ),
    social: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <polygon points="16,4 27,13 27,28 5,28 5,13" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
        <rect x="13" y="20" width="6" height="8" rx="1.5" stroke={color} strokeWidth="1.8"/>
        <rect x="7" y="16" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.8"/>
        <rect x="20" y="16" width="5" height="5" rx="1.5" stroke={color} strokeWidth="1.8"/>
        <polygon points="10,14 16,8 22,14" fill={color} opacity="0.3"/>
      </svg>
    ),
    arts: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M16 4C9 4 4 9 4 16c0 4 2 7.5 5 9.5 1.5 1 3-0.5 3-2v-2c0-2 1.5-3.5 3.5-3.5H18c6 0 10-4 10-9.5 0-2-1-7-12-4z" stroke={color} strokeWidth="2.2"/>
        <circle cx="9" cy="14" r="2.5" fill={color} opacity="0.8"/>
        <circle cx="13" cy="8" r="2.5" fill="#FFD93D" opacity="0.9"/>
        <circle cx="20" cy="7" r="2.5" fill="#2ECC71" opacity="0.9"/>
        <circle cx="26" cy="13" r="2.5" fill="#3498DB" opacity="0.9"/>
      </svg>
    ),
    health: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M16 28 L5 17 C0 12 0 5 6 3 Q10 1 16 9 Q22 1 26 3 C32 5 32 12 27 17 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
        <polyline points="7,18 10,18 12,13 14,23 16,16 18,20 20,18 25,18" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    tokpisin: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <rect x="3" y="4" width="22" height="17" rx="5" stroke={color} strokeWidth="2.2"/>
        <path d="M8 21 L5 28 L14 21" fill={color} opacity="0.4"/>
        <rect x="7" y="10" width="14" height="2" rx="1" fill={color} opacity="0.8"/>
        <rect x="7" y="14" width="10" height="2" rx="1" fill={color} opacity="0.5"/>
        <circle cx="24" cy="22" r="5" stroke={color} strokeWidth="1.8"/>
        <circle cx="24" cy="22" r="2" fill={color} opacity="0.5"/>
      </svg>
    ),
    values: (
      <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
        <path d="M16 4 L19 12 L28 12 L21 18 L24 26 L16 21 L8 26 L11 18 L4 12 L13 12 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
        <path d="M12 17 L15 20 L21 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return <>{icons[id] ?? null}</>;
}

// ── CHAPTER ICONS ─────────────────────────────────────
function ChapterIcon({ subjectId, chId, color }: { subjectId: SubjectId; chId: number; color: string }) {
  const s = color; // subject accent color for fills
  const icons: Record<SubjectId, Record<number, React.ReactNode>> = {
    english: {
      1: <svg viewBox="0 0 56 56" fill="none"><rect x="8" y="10" width="40" height="36" rx="5" stroke={s} strokeWidth="2.5"/><text x="28" y="32" textAnchor="middle" fontSize="20" fontWeight="900" fill={s} fontFamily="Nunito">Aa</text><rect x="14" y="38" width="28" height="2.5" rx="1.25" fill={s} opacity="0.4"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><rect x="8" y="12" width="40" height="30" rx="5" stroke={s} strokeWidth="2.5"/><path d="M24 12 L24 42" stroke={s} strokeWidth="2" opacity="0.4"/><rect x="12" y="22" width="8" height="2.5" rx="1.25" fill={s}/><rect x="12" y="29" width="8" height="2.5" rx="1.25" fill={s} opacity="0.6"/><circle cx="40" cy="38" r="7" fill={s} opacity="0.15" stroke={s} strokeWidth="2"/><text x="40" y="42" textAnchor="middle" fontSize="10" fontWeight="900" fill={s}>🥭</text></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><path d="M10 38 Q28 14 46 38" stroke={s} strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="16" cy="34" r="4" fill={s} opacity="0.7"/><circle cx="28" cy="22" r="4" fill={s} opacity="0.7"/><circle cx="40" cy="34" r="4" fill={s} opacity="0.7"/><rect x="10" y="42" width="36" height="3" rx="1.5" fill={s} opacity="0.3"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="22" r="10" stroke={s} strokeWidth="2.5"/><circle cx="15" cy="38" r="8" stroke={s} strokeWidth="2"/><circle cx="41" cy="38" r="8" stroke={s} strokeWidth="2"/><line x1="20" y1="30" x2="23" y2="32" stroke={s} strokeWidth="2"/><line x1="36" y1="30" x2="33" y2="32" stroke={s} strokeWidth="2"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><rect x="10" y="14" width="36" height="28" rx="4" stroke={s} strokeWidth="2.5"/><rect x="14" y="20" width="16" height="3" rx="1.5" fill={s}/><rect x="14" y="26" width="22" height="3" rx="1.5" fill={s} opacity="0.6"/><rect x="14" y="32" width="18" height="3" rx="1.5" fill={s} opacity="0.4"/><circle cx="40" cy="36" r="5" fill={s} opacity="0.2" stroke={s} strokeWidth="1.5"/><path d="M38 36 L40 38 L43 33" stroke={s} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><rect x="12" y="8" width="32" height="40" rx="4" stroke={s} strokeWidth="2.5"/><line x1="18" y1="18" x2="38" y2="18" stroke={s} strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="24" x2="38" y2="24" stroke={s} strokeWidth="2" opacity="0.6"/><line x1="18" y1="30" x2="30" y2="30" stroke={s} strokeWidth="2" opacity="0.4"/><path d="M34 36 L40 30 L44 34 L38 40 L34 36Z" fill={s} opacity="0.7"/></svg>,
    },
    maths: {
      1: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="18" stroke={s} strokeWidth="2.5"/><text x="28" y="34" textAnchor="middle" fontSize="20" fontWeight="900" fill={s} fontFamily="Nunito">1</text></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><circle cx="14" cy="36" r="5" fill={s}/><circle cx="26" cy="36" r="5" fill={s}/><text x="36" y="24" textAnchor="middle" fontSize="20" fontWeight="900" fill={s}>+</text><circle cx="36" cy="36" r="5" fill={s} opacity="0.5"/><circle cx="46" cy="36" r="5" fill={s} opacity="0.5"/><circle cx="36" cy="46" r="5" fill={s} opacity="0.5"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><circle cx="14" cy="28" r="5" fill={s}/><circle cx="26" cy="28" r="5" fill={s}/><circle cx="38" cy="28" r="5" fill={s}/><circle cx="50" cy="28" r="5" fill={s}/><line x1="6" y1="18" x2="50" y2="38" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round"/><text x="28" y="50" textAnchor="middle" fontSize="13" fontWeight="900" fill={s}>−3</text></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><circle cx="15" cy="22" r="8" stroke={s} strokeWidth="2.5"/><rect x="28" y="14" width="16" height="16" rx="2" stroke={s} strokeWidth="2.5"/><polygon points="28,44 36,30 44,44" stroke={s} strokeWidth="2.5" strokeLinejoin="round" fill="none"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><rect x="8" y="36" width="40" height="5" rx="2.5" fill={s}/><rect x="16" y="26" width="3" height="10" fill={s} opacity="0.7"/><rect x="28" y="20" width="3" height="16" fill={s}/><rect x="40" y="30" width="3" height="6" fill={s} opacity="0.5"/><rect x="8" y="14" width="40" height="3" rx="1.5" fill={s} opacity="0.3"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="18" stroke={s} strokeWidth="2.5"/><circle cx="28" cy="28" r="12" stroke={s} strokeWidth="1.5" opacity="0.4"/><text x="28" y="33" textAnchor="middle" fontSize="14" fontWeight="900" fill={s} fontFamily="Nunito">K1</text></svg>,
    },
    science: {
      1: <svg viewBox="0 0 56 56" fill="none"><path d="M28 10 Q36 16 36 24 Q36 32 28 36 Q20 32 20 24 Q20 16 28 10Z" stroke={s} strokeWidth="2.5" fill="none"/><path d="M10 38 Q18 30 28 36 Q38 30 46 38" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="28" cy="42" r="3" fill={s}/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><path d="M28 44 Q18 38 18 28 Q18 18 28 10 Q38 18 38 28 Q38 38 28 44Z" stroke={s} strokeWidth="2.5" fill="none"/><path d="M20 26 Q28 20 36 26" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="28" y1="10" x2="28" y2="44" stroke={s} strokeWidth="1.5" opacity="0.4"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><ellipse cx="28" cy="24" rx="12" ry="14" stroke={s} strokeWidth="2.5"/><line x1="18" y1="28" x2="14" y2="44" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="38" y1="28" x2="42" y2="44" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><ellipse cx="28" cy="24" rx="5" ry="7" stroke={s} strokeWidth="1.5" opacity="0.4"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="20" r="10" stroke={s} strokeWidth="2.5"/>{[0,60,120,180,240,300].map(a=>{const r=a*Math.PI/180;return<line key={a} x1={28+Math.cos(r)*12} y1={20+Math.sin(r)*12} x2={28+Math.cos(r)*18} y2={20+Math.sin(r)*18} stroke={s} strokeWidth="2" strokeLinecap="round"/>})}<path d="M14 38 Q20 30 28 36 Q36 30 42 38" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><path d="M8 36 Q20 20 28 30 Q36 40 48 20" stroke={s} strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="16" cy="44" r="5" stroke={s} strokeWidth="2"/><path d="M14 42 L16 44 L19 40" stroke={s} strokeWidth="1.5" strokeLinecap="round"/><circle cx="40" cy="44" r="5" stroke={s} strokeWidth="2"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="24" rx="14" ry="14" stroke={s} strokeWidth="2.5"/><path d="M20 36 L14 46 M36 36 L42 46" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><path d="M18 24 Q28 16 38 24" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="24" cy="26" r="2" fill={s}/><circle cx="32" cy="26" r="2" fill={s}/></svg>,
    },
    social: {
      1: <svg viewBox="0 0 56 56" fill="none"><polygon points="28,8 46,24 46,48 10,48 10,24" stroke={s} strokeWidth="2.5" fill="none" strokeLinejoin="round"/><rect x="22" y="34" width="12" height="14" rx="2" stroke={s} strokeWidth="2"/><rect x="14" y="28" width="9" height="9" rx="2" stroke={s} strokeWidth="2"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><path d="M10 28 Q14 10 28 8 Q42 10 46 28 Q42 46 28 48 Q14 46 10 28Z" stroke={s} strokeWidth="2.5" fill="none"/><circle cx="28" cy="28" r="3" fill={s}/><line x1="28" y1="8" x2="28" y2="48" stroke={s} strokeWidth="1.5" opacity="0.4"/><line x1="10" y1="28" x2="46" y2="28" stroke={s} strokeWidth="1.5" opacity="0.4"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="16" r="8" stroke={s} strokeWidth="2.5"/><circle cx="14" cy="34" r="6" stroke={s} strokeWidth="2"/><circle cx="42" cy="34" r="6" stroke={s} strokeWidth="2"/><line x1="20" y1="24" x2="22" y2="28" stroke={s} strokeWidth="2" strokeLinecap="round"/><line x1="36" y1="24" x2="34" y2="28" stroke={s} strokeWidth="2" strokeLinecap="round"/><path d="M14 44 L14 48 M42 44 L42 48 M28 24 L28 36" stroke={s} strokeWidth="2" strokeLinecap="round"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><rect x="10" y="24" width="36" height="22" rx="3" stroke={s} strokeWidth="2.5"/><path d="M18 24 L18 18 Q18 10 28 10 Q38 10 38 18 L38 24" stroke={s} strokeWidth="2.5" fill="none"/><circle cx="28" cy="35" r="5" stroke={s} strokeWidth="2"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><path d="M12 44 Q12 24 28 14 Q44 24 44 44" stroke={s} strokeWidth="2.5" fill="none"/><path d="M18 44 Q22 30 28 24 Q34 30 38 44" stroke={s} strokeWidth="2" fill="none" opacity="0.6"/><rect x="22" y="38" width="12" height="6" rx="2" fill={s} opacity="0.4"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><path d="M14 40 Q14 24 22 16 Q28 10 34 16 Q42 24 42 40" stroke={s} strokeWidth="2.5" fill="none"/><rect x="10" y="40" width="36" height="5" rx="2.5" fill={s} opacity="0.5"/><path d="M20 30 Q28 22 36 30" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="28" cy="36" r="4" fill={s} opacity="0.7"/></svg>,
    },
    arts: {
      1: <svg viewBox="0 0 56 56" fill="none"><circle cx="16" cy="28" r="7" stroke="#E74C3C" strokeWidth="2.5"/><circle cx="28" cy="16" r="7" stroke="#3498DB" strokeWidth="2.5"/><circle cx="40" cy="28" r="7" stroke="#FFD93D" strokeWidth="2.5"/><circle cx="28" cy="40" r="7" stroke="#2ECC71" strokeWidth="2.5"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><rect x="12" y="10" width="32" height="36" rx="3" stroke={s} strokeWidth="2.5"/><path d="M22 30 L28 14 L34 30" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M38 10 L46 6 L44 18 L38 14Z" fill={s} opacity="0.7"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><path d="M12 20 Q12 36 28 44 Q44 36 44 20 Q44 8 28 8 Q12 8 12 20Z" stroke={s} strokeWidth="2.5" fill="none"/>{[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180;return<line key={a} x1={28+Math.cos(r)*8} y1={28+Math.sin(r)*8} x2={28+Math.cos(r)*16} y2={28+Math.sin(r)*16} stroke={s} strokeWidth="1.5" opacity={0.4+i*0.07}/>})}<circle cx="28" cy="28" r="5" fill={s} opacity="0.6"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><path d="M28 10 Q28 28 20 38 Q28 42 36 38 Q28 28 28 10Z" stroke={s} strokeWidth="2.5" fill="none"/><circle cx="28" cy="10" r="3" fill={s}/><path d="M16 28 Q22 24 28 28 Q34 24 40 28" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M20 38 Q28 48 36 38" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><ellipse cx="22" cy="28" rx="12" ry="16" stroke={s} strokeWidth="2.5"/><ellipse cx="38" cy="28" rx="8" ry="12" stroke={s} strokeWidth="2"/><circle cx="22" cy="24" r="2.5" fill={s}/><circle cx="38" cy="24" r="2.5" fill={s}/><path d="M16 32 Q22 38 28 32" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M32 32 Q38 36 44 32" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><path d="M16 40 Q16 22 28 14 Q40 22 40 40" stroke={s} strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M22 36 Q28 28 34 36" stroke={s} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="28" y1="44" x2="28" y2="48" stroke={s} strokeWidth="3" strokeLinecap="round"/><rect x="22" y="44" width="12" height="4" rx="2" fill={s} opacity="0.5"/></svg>,
    },
    health: {
      1: <svg viewBox="0 0 56 56" fill="none"><path d="M28 14 Q20 20 16 30 Q20 44 28 46 Q36 44 40 30 Q36 20 28 14Z" stroke={s} strokeWidth="2.5" fill="none"/><circle cx="28" cy="32" r="6" stroke={s} strokeWidth="2"/><path d="M22 20 Q28 16 34 20" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><circle cx="18" cy="30" r="9" stroke="#E74C3C" strokeWidth="2.5"/><ellipse cx="36" cy="26" rx="8" ry="10" stroke="#FFD93D" strokeWidth="2.5"/><ellipse cx="44" cy="36" rx="6" ry="8" stroke="#2ECC71" strokeWidth="2.5"/><line x1="10" y1="44" x2="50" y2="44" stroke={s} strokeWidth="2" opacity="0.4"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><path d="M28 10 L28 10 Q44 10 44 28 Q44 46 28 46 Q12 46 12 28 Q12 10 28 10Z" stroke={s} strokeWidth="2.5" fill="none"/><path d="M22 28 L26 32 L34 22" stroke={s} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="14" r="6" stroke={s} strokeWidth="2.5"/><line x1="28" y1="20" x2="28" y2="36" stroke={s} strokeWidth="3" strokeLinecap="round"/><line x1="16" y1="26" x2="40" y2="26" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="28" y1="36" x2="18" y2="48" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="28" y1="36" x2="38" y2="48" stroke={s} strokeWidth="2.5" strokeLinecap="round"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><path d="M28 44 L10 26 C4 20 4 10 12 8 Q18 6 28 18 Q38 6 44 8 C52 10 52 20 46 26Z" stroke={s} strokeWidth="2.5" fill="none"/><polyline points="14,28 20,28 23,20 27,36 30,24 33,30 36,28 42,28" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="24" r="14" stroke={s} strokeWidth="2.5"/><path d="M22 24 Q28 32 34 24" stroke={s} strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="22" cy="20" r="2.5" fill={s}/><circle cx="34" cy="20" r="2.5" fill={s}/><line x1="28" y1="38" x2="28" y2="46" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="20" y1="46" x2="36" y2="46" stroke={s} strokeWidth="2.5" strokeLinecap="round"/></svg>,
    },
    tokpisin: {
      1: <svg viewBox="0 0 56 56" fill="none"><path d="M28 10 Q44 10 44 22 Q44 34 28 34 Q22 34 16 30 L10 36 L12 26 Q8 22 8 18 Q8 10 28 10Z" stroke={s} strokeWidth="2.5" fill="none"/><line x1="18" y1="20" x2="38" y2="20" stroke={s} strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="26" x2="32" y2="26" stroke={s} strokeWidth="2" strokeLinecap="round"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><ellipse cx="20" cy="26" rx="12" ry="16" stroke={s} strokeWidth="2.5"/><circle cx="20" cy="20" r="3" fill={s}/><circle cx="20" cy="26" r="3" fill={s}/><circle cx="20" cy="32" r="3" fill={s}/><path d="M32 18 Q44 14 46 22 Q48 30 38 30 Q34 30 32 34 L30 44 L36 34 Q40 34 44 30 Q50 24 46 16 Q42 8 32 12Z" stroke={s} strokeWidth="2" fill="none"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><rect x="10" y="10" width="36" height="28" rx="5" stroke={s} strokeWidth="2.5"/><line x1="10" y1="22" x2="46" y2="22" stroke={s} strokeWidth="1.5" opacity="0.4"/><rect x="16" y="16" width="6" height="3" rx="1.5" fill={s}/><rect x="16" y="27" width="24" height="2.5" rx="1.25" fill={s} opacity="0.7"/><rect x="16" y="32" width="18" height="2.5" rx="1.25" fill={s} opacity="0.5"/><path d="M20 38 L16 48 L28 38" fill={s} opacity="0.4"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><path d="M28 10 Q28 24 20 32" stroke={s} strokeWidth="3" strokeLinecap="round"/><path d="M28 10 Q28 24 36 32" stroke={s} strokeWidth="3" strokeLinecap="round"/><circle cx="28" cy="10" r="4" fill={s}/><path d="M14 36 Q28 28 42 36" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M18 42 Q28 36 38 42" stroke={s} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><path d="M16 10 L16 40 L20 36 L24 40 L24 10" stroke={s} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="28" y1="16" x2="44" y2="16" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="28" y1="24" x2="44" y2="24" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.7"/><line x1="28" y1="32" x2="40" y2="32" stroke={s} strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><rect x="8" y="12" width="24" height="20" rx="5" stroke={s} strokeWidth="2"/><path d="M14 32 L10 42" stroke={s} strokeWidth="2" strokeLinecap="round"/><rect x="28" y="24" width="20" height="18" rx="5" stroke={s} strokeWidth="2"/><path d="M38 42 L42 48" stroke={s} strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="20" x2="26" y2="20" stroke={s} strokeWidth="1.5" strokeLinecap="round"/><line x1="34" y1="30" x2="42" y2="30" stroke={s} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    values: {
      1: <svg viewBox="0 0 56 56" fill="none"><path d="M28 44 L14 32 Q8 24 14 16 Q20 10 28 20 Q36 10 42 16 Q48 24 42 32Z" stroke={s} strokeWidth="2.5" fill="none"/><path d="M22 30 L26 34 L34 24" stroke={s} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      2: <svg viewBox="0 0 56 56" fill="none"><circle cx="14" cy="22" r="7" stroke={s} strokeWidth="2.5"/><circle cx="28" cy="16" r="7" stroke={s} strokeWidth="2.5"/><circle cx="42" cy="22" r="7" stroke={s} strokeWidth="2.5"/><line x1="20" y1="28" x2="28" y2="22" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><line x1="36" y1="28" x2="28" y2="22" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><rect x="8" y="36" width="12" height="12" rx="6" stroke={s} strokeWidth="2"/><rect x="22" y="32" width="12" height="12" rx="6" stroke={s} strokeWidth="2"/><rect x="36" y="36" width="12" height="12" rx="6" stroke={s} strokeWidth="2"/></svg>,
      3: <svg viewBox="0 0 56 56" fill="none"><path d="M28 8 L34 22 L48 22 L36 32 L40 46 L28 38 L16 46 L20 32 L8 22 L22 22Z" stroke={s} strokeWidth="2.5" fill="none" strokeLinejoin="round"/><line x1="22" y1="28" x2="34" y2="28" stroke="#E74C3C" strokeWidth="3" strokeLinecap="round"/></svg>,
      4: <svg viewBox="0 0 56 56" fill="none"><line x1="28" y1="10" x2="28" y2="46" stroke={s} strokeWidth="2.5" strokeLinecap="round"/><path d="M28 20 L10 30 L10 44 L28 34Z" stroke={s} strokeWidth="2" fill="none" strokeLinejoin="round"/><path d="M28 20 L46 30 L46 44 L28 34Z" stroke={s} strokeWidth="2" fill="none" strokeLinejoin="round"/><circle cx="28" cy="14" r="4" fill={s}/></svg>,
      5: <svg viewBox="0 0 56 56" fill="none"><path d="M28 8 L32 20 L46 20 L34 28 L38 42 L28 34 L18 42 L22 28 L10 20 L24 20Z" stroke={s} strokeWidth="2.5" fill="none" strokeLinejoin="round"/><circle cx="28" cy="24" r="5" fill={s} opacity="0.5"/></svg>,
      6: <svg viewBox="0 0 56 56" fill="none"><ellipse cx="18" cy="30" rx="9" ry="11" stroke="#2ECC71" strokeWidth="2.5"/><ellipse cx="38" cy="24" rx="8" ry="10" stroke="#3498DB" strokeWidth="2.5"/><path d="M14 46 Q14 36 18 30" stroke="#2ECC71" strokeWidth="2"/><path d="M34 42 Q34 32 38 24" stroke="#3498DB" strokeWidth="2"/><line x1="10" y1="46" x2="46" y2="46" stroke={s} strokeWidth="2" opacity="0.5"/></svg>,
    },
  };

  const icon = icons[subjectId]?.[chId];
  return (
    <svg viewBox="0 0 56 56" fill="none" width="56" height="56" style={{ display: "block" }}>
      {icon}
    </svg>
  );
}

export default function ChapterScreen({ profile, subjectId, onSelect, onBack }: Props) {
  const subject  = SUBJECTS.find(s => s.id === subjectId)!;
  const chapters = CHAPTERS[subjectId];

  // First unlocked chapter with no stars = "current"
  const currentId = chapters.find(c => c.unlocked && c.stars === 0)?.id ?? null;

  return (
    <div className="screen chap-screen" style={{
      "--sc": subject.color, "--sh": subject.shadow,
      ...(subjectId === "maths" && {
        backgroundImage: "url('/MathsScreen.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }),
    } as React.CSSProperties}>

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
            <span className="csb-icon"><SubjectBadgeIcon id={subjectId} color={subject.color} /></span>
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
                  <ChapterIcon subjectId={subjectId} chId={ch.id} color={subject.color} />
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
                      <Star size={13} fill={ch.stars >= n ? "#FFD93D" : "none"} stroke={ch.stars >= n ? "#FFD93D" : "#666"} />
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
