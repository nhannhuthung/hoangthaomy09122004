"use strict";
/* Points into characters: the depth buffer, light and shade, the petal outlines, the edge strokes and the running letters. */

let G = null;                           // per-size work grids
function grids(rows, cols) {
  if (G && G.rows === rows && G.cols === cols) return G;
  const n = rows * cols;
  G = {
    rows, cols, zbuf: new Float64Array(n), owner: new Int32Array(n), zbuf2: new Float64Array(n), owner2: new Int32Array(n),
    rose: new Int32Array(n), sid: new Int32Array(n), petal: new Int8Array(n), behind: new Uint8Array(n), mats: new Int16Array(n),
    lum: new Float32Array(n), col: new Uint16Array(n), edge: new Int8Array(n), stroke: new Int8Array(n), char: new Uint16Array(n),
    taken: new Uint8Array(n), bestLvl: new Float64Array(n), bestIdx: new Int32Array(n).fill(-1), empty: new Float64Array(n).fill(Infinity),
  };
  return G;
}
/* Rasterise the bouquet: per cell its material (-1 = empty), brightness, stroke (-1 = none),
   colour and depth (into the work grids). */
// what stays with the wrap when she turns the bouquet by hand: the wrap and the bow keep facing her and the flowers
// turn inside them (the flowers reach out past the wrap at the sides and back, so turning the wrap too would show it
// cutting through them)
const WITH_WRAP = MATERIALS.map((m) => m[0] === "paper" || m[0] === "rim" || m[0] === "ribbon");
function render(t, rows, cols, aspect) {
  const g = grids(rows, cols), cells = rows * cols, spin = spinAt(t), sc = scene(t), fit = zoom(aspect);
  const view = viewMatrix(spin + userTurn.angle), wrap = userTurn.angle ? viewMatrix(spin) : view;
  const P = sc.P, n = sc.n, M = sc.M, [ox, oy, oz] = CAM_OFF;
  const ky = FOCAL * 0.5 * fit * rows, kx = FOCAL * 0.5 * fit * cols / aspect, my = MIDDLE * rows, mx = 0.5 * cols;
  const zbuf = g.zbuf, owner = g.owner;
  zbuf.fill(Infinity); owner.fill(-1);
  for (let i = 0; i < n; i++) {                             // nearest point per cell wins
    const v = WITH_WRAP[M[i]] ? wrap : view, x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
    const qz = v[6] * x + v[7] * y + v[8] * z - oz;
    if (qz <= NEAR) continue;
    const r = Math.floor(my - (v[3] * x + v[4] * y + v[5] * z - oy) * ky / qz);
    if (r < 0 || r >= rows) continue;
    const c = Math.floor(mx + (v[0] * x + v[1] * y + v[2] * z - ox) * kx / qz);
    if (c < 0 || c >= cols) continue;
    const cell = r * cols + c;
    if (qz < zbuf[cell]) { zbuf[cell] = qz; owner[cell] = i; }
  }
  mendRoses(g, sc.I);
  const sid = g.sid, petal = g.petal, behind = g.behind;
  for (let c = 0; c < cells; c++) sid[c] = g.owner[c] >= 0 ? sc.I[g.owner[c]] : -1;
  petalEdges(g);
  const N = sc.N, T = sc.T, I = sc.I, mats = g.mats, lum = g.lum, col = g.col, ow = g.owner;
  const lx = LIGHT[0], ly = LIGHT[1], lz = LIGHT[2];
  for (let cell = 0; cell < cells; cell++) {
    const o = ow[cell];
    if (o < 0) { mats[cell] = -1; continue; }
    const m = WITH_WRAP[M[o]] ? wrap : view, x = P[3 * o], y = P[3 * o + 1], z = P[3 * o + 2];
    const qx = m[0] * x + m[1] * y + m[2] * z - ox, qy = m[3] * x + m[4] * y + m[5] * z - oy, qz = m[6] * x + m[7] * y + m[8] * z - oz;
    const ql = Math.max(Math.hypot(qx, qy, qz), 1e-12), vx = -qx / ql, vy = -qy / ql, vz = -qz / ql;   // towards the eye
    const ax = N[3 * o], ay = N[3 * o + 1], az = N[3 * o + 2];
    let nx = m[0] * ax + m[1] * ay + m[2] * az, ny = m[3] * ax + m[4] * ay + m[5] * az, nz = m[6] * ax + m[7] * ay + m[8] * az;
    const facing = nx * vx + ny * vy + nz * vz, raw = M[o];
    let mat = raw;
    if (facing < 0) { nx = -nx; ny = -ny; nz = -nz; mat = BACK[raw]; }
    const diffuse = Math.max(nx * lx + ny * ly + nz * lz, 0);
    let hx = lx + vx, hy = ly + vy, hz = lz + vz;
    const hl = Math.max(Math.hypot(hx, hy, hz), 1e-12);
    hx /= hl; hy /= hl; hz /= hl;
    const shine = clamp(nx * hx + ny * hy + nz * hz, 0, 1) ** 24 * SHINE[mat];
    const depth = 1.1 - 0.3 * clamp((qz - 2.9) / 1.6, 0, 1), tone = T[o], pe = petal[cell];
    let L = clamp(((0.26 + 0.55 * diffuse + 0.32 * Math.abs(facing)) * tone + shine) * depth, 0, 1);
    L = clamp(L * (pe >= 0 ? 1.25 : behind[cell] ? 0.55 : 1), 0, 1);       // petal rims catch the light
    if (raw === MAT.rim || (raw === MAT.paper && Math.abs(facing) < 0.3)) {   // the wrap's border stays white
      mat = MAT.rim;
      L = Math.max(L, 0.8) * (0.25 + 0.75 * tone);
    }
    const s = I[o], heart = s >= 0 && s % 64 === 3 && pe < 0;               // each rose's tight middle: @
    mats[cell] = mat; lum[cell] = heart ? Math.max(L, 0.85) : L; col[cell] = colourOf(mat, L ** 0.75);
  }
  edgeStrokes(g, rows * fit, cols / (aspect * rows));
  const stroke = g.stroke, edge = g.edge;
  for (let c = 0; c < cells; c++) stroke[c] = sid[c] >= 0 ? (petal[c] >= 0 ? 5 + petal[c] : -1) : edge[c];
  return view;
}
/* Mend the little holes in the roses: a cell showing something behind a rose (or nothing) while
   that same rose is on both sides of it, or on three sides, gets the rose instead. */
