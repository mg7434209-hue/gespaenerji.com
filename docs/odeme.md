# Ödeme (iyzico / tami), sipariş e-postaları ve dekont

> CLAUDE.md "Ödeme" bölümünden `@` ile içe aktarılır.
> Sunucu `server.js` · sepet `sepet.html` + main.js sepet IIFE'si ·
> link ödemesi `odeme.html` · sonuç/dekont `odeme-sonuc.html` · araçlar `admin.html`.

## iyzico entegrasyonu
Kart ödemesi server.js'te bağımlılıksız iyzico Ödeme Formu entegrasyonudur:
- `/api/pay/status`: `{enabled, mail, store}` (kart açık mı, SMTP var mı,
  veri kalıcı mı; yalnız boolean).
- `/api/pay/checkout`: sepet → iyzico sayfası. Tutar SUNUCUDA config'ten
  hesaplanır, istemci fiyatı yok sayılır. Kart ödemesinde havale indirimi YOK
  (liste fiyatı, `pkgListTL`). Fiyatlar kura bağlı olduğu için sepet,
  gördüğü tutarı `expectTL` ile gönderir; sunucunun tutarı farklıysa (kur
  sayfa açıkken değişti) 409 + `reload` döner, ödeme başlamaz, sayfa yenilenir
  (CLAUDE.md "Döviz kuru").
- `/api/pay/custom`: `odeme.html` serbest tutar (aşağıda).
- `/api/pay/callback`: iyzico dönüşü → `odeme-sonuc.html`.
- Anahtarlar YALNIZCA Railway ortam değişkeni: `IYZIPAY_API_KEY` /
  `IYZIPAY_SECRET_KEY` / `IYZIPAY_BASE_URL` (sandbox varsayılan; canlı =
  https://api.iyzipay.com). `IYZICO_*` adlandırması da kabul edilir (firma
  "iyzico", API alan adı "iyzipay", panelde karışıyor); `IYZIPAY_*` tanımlıysa
  o önceliklidir. Anahtar yoksa sepetteki kart seçeneği "çok yakında" kalır
  (Pages aynasında da böyle).
- Siparişler `DATA_DIR/orders.json`. `odeme-sonuc.html` ve `odeme.html`
  noindex + robots engelli + build PAGES dışı (TR tek dil).

## Fatura kimliği: TCKN ya da VKN
YALNIZ SEPET ÖDEMESİNDE sorulur (`/api/pay/checkout`, zorunlu). Link ödemesi
(`odeme.html` → `/api/pay/custom`) kimlik İSTEMEZ: işletme kararı, 28 Eyl
2026. Tutar elle girilen GES Marketim siparişidir, fatura bilgisi orada.
Sunucu iyzico'nun zorunlu `identityNumber` alanına `IYZ_ID_FALLBACK` yazar;
eski bir sayfadan geçerli TCKN/VKN gelirse onu kullanır, geçersizini yok
sayar. İşletme e-postasında satır "(link ödemesi, istenmedi)" olur.
`odeme.html`'e kimlik alanı GERİ EKLENMEZ (test denetler).

Kimlik alanı iki türü alır. Tek kural server.js `invoiceId(buyer)`:
- **11 hane** → şahıs, T.C. kimlik no. iyzico `identityNumber` = TCKN.
- **10 hane** → şirket, vergi kimlik no (VKN). **Firma unvanı ve vergi
  dairesi ZORUNLU** (`firma`, `vd`; e-fatura alanları). iyzico'nun
  `identityNumber` alanı KİŞİNİN TCKN'sini beklediği için şirket ödemesinde
  iyzico'nun kabul ettiği yedek değer `IYZ_ID_FALLBACK` ("11111111111")
  gönderilir; fatura adresinin `contactName`'i firma unvanı olur. VKN yalnız
  bizim sipariş kaydımızda ve işletme e-postasında durur.
- Başka uzunluk → 400 ve açıklayıcı hata.
- Eskiden yalnız 11 hane kabul ediliyordu; şirketler vergi numarasıyla
  ödeyemiyordu (28 Eyl 2026).
- İstemci: sepette `#payTcknRow` + `#payCorpRow` (main.js `syncCorp()`).
  10 hane girilince firma/vergi dairesi alanları açılır ve zorunlu olur,
  11 hanede gizlenir.
