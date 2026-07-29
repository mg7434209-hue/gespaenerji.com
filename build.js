/**
 * GESPA Enerji — çok dilli statik sayfa üreticisi (bağımlılıksız)
 * ----------------------------------------------------------------
 * Kök dizindeki TR sayfalarından /en, /de, /ru alt dizinlerine
 * dil sayfaları üretir. Kritik SEO sinyalleri (html lang, <title>,
 * meta description, canonical, og:url, og:locale, hreflang sinyali)
 * statik gömülür; sayfa gövdesi mevcut istemci i18n (assets/i18n.js)
 * tarafından çevrilir (Googlebot JS render ettiği için indekslenir).
 *
 * Kullanım: node build.js   ·   çıktı dizinleri .gitignore'dadır.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const ORIGIN = "https://www.gespaenerji.com";
const LANGS = ["en", "de", "ru"];
const OG_LOCALE = { en: "en_US", de: "de_DE", ru: "ru_RU" };

// Üretilecek sayfalar
const PAGES = [
  "index.html", "hizmetler.html", "urunler.html", "su-isitici.html", "hesaplayici.html",
  "projeler.html", "hakkimizda.html", "iletisim.html", "tarimsal-sulama.html",
  "ai-cankurtaran-destek-sistemi.html", "sistem-kur.html",
  // Yasal sayfalar da üretilir: dil değiştirici ve hreflang /en/kvkk.html gibi
  // URL'lere işaret eder; üretilmezse 404 olur. Gövde metni TR kalır (hukuken
  // geçerli metin Türkçedir), başlık/description dile göre yazılır.
  "kvkk.html", "gizlilik.html", "cerez-politikasi.html"
];

// Sayfa başına dil-özel <title> ve meta description (en kritik SEO sinyalleri)
const META = {
  "index.html": {
    en: { t: "GESPA Energy — Solar Power Plants (PV) | Turnkey Solutions",
          d: "GESPA Energy: turnkey installation, engineering, financing and maintenance for rooftop and ground-mounted solar power plants (PV). Manavgat / Antalya, Türkiye." },
    de: { t: "GESPA Energy — Solarkraftwerke (PV) | Schlüsselfertige Lösungen",
          d: "GESPA Energy: schlüsselfertige Installation, Engineering, Finanzierung und Wartung für Aufdach- und Freiflächen-Solaranlagen. Manavgat / Antalya, Türkei." },
    ru: { t: "GESPA Energy — Солнечные электростанции | Решения под ключ",
          d: "GESPA Energy: монтаж под ключ, инжиниринг, финансирование и обслуживание солнечных электростанций на крыше и на земле. Манавгат / Анталья, Турция." }
  },
  "hizmetler.html": {
    en: { t: "Our Services — Rooftop & Ground Solar, Storage, O&M | GESPA Energy",
          d: "Rooftop PV, ground-mounted PV, energy storage, engineering, financing and maintenance (O&M). Turnkey solar energy solutions — GESPA Energy." },
    de: { t: "Leistungen — Aufdach- & Freiflächen-PV, Speicher, Wartung | GESPA Energy",
          d: "Aufdach-PV, Freiflächen-PV, Energiespeicher, Engineering, Finanzierung und Wartung (O&M). Schlüsselfertige Solarlösungen — GESPA Energy." },
    ru: { t: "Услуги — Солнечные станции, накопители, обслуживание | GESPA Energy",
          d: "Солнечные станции на крыше и на земле, накопители энергии, инжиниринг, финансирование и обслуживание (O&M). Решения под ключ — GESPA Energy." }
  },
  "urunler.html": {
    en: { t: "Solar Packages — Portable Off-Grid & Irrigation Kits | GESPA Energy",
          d: "Portable off-grid (lithium battery) solar kits and agricultural irrigation packages. 1–20 kWp with clear power, panel count and price — off-grid turnkey solutions, GESPA Energy." },
    de: { t: "Solar-Pakete — Tragbare Off-Grid- & Bewässerungssets | GESPA Energy",
          d: "Tragbare Off-Grid-Solarsets (Lithium-Batterie) und landwirtschaftliche Bewässerungspakete. 1–20 kWp mit klarer Leistung, Modulanzahl und Preis — netzunabhängige Lösungen." },
    ru: { t: "Солнечные пакеты — Портативные off-grid и для полива | GESPA Energy",
          d: "Портативные автономные солнечные комплекты (литиевый аккумулятор) и пакеты для аграрного полива. 1–20 кВт с понятной мощностью и ценой — автономные решения." }
  },
  "su-isitici.html": {
    en: { t: "PV Solar Water Heater — Photovoltaic Water Heating | GESPA Energy",
          d: "New-generation photovoltaic (PV) water heater that heats water directly with monocrystalline solar panels. Smart GF-20 controller, automatic grid backup on cloudy days, 60–200 L enamel tank — GESPA Energy." },
    de: { t: "PV-Solar-Warmwasserbereiter — Photovoltaische Warmwasserbereitung | GESPA Energy",
          d: "Photovoltaischer (PV) Warmwasserbereiter der neuen Generation: erwärmt Wasser direkt mit Monokristallin-Solarmodulen. Smarter GF-20-Regler, automatische Netz-Reserve bei Bewölkung, 60–200 L Emailtank." },
    ru: { t: "PV солнечный водонагреватель — Фотоэлектрический нагрев воды | GESPA Energy",
          d: "Фотоэлектрический (PV) водонагреватель нового поколения, нагревающий воду напрямую монокристаллическими панелями. Умный контроллер GF-20, авто-резерв от сети в пасмурную погоду, эмалевый бак 60–200 л." }
  },
  "hesaplayici.html": {
    en: { t: "Solar Savings Calculator (PV) | GESPA Energy",
          d: "Free solar calculator: system size, number of panels, annual yield, savings, payback period, 25-year return and CO₂ reduction from your bill, consumption or roof area." },
    de: { t: "Solar-Ersparnisrechner (PV) | GESPA Energy",
          d: "Kostenloser Solarrechner: Anlagengröße, Modulanzahl, Jahresertrag, Ersparnis, Amortisation, 25-Jahres-Rendite und CO₂-Einsparung anhand Rechnung, Verbrauch oder Dachfläche." },
    ru: { t: "Калькулятор экономии на солнечной энергии | GESPA Energy",
          d: "Бесплатный калькулятор: мощность, число панелей, годовая выработка, экономия, срок окупаемости, доход за 25 лет и снижение CO₂ по счёту, потреблению или площади крыши." }
  },
  "projeler.html": {
    en: { t: "Reference Projects — Rooftop & Ground PV | GESPA Energy",
          d: "Solar power plant (PV) projects we delivered across sectors: industry, agriculture, cold storage, hotels and ground-mounted plants." },
    de: { t: "Referenzprojekte — Aufdach- & Freiflächen-PV | GESPA Energy",
          d: "Realisierte Solarkraftwerk-Projekte (PV) in verschiedenen Branchen: Industrie, Landwirtschaft, Kühlhäuser, Hotels und Freiflächenanlagen." },
    ru: { t: "Реализованные проекты — Солнечные станции | GESPA Energy",
          d: "Проекты солнечных электростанций в разных отраслях: промышленность, сельское хозяйство, холодные склады, отели и наземные станции." }
  },
  "hakkimizda.html": {
    en: { t: "About Us — Gespa Enerji Ltd. (GESPA Energy) | Solar Solutions",
          d: "Gespa Enerji Ltd.; a Manavgat/Antalya-based company providing engineering and EPC services for solar power plants (PV)." },
    de: { t: "Über uns — Gespa Enerji Ltd. (GESPA Energy) | Solarlösungen",
          d: "Gespa Enerji Ltd.; ein Unternehmen mit Sitz in Manavgat/Antalya, das Engineering- und EPC-Leistungen für Solarkraftwerke (PV) anbietet." },
    ru: { t: "О нас — Gespa Enerji Ltd. (GESPA Energy) | Солнечные решения",
          d: "Gespa Enerji Ltd.; компания из Манавгата/Антальи, предоставляющая инжиниринговые и EPC-услуги для солнечных электростанций." }
  },
  "iletisim.html": {
    en: { t: "Contact — Free Site Survey & Quote | GESPA Energy (Manavgat/Antalya)",
          d: "Get in touch with GESPA Energy: +90 543 743 42 09, gesmarketim@gmail.com, Manavgat/Antalya. Free site survey and quote." },
    de: { t: "Kontakt — Kostenlose Vor-Ort-Analyse & Angebot | GESPA Energy",
          d: "Kontaktieren Sie GESPA Energy: +90 543 743 42 09, gesmarketim@gmail.com, Manavgat/Antalya. Kostenlose Vor-Ort-Analyse und Angebot." },
    ru: { t: "Контакты — Бесплатный выезд и КП | GESPA Energy (Манавгат/Анталья)",
          d: "Свяжитесь с GESPA Energy: +90 543 743 42 09, gesmarketim@gmail.com, Манавгат/Анталья. Бесплатный выезд и коммерческое предложение." }
  },
  "sistem-kur.html": {
    en: { t: "System Builder — Size Your Own Solar Kit | GESPA Energy",
          d: "Pick the appliances you'll run and instantly see the required PV power, battery capacity and inverter size. Choose brands and models, then create your order." },
    de: { t: "Systemkonfigurator — Eigene Solaranlage auslegen | GESPA Energy",
          d: "Wählen Sie Ihre Geräte und sehen Sie sofort benötigte PV-Leistung, Batteriekapazität und Wechselrichtergröße. Marken und Modelle wählen und Bestellung erstellen." },
    ru: { t: "Конфигуратор системы — соберите свой солнечный комплект | GESPA Energy",
          d: "Выберите приборы и сразу увидите нужную мощность панелей, ёмкость аккумулятора и мощность инвертора. Выберите бренды и модели и создайте заказ." }
  },
  "ai-cankurtaran-destek-sistemi.html": {
    en: { t: "AI Lifeguard Support System | Pool Drowning Prevention — Gespa Enerji",
          d: "AI-powered drowning prevention for hotel and public pools: 24/7 camera monitoring, alerts within seconds, privacy-compliant local processing. Request a free site survey." },
    de: { t: "KI-Rettungsschwimmer-Assistenzsystem | Ertrinkungsprävention — Gespa Enerji",
          d: "KI-gestützte Ertrinkungsprävention für Hotel- und öffentliche Pools: 24/7-Kameraüberwachung, Alarm in Sekunden, datenschutzkonforme lokale Verarbeitung. Kostenlose Vor-Ort-Analyse anfordern." },
    ru: { t: "ИИ-система поддержки спасателей | Предотвращение утопления — Gespa Enerji",
          d: "ИИ-система предотвращения утопления для отельных и общественных бассейнов: видеонаблюдение 24/7, тревога за секунды, локальная обработка данных. Запросите бесплатный выезд." }
  },
  "kvkk.html": {
    en: { t: "Personal Data Protection (KVKK) Notice | GESPA Energy",
          d: "Privacy notice under Turkish Data Protection Law No. 6698 (KVKK): data categories, purposes, legal bases, transfers and your rights. The authoritative text is in Turkish." },
    de: { t: "Hinweis zum Datenschutz (KVKK) | GESPA Energy",
          d: "Datenschutzhinweis nach dem türkischen Datenschutzgesetz Nr. 6698 (KVKK): Datenkategorien, Zwecke, Rechtsgrundlagen, Übermittlungen und Ihre Rechte. Verbindlich ist der türkische Text." },
    ru: { t: "Уведомление о защите персональных данных (KVKK) | GESPA Energy",
          d: "Уведомление согласно турецкому закону № 6698 (KVKK): категории данных, цели, правовые основания, передача и ваши права. Юридически действителен турецкий текст." }
  },
  "gizlilik.html": {
    en: { t: "Privacy Policy | GESPA Energy",
          d: "How personal data is collected, processed and protected on gespaenerji.com. The authoritative text is in Turkish." },
    de: { t: "Datenschutzerklärung | GESPA Energy",
          d: "Wie personenbezogene Daten auf gespaenerji.com erhoben, verarbeitet und geschützt werden. Verbindlich ist der türkische Text." },
    ru: { t: "Политика конфиденциальности | GESPA Energy",
          d: "Как собираются, обрабатываются и защищаются персональные данные на gespaenerji.com. Юридически действителен турецкий текст." }
  },
  "cerez-politikasi.html": {
    en: { t: "Cookie Policy | GESPA Energy",
          d: "Cookies and similar technologies used on gespaenerji.com, consent-based analytics and how to manage your preferences. The authoritative text is in Turkish." },
    de: { t: "Cookie-Richtlinie | GESPA Energy",
          d: "Auf gespaenerji.com verwendete Cookies und ähnliche Technologien, einwilligungsbasierte Analyse und Verwaltung Ihrer Einstellungen. Verbindlich ist der türkische Text." },
    ru: { t: "Политика cookie | GESPA Energy",
          d: "Cookie и аналогичные технологии на gespaenerji.com, аналитика по согласию и управление настройками. Юридически действителен турецкий текст." }
  },
  "tarimsal-sulama.html": {
    en: { t: "Agricultural Solar Irrigation — Solar Pumping Systems | GESPA Energy",
          d: "Solar-powered agricultural irrigation: off-grid, diesel-free PV solutions for submersible/surface pumps. Manavgat/Antalya and all Türkiye. Free irrigation calculator." },
    de: { t: "Solare Bewässerung — Solar-Pumpsysteme für Landwirtschaft | GESPA Energy",
          d: "Solarbetriebene landwirtschaftliche Bewässerung: netzunabhängige, dieselfreie PV-Lösungen für Tauch-/Oberflächenpumpen. Manavgat/Antalya und ganz Türkei." },
    ru: { t: "Солнечное орошение — Насосные системы для сельского хозяйства | GESPA Energy",
          d: "Орошение на солнечной энергии: автономные решения без дизеля для погружных/поверхностных насосов. Манавгат/Анталья и вся Турция. Бесплатный калькулятор." }
  }
};

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

/* ============================================================
   STATİK SEO/AEO ÜRETİMİ — tek kaynak assets/config.js
   AI botları (GPTBot, ClaudeBot, PerplexityBot...) JavaScript
   ÇALIŞTIRMAZ; bu yüzden JSON-LD ve iletişim bilgileri build
   sırasında TR kaynak sayfalara statik işlenir. main.js aynı
   veriyi çalışma zamanında tazeler (data-gld varsa yeniden
   enjekte etmez). Elle düzenlemeyin; kaynak = config.js.
   ============================================================ */
function loadConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/config.js"), "utf8"), sandbox);
  return sandbox.window.GESPA.config;
}

function localBusinessLd(c) {
  const d = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    name: c.brandName, legalName: c.legalName, url: c.web,
    telephone: c.phone && c.phone.tel, email: c.email,
    image: c.web + "/assets/img/gespa-icon.png",
    address: { "@type": "PostalAddress", streetAddress: c.address.line, addressLocality: c.address.district, addressRegion: c.address.city, addressCountry: c.address.country }
  };
  if (c.description) d.description = c.description;
  if (c.slogan) d.slogan = c.slogan;
  if (c.openingHours) d.openingHours = c.openingHours;
  if (c.priceRange) d.priceRange = c.priceRange;
  if (c.areaServed && c.areaServed.length) d.areaServed = c.areaServed;
  if (c.knowsAbout && c.knowsAbout.length) d.knowsAbout = c.knowsAbout;
  if (c.foundingYear) d.foundingDate = String(c.foundingYear);
  if (c.services && c.services.length) {
    d.hasOfferCatalog = {
      "@type": "OfferCatalog", name: "Hizmetler",
      itemListElement: c.services.map(sv => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: sv } }))
    };
  }
  if (c.rating && c.rating.value && c.rating.count) d.aggregateRating = { "@type": "AggregateRating", ratingValue: c.rating.value, reviewCount: c.rating.count };
  if (c.sameAs && c.sameAs.length) d.sameAs = c.sameAs;
  if (c.geo && c.geo.lat != null && c.geo.lng != null) d.geo = { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng };
  return d;
}

