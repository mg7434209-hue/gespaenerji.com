#!/usr/bin/env python3
"""Üst menüyü (nav.menu) TÜM TR kaynak sayfalarda tek kaynaktan yazar.

Menü her sayfada elle kopyalı durur; bu betik onu tek yerden üretir, sayfalar
arasında sapma olmaz. Dil kopyaları (/en /de /ru) build'de üretildiği için
yalnız kök dizindeki TR sayfalar yazılır. Sonra: node build.js → npm test.

Menü (30 Eyl 2026):
  Ana Sayfa · Solar Sistemler (→ hizmetler.html, Tarımsal Sulama oradan) ·
  Elektrikli Araç Dönüşümü · Online Satış · Yapay Zekâ Ürünleri (→ merkez
  sayfa) · Araçlar (TEK açılır grup) · Projeler · Hakkımızda · Teklif Al

Etkin öğe sayfanın MEVCUT menüsünden okunur (eski açılır grup biçimi de
tanınır), böylece sayfaların kararı korunur. Araçlar grubu olduğu gibi
kopyalanır (etkin kartıyla). Yeni sayfa eklerken menüyü bir sayfadan
kopyalayıp etkin öğeyi elle ver, sonra bu betiği çalıştır.

Üst seviyeye öğe eklemek/etiket uzatmak GENİŞLİK KURALINA tabidir
(CLAUDE.md): 1261/1280/1411/1440/1581 px'te 4 dilde yeniden ölç.

Kullanım: python3 tools/menu-uret.py            (DRY-RUN)
          python3 tools/menu-uret.py --uygula   (yazar)
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APPLY = "--uygula" in sys.argv
NAV_RE = re.compile(r'<nav class="menu" id="menu"[^>]*>[\s\S]*?</nav>')
TOOLS_RE = re.compile(r'<div class="menu-group menu-tools">[\s\S]*?</div>\s*</div>')

# (anahtar, adres, etiket, ek öznitelik) — sıra menü sırasıdır; Araçlar
# grubu "tools" yer tutucusuyla araya girer.
ITEMS = [
    ("home", "index.html", "Ana Sayfa", ""),
    ("solar", "hizmetler.html", "Solar Sistemler", ""),
    ("ev", "elektrikli-arac-donusum.html", "Elektrikli Araç Dönüşümü", ' id="menuEv"'),
    ("online", "online-satis.html", "Online Satış", ""),
    ("ai", "yapay-zeka-urunleri.html", "Yapay Zekâ Ürünleri", ""),
    ("tools", None, None, None),
    ("projeler", "projeler.html", "Projeler", ""),
    ("hakkimizda", "hakkimizda.html", "Hakkımızda", ""),
]


def is_active(nav, key, href, label):
    """Düz bağlantıda class="active"; eski açılır grupta menu-parent active."""
    if key == "home":
        return 'class="menu-home active"' in nav
    if key == "ev":
        return 'id="menuEv" class="active"' in nav
    if re.search(r'<a href="' + re.escape(href) + r'"[^>]*\bclass="active"', nav):
        return True
    return re.search(r'<button class="menu-parent active"[^>]*><span>' + re.escape(label) + '</span>', nav) is not None


def build(nav, file):
    tools = TOOLS_RE.search(nav)
    assert tools, file + ": Araçlar grubu yok"
    i = "\n        "
    out = ['<nav class="menu" id="menu" aria-label="Ana menü">']
    for key, href, label, extra in ITEMS:
        if key == "tools":
            out.append(i + tools.group(0))
            continue
        on = is_active(nav, key, href, label)
        if key == "home":
            out.append(i + '<a href="index.html" class="menu-home' + (" active" if on else "") + '">' + label + "</a>")
        elif key == "ev":
            out.append(i + '<a href="' + href + '"' + extra + (' class="active"' if on else "") + " data-i18n-html>" + label + "</a>")
        else:
            out.append(i + '<a href="' + href + '"' + (' class="active"' if on else "") + ">" + label + "</a>")
    out.append(i + '<a href="iletisim.html" class="btn btn-sm">Teklif Al</a>')
    out.append("\n      </nav>")
    return "".join(out)


changed = 0
for p in sorted(ROOT.glob("*.html")):
    src = p.read_text()
    m = NAV_RE.search(src)
    if not m:
        continue
    assert len(NAV_RE.findall(src)) == 1, p.name
    new = src[:m.start()] + build(m.group(0), p.name) + src[m.end():]
    if new != src:
        changed += 1
        print(("YAZILDI " if APPLY else "değişir ") + p.name)
        if APPLY:
            p.write_text(new)
print(("uygulandı: " if APPLY else "DRY-RUN, değişecek: ") + str(changed) + " sayfa")
