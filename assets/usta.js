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
      dod: sz.dod, sunHours: sz.sunHours, sysEff: sz.systemEff, autonomy: sz.autonomyDays,
      unitPrice: c.defaultUnitPrice, panelW: c.panelW, ref: u.ref || {},
      appliances: (cfg && cfg.builder && cfg.builder.appliances) || [], presets: (cfg && cfg.builder && cfg.builder.presets) || [],
      acV: u.acV || {}, acSections: u.acSections || [], noct: u.noct || {},
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

  // A) AC gerilim düşümü (yalnız direnç; reaktans ihmal): tek faz 2·I·L·ρ·cosφ/S · üç faz √3·I·L·ρ·cosφ/S
  U.acDrop = function (phase, i, len, s, rho, cos, v) {
    var drop = (phase === 3 ? Math.sqrt(3) : 2) * i * len * rho * cos / s;
    return { drop: drop, pct: drop / v * 100 };
  };
  U.acRec = function (phase, i, len, sections, rho, cos, v, target) {
    for (var n = 0; n < sections.length; n++) {
      if (U.acDrop(phase, i, len, sections[n], rho, cos, v).pct <= target + EPS) return sections[n];
    }
    return null;
  };
  // B) Yükten akıma: DC P/V · tek faz P/(V·cosφ) · üç faz P/(√3·V·cosφ) · kVA = kW/cosφ
  U.current = function (kind, p, v, cos) {
    if (kind === "dc") return p / v;
    return p / ((kind === "3" ? Math.sqrt(3) : 1) * v * cos);
  };
  U.kwToKva = function (kw, cos) { return kw / cos; };
  U.kvaToKw = function (kva, cos) { return kva * cos; };
  // C) Ohm kanunu ve güç: V, I, R, P'den herhangi ikisi → dördü (V = I·R, P = V·I)
  U.ohm = function (o) {
    var v = o.v, i = o.i, r = o.r, p = o.p, has = function (x) { return isFinite(x) && x > 0; };
    if (has(v) && has(i)) { r = v / i; p = v * i; }
    else if (has(v) && has(r)) { i = v / r; p = v * v / r; }
    else if (has(v) && has(p)) { i = p / v; r = v * v / p; }
    else if (has(i) && has(r)) { v = i * r; p = i * i * r; }
    else if (has(i) && has(p)) { v = p / i; r = p / (i * i); }
    else if (has(r) && has(p)) { v = Math.sqrt(p * r); i = Math.sqrt(p / r); }
    else return null;
    return { v: v, i: i, r: r, p: p };
  };
  // D) Şarj kontrol cihazı akımı (pay eklenmeden en az çıkış akımı): I = dizi W / akü V
  U.controllerA = function (w, v) { return w / v; };
  // E) Akü süresi: saat = V·Ah·DoD·η / yük W
  U.runtime = function (v, ah, dod, eta, load) { var wh = v * ah * dod * eta; return { wh: wh, hours: wh / load }; };
  // F) Dolum: şarj akımı = dizi W / akü V (ideal) · güneşli saat = Ah / akım · gün = saat / günlük güneşli saat
  U.refill = function (ah, w, v, sun) { var i = w / v, h = ah / i; return { i: i, hours: h, days: h / sun }; };
  // G) C oranı: I = C·Ah · süre = 1/C saat
  U.cRate = function (c, ah) { return { i: c * ah, hours: 1 / c }; };
  U.cOf = function (i, ah) { return i / ah; };
  // H) Tasarım günü üretimi: kWh/gün = kWp · güneş saati · sistem verimi (Sistem Kurucu katsayıları)
  U.dailyKwh = function (kwp, sun, eff) { return kwp * sun * eff; };
  // I) Sıcaklıkta güç: P = Pmax·(1 + γ/100·(Thücre − Tstc)) · Thücre = Tortam + (NOCT − Tnoct)/Gnoct·G (tanım koşulları config.calc.usta.noct)
  U.tempPower = function (pmax, gamma, tcell, stc) { return pmax * (1 + gamma / 100 * (tcell - stc)); };
  U.cellTemp = function (tamb, noct, g, n) { return tamb + (noct - n.ambC) / n.irr * g; };
  // J) Gölge uzunluğu = h / tan(öğle güneş yüksekliği)
  U.shadow = function (h, elevDeg) { return h / Math.tan(elevDeg * Math.PI / 180); };
  // K) Eğim: % = tan(derece)·100 (100 cm yatayda cm yükselme aynı sayıdır)
  U.slopePct = function (deg) { return Math.tan(deg * Math.PI / 180) * 100; };
  U.slopeDeg = function (pct) { return Math.atan(pct / 100) * 180 / Math.PI; };
  // L) Günlük tüketim: Wh = W · saat · adet
  U.loadWh = function (w, h, n) { return w * h * n; };

  // Cihaz listesi: Wh = Σ W·adet·saat · panel W = Wh/(güneş saati·sistem verimi) ·
  // akü Ah = Wh·gün/(V·DoD·η) · inverter W ≥ Σ W·adet (kalkış akımı HARİÇ)
  U.loadPlan = function (rows, o) {
    var wh = 0, sumW = 0;
    rows.forEach(function (r) { wh += r.w * r.n * r.h; sumW += r.w * r.n; });
    return { wh: wh, sumW: sumW, panelW: wh / (o.sun * o.eff), ah: wh * o.days / (o.v * o.dod * o.eta) };
  };
  // Sistem Kurucu senaryosu → satırlar (W ve saat config.builder.appliances'tan; burada cihaz gücü UYDURULMAZ)
  U.presetRows = function (k, presetId) {
    var p = k.presets.filter(function (x) { return x.id === presetId; })[0], rows = [];
    if (!p) return rows;
    Object.keys(p.items).forEach(function (id) {
      var a = k.appliances.filter(function (x) { return x.id === id; })[0];
      if (a) rows.push({ name: a.name, w: a.w, n: p.items[id], h: a.h });
    });
    return rows;
  };
  // Sigorta–kablo uyumu: Ib ≤ In ≤ Iz (Iz üretici tablosundan girilir)
  U.coord = function (ib, inn, iz) { var a = ib <= inn + EPS, b = inn <= iz + EPS; return { load: a, cable: b, ok: a && b }; };
  // Motor: mil gücü kW = HP/hpPerKw · elektrik gücü = mil/verim · akım = yukarıdaki akım formülü
  U.motor = function (hp, hpPerKw, eff, cos, v, kind) {
    var shaft = hp / hpPerKw, input = shaft / eff;
    return { shaftKw: shaft, inKw: input, i: U.current(kind, input * 1000, v, cos) };
  };
  // Tüketim ve maliyet: kWh = W·saat·gün/1000 · tutar = kWh·birim fiyat
  U.usage = function (w, h, days, price) { var kwh = w * h * days / 1000; return { kwh: kwh, cost: kwh * price }; };
  // Üretilen enerji bir yükü kaç saat çalıştırır: saat = kWh·1000/W
  U.runHours = function (kwh, loadW) { return kwh * 1000 / loadW; };

  // İnverter kodu arama (veri: assets/inverter-veri.json). Aileler BİRLEŞTİRİLMEZ: arama hep tek aile içinde
  // yapılır; eşleşme yoksa boş döner (tahmin yok). "F13", "13", "Fault 13", "hata kodu 013" aynı anahtara iner.
  U.invKey = function (x) {
    var t = String(x == null ? "" : x).replace(/İ/g, "I").replace(/ı/g, "i").toUpperCase().replace(/\([^)]*\)/g, " "), prev;
    do { prev = t; t = t.replace(/^\s*(?:HATA|ARIZA|UYARI|ALARM|FAULT|WARNING|ERROR|ERR|KODU|KOD|CODE|NO)\b[\s.:#-]*/, ""); } while (t !== prev);
    t = t.replace(/^\s*[FEWA][\s.:#-]*(?=\d)/, "").replace(/[^A-Z0-9]+/g, "");
    return /^\d+$/.test(t) ? String(parseInt(t, 10)) : t;
  };
  U.invKeys = function (code) {
    var keys = [U.invKey(code)], m = /\(([^)]+)\)/.exec(String(code));
    if (m) keys.push(U.invKey(m[1]));
    return keys;
  };
  U.invFind = function (fam, input, type) {
    var k = U.invKey(input); if (!k || !fam) return [];
    return fam.codes.filter(function (r) { return (!type || r.t === type) && U.invKeys(r.c).indexOf(k) >= 0; });
  };
  U.invFamily = function (data, id) { return ((data && data.families) || []).filter(function (f) { return f.id === id; })[0] || null; };
  U.INV_TYPE = { fault: "Arıza", alarm: "Alarm", warning: "Uyarı", info: "Bilgi / durum" };

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

    var q = d.ac, q1 = U.acDrop(1, q.i, q.len, q.section, k.rho, q.cos, k.acV.one), q3 = U.acDrop(3, q.i, q.len, q.section, k.rho, q.cos, k.acV.three);
    ex["ac.i"] = f(q.i); ex["ac.len"] = f(q.len); ex["ac.s"] = f(q.section); ex["ac.cos"] = f(q.cos); ex["ac.rho"] = f(k.rho, 4);
    ex["ac.v1"] = f(k.acV.one); ex["ac.v3"] = f(k.acV.three);
    ex["ac.drop1"] = f(q1.drop, 2); ex["ac.pct1"] = f(q1.pct, 2); ex["ac.drop3"] = f(q3.drop, 2); ex["ac.pct3"] = f(q3.pct, 2);

    var cu = d.current;
    ex["akim.p"] = f(cu.p); ex["akim.cos"] = f(cu.cos); ex["akim.dcV"] = f(cu.dcV);
    ex["akim.i1"] = f(U.current("1", cu.p, k.acV.one, cu.cos), 2); ex["akim.i3"] = f(U.current("3", cu.p, k.acV.three, cu.cos), 2);
    ex["akim.idc"] = f(U.current("dc", cu.p, cu.dcV, 1), 2);
    ex["akim.kw"] = f(cu.p / 1000, 3); ex["akim.kva"] = f(U.kwToKva(cu.p / 1000, cu.cos), 2);

    var o = U.ohm({ v: d.ohm.v, i: d.ohm.i });
    ex["ohm.v"] = f(o.v); ex["ohm.i"] = f(o.i); ex["ohm.r"] = f(o.r, 3); ex["ohm.p"] = f(o.p, 2);

    var sk = d.controller;
    ex["sk.w"] = f(sk.w); ex["sk.v"] = f(sk.v); ex["sk.i"] = f(U.controllerA(sk.w, sk.v), 1);

    var rt = d.runtime, rr = U.runtime(rt.v, rt.ah, k.dod, k.invEff, rt.load);
    ex["sure.v"] = f(rt.v); ex["sure.ah"] = f(rt.ah); ex["sure.load"] = f(rt.load);
    ex["sure.dod"] = f(k.dod, 3); ex["sure.eta"] = f(k.invEff, 3); ex["sure.wh"] = f(rr.wh, 1); ex["sure.h"] = f(rr.hours, 2);

    var rf = d.refill, rfr = U.refill(rf.ah, rf.w, rf.v, k.sunHours);
    ex["sarj.ah"] = f(rf.ah); ex["sarj.w"] = f(rf.w); ex["sarj.v"] = f(rf.v); ex["sarj.sun"] = f(k.sunHours, 2);
    ex["sarj.i"] = f(rfr.i, 1); ex["sarj.h"] = f(rfr.hours, 2); ex["sarj.days"] = f(rfr.days, 2);

    var cr2 = d.crate, crr = U.cRate(cr2.c, cr2.ah);
    ex["c.ah"] = f(cr2.ah); ex["c.c"] = f(cr2.c, 2); ex["c.i"] = f(crr.i, 1); ex["c.h"] = f(crr.hours, 2);

    var dy = d.daily;
    ex["uretim.w"] = f(dy.w); ex["uretim.kwp"] = f(dy.w / 1000, 3); ex["uretim.sun"] = f(k.sunHours, 2); ex["uretim.eff"] = f(k.sysEff, 3);
    ex["uretim.kwh"] = f(U.dailyKwh(dy.w / 1000, k.sunHours, k.sysEff), 2);

    var tp = d.temp;
    ex["sic.pmax"] = f(tp.pmax); ex["sic.gamma"] = f(tp.gamma, 2); ex["sic.tcell"] = f(tp.tcell, 1); ex["sic.stc"] = f(k.stc);
    ex["sic.dt"] = f(tp.tcell - k.stc, 1); ex["sic.p"] = f(U.tempPower(tp.pmax, tp.gamma, tp.tcell, k.stc), 1);
    ex["sic.tamb"] = f(tp.tamb, 1); ex["sic.noct"] = f(tp.noct, 1); ex["sic.g"] = f(tp.g, 0);
    ex["sic.nAmb"] = f(k.noct.ambC); ex["sic.nIrr"] = f(k.noct.irr, 0); ex["sic.tc"] = f(U.cellTemp(tp.tamb, tp.noct, tp.g, k.noct), 2);

    var sdw = d.shadow;
    ex["golge.h"] = f(sdw.h); ex["golge.lat"] = f(k.defLat, 1);
    ex["golge.winter"] = f(U.shadow(sdw.h, s.winter), 2); ex["golge.equinox"] = f(U.shadow(sdw.h, s.equinox), 2); ex["golge.summer"] = f(U.shadow(sdw.h, s.summer), 2);
    ex["golge.elevWinter"] = f(s.winter, 2);

    var sl = d.slope;
    ex["cati.deg"] = f(sl.deg, 1); ex["cati.pct"] = f(U.slopePct(sl.deg), 2);
    ex["cati.pct2"] = f(sl.pct, 1); ex["cati.deg2"] = f(U.slopeDeg(sl.pct), 2); ex["cati.ratio2"] = f(100 / sl.pct, 2);

    var ld = d.load;
    ex["yuk.w"] = f(ld.w); ex["yuk.h"] = f(ld.h); ex["yuk.n"] = f(ld.n, 0); ex["yuk.wh"] = f(U.loadWh(ld.w, ld.h, ld.n), 0);

    // --- 3. tur
    var ll = d.loadlist, rows = U.presetRows(k, ll.preset), pre = k.presets.filter(function (x) { return x.id === ll.preset; })[0];
    var lp = U.loadPlan(rows, { sun: k.sunHours, eff: k.sysEff, days: k.autonomy, v: ll.v, dod: k.dod, eta: k.invEff });
    ex["liste.preset"] = pre ? pre.label : ""; ex["liste.n"] = String(rows.length);
    rows.forEach(function (r, i) {
      ex["liste.r" + i + ".name"] = r.name; ex["liste.r" + i + ".w"] = f(r.w); ex["liste.r" + i + ".n"] = f(r.n, 0);
      ex["liste.r" + i + ".h"] = f(r.h); ex["liste.r" + i + ".wh"] = f(r.w * r.n * r.h, 0);
    });
    ex["liste.v"] = f(ll.v); ex["liste.days"] = f(k.autonomy); ex["liste.sun"] = f(k.sunHours, 2); ex["liste.eff"] = f(k.sysEff, 3);
    ex["liste.dod"] = f(k.dod, 3); ex["liste.eta"] = f(k.invEff, 3);
    ex["liste.wh"] = f(lp.wh, 0); ex["liste.panelW"] = f(lp.panelW, 0); ex["liste.ah"] = f(lp.ah, 1); ex["liste.inv"] = f(lp.sumW, 0);

    var mo = d.motor, m1 = U.motor(mo.hp, k.hpPerKw, mo.eff, mo.cos, k.acV.one, "1"), m3 = U.motor(mo.hp, k.hpPerKw, mo.eff, mo.cos, k.acV.three, "3");
    ex["motor.hp"] = f(mo.hp); ex["motor.eff"] = f(mo.eff, 3); ex["motor.cos"] = f(mo.cos, 3);
    ex["motor.shaft"] = f(m1.shaftKw, 3); ex["motor.in"] = f(m1.inKw, 3); ex["motor.i1"] = f(m1.i, 2); ex["motor.i3"] = f(m3.i, 2);

    var co = d.coord, cv = U.coord(co.ib, co["in"], co.iz), cbad = U.coord(co.ib, co["in"], co.ib);
    ex["uyum.ib"] = f(co.ib); ex["uyum.in"] = f(co["in"]); ex["uyum.iz"] = f(co.iz);
    ex["uyum.verdict"] = cv.ok ? "koşul sağlanır" : "koşul sağlanmaz";
    ex["uyum.izBad"] = f(co.ib); ex["uyum.verdictBad"] = cbad.ok ? "koşul sağlanır" : "koşul sağlanmaz";

    var us = d.usage, ur = U.usage(us.w, us.h, us.days, k.unitPrice);
    ex["tuk.w"] = f(us.w); ex["tuk.h"] = f(us.h); ex["tuk.days"] = f(us.days, 0); ex["tuk.price"] = f(k.unitPrice, 2);
    ex["tuk.kwh"] = f(ur.kwh, 2); ex["tuk.cost"] = f(ur.cost, 2);

    var dk = U.dailyKwh(dy.w / 1000, k.sunHours, k.sysEff), p1 = U.dailyKwh(k.panelW / 1000, k.sunHours, k.sysEff);
    ex["uretim.load"] = f(d.dailyLoad); ex["uretim.hours"] = f(U.runHours(dk, d.dailyLoad), 1);
    ex["uretim.p1"] = f(k.panelW); ex["uretim.p1kwp"] = f(k.panelW / 1000, 3); ex["uretim.p1kwh"] = f(p1, 2);
    ex["uretim.p1hours"] = f(U.runHours(p1, d.dailyLoad), 1);

    var rf2 = k.ref;
    ex["ref.kw"] = f(rf2.kw); ex["ref.kwW"] = f(rf2.kw * 1000);
    ex["ref.kwI1"] = f(U.current("1", rf2.kw * 1000, k.acV.one, cu.cos), 2); ex["ref.kwI1c1"] = f(U.current("1", rf2.kw * 1000, k.acV.one, 1), 2);
    ex["ref.kwI3"] = f(U.current("3", rf2.kw * 1000, k.acV.three, cu.cos), 2); ex["ref.kwI3c1"] = f(U.current("3", rf2.kw * 1000, k.acV.three, 1), 2);
    ex["ref.kva"] = f(rf2.kva); ex["ref.kvaKw"] = f(U.kvaToKw(rf2.kva, cu.cos), 2);
    ex["ref.ah"] = f(rf2.ah);
    rf2.ahV.forEach(function (vv) { ex["ref.ahV" + vv] = f(vv); ex["ref.ahKwh" + vv] = f(U.ahToWh(rf2.ah, vv) / 1000, 2); });
    rf2.bankV.forEach(function (vv) { ex["ref.bankV" + vv] = f(vv); ex["ref.bankN" + vv] = f(vv / b.v, 2); });
    ex["ref.kwN"] = String((rf2.kwList || []).length); ex["ref.cos"] = f(cu.cos);
    (rf2.kwList || []).forEach(function (kw, i) {
      ex["ref.kwL" + i] = f(kw); ex["ref.kwL" + i + "a1"] = f(U.current("1", kw * 1000, k.acV.one, cu.cos), 1); ex["ref.kwL" + i + "a3"] = f(U.current("3", kw * 1000, k.acV.three, cu.cos), 1);
    });
    ex["awg.n"] = String(rf2.awgTable.length);
    rf2.awgTable.forEach(function (n, i) {
      ex["awg.t" + i + ".l"] = U.awgLabel(n); ex["awg.t" + i + ".d"] = f(U.awgDia(n, k.awg), 2); ex["awg.t" + i + ".a"] = f(U.awgArea(n, k.awg), 2);
    });
    return ex;
  };

  G.usta = U;

  /* ---------- 2) SAYFA BAĞLAMA ---------- */
  var doc = root.document;
  if (!doc || !doc.querySelector) return;
  var page = doc.querySelector("[data-usta]");
  if (!page) return;
  page.classList.add("usta-on");            // JS çalışıyor: eylem düğmeleri ve tek-araç görünümü CSS'te bu sınıfa bağlı
  var EXAMPLE = {}, RESET = {};             // araca özel "Örnek değerler" / "Sıfırla" (yoksa genel kural)
  var showTool = function (id) { var t = doc.getElementById(id); if (t) t.scrollIntoView(); };   // merkezde uygulama denetçisi değiştirir

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
    try {                               // inverter aracından gelen bağlantı: ?kv=<V>&ki=<A>
      var q = new root.URLSearchParams(root.location.search), kv = parseFloat(q.get("kv")), ki = parseFloat(q.get("ki"));
      if (kv > 0 && ki > 0) { setVal("ukV", r4(kv)); setVal("ukI", r4(ki)); }
    } catch (e) {}
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
      svg.appendChild(el("text", { x: x, y: y, "text-anchor": x < 110 ? "start" : (x > W - 110 ? "end" : "middle"), "class": "u-t u-b " + cls }, text));
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
    EXAMPLE.dizi = function () { Object.keys(map).forEach(function (id) { setVal(id, g[map[id]]); }); setVal("udN", ""); udTouchedN = false; calcDizi(); };
    RESET.dizi = function () { Object.keys(map).forEach(function (id) { setVal(id, ""); }); setVal("udN", ""); udTouchedN = false; calcDizi(); };
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
    ["wa", "ah", "hp", "awg"].forEach(function (key) { if (convTx[key]) parts.push(convTx[key]); });
    summary("cevirici", parts.join(" · "));
  }
  (function () {
    if (!$("#ucW") && !$("#ucAh") && !$("#ucAwg") && !$("#ucP")) return; var d = D.conv || {}, A = K.awg;
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
      var go = $("#ucToCable");
      if (!ok(p, v, eta) || eta > 100) { out("ucIb", "—"); if (go) go.hidden = true; summary("inverter-aku-akimi", ""); return; }
      var i = U.invCurrent(p, v, eta / 100);
      out("ucIb", f(i, 2) + " A");
      if (go) { go.hidden = false; go.setAttribute("data-v", r4(v)); go.setAttribute("data-i", r4(i)); }
      summary("inverter-aku-akimi", f(p) + " W inverter yükü, " + f(v) + " V akü, verim %" + f(eta, 1) + " (varsayım): akü akımı " + f(i, 2) + " A");
    }
    ["ucW", "ucA", "ucV1", "ucAh", "ucWh", "ucV2", "ucHp", "ucKw"].forEach(function (id) { var e = $("#" + id); if (e) e.addEventListener("input", texts); });
    onInput(["ucAwg", "ucMm2"], calcAwg); onInput(["ucP", "ucVb", "ucEta"], calcInv);
    var go = $("#ucToCable");
    if (go) go.addEventListener("click", function () {      // akımı DC kablo aracına taşı (sayfada yoksa merkez sayfaya)
      var v = go.getAttribute("data-v"), i = go.getAttribute("data-i"), sec = $("#kablo");
      if (sec && $("#ukV")) { setVal("ukV", v); setVal("ukI", i); calcKablo(); showTool("kablo"); }
      else root.location.href = "elektrikci-cantasi.html?kv=" + encodeURIComponent(v) + "&ki=" + encodeURIComponent(i) + "#kablo";
    });
    runWA("ucW"); runAh("ucAh"); runHp("ucHp"); texts(); calcAwg(); if ($("#ucP")) calcInv();
  })();

  // ===== 2. tur araçları =====
  function outs(ids, t) { ids.forEach(function (id) { out(id, t == null ? "—" : t); }); }
  function fillSelect(id, list, label) {
    var sel = $("#" + id); if (!sel) return null;
    clear(sel);
    list.forEach(function (x) { var o = doc.createElement("option"); o.value = x; o.textContent = label(x); sel.appendChild(o); });
    return sel;
  }

  // ----- A) AC kablo gerilim düşümü -----
  (function () {
    if (!$("#xaI")) return; var d = D.ac || {};
    fillSelect("xaS", K.acSections, function (x) { return f(x) + " mm²"; });
    setVal("xaV", K.acV.one); setVal("xaI", d.i); setVal("xaLen", d.len); setVal("xaS", d.section); setVal("xaCos", d.cos);
    function calc() {
      var ph = $("#xaPhase").value === "3" ? 3 : 1, v = num("xaV"), i = num("xaI"), len = num("xaLen"), sx = num("xaS"), cos = num("xaCos"), tg = num("xaTarget");
      if (!ok(v, i, len, sx, cos) || cos > 1) { outs(["xaDrop", "xaPct", "xaEnd", "xaRec"]); note("xaMsg", cos > 1 ? "cosφ en çok 1 olabilir." : "", "warn"); summary("ac-kablo", ""); return; }
      var r = U.acDrop(ph, i, len, sx, K.rho, cos, v);
      out("xaDrop", f(r.drop, 2) + " V"); out("xaPct", "%" + f(r.pct, 2)); out("xaEnd", f(v - r.drop, 1) + " V");
      var txt = (ph === 3 ? "Üç faz " : "Tek faz ") + f(v) + " V, " + f(i) + " A, " + f(len) + " m, " + f(sx) + " mm², cosφ " + f(cos) + ": gerilim düşümü " + f(r.drop, 2) + " V (%" + f(r.pct, 2) + ")";
      if (ok(tg)) {
        var rec = U.acRec(ph, i, len, K.acSections, K.rho, cos, v, tg);
        out("xaRec", rec == null ? "listede yok" : f(rec) + " mm²");
        note("xaMsg", r.pct <= tg + EPS ? "Seçili kesit, yazdığınız %" + f(tg) + " sınırının içinde." : "Seçili kesit, yazdığınız %" + f(tg) + " sınırını aşıyor.", r.pct <= tg + EPS ? "ok" : "warn");
        if (rec != null) txt += ", %" + f(tg) + " için en küçük kesit " + f(rec) + " mm²";
      } else { out("xaRec", "sınır yazın"); note("xaMsg", ""); }
      summary("ac-kablo", txt);
    }
    var phSel = $("#xaPhase");
    phSel.addEventListener("change", function () { setVal("xaV", phSel.value === "3" ? K.acV.three : K.acV.one); touch(phSel); calc(); });
    onInput(["xaV", "xaI", "xaLen", "xaS", "xaCos", "xaTarget"], calc); calc();
  })();

  // ----- B) Yükten akıma + kW ↔ kVA -----
  (function () {
    if (!$("#xbP")) return; var d = D.current || {}, kind = $("#xbKind");
    setVal("xbP", d.p); setVal("xbV", K.acV.one); setVal("xbCos", d.cos); setVal("xbKw", d.p / 1000); setVal("xbCos2", d.cos);
    function calc() {
      var kd = kind.value, p = num("xbP"), v = num("xbV"), cos = kd === "dc" ? 1 : num("xbCos");
      $("#xbCos").disabled = kd === "dc";
      if (!ok(p, v, cos) || cos > 1) { out("xbI", "—"); summary("akim", ""); return; }
      var i = U.current(kd, p, v, cos);
      out("xbI", f(i, 2) + " A");
      summary("akim", (kd === "dc" ? "DC" : kd === "3" ? "Üç faz" : "Tek faz") + " " + f(p) + " W, " + f(v) + " V" + (kd === "dc" ? "" : ", cosφ " + f(cos)) + ": akım " + f(i, 2) + " A");
    }
    kind.addEventListener("change", function () { setVal("xbV", kind.value === "dc" ? d.dcV : kind.value === "3" ? K.acV.three : K.acV.one); touch(kind); calc(); });
    onInput(["xbP", "xbV", "xbCos"], calc); calc();
    var last = "xbKw";
    function kva(src) {
      last = src || last; var cos = num("xbCos2"), x;
      if (!ok(cos) || cos > 1) return;
      if (last === "xbKw") { x = num("xbKw"); setVal("xbKva", isFinite(x) ? r4(U.kwToKva(x, cos)) : ""); }
      else { x = num("xbKva"); setVal("xbKw", isFinite(x) ? r4(U.kvaToKw(x, cos)) : ""); }
    }
    ["xbKw", "xbKva"].forEach(function (id) { $("#" + id).addEventListener("input", function () { kva(id); }); });
    $("#xbCos2").addEventListener("input", function () { kva(); });
    kva("xbKw");
  })();

  // ----- C) Ohm kanunu / güç -----
  (function () {
    if (!$("#xoV")) return; var d = D.ohm || {}, ids = ["xoV", "xoI", "xoR", "xoP"], keys = ["v", "i", "r", "p"];
    setVal("xoV", d.v); setVal("xoI", d.i);
    function calc() {
      var o = {}, n = 0;
      ids.forEach(function (id, x) { var val = num(id); if (isFinite(val)) { o[keys[x]] = val; n++; } });
      var r = n === 2 ? U.ohm(o) : null;
      if (!r) {
        outs(["xoOutV", "xoOutI", "xoOutR", "xoOutP"]);
        note("xoMsg", n === 2 ? "Değerler sıfırdan büyük olmalı." : "Dört alandan tam olarak ikisini doldurun (şu an " + n + ").", n > 2 ? "warn" : "");
        summary("ohm", ""); return;
      }
      note("xoMsg", "");
      out("xoOutV", f(r.v, 2) + " V"); out("xoOutI", f(r.i, 3) + " A"); out("xoOutR", f(r.r, 3) + " Ω"); out("xoOutP", f(r.p, 2) + " W");
      summary("ohm", "Ohm kanunu: " + f(r.v, 2) + " V, " + f(r.i, 3) + " A, " + f(r.r, 3) + " Ω, " + f(r.p, 2) + " W");
    }
    var clr = $("#xoClear");
    if (clr) clr.addEventListener("click", function () { ids.forEach(function (id) { setVal(id, ""); }); calc(); });
    onInput(ids, calc); calc();
  })();

  // ----- D) Şarj kontrol cihazı akımı -----
  (function () {
    if (!$("#xdW")) return; var d = D.controller || {};
    setVal("xdW", d.w); setVal("xdV", d.v);
    function calc() {
      var w = num("xdW"), v = num("xdV");
      if (!ok(w, v)) { out("xdI", "—"); summary("sarj-kontrol", ""); return; }
      var i = U.controllerA(w, v);
      out("xdI", f(i, 1) + " A");
      summary("sarj-kontrol", f(w) + " W panel dizisi, " + f(v) + " V akü: şarj kontrol cihazı çıkış akımı en az " + f(i, 1) + " A (üretici payı hariç)");
    }
    onInput(["xdW", "xdV"], calc); calc();
  })();

  // ----- E) Akü ne kadar dayanır -----
  (function () {
    if (!$("#xeV")) return; var d = D.runtime || {};
    setVal("xeV", d.v); setVal("xeAh", d.ah); setVal("xeLoad", d.load);
    setVal("xeDod", isFinite(K.dod) ? r4(K.dod * 100) : ""); setVal("xeEta", isFinite(K.invEff) ? r4(K.invEff * 100) : "");
    function calc() {
      var v = num("xeV"), ah = num("xeAh"), dod = num("xeDod"), eta = num("xeEta"), load = num("xeLoad");
      if (!ok(v, ah, dod, eta, load) || dod > 100 || eta > 100) { outs(["xeH", "xeWh"]); summary("aku-sure", ""); return; }
      var r = U.runtime(v, ah, dod / 100, eta / 100, load), hh = Math.floor(r.hours), mm = Math.round((r.hours - hh) * 60);
      if (mm === 60) { hh++; mm = 0; }
      out("xeH", f(r.hours, 2) + " saat"); out("xeWh", f(r.wh, 0) + " Wh"); out("xeHm", "≈ " + hh + " saat " + mm + " dakika");
      summary("aku-sure", f(v) + " V " + f(ah) + " Ah akü, DoD %" + f(dod) + ", verim %" + f(eta) + ", yük " + f(load) + " W: yaklaşık " + f(r.hours, 2) + " saat (" + f(r.wh, 0) + " Wh kullanılabilir)");
    }
    onInput(["xeV", "xeAh", "xeDod", "xeEta", "xeLoad"], calc); calc();
  })();

  // ----- F) Aküyü panel kaç saatte doldurur -----
  (function () {
    if (!$("#xfAh")) return; var d = D.refill || {};
    setVal("xfAh", d.ah); setVal("xfW", d.w); setVal("xfV", d.v); setVal("xfSun", K.sunHours);
    function calc() {
      var ah = num("xfAh"), w = num("xfW"), v = num("xfV"), sun = num("xfSun");
      if (!ok(ah, w, v)) { outs(["xfI", "xfH", "xfDays"]); summary("aku-sarj", ""); return; }
      var r = U.refill(ah, w, v, ok(sun) ? sun : NaN);
      out("xfI", f(r.i, 1) + " A"); out("xfH", f(r.hours, 2) + " güneşli saat"); out("xfDays", ok(sun) ? f(r.days, 2) + " gün" : "—");
      summary("aku-sarj", f(ah) + " Ah doldurmak için " + f(w) + " W dizi, " + f(v) + " V akü: şarj akımı " + f(r.i, 1) + " A, " + f(r.hours, 2) + " güneşli saat"
        + (ok(sun) ? " (günde " + f(sun, 2) + " güneşli saatle " + f(r.days, 2) + " gün)" : "") + ", ideal hesap");
    }
    onInput(["xfAh", "xfW", "xfV", "xfSun"], calc); calc();
  })();

  // ----- G) C oranı -----
  (function () {
    if (!$("#xgAh")) return; var d = D.crate || {};
    setVal("xgAh", d.ah); setVal("xgC", d.c);
    var run = pair("xgC", "xgI", "xgAh", function (c, ah) { return U.cRate(c, ah).i; }, U.cOf);
    function calc() {
      var c = num("xgC"), ah = num("xgAh"), i = num("xgI");
      if (!ok(c, ah)) { out("xgT", "—"); summary("c-orani", ""); return; }
      var h = U.cRate(c, ah).hours;
      out("xgT", h >= 1 ? f(h, 2) + " saat" : f(h * 60, 0) + " dakika");
      summary("c-orani", f(ah) + " Ah aküde " + f(c, 3) + "C = " + f(i, 1) + " A; bu akımda süre " + f(h, 2) + " saat");
    }
    ["xgC", "xgI", "xgAh"].forEach(function (id) { $("#" + id).addEventListener("input", calc); });
    run("xgC"); calc();
  })();

  // ----- H) Tasarım günü üretimi -----
  (function () {
    if (!$("#xhW")) return; var d = D.daily || {};
    setVal("xhW", d.w); setVal("xhSun", K.sunHours); setVal("xhEff", isFinite(K.sysEff) ? r4(K.sysEff * 100) : ""); setVal("xhLoad", D.dailyLoad);
    function calc() {
      var w = num("xhW"), sun = num("xhSun"), eff = num("xhEff");
      if (!ok(w, sun, eff) || eff > 100) { outs(["xhKwh", "xhKwp", "xhRun"]); summary("gunluk-uretim", ""); return; }
      var kwh = U.dailyKwh(w / 1000, sun, eff / 100), load = num("xhLoad");
      out("xhKwp", f(w / 1000, 3) + " kWp"); out("xhKwh", f(kwh, 2) + " kWh/gün");
      out("xhRun", ok(load) ? f(U.runHours(kwh, load), 1) + " saat" : "—");
      summary("gunluk-uretim", f(w) + " W panel, " + f(sun, 2) + " güneş saati, sistem verimi %" + f(eff) + ": tasarım günü üretimi yaklaşık " + f(kwh, 2) + " kWh/gün");
    }
    onInput(["xhW", "xhSun", "xhEff", "xhLoad"], calc); calc();
  })();

  // ----- I) Sıcaklıkta panel gücü (+ isteğe bağlı NOCT ile hücre sıcaklığı) -----
  (function () {
    if (!$("#xiP")) return; var d = D.temp || {};
    setVal("xiP", d.pmax); setVal("xiG", d.gamma); setVal("xiT", d.tcell);
    [["xiTa", d.tamb], ["xiNoct", d.noct], ["xiIrr", d.g]].forEach(function (x) { var e = $("#" + x[0]); if (e && x[1] != null) e.placeholder = "ör. " + f(x[1]); });
    function calc() {
      var p = num("xiP"), g = num("xiG"), t = num("xiT");
      if (!ok(p) || !isFinite(g) || !isFinite(t)) { outs(["xiOut", "xiLoss"]); summary("sicaklik-gucu", ""); return; }
      var r = U.tempPower(p, g, t, K.stc), ch = (r / p - 1) * 100;
      out("xiOut", f(Math.max(r, 0), 1) + " W"); out("xiLoss", (ch > 0 ? "+" : "") + "%" + f(ch, 2).replace("-", "−"));
      summary("sicaklik-gucu", f(p) + " W panel, γ " + f(g, 2) + " %/°C, hücre " + f(t, 1) + " °C: yaklaşık " + f(r, 1) + " W");
    }
    function calcT() {
      var ta = num("xiTa"), n = num("xiNoct"), irr = num("xiIrr"), use = $("#xiUse");
      if (!isFinite(ta) || !ok(n, irr)) { out("xiTc", "—"); if (use) use.hidden = true; return; }
      var tc = U.cellTemp(ta, n, irr, K.noct);
      out("xiTc", f(tc, 1) + " °C"); if (use) { use.hidden = false; use.setAttribute("data-v", r4(tc)); }
    }
    var use = $("#xiUse");
    if (use) use.addEventListener("click", function () { setVal("xiT", use.getAttribute("data-v")); calc(); });
    onInput(["xiP", "xiG", "xiT"], calc); onInput(["xiTa", "xiNoct", "xiIrr"], calcT); calc(); calcT();
  })();

  // ----- J) Engel gölge uzunluğu -----
  function drawShadow(h, len, elev) {
    var W = 340, H = 184, gy = 136, xo = 262, svg = svgOf("xjSvg", W, H, "Engelin öğle vakti gölge uzunluğu"); if (!svg) return;
    var sc = Math.min(78 / h, 226 / len), hp = Math.max(h * sc, 10), lp = Math.max(len * sc, 4), a = elev * Math.PI / 180;
    svg.appendChild(el("line", { x1: 8, y1: gy, x2: W - 8, y2: gy, "class": "u-ground" }));
    svg.appendChild(el("line", { x1: xo - lp, y1: gy, x2: xo, y2: gy, "class": "u-shadow" }));
    svg.appendChild(el("rect", { x: xo, y: gy - hp, width: 14, height: hp, "class": "u-obst" }));
    svg.appendChild(el("line", { x1: xo - lp, y1: gy, x2: xo + 46 * Math.cos(a), y2: gy - hp - 46 * Math.sin(a), "class": "u-ray" }));
    svg.appendChild(el("circle", { cx: xo + 46 * Math.cos(a), cy: gy - hp - 46 * Math.sin(a), r: 9, "class": "u-sunc" }));
    svg.appendChild(el("text", { x: xo + 20, y: gy - hp / 2 + 4, "class": "u-t u-b" }, f(h, 2) + " m"));
    svg.appendChild(el("text", { x: Math.max(xo - lp / 2, 60), y: gy + 18, "text-anchor": "middle", "class": "u-t u-b" }, "gölge " + f(len, 2) + " m"));
    svg.appendChild(el("text", { x: 10, y: gy + 40, "class": "u-t u-mut" }, "← Kuzey"));
    svg.appendChild(el("text", { x: W - 10, y: gy + 40, "text-anchor": "end", "class": "u-t u-mut" }, "Güney →"));
    svg.appendChild(el("text", { x: 10, y: 16, "class": "u-t u-mut" }, "Öğle güneşi " + f(elev, 1) + "°"));
  }
  (function () {
    if (!$("#xjH")) return; var d = D.shadow || {};
    setVal("xjH", d.h); setVal("xjLat", K.defLat); setVal("xjSeason", d.season);
    function calc() {
      var h = num("xjH"), lat = num("xjLat"), se = $("#xjSeason").value;
      if (!ok(h) || !isFinite(lat) || !(lat > K.dec && lat < 90 - K.dec)) {
        outs(["xjLen", "xjElev"]); clear($("#xjSvg")); summary("golge", "");
        note("xjMsg", isFinite(lat) && ok(h) ? "Bu basit formül " + f(K.dec, 2) + "° ile " + f(90 - K.dec, 2) + "° arasındaki kuzey enlemleri için geçerlidir." : "", "warn"); return;
      }
      note("xjMsg", "");
      var elev = U.sun(lat, K.dec)[se], len = U.shadow(h, elev);
      out("xjElev", f(elev, 2) + "°"); out("xjLen", f(len, 2) + " m"); drawShadow(h, len, elev);
      summary("golge", f(h, 2) + " m engel, enlem " + f(lat, 1) + "°, " + SEASON_TX[se].toLocaleLowerCase("tr") + " öğlesi (güneş " + f(elev, 1) + "°): gölge " + f(len, 2) + " m");
    }
    onInput(["xjH", "xjLat", "xjSeason"], calc); calc();
  })();

  // ----- K) Çatı eğimi çevirici -----
  function drawSlope(deg) {
    var W = 340, H = 168, svg = svgOf("xkSvg", W, H, "Çatı eğimi: 100 cm yatayda yükselme"); if (!svg) return;
    var t = Math.tan(deg * Math.PI / 180), run = Math.min(210, 104 / t), rise = run * t, x0 = 50, y0 = 132;
    svg.appendChild(el("path", { d: "M" + x0 + " " + y0 + " L" + (x0 + run) + " " + y0 + " L" + (x0 + run) + " " + (y0 - rise) + " Z", "class": "u-tri" }));
    svg.appendChild(el("line", { x1: x0, y1: y0, x2: x0 + run, y2: y0 - rise, "class": "u-roof" }));
    svg.appendChild(el("text", { x: x0 + run / 2, y: y0 + 18, "text-anchor": "middle", "class": "u-t" }, "100 cm yatay"));
    svg.appendChild(el("text", { x: x0 + run + 8, y: y0 - rise / 2 + 4, "class": "u-t u-b" }, f(t * 100, 1) + " cm"));
    svg.appendChild(el("text", { x: x0 - 6, y: y0 - 6, "text-anchor": "end", "class": "u-t u-b" }, f(deg, 1) + "°"));
  }
  (function () {
    if (!$("#xkDeg")) return; var d = D.slope || {};
    setVal("xkDeg", d.deg);
    var run = pair("xkDeg", "xkPct", null, U.slopePct, U.slopeDeg);
    function calc() {
      var deg = num("xkDeg"), pct = num("xkPct");
      if (!(deg > 0 && deg < 90) || !ok(pct)) { outs(["xkRise", "xkRatio"]); clear($("#xkSvg")); summary("cati-egimi", ""); return; }
      out("xkRise", f(pct, 1) + " cm"); out("xkRatio", "1 : " + f(100 / pct, 2)); drawSlope(deg);
      summary("cati-egimi", "Eğim " + f(deg, 2) + "° = %" + f(pct, 2) + " (100 cm yatayda " + f(pct, 1) + " cm yükselme, 1 : " + f(100 / pct, 2) + ")");
    }
    ["xkDeg", "xkPct"].forEach(function (id) { $("#" + id).addEventListener("input", calc); });
    run("xkDeg"); calc();
  })();

  // ----- L) Cihaz listesi → günlük Wh → panel, akü, inverter -----
  (function () {
    var host = $("#xlRows"); if (!host) return; var d = D.loadlist || {};
    function inp(cls, type, val, label, extra) {
      var e = doc.createElement("input"); e.className = cls; e.type = type; e.value = val == null ? "" : val; e.setAttribute("aria-label", label);
      if (type === "number") { e.setAttribute("inputmode", "decimal"); e.step = "any"; e.min = "0"; }
      if (extra) e.placeholder = extra;
      e.addEventListener("input", function () { touch(e); calc(); });
      return e;
    }
    function addRow(r) {
      var row = doc.createElement("div"); row.className = "usta-lrow";
      row.appendChild(inp("l-name", "text", r.name, "Cihaz adı", "Cihaz adı"));
      row.appendChild(inp("l-w", "number", r.w, "Güç (W)", "W"));
      row.appendChild(inp("l-n", "number", r.n, "Adet", "adet"));
      row.appendChild(inp("l-h", "number", r.h, "Saat/gün", "saat"));
      var del = doc.createElement("button"); del.type = "button"; del.className = "l-del"; del.textContent = "×"; del.setAttribute("aria-label", "Satırı sil");
      del.addEventListener("click", function () { host.removeChild(row); calc(); });
      row.appendChild(del); host.appendChild(row);
    }
    function setRows(rows) { clear(host); rows.forEach(addRow); calc(); }
    function val(row, cls) { var v = String($("." + cls, row).value || "").replace(",", "."); return v === "" ? NaN : parseFloat(v); }
    function calc() {
      var rows = [];
      $$(".usta-lrow", host).forEach(function (row) {
        var w = val(row, "l-w"), n = val(row, "l-n"), h = val(row, "l-h");
        if (ok(w, n) && isFinite(h) && h >= 0) rows.push({ w: w, n: n, h: h });
      });
      var o = { sun: num("xlSun"), eff: num("xlEff") / 100, days: num("xlDays"), v: num("xlV"), dod: num("xlDod") / 100, eta: num("xlEta") / 100 };
      if (!rows.length) { outs(["xlWh", "xlPanel", "xlAh", "xlInv"]); summary("yuk-listesi", ""); return; }
      var r = U.loadPlan(rows, o);
      out("xlWh", f(r.wh, 0) + " Wh/gün"); out("xlInv", "≥ " + f(r.sumW, 0) + " W");
      out("xlPanel", ok(o.sun, o.eff) && o.eff <= 1 ? "≈ " + f(r.panelW, 0) + " W" : "—");
      out("xlAh", ok(o.days, o.v, o.dod, o.eta) && o.dod <= 1 && o.eta <= 1 ? "≈ " + f(r.ah, 1) + " Ah (" + f(o.v) + " V)" : "—");
      summary("yuk-listesi", rows.length + " cihaz satırı: günlük " + f(r.wh, 0) + " Wh; panel ≈ " + f(r.panelW, 0) + " W, akü ≈ " + f(r.ah, 1) + " Ah (" + f(o.v) + " V, " + f(o.days) + " gün), inverter ≥ " + f(r.sumW, 0) + " W (kalkış akımı hariç)");
    }
    setVal("xlV", d.v); setVal("xlDays", K.autonomy); setVal("xlSun", K.sunHours);
    setVal("xlEff", isFinite(K.sysEff) ? r4(K.sysEff * 100) : ""); setVal("xlDod", isFinite(K.dod) ? r4(K.dod * 100) : ""); setVal("xlEta", isFinite(K.invEff) ? r4(K.invEff * 100) : "");
    ["xlV", "xlDays", "xlSun", "xlEff", "xlDod", "xlEta"].forEach(function (id) { var e = $("#" + id); if (e) e.addEventListener("input", function () { touch(e); calc(); }); });
    var add = $("#xlAdd"); if (add) add.addEventListener("click", function () { addRow({ name: "", w: "", n: 1, h: "" }); });
    var sel = $("#xlPreset");
    if (sel) {
      K.appliances.forEach(function (a) { var o = doc.createElement("option"); o.value = a.id; o.textContent = a.name + " (" + f(a.w) + " W)"; sel.appendChild(o); });
      sel.addEventListener("change", function () {
        var a = K.appliances.filter(function (x) { return x.id === sel.value; })[0];
        if (a) { addRow({ name: a.name, w: a.w, n: 1, h: a.h }); calc(); }
        sel.value = "";
      });
    }
    var scen = $("#xlScen");
    if (scen) K.presets.forEach(function (p) {
      var b = doc.createElement("button"); b.type = "button"; b.className = "usta-link"; b.textContent = p.label;
      b.addEventListener("click", function () { setRows(U.presetRows(K, p.id)); touch(b); });
      scen.appendChild(b);
    });
    EXAMPLE["yuk-listesi"] = function () { setRows(U.presetRows(K, d.preset)); };
    RESET["yuk-listesi"] = function () { setRows([{ name: "", w: "", n: 1, h: "" }]); };
    setRows(U.presetRows(K, d.preset));
  })();

  // ----- Sigorta–kablo uyum kontrolü -----
  (function () {
    if (!$("#xsIb")) return; var d = D.coord || {}, map = { xsIb: "ib", xsIn: "in", xsIz: "iz" };
    Object.keys(map).forEach(function (id) { var e = $("#" + id); if (e && d[map[id]] != null) e.placeholder = "ör. " + f(d[map[id]]); });
    function calc() {
      var ib = num("xsIb"), inn = num("xsIn"), iz = num("xsIz"), box = $("#xsBox");
      if (!ok(ib, inn, iz)) { out("xsVerdict", "—"); if (box) box.className = "result highlight"; note("xsMsg", "Üç değeri de girin. Iz, kablo üreticisinin tablosundan döşeme şekli ve sıcaklığa göre okunur.", ""); summary("sigorta-kablo-uyumu", ""); return; }
      var r = U.coord(ib, inn, iz), why = [];
      if (!r.load) why.push("Tasarım akımı (" + f(ib) + " A) sigorta anma akımından (" + f(inn) + " A) büyük: sigorta normal yükte açar.");
      if (!r.cable) why.push("Sigorta anma akımı (" + f(inn) + " A) kablonun taşıma kapasitesinden (" + f(iz) + " A) büyük: sigorta kabloyu korumaz.");
      out("xsVerdict", r.ok ? "Ib ≤ In ≤ Iz sağlanıyor" : "Koşul sağlanmıyor");
      if (box) box.className = "result highlight " + (r.ok ? "usta-good" : "usta-bad");
      note("xsMsg", r.ok ? f(ib) + " ≤ " + f(inn) + " ≤ " + f(iz) + " A. Yalnız bu temel koşul kontrol edildi." : why.join(" "), r.ok ? "ok" : "bad");
      summary("sigorta-kablo-uyumu", "Ib " + f(ib) + " A, In " + f(inn) + " A, Iz " + f(iz) + " A: " + (r.ok ? "Ib ≤ In ≤ Iz sağlanıyor" : "koşul sağlanmıyor"));
    }
    EXAMPLE["sigorta-kablo-uyumu"] = function () { Object.keys(map).forEach(function (id) { setVal(id, d[map[id]]); }); calc(); };
    onInput(Object.keys(map), calc); calc();
  })();

  // ----- HP → kW → amper (motor) -----
  (function () {
    if (!$("#xmHp")) return; var d = D.motor || {}, kind = $("#xmKind");
    setVal("xmHp", d.hp); setVal("xmEff", r4(d.eff * 100)); setVal("xmCos", d.cos); setVal("xmV", K.acV.one);
    function calc() {
      var hp = num("xmHp"), eff = num("xmEff"), cos = num("xmCos"), v = num("xmV");
      if (!ok(hp, eff, cos, v) || eff > 100 || cos > 1) { outs(["xmShaft", "xmIn", "xmI"]); summary("hp-kw-amper", ""); return; }
      var r = U.motor(hp, K.hpPerKw, eff / 100, cos, v, kind.value);
      out("xmShaft", f(r.shaftKw, 3) + " kW"); out("xmIn", f(r.inKw, 3) + " kW"); out("xmI", f(r.i, 2) + " A");
      summary("hp-kw-amper", f(hp) + " HP motor (" + (kind.value === "3" ? "üç faz " : "tek faz ") + f(v) + " V, verim %" + f(eff) + ", cosφ " + f(cos) + "): mil gücü " + f(r.shaftKw, 3) + " kW, çalışma akımı " + f(r.i, 2) + " A (kalkış akımı hariç)");
    }
    kind.addEventListener("change", function () { setVal("xmV", kind.value === "3" ? K.acV.three : K.acV.one); touch(kind); calc(); });
    onInput(["xmHp", "xmEff", "xmCos", "xmV"], calc); calc();
  })();

  // ----- Cihaz tüketimi ve maliyeti -----
  (function () {
    if (!$("#xuW")) return; var d = D.usage || {};
    setVal("xuW", d.w); setVal("xuH", d.h); setVal("xuDays", d.days); setVal("xuPrice", K.unitPrice);
    function calc() {
      var w = num("xuW"), h = num("xuH"), days = num("xuDays"), price = num("xuPrice");
      if (!ok(w, h, days)) { outs(["xuKwh", "xuCost"]); summary("cihaz-tuketimi", ""); return; }
      var r = U.usage(w, h, days, ok(price) ? price : NaN);
      out("xuKwh", f(r.kwh, 2) + " kWh"); out("xuCost", ok(price) ? f(r.cost, 2) + " TL" : "birim fiyat yazın");
      summary("cihaz-tuketimi", f(w) + " W cihaz, günde " + f(h, 2) + " saat, " + f(days, 0) + " gün: " + f(r.kwh, 2) + " kWh" + (ok(price) ? ", " + f(price, 2) + " TL/kWh ile " + f(r.cost, 2) + " TL" : ""));
    }
    onInput(["xuW", "xuH", "xuDays", "xuPrice"], calc); calc();
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
    RESET.kontrol = function () { boxes.forEach(function (b) { b.checked = false; }); state = {}; save(); draw(); };
    draw();
  })();

  // Sayfaya özel açılış: <main data-usta-init="xbKind=3;xaPhase=3"> (iniş sayfası aynı kartı farklı seçimle açar)
  String(page.getAttribute("data-usta-init") || "").split(";").forEach(function (kv) {
    var x = kv.split("="), e = x[0] && $("#" + x[0]); if (!e || x.length < 2) return;
    e.value = x[1];
    ["change", "input"].forEach(function (t) { var ev = doc.createEvent("Event"); ev.initEvent(t, true, false); e.dispatchEvent(ev); });
  });
  // ===== İnverter hata kodları ve ayar rehberi (veri ilk açılışta indirilir) =====
  (function () {
    var secA = $("#inverter-kodlari"), secB = $("#inverter-ayarlari"); if (!secA && !secB) return;
    var DATA = null, waiting = [], state = 0, LSF = "gespa-inv-family", TY = U.INV_TYPE;
    function h(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function load(cb) {
      if (DATA) { cb(); return; }
      waiting.push(cb); if (state) return; state = 1;
      $$("[data-inv-state]", page).forEach(function (e) { e.textContent = "Veri yükleniyor…"; });
      var done = function (d) { DATA = d; waiting.forEach(function (fn) { fn(); }); waiting = []; };
      var fail = function () { state = 0; waiting = []; $$("[data-inv-state]", page).forEach(function (e) { e.textContent = "Veri yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin; tablolar araç sayfalarında da yer alır."; }); };
      try { root.fetch("assets/inverter-veri.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(done, fail); } catch (e) { fail(); }
    }
    function srcLine(src, pageRef) {             // kaynak: kılavuz adı + sayfa (+ üretici belgesine bağlantı)
      var p = h("p", "usta-inv-src"); p.appendChild(doc.createTextNode("Kaynak: "));
      if (src.url) { var a = h("a", null, src.t); a.href = src.url; a.target = "_blank"; a.rel = "nofollow noopener"; p.appendChild(a); }
      else p.appendChild(doc.createTextNode(src.t + (src.rev ? " (" + src.rev + ")" : "") + " — " + DATA.owner));
      if (pageRef) p.appendChild(doc.createTextNode(" · " + pageRef));
      return p;
    }
    // ----- A) kod arama -----
    if (secA) (function () {
      var famSel = $("#xvFam"), filt = $("#xvFilter"), code = $("#xvCode"), out = $("#xvOut"), typeBox = $("#xvType"), all = $("#xvAll"), type = "";
      function fam() { return U.invFamily(DATA, famSel.value); }
      function fillFams() {
        var q = String(filt.value || "").toLocaleLowerCase("tr").trim(), keepId = famSel.value, groups = {}, order = [];
        clear(famSel);
        DATA.families.forEach(function (f) {
          if (q && (f.brand + " " + f.name).toLocaleLowerCase("tr").indexOf(q) < 0) return;
          if (!groups[f.brand]) { groups[f.brand] = doc.createElement("optgroup"); groups[f.brand].label = f.brand; order.push(f.brand); }
          var o = doc.createElement("option"); o.value = f.id; o.textContent = f.name; groups[f.brand].appendChild(o);
        });
        order.forEach(function (b) { famSel.appendChild(groups[b]); });
        if (keepId && U.invFamily(DATA, keepId) && $$("option", famSel).some(function (o) { return o.value === keepId; })) famSel.value = keepId;
      }
      function hit(f, r) {
        var box = h("div", "usta-inv-hit" + (r.t === "fault" ? " f" : ""));
        var top = h("p", "usta-inv-top"); top.appendChild(h("strong", "usta-inv-code", r.c)); top.appendChild(h("span", "usta-inv-badge t-" + r.t, TY[r.t] || r.t));
        if (r.u) top.appendChild(h("span", "usta-inv-badge unc", "kılavuzda belirsiz"));
        if (r.k) top.appendChild(h("span", "usta-inv-badge", r.k));
        box.appendChild(top);
        box.appendChild(h("p", "usta-inv-mean", r.u ? "“" + r.m + "”" : r.m));
        if (r.o) box.appendChild(h("p", "usta-inv-orig", "Üreticinin ifadesi: “" + r.o + "”"));
        if (r.d) box.appendChild(h("p", "usta-inv-line", "Ekranda: " + r.d));
        if (r.b) box.appendChild(h("p", "usta-inv-line", "Sesli uyarı: " + r.b));
        if (r.r) { box.appendChild(h("p", "usta-inv-lab", "Kılavuzdaki çözüm")); box.appendChild(h("p", "usta-inv-line", r.r)); }
        if (r.ro) box.appendChild(h("p", "usta-inv-orig", "Üreticinin ifadesi: “" + r.ro + "”"));
        if (r.n) box.appendChild(h("p", "usta-inv-note", "[Aktaranın notu: " + r.n + "]"));
        box.appendChild(srcLine(f.src, r.p));
        return box;
      }
      function types() {
        var f = fam(), ts = []; clear(typeBox);
        if (f) f.codes.forEach(function (r) { if (ts.indexOf(r.t) < 0) ts.push(r.t); });
        if (ts.indexOf(type) < 0) type = "";
        typeBox.parentNode.style.display = ts.length > 1 ? "" : "none";
        [""].concat(ts).forEach(function (t) {
          var b = h("button", t === type ? "active" : "", t ? TY[t] : "Tümü"); b.type = "button"; b.setAttribute("aria-pressed", t === type ? "true" : "false");
          b.addEventListener("click", function () { type = t; types(); find(); });
          typeBox.appendChild(b);
        });
        if (f) code.setAttribute("inputmode", f.codes.every(function (r) { return /^\d+$/.test(U.invKey(r.c)); }) ? "numeric" : "text");
      }
      function find() {
        var f = fam(), q = String(code.value || "").trim(); clear(out);
        if (!f) { out.appendChild(h("p", "usta-msg", "Önce cihaz ailesini seçin.")); summary("inverter-kodlari", ""); return; }
        if (!q) { out.appendChild(h("p", "usta-msg", f.brand + " · " + f.name + ": " + f.codes.length + " kod. Ekrandaki kodu yazın.")); out.appendChild(srcLine(f.src, "")); summary("inverter-kodlari", ""); return; }
        var rows = U.invFind(f, q, type);
        if (!rows.length) {
          var other = type ? U.invFind(f, q, "") : [];
          out.appendChild(h("p", "usta-msg bad", "Bu ailede böyle bir kod yok: “" + q + "”" + (type ? " (" + TY[type] + " listesinde)" : "") + ". Tahmin yürütülmez; cihazınızın kendi kılavuzuna bakın."));
          if (other.length) out.appendChild(h("p", "usta-msg warn", "Aynı kod bu ailede şu listede var: " + other.map(function (r) { return TY[r.t]; }).join(", ") + ". Türü “Tümü” yapın."));
          summary("inverter-kodlari", ""); return;
        }
        if (rows.length > 1) out.appendChild(h("p", "usta-msg warn", "Bu kod bu ailede " + rows.length + " ayrı satırda geçiyor. Ekrandaki türe (arıza / uyarı / alarm) göre doğru satırı seçin."));
        rows.forEach(function (r) { out.appendChild(hit(f, r)); });
        summary("inverter-kodlari", f.brand + " " + f.name + ", " + rows.map(function (r) { return TY[r.t] + " " + r.c + ": " + r.m; }).join(" | ") + " (kaynak: " + f.src.t + ")");
      }
      function table() {
        var f = fam(), host = $("#xvTable"); if (!host) return; clear(host); if (!f || !all.open) return;
        var t = h("table", "art-table"), hd = h("tr"); ["Kod", "Tür", "Anlam (kılavuzdaki)", "Sayfa"].forEach(function (x) { hd.appendChild(h("th", null, x)); });
        var th = h("thead"); th.appendChild(hd); t.appendChild(th); var tb = h("tbody");
        f.codes.forEach(function (r) { var tr = h("tr"); [r.c, TY[r.t] || r.t, (r.u ? "“" + r.m + "” (kılavuzda belirsiz)" : r.m) + (r.o ? " — “" + r.o + "”" : ""), r.p].forEach(function (x) { tr.appendChild(h("td", null, x)); }); tb.appendChild(tr); });
        t.appendChild(tb); host.appendChild(t);
      }
      function famChanged() { try { root.localStorage.setItem(LSF, famSel.value); } catch (e) {} types(); find(); table(); }
      function init() {
        $$("[data-inv-state]", secA).forEach(function (e) { e.textContent = ""; });
        fillFams();
        var want = page.getAttribute("data-inv-fam"), saved = null; try { saved = root.localStorage.getItem(LSF); } catch (e) {}
        var pick = U.invFamily(DATA, want) ? want : (U.invFamily(DATA, saved) ? saved : "");
        if (pick) famSel.value = pick;
        filt.addEventListener("input", function () { fillFams(); famChanged(); });
        famSel.addEventListener("change", function () { touch(famSel); famChanged(); });
        code.addEventListener("input", function () { touch(code); find(); });
        all.addEventListener("toggle", table);
        types(); find();
      }
      RESET["inverter-kodlari"] = function () { code.value = ""; if (DATA) find(); };
      secA.__load = function () { load(init); };
    })();
    // ----- B) ayar rehberi (yalnız üç kılavuz) -----
    if (secB) (function () {
      var man = $("#xwMan"), out = $("#xwOut"), find = $("#xwFind"), tab = page.getAttribute("data-inv-tab") || "prog";
      function cur() { return DATA.settings.filter(function (x) { return x.id === man.value; })[0] || DATA.settings[0]; }
      function draw() {
        var m = cur(); clear(out);
        $$("[data-xw-tab]", secB).forEach(function (b) { var on = b.getAttribute("data-xw-tab") === tab; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
        find.parentNode.parentNode.style.display = tab === "prog" ? "" : "none";
        out.appendChild(h("p", "usta-msg warn", "Akü şarj gerilimi gibi değerlerde akü üreticisinin değeri esastır. Aşağıdakiler yalnız bu kılavuzda yazanlardır; başka marka ya da modele uygulanmaz."));
        if (tab === "prog") {
          var q = String(find.value || "").toLocaleLowerCase("tr").trim(), n = 0;
          m.programs.forEach(function (r) {
            var txt = (r.no + " " + r.name + " " + (r.opt || []).map(function (o) { return o.join(" "); }).join(" ") + " " + (r.note || "")).toLocaleLowerCase("tr");
            if (q && txt.indexOf(q) < 0) return; n++;
            var box = h("div", "usta-inv-hit"), top = h("p", "usta-inv-top"); top.appendChild(h("strong", "usta-inv-code", r.no)); if (r.menu) top.appendChild(h("span", "usta-inv-badge", r.menu)); box.appendChild(top);
            box.appendChild(h("p", "usta-inv-mean sm", r.name));
            if (r.opt) { var ul = h("ul", "usta-inv-opt"); r.opt.forEach(function (o) { var li = h("li"); li.appendChild(h("strong", null, o[0])); li.appendChild(doc.createTextNode(" — " + o[1])); ul.appendChild(li); }); box.appendChild(ul); }
            if (r.def) box.appendChild(h("p", "usta-inv-line", "Varsayılan: " + r.def));
            if (r.rng) box.appendChild(h("p", "usta-inv-line", "Aralık: " + r.rng));
            if (r.note) box.appendChild(h("p", "usta-inv-line", r.note));
            box.appendChild(srcLine(m.src, r.p)); out.appendChild(box);
          });
          if (!n) out.appendChild(h("p", "usta-msg bad", "Bu kılavuzun program tablosunda eşleşen satır yok."));
        } else {
          m[tab === "lit" ? "lithium" : "grid"].forEach(function (it) {
            var box = h("div", "usta-inv-hit"); box.appendChild(h("p", "usta-inv-lab", it.k));
            if (it.v.length === 1) box.appendChild(h("p", "usta-inv-line", it.v[0]));
            else { var ul = h("ul", "usta-inv-opt"); it.v.forEach(function (x) { ul.appendChild(h("li", null, x)); }); box.appendChild(ul); }
            box.appendChild(srcLine(m.src, it.p || "")); out.appendChild(box);
          });
        }
        summary("inverter-ayarlari", m.name + " · " + (tab === "prog" ? "program tablosu" : tab === "lit" ? "lityum akü ayarı" : "şebeke bağlıyken") + " (kaynak: " + m.src.t + ")");
      }
      function init() {
        $$("[data-inv-state]", secB).forEach(function (e) { e.textContent = ""; });
        clear(man); DATA.settings.forEach(function (x) { var o = doc.createElement("option"); o.value = x.id; o.textContent = x.name; man.appendChild(o); });
        var want = page.getAttribute("data-inv-man"); if (want) man.value = want;
        man.addEventListener("change", function () { touch(man); draw(); });
        find.addEventListener("input", draw);
        $$("[data-xw-tab]", secB).forEach(function (b) { b.addEventListener("click", function () { tab = b.getAttribute("data-xw-tab"); touch(b); draw(); }); });
        draw();
      }
      RESET["inverter-ayarlari"] = function () { find.value = ""; if (DATA) draw(); };
      secB.__load = function () { load(init); };
    })();
    // Veri yalnız araç ekrana geldiğinde indirilir
    [secA, secB].forEach(function (sec) {
      if (!sec) return;
      if (!("IntersectionObserver" in root)) { sec.__load(); return; }
      var io = new root.IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); sec.__load(); } });
      io.observe(sec);
    });
  })();

  // ===== Cep kartı (usta-cep-karti.html): şemalar araçlarla AYNI çizicilerden; yazdır düğmesi =====
  (function () {
    if (!page.hasAttribute("data-usta-card")) return;
    var bv = (D.bank || {}).v, tg = (K.ref.bankV || []);
    drawBank("kcSeri", 3, 1, "pv", "SERİ: gerilim toplanır, akım aynı");
    drawBank("kcPar", 1, 3, "pv", "PARALEL: akım toplanır, gerilim aynı");
    tg.forEach(function (v, i) { drawBank("kcB" + i, Math.round(v / bv), 1, "bat", Math.round(v / bv) + " × " + f(bv) + " V seri = " + f(v) + " V"); });
    drawBank("kcBP", 1, 2, "bat", "2 × " + f(bv) + " V paralel = " + f(bv) + " V, Ah × 2");
    drawSun(U.sun(K.defLat, K.dec), U.tilts(K.defLat, K.delta));
    $$("[data-usta-print]", page).forEach(function (b) { b.addEventListener("click", function () { root.print(); }); });
  })();

  // ===== Usta ve toplu alım kaydı (usta-kaydi.html) → POST /api/lead (kaynak "usta") =====
  (function () {
    var form = $("#ustaForm"); if (!form) return;
    var t0 = Date.now(), opened = false, busy = false, msg = $("#ukMsg"), btn = $("#ukSend");
    function v(id) { var e = $("#" + id); return e ? String(e.value || "").trim() : ""; }
    function waText() {
      var ilgi = $$('input[name="ilgi"]:checked', form).map(function (c) { return c.parentNode.textContent.trim(); });
      return "Merhaba GESPA, usta / toplu alım kaydı bırakmak istiyorum.\nAd: " + v("ukAd") + "\nİl / ilçe: " + v("ukIl") + "\nMeslek: " + ($("#ukMeslek").selectedOptions[0] || {}).textContent
        + (v("ukFirma") ? "\nFirma: " + v("ukFirma") : "") + (ilgi.length ? "\nİlgilendiğim ürünler: " + ilgi.join(", ") : "") + (v("ukNot") ? "\nNot: " + v("ukNot") : "");
    }
    function bad(id, on) { var e = $("#" + id); if (e) { e.classList.toggle("is-bad", on); e.setAttribute("aria-invalid", on ? "true" : "false"); } return on; }
    function check() {
      var errs = [];
      if (bad("ukAd", v("ukAd").length < 2)) errs.push("Adınızı ve soyadınızı yazın.");
      if (bad("ukTel", v("ukTel").replace(/\D/g, "").length < 10)) errs.push("Telefon numarasını alan koduyla yazın (en az 10 rakam).");
      if (bad("ukIl", v("ukIl").length < 2)) errs.push("İl ve ilçenizi yazın.");
      if (!$("#ukOnay").checked) errs.push("Devam etmek için KVKK onay kutusunu işaretleyin.");
      return errs;
    }
    function show(text, cls) { msg.textContent = text; msg.className = "usta-msg " + cls; }
    form.addEventListener("focusin", function () { if (opened) return; opened = true; try { if (G.track) G.track("act", "usta_open"); } catch (e) {} });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); if (busy) return;
      var errs = check(); if (errs.length) { show(errs.join(" "), "bad"); return; }
      busy = true; btn.disabled = true; show("Gönderiliyor…", "");
      var body = { kaynak: "usta", ad: v("ukAd"), tel: v("ukTel"), ilce: v("ukIl"), meslek: v("ukMeslek"), firma: v("ukFirma"), not: v("ukNot"), website: v("ukWeb"), lang: "tr", path: root.location.pathname,
        ilgi: $$('input[name="ilgi"]:checked', form).map(function (c) { return c.value; }) };
      function fail(text) {              // kayıt alınamadı: aynı bilgilerle WhatsApp'a düş
        busy = false; btn.disabled = false; show(text || "Kayıt şu anda alınamadı. Aynı bilgileri WhatsApp'tan gönderebilirsiniz.", "bad");
        var a = $("#ukWaFallback"); if (a && WA) { a.href = waHref(waText()); a.classList.add("on"); }
      }
      function send() {
        body.ms = Date.now() - t0;
        try {
          root.fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (j) {
              if (r.ok && j.ok) { page.classList.add("uk-sent"); var d = $("#ukDone"); if (d) { d.setAttribute("tabindex", "-1"); d.focus(); } }
              else fail(j && j.error ? j.error + " Aynı bilgileri WhatsApp'tan da gönderebilirsiniz." : "");
            });
          }, function () { fail(""); });
        } catch (e) { fail(""); }
      }
      var wait = 3200 - (Date.now() - t0);                // sunucu 3 saniyeden hızlı gönderimi robot sayar
      if (wait > 0) root.setTimeout(send, wait); else send();
    });
    var wa = $("#ukWa"); if (wa && WA) { wa.removeAttribute("data-c-wa"); wa.href = waHref("Merhaba GESPA, usta / toplu alım kaydı bıraktım; fiyat listesi ve stok bilgisi için yazıyorum."); }
  })();

  // ===== Uygulama kabuğu =====
  var secs = $$(".usta-tool", page), byId = {};
  secs.forEach(function (x) { byId[x.id] = x; });
  function fire(e, type) { var ev = doc.createEvent("Event"); ev.initEvent(type, true, false); e.dispatchEvent(ev); }
  function fields(sec) { return $$("input, select", sec).filter(function (e) { return e.id && !(e.closest && e.closest("#xlRows")); }); }

  // ----- Alan doğrulama: aralık dışı değer → kırmızı alan + tek satır neden -----
  function validate(sec) {
    var first = "";
    $$('input[type="number"]', sec).forEach(function (e) {
      var raw = String(e.value || "").replace(",", ".").trim(), v = parseFloat(raw), wrap = e.closest(".usta-inp") || e, bad = false, why = "";
      var mn = e.getAttribute("min"), mx = e.getAttribute("max");
      if (raw !== "" || (e.validity && e.validity.badInput)) {
        if (!isFinite(v)) { bad = true; why = "sayı yazın"; }
        else if (mn !== null && v < parseFloat(mn)) { bad = true; why = "en az " + f(parseFloat(mn)) + " olmalı"; }
        else if (mx !== null && v > parseFloat(mx)) { bad = true; why = "en çok " + f(parseFloat(mx)) + " olabilir"; }
      }
      wrap.classList.toggle("is-bad", bad); e.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad && !first) { var l = e.id && $('label[for="' + e.id + '"]', sec); first = (l ? l.firstChild.textContent.trim() : "Değer") + ": " + why + "."; }
    });
    var box = $("[data-usta-err]", sec); if (box) box.textContent = first;
  }
  page.addEventListener("input", function (ev) { var sec = ev.target.closest && ev.target.closest(".usta-tool"); if (sec) validate(sec); });

  // ----- Eylem satırı: örnek değerler · sıfırla · yazdır · bağlantıyı kopyala · −/+ -----
  var SNAP = {};
  function snapshot() { secs.forEach(function (sec) { SNAP[sec.id] = fields(sec).map(function (e) { return [e, e.type === "checkbox" ? e.checked : e.value]; }); }); }
  function restore(sec, empty) {
    var key = sec.getAttribute("data-usta-tool"), own = (empty ? RESET : EXAMPLE)[sec.id] || (empty ? RESET : EXAMPLE)[key];
    if (own) { own(); validate(sec); return; }
    var list = SNAP[sec.id] || [];
    list.forEach(function (x) { if (x[0].tagName === "SELECT" && !empty) { x[0].value = x[1]; fire(x[0], "change"); } });
    for (var pass = 0; pass < 2; pass++) {   // iki tur: çift yönlü alanlarda ilk tur "son yazılan"ı asıl alana çevirir, ikincisi değerleri kesinleştirir
      list.forEach(function (x) { if (x[0].tagName !== "SELECT") x[0].value = empty ? "" : x[1]; });
      list.forEach(function (x) { if (x[0].tagName !== "SELECT" && !x[0].hasAttribute("data-derived")) fire(x[0], "input"); });
    }
    validate(sec);
  }
  function copyText(text, done) {
    function fallback() {
      var t = doc.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0"; doc.body.appendChild(t); t.select();
      var okc = false; try { okc = doc.execCommand("copy"); } catch (e) {} doc.body.removeChild(t); done(okc);
    }
    try { if (root.navigator.clipboard && root.navigator.clipboard.writeText) { root.navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); return; } } catch (e) {}
    fallback();
  }
  page.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-usta-ex],[data-usta-reset],[data-usta-print],[data-usta-copy],[data-step]"); if (!b) return;
    var sec = b.closest(".usta-tool"); if (!sec) return;
    if (b.hasAttribute("data-step")) {
      var inp = $("input", b.parentNode), cur = parseFloat(String(inp.value).replace(",", ".")), mn = parseFloat(inp.getAttribute("min"));
      var nx = (isFinite(cur) ? Math.round(cur) : (isFinite(mn) ? mn - 1 : 0)) + parseInt(b.getAttribute("data-step"), 10);
      if (isFinite(mn) && nx < mn) nx = mn;
      inp.value = nx; fire(inp, "input"); return;
    }
    if (b.hasAttribute("data-usta-ex")) restore(sec, false);
    else if (b.hasAttribute("data-usta-reset")) restore(sec, true);
    else if (b.hasAttribute("data-usta-print")) root.print();
    else {
      var url = root.location.href.split("#")[0] + "#" + sec.id, old = b.textContent;
      copyText(url, function (okc) { b.textContent = okc ? "✓ Kopyalandı" : url; root.setTimeout(function () { b.textContent = old; }, okc ? 1600 : 6000); });
    }
    touch(b);
  });

  snapshot();
  secs.forEach(validate);

  // ----- Merkez sayfa: solda liste, sağda TEK araç (adres çapası + geri/ileri + son araç hatırlanır) -----
  if (page.hasAttribute("data-usta-app") && secs.length) (function () {
    var LS = "gespa-usta-last", side = $("#ustaSide"), links = $$("a[data-t]", side), menu = $("#ustaMenu"), order = secs.map(function (x) { return x.id; });
    var groups = $$(".usta-sg", side), box = $("#ustaFind"), state = $("#ustaFindState"), work = $(".usta-work", page), cur = null, back = null, mo = null, io = null;
    var live = $("#ustaLive");
    function idOf(hash) {
      var h = String(hash || "").replace(/^#/, ""); try { h = decodeURIComponent(h); } catch (e) {}
      if (byId[h]) return h;
      var c = h && doc.getElementById(h); if (c && c.classList.contains("usta-cat")) { var t = $(".usta-tool", c); return t ? t.id : null; }
      return null;
    }
    function hdr() { return parseFloat(root.getComputedStyle(doc.documentElement).getPropertyValue("--hdr-h")) || 0; }
    function mainRes(sec) { return $(".result.highlight .r-value", sec) || $(".r-value", sec); }
    function syncLive() {
      var r = mainRes(byId[cur]); if (!live) return;
      if (!r) { live.classList.remove("on"); return; }
      var l = $(".r-label", r.parentNode); out("ustaLiveL", l ? l.textContent : "Sonuç"); out("ustaLiveV", r.textContent);
    }
    function watch() {                       // ana sonuç ekranda değilken ince şeritte göster
      if (mo) mo.disconnect(); if (io) io.disconnect();
      var r = mainRes(byId[cur]); syncLive(); if (!r || !live) return;
      if ("MutationObserver" in root) { mo = new root.MutationObserver(syncLive); mo.observe(byId[cur], { subtree: true, childList: true, characterData: true }); }
      if ("IntersectionObserver" in root) { io = new root.IntersectionObserver(function (es) { live.classList.toggle("on", !es[es.length - 1].isIntersecting); }); io.observe(r.parentNode); }
    }
    function drawer(open, focusBack) {
      page.classList.toggle("side-open", open); doc.documentElement.classList.toggle("usta-lock", open);
      if (menu) menu.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        if (!back) { back = doc.createElement("div"); back.className = "usta-back"; back.addEventListener("click", function () { drawer(false, true); }); page.appendChild(back); }
        root.setTimeout(function () { if (box) box.focus(); }, 60);
      } else if (focusBack && menu) menu.focus();
    }
    function show(id, how) {
      if (!byId[id]) return;
      cur = id;
      secs.forEach(function (x) { x.classList.toggle("is-active", x.id === id); });
      links.forEach(function (a) { var on = a.getAttribute("data-t") === id; a.classList.toggle("active", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
      var h = $("h3", byId[id]); out("ustaBarT", h ? h.textContent : "");
      try { root.localStorage.setItem(LS, id); } catch (e) {}
      try {
        if (how === "push" && root.location.hash !== "#" + id) root.history.pushState(null, "", "#" + id);
        else if (how === "replace") root.history.replaceState(null, "", root.location.pathname + root.location.search + "#" + id);
      } catch (e) {}
      activeTool = byId[id].getAttribute("data-usta-tool"); updateWa(); watch();
      if (page.classList.contains("side-open")) drawer(false, false);
      if (how !== "init" && work) { var top = work.getBoundingClientRect().top, lim = hdr() + 4; if (top < lim) root.scrollTo(0, root.pageYOffset + top - lim); }
    }
    showTool = function (id) { show(id, "push"); };
    doc.addEventListener("click", function (ev) {       // sayfa içi araç bağlantıları: kaydırma yok, araç değişir
      var a = ev.target.closest && ev.target.closest('a[href^="#"]'); if (!a) return;
      var id = idOf(a.getAttribute("href")); if (!id) return;
      ev.preventDefault(); show(id, "push");
    });
    function fromUrl() { var id = idOf(root.location.hash); if (id) show(id, "none"); else if (!root.location.hash) show(start, "none"); }
    root.addEventListener("popstate", fromUrl); root.addEventListener("hashchange", fromUrl);
    if (menu) menu.addEventListener("click", function () { drawer(!page.classList.contains("side-open"), false); });
    var x = $("#ustaSideX"); if (x) x.addEventListener("click", function () { drawer(false, true); });
    doc.addEventListener("keydown", function (ev) {
      if (!page.classList.contains("side-open")) return;
      if (ev.key === "Escape" || ev.key === "Esc") { drawer(false, true); return; }
      if (ev.key !== "Tab") return;                      // odak çekmecenin içinde döner
      var fo = $$("a[href], button, input", side).filter(function (e) { return e.offsetParent !== null; }); if (!fo.length) return;
      var first = fo[0], last = fo[fo.length - 1];
      if (ev.shiftKey && doc.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && doc.activeElement === last) { ev.preventDefault(); first.focus(); }
      else if (!side.contains(doc.activeElement)) { ev.preventDefault(); first.focus(); }
    });
    function step(d) { var i = order.indexOf(cur); show(order[(i + d + order.length) % order.length], "push"); }
    var pv = $("#ustaPrev"), nx = $("#ustaNext");
    if (pv) pv.addEventListener("click", function () { step(-1); }); if (nx) nx.addEventListener("click", function () { step(1); });
    // Arama: ad + anahtar sözcük (Türkçe harf duyarsız); Enter ilk eşleşeni açar
    var MAP = { "ı": "i", "İ": "i", "ş": "s", "ç": "c", "ğ": "g", "ö": "o", "ü": "u", "â": "a", "î": "i", "û": "u" };
    function norm(t) { return String(t || "").toLocaleLowerCase("tr").replace(/[ıİşçğöüâîû]/g, function (ch) { return MAP[ch] || ch; }).replace(/[^a-z0-9²% ]+/g, " ").replace(/\s+/g, " ").trim(); }
    var index = links.map(function (a) { var sec = byId[a.getAttribute("data-t")], h = $("h3", sec); return norm(a.textContent + " " + (h ? h.textContent : "") + " " + sec.getAttribute("data-kw")); });
    function filter() {
      var words = norm(box.value).split(" ").filter(Boolean), shown = 0;
      links.forEach(function (a, i) { var hit = words.every(function (w) { return index[i].indexOf(w) >= 0; }); a.parentNode.style.display = hit ? "" : "none"; if (hit) shown++; });
      groups.forEach(function (g) { g.style.display = $$("li", g).some(function (li) { return li.style.display !== "none"; }) ? "" : "none"; });
      if (state) state.textContent = !words.length ? links.length + " araç" : (shown ? shown + " araç bulundu" : "Eşleşen araç yok. Başka bir sözcük deneyin.");
    }
    if (box) {
      box.addEventListener("input", filter);
      box.addEventListener("keydown", function (ev) {
        if (ev.key !== "Enter") return; ev.preventDefault();
        var hit = links.filter(function (a) { return a.parentNode.style.display !== "none"; })[0]; if (hit) show(hit.getAttribute("data-t"), "push");
      });
      filter();
    }
    var saved = null; try { saved = root.localStorage.getItem(LS); } catch (e) {}
    var start = byId[page.getAttribute("data-usta-app")] ? page.getAttribute("data-usta-app") : order[0];
    page.classList.add("usta-app-on");
    show(idOf(root.location.hash) || (byId[saved] ? saved : start), "init");
  })();

  updateWa();
})(typeof window !== "undefined" ? window : this);
