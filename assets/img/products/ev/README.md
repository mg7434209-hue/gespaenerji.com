# Elektrikli Araç Dönüşümü — Görseller

`elektrikli-arac-donusum.html` sayfasının görselleri.
Orijinaller `kaynak/` altında; `.webp` türevleri Pillow ile üretildi.

## Mevcut

| Dosya | İçerik | Kullanıldığı yer |
|---|---|---|
| `ev-solar-banner.webp` | "Elektrikli Güneş Enerjisi" tanıtım görseli (GESPA markalı) | Üst tanıtım bandı + Open Graph görseli |
| `ev-donusum-kurulum.webp` | Araca kurulum yapan teknisyen | Kurulum bandı |
| `boost-mppt-on.webp` | BOOST MPPT Charger — ön görünüm | Ürün galerisi (ana görsel) |
| `boost-mppt-acili.webp` | BOOST MPPT Charger — açılı görünüm | Ürün galerisi |

## Eksik

| Dosya | İçerik | Gelince ne yapılacak |
|---|---|---|
| `boost-mppt-yan.webp` | Ürün — yan görünüm (gövde profili, montaj deliği) | Galeriye 3. küçük resim olarak eklenir |

Galeri şu an iki açıyla çalışıyor; sayfada kırık görsel yoktur.

## Ekleme adımları

1. Orijinali `kaynak/` altına koyun.
2. Yukarıdaki adla `.webp` türevini üretin (ürün görselleri ~900 px, q86).
3. `node build.js` çalıştırıp çıktıyı commit'leyin.

> Kaynak dosyaları SİLMEYİN — türevler yeniden üretilebilsin.