function mendRoses(g, I) {
  const { rows, cols, owner, zbuf, owner2, zbuf2, rose } = g, cells = rows * cols;
  for (let c = 0; c < cells; c++) { const o = owner[c]; rose[c] = o >= 0 && I[o] >= 0 ? I[o] >> 6 : -1; }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cell = r * cols + c, z0 = zbuf[cell], r0 = rose[cell];
    let l = -2, rt = -2, u = -2, d = -2, rq;                 // a rose in front of this cell, on each side
    if (c > 0 && (rq = rose[cell - 1]) >= 0 && rq !== r0 && zbuf[cell - 1] < z0) l = rq;
    if (c < cols - 1 && (rq = rose[cell + 1]) >= 0 && rq !== r0 && zbuf[cell + 1] < z0) rt = rq;
    if (r > 0 && (rq = rose[cell - cols]) >= 0 && rq !== r0 && zbuf[cell - cols] < z0) u = rq;
    if (r < rows - 1 && (rq = rose[cell + cols]) >= 0 && rq !== r0 && zbuf[cell + cols] < z0) d = rq;
    let target = -1;
    if (l >= 0 || rt >= 0 || u >= 0) {
      const countL = 1 + (rt === l) + (u === l) + (d === l), countR = (l === rt) + 1 + (u === rt) + (d === rt);
      target = l >= 0 && (l === rt || countL >= 3) ? l : u >= 0 && u === d ? u : rt >= 0 && countR >= 3 ? rt : -1;
    }
    if (target < 0) { owner2[cell] = owner[cell]; zbuf2[cell] = z0; continue; }
    let bo = -1, bz = Infinity;                              // take that rose's nearest neighbouring point
    if (l === target && zbuf[cell - 1] < bz) { bo = owner[cell - 1]; bz = zbuf[cell - 1]; }
    if (rt === target && zbuf[cell + 1] < bz) { bo = owner[cell + 1]; bz = zbuf[cell + 1]; }
    if (u === target && zbuf[cell - cols] < bz) { bo = owner[cell - cols]; bz = zbuf[cell - cols]; }
    if (d === target && zbuf[cell + cols] < bz) { bo = owner[cell + cols]; bz = zbuf[cell + cols]; }
    owner2[cell] = bo; zbuf2[cell] = bz;
  }
  g.owner = owner2; g.owner2 = owner; g.zbuf = zbuf2; g.zbuf2 = zbuf;
}
/* The petals' outlines: where the petal in a cell lies in front of something else, the stroke that
   outlines it - ( left, ) right, _ bottom, - top, / and \ round the curves (0..5, else -1). Also
   which cells lie just behind such an edge (a little shadow). */