function heaterProductLd(cfg) {
  const prices = cfg.heater.models.map(m => m.price).filter(Boolean);
  const d = {
    "@context": "https://schema.org", "@type": "Product",
    name: (cfg.heater.name || "Solar Su Isıtma Sistemi") + " — Fotovoltaik Güneş Enerjili Su Isıtıcı",
    image: cfg.company.web + "/assets/img/products/pv-su-isitici.jpg",
    description: "Monokristal güneş panelleriyle suyu doğrudan güneş enerjisiyle ısıtan fotovoltaik su ısıtıcı. Akıllı GF-20 kontrol, bulutlu havada otomatik şebeke (AC) desteği, emaye iç tank. 60–200 L kapasite seçenekleri (yatay/dikey).",
    brand: { "@type": "Brand", name: cfg.company.brandName },
    category: "Solar Water Heater",
    url: cfg.company.web + "/su-isitici.html"
  };
  if (prices.length) {
    d.offers = {
      "@type": "AggregateOffer", priceCurrency: "TRY",
      lowPrice: Math.min.apply(null, prices), highPrice: Math.max.apply(null, prices),
      offerCount: prices.length, availability: "https://schema.org/InStock"
    };
  }
  return d;
}

function packagesItemListLd(cfg) {
  const COST = (cfg.calc && cfg.calc.costPerKwp) || 28000;
  const items = cfg.packages.map(p => {
    const item = {
      "@type": "Product", name: p.name, category: p.tag, description: p.desc,
      url: cfg.company.web + "/urunler.html#pkg-" + p.id
    };
    const price = p.price != null ? p.price : (p.priceOnRequest ? null : Math.round(p.kwp * COST));
    if (price != null) item.offers = { "@type": "Offer", price: price, priceCurrency: p.currency || "TRY", availability: "https://schema.org/InStock" };
    return item;
  });
  return {
    "@context": "https://schema.org", "@type": "ItemList",
    name: "GESPA Enerji Paket Ürünler",
    itemListElement: items.map((o, i) => ({ "@type": "ListItem", position: i + 1, item: o }))
  };
}

function cankurtaranProductLd(cfg) {
  return {
    "@context": "https://schema.org", "@type": "Product",
    name: "AI Cankurtaran Destek Sistemi",
    alternateName: "AI Lifeguard Support System",
    image: cfg.company.web + "/assets/img/products/cankurtaran/hero-havuz-guvenlik.png",
    description: "Otel, aquapark, belediye ve site havuzları için yapay zekâ destekli boğulma önleme sistemi. Kameralar havuzu 7/24 tarar; risk algılandığında cankurtaranın akıllı saatine ve alarm noktalarına saniyeler içinde konumlu uyarı gönderir. ISO 20380:2017 ile uyumlu teknoloji; görüntüler tesis içindeki yerel sunucuda işlenir (KVKK uyumlu). Cankurtaranın yerine geçmez; onu destekleyen ikincil gözetim katmanıdır.",
    brand: { "@type": "Brand", name: cfg.company.brandName },
    category: "Pool Drowning Detection System",
    url: cfg.company.web + "/ai-cankurtaran-destek-sistemi.html"
  };
}

