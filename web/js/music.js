"use strict";
/* The song: it loops, fades in, pauses with the bouquet, and can be muted. Browsers only let
   music start after a tap - which is what "tap to open" is for. Some days have their own song (DAY_MUSIC). */

const soundButton = document.getElementById("sound");
const soundOn = document.getElementById("sound-on"), soundOff = document.getElementById("sound-off");
let music = null;
function loadSong(file, fallback) {     // the song; if it can't be found, the fallback instead (if any)
  const song = new Audio(file);
  song.loop = true; song.preload = "auto";
  song.addEventListener("error", () => {
    if (music !== song) return;         // (the music was switched off meanwhile)
    music = null; soundButton.hidden = true;
    if (!fallback) return;
    loadSong(fallback, "");
    music.muted = song.muted;
    if (state.started && !state.paused) playMusic(true);
  });
  music = song;
}
{ const day = DAY_MUSIC[TODAY_KEY]; if (day || MUSIC_FILE) loadSong(day || MUSIC_FILE, day ? MUSIC_FILE : ""); }
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
