"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./Solar.module.scss";

type Mode = "point" | "gap" | "forecast";

const W = 560;
const H = 300;
const M = { top: 18, right: 14, bottom: 78, left: 40 };
const N = 720;

// FIXED ANCHORS FOR EACH SCENARIO, IN DAYS
const POINT_AT = 470;
const GAP_CENTER = 470;
const FORECAST_T0 = 500;
const SEQ_LEN = 240;
const LABEL_LEN = 80;

// SEEDED RNG SO THE SIGNAL IS IDENTICAL ON SERVER AND CLIENT
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ILLUSTRATIVE TSI-LIKE SIGNAL: SLOW TREND + 27-DAY ROTATION + SUNSPOT DIPS + NOISE
function makeSignal(): number[] {
  const r = rng(1362);
  const dips = Array.from({ length: 16 }, () => ({
    at: r() * N,
    depth: 0.3 + r() * 1.0,
    width: 3 + r() * 6,
  }));
  const out: number[] = [];
  let noise = 0;
  for (let t = 0; t < N; t++) {
    noise = noise * 0.8 + (r() - 0.5) * 0.12;
    let v = 0.05 + 0.25 * (t / N) + 0.08 * Math.sin((2 * Math.PI * t) / 27);
    for (const d of dips) v -= d.depth * Math.exp(-((t - d.at) ** 2) / (2 * d.width ** 2));
    out.push(v + noise);
  }
  return out;
}