// Sayfadaki .crumbs bloğundan statik BreadcrumbList üret (bot'lar JS'siz görür)
function breadcrumbLd(html, file, cfg) {
  const m = html.match(/<div class="crumbs[^"]*">([\s\S]*?)<\/div>/);
  if (!m) return null;
  const inner = m[1];
  const items = [];
  const linkRe = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let lm;
  while ((lm = linkRe.exec(inner)) !== null) {
    const href = lm[1] === "index.html" ? cfg.company.web + "/" : cfg.company.web + "/" + lm[1];
    items.push({ "@type": "ListItem", position: items.length + 1, name: lm[2].replace(/<[^>]+>/g, "").trim(), item: href });
  }
  // son kırıntı: etiketler ayıklanınca kalan metnin son parçası
  const tail = inner.replace(/<a[\s\S]*?<\/a>/g, "").replace(/<[^>]+>/g, " ").split("/").map(s => s.trim()).filter(Boolean).pop();
  if (tail) items.push({ "@type": "ListItem", position: items.length + 1, name: tail, item: cfg.company.web + "/" + file });
  if (items.length < 2) return null;
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

// Projeler sayfasındaki statik kartlardan ItemList üret
function projectsItemListLd(html, cfg) {
  const items = [];
  const re = /<article class="project[\s\S]*?<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>[\s\S]*?📍\s*([^<]+)<[\s\S]*?⚡\s*([^<]+)</g;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({
      "@type": "ListItem", position: items.length + 1,
      item: { "@type": "Project", name: m[1].trim(), description: m[2].trim(), location: m[3].trim(), additionalProperty: { "@type": "PropertyValue", name: "Kurulu güç", value: m[4].trim() } }
    });
  }
  if (!items.length) return null;
  return { "@context": "https://schema.org", "@type": "ItemList", name: "GESPA Enerji Referans Projeler", itemListElement: items };
}

function webAppLd(cfg) {
  return {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "GES Tasarruf Hesaplayıcı", url: cfg.company.web + "/hesaplayici.html",
    applicationCategory: "UtilityApplication", operatingSystem: "Web",
    offers: { "@type": "Offer", price: 0, priceCurrency: "TRY" },
    description: "Ücretsiz güneş enerjisi hesaplayıcı: fatura, tüketim veya çatı alanından sistem gücü, panel sayısı, yıllık tasarruf, geri ödeme süresi, 25 yıllık kazanç ve CO₂ etkisini hesaplar. Panel yerleşimi, inverter, kablo, batarya ve sıra aralığı mühendislik araçları içerir.",
    provider: { "@type": "Organization", name: cfg.company.brandName, url: cfg.company.web }
  };
}

const LD_RE = /[ \t]*<!-- LD:STATIC[\s\S]*?\/LD:STATIC -->\n?/;
function injectStaticLd(html, file, cfg) {
  const objs = [localBusinessLd(cfg.company)];
  if (file === "su-isitici.html") objs.push(heaterProductLd(cfg));
  if (file === "urunler.html") objs.push(packagesItemListLd(cfg));
  if (file === "ai-cankurtaran-destek-sistemi.html") objs.push(cankurtaranProductLd(cfg));
  if (file === "hesaplayici.html") objs.push(webAppLd(cfg));
  if (file === "hakkimizda.html") objs.push({ "@context": "https://schema.org", "@type": "AboutPage", name: "Hakkımızda — " + cfg.company.brandName, url: cfg.company.web + "/hakkimizda.html", about: { "@type": "Organization", name: cfg.company.brandName, url: cfg.company.web } });
  if (file === "iletisim.html") objs.push({ "@context": "https://schema.org", "@type": "ContactPage", name: "İletişim — " + cfg.company.brandName, url: cfg.company.web + "/iletisim.html" });
  if (file === "projeler.html") { const pl = projectsItemListLd(html, cfg); if (pl) objs.push(pl); }
  const bc = breadcrumbLd(html.replace(LD_RE, ""), file, cfg);
  if (bc) objs.push(bc);
  const block = "  <!-- LD:STATIC — build.js config'ten üretir; elle düzenlemeyin -->\n"
    + objs.map(o => '  <script type="application/ld+json" data-gld="' + String(o["@type"] || "x").toLowerCase() + '">' + JSON.stringify(o) + "</script>").join("\n")
    + "\n  <!-- /LD:STATIC -->\n";
  if (LD_RE.test(html)) return html.replace(LD_RE, block);
  return html.replace(/\n?<\/head>/, "\n" + block + "</head>");
}

// i18n sözlüğünü Node tarafında yükle (i18n.js window.GESPA.i18nData'ya koyar)
function loadI18n() {
  const noop = function () {};
  const sandbox = {
    document: {
      readyState: "loading", addEventListener: noop, dispatchEvent: noop,
      querySelectorAll: () => [], querySelector: () => null,
      head: { appendChild: noop, querySelectorAll: () => [] },
      documentElement: { setAttribute: noop },
      createElement: () => ({ setAttribute: noop }),
    },
    localStorage: { getItem: () => null, setItem: noop },
    location: { pathname: "/", origin: ORIGIN },
    CustomEvent: function () {},
  };
  sandbox.window = sandbox; // i18n.js 'GESPA' global adına bare erişir
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/i18n.js"), "utf8"), sandbox);
  return sandbox.GESPA.i18nData; // { DICT, PH, HTMLMAP }
}

function nfTr(n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); }

