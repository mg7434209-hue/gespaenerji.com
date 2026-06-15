# GESPA Enerji — Kurumsal Web Sitesi

Güneş enerjisi santralleri (GES) için anahtar teslim kurulum, mühendislik, finansman
ve bakım hizmetleri sunan **GESPA Enerji** firmasının kurumsal web sitesi.

Saf **HTML + CSS + JavaScript** (build adımı yok). İki şekilde yayınlanabilir:
GitHub Pages (statik) **veya** Railway (Node sunucusu).

## Özellikler

- Açık / koyu tema (tercih hatırlanır)
- Mobil uyumlu, çalışan hamburger menü
- Scroll ile beliren animasyonlar + animasyonlu istatistik sayaçları
- **Güneş enerjisi tasarruf hesaplayıcı** (sistem gücü, yıllık tasarruf, geri ödeme, CO₂)
- Filtrelenebilir proje galerisi
- Müşteri yorumları slider'ı
- SSS akordeon
- Blog/haberler bölümü
- Gelişmiş iletişim formu + bülten aboneliği
- SEO: Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`, favicon
- WhatsApp ve "başa dön" hızlı butonları

## Dosya yapısı

```
index.html            # Tek sayfalık zengin site
assets/
  style.css           # Stiller (tema + responsive)
  main.js             # Tüm etkileşimler
  favicon.svg
server.js             # Railway/Node için statik sunucu (sıfır bağımlılık)
package.json          # start script: node server.js
railway.json          # Railway dağıtım yapılandırması
robots.txt, sitemap.xml
.github/workflows/    # GitHub Pages otomatik dağıtım
```

## Yerel çalıştırma

```bash
# Seçenek 1 — Node sunucusu (Railway ile aynı)
npm start
# http://localhost:3000

# Seçenek 2 — sadece dosyayı aç
# index.html dosyasını tarayıcıda açın
```

## Railway'e dağıtım

1. https://railway.com → **New Project** → **Deploy from GitHub repo**
2. `mg7434209-hue/gespaenerji.com` deposunu ve dağıtım branch'ini seçin.
3. Railway `package.json`'ı algılar, `npm start` ile `server.js`'i çalıştırır.
4. **Settings → Networking → Generate Domain** ile bir URL alın.
5. Sunucu `process.env.PORT`'u otomatik kullanır — ek ayar gerekmez.

## Özelleştirme

- Firma adı, telefon (`+90 850 000 00 00`), e-posta ve adres bilgilerini `index.html` içinde güncelleyin.
- Hesaplayıcı katsayıları (`COST_PER_KWP`, `CO2_PER_KWH`, birim fiyat) `assets/main.js` içindedir.
- İletişim/bülten formları şu an demo modundadır; canlıda bir form servisine (Formspree, kendi API'niz) bağlanması önerilir.
