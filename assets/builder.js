/* ============================================================
   GESPA Enerji — Sistem Kurucu (sistem-kur.html)
   "İhtiyaçtan siparişe" sihirbazı, 5 adım:
     1 kullanım yeri → 2 cihazlar → 3 önerilen sistem →
     4 ürünleri düzenle (isteğe bağlı) → 5 sipariş özeti
   TÜM katsayı ve cihazlar: window.GESPA.config.builder (koda sayı gömülmez).
   FİYAT TEK KAYNAK: mağazada satılan kalem (`pkg`) config.packages'ten
   okunur ve main.js'in pkgUnit kuralıyla fiyatlanır (GESPA.shop). `pkg`'siz
   kalem teklifle fiyatlanır: `price` tahminidir, ayrı gösterilir, sepete
   girmez. Kurallar: docs/sistem-kurucu.md
   ============================================================ */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function L(tr, en, de, ru) { var l = (window.GESPA && GESPA.lang) || "tr"; return l === "en" ? en : (l === "de" ? de : (l === "ru" ? ru : tr)); }
  // config'teki TR metinleri (cihaz/senaryo/ürün adları) i18n sözlüğünden çevir
  function T(txt) {
    var l = (window.GESPA && GESPA.lang) || "tr";
    if (l === "tr" || !txt) return txt;
    var d = (window.GESPA && GESPA.i18nData && GESPA.i18nData.DICT && GESPA.i18nData.DICT[l]) || {};
    return d[txt] || txt;
  }

  var root = $("#builder");
  if (!root) return;

  var CFG = (window.GESPA && window.GESPA.config) || {};
  var B = CFG.builder;
  if (!B || !B.appliances || !B.catalog) { root.innerHTML = "<p>Yapılandırma yüklenemedi.</p>"; return; }
  var SZ = B.sizing || {};
  var WA = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
  // main.js'in mağaza yardımcıları (pkgUnit, oran, sepet) — kurucu fiyatı kendisi hesaplamaz
  var SHOP = (window.GESPA && window.GESPA.shop) || null;
  var TYPES = ["panel", "battery", "inverter"];

  var nf = function (n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); };
  var nf1 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n); };
  var nf2 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n); };
  var money = function (n) { return "₺" + nf(n); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  // Adet kutusuna yazılan metni sayıya çevir (hem "2,2" hem "2.2" kabul edilir)
  var parseQ = function (v) { return parseFloat(String(v).replace(/\s/g, "").replace(",", ".")); };
  var uAdet = function () { return L("adet", "pcs", "Stk.", "шт."); };

  /* ============================================================
     MAĞAZA BAĞLANTISI — tek fiyat kaynağı
     ============================================================ */
  function pkgOf(id) {
    if (SHOP) return SHOP.pkg(id);
    var f = null; (CFG.packages || []).forEach(function (x) { if (x.id === id) f = x; }); return f;
  }
  // main.js yüklenemediyse (olmamalı) yalnız ₺ liste fiyatı kullanılır; kur çevrilmez
  function unitOf(p) {
    if (SHOP) return SHOP.unit(p);
    return p.price == null || p.currency === "USD" ? { list: null, cart: null, poa: true } : { list: p.price, cart: p.price };
  }
  function pctOf(p) { return p.noCartDiscount ? 0 : (SHOP ? SHOP.pct(p) : 0); }

  // config kalemi → arayüz nesnesi. Mağaza ürünü: ad/fiyat/stok config.packages'ten;
  // ürün kaldırılmış, fiyatsız ya da tükenmişse kalem kurucudan da düşer.
  function resolve(c) {
    if (!c) return null;
    var o = { id: c.id, w: c.w, kwh: c.kwh, dod: c.dod, v: c.v, kw: c.kw, rule: c.qty, meters: c.meters, unitName: c.unit, on: c.on };
    if (c.pkg) {
      var p = pkgOf(c.pkg);
      if (!p || p.stock === 0) return null;
      var u = unitOf(p);
      if (u.poa || u.list == null) return null;
      o.pkg = p.id; o.shop = true; o.est = false; o.name = T(p.name);
      o.price = u.list; o.cart = u.cart; o.pct = pctOf(p);
      o.url = p.url || "online-satis.html";
      return o;
    }
    o.shop = false;
    o.est = !c.firm; // firm: işletmenin liste fiyatı, tahmini değil (inverter)
    o.name = (c.brand ? c.brand + " " : "") + T(c.name);
    o.price = +c.price || 0; o.cart = o.price; o.pct = 0;
    return o;
  }
  function list(type) { return (B.catalog[type] || []).map(resolve).filter(Boolean); }
  function pick(type, id) {
    var arr = list(type);
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  var appById = {};
  B.appliances.forEach(function (a) { appById[a.id] = a; });
  function presetById(id) { return (B.presets || []).filter(function (p) { return p.id === id; })[0] || null; }

  /* ---- Durum (localStorage'da saklanır; yenilemede kaybolmaz) ----
     pinned[tür] = müşteri modeli KENDİSİ seçti; seçmediyse model her
     değişiklikte ihtiyaca göre yeniden önerilir (3. ve 5. adım çelişmesin). */
  var LSKEY = "gespa-builder", VER = 2;
  function fresh() {
    return { v: VER, step: 1, preset: "", items: {}, hours: {}, sel: {}, pinned: {}, extras: {}, qty: {}, exQty: {}, open: { panel: true }, autonomy: SZ.autonomyDays || 1 };
  }
  var state = fresh();
  try {
    var saved = JSON.parse(localStorage.getItem(LSKEY) || "null");
    if (saved && saved.items) {
      state = Object.assign(state, saved);
      // Eski sürümün model kimlikleri ve elle adetleri geçersiz (katalog mağazaya bağlandı)
      if (saved.v !== VER) { state.v = VER; state.sel = {}; state.pinned = {}; state.qty = {}; state.exQty = {}; }
      if (!state.pinned) state.pinned = {};
    }
  } catch (e) {}
  function save() { try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {} }

  /* ============================================================
     HESAP MOTORU
     dailyWh   = Σ (güç × adet × saat)
     tepeGüç   = Σ (güç × adet) × eşzamanlılık  (+ en büyük kalkış payı)
     gerekliKwp= dailyWh / (tasarımGüneşSaati × sistemVerimi × 1000)
     aküKwh    = dailyWh × özerklikGünü / (DoD × inverterVerimi × 1000)
     inverterKw= tepeGüç × sürgePayı / 1000
     ============================================================ */
  function hoursOf(id) { var a = appById[id]; return state.hours[id] != null ? state.hours[id] : (a ? a.h : 0); }
  function calcFor(items, hours, autonomy) {
    var dailyWh = 0, runW = 0, maxSurgeExtra = 0, count = 0;
    Object.keys(items || {}).forEach(function (id) {
      var a = appById[id], q = items[id];
      if (!a || !q) return;
      var h = hours && hours[id] != null ? hours[id] : a.h;
      dailyWh += a.w * q * h;
      runW += a.w * q;
      var extra = a.w * ((a.surge || 1) - 1);
      if (extra > maxSurgeExtra) maxSurgeExtra = extra;
      count += q;
    });
    var aut = autonomy || 1;
    var peakW = runW * (SZ.simultaneity || 0.7) + maxSurgeExtra;
    return {
      dailyWh: dailyWh, runW: runW, peakW: peakW, count: count,
      kwp: dailyWh / ((SZ.sunHours || 4.5) * (SZ.systemEff || 0.75) * 1000),
      batKwh: (dailyWh * aut) / ((SZ.dod || 0.9) * (SZ.invEff || 0.92) * 1000),
      // Aküden çekilmesi gereken net enerji (kWh) — model DoD'una bölünerek adet bulunur
      usableKwh: (dailyWh * aut) / ((SZ.invEff || 0.92) * 1000),
      invKw: Math.max(SZ.minInverterKw || 1, (peakW * (SZ.surgeMargin || 1.3)) / 1000)
    };
  }
  function calc() { return calcFor(state.items, state.hours, state.autonomy); }
  // Tasarım gününde (kış) kurulu gücün günlük üretimi — ihtiyaçla AYNI katsayılar
  function dailyProdKwh(kwp) { return kwp * (SZ.sunHours || 4.5) * (SZ.systemEff || 0.75); }

  /* ---- Adet ve öneri ---- */
  function dodOf(it) { return it.dod || SZ.dod || 0.9; }
  function autoQtyFor(type, it, need) {
    if (!it) return 0;
    if (type === "panel") return Math.max(1, Math.ceil((need.kwp * 1000) / it.w));
    if (type === "battery") return Math.max(1, Math.ceil(need.usableKwh / (it.kwh * dodOf(it))));
    // Gereken güç tek cihazı aşarsa paralel adet
    if (type === "inverter") return Math.max(1, Math.ceil(need.invKw / it.kw - 1e-9));
    return 1;
  }
  function capOf(type, it, q) { return type === "panel" ? q * it.w : (type === "battery" ? q * it.kwh : q * it.kw); }
  function cmp(a, b) { for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; } return 0; }
  // Önerilen model: ihtiyacı EN DÜŞÜK toplam tutarla karşılayan uyumlu model;
  // eşitlikte daha çok kapasite, sonra daha az adet. Senaryonun `prefer`'i önce gelir.
  // İnverter, seçili akünün gerilimiyle (v) uyumlu olanlardan seçilir.
  function recommend(type, need, sel) {
    var arr = list(type);
    if (!arr.length) return null;
    var pr = presetById(state.preset), pref = pr && pr.prefer && pr.prefer[type];
    if (pref && arr.some(function (x) { return x.id === pref; })) return pref;
    if (type === "inverter") {
      var bat = pick("battery", (sel || state.sel).battery);
      var ok = arr.filter(function (x) { return !bat || !bat.v || !x.v || x.v === bat.v; });
      if (ok.length) arr = ok;
    }
    var best = null, bestKey = null;
    arr.forEach(function (it) {
      var q = autoQtyFor(type, it, need);
      var key = [q * it.price, -capOf(type, it, q), q];
      if (!best || cmp(key, bestKey) < 0) { best = it; bestKey = key; }
    });
    return best.id;
  }
  // Tamamen önerilen seçim (3. adım ve "Bu sistemle devam et")
  function recSel(need) {
    var s = {};
    TYPES.forEach(function (t) { s[t] = recommend(t, need, s); });
    return s;
  }
  // Müşterinin seçmediği tür her seferinde ihtiyaca göre yeniden önerilir
  function ensureDefaults(need) {
    TYPES.forEach(function (type) {
      if (state.pinned[type] && pick(type, state.sel[type])) return;
      var rec = recommend(type, need, state.sel);
      if (state.sel[type] !== rec) state.qty[type] = null;
      state.sel[type] = rec;
      state.pinned[type] = false;
    });
  }
  function qtyOf(type, need) {
    var manual = state.qty[type];
    return manual != null && manual > 0 ? manual : autoQtyFor(type, pick(type, state.sel[type]), need);
  }
  // Ek kalem önerilen miktarı: panel sayısına / kablo metrajına / kurulu güce bağlı
  function extraAutoQty(x, panelQty, instKwp) {
    var cable = panelQty * (SZ.cableMetersPerPanel || 4);
    if (x.rule === "perPanel") return panelQty;
    if (x.rule === "perCableSet") return panelQty ? Math.max(1, Math.ceil(cable / (x.meters || 1))) : 0;
    if (x.rule === "perCableMeter") return cable;
    if (x.rule === "perKwp") return Math.max(1, Math.round(instKwp * 10) / 10);
    return 1;
  }
  // Müşteri elle değiştirdiyse onun adedi geçerlidir
  function extraQtyOf(x, panelQty, instKwp) {
    var m = state.exQty[x.id];
    return m != null && m > 0 ? m : extraAutoQty(x, panelQty, instKwp);
  }
  // Mağaza ürünü tam sayı adetle satılır; tahmini hizmet (kWp başına) ondalık olabilir
  function extraStep(x) { return x.rule === "perKwp" && !x.shop ? 0.1 : 1; }
  function extraOn(x) { return state.extras[x.id] != null ? state.extras[x.id] : !!x.on; }
  function extraById(id) {
    var arr = list("extras");
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  /* ---- Adet kutularının ortak anahtarı: "panel" | "battery" | "inverter" | "x:<ekId>" ---- */
  function isEx(key) { return key.indexOf("x:") === 0; }
  function setQtyKey(key, v) { if (isEx(key)) state.exQty[key.slice(2)] = v; else state.qty[key] = v; }
  function clearQtyKey(key) { if (isEx(key)) delete state.exQty[key.slice(2)]; else state.qty[key] = null; }
  function qtyOfKey(key) {
    if (!isEx(key)) return qtyOf(key, calc());
    var x = extraById(key.slice(2));
    if (!x) return 1;
    var r = bom();
    return extraQtyOf(x, r.panelQty, r.instKwp);
  }
  function stepOfKey(key) {
    if (!isEx(key)) return 1;
    var x = extraById(key.slice(2));
    return x ? extraStep(x) : 1;
  }
  function roundQ(v, st) { return st >= 1 ? Math.max(1, Math.round(v)) : Math.max(st, Math.round(v * 10) / 10); }
  // Miktarın nereden geldiğini müşteriye açıklayan kısa not
  function extraNote(x) {
    var m = nf1(SZ.cableMetersPerPanel || 4);
    if (x.rule === "perPanel") return L("Her panel için", "Per panel", "Pro Modul", "На каждую панель");
    if (x.rule === "perCableSet") return L("Panel başına " + m + " m kablo · takımda " + nf(x.meters) + " m",
      m + " m cable per panel · " + nf(x.meters) + " m per set", m + " m Kabel pro Modul · " + nf(x.meters) + " m pro Set",
      m + " м кабеля на панель · " + nf(x.meters) + " м в комплекте");
    if (x.rule === "perCableMeter") return L("Panel başına " + m + " m", m + " m per panel", m + " m pro Modul", m + " м на панель");
    if (x.rule === "perKwp") return L("Kurulu kWp başına", "Per installed kWp", "Pro installiertem kWp", "На кВт·п мощности");
    return L("Sistem başına tek", "One per system", "Einmal pro Anlage", "Один на систему");
  }

  /* ---- Malzeme listesi (BOM) — 3., 4. ve 5. adım AYNI veriyi kullanır ----
     opts.rec: müşterinin seçimlerini yok say, önerilen sistemi hesapla */
  function lineOf(type, it, q, unit) {
    return { type: type, id: it.id, pkg: it.pkg || "", shop: !!it.shop, est: !!it.est, url: it.url || "", name: it.name,
      qty: q, unit: unit, price: it.price, cart: it.cart, pct: it.pct, sum: it.price * q, sumCart: it.cart * q };
  }
  function bom(opts) {
    var rec = !!(opts && opts.rec);
    var need = calc();
    var sel;
    if (rec) sel = recSel(need); else { ensureDefaults(need); sel = state.sel; }
    var lines = [];
    TYPES.forEach(function (type) {
      var it = pick(type, sel[type]);
      if (!it) return;
      lines.push(lineOf(type, it, rec ? autoQtyFor(type, it, need) : qtyOf(type, need), uAdet()));
    });
    // Kurulu güç ve kablo miktarı seçilen panele göre
    var pnl = pick("panel", sel.panel);
    var panelQty = pnl ? (rec ? autoQtyFor("panel", pnl, need) : qtyOf("panel", need)) : 0;
    var instKwp = pnl ? (panelQty * pnl.w) / 1000 : 0;
    list("extras").forEach(function (x) {
      if (!extraOn(x)) return;
      var q = rec ? extraAutoQty(x, panelQty, instKwp) : extraQtyOf(x, panelQty, instKwp);
      if (!q) return;
      lines.push(lineOf("extra", x, q, T(x.unitName)));
    });
    // shop: mağaza (sepete girer) · firm: teklifle, liste fiyatı · est: teklifle, tahmini
    var r = { need: need, sel: sel, lines: lines, panelQty: panelQty, instKwp: instKwp, shopList: 0, shopCart: 0, firm: 0, est: 0, quote: 0, total: 0, pct: null };
    var pcts = {};
    lines.forEach(function (l) {
      if (l.shop) { r.shopList += l.sum; r.shopCart += l.sumCart; if (l.cart < l.price) pcts[l.pct] = 1; }
      else if (l.est) r.est += l.sum;
      else r.firm += l.sum;
    });
    r.quote = r.firm + r.est;
    r.total = r.shopList + r.quote;
    var pk = Object.keys(pcts);
    r.pct = pk.length === 1 ? +pk[0] : null; // oranları farklı kalemlerde tek "%N" yazılmaz
    return r;
  }

  /* ---- İhtiyacı karşılıyor mu? (akordeon başlığı, 3. adım kartları) ---- */
  function volts(sel) {
    var b = pick("battery", sel.battery), i = pick("inverter", sel.inverter);
    if (!b || !i || !b.v || !i.v || b.v === i.v) return "";
    return L("Akü " + b.v + " V, inverter " + i.v + " V: birlikte çalışmaz", "Battery " + b.v + " V, inverter " + i.v + " V: not compatible",
      "Batterie " + b.v + " V, Wechselrichter " + i.v + " V: nicht kompatibel", "АКБ " + b.v + " В, инвертор " + i.v + " В: несовместимы");
  }
  function cover(type, r) {
    var it = pick(type, r.sel[type]), l = null;
    r.lines.forEach(function (x) { if (x.type === type) l = x; });
    if (!it || !l) return null;
    if (type !== "panel" && volts(r.sel)) return { ok: false, text: volts(r.sel) };
    var need = r.need, have, want, u;
    if (type === "panel") { have = r.instKwp; want = need.kwp; u = " kWp"; }
    else if (type === "battery") { have = l.qty * it.kwh; want = need.usableKwh / dodOf(it); u = " kWh"; }
    else { have = l.qty * it.kw; want = need.invKw; u = " kW"; }
    var ok = have + 1e-9 >= want;
    return { ok: ok, text: nf2(have) + u + " · " + L("ihtiyaç", "need", "Bedarf", "нужно") + " " + nf2(want) + u +
      (ok ? "" : " · " + L("yetersiz", "too low", "zu gering", "недостаточно")) };
  }
  function covHtml(c) {
    return c ? '<span class="bld-cov ' + (c.ok ? "ok" : "warn") + '">' + (c.ok ? "✔ " : "⚠ ") + c.text + "</span>" : "";
  }
  function srcBadge(it) {
    return it.shop
      ? '<em class="bld-src shop">🛒 ' + L("Mağazada", "In shop", "Im Shop", "В магазине") + "</em>"
      : '<em class="bld-src est">📋 ' + L("Teklifle", "On quote", "Auf Angebot", "По запросу") + "</em>";
  }
  function specOf(type, it) {
    if (type === "panel") return nf(it.w) + " W";
    if (type === "battery") {
      var d = Math.round(dodOf(it) * 100);
      return nf2(it.kwh) + " kWh · " + L("kullanılabilir %" + d, "usable " + d + "%", "nutzbar " + d + " %", "полезно " + d + "%");
    }
    if (type === "inverter") return nf1(it.kw) + " kW · " + it.v + " V " + L("akü", "battery", "Batterie", "АКБ");
    return "";
  }
  var TITLES = function () {
    return {
      panel: { icon: "☀️", title: L("Güneş paneli", "Solar panels", "Solarmodule", "Солнечные панели") },
      battery: { icon: "🔋", title: L("Akü", "Battery", "Batterie", "Аккумулятор") },
      inverter: { icon: "⚡", title: L("İnverter", "Inverter", "Wechselrichter", "Инвертор") }
    };
  };

  /* ---- Fiyat satırları: mağaza (kesin) · teklifle (tahmini) · toplam ---- */
  function priceRows(r) {
    var h = "";
    if (r.shopList) {
      h += '<div class="bld-prow"><span>🛒 ' + L("Mağaza ürünleri", "Shop products", "Shop-Produkte", "Товары магазина") +
        "<small>" + L("Fiyat mağazayla aynı, sepete eklenebilir", "Same price as the shop, can go to cart", "Gleicher Preis wie im Shop, in den Warenkorb", "Цена как в магазине, можно в корзину") +
        "</small></span><b>" + money(r.shopList) + "</b></div>";
      if (r.shopCart < r.shopList) {
        h += '<p class="bld-havale">💰 ' + L("Mağaza ürünleri havale/EFT ile:", "Shop products by bank transfer:", "Shop-Produkte per Überweisung:", "Товары магазина переводом:") +
          " <b>" + money(r.shopCart) + "</b>" + (r.pct ? " (" + L("%" + nf1(r.pct) + " indirimli", nf1(r.pct) + "% off", nf1(r.pct) + " % Rabatt", "скидка " + nf1(r.pct) + " %") + ")" : "") + "</p>";
      }
    }
    if (r.firm) {
      h += '<div class="bld-prow"><span>📋 ' + L("Teklifle satılan ürünler", "Products sold on quote", "Produkte auf Angebot", "Товары по запросу") +
        "<small>" + L("Liste fiyatı; sepete eklenmez, WhatsApp'tan sipariş edilir", "List price; not in the cart, ordered via WhatsApp", "Listenpreis; nicht im Warenkorb, Bestellung per WhatsApp", "Прайсовая цена; не в корзине, заказ через WhatsApp") +
        "</small></span><b>" + money(r.firm) + "</b></div>";
    }
    if (r.est) {
      h += '<div class="bld-prow"><span>🔧 ' + L("Keşifle netleşecek", "Confirmed after survey", "Nach Prüfung bestätigt", "Уточняется после выезда") +
        "<small>" + L("Pano, konstrüksiyon ve işçilik: tahmini", "Panel box, mounting and labour: estimate", "Verteiler, Gestell und Montage: Schätzung", "Щит, конструкция и монтаж: оценка") +
        "</small></span><b>" + money(r.est) + "</b></div>";
    }
    h += '<div class="bld-prow total"><span>' + (r.est ? L("Tahmini toplam", "Estimated total", "Geschätzte Summe", "Итого (оценка)") : L("Toplam", "Total", "Summe", "Итого")) +
      "<small>" + L("KDV dahil", "VAT included", "Inkl. MwSt.", "С НДС") + "</small></span><b>" + money(r.total) + "</b></div>";
    return h;
  }

  /* ============================================================
     ARAYÜZ
     ============================================================ */
  function stepNav() {
    var steps = [
      L("Kullanım yeri", "Use case", "Einsatzort", "Сценарий"),
      L("Cihazlar", "Appliances", "Geräte", "Приборы"),
      L("Önerilen sistem", "Suggested system", "Empfohlene Anlage", "Рекомендуемая система"),
      L("Ürünleri düzenle", "Customise", "Anpassen", "Настроить"),
      L("Sipariş", "Order", "Bestellung", "Заказ")
    ];
    return '<ol class="bld-steps">' + steps.map(function (s, i) {
      var n = i + 1;
      var cls = n === state.step ? " active" : (n < state.step ? " done" : "");
      return '<li class="bld-step' + cls + '"><button type="button" data-goto="' + n + '"' + (n > state.step ? " disabled" : "") + '><em>' + n + "</em><span>" + s + "</span></button></li>";
    }).join("") + "</ol>";
  }

  function viewPreset() {
    var perDay = L("kWh/gün", "kWh/day", "kWh/Tag", "кВт·ч/сут");
    return '<div class="bld-card"><h2>' + L("Sistemi nerede kullanacaksınız?", "Where will you use the system?", "Wo setzen Sie die Anlage ein?", "Где будет использоваться система?") + "</h2>" +
      '<p class="bld-lead">' + L("Bir kullanım yeri seçin; tipik cihaz listesi hazır gelsin. Sonraki adımda her cihazı değiştirebilirsiniz.",
        "Pick a use case and a typical appliance list is preloaded. You can edit everything in the next step.",
        "Wählen Sie einen Einsatzort, eine typische Geräteliste wird vorbereitet. Im nächsten Schritt ist alles anpassbar.",
        "Выберите сценарий, и типовой список приборов подставится. На следующем шаге всё можно изменить.") + "</p>" +
      '<div class="bld-presets">' + B.presets.map(function (p) {
        var kwh = calcFor(p.items, {}, 1).dailyWh / 1000;
        return '<button type="button" class="bld-preset' + (state.preset === p.id ? " sel" : "") + '" data-preset="' + p.id + '">' +
          "<em>" + p.icon + "</em><strong>" + T(p.label) + "</strong><span>" + T(p.desc) + "</span>" +
          '<small class="bld-preset-kwh">≈ ' + nf1(kwh) + " " + perDay + "</small></button>";
      }).join("") +
      '<button type="button" class="bld-preset bld-preset-blank" data-preset="__bos__"><em>✏️</em><strong>' +
        L("Sıfırdan başla", "Start from scratch", "Von vorn beginnen", "С нуля") + "</strong><span>" +
        L("Cihazları kendim seçeyim", "I'll pick appliances myself", "Geräte selbst wählen", "Выберу приборы сам") + "</span></button>" +
      "</div></div>";
  }

  // Cihaz satırındaki (− n +) kutusu — kind: "q" adet, "h" günlük saat
  function appStepper(kind, a, val) {
    var q = kind === "q", name = esc(T(a.name));
    var what = q ? L("adet", "quantity", "Anzahl", "количество") : L("günlük saat", "hours per day", "Stunden pro Tag", "часов в день");
    return '<span class="bld-qty">' +
      "<button type=\"button\" " + (q ? "data-dec" : "data-hdec") + '="' + a.id + '" aria-label="' + name + " " + what + " " + L("azalt", "decrease", "weniger", "меньше") + '">−</button>' +
      '<input type="text" inputmode="' + (q ? "numeric" : "decimal") + '" autocomplete="off" value="' + (q ? val : nf1(val)) + '" ' + (q ? "data-qty" : "data-h") + '="' + a.id + '" aria-label="' + name + " " + what + '" />' +
      "<button type=\"button\" " + (q ? "data-inc" : "data-hinc") + '="' + a.id + '" aria-label="' + name + " " + what + " " + L("artır", "increase", "mehr", "больше") + '">+</button></span>';
  }

  function viewAppliances() {
    var need = calc();
    var lblQ = L("Adet", "Qty", "Anzahl", "Кол-во"), lblH = L("Saat/gün", "Hours/day", "Std./Tag", "Часов/день");
    var head = '<div class="bld-apps-head" aria-hidden="true"><span>' + L("Cihaz", "Appliance", "Gerät", "Прибор") + "</span><span>" +
      L("Güç", "Power", "Leistung", "Мощность") + "</span><span>" + lblQ + "</span><span>" + lblH + "</span><span>" +
      L("Günlük", "Daily", "Täglich", "В сутки") + "</span></div>";
    var groups = (B.groups || []).map(function (g) {
      var rows = B.appliances.filter(function (a) { return a.group === g.id; }).map(function (a) {
        var q = state.items[a.id] || 0, h = hoursOf(a.id);
        return '<div class="bld-app-row' + (q ? " on" : "") + '" data-app="' + a.id + '">' +
          '<span class="bld-app"><em aria-hidden="true">' + a.icon + "</em><span>" + T(a.name) + '<small class="bld-app-wm">' + nf(a.w) + " W</small></span></span>" +
          '<span class="bld-app-w">' + nf(a.w) + " W</span>" +
          '<span class="bld-app-ctl"><span class="bld-app-q"><small aria-hidden="true">' + lblQ + "</small>" + appStepper("q", a, q) + "</span>" +
            '<span class="bld-app-h"><small aria-hidden="true">' + lblH + "</small>" + appStepper("h", a, h) + "</span></span>" +
          '<span class="bld-wh">' + (q ? nf(a.w * q * h) + " Wh" : "—") + "</span></div>";
      }).join("");
      return '<div class="bld-group"><h3>' + T(g.label) + '</h3><div class="bld-apps">' + head + rows + "</div></div>";
    }).join("");

    return '<div class="bld-card"><h2>' + L("Neleri çalıştıracaksınız?", "What will you run?", "Was soll betrieben werden?", "Что будет работать?") + "</h2>" +
      '<p class="bld-lead">' + L("Adetleri ve günde kaç saat çalıştıklarını kendinize göre ayarlayın; hesap anında güncellenir.",
        "Adjust quantities and how many hours a day each runs; the calculation updates instantly.",
        "Passen Sie Anzahl und tägliche Laufzeit an; die Berechnung aktualisiert sich sofort.",
        "Измените количество и часы работы в день, расчёт обновится сразу.") + "</p>" +
      '<p class="bld-hint bld-hint-top">💡 ' + L("Saat/gün: cihazın günde toplam kaç saat çalıştığı. Buzdolabının motoru aralıklı çalışır, 8 saat yazmak yeterlidir.",
        "Hours/day: how long the appliance actually runs per day. A fridge compressor cycles on and off, so 8 hours is enough.",
        "Std./Tag: wie lange das Gerät täglich tatsächlich läuft. Ein Kühlschrank-Kompressor taktet, 8 Stunden genügen.",
        "Часов/день: сколько прибор реально работает в сутки. Компрессор холодильника включается циклами, 8 часов достаточно.") + "</p>" +
      groups +
      '<div class="bld-live" role="status"><div><span>' + L("Seçili cihaz", "Selected", "Ausgewählt", "Выбрано") + '</span><strong>' + nf(need.count) + "</strong></div>" +
      "<div><span>" + L("Günlük tüketim", "Daily energy", "Tagesverbrauch", "Суточное потребление") + '</span><strong>' + nf2(need.dailyWh / 1000) + " kWh</strong></div>" +
      "<div><span>" + L("Anlık tepe güç", "Peak load", "Spitzenlast", "Пиковая нагрузка") + '</span><strong>' + nf(need.peakW) + " W</strong></div></div>" +
      "</div>";
  }

  // Günlük ihtiyacı kendi üretimiyle karşılayan hazır paketler (config.packages `kit`).
  // Üretim ihtiyaçla AYNI katsayıyla (kış tasarım günü) hesaplanır; ucuzdan pahalıya.
  function kitsFor(need) {
    return (CFG.packages || []).filter(function (p) {
      if (!p.kit || !p.kwp || p.stock === 0) return false;
      var u = unitOf(p);
      return !u.poa && u.list != null && dailyProdKwh(p.kwp) * 1000 >= need.dailyWh;
    }).sort(function (a, b) { return unitOf(a).list - unitOf(b).list; }).slice(0, 2);
  }
  function kitsHtml(need) {
    var kits = kitsFor(need);
    if (!kits.length) return "";
    return '<div class="bld-kits"><h3>💡 ' + L("Daha pratik seçenek: hazır paket", "A simpler option: a ready-made kit", "Einfachere Option: ein Komplettpaket", "Проще: готовый комплект") + "</h3>" +
      "<p>" + L("Günlük ihtiyacınız (" + nf2(need.dailyWh / 1000) + " kWh) hazır paketlerimizle de karşılanabilir; panel ve güç kutusu tek pakette gelir. Cihazlarınıza uygunluğunu sipariş öncesi teyit ederiz.",
        "Your daily need (" + nf2(need.dailyWh / 1000) + " kWh) can also be met by our ready-made kits, with panels and power unit in one package. We confirm the fit with your appliances before ordering.",
        "Ihr Tagesbedarf (" + nf2(need.dailyWh / 1000) + " kWh) lässt sich auch mit unseren Komplettpaketen decken, Module und Powerbox in einem Paket. Die Eignung für Ihre Geräte prüfen wir vor der Bestellung.",
        "Ваша суточная потребность (" + nf2(need.dailyWh / 1000) + " кВт·ч) покрывается и готовыми комплектами: панели и блок питания в одном наборе. Совместимость с приборами проверим до заказа.") + "</p>" +
      '<div class="bld-kit-list">' + kits.map(function (p) {
        return '<a class="bld-kit" href="' + (p.url || "online-satis.html") + '">' +
          (p.img ? '<img src="/' + p.img + '" alt="' + esc(T(p.name)) + '" width="72" height="72" loading="lazy" decoding="async" />' : "") +
          "<span><b>" + T(p.name) + "</b><small>" + T(p.for || "") + "</small><em>" + money(unitOf(p).list) + "</em></span></a>";
      }).join("") + "</div></div>";
  }

  function viewRecommend() {
    var need = calc();
    if (!need.count) {
      return '<div class="bld-card"><h2>' + L("Önerilen sistem", "Suggested system", "Empfohlene Anlage", "Рекомендуемая система") + "</h2><p>" +
        L("Önce çalıştıracağınız cihazları seçin.", "Please select your appliances first.", "Bitte zuerst Geräte wählen.", "Сначала выберите приборы.") +
        '</p><button type="button" class="btn" data-goto="2">← ' + L("Cihazlar", "Appliances", "Geräte", "Приборы") + "</button></div>";
    }
    var r = bom({ rec: true });
    var M = TITLES(), aut = state.autonomy || 1;
    var why = {
      panel: L("Kışın günde ~" + nf1(SZ.sunHours) + " saat güneşle günlük tüketiminizi üretir.",
        "Produces your daily use with ~" + nf1(SZ.sunHours) + " winter sun hours a day.",
        "Erzeugt Ihren Tagesbedarf mit ~" + nf1(SZ.sunHours) + " Wintersonnenstunden pro Tag.",
        "Вырабатывает суточное потребление при ~" + nf1(SZ.sunHours) + " ч зимнего солнца в день."),
      battery: L("Güneş yokken " + aut + " günlük tüketiminizi karşılar.", "Covers " + aut + " day(s) of use without sun.",
        "Deckt " + aut + " Tag(e) Verbrauch ohne Sonne.", "Покрывает " + aut + " сут. потребления без солнца."),
      inverter: L("Aynı anda çalışan cihazları ve motorlu cihazların kalkışını kaldırır.", "Handles simultaneous loads and motor start-up.",
        "Trägt gleichzeitige Lasten und den Anlauf von Motoren.", "Держит одновременную нагрузку и пуск моторов.")
    };
    var cards = TYPES.map(function (type) {
      var l = null; r.lines.forEach(function (x) { if (x.type === type) l = x; });
      if (!l) return "";
      return '<div class="bld-rc">' +
        '<div class="bld-rc-top"><span class="bld-rc-ico" aria-hidden="true">' + M[type].icon + "</span><span>" + M[type].title + "</span>" + srcBadge(l) + "</div>" +
        '<strong class="bld-rc-pick">' + nf1(l.qty) + " × " + l.name + "</strong>" +
        covHtml(cover(type, r)) +
        '<small class="bld-rc-why">' + why[type] + "</small>" +
        '<span class="bld-rc-price">' + money(l.sum) + (l.est ? " <small>" + L("tahmini", "estimate", "Schätzung", "оценка") + "</small>" : "") + "</span></div>";
    }).join("");
    var ex = r.lines.filter(function (l) { return l.type === "extra"; });
    var exSum = ex.reduce(function (s, l) { return s + l.sum; }, 0);
    var pr = presetById(state.preset);
    var tip = pr && pr.tip ? '<p class="bld-tip">💡 ' + T(pr.tip.text) + (pr.tip.href ? ' <a href="' + pr.tip.href + '">' + T(pr.tip.link || "") + "</a>" : "") + "</p>" : "";

    return '<div class="bld-card"><h2>' + L("Size önerilen sistem", "Your suggested system", "Ihre empfohlene Anlage", "Рекомендуемая вам система") + "</h2>" +
      '<p class="bld-lead">' + L("Cihaz listenize göre hesapladık. Uygunsa aşağıdan devam edin; isterseniz marka, model ve adetleri değiştirebilirsiniz.",
        "Calculated from your appliance list. If it suits you, continue below; you can also change brands, models and quantities.",
        "Aus Ihrer Geräteliste berechnet. Passt es, fahren Sie unten fort; Marken, Modelle und Mengen sind änderbar.",
        "Рассчитано по вашему списку приборов. Если подходит, продолжайте ниже; бренды, модели и количество можно изменить.") + "</p>" +
      '<div class="bld-energy"><div><span>' + L("Günlük tüketiminiz", "Your daily use", "Ihr Tagesverbrauch", "Ваше суточное потребление") + "</span><b>" + nf2(need.dailyWh / 1000) + " kWh</b></div>" +
        "<div><span>" + L("Anlık en yüksek yük", "Peak load", "Spitzenlast", "Пиковая нагрузка") + "</span><b>" + nf(need.peakW) + " W</b></div></div>" +
      '<div class="bld-rcs">' + cards + "</div>" +
      '<div class="bld-field"><label for="bldAuto">' + L("Güneş olmadan kaç gün idare etsin?", "How many days without sun?", "Wie viele Tage ohne Sonne?", "Сколько дней без солнца?") + "</label>" +
        '<select id="bldAuto"><option value="1">1 ' + L("gün", "day", "Tag", "день") + '</option><option value="2">2 ' + L("gün", "days", "Tage", "дня") + '</option><option value="3">3 ' + L("gün", "days", "Tage", "дня") + "</option></select>" +
        '<p class="bld-hint">' + L("Daha uzun süre = daha büyük akü grubu ve daha yüksek maliyet.", "Longer = bigger battery bank and higher cost.",
          "Länger = größerer Speicher und höhere Kosten.", "Дольше = больше аккумуляторов и выше стоимость.") + "</p></div>" +
      tip + kitsHtml(need) +
      '<div class="bld-rsum">' +
        (ex.length ? '<p class="bld-rsum-ex">🧰 ' + L("Kablo, MC4, pano ve işçilik", "Cabling, MC4, panel box and labour", "Kabel, MC4, Verteiler und Montage", "Кабели, MC4, щит и монтаж") +
          " (" + ex.length + " " + L("kalem", "items", "Positionen", "позиций") + "): <b>" + money(exSum) + "</b></p>" : "") +
        priceRows(r) +
        '<div class="bld-rsum-cta"><button type="button" class="btn btn-ghost" data-goto="4">✏️ ' +
          L("Ürünleri değiştir", "Change products", "Produkte ändern", "Изменить товары") + "</button></div></div>" +
      '<p class="bld-note">' + L("Değerler tahminidir; kesin proje ücretsiz keşifle netleşir.",
        "Values are estimates; the final design is set after a free site survey.",
        "Werte sind Schätzungen; die endgültige Auslegung erfolgt nach der kostenlosen Vor-Ort-Analyse.",
        "Значения ориентировочные; итог определяется после бесплатного выезда.") + "</p></div>";
  }

  // Satır içi adet kutusu (− n +) — seçili/işaretli kalemlerde görünür
  function stepper(key, val, unit, step, label) {
    return '<span class="bld-qty bld-qty-sm">' +
      '<button type="button" data-qdec="' + key + '" aria-label="' + esc(label) + " " + L("azalt", "decrease", "weniger", "меньше") + '">−</button>' +
      '<input type="text" value="' + nf1(val) + '" data-qset="' + key + '" data-step="' + step + '" inputmode="decimal" autocomplete="off" aria-label="' + esc(label) + " " + L("adet", "quantity", "Anzahl", "количество") + '" />' +
      '<button type="button" data-qinc="' + key + '" aria-label="' + esc(label) + " " + L("artır", "increase", "mehr", "больше") + '">+</button>' +
      '<span class="bld-qty-unit">' + unit + "</span></span>";
  }
  // Elle değiştirilen adedi otomatik hesaba döndürme bağlantısı
  function autoLabel(autoV, unit) {
    return "↺ " + L("otomatik", "auto", "automatisch", "авто") + " (" + nf1(autoV) + " " + unit + ")";
  }
  function autoLink(key, autoV, unit) {
    return '<button type="button" class="bld-auto" data-qauto="' + key + '">' + autoLabel(autoV, unit) + "</button>";
  }
  // Adet hücresi: aktif kalemde (− n +) kutusu + otomatiğe dön bağlantısı, pasifte önerilen adet
  function qtyCellHtml(active, key, q, autoV, unit, step, label) {
    if (!active) return '<span class="bld-row-qtytext">' + nf1(autoV) + " " + unit + "</span>";
    return stepper(key, q, unit, step, label) +
      '<span class="bld-row-auto">' + (q !== autoV ? autoLink(key, autoV, unit) : "") + "</span>";
  }
  function unitCell(it, unit) {
    return '<span class="bld-row-unit"><b>' + money(it.price) + "</b><small>/ " + unit +
      (it.est ? " · " + L("tahmini", "estimate", "Schätzung", "оценка") : "") + "</small></span>";
  }

  function listRows(type, need) {
    var auto = recommend(type, need, state.sel);
    return list(type).map(function (it) {
      var sel = state.sel[type] === it.id;
      var autoV = autoQtyFor(type, it, need);
      var q = sel ? qtyOf(type, need) : autoV;
      // Adet kutusu <label>'ın DIŞINDA durmalı: aksi hâlde + / − tıklaması seçimi değiştirir
      return '<div class="bld-row bld-row-pick' + (sel ? " sel has-qty" : "") + '" data-rowid="' + type + '">' +
        '<label class="bld-row-hit">' +
          '<input type="radio" name="bld-' + type + '" value="' + it.id + '"' + (sel ? " checked" : "") + ' data-sel="' + type + '" aria-label="' + esc(it.name) + '" />' +
          '<span class="bld-row-mark" aria-hidden="true"></span>' +
          '<span class="bld-row-main"><span class="bld-row-title"><strong>' + it.name + "</strong>" +
            (it.id === auto ? ' <em class="bld-rec">' + L("Önerilen", "Recommended", "Empfohlen", "Рекомендуем") + "</em>" : "") + " " + srcBadge(it) + "</span>" +
            '<span class="bld-row-spec">' + specOf(type, it) + "</span></span>" +
          unitCell(it, uAdet()) +
        "</label>" +
        '<span class="bld-row-qty">' + qtyCellHtml(sel, type, q, autoV, uAdet(), 1, it.name) + "</span>" +
        '<span class="bld-row-sum">' + money(it.price * q) + "</span></div>";
    }).join("");
  }

  // Akordeon başlığındaki özet: seçilen model + tutar + ihtiyacı karşılıyor mu
  function accSum(type, r) {
    var l = null; r.lines.forEach(function (x) { if (x.type === type) l = x; });
    if (!l) return { b: "", s: "" };
    return { b: nf1(l.qty) + " × " + l.name, s: money(l.sum) + (l.est ? " (" + L("tahmini", "estimate", "Schätzung", "оценка") + ")" : "") + " " + covHtml(cover(type, r)) };
  }
  function exSum(r) {
    var on = 0, sum = 0;
    r.lines.forEach(function (l) { if (l.type === "extra") { on++; sum += l.sum; } });
    return { b: on + " " + L("kalem seçili", "items selected", "Positionen gewählt", "позиций выбрано"), s: money(sum) };
  }
  // 4. adımın altındaki sabit toplam çubuğu
  function totalBar(r) {
    return (r.shopList ? '<div class="bld-tb-shop"><span>🛒 ' + L("Mağaza", "Shop", "Shop", "Магазин") + "</span><strong>" + money(r.shopList) + "</strong></div>" : "") +
      (r.quote ? '<div class="bld-tb-est"><span>📋 ' + L("Teklifle", "On quote", "Auf Angebot", "По запросу") + "</span><strong>" + money(r.quote) + "</strong></div>" : "") +
      '<div class="bld-tb-total"><span>' + L("Tahmini toplam", "Estimated total", "Geschätzte Summe", "Итого (оценка)") + "</span><strong>" + money(r.total) + "</strong></div>";
  }

  function viewSelect() {
    var need = calc();
    var r = bom(); // seçimler ve adetler ensureDefaults ile hazır
    var M = TITLES();

    function acc(key, icon, title, sum, bodyHtml) {
      var open = !!state.open[key];
      return '<div class="bld-acc' + (open ? " open" : "") + '">' +
        '<button class="bld-acc-head" type="button" data-acc="' + key + '" aria-expanded="' + (open ? "true" : "false") + '" aria-controls="acc-' + key + '">' +
          '<span class="bld-acc-title"><em aria-hidden="true">' + icon + "</em>" + title + "</span>" +
          '<span class="bld-acc-sum"><b>' + sum.b + "</b><small>" + sum.s + "</small></span>" +
          '<span class="bld-acc-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="bld-acc-body" id="acc-' + key + '"><div class="bld-acc-inner">' + bodyHtml + "</div></div></div>";
    }
    function listHead(first) {
      return '<div class="bld-row bld-row-head" aria-hidden="true">' +
        '<span></span><span class="bld-row-main">' + first + "</span>" +
        '<span class="bld-row-unit">' + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</span>" +
        '<span class="bld-row-qty">' + L("Adet", "Qty", "Anzahl", "Кол-во") + "</span>" +
        '<span class="bld-row-sum">' + L("Tutar", "Total", "Summe", "Сумма") + "</span></div>";
    }

    var out = '<div class="bld-card"><h2>' + L("Ürünleri düzenle", "Customise products", "Produkte anpassen", "Настройте товары") + "</h2>" +
      '<p class="bld-lead">' + L("Önerilen ürünler seçili geldi. Başlığa dokunup listeyi açın, marka ve modeli değiştirin; adetler ihtiyacınıza göre otomatik hesaplanır.",
        "Recommended products are pre-selected. Tap a heading to open the list and change brand or model; quantities are calculated from your needs.",
        "Empfohlene Produkte sind vorausgewählt. Tippen Sie auf eine Überschrift, um Marke oder Modell zu ändern; Mengen werden aus Ihrem Bedarf berechnet.",
        "Рекомендуемые товары уже выбраны. Нажмите на заголовок, чтобы сменить бренд или модель; количество считается по вашей потребности.") + "</p>" +
      '<p class="bld-legend"><span>' + srcBadge({ shop: true }) + " " + L("fiyat mağazayla aynı, sepete eklenebilir", "same price as the shop, can go to cart", "gleicher Preis wie im Shop, in den Warenkorb", "цена как в магазине, можно в корзину") +
        "</span><span>" + srcBadge({ shop: false }) + " " + L("WhatsApp'tan sipariş edilir; \"tahmini\" yazan fiyat keşifle netleşir", "ordered via WhatsApp; prices marked \"estimate\" are confirmed after a survey", "per WhatsApp bestellt; Preise mit \"Schätzung\" werden nach der Prüfung bestätigt", "заказ через WhatsApp; цены с пометкой \"оценка\" уточняются после выезда") + "</span></p>";

    TYPES.forEach(function (type) {
      var body = '<div class="bld-list">' + listHead(L("Marka / model", "Brand / model", "Marke / Modell", "Бренд / модель")) + listRows(type, need) + "</div>";
      out += acc(type, M[type].icon, M[type].title, accSum(type, r), body);
    });

    // Kablo, pano ve işçilik — diğer kategorilerle aynı liste düzeni (çoklu seçim)
    var exBody =
      '<p class="bld-hint bld-hint-top">' + L("Sisteme dahil edilecek kalemler işaretlidir; ihtiyacınız olmayanların işaretini kaldırın. Adetler panel sayısına göre önerilir, dilediğiniz gibi değiştirebilirsiniz.",
        "Included items are ticked; untick what you don't need. Quantities are suggested from the panel count and can be changed.",
        "Enthaltene Positionen sind angehakt; nicht Benötigtes abwählen. Mengen sind Vorschläge aus der Modulanzahl und frei änderbar.",
        "Отмеченные позиции входят в систему; снимите отметку с ненужных. Количество предлагается по числу панелей, его можно изменить.") + "</p>" +
      '<div class="bld-list">' + listHead(L("Kalem / hizmet", "Item / service", "Position / Leistung", "Позиция / услуга")) +
      list("extras").map(function (x) {
        var on = extraOn(x);
        var autoV = extraAutoQty(x, r.panelQty, r.instKwp);
        var q = extraQtyOf(x, r.panelQty, r.instKwp);
        var u = T(x.unitName);
        return '<div class="bld-row bld-row-check' + (on ? " sel has-qty" : "") + '" data-rowid="x:' + x.id + '">' +
          '<label class="bld-row-hit">' +
            '<input type="checkbox" data-extra="' + x.id + '"' + (on ? " checked" : "") + ' aria-label="' + esc(x.name) + '" />' +
            '<span class="bld-row-mark" aria-hidden="true"></span>' +
            '<span class="bld-row-main"><span class="bld-row-title"><strong>' + x.name + "</strong> " + srcBadge(x) + "</span>" +
              '<span class="bld-row-spec">' + extraNote(x) + "</span></span>" +
            unitCell(x, u) +
          "</label>" +
          '<span class="bld-row-qty">' + qtyCellHtml(on, "x:" + x.id, q, autoV, u, extraStep(x), x.name) + "</span>" +
          '<span class="bld-row-sum">' + money(x.price * q) + "</span></div>";
      }).join("") + "</div>";
    out += acc("extras", "🧰", L("Kablo, pano ve işçilik", "Cabling, panel box and labour", "Verkabelung, Verteiler und Montage", "Кабели, щит и монтаж"), exSum(r), exBody);

    // Canlı toplam — her değişiklikte güncellenir (tam döküm 5. adımda)
    out += '<div class="bld-live bld-totbar" id="bldCart" role="status">' + totalBar(r) + "</div>";
    return out + "</div>";
  }

  // Fiyat kutusu + sipariş düğmeleri (5. adım)
  function priceBox(r) {
    var wa = WA ? "https://wa.me/" + WA + "?text=" + encodeURIComponent(waText(r)) : "iletisim.html";
    var nShop = r.lines.filter(function (l) { return l.shop; }).length;
    return '<div class="bld-price-box">' + priceRows(r) +
      '<p class="bld-price-kwp">' + L("Kurulu güç", "Installed power", "Installierte Leistung", "Мощность") + " <b>" + nf2(r.instKwp) + " kWp</b></p>" +
      '<div class="bld-price-cta">' +
        '<a class="btn btn-lg" href="' + wa + '"' + (WA ? ' target="_blank" rel="noopener"' : "") + '>📲 ' +
          L("Siparişi WhatsApp'tan gönder", "Send order via WhatsApp", "Bestellung per WhatsApp senden", "Отправить заказ в WhatsApp") + "</a>" +
        (nShop && SHOP && SHOP.cart ? '<button class="btn btn-ghost btn-lg" type="button" id="bldToCart">🛒 ' +
          L("Mağaza ürünlerini sepete ekle", "Add shop products to cart", "Shop-Produkte in den Warenkorb", "Товары магазина в корзину") + " (" + nShop + ")</button>" : "") +
      "</div>" +
      (nShop && SHOP && SHOP.cart ? '<p class="bld-hint">' + L("Sepete yalnız mağazada satılan kalemler eklenir; inverter, pano ve işçilik için WhatsApp'tan teklif alın.",
        "Only shop items go to the cart; for the inverter, panel box and labour, request a quote via WhatsApp.",
        "In den Warenkorb kommen nur Shop-Artikel; für Wechselrichter, Verteiler und Montage ein Angebot per WhatsApp anfordern.",
        "В корзину попадают только товары магазина; на инвертор, щит и монтаж запросите предложение в WhatsApp.") + "</p>" : "") +
      '<ul class="bld-trust">' +
        "<li>✔ " + L("Ücretsiz keşif ve kesin teklif", "Free site survey and binding quote", "Kostenlose Begehung und verbindliches Angebot", "Бесплатный выезд и точное предложение") + "</li>" +
        "<li>🔧 " + L("Antalya bölgesinde montaj ekibimizce kurulum", "Installed by our own team in the Antalya region", "Montage durch unser Team in der Region Antalya", "Монтаж нашей бригадой в регионе Антальи") + "</li>" +
        "<li>🔄 " + L("Sipariş öncesi ürün ve adetleri istediğiniz gibi değiştirebilirsiniz", "You can change products and quantities freely before ordering", "Produkte und Mengen vor der Bestellung frei änderbar", "До заказа можно свободно менять товары и количество") + "</li>" +
      "</ul></div>";
  }

  function viewSummary() {
    var r = bom();
    if (!r.lines.length || !r.need.count) {
      return '<div class="bld-card"><h2>' + L("Sipariş özeti", "Order summary", "Bestellübersicht", "Итог заказа") + "</h2><p>" +
        L("Önce cihazlarınızı ve ürünlerinizi seçin.", "Please select appliances and products first.", "Bitte zuerst Geräte und Produkte wählen.", "Сначала выберите приборы и товары.") + "</p></div>";
    }
    var prod = dailyProdKwh(r.instKwp), needK = r.need.dailyWh / 1000;
    var enough = prod + 1e-9 >= needK;
    var row = function (l) {
      var nm = l.shop && l.url ? '<a href="' + l.url + '">' + l.name + "</a>" : l.name;
      return "<tr><td>" + nm + "</td><td>" + nf1(l.qty) + " " + l.unit + "</td><td>" + money(l.price) + "</td><td><b>" + money(l.sum) + "</b></td></tr>";
    };
    var section = function (title, lines, sub) {
      if (!lines.length) return "";
      return '<tr class="bld-bom-sec"><th colspan="4" scope="colgroup">' + title + "</th></tr>" + lines.map(row).join("") +
        '<tr class="bld-bom-sub"><td colspan="3">' + L("Ara toplam", "Subtotal", "Zwischensumme", "Подытог") + "</td><td><b>" + money(sub) + "</b></td></tr>";
    };
    var shopL = r.lines.filter(function (l) { return l.shop; }),
      firmL = r.lines.filter(function (l) { return !l.shop && !l.est; }),
      estL = r.lines.filter(function (l) { return l.est; });
    return '<div class="bld-card"><h2>' + L("Sipariş özeti", "Order summary", "Bestellübersicht", "Итог заказа") + "</h2>" +
      '<div class="bld-sum-top"><div><span>' + L("Kurulu güç", "Installed power", "Installierte Leistung", "Установленная мощность") + "</span><strong>" + nf2(r.instKwp) + " kWp</strong></div>" +
      "<div><span>" + L("Günlük üretim (kış, tahmini)", "Daily yield (winter, est.)", "Tagesertrag (Winter, ca.)", "Суточная выработка (зима, оценка)") + "</span><strong>" + nf1(prod) + " kWh</strong></div>" +
      "<div><span>" + L("Günlük ihtiyacınız", "Your daily need", "Ihr Tagesbedarf", "Ваша суточная потребность") + "</span><strong>" + nf2(needK) + " kWh</strong></div></div>" +
      '<p class="bld-cov-line">' + covHtml({ ok: enough, text: enough
        ? L("Üretim günlük ihtiyacınızı karşılıyor", "Production covers your daily need", "Die Erzeugung deckt Ihren Tagesbedarf", "Выработка покрывает суточную потребность")
        : L("Üretim ihtiyacın altında; panel adedini artırın", "Production is below your need; add panels", "Erzeugung unter Bedarf; mehr Module wählen", "Выработка ниже потребности; добавьте панели") }) + "</p>" +
      '<div class="bld-table-wrap"><table class="bld-table bld-bom"><thead><tr><th>' + L("Ürün / hizmet", "Item", "Position", "Позиция") + "</th><th>" +
        L("Miktar", "Qty", "Menge", "Кол-во") + "</th><th>" + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</th><th>" + L("Tutar", "Total", "Summe", "Сумма") + "</th></tr></thead>" +
      "<tbody>" +
        section("🛒 " + L("Mağazada satışta · fiyat kesin", "Sold in our shop · firm price", "Im Shop erhältlich · fester Preis", "В продаже в магазине · цена точная"), shopL, r.shopList) +
        section("📋 " + L("Teklifle satılan · liste fiyatı", "Sold on quote · list price", "Auf Angebot · Listenpreis", "По запросу · прайсовая цена"), firmL, r.firm) +
        section("🔧 " + L("Keşifle netleşecek · tahmini", "Confirmed after survey · estimate", "Nach Prüfung bestätigt · Schätzung", "Уточняется после выезда · оценка"), estL, r.est) +
      "</tbody><tfoot><tr><td colspan=\"3\">" + (r.est ? L("Tahmini toplam", "Estimated total", "Geschätzte Summe", "Итого (оценка)") : L("Toplam", "Total", "Summe", "Итого")) +
        "</td><td><b>" + money(r.total) + "</b></td></tr></tfoot></table></div>" +
      priceBox(r) +
      '<p class="bld-note">' + L("Mağaza ürünlerinin fiyatı mağazayla aynıdır (KDV dahil, kargo hariç). İnverter liste fiyatıyla teklifle satılır. Pano, konstrüksiyon ve işçilik tahminidir; kesin teklif ücretsiz keşif sonrası verilir.",
        "Shop products carry the same price as the shop (VAT included, shipping excluded). The inverter is sold on quote at its list price. Panel box, mounting and labour are estimates; a binding quote follows the free site survey.",
        "Shop-Produkte kosten dasselbe wie im Shop (inkl. MwSt., zzgl. Versand). Der Wechselrichter wird zum Listenpreis auf Angebot verkauft. Verteiler, Gestell und Montage sind Schätzungen; ein verbindliches Angebot folgt nach der kostenlosen Vor-Ort-Analyse.",
        "Товары магазина по той же цене, что и в магазине (с НДС, без доставки). Инвертор продаётся по запросу по прайсовой цене. Щит, конструкция и монтаж — оценка; точное предложение после бесплатного выезда.") + "</p>" +
      '<div class="bld-actions">' +
      '<button class="btn btn-ghost btn-lg" type="button" id="bldPrint">🖨️ ' + L("Yazdır / PDF", "Print / PDF", "Drucken / PDF", "Печать / PDF") + "</button>" +
      '<button class="btn btn-ghost btn-lg" type="button" id="bldReset">' + L("Baştan başla", "Start over", "Neu beginnen", "Начать заново") + "</button></div></div>";
  }

  function waText(r) {
    r = r || bom();
    var lines = [];
    var item = function (l) { return "• " + l.name + " × " + nf1(l.qty) + " " + l.unit + (l.est ? " ≈ " : " = ") + money(l.sum); };
    lines.push(L("Sistem Kurucu siparişi", "System Builder order", "Systemkonfigurator-Bestellung", "Заказ из конфигуратора") + ":");
    lines.push(L("Kullanım", "Use case", "Einsatz", "Сценарий") + ": " + (presetLabel() || "-"));
    lines.push(L("Günlük ihtiyaç", "Daily need", "Tagesbedarf", "Суточная потребность") + ": " + nf2(r.need.dailyWh / 1000) + " kWh · " +
      L("tepe", "peak", "Spitze", "пик") + " " + nf(r.need.peakW) + " W");
    lines.push(L("Kurulu güç", "Installed power", "Installierte Leistung", "Мощность") + ": " + nf2(r.instKwp) + " kWp");
    var shopL = r.lines.filter(function (l) { return l.shop; }),
      firmL = r.lines.filter(function (l) { return !l.shop && !l.est; }),
      estL = r.lines.filter(function (l) { return l.est; });
    if (shopL.length) {
      lines.push(""); lines.push(L("Mağaza ürünleri", "Shop products", "Shop-Produkte", "Товары магазина") + ":");
      shopL.forEach(function (l) { lines.push(item(l)); });
      lines.push(L("Ara toplam", "Subtotal", "Zwischensumme", "Подытог") + ": " + money(r.shopList) +
        (r.shopCart < r.shopList ? " (" + L("havale/EFT ile", "by bank transfer", "per Überweisung", "переводом") + " " + money(r.shopCart) + ")" : ""));
    }
    if (firmL.length) {
      lines.push(""); lines.push(L("Teklifle satılan (liste fiyatı)", "Sold on quote (list price)", "Auf Angebot (Listenpreis)", "По запросу (прайсовая цена)") + ":");
      firmL.forEach(function (l) { lines.push(item(l)); });
    }
    if (estL.length) {
      lines.push(""); lines.push(L("Keşifle netleşecek (tahmini)", "Confirmed after survey (estimate)", "Nach Prüfung bestätigt (Schätzung)", "Уточняется после выезда (оценка)") + ":");
      estL.forEach(function (l) { lines.push(item(l)); });
    }
    lines.push("");
    lines.push((r.est ? L("Tahmini toplam", "Estimated total", "Geschätzte Summe", "Итого (оценка)") : L("Toplam", "Total", "Summe", "Итого")) + ": " + money(r.total));
    var appl = Object.keys(state.items).filter(function (id) { return state.items[id] && appById[id]; })
      .map(function (id) { return T(appById[id].name) + " ×" + state.items[id]; });
    if (appl.length) { lines.push(""); lines.push(L("Cihazlar", "Appliances", "Geräte", "Приборы") + ": " + appl.join(", ")); }
    lines.push("");
    lines.push(L("Ücretsiz keşif ve kesin teklif talep ediyorum.", "I'd like a free site survey and a binding quote.",
      "Ich möchte eine kostenlose Vor-Ort-Analyse und ein verbindliches Angebot.", "Прошу бесплатный выезд и точное предложение."));
    return lines.join("\n");
  }
  function presetLabel() { var p = presetById(state.preset); return p ? T(p.label) : ""; }

  // Mağaza kalemlerini sepete yazar: adet kurucudakine EŞİTLENİR (iki tıklama çift eklemesin)
  function toCart() {
    if (!SHOP || !SHOP.cart) return;
    var n = 0;
    bom().lines.forEach(function (l) {
      if (!l.shop || !l.pkg) return;
      var p = pkgOf(l.pkg), q = Math.max(1, Math.round(l.qty));
      if (p && p.stock != null) q = Math.min(q, p.stock);
      if (q > 0) { SHOP.cart.setQty(l.pkg, q); n++; }
    });
    if (n) location.href = "sepet.html";
  }

  /* ---- Render + olaylar ---- */
  function render() {
    var body = state.step === 1 ? viewPreset()
      : state.step === 2 ? viewAppliances()
      : state.step === 3 ? viewRecommend()
      : state.step === 4 ? viewSelect() : viewSummary();

    var need = calc();
    var canNext = state.step === 1 ? !!state.preset : (state.step === 2 || state.step === 3 ? need.count > 0 : true);
    var nextTxt = state.step === 3 ? L("Bu sistemle devam et", "Continue with this system", "Mit dieser Anlage weiter", "Продолжить с этой системой")
      : state.step === 4 ? L("Sipariş özetine geç", "Go to order summary", "Zur Bestellübersicht", "К итогу заказа")
      : L("Devam et", "Continue", "Weiter", "Далее");
    var nav = '<div class="bld-nav">' +
      (state.step > 1 ? '<button class="btn btn-ghost" type="button" id="bldPrev">← ' + L("Geri", "Back", "Zurück", "Назад") + "</button>" : "<span></span>") +
      (state.step < 5 ? '<button class="btn" type="button" id="bldNext"' + (canNext ? "" : " disabled") + ">" + nextTxt + " →</button>" : "<span></span>") + "</div>";

    root.innerHTML = stepNav() + body + nav;
    // Açık akordeon gövdelerine gerçek yükseklik ver (animasyonsuz ilk çizim)
    $$(".bld-acc.open .bld-acc-body", root).forEach(function (el) { el.style.maxHeight = el.scrollHeight + "px"; });
    if (state.step === 3) { var sel = $("#bldAuto"); if (sel) sel.value = String(state.autonomy); }
    save();
  }
  function goStep(n) {
    state.step = Math.max(1, Math.min(5, n));
    render();
    window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  }

  function applyPreset(id) {
    state.preset = id;
    state.items = {}; state.hours = {};
    if (id !== "__bos__") {
      var p = presetById(id);
      if (p) Object.keys(p.items).forEach(function (k) { state.items[k] = p.items[k]; });
    }
    useRecommended();
  }
  // Önerilen sisteme dön: model seçimleri ve elle adetler sıfırlanır (kalem aç/kapa kalır)
  function useRecommended() { state.sel = {}; state.pinned = {}; state.qty = {}; state.exQty = {}; }

  root.addEventListener("click", function (e) {
    var accBtn = e.target.closest("[data-acc]");
    if (accBtn) {
      var key = accBtn.getAttribute("data-acc");
      var box = accBtn.parentNode, bodyEl = $(".bld-acc-body", box);
      var willOpen = !box.classList.contains("open");
      box.classList.toggle("open", willOpen);
      accBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      bodyEl.style.maxHeight = willOpen ? bodyEl.scrollHeight + "px" : "0px";
      state.open[key] = willOpen;
      save();
      // Açılan liste ekranın dışında kalmasın: açılma bitince başlığı üst çubuğun altına getir
      if (willOpen) setTimeout(function () {
        var rect = accBtn.getBoundingClientRect();
        if (rect.top < 88 || rect.top > window.innerHeight - 140) {
          window.scrollTo({ top: window.scrollY + rect.top - 96, behavior: "smooth" });
        }
      }, 360);
      return;
    }
    var t = e.target.closest("[data-preset],[data-goto],[data-inc],[data-dec],[data-hinc],[data-hdec],[data-qinc],[data-qdec],[data-qauto],#bldNext,#bldPrev,#bldPrint,#bldReset,#bldToCart");
    if (!t) return;
    if (t.hasAttribute("data-preset")) { applyPreset(t.getAttribute("data-preset")); goStep(2); return; }
    if (t.hasAttribute("data-goto")) { goStep(+t.getAttribute("data-goto")); return; }
    if (t.hasAttribute("data-inc") || t.hasAttribute("data-dec")) {
      // Yerinde güncelle: yeniden çizim sayfayı zıplatır, odak kaybolur
      var id = t.getAttribute("data-inc") || t.getAttribute("data-dec");
      state.items[id] = Math.max(0, Math.min(99, (state.items[id] || 0) + (t.hasAttribute("data-inc") ? 1 : -1)));
      state.qty = {};
      var qi = $('[data-qty="' + id + '"]', root); if (qi) qi.value = state.items[id];
      softUpdate(); return;
    }
    if (t.hasAttribute("data-hinc") || t.hasAttribute("data-hdec")) {
      var hid = t.getAttribute("data-hinc") || t.getAttribute("data-hdec");
      state.hours[hid] = Math.max(0, Math.min(24, hoursOf(hid) + (t.hasAttribute("data-hinc") ? 1 : -1)));
      state.qty = {};
      var hi = $('[data-h="' + hid + '"]', root); if (hi) hi.value = nf1(state.hours[hid]);
      softUpdate(); return;
    }
    if (t.hasAttribute("data-qinc") || t.hasAttribute("data-qdec")) {
      // Satır içindeki buton, sarmalayan <label>'ın seçimini değiştirmesin
      e.preventDefault();
      var key = t.getAttribute("data-qinc") || t.getAttribute("data-qdec");
      var st = stepOfKey(key);
      setQtyKey(key, roundQ(qtyOfKey(key) + (t.hasAttribute("data-qinc") ? 1 : -1) * st, st));
      softSelect(); return;
    }
    if (t.hasAttribute("data-qauto")) { e.preventDefault(); clearQtyKey(t.getAttribute("data-qauto")); softSelect(); return; }
    if (t.id === "bldNext") {
      if (state.step === 3) { useRecommended(); goStep(5); } else goStep(state.step + 1);
      return;
    }
    if (t.id === "bldPrev") { goStep(state.step - 1); return; }
    if (t.id === "bldPrint") { window.print(); return; }
    if (t.id === "bldToCart") { toCart(); return; }
    if (t.id === "bldReset") { state = fresh(); goStep(1); return; }
  });

  root.addEventListener("input", function (e) {
    var el = e.target;
    if (!el.hasAttribute) return;
    if (el.hasAttribute("data-qty")) {
      var n = parseInt(el.value, 10);
      state.items[el.getAttribute("data-qty")] = isFinite(n) ? Math.max(0, Math.min(99, n)) : 0;
      state.qty = {}; softUpdate(); return;
    }
    if (el.hasAttribute("data-h")) {
      var v = parseQ(el.value);
      if (!isFinite(v)) return; // boşken durum bozulmasın; blur'da (change) düzeltilir
      state.hours[el.getAttribute("data-h")] = Math.max(0, Math.min(24, v));
      state.qty = {}; softUpdate(); return;
    }
    if (el.hasAttribute("data-qset")) {
      var q = parseQ(el.value);
      if (isFinite(q) && q > 0) { setQtyKey(el.getAttribute("data-qset"), q); softSelect(true); }
      return; // boş/geçersizken durum bozulmasın; blur'da (change) düzeltilir
    }
  });

  // Cihaz adet/saat değişiminde tabloyu yeniden çizmeden özeti güncelle (odak kaybolmasın)
  function softUpdate() {
    var need = calc();
    var live = $(".bld-live", root);
    if (live) {
      var vals = $$("strong", live);
      if (vals[0]) vals[0].textContent = nf(need.count);
      if (vals[1]) vals[1].textContent = nf2(need.dailyWh / 1000) + " kWh";
      if (vals[2]) vals[2].textContent = nf(need.peakW) + " W";
    }
    $$("[data-app]", root).forEach(function (row) {
      var id = row.getAttribute("data-app"), a = appById[id];
      if (!a) return;
      var n = state.items[id] || 0, h = hoursOf(id);
      row.classList.toggle("on", !!n);
      var wh = $(".bld-wh", row); if (wh) wh.textContent = n ? nf(a.w * n * h) + " Wh" : "—";
    });
    var nx = $("#bldNext"); if (nx) nx.disabled = !(need.count > 0);
    save();
  }

  /* ---- 4. adım: seçim/adet değişimini yeniden çizmeden yansıt (odak korunur) ---- */
  function syncQtyCell(row, active, key, q, autoV, unit, step, label, typing) {
    var cell = $(".bld-row-qty", row); if (!cell) return;
    row.classList.toggle("has-qty", !!active); // mobilde adet kutusu kendi satırına iner
    var inp = $("input[data-qset]", cell);
    if (!active || !inp) { cell.innerHTML = qtyCellHtml(active, key, q, autoV, unit, step, label); return; }
    // yazarken kullanıcının kutusuna dokunma; buton/seçim kaynaklı değişimde güncelle
    if (!(typing && inp === doc.activeElement)) inp.value = nf1(q);
    // Düğümü gereksiz yere DEĞİŞTİRME: aynı tıklamada basılan buton yok olursa click olayı düşer
    var slot = $(".bld-row-auto", cell);
    if (!slot) return;
    var want = q !== autoV, btn = $("[data-qauto]", slot);
    if (want && !btn) slot.innerHTML = autoLink(key, autoV, unit);
    else if (!want && btn) slot.innerHTML = "";
    else if (want && btn && btn.textContent !== autoLabel(autoV, unit)) btn.textContent = autoLabel(autoV, unit);
  }
  function setHead(key, sum) {
    var head = $('[data-acc="' + key + '"] .bld-acc-sum', root);
    if (!head) return;
    var b = $("b", head), s = $("small", head);
    if (b) b.textContent = sum.b;
    if (s) s.innerHTML = sum.s;
  }

  function softSelect(typing) {
    if (state.step !== 4) return;
    var need = calc();
    var r = bom(); // ensureDefaults: seçilmemiş tür yeniden önerilir
    var u = uAdet();

    TYPES.forEach(function (type) { setHead(type, accSum(type, r)); });
    setHead("extras", exSum(r));

    $$(".bld-row-pick", root).forEach(function (row) {
      var type = row.getAttribute("data-rowid");
      var inp = $("input[data-sel]", row); if (!inp) return;
      var it = pick(type, inp.value); if (!it) return;
      var on = state.sel[type] === it.id;   // otomatik öneri değişmiş olabilir
      if (inp.checked !== on) inp.checked = on;
      row.classList.toggle("sel", on);
      var autoV = autoQtyFor(type, it, need);
      var q = on ? qtyOf(type, need) : autoV;
      syncQtyCell(row, on, type, q, autoV, u, 1, it.name, typing);
      var sm = $(".bld-row-sum", row); if (sm) sm.textContent = money(it.price * q);
    });
    $$(".bld-row-check", root).forEach(function (row) {
      var x = extraById((row.getAttribute("data-rowid") || "").slice(2)); if (!x) return;
      var on = extraOn(x);
      var autoV = extraAutoQty(x, r.panelQty, r.instKwp);
      var q = on ? extraQtyOf(x, r.panelQty, r.instKwp) : autoV;
      syncQtyCell(row, on, "x:" + x.id, q, autoV, T(x.unitName), extraStep(x), x.name, typing);
      var sm = $(".bld-row-sum", row); if (sm) sm.textContent = money(x.price * q);
    });

    var bar = $("#bldCart", root); if (bar) bar.innerHTML = totalBar(r);
    $$(".bld-acc.open .bld-acc-body", root).forEach(function (el) { el.style.maxHeight = el.scrollHeight + "px"; });
    save();
  }

  root.addEventListener("change", function (e) {
    var el = e.target;
    if (!el.hasAttribute) return;
    if (el.hasAttribute("data-sel")) {
      // Müşteri modeli kendisi seçti: artık otomatik öneriyle değişmez
      var ty = el.getAttribute("data-sel");
      state.sel[ty] = el.value; state.pinned[ty] = true; state.qty[ty] = null;
      softSelect(); return;
    }
    if (el.hasAttribute("data-extra")) {
      state.extras[el.getAttribute("data-extra")] = el.checked;
      var row2 = el.closest(".bld-row"); if (row2) row2.classList.toggle("sel", el.checked);
      softSelect(); return;
    }
    // Odak çıkınca değeri normalle — yeniden ÇİZME: aynı tıklamada basılan butonu yok eder
    if (el.hasAttribute("data-qset")) {
      var key = el.getAttribute("data-qset");
      var v = parseQ(el.value);
      if (!isFinite(v) || v <= 0) clearQtyKey(key); // boş/geçersiz → otomatik adede dön
      else setQtyKey(key, roundQ(v, stepOfKey(key)));
      softSelect(); return;
    }
    if (el.hasAttribute("data-qty")) { el.value = state.items[el.getAttribute("data-qty")] || 0; return; }
    if (el.hasAttribute("data-h")) { el.value = nf1(hoursOf(el.getAttribute("data-h"))); return; }
    if (el.id === "bldAuto") { state.autonomy = parseInt(el.value, 10) || 1; state.qty = {}; render(); return; }
  });

  doc.addEventListener("gespa:lang", render);

  // URL ile ön seçim: sistem-kur.html?tip=bagevi
  var m = /[?&]tip=([a-z0-9_-]+)/i.exec(location.search);
  if (m) {
    var pid = m[1].toLowerCase();
    // Kayıtlı bir oturum aynı senaryodaysa ilerlemeyi koru (yenilemede başa dönme)
    var samePreset = state.preset === pid && Object.keys(state.items || {}).length;
    if (!samePreset && presetById(pid)) { applyPreset(pid); state.step = 2; }
  }
  render();
})();
