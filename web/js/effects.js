"use strict";
/* The effects on a note's [marked] words - which day gets which: NOTE_EFFECTS in settings.js.
   party      her birthday: letters hop in changing colours, a popper bursts, then confetti keeps falling
   christmas  red and green letters twinkling like fairy lights, and snow drifting down
   newyear    letters all one colour, slowly turning from red to yellow and back, and red and gold fireworks either side
   pink       the Women's Days: pink letters glowing softly, and little hearts floating up
   It all follows the clock, so a paused or replayed note looks the same; with "reduce motion" switched on
   (as the rest of the bouquet does) it all goes calmer: half as fast. */

const FX_PACE = REDUCED_MOTION ? 0.5 : 1;
const fxClock = (t) => t * FX_PACE;
const fxRand = (j, salt) => mix32((Math.imul(j + 1, 0x9e3779b1) ^ Math.imul(salt, 0x85ebca6b)) >>> 0) / 4294967296;   // 0..1, fixed per (j, salt)
const mixRgb = (a, b, w) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * w)},${Math.round(a[1] + (b[1] - a[1]) * w)},${Math.round(a[2] + (b[2] - a[2]) * w)})`;
const FIREWORK = ["rgb(255,55,45)", "rgb(255,215,60)", "rgb(255,150,40)", "rgb(255,240,150)", "rgb(235,30,70)"];   // reds and golds

function fxLetter(fx, letter, x, y, k, t, px) {   // one [marked] letter at x, y; k: its place in its line
  const T = fxClock(t);
  if (fx === "party") {                 // every letter its own colour, the colours going round, hopping
    ctx.fillStyle = `hsl(${(k * 47 + T * 90) % 360},95%,68%)`;
    y -= Math.abs(Math.sin(T * 5 - k * 0.55)) * 0.22 * px;
  } else if (fx === "christmas") {      // red and green fairy lights, each twinkling in its own time
    const tw = 0.6 * (0.5 + 0.5 * Math.sin(T * 3 + k * 1.9));
    ctx.fillStyle = k % 2 ? mixRgb([40, 190, 90], [190, 255, 200], tw) : mixRgb([235, 50, 60], [255, 190, 190], tw);
  } else if (fx === "newyear") {        // all one colour: red for a while, slowly turning yellow, a while, slowly back
    const tri = 1 - Math.abs(2 * pmod(T / 8, 1) - 1);   // 0 .. 1 .. 0 every 8 s
    ctx.fillStyle = mixRgb([235, 40, 40], [255, 210, 40], smooth((tri - 0.25) / 0.5));
  } else {                              // pink, glowing softly and swaying a little
    ctx.fillStyle = mixRgb([255, 105, 170], [255, 205, 228], 0.5 * (0.5 + 0.5 * Math.sin(T * 2.2 - k * 0.35)));
    y += Math.sin(T * 1.6 + k * 0.5) * 0.06 * px;
  }
  ctx.fillText(letter, x, y);
}

function fxAround(fx, box, age, px, adv) { // what flies round the [marked] words (box: their letters' middles); age: s since they typed out
  if (age < 0) return;
  age *= FX_PACE;
  const row = 1.5 * px, x0 = box.x0 - 2 * adv, w = box.x1 - box.x0 + 4 * adv;
  const top = box.y0 - 2.2 * row, bottom = box.y1 + 1.2 * row;
  ctx.font = `${Math.max(7, Math.round(px * 0.8))}px ${MONO}`;
  const put = (chr, x, y, fill, alpha) => { ctx.globalAlpha = clamp(alpha, 0, 1); ctx.fillStyle = fill; ctx.fillText(chr, x, y); };
  const drift = (n, period, spread, salt, each) => {   // n bits, each going round every period..period+spread s, joining in one by one
    for (let j = 0; j < n; j++) {
      const P = period + spread * fxRand(j, salt), local = age - fxRand(j, salt + 1) * P;
      if (local >= 0) each(j, (local % P) / P, local);
    }
  };
  if (fx === "party") {
    if (age < 1.6) {                    // the popper: bits shooting out from the middle of the words, then dropping
      const p = age / 1.6, ease = 1 - (1 - p) ** 3, mx = (box.x0 + box.x1) / 2, my = (box.y0 + box.y1) / 2;
      for (let j = 0; j < 20; j++) {
        const a = TAU * fxRand(j, 11), r = ease * (1 + 1.5 * fxRand(j, 12)) * 2 * row;
        put("*+o~x"[j % 5], mx + Math.cos(a) * r * 1.6, my + Math.sin(a) * r + p * p * row, `hsl(${360 * fxRand(j, 13)},95%,65%)`, 1 - p);
      }
    }
    drift(26, 2.8, 2, 20, (j, p, local) => put("*+~=o"[j % 5], x0 + fxRand(j, 22) * w + Math.sin(local * 2 + j) * 0.6 * adv,
      top + p * (bottom - top), `hsl(${360 * fxRand(j, 23)},90%,65%)`, 0.9 * Math.sin(Math.PI * p)));
  } else if (fx === "christmas") {      // snow
    drift(36, 4, 3, 30, (j, p, local) => put(j % 2 ? "." : "*", x0 + fxRand(j, 32) * w + Math.sin(local * 1.3 + j) * 0.8 * adv,
      top + p * (bottom - top), "rgb(235,245,255)", 0.95 * Math.sin(Math.PI * p)));
  } else if (fx === "newyear") {        // fireworks either side of the words: two streams taking turns, each burst somewhere new
    for (let s = 0; s < 2; s++) {
      const local = age - 0.7 * s;
      if (local < 0) continue;
      const b = Math.floor(local / 1.4) * 2 + s, p = (local % 1.4) / 1.4, ease = 1 - (1 - p) ** 3;
      const R = (0.9 + 0.6 * fxRand(b, 42)) * 1.3 * row, reach = 1.3 * R + (1 + 3 * fxRand(b, 40)) * adv;
      const cx = clamp(b % 2 ? box.x1 + reach : box.x0 - reach, R, view.W - R);
      const cy = (box.y0 + box.y1) / 2 - (0.2 + 0.8 * fxRand(b, 41)) * row;
      for (let j = 0; j < 12; j++) {
        const a = TAU * (j / 12 + fxRand(b, 43));
        put(p < 0.6 ? "*" : ".", cx + Math.cos(a) * ease * R * 1.3, cy + Math.sin(a) * ease * R + p * p * 0.6 * row,
          FIREWORK[b % FIREWORK.length], (1 - p) ** 1.5);
      }
    }
  } else {                              // little hearts floating up
    drift(10, 3.5, 2, 50, (j, p, local) => put("<3", x0 + fxRand(j, 52) * w + Math.sin(local * 1.5 + j) * 0.5 * adv,
      bottom - p * (bottom - top), `rgb(255,${Math.round(110 + 70 * fxRand(j, 53))},180)`, 0.85 * Math.sin(Math.PI * p)));
  }
  ctx.globalAlpha = 1;
}
