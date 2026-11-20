"use client";

import { useMemo } from "react";
import scene from "../../cloud/sceneData.json";
import { useLoopTime } from "./useLoopTime";
import styles from "./Thumbs.module.scss";

// ISOMETRIC BOARD: SCREEN POINT FOR BOARD COORDINATES (u, v) IN [0, 1]
const O = { x: 36, y: 110 };
const A = { x: 160, y: -44 };
const B = { x: 104, y: 46 };
const P = (u: number, v: number) => ({ x: O.x + u * A.x + v * B.x, y: O.y + u * A.y + v * B.y });

const CYCLE = 9;
const N = scene.grid;
const CELLS = 14;

// DOWNSAMPLE THE REAL CLOUD MASK + HEIGHT GRID (SAME DATA AS THE 3D SCENE) TO A FEW COLUMNS
function columns() {
  const out: { u: number; v: number; h: number; onTrack: boolean }[] = [];
  const step = N / CELLS;
  for (let r = 0; r < CELLS; r++) {
    for (let c = 0; c < CELLS; c++) {
      let frac = 0;
      let top = 0;
      for (let rr = 0; rr < step; rr++) {
        for (let cc = 0; cc < step; cc++) {
          const i = Math.floor(r * step + rr) * N + Math.floor(c * step + cc);
          frac += scene.frac[i] / 100;
          top = Math.max(top, scene.topKm[i]);
        }
      }
      frac /= step * step;
      if (frac < 0.45) continue;
      const u = (c + 0.5) / CELLS;
      const v = (r + 0.5) / CELLS;
      // THE TRACK RUNS ROUGHLY ALONG u = 0.27 + 0.47 v (MATCHES THE 3D SCENE'S DIAGONAL)
      const onTrack = Math.abs(u - (0.27 + 0.47 * v)) < 0.05;
      out.push({ u, v, h: 6 + top * 4.5, onTrack });
    }
  }
  // DRAW BACK TO FRONT
  return out.sort((a, b) => P(a.u, a.v).y - P(b.u, b.v).y);
}

export function CloudThumb() {
  const { ref, t } = useLoopTime<HTMLDivElement>(6.2);
  const cols = useMemo(columns, []);
  const phase = (t % CYCLE) / CYCLE;

  // TIMELINE: CURTAIN SWEEPS (0-35%), COLUMNS RISE (35-70%), HOLD, FADE (90-100%)
  const curtain = Math.min(1, phase / 0.35);
  const rise = Math.max(0, Math.min(1, (phase - 0.35) / 0.35));
  const fade = phase > 0.9 ? 1 - (phase - 0.9) / 0.1 : 1;

  const trackA = P(0.27, 0);
  const trackB = P(0.74, 1);
  const K = 34;

  return (
    <div ref={ref} className={styles.thumb} aria-hidden>
      <svg viewBox="0 0 320 180">
        {/* BOARD EDGE, THEN THE REAL GOES IMAGE MAPPED ONTO THE ISOMETRIC BOARD */}
        <polygon
          points={[P(0, 0), P(1, 0), P(1, 1), P(0, 1)].map((p) => `${p.x},${p.y + 5}`).join(" ")}
          fill="#0f172a"
          opacity={0.6}
        />
        <image
          href="/images/nasa/cloud/board.webp"
          width={100}
          height={100}
          preserveAspectRatio="none"
          transform={`matrix(${A.x / 100} ${A.y / 100} ${B.x / 100} ${B.y / 100} ${O.x} ${O.y})`}
        />

        <g opacity={fade}>
          {/* CLOUDSAT TRACK AND ITS CURTAIN, SWEEPING IN */}
          <line
            x1={trackA.x}
            y1={trackA.y}
            x2={trackA.x + (trackB.x - trackA.x) * curtain}
            y2={trackA.y + (trackB.y - trackA.y) * curtain}
            stroke="var(--th-mark)"
            strokeWidth="2"
          />
          {Array.from({ length: K }, (_, k) => {
            const s = k / (K - 1);
            if (s > curtain) return null;
            const base = { x: trackA.x + (trackB.x - trackA.x) * s, y: trackA.y + (trackB.y - trackA.y) * s };
            const dens = 0.5 + 0.5 * Math.sin(k * 0.9) * Math.cos(k * 0.37);
            const h = 18 + dens * 22;
            return (
              <g key={k}>
                <rect x={base.x - 1.6} y={base.y - 48} width={3.2} height={48} fill="var(--th-faint)" />
                <rect x={base.x - 1.6} y={base.y - h} width={3.2} height={h * 0.55} fill="var(--th-accent)" opacity={0.35 + dens * 0.6} />
              </g>
            );
          })}

          {/* CLOUD COLUMNS RISING FROM THE BOARD: KNOWN ON THE TRACK, PREDICTED ELSEWHERE */}
          {cols.map((c, k) => {
            const p = P(c.u, c.v);
            const h = c.h * rise;
            if (h < 0.5) return null;
            return (
              <rect
                key={k}
                x={p.x - 2.6}
                y={p.y - h}
                width={5.2}
                height={h}
                rx={1}
                fill={c.onTrack ? "#ffffff" : "var(--th-accent)"}
                opacity={c.onTrack ? 0.95 : 0.55}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
