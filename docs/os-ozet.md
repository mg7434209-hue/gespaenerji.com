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

## Sipariş defteri — kalıcı kopya (Gespa OS Postgres)
orders.json Volume yokken her dağıtımda silinir. Bu yüzden her sipariş durum
değişikliğinde (oluştu → ödendi/başarısız, e-posta hatası) kişisel verisi
ayıklanmış kayıt Gespa OS'e gönderilir: `POST <OS_INGEST_URL>/api/ingest/orders`,
başlık `X-Ingest-Token`. JARVIS siparişleri oradan okur.
- Tek dokunuş `writeOrder()` sonundaki `osScheduleSync()`: 1 sn sonra arka
  planda gönderir, HATA ATMAZ, ödeme yanıtını BEKLETMEZ. Başarısızsa dakikada
  bir yeniden dener; açılışta dosyada duran siparişler de gider.
- Kayıt başına `osSent` = gönderilen "durum|e-posta hatası" anahtarı. Gönderim
  sürerken durum değişirse anahtar tutmaz ve kayıt yeniden gider.
- Gönderilenler: ref (conversationId), kanal, durum, tarih, tutar, ödenen,
  açıklama, taksit, hata kodu, e-posta hatası var mı, kalemler (ad/adet/birim).
  **Ad, telefon, e-posta, il, adres, TCKN/VKN, firma GÖNDERİLMEZ** (test).
- Ayarlar: `OS_INGEST_URL` (Gespa OS adresi) + `OS_INGEST_TOKEN` (≥32 karakter,
  Gespa OS'teki `ORDER_INGEST_TOKEN` ile AYNI). İkisi yoksa defter kapalıdır;
  açılış logu "Gespa OS sipariş defteri: açık/kapalı" yazar.
