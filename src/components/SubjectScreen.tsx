import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";
import { StudentProfile } from "../LoginScreen";
import { SUBJECTS, SubjectId } from "../data";

interface Props {
  profile: StudentProfile;
  onSelect: (id: SubjectId) => void;
}

// ── SUBJECT METADATA ───────────────────────────────────
const SUBJECT_META: Record<string, { topics: string[]; fun: string }> = {
  english:  { topics: ["Reading", "Phonics", "Writing"], fun: "Learn to read & write stories!" },
  maths:    { topics: ["Counting", "Adding", "Shapes"],  fun: "Numbers are everywhere in PNG!" },
  science:  { topics: ["Animals", "Plants", "Weather"],  fun: "Discover nature around you!" },
  social:   { topics: ["Community", "PNG Map", "Culture"], fun: "Explore Papua New Guinea!" },
  arts:     { topics: ["Drawing", "Music", "Craft"],     fun: "Create & express yourself!" },
  health:   { topics: ["Hygiene", "Food", "Safety"],     fun: "Stay strong & healthy!" },
  tokpisin: { topics: ["Harim", "Toktok", "Stori"],      fun: "Toktok gut long Tok Pisin!" },
  values:   { topics: ["Respect", "Teamwork", "No Violence"], fun: "Be a leader like David Mead!" },
};

