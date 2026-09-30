# Soru & Cevap — makale altındaki onaylı soru-cevap bölümü

> CLAUDE.md'den `@` ile içe aktarılır. Sunucu `server.js` ("Soru & Cevap"
> bölümü) · istemci `assets/qa.js` · stiller `style.css` `qa-*` ·
> moderasyon `admin.html` "💬 Soru & Cevap" kartı · ayar `config.qa`.

İlk sayfa `gunes-paneli-kacak-elektrik-cezasi.html` (30 Eyl 2026). Müşteriler
mevzuat rehberinin altında soru sormaya başlayınca kuruldu: ziyaretçi soru
sorar, diğer okuyucular cevap yazar, firma "GESPA Uzmanı" rozetiyle cevaplar.

## Akış
1. Ziyaretçi soru (`POST /api/qa/ask`) ya da yayındaki bir soruya cevap
   (`POST /api/qa/reply`) gönderir. Gönderi `pending` olarak kaydedilir ve
   **onaysız HİÇBİR YERDE görünmez**. SMTP ayarlıysa işletmeye e-posta gider.
2. Admin kartı bekleyenleri listeler: **Onayla**, **Sil** ya da **uzman
   cevabı yaz**. Uzman cevabı hemen yayınlanır ve soruyu da yayına alır.
3. Onaylanmamış soruya cevap yazılamaz (404).
4. Soru silinince cevapları da silinir.

## Yönetici şifresi: `ADMIN_PASS`
- Moderasyon YALNIZ Railway ortam değişkeni `ADMIN_PASS` ile çalışır. Yoksa
  `/api/qa/admin` 503 döner, kart ne yapılacağını yazar; gönderiler yine
  birikir ama yayınlanamaz. Neden: `config.admin.pass` herkese açık
  `config.js`'tedir; onunla herkes sahte "GESPA Uzmanı" cevabı yazabilirdi.
- `ADMIN_PASS` tanımlıysa sunucu TÜM yönetici uçlarında (e-posta testi, bot
  sayacı, sayaç ve soru-cevap devri, giriş) yalnız onu kabul eder;
  `config.admin.pass` canlıda reddedilir. Tek kapı server.js `adminGate()`;
  IP başına 10 dakikada 10 hatalı deneme sınırı vardır.
- `admin.html` girişi sunucuda doğrulanır (`POST /api/admin/login`). Sunucu
  yoksa (Pages aynası) config şifresiyle yalnız fiyat önizlemesi açılır.
  Girilen şifre sekme oturumunda (`sessionStorage`) tutulur, kartlar onu gönderir.
- Şifre repoya ve sohbete YAZILMAZ (iyzico/SMTP kuralı).

## Veri
- `DATA_DIR/qa.json`: `{items:[{id, page, kind:"q"|"a", parent?, name, text,
  at, status:"pending"|"live", expert?}]}`. Düz liste; cevap `parent` ile
  soruya bağlanır.
- Kişisel veri YALNIZ ziyaretçinin seçtiği görünen addır. E-posta, telefon
  ve IP SAKLANMAZ; IP yalnız bellekte, hız sınırı içindir. Onay kutusu
  "adımın ve metnimin herkese açık yayınlanmasını kabul ediyorum" der.
  Silme isteği gelirse admin kartından silinir.
- Volume yoksa veri, ziyaretçi sayacı gibi önceki sunucudan devralınır:
  `seedQaFromLive()` açılışta parolalı `/api/qa/export`'u çağırır. Devir
  kaçarsa içerik kaybolur; bu yüzden admin kartında **Yedeği indir** ve
  **Yedekten yükle** (`op:"import"`, var olan kimlikler atlanır) vardır.
  Kesin çözüm Railway Volume'dur.

## İstenmeyen gönderi koruması
- Bal küpü: görünmez `website` alanı doluysa başarı döner, hiçbir şey
  kaydedilmez (bota ipucu verilmez).
- Form açıldıktan 3 sn içinde gelen gönderi reddedilir (`ms`).
- IP başına 10 dakikada 3, günde 10 gönderi; site genelinde saatte 60.
  IP başlığı taklit edilebildiği için site geneli tavan şarttır.
