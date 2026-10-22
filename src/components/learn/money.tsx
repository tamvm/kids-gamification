"use client";

import { useId } from "react";

import { moneySpoken } from "@/lib/learn/money-format";

const COIN_MM: Record<number, number> = {
  5: 19.4,
  10: 23.6,
  20: 28.5,
  50: 31.6,
  100: 25,
  200: 20.5,
};

const NOTE: Record<number, { mm: number; c1: string; c2: string; ink: string }> = {
  500: { mm: 130, c1: "#e98fd3", c2: "#9b4f96", ink: "#3d0f3a" },
  1000: { mm: 137, c1: "#5aa9e6", c2: "#1f5fa8", ink: "#0b2d55" },
  2000: { mm: 144, c1: "#f4845f", c2: "#c0392b", ink: "#4a0e05" },
  5000: { mm: 151, c1: "#ffd84d", c2: "#d9a400", ink: "#4a3500" },
  10000: { mm: 158, c1: "#6fcf8f", c2: "#2e7d4f", ink: "#0b3a20" },
};

const SCALE = { sm: 2.1, md: 3, lg: 3.4 } as const;

export function MoneyFace({
  cents,
  size = "md",
}: {
  cents: number;
  size?: keyof typeof SCALE;
}) {
  const id = useId().replace(/:/g, "");
  const label = moneySpoken(cents);
  if (cents <= 200) return <Coin cents={cents} size={size} gradientId={id} label={label} />;
  return <Note cents={cents} size={size} label={label} />;
}

function Coin({
  cents,
  size,
  gradientId,
  label,
}: {
  cents: number;
  size: keyof typeof SCALE;
  gradientId: string;
  label: string;
}) {
  const gold = cents >= 100;
  const diameter = Math.round((COIN_MM[cents] ?? 24) * SCALE[size]);
  const text = cents < 100 ? `${cents}c` : `$${cents / 100}`;
  const fill = gold ? `url(#gold-${gradientId})` : `url(#silver-${gradientId})`;
  const edge = gold ? "#9a6f00" : "#6f7783";
  const ink = gold ? "#5a3d00" : "#262a30";
  const points = (radius: number) =>
    Array.from({ length: 12 }, (_, index) => {
      const angle = ((index * 30 + 15) * Math.PI) / 180;
      return `${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`;
    }).join(" ");

  return (
    <svg
      className="drop-shadow"
      width={diameter}
      height={diameter}
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={`silver-${gradientId}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#d9dde3" />
          <stop offset="100%" stopColor="#9aa1ab" />
        </radialGradient>
        <radialGradient id={`gold-${gradientId}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff4b8" />
          <stop offset="45%" stopColor="#f2c84b" />
          <stop offset="100%" stopColor="#b8860b" />
        </radialGradient>
      </defs>
      {cents === 50 ? (
        <>
          <polygon points={points(48)} fill={fill} stroke={edge} strokeWidth="2.5" />
          <polygon points={points(41)} fill="none" stroke={edge} strokeWidth="1.2" opacity="0.6" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="48" fill={fill} stroke={edge} strokeWidth="2.5" />
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="none"
            stroke={edge}
            strokeWidth="1.5"
            strokeDasharray="2 2.5"
            opacity="0.6"
          />
        </>
      )}
      <text
        x="50"
        y="50"
        dy="0.35em"
        textAnchor="middle"
        fontSize={text.length <= 2 ? 38 : 30}
        fontWeight="bold"
        fill={ink}
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {text}
      </text>
    </svg>
  );
}

function Note({
  cents,
  size,
  label,
}: {
  cents: number;
  size: keyof typeof SCALE;
  label: string;
}) {
  const note = NOTE[cents] ?? NOTE[500];
  const scale = size === "lg" ? 1.15 : size === "sm" ? 0.72 : 0.9;
  const width = Math.round(note.mm * scale);
  const height = Math.round(65 * scale);
  const dollars = cents / 100;
  return (
    <svg
      className="drop-shadow"
      width={width}
      height={height}
      viewBox={`0 0 ${note.mm} 65`}
      role="img"
      aria-label={label}
    >
      <rect x="1" y="1" width={note.mm - 2} height="63" rx="5" fill={note.c1} stroke={note.c2} strokeWidth="2" />
      <rect x="8" y="10" width="22" height="45" rx="4" fill="#ffffff" opacity="0.6" stroke={note.c2} />
      <circle cx={note.mm * 0.46} cy="33" r="18" fill={note.c2} opacity="0.22" />
      <text
        x={note.mm * 0.46}
        y="33"
        dy="0.35em"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill={note.ink}
        fontFamily="Arial, Helvetica, sans-serif"
      >
        ${dollars}
      </text>
      <text
        x={note.mm * 0.46}
        y="58"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1.4"
        fill={note.ink}
        fontFamily="Arial, Helvetica, sans-serif"
      >
        AUSTRALIA
      </text>
    </svg>
  );
}
