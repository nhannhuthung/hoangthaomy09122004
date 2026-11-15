"""Where we look from, the light, the gentle swing, and how points in the bouquet
land on the grid of characters."""

import numpy as np

from .maths import TAU, smooth, unit
from .settings import T_SPIN, SPIN, SPIN_PERIOD

CAM_POS = np.array([0.0, 0.3, 3.8])
CAM_AIM = np.array([0.0, -0.45, 0.0])
FOCAL = 3.0
MIDDLE = 0.47            # screen height (0 top .. 1 bottom) of the aim point
NEAR = 0.3
LIGHT = unit(np.array([-0.55, 0.7, -0.45]))   # camera space: upper left, front

_fwd = unit(CAM_AIM - CAM_POS)
_right = np.array([1.0, 0.0, 0.0])
CAM = np.stack([_right, np.cross(_right, _fwd), _fwd])   # rows: x, y, z axes


def spin_at(t):
    """How far the bouquet is turned at time t (swinging gently once it has bloomed)."""
    if t <= T_SPIN:
        return 0.0
    return SPIN * np.sin(TAU * (t - T_SPIN) / SPIN_PERIOD) * smooth((t - T_SPIN) / 2.5)


def view_matrix(spin):
    c, s = np.cos(spin), np.sin(spin)
    return CAM @ np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]])


def look(p, spin=0.0):
    """Bouquet coordinates -> camera coordinates (x right, y up, z depth)."""
    q = p @ view_matrix(spin).T - CAM @ CAM_POS
    return q[:, 0], q[:, 1], q[:, 2]


DESIGN_ASPECT = 0.8      # the bouquet is framed for windows at least this wide (width / height);
                         # narrower ones - a phone - zoom out just enough for it to fit


def zoom(aspect):
    """How far to zoom out so the bouquet fits a window of this shape (1 = not at all)."""
    return min(1.0, aspect / DESIGN_ASPECT)


def screen_pos(x, y, z, rows, cols, aspect, fit=None):
    """Camera coordinates -> fractional (row, col) position on the character grid.
    `fit` scales the picture; by default it zooms out just enough for narrow windows."""
    fit = zoom(aspect) if fit is None else fit
    iz = (FOCAL * 0.5 * fit) / np.maximum(z, 1e-3)
    return MIDDLE * rows - y * iz * rows, 0.5 * cols + x * iz * (cols / aspect)


def cells(x, y, z, rows, cols, aspect):
    """Camera coordinates -> character cell (row, col) and an on-screen mask."""
    fy, fx = screen_pos(x, y, z, rows, cols, aspect)
    r, c = np.floor(fy).astype(np.int32), np.floor(fx).astype(np.int32)
    ok = (z > NEAR) & (r >= 0) & (r < rows) & (c >= 0) & (c < cols)
    return r, c, ok
