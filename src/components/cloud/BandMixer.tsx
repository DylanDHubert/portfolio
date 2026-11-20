"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import data from "./bandsData.json";
import { bandMask, P } from "./masks";
import shared from "../solar/Solar.module.scss";
import styles from "./Cloud.module.scss";

type MaskMode = "off" | "dependent" | "independent";
type Mix = [number, number, number]; // BAND INDEXES (0-BASED) FOR RED, GREEN, BLUE
// PHYSICAL DISPLAY RANGE [FROM, TO]: REFLECTANCE (0-1) OR KELVIN. FROM > TO INVERTS (COLD = BRIGHT)
type Range = [number, number];

interface Preset {
  name: string;
  mix: Mix;
  // FIXED RANGES FROM THE PUBLISHED RECIPE; WITHOUT THEM EACH BAND IS AUTO-STRETCHED
  ranges?: [Range, Range, Range];
  text: string;
}

const PRESETS: Preset[] = [
  {
    name: "Day cloud phase",
    mix: [12, 1, 4],
    ranges: [[280.65, 219.65], [0, 0.78], [0.01, 0.59]],
    text: "Infrared (cold = bright) in red, visible red in green, 1.6 µm in blue. Thick, high ice clouds turn yellow, thin ice clouds red or pink, and low water clouds cyan, because ice absorbs at 1.6 µm while water droplets reflect it.",
  },
  {
    name: "Natural color",
    mix: [1, 2, 0],
    ranges: [[0, 1], [0, 1], [0, 1]],
    text: "Red (0.64 µm) as red, the 0.86 µm veggie band as green, and blue (0.47 µm) as blue. Clouds look white and the ocean dark. Using the veggie band for green makes vegetation look greener than the eye would see it.",
  },
  {
    name: "Water vapor layers",
    mix: [7, 8, 9],
    text: "Three water vapor bands, each sensitive to a different height: upper (red), mid (green) and lower (blue) troposphere. The surface is invisible here; this is moisture in the air.",
  },
  {
    name: "Cirrus highlight",
    mix: [3, 1, 0],
    text: "The 1.38 µm cirrus band in red. Water vapor below absorbs that wavelength, so only high, thin ice clouds show up, popping out red against the cyan of everything else.",
  },
  {
    name: "Shortwave IR mix",
    mix: [6, 5, 4],
    text: "Three shortwave-infrared bands. Differences between them carry information about cloud particle size and phase that the visible bands can't see.",
  },
];

const CHANNELS = ["R", "G", "B"] as const;

// DECODE THE 8-BIT LINEAR ENCODING BACK TO REFLECTANCE OR KELVIN
function toPhys(band: number, code: number) {
  const b = data.bands[band];
  return b.rawMin + (code / 255) * (b.rawMax - b.rawMin);
}

