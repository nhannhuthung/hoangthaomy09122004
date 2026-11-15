"use strict";
/* Starting it, the controls, and the animation loop.
   "tap to open" starts the bouquet and the music; after that a tap pauses and resumes.
   On a keyboard: Space pause, R replay, M mute.
   To look at one moment, add "?t=12.5" to the page's address (it shows that moment, paused). */

const openButton = document.getElementById("open");
const state = { started: false, paused: false, t: 0, sky: 0, last: 0 };

function setPaused(p) {
  state.paused = p;
  if (p) pauseMusic(); else playMusic(false);
}
function open() {                       // tap to open: the bouquet starts growing and the music starts
  if (state.started) return;
  state.started = true; state.t = 0; openButton.hidden = true;
  playMusic(true);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* not allowed */ }
}
function replay() { state.t = 0; playMusic(true); }

openButton.addEventListener("click", open);
canvas.addEventListener("click", () => { if (state.started) setPaused(!state.paused); else open(); });
soundButton.addEventListener("click", (e) => { e.stopPropagation(); toggleMute(); });
window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); if (state.started) setPaused(!state.paused); else open(); }
  else if (e.key === "r" || e.key === "R") { if (state.started) replay(); }
  else if (e.key === "m" || e.key === "M") toggleMute();
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
  else { if (!state.paused) state.t += dt; draw(state.t, false); }
  requestAnimationFrame(tick);
}
async function boot() {
  try { await Promise.race([document.fonts.load(`16px ${MONO}`), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* fall back */ }
  layout();
  if (document.fonts) document.fonts.addEventListener("loadingdone", layout);
  const q = new URLSearchParams(location.search);
  if (q.has("t")) { state.started = true; state.paused = true; state.t = parseFloat(q.get("t")) || 0; openButton.hidden = true; music = null; }
  requestAnimationFrame(tick);
}
boot();
