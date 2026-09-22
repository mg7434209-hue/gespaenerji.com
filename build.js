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
const seo = require("./content/build-seo");

const ROOT = __dirname;
const ORIGIN = "https://www.gespaenerji.com";
const LANGS = ["en", "de", "ru"];
const OG_LOCALE = { en: "en_US", de: "de_DE", ru: "ru_RU" };

// Üretilecek sayfalar
const PAGES = [
  "index.html", "hizmetler.html", "urunler.html", "online-satis.html", "su-isitici.html", "hesaplayici.html",
  "projeler.html", "hakkimizda.html", "iletisim.html", "tarimsal-sulama.html",
  "ai-cankurtaran-destek-sistemi.html", "sistem-kur.html",
  "elektrikli-arac-donusum.html",
  "paket-285w.html", "paket-2x540w.html", "unv-trek-pro-2500.html", "toptan.html",
  "sepet.html"   // noindex; sitemap'e girmez (NOSITEMAP)
];

// YALNIZ TÜRKÇE yayınlanan sayfalar. Hukuken bağlayıcı metin Türkçedir;
// /en /de /ru kopyası ÜRETİLMEZ (üretilse gövde Türkçe kalır ve arama motoru
// "yanlış dilde içerik" sinyali alır). Sonuçları:
//  · dil sayfalarındaki bağlantı kök TR adresinde kalır (PAGES'te olmadığı
//    için link yerelleştirmesi bunlara DOKUNMAZ) — kırık link oluşmaz,
//  · hreflang kümesi yalnız TR + x-default içerir (kendine işaret eder),
//  · sitemap'e tek TR URL'siyle girer.
// Yeni bir yasal sayfa eklersen buraya da yaz.
const TR_ONLY = [
  "kvkk.html", "gizlilik.html", "cerez-politikasi.html",
  "mesafeli-satis-sozlesmesi.html", "iade-teslimat.html"
];

PAGES.push(...seo.pages.map(p => p.file));

