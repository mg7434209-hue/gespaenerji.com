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
    web: "https://gespaenerji.com",
    hours: "Hafta içi 09:00 – 18:00"
  },

  // Kullanılan markalar
  brands: {
    panel: ["Arçelik", "Lexron", "Bakırlar"],
    inverter: ["Tescom", "Mexxsun", "Lexron", "Arçelik"]
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
    irrigation: { defaultPumpKw: 7.5, defaultHours: 8, defaultMonths: 5 }
  }
};
