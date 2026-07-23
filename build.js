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

const ROOT = __dirname;
const ORIGIN = "https://www.gespaenerji.com";
const LANGS = ["en", "de", "ru"];
const OG_LOCALE = { en: "en_US", de: "de_DE", ru: "ru_RU" };

// Üretilecek sayfalar
const PAGES = [
  "index.html", "hizmetler.html", "urunler.html", "su-isitici.html", "hesaplayici.html",
  "projeler.html", "hakkimizda.html", "iletisim.html", "tarimsal-sulama.html",
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

function transform(html, lang, file) {
  const m = META[file] && META[file][lang];
  const canonical = ORIGIN + "/" + lang + "/" + (file === "index.html" ? "" : file);
  let out = html;

  // 1) <html lang="tr"> -> hedef dil
  out = out.replace(/<html lang="tr"/, '<html lang="' + lang + '"');

  // 2) Göreli "assets/..." referanslarını mutlak "/assets/..." yap (alt dizinde de çözülsün)
  //    href/src + <picture><source srcset> dahil
  out = out.replace(/(href|src|srcset)="assets\//g, '$1="/assets/');
  //    inline stil arka planları: url('assets/...') -> url('/assets/...')
  out = out.replace(/url\((['"]?)assets\//g, 'url($1/assets/');

  // 3) <title> ve meta description (dil-özel)
  if (m) {
    out = out.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(m.t) + "</title>");
    out = out.replace(/<meta name="description" content="[^"]*"\s*\/>/,
      '<meta name="description" content="' + esc(m.d) + '" />');
  }

  // 4) og:locale
  out = out.replace(/content="tr_TR"/, 'content="' + OG_LOCALE[lang] + '"');

  // 5) canonical + og:url -> dile özel mutlak URL
  out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/>/,
    '<link rel="canonical" href="' + canonical + '" />');
  out = out.replace(/<meta property="og:url" content="[^"]*"\s*\/>/,
    '<meta property="og:url" content="' + canonical + '" />');

  // 6) Statik (TR metinli) FAQPage JSON-LD'yi dil sayfalarından çıkar —
  //    EN/DE/RU sayfada Türkçe yapılandırılmış veri dil uyumsuzluğu yaratır
  out = out.replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g,
    function (block) { return /"FAQPage"/.test(block) ? "" : block; });

  // 7) i18n için dil bayrağını erken tanımla (deferred i18n.js okuyacak)
  out = out.replace(/(<meta charset="UTF-8" \/>)/,
    '$1\n  <script>window.__LANG__="' + lang + '";</script>');

  return out;
}

function run() {
  let count = 0;
  for (const lang of LANGS) {
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const file of PAGES) {
      const src = path.join(ROOT, file);
      if (!fs.existsSync(src)) continue;
      const html = fs.readFileSync(src, "utf8");
      fs.writeFileSync(path.join(dir, file), transform(html, lang, file));
      count++;
    }
  }
  return count;
}

if (require.main === module) {
  const n = run();
  console.log("GESPA build: " + n + " dil sayfası üretildi (" + LANGS.join(", ") + ").");
}

module.exports = { run };
