"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "./Solar.module.scss";

// BRANCH DETERMINES THE COLOR OF EACH BLOCK
type Branch = "source" | "spatial" | "temporal" | "merge";

interface NodeDef {
  id: string;
  title: string;
  sub: string;
  branch: Branch;
  x: number;
  y: number;
  w: number;
  detail: string;
}

interface EdgeDef {
  from: string;
  to: string;
  label?: string;
  // HORIZONTAL OFFSET WHERE THE EDGE LANDS ON THE TARGET BLOCK
  toDx?: number;
}

const BOX_H = 56;
const VIEW_W = 480;
const VIEW_H = 690;

const NODES: NodeDef[] = [
  {
    id: "src", title: "HMI image sequence", sub: "SDO · grayscale frames", branch: "source",
    x: 120, y: 12, w: 240,
    detail: "Full-disk images of the Sun from the Helioseismic and Magnetic Imager on NASA's Solar Dynamics Observatory, taken at a steady cadence. Both branches start here.",
  },
  {
    id: "pre", title: "Preprocess", sub: "high-pass · blur · threshold ×2", branch: "spatial",
    x: 16, y: 104, w: 212,
    detail: "A hand-tuned OpenCV filter: high-pass, blur, magnitude, and two thresholds. It removes the granulated surface and keeps only regions of high information density: sunspots and faculae.",
  },
  {
    id: "cnn", title: "CNN", sub: "Conv3D blocks · 1 → 1024 ch", branch: "spatial",
    x: 16, y: 192, w: 212,
    detail: "Plain Conv3D → ReLU → MaxPool → BatchNorm blocks, growing channels 1 → 32 → 64 → 128 → 1024. No residuals or attention; its only job is turning images into features.",
  },
  {
    id: "pool", title: "Global pooling", sub: "1024 features per step", branch: "spatial",
    x: 16, y: 280, w: 212,
    detail: "Collapses each feature map to a single number, giving a batch_size × 1024 vector the Informer can consume alongside the time-series features.",
  },
  {
    id: "avg", title: "Disk average", sub: "one value per frame", branch: "temporal",
    x: 252, y: 104, w: 212,
    detail: "Reduces each image to a summary signal over time. This is the kind of input the lab's baseline was built on.",
  },
  {
    id: "ssa", title: "SSA", sub: "10 signals", branch: "temporal",
    x: 252, y: 192, w: 102,
    detail: "Singular Spectrum Analysis splits the signal into sub-signals: trends, cycles, and noise. The baseline merged them into 3; here all 10 are kept and the model learns how to weigh them.",
  },
  {
    id: "stats", title: "Stats", sub: "6 features", branch: "temporal",
    x: 362, y: 192, w: 102,
    detail: "Six statistical features per timestep, including mean, median, mode, and a temporal count.",
  },
  {
    id: "cat", title: "Concatenate", sub: "1024 + 10 + 6 = 1040", branch: "merge",
    x: 120, y: 384, w: 240,
    detail: "Image features and time-series features are joined into one 1040-dimensional vector per timestep. Space meets time here.",
  },
  {
    id: "mlp", title: "MLP projection", sub: "1040 → d_model", branch: "merge",
    x: 120, y: 464, w: 240,
    detail: "A small multilayer perceptron squeezes the combined vector down to the Informer's working width, d_model.",
  },
  {
    id: "inf", title: "Informer", sub: "seq_len · label_len · pred_len", branch: "merge",
    x: 120, y: 544, w: 240,
    detail: "A transformer built for long sequences. It reads seq_len steps of history, gets label_len known target values as a starting point, and predicts pred_len future steps all at once rather than one at a time.",
  },
  {
    id: "out", title: "TSI perturbation", sub: "forecast · W/m²", branch: "merge",
    x: 120, y: 624, w: 240,
    detail: "The prediction: TSI − 1362 W/m², the variation in solar energy reaching Earth.",
  },
];

const EDGES: EdgeDef[] = [
  { from: "src", to: "pre" },
  { from: "src", to: "avg" },
  { from: "pre", to: "cnn" },
  { from: "cnn", to: "pool" },
  { from: "avg", to: "ssa" },
  { from: "avg", to: "stats" },
  { from: "pool", to: "cat", label: "1024", toDx: -70 },
  { from: "ssa", to: "cat", label: "10", toDx: 40 },
  { from: "stats", to: "cat", label: "6", toDx: 90 },
  { from: "cat", to: "mlp", label: "1040" },
  { from: "mlp", to: "inf", label: "d_model" },
  { from: "inf", to: "out", label: "pred_len" },
];

