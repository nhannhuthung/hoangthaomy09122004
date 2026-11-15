"""One rose's shape - the petals (the classic parametric rose) and the green
sepals under them - built for every stage of opening, so a rose can open
smoothly."""

import numpy as np

from .maths import TAU, smooth, normals_of

ALONG, ANGLE = np.meshgrid(np.linspace(0, 1, 14), np.linspace(2.0 * np.pi, 18 * np.pi, 400))
INWARD = (ANGLE - ANGLE.min()) / np.ptp(ANGLE)
PETAL_ID = (np.floor(3.6 * ANGLE / TAU).astype(int) - int(np.floor(3.6 * ANGLE.min() / TAU))).ravel()
OUTER = 1 - INWARD.ravel()
STEPS = 50
_PETALS = {}
_petal_hash = (np.sin(PETAL_ID * 12.9898) * 43758.5453) % 1
PETAL_TONE = ((0.66 + 0.34 * OUTER ** 0.6) * (0.8 + 0.2 * _petal_hash)
              * (0.42 + 0.9 * smooth((ALONG.ravel() - 0.45) / 0.55))).astype(np.float32)
PETAL_SURF = np.floor(INWARD.ravel() * 3.5).astype(np.int32)   # which layer of petals, outside in


def petals(open_):
    key = round(float(open_) * STEPS) / STEPS
    if key not in _PETALS:
        spread = 1.4 + 4.2 * key
        lean = (np.pi / 2) * np.exp(-ANGLE / (spread * np.pi))
        width = 1 - 0.5 * (1.25 * (1 - np.mod(3.6 * ANGLE, TAU) / np.pi) ** 2 - 0.25) ** 2
        cup = 1.95653 * ALONG**2 * (1.27689 * ALONG - 1)**2 * np.sin(lean)
        r = width * (ALONG * np.sin(lean) + cup * np.cos(lean))
        y = width * (ALONG * np.cos(lean) + cup * np.sin(lean))
        p = np.stack([r * np.sin(ANGLE), y, r * np.cos(ANGLE)], -1) * 0.8
        wrap = smooth(key / 0.7)
        p[..., [0, 2]] *= 0.72 + 0.28 * wrap
        p[..., 1] *= 0.66 + 0.34 * wrap
        out = np.stack([np.sin(ANGLE), np.full_like(ANGLE, 0.3), np.cos(ANGLE)], -1)
        n = normals_of(p, 1, 0, out)
        _PETALS[key] = (p.reshape(-1, 3).astype(np.float32), n.reshape(-1, 3).astype(np.float32))
    return _PETALS[key]


N_SEPAL, SEP_LEN, SEP_ACROSS = 5, 10, 3
_sl, _sw = np.meshgrid(np.linspace(0, 1, SEP_LEN), np.linspace(-1, 1, SEP_ACROSS))
SEPAL_TONE = np.ones(N_SEPAL * SEP_LEN * SEP_ACROSS, np.float32)
SEPAL_SURF = np.full(len(SEPAL_TONE), 63, np.int32)

_SEPALS = {}


def sepals(open_):
    open_ = round(float(open_) * 10) / 10
    if open_ in _SEPALS:
        return _SEPALS[open_]
    P, N = [], []
    reach, droop = 0.24 + 0.06 * open_, 0.1 + 0.14 * open_
    for i in range(N_SEPAL):
        a = TAU * i / N_SEPAL + 0.6
        out = np.array([np.sin(a), 0.0, np.cos(a)])
        side = np.array([np.cos(a), 0.0, -np.sin(a)])
        b0, b1, b2 = np.array([0, 0.03, 0]) + 0.03 * out, 0.16 * out + [0, 0.1 - 0.05 * open_, 0], reach * out + [0, 0.1 - droop, 0]
        u = _sl[..., None]
        mid = (1 - u)**2 * b0 + 2 * (1 - u) * u * b1 + u**2 * b2
        half = 0.05 * np.sin(np.pi * np.minimum(_sl * 1.5, 1) / 2) * (1 - _sl)**2
        pts = mid + side * (half * _sw)[..., None]
        P.append(pts.reshape(-1, 3))
        N.append(normals_of(pts, 1, 0, out + [0.0, 1.0, 0.0]).reshape(-1, 3))
    _SEPALS[open_] = (np.concatenate(P).astype(np.float32), np.concatenate(N).astype(np.float32))
    return _SEPALS[open_]


def _table(shape, steps):
    """Build a shape at every step up front, so opening never stalls a frame."""
    built = [shape(i / steps) for i in range(steps + 1)]
    return np.stack([b[0] for b in built]), np.stack([b[1] for b in built])


PETAL_TABLE = _table(petals, STEPS)
SEPAL_TABLE = _table(sepals, 10)


def blend(table, open_):
    """The shape at any openness, blended between the two nearest built steps."""
    P, N = table
    x = float(np.clip(open_, 0.0, 1.0)) * (len(P) - 1)
    i = min(int(x), len(P) - 2)
    w = np.float32(x - i)
    return P[i] + (P[i + 1] - P[i]) * w, N[i] + (N[i + 1] - N[i]) * w