// ── FLAT ILLUSTRATED ICONS ─────────────────────────────
function SubjectIllustration({ id, animate }: { id: string; animate: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    english: (
      <svg viewBox="0 0 80 80" fill="none">
        <rect x="12" y="14" width="56" height="38" rx="4" fill="#2D5016"/>
        <rect x="12" y="14" width="56" height="38" rx="4" stroke="#1a3a0a" strokeWidth="2"/>
        <rect x="16" y="52" width="48" height="4" rx="2" fill="#8B6914"/>
        <path d="M30 60 L26 70 M50 60 L54 70" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
        <text x="40" y="40" textAnchor="middle" fontSize="20" fontWeight="900" fill="#FFD93D" fontFamily="monospace">ABC</text>
        <rect x="34" y="44" width="12" height="2" rx="1" fill="#FFD93D" opacity="0.6"/>
      </svg>
    ),
    maths: (
      <svg viewBox="0 0 80 80" fill="none">
        <rect x="16" y="10" width="48" height="60" rx="8" fill="#C0392B"/>
        <rect x="22" y="16" width="36" height="16" rx="4" fill="#ECF0F1"/>
        <text x="40" y="28" textAnchor="middle" fontSize="12" fontWeight="900" fill="#2C3E50" fontFamily="monospace">123</text>
        {[0,1,2,3].map(col => [0,1,2].map(row => (
          <rect key={`${col}-${row}`} x={22+col*10} y={36+row*10} width="8" height="8" rx="2"
            fill={col===3&&row===2 ? "#F39C12" : "#5D6D7E"}/>
        )))}
      </svg>
    ),
    science: (
      <svg viewBox="0 0 80 80" fill="none">
        <path d="M32 12 L32 34 L14 58 Q11 65 18 65 L62 65 Q69 65 66 58 L48 34 L48 12 Z" fill="#3498DB"/>
        <path d="M20 58 Q25 50 40 52 Q55 54 62 48 L66 58 Q69 65 62 65 L18 65 Q11 65 14 58 Z" fill="#E74C3C" opacity="0.85"/>
        <line x1="32" y1="12" x2="48" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="28" cy="56" r="3" fill="white" opacity="0.7"/>
        <circle cx="50" cy="53" r="2" fill="white" opacity="0.5"/>
        <circle cx="38" cy="48" r="4" fill="white" opacity="0.4"/>
        <line x1="28" y1="34" x2="52" y2="34" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
      </svg>
    ),
    social: (
      <svg viewBox="0 0 80 80" fill="none">
        <polygon points="40,12 62,32 62,65 18,65 18,32" fill="#E67E22"/>
        <polygon points="40,12 66,34 14,34" fill="#D35400"/>
        <rect x="33" y="46" width="14" height="19" rx="2" fill="#8B4513"/>
        <rect x="22" y="40" width="10" height="10" rx="2" fill="#87CEEB"/>
        <rect x="48" y="40" width="10" height="10" rx="2" fill="#87CEEB"/>
        <polygon points="12,40 24,30 24,55 0,55 0,40" fill="#27AE60" opacity="0.85"/>
        <polygon points="12,30 26,41 -2,41" fill="#1E8449" opacity="0.85"/>
        <polygon points="68,40 56,30 56,55 80,55 80,40" fill="#9B59B6" opacity="0.85"/>
        <polygon points="68,30 54,41 82,41" fill="#7D3C98" opacity="0.85"/>
      </svg>
    ),
    arts: (
      <svg viewBox="0 0 80 80" fill="none">
        <path d="M40 8C22 8 8 22 8 40c0 9 4 17 11 22 3 2 6-1 6-4v-4c0-4 3-7 7-7h4c14 0 24-10 24-23 0-5-2-16-20-16z"
          fill="#8E44AD" stroke="#7D3C98" strokeWidth="2"/>
        <circle cx="20" cy="36" r="5" fill="#E74C3C"/>
        <circle cx="28" cy="20" r="5" fill="#F39C12"/>
        <circle cx="44" cy="14" r="5" fill="#2ECC71"/>
        <circle cx="57" cy="24" r="5" fill="#3498DB"/>
        <circle cx="60" cy="40" r="5" fill="#E91E63"/>
        <circle cx="54" cy="54" r="7" fill="#2C3E50"/>
        <circle cx="54" cy="54" r="5" fill="#ECF0F1"/>
      </svg>
    ),
    health: (
      <svg viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="hg" x1="40" y1="14" x2="40" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B9D"/>
            <stop offset="100%" stopColor="#C0392B"/>
          </linearGradient>
        </defs>
        <path d="M40 68 L12 40 C4 32 4 18 14 14 C20 11 28 14 40 26 C52 14 60 11 66 14 C76 18 76 32 68 40 Z" fill="url(#hg)"/>
        <polyline points="16,42 24,42 28,32 34,52 38,36 42,48 46,42 64,42"
          stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    tokpisin: (
      <svg viewBox="0 0 80 80" fill="none">
        <rect x="6" y="8" width="60" height="44" rx="12" fill="#16A085"/>
        <rect x="6" y="8" width="30" height="44" rx="12" fill="#C0392B" opacity="0.3"/>
        <path d="M18 52 L10 68 L34 54" fill="#16A085"/>
        <rect x="16" y="22" width="48" height="5" rx="2.5" fill="white" opacity="0.9"/>
        <rect x="16" y="33" width="36" height="5" rx="2.5" fill="white" opacity="0.65"/>
        <circle cx="18" cy="48" r="3" fill="#FFD93D"/>
      </svg>
    ),
    values: (
      <svg viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="sg" x1="40" y1="8" x2="40" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD93D"/>
            <stop offset="100%" stopColor="#E67E22"/>
          </linearGradient>
        </defs>
        <path d="M40 8 L46 26 L66 26 L50 38 L56 56 L40 46 L24 56 L30 38 L14 26 L34 26 Z" fill="url(#sg)"/>
        <polyline points="29,34 37,42 52,28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="34" y="56" width="12" height="6" rx="2" fill="#D35400"/>
        <rect x="28" y="62" width="24" height="4" rx="2" fill="#D35400"/>
      </svg>
    ),
  };

  return (
    <motion.div
      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      animate={animate ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {icons[id] ?? null}
    </motion.div>
  );
}

// ── FLOATING PARTICLES ────────────────────────────────
function Particles({ color }: { color: string }) {
  const pts = [
    { x: -44, y: -38, r: 5, d: 0.0 }, { x: 44, y: -44, r: 4, d: 0.12 },
    { x: -56, y: 8,  r: 6, d: 0.07 }, { x: 58,  y: 14, r: 3, d: 0.18 },
    { x: -18, y: -62, r: 4, d: 0.22 }, { x: 20, y: -60, r: 5, d: 0.05 },
    { x: -30, y: 50, r: 4, d: 0.15 }, { x: 36,  y: 48, r: 3, d: 0.09 },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <motion.div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: p.r, height: p.r, borderRadius: "50%", background: color,
          pointerEvents: "none",
        }}
          initial={{ opacity: 0, x: p.x * 0.4, y: p.y * 0.4, scale: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], x: [p.x * 0.4, p.x, p.x * 1.3], y: [p.y * 0.4, p.y, p.y * 1.5], scale: [0, 1.6, 0] }}
          transition={{ duration: 1.8, delay: p.d, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// ── SUBJECT SCENES ─────────────────────────────────────
// Each scene shows what students actually DO — completely different from the circle icon
function SubjectScene({ id }: { id: string }) {
  const scenes: Record<string, React.ReactNode> = {

    english: (
      // Big coloured letters H-E-L-L-O dropping in, speech bubble
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        {["H","E","L","L","O"].map((letter, i) => {
          const colors = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BDB"];
          const x = 60 + i * 70;
          return (
            <motion.g key={i} initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 400, damping: 18 }}>
              <motion.circle cx={x} cy={88} r={32} fill={colors[i]}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, delay: 0.6 + i * 0.15, repeat: Infinity }}/>
              <text x={x} y={97} textAnchor="middle" fontSize="30" fontWeight="900" fill="white" fontFamily="Nunito">{letter}</text>
            </motion.g>
          );
        })}
        <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, type: "spring" }}>
          <rect x="140" y="136" width="180" height="44" rx="22" fill="white"/>
          <polygon points="185,180 172,198 210,180" fill="white"/>
          <text x="230" y="164" textAnchor="middle" fontSize="15" fontWeight="900" fill="#2563EB" fontFamily="Nunito">Read Stories!</text>
        </motion.g>
        {[{x:22,y:35,c:"#FFD93D"},{x:438,y:45,c:"#FF6B6B"},{x:442,y:162,c:"#6BCB77"},{x:18,y:162,c:"#4D96FF"}].map((s,i)=>(
          <motion.g key={i} animate={{ rotate:[0,360], scale:[0.8,1.2,0.8] }} transition={{ duration:2.5, delay:i*0.5, repeat:Infinity }}>
            <polygon points={`${s.x},${s.y-10} ${s.x+3.5},${s.y-3.5} ${s.x+10},${s.y-3.5} ${s.x+4.5},${s.y+2} ${s.x+7},${s.y+10} ${s.x},${s.y+5.5} ${s.x-7},${s.y+10} ${s.x-4.5},${s.y+2} ${s.x-10},${s.y-3.5} ${s.x-3.5},${s.y-3.5}`}
              fill={s.c}/>
          </motion.g>
        ))}
      </svg>
    ),

    maths: (
      // PNG coconut trees counting: 2 + 3 = 5
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        {[80, 140].map((x, i) => (
          <motion.g key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 300 }}>
            <rect x={x-5} y={118} width={10} height={62} rx={5} fill="#8B6914"/>
            <ellipse cx={x} cy={112} rx={24} ry={18} fill="#27AE60"/>
            <ellipse cx={x-18} cy={120} rx={16} ry={10} fill="#2ECC71" transform={`rotate(-30 ${x-18} 120)`}/>
            <ellipse cx={x+18} cy={120} rx={16} ry={10} fill="#2ECC71" transform={`rotate(30 ${x+18} 120)`}/>
            <circle cx={x-6} cy={126} r={6} fill="#8B6914"/>
            <circle cx={x+6} cy={128} r={6} fill="#6B4F1A"/>
          </motion.g>
        ))}
        <motion.g initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:0.5,type:"spring"}}>
          <circle cx={110} cy={52} r={22} fill="#FFD93D"/>
          <text x="110" y="59" textAnchor="middle" fontSize="22" fontWeight="900" fill="#333" fontFamily="Nunito">2</text>
        </motion.g>
        <motion.text x="210" y="108" textAnchor="middle" fontSize="52" fontWeight="900" fill="white" fontFamily="Nunito"
          initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:0.7,type:"spring"}}>+</motion.text>
        {[280, 340, 400].map((x, i) => (
          <motion.g key={i} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 + i * 0.18, type: "spring", stiffness: 300 }}>
            <rect x={x-5} y={118} width={10} height={62} rx={5} fill="#8B6914"/>
            <ellipse cx={x} cy={112} rx={22} ry={16} fill="#27AE60"/>
            <ellipse cx={x-16} cy={120} rx={14} ry={9} fill="#2ECC71" transform={`rotate(-30 ${x-16} 120)`}/>
            <ellipse cx={x+16} cy={120} rx={14} ry={9} fill="#2ECC71" transform={`rotate(30 ${x+16} 120)`}/>
            <circle cx={x-5} cy={125} r={5} fill="#8B6914"/>
            <circle cx={x+5} cy={127} r={5} fill="#6B4F1A"/>
          </motion.g>
        ))}
        <motion.g initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:1.45,type:"spring"}}>
          <circle cx={340} cy={52} r={22} fill="#FFD93D"/>
          <text x="340" y="59" textAnchor="middle" fontSize="22" fontWeight="900" fill="#333" fontFamily="Nunito">3</text>
        </motion.g>
        <motion.g initial={{opacity:0,scale:0}} animate={{opacity:1,scale:[0,1.4,1]}} transition={{delay:1.7,type:"spring",stiffness:500}}>
          <rect x="100" y="170" width="260" height="26" rx="13" fill="rgba(255,211,61,0.18)" stroke="#FFD93D" strokeWidth="1.5"/>
          <text x="230" y="188" textAnchor="middle" fontSize="16" fontWeight="900" fill="#FFD93D" fontFamily="Nunito">2 + 3 = 5 Trees!</text>
        </motion.g>
      </svg>
    ),

    science: (
      // Sun + growing flower + butterfly
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ originX: "72px", originY: "58px" }}>
          {[0,45,90,135,180,225,270,315].map(a => {
            const r = a * Math.PI / 180;
            return <line key={a} x1={72+Math.cos(r)*26} y1={58+Math.sin(r)*26} x2={72+Math.cos(r)*42} y2={58+Math.sin(r)*42}
              stroke="#FFD93D" strokeWidth="4" strokeLinecap="round"/>;
          })}
        </motion.g>
        <circle cx="72" cy="58" r="22" fill="#FFD93D"/>
        <circle cx="64" cy="52" r="3.5" fill="#F39C12"/><circle cx="80" cy="52" r="3.5" fill="#F39C12"/>
        <path d="M64 65 Q72 73 80 65" stroke="#F39C12" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="230" cy="188" rx="130" ry="14" fill="#6B4F1A"/>
        <motion.rect x="227" y="100" width="6" height="88" rx="3" fill="#27AE60"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          style={{ originY: "188px" }} transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}/>
        <motion.ellipse cx="210" cy="152" rx="20" ry="10" fill="#2ECC71" transform="rotate(-30 210 152)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85, type: "spring" }}/>
        <motion.ellipse cx="250" cy="142" rx="20" ry="10" fill="#2ECC71" transform="rotate(30 250 142)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.05, type: "spring" }}/>
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.25, type: "spring", stiffness: 400 }}>
          {[0,60,120,180,240,300].map(a => {
            const r = a * Math.PI/180;
            return <ellipse key={a} cx={230+Math.cos(r)*18} cy={94+Math.sin(r)*18} rx="12" ry="8"
              fill="#FF6B6B" transform={`rotate(${a} ${230+Math.cos(r)*18} ${94+Math.sin(r)*18})`}/>;
          })}
          <circle cx="230" cy="94" r="14" fill="#FFD93D"/>
        </motion.g>
        <motion.g animate={{ x: [-60, 100], y: [0, -18, 0] }}
          transition={{ duration: 3, delay: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}>
          <motion.ellipse cx="340" cy="74" rx="22" ry="13" fill="#E91E63" opacity="0.85"
            animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.38, repeat: Infinity }}/>
          <motion.ellipse cx="340" cy="90" rx="16" ry="10" fill="#FF6B9D" opacity="0.85"
            animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.38, repeat: Infinity }}/>
          <motion.ellipse cx="372" cy="74" rx="22" ry="13" fill="#E91E63" opacity="0.85"
            animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.38, repeat: Infinity }}/>
          <motion.ellipse cx="372" cy="90" rx="16" ry="10" fill="#FF6B9D" opacity="0.85"
            animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.38, repeat: Infinity }}/>
          <ellipse cx="356" cy="82" rx="6" ry="12" fill="#333"/>
          <line x1="352" y1="70" x2="344" y2="56" stroke="#333" strokeWidth="1.5"/><circle cx="344" cy="54" r="2.5" fill="#333"/>
          <line x1="360" y1="70" x2="368" y2="56" stroke="#333" strokeWidth="1.5"/><circle cx="368" cy="54" r="2.5" fill="#333"/>
        </motion.g>
      </svg>
    ),

    social: (
      // PNG map with glowing city dots
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        <motion.path
          d="M55,105 Q78,62 132,52 Q172,42 202,57 Q242,68 262,52 Q292,36 332,46 Q372,57 402,82 Q422,112 412,142 Q392,167 362,162 Q332,157 312,167 Q282,177 252,167 Q222,157 192,167 Q162,177 132,162 Q88,147 68,127 Z"
          fill="#27AE60" opacity="0.25"
          initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ duration: 0.6 }}/>
        <motion.path
          d="M55,105 Q78,62 132,52 Q172,42 202,57 Q242,68 262,52 Q292,36 332,46 Q372,57 402,82 Q422,112 412,142 Q392,167 362,162 Q332,157 312,167 Q282,177 252,167 Q222,157 192,167 Q162,177 132,162 Q88,147 68,127 Z"
          fill="none" stroke="#27AE60" strokeWidth="2.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut" }}/>
        {[
          { x:342, y:132, name:"Port Moresby", delay:1.3 },
          { x:272, y:97,  name:"Lae",          delay:1.6 },
          { x:182, y:92,  name:"Mt Hagen",     delay:1.9 },
          { x:212, y:74,  name:"Madang",        delay:2.2 },
        ].map(city => (
          <motion.g key={city.name} initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay: city.delay, type:"spring", stiffness:500 }}>
            <motion.circle cx={city.x} cy={city.y} r={16} fill="none" stroke="#FFD93D" strokeWidth="2" opacity={0.5}
              animate={{ scale:[1,2.4,1], opacity:[0.5,0,0.5] }} transition={{ duration:1.8, delay:city.delay, repeat:Infinity }}/>
            <circle cx={city.x} cy={city.y} r={6} fill="#FFD93D"/>
            <text x={city.x} y={city.y-14} textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="Nunito">{city.name}</text>
          </motion.g>
        ))}
        <motion.g animate={{ rotate:[0,12,-12,0] }} transition={{ duration:4, repeat:Infinity }}
          style={{ originX:"50px", originY:"168px" }}>
          <circle cx="50" cy="168" r="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <text x="50" y="156" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Nunito">N</text>
          <text x="50" y="184" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Nunito">S</text>
          <text x="32" y="172" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Nunito">W</text>
          <text x="68" y="172" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="Nunito">E</text>
          <circle cx="50" cy="168" r="3" fill="#FFD93D"/>
        </motion.g>
        <motion.text x="230" y="28" textAnchor="middle" fontSize="17" fontWeight="900" fill="white" fontFamily="Nunito"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>Papua New Guinea</motion.text>
      </svg>
    ),

    arts: (
      // Rainbow paint strokes drawn live on a canvas
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        <rect x="20" y="18" width="420" height="164" rx="14" fill="white" opacity="0.96"/>
        <rect x="20" y="18" width="420" height="164" rx="14" stroke="#ddd" strokeWidth="2"/>
        {[
          { d:"M 50 55 Q 130 38 210 62 Q 295 88 430 52", color:"#E74C3C", delay:0.2 },
          { d:"M 50 88 Q 145 68 235 92 Q 325 118 430 82", color:"#F39C12", delay:0.55 },
          { d:"M 50 116 Q 150 98 242 120 Q 342 145 430 112", color:"#2ECC71", delay:0.9 },
          { d:"M 50 144 Q 158 126 252 147 Q 356 168 430 140", color:"#3498DB", delay:1.25 },
          { d:"M 50 168 Q 162 154 262 169 Q 362 184 430 165", color:"#9B59B6", delay:1.6 },
        ].map((s,i) => (
          <motion.path key={i} d={s.d} stroke={s.color} strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.72"
            initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:0.72 }}
            transition={{ duration:0.7, delay:s.delay, ease:"easeInOut" }}/>
        ))}
        <motion.g animate={{ x:[0,80,160,250,350,380], y:[-36,-8,12,34,50,10] }}
          transition={{ duration:2.2, ease:"linear", delay:0.1 }}>
          <rect x="415" y="18" width="8" height="42" rx="4" fill="#8B4513"/>
          <ellipse cx="419" cy="64" rx="5" ry="10" fill="#E74C3C"/>
        </motion.g>
        {[{x:82,y:46},{x:205,y:80},{x:342,y:108},{x:418,y:138}].map((sp,i)=>(
          <motion.g key={i} initial={{opacity:0,scale:0}} animate={{opacity:[0,1,0],scale:[0,1.4,0]}}
            transition={{duration:0.5,delay:0.6+i*0.35,repeat:Infinity,repeatDelay:2.2}}>
            <circle cx={sp.x} cy={sp.y} r={6} fill="white" opacity={0.9}/>
            {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([dx,dy],j)=>(
              <line key={j} x1={sp.x} y1={sp.y} x2={sp.x+dx*10} y2={sp.y+dy*10} stroke="white" strokeWidth="1.5" opacity="0.7"/>
            ))}
          </motion.g>
        ))}
      </svg>
    ),

    health: (
      // Heartbeat + water drop + bouncing fruits
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        <rect x="0" y="170" width="460" height="30" fill="rgba(255,255,255,0.05)"/>

        {/* Heartbeat monitor panel */}
        <rect x="10" y="30" width="170" height="130" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,107,157,0.4)" strokeWidth="1.5"/>
        <text x="95" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="rgba(255,107,157,0.7)" fontFamily="Nunito">HEART RATE</text>
        {/* Static ECG baseline */}
        <line x1="22" y1="110" x2="178" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        {/* Animated ECG pulse */}
        <motion.polyline
          points="22,110 45,110 52,88 58,132 64,70 70,148 76,110 100,110 107,95 113,125 119,110 178,110"
          stroke="#FF6B9D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength:0, opacity:0 }}
          animate={{ pathLength:[0,1,1,0], opacity:[0,1,1,0] }}
          transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut", times:[0,0.4,0.7,1] }}/>
        {/* Pulsing dot */}
        <motion.circle cx="119" cy="110" r="5" fill="#FF6B9D"
          animate={{ scale:[1,2,1], opacity:[1,0,1] }}
          transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}/>
        {/* BPM label */}
        <motion.text x="95" y="150" textAnchor="middle" fontSize="22" fontWeight="900" fill="#FF6B9D" fontFamily="Nunito"
          animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:1.8, repeat:Infinity }}>72 BPM</motion.text>
        <motion.g animate={{ scale:[1,1.08,1] }} transition={{ duration:1.4, repeat:Infinity }}>
          <path d="M230 55 Q208 88 208 114 Q208 146 230 152 Q252 146 252 114 Q252 88 230 55Z" fill="#3498DB" opacity="0.9"/>
          <ellipse cx="220" cy="118" rx="8" ry="12" fill="white" opacity="0.3" transform="rotate(-20 220 118)"/>
        </motion.g>
        <text x="230" y="185" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Nunito">Stay Hydrated!</text>
        {/* Apple */}
        <motion.g animate={{ y:[0,-45,0] }} transition={{ duration:0.9, delay:0, repeat:Infinity, ease:"easeInOut" }}>
          <ellipse cx="330" cy="130" rx="18" ry="20" fill="#E74C3C"/>
          <rect x="328" y="108" width="4" height="8" rx="2" fill="#27AE60"/>
          <ellipse cx="322" cy="118" rx="8" ry="5" fill="#2ECC71" opacity="0.8"/>
        </motion.g>
        {/* Banana */}
        <motion.g animate={{ y:[0,-45,0] }} transition={{ duration:0.9, delay:0.22, repeat:Infinity, ease:"easeInOut" }}>
          <path d="M370 145 Q378 118 390 112 Q400 108 402 116 Q396 132 380 148 Z" fill="#FFD93D"/>
          <path d="M370 145 Q374 128 386 116" stroke="#F39C12" strokeWidth="2" fill="none"/>
        </motion.g>
        {/* Carrot */}
        <motion.g animate={{ y:[0,-45,0] }} transition={{ duration:0.9, delay:0.44, repeat:Infinity, ease:"easeInOut" }}>
          <path d="M430 148 Q420 125 428 110 Q436 125 440 148 Z" fill="#E67E22"/>
          <rect x="427" y="106" width="4" height="8" rx="2" fill="#27AE60"/>
          <rect x="432" y="108" width="3" height="6" rx="1.5" fill="#27AE60"/>
          <rect x="422" y="108" width="3" height="6" rx="1.5" fill="#27AE60"/>
        </motion.g>
        <text x="380" y="185" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Nunito">Eat Well!</text>
      </svg>
    ),

    tokpisin: (
      // Letters of GUTPELA! spring in, translation + Tok Pisin phrases
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        {"GUTPELA!".split("").map((ch, i) => (
          <motion.text key={i} x={44 + i * 52} y={96}
            fontSize="46" fontWeight="900" fontFamily="Nunito"
            fill={["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6BDB","#FFD93D","#6BCB77","#FF6B6B"][i % 8]}
            initial={{ opacity:0, y:-50, scale:0.4 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ delay: i * 0.1, type:"spring", stiffness:500, damping:18 }}>
            {ch}
          </motion.text>
        ))}
        <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0 }}>
          <rect x="125" y="114" width="210" height="32" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
          <text x="230" y="136" textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Nunito">= Excellent! / Great!</text>
        </motion.g>
        <motion.g initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:1.3,type:"spring"}}>
          <rect x="14" y="154" width="160" height="34" rx="12" fill="#16A085"/>
          <polygon points="44,188 32,200 62,188" fill="#16A085"/>
          <text x="94" y="177" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="Nunito">Yu save Tok Pisin?</text>
        </motion.g>
        <motion.g initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:1.65,type:"spring"}}>
          <rect x="286" y="154" width="160" height="34" rx="12" fill="#C0392B"/>
          <polygon points="416,188 436,200 396,188" fill="#C0392B"/>
          <text x="366" y="177" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" fontFamily="Nunito">Do you know it?</text>
        </motion.g>
      </svg>
    ),

    values: (
      // 3 kids holding hands, heart grows, stars pop
      <svg viewBox="0 0 460 200" fill="none" width="100%" height="200">
        <motion.g initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:1.2,type:"spring",stiffness:280}}
          style={{originX:"230px",originY:"70px"}}>
          <motion.path d="M230 92 L200 60 C186 46 186 28 198 22 C205 18 214 21 230 38 C246 21 255 18 262 22 C274 28 274 46 260 60 Z"
            fill="#E74C3C"
            animate={{scale:[1,1.14,1]}} transition={{duration:1.1,repeat:Infinity,delay:1.5}}/>
        </motion.g>
        {[{x:120,color:"#3498DB",d:0.1},{x:230,color:"#E74C3C",d:0.3},{x:340,color:"#27AE60",d:0.5}].map(kid=>(
          <motion.g key={kid.x} initial={{y:30,opacity:0}} animate={{y:0,opacity:1}}
            transition={{delay:kid.d,type:"spring",stiffness:300}}>
            <circle cx={kid.x} cy={112} r={18} fill="#FBBF24"/>
            <circle cx={kid.x-7} cy={108} r={3} fill="#333"/><circle cx={kid.x+7} cy={108} r={3} fill="#333"/>
            <path d={`M${kid.x-6} 119 Q${kid.x} 126 ${kid.x+6} 119`} stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <rect x={kid.x-14} y={130} width={28} height={38} rx={14} fill={kid.color}/>
            <rect x={kid.x-12} y={160} width={10} height={28} rx={5} fill="#FBBF24"/>
            <rect x={kid.x+2}  y={160} width={10} height={28} rx={5} fill="#FBBF24"/>
          </motion.g>
        ))}
        <motion.line x1="134" y1="150" x2="216" y2="150" stroke="#FFD93D" strokeWidth="5" strokeLinecap="round"
          initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{delay:0.8,duration:0.4}}/>
        <motion.line x1="244" y1="150" x2="326" y2="150" stroke="#FFD93D" strokeWidth="5" strokeLinecap="round"
          initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} transition={{delay:1.0,duration:0.4}}/>
        {[{x:58,y:82,d:0.6},{x:402,y:78,d:0.9},{x:230,y:162,d:1.4},{x:148,y:50,d:1.7},{x:316,y:54,d:2.0}].map((s,i)=>(
          <motion.g key={i} initial={{opacity:0,scale:0}} animate={{opacity:[0,1,0],scale:[0,1.4,0]}}
            transition={{duration:0.6,delay:s.d,repeat:Infinity,repeatDelay:2.5}}>
            <polygon points={`${s.x},${s.y-10} ${s.x+4},${s.y-4} ${s.x+11},${s.y-4} ${s.x+5},${s.y+2} ${s.x+7},${s.y+10} ${s.x},${s.y+6} ${s.x-7},${s.y+10} ${s.x-5},${s.y+2} ${s.x-11},${s.y-4} ${s.x-4},${s.y-4}`}
              fill="#FFD93D"/>
          </motion.g>
        ))}
        <motion.text x="230" y="24" textAnchor="middle" fontSize="17" fontWeight="900" fill="white" fontFamily="Nunito"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}>Together We Grow!</motion.text>
      </svg>
    ),
  };
  return <>{scenes[id] ?? null}</>;
}

