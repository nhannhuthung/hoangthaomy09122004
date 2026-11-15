"""One whole frame, put together: the bouquet's characters, what goes over it,
the note, and the numbers for the status lines."""

import numpy as np

from .maths import smooth
from .message import message
from .overlays import sprites
from .render import render, glyphs_for
from .roses import ROSE_START
from .scene import GROW_TIMES
from .settings import OPEN


def frame(t, rows, cols, cw, ch):
    """Everything for one frame: character and colour grids, the note (or None),
    the stars / sparks / loose petals, and the numbers for the status lines."""
    aspect = (cols * cw) / (rows * ch)
    mats, lum, stroke, col, zbuf, view = render(t, rows, cols, aspect)
    char = glyphs_for(mats, lum, stroke, t)
    over = sprites(t, char, zbuf, view, aspect)
    note = message(char, col, t, cw, ch, aspect)
    if note:                                    # keep the stars off the note
        r0, r1, c0, c1 = note["clear"]
        r, c, key = over["sky"]
        off = (r < r0) | (r >= r1) | (c < c0) | (c >= c1)
        over["sky"] = (r[off], c[off], key[off])
    stats = {"growing": np.searchsorted(GROW_TIMES, t, side="right") / len(GROW_TIMES),
             "open": int(np.sum(smooth((t - ROSE_START) / OPEN) >= 0.95)),
             "falling": over["falling"], "letters": int(np.count_nonzero(char))}
    return char, col, note, over, stats
