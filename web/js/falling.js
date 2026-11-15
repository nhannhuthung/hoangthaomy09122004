"use strict";
/* Loose petals tumbling down once the bouquet has bloomed. */

// loose petals tumbling down once the bouquet has bloomed
const N_FALL = 10, FALL_PERIOD = 7.0;
const FALL_POSES = [["(", ")"], ["/", ""], ["-", ""], ["\\", ""], ["{", "}"], ["<", ">"]], FALL_TURN = [0, 1, 2, 3, 4, 3, 2, 1];
const FALL_FROM = [];
for (let k = 0; k < N_ROSES; k++) if (ROSE_DIR[k][2] > -0.3) FALL_FROM.push(k);
function falling(t, fn) {
  const F = DATA.fall;
  for (let k = 0; k < N_FALL; k++) {
    const [a, b, c, d, e, f, g] = F.slice(8 * k, 8 * k + 8), since = t - T_FALL - k * FALL_PERIOD / N_FALL;
    if (since < 0) continue;
    const age = pmod(since, FALL_PERIOD), rose = FALL_FROM[Math.floor(a * FALL_FROM.length)];
    const [ax, ay, az] = ROSE_FRAME[rose], v = [0.09 * Math.cos(b * TAU), 0.1, 0.09 * Math.sin(b * TAU)];
    const x = ROSE_POS[rose][0] + ax[0] * v[0] + ay[0] * v[1] + az[0] * v[2] + 0.2 * (c - 0.5) * age + 0.06 * Math.sin(age * (2 + 2 * d));
    const y = ROSE_POS[rose][1] + ax[1] * v[0] + ay[1] * v[1] + az[1] * v[2] - 0.3 * age;
    const z = ROSE_POS[rose][2] + ax[2] * v[0] + ay[2] * v[1] + az[2] * v[2] + 0.25 * age * f + 0.05 * Math.cos(age * (2 + g));
    fn(x, y, z, rose, FALL_TURN[Math.floor(age * (3 + 3 * d) + e * 8) % FALL_TURN.length], smooth(age / 0.3) * smooth((FALL_PERIOD - age) / 0.6));
  }
}
