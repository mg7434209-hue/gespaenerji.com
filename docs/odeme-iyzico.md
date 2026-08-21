# Ödeme Altyapısı — iyzico Ödeme Formu

> `assets/config.js` -> `payment` · `lib/iyzico.js` · `lib/orders.js` · `lib/checkout.js`
> Sayfalar: `sepet.html` · `odeme-sonuc.html` · `mesafeli-satis-sozlesmesi.html` · `teslimat-iade.html`

Kartla ödeme **iyzico Ödeme Formu** (Checkout Form) ile alınır: kullanıcı iyzico'nun
3D Secure'lü sayfasına yönlendirilir, **kart bilgisi sunucumuza HİÇ gelmez**.
- `lib/iyzico.js` — bağımlılıksız IYZWSv2 (HMAC-SHA256) istemcisi: initialize +
  retrieve. İmza `randomKey + uriPath + JSON.stringify(body)` üzerinden üretilir ve
  imzalanan dize aynen gönderilir (resmî `iyzipay` paketiyle birebir doğrulandı).
- `lib/orders.js` — HER sipariş (havale/kapıda/kart) `DATA_DIR/orders/<KOD>.json`'a
  yazılır + `index.jsonl` özeti. Kod: `GES-XXXXXX-8HEX`. Railway'de **Volume şart**,
  yoksa siparişler dağıtımda silinir. Kart verisi burada ASLA tutulmaz.
- `lib/checkout.js` — uçlar: `GET /api/odeme` · `POST /api/siparis` ·
  `POST /odeme/callback` · `GET /api/siparis-durumu`.
- **ALTIN KURAL:** tutar istemciden kabul EDİLMEZ. Sepetten yalnız `{id, qty}` gelir;
  fiyat `config.js`'ten sunucuda hesaplanır (`priceOf` = main.js `pkgUnit` ile birebir;
  birini değiştirirsen ikisini birden değiştir). Callback'te iyzico'nun tahsil ettiği
  tutar sipariş tutarıyla karşılaştırılır, uyuşmazsa sipariş `basarisiz` işaretlenir.
- Ödeme yöntemine göre tutar: havale = `cartDiscountPct` indirimli · kapıda ve
  **kart = liste fiyatı** (kartta havale indirimi YOKTUR).
- Anahtarlar KODA YAZILMAZ, ortam değişkeni: `IYZICO_API_KEY` `IYZICO_SECRET_KEY`
  `IYZICO_URI` (boşsa sandbox) · `SITE_URL` (callback adresi) · `DATA_DIR`.
  Anahtar yoksa `/api/odeme` `enabled:false` döner ve sepette kart seçeneği
  "çok yakında" olarak kapalı kalır — GitHub Pages aynasında da böyle olur
  (orada API yoktur; sepet eski WhatsApp akışına düşer).
- `odeme-sonuc.html` noindex + robots engelli + sitemap dışı. Metnini main.js
  dört dilde yazar; bu yüzden `.pay-result` i18n SKIP listesindedir — ELLE ÇEVİRME.
- Yasal zorunluluk: `mesafeli-satis-sozlesmesi.html` ve `teslimat-iade.html`
  sepetteki onay kutusuna bağlıdır. Ticari değerler (`shipDays`/`returnDays`/
  `shipCountry`) bu sayfalara `data-com="..."` ile build'de basılır — elle yazma.
- `server.js` kaynak dosyaları ve `data/` dizinini servis ETMEZ (`PRIVATE_RE`).

## Akış

1. Sepette form doldurulur, yöntem seçilir, sözleşme onay kutusu işaretlenir.
2. `POST /api/siparis` — sunucu ürünleri ve tutarı `config.js`'ten yeniden hesaplar,
   siparişi `DATA_DIR/orders/<KOD>.json` dosyasına yazar.
3. Havale/kapıda ise sipariş kodu döner, istemci WhatsApp mesajını açar, sepet boşalır.
   Kartlı ise iyzico `paymentPageUrl` döner ve tarayıcı oraya yönlendirilir.
4. Kullanıcı iyzico'nun 3D Secure sayfasında öder; iyzico `POST /odeme/callback`
   adresine `token` bırakır.
5. Sunucu token'ı iyzico'ya sorar (`retrieveCheckoutForm`), `paymentStatus === "SUCCESS"`
   VE tahsil edilen tutar = sipariş tutarı ise sipariş `odendi` olur; aksi hâlde
   `basarisiz`. Callback tekrarlarsa zaten `odendi` olan sipariş yeniden işlenmez.
6. Tarayıcı `/odeme-sonuc.html?durum=...&kod=...` sayfasına döner. Adres çubuğundaki
   `durum` yalnız ön gösterimdir; sayfa nihai durumu `/api/siparis-durumu`'ndan okur.

## Sınırlar / dikkat

- `GET /api/siparis-durumu` kişisel veri döndürmez (ad yalnız ilk isim; telefon,
  e-posta ve adres dışarı verilmez).
- `POST /api/siparis` IP başına dakikada 12 istekle sınırlıdır; gövde 64 KB tavanlıdır.
- Sipariş kodu yol adı olarak kullanılmadan önce biçim denetiminden geçer
  (`orders.isCode`), böylece dizin dışına çıkılamaz.
- Taksit açmak için hem `config.payment.installments` hem iyzico paneli güncellenmeli.
- iyzico `buyer.identityNumber` alanını zorunlu tutar ama standart e-ticarette
  doğrulamaz; TC kimlik numarası TOPLANMAZ, yer tutucu gönderilir
  (`config.payment.identityNumber` ile ezilebilir).
