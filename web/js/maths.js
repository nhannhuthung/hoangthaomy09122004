"use strict";
/* Small maths helpers. */

const TAU = 2 * Math.PI;
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smooth = (x) => { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); };
const fract = (x) => x - Math.floor(x);                   // Python's x % 1
const pmod = (x, m) => ((x % m) + m) % m;                 // Python's x % m
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function unit(v) { const n = Math.max(Math.hypot(v[0], v[1], v[2]), 1e-12); return [v[0] / n, v[1] / n, v[2] / n]; }
function linspace(a, b, n, endpoint = true) {
  const out = new Float64Array(n), step = endpoint ? (n > 1 ? (b - a) / (n - 1) : 0) : (b - a) / n;
  for (let i = 0; i < n; i++) out[i] = a + step * i;
  if (endpoint && n > 1) out[n - 1] = b;
  return out;
}
function upperBound(sorted, x) {                         // how many values are <= x
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] <= x) lo = mid + 1; else hi = mid; }
  return lo;
}
/* Normals of a surface sampled on a grid: G holds nv rows of nu points. The gradients are numpy's
   (central differences inside, one-sided at the ends); each normal is turned to face out(i, j). */
function gridNormals(G, nv, nu, out) {
  const N = new Float64Array(G.length);
  for (let i = 0; i < nv; i++) {
    const i0 = i > 0 ? i - 1 : 0, i1 = i < nv - 1 ? i + 1 : nv - 1, si = i1 - i0;
    for (let j = 0; j < nu; j++) {
      const j0 = j > 0 ? j - 1 : 0, j1 = j < nu - 1 ? j + 1 : nu - 1, sj = j1 - j0;
      const a = (i * nu + j1) * 3, b = (i * nu + j0) * 3, c = (i1 * nu + j) * 3, d = (i0 * nu + j) * 3;
      const ux = (G[a] - G[b]) / sj, uy = (G[a + 1] - G[b + 1]) / sj, uz = (G[a + 2] - G[b + 2]) / sj;
      const vx = (G[c] - G[d]) / si, vy = (G[c + 1] - G[d + 1]) / si, vz = (G[c + 2] - G[d + 2]) / si;
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.max(Math.hypot(nx, ny, nz), 1e-12);
      nx /= len; ny /= len; nz /= len;
      const o = out(i, j);
      if (nx * o[0] + ny * o[1] + nz * o[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const k = (i * nu + j) * 3;
      N[k] = nx; N[k + 1] = ny; N[k + 2] = nz;
    }
  }
  return N;
}
