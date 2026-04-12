import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PROVINCE_DATA, CULTURAL_REGIONS } from "../data";
import BeniCharacter from "./BeniCharacter";

type Lang = "tok" | "en";

interface ProvincePoint {
  id: string;
  name: string;
  shortLabel?: string;
  mapX: number;
  mapY: number;
  region: keyof typeof CULTURAL_REGIONS;
}

interface Props {
  homeProvinceId?: string;
  currentProvinceId?: string;
  unlockedProvinceIds: string[];
  lang?: Lang;
  onProvinceSelect?: (provinceId: string) => void;
}

const PNG_PATH =
  "M 35,55 C 58,40 92,27 128,23 C 164,19 196,21 225,30 C 254,39 272,39 292,37 " +
  "L 310,43 C 322,52 335,63 344,78 C 353,92 364,108 370,124 " +
  "C 374,140 370,157 362,172 C 356,184 350,196 354,212 " +
  "C 358,228 367,248 370,264 C 371,272 367,278 360,277 " +
  "C 350,272 338,262 325,258 C 310,255 296,258 280,265 " +
  "C 262,271 240,275 218,274 C 195,273 170,267 145,260 " +
  "C 118,253 94,248 70,243 C 50,239 34,232 30,218 " +
  "C 26,202 27,175 29,148 C 31,120 33,90 35,65 Z";

const MANUS_PATH =
  "M 278,10 C 290,6 306,6 318,11 C 326,16 326,24 318,28 C 306,33 290,33 278,28 C 270,24 270,16 278,10 Z";

const NEW_BRITAIN_PATH =
  "M 378,132 C 395,122 415,118 435,124 C 450,130 458,144 455,158 " +
  "C 451,172 436,180 416,177 C 394,174 378,164 376,150 Z";

const NEW_IRELAND_PATH =
  "M 428,88 C 438,80 452,79 460,86 C 466,93 466,106 458,114 " +
  "C 448,124 434,125 426,117 C 418,109 418,96 428,88 Z";

const BOUGAINVILLE_PATH =
  "M 468,100 C 478,92 492,92 500,100 C 508,108 507,124 498,132 " +
  "C 487,141 472,140 464,132 C 456,123 456,108 468,100 Z";

const KEY_LABELS: Record<string, string> = {
  ncd: "NCD",
  morobe: "Morobe",
  eastern_highlands: "E. Highlands",
  manus: "Manus",
  milne_bay: "Milne Bay",
};

function normalizeProvinceData(data: any[]): ProvincePoint[] {
  return data.map((p) => ({
    id: p.id ?? p.name?.toLowerCase().replace(/\./g, "").replace(/\s+/g, "_"),
    name: p.name,
    shortLabel: p.shortLabel,
    mapX: p.mapX,
    mapY: p.mapY,
    region: p.region,
  }));
}

