#!/usr/bin/env python3
"""Tedarikciden gelen yeni su isitici fotograflarini siteye hazirlar.

Kaynak fotograflar `assets/img/products/kaynak/` altinda tutulur (repoda).
Betik: kenar artefaktlarini kirpar, govde uzerindeki OEM marka yazisini
(ornegin EcoSunHome) silip ayni konum/aci/renkte GESPA yazar, .webp
turevlerini uretir.

    python3 tools/foto-hazirla.py            # yalniz rapor (DRY-RUN)
    python3 tools/foto-hazirla.py --uygula   # dosyalari yazar

Gereksinim: pillow, numpy
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_ml = __import__("importlib").machinery.SourceFileLoader(
    "marka_logo", os.path.join(os.path.dirname(os.path.abspath(__file__)), "marka-logo.py")
).load_module()

SRC = "assets/img/products/kaynak/"
OUT = "assets/img/products/"

JOBS = [
    {
        # Panel + yatay tank, stüdyo çekimi. Sag kenardaki yuvarlak arayuz
        # artefakti kirpilir; tank govdesine GESPA yazisi eklenir.
        "src": "panel-tank.png",
        "out": "pv-su-isitici-urun.webp",
        "crop": (0, 0, 850, 783),
        "erase": [(500, 712, 572, 730)],          # okunmayan fabrika yazisi
        "mark": {"cx": 300, "cy": 522, "w": 116, "ang": -2.0, "tone": 0.62},
        "quality": 86,
    },
    {
        # Ana sayfa "Güneşten Bedava Sıcak Su" seridi: yayin dosyasindan
        # 1.3:1 manzara kirpma (feature-img object-fit:cover ile calisir).
        # NOT: `from` isi, kendinden ONCE uretilen isin BELLEKTEKI sonucunu
        # okur (webp'yi yeniden acmaz — cift sikistirma olmaz).
        "from": "pv-su-isitici-urun.webp",
        "out": "pv-su-isitici-ana.webp",
        "crop": (0, 129, 850, 783),
        "quality": 86,
    },
    {
        # Banyoda duvara monte tank. Ust kenardaki siyah serit kirpilir;
        # govdedeki OEM yazi markasi silinip yerine GESPA yazilir.
        "src": "banyo-duvar.png",
        "out": "pv-su-isitici-banyo.webp",
        "crop": (0, 9, 853, 878),
        "swap": {"box": (385, 351, 556, 404), "k": 0.15, "ratio": 0.85, "h": 0.175, "q": 0.2},
        "quality": 84,
    },
]


DONE = {}


def erase(arr, box):
    x0, y0, x1, y1 = box
    pad = 10
    a, b = max(0, y0 - pad), min(arr.shape[0], y1 + pad)
    c, d = max(0, x0 - pad), min(arr.shape[1], x1 + pad)
    m = np.zeros(arr.shape[:2], bool)
    m[y0:y1, x0:x1] = True
    reg, mm = arr[a:b, c:d], m[a:b, c:d]
    arr[a:b, c:d] = np.dstack([_ml.diffuse(reg[:, :, k], mm) for k in range(3)])
    return arr


def stamp(arr, cx, cy, w, ang, tone):
    """Verilen merkeze, verilen acida GESPA yazar (tone = koyuluk orani)."""
    h = max(4, int(round(w / 5.2)))
    lay = _ml.wordmark(w, h).rotate(-ang, expand=True, resample=Image.BICUBIC)
    a = np.asarray(lay, dtype=np.float64) / 255.0
    px, py = int(round(cx - lay.width / 2)), int(round(cy - lay.height / 2))
    dst = arr[py:py + lay.height, px:px + lay.width]
    for k in range(3):
        dst[:, :, k] = dst[:, :, k] * (1 - a * (1 - tone))
    arr[py:py + lay.height, px:px + lay.width] = dst
    return arr


def run(job, write):
    if "from" in job:
        label, base = job["from"], DONE[job["from"]]
    else:
        label, base = job["src"], Image.open(SRC + job["src"]).convert("RGB")
    im = base.crop(job["crop"])
    arr = np.asarray(im, dtype=np.float64).copy()
    for b in job.get("erase", []):
        arr = erase(arr, b)
    if "mark" in job:
        m = job["mark"]
        arr = stamp(arr, m["cx"], m["cy"], m["w"], m["ang"], m["tone"])
        print(f"  GESPA yazildi: merkez=({m['cx']},{m['cy']}) genislik={m['w']}px aci={m['ang']}")
    if "swap" in job:
        s = job["swap"]
        arr, info = swap(arr, s)
        print(f"  OEM yazi degistirildi: {info}")
    res = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    DONE[job["out"]] = res
    print(f"{label} -> {job['out']}  {res.size}")
    if write:
        res.save(OUT + job["out"], "WEBP", quality=job["quality"], method=6)
    return res


def swap(arr, s):
    """Kutudaki mevcut yazi markasini bulur, siler ve yerine GESPA yazar.
    Renk/koyuluk orijinal yazidan kanal bazinda alinir (yesil logo yesil kalir)."""
    lum = arr.mean(2)
    box = s["box"]
    mask_sub, center, ang, length, _ = _ml.detect(lum, box, s["k"])
    full = np.zeros(lum.shape, bool)
    full[box[1]:box[3], box[0]:box[2]] = mask_sub
    core = full.copy()
    full = _ml.inflate(full, 2)

    pad = 12
    x0, y0 = max(0, box[0] - pad), max(0, box[1] - pad)
    x1, y1 = min(arr.shape[1], box[2] + pad), min(arr.shape[0], box[3] + pad)
    reg, m, c = arr[y0:y1, x0:x1], full[y0:y1, x0:x1], core[y0:y1, x0:x1]
    clean = np.dstack([_ml.diffuse(reg[:, :, k], m) for k in range(3)])
    q = s.get("q", 0.5) * 100
    tone = np.clip(
        [np.percentile(reg[:, :, k][c] / np.maximum(clean[:, :, k][c], 1e-6), q) for k in range(3)],
        0.05, 0.98,
    )
    arr[y0:y1, x0:x1] = clean

    w = max(8, int(round(length * s["ratio"])))
    h = max(4, int(round(w * s["h"])))
    lay = _ml.wordmark(w, h).rotate(-ang, expand=True, resample=Image.BICUBIC)
    a = np.asarray(lay, dtype=np.float64) / 255.0
    px, py = int(round(center[0] - lay.width / 2)), int(round(center[1] - lay.height / 2))
    dst = arr[py:py + lay.height, px:px + lay.width]
    for k in range(3):
        dst[:, :, k] = dst[:, :, k] * (1 - a * (1 - tone[k]))
    arr[py:py + lay.height, px:px + lay.width] = dst
    return arr, f"aci={ang:.2f} uzunluk={length:.0f}->{w}px ton={np.round(tone, 2)}"


if __name__ == "__main__":
    write = "--uygula" in sys.argv
    for j in JOBS:
        run(j, write)
    print("YAZILDI" if write else "DRY-RUN (yazmak icin: --uygula)")
