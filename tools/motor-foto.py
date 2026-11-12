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
    # —— Paket kutusunun SOL gorseli —— secilen araca gore degisir, bu yuzden
    # ikisi de AYNI 4:3 orandadir; farkli oranda olsalar kart secildikce
    # kutunun yuksekligi ziplardi.
    {
        # Yolcu kabinli: catisinda panel takili gercek arac, ust kadraj.
        "src": "motor-panel-takili.png",
        "out": "motor-yolcu-kurulum.webp",
        "crop": (0, 8, 408, 314),
        "quality": 84,
    },
    {
        # Kargo kasali: catidaki panel + kasa birlikte gorunsun.
        "src": "motor-kargo-kasali.png",
        "out": "motor-kargo-kurulum.webp",
        "crop": (180, 0, 1032, 639),
        "quality": 84,
    },
    # —— 3. ve 4. paketler (9 Eki 2026, kaynak: elektrikli_motor.docx) ——
    # motor-golf-panelli.png panel cercevesindeki tedarikci yazisi (M.S.
    # TECHNIK + telefon) `tools/yazi-sil.py` ile SILINMIS hâlidir; ham hali
    # repoya KONMAZ (MS Teknik iletisimi siteye girmez kurali). ARORA /
    # POLO PLUS arac markasi gercek ureticidir, SILINMEZ.
    {
        # Golf araci tipi, catisinda panel takili (siyah studyo zemin).
        "src": "motor-golf-panelli.png",
        "out": "motor-golf.webp",
        "crop": (0, 47, 1126, 891),
        "quality": 84,
    },
    {
        # Paket kutusu sol gorseli: cati + panel yakin, 4:3.
        "src": "motor-golf-panelli.png",
        "out": "motor-golf-kurulum.webp",
        "crop": (150, 50, 1110, 770),
        "quality": 84,
    },
    {
        # Kapali kabinli mini elektrikli arac (on-yan); dikey foto 4:3
        # tuvale ortalanir, kirpilsa govde kesilirdi.
        "src": "motor-mini-on.png",
        "out": "motor-mini.webp",
        "canvas": (960, 720, (247, 248, 248)),
        "quality": 84,
    },
    {
        # Yan gorunus — paket kutusunun sol gorseli (4:3 tuval). Kaynaktaki
        # sahte saydamlik damasi (cam arkasi dahil) beyaza cevrilmis hâlidir.
        "src": "motor-mini-yan.png",
        "out": "motor-mini-kurulum.webp",
        "canvas": (660, 495, (255, 255, 255)),
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
    if job.get("canvas"):
        w, h, bg = job["canvas"]
        im.thumbnail((w, h), Image.LANCZOS)
        cv = Image.new("RGB", (w, h), bg)
        px, py = (w - im.size[0]) // 2, (h - im.size[1]) // 2
        # Yanlardaki bosluk fotografin kenar sutunu uzatilarak doldurulur:
        # zemin tam beyaz degil (hafif gradyan), duz renk tuvalde fotografin
        # siniri dikey cizgi gibi gorunuyordu.
        if px > 0 and py == 0:
            cv.paste(im.crop((0, 0, 1, im.size[1])).resize((px, im.size[1])), (0, 0))
            rw = w - px - im.size[0]
            cv.paste(im.crop((im.size[0] - 1, 0, im.size[0], im.size[1])).resize((rw, im.size[1])), (px + im.size[0], 0))
        cv.paste(im, (px, py))
        im = cv
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
