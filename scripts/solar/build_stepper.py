"""
EXPORT EVERY STAGE OF THE HMI PREPROCESSING PIPELINE FOR THE WEB STEPPER.

USAGE (NEEDS opencv-python-headless AND numpy):
    python scripts/solar/build_stepper.py

READS:  data/solar-raw/hmi_ic_2024-04/*.jpg   (SDO/HMI QUICK-LOOK CONTINUUM, GITIGNORED)
WRITES: public/images/nasa/stepper/<frame>/<stage>.webp
        src/components/solar/stepperData.json

NOTE: THE ORIGINAL PIPELINE RAN ON FLOAT HMI INTENSITIES, NOT 8-BIT JPEGS.
THE QUICK-LOOK JPEGS ARE RESCALED TO ~0-60000 (RAW HMI CONTINUUM SCALE) SO THE
HAND-TUNED CONSTANTS (THRESHOLD 50, alpha 0.2) BEHAVE AS ORIGINALLY INTENDED.
"""

import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/solar-raw/hmi_ic_2024-04"
OUT_IMG = ROOT / "public/images/nasa/stepper"
OUT_JSON = ROOT / "src/components/solar/stepperData.json"

SIZE = 512
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
INTENSITY_SCALE = 60000.0
FRAMES = [
    "20240418_123000",
    "20240420_120000",
    "20240422_113000",
]


def pipeline(X):
    # THE ORIGINAL HAND-BUILT FUNCTION, UNCHANGED, EXCEPT IT RETURNS EVERY STAGE
    LF = cv2.GaussianBlur(X, (5, 5), 0)
    HF = X - LF
    X1 = cv2.GaussianBlur(HF, (11, 11), 1)
    X2 = cv2.convertScaleAbs(X1, alpha=0.2, beta=0)
    X3 = cv2.GaussianBlur(X2, (5, 5), 0)
    X4 = X3 > 50
    X5 = X4 * X
    X6 = cv2.normalize(X5, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    X7 = X6 > 0.6
    X_Final = X * X7
    return dict(X=X, LF=LF, HF=HF, X1=X1, X2=X2, X3=X3, X4=X4, X5=X5, X6=X6, X7=X7, X_Final=X_Final)


def to_u8(a, lo=None, hi=None):
    a = a.astype(np.float32)
    lo = a.min() if lo is None else lo
    hi = a.max() if hi is None else hi
    return np.uint8(np.clip(255 * (a - lo) / (hi - lo + 1e-9), 0, 255))


def diverging(a, disk):
    # SIGNED DATA: BLUE = NEGATIVE (DARKER THAN SURROUNDINGS), ORANGE = POSITIVE
    lim = np.percentile(np.abs(a[disk]), 99.5) + 1e-9
    t = np.clip(a / lim, -1, 1)
    neg = np.array([255, 140, 40], np.float32)  # BGR BLUE
    pos = np.array([40, 140, 255], np.float32)  # BGR ORANGE
    base = np.full(a.shape + (3,), 18, np.float32)
    out = base + np.where(t[..., None] < 0, -t[..., None] * (neg - 18), t[..., None] * (pos - 18))
    return np.uint8(np.clip(out, 0, 255))


def magma(a, lo=None, hi=None):
    return cv2.applyColorMap(to_u8(a, lo, hi), cv2.COLORMAP_INFERNO)


def mask_img(m):
    return np.where(m, 245, 14).astype(np.uint8)


def main():
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    frames_meta = []
    for name in FRAMES:
        src = cv2.imread(str(RAW / f"{name}_1024_HMIIC.jpg"))
        # HIDE THE BURNED-IN "SDO/HMI QUICK-LOOK" LABEL SO IT DOESN'T READ AS STRUCTURE
        src[990:, :420] = 0
        color = cv2.resize(src, (SIZE, SIZE), interpolation=cv2.INTER_AREA)
        gray = cv2.cvtColor(color, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0 * INTENSITY_SCALE
        st = pipeline(gray)
        disk = gray > 0.05 * INTENSITY_SCALE

        renders = {
            "X": color,
            "LF": to_u8(st["LF"]),
            "HF": diverging(st["HF"], disk),
            "X1": diverging(st["X1"], disk),
            "X2": magma(st["X2"], 0, 255),
            "X3": magma(st["X3"], 0, 255),
            "X4": mask_img(st["X4"]),
            "X5": to_u8(st["X5"], 0, INTENSITY_SCALE),
            "X6": magma(st["X6"], 0, 1),
            "X7": mask_img(st["X7"]),
            # FINAL = ORIGINAL TIMES MASK; SHOWN WITH THE ORIGINAL COLORS
            "X_Final": (color * st["X7"][..., None]).astype(np.uint8),
        }

        d = OUT_IMG / name
        d.mkdir(exist_ok=True)
        for k, img in renders.items():
            cv2.imwrite(str(d / f"{k}.webp"), img, [cv2.IMWRITE_WEBP_QUALITY, 82])

        disk_px = int(disk.sum())
        frames_meta.append({
            "id": name,
            "label": f"{MONTHS[int(name[4:6]) - 1]} {int(name[6:8])}, {name[9:11]}:{name[11:13]} UT",
            "stats": {
                "X3max": int(st["X3"].max()),
                "X4kept": round(100 * float(st["X4"][disk].sum()) / disk_px, 2),
                "X7kept": round(100 * float(st["X7"][disk].sum()) / disk_px, 2),
            },
        })
        print(name, frames_meta[-1]["stats"])

    OUT_JSON.write_text(json.dumps({"size": SIZE, "frames": frames_meta}, indent=2) + "\n")


if __name__ == "__main__":
    main()
