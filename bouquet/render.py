"""Turning the points into characters: the depth buffer, light and shade, the
roses' petal outlines, the strokes along edges, and the running random letters."""

import numpy as np

from .camera import CAM, CAM_POS, FOCAL, LIGHT, spin_at, view_matrix, cells, zoom
from .looks import (MAT, SHINE, BACK, ROSE_MATS, STROKES, STROKE_GLYPHS, SET_TABLE, ROSE_SET_TABLE,
                    GLYPH_LIMITS, CHANGE_RATE, PICKS, colour_of)
from .maths import unit
from .scene import scene


def render(t, rows, cols, aspect):
    """Rasterise the bouquet: per cell its material (-1 = empty), brightness,
    edge stroke (-1 = none), colour and depth."""
    view = view_matrix(spin_at(t))
    P, Nrm, Mat, Tone, Sid = scene(t)
    q = P @ view.T.astype(np.float32)
    q -= (CAM @ CAM_POS).astype(np.float32)
    r, c, ok = cells(q[:, 0], q[:, 1], q[:, 2], rows, cols, aspect)
    idx = np.flatnonzero(ok)
    cell = r[idx] * cols + c[idx]
    z = q[idx, 2]
    zbuf = np.full(rows * cols, np.inf, np.float32)
    np.minimum.at(zbuf, cell, z)                  # nearest point per cell wins
    win = z <= zbuf[cell]
    owner = np.full(rows * cols, -1, np.int64)    # which point shows in each cell
    owner[cell[win]] = idx[win]
    owner, zbuf = mend_roses(owner.reshape(rows, cols), zbuf.reshape(rows, cols), Sid)
    cell = np.flatnonzero(owner.ravel() >= 0)
    idx = owner.ravel()[cell]
    sid = np.full(rows * cols, -1, np.int32)
    sid[cell] = Sid[idx]
    sid = sid.reshape(rows, cols)
    petal, behind = petal_edges(sid, zbuf)        # the roses' petal outlines
    pe, bh = petal.ravel()[cell], behind.ravel()[cell]

    n = Nrm[idx] @ view.T
    v = -unit(q[idx])                             # towards the eye
    facing = np.sum(n * v, 1)
    back = facing < 0
    n[back] *= -1
    mat = np.where(back, BACK[Mat[idx]], Mat[idx])
    diffuse = np.clip(n @ LIGHT, 0, None)
    shine = np.clip(np.sum(n * unit(LIGHT + v), 1), 0, 1) ** 24 * SHINE[mat]
    depth = 1.1 - 0.3 * np.clip((q[idx, 2] - 2.9) / 1.6, 0, 1)
    L = np.clip(((0.26 + 0.55 * diffuse + 0.32 * np.abs(facing)) * Tone[idx] + shine) * depth, 0, 1)
    # petal rims catch the light, with a little shadow just behind them
    L = np.clip(L * np.where(pe >= 0, 1.25, np.where(bh, 0.55, 1.0)), 0, 1)
    # the wrap's border - its outline (where we see it edge-on) and its top edge - stays white
    rim = Mat[idx] == MAT["rim"]
    border = rim | ((Mat[idx] == MAT["paper"]) & (np.abs(facing) < 0.3))
    mat = np.where(border, MAT["rim"], mat)
    L = np.where(border, np.maximum(L, 0.8) * (0.25 + 0.75 * Tone[idx]), L)

    heart = (Sid[idx] >= 0) & (Sid[idx] % 64 == 3) & (pe < 0)   # each rose's tight middle: drawn @
    mats = np.full(rows * cols, -1, np.int16)
    lum = np.zeros(rows * cols, np.float32)
    col = np.zeros(rows * cols, np.int16)
    mats[cell], lum[cell], col[cell] = mat, np.where(heart, np.maximum(L, 0.85), L), colour_of(mat, L ** 0.75)
    zbuf = zbuf.reshape(rows, cols)
    stroke = edge_strokes(zbuf, rows * zoom(aspect), cols / (aspect * rows))   # (a cell is bigger when zoomed out)
    stroke = np.where(sid >= 0, np.where(petal >= 0, len(STROKES) + petal, -1), stroke).astype(np.int8)
    return mats.reshape(rows, cols), lum.reshape(rows, cols), stroke, col.reshape(rows, cols), zbuf, view


