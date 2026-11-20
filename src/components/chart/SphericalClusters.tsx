"use client";

import { useMemo, useState } from "react";
import shared from "../solar/Solar.module.scss";
import styles from "./ChartViz.module.scss";

// 2D STAND-IN FOR THE HYPERSPHERE: EACH EMBEDDING IS A DIRECTION, I.E. AN ANGLE ON A CIRCLE
const N = 260;
const MAX_DEPTH = 4;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

// POINTS FROM A FEW "TOPICS": CLUMPS OF DIRECTIONS WITH DIFFERENT WIDTHS
function makeAngles(): number[] {
  const r = rng(2024);
  const topics = [0.3, 1.25, 2.0, 2.9, 4.1, 5.2].map((c) => ({ c, w: 0.12 + r() * 0.25 }));
  return Array.from({ length: N }, () => {
    const t = topics[Math.floor(r() * topics.length)];
    // SUM OF UNIFORMS ~ GAUSSIAN SPREAD AROUND THE TOPIC DIRECTION
    const g = (r() + r() + r() - 1.5) * 1.15;
    return t.c + g * t.w;
  });
}

const dir = (a: number) => [Math.cos(a), Math.sin(a)] as const;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

interface Cluster {
  idx: number[];
  mean: [number, number]; // RAW MEAN OF UNIT VECTORS (INSIDE THE CIRCLE)
  angle: number; // NORMALIZED MEAN DIRECTION = THE CENTROID
}

function summarize(angles: number[], idx: number[]): Cluster {
  let x = 0;
  let y = 0;
  for (const i of idx) {
    const [c, s] = dir(angles[i]);
    x += c;
    y += s;
  }
  x /= idx.length;
  y /= idx.length;
  return { idx, mean: [x, y], angle: Math.atan2(y, x) };
}

// SPHERICAL 2-MEANS: ASSIGN BY COSINE SIMILARITY, CENTROID = NORMALIZED MEAN DIRECTION
function split(angles: number[], idx: number[]): Cluster[] {
  if (idx.length < 4) return [summarize(angles, idx)];
  const sorted = [...idx].sort((a, b) => angles[a] - angles[b]);
  let c = [angles[sorted[Math.floor(sorted.length * 0.25)]], angles[sorted[Math.floor(sorted.length * 0.75)]]];
  let groups: number[][] = [[], []];
  for (let it = 0; it < 25; it++) {
    groups = [[], []];
    for (const i of idx) groups[Math.cos(angles[i] - c[0]) >= Math.cos(angles[i] - c[1]) ? 0 : 1].push(i);
    if (!groups[0].length || !groups[1].length) return [summarize(angles, idx)];
    c = groups.map((g) => summarize(angles, g).angle);
  }
  return groups.map((g) => summarize(angles, g));
}

export function SphericalClusters() {
  const angles = useMemo(makeAngles, []);
  // LEVELS[d] = CLUSTERS AFTER d RECURSIVE SPLITS (LEVEL 0 = EVERYTHING)
  const levels = useMemo(() => {
    const out: Cluster[][] = [[summarize(angles, angles.map((_, i) => i))]];
    for (let d = 1; d <= MAX_DEPTH; d++) out.push(out[d - 1].flatMap((cl) => split(angles, cl.idx)));
    return out;
  }, [angles]);
  const [depth, setDepth] = useState(1);
  const clusters = levels[depth];

  const S = 400;
  const C = S / 2;
  const R = 150;
  // SITE PALETTE: HUE RUNS CYAN (190) -> VIOLET (265) -> RED (355) AROUND THE CIRCLE
  const color = (a: number) => {
    const t = (((a / (2 * Math.PI)) % 1) + 1) % 1;
    const f = t < 0.5 ? t * 2 : (1 - t) * 2;
    return `hsl(${190 + f * 165} 72% 56%)`;
  };
  const owner = new Map<number, Cluster>();
  clusters.forEach((cl) => cl.idx.forEach((i) => owner.set(i, cl)));

  // ARC COVERING A CLUSTER: SPAN OF ITS MEMBERS AROUND THE CENTROID DIRECTION
  const arcPath = (cl: Cluster, r: number) => {
    const rel = cl.idx.map((i) => wrap(angles[i] - cl.angle));
    // TRIM THE ENDS SLIGHTLY SO NEIGHBORING REGIONS STAY VISUALLY SEPARATE
    const a0 = cl.angle + Math.min(...rel) + 0.015;
    const a1 = Math.max(a0 + 0.02, cl.angle + Math.max(...rel) - 0.015);
    const [x0, y0] = dir(a0);
    const [x1, y1] = dir(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${C + x0 * r},${C - y0 * r} A${r},${r} 0 ${large} 0 ${C + x1 * r},${C - y1 * r}`;
  };

  return (
    <figure className={`${shared.figure} ${styles.themed}`}>
      <div className={shared.segmented} role="tablist" aria-label="Tree depth">
        {[1, 2, 3, 4].map((d) => (
          <button key={d} role="tab" aria-selected={depth === d} className={depth === d ? shared.segActive : shared.seg} onClick={() => setDepth(d)}>
            {2 ** d} regions
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${S} ${S}`} className={styles.ringSvg} role="img" aria-label={`Embeddings split into ${clusters.length} angular regions`}>
        <circle cx={C} cy={C} r={R} className={styles.ring} />
        <circle cx={C} cy={C} r={3} className={styles.origin} />
        {clusters.map((cl, k) => (
          <path key={`arc${k}`} d={arcPath(cl, R + 22)} className={styles.cap} style={{ stroke: color(cl.angle) }} />
        ))}
        {angles.map((a, i) => {
          const [x, y] = dir(a);
          // SMALL RADIAL JITTER ONLY SO OVERLAPPING POINTS STAY VISIBLE
          const j = R + ((i * 37) % 11) - 5;
          return <circle key={i} cx={C + x * j} cy={C - y * j} r={2.4} style={{ fill: color(owner.get(i)?.angle ?? 0) }} className={styles.pt} />;
        })}
        {clusters.map((cl, k) => {
          const [x, y] = dir(cl.angle);
          return (
            <g key={`c${k}`}>
              <line x1={C} y1={C} x2={C + x * (R + 22)} y2={C - y * (R + 22)} className={styles.spoke} />
              <circle cx={C + cl.mean[0] * R} cy={C - cl.mean[1] * R} r={3.2} className={styles.rawMean} />
              <circle cx={C + x * (R + 22)} cy={C - y * (R + 22)} r={5} className={styles.centroid} style={{ fill: color(cl.angle) }} />
            </g>
          );
        })}
      </svg>

      <div className={styles.legend}>
        <span><i className={styles.lgArc} /> region (arc of directions)</span>
        <span><i className={styles.lgCentroid} /> centroid direction</span>
        <span><i className={styles.lgMean} /> raw mean (inside the circle)</span>
      </div>
      <p className={shared.caption}>
        Each split uses cosine similarity, so every region is an arc of directions: the 2D version of a spherical cap.
        The plain average of unit vectors falls inside the circle; normalizing it gives the centroid direction that
        represents the region in the tree.
      </p>
      <p className={shared.disclaimer}>
        Synthetic 2D data with six topic clumps. Real embeddings have hundreds of dimensions; the geometry is the same
        idea on a higher-dimensional sphere.
      </p>
    </figure>
  );
}
