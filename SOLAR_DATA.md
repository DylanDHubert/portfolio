# Solar Project: Data Checklist

What's needed to build the three data-driven visuals for `/blog/tsi-prediction-nasa-breakthrough`.
Any format is fine (PNG, JPG, FITS, NPY, CSV, notebooks). I'll convert and downsample, so send originals.

## Already in the repo

| File | What it is |
| --- | --- |
| `public/images/nasa/TSI_graph.png` | Matplotlib plot of TSI perturbation, Jan 2011 to Mar 2013 (image only, no underlying numbers) |
| `public/images/nasa/comparison.png` | One HMI frame next to its extracted-regions output, 224×224 px (image only) |
| `public/images/nasa/*.backup.*` | Larger originals of the two above |
| `public/images/nasa/nasaposter.JPG` | Photo of the **3D cloud** poster (a different project) |

No raw data, preprocessing stages, SSA components, or model outputs are in the repo.

## 1. Sun ↔ TSI scrubber (highest priority)

- [ ] **TSI series as numbers**: CSV with `timestamp, tsi` (or `tsi_perturbation`) for the period you plotted (2011–2013), at whatever cadence you used.
- [ ] **HMI frames** across that period, with a timestamp in each filename. 100–300 frames is plenty (for example one per day or every few days, plus extra around the big dips such as Aug 2011).
- [ ] **Matching preprocessed frames** (the "extracted regions" output) for the same timestamps.
- [ ] *Optional:* model predictions for the same period. With these the scrubber can show prediction against truth; without them it shows truth only.

## 2. Preprocessing stepper (DONE)

Built from your pasted function and the April 2024 intensitygrams in `data/solar-raw/` (gitignored). Regenerate with `python scripts/solar/build_stepper.py`.
Still useful: the original data loader, to confirm the float scaling (currently assumed ~0-60000).

<details><summary>Original request</summary>


For **2–3 example frames** (ideally one very active day and one quiet day):

- [ ] Raw HMI frame
- [ ] After Gaussian blur
- [ ] After edge extraction
- [ ] After thresholding
- [ ] The previous/next frames used for temporal differencing, and the differenced result
- [ ] Final output

**Alternative:** the preprocessing script or notebook (with its parameters) plus the raw frames. I can regenerate every stage myself, which is more faithful than guessing.

</details>

## 3. SSA explorer

- [ ] The **1-D series that went into SSA** (please confirm which: the HMI disk average, or TSI itself)
- [ ] **All SSA components** as columns in one CSV (the full decomposition, not just the 10 used)
- [ ] The **3-group recombination** the baseline used: which component indices went into main, trend, and noise
- [ ] The window size(s) used (1K for the baseline and 10 for yours, if I read the post right)

## Nice to have

- [ ] Real Informer config values (`d_model`, `seq_len`, `label_len`, `pred_len`) for the architecture diagram
- [ ] Any result plots or numbers you come across (the MSE table, prediction-vs-truth plots)
- [ ] Confirmation of where the 6 statistical features were computed from

## If something can't be found

HMI continuum images (JSOC / Helioviewer) and SORCE TIM TSI (LASP LISIRD) are public, so the scrubber could be rebuilt from public data.
It would then be labeled as public data rather than your original dataset. Its values may not match your plot exactly, because your baseline was `TSI − 1362`.
