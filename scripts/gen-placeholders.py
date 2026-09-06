#!/usr/bin/env python3
"""
Generates on-brand abstract placeholder imagery for VRK Decor.

These are deliberately non-photographic stand-ins so the layout can be judged
without stock photos. Replace every file in public/images/ with real event
photography before launch. Keep the file names and aspect ratios and nothing
else in the codebase needs to change.
"""
import math
import os
import random

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
os.makedirs(OUT, exist_ok=True)

# (deep ground, mid ground, drape light, floral accent, glow)
FAMILIES = {
    "wedding":    ("#2b1d0d", "#7d5a1e", "#f0d089", "#c2452f", "#ffcf7a"),
    "reception":  ("#16200f", "#3f5a33", "#dfeec4", "#a9d271", "#eadfa4"),
    "babyshower": ("#2a1f26", "#7b5a64", "#f6dde1", "#cbe4a8", "#ffd9df"),
    "birthday":   ("#152018", "#3c6a58", "#d8f0c4", "#f2c65c", "#9fe0c0"),
    "seer":       ("#271c0d", "#8a6524", "#f4dda2", "#8fc350", "#ffdc9b"),
    "engagement": ("#1d241a", "#54663f", "#eef3dd", "#cbe4a8", "#ffeec4"),
    "hero":       ("#2a3320", "#5c6f3f", "#f6f2df", "#e0a33c", "#ffe0a6"),
}


def drapes(w, h, light, n):
    """Vertical fabric panels behind the stage."""
    out = []
    for i in range(n):
        x0 = i * w / n
        x1 = (i + 1) * w / n
        op = 0.10 + (i % 3) * 0.05
        out.append(
            f'<path d="M {x0:.0f} 0 L {x1:.0f} 0 L {x1 - w/n*0.18:.0f} {h} L {x0 + w/n*0.18:.0f} {h} Z" '
            f'fill="{light}" opacity="{op:.3f}"/>'
        )
        out.append(
            f'<path d="M {x0:.0f} 0 L {x0 + w/n*0.18:.0f} {h}" stroke="{light}" '
            f'stroke-width="{max(1, w*0.0016):.1f}" opacity="0.22" fill="none"/>'
        )
    return "\n".join(out)


def floral_arch(w, h, rng, accent, light, glow):
    """A mandap arch dressed with floral clusters."""
    cx, ry = w / 2, h * 0.40
    rx = w * 0.29
    top = h * 0.10
    parts = [
        f'<ellipse cx="{cx:.0f}" cy="{top + ry * 0.9:.0f}" rx="{rx*1.5:.0f}" ry="{ry*1.25:.0f}" '
        f'fill="{glow}" opacity="0.22" filter="url(#soft)"/>',
        f'<path d="M {cx - rx:.0f} {h*0.95:.0f} L {cx - rx:.0f} {top + ry:.0f} '
        f'A {rx:.0f} {ry:.0f} 0 0 1 {cx + rx:.0f} {top + ry:.0f} L {cx + rx:.0f} {h*0.95:.0f}" '
        f'fill="none" stroke="{light}" stroke-width="{w*0.021:.1f}" opacity="0.5" stroke-linecap="round"/>',
    ]
    # floral clusters travelling along the arch
    pts = []
    steps = 46
    for i in range(steps):
        t = i / (steps - 1)
        if t < 0.22:
            px, py = cx - rx, h * 0.95 - (t / 0.22) * (h * 0.95 - (top + ry))
        elif t > 0.78:
            px, py = cx + rx, (top + ry) + ((t - 0.78) / 0.22) * (h * 0.95 - (top + ry))
        else:
            a = math.pi * (1 - (t - 0.22) / 0.56)
            px, py = cx + rx * math.cos(a), (top + ry) - ry * math.sin(a)
        pts.append((px, py))
    for (px, py) in pts:
        for _ in range(5):
            r = rng.uniform(0.010, 0.026) * w
            ox = rng.uniform(-1, 1) * w * 0.026
            oy = rng.uniform(-1, 1) * w * 0.026
            c = rng.choice([accent, light, glow])
            parts.append(
                f'<circle cx="{px+ox:.0f}" cy="{py+oy:.0f}" r="{r:.0f}" fill="{c}" opacity="{rng.uniform(0.3,0.72):.2f}"/>'
            )
    return "\n".join(parts)


