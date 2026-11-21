"use strict";
/* Drawing on the page: fitting the grid to the window, the characters, the note, the glow and the status lines. */

const MONO = getComputedStyle(document.documentElement).getPropertyValue("--mono").trim() || "monospace";
const INK = "rgb(240,240,245)", HEART = [255, 64, 104], STAT_INK = "rgb(150,150,160)", TIMER_INK = "rgb(255,120,160)";
const canvas = document.getElementById("stage"), ctx = canvas.getContext("2d", { alpha: false });
const view = { W: 0, H: 0, dpr: 1, font: 0, cw: 0, ch: 0, rows: 0, cols: 0, ox: 0, oy: 0, stat: 11, padL: 16, padR: 16, padT: 0, padB: 0 };
function layout() {                     // fit the grid to the window: about GRID_ROWS rows; a phone gets a finer grid
  const rect = canvas.getBoundingClientRect();
  view.W = Math.max(rect.width, 50); view.H = Math.max(rect.height, 50); view.dpr = Math.min(window.devicePixelRatio || 1, 3);
  const body = getComputedStyle(document.body), root = getComputedStyle(document.documentElement);
  view.padL = parseFloat(body.paddingLeft) || 16; view.padR = parseFloat(body.paddingRight) || 16;   // the page's margins
  view.padT = parseFloat(root.paddingTop) || 0; view.padB = parseFloat(root.paddingBottom) || 0;    // (and a phone's notch)
  canvas.width = Math.round(view.W * view.dpr); canvas.height = Math.round(view.H * view.dpr);
  view.font = clamp(Math.round(Math.min(view.H, view.W / 0.82) / GRID_ROWS), 6, 24);
  ctx.font = `${view.font}px ${MONO}`;
  view.cw = ctx.measureText("M").width || view.font * 0.6; view.ch = view.font;
  view.rows = Math.max(Math.floor(view.H / view.ch), 8); view.cols = Math.max(Math.floor(view.W / view.cw), 8);
  view.ox = (view.W - view.cols * view.cw) / 2; view.oy = (view.H - view.rows * view.ch) / 2;
  view.stat = Math.max(11, view.font);
}
function drawCells(list) {              // [row, col, char, colour] cells
  const { cw, ch, ox, oy } = view;
  for (const [r, c, chr, col] of list) { ctx.fillStyle = PALETTE[col]; ctx.fillText(chr, ox + c * cw, oy + r * ch); }
}
const BUCKETS = Array.from({ length: N_COLORS }, () => []);
function drawBouquet(g) {               // one colour at a time
  const { cw, ch, ox, oy, rows, cols } = view, { char, col } = g, n = rows * cols;
  for (let i = 0; i < n; i++) if (char[i]) BUCKETS[col[i]].push(i);
  for (let k = 1; k < N_COLORS; k++) {
    const b = BUCKETS[k];
    if (!b.length) continue;
    ctx.fillStyle = PALETTE[k];
    for (const i of b) { const r = (i / cols) | 0; ctx.fillText(CHAR_STR[char[i]], ox + (i - r * cols) * cw, oy + r * ch); }
    b.length = 0;
  }
}
function draw(t, idle) {
  const { dpr, cw, ch, ox, oy, rows, cols } = view;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, view.W, view.H);
  ctx.font = `${view.font}px ${MONO}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
  let f = null;
  if (idle) {                           // before it opens: only the stars
    drawCells(sprites(t, grids(rows, cols), (cols * cw) / (rows * ch), SKY_VIEW, false).sky);
  } else {
    f = frame(t, rows, cols, cw, ch);
    const o = f.over;
    drawCells(o.sky);
    drawBouquet(f.g);
    for (const [x, y, chr, col2] of o.loose) { ctx.fillStyle = PALETTE[col2]; ctx.fillText(chr, Math.round(x * cw + ox), Math.round(y * ch + oy)); }
    drawCells(o.sparks);
    drawCells(o.drawing);
    if (f.note) drawNote(f.note);
  }
  glow();
  if (!idle && SHOW_STATS) drawStats(t, f.stats);
}
function drawNote(note) {               // small letters, spaced out; the <3 beats as one; [marked] words get the day's effect
  const { cw, ch, ox, oy } = view, px = Math.max(8, Math.round(note.size * 0.62));
  const box = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };   // round the [marked] letters shown so far
  ctx.font = `${px}px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const ln of note.lines) {
    const cy = oy + ln.row * ch + ch / 2;
    for (let i = 0; i < ln.shown; i++) {
      const letter = ln.text[i];
      if (letter === " " || (ln.love >= 0 && i === ln.love + 1)) continue;
      ctx.globalAlpha = clamp(ln.typed - i, 0, 1);
      const cx = ox + ln.x0 + (i + 0.5) * note.advance;
      if (ln.love >= 0 && i === ln.love) {
        const w = 0.4 * Math.min(ln.beat, 1), s = 1 + 0.3 * ln.beat, c = HEART.map((a) => Math.round(a + (255 - a) * w));
        ctx.save(); ctx.translate(cx + note.advance / 2, cy); ctx.scale(s, s);
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; ctx.fillText("<3", 0, 0); ctx.restore();
      } else if (ln.marked && ln.marked[i]) {
        fxLetter(note.fx, letter, cx, cy, ln.a + i, note.t, px);
        box.x0 = Math.min(box.x0, cx); box.x1 = Math.max(box.x1, cx); box.y0 = Math.min(box.y0, cy); box.y1 = Math.max(box.y1, cy);
      } else { ctx.fillStyle = INK; ctx.fillText(letter, cx, cy); }
    }
  }
  ctx.globalAlpha = 1;
  if (box.x0 <= box.x1) fxAround(note.fx, box, note.t - note.fxDone, px, note.advance);
  ctx.globalAlpha = 1; ctx.textAlign = "left"; ctx.textBaseline = "top";
}
const GLOW_BUF = [];
function glowBuffer(i, w, h) {
  let b = GLOW_BUF[i];
  if (!b) { const c = document.createElement("canvas"); b = GLOW_BUF[i] = { c, x: c.getContext("2d") }; }
  if (b.c.width !== w || b.c.height !== h) { b.c.width = w; b.c.height = h; }
  b.x.imageSmoothingEnabled = true; b.x.imageSmoothingQuality = "high";
  return b;
}
function glow() {                       // a soft glow: a blurred, dimmed copy of the picture added on top
  if (GLOW <= 0) return;
  const tw = Math.max(1, Math.round(view.W / 5)), th = Math.max(1, Math.round(view.H / 5));
  let src = canvas, sw = canvas.width, sh = canvas.height, i = 0;
  while (sw / 2 >= tw * 1.4 && sh / 2 >= th * 1.4) {      // halve step by step, so it averages smoothly
    const b = glowBuffer(i++, Math.ceil(sw / 2), Math.ceil(sh / 2));
    b.x.drawImage(src, 0, 0, b.c.width, b.c.height);
    src = b.c; sw = b.c.width; sh = b.c.height;
  }
  const last = glowBuffer(i, tw, th);
  last.x.drawImage(src, 0, 0, tw, th);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = GLOW; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(last.c, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
}
function drawStats(t, s) {              // the status lines at the bottom and the timer at the top, clear of the edges
  const { W, H, padL, padR, padT, padB } = view, px = view.stat, lh = px, room = W - padL - padR;
  ctx.font = `${px}px ${MONO}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
  const lines = s.growing < 1 ? [`growing  ${(s.growing * 100).toFixed(1)}%`]
    : [`roses open  ${s.open}/${N_ROSES}      petals falling  ${s.falling}`];
  lines.push(`letters ${s.letters.toLocaleString("en-US")}`);
  let y = H - padB - 8 - lines.length * (lh + 4);
  ctx.fillStyle = STAT_INK;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > room) { const k = room / w; ctx.save(); ctx.translate(padL, y); ctx.scale(k, k); ctx.fillText(line, 0, 0); ctx.restore(); }
    else ctx.fillText(line, padL, y);
    y += lh + 4;
  }
  const timer = `t ${t.toFixed(2).padStart(5, "0")}s`, x = W - padR - ctx.measureText(timer).width, top = padT + 8;
  ctx.fillStyle = TIMER_INK; ctx.fillText(timer, x, top);
  if (Math.floor(t * 2) % 2 === 0) { ctx.beginPath(); ctx.arc(x - 8, top + lh / 2, Math.max(2, lh / 4), 0, TAU); ctx.fill(); }
}
