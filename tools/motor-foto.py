#!/usr/bin/env python3
"""Elektrikli motor (triportor) paket foto'larini siteye hazirlar.

Kaynak foto'lar `assets/img/products/ev/kaynak/` altinda tutulur (repoda,
silinmez). Betik kenar seritlerini kirpar, kart oranina getirir ve yayin
`.webp` turevlerini uretir.

    python3 tools/motor-foto.py            # yalniz rapor (DRY-RUN)
    python3 tools/motor-foto.py --uygula   # dosyalari yazar

ONEMLI — MARKA KURALI: bu foto'lardaki araclar BASKA ureticilere aittir
(CSN, SFM). `tools/marka-logo.py` kurali burada UYGULANMAZ: gercek bir
ureticinin markasini silip yerine GESPA yazmak olmaz. Araclar yalnizca
"sizin aracınız hangi tipte" sorusunu cevaplamak icin ornek olarak
gosterilir; sayfada da boyle etiketlenir.

Gereksinim: pillow
"""
import os
import sys

from PIL import Image

SRC = "assets/img/products/ev/kaynak/"
OUT = "assets/img/products/ev/"

JOBS = [
    {
        # Yolcu kabinli triportor (studyo, beyaz zemin) — 285 W paketinin
        # secici kartinda kullanilir. Alt/ust bosluk 4:3'e kirpilir.
        "src": "motor-yolcu-kabinli.png",
        "out": "motor-yolcu.webp",
        "crop": (0, 34, 849, 716),
        "quality": 84,
    },
    {
        # Kargo kasali triportor (SFM Express max) — 655 W paketinin karti.
        # Marka yazisi GORUNUR KALIR, silinmez.
        "src": "motor-kargo-kasali.png",
        "out": "motor-kargo.webp",
        "crop": (0, 14, 1032, 788),
        "quality": 84,
    },
    {
        # Cati panelli kurulum ornegi (gercek is) — paket kutusunda "boyle
        # gorunur" kanit foto'su. Dikey kadraj korunur.
        "src": "motor-panel-takili.png",
        "out": "motor-panel-takili.webp",
        "crop": (0, 6, 408, 715),
        "quality": 84,
    },
]


def run(job, write):
    src = os.path.join(SRC, job["src"])
    dst = os.path.join(OUT, job["out"])
    im = Image.open(src).convert("RGB")
    before = im.size
    if job.get("crop"):
        im = im.crop(job["crop"])
    if job.get("max"):
        im.thumbnail((job["max"], job["max"]), Image.LANCZOS)
    print("%-28s %sx%s -> %-24s %sx%s" % (job["src"], before[0], before[1],
                                          job["out"], im.size[0], im.size[1]))
    if write:
        im.save(dst, "WEBP", quality=job.get("quality", 84), method=6)


def main():
    write = "--uygula" in sys.argv
    for j in JOBS:
        run(j, write)
    print("YAZILDI" if write else "DRY-RUN (yazmak icin: --uygula)")


if __name__ == "__main__":
    main()