// ── SUBJECT OVERLAY (click-based, centered) ────────────
function SubjectOverlay({ subject, meta, onSelect }: {
  subject: typeof SUBJECTS[0];
  meta: { topics: string[]; fun: string };
  onSelect: (id: SubjectId) => void;
}) {
  return (
    <div style={{ position:"fixed", top:"50%", left:"50%", zIndex:500, pointerEvents:"none" }}>
      <motion.div
        initial={{ opacity:0, x:"-50%", y:"-50%", scale:0.82 }}
        animate={{ opacity:1, x:"-50%", y:"-50%", scale:1 }}
        exit={{ opacity:0, x:"-50%", y:"-50%", scale:0.84 }}
        transition={{ type:"spring", stiffness:380, damping:26 }}
        style={{ width:500 }}
      >
        <div style={{
          pointerEvents: "auto",          // only this card captures events
          background: "linear-gradient(160deg, rgba(8,12,8,0.98) 0%, rgba(16,22,16,0.98) 100%)",
          border: `2.5px solid ${subject.color}88`,
          borderRadius: 28, overflow: "hidden",
          boxShadow: `0 32px 80px rgba(0,0,0,0.95), 0 0 70px ${subject.color}44`,
        }}>
          <div style={{ height:6, background: subject.color }}/>
          <div style={{ padding:"18px 18px 0", background:`${subject.color}0d` }}>
            <SubjectScene id={subject.id}/>
          </div>
          <div style={{ padding:"14px 28px 24px", textAlign:"center" }}>
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.08}}
              style={{ fontSize:26, fontWeight:900, color:subject.color, lineHeight:1, marginBottom:6 }}>
              {subject.name}
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}}
              style={{ fontSize:13, color:"rgba(255,255,255,0.58)", fontWeight:700, marginBottom:18 }}>
              {meta.fun}
            </motion.div>
            <motion.button
              onClick={() => onSelect(subject.id as SubjectId)}
              animate={{ scale:[1,1.1,1], boxShadow:[`0 0 16px ${subject.color}55`,`0 0 38px ${subject.color}bb`,`0 0 16px ${subject.color}55`] }}
              transition={{ duration:1.1, repeat:Infinity }}
              style={{ background:subject.color, color:"#000", fontWeight:900, fontSize:17,
                borderRadius:34, padding:"12px 44px", border:"none", cursor:"pointer" }}>
              Start Learning! →
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── CARTOON MASCOTS (unused — replaced by SubjectScene) ──
function CartoonMascot({ id }: { id: string }): React.ReactElement | null {
  const mascots: Record<string, React.ReactNode> = {

    english: ( // Happy book with big eyes, waving arms
      <svg viewBox="0 0 120 130" fill="none" width="120" height="130">
        {/* Left arm waving */}
        <motion.g animate={{ rotate: [-20, 20, -20] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ originX: "32px", originY: "72px" }}>
          <rect x="10" y="64" width="28" height="12" rx="6" fill="#4A90D9"/>
          <circle cx="10" cy="70" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Right arm waving opposite */}
        <motion.g animate={{ rotate: [20, -20, 20] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ originX: "88px", originY: "72px" }}>
          <rect x="82" y="64" width="28" height="12" rx="6" fill="#4A90D9"/>
          <circle cx="110" cy="70" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Book body */}
        <rect x="22" y="30" width="76" height="80" rx="10" fill="#2563EB"/>
        <rect x="22" y="30" width="76" height="80" rx="10" stroke="#1D4ED8" strokeWidth="2"/>
        {/* Spine */}
        <rect x="57" y="30" width="6" height="80" fill="#1D4ED8"/>
        {/* Left page lines */}
        <rect x="30" y="55" width="22" height="3" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="30" y="62" width="18" height="3" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="30" y="69" width="20" height="3" rx="1.5" fill="white" opacity="0.6"/>
        {/* Right page lines */}
        <rect x="68" y="55" width="22" height="3" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="68" y="62" width="18" height="3" rx="1.5" fill="white" opacity="0.6"/>
        <rect x="68" y="69" width="20" height="3" rx="1.5" fill="white" opacity="0.6"/>
        {/* Eyes */}
        <ellipse cx="43" cy="44" rx="8" ry="9" fill="white"/>
        <ellipse cx="77" cy="44" rx="8" ry="9" fill="white"/>
        <motion.ellipse cx="44" cy="45" rx="5" ry="5" fill="#1e3a8a"
          animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.5, 1] }}/>
        <motion.ellipse cx="78" cy="45" rx="5" ry="5" fill="#1e3a8a"
          animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.5, 1] }}/>
        <circle cx="46" cy="43" r="1.5" fill="white"/>
        <circle cx="80" cy="43" r="1.5" fill="white"/>
        {/* Big smile */}
        <path d="M38 58 Q60 72 82 58" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* Feet */}
        <ellipse cx="47" cy="112" rx="10" ry="6" fill="#1D4ED8"/>
        <ellipse cx="73" cy="112" rx="10" ry="6" fill="#1D4ED8"/>
      </svg>
    ),

    maths: ( // Calculator with face, arms up celebrating
      <svg viewBox="0 0 120 130" fill="none" width="120" height="130">
        {/* Arms up */}
        <motion.g animate={{ rotate: [-15, 10, -15] }} transition={{ duration: 0.8, repeat: Infinity }}>
          <rect x="8" y="40" width="26" height="11" rx="5.5" fill="#E74C3C"/>
          <circle cx="8" cy="46" r="7" fill="#FBBF24"/>
        </motion.g>
        <motion.g animate={{ rotate: [15, -10, 15] }} transition={{ duration: 0.8, repeat: Infinity }}>
          <rect x="86" y="40" width="26" height="11" rx="5.5" fill="#E74C3C"/>
          <circle cx="112" cy="46" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Body */}
        <rect x="20" y="18" width="80" height="90" rx="14" fill="#C0392B"/>
        <rect x="20" y="18" width="80" height="90" rx="14" stroke="#922B21" strokeWidth="2"/>
        {/* Screen */}
        <rect x="30" y="26" width="60" height="30" rx="6" fill="#1A1A2E"/>
        {/* Eyes on screen */}
        <ellipse cx="48" cy="37" rx="8" ry="9" fill="white"/>
        <ellipse cx="72" cy="37" rx="8" ry="9" fill="white"/>
        <motion.ellipse cx="49" cy="38" rx="5" ry="5" fill="#922B21"
          animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity }}/>
        <motion.ellipse cx="73" cy="38" rx="5" ry="5" fill="#922B21"
          animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity }}/>
        <circle cx="51" cy="36" r="1.5" fill="white"/>
        <circle cx="75" cy="36" r="1.5" fill="white"/>
        {/* Smile on screen */}
        <path d="M42 50 Q60 62 78 50" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* Buttons grid */}
        {[0,1,2,3].map(col => [0,1,2].map(row => (
          <motion.rect key={`${col}-${row}`} x={30+col*16} y={64+row*14} width="12" height="10" rx="3"
            fill={col===3&&row===0 ? "#FFD93D" : col===3 ? "#F39C12" : "rgba(255,255,255,0.18)"}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, delay: (col+row)*0.15, repeat: Infinity }}/>
        )))}
        {/* Feet */}
        <ellipse cx="47" cy="110" rx="10" ry="6" fill="#922B21"/>
        <ellipse cx="73" cy="110" rx="10" ry="6" fill="#922B21"/>
      </svg>
    ),

    science: ( // Round flask with big eyes, bubbles, happy
      <svg viewBox="0 0 120 140" fill="none" width="120" height="140">
        {/* Bubbles floating */}
        {[{cx:85,cy:28,r:5,d:0},{cx:95,cy:50,r:3,d:0.3},{cx:88,cy:14,r:4,d:0.6}].map((b,i)=>(
          <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#3498DB" opacity={0.5}
            animate={{ y: [-8, -22, -8], opacity:[0.5,0,0.5] }}
            transition={{ duration: 1.5, delay: b.d, repeat: Infinity }}/>
        ))}
        {/* Flask neck */}
        <rect x="46" y="18" width="28" height="26" rx="6" fill="#3498DB"/>
        <rect x="46" y="18" width="28" height="26" rx="6" stroke="#2471A3" strokeWidth="2"/>
        {/* Flask body */}
        <ellipse cx="60" cy="88" rx="46" ry="46" fill="#3498DB"/>
        <ellipse cx="60" cy="88" rx="46" ry="46" stroke="#2471A3" strokeWidth="2"/>
        {/* Liquid inside */}
        <ellipse cx="60" cy="104" rx="38" ry="28" fill="#E74C3C" opacity="0.85"/>
        {/* Eyes */}
        <ellipse cx="44" cy="76" rx="10" ry="11" fill="white"/>
        <ellipse cx="76" cy="76" rx="10" ry="11" fill="white"/>
        <motion.ellipse cx="45" cy="77" rx="6" ry="6" fill="#1a5276"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2.2, repeat:Infinity }}/>
        <motion.ellipse cx="77" cy="77" rx="6" ry="6" fill="#1a5276"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2.2, repeat:Infinity }}/>
        <circle cx="47" cy="75" r="2" fill="white"/>
        <circle cx="79" cy="75" r="2" fill="white"/>
        {/* Smile */}
        <path d="M40 94 Q60 110 80 94" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* Neck band */}
        <rect x="46" y="38" width="28" height="6" rx="3" fill="#2471A3" opacity="0.6"/>
      </svg>
    ),

    social: ( // Cute PNG village house character with eyes in windows
      <svg viewBox="0 0 120 130" fill="none" width="120" height="130">
        {/* Arms */}
        <motion.g animate={{ rotate:[-25,10,-25] }} transition={{ duration:0.9, repeat:Infinity }}>
          <rect x="6" y="68" width="26" height="11" rx="5.5" fill="#E67E22"/>
          <circle cx="6" cy="74" r="7" fill="#FBBF24"/>
        </motion.g>
        <motion.g animate={{ rotate:[25,-10,25] }} transition={{ duration:0.9, repeat:Infinity }}>
          <rect x="88" y="68" width="26" height="11" rx="5.5" fill="#E67E22"/>
          <circle cx="114" cy="74" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Roof */}
        <polygon points="60,12 104,48 16,48" fill="#C0392B"/>
        <polygon points="60,12 108,50 12,50" fill="#E74C3C"/>
        {/* Body */}
        <rect x="20" y="48" width="80" height="62" rx="6" fill="#E67E22"/>
        {/* Left window eye */}
        <rect x="28" y="56" width="24" height="22" rx="6" fill="#87CEEB"/>
        <ellipse cx="40" cy="67" rx="7" ry="8" fill="white"/>
        <motion.ellipse cx="41" cy="68" rx="4.5" ry="4.5" fill="#1a5276"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2.8, repeat:Infinity }}/>
        <circle cx="43" cy="66" r="1.5" fill="white"/>
        {/* Right window eye */}
        <rect x="68" y="56" width="24" height="22" rx="6" fill="#87CEEB"/>
        <ellipse cx="80" cy="67" rx="7" ry="8" fill="white"/>
        <motion.ellipse cx="81" cy="68" rx="4.5" ry="4.5" fill="#1a5276"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2.8, repeat:Infinity }}/>
        <circle cx="83" cy="66" r="1.5" fill="white"/>
        {/* Door smile */}
        <rect x="49" y="82" width="22" height="28" rx="11 11 4 4" fill="#8B4513"/>
        <path d="M45 78 Q60 90 75 78" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* PNG flag star on roof */}
        <path d="M60 22 L62 28 L68 28 L63 32 L65 38 L60 34 L55 38 L57 32 L52 28 L58 28Z" fill="#FFD93D"/>
      </svg>
    ),

    arts: ( // Round paint palette face, dancing with rainbow streaks
      <svg viewBox="0 0 120 130" fill="none" width="120" height="130">
        {/* Paintbrush arm */}
        <motion.g animate={{ rotate:[-20,20,-20], originX:"30px", originY:"60px" }} transition={{ duration:0.8, repeat:Infinity }}>
          <rect x="4" y="56" width="32" height="10" rx="5" fill="#8B4513"/>
          <rect x="4" y="54" width="12" height="14" rx="3" fill="#E74C3C"/>
        </motion.g>
        {/* Other arm */}
        <motion.g animate={{ rotate:[15,-15,15] }} transition={{ duration:0.9, repeat:Infinity }}>
          <rect x="84" y="60" width="28" height="10" rx="5" fill="#8B4513"/>
          <circle cx="112" cy="65" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Palette body */}
        <ellipse cx="60" cy="72" rx="52" ry="50" fill="#8E44AD"/>
        <ellipse cx="60" cy="72" rx="52" ry="50" stroke="#6C3483" strokeWidth="2"/>
        {/* Paint blobs on palette */}
        {[
          {cx:32,cy:54,r:9,f:"#E74C3C"},{cx:52,cy:44,r:9,f:"#F39C12"},
          {cx:72,cy:44,r:9,f:"#2ECC71"},{cx:88,cy:56,r:9,f:"#3498DB"},
          {cx:88,cy:78,r:9,f:"#E91E63"},
        ].map((b,i)=>(
          <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.f}
            animate={{ scale:[1,1.2,1] }} transition={{ duration:1, delay:i*0.2, repeat:Infinity }}/>
        ))}
        {/* Eyes */}
        <ellipse cx="46" cy="72" rx="9" ry="10" fill="white"/>
        <ellipse cx="74" cy="72" rx="9" ry="10" fill="white"/>
        <motion.ellipse cx="47" cy="73" rx="5.5" ry="5.5" fill="#4A235A"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2, repeat:Infinity }}/>
        <motion.ellipse cx="75" cy="73" rx="5.5" ry="5.5" fill="#4A235A"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2, repeat:Infinity }}/>
        <circle cx="49" cy="71" r="2" fill="white"/>
        <circle cx="77" cy="71" r="2" fill="white"/>
        {/* Big grin */}
        <path d="M38 88 Q60 106 82 88" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* Feet */}
        <ellipse cx="46" cy="122" rx="10" ry="6" fill="#6C3483"/>
        <ellipse cx="74" cy="122" rx="10" ry="6" fill="#6C3483"/>
      </svg>
    ),

    health: ( // Big heart with face, flexing arms
      <svg viewBox="0 0 120 130" fill="none" width="120" height="130">
        {/* Flexing arms */}
        <motion.g animate={{ rotate:[-30,0,-30], originX:"28px", originY:"70px" }} transition={{ duration:0.7, repeat:Infinity }}>
          <rect x="4" y="62" width="30" height="12" rx="6" fill="#FF6B9D"/>
          <ellipse cx="10" cy="55" rx="10" ry="12" fill="#FF6B9D"/>
        </motion.g>
        <motion.g animate={{ rotate:[30,0,30], originX:"92px", originY:"70px" }} transition={{ duration:0.7, repeat:Infinity }}>
          <rect x="86" y="62" width="30" height="12" rx="6" fill="#FF6B9D"/>
          <ellipse cx="110" cy="55" rx="10" ry="12" fill="#FF6B9D"/>
        </motion.g>
        {/* Heart body */}
        <path d="M60 108 L22 68 C10 56 10 38 22 30 C30 25 40 28 60 46 C80 28 90 25 98 30 C110 38 110 56 98 68 Z" fill="#FF6B9D"/>
        <path d="M60 108 L22 68 C10 56 10 38 22 30 C30 25 40 28 60 46 C80 28 90 25 98 30 C110 38 110 56 98 68 Z" stroke="#C0392B" strokeWidth="2"/>
        {/* Shine */}
        <ellipse cx="38" cy="46" rx="8" ry="12" fill="white" opacity="0.2" transform="rotate(-20 38 46)"/>
        {/* Eyes */}
        <ellipse cx="44" cy="62" rx="9" ry="10" fill="white"/>
        <ellipse cx="76" cy="62" rx="9" ry="10" fill="white"/>
        <motion.ellipse cx="45" cy="63" rx="5.5" ry="5.5" fill="#7B241C"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2.4, repeat:Infinity }}/>
        <motion.ellipse cx="77" cy="63" rx="5.5" ry="5.5" fill="#7B241C"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2.4, repeat:Infinity }}/>
        <circle cx="47" cy="61" r="2" fill="white"/>
        <circle cx="79" cy="61" r="2" fill="white"/>
        {/* ECG smile */}
        <polyline points="36,78 44,78 48,70 54,86 58,74 62,82 66,78 84,78"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Feet */}
        <ellipse cx="47" cy="114" rx="10" ry="6" fill="#C0392B"/>
        <ellipse cx="73" cy="114" rx="10" ry="6" fill="#C0392B"/>
      </svg>
    ),

    tokpisin: ( // Big speech bubble with excited face, stars inside
      <svg viewBox="0 0 130 130" fill="none" width="130" height="130">
        {/* Arms */}
        <motion.g animate={{ rotate:[-20,15,-20] }} transition={{ duration:0.75, repeat:Infinity }}>
          <rect x="4" y="58" width="28" height="11" rx="5.5" fill="#16A085"/>
          <circle cx="4" cy="64" r="7" fill="#FBBF24"/>
        </motion.g>
        <motion.g animate={{ rotate:[20,-15,20] }} transition={{ duration:0.75, repeat:Infinity }}>
          <rect x="98" y="58" width="28" height="11" rx="5.5" fill="#16A085"/>
          <circle cx="126" cy="64" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Bubble body */}
        <rect x="10" y="12" width="100" height="86" rx="22" fill="#16A085"/>
        <rect x="10" y="12" width="100" height="86" rx="22" stroke="#0E6655" strokeWidth="2"/>
        {/* Speech tail */}
        <path d="M28 98 L16 120 L52 98" fill="#16A085"/>
        {/* Stars inside */}
        {[{x:30,y:36,s:12,d:0},{x:64,y:28,s:10,d:0.2},{x:90,y:38,s:8,d:0.4}].map((st,i)=>(
          <motion.path key={i}
            d={`M${st.x} ${st.y-st.s} L${st.x+st.s*0.35} ${st.y-st.s*0.35} L${st.x+st.s} ${st.y} L${st.x+st.s*0.35} ${st.y+st.s*0.35} L${st.x} ${st.y+st.s} L${st.x-st.s*0.35} ${st.y+st.s*0.35} L${st.x-st.s} ${st.y} L${st.x-st.s*0.35} ${st.y-st.s*0.35}Z`}
            fill="#FFD93D" animate={{ scale:[1,1.3,1], rotate:[0,20,0] }}
            transition={{ duration:1.2, delay:st.d, repeat:Infinity }}
            style={{ transformOrigin: `${st.x}px ${st.y}px` }}/>
        ))}
        {/* Eyes */}
        <ellipse cx="44" cy="68" rx="9" ry="10" fill="white"/>
        <ellipse cx="76" cy="68" rx="9" ry="10" fill="white"/>
        <motion.ellipse cx="45" cy="69" rx="5.5" ry="5.5" fill="#0E6655"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2.6, repeat:Infinity }}/>
        <motion.ellipse cx="77" cy="69" rx="5.5" ry="5.5" fill="#0E6655"
          animate={{ scaleY:[1,0.1,1] }} transition={{ duration:2.6, repeat:Infinity }}/>
        <circle cx="47" cy="67" r="2" fill="white"/>
        <circle cx="79" cy="67" r="2" fill="white"/>
        {/* Excited open mouth */}
        <ellipse cx="60" cy="84" rx="14" ry="9" fill="white"/>
        <ellipse cx="60" cy="87" rx="11" ry="6" fill="#C0392B"/>
        <ellipse cx="60" cy="84" rx="7" ry="3" fill="#F39C12"/>
      </svg>
    ),

    values: ( // Gold star hero with face, cape, fist pump
      <svg viewBox="0 0 120 140" fill="none" width="120" height="140">
        {/* Cape */}
        <motion.path d="M38 70 Q20 90 24 118 Q42 105 60 110 Q78 105 96 118 Q100 90 82 70Z" fill="#C0392B"
          animate={{ skewX:[-3,3,-3] }} transition={{ duration:0.8, repeat:Infinity }}/>
        {/* Fist pump arm */}
        <motion.g animate={{ y:[-8,0,-8] }} transition={{ duration:0.65, repeat:Infinity }}>
          <rect x="86" y="36" width="24" height="12" rx="6" fill="#FFD93D"/>
          <rect x="100" y="24" width="14" height="18" rx="6" fill="#FBBF24"/>
          <rect x="100" y="24" width="14" height="8" rx="4" fill="#F39C12"/>
        </motion.g>
        {/* Other arm */}
        <motion.g animate={{ rotate:[-10,15,-10] }} transition={{ duration:0.9, repeat:Infinity }}>
          <rect x="10" y="56" width="28" height="12" rx="6" fill="#FFD93D"/>
          <circle cx="10" cy="62" r="7" fill="#FBBF24"/>
        </motion.g>
        {/* Star body */}
        <path d="M60 14 L70 42 L100 42 L76 60 L86 88 L60 72 L34 88 L44 60 L20 42 L50 42Z" fill="#FFD93D"/>
        <path d="M60 14 L70 42 L100 42 L76 60 L86 88 L60 72 L34 88 L44 60 L20 42 L50 42Z" stroke="#F39C12" strokeWidth="2"/>
        {/* Inner shine */}
        <path d="M60 22 L67 40 L86 40 L72 52 L78 70 L60 58 L42 70 L48 52 L34 40 L53 40Z" fill="#FDE68A" opacity="0.5"/>
        {/* Eyes */}
        <ellipse cx="48" cy="48" rx="8" ry="9" fill="white"/>
        <ellipse cx="72" cy="48" rx="8" ry="9" fill="white"/>
        <motion.ellipse cx="49" cy="49" rx="5" ry="5" fill="#5D4037"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2, repeat:Infinity }}/>
        <motion.ellipse cx="73" cy="49" rx="5" ry="5" fill="#5D4037"
          animate={{ scaleY:[1,0.08,1] }} transition={{ duration:2, repeat:Infinity }}/>
        <circle cx="51" cy="47" r="1.5" fill="white"/>
        <circle cx="75" cy="47" r="1.5" fill="white"/>
        {/* Confident smile */}
        <path d="M44 62 Q60 76 76 62" stroke="#F39C12" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        {/* Shield badge */}
        <path d="M60 78 L55 82 L55 90 Q60 94 65 90 L65 82Z" fill="#E74C3C"/>
        <path d="M58 85 L60 88 L64 82" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Feet */}
        <ellipse cx="46" cy="118" rx="10" ry="6" fill="#F39C12"/>
        <ellipse cx="74" cy="118" rx="10" ry="6" fill="#F39C12"/>
      </svg>
    ),

  };
  return (mascots[id] as React.ReactElement) ?? null;
}

