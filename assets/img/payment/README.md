# Ödeme Yöntemi Logoları — iyzico başvuru şartı

iyzico canlı başvurusu, sitede **"iyzico ile Öde" + Visa + MasterCard**
logolarının görünmesini şart koşuyor. Bu eksik olduğu için başvuru
"Gerekli Kriterler Sağlanmadı" durumunda kalmış ve canlı işlemler
`errorCode 10208 · INVALID_MERCHANT_OR_SP` ile reddedilmişti.

## Yayındaki dosya

| Dosya | İçerik |
|---|---|
| `iyzico-band.webp` | iyzico ile Öde · mastercard · VISA · American Express · troy (912×64, kayıpsız WebP, 8.7 KB) |

Bant **30 sayfanın tamamında** footer'da, telif satırının üstünde ortalı
görünür (`.pay-logos`, yükseklik 28 px / mobilde 22 px).

## Kaynak

iyzico resmî logo paketi → `footer_iyzico_ile_ode/White/`
(`kaynak/` altında SVG ve @2x PNG olarak saklanıyor).

Footer zemini `#0a1512` — tema bağımsız koyu — bu yüzden **White**
sürüm kullanıldı. Renkli sürüm açık zeminli bir yerleşim için
gerekirse pakette `Colored/` altında.

> Logolar Visa / Mastercard / iyzico / Amex / troy'un **tescilli
> markalarıdır**; yeniden çizilmez, yalnız resmî paketteki dosyalar
> kullanılır. Türev üretilecekse `kaynak/` altındaki dosyalardan üretin.

## Türevi yeniden üretmek

```python
from PIL import Image
im = Image.open("kaynak/logo_band_white@2x.png").convert("RGBA")
im.save("iyzico-band.webp", "WEBP", lossless=True, method=6)
```

Sonra `node build.js` çalıştırıp çıktıyı commit'leyin.
