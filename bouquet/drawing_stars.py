"""The sparkling stars that draw the bouquet: they lead the stems as they grow,
wait at the tips, and at the top spread out over the dome."""

import numpy as np

from .maths import TAU, smooth
from .roses import N_ROSES, ROSE_POS, ROSE_DIR, T_BUD
from .settings import WAIST, BOTTOM_Y, DOME, T_TOP
from .timeline import grown_to

_n = np.arange(N_ROSES)
_sp = np.stack([0.026 * np.sin(1.7 * np.arange(9)), np.zeros(9), 0.026 * np.cos(1.7 * np.arange(9))], 1)
_sp = _sp * np.sqrt((np.arange(9) + 1) / 9)[:, None]
STEM_LOW = WAIST + _sp * 2.4 + [0.0, BOTTOM_Y - WAIST[1], 0.0]      # the bundle (as in greenery.stems)
STEM_HIGH = WAIST + _sp + [0.0, 0.1, 0.0]
RS_START = WAIST + [0.0, 0.1, 0.0] + np.stack([0.026 * np.sin(1.7 * _n), 0 * _n, 0.026 * np.cos(1.7 * _n)], 1)
RS_BASE = ROSE_POS - ROSE_DIR * 0.02                                # each rose's stem (as in greenery.stems)
RS_BEND = np.stack([0.35 * RS_BASE[:, 0], 0.5 * (RS_START[:, 1] + RS_BASE[:, 1]), 0.35 * RS_BASE[:, 2]], 1)
N_TOP_PENS = 16          # how many stars spread out over the top


def pens(t):
    """The stars drawing the bouquet at time t: their positions and brightness."""
    y = grown_to(t)
    P, B = [], []
    f = (y - STEM_LOW[:, 1]) / (STEM_HIGH[:, 1] - STEM_LOW[:, 1])          # up the bundle
    on = (f >= 0) & (f <= 1)
    P.append(STEM_LOW[on] + (STEM_HIGH[on] - STEM_LOW[on]) * f[on, None])
    B.append(np.ones(int(on.sum())))
    u = (y - RS_START[:, 1]) / (RS_BASE[:, 1] - RS_START[:, 1])            # out along each rose's stem,
    on = (u >= 0) & (t < T_BUD + 0.25)                                    # waiting there for its bud
    u = np.clip(u[on], 0, 1)[:, None]
    P.append((1 - u)**2 * RS_START[on] + 2 * (1 - u) * u * RS_BEND[on] + u**2 * RS_BASE[on])
    B.append(1 - smooth((t - T_BUD[on]) / 0.25))
    s = (t - T_TOP[0]) / (T_TOP[1] - T_TOP[0])                            # spreading over the top
    if 0 <= s < 1.2:
        i = np.arange(N_TOP_PENS)
        az = TAU * i / N_TOP_PENS + 0.2 + 0.15 * np.sin(6 * s + i)
        tilt = 1.25 * min(s, 1.0)
        P.append(DOME + 0.66 * np.stack([np.sin(tilt) * np.sin(az), np.full(N_TOP_PENS, np.cos(tilt)),
                                         np.sin(tilt) * np.cos(az)], 1))
        B.append(np.full(N_TOP_PENS, 1 - smooth((s - 1) / 0.2)))
    return np.concatenate(P), np.concatenate(B)
