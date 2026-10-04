# Gespa OS özeti — `/api/os/summary`

Gespa OS'teki JARVIS (komuta asistanı) siteyi bu TEK uçtan "kontrol" eder.
Uç YALNIZ OKUR; hiçbir şey yazmaz. Yönetim (fiyat, stok, kampanya değişikliği)
JARVIS'te onay adımlı olarak GitHub PR'ı üzerinden yapılır, bu uçtan değil.

## Erişim
- `GET /api/os/summary`, başlık `X-OS-Token: <OS_TOKEN>`.
- `OS_TOKEN` YALNIZ Railway ortam değişkenidir, en az 32 karakter; Gespa OS'teki
  `GESPA_OS_TOKEN` ile AYNI değer. Tanımlı değilse (ya da kısaysa) uç 503 döner.
- Yönetici şifresi (`ADMIN_PASS`) bu uçta KABUL EDİLMEZ; JARVIS'in anahtarı sızsa
  da yönetim uçları açılmaz. POST 405 döner (test denetler).

## İçerik
- `orders`: son 30 günün siparişleri (en çok 50): referans, kanal (`sepet` /
  `link`), durum, tarih, tutar, kalemler (ad + adet). **Alıcı bilgisi (ad,
  telefon, e-posta, adres, TCKN/VKN) ÇIKMAZ** — test kişisel veri içeren bir
  sipariş yazıp yanıtta aramaz. Volume yoksa orders.json dağıtımda silinir;
  `dataPersistent:false` bunu söyler.
- `qa`: onay bekleyen soru-cevap sayısı ve ilk 20'si (görünen ad + 200 karakter).
- `visitors`, `aiBots` (ilk 10), `fx` (uygulanan kur), `pay` (kart/e-posta açık mı).
- `catalog`: config.packages'ten ürün listesi (liste fiyatı ₺ uygulanan kurla,
  stok, görsel var mı) ve uyarılar: `no_price`, `no_image`, `low_stock` (≤3),
  `out_of_stock`, `campaign_ending` (3 günden az), `old_price_without_campaign`
  (kampanya bitmiş ama `oldPrice` duruyor — site zaten gizler, temizlik notu).

Yeni alan eklerken: kişisel veri EKLEME; testteki sızıntı listesine bak.
