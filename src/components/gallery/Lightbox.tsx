"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gallery } from "@/resources";
import styles from "./Gallery.module.scss";

export interface Piece {
  n: number;
  label: string;
  title?: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  color: string;
}

const ZOOM = 2.5;

export function Lightbox({ pieces, index, onIndex, onClose }: { pieces: Piece[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const piece = pieces[index];
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [loaded, setLoaded] = useState(false);
  const down = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (d: number) => {
      setZoomed(false);
      setLoaded(false);
      onIndex((index + d + pieces.length) % pieces.length);
    },
    [index, onIndex, pieces.length],
  );

  // KEYBOARD: ESC CLOSES, ARROWS MOVE BETWEEN PIECES
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // LOCK PAGE SCROLL, FOCUS THE CLOSE BUTTON, AND KEEP THE URL HASH IN SYNC FOR SHARING
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
  }, []);
  useEffect(() => {
    history.replaceState(null, "", `#no-${String(piece.n).padStart(2, "0")}`);
  }, [piece.n]);

  // PRELOAD THE NEIGHBORS SO ARROWING THROUGH FEELS INSTANT
  useEffect(() => {
    [1, -1].forEach((d) => {
      const im = new window.Image();
      im.src = pieces[(index + d + pieces.length) % pieces.length].src;
    });
  }, [index, pieces]);

  const pointAt = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const onDown = (e: React.PointerEvent<HTMLElement>) => {
    down.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = down.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true;
    // WHEN ZOOMED, THE MAGNIFIED SPOT FOLLOWS THE MOUSE (OR THE DRAGGING FINGER)
    if (zoomed && (e.pointerType === "mouse" || d)) setOrigin(pointAt(e));
  };
  const onUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = down.current;
    down.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    // SWIPE TO NAVIGATE WHEN NOT ZOOMED; A TAP OR CLICK TOGGLES ZOOM AT THAT SPOT
    if (!zoomed && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (!d.moved) {
      setOrigin(pointAt(e));
      setZoomed((z) => !z);
    }
  };

  const aspect = piece.width / piece.height;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${piece.label}${piece.title ? `, ${piece.title}` : ""}, ${gallery.medium}`} onClick={onClose}>
      <div className={styles.viewer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.viewerCard}>
          <div
            className={styles.viewerFrame}
            style={{ aspectRatio: `${aspect}`, background: piece.color, ["--aspect" as string]: aspect }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => (down.current = null)}
          >
            {/* FULL-RESOLUTION ORIGINAL, SO ZOOMING SHOWS REAL DETAIL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={piece.src}
              src={piece.src}
              alt={piece.alt}
              draggable={false}
              onLoad={() => setLoaded(true)}
              className={styles.viewerImg}
              style={{
                opacity: loaded ? 1 : 0,
                transform: zoomed ? `scale(${ZOOM})` : "none",
                transformOrigin: `${origin.x}% ${origin.y}%`,
                cursor: zoomed ? "zoom-out" : "zoom-in",
              }}
            />
          </div>
          <div className={styles.placard}>
            <strong>{piece.title ?? "Untitled"}</strong>
            <span>{piece.label}</span>
            <span className={styles.medium}>{gallery.medium}</span>
            <span className={styles.count}>
              {piece.n} / {pieces.length}
            </span>
          </div>
        </div>
        <p className={styles.hint}>{zoomed ? "Move to look around · click to zoom out" : "Click to zoom · ← → to browse · Esc to close"}</p>
      </div>

      <button ref={closeRef} type="button" className={`${styles.navBtn} ${styles.closeBtn}`} onClick={onClose} aria-label="Close">
        ×
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous piece">
        ←
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next piece">
        →
      </button>
    </div>,
    document.body,
  );
}
