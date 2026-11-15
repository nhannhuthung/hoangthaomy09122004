"""The green parts and the baby's breath: the stems, the foliage dome, the leaves
and the little white blossoms."""

import numpy as np

from .maths import TAU, unit, normals_of
from .roses import N_ROSES, ROSE_POS, ROSE_DIR
from .settings import WAIST, BOTTOM_Y, DOME
from .timeline import top_time


def tube(curve, radius, around=8):
    """Points and normals on a tube of `radius` around a polyline curve[n, 3]."""
    d = unit(np.gradient(curve, axis=0))
    ref = np.where(np.abs(d[:, 1:2]) < 0.95, [[0.0, 1.0, 0.0]], [[1.0, 0.0, 0.0]])
    side = unit(np.cross(d, ref))
    up = np.cross(side, d)
    a = np.linspace(0, TAU, around, endpoint=False)
    n = np.cos(a)[None, :, None] * side[:, None] + np.sin(a)[None, :, None] * up[:, None]
    return (curve[:, None] + radius * n).reshape(-1, 3), n.reshape(-1, 3)


def stems():
    P, N = [], []
    for k in range(9):
        spot = np.array([0.026 * np.sin(1.7 * k), 0.0, 0.026 * np.cos(1.7 * k)]) * np.sqrt((k + 1) / 9)
        top = WAIST + spot + [0.0, 0.1, 0.0]
        end = WAIST + spot * 2.4 + [0.0, BOTTOM_Y - WAIST[1], 0.0]
        p_, n_ = tube(top + (end - top) * np.linspace(0, 1, 40)[:, None], 0.013, 8)
        P.append(p_)
        N.append(n_)
    for k in range(N_ROSES):
        base = ROSE_POS[k] - ROSE_DIR[k] * 0.02
        start = WAIST + [0.0, 0.1, 0.0] + np.array([0.026 * np.sin(1.7 * k), 0.0, 0.026 * np.cos(1.7 * k)])
        bend = np.array([0.35 * base[0], 0.5 * (start[1] + base[1]), 0.35 * base[2]])
        u = np.linspace(0, 1, 30)[:, None]
        p_, n_ = tube((1 - u)**2 * start + 2 * (1 - u) * u * bend + u**2 * base, 0.011, 6)
        P.append(p_)
        N.append(n_)
    return np.concatenate(P), np.concatenate(N)


def foliage():
    tilt, a = np.meshgrid(np.linspace(0, 1.25, 20), np.linspace(0, TAU, 90, endpoint=False))
    r = 0.6 + 0.012 * np.sin(7 * a + 14 * tilt)
    p = DOME + r[..., None] * np.stack([np.sin(tilt) * np.sin(a), np.cos(tilt), np.sin(tilt) * np.cos(a)], -1)
    appear = top_time(tilt)                         # drawn by the stars spreading from the top
    return p.reshape(-1, 3), normals_of(p, 1, 0, np.array([0.0, 1.0, 0.0])).reshape(-1, 3), appear.ravel()


N_BLOSSOM = 110
_bl = np.random.default_rng(41).random((N_BLOSSOM, 3))
_h = 1 - (np.arange(14) + 0.5) / 7                  # 14 points spread over a sphere
_SPHERE = np.stack([np.cos(2.39996 * np.arange(14)) * np.sqrt(1 - _h**2), _h,
                    np.sin(2.39996 * np.arange(14)) * np.sqrt(1 - _h**2)], 1)


def blossoms():
    """Little white sprays of baby's breath dotted over the foliage."""
    tilt, a = 1.2 * np.sqrt(_bl[:, 0]), TAU * _bl[:, 1]
    d = np.stack([np.sin(tilt) * np.sin(a), np.cos(tilt), np.sin(tilt) * np.cos(a)], 1)
    centre = DOME + (0.62 + 0.04 * _bl[:, 2])[:, None] * d
    p = centre[:, None] + 0.022 * _SPHERE[None]
    n = np.broadcast_to(_SPHERE, p.shape)
    appear = np.repeat(top_time(tilt) + 0.15, len(_SPHERE))      # they come with the foliage
    return p.reshape(-1, 3), n.reshape(-1, 3), appear


N_LEAF = 15
_lf = np.random.default_rng(5).random((N_LEAF, 3))


def leaves():
    """Rose leaves tucked in under the flowers, poking out over the paper."""
    P, N, part, appear = [], [], [], []
    along, across = np.meshgrid(np.linspace(0, 1, 24), np.linspace(-1, 1, 7))
    for j in range(N_LEAF):
        a = TAU * (j + 0.5 * _lf[j, 0]) / N_LEAF
        out = np.array([np.sin(a), 0.0, np.cos(a)])
        side = np.array([np.cos(a), 0.0, -np.sin(a)])
        behind = (1 - np.cos(a)) / 2
        base = DOME + 0.52 * unit(out + [0.0, 0.5, 0.0])
        head = unit(out + [0.0, 0.35 + 0.9 * behind + 0.3 * _lf[j, 1], 0.0])
        flat = unit(np.cross(head, side))
        flat = flat if flat[1] > 0 else -flat
        length = 0.36 + 0.14 * _lf[j, 2]
        half = 0.075 * np.sin(np.pi * along) ** 0.8 * (1 - 0.3 * along)
        spine = base + length * along[..., None] * head - (0.25 * length * along**2)[..., None] * flat
        p = spine + (half * across)[..., None] * side + (0.3 * half * np.abs(across))[..., None] * flat
        n = normals_of(p, 1, 0, flat)
        P.append(p.reshape(-1, 3))
        N.append(n.reshape(-1, 3))
        part.append(np.full(len(P[-1]), 20 + j))
        tilt = np.arccos(np.clip((base - DOME)[1] / np.linalg.norm(base - DOME), -1, 1))
        appear.append((top_time(tilt) + 0.04 * j + 0.5 * along).ravel())
    return np.concatenate(P), np.concatenate(N), np.concatenate(part), np.concatenate(appear)
