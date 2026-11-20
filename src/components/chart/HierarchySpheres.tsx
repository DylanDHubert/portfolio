"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import shared from "../solar/Solar.module.scss";
import styles from "./ChartViz.module.scss";

const SphereCanvas = dynamic(() => import("./HierarchySpheresCanvas"), {
  ssr: false,
  loading: () => <div className={styles.sphereLoading} />,
});

export function HierarchySpheres() {
  const [interactive, setInteractive] = useState(true);
  useEffect(() => {
    // TOUCH DEVICES: DON'T LET THE 3D VIEW STEAL PAGE SCROLLING
    setInteractive(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <figure className={`${shared.figure} ${styles.themed}`}>
      <div className={styles.sphereGrid}>
        <div className={styles.sphereCell}>
          <div className={styles.sphereCanvas}>
            <SphereCanvas kind="hnsw" interactive={interactive} />
          </div>
          <strong>HNSW</strong>
          <p>One greedy path. It hops between real points on a sparse top layer, then drops to the same point on each denser layer below.</p>
        </div>
        <div className={styles.sphereCell}>
          <div className={styles.sphereCanvas}>
            <SphereCanvas kind="chart" interactive={interactive} />
          </div>
          <strong>CHART</strong>
          <p>A tree of semantic regions. A fixed-size frontier keeps several branches open at once, so it can reach the query and related documents.</p>
        </div>
      </div>
      <div className={styles.legend}>
        <span><i className={styles.lgShell} /> layers: inner = coarse, surface = every document</span>
        <span><svg width="12" height="11" aria-hidden><path d="M6,0 L12,11 H0 Z" fill="var(--chart-mark)" /></svg> query</span>
        <span><svg width="12" height="11" aria-hidden><path d="M6,1.5 L11,10 H1 Z" fill="none" stroke="var(--chart-mark)" strokeWidth="1.6" /></svg> related document</span>
      </div>
      <p className={shared.disclaimer}>
        Illustrations with random data. The HNSW path is a real greedy search over randomly sampled layers; the CHART
        branches use similarity to the query or the related document as a stand-in for learned attention.
      </p>
    </figure>
  );
}
