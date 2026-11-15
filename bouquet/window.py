"""The window: drawing the characters with pygame, the glow, the note and the
status lines - and the main loop with its keys and the music."""

import sys

import numpy as np
import pygame

from .frame import frame
from .looks import CHARS, PALETTE, N_COLORS
from .music import Music
from .roses import N_ROSES
from .settings import GRID_ROWS, FPS, GLOW, SHOW_STATS, MOBILE

INK = (240, 240, 245)
HEART = (255, 64, 104)
STAT_INK = (150, 150, 160)
TIMER_INK = (255, 120, 160)
BACKGROUND = (0, 0, 0)


def mono_font(size):
    return pygame.font.SysFont("consolas,menlo,dejavusansmono,couriernew,monospace", size)


class View:
    def __init__(self):
        self.font = None
        self.note_fonts = {}

    def fit(self, w, h):
        """Pick the grid font so that about GRID_ROWS rows fill the window - a
        narrow (phone) window gets a finer grid, so the bouquet keeps its detail -
        and draw every glyph up front so no frame has to wait for one."""
        size = int(np.clip(round(min(h, w / 0.82) / GRID_ROWS), 7, 24))
        if self.font is not None and self.font_size == size:
            return
        self.font, self.font_size = mono_font(size), size
        self.cw = self.font.size("M")[0]
        self.ch = self.font.get_height()
        self.small = mono_font(max(11, size))      # the status lines: readable on a phone too
        self.glyphs = {}
        for ci in range(1, len(CHARS)):
            for k in range(1, N_COLORS):
                self.glyph(ci * N_COLORS + k)

    def glyph(self, key):
        g = self.glyphs.get(key)
        if g is None:
            ci, k = divmod(key, N_COLORS)
            g = self.glyphs[key] = self.font.render(CHARS[ci], True, PALETTE[k])
        return g

    def draw(self, screen, t):
        w, h = screen.get_size()
        self.fit(w, h)
        cw, ch = self.cw, self.ch
        rows, cols = max(h // ch, 8), max(w // cw, 8)
        ox, oy = (w - cols * cw) // 2, (h - rows * ch) // 2
        char, col, note, over, stats = frame(t, rows, cols, cw, ch)

        screen.fill(BACKGROUND)
        self.draw_cells(screen, over["sky"], ox, oy)
        rr, cc = np.nonzero(char)
        keys = (char[rr, cc].astype(np.int64) * N_COLORS + col[rr, cc]).tolist()
        xs, ys = (cc * cw + ox).tolist(), (rr * ch + oy).tolist()
        screen.blits([(self.glyph(k), (x, y)) for k, x, y in zip(keys, xs, ys)], False)
        screen.blits([(self.glyph(k), (round(x * cw + ox), round(y * ch + oy)))
                      for x, y, k in over["petals"]], False)
        self.draw_cells(screen, over["sparks"], ox, oy)
        self.draw_cells(screen, over["drawing"], ox, oy)       # the stars drawing the bouquet
        if note:
            self.draw_note(screen, note, ox, oy)
        if GLOW > 0:
            self.glow(screen)
        if SHOW_STATS:
            self.draw_stats(screen, t, stats)

    def draw_cells(self, screen, cells_, ox, oy):
        r, c, key = cells_
        xs, ys = (c * self.cw + ox).tolist(), (r * self.ch + oy).tolist()
        screen.blits([(self.glyph(k), (x, y)) for k, x, y in zip(key.tolist(), xs, ys)], False)

    def glow(self, screen):
        """A soft glow: a blurred, dimmed copy of the picture added on top."""
        w, h = screen.get_size()
        small = pygame.transform.smoothscale(screen, (max(1, w // 5), max(1, h // 5)))
        small.fill((int(255 * GLOW),) * 3, special_flags=pygame.BLEND_MULT)
        screen.blit(pygame.transform.smoothscale(small, (w, h)), (0, 0), special_flags=pygame.BLEND_ADD)

    def draw_note(self, screen, note, ox, oy):
        size, advance = note["size"], note["advance"]
        font = self.note_fonts.get(size)
        if font is None:                            # small letters, spaced out
            font = self.note_fonts[size] = mono_font(max(8, round(size * 0.62)))
        for row, x0, text, shown, typed, love, beat in note["lines"]:
            cy = oy + row * self.ch + self.ch / 2
            for i, letter in enumerate(text[:shown]):
                if letter == " " or (love >= 0 and i == love + 1):
                    continue
                cx = ox + x0 + (i + 0.5) * advance
                if love >= 0 and i == love:             # the <3 beats as one
                    tint = tuple(int(a + (255 - a) * 0.4 * min(beat, 1)) for a in HEART)
                    img = font.render("<3", True, tint)
                    s = 1 + 0.3 * beat
                    img = pygame.transform.smoothscale(img, (round(img.get_width() * s), round(img.get_height() * s)))
                    cx += advance / 2
                else:
                    img = font.render(letter, True, INK)
                img.set_alpha(int(255 * np.clip(typed - i, 0, 1)))
                screen.blit(img, img.get_rect(center=(round(cx), round(cy))))

    def draw_stats(self, screen, t, stats):
        w, h = screen.get_size()
        if stats["growing"] < 1:
            lines = [f"growing  {stats['growing']:.1%}"]
        else:
            lines = [f"roses open  {stats['open']}/{N_ROSES}      petals falling  {stats['falling']}"]
        lines.append(f"letters {stats['letters']:,}")
        lh = self.small.get_height()
        y = h - 6 - len(lines) * (lh + 4)
        for line in lines:
            img = self.small.render(line, True, STAT_INK)
            if img.get_width() > w - 12:            # a narrow window: shrink the line to fit
                img = pygame.transform.smoothscale(img, (w - 12, round(img.get_height() * (w - 12) / img.get_width())))
            screen.blit(img, (6, y))
            y += lh + 4
        img = self.small.render(f"t {t:05.2f}s", True, TIMER_INK)
        x = w - img.get_width() - 6
        screen.blit(img, (x, 4))
        if int(t * 2) % 2 == 0:                     # a blinking dot by the timer
            pygame.draw.circle(screen, TIMER_INK, (x - 8, 4 + lh // 2), max(2, lh // 4))


def run():
    """Open the window and play the animation until it is closed."""
    if sys.platform == "win32":                  # crisp text on scaled displays
        try:
            import ctypes
            ctypes.windll.user32.SetProcessDPIAware()
        except (AttributeError, OSError):
            pass
    pygame.init()
    info = pygame.display.Info()
    h = min(1500, int(info.current_h * 0.86)) if info.current_h > 0 else 900
    phone = MOBILE or "--mobile" in sys.argv               # a tall 9:16 window, like a phone
    pygame.display.set_mode((int(h * (9 / 16 if phone else 0.82)), h), pygame.RESIZABLE)
    pygame.display.set_caption("rose bouquet")
    view = View()
    music = Music()
    music.play()                                 # the song loops for as long as the window is open
    clock = pygame.time.Clock()
    t, paused, shots = 0.0, False, 0
    while True:
        dt = clock.tick(FPS) / 1000
        for e in pygame.event.get():
            if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key in (pygame.K_ESCAPE, pygame.K_q)):
                pygame.quit()
                return
            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_SPACE:              # pause the bouquet and the music
                    paused = not paused
                    music.pause(paused)
                elif e.key == pygame.K_r:                # replay: the song starts again too
                    t = 0.0
                    music.play()
                    music.pause(paused)
                elif e.key == pygame.K_m:                # mute / unmute
                    music.toggle_mute()
                elif e.key == pygame.K_s:
                    shots += 1
                    pygame.image.save(pygame.display.get_surface(), f"rose_bouquet_{shots}.png")
        if not paused:
            t += min(dt, 0.1)
        view.draw(pygame.display.get_surface(), t)
        pygame.display.flip()
