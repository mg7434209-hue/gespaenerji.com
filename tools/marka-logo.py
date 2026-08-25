#!/usr/bin/env python3
"""Su isitici urun fotograflarindaki OEM yazi markasini GESPA ile degistirir.

Fotograflar tedarikci kaynaklidir ve govde uzerinde farkli OEM markalari
(sino spring / LEXRUN / CIWA SPRING) tasir. Bu betik her fotograftaki yazi
markasini bulur, yuzeyi puruzsuzce doldurur (Laplace difuzyonu) ve ayni
konum/aci/tonda "GESPA" yazar. Kaynak fotograf degisirse:

    python3 tools/marka-logo.py            # yalniz rapor (DRY-RUN)
    python3 tools/marka-logo.py --uygula   # dosyalari yazar (+ -thumb turevleri)

Gereksinim: pillow, numpy  (pip install pillow numpy)
"""
import math
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

IMG = "assets/img/products/heater/"
FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
WORD = "GESPA"

# dosya: (arama kutusu x0,y0,x1,y1, yeni yazi/orijinal genislik orani, esik carpani)
TARGETS = {
    "tank-1.webp":       ((180, 115, 335, 155), 0.62, 0.15),
    "tank-2.webp":       ((440,  85, 545, 135), 0.62, 0.15),
    "tank-3.webp":       ((185,  45, 300,  90), 0.62, 0.15),
    "tank-4.webp":       ((312,  42, 392,  96), 0.70, 0.15),
    "tank-6.webp":       ((172,  55, 295, 100), 0.62, 0.25),
    "tank-7.webp":       ((240,  70, 405, 115), 0.55, 0.15),
    "tank-8.webp":       ((295,  95, 445, 135), 0.62, 0.15),
    "og-su-isitici.jpg": ((350, 112, 502, 162), 0.62, 0.15),
}
THUMBS = {f"tank-{i}.webp": f"tank-{i}-thumb.webp" for i in range(1, 9)}
SS = 8          # yazi icin supersampling
TRACKING = 0.16  # em cinsinden harf araligi


def detect(lum, box, k=0.15):
    """Kutu icindeki koyu yazi pikellerini bul; maske + PCA ekseni dondur."""
    x0, y0, x1, y1 = box
    sub = lum[y0:y1, x0:x1]
    bg = np.asarray(
        Image.fromarray(sub.astype(np.uint8)).filter(ImageFilter.GaussianBlur(9)),
        dtype=np.float64,
    )
    d = bg - sub
    mask = d > max(3.0, d.max() * k)
    ys, xs = np.nonzero(mask)
    if len(xs) < 20:
        raise SystemExit(f"maske bulunamadi: {box}")
    cx, cy = xs.mean(), ys.mean()
    X = np.stack([xs - cx, ys - cy])
    w, v = np.linalg.eigh(np.cov(X))
    v1 = v[:, np.argmax(w)]
    ang = math.degrees(math.atan2(v1[1], v1[0]))
    ang = ang - 180 if ang > 90 else ang + 180 if ang < -90 else ang
    proj = X.T @ v1
    length = proj.max() - proj.min()
    return mask, (cx + x0, cy + y0), ang, length, d


def inflate(mask, r=2):
    out = mask.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out |= np.roll(np.roll(mask, dy, 0), dx, 1)
    return out


def diffuse(chan, mask, rounds=600):
    """Maskeli pikselleri kenar degerlerinden Laplace difuzyonuyla doldur."""
    u = chan.copy()
    u[mask] = chan[~mask].mean()
    for _ in range(rounds):
        avg = np.zeros_like(u)
        avg[1:-1, 1:-1] = (u[:-2, 1:-1] + u[2:, 1:-1] + u[1:-1, :-2] + u[1:-1, 2:]) / 4
        u[mask] = avg[mask]
    return u


def wordmark(width, height):
    """WORD metnini harf araligiyla, saydam zeminde alfa maskesi olarak uret."""
    f = ImageFont.truetype(FONT, int(height * SS))
    gap = int(height * SS * TRACKING)
    widths = [f.getbbox(c)[2] - f.getbbox(c)[0] for c in WORD]
    advances = [f.getlength(c) for c in WORD]
    total = int(sum(advances) + gap * (len(WORD) - 1))
    asc, desc = f.getmetrics()
    lay = Image.new("L", (total + 20, asc + desc + 20), 0)
    dr = ImageDraw.Draw(lay)
    x = 10
    for c in WORD:
        dr.text((x, 10), c, font=f, fill=255)
        x += f.getlength(c) + gap
    lay = lay.crop(lay.getbbox())
    del widths
    return lay.resize((max(1, width), max(1, height)), Image.LANCZOS)


def process(name, box, ratio, k, write):
    path = IMG + name
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im, dtype=np.float64)
    lum = arr.mean(2)
    mask_sub, center, ang, length, _ = detect(lum, box, k)

    full = np.zeros(lum.shape, bool)
    full[box[1]:box[3], box[0]:box[2]] = mask_sub
    core = full.copy()
    full = inflate(full, 2)

    # yazinin ton orani (koyuluk) — golgeyi korumak icin kanal basina oran
    pad = 12
    x0, y0 = max(0, box[0] - pad), max(0, box[1] - pad)
    x1, y1 = min(arr.shape[1], box[2] + pad), min(arr.shape[0], box[3] + pad)
    reg = arr[y0:y1, x0:x1]
    m = full[y0:y1, x0:x1]
    c = core[y0:y1, x0:x1]

    clean = np.dstack([diffuse(reg[:, :, k], m) for k in range(3)])
    with np.errstate(divide="ignore", invalid="ignore"):
        ratio_k = np.array(
            [np.median(reg[:, :, k][c] / np.maximum(clean[:, :, k][c], 1e-6)) for k in range(3)]
        )
    ratio_k = np.clip(ratio_k, 0.05, 0.98)

    # yeni yazi: orijinal uzunlugun `ratio` kadari, ayni aci ve merkez
    w = max(8, int(round(length * ratio)))
    h = max(4, int(round(w / 5.2)))
    lay = wordmark(w, h)
    lay = lay.rotate(-ang, expand=True, resample=Image.BICUBIC)
    a = np.asarray(lay, dtype=np.float64) / 255.0

    out = arr.copy()
    out[y0:y1, x0:x1] = clean
    cx, cy = center
    px, py = int(round(cx - lay.width / 2)), int(round(cy - lay.height / 2))
    sl = (slice(py, py + lay.height), slice(px, px + lay.width))
    dst = out[sl]
    for k in range(3):
        dst[:, :, k] = dst[:, :, k] * (1 - a * (1 - ratio_k[k]))
    out[sl] = dst

    print(
        f"{name:20s} aci={ang:6.2f}  uzunluk={length:5.1f} -> {w:3d}px  "
        f"merkez=({cx:6.1f},{cy:6.1f})  ton={np.round(ratio_k, 2)}"
    )
    res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    if write:
        if name.endswith(".jpg"):
            res.save(path, quality=88, optimize=True)
        else:
            res.save(path, "WEBP", quality=86, method=6)
        thumb = THUMBS.get(name)
        if thumb:
            t = Image.open(IMG + thumb)
            res.resize(t.size, Image.LANCZOS).save(IMG + thumb, "WEBP", quality=84, method=6)
    return res


if __name__ == "__main__":
    write = "--uygula" in sys.argv
    for n, (b, r, k) in TARGETS.items():
        process(n, b, r, k, write)
    print("YAZILDI" if write else "DRY-RUN (yazmak icin: --uygula)")