def mend_roses(owner, zbuf, Sid):
    """Mend the little holes in the roses. Each rose is a cloud of points, so here
    and there no point lands in a cell and the leaves or paper behind peek through
    - flickering as the bouquet turns. A cell that shows something behind a rose
    (or nothing) while that same rose is on both sides of it, or on three sides,
    gets the rose instead. (The gaps between two different roses stay open.)"""
    rows, cols = owner.shape
    rid = np.where(owner >= 0, Sid[np.maximum(owner, 0)], -1)
    rose = np.where(rid >= 0, rid // 64, -1)                        # which rose, -1 = none
    po = np.pad(owner, 1, constant_values=-1)
    pz = np.pad(zbuf, 1, constant_values=np.inf)
    pr = np.pad(rose, 1, constant_values=-1)
    ids, zs, owners = {}, {}, {}
    for name, (dr, dc) in (("l", (0, -1)), ("r", (0, 1)), ("u", (-1, 0)), ("d", (1, 0))):
        o = po[1 + dr:1 + dr + rows, 1 + dc:1 + dc + cols]
        z = pz[1 + dr:1 + dr + rows, 1 + dc:1 + dc + cols]
        r = pr[1 + dr:1 + dr + rows, 1 + dc:1 + dc + cols]
        ids[name] = np.where((r >= 0) & (r != rose) & (z < zbuf), r, -2)   # a rose in front of this cell
        zs[name], owners[name] = z, o
    l, r, u, d = ids["l"], ids["r"], ids["u"], ids["d"]
    count_l = (l == l).astype(int) + (r == l) + (u == l) + (d == l)
    count_r = (l == r).astype(int) + (r == r) + (u == r) + (d == r)
    target = np.where((l >= 0) & ((l == r) | (count_l >= 3)), l,
                      np.where((u >= 0) & (u == d), u, np.where((r >= 0) & (count_r >= 3), r, -1)))
    best_o = np.full(owner.shape, -1, np.int64)
    best_z = np.full(owner.shape, np.inf, np.float32)
    for name in "lrud":                         # take that rose's nearest neighbouring point
        take = (target >= 0) & (ids[name] == target) & (zs[name] < best_z)
        best_o = np.where(take, owners[name], best_o)
        best_z = np.where(take, zs[name], best_z)
    hole = target >= 0
    return np.where(hole, best_o, owner), np.where(hole, best_z, zbuf)


def petal_edges(sid, zbuf):
    """The outlines of the roses' petals. Where the petal in a cell lies in front
    of something else - the petal behind it, another rose, the leaves, the sky -
    the stroke that outlines it: ( on its left side, ) on its right, _ along its
    bottom, - along its top, / and \\ round the curves (index into PETAL_STROKES,
    else -1). Also: which cells lie just behind such an edge (a little shadow)."""
    rows, cols = sid.shape
    rose = sid >= 0
    ps = np.pad(sid, 1, constant_values=-1)
    pz = np.pad(zbuf, 1, constant_values=np.inf)
    farther, behind = {}, np.zeros(sid.shape, bool)
    for name, (dr, dc) in (("l", (0, -1)), ("r", (0, 1)), ("u", (-1, 0)), ("d", (1, 0))):
        s = ps[1 + dr:1 + dr + rows, 1 + dc:1 + dc + cols]
        z = pz[1 + dr:1 + dr + rows, 1 + dc:1 + dc + cols]
        with np.errstate(invalid="ignore"):
            farther[name] = rose & (s != sid) & (z > zbuf + 0.003)     # something farther back that way
            behind |= rose & (s >= 0) & (s != sid) & (z < zbuf - 0.003)  # a nearer petal that way
    l, r, u, d = farther["l"], farther["r"], farther["u"], farther["d"]
    side, flat = l | r, u | d
    stroke = np.select([l & ~r & ~flat, r & ~l & ~flat, d & ~u & ~side, u & ~d & ~side,
                        (u & l) | (d & r), (u & r) | (d & l)], [0, 1, 2, 3, 4, 5], -1)
    return stroke, behind & (stroke < 0)


def edge_strokes(zbuf, rows, k):
    """Where a surface ends - against empty space, or in front of something much
    farther back - the stroke that follows the edge (index into STROKES), else -1.
    k = cell height / cell width."""
    filled = np.isfinite(zbuf)
    if not filled.any():
        return np.full(zbuf.shape, -1, np.int8)
    D = np.where(filled, zbuf, zbuf[filled].max() + 1.0)
    jump = 2.5 * D / (FOCAL * 0.5 * rows)                  # about 2.5 cells, in depth
    pad = np.pad(D, 1, mode="edge")
    up, down, left, right = pad[:-2, 1:-1], pad[2:, 1:-1], pad[1:-1, :-2], pad[1:-1, 2:]
    edge = filled & ((up - D > jump) | (down - D > jump) | (left - D > jump) | (right - D > jump))
    gx, gy = right - left, (down - up) / k                 # points to what lies farther back
    angle = np.degrees(np.arctan2(-gx, -gy)) % 180          # direction of the edge itself
    s = np.select([angle < 22.5, angle < 67.5, angle < 112.5, angle < 157.5], [0, 1, 2, 3], 0)
    s = np.where((s == 0) & (gy > 0), 4, s)                # a lower edge: _
    return np.where(edge, s, -1).astype(np.int8)


_rnd = np.random.default_rng(17)
_RATE = CHANGE_RATE * (0.5 + _rnd.random(1 << 14))      # every cell changes at its own pace
_PHASE = _rnd.random(1 << 14)
_PICK = _rnd.integers(0, PICKS, 1 << 14)


def glyphs_for(mats, lum, stroke, t):
    """The character in each cell: its edge stroke, or a random letter/symbol of
    its brightness, picked anew every now and then."""
    char = np.zeros(mats.shape, np.int16)
    idx = np.flatnonzero(mats >= 0)
    h = idx % (1 << 14)
    tick = np.floor(t * _RATE[h] + _PHASE[h]).astype(np.int64)
    pick = _PICK[(idx * 7919 + tick * 104729) % (1 << 14)]
    bucket = np.digitize(lum.ravel()[idx], GLYPH_LIMITS)
    rose = np.isin(mats.ravel()[idx], ROSE_MATS)                     # roses: rounder, curly letters
    glyph = np.where(rose, ROSE_SET_TABLE[bucket, pick], SET_TABLE[bucket, pick])
    st = stroke.ravel()[idx]
    char.ravel()[idx] = np.where(st >= 0, STROKE_GLYPHS[np.maximum(st, 0)], glyph)
    return char
