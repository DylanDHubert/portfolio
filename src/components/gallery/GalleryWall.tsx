"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gallery } from "@/resources";
import meta from "./galleryMeta.json";
import { Lightbox, type Piece } from "./Lightbox";
import styles from "./Gallery.module.scss";

// CARD CHROME: PAPER MAT AROUND THE DRAWING, A TALLER STRIP UNDERNEATH FOR THE LABEL
// SMALLER CHROME ON PHONES SO THE DRAWINGS GET THE SPACE
const chrome = (width: number) =>
  width < 560 ? { MAT: 6, LABEL: 26, GAP_X: 14, GAP_Y: 26 } : { MAT: 10, LABEL: 36, GAP_X: 28, GAP_Y: 40 };

const pad = (n: number) => String(n).padStart(2, "0");

// SMALL DETERMINISTIC TILT PER CARD SO THE WALL LOOKS HAND-HUNG
const tilt = (i: number) => (((i * 37) % 7) - 3) * 0.55;

export const PIECES: Piece[] = gallery.images.map((img, i) => {
  const m = meta.find((x) => x.src === img.src);
  return {
    n: i + 1,
    label: `No. ${pad(i + 1)}`,
    title: img.title,
    src: img.src,
    alt: img.title ? `${img.title}, ${img.alt.toLowerCase()} drawing` : img.alt,
    width: m?.width ?? 3,
    height: m?.height ?? 4,
    color: m?.color ?? "#888888",
  };
});

interface Row {
  h: number;
  items: Piece[];
}

// JUSTIFIED ROWS: EVERY ROW FILLS THE WIDTH, EVERY DRAWING KEEPS ITS TRUE ASPECT RATIO
function layoutRows(pieces: Piece[], width: number, target: number): Row[] {
  const { MAT, GAP_X } = chrome(width);
  const rows: Row[] = [];
  let cur: Piece[] = [];
  const heightFor = (items: Piece[]) => {
    const aspects = items.reduce((s, p) => s + p.width / p.height, 0);
    return (width - GAP_X * (items.length - 1) - 2 * MAT * items.length) / aspects;
  };
  for (const p of pieces) {
    cur.push(p);
    const h = heightFor(cur);
    if (h <= target) {
      rows.push({ h, items: cur });
      cur = [];
    }
  }
  // LAST ROW: DON'T STRETCH A FEW CARDS ACROSS THE WHOLE WALL
  if (cur.length) rows.push({ h: Math.min(target, heightFor(cur)), items: cur });
  // A LONE LAST CARD JOINS THE ROW ABOVE IF THAT ROW WOULD STILL BE A DECENT HEIGHT
  if (rows.length > 1 && rows[rows.length - 1].items.length === 1) {
    const merged = [...rows[rows.length - 2].items, ...rows[rows.length - 1].items];
    const h = heightFor(merged);
    if (h >= target * 0.65) {
      rows.splice(rows.length - 2, 2, { h, items: merged });
    } else if (merged.length >= 4) {
      // OTHERWISE MOVE ONE CARD DOWN SO THE LAST ROW HAS COMPANY
      const top = merged.slice(0, -2);
      const bottom = merged.slice(-2);
      rows.splice(rows.length - 2, 2, { h: heightFor(top), items: top }, { h: Math.min(target, heightFor(bottom)), items: bottom });
    }
  }
  return rows;
}

export default function GalleryWall() {
  const wallRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // DEEP LINKS: /gallery#no-07 OPENS THAT PIECE
  useEffect(() => {
    const m = window.location.hash.match(/^#no-(\d+)$/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= PIECES.length) setOpen(n - 1);
    }
  }, []);

  const target = width > 900 ? 290 : width > 560 ? 220 : 140;
  const { MAT, LABEL, GAP_X, GAP_Y } = chrome(width);
  const rows = useMemo(() => (width ? layoutRows(PIECES, width, target) : []), [width, target]);

  return (
    <>
      <div ref={wallRef} className={styles.wall} style={{ visibility: width ? "visible" : "hidden" }}>
        {rows.map((row, r) => (
          <div key={r} className={styles.row} style={{ gap: GAP_X, marginBottom: r === rows.length - 1 ? 0 : GAP_Y }}>
            {row.items.map((p) => {
              // FLOOR SO ROUNDING NEVER PUSHES A ROW WIDER THAN THE WALL
              const w = Math.floor((p.width / p.height) * row.h);
              const h = Math.floor(row.h);
              return (
                <button
                  key={p.src}
                  type="button"
                  className={styles.card}
                  style={{ ["--tilt" as string]: `${tilt(p.n)}deg`, padding: `${MAT}px ${MAT}px 0` }}
                  onClick={() => setOpen(p.n - 1)}
                  aria-label={`Open ${p.label}${p.title ? `, ${p.title}` : ""}`}
                >
                  <span className={styles.tape} aria-hidden />
                  <span className={styles.frame} style={{ width: w, height: h, background: p.color }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={w}
                      height={h}
                      sizes={`${Math.ceil(w * 1.5)}px`}
                      className={styles.img}
                      priority={p.n <= 6}
                    />
                  </span>
                  <span className={styles.cardNo} style={{ height: LABEL }}>
                    <span className={p.title ? styles.cardName : styles.cardNameless}>{p.title ?? "Untitled"}</span>
                    <span className={styles.cardNum}>{p.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {open !== null && <Lightbox pieces={PIECES} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
