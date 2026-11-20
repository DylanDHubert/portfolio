"use client";

import series from "./sunSeries.json";
import { useLoopTime } from "./useLoopTime";
import styles from "./Thumbs.module.scss";

// REAL SDO/HMI INTENSITYGRAMS, 18-22 APRIL 2024, ONE FRAME EVERY 2.5 HOURS, PLAYED AS A TIME-LAPSE.
// THE LINE IS MEASURED FROM THE SAME FRAMES (scripts/solar/build_thumb.py).
const FRAME_SECONDS = 0.16;
const N = series.count;
const SIZE = series.frame;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// FRAME i IS 2.5 H AFTER THE FIRST ONE (18 APRIL 2024, 00:00 UT)
function stamp(i: number) {
  const hours = i * 2.5;
  const day = 18 + Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  const m = Math.round((hours % 1) * 60);
  return `${MONTHS[3]} ${day} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SolarThumb() {
  const { ref, t } = useLoopTime<HTMLDivElement>(17 * FRAME_SECONDS);
  const i = Math.floor(t / FRAME_SECONDS) % N;

  // SCALE THE MEASURED DIMMING TO THE PLOT; MORE DIMMING DRAWS LOWER, LIKE A TSI DIP
  const lo = Math.min(...series.dim);
  const hi = Math.max(...series.dim);
  const X0 = 178;
  const X1 = 300;
  const Y0 = 50;
  const Y1 = 112;
  const x = (k: number) => X0 + (k / (N - 1)) * (X1 - X0);
  const y = (k: number) => Y0 + ((series.dim[k] - lo) / (hi - lo)) * (Y1 - Y0);
  const line = series.dim.map((_, k) => `${x(k).toFixed(1)},${y(k).toFixed(1)}`).join(" ");
  const past = series.dim.slice(0, i + 1).map((_, k) => `${x(k).toFixed(1)},${y(k).toFixed(1)}`).join(" ");

  return (
    <div ref={ref} className={styles.thumb} aria-hidden>
      <svg viewBox="0 0 320 180">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="62%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={88} cy={90} r={82} fill="url(#sunGlow)" />

        <text x={X0} y={32} fontSize="10.5" fill="var(--th-dim)" fontFamily="monospace">
          sunspot dimming
        </text>
        <polyline points={line} fill="none" stroke="var(--th-faint)" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={past} fill="none" stroke="var(--th-accent)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={x(i)} x2={x(i)} y1={Y0 - 8} y2={Y1 + 8} stroke="var(--th-faint)" />
        <circle cx={x(i)} cy={y(i)} r="7.5" fill="var(--th-accent-soft)" />
        <circle cx={x(i)} cy={y(i)} r="3.8" fill="var(--th-accent)" />
        <text x={X0} y={136} fontSize="10.5" fill="var(--th-ink)" fontFamily="monospace">
          {stamp(i)} UT
        </text>
        <text x={X0} y={152} fontSize="9" fill="var(--th-dim)" fontFamily="monospace">
          real SDO/HMI images, 2024
        </text>
      </svg>
      {/* THE REAL SUN: ONE CELL OF THE SPRITE AS A BACKGROUND, CLIPPED TO THE DISK (NO BLACK SKY) */}
      <div
        className={styles.sun}
        style={{
          backgroundImage: "url(/images/nasa/sun_sprite.webp)",
          backgroundSize: `${N * 100}% 100%`,
          backgroundPosition: `${(i / (N - 1)) * 100}% 0`,
        }}
      />
    </div>
  );
}
