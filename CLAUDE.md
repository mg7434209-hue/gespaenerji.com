# CLAUDE.md — Gespa Enerji Kurumsal Site

> Repo kök dizinindedir; Claude Code her oturum başında otomatik okur.
> 200 satırı geçirme; uzayan içerikleri `@dosya/yolu.md` ile import et.

## Proje
Gespa Enerji kurumsal sitesi (gespaenerji.com). Antalya/Manavgat'ta anahtar
teslim güneş enerjisi (GES) hizmetleri. **Çok sayfalı statik site.**
Saf HTML + CSS + Vanilla JS. Railway'de küçük Node statik sunucu (`server.js`),
GitHub Pages ayna sürüm.
TR sayfaları kök dizinde **kaynaktır**; `/en` `/de` `/ru` dil sayfaları
`build.js` ile bu kaynaklardan **üretilir** (elle düzenlenmez). Dil sayfaları
klasik Pages yayını için **repoda tutulur** — kaynak değişince `node build.js`
çalıştırıp çıktıyı da commit'le.

Sayfalar (her biri kök dizinde, `.html` uzantılı):
`index.html` (BÖLÜM SIRASI ÖNEMLİ — görsel denge ölçümüne göre kuruldu:
hero → marka şeridi → hizmetler → projeler → araçlar → finansman → e-mağaza →
su ısıtıcı → yapay zekâ ürünleri → yorumlar → SSS → CTA. KURAL: yan ürünlerin
(su ısıtıcı + yapay zekâ ürünleri) toplam dikey alanı, GES + araç bölümlerinin
toplamının %40'ını AŞMASIN ve ikisi de sayfanın ikinci yarısında kalsın —
şu an %33, ilk yan ürün %63 derinlikte. Yeni yan ürün eklerken yeniden ölç.
Tam genişlik hero slider `.hero2`, 4 slayt: GES fotoğrafı → su ısıtıcı →
AI cankurtaran → GES Marketim. 1. slayt LCP'dir (fetchpriority + preload
KORUNUR) ve sayfanın TEK `<h1>`'ini taşır; diğer slaytlar `<p class="hero2-title">`.
Birincil hero düğmesi "Ücretsiz Keşif" (ticari eylem), ikincil hesaplayıcı.
Döngü main.js hero IIFE'sinde, süre `config.hero.intervalMs`, ok/nokta
kontrolleri var, azaltılmış harekette dönmez. Slaytlar tek grid hücresinde
üst üste durur — yükseklik dile göre zıplamaz.
Hizmet kartları `.svc-card`: emoji DEĞİL, `assets/img/projects/` altındaki
gerçek saha fotoğrafları (16:9 kırpma). Araçlar bölümünde `.calc-hero-pv`:
solda hesaplayıcı metni + 4 madde, sağda PV enerji sahnesi (inline SVG
`.pv-*`, güneş → panel → DC → inverter/batarya → AC 220V → ev; saf CSS
animasyon, azaltılmış harekette durur). E-mağaza şeridi `.shop-grid`:
2 paket kartı (`data-pkg-name` ile config.packages'ten tazelenir) +
`.shop-cta` GES Marketim kartı. Alternatif ürünler `.alt-grid`/`.alt-card`:
kompakt yatay kart, AI Cankurtaran ilk kart — yeni ürün geldikçe grid büyür,
lacivert/aqua palet kart İÇİNDE kalır, sayfaya taşmaz. E-mağaza linkleri:
`config.company.shop`; hero slaytı, mağaza şeridi ve TÜM footer'lar) ·
`hizmetler.html` · `online-satis.html` (E-TİCARET KATALOĞU — satıştaki TÜM
ürünler tek ızgarada: `#shopGrid` main.js'in shop IIFE'siyle config.packages'ten
çizilir, `#shopFilters` kategori çipleri `group` alanlarından üretilir.
Izgara `auto-fill` olduğundan ürün sayısı onlarca olunca kendiliğinden büyür —
yeni ürün eklemek için SADECE config.packages'e satır eklenir, sayfaya
dokunulmaz. Kartta foto/etiket/ad/fiyat/havale + "Sepete ekle" vardır.
SÜZGEÇ ÇİPİ TUZAĞI: kategoride TEK ürün varsa ve o ürünün `url`'si varsa
çip süzgeç DEĞİL, doğrudan ürün sayfasına giden bir `<a class="sh-chip-go">`
olur — tek kartlık ara ızgara boşuna bir tıklamaydı. Gruba ikinci ürün
girince kendiliğinden süzgece döner. "Tümü" çipindeki `#shopCount` HER
ZAMAN toplam ürün sayısıdır; süzülmüş sayıyı yazmak "Tümü (1)" gibi
kendisiyle çelişen etiket üretiyordu.
JS'siz ortam ve AI botları için `SHOP:STATIC` listesi build'de basılır;
ItemList JSON-LD de bu sayfada üretilir. DİKKAT: kartlara `.reveal` KOYMA —
süzgeç her tıklamada ızgarayı yeniden çizer, yeni düğümler
IntersectionObserver'a kayıtlı olmadığı için gizli kalır) ·
`urunler.html` (paket vitrini: gruplu kart listesi; gruplar
`config.packages[].group` ile ayrılır) ·
`paket-285w.html` `paket-2x540w.html` (e-ticaret ürün sayfası: solda galeri
`#pgMain`+`.prod-thumbs`, sağda satın alma kutusu `.buy-box` — ürün kodu, stok,
fiyat, havale tutarı, `.qbox` adet kutusu, CTA'lar, kargo/iade bilgi listesi;
altında 4 sekme `.ptabs`/`.ptab-panel` = açıklama · pakete dahil olanlar · teknik ·
kargo-iade. Fiyat/kod/stok hem build'de statik basılır hem main.js'te
`data-pkg-*` ile tazelenir. Satın alma sepet üzerinden: `data-add-cart` =
sepete ekle + onay penceresi (Sepete git / Alışverişe devam), `data-add-cart-go`
= ekle ve sepete git) ·
`unv-trek-pro-2500.html` (UNV Trek Pro 2500 W taşınabilir güç istasyonu —
paket-*.html ile AYNI düzen: `.prod-sec` (satın alma ilk ekranda) → 4 sekme
(Açıklama · Çıkış Portları · Teknik Özellikler · Kargo ve İade) → kullanım
alanları → SSS → CTA. BAŞKA MARKANIN ürünüdür: `config.packages[].brand`
"UNV (Uniview)" olarak verilir ve JSON-LD'ye böyle yazılır; ürün fotoğrafındaki
UNV logosu GESPA ile DEĞİŞTİRİLMEZ — `tools/marka-logo.py` kuralı yalnızca
markasız OEM ürünler içindir, gerçek bir üreticinin markasını silmek olmaz.
Teknik değerler üreticinin künyesinden gelir — ham görseller
`assets/img/products/kaynak/unv-trek-pro-2500-*.png`; künyede olmayan değer
(batarya kimyası, şarj süresi, ağırlık, ölçü) sayfaya YAZILMAZ.
Cihazın prizi AS/NZS olabildiğinden SSS'te "priz tipi sipariş öncesi teyit
edilir" maddesi vardır — TR sürüm tedarik edilene kadar KALDIRMA) ·
`sepet.html` (sepet + sipariş: kalem listesi JS ile çizilir, özet/form statik;
noindex + robots engelli + sitemap dışı ama build dil kopyalarını üretir.
Sepet verisi localStorage `gespa-cart` = {paketId: adet}; birim fiyat kuralı
main.js `pkgUnit()` — TÜM fiyat noktaları bununla hesaplanır. Üst menüdeki 🛒
rozeti main.js'in `.nav-actions`a enjekte ettiği istemci bileşenidir, sayfalara
elle eklenmez. Sipariş WhatsApp mesajına çok kalemli döküm yazılır) ·
`su-isitici.html` (PV su ısıtıcı) · `elektrikli-arac-donusum.html`
(elektrikli araç güneş dönüşümü + BOOST MPPT şarj kontrol cihazının SATIŞ
sayfası: `<main data-pkg-detail="boost-mppt">`, `#urun` bölümünde `.prod-top`
= solda galeri `#pgMain`/`.prod-thumbs.few`, sağda `.buy-box`. BÖLÜM SIRASI
paket-*.html ile AYNIDIR: `.prod-sec` (breadcrumb + SATIN ALMA, sayfanın TEK
`<h1>`'i satın alma kutusundadır) → `#paketler` MOTOR SEÇİCİ → TEKNİK KÜNYE →
`#tanitim` → anlatım → SSS → CTA. Motor seçici satın almanın HEMEN ALTINDADIR
(ticari eylemler bir arada); aşağıya alırsan paket görülmeden sayfa terk edilir. Büyük `page-hero` YOKTUR; satın alma kutusu ilk ekranda görünsün
diye kaldırıldı, tanıtım metni teknik künyenin altına taşındı. Sırayı bozma. Fiyat/kod/stok
build'de statik basılır, main.js `data-pkg-*` ile tazeler. TEKNİK DEĞERLER
üreticinin bülteninden gelir — kaynak PDF ve ham görseller
`assets/img/products/ev/kaynak/` altındadır; değer değiştirmeden önce oraya bak.
Cihaz 24/36/48/60/72 V ve AGM·jel·kurşun-asit·lityum akülerle uyumludur;
"yalnız lityum" veya "48V+" yazma. Tedarikçi MS Teknik'in telefonu siteye
KONMAZ — iletişim tek kaynağı config.company'dir) ·
`ai-cankurtaran-destek-sistemi.html`
(havuz güvenliği; lacivert/aqua `pool-*` stilleri, form → WhatsApp lead;
"Nasıl çalışır?" bölümünün sonunda canlı simülasyon `.pool-sim` — inline SVG,
10 sn'lik döngü: izleniyor (0-42%) → risk analizi (42-62%) → alarm (62-100%);
kamera taraması, yüzücü takip kutuları, riskli yüzücünün kırmızıya dönmesi,
saat + sirene giden sinyal ve alttaki 3 adım şeridi. TÜM animasyonlar aynı
10 sn'yi paylaşır — evre yüzdelerini değiştirirsen hepsini birlikte değiştir;
azaltılmış harekette `.pool-sim *{animation:none!important}` ile alarm karesi
sabit kalır. Etiketler `<text>` ve i18n DICT'ten çevrilir (4 dilde kutuya
sığdığını doğrula). Eski statik şema `akis-diyagrami.svg` repoda duruyor;
gerçek tespit videosu `assets/video/cankurtaran-ai-tespit.mp4` + poster —
`#canli` bölümü, VideoObject JSON-LD sayfada statik; server.js mp4'e Range/206
verir; video/poster yolları build'de mutlaklaştırılır: href|src|poster) ·
`hesaplayici.html` · `sistem-kur.html` (Sistem Kurucu sihirbazı) ·
`projeler.html` · `hakkimizda.html` · `iletisim.html` ·
`tarimsal-sulama.html` · `toptan.html` (B2B toptan satış: stok kartları ve
koşullar `config.b2b`'den build ile STATİK basılır — B2B:STATIC işareti;
fiyat YAZILMAZ, adede göre teklif; adet kutusu + WhatsApp mesajı ve teklif
formu main.js toptan IIFE'sinde; stok değişince config.b2b.stock güncelle +
`node build.js`) · yasal: `kvkk.html` `gizlilik.html` `cerez-politikasi.html`
Ayrıca `admin.html`: fiyat yönetim paneli (menüde yok, robots'ta engelli,
build PAGES listesine EKLENMEZ). Her sayfa: ortak header/footer, aktif menü
vurgusu, breadcrumb, sayfaya özel SEO başlığı/canonical/Open Graph içerir.
Nav menü (hizmet/satış ayrımı): Ana Sayfa · Solar Sistemler (açılır grup:
Çatı & Arazi GES Kurulumu → hizmetler.html + Tarımsal Sulama) · Online Satış
(SATIŞ PANELİ — aşağıya bak: satıştaki ürün kartları + bağlantı satırı:
Tüm ürünler (mağaza) → online-satis.html, Paket ürünler → urunler.html,
Solar Su Isıtıcı, Toptan Satış (B2B), GES Marketim ↗, Sepetim → sepet.html
`rel="nofollow"` çünkü robots'ta engelli) · Yapay Zekâ Ürünleri
(açılır grup: AI Cankurtaran Destek Sistemi) · Araçlar (açılır grup: Tasarruf
Hesaplayıcı + Sistem Kurucu) · Projeler · Hakkımızda · Teklif Al.
Paket detay sayfalarında "Paket Ürünler", sepet.html'de "Sepetim" aktif
işaretlenir; alt sayfa aktifken üst `menu-parent` de ` active` alır.
Açılır paneller KART tipidir (`.submenu.submenu-cards` → `.mcard` = ikon +
başlık + tek satır açıklama); 4+ kalemli grup iki sütun (`.two`).
"Online Satış" AÇILIR PANEL DEĞİLDİR — düz bağlantıdır, tıklayınca doğrudan
`online-satis.html` kataloğunu açar. Alt sayfalardayken (urunler, su-isitici,
toptan, sepet, paket-*, unv-*) üst bağlantı yine ` active` alır. Bölüm
bağlantıları KATALOG SAYFASININ SOL KENARINDADIR (`.shop-layout` =
`212px minmax(0,1fr)` → `.shop-side` + `.shop-main`): "Mağaza" başlığı, ilk
satır vurgulu `.slink-lead` "Tüm ürünler", altında Paket ürünler · Solar Su
Isıtıcı · Toptan Satış, `.shopmenu-sep` çizgisi, sonra EYLEMLER (Sepetim,
GES Marketim ↗). Gezinme ile eylemi karıştırma, ayrı tut.
Sol kenar seçildi: LTR'de göz sol üste düşer, kategori rayı e-ticarette solda
beklenir. Kenar çubuğu `position:sticky`. Filtre çipleri (`#shopFilters`) AYRI
bir denetimdir, ızgaranın üstünde kalır — gezinme ile süzgeci karıştırma.
SAYFA ÜRÜNLE BAŞLAR: büyük `page-hero` YOKTUR (elektrikli-arac-donusum.html ile
aynı gerekçe), yerine kompakt `.shop-head` = pill + H1 + tek cümle. Kampanya
bölümü (`#saleSection`) ızgaranın ALTINDADIR; kenar çubuğundaki `#saleLink`
(`.slink-deal`, turuncu) oraya çapalıdır. Bu bağlantı `hidden` başlar ve
main.js `renderSale()` içinde bölümle BİRLİKTE açılır/kapanır — kampanya
bitince kopuk çapa kalmasın. Güven satırları (`.shop-side-trust`) kenar
çubuğunun altındadır; emojiler metnin İÇİNDE kalmalı, ayrı `<span>`e alınırsa
DICT anahtarı eşleşmez ve çeviri düşer.
900px altında kenar çubuğu yatay kaydırılan pill şeridine döner; "MAĞAZA"
başlığı ve alt çizgi MOBİLDE DE KALIR, yoksa hemen altındaki filtre çipleriyle
aynı görünüp ayırt edilemez.
GRID TUZAĞI: `.shop-layout` sütunlarında `1fr` veya `none` KULLANMA —
ikisinin de örtük minimumu min/max-content'tir ve `.sh-grid` sütunu konteynerden
geniş yapıp mobilde kartları ekrandan taşırır. `minmax(0,1fr)` + `.shop-main`
üzerinde `min-width:0` zorunludur (360–1920px'te ölçüldü).
KENAR ÇUBUĞU İKİ SAYFADADIR (online-satis.html ve toptan.html `#stok`);
elle kopyalanırsa sapar — tek kaynak scratchpad `shopside.py` (NAV/ACTIONS/
TRUST + PAGES tablosu). Bağlantı eklemek = oraya satır + DICT'e 3 dil +
çalıştır. Kampanya satırı katalogda `#saleSection`, diğer sayfalarda
`online-satis.html#saleSection` çapası alır; görünürlüğünü main.js
`syncSaleLink()` yönetir — DIŞ kapsamdadır (renderSale katalog dışında hiç
çalışmaz), her sayfada bir kez ve `gespa:lang` olayında çağrılır.
İki sütunlu düzende sağ kolonun `.section-head` başlığı ORTALANMAZ.
Üst menüye YENİ AÇILIR grup eklersen `nav5.py` GROUPS deseni.
Yeni sayfa eklenince TÜM sayfalarda güncelle — nav bloğunu tek kaynaktan
yeniden üreten scratchpad `nav5.py` deseni (sayfa→aktif grup/link tablosu +
ikon/açıklama + SHOP ürün tablosu içerir) kullanılır.
CSS SIRA KURALI: mobil `@media(max-width:1260px)` nav bloğu, masaüstü
`.menu-group`/`.submenu` kurallarından SONRA gelmek zorundadır — eşit
özgüllükte sonraki kural kazanır. Blok yukarıdayken masaüstü kuralları onu
eziyor ve açılır paneller mobilde mutlak konumlanıp üst üste biniyordu.
GENİŞLİK KURALI: çubuk 6 üst seviye öğeyle dolu. Menü 1260px altında
hamburger'a düşer; 1261–1580px bandında `.nav`/`.menu` gap'i, yazı boyu, dil
düğmeleri ve marka yazısı kademeli küçülür (1261–1380px'te bir kademe daha).
Eşikler 4 dilde ölçüldü — en uzun menü RUSÇA'dır. Üst seviyeye yeni öğe
eklersen veya etiket uzatırsan 1280/1366/1440/1530px'te 4 dilde YENİDEN ölç;
aksi hâlde dil değiştirici ve sepet simgesi ekran dışında kalır.

## Sistem Kurucu (`sistem-kur.html` · `assets/builder.js`)
"İhtiyaçtan siparişe" 5 adımlı sihirbaz: kullanım senaryosu → cihaz listesi
(adet + günlük saat) → ihtiyaç (kWp / kWh akü / kW inverter) → marka-model
seçimi (panel, akü, inverter, MC4/kablo/pano/konstrüksiyon/işçilik) → sipariş
özeti (BOM + toplam) → WhatsApp.
- TÜM veri `config.builder`: `sizing` (katsayılar), `presets` (senaryolar),
  `appliances` (W/saat/kalkış), `groups`, `catalog` (panel/battery/inverter/extras).
  Koda hiçbir sayı/fiyat gömülmez. Fiyatlar tahmini liste fiyatıdır.
- Akü adedi model DoD'una göre hesaplanır (LiFePO₄ 0.9, jel 0.5).
- 4. adımda DÖRT kategori de aynı düzendedir: başlığa dokununca kayarak açılan
  akordeon + `.bld-list` satırları (panel/akü/inverter tek seçim = radyo;
  kablo/pano/işçilik çoklu seçim = kutucuk). Yeni kategori eklerken deseni koru.
- Her seçili satırda kendi adet kutusu (− n +) vardır; elle girilen adet
  `state.qty[type]` / `state.exQty[ekId]`'de saklanır, "↺ otomatik" bağlantısı
  hesaplanan adede döndürür (öneri: `autoQtyFor` / `extraAutoQty`).
- YAPI KURALI: adet kutusu ve "↺ otomatik" düğmesi satırın `<label>`'ının
  DIŞINDA durur (`.bld-row-hit` = `display:contents`); label'ın içinde olsalar
  tıklama seçimi değiştirir. Ayrıca `softSelect()` yeniden çizmeden günceller —
  tıklanan düğümü DEĞİŞTİRME, yoksa click olayı düşer.
- 4. adımın altında canlı sepet (`.bld-cart` → `cartInner()`): seçilen her kalem
  adet × birim = tutar ve genel toplam. 5. adımdaki BOM ile aynı `bom()` verisi.
- Sepet ve sipariş özetinde ortak fiyat kutusu (`priceBox()`): toplam, KDV notu,
  havale/EFT indirimi, kurulu güç, WhatsApp siparişi ve güven satırları. İndirim
  oranı site geneli `config.cartDiscountPct` (paket ürünlerle AYNI oran);
  gerekirse `config.builder.commerce.havaleDiscountPct` ile ezilir, 0 = gizli.
  5. adımda `{total:false}` ile çağrılır (toplam tabloda zaten var).
- Durum localStorage `gespa-builder`'da (`state.open` = açık akordeonlar);
  `?tip=<presetId>` ile ön seçim yapılır.
- Cihaz/ürün adları `T()` ile i18n DICT'ten çevrilir — yeni ürün eklerken
  adını DICT'e de ekle (yoksa zarifçe TR kalır).

## TEK DOĞRU KAYNAK — `assets/config.js`
İletişim bilgileri, markalar ve hesaplayıcı katsayıları **yalnızca** burada tutulur.
`assets/main.js` bu değerleri DOM'a enjekte eder (`data-c-text`, `data-c-tel`,
`data-c-wa`, `data-c-mailto` öznitelikleri + bölge/varsayım/JSON-LD üretimi).

- KURAL: İletişim bilgisini, markayı veya herhangi bir katsayıyı sayfalara/JS'e
  ASLA elle gömme. Değişiklik = sadece `assets/config.js` düzenlenir.

### İletişim (config.company)
- Unvan: Gespa Enerji Ltd. Şti.  ·  Görünen marka: GESPA Enerji
- Telefon / WhatsApp: 0543 743 42 09  ·  +90 543 743 42 09  ·  wa.me/905437434209
- E-posta: gesmarketim@gmail.com
- Adres: Örnek Mah. 1551 Sok. No:10/1, Manavgat / Antalya

### Markalar (config.brands)
- Panel: Arçelik, Lexron, Bakırlar
- İnverter: Tescom, Mexxsun, Lexron, Arçelik

### Ürünler & fiyatlar (config.packages · config.heater · config.admin)
- `packages[]`: 2 komple kit (285W ₺ · 2x540W USD) + BOOST MPPT şarj kontrol
  cihazı (**₺7.200 NET** — `noCartDiscount`, kartta da havalede de aynı tutar;
  `freeShipping`, `group:"accessory"`) +
  50W panel (kampanya, `group:"panel"`) + UNV Trek Pro 2500 W taşınabilir güç
  istasyonu ($2.495, `group:"offgrid"`) + tekil paneller Lexron 285 W ₺7.500 ·
  Lexron 655 W TOPCon ₺10.000 · Arçelik 540 W ₺10.000 (`group:"panel"`) +
  TitanX 51,2 V 102 Ah LiFePO₄ akü ₺73.372 (`group:"storage"`) +
  solar kablo takımı 5 m siyah + 5 m kırmızı ₺1.000 · MC4 konnektör takımı
  ₺100 (ikisi de `group:"cable"`, fotoğrafsız — akışa girmez). KABLO KESİTİ
  (mm2) YAZILMAZ: stoğa göre 4 ya da 6 mm2 geliyor, ikisi de uygun.
  — `url` detay sayfası, `img` gerçek foto,
  `oldPrice` indirim rozeti, `currency:"USD"` dolar, `dailyKwh` günlük üretim.
  `usdTry` kuru ile ikinci para "≈" gösterilir; kur değişince SADECE
  config.usdTry güncellenir. Yeni ürün eklerken aynı alanlar + detay sayfası
  (mevcut paket-*.html kopyala ya da mevcut bir sayfaya `data-pkg-detail` +
  `.buy-box` ekle) + build META satırı.
- PANEL/AKÜ teknik değerleri ÜRETİCİ KÜNYESİNDEN gelir — kaynak PDF'ler
  `assets/img/products/kaynak/lexron-*.pdf`. Künyede OLMAYAN değer yazılmaz:
  Arçelik 540 W'ın künyesi elimizde YOK, bu yüzden güç/sınıf/marka dışında
  iddia taşımaz. Künyelerin alt bilgisindeki tedarikçi (ACS ENERJİ) adres ve
  telefonu siteye KONMAZ — MS Teknik kuralının aynısı.
  ADLANDIRMA TUZAĞI: `kit-285w` "285W Güneş Paneli Paketi" (komple sistem,
  ₺25.000) ile `panel-lexron-285w` "Lexron 285 W Güneş Paneli" (tek panel,
  ₺7.500) AYRI ürünlerdir; adları kısaltıp karıştırma.
- `group:"storage"` (enerji depolama) `panel` gibi YALNIZ online-satis.html
  kataloğunda listelenir — main.js/build.js GROUPS listelerinde YOKTUR, orada
  olsaydı urunler.html paket vitrininde de çıkardı. Katalog süzgeç etiketi
  main.js `groupLabel()` içindedir; yeni grup eklerken oraya satır ekle.
- kWp'si OLMAYAN ürünlerde (cihaz/aksesuar) `kwp`/`panelW`/`panelCount` YAZILMAZ;
  kart çipleri `chips: [...]` ile elle verilir. main.js `card()`/`chipsOf()`,
  build.js `PKG:STATIC` ve llms-full.txt bu durumda güç yerine ürün kodunu yazar,
  "paket" sözcüğü yerine "ürün" der. Vitrin grubu `group` alanından gelir —
  yeni grup eklerken main.js `GROUPS` ve build.js `GROUPS` listelerini BİRLİKTE
  güncelle (tek ürünlü grup `.pkg-grid-solo` ile ortalanır).
- Fiyat gösterimi HER YERDE aynı: liste fiyatı ₺ (+ "≈ $") · altında
  `💰 Havale/EFT ile: ₺X (%N indirimli)` · "KDV dahil · kargo hariç" notu.
  İndirimli tutar `config.cartDiscountPct` ile hesaplanır ve **en yakın 50 ₺'ye**
  yuvarlanır — vitrin kartı (main.js `card()`), paket detay hero'su
  (`data-pkg-havale`), sipariş özeti, build'in statik `PKG:STATIC` listesi ve
  llms-full.txt AYNI formülü kullanır; birini değiştirirsen hepsini değiştir.
  Detay hero'sundaki satın alma düğmesi de `data-pkg-cta` ile config'ten dolar.
- `commerce`: stok rozeti, teslim süresi (gün), cayma süresi. Kargo TÜM Türkiye'ye
  yapılır (Antalya yalnızca isteğe bağlı yerinde kurulum bölgesidir) — bu ifadeyi
  kart güven satırında, ürün sayfası bilgi listesinde, "Kargo ve İade" sekmesinde
  ve llms-full.txt'te birlikte güncelle.
- `heater`: PV su ısıtıcı modelleri + ₺ fiyatları (su-isitici.html tablosu ve
  Product JSON-LD buradan render edilir). `heater.showPrices: false` iken fiyat
  HİÇBİR yerde görünmez — tabloda "Teklif alın", hero'da "Güncel fiyat için bize
  ulaşın", JSON-LD'de offers yok, llms-full.txt'te "fiyat için teklif alın".
  Fiyatları yeniden yayınlamak: `true` yap + `node build.js`.
- `pool`: AI Cankurtaran sayfasının aylık "çapa" rakamı ve lansman kontenjanı
  (build.js `poolMonthly`/`poolSlots`/`poolLaunchYear`/`poolNextSeason` span'lerine
  basar). TAM FİYAT LİSTESİ ve belge PDF'leri siteye KONMAZ — brief kuralı.
- `campaign`: indirimli ürünler bölümü + geri sayım (yalnız online-satis.html).
  `endsAt` ISO-8601 + saat dilimi; GEÇTİĞİNDE kampanya bölümü, geri sayım,
  `−%N` rozeti ve üstü çizili fiyat KENDİLİĞİNDEN gizlenir, ürün normal
  fiyatıyla katalogda kalır (JS'te `saleLive()`, build'de `priceValidUntil`).
  Kampanyayı uzatmak = SADECE `endsAt`'i ileri almak.
- İndirim, ürüne `oldPrice` yazılarak açılır (`oldPrice > price` olmalı); rozet
  yüzdesi otomatik hesaplanır. UYARI: "önceki fiyat" olarak gösterilen tutar,
  mevzuat gereği indirimden önceki 30 gün içinde uygulanan EN DÜŞÜK fiyattır —
  rakamı buna göre doğrula.
- `group` alanı sayfayı belirler: `ongrid/offgrid/irrigation/accessory`
  urunler.html paket vitrininde ÇIKAR, `panel` gibi diğer gruplar yalnız
  online-satis.html kataloğunda listelenir. ItemList şeması da sayfaya göre
  süzülür (build.js `URUNLER_GROUPS`) — sayfada görünmeyen ürün şemaya girmez.
- `stock: N` → GERÇEK stok adedi. Ürün sayfasında rozet olarak yazar
  (N≤3 "Son N adet", N=0 "Tükendi", yoksa genel `commerce.stockLabel`) ve adet
  kutusu bu sayıyı AŞAMAZ. JSON-LD availability de buna bağlıdır. Statik çıktıda
  sayı içeren metin DICT'te eşleşmediğinden main.js etiketi `gespa:lang`
  olayında YENİDEN yazar; N>3'te build çevrilebilir genel rozet basar.
  Stok değişince SADECE config'teki bu satır güncellenir + `node build.js`.
- `discountPct: N` → SADECE o ürünün havale/EFT indirim oranı; yazılmazsa site
  geneli `cartDiscountPct` (%3) geçerlidir. Tek kural main.js `pkgPct()` ve
  build.js `pctOf()` — vitrin kartı, katalog, paket detayı, PKG/SHOP:STATIC,
  sepet ve llms-full.txt bunlara bağlıdır. Belli bir SON FİYAT hedefliyorsan
  listeyi ona göre kur: liste × (100−N)/100, en yakın 50 ₺'ye yuvarlanır.
  AMA hedef fiyat KARTTA DA geçerli olacaksa `discountPct` DEĞİL
  `noCartDiscount` + net fiyat kullan: `discountPct` yalnız havaleyi indirir,
  kasada liste fiyatı çekilir ve müşteri sepette gördüğünden fazla öder
  (BOOST'ta bu yaşandı, ₺7.200 net fiyata geçildi).
  Sepette oranları FARKLI kalemler varsa özet tek
  "%N" YAZMAZ, yalnız tutarı gösterir (main.js `pctOfLines`).
  UYARI: bu indirim yalnızca HAVALE/EFT'te geçerlidir — kart ödemesinde
  liste fiyatı tahsil edilir (server.js `pkgListTL`). "Sepette %N indirim"
  rozetinin yanında havale satırı hep dursun, yoksa kartla ödeyen yanılır.
- `brand: "…"` → ÜRÜNÜN markası (satıcının değil). Başka üreticinin markalı
  ürününde yazılır; boşsa JSON-LD'ye GESPA Enerji girer.
- `price: null` + `priceOnRequest: true` → fiyatı HENÜZ BELİRLENMEMİŞ ürün:
  rakam HİÇBİR YERDE üretilmez, her yerde "Teklif alın" yazar ve ürün sepete
  EKLENMEZ (katalog kartında sepet düğmesi yerine WhatsApp "Fiyat sor" çıkar,
  JSON-LD'ye `offers` girmez). Tek kural main.js `pkgUnit()` (`poa` döndürür) ve
  build.js'teki `poa` dalları — SHOP:STATIC, PKG:STATIC, ItemList, llms-full.txt
  hepsi buna bağlıdır. Fiyat gelince: `price:` yaz, `priceOnRequest` satırını
  SİL, `node build.js` çalıştır — başka dosyaya dokunmaya gerek yok.
- `noCartDiscount: true` → fiyat NETTİR, üstüne havale/EFT indirimi BİNMEZ ve
  havale satırı hiçbir yerde gösterilmez (kampanya fiyatlarında kullanılır).
  Tek kural main.js `pkgUnit()` ve build.js `havaleTL()`; vitrin kartı, paket
  detay statiği, PKG/SHOP:STATIC, llms-full.txt ve sepet özeti bunlara bağlıdır
  — yeni bir fiyat noktası eklersen onu da bu iki yardımcıya bağla. Sepette
  indirime giren kalem yoksa özet "−₺0" yerine "uygulanmaz" yazar.
- `freeShipping: true` → KARGO FİYATA DAHİL. Kart notu "KDV dahil · kargo
  hariç" yerine "KDV ve kargo dahil" olur, ürün sayfasında `data-pkg-vat` ve
  `data-pkg-ship` işaretleri kargo dahil metnini alır, llms-full.txt satırına
  "kargo fiyata DAHİL" eklenir. Liste fiyatı kargoyu İÇERDİĞİ için kart
  ödemesinde de ek kargo alınmaz. Tek kural main.js `vatNote()` ve build.js
  `vatNote()`/`shipNote()` — yeni bir kargo notu eklersen oraya bağla.
- `img` boşsa kart nötr yer tutucu (`.sh-noimg`) gösterir; BAŞKA ürünün
  fotoğrafı kullanılmaz. `url` boşsa "Detay" düğmesi ve bağlantılar basılmaz.
- `admin.pass`: admin.html şifresi (statik sitede yalnızca caydırıcı).
- Admin paneli fiyatları localStorage'da override eder (yalnız o cihaz);
  kalıcı/herkese yayın = değerleri bu dosyaya işleyip commit'lemek.

## Motor seçici & hazır paket (`config.evSets`)
`elektrikli-arac-donusum.html#paketler` — müşteri aracına hangi panelin
uyduğunu bilmediği için satış burada takılıyordu. Araç tipini seçer, uygun
panel + şarj kontrol cihazı + kablo + MC4 hazır paket olarak çıkar, tek
düğmeyle sepete girer (kalemler AYRI AYRI eklenir — fiyat, iyzico, dekont ve
e-posta akışları olduğu gibi çalışır). Paket içeriği değişince sayfadaki
dipnot kalem SAYMAZ ("yukarıda listelenen ürünler") — güncelleme unutulmasın.
- PAKETİN KENDİ FİYATI YOKTUR: toplam `items` içindeki ürünlerin
  `pkgUnit()` değerlerinden hesaplanır. Ürün fiyatı değişince paket
  kendiliğinden güncellenir — İKİNCİ BİR FİYAT KAYNAĞI AÇMA.
- SEPETTE TEK SATIR: paket `set:<id>` anahtarıyla eklenir, kalemler ayrı
  ayrı DEĞİL. main.js `setPkgOf()` sanal ürünü üretir (ad, görsel, toplam,
  `members`); `pkgUnit()` `isSet` dalında toplamları kalemlerden alır —
  yüzde YENİDEN HESAPLANMAZ (BOOST net, panel %3). Sepet satırında içerik
  yalnız AD olarak listelenir, kalem fiyatı gösterilmez. `pctOfLines()`
  sette tek "%N" yazmaz. Eski sepetlerdeki tekil ürün anahtarları aynen
  çalışmaya devam eder.
- MÜŞTERİYE GÖNDERİLEN BAĞLANTI: `?set=<id>` o paketi seçili açar ve
  `#paketler`e kaydırır; kart değiştikçe adres çubuğu `replaceState` ile
  güncellenir, "🔗 Paket bağlantısını kopyala" düğmesi mutlak adresi verir.
  Adres `llms-full.txt` ve statik blokta da yazılıdır.
- SUNUCU: `/api/pay/checkout` `set:<id>`i KALEMLERİNE AÇAR (iyzico sepeti
  kalem kalem ister, toplam = kalemler toplamı) ama sipariş kaydına paketi
  TEK SATIR yazar (`{id, set, qty, unitTL, members}`). `orderLines()` bunu
  set adı + içerik olarak çözer; e-postalar ve dekont böyle gösterir.
  Kalemlerden biri config'te yoksa/fiyatsızsa paket SATILMAZ.
- Kalemlerden biri config'te yoksa ya da fiyatsızsa o paket HİÇ
  gösterilmez (eksik set satılmasın); build de basmaz.
- main.js motor seçici IIFE'si çizer; `gespa:lang` olayında yeniden çizer.
  Olay `document` üzerinde ve `bubbles:false` — window'da dinlenmez. IIFE
  içinden `GESPA.applyLang` ÇAĞIRMA: olayı applyLang gönderiyor, sonsuz
  döngü olur.
- JS'siz ortam ve AI botları için build.js `MOTORSET:STATIC` işaretleri
  arasına aynı listeyi basar; llms-full.txt'e de ayrı bölüm yazılır.
  Statik blokta çevrilecek her ifade KENDİ `<span>`'inde durur — gövde
  çevirisi metin düğümünün TAMAMINI DICT'te arar, fiyatla aynı düğümde
  olan metin çevrilmez.
- Paket kutusunun SOL görseli setin kendi `proof` alanıdır — kart değişince
  o araca ait kurulum fotoğrafı gelir. İki `proof` de 4:3 kadrajdır
  (`tools/motor-foto.py`); farklı oranda olsalar kart seçildikçe kutunun
  yüksekliği zıplardı. `<img>` üzerindeki width/height ÖZNİTELİKLERİ CSS'e
  sunum ipucu olarak geçip height'ı sabitler — `height:auto` yazılmazsa
  `aspect-ratio` etkisiz kalır.
- GÖRSELLER: `assets/img/products/ev/motor-*.webp`, kaynakları
  `.../ev/kaynak/` altında + `tools/motor-foto.py` (DRY-RUN / `--uygula`).
  Araçlar BAŞKA ÜRETİCİLERE aittir (CSN, SFM) — marka yazıları SİLİNMEZ
  (UNV kuralı) ve sayfada "yalnızca tip örneğidir, araç satılmaz" notu
  KALIR. Kaynak belge de repoda: `.../ev/kaynak/elektrikli-motor-paketleri.docx`.

## Hesaplayıcı (`hesaplayici.html`)
- Tüm formüller ve katsayılar: @docs/hesaplayici-spec.md
- Katsayılar tek config dosyasında (`config.calc`) ve koddan ayarlanabilir.
- KURAL: Hesaplayıcı bileşenine hiçbir sayı (fiyat, katsayı, güç) hardcode ETME.

## SEO / AEO — statik üretim (AI botları JS çalıştırmaz!)
`node build.js` dil sayfalarına ek olarak TR kaynak sayfalara da yazar:
- `<!-- LD:STATIC -->` blokları: LocalBusiness (her sayfa), Product
  (su-isitici + cankurtaran), ItemList (urunler), BreadcrumbList — hepsi
  config'ten üretilir, `data-gld` işaretlidir; main.js `data-gld` görünce
  aynı şemayı yeniden enjekte etmez. Bu blokları ELLE DÜZENLEME.
- `data-c-text/tel/mailto/wa` iletişim alanları statik doldurulur
  (kaynak yine config; değişince build çalıştır, çıktıyı commit'le).
- Ürün içerikleri de statik basılır: su ısıtıcı tablosu (`#heaterRows`), paket
  listesi (`PKG:STATIC` işaretleri), markalar, sayaç değerleri, hesaplayıcı
  varsayımları/seçenekleri, hreflang kümesi, telif yılı.
- Dil sayfalarının GÖVDESİ build'de DICT ile statik çevrilir (FAQPage JSON-LD
  dahil); istemci i18n dinamik içerik için çalışmaya devam eder. Yeni metin
  eklerken DICT'e çeviri eklemek statik çıktıya da yansır.
- `sitemap.xml` build'de üretilir (TR + tüm dil sayfaları ayrı URL, hreflang'li;
  lastmod git'ten). Build ayrıca metin varlıklarını ön-sıkıştırır (.br/.gz —
  gitignore'da; server.js hazır dosyayı servis eder, ETag/304 destekler).
- Görsel türevleri (hero-640/960, *-thumb, *-800, gespa-icon-72) elle üretilmiş
  optimize kopyalardır; kaynak görsel değişirse türevini de yenile.
- AI GÖRÜNÜRLÜK ÖLÇÜMÜ: main.js analitik IIFE'si, ziyaretçi bir yapay zekâ
  asistanından geldiğinde GA4'e `ai_referral` olayı yazar (chatgpt, perplexity,
  claude, copilot, gemini, you, poe, grok, brave-ai, duckduckgo). Referrer'ın
  yalnız ALAN ADI okunur — özel sohbet adresi analitiğe sızmaz, tests/seo.test.js
  bunu doğrular. `contact_click` (tel/e-posta/WhatsApp) ve `quote_cta_click`
  dönüşüm olayları da buradadır. Bu kod bir kez "restore" commit'inde silindi;
  testin geçtiğini doğrulamadan main.js'i geri almayın.
- `llms-full.txt` config'ten üretilir (ürünler+fiyatlar+araçlar; llms.txt özet
  kalır, elle bakılır — fiyat/indirim değişince llms.txt'teki paket satırlarını da
  elle güncelle; çelişkide llms-full.txt esastır ve dosyada böyle yazar).
  robots.txt AI botlarına açıktır ve llms dosyalarına işaret eder.
- Ana sayfada WebSite JSON-LD (build üretir); statik `<img>`lerde width/height
  zorunludur (CLS) — JS kartları için yer `.pkg-media img{aspect-ratio}` ile ayrılır.

## Konvansiyonlar
- Sayfa linkleri `.html` uzantılı (GitHub Pages uyumu için).
- Her sayfada LocalBusiness JSON-LD bulunur (config'ten enjekte edilir).
- Görseller repoda `assets/img/` altında durur; dış siteden hotlink YAPMA.
- Galeri büyütme (lightbox) `main.js`'te: TÜM `.gallery` blokları + tekil
  `img[data-zoom]` görselleri. Su ısıtıcı ürün galerisi `assets/img/products/heater/`
  (`tank-1..8` + `-thumb`, beyaz zemin otomatik kırpılıp 4:3'e getirilmiş;
  `detay-*` yakın planlar, `baglanti-semasi.webp` (+`-900`) montaj şeması,
  `og-su-isitici.jpg` paylaşım görseli). Küçük resim →
  ana görsel geçişi `#pgMain` / `.prod-thumbs` ile; JS yokken bağlantı görseli açar.
- Ürün fotoğraflarında gövde üzerindeki yazı markası **GESPA**'dır. Tedarikçi
  fotoğrafları OEM marka (sino spring / LEXRUN / CIWA) taşır; `tools/marka-logo.py`
  bunu bulup yüzeyi doldurur ve aynı açı/tonda GESPA yazar (`--uygula` yazar,
  `-thumb` türevlerini de yeniler). Yeni foto gelince TARGETS'a satır ekle.
- Tedarikçiden gelen HAM fotoğraflar `assets/img/products/kaynak/` altında durur;
  `tools/foto-hazirla.py` bunları kırpar (kenar artefaktı/siyah şerit), OEM
  yazısını GESPA ile değiştirir ve yayın `.webp` türevini üretir — işler JOBS
  listesindedir (`--uygula` yazar). Kaynak dosyayı SİLME, yeniden üretilebilsin.
- Ana sayfadaki "Güneşten Bedava Sıcak Su" şeridinin görseli montaj şemasıdır:
  `baglanti-semasi-900.webp` (`.feature-diagram`, object-fit:contain, data-zoom
  ile büyür). Görselin etiketleri TR gömülüdür (i18n çevirmez). Eski inline SVG
  şema kaldırıldı; `.hs-*` stilleri ve DICT etiket çevirileri repoda duruyor.
- Açık/koyu tema, mobil menü, scroll animasyonları `assets/main.js` ile yönetilir;
  yeni DOM'lar `.reveal` ve `data-count` desenlerini kullanabilir.
- Ziyaretçi sayacı: footer'daki `.visit-counter` rozetini main.js enjekte eder
  (sayfalara elle eklenmez; ayarlar `config.visitors`). Canlıda server.js
  `/api/visitors` ile gerçek sayar (çerezle günde 1, bot filtreli; kalıcı veri
  `data/visitors.json` — gitignore'da, Railway'de DATA_DIR/Volume ile korunur).
  Gösterilen toplam = `visitors.base` + sunucu sayacı; API yoksa (Pages)
  base + günlük tahminle gösterilir.
- Sohbet botu `assets/chatbot.js` (main.js dinamik yükler): metinleri kendi içinde
  `[tr,en,de,ru]` dizileriyle çok dillidir (i18n DICT'e bağlı değildir); yeni yanıt
  eklerken 4 dili birlikte ekle. Footer sosyal linkleri `config.company.sameAs`'ten
  üretilir; boşken blok gizlenir.
- Çok dil (TR/EN/DE/RU): `assets/i18n.js` metinleri TR kaynağına göre çevirir; yeni metin
  eklerken DE/RU karşılığını `DICT`'e ekle, yoksa zarifçe TR kalır.
  DİKKAT: `content/translation-fixes.json` ikinci bir çeviri kaynağıdır.
  `content/build-seo.js` → `translations()` onu build sırasında DICT'in ÜSTÜNE
  yazar; yani oradaki bir anahtar, i18n.js'e elle eklediğinizi EZER. Bir metin
  beklediğinizden farklı çevriliyorsa önce bu dosyaya bakın, aynı anahtarı iki
  yere yazmayın. Sayfa GÖVDESİNDEKİ statik metinler için bu dosya yeterlidir.
  BİLİNEN EKSİK: `build-seo.js` → `generate()` bu satırları i18n.js'e de
  yazmak ister ama aradığı `// Additional static and runtime product/tool
  translations.` işaretçisi i18n.js'te YOK; regex eşleşmeyince sessizce hiçbir
  şey yapmıyor. Sonuç: translation-fixes satırları STATİK çıktıya geçer,
  istemci sözlüğüne geçmez. JS ile ÇİZİLEN metnin (katalog kartı, ürün adı,
  builder) çevirisi bu yüzden doğrudan `assets/i18n.js` DICT'ine yazılmalıdır. Marka/iletişim
  (`data-c-text`) ve dinamik sayılar çeviriden hariç tutulur.
- YASAL SAYFALAR YALNIZ TÜRKÇE yayınlanır (`kvkk` `gizlilik` `cerez-politikasi`
  `mesafeli-satis-sozlesmesi` `iade-teslimat`): bağlayıcı metin Türkçedir, dil
  kopyası ÜRETİLMEZ. Liste build.js `TR_ONLY` — PAGES'te DEĞİLDİR. Sonuçları:
  hreflang kümesi yalnız `tr` + `x-default`, sitemap'e tek TR URL'siyle girer,
  dil sayfalarındaki footer bağlantısı kök TR adresinde kalır (PAGES'te
  olmadığı için link yerelleştirmesi dokunmaz). Eski `/en/kvkk.html` gibi
  adresler server.js'te TR sürümüne **301** yönlendirilir — indekslenmiş
  URL'ler 404 olmasın. Yeni yasal sayfa eklersen TR_ONLY'ye de yaz.
- SEO için diller **ayrı URL**lerde sunulur: kök=TR, `/en` `/de` `/ru`. `build.js`
  kök sayfalardan üretir (lang/title/description/canonical/og statik gömülür, gövde
  istemci i18n ile çevrilir). Sayfa `<title>`/description çevirisi `build.js` içindeki
  `META` tablosundadır — yeni sayfada oraya da satır ekle. Dil değiştirici ilgili
  dil URL'sine yönlendirir; `hreflang` `i18n.js` tarafından enjekte edilir.

## Ödeme (iyzico)
Kart ödemesi server.js'te bağımlılıksız iyzico Ödeme Formu entegrasyonu:
`/api/pay/status` (aktif mi) · `/api/pay/checkout` (sepet → iyzico sayfası;
tutar SUNUCUDA config'ten hesaplanır, istemci fiyatı yok sayılır; TCKN zorunlu)
· `/api/pay/callback` (iyzico dönüşü → odeme-sonuc.html). Anahtarlar YALNIZCA
Railway ortam değişkeni: IYZIPAY_API_KEY / IYZIPAY_SECRET_KEY / IYZIPAY_BASE_URL
(sandbox varsayılan; canlı = https://api.iyzipay.com). IYZICO_* adlandırması da
kabul edilir (firma "iyzico", API alan adı "iyzipay" — panelde karışıyor);
IYZIPAY_* tanımlıysa o önceliklidir. Anahtar yoksa sepetteki
kart seçeneği "çok yakında" kalır (Pages aynasında da böyle). Siparişler
DATA_DIR/orders.json. Kart ödemesinde havale indirimi YOK (liste fiyatı);
`odeme-sonuc.html` noindex + robots engelli + build PAGES dışı (TR tek dil).
`odeme.html`: GES Marketim/serbest tutar link ödemesi
(`?t=tutar&a=aciklama&s=no&tek=1|&tks=N` ön-doldurur) → `/api/pay/custom`
(tutar istemciden; sınır 50–250.000 ₺ sunucuda, **kuruş kabul edilir**,
kargo öncesi orders.json/iyzico panelinden tutar DOĞRULANIR). O da noindex.
TAKSİT: iyzico hesabı vade farkını MÜŞTERİYE yansıtıyor — ₺20.000 gönderince
kartından ₺20.093,81 çekiliyor. `tek=1` → `enabledInstallments:[1]` (tek çekim,
tutar tam tahsil edilir) · `tks=N` → `enabledInstallments:[N]` (yalnız N taksit;
sabitlenmezse müşteri başka taksit seçer ve geri hesaplanan tutar tutmaz).
`/api/pay/installments` iyzico'nun KENDİ oranlarını okur (salt okunur, ödeme
akışına dokunmaz); admin'deki "💳 Taksit farkı ve yuvarlama" kartı bununla
"tam ₺X tahsil etmek için ne göndermeli"yi hesaplar (en YÜKSEK orana göre —
müşteri hedeften fazla ödemez). Kalıcı çözüm iyzico panelinde vade farkını
müşteriye yansıtmayı KAPATMAKTIR; o zaman bu araç gereksizdir.
Bu bağlantıyı ÜRETEN araç `admin.html`'deki "🔗 Ödeme Bağlantısı Üret" kartıdır
(tutar/açıklama/sipariş no/taksit → kopyala · WhatsApp · önizle; `payLink()`). Adres
`config.company.web`'den kurulur — `/api/pay/*` yalnız Railway'de vardır, Pages
aynasında yoktur; `location.origin` kullanılsa Pages'ten üretilen bağlantı ölür.
Kart ödemesi kapalıysa kart bunu bağlantı gönderilmeden ÖNCE uyarır.
Menüden erişilmez, robots'ta engellidir — site genelinde bağlantısı YOKTUR,
adresi elle yazılır.

## Ürün akışı — `urunler.xml`
`build.js` `writeProductFeed()` config.packages'ten **Google Merchant Center
biçiminde RSS 2.0** akışı üretir. Aynı biçimi iyzico "XML ile Ürünlerinizi
Yükleyin", Google Shopping ve Meta katalogları okur. Adres:
`https://www.gespaenerji.com/urunler.xml` — panellere BU yazılır, ürün
sayfasının HTML adresi DEĞİL.
- Fiyat **LİSTE** fiyatıdır (KDV dahil). Havale/EFT indirimi bir ÖDEME YÖNTEMİ
  indirimi olduğu için akışa GİRMEZ; girseydi kartla ödeyen yanılırdı.
- USD ürünler `usdTry` ile TL'ye çevrilir — site kartlarıyla AYNI yuvarlama.
- `price: null` (teklif usulü) ve görseli olmayan ürün akışa GİRMEZ;
  Merchant Center fiyat ve görseli zorunlu tutar.
- Kendi sayfası olmayan ürünün iniş sayfası `online-satis.html`'dir.
- Barkod (GTIN) yok; `sku` alanı `g:mpn` olur. Hiçbiri yoksa
  `g:identifier_exists=no` basılır — yoksa akış REDDEDİLİR.
- Stok `0` ise `out of stock`. Ürün eklemek = SADECE config.packages + build.
- `<g:shipping>` ülkeyi **TR** ile sınırlar (yalnız Türkiye'ye gönderiyoruz).
  Ücret SADECE `freeShipping` üründe 0 TRY yazılır; diğerlerinde tutar
  mesafeye göre değiştiğinden rakam UYDURULMAZ, Merchant Center hesap
  ayarındaki kargo tablosu geçerli olur.
- FİYAT PARA BİRİMİ KURALI: şema ve akış **TAHSİL EDİLEN** para birimini
  yazar (TRY). USD ürünler `priceTRY()` ile çevrilir — yuvarlama main.js
  `pkgUnit()` ve server.js `pkgListTL` ile AYNI. Şemaya `$` yazmak, kasada
  ₺ çekildiği için Google'da "fiyat/para birimi eşleşmiyor" ihlali doğurur.

## Sipariş e-postaları ve dekont
Ödeme BAŞARILI olunca (`/api/pay/callback`) **iki** e-posta gider, ARDIŞIK
(tek SMTP oturumu): 1) işletmeye tam döküm — müşteri bilgileri, **fatura için
T.C. kimlik no**, kalemler, tutar, iyzico ödeme numarası (`orderMailBody()`);
2) müşteriye ödeme onayı + dekont bağlantısı (`customerMailBody()`) — KVKK
gereği TCKN ve açık adres YAZILMAZ, e-posta iletilebilir. Müşteri adresi yoksa
ya da `info@gespaenerji.com` yedeğine düşmüşse ikinci posta atlanır.
Gönderici server.js içinde bağımlılıksız SMTP istemcisidir (`sendMail(to, …)`);
465 örtük TLS ve 587 STARTTLS yolları sahte SMTP sunucusuyla uçtan uca test edildi.
- DEKONT: callback rastgele bir `rid` üretip sipariş kaydına yazar ve
  `odeme-sonuc.html?d=ok&r=<rid>` adresine yönlendirir; sayfa `/api/order/receipt`
  ile kayıt bilgilerini çekip yazdırılabilir makbuz gösterir (`window.print()`,
  `@media print` sayfa süslerini gizler). iyzico token'ı adres çubuğuna DÜŞMEZ.
  Uç nokta TCKN, açık adres, telefon ve e-posta DÖNDÜRMEZ. Kayıt yoksa
  (Volume bağlı değilse dağıtımda silinir) blok gizli kalır, sayfa yine çalışır.
- Callback ÖNCE yönlendirir, postaları SONRA gönderir ve hepsi try/catch
  içindedir: burası iyzRequest geri çağrısıdır, ana try/catch'in DIŞINDA —
  korumasız bir istisna sunucu sürecini düşürürdü.
- TEŞHİS: `/api/pay/status` artık `{enabled, mail}` döner (`mail:false` =
  Railway değişkenleri yok). Admin'deki "✉️ Sipariş e-postası" kartı bunu
  gösterir ve `/api/pay/mailtest` ile canlı sipariş beklemeden test postası
  gönderir (config.admin.pass + dakikada 1 istek; alıcı YALNIZ ORDER_EMAIL_TO,
  serbest alıcı kabul edilmez). Gönderim hatası orders.json'a `mailErr` yazılır.
- Ayarlar YALNIZCA Railway ortam değişkeni — parola repoya ASLA yazılmaz:
  `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `ORDER_EMAIL_TO`.
  Gmail'de normal parola çalışmaz, **Uygulama Şifresi** gerekir.
- Ayar eksikse e-posta sessizce atlanır; ödeme akışı ETKİLENMEZ. Müşteri
  bekletilmez: yönlendirme hemen yapılır, e-posta arka planda gider.
- SNI yalnız alan adıyla gönderilir; host IP ise `servername` verilmez —
  verilirse TLS el sıkışması hata bile vermeden askıda kalır.
- TCKN artık `orders.json`'a da yazılıyor (önceden yalnız iyzico'ya gidiyordu).
  KVKK: TCKN log'a ASLA yazılmaz, yalnız sipariş kaydında ve e-postada durur.
- UYARI: `DATA_DIR` bir Railway **Volume**'a bağlı değilse orders.json her
  dağıtımda SİLİNİR — sipariş kayıtları ve dekont bağlantıları kaybolur.

## Alan adı & NAP tutarlılığı
- Canlı alan adı **www.gespaenerji.com** — canonical, sitemap, JSON-LD ve
  `config.company.web` hepsi böyle. www'suz `gespaenerji.com` de açıldığı için
  server.js apex'i www'ya **301** yönlendirir (sorgu dizesi korunur); aksi
  hâlde aynı içerik iki host'tan servis edilip yinelenen içerik sayılırdı.
- Adres/telefon Google İşletme Profili ile BİREBİR aynı olmalı (yerel SEO'da
  "NAP tutarlılığı"). Doğru adres: **Örnek Mahallesi** 1551 Sok. No: 10/1,
  Manavgat/Antalya — Google kaydında "Aşağı Pazarcı" yazıyorsa Google
  düzeltilir, config DEĞİL (config resmî sicil adresidir).
- `config.company.sameAs`: Facebook · Instagram · YouTube. Footer sosyal
  bloğu ve JSON-LD buradan üretilir; boşken blok gizlenir.
- `config.company.sisterSites`: aynı firmaya ait DİĞER siteler (şu an
  solaranaliz.tr). build.js `hydrateSisterSites()` footer "Kurumsal"
  sütununda GES Marketim bağlantısının ardına `SISTER:STATIC` işaretleri
  arasına basar (her build'de yeniden yazılır, çoğalmaz) ve adresleri
  JSON-LD `sameAs`a KATAR. Sosyal ikon şeridine GİRMEZ — orası yalnız
  `sameAs` okur, yoksa kardeş site "🌐" ikonuyla sosyal hesap gibi görünürdü.
  Etiketin çevirisi `assets/i18n.js` DICT'indedir (marka adı çevrilmez).

## Ağ Kısıtı (ÖNEMLİ)
- Buluttaki Claude Code dış sitelere (ör. solaranaliz.tr, gespaenerji.com)
  ERİŞEMEZ — egress izin listesi kısıtı. "Git şu siteyi taklit et / kazı" çalışmaz.
- Dış veri gerekiyorsa: içeriği DOSYA olarak repoya ekle, ya da yerel Claude Code kullan.

## Yerel çalıştırma & Yayın
- Dil sayfalarını üret: `npm run build` → `node build.js` (`/en` `/de` `/ru`).
- Geliştirme: `npm start` → `node server.js` (http://localhost:3000); başlangıçta build çalışır.
- Railway: `package.json` + `railway.json`; `npm start` ile yayınlanır (canlı site).
- GitHub Pages: `.github/workflows/deploy-pages.yml` upload'tan önce `node build.js` çalıştırır.

## Test (commit öncesi)
- `node -c assets/main.js && node -c server.js` (söz dizimi).
- Sunucuyu başlatıp ana sayfaların 200 döndüğünü doğrula.
