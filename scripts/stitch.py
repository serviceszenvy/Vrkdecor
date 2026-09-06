import json, os, sys
from PIL import Image

for name in sys.argv[1:]:
    d = f"shots/.tiles-{name}"
    m = json.load(open(os.path.join(d, "manifest.json")))
    dsf, total = m["dsf"], m["total"]
    files = sorted(f for f in os.listdir(d) if f.endswith(".png"))
    out = Image.new("RGB", (m["width"] * dsf, total * dsf), "#f7f8f4")
    for f in files:
        y = int(f.split("_")[1].split(".")[0])
        tile = Image.open(os.path.join(d, f))
        out.paste(tile, (0, y * dsf))
    out.save(f"shots/{name}.png", optimize=True)
    print(name, out.size)
