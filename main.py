"""
Rose bouquet - an animated 3D bouquet drawn entirely with ASCII characters.

Sparkling stars draw the bouquet from the bottom up: they lead the stems as
they grow, and at the top they spread out and draw the foliage and the closed
buds. The wrap blows out like a skirt with the bow popping up, and the roses
open - the one on top, then the ring around it, then the outer ring - each
with a burst of gold sparks. Afterwards the bouquet swings gently, petals
drift down, stars twinkle and a note types itself out underneath.

The code lives in the bouquet/ folder, one file per part - see
bouquet/__init__.py for the list. The note, the timings, the music and the
other things you might want to change are in bouquet/settings.py.

Music: put a song (mp3, ogg, wav or flac) in the music/ folder - it plays on
a loop.

Needs numpy and pygame:   pip install numpy pygame-ce
Run:  python main.py            (or: python main.py --mobile  for a phone-shaped window)
Keys: Space pause | R replay | M mute | S screenshot | Esc quit
"""

import sys

from bouquet.window import run

if __name__ == "__main__":
    sys.exit(run())
