/* ============================================================
   GESPA Enerji — Çok dilli destek (TR varsayılan · DE · RU)
   Metinler TR kaynağına göre çevrilir; eşleşmeyen string TR kalır.
   Yeni çeviri eklemek için yalnızca DICT/PH/UNITS'e satır ekleyin.
   ============================================================ */
(function () {
  "use strict";
  window.GESPA = window.GESPA || {};
  var LS = "gespa-lang";

  // Birim kelimeleri (hesaplayıcı sonuçları için)
  var UNITS = {
    tr: { yil: "yıl", yilPlus: "25+ yıl", ay: "ay", adet: "adet", agac: "ağaç", ton: "ton", km: "km", year: "yıl", added: "Eklenmedi" },
    en: { yil: "yrs", yilPlus: "25+ yrs", ay: "mo", adet: "pcs", agac: "trees", ton: "t", km: "km", year: "yr", added: "Not added" },
    de: { yil: "Jahre", yilPlus: "25+ Jahre", ay: "Monat", adet: "Stk.", agac: "Bäume", ton: "t", km: "km", year: "Jahr", added: "Nicht hinzugefügt" },
    ru: { yil: "лет", yilPlus: "25+ лет", ay: "мес", adet: "шт.", agac: "деревьев", ton: "т", km: "км", year: "год", added: "Не добавлено" }
  };

  // Zengin (iç HTML) çeviriler — yalnızca [data-i18n-html] elemanları
  var HTMLMAP = {
    "#heroTitle": {
      tr: 'Güneşten <span class="hl">kazanca</span> dönüşen enerji.',
      en: 'Energy that turns sunshine into <span class="hl">profit</span>.',
      de: 'Energie, die aus Sonne <span class="hl">Gewinn</span> macht.',
      ru: 'Энергия солнца, превращённая в <span class="hl">прибыль</span>.'
    }
  };

  // Input placeholder çevirileri
  var PH = {
    en: {
      "Adınız Soyadınız": "Your full name", "05xx xxx xx xx": "05xx xxx xx xx",
      "ornek@mail.com": "example@mail.com", "İl": "City",
      "Aylık elektrik tüketiminiz, lokasyon vb.": "Monthly consumption, location, etc.",
      "E-posta adresiniz": "Your e-mail address"
    },
    de: {
      "Adınız Soyadınız": "Vor- und Nachname", "05xx xxx xx xx": "05xx xxx xx xx",
      "ornek@mail.com": "beispiel@mail.com", "İl": "Stadt",
      "Aylık elektrik tüketiminiz, lokasyon vb.": "Monatlicher Stromverbrauch, Standort usw.",
      "E-posta adresiniz": "Ihre E-Mail-Adresse"
    },
    ru: {
      "Adınız Soyadınız": "Имя и фамилия", "05xx xxx xx xx": "05xx xxx xx xx",
      "ornek@mail.com": "primer@mail.com", "İl": "Город",
      "Aylık elektrik tüketiminiz, lokasyon vb.": "Месячное потребление, локация и т.д.",
      "E-posta adresiniz": "Ваш e-mail"
    }
  };

  var DICT = {
    en: {
      "Çalıştığımız ekipman markaları:": "Equipment brands we work with:", "Ücretsiz Tasarruf Hesaplayıcı": "Free Savings Calculator", "Fatura endişenizi birlikte çözelim": "Let's solve your bill worries together", "Yatırımı kolaylaştırıyoruz": "We make investing easy", "Peşin ödemeden güneşe geçin": "Go solar without upfront payment", "Finansman & Leasing": "Financing & Leasing", "Neden GESPA?": "Why GESPA?", "Sahadan referanslar": "Field references", "Ücretsiz Keşif İste": "Request a Free Survey", "Tasarrufumu Hesapla →": "Calculate My Savings →",
      "Mühendislik Araçları": "Engineering Tools", "GES Alet Çantası": "Solar Toolbox",
      "Ön tasarım ve saha için pratik hesap araçları. Sonuçlar tahminidir; kesin değer projelendirmeyle belirlenir.": "Practical calculators for pre-design and field work. Results are estimates; exact values are set during engineering.",
      "🔲 Panel Yerleşim": "🔲 Panel Layout", "🔌 İnverter": "🔌 Inverter", "🔻 Kablo / Gerilim Düşümü": "🔻 Cable / Voltage Drop", "🔋 Batarya": "🔋 Battery", "📐 Sıra Aralığı": "📐 Row Spacing",
      "Panel Yerleşim Planlayıcı": "Panel Layout Planner", "İnverter Boyutlandırma": "Inverter Sizing", "DC Kablo Kesiti / Gerilim Düşümü": "DC Cable Size / Voltage Drop", "Batarya / Depolama Boyutlandırma": "Battery / Storage Sizing", "Sıra Aralığı / Gölgelenme": "Row Spacing / Shading",
      "Çatı genişliği (m)": "Roof width (m)", "Çatı derinliği (m)": "Roof depth (m)", "Panel yönü": "Panel orientation", "Dikey (portrait)": "Portrait", "Yatay (landscape)": "Landscape", "Paneller arası boşluk (m)": "Gap between panels (m)",
      "Sistem gücü (kWp)": "System size (kWp)", "Hedef DC/AC oranı": "Target DC/AC ratio", "Akım (A)": "Current (A)", "Gerilim (V)": "Voltage (V)", "Kablo uzunluğu — tek yön (m)": "Cable length — one way (m)",
      "Günlük tüketim (kWh)": "Daily consumption (kWh)", "Özerklik süresi (gün)": "Autonomy (days)", "Deşarj derinliği — DoD (%)": "Depth of discharge — DoD (%)", "Panel eğimi (°)": "Panel tilt (°)", "Enlem (°)": "Latitude (°)", "Modül boyu — eğim yönünde (m)": "Module length — along tilt (m)",
      "Sığan panel": "Panels that fit", "Dizilim (sütun × satır)": "Layout (cols × rows)", "Toplam güç": "Total power", "Kullanılan alan": "Used area", "Çatı doluluğu": "Roof coverage", "Tahmini yıllık üretim": "Est. annual yield",
      "Önerilen inverter": "Recommended inverter", "Uygun aralık": "Suitable range", "Panel sayısı (550 W)": "Number of panels (550 W)", "Seçilen DC/AC": "Selected DC/AC", "Önerilen kesit": "Recommended section",
      "Karşılanacak enerji": "Energy to cover", "Gerekli batarya": "Required battery", "Tahmini batarya maliyeti": "Est. battery cost",
      "Öğle güneş yüksekliği (α)": "Noon sun elevation (α)", "Sıra arası boşluk": "Row gap", "Sıra periyodu (pitch)": "Row pitch", "Alan kullanım oranı (GCR)": "Ground coverage (GCR)",
      "📲 Aktif aracın sonucunu WhatsApp'tan gönder": "📲 Send the active tool's result via WhatsApp", "🖨️ Yazdır / PDF": "🖨️ Print / PDF",
      "Kenar boşluğu (m)": "Edge setback (m)", "Engel ekle (baca / çatı penceresi)": "Add obstacle (chimney / skylight)", "Engel — soldan (m)": "Obstacle — from left (m)", "Engel — üstten (m)": "Obstacle — from top (m)", "Engel genişliği (m)": "Obstacle width (m)", "Engel boyu (m)": "Obstacle height (m)",
      "Ana Sayfa": "Home", "Hizmetler": "Services", "Hesaplayıcı": "Calculator",
      "Projeler": "Projects", "Hakkımızda": "About", "İletişim": "Contact", "Teklif Al": "Get a Quote",
      "☀️ 2026 GES teşvikleri açıklandı — yatırımınız için doğru zaman!": "☀️ 2026 solar incentives announced — the right time to invest!",
      "Tasarrufunu hesapla →": "Calculate your savings →",
      "☀️ Hesaplama sonuçları tahminidir — kesin değer ücretsiz keşifle belirlenir.": "☀️ Results are estimates — exact figures are set during a free site survey.",
      "Keşif talep et →": "Request a survey →",
      "☀️ Hafta içi 09:00–18:00 · Hızlı dönüş için WhatsApp": "☀️ Mon–Fri 09:00–18:00 · Quick reply on WhatsApp",
      "WhatsApp →": "WhatsApp →",
      "Anahtar Teslim Güneş Enerjisi Santralleri": "Turnkey Solar Power Plants",
      "Çatı ve arazi tipi GES projelerinizde mühendislikten kuruluma, finansmandan bakıma kadar tüm süreci tek elden yönetiyoruz. Enerji maliyetlerinizi düşürün, karbon ayak izinizi azaltın.": "From engineering to installation, from financing to maintenance — we manage your rooftop or ground-mount solar project end to end. Cut your energy costs and your carbon footprint.",
      "Tasarrufumu Hesapla": "Calculate My Savings", "Ücretsiz Keşif": "Free Site Survey",
      "Tamamlanan Proje": "Completed Projects", "Bölgede Kurulu Güç": "Installed Capacity", "Sektör Deneyimi": "Industry Experience",
      "⚡ Anahtar teslim kurulum": "⚡ Turnkey installation", "🌱 25 yıla varan garanti": "🌱 Up to 25-year warranty",
      "Güvendikleri kurumlar:": "Trusted by:",
      "Hizmetlerimiz": "Our Services", "Projenizin her aşamasında yanınızdayız": "By your side at every stage",
      "Fizibiliteden devreye almaya, bakımdan finansmana kadar uçtan uca çözüm.": "End-to-end solutions from feasibility to commissioning, maintenance to financing.",
      "Çatı GES": "Rooftop Solar", "Arazi Tipi GES": "Ground-Mount Solar", "Enerji Depolama": "Energy Storage",
      "Tarımsal Sulama": "Solar Irrigation", "Güneş enerjili pompalarla tarla ve sera sulaması; şebekeden bağımsız, mazotsuz çözüm.": "Field and greenhouse irrigation with solar pumps — off-grid and diesel-free.",
      "Tarımsal sulama": "Solar irrigation", "Sulama pompası gücü (kW)": "Irrigation pump power (kW)", "Günlük çalışma (saat)": "Daily operation (hours)", "Sulama sezonu (ay)": "Irrigation season (months)",
      "🌾 Öne Çıkan Çözüm": "🌾 Featured Solution", "Tarımsal Sulama GES": "Solar Irrigation (PV)",
      "Mazot ve elektrik maliyetlerini sıfıra yaklaştırın. Güneş enerjili sulama pompası sistemleriyle tarlanızı/seranızı bağımsız ve sürdürülebilir şekilde sulayın — şebekeden uzak araziler için ideal.": "Bring diesel and electricity costs close to zero. Irrigate your field/greenhouse independently and sustainably with solar pump systems — ideal for off-grid land.",
      "Dalgıç ve yüzey pompalarına uygun": "Works with submersible and surface pumps", "Şebekeden bağımsız (off-grid) veya hibrit": "Off-grid or hybrid", "Sezonluk üretim profiline göre boyutlandırma": "Sized to the seasonal production profile",
      "Sulama hesaplaması yap": "Run irrigation calculation",
      "Güneş Enerjili Tarımsal Sulama": "Solar-Powered Agricultural Irrigation", "Neden güneşle sulama?": "Why solar irrigation?", "Avantajlar": "Benefits",
      "Pratik Araç": "Handy Tool", "Solar Sulama Pompası Seçimi": "Solar Irrigation Pump Selector",
      "Günlük su ihtiyacınızı ve kuyu/basma yüksekliğinizi girin; önerilen pompa gücü ve güneş paneli sistemini anında görün.": "Enter your daily water need and total head to instantly see the recommended pump power and PV system.",
      "Günlük su ihtiyacı (m³/gün)": "Daily water need (m³/day)", "Toplam basma yüksekliği (m)": "Total head (m)", "Günlük pompalama süresi (güneşli saat)": "Daily pumping time (sun hours)",
      "Sistem verimi (telden suya):": "System efficiency (wire-to-water):", "Panel / pompa oranı:": "Panel / pump ratio:",
      "Sonuçlar tahminidir; kesin seçim saha keşfiyle yapılır.": "Results are estimates; final selection is made during a site survey.",
      "Öneri": "Recommendation", "Gerekli debi": "Required flow", "Önerilen pompa gücü": "Recommended pump power", "Pompa (HP)": "Pump (HP)", "Önerilen panel gücü": "Recommended PV size",
      "Bu sistem için teklif iste": "Request a quote for this system",
      "Sıfır yakıt maliyeti": "Zero fuel cost", "Yakıt ve şebeke faturası olmadan, güneş enerjisi bedavadır.": "No fuel or grid bills — sunshine is free.",
      "Şebekeden bağımsız": "Off-grid", "Elektrik hattı çekilemeyen uzak tarlalarda bile sorunsuz çalışır.": "Works even on remote fields with no grid line.",
      "Sezona uygun üretim": "Seasonal output", "En çok sulama gereken yaz aylarında en yüksek üretim.": "Peak output in summer when irrigation is needed most.",
      "Dalgıç pompamı güneşle çalıştırabilir miyim?": "Can I run my submersible pump on solar?", "Evet. Uygun pompa sürücüsüyle dalgıç ve yüzey pompaları doğrudan güneş enerjisiyle çalıştırılabilir.": "Yes. With a suitable pump drive, submersible and surface pumps run directly on solar.",
      "Gece sulama için batarya şart mı?": "Do I need a battery for night irrigation?", "Çoğu durumda gündüz sulama yeterlidir; gerekirse batarya veya şebeke destekli hibrit kurgu eklenir.": "Daytime irrigation is usually enough; a battery or grid-hybrid setup is added if needed.",
      "Pompa gücüne göre kaç panel gerekir?": "How many panels for my pump size?", "Hesaplayıcımızdaki \"Tarımsal sulama\" sekmesinde pompa gücü, günlük çalışma ve sezon bilgisini girerek tahmini sistem gücünü görebilirsiniz.": "Use the \"Solar irrigation\" tab in our calculator: enter pump power, daily hours and season to see the estimated system size.",
      "Mühendislik & Tasarım": "Engineering & Design", "Finansman Desteği": "Financing Support", "Bakım & İzleme (O&M)": "Maintenance & Monitoring (O&M)",
      "Konut, ticari ve sanayi çatılarına özel tasarlanan, alanı verimli kullanan sistemler.": "Custom, space-efficient systems for residential, commercial and industrial roofs.",
      "Lisanslı ve lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısı.": "Feasibility, installation and grid connection for licensed and unlicensed ground plants.",
      "Batarya sistemleri ile üretilen enerjiyi depolayın, kesintide bile üretin.": "Store generated energy with battery systems — power even during outages.",
      "Tüm hizmetleri gör →": "See all services →",
      "Tasarruf Hesaplayıcı": "Savings Calculator", "Çatınız ne kadar kazandırır?": "How much can your roof earn?",
      "Faturanızı girin; sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancı saniyeler içinde görün.": "Enter your bill and see system size, annual savings, payback time and 25-year gain in seconds.",
      "Hesaplamayı Başlat": "Start Calculator",
      "Referans Projeler": "Reference Projects", "Sahadan örnekler": "Examples from the field", "Tüm projeleri gör →": "See all projects →",
      "Müşteri Yorumları": "Testimonials", "Yatırımcılarımız ne diyor?": "What our clients say",
      "\"Faturalarımız ilk yıl %40 düştü. Süreç baştan sona şeffaftı.\"": "“Our bills dropped 40% in the first year. The process was transparent throughout.”",
      "— Üretim Müdürü, Sanayi A.Ş.": "— Production Manager, Industrial Co.",
      "\"Kurulum söz verilen sürede bitti, izleme paneli çok pratik.\"": "“Installation finished on time, the monitoring panel is very handy.”",
      "— Çiftlik Sahibi, Konya": "— Farm Owner, Konya",
      "\"Finansman desteğiyle peşin ödemeden başladık. Tavsiye ederim.\"": "“We started with no upfront payment thanks to financing. Highly recommend.”",
      "— Otel İşletmecisi, Antalya": "— Hotel Operator, Antalya",
      "Güneşe geçmeye hazır mısınız?": "Ready to switch to solar?",
      "Ücretsiz keşif ve tasarruf analizi için bizimle iletişime geçin.": "Contact us for a free site survey and savings analysis.",
      "Hemen Teklif Al": "Get a Quote Now",
      "Projeniz için ücretsiz keşif": "Free survey for your project", "Size en uygun çözümü birlikte belirleyelim.": "Let's find the best solution together.",
      "Sıradaki proje sizinki olsun": "Let the next project be yours", "Çatınız veya araziniz için ücretsiz fizibilite çıkaralım.": "We'll prepare a free feasibility study for your roof or land.",
      "Net rakamlar için ücretsiz keşif": "Exact figures with a free survey", "Saha ekibimiz çatınızı/arazinizi inceleyip kesin teklifi hazırlasın.": "Our team inspects your site and prepares a firm quote.",
      "Keşif Talep Et": "Request a Survey", "Bizimle çalışmaya başlayın": "Start working with us",
      "Ücretsiz keşif ve şeffaf teklif için hemen ulaşın.": "Reach us for a free survey and a transparent quote.", "İletişime Geç": "Get in Touch",
      "Nasıl Çalışıyoruz?": "How We Work", "4 adımda anahtar teslim GES": "Turnkey solar in 4 steps",
      "Keşif & Analiz": "Survey & Analysis", "Tasarım & Teklif": "Design & Quote", "Kurulum": "Installation", "Devreye Alma & İzleme": "Commissioning & Monitoring",
      "Saha incelemesi, tüketim analizi ve güneşlenme verisi.": "Site inspection, consumption analysis and irradiation data.",
      "Üretim simülasyonu ve geri ödeme süresiyle net teklif.": "Clear quote with yield simulation and payback time.",
      "Sertifikalı ekiplerle hızlı ve güvenli montaj.": "Fast, safe installation by certified teams.",
      "Şebeke bağlantısı ve sürekli performans takibi.": "Grid connection and continuous performance monitoring.",
      "Kullandığımız Markalar": "Brands We Use", "Güvenilir ekipman": "Reliable equipment",
      "Projelerimizde tercih ettiğimiz panel ve inverter markaları.": "Panel and inverter brands we prefer in our projects.",
      "Güneş Panelleri": "Solar Panels", "İnverterler": "Inverters",
      "Sıkça Sorulan Sorular": "Frequently Asked Questions", "Merak edilenler": "Good to know",
      "Güneş Enerjisi Tasarruf Hesaplayıcı": "Solar Savings Calculator",
      "Faturanıza, tüketiminize veya çatı alanınıza göre sisteminizin gücünü, yıllık tasarrufunuzu, geri ödeme sürenizi ve 25 yıllık kazancınızı saniyeler içinde öğrenin.": "Find your system size, annual savings, payback time and 25-year gain in seconds — based on your bill, consumption or roof area.",
      "Faturaya göre": "By bill", "Tüketime göre": "By consumption", "Çatı alanına göre": "By roof area",
      "Aylık elektrik faturanız (₺)": "Monthly electricity bill (₺)", "Aylık tüketiminiz (kWh)": "Monthly consumption (kWh)",
      "Kullanılabilir çatı alanı (m²)": "Usable roof area (m²)", "Bölge (güneşlenme verimi)": "Region (irradiation)",
      "Akdeniz / GAP (çok yüksek)": "Mediterranean / GAP (very high)", "İç Anadolu / Ege (yüksek)": "Central Anatolia / Aegean (high)",
      "Marmara (orta)": "Marmara (medium)", "Karadeniz (düşük)": "Black Sea (low)",
      "Güney (ideal)": "South (ideal)", "Güneydoğu / Güneybatı": "Southeast / Southwest", "Doğu / Batı": "East / West", "Kuzey": "North",
      "Elektrik birim fiyatı (₺/kWh)": "Electricity unit price (₺/kWh)", "Çatı yönü / eğim": "Roof orientation / tilt",
      "Yıllık elektrik zammı (%)": "Annual electricity price rise (%)",
      "— anlık kullanım, kalanı şebekeye": "— self-use, rest to grid",
      "Batarya / depolama ekle (öz tüketimi artırır)": "Add battery / storage (increases self-use)",
      "Varsayımlar": "Assumptions", "Sonuçlar tahminidir; kesin değer saha keşfiyle belirlenir.": "Results are estimates; exact figures set during a site survey.",
      "Tahmini Sonuçlar": "Estimated Results", "Değerler girdilerinizle anlık olarak güncellenir.": "Values update live with your inputs.",
      "Önerilen sistem": "Recommended system", "Panel sayısı (550 W)": "Panel count (550 W)", "Gerekli çatı alanı": "Required roof area",
      "Yıllık üretim": "Annual production", "Aylık ort. üretim": "Avg. monthly production", "Geri ödeme süresi": "Payback time",
      "Yıllık tasarruf (1. yıl)": "Annual savings (year 1)", "Aylık tasarruf": "Monthly savings",
      "Tahmini yatırım": "Estimated investment", "25 yıllık kazanç": "25-year gain",
      "25 yıl net (kazanç − yatırım)": "25-year net (gain − investment)", "Yatırım getirisi (ROI)": "Return on investment (ROI)",
      "Yıllık CO₂ azaltımı": "CO₂ saved / year", "25 yıllık CO₂": "CO₂ over 25 years",
      "Ağaç eşdeğeri / yıl": "Tree equivalent / year", "Araç-km eşdeğeri (25 yıl)": "Car-km equivalent (25 yrs)", "Batarya (opsiyonel)": "Battery (optional)",
      "Bu sonuçlarla ücretsiz teklif iste": "Request a free quote with these results",
      "📲 Sonuçları WhatsApp'tan gönder": "📲 Send results via WhatsApp", "🖨️ Yazdır / PDF olarak kaydet": "🖨️ Print / save as PDF",
      "Sanayiden tarıma, otelden soğuk hava depolarına kadar farklı sektörlerde devreye aldığımız güneş enerjisi santrallerinden bir seçki.": "A selection of our solar plants across sectors — from industry and agriculture to hotels and cold stores.",
      "Tümü": "All", "Konut": "Residential", "Ticari": "Commercial", "Endüstriyel": "Industrial", "Tarımsal": "Agricultural",
      "Daha fazla referans ve detaylı proje dosyaları için": "For more references and detailed project files,",
      "bizimle iletişime geçin": "contact us",
      "Sahadan Kareler": "From the Field", "Uygulama galerisi": "Project gallery",
      "Kurulum ve mühendislik çalışmalarımızdan kareler. Büyütmek için tıklayın.": "Shots from our installation and engineering work. Click to enlarge.",
      "Kemer'de çift eğimli kiremit çatılı villaya kurulan şebeke bağlantılı konut sistemi.": "Grid-tied residential system on a gable tile roof villa in Kemer.",
      "Sera ve tarla sulaması için sera çatısına kurulan güneş enerji santrali.": "Solar plant on a greenhouse roof for greenhouse and field irrigation.",
      "Büyük çaplı sanayi tesisi çatısına kurulan on-grid güneş enerji santrali.": "Grid-tied solar plant on a large industrial facility roof.",
      "Manavgat'ta büyük çaplı fabrika çatısına kurulan 1.2 MW kapasiteli güneş enerji santrali.": "1.2 MW solar plant on a large factory roof in Manavgat.",
      "Toroslar manzaralı konumda vinç ekipmanıyla gerçekleştirilen profesyonel kurulum.": "Professional crane installation with a Taurus Mountains view.",
      "Şehir merkezinde ticari bina çatısına kurulan şebeke bağlantılı güneş sistemi.": "Grid-tied solar system on a commercial building in the city center.",
      "Alanya'da büyük sanayi tesisinin çatısını kaplayan yüksek verimli GES kurulumu.": "High-efficiency solar installation covering a large factory roof in Alanya.",
      "Depo ve üretim tesisi çatısında çift taraflı panel uygulaması.": "Bifacial panel application on a warehouse and production facility roof.",
      "Zemine bağlı arazi tipi kurulum ile tarımsal sulama pompası için güneş enerji sistemi.": "Ground-mounted solar system for an agricultural irrigation pump.",
      "Gespa Enerji Ltd. Şti., Türkiye'nin güneş potansiyelini ekonomik değere dönüştüren bir mühendislik ve EPC firmasıdır.": "Gespa Enerji Ltd. is an engineering and EPC firm turning Turkey's solar potential into economic value.",
      "Neden GESPA Enerji?": "Why GESPA Enerji?", "Mühendislik disiplini, şeffaf süreç": "Engineering discipline, transparent process",
      "Sadece kurulum yapmıyor; projelendirmeden TEDAŞ onay süreçlerine, bakım ve izlemeye kadar tam kapsamlı mühendislik hizmeti sunuyoruz. Bizim için bir proje, panel kurulduğunda değil, sisteminiz 25 yıl boyunca sorunsuz çalıştığında başarıya ulaşmış demektir.": "We don't just install — from design and grid approvals to maintenance and monitoring, we provide full engineering. For us a project succeeds not when panels are mounted, but when your system runs flawlessly for 25 years.",
      "Akredite, A-marka ekipman": "Accredited, A-brand equipment", "Şeffaf fizibilite ve geri ödeme": "Transparent feasibility & payback",
      "Performans + işçilik garantisi": "Performance + workmanship warranty", "Türkiye geneli servis ağı": "Nationwide service network",
      "25 yıla varan panel garantisi": "Up to 25-year panel warranty", "7/24 uzaktan izleme": "24/7 remote monitoring",
      "\"Temiz enerji bir tercih değil, geleceğin temel ihtiyacıdır. Biz bu geçişi karlı ve sorunsuz hale getiriyoruz.\"": "“Clean energy is not a choice but a basic need of the future. We make that transition profitable and seamless.”",
      "Garanti": "Warranty", "İzleme": "Monitoring", "Memnuniyet": "Satisfaction",
      "Değerlerimiz": "Our Values", "Çalışma ilkelerimiz": "Our principles",
      "Kalite Odaklılık": "Quality Focus", "Şeffaf İletişim": "Transparent Communication", "Sürekli İnovasyon": "Continuous Innovation", "Sürdürülebilirlik": "Sustainability",
      "A-marka ekipman ve standartlara uygun işçilikle uzun ömürlü sistemler kurarız.": "We build durable systems with A-brand equipment and standards-compliant workmanship.",
      "Fizibilite, maliyet ve geri ödeme analizini açık ve anlaşılır şekilde paylaşırız.": "We share feasibility, cost and payback clearly and understandably.",
      "Yeni panel, inverter ve depolama teknolojilerini projelerimize entegre ederiz.": "We integrate new panel, inverter and storage technologies.",
      "Temiz enerjiyle karbon ayak izini azaltır, geleceğe yatırım yaparız.": "With clean energy we cut carbon footprint and invest in the future.",
      "Kilometre Taşlarımız": "Our Milestones", "Yıllar içinde GESPA": "GESPA over the years",
      "Manavgat'ta kuruluş ve ilk güneş paneli satışı.": "Founded in Manavgat and first solar panel sale.",
      "100. bağımsız ev kurulumunun tamamlanması.": "Completed our 100th residential installation.",
      "Endüstriyel çatı projelerine geçiş.": "Expanded into industrial rooftop projects.",
      "Bölgede 15 MW kurulu güce ulaşılması.": "Reached 15 MW installed capacity in the region.",
      "500+ proje ile Antalya'nın lideri.": "Leader in Antalya with 500+ projects.",
      "GESPA Enerji": "GESPA Enerji", "Saha montaj uygulaması": "On-site installation",
      "Ücretsiz Keşif & Teklif": "Free Survey & Quote", "Bize ulaşın": "Reach us",
      "Çatınız veya araziniz için tasarruf potansiyelinizi öğrenin. Formu doldurun, mühendis ekibimiz sizi en kısa sürede arasın.": "Discover your savings potential for your roof or land. Fill the form and our team will call you shortly.",
      "WhatsApp ile yazın": "Message on WhatsApp", "Hafta içi 09:00 – 18:00": "Mon–Fri 09:00 – 18:00", "Resmi unvan:": "Legal name:",
      "Ad Soyad *": "Full Name *", "Telefon *": "Phone *", "E-posta": "E-mail", "Proje Tipi": "Project Type",
      "Diğer": "Other", "Şehir": "City", "Mesajınız": "Your Message", "Teklif İste": "Request a Quote",
      "Anahtar teslim güneş enerjisi santralleri. Mühendislik, kurulum, finansman ve bakım.": "Turnkey solar power plants. Engineering, installation, financing and maintenance.",
      "Kurumsal": "Company", "Bülten": "Newsletter", "Güneş enerjisi haberleri ve teşvikler.": "Solar news and incentives.",
      "Abone ol": "Subscribe", "Bakım (O&M)": "Maintenance (O&M)",
      "Tüm hakları saklıdır.": "All rights reserved.", "Gizlilik": "Privacy", "Çerez Politikası": "Cookie Policy",
      "Aboneliğiniz alındı, teşekkürler!": "You're subscribed, thank you!"
    },
    de: {
      "Çalıştığımız ekipman markaları:": "Von uns verbaute Marken:", "Ücretsiz Tasarruf Hesaplayıcı": "Kostenloser Ersparnisrechner", "Fatura endişenizi birlikte çözelim": "Lösen wir Ihre Stromrechnung gemeinsam", "Yatırımı kolaylaştırıyoruz": "Wir machen die Investition leicht", "Peşin ödemeden güneşe geçin": "Ohne Anzahlung auf Solar umsteigen", "Finansman & Leasing": "Finanzierung & Leasing", "Neden GESPA?": "Warum GESPA?", "Sahadan referanslar": "Referenzen aus der Praxis", "Ücretsiz Keşif İste": "Kostenlose Beratung anfordern", "Tasarrufumu Hesapla →": "Meine Ersparnis berechnen →",
      "Mühendislik Araçları": "Ingenieurwerkzeuge", "GES Alet Çantası": "Solar-Werkzeugkasten",
      "Ön tasarım ve saha için pratik hesap araçları. Sonuçlar tahminidir; kesin değer projelendirmeyle belirlenir.": "Praktische Rechner für Vorplanung und Einsatz. Ergebnisse sind Schätzungen; genaue Werte werden in der Planung festgelegt.",
      "🔲 Panel Yerleşim": "🔲 Modul-Layout", "🔌 İnverter": "🔌 Wechselrichter", "🔻 Kablo / Gerilim Düşümü": "🔻 Kabel / Spannungsabfall", "🔋 Batarya": "🔋 Batterie", "📐 Sıra Aralığı": "📐 Reihenabstand",
      "Panel Yerleşim Planlayıcı": "Modul-Layout-Planer", "İnverter Boyutlandırma": "Wechselrichter-Auslegung", "DC Kablo Kesiti / Gerilim Düşümü": "DC-Kabelquerschnitt / Spannungsabfall", "Batarya / Depolama Boyutlandırma": "Batterie- / Speicherauslegung", "Sıra Aralığı / Gölgelenme": "Reihenabstand / Verschattung",
      "Çatı genişliği (m)": "Dachbreite (m)", "Çatı derinliği (m)": "Dachtiefe (m)", "Panel yönü": "Modulausrichtung", "Dikey (portrait)": "Hochformat", "Yatay (landscape)": "Querformat", "Paneller arası boşluk (m)": "Abstand zwischen Modulen (m)",
      "Sistem gücü (kWp)": "Anlagengröße (kWp)", "Hedef DC/AC oranı": "Ziel-DC/AC-Verhältnis", "Akım (A)": "Strom (A)", "Gerilim (V)": "Spannung (V)", "Kablo uzunluğu — tek yön (m)": "Kabellänge — einfach (m)",
      "Günlük tüketim (kWh)": "Täglicher Verbrauch (kWh)", "Özerklik süresi (gün)": "Autonomie (Tage)", "Deşarj derinliği — DoD (%)": "Entladetiefe — DoD (%)", "Panel eğimi (°)": "Modulneigung (°)", "Enlem (°)": "Breitengrad (°)", "Modül boyu — eğim yönünde (m)": "Modullänge — in Neigungsrichtung (m)",
      "Sığan panel": "Passende Module", "Dizilim (sütun × satır)": "Anordnung (Spalten × Reihen)", "Toplam güç": "Gesamtleistung", "Kullanılan alan": "Genutzte Fläche", "Çatı doluluğu": "Dachbelegung", "Tahmini yıllık üretim": "Gesch. Jahresertrag",
      "Önerilen inverter": "Empfohlener Wechselrichter", "Uygun aralık": "Geeigneter Bereich", "Panel sayısı (550 W)": "Modulanzahl (550 W)", "Seçilen DC/AC": "Gewähltes DC/AC", "Önerilen kesit": "Empfohlener Querschnitt",
      "Karşılanacak enerji": "Zu deckende Energie", "Gerekli batarya": "Benötigte Batterie", "Tahmini batarya maliyeti": "Gesch. Batteriekosten",
      "Öğle güneş yüksekliği (α)": "Sonnenhöhe mittags (α)", "Sıra arası boşluk": "Reihenabstand", "Sıra periyodu (pitch)": "Reihenteilung (Pitch)", "Alan kullanım oranı (GCR)": "Flächennutzung (GCR)",
      "📲 Aktif aracın sonucunu WhatsApp'tan gönder": "📲 Ergebnis des aktiven Tools per WhatsApp senden", "🖨️ Yazdır / PDF": "🖨️ Drucken / PDF",
      "Kenar boşluğu (m)": "Randabstand (m)", "Engel ekle (baca / çatı penceresi)": "Hindernis hinzufügen (Schornstein / Dachfenster)", "Engel — soldan (m)": "Hindernis — von links (m)", "Engel — üstten (m)": "Hindernis — von oben (m)", "Engel genişliği (m)": "Hindernisbreite (m)", "Engel boyu (m)": "Hindernishöhe (m)",
      // Navigasyon
      "Ana Sayfa": "Startseite", "Hizmetler": "Leistungen", "Hesaplayıcı": "Rechner",
      "Projeler": "Projekte", "Hakkımızda": "Über uns", "İletişim": "Kontakt", "Teklif Al": "Angebot",
      // Topbar
      "☀️ 2026 GES teşvikleri açıklandı — yatırımınız için doğru zaman!": "☀️ Solarförderungen 2026 sind da — der richtige Zeitpunkt zu investieren!",
      "Tasarrufunu hesapla →": "Ersparnis berechnen →",
      "☀️ Hesaplama sonuçları tahminidir — kesin değer ücretsiz keşifle belirlenir.": "☀️ Ergebnisse sind Schätzungen — der genaue Wert wird vor Ort ermittelt.",
      "Keşif talep et →": "Vor-Ort-Termin →",
      "☀️ Hafta içi 09:00–18:00 · Hızlı dönüş için WhatsApp": "☀️ Mo–Fr 09:00–18:00 · Schnell per WhatsApp",
      "WhatsApp →": "WhatsApp →",
      // Hero
      "Anahtar Teslim Güneş Enerjisi Santralleri": "Schlüsselfertige Solarkraftwerke",
      "Çatı ve arazi tipi GES projelerinizde mühendislikten kuruluma, finansmandan bakıma kadar tüm süreci tek elden yönetiyoruz. Enerji maliyetlerinizi düşürün, karbon ayak izinizi azaltın.": "Von der Planung bis zur Installation, von der Finanzierung bis zur Wartung — wir managen Ihr Dach- oder Freiflächen-Solarprojekt aus einer Hand. Senken Sie Ihre Energiekosten und Ihren CO₂-Fußabdruck.",
      "Tasarrufumu Hesapla": "Ersparnis berechnen", "Ücretsiz Keşif": "Kostenlose Beratung",
      "Tamamlanan Proje": "Abgeschlossene Projekte", "Bölgede Kurulu Güç": "Installierte Leistung", "Sektör Deneyimi": "Branchenerfahrung",
      "⚡ Anahtar teslim kurulum": "⚡ Schlüsselfertig", "🌱 25 yıla varan garanti": "🌱 Bis zu 25 Jahre Garantie",
      "Güvendikleri kurumlar:": "Vertraut von:",
      // Hizmetler bölümü
      "Hizmetlerimiz": "Unsere Leistungen",
      "Projenizin her aşamasında yanınızdayız": "An Ihrer Seite in jeder Projektphase",
      "Fizibiliteden devreye almaya, bakımdan finansmana kadar uçtan uca çözüm.": "End-to-End-Lösung von der Machbarkeit bis zur Inbetriebnahme, von Wartung bis Finanzierung.",
      "Çatı GES": "Aufdach-Solar", "Arazi Tipi GES": "Freiflächen-Solar", "Enerji Depolama": "Energiespeicher",
      "Tarımsal Sulama": "Solar-Bewässerung", "Güneş enerjili pompalarla tarla ve sera sulaması; şebekeden bağımsız, mazotsuz çözüm.": "Feld- und Gewächshausbewässerung mit Solarpumpen — netzunabhängig und ohne Diesel.",
      "Tarımsal sulama": "Landw. Bewässerung", "Sulama pompası gücü (kW)": "Pumpenleistung (kW)", "Günlük çalışma (saat)": "Betrieb/Tag (Std.)", "Sulama sezonu (ay)": "Bewässerungssaison (Monate)",
      "🌾 Öne Çıkan Çözüm": "🌾 Hervorgehobene Lösung", "Tarımsal Sulama GES": "Solar-Bewässerung (GES)",
      "Mazot ve elektrik maliyetlerini sıfıra yaklaştırın. Güneş enerjili sulama pompası sistemleriyle tarlanızı/seranızı bağımsız ve sürdürülebilir şekilde sulayın — şebekeden uzak araziler için ideal.": "Senken Sie Diesel- und Stromkosten gegen null. Bewässern Sie Feld/Gewächshaus mit solaren Pumpensystemen — ideal für netzferne Flächen.",
      "Dalgıç ve yüzey pompalarına uygun": "Für Tauch- und Oberflächenpumpen", "Şebekeden bağımsız (off-grid) veya hibrit": "Netzunabhängig (Off-Grid) oder hybrid", "Sezonluk üretim profiline göre boyutlandırma": "Auslegung nach saisonalem Ertragsprofil",
      "Sulama hesaplaması yap": "Bewässerung berechnen",
      "Güneş Enerjili Tarımsal Sulama": "Solarbetriebene Bewässerung", "Neden güneşle sulama?": "Warum solare Bewässerung?", "Avantajlar": "Vorteile",
      "Pratik Araç": "Praktisches Tool", "Solar Sulama Pompası Seçimi": "Solar-Bewässerungspumpen-Auswahl",
      "Günlük su ihtiyacınızı ve kuyu/basma yüksekliğinizi girin; önerilen pompa gücü ve güneş paneli sistemini anında görün.": "Geben Sie Tageswasserbedarf und Förderhöhe ein und sehen Sie sofort die empfohlene Pumpenleistung und PV-Anlage.",
      "Günlük su ihtiyacı (m³/gün)": "Täglicher Wasserbedarf (m³/Tag)", "Toplam basma yüksekliği (m)": "Gesamtförderhöhe (m)", "Günlük pompalama süresi (güneşli saat)": "Tägliche Pumpzeit (Sonnenstunden)",
      "Sistem verimi (telden suya):": "Systemwirkungsgrad (Strom-zu-Wasser):", "Panel / pompa oranı:": "Panel-/Pumpen-Verhältnis:",
      "Sonuçlar tahminidir; kesin seçim saha keşfiyle yapılır.": "Ergebnisse sind Schätzungen; die endgültige Auswahl erfolgt vor Ort.",
      "Öneri": "Empfehlung", "Gerekli debi": "Erforderlicher Durchfluss", "Önerilen pompa gücü": "Empfohlene Pumpenleistung", "Pompa (HP)": "Pumpe (PS)", "Önerilen panel gücü": "Empfohlene PV-Größe",
      "Bu sistem için teklif iste": "Angebot für dieses System anfordern",
      "Sıfır yakıt maliyeti": "Null Kraftstoffkosten", "Yakıt ve şebeke faturası olmadan, güneş enerjisi bedavadır.": "Keine Kraftstoff- oder Netzkosten — Sonne ist kostenlos.",
      "Şebekeden bağımsız": "Netzunabhängig", "Elektrik hattı çekilemeyen uzak tarlalarda bile sorunsuz çalışır.": "Funktioniert auch auf netzfernen Feldern ohne Stromleitung.",
      "Sezona uygun üretim": "Saisonale Erzeugung", "En çok sulama gereken yaz aylarında en yüksek üretim.": "Höchste Erzeugung im Sommer, wenn am meisten bewässert wird.",
      "Dalgıç pompamı güneşle çalıştırabilir miyim?": "Kann ich meine Tauchpumpe mit Solar betreiben?", "Evet. Uygun pompa sürücüsüyle dalgıç ve yüzey pompaları doğrudan güneş enerjisiyle çalıştırılabilir.": "Ja. Mit passendem Pumpenantrieb laufen Tauch- und Oberflächenpumpen direkt mit Solar.",
      "Gece sulama için batarya şart mı?": "Brauche ich eine Batterie für nächtliche Bewässerung?", "Çoğu durumda gündüz sulama yeterlidir; gerekirse batarya veya şebeke destekli hibrit kurgu eklenir.": "Tagsüber reicht es meist; bei Bedarf wird eine Batterie oder ein Netz-Hybrid ergänzt.",
      "Pompa gücüne göre kaç panel gerekir?": "Wie viele Module für meine Pumpe?", "Hesaplayıcımızdaki \"Tarımsal sulama\" sekmesinde pompa gücü, günlük çalışma ve sezon bilgisini girerek tahmini sistem gücünü görebilirsiniz.": "Nutzen Sie den Reiter „Landw. Bewässerung“ im Rechner: Pumpenleistung, Stunden/Tag und Saison eingeben.",
      "Mühendislik & Tasarım": "Engineering & Design", "Finansman Desteği": "Finanzierung", "Bakım & İzleme (O&M)": "Wartung & Monitoring (O&M)",
      "Konut, ticari ve sanayi çatılarına özel tasarlanan, alanı verimli kullanan sistemler.": "Maßgeschneiderte, flächeneffiziente Systeme für Wohn-, Gewerbe- und Industriedächer.",
      "Lisanslı ve lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısı.": "Machbarkeit, Installation und Netzanschluss für lizenzierte und lizenzfreie Freiflächenanlagen.",
      "Batarya sistemleri ile üretilen enerjiyi depolayın, kesintide bile üretin.": "Speichern Sie erzeugte Energie mit Batteriesystemen — auch bei Ausfällen.",
      "Tüm hizmetleri gör →": "Alle Leistungen →",
      // Hesaplayıcı CTA (ana sayfa)
      "Tasarruf Hesaplayıcı": "Ersparnisrechner", "Çatınız ne kadar kazandırır?": "Wie viel bringt Ihr Dach?",
      "Faturanızı girin; sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancı saniyeler içinde görün.": "Geben Sie Ihre Rechnung ein und sehen Sie in Sekunden Anlagengröße, jährliche Ersparnis, Amortisation und 25-Jahres-Gewinn.",
      "Hesaplamayı Başlat": "Rechner starten",
      // Projeler önizleme
      "Referans Projeler": "Referenzprojekte", "Sahadan örnekler": "Beispiele aus der Praxis",
      "Tüm projeleri gör →": "Alle Projekte →",
      // Yorumlar
      "Müşteri Yorumları": "Kundenstimmen", "Yatırımcılarımız ne diyor?": "Was unsere Kunden sagen",
      "\"Faturalarımız ilk yıl %40 düştü. Süreç baştan sona şeffaftı.\"": "„Unsere Rechnungen sanken im ersten Jahr um 40%. Der Prozess war durchweg transparent.“",
      "— Üretim Müdürü, Sanayi A.Ş.": "— Produktionsleiter, Industrie AG",
      "\"Kurulum söz verilen sürede bitti, izleme paneli çok pratik.\"": "„Die Installation war pünktlich fertig, das Monitoring-Panel ist sehr praktisch.“",
      "— Çiftlik Sahibi, Konya": "— Landwirt, Konya",
      "\"Finansman desteğiyle peşin ödemeden başladık. Tavsiye ederim.\"": "„Dank Finanzierung ohne Vorauszahlung gestartet. Sehr empfehlenswert.“",
      "— Otel İşletmecisi, Antalya": "— Hotelbetreiber, Antalya",
      // CTA bantları
      "Güneşe geçmeye hazır mısınız?": "Bereit für den Wechsel zur Sonne?",
      "Ücretsiz keşif ve tasarruf analizi için bizimle iletişime geçin.": "Kontaktieren Sie uns für eine kostenlose Vor-Ort- und Ersparnisanalyse.",
      "Hemen Teklif Al": "Jetzt Angebot",
      "Projeniz için ücretsiz keşif": "Kostenlose Beratung für Ihr Projekt",
      "Size en uygun çözümü birlikte belirleyelim.": "Finden wir gemeinsam die beste Lösung für Sie.",
      "Sıradaki proje sizinki olsun": "Ihr Projekt könnte das nächste sein",
      "Çatınız veya araziniz için ücretsiz fizibilite çıkaralım.": "Wir erstellen eine kostenlose Machbarkeitsstudie für Ihr Dach oder Grundstück.",
      "Net rakamlar için ücretsiz keşif": "Genaue Zahlen mit kostenloser Beratung",
      "Saha ekibimiz çatınızı/arazinizi inceleyip kesin teklifi hazırlasın.": "Unser Team prüft Dach/Grundstück und erstellt ein verbindliches Angebot.",
      "Keşif Talep Et": "Termin anfragen",
      "Bizimle çalışmaya başlayın": "Starten Sie mit uns",
      "Ücretsiz keşif ve şeffaf teklif için hemen ulaşın.": "Kontaktieren Sie uns für eine kostenlose Beratung und ein transparentes Angebot.",
      "İletişime Geç": "Kontakt aufnehmen",
      // Süreç
      "Nasıl Çalışıyoruz?": "Wie wir arbeiten", "4 adımda anahtar teslim GES": "Schlüsselfertige Solaranlage in 4 Schritten",
      "Keşif & Analiz": "Beratung & Analyse", "Tasarım & Teklif": "Design & Angebot", "Kurulum": "Installation", "Devreye Alma & İzleme": "Inbetriebnahme & Monitoring",
      "Saha incelemesi, tüketim analizi ve güneşlenme verisi.": "Vor-Ort-Begehung, Verbrauchsanalyse und Einstrahlungsdaten.",
      "Üretim simülasyonu ve geri ödeme süresiyle net teklif.": "Klares Angebot mit Ertragssimulation und Amortisationszeit.",
      "Sertifikalı ekiplerle hızlı ve güvenli montaj.": "Schnelle, sichere Montage durch zertifizierte Teams.",
      "Şebeke bağlantısı ve sürekli performans takibi.": "Netzanschluss und laufende Leistungsüberwachung.",
      // Markalar
      "Kullandığımız Markalar": "Verwendete Marken", "Güvenilir ekipman": "Zuverlässige Komponenten",
      "Projelerimizde tercih ettiğimiz panel ve inverter markaları.": "Von uns bevorzugte Panel- und Wechselrichter-Marken.",
      "Güneş Panelleri": "Solarmodule", "İnverterler": "Wechselrichter",
      // SSS
      "Sıkça Sorulan Sorular": "Häufige Fragen", "Merak edilenler": "Wissenswertes",
      // Hesaplayıcı sayfası
      "Güneş Enerjisi Tasarruf Hesaplayıcı": "Solar-Ersparnisrechner",
      "Faturanıza, tüketiminize veya çatı alanınıza göre sisteminizin gücünü, yıllık tasarrufunuzu, geri ödeme sürenizi ve 25 yıllık kazancınızı saniyeler içinde öğrenin.": "Ermitteln Sie anhand Ihrer Rechnung, Ihres Verbrauchs oder Ihrer Dachfläche in Sekunden Anlagengröße, jährliche Ersparnis, Amortisation und 25-Jahres-Gewinn.",
      "Faturaya göre": "Nach Rechnung", "Tüketime göre": "Nach Verbrauch", "Çatı alanına göre": "Nach Dachfläche",
      "Aylık elektrik faturanız (₺)": "Monatliche Stromrechnung (₺)", "Aylık tüketiminiz (kWh)": "Monatlicher Verbrauch (kWh)",
      "Kullanılabilir çatı alanı (m²)": "Nutzbare Dachfläche (m²)", "Bölge (güneşlenme verimi)": "Region (Einstrahlung)",
      "Akdeniz / GAP (çok yüksek)": "Mittelmeer / GAP (sehr hoch)", "İç Anadolu / Ege (yüksek)": "Zentralanatolien / Ägäis (hoch)",
      "Marmara (orta)": "Marmara (mittel)", "Karadeniz (düşük)": "Schwarzmeer (niedrig)",
      "Güney (ideal)": "Süden (ideal)", "Güneydoğu / Güneybatı": "Südost / Südwest", "Doğu / Batı": "Ost / West", "Kuzey": "Norden",
      "Elektrik birim fiyatı (₺/kWh)": "Strompreis (₺/kWh)", "Çatı yönü / eğim": "Dachausrichtung / Neigung",
      "Yıllık elektrik zammı (%)": "Jährliche Strompreissteigerung (%)",
      "— anlık kullanım, kalanı şebekeye": "— Eigenverbrauch, Rest ins Netz",
      "Batarya / depolama ekle (öz tüketimi artırır)": "Batterie / Speicher hinzufügen (erhöht Eigenverbrauch)",
      "Varsayımlar": "Annahmen", "Sonuçlar tahminidir; kesin değer saha keşfiyle belirlenir.": "Ergebnisse sind Schätzungen; der genaue Wert wird vor Ort ermittelt.",
      "Tahmini Sonuçlar": "Geschätzte Ergebnisse", "Değerler girdilerinizle anlık olarak güncellenir.": "Die Werte aktualisieren sich live mit Ihren Eingaben.",
      "Önerilen sistem": "Empfohlene Anlage", "Panel sayısı (550 W)": "Modulanzahl (550 W)", "Gerekli çatı alanı": "Benötigte Dachfläche",
      "Yıllık üretim": "Jahresertrag", "Aylık ort. üretim": "Ø Monatsertrag", "Geri ödeme süresi": "Amortisationszeit",
      "Yıllık tasarruf (1. yıl)": "Jährliche Ersparnis (1. Jahr)", "Aylık tasarruf": "Monatliche Ersparnis",
      "Tahmini yatırım": "Geschätzte Investition", "25 yıllık kazanç": "25-Jahres-Gewinn",
      "25 yıl net (kazanç − yatırım)": "25-Jahre netto (Gewinn − Investition)", "Yatırım getirisi (ROI)": "Kapitalrendite (ROI)",
      "Yıllık CO₂ azaltımı": "CO₂-Einsparung/Jahr", "25 yıllık CO₂": "CO₂ über 25 Jahre",
      "Ağaç eşdeğeri / yıl": "Baum-Äquivalent / Jahr", "Araç-km eşdeğeri (25 yıl)": "Auto-km-Äquivalent (25 J.)",
      "Batarya (opsiyonel)": "Batterie (optional)",
      "Bu sonuçlarla ücretsiz teklif iste": "Mit diesen Ergebnissen Angebot anfordern",
      "📲 Sonuçları WhatsApp'tan gönder": "📲 Ergebnisse per WhatsApp senden",
      "🖨️ Yazdır / PDF olarak kaydet": "🖨️ Drucken / als PDF speichern",
      // Projeler sayfası
      "Sanayiden tarıma, otelden soğuk hava depolarına kadar farklı sektörlerde devreye aldığımız güneş enerjisi santrallerinden bir seçki.": "Eine Auswahl unserer Solarkraftwerke aus verschiedensten Branchen — von Industrie und Landwirtschaft bis Hotels und Kühlhäusern.",
      "Tümü": "Alle", "Konut": "Wohngebäude", "Ticari": "Gewerbe", "Endüstriyel": "Industrie", "Tarımsal": "Landwirtschaft",
      "Daha fazla referans ve detaylı proje dosyaları için": "Für weitere Referenzen und detaillierte Projektunterlagen",
      "bizimle iletişime geçin": "kontaktieren Sie uns",
      "Sahadan Kareler": "Eindrücke vor Ort", "Uygulama galerisi": "Projektgalerie",
      "Kurulum ve mühendislik çalışmalarımızdan kareler. Büyütmek için tıklayın.": "Aufnahmen unserer Installations- und Engineering-Arbeiten. Zum Vergrößern klicken.",
      // Proje açıklamaları
      "Kemer'de çift eğimli kiremit çatılı villaya kurulan şebeke bağlantılı konut sistemi.": "Netzgekoppelte Wohnanlage auf einem Ziegel-Satteldach einer Villa in Kemer.",
      "Sera ve tarla sulaması için sera çatısına kurulan güneş enerji santrali.": "Solaranlage auf einem Gewächshausdach für Gewächshaus- und Feldbewässerung.",
      "Büyük çaplı sanayi tesisi çatısına kurulan on-grid güneş enerji santrali.": "Netzgekoppelte Solaranlage auf dem Dach einer großen Industrieanlage.",
      "Manavgat'ta büyük çaplı fabrika çatısına kurulan 1.2 MW kapasiteli güneş enerji santrali.": "1,2-MW-Solaranlage auf einem großen Fabrikdach in Manavgat.",
      "Toroslar manzaralı konumda vinç ekipmanıyla gerçekleştirilen profesyonel kurulum.": "Professionelle Kraninstallation mit Blick auf das Taurusgebirge.",
      "Şehir merkezinde ticari bina çatısına kurulan şebeke bağlantılı güneş sistemi.": "Netzgekoppelte Solaranlage auf einem Geschäftsgebäude im Stadtzentrum.",
      "Alanya'da büyük sanayi tesisinin çatısını kaplayan yüksek verimli GES kurulumu.": "Hocheffiziente Solaranlage auf dem Dach einer großen Industrieanlage in Alanya.",
      "Depo ve üretim tesisi çatısında çift taraflı panel uygulaması.": "Bifaziale Module auf dem Dach einer Lager- und Produktionsstätte.",
      "Zemine bağlı arazi tipi kurulum ile tarımsal sulama pompası için güneş enerji sistemi.": "Bodenmontiertes Solarsystem für eine landwirtschaftliche Bewässerungspumpe.",
      // Hakkımızda
      "Gespa Enerji Ltd. Şti., Türkiye'nin güneş potansiyelini ekonomik değere dönüştüren bir mühendislik ve EPC firmasıdır.": "Gespa Enerji Ltd. Şti. ist ein Engineering- und EPC-Unternehmen, das das Solarpotenzial der Türkei in wirtschaftlichen Wert verwandelt.",
      "Neden GESPA Enerji?": "Warum GESPA Enerji?", "Mühendislik disiplini, şeffaf süreç": "Ingenieurdisziplin, transparenter Prozess",
      "Sadece kurulum yapmıyor; projelendirmeden TEDAŞ onay süreçlerine, bakım ve izlemeye kadar tam kapsamlı mühendislik hizmeti sunuyoruz. Bizim için bir proje, panel kurulduğunda değil, sisteminiz 25 yıl boyunca sorunsuz çalıştığında başarıya ulaşmış demektir.": "Wir installieren nicht nur — von der Planung über die behördliche Genehmigung bis zu Wartung und Monitoring bieten wir umfassendes Engineering. Für uns ist ein Projekt nicht mit der Montage erfolgreich, sondern wenn Ihre Anlage 25 Jahre störungsfrei läuft.",
      "Akredite, A-marka ekipman": "Akkreditierte A-Marken-Komponenten", "Şeffaf fizibilite ve geri ödeme": "Transparente Machbarkeit & Amortisation",
      "Performans + işçilik garantisi": "Leistungs- + Verarbeitungsgarantie", "Türkiye geneli servis ağı": "Servicenetz türkeiweit",
      "25 yıla varan panel garantisi": "Bis zu 25 Jahre Modulgarantie", "7/24 uzaktan izleme": "24/7-Fernüberwachung",
      "\"Temiz enerji bir tercih değil, geleceğin temel ihtiyacıdır. Biz bu geçişi karlı ve sorunsuz hale getiriyoruz.\"": "„Saubere Energie ist keine Option, sondern ein Grundbedürfnis der Zukunft. Wir machen diesen Wandel profitabel und reibungslos.“",
      "Garanti": "Garantie", "İzleme": "Monitoring", "Memnuniyet": "Zufriedenheit",
      "Değerlerimiz": "Unsere Werte", "Çalışma ilkelerimiz": "Unsere Prinzipien",
      "Kalite Odaklılık": "Qualitätsfokus", "Şeffaf İletişim": "Transparente Kommunikation", "Sürekli İnovasyon": "Ständige Innovation", "Sürdürülebilirlik": "Nachhaltigkeit",
      "A-marka ekipman ve standartlara uygun işçilikle uzun ömürlü sistemler kurarız.": "Langlebige Systeme mit A-Marken-Komponenten und normgerechter Verarbeitung.",
      "Fizibilite, maliyet ve geri ödeme analizini açık ve anlaşılır şekilde paylaşırız.": "Wir teilen Machbarkeit, Kosten und Amortisation klar und verständlich.",
      "Yeni panel, inverter ve depolama teknolojilerini projelerimize entegre ederiz.": "Wir integrieren neue Modul-, Wechselrichter- und Speichertechnologien.",
      "Temiz enerjiyle karbon ayak izini azaltır, geleceğe yatırım yaparız.": "Mit sauberer Energie senken wir den CO₂-Fußabdruck und investieren in die Zukunft.",
      "Kilometre Taşlarımız": "Unsere Meilensteine", "Yıllar içinde GESPA": "GESPA im Laufe der Jahre",
      "Manavgat'ta kuruluş ve ilk güneş paneli satışı.": "Gründung in Manavgat und erster Solarmodul-Verkauf.",
      "100. bağımsız ev kurulumunun tamamlanması.": "Abschluss der 100. Eigenheim-Installation.",
      "Endüstriyel çatı projelerine geçiş.": "Einstieg in industrielle Aufdach-Projekte.",
      "Bölgede 15 MW kurulu güce ulaşılması.": "15 MW installierte Leistung in der Region erreicht.",
      "500+ proje ile Antalya'nın lideri.": "Marktführer in Antalya mit 500+ Projekten.",
      "GESPA Enerji": "GESPA Enerji", "Saha montaj uygulaması": "Montage vor Ort",
      // İletişim
      "Ücretsiz Keşif & Teklif": "Kostenlose Beratung & Angebot", "Bize ulaşın": "Kontaktieren Sie uns",
      "Çatınız veya araziniz için tasarruf potansiyelinizi öğrenin. Formu doldurun, mühendis ekibimiz sizi en kısa sürede arasın.": "Erfahren Sie Ihr Sparpotenzial für Dach oder Grundstück. Füllen Sie das Formular aus — unser Team meldet sich umgehend.",
      "WhatsApp ile yazın": "Per WhatsApp schreiben", "Hafta içi 09:00 – 18:00": "Mo–Fr 09:00 – 18:00",
      "Resmi unvan:": "Firmenname:",
      "Ad Soyad *": "Vor- und Nachname *", "Telefon *": "Telefon *", "E-posta": "E-Mail", "Proje Tipi": "Projekttyp",
      "Diğer": "Sonstige", "Şehir": "Stadt", "Mesajınız": "Ihre Nachricht", "Teklif İste": "Angebot anfordern",
      // Footer
      "Anahtar teslim güneş enerjisi santralleri. Mühendislik, kurulum, finansman ve bakım.": "Schlüsselfertige Solarkraftwerke. Engineering, Installation, Finanzierung und Wartung.",
      "Kurumsal": "Unternehmen", "Bülten": "Newsletter", "Güneş enerjisi haberleri ve teşvikler.": "Solar-News und Förderungen.",
      "Abone ol": "Abonnieren", "Bakım (O&M)": "Wartung (O&M)",
      "Tüm hakları saklıdır.": "Alle Rechte vorbehalten.", "Gizlilik": "Datenschutz", "Çerez Politikası": "Cookie-Richtlinie",
      "Aboneliğiniz alındı, teşekkürler!": "Anmeldung erhalten, danke!"
    },
    ru: {
      "Çalıştığımız ekipman markaları:": "Бренды оборудования, с которыми работаем:", "Ücretsiz Tasarruf Hesaplayıcı": "Бесплатный калькулятор экономии", "Fatura endişenizi birlikte çözelim": "Решим вашу проблему со счетами вместе", "Yatırımı kolaylaştırıyoruz": "Делаем инвестиции простыми", "Peşin ödemeden güneşe geçin": "Перейдите на солнечную энергию без предоплаты", "Finansman & Leasing": "Финансирование и лизинг", "Neden GESPA?": "Почему GESPA?", "Sahadan referanslar": "Реальные проекты", "Ücretsiz Keşif İste": "Запросить бесплатный выезд", "Tasarrufumu Hesapla →": "Рассчитать экономию →",
      "Mühendislik Araçları": "Инженерные инструменты", "GES Alet Çantası": "Набор инструментов для СЭС",
      "Ön tasarım ve saha için pratik hesap araçları. Sonuçlar tahminidir; kesin değer projelendirmeyle belirlenir.": "Практичные калькуляторы для предпроектной и полевой работы. Результаты ориентировочны; точные значения определяются при проектировании.",
      "🔲 Panel Yerleşim": "🔲 Расположение панелей", "🔌 İnverter": "🔌 Инвертор", "🔻 Kablo / Gerilim Düşümü": "🔻 Кабель / Падение напряжения", "🔋 Batarya": "🔋 Аккумулятор", "📐 Sıra Aralığı": "📐 Межрядный интервал",
      "Panel Yerleşim Planlayıcı": "Планировщик расположения панелей", "İnverter Boyutlandırma": "Подбор инвертора", "DC Kablo Kesiti / Gerilim Düşümü": "Сечение DC-кабеля / Падение напряжения", "Batarya / Depolama Boyutlandırma": "Подбор аккумулятора / накопителя", "Sıra Aralığı / Gölgelenme": "Межрядный интервал / Затенение",
      "Çatı genişliği (m)": "Ширина крыши (м)", "Çatı derinliği (m)": "Глубина крыши (м)", "Panel yönü": "Ориентация панели", "Dikey (portrait)": "Вертикально", "Yatay (landscape)": "Горизонтально", "Paneller arası boşluk (m)": "Зазор между панелями (м)",
      "Sistem gücü (kWp)": "Мощность системы (кВт)", "Hedef DC/AC oranı": "Целевое отношение DC/AC", "Akım (A)": "Ток (А)", "Gerilim (V)": "Напряжение (В)", "Kablo uzunluğu — tek yön (m)": "Длина кабеля — в одну сторону (м)",
      "Günlük tüketim (kWh)": "Суточное потребление (кВт·ч)", "Özerklik süresi (gün)": "Автономность (дни)", "Deşarj derinliği — DoD (%)": "Глубина разряда — DoD (%)", "Panel eğimi (°)": "Наклон панели (°)", "Enlem (°)": "Широта (°)", "Modül boyu — eğim yönünde (m)": "Длина модуля — вдоль наклона (м)",
      "Sığan panel": "Помещается панелей", "Dizilim (sütun × satır)": "Сетка (столбцы × ряды)", "Toplam güç": "Суммарная мощность", "Kullanılan alan": "Используемая площадь", "Çatı doluluğu": "Заполнение крыши", "Tahmini yıllık üretim": "Оценка годовой выработки",
      "Önerilen inverter": "Рекомендуемый инвертор", "Uygun aralık": "Подходящий диапазон", "Panel sayısı (550 W)": "Число панелей (550 Вт)", "Seçilen DC/AC": "Выбранное DC/AC", "Önerilen kesit": "Рекомендуемое сечение",
      "Karşılanacak enerji": "Покрываемая энергия", "Gerekli batarya": "Требуемый аккумулятор", "Tahmini batarya maliyeti": "Оценка стоимости аккумулятора",
      "Öğle güneş yüksekliği (α)": "Высота солнца в полдень (α)", "Sıra arası boşluk": "Зазор между рядами", "Sıra periyodu (pitch)": "Шаг ряда (pitch)", "Alan kullanım oranı (GCR)": "Коэффициент покрытия (GCR)",
      "📲 Aktif aracın sonucunu WhatsApp'tan gönder": "📲 Отправить результат активного инструмента в WhatsApp", "🖨️ Yazdır / PDF": "🖨️ Печать / PDF",
      "Kenar boşluğu (m)": "Отступ от края (м)", "Engel ekle (baca / çatı penceresi)": "Добавить препятствие (дымоход / окно)", "Engel — soldan (m)": "Препятствие — слева (м)", "Engel — üstten (m)": "Препятствие — сверху (м)", "Engel genişliği (m)": "Ширина препятствия (м)", "Engel boyu (m)": "Высота препятствия (м)",
      "Ana Sayfa": "Главная", "Hizmetler": "Услуги", "Hesaplayıcı": "Калькулятор",
      "Projeler": "Проекты", "Hakkımızda": "О нас", "İletişim": "Контакты", "Teklif Al": "Заявка",
      "☀️ 2026 GES teşvikleri açıklandı — yatırımınız için doğru zaman!": "☀️ Льготы на солнечную энергию 2026 объявлены — самое время инвестировать!",
      "Tasarrufunu hesapla →": "Рассчитать экономию →",
      "☀️ Hesaplama sonuçları tahminidir — kesin değer ücretsiz keşifle belirlenir.": "☀️ Результаты ориентировочны — точное значение определяется при выезде.",
      "Keşif talep et →": "Запросить выезд →",
      "☀️ Hafta içi 09:00–18:00 · Hızlı dönüş için WhatsApp": "☀️ Пн–Пт 09:00–18:00 · Быстро через WhatsApp",
      "WhatsApp →": "WhatsApp →",
      "Anahtar Teslim Güneş Enerjisi Santralleri": "Солнечные электростанции под ключ",
      "Çatı ve arazi tipi GES projelerinizde mühendislikten kuruluma, finansmandan bakıma kadar tüm süreci tek elden yönetiyoruz. Enerji maliyetlerinizi düşürün, karbon ayak izinizi azaltın.": "От проектирования до монтажа, от финансирования до обслуживания — мы ведём ваш проект на крыше или участке под ключ. Снизьте затраты на энергию и углеродный след.",
      "Tasarrufumu Hesapla": "Рассчитать экономию", "Ücretsiz Keşif": "Бесплатный выезд",
      "Tamamlanan Proje": "Завершённых проектов", "Bölgede Kurulu Güç": "Установленная мощность", "Sektör Deneyimi": "Опыт в отрасли",
      "⚡ Anahtar teslim kurulum": "⚡ Монтаж под ключ", "🌱 25 yıla varan garanti": "🌱 Гарантия до 25 лет",
      "Güvendikleri kurumlar:": "Нам доверяют:",
      "Hizmetlerimiz": "Наши услуги",
      "Projenizin her aşamasında yanınızdayız": "Рядом на каждом этапе проекта",
      "Fizibiliteden devreye almaya, bakımdan finansmana kadar uçtan uca çözüm.": "Комплексное решение: от ТЭО до ввода в эксплуатацию, от обслуживания до финансирования.",
      "Çatı GES": "Солнечные на крыше", "Arazi Tipi GES": "Наземные станции", "Enerji Depolama": "Накопители энергии",
      "Tarımsal Sulama": "Солнечный полив", "Güneş enerjili pompalarla tarla ve sera sulaması; şebekeden bağımsız, mazotsuz çözüm.": "Полив полей и теплиц солнечными насосами — без сети и дизеля.",
      "Tarımsal sulama": "Аграрный полив", "Sulama pompası gücü (kW)": "Мощность насоса (кВт)", "Günlük çalışma (saat)": "Работа в день (ч)", "Sulama sezonu (ay)": "Сезон полива (мес.)",
      "🌾 Öne Çıkan Çözüm": "🌾 Ключевое решение", "Tarımsal Sulama GES": "Солнечный полив (GES)",
      "Mazot ve elektrik maliyetlerini sıfıra yaklaştırın. Güneş enerjili sulama pompası sistemleriyle tarlanızı/seranızı bağımsız ve sürdürülebilir şekilde sulayın — şebekeden uzak araziler için ideal.": "Сократите расходы на дизель и электричество почти до нуля. Поливайте поле/теплицу солнечными насосами — идеально для участков без сети.",
      "Dalgıç ve yüzey pompalarına uygun": "Для погружных и поверхностных насосов", "Şebekeden bağımsız (off-grid) veya hibrit": "Автономно (off-grid) или гибрид", "Sezonluk üretim profiline göre boyutlandırma": "Расчёт по сезонному профилю выработки",
      "Sulama hesaplaması yap": "Рассчитать полив",
      "Güneş Enerjili Tarımsal Sulama": "Солнечный аграрный полив", "Neden güneşle sulama?": "Почему солнечный полив?", "Avantajlar": "Преимущества",
      "Pratik Araç": "Удобный инструмент", "Solar Sulama Pompası Seçimi": "Подбор солнечного насоса для полива",
      "Günlük su ihtiyacınızı ve kuyu/basma yüksekliğinizi girin; önerilen pompa gücü ve güneş paneli sistemini anında görün.": "Введите суточную потребность в воде и напор — мгновенно увидите мощность насоса и солнечную систему.",
      "Günlük su ihtiyacı (m³/gün)": "Суточная потребность в воде (м³/сут)", "Toplam basma yüksekliği (m)": "Полный напор (м)", "Günlük pompalama süresi (güneşli saat)": "Время работы насоса (солн. часы)",
      "Sistem verimi (telden suya):": "КПД системы (провод-вода):", "Panel / pompa oranı:": "Соотношение панели/насос:",
      "Sonuçlar tahminidir; kesin seçim saha keşfiyle yapılır.": "Результаты ориентировочны; окончательный выбор — при выезде.",
      "Öneri": "Рекомендация", "Gerekli debi": "Требуемый расход", "Önerilen pompa gücü": "Рекомендуемая мощность насоса", "Pompa (HP)": "Насос (л.с.)", "Önerilen panel gücü": "Рекомендуемая мощность ФЭ",
      "Bu sistem için teklif iste": "Запросить КП на эту систему",
      "Sıfır yakıt maliyeti": "Ноль затрат на топливо", "Yakıt ve şebeke faturası olmadan, güneş enerjisi bedavadır.": "Без счетов за топливо и сеть — солнце бесплатно.",
      "Şebekeden bağımsız": "Автономность", "Elektrik hattı çekilemeyen uzak tarlalarda bile sorunsuz çalışır.": "Работает даже на удалённых полях без линии электропередачи.",
      "Sezona uygun üretim": "Сезонная выработка", "En çok sulama gereken yaz aylarında en yüksek üretim.": "Максимальная выработка летом, когда полив нужнее всего.",
      "Dalgıç pompamı güneşle çalıştırabilir miyim?": "Можно ли запитать погружной насос от солнца?", "Evet. Uygun pompa sürücüsüyle dalgıç ve yüzey pompaları doğrudan güneş enerjisiyle çalıştırılabilir.": "Да. С подходящим приводом погружные и поверхностные насосы работают напрямую от солнца.",
      "Gece sulama için batarya şart mı?": "Нужна ли батарея для ночного полива?", "Çoğu durumda gündüz sulama yeterlidir; gerekirse batarya veya şebeke destekli hibrit kurgu eklenir.": "Обычно достаточно дневного полива; при необходимости добавляется батарея или гибрид с сетью.",
      "Pompa gücüne göre kaç panel gerekir?": "Сколько панелей нужно для насоса?", "Hesaplayıcımızdaki \"Tarımsal sulama\" sekmesinde pompa gücü, günlük çalışma ve sezon bilgisini girerek tahmini sistem gücünü görebilirsiniz.": "Откройте вкладку «Аграрный полив» в калькуляторе: введите мощность насоса, часы/день и сезон.",
      "Mühendislik & Tasarım": "Инжиниринг и проект", "Finansman Desteği": "Финансирование", "Bakım & İzleme (O&M)": "Обслуживание и мониторинг (O&M)",
      "Konut, ticari ve sanayi çatılarına özel tasarlanan, alanı verimli kullanan sistemler.": "Индивидуальные энергоэффективные системы для жилых, коммерческих и промышленных крыш.",
      "Lisanslı ve lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısı.": "ТЭО, монтаж и подключение к сети для лицензируемых и безлицензионных станций.",
      "Batarya sistemleri ile üretilen enerjiyi depolayın, kesintide bile üretin.": "Храните выработанную энергию в аккумуляторах — энергия даже при отключениях.",
      "Tüm hizmetleri gör →": "Все услуги →",
      "Tasarruf Hesaplayıcı": "Калькулятор экономии", "Çatınız ne kadar kazandırır?": "Сколько принесёт ваша крыша?",
      "Faturanızı girin; sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancı saniyeler içinde görün.": "Введите счёт и за секунды узнайте мощность, годовую экономию, срок окупаемости и доход за 25 лет.",
      "Hesaplamayı Başlat": "Открыть калькулятор",
      "Referans Projeler": "Референс-проекты", "Sahadan örnekler": "Примеры с объектов",
      "Tüm projeleri gör →": "Все проекты →",
      "Müşteri Yorumları": "Отзывы клиентов", "Yatırımcılarımız ne diyor?": "Что говорят клиенты",
      "\"Faturalarımız ilk yıl %40 düştü. Süreç baştan sona şeffaftı.\"": "«Счета упали на 40% в первый год. Процесс был прозрачным от начала до конца.»",
      "— Üretim Müdürü, Sanayi A.Ş.": "— Директор производства, Промышленная компания",
      "\"Kurulum söz verilen sürede bitti, izleme paneli çok pratik.\"": "«Монтаж завершён в срок, панель мониторинга очень удобна.»",
      "— Çiftlik Sahibi, Konya": "— Фермер, Конья",
      "\"Finansman desteğiyle peşin ödemeden başladık. Tavsiye ederim.\"": "«Начали без предоплаты благодаря финансированию. Рекомендую.»",
      "— Otel İşletmecisi, Antalya": "— Владелец отеля, Анталья",
      "Güneşe geçmeye hazır mısınız?": "Готовы перейти на солнце?",
      "Ücretsiz keşif ve tasarruf analizi için bizimle iletişime geçin.": "Свяжитесь с нами для бесплатного выезда и анализа экономии.",
      "Hemen Teklif Al": "Получить заявку",
      "Projeniz için ücretsiz keşif": "Бесплатный выезд для вашего проекта",
      "Size en uygun çözümü birlikte belirleyelim.": "Вместе подберём оптимальное решение.",
      "Sıradaki proje sizinki olsun": "Пусть следующий проект будет вашим",
      "Çatınız veya araziniz için ücretsiz fizibilite çıkaralım.": "Сделаем бесплатное ТЭО для вашей крыши или участка.",
      "Net rakamlar için ücretsiz keşif": "Точные цифры — бесплатный выезд",
      "Saha ekibimiz çatınızı/arazinizi inceleyip kesin teklifi hazırlasın.": "Наша команда осмотрит объект и подготовит точное предложение.",
      "Keşif Talep Et": "Запросить выезд",
      "Bizimle çalışmaya başlayın": "Начните работать с нами",
      "Ücretsiz keşif ve şeffaf teklif için hemen ulaşın.": "Свяжитесь для бесплатного выезда и прозрачного предложения.",
      "İletişime Geç": "Связаться",
      "Nasıl Çalışıyoruz?": "Как мы работаем", "4 adımda anahtar teslim GES": "Станция под ключ за 4 шага",
      "Keşif & Analiz": "Выезд и анализ", "Tasarım & Teklif": "Проект и КП", "Kurulum": "Монтаж", "Devreye Alma & İzleme": "Ввод и мониторинг",
      "Saha incelemesi, tüketim analizi ve güneşlenme verisi.": "Осмотр объекта, анализ потребления и данные инсоляции.",
      "Üretim simülasyonu ve geri ödeme süresiyle net teklif.": "Чёткое КП с симуляцией выработки и сроком окупаемости.",
      "Sertifikalı ekiplerle hızlı ve güvenli montaj.": "Быстрый и безопасный монтаж сертифицированными бригадами.",
      "Şebeke bağlantısı ve sürekli performans takibi.": "Подключение к сети и постоянный контроль производительности.",
      "Kullandığımız Markalar": "Используемые бренды", "Güvenilir ekipman": "Надёжное оборудование",
      "Projelerimizde tercih ettiğimiz panel ve inverter markaları.": "Бренды панелей и инверторов, которые мы используем.",
      "Güneş Panelleri": "Солнечные панели", "İnverterler": "Инверторы",
      "Sıkça Sorulan Sorular": "Частые вопросы", "Merak edilenler": "Полезно знать",
      "Güneş Enerjisi Tasarruf Hesaplayıcı": "Калькулятор экономии на солнце",
      "Faturanıza, tüketiminize veya çatı alanınıza göre sisteminizin gücünü, yıllık tasarrufunuzu, geri ödeme sürenizi ve 25 yıllık kazancınızı saniyeler içinde öğrenin.": "По счёту, потреблению или площади крыши за секунды узнайте мощность, годовую экономию, окупаемость и доход за 25 лет.",
      "Faturaya göre": "По счёту", "Tüketime göre": "По потреблению", "Çatı alanına göre": "По площади крыши",
      "Aylık elektrik faturanız (₺)": "Месячный счёт за свет (₺)", "Aylık tüketiminiz (kWh)": "Месячное потребление (кВт·ч)",
      "Kullanılabilir çatı alanı (m²)": "Полезная площадь крыши (м²)", "Bölge (güneşlenme verimi)": "Регион (инсоляция)",
      "Akdeniz / GAP (çok yüksek)": "Средиземноморье / ЮВА (очень высокая)", "İç Anadolu / Ege (yüksek)": "Центр. Анатолия / Эгейское (высокая)",
      "Marmara (orta)": "Мармара (средняя)", "Karadeniz (düşük)": "Чёрное море (низкая)",
      "Güney (ideal)": "Юг (идеально)", "Güneydoğu / Güneybatı": "Юго-восток / Юго-запад", "Doğu / Batı": "Восток / Запад", "Kuzey": "Север",
      "Elektrik birim fiyatı (₺/kWh)": "Цена э/э (₺/кВт·ч)", "Çatı yönü / eğim": "Ориентация / наклон крыши",
      "Yıllık elektrik zammı (%)": "Годовой рост цен (%)",
      "— anlık kullanım, kalanı şebekeye": "— самопотребление, остаток в сеть",
      "Batarya / depolama ekle (öz tüketimi artırır)": "Добавить аккумулятор (повышает самопотребление)",
      "Varsayımlar": "Допущения", "Sonuçlar tahminidir; kesin değer saha keşfiyle belirlenir.": "Результаты ориентировочны; точное значение — при выезде.",
      "Tahmini Sonuçlar": "Ориентировочные результаты", "Değerler girdilerinizle anlık olarak güncellenir.": "Значения обновляются мгновенно при вводе.",
      "Önerilen sistem": "Рекомендуемая мощность", "Panel sayısı (550 W)": "Кол-во панелей (550 Вт)", "Gerekli çatı alanı": "Нужная площадь крыши",
      "Yıllık üretim": "Годовая выработка", "Aylık ort. üretim": "Ср. выработка/мес", "Geri ödeme süresi": "Срок окупаемости",
      "Yıllık tasarruf (1. yıl)": "Экономия (1-й год)", "Aylık tasarruf": "Экономия/мес",
      "Tahmini yatırım": "Ориент. инвестиция", "25 yıllık kazanç": "Доход за 25 лет",
      "25 yıl net (kazanç − yatırım)": "Нетто за 25 лет (доход − инвестиция)", "Yatırım getirisi (ROI)": "Рентабельность (ROI)",
      "Yıllık CO₂ azaltımı": "Сокращение CO₂/год", "25 yıllık CO₂": "CO₂ за 25 лет",
      "Ağaç eşdeğeri / yıl": "Эквивалент деревьев/год", "Araç-km eşdeğeri (25 yıl)": "Эквивалент авто-км (25 л.)",
      "Batarya (opsiyonel)": "Аккумулятор (опц.)",
      "Bu sonuçlarla ücretsiz teklif iste": "Запросить КП по этим результатам",
      "📲 Sonuçları WhatsApp'tan gönder": "📲 Отправить результаты в WhatsApp",
      "🖨️ Yazdır / PDF olarak kaydet": "🖨️ Печать / сохранить в PDF",
      "Sanayiden tarıma, otelden soğuk hava depolarına kadar farklı sektörlerde devreye aldığımız güneş enerjisi santrallerinden bir seçki.": "Подборка наших солнечных станций в разных отраслях — от промышленности и сельского хозяйства до отелей и холодильных складов.",
      "Tümü": "Все", "Konut": "Жильё", "Ticari": "Коммерция", "Endüstriyel": "Промышленность", "Tarımsal": "Сельское хоз-во",
      "Daha fazla referans ve detaylı proje dosyaları için": "Для других референсов и подробных материалов",
      "bizimle iletişime geçin": "свяжитесь с нами",
      "Sahadan Kareler": "Кадры с объектов", "Uygulama galerisi": "Галерея работ",
      "Kurulum ve mühendislik çalışmalarımızdan kareler. Büyütmek için tıklayın.": "Снимки наших монтажных и инженерных работ. Нажмите, чтобы увеличить.",
      "Kemer'de çift eğimli kiremit çatılı villaya kurulan şebeke bağlantılı konut sistemi.": "Сетевая система на двускатной черепичной крыше виллы в Кемере.",
      "Sera ve tarla sulaması için sera çatısına kurulan güneş enerji santrali.": "Солнечная станция на крыше теплицы для полива теплиц и полей.",
      "Büyük çaplı sanayi tesisi çatısına kurulan on-grid güneş enerji santrali.": "Сетевая солнечная станция на крыше крупного промышленного объекта.",
      "Manavgat'ta büyük çaplı fabrika çatısına kurulan 1.2 MW kapasiteli güneş enerji santrali.": "Станция мощностью 1,2 МВт на крыше крупной фабрики в Манавгате.",
      "Toroslar manzaralı konumda vinç ekipmanıyla gerçekleştirilen profesyonel kurulum.": "Профессиональный монтаж краном с видом на горы Тавр.",
      "Şehir merkezinde ticari bina çatısına kurulan şebeke bağlantılı güneş sistemi.": "Сетевая солнечная система на крыше коммерческого здания в центре города.",
      "Alanya'da büyük sanayi tesisinin çatısını kaplayan yüksek verimli GES kurulumu.": "Высокоэффективная станция, покрывающая крышу крупного завода в Аланье.",
      "Depo ve üretim tesisi çatısında çift taraflı panel uygulaması.": "Двусторонние панели на крыше склада и производственного цеха.",
      "Zemine bağlı arazi tipi kurulum ile tarımsal sulama pompası için güneş enerji sistemi.": "Наземная система для насоса сельхозполива.",
      "Gespa Enerji Ltd. Şti., Türkiye'nin güneş potansiyelini ekonomik değere dönüştüren bir mühendislik ve EPC firmasıdır.": "Gespa Enerji Ltd. Şti. — инжиниринговая и EPC-компания, превращающая солнечный потенциал Турции в экономическую ценность.",
      "Neden GESPA Enerji?": "Почему GESPA Enerji?", "Mühendislik disiplini, şeffaf süreç": "Инженерная дисциплина, прозрачный процесс",
      "Sadece kurulum yapmıyor; projelendirmeden TEDAŞ onay süreçlerine, bakım ve izlemeye kadar tam kapsamlı mühendislik hizmeti sunuyoruz. Bizim için bir proje, panel kurulduğunda değil, sisteminiz 25 yıl boyunca sorunsuz çalıştığında başarıya ulaşmış demektir.": "Мы не только монтируем — от проектирования и согласований до обслуживания и мониторинга предоставляем полный инжиниринг. Для нас проект успешен не когда установлены панели, а когда система безотказно работает 25 лет.",
      "Akredite, A-marka ekipman": "Аккредитованное оборудование A-брендов", "Şeffaf fizibilite ve geri ödeme": "Прозрачное ТЭО и окупаемость",
      "Performans + işçilik garantisi": "Гарантия выработки и монтажа", "Türkiye geneli servis ağı": "Сервис по всей Турции",
      "25 yıla varan panel garantisi": "Гарантия на панели до 25 лет", "7/24 uzaktan izleme": "Удалённый мониторинг 24/7",
      "\"Temiz enerji bir tercih değil, geleceğin temel ihtiyacıdır. Biz bu geçişi karlı ve sorunsuz hale getiriyoruz.\"": "«Чистая энергия — не выбор, а базовая потребность будущего. Мы делаем этот переход выгодным и беспроблемным.»",
      "Garanti": "Гарантия", "İzleme": "Мониторинг", "Memnuniyet": "Довольных клиентов",
      "Değerlerimiz": "Наши ценности", "Çalışma ilkelerimiz": "Наши принципы",
      "Kalite Odaklılık": "Фокус на качестве", "Şeffaf İletişim": "Прозрачная коммуникация", "Sürekli İnovasyon": "Постоянные инновации", "Sürdürülebilirlik": "Устойчивость",
      "A-marka ekipman ve standartlara uygun işçilikle uzun ömürlü sistemler kurarız.": "Строим долговечные системы с оборудованием A-брендов и монтажом по стандартам.",
      "Fizibilite, maliyet ve geri ödeme analizini açık ve anlaşılır şekilde paylaşırız.": "Понятно и открыто делимся ТЭО, затратами и расчётом окупаемости.",
      "Yeni panel, inverter ve depolama teknolojilerini projelerimize entegre ederiz.": "Внедряем новые технологии панелей, инверторов и накопителей.",
      "Temiz enerjiyle karbon ayak izini azaltır, geleceğe yatırım yaparız.": "Чистой энергией снижаем углеродный след и инвестируем в будущее.",
      "Kilometre Taşlarımız": "Наши вехи", "Yıllar içinde GESPA": "GESPA сквозь годы",
      "Manavgat'ta kuruluş ve ilk güneş paneli satışı.": "Основание в Манавгате и первая продажа панели.",
      "100. bağımsız ev kurulumunun tamamlanması.": "Завершён 100-й монтаж в частном доме.",
      "Endüstriyel çatı projelerine geçiş.": "Переход к промышленным проектам на крышах.",
      "Bölgede 15 MW kurulu güce ulaşılması.": "Достигнуто 15 МВт установленной мощности в регионе.",
      "500+ proje ile Antalya'nın lideri.": "Лидер в Анталье с 500+ проектами.",
      "GESPA Enerji": "GESPA Enerji", "Saha montaj uygulaması": "Монтаж на объекте",
      "Ücretsiz Keşif & Teklif": "Бесплатный выезд и КП", "Bize ulaşın": "Свяжитесь с нами",
      "Çatınız veya araziniz için tasarruf potansiyelinizi öğrenin. Formu doldurun, mühendis ekibimiz sizi en kısa sürede arasın.": "Узнайте потенциал экономии для вашей крыши или участка. Заполните форму — наша команда свяжется с вами в ближайшее время.",
      "WhatsApp ile yazın": "Написать в WhatsApp", "Hafta içi 09:00 – 18:00": "Пн–Пт 09:00 – 18:00",
      "Resmi unvan:": "Юр. лицо:",
      "Ad Soyad *": "Имя и фамилия *", "Telefon *": "Телефон *", "E-posta": "E-mail", "Proje Tipi": "Тип проекта",
      "Diğer": "Другое", "Şehir": "Город", "Mesajınız": "Сообщение", "Teklif İste": "Запросить КП",
      "Anahtar teslim güneş enerjisi santralleri. Mühendislik, kurulum, finansman ve bakım.": "Солнечные электростанции под ключ. Инжиниринг, монтаж, финансирование и обслуживание.",
      "Kurumsal": "Компания", "Bülten": "Рассылка", "Güneş enerjisi haberleri ve teşvikler.": "Новости солнечной энергетики и льготы.",
      "Abone ol": "Подписаться", "Bakım (O&M)": "Обслуживание (O&M)",
      "Tüm hakları saklıdır.": "Все права защищены.", "Gizlilik": "Конфиденциальность", "Çerez Politikası": "Политика cookie",
      "Aboneliğiniz alındı, teşekkürler!": "Подписка оформлена, спасибо!"
    }
  };

  var SKIP = "[data-c-text],[data-count],.r-value,#yil,.brand,.footer-brand,.logo,.lang-switch,[data-i18n-html]";
  function skipped(el) { return el.closest && el.closest(SKIP); }
  function leaves() {
    var out = [];
    document.querySelectorAll("header *, main *, footer *, .topbar *").forEach(function (el) {
      if (el.children.length === 0 && el.textContent.trim() && !skipped(el)) out.push(el);
    });
    return out;
  }

  function apply(lang) {
    lang = ({ tr: 1, en: 1, de: 1, ru: 1 })[lang] ? lang : "tr";
    document.documentElement.setAttribute("lang", lang);
    var d = DICT[lang] || {};
    leaves().forEach(function (el) {
      var o = el.getAttribute("data-i18n-o");
      if (o === null) { o = el.textContent.trim(); el.setAttribute("data-i18n-o", o); }
      el.textContent = (lang === "tr") ? o : (d[o] || o);
    });
    Object.keys(HTMLMAP).forEach(function (sel) {
      var el = document.querySelector(sel); if (!el) return;
      var m = HTMLMAP[sel]; el.innerHTML = m[lang] || m.tr;
    });
    var ph = PH[lang] || {};
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(function (el) {
      var o = el.getAttribute("data-ph-o");
      if (o === null) { o = el.getAttribute("placeholder") || ""; el.setAttribute("data-ph-o", o); }
      el.setAttribute("placeholder", (lang === "tr") ? o : (ph[o] || o));
    });
    GESPA.lang = lang;
    try { localStorage.setItem(LS, lang); } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("gespa:lang", { detail: lang }));
  }

  GESPA.units = UNITS;
  GESPA.applyLang = apply;

  var LANGS = ["tr", "en", "de", "ru"];

  // URL yolundan aktif dili ve sayfa dosyasını çöz
  // Kök = TR; /en/ /de/ /ru/ alt dizinleri build ile üretilen statik dil sayfaları
  function pageInfo() {
    var p = location.pathname || "/";
    var m = p.match(/^\/(en|de|ru)\//);
    var lang = m ? m[1] : "tr";
    var rest = m ? p.slice(m[0].length) : p.replace(/^\//, "");
    if (rest === "") rest = "index.html";
    return { lang: lang, file: rest };
  }

  // Bir dil + sayfa için mutlak URL üret (TR = kök)
  function urlFor(lang, file) {
    var prefix = lang === "tr" ? "/" : "/" + lang + "/";
    var f = file === "index.html" ? "" : file;
    return location.origin + prefix + f;
  }

  // hreflang alternatiflerini (tr/en/de/ru + x-default) head'e enjekte et
  function injectHreflang(file) {
    var head = document.head; if (!head) return;
    Array.prototype.slice.call(head.querySelectorAll('link[rel="alternate"][hreflang]'))
      .forEach(function (l) { l.parentNode.removeChild(l); });
    var add = function (hl, href) {
      var l = document.createElement("link");
      l.setAttribute("rel", "alternate"); l.setAttribute("hreflang", hl); l.setAttribute("href", href);
      head.appendChild(l);
    };
    LANGS.forEach(function (l) { add(l, urlFor(l, file)); });
    add("x-default", urlFor("tr", file));
  }

  function init() {
    var info = pageInfo();
    // Prerendered dil sayfasında window.__LANG__ önceliklidir; aksi halde yol dili
    var lang = info.lang;
    if (window.__LANG__ && LANGS.indexOf(window.__LANG__) >= 0) lang = window.__LANG__;
    apply(lang);
    injectHreflang(info.file);
    // Dil değiştirici: ilgili dilin URL'sine git (SEO için ayrı sayfalar)
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".lang-switch button");
      if (!b) return;
      var target = b.getAttribute("data-lang");
      try { localStorage.setItem(LS, target); } catch (err) {}
      var dest = urlFor(target, info.file);
      var here = location.origin + location.pathname.replace(/index\.html$/, "");
      if (dest === here || dest === here + "index.html") { apply(target); injectHreflang(info.file); }
      else location.href = dest + location.hash;
    });
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
