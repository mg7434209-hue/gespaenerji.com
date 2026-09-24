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
const HELP = require("./content/sss");          // SSS merkezi (sss.html)
const GLOSSARY = require("./content/sozluk");   // GES sözlüğü (sozluk.html)

const ROOT = __dirname;
const ORIGIN = "https://www.gespaenerji.com";
const LANGS = ["en", "de", "ru"];
const OG_LOCALE = { en: "en_US", de: "de_DE", ru: "ru_RU" };
const OG_ALL = { tr: "tr_TR", en: "en_US", de: "de_DE", ru: "ru_RU" };

// Üretilecek sayfalar
const PAGES = [
  "index.html", "hizmetler.html", "urunler.html", "online-satis.html", "su-isitici.html", "hesaplayici.html",
  "projeler.html", "hakkimizda.html", "iletisim.html", "tarimsal-sulama.html",
  "ai-cankurtaran-destek-sistemi.html", "sistem-kur.html",
  "elektrikli-arac-donusum.html",
  "paket-285w.html", "paket-2x540w.html", "unv-trek-pro-2500.html", "toptan.html",
  "paket-motor-yolcu.html", "paket-motor-kargo.html",
  "aku-lifepo4-72v-30ah.html",
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
// Türk mevzuatını anlatan REHBER sayfaları da yalnız Türkçedir (<main
// data-article>): içerik Türkiye'deki aboneye yöneliktir, çevirisi yayımlanmaz.
// Bu sayfalara diğer sayfalardan verilen bağlantılar <!-- TR:ONLY --> …
// <!-- /TR:ONLY --> arasına yazılır; transform() dil kopyasında o bloğu siler.
const TR_ONLY = [
  "kvkk.html", "gizlilik.html", "cerez-politikasi.html",
  "mesafeli-satis-sozlesmesi.html", "iade-teslimat.html",
  "gunes-paneli-kacak-elektrik-cezasi.html"
];
// Mevzuat rehberi — footer "Kurumsal" sütununda yalnız TR sayfalarda görünür
const GUIDE = { file: "gunes-paneli-kacak-elektrik-cezasi.html", label: "Güneş Paneli Cezası Rehberi" };
const TR_ONLY_RE = /<!-- TR:ONLY -->[\s\S]*?<!-- \/TR:ONLY -->/g;

PAGES.push(...seo.pages.map(p => p.file));
// Yardım sayfaları EN SONDA: sss.html diğer sayfaların güncel SSS'lerini
// diskten toplar; o sayfalar bu döngüde önce işlenmiş olmalı.
PAGES.push("sozluk.html", "sss.html");

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
  "paket-motor-yolcu.html": {
    en: { t: "Passenger E-Trike Solar Set — 285 W | GESPA Energy",
          d: "Complete solar set for enclosed passenger e-trikes: 285 W TOPCon panel, BOOST MPPT 24–72 V charge controller, solar cable and MC4. No guessing which part fits." },
    de: { t: "Solar-Set für Fahrgast-Dreirad — 285 W | GESPA Energy",
          d: "Komplettset für geschlossene Fahrgast-Dreiräder: 285-W-TOPCon-Modul, BOOST MPPT 24–72 V Laderegler, Solarkabel und MC4. Kein Rätselraten, welches Teil passt." },
    ru: { t: "Солнечный комплект для пассажирского трицикла — 285 Вт | GESPA",
          d: "Готовый комплект для закрытых пассажирских трициклов: панель 285 Вт TOPCon, контроллер BOOST MPPT 24–72 В, кабель и MC4." }
  },
  "paket-motor-kargo.html": {
    en: { t: "Cargo E-Trike Solar Set — 655 W | GESPA Energy",
          d: "Complete solar set for cargo-bed e-trikes: 655 W N-type TOPCon panel, BOOST MPPT 24–72 V charge controller, solar cable and MC4. The most output a wide roof can carry." },
    de: { t: "Solar-Set für Lasten-Dreirad — 655 W | GESPA Energy",
          d: "Komplettset für Lasten-Dreiräder: 655-W-N-Type-TOPCon-Modul, BOOST MPPT 24–72 V Laderegler, Solarkabel und MC4. Maximaler Ertrag für große Dachflächen." },
    ru: { t: "Солнечный комплект для грузового трицикла — 655 Вт | GESPA",
          d: "Готовый комплект для грузовых трициклов: панель 655 Вт N-type TOPCon, контроллер BOOST MPPT 24–72 В, кабель и MC4." }
  },
  "sss.html": {
    en: { t: "Frequently Asked Questions — Solar Power, Orders and Installation | GESPA Energy",
          d: "Answers about solar power plants, batteries, EV solar conversion, ordering, shipping, payment and installation in one place. GESPA Energy, Manavgat / Antalya." },
    de: { t: "Häufige Fragen — Solarenergie, Bestellung und Montage | GESPA Energy",
          d: "Antworten zu Solaranlagen, Akkus, Solarumrüstung von E-Fahrzeugen, Bestellung, Versand, Zahlung und Montage an einem Ort. GESPA Energy, Manavgat / Antalya." },
    ru: { t: "Частые вопросы — солнечная энергия, заказ и монтаж | GESPA",
          d: "Ответы о солнечных станциях, аккумуляторах, солнечном переоснащении электротранспорта, заказе, доставке, оплате и монтаже в одном месте." }
  },
  "sozluk.html": {
    en: { t: "Solar Glossary — PV, Battery and Inverter Terms Explained | GESPA Energy",
          d: "kWp, MPPT, TOPCon, LiFePO₄, DoD, net metering and more: short, plain-language explanations of solar, battery and EV conversion terms." },
    de: { t: "Solar-Glossar — Begriffe zu PV, Akku und Wechselrichter | GESPA Energy",
          d: "kWp, MPPT, TOPCon, LiFePO₄, DoD, Saldierung und mehr: kurze, verständliche Erklärungen zu Solar-, Akku- und E-Fahrzeug-Begriffen." },
    ru: { t: "Словарь солнечной энергетики — термины PV, аккумуляторов и инверторов | GESPA",
          d: "kWp, MPPT, TOPCon, LiFePO₄, DoD, взаимозачёт и другое: краткие и понятные объяснения терминов солнечной энергетики и аккумуляторов." }
  },
  "aku-lifepo4-72v-30ah.html": {
    en: { t: "europlus 72 V 30 Ah LiFePO₄ Battery — 72V Lithium | GESPA Energy",
          d: "LiFePO₄ traction battery for e-trikes and 72 V vehicles: 24S, ~2,300 Wh, 87.6 V max charge, built-in balanced BMS, 2,000 cycles. Drops in where the gel pack was; no power sag as it drains." },
    de: { t: "europlus 72-V-30-Ah-LiFePO₄-Akku — 72V Lithium | GESPA Energy",
          d: "LiFePO₄-Traktionsakku für Elektro-Dreiräder und 72-V-Fahrzeuge: 24S, ~2.300 Wh, max. Ladespannung 87,6 V, integriertes Balancer-BMS, 2.000 Zyklen. Ersetzt den Gel-Akkusatz, ohne Leistungsabfall beim Entladen." },
    ru: { t: "Аккумулятор europlus 72 В 30 А·ч LiFePO₄ — 72В литий | GESPA",
          d: "Тяговый аккумулятор LiFePO₄ для электротрициклов и машин на 72 В: 24S, ~2300 Вт·ч, макс. заряд 87,6 В, встроенная BMS с балансировкой, 2000 циклов. Ставится вместо гелевого блока." }
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

// ---- SSS şeması: HER ZAMAN görünen sorulardan üretilir ----
// Elle yazılan FAQPage blokları sayfadaki metinden kopup kayıyordu (index.html
// şeması sayfada olmayan bir soru taşıyordu; paket sayfasından kopyalanan
// sayfalar başka ürünün SSS'ini taşıyordu). Artık tek kaynak görünen
// .faq-item'lardır: TR'de injectStaticLd, dil kopyasında transform() çevrilmiş
// gövdeden yeniden üretir → şema her dilde sayfayla birebir aynıdır.
// sss.html'de diğer sayfalardan toplanan sorular (FAQHUB) şemaya GİRMEZ:
// kaynak sayfada zaten işaretlidirler (Google aynı soru-cevabı tek yerde ister).
const FAQ_ITEM_RE = /<div class="faq-item[^"]*"><button class="faq-q"[^>]*>([\s\S]*?)<\/button><div class="faq-a"[^>]*>([\s\S]*?)<\/div><\/div>/g;
const FAQHUB_RE = /<!-- FAQHUB:STATIC -->[\s\S]*?<!-- \/FAQHUB:STATIC -->/;
function faqText(x) {
  return decodeEnt(String(x)
    .replace(/<span class="faq-ico"[^>]*>[\s\S]*?<\/span>/g, "")
    .replace(/<p[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/p>/g, " ")   // yalnız bağlantı olan paragraf (ör. "… göz atın →")
    .replace(/<\/(p|li|div)>/g, " ").replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}
function faqItems(html) {
  const out = [], re = new RegExp(FAQ_ITEM_RE.source, "g"), body = html.replace(FAQHUB_RE, "");
  let m;
  while ((m = re.exec(body)) !== null) {
    const q = faqText(m[1]), a = faqText(m[2]);
    if (q && a) out.push({ q: q, a: a });
  }
  return out;
}
function faqLdFromHtml(html) {
  const items = faqItems(html);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: items.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } }))
  };
}

