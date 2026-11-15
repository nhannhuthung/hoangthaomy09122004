"use strict";
/* Where the 19 roses sit, how big, which purple, and when each appears and opens. */

// 19 roses: one on top, a ring of 6 around it, an outer ring of 12 - (level, how many, tilt, turn)
const RINGS = [[0, 1, 0.0, 0.0], [1, 6, 0.72, 0.0], [2, 12, 1.22, 0.5]];
const ROSE_TIER = [], ROSE_TILT = [], ROSE_AZ = [];
for (const [lvl, n, tilt, off] of RINGS) for (let i = 0; i < n; i++) { ROSE_TIER.push(lvl); ROSE_TILT.push(tilt); ROSE_AZ.push(TAU * (i + off) / n); }
const N_ROSES = ROSE_TIER.length;
function roseFrame(d, twist) {          // the rose's local x, y (= d, its facing) and z axes
  const ref = Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const side = unit(cross(ref, d)), fwd = cross(side, d), c = Math.cos(twist), s = Math.sin(twist);
  return [[0, 1, 2].map((i) => c * side[i] + s * fwd[i]), d, [0, 1, 2].map((i) => c * fwd[i] - s * side[i])];
}
const ROSE_POS = [], ROSE_DIR = [], ROSE_SIZE = [], ROSE_SHADE = [], ROSE_MAT = [], ROSE_FRAME = [];
const ROSE_START = [], T_BUD = [], ROSE_HEAD = [], ROSE_REACH = [];
for (let k = 0; k < N_ROSES; k++) {
  const tier = ROSE_TIER[k], t = ROSE_TILT[k], a = ROSE_AZ[k], rr = DATA.rr.slice(4 * k, 4 * k + 4);
  const radial = [Math.sin(t) * Math.sin(a), Math.cos(t), Math.sin(t) * Math.cos(a)], lift = [0.67, 0.64, 0.64][tier];
  const pos = [DOME[0] + lift * radial[0], DOME[1] + lift * radial[1], DOME[2] + lift * radial[2]];
  const dir = unit([radial[0] * 1.2, radial[1], radial[2] * 1.2 + 0.75]);   // lean out, faces turned to us
  const size = [0.3, 0.25, 0.23][tier] * (0.95 + 0.1 * rr[0]);
  let order = 0;
  for (let j = 0; j < k; j++) if (ROSE_TIER[j] === tier) order++;
  ROSE_POS.push(pos); ROSE_DIR.push(dir); ROSE_SIZE.push(size);
  ROSE_SHADE.push(0.8 + 0.35 * rr[2]);                     // some roses lighter, some darker
  ROSE_MAT.push(ROSE_MATS[DATA.perm[k]]);                  // which purple
  ROSE_FRAME.push(roseFrame(dir, TAU * rr[1]));
  ROSE_START.push(T_BLOOM + TIER_GAP * tier + 0.12 * order + 0.08 * rr[3]);
  T_BUD.push(topTime(t));                                  // buds appear as the stars pass over them
  ROSE_HEAD.push([0, 1, 2].map((i) => pos[i] + dir[i] * 0.35 * size));
  ROSE_REACH.push(0.72 * size);
}
function outsideRoses(x, y, z) {        // leaves and blossoms tuck in behind the roses, not through them
  for (let k = 0; k < N_ROSES; k++) {
    const h = ROSE_HEAD[k];
    if (Math.hypot(x - h[0], y - h[1], z - h[2]) <= ROSE_REACH[k]) return false;
  }
  return true;
}
