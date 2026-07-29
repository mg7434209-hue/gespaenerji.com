/* ============================================================
   GESPA Enerji — TEK DOĞRU KAYNAK (config)
   Şirket bilgileri, markalar ve hesaplayıcı katsayıları.
   Sayfalardaki içerik buradan beslenir (assets/main.js enjekte eder).
   İletişim/katsayı değişince SADECE bu dosyayı düzenleyin.
   ============================================================ */
window.GESPA = window.GESPA || {};
window.GESPA.config = {
  company: {
    legalName: "Gespa Enerji Ltd. Şti.",
    brandName: "GESPA Enerji",
    phone: {
      display: "0543 743 42 09",
      tel: "+905437434209",      // tel: linkleri
      wa: "905437434209"          // wa.me/ linkleri
    },
    email: "gesmarketim@gmail.com",
    address: {
      line: "Örnek Mah. 1551 Sok. No:10/1",
      district: "Manavgat",
      city: "Antalya",
      country: "TR",
      full: "Örnek Mah. 1551 Sok. No:10/1, Manavgat / Antalya"
    },
    web: "https://www.gespaenerji.com",
    hours: "Hafta içi 09:00 – 18:00",
    // SEO / schema.org zenginleştirme — boş bırakılan alanlar JSON-LD'ye yazılmaz
    openingHours: "Mo-Fr 09:00-18:00",   // schema.org LocalBusiness.openingHours
    priceRange: "₺₺",                     // tahmini fiyat aralığı (zorunlu değil ama önerilir)
    slogan: "Manavgat ve Antalya'da anahtar teslim güneş enerjisi santralleri",
    description: "Gespa Enerji; Manavgat/Antalya merkezli, çatı ve arazi tipi güneş enerjisi santralleri (GES) ile güneş enerjili tarımsal sulama için anahtar teslim mühendislik, kurulum, finansman ve bakım hizmeti sunar.",
    foundingYear: 2005,                   // kuruluş yılı girilince schema'ya eklenir
    areaServed: ["Manavgat", "Side", "Antalya", "Alanya", "Serik", "Gazipaşa", "Akseki", "Gündoğmuş"],
    knowsAbout: ["Güneş enerjisi santrali (GES)", "Çatı GES", "Arazi tipi GES", "Güneş enerjili tarımsal sulama", "Güneş paneli", "İnverter", "Enerji depolama / batarya", "Lisanssız elektrik üretimi"],
    services: ["Çatı GES", "Arazi Tipi GES", "Güneş Enerjili Tarımsal Sulama", "Enerji Depolama (Batarya)", "Mühendislik & Projelendirme", "Finansman & Leasing", "Bakım (O&M)"],
    rating: { value: null, count: null }, // GERÇEK Google yorum ortalaması/sayısı girilince aggregateRating eklenir (uydurma değer GİRMEYİN)
    geo: { lat: null, lng: null },        // kesin koordinat girilince schema'ya eklenir
    sameAs: [],                           // gerçek sosyal medya URL'leri (LinkedIn/Instagram/X) eklenince doldurun
    // Vitrin istatistikleri — TEK KAYNAK (build data-stat öğelerine basar)
    stats: { projects: 500, installedMw: 15, experienceYears: 20, warrantyYears: 25, satisfactionPct: 98 }
  },

  // Analitik — ID girilince yüklenir (boş = kapalı). KVKK için çerez onayı önerilir.
  analytics: {
    ga4: ""   // örn. "G-XXXXXXXXXX" (Google Analytics 4 ölçüm kimliği)
  },

  // Kullanılan markalar
  brands: {
    panel: ["Arçelik", "Lexron", "Bakırlar"],
    inverter: ["Tescom", "Mexxsun", "Lexron", "Arçelik"]
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
  packages: [
    // —— Taşınabilir & Off-Grid (lityum bataryalı) paketler —— açık perakende fiyatı
    // img: "assets/img/products/x.webp" -> kartta çizim yerine gerçek ürün fotoğrafı
    // oldPrice: üstü çizili liste fiyatı (indirim rozeti otomatik hesaplanır)
    // currency: "USD" -> $ ile gösterilir (varsayılan ₺)
    {
      id: "kit-285w", icon: "🧰", tag: "Taşınabilir", group: "offgrid", kit: true,
      kwp: 0.285, panelW: 285, panelCount: 1, portable: true,
      price: 22000, oldPrice: 25000,
      for: "Kamp, karavan ve küçük ihtiyaçlar",
      name: "285W Güneş Paneli Paketi",
      desc: "Komple sistem: 285 W panel, güç kutusu ve bağlantı kabloları dahil tak-çalıştır mobil kit. TV, lamba ve telefon şarjı çalıştırır; 23–25 kg.",
      features: ["TV, lamba ve telefon şarjı çalıştırır", "23–25 kg — mobil taşınabilir", "Güç kutusu ve kablolar dahil", "Tak-çalıştır kurulum"]
    },
    {
      id: "kit-2x540w", icon: "🎒", tag: "Taşınabilir", group: "offgrid", kit: true,
      kwp: 1.08, panelW: 540, panelCount: 2, portable: true,
      price: 2000, oldPrice: 2200, currency: "USD",
      for: "Karavan, kamp ve bağ evi",
      name: "Tam Kapsamlı Güneş Enerjisi Sistemi",
      desc: "2× 540 W güneş paneli dahil komple mobil sistem: LiFePO₄ lityum batarya ve büyük güç kutusuyla buzdolabı, TV, çamaşır ve bulaşık makinesini çalıştırır.",
      features: ["Buzdolabı, TV, çamaşır ve bulaşık makinesini çalıştırır", "LiFePO₄ lityum batarya dahil", "Büyük güç kutusu ve kablolar dahil", "Mobil taşınabilir, off-grid çalışma"]
    },
    {
      id: "offgrid-3kw", icon: "🛖", tag: "Taşınabilir", group: "offgrid", kwp: 3, portable: true, price: 145934, popular: true,
      for: "Bağ evi ve küçük yapılar",
      name: "3 kW Off-Grid Paket",
      desc: "Bağ evi ve küçük müstakil yapılar için lityum bataryalı sistem.",
      features: ["Lityum batarya dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "Hazır kurulum kiti"]
    },
    {
      id: "offgrid-4kw", icon: "🏕️", tag: "Taşınabilir", group: "offgrid", kwp: 4.2, portable: true, price: 185105,
      for: "Bağ evi ve tam gün kullanım",
      name: "4.2 kW Off-Grid Paket",
      desc: "Tam günlük temel tüketim için güçlü off-grid kit.",
      features: ["Lityum batarya dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },
    {
      id: "offgrid-6kw", icon: "🏚️", tag: "Off-Grid", group: "offgrid", kwp: 6.2, price: 269637,
      for: "Müstakil ev ve villalar",
      name: "6.2 kW Off-Grid Paket",
      desc: "Müstakil ev ihtiyaçları için yüksek kapasiteli sistem.",
      features: ["Lityum batarya dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },
    {
      id: "offgrid-8kw", icon: "🔌", tag: "Off-Grid", group: "offgrid", kwp: 8, price: 538543,
      for: "Yoğun tüketimli evler",
      name: "8 kW Off-Grid Paket",
      desc: "Yoğun tüketim ve kesintisiz enerji için tam donanım.",
      features: ["Lityum batarya dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },

    // —— Tarımsal sulama paketleri —— (off-grid PV; fiyat formülden türetilir)
    {
      id: "sulama-bahce", icon: "🪴", tag: "Tarım", group: "irrigation", kwp: 3, pumpKw: 2.2,
      for: "Küçük bahçe ve damla sulama",
      name: "Bağ-Bahçe Sulama Paketi",
      desc: "Küçük bağ-bahçe ve damla sulama için kompakt güneş sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-tarla", icon: "🌾", tag: "Tarım", group: "irrigation", kwp: 7.5, pumpKw: 5.5,
      for: "Orta ölçekli tarlalar",
      name: "Tarla Sulama Paketi",
      desc: "Orta ölçekli tarlalar için dalgıç pompalı güneş enerjisi sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-sera", icon: "🏡", tag: "Tarım", group: "irrigation", kwp: 11, pumpKw: 7.5,
      for: "Sera ve büyük bahçeler",
      name: "Sera Sulama Paketi",
      desc: "Sera ve büyük bahçe sulaması için yüksek debili sistem.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-genis", icon: "🚜", tag: "Tarım", group: "irrigation", kwp: 20, pumpKw: 15,
      for: "Geniş araziler ve çiftlikler",
      name: "Geniş Tarla Sulama Paketi",
      desc: "Geniş araziler için mazotsuz, şebekeden bağımsız sulama sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    }
  ],

  // Paket seçim rehberi (urunler.html) — kullanım yeri -> önerilen paket id'si
  packageGuide: [
    { icon: "🚐", label: "Karavan / Kamp", target: "kit-285w" },
    { icon: "🏡", label: "Bağ Evi", target: "offgrid-3kw" },
    { icon: "🏠", label: "Müstakil Ev", target: "offgrid-6kw" },
    { icon: "🪴", label: "Bahçe Sulama", target: "sulama-bahce" },
    { icon: "🌾", label: "Tarla / Sera", target: "sulama-tarla" }
  ],

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
