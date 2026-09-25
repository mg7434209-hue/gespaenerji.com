/* ============================================================
   GESPA Enerji — TEK DOĞRU KAYNAK (config)
   Şirket bilgileri, markalar ve hesaplayıcı katsayıları.
   Sayfalardaki içerik buradan beslenir (assets/main.js enjekte eder).
   İletişim/katsayı değişince SADECE bu dosyayı düzenleyin.
   ============================================================ */
window.GESPA = window.GESPA || {};
window.GESPA.config = {
  company: {
    legalName: "Gespa Enerji Sanayi Ticaret Limited Şirketi",
    brandName: "GESPA Enerji",
    phone: {
      display: "0543 743 42 09",
      tel: "+905437434209",      // tel: linkleri
      wa: "905437434209"          // wa.me/ linkleri
    },
    // Alan adına ait kurumsal adres (Turhost mail hosting; MX -> gespaenerji.com).
    // Sitedeki TÜM mailto linkleri, yasal sayfalardaki satıcı künyesi ve
    // JSON-LD bu tek alandan beslenir.
    email: "info@gespaenerji.com",
    address: {
      // Ticaret sicili / vergi levhasındaki resmî adresle BİREBİR aynı olmalı
      line: "Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01",
      district: "Manavgat",
      city: "Antalya",
      postalCode: "07600",
      country: "TR",
      full: "Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya"
    },

    // Havale/EFT ödemelerinin yapılacağı ŞİRKET hesabı. Hesap sahibi, ticaret
    // unvanı ile birebir aynı olmalıdır — şahıs hesabına ödeme kabul edilmez.
    // Sepet ödeme kutusu ve mesafeli satış sözleşmesi bu alandan beslenir.
    bank: {
      name: "VakıfBank",
      accountHolder: "Gespa Enerji Sanayi Ticaret Limited Şirketi",
      iban: "TR89 0001 5001 5800 7320 2443 78"
    },

    // Resmî tescil bilgileri — MATSO oda kayıt sicil sureti (01.11.2022, No 00007385)
    // ve Manavgat VD vergi levhası ile doğrulanmıştır. Footer + iletisim.html
    // "Şirket Bilgileri" bloğuna ve LocalBusiness JSON-LD'ye buradan basılır.
    // Reklam/ödeme platformlarının işletme doğrulaması bu alanlara bakar.
    registry: {
      taxOffice: "Manavgat Vergi Dairesi",
      taxNo: "3941259669",                 // vergi kimlik no (VKN)
      mersis: "0394125966900001",
      tradeRegistryNo: "14369",            // ticaret sicil no
      chamber: "Manavgat Ticaret ve Sanayi Odası",
      chamberRegNo: "14361",               // oda sicil no
      nace: "43.21.01",
      capital: "2.000.000 TL"       // sicil kaydı (sitede GÖSTERİLMİYOR — istek üzerine kaldırıldı)
    },
    web: "https://www.gespaenerji.com",
    hours: "Hafta içi 09:00 – 18:00",
    // SEO / schema.org zenginleştirme — boş bırakılan alanlar JSON-LD'ye yazılmaz
    openingHours: "Mo-Fr 09:00-18:00",   // schema.org LocalBusiness.openingHours
    priceRange: "₺₺",                     // tahmini fiyat aralığı (zorunlu değil ama önerilir)
    slogan: "Manavgat ve Antalya'da anahtar teslim güneş enerjisi santralleri",
    description: "Gespa Enerji; Manavgat/Antalya merkezli, çatı ve arazi tipi güneş enerjisi santralleri (GES) ile güneş enerjili tarımsal sulama için anahtar teslim mühendislik, kurulum, finansman ve bakım hizmeti sunar.",
    // JSON-LD foundingDate: GESPA markasının Manavgat'ta faaliyete başladığı
    // yıl. KARAR (Eyl 2026): şirket/şahıs ayrımı anlatılmaz, 2005'ten bu yana
    // TEK süregelen hikâye; hakkimizda.html de böyle yazar. Ticaret siciline
    // tescil (01.11.2022) yasal künyede (registry) durur, foundingDate'e girmez.
    foundingYear: 2005,
    // Deneyim rozeti de aynı başlangıç yılından hesaplanır.
    experienceSince: 2005,
    areaServed: ["Manavgat", "Side", "Antalya", "Alanya", "Serik", "Gazipaşa", "Akseki", "Gündoğmuş"],
    knowsAbout: ["Güneş enerjisi santrali (GES)", "Çatı GES", "Arazi tipi GES", "Güneş enerjili tarımsal sulama", "Güneş paneli", "İnverter", "Enerji depolama / batarya", "Lisanssız elektrik üretimi"],
    services: ["Çatı GES", "Arazi Tipi GES", "Güneş Enerjili Tarımsal Sulama", "Enerji Depolama (Batarya)", "Mühendislik & Projelendirme", "Finansman & Leasing", "Bakım (O&M)"],
    rating: { value: null, count: null }, // GERÇEK Google yorum ortalaması/sayısı girilince aggregateRating eklenir (uydurma değer GİRMEYİN)
    // Google Haritalar'daki işletme kaydının koordinatı (sağ tık → ilk satır).
    // LocalBusiness.geo alanına girer; yerel aramada harita eşleşmesini güçlendirir.
    geo: { lat: 36.777346, lng: 31.458277 },
    // Sosyal medya profilleri → JSON-LD `sameAs` + footer sosyal blok.
    // Google ve AI asistanları bu bağlantılarla siteyi, sosyal hesapları ve
    // Google İşletme kaydını TEK firma olarak eşleştirir. Uydurma URL GİRMEYİN.
    sameAs: [
      "https://www.facebook.com/gesmarketim/",
      "https://www.instagram.com/gespaenerji_07/",
      // NOT: kanal adı şu an "mustafa göksoy" — firma adı DEĞİL. Kanalı
      // "GESPA Enerji" olarak yeniden adlandırmak varlık eşleşmesini
      // belirgin şekilde güçlendirir (YouTube'dan tek tıkla değişir).
      "https://www.youtube.com/@mustafagoksoy6557"
    ],
    // Solar e-mağazamız (ayrı site; Google Ads trafiği alır) — vitrin/footer linkleri
    shop: { name: "GES Marketim", url: "https://www.gesmarketim.com" },
    // Aynı firmaya ait DİĞER siteler. Footer "Kurumsal" sütununa bağlantı
    // basılır (build.js SISTER:STATIC) ve JSON-LD `sameAs`a girer — arama
    // motorları iki siteyi aynı firmanın varlığı olarak eşleştirir.
    // Sosyal ikon şeridine GİRMEZ (orası yalnız sameAs'tan beslenir).
    sisterSites: [
      { label: "Solar Analiz (Fatura Analizi)", url: "https://www.solaranaliz.tr" }
    ],
    // Vitrin istatistikleri — TEK KAYNAK (build data-stat öğelerine basar)
    stats: { projects: 500, installedMw: 15, experienceYears: 20, warrantyYears: 25, satisfactionPct: 98 }
  },

  // Analitik — ID girilince yüklenir (boş = kapalı). KVKK için çerez onayı önerilir.
  analytics: {
    ga4: "G-1BLPXB0V5S"   // örn. "G-XXXXXXXXXX" (Google Analytics 4 ölçüm kimliği)
  },

  // Ziyaretçi sayacı (footer rozeti) — main.js enjekte eder, sayfalara elle eklenmez.
  // Canlı sitede (Railway) server.js /api/visitors ile GERÇEK ziyaret sayar
  // (çerezle günde 1 kez; bot filtreli). Gösterilen toplam = base + sunucu sayacı.
  // Sunucu sayacı DATA_DIR (Railway Volume) yoksa dağıtımda sıfırlanabilir —
  // o durumda base'i güncelleyerek toplamı taşıyın. API yoksa (GitHub Pages)
  // base + geçen gün × perDayEstimate ile TAHMİNİ değer gösterilir.
  visitors: {
    enabled: true,
    // taban: start tarihine kadarki toplam ziyaret. Railway'de Volume YOKKEN
    // sunucu sayacı her dağıtımda sıfırlanır ve rozet bu tabana döner (admin
    // "💾 Kalıcı veri" kartı durumu gösterir). 25 Eyl 2026: 1000'den 1088'e
    // taşındı — sıfırlanmadan önce görülen 1.080 + sonraki 8 ziyaret.
    base: 1088,
    start: "2026-09-25",     // base'in geçerli olduğu tarih (YYYY-AA-GG)
    perDayEstimate: 30,      // API yokken günlük tahmini ziyaret artışı
    showOnline: true         // "şu an sitede" canlı sayısı (yalnız API varken)
  },

  // Kullanılan markalar — her grup kendi başlığıyla listelenir
  // (hizmetler.html blokları + ana sayfa marka şeridi; boş dizi = gizli).
  brands: {
    panel: ["Arçelik", "Lexron", "Bakırlar"],
    inverter: ["Tescom", "Mexxsun", "Lexron", "Arçelik", "Deye", "TitanX"],
    // MS Teknik: BOOST MPPT şarj kontrol cihazının üreticisi. Yalnız marka ADI
    // yazılır — tedarikçinin telefonu/iletişimi siteye KONMAZ.
    mppt: ["Havensis", "MS Teknik"],
    battery: ["Orbus", "TitanX"],
    // Kendi markamız (GESPA gövde yazılı ürünler). Kategori vitrini yoktur,
    // yalnız ana sayfa "Çalıştığımız ekipman markaları" şeridine girer.
    own: ["GESPA"]
  },

  // ---- Paket ürünler (urunler.html) ----
  // TEK YER: paket gücü/özellikleri burada tanımlanır. Türetilen alanlar
  // (panel/alan/üretim ve fiyatı verilmemiş paketlerin fiyatı) assets/main.js'te
  // config.calc katsayılarından hesaplanır:
  //   fiyat ≈ kwp × calc.costPerKwp (+ battery × calc.batteryCostPerKwh)
  //   panel = ceil(kwp×1000 / calc.panelW) · alan = kwp × calc.areaPerKwp
  //   üretim ≈ kwp × (varsayılan bölge verimi)
  // Açık `price` (₺) verilirse o kullanılır (ör. bataryalı taşınabilir kitler;
  // perakende fiyatı formülle örtüşmez). `group`: ongrid | offgrid | irrigation.
  // İsim/açıklama/özellik TR kaynaktır; çeviri assets/i18n.js DICT'ten gelir
  // (eşleşmeyen metin zarifçe TR kalır).
  // USD/TRY kuru — kitlerde ikinci para birimi karşılığı için (₺/$).
  // Kur değişince SADECE burayı güncelleyin; "≈" ile yaklaşık gösterilir.
  usdTry: 47.5,
  // Ana sayfa hero slaytı — dönüş süresi (ms). Kısaltmak = daha hızlı döngü.
  hero: { intervalMs: 4000 },

  // Sepet indirimi (%) — vitrinde LİSTE fiyatı gösterilir, indirim sipariş
  // adımında uygulanır ("Sepette %N indirim" rozeti). 0 = kapalı.
  // ORAN SABİT YAZILMAZ: sayfalardaki metinler orandan bağımsızdır, rakamı
  // yalnızca kart rozeti ve sipariş özeti config'ten okuyup yazar.
  cartDiscountPct: 3,

  // ============================================================
  // TOPTAN SATIŞ / B2B (toptan.html) — hazır stok listesi
  // KURAL: Fiyat YAZILMAZ (toptan fiyat adede göre teklifle verilir).
  // `stock` gerçek stok adedidir; stok değişince SADECE burası güncellenir,
  // ardından `node build.js` (sayfa + llms-full statik basılır).
  // `price` alanı eklenirse kartta gösterilir (istenirse ileride).
  // ============================================================
  b2b: {
    // Sevkiyat/koşul satırları (sayfada "Toptan koşullar" kutusu)
    terms: [
      "Kurumsal faturalı satış — bayi, EPC, kurulumcu, otel ve kooperatiflere",
      "Hazır stok: sipariş onayından sonra hızlı sevkiyat, Türkiye'nin her iline nakliye",
      "Adede göre kademeli toptan fiyat — teklif aynı gün iletilir",
      "Ödeme: havale/EFT (proforma fatura ile)"
    ],
    products: [
      {
        id: "b2b-arcelik-540", cat: "panel", icon: "🔆",
        brand: "Arçelik", name: "Arçelik 540 W Güneş Paneli",
        stock: 500, unit: "adet",
        specs: ["540 W güç", "Yetkili tedarik — orijinal ürün", "Palet bazında sevkiyat"]
      },
      {
        id: "b2b-aku-51v-100ah", cat: "aku", icon: "🔋",
        brand: "", name: "51,2 V 100 Ah LiFePO₄ Akü",
        stock: 50, unit: "adet",
        specs: ["51,2 V · 100 Ah — 5,12 kWh", "LiFePO₄ (lityum demir fosfat) kimya", "Ev/ticari depolama ve off-grid sistemler"]
      },
      {
        id: "b2b-inverter", cat: "inverter", icon: "⚡",
        brand: "", name: "Toptan İnverter",
        stock: null, unit: "adet",   // stok modele göre değişir — teklifle bildirilir
        specs: ["Tescom · Mexxsun · Lexron · Arçelik", "On-grid ve off-grid modeller", "Model ve güncel stok için teklif isteyin"]
      }
    ]
  },

  // Ticari koşullar — ürün kartı, paket detay sayfası ve sipariş akışı BURADAN
  // okur. Kargo/iade/stok ifadesini değiştirmek için yalnızca burayı düzenleyin.
  commerce: {
    stockLabel: "Stokta / tedarikte",   // ürün sayfasındaki durum rozeti
    shipCountry: "Türkiye",             // gönderim yapılan ülke (tüm iller)
    shipDays: "2–5",                    // teslim süresi (gün sayısı; birim metinde yazılı)
    returnDays: 14,                     // cayma hakkı süresi (mesafeli satış)
    // Kabul edilen ödeme yolları — LocalBusiness.paymentAccepted buradan basılır;
    // sepetteki seçeneklerle AYNI tutulur (kart = iyzico, havale/EFT).
    payment: ["Kredi kartı (iyzico)", "Havale/EFT"],
    // Serbest tutarlı link ödemesi (odeme.html → /api/pay/custom) ve admin
    // taksit aracının tutar sınırları (₺). Sunucu bu değerlerle doğrular,
    // admin "Ödeme Bağlantısı Üret" kartı da buradan okur. UYARI: iyzico
    // hesabının kendi tek işlem limiti ve müşterinin kart limiti AYRICA
    // geçerlidir; buradaki üst sınırı yükseltmek onları yükseltmez.
    payLinkMinTL: 50,
    payLinkMaxTL: 500000
  },

  // ============================================================
  // KAMPANYA — indirimli ürünler bölümü + geri sayım (online-satis.html)
  // endsAt GEÇTİĞİNDE: geri sayım, indirim rozeti ve üstü çizili fiyat
  // KENDİLİĞİNDEN gizlenir; ürün normal fiyatıyla katalogda kalmaya devam eder.
  // Kampanyayı uzatmak/bitirmek için SADECE endsAt (ve gerekirse ürünün
  // oldPrice alanı) düzenlenir. Tarih ISO-8601 + saat dilimi olmalıdır.
  // NOT: "önceki fiyat" olarak gösterilen tutar, mevzuat gereği indirimden
  // önceki 30 gün içinde uygulanan EN DÜŞÜK fiyat olmalıdır.
  // ============================================================
  campaign: {
    endsAt: "2026-09-20T23:59:59+03:00",
    title: "İndirimli Ürünler",
    note: "Kampanya fiyatları stoklarla sınırlıdır."
  },

  packages: [
    // —— Taşınabilir & Off-Grid (lityum bataryalı) paketler —— açık perakende fiyatı
    // img: "assets/img/products/x.webp" -> kartta çizim yerine gerçek ürün fotoğrafı
    // oldPrice: üstü çizili liste fiyatı (indirim rozeti otomatik hesaplanır)
    // currency: "USD" -> $ ile gösterilir (varsayılan ₺)
    {
      id: "kit-285w", icon: "🧰", tag: "Taşınabilir", group: "offgrid", kit: true,
      url: "paket-285w.html", sku: "GES-KIT-285",
      kwp: 0.285, panelW: 285, panelCount: 1, portable: true, dailyKwh: 1.7,
      img: "assets/img/products/kit-285w.webp",
      price: 25000,
      for: "Kamp, karavan ve küçük ihtiyaçlar",
      name: "285W Güneş Paneli Paketi",
      desc: "Komple sistem: 285 W panel, güç kutusu ve bağlantı kabloları dahil tak-çalıştır mobil kit. TV, lamba ve telefon şarjı çalıştırır; 23–25 kg.",
      features: ["TV, lambalar ve telefon şarjı çalıştırır", "Günlük ~1,7 kWh güneş üretimi", "23–25 kg — mobil taşınabilir", "Güç kutusu ve kablolar dahil"]
    },
    {
      id: "kit-2x540w", icon: "🎒", tag: "Taşınabilir", group: "offgrid", kit: true,
      url: "paket-2x540w.html", sku: "GES-KIT-2X540",
      kwp: 1.08, panelW: 540, panelCount: 2, portable: true, dailyKwh: 6.5,
      img: "assets/img/products/kit-2x540w.webp",
      price: 2200, currency: "USD",
      for: "Karavan, kamp ve bağ evi",
      name: "Tam Kapsamlı Güneş Enerjisi Sistemi",
      desc: "2× 540 W güneş paneli dahil komple mobil sistem: LiFePO₄ lityum batarya ve büyük güç kutusuyla buzdolabı, TV, çamaşır ve bulaşık makinesini çalıştırır.",
      features: ["Büyük boy buzdolabı, TV, çamaşır-bulaşık makinesi ve süpürgeyi çalıştırır", "Günlük ~6,5 kWh güneş üretimi", "LiFePO₄ lityum batarya dahil", "Mobil taşınabilir, off-grid çalışma"]
    },

    // —— Elektrikli araç dönüşümü —— tekil cihaz (panel ve akü ürüne dahil değildir)
    // chips: kWp/panel üretmeyen ürünlerde kart çiplerini elle belirler
    {
      id: "boost-mppt", icon: "🔌", tag: "Elektrikli Araç", group: "accessory",
      url: "elektrikli-arac-donusum.html", sku: "GES-EV-BOOST",
      img: "assets/img/products/ev/boost-mppt-on.webp",
      // ₺7.200 NET: noCartDiscount ile havale/EFT indirimi BİNMEZ — kartla da
      // havaleyle de aynı tutar tahsil edilir, havale satırı hiçbir yerde
      // gösterilmez. Önceden liste ₺7.600 + %5 havale indirimi idi; sepette
      // ₺7.200 yazıp kasada ₺7.600 çekildiği için net fiyata geçildi.
      // freeShipping: kargo fiyata DAHİL — alıcıdan ayrıca kargo ücreti
      // istenmez; "KDV ve kargo dahil" notu basılır.
      price: 7200, noCartDiscount: true, freeShipping: true,
      chips: ["⚙️ 24 V – 72 V akü", "🔋 Tüm akü tipleri", "📶 Bluetooth ile ayar"],
      for: "Golf aracı, hizmet aracı ve elektrikli platformlar",
      name: "MS Teknik BOOST MPPT 24-72 V Şarj Kontrol Cihazı",
      desc: "Güneş panelinden 24-72 V akü grubuna doğrudan şarj sağlayan MPPT yükseltici (boost) şarj kontrol cihazı. AGM, jel, sulu kurşun-asit ve lityum akülerle uyumlu; Bluetooth ile programlanır. Panel ve akü ürüne dahil değildir.",
      features: ["24 / 36 / 48 / 60 / 72 V akü sistemleriyle uyumlu", "AGM, jel, sulu kurşun-asit ve lityum akü desteği", "15 A sürekli çıkış · 15–60 V DC panel girişi", "Bluetooth ile programlanır · IP22 · 2 yıl garanti"]
    },

    // —— Elektrikli motor çekiş aküsü —— BAŞKA ÜRETİCİNİN markalı ürünü:
    // `brand: "europlus"` JSON-LD'ye ve ürün akışına böyle girer; foto'daki
    // etiket SİLİNMEZ (UNV / SFM kuralı). Teknik değerler: künye (kaynak belge
    // ve ham görseller assets/img/products/ev/kaynak/lifepo4-72v-30ah-aku.docx
    // + aku-72v-30ah*.png) + İŞLETMENİN verdiği değerler (Eyl 2026: nominal
    // 76,8 V, maks. şarj 87,6 V / 30 A, şarj 0–45 °C, 2.000 çevrim). İkisi
    // çelişirse işletme esastır. OLMAYAN değer (ağırlık, garanti süresi, IP
    // sınıfı) YAZILMAZ; dış ölçü paket üzerinden ölçüldü. Şarj cihazı ürüne
    // DAHİL DEĞİLDİR — künye onu "önerilen şarj aleti" olarak verir.
    {
      id: "aku-lifepo4-72v", icon: "🔋", tag: "Elektrikli Araç", group: "accessory",
      url: "aku-lifepo4-72v-30ah.html", sku: "GES-EV-AKU-72V",
      brand: "europlus",
      img: "assets/img/products/ev/aku-72v-30ah.webp",
      price: 28000,
      chips: ["⚡ 72 V · 30 Ah · ~2.300 Wh", "🔁 2.000 çevrim ömrü", "🛡️ Dahili balanslı BMS"],
      for: "Elektrikli triportör, motosiklet ve 72 V hizmet araçları",
      name: "europlus 72 V 30 Ah LiFePO₄ Akü",
      desc: "Elektrikli triportör ve 72 V motorlu araçlar için LiFePO₄ (lityum demir fosfat) çekiş aküsü. 24S hücre dizilimi, 76,8 V nominal gerilim, ~2.300 Wh enerji, dahili balanslı BMS. Maksimum şarj voltajı 87,6 V, maksimum şarj akımı 30 A; doğru kullanımda 2.000 çevrim ömür. Dış ölçü yaklaşık 41 × 16 × 17 cm. Jel ve kurşun-asit akülere göre 3 kata kadar daha hafiftir ve deşarj boyunca kararlı voltaj verir — motor gücü düşmeden yol biter. Şarj cihazı ürüne dahil değildir.",
      features: ["Nominal 76,8 V (72 V sınıfı) · 30 Ah · yaklaşık 2.300 Wh", "24S hücre dizilimi · LiFePO₄ (lityum demir fosfat)", "Maks. şarj voltajı 87,6 V · deşarj kesme ~54 V", "Maks. şarj akımı 30 A · şarj sıcaklığı 0–45 °C", "Dahili balanslı koruma sistemi (BMS)", "Doğru kullanımda 2.000 çevrim ömrü", "Dış ölçü yaklaşık 41 × 16 × 17 cm", "Uygun şarj cihazı: LiFePO₄ CC/CV, 87,6 V, 6–10 A"]
    },

    // —— Tekil panel —— kampanyalı ürün (oldPrice = indirim öncesi fiyat)
    // group:"panel" olduğu için urunler.html paket vitrininde ÇIKMAZ,
    // yalnızca online-satis.html kataloğunda listelenir.
    // img: gerçek 50 W panel fotoğrafı gelince doldurulacak (şu an yer tutucu).
    {
      id: "panel-50w", icon: "🔆", tag: "Panel", group: "panel",
      sku: "GES-PNL-50",
      img: "assets/img/products/panel-50w.webp",
      price: 1250, oldPrice: 2500,
      // Kampanya fiyatı NET: zaten %50 indirimli, üstüne havale/EFT indirimi
      // uygulanmaz. Müşterinin ödeyeceği son tutar ₺1.250'dir.
      noCartDiscount: true,
      chips: ["🔆 50 W monokristal", "🔋 12 V sistem", "📦 Tek panel"],
      for: "Küçük aydınlatma, kamera ve akü şarjı",
      name: "50W Güneş Paneli",
      desc: "12 V sistemler için tekil 50 W monokristal güneş paneli. Bahçe aydınlatması, güvenlik kamerası ve akü şarjı gibi küçük yükler için uygundur; panel tek başına satılır, akü ve regülatör dahil değildir.",
      features: ["50 W monokristal hücre", "12 V akü şarjı için uygun", "Bahçe aydınlatması, kamera ve küçük yükler", "Akü ve şarj regülatörü dahil değildir"]
    },

    // —— Taşınabilir güç istasyonu —— UNV (Uniview) marka, ithal ürün.
    // Fiyat USD'dir; ₺ karşılığı config.usdTry kuruyla hesaplanır.
    // stock: GERÇEK stok adedi. Ürün sayfasında "Son N adet" yazar ve adet
    // kutusu bu sayıyı AŞAMAZ. Stok değişince SADECE bu satır güncellenir;
    // stock: 0 → "Tükendi" + sepete ekleme kapanır, stock: null → genel rozet.
    // Teknik değerler üreticinin ürün künyesinden gelir — ham görsel
    // assets/img/products/kaynak/unv-trek-pro-2500-kunye.png altındadır.
    // DİKKAT: künye görselindeki cihaz AS/NZS (Avustralya) prizlidir; Türkiye'ye
    // Schuko (Type F) sürüm tedarik edilmeden priz tipi hakkında iddia YAZILMAZ
    // (ürün sayfasındaki SSS bunu "sipariş öncesi teyit edilir" diye karşılar).
    {
      id: "unv-trek-pro-2500", icon: "🔋", tag: "Taşınabilir", group: "offgrid",
      url: "unv-trek-pro-2500.html", sku: "ES-E2500-A2",
      brand: "UNV (Uniview)",          // ÜRÜNÜN markası — GESPA değil (JSON-LD brand)
      img: "assets/img/products/unv-trek-pro-2500.webp",
      price: 2495, currency: "USD", stock: 1,
      chips: ["⚡ 2500 W çıkış", "🔋 2496 Wh batarya", "🔌 4 × 230 V AC"],
      for: "Kamp, karavan, saha çalışması ve ev tipi yedek güç",
      name: "UNV Trek Pro 2500 W Taşınabilir Güç İstasyonu",
      desc: "2496 Wh kapasiteli, 2500 W sürekli çıkış veren taşınabilir güç istasyonu. Dört adet 230 V saf sinüs AC prizi, USB ve Type-C çıkışlarıyla aynı anda 14 cihaza kadar besleme yapar; 30 ms tepki süresiyle kesintisiz güç kaynağı (UPS) olarak da çalışır. Güneş paneli ürüne dahil değildir.",
      features: ["2500 W sürekli çıkış · 2496 Wh batarya kapasitesi", "4 × 230 V saf sinüs dalga AC çıkışı", "2 × USB Type-C (200 W ve 100 W) · 4 × USB-A 18 W", "12 V DC çıkışlar (maks. 15 A) · araç çakmak soketi", "30 ms tepki süreli UPS fonksiyonu", "Aynı anda 14 cihaza kadar güç verir"]
    },

    // —— Tekil paneller —— TEKNİK DEĞERLER üreticinin künyesinden gelir:
    // assets/img/products/kaynak/lexron-*.pdf. Künyede OLMAYAN değer yazılmaz.
    // DİKKAT: "285W Güneş Paneli Paketi" (kit-285w, ₺25.000) AYRI bir üründür —
    // o komple sistem, bu tek panel. Adları karıştırma.
    {
      id: "panel-lexron-285w", icon: "🔆", tag: "Panel", group: "panel",
      sku: "GES-PNL-285", brand: "Lexron",
      img: "assets/img/products/panel-lexron-285w.webp",
      price: 7500,
      chips: ["🔆 285 W TOPCon", "⚡ 42,84 V Voc", "⚖️ 8,5 kg"],
      for: "Balkon, bağ evi ve küçük off-grid sistemler",
      name: "Lexron 285 W Güneş Paneli",
      desc: "Lexron 210R PowerLite TOPCon serisi 285 W monokristal güneş paneli. Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A. Ölçü 780 × 1536 × 30 mm, ağırlık 8,5 kg. IEC 61215 / 61730 / 61701 belgeli; 12 yıl ürün ve işçilik, 30 yıl güç garantisi.",
      features: ["285 W · TOPCon monokristal hücre", "Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A", "780 × 1536 × 30 mm · 8,5 kg", "12 yıl ürün · 30 yıl güç garantisi"]
    },
    {
      id: "panel-lexron-655w", icon: "🔆", tag: "Panel", group: "panel",
      sku: "GES-PNL-655", brand: "Lexron",
      img: "assets/img/products/panel-lexron-655w.webp",
      price: 10000,
      chips: ["🔆 655 W N-type TOPCon", "📈 %24,25 verim", "🛡️ 30 yıl güç garantisi"],
      for: "Çatı ve arazi sistemleri, yüksek güç gerektiren kurulumlar",
      name: "Lexron 655 W TOPCon Güneş Paneli",
      desc: "132 yarım kesim hücreli, N-type TOPCon teknolojili monokristal güneş paneli. 655 W güçte Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A, modül verimi %24,25. Ölçü 2382 × 1134 × 35 mm, ağırlık 31 kg; 3,2 mm AR kaplamalı ısıl güçlendirilmiş cam, 35 mm anotlu alüminyum çerçeve, IP68 bağlantı kutusu. 1500 V sistem gerilimi, 2400 Pa rüzgâr ve 5400 Pa kar yükü dayanımı.",
      features: ["655 W · N-type TOPCon · 132 yarım kesim hücre", "Modül verimi %24,25 · 16 busbar · 0~+5 W tolerans", "Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A", "2382 × 1134 × 35 mm · 31 kg · IP68 · 1500 V", "2400 Pa rüzgâr · 5400 Pa kar yükü dayanımı", "12 yıl ürün · 30 yıl güç garantisi (yıllık %0,45 kayıp)"]
    },
    // Arçelik 540 W: elimizde ÜRETİCİ KÜNYESİ YOK — güç, sınıf ve marka dışında
    // teknik değer YAZILMAZ. Künye gelirse buradan genişlet.
    {
      id: "panel-arcelik-540w", icon: "🔆", tag: "Panel", group: "panel",
      sku: "GES-PNL-540", brand: "Arçelik",
      img: "assets/img/products/panel-arcelik-540w.webp",
      price: 10000,
      chips: ["🔆 540 W", "🏷️ A sınıf", "🇹🇷 Arçelik"],
      for: "Çatı ve arazi kurulumları, yerli marka tercih edenler",
      name: "Arçelik 540 W Güneş Paneli",
      desc: "Arçelik marka 540 W A sınıf monokristal güneş paneli. Yetkili tedarik, orijinal ürün; çatı ve arazi tipi kurulumlar için uygundur. Ayrıntılı teknik künye ve palet bazında toptan sevkiyat için bize ulaşın.",
      features: ["540 W · A sınıf monokristal", "Arçelik — yetkili tedarik, orijinal ürün", "Çatı ve arazi tipi kurulumlara uygun", "Palet bazında toptan sevkiyat mümkün"]
    },

    // —— Enerji depolama —— group:"storage" yalnız online-satis.html kataloğunda
    // listelenir (urunler.html GROUPS listesinde yoktur).
    {
      id: "aku-titanx-51v-102ah", icon: "🔋", tag: "Enerji Depolama", group: "storage",
      sku: "GES-AKU-102", brand: "TitanX",
      img: "assets/img/products/aku-titanx-51v-102ah.webp",
      price: 73372,
      chips: ["🔋 5,22 kWh", "⚡ 51,2 V · 102 Ah", "♻️ 6000+ çevrim"],
      for: "Ev ve işyeri enerji depolama, off-grid ve yedek güç",
      name: "TitanX 51,2 V 102 Ah LiFePO₄ Akü",
      desc: "51,2 V 102 Ah (5,22 kWh) LiFePO₄ enerji depolama aküsü. 16S1P prizmatik hücre yapısı, dahili akıllı BMS ile aşırı şarj/deşarj, aşırı akım, kısa devre ve sıcaklık koruması. 100 A sürekli deşarj, 150 A tepe (5 sn); 6000+ çevrim ömrü (%80 DoD). CAN/RS485 ve Bluetooth veya WiFi haberleşme; 16 adede kadar paralel bağlanabilir. Ağırlık 37 kg, ölçü 560 × 150 × 380 mm, IP20, M8 terminal, 2 yıl garanti.",
      features: ["51,2 V · 102 Ah · 5,22 kWh · LiFePO₄ (16S1P prizmatik)", "Dahili akıllı BMS — aşırı şarj/deşarj, kısa devre, sıcaklık koruması", "100 A sürekli deşarj · 150 A tepe (5 sn) · 100 A şarj", "6000+ çevrim ömrü (%80 DoD, 25 °C) · 2 yıl garanti", "CAN / RS485 · Bluetooth veya WiFi · 16 adede kadar paralel", "37 kg · 560 × 150 × 380 mm · IP20 · M8 terminal"]
    },

    // —— Bağlantı malzemeleri —— elektrikli motor paketlerinin (evSets)
    // tamamlayıcı kalemleri. group:"cable" YALNIZ online-satis.html
    // kataloğunda listelenir; urunler.html paket vitrininde ÇIKMAZ.
    // Fotoğraflar: ham kaynak assets/img/products/kaynak/<id>.png →
    // `tools/foto-hazirla.py` (880×660 beyaz tuval). Görselli oldukları için
    // Merchant Center akışına GİRERLER; kendi sayfaları olmadığından iniş
    // sayfası online-satis.html'dir.
    {
      // KESİT (mm2) ürün ADINDA ve çiplerde YAZILMAZ: stok durumuna göre
      // 4 mm2 ya da 6 mm2 geliyor, ikisi de bu sistemler için uygun.
      // Belirli bir kesit yazmak teslimatla çelişirdi; durum açıklamada
      // olduğu gibi söylenir.
      id: "kablo-solar-5m", icon: "🔌", tag: "Kablo", group: "cable",
      sku: "GES-KBL-5M",
      img: "assets/img/products/kablo-solar-5m.webp",
      price: 1000,
      chips: ["📏 5 m + 5 m", "⚫🔴 Siyah + kırmızı", "☀️ Solar kablo"],
      for: "Panel ile şarj kontrol cihazı arası bağlantı",
      name: "Solar Kablo Takımı (5 m Siyah + 5 m Kırmızı)",
      desc: "Güneş paneli ile şarj kontrol cihazı arasındaki bağlantı için 5 metre siyah + 5 metre kırmızı solar kablo takımı. Kesit stok durumuna göre 4 mm2 veya 6 mm2 gelir; bu sistemlerde ikisi de uygundur. Elektrikli motor güneş paketlerinin standart kalemidir.",
      features: ["5 m siyah + 5 m kırmızı solar kablo", "Panel – şarj kontrol cihazı bağlantısı", "Elektrikli motor güneş paketlerine dahildir"]
    },
    // —— Elektrikli motor hazır paketleri —— katalogda AYRI ÜRÜN olarak
    // listelenir ve kendi detay sayfaları vardır; müşteriye tek başına bir
    // adres gönderilebilsin diye. `parts` paketin içeriğidir (sayfadaki
    // "Pakete dahil olanlar" ve katalog kartı bundan çizilir).
    // FİYAT TUTARLILIĞI: build.js `parts` toplamını `price` ile karşılaştırır
    // ve tutmazsa UYARIR — bir kalemin fiyatı değişip paket fiyatı
    // güncellenmeden kalmasın.
    {
      id: "set-yolcu", icon: "🛺", tag: "Hazır Paket", group: "evset",
      url: "paket-motor-yolcu.html",
      sku: "GES-SET-YOLCU",
      img: "assets/img/products/ev/motor-yolcu.webp",
      price: 15800,
      parts: ["panel-lexron-285w", "boost-mppt", "kablo-solar-5m", "mc4-set"],
      chips: ["🔆 285 W TOPCon panel", "🔌 BOOST MPPT 24–72 V", "🧰 Kablo + MC4 dahil"],
      for: "Kabinli, 2–4 kişilik yolcu triportörleri — çatı alanı dar",
      name: "Yolcu Kabinli Motor Güneş Paketi — 285 W",
      desc: "Kabinli elektrikli yolcu triportörünü güneşle şarj etmek için hazırlanmış komple paket: 285 W TOPCon güneş paneli, BOOST MPPT 24–72 V şarj kontrol cihazı, 5 m siyah + 5 m kırmızı solar kablo ve MC4 konnektör takımı. Dar çatı alanına sığan panel gücü seçilmiştir; hangi parçanın uyduğunu araştırmanıza gerek kalmaz.",
      features: ["285 W TOPCon güneş paneli (dar çatıya uygun ölçü)", "BOOST MPPT 24–72 V şarj kontrol cihazı — tüm akü tipleriyle", "5 m siyah + 5 m kırmızı solar kablo", "MC4 konnektör takımı (erkek + dişi)", "Panel, cihaz ve kablolama birbiriyle uyumlu seçilmiştir"]
    },
    {
      id: "set-kargo", icon: "🚚", tag: "Hazır Paket", group: "evset",
      url: "paket-motor-kargo.html",
      sku: "GES-SET-KARGO",
      img: "assets/img/products/ev/motor-kargo.webp",
      price: 18300,
      parts: ["panel-lexron-655w", "boost-mppt", "kablo-solar-5m", "mc4-set"],
      chips: ["🔆 655 W TOPCon panel", "🔌 BOOST MPPT 24–72 V", "🧰 Kablo + MC4 dahil"],
      for: "Açık kasa veya tenteli yük triportörleri — çatı alanı geniş",
      name: "Kargo Kasalı Motor Güneş Paketi — 655 W",
      desc: "Kargo kasalı elektrikli triportörü güneşle şarj etmek için hazırlanmış komple paket: 655 W N-type TOPCon güneş paneli, BOOST MPPT 24–72 V şarj kontrol cihazı, 5 m siyah + 5 m kırmızı solar kablo ve MC4 konnektör takımı. Geniş kasa/tente çatısının kaldırabileceği en verimli panel gücü seçilmiştir.",
      features: ["655 W N-type TOPCon güneş paneli (geniş çatı için)", "BOOST MPPT 24–72 V şarj kontrol cihazı — tüm akü tipleriyle", "5 m siyah + 5 m kırmızı solar kablo", "MC4 konnektör takımı (erkek + dişi)", "Panel, cihaz ve kablolama birbiriyle uyumlu seçilmiştir"]
    },

    {
      id: "mc4-set", icon: "🔗", tag: "Konnektör", group: "cable",
      sku: "GES-MC4-1",
      img: "assets/img/products/mc4-set.webp",
      price: 100,
      chips: ["🔗 1 takım", "⚡ Erkek + dişi", "☀️ Panel bağlantısı"],
      for: "Panel kablosu ile solar kablonun birleştirilmesi",
      name: "MC4 Konnektör Takımı",
      desc: "Güneş paneli çıkış kablosu ile solar kabloyu birleştiren erkek-dişi MC4 konnektör takımı. Elektrikli motor güneş paketlerine 1 takım dahildir.",
      features: ["1 takım erkek + dişi MC4 konnektör", "Panel kablosu – solar kablo bağlantısı", "Elektrikli motor güneş paketlerine dahildir"]
    },

  ],

  // ============================================================
  // ELEKTRİKLİ MOTOR PAKETLERİ — elektrikli-arac-donusum.html
  // "Motorunu seç → paketini gör → sepete at". Müşteri hangi panelin
  // aracına uyduğunu bilmediği için satış burada takılıyordu.
  // Seçici yalnızca ARAÇ TİPİNİ sorar; paketin kendisi `pkg` ile
  // config.packages'teki GERÇEK ÜRÜNE bağlanır (fiyat, içerik ve detay
  // sayfası oradan gelir). Böylece paketin kendi kartı, kendi adresi ve
  // sepette kendi satırı olur.
  // GÖRSELLER: araçlar BAŞKA ÜRETİCİLERE aittir (CSN, SFM). Marka
  // yazıları SİLİNMEZ (UNV kuralının aynısı) ve sayfada "araç tipi
  // örneği" diye etiketlenir — o araçları biz satmıyoruz.
  evSets: [
    {
      id: "yolcu",
      img: "assets/img/products/ev/motor-yolcu.webp",
      // proof: paket kutusunun SOL görseli — seçilen araca göre değişir.
      // İkisi de 4:3 kadrajdır (tools/motor-foto.py); farklı oranda olsalar
      // kart değiştikçe kutunun yüksekliği zıplardı.
      proof: "assets/img/products/ev/motor-yolcu-kurulum.webp",
      title: "Yolcu kabinli triportör",
      hint: "Kabinli, 2–4 kişilik yolcu araçları — çatı alanı dar",
      pkg: "set-yolcu"
    },
    {
      id: "kargo",
      img: "assets/img/products/ev/motor-kargo.webp",
      proof: "assets/img/products/ev/motor-kargo-kurulum.webp",
      title: "Kargo kasalı triportör",
      hint: "Açık kasa veya tenteli yük araçları — çatı alanı geniş",
      pkg: "set-kargo"
    }
  ],
  // Sette `proof` yoksa kullanılacak yedek görsel.
  evSetProof: "assets/img/products/ev/motor-panel-takili.webp",


  // ============================================================
  // SİSTEM KURUCU (sistem-kur.html) — "ihtiyaçtan siparişe" sihirbazı
  // Kullanıcı cihazlarını seçer → ihtiyaç (panel/akü/inverter) hesaplanır →
  // marka/model seçer → sipariş özeti WhatsApp'a gider.
  // KURAL: builder.js'e hiçbir sayı/fiyat gömülmez; tümü buradan okunur.
  // Fiyatlar TAHMİNİ LİSTE fiyatlarıdır (KDV dahil); kesin fiyat keşifle netleşir.
  // Admin paneli bu fiyatları localStorage'da geçici override edebilir.
  // ============================================================
  builder: {
    // Boyutlandırma katsayıları
    sizing: {
      sunHours: 4.5,        // saat/gün — tasarım günü (kış ortalaması, Akdeniz)
      systemEff: 0.75,      // panel→akü→yük toplam sistem verimi (off-grid)
      simultaneity: 0.7,    // eşzamanlılık: tüm cihazlar aynı anda çalışmaz
      surgeMargin: 1.3,     // inverter kalkış (sürge) payı
      dod: 0.9,             // lityum deşarj derinliği
      invEff: 0.92,         // inverter verimi
      autonomyDays: 1,      // güneşsiz gün özerkliği (varsayılan)
      minInverterKw: 1,     // seçilebilir en küçük inverter (kW)
      cableMetersPerPanel: 4 // panel başına tahmini DC kablo (m)
    },

    // Kullanım senaryoları — seçilince cihaz listesi ön-doldurulur ({cihazId: adet})
    presets: [
      { id: "bagevi", icon: "🏡", label: "Bağ Evi", desc: "Hafta sonu kullanımı, temel konfor",
        items: { buzdolabi: 1, tv: 1, led: 6, telefon: 2, wifi: 1, su_pompasi: 1 } },
      { id: "karavan", icon: "🚐", label: "Karavan / Kamp", desc: "Mobil kullanım, düşük tüketim",
        items: { buzdolabi_mini: 1, led: 4, telefon: 2, laptop: 1 } },
      { id: "mustakil", icon: "🏠", label: "Müstakil Ev", desc: "Tam zamanlı yaşam",
        items: { buzdolabi: 1, tv: 2, led: 12, telefon: 4, wifi: 1, camasir: 1, bulasik: 1, su_pompasi: 1, klima: 1 } },
      { id: "tarla", icon: "🌾", label: "Tarla / Sulama", desc: "Pompa ağırlıklı sezonluk",
        items: { dalgic_pompa: 1, led: 2, kamera: 2 } },
      { id: "isyeri", icon: "🏪", label: "Dükkân / Ofis", desc: "Gündüz ağırlıklı işletme",
        items: { led: 15, bilgisayar: 3, klima: 2, buzdolabi: 1, wifi: 1, yazarkasa: 1 } }
    ],

    // Cihaz kataloğu — w: çalışma gücü (W), h: varsayılan günlük çalışma (saat),
    // surge: kalkış akımı çarpanı (motorlu cihazlarda >1), group: arayüz grubu
    appliances: [
      { id: "led",           icon: "💡", name: "LED Lamba",            w: 10,   h: 5,  surge: 1,   group: "temel" },
      { id: "telefon",       icon: "📱", name: "Telefon Şarjı",        w: 15,   h: 3,  surge: 1,   group: "temel" },
      { id: "wifi",          icon: "📶", name: "Modem / Wi-Fi",        w: 15,   h: 24, surge: 1,   group: "temel" },
      { id: "tv",            icon: "📺", name: "Televizyon (LED)",     w: 90,   h: 5,  surge: 1,   group: "temel" },
      { id: "laptop",        icon: "💻", name: "Dizüstü Bilgisayar",   w: 65,   h: 4,  surge: 1,   group: "temel" },
      { id: "bilgisayar",    icon: "🖥️", name: "Masaüstü Bilgisayar",  w: 200,  h: 8,  surge: 1,   group: "temel" },
      { id: "buzdolabi_mini",icon: "🧊", name: "Mini Buzdolabı",       w: 60,   h: 8,  surge: 3,   group: "beyaz" },
      { id: "buzdolabi",     icon: "🧊", name: "Buzdolabı (A+)",       w: 120,  h: 8,  surge: 3,   group: "beyaz" },
      { id: "derin_dondurucu",icon: "❄️", name: "Derin Dondurucu",     w: 150,  h: 8,  surge: 3,   group: "beyaz" },
      { id: "camasir",       icon: "🧺", name: "Çamaşır Makinesi",     w: 500,  h: 1,  surge: 2.5, group: "beyaz" },
      { id: "bulasik",       icon: "🍽️", name: "Bulaşık Makinesi",    w: 900,  h: 1,  surge: 2,   group: "beyaz" },
      { id: "firin",         icon: "🔥", name: "Elektrikli Fırın",     w: 2000, h: 0.5,surge: 1,   group: "beyaz" },
      { id: "su_isitici",    icon: "🚿", name: "Termosifon / Şofben",  w: 1500, h: 1,  surge: 1,   group: "beyaz" },
      { id: "klima",         icon: "🌬️", name: "Klima (12.000 BTU)",   w: 1100, h: 6,  surge: 2.5, group: "iklim" },
      { id: "isitici",       icon: "🔌", name: "Elektrikli Isıtıcı",   w: 1500, h: 3,  surge: 1,   group: "iklim" },
      { id: "vantilator",    icon: "🌀", name: "Vantilatör",           w: 60,   h: 6,  surge: 1.5, group: "iklim" },
      { id: "su_pompasi",    icon: "💧", name: "Hidrofor / Su Pompası",w: 750,  h: 1,  surge: 3,   group: "pompa" },
      { id: "dalgic_pompa",  icon: "⛲", name: "Dalgıç Pompa (1.5 kW)",w: 1500, h: 6,  surge: 3,   group: "pompa" },
      { id: "kamera",        icon: "🎥", name: "Güvenlik Kamerası",    w: 12,   h: 24, surge: 1,   group: "temel" },
      { id: "yazarkasa",     icon: "🧾", name: "Yazarkasa / POS",      w: 40,   h: 10, surge: 1,   group: "temel" }
    ],

    // Cihaz grubu başlıkları (arayüz)
    groups: [
      { id: "temel", label: "Temel & Elektronik" },
      { id: "beyaz", label: "Beyaz Eşya" },
      { id: "iklim", label: "Isıtma & Soğutma" },
      { id: "pompa", label: "Pompa & Bahçe" }
    ],

    // Ürün kataloğu — sipariş adımında seçilir (fiyatlar tahmini liste, ₺ KDV dahil)
    // battery.dod: kullanılabilir kapasite oranı (LiFePO₄ ~0.9, jel ~0.5) —
    // akü adedi bu değere göre hesaplanır, jel akü daha fazla adet gerektirir.
    catalog: {
      panel: [
        { id: "pnl-lexron-550", brand: "Lexron", name: "550 W Monokristal Half-Cut", w: 550, price: 5900 },
        { id: "pnl-arcelik-560", brand: "Arçelik", name: "560 W Monokristal N-Type", w: 560, price: 6800 },
        { id: "pnl-bakirlar-450", brand: "Bakırlar", name: "450 W Monokristal", w: 450, price: 4900 },
        { id: "pnl-lexron-285", brand: "Lexron", name: "285 W Kompakt (karavan/mobil)", w: 285, price: 3400 }
      ],
      battery: [
        { id: "bat-titanx-51-5", brand: "TitanX", name: "LiFePO₄ 51.2V 100Ah Rack", kwh: 5.12, chem: "LiFePO₄", dod: 0.9, cycles: 6000, price: 62000 },
        { id: "bat-titanx-25-6", brand: "TitanX", name: "LiFePO₄ 25.6V 100Ah", kwh: 2.56, chem: "LiFePO₄", dod: 0.9, cycles: 6000, price: 34000 },
        { id: "bat-lexron-24-100", brand: "Lexron", name: "LiFePO₄ 24V 100Ah", kwh: 2.4, chem: "LiFePO₄", dod: 0.9, cycles: 4000, price: 29500 },
        { id: "bat-jel-12-150", brand: "Jel Akü", name: "12V 150Ah Jel (bakımsız)", kwh: 1.8, chem: "Jel", dod: 0.5, cycles: 800, price: 12500 }
      ],
      inverter: [
        { id: "inv-tescom-3", brand: "Tescom", name: "3 kW Hibrit MPPT 24V", kw: 3, type: "Hibrit", price: 24500 },
        { id: "inv-tescom-5", brand: "Tescom", name: "5 kW Hibrit MPPT 48V", kw: 5, type: "Hibrit", price: 38500 },
        { id: "inv-mexxsun-8", brand: "Mexxsun", name: "8 kW Hibrit MPPT 48V", kw: 8, type: "Hibrit", price: 62000 },
        { id: "inv-lexron-1-5", brand: "Lexron", name: "1.5 kW Off-Grid MPPT 12V", kw: 1.5, type: "Off-Grid", price: 13500 }
      ],
      // Yardımcı ürünler — qty: hesaplanan miktar kuralı
      //   perPanel  : panel adedi kadar · perPanelPair: her panel için çift (MC4)
      //   perSystem : 1 adet · perCableMeter: kablo metresi · perKwp: kurulu güç
      extras: [
        { id: "ext-mc4", name: "MC4 Konnektör Çifti", unit: "çift", qty: "perPanel", price: 120, on: true },
        { id: "ext-dckablo", name: "Solar DC Kablo 6 mm²", unit: "m", qty: "perCableMeter", price: 95, on: true },
        { id: "ext-box", name: "Hazır Bağlantı Panosu (DC/AC koruma)", unit: "adet", qty: "perSystem", price: 8500, on: true },
        { id: "ext-konstruksiyon", name: "Montaj Konstrüksiyonu (alüminyum)", unit: "panel", qty: "perPanel", price: 1450, on: true },
        { id: "ext-iscilik", name: "Kurulum İşçiliği ve Devreye Alma", unit: "kWp", qty: "perKwp", price: 6500, on: true },
        { id: "ext-nakliye", name: "Nakliye ve Sigorta", unit: "adet", qty: "perSystem", price: 4500, on: false },
        { id: "ext-izleme", name: "Uzaktan İzleme Modülü (Wi-Fi)", unit: "adet", qty: "perSystem", price: 5900, on: false }
      ]
    }
  },

  // ---- PV Güneş Su Isıtıcı (su-isitici.html) ----
  // Modeller ve fiyatlar TEK YER. Fiyatlar ₺; admin panelinden düzenlenebilir
  // (admin yalnızca tarayıcıda önizler; kalıcı/herkese yansıması için buradaki
  // değerler güncellenip yayınlanmalıdır — admin "Yayınla" ile dosya üretir).
  heater: {
    name: "Solar Su Isıtma Sistemi",
    // false = tabloda ve şemada fiyat GÖSTERİLMEZ, yerine "Teklif alın" çıkar.
    // Fiyatları yeniden yayınlamak için true yapıp build çalıştırmak yeterli.
    showPrices: false,
    // mount: "Yatay" (60–100 L, kompakt/balkon) | "Dikey" (120–200 L, yüksek tüketim)
    // pv/dim/ac null = katalogda belirtilmemiş (tabloda "—"); price null = "Teklif alın"
    models: [
      { cap: 60,  mount: "Yatay", pv: 550,  dim: "430 × 745",  ac: "1,5 – 2", tank: "Emaye", price: 18900 },
      { cap: 80,  mount: "Yatay", pv: 600,  dim: "430 × 893",  ac: "1,5 – 2", tank: "Emaye", price: 22900 },
      { cap: 100, mount: "Yatay", pv: 700,  dim: "470 × 1140", ac: "2 – 2,5", tank: "Emaye", price: 27900 },
      { cap: 120, mount: "Dikey", pv: 900,  dim: "470 × 1251", ac: "2 – 2,5", tank: "Emaye", price: 32900 },
      { cap: 150, mount: "Dikey", pv: 1200, dim: "480 × 1380", ac: "2,5",     tank: "Emaye", price: 38900 },
      { cap: 200, mount: "Dikey", pv: null, dim: null,          ac: null,      tank: "Emaye", price: null }
    ]
  },

  // AI Cankurtaran (ai-cankurtaran-destek-sistemi.html) — sitede yalnızca aylık
  // "çapa" rakam ve lansman kontenjanı yayınlanır; tam fiyat listesi SİTEYE KONMAZ.
  pool: {
    monthlyFrom: 299,          // aylık hizmet planı başlangıcı
    monthlyCurrency: "USD",
    launchSlots: 5,            // lansman koşullarından yararlanacak tesis sayısı
    launchYear: 2026,
    nextSeason: 2027
  },

  // Admin paneli (basit koruma — şifre herkese açık koddadır; gerçek güvenlik için
  // backend gerekir). Şifreyi buradan değiştirin.
  admin: { pass: "gespa2026" },

  // Hesaplayıcı katsayıları — TEK YER (koda hardcode edilmez)
  calc: {
    panelW: 550,            // Wp — tek panel gücü
    areaPerKwp: 6,          // m² / kWp — yaklaşık alan
    costPerKwp: 28000,      // ₺ / kWp — tahmini kurulum maliyeti
    co2PerKwh: 0.45,        // kg CO₂ / kWh — şebeke emisyon faktörü
    treeKg: 22,             // kg CO₂ / ağaç / yıl
    years: 25,              // ekonomik ömür (yıl)
    defaultUnitPrice: 2.5,  // ₺ / kWh — varsayılan elektrik fiyatı
    degradation: 0.5,       // %/yıl — panel verim kaybı
    defaultInflation: 0,    // %/yıl — varsayılan elektrik zammı (temkinli; kullanıcı senaryo girebilir)
    co2PerCarKm: 0.12,      // kg CO₂ / km — ortalama binek araç
    defaultSelfConsumption: 70, // % — anlık öz tüketim oranı (kalanı şebekeye)
    feedInFactor: 0.5,      // şebekeye verilen fazlanın birim fiyata oranı (mahsuplaşma)
    batterySelfConsumption: 90, // % — batarya ile yükselen öz tüketim oranı
    batteryCostPerKwh: 9000,    // ₺/kWh — tahmini batarya maliyeti
    batteryFraction: 0.3,   // batarya boyutu = günlük ortalama üretim × bu oran (kWh)
    regions: [
      { label: "Akdeniz / GAP (çok yüksek)", yield: 1750 },
      { label: "İç Anadolu / Ege (yüksek)", yield: 1600, default: true },
      { label: "Marmara (orta)", yield: 1450 },
      { label: "Karadeniz (düşük)", yield: 1300 }
    ],
    orientations: [
      { label: "Güney (ideal)", factor: 1.0, default: true },
      { label: "Güneydoğu / Güneybatı", factor: 0.95 },
      { label: "Doğu / Batı", factor: 0.85 },
      { label: "Kuzey", factor: 0.65 }
    ],
    // Tarımsal sulama yöntemi için varsayılan girdiler
    irrigation: { defaultPumpKw: 7.5, defaultHours: 8, defaultMonths: 5 },
    // Solar sulama pompası seçim aracı katsayıları
    pump: { pumpEfficiency: 0.40, pvOversize: 1.3, hpPerKw: 1.341, defaultWater: 50, defaultHead: 40, defaultSun: 7 },

    // ---- Alet çantası (mühendislik araçları) katsayıları ----
    // Panel fiziksel ölçüsü (m) — ~550 Wp panel ≈ 2279 × 1134 mm
    panelDims: { short: 1.134, long: 2.279 },
    layoutGap: 0.02,                                  // m — paneller arası montaj boşluğu
    layoutMargin: 0.3,                                // m — çatı kenar boşluğu (setback) varsayılanı
    // İnverter boyutlandırma — DC/AC güç oranı
    inverterRatio: { min: 1.1, def: 1.2, max: 1.3 },
    // DC kablo kesiti / gerilim düşümü
    cable: {
      rhoCu: 0.0175,                                  // Ω·mm²/m — bakır özdirenci
      sections: [4, 6, 10, 16, 25],                   // mm² — standart kesitler
      targetDropPct: 1.0,                             // % — hedef maks. gerilim düşümü
      defV: 600, defI: 11, defLen: 30                 // tipik DC string varsayılanları
    },
    // Batarya / depolama boyutlandırma (batteryCostPerKwh yukarıda)
    storage: { dod: 0.9, sysEff: 0.9, defDailyKwh: 15, defAutonomy: 1 },
    // Sıra aralığı / gölgelenme (kış gündönümü öğle güneşine göre)
    shading: { declination: 23.45, defTilt: 30, defLat: 37 }
  }
};

/* Türetilen alanlar — elle yazılmaz.
   Deneyim yılı, faaliyet başlangıcından (experienceSince) hesaplanır; böylece
   yıl dönümünde eskimez ve tescil tarihiyle çelişmez. */
(function (c) {
  if (!c) return;
  if (c.experienceSince) {
    c.stats = c.stats || {};
    c.stats.experienceYears = new Date().getFullYear() - c.experienceSince;
  } else if (c.stats) {
    delete c.stats.experienceYears;
  }
})(window.GESPA.config.company);