const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));

// WALK THE GRAPH IN ONE DIRECTION TO COLLECT EVERY CONNECTED BLOCK
function reach(start: string, dir: "up" | "down"): Set<string> {
  const seen = new Set<string>([start]);
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop() as string;
    for (const e of EDGES) {
      const next = dir === "down" ? (e.from === cur ? e.to : null) : (e.to === cur ? e.from : null);
      if (next && !seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

function edgePath(e: EdgeDef): string {
  const a = BY_ID[e.from];
  const b = BY_ID[e.to];
  const x1 = a.x + a.w / 2;
  const y1 = a.y + BOX_H;
  const x2 = b.x + b.w / 2 + (e.toDx ?? 0);
  const y2 = b.y;
  const my = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
}

export function SolarArchitecture() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = hovered ?? selected;

  // EVERYTHING UPSTREAM AND DOWNSTREAM OF THE FOCUSED BLOCK STAYS LIT
  const lit = useMemo(() => {
    if (!focus) return null;
    const up = reach(focus, "up");
    const down = reach(focus, "down");
    return new Set([...up, ...down]);
  }, [focus]);

  const active = selected ? BY_ID[selected] : null;

  // ESCAPE CLOSES THE POPOVER
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // ANCHOR THE POPOVER TO THE BLOCK: BELOW IT IN THE TOP HALF, ABOVE IT IN THE BOTTOM HALF
  const popStyle = active
    ? (() => {
        const cx = ((active.x + active.w / 2) / VIEW_W) * 100;
        const below = active.y < VIEW_H * 0.5;
        const top = ((below ? active.y + BOX_H + 8 : active.y - 8) / VIEW_H) * 100;
        return {
          left: `clamp(0px, calc(${cx}% - min(160px, 50%)), calc(100% - min(320px, 100%)))`,
          top: `${top}%`,
          transform: below ? "none" : "translateY(-100%)",
        } as React.CSSProperties;
      })()
    : undefined;

  return (
    <figure className={styles.figure}>
      <div className={styles.legend}>
        <span><i className={styles.swatchSpatial} /> Spatial branch (what the Sun looks like)</span>
        <span><i className={styles.swatchTemporal} /> Temporal branch (how the signal moves)</span>
      </div>
      <p className={styles.hint}>Tap a block to see what it does and trace where its data goes.</p>
      <div className={styles.archWrap}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className={styles.archSvg}
        role="group"
        aria-label="CNN-Informer architecture diagram"
        onClick={(ev) => {
          // CLICKING EMPTY SPACE CLOSES THE POPOVER
          if (ev.target === ev.currentTarget) setSelected(null);
        }}
      >
        {EDGES.map((e) => {
          const on = !lit || (lit.has(e.from) && lit.has(e.to));
          const d = edgePath(e);
          const b = BY_ID[e.to];
          const lx = b.x + b.w / 2 + (e.toDx ?? 0);
          return (
            <g key={`${e.from}-${e.to}`} className={on ? styles.edgeOn : styles.edgeOff}>
              <path d={d} className={styles.edge} />
              <path d={d} className={styles.edgeFlow} />
              {e.label && (
                <text x={lx + 6} y={b.y - 8} className={styles.edgeLabel}>
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {NODES.map((n) => {
          const on = !lit || lit.has(n.id);
          const isSel = selected === n.id;
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              aria-label={`${n.title}: ${n.sub}`}
              className={`${styles.node} ${styles[`branch_${n.branch}`]} ${on ? "" : styles.nodeDim} ${isSel ? styles.nodeSel : ""}`}
              onClick={() => setSelected(isSel ? null : n.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  setSelected(isSel ? null : n.id);
                }
              }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect x={n.x} y={n.y} width={n.w} height={BOX_H} rx={10} />
              <text x={n.x + n.w / 2} y={n.y + 24} className={styles.nodeTitle}>
                {n.title}
              </text>
              <text x={n.x + n.w / 2} y={n.y + 43} className={styles.nodeSub}>
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>
      {active && (
        <div className={styles.popover} style={popStyle} role="dialog" aria-label={active.title}>
          <button className={styles.popClose} onClick={() => setSelected(null)} aria-label="Close">
            ×
          </button>
          <strong>{active.title}</strong>
          <p>{active.detail}</p>
        </div>
      )}
      </div>
    </figure>
  );
}
