"use client";

import { useMemo, useState } from "react";
import shared from "../solar/Solar.module.scss";
import styles from "./ChartViz.module.scss";

// TREE: 16 ROOT CLUSTERS, EACH SPLIT IN TWO (K = 2) DOWN TO DEPTH 4 => 256 LEAVES
const ROOTS = 16;
const DEPTH = 4;
const WINDOW = 16; // max_seq_len
const EXPAND = 4; // TOP alpha = 0.25 OF THE WINDOW
const LEAVES = ROOTS * 2 ** DEPTH;

// A NODE IS (DEPTH, INDEX WITHIN ITS ROW); ITS LEAF SPAN IS [index * 2^(DEPTH - depth), ...)
type Node = { d: number; i: number };
const key = (n: Node) => `${n.d}:${n.i}`;
const span = (n: Node) => {
  const w = 2 ** (DEPTH - n.d);
  return [n.i * w, (n.i + 1) * w] as const;
};
const children = (n: Node): Node[] => [
  { d: n.d + 1, i: n.i * 2 },
  { d: n.d + 1, i: n.i * 2 + 1 },
];

// ILLUSTRATIVE TARGETS: THE QUERY'S OWN DOCUMENT PLUS TWO RELATED DOCUMENTS IN OTHER BRANCHES
const QUERY_LEAF = 71;
const RELATED_LEAVES = [180, 22];
const TARGETS = [QUERY_LEAF, ...RELATED_LEAVES];

// STAND-IN FOR LEARNED ATTENTION: HIGH WHEN A NODE'S SUBTREE HOLDS A TARGET, PLUS DETERMINISTIC NOISE
function score(n: Node): number {
  const [a, b] = span(n);
  let best = 0;
  for (const t of TARGETS) {
    const dist = t >= a && t < b ? 0 : Math.min(Math.abs(t - a), Math.abs(t - (b - 1)));
    best = Math.max(best, Math.exp(-dist / 14));
  }
  const h = Math.sin((n.d + 1) * 12.9898 + (n.i + 1) * 78.233) * 43758.5453;
  const noise = (h - Math.floor(h)) * 0.18;
  return Math.min(1, 0.08 + 0.78 * best + noise);
}

type Phase = "score" | "expand" | "prune";
interface Frame {
  step: number;
  phase: Phase;
  window: Node[];
  expand: Set<string>;
  added: Set<string>;
  prune: Set<string>;
  visited: Set<string>;
  text: string;
}

// SIMULATE THE ALGORITHM EXACTLY AS DESCRIBED IN THE POST, ONE FRAME PER PHASE
function simulate(): Frame[] {
  const frames: Frame[] = [];
  let win: Node[] = Array.from({ length: ROOTS }, (_, i) => ({ d: 0, i }));
  const visited = new Set<string>(win.map(key));
  for (let step = 0; step < 8; step++) {
    // EXPAND ONLY THE TOP alpha FRACTION OF THE WINDOW; LEAVES AMONG THEM CAN'T EXPAND
    const top = [...win].sort((x, y) => score(y) - score(x)).slice(0, EXPAND).filter((n) => n.d < DEPTH);
    if (top.length === 0) {
      frames.push({ step, phase: "score", window: win, expand: new Set(), added: new Set(), prune: new Set(), visited: new Set(visited), text: `Settled after ${step} steps: the top-scoring nodes are all leaves, so nothing is left to expand. Those leaves are the retrieved documents, including the related ones in other branches.` });
      break;
    }
    const expandKeys = new Set(top.map(key));
    frames.push({
      step, phase: "score", window: win, expand: expandKeys, added: new Set(), prune: new Set(), visited: new Set(visited),
      text: `Step ${step + 1}: one forward pass scores all ${win.length} nodes in the window. Of the top ${EXPAND} (α = 0.25), ${top.length === EXPAND ? "all" : top.length} can be expanded.`,
    });

    const kids = top.flatMap(children);
    const grown = [...win.filter((n) => !expandKeys.has(key(n))), ...kids];
    kids.forEach((k) => visited.add(key(k)));
    frames.push({
      step, phase: "expand", window: grown, expand: new Set(), added: new Set(kids.map(key)), prune: new Set(), visited: new Set(visited),
      text: `Each expanded node is replaced by its 2 children: ${win.length} − ${top.length} + ${kids.length} = ${grown.length} nodes.`,
    });

    const over = grown.length - WINDOW;
    const lowest = [...grown].sort((x, y) => score(x) - score(y)).slice(0, Math.max(0, over));
    const pruneKeys = new Set(lowest.map(key));
    frames.push({
      step, phase: "prune", window: grown, expand: new Set(), added: new Set(), prune: pruneKeys, visited: new Set(visited),
      text: `The ${over === 1 ? "lowest-scoring node is" : `${over} lowest-scoring nodes are`} dropped, so the window is back to ${WINDOW}. The rest of the tree is never loaded.`,
    });
    win = grown.filter((n) => !pruneKeys.has(key(n)));
  }
  return frames;
}

// DEPTH SHADES COME FROM THE SITE THEME (SEE ChartViz.module.scss)
const DEPTH_FILL = [0, 1, 2, 3, 4].map((d) => `var(--chart-d${d})`);

