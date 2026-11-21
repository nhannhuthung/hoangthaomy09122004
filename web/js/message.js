"use strict";
/* The note under the bouquet: its lines type themselves out one after another, and the <3 beats.
   A short note gets big, spaced-out letters; a long one smaller, closer letters, wrapped onto as many rows
   as it needs - as big as still fits between the bouquet and the bottom of the window. */

const TYPE_SPEED = Math.max(TYPE_SPEED_MIN, MESSAGE_LINES.join("").length / TYPE_TIME_MAX);   // letters per second
const LINE_START = [];                  // when each line starts typing (a line wrapped onto more rows types straight on)
{ let tt = T_MSG; for (const line of MESSAGE_LINES) { LINE_START.push(tt); tt += line.length / TYPE_SPEED + LINE_DELAY; } }
const FX_DONE = MESSAGE_MARKS.reduce(   // when the [marked] words have typed out (their effect starts flying round them)
  (done, marks, i) => Math.max(done, ...marks.map(([, to]) => LINE_START[i] + to / TYPE_SPEED)), -Infinity);
const NOTE_LOOKS = [                    // letter and row spacing, per unit of size (the letters are 0.62 of it)
  { advance: 0.6, spacing: 1.15, most: 3 },           // short: spaced out, like the birthday note - at most 3 rows
  { advance: 0.42, spacing: 0.92, most: Infinity },   // long: closer together, any number of rows
];
const MIN_LETTER = 8;                   // px: the smallest the note's letters get

function wrapRows(text, n) {            // a line cut into rows of at most n letters, at spaces: [[from, to], ...]
  const out = [];
  let a = 0;
  while (text.length - a > n) {
    let b = text.lastIndexOf(" ", a + n);
    if (b <= a) b = a + n;              // a word longer than a row: cut it
    out.push([a, b]);
    a = b;
    while (text[a] === " ") a++;
  }
  out.push([a, text.length]);
  return out;
}
function markedRow(i, a, b) {           // which letters of line i, from a to b, are [marked]: null if none
  let out = null;
  for (const [from, to] of MESSAGE_MARKS[i] || []) {
    for (let j = Math.max(from, a); j < Math.min(to, b); j++) (out || (out = new Uint8Array(b - a)))[j - a] = 1;
  }
  return out;
}
let fittedNote = null;
function fitNote(width, room, base) {   // the biggest note that fits in width x room (px): its size, spacing and rows
  const key = `${width} ${room} ${base}`;
  if (fittedNote && fittedNote.key === key) return fittedNote;
  for (let size = base; ; size *= 0.95) {
    const smallest = 0.62 * size * 0.95 < MIN_LETTER;
    for (const look of NOTE_LOOKS) {
      const n = Math.max(1, Math.floor(0.9 * width / (look.advance * size))), rows = [];
      MESSAGE_LINES.forEach((line, i) => { for (const [a, b] of wrapRows(line, n)) rows.push({ i, a, b, marked: markedRow(i, a, b) }); });
      const tall = (rows.length - 1) * look.spacing * size + 0.37 * size;   // middle of the first row to foot of the last
      if ((rows.length <= look.most && tall <= room) || (smallest && look === NOTE_LOOKS[NOTE_LOOKS.length - 1])) {
        const longest = Math.max(...rows.map((r) => r.b - r.a));
        return (fittedNote = { key, size, advance: look.advance * size, spacing: look.spacing * size, rows, longest });
      }
    }
  }
}
function message(g, t, cw, ch, aspect) { // clear room under the bouquet; return how to draw the rows typed so far
  if (t < T_MSG) return null;
  const { rows, cols } = g, width = cols * cw, M = SKY_VIEW, y = BOTTOM_Y - 0.28;
  const qy = M[4] * y - CAM_OFF[1], qz = M[7] * y - CAM_OFF[2];
  const first = MIDDLE * rows - qy * (FOCAL * 0.5 * zoom(aspect) / Math.max(qz, 1e-3)) * rows;   // row of line one
  const stats = SHOW_STATS ? 2 * (view.stat + 4) + 8 : 0;                 // keep clear of the status lines
  const room = view.H - view.padB - stats - 10 - (view.oy + (first + 0.5) * ch);
  const note = fitNote(width, Math.round(room), MESSAGE_PK * Math.min(width / 560, rows * ch / 965));
  const { size, advance } = note, spacing = note.spacing / ch, lines = [];
  for (let k = 0; k < note.rows.length; k++) {
    const { i, a, b, marked } = note.rows[k], text = MESSAGE_LINES[i].slice(a, b);
    const start = LINE_START[i] + a / TYPE_SPEED, typed = (t - start) * TYPE_SPEED;
    if (typed <= 0) break;
    const love = text.indexOf("<3"), ph = pmod(t - start - love / TYPE_SPEED + 0.6, 1.1);
    const beat = Math.exp(-((ph / 0.06) ** 2)) + 0.55 * Math.exp(-(((ph - 0.24) / 0.06) ** 2));
    lines.push({ row: first + k * spacing, x0: (width - advance * text.length) / 2, text, shown: Math.min(text.length, Math.floor(typed)),
      typed, love, beat: love >= 0 && love < typed ? beat : 0, a, marked });
  }
  const widest = advance * note.longest, reach = Math.ceil(0.75 * size / ch);
  const r0 = Math.floor(first) - reach, r1 = Math.floor(first + (note.rows.length - 1) * spacing) + reach + 1;
  const c0 = Math.floor((width - widest) / 2 / cw) - 2, c1 = Math.floor((width + widest) / 2 / cw) + 3;
  for (let r = Math.max(r0, 0); r < Math.min(r1, rows); r++) for (let c = Math.max(c0, 0); c < Math.min(c1, cols); c++) { g.char[r * cols + c] = 0; g.col[r * cols + c] = 0; }
  return { size, advance, lines, clear: [r0, r1, c0, c1], t, fx: MESSAGE_FX, fxDone: FX_DONE };
}
