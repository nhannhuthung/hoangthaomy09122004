"""What is drawn over the bouquet: the stars in the sky, the gold sparks, the
sparkling stars drawing the bouquet, and the loose petals."""

import numpy as np

from .camera import CAM, CAM_POS, NEAR, screen_pos, view_matrix
from .drawing_stars import pens
from .falling import FALL_POSES, falling
from .looks import MAT, GLYPH, N_COLORS, colour_of
from .roses import ROSE_MAT
from .sparks import GLINT, pops
from .stars import STAR_BIG, STAR_MIN, stars, star_cells, one_per_cell


def sprites(t, char, zbuf, view, aspect):
    """Stars, sparks, drawing stars and loose petals over the bouquet's character grid."""
    rows, cols = char.shape
    k = cols / (aspect * rows)
    sky_view = view_matrix(0.0)

    def project(p, v=view, fit=None):
        q = p @ v.T - CAM @ CAM_POS
        fy, fx = screen_pos(q[:, 0], q[:, 1], q[:, 2], rows, cols, aspect, fit)
        r, c = np.floor(fy).astype(int), np.floor(fx).astype(int)
        ok = (q[:, 2] > NEAR) & (r >= 0) & (r < rows) & (c >= 0) & (c < cols)
        return fx, fy, np.clip(r, 0, rows - 1), np.clip(c, 0, cols - 1), q[:, 2], ok

    # the gold sparks as roses finish opening
    p, size, kind = pops(t)
    fx, fy, r, c, z, ok = project(p)
    rr, cc, key, level, depth = star_cells(r[ok], c[ok], np.zeros(int(ok.sum())),
                                           np.clip(0.45 + 0.65 * size, 0, 1)[ok],
                                           np.where(kind == GLINT, MAT["glint"], MAT["gold"])[ok], k, z[ok])
    sparks = one_per_cell(rows, cols, rr, cc, key, level, lambda r_, c_, i: depth[i] < zbuf[r_, c_] + 0.3)

    # the sparkling stars leading the growth: a bright * that now and then flashes into a
    # little burst of rays, trailing glitter (where it just was)
    pts, bri, head = [], [], []
    for j in range(6):
        p, b = pens(t - 0.035 * j)
        pts.append(p)
        bri.append(b * (1 - j / 6))
        head.append(np.full(len(b), j == 0))
    p, b, head = (np.concatenate(a) for a in (pts, bri, head))
    n = np.arange(len(b))
    b = b * (0.75 + 0.25 * np.sin(37 * t + 1.7 * n))                   # twinkling
    fx, fy, r, c, z, ok = project(p)
    on = ok & (b > 0.03)
    flash = np.clip(np.sin(23 * t + 2.3 * n), 0, 1) ** 4               # brief flashes, each its own time
    rays = np.where(flash > 0.3, 1.2 + 0.8 * flash, 0.0)
    glint = np.full(len(b), MAT["glint"])
    hd, tr = on & head, on & ~head
    parts = [star_cells(r[hd], c[hd], rays[hd], b[hd], glint[hd], k, z[hd])]          # the rays
    parts.append((r[hd], c[hd], GLYPH["*"] * N_COLORS + colour_of(MAT["glint"], b[hd]),
                  np.full(int(hd.sum()), 2.0), z[hd]))                               # the * itself
    parts.append((r[tr], c[tr], np.where(b[tr] > 0.45, GLYPH["+"], GLYPH["."]) * N_COLORS
                  + colour_of(MAT["glint"], b[tr]), b[tr], z[tr]))                   # the glitter
    rr, cc, key, level, depth = (np.concatenate(a) for a in zip(*parts))
    drawing = one_per_cell(rows, cols, rr, cc, key, level, lambda r_, c_, i: depth[i] < zbuf[r_, c_] + 0.2)

    # the twinkling stars, out in the open sky only
    p, glow, kind = stars(t)
    fx, fy, r, c, z, ok = project(p, sky_view, fit=1.0)     # (the sky fills the window, never zoomed)
    show = ok & (glow > 0.02)
    burst = STAR_BIG[kind] * np.clip(glow - 0.65, 0, 1) ** 0.6
    burst = np.where(burst >= STAR_MIN, burst, 0.0)
    rr, cc, key, level, _ = star_cells(r[show], c[show], burst[show], np.clip(0.2 + 0.55 * glow, 0, 1)[show],
                                       np.full(len(r), MAT["star"])[show], k)
    taken = np.zeros((rows, cols), bool)
    taken[sparks[0], sparks[1]] = True
    taken[drawing[0], drawing[1]] = True
    sky = one_per_cell(rows, cols, rr, cc, key, level, lambda r_, c_, i: np.isinf(zbuf[r_, c_]) & ~taken[r_, c_])

    # the loose petals, gliding at exact pixel positions
    loose, n_falling = [], 0
    for pos, rose, pose, fade in falling(t):
        fx, fy, r, c, z, ok = project(pos[None], sky_view)
        if fade < 0.05 or not ok[0] or z[0] > zbuf[r[0], c[0]] + 0.02:
            continue
        n_falling += 1
        tint = int(colour_of(ROSE_MAT[rose], 0.3 + 0.6 * fade))
        for dc, g in enumerate(FALL_POSES[pose]):
            if g:
                loose.append((fx[0] - 0.5 + dc, fy[0] - 0.5, GLYPH[g] * N_COLORS + tint))
    return {"sky": sky, "sparks": sparks, "drawing": drawing, "petals": loose, "falling": n_falling}