- `orders.json` buyer: `tckn` YA DA `vkn` + `vd` + `firma`. İşletme e-postası
  şirkette "Fatura tipi: Kurumsal", unvan, vergi dairesi, vergi no ve yetkili
  adını yazar. Dekont uç noktası firma unvanını döndürür, kimlik/vergi
  numarasını DÖNDÜRMEZ.
- KVKK: TCKN/VKN log'a ASLA yazılmaz; yalnız sipariş kaydında ve işletme
  e-postasında durur. Müşteri e-postasına yazılmaz.

## Tutar sınırları (tek kaynak `config.commerce`)
- `payLinkMinTL` / `payLinkMaxTL` (50 – 500.000 ₺): bizim link ödemesi
  sınırımız. server.js `payLimits()` (custom + installments) ve admin
  kartları buradan okur; elle rakam gömme.
- `cardMaxTL` (şu an 350.000 ₺): **iyzico HESABININ tek işlem limiti**.
  Bizim sınırımız değildir; aşan tutarı iyzico reddeder (28 Eyl 2026: limit
  100.000 ₺ iken ₺120.000'lik ödeme geçmedi, iki çekime bölündü; aynı gün
  iyzico limiti 350.000 ₺'ye yükseltti). Kartla ödenen HER tutar buna tabidir:
  - server.js `cardLimitError()`: checkout (sepet toplamı) ve custom (tutar)
    aşan tutarı iyzico'ya GÖNDERMEDEN 400 ile reddeder, havale/EFT önerir.
  - Sepet: kart seçiliyken liste toplamı sınırı aşarsa `#payCardMax` uyarısı
    4 dilde görünür ve gönderim durur (main.js `totals()` → `overCard`).
  - `odeme.html`: tutar alanının altında `#payMaxHint` sınırı yazar, aşan
    tutar gönderilmeden uyarılır.
  - admin "🔗 Ödeme Bağlantısı Üret": üst sınır `min(payLinkMaxTL, cardMaxTL)`.
  - Sınır TAKSİTSİZ tutara uygulanır. Müşteri iyzico sayfasında taksit seçer
    ve vade farkı toplamı sınırın üstüne taşırsa ret yine iyzico'dan gelir
    (`iyzFail` → errorMessage + kod).
  - iyzico limiti yükseltilince SADECE `cardMaxTL` güncellenir (0 = sınır
    yok) + `node build.js`. Limit iyzico panelinden/desteğinden yükseltilir,
    koddan DEĞİL.

## Link ödemesi (`odeme.html`)
GES Marketim / serbest tutar: `?t=tutar&a=aciklama&s=no&tek=1|&tks=N`
ön-doldurur → `/api/pay/custom`. Tutar istemciden gelir; sınır sunucuda,
**kuruş kabul edilir**, kargo öncesi orders.json/iyzico panelinden tutar
DOĞRULANIR. Form ad, telefon, e-posta, il ve adres ister; T.C. kimlik/vergi
no İSTEMEZ (yukarıda "Fatura kimliği").

TUTAR OKUMA (`parseTL`, 30 Eyl 2026): Türkçe yazım esastır. "120.000" =
120 bin ₺, "1.250,50" = 1.250,50 ₺; noktayla ayrılmış tam 3'lü gruplar
binlik ayırıcıdır. Bağlantıdaki `t=` JS sayısıdır ("19906.62") ve öyle
okunur; hazır tutar sayfada Türkçe biçimde görünür ("19.906,62"). Eskiden
"120.000" 120 ₺ okunuyordu: admin `t=120` üretiyor, ödeme sayfası iyzico'ya
120 ₺ gönderiyordu. Fonksiyon `odeme.html` ve `admin.html`'de AYNIDIR, test
iki kopyayı karşılaştırır. Admin kartı okunan tutarı "Bağlantıdaki tutar"
satırında gösterir; tutar alanları bu yüzden `type=number` DEĞİLDİR.

TAKSİT: iyzico hesabı vade farkını MÜŞTERİYE yansıtıyor: ₺20.000 gönderince
kartından ₺20.093,81 çekiliyor.
- `tek=1` → `enabledInstallments:[1]` (tek çekim, tutar tam tahsil edilir).
- `tks=N` → `enabledInstallments:[N]` (yalnız N taksit; sabitlenmezse müşteri
  başka taksit seçer ve geri hesaplanan tutar tutmaz).
- `/api/pay/installments` iyzico'nun KENDİ oranlarını okur (salt okunur, ödeme
  akışına dokunmaz); admin'deki "💳 Taksit farkı ve yuvarlama" kartı bununla
  "tam ₺X tahsil etmek için ne göndermeli"yi hesaplar (en YÜKSEK orana göre,
  müşteri hedeften fazla ödemez). Kalıcı çözüm iyzico panelinde vade farkını
  müşteriye yansıtmayı KAPATMAKTIR; o zaman bu araç gereksizdir.