// Dil sayfası gövdesini DICT ile statik çevir (istemci i18n dinamik içerik için kalır).
// Leaf yaklaşımı: >METİN< aralıklarında tam (trim) eşleşme; eşleşmeyen TR kalır.
function translateBody(out, lang, i18n) {
  const d = (i18n.DICT && i18n.DICT[lang]) || {};
  const bodyStart = out.indexOf("<body");
  if (bodyStart < 0) return out;
  let head = out.slice(0, bodyStart), body = out.slice(bodyStart);
  // data-c-* elemanlarının içeriği çevrilmez (config verisi; runtime da SKIP eder)
  const GUARDS = [];
  body = body.replace(/(<[^>]*\bdata-c-[^>]*>)([^<]*)(?=<)/g, (m, tag, inner) => {
    GUARDS.push(inner); return tag + "\u0000G" + (GUARDS.length - 1) + "\u0000";
  });
  const decode = x => x.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, "\u00a0");
  const enc = x => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  body = body.replace(/>([^<>]+)</g, (m, txt) => {
    const t = txt.trim();
    if (!t) return m;
    const key = d[t] ? t : (d[decode(t)] ? decode(t) : null);
    if (!key) return m;
    const tr = t === key ? d[key] : enc(d[key]);
    const i = txt.indexOf(t);
    return ">" + txt.slice(0, i) + tr + txt.slice(i + t.length) + "<";
  });
  body = body.replace(/\u0000G(\d+)\u0000/g, (m, i) => GUARDS[+i]);
  // aria-label / title / alt öznitelikleri de DICT ile çevrilir
  body = body.replace(/((?:aria-label|title|alt)=")([^"]+)(")/g,
    (m, a, v, c) => (d[v] || d[decode(v)]) ? a + enc(d[v] || d[decode(v)]) + c : m);
  const ph = (i18n.PH && i18n.PH[lang]) || {};
  body = body.replace(/placeholder="([^"]*)"/g, (m, v) => (ph[v] ? 'placeholder="' + esc(ph[v]) + '"' : m));
  // data-i18n-html elemanları (ör. #heroTitle) — HTMLMAP'ten statik bas
  const HM = i18n.HTMLMAP || {};
  for (const sel of Object.keys(HM)) {
    if (sel[0] !== "#") continue;
    const re = new RegExp('(<([a-z0-9]+)[^>]*\\bid="' + sel.slice(1) + '"[^>]*>)[\\s\\S]*?(</\\2>)');
    body = body.replace(re, (mm, open, tag, close) => open + (HM[sel][lang] || HM[sel].tr) + close);
  }
  return head + body;
}

// FAQPage JSON-LD'yi silmek yerine DICT ile çevir (eşleşmeyen TR kalır)
function translateFaqLd(block, lang, i18n) {
  const d = (i18n.DICT && i18n.DICT[lang]) || {};
  const m = block.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) return block;
  try {
    const obj = JSON.parse(m[1]);
    if (obj["@type"] !== "FAQPage") return block;
    (obj.mainEntity || []).forEach(q => {
      if (d[q.name]) q.name = d[q.name];
      const a = q.acceptedAnswer;
      if (a && d[a.text]) a.text = d[a.text];
    });
    return block.replace(m[1], JSON.stringify(obj));
  } catch (e) { return block; }
}

// ---- TR kaynaklara ek statik içerik (JS'siz botlar tam veri görsün) ----
function hydrateExtras(html, file, cfg) {
  const c = cfg.company;
  // Telif yılı
  html = html.replace(/(<span id="yil">)[^<]*(<\/span>)/, "$1" + new Date().getFullYear() + "$2");
  // Sayaçlar: nihai değer statik yazılır (animasyon 0'dan sayarak üzerine gelir)
  html = html.replace(/(<([a-z0-9]+)([^>]*\bdata-count="([^"]+)"[^>]*)>)[^<]*(<\/\2>)/g,
    (m, open, tag, attrs, val, close) => {
      const pre = (attrs.match(/data-prefix="([^"]*)"/) || [])[1] || "";
      const suf = (attrs.match(/data-suffix="([^"]*)"/) || [])[1] || "";
      return open + pre + val + suf + close;
    });
  // Marka vitrinleri
  const brandSpans = arr => arr.map(n => "<span>" + esc(n) + "</span>").join("");
  html = html.replace(/(<div class="trust-logos" id="brandPanels">)[\s\S]*?(<\/div>)/, "$1" + brandSpans(cfg.brands.panel) + "$2");
  html = html.replace(/(<div class="trust-logos" id="brandInverters">)[\s\S]*?(<\/div>)/, "$1" + brandSpans(cfg.brands.inverter) + "$2");
  // Hesaplayıcı varsayımları + bölge/yön seçenekleri
  const setSpan = (id, v) => { html = html.replace(new RegExp('(<[^>]*id="' + id + '"[^>]*>)[^<]*(</)'), "$1" + v + "$2"); };
  if (cfg.calc) {
    const k = cfg.calc;
    setSpan("aPanelW", k.panelW + " Wp");
    setSpan("aArea", k.areaPerKwp + " m²/kWp");
    setSpan("aCost", "₺" + nfTr(k.costPerKwp) + "/kWp");
    setSpan("aCo2", new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(k.co2PerKwh) + " kg/kWh");
    if (k.pump) {
      setSpan("pAEff", "%" + Math.round(k.pump.pumpEfficiency * 100));
      setSpan("pAOver", new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(k.pump.pvOversize) + "×");
    }
    const opts = (arr, vKey) => arr.map(r => '<option value="' + r[vKey] + '"' + (r.default ? " selected" : "") + ">" + esc(r.label) + "</option>").join("");
    html = html.replace(/(<select id="city"[^>]*>)[\s\S]*?(<\/select>)/, "$1" + opts(k.regions, "yield") + "$2");
    html = html.replace(/(<select id="orient"[^>]*>)[\s\S]*?(<\/select>)/, "$1" + opts(k.orientations, "factor") + "$2");
  }
  // Vitrin istatistikleri — config.company.stats tek kaynak
  if (c.stats) {
    html = html.replace(/(<([a-z0-9]+)[^>]*\bdata-stat="([^"]+)"[^>]*\bdata-count=")[^"]*("[^>]*>)[^<]*(<\/\2>)/g,
      (m, pre, tag, key, mid, close) => {
        const v = c.stats[key];
        if (v == null) return m;
        const attrs = m.slice(0, m.indexOf(">"));
        const suf = (attrs.match(/data-suffix="([^"]*)"/) || [])[1] || "";
        const prefix = (attrs.match(/data-prefix="([^"]*)"/) || [])[1] || "";
        return pre + v + mid + prefix + v + suf + close;
      });
  }
  // Su ısıtıcı model tablosu + başlangıç fiyatı
  if (file === "su-isitici.html" && cfg.heater) {
    const rows = cfg.heater.models.map(m =>
      "<tr><td>" + m.cap + " L</td><td>" + m.mount + "</td><td>" + (m.pv != null ? m.pv + " W" : "—") + "</td><td>" + (m.dim || "—") +
      "</td><td>" + (m.ac != null ? m.ac + " kW" : "—") + "</td><td>Emaye</td><td>" +
      (m.price ? '<span class="spec-price">₺' + nfTr(m.price) + "</span>" : '<a href="iletisim.html" class="spec-quote">Teklif alın</a>') + "</td></tr>"
    ).join("");
    html = html.replace(/(<tbody id="heaterRows">)[\s\S]*?(<\/tbody>)/, "$1" + rows + "$2");
    const prices = cfg.heater.models.map(m => m.price).filter(Boolean);
    if (prices.length) setSpan("heaterFrom", "₺" + nfTr(Math.min.apply(null, prices)) + "'dan başlayan fiyatlarla");
  }
  // Paket kataloğu — kompakt statik liste (main.js istemcide tam kartlarla değiştirir)
  if (file === "urunler.html" && cfg.packages) {
    const GROUPS = [
      { id: "offgrid", title: "Taşınabilir & Off-Grid Paketler" },
      { id: "irrigation", title: "Tarımsal Sulama Paketleri" },
      { id: "ongrid", title: "Çatı / On-Grid Paketler" }
    ];
    const COST = cfg.calc.costPerKwp;
    let staticList = "";
    for (const g of GROUPS) {
      const items = cfg.packages.filter(p => (p.group || "ongrid") === g.id);
      if (!items.length) continue;
      staticList += '<div class="pkg-group"><div class="pkg-group-head"><h2>' + g.title + "</h2></div><ul class=\"ticks\">" +
        items.map(p => {
          const price = p.price != null ? p.price : Math.round(p.kwp * COST);
          const cur = p.currency === "USD" ? "$" : "₺";
          return "<li><strong>" + esc(p.name) + "</strong> — " + p.kwp + " kWp · " + esc(p.for) + " · " +
            cur + nfTr(price) + (p.price != null ? "" : " (yaklaşık)") + ". " + esc(p.desc) + "</li>";
        }).join("") + "</ul></div>";
    }
    const marker = /<!-- PKG:STATIC -->[\s\S]*?<!-- \/PKG:STATIC -->/;
    const block = "<!-- PKG:STATIC -->" + staticList + "<!-- /PKG:STATIC -->";
    if (marker.test(html)) html = html.replace(marker, block);
    else html = html.replace(/(<div id="packageGrid"[^>]*>)/, "$1" + block);
  }
  // Sosyal medya bloğu: sameAs boşken statik HTML'den çıkar (JS'siz ortamda ölü
  // '#' linkleri kalmasın); yerine işaretleyici konur ki sameAs dolunca build
  // bloğu gerçek linklerle geri üretebilsin.
  const sameAs = (c.sameAs || []).filter(Boolean);
  const socialsRe = /(?:<div class="socials">[\s\S]*?<\/div>|<!-- SOCIALS:BOS -->)/g;
  if (!sameAs.length) {
    html = html.replace(socialsRe, "<!-- SOCIALS:BOS -->");
  } else {
    const links = sameAs.map(u => {
      const t = /linkedin\./i.test(u) ? ["in", "LinkedIn"] : /instagram\./i.test(u) ? ["ig", "Instagram"]
        : /(twitter\.|x\.com)/i.test(u) ? ["X", "X"] : /facebook\./i.test(u) ? ["f", "Facebook"]
        : /youtu/i.test(u) ? ["yt", "YouTube"] : ["🌐", "Web"];
      return '<a href="' + u + '" target="_blank" rel="noopener" aria-label="' + t[1] + '">' + t[0] + "</a>";
    }).join("");
    html = html.replace(socialsRe, '<div class="socials">' + links + "</div>");
  }
  // Statik hreflang kümesi (canonical'ın hemen ardına; mevcut küme yenilenir)
  html = html.replace(/[ \t]*<link rel="alternate" hreflang=[^>]*\/>\n?/g, "");
  const urlFor = l => l === "tr" ? ORIGIN + "/" + (file === "index.html" ? "" : file) : ORIGIN + "/" + l + "/" + (file === "index.html" ? "" : file);
  const cluster = ["tr", ...LANGS].map(l => '  <link rel="alternate" hreflang="' + l + '" href="' + urlFor(l) + '" />').join("\n")
    + '\n  <link rel="alternate" hreflang="x-default" href="' + urlFor("tr") + '" />';
  html = html.replace(/(<link rel="canonical"[^>]*\/>)/, "$1\n" + cluster);
  return html;
}