// ── SPOTLIGHT PANEL ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SpotlightPanel({ subject, meta, bottomRow }: {
  subject: typeof SUBJECTS[0];
  meta: { topics: string[]; fun: string };
  bottomRow: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: bottomRow ? 16 : -16, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.82 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      style={{
        position: "absolute",
        ...(bottomRow
          ? { bottom: "calc(100% + 16px)" }
          : { top: "calc(100% + 16px)" }),
        left: "50%",
        transform: "translateX(-50%)",
        width: 210,
        background: `linear-gradient(145deg, rgba(12,12,18,0.97) 0%, rgba(22,22,32,0.97) 100%)`,
        border: `2.5px solid ${subject.color}77`,
        borderRadius: 26,
        padding: "14px 16px 18px",
        zIndex: 300,
        boxShadow: `0 24px 64px rgba(0,0,0,0.9), 0 0 48px ${subject.color}44`,
        pointerEvents: "none",
        textAlign: "center",
        overflow: "visible",
      }}
    >
      {/* Arrow */}
      <div style={{
        position: "absolute",
        ...(bottomRow
          ? { bottom: -10, borderTop: `10px solid ${subject.color}77`, borderBottom: "none" }
          : { top: -10,    borderBottom: `10px solid ${subject.color}77`, borderTop: "none" }),
        left: "50%", transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
      }}/>

      {/* Bouncing cartoon mascot */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
      >
        <CartoonMascot id={subject.id} />
      </motion.div>

      {/* Subject name */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 500 }}
        style={{ fontSize: 22, fontWeight: 900, color: subject.color, lineHeight: 1, marginBottom: 6 }}
      >
        {subject.name}
      </motion.div>

      {/* Fun line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700, marginBottom: 14, lineHeight: 1.4 }}
      >
        {meta.fun}
      </motion.div>

      {/* Pulsing CTA */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [`0 0 14px ${subject.color}55`, `0 0 32px ${subject.color}aa`, `0 0 14px ${subject.color}55`],
        }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: subject.color, color: "#000",
          fontWeight: 900, fontSize: 15,
          borderRadius: 32, padding: "10px 28px",
          display: "inline-block",
          letterSpacing: 0.4,
        }}
      >
        Let's Go! <Rocket size={15} style={{verticalAlign:"middle",marginLeft:4}} />
      </motion.div>
    </motion.div>
  );
}

