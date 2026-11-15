"""The note under the bouquet: its lines type themselves out one after another,
with a pause between them - and the <3 beats."""

import numpy as np

from .camera import look, screen_pos
from .settings import MESSAGE_LINES, MESSAGE_PK, T_MSG, LINE_DELAY, BOTTOM_Y

TYPE_SPEED = 10          # letters per second
LINE_START = []          # when each line starts typing: after the line above, and a pause
_t = T_MSG
for _line in MESSAGE_LINES:
    LINE_START.append(_t)
    _t += len(_line) / TYPE_SPEED + LINE_DELAY


def message_pk(width, height):
    """The note's size: scaled to the window (a narrow phone window gets it a little
    bigger for its width, so it stays easy to read), and small enough for the
    longest line to fit."""
    size = MESSAGE_PK * min(width / 560, height / 965)
    longest = max(len(line) for line in MESSAGE_LINES)
    return max(8, round(min(size, 0.9 * width / (0.6 * longest))))


def message(char, col, t, cw, ch, aspect):
    """Clear the part of the grid under the bouquet where the note goes, and return
    how to draw it: its size, and for every line that has started - its row, where
    it starts, how much of it is typed, and how the <3 beats."""
    if t < T_MSG:
        return None
    rows, cols = char.shape
    width = cols * cw
    x_, y_, z_ = look(np.array([[0, BOTTOM_Y - 0.28, 0]], np.float32))
    first = float(screen_pos(x_, y_, z_, rows, cols, aspect)[0][0])     # row of the first line
    size = message_pk(width, rows * ch)
    advance = 0.6 * size
    spacing = 1.15 * size / ch                                        # rows from one line to the next
    lines = []
    for i, (text, start) in enumerate(zip(MESSAGE_LINES, LINE_START)):
        typed = (t - start) * TYPE_SPEED
        if typed <= 0:
            break
        love = text.find("<3")
        ph = (t - start - love / TYPE_SPEED + 0.6) % 1.1
        beat = np.exp(-(ph / 0.06)**2) + 0.55 * np.exp(-((ph - 0.24) / 0.06)**2)
        lines.append((first + i * spacing, (width - advance * len(text)) / 2, text,
                      min(len(text), int(typed)), typed, love, beat if 0 <= love < typed else 0.0))
    widest = advance * max(len(line) for line in MESSAGE_LINES)       # clear room for all the lines
    reach = int(np.ceil(0.75 * size / ch))
    r0, r1 = int(first) - reach, int(first + (len(MESSAGE_LINES) - 1) * spacing) + reach + 1
    c0, c1 = int(((width - widest) / 2) // cw) - 2, int(((width + widest) / 2) // cw) + 3
    char[max(r0, 0):r1, max(c0, 0):c1] = 0
    col[max(r0, 0):r1, max(c0, 0):c1] = 0
    return {"size": size, "advance": advance, "lines": lines, "clear": (r0, r1, c0, c1)}
