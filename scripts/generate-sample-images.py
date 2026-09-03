#!/usr/bin/env python3
"""
Generate the synthetic placeholder imagery used while VRK Decor's own
photography is unavailable.

These are NOT photographs and they do not depict VRK Decor's work or any real
event. They exist so the redesigned layouts can be reviewed with something
image-shaped in them, and they are shown only when Supabase is not configured.
`public/samples/README.md` records that, and both the directory and
`lib/content/sample-portfolio.ts` must be deleted before the production build.

Run:  python3 scripts/generate-sample-images.py
Needs: pillow, numpy
"""

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "public" / "samples"

# Palette drawn from the approved token set (lib/design-tokens.ts).
DEEP = (28, 44, 24)
FOLIAGE = (63, 88, 50)
LEAF = (108, 138, 78)
SAGE = (140, 165, 112)
IVORY = (247, 245, 236)
CREAM = (232, 224, 205)
WARM = (255, 226, 168)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def vertical_wash(w, h, top, mid, bottom):
    ramp = np.zeros((h, 3), dtype=np.float64)
    for y in range(h):
        t = y / max(h - 1, 1)
        c = lerp(top, mid, t / 0.55) if t < 0.55 else lerp(mid, bottom, (t - 0.55) / 0.45)
        ramp[y] = c
    return Image.fromarray(
        np.repeat(ramp[:, None, :], w, axis=1).astype(np.uint8), "RGB"
    )


def foliage(base, rng, density, colours, size_range):
    """Soft overlapping leaf shapes, blurred into a canopy."""
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(density):
        cx = rng.uniform(-0.05, 1.05) * w
        cy = rng.uniform(-0.1, 1.05) * h
        r = rng.uniform(*size_range) * min(w, h)
        colour = colours[rng.randrange(len(colours))]
        alpha = rng.randint(70, 165)
        angle = rng.uniform(0, math.pi)
        rx, ry = r, r * rng.uniform(0.32, 0.6)
        pts = []
        for i in range(22):
            a = 2 * math.pi * i / 22
            x = rx * math.cos(a)
            y = ry * math.sin(a)
            pts.append(
                (
                    cx + x * math.cos(angle) - y * math.sin(angle),
                    cy + x * math.sin(angle) + y * math.cos(angle),
                )
            )
        draw.polygon(pts, fill=colour + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(w, h) / 190))
    return Image.alpha_composite(base.convert("RGBA"), layer)


def blossoms(base, rng, count, radius_range, colour=IVORY):
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        cx = rng.uniform(0, 1) * w
        cy = rng.uniform(0, 1) * h
        r = rng.uniform(*radius_range) * min(w, h)
        alpha = rng.randint(120, 235)
        for i in range(5):
            a = 2 * math.pi * i / 5 + rng.uniform(0, 1)
            px = cx + math.cos(a) * r * 0.62
            py = cy + math.sin(a) * r * 0.62
            draw.ellipse(
                [px - r * 0.55, py - r * 0.55, px + r * 0.55, py + r * 0.55],
                fill=colour + (alpha,),
            )
        draw.ellipse(
            [cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3],
            fill=WARM + (min(255, alpha + 20),),
        )
    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(w, h) / 420))
    return Image.alpha_composite(base.convert("RGBA"), layer)


def lights(base, rng, count, drop=True):
    """Warm hanging bulbs with a soft halo."""
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    gdraw = ImageDraw.Draw(glow)
    for _ in range(count):
        cx = rng.uniform(0, 1) * w
        cy = rng.uniform(0.02, 0.62) * h
        r = rng.uniform(0.006, 0.016) * min(w, h)
        if drop:
            gdraw.line([(cx, 0), (cx, cy)], fill=(255, 240, 210, 26), width=1)
        gdraw.ellipse(
            [cx - r * 5, cy - r * 5, cx + r * 5, cy + r * 5],
            fill=(255, 222, 160, 46),
        )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 243, 214, 232))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(w, h) / 90))
    out = Image.alpha_composite(base.convert("RGBA"), glow)
    return Image.alpha_composite(out, layer.filter(ImageFilter.GaussianBlur(radius=1.2)))