// ---- sitemap.xml üretimi: TR + tüm dil sayfaları ayrı <url> girdileriyle ----
const PRIORITY = {
  "index.html": "1.0", "hizmetler.html": "0.9", "urunler.html": "0.9",
  "ai-cankurtaran-destek-sistemi.html": "0.9", "su-isitici.html": "0.8",
  "tarimsal-sulama.html": "0.9", "hesaplayici.html": "0.8", "projeler.html": "0.7",
  "hakkimizda.html": "0.6", "iletisim.html": "0.8",
  "kvkk.html": "0.3", "gizlilik.html": "0.3", "cerez-politikasi.html": "0.3"
};
function writeSitemap() {
  const urlFor = (l, file) => l === "tr" ? ORIGIN + "/" + (file === "index.html" ? "" : file) : ORIGIN + "/" + l + "/" + (file === "index.html" ? "" : file);
  const entries = [];
  for (const file of PAGES) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    let lastmod;
    try {
      lastmod = require("child_process").execSync(
        'git log -1 --format=%cI -- "' + file + '"', { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }
      ).toString().trim().slice(0, 10);
    } catch (e) { /* git yoksa mtime */ }
    if (!lastmod) lastmod = fs.statSync(p).mtime.toISOString().slice(0, 10);
    const cluster = ["tr", ...LANGS].map(l => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + urlFor(l, file) + '" />').join("\n")
      + '\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlFor("tr", file) + '" />';
    for (const l of ["tr", ...LANGS]) {
      entries.push("  <url>\n    <loc>" + urlFor(l, file) + "</loc>\n    <lastmod>" + lastmod +
        "</lastmod><changefreq>" + (file === "index.html" ? "weekly" : "monthly") + "</changefreq><priority>" +
        (l === "tr" ? (PRIORITY[file] || "0.7") : "0.5") + "</priority>\n" + cluster + "\n  </url>");
    }
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    entries.join("\n") + "\n</urlset>\n";
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
}

// Metin varlıklarını ön-sıkıştır (.br + .gz) — server.js hazır dosyayı servis eder.
// Çıktılar .gitignore'dadır; her build'de yeniden üretilir (Railway start'ta da çalışır).
function precompress() {
  const zlibN = require("zlib");
  const targets = [];
  const addDir = (dir, re) => {
    for (const f of fs.readdirSync(dir)) {
      if (re.test(f)) targets.push(path.join(dir, f));
    }
  };
  addDir(ROOT, /\.(html|xml|txt)$/);
  addDir(path.join(ROOT, "assets"), /\.(js|css)$/);
  for (const l of LANGS) { const d = path.join(ROOT, l); if (fs.existsSync(d)) addDir(d, /\.html$/); }
  let n = 0;
  for (const p of targets) {
    const buf = fs.readFileSync(p);
    if (buf.length < 2048) continue; // küçük dosyada kazanç yok
    fs.writeFileSync(p + ".gz", zlibN.gzipSync(buf, { level: 9 }));
    fs.writeFileSync(p + ".br", zlibN.brotliCompressSync(buf, { params: { [zlibN.constants.BROTLI_PARAM_QUALITY]: 11 } }));
    n++;
  }
  return n;
}

