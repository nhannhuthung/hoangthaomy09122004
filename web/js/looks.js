"use strict";
/* How things look: the colour of every material, and the characters everything is drawn with. */

const MATERIALS = [
  // name,           colour stops dark / mid / light,                     shine, back face
  ["paper",         [[24, 24, 30], [66, 66, 76], [124, 124, 134]], 0.0, "paper_in"],
  ["paper_in",      [[16, 16, 22], [44, 44, 52], [86, 86, 96]], 0.0, null],
  ["rim",           [[60, 60, 70], [170, 170, 180], [236, 236, 242]], 0.3, null],
  ["ribbon",        [[120, 80, 0], [240, 188, 40], [255, 244, 160]], 0.6, null],
  ["stem",          [[10, 70, 30], [40, 190, 80], [150, 255, 170]], 0.0, null],
  ["foliage",       [[8, 60, 26], [30, 160, 70], [130, 240, 140]], 0.0, null],
  ["leaf",          [[10, 70, 30], [40, 190, 80], [150, 255, 160]], 0.3, null],
  ["blossom",       [[140, 140, 150], [236, 236, 246], [255, 255, 255]], 0.0, null],
  ["sepal",         [[10, 70, 30], [40, 180, 80], [150, 250, 160]], 0.0, null],
  ["rose_lavender", [[70, 38, 134], [148, 102, 236], [202, 164, 255]], 0.25, null],
  ["rose",          [[60, 10, 84], [172, 64, 224], [242, 184, 255]], 0.25, null],
  ["rose_deep",     [[34, 4, 60], [112, 36, 172], [200, 140, 246]], 0.25, null],
  ["rose_plum",     [[66, 8, 70], [176, 52, 188], [248, 182, 248]], 0.25, null],
  ["star",          [[110, 100, 120], [222, 212, 232], [255, 255, 255]], 0.0, null],
  ["gold",          [[150, 100, 10], [255, 210, 80], [255, 250, 200]], 0.0, null],
  ["glint",         [[140, 130, 150], [240, 236, 250], [255, 255, 255]], 0.0, null],
];
const MAT = {};
MATERIALS.forEach((m, i) => { MAT[m[0]] = i; });
const SHINE = MATERIALS.map((m) => m[2]);
const BACK = MATERIALS.map((m, i) => (m[3] ? MAT[m[3]] : i));
const ROSE_MATS = [MAT.rose_lavender, MAT.rose, MAT.rose_deep, MAT.rose_plum];
const IS_ROSE = new Uint8Array(MATERIALS.length);
ROSE_MATS.forEach((m) => { IS_ROSE[m] = 1; });
const N_SHADE = 12;
const PALETTE = ["rgb(0,0,0)"];
for (const m of MATERIALS) {
  const [lo, mid, hi] = m[1];
  for (let s = 0; s < N_SHADE; s++) {
    const x = s / (N_SHADE - 1), c = [0, 1, 2].map((i) => Math.round(x < 0.5 ? lo[i] + (mid[i] - lo[i]) * 2 * x : mid[i] + (hi[i] - mid[i]) * (2 * x - 1)));
    PALETTE.push(`rgb(${c[0]},${c[1]},${c[2]})`);
  }
}
const N_COLORS = PALETTE.length;
const colourOf = (mat, level) => 1 + mat * N_SHADE + clamp(Math.floor(level * N_SHADE), 0, N_SHADE - 1);

// characters by brightness, darkest first: a cell picks one of its set at random, and keeps picking
// anew every so often - so the letters run. Roses use rounder, curly ones. Edges get strokes instead.
const GLYPH_SETS = [".,'`", ":;-~=", "+=<>!()[]{}il", "cvxzrtjnu", "oeasmwkQ0", "&%$#8B@"];
const ROSE_GLYPH_SETS = [".", ".:'", "co", "oce", "@&%", "@&"];
const GLYPH_LIMITS = [0.12, 0.25, 0.42, 0.6, 0.78];
const STROKE_CHARS = "-/|\\_" + "()_-/\\";               // edge strokes 0-4, then the petals' outlines
const PICKS = 64;
const codesOf = (sets) => sets.map((s) => Uint16Array.from({ length: PICKS }, (_, i) => s.charCodeAt(i % s.length)));
const SET_CODES = codesOf(GLYPH_SETS), ROSE_CODES = codesOf(ROSE_GLYPH_SETS);
const STROKE_CODES = Uint16Array.from(STROKE_CHARS, (c) => c.charCodeAt(0));
const CHAR_STR = [];
for (let i = 0; i < 128; i++) CHAR_STR.push(String.fromCharCode(i));
function bucketOf(lum) { let b = 0; while (b < 5 && lum >= GLYPH_LIMITS[b]) b++; return b; }
