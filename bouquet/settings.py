"""What you'd want to change: the note, the window, when each stage happens and
where the bouquet sits."""

import numpy as np

# ----------------------------------------------------------- the note & window
MESSAGE_LINES = ("Happy Birthday", "Hoàng Thảo My", "<3")   # the note, line by line
LINE_DELAY = 1.0         # pause (seconds) after a line has typed out, before the next one starts
MESSAGE_PK = 26          # size of the note in a 965 px tall window (it scales with the window)
GRID_ROWS = 90           # rows of characters to fit in the window - more = finer
MOBILE = False           # True (or run "python main.py --mobile"): open a tall, phone-shaped
                         # 9:16 window. Any window shape works - narrow ones zoom out to fit.
FPS = 60
GLOW = 0.55              # strength of the soft glow around the characters (0 = none)
SHOW_STATS = True        # the status lines at the bottom and the timer at the top

# ------------------------------------------------------------------- the music
MUSIC_FILE = ""          # "" = play the first song found in the music/ folder (mp3, ogg, wav
                         # or flac); or the path of a song, e.g. "music/my song.mp3"
MUSIC_VOLUME = 0.6       # 0 (silent) .. 1 (full)

# ------------------------------------------------- when each stage happens (s)
T_GROW = (0.0, 1.8)      # the stems grow from the bottom up, sparkling stars leading them
T_TOP = (1.8, 2.8)       # at the top the stars spread out and draw the top: foliage and buds
T_PAPER = (2.8, 3.9)     # the wrap blows out like a skirt ...
T_BOW = (2.8, 3.6)       # ... and the bow pops up with it
T_BLOOM = 4.0            # the rose on top opens, then the ring round it, then the outer ring ...
TIER_GAP = 1.6           # ... each ring that much later
OPEN = 3.0               # seconds it takes one rose to open
T_SPIN = 11.4            # then the bouquet swings gently left and right
SPIN, SPIN_PERIOD = 0.22, 13.0
T_MSG = 11.8             # the note starts typing
T_FALL = 12.4            # petals start drifting down
FADE_IN = 0.35           # seconds each new bit takes to fade in

# ---------------------------------------------------- where the bouquet sits
WAIST = np.array([0.0, -0.78, 0.0])      # where the ribbon ties the stems
BOTTOM_Y = -1.22                         # cut ends of the stems
DOME = np.array([0.0, -0.5, 0.0])        # centre of the foliage dome
TOP_Y = 0.3                              # top of the roses
