"""The wrapping paper: its final shape (paper) and the skirt-like blow-out on the
way there (paper_at)."""

import numpy as np

from .maths import TAU, smooth, normals_of
from .settings import WAIST, T_PAPER

PAPER_FRONT, PAPER_BACK = -0.42, 0.45   # height of the wrap's edge at the front and at the back


def paper():
    a, v = np.meshgrid(np.linspace(0, TAU, 150, endpoint=False), np.linspace(0, 1, 30))
    top = PAPER_FRONT + (PAPER_BACK - PAPER_FRONT) * (1 - np.cos(a)) / 2 + 0.03 * np.cos(9 * a)
    r = (0.075 + (0.645 + 0.2 * (1 - np.cos(a)) / 2) * v ** 0.75) * (1 + 0.07 * v)
    y = WAIST[1] + v * (top - WAIST[1])
    p = np.stack([r * np.sin(a), y, r * np.cos(a)], -1)
    n = normals_of(p, 1, 0, np.stack([np.sin(a), np.zeros_like(a), np.cos(a)], -1))
    rim = v > 0.965
    wrap = (1 + np.cos(a)) / 2
    appear = T_PAPER[0] + (T_PAPER[1] - T_PAPER[0]) * (0.6 * wrap + 0.4 * v)
    return p.reshape(-1, 3), n.reshape(-1, 3), rim.ravel(), appear.ravel()


PAPER_A, PAPER_V = np.meshgrid(np.linspace(0, TAU, 150, endpoint=False), np.linspace(0, 1, 30))   # paper()'s grid


def paper_at(t):
    """The wrap while it appears: gathered tight round the stems at first, it
    blows out like a skirt - belling out, its hem rolling in curves and rising
    and falling, swirling a little - then settles into the shape paper() gives."""
    s = np.clip((t - T_PAPER[0]) / (T_PAPER[1] - T_PAPER[0]), 0.0, 1.0)
    a, v = PAPER_A, PAPER_V
    top = PAPER_FRONT + (PAPER_BACK - PAPER_FRONT) * (1 - np.cos(a)) / 2 + 0.03 * np.cos(9 * a)
    r = (0.075 + (0.645 + 0.2 * (1 - np.cos(a)) / 2) * v ** 0.75) * (1 + 0.07 * v)
    y = WAIST[1] + v * (top - WAIST[1])
    blow = 1 - 0.9 * np.exp(-4.5 * s) * np.cos(6.5 * s)          # 0.1 -> past 1 -> settles at 1
    wave = (1 - np.exp(-10 * s)) * (1 - smooth(s))              # the curves: none at the start or end
    r = 0.075 + (r - 0.075) * blow                              # the hem flares out the most
    r = r * (1 + wave * (0.2 * v ** 1.2 * np.sin(7 * a - 9 * s)  # rolling in curves round the hem
                         + 0.16 * np.sin(np.pi * v)))           # and belling out in the middle
    y = (WAIST[1] + (y - WAIST[1]) * (0.5 + 0.5 * blow)         # it lifts,
         + wave * 0.1 * v ** 2 * np.cos(7 * a - 9 * s + 0.6))   # the hem rising and falling
    a = a - 0.9 * (1 - smooth(1.5 * s))                         # swirling into place
    p = np.stack([r * np.sin(a), y, r * np.cos(a)], -1)
    n = normals_of(p, 1, 0, np.stack([np.sin(a), np.zeros_like(a), np.cos(a)], -1))
    return p.reshape(-1, 3).astype(np.float32), n.reshape(-1, 3).astype(np.float32)
