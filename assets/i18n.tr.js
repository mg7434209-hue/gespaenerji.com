/* build.js üretir — kaynak: assets/i18n.js. BU DOSYAYI ELLE DÜZENLEMEYİN. Dil: tr */
/* ============================================================
   GESPA Enerji — Çok dilli destek (TR varsayılan · DE · RU)
   Metinler TR kaynağına göre çevrilir; eşleşmeyen string TR kalır.
   Yeni çeviri eklemek için yalnızca DICT/PH/UNITS'e satır ekleyin.
   ============================================================ */
(function () {
  "use strict";
  window.GESPA = window.GESPA || {};
  var LS = "gespa-lang";

  // Veri: yalnız 'tr' (+ TR yedek) — build.js üretir
  var UNITS = {"tr":{"yil":"yıl","yilPlus":"25+ yıl","ay":"ay","adet":"adet","agac":"ağaç","ton":"ton","km":"km","year":"yıl","added":"Eklenmedi"}};
  var HTMLMAP = {"#heroTitle":{"tr":"Güneşten <span class=\"hl\">kazanca</span> dönüşen enerji."},"#calcLead":{"tr":"Sadece faturanızı girin; <strong>sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancınızı</strong> saniyeler içinde görün. Üstelik panel yerleşimi, inverter ve kablo gibi <strong>mühendislik araçları</strong> da burada."},"#shopNoJs":{"tr":"Ürünleri görüntülemek için JavaScript'i etkinleştirin veya <a href=\"iletisim.html\">bizimle iletişime geçin</a>."},"#ordConsent":{"tr":"Siparişi göndererek <a href=\"/kvkk.html\">KVKK Aydınlatma Metni</a>'ni ve aşağıdaki satış şartlarını kabul etmiş olursunuz."}};
  var PH = {};
  var DICT = {};

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
  // build.js'in statik çeviri için okuduğu veri (tarayıcıda da zararsız)
  GESPA.i18nData = { DICT: DICT, PH: PH, HTMLMAP: HTMLMAP };

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