def string_lights(w, h, rng, glow, rows=3):
    out = []
    for r in range(rows):
        y0 = h * (0.05 + r * 0.07)
        sag = h * 0.055
        n = 26
        for i in range(n + 1):
            t = i / n
            x = t * w
            y = y0 + math.sin(t * math.pi) * sag
            rad = w * 0.0042
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad:.1f}" fill="{glow}" opacity="0.85"/>')
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad*3.4:.1f}" fill="{glow}" opacity="0.16" filter="url(#soft)"/>')
    return "\n".join(out)


def bokeh(rng, w, h, n, colors):
    out = []
    for _ in range(n):
        cx = rng.uniform(-0.05, 1.05) * w
        cy = rng.uniform(0.25, 1.0) * h
        r = rng.uniform(0.010, 0.036) * w
        out.append(
            f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{rng.choice(colors)}" '
            f'opacity="{rng.uniform(0.12,0.4):.2f}" filter="url(#soft)"/>'
        )
    return "\n".join(out)


def floor(w, h, light, glow):
    y = h * 0.82
    return (
        f'<rect x="0" y="{y:.0f}" width="{w}" height="{h - y:.0f}" fill="{light}" opacity="0.10"/>'
        f'<rect x="0" y="{y:.0f}" width="{w}" height="{max(1,h*0.002):.0f}" fill="{light}" opacity="0.3"/>'
        f'<ellipse cx="{w/2:.0f}" cy="{y:.0f}" rx="{w*0.34:.0f}" ry="{h*0.09:.0f}" fill="{glow}" '
        f'opacity="0.20" filter="url(#soft)"/>'
    )


def leaf_sprig(x, y, s, color, rot=0, opacity=0.45):
    parts = [
        f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot}) scale({s:.3f})" '
        f'stroke="{color}" fill="none" stroke-width="6" stroke-linecap="round" opacity="{opacity}">',
        '<path d="M0 0 C 30 -40 70 -60 120 -62"/>',
    ]
    for i in range(6):
        t = i / 5
        px = 12 + t * 100
        py = -14 - t * 42
        parts.append(
            f'<ellipse cx="{px:.0f}" cy="{py:.0f}" rx="22" ry="9" '
            f'transform="rotate({-28 - i*4} {px:.0f} {py:.0f})"/>'
        )
    parts.append("</g>")
    return "".join(parts)


def make(name, family, w, h, seed, kind="stage"):
    deep, mid, light, accent, glow = FAMILIES[family]
    rng = random.Random(seed)
    body = [f'<rect width="{w}" height="{h}" fill="url(#bg)"/>']
    body.append(drapes(w, h, light, 12 if w >= h else 8))
    body.append(string_lights(w, h, rng, glow, 3 if kind in ("stage", "hero") else 2))
    if kind in ("stage", "hero"):
        body.append(floral_arch(w, h, rng, accent, light, glow))
    else:
        # softer table / prop composition for non-stage frames
        for i in range(5):
            cx = w * (0.16 + i * 0.17)
            cy = h * rng.uniform(0.5, 0.72)
            r = w * rng.uniform(0.05, 0.095)
            body.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{light}" opacity="0.16"/>')
            for _ in range(14):
                a = rng.uniform(0, math.tau)
                rr = rng.uniform(0, r)
                body.append(
                    f'<circle cx="{cx + math.cos(a)*rr:.0f}" cy="{cy + math.sin(a)*rr*0.7:.0f}" '
                    f'r="{w*rng.uniform(0.006,0.014):.0f}" fill="{rng.choice([accent, glow, light])}" '
                    f'opacity="{rng.uniform(0.3,0.7):.2f}"/>'
                )
    body.append(floor(w, h, light, glow))
    body.append(bokeh(rng, w, h, 16, [glow, light, accent]))
    body.append(leaf_sprig(w * 0.05, h * 0.93, w / 1000, light, -10, 0.3))
    body.append(leaf_sprig(w * 0.95, h * 0.12, w / 1000, accent, 172, 0.26))
    body.append(f'<rect width="{w}" height="{h}" fill="url(#vig)"/>')
    body.append(f'<rect width="{w}" height="{h}" filter="url(#grain)" opacity="0.13"/>')

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">
<defs>
  <linearGradient id="bg" x1="0.1" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="{mid}"/>
    <stop offset="52%" stop-color="{deep}"/>
    <stop offset="100%" stop-color="{mid}"/>
  </linearGradient>
  <radialGradient id="vig" cx="50%" cy="40%" r="80%">
    <stop offset="42%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#0d1109" stop-opacity="0.42"/>
  </radialGradient>
  <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="{w*0.012:.1f}"/>
  </filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/></filter>
</defs>
{chr(10).join(body)}
</svg>'''
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)


files = [
    ("hero.svg", "hero", 1600, 2000, 7, "hero"),
    ("work-wedding.svg", "wedding", 1200, 900, 11, "stage"),
    ("work-reception.svg", "reception", 1200, 900, 12, "stage"),
    ("work-babyshower.svg", "babyshower", 1200, 900, 13, "soft"),
    ("work-birthday.svg", "birthday", 1200, 900, 14, "soft"),
    ("work-seer.svg", "seer", 1200, 900, 15, "soft"),
    ("work-engagement.svg", "engagement", 1200, 900, 16, "stage"),
    ("gal-1.svg", "wedding", 900, 1200, 21, "stage"),
    ("gal-2.svg", "reception", 900, 700, 22, "stage"),
    ("gal-3.svg", "babyshower", 900, 700, 23, "soft"),
    ("gal-4.svg", "wedding", 900, 1200, 24, "stage"),
    ("gal-5.svg", "birthday", 900, 700, 25, "soft"),
    ("gal-6.svg", "seer", 900, 700, 26, "soft"),
    ("gal-7.svg", "engagement", 900, 1200, 27, "stage"),
    ("gal-8.svg", "wedding", 900, 700, 28, "soft"),
    ("gal-9.svg", "reception", 900, 700, 29, "soft"),
    ("about-team.svg", "engagement", 1400, 1000, 31, "soft"),
    ("menu-feature.svg", "wedding", 900, 700, 41, "stage"),
]
for f in files:
    make(*f)
print(f"generated {len(files)} placeholders")
