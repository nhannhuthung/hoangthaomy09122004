"""The twinkling stars in the sky, and the shapes stars are drawn with - a point,
or a burst of rays. (The sparks and the stars drawing the bouquet use them too.)"""

import numpy as np

from .looks import GLYPH, N_COLORS, colour_of
from .maths import TAU, smooth

N_STARS = 460
STARS = np.random.default_rng(21).random((N_STARS, 6))
STAR_FLARES = 6


def stars(t):
    """The sky at time t: star positions, how bright each is, and what kind it is."""
    g = STARS
    x = 2.5 * g[:, 0] - 1.25 + 0.04 * np.sin(t * 0.5 + g[:, 5] * TAU)
    rise = (g[:, 1] + t * 0.006 * (0.5 + g[:, 3])) % 1
    y = -1.75 + 3.1 * rise
    z = -1.3 + 2.2 * g[:, 2]
    beat = 2.5 + 4.5 * g[:, 3]
    peak = np.clip(1 - np.abs((t / beat + g[:, 4]) % 1 - 0.5) * beat / 0.24, 0, 1)
    glow = (0.3 + 0.35 * g[:, 5] + peak**1.5) * smooth(rise / 0.06) * smooth((1 - rise) / 0.06)
    kind = np.select([np.arange(N_STARS) < STAR_FLARES, g[:, 2] % 0.25 < 0.045, g[:, 2] % 0.25 < 0.08],
                     [3, 2, 1], 0)
    return np.stack([x, y, z], 1), glow, kind


STAR_BIG = np.array([0.0, 0.0, 3.2, 4.2])        # burst size (rows) at a twinkle's peak, per kind
STAR_MIN = 2.0                                     # smaller than this: just a point
_TEMPLATES = {}


def star_template(size, k):
    """The characters of one star `size` rows big: (d_row, d_col, glyph, falloff).
    A point, or a burst whose vertical and horizontal rays reach further than
    its diagonals. k = cell height / cell width."""
    key = (size, round(k, 2))
    if key not in _TEMPLATES:
        cells_ = [(0, 0, "+", 0.0)]
        nv, nh = (int(size + 0.5) + 1, int(size * k + 0.5) + 2) if size else (0, 0)
        nd = int(size * 0.5 + 0.5)
        for n, (sr, sc), glyph in ((nv, (1, 0), "|"), (nh, (0, 1), "-")):
            for i in range(1, n + 1):
                g = "." if n >= 3 and i == n else glyph
                cells_ += [(i * sr, i * sc, g, i / (n + 1)), (-i * sr, -i * sc, g, i / (n + 1))]
        for i in range(1, nd + 1):
            dc, f = int(i * k + 0.5), i / (nd + 1)
            tip = nd >= 2 and i == nd
            cells_ += [(-i, dc, "." if tip else "/", f), (i, -dc, "." if tip else "/", f),
                       (-i, -dc, "." if tip else "\\", f), (i, dc, "." if tip else "\\", f)]
        dr, dc, g, f = zip(*cells_)
        _TEMPLATES[key] = (np.array(dr), np.array(dc), np.array([GLYPH[x] for x in g]), np.array(f))
    return _TEMPLATES[key]


SMALL_STAR = np.array([GLYPH["."], GLYPH["+"], GLYPH["+"]])


def star_cells(r, c, size, bright, mat, k, z=None):
    """Every character of every star: rows, cols, glyph keys, brightness (and depth)."""
    out = []
    size = np.round(size * 2) / 2
    for s in np.unique(size):
        sel = size == s
        dr, dc, g, f = star_template(float(s), k)
        rr, cc = r[sel, None] + dr, c[sel, None] + dc
        level = bright[sel, None] * (1 - 0.75 * f)
        glyph = np.broadcast_to(g, rr.shape).copy()
        if s == 0:
            glyph[:, 0] = SMALL_STAR[np.digitize(bright[sel], [0.45, 0.75])]
        key = glyph * N_COLORS + colour_of(mat[sel, None], level)
        depth = np.broadcast_to((z if z is not None else np.zeros(len(r)))[sel, None], rr.shape)
        out.append((rr.ravel(), cc.ravel(), key.ravel(), level.ravel(), depth.ravel()))
    if not out:
        return (np.zeros(0, int),) * 3 + (np.zeros(0),) * 2
    return tuple(np.concatenate(a) for a in zip(*out))


def one_per_cell(rows, cols, r, c, key, level, keep):
    """Drop characters off screen or not wanted; where stars overlap keep the brightest."""
    ok = (r >= 0) & (r < rows) & (c >= 0) & (c < cols)
    ok[ok] &= keep(r[ok], c[ok], np.flatnonzero(ok))
    r, c, key, level = r[ok], c[ok], key[ok], level[ok]
    if len(r) == 0:
        return r, c, key
    cell = r * cols + c
    order = np.lexsort((level, cell))
    last = np.r_[cell[order][1:] != cell[order][:-1], True]
    sel = order[last]
    return r[sel], c[sel], key[sel]
