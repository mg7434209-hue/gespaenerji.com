# Ödeme Yöntemi Logoları — iyzico başvuru şartı

iyzico canlı başvurusu, sitede **"iyzico ile Öde" + Visa + MasterCard**
logolarının görünmesini şart koşuyor. Bu eksik olduğu için başvuru
"Gerekli Kriterler Sağlanmadı" durumunda kaldı ve canlı işlemler
`errorCode 10208 · INVALID_MERCHANT_OR_SP` ile reddedildi.

## Beklenen dosya

| Dosya | İçerik |
|---|---|
| `iyzico-band.png` | iyzico + Visa + MasterCard logolarını içeren tek bant görseli |

Bant, **30 sayfanın tamamında** footer'da (telif satırının üstünde,
ortalı) görünür. Markup ve `.pay-logos` stili hazır — dosya bu klasöre
konduğu anda çalışır.

## Nereden alınır

iyzico'nun resmî logo paketi:
https://dev.iyzipay.com/tr/iyzico-logo-pack.zip

> Logolar Visa / Mastercard / iyzico'nun **tescilli markalarıdır**;
> yeniden çizilmez, yalnız resmî paketteki dosyalar kullanılır.

Footer koyu zeminlidir — paketteki **koyu zemine uygun (beyaz/açık)**
sürümü tercih edin.

## Ekleme adımları

1. Zip'i indirip bant görselini bu klasöre `iyzico-band.png` adıyla koyun.
2. Yükseklik CSS'te 28 px'e sabitlenir, genişlik orantılı ölçeklenir.
   Görselin en-boy oranı 340x28'den farklıysa sayfalardaki `width`/`height`
   özniteliklerini gerçek orana göre güncelleyin (CLS için ikisi de dolu olmalı).
3. `node build.js` çalıştırıp çıktıyı commit'leyin.