export function BandMixer() {
  const [mix, setMix] = useState<Mix>(PRESETS[0].mix);
  const [maskMode, setMaskMode] = useState<MaskMode>("off");
  const [seed, setSeed] = useState(11);
  const [ready, setReady] = useState(false);
  const pixels = useRef<Uint8ClampedArray[]>([]);
  const autoRange = useRef<Range[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = data.size;

  const preset = PRESETS.find((p) => p.mix.every((b, k) => b === mix[k]));

  // DECODE ALL 16 PHYSICALLY ENCODED BANDS ONCE; ALSO FIND EACH BAND'S 1ST-99TH PERCENTILE FOR AUTO STRETCH
  useEffect(() => {
    let left = data.bands.length;
    const off = document.createElement("canvas");
    off.width = S;
    off.height = S;
    const ctx = off.getContext("2d", { willReadFrequently: true });
    data.bands.forEach((b, k) => {
      const im = new Image();
      im.onload = () => {
        if (!ctx) return;
        ctx.drawImage(im, 0, 0, S, S);
        const px = ctx.getImageData(0, 0, S, S).data.slice();
        pixels.current[k] = px;
        const hist = new Array(256).fill(0);
        for (let i = 0; i < px.length; i += 4) hist[px[i]]++;
        const total = px.length / 4;
        const q = (f: number) => {
          let acc = 0;
          for (let v = 0; v < 256; v++) if ((acc += hist[v]) >= f * total) return v;
          return 255;
        };
        const lo = toPhys(k, q(0.01));
        const hi = toPhys(k, q(0.99));
        autoRange.current[k] = b.kind === "bt" ? [hi, lo] : [lo, hi];
        if (--left === 0) setReady(true);
      };
      im.src = `/images/nasa/cloud/bands_raw/${b.id}.webp`;
    });
  }, [S]);

  // EACH OUTPUT CHANNEL CAN CARRY ITS OWN BAND'S MASK
  const masks = useMemo(
    () => mix.map((band) => (maskMode === "off" ? null : bandMask(maskMode, band, seed, 0.75))),
    [mix, maskMode, seed],
  );

  useEffect(() => {
    const cv = canvasRef.current;
    if (!ready || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const out = ctx.createImageData(S, S);
    const cell = S / P;
    // PER CHANNEL: 8-BIT CODE -> PHYSICAL VALUE -> RECIPE RANGE -> 0-255, PRECOMPUTED AS A LOOKUP TABLE
    const luts = mix.map((band, c) => {
      const [from, to] = preset?.ranges?.[c] ?? autoRange.current[band];
      const lut = new Uint8ClampedArray(256);
      for (let v = 0; v < 256; v++) lut[v] = Math.round(255 * Math.min(1, Math.max(0, (toPhys(band, v) - from) / (to - from))));
      return lut;
    });
    for (let y = 0; y < S; y++) {
      const py = Math.floor(y / cell);
      for (let x = 0; x < S; x++) {
        const patch = py * P + Math.floor(x / cell);
        const i = (y * S + x) * 4;
        for (let c = 0; c < 3; c++) {
          const m = masks[c];
          out.data[i + c] = m && m[patch] ? 0 : luts[c][pixels.current[mix[c]][i]];
        }
        out.data[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  }, [ready, mix, masks, S, preset]);

  const setChannel = (c: number, band: number) => {
    const next = [...mix] as Mix;
    next[c] = band;
    setMix(next);
  };

  return (
    <figure className={shared.figure}>
      <div className={shared.segmented} role="tablist" aria-label="Color recipe">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            role="tab"
            aria-selected={preset?.name === p.name}
            className={preset?.name === p.name ? shared.segActive : shared.seg}
            onClick={() => setMix(p.mix)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.mixGrid}>
        <div className={styles.mixImage}>
          <canvas ref={canvasRef} width={S} height={S} role="img" aria-label="Color composite of three GOES bands" />
          {!ready && <span className={styles.loading}>Loading bands…</span>}
        </div>

        <div className={styles.mixSide}>
          {CHANNELS.map((ch, c) => (
            <label key={ch} className={styles.channel}>
              <span className={styles[`ch${ch}`]}>{ch}</span>
              <select value={mix[c]} onChange={(e) => setChannel(c, Number(e.target.value))}>
                {data.bands.map((b, k) => (
                  <option key={b.id} value={k}>
                    {b.id} · {b.um} µm · {b.name}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <p className={styles.mixText}>
            {preset ? preset.text : "Your own mix. Any three of the 16 bands can be mapped to red, green and blue; each is auto-stretched."}
            {preset && <em className={styles.recipeKind}>{preset.ranges ? " Standard recipe ranges." : " Custom mix, auto-stretched."}</em>}
          </p>

          <div className={styles.mixMask}>
            <span>Apply masking</span>
            <div className={shared.segmented} role="tablist" aria-label="Masking">
              {(["off", "dependent", "independent"] as MaskMode[]).map((m) => (
                <button key={m} role="tab" aria-selected={maskMode === m} className={maskMode === m ? shared.segActive : shared.seg} onClick={() => setMaskMode(m)}>
                  {m === "off" ? "Off" : m === "dependent" ? "Dependent" : "Independent"}
                </button>
              ))}
            </div>
            {maskMode !== "off" && (
              <>
                <p className={styles.mixText}>
                  {maskMode === "dependent"
                    ? "All three bands lose the same patches, leaving black holes with nothing to recover from."
                    : "Each band loses different patches, so where one color is missing the others often still show through. With only 3 bands many patches are still lost; across all 16 bands, almost none are (see the masking demo further down)."}
                </p>
                <button className={styles.shuffle} onClick={() => setSeed((s) => s + 1)}>
                  Reshuffle
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className={shared.disclaimer}>
        The same real GOES-16 chip (13 Jan 2019, 20:52 UTC). Reflectance bands are corrected for the sun angle at the
        chip center. Day cloud phase uses its published value ranges and Natural color plain 0–100% reflectance; the other mixes stretch each
        band to its own 1st–99th percentile, so their colors are for exploration rather than standard products.
      </p>
    </figure>
  );
}
