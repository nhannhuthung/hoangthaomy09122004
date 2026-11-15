"""Small maths helpers used everywhere."""

import numpy as np

TAU = 2 * np.pi


def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


def normals_of(p, ax_u, ax_v, out):
    """Unit normals of a surface sampled on a grid p[..., 3], turned towards `out`."""
    n = unit(np.cross(np.gradient(p, axis=ax_u), np.gradient(p, axis=ax_v)))
    return np.where(np.sum(n * out, -1, keepdims=True) < 0, -n, n)