function petalEdges(g) {
  const { rows, cols, sid, zbuf, petal, behind } = g;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cell = r * cols + c, s0 = sid[cell];
    if (s0 < 0) { petal[cell] = -1; behind[cell] = 0; continue; }
    const zf = zbuf[cell] + 0.003, zn = zbuf[cell] - 0.003;
    // something farther back that way (past the edge of the grid counts as sky), or a nearer petal
    let l = true, rt = true, u = true, d = true, near = false, s, z, q;
    if (c > 0) { q = cell - 1; s = sid[q]; z = zbuf[q]; l = s !== s0 && z > zf; near = near || (s >= 0 && s !== s0 && z < zn); }
    if (c < cols - 1) { q = cell + 1; s = sid[q]; z = zbuf[q]; rt = s !== s0 && z > zf; near = near || (s >= 0 && s !== s0 && z < zn); }
    if (r > 0) { q = cell - cols; s = sid[q]; z = zbuf[q]; u = s !== s0 && z > zf; near = near || (s >= 0 && s !== s0 && z < zn); }
    if (r < rows - 1) { q = cell + cols; s = sid[q]; z = zbuf[q]; d = s !== s0 && z > zf; near = near || (s >= 0 && s !== s0 && z < zn); }
    const side = l || rt, flat = u || d;
    const st = l && !rt && !flat ? 0 : rt && !l && !flat ? 1 : d && !u && !side ? 2 : u && !d && !side ? 3
      : (u && l) || (d && rt) ? 4 : (u && rt) || (d && l) ? 5 : -1;
    petal[cell] = st;
    behind[cell] = st < 0 && near ? 1 : 0;
  }
}
/* Where a surface ends - against empty space, or in front of something much farther back - the
   stroke that follows the edge (0..4 of STROKE_CHARS), else -1. k = cell height / cell width. */
function edgeStrokes(g, rowsZ, k) {
  const { rows, cols, zbuf, edge } = g, cells = rows * cols;
  let far = -Infinity;
  for (let c = 0; c < cells; c++) if (zbuf[c] !== Infinity && zbuf[c] > far) far = zbuf[c];
  if (far === -Infinity) { edge.fill(-1); return; }
  const D = (q) => (zbuf[q] === Infinity ? far + 1 : zbuf[q]);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cell = r * cols + c;
    if (zbuf[cell] === Infinity) { edge[cell] = -1; continue; }
    const d0 = zbuf[cell], jump = 2.5 * d0 / (FOCAL * 0.5 * rowsZ);         // about 2.5 cells, in depth
    const up = D(r > 0 ? cell - cols : cell), down = D(r < rows - 1 ? cell + cols : cell);
    const left = D(c > 0 ? cell - 1 : cell), right = D(c < cols - 1 ? cell + 1 : cell);
    if (!(up - d0 > jump || down - d0 > jump || left - d0 > jump || right - d0 > jump)) { edge[cell] = -1; continue; }
    const gx = right - left, gy = (down - up) / k;          // points to what lies farther back
    const angle = pmod(Math.atan2(-gx, -gy) * 180 / Math.PI, 180);
    let s = angle < 22.5 ? 0 : angle < 67.5 ? 1 : angle < 112.5 ? 2 : angle < 157.5 ? 3 : 0;
    if (s === 0 && gy > 0) s = 4;                            // a lower edge: _
    edge[cell] = s;
  }
}
// every cell changes its letter at its own pace
const FL_N = 1 << 14, FL_RATE = new Float32Array(FL_N), FL_PHASE = new Float32Array(FL_N), FL_PICK = new Uint8Array(FL_N);
{
  let seed = 17;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  for (let i = 0; i < FL_N; i++) { FL_RATE[i] = CHANGE_RATE * (0.5 + rnd()); FL_PHASE[i] = rnd(); FL_PICK[i] = Math.floor(rnd() * PICKS); }
}
function glyphsFor(g, t) {              // its edge stroke, or a random letter of its brightness, picked anew now and then
  const cells = g.rows * g.cols, { mats, lum, stroke, char } = g;
  for (let cell = 0; cell < cells; cell++) {
    const m = mats[cell];
    if (m < 0) { char[cell] = 0; continue; }
    const st = stroke[cell];
    if (st >= 0) { char[cell] = STROKE_CODES[st]; continue; }
    const h = cell & (FL_N - 1), tick = Math.floor(t * FL_RATE[h] + FL_PHASE[h]);
    const pick = FL_PICK[(cell * 7919 + tick * 104729) % FL_N], b = bucketOf(lum[cell]);
    char[cell] = IS_ROSE[m] ? ROSE_CODES[b][pick] : SET_CODES[b][pick];
  }
}
