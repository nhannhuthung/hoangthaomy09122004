"use strict";
/* The wrapping paper: its settled shape, and the skirt-like blow-out on the way there. */

const PAPER_FRONT = -0.42, PAPER_BACK = 0.45;    // height of the wrap's edge at the front and at the back
const PA_N = 150, PV_N = 30, PA = linspace(0, TAU, PA_N, false), PV = linspace(0, 1, PV_N);
/* The wrap. s = null: its settled shape. s = 0..1: blowing out like a skirt - gathered tight round
   the stems at first, belling out, its hem rolling in curves, swirling a little, then settling. */
function paperShape(s) {
  const G = new Float64Array(PV_N * PA_N * 3), AO = new Float64Array(PV_N * PA_N);
  for (let i = 0; i < PV_N; i++) for (let j = 0; j < PA_N; j++) {
    let a = PA[j];
    const v = PV[i], top = PAPER_FRONT + (PAPER_BACK - PAPER_FRONT) * (1 - Math.cos(a)) / 2 + 0.03 * Math.cos(9 * a);
    let r = (0.075 + (0.645 + 0.2 * (1 - Math.cos(a)) / 2) * v ** 0.75) * (1 + 0.07 * v);
    let y = WAIST_Y + v * (top - WAIST_Y);
    if (s !== null) {
      const blow = 1 - 0.9 * Math.exp(-4.5 * s) * Math.cos(6.5 * s), wave = (1 - Math.exp(-10 * s)) * (1 - smooth(s));
      r = 0.075 + (r - 0.075) * blow;
      r = r * (1 + wave * (0.2 * v ** 1.2 * Math.sin(7 * a - 9 * s) + 0.16 * Math.sin(Math.PI * v)));
      y = WAIST_Y + (y - WAIST_Y) * (0.5 + 0.5 * blow) + wave * 0.1 * v * v * Math.cos(7 * a - 9 * s + 0.6);
      a = a - 0.9 * (1 - smooth(1.5 * s));
    }
    const k = (i * PA_N + j) * 3;
    G[k] = r * Math.sin(a); G[k + 1] = y; G[k + 2] = r * Math.cos(a); AO[i * PA_N + j] = a;
  }
  const N = gridNormals(G, PV_N, PA_N, (i, j) => { const a = AO[i * PA_N + j]; return [Math.sin(a), 0, Math.cos(a)]; });
  return [Float32Array.from(G), Float32Array.from(N)];
}
const PAPER_DONE = paperShape(null);
const PAPER_MAT = Uint8Array.from({ length: PV_N * PA_N }, (_, k) => (PV[Math.floor(k / PA_N)] > 0.965 ? MAT.rim : MAT.paper));
