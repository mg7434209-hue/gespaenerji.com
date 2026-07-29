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
`index.html` · `hizmetler.html` · `urunler.html` (paket ürünler) ·
`su-isitici.html` (PV su ısıtıcı) · `ai-cankurtaran-destek-sistemi.html`
(havuz güvenliği; lacivert/aqua `pool-*` stilleri, form → WhatsApp lead) ·
`hesaplayici.html` · `sistem-kur.html` (Sistem Kurucu sihirbazı) ·
`projeler.html` · `hakkimizda.html` · `iletisim.html` ·
`tarimsal-sulama.html` · yasal: `kvkk.html` `gizlilik.html` `cerez-politikasi.html`
Ayrıca `admin.html`: fiyat yönetim paneli (menüde yok, robots'ta engelli,
build PAGES listesine EKLENMEZ). Her sayfa: ortak header/footer, aktif menü
vurgusu, breadcrumb, sayfaya özel SEO başlığı/canonical/Open Graph içerir.
Nav menü: Ana Sayfa · Hizmetler · Ürünler · Yeni Teknolojiler (açılır grup:
AI Cankurtaran + Solar Su Isıtıcı) · Araçlar (açılır grup: Tasarruf Hesaplayıcı +
Sistem Kurucu) · Projeler · Hakkımızda · Teklif Al — yeni sayfa eklenince TÜM
sayfalarda güncelle (menü 1180px altında hamburger'a düşer).

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
  kablo/pano/işçilik çoklu seçim = kutucuk, miktar `extraQty()` ile panel
  sayısı/metraj/kWp'ye göre). Yeni kategori eklerken bu deseni koru.
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
- `packages[]`: paket ürünler (urunler.html) — `group`: offgrid | irrigation
  (ongrid grubu render'da tanımlı ama şu an paketi yok). Açık `price` verilirse
  o kullanılır; yoksa fiyat `calc.costPerKwp`'ten türetilir.
- `heater`: PV su ısıtıcı modelleri + ₺ fiyatları (su-isitici.html tablosu ve
  Product JSON-LD buradan render edilir).
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
  kalır, elle bakılır). robots.txt AI botlarına açıktır ve llms dosyalarına işaret eder.

## Konvansiyonlar
- Sayfa linkleri `.html` uzantılı (GitHub Pages uyumu için).
- Her sayfada LocalBusiness JSON-LD bulunur (config'ten enjekte edilir).
- Görseller repoda `assets/img/` altında durur; dış siteden hotlink YAPMA.
- Açık/koyu tema, mobil menü, scroll animasyonları `assets/main.js` ile yönetilir;
  yeni DOM'lar `.reveal` ve `data-count` desenlerini kullanabilir.
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
