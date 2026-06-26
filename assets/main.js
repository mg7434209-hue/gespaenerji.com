/* ============================================================
   GESPA Enerji — Etkileşimler
   ============================================================ */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function L(tr, en, de, ru) { var l = (window.GESPA && GESPA.lang) || "tr"; return l === "en" ? en : (l === "de" ? de : (l === "ru" ? ru : tr)); }

  /* ---- Yıl ---- */
  var yil = $("#yil");
  if (yil) yil.textContent = new Date().getFullYear();

  /* ---- Breadcrumb JSON-LD (kırıntıdan üretilir) ---- */
  (function () {
    var c = $(".crumbs"); if (!c) return;
    var items = [], pos = 1;
    $$("a", c).forEach(function (a) { items.push({ "@type": "ListItem", position: pos++, name: a.textContent.trim(), item: a.href }); });
    var last = c.textContent.split("/").pop().trim();
    if (last) items.push({ "@type": "ListItem", position: pos++, name: last, item: location.href.split("#")[0] });
    if (items.length < 2) return;
    try {
      var s = doc.createElement("script"); s.type = "application/ld+json";
      s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
      doc.head.appendChild(s);
    } catch (e) {}
  })();

  /* ============================================================
     TEK KAYNAK ENJEKSİYONU (assets/config.js)
     İletişim, markalar, hesaplayıcı katsayıları ve JSON-LD buradan basılır.
     ============================================================ */
  var CFG = (window.GESPA && window.GESPA.config) || {};
  function setText(sel, v) { var e = $(sel); if (e && v != null) e.textContent = v; }
  // Admin panelinden kaydedilen fiyat override'larını uygula (yalnızca bu tarayıcı)
  (function applyPriceOverrides() {
    var ov; try { ov = JSON.parse(localStorage.getItem("gespa-prices") || "null"); } catch (e) { ov = null; }
    if (!ov) return;
    if (ov.packages && CFG.packages) CFG.packages.forEach(function (p) { if (ov.packages[p.id] != null && ov.packages[p.id] !== "") p.price = +ov.packages[p.id]; });
    if (ov.heater && CFG.heater && CFG.heater.models) CFG.heater.models.forEach(function (m) { if (ov.heater[m.cap] != null && ov.heater[m.cap] !== "") m.price = +ov.heater[m.cap]; });
  })();
  (function fillFromConfig() {
    var c = CFG.company;
    if (c) {
      var val = function (p) { return p.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, c); };
      $$("[data-c-text]").forEach(function (el) { var v = val(el.getAttribute("data-c-text")); if (v != null) el.textContent = v; });
      if (c.phone) {
        $$("[data-c-tel]").forEach(function (el) { el.setAttribute("href", "tel:" + c.phone.tel); });
        $$("[data-c-wa]").forEach(function (el) { el.setAttribute("href", "https://wa.me/" + c.phone.wa); });
      }
      $$("[data-c-mailto]").forEach(function (el) { el.setAttribute("href", "mailto:" + c.email); });
      // LocalBusiness JSON-LD (her sayfada)
      try {
        var d = {
          "@context": "https://schema.org", "@type": "LocalBusiness",
          name: c.brandName, legalName: c.legalName, url: c.web,
          telephone: c.phone && c.phone.tel, email: c.email,
          image: c.web + "/assets/img/gespa-icon.png",
          address: { "@type": "PostalAddress", streetAddress: c.address.line, addressLocality: c.address.district, addressRegion: c.address.city, addressCountry: c.address.country }
        };
        // Opsiyonel zenginleştirmeler — yalnızca config'te değer varsa eklenir
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
            itemListElement: c.services.map(function (sv) { return { "@type": "Offer", itemOffered: { "@type": "Service", name: sv } }; })
          };
        }
        if (c.rating && c.rating.value && c.rating.count) {
          d.aggregateRating = { "@type": "AggregateRating", ratingValue: c.rating.value, reviewCount: c.rating.count };
        }
        if (c.sameAs && c.sameAs.length) d.sameAs = c.sameAs;
        if (c.geo && c.geo.lat != null && c.geo.lng != null) {
          d.geo = { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng };
        }
        var s = doc.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(d); doc.head.appendChild(s);
      } catch (e) {}
    }
    var b = CFG.brands;
    if (b) {
      var fill = function (sel, arr) { var w = $(sel); if (w && arr) arr.forEach(function (n) { var sp = doc.createElement("span"); sp.textContent = n; w.appendChild(sp); }); };
      fill("#brandPanels", b.panel);
      fill("#brandInverters", b.inverter);
    }
    var k = CFG.calc;
    if (k) {
      var sel = $("#city");
      if (sel && !sel.options.length && k.regions) {
        k.regions.forEach(function (r) { var o = doc.createElement("option"); o.value = r.yield; o.textContent = r.label; if (r.default) o.selected = true; sel.appendChild(o); });
      }
      var orient = $("#orient");
      if (orient && !orient.options.length && k.orientations) {
        k.orientations.forEach(function (r) { var o = doc.createElement("option"); o.value = r.factor; o.textContent = r.label; if (r.default) o.selected = true; orient.appendChild(o); });
      }
      var price = $("#price"); if (price && !price.value && k.defaultUnitPrice != null) price.value = k.defaultUnitPrice;
      var infl = $("#infl"); if (infl && !infl.value && k.defaultInflation != null) infl.value = k.defaultInflation;
      var selfI = $("#self"); if (selfI && !selfI.value && k.defaultSelfConsumption != null) selfI.value = k.defaultSelfConsumption;
      var ir = k.irrigation || {};
      var pkI = $("#pumpKw"); if (pkI && !pkI.value && ir.defaultPumpKw != null) pkI.value = ir.defaultPumpKw;
      var phI = $("#pumpHours"); if (phI && !phI.value && ir.defaultHours != null) phI.value = ir.defaultHours;
      var pmI = $("#pumpMonths"); if (pmI && !pmI.value && ir.defaultMonths != null) pmI.value = ir.defaultMonths;
      var nf = new Intl.NumberFormat("tr-TR");
      if (k.panelW != null) setText("#aPanelW", k.panelW + " Wp");
      if (k.areaPerKwp != null) setText("#aArea", k.areaPerKwp + " m²/kWp");
      if (k.costPerKwp != null) setText("#aCost", "₺" + nf.format(k.costPerKwp) + "/kWp");
      if (k.co2PerKwh != null) setText("#aCo2", new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(k.co2PerKwh) + " kg/kWh");
    }
    // ---- Paket ürünler (urunler.html) — config.packages + config.calc'tan türetilir ----
    (function renderPackages() {
      var grid = $("#packageGrid");
      if (!grid || !CFG.packages || !CFG.calc) return;
      var kk = CFG.calc;
      var PANEL_W = kk.panelW || 550, COST = kk.costPerKwp || 28000, AREA = kk.areaPerKwp || 6, BAT_COST = kk.batteryCostPerKwh || 9000;
      var defYield = 1500;
      if (kk.regions && kk.regions.length) { var dr = kk.regions.filter(function (r) { return r.default; })[0] || kk.regions[0]; defYield = dr.yield || 1500; }
      var nf = new Intl.NumberFormat("tr-TR");
      var nf1 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
      var WA = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      var ld = [];
      function priceOf(p) { return p.price != null ? p.price : Math.round(p.kwp * COST + (p.battery ? p.battery * BAT_COST : 0)); }
      function specsOf(p) {
        var pw = p.panelW || PANEL_W;
        var panels = p.panelCount || Math.ceil((p.kwp * 1000) / pw);
        var arr = [nf1.format(p.kwp) + " kWp",
          "~" + nf.format(panels) + " " + L("panel", "panels", "Module", "панелей") + " (" + pw + " Wp)"];
        if (p.group === "offgrid") {
          arr.push("~" + nf.format(Math.round(p.kwp * defYield / 365)) + " kWh/" + L("gün", "day", "Tag", "день"));
        } else if (p.group === "irrigation") {
          if (p.pumpKw) arr.push(L("Pompa", "Pump", "Pumpe", "Насос") + " ~" + nf1.format(p.pumpKw) + " kW");
          arr.push("~" + nf.format(Math.round(p.kwp * AREA)) + " m² " + L("alan", "area", "Fläche", "площадь"));
        } else {
          arr.push("~" + nf.format(Math.round(p.kwp * AREA)) + " m² " + L("alan", "area", "Fläche", "площадь"));
          arr.push("~" + nf.format(Math.round(p.kwp * defYield)) + " kWh/" + L("yıl", "yr", "Jahr", "год"));
          if (p.battery) arr.push(nf.format(p.battery) + " kWh " + L("batarya", "battery", "Batterie", "аккумулятор"));
        }
        return arr;
      }
      function card(p) {
        var price = priceOf(p);
        var specLi = specsOf(p).map(function (s) { return "<li>" + s + "</li>"; }).join("");
        var feat = (p.features || []).map(function (f) { return "<li>" + f + "</li>"; }).join("");
        var href = "iletisim.html";
        if (WA) {
          var msg = L(
            "Merhaba, \"" + p.name + "\" (" + nf1.format(p.kwp) + " kWp) paketi için teklif almak istiyorum.",
            "Hello, I'd like a quote for the \"" + p.name + "\" (" + nf1.format(p.kwp) + " kWp) package.",
            "Hallo, ich möchte ein Angebot für das Paket \"" + p.name + "\" (" + nf1.format(p.kwp) + " kWp).",
            "Здравствуйте, хочу получить КП на пакет «" + p.name + "» (" + nf1.format(p.kwp) + " кВт)."
          );
          href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
        }
        ld.push({ "@type": "Product", name: p.name, category: p.tag, description: p.desc, offers: { "@type": "Offer", price: price, priceCurrency: "TRY", availability: "https://schema.org/InStock" } });
        return '<article class="pkg-card reveal' + (p.popular ? " popular" : "") + '">' +
          (p.popular ? '<span class="pkg-badge">' + L("En Popüler", "Most Popular", "Beliebt", "Популярный") + "</span>" : "") +
          '<div class="pkg-top"><span class="pkg-icon" aria-hidden="true">' + (p.icon || "☀️") + '</span><span class="pkg-tag">' + p.tag + "</span></div>" +
          '<h3 class="pkg-name">' + p.name + "</h3>" +
          '<p class="pkg-desc">' + p.desc + "</p>" +
          '<div class="pkg-power">' + nf1.format(p.kwp) + " kWp</div>" +
          '<ul class="pkg-specs">' + specLi + "</ul>" +
          '<ul class="pkg-features ticks">' + feat + "</ul>" +
          '<div class="pkg-price"><span class="pkg-price-lbl">' + L("Yaklaşık başlangıç", "Approx. from", "Ca. ab", "Прибл. от") + "</span><strong>₺" + nf.format(price) + "</strong></div>" +
          '<a class="btn btn-block" href="' + href + '"' + (WA ? ' target="_blank" rel="noopener"' : "") + ">" + L("Bu paket için teklif al", "Get a quote", "Angebot anfordern", "Запросить КП") + "</a>" +
          "</article>";
      }
      var GROUPS = [
        { id: "ongrid", title: L("Çatı / On-Grid Paketler", "Rooftop / On-Grid Packages", "Aufdach- / On-Grid-Pakete", "Крышные / On-grid пакеты"), desc: L("Şebeke bağlantılı konut, villa ve ticari sistemler.", "Grid-tied residential, villa and commercial systems.", "Netzgekoppelte Wohn-, Villa- und Gewerbesysteme.", "Сетевые системы для домов, вилл и бизнеса.") },
        { id: "offgrid", title: L("Taşınabilir & Off-Grid Paketler", "Portable & Off-Grid Packages", "Tragbare & Off-Grid-Pakete", "Портативные и off-grid пакеты"), desc: L("Jel akülü, şebekeden bağımsız; bağ evi, karavan ve kulübe için hazır kitler.", "Gel-battery, off-grid ready kits for cabins, caravans and huts.", "Gel-Batterie, netzunabhängige Fertigsets für Gartenhäuser, Wohnmobile und Hütten.", "Готовые автономные комплекты с гелевым аккумулятором для дач, караванов и хижин.") },
        { id: "irrigation", title: L("Tarımsal Sulama Paketleri", "Agricultural Irrigation Packages", "Pakete für landwirtschaftliche Bewässerung", "Пакеты для аграрного полива"), desc: L("Mazotsuz, şebekesiz güneş enerjili sulama pompa sistemleri.", "Diesel-free, off-grid solar irrigation pump systems.", "Dieselfreie, netzunabhängige solare Bewässerungspumpensysteme.", "Солнечные насосные системы полива без дизеля и без сети.") }
      ];
      var out = "";
      GROUPS.forEach(function (g) {
        var items = CFG.packages.filter(function (p) { return (p.group || "ongrid") === g.id; });
        if (!items.length) return;
        out += '<div class="pkg-group">' +
          '<div class="pkg-group-head reveal"><h2>' + g.title + "</h2><p>" + g.desc + "</p></div>" +
          '<div class="pkg-grid">' + items.map(card).join("") + "</div></div>";
      });
      grid.innerHTML = out;
      try {
        var s = doc.createElement("script"); s.type = "application/ld+json";
        s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "GESPA Enerji", itemListElement: ld.map(function (o, i) { return { "@type": "ListItem", position: i + 1, item: o }; }) });
        doc.head.appendChild(s);
      } catch (e) {}
    })();
    // ---- PV Su Isıtıcı model tablosu (su-isitici.html) ----
    (function renderHeater() {
      var tb = $("#heaterRows");
      if (!tb || !CFG.heater || !CFG.heater.models) return;
      var nf = new Intl.NumberFormat("tr-TR");
      tb.innerHTML = CFG.heater.models.map(function (m) {
        var tank = L("Emaye", "Enamel", "Email", "Эмаль");
        return "<tr><td>" + m.cap + " L</td><td>" + m.pv + " W</td><td>" + m.dim + "</td><td>" + m.ac + " kW</td><td>" + tank + "</td><td class=\"spec-price\">" + (m.price ? "₺" + nf.format(m.price) : "—") + "</td></tr>";
      }).join("");
      var prices = CFG.heater.models.map(function (m) { return m.price; }).filter(Boolean);
      var fromEl = $("#heaterFrom");
      if (fromEl && prices.length) {
        var mn = "₺" + nf.format(Math.min.apply(null, prices));
        fromEl.textContent = L(mn + "'dan başlayan fiyatlarla", "from " + mn, "ab " + mn, "от " + mn);
      }
    })();
    if (window.GESPA && GESPA.applyLang) GESPA.applyLang(GESPA.lang || "tr");
  })();

  /* ---- Analitik (yalnızca config'te ID varsa — GA4) ---- */
  (function () {
    var id = CFG.analytics && CFG.analytics.ga4;
    if (!id) return; // ID yoksa hiçbir script yüklenmez
    var s = doc.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    doc.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true });
  })();

  /* ---- Sabit mobil CTA çubuğu (her sayfada) ---- */
  (function () {
    var c = CFG.company; if (!c || !c.phone) return;
    if ($(".mobile-cta")) return;
    var bar = doc.createElement("div");
    bar.className = "mobile-cta";
    bar.setAttribute("aria-label", L("Hızlı iletişim", "Quick contact", "Schnellkontakt", "Быстрая связь"));
    bar.innerHTML =
      '<a class="mcta mcta-call" href="tel:' + c.phone.tel + '">📞 ' + L("Hemen Ara", "Call now", "Anrufen", "Позвонить") + '</a>' +
      '<a class="mcta mcta-wa" href="https://wa.me/' + c.phone.wa + '" target="_blank" rel="noopener">💬 WhatsApp</a>' +
      '<a class="mcta mcta-quote" href="iletisim.html">' + L("Ücretsiz Keşif", "Free Survey", "Beratung", "Бесплатно") + '</a>';
    doc.body.appendChild(bar);
  })();

  /* ---- Akıllı asistan (sohbet botu) yükle ---- */
  (function () {
    if (window.__gchatLoaded) return;
    var sub = /^\/(en|de|ru)\//.test(location.pathname);
    var s = doc.createElement("script"); s.defer = true;
    s.src = (sub ? "/assets/" : "assets/") + "chatbot.js";
    doc.body.appendChild(s);
  })();

  /* ---- Tema (açık/koyu) ---- */
  var themeToggle = $("#themeToggle");
  var saved = null;
  try { saved = localStorage.getItem("gespa-theme"); } catch (e) {}
  if (saved) doc.documentElement.setAttribute("data-theme", saved);
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var cur = doc.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      doc.documentElement.setAttribute("data-theme", cur);
      try { localStorage.setItem("gespa-theme", cur); } catch (e) {}
    });
  }

  /* ---- Mobil menü ---- */
  var hamburger = $("#hamburger");
  var menu = $("#menu");
  if (hamburger && menu) {
    hamburger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Scroll progress + başa dön ---- */
  var progress = $("#scrollProgress");
  var backTop = $("#backTop");
  function onScroll() {
    var st = doc.documentElement.scrollTop || doc.body.scrollTop;
    var h = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
    if (backTop) backTop.classList.toggle("show", st > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (backTop) backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---- Yumuşak kaydırma ---- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var t = doc.querySelector(id);
        if (t) { ev.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }
    });
  });

  /* ---- Reveal on scroll ---- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Sayaç animasyonu ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- Tasarruf hesaplayıcı (çok yöntemli: fatura / tüketim / çatı alanı) ---- */
  (function () {
    var city = $("#city"), price = $("#price");
    var bill = $("#bill"), cons = $("#cons"), area = $("#area");
    var pumpKw = $("#pumpKw"), pumpHours = $("#pumpHours"), pumpMonths = $("#pumpMonths");
    if (!city && !bill) return; // bu sayfada hesaplayıcı yoksa çık

    var k = (window.GESPA && window.GESPA.config && window.GESPA.config.calc) || {};
    var PANEL_W = k.panelW || 550;            // Wp panel gücü
    var AREA_PER_KWP = k.areaPerKwp || 6;     // m² / kWp
    var COST_PER_KWP = k.costPerKwp || 28000; // ₺ / kWp
    var CO2_PER_KWH = k.co2PerKwh || 0.45;    // kg CO2 / kWh
    var TREE_KG = k.treeKg || 22;             // kg CO2 / ağaç / yıl
    var YEARS = k.years || 25;
    var method = "bill";

    function fmt(n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); }
    function fmt1(n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n); }
    function set(sel, val) { var el = $(sel); if (el) el.textContent = val; }

    var methodBtns = $$(".calc-methods button");
    var groups = $$(".calc-input-group");
    methodBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        method = b.getAttribute("data-method");
        methodBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
        groups.forEach(function (g) { g.classList.toggle("active", g.getAttribute("data-group") === method); });
        calc();
      });
    });

    var orient = $("#orient"), infl = $("#infl");
    var DEG = (k.degradation || 0) / 100;            // yıllık verim kaybı
    var CO2_PER_CAR_KM = k.co2PerCarKm || 0.12;      // kg CO2 / km
    var chartEl = $("#calcChart"), chartNote = $("#chartNote"), waBtn = $("#calcWa");
    var WA = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
    var selfEl = $("#self"), batteryEl = $("#battery"), printBtn = $("#calcPrint");
    var FEED = k.feedInFactor != null ? k.feedInFactor : 0.5;
    var BAT_SELF = k.batterySelfConsumption || 90;
    var BAT_COST_KWH = k.batteryCostPerKwh || 9000;
    var BAT_FRAC = k.batteryFraction || 0.3;

    function renderChart(cum, cost) {
      if (!chartEl) return;
      var n = cum.length, max = Math.max(cum[n - 1], cost) * 1.05 || 1;
      var W = 520, H = 200, base = H - 22, pad = 3, bw = (W - (n - 1) * pad) / n, s = "";
      for (var i = 0; i < n; i++) {
        var h = (cum[i] / max) * (base - 6), x = i * (bw + pad), y = base - h;
        s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, 0).toFixed(1) + '" rx="2" fill="' + (cum[i] >= cost ? "#0a6e4f" : "#bcd9cd") + '"/>';
      }
      var cy = base - (cost / max) * (base - 6);
      s += '<line x1="0" y1="' + cy.toFixed(1) + '" x2="' + W + '" y2="' + cy.toFixed(1) + '" stroke="#f7b500" stroke-width="2" stroke-dasharray="5 4"/>';
      s += '<text x="' + (W - 4) + '" y="' + (cy - 5).toFixed(1) + '" text-anchor="end" font-size="11" font-weight="700" fill="#f7b500">Yatırım</text>';
      for (var j = 5; j <= n; j += 5) { var lx = (j - 1) * (bw + pad) + bw / 2; s += '<text x="' + lx.toFixed(1) + '" y="' + (H - 5) + '" text-anchor="middle" font-size="10" fill="#9aa">' + j + '. yıl</text>'; }
      chartEl.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="25 yıllık kümülatif tasarruf grafiği">' + s + '</svg>';
    }

    function calc() {
      var unit = parseFloat(price && price.value) || 2.5;
      var yieldPerKwp = parseFloat(city && city.value) || 1500;
      var oFac = parseFloat(orient && orient.value) || 1;
      var inflR = (parseFloat(infl && infl.value) || 0) / 100;
      var kwp = 0;
      if (method === "area") {
        kwp = (parseFloat(area && area.value) || 0) / AREA_PER_KWP;
      } else if (method === "cons") {
        kwp = ((parseFloat(cons && cons.value) || 0) * 12) / (yieldPerKwp * oFac);
      } else if (method === "tarim") {
        var annualKwh = (parseFloat(pumpKw && pumpKw.value) || 0) * (parseFloat(pumpHours && pumpHours.value) || 0) * (parseFloat(pumpMonths && pumpMonths.value) || 0) * 30;
        kwp = annualKwh / (yieldPerKwp * oFac);
      } else {
        kwp = (((parseFloat(bill && bill.value) || 0) / unit) * 12) / (yieldPerKwp * oFac);
      }

      var prod = kwp * yieldPerKwp * oFac;           // 1. yıl üretim (kWh)
      var panels = Math.ceil((kwp * 1000) / PANEL_W);
      var reqArea = kwp * AREA_PER_KWP;
      var monthly = prod / 12;

      // Öz tüketim + mahsuplaşma (+ batarya)
      var hasBattery = !!(batteryEl && batteryEl.checked);
      var selfPct = hasBattery ? BAT_SELF : (parseFloat(selfEl && selfEl.value) || 100);
      selfPct = Math.max(0, Math.min(100, selfPct));
      var selfR = selfPct / 100;
      var effFactor = selfR + (1 - selfR) * FEED;
      var batteryKwh = 0, batteryCost = 0;
      if (hasBattery) { batteryKwh = Math.round((prod / 365) * BAT_FRAC); batteryCost = batteryKwh * BAT_COST_KWH; }

      var save = prod * unit * effFactor;            // 1. yıl tasarruf
      var cost = kwp * COST_PER_KWP + batteryCost;

      // 25 yıllık projeksiyon (degradasyon + elektrik zammı)
      var lifeProd = 0, lifeSave = 0, cum = [], running = 0, payback = 0;
      for (var y = 0; y < YEARS; y++) {
        var py = prod * Math.pow(1 - DEG, y);
        var pr = unit * Math.pow(1 + inflR, y);
        lifeProd += py;
        var sy = py * pr * effFactor;
        lifeSave += sy;
        running += sy;
        cum.push(running);
        if (payback === 0 && running >= cost && cost > 0) {
          var prev = running - sy;
          payback = y + (cost - prev) / sy;          // ara değer (kesirli yıl)
        }
      }
      var net = lifeSave - cost;
      var roi = cost > 0 ? (net / cost) * 100 : 0;
      var co2 = (prod * CO2_PER_KWH) / 1000;         // ton/yıl
      var co225 = (lifeProd * CO2_PER_KWH) / 1000;   // ton (25 yıl)
      var trees = (prod * CO2_PER_KWH) / TREE_KG;
      var carKm = (lifeProd * CO2_PER_KWH) / CO2_PER_CAR_KM;

      var ok = kwp > 0 && isFinite(kwp);
      var u = (window.GESPA && GESPA.units && GESPA.units[GESPA.lang]) || (window.GESPA && GESPA.units && GESPA.units.tr) || {};
      set("#rSize", ok ? fmt1(kwp) + " kWp" : "—");
      set("#rPanels", ok ? fmt(panels) + " " + (u.adet || "adet") : "—");
      set("#rArea", ok ? fmt(reqArea) + " m²" : "—");
      set("#rProd", ok ? fmt(prod) + " kWh/" + (u.year || "yıl") : "—");
      set("#rMonthly", ok ? fmt(monthly) + " kWh" : "—");
      set("#rPayback", ok && payback > 0 ? fmt1(payback) + " " + (u.yil || "yıl") : (ok ? (u.yilPlus || "25+ yıl") : "—"));
      set("#rSave", ok ? "₺" + fmt(save) + "/" + (u.year || "yıl") : "—");
      set("#rMonthlySave", ok ? "₺" + fmt(save / 12) + "/" + (u.ay || "ay") : "—");
      set("#rCost", ok ? "₺" + fmt(cost) : "—");
      set("#rSave25", ok ? "₺" + fmt(lifeSave) : "—");
      set("#rNet", ok ? "₺" + fmt(net) : "—");
      set("#rRoi", ok ? "%" + fmt(roi) : "—");
      set("#rCo2", ok ? fmt1(co2) + " " + (u.ton || "ton") + "/" + (u.year || "yıl") : "—");
      set("#rCo225", ok ? fmt(co225) + " " + (u.ton || "ton") : "—");
      set("#rTrees", ok ? fmt(trees) + " " + (u.agac || "ağaç") : "—");
      set("#rCarKm", ok ? fmt(carKm) + " " + (u.km || "km") : "—");
      set("#rBattery", ok ? (hasBattery ? fmt(batteryKwh) + " kWh · ₺" + fmt(batteryCost) : (u.added || "Eklenmedi")) : "—");

      if (ok) {
        renderChart(cum, cost);
        if (chartNote) chartNote.textContent = payback > 0
          ? L("Yatırım yaklaşık " + fmt1(payback) + ". yılda geri ödenir; sonraki yıllar net kazanç (sarı çizgi = yatırım tutarı).",
              "The investment pays back in about " + fmt1(payback) + " years; net gain afterwards (yellow line = investment).",
              "Die Investition amortisiert sich in ca. " + fmt1(payback) + " Jahren; danach Nettogewinn (gelbe Linie = Investition).",
              "Инвестиция окупается примерно за " + fmt1(payback) + " лет; далее чистая прибыль (жёлтая линия = инвестиция).")
          : L("Seçilen değerlerle yatırım 25 yıl içinde geri ödenmiyor; girdileri güncelleyin.",
              "With these values it doesn't pay back within 25 years; adjust the inputs.",
              "Mit diesen Werten amortisiert sich die Anlage nicht in 25 Jahren; bitte Eingaben anpassen.",
              "При этих значениях окупаемость не достигается за 25 лет; измените параметры.");
        if (waBtn && WA) {
          var pb = payback > 0 ? fmt1(payback) + " " + (u.yil || "yıl") : (u.yilPlus || "25+ yıl");
          var msg = L(
            "Merhaba, GESPA Enerji hesaplayıcısından sonuç aldım:\n• Sistem: " + fmt1(kwp) + " kWp (" + fmt(panels) + " panel)\n• Yıllık tasarruf: ₺" + fmt(save) + "\n• Geri ödeme: " + pb + "\nÜcretsiz keşif talep ediyorum.",
            "Hello, here is my result from the GESPA calculator:\n• System: " + fmt1(kwp) + " kWp (" + fmt(panels) + " panels)\n• Annual savings: ₺" + fmt(save) + "\n• Payback: " + pb + "\nI'd like a free site survey.",
            "Hallo, mein Ergebnis vom GESPA-Rechner:\n• Anlage: " + fmt1(kwp) + " kWp (" + fmt(panels) + " Module)\n• Jährliche Ersparnis: ₺" + fmt(save) + "\n• Amortisation: " + pb + "\nIch möchte eine kostenlose Beratung.",
            "Здравствуйте, мой результат из калькулятора GESPA:\n• Система: " + fmt1(kwp) + " кВт (" + fmt(panels) + " панелей)\n• Годовая экономия: ₺" + fmt(save) + "\n• Окупаемость: " + pb + "\nХочу бесплатный выезд."
          );
          waBtn.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
        }
      } else if (chartEl) {
        chartEl.innerHTML = ""; if (chartNote) chartNote.textContent = "";
      }
    }

    [bill, cons, area, city, price, orient, infl, selfEl, pumpKw, pumpHours, pumpMonths].forEach(function (el) {
      if (el) el.addEventListener("input", calc);
    });
    if (orient) orient.addEventListener("change", calc);
    if (batteryEl) batteryEl.addEventListener("change", calc);
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    document.addEventListener("gespa:lang", calc);
    // URL ile yöntem seçimi (ör. hesaplayici.html#tarim)
    var hashM = (location.hash || "").replace("#", "");
    if (["bill", "cons", "area", "tarim"].indexOf(hashM) >= 0) {
      var hb = document.querySelector('.calc-methods button[data-method="' + hashM + '"]');
      if (hb) hb.click();
    }
    calc();
  })();

  /* ---- Solar sulama pompası seçim aracı ---- */
  (function () {
    var w = $("#pumpWater"); if (!w) return;
    var head = $("#pumpHead"), sun = $("#pumpSun");
    var k = (window.GESPA && window.GESPA.config && window.GESPA.config.calc) || {};
    var P = k.pump || {};
    var EFF = P.pumpEfficiency || 0.4, OVER = P.pvOversize || 1.3, HP = P.hpPerKw || 1.341;
    var PANEL_W = k.panelW || 550, COST = k.costPerKwp || 28000;
    if (!w.value && P.defaultWater != null) w.value = P.defaultWater;
    if (head && !head.value && P.defaultHead != null) head.value = P.defaultHead;
    if (sun && !sun.value && P.defaultSun != null) sun.value = P.defaultSun;
    function nf(n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); }
    function f1(n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n); }
    function st(sel, v) { var e = $(sel); if (e) e.textContent = v; }
    st("#pAEff", "%" + Math.round(EFF * 100));
    st("#pAOver", f1(OVER) + "×");
    function calcPump() {
      var u = (window.GESPA && GESPA.units && GESPA.units[GESPA.lang]) || {};
      var vol = parseFloat(w.value) || 0, H = parseFloat(head && head.value) || 0, hrs = parseFloat(sun && sun.value) || 0;
      var Q = hrs > 0 ? vol / hrs : 0;            // m³/saat
      var hyd = Q * H * 0.002725;                 // kW (ρg/3.6e6)
      var pkw = EFF > 0 ? hyd / EFF : 0;           // kW pompa elektriksel
      var kwp = pkw * OVER;
      var panels = Math.ceil((kwp * 1000) / PANEL_W);
      var cost = kwp * COST;
      var ok = vol > 0 && H > 0 && pkw > 0 && isFinite(pkw);
      var hr = L("saat", "h", "Std.", "ч");
      st("#rFlow", ok ? f1(Q) + " m³/" + hr : "—");
      st("#rPump", ok ? f1(pkw) + " kW" : "—");
      st("#rPumpHp", ok ? f1(pkw * HP) + " HP" : "—");
      st("#rPumpKwp", ok ? f1(kwp) + " kWp" : "—");
      st("#rPumpPanels", ok ? nf(panels) + " " + (u.adet || "adet") : "—");
      st("#rPumpCost", ok ? "₺" + nf(cost) : "—");
    }
    [w, head, sun].forEach(function (el) { if (el) el.addEventListener("input", calcPump); });
    document.addEventListener("gespa:lang", calcPump);
    calcPump();
  })();

  /* ---- Alet çantası (mühendislik araçları) ---- */
  (function () {
    var box = $(".toolbox"); if (!box) return;
    var k = (window.GESPA && window.GESPA.config && window.GESPA.config.calc) || {};
    var PANEL_W = k.panelW || 550, COST = k.costPerKwp || 28000;
    var nf = function (n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); };
    var f1 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n); };
    var f2 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n); };
    var set = function (sel, v) { var e = $(sel); if (e) e.textContent = v; };

    // Aktif aracın sonucunu WhatsApp'tan gönderme
    var summaries = {}, activeTool = "layout";
    var WA = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
    var waBtn = $("#toolWa");
    function updateWa() {
      if (!waBtn) return;
      var sm = summaries[activeTool];
      if (!WA || !sm) { waBtn.style.display = "none"; return; }
      waBtn.style.display = "";
      var msg = L("Merhaba, GESPA hesaplayıcı aracından sonuç:", "Hello, here is a result from the GESPA tool:", "Hallo, hier ein Ergebnis aus dem GESPA-Tool:", "Здравствуйте, результат из инструмента GESPA:")
        + "\n" + sm + "\n"
        + L("Ücretsiz keşif talep ediyorum.", "I'd like a free site survey.", "Ich möchte eine kostenlose Beratung.", "Хочу бесплатный выезд.");
      waBtn.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    }
    var printBtn = $("#toolPrint");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    // Sekme geçişi
    var tabs = $$(".tool-tabs button", box), panels = $$(".tool-panel", box);
    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-tool");
        activeTool = t;
        tabs.forEach(function (x) { x.classList.toggle("active", x === b); });
        panels.forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-toolpanel") === t); });
        updateWa();
      });
    });

    // Varsayılan bölge verimi (yıllık özgül üretim) — yerleşim üretim tahmini için
    var defYield = 1500;
    if (k.regions && k.regions.length) { var dr = k.regions.filter(function (r) { return r.default; })[0] || k.regions[0]; defYield = dr.yield || 1500; }

    /* 1) Panel yerleşim planlayıcı (kenar boşluğu + engel desteği) */
    (function () {
      var W = $("#roofW"), D = $("#roofD"), O = $("#panelOrient"), G = $("#layoutGap"), M = $("#roofMargin");
      if (!W) return;
      var P = k.panelDims || { short: 1.134, long: 2.279 };
      var ObsOn = $("#obsOn"), obsFields = $("#obsFields");
      var oX = $("#obsX"), oY = $("#obsY"), oW = $("#obsW"), oH = $("#obsH");
      if (G && !G.value && k.layoutGap != null) G.value = k.layoutGap;
      if (M && !M.value && k.layoutMargin != null) M.value = k.layoutMargin;
      var viz = $("#lyViz");
      set("#lyDims", L("Panel ölçüsü: ", "Panel size: ", "Modulmaß: ", "Размер панели: ") + f2(P.short) + " × " + f2(P.long) + " m");

      // Panel hücresi (px,py,pw,ph) engel diktörtgeniyle çakışıyor mu
      function hits(px, py, pw, ph, ob) {
        if (!ob) return false;
        return !(px + pw <= ob.x || px >= ob.x + ob.w || py + ph <= ob.y || py >= ob.y + ob.h);
      }

      function calc() {
        var rw = parseFloat(W.value) || 0, rd = parseFloat(D.value) || 0;
        var gap = parseFloat(G && G.value) || 0;
        var mar = parseFloat(M && M.value) || 0;
        var portrait = !O || O.value === "portrait";
        var pw = portrait ? P.short : P.long;   // satır boyunca genişlik
        var ph = portrait ? P.long : P.short;   // derinlik boyunca yükseklik
        if (obsFields) obsFields.hidden = !(ObsOn && ObsOn.checked);
        var ob = (ObsOn && ObsOn.checked) ? {
          x: parseFloat(oX && oX.value) || 0, y: parseFloat(oY && oY.value) || 0,
          w: parseFloat(oW && oW.value) || 0, h: parseFloat(oH && oH.value) || 0
        } : null;
        if (ob && (ob.w <= 0 || ob.h <= 0)) ob = null;

        // Kullanılabilir alan (kenar boşluğu çıkarılır), yerleşim mar ofsetiyle başlar
        var uw = Math.max(0, rw - 2 * mar), ud = Math.max(0, rd - 2 * mar);
        var cols = Math.max(0, Math.floor((uw + gap) / (pw + gap)));
        var rows = Math.max(0, Math.floor((ud + gap) / (ph + gap)));

        var placed = 0, cells = [];
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var px = mar + c * (pw + gap), py = mar + r * (ph + gap);
          var blocked = hits(px, py, pw, ph, ob);
          if (!blocked) placed++;
          cells.push({ x: px, y: py, blocked: blocked });
        }
        var total = placed;
        var kwp = total * PANEL_W / 1000;
        var used = total * pw * ph;
        var fill = (rw * rd) > 0 ? used / (rw * rd) * 100 : 0;
        var prod = kwp * defYield;
        var ok = total > 0;
        set("#lyPanels", ok ? nf(total) + " " + L("adet", "pcs", "Stk.", "шт.") : "—");
        set("#lyGrid", ok ? cols + " × " + rows + (ob ? " − " + L("engel", "obstacle", "Hindernis", "препятствие") : "") : "—");
        set("#lyKwp", ok ? f1(kwp) + " kWp" : "—");
        set("#lyArea", ok ? nf(used) + " m²" : "—");
        set("#lyFill", ok ? "%" + nf(fill) : "—");
        set("#lyProd", ok ? nf(prod) + " kWh/" + L("yıl", "yr", "Jahr", "год") : "—");
        summaries.layout = ok ? ("Panel yerleşim: " + nf(total) + " panel" + (ob ? " (engelli)" : "") + ", " + f1(kwp) + " kWp, ~" + nf(prod) + " kWh/yıl") : "";
        updateWa();
        renderViz(rw, rd, pw, ph, cells, ob);
      }

      function renderViz(rw, rd, pw, ph, cells, ob) {
        if (!viz) return;
        if (!(rw > 0 && rd > 0) || !cells.length) { viz.innerHTML = ""; return; }
        var VW = 320, scale = VW / rw, VH = rd * scale;
        var s = '<svg viewBox="0 0 ' + VW.toFixed(1) + ' ' + VH.toFixed(1) + '" width="100%" role="img" aria-label="Panel yerleşim planı">';
        s += '<rect x="0" y="0" width="' + VW.toFixed(1) + '" height="' + VH.toFixed(1) + '" fill="none" stroke="#9aa" stroke-width="1.5" rx="3"/>';
        var cw = pw * scale, ch = ph * scale;
        cells.forEach(function (cell) {
          var x = cell.x * scale, y = cell.y * scale;
          var fill = cell.blocked ? "#cbd5d0" : "#0a6e4f";
          var op = cell.blocked ? "0.5" : "0.82";
          s += '<rect x="' + (x + 1).toFixed(1) + '" y="' + (y + 1).toFixed(1) + '" width="' + Math.max(cw - 1, 0).toFixed(1) + '" height="' + Math.max(ch - 1, 0).toFixed(1) + '" fill="' + fill + '" opacity="' + op + '" rx="1"/>';
        });
        if (ob) {
          s += '<rect x="' + (ob.x * scale).toFixed(1) + '" y="' + (ob.y * scale).toFixed(1) + '" width="' + (ob.w * scale).toFixed(1) + '" height="' + (ob.h * scale).toFixed(1) + '" fill="#c0392b" opacity="0.7" rx="1"/>';
        }
        s += '</svg>';
        viz.innerHTML = s;
      }
      [W, D, G, M, oX, oY, oW, oH].forEach(function (e) { if (e) e.addEventListener("input", calc); });
      if (O) O.addEventListener("change", calc);
      if (ObsOn) ObsOn.addEventListener("change", calc);
      document.addEventListener("gespa:lang", calc);
      calc();
    })();

    /* 2) İnverter boyutlandırma */
    (function () {
      var Kwp = $("#invKwp"), R = $("#invRatio"); if (!Kwp) return;
      var IR = k.inverterRatio || { min: 1.1, def: 1.2, max: 1.3 };
      if (R && !R.value && IR.def != null) R.value = IR.def;
      function calc() {
        var kwp = parseFloat(Kwp.value) || 0;
        var ratio = parseFloat(R && R.value) || IR.def || 1.2;
        var ok = kwp > 0 && ratio > 0;
        var rec = kwp / ratio;
        var lo = kwp / (IR.max || 1.3), hi = kwp / (IR.min || 1.1);
        set("#invRec", ok ? f1(rec) + " kW" : "—");
        set("#invRange", ok ? f1(lo) + " – " + f1(hi) + " kW" : "—");
        set("#invPanels", ok ? nf(Math.ceil(kwp * 1000 / PANEL_W)) + " " + L("adet", "pcs", "Stk.", "шт.") : "—");
        set("#invDcac", ok ? f2(ratio) : "—");
        summaries.inverter = ok ? ("İnverter: ~" + f1(rec) + " kW (sistem " + f1(kwp) + " kWp, DC/AC " + f2(ratio) + ")") : "";
        updateWa();
      }
      [Kwp, R].forEach(function (e) { if (e) e.addEventListener("input", calc); });
      document.addEventListener("gespa:lang", calc);
      calc();
    })();

    /* 3) DC kablo kesiti / gerilim düşümü */
    (function () {
      var I = $("#cbI"), V = $("#cbV"), Len = $("#cbLen"); if (!I) return;
      var C = k.cable || {};
      var RHO = C.rhoCu || 0.0175, SECTIONS = C.sections || [4, 6, 10, 16, 25], TARGET = C.targetDropPct != null ? C.targetDropPct : 1.0;
      if (!I.value && C.defI != null) I.value = C.defI;
      if (V && !V.value && C.defV != null) V.value = C.defV;
      if (Len && !Len.value && C.defLen != null) Len.value = C.defLen;
      set("#cbTarget", "%" + f1(TARGET));
      function calc() {
        var i = parseFloat(I.value) || 0, v = parseFloat(V && V.value) || 0, l = parseFloat(Len && Len.value) || 0;
        var ok = i > 0 && v > 0 && l > 0;
        var rec = null, rows = "";
        SECTIONS.forEach(function (S) {
          var drop = 2 * i * l * RHO / S;          // volt
          var pct = v > 0 ? drop / v * 100 : 0;
          var good = pct <= TARGET;
          if (good && rec === null) rec = S;
          rows += '<div class="cable-row' + (good ? " ok" : "") + '"><span>' + S + ' mm²</span><span>' + (ok ? f2(drop) + " V" : "—") + '</span><span>' + (ok ? "%" + f2(pct) : "—") + '</span></div>';
        });
        var head = '<div class="cable-row cable-head"><span>' + L("Kesit", "Section", "Querschnitt", "Сечение") + '</span><span>' + L("Düşüm", "Drop", "Abfall", "Падение") + '</span><span>%</span></div>';
        $("#cbTable").innerHTML = ok ? head + rows : "";
        set("#cbRec", ok ? (rec ? rec + " mm²" : L("≥ 25 mm² gerekli", "≥ 25 mm² needed", "≥ 25 mm² nötig", "нужно ≥ 25 мм²")) : "—");
        summaries.cable = ok ? ("DC kablo: önerilen " + (rec ? rec + " mm²" : "≥25 mm²") + " (I=" + i + "A, L=" + l + "m, V=" + v + "V)") : "";
        updateWa();
      }
      [I, V, Len].forEach(function (e) { if (e) e.addEventListener("input", calc); });
      document.addEventListener("gespa:lang", calc);
      calc();
    })();

    /* 4) Batarya / depolama boyutlandırma */
    (function () {
      var Daily = $("#btDaily"), Days = $("#btDays"), Dod = $("#btDod"); if (!Daily) return;
      var S = k.storage || {};
      var SYS = S.sysEff || 0.9, BCOST = k.batteryCostPerKwh || 9000;
      if (!Daily.value && S.defDailyKwh != null) Daily.value = S.defDailyKwh;
      if (Days && !Days.value && S.defAutonomy != null) Days.value = S.defAutonomy;
      if (Dod && !Dod.value && S.dod != null) Dod.value = Math.round(S.dod * 100);
      function calc() {
        var d = parseFloat(Daily.value) || 0, days = parseFloat(Days && Days.value) || 0;
        var dod = (parseFloat(Dod && Dod.value) || 90) / 100;
        dod = Math.max(0.1, Math.min(1, dod));
        var need = d * days;
        var kwh = (dod * SYS) > 0 ? need / (dod * SYS) : 0;
        var ok = need > 0;
        set("#btNeed", ok ? f1(need) + " kWh" : "—");
        set("#btKwh", ok ? f1(kwh) + " kWh" : "—");
        set("#btCost", ok ? "₺" + nf(kwh * BCOST) : "—");
        summaries.battery = ok ? ("Batarya: " + f1(kwh) + " kWh, ~₺" + nf(kwh * BCOST)) : "";
        updateWa();
      }
      [Daily, Days, Dod].forEach(function (e) { if (e) e.addEventListener("input", calc); });
      document.addEventListener("gespa:lang", calc);
      calc();
    })();

    /* 5) Sıra aralığı / gölgelenme */
    (function () {
      var T = $("#rsTilt"), Lat = $("#rsLat"), Len = $("#rsLen"); if (!T) return;
      var SH = k.shading || { declination: 23.45, defTilt: 30, defLat: 37 };
      var DECL = SH.declination || 23.45;
      var modLong = (k.panelDims && k.panelDims.long) || 2.279;
      if (!T.value && SH.defTilt != null) T.value = SH.defTilt;
      if (Lat && !Lat.value && SH.defLat != null) Lat.value = SH.defLat;
      if (Len && !Len.value) Len.value = modLong;
      var rad = function (d) { return d * Math.PI / 180; };
      function calc() {
        var beta = parseFloat(T.value) || 0, lat = parseFloat(Lat && Lat.value) || 0, Lm = parseFloat(Len && Len.value) || 0;
        var alpha = 90 - lat - DECL;                 // kış gündönümü öğle güneş yüksekliği (°)
        var feasible = alpha > 0 && Lm > 0;
        var H = Lm * Math.sin(rad(beta));            // dikey yükseklik
        var base = Lm * Math.cos(rad(beta));         // yatay izdüşüm
        var gap = feasible ? H / Math.tan(rad(alpha)) : 0;
        var pitch = base + gap;
        var gcr = pitch > 0 ? Lm / pitch * 100 : 0;
        set("#rsAlt", alpha > 0 ? f1(alpha) + "°" : L("Bu enlemde uygun değil", "Not feasible at this latitude", "Bei diesem Breitengrad nicht möglich", "Невозможно на этой широте"));
        set("#rsGap", feasible ? f2(gap) + " m" : "—");
        set("#rsPitch", feasible ? f2(pitch) + " m" : "—");
        set("#rsGcr", feasible ? "%" + nf(gcr) : "—");
        summaries.row = feasible ? ("Sıra aralığı: boşluk " + f2(gap) + " m, pitch " + f2(pitch) + " m, GCR %" + nf(gcr) + " (eğim " + nf(beta) + "°, enlem " + f1(lat) + "°)") : "";
        updateWa();
      }
      [T, Lat, Len].forEach(function (e) { if (e) e.addEventListener("input", calc); });
      document.addEventListener("gespa:lang", calc);
      calc();
    })();

    updateWa();
  })();

  /* ---- Proje filtreleri ---- */
  var filters = $$(".filter");
  var projects = $$(".project");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var f = btn.getAttribute("data-filter");
      projects.forEach(function (p) {
        var show = f === "all" || p.getAttribute("data-cat") === f;
        p.classList.toggle("hide", !show);
      });
    });
  });

  /* ---- Galeri lightbox ---- */
  var gallery = $(".gallery");
  if (gallery) {
    var lb = doc.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = '<button class="lightbox-close" aria-label="Kapat">×</button><img alt="" />';
    doc.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    gallery.addEventListener("click", function (e) {
      if (e.target.tagName === "IMG") { lbImg.src = e.target.src; lb.classList.add("open"); }
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) lb.classList.remove("open"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });
  }

  /* ---- Müşteri yorumları slider ---- */
  var track = $("#testiTrack");
  var dotsWrap = $("#testiDots");
  if (track && dotsWrap) {
    var slides = $$(".testi", track);
    var idx = 0, timer;
    slides.forEach(function (_, i) {
      var d = doc.createElement("button");
      d.setAttribute("aria-label", "Yorum " + (i + 1));
      if (i === 0) d.classList.add("active");
      d.addEventListener("click", function () { go(i); reset(); });
      dotsWrap.appendChild(d);
    });
    var dots = $$("button", dotsWrap);
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -idx * 100 + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("active", di === idx); });
    }
    function next() { go(idx + 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 5000); }
    reset();
  }

  /* ---- SSS akordeon ---- */
  $$(".faq-item").forEach(function (item) {
    var q = $(".faq-q", item);
    var a = $(".faq-a", item);
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* ---- İletişim formu ---- */
  var form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $("#form-note");
      var ad = form.ad.value.trim();
      var tel = form.tel.value.trim();
      if (!ad || !tel) {
        if (note) { note.style.color = "#c0392b"; note.textContent = L("Lütfen ad ve telefon alanlarını doldurun.", "Please fill in your name and phone.", "Bitte Name und Telefon ausfüllen.", "Пожалуйста, заполните имя и телефон."); }
        return;
      }
      if (form.kvkkOnay && !form.kvkkOnay.checked) {
        if (note) { note.style.color = "#c0392b"; note.textContent = L("Devam etmek için KVKK aydınlatma metnini onaylayın.", "Please accept the privacy notice to continue.", "Bitte akzeptieren Sie die Datenschutzerklärung.", "Подтвердите согласие на обработку данных."); }
        return;
      }
      var wa = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      if (wa) {
        var m = L("Yeni teklif talebi", "New quote request", "Neue Angebotsanfrage", "Новая заявка") + ":\n"
          + "Ad: " + ad + "\nTel: " + tel
          + (form.eposta && form.eposta.value ? "\nE-posta: " + form.eposta.value : "")
          + (form.tip && form.tip.value ? "\nTip: " + form.tip.value : "")
          + (form.sehir && form.sehir.value ? "\nŞehir: " + form.sehir.value : "")
          + (form.mesaj && form.mesaj.value ? "\n" + form.mesaj.value : "");
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(m), "_blank");
      }
      if (note) {
        note.style.color = "var(--green)";
        note.textContent = L("Teşekkürler " + ad + "! Talebiniz WhatsApp üzerinden iletiliyor.", "Thank you " + ad + "! Your request is being sent via WhatsApp.", "Danke " + ad + "! Ihre Anfrage wird über WhatsApp gesendet.", "Спасибо, " + ad + "! Ваш запрос отправляется через WhatsApp.");
      }
      form.reset();
    });
  }

  /* ---- Tarımsal sulama teklif formu (kampanya) ---- */
  var irrForm = $("#irrigationForm");
  if (irrForm) {
    irrForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $("#irrigation-note");
      var ad = irrForm.ad.value.trim(), tel = irrForm.tel.value.trim();
      if (!ad || !tel) {
        if (note) { note.style.color = "#c0392b"; note.textContent = L("Lütfen ad ve telefon alanlarını doldurun.", "Please fill in your name and phone.", "Bitte Name und Telefon ausfüllen.", "Пожалуйста, заполните имя и телефон."); }
        return;
      }
      if (irrForm.kvkkOnay && !irrForm.kvkkOnay.checked) {
        if (note) { note.style.color = "#c0392b"; note.textContent = L("Devam etmek için KVKK aydınlatma metnini onaylayın.", "Please accept the privacy notice to continue.", "Bitte akzeptieren Sie die Datenschutzerklärung.", "Подтвердите согласие на обработку данных."); }
        return;
      }
      var wa = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      if (wa) {
        var val = function (n) { return irrForm[n] && irrForm[n].value ? irrForm[n].value : ""; };
        var m = "🌾 " + L("Tarımsal sulama teklif talebi", "Agricultural irrigation quote request", "Anfrage Solarbewässerung", "Заявка на солнечное орошение") + ":\n"
          + "Ad: " + ad + "\nTel: " + tel
          + (val("pompa") ? "\nPompa: " + val("pompa") : "")
          + (val("enerji") ? "\nMevcut enerji: " + val("enerji") : "")
          + (val("su") ? "\nGünlük su: " + val("su") + " m³" : "")
          + (val("derinlik") ? "\nBasma yüksekliği: " + val("derinlik") + " m" : "")
          + (val("donum") ? "\nTarla: " + val("donum") + " dönüm" : "")
          + (val("lokasyon") ? "\nLokasyon: " + val("lokasyon") : "");
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(m), "_blank");
      }
      if (note) { note.style.color = "var(--green)"; note.textContent = L("Teşekkürler " + ad + "! Talebiniz WhatsApp üzerinden iletiliyor.", "Thank you " + ad + "! Your request is being sent via WhatsApp.", "Danke " + ad + "! Ihre Anfrage wird über WhatsApp gesendet.", "Спасибо, " + ad + "! Ваш запрос отправляется через WhatsApp."); }
      irrForm.reset();
    });
  }

  /* ---- Bülten formu ---- */
  var news = $("#newsForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#newsNote");
      if (n) n.textContent = L("Aboneliğiniz alındı, teşekkürler!", "You're subscribed, thank you!", "Anmeldung erhalten, danke!", "Подписка оформлена, спасибо!");
      news.reset();
    });
  }
})();