// ---- Yardım: footer bağlantıları + SSS merkezi + GES sözlüğü ----
// Footer "Kurumsal" sütununa (SISTER:STATIC'in ardına) SSS ve Sözlük
// bağlantıları — üst menüye EKLENMEZ (menü genişlik kuralı). Metinler
// content/sss.js + content/sozluk.js'ten; dil kopyaları gövde çevirisiyle.
function faqItemHtml(q, a, link) {
  return '<div class="faq-item reveal"><button class="faq-q"><span>' + esc(q) + '</span><span class="faq-ico">+</span></button>'
    + '<div class="faq-a"><p>' + esc(a) + '</p>'
    + (link ? '<p><a href="' + esc(link.href) + '">' + esc(link.text[0]) + '</a></p>' : "") + '</div></div>';
}
function hydrateHelp(html, file) {
  const help = '<!-- HELP:STATIC --><a href="sss.html">' + esc(HELP.labels.title[0]) + '</a><a href="sozluk.html">'
    + esc(GLOSSARY.labels.title[0]) + '</a><!-- TR:ONLY --><a href="' + GUIDE.file + '">' + esc(GUIDE.label)
    + '</a><!-- /TR:ONLY --><!-- /HELP:STATIC -->';
  if (/<!-- HELP:STATIC -->/.test(html)) html = html.replace(/<!-- HELP:STATIC -->[\s\S]*?<!-- \/HELP:STATIC -->/g, () => help);
  else html = html.replace(/(<!-- \/SISTER:STATIC -->)/, m => m + help);

  if (file === "sss.html") {
    const gen = HELP.general.map(g => faqItemHtml(g[0][0], g[1][0], g[2])).join("");
    html = html.replace(/<!-- FAQGEN:STATIC -->[\s\S]*?<!-- \/FAQGEN:STATIC -->/, () => "<!-- FAQGEN:STATIC -->" + gen + "<!-- /FAQGEN:STATIC -->");
    // Diğer sayfaların görünen SSS'leri — kaynak sayfanın HTML'inden, aynen
    const groups = [];
    HELP.groups.forEach(g => {
      const src = path.join(ROOT, g.file);
      if (!fs.existsSync(src)) return;
      const h = fs.readFileSync(src, "utf8").replace(FAQHUB_RE, "");
      const items = [...h.matchAll(new RegExp(FAQ_ITEM_RE.source, "g"))].map(m => m[0]);
      if (!items.length) return;
      groups.push({ id: "sss-" + g.file.replace(/\.html$/, ""), g: g, items: items });
    });
    const trOnly = (x, s) => x.g.trOnly ? "<!-- TR:ONLY -->" + s + "<!-- /TR:ONLY -->" : s;
    const hub = groups.map(x => trOnly(x, '<section class="faqhub-group" id="' + x.id + '"><h2>' + esc(x.g.title[0]) + "</h2>"
      + '<div class="faq">' + x.items.join("") + "</div>"
      + '<p class="faqhub-src"><a href="' + esc(x.g.file) + '">' + esc(HELP.labels.source[0]) + "</a></p></section>")).join("");
    html = html.replace(FAQHUB_RE, () => "<!-- FAQHUB:STATIC -->" + hub + "<!-- /FAQHUB:STATIC -->");
    const toc = '<nav class="faqhub-toc" aria-label="' + esc(HELP.labels.toc[0]) + '">'
      + '<a href="#sss-genel">' + esc(HELP.labels.generalKicker[0]) + "</a>"
      + groups.map(x => trOnly(x, '<a href="#' + x.id + '">' + esc(x.g.title[0]) + "</a>")).join("") + "</nav>";
    html = html.replace(/<!-- FAQTOC:STATIC -->[\s\S]*?<!-- \/FAQTOC:STATIC -->/, () => "<!-- FAQTOC:STATIC -->" + toc + "<!-- /FAQTOC:STATIC -->");
  }
  if (file === "sozluk.html") {
    const idx = '<nav class="gl-index" aria-label="' + esc(GLOSSARY.labels.index[0]) + '">'
      + GLOSSARY.terms.map(t => '<a href="#' + t.id + '">' + esc(t.term[0]) + "</a>").join("") + "</nav>";
    const body = GLOSSARY.terms.map(t => '<section class="gl-term" id="' + t.id + '"><h2>' + esc(t.term[0]) + "</h2>"
      + "<p>" + esc(t.def[0]) + "</p>"
      + (t.link ? '<p class="gl-more"><a href="' + esc(t.link.href) + '">' + esc(t.link.text[0]) + "</a></p>" : "")
      + (t.trLink ? '<!-- TR:ONLY --><p class="gl-more"><a href="' + esc(t.trLink.href) + '">' + esc(t.trLink.text) + "</a></p><!-- /TR:ONLY -->" : "")
      + "</section>").join("");
    html = html.replace(/<!-- GLOSSARY:STATIC -->[\s\S]*?<!-- \/GLOSSARY:STATIC -->/, () => "<!-- GLOSSARY:STATIC -->" + idx + body + "<!-- /GLOSSARY:STATIC -->");
  }
  return html;
}
// Sözlük şeması: DefinedTermSet + terim başına DefinedTerm (çapa URL'li)
function glossaryLd(cfg) {
  const base = cfg.company.web + "/sozluk.html";
  return {
    "@context": "https://schema.org", "@type": "DefinedTermSet", "@id": base + "#set",
    name: GLOSSARY.labels.title[0], description: GLOSSARY.labels.lead[0], url: base, inLanguage: "tr",
    hasDefinedTerm: GLOSSARY.terms.map(t => ({
      "@type": "DefinedTerm", "@id": base + "#" + t.id, name: t.term[0], description: t.def[0],
      url: base + "#" + t.id, inDefinedTermSet: { "@id": base + "#set" }
    }))
  };
}

// ---- Head hijyeni: robots meta + og:locale:alternate ----
// Arama ve AI motorlarına "büyük görsel önizleme, sınırsız snippet" izni.
// Etiket yoksa Google (ve AI Overviews) kısa snippet varsayar, ürün görselleri
// küçük çıkar. noindex sayfalara DOKUNULMAZ (kendi robots etiketleri var).
// og:locale:alternate yalnız dil kopyası olan sayfalara yazılır (TR_ONLY hariç);
// transform() dil kopyasında kümeyi "geçerli dil hariç diğerleri" yapar.
function hydrateHead(html, file) {
  // Dil demeti: TR kaynak sayfa sözlüksüz i18n.tr.js yükler; transform() dil
  // kopyasında /assets/i18n.<dil>.js yapar (kaynak i18n.js'i sayfalar YÜKLEMEZ).
  html = html.replace(/(<script defer src=")assets\/i18n(?:\.[a-z]{2})?\.js(">)/, "$1assets/i18n.tr.js$2");
  if (!/<meta name="robots"/.test(html)) {
    html = html.replace(/(<meta name="description" content="[^"]*"\s*\/>)/,
      '$1\n  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />');
  }
  // Makine-okur kopya: AI ajanları HTML yerine /md/<sayfa>.md okuyabilir
  // (transform() dil kopyasında /md/<dil>/… yapar). noindex sayfada yok.
  html = html.replace(/[ \t]*<link rel="alternate" type="text\/markdown" href="[^"]*"\s*\/>\n?/g, "");
  if (!NOINDEX_FILES.includes(file)) {
    html = html.replace(/(<link rel="canonical" href="[^"]*"\s*\/>)/,
      '$1\n  <link rel="alternate" type="text/markdown" href="/md/' + file.replace(/\.html$/, ".md") + '" />');
  }
  html = html.replace(/[ \t]*<meta property="og:locale:alternate" content="[^"]*"\s*\/>\n?/g, "");
  if (!TR_ONLY.includes(file)) {
    const alts = LANGS.map(l => '  <meta property="og:locale:alternate" content="' + OG_ALL[l] + '" />').join("\n");
    html = html.replace(/(<meta property="og:locale" content="tr_TR"\s*\/>)/, "$1\n" + alts);
  }
  return html;
}

