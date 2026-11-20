"use client";

import { useCallback, useState } from "react";
import data from "./stepperData.json";
import styles from "./Solar.module.scss";

type StageKey = "X" | "LF" | "HF" | "X1" | "X2" | "X3" | "X4" | "X5" | "X6" | "X7" | "X_Final";

// THE ORIGINAL FUNCTION, LINE FOR LINE
const CODE = [
  "def f(X):",
  "    LF = cv2.GaussianBlur(X, (5, 5), 0)",
  "    HF = X - LF",
  "    X1 = cv2.GaussianBlur(HF, (11, 11), 1)",
  "    X2 = cv2.convertScaleAbs(X1, alpha=0.2, beta=0)",
  "    X3 = cv2.GaussianBlur(X2, (5, 5), 0)",
  "    X4 = X3 > 50",
  "    X5 = X4 * X",
  "    X6 = cv2.normalize(X5, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)",
  "    X7 = X6 > 0.6",
  "    X_Final = X * X7",
  "    return X_Final",
];

interface Stage {
  key: StageKey;
  title: string;
  lines: number[];
  text: (s: (typeof data.frames)[number]["stats"]) => string;
}

const STAGES: Stage[] = [
  {
    key: "X", title: "Input", lines: [0],
    text: () => "An HMI intensitygram: visible light from the Sun's surface. The dark patches are sunspots. The fine grain is granulation, the Sun's normal convection, which the pipeline has to ignore.",
  },
  {
    key: "LF", title: "Low-pass", lines: [1],
    text: () => "A small Gaussian blur keeps only the smooth, large-scale brightness, including the darkening toward the edge of the disk.",
  },
  {
    key: "HF", title: "High-pass", lines: [2],
    text: () => "Subtracting the blur leaves only fine detail. Blue means darker than the surroundings and orange means brighter. Sunspots show up as strong blue centers with bright rims.",
  },
  {
    key: "X1", title: "Smooth the detail", lines: [3],
    text: () => "A wider blur averages the detail map. Random granulation tends to cancel out, while clustered structure like sunspot groups survives.",
  },
  {
    key: "X2", title: "Take the magnitude", lines: [4],
    text: () => "convertScaleAbs takes the absolute value and scales it into 0–255. Darker or brighter no longer matters, only how much structure there is.",
  },
  {
    key: "X3", title: "Smooth again", lines: [5],
    text: () => "One more blur turns the magnitude map into soft blobs around active regions.",
  },
  {
    key: "X4", title: "First threshold", lines: [6],
    text: (s) => `Keep only strong structure: ${s.X4kept}% of the disk survives. The bright ring is the sharp edge of the disk itself, a false positive the next steps remove.`,
  },
  {
    key: "X5", title: "Mask the original", lines: [7],
    text: () => "Multiply the mask by the original image to bring back real brightness values, but only inside the kept regions.",
  },
  {
    key: "X6", title: "Normalize", lines: [8],
    text: () => "Rescale to 0–1 so the next threshold is relative to the brightest kept pixel, which makes it work on quiet and active days alike.",
  },
  {
    key: "X7", title: "Second threshold", lines: [9],
    text: (s) => `Keep values above 0.6, leaving ${s.X7kept}% of the disk. The dim edge ring disappears, and so do the very dark sunspot centers. That's why sunspots come out as rings: what's left are their rims and the bright faculae around them.`,
  },
  {
    key: "X_Final", title: "Result", lines: [10, 11],
    text: () => "The original image, kept only where the mask survived. On a quiet day this is nearly blank, which tells the model only slow factors are driving TSI. Here, at solar maximum, it lights up.",
  },
];

export function SolarStepper() {
  const [frameIdx, setFrameIdx] = useState(1);
  const [i, setI] = useState(0);
  const [peek, setPeek] = useState(false);

  const frame = data.frames[frameIdx];
  const stage = STAGES[i];
  const shown = peek ? "X" : stage.key;

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(STAGES.length - 1, n))), []);

  return (
    <figure
      className={styles.figure}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      }}
    >
      <div className={styles.segmented} role="tablist" aria-label="Observation time">
        {data.frames.map((f, k) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={frameIdx === k}
            className={frameIdx === k ? styles.segActive : styles.seg}
            onClick={() => setFrameIdx(k)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.stepGrid}>
        <div className={styles.stepLeft}>
        <div className={styles.stepImage}>
          {/* ALL STAGES STAY MOUNTED SO SWITCHING CROSSFADES INSTEAD OF RELOADING */}
          {STAGES.map((s) => (
            <img
              key={`${frame.id}-${s.key}`}
              src={`/images/nasa/stepper/${frame.id}/${s.key}.webp`}
              alt={s.key === shown ? `${s.title} stage of the preprocessing for ${frame.label}` : ""}
              aria-hidden={s.key !== shown}
              className={s.key === shown ? styles.stepImgOn : styles.stepImgOff}
              width={data.size}
              height={data.size}
            />
          ))}
          <span className={styles.stepBadge}>{peek ? "Original" : `${i + 1} / ${STAGES.length} · ${stage.title}`}</span>
          <button
            className={styles.peek}
            onPointerDown={() => setPeek(true)}
            onPointerUp={() => setPeek(false)}
            onPointerLeave={() => setPeek(false)}
            onKeyDown={(e) => e.key === " " && setPeek(true)}
            onKeyUp={(e) => e.key === " " && setPeek(false)}
          >
            Hold for original
          </button>
        </div>
          <div className={styles.stepControls}>
            <button className={styles.stepBtn} onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step">
              ←
            </button>
            <input
              type="range"
              min={0}
              max={STAGES.length - 1}
              value={i}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Preprocessing step"
              className={styles.stepRange}
            />
            <button className={styles.stepBtn} onClick={() => go(i + 1)} disabled={i === STAGES.length - 1} aria-label="Next step">
              →
            </button>
          </div>
        </div>

        <div className={styles.stepSide}>
          <pre className={styles.code} aria-label="Preprocessing source code">
            {CODE.map((line, n) => (
              <span key={n} className={stage.lines.includes(n) ? styles.codeOn : styles.codeLine}>
                {line}
                {"\n"}
              </span>
            ))}
          </pre>
          <div className={styles.stepText} aria-live="polite">
            <strong>{stage.title}</strong>
            <p>{stage.text(frame.stats)}</p>
          </div>
        </div>
      </div>

      <p className={styles.disclaimer}>
        HMI intensitygrams from April 2024 (NASA/SDO and the HMI science team), run through the original function.
        The quick-look JPEGs were rescaled to raw HMI intensity (~0–60,000) first, because the hand-tuned thresholds
        expect float data. Colors are for display.
      </p>
    </figure>
  );
}