export function FrontierStepper() {
  const frames = useMemo(simulate, []);
  const [f, setF] = useState(0);
  const frame = frames[f];

  // WINDOW STRIP: UP TO 20 SLOTS (16 + GROWTH BEFORE PRUNING), SORTED BY POSITION IN THE TREE
  const slots = [...frame.window].sort((a, b) => span(a)[0] - span(b)[0] || a.d - b.d);
  const W = 800;
  const SLOT_W = W / 20;
  const STRIP_Y = 18;
  const BAR_H = 74;
  const TREE_Y = 150;
  const ROW_H = 30;
  const inWindow = new Set(frame.window.map(key));
  // LEFT MARGIN FOR THE DEPTH LABELS ON THE TREE ROWS
  const LM = 28;
  const TW = W - LM;

  return (
    <figure className={`${shared.figure} ${styles.themed}`}>
      <div className={styles.stepHeader}>
        <span className={styles.stepCount}>
          {frame.phase === "score" && frame.expand.size === 0 ? (
            "Done"
          ) : (
            <>
              Step {frame.step + 1}
              <span className={styles.phase}> · {frame.phase}</span>
            </>
          )}
        </span>
        <span className={styles.windowCount}>
          window: <strong>{frame.window.length}</strong> / {WINDOW}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${TREE_Y + (DEPTH + 1) * ROW_H + 26}`} className={styles.svg} role="img" aria-label="CHART attention window and tree">
        {/* ATTENTION WINDOW */}
        <text x={0} y={10} className={styles.svgLabel}>Attention window (the transformer&apos;s whole input)</text>
        {Array.from({ length: 20 }, (_, s) => (
          <rect key={`slot${s}`} x={s * SLOT_W + 2} y={STRIP_Y} width={SLOT_W - 4} height={BAR_H} rx={4} className={s < WINDOW ? styles.slot : styles.slotExtra} />
        ))}
        {slots.map((n, s) => {
          const k = key(n);
          const sc = score(n);
          const h = Math.max(4, sc * (BAR_H - 8));
          const cls = frame.prune.has(k) ? styles.barPrune : frame.expand.has(k) ? styles.barExpand : frame.added.has(k) ? styles.barAdded : styles.bar;
          return (
            <g key={k}>
              <rect x={s * SLOT_W + 6} y={STRIP_Y + BAR_H - 4 - h} width={SLOT_W - 12} height={h} rx={2} className={cls} style={{ fill: frame.prune.has(k) || frame.expand.has(k) || frame.added.has(k) ? undefined : DEPTH_FILL[n.d] }} />
              <text x={s * SLOT_W + SLOT_W / 2} y={STRIP_Y + BAR_H + 13} className={styles.slotText}>
                d{n.d}
              </text>
            </g>
          );
        })}

        {/* TREE (ICICLE): EACH ROW IS A DEPTH, EACH CELL A CLUSTER COVERING ITS LEAVES */}
        <text x={0} y={TREE_Y - 10} className={styles.svgLabel}>The tree: 16 roots → 256 leaves (only window nodes are ever loaded)</text>
        {Array.from({ length: DEPTH + 1 }, (_, d) => {
          const count = ROOTS * 2 ** d;
          const cw = TW / count;
          return (
            <g key={`row${d}`}>
              <text x={LM - 6} y={TREE_Y + d * ROW_H + ROW_H / 2 + 2} className={styles.rowLabel}>d{d}</text>
              {Array.from({ length: count }, (_, i) => {
                const k = `${d}:${i}`;
                const on = inWindow.has(k);
                const cls = frame.prune.has(k) ? styles.cellPrune : frame.expand.has(k) ? styles.cellExpand : frame.added.has(k) ? styles.cellAdded : on ? styles.cellOn : frame.visited.has(k) ? styles.cellSeen : styles.cell;
                return <rect key={k} x={LM + i * cw} y={TREE_Y + d * ROW_H} width={Math.max(0.6, cw - (count > 128 ? 0.4 : 1))} height={ROW_H - 4} className={cls} style={on && !frame.prune.has(k) && !frame.expand.has(k) && !frame.added.has(k) ? { fill: DEPTH_FILL[d] } : undefined} />;
              })}
            </g>
          );
        })}
        {TARGETS.map((t, k) => {
          const x = LM + ((t + 0.5) / LEAVES) * TW;
          const y = TREE_Y + (DEPTH + 1) * ROW_H + 4;
          return (
            <g key={`t${t}`}>
              <path d={`M${x},${y} l-6,12 h12 z`} className={k === 0 ? styles.markQuery : styles.markRelated} />
            </g>
          );
        })}
      </svg>

      <div className={styles.legend}>
        <span><i className={styles.lgExpand} /> expanded</span>
        <span><i className={styles.lgAdded} /> new children</span>
        <span><i className={styles.lgPrune} /> pruned</span>
        <span><i className={styles.lgSeen} /> visited earlier</span>
        <span><svg width="12" height="11" aria-hidden><path d="M6,0 L12,11 H0 Z" fill="var(--chart-mark)" /></svg> query&apos;s document</span>
        <span><svg width="12" height="11" aria-hidden><path d="M6,1.5 L11,10 H1 Z" fill="none" stroke="var(--chart-mark)" strokeWidth="1.6" /></svg> related documents</span>
      </div>

      <p className={shared.caption} aria-live="polite">{frame.text}</p>

      <div className={styles.controls}>
        <button className={shared.stepBtn} onClick={() => setF(Math.max(0, f - 1))} disabled={f === 0} aria-label="Previous">
          ←
        </button>
        <input type="range" min={0} max={frames.length - 1} value={f} onChange={(e) => setF(Number(e.target.value))} className={styles.range} aria-label="Traversal step" />
        <button className={shared.stepBtn} onClick={() => setF(f === frames.length - 1 ? 0 : f + 1)} aria-label="Next">
          {f === frames.length - 1 ? "↺" : "→"}
        </button>
      </div>

      <p className={shared.disclaimer}>
        The algorithm is run exactly as described above: a window of 16, expand the top 25%, two children each, prune
        back to 16. The attention scores are illustrative stand-ins (closeness to the target documents plus noise), not
        a trained model&apos;s output.
      </p>
    </figure>
  );
}