// ---- robots.txt (build üretir; elle düzenlenmez) ----
// Tek kaynak: NOINDEX_FILES + AI_BOTS. AI/yanıt motorları AÇIKÇA davet edilir —
// `User-agent: *` zaten izinli ama açık grup, bot işleticilerine niyet
// sinyalidir. /md/ Markdown kopyaları (C3) YALNIZ AI botlarına açıktır:
// arama motorunda yinelenen içerik sayılmasın (server.js ayrıca canonical
// Link başlığı gönderir). Content-Signal satırı Cloudflare "Content Signals"
// sözleşmesidir; tanımayan bot yok sayar.
const NOINDEX_FILES = ["admin.html", "sepet.html", "odeme.html", "odeme-sonuc.html"];
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",                        // OpenAI
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",   // Anthropic
  "PerplexityBot", "Perplexity-User",                               // Perplexity
  "Google-Extended",                                                // Gemini
  "Applebot", "Applebot-Extended",                                  // Apple
  "Amazonbot", "CCBot", "meta-externalagent", "Meta-ExternalFetcher",
  "DuckAssistBot", "YouBot", "Bytespider", "PetalBot",
  "MistralAI-User", "cohere-ai", "AI2Bot", "Diffbot"
];
function writeRobots() {
  const dis = [];
  NOINDEX_FILES.forEach(f => {
    dis.push("/" + f);
    if (PAGES.includes(f)) LANGS.forEach(l => dis.push("/" + l + "/" + f));
  });
  const rules = dis.map(d => "Disallow: " + d).join("\n");
  // Tek grup, çok User-agent satırı (RFC 9309): 24 bot × 11 satır tekrarı yerine.
  const groups = AI_BOTS.map(b => "User-agent: " + b).join("\n") + "\nAllow: /md/\nAllow: /\n" + rules;
  const out = "# build.js üretir — elle düzenlemeyin (kaynak: NOINDEX_FILES + AI_BOTS)\n"
    + "User-agent: *\nAllow: /\n" + rules + "\nDisallow: /md/\n"
    + "# İçerik sinyali: arama, AI yanıtı ve AI eğitimi için kullanıma AÇIK —\n"
    + "# içeriğimizin AI aramalarında görünmesini istiyoruz.\n"
    + "Content-Signal: search=yes, ai-input=yes, ai-train=yes\n\n"
    + "# AI / yanıt motorları — açıkça davetli. LLM bilgi dosyaları: /llms.txt (özet),\n"
    + "# /llms-full.txt (ürün/fiyat ayrıntısı), /md/ (sayfaların Markdown kopyaları).\n"
    + groups + "\n\nSitemap: " + ORIGIN + "/sitemap.xml\n";
  fs.writeFileSync(path.join(ROOT, "robots.txt"), out);
}

// ---- Sayfa tarihleri: sitemap lastmod, WebPage dateModified/datePublished ----
// Hepsi AYNI kaynağı okur (tutarsız iki tarih tazelik sinyalini bozar).
// Öncelik: git (tam geçmiş) > sayfada commit'lenmiş WebPage tarihi > dosya zamanı.
// Git'e her yerde güvenilmez:
//  · Railway imajında .git YOKTUR (sunucu açılışta build çalıştırır);
//  · GitHub Actions ve bulut oturumu SIĞ klondur: sınır commit'i geçmişi kesik
//    olduğu için HER dosyayı "ekler" görünür (datePublished'lar sınır tarihine
//    düşüyordu).
// Bu durumlarda yerelde tam geçmişle üretilip commit'lenmiş tarih korunur.
// Yoksa her dağıtımda bütün sayfalar "bugün değişti/yayımlandı" görünür ve
// arama motorları lastmod'a güvenmeyi bırakır. Commit'lenmemiş ya da bu
// build'de içeriği değişen sayfa = bugün (commit'lendiğinde tarih bu olacak).
const _lastMod = {}, _firstMod = {}, _preDates = {};
const todayIso = () => new Date().toISOString().slice(0, 10);
// Tarih alanları hariç karşılaştırma: "bu build sayfayı değiştirdi mi?"
const maskDates = h => String(h).replace(/"(dateModified|datePublished)":"\d{4}-\d{2}-\d{2}"/g, '"$1":""');
let _git = null;
function gitInfo() {
  if (_git) return _git;
  const cp = require("child_process");
  const raw = cmd => cp.execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString();
  _git = { ok: false, q: cmd => raw(cmd).trim(), shallow: new Set(), dirty: new Set() };
  try {
    if (raw("git rev-parse --is-inside-work-tree").trim() !== "true") return _git;
    const sf = raw("git rev-parse --git-path shallow").trim();
    const sp = path.isAbsolute(sf) ? sf : path.join(ROOT, sf);
    if (fs.existsSync(sp)) fs.readFileSync(sp, "utf8").split("\n").map(s => s.trim()).filter(Boolean).forEach(s => _git.shallow.add(s));
    // Build başında bir kez: elle değiştirilmiş / yeni dosyalar ("XY yol", satır başı boşluğu anlamlı)
    raw("git status --porcelain --untracked-files=all").split("\n").forEach(l => {
      if (l.length > 3) _git.dirty.add(l.slice(3).split(" -> ").pop().replace(/^"|"$/g, "").trim());
    });
    _git.ok = true;
  } catch (e) { /* git yok */ }
  return _git;
}
// Build BAŞINDA (seo.generate hizmet/proje sayfalarını şemasız yeniden
// yazmadan ÖNCE) git durumu ve sayfalardaki tarihler dondurulur.
function snapshotDates(pre) {
  gitInfo();
  Object.keys(pre).forEach(f => {
    const m1 = /"dateModified":"(\d{4}-\d{2}-\d{2})"/.exec(pre[f]), m2 = /"datePublished":"(\d{4}-\d{2}-\d{2})"/.exec(pre[f]);
    _preDates[f] = { dateModified: m1 ? m1[1] : null, datePublished: m2 ? m2[1] : null };
  });
}
// Sayfada commit'lenmiş WebPage tarihi (Railway / sığ klon yedeği)
function committedLdDate(file, key) {
  if (_preDates[file]) return _preDates[file][key] || null;
  try {
    const m = new RegExp('"' + key + '":"(\\d{4}-\\d{2}-\\d{2})"').exec(fs.readFileSync(path.join(ROOT, file), "utf8"));
    return m ? m[1] : null;
  } catch (e) { return null; }
}
// git log satırı "<sha> <tarih>" → sığ sınır commit'i değilse tarih
function gitDate(line, g) {
  const [sha, date] = String(line || "").trim().split(" ");
  return sha && date && !g.shallow.has(sha) ? date.slice(0, 10) : null;
}
function lastModOf(file) {
  if (_lastMod[file]) return _lastMod[file];
  const g = gitInfo();
  let d = null;
  if (g.ok && g.dirty.has(file)) d = todayIso();
  else if (g.ok) { try { d = gitDate(g.q('git log -1 --format="%H %cI" -- "' + file + '"'), g); } catch (e) {} }
  if (!d) d = committedLdDate(file, "dateModified");
  const p = path.join(ROOT, file);
  if (!d && fs.existsSync(p)) d = fs.statSync(p).mtime.toISOString().slice(0, 10);
  return (_lastMod[file] = d || todayIso());
}
// Dosyanın git'e İLK girdiği tarih (datePublished); bilinmiyorsa commit'lenmiş
// değer, o da yoksa (yeni sayfa) lastModOf.
function firstModOf(file) {
  if (_firstMod[file]) return _firstMod[file];
  const g = gitInfo();
  let d = null;
  if (g.ok) {
    try { d = gitDate(g.q('git log --diff-filter=A --format="%H %cI" -- "' + file + '"').split("\n").pop(), g); } catch (e) {}
  }
  if (!d) d = committedLdDate(file, "datePublished");
  return (_firstMod[file] = d || lastModOf(file));
}

// Sitemap'e girecek sayfa görselleri: <main> içindeki <img src="assets/…">
// (svg/ikon hariç, tekrarsız, en çok 30). Başlık = alt metni.
function pageImages(html) {
  const main = (html.match(/<main\b[\s\S]*?<\/main>/) || [html])[0];
  const seen = new Set(), out = [];
  const re = /<img\b([^>]*)>/g; let m;
  while ((m = re.exec(main)) !== null) {
    const src = (m[1].match(/\bsrc="([^"]+)"/) || [])[1];
    if (!src || !/^assets\//.test(src) || /\.svg$/i.test(src) || /favicon|gespa-icon/.test(src)) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    out.push({ loc: ORIGIN + "/" + src, title: (m[1].match(/\balt="([^"]*)"/) || [])[1] || "" });
    if (out.length >= 30) break;
  }
  return out;
}
// Sayfadaki statik VideoObject JSON-LD'den video sitemap girdisi
function pageVideo(html) {
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const o = JSON.parse(m[1]);
      const v = (Array.isArray(o) ? o : [o]).filter(x => x && x["@type"] === "VideoObject")[0];
      if (v && v.contentUrl && v.thumbnailUrl) return v;
    } catch (e) {}
  }
  return null;
}
function isoDurSec(x) { const m = /^PT(?:(\d+)M)?(?:(\d+)S)?$/.exec(x || ""); return m ? (+m[1] || 0) * 60 + (+m[2] || 0) : 0; }

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

