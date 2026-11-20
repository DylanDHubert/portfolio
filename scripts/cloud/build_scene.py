"""
BUILD THE DATA FOR THE CLOUD PROJECT 3D SCENE FROM ONE REAL GOES-16 SCENE.

USAGE (NEEDS h5py, numpy, opencv-python-headless):
    python scripts/cloud/build_scene.py

READS:  data/cloud-raw/goes16_20190113_2052/*.nc   (NOAA GOES-16 ON AWS, GITIGNORED)
        - ABI-L2-CMIPC BANDS 1, 2, 3 (TRUE COLOR) AND 13 (10.3 UM INFRARED)
        - ABI-L2-ACMC BINARY CLOUD MASK
WRITES: public/images/nasa/cloud/board.webp   (TRUE-COLOR TEXTURE FOR THE BOARD)
        src/components/cloud/sceneData.json   (CLOUD FRACTION + TOP HEIGHT GRID)

WHAT IS REAL AND WHAT IS ESTIMATED:
- THE IMAGE AND CLOUD MASK ARE REAL GOES-16 PRODUCTS.
- CLOUD-TOP HEIGHT IS ESTIMATED FROM BAND 13 BRIGHTNESS TEMPERATURE WITH A
  STANDARD 6.5 K/KM LAPSE RATE BELOW THE CLEAR-SKY SURFACE TEMPERATURE.
- CLOUD THICKNESS (BASE HEIGHT) IS AN ILLUSTRATIVE ASSUMPTION IN THE FRONT END.
"""

import glob
import json
from pathlib import Path

import cv2
import h5py
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/cloud-raw/goes16_20190113_2052"
OUT_IMG = ROOT / "public/images/nasa/cloud"
OUT_JSON = ROOT / "src/components/cloud/sceneData.json"

# CROP ON THE 2 KM GRID (ROW/COL START AND SIZE): GULF OF MEXICO COLD FRONT
Y0, X0, SIZE_2KM = 640, 640, 600
GRID = 64
TEXTURE = 1024
LAPSE_K_PER_KM = 6.5


def load(pattern, var="CMI"):
    f = h5py.File(glob.glob(str(RAW / pattern))[0], "r")
    v = f[var]
    a = v[...].astype(np.float32)
    fill = v.attrs.get("_FillValue")
    bad = a == fill[0] if fill is not None else np.zeros(a.shape, bool)
    sf = float(v.attrs.get("scale_factor", [1])[0])
    off = float(v.attrs.get("add_offset", [0])[0])
    if var == "CMI":
        a = a * sf + off
    a[bad] = np.nan
    return a


def crop(a, scale):
    # SCALE = NATIVE PIXELS PER 2 KM PIXEL
    return a[Y0 * scale:(Y0 + SIZE_2KM) * scale, X0 * scale:(X0 + SIZE_2KM) * scale]


def area(a, size):
    return cv2.resize(np.nan_to_num(a), (size, size), interpolation=cv2.INTER_AREA)


def main():
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    # TRUE COLOR AT 1 KM: BLUE (C01), RED (C02, 0.5 KM), VEGGIE (C03), SYNTHETIC GREEN
    blue = area(crop(load("*C01*"), 2), TEXTURE)
    red = area(crop(load("*C02*"), 4), TEXTURE)
    veg = area(crop(load("*C03*"), 2), TEXTURE)
    green = 0.45 * red + 0.1 * veg + 0.45 * blue
    rgb = np.clip(np.dstack([blue, green, red]), 0, 1) ** (1 / 2.2)
    cv2.imwrite(str(OUT_IMG / "board.webp"), np.uint8(rgb * 255), [cv2.IMWRITE_WEBP_QUALITY, 85])

    # CLOUD MASK AND INFRARED ON THE 2 KM GRID
    bcm = crop(load("*ACMC*", "BCM"), 1)
    t13 = crop(load("*C13*"), 1)
    cloudy = bcm == 1
    t_surface = float(np.nanmedian(t13[~cloudy & ~np.isnan(t13)]))
    top_km = np.clip((t_surface - t13) / LAPSE_K_PER_KM, 0.3, 14.0)
    top_km[~cloudy] = 0

    frac = area(cloudy.astype(np.float32), GRID)
    # MEAN TOP HEIGHT OVER CLOUDY PIXELS ONLY
    top_sum = area(top_km, GRID)
    top = np.where(frac > 0.01, top_sum / np.maximum(frac, 1e-6), 0)

    OUT_JSON.write_text(json.dumps({
        "grid": GRID,
        "source": "GOES-16 ABI, 13 Jan 2019 20:52 UTC, Gulf of Mexico",
        "surfaceK": round(t_surface, 1),
        "frac": [int(round(v * 100)) for v in frac.flatten()],
        "topKm": [round(float(v), 1) for v in top.flatten()],
    }, separators=(",", ":")) + "\n")
    print("surface K", t_surface, "cloudy%", round(100 * cloudy.mean(), 1), "max top", round(float(top.max()), 1))


if __name__ == "__main__":
    main()
