"""Generates the seamless ocean wave tiles used by components/loader/NavyBackdrop.

Same recipe as the envelope sea (components/loader/SunsetSeaBackdrop): soft
horizontal ellipse strokes pushed around by a turbulence displacement filter.
Strokes that cross a tile edge are repeated on the opposite edge, and the
turbulence uses stitchTiles over the full tile, so the tiles repeat seamlessly
in both directions. Deterministic: re-running produces identical files.

Run: python3 scripts/generate-ocean-tiles.py
"""
import math
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "ocean")


def rand(seed):
    x = math.sin(seed * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


def strokes(seed, w, h, rows, per_row, light_share, rx_range, ry_range):
    out = []
    for r in range(rows):
        y = (r + 0.5) * h / rows
        for i in range(per_row):
            s = seed + r * 37 + i * 11
            pick = rand(s + 4)
            tone = "l" if pick < light_share else ("d" if pick < 0.74 else "k")
            out.append((
                rand(s) * w,
                y + (rand(s + 1) - 0.5) * (h / rows) * 0.8,
                rx_range[0] + rand(s + 2) * (rx_range[1] - rx_range[0]),
                ry_range[0] + rand(s + 3) * (ry_range[1] - ry_range[0]),
                tone,
            ))
    return out


def wrapped(items, w, h, pad=24):
    """Repeat strokes that spill over an edge onto the opposite edge."""
    for x, y, rx, ry, tone in items:
        xs = [x] + ([x + w] if x - rx < pad else []) + ([x - w] if x + rx > w - pad else [])
        ys = [y] + ([y + h] if y - ry < pad else []) + ([y - h] if y + ry > h - pad else [])
        for xx in xs:
            for yy in ys:
                yield xx, yy, rx, ry, tone


def tile(name, w, h, items, fills, freq, scale, blur):
    body = "".join(
        f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" class="{t}"/>'
        for x, y, rx, ry, t in wrapped(items, w, h)
    )
    css = "".join(f".{k}{{fill:{c};opacity:{o}}}" for k, (c, o) in fills.items())
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        f"<style>{css}</style>"
        f'<filter id="w" x="0" y="0" width="{w}" height="{h}" filterUnits="userSpaceOnUse">'
        f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="3" seed="9" stitchTiles="stitch"/>'
        f'<feDisplacementMap in="SourceGraphic" scale="{scale}"/>'
        f'<feGaussianBlur stdDeviation="{blur}"/>'
        f"</filter>"
        f'<g filter="url(#w)">{body}</g></svg>\n'
    )
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)
    print(name, len(svg), "bytes")


os.makedirs(OUT, exist_ok=True)

# Back layer: long swells — shadowed troughs with moonlit crests between them
tile(
    "waves-back.svg", 800, 640,
    strokes(23, 800, 640, 26, 5, 0.3, (60, 210), (3, 8)),
    {"d": ("#0d1835", 0.5), "k": ("#08112a", 0.45), "l": ("#6d84b3", 0.24)},
    "0.02 0.12", 14, 1.2,
)

# Front layer: shorter, crisper chop that catches more light
tile(
    "waves-front.svg", 640, 480,
    strokes(71, 640, 480, 20, 4, 0.42, (40, 140), (2, 5.5)),
    {"d": ("#0b1531", 0.42), "k": ("#060e24", 0.36), "l": ("#8197c4", 0.3)},
    "0.025 0.15", 10, 0.9,
)

# Far layer: fine, tightly packed strokes for distant water near the top of a section
tile(
    "waves-far.svg", 640, 400,
    strokes(41, 640, 400, 28, 6, 0.32, (30, 110), (1.5, 3.5)),
    {"d": ("#0d1835", 0.5), "k": ("#08112a", 0.42), "l": ("#6d84b3", 0.26)},
    "0.02 0.14", 8, 0.8,
)
