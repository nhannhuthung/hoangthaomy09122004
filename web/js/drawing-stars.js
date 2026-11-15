"use strict";
/* The sparkling stars that draw the bouquet: they lead the stems, wait at the tips, and spread over the top. */

// the sparkling stars that draw the bouquet: they lead the stems, wait at the tips, spread over the top
const STEM_LOW = [], STEM_HIGH = [], RS_START = [], RS_BASE = [], RS_BEND = [], N_TOP_PENS = 16;
for (let k = 0; k < 9; k++) {
  const f = Math.sqrt((k + 1) / 9), sx = 0.026 * Math.sin(1.7 * k) * f, sz = 0.026 * Math.cos(1.7 * k) * f;
  STEM_LOW.push([sx * 2.4, BOTTOM_Y, sz * 2.4]); STEM_HIGH.push([sx, WAIST_Y + 0.1, sz]);
}
for (let k = 0; k < N_ROSES; k++) {
  const start = [0.026 * Math.sin(1.7 * k), WAIST_Y + 0.1, 0.026 * Math.cos(1.7 * k)];
  const base = [0, 1, 2].map((i) => ROSE_POS[k][i] - ROSE_DIR[k][i] * 0.02);
  RS_START.push(start); RS_BASE.push(base); RS_BEND.push([0.35 * base[0], 0.5 * (start[1] + base[1]), 0.35 * base[2]]);
}
function pens(t, fn) {
  const y = grownTo(t);
  for (let k = 0; k < 9; k++) {                             // up the bundle
    const lo = STEM_LOW[k], hi = STEM_HIGH[k], f = (y - lo[1]) / (hi[1] - lo[1]);
    if (f >= 0 && f <= 1) fn(lo[0] + (hi[0] - lo[0]) * f, lo[1] + (hi[1] - lo[1]) * f, lo[2] + (hi[2] - lo[2]) * f, 1);
  }
  for (let k = 0; k < N_ROSES; k++) {                       // out along each rose's stem, waiting there for its bud
    let u = (y - RS_START[k][1]) / (RS_BASE[k][1] - RS_START[k][1]);
    if (!(u >= 0 && t < T_BUD[k] + 0.25)) continue;
    u = clamp(u, 0, 1);
    const a = (1 - u) ** 2, b = 2 * (1 - u) * u, c = u * u, s = RS_START[k], m = RS_BEND[k], e = RS_BASE[k];
    fn(a * s[0] + b * m[0] + c * e[0], a * s[1] + b * m[1] + c * e[1], a * s[2] + b * m[2] + c * e[2], 1 - smooth((t - T_BUD[k]) / 0.25));
  }
  const s = (t - T_TOP[0]) / (T_TOP[1] - T_TOP[0]);         // spreading over the top
  if (s >= 0 && s < 1.2) {
    const tilt = 1.25 * Math.min(s, 1), b = 1 - smooth((s - 1) / 0.2);
    for (let i = 0; i < N_TOP_PENS; i++) {
      const az = TAU * i / N_TOP_PENS + 0.2 + 0.15 * Math.sin(6 * s + i);
      fn(DOME[0] + 0.66 * Math.sin(tilt) * Math.sin(az), DOME[1] + 0.66 * Math.cos(tilt), DOME[2] + 0.66 * Math.sin(tilt) * Math.cos(az), b);
    }
  }
}