// ── MAIN ───────────────────────────────────────────────
export default function SubjectScreen({ profile, onSelect }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeSubject = SUBJECTS.find(s => s.id === activeId) ?? null;

  return (
    <div className="screen subj-screen">
      {/* Dim backdrop — click anywhere outside the card to close */}
      <AnimatePresence>
        {activeId && (
          <motion.div key="backdrop"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }}
            onClick={() => setActiveId(null)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)",
              backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
              zIndex:50, pointerEvents:"auto", cursor:"default" }}/>
        )}
      </AnimatePresence>

      {/* Subject info card — centered, above backdrop */}
      <AnimatePresence>
        {activeSubject && (
          <SubjectOverlay
            key={activeSubject.id}
            subject={activeSubject}
            meta={SUBJECT_META[activeSubject.id] ?? { topics:[], fun:"" }}
            onSelect={onSelect}
          />
        )}
      </AnimatePresence>

      <div className="subj-inner">
        <motion.div className="subj-header"
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className="subj-greeting">Gutpela moning, {profile.name}!</div>
          <div className="subj-title">What are you learning today?</div>
          <div className="subj-tok">Wanem subject yu laik lainim tude?</div>
        </motion.div>

        <div className="subj-cards">
          {SUBJECTS.map((s, i) => {
            const isActive = activeId === s.id;
            const isDimmed = activeId !== null && !isActive;
            return (
              <motion.button
                key={s.id}
                className="subj-card"
                style={{ "--sc":s.color, "--sh":s.shadow, position:"relative",
                  zIndex: isActive ? 200 : 1 } as React.CSSProperties}
                initial={{ opacity:0, scale:0.7 }}
                animate={{ opacity: isDimmed ? 0.15 : 1, scale:1 }}
                transition={{ delay: activeId ? 0 : i * 0.07, type:"spring", bounce:0.4 }}
                onClick={() => setActiveId(activeId === s.id ? null : s.id)}
              >
                <motion.div
                  className="sc-circle"
                  style={{ background:s.bg, borderColor: isActive ? s.color : "rgba(255,255,255,0.1)", position:"relative" }}
                  animate={isActive
                    ? { scale:1.22, boxShadow:`0 24px 64px rgba(0,0,0,0.8), 0 0 60px ${s.color}66` }
                    : { scale:1,    boxShadow:"0 6px 20px rgba(0,0,0,0.4)" }}
                  transition={{ type:"spring", stiffness:320, damping:20 }}
                >
                  <SubjectIllustration id={s.id} animate={isActive}/>
                  <div className="sc-name-inside" style={{ color:s.color }}>{s.name}</div>
                  <AnimatePresence>
                    {isActive && <Particles color={s.color}/>}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
