"""The ribbon round the waist, with its bow and tails - wrapping on as the paper
blows out."""

import numpy as np

from .maths import TAU, unit, normals_of
from .settings import WAIST, T_BOW


def ribbon():
    P, N, part, appear = [], [], [], []

    def add(p, n, k, when):                 # `when`: 0..1 through the bow wrapping on
        P.append(p.reshape(-1, 3))
        N.append(n.reshape(-1, 3))
        part.append(np.full(len(P[-1]), k))
        appear.append((T_BOW[0] + (T_BOW[1] - T_BOW[0]) * np.broadcast_to(when, p.shape[:-1])).ravel())

    a, w = np.meshgrid(np.linspace(0, TAU, 120, endpoint=False), np.linspace(-1, 1, 7))
    band = np.stack([0.09 * np.sin(a), WAIST[1] + 0.022 * w, 0.09 * np.cos(a)], -1)
    add(band, np.stack([np.sin(a), np.zeros_like(a), np.cos(a)], -1), 0, 0.4 * ((a + 0.3) % TAU) / TAU)

    knot = np.array([0.0, WAIST[1], 0.12])
    front = np.array([0.0, 0.0, 1.0])
    s, w = np.meshgrid(np.linspace(0, TAU, 70), np.linspace(-1, 1, 6))
    q = np.sin(s / 2) ** 2
    for sgn in (-1, 1):                     # the two loops of the bow
        mid = knot + np.stack([sgn * 0.16 * q, 0.02 * q, 0.05 * q + 0.03 * np.sin(s) * (1 - 0.4 * q)], -1)
        across = unit(np.stack([-sgn * 0.45 * q, np.ones_like(q), 0.2 * q], -1))
        loop = mid + ((0.016 + 0.024 * q) * w)[..., None] * across
        add(loop, normals_of(loop, 1, 0, front), 1, 0.4 + 0.25 * s / TAU)
    u, w = np.meshgrid(np.linspace(0, 1, 34), np.linspace(-1, 1, 5))
    for sgn in (-1, 1):                     # the two tails
        mid = knot + np.stack([sgn * (0.012 + 0.06 * u), -0.2 * u, 0.012 + 0.025 * np.sin(2.4 * np.pi * u) * u], -1)
        across = unit(np.stack([np.ones_like(u), sgn * 0.5 * np.ones_like(u), 0.3 * np.cos(2.4 * np.pi * u)], -1))
        tail = mid + (0.021 * w)[..., None] * across
        cut = u < 0.93 + 0.07 * np.abs(w)
        add(tail[cut], normals_of(tail, 1, 0, front)[cut], 2, (0.65 + 0.35 * u)[cut])
    th, ph = np.meshgrid(np.linspace(0, np.pi, 10), np.linspace(0, TAU, 22, endpoint=False))
    ball = np.stack([np.sin(th) * np.sin(ph), np.cos(th), np.sin(th) * np.cos(ph)], -1)
    add(knot + ball * [0.026, 0.028, 0.02], ball, 3, 0.4)
    return np.concatenate(P), np.concatenate(N), np.concatenate(part), np.concatenate(appear)
