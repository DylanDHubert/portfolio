"use client";

import { useMemo } from "react";
import { useLoopTime } from "./useLoopTime";
import styles from "./Thumbs.module.scss";

// A SMALL VERSION OF THE POST'S FRONTIER STEPPER: 8 ROOTS, BINARY SPLITS, DEPTH 3 (64 LEAVES)
const ROOTS = 8;
const DEPTH = 3;
const WINDOW = 8;
const EXPAND = 2;
const LEAVES = ROOTS * 2 ** DEPTH;
const TARGETS = [13, 46];
const STEP_SECONDS = 0.85;

type Node = { d: number; i: number };
const key = (n: Node) => `${n.d}:${n.i}`;
const span = (n: Node) => {
  const w = 2 ** (DEPTH - n.d);
  return [n.i * w, (n.i + 1) * w] as const;
};

function score(n: Node) {
  const [a, b] = span(n);
  let best = 0;
  for (const t of TARGETS) {
    const dist = t >= a && t < b ? 0 : Math.min(Math.abs(t - a), Math.abs(t - (b - 1)));
    best = Math.max(best, Math.exp(-dist / 5));
  }
  const h = Math.sin((n.d + 1) * 12.9898 + (n.i + 1) * 78.233) * 43758.5453;
  return 0.1 + 0.75 * best + (h - Math.floor(h)) * 0.15;
}

interface Frame {
  window: Node[];
  expand: Set<string>;
  added: Set<string>;
  prune: Set<string>;
}

// SAME ALGORITHM AS THE POST: SCORE, EXPAND THE TOP FRACTION, PRUNE BACK TO THE WINDOW SIZE
function simulate(): Frame[] {
  const frames: Frame[] = [];
  let win: Node[] = Array.from({ length: ROOTS }, (_, i) => ({ d: 0, i }));
  for (let step = 0; step < 6; step++) {
    const top = [...win].sort((x, y) => score(y) - score(x)).slice(0, EXPAND).filter((n) => n.d < DEPTH);
    if (!top.length) break;
    const ex = new Set(top.map(key));
    frames.push({ window: win, expand: ex, added: new Set(), prune: new Set() });
    const kids = top.flatMap((n) => [{ d: n.d + 1, i: n.i * 2 }, { d: n.d + 1, i: n.i * 2 + 1 }]);
    const grown = [...win.filter((n) => !ex.has(key(n))), ...kids];
    frames.push({ window: grown, expand: new Set(), added: new Set(kids.map(key)), prune: new Set() });
    const drop = [...grown].sort((x, y) => score(x) - score(y)).slice(0, Math.max(0, grown.length - WINDOW));
    frames.push({ window: grown, expand: new Set(), added: new Set(), prune: new Set(drop.map(key)) });
    win = grown.filter((n) => !drop.some((d) => key(d) === key(n)));
  }
  frames.push({ window: win, expand: new Set(), added: new Set(), prune: new Set() });
  frames.push({ window: win, expand: new Set(), added: new Set(), prune: new Set() });
  return frames;
}

export function ChartThumb() {
  const frames = useMemo(simulate, []);
  const { ref, t } = useLoopTime<HTMLDivElement>(3.4);
  const f = frames[Math.floor(t / STEP_SECONDS) % frames.length];
  const inWin = new Set(f.window.map(key));

  const X0 = 24;
  const W = 272;
  const slots = [...f.window].sort((a, b) => span(a)[0] - span(b)[0] || a.d - b.d);
  const SLOT = W / (WINDOW + 2);

  const fillFor = (k: string, on: boolean) =>
    f.prune.has(k) ? "var(--th-dim)" : f.expand.has(k) ? "var(--th-red)" : f.added.has(k) ? "var(--th-violet)" : on ? "var(--th-accent)" : "var(--th-faint)";

  return (
    <div ref={ref} className={styles.thumb} aria-hidden>
      <svg viewBox="0 0 320 180">
        {/* ATTENTION WINDOW: FIXED SLOTS, BAR HEIGHT = SCORE */}
        {Array.from({ length: WINDOW + 2 }, (_, s) => (
          <rect key={`s${s}`} x={X0 + s * SLOT + 2} y={16} width={SLOT - 4} height={46} rx={3} fill="none" stroke="var(--th-faint)" strokeDasharray={s >= WINDOW ? "3 3" : undefined} />
        ))}
        {slots.map((n, s) => {
          const k = key(n);
          const h = Math.max(4, score(n) * 40);
          return <rect key={k} x={X0 + s * SLOT + 6} y={16 + 46 - 3 - h} width={SLOT - 12} height={h} rx={2} fill={fillFor(k, true)} opacity={f.prune.has(k) ? 0.5 : 1} />;
        })}

        {/* TREE: ROWS BY DEPTH, CELLS LIGHT UP WHEN IN THE WINDOW */}
        {Array.from({ length: DEPTH + 1 }, (_, d) => {
          const count = ROOTS * 2 ** d;
          const cw = W / count;
          return Array.from({ length: count }, (_, i) => {
            const k = `${d}:${i}`;
            const on = inWin.has(k);
            return <rect key={k} x={X0 + i * cw + 0.5} y={82 + d * 18} width={Math.max(1, cw - 1.2)} height={13} rx={1.5} fill={fillFor(k, on)} />;
          });
        })}
        {TARGETS.map((tg, k) => {
          const x = X0 + ((tg + 0.5) / LEAVES) * W;
          return <path key={tg} d={`M${x},${160} l-5,10 h10 z`} fill={k === 0 ? "var(--th-mark)" : "none"} stroke="var(--th-mark)" strokeWidth="1.5" />;
        })}
      </svg>
    </div>
  );
}
