"""
MEASURE EVERY GALLERY DRAWING: TRUE SIZE (SO NOTHING IS CROPPED) AND A DOMINANT COLOR
(SHOWN AS THE PLACEHOLDER WHILE THE IMAGE LOADS).

USAGE (NEEDS opencv-python-headless AND numpy):
    python scripts/gallery/build_meta.py

READS:  public/images/gallery/*.jpeg (IN THE ORDER LISTED IN src/resources/content.tsx)
WRITES: src/components/gallery/galleryMeta.json
"""

import json
import re
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "src/resources/content.tsx"
OUT = ROOT / "src/components/gallery/galleryMeta.json"


def dominant_color(img: np.ndarray) -> str:
    # K-MEANS ON A SMALL COPY; PICK THE MOST POPULAR CLUSTER THAT ISN'T NEAR-WHITE PAPER
    small = cv2.resize(img, (64, 64), interpolation=cv2.INTER_AREA).reshape(-1, 3).astype(np.float32)
    k = 4
    _, labels, centers = cv2.kmeans(small, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0), 3, cv2.KMEANS_PP_CENTERS)
    counts = np.bincount(labels.flatten(), minlength=k)
    for idx in np.argsort(-counts):
        b, g, r = centers[idx]
        if min(r, g, b) < 225:
            return f"#{int(r):02x}{int(g):02x}{int(b):02x}"
    b, g, r = centers[np.argmax(counts)]
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}"


def main():
    srcs = re.findall(r'src:\s*"(/images/gallery/[^"]+)"', CONTENT.read_text())
    meta = []
    for src in srcs:
        img = cv2.imread(str(ROOT / "public" / src.lstrip("/")))
        h, w = img.shape[:2]
        meta.append({"src": src, "width": w, "height": h, "color": dominant_color(img)})
        print(src, w, h, meta[-1]["color"])
    OUT.write_text(json.dumps(meta, indent=2) + "\n")


if __name__ == "__main__":
    main()
