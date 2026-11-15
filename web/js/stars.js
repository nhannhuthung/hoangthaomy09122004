"use strict";
/* The twinkling stars, and the shapes stars are drawn with - a point, or a burst of rays. */

const N_STARS = 460, STAR_FLARES = 6, STAR_BIG = [0, 0, 3.2, 4.2], STAR_MIN = 2.0;
/* The star field is 2.5 wide. To fill wide windows it repeats sideways: how many extra copies on
   each side a window of this shape needs (none on a phone). */
const STAR_FIELD = 2.5;
const skyTiles = (aspect) => Math.max(0, Math.ceil((1.85 * aspect - STAR_FIELD / 2) / STAR_FIELD));
function star(i, t, tile = 0) {         // the twinkling stars: position, how bright, what kind
  // tile: which copy of the field (0 = the middle one). The other copies are mirrored and keep
  // their own time, so the repeat doesn't show.
  const g = DATA.stars, o = 6 * i;
  const g1 = tile ? fract(g[o + 1] + 0.618 * tile) : g[o + 1], g4 = tile ? fract(g[o + 4] + 0.382 * tile) : g[o + 4];
  const rise = fract(g1 + t * 0.006 * (0.5 + g[o + 3])), beat = 2.5 + 4.5 * g[o + 3];
  const peak = clamp(1 - Math.abs(fract(t / beat + g4) - 0.5) * beat / 0.24, 0, 1), m = g[o + 2] % 0.25;
  return {
    x: tile * STAR_FIELD + (tile % 2 ? -1 : 1) * (2.5 * g[o] - 1.25) + 0.04 * Math.sin(t * 0.5 + g[o + 5] * TAU),
    y: -1.75 + 3.1 * rise, z: -1.3 + 2.2 * g[o + 2],
    glow: (0.3 + 0.35 * g[o + 5] + peak ** 1.5) * smooth(rise / 0.06) * smooth((1 - rise) / 0.06),
    kind: i < STAR_FLARES ? (tile ? 2 : 3) : m < 0.045 ? 2 : m < 0.08 ? 1 : 0,   // the 6 big flares: middle copy only
  };
}
const TEMPLATES = new Map();
function starTemplate(size, k) {        // a point, or a burst whose straight rays reach further than its diagonals
  const key = size + "|" + k.toFixed(2);
  let tp = TEMPLATES.get(key);
  if (tp) return tp;
  tp = [[0, 0, "+", 0]];
  const nv = size ? Math.trunc(size + 0.5) + 1 : 0, nh = size ? Math.trunc(size * k + 0.5) + 2 : 0, nd = Math.trunc(size * 0.5 + 0.5);
  for (const [n, sr, sc, glyph] of [[nv, 1, 0, "|"], [nh, 0, 1, "-"]]) {
    for (let i = 1; i <= n; i++) { const ch = n >= 3 && i === n ? "." : glyph, f = i / (n + 1); tp.push([i * sr, i * sc, ch, f], [-i * sr, -i * sc, ch, f]); }
  }
  for (let i = 1; i <= nd; i++) {
    const dc = Math.trunc(i * k + 0.5), f = i / (nd + 1), tip = nd >= 2 && i === nd;
    tp.push([-i, dc, tip ? "." : "/", f], [i, -dc, tip ? "." : "/", f], [-i, -dc, tip ? "." : "\\", f], [i, dc, tip ? "." : "\\", f]);
  }
  TEMPLATES.set(key, tp);
  return tp;
}
function newCand() { return { r: [], c: [], ch: [], col: [], lvl: [], z: [] }; }
function candPush(cd, r, c, ch, col, lvl, z) { cd.r.push(r); cd.c.push(c); cd.ch.push(ch); cd.col.push(col); cd.lvl.push(lvl); cd.z.push(z); }
function addStar(cd, r, c, size, bright, mat, z, k) {
  size = Math.round(size * 2) / 2;
  for (const [dr, dc, g, f] of starTemplate(size, k)) {
    const lvl = bright * (1 - 0.75 * f), ch = size === 0 && dr === 0 && dc === 0 ? (bright >= 0.45 ? "+" : ".") : g;
    candPush(cd, r + dr, c + dc, ch, colourOf(mat, lvl), lvl, z);
  }
}
function onePerCell(g, cd, keep) {      // drop what is off screen or not wanted; where stars overlap keep the brightest
  const { rows, cols, bestLvl, bestIdx } = g, touched = [];
  for (let i = 0; i < cd.r.length; i++) {
    const r = cd.r[i], c = cd.c[i];
    if (r < 0 || r >= rows || c < 0 || c >= cols || !keep(r * cols + c, i)) continue;
    const cell = r * cols + c;
    if (bestIdx[cell] < 0) { touched.push(cell); bestIdx[cell] = i; bestLvl[cell] = cd.lvl[i]; }
    else if (cd.lvl[i] >= bestLvl[cell]) { bestIdx[cell] = i; bestLvl[cell] = cd.lvl[i]; }
  }
  const out = [];
  for (const cell of touched) { const i = bestIdx[cell]; out.push([cd.r[i], cd.c[i], cd.ch[i], cd.col[i]]); bestIdx[cell] = -1; }
  return out;
}