// Sayfa başına dil-özel <title> ve meta description (en kritik SEO sinyalleri)
const META = {
  "index.html": {
    en: { t: "GESPA Energy — Solar Power Plants (PV) | Turnkey Solutions",
          d: "GESPA Energy: turnkey installation, engineering, financing and maintenance for rooftop and ground-mounted solar power plants (PV). Manavgat / Antalya, Türkiye." },
    de: { t: "GESPA Energy — Schlüsselfertige Solaranlagen (PV)",
          d: "GESPA Energy: schlüsselfertige Installation, Engineering, Finanzierung und Wartung für Aufdach- und Freiflächen-Solaranlagen. Manavgat / Antalya, Türkei." },
    ru: { t: "GESPA Energy — Солнечные электростанции | Решения под ключ",
          d: "GESPA Energy: монтаж под ключ, инжиниринг, финансирование и обслуживание солнечных электростанций на крыше и на земле. Манавгат / Анталья, Турция." }
  },
  "hizmetler.html": {
    en: { t: "Services — Rooftop & Ground Solar, Storage | GESPA",
          d: "Rooftop PV, ground-mounted PV, energy storage, engineering, financing and maintenance (O&M). Turnkey solar energy solutions — GESPA Energy." },
    de: { t: "Leistungen — Aufdach- & Freiflächen-PV | GESPA Energy",
          d: "Aufdach-PV, Freiflächen-PV, Energiespeicher, Engineering, Finanzierung und Wartung (O&M). Schlüsselfertige Solarlösungen — GESPA Energy." },
    ru: { t: "Услуги — солнечные станции и накопители | GESPA",
          d: "Солнечные станции на крыше и на земле, накопители энергии, инжиниринг, финансирование и обслуживание (O&M). Решения под ключ — GESPA Energy." }
  },
  "online-satis.html": {
    en: { t: "Online Store — Solar Products and Equipment | GESPA Energy",
          d: "All products on sale in one place: ready-made solar kits, MPPT charge controllers and equipment. Transparent prices, VAT included, shipping across Türkiye." },
    de: { t: "Onlineshop — Solarprodukte und Ausrüstung | GESPA Energy",
          d: "Alle Verkaufsprodukte auf einer Seite: Solar-Fertigsets, MPPT-Laderegler und Zubehör. Transparente Preise inkl. MwSt., Versand in die ganze Türkei." },
    ru: { t: "Интернет-магазин солнечного оборудования | GESPA",
          d: "Все товары в продаже на одной странице: готовые солнечные комплекты, MPPT-контроллеры и оборудование. Прозрачные цены с НДС, доставка по Турции." }
  },
  "urunler.html": {
    en: { t: "Solar Packages — Off-Grid & Irrigation | GESPA Energy",
          d: "285 W and 2×540 W solar kits for camping, caravans and cottages. Compare panels, power boxes and cables; shipping across Türkiye — GESPA Enerji." },
    de: { t: "Solar-Pakete — Off-Grid & Bewässerung | GESPA Energy",
          d: "285-W- und 2×540-W-Solarsets für Camping, Wohnmobile und Ferienhäuser. Module, Power-Box und Kabel vergleichen; Versand in die ganze Türkei." },
    ru: { t: "Солнечные пакеты — off-grid и полив | GESPA",
          d: "Комплекты 285 Вт и 2×540 Вт для кемпинга, автодомов и дач. Панели, блок питания и кабели; доставка по всей Турции." }
  },
  "elektrikli-arac-donusum.html": {
    en: { t: "Solar Conversion for EVs — BOOST MPPT | GESPA Energy",
          d: "Solar conversion for golf carts and service vehicles. MS Teknik BOOST MPPT 24–72 V: AGM, gel, lead-acid and lithium support, Bluetooth setup." },
    de: { t: "Solar-Umrüstung für E-Fahrzeuge — BOOST MPPT | GESPA",
          d: "Solar-Umrüstung für Golfcarts und Servicefahrzeuge. MS Teknik BOOST MPPT 24–72 V: AGM, Gel, Blei-Säure und Lithium, Einstellung per Bluetooth." },
    ru: { t: "Солнечное переоборудование — BOOST MPPT | GESPA",
          d: "Солнечные панели для гольф-каров и служебных машин. MS Teknik BOOST MPPT 24–72 В: AGM, гель, свинцово-кислотные и литий, настройка по Bluetooth." }
  },
  "su-isitici.html": {
    en: { t: "PV Solar Water Heater — Photovoltaic | GESPA Energy",
          d: "PV water heater that heats water directly with solar panels. Smart GF-20 controller, automatic grid backup on cloudy days, 60–200 L enamel tank." },
    de: { t: "PV-Solar-Warmwasserbereiter | GESPA Energy",
          d: "PV-Warmwasserbereiter: erwärmt Wasser direkt mit Solarmodulen. GF-20-Regler, automatische Netz-Reserve bei Bewölkung, 60–200 L Emailtank." },
    ru: { t: "PV-водонагреватель на солнечных панелях | GESPA",
          d: "PV-водонагреватель: нагревает воду напрямую солнечными панелями. Контроллер GF-20, авторезерв от сети в пасмурную погоду, бак 60–200 л." }
  },
  "unv-trek-pro-2500.html": {
    en: { t: "UNV Trek Pro 2500 W Portable Power Station | GESPA",
          d: "2500 W continuous output, 2496 Wh battery, 4 × 230 V pure sine sockets, 30 ms UPS. Portable power station for camping, caravans and home backup." },
    de: { t: "UNV Trek Pro 2500 W tragbare Powerstation | GESPA",
          d: "2500 W Dauerleistung, 2496 Wh Akku, 4 × 230 V reine Sinuswelle, USV in 30 ms. Tragbare Powerstation für Camping, Wohnmobil und Notstrom." },
    ru: { t: "UNV Trek Pro 2500 Вт — портативная станция | GESPA",
          d: "2500 Вт, АКБ 2496 Вт·ч, 4 розетки 230 В чистый синус, ИБП 30 мс. Портативная электростанция для кемпинга, автодома и резервного питания." }
  },
  "paket-285w.html": {
    en: { t: "285W Solar Panel Package — Plug-and-Play | GESPA",
          d: "Complete 285W solar kit for camping, caravans and small needs: panel + power box + cables. Runs a TV, lights and phone charging; 23–25 kg, plug-and-play." },
    de: { t: "285-W-Solarmodul-Paket — Plug-and-Play | GESPA Energy",
          d: "Komplettes 285-W-Solarset für Camping, Wohnmobil und kleine Verbraucher: Modul + Power-Box + Kabel. Betreibt TV, Licht und Handy-Ladung; 23–25 kg, Plug-and-Play." },
    ru: { t: "Пакет с панелью 285 Вт — подключи и работай | GESPA",
          d: "Полный солнечный комплект 285 Вт для кемпинга и караванов: панель + блок питания + кабели. Питает ТВ, свет и зарядку телефона; 23–25 кг." }
  },
  "paket-2x540w.html": {
    en: { t: "2×540W Solar System — LiFePO₄ Battery | GESPA Energy",
          d: "2×540W panels + LiFePO₄ power box: a complete mobile solar system that runs a fridge, TV and washing machine. About 6.5 kWh per day." },
    de: { t: "Solarsystem 2×540 W — LiFePO₄-Batterie | GESPA Energy",
          d: "2×540-W-Module + große Power-Box mit LiFePO₄-Batterie + Kabel: komplettes mobiles Solarsystem für Kühlschrank, TV, Wasch- und Spülmaschine. ~6,5 kWh Ertrag pro Tag." },
    ru: { t: "Система 2×540 Вт — батарея LiFePO₄ | GESPA",
          d: "Панели 2×540 Вт + блок питания LiFePO₄: полная мобильная система для холодильника, ТВ и стиральной машины. Около 6,5 кВт·ч в день." }
  },
  "toptan.html": {
    en: { t: "Wholesale Solar Panels, Inverters, Batteries | GESPA",
          d: "B2B wholesale: solar panels, inverters and LiFePO₄ batteries. Corporate invoicing, nationwide delivery in Türkiye, tiered pricing by quantity." },
    de: { t: "Solarmodule, Wechselrichter, Akkus — B2B | GESPA",
          d: "B2B-Großhandel: Solarmodule, Wechselrichter und LiFePO₄-Batterien. Firmenrechnung, Lieferung in die ganze Türkei, Staffelpreise nach Menge." },
    ru: { t: "Опт: панели, инверторы, АКБ — B2B | GESPA Energy",
          d: "Опт со склада: панели Arçelik 540 Вт (500 шт.), АКБ LiFePO₄ 51,2 В 100 Ач (50 шт.), инверторы. Счёт для юрлиц, доставка по всей Турции, цены по объёму." }
  },
  "sepet.html": {
    en: { t: "My Cart | GESPA Energy",
          d: "View your GESPA Energy cart: adjust quantities and complete your solar package order via WhatsApp." },
    de: { t: "Mein Warenkorb | GESPA Energy",
          d: "Ihr GESPA-Warenkorb: Mengen anpassen und die Bestellung Ihrer Solarpakete per WhatsApp abschließen." },
    ru: { t: "Моя корзина | GESPA Energy",
          d: "Корзина GESPA Energy: измените количество и завершите заказ солнечных комплектов через WhatsApp." }
  },
  "hesaplayici.html": {
    en: { t: "Solar Savings Calculator (PV) | GESPA Energy",
          d: "Free solar calculator: system size, annual yield, savings, payback period and CO₂ reduction from your bill, consumption or roof area." },
    de: { t: "Solar-Ersparnisrechner (PV) | GESPA Energy",
          d: "Kostenloser Solarrechner: Anlagengröße, Jahresertrag, Ersparnis, Amortisation und CO₂-Einsparung anhand Rechnung, Verbrauch oder Dachfläche." },
    ru: { t: "Калькулятор экономии на солнечной энергии | GESPA Energy",
          d: "Бесплатный калькулятор: мощность, годовая выработка, экономия, срок окупаемости и снижение CO₂ по счёту, потреблению или площади крыши." }
  },
  "projeler.html": {
    en: { t: "Reference Projects — Rooftop & Ground PV | GESPA Energy",
          d: "Solar power plant (PV) projects we delivered across sectors: industry, agriculture, cold storage, hotels and ground-mounted plants." },
    de: { t: "Referenzprojekte — Aufdach & Freifläche | GESPA",
          d: "Realisierte Solarkraftwerk-Projekte (PV) in verschiedenen Branchen: Industrie, Landwirtschaft, Kühlhäuser, Hotels und Freiflächenanlagen." },
    ru: { t: "Реализованные проекты — Солнечные станции | GESPA Energy",
          d: "Проекты солнечных электростанций в разных отраслях: промышленность, сельское хозяйство, холодные склады, отели и наземные станции." }
  },
  "hakkimizda.html": {
    en: { t: "About Us — Gespa Enerji Ltd. | GESPA Energy",
          d: "Gespa Enerji Ltd.; a Manavgat/Antalya-based company providing engineering and EPC services for solar power plants (PV)." },
    de: { t: "Über uns — Gespa Enerji Ltd. (GESPA Energy) | Solarlösungen",
          d: "Gespa Enerji Ltd.; ein Unternehmen mit Sitz in Manavgat/Antalya, das Engineering- und EPC-Leistungen für Solarkraftwerke (PV) anbietet." },
    ru: { t: "О нас — Gespa Enerji Ltd. (GESPA Energy) | Солнечные решения",
          d: "Gespa Enerji Ltd.; компания из Манавгата/Антальи, предоставляющая инжиниринговые и EPC-услуги для солнечных электростанций." }
  },
  "iletisim.html": {
    en: { t: "Contact — Free Site Survey & Quote | GESPA Energy",
          d: "Get in touch with GESPA Energy: +90 543 743 42 09, info@gespaenerji.com, Manavgat/Antalya. Free site survey and quote." },
    de: { t: "Kontakt — Vor-Ort-Analyse & Angebot | GESPA Energy",
          d: "Kontaktieren Sie GESPA Energy: +90 543 743 42 09, info@gespaenerji.com, Manavgat/Antalya. Kostenlose Vor-Ort-Analyse und Angebot." },
    ru: { t: "Контакты — бесплатный выезд и КП | GESPA Energy",
          d: "Свяжитесь с GESPA Energy: +90 543 743 42 09, info@gespaenerji.com, Манавгат/Анталья. Бесплатный выезд и коммерческое предложение." }
  },
  "sistem-kur.html": {
    en: { t: "System Builder — Size Your Own Solar Kit | GESPA Energy",
          d: "Pick the appliances you'll run and instantly see the required PV power, battery capacity and inverter size. Choose brands and models, then create your order." },
    de: { t: "Systemkonfigurator — Solaranlage auslegen | GESPA",
          d: "Wählen Sie Ihre Geräte und sehen Sie sofort benötigte PV-Leistung, Batteriekapazität und Wechselrichtergröße. Marken und Modelle wählen und Bestellung erstellen." },
    ru: { t: "Конфигуратор — свой солнечный комплект | GESPA",
          d: "Выберите приборы и сразу увидите нужную мощность панелей, ёмкость аккумулятора и мощность инвертора. Выберите бренды и модели и создайте заказ." }
  },
  "ai-cankurtaran-destek-sistemi.html": {
    en: { t: "AI Lifeguard Support System — Pool Safety | GESPA",
          d: "AI drowning prevention for hotel, aquapark and residential pools: 24/7 monitoring, instant location alerts to the lifeguard's smartwatch, local processing." },
    de: { t: "KI-Assistenz für Rettungsschwimmer — Poolsicherheit",
          d: "KI-gestützte Ertrinkungsprävention für Hotel- und Anlagenpools: 24/7-Überwachung, Standort-Alarm auf die Smartwatch, lokale DSGVO-konforme Verarbeitung." },
    ru: { t: "ИИ-поддержка спасателей — безопасность бассейнов",
          d: "ИИ-предотвращение утоплений в бассейнах отелей и ЖК: наблюдение 24/7, мгновенный сигнал с координатами на смарт-часы спасателя, локальная обработка." }
  },
  "mesafeli-satis-sozlesmesi.html": {
    en: { t: "Distance Sales Agreement | GESPA Energy",
          d: "Distance sales agreement under Turkish Law No. 6502: parties, product and price, payment, delivery, 14-day right of withdrawal and warranty." },
    de: { t: "Fernabsatzvertrag | GESPA Energy",
          d: "Fernabsatzvertrag nach türkischem Gesetz Nr. 6502: Parteien, Ware und Preis, Zahlung, Lieferung, 14-tägiges Widerrufsrecht und Garantie." },
    ru: { t: "Договор дистанционной купли-продажи | GESPA Energy",
          d: "Договор дистанционной продажи по закону Турции № 6502: стороны, товар и цена, оплата, доставка, право отказа 14 дней и гарантия." }
  },
  "iade-teslimat.html": {
    en: { t: "Returns, Delivery & Shipping | GESPA Energy",
          d: "Shipping across Türkiye, delivery times, damaged parcels, 14-day right of withdrawal, returns and warranty. The Turkish text is authoritative." },
    de: { t: "Rückgabe, Lieferung & Versand | GESPA Energy",
          d: "Versand in die ganze Türkei, Lieferzeiten, Transportschäden, 14-tägiges Widerrufsrecht, Rückgabe und Garantie. Verbindlich: türkischer Text." },
    ru: { t: "Возврат, доставка и отправка | GESPA Energy",
          d: "Доставка по всей Турции, сроки, повреждение посылки, право отказа 14 дней, возврат и гарантия. Юридически действителен турецкий текст." }
  },
  "kvkk.html": {
    en: { t: "Personal Data Protection (KVKK) Notice | GESPA Energy",
          d: "Privacy notice under Turkish Law No. 6698 (KVKK): data categories, purposes, legal bases and your rights. The Turkish text is authoritative." },
    de: { t: "Hinweis zum Datenschutz (KVKK) | GESPA Energy",
          d: "Datenschutzhinweis nach türkischem Gesetz Nr. 6698 (KVKK): Datenkategorien, Zwecke, Rechtsgrundlagen und Ihre Rechte. Verbindlich: türkischer Text." },
    ru: { t: "Защита персональных данных (KVKK) | GESPA Energy",
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
          d: "Cookies und ähnliche Technologien auf gespaenerji.com, einwilligungsbasierte Analyse und Verwaltung Ihrer Einstellungen. Verbindlich: türkischer Text." },
    ru: { t: "Политика cookie | GESPA Energy",
          d: "Cookie и аналогичные технологии на gespaenerji.com, аналитика по согласию и управление настройками. Юридически действителен турецкий текст." }
  },
  "tarimsal-sulama.html": {
    en: { t: "Agricultural Solar Irrigation — Pumps | GESPA Energy",
          d: "Solar agricultural irrigation: off-grid, diesel-free PV systems for submersible and surface pumps. Free site survey and diesel-saving analysis." },
    de: { t: "Solare Bewässerung — Solar-Pumpsysteme | GESPA Energy",
          d: "Solarbetriebene landwirtschaftliche Bewässerung: netzunabhängige, dieselfreie PV-Lösungen für Tauch-/Oberflächenpumpen. Manavgat/Antalya und ganz Türkei." },
    ru: { t: "Солнечное орошение — насосные системы | GESPA",
          d: "Орошение на солнечной энергии: автономные решения без дизеля для погружных/поверхностных насосов. Манавгат/Анталья и вся Турция. Бесплатный калькулятор." }
  }
};