Bağlantıyı ÜRETEN araç `admin.html`'deki "🔗 Ödeme Bağlantısı Üret" kartıdır
(tutar/açıklama/sipariş no/taksit → kopyala · WhatsApp · önizle; `payLink()`).
Adres `config.company.web`'den kurulur: `/api/pay/*` yalnız Railway'de vardır,
Pages aynasında yoktur; `location.origin` kullanılsa Pages'ten üretilen
bağlantı ölür. Kart ödemesi kapalıysa kart bunu bağlantı gönderilmeden ÖNCE
uyarır. Menüden erişilmez, robots'ta engellidir; site genelinde bağlantısı
YOKTUR, adresi elle yazılır.

## Sipariş e-postaları
Ödeme BAŞARILI olunca (`/api/pay/callback`) **iki** e-posta gider, ARDIŞIK
(tek SMTP oturumu):
1. İşletmeye tam döküm (`orderMailBody()`): müşteri bilgileri, **fatura
   kimliği** (TCKN ya da şirket unvanı + vergi dairesi + VKN), kalemler,
   tutar, iyzico ödeme numarası.
2. Müşteriye ödeme onayı + dekont bağlantısı (`customerMailBody()`). KVKK
   gereği TCKN/VKN ve açık adres YAZILMAZ, e-posta iletilebilir. Müşteri
   adresi yoksa ya da `info@gespaenerji.com` yedeğine düşmüşse atlanır.
   Sonunda ÖDÜLSÜZ Google yorum isteği durur (`company.googleReview`);
   dekont sayfasında da aynı istek vardır, yazdırmada gizlenir.

- Gönderici server.js içinde bağımlılıksız SMTP istemcisidir (`sendMail(to, …)`);
  465 örtük TLS ve 587 STARTTLS yolları sahte SMTP sunucusuyla uçtan uca test edildi.
- Callback ÖNCE yönlendirir, postaları SONRA gönderir ve hepsi try/catch
  içindedir: burası iyzRequest geri çağrısıdır, ana try/catch'in DIŞINDA;
  korumasız bir istisna sunucu sürecini düşürürdü.
- TEŞHİS: `/api/pay/status` → `mail:false` = Railway değişkenleri yok. Admin'deki
  "✉️ Sipariş e-postası" kartı bunu gösterir ve `/api/pay/mailtest` ile canlı
  sipariş beklemeden test postası gönderir (yönetici şifresi: `ADMIN_PASS`; dakikada 1
  istek; alıcı YALNIZ ORDER_EMAIL_TO, serbest alıcı kabul edilmez). Gönderim
  hatası orders.json'a `mailErr` yazılır.
- Ayarlar YALNIZCA Railway ortam değişkeni, parola repoya ASLA yazılmaz:
  `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `ORDER_EMAIL_TO`.
  Gmail'de normal parola çalışmaz, **Uygulama Şifresi** gerekir.
- Ayar eksikse e-posta sessizce atlanır; ödeme akışı ETKİLENMEZ. Müşteri
  bekletilmez: yönlendirme hemen yapılır, e-posta arka planda gider.
- SNI yalnız alan adıyla gönderilir; host IP ise `servername` verilmez,
  verilirse TLS el sıkışması hata bile vermeden askıda kalır.

## Dekont (`odeme-sonuc.html`)
- Adres: `odeme-sonuc.html?d=ok&r=<rid>#k=<belirteç>`. Callback yönlendirmesi,
  işletme e-postası ve müşteri e-postası AYNI adresi yazar (`receiptUrl()`).
  iyzico token'ı adres çubuğuna DÜŞMEZ.
