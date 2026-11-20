// 8 x 8 PATCH GRID OVER THE CHIP, LIKE A VISION TRANSFORMER'S TOKENS
export const P = 8;
export const PATCHES = P * P;

// SEEDED SHUFFLE SO EVERY RESHUFFLE IS REPRODUCIBLE; MASKS EXACTLY round(ratio * PATCHES) PATCHES
export function maskFor(seed: number, ratio: number): boolean[] {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const idx = Array.from({ length: PATCHES }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const out = new Array(PATCHES).fill(false);
  idx.slice(0, Math.round(ratio * PATCHES)).forEach((i) => (out[i] = true));
  return out;
}

// PER-BAND MASK: ONE SHARED MASK (DEPENDENT) OR A DIFFERENT MASK FOR EACH BAND (INDEPENDENT)
export function bandMask(mode: "dependent" | "independent", band: number, seed: number, ratio: number): boolean[] {
  return mode === "dependent" ? maskFor(seed, ratio) : maskFor(seed * 31 + band * 977 + 1, ratio);
}
