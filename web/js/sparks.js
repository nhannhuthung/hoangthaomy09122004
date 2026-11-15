"use strict";
/* The burst of gold sparks from each rose as it finishes opening. */

const POP_N = 14;
function pops(t, fn) {                  // the burst of gold sparks from each rose as it finishes opening
  const POP = DATA.pop;
  for (let k = 0; k < N_ROSES; k++) {
    const age = t - (ROSE_START[k] + 0.85 * OPEN);
    if (!(age > 0 && age < 1.4)) continue;
    const head = [0, 1, 2].map((i) => ROSE_POS[k][i] + ROSE_DIR[k][i] * 0.12);
    for (let s = 0; s < POP_N; s++) {
      const o = (k * POP_N + s) * 4, a = POP[o] * TAU, up = 0.4 + 0.8 * POP[o + 1], speed = 0.45 + 0.5 * POP[o + 2];
      fn(head[0] + Math.cos(a) * speed * age, head[1] + up * age - 0.9 * age * age, head[2] + Math.sin(a) * speed * age,
        (1 - age / 1.4) ** 1.2 * (0.8 + 0.5 * POP[o + 3]), POP[o + 3] > 0.5);
    }
  }
}
