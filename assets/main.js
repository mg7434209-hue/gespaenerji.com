/* ============================================================
   GESPA Enerji — Etkileşimler
   ============================================================ */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---- Yıl ---- */
  var yil = $("#yil");
  if (yil) yil.textContent = new Date().getFullYear();

  /* ============================================================
     TEK KAYNAK ENJEKSİYONU (assets/config.js)
     İletişim, markalar, hesaplayıcı katsayıları ve JSON-LD buradan basılır.
     ============================================================ */
  var CFG = (window.GESPA && window.GESPA.config) || {};
  function setText(sel, v) { var e = $(sel); if (e && v != null) e.textContent = v; }
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
      var price = $("#price"); if (price && !price.value && k.defaultUnitPrice != null) price.value = k.defaultUnitPrice;
      var nf = new Intl.NumberFormat("tr-TR");
      if (k.panelW != null) setText("#aPanelW", k.panelW + " Wp");
      if (k.areaPerKwp != null) setText("#aArea", k.areaPerKwp + " m²/kWp");
      if (k.costPerKwp != null) setText("#aCost", "₺" + nf.format(k.costPerKwp) + "/kWp");
      if (k.co2PerKwh != null) setText("#aCo2", new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(k.co2PerKwh) + " kg/kWh");
    }
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

    function calc() {
      var unit = parseFloat(price && price.value) || 2.5;
      var yieldPerKwp = parseFloat(city && city.value) || 1500;
      var kwp = 0;
      if (method === "area") {
        kwp = (parseFloat(area && area.value) || 0) / AREA_PER_KWP;
      } else if (method === "cons") {
        kwp = ((parseFloat(cons && cons.value) || 0) * 12) / yieldPerKwp;
      } else {
        kwp = (((parseFloat(bill && bill.value) || 0) / unit) * 12) / yieldPerKwp;
      }

      var prod = kwp * yieldPerKwp;                 // yıllık üretim (kWh)
      var panels = Math.ceil((kwp * 1000) / PANEL_W);
      var reqArea = kwp * AREA_PER_KWP;
      var monthly = prod / 12;
      var save = prod * unit;
      var cost = kwp * COST_PER_KWP;
      var payback = save > 0 ? cost / save : 0;
      var save25 = save * YEARS;
      var co2 = (prod * CO2_PER_KWH) / 1000;        // ton/yıl
      var co225 = co2 * YEARS;
      var trees = (prod * CO2_PER_KWH) / TREE_KG;

      var ok = kwp > 0 && isFinite(kwp);
      set("#rSize", ok ? fmt1(kwp) + " kWp" : "—");
      set("#rPanels", ok ? fmt(panels) + " adet" : "—");
      set("#rArea", ok ? fmt(reqArea) + " m²" : "—");
      set("#rProd", ok ? fmt(prod) + " kWh/yıl" : "—");
      set("#rMonthly", ok ? fmt(monthly) + " kWh" : "—");
      set("#rPayback", ok && payback > 0 ? fmt1(payback) + " yıl" : "—");
      set("#rSave", ok ? "₺" + fmt(save) + "/yıl" : "—");
      set("#rSave25", ok ? "₺" + fmt(save25) : "—");
      set("#rCost", ok ? "₺" + fmt(cost) : "—");
      set("#rCo2", ok ? fmt1(co2) + " ton/yıl" : "—");
      set("#rCo225", ok ? fmt(co225) + " ton" : "—");
      set("#rTrees", ok ? fmt(trees) + " ağaç" : "—");
    }

    [bill, cons, area, city, price].forEach(function (el) {
      if (el) el.addEventListener("input", calc);
    });
    calc();
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
        if (note) { note.style.color = "#c0392b"; note.textContent = "Lütfen ad ve telefon alanlarını doldurun."; }
        return;
      }
      if (note) {
        note.style.color = "var(--green)";
        note.textContent = "Teşekkürler " + ad + "! Talebiniz alındı, ekibimiz en kısa sürede sizi arayacak.";
      }
      form.reset();
    });
  }

  /* ---- Bülten formu ---- */
  var news = $("#newsForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#newsNote");
      if (n) n.textContent = "Aboneliğiniz alındı, teşekkürler!";
      news.reset();
    });
  }
})();