def lift(img, amount=1.14, floor=16):
    """Raise midtones so the placeholder reads bright and airy, not murky."""
    arr = np.asarray(img.convert("RGB")).astype(np.float64)
    arr = floor + arr * amount
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def vignette(img, strength=0.34):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx / w - 0.5) * 2
    ny = (yy / h - 0.5) * 2
    d = np.sqrt(nx**2 + ny**2) / math.sqrt(2)
    mask = np.clip(1 - (d**2.4) * strength * 1.5, 0.55, 1.0)
    arr = np.asarray(img.convert("RGB")).astype(np.float64)
    arr *= mask[:, :, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def setting(img, rng, floor=0.76, arch=True):
    """A warm light pool and a soft pale seat, so the frame reads as a setup."""
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if arch:
        cx, cy = w * 0.5, h * (floor - 0.06)
        rx, ry = w * 0.34, h * 0.62
        d.ellipse(
            [cx - rx, cy - ry, cx + rx, cy + ry * 0.34],
            fill=(255, 250, 236, 34),
        )
    # Warm floor wash rather than a hard edge.
    for i in range(26):
        t = i / 25
        y = h * (floor + 0.24 * t)
        d.rectangle([0, y, w, h], fill=CREAM + (7,))
    d.rounded_rectangle(
        [w * 0.3, h * (floor - 0.1), w * 0.7, h * (floor + 0.08)],
        radius=int(h * 0.05),
        fill=IVORY + (120,),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(w, h) / 90))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def scene(kind, seed, w, h):
    rng = random.Random(seed)

    palettes = {
        "wedding": ((48, 70, 40), (96, 122, 70), (218, 210, 186)),
        "reception": ((42, 64, 36), (88, 114, 66), (206, 204, 176)),
        "engagement": ((58, 80, 48), (122, 146, 94), (236, 228, 206)),
        "baby": ((64, 88, 52), (134, 158, 104), (240, 234, 216)),
        "birthday": ((54, 76, 44), (126, 150, 96), (238, 228, 202)),
        "housewarming": ((46, 66, 36), (100, 124, 74), (216, 204, 176)),
        "hero": ((44, 68, 40), (100, 128, 72), (230, 220, 196)),
    }
    top, mid, bottom = palettes.get(kind, palettes["wedding"])

    img = vertical_wash(w, h, top, mid, bottom)
    img = foliage(img, rng, 130, [FOLIAGE, LEAF, SAGE], (0.05, 0.18))
    img = lights(img, rng, 52 if kind == "hero" else 34)
    img = blossoms(img, rng, 150 if kind == "hero" else 110, (0.008, 0.024))
    img = foliage(img, rng, 26, [FOLIAGE, LEAF], (0.06, 0.18))
    img = setting(img.convert("RGB"), rng, floor=0.76, arch=kind != "reception")
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    return lift(vignette(img))


PORTFOLIO = [
    ("wedding-royal", "wedding"),
    ("reception-modern", "reception"),
    ("engagement-pastel", "engagement"),
    ("baby-shower-floral", "baby"),
    ("birthday-colourful", "birthday"),
    ("housewarming-temple", "housewarming"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for index, (prefix, kind) in enumerate(PORTFOLIO):
        for n in range(1, 5):
            portrait = n == 3
            w, h = (1050, 1400) if portrait else (1400, 1050)
            img = scene(kind, seed=1000 + index * 17 + n, w=w, h=h)
            path = OUT / f"{prefix}-{n}.webp"
            img.save(path, "WEBP", quality=72, method=6)
            print(path.name, img.size, path.stat().st_size // 1024, "KB")

    hero = scene("hero", seed=7, w=2000, h=1250)
    hero_path = OUT / "hero-celebration.webp"
    hero.save(hero_path, "WEBP", quality=76, method=6)
    print(hero_path.name, hero.size, hero_path.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
