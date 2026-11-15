"""Background music: a song playing on a loop while the bouquet blooms.

Put a song (mp3, ogg, wav or flac) in the music/ folder next to main.py - the
first one found is played - or set MUSIC_FILE in settings.py. Without a song
(or without a sound device) the bouquet simply plays in silence.
"""

from pathlib import Path

import pygame

from .settings import MUSIC_FILE, MUSIC_VOLUME

PROJECT_DIR = Path(__file__).resolve().parent.parent
MUSIC_DIR = PROJECT_DIR / "music"
SONG_TYPES = (".mp3", ".ogg", ".wav", ".flac")
FADE_MS = 2000           # the song fades in over this long (milliseconds)


def find_song():
    """The song to play: MUSIC_FILE if it is set, else the first song in music/."""
    if MUSIC_FILE:
        path = Path(MUSIC_FILE)
        path = path if path.is_absolute() else PROJECT_DIR / path
        return path if path.is_file() else None
    if MUSIC_DIR.is_dir():
        songs = sorted(p for p in MUSIC_DIR.iterdir() if p.suffix.lower() in SONG_TYPES)
        if songs:
            return songs[0]
    return None


class Music:
    """Plays the song on a loop, and can pause, restart and mute it."""

    def __init__(self):
        self.ok = False
        self.muted = False
        song = find_song()
        if song is None:
            where = MUSIC_FILE or MUSIC_DIR
            print(f"No music yet - put a song (mp3, ogg, wav or flac) in: {where}")
            return
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init()
            pygame.mixer.music.load(str(song))
        except pygame.error as err:
            print(f"Can't play {song.name}: {err}")
            return
        pygame.mixer.music.set_volume(MUSIC_VOLUME)
        self.ok = True
        print(f"Music: {song.name}")

    def play(self):
        """Start the song from the beginning, fading in, and loop it forever."""
        if self.ok:
            pygame.mixer.music.play(loops=-1, fade_ms=FADE_MS)

    def pause(self, paused):
        if self.ok:
            if paused:
                pygame.mixer.music.pause()
            else:
                pygame.mixer.music.unpause()

    def toggle_mute(self):
        if self.ok:
            self.muted = not self.muted
            pygame.mixer.music.set_volume(0.0 if self.muted else MUSIC_VOLUME)
