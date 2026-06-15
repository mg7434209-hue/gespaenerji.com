# GESPA Enerji — Kurumsal Web Sitesi

Güneş enerjisi santralleri (GES) için anahtar teslim kurulum, mühendislik, finansman
ve bakım hizmetleri sunan **GESPA Enerji** firmasının statik kurumsal web sitesi.

## İçerik

- **Hero** — tanıtım ve hızlı istatistikler
- **Hizmetler** — Çatı GES, Arazi tipi GES, mühendislik, finansman, bakım, depolama
- **Süreç** — 4 adımlı anahtar teslim akışı
- **Hakkımızda** — firma tanıtımı
- **Referanslar** — hizmet verilen sektörler
- **İletişim** — keşif/teklif formu

## Teknoloji

Hiçbir bağımlılık gerektirmeyen saf **HTML + CSS + JavaScript**. Build adımı yok.

```
index.html          # Ana sayfa
assets/style.css     # Stiller (responsive)
assets/main.js       # Form ve etkileşimler
```

## Yerel Çalıştırma

`index.html` dosyasını tarayıcıda açmanız yeterlidir. Alternatif olarak basit bir sunucu:

```bash
python3 -m http.server 8000
# http://localhost:8000 adresini açın
```

## Yayınlama

Statik bir site olduğu için GitHub Pages, Netlify, Vercel veya herhangi bir statik
hosting üzerinde doğrudan yayınlanabilir.

## Not

İletişim formu şu an demo modundadır (istemci tarafı geri bildirim). Canlıda bir
backend / form servisine (ör. Formspree, Netlify Forms) bağlanması önerilir.