// SMOOTHLY ANIMATE A NUMERIC TARGET; JUMPS IMMEDIATELY WHEN REDUCED MOTION IS REQUESTED
function useTween(target: number, ms = 450): number {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === target) {
      fromRef.current = target;
      setVal(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const v = from + (target - from) * d3.easeCubicInOut(k);
      fromRef.current = v;
      setVal(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

const COPY: Record<Mode, { label: string; text: string }> = {
  point: {
    label: "Single-point fill",
    text: "One value is hidden and the model sees everything around it. Easy, and mainly a sanity check that the pipeline works.",
  },
  gap: {
    label: "Gap fill",
    text: "A long stretch is hidden, with data on both sides. This is how you would repair an instrument outage in the record.",
  },
  forecast: {
    label: "Forecast",
    text: "No future data at all. The Informer reads seq_len days of history, starts from the last label_len known values, and predicts pred_len days ahead in one shot.",
  },
};

export function SolarScenarios() {
  const data = useMemo(makeSignal, []);
  const [mode, setMode] = useState<Mode>("gap");
  const [gapLen, setGapLen] = useState(90);
  const [horizon, setHorizon] = useState(90);

  // TARGET [START, END) OF THE HIDDEN REGION FOR THE CURRENT MODE
  const target = useMemo(() => {
    if (mode === "point") return [POINT_AT, POINT_AT + 1];
    if (mode === "gap") return [GAP_CENTER - gapLen / 2, GAP_CENTER + gapLen / 2];
    return [FORECAST_T0, FORECAST_T0 + horizon];
  }, [mode, gapLen, horizon]);

  const hs = useTween(target[0]);
  const he = useTween(target[1]);
  const ctxStart = useTween(mode === "forecast" ? FORECAST_T0 - SEQ_LEN : 0);

  const x = d3.scaleLinear().domain([0, N - 1]).range([M.left, W - M.right]);
  const y = d3.scaleLinear().domain([-1.4, 0.9]).range([H - M.bottom, M.top]);

  const isHidden = (i: number) => i >= Math.floor(hs) && i < Math.ceil(he);
  const isFuture = (i: number) => mode === "forecast" && i >= Math.ceil(he);
  const inContext = (i: number) => i >= ctxStart;

  // SPLIT THE ONE SERIES INTO WHAT THE MODEL SEES, WHAT IS HIDDEN, AND WHAT IS UNUSED
  const line = (pred: (i: number) => boolean) =>
    d3
      .line<number>()
      .defined((_, i) => pred(i) || pred(i - 1))
      .x((_, i) => x(i))
      .y((v) => y(v))(data) ?? "";

  const seenPath = line((i) => !isHidden(i) && !isFuture(i) && inContext(i));
  const hiddenPath = line((i) => isHidden(i));
  const unusedPath = line((i) => (!inContext(i) || isFuture(i)) && !isHidden(i));

  const bandX = x(hs);
  const bandW = Math.max(3, x(he) - x(hs));
  const baseY = H - M.bottom;

  // BRACKETS UNDER THE AXIS EXPLAIN EACH WINDOW
  const brackets: { from: number; to: number; label: string; kind: "ctx" | "label" | "pred" }[] =
    mode === "forecast"
      ? [
          { from: ctxStart, to: FORECAST_T0, label: "seq_len", kind: "ctx" },
          { from: FORECAST_T0 - LABEL_LEN, to: FORECAST_T0, label: "label_len", kind: "label" },
          { from: hs, to: he, label: "pred_len", kind: "pred" },
        ]
      : mode === "gap"
        ? [
            { from: 0, to: hs, label: "context", kind: "ctx" },
            { from: hs, to: he, label: "predict", kind: "pred" },
            { from: he, to: N - 1, label: "context", kind: "ctx" },
          ]
        : [
            { from: 0, to: POINT_AT, label: "context", kind: "ctx" },
            { from: POINT_AT + 1, to: N - 1, label: "context", kind: "ctx" },
          ];

  return (
    <figure className={styles.figure}>
      <div className={styles.segmented} role="tablist" aria-label="Evaluation scenario">
        {(Object.keys(COPY) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={mode === m ? styles.segActive : styles.seg}
            onClick={() => setMode(m)}
          >
            {COPY[m].label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} role="img" aria-label={`${COPY[mode].label} scenario on an illustrative TSI-like signal`}>
        {y.ticks(4).map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={styles.grid} />
            <text x={M.left - 6} y={y(t) + 4} className={styles.tickY}>
              {t}
            </text>
          </g>
        ))}

        <rect x={bandX} y={M.top} width={bandW} height={baseY - M.top} className={styles.predBand} />

        <path d={unusedPath} className={styles.lineUnused} />
        <path d={hiddenPath} className={styles.lineHidden} />
        <path d={seenPath} className={styles.lineSeen} />

        {mode === "point" && (
          <circle cx={x(POINT_AT)} cy={y(data[POINT_AT])} r={6} className={styles.pointMark} />
        )}
        {mode === "forecast" && (
          <line x1={x(FORECAST_T0)} x2={x(FORECAST_T0)} y1={M.top} y2={baseY} className={styles.nowLine} />
        )}
        {mode === "forecast" && (
          <text x={x(FORECAST_T0) - 6} y={M.top + 12} className={styles.nowLabel}>
            now
          </text>
        )}

        <line x1={M.left} x2={W - M.right} y1={baseY} y2={baseY} className={styles.axis} />

        {brackets.map((b, i) => {
          // label_len OVERLAPS seq_len, SO IT GETS ITS OWN ROW
          const row = b.kind === "label" ? 1 : 0;
          const by = baseY + 18 + row * 26;
          const x1 = x(b.from);
          const x2 = x(b.to);
          if (x2 - x1 < 2) return null;
          return (
            <g key={i} className={styles[`bracket_${b.kind}`]}>
              <path d={`M${x1},${by - 5} V${by} H${x2} V${by - 5}`} className={styles.bracket} />
              <text x={(x1 + x2) / 2} y={by + 15} className={styles.bracketLabel}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.chartFooter}>
        <div className={styles.legendRow}>
          <span><i className={styles.keySeen} /> model sees</span>
          <span><i className={styles.keyHidden} /> hidden, must predict</span>
          <span><i className={styles.keyUnused} /> not used</span>
        </div>
        {mode !== "point" && (
          <label className={styles.slider}>
            <span>{mode === "gap" ? `Gap length: ${gapLen} days` : `Horizon (pred_len): ${horizon} days`}</span>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={mode === "gap" ? gapLen : horizon}
              onChange={(e) => (mode === "gap" ? setGapLen : setHorizon)(Number(e.target.value))}
            />
          </label>
        )}
        <p className={styles.caption}>{COPY[mode].text}</p>
        <p className={styles.disclaimer}>
          Illustrative signal shaped like TSI perturbation (W/m², days). Not real data or model output.
        </p>
      </div>
    </figure>
  );
}
