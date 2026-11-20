"""
EXPORT ONE 16-BAND GOES-16 CHIP FOR THE MASKING VISUALIZER.

USAGE (NEEDS h5py, numpy, opencv-python-headless):
    python scripts/cloud/build_bands.py

READS:  data/cloud-raw/goes16_20190113_2052/*MCMIPC*.nc   (ALL 16 ABI BANDS, 2 KM GRID, GITIGNORED)
WRITES: public/images/nasa/cloud/bands/C01.webp ... C16.webp
        src/components/cloud/bandsData.json

EACH BAND IS CONTRAST-STRETCHED ON ITS OWN (1ST-99TH PERCENTILE) FOR DISPLAY.
INFRARED BANDS (7-16) ARE INVERTED SO COLD CLOUD TOPS LOOK BRIGHT, AS IN STANDARD IMAGERY.
"""

import glob
import json
from pathlib import Path

import cv2
import h5py
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/cloud-raw/goes16_20190113_2052"
OUT_IMG = ROOT / "public/images/nasa/cloud/bands"
OUT_RAW = ROOT / "public/images/nasa/cloud/bands_raw"
OUT_JSON = ROOT / "src/components/cloud/bandsData.json"

# PHYSICAL ENCODING FOR THE COLOR MIXER: 8-BIT LINEAR OVER A FIXED RANGE PER BAND TYPE
REFL_RANGE = (0.0, 1.2)      # REFLECTANCE FACTOR, BANDS 1-6
BT_RANGE = (180.0, 320.0)    # BRIGHTNESS TEMPERATURE IN KELVIN, BANDS 7-16

# CHIP CENTER FROM THE GOES FIXED-GRID PROJECTION (23.37 N, 96.30 W) AND SCAN TIME, FOR SUN-ANGLE CORRECTION
CENTER_LAT, CENTER_LON = 23.37, -96.30
SCAN_UTC_HOURS, DAY_OF_YEAR = 20 + 53 / 60, 13


def cos_solar_zenith(lat, lon, utc_hours, doy):
    # NOAA SIMPLIFIED SOLAR POSITION (GOOD TO A FRACTION OF A DEGREE)
    g = 2 * np.pi / 365 * (doy - 1 + (utc_hours - 12) / 24)
    decl = 0.006918 - 0.399912 * np.cos(g) + 0.070257 * np.sin(g) - 0.006758 * np.cos(2 * g) \
        + 0.000907 * np.sin(2 * g) - 0.002697 * np.cos(3 * g) + 0.00148 * np.sin(3 * g)
    eot = 229.18 * (0.000075 + 0.001868 * np.cos(g) - 0.032077 * np.sin(g) - 0.014615 * np.cos(2 * g) - 0.040849 * np.sin(2 * g))
    solar_minutes = utc_hours * 60 + eot + 4 * lon
    ha = np.radians(solar_minutes / 4 - 180)
    la = np.radians(lat)
    return float(np.sin(la) * np.sin(decl) + np.cos(la) * np.cos(decl) * np.cos(ha))


# 256 x 256 PIXELS AT 2 KM: A 512 KM CHIP WITH HIGH ICE CLOUD, THE FRONT, AND OPEN GULF
Y0, X0, SIZE = 940, 650, 256
OUT_PX = 256

BANDS = [
    ("Blue", "visible"), ("Red", "visible"), ("Veggie", "near-IR"), ("Cirrus", "near-IR"),
    ("Snow/Ice", "near-IR"), ("Cloud particle", "near-IR"), ("Shortwave IR", "infrared"),
    ("Upper water vapor", "water vapor"), ("Mid water vapor", "water vapor"), ("Lower water vapor", "water vapor"),
    ("Cloud-top phase", "infrared"), ("Ozone", "infrared"), ("Clean IR", "infrared"),
    ("IR", "infrared"), ("Dirty IR", "infrared"), ("CO2", "infrared"),
]


def main():
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    OUT_RAW.mkdir(parents=True, exist_ok=True)
    f = h5py.File(glob.glob(str(RAW / "*MCMIPC*"))[0], "r")
    meta = []
    mu0 = cos_solar_zenith(CENTER_LAT, CENTER_LON, SCAN_UTC_HOURS, DAY_OF_YEAR)
    print("cos(solar zenith) =", round(mu0, 3))
    for i, (name, group) in enumerate(BANDS, start=1):
        v = f[f"CMI_C{i:02d}"]
        a = v[Y0:Y0 + SIZE, X0:X0 + SIZE].astype(np.float32)
        bad = a == v.attrs["_FillValue"][0]
        a = a * float(v.attrs["scale_factor"][0]) + float(v.attrs["add_offset"][0])
        a[bad] = np.nan
        # PHYSICAL VERSION (LOSSLESS) SO THE MIXER CAN APPLY OFFICIAL RGB RECIPE RANGES
        plo, phi = REFL_RANGE if i <= 6 else BT_RANGE
        # REFLECTANCE BANDS ARE NORMALIZED BY THE SUN ANGLE, AS OPERATIONAL RGB IMAGERY DOES
        phys = a / mu0 if i <= 6 else a
        raw = np.uint8(np.clip((np.nan_to_num(phys, nan=plo) - plo) / (phi - plo), 0, 1) * 255 + 0.5)
        raw = cv2.resize(raw, (OUT_PX, OUT_PX), interpolation=cv2.INTER_AREA)
        cv2.imwrite(str(OUT_RAW / f"C{i:02d}.webp"), raw, [cv2.IMWRITE_WEBP_QUALITY, 101])

        lo, hi = np.nanpercentile(a, 1), np.nanpercentile(a, 99)
        t = np.clip((a - lo) / (hi - lo + 1e-9), 0, 1)
        if i >= 7:
            t = 1 - t
        img = cv2.resize(np.uint8(np.nan_to_num(t) * 255), (OUT_PX, OUT_PX), interpolation=cv2.INTER_AREA)
        cv2.imwrite(str(OUT_IMG / f"C{i:02d}.webp"), img, [cv2.IMWRITE_WEBP_QUALITY, 80])
        meta.append({
            "id": f"C{i:02d}",
            "name": name,
            "group": group,
            "um": round(float(f[f"band_wavelength_C{i:02d}"][0]), 2),
            "kind": "refl" if i <= 6 else "bt",
            "rawMin": plo,
            "rawMax": phi,
        })
    OUT_JSON.write_text(json.dumps({"size": OUT_PX, "sunCos": round(mu0, 3), "bands": meta}, indent=2) + "\n")
    print("wrote", len(meta), "bands")


if __name__ == "__main__":
    main()
