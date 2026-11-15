"use strict";
/* The song: it loops, fades in, pauses with the bouquet, and can be muted. Browsers only let
   music start after a tap - which is what "tap to open" is for. */

const soundButton = document.getElementById("sound");
const soundOn = document.getElementById("sound-on"), soundOff = document.getElementById("sound-off");
let music = null;
if (MUSIC_FILE) {
  music = new Audio(MUSIC_FILE);
  music.loop = true; music.preload = "auto";
  music.addEventListener("error", () => { music = null; soundButton.hidden = true; });
}
function fadeIn() {                     // the song fades in over 2 seconds
  if (!music) return;
  const t0 = performance.now();
  const step = () => {
    if (!music) return;
    const k = Math.min((performance.now() - t0) / 2000, 1);
    try { music.volume = MUSIC_VOLUME * k; } catch (e) { /* iPhones keep their own volume */ }
    if (k < 1) requestAnimationFrame(step);
  };
  step();
}
function playMusic(fromStart) {         // play (from the start, fading in) and show the sound button
  if (!music) return;
  if (fromStart) {
    try { music.currentTime = 0; } catch (e) { /* not loaded yet */ }
    try { music.volume = 0; } catch (e) { /* iPhones keep their own volume */ }
  }
  const shown = () => { soundButton.hidden = false; if (fromStart) fadeIn(); };
  const p = music.play();
  if (p && p.then) p.then(shown).catch(() => {}); else shown();
}
function pauseMusic() { if (music) music.pause(); }
function toggleMute() {                 // and show which: a speaker with sound waves, or with a cross
  if (!music) return;
  music.muted = !music.muted;
  soundOn.toggleAttribute("hidden", music.muted);       // (an icon drawing needs the attribute itself -
  soundOff.toggleAttribute("hidden", !music.muted);     //  its .hidden property does nothing)
  soundButton.setAttribute("aria-label", music.muted ? "Unmute the music" : "Mute the music");
}