function localBusinessLd(c, cfg) {
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
  if (c.geo && c.geo.lat != null && c.geo.lng != null) {
    d.geo = { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng };
    d.hasMap = "https://www.google.com/maps?q=" + c.geo.lat + "," + c.geo.lng;
  }
  // Müşteri hizmetleri irtibat noktası — AI asistanlarına "hangi dilde, nasıl
  // ulaşılır" sinyali. Telefon/e-posta yine config'ten.
  if (c.phone && c.phone.tel) {
    d.contactPoint = {
      "@type": "ContactPoint", contactType: "customer service",
      telephone: c.phone.tel, email: c.email,
      availableLanguage: ["tr", "en", "de", "ru"], areaServed: "TR"
    };
  }
  d.knowsLanguage = ["tr", "en", "de", "ru"];
  if (c.address && c.address.district) d.foundingLocation = { "@type": "Place", name: c.address.district + ", " + c.address.city };
  // Ödeme yolları — sepetteki seçeneklerle AYNI kaynak (config.commerce.payment)
  const com = (cfg && cfg.commerce) || {};
  if (com.payment && com.payment.length) d.paymentAccepted = com.payment.join(", ");
  d.currenciesAccepted = "TRY";
  return d;
}

// ---- Sayfa varlığı: her sayfada WebPage ailesi ----
// dateModified/datePublished git'ten (sitemap lastmod ile AYNI kaynak),
// isPartOf → #website, about/mainEntity → firma ya da ürün, speakable →
// sesli asistan ve AI özetleri için "önce bunu oku" seçicileri.
const PAGE_TYPE = {
  "urunler.html": "CollectionPage", "online-satis.html": "CollectionPage", "projeler.html": "CollectionPage",
  "hakkimizda.html": "AboutPage", "iletisim.html": "ContactPage",
  "su-isitici.html": "ItemPage", "ai-cankurtaran-destek-sistemi.html": "ItemPage"
};
const unesc = x => String(x || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
function pageLd(file, html, cfg, hasCrumbs) {
  const web = cfg.company.web;
  const url = web + "/" + (file === "index.html" ? "" : file);
  const title = unesc((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).trim();
  const desc = unesc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1]).trim();
  const og = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  const type = PAGE_TYPE[file] || (/data-pkg-detail="/.test(html) ? "ItemPage" : "WebPage");
  const d = {
    "@context": "https://schema.org", "@type": type, "@id": url + "#page",
    url: url, name: title, description: desc, inLanguage: "tr",
    isPartOf: { "@id": web + "/#website" },
    datePublished: firstModOf(file), dateModified: lastModOf(file)
  };
  if (type === "ItemPage") d.mainEntity = { "@id": url + "#product" };
  else d.about = { "@id": web + "/#organization" };
  if (/<main\b[^>]*\bdata-article\b/.test(html)) d.mainEntity = { "@id": url + "#article" };
  if (og) d.primaryImageOfPage = { "@type": "ImageObject", url: og };
  if (hasCrumbs) d.breadcrumb = { "@id": url + "#breadcrumb" };
  const sel = ["h1"];
  if (/class="lead"/.test(html)) sel.push(".lead");
  if (/class="prod-lead"/.test(html)) sel.push(".prod-lead");
  d.speakable = { "@type": "SpeakableSpecification", cssSelector: sel };
  return d;
}
// Rehber/makale sayfası (<main data-article>): Article şeması. Başlık h1'den,
// açıklama meta'dan, tarihler WebPage ile AYNI kaynaktan (firstModOf/lastModOf),
// kaynakça görünen "Kaynaklar" listesinden (ul.art-src) — şema sayfayla birebir
// kalır, elle yazılmaz. Yazar ve yayıncı firmadır (kişi/Person şeması YOK).
function articleLd(file, html, cfg) {
  const web = cfg.company.web, url = web + "/" + file;
  const text = x => decodeEnt(String(x || "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  const src = (html.match(/<ul class="art-src">([\s\S]*?)<\/ul>/) || [])[1] || "";
  const citation = [...src.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map(m => ({ "@type": "CreativeWork", name: text(m[2]), url: unesc(m[1]) }));
  const d = {
    "@context": "https://schema.org", "@type": "Article", "@id": url + "#article",
    headline: text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]),
    description: unesc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1]).trim(),
    inLanguage: "tr", datePublished: firstModOf(file), dateModified: lastModOf(file),
    author: { "@id": web + "/#organization" }, publisher: { "@id": web + "/#organization" },
    mainEntityOfPage: { "@id": url + "#page" }, isAccessibleForFree: true
  };
  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (og) d.image = og;
  if (citation.length) d.citation = citation;
  return d;
}

// Ürün sayfasındaki teknik künye tablosu → PropertyValue listesi
// (.spec-table; parts-table DEĞİL; fiyat içeren satır alınmaz)
function specProps(html) {
  const out = [];
  if (!html) return out;
  const re = /<table class="(spec-table[^"]*)"[^>]*>([\s\S]*?)<\/table>/g; let t;
  while ((t = re.exec(html)) !== null) {
    if (/parts-table/.test(t[1])) continue;
    const clean = x => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const rr = /<tr>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<td[^>]*>([\s\S]*?)<\/td>/g; let m;
    while ((m = rr.exec(t[2])) !== null) {
      const k = clean(m[1]), v = clean(m[2]);
      if (k && v && !/₺|\$/.test(v)) out.push({ "@type": "PropertyValue", name: k, value: v });
      if (out.length >= 24) break;
    }
    break;
  }
  return out;
}
// commerce.shipDays "2–5" → taşıma süresi (elleçleme süresi UYDURULMAZ)
function transitTime(com) {
  const m = /^(\d+)\s*[–-]\s*(\d+)$/.exec(String((com && com.shipDays) || "").trim());
  return m ? { "@type": "QuantitativeValue", minValue: +m[1], maxValue: +m[2], unitCode: "DAY" } : null;
}
// Fiyat geçerlilik sonu: canlı kampanyada endsAt, değilse yıl sonu (her build yeniler)
function priceValidUntil(cfg, p) {
  const camp = cfg.campaign || {};
  if (p.oldPrice && p.price != null && p.oldPrice > p.price && camp.endsAt && new Date(camp.endsAt) > new Date()) return String(camp.endsAt).slice(0, 10);
  return new Date().getFullYear() + "-12-31";
}

function heaterProductLd(cfg) {
  const prices = cfg.heater.showPrices === false ? [] : cfg.heater.models.map(m => m.price).filter(Boolean);
  const d = {
    "@context": "https://schema.org", "@type": "Product",
    "@id": cfg.company.web + "/su-isitici.html#product",
    itemCondition: "https://schema.org/NewCondition",
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
const URUNLER_GROUPS = ["evset", "offgrid", "irrigation", "ongrid", "accessory"];
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

// `parts` listesi olan paket ürünlerin (hazır set) fiyatını DENETLER.
// Set fiyatı config'te AÇIK yazılır — kalemlerden hesaplanmaz — çünkü sepet,
// iyzico, ürün akışı ve şema tek bir `price` okur. Bunun bedeli: bir kalemin
// fiyatı değişince set fiyatı sessizce kayabilir. Bu denetim kaymayı build'de
// yüksek sesle söyler; toplamı KENDİLİĞİNDEN düzeltmez (indirimli set kurmak
// meşru bir karar olabilir, kazara kayma değil).
function checkParts(cfg) {
  const sorun = [];
  (cfg.packages || []).forEach(p => {
    if (!p.parts || !p.parts.length) return;
    let toplam = 0;
    p.parts.forEach(id => {
      const m = (cfg.packages || []).filter(x => x.id === id)[0];
      if (!m) { sorun.push("  ! " + p.id + ": '" + id + "' config.packages'te YOK"); return; }
      if (m.price == null) { sorun.push("  ! " + p.id + ": '" + id + "' fiyatsız (teklif usulü)"); return; }
      toplam += priceTRY(cfg, m.price, m.currency);
    });
    if (p.price == null) return;
    const kendi = priceTRY(cfg, p.price, p.currency);
    if (toplam && kendi !== toplam) {
      const fark = kendi - toplam;
      sorun.push("  ! " + p.id + ": set ₺" + kendi.toLocaleString("tr-TR") +
        " · kalemler toplamı ₺" + toplam.toLocaleString("tr-TR") +
        " (fark " + (fark > 0 ? "+" : "") + fark.toLocaleString("tr-TR") + " ₺)");
    }
  });
  if (sorun.length) {
    console.warn("UYARI — hazır paket fiyatı kalemlerle uyuşmuyor:\n" + sorun.join("\n") +
      "\n  → config.packages içinde set fiyatını ya da kalemleri güncelleyin.");
  }
  return sorun.length;
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
    name: "GESPA Enerji Paket Ürünler", numberOfItems: items.length, itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: items.map((o, i) => ({ "@type": "ListItem", position: i + 1, item: o }))
  };
}

// Paket detay sayfası için Product şeması (statik; main.js data-gld görünce tekrar enjekte etmez)
function packageProductLd(cfg, p, html) {
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
  if (p.url) ld["@id"] = web + "/" + p.url + "#product";
  ld.itemCondition = "https://schema.org/NewCondition";
  // Görseller: ana foto + sayfa galerisindeki küçük resimlerin hedefleri
  // (.prod-thumb href). Ürün sonuçları birden çok görsel ister.
  const imgs = [];
  if (p.img) imgs.push(web + "/" + p.img);
  if (html) {
    const re = /<a class="prod-thumb[^"]*" href="(assets\/[^"]+)"/g; let m;
    while ((m = re.exec(html)) !== null) { const u = web + "/" + m[1]; if (!imgs.includes(u)) imgs.push(u); }
  }
  if (imgs.length) ld.image = imgs.length === 1 ? imgs[0] : imgs;
  // Teknik künye → additionalProperty (AI motoru "voltajı kaç" sorusunu şemadan okur)
  const props = specProps(html);
  if (props.length) ld.additionalProperty = props;
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
        ...(p.freeShipping ? { shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "TRY" } } : {}),
        // Teslim süresi: commerce.shipDays "2–5" iş günü → yalnız taşıma süresi
        ...(transitTime(com) ? { deliveryTime: { "@type": "ShippingDeliveryTime", transitTime: transitTime(com) } } : {})
      }
    };
    ld.offers.priceValidUntil = priceValidUntil(cfg, p);
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
  // İlişkili ürünler: hazır set → kalemleri; kalem → içinde bulunduğu setler
  // ("bu akü/cihaz hangi pakete uyar" sorusu şemadan da okunsun)
  const rel = [];
  const refOf = x => Object.assign({ "@type": "Product", name: x.name },
    x.url ? { "@id": web + "/" + x.url + "#product", url: web + "/" + x.url } : {});
  (p.parts || []).forEach(id => { const m = cfg.packages.filter(x => x.id === id)[0]; if (m) rel.push(refOf(m)); });
  cfg.packages.forEach(x => { if (x.parts && x.parts.includes(p.id) && x.id !== p.id) rel.push(refOf(x)); });
  if (rel.length) ld.isRelatedTo = rel;
  return ld;
}

