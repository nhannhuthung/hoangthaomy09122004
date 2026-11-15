"use strict";
/* One rose's shape - petals and sepals - built for every stage of opening. */

// one rose: the classic parametric rose - 400 steps round the spiral x 14 out along each petal
const NA = 14, NG = 400, NP = NA * NG;
const ALONG = linspace(0, 1, NA), ANGLE = linspace(2 * Math.PI, 18 * Math.PI, NG);
const PETAL_TONE = new Float32Array(NP), PETAL_SURF = new Int32Array(NP);
{
  const id0 = Math.floor(3.6 * ANGLE[0] / TAU), ptp = ANGLE[NG - 1] - ANGLE[0];
  for (let i = 0; i < NG; i++) {
    const inward = (ANGLE[i] - ANGLE[0]) / ptp, outer = 1 - inward;
    const hash = fract(Math.sin((Math.floor(3.6 * ANGLE[i] / TAU) - id0) * 12.9898) * 43758.5453);
    for (let j = 0; j < NA; j++) {
      PETAL_TONE[i * NA + j] = (0.66 + 0.34 * outer ** 0.6) * (0.8 + 0.2 * hash) * (0.42 + 0.9 * smooth((ALONG[j] - 0.45) / 0.55));
      PETAL_SURF[i * NA + j] = Math.floor(inward * 3.5);   // which layer of petals, outside in
    }
  }
}
function petalShape(key) {
  const P = new Float64Array(NP * 3), spread = 1.4 + 4.2 * key, wrap = smooth(key / 0.7);
  const sxz = 0.8 * (0.72 + 0.28 * wrap), sy = 0.8 * (0.66 + 0.34 * wrap);
  for (let i = 0; i < NG; i++) {
    const ang = ANGLE[i], lean = (Math.PI / 2) * Math.exp(-ang / (spread * Math.PI));
    const q = 1.25 * (1 - (3.6 * ang) % TAU / Math.PI) ** 2 - 0.25, width = 1 - 0.5 * q * q;
    const sl = Math.sin(lean), cl = Math.cos(lean), sa = Math.sin(ang), ca = Math.cos(ang);
    for (let j = 0; j < NA; j++) {
      const A = ALONG[j], cup = 1.95653 * A * A * (1.27689 * A - 1) ** 2 * sl;
      const r = width * (A * sl + cup * cl), y = width * (A * cl + cup * sl), k = (i * NA + j) * 3;
      P[k] = r * sa * sxz; P[k + 1] = y * sy; P[k + 2] = r * ca * sxz;
    }
  }
  return [P, gridNormals(P, NG, NA, (i) => [Math.sin(ANGLE[i]), 0.3, Math.cos(ANGLE[i])])];
}
const N_SEPAL = 5, SEP_LEN = 10, SEP_ACROSS = 3, NS = N_SEPAL * SEP_LEN * SEP_ACROSS;
const SL = linspace(0, 1, SEP_LEN), SW = linspace(-1, 1, SEP_ACROSS);
function sepalShape(o) {
  const P = new Float64Array(NS * 3), N = new Float64Array(NS * 3), reach = 0.24 + 0.06 * o, droop = 0.1 + 0.14 * o;
  for (let s = 0; s < N_SEPAL; s++) {
    const a = TAU * s / N_SEPAL + 0.6, out = [Math.sin(a), 0, Math.cos(a)], side = [Math.cos(a), 0, -Math.sin(a)];
    const b0 = [0.03 * out[0], 0.03, 0.03 * out[2]], b1 = [0.16 * out[0], 0.1 - 0.05 * o, 0.16 * out[2]];
    const b2 = [reach * out[0], 0.1 - droop, reach * out[2]], G = new Float64Array(SEP_ACROSS * SEP_LEN * 3);
    for (let r = 0; r < SEP_ACROSS; r++) for (let c = 0; c < SEP_LEN; c++) {
      const u = SL[c], w0 = (1 - u) ** 2, w1 = 2 * (1 - u) * u, w2 = u * u, k = (r * SEP_LEN + c) * 3;
      const half = 0.05 * Math.sin(Math.PI * Math.min(u * 1.5, 1) / 2) * (1 - u) ** 2;
      for (let d = 0; d < 3; d++) G[k + d] = w0 * b0[d] + w1 * b1[d] + w2 * b2[d] + side[d] * half * SW[r];
    }
    P.set(G, s * G.length);
    N.set(gridNormals(G, SEP_ACROSS, SEP_LEN, () => [out[0], 1, out[2]]), s * G.length);
  }
  return [P, N];
}
function shapeTable(shape, steps, n) {  // every stage of opening, built up front so opening never stalls
  const P = new Float32Array((steps + 1) * n * 3), N = new Float32Array((steps + 1) * n * 3);
  for (let i = 0; i <= steps; i++) { const [p, q] = shape(i / steps); P.set(p, i * n * 3); N.set(q, i * n * 3); }
  return { P, N, steps, n };
}
const PETAL_TABLE = shapeTable(petalShape, 50, NP), SEPAL_TABLE = shapeTable(sepalShape, 10, NS);
function blendInto(tab, op, P, N) {     // the shape at any openness, blended between the two nearest steps
  const x = clamp(op, 0, 1) * tab.steps, i = Math.min(Math.floor(x), tab.steps - 1), w = x - i;
  const L = tab.n * 3, a = i * L, b = a + L, TP = tab.P, TN = tab.N;
  for (let k = 0; k < L; k++) { P[k] = TP[a + k] + (TP[b + k] - TP[a + k]) * w; N[k] = TN[a + k] + (TN[b + k] - TN[a + k]) * w; }
}