- DEKONT BELİRTECİ (`#k=`): dekont bilgisi bağlantının İÇİNDE, şifreli taşınır;
  sunucu kaydı GEREKMEZ. Neden: Volume yokken orders.json her dağıtımda
  siliniyordu; 28 Eyl 2026'da öğlen alınan bir ödemenin dekontu, yarım saat
  sonraki dağıtımdan sonra "yüklenemedi" dedi (o bağlantıda yalnız `r` vardı,
  kurtarılamadı).
  - Biçim (server.js `receiptSeal()`/`receiptOpen()`): `0x01` + iv(12) +
    GCM etiketi(16) + AES-256-GCM(deflateRaw(JSON)), base64url. Anahtar =
    HMAC-SHA256(iyzico gizli anahtarı, "gespa-dekont-v1"): dağıtımlar arasında
    sabit, repoda YOK. iyzico anahtarı değişirse eski belirteçler açılmaz.
  - İçerik `receiptData()`: sipariş no, tarih, tutarlar, ödeme no, açıklama,
    referans, ödeyen adı/il/firma, kalemler. TCKN/VKN, açık adres, telefon,
    e-posta GİRMEZ. Şifreli olduğu için ad adres çubuğunda ve analitikte açık
    görünmez; GCM etiketi sahte dekontu engeller (test bozuk belirteci dener).
  - Fragment'tadır: sunucuya yalnız `POST /api/order/receipt {r, k}` gövdesinde
    gider, log'lara ve Referer'a düşmez. Uç nokta önce `r` ile kaydı arar
    (Volume varsa esas odur), bulamazsa belirteci açar. `GET ?r=` belirteçsiz
    eski bağlantılar için durur.
  - Uzunluk: link ödemesinde ~330, hazır paketli sepette ~600 karakter.
- Uç nokta TCKN/VKN, açık adres, telefon ve e-posta DÖNDÜRMEZ; şirket
  ödemesinde "Ödeyen" satırına firma unvanı önce yazılır.
- SAAT: e-posta (`trTime()`) ve dekont sayfası Türkiye saatini yazar
  (`Europe/Istanbul`). Railway UTC çalışır; saat dilimi verilmeyince 3 saat
  geri görünüyordu.
- ÖNBELLEK: çekilen dekont tarayıcıda `localStorage` `gespa-dekont-<rid>`
  anahtarına da yazılır. Kayıt, belirteç ve önbellek yoksa `#rcMissing` notu
  görünür (ödeme alındı, onay e-postası kayıttır, dekont WhatsApp'tan
  istenir); sayfa yine çalışır.
- YAZDIRMA: sayfa `<body class="print-receipt">` taşır; `@media print`
  kuralları bu sınıfla sınırlıdır. Kâğıda YALNIZ `.receipt` kartı basılır,
  sayfanın en üstünden başlar: `body`nin `main` dışındaki çocukları,
  `#payOk` içinde dekont dışındaki her şey ve `#payFail` gizlenir. Renkler
  siyah/gri sabittir, arka plan beyazdır: tarayıcı arka plan grafiklerini
  varsayılan olarak basmaz, koyu temanın açık yazıları beyaz kâğıtta
  kayboluyordu. `@page{margin:12mm}`.
- YAZDIRMA TUZAĞI: dekont kartına `break-inside:avoid` KOYMA. Eskiden başlık
  ve açıklama da basılıyordu; kart "bölünmesin" diye 2. sayfaya itilince 1.
  sayfa yalnız başlıkla boş çıkıyordu (28 Eyl 2026 şikâyeti).
- UYARI: veri klasörü bir Railway **Volume** üzerinde değilse orders.json her
  dağıtımda SİLİNİR: sipariş kayıtları kaybolur. Dekontlar belirteç sayesinde
  açılmaya devam eder, ama sipariş kaydının tek kalıcı kopyası işletme
  e-postasıdır.
  Volume bağlanınca `RAILWAY_VOLUME_MOUNT_PATH` otomatik kullanılır; durum
  admin "💾 Kalıcı veri" kartında (CLAUDE.md "Ziyaretçi sayacı").


## tami (Garanti BBVA) — ikinci kart sağlayıcısı (8 Eki 2026)
Sebep: tami hak edişi ertesi iş günü, iyzico 14 gün. İkisi de kurulu kalır;
hangisinin müşteriye açık olduğunu ADMIN ANAHTARI seçer (müşteri seçmez).

