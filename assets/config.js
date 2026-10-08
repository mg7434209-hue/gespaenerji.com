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
    // Google İşletme Profili yorum bağlantısı (Google → "Daha fazla yorum alın").
    // data-c-review bağlantıları ve müşteri e-postası buradan beslenir.
    // Yorum KARŞILIĞINDA indirim, hediye ya da puan VERİLMEZ: Google bunu sahte
    // etkileşim sayar (yorumlar silinir, profil askıya alınabilir) ve 1 Ağustos
    // 2026'dan beri Ticari Reklam Yönetmeliği de menfaat karşılığı içeriği
    // sınırlar. İstek herkese, koşulsuz ve memnun olanları ayıklamadan yapılır.
    googleReview: "https://g.page/r/CbkHeUEAA3x9EBM/review",
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
    // sunucu sayacı her dağıtımda sıfırlanıyordu. 26 Eyl 2026'dan beri yeni
    // sunucu açılışta sayacı ESKİ sunucudan devralır (server.js
    // seedVisitsFromLive + railway.json healthcheck), taban artık elle
    // taşınmaz. Taşıma geçmişi: 25 Eyl 1000 → 1088 (sıfırlanmadan önce görülen
    // 1.080 + 8); 26 Eyl 1088 → 1269 (o gün iki güncellemede kaybolan en az
    // 181 ziyaret: sabah rozeti 1.269 gösteriyordu).
    base: 1269,
    start: "2026-09-26",     // base'in geçerli olduğu tarih (YYYY-AA-GG)
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
  // USD/TRY — ASGARİ KUR (₺/$). Katalogdaki TÜM ürünler USD tutulur; ₺ fiyat
  // (kart ödemesinde tahsil edilen tutar dahil) USD × kur, kur.js `tlRound`
  // ile yuvarlanır. Canlı kur açıkken (fx.auto, Railway) sunucu TCMB kurunu
  // kullanır; TCMB bu değerin ALTINDAYSA bu değer uygulanır, fiyatlar bu
  // seviyenin altına inmez. Elle son giriş: 29 Eyl 2026 (49,2). Ürünlerin
  // yanındaki "₺… @ 49,2" notu o ürünün bu kurdaki ₺ fiyatıdır.
  usdTry: 49.2,
  // CANLI KUR — server.js + kur.js. Railway'de sunucu TCMB günlük bülteninden
  // USD "döviz satış" kurunu açılışta ve saatte bir okur; değişince fiyatları
  // ve statik sayfaları (şema, ürün akışı, llms) kendiliğinden yeniler.
  // marginPct: TCMB kuruna eklenecek pay (%), 0 = TCMB'nin aynısı.
  // auto:false → yalnız usdTry kullanılır (elle kur).
  fx: { auto: true, source: "TCMB", field: "ForexSelling", marginPct: 0 },
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
    payLinkMaxTL: 500000,
    // iyzico HESABININ tek işlem üst sınırı (₺). Bizim sınırımız değil, iyzico
    // panelindeki limittir: aşan tutarı iyzico reddeder (28 Eyl 2026: limit
    // ₺100.000 iken ₺120.000 geçmedi, iki çekime bölündü; aynı gün iyzico
    // limiti ₺350.000'e yükseltti). Sunucu kartla ödenen her tutarı (sepet +
    // link) buna göre ÖNCEDEN reddedip havale/EFT'yi önerir; admin bağlantı
    // aracı da bunu üst sınır alır. iyzico limitinizi değiştirince SADECE
    // bunu güncelleyin. 0 = sınır yok.
    cardMaxTL: 350000,
    // KART SAĞLAYICISI — admin anahtarı: "iyzico" ya da "tami" (Garanti BBVA).
    // Aynı anda YALNIZ BİRİ müşteriye açılır (sepet + odeme.html). Railway'de
    // CARD_PROVIDER ortam değişkeni verilirse bunu ezer (kod değiştirmeden
    // geçiş). Seçilenin anahtarları yoksa öteki kullanılır. tami anahtarları
    // yalnız Railway env: TAMI_MERCHANT_NUMBER · TAMI_TERMINAL_NUMBER ·
    // TAMI_SECRET_KEY · TAMI_KID · TAMI_K · TAMI_BASE_URL.
    cardProvider: "iyzico",
    // tami taksit: seçenekler + tami paneli (İş Yerim) komisyonları AYNEN
    // (1 = tek çekim). Vade farkı MÜŞTERİYE yansır ve koddan türetilir:
    //   fark% = ((1 − kom[1]) / (1 − kom[n]) − 1) × 100, kuruşa yukarı
    // → işletmenin n taksitteki net'i tek çekim net'ine eşit kalır (tami.js
    // farkPct). iyzico'nun vade farkını iyzico kendi hesaplar; bu tablo yalnız
    // tami içindir. Oranlar: tami paneli, 8 Eki 2026.
    tamiTaksit: {
      secenekler: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      komisyonPct: { 1: 2.85, 2: 5.89, 3: 7.95, 4: 9.88, 5: 11.72, 6: 13.47,
        7: 15.39, 8: 17.23, 9: 18.97, 10: 20.85, 11: 22.71, 12: 24.32 }
    }
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
      price: 508.13, currency: "USD",                     // ₺25.000 @ 49,2
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
      price: 146.34, currency: "USD", noCartDiscount: true, freeShipping: true,  // ₺7.200 net @ 49,2
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
      price: 569.11, currency: "USD",                     // ₺28.000 @ 49,2
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
      price: 35.57, currency: "USD",     // ₺1.750 @ 49,2 (işletme, 5 Eki 2026)
      // Fiyat NET: havale/EFT indirimi uygulanmaz, son tutar ₺1.750.
      // Eylül kampanyasının oldPrice'ı (₺2.500) KALDIRILDI: son 30 günde
      // ₺1.250'ye satıldığı için ₺2.500 "önceki fiyat" olarak gösterilemez.
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
      price: 152.44, currency: "USD",                     // ₺7.500 @ 49,2
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
      price: 203.25, currency: "USD",                     // ₺10.000 @ 49,2
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
      price: 203.25, currency: "USD",                     // ₺10.000 @ 49,2
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
      price: 1491.3, currency: "USD",                     // ₺73.400 (eski ₺73.372) @ 49,2
      chips: ["🔋 5,22 kWh", "⚡ 51,2 V · 102 Ah", "♻️ 6000+ çevrim"],
      for: "Ev ve işyeri enerji depolama, off-grid ve yedek güç",
      name: "TitanX 51,2 V 102 Ah LiFePO₄ Akü",
      desc: "51,2 V 102 Ah (5,22 kWh) LiFePO₄ enerji depolama aküsü. 16S1P prizmatik hücre yapısı, dahili akıllı BMS ile aşırı şarj/deşarj, aşırı akım, kısa devre ve sıcaklık koruması. 100 A sürekli deşarj, 150 A tepe (5 sn); 6000+ çevrim ömrü (%80 DoD). CAN/RS485 ve Bluetooth veya WiFi haberleşme; 16 adede kadar paralel bağlanabilir. Ağırlık 37 kg, ölçü 560 × 150 × 380 mm, IP20, M8 terminal, 2 yıl garanti.",
      features: ["51,2 V · 102 Ah · 5,22 kWh · LiFePO₄ (16S1P prizmatik)", "Dahili akıllı BMS — aşırı şarj/deşarj, kısa devre, sıcaklık koruması", "100 A sürekli deşarj · 150 A tepe (5 sn) · 100 A şarj", "6000+ çevrim ömrü (%80 DoD, 25 °C) · 2 yıl garanti", "CAN / RS485 · Bluetooth veya WiFi · 16 adede kadar paralel", "37 kg · 560 × 150 × 380 mm · IP20 · M8 terminal"]
    },

    // —— Şarj kontrol ve DC-DC cihazları (Havensis) —— group:"charge" YALNIZ
    // online-satis.html kataloğunda listelenir (urunler.html GROUPS'ta yok).
    // KAYNAK: Havensis 02/2026 GENEL FİYAT LİSTESİ (PDF; teklif 01.02.2026,
    // geçerlilik 30.05.2026), sıra no 12 · 15 · 17 · 24 · 26 · 27 · 31.
    // Teknik değerler YALNIZ listedeki maddelerdir; listede olmayan değer
    // (garanti, ağırlık, IP sınıfı…) YAZILMAZ.
    // FİYAT: liste USD ve "Fiyatlarımıza KDV dahil değildir" der. İşletme
    // kararı (29 Eyl 2026): liste AYNEN uygulanır, yalnız %20 KDV eklenir
    // (100 USD → 120 USD); sitede KDV DAHİL gösterilir → `price` = liste ×
    // 1,20. Kâr payı EKLENMEZ. ₺ karşılığı config.usdTry ile hesaplanır.
    // Liste değişince yalnız bu satırlar güncellenir (yanında liste fiyatı).
    // MARKA: Havensis gerçek üreticidir — fotoğraftaki logo SİLİNMEZ (UNV
    // kuralı). Görseller: kaynak/havensis-*.png → tools/foto-hazirla.py.
    // ÜRÜN SAYFALARI (url): tools/havensis-sayfalar.py üretir — sayfaları
    // elle düzenleme; metni betikte değiştir, --uygula ile çalıştır.
    {
      id: "havensis-s30amps", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      url: "havensis-mppt-30a.html", sku: "S30AMPS", brand: "Havensis",
      img: "assets/img/products/havensis-s30amps.webp",
      price: 129.6, currency: "USD",        // liste 108 USD + %20 KDV (sıra 12)
      chips: ["⚡ 12/24 V · 30 A", "☀️ 100 V · 1200 W panel", "📟 LCD ekran"],
      for: "12/24 V akülü güneş sistemleri · 1200 W panele kadar",
      name: "Havensis Solar-30AMPS MPPT Şarj Kontrol Cihazı 12/24 V 30 A",
      desc: "Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-30AMPS – 100|30). 12/24 V akü şarjı, 30 A şarj akımı ve 20 A yük çıkışı. Gelişmiş MPPT algoritmasıyla %98 dönüştürücü ve %99,6 MPP izleme verimi; 100 V'a kadar panel girişi, 1200 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir, gece-gündüz ve zaman ayarı fonksiyonu; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 159 × 210 × 70 mm. Yerli üretim.",
      features: ["12/24 V akü şarjı · 30 A şarj · 20 A yük çıkışı", "Gelişmiş MPPT · %98 dönüştürücü, %99,6 MPP izleme verimi", "Maks. 100 V panel girişi · 1200 W'a kadar panel", "LCD ekran ve LED durum göstergesi · tüm parametreler ayarlanabilir", "Gece-gündüz ve zaman ayarı · aküsüz çalışabilir", "159 × 210 × 70 mm · yerli üretim"]
    },
    {
      id: "havensis-s60amps100", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      url: "havensis-mppt-60a.html", sku: "S60AMPS100", brand: "Havensis",
      img: "assets/img/products/havensis-s60amps100.webp",
      price: 240, currency: "USD",          // liste 200 USD + %20 KDV (sıra 15)
      chips: ["⚡ 12/24 V · 60 A", "☀️ 100 V · 2500 W panel", "📟 LCD ekran"],
      for: "12/24 V akülü güneş sistemleri · 2500 W panele kadar",
      name: "Havensis Solar-60AMPS-100 MPPT Şarj Kontrol Cihazı 12/24 V 60 A",
      desc: "Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-60AMPS-100 – 100|60). 12/24 V akü şarjı, 60 A şarj akımı ve 20 A yük çıkışı. Gelişmiş MPPT algoritmasıyla %98 dönüştürücü ve %99,6 MPP izleme verimi; 100 V'a kadar panel girişi, 2500 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir, gece-gündüz ve zaman ayarı fonksiyonu; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 197,2 × 224 × 80 mm. Yerli üretim.",
      features: ["12/24 V akü şarjı · 60 A şarj · 20 A yük çıkışı", "Gelişmiş MPPT · %98 dönüştürücü, %99,6 MPP izleme verimi", "Maks. 100 V panel girişi · 2500 W'a kadar panel", "LCD ekran ve LED durum göstergesi · tüm parametreler ayarlanabilir", "Gece-gündüz ve zaman ayarı · aküsüz çalışabilir", "197,2 × 224 × 80 mm · yerli üretim"]
    },
    {
      id: "havensis-s60amps150", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      url: "havensis-mppt-60a-150v.html", sku: "S60AMPS", brand: "Havensis",
      img: "assets/img/products/havensis-s60amps150.webp",
      price: 330, currency: "USD",          // liste 275 USD + %20 KDV (sıra 17)
      chips: ["⚡ 12–48 V · 60 A", "☀️ 150 V · 5000 W panel", "📟 LCD ekran"],
      for: "12/24/36/48 V akülü güneş sistemleri · 5000 W panele kadar",
      name: "Havensis Solar-60AMPS 150|60 MPPT Şarj Kontrol Cihazı 12/24/36/48 V 60 A",
      desc: "Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-60AMPS – 150|60). 12/24/36/48 V akü şarjı ve 60 A şarj akımı. Gelişmiş MPPT algoritmasıyla %97,5 dönüştürücü ve %99,6 MPP izleme verimi; 150 V'a kadar panel girişi, 5000 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 280 × 235 × 100 mm. Yerli üretim.",
      features: ["12/24/36/48 V akü şarjı · 60 A şarj akımı", "Gelişmiş MPPT · %97,5 dönüştürücü, %99,6 MPP izleme verimi", "Maks. 150 V panel girişi · 5000 W'a kadar panel", "LCD ekran ve LED durum göstergesi · tüm parametreler ayarlanabilir", "Panelden beslenir, aküsüz çalışabilir", "280 × 235 × 100 mm · yerli üretim"]
    },
    {
      id: "havensis-dcdc-1224-30", icon: "🔋", tag: "DC-DC Şarj", group: "charge",
      url: "havensis-dcdc-30a.html", sku: "DCDC-1224-30", brand: "Havensis",
      img: "assets/img/products/havensis-dcdc-1224.webp",
      price: 198, currency: "USD",          // liste 165 USD + %20 KDV (sıra 24)
      chips: ["🔋 12/24 V · 30 A", "🚐 Alternatörden şarj", "⚙️ %96,4 verim"],
      for: "Karavan: alternatörden yaşam aküsüne şarj · 12/24 V",
      name: "Havensis DCDC-1224 Tek Yönlü DC-DC Akü Şarj Cihazı 12/24 V 30 A",
      desc: "Havensis tek yönlü DC-DC akü şarj cihazı (DCDC-1224, 30 A). Alternatörden akü şarj cihazıdır; 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir. Karavanlar için özel tasarlanmıştır. 30 A şarj akımı, %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; LED durum göstergesi, dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 158 × 210 × 60 mm. Yerli üretim.",
      features: ["12/24 V akü şarjı · 30 A şarj akımı", "Alternatörden akü şarjı · 12-12, 12-24, 24-12, 24-24 V", "%96,4 dönüştürücü verimi · 10–35 V giriş, 12–32 V çıkış", "Tüm parametreler ekranla programlanabilir · LED durum göstergesi", "Dijital ekran bağlantısı ve 5 m uzatma kablosu", "Ters akım koruması (motor kapalı tanıma) · 158 × 210 × 60 mm"]
    },
    {
      id: "havensis-dcdc-1224-40", icon: "🔋", tag: "DC-DC Şarj", group: "charge",
      url: "havensis-dcdc-40a.html", sku: "DCDC-1224-40", brand: "Havensis",
      img: "assets/img/products/havensis-dcdc-1224.webp",
      price: 240, currency: "USD",          // liste 200 USD + %20 KDV (sıra 26)
      chips: ["🔋 12/24 V · 40 A", "🚐 Alternatörden şarj", "⚙️ %96,4 verim"],
      for: "Karavan: alternatörden yaşam aküsüne şarj · 12/24 V",
      name: "Havensis DCDC-1224 Tek Yönlü DC-DC Akü Şarj Cihazı 12/24 V 40 A",
      desc: "Havensis tek yönlü DC-DC akü şarj cihazı (DCDC-1224, 40 A). Alternatörden akü şarj cihazıdır; 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir. Karavanlar için özel tasarlanmıştır. 40 A şarj akımı, %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; LED durum göstergesi, dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      features: ["12/24 V akü şarjı · 40 A şarj akımı", "Alternatörden akü şarjı · 12-12, 12-24, 24-12, 24-24 V", "%96,4 dönüştürücü verimi · 10–35 V giriş, 12–32 V çıkış", "Tüm parametreler ekranla programlanabilir · LED durum göstergesi", "Dijital ekran bağlantısı ve 5 m uzatma kablosu", "Ters akım koruması (motor kapalı tanıma) · 162 × 210 × 70 mm"]
    },
    {
      id: "havensis-dcdc-1224b-40", icon: "🔋", tag: "DC-DC Şarj", group: "charge",
      url: "havensis-dcdc-40a-cift-yonlu.html", sku: "DCDC-1224B-40", brand: "Havensis",
      img: "assets/img/products/havensis-dcdc-1224b.webp",
      price: 276, currency: "USD",          // liste 230 USD + %20 KDV (sıra 27)
      chips: ["🔋 12/24 V · 40 A", "🔁 Çift yönlü · 10 A takviye", "⚙️ %96,4 verim"],
      for: "Karavan: çift yönlü akü şarjı (takviye modu) · 12/24 V",
      name: "Havensis DCDC-1224B Çift Yönlü DC-DC Akü Şarj Cihazı 12/24 V 40 A",
      desc: "Havensis çift yönlü DC-DC akü şarj cihazı (DCDC-1224B, 40 A). Çift yönlü akü şarjı yapabilir (takviye modu): 40 A şarj akımı ve 10 A takviye şarj akımı. 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir; karavanlar için özel tasarlanmıştır. %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      features: ["12/24 V akü şarjı · 40 A şarj · 10 A takviye şarj akımı", "Çift yönlü akü şarjı (takviye modu) · 12-12, 12-24, 24-12, 24-24 V", "%96,4 dönüştürücü verimi · 10–35 V giriş, 12–32 V çıkış", "Tüm parametreler ekranla programlanabilir", "Dijital ekran bağlantısı ve 5 m uzatma kablosu", "Ters akım koruması (motor kapalı tanıma) · 162 × 210 × 70 mm"]
    },
    {
      id: "havensis-dcdc-2448", icon: "🔋", tag: "DC-DC Şarj", group: "charge",
      url: "havensis-boost-dcdc-2448.html", sku: "DCDC-2472-20", brand: "Havensis",
      img: "assets/img/products/havensis-dcdc-2448.webp",
      price: 168, currency: "USD",          // liste 140 USD + %20 KDV (sıra 31)
      chips: ["🔋 36/48/60/72 V akü", "⚡ 12/24 V giriş · 15 A şarj", "⚙️ %95 verim"],
      for: "12/24 V girişten 36–72 V aküye şarj · karavan ve tekne",
      name: "Havensis BOOST DCDC-2448 DC-DC Akü Şarj Cihazı 36/48/60/72 V",
      desc: "Havensis BOOST DCDC-2448 yükseltici DC-DC akü şarj cihazı. 12/24 V girişle 36/48/60/72 V akü şarjı yapar: 12–32 V giriş gerilimi, en fazla 20 A giriş ve 15 A şarj akımı, %95 dönüştürücü verimi. Karavan ve tekneler için özel tasarlanmıştır. Dijital ekran bağlantısı ve 5 m uzatma kablosu, gelişmiş koruma devreleri; dahili Bluetooth desteği isteğe bağlıdır (siparişte belirtin). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      features: ["12/24 V girişle 36/48/60/72 V akü şarjı", "12–32 V giriş · maks. 20 A giriş, 15 A şarj akımı", "%95 dönüştürücü verimi · gelişmiş koruma devreleri", "Dijital ekran bağlantısı ve 5 m uzatma kablosu", "İsteğe bağlı dahili Bluetooth (siparişte belirtin)", "162 × 210 × 70 mm · yerli üretim"]
    },

    // —— Lexron şarj kontrol cihazları —— GES Marketim kataloğundan (gesmarketim1
    // data/catalog.json, 10.08.2026 Lexron listesi) aktarıldı, 5 Eki 2026.
    // price = GES Marketim'in KDV dahil saleUsd'si × 1,10 (6 Eki 2026, sahibin
    // kararı: gespaenerji'de %10 üstü fiyat).
    // Tedarikçi adı ve maliyet AKTARILMAZ. Akü gerilimleri ürün görselindeki
    // üretici etiketinden; panel girişi, yük çıkışı, koruma gibi değerler elimizde
    // YOK — yazılmaz, "bize yazın" denir (Havensis kuralı). Detay sayfası yok,
    // iniş sayfası online-satis.html. 10 A PWM stokta olmadığı için alınmadı.
    {
      id: "lexron-pwm-20a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-20APWMSARJKONT", brand: "Lexron",
      img: "assets/img/products/lexron-pwm-20a.webp",
      price: 14.77, currency: "USD",
      chips: ["⚡ 12/24 V · 20 A", "🔆 PWM"],
      for: "12/24 V akülü küçük güneş sistemleri",
      name: "Lexron 20 A PWM Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron PWM güneş şarj kontrol cihazı: 12/24 V akü sistemlerinde panelden aküye şarjı düzenler ve aküyü aşırı şarja karşı korur. PWM teknolojisi, panel gerilimi akü gerilimine yakın küçük sistemler (bağ evi, aydınlatma, kamera) için ekonomik bir çözümdür. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "PWM şarj teknolojisi", "Ekonomik küçük sistem çözümü", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-pwm-30a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-30APWMSARJKONT", brand: "Lexron",
      img: "assets/img/products/lexron-pwm-30a.webp",
      price: 16.58, currency: "USD",
      chips: ["⚡ 12/24 V · 30 A", "🔆 PWM"],
      for: "12/24 V akülü küçük güneş sistemleri",
      name: "Lexron 30 A PWM Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron PWM güneş şarj kontrol cihazı: 12/24 V akü sistemlerinde panelden aküye şarjı düzenler ve aküyü aşırı şarja karşı korur. PWM teknolojisi, panel gerilimi akü gerilimine yakın küçük sistemler (bağ evi, aydınlatma, kamera) için ekonomik bir çözümdür. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "PWM şarj teknolojisi", "Ekonomik küçük sistem çözümü", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-pwm-40a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-40APWMSARJKONT", brand: "Lexron",
      img: "assets/img/products/lexron-pwm-40a.webp",
      price: 21.34, currency: "USD",
      chips: ["⚡ 12/24 V · 40 A", "🔆 PWM"],
      for: "12/24 V akülü küçük güneş sistemleri",
      name: "Lexron 40 A PWM Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron PWM güneş şarj kontrol cihazı: 12/24 V akü sistemlerinde panelden aküye şarjı düzenler ve aküyü aşırı şarja karşı korur. PWM teknolojisi, panel gerilimi akü gerilimine yakın küçük sistemler (bağ evi, aydınlatma, kamera) için ekonomik bir çözümdür. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "PWM şarj teknolojisi", "Ekonomik küçük sistem çözümü", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-pwm-60a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-60APWMSARJKONT", brand: "Lexron",
      img: "assets/img/products/lexron-pwm-60a.webp",
      price: 44.31, currency: "USD",
      chips: ["⚡ 12/24/48 V · 60 A", "🔆 PWM"],
      for: "12/24/48 V akülü güneş sistemleri",
      name: "Lexron 60 A PWM Şarj Kontrol Cihazı 12/24/48 V",
      desc: "Lexron PWM güneş şarj kontrol cihazı: 12/24/48 V akü sistemlerinde panelden aküye şarjı düzenler ve aküyü aşırı şarja karşı korur. 60 A şarj akımıyla daha büyük panel gücüne sahip PWM sistemler içindir. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24/48 V akü sistemleri", "PWM şarj teknolojisi", "60 A şarj akımı", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-mppt-20a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-20AMPPTSARJKON", brand: "Lexron",
      img: "assets/img/products/lexron-mppt-20a.webp",
      price: 64, currency: "USD",
      chips: ["⚡ 12/24 V · 20 A", "🔆 MPPT"],
      for: "12/24 V akülü güneş sistemleri · yüksek verim",
      name: "Lexron 20 A MPPT Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron MPPT güneş şarj kontrol cihazı: panelin maksimum güç noktasını izler; panel gerilimi akü geriliminden yüksek olduğunda PWM'e göre aküye daha fazla enerji aktarır. 12/24 V akü sistemleri için uygundur. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "MPPT şarj teknolojisi", "PWM'e göre daha yüksek verim", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-mppt-30a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-30AMPPTSARJKON", brand: "Lexron",
      img: "assets/img/products/lexron-mppt-30a.webp",
      price: 70.57, currency: "USD",
      chips: ["⚡ 12/24 V · 30 A", "🔆 MPPT"],
      for: "12/24 V akülü güneş sistemleri · yüksek verim",
      name: "Lexron 30 A MPPT Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron MPPT güneş şarj kontrol cihazı: panelin maksimum güç noktasını izler; panel gerilimi akü geriliminden yüksek olduğunda PWM'e göre aküye daha fazla enerji aktarır. 12/24 V akü sistemleri için uygundur. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "MPPT şarj teknolojisi", "PWM'e göre daha yüksek verim", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-mppt-40a", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-40AMPPTSARJKON", brand: "Lexron",
      img: "assets/img/products/lexron-mppt-40a.webp",
      price: 77.14, currency: "USD",
      chips: ["⚡ 12/24 V · 40 A", "🔆 MPPT"],
      for: "12/24 V akülü güneş sistemleri · yüksek verim",
      name: "Lexron 40 A MPPT Şarj Kontrol Cihazı 12/24 V",
      desc: "Lexron MPPT güneş şarj kontrol cihazı: panelin maksimum güç noktasını izler; panel gerilimi akü geriliminden yüksek olduğunda PWM'e göre aküye daha fazla enerji aktarır. 12/24 V akü sistemleri için uygundur. Panel giriş gerilimi ve yük çıkışı gibi ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24 V akü sistemleri", "MPPT şarj teknolojisi", "PWM'e göre daha yüksek verim", "Teknik künye için bize yazın"]
    },
    {
      id: "lexron-mppt-80a-hv", icon: "☀️", tag: "Şarj Kontrol", group: "charge",
      sku: "GM-80AHV15230VMPP", brand: "Lexron",
      img: "assets/img/products/lexron-mppt-80a-hv.webp",
      price: 205.14, currency: "USD",
      chips: ["⚡ 12/24/36/48 V · 80 A", "🔆 MPPT · HV"],
      for: "12/24/36/48 V akülü büyük güneş sistemleri",
      name: "Lexron 80 A HV (15~230 V) MPPT Şarj Kontrol Cihazı 12/24/36/48 V",
      desc: "Lexron 80 A HV (15~230 V) MPPT güneş şarj kontrol cihazı: 12/24/36/48 V akü sistemleri için yüksek akımlı MPPT modeli. MPPT teknolojisi panelin maksimum güç noktasını izleyerek enerjiyi aküye verimli aktarır. Ayrıntılı teknik değerler için bize yazın; üreticiden teyit edelim.",
      features: ["12/24/36/48 V akü sistemleri", "80 A şarj akımı", "MPPT şarj teknolojisi", "Teknik künye için bize yazın"]
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
      price: 20.33, currency: "USD",                      // ₺1.000 @ 49,2
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
      price: 321.14, currency: "USD",                     // ₺15.800 @ 49,2
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
      price: 371.95, currency: "USD",                     // ₺18.300 @ 49,2
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
      price: 2.03, currency: "USD",                       // ₺100 @ 49,2
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
  // önerilen sistem gösterilir → isterse ürünleri değiştirir → sipariş özeti
  // (mağaza ürünleri sepete, sistemin tamamı WhatsApp'a).
  // KURAL: builder.js'e hiçbir sayı/fiyat gömülmez; tümü buradan okunur.
  // TEK FİYAT KAYNAĞI: mağazada satılan kalem `pkg` ile config.packages'e
  // bağlanır; ad, marka, fiyat, havale tutarı ve stok ORADAN gelir (main.js
  // pkgUnit kuralı). Admin panelinin paket fiyatı değişikliği de böylece
  // kurucuya yansır. Mağazada karşılığı olan ürüne burada İKİNCİ BİR FİYAT
  // YAZILMAZ; eskiden yazılıyordu ve kurucu mağazadan farklı fiyat gösteriyordu.
  // `pkg`'siz kalem mağazada satılmayan, TEKLİFLE fiyatlanan kalemdir:
  // `price` tahmini liste fiyatıdır (KDV dahil), arayüzde "tahmini" diye
  // ayrı gösterilir, sepete eklenmez ve havale indirimi almaz.
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
    // prefer: { tür: katalog kimliği } → öneri bu modelle başlar (karavan
    //   tavanına 2,4 m'lik panel sığmaz, kompakt panel önerilir).
    // tip: senaryoya özel yönlendirme; 3. adımda bilgi kutusu olarak çıkar.
    //   Metin ve bağlantı etiketi i18n DICT'ten çevrilir (3 dil ekle).
    presets: [
      { id: "bagevi", icon: "🏡", label: "Bağ Evi", desc: "Hafta sonu kullanımı, temel konfor",
        items: { buzdolabi: 1, tv: 1, led: 6, telefon: 2, wifi: 1, su_pompasi: 1 } },
      { id: "karavan", icon: "🚐", label: "Karavan / Kamp", desc: "Mobil kullanım, düşük tüketim",
        items: { buzdolabi_mini: 1, led: 4, telefon: 2, laptop: 1 },
        prefer: { panel: "pnl-lexron-285" } },
      { id: "mustakil", icon: "🏠", label: "Müstakil Ev", desc: "Tam zamanlı yaşam",
        items: { buzdolabi: 1, tv: 2, led: 12, telefon: 4, wifi: 1, camasir: 1, bulasik: 1, su_pompasi: 1, klima: 1 } },
      { id: "tarla", icon: "🌾", label: "Tarla / Sulama", desc: "Pompa ağırlıklı sezonluk",
        items: { dalgic_pompa: 1, led: 2, kamera: 2 },
        tip: { text: "Sulama pompası gündüz doğrudan güneşten çalışabilir; aküsüz güneşli pompa sistemi çoğu zaman çok daha ekonomiktir.",
               link: "Sulama pompası hesabı →", href: "tarimsal-sulama.html" } },
      { id: "isyeri", icon: "🏪", label: "Dükkân / Ofis", desc: "Gündüz ağırlıklı işletme",
        items: { led: 15, bilgisayar: 3, klima: 2, buzdolabi: 1, wifi: 1, yazarkasa: 1 },
        tip: { text: "Şebekeye bağlı bir işyerinde faturayı düşüren şebeke bağlantılı çatı GES'i çoğu zaman daha ekonomiktir.",
               link: "Faturaya göre hesapla →", href: "hesaplayici.html" } }
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

    // Ürün kataloğu — `pkg` = config.packages kimliği (ad/marka/fiyat/stok
    // mağazadan gelir); burada yalnız boyutlandırma verisi durur.
    //   panel.w: panel gücü (W) · battery.kwh: nominal enerji (kWh)
    //   battery.dod: kullanılabilir kapasite oranı — akü adedi buna göre hesaplanır
    //   v: sistem gerilimi (V). Akü ile inverter AYNI gerilimde olmalıdır;
    //      kurucu yalnız uyumlu modeli önerir, uyumsuz seçimde uyarır.
    // Mağazada satılmayan model buraya YAZILMAZ; kaldırılan uydurma modeller:
    // Lexron 550 W, Arçelik 560 W, Bakırlar 450 W, 12/24 V aküler ve inverterler
    // (48 V aküyle çalışmayan 12/24 V inverter öneriliyordu).
    catalog: {
      panel: [
        { id: "pnl-lexron-655", pkg: "panel-lexron-655w", w: 655 },
        { id: "pnl-arcelik-540", pkg: "panel-arcelik-540w", w: 540 },
        { id: "pnl-lexron-285", pkg: "panel-lexron-285w", w: 285 }
      ],
      battery: [
        { id: "bat-titanx-51-102", pkg: "aku-titanx-51v-102ah", kwh: 5.22, dod: 0.9, v: 48 }
      ],
      // İnverter mağazada satılmıyor → TEKLİFLE satılır, sepete girmez.
      // Fiyatlar İŞLETMENİN liste fiyatıdır (26 Eyl 2026): `firm: true` =
      // tahmini DEĞİL, arayüz yanına "tahmini" yazmaz. `firm`'süz teklifle
      // kalem (pano, konstrüksiyon, işçilik) tahmindir.
      // Gerilim: 6,2 ve 11 kW sınıfı tek faz inverterler 48 V akü sistemidir
      // (işletmeden teyit bekleniyor). Gereken güç tek cihazı aşarsa kurucu
      // paralel adet önerir; en ucuz birleşim seçilir (8 kW → 1 × 11 kW).
      inverter: [
        { id: "inv-lexron-6-2", brand: "Lexron", name: "6,2 kW İnverter", kw: 6.2, v: 48, price: 28000, firm: true },
        { id: "inv-lexron-11", brand: "Lexron", name: "11 kW İnverter", kw: 11, v: 48, price: 50000, firm: true }
      ],
      // Yardımcı kalemler — qty: hesaplanan miktar kuralı
      //   perPanel  : panel adedi kadar · perSystem: 1 adet · perKwp: kurulu güç
      //   perCableSet: toplam DC kablo (panel × sizing.cableMetersPerPanel)
      //                ÷ takımdaki kablo metresi (`meters`), yukarı yuvarlanır
      // `pkg` olan kalem mağaza ürünüdür (adet tam sayı, sepete eklenebilir).
      extras: [
        { id: "ext-mc4", pkg: "mc4-set", unit: "takım", qty: "perPanel", on: true },
        { id: "ext-dckablo", pkg: "kablo-solar-5m", unit: "takım", qty: "perCableSet", meters: 10, on: true },
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

  // Admin paneli şifresi BURADA DEĞİL: yalnız Railway ortam değişkeni
  // ADMIN_PASS (bu dosya her ziyaretçiye servis edilir, repo herkese açık).

  // Soru & Cevap: makale altındaki herkese açık, ONAYLI soru-cevap bölümü.
  // Sunucu yalnız burada listelenen sayfalara gönderi kabul eder; sayfada
  // <!-- QA:STATIC --> işaretleri ve data-qa-page olmalı (docs/soru-cevap.md).
  qa: {
    pages: ["gunes-paneli-kacak-elektrik-cezasi"],
    expertName: "GESPA Uzmanı"   // firmanın cevaplarındaki rozet
  },

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