function cankurtaranProductLd(cfg) {
  return {
    "@context": "https://schema.org", "@type": "Product",
    "@id": cfg.company.web + "/ai-cankurtaran-destek-sistemi.html#product",
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
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    "@id": cfg.company.web + "/" + (file === "index.html" ? "" : file) + "#breadcrumb", itemListElement: items };
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
  return { "@context": "https://schema.org", "@type": "ItemList", name: "GESPA Enerji Referans Projeler", numberOfItems: items.length, itemListElement: items };
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
  const web = cfg.company.web;
  // Elle yazılmış FAQPage blokları (data-gld'siz) kaldırılır — şema artık
  // görünen .faq-item'lardan üretilir (faqLdFromHtml).
  html = html.replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g,
    m => /"@type"\s*:\s*"FAQPage"/.test(m) ? "" : m);
  const objs = [localBusinessLd(cfg.company, cfg)];
  // WebSite varlığı HER sayfada (küçük): WebPage.isPartOf @id'si aynı sayfada
  // çözülsün. @id + publisher @id: arama ve AI motorları siteyi ve firmayı
  // AYNI varlık olarak bağlar; bağlanmazsa iki ayrı zayıf düğüm olur.
  objs.push({
    "@context": "https://schema.org", "@type": "WebSite",
    "@id": web + "/#website",
    name: cfg.company.brandName, alternateName: cfg.company.legalName,
    url: web + "/", inLanguage: ["tr", "en", "de", "ru"],
    publisher: { "@id": web + "/#organization" }
  });
  const bc = breadcrumbLd(html.replace(LD_RE, ""), file, cfg);
  const svc = seo.schema(file, cfg);
  // Sayfa varlığı — her sayfada; proje sayfalarında seo.schema()'nın
  // WebPage'i (ad/açıklama/görsel) üstüne yazılır, tek WebPage kalır.
  let page = pageLd(file, html, cfg, !!bc);
  if (svc && svc["@type"] === "WebPage") page = Object.assign(page, svc);
  else if (svc) objs.push(svc);
  objs.push(page);
  if (file === "su-isitici.html") objs.push(heaterProductLd(cfg));
  if (file === "urunler.html" || file === "online-satis.html") objs.push(packagesItemListLd(cfg, file));
  if (file === "ai-cankurtaran-destek-sistemi.html") objs.push(cankurtaranProductLd(cfg));
  if (file === "hesaplayici.html") objs.push(webAppLd(cfg));
  // Ürün detay sayfası — dosya adına değil, data-pkg-detail işaretine bakılır
  if (cfg.packages && /data-pkg-detail="/.test(html)) {
    const id = (html.match(/data-pkg-detail="([^"]+)"/) || [])[1];
    const p = cfg.packages.filter(x => x.id === id)[0];
    if (p) objs.push(packageProductLd(cfg, p, html));
  }
  if (file === "projeler.html") { const pl = projectsItemListLd(html, cfg); if (pl) objs.push(pl); }
  if (file === "sozluk.html") objs.push(glossaryLd(cfg));
  if (/<main\b[^>]*\bdata-article\b/.test(html)) objs.push(articleLd(file, html, cfg));
  const faq = faqLdFromHtml(html);
  if (faq) objs.push(faq);
  if (bc) objs.push(bc);
  const block = "  <!-- LD:STATIC — build.js config'ten üretir; elle düzenlemeyin -->\n"
    + objs.map(o => '  <script type="application/ld+json" data-gld="' + String(o["@type"] || "x").toLowerCase() + '">' + JSON.stringify(o) + "</script>").join("\n")
    + "\n  <!-- /LD:STATIC -->\n";
  if (LD_RE.test(html)) return html.replace(LD_RE, block);
  return html.replace(/\n?<\/head>/, "\n" + block + "</head>");
}

// i18n sözlüğünü Node tarafında yükle (i18n.js window.GESPA.i18nData'ya koyar).
// loadI18nRaw: yalnız assets/i18n.js'teki veri (istemci demetleri bununla
// üretilir — tarayıcıdaki davranış DEĞİŞMEZ). loadI18n: + content/ çevirileri
// (statik gövde çevirisi için; translation-fixes, hizmet/SSS/sözlük metinleri).
function loadI18nRaw() {
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
  const d = sandbox.GESPA.i18nData;
  return { DICT: d.DICT, PH: d.PH, HTMLMAP: d.HTMLMAP, units: sandbox.GESPA.units };
}
function loadI18n() {
  const raw = loadI18nRaw();
  const d = { DICT: raw.DICT, PH: raw.PH, HTMLMAP: raw.HTMLMAP };
  seo.translations(d);
  return d; // { DICT, PH, HTMLMAP }
}