seo.pages.forEach(p => { META[p.file] = {}; LANGS.forEach((l,i) => {
  // Meta açıklaması: seo-pages.js'te `desc` varsa O (kısa, kırpılmayan sürüm),
  // yoksa giriş paragrafı. TR kaynakla aynı kural — content/build-seo.js'e bak.
  META[p.file][l] = {t: p.title[i+1] + " | GESPA Enerji", d: (p.desc || p.intro)[i+1]};
}); });

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// Kardeş site bağlantıları (config.company.sisterSites) — footer "Kurumsal"
// sütununda GES Marketim bağlantısının ardına basılır. İşaretçi arasında
// tutulur, böylece her build'de yeniden yazılır ve çoğalmaz.
function hydrateSisterSites(html, c) {
  const sites = (c.sisterSites || []).filter(x => x && x.url && x.label);
  const block = sites.map(x =>
    '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.label) + ' \u2197</a>').join("");
  const wrapped = "<!-- SISTER:STATIC -->" + block + "<!-- /SISTER:STATIC -->";
  if (/<!-- SISTER:STATIC -->/.test(html)) {
    return html.replace(/<!-- SISTER:STATIC -->[\s\S]*?<!-- \/SISTER:STATIC -->/g, wrapped);
  }
  if (!sites.length) return html;
  // İlk kez: footer'daki GES Marketim bağlantısının HEMEN ardına ekle
  return html.replace(/(<a href="https:\/\/www\.gesmarketim\.com"[^>]*>[^<]*<\/a>)/g, "$1" + wrapped);
}

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
    "@id": c.web + "/#organization", name: c.brandName, legalName: c.legalName, url: c.web,
    telephone: c.phone && c.phone.tel, email: c.email,
    image: c.web + "/assets/img/gespa-icon.png",
    // Google bilgi paneli logoyu `image`ten DEĞİL `logo`dan okur; ikisi ayrı alandır.
    logo: { "@type": "ImageObject", url: c.web + "/assets/img/gespa-icon.png", width: 512, height: 512 },
    address: Object.assign(
      { "@type": "PostalAddress", streetAddress: c.address.line, addressLocality: c.address.district, addressRegion: c.address.city, addressCountry: c.address.country },
      c.address.postalCode ? { postalCode: c.address.postalCode } : {})
  };
  if (c.description) d.description = c.description;
  if (c.slogan) d.slogan = c.slogan;
  if (c.openingHours) d.openingHours = c.openingHours;
  if (c.priceRange) d.priceRange = c.priceRange;
  if (c.areaServed && c.areaServed.length) d.areaServed = c.areaServed;
  if (c.knowsAbout && c.knowsAbout.length) d.knowsAbout = c.knowsAbout;
  if (c.foundingYear) d.foundingDate = String(c.foundingYear);
  if (c.registry) {
    if (c.registry.taxNo) { d.taxID = c.registry.taxNo; d.vatID = c.registry.taxNo; }
    if (c.registry.mersis) d.identifier = { "@type": "PropertyValue", propertyID: "MERSIS", value: c.registry.mersis };
  }
  if (c.services && c.services.length) {
    d.hasOfferCatalog = {
      "@type": "OfferCatalog", name: "Hizmetler",
      itemListElement: c.services.map(sv => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: sv } }))
    };
  }
  if (c.rating && c.rating.value && c.rating.count) d.aggregateRating = { "@type": "AggregateRating", ratingValue: c.rating.value, reviewCount: c.rating.count };
  // sameAs = sosyal profiller + aynı firmaya ait diğer siteler. Kardeş site
  // adresleri BURAYA girer ama footer sosyal ikon şeridine girmez (orası
  // yalnız c.sameAs okur) — "🌐" ikonlu tuhaf bir sosyal bağlantı oluşmasın.
  const sa = (c.sameAs || []).concat((c.sisterSites || []).map(x => x.url)).filter(Boolean);
  if (sa.length) d.sameAs = sa;
  if (c.geo && c.geo.lat != null && c.geo.lng != null) d.geo = { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng };
  return d;
}

