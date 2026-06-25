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
    foundingYear: null,                   // kuruluş yılı girilince schema'ya eklenir
    areaServed: ["Manavgat", "Side", "Antalya", "Alanya", "Serik", "Gazipaşa", "Akseki", "Gündoğmuş"],
    knowsAbout: ["Güneş enerjisi santrali (GES)", "Çatı GES", "Arazi tipi GES", "Güneş enerjili tarımsal sulama", "Güneş paneli", "İnverter", "Enerji depolama / batarya", "Lisanssız elektrik üretimi"],
    services: ["Çatı GES", "Arazi Tipi GES", "Güneş Enerjili Tarımsal Sulama", "Enerji Depolama (Batarya)", "Mühendislik & Projelendirme", "Finansman & Leasing", "Bakım (O&M)"],
    rating: { value: null, count: null }, // GERÇEK Google yorum ortalaması/sayısı girilince aggregateRating eklenir (uydurma değer GİRMEYİN)
    geo: { lat: null, lng: null },        // kesin koordinat girilince schema'ya eklenir
    sameAs: []                            // gerçek sosyal medya URL'leri (LinkedIn/Instagram/X) eklenince doldurun
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
    // —— Çatı / On-Grid paketler ——
    {
      id: "konut-baslangic", icon: "🏠", tag: "Konut", group: "ongrid", kwp: 5,
      name: "Başlangıç Konut Paketi",
      desc: "Küçük ve orta ölçekli evler için ekonomik giriş paketi.",
      features: ["Anahtar teslim kurulum", "On-grid (şebeke bağlantılı)", "Tek fazlı sistem", "25 yıl panel performans garantisi"]
    },
    {
      id: "konut-standart", icon: "🏡", tag: "Konut", group: "ongrid", kwp: 10, popular: true,
      name: "Standart Konut Paketi",
      desc: "Aileler için en çok tercih edilen dengeli çözüm.",
      features: ["Anahtar teslim kurulum", "On-grid (şebeke bağlantılı)", "Üç fazlı sistem", "Uzaktan üretim izleme", "25 yıl panel performans garantisi"]
    },
    {
      id: "villa", icon: "🏘️", tag: "Konut", group: "ongrid", kwp: 15,
      name: "Villa / Geniş Çatı Paketi",
      desc: "Yüksek tüketimli villa ve müstakil evler için güçlü paket.",
      features: ["Anahtar teslim kurulum", "On-grid (şebeke bağlantılı)", "Üç fazlı sistem", "Uzaktan üretim izleme", "25 yıl panel performans garantisi"]
    },
    {
      id: "ticari", icon: "🏭", tag: "Ticari", group: "ongrid", kwp: 50,
      name: "Ticari / Sanayi Paketi",
      desc: "İşletmeler için yüksek kapasiteli üretim ve tasarruf çözümü.",
      features: ["Anahtar teslim mühendislik", "On-grid (şebeke bağlantılı)", "SCADA / uzaktan izleme", "Mahsuplaşma danışmanlığı", "Bakım (O&M) opsiyonu"]
    },
    {
      id: "hibrit-batarya", icon: "🔋", tag: "Depolama", group: "ongrid", kwp: 10, battery: 10,
      name: "Hibrit + Batarya Paketi",
      desc: "Elektrik kesintilerinde bile enerji: bataryalı hibrit çözüm.",
      features: ["Hibrit inverter + batarya", "Kesintide kesintisiz enerji", "Öz tüketimi maksimize eder", "Uzaktan izleme", "25 yıl panel performans garantisi"]
    },

    // —— Taşınabilir & Off-Grid (jel akülü) paketler —— açık perakende fiyatı
    {
      id: "offgrid-1kw", icon: "🎒", tag: "Taşınabilir", group: "offgrid", kwp: 1, portable: true, price: 66129,
      name: "1 kW Taşınabilir Off-Grid Paket",
      desc: "Bağ evi, karavan ve kamp için kompakt taşınabilir kit.",
      features: ["Jel akü dahil", "Taşınabilir / mobil kullanım", "Off-grid (şebekesiz) çalışma", "Hazır kurulum kiti"]
    },
    {
      id: "offgrid-3kw", icon: "🛖", tag: "Taşınabilir", group: "offgrid", kwp: 3, portable: true, price: 145934,
      name: "3 kW Off-Grid Paket",
      desc: "Bağ evi ve küçük müstakil yapılar için jel akülü sistem.",
      features: ["Jel akü dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "Hazır kurulum kiti"]
    },
    {
      id: "offgrid-4kw", icon: "🏕️", tag: "Taşınabilir", group: "offgrid", kwp: 4.2, portable: true, price: 185105,
      name: "4.2 kW Off-Grid Paket",
      desc: "Tam günlük temel tüketim için güçlü off-grid kit.",
      features: ["Jel akü dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },
    {
      id: "offgrid-6kw", icon: "🏚️", tag: "Off-Grid", group: "offgrid", kwp: 6.2, price: 269637,
      name: "6.2 kW Off-Grid Paket",
      desc: "Müstakil ev ihtiyaçları için yüksek kapasiteli sistem.",
      features: ["Jel akü dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },
    {
      id: "offgrid-8kw", icon: "🔌", tag: "Off-Grid", group: "offgrid", kwp: 8, price: 538543,
      name: "8 kW Off-Grid Paket",
      desc: "Yoğun tüketim ve kesintisiz enerji için tam donanım.",
      features: ["Jel akü dahil", "Hibrit inverter dahil", "Off-grid (şebekesiz) çalışma", "25 yıl panel performans garantisi"]
    },

    // —— Tarımsal sulama paketleri —— (off-grid PV; fiyat formülden türetilir)
    {
      id: "sulama-bahce", icon: "🪴", tag: "Tarım", group: "irrigation", kwp: 3, pumpKw: 2.2,
      name: "Bağ-Bahçe Sulama Paketi",
      desc: "Küçük bağ-bahçe ve damla sulama için kompakt güneş sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-tarla", icon: "🌾", tag: "Tarım", group: "irrigation", kwp: 7.5, pumpKw: 5.5,
      name: "Tarla Sulama Paketi",
      desc: "Orta ölçekli tarlalar için dalgıç pompalı güneş enerjisi sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-sera", icon: "🏡", tag: "Tarım", group: "irrigation", kwp: 11, pumpKw: 7.5,
      name: "Sera Sulama Paketi",
      desc: "Sera ve büyük bahçe sulaması için yüksek debili sistem.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    },
    {
      id: "sulama-genis", icon: "🚜", tag: "Tarım", group: "irrigation", kwp: 20, pumpKw: 15,
      name: "Geniş Tarla Sulama Paketi",
      desc: "Geniş araziler için mazotsuz, şebekeden bağımsız sulama sistemi.",
      features: ["Dalgıç/yüzey pompasına uygun", "Off-grid (şebekesiz) çalışma", "Pompa sürücüsü dahil", "Sezonluk boyutlandırma"]
    }
  ],

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
