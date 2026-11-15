"""Loose petals that tumble down past the bouquet once it has bloomed."""

import numpy as np

from .maths import TAU, smooth
from .roses import N_ROSES, ROSE_POS, ROSE_DIR, ROSE_TURN
from .settings import T_FALL

N_FALL = 10
FALL = np.random.default_rng(7).random((N_FALL, 8))
FALL_PERIOD = 7.0
FALL_POSES = [("(", ")"), ("/", ""), ("-", ""), ("\\", ""), ("{", "}"), ("<", ">")]
FALL_TURN = [0, 1, 2, 3, 4, 3, 2, 1]
FALL_FROM = [k for k in range(N_ROSES) if ROSE_DIR[k][2] > -0.3]


def falling(t):
    """The loose petals at time t: (position, which rose, pose, fade)."""
    out = []
    for k, (a, b, c, d, e, f, g, h) in enumerate(FALL):
        since = t - T_FALL - k * FALL_PERIOD / N_FALL
        if since < 0:
            continue
        age = since % FALL_PERIOD
        rose = FALL_FROM[int(a * len(FALL_FROM))]
        start = ROSE_POS[rose] + ROSE_TURN[rose] @ np.array([0.09 * np.cos(b * TAU), 0.1, 0.09 * np.sin(b * TAU)])
        drift = np.array([0.2 * (c - 0.5) * age + 0.06 * np.sin(age * (2 + 2 * d)),
                          -0.3 * age,
                          0.25 * age * f + 0.05 * np.cos(age * (2 + g))])
        pose = FALL_TURN[int(age * (3 + 3 * d) + e * 8) % len(FALL_TURN)]
        fade = smooth(age / 0.3) * smooth((FALL_PERIOD - age) / 0.6)
        out.append((start + drift, rose, pose, fade))
    return out