export default function PNGJourneyMapSimple({
  homeProvinceId,
  currentProvinceId,
  unlockedProvinceIds,
  lang = "tok",
  onProvinceSelect,
}: Props) {
  const reduceMotion = useReducedMotion();
  const provinces = React.useMemo(
    () => normalizeProvinceData(PROVINCE_DATA),
    [],
  );
  const unlockedSet = React.useMemo(
    () => new Set(unlockedProvinceIds),
    [unlockedProvinceIds],
  );

  const homeData = provinces.find((p) => p.id === homeProvinceId);
  const currentData =
    provinces.find((p) => p.id === currentProvinceId) ?? homeData;

  const beniLeft = currentData ? `${(currentData.mapX / 520) * 100}%` : "50%";
  const beniTop = currentData ? `${(currentData.mapY / 300) * 100}%` : "50%";

  const labelText = {
    tok: {
      home: "Haus",
      next: "Neks",
      done: "Pinis",
      map: "Map bilong PNG",
    },
    en: {
      home: "Home",
      next: "Next",
      done: "Done",
      map: "PNG map",
    },
  }[lang];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 18,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, rgba(13,63,102,0.95) 0%, rgba(4,20,42,1) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <svg
        viewBox="0 0 520 300"
        role="img"
        aria-label={labelText.map}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient
            id="mapFillSimple"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1f7a4d" />
            <stop offset="100%" stopColor="#184f35" />
          </linearGradient>

          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x={0} y={0} width={520} height={300} fill="transparent" />

        <path
          d={PNG_PATH}
          fill="url(#mapFillSimple)"
          stroke="rgba(110,255,177,0.35)"
          strokeWidth={1.5}
        />
        <path
          d={MANUS_PATH}
          fill="#245c3f"
          stroke="rgba(110,255,177,0.25)"
          strokeWidth={1}
        />
        <path
          d={NEW_BRITAIN_PATH}
          fill="#2a355f"
          stroke="rgba(177,128,255,0.35)"
          strokeWidth={1.2}
        />
        <path
          d={NEW_IRELAND_PATH}
          fill="#2a355f"
          stroke="rgba(177,128,255,0.35)"
          strokeWidth={1.2}
        />
        <path
          d={BOUGAINVILLE_PATH}
          fill="#2a355f"
          stroke="rgba(177,128,255,0.35)"
          strokeWidth={1.2}
        />

        {currentData && homeData && currentData.id !== homeData.id && (
          <line
            x1={homeData.mapX}
            y1={homeData.mapY}
            x2={currentData.mapX}
            y2={currentData.mapY}
            stroke="rgba(255,217,61,0.45)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="6 8"
          />
        )}

        {provinces.map((p) => {
          const isHome = p.id === homeProvinceId;
          const isCurrent = p.id === currentProvinceId;
          const isUnlocked = unlockedSet.has(p.id);
          const isKeyLabel = Boolean(KEY_LABELS[p.id]) || isHome || isCurrent;

          let fill = "rgba(255,255,255,0.24)";
          if (isUnlocked) fill = "rgba(255,255,255,0.78)";
          if (isHome) fill = "#FFD93D";
          if (isCurrent) fill = "#FFE98A";

          return (
            <g key={p.id}>
              <g
                role="button"
                tabIndex={0}
                aria-label={p.name}
                onClick={() => onProvinceSelect?.(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onProvinceSelect?.(p.id);
                  }
                }}
                style={{ cursor: onProvinceSelect ? "pointer" : "default" }}
              >
                {(isHome || isCurrent) && (
                  <motion.circle
                    cx={p.mapX}
                    cy={p.mapY}
                    r={11}
                    fill="none"
                    stroke="#FFD93D"
                    strokeWidth={1.5}
                    filter="url(#softGlow)"
                    animate={
                      reduceMotion
                        ? { opacity: 0.65 }
                        : { scale: [1, 1.18, 1], opacity: [0.7, 0.28, 0.7] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 1.8, repeat: Infinity, ease: "easeOut" }
                    }
                    style={{ transformOrigin: `${p.mapX}px ${p.mapY}px` }}
                  />
                )}

                <motion.circle
                  cx={p.mapX}
                  cy={p.mapY}
                  r={isHome || isCurrent ? 6.5 : 5}
                  fill={fill}
                  filter={isHome || isCurrent ? "url(#softGlow)" : undefined}
                  animate={
                    reduceMotion || (!isHome && !isCurrent)
                      ? undefined
                      : { scale: [1, 1.05, 1] }
                  }
                  transition={
                    reduceMotion || (!isHome && !isCurrent)
                      ? undefined
                      : { duration: 1.6, repeat: Infinity }
                  }
                  style={{ transformOrigin: `${p.mapX}px ${p.mapY}px` }}
                />

                {(isHome || isCurrent) && (
                  <circle cx={p.mapX} cy={p.mapY} r={2.2} fill="#fff" />
                )}
              </g>

              {isKeyLabel && (
                <>
                  <rect
                    x={p.mapX - 24}
                    y={p.mapY + 8}
                    width={48}
                    height={16}
                    rx={8}
                    fill="rgba(7,18,34,0.86)"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <text
                    x={p.mapX}
                    y={p.mapY + 19}
                    textAnchor="middle"
                    fontSize={8.8}
                    fontWeight={700}
                    fill={
                      isHome || isCurrent ? "#FFD93D" : "rgba(255,255,255,0.92)"
                    }
                    fontFamily="'Nunito', sans-serif"
                  >
                    {KEY_LABELS[p.id] || p.shortLabel || p.name}
                  </text>
                </>
              )}
            </g>
          );
        })}

        <text
          x={18}
          y={24}
          fontSize={10}
          fontWeight={800}
          fill="rgba(255,255,255,0.9)"
          fontFamily="'Nunito', sans-serif"
        >
          {lang === "tok" ? "Bihainim rot bilong yu" : "Follow your journey"}
        </text>

        <text
          x={18}
          y={38}
          fontSize={7.5}
          fill="rgba(255,255,255,0.62)"
          fontFamily="'Nunito', sans-serif"
        >
          {lang === "tok"
            ? "Wanpela ples tasol long lukim taim"
            : "Show one place at a time"}
        </text>
      </svg>

      {currentData && (
        <div
          style={{
            position: "absolute",
            left: beniLeft,
            top: beniTop,
            transform: "translate(-50%, -115%)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            style={{
              width: 34,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BeniCharacter state="excited" size={34} />
          </motion.div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(7,18,34,0.85)",
            color: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {labelText.home}: {homeData?.name ?? "—"}
        </div>

        {currentData && (
          <div
            style={{
              background: "rgba(7,18,34,0.85)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {labelText.next}: {currentData.name}
          </div>
        )}
      </div>
    </div>
  );
}
