"""When the growth reaches a height, and when the stars spreading over the top
reach a spot."""

import numpy as np

from .settings import BOTTOM_Y, TOP_Y, T_GROW, T_TOP


def grow_time(y):
    """When the growth reaches height y."""
    f = np.clip((np.asarray(y) - BOTTOM_Y) / (TOP_Y - BOTTOM_Y), 0.0, 1.0)
    return T_GROW[0] + (T_GROW[1] - T_GROW[0]) * f


def grown_to(t):
    """How high the growth has reached at time t (grow_time the other way round)."""
    return BOTTOM_Y + (TOP_Y - BOTTOM_Y) * (t - T_GROW[0]) / (T_GROW[1] - T_GROW[0])


def top_time(tilt):
    """When the stars spreading out from the top reach `tilt` (radians from the top)."""
    return T_TOP[0] + (T_TOP[1] - T_TOP[0]) * np.clip(np.asarray(tilt) / 1.25, 0.0, 1.0)