// ---- i18n demetleri: sayfa yalnız KENDİ dilinin sözlüğünü yükler ----
// assets/i18n.js KAYNAKTIR — DICT/PH/HTMLMAP/UNITS orada düzenlenmeye devam
// eder. Eskiden her sayfa 4 dilin tamamını (730 KB, 139 KB br) indiriyordu;
// TR sayfası hiç sözlük kullanmadığı hâlde. Build, i18n.js'i değerlendirir,
// çalışma zamanı kodunu (var SKIP'ten sonrası) AYNEN kopyalar ve önüne yalnız
// o dilin verisini JSON olarak koyar → assets/i18n.<dil>.js. GESPA.i18nData.
// DICT[dil] şekli korunduğu için main.js ve builder.js DEĞİŞMEZ. Veri
// bölgesi (var LS … var SKIP arası) yalnız veri tanımı ve Object.assign
// eklemeleri içermelidir; oraya fonksiyon yazılırsa demete girmez.
const I18N_LANGS = ["tr"].concat(LANGS);
function writeI18nBundles() {
  const src = fs.readFileSync(path.join(ROOT, "assets/i18n.js"), "utf8");
  const LS_LINE = '  var LS = "gespa-lang";\n';
  const head = src.indexOf(LS_LINE), tail = src.indexOf("  var SKIP = ");
  if (head < 0 || tail < 0 || src.indexOf(LS_LINE, head + 1) >= 0) {
    throw new Error("assets/i18n.js yapısı değişmiş: 'var LS' / 'var SKIP' çapaları bulunamadı — demet üretilemez.");
  }
  const prefix = src.slice(0, head + LS_LINE.length), runtime = src.slice(tail);
  const raw = loadI18nRaw();
  for (const l of I18N_LANGS) {
    const own = o => (l !== "tr" && o && o[l]) ? { [l]: o[l] } : {};
    const units = Object.assign({ tr: raw.units.tr }, own(raw.units));
    const htmlmap = {};
    Object.keys(raw.HTMLMAP).forEach(sel => {
      const m = raw.HTMLMAP[sel];
      htmlmap[sel] = Object.assign({ tr: m.tr }, (l !== "tr" && m[l] != null) ? { [l]: m[l] } : {});
    });
    const data = "\n  // Veri: yalnız '" + l + "' (+ TR yedek) — build.js üretir\n"
      + "  var UNITS = " + JSON.stringify(units) + ";\n"
      + "  var HTMLMAP = " + JSON.stringify(htmlmap) + ";\n"
      + "  var PH = " + JSON.stringify(own(raw.PH)) + ";\n"
      + "  var DICT = " + JSON.stringify(own(raw.DICT)) + ";\n\n";
    const banner = "/* build.js üretir — kaynak: assets/i18n.js. BU DOSYAYI ELLE DÜZENLEMEYİN. Dil: " + l + " */\n";
    fs.writeFileSync(path.join(ROOT, "assets", "i18n." + l + ".js"), banner + prefix + data + runtime);
  }
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
  // "Pakete Dahil Olanlar" tablosu — paketin `parts` listesinden basılır.
  // Kalem kalem FİYAT YAZILMAZ: paket tek fiyatla satılır.
  if (/<!-- PARTS:STATIC -->/.test(html) && cfg.packages) {
    const id = (html.match(/data-pkg-detail="([^"]+)"/) || [])[1];
    const pk = id && cfg.packages.filter(x => x.id === id)[0];
    const ps = (pk && pk.parts || []).map(m => cfg.packages.filter(x => x.id === m)[0]).filter(Boolean);
    const tablo = ps.length
      ? '<table class="spec-table parts-table"><thead><tr><th>Adet</th><th>Bileşen</th></tr></thead><tbody>' +
        ps.map(m => "<tr><td>1 ×</td><td>" + esc(m.name) + "</td></tr>").join("") +
        "<tr><td>—</td><td>Sipariş öncesi ücretsiz danışmanlık</td></tr></tbody></table>"
      : "";
    html = html.replace(/<!-- PARTS:STATIC -->[\s\S]*?<!-- \/PARTS:STATIC -->/,
      "<!-- PARTS:STATIC -->" + tablo + "<!-- /PARTS:STATIC -->");
  }
  // Motor seçici paketleri — JS'siz ortam ve AI botları için statik liste.
  // Tarayıcıda main.js aynı bölümü config'ten yeniden çizer (seçilebilir
  // kartlar). Paketin fiyatı YOK: toplam kalemlerden hesaplanır.
  if (/<!-- MOTORSET:STATIC -->/.test(html) && cfg.evSets && cfg.packages) {
    const sets = cfg.evSets.map((st) => {
      const pk = cfg.packages.filter(x => x.id === st.pkg)[0];
      if (!pk || pk.price == null) return "";                    // eksik paketi YAYIMLAMA
      const ps = (pk.parts || []).map(m => cfg.packages.filter(x => x.id === m)[0]).filter(Boolean);
      const RATE = cfg.usdTry || 0;
      const total = pk.currency === "USD" ? Math.round(pk.price * RATE / 100) * 100 : pk.price;
      // ÇEVİRİ NOTU: dil kopyalarında gövde METİN DÜĞÜMÜ bazında çevrilir —
      // düğümün TAMAMI bir DICT anahtarına eşleşmeli. Bu yüzden çevrilecek
      // her ifade kendi <span>'inde durur; fiyat rakamı dışarıda kalır.
      return '<article class="mset-static">' +
        "<h3><span>" + esc(pk.name) + "</span></h3>" +
        (st.hint ? "<p><span>" + esc(st.hint) + "</span></p>" : "") +
        "<ul>" + ps.map(m => "<li><span>" + esc(m.name) + "</span></li>").join("") + "</ul>" +
        "<p><span>Set toplamı</span>: <strong>₺" + nfTr(total) + "</strong> · <span>" +
        (pk.freeShipping ? "KDV ve kargo dahil" : "KDV dahil · kargo hariç") + "</span></p>" +
        (pk.url ? '<p><a href="' + esc(pk.url) + '"><span>Ürün sayfası</span></a></p>' : "") + "</article>";
    }).join("");
    html = html.replace(/<!-- MOTORSET:STATIC -->[\s\S]*?<!-- \/MOTORSET:STATIC -->/,
      "<!-- MOTORSET:STATIC -->" + sets + "<!-- /MOTORSET:STATIC -->");
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
      { id: "evset", title: "Elektrikli Motor Güneş Paketleri" },
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
  "mesafeli-satis-sozlesmesi.html": "0.4", "iade-teslimat.html": "0.4",
  "sss.html": "0.7", "sozluk.html": "0.6", "gunes-paneli-kacak-elektrik-cezasi.html": "0.7"
};
/* ============================================================
   AI DOSYALARI — llms.txt (özet, build üretir) ve /md/ Markdown kopyalar.
   AI ajanları (ChatGPT, Claude, Perplexity…) JS çalıştırmaz ve HTML'i
   gürültülü bulur; her sayfanın <main> içeriği temiz Markdown olarak da
   yayımlanır (head'de <link rel="alternate" type="text/markdown">, robots.txt'te
   yalnız AI botlarına açık, server.js canonical Link başlığı gönderir).
   ============================================================ */
const LLMS_GROUPS = [
  // Ana sayfa en üstte: okuyan model siteye önce giriş kapısından baksın
  ["Ana sayfa", ["index.html"]],
  ["Hizmetler", ["hizmetler.html", "cati-ges.html", "arazi-ges.html", "enerji-depolama.html", "bakim-izleme.html", "tarimsal-sulama.html"]],
  ["Mağaza ve ürünler", ["online-satis.html", "urunler.html", "paket-285w.html", "paket-2x540w.html", "unv-trek-pro-2500.html",
    "elektrikli-arac-donusum.html", "paket-motor-yolcu.html", "paket-motor-kargo.html", "aku-lifepo4-72v-30ah.html", "su-isitici.html", "toptan.html"]],
  ["Yapay zekâ ürünleri", ["ai-cankurtaran-destek-sistemi.html"]],
  ["Ücretsiz araçlar", ["hesaplayici.html", "sistem-kur.html"]],
  ["Referans projeler", ["projeler.html", "proje-kemer-villa.html", "proje-manavgat-fabrika.html", "proje-manavgat-tarimsal.html"]],
  ["Rehberler ve güncel mevzuat (yalnız Türkçe)", ["gunes-paneli-kacak-elektrik-cezasi.html"]],
  ["Kurumsal ve yardım", ["hakkimizda.html", "iletisim.html", "sss.html", "sozluk.html"]]
];
function pageMeta(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const h = fs.readFileSync(p, "utf8");
  const t = unesc((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).replace(/\s*\|\s*GESPA Enerji\s*$/, "").trim();
  const d = unesc((h.match(/<meta name="description" content="([^"]*)"/) || [])[1]).trim();
  return { title: t, desc: d };
}
function writeLlms(cfg) {
  const c = cfg.company;
  const web = c.web;
  const urlOf = f => web + "/" + (f === "index.html" ? "" : f);
  const listed = new Set();
  const line = f => {
    const m = pageMeta(f); if (!m) return "";
    listed.add(f);
    return "- [" + m.title + "](" + urlOf(f) + ")" + (m.desc ? ": " + m.desc : "") + " · Markdown: " + web + "/md/" + f.replace(/\.html$/, ".md");
  };
  const groups = LLMS_GROUPS.map(([name, files]) => {
    const rows = files.map(line).filter(Boolean);
    return rows.length ? "### " + name + "\n" + rows.join("\n") : "";
  }).filter(Boolean).join("\n\n");
  // Listeye girmemiş sayfalar (yeni eklenen) kendiliğinden "Diğer" altına düşer
  const other = PAGES.filter(f => !listed.has(f) && !NOINDEX_FILES.includes(f)).map(line).filter(Boolean);
  // Yalnız TR olup bir gruba yazılmış sayfa (rehber) "Yasal" başlığına düşmez
  const legal = TR_ONLY.filter(f => !listed.has(f)).map(line).filter(Boolean);
  const nf = n => new Intl.NumberFormat("tr-TR").format(Math.round(n));
  const RATE = cfg.usdTry || 0;
  const products = (cfg.packages || []).filter(p => p.price != null || p.priceOnRequest).map(p => {
    const poa = p.price == null;
    const tl = poa ? null : (p.currency === "USD" ? Math.round(p.price * RATE / 100) * 100 : p.price);
    return "- " + p.name + (p.for ? " — " + p.for : "") + (poa ? " · fiyat için teklif alın" : " · ₺" + nf(tl) + " (KDV dahil)")
      + (p.url ? " · " + web + "/" + p.url : " · " + web + "/online-satis.html");
  }).join("\n");
  const out = `# ${c.brandName}

> ${c.description}

Bu dosya build.js tarafından üretilir (kaynak: sayfa başlıkları + assets/config.js); elle düzenlenmez.
Ayrıntılı ürün/fiyat/araç bilgisi: ${web}/llms-full.txt · Sayfaların Markdown kopyaları: ${web}/md/

## İletişim
- Unvan: ${c.legalName} · Marka: ${c.brandName}
- Telefon / WhatsApp: ${c.phone.display} (+${c.phone.wa})
- E-posta: ${c.email}
- Adres: ${c.address.full}
- Web: ${web} · Çalışma saatleri: ${c.hours}

## Hizmet bölgesi
${c.areaServed.join(", ")}; talebe göre tüm Türkiye. Ürünler Türkiye'nin her iline kargo ile gönderilir.

## Sayfalar
${groups}${other.length ? "\n\n### Diğer\n" + other.join("\n") : ""}

### Yasal (yalnız Türkçe)
${legal.join("\n")}

## Satıştaki ürünler (liste fiyatı; havale/EFT indirimi ve ayrıntı için llms-full.txt)
${products}

## Diller
Türkçe (kanonik): ${web}/ · English: ${web}/en/ · Deutsch: ${web}/de/ · Русский: ${web}/ru/
Markdown kopyalar da dile göre: ${web}/md/<sayfa>.md (TR), ${web}/md/en/…, ${web}/md/de/…, ${web}/md/ru/…
`;
  fs.writeFileSync(path.join(ROOT, "llms.txt"), out);
}

// Dengeli etiket silme: openRe ile eşleşen açılış etiketini ALT AĞACIYLA
// birlikte kaldırır (aynı addaki iç içe etiketleri sayarak).
function stripBalanced(h, openRe) {
  let out = "", i = 0;
  const re = new RegExp(openRe.source, "gi");
  while (i < h.length) {
    re.lastIndex = i;
    const m = re.exec(h);
    if (!m) { out += h.slice(i); break; }
    out += h.slice(i, m.index);
    const tag = m[1].toLowerCase();
    if (/\/>$/.test(m[0])) { i = m.index + m[0].length; continue; }
    const tr = new RegExp("<(/?)" + tag + "\\b[^>]*>", "gi");
    tr.lastIndex = m.index + m[0].length;
    let depth = 1, mm, end = h.length;
    while ((mm = tr.exec(h)) !== null) {
      if (mm[1] === "/") depth--; else if (!/\/>$/.test(mm[0])) depth++;
      if (depth === 0) { end = mm.index + mm[0].length; break; }
    }
    i = end;
  }
  return out;
}
const HTML_ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", copy: "©", rarr: "→", larr: "←", times: "×", deg: "°" };
function decodeEnt(t) {
  return t.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => HTML_ENT[n.toLowerCase()] != null ? HTML_ENT[n.toLowerCase()] : m);
}
// <main> HTML → Markdown (bu sitenin işaretlemesi için yeterli, genel amaçlı değil)
function htmlToMd(mainHtml, base) {
  let h = mainHtml;
  const abs = u => /^(https?:|mailto:|tel:|#|data:)/.test(u) ? u : (u.startsWith("/") ? ORIGIN + u : base + (u === "index.html" ? "" : u));
  // Metindeki < ve > (ör. "&lt; 80 mA") erken çözülürse sonraki etiket silici onu
  // etiket başı sanıp bir sonraki ">"a kadar HER ŞEYİ siler (BOOST künyesi tablonun
  // ortasında kesiliyordu). Çözülen açılı ayraçlar sona kadar yer tutucuda bekler.
  const LT = "\uE000", GT = "\uE001";
  const dec = x => decodeEnt(x).replace(/</g, LT).replace(/>/g, GT);
  const text = x => dec(x.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  h = h.replace(/<!--[\s\S]*?-->/g, "");
  // SSS soruları önce başlığa çevrilir (ardından tüm düğmeler silinir)
  h = h.replace(/<button class="faq-q"[^>]*>([\s\S]*?)<\/button>/g, (m, q) => "<h3>" + text(q.replace(/<span class="faq-ico"[^>]*>[\s\S]*?<\/span>/, "")) + "</h3>");
  h = h.replace(/<\/span>/gi, "</span> ");   // yan yana çipler/etiketler yapışmasın
  h = h.replace(/<(script|style|svg|form|select|noscript|template|video|audio|iframe|textarea)\b[\s\S]*?<\/\1>/gi, "");
  h = h.replace(/<(input|meta|link|source|track)\b[^>]*>/gi, "");
  h = stripBalanced(h, /<(div|section|p|span|a|ul|ol|li|aside|article|figure|nav|details|button)\b[^>]*?(?:\shidden(?:=|\s|>)|display:\s*none)[^>]*>/);
  h = stripBalanced(h, /<(button|nav)\b[^>]*>/);
  h = stripBalanced(h, /<(div|span|a|ul)\b[^>]*\bclass="[^"]*\b(?:prod-thumbs|faq-ico|qbox|lang-switch|share-row|mset-share|sh-noimg)\b[^"]*"[^>]*>/);
  // Tablolar
  h = h.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (m, body) => {
    const rows = [];
    const rr = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi; let r;
    while ((r = rr.exec(body)) !== null) {
      const cells = []; const cr = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi; let c;
      while ((c = cr.exec(r[1])) !== null) cells.push(text(c[1]).replace(/\|/g, "\\|"));
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) return "\n";
    const w = Math.max.apply(null, rows.map(x => x.length));
    const line = cells => "| " + cells.concat(Array(w - cells.length).fill("")).join(" | ") + " |";
    return "\n\n" + line(rows[0]) + "\n|" + Array(w).fill(" --- ").join("|") + "|\n" + rows.slice(1).map(line).join("\n") + "\n\n";
  });
  h = h.replace(/<br\s*\/?>/gi, "\n");
  h = h.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, t, x) => { const v = text(x); return v ? "**" + v + "**" : ""; });
  h = h.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, t, x) => { const v = text(x); return v ? "*" + v + "*" : ""; });
  h = h.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (m, x) => "`" + text(x) + "`");
  h = h.replace(/<img\b[^>]*>/gi, m => {
    const src = (m.match(/\bsrc="([^"]+)"/) || [])[1]; if (!src) return "";
    const alt = dec((m.match(/\balt="([^"]*)"/) || [])[1] || "");
    return "![" + alt.replace(/[\[\]]/g, "") + "](" + abs(src) + ")";
  });
  h = h.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, inner) => {
    const t = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!t) return "";
    return "[" + dec(t) + "](" + abs(href) + ")";
  });
  h = h.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (m, n, x) => "\n\n" + "#".repeat(+n) + " " + text(x) + "\n\n");
  h = h.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (m, x) => "\n- " + dec(x.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim());
  h = h.replace(/<(p|figcaption|blockquote|dd|dt|summary)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, t, x) => "\n\n" + dec(x.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim() + "\n\n");
  h = h.replace(/<\/?(div|section|article|aside|figure|ul|ol|header|footer|main|table|thead|tbody|tr|details|dl|picture|label|fieldset)\b[^>]*>/gi, "\n");
  h = h.replace(/<[^>]+>/g, "");
  h = decodeEnt(h).split(LT).join("<").split(GT).join(">");
  const lines = h.split("\n").map(l => l.replace(/[ \t]+/g, " ").trim());
  // Ardışık liste maddeleri arasındaki boş satırları kaldır (kaynak girintisinden gelir)
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "" && /^- /.test(out[out.length - 1] || "") && /^- /.test((lines.slice(i + 1).find(x => x !== "") || ""))) continue;
    out.push(lines[i]);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