// İletişim bilgilerini statik doldur (JS'siz botlar için; main.js runtime'da tazeler)
function hydrateContact(html, c) {
  html = html.replace(/(<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\bdata-c-text="([^"]+)"[^>]*>)[^<]*(<\/\2>)/g,
    (m, open, tag, key, close) => {
      const v = key.split(".").reduce((o, k) => (o == null ? o : o[k]), c);
      return v == null ? m : open + v + close;
    });
  const setHref = (tag, url) => /\bhref="/.test(tag)
    ? tag.replace(/href="[^"]*"/, 'href="' + url + '"')
    : tag.replace(/^<a\b/, '<a href="' + url + '"');
  html = html.replace(/<a\b[^>]*\bdata-c-tel\b[^>]*>/g, t => setHref(t, "tel:" + c.phone.tel));
  html = html.replace(/<a\b[^>]*\bdata-c-mailto\b[^>]*>/g, t => setHref(t, "mailto:" + c.email));
  html = html.replace(/<a\b[^>]*\bdata-c-wa\b[^>]*>/g, t => setHref(t, "https://wa.me/" + c.phone.wa));
  return html;
}

// AI yanıt motorları için ayrıntılı bilgi dosyası (fiyatlar config'ten)
function writeLlmsFull(cfg) {
  const nf = n => new Intl.NumberFormat("tr-TR").format(Math.round(n));
  const COST = cfg.calc.costPerKwp;
  const pkgLines = cfg.packages.map(p => {
    const price = p.price != null ? p.price : Math.round(p.kwp * COST);
    const cur = p.currency === "USD" ? "$" : "₺";
    const tag = p.price != null ? "" : " (yaklaşık, keşifle netleşir)";
    return `- ${p.name} — ${p.kwp} kWp · ${p.for} · ${cur}${nf(price)}${tag}`;
  }).join("\n");
  const heaterLines = cfg.heater.models.map(m =>
    `- ${m.cap} L (${m.mount}${m.pv ? ", " + m.pv + " W panel" : ""}): ${m.price ? "₺" + nf(m.price) : "fiyat için teklif alın"}`
  ).join("\n");
  const regions = cfg.calc.regions.map(r => `${r.label}: ${r.yield} kWh/kWp/yıl`).join(" · ");
  const c = cfg.company;
  const out = `# GESPA Enerji — Ayrıntılı Bilgi (AI yanıt motorları için)

> Bu dosya build.js tarafından assets/config.js'ten üretilir; fiyatlar ve
> katsayılar sitenin tek doğru kaynağıyla eşzamanlıdır. Özet için: /llms.txt

## Şirket
- Unvan: ${c.legalName} · Marka: ${c.brandName}
- ${c.description}
- Telefon/WhatsApp: ${c.phone.display} (+${c.phone.wa}) · E-posta: ${c.email}
- Adres: ${c.address.full} · Çalışma saatleri: ${c.hours}
- Hizmet bölgesi: ${c.areaServed.join(", ")}; talebe göre tüm Türkiye
- Web: ${c.web} · Diller: TR (kök), EN (/en), DE (/de), RU (/ru)

## Hizmetler
${c.services.map(s => "- " + s).join("\n")}

## Yeni Teknolojiler
### AI Cankurtaran Destek Sistemi (${c.web}/ai-cankurtaran-destek-sistemi.html)
Otel, aquapark, belediye ve site havuzları için yapay zekâ destekli boğulma
önleme sistemi. Kameralar havuzu 7/24 tarar; risk algılandığında cankurtaranın
akıllı saatine ve alarm noktalarına saniyeler içinde konumlu uyarı gönderir.
ISO 20380:2017 ile uyumlu teknoloji; görüntüler tesis dışına çıkmaz, yerel
sunucuda işlenir (KVKK uyumlu). Cankurtaranın yerine geçmez; destekleyen
ikincil gözetim katmanıdır. Ücretsiz keşif ve pilot teklifi verilir.

### Solar Su Isıtma Sistemi — PV su ısıtıcı (${c.web}/su-isitici.html)
Monokristal panellerle suyu doğrudan güneş enerjisiyle ısıtır; bulutlu havada
otomatik şebeke (AC) desteğine geçer. Emaye iç tank, akıllı GF-20 kontrol.
Modeller ve fiyatlar (KDV dahil, ₺):
${heaterLines}

## Paket Ürünler (${c.web}/urunler.html)
Markalar — panel: ${cfg.brands.panel.join(", ")} · inverter: ${cfg.brands.inverter.join(", ")}
${pkgLines}

## Sistem Kurucu (${c.web}/sistem-kur.html)
Off-grid sistemini adım adım kurma aracı: kullanım yeri (bağ evi, karavan, müstakil
ev, tarla/sulama, dükkân) seçilir; buzdolabı, TV, lamba, pompa gibi cihazlar adet ve
günlük çalışma saatiyle listelenir. Araç günlük kWh tüketimini ve tepe gücü hesaplar;
gerekli panel gücü (kWp), akü kapasitesi (kWh, model DoD'una göre) ve inverter gücünü
(kW, kalkış payı dahil) çıkarır. Ardından panel/akü/inverter markası ve modeli seçilir
(MC4, DC kablo, hazır pano, konstrüksiyon ve işçilik dahil) ve toplam tutarlı sipariş
özeti oluşturulur. Fiyatlar tahmini liste fiyatıdır; kesin teklif ücretsiz keşifle verilir.

## Ücretsiz Online Araçlar (${c.web}/hesaplayici.html)
- GES tasarruf hesaplayıcı: fatura/tüketim/çatı alanı/tarımsal sulama girişiyle
  sistem gücü, panel sayısı, yıllık üretim-tasarruf, geri ödeme süresi, 25 yıllık
  kazanç ve CO₂ etkisi. Varsayılanlar: panel ${cfg.calc.panelW} Wp, kurulum ~₺${nf(cfg.calc.costPerKwp)}/kWp,
  elektrik ₺${cfg.calc.defaultUnitPrice}/kWh. Bölge verimleri — ${regions}.
- Mühendislik alet çantası: panel yerleşim planlayıcı, inverter boyutlandırma,
  DC kablo kesiti/gerilim düşümü, batarya boyutlandırma, sıra aralığı/gölgelenme.
- Solar sulama pompası seçimi (${c.web}/tarimsal-sulama.html).

## Garanti & Güvence
- A-marka panellerde 25 yıla varan üretim performans garantisi; inverterlerde 5–12 yıl ürün garantisi.
- Anahtar teslim teslimat: keşif → projelendirme → kurulum → devreye alma; bakım (O&M) hizmeti sürer.
- Ücretsiz keşif ve tasarruf analizi tüm hizmetlerde standarttır.

## Nasıl Çalışırız (4 adım)
1. Ücretsiz keşif ve ihtiyaç analizi (saha incelemesi, tüketim profili)
2. Projelendirme ve net teklif (üretim simülasyonu, geri ödeme planı)
3. Anahtar teslim kurulum (sertifikalı ekip, A-marka ekipman)
4. Devreye alma, izleme ve bakım (O&M)

## Sık Sorulan Sorular (özet)
- GES yatırımı tipik olarak 3–6 yılda amorti olur (tüketim, bölge ve elektrik
  fiyatına göre değişir).
- Güneş enerjili tarımsal sulamada tipik geri ödeme 2–4 yıldır; mazot maliyeti
  sıfıra yaklaşır.
- Panellerde 25 yıla varan performans garantisi sunulur; bakım (O&M) hizmeti vardır.
- Finansman & leasing seçenekleriyle peşin sermaye gerekmeden başlanabilir.
- Ücretsiz keşif ve tasarruf analizi tüm hizmetler için standarttır.

## Yasal
KVKK aydınlatma metni: ${c.web}/kvkk.html · Gizlilik: ${c.web}/gizlilik.html · Çerez: ${c.web}/cerez-politikasi.html
`;
  fs.writeFileSync(path.join(ROOT, "llms-full.txt"), out);
}

