# Elektrikli Araç Dönüşümü — Görseller

`elektrikli-arac-donusum.html` sayfasının görselleri.

## Mevcut

| Dosya | İçerik | Kullanıldığı yer |
|---|---|---|
| `ev-donusum-kurulum.webp` | Araca kurulum yapan teknisyen | Üst tanıtım bandı + Open Graph görseli |
| `boost-mppt-on.webp` | BOOST MPPT Charger — ön görünüm | Ürün galerisi (ana görsel) |
| `boost-mppt-acili.webp` | BOOST MPPT Charger — açılı görünüm | Ürün galerisi |

Orijinal PNG'ler `kaynak/` altında; türevler Pillow ile üretildi
(kurulum 1600 px / q82, ürünler 900 px / q86).

## Eksik — gelince eklenecek

| Dosya | İçerik | Gelince ne yapılacak |
|---|---|---|
| `ev-solar-banner.webp` | "Elektrikli Araçlarda Güneş Enerjisi" tanıtım görseli | Üst tanıtım bandına ve OG görseline geri alınır; kurulum fotoğrafı kendi bandına döner |
| `boost-mppt-yan.webp` | Ürün — yan görünüm | Galeriye 3. küçük resim olarak eklenir |

Bu iki görsel gelene kadar sayfada **kırık görsel yoktur**: üst bant kurulum
fotoğrafını kullanır, galeri iki açıyla çalışır.

## Ekleme adımları

1. Orijinali `kaynak/` altına koyun.
2. Yukarıdaki adla `.webp` türevini üretin.
3. `node build.js` çalıştırıp çıktıyı commit'leyin.

> Kaynak dosyaları SİLMEYİN — türevler yeniden üretilebilsin.