// Bir sayfanın (TR ya da çevrili dil kopyası) Markdown kopyasını yazar
function writeMarkdownFile(html, lang, file, cfg) {
  if (NOINDEX_FILES.includes(file)) return;
  const c = cfg.company;
  const main = (html.match(/<main\b[\s\S]*?<\/main>/) || [])[0];
  if (!main) return;
  const url = lang === "tr" ? c.web + "/" + (file === "index.html" ? "" : file) : c.web + "/" + lang + "/" + (file === "index.html" ? "" : file);
  const base = lang === "tr" ? c.web + "/" : c.web + "/" + lang + "/";
  const title = unesc((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).trim();
  const desc = unesc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1]).trim();
  const q = x => JSON.stringify(String(x));
  const md = "---\n" + "title: " + q(title) + "\n" + "description: " + q(desc) + "\n" + "canonical: " + url + "\n"
    + "lang: " + lang + "\n" + "dateModified: " + lastModOf(file) + "\n" + "publisher: " + q(c.brandName) + "\n" + "---\n\n"
    + htmlToMd(main, base) + "\n\n---\n"
    + "Kaynak sayfa: " + url + " · " + c.brandName + " · " + c.phone.display + " · " + c.email + " · " + c.address.full + "\n"
    + "Tüm sayfalar ve ürünler: " + c.web + "/llms.txt · Ayrıntı: " + c.web + "/llms-full.txt\n";
  const dir = lang === "tr" ? path.join(ROOT, "md") : path.join(ROOT, "md", lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file.replace(/\.html$/, ".md")), md);
}

