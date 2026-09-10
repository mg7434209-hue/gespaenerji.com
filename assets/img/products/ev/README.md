# Elektrikli Araç Dönüşümü — Görseller

`elektrikli-arac-donusum.html` sayfası bu klasördeki **5 dosyayı** bekler.
Dosyalar eklenene kadar sayfada görsel yerleri boş görünür.

| Dosya | İçerik | Kullanıldığı yer |
|---|---|---|
| `ev-solar-banner.webp` | "Elektrikli Araçlarda Güneş Enerjisi" tanıtım görseli (golf aracı + ürün) | Tanıtım bandı + Open Graph paylaşım görseli |
| `boost-mppt-on.webp` | BOOST MPPT Charger — ön görünüm | Ürün galerisi (ana görsel) |
| `boost-mppt-acili.webp` | BOOST MPPT Charger — açılı görünüm | Ürün galerisi |
| `boost-mppt-yan.webp` | BOOST MPPT Charger — yan görünüm | Ürün galerisi |
| `ev-donusum-kurulum.webp` | Araca kurulum yapan teknisyen fotoğrafı | Kurulum bandı |

## Nasıl eklenir

1. Orijinal dosyaları (JPG/PNG fark etmez) `kaynak/` klasörüne koyun.
2. Yukarıdaki adlarla `.webp` türevlerini üretin — ya da orijinalleri
   koyup dönüşümü isteyin; `tools/foto-hazirla.py` desenine göre üretilir.
3. `node build.js` çalıştırın ve çıktıyı commit'leyin.

Önerilen ölçüler: banner ve kurulum fotoğrafı yatay (16:9, ~1600 px genişlik);
ürün fotoğrafları kare (~900×900), beyaz zemin.

> Kaynak dosyaları SİLMEYİN — türevler yeniden üretilebilsin.
