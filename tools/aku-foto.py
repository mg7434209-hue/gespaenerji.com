#!/usr/bin/env python3
"""Europlus 72 V 30 Ah LiFePO4 aku foto'larini siteye hazirlar.

Kaynak foto'lar `assets/img/products/ev/kaynak/` altinda tutulur (repoda,
silinmez). Betik dikey studyo cekimini sitenin 4:3 kart oranina BEYAZ ZEMIN
uzerine ortalar (kirpmaz — aku dar ve uzun, kirpilsa govde kesilir) ve
yayin `.webp` turevlerini uretir.

    python3 tools/aku-foto.py            # yalniz rapor (DRY-RUN)
    python3 tools/aku-foto.py --uygula   # dosyalari yazar

ONEMLI — MARKA KURALI: bu aku BASKA BIR URETICININ markali urunudur
(europlus). `tools/marka-logo.py` kurali burada UYGULANMAZ: gercek bir
ureticinin markasini silip yerine GESPA yazmak olmaz — UNV ve CSN/SFM
kuralinin aynisi. Etiket oldugu gibi kalir, config'te `brand: "europlus"`.

Gereksinim: pillow
"""
import os
import sys

from PIL import Image

SRC = "assets/img/products/ev/kaynak/"
OUT = "assets/img/products/ev/"

JOBS = [
    {
        # Urun foto'su: 663x1024 dikey studyo cekimi (beyaz zemin).
        # 880x660 beyaz tuvale ortalanir — site kartlari 4:3 bekler,
        # `.sh-media img` contain oldugundan yan bosluk zeminle kaynasir.
        "src": "aku-72v-30ah.png",
        "out": "aku-72v-30ah.webp",
        "canvas": (880, 660),
        "pad": 18,                 # tuval yuksekliginde ust/alt bosluk (px)
        "quality": 86,
    },
    {
        # Kucuk resim (galeri seridi) — ayni kadraj, yariya yakin olcek.
        "from": "aku-72v-30ah.webp",
        "out": "aku-72v-30ah-thumb.webp",
        "max": 300,
        "quality": 82,
    },
    {
        # Uyumluluk semasi: 72 V guc sistemi nerede duruyor (aku -> motor
        # kontrolorü -> hub motorlar). Zaten yatay, yalniz olceklenir.
        # Semadaki arac SFM'e aittir; marka yazisi SILINMEZ ve sayfada
        # "yalnizca tip ornegidir, arac satilmaz" notu kalir.
        "src": "aku-72v-30ah-uyumluluk.png",
        "out": "aku-72v-30ah-uyumluluk.webp",
        "max": 900,
        "quality": 84,
    },
    {
        "from": "aku-72v-30ah-uyumluluk.webp",
        "out": "aku-72v-30ah-uyumluluk-thumb.webp",
        "max": 300,
        "quality": 82,
    },
]


def run(job, write, bellek):
    if job.get("from"):
        im = bellek[job["from"]].copy()
        kaynak = job["from"]
    else:
        im = Image.open(os.path.join(SRC, job["src"])).convert("RGB")
        kaynak = job["src"]
    before = im.size
    if job.get("canvas"):
        cw, ch = job["canvas"]
        pad = job.get("pad", 0)
        h = ch - 2 * pad
        w = max(1, round(im.width * h / im.height))
        if w > cw - 2 * pad:                      # genis foto: genislige sigdir
            w = cw - 2 * pad
            h = max(1, round(im.height * w / im.width))
        im = im.resize((w, h), Image.LANCZOS)
        tuval = Image.new("RGB", (cw, ch), (255, 255, 255))
        tuval.paste(im, ((cw - w) // 2, (ch - h) // 2))
        im = tuval
    if job.get("max"):
        im.thumbnail((job["max"], job["max"]), Image.LANCZOS)
    print("%-30s %sx%s -> %-34s %sx%s" % (kaynak, before[0], before[1],
                                          job["out"], im.size[0], im.size[1]))
    bellek[job["out"]] = im
    if write:
        im.save(os.path.join(OUT, job["out"]), "WEBP",
                quality=job.get("quality", 84), method=6)


def main():
    write = "--uygula" in sys.argv
    bellek = {}
    for j in JOBS:
        run(j, write, bellek)
    print("YAZILDI" if write else "DRY-RUN (yazmak icin: --uygula)")


if __name__ == "__main__":
    main()
