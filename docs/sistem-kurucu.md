# Sistem Kurucu — kurallar ve yapı

> CLAUDE.md "Sistem Kurucu" bölümünden `@` ile içe aktarılır.
> Sayfa `sistem-kur.html` · mantık `assets/builder.js` · veri `config.builder`.

"İhtiyaçtan siparişe" 5 adımlı sihirbaz:

1. **Kullanım yeri**: senaryo kartları (`presets`). Her kartta senaryonun
   tipik günlük tüketimi "≈ X kWh/gün" yazar; ölçek seçmeden görünsün.
2. **Cihazlar**: adet ve günlük saat. Satırlar TABLO DEĞİL grid'dir
   (`.bld-app-row`): tabloda mobilde "Saat/gün" sütunu ekran dışında kalıyordu.
   Mobilde adet ve saat kutuları alt satıra iner. Adet/saat düğmeleri satırı
   YERİNDE günceller (`softUpdate`); yeniden çizim sayfayı zıplatırdı.
3. **Önerilen sistem**: sade dille panel, akü ve inverter kartları. Her kartta
   seçilen model × adet, "✔ kapasite · ihtiyaç" satırı, tek cümle "neden" ve
   tutar vardır. Özerklik seçimi, senaryo ipucu (`preset.tip`), hazır paket
   önerisi ve fiyat özeti buradadır. Alttaki ana düğme "Bu sistemle devam et"
   önerilen sistemi uygular ve 5. adıma geçer; "Ürünleri değiştir" 4. adıma gider.
4. **Ürünleri düzenle** (isteğe bağlı): DÖRT kategori aynı düzendedir,
   başlığa dokununca açılan akordeon + `.bld-list` satırları (panel/akü/inverter
   tek seçim = radyo; kablo/pano/işçilik çoklu seçim = kutucuk). Akordeon
   başlığı seçimi, tutarı ve ihtiyacı karşılayıp karşılamadığını gösterir.
   Altta yapışkan toplam çubuğu (`#bldCart.bld-totbar`): mağaza · teklifle ·
   tahmini toplam. Tam döküm 5. adımdadır, 4. adımda tekrarlanmaz.
5. **Sipariş**: malzeme listesi iki bölümdür: "Mağazada satışta · fiyat kesin"
   ve "Keşifle netleşecek · tahmini". Altında fiyat kutusu, WhatsApp siparişi
   ve "Mağaza ürünlerini sepete ekle".

## Tek fiyat kaynağı (EN ÖNEMLİ KURAL)

- Mağazada satılan kalem `config.builder.catalog` içinde `pkg` ile
  `config.packages`'e bağlanır. Ad, marka, fiyat, havale tutarı ve stok
  ORADAN gelir; birim fiyat main.js `pkgUnit()` kuralıyla hesaplanır
  (`window.GESPA.shop` = `{pkg, unit, pct, cart}`, main.js açar).
- `pkg`'li kaleme `price` YAZILMAZ. Eskiden kurucunun ayrı fiyat listesi
  vardı; Lexron 285 W kurucuda ₺3.400, mağazada ₺7.500 görünüyordu. Test
  (`tests/seo.test.js`) `pkg` yanında fiyat görürse düşer.
- Admin panelinin paket fiyatı değişikliği böylece kurucuya da yansır.
- Ürün mağazadan kaldırılırsa, fiyatı `null` olursa ya da `stock: 0` ise kalem
  kurucudan da düşer (eksik ürün önerilmez).
- `pkg`'siz kalem mağazada satılmayan, TEKLİFLE satılan kalemdir: `name` +
  `price` (KDV dahil). Sepete eklenmez, havale indirimi almaz, "📋 Teklifle"
  rozeti taşır. İki türü vardır:
  - `firm: true` → İŞLETMENİN liste fiyatı, tahmin değil. Yanına "tahmini"
    yazılmaz. Şu an inverterler: Lexron 6,2 kW ₺28.000 ve 11 kW ₺50.000
    (işletme, 26 Eyl 2026). Tescom 5 kW / Mexxsun 8 kW uydurma satırları kalktı.
  - `firm` yok → tahmini fiyat (pano, konstrüksiyon, işçilik, nakliye,
    izleme); "tahmini" yazılır, kesin tutar keşifle netleşir.
- Mağazada satılmayan bir panel/akü modeli kataloğa UYDURULMAZ. Yeni model
  satılacaksa önce `config.packages`'e ürün olarak girer, sonra kataloğa `pkg`
  satırı eklenir.

## Fiyat gösterimi

- `priceRows()`: "🛒 Mağaza ürünleri" (liste toplamı) + havale/EFT tutarı +
  "📋 Teklifle satılan ürünler" (`r.firm`, liste fiyatı) + "🔧 Keşifle
  netleşecek" (`r.est`, tahmini) + toplam. Tahmini kalem varsa toplamın adı
  "Tahmini toplam"dır. 5. adımın malzeme listesi ve WhatsApp mesajı aynı üç
  bölümle yazılır; 4. adımın çubuğu teklifle olanları tek "Teklifle"
  (`r.quote`) altında toplar. Hepsi aynı `bom()` verisini kullanır.
