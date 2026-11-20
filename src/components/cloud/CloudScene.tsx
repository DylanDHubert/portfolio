"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Targets } from "./CloudSceneCanvas";
import shared from "../solar/Solar.module.scss";
import styles from "./Cloud.module.scss";

// WEBGL ONLY RUNS IN THE BROWSER
const CloudSceneCanvas = dynamic(() => import("./CloudSceneCanvas"), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading 3D scene…</div>,
});

interface Step {
  title: string;
  badge?: { text: string; kind: "mine" | "concept" };
  text: string;
  targets: Targets;
}

const STEPS: Step[] = [
  {
    title: "GOES sees the tops",
    text: "GOES-16 sits about 36,000 km above the equator and images this whole region in 16 spectral bands every few minutes. That's great coverage, but it only sees the top of each cloud. The image is flat.",
    targets: { curtain: 0, chips: 0, rise: 0 },
  },
  {
    title: "CloudSat sees a slice",
    text: "CloudSat's radar flies a polar orbit and measures clouds from top to bottom, but only in a thin curtain directly under its track. Along that line we know the true vertical structure; everywhere else we don't.",
    targets: { curtain: 1, chips: 0, rise: 0 },
  },
  {
    title: "Co-location and chips",
    badge: { text: "My work", kind: "mine" },
    text: "My part was the data pipeline that joins the two. It matches GOES and CloudSat observations in time and space using only file metadata, normalizes every band, and cuts GOES chips centered on the CloudSat track, so every training chip comes with a known vertical slice. It ran at terabyte scale on NASA's supercomputers.",
    targets: { curtain: 1, chips: 1, rise: 0 },
  },
  {
    title: "Filling in 3D: the M2M idea",
    badge: { text: "Concept: model designed by Yiding Wang", kind: "concept" },
    text: "The M2M transformer learns from those chips to predict the vertical cloud profile at every pixel, not just under the track. White columns are known from CloudSat. Blue columns are what the model has to infer.",
    targets: { curtain: 1, chips: 0.35, rise: 1 },
  },
];

export function CloudScene() {
  const [i, setI] = useState(0);
  const [interactive, setInteractive] = useState(true);
  const targets = useRef<Targets>(STEPS[0].targets);

  useEffect(() => {
    targets.current = STEPS[i].targets;
  }, [i]);

  // TOUCH DEVICES: DON'T LET THE 3D VIEW STEAL PAGE SCROLLING
  useEffect(() => {
    setInteractive(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const step = STEPS[i];
  const go = (n: number) => setI(Math.max(0, Math.min(STEPS.length - 1, n)));

  return (
    <figure className={shared.figure}>
      <div className={shared.segmented} role="tablist" aria-label="Story step">
        {STEPS.map((s, k) => (
          <button
            key={s.title}
            role="tab"
            aria-selected={i === k}
            className={i === k ? shared.segActive : shared.seg}
            onClick={() => go(k)}
          >
            {k + 1}
          </button>
        ))}
      </div>

      <div className={styles.canvasWrap} role="img" aria-label={`3D illustration: ${step.title}`}>
        <CloudSceneCanvas targets={targets} interactive={interactive} />
        {interactive && <span className={styles.dragHint}>Drag to rotate</span>}
        {i === 3 && (
          <div className={styles.legend}>
            <span><i className={styles.known} /> Known (CloudSat)</span>
            <span><i className={styles.pred} /> Predicted (model)</span>
          </div>
        )}
      </div>

      <div className={styles.stepBody} aria-live="polite">
        <div className={styles.stepHead}>
          <strong>{i + 1}. {step.title}</strong>
          {step.badge && (
            <span className={step.badge.kind === "mine" ? styles.badgeMine : styles.badgeConcept}>{step.badge.text}</span>
          )}
        </div>
        <p>{step.text}</p>
      </div>

      <div className={styles.nav}>
        <button className={shared.stepBtn} onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step">
          ←
        </button>
        <button className={styles.nextBtn} onClick={() => go(i === STEPS.length - 1 ? 0 : i + 1)}>
          {i === STEPS.length - 1 ? "Start over" : "Next →"}
        </button>
      </div>

      <p className={shared.disclaimer}>
        Real GOES-16 true-color image and cloud mask: Gulf of Mexico, 13 Jan 2019, 20:52 UTC (NOAA). Cloud-top heights
        are estimated from infrared temperature and cloud thickness is assumed. The CloudSat track and curtain are
        simulated from those estimates, and the vertical scale is exaggerated. This illustrates the idea; it is not
        model output.
      </p>
    </figure>
  );
}
