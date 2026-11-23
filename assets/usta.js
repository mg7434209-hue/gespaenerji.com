/* ============================================================
   GESPA Enerji — Elektrikçi Çantası (elektrikci-cantasi.html)
   Yalnız bu sayfa yükler (defer). İki bölüm:
   1) SAF HESAPLAR  → window.GESPA.usta (test bunları vm ile çağırır)
   2) SAYFA BAĞLAMA → girdiler, sonuçlar, SVG şemalar, kontrol listesi
   KURAL: katsayı ve açılış değeri buraya YAZILMAZ; hepsi config.calc'tan
   okunur (calc.usta + ortak calc.cable / calc.shading / calc.pump /
   builder.sizing.invEff). Standart tablosu (akım taşıma kapasitesi, sigorta
   katsayısı) KULLANILMAZ: yalnız tanım ve fizik formülleri.
   Kullanıcı girdisi DOM'a yalnız textContent / createElementNS ile yazılır.
   ============================================================ */
(function (root) {
  "use strict";
  var G = root.GESPA = root.GESPA || {};

  /* ---------- 1) SAF HESAPLAR ---------- */
  var EPS = 1e-9;                     // kayan nokta payı (150 / 50 = 3 tam çıksın)
  var U = {};

  // config → bu sayfanın kullandığı katsayılar (tek okuma noktası)
  U.k = function (cfg) {
    var c = (cfg && cfg.calc) || {}, u = c.usta || {}, cb = c.cable || {}, sh = c.shading || {};
    var sz = (cfg && cfg.builder && cfg.builder.sizing) || {};
    return {
      dec: sh.declination, defLat: sh.defLat, delta: u.seasonTiltDelta, stc: u.stcTempC,
      rho: cb.rhoCu, sections: cb.sections || [], target: cb.targetDropPct,
      hpPerKw: (c.pump || {}).hpPerKw, invEff: sz.invEff, awg: u.awg || {},
      diagram: u.diagram || {}, cities: u.cities || [], def: u.defaults || {}
    };
  };

  U.fmt = function (n, d) {
    if (!isFinite(n)) return "—";
    return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: d == null ? 2 : d }).format(n);
  };
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  // 1) Öğle güneş yüksekliği = 90 − enlem ± deklinasyon (dönenceler ile kutup dairesi arasında geçerli)
  U.sun = function (lat, dec) {
    return { summer: 90 - lat + dec, equinox: 90 - lat, winter: 90 - lat - dec, valid: lat > dec && lat < 90 - dec };
  };
  // Pratik kural eğimleri: yıl boyu = enlem, yaz = enlem − delta, kış = enlem + delta
  U.tilts = function (lat, delta) {
    return { year: clamp(lat, 0, 90), summer: clamp(lat - delta, 0, 90), winter: clamp(lat + delta, 0, 90) };
  };

  // 2) Kablo: R = 2·L·ρ/S (gidiş-dönüş) · ΔV = I·R · % = ΔV/V·100 · P = I²·R
  U.cable = function (v, i, len, s, rho) {
    var r = 2 * len * rho / s, drop = i * r;
    return { r: r, drop: drop, pct: drop / v * 100, loss: i * i * r };
  };
  U.cableRec = function (v, i, len, sections, rho, target) {
    for (var n = 0; n < sections.length; n++) {
      if (U.cable(v, i, len, sections[n], rho).pct <= target + EPS) return sections[n];
    }
    return null;
  };
  // İletkenin eşdeğer dolu çapı (mm): S = π·d²/4
  U.diaOf = function (mm2) { return Math.sqrt(4 * mm2 / Math.PI); };

  // 3) Dizi: soğuk Voc = Voc·(1 + β/100·(Tmin − Tstc)) · en çok = ⌊Vmaks/soğukVoc⌋ · en az = ⌈Vmppt/Vmp⌉
  U.coldVoc = function (voc, beta, tmin, stc) { return voc * (1 + beta / 100 * (tmin - stc)); };
  U.string = function (p, stc) {
    var cold = U.coldVoc(p.voc, p.beta, p.tmin, stc);
    return {
      cold: cold,
      max: Math.floor(p.vmax / cold + EPS),
      min: p.mpptMin > 0 && p.vmp > 0 ? Math.ceil(p.mpptMin / p.vmp - EPS) : null
    };
  };

  // 4) Seri–paralel paneller: V = Vpanel·seri · A = Apanel·paralel · W = V·A
  U.array = function (v, a, s, p) { var tv = v * s, ta = a * p; return { v: tv, a: ta, w: tv * ta }; };
  // 5) Akü bankası: V = Vakü·seri · Ah = Ah·paralel · kWh = V·Ah/1000
  U.bank = function (v, ah, s, p) { var tv = v * s, tah = ah * p; return { v: tv, ah: tah, kwh: tv * tah / 1000 }; };
  // 6) Dizi sigortası: arızalı diziye akabilecek ters akım = (N − 1)·Isc; etiketteki değeri aşıyorsa gerekir
  U.fuse = function (n, isc, maxFuse) { var rev = (n - 1) * isc; return { rev: rev, needed: rev > maxFuse + EPS }; };

  // 7) Çeviriciler
  U.wToA = function (w, v) { return w / v; };
  U.aToW = function (a, v) { return a * v; };
  U.ahToWh = function (ah, v) { return ah * v; };
  U.whToAh = function (wh, v) { return wh / v; };
  U.hpToKw = function (hp, hpPerKw) { return hp / hpPerKw; };
  U.kwToHp = function (kw, hpPerKw) { return kw * hpPerKw; };
  U.awgDia = function (n, a) { return a.d36 * Math.pow(a.ratio, (a.ref - n) / a.steps); };
  U.awgArea = function (n, a) { var d = U.awgDia(n, a); return Math.PI * d * d / 4; };
  // mm² → AWG (kesirli): n = ref − steps·log_ratio(d / d36)
  U.mm2ToAwg = function (mm2, a) { return a.ref - a.steps * Math.log(U.diaOf(mm2) / a.d36) / Math.log(a.ratio); };
  U.awgLabel = function (n) { return n <= 0 ? (1 - n) + "/0" : String(n); };
  // İnverter yükünün akü tarafı akımı: I = P / (V·η)
  U.invCurrent = function (p, v, eta) { return p / (v * eta); };

  // Sayfadaki statik "örnek hesap" metinleri: araçla AYNI formül + config açılış değerleri.
  // Test, HTML'deki [data-ex] değerlerini bununla karşılaştırır.
  U.examples = function (cfg) {
    var k = U.k(cfg), f = U.fmt, d = k.def, ex = {};
    var s = U.sun(k.defLat, k.dec), t = U.tilts(k.defLat, k.delta);
    ex["egim.lat"] = f(k.defLat, 1); ex["egim.dec"] = f(k.dec, 2); ex["egim.delta"] = f(k.delta, 1);
    ex["egim.summer"] = f(s.summer, 2); ex["egim.equinox"] = f(s.equinox, 2); ex["egim.winter"] = f(s.winter, 2);
    ex["egim.tiltYear"] = f(t.year, 1); ex["egim.tiltSummer"] = f(t.summer, 1); ex["egim.tiltWinter"] = f(t.winter, 1);

    var c = d.cable, cr = U.cable(c.v, c.i, c.len, c.section, k.rho);
    ex["kablo.v"] = f(c.v); ex["kablo.i"] = f(c.i); ex["kablo.len"] = f(c.len); ex["kablo.s"] = f(c.section);
    ex["kablo.rho"] = f(k.rho, 4); ex["kablo.target"] = f(k.target, 1);
    ex["kablo.r"] = f(cr.r, 5); ex["kablo.drop"] = f(cr.drop, 2); ex["kablo.pct"] = f(cr.pct, 2); ex["kablo.loss"] = f(cr.loss, 1);
    var rec = U.cableRec(c.v, c.i, c.len, k.sections, k.rho, k.target);
    ex["kablo.rec"] = rec == null ? "—" : f(rec);

    var g = d.string, sr = U.string(g, k.stc);
    ex["dizi.voc"] = f(g.voc); ex["dizi.vmp"] = f(g.vmp); ex["dizi.beta"] = f(g.beta, 2); ex["dizi.tmin"] = f(g.tmin, 1);
    ex["dizi.vmax"] = f(g.vmax); ex["dizi.mpptMin"] = f(g.mpptMin); ex["dizi.stc"] = f(k.stc);
    ex["dizi.dt"] = f(g.tmin - k.stc, 1);
    ex["dizi.cold"] = f(sr.cold, 2); ex["dizi.max"] = f(sr.max, 0); ex["dizi.min"] = f(sr.min, 0);
    ex["dizi.strVoc"] = f(sr.cold * sr.max, 1); ex["dizi.strVmp"] = f(g.vmp * sr.max, 1);
    ex["dizi.over"] = f(sr.cold * (sr.max + 1), 1); ex["dizi.maxPlus"] = f(sr.max + 1, 0);

    var a = d.array, ar = U.array(a.v, a.a, a.series, a.parallel);
    ex["seri.v"] = f(a.v); ex["seri.a"] = f(a.a); ex["seri.s"] = f(a.series, 0); ex["seri.p"] = f(a.parallel, 0);
    ex["seri.totV"] = f(ar.v, 2); ex["seri.totA"] = f(ar.a, 2); ex["seri.totW"] = f(ar.w, 0);

    var b = d.bank, br = U.bank(b.v, b.ah, b.series, b.parallel);
    ex["aku.v"] = f(b.v); ex["aku.ah"] = f(b.ah); ex["aku.s"] = f(b.series, 0); ex["aku.p"] = f(b.parallel, 0);
    ex["aku.totV"] = f(br.v, 1); ex["aku.totAh"] = f(br.ah, 0); ex["aku.kwh"] = f(br.kwh, 2);

    var z = d.fuse, zr = U.fuse(z.strings, z.isc, z.maxFuse), zl = U.fuse(z.strings - 1, z.isc, z.maxFuse);
    ex["sigorta.n"] = f(z.strings, 0); ex["sigorta.n1"] = f(z.strings - 1, 0); ex["sigorta.n2"] = f(z.strings - 2, 0);
    ex["sigorta.isc"] = f(z.isc); ex["sigorta.max"] = f(z.maxFuse);
    ex["sigorta.rev"] = f(zr.rev, 2); ex["sigorta.verdict"] = zr.needed ? "gerekir" : "bu kontrole göre gerekmez";
    ex["sigorta.revLess"] = f(zl.rev, 2); ex["sigorta.verdictLess"] = zl.needed ? "gerekir" : "bu kontrole göre gerekmez";

    var v = d.conv;
    ex["cev.w"] = f(v.w); ex["cev.v"] = f(v.v); ex["cev.ah"] = f(v.ah); ex["cev.hp"] = f(v.hp);
    ex["cev.a"] = f(U.wToA(v.w, v.v), 2);
    ex["cev.wh"] = f(U.ahToWh(v.ah, v.v), 0); ex["cev.kwhAh"] = f(U.ahToWh(v.ah, v.v) / 1000, 2);
    ex["cev.hpPerKw"] = f(k.hpPerKw, 3); ex["cev.kw"] = f(U.hpToKw(v.hp, k.hpPerKw), 3);
    ex["cev.awg"] = U.awgLabel(v.awg); ex["cev.awgD"] = f(U.awgDia(v.awg, k.awg), 3); ex["cev.awgA"] = f(U.awgArea(v.awg, k.awg), 2);
    ex["cev.eta"] = f(k.invEff * 100, 1); ex["cev.etaDec"] = f(k.invEff, 3); ex["cev.inv"] = f(U.invCurrent(v.w, v.v, k.invEff), 2);
    return ex;
  };

  G.usta = U;

  /* ---------- 2) SAYFA BAĞLAMA ---------- */
  var doc = root.document;
  if (!doc || !doc.querySelector) return;
  var page = doc.querySelector("[data-usta]");
  if (!page) return;

  var CFG = G.config || {}, K = U.k(CFG), D = K.def, f = U.fmt;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(name, attrs, text) {
    var e = doc.createElementNS(SVGNS, name), key;
    for (key in attrs) if (Object.prototype.hasOwnProperty.call(attrs, key)) e.setAttribute(key, attrs[key]);
    if (text != null) e.textContent = text;
    return e;
  }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function svgOf(id, w, h, label) {
    var host = $("#" + id); if (!host) return null;
    clear(host);
    var s = el("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": label });
    host.appendChild(s); return s;
  }
  function num(id) {
    var e = $("#" + id); if (!e) return NaN;
    var v = String(e.value || "").replace(",", ".").trim();
    return v === "" ? NaN : parseFloat(v);
  }
  function int(id) { var n = num(id); return isFinite(n) ? Math.floor(n) : NaN; }
  function setVal(id, v) { var e = $("#" + id); if (e && v != null) e.value = v; }
  function out(id, t) { var e = $("#" + id); if (e) e.textContent = t; }
  function ok() { for (var i = 0; i < arguments.length; i++) if (!(isFinite(arguments[i]) && arguments[i] > 0)) return false; return true; }
  function note(id, text, cls) {
    var e = $("#" + id); if (!e) return;
    e.textContent = text || ""; e.hidden = !text;
    e.className = "usta-msg" + (cls ? " " + cls : "");
  }
  function onInput(ids, fn) {
    ids.forEach(function (id) {
      var e = $("#" + id); if (!e) return;
      e.addEventListener("input", function () { touch(e); fn(); });
      e.addEventListener("change", function () { touch(e); fn(); });
    });
  }

  // Statik örnek hesap sayıları: config ile aynı kalsın
  var EX = U.examples(CFG);
  $$("[data-ex]", page).forEach(function (n) { var key = n.getAttribute("data-ex"); if (EX[key] != null) { n.textContent = EX[key]; n.setAttribute("value", EX[key]); } });

  // ----- WhatsApp: araç sonucu paylaşımı (hesaplayıcıdaki #toolWa deseni) -----
  var WA = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
  var summaries = {}, activeTool = "egim";   // activeTool = son dokunulan araç
  function waHref(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function shareMsg(tool) {
    return "Merhaba, GESPA Elektrikçi Çantası aracından sonuç:\n" + summaries[tool] + "\nBu sistem için malzeme fiyatı almak istiyorum.";
  }
  function updateWa() {
    $$("[data-usta-wa]", page).forEach(function (a) {
      var t = a.getAttribute("data-usta-wa") || activeTool;
      if (!WA || !summaries[t]) { a.hidden = true; return; }
      a.hidden = false; a.href = waHref(shareMsg(t));
    });
  }
  function summary(tool, text) { summaries[tool] = text; updateWa(); }
  function touch(e) {
    var sec = e.closest && e.closest("[data-usta-tool]");
    if (sec) { activeTool = sec.getAttribute("data-usta-tool"); updateWa(); }
  }
  // Usta / toplu alım satırı: hazır mesajlı WhatsApp + sohbet penceresindeki "Beni arayın"
  $$("[data-usta-pro]", page).forEach(function (a) {
    if (!WA) return;
    a.removeAttribute("data-c-wa");
    a.href = waHref("Merhaba GESPA, elektrikçi / montajcıyım. Usta ve toplu alım fiyatı almak istiyorum. Ürünler: ___");
  });
  function openCallback() {
    var fab = $(".gchat-fab"); if (!fab) return;
    fab.click();
    root.setTimeout(function () {
      var hit = $$(".gchat-quick button").filter(function (b) { return (b.textContent || "").indexOf("📞") === 0; })[0];
      if (hit) hit.click();
    }, 250);
  }
  (function () {
    var btns = $$("[data-usta-cb]", page), tries = 0;
    btns.forEach(function (b) { b.addEventListener("click", openCallback); });
    (function wait() {            // sohbet penceresi sonradan yüklenir; hazır olunca düğmeyi göster
      if ($(".gchat-fab")) { btns.forEach(function (b) { b.hidden = false; }); return; }
      if (++tries < 40) root.setTimeout(wait, 500);
    })();
  })();

  // ----- 1) Eğim açısı ve güneş yüksekliği -----
  var season = "equinox";
  var SEASONS = ["summer", "equinox", "winter"];
  var SEASON_TX = { summer: "Yaz", equinox: "İlkbahar/Sonbahar", winter: "Kış" };
  var sunState = null;                // son çizimin açıları (mevsim değişiminde yeniden çizmeden döndürülür)
  function applySeason() {
    var host = $("#ugSvg"), st = sunState; if (!host || !st) return;
    var sunG = $(".u-sun", host), pan = $(".u-pan", host), cap = $(".u-cap", host);
    if (sunG) sunG.style.transform = "rotate(" + (-st.s[season]) + "deg)";
    if (pan) pan.style.transform = "rotate(" + st.tilt[season] + "deg)";
    if (cap) cap.textContent = SEASON_TX[season] + " eğimi ≈ " + f(st.tilt[season], 1) + "°";
    SEASONS.forEach(function (key) {
      var c = $('[data-sun="' + key + '"]', host), t = $('[data-sunt="' + key + '"]', host);
      if (c) c.setAttribute("class", "u-ghost" + (key === season ? " on" : ""));
      if (t) t.setAttribute("class", "u-t" + (key === season ? " u-b" : ""));
    });
  }
  function drawSun(s, t) {
    var W = 340, H = 250, cx = 112, cy = 176, R = 128;
    var svg = svgOf("ugSvg", W, H, "Öğle güneşinin mevsimlere göre yüksekliği ve panel eğimi"); if (!svg) return;
    sunState = { s: s, tilt: { summer: t.summer, equinox: t.year, winter: t.winter } };
    svg.appendChild(el("path", { d: "M" + (cx + R) + " " + cy + " A" + R + " " + R + " 0 0 0 " + cx + " " + (cy - R), "class": "u-arc" }));
    svg.appendChild(el("line", { x1: 8, y1: cy + 26, x2: W - 8, y2: cy + 26, "class": "u-ground" }));
    svg.appendChild(el("text", { x: W - 10, y: cy + 44, "text-anchor": "end", "class": "u-t u-mut" }, "Güney →"));
    svg.appendChild(el("text", { x: 10, y: cy + 44, "class": "u-t u-mut" }, "← Kuzey"));
    svg.appendChild(el("line", { x1: cx, y1: cy, x2: cx, y2: cy + 26, "class": "u-post" }));
    SEASONS.forEach(function (key) {
      var a = s[key] * Math.PI / 180;
      svg.appendChild(el("circle", { cx: cx + R * Math.cos(a), cy: cy - R * Math.sin(a), r: 5, "data-sun": key }));
      svg.appendChild(el("text", { x: cx + (R + 14) * Math.cos(a), y: cy - (R + 14) * Math.sin(a) + 4, "data-sunt": key },
        (key === "equinox" ? "Ekinoks" : SEASON_TX[key]) + " " + f(s[key], 1) + "°"));
    });
    // Seçili mevsimin güneşi yay üzerinde döner; panel kendi merkezinde eğilir
    var sunG = el("g", { "class": "u-sun" });
    sunG.style.transformOrigin = cx + "px " + cy + "px";
    sunG.appendChild(el("line", { x1: cx + 30, y1: cy, x2: cx + R - 14, y2: cy, "class": "u-ray" }));
    sunG.appendChild(el("circle", { cx: cx + R, cy: cy, r: 11, "class": "u-sunc" }));
    svg.appendChild(sunG);
    var pan = el("g", { "class": "u-pan" });
    pan.style.transformOrigin = cx + "px " + cy + "px";
    pan.appendChild(el("rect", { x: cx - 40, y: cy - 4, width: 80, height: 8, rx: 2, "class": "u-panel" }));
    svg.appendChild(pan);
    svg.appendChild(el("text", { x: W / 2, y: H - 6, "text-anchor": "middle", "class": "u-t u-b u-cap" }, ""));
    applySeason();
  }
  function calcEgim() {
    var lat = num("ugLat");
    if (!isFinite(lat) || !(lat > K.dec && lat < 90 - K.dec)) {
      ["ugSummer", "ugEquinox", "ugWinter", "ugTiltYear", "ugTiltSummer", "ugTiltWinter"].forEach(function (id) { out(id, "—"); });
      note("ugWarn", "Bu basit formül " + f(K.dec, 2) + "° ile " + f(90 - K.dec, 2) + "° arasındaki kuzey enlemleri için geçerlidir.", "warn");
      clear($("#ugSvg")); sunState = null; summary("egim", ""); return;
    }
    note("ugWarn", "");
    var s = U.sun(lat, K.dec), t = U.tilts(lat, K.delta);
    out("ugSummer", f(s.summer, 2) + "°"); out("ugEquinox", f(s.equinox, 2) + "°"); out("ugWinter", f(s.winter, 2) + "°");
    out("ugTiltYear", "≈ " + f(t.year, 1) + "°"); out("ugTiltSummer", "≈ " + f(t.summer, 1) + "°"); out("ugTiltWinter", "≈ " + f(t.winter, 1) + "°");
    drawSun(s, t);
    summary("egim", "Enlem " + f(lat, 1) + "°: öğle güneşi yaz " + f(s.summer, 1) + "°, ekinoks " + f(s.equinox, 1) + "°, kış " + f(s.winter, 1)
      + "°. Pratik eğim: yıl boyu ≈ " + f(t.year, 1) + "°, yaz ≈ " + f(t.summer, 1) + "°, kış ≈ " + f(t.winter, 1) + "°");
  }
  (function () {
    if (!$("#ugLat")) return;
    setVal("ugLat", K.defLat);
    var sel = $("#ugCity");
    if (sel) {
      K.cities.forEach(function (c) {
        var o = doc.createElement("option"); o.value = c.lat; o.textContent = c.name + " (" + f(c.lat, 1) + "°)"; sel.appendChild(o);
      });
      sel.addEventListener("change", function () { if (sel.value) { setVal("ugLat", sel.value); touch(sel); calcEgim(); } });
    }
    onInput(["ugLat"], function () { if (sel) sel.value = ""; calcEgim(); });
    $$("[data-season]", page).forEach(function (b) {
      b.addEventListener("click", function () {
        season = b.getAttribute("data-season");
        $$("[data-season]", page).forEach(function (x) { var on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
        touch(b); applySeason();
      });
    });
    calcEgim();
  })();

  // ----- 2) Kablo kesiti görseli + güç kaybı -----
  function drawCable(chosen, rec) {
    var secs = K.sections; if (!secs.length) return;
    var W = 340, H = 160, pad = 14, gap = (W - 2 * pad) / secs.length;
    var maxD = U.diaOf(secs[secs.length - 1]), scale = Math.min(11, (gap - 8) / maxD);   // px / mm — hepsi AYNI ölçek
    var svg = svgOf("ukSvg", W, H, "Kablo iletken kesitleri, gerçek oranlarıyla"); if (!svg) return;
    var base = 78;
    secs.forEach(function (sx, i) {
      var d = U.diaOf(sx), r = d * scale / 2, x = pad + gap * i + gap / 2;
      var cls = "u-cu" + (sx === chosen ? " sel" : "") + (sx === rec ? " rec" : "");
      if (sx === rec) svg.appendChild(el("circle", { cx: x, cy: base - r, r: r + 5, "class": "u-recring" }));
      svg.appendChild(el("circle", { cx: x, cy: base - r, r: r, "class": cls }));
      svg.appendChild(el("text", { x: x, y: base + 18, "text-anchor": "middle", "class": "u-t" + (sx === chosen ? " u-b" : "") }, f(sx) + " mm²"));
      svg.appendChild(el("text", { x: x, y: base + 34, "text-anchor": "middle", "class": "u-t u-mut" }, "⌀" + f(d, 2)));
      if (sx === chosen || sx === rec) {
        svg.appendChild(el("text", { x: x, y: base + 52, "text-anchor": "middle", "class": "u-t " + (sx === rec ? "u-ok" : "u-b") },
          sx === chosen && sx === rec ? "seçili ✓" : (sx === rec ? "hedef" : "seçili")));
      }
    });
    svg.appendChild(el("text", { x: W / 2, y: H - 4, "text-anchor": "middle", "class": "u-t u-mut" }, "Yalnız bakır iletken, aynı ölçek (⌀ mm)"));
  }
  function calcKablo() {
    var v = num("ukV"), i = num("ukI"), len = num("ukLen"), s = num("ukS");
    if (!ok(v, i, len, s)) {
      ["ukDrop", "ukPct", "ukLoss", "ukRec"].forEach(function (id) { out(id, "—"); });
      note("ukMsg", ""); drawCable(s, null); summary("kablo", ""); return;
    }
    var r = U.cable(v, i, len, s, K.rho), rec = U.cableRec(v, i, len, K.sections, K.rho, K.target);
    out("ukDrop", f(r.drop, 2) + " V"); out("ukPct", "%" + f(r.pct, 2)); out("ukLoss", f(r.loss, 1) + " W");
    out("ukRec", rec == null ? "listede yok" : f(rec) + " mm²");
    var within = r.pct <= K.target + EPS;
    note("ukMsg", within
      ? "Seçili kesit %" + f(K.target, 1) + " gerilim düşümü hedefinin içinde."
      : "Seçili kesit %" + f(K.target, 1) + " hedefini aşıyor" + (rec == null ? "; listedeki en kalın kesit de yetmiyor: hattı kısaltın ya da gerilimi yükseltin." : ": " + f(rec) + " mm² hedefi karşılar."),
      within ? "ok" : "warn");
    drawCable(s, rec);
    summary("kablo", f(v) + " V, " + f(i) + " A, tek yön " + f(len) + " m, " + f(s) + " mm²: gerilim düşümü " + f(r.drop, 2) + " V (%" + f(r.pct, 2)
      + "), ısı kaybı " + f(r.loss, 1) + " W" + (rec == null ? "" : ", %" + f(K.target, 1) + " hedefi için en küçük kesit " + f(rec) + " mm²"));
  }
  (function () {
    var sel = $("#ukS"); if (!sel) return;
    clear(sel);
    K.sections.forEach(function (sx) { var o = doc.createElement("option"); o.value = sx; o.textContent = f(sx) + " mm²"; sel.appendChild(o); });
    var c = D.cable || {};
    setVal("ukV", c.v); setVal("ukI", c.i); setVal("ukLen", c.len); setVal("ukS", c.section);
    onInput(["ukV", "ukI", "ukLen", "ukS"], calcKablo); calcKablo();
  })();

  // ----- 3) Dizi (string) hesabı -----
  function drawString(p, r, n) {
    var W = 340, H = 118, x0 = 14, x1 = W - 14;
    var svg = svgOf("udSvg", W, H, "Dizi geriliminin cihazın giriş aralığına göre konumu"); if (!svg) return;
    var vocStr = r.cold * n, vmpStr = p.vmp * n;
    var top = Math.max(p.vmax * 1.18, vocStr * 1.08), X = function (v) { return x0 + (x1 - x0) * v / top; };
    var lo = ok(p.mpptMin) ? p.mpptMin : 0;
    svg.appendChild(el("rect", { x: x0, y: 34, width: x1 - x0, height: 22, rx: 4, "class": "u-bar" }));
    svg.appendChild(el("rect", { x: X(lo), y: 34, width: X(p.vmax) - X(lo), height: 22, "class": "u-win" }));
    svg.appendChild(el("rect", { x: X(p.vmax), y: 34, width: x1 - X(p.vmax), height: 22, "class": "u-over" }));
    if (lo) svg.appendChild(el("text", { x: X(lo), y: 14, "text-anchor": X(lo) < 60 ? "start" : "middle", "class": "u-t u-mut" }, "MPPT min " + f(lo) + " V"));
    svg.appendChild(el("text", { x: X(p.vmax), y: 28, "text-anchor": "end", "class": "u-t u-mut" }, "Maks. giriş " + f(p.vmax) + " V"));
    function mark(v, y, text, cls) {
      var x = Math.min(X(v), x1);
      svg.appendChild(el("line", { x1: x, y1: 30, x2: x, y2: y - 12, "class": "u-mark " + cls }));
      svg.appendChild(el("text", { x: x, y: y, "text-anchor": x < 110 ? "start" : (x > 230 ? "end" : "middle"), "class": "u-t u-b " + cls }, text));
    }
    if (ok(p.vmp)) mark(vmpStr, 80, n + " panel Vmp " + f(vmpStr, 1) + " V", "u-ok");
    mark(vocStr, 104, n + " panel soğuk Voc " + f(vocStr, 1) + " V", vocStr > p.vmax + EPS ? "u-bad" : "u-ink");
  }
  var udTouchedN = false;
  function calcDizi() {
    var p = { voc: num("udVoc"), vmp: num("udVmp"), isc: num("udIsc"), beta: num("udBeta"), tmin: num("udTmin"), vmax: num("udVmax"), mpptMin: num("udMppt") };
    var ids = ["udCold", "udMax", "udMin", "udStrVoc", "udStrVmp"];
    if (!ok(p.voc, p.vmax) || !isFinite(p.beta) || !isFinite(p.tmin)) {
      ids.forEach(function (id) { out(id, "—"); });
      note("udWarn", "Panel etiketinden Voc ve sıcaklık katsayısını, cihaz etiketinden en yüksek PV giriş gerilimini girin.", "");
      clear($("#udSvg")); summary("dizi", ""); return;
    }
    var r = U.string(p, K.stc);
    if (!(r.cold > 0)) { ids.forEach(function (id) { out(id, "—"); }); note("udWarn", "Girilen katsayı ve sıcaklıkla gerilim hesaplanamıyor; değerleri kontrol edin.", "bad"); clear($("#udSvg")); return; }
    if (!udTouchedN) setVal("udN", Math.max(r.max, 1));
    var n = int("udN"); if (!(n >= 1)) n = Math.max(r.max, 1);
    out("udCold", f(r.cold, 2) + " V"); out("udMax", r.max + " panel");
    out("udMin", r.min == null ? "—" : r.min + " panel");
    out("udStrVoc", f(r.cold * n, 1) + " V"); out("udStrVmp", ok(p.vmp) ? f(p.vmp * n, 1) + " V" : "—");
    if (n > r.max) note("udWarn", "DİKKAT: " + n + " panel seri bağlanırsa soğuk havada dizi gerilimi " + f(r.cold * n, 1) + " V olur ve cihazın " + f(p.vmax) + " V giriş sınırını AŞAR. En çok " + r.max + " panel.", "bad");
    else if (r.min != null && n < r.min) note("udWarn", n + " panelin Vmp toplamı " + f(p.vmp * n, 1) + " V, MPPT alt sınırı " + f(p.mpptMin) + " V'un altında kalır. En az " + r.min + " panel.", "warn");
    else if (r.min != null && r.min > r.max) note("udWarn", "Bu panel ile bu cihaz arasında uygun seri sayısı yok (en az " + r.min + ", en çok " + r.max + ").", "bad");
    else note("udWarn", n + " panel seri: soğuk havadaki Voc giriş sınırının altında" + (r.min != null ? ", Vmp MPPT alt sınırının üstünde." : "."), "ok");
    drawString(p, r, n);
    summary("dizi", "Panel Voc " + f(p.voc) + " V, katsayı " + f(p.beta, 2) + " %/°C, en düşük " + f(p.tmin, 1) + " °C: soğuk Voc " + f(r.cold, 2) + " V. Giriş sınırı "
      + f(p.vmax) + " V → en çok " + r.max + " panel seri" + (r.min == null ? "" : ", en az " + r.min) + ". " + n + " panelde dizi " + f(r.cold * n, 1) + " V"
      + (ok(p.isc) ? ", dizi akımı Isc " + f(p.isc) + " A" : ""));
  }
  (function () {
    if (!$("#udVoc")) return;
    var map = { udVoc: "voc", udVmp: "vmp", udIsc: "isc", udBeta: "beta", udTmin: "tmin", udVmax: "vmax", udMppt: "mpptMin" }, g = D.string || {};
    Object.keys(map).forEach(function (id) { var e = $("#" + id); if (e && g[map[id]] != null) e.placeholder = "ör. " + f(g[map[id]], 2); });
    onInput(Object.keys(map), calcDizi);
    var nEl = $("#udN");
    if (nEl) { nEl.addEventListener("input", function () { udTouchedN = nEl.value !== ""; touch(nEl); calcDizi(); }); }
    var fill = $("#udFill");
    if (fill) fill.addEventListener("click", function () {
      Object.keys(map).forEach(function (id) { setVal(id, g[map[id]]); });
      udTouchedN = false; touch(fill); calcDizi();
    });
    calcDizi();
  })();

  // ----- 4 ve 5) Seri–paralel şema (panel / akü ortak çizim) -----
  function drawBank(id, sN, pN, kind, caption) {
    var maxS = K.diagram.maxSeries, maxP = K.diagram.maxParallel;
    var cols = Math.min(sN, maxS), rows = Math.min(pN, maxP), moreS = sN > maxS, moreP = pN > maxP;
    var W = 340, rowH = 44, top = 30, H = top + rows * rowH + (moreP ? 20 : 0) + 30;
    var busL = 22, busR = W - 22 - (moreS ? 22 : 0), cellW = (busR - busL - 16) / cols, bw = Math.min(40, cellW - 10), bh = 26;
    var svg = svgOf(id, W, H, kind === "bat" ? "Akü bankası bağlantı şeması" : "Panel seri–paralel bağlantı şeması"); if (!svg) return;
    var yLast = top + (rows - 1) * rowH + rowH / 2, yFirst = top + rowH / 2;
    svg.appendChild(el("line", { x1: busL, y1: yFirst - 14, x2: busL, y2: yLast + 14, "class": "u-bus pos" }));
    svg.appendChild(el("line", { x1: busR, y1: yFirst - 14, x2: busR, y2: yLast + 14, "class": "u-bus neg" }));
    svg.appendChild(el("text", { x: busL, y: 16, "text-anchor": "middle", "class": "u-t u-b u-pos" }, "+"));
    svg.appendChild(el("text", { x: busR, y: 16, "text-anchor": "middle", "class": "u-t u-b u-neg" }, "−"));
    for (var r = 0; r < rows; r++) {
      var y = top + r * rowH + rowH / 2;
      svg.appendChild(el("line", { x1: busL, y1: y, x2: busR, y2: y, "class": "u-wire" }));
      for (var c = 0; c < cols; c++) {
        var x = busL + 8 + cellW * c + (cellW - bw) / 2;
        svg.appendChild(el("rect", { x: x, y: y - bh / 2, width: bw, height: bh, rx: kind === "bat" ? 4 : 2, "class": "u-cell " + kind }));
        if (kind === "bat") svg.appendChild(el("rect", { x: x + bw - 1, y: y - 5, width: 4, height: 10, "class": "u-nub" }));
        else svg.appendChild(el("line", { x1: x + bw / 2, y1: y - bh / 2, x2: x + bw / 2, y2: y + bh / 2, "class": "u-grid" }));
        svg.appendChild(el("text", { x: x + 4, y: y + 4, "class": "u-t u-cellt" }, "+"));
        svg.appendChild(el("text", { x: x + bw - 4, y: y + 4, "text-anchor": "end", "class": "u-t u-cellt" }, "−"));
      }
      if (moreS) svg.appendChild(el("text", { x: busR + 8, y: y + 4, "class": "u-t u-b" }, "…"));
    }
    if (moreP) svg.appendChild(el("text", { x: W / 2, y: yLast + rowH / 2 + 12, "text-anchor": "middle", "class": "u-t u-b" }, "⋮"));
    svg.appendChild(el("text", { x: W / 2, y: H - 8, "text-anchor": "middle", "class": "u-t u-b" }, caption));
    return moreS || moreP;
  }
  function calcSeri() {
    var v = num("usV"), a = num("usA"), s = int("usS"), p = int("usP");
    if (!ok(v, a, s, p)) { ["usTotV", "usTotA", "usTotW"].forEach(function (id) { out(id, "—"); }); note("usNote", ""); clear($("#usSvg")); summary("seri-paralel", ""); return; }
    var r = U.array(v, a, s, p);
    out("usTotV", f(r.v, 2) + " V"); out("usTotA", f(r.a, 2) + " A"); out("usTotW", f(r.w, 0) + " W");
    var cut = drawBank("usSvg", s, p, "pv", s + " seri × " + p + " paralel = " + (s * p) + " panel");
    note("usNote", cut ? "Şema en çok " + K.diagram.maxSeries + " seri × " + K.diagram.maxParallel + " paralel çizer; hesap girdiğiniz " + s + " × " + p + " için yapılır." : "", "");
    summary("seri-paralel", s + " seri × " + p + " paralel (" + (s * p) + " panel, panel başı " + f(v) + " V / " + f(a) + " A): toplam " + f(r.v, 2) + " V, " + f(r.a, 2) + " A, " + f(r.w, 0) + " W");
  }
  (function () {
    if (!$("#usV")) return; var d = D.array || {};
    setVal("usV", d.v); setVal("usA", d.a); setVal("usS", d.series); setVal("usP", d.parallel);
    onInput(["usV", "usA", "usS", "usP"], calcSeri); calcSeri();
  })();
  function calcAku() {
    var v = num("uaV"), ah = num("uaAh"), s = int("uaS"), p = int("uaP");
    if (!ok(v, ah, s, p)) { ["uaTotV", "uaTotAh", "uaKwh"].forEach(function (id) { out(id, "—"); }); note("uaNote", ""); clear($("#uaSvg")); summary("aku", ""); return; }
    var r = U.bank(v, ah, s, p);
    out("uaTotV", f(r.v, 1) + " V"); out("uaTotAh", f(r.ah, 0) + " Ah"); out("uaKwh", f(r.kwh, 2) + " kWh");
    var cut = drawBank("uaSvg", s, p, "bat", s + " seri × " + p + " paralel = " + (s * p) + " akü");
    note("uaNote", cut ? "Şema en çok " + K.diagram.maxSeries + " seri × " + K.diagram.maxParallel + " paralel çizer; hesap girdiğiniz " + s + " × " + p + " için yapılır." : "", "");
    summary("aku", s + " seri × " + p + " paralel (" + (s * p) + " adet " + f(v) + " V " + f(ah) + " Ah akü): banka " + f(r.v, 1) + " V, " + f(r.ah, 0) + " Ah, " + f(r.kwh, 2) + " kWh");
  }
  (function () {
    if (!$("#uaV")) return; var d = D.bank || {};
    setVal("uaV", d.v); setVal("uaAh", d.ah); setVal("uaS", d.series); setVal("uaP", d.parallel);
    onInput(["uaV", "uaAh", "uaS", "uaP"], calcAku); calcAku();
  })();

  // ----- 6) Dizi sigortası gerekir mi? -----
  function drawFuse(n, isc, r) {
    var cap = K.diagram.maxSeries, cols = Math.min(n, cap), W = 340, H = 150, x0 = 30, gap = (W - 2 * x0) / Math.max(cols - 1, 1);
    var svg = svgOf("ufSvg", W, H, "Paralel dizilerde arızalı diziye akan ters akım"); if (!svg) return;
    var X = function (i) { return cols === 1 ? W / 2 : x0 + gap * i; };
    svg.appendChild(el("line", { x1: X(0), y1: 30, x2: X(cols - 1), y2: 30, "class": "u-bus pos" }));
    svg.appendChild(el("line", { x1: X(0), y1: 110, x2: X(cols - 1), y2: 110, "class": "u-bus neg" }));
    for (var i = 0; i < cols; i++) {
      var x = X(i), bad = i === 0;
      svg.appendChild(el("line", { x1: x, y1: 30, x2: x, y2: 110, "class": "u-wire" }));
      svg.appendChild(el("rect", { x: x - 13, y: 48, width: 26, height: 44, rx: 2, "class": "u-cell pv" + (bad ? " fault" : "") }));
      if (!bad) svg.appendChild(el("path", { d: "M" + (x - 5) + " 40 L" + x + " 33 L" + (x + 5) + " 40", "class": "u-arrow" }));
      else if (n > 1) svg.appendChild(el("path", { d: "M" + (x - 5) + " 36 L" + x + " 43 L" + (x + 5) + " 36", "class": "u-arrow bad" }));
    }
    svg.appendChild(el("text", { x: X(0) - 14, y: 16, "class": "u-t u-bad u-b" }, "arızalı dizi"));
    if (n > cap) svg.appendChild(el("text", { x: W - 6, y: 74, "text-anchor": "end", "class": "u-t u-b" }, "…"));
    svg.appendChild(el("text", { x: W / 2, y: H - 8, "text-anchor": "middle", "class": "u-t u-b " + (r.needed ? "u-bad" : "u-ok") },
      "(" + n + " − 1) × " + f(isc) + " A = " + f(r.rev, 2) + " A"));
  }
  function calcSigorta() {
    var n = int("ufN"), isc = num("ufIsc"), mx = num("ufMax");
    if (!ok(n, isc, mx)) { out("ufRev", "—"); out("ufVerdict", "—"); note("ufMsg", ""); clear($("#ufSvg")); summary("sigorta", ""); return; }
    var r = U.fuse(n, isc, mx);
    out("ufRev", f(r.rev, 2) + " A");
    out("ufVerdict", r.needed ? "Dizi sigortası gerekir" : "Bu kontrole göre gerekmez");
    var box = $("#ufVerdictBox"); if (box) box.className = "result highlight " + (r.needed ? "usta-bad" : "usta-good");
    note("ufMsg", r.needed
      ? f(r.rev, 2) + " A, panel etiketindeki " + f(mx) + " A'lık en yüksek seri sigorta değerini aşıyor: her diziye sigorta gerekir."
      : f(r.rev, 2) + " A, panel etiketindeki " + f(mx) + " A'lık değeri aşmıyor. Yalnız bu kontrol yapılmıştır.", r.needed ? "bad" : "ok");
    drawFuse(n, isc, r);
    summary("sigorta", n + " paralel dizi, Isc " + f(isc) + " A, etiketteki maks. seri sigorta " + f(mx) + " A: ters akım (" + n + " − 1) × " + f(isc) + " = " + f(r.rev, 2)
      + " A → " + (r.needed ? "dizi sigortası gerekir" : "bu kontrole göre gerekmez"));
  }
  (function () {
    if (!$("#ufN")) return; var d = D.fuse || {};
    setVal("ufN", d.strings); setVal("ufIsc", d.isc); setVal("ufMax", d.maxFuse);
    onInput(["ufN", "ufIsc", "ufMax"], calcSigorta); calcSigorta();
  })();

  // ----- 7) Hızlı çeviriciler -----
  function r4(x) { return isFinite(x) ? String(Math.round(x * 1e4) / 1e4) : ""; }
  function pair(aId, bId, vId, fwd, back) {       // iki yönlü alan çifti; vId ortak gerilim (yoksa null)
    var last = aId;
    function run(src) {
      last = src || last;
      var v = vId ? num(vId) : 1, x;
      if (vId && !ok(v)) return;
      if (last === aId) { x = num(aId); setVal(bId, isFinite(x) ? r4(fwd(x, v)) : ""); }
      else { x = num(bId); setVal(aId, isFinite(x) ? r4(back(x, v)) : ""); }
      convSummary();
    }
    [aId, bId].forEach(function (id) { var e = $("#" + id); if (e) e.addEventListener("input", function () { touch(e); run(id); }); });
    if (vId) { var ve = $("#" + vId); if (ve) ve.addEventListener("input", function () { touch(ve); run(); }); }
    return run;
  }
  function drawAwg(n, mm2) {
    var W = 340, H = 132, svg = svgOf("ucSvg", W, H, "AWG ile mm² iletken kesitinin aynı ölçekte karşılaştırması"); if (!svg) return;
    var dA = U.awgDia(n, K.awg), dM = ok(mm2) ? U.diaOf(mm2) : 0, scale = Math.min(14, 76 / Math.max(dA, dM));
    svg.appendChild(el("circle", { cx: 95, cy: 50, r: dA * scale / 2, "class": "u-cu sel" }));
    svg.appendChild(el("text", { x: 95, y: 108, "text-anchor": "middle", "class": "u-t u-b" }, "AWG " + U.awgLabel(n)));
    svg.appendChild(el("text", { x: 95, y: 124, "text-anchor": "middle", "class": "u-t u-mut" }, f(U.awgArea(n, K.awg), 2) + " mm² · ⌀" + f(dA, 2)));
    if (dM) {
      svg.appendChild(el("circle", { cx: 245, cy: 50, r: dM * scale / 2, "class": "u-cu" }));
      svg.appendChild(el("text", { x: 245, y: 108, "text-anchor": "middle", "class": "u-t u-b" }, f(mm2, 2) + " mm²"));
      svg.appendChild(el("text", { x: 245, y: 124, "text-anchor": "middle", "class": "u-t u-mut" }, "⌀" + f(dM, 2) + " mm"));
    }
  }
  var convTx = {};
  function convSummary() {
    var parts = [];
    ["wa", "ah", "hp", "awg", "inv"].forEach(function (key) { if (convTx[key]) parts.push(convTx[key]); });
    summary("cevirici", parts.join(" · "));
  }
  (function () {
    if (!$("#ucW")) return; var d = D.conv || {}, A = K.awg;
    setVal("ucV1", d.v); setVal("ucW", d.w); setVal("ucV2", d.v); setVal("ucAh", d.ah); setVal("ucHp", d.hp);
    setVal("ucP", d.w); setVal("ucVb", d.v); setVal("ucEta", isFinite(K.invEff) ? r4(K.invEff * 100) : ""); setVal("ucMm2", d.mm2);
    var runWA = pair("ucW", "ucA", "ucV1", U.wToA, U.aToW);
    var runAh = pair("ucAh", "ucWh", "ucV2", U.ahToWh, U.whToAh);
    var runHp = pair("ucHp", "ucKw", null, function (x) { return U.hpToKw(x, K.hpPerKw); }, function (x) { return U.kwToHp(x, K.hpPerKw); });
    function texts() {
      var w = num("ucW"), a = num("ucA"), v1 = num("ucV1"), ah = num("ucAh"), wh = num("ucWh"), v2 = num("ucV2"), hp = num("ucHp"), kw = num("ucKw");
      convTx.wa = ok(w, a, v1) ? f(w, 1) + " W = " + f(a, 2) + " A (" + f(v1) + " V)" : "";
      convTx.ah = ok(ah, wh, v2) ? f(ah, 1) + " Ah = " + f(wh, 0) + " Wh (" + f(v2) + " V)" : "";
      convTx.hp = ok(hp, kw) ? f(hp, 2) + " HP = " + f(kw, 3) + " kW" : "";
      out("ucKwh", ok(wh) ? "= " + f(wh / 1000, 3) + " kWh" : "");
    }
    var sel = $("#ucAwg");
    if (sel) {
      for (var n = A.min; n <= A.max; n++) { var o = doc.createElement("option"); o.value = n; o.textContent = "AWG " + U.awgLabel(n); sel.appendChild(o); }
      setVal("ucAwg", d.awg);
    }
    function calcAwg() {
      var n = sel ? parseInt(sel.value, 10) : NaN, mm2 = num("ucMm2");
      if (isFinite(n)) out("ucAwgOut", "AWG " + U.awgLabel(n) + " = ⌀" + f(U.awgDia(n, A), 3) + " mm · " + f(U.awgArea(n, A), 2) + " mm²");
      if (ok(mm2)) {
        var x = U.mm2ToAwg(mm2, A), thick = Math.floor(x + EPS), thin = thick + 1;
        var exact = Math.abs(x - Math.round(x)) < 1e-6;
        out("ucMmOut", exact
          ? f(mm2, 2) + " mm² = AWG " + U.awgLabel(Math.round(x))
          : f(mm2, 2) + " mm²: AWG " + U.awgLabel(thin) + " (" + f(U.awgArea(thin, A), 2) + " mm²) ile AWG " + U.awgLabel(thick) + " (" + f(U.awgArea(thick, A), 2) + " mm²) arasında");
      } else out("ucMmOut", "—");
      if (isFinite(n)) { drawAwg(n, mm2); convTx.awg = "AWG " + U.awgLabel(n) + " = " + f(U.awgArea(n, A), 2) + " mm²"; }
      convSummary();
    }
    function calcInv() {
      var p = num("ucP"), v = num("ucVb"), eta = num("ucEta");
      if (!ok(p, v, eta) || eta > 100) { out("ucIb", "—"); convTx.inv = ""; convSummary(); return; }
      var i = U.invCurrent(p, v, eta / 100);
      out("ucIb", f(i, 2) + " A");
      convTx.inv = f(p) + " W inverter yükü, " + f(v) + " V akü, verim %" + f(eta, 1) + " (varsayım): akü akımı " + f(i, 2) + " A";
      convSummary();
    }
    ["ucW", "ucA", "ucV1", "ucAh", "ucWh", "ucV2", "ucHp", "ucKw"].forEach(function (id) { var e = $("#" + id); if (e) e.addEventListener("input", texts); });
    onInput(["ucAwg", "ucMm2"], calcAwg); onInput(["ucP", "ucVb", "ucEta"], calcInv);
    runWA("ucW"); runAh("ucAh"); runHp("ucHp"); texts(); calcAwg(); calcInv();
  })();

  // ----- 8) Montaj öncesi kontrol listesi -----
  (function () {
    var LS = "gespa-usta-check", boxes = $$("[data-chk]", page); if (!boxes.length) return;
    var state = {};
    try { state = JSON.parse(root.localStorage.getItem(LS) || "{}") || {}; } catch (e) { state = {}; }
    function save() { try { root.localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }
    function draw() {
      var done = boxes.filter(function (b) { return b.checked; }).length, total = boxes.length;
      var svg = svgOf("ukcSvg", 120, 120, "Tamamlanan kontrol sayısı"), R = 48, C = 2 * Math.PI * R;
      if (svg) {
        svg.appendChild(el("circle", { cx: 60, cy: 60, r: R, "class": "u-ring" }));
        var arc = el("circle", { cx: 60, cy: 60, r: R, "class": "u-ringon", "stroke-dasharray": C, "stroke-dashoffset": C * (1 - done / total), transform: "rotate(-90 60 60)" });
        svg.appendChild(arc);
        svg.appendChild(el("text", { x: 60, y: 68, "text-anchor": "middle", "class": "u-ringt" }, done + "/" + total));
      }
      out("ukcState", done === total ? "Tüm kontroller işaretlendi." : (total - done) + " kontrol kaldı.");
      var left = boxes.filter(function (b) { return !b.checked; }).map(function (b) { var l = b.closest("label"); return l ? l.textContent.replace(/\s+/g, " ").trim() : ""; });
      summary("kontrol", "Montaj öncesi kontrol: " + done + "/" + total + " tamam" + (left.length ? ". Kalanlar: " + left.join("; ") : ""));
    }
    boxes.forEach(function (b) {
      b.checked = !!state[b.getAttribute("data-chk")];
      b.addEventListener("change", function () { state[b.getAttribute("data-chk")] = b.checked ? 1 : 0; save(); touch(b); draw(); });
    });
    var reset = $("#ukcReset");
    if (reset) reset.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); state = {}; save(); draw(); });
    draw();
  })();
  var printBtn = $("#ustaPrint");
  if (printBtn) printBtn.addEventListener("click", function () { root.print(); });

  // ----- Araç gezinme şeridi: görünen bölümü vurgula -----
  (function () {
    var links = $$(".usta-nav a", page), secs = $$("[data-usta-tool]", page);
    if (!links.length || !("IntersectionObserver" in root)) return;
    var io = new root.IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + id;
          a.classList.toggle("active", on);
          if (on && a.parentNode && a.parentNode.scrollTo) a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: "auto" });
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    secs.forEach(function (s) { io.observe(s); });
  })();
  updateWa();
})(typeof window !== "undefined" ? window : this);
