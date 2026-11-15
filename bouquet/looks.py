"""How things look: the colour of every material, and the characters everything
is drawn with."""

import numpy as np

MATERIALS = {
    # name:        (colour stops dark / mid / light,               shine, back face)
    "paper":      (((24, 24, 30), (66, 66, 76), (124, 124, 134)), 0.0, "paper_in"),   # inside: darker
    "paper_in":   (((16, 16, 22), (44, 44, 52), (86, 86, 96)), 0.0, None),
    "rim":        (((60, 60, 70), (170, 170, 180), (236, 236, 242)), 0.3, None),
    "ribbon":     (((120, 80, 0), (240, 188, 40), (255, 244, 160)), 0.6, None),
    "stem":       (((10, 70, 30), (40, 190, 80), (150, 255, 170)), 0.0, None),
    "foliage":    (((8, 60, 26), (30, 160, 70), (130, 240, 140)), 0.0, None),
    "leaf":       (((10, 70, 30), (40, 190, 80), (150, 255, 160)), 0.3, None),
    "blossom":    (((140, 140, 150), (236, 236, 246), (255, 255, 255)), 0.0, None),
    "sepal":      (((10, 70, 30), (40, 180, 80), (150, 250, 160)), 0.0, None),
    "rose_lavender": (((70, 38, 134), (148, 102, 236), (202, 164, 255)), 0.25, None),  # four purples,
    "rose":       (((60, 10, 84), (172, 64, 224), (242, 184, 255)), 0.25, None),     # mixed among
    "rose_deep":  (((34, 4, 60), (112, 36, 172), (200, 140, 246)), 0.25, None),      # the roses
    "rose_plum":  (((66, 8, 70), (176, 52, 188), (248, 182, 248)), 0.25, None),
    "star":       (((110, 100, 120), (222, 212, 232), (255, 255, 255)), 0.0, None),
    "gold":       (((150, 100, 10), (255, 210, 80), (255, 250, 200)), 0.0, None),
    "glint":      (((140, 130, 150), (240, 236, 250), (255, 255, 255)), 0.0, None),
}
MAT = {name: i for i, name in enumerate(MATERIALS)}
SHINE = np.array([m[1] for m in MATERIALS.values()])
BACK = np.array([MAT[m[2]] if m[2] else i for i, m in enumerate(MATERIALS.values())])
ROSE_MATS = np.array([MAT["rose_lavender"], MAT["rose"], MAT["rose_deep"], MAT["rose_plum"]])

# characters by brightness, darkest first: a cell picks one of its set at random, and keeps
# picking anew every so often - so the letters run. Roses use rounder, curly ones.
# Edges are drawn with STROKES instead, and the petals' outlines with PETAL_STROKES.
GLYPH_SETS = [".,'`", ":;-~=", "+=<>!()[]{}il", "cvxzrtjnu", "oeasmwkQ0", "&%$#8B@"]
ROSE_GLYPH_SETS = [".", ".:'", "co", "oce", "@&%", "@&"]
GLYPH_LIMITS = [0.12, 0.25, 0.42, 0.6, 0.78]
STROKES = "-/|\\_"
PETAL_STROKES = "()_-/\\"
CHANGE_RATE = 2.5        # how often (per second) a cell picks a new letter
EXTRA = ".+*|-/\\(){}<>"  # stars, sparks and the falling petals' shapes

N_SHADE = 12
CHARS = " " + "".join(sorted(set("".join(GLYPH_SETS + ROSE_GLYPH_SETS) + STROKES + PETAL_STROKES
                                 + EXTRA) - {" "}))
GLYPH = {c: i for i, c in enumerate(CHARS)}
PICKS = 64               # each set repeated to this many entries, so a random pick is easy
SET_TABLE = np.array([[GLYPH[s[i % len(s)]] for i in range(PICKS)] for s in GLYPH_SETS])
ROSE_SET_TABLE = np.array([[GLYPH[s[i % len(s)]] for i in range(PICKS)] for s in ROSE_GLYPH_SETS])
STROKE_GLYPHS = np.array([GLYPH[c] for c in STROKES + PETAL_STROKES])     # petal strokes from 5 on


def _shades(stops):
    lo, mid, hi = (np.array(s, float) for s in stops)
    x = np.linspace(0, 1, N_SHADE)[:, None]
    rgb = np.where(x < 0.5, lo + (mid - lo) * 2 * x, mid + (hi - mid) * (2 * x - 1))
    return [tuple(int(v) for v in c) for c in rgb.round()]


PALETTE = [(0, 0, 0)] + [c for m in MATERIALS.values() for c in _shades(m[0])]
N_COLORS = len(PALETTE)


def colour_of(mat, level):
    """Palette index for material `mat` at brightness level 0..1."""
    return 1 + mat * N_SHADE + np.clip((np.asarray(level) * N_SHADE).astype(int), 0, N_SHADE - 1)
