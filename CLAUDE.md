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
`index.html` (tam-genişlik hero slider `.hero2`, 5 slayt: PV enerji sahnesi →
GES foto → su ısıtıcı → AI cankurtaran → GES Marketim e-mağaza.
1. slayt `.hero2-pv`: solda metin, sağda inline SVG sahne (`.pv-*`) —
güneş → panel → DC → inverter/batarya → AC 220V → ev; tümü CSS animasyonu
(SMIL yok), azaltılmış harekette `.hero2-pv .pv-scene *{animation:none}`.
Tema değişkenlerini kullanır, koyu temada da doğru görünür. Sayfanın TEK `<h1>`'i
bu slayttadır (diğer slaytlar `<p class="hero2-title">`) — gizli slayttaki h1
erişilebilirlik ağacına girmiyordu. Hero fotoğrafı 2. slayt: `loading="lazy"`,
preload YOK. Otomatik döngü İLK KULLANICI ETKİLEŞİMİNDE başlar (main.js hero
IIFE, `engage()`): karusel kendiliğinden tam ekran fotoğrafa geçerse o boyama
LCP adayı olup metriği ~0,2 sn'den ~5 sn'ye çıkarıyordu. Süre
`config.hero.intervalMs`, ok/nokta kontrolleri var, azaltılmış harekette
otomatik dönmez. Slaytlar tek grid hücresinde üst üste durur — bölüm yüksekliği
en uzun slayta göre sabit, dile göre zıplama olmaz. Açık zeminli 1. slayt
aktifken nokta/oklar `.hero2-pv.is-on ~ ...` ile koyulaştırılır. E-mağaza
linkleri: `config.company.shop` kaydı; hero slaytı, urunler şeridi ve TÜM
footer'lardaki "GES Marketim (E-Mağaza) ↗") ·
`hizmetler.html` · `urunler.html` (paket vitrini; yalnız 2 kit) ·
`paket-285w.html` `paket-2x540w.html` (e-ticaret ürün sayfası: solda galeri
`#pgMain`+`.prod-thumbs`, sağda satın alma kutusu `.buy-box` — ürün kodu, stok,
fiyat, havale tutarı, `.qbox` adet kutusu, CTA'lar, kargo/iade bilgi listesi;
altında 4 sekme `.ptabs`/`.ptab-panel` = açıklama · pakete dahil olanlar · teknik ·
kargo-iade. Fiyat/kod/stok hem build'de statik basılır hem main.js'te
`data-pkg-*` ile tazelenir. Satın alma sepet üzerinden: `data-add-cart` =
sepete ekle + onay penceresi (Sepete git / Alışverişe devam), `data-add-cart-go`
= ekle ve sepete git) ·
`sepet.html` (sepet + sipariş: kalem listesi JS ile çizilir, özet/form statik;
noindex + robots engelli + sitemap dışı ama build dil kopyalarını üretir.
Sepet verisi localStorage `gespa-cart` = {paketId: adet}; birim fiyat kuralı
main.js `pkgUnit()` — TÜM fiyat noktaları bununla hesaplanır. Üst menüdeki 🛒
rozeti main.js'in `.nav-actions`a enjekte ettiği istemci bileşenidir, sayfalara
elle eklenmez. Sipariş WhatsApp mesajına çok kalemli döküm yazılır) ·
`su-isitici.html` (PV su ısıtıcı) · `ai-cankurtaran-destek-sistemi.html`
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
Nav menü (teknoloji firması yapısı): Ana Sayfa · Solar Sistemler (açılır grup:
Çatı & Arazi GES Kurulumu → hizmetler.html + Paket Ürünler → urunler.html +
Tarımsal Sulama + Solar Su Isıtıcı + Toptan Satış (B2B) + GES Marketim
(E-Mağaza) ↗ dış link) · AI Teknolojileri (açılır grup: AI Cankurtaran Destek
Sistemi) · Araçlar (açılır grup: Tasarruf Hesaplayıcı + Sistem Kurucu) ·
Projeler · Hakkımızda · Teklif Al. Paket detay/sepet sayfalarında "Paket
Ürünler" aktif işaretlenir; alt sayfa aktifken üst `menu-parent` de ` active`
alır. Yeni sayfa eklenince TÜM sayfalarda güncelle (toplu değişiklik için
scratchpad `nav2.py` deseni; menü 1180px altında hamburger'a düşer).

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
- `packages[]`: 2 komple kit (285W ₺ · 2x540W USD) — `url` detay sayfası,
  `img` gerçek foto, `oldPrice` indirim rozeti, `currency:"USD"` dolar,
  `dailyKwh` günlük üretim. `usdTry` kuru ile ikinci para "≈" gösterilir;
  kur değişince SADECE config.usdTry güncellenir. Yeni ürün eklerken aynı
  alanlar + detay sayfası (mevcut paket-*.html kopyala) + build META satırı.
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
- `admin.pass`: admin.html şifresi (statik sitede yalnızca caydırıcı).
- Admin paneli fiyatları localStorage'da override eder (yalnız o cihaz);
  kalıcı/herkese yayın = değerleri bu dosyaya işleyip commit'lemek.

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
- Ana sayfadaki "Güneşten Bedava Sıcak Su" şeridinin görseli foto değil, inline
  SVG şemadır (`.feature-svg` + `.hs-*` stilleri): güneş → panel → tank → musluk,
  altta "bulutluyken şebeke" rozeti. Etiketler `<text>` düğümüdür ve i18n DICT'ten
  çevrilir — yeni etiket eklerken 4 dile birden ekle, kutuya sığdığını doğrula.
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
  eklerken DE/RU karşılığını `DICT`'e ekle, yoksa zarifçe TR kalır. Marka/iletişim
  (`data-c-text`) ve dinamik sayılar çeviriden hariç tutulur.
- SEO için diller **ayrı URL**lerde sunulur: kök=TR, `/en` `/de` `/ru`. `build.js`
  kök sayfalardan üretir (lang/title/description/canonical/og statik gömülür, gövde
  istemci i18n ile çevrilir). Sayfa `<title>`/description çevirisi `build.js` içindeki
  `META` tablosundadır — yeni sayfada oraya da satır ekle. Dil değiştirici ilgili
  dil URL'sine yönlendirir; `hreflang` `i18n.js` tarafından enjekte edilir.

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
