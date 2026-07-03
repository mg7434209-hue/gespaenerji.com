# GESPA Enerji — Kurumsal Web Sitesi

Güneş enerjisi santralleri (GES) için anahtar teslim kurulum, mühendislik, finansman
ve bakım hizmetleri sunan **GESPA Enerji** firmasının çok sayfalı, çok dilli kurumsal sitesi.

Saf **HTML + CSS + Vanilla JS**. Yayın: **Railway** (Node statik sunucu, canlı site)
ve **GitHub Pages** (ayna). Dil sayfaları (`/en` `/de` `/ru`) `build.js` ile üretilir.

## Sayfalar

| Sayfa | İçerik |
|---|---|
| `index.html` | Ana sayfa (hero, hizmetler, yeni ürün tanıtımı, hesaplayıcı CTA, projeler, yorumlar) |
| `hizmetler.html` | Çatı/arazi GES, depolama, mühendislik, finansman, O&M |
| `urunler.html` | Paket ürünler: taşınabilir off-grid kitler + tarımsal sulama paketleri |
| `su-isitici.html` | Yeni ürün: PV güneş su ısıtıcı (modeller + fiyatlar) |
| `hesaplayici.html` | Tasarruf hesaplayıcı + mühendislik alet çantası |
| `projeler.html` | Referans projeler + galeri |
| `tarimsal-sulama.html` | Güneş enerjili sulama + pompa seçim aracı |
| `hakkimizda.html` / `iletisim.html` | Kurumsal + teklif formu |
| `admin.html` | Fiyat yönetim paneli (şifreli; arama motorlarına kapalı) |

## Özellikler

- Çok dil: TR (kök) / EN / DE / RU — ayrı URL'ler, hreflang, istemci i18n
- Açık/koyu tema, mobil menü, scroll animasyonları
- Tasarruf hesaplayıcı + 5 mühendislik aracı (yerleşim, inverter, kablo, batarya, sıra aralığı)
- Paket ürünler ve su ısıtıcı fiyatları **tek kaynaktan** (`assets/config.js`)
- Admin panelinde fiyat düzenleme (cihazda önizleme + JSON dışa aktarma)
- SEO: sayfa başına canonical/OG, LocalBusiness/Product/FAQ JSON-LD, `sitemap.xml`, `llms.txt`
- WhatsApp entegrasyonu (teklif, hesaplayıcı sonucu paylaşımı) + sohbet botu

## Dosya yapısı

```
*.html                # TR kaynak sayfalar (kök)
en/ de/ ru/           # build.js çıktısı dil sayfaları (repoda tutulur)
assets/
  config.js           # TEK DOĞRU KAYNAK: iletişim, markalar, paketler, su ısıtıcı fiyatları, katsayılar
  main.js             # Tüm etkileşimler + config enjeksiyonu
  i18n.js             # Çeviri sözlüğü (EN/DE/RU)
  chatbot.js          # Akıllı asistan
  style.css           # Stiller (tema + responsive)
  img/                # Görseller (projeler, ürünler, galeri)
build.js              # Dil sayfası üreticisi (bağımlılıksız)
server.js             # Railway/Node statik sunucu (sıfır bağımlılık)
docs/hesaplayici-spec.md  # Hesaplayıcı formül spesifikasyonu
```

## Yerel çalıştırma

```bash
npm start        # build + sunucu → http://localhost:3000
npm run build    # sadece /en /de /ru dil sayfalarını üret
```

## Yayın

- **Railway (canlı)**: `claude/determined-albattani-ol20qb` dalına push → otomatik deploy.
- **GitHub Pages (ayna)**: `main` dalına push → `.github/workflows/deploy-pages.yml`.

## Özelleştirme

- İletişim, marka, paket ve fiyat bilgileri **yalnızca** `assets/config.js` içinde tutulur;
  sayfalara elle gömülmez.
- Fiyatları `admin.html` panelinden düzenleyip dışa aktarabilirsiniz; kalıcı yayın için
  değerler `config.js`'e işlenir.
- Admin şifresi: `config.js → admin.pass` (statik sitede yalnızca caydırıcıdır).
- İletişim/bülten formları talebi WhatsApp'a yönlendirir; istenirse bir form servisine bağlanabilir.
