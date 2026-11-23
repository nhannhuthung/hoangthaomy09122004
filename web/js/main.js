"use strict";
/* Starting it, the controls, and the animation loop.
   "tap to open" starts the bouquet and the music; after that a tap pauses and resumes, and a sideways drag
   (or swipe) turns the bouquet round - let go mid-swipe and it spins on, slows down and comes back to face you.
   On a keyboard: Space pause, R replay, M mute, the left and right arrows spin it.
   To look at one moment, add "?t=12.5" to the page's address (it shows that moment, paused).
   To see another day's note, add "?date=2026-12-25" (both together: "?date=2026-12-25&t=40"). */

const openButton = document.getElementById("open");
const state = { started: false, paused: false, t: 0, sky: 0, last: 0 };

function setPaused(p) {
  state.paused = p;
  if (p) pauseMusic(); else playMusic(false);
}
function open() {                       // tap to open: the bouquet starts growing and the music starts
  if (state.started) return;
  state.started = true; state.t = 0; openButton.hidden = true; canvas.style.cursor = "grab";
  playMusic(true);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* not allowed */ }
}
function replay() { state.t = 0; playMusic(true); }

/* Turning the bouquet by hand: a drag across the whole window turns it once round. Letting go while still moving
   leaves it spinning; it slows down, and once slow it eases round to face you again (the nearest way). */
const TURN_PER_WIDTH = TAU;
const drag = { id: null, x0: 0, x: 0, t: 0, moved: false, skipClick: false };
canvas.addEventListener("pointerdown", (e) => {
  drag.skipClick = false;
  if (!state.started || drag.id !== null) return;
  drag.id = e.pointerId; drag.x0 = drag.x = e.clientX; drag.t = e.timeStamp; drag.moved = false;
});
canvas.addEventListener("pointermove", (e) => {
  if (e.pointerId !== drag.id) return;
  if (!drag.moved) {
    if (Math.abs(e.clientX - drag.x0) < 8) return;             // not a drag yet - it may still be a tap
    drag.moved = true; drag.x = e.clientX; drag.t = e.timeStamp;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* (the pointer is already gone) */ }
    canvas.style.cursor = "grabbing";
    userTurn.held = true; userTurn.settling = false; userTurn.speed = 0; userTurn.used = true;
    return;
  }
  const turn = (e.clientX - drag.x) / view.W * TURN_PER_WIDTH, dt = Math.max((e.timeStamp - drag.t) / 1000, 0.004);
  userTurn.angle += turn;
  userTurn.speed = 0.6 * userTurn.speed + 0.4 * (turn / dt);  // (smoothed: how fast it goes on when let go)
  drag.x = e.clientX; drag.t = e.timeStamp;
});
function endDrag(e) {
  if (e.pointerId !== drag.id) return;
  if (drag.moved) {
    drag.skipClick = true;                                     // (the click that follows a drag isn't a tap)
    if (e.timeStamp - drag.t > 90) userTurn.speed = 0;         // held still before letting go: no spin
    userTurn.held = false; canvas.style.cursor = "grab";
  }
  drag.id = null;
}
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
function spinBy(speed) { if (state.started) { userTurn.speed += speed; userTurn.settling = false; userTurn.used = true; } }
function stepTurn(dt) {                 // let go: spin on and slow down; once slow, ease round to face her
  if (userTurn.held) return;
  const home = Math.round(userTurn.angle / TAU) * TAU, off = userTurn.angle - home;
  if (!userTurn.settling && Math.abs(userTurn.speed) < 2.5) userTurn.settling = true;
  if (userTurn.settling) userTurn.speed += (-9 * off - 6 * userTurn.speed) * dt;   // a soft spring, no overshoot
  else userTurn.speed *= Math.exp(-1.5 * dt);                  // spinning freely, slowing down
  userTurn.angle += userTurn.speed * dt;
  if (userTurn.settling && Math.abs(off) < 2e-3 && Math.abs(userTurn.speed) < 1e-2) { userTurn.angle = 0; userTurn.speed = 0; }
}

openButton.addEventListener("click", open);
canvas.addEventListener("click", () => {
  if (drag.skipClick) { drag.skipClick = false; return; }
  if (state.started) setPaused(!state.paused); else open();
});
soundButton.addEventListener("click", (e) => { e.stopPropagation(); toggleMute(); });
window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); if (state.started) setPaused(!state.paused); else open(); }
  else if (e.key === "r" || e.key === "R") { if (state.started) replay(); }
  else if (e.key === "m" || e.key === "M") toggleMute();
  else if (e.key === "ArrowLeft") { e.preventDefault(); spinBy(-5); }
  else if (e.key === "ArrowRight") { e.preventDefault(); spinBy(5); }
});
document.addEventListener("visibilitychange", () => {   // no music while the page is out of sight
  if (!music || !state.started || state.paused) return;
  if (document.hidden) pauseMusic(); else playMusic(false);
});
window.addEventListener("resize", layout);

function tick(now) {
  const dt = Math.min((now - (state.last || now)) / 1000, 0.1);
  state.last = now;
  if (!state.started) { state.sky += dt; draw(state.sky, true); }
  else { if (!state.paused) state.t += dt; stepTurn(dt); draw(state.t, false); }
  requestAnimationFrame(tick);
}
async function boot() {
  try { await Promise.race([document.fonts.load(`16px ${MONO}`), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* fall back */ }
  layout();
  if (document.fonts) document.fonts.addEventListener("loadingdone", layout);
  const q = new URLSearchParams(location.search);
  if (q.has("t")) { state.started = true; state.paused = true; state.t = parseFloat(q.get("t")) || 0; openButton.hidden = true; music = null; canvas.style.cursor = "grab"; }
  requestAnimationFrame(tick);
}
boot();