- Havale/EFT indirimi YALNIZ mağaza ürünlerine uygulanır ve sepetle birebir
  aynıdır: her kalemin `pkgUnit().cart` birim tutarı × adet (birim başına 50 ₺
  yuvarlama, `discountPct`, `noCartDiscount` dahil). Oranları farklı kalemler
  varsa tek "%N" yazılmaz. Eski `builder.commerce.havaleDiscountPct` KALKTI.
- "Mağaza ürünlerini sepete ekle" (`toCart()`): mağaza kalemlerini
  `gespa-cart`'a yazar ve sepet.html'e gider. Adet kurucudakine EŞİTLENİR
  (`cart.setQty`), iki tıklama çift eklemez; `stock` varsa onu aşmaz.
  Doğrulandı: bağ evi senaryosunda kurucu ₺94.572 / havale ₺91.700, sepet
  sayfası aynı tutarları gösterir.

## Öneri mantığı

- `recommend()`: ihtiyacı EN DÜŞÜK toplam tutarla karşılayan model;
  eşitlikte daha çok kapasite, sonra daha az adet. Senaryonun `prefer`'i
  önce gelir (karavan → 285 W kompakt panel; 2,4 m'lik panel tavana sığmaz).
- GERİLİM UYUMU: akü ve inverter `v` (sistem gerilimi) taşır. Lexron 6,2 ve
  11 kW için 48 V yazıldı (bu güç sınıfı 48 V'tur, işletmeden teyit
  bekleniyor). İnverter yalnız
  seçili akünün gerilimindeki modellerden önerilir; uyumsuz seçimde akordeon
  başlığı "⚠ Akü X V, inverter Y V: birlikte çalışmaz" der. Eskiden 48 V
  aküyle 24 V veya 12 V inverter öneriliyordu.
- İnverter gücü tek cihazı aşarsa paralel adet önerilir (`autoQtyFor`);
  en ucuz birleşim seçilir (8 kW ihtiyaçta 2 × 6,2 kW yerine 1 × 11 kW).
- `state.pinned[tür]`: müşteri modeli 4. adımda KENDİSİ seçtiyse o model
  korunur. Seçmediyse model her değişiklikte ihtiyaca göre yeniden önerilir;
  aksi hâlde 3. adımdaki öneri ile 5. adımdaki liste çelişirdi.
  "Bu sistemle devam et" (`useRecommended()`) seçimleri ve elle adetleri
  sıfırlar, kalem aç/kapa tercihleri kalır.
- Hazır paket önerisi (`kitsFor`): `kit: true` paketlerden, kış tasarım
  gününde (`kwp × sunHours × systemEff`, ihtiyaçla AYNI katsayılar) günlük
  ihtiyacı karşılayanlar, ucuzdan pahalıya en çok 2 tane. Paketin reklam
  `dailyKwh` değeri bu karşılaştırmada KULLANILMAZ (yaz üretimidir).
- Senaryo ipucu (`preset.tip` = `{text, link, href}`): tarla → aküsüz pompa
  hesabı, dükkân → şebeke bağlantılı GES hesabı. Metinler DICT'te 3 dildedir.

## Yapı kuralları (değişmedi)

- TÜM veri `config.builder`: `sizing` (katsayılar), `presets`, `appliances`
  (W/saat/kalkış), `groups`, `catalog` (panel/battery/inverter/extras).
  Koda hiçbir sayı/fiyat gömülmez.
- Akü adedi model DoD'una göre hesaplanır (`battery.dod`).
- Ek kalem miktar kuralları (`extras[].qty`): `perPanel`, `perSystem`,
  `perKwp`, `perCableSet` (toplam DC kablo = panel × `cableMetersPerPanel`,
  takımdaki metreye `meters` bölünüp yukarı yuvarlanır). Mağaza ürünü tam sayı
  adetle, `perKwp` tahmini hizmet 0,1 adımla değişir.
- Her seçili satırda adet kutusu (− n +) vardır; elle girilen adet
  `state.qty[type]` / `state.exQty[ekId]`'de saklanır, "↺ otomatik"
  bağlantısı hesaplanan adede döndürür.
- YAPI KURALI: adet kutusu ve "↺ otomatik" düğmesi satırın `<label>`'ının
  DIŞINDA durur (`.bld-row-hit` = `display:contents`); label'ın içinde olsalar
  tıklama seçimi değiştirir. `softSelect()` yeniden çizmeden günceller;
  tıklanan düğümü DEĞİŞTİRME, yoksa click olayı düşer.
- SINIF ADI TUZAĞI: adet kutusu açık satırın sınıfı `.has-qty`'dir. `.qbox`
  ürün sayfasının adet kutusudur (inline-flex, hap şekli); satıra verildiğinde
  seçili satırı hap yapıp sütunları kaydırıyordu.
- Durum localStorage `gespa-builder`'da, sürümlü (`v: 2`). Sürüm değişince
  eski model kimlikleri ve elle adetler sıfırlanır, cihaz listesi korunur.
  `?tip=<presetId>` ile ön seçim yapılır.
- Cihaz/ürün adları `T()` ile i18n DICT'ten çevrilir. Mağaza ürününün adı
  paket adıdır (DICT'te zaten var). Yeni teklifle kalem veya birim
  eklerken DICT'e 3 dil yaz (ör. "takım").
- SSS'deki fiyat ve akü yanıtları bu kurallarla aynı şeyi söyler; kural
  değişirse `sistem-kur.html` SSS'ini ve `content/translation-fixes.json`
  çevirilerini birlikte güncelle.
