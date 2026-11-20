"use client";

import { ChartThumb } from "./ChartThumb";
import { CloudThumb } from "./CloudThumb";
import { SolarThumb } from "./SolarThumb";
import styles from "./Thumbs.module.scss";

// PICKS THE ANIMATED THUMBNAIL NAMED BY A POST'S `thumb:` FRONTMATTER FIELD, WITH AN OPTIONAL `badge:`
export function PostThumb({ kind, badge }: { kind: string; badge?: string }) {
  const art = kind === "solar" ? <SolarThumb /> : kind === "cloud" ? <CloudThumb /> : kind === "chart" ? <ChartThumb /> : null;
  if (!art) return null;
  return (
    <div className={styles.thumbWrap}>
      {art}
      {badge && (
        <span className={styles.badge}>
          {/* NASA INSIGNIA ("MEATBALL") FOR POSTS ABOUT WORK DONE AT NASA */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/nasa/nasa-logo.svg" alt="NASA" width={26} height={22} className={styles.badgeLogo} />
          {badge}
        </span>
      )}
    </div>
  );
}

export const hasThumb = (kind?: string) => kind === "solar" || kind === "cloud" || kind === "chart";
