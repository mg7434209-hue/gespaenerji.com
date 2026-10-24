#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ürün galerisi önizlemeleri (küçük resimler) — `<ad>-k.webp`.

Galerideki küçük resimler (.prod-thumbs) eskiden TAM BOY görseli indiriyordu:
bir ürün sayfasında ~300 KB, mobilde gereksiz. Bu betik her önizleme görselinin
240 px genişlikte kopyasını üretir; build.js `thumbify()` sayfada küçük resmi
`-k.webp`'e çevirir (tıklanınca ana görsel bağlantıdaki TAM BOY dosyadır).

Kullanım:  python3 tools/kucuk-resim.py      # eksik / eskimiş önizlemeleri üretir
Yeni galeri görseli eklenince çalıştırın; sonra node build.js.
"""
import glob, os, re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = 240
srcs = set()
for f in glob.glob(os.path.join(ROOT, "*.html")):
    html = open(f, encoding="utf-8").read()
    for block in re.findall(r'<div class="prod-thumbs[^"]*">(.*?)</div>', html, re.S):
        for s in re.findall(r'<img[^>]*\bsrc="(assets/[^"]+\.webp)"', block):
            if not s.endswith("-k.webp"):
                srcs.add(s)
n = 0
for s in sorted(srcs):
    src = os.path.join(ROOT, s)
    dst = src[:-5] + "-k.webp"
    if not os.path.exists(src):
        continue
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        continue
    im = Image.open(src).convert("RGB")
    if im.width > W:
        im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=74, method=6)
    n += 1
print("%d önizleme üretildi (%d galeri görseli)" % (n, len(srcs)))
