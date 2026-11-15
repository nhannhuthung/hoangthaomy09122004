"use strict";
/* The ribbon round the waist, with its bow and tails. */

function ribbon(put) {                  // the band round the waist, the bow's two loops, two tails, the knot
  const when = (w) => T_BOW[0] + (T_BOW[1] - T_BOW[0]) * w, knot = [0, WAIST_Y, 0.12], front = () => [0, 0, 1];
  const BA = linspace(0, TAU, 120, false), BW = linspace(-1, 1, 7);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 120; c++) {
    const a = BA[c];
    put(0.09 * Math.sin(a), WAIST_Y + 0.022 * BW[r], 0.09 * Math.cos(a), [Math.sin(a), 0, Math.cos(a)], when(0.4 * ((a + 0.3) % TAU) / TAU), 1.0);
  }
  const S = linspace(0, TAU, 70), W6 = linspace(-1, 1, 6);
  for (const sgn of [-1, 1]) {
    const G = new Float64Array(6 * 70 * 3);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 70; c++) {
      const s = S[c], q = Math.sin(s / 2) ** 2, k = (r * 70 + c) * 3;
      const mid = [knot[0] + sgn * 0.16 * q, knot[1] + 0.02 * q, knot[2] + 0.05 * q + 0.03 * Math.sin(s) * (1 - 0.4 * q)];
      const ac = unit([-sgn * 0.45 * q, 1, 0.2 * q]), wd = (0.016 + 0.024 * q) * W6[r];
      for (let d = 0; d < 3; d++) G[k + d] = mid[d] + wd * ac[d];
    }
    const N = gridNormals(G, 6, 70, front);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 70; c++) {
      const k = (r * 70 + c) * 3;
      put(G[k], G[k + 1], G[k + 2], [N[k], N[k + 1], N[k + 2]], when(0.4 + 0.25 * S[c] / TAU), 1.0);
    }
  }
  const U = linspace(0, 1, 34), W5 = linspace(-1, 1, 5);
  for (const sgn of [-1, 1]) {
    const G = new Float64Array(5 * 34 * 3);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 34; c++) {
      const u = U[c], k = (r * 34 + c) * 3;
      const mid = [knot[0] + sgn * (0.012 + 0.06 * u), knot[1] - 0.2 * u, knot[2] + 0.012 + 0.025 * Math.sin(2.4 * Math.PI * u) * u];
      const ac = unit([1, sgn * 0.5, 0.3 * Math.cos(2.4 * Math.PI * u)]), wd = 0.021 * W5[r];
      for (let d = 0; d < 3; d++) G[k + d] = mid[d] + wd * ac[d];
    }
    const N = gridNormals(G, 5, 34, front);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 34; c++) {
      if (!(U[c] < 0.93 + 0.07 * Math.abs(W5[r]))) continue;            // the V cut at the end
      const k = (r * 34 + c) * 3;
      put(G[k], G[k + 1], G[k + 2], [N[k], N[k + 1], N[k + 2]], when(0.65 + 0.35 * U[c]), 1.0);
    }
  }
  const TH = linspace(0, Math.PI, 10), PH = linspace(0, TAU, 22, false);
  for (let r = 0; r < 22; r++) for (let c = 0; c < 10; c++) {
    const th = TH[c], ph = PH[r], b = [Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)];
    put(knot[0] + b[0] * 0.026, knot[1] + b[1] * 0.028, knot[2] + b[2] * 0.02, b, when(0.4), 0.85);
  }
}