function writeSitemap(i18n) {
  const urlFor = (l, file) => l === "tr" ? ORIGIN + "/" + (file === "index.html" ? "" : file) : ORIGIN + "/" + l + "/" + (file === "index.html" ? "" : file);
  const entries = [];
  const NOSITEMAP = { "sepet.html": 1 };   // noindex sayfalar haritaya girmez
  for (const file of PAGES.concat(TR_ONLY)) {
    if (NOSITEMAP[file]) continue;
    const trOnly = TR_ONLY.includes(file);
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    const html = fs.readFileSync(p, "utf8");
    const lastmod = lastModOf(file);
    // Görsel/video uzantıları: Google Görseller ve video sonuçları için.
    // Dil kopyaları aynı dosyaları paylaşır; başlık DICT'ten çevrilir.
    const imgs = pageImages(html);
    const vid = pageVideo(html);
    const smLangs = trOnly ? ["tr"] : ["tr", ...LANGS];
    const cluster = smLangs.map(l => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + urlFor(l, file) + '" />').join("\n")
      + '\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlFor("tr", file) + '" />';
    for (const l of smLangs) {
      const d = (i18n && i18n.DICT && i18n.DICT[l]) || {};
      const tr = t => (l === "tr" ? t : (d[t] || t));
      const imgXml = imgs.map(im => "    <image:image><image:loc>" + esc(im.loc) + "</image:loc>"
        + (im.title ? "<image:title>" + esc(tr(im.title)) + "</image:title>" : "") + "</image:image>").join("\n");
      const vidXml = vid ? "    <video:video><video:thumbnail_loc>" + esc(vid.thumbnailUrl) + "</video:thumbnail_loc>"
        + "<video:title>" + esc(tr(vid.name)) + "</video:title>"
        + "<video:description>" + esc(tr(vid.description)) + "</video:description>"
        + "<video:content_loc>" + esc(vid.contentUrl) + "</video:content_loc>"
        + (isoDurSec(vid.duration) ? "<video:duration>" + isoDurSec(vid.duration) + "</video:duration>" : "")
        + (vid.uploadDate ? "<video:publication_date>" + esc(vid.uploadDate) + "</video:publication_date>" : "")
        + "</video:video>" : "";
      entries.push("  <url>\n    <loc>" + urlFor(l, file) + "</loc>\n    <lastmod>" + lastmod +
        "</lastmod><changefreq>" + (file === "index.html" ? "weekly" : "monthly") + "</changefreq><priority>" +
        (l === "tr" ? (PRIORITY[file] || "0.7") : "0.5") + "</priority>\n" + cluster +
        (imgXml ? "\n" + imgXml : "") + (vidXml ? "\n" + vidXml : "") + "\n  </url>");
    }
  }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    + '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
    + '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n'
    + '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n' +
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
  const md = path.join(ROOT, "md");
  if (fs.existsSync(md)) { addDir(md, /\.md$/); for (const l of LANGS) { const d = path.join(md, l); if (fs.existsSync(d)) addDir(d, /\.md$/); } }
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
  // Elektrikli motor paketleri — kalem listesi + set toplamı. Paketin kendi
  // fiyatı yok; rakamlar içindeki ürünlerin config fiyatlarından gelir.
  const evSetLines = (cfg.evSets || []).map(st => {
    const pk = (cfg.packages || []).filter(x => x.id === st.pkg)[0];
    if (!pk || pk.price == null) return "";
    const ps = (pk.parts || []).map(m => (cfg.packages || []).filter(x => x.id === m)[0]).filter(Boolean);
    const web = (cfg.company && cfg.company.web) || "";
    return `- ${pk.name} — ${st.hint}. İçindekiler: ` + ps.map(m => m.name).join(" + ")
      + ` = ₺${nf(pk.price)} (ürün kodu ${pk.sku})`
      + ` · ürün sayfası: ${web}/${pk.url}`
      + ` · tek tıkla sepete: ${web}/sepet.html?ekle=${pk.id}`;
  }).filter(Boolean).join("\n");
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
Ödeme: havale/EFT'te indirim uygulanır (oran ürüne göre değişir; her ürünün indirimli tutarı yukarıdaki listede yazılıdır). Kart ödemesinde indirim UYGULANMAZ, liste fiyatı geçerlidir.

## Elektrikli Motor (Triportör) Güneş Paketleri (${c.web}/elektrikli-arac-donusum.html#paketler)
Müşteri aracına hangi panelin uyduğunu bilmiyorsa araç tipini seçer, paket hazır çıkar.
${evSetLines}
Paketin kendi fiyatı yoktur; toplam içindeki ürünlerin liste fiyatlarından gelir.
Sayfadaki araç fotoğrafları yalnızca TİP ÖRNEĞİDİR (başka üreticilerin araçları);
satışa konu olan yukarıda listelenen ürünlerdir — ARAÇ SATILMAZ.

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
  // llms.txt artık writeLlms() üretir (sayfa başlıkları + config'ten, tam kapsam).
}

function transform(html, lang, file, i18n) {
  const m = META[file] && META[file][lang];
  const canonical = ORIGIN + "/" + lang + "/" + (file === "index.html" ? "" : file);
  let out = html;
  // WebPage şemasındaki ad/açıklama TR <title>/description ile aynı metindir;
  // dil kopyasında META tablosundaki çeviriye eşlenir (aşağıdaki localize).
  const trTitle = unesc((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).trim();
  const trDesc = unesc((html.match(/<meta name="description" content="([^"]*)"/) || [])[1]).trim();

  // 0) Yalnız TR sayfada kalacak bloklar (Türkçe rehbere bağlantılar) dil
  //    kopyasına girmez — çevirisiz Türkçe metin ve TR-only sayfaya bağlantı olmasın.
  out = out.replace(TR_ONLY_RE, "");

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
  //    dil demeti: yalnız bu dilin sözlüğü (bkz. writeI18nBundles)
  out = out.replace(/src="\/assets\/i18n\.tr\.js"/, 'src="/assets/i18n.' + lang + '.js"');

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

  // 3b) Markdown kopya bağlantısı → /md/<dil>/<sayfa>.md
  out = out.replace(/href="\/md\/([a-z0-9-]+\.md)"/, 'href="/md/' + lang + '/$1"');

  // 4) og:locale + og:locale:alternate (geçerli dil hariç diğer üç yerel)
  out = out.replace(/[ \t]*<meta property="og:locale:alternate" content="[^"]*"\s*\/>\n?/g, "");
  out = out.replace(/content="tr_TR"/, 'content="' + OG_LOCALE[lang] + '"');
  out = out.replace(/(<meta property="og:locale" content="[^"]*"\s*\/>)/, m => m + "\n" +
    ["tr"].concat(LANGS).filter(l => l !== lang).map(l => '  <meta property="og:locale:alternate" content="' + OG_ALL[l] + '" />').join("\n"));

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
  // 8b) SSS şeması çevrilmiş GÖRÜNEN sorulardan yeniden üretilir (şema = sayfa)
  out = out.replace(/(<script type="application\/ld\+json" data-gld="faqpage">)[\s\S]*?(<\/script>)/,
    (mm, a, b) => { const ld = faqLdFromHtml(out); return ld ? a + JSON.stringify(ld) + b : mm; });

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
      if (m && key === 'name' && value === trTitle) return m.t;
      if (m && key === 'description' && value === trDesc) return m.d;
      if (['name','description','text','serviceType','value','alternateName'].includes(key)) return d[value] || value;
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
  // Sayfaların build öncesi hâli: tarih kaynağı ve "değişti mi" karşılaştırması
  // için. seo.generate() aşağıda hizmet/proje sayfalarını şemasız yeniden yazar.
  const pre = {};
  for (const file of PAGES.concat(TR_ONLY)) {
    const p = path.join(ROOT, file);
    if (fs.existsSync(p)) pre[file] = fs.readFileSync(p, "utf8");
  }
  snapshotDates(pre);
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
    html = hydrateHead(html, file);
    html = hydrateHelp(html, file);
    html = hydrateContact(html, cfg.company);
    html = hydrateSisterSites(html, cfg.company);
    html = hydrateExtras(html, file, cfg);
    html = injectStaticLd(html, file, cfg);
    // Sayfa BU build'de değiştiyse (config'ten gelen fiyat, stok, hizmet metni…)
    // bugün değişmiştir. Karşılaştırma build öncesi hâle göre, tarih alanları hariç.
    if (pre[file] != null && maskDates(html) !== maskDates(pre[file]) && lastModOf(file) !== todayIso()) {
      _lastMod[file] = todayIso();
      // global: WebPage ile Article (rehber sayfası) aynı tarihi taşır
      html = html.replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g, '"dateModified":"' + todayIso() + '"');
    }
    if (html !== before) fs.writeFileSync(p, html);
    writeMarkdownFile(html, "tr", file, cfg);
  }
  checkParts(cfg);
  writeLlmsFull(cfg);
  writeLlms(cfg);
  writeI18nBundles();   // llms.txt — writeLlmsFull'den SONRA (tek yazar bu olsun)
  writeProductFeed(cfg);
  writeSitemap(i18n);
  writeRobots();

  let count = 0;
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const file of PAGES) {
      const src = path.join(ROOT, file);
      if (!fs.existsSync(src)) continue;
      const html = fs.readFileSync(src, "utf8");
      const out = transform(html, lang, file, i18n);
      fs.writeFileSync(path.join(dir, file), out);
      writeMarkdownFile(out, lang, file, cfg);
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
