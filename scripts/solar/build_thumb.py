"""
BUILD THE SOLAR BLOG THUMBNAIL FROM THE REAL APRIL 2024 HMI INTENSITYGRAMS.

USAGE (NEEDS opencv-python-headless AND numpy):
    python scripts/solar/build_thumb.py

READS:  data/solar-raw/hmi_ic_2024-04/*.jpg   (48 FRAMES, 18-22 APRIL 2024, EVERY 2.5 H, GITIGNORED)
WRITES: public/images/nasa/sun_sprite.webp    (ALL FRAMES SIDE BY SIDE, FOR FRAME-BY-FRAME PLAYBACK)
        src/components/blog/thumbs/sunSeries.json

THE LINE NEXT TO THE SUN IS MEASURED FROM THE SAME FRAMES: SUNSPOT DIMMING =
DARK-SPOT AREA WEIGHTED BY mu (HOW DIRECTLY EACH PIXEL FACES US). IT IS A PROXY
FOR THE SUNSPOT PART OF TSI, NOT A TSI MEASUREMENT.
"""

import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/solar-raw/hmi_ic_2024-04"
OUT_IMG = ROOT / "public/images/nasa/sun_sprite.webp"
OUT_JSON = ROOT / "src/components/blog/thumbs/sunSeries.json"

FRAME = 150  # PX PER FRAME IN THE SPRITE
# CROP TO THE SOLAR DISK; THIS ALSO DROPS THE BURNED-IN QUICK-LOOK LABEL AT THE BOTTOM LEFT
C0, C1 = 30, 994


def main():
    files = sorted(RAW.glob("*.jpg"))
    tiles = []
    series = []
    for f in files:
        img = cv2.imread(str(f))[C0:C1, C0:C1]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
        n = gray.shape[0]
        yy, xx = np.mgrid[0:n, 0:n]
        disk = gray > 25
        cy, cx = np.argwhere(disk).mean(axis=0)
        radius = np.sqrt(disk.sum() / np.pi)
        r = np.hypot(xx - cx, yy - cy) / radius
        inner = r < 0.97
        mu = np.sqrt(np.clip(1 - r**2, 0, 1))
        # SPOTS: PIXELS MUCH DARKER THAN THEIR SMOOTH SURROUNDINGS (REMOVES LIMB DARKENING)
        smooth = cv2.GaussianBlur(gray, (0, 0), 25)
        spot = inner & (gray < 0.78 * smooth)
        dim = float((spot * mu).sum() / inner.sum())
        series.append({"t": f.name[:15], "dim": dim})
        tiles.append(cv2.resize(img, (FRAME, FRAME), interpolation=cv2.INTER_AREA))
        print(f.name[:15], round(dim * 1e4, 2))

    sprite = np.hstack(tiles)
    cv2.imwrite(str(OUT_IMG), sprite, [cv2.IMWRITE_WEBP_QUALITY, 78])
    peak = max(s["dim"] for s in series)
    OUT_JSON.write_text(json.dumps({
        "frame": FRAME,
        "count": len(tiles),
        "start": series[0]["t"],
        "end": series[-1]["t"],
        # NORMALIZED 0-1 FOR PLOTTING (1 = MOST DIMMING IN THIS WINDOW)
        "dim": [round(s["dim"] / peak, 3) for s in series],
    }, indent=1) + "\n")
    print("sprite", sprite.shape, OUT_IMG.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
