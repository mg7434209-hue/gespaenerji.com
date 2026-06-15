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

  /* ---- Tasarruf hesaplayıcı ---- */
  var bill = $("#bill"), city = $("#city"), price = $("#price");
  var COST_PER_KWP = 28000; // ₺/kWp (tahmini, güncellenebilir)
  var CO2_PER_KWH = 0.45;   // kg CO2 / kWh
  function fmt(n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); }
  function calc() {
    if (!bill || !city || !price) return;
    var monthlyBill = parseFloat(bill.value) || 0;
    var unit = parseFloat(price.value) || 2.5;
    var yieldPerKwp = parseFloat(city.value) || 1500; // kWh/kWp/yıl
    var annualKwh = (monthlyBill / unit) * 12;
    var kwp = annualKwh / yieldPerKwp;
    var prod = kwp * yieldPerKwp;
    var save = annualKwh * unit;
    var cost = kwp * COST_PER_KWP;
    var payback = save > 0 ? cost / save : 0;
    var co2 = (annualKwh * CO2_PER_KWH) / 1000; // ton
    set("#rSize", kwp > 0 ? fmt(kwp) + " kWp" : "—");
    set("#rProd", prod > 0 ? fmt(prod) + " kWh/yıl" : "—");
    set("#rSave", save > 0 ? "₺" + fmt(save) + "/yıl" : "—");
    set("#rPayback", payback > 0 ? payback.toFixed(1) + " yıl" : "—");
    set("#rCo2", co2 > 0 ? co2.toFixed(1) + " ton/yıl" : "—");
    set("#rCost", cost > 0 ? "₺" + fmt(cost) : "—");
  }
  function set(sel, val) { var el = $(sel); if (el) el.textContent = val; }
  [bill, city, price].forEach(function (el) {
    if (el) el.addEventListener("input", calc);
  });
  calc();

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
