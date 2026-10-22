export function ClockFace({
  h,
  m,
  size = "lg",
}: {
  h: number;
  m: number;
  size?: "lg" | "sm";
}) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;
  const numbers = Array.from({ length: 12 }, (_, index) => {
    const n = index + 1;
    const angle = (n * Math.PI) / 6;
    return { n, x: 62 * Math.sin(angle), y: -62 * Math.cos(angle) };
  });
  const width = size === "lg" ? "w-[min(280px,72vw)]" : "w-[min(148px,30vw)]";

  return (
    <svg className={width} viewBox="-110 -110 220 220" aria-hidden="true">
      <circle r="107" fill="#ffb703" />
      <circle r="98" fill="#fffdf5" stroke="#264653" strokeWidth="3" />
      {Array.from({ length: 60 }, (_, index) => {
        const big = index % 5 === 0;
        return (
          <line
            key={index}
            x1="0"
            y1={big ? -84 : -88}
            x2="0"
            y2="-94"
            stroke="#264653"
            strokeWidth={big ? 3.5 : 1.6}
            strokeLinecap="round"
            transform={`rotate(${index * 6})`}
          />
        );
      })}
      {numbers.map((number) => (
        <text
          key={number.n}
          x={number.x.toFixed(1)}
          y={number.y.toFixed(1)}
          dy="0.36em"
          textAnchor="middle"
          fontSize="23"
          fontWeight="bold"
          fill="#1d3557"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {number.n}
        </text>
      ))}
      <line
        x1="0"
        y1="10"
        x2="0"
        y2="-46"
        stroke="#1d3557"
        strokeWidth="10"
        strokeLinecap="round"
        transform={`rotate(${hourAngle.toFixed(2)})`}
      />
      <line
        x1="0"
        y1="14"
        x2="0"
        y2="-82"
        stroke="#e63946"
        strokeWidth="4.5"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle})`}
      />
      <circle r="7.5" fill="#264653" />
      <circle r="2.5" fill="#fff" />
    </svg>
  );
}

export function ClockLegend() {
  return (
    <p className="text-center text-sm text-ink/80">
      <b className="text-ink">Short thick hand</b> = hours ·{" "}
      <b className="text-rose-700">Long thin hand</b> = minutes
    </p>
  );
}