function transform(html, lang, file, i18n) {
  const m = META[file] && META[file][lang];
  const canonical = ORIGIN + "/" + lang + "/" + (file === "index.html" ? "" : file);
  let out = html;

  // 1) <html lang="tr"> -> hedef dil
  out = out.replace(/<html lang="tr"/, '<html lang="' + lang + '"');

  // 2) Göreli "assets/..." referanslarını mutlak "/assets/..." yap (alt dizinde de çözülsün)
  //    href/src + <picture><source srcset> dahil
  out = out.replace(/(href|src)="assets\//g, '$1="/assets/');
  //    srcset/imagesrcset çok adaylı olabilir: her adayın başındaki assets/ önekini çevir
  out = out.replace(/((?:image)?srcset)="([^"]*)"/g,
    (m, attr, v) => attr + '="' + v.replace(/(^|,\s*)assets\//g, "$1/assets/") + '"');
  //    inline stil arka planları: url('assets/...') -> url('/assets/...')
  out = out.replace(/url\((['"]?)assets\//g, 'url($1/assets/');

  // 3) <title>, meta description ve og:title/og:description (dil-özel)
  if (m) {
    out = out.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(m.t) + "</title>");
    out = out.replace(/<meta name="description" content="[^"]*"\s*\/>/,
      '<meta name="description" content="' + esc(m.d) + '" />');
    out = out.replace(/<meta property="og:title" content="[^"]*"\s*\/>/,
      '<meta property="og:title" content="' + esc(m.t) + '" />');
    out = out.replace(/<meta property="og:description" content="[^"]*"\s*\/>/,
      '<meta property="og:description" content="' + esc(m.d) + '" />');
  }
  //    TR anahtar kelimeler dil sayfalarında yanıltıcı — kaldır
  out = out.replace(/[ \t]*<meta name="keywords" content="[^"]*"\s*\/>\n?/, "");

  // 4) og:locale
  out = out.replace(/content="tr_TR"/, 'content="' + OG_LOCALE[lang] + '"');

  // 5) canonical + og:url -> dile özel mutlak URL
  out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/>/,
    '<link rel="canonical" href="' + canonical + '" />');
  out = out.replace(/<meta property="og:url" content="[^"]*"\s*\/>/,
    '<meta property="og:url" content="' + canonical + '" />');

  // 6) FAQPage JSON-LD'yi silme; DICT ile çevir (eşleşmeyen TR kalır)
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    block => /"FAQPage"/.test(block) ? translateFaqLd(block, lang, i18n) : block);

  // 7) i18n için dil bayrağını erken tanımla (deferred i18n.js okuyacak)
  out = out.replace(/(<meta charset="UTF-8" \/>)/,
    '$1\n  <script>window.__LANG__="' + lang + '";</script>');

  // Güvenlik ağı: kritik replace'ler etkisiz kaldıysa görünür uyarı ver
  if (out.indexOf('<link rel="canonical" href="' + canonical + '"') < 0) {
    console.warn("UYARI: canonical dile çevrilemedi → " + lang + "/" + file);
  }

  // 8) Gövdeyi DICT ile statik çevir — AI botları JS çalıştırmadığı için
  //    /en /de /ru sayfaların ham HTML'i de hedef dilde olmalı
  out = translateBody(out, lang, i18n);

  return out;
}

function run() {
  // 0) TR kaynak sayfalara statik SEO/AEO çıktısını işle (JSON-LD + iletişim +
  //    ürün/marka/sayaç içerikleri + hreflang) ve llms-full.txt + sitemap üret
  //    — tek kaynak: assets/config.js
  const cfg = loadConfig();
  const i18n = loadI18n();
  for (const file of PAGES) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    let html = fs.readFileSync(p, "utf8");
    const before = html;
    html = hydrateContact(html, cfg.company);
    html = hydrateExtras(html, file, cfg);
    html = injectStaticLd(html, file, cfg);
    if (html !== before) fs.writeFileSync(p, html);
  }
  writeLlmsFull(cfg);
  writeSitemap();

  let count = 0;
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const file of PAGES) {
      const src = path.join(ROOT, file);
      if (!fs.existsSync(src)) continue;
      const html = fs.readFileSync(src, "utf8");
      fs.writeFileSync(path.join(dir, file), transform(html, lang, file, i18n));
      count++;
    }
  }
  // Tüm çıktılar yazıldıktan SONRA ön-sıkıştır (dil sayfaları dahil)
  precompress();
  return count;
}

if (require.main === module) {
  const n = run();
  console.log("GESPA build: " + n + " dil sayfası üretildi (" + LANGS.join(", ") + ").");
}

module.exports = { run };
