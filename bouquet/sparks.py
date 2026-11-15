"""The burst of gold sparks from each rose as it finishes opening."""

import numpy as np

from .maths import TAU
from .roses import N_ROSES, ROSE_POS, ROSE_DIR, ROSE_START
from .settings import OPEN

GOLD, GLINT = 0, 1
POP = np.random.default_rng(13).random((N_ROSES, 14, 4))


def pops(t):
    """The sparks at time t: positions, sizes, and whether each is gold or a white glint."""
    P, S, T = [], [], []
    for k in range(N_ROSES):
        age = t - (ROSE_START[k] + 0.85 * OPEN)
        if not 0 < age < 1.4:
            continue
        g = POP[k]
        a, up = g[:, 0] * TAU, 0.4 + 0.8 * g[:, 1]
        speed = 0.45 + 0.5 * g[:, 2]
        v = np.stack([np.cos(a) * speed, up, np.sin(a) * speed], 1)
        head = ROSE_POS[k] + ROSE_DIR[k] * 0.12
        P.append(head + v * age - np.array([0, 0.9, 0]) * age**2)
        S.append((1 - age / 1.4)**1.2 * (0.8 + 0.5 * g[:, 3]))
        T.append(np.where(g[:, 3] > 0.5, GLINT, GOLD))

    if not P:
        return np.zeros((0, 3)), np.zeros(0), np.zeros(0, int)
    return np.concatenate(P), np.concatenate(S), np.concatenate(T)
