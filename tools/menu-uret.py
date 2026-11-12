#!/usr/bin/env python3
"""Üst menüyü (nav.menu) TÜM TR kaynak sayfalarda tek kaynaktan yazar.

Menü her sayfada elle kopyalı durur; bu betik onu tek yerden üretir, sayfalar
arasında sapma olmaz. Dil kopyaları (/en /de /ru) build'de üretildiği için
yalnız kök dizindeki TR sayfalar yazılır. Sonra: node build.js → npm test.

Menü (26 Eki 2026, CRO kararı — işletme):
  Mağaza · Çatı & Arazi GES · Tarımsal Sulama · Elektrikli Araç ·
  Referanslar · Hakkımızda · [Ücretsiz Keşif → WhatsApp]
  "Ana Sayfa" (logo götürür), "Yapay Zekâ Ürünleri" ve "Araçlar" açılır
  grubu menüden KALKTI; alt bilgi "Kurumsal" sütununda dururlar. Keşif
  düğmesi `data-wa-kesif` taşır: build.js hydrateContact wa.me adresini
  config.topbar.kesifMsg ile yazar, main.js dilde yeniler.

Etkin öğe DOSYA ADINDAN belirlenir (active_for): mağaza ürün sayfaları
(data-pkg-detail) Mağaza'yı, paket-motor-* Elektrikli Araç'ı, proje-* 
Referanslar'ı işaretler.

Üst seviyeye öğe eklemek/etiket uzatmak GENİŞLİK KURALINA tabidir
(CLAUDE.md): 1261/1280/1411/1440/1581 px'te 4 dilde yeniden ölç.

Kullanım: python3 tools/menu-uret.py            (DRY-RUN)
          python3 tools/menu-uret.py --uygula   (yazar)
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APPLY = "--uygula" in sys.argv
NAV_RE = re.compile(r'<nav class="menu" id="menu"[^>]*>[\s\S]*?</nav>')
KESIF_RE = re.compile(r'<a href="(https://wa\.me/[^"]*)" class="btn btn-sm" data-wa-kesif')

ITEMS = [
    ("online-satis.html", "Mağaza"),
    ("hizmetler.html", "Çatı &amp; Arazi GES"),
    ("tarimsal-sulama.html", "Tarımsal Sulama"),
    ("elektrikli-arac-donusum.html", "Elektrikli Araç"),
    ("projeler.html", "Referanslar"),
    ("hakkimizda.html", "Hakkımızda"),
]


def active_for(f, src):
    if f in ("hizmetler.html", "cati-ges.html", "arazi-ges.html", "bakim-izleme.html", "enerji-depolama.html"):
        return "hizmetler.html"
    if f.startswith("tarimsal"):
        return "tarimsal-sulama.html"
    if f == "elektrikli-arac-donusum.html" or f.startswith("paket-motor"):
        return "elektrikli-arac-donusum.html"
    if f in ("online-satis.html", "urunler.html", "sepet.html") or "data-pkg-detail" in src:
        return "online-satis.html"
    if f == "projeler.html" or f.startswith("proje-"):
        return "projeler.html"
    if f == "hakkimizda.html":
        return "hakkimizda.html"
    return None


def build(nav, file, src):
    act = active_for(file, src)
    m = KESIF_RE.search(nav)
    kesif = m.group(1) if m else "https://wa.me/905437434209"
    i = "\n        "
    out = ['<nav class="menu" id="menu" aria-label="Ana menü">']
    for href, label in ITEMS:
        out.append(i + '<a href="' + href + '"' + (' class="active"' if href == act else "") + ">" + label + "</a>")
    out.append(i + '<a href="' + kesif + '" class="btn btn-sm" data-wa-kesif target="_blank" rel="noopener">Ücretsiz Keşif</a>')
    out.append("\n      </nav>")
    return "".join(out)


changed = 0
for p in sorted(ROOT.glob("*.html")):
    src = p.read_text(encoding="utf-8")
    m = NAV_RE.search(src)
    if not m:
        continue
    assert len(NAV_RE.findall(src)) == 1, p.name
    new = src[:m.start()] + build(m.group(0), p.name, src) + src[m.end():]
    if new != src:
        changed += 1
        print(("YAZILDI " if APPLY else "değişir ") + p.name)
        if APPLY:
            p.write_text(new, encoding="utf-8")
print(("uygulandı: " if APPLY else "DRY-RUN, değişecek: ") + str(changed) + " sayfa")