function heaterProductLd(cfg) {
  const prices = cfg.heater.showPrices === false ? [] : cfg.heater.models.map(m => m.price).filter(Boolean);
  const d = {
    "@context": "https://schema.org", "@type": "Product",
    name: (cfg.heater.name || "Solar Su Isıtma Sistemi") + " — Fotovoltaik Güneş Enerjili Su Isıtıcı",
    image: [
      cfg.company.web + "/assets/img/products/heater/og-su-isitici.jpg",
      cfg.company.web + "/assets/img/products/heater/tank-1.webp",
      cfg.company.web + "/assets/img/products/heater/tank-3.webp",
      cfg.company.web + "/assets/img/products/heater/tank-5.webp"
    ],
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

// urunler.html'de yalnızca bu gruplar render edilir (main.js/build.js GROUPS ile aynı).
// Şema, sayfada GÖRÜNMEYEN ürünü listelememelidir.
const URUNLER_GROUPS = ["offgrid", "irrigation", "ongrid", "accessory"];
// İndirim oranı — main.js pkgPct ile AYNI kural: ürüne `discountPct`
// yazıldıysa o, yoksa site geneli cartDiscountPct.
// Şema ve akış fiyatı TAHSİL EDİLEN para birimindedir. Kart ödemesi TRY
// çeker (server.js `pkgListTL`), site de TL gösterir; USD ürünü şemaya $
// olarak yazmak Google'da "fiyat/para birimi eşleşmiyor" ihlali doğurur.
// Yuvarlama main.js `pkgUnit()` ve server.js `pkgListTL` ile AYNIDIR.
function priceTRY(cfg, price, currency) {
  const RATE = cfg.usdTry || 0;
  return currency === "USD" ? Math.round(price * RATE / 100) * 100 : price;
}

function pctOf(cfg, p) {
  return ((p && p.discountPct != null ? p.discountPct : cfg.cartDiscountPct) || 0);
}
// Havale/EFT birim tutarı — main.js pkgUnit ile AYNI kural.
// noCartDiscount'lu üründe fiyat zaten nettir, indirim BİNMEZ.
// Fiyat notu: `freeShipping: true` üründe kargo fiyata dahildir.
// TEK KURAL — main.js `vatNote()` ile birebir aynı metinleri üretir.
function vatNote(p) {
  return p && p.freeShipping ? "KDV ve kargo dahil" : "KDV dahil · kargo hariç";
}
function shipNote(p) {
  return p && p.freeShipping
    ? "Türkiye'nin her yerine ücretsiz kargo ile gönderilir; kargo ücreti fiyata dahildir."
    : "Türkiye'nin her yerine kargo ile gönderilir.";
}
function havaleTL(p, tl, pct) {
  return p.noCartDiscount ? tl : Math.round(tl * (100 - pct) / 100 / 50) * 50;
}
function packagesItemListLd(cfg, file) {
  const COST = (cfg.calc && cfg.calc.costPerKwp) || 28000;
  const shop = file === "online-satis.html";
  const src = shop
    ? cfg.packages.filter(p => p.price != null || p.priceOnRequest)
    : cfg.packages.filter(p => URUNLER_GROUPS.indexOf(p.group || "ongrid") >= 0);
  const items = src.map(p => {
    const item = {
      "@type": "Product", name: p.name, category: p.tag, description: p.desc,
      url: cfg.company.web + (shop ? "/online-satis.html#sh-" : "/urunler.html#pkg-") + p.id
    };
    const price = p.price != null ? p.price : (p.priceOnRequest ? null : Math.round(p.kwp * COST));
    if (price != null) {
      item.offers = { "@type": "Offer", price: priceTRY(cfg, price, p.currency), priceCurrency: "TRY", availability: "https://schema.org/InStock" };
      // Kampanyalı üründe indirimli fiyatın geçerlilik sonu
      const camp = cfg.campaign || {};
      if (p.oldPrice && p.oldPrice > price && camp.endsAt && new Date(camp.endsAt) > new Date()) {
        item.offers.priceValidUntil = String(camp.endsAt).slice(0, 10);
      }
    }
    return item;
  });
  return {
    "@context": "https://schema.org", "@type": "ItemList",
    name: "GESPA Enerji Paket Ürünler",
    itemListElement: items.map((o, i) => ({ "@type": "ListItem", position: i + 1, item: o }))
  };
}

// Paket detay sayfası için Product şeması (statik; main.js data-gld görünce tekrar enjekte etmez)
function packageProductLd(cfg, p) {
  const web = cfg.company.web;
  const com = cfg.commerce || {};
  const ld = {
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, description: p.desc, category: p.tag,
    // brand = ÜRÜNÜN markası, satıcının değil. Başka bir üreticinin markalı
    // ürününü satarken config'e `brand: "UNV (Uniview)"` yazılır; yoksa GESPA.
    brand: { "@type": "Brand", name: p.brand || cfg.company.brandName },
    url: web + "/" + (p.url || "")
  };
  if (p.sku) ld.sku = p.sku;
  if (p.img) ld.image = web + "/" + p.img;
  if (p.price != null) {
    ld.offers = {
      "@type": "Offer", price: priceTRY(cfg, p.price, p.currency), priceCurrency: "TRY",
      availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: web + "/" + (p.url || ""),
      seller: { "@type": "Organization", name: cfg.company.legalName },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
        // Kargo ücreti yalnızca `freeShipping` ürünlerde BİLİNİYOR (sıfır).
        // Diğerlerinde tutar mesafeye göre değiştiği için rakam UYDURULMAZ.
        ...(p.freeShipping ? { shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "TRY" } } : {})
      }
    };
    if (com.returnDays) {
      ld.offers.hasMerchantReturnPolicy = {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: com.returnDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees"
      };
    }
  }
  return ld;
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
  const service = seo.schema(file, cfg); if (service) objs.push(service);
  // WebSite varlığı — marka adı/sitelink sinyali (yalnız ana sayfada)
  if (file === "index.html") objs.push({
    "@context": "https://schema.org", "@type": "WebSite",
    // @id + publisher @id: arama ve AI motorları siteyi ve firmayı AYNI varlık
    // olarak bağlar. Bağlanmazsa iki ayrı, zayıf düğüm olarak görülür.
    "@id": cfg.company.web + "/#website",
    name: cfg.company.brandName, alternateName: cfg.company.legalName,
    url: cfg.company.web + "/", inLanguage: ["tr", "en", "de", "ru"],
    publisher: { "@id": cfg.company.web + "/#organization" }
  });
  if (file === "su-isitici.html") objs.push(heaterProductLd(cfg));
  if (file === "urunler.html" || file === "online-satis.html") objs.push(packagesItemListLd(cfg, file));
  if (file === "ai-cankurtaran-destek-sistemi.html") objs.push(cankurtaranProductLd(cfg));
  if (file === "hesaplayici.html") objs.push(webAppLd(cfg));
  // Ürün detay sayfası — dosya adına değil, data-pkg-detail işaretine bakılır
  if (cfg.packages && /data-pkg-detail="/.test(html)) {
    const id = (html.match(/data-pkg-detail="([^"]+)"/) || [])[1];
    const p = cfg.packages.filter(x => x.id === id)[0];
    if (p) objs.push(packageProductLd(cfg, p));
  }
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
  seo.translations(sandbox.GESPA.i18nData);
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
  const yearSuffix = {en: ' years', de: ' Jahre', ru: ' лет'}[lang];
  body = body.replace(/data-suffix=" yıl"/g, 'data-suffix="' + yearSuffix + '"');
  body = body.replace(/>([\d–-]+) yıl</g, (_, n) => '>' + n + yearSuffix + '<');
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
  // data-cfg-text — config kökünden noktalı yol (yasal sayfalardaki süreler vb.)
  html = html.replace(/(<(?:span|strong|b)\b[^>]*data-cfg-text="([^"]+)"[^>]*>)([\s\S]*?)(<\/(?:span|strong|b)>)/g,
    (m, open_, path, val, close) => {
      const v = path.split(".").reduce((o, k) => (o == null ? o : o[k]), cfg);
      return v == null ? m : open_ + esc(String(v)) + close;
    });
  // Marka vitrinleri
  const brandSpans = arr => arr.map(n => "<span>" + esc(n) + "</span>").join("");
  const brandAll = [];
  ["panel", "inverter", "mppt", "battery"].forEach(g => (cfg.brands[g] || []).forEach(n => { if (!brandAll.includes(n)) brandAll.push(n); }));
  const fillBrands = (id, arr) => {
    html = html.replace(new RegExp('(<div class="trust-logos" id="' + id + '">)[\\s\\S]*?(</div>)'), "$1" + brandSpans(arr || []) + "$2");
  };
  fillBrands("brandPanels", cfg.brands.panel);
  fillBrands("brandInverters", cfg.brands.inverter);
  fillBrands("brandMppt", cfg.brands.mppt);
  fillBrands("brandBatteries", cfg.brands.battery);
  fillBrands("brandAll", brandAll);
  // Hesaplayıcı varsayımları + bölge/yön seçenekleri
  // NOT: değer "$2.200" gibi $ içerebilir — replace'in $1/$2 desenine yem olmasın diye
  // fonksiyon biçimi kullanılır.
  const setSpan = (id, v) => {
    html = html.replace(new RegExp('(<[^>]*id="' + id + '"[^>]*>)[^<]*(</)'), (m, open, close) => open + v + close);
  };
  // id'si olmayan alanlar için: data-* işaretini taşıyan etiketin metnini yaz
  const setMark = (attr, v) => {
    html = html.replace(new RegExp('(<[^>]*\\b' + attr + '\\b[^>]*>)[^<]*(</)'), (m, open, close) => open + v + close);
  };
  // Online satış kataloğu — JS'siz ortam/AI botları için statik ürün listesi
  if (file === "online-satis.html" && cfg.packages) {
    const RATE = cfg.usdTry || 0;
    const rows = cfg.packages.filter(p => p.price != null || p.priceOnRequest).map(p => {
      const PCT = pctOf(cfg, p);                       // ürüne özel oran
      const tl = p.currency === "USD" ? Math.round(p.price * RATE / 100) * 100 : p.price;
      const usd = p.currency === "USD" ? p.price : (RATE ? Math.round(p.price / RATE) : 0);
      const hav = havaleTL(p, tl, PCT);
      const oldTL = p.oldPrice && (p.currency === "USD" ? Math.round(p.oldPrice * RATE / 100) * 100 : p.oldPrice);
      const camp = cfg.campaign || {};
      const onSale = oldTL && oldTL > tl && camp.endsAt && new Date(camp.endsAt) > new Date();
      // priceOnRequest: fiyat girilmemis urun — rakam yerine "Teklif alin"
      const poa = p.price == null;
      return '<article class="sh-card"><div class="sh-body">' +
        "<h3>" + (p.url ? '<a href="' + esc(p.url) + '">' + esc(p.name) + "</a>" : esc(p.name)) + "</h3>" +
        (p.for ? '<p class="sh-for">' + esc(p.for) + "</p>" : "") +
        (poa
          ? '<div class="sh-price"><strong class="sh-poa"><span>Teklif alın</span></strong></div>' +
            '<p class="sh-vat"><span>Güncel fiyat için bize ulaşın</span></p>'
          : '<div class="sh-price"><strong>₺' + nfTr(tl) + "</strong>" +
            (onSale ? '<s class="sh-old">₺' + nfTr(oldTL) + "</s>" : "") +
            (usd ? '<span class="sh-usd">≈ $' + nfTr(usd) + "</span>" : "") + "</div>" +
          (PCT && hav < tl ? '<p class="sh-hav">💰 <span>Havale/EFT ile:</span> <b>₺' + nfTr(hav) + "</b></p>" : "") +
          '<p class="sh-vat"><span>' + vatNote(p) + '</span></p>') +
        "</div></article>";
    }).join("");
    html = html.replace(/<!-- SHOP:STATIC -->[\s\S]*?<!-- \/SHOP:STATIC -->/,
      "<!-- SHOP:STATIC -->" + rows + "<!-- /SHOP:STATIC -->");
  }
  // Paket detay sayfası (paket-*.html) — fiyat/ürün kodu/stok/kargo statik basılır.
  // AI botları JS çalıştırmaz; main.js aynı değerleri istemcide tazeler.
  const pkgId = (html.match(/data-pkg-detail="([^"]+)"/) || [])[1];
  if (pkgId && cfg.packages) {
    const p = cfg.packages.filter(x => x.id === pkgId)[0];
    if (p && p.price != null) {
      const RATE = cfg.usdTry || 0, PCT = pctOf(cfg, p);
      const tl = p.currency === "USD" ? Math.round(p.price * RATE / 100) * 100 : p.price;
      const usd = p.currency === "USD" ? p.price : (RATE ? Math.round(p.price / RATE) : 0);
      setSpan("pkgPrice", "₺" + nfTr(tl));
      setSpan("pkgAlt", usd ? "≈ $" + nfTr(usd) : "");
      setSpan("pkgHavale", "₺" + nfTr(havaleTL(p, tl, PCT)));
      if (p.sku) setSpan("pkgSku", esc(p.sku));
    }
    const com = cfg.commerce || {};
    // Ürüne `stock` yazılmışsa GERÇEK adet gösterilir (az kalanda "Son N adet");
    // yazılmamışsa commerce.stockLabel genel rozeti kullanılır.
    const st = p && p.stock;
    if (st === 0) setSpan("pkgStock", "Tükendi");
    else if (st != null && st <= 3) setSpan("pkgStock", "Son " + st + " adet");
    // 3'ten fazlada sayı yazmak yerine çevrilebilir genel rozet basılır
    // (istemci tam adedi gösterir; DICT sayı içeren metni eşleyemez).
    else if (st != null) setSpan("pkgStock", esc(com.stockLabel || "Stokta"));
    else if (com.stockLabel) setSpan("pkgStock", esc(com.stockLabel));
    if (com.shipDays) setSpan("shipDays", esc(com.shipDays));
    if (com.returnDays) setSpan("returnDays", String(com.returnDays));
    // Kargo alıcıya mı ait? config'teki freeShipping tek kaynaktır.
    setMark("data-pkg-vat", p && p.freeShipping ? "KDV ve kargo dahil fiyattır." : "KDV dahil fiyattır.");
    setMark("data-pkg-ship", shipNote(p));
  }
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
  // AI Cankurtaran — aylık çapa rakam ve lansman kontenjanı (config.pool)
  if (file === "ai-cankurtaran-destek-sistemi.html" && cfg.pool) {
    const pl = cfg.pool;
    const monthly = nfTr(pl.monthlyFrom) + " " + (pl.monthlyCurrency || "USD");
    setSpan("poolMonthly", monthly);
    setSpan("poolMonthlyFaq", monthly);
    setSpan("poolMonthlyFaq2", monthly);
    setSpan("poolSlots", String(pl.launchSlots));
    setSpan("poolLaunchYear", String(pl.launchYear));
    setSpan("poolNextSeason", String(pl.nextSeason));
  }
  // Su ısıtıcı model tablosu + başlangıç fiyatı
  if (file === "su-isitici.html" && cfg.heater) {
    const showPrice = cfg.heater.showPrices !== false;
    const rows = cfg.heater.models.map(m =>
      "<tr><td>" + m.cap + " L</td><td>" + m.mount + "</td><td>" + (m.pv != null ? m.pv + " W" : "—") + "</td><td>" + (m.dim || "—") +
      "</td><td>" + (m.ac != null ? m.ac + " kW" : "—") + "</td><td>Emaye</td><td>" +
      (showPrice && m.price ? '<span class="spec-price">₺' + nfTr(m.price) + "</span>" : '<a href="iletisim.html" class="spec-quote">Teklif alın</a>') + "</td></tr>"
    ).join("");
    html = html.replace(/(<tbody id="heaterRows">)[\s\S]*?(<\/tbody>)/, "$1" + rows + "$2");
    const prices = showPrice ? cfg.heater.models.map(m => m.price).filter(Boolean) : [];
    setSpan("heaterFrom", prices.length
      ? "₺" + nfTr(Math.min.apply(null, prices)) + "'dan başlayan fiyatlarla"
      : "Güncel fiyat için bize ulaşın");
  }
  // Toptan (B2B) — stok kartları ve koşullar config.b2b'den STATİK basılır
  // (fiyat yazılmaz; adet kutusu ve WhatsApp mesajını main.js canlandırır)
  if (file === "toptan.html" && cfg.b2b) {
    const wa = cfg.company.phone.wa;
    const cards = (cfg.b2b.products || []).map(p => {
      // sayı ayrı düğümde kalır ki "adet stokta" DICT ile statik çevrilebilsin
      const stok = p.stock != null
        ? '<span class="b2b-stock">✅ ' + nfTr(p.stock) + " <b>" + esc(p.unit || "adet") + " stokta</b></span>"
        : '<span class="b2b-stock b2b-ask">Stok için sorunuz</span>';
      const specs = (p.specs || []).map(x => "<li>" + esc(x) + "</li>").join("");
      const msg = "Merhaba, toptan teklif istiyorum: " + p.name + " × 10 " + (p.unit || "adet") + ".";
      return '<article class="b2b-card reveal" data-b2b="' + p.id + '">' +
        '<div class="b2b-head"><span class="b2b-ico" aria-hidden="true">' + (p.icon || "📦") + "</span>" + stok + "</div>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<ul class="ticks">' + specs + "</ul>" +
        '<div class="b2b-qty"><label>Adet</label>' +
          '<div class="qbox"><button type="button" data-q="-1" aria-label="Adet azalt">−</button>' +
          '<input type="text" inputmode="numeric" value="10" aria-label="Adet" />' +
          '<button type="button" data-q="1" aria-label="Adet artır">+</button></div></div>' +
        '<a class="btn btn-block b2b-cta" href="https://wa.me/' + wa + "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener">📲 Toptan teklif iste</a>' +
        '<p class="b2b-note">Fiyat, sipariş adedine göre teklifle bildirilir.</p>' +
      "</article>";
    }).join("");
    const marker = /<!-- B2B:STATIC -->[\s\S]*?<!-- \/B2B:STATIC -->/;
    if (marker.test(html)) html = html.replace(marker, () => "<!-- B2B:STATIC -->" + cards + "<!-- /B2B:STATIC -->");
    const terms = (cfg.b2b.terms || []).map(x => "<li>" + esc(x) + "</li>").join("");
    html = html.replace(/(<ul class="ticks" id="b2bTerms">)[\s\S]*?(<\/ul>)/, (m, a, b) => a + terms + b);
  }
  // Paket kataloğu — kompakt statik liste (main.js istemcide tam kartlarla değiştirir)
  if (file === "urunler.html" && cfg.packages) {
    const GROUPS = [
      { id: "offgrid", title: "Taşınabilir & Off-Grid Paketler" },
      { id: "irrigation", title: "Tarımsal Sulama Paketleri" },
      { id: "ongrid", title: "Çatı / On-Grid Paketler" },
      { id: "accessory", title: "Elektrikli Araç Dönüşüm Ürünleri" }
    ];
    const COST = cfg.calc.costPerKwp;
    const RATE = cfg.usdTry || 0;
    let staticList = "";
    for (const g of GROUPS) {
      const items = cfg.packages.filter(p => (p.group || "ongrid") === g.id);
      if (!items.length) continue;
      staticList += '<div class="pkg-group"><div class="pkg-group-head"><h2>' + g.title + "</h2></div><ul class=\"ticks\">" +
        items.map(p => {
          // priceOnRequest (ya da kWp'siz fiyatsız ürün): rakam ÜRETİLMEZ
          const poa = p.price == null && (p.priceOnRequest || !p.kwp);
          const PCT = pctOf(cfg, p);                   // ürüne özel oran
          const price = p.price != null ? p.price : (poa ? null : Math.round(p.kwp * COST));
          // Vitrin kartıyla AYNI gösterim: ana fiyat ₺, yanında ≈$, altında havale/EFT tutarı
          const tl = poa ? null : (p.currency === "USD" ? Math.round(price * RATE / 100) * 100 : price);
          const usd = poa ? 0 : (p.currency === "USD" ? price : (RATE ? Math.round(price / RATE) : 0));
          const hav = poa ? null : havaleTL(p, tl, PCT);
          const priceTxt = poa
            ? "<span>Teklif alın</span>"
            : "₺" + nfTr(tl) + (usd ? " (≈ $" + nfTr(usd) + ")" : "") +
              (p.price != null
                ? (PCT && hav < tl ? " <span>liste</span> · <span>havale/EFT ile</span> ₺" + nfTr(hav) + " (%" + PCT + " <span>indirimli, KDV dahil</span>)" : " (<span>KDV dahil</span>)")
                : " (yaklaşık)");
          const lead = p.kwp ? p.kwp + " kWp" : (p.sku || "");
          return "<li><strong>" + esc(p.name) + "</strong> — " + (lead ? esc(lead) + " · " : "") +
            "<span>" + esc(p.for) + "</span> · " +
            priceTxt + ". <span>" + esc(p.desc) + "</span></li>";
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
  // TR_ONLY sayfasının başka dilde sürümü YOKTUR — var gibi göstermek
  // Search Console'da "hreflang karşılıklı değil" hatası üretir.
  const hrefLangs = TR_ONLY.includes(file) ? ["tr"] : ["tr", ...LANGS];
  const cluster = hrefLangs.map(l => '  <link rel="alternate" hreflang="' + l + '" href="' + urlFor(l) + '" />').join("\n")
    + '\n  <link rel="alternate" hreflang="x-default" href="' + urlFor("tr") + '" />';
  html = html.replace(/(<link rel="canonical"[^>]*\/>)/, "$1\n" + cluster);
  return html;
}

// ---- sitemap.xml üretimi: TR + tüm dil sayfaları ayrı <url> girdileriyle ----
const PRIORITY = {
  "index.html": "1.0", "hizmetler.html": "0.9", "urunler.html": "0.9", "online-satis.html": "0.9",
  "ai-cankurtaran-destek-sistemi.html": "0.9", "su-isitici.html": "0.8",
  "tarimsal-sulama.html": "0.9", "hesaplayici.html": "0.8", "projeler.html": "0.7",
  "hakkimizda.html": "0.6", "iletisim.html": "0.8",
  "elektrikli-arac-donusum.html": "0.8", "unv-trek-pro-2500.html": "0.8",
  "kvkk.html": "0.3", "gizlilik.html": "0.3", "cerez-politikasi.html": "0.3",
  "mesafeli-satis-sozlesmesi.html": "0.4", "iade-teslimat.html": "0.4"
};
function writeSitemap() {
  const urlFor = (l, file) => l === "tr" ? ORIGIN + "/" + (file === "index.html" ? "" : file) : ORIGIN + "/" + l + "/" + (file === "index.html" ? "" : file);
  const entries = [];
  const NOSITEMAP = { "sepet.html": 1 };   // noindex sayfalar haritaya girmez
  for (const file of PAGES.concat(TR_ONLY)) {
    if (NOSITEMAP[file]) continue;
    const trOnly = TR_ONLY.includes(file);
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    let lastmod;
    try {
      lastmod = require("child_process").execSync(
        'git log -1 --format=%cI -- "' + file + '"', { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }
      ).toString().trim().slice(0, 10);
    } catch (e) { /* git yoksa mtime */ }
    if (!lastmod) lastmod = fs.statSync(p).mtime.toISOString().slice(0, 10);
    const smLangs = trOnly ? ["tr"] : ["tr", ...LANGS];
    const cluster = smLangs.map(l => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + urlFor(l, file) + '" />').join("\n")
      + '\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlFor("tr", file) + '" />';
    for (const l of smLangs) {
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
// ---- Ürün akışı (urunler.xml) --------------------------------------------
// Google Merchant Center biçiminde RSS 2.0 akışı. iyzico'nun "XML ile
// Ürünlerinizi Yükleyin" alanı, Google Shopping ve Meta katalogları da
// AYNI biçimi okur. Kaynak yine config.packages — elle liste tutulmaz.
// Fiyat LİSTE fiyatıdır (KDV dahil); havale/EFT indirimi bir ÖDEME YÖNTEMİ
// indirimi olduğu için akışa girmez, yoksa kartla ödeyen yanılır.
function writeProductFeed(cfg) {
  const c = cfg.company, web = c.web, RATE = cfg.usdTry || 0;
  const items = (cfg.packages || []).filter(p => p.price != null && p.img).map(p => {
    const tl = p.currency === "USD" ? Math.round(p.price * RATE / 100) * 100 : p.price;
    // Kendi sayfası olmayan ürün katalogda satılır — iniş sayfası orası.
    const link = web + "/" + (p.url || "online-satis.html");
    const avail = p.stock === 0 ? "out of stock" : "in stock";
    const desc = (p.desc || p.for || p.name || "").replace(/\s+/g, " ").trim().slice(0, 4900);
    const L = [];
    L.push("    <item>");
    L.push("      <g:id>" + esc(p.id) + "</g:id>");
    L.push("      <g:title>" + esc(String(p.name).slice(0, 150)) + "</g:title>");
    L.push("      <g:description>" + esc(desc) + "</g:description>");
    L.push("      <g:link>" + esc(link) + "</g:link>");
    L.push("      <g:image_link>" + esc(web + "/" + p.img) + "</g:image_link>");
    L.push("      <g:availability>" + avail + "</g:availability>");
    L.push("      <g:price>" + tl.toFixed(2) + " TRY</g:price>");
    L.push("      <g:brand>" + esc(p.brand || c.brandName) + "</g:brand>");
    L.push("      <g:condition>new</g:condition>");
    // Ürünlerde barkod (GTIN) yok; kendi stok kodumuz MPN olarak verilir.
    // Hiçbiri yoksa identifier_exists=no ZORUNLUDUR, yoksa akış reddedilir.
    if (p.sku) L.push("      <g:mpn>" + esc(p.sku) + "</g:mpn>");
    else L.push("      <g:identifier_exists>no</g:identifier_exists>");
    if (p.tag) L.push("      <g:product_type>" + esc(p.tag) + "</g:product_type>");
    // Kargo YALNIZ Türkiye'ye yapılır; ülke kısıtı akışta da belirtilir ki
    // Merchant Center ürünü göndermediğimiz ülkelerde listelemesin.
    // Ücret SADECE kargosu fiyata dahil üründe yazılır (0 TRY) — diğerlerinde
    // tutar mesafeye göre değiştiği için rakam UYDURULMAZ, hesap düzeyindeki
    // kargo ayarı geçerli olur.
    L.push("      <g:shipping>");
    L.push("        <g:country>TR</g:country>");
    if (p.freeShipping) L.push("        <g:price>0.00 TRY</g:price>");
    L.push("      </g:shipping>");
    L.push("    </item>");
    return L.join("\n");
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n'
    + "  <channel>\n"
    + "    <title>" + esc(c.brandName) + " — Ürün Listesi</title>\n"
    + "    <link>" + esc(web) + "</link>\n"
    + "    <description>" + esc(c.description || c.slogan || "") + "</description>\n"
    + items.join("\n") + "\n"
    + "  </channel>\n</rss>\n";
  fs.writeFileSync(path.join(ROOT, "urunler.xml"), xml);
  console.log("urunler.xml: " + items.length + " ürün (Merchant Center biçimi)");
  return items.length;
}

function writeLlmsFull(cfg) {
  const nf = n => new Intl.NumberFormat("tr-TR").format(Math.round(n));
  const COST = cfg.calc.costPerKwp;
  const RATE = cfg.usdTry || 0;
  const pkgLines = cfg.packages.map(p => {
    const PCT = pctOf(cfg, p);                         // ürüne özel oran
    // priceOnRequest (ya da kWp'siz fiyatsız ürün): rakam ÜRETİLMEZ
    const poa = p.price == null && (p.priceOnRequest || !p.kwp);
    const lead = p.kwp ? `${p.kwp} kWp · ` : (p.sku ? `${p.sku} · ` : "");
    if (poa) return `- ${p.name} — ${lead}${p.for} · fiyat için teklif alın`;
    const price = p.price != null ? p.price : Math.round(p.kwp * COST);
    const tl = p.currency === "USD" ? Math.round(price * RATE / 100) * 100 : price;
    const usd = p.currency === "USD" ? price : (RATE ? Math.round(price / RATE) : 0);
    const hav = havaleTL(p, tl, PCT);
    const tag = p.price != null
      ? (PCT && hav < tl ? ` liste (KDV dahil) · havale/EFT ile ₺${nf(hav)} (%${PCT} indirimli)` : " (KDV dahil, net fiyat)")
      : " (yaklaşık, keşifle netleşir)";
    const ship = p.freeShipping ? " · kargo fiyata DAHİL" : "";
    return `- ${p.name} — ${lead}${p.for} · ₺${nf(tl)}${usd ? ` (≈ $${nf(usd)})` : ""}${tag}${ship}`;
  }).join("\n");
  const showHeaterPrice = cfg.heater.showPrices !== false;
  const heaterLines = cfg.heater.models.map(m =>
    `- ${m.cap} L (${m.mount}${m.pv ? ", " + m.pv + " W panel" : ""}): ${showHeaterPrice && m.price ? "₺" + nf(m.price) : "fiyat için teklif alın"}`
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

Cankurtaran sayısı mevzuatla belirlenir; sistem personel AZALTMAZ, mevcut kadroyu güçlendirir
(karşılaştırma, özen yükümlülüğü kayıtları ve SSS ayrıntıları sayfadadır).

### Solar Su Isıtma Sistemi — PV su ısıtıcı (${c.web}/su-isitici.html)
Monokristal panellerle suyu doğrudan güneş enerjisiyle ısıtır; bulutlu havada
otomatik şebeke (AC) desteğine geçer. Emaye iç tank, akıllı GF-20 kontrol.
Modeller ve fiyatlar (KDV dahil, ₺):
${heaterLines}

## Paket Ürünler (${c.web}/urunler.html)
Markalar — panel: ${cfg.brands.panel.join(", ")} · inverter: ${cfg.brands.inverter.join(", ")} · MPPT/DC-DC: ${(cfg.brands.mppt || []).join(", ")} · akü: ${(cfg.brands.battery || []).join(", ")}
${pkgLines}
Kargo & iade: Paketler TÜRKİYE'NİN HER İLİNE anlaşmalı kargo ile gönderilir (teslimat
Antalya ile sınırlı değildir). Sipariş onayından sonra tahmini teslim ${(cfg.commerce || {}).shipDays || "2–5"} iş günü;
kargo ücreti alıcıya aittir (yukarıda "kargo fiyata DAHİL" yazan ürünler hariç),
fiyatlara KDV dahildir. Mesafeli satışta ${(cfg.commerce || {}).returnDays || 14} gün cayma
hakkı vardır (sorunsuz teslimde iade kargosu alıcıya ait; hasarlı/ayıplı üründe satıcıya).
Antalya bölgesinde isteğe bağlı yerinde kurulum ve kullanım eğitimi verilir.
Ödeme: havale/EFT'te indirim uygulanır (oran ürüne göre değişir; her ürünün indirimli tutarı yukarıdaki listede yazılıdır). Kart ve kapıda ödemede indirim UYGULANMAZ, liste fiyatı geçerlidir. Kapıda ödeme: %30 peşin + %70 teslimatta.

## Toptan Satış / B2B (${c.web}/toptan.html)
Bayi, EPC/kurulumcu, toptancı, otel ve kooperatiflere kurumsal faturalı toptan satış. Hazır stok:
${(cfg.b2b && cfg.b2b.products || []).map(p =>
  `- ${p.name}${p.stock != null ? ` — ${nf(p.stock)} ${p.unit || "adet"} hazır stokta` : " — model ve stok teklifle bildirilir"}. ${(p.specs || []).join(" · ")}`
).join("\n")}
Toptan fiyat YAYIMLANMAZ; sipariş adedine göre kademeli fiyat aynı gün proforma teklifle
bildirilir (WhatsApp/form). Ödeme proforma ile havale/EFT; Türkiye'nin her iline nakliye.

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
  const c0 = cfg.company;
  const summary = `# ${c0.brandName}

> ${c0.description}

## İletişim
- Unvan: ${c0.legalName}
- Telefon: ${c0.phone.display}
- E-posta: ${c0.email}
- Adres: ${c0.address.full}
- Web: ${c0.web}

## Hizmet bölgesi
${c0.areaServed.join(", ")}; talebe göre tüm Türkiye.

## Hizmetler ve referanslar
${seo.pages.map(p => "- [" + p.title[0] + "](" + c0.web + "/" + p.file + ")").join("\n")}

## Ürünler ve araçlar
- [Ürünler](${c0.web}/urunler.html)
- [Tarımsal sulama](${c0.web}/tarimsal-sulama.html)
- [Tasarruf hesaplayıcı](${c0.web}/hesaplayici.html)
- [Sistem Kurucu](${c0.web}/sistem-kur.html)
- [AI Cankurtaran](${c0.web}/ai-cankurtaran-destek-sistemi.html)
- [PV su ısıtıcı](${c0.web}/su-isitici.html)
- [Elektrikli araç güneş dönüşümü](${c0.web}/elektrikli-arac-donusum.html)
- [Güncel ürün bilgileri ve fiyatlar](${c0.web}/llms-full.txt)

## Languages
Turkish: ${c0.web}/ · English: ${c0.web}/en/ · German: ${c0.web}/de/ · Russian: ${c0.web}/ru/
`;
  fs.writeFileSync(path.join(ROOT, "llms.txt"), summary);
}

function transform(html, lang, file, i18n) {
  const m = META[file] && META[file][lang];
  const canonical = ORIGIN + "/" + lang + "/" + (file === "index.html" ? "" : file);
  let out = html;

  // 1) <html lang="tr"> -> hedef dil
  out = out.replace(/<html lang="tr"/, '<html lang="' + lang + '"');

  // 2) Göreli "assets/..." referanslarını mutlak "/assets/..." yap (alt dizinde de çözülsün)
  //    href/src + <picture><source srcset> dahil
  out = out.replace(/(href|src|poster)="assets\//g, '$1="/assets/');
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

  out = out.replace(/href="(\/?)([a-z0-9-]+\.html)([?#][^"]*)?"/g, (match, slash, target, suffix) =>
    PAGES.includes(target) ? 'href="/' + lang + '/' + (target === 'index.html' ? '' : target) + (suffix || '') + '"' : match);
  // Translate structured text and page URLs, keeping the shared company identity stable.
  out = out.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (match, open, json, close) => {
    const d = i18n.DICT[lang] || {};
    function localize(value, key) {
      if (Array.isArray(value)) return value.map(v => localize(v, key));
      if (value && typeof value === 'object') {
        if (value['@type'] === 'LocalBusiness') return value;
        return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, localize(v,k)]));
      }
      if (typeof value !== 'string') return value;
      if (key === 'inLanguage' && value === 'tr') return lang;
      if (['name','description','text','serviceType'].includes(key)) return d[value] || value;
      if (['url','item','@id'].includes(key) && value.startsWith(ORIGIN + '/')) {
        const rel = value.slice(ORIGIN.length + 1); const f = rel.split(/[?#]/)[0];
        if (PAGES.includes(f)) return ORIGIN + '/' + lang + '/' + rel;
        if (rel === '') return ORIGIN + '/' + lang + '/';
      }
      return value;
    }
    try { return open + JSON.stringify(localize(JSON.parse(json))) + close; } catch(e) { throw new Error('Invalid JSON-LD in ' + file + ': ' + e.message); }
  });
  return out;
}

function run() {
  // 0) TR kaynak sayfalara statik SEO/AEO çıktısını işle (JSON-LD + iletişim +
  //    ürün/marka/sayaç içerikleri + hreflang) ve llms-full.txt + sitemap üret
  //    — tek kaynak: assets/config.js
  seo.generate(ROOT);
  const cfg = loadConfig();
  const i18n = loadI18n();
  // TR kaynak sayfaları: TR_ONLY olanlar da işlenir (iletişim alanları, JSON-LD
  // ve hreflang kümesi burada basılır). Dil kopyası üretimi bunları KAPSAMAZ.
  for (const file of PAGES.concat(TR_ONLY)) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    let html = fs.readFileSync(p, "utf8");
    const before = html;
    html = hydrateContact(html, cfg.company);
    html = hydrateSisterSites(html, cfg.company);
    html = hydrateExtras(html, file, cfg);
    html = injectStaticLd(html, file, cfg);
    if (html !== before) fs.writeFileSync(p, html);
  }
  writeLlmsFull(cfg);
  writeProductFeed(cfg);
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
