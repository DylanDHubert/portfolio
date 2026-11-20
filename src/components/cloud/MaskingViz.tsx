"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import data from "./bandsData.json";
import { bandMask, P, PATCHES } from "./masks";
import shared from "../solar/Solar.module.scss";
import styles from "./Cloud.module.scss";

type Mode = "dependent" | "independent";

const B = data.bands.length;

const GROUP_COLOR: Record<string, string> = {
  visible: "#facc15",
  "near-IR": "#fb923c",
  "water vapor": "#38bdf8",
  infrared: "#f43f5e",
};

export function MaskingViz() {
  const [mode, setMode] = useState<Mode>("dependent");
  const [ratio, setRatio] = useState(0.75);
  const [seed, setSeed] = useState(11);
  const [hover, setHover] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(0);
  const imgs = useRef<HTMLImageElement[]>([]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);

  // DEPENDENT: ONE MASK SHARED BY ALL BANDS. INDEPENDENT: A DIFFERENT MASK PER BAND
  const masks = useMemo(() => {
    return Array.from({ length: B }, (_, b) => bandMask(mode, b, seed, ratio));
  }, [mode, ratio, seed]);

  const hiddenEverywhere = useMemo(() => {
    let n = 0;
    for (let p = 0; p < PATCHES; p++) if (masks.every((m) => m[p])) n++;
    return n;
  }, [masks]);

  const visibleAtHover = hover === null ? null : masks.filter((m) => !m[hover]).length;

  useEffect(() => {
    imgs.current = data.bands.map((b) => {
      const im = new Image();
      im.onload = () => setLoaded((n) => n + 1);
      im.src = `/images/nasa/cloud/bands/${b.id}.webp`;
      return im;
    });
  }, []);

  // REDRAW EVERY BAND: IMAGE, THEN MASKED PATCHES, THEN THE HOVERED PATCH OUTLINE
  useEffect(() => {
    const S = data.size;
    const cell = S / P;
    canvases.current.forEach((cv, b) => {
      const im = imgs.current[b];
      if (!cv || !im || !im.complete) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, S, S);
      ctx.drawImage(im, 0, 0, S, S);
      for (let p = 0; p < PATCHES; p++) {
        if (!masks[b][p]) continue;
        const x = (p % P) * cell;
        const y = Math.floor(p / P) * cell;
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = "rgba(148,163,184,0.18)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
      if (hover !== null) {
        const x = (hover % P) * cell;
        const y = Math.floor(hover / P) * cell;
        ctx.lineWidth = 4;
        ctx.strokeStyle = masks[b][hover] ? "#f43f5e" : "#22c55e";
        ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
      }
    });
  }, [masks, hover, loaded]);

  const onPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = Math.floor(((e.clientX - r.left) / r.width) * P);
    const cy = Math.floor(((e.clientY - r.top) / r.height) * P);
    if (cx >= 0 && cx < P && cy >= 0 && cy < P) setHover(cy * P + cx);
  };

  const pct = Math.round((100 * hiddenEverywhere) / PATCHES);

  return (
    <figure className={shared.figure}>
      <div className={styles.maskTop}>
        <div className={shared.segmented} role="tablist" aria-label="Masking strategy">
          <button role="tab" aria-selected={mode === "dependent"} className={mode === "dependent" ? shared.segActive : shared.seg} onClick={() => setMode("dependent")}>
            Dependent (original)
          </button>
          <button role="tab" aria-selected={mode === "independent"} className={mode === "independent" ? shared.segActive : shared.seg} onClick={() => setMode("independent")}>
            Independent (mine)
          </button>
        </div>
        <button className={styles.shuffle} onClick={() => setSeed((s) => s + 1)}>
          Reshuffle
        </button>
      </div>

      <div className={styles.maskStat} aria-live="polite">
        <span className={styles.maskBig}>{pct}%</span>
        <span>
          of patch locations are hidden in <strong>every</strong> band.{" "}
          {mode === "dependent"
            ? "Wherever a patch is masked, all 16 bands lose it, so the model can only guess from the neighboring patches."
            : "Almost every location is still visible in some band, so the model can learn to rebuild one band from the others."}
        </span>
      </div>

      <div className={styles.bandGrid} onPointerLeave={() => setHover(null)}>
        {data.bands.map((b, k) => (
          <div key={b.id} className={styles.band}>
            <canvas
              ref={(el) => {
                canvases.current[k] = el;
              }}
              width={data.size}
              height={data.size}
              className={styles.bandCanvas}
              onPointerMove={onPoint}
              onPointerDown={onPoint}
              aria-label={`Band ${b.id}, ${b.name}, ${b.um} micrometers`}
              role="img"
            />
            <span className={styles.bandLabel}>
              <i style={{ background: GROUP_COLOR[b.group] }} />
              {b.id} · {b.um} µm
            </span>
            <span className={styles.bandName}>{b.name}</span>
          </div>
        ))}
      </div>

      <div className={styles.maskFooter}>
        <p className={styles.maskHover}>
          {visibleAtHover === null
            ? "Hover or tap a patch to see which bands can still see that spot."
            : `This spot is visible in ${visibleAtHover} of 16 bands (green outline) and hidden in ${16 - visibleAtHover} (red).`}
        </p>
        <label className={shared.slider}>
          <span>Masked per band: {Math.round(ratio * 100)}%</span>
          <input type="range" min={0.5} max={0.9} step={0.05} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
        </label>
        <div className={styles.groupKey}>
          {Object.entries(GROUP_COLOR).map(([g, c]) => (
            <span key={g}>
              <i style={{ background: c }} /> {g}
            </span>
          ))}
        </div>
      </div>

      <p className={shared.disclaimer}>
        A real GOES-16 chip in all 16 ABI bands (13 Jan 2019, 20:52 UTC, 512 km across). Each band is contrast-stretched
        for display, and infrared bands are inverted so clouds look bright. The 8×8 patch grid and the 75% default (the
        standard MAE masking ratio) are illustrative, not the exact training settings.
      </p>
    </figure>
  );
}
