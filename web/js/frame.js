"use strict";
/* One whole frame, put together: the characters, what goes over them, the note and the status numbers. */

function frame(t, rows, cols, cw, ch) {
  const aspect = (cols * cw) / (rows * ch), g = grids(rows, cols);
  const view = render(t, rows, cols, aspect);
  glyphsFor(g, t);
  const over = sprites(t, g, aspect, view, true);
  const note = message(g, t, cw, ch, aspect);
  if (note) {                            // keep the stars off the note
    const [r0, r1, c0, c1] = note.clear;
    over.sky = over.sky.filter(([r, c]) => r < r0 || r >= r1 || c < c0 || c >= c1);
  }
  let letters = 0, open = 0;
  for (let i = 0; i < rows * cols; i++) if (g.char[i]) letters++;
  for (const s of ROSE_START) if (smooth((t - s) / OPEN) >= 0.95) open++;
  const growing = upperBound(STATIC.growTimes, t) / STATIC.growTimes.length;
  return { g, over, note, stats: { growing, open, falling: over.nFalling, letters } };
}