- ANAHTAR: `config.commerce.cardProvider` ("iyzico" | "tami") — Railway'de
  `CARD_PROVIDER` env'i verilirse onu ezer (kod değiştirmeden geçiş).
  server.js `cardProvider()`: seçilenin anahtarı yoksa öteki kullanılır,
  ikisi de yoksa kart kapalı. Açılış log'u hangisinin çalıştığını yazar.
  `/api/pay/status` → `provider` (+ tami'de `taksit`).
- ANAHTARLAR yalnız env: TAMI_MERCHANT_NUMBER · TAMI_TERMINAL_NUMBER ·
  TAMI_SECRET_KEY · TAMI_KID · TAMI_K · TAMI_BASE_URL (canlı
  https://paymentapi.tami.com.tr, test https://sandbox-paymentapi.tami.com.tr).
  tami portalı → İşyeri Ayarları → POS Yönetimi (API terminali).
- İSTEMCİ `tami.js` (gesmarketim1'de önce yazıldı, AYNI dosya): PG-Auth-Token
  = m:t:base64(sha256(m+t+secret)); istek securityHash = JWS HS512 (kid + k,
  payload = securityHash HARİÇ gövde JSON'u); dönüşte hashedData =
  base64(HMAC-SHA256(secret, cardOrg+cardBrand+cardType+masked+taksit+TRY+
  tutar+orderId+systemTime+success)). Tutar/para birimi yazımı belgede yok,
  olası biçimler denenir (gizli anahtarsız üretilemez, güvenliği zayıflatmaz).
- AKIŞ: sepet `/api/pay/checkout` ve link `/api/pay/custom` aynı uçtur;
  tami'de istek `card` + `tkTaksit` (müşterinin seçtiği) taşır — `taksit`
  link ödemesinde tks=N'dir, KARIŞTIRMA. server.js `tamiStart()` →
  `/payment/auth` → dönen 3D HTML tek kullanımlık
  `/api/pay/tami/3d/<36 hex>` adresinden verilir (yalnız bellek, 2 dk, ilk
  açılışta silinir; içinde kart no var). NEDEN: HTML sayfalarının CSP'si
  `form-action 'self'`; 3D formu sayfaya yazılsa banka gönderimi engellenir.
  Dönüş `/api/pay/tami/callback`: hashedData doğrulanır (sahte dönüşte
  tami'ye gidilmez) → `/payment/complete-3ds` → başarılı VE tutar kayıtla
  aynıysa `settleOrder()` (iyzico ile ORTAK: kayıt, dekont belirteci,
  yönlendirme, iki e-posta).
- KAYIT: anahtar = tami orderId (= conversationId, GES…/GMK…), `provider:
  "tami"`, `tami: {amount, installmentCount, vadeFarki, maskedNumber,
  cardBrand, bankAuthCode, bankReferenceNumber}`; paymentId =
  bankReferenceNumber. KART NO / SKT / CVV hiçbir yere YAZILMAZ (test).
- TAKSİT: `config.commerce.tamiTaksit` = seçenekler + tami panelindeki
  komisyonlar AYNEN. Vade farkı MÜŞTERİYE: fark% = ((1−kom1)/(1−komN)−1)×100,
  kuruşa yukarı (tami.js `farkPct`) → işletmenin net'i tek çekim net'ine
  eşit. Tarayıcıya yalnız hesaplanmış fark% gider. Kart no'nun ilk 8 hanesiyle
  `/api/pay/tami/taksit` (installment-info) sorulur; başlatmada sunucu
  YENİDEN sorar. Link ödemesinde tek=1 → yalnız tek çekim, tks=N → yalnız N.
- `cardMaxTL` iyzico HESABININ limitidir; tami'ye UYGULANMAZ (sepet uyarısı
  ve odeme.html ipucu tami'de gizlenir).
- Dekont anahtarı iyzico gizli anahtarından türer (eski dekontlar açılsın);
  iyzico hiç tanımlı değilse tami secret'tan.
- E-postalar sağlayıcıyı yazar ("tami ref no", maskeli kart, onay kodu;
  "Kargodan ÖNCE tutarı tami panelinden doğrulayın").
- TEST: `tests/tami.test.js` (npm test) — sahte tami sunucusuyla uçtan uca.
- HATA TEŞHİSİ: log satırı "tami … hatası: HTTP · kod · grup · mesaj ·
  cid=GM…"; cid = correlationId, tami destek isteği bununla bulur.
  9011 ("Şu anda işlemini gerçekleştiremiyoruz"): gesmarketim.com'dan
  denendiğinde alındı; tami'de kayıtlı site gespaenerji.com'dur.
