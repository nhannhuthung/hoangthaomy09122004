"""Every point of the bouquet that is showing at a given moment: the parts that
just appear (stems, foliage, leaves, blossoms, bow), the wrap blowing out, and
the roses growing and opening."""

import numpy as np

from .bow import ribbon
from .greenery import stems, foliage, leaves, blossoms
from .looks import MAT
from .maths import smooth
from .petals import PETAL_TABLE, SEPAL_TABLE, PETAL_TONE, SEPAL_TONE, PETAL_SURF, SEPAL_SURF, blend
from .roses import (N_ROSES, ROSE_POS, ROSE_TURN, ROSE_SIZE, ROSE_SHADE, ROSE_MAT, ROSE_START, T_BUD,
                    outside_roses)
from .settings import T_PAPER, OPEN, FADE_IN
from .timeline import grow_time
from .wrapper import paper, paper_at, PAPER_V


def _build_static():
    chunks = []

    def put(p, n, mat, appear, tone=1.0):
        m = len(p)
        chunks.append((p, n, *(np.broadcast_to(a, m) for a in (mat, appear, tone))))

    p, n = stems()
    put(p, n, MAT["stem"], grow_time(p[:, 1]))
    p, n, ap = foliage()
    put(p, n, MAT["foliage"], ap)
    p, n, part, ap = leaves()
    keep = outside_roses(p)                    # the bits inside a rose would poke through it
    put(p[keep], n[keep], MAT["leaf"], ap[keep])
    p, n, ap = blossoms()
    keep = outside_roses(p)
    put(p[keep], n[keep], MAT["blossom"], ap[keep])
    paper_grow = T_PAPER[0] + 0.5 * (T_PAPER[1] - T_PAPER[0]) * PAPER_V.ravel()   # (the wrap moves: see _scene)
    grow = np.concatenate([c[3] for c in chunks] + [paper_grow, T_BUD])          # what "growing" counts
    p, n, part, ap = ribbon()
    put(p, n, MAT["ribbon"], ap, np.where(part == 3, 0.85, 1.0))

    P, N, M, A, T = (np.concatenate(c) for c in zip(*chunks))
    order = np.argsort(A, kind="stable")       # sorted by appearance: visible = a prefix
    return (P[order].astype(np.float32), N[order].astype(np.float32), M[order].astype(np.int16),
            A[order], T[order].astype(np.float32), np.sort(grow))


S_P, S_N, S_M, S_APPEAR, S_TONE, GROW_TIMES = _build_static()
_pp, _pn, _prim, _ = paper()                               # the wrap once it has blown out
PAPER_DONE = (_pp.astype(np.float32), _pn.astype(np.float32))
PAPER_MAT = np.where(_prim, MAT["rim"], MAT["paper"]).astype(np.int16)
PAPER_TONE = np.ones(len(_pp), np.float32)
_POS32, _TURN32 = ROSE_POS.astype(np.float32), ROSE_TURN.transpose(0, 2, 1).astype(np.float32)
_FINISHED = []


def scene(t):
    """Every surface point visible at time t: positions, normals, materials, tones
    and petal ids. (Once everything has appeared and every rose is open, they
    are kept and reused.)"""
    if t >= T_FINISHED:
        if not _FINISHED:
            _FINISHED.append(_scene(T_FINISHED))
        return _FINISHED[0]
    return _scene(t)


def _scene(t):
    m = np.searchsorted(S_APPEAR, t, side="right")
    fade = smooth((t - S_APPEAR[:m]) / FADE_IN)
    P, N, M, T = [S_P[:m]], [S_N[:m]], [S_M[:m]], [S_TONE[:m] * (0.08 + 0.92 * fade)]
    I = [np.full(m, -1, np.int32)]                         # petal ids: -1 = not a rose
    if t >= T_PAPER[0]:                                    # the wrap, blowing out
        p, n = PAPER_DONE if t >= T_PAPER[1] else paper_at(t)
        tone = PAPER_TONE * np.float32(smooth((t - T_PAPER[0]) / 0.25))
        for a, b in zip((P, N, M, T, I), (p, n, PAPER_MAT, tone, np.full(len(p), -1, np.int32))):
            a.append(b)
    for k in range(N_ROSES):
        if t < T_BUD[k]:
            continue
        grow = smooth((t - T_BUD[k]) / 0.6)
        op = smooth((t - ROSE_START[k]) / OPEN)
        for a, b in zip((P, N, M, T, I), rose_points(k, grow, op)):
            a.append(b)
    return tuple(np.concatenate(a) for a in (P, N, M, T, I))


_ROSE_CACHE = {}


def rose_points(k, grow, op):
    """Points of rose k (petals and sepals): positions, normals, materials, tones
    and petal ids. A fully grown rose that is closed or fully open doesn't
    change, so those are kept."""
    steady = grow >= 1.0 and op in (0.0, 1.0)
    if steady and (k, op) in _ROSE_CACHE:
        return _ROSE_CACHE[(k, op)]
    size = np.float32(ROSE_SIZE[k] * (0.04 + 0.96 * grow) * (1.3 - 0.3 * op))
    light = np.float32((0.3 + 0.7 * grow) * ROSE_SHADE[k])
    turn = _TURN32[k]
    out = [[], [], [], [], []]
    for (p, n), mat, tone, surf in ((blend(PETAL_TABLE, op), ROSE_MAT[k], PETAL_TONE, PETAL_SURF),
                                    (blend(SEPAL_TABLE, op), MAT["sepal"], SEPAL_TONE, SEPAL_SURF)):
        for a, b in zip(out, (_POS32[k] + (p @ turn) * size, n @ turn,
                              np.full(len(p), mat, np.int16), tone * light, 64 * k + surf)):
            a.append(b)
    out = tuple(np.concatenate(a) for a in out)
    if steady:
        _ROSE_CACHE[(k, op)] = out
    return out


T_FINISHED = max(float(S_APPEAR.max()) + FADE_IN, float(ROSE_START.max()) + OPEN,
                 float(T_BUD.max()) + 0.6, T_PAPER[1])
