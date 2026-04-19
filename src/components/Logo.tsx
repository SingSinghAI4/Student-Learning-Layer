import React from "react";

interface LogoProps {
  height?: number;
  showText?: boolean;
}

export default function Logo({ height = 56, showText = true }: LogoProps) {
  const id = React.useRef(`logo-${Math.random().toString(36).slice(2, 8)}`).current;
  const birdSize = height;
  const textW = showText ? height * 3.4 : 0;
  const totalW = birdSize + (showText ? 14 + textW : 0);

  const gradId    = `${id}-grad`;
  const textGId   = `${id}-tgrad`;
  const filterId  = `${id}-inv`;
  const maskId    = `${id}-mask`;

  return (
    <svg
      width={totalW}
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SingSinghAI LiteHaus logo"
    >
      <defs>
        {/* Gold gradient matching SingSinghAI text colour */}
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C8860A" />
          <stop offset="50%"  stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#FFF0A0" />
        </linearGradient>

        <linearGradient id={textGId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7FFFD4" />
          <stop offset="100%" stopColor="#FFE84D" />
        </linearGradient>

        {/*
          Invert the RGB channels so the black bird silhouette becomes white
          (SVG mask: white = show, black = hide).
          Works whether the PNG background is white OR transparent.
        */}
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
          />
        </filter>

        <mask id={maskId}>
          <image
            href="/bird-of-paradise.png"
            x="0" y="0"
            width={birdSize} height={birdSize}
            filter={`url(#${filterId})`}
          />
        </mask>
      </defs>

      {/* Bird silhouette filled with gradient via mask */}
      <rect
        x="0" y="0"
        width={birdSize} height={birdSize}
        fill={`url(#${gradId})`}
        mask={`url(#${maskId})`}
        filter="drop-shadow(0 0 16px rgba(255,217,61,0.9)) drop-shadow(0 0 32px rgba(255,217,61,0.4))"
      />

      {showText && (
        <>
          <text
            x={birdSize + 14}
            y={height * 0.46}
            fontFamily="'Baloo 2', cursive"
            fontSize={height * 0.42}
            fontWeight="800"
            fill={`url(#${textGId})`}
            letterSpacing="-0.5"
          >
            SingSinghAI
          </text>
          <text
            x={birdSize + 14}
            y={height * 0.85}
            fontFamily="'Nunito', sans-serif"
            fontSize={height * 0.25}
            fontWeight="600"
            fill="rgba(255,255,255,0.45)"
          >
            · LiteHaus
          </text>
        </>
      )}
    </svg>
  );
}
