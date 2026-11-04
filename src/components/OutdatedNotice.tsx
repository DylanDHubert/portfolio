"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./OutdatedNotice.module.scss";

const DISMISS_KEY = "outdated-notice-dismissed";

export function OutdatedNotice() {
  const [open, setOpen] = useState(false);
  const dismissRef = useRef<HTMLButtonElement>(null);

  // SHOW ONCE PER BROWSER SESSION UNTIL DISMISSED
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dismissRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // STORAGE CAN BE BLOCKED; CLOSING STILL WORKS FOR THIS VIEW
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={dismiss}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="outdated-notice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className={styles.kicker}>Heads up</p>
        <h2 id="outdated-notice-title" className={styles.title}>
          This site is out of date
        </h2>
        <p className={styles.body}>
          An update is on the way. Until then, please be warned that what you see here is not reflective of my current work.
        </p>
        <button ref={dismissRef} type="button" className={styles.dismiss} onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