- En çok 300 bekleyen gönderi; bildirim e-postası saatte en çok 12.
- Ad `gespa`, `yönetici`, `admin`, `moderatör` içeremez ve rozet adıyla
  aynı olamaz: rozetsiz bir "GESPA Uzmanı" okuru yanıltırdı.
- Sınırlar: ad 2–40, soru 10–1500, cevap 5–1500, uzman cevabı 3000 karakter.
  Kontrol ve yön değiştirme karakterleri (U+202E vb.) silinir.

## Sayfaya basma (SEO/AEO)
- Botlar JS çalıştırmaz. Yayındaki gönderiler sayfa SUNULURKEN
  `<!-- QA:STATIC -->…<!-- /QA:STATIC -->` arasına HTML olarak basılır
  (`serveQaPage()`); ETag gövdeden üretilir, sayfa önbelleği her değişiklikte
  tazelenir. Bu sayfa için build'in `.br/.gz` kopyaları KULLANILMAZ.
- Repodaki HTML'de işaretlerin arasında YALNIZ boş durum notu durur; ziyaretçi
  içeriği repoya girmez (test denetler). Pages aynası bu yüzden boş liste
  gösterir, form orada gönderemez.
- Article şemasına `commentCount` + `comment` (Comment; cevaplar iç içe
  `comment`) eklenir; uzman cevabının yazarı `#organization`'dır. Şemadaki
  `<` kaçırılır: "</script>" yazan gönderi betiği kapatamaz.
- Metin değiştirme İŞLEVLE yapılır: ziyaretçi metnindeki `$&` gibi dizgeler
  yer değiştirme kalıbı sanılmasın.
- HER ÇIKTI KAÇIRILIR: sayfada `qaEsc()`, admin kartında `esc()`. Admin sayfası
  yönetici şifresini tuttuğu için oradaki bir kaçış hatası şifreyi çaldırırdı.
- Markdown kopyası build'de üretildiği için gönderileri İÇERMEZ.

## İçerik kuralı
- Uzman cevabı firmanın beyanıdır: rehberin kuralı geçerlidir, doğrulanamayan
  mevzuat iddiası yazılmaz. Okuyucu cevapları kişisel görüştür; bölümün
  notu bunu ve "hukuki görüş yerine geçmez" uyarısını söyler.
- Abone numarası, tebligat, kimlik bilgisi içeren gönderi ONAYLANMAZ.
- Bölüm bir DEĞERLENDİRME sistemi değildir. Ürün ya da firma hakkında övgü
  veya şikâyet niteliğindeki gönderi yorum olarak ONAYLANMAZ: 1 Ağustos
  2026'dan beri satın alması doğrulanamayan tüketici değerlendirmesi
  yayınlanamaz (Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği
  değişikliği, RG 01.07.2026/33297). İçinde soru varsa soru cevaplanır,
  değerlendirme kısmı için müşteri Google yorumuna yönlendirilir.

## Yeni sayfaya eklemek
`config.qa.pages`'e sayfa adı + sayfaya bölüm işaretlemesi (`data-qa-page`,
`#qaAskForm`, `#qaReplyTpl`, `QA:STATIC` işaretleri) + `assets/qa.js`
betiği. Bölüm şu an yalnız Türkçedir; çevrilen bir sayfaya eklenirse
metinler DICT'e ve `qa.js`'e 3 dilde girmelidir.

## Testler (`tests/seo.test.js`)
Statik: yapılandırılan her sayfada işaretler, `qa.js` ve repoda ziyaretçi
içeriği olmaması. HTTP (test sunucusu `ADMIN_PASS` ve geçici `DATA_DIR` ile):
hızlı gönderi, bal küpü, ayrılmış ad, yapılandırılmamış sayfa, onaysız içeriğin
gizliliği, config şifresinin reddi, kaçış (`</script>`, `$&`), Article
yorumları, onay, devir dışa aktarımı, silme ve sunucu doğrulamalı giriş.
