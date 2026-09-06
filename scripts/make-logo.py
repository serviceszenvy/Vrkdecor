#!/usr/bin/env python3
"""Turn the supplied logo artwork into transparent PNGs for light and dark use."""
from PIL import Image
import numpy as np, os

SRC = "/root/.claude/uploads/2eb87287-a1d4-58e4-82ad-65ec85be19f7/2b857cdb-image.jpg"
OUT = "public"

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.int16)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(2), a.min(2)
sat = mx - mn
# white / near-white paper and its soft drop shadow -> transparent
alpha = np.where((mx > 232) & (sat < 26), 0, 255).astype(np.uint8)
# soften the edge: partially transparent for light greys
soft = (mx > 205) & (mx <= 232) & (sat < 26)
alpha[soft] = 120

rgba = np.dstack([a.astype(np.uint8), alpha])
img = Image.fromarray(rgba, "RGBA")
bbox = img.getbbox()
img = img.crop(bbox)

# normalise size, keep aspect
w, h = img.size
target_h = 420
img = img.resize((int(w * target_h / h), target_h), Image.LANCZOS)
img.save(os.path.join(OUT, "logo.png"))
print("light-bg logo", img.size)

# dark-background variant: lift the dark olive so it stays legible on #1f271b
arr = np.asarray(img).astype(np.float32)
rgb, al = arr[..., :3], arr[..., 3]
lum = rgb.mean(2)
dark = lum < 116
# map deep olive to a pale sage, keep the lime as is
rgb[dark] = rgb[dark] * 0.35 + np.array([214, 231, 195], dtype=np.float32) * 0.65
out = np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8)
Image.fromarray(out, "RGBA").save(os.path.join(OUT, "logo-light.png"))
print("dark-bg logo written")
