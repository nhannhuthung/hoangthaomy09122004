"""Where the 19 roses sit - one on top, a ring of 6 around it, an outer ring of
12 - how big each one is, which purple, and when each appears and opens."""

import numpy as np

from .looks import ROSE_MATS
from .maths import TAU, unit
from .settings import DOME, T_BLOOM, TIER_GAP
from .timeline import top_time


def rose_frame(d, twist):
    """Rotation whose columns are a rose's local x, y (= d, its facing) and z."""
    ref = np.array([0.0, 0.0, 1.0]) if abs(d[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    side = unit(np.cross(ref, d))
    fwd = np.cross(side, d)
    c, s = np.cos(twist), np.sin(twist)
    side, fwd = c * side + s * fwd, c * fwd - s * side
    return np.stack([side, d, fwd], 1)


# (level, how many, tilt from the top, turn)
_RINGS = [(0, 1, 0.0, 0.0), (1, 6, 0.72, 0.0), (2, 12, 1.22, 0.5)]
ROSE_TIER = np.array([lvl for lvl, n, _, _ in _RINGS for _ in range(n)])
N_ROSES = len(ROSE_TIER)
_k = np.arange(N_ROSES)
_tilt = np.array([tilt for _, n, tilt, _ in _RINGS for _ in range(n)])
_az = np.array([TAU * (i + off) / n for _, n, _, off in _RINGS for i in range(n)])
_radial = np.stack([np.sin(_tilt) * np.sin(_az), np.cos(_tilt), np.sin(_tilt) * np.cos(_az)], 1)
ROSE_POS = DOME + np.array([0.67, 0.64, 0.64])[ROSE_TIER, None] * _radial   # the top one sits up a little
ROSE_DIR = unit(_radial * [1.2, 1.0, 1.2] + [0.0, 0.0, 0.75])  # lean out, faces turned to us
_rr = np.random.default_rng(3).random((N_ROSES, 4))
ROSE_SIZE = np.array([0.3, 0.25, 0.23])[ROSE_TIER] * (0.95 + 0.1 * _rr[:, 0])   # top, middle, outer ring
ROSE_SHADE = 0.8 + 0.35 * _rr[:, 2]                    # some roses lighter, some darker
ROSE_MAT = ROSE_MATS[np.random.default_rng(11).permutation(N_ROSES) % len(ROSE_MATS)]   # which purple
ROSE_TURN = np.array([rose_frame(d, TAU * w) for d, w in zip(ROSE_DIR, _rr[:, 1])])
_order = np.array([np.sum(ROSE_TIER[:k] == ROSE_TIER[k]) for k in _k])      # place within its ring
ROSE_START = T_BLOOM + TIER_GAP * ROSE_TIER + 0.12 * _order + 0.08 * _rr[:, 3]
T_BUD = top_time(_tilt)                                # buds appear as the stars pass over them

_HEAD = ROSE_POS + ROSE_DIR * (0.35 * ROSE_SIZE)[:, None]   # the middle of each open rose's head
_REACH = 0.72 * ROSE_SIZE                                  # and how far its petals reach


def outside_roses(p):
    """Which of the points p lie outside every rose's head - so leaves and blossoms
    can tuck in behind the roses instead of poking through them."""
    d = np.linalg.norm(p[:, None, :] - _HEAD[None], axis=-1)
    return np.all(d > _REACH[None], axis=1)
