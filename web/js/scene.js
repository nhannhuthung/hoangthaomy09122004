"use strict";
/* Every point of the bouquet that is showing at a given moment. */

// the parts that only appear (stems, foliage, leaves, blossoms, bow), sorted by when they appear
const STATIC = (() => {
  const pts = [], grow = [];
  const add = (mat, countGrow) => (x, y, z, n, appear, tone = 1) => {
    pts.push([x, y, z, n[0], n[1], n[2], mat, appear, tone]);
    if (countGrow) grow.push(appear);
  };
  const addStem = add(MAT.stem, true);
  stems((x, y, z, n) => addStem(x, y, z, n, growTime(y)));
  foliage(add(MAT.foliage, true));
  const leaf = add(MAT.leaf, true), bloom = add(MAT.blossom, true);
  leaves((x, y, z, n, ap) => { if (outsideRoses(x, y, z)) leaf(x, y, z, n, ap); });
  blossoms((x, y, z, n, ap) => { if (outsideRoses(x, y, z)) bloom(x, y, z, n, ap); });
  for (let i = 0; i < PV_N; i++) for (let j = 0; j < PA_N; j++) grow.push(T_PAPER[0] + 0.5 * (T_PAPER[1] - T_PAPER[0]) * PV[i]);
  for (const tb of T_BUD) grow.push(tb);
  ribbon(add(MAT.ribbon, false));
  const order = pts.map((_, i) => i).sort((a, b) => pts[a][7] - pts[b][7]);
  const n = pts.length, S = { n, P: new Float32Array(n * 3), N: new Float32Array(n * 3), M: new Uint8Array(n), A: new Float64Array(n), T: new Float32Array(n) };
  order.forEach((src, i) => {
    const p = pts[src];
    S.P[3 * i] = p[0]; S.P[3 * i + 1] = p[1]; S.P[3 * i + 2] = p[2];
    S.N[3 * i] = p[3]; S.N[3 * i + 1] = p[4]; S.N[3 * i + 2] = p[5];
    S.M[i] = p[6]; S.A[i] = p[7]; S.T[i] = p[8];
  });
  S.growTimes = Float64Array.from(grow).sort();
  return S;
})();
const T_FINISHED = Math.max(STATIC.A[STATIC.n - 1] + FADE_IN, Math.max(...ROSE_START) + OPEN, Math.max(...T_BUD) + 0.6, T_PAPER[1]);

/* ================================================================== scene ===== */
// every point showing at time t: positions, normals, materials, tones and petal ids (-1 = not a rose)
const CAP = STATIC.n + PV_N * PA_N + N_ROSES * (NP + NS);
const SCENE = { n: 0, P: new Float32Array(CAP * 3), N: new Float32Array(CAP * 3), M: new Uint8Array(CAP), T: new Float32Array(CAP), I: new Int32Array(CAP) };
const TMP = { P: new Float32Array(NP * 3), N: new Float32Array(NP * 3), SP: new Float32Array(NS * 3), SN: new Float32Array(NS * 3) };
let FROZEN = null;                      // once everything has appeared and every rose is open, it is kept
function scene(t) {
  if (t >= T_FINISHED) {
    if (!FROZEN) {
      buildScene(T_FINISHED, SCENE);
      const n = SCENE.n;
      FROZEN = { n, P: SCENE.P.slice(0, n * 3), N: SCENE.N.slice(0, n * 3), M: SCENE.M.slice(0, n), T: SCENE.T.slice(0, n), I: SCENE.I.slice(0, n) };
    }
    return FROZEN;
  }
  buildScene(t, SCENE);
  return SCENE;
}
function buildScene(t, S) {
  const P = S.P, N = S.N, M = S.M, T = S.T, I = S.I;
  const m = upperBound(STATIC.A, t);
  P.set(STATIC.P.subarray(0, m * 3)); N.set(STATIC.N.subarray(0, m * 3)); M.set(STATIC.M.subarray(0, m));
  for (let i = 0; i < m; i++) { T[i] = STATIC.T[i] * (0.08 + 0.92 * smooth((t - STATIC.A[i]) / FADE_IN)); I[i] = -1; }
  let n = m;
  if (t >= T_PAPER[0]) {                                    // the wrap, blowing out
    const [pp, pn] = t >= T_PAPER[1] ? PAPER_DONE : paperShape(clamp((t - T_PAPER[0]) / (T_PAPER[1] - T_PAPER[0]), 0, 1));
    const tone = smooth((t - T_PAPER[0]) / 0.25), cnt = PV_N * PA_N;
    P.set(pp, n * 3); N.set(pn, n * 3); M.set(PAPER_MAT, n);
    for (let i = 0; i < cnt; i++) { T[n + i] = tone; I[n + i] = -1; }
    n += cnt;
  }
  for (let k = 0; k < N_ROSES; k++) {
    if (t < T_BUD[k]) continue;
    const grow = smooth((t - T_BUD[k]) / 0.6), op = smooth((t - ROSE_START[k]) / OPEN);
    const steady = grow >= 1 && (op === 0 || op === 1), key = 2 * k + op;   // fully grown and closed or open:
    const kept = steady && ROSE_CACHE.get(key);                             // it doesn't change, so it is kept
    if (kept) {
      const cnt = NP + NS;
      P.set(kept.P, n * 3); N.set(kept.N, n * 3); M.set(kept.M, n); T.set(kept.T, n); I.set(kept.I, n);
      n += cnt;
      continue;
    }
    const n0 = n;
    const size = ROSE_SIZE[k] * (0.04 + 0.96 * grow) * (1.3 - 0.3 * op), light = (0.3 + 0.7 * grow) * ROSE_SHADE[k];
    const [ax, ay, az] = ROSE_FRAME[k], pos = ROSE_POS[k];
    blendInto(PETAL_TABLE, op, TMP.P, TMP.N);
    blendInto(SEPAL_TABLE, op, TMP.SP, TMP.SN);
    for (const [src, srcN, cnt, mat, tones, surf] of [[TMP.P, TMP.N, NP, ROSE_MAT[k], PETAL_TONE, PETAL_SURF], [TMP.SP, TMP.SN, NS, MAT.sepal, null, null]]) {
      for (let j = 0; j < cnt; j++) {
        const px = src[3 * j], py = src[3 * j + 1], pz = src[3 * j + 2], qx = srcN[3 * j], qy = srcN[3 * j + 1], qz = srcN[3 * j + 2];
        const o = 3 * n;
        P[o] = pos[0] + (px * ax[0] + py * ay[0] + pz * az[0]) * size;
        P[o + 1] = pos[1] + (px * ax[1] + py * ay[1] + pz * az[1]) * size;
        P[o + 2] = pos[2] + (px * ax[2] + py * ay[2] + pz * az[2]) * size;
        N[o] = qx * ax[0] + qy * ay[0] + qz * az[0];
        N[o + 1] = qx * ax[1] + qy * ay[1] + qz * az[1];
        N[o + 2] = qx * ax[2] + qy * ay[2] + qz * az[2];
        M[n] = mat; T[n] = tones ? tones[j] * light : light; I[n] = 64 * k + (surf ? surf[j] : 63);
        n++;
      }
    }
    if (steady) ROSE_CACHE.set(key, { P: P.slice(n0 * 3, n * 3), N: N.slice(n0 * 3, n * 3), M: M.slice(n0, n), T: T.slice(n0, n), I: I.slice(n0, n) });
  }
  S.n = n;
}
const ROSE_CACHE = new Map();
