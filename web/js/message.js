"use strict";
/* The note under the bouquet: its lines type themselves out one after another, and the <3 beats. */

const TYPE_SPEED = 10;                  // letters per second
const LINE_START = [];
{ let tt = T_MSG; for (const line of MESSAGE_LINES) { LINE_START.push(tt); tt += line.length / TYPE_SPEED + LINE_DELAY; } }
const LONGEST = Math.max(...MESSAGE_LINES.map((l) => l.length));
function messagePk(width, height) {     // scaled to the window, and small enough for the longest line to fit
  const size = MESSAGE_PK * Math.min(width / 560, height / 965);
  return Math.max(8, Math.round(Math.min(size, 0.9 * width / (0.6 * LONGEST))));
}
function message(g, t, cw, ch, aspect) { // clear room under the bouquet; return how to draw the lines typed so far
  if (t < T_MSG) return null;
  const { rows, cols } = g, width = cols * cw, M = SKY_VIEW, y = BOTTOM_Y - 0.28;
  const qy = M[4] * y - CAM_OFF[1], qz = M[7] * y - CAM_OFF[2];
  const first = MIDDLE * rows - qy * (FOCAL * 0.5 * zoom(aspect) / Math.max(qz, 1e-3)) * rows;   // row of line one
  const size = messagePk(width, rows * ch), advance = 0.6 * size, spacing = 1.15 * size / ch, lines = [];
  for (let i = 0; i < MESSAGE_LINES.length; i++) {
    const text = MESSAGE_LINES[i], start = LINE_START[i], typed = (t - start) * TYPE_SPEED;
    if (typed <= 0) break;
    const love = text.indexOf("<3"), ph = pmod(t - start - love / TYPE_SPEED + 0.6, 1.1);
    const beat = Math.exp(-((ph / 0.06) ** 2)) + 0.55 * Math.exp(-(((ph - 0.24) / 0.06) ** 2));
    lines.push({ row: first + i * spacing, x0: (width - advance * text.length) / 2, text, shown: Math.min(text.length, Math.floor(typed)),
      typed, love, beat: love >= 0 && love < typed ? beat : 0 });
  }
  const widest = advance * LONGEST, reach = Math.ceil(0.75 * size / ch);
  const r0 = Math.floor(first) - reach, r1 = Math.floor(first + (MESSAGE_LINES.length - 1) * spacing) + reach + 1;
  const c0 = Math.floor((width - widest) / 2 / cw) - 2, c1 = Math.floor((width + widest) / 2 / cw) + 3;
  for (let r = Math.max(r0, 0); r < Math.min(r1, rows); r++) for (let c = Math.max(c0, 0); c < Math.min(c1, cols); c++) { g.char[r * cols + c] = 0; g.col[r * cols + c] = 0; }
  return { size, advance, lines, clear: [r0, r1, c0, c1] };
}
