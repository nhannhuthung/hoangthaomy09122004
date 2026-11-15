"use strict";
/* The stems, the foliage dome, the leaves and the baby's breath. */

function tube(curve, radius, around, put) {
  const n = curve.length;
  for (let i = 0; i < n; i++) {
    const i0 = i > 0 ? i - 1 : 0, i1 = i < n - 1 ? i + 1 : n - 1, s = i1 - i0;
    const d = unit([0, 1, 2].map((c) => (curve[i1][c] - curve[i0][c]) / s));
    const side = unit(cross(d, Math.abs(d[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0])), up = cross(side, d);
    for (let j = 0; j < around; j++) {
      const a = TAU * j / around, c = Math.cos(a), sn = Math.sin(a);
      const nv = [0, 1, 2].map((m) => c * side[m] + sn * up[m]);
      put(curve[i][0] + radius * nv[0], curve[i][1] + radius * nv[1], curve[i][2] + radius * nv[2], nv);
    }
  }
}
function stems(put) {
  for (let k = 0; k < 9; k++) {
    const f = Math.sqrt((k + 1) / 9), sx = 0.026 * Math.sin(1.7 * k) * f, sz = 0.026 * Math.cos(1.7 * k) * f;
    const top = [sx, WAIST_Y + 0.1, sz], end = [sx * 2.4, BOTTOM_Y, sz * 2.4];
    tube(Array.from(linspace(0, 1, 40), (u) => [0, 1, 2].map((c) => top[c] + (end[c] - top[c]) * u)), 0.013, 8, put);
  }
  for (let k = 0; k < N_ROSES; k++) {
    const base = [0, 1, 2].map((c) => ROSE_POS[k][c] - ROSE_DIR[k][c] * 0.02);
    const start = [0.026 * Math.sin(1.7 * k), WAIST_Y + 0.1, 0.026 * Math.cos(1.7 * k)];
    const bend = [0.35 * base[0], 0.5 * (start[1] + base[1]), 0.35 * base[2]];
    tube(Array.from(linspace(0, 1, 30), (u) => [0, 1, 2].map((c) => (1 - u) ** 2 * start[c] + 2 * (1 - u) * u * bend[c] + u * u * base[c])), 0.011, 6, put);
  }
}
function foliage(put) {                 // the dome: 90 steps round x 20 down from the top
  const TI = linspace(0, 1.25, 20), AA = linspace(0, TAU, 90, false), G = new Float64Array(90 * 20 * 3);
  for (let i = 0; i < 90; i++) for (let j = 0; j < 20; j++) {
    const a = AA[i], t = TI[j], r = 0.6 + 0.012 * Math.sin(7 * a + 14 * t), k = (i * 20 + j) * 3;
    G[k] = DOME[0] + r * Math.sin(t) * Math.sin(a); G[k + 1] = DOME[1] + r * Math.cos(t); G[k + 2] = DOME[2] + r * Math.sin(t) * Math.cos(a);
  }
  const N = gridNormals(G, 90, 20, () => [0, 1, 0]);
  for (let i = 0; i < 90; i++) for (let j = 0; j < 20; j++) {
    const k = (i * 20 + j) * 3;
    put(G[k], G[k + 1], G[k + 2], [N[k], N[k + 1], N[k + 2]], topTime(TI[j]));   // drawn by the stars from the top
  }
}
const SPHERE = [];
for (let i = 0; i < 14; i++) { const h = 1 - (i + 0.5) / 7, s = Math.sqrt(1 - h * h); SPHERE.push([Math.cos(2.39996 * i) * s, h, Math.sin(2.39996 * i) * s]); }
function blossoms(put) {                // little white sprays of baby's breath over the foliage
  const BL = DATA.bl;
  for (let b = 0; b < 110; b++) {
    const tilt = 1.2 * Math.sqrt(BL[3 * b]), a = TAU * BL[3 * b + 1], rad = 0.62 + 0.04 * BL[3 * b + 2];
    const c = [DOME[0] + rad * Math.sin(tilt) * Math.sin(a), DOME[1] + rad * Math.cos(tilt), DOME[2] + rad * Math.sin(tilt) * Math.cos(a)];
    for (const s of SPHERE) put(c[0] + 0.022 * s[0], c[1] + 0.022 * s[1], c[2] + 0.022 * s[2], s, topTime(tilt) + 0.15);
  }
}
function leaves(put) {                  // rose leaves tucked in under the flowers, poking out over the paper
  const LF = DATA.lf, ALG = linspace(0, 1, 24), ACR = linspace(-1, 1, 7);
  for (let j = 0; j < 15; j++) {
    const a = TAU * (j + 0.5 * LF[3 * j]) / 15, out = [Math.sin(a), 0, Math.cos(a)], side = [Math.cos(a), 0, -Math.sin(a)];
    const behind = (1 - Math.cos(a)) / 2, bu = unit([out[0], 0.5, out[2]]);
    const base = [DOME[0] + 0.52 * bu[0], DOME[1] + 0.52 * bu[1], DOME[2] + 0.52 * bu[2]];
    const head = unit([out[0], 0.35 + 0.9 * behind + 0.3 * LF[3 * j + 1], out[2]]);
    let flat = unit(cross(head, side));
    if (!(flat[1] > 0)) flat = [-flat[0], -flat[1], -flat[2]];
    const length = 0.36 + 0.14 * LF[3 * j + 2], G = new Float64Array(7 * 24 * 3);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 24; c++) {
      const u = ALG[c], w = ACR[r], half = 0.075 * Math.sin(Math.PI * u) ** 0.8 * (1 - 0.3 * u), k = (r * 24 + c) * 3;
      for (let d = 0; d < 3; d++) G[k + d] = base[d] + length * u * head[d] - 0.25 * length * u * u * flat[d] + half * w * side[d] + 0.3 * half * Math.abs(w) * flat[d];
    }
    const N = gridNormals(G, 7, 24, () => flat), dv = [base[0] - DOME[0], base[1] - DOME[1], base[2] - DOME[2]];
    const tilt = Math.acos(clamp(dv[1] / Math.hypot(dv[0], dv[1], dv[2]), -1, 1));
    for (let r = 0; r < 7; r++) for (let c = 0; c < 24; c++) {
      const k = (r * 24 + c) * 3;
      put(G[k], G[k + 1], G[k + 2], [N[k], N[k + 1], N[k + 2]], topTime(tilt) + 0.04 * j + 0.5 * ALG[c]);
    }
  }
}
