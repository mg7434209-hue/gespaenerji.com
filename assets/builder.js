/* ============================================================
   GESPA Enerji — Sistem Kurucu (sistem-kur.html)
   "İhtiyaçtan siparişe" sihirbazı: cihaz seçimi → ihtiyaç hesabı
   (panel/akü/inverter) → marka-model seçimi → sipariş özeti.
   TÜM katsayı, cihaz ve fiyatlar: window.GESPA.config.builder
   (koda hiçbir sayı gömülmez — CLAUDE.md kuralı).
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

  var nf = function (n) { return new Intl.NumberFormat("tr-TR").format(Math.round(n)); };
  var nf1 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n); };
  var nf2 = function (n) { return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n); };
  var money = function (n) { return "₺" + nf(n); };
  // Havale/EFT indirimi: site geneli oran (config.cartDiscountPct) — builder'a özel
  // oran gerekirse config.builder.commerce.havaleDiscountPct ile ezilir. 0 = satır gizli.
  var HAV = (B.commerce && B.commerce.havaleDiscountPct != null ? +B.commerce.havaleDiscountPct : +CFG.cartDiscountPct) || 0;
  var havale = function (n) { return n * (1 - HAV / 100); };
  // Adet kutusuna yazılan metni sayıya çevir (hem "2,2" hem "2.2" kabul edilir)
  var parseQ = function (v) { return parseFloat(String(v).replace(/\s/g, "").replace(",", ".")); };

  /* ---- Durum (localStorage'da saklanır; yenilemede kaybolmaz) ---- */
  var LSKEY = "gespa-builder";
  var state = { step: 1, preset: "", items: {}, hours: {}, sel: {}, extras: {}, qty: {}, exQty: {}, open: { panel: true }, autonomy: SZ.autonomyDays || 1 };
  try {
    var saved = JSON.parse(localStorage.getItem(LSKEY) || "null");
    if (saved && saved.items) state = Object.assign(state, saved);
  } catch (e) {}
  function save() { try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {} }

  var appById = {};
  B.appliances.forEach(function (a) { appById[a.id] = a; });

  /* ============================================================
     HESAP MOTORU
     dailyWh   = Σ (güç × adet × saat)
     tepeGüç   = Σ (güç × adet) × eşzamanlılık  (+ en büyük kalkış payı)
     gerekliKwp= dailyWh / (tasarımGüneşSaati × sistemVerimi × 1000)
     aküKwh    = dailyWh × özerklikGünü / (DoD × inverterVerimi × 1000)
     inverterKw= tepeGüç × sürgePayı / 1000
     ============================================================ */
  function calc() {
    var dailyWh = 0, runW = 0, maxSurgeExtra = 0, count = 0;
    Object.keys(state.items).forEach(function (id) {
      var a = appById[id], q = state.items[id];
      if (!a || !q) return;
      var h = state.hours[id] != null ? state.hours[id] : a.h;
      dailyWh += a.w * q * h;
      runW += a.w * q;
      var extra = a.w * ((a.surge || 1) - 1);
      if (extra > maxSurgeExtra) maxSurgeExtra = extra;
      count += q;
    });
    var peakW = runW * (SZ.simultaneity || 0.7) + maxSurgeExtra;
    var kwp = dailyWh / ((SZ.sunHours || 4.5) * (SZ.systemEff || 0.75) * 1000);
    var batKwh = (dailyWh * (state.autonomy || 1)) / ((SZ.dod || 0.9) * (SZ.invEff || 0.92) * 1000);
    var invKw = Math.max(SZ.minInverterKw || 1, (peakW * (SZ.surgeMargin || 1.3)) / 1000);
    // Aküden çekilmesi gereken net enerji (kWh) — model DoD'una bölünerek adet bulunur
    var usableKwh = (dailyWh * (state.autonomy || 1)) / ((SZ.invEff || 0.92) * 1000);
    return { dailyWh: dailyWh, runW: runW, peakW: peakW, kwp: kwp, batKwh: batKwh, usableKwh: usableKwh, invKw: invKw, count: count };
  }

  /* ---- Seçilen ürünlere göre malzeme listesi (BOM) ---- */
  function pick(type, id) {
    var arr = B.catalog[type] || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  // Önerilen model: ihtiyacı karşılayan en uygun ürün (seçim yapılmadıysa varsayılan)
  function recommend(type, need) {
    var arr = B.catalog[type] || [];
    if (!arr.length) return null;
    if (type === "inverter") {
      var fit = arr.filter(function (p) { return p.kw >= need.invKw; }).sort(function (a, b) { return a.kw - b.kw; })[0];
      return (fit || arr.slice().sort(function (a, b) { return b.kw - a.kw; })[0]).id;
    }
    if (type === "panel") return arr.slice().sort(function (a, b) { return b.w - a.w; })[0].id;
    var li = arr.filter(function (p) { return /LiFePO/i.test(p.chem || ""); }).sort(function (a, b) { return b.kwh - a.kwh; })[0];
    return (li || arr[0]).id;
  }
  // Seçim yapılmamışsa önerilenleri ata (adet hesapları buna bağlı)
  function ensureDefaults(need) {
    ["panel", "battery", "inverter"].forEach(function (type) {
      if (!state.sel[type] || !pick(type, state.sel[type])) state.sel[type] = recommend(type, need);
    });
  }
  function autoQty(type, need) {
    var p = pick(type, state.sel[type]);
    if (!p) return 0;
    if (type === "panel") return Math.max(1, Math.ceil((need.kwp * 1000) / p.w));
    if (type === "battery") return Math.max(1, Math.ceil(need.usableKwh / (p.kwh * (p.dod || SZ.dod || 0.9))));
    return 1;
  }
  function qtyOf(type, need) {
    var manual = state.qty[type];
    return manual != null && manual > 0 ? manual : autoQty(type, need);
  }
  // Ek malzeme önerilen miktarı: panel sayısına / kablo metrajına / kurulu güce bağlı
  function extraAutoQty(x, panelQty, instKwp) {
    if (x.qty === "perPanel") return panelQty;
    if (x.qty === "perCableMeter") return panelQty * (SZ.cableMetersPerPanel || 4);
    if (x.qty === "perKwp") return Math.max(1, Math.round(instKwp * 10) / 10);
    return 1;
  }
  // Müşteri elle değiştirdiyse onun adedi geçerlidir
  function extraQtyOf(x, panelQty, instKwp) {
    var m = state.exQty[x.id];
    return m != null && m > 0 ? m : extraAutoQty(x, panelQty, instKwp);
  }
  function extraStep(x) { return x.qty === "perKwp" ? 0.1 : 1; }
  function extraOn(x) { return state.extras[x.id] != null ? state.extras[x.id] : !!x.on; }
  function extraById(id) {
    var arr = B.catalog.extras || [];
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
  // Miktarın nereden geldiğini müşteriye açıklayan kısa not
  function extraNote(x) {
    if (x.qty === "perPanel") return L("Her panel için", "Per panel", "Pro Modul", "На каждую панель");
    if (x.qty === "perCableMeter") {
      var m = nf1(SZ.cableMetersPerPanel || 4);
      return L("Panel başına " + m + " m", m + " m per panel", m + " m pro Modul", m + " м на панель");
    }
    if (x.qty === "perKwp") return L("Kurulu kWp başına", "Per installed kWp", "Pro installiertem kWp", "На кВт·п мощности");
    return L("Sistem başına tek", "One per system", "Einmal pro Anlage", "Один на систему");
  }

  function bom() {
    var need = calc();
    ensureDefaults(need);
    var lines = [], total = 0;
    ["panel", "battery", "inverter"].forEach(function (type) {
      var p = pick(type, state.sel[type]);
      if (!p) return;
      var q = qtyOf(type, need);
      var sum = p.price * q;
      total += sum;
      lines.push({ type: type, name: p.brand + " " + T(p.name), qty: q, unit: L("adet", "pcs", "Stk.", "шт."), price: p.price, sum: sum });
    });
    // Kurulu güç ve kablo miktarı seçilen panele göre
    var pnl = pick("panel", state.sel.panel);
    var panelQty = pnl ? qtyOf("panel", need) : 0;
    var instKwp = pnl ? (panelQty * pnl.w) / 1000 : need.kwp;
    (B.catalog.extras || []).forEach(function (x) {
      if (!extraOn(x)) return;
      var q = extraQtyOf(x, panelQty, instKwp);
      if (!q) return;
      var sum = x.price * q;
      total += sum;
      lines.push({ type: "extra", id: x.id, name: T(x.name), qty: q, unit: x.unit, price: x.price, sum: sum });
    });
    return { need: need, lines: lines, total: total, instKwp: instKwp, panelQty: panelQty };
  }

  /* ============================================================
     ARAYÜZ
     ============================================================ */
  function stepNav() {
    var steps = [
      L("Kullanım yeri", "Use case", "Einsatzort", "Сценарий"),
      L("Cihazlar", "Appliances", "Geräte", "Приборы"),
      L("İhtiyacınız", "Your needs", "Ihr Bedarf", "Ваша потребность"),
      L("Ürün seçimi", "Choose products", "Produktauswahl", "Выбор товаров"),
      L("Sipariş özeti", "Order summary", "Bestellübersicht", "Итог заказа")
    ];
    return '<ol class="bld-steps">' + steps.map(function (s, i) {
      var n = i + 1;
      var cls = n === state.step ? " active" : (n < state.step ? " done" : "");
      return '<li class="bld-step' + cls + '"><button type="button" data-goto="' + n + '"' + (n > state.step ? " disabled" : "") + '><em>' + n + "</em><span>" + s + "</span></button></li>";
    }).join("") + "</ol>";
  }

  function viewPreset() {
    return '<div class="bld-card"><h2>' + L("Sistemi nerede kullanacaksınız?", "Where will you use the system?", "Wo setzen Sie die Anlage ein?", "Где будет использоваться система?") + "</h2>" +
      '<p class="bld-lead">' + L("Bir kullanım yeri seçin — tipik cihaz listesi hazır gelsin. Sonraki adımda her cihazı değiştirebilirsiniz.",
        "Pick a use case — a typical appliance list is preloaded. You can edit everything in the next step.",
        "Wählen Sie einen Einsatzort — eine typische Geräteliste wird vorbereitet. Im nächsten Schritt alles anpassbar.",
        "Выберите сценарий — типовой список приборов подставится. На следующем шаге всё можно изменить.") + "</p>" +
      '<div class="bld-presets">' + B.presets.map(function (p) {
        return '<button type="button" class="bld-preset' + (state.preset === p.id ? " sel" : "") + '" data-preset="' + p.id + '">' +
          "<em>" + p.icon + "</em><strong>" + T(p.label) + "</strong><span>" + T(p.desc) + "</span></button>";
      }).join("") +
      '<button type="button" class="bld-preset bld-preset-blank" data-preset="__bos__"><em>✏️</em><strong>' +
        L("Sıfırdan başla", "Start from scratch", "Von vorn beginnen", "С нуля") + "</strong><span>" +
        L("Cihazları kendim seçeyim", "I'll pick appliances myself", "Geräte selbst wählen", "Выберу приборы сам") + "</span></button>" +
      "</div></div>";
  }

  function viewAppliances() {
    var need = calc();
    var groups = (B.groups || []).map(function (g) {
      var rows = B.appliances.filter(function (a) { return a.group === g.id; }).map(function (a) {
        var q = state.items[a.id] || 0;
        var h = state.hours[a.id] != null ? state.hours[a.id] : a.h;
        return '<tr class="' + (q ? "on" : "") + '">' +
          '<td class="bld-app"><em>' + a.icon + "</em><span>" + T(a.name) + "</span></td>" +
          "<td>" + a.w + " W</td>" +
          '<td><div class="bld-qty"><button type="button" data-dec="' + a.id + '" aria-label="' + L("Azalt", "Decrease", "Weniger", "Меньше") + '">−</button>' +
            '<input type="number" min="0" max="99" value="' + q + '" data-qty="' + a.id + '" aria-label="' + T(a.name) + " " + L("adet", "quantity", "Anzahl", "количество") + '" />' +
            '<button type="button" data-inc="' + a.id + '" aria-label="' + L("Artır", "Increase", "Mehr", "Больше") + '">+</button></div></td>' +
          '<td><input class="bld-h" type="number" min="0" max="24" step="0.5" value="' + h + '" data-h="' + a.id + '" aria-label="' + T(a.name) + " " + L("günlük saat", "hours per day", "Stunden/Tag", "часов в день") + '" /></td>' +
          '<td class="bld-wh">' + (q ? nf(a.w * q * h) + " Wh" : "—") + "</td></tr>";
      }).join("");
      return '<div class="bld-group"><h3>' + T(g.label) + "</h3><div class=\"bld-table-wrap\"><table class=\"bld-table\"><thead><tr>" +
        "<th>" + L("Cihaz", "Appliance", "Gerät", "Прибор") + "</th><th>" + L("Güç", "Power", "Leistung", "Мощность") + "</th>" +
        "<th>" + L("Adet", "Qty", "Anzahl", "Кол-во") + "</th><th>" + L("Saat/gün", "Hours/day", "Std./Tag", "Часов/день") + "</th>" +
        "<th>" + L("Günlük", "Daily", "Täglich", "В сутки") + "</th></tr></thead><tbody>" + rows + "</tbody></table></div></div>";
    }).join("");

    return '<div class="bld-card"><h2>' + L("Neleri çalıştıracaksınız?", "What will you run?", "Was soll betrieben werden?", "Что будет работать?") + "</h2>" +
      '<p class="bld-lead">' + L("Adetleri ve günlük çalışma saatlerini kendinize göre ayarlayın; hesap anında güncellenir.",
        "Adjust quantities and daily runtime; the calculation updates instantly.",
        "Passen Sie Anzahl und tägliche Laufzeit an; die Berechnung aktualisiert sich sofort.",
        "Измените количество и часы работы — расчёт обновится сразу.") + "</p>" +
      groups +
      '<div class="bld-live" role="status"><div><span>' + L("Seçili cihaz", "Selected", "Ausgewählt", "Выбрано") + '</span><strong>' + nf(need.count) + "</strong></div>" +
      "<div><span>" + L("Günlük tüketim", "Daily energy", "Tagesverbrauch", "Суточное потребление") + '</span><strong>' + nf2(need.dailyWh / 1000) + " kWh</strong></div>" +
      "<div><span>" + L("Anlık tepe güç", "Peak load", "Spitzenlast", "Пиковая нагрузка") + '</span><strong>' + nf(need.peakW) + " W</strong></div></div>" +
      "</div>";
  }

  function viewNeeds() {
    var need = calc();
    var rows = [
      { icon: "🔆", label: L("Gerekli panel gücü", "Required PV power", "Benötigte PV-Leistung", "Требуемая мощность ФЭМ"), val: nf1(need.kwp) + " kWp",
        note: L("Tasarım günü " + nf1(SZ.sunHours) + " güneş saati, sistem verimi %" + Math.round(SZ.systemEff * 100),
                "Design day " + nf1(SZ.sunHours) + " sun hours, system efficiency " + Math.round(SZ.systemEff * 100) + "%",
                "Auslegungstag " + nf1(SZ.sunHours) + " Sonnenstunden, Systemwirkungsgrad " + Math.round(SZ.systemEff * 100) + " %",
                "Расчётный день " + nf1(SZ.sunHours) + " ч солнца, КПД системы " + Math.round(SZ.systemEff * 100) + "%") },
      { icon: "🔋", label: L("Gerekli akü kapasitesi", "Required battery", "Benötigte Batterie", "Требуемый аккумулятор"), val: nf1(need.batKwh) + " kWh",
        note: L(nf(state.autonomy) + " gün özerklik · DoD %" + Math.round(SZ.dod * 100),
                nf(state.autonomy) + " day autonomy · DoD " + Math.round(SZ.dod * 100) + "%",
                nf(state.autonomy) + " Tag(e) Autonomie · DoD " + Math.round(SZ.dod * 100) + " %",
                "Автономия " + nf(state.autonomy) + " дн. · DoD " + Math.round(SZ.dod * 100) + "%") },
      { icon: "⚡", label: L("Gerekli inverter gücü", "Required inverter", "Benötigter Wechselrichter", "Требуемый инвертор"), val: nf1(need.invKw) + " kW",
        note: L("Tepe güç " + nf(need.peakW) + " W × kalkış payı " + nf1(SZ.surgeMargin),
                "Peak " + nf(need.peakW) + " W × surge margin " + nf1(SZ.surgeMargin),
                "Spitze " + nf(need.peakW) + " W × Anlaufreserve " + nf1(SZ.surgeMargin),
                "Пик " + nf(need.peakW) + " Вт × запас пуска " + nf1(SZ.surgeMargin)) }
    ];
    return '<div class="bld-card"><h2>' + L("İhtiyacınız", "Your requirement", "Ihr Bedarf", "Ваша потребность") + "</h2>" +
      '<p class="bld-lead">' + L("Girdiğiniz cihazlara göre hesaplanan minimum sistem. Bir sonraki adımda marka ve model seçeceksiniz.",
        "The minimum system for the appliances you entered. Next you'll choose brands and models.",
        "Mindestanlage für Ihre Geräte. Im nächsten Schritt wählen Sie Marke und Modell.",
        "Минимальная система под ваши приборы. Далее выберете бренд и модель.") + "</p>" +
      '<div class="bld-needs">' + rows.map(function (r) {
        return '<div class="bld-need"><em>' + r.icon + "</em><span>" + r.label + "</span><strong>" + r.val + "</strong><small>" + r.note + "</small></div>";
      }).join("") + "</div>" +
      '<div class="bld-field"><label for="bldAuto">' + L("Güneşsiz gün özerkliği", "Days of autonomy", "Autonomietage", "Дней автономии") + "</label>" +
      '<select id="bldAuto"><option value="1">1 ' + L("gün", "day", "Tag", "день") + '</option><option value="2">2 ' + L("gün", "days", "Tage", "дня") + '</option><option value="3">3 ' + L("gün", "days", "Tage", "дня") + "</option></select>" +
      '<p class="bld-hint">' + L("Daha uzun özerklik = daha büyük akü grubu ve daha yüksek maliyet.",
        "Longer autonomy = bigger battery bank and higher cost.",
        "Längere Autonomie = größerer Speicher und höhere Kosten.",
        "Больше автономии = больше аккумуляторов и выше стоимость.") + "</p></div>" +
      '<p class="bld-note">' + L("Değerler tahminidir; kesin proje ücretsiz keşifle netleşir.",
        "Values are estimates; the final design is set after a free site survey.",
        "Werte sind Schätzungen; die endgültige Auslegung erfolgt nach der Vor-Ort-Analyse.",
        "Значения ориентировочные; итог определяется после бесплатного выезда.") + "</p></div>";
  }

  // Satır içi adet kutusu (− n +) — seçili/işaretli kalemlerde görünür
  function stepper(key, val, unit, step, label) {
    return '<span class="bld-qty bld-qty-sm">' +
      '<button type="button" data-qdec="' + key + '" aria-label="' + label + " " + L("azalt", "decrease", "weniger", "меньше") + '">−</button>' +
      '<input type="text" value="' + nf1(val) + '" data-qset="' + key + '" data-step="' + step + '" inputmode="decimal" autocomplete="off" aria-label="' + label + " " + L("adet", "quantity", "Anzahl", "количество") + '" />' +
      '<button type="button" data-qinc="' + key + '" aria-label="' + label + " " + L("artır", "increase", "mehr", "больше") + '">+</button>' +
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

  function listRows(type, need) {
    var arr = B.catalog[type] || [];
    var auto = recommend(type, need);
    var uAdet = L("adet", "pcs", "Stk.", "шт.");
    return arr.map(function (p) {
      var sel = state.sel[type] === p.id;
      var spec = type === "panel" ? p.w + " W"
        : type === "battery" ? nf2(p.kwh) + " kWh · " + p.chem + " · " + L("kullanılabilir", "usable", "nutzbar", "полезно") + " %" + Math.round((p.dod || SZ.dod || 0.9) * 100) + (p.cycles ? " · " + nf(p.cycles) + " " + L("çevrim", "cycles", "Zyklen", "циклов") : "")
        : p.kw + " kW · " + p.type;
      var autoV = autoQtyFor(type, p, need);
      var q = sel ? qtyOf(type, need) : autoV;
      var name = p.brand + " " + T(p.name);
      // Adet kutusu <label>'ın DIŞINDA durmalı: aksi hâlde + / − tıklaması seçimi değiştirir
      return '<div class="bld-row bld-row-pick' + (sel ? " sel qbox" : "") + '" data-rowid="' + type + '">' +
        '<label class="bld-row-hit">' +
          '<input type="radio" name="bld-' + type + '" value="' + p.id + '"' + (sel ? " checked" : "") + ' data-sel="' + type + '" aria-label="' + name + '" />' +
          '<span class="bld-row-mark" aria-hidden="true"></span>' +
          '<span class="bld-row-main"><span class="bld-row-title"><strong>' + p.brand + "</strong> " + T(p.name) +
            (p.id === auto ? ' <em class="bld-rec">' + L("Önerilen", "Recommended", "Empfohlen", "Рекомендуем") + "</em>" : "") + "</span>" +
            '<span class="bld-row-spec">' + spec + "</span></span>" +
          '<span class="bld-row-unit"><b>' + money(p.price) + "</b><small>/ " + uAdet + "</small></span>" +
        "</label>" +
        '<span class="bld-row-qty">' + qtyCellHtml(sel, type, q, autoV, uAdet, 1, name) + "</span>" +
        '<span class="bld-row-sum">' + money(p.price * q) + "</span></div>";
    }).join("");
  }
  function autoQtyFor(type, p, need) {
    if (type === "panel") return Math.max(1, Math.ceil((need.kwp * 1000) / p.w));
    if (type === "battery") return Math.max(1, Math.ceil(need.usableKwh / (p.kwh * (p.dod || SZ.dod || 0.9))));
    return 1;
  }

  function viewSelect() {
    var need = calc();
    ensureDefaults(need); // adet ve fiyatlar seçili modele bağlı — önce ata
    var meta = {
      panel: { icon: "🔆", title: L("Güneş Paneli", "Solar Panel", "Solarmodul", "Солнечная панель") },
      battery: { icon: "🔋", title: L("Akü / Batarya", "Battery", "Batterie", "Аккумулятор") },
      inverter: { icon: "⚡", title: L("İnverter", "Inverter", "Wechselrichter", "Инвертор") }
    };
    var uAdet = L("adet", "pcs", "Stk.", "шт.");

    function acc(key, icon, title, sumHtml, bodyHtml) {
      var open = !!state.open[key];
      return '<div class="bld-acc' + (open ? " open" : "") + '">' +
        '<button class="bld-acc-head" type="button" data-acc="' + key + '" aria-expanded="' + (open ? "true" : "false") + '" aria-controls="acc-' + key + '">' +
          '<span class="bld-acc-title"><em aria-hidden="true">' + icon + "</em>" + title + "</span>" +
          '<span class="bld-acc-sum">' + sumHtml + "</span>" +
          '<span class="bld-acc-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="bld-acc-body" id="acc-' + key + '"><div class="bld-acc-inner">' + bodyHtml + "</div></div></div>";
    }

    var out = '<div class="bld-card"><h2>' + L("Ürünlerinizi seçin", "Choose your products", "Wählen Sie Ihre Produkte", "Выберите товары") + "</h2>" +
      '<p class="bld-lead">' + L("Başlığa dokunarak listeyi açın; öneriler ihtiyacınıza göre işaretlendi. Marka ve modeli dilediğiniz gibi değiştirin, adetler otomatik hesaplanır.",
        "Tap a heading to open the list; recommendations are pre-selected for your needs. Change brand and model freely — quantities are calculated automatically.",
        "Tippen Sie auf eine Überschrift, um die Liste zu öffnen; Empfehlungen sind vorausgewählt. Marke und Modell frei änderbar — Mengen werden berechnet.",
        "Нажмите на заголовок, чтобы открыть список; рекомендации уже выбраны. Меняйте бренд и модель — количество считается автоматически.") + "</p>";

    ["panel", "battery", "inverter"].forEach(function (type) {
      var p = pick(type, state.sel[type]);
      var q = qtyOf(type, need);
      var sum = p ? '<b>' + p.brand + " " + T(p.name) + "</b><small>" + nf1(q) + " " + uAdet + " · " + money(p.price * q) + "</small>" : "";
      var body =
        '<div class="bld-list"><div class="bld-row bld-row-head" aria-hidden="true">' +
          '<span></span><span class="bld-row-main">' + L("Marka / model", "Brand / model", "Marke / Modell", "Бренд / модель") + "</span>" +
          '<span class="bld-row-unit">' + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</span>" +
          '<span class="bld-row-qty">' + L("Adet", "Qty", "Anzahl", "Кол-во") + "</span>" +
          '<span class="bld-row-sum">' + L("Tutar", "Total", "Summe", "Сумма") + "</span></div>" +
          listRows(type, need) + "</div>";
      out += acc(type, meta[type].icon, meta[type].title, sum, body);
    });

    // Kablo, pano ve işçilik — diğer kategorilerle aynı liste düzeni (çoklu seçim)
    var r = bom();
    var exBody =
      '<p class="bld-hint bld-hint-top">' + L("Sisteme dahil edilecek kalemler işaretlidir; ihtiyacınız olmayanların işaretini kaldırın. Adetler panel sayısına göre önerilir — dilediğiniz gibi değiştirebilirsiniz.",
        "Included items are ticked; untick what you don't need. Quantities are suggested from the panel count — change them as you like.",
        "Enthaltene Positionen sind angehakt; nicht Benötigtes abwählen. Mengen sind Vorschläge aus der Modulanzahl — frei änderbar.",
        "Отмеченные позиции входят в систему; снимите отметку с ненужных. Количество предлагается по числу панелей — можно изменить.") + "</p>" +
      '<div class="bld-list"><div class="bld-row bld-row-head" aria-hidden="true">' +
        '<span></span><span class="bld-row-main">' + L("Kalem / hizmet", "Item / service", "Position / Leistung", "Позиция / услуга") + "</span>" +
        '<span class="bld-row-unit">' + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</span>" +
        '<span class="bld-row-qty">' + L("Adet", "Qty", "Anzahl", "Кол-во") + "</span>" +
        '<span class="bld-row-sum">' + L("Tutar", "Total", "Summe", "Сумма") + "</span></div>" +
      (B.catalog.extras || []).map(function (x) {
        var on = extraOn(x);
        var autoV = extraAutoQty(x, r.panelQty, r.instKwp);
        var q = extraQtyOf(x, r.panelQty, r.instKwp);
        var u = T(x.unit);
        return '<div class="bld-row bld-row-check' + (on ? " sel qbox" : "") + '" data-rowid="x:' + x.id + '">' +
          '<label class="bld-row-hit">' +
            '<input type="checkbox" data-extra="' + x.id + '"' + (on ? " checked" : "") + ' aria-label="' + T(x.name) + '" />' +
            '<span class="bld-row-mark" aria-hidden="true"></span>' +
            '<span class="bld-row-main"><span class="bld-row-title"><strong>' + T(x.name) + "</strong></span>" +
              '<span class="bld-row-spec">' + extraNote(x) + "</span></span>" +
            '<span class="bld-row-unit"><b>' + money(x.price) + "</b><small>/ " + u + "</small></span>" +
          "</label>" +
          '<span class="bld-row-qty">' + qtyCellHtml(on, "x:" + x.id, q, autoV, u, extraStep(x), T(x.name)) + "</span>" +
          '<span class="bld-row-sum">' + money(x.price * q) + "</span></div>";
      }).join("") + "</div>";
    var exOn = 0, exSum = 0;
    r.lines.forEach(function (l) { if (l.type === "extra") { exOn++; exSum += l.sum; } });
    out += acc("extras", "🧰", L("Kablo, pano ve işçilik", "Cabling, panel box and labour", "Verkabelung, Verteiler und Montage", "Кабели, щит и монтаж"),
      "<b>" + exOn + " " + L("kalem seçili", "items selected", "Positionen gewählt", "позиций выбрано") + "</b><small>" + money(exSum) + "</small>", exBody);

    // Alınan ürünler — canlı liste ve toplam (her değişiklikte güncellenir)
    out += '<div class="bld-cart" id="bldCart">' + cartInner(r) + "</div>";

    return out + "</div>";
  }

  // Sepet içeriği (yeniden çizilebilir olsun diye ayrı)
  // Sepet fiyat kutusu — sipariş özetinde de aynısı kullanılır
  function priceBox(r, opts) {
    var wa = WA ? "https://wa.me/" + WA + "?text=" + encodeURIComponent(waText()) : "iletisim.html";
    var showTotal = !opts || opts.total !== false;   // 5. adımda toplam tabloda zaten var
    return '<div class="bld-price-box">' +
      (showTotal
        ? '<div class="bld-price-row"><span>' + L("Toplam (tahmini)", "Total (estimate)", "Gesamt (ca.)", "Итого (оценка)") +
          '</span><b class="bld-price">' + money(r.total) + "</b></div>" +
          '<p class="bld-price-note">' + L("KDV dahil tahmini liste fiyatıdır.", "Estimated list price incl. VAT.",
            "Geschätzter Listenpreis inkl. MwSt.", "Ориентировочная прейскурантная цена с НДС.") + "</p>"
        : "") +
      (HAV > 0 ? '<p class="bld-havale">💰 ' + L("Havale/EFT ile:", "By bank transfer:", "Per Überweisung:", "Банковским переводом:") +
        " <b>" + money(havale(r.total)) + "</b> (%" + nf1(HAV) + " " + L("indirimli", "off", "Rabatt", "скидка") + ")</p>" : "") +
      '<p class="bld-price-kwp">' + L("Kurulu güç", "Installed power", "Installierte Leistung", "Мощность") + " <b>" + nf1(r.instKwp) + " kWp</b></p>" +
      '<div class="bld-price-cta">' +
        '<a class="btn btn-lg" href="' + wa + '"' + (WA ? ' target="_blank" rel="noopener"' : "") + '>📲 ' +
          L("Siparişi WhatsApp'tan gönder", "Send order via WhatsApp", "Bestellung per WhatsApp senden", "Отправить заказ в WhatsApp") + "</a>" +
        (opts && opts.next ? '<button class="btn btn-ghost btn-lg" type="button" data-goto="5">' +
          L("Sipariş özetini gör", "See order summary", "Bestellübersicht ansehen", "Посмотреть итог заказа") + " →</button>" : "") +
      "</div>" +
      '<ul class="bld-trust">' +
        "<li>✔ " + L("Ücretsiz keşif ve kesin teklif", "Free site survey and binding quote", "Kostenlose Begehung und verbindliches Angebot", "Бесплатный выезд и точное предложение") + "</li>" +
        "<li>🔧 " + L("Antalya bölgesinde montaj ekibimizce kurulum", "Installed by our own team in the Antalya region", "Montage durch unser Team in der Region Antalya", "Монтаж нашей бригадой в регионе Антальи") + "</li>" +
        "<li>🔄 " + L("Sipariş öncesi ürün ve adetleri istediğiniz gibi değiştirebilirsiniz", "You can change products and quantities freely before ordering", "Produkte und Mengen vor der Bestellung frei änderbar", "До заказа можно свободно менять товары и количество") + "</li>" +
      "</ul></div>";
  }

  function cartInner(r) {
    if (!r.lines.length) {
      return '<h3 class="bld-cart-title">🧾 ' + L("Alınacak ürünler", "Your selection", "Ihre Auswahl", "Ваш выбор") + "</h3>" +
        '<p class="bld-hint">' + L("Henüz ürün seçilmedi.", "No products selected yet.", "Noch keine Produkte gewählt.", "Товары ещё не выбраны.") + "</p>";
    }
    var rows = r.lines.map(function (l) {
      return '<div class="bld-cart-row"><span class="bld-cart-name">' + l.name + "</span>" +
        '<span class="bld-cart-qty">' + nf1(l.qty) + " " + T(l.unit) + " × " + money(l.price) + "</span>" +
        '<b class="bld-cart-sum">' + money(l.sum) + "</b></div>";
    }).join("");
    return '<h3 class="bld-cart-title">🧾 ' + L("Alınacak ürünler", "Your selection", "Ihre Auswahl", "Ваш выбор") +
      ' <span class="bld-cart-count">' + r.lines.length + " " + L("kalem", "items", "Positionen", "позиций") + "</span></h3>" +
      '<div class="bld-cart-list">' + rows + "</div>" +
      priceBox(r, { next: true });
  }

  function viewSummary() {
    var r = bom();
    if (!r.lines.length) {
      return '<div class="bld-card"><h2>' + L("Sipariş özeti", "Order summary", "Bestellübersicht", "Итог заказа") + "</h2><p>" +
        L("Önce cihazlarınızı ve ürünlerinizi seçin.", "Please select appliances and products first.", "Bitte zuerst Geräte und Produkte wählen.", "Сначала выберите приборы и товары.") + "</p></div>";
    }
    var rows = r.lines.map(function (l) {
      return "<tr><td>" + l.name + "</td><td>" + nf1(l.qty) + " " + T(l.unit) + "</td><td>" + money(l.price) + "</td><td><b>" + money(l.sum) + "</b></td></tr>";
    }).join("");
    return '<div class="bld-card"><h2>' + L("Sipariş özeti", "Order summary", "Bestellübersicht", "Итог заказа") + "</h2>" +
      '<div class="bld-sum-top"><div><span>' + L("Kurulu güç", "Installed power", "Installierte Leistung", "Установленная мощность") + "</span><strong>" + nf1(r.instKwp) + " kWp</strong></div>" +
      "<div><span>" + L("Günlük üretim (tahmini)", "Daily yield (est.)", "Tagesertrag (ca.)", "Суточная выработка (оценка)") + "</span><strong>" +
        nf1(r.instKwp * (SZ.sunHours || 4.5) * (SZ.systemEff || 0.75)) + " kWh</strong></div>" +
      "<div><span>" + L("Günlük ihtiyacınız", "Your daily need", "Ihr Tagesbedarf", "Ваша суточная потребность") + "</span><strong>" + nf2(r.need.dailyWh / 1000) + " kWh</strong></div></div>" +
      '<div class="bld-table-wrap"><table class="bld-table bld-bom"><thead><tr><th>' + L("Ürün / hizmet", "Item", "Position", "Позиция") + "</th><th>" +
        L("Miktar", "Qty", "Menge", "Кол-во") + "</th><th>" + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</th><th>" + L("Tutar", "Total", "Summe", "Сумма") + "</th></tr></thead>" +
      "<tbody>" + rows + "</tbody><tfoot><tr><td colspan=\"3\">" + L("Toplam (tahmini)", "Total (estimate)", "Gesamt (ca.)", "Итого (оценка)") + "</td><td><b>" + money(r.total) + "</b></td></tr></tfoot></table></div>" +
      priceBox(r, { total: false }) +
      '<p class="bld-note">' + L("Fiyatlar tahmini liste fiyatlarıdır (KDV dahil); stok ve kur durumuna göre değişebilir. Kesin teklif ücretsiz keşif sonrası verilir.",
        "Prices are estimated list prices (VAT included) and may change with stock and exchange rates. A binding quote follows the free site survey.",
        "Preise sind geschätzte Listenpreise (inkl. MwSt.) und können sich ändern. Ein verbindliches Angebot folgt nach der Vor-Ort-Analyse.",
        "Цены ориентировочные (с НДС) и могут меняться. Точное предложение — после бесплатного выезда.") + "</p>" +
      '<div class="bld-actions">' +
      '<button class="btn btn-ghost btn-lg" type="button" id="bldPrint">🖨️ ' + L("Yazdır / PDF", "Print / PDF", "Drucken / PDF", "Печать / PDF") + "</button>" +
      '<button class="btn btn-ghost btn-lg" type="button" id="bldReset">' + L("Baştan başla", "Start over", "Neu beginnen", "Начать заново") + "</button></div></div>";
  }

  function waText() {
    var r = bom();
    var lines = [];
    lines.push(L("Sistem Kurucu siparişi", "System Builder order", "Systemkonfigurator-Bestellung", "Заказ из конфигуратора") + ":");
    lines.push(L("Kullanım", "Use case", "Einsatz", "Сценарий") + ": " + (presetLabel() || "-"));
    lines.push(L("Günlük ihtiyaç", "Daily need", "Tagesbedarf", "Суточная потребность") + ": " + nf2(r.need.dailyWh / 1000) + " kWh · " +
      L("tepe", "peak", "Spitze", "пик") + " " + nf(r.need.peakW) + " W");
    lines.push(L("Kurulu güç", "Installed power", "Installierte Leistung", "Мощность") + ": " + nf1(r.instKwp) + " kWp");
    lines.push("");
    r.lines.forEach(function (l) { lines.push("• " + l.name + " × " + nf1(l.qty) + " " + l.unit + " = " + money(l.sum)); });
    lines.push("");
    lines.push(L("Toplam (tahmini)", "Total (estimate)", "Gesamt (ca.)", "Итого (оценка)") + ": " + money(r.total));
    var appl = Object.keys(state.items).filter(function (id) { return state.items[id]; })
      .map(function (id) { return T(appById[id].name) + " ×" + state.items[id]; });
    if (appl.length) { lines.push(""); lines.push(L("Cihazlar", "Appliances", "Geräte", "Приборы") + ": " + appl.join(", ")); }
    lines.push("");
    lines.push(L("Ücretsiz keşif ve kesin teklif talep ediyorum.", "I'd like a free site survey and a binding quote.",
      "Ich möchte eine kostenlose Vor-Ort-Analyse und ein verbindliches Angebot.", "Прошу бесплатный выезд и точное предложение."));
    return lines.join("\n");
  }
  function presetLabel() {
    var p = (B.presets || []).filter(function (x) { return x.id === state.preset; })[0];
    return p ? T(p.label) : "";
  }

  /* ---- Render + olaylar ---- */
  function render() {
    var body = state.step === 1 ? viewPreset()
      : state.step === 2 ? viewAppliances()
      : state.step === 3 ? viewNeeds()
      : state.step === 4 ? viewSelect() : viewSummary();

    var need = calc();
    var canNext = state.step === 1 ? !!state.preset : (state.step === 2 ? need.count > 0 : true);
    var nav = '<div class="bld-nav">' +
      (state.step > 1 ? '<button class="btn btn-ghost" type="button" id="bldPrev">← ' + L("Geri", "Back", "Zurück", "Назад") + "</button>" : "<span></span>") +
      (state.step < 5 ? '<button class="btn" type="button" id="bldNext"' + (canNext ? "" : " disabled") + ">" +
        L("Devam et", "Continue", "Weiter", "Далее") + " →</button>" : "<span></span>") + "</div>";

    root.innerHTML = stepNav() + body + nav;
    // Açık akordeon gövdelerine gerçek yükseklik ver (animasyonsuz ilk çizim)
    $$(".bld-acc.open .bld-acc-body", root).forEach(function (el) { el.style.maxHeight = el.scrollHeight + "px"; });
    if (state.step === 3) { var sel = $("#bldAuto"); if (sel) sel.value = String(state.autonomy); }
    save();
  }

  function applyPreset(id) {
    state.preset = id;
    state.items = {}; state.hours = {};
    if (id !== "__bos__") {
      var p = (B.presets || []).filter(function (x) { return x.id === id; })[0];
      if (p) Object.keys(p.items).forEach(function (k) { state.items[k] = p.items[k]; });
    }
    state.qty = {}; // adetler yeniden hesaplansın
  }

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
    var t = e.target.closest("[data-preset],[data-goto],[data-inc],[data-dec],[data-qinc],[data-qdec],[data-qauto],#bldNext,#bldPrev,#bldPrint,#bldReset");
    if (!t) return;
    if (t.hasAttribute("data-preset")) { applyPreset(t.getAttribute("data-preset")); state.step = 2; render(); return; }
    if (t.hasAttribute("data-goto")) { state.step = +t.getAttribute("data-goto"); render(); return; }
    if (t.hasAttribute("data-inc") || t.hasAttribute("data-dec")) {
      var id = t.getAttribute("data-inc") || t.getAttribute("data-dec");
      var d = t.hasAttribute("data-inc") ? 1 : -1;
      state.items[id] = Math.max(0, (state.items[id] || 0) + d);
      state.qty = {};
      render(); return;
    }
    if (t.hasAttribute("data-qinc") || t.hasAttribute("data-qdec")) {
      // Satır içindeki buton, sarmalayan <label>'ın seçimini değiştirmesin
      e.preventDefault();
      var key = t.getAttribute("data-qinc") || t.getAttribute("data-qdec");
      var st = stepOfKey(key);
      var dd = (t.hasAttribute("data-qinc") ? 1 : -1) * st;
      setQtyKey(key, Math.max(st, Math.round((qtyOfKey(key) + dd) * 10) / 10));
      softSelect(); return;
    }
    if (t.hasAttribute("data-qauto")) { e.preventDefault(); clearQtyKey(t.getAttribute("data-qauto")); softSelect(); return; }
    if (t.id === "bldNext") { state.step = Math.min(5, state.step + 1); render(); window.scrollTo({ top: root.offsetTop - 90, behavior: "smooth" }); return; }
    if (t.id === "bldPrev") { state.step = Math.max(1, state.step - 1); render(); window.scrollTo({ top: root.offsetTop - 90, behavior: "smooth" }); return; }
    if (t.id === "bldPrint") { window.print(); return; }
    if (t.id === "bldReset") {
      state = { step: 1, preset: "", items: {}, hours: {}, sel: {}, extras: {}, qty: {}, exQty: {}, open: { panel: true }, autonomy: SZ.autonomyDays || 1 };
      render(); return;
    }
  });

  root.addEventListener("input", function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute("data-qty")) {
      state.items[el.getAttribute("data-qty")] = Math.max(0, parseInt(el.value, 10) || 0);
      state.qty = {}; softUpdate(); return;
    }
    if (el.hasAttribute && el.hasAttribute("data-h")) {
      var v = parseFloat(el.value);
      state.hours[el.getAttribute("data-h")] = isFinite(v) ? Math.max(0, Math.min(24, v)) : 0;
      state.qty = {}; softUpdate(); return;
    }
    if (el.hasAttribute && el.hasAttribute("data-qset")) {
      var q = parseQ(el.value);
      if (isFinite(q) && q > 0) { setQtyKey(el.getAttribute("data-qset"), q); softSelect(true); }
      return; // boş/geçersizken durum bozulmasın; blur'da (change) düzeltilir
    }
  });

  // Cihaz adım/saat değişiminde tabloyu yeniden çizmeden özeti güncelle (odak kaybolmasın)
  function softUpdate() {
    var need = calc();
    var live = $(".bld-live", root);
    if (live) {
      var vals = $$("strong", live);
      if (vals[0]) vals[0].textContent = nf(need.count);
      if (vals[1]) vals[1].textContent = nf2(need.dailyWh / 1000) + " kWh";
      if (vals[2]) vals[2].textContent = nf(need.peakW) + " W";
    }
    $$("tr", root).forEach(function (tr) {
      var q = $("[data-qty]", tr); if (!q) return;
      var id = q.getAttribute("data-qty"), a = appById[id];
      var n = state.items[id] || 0;
      var h = state.hours[id] != null ? state.hours[id] : a.h;
      tr.classList.toggle("on", !!n);
      var wh = $(".bld-wh", tr); if (wh) wh.textContent = n ? nf(a.w * n * h) + " Wh" : "—";
    });
    var nx = $("#bldNext"); if (nx) nx.disabled = !(need.count > 0);
    save();
  }

  /* ---- 4. adım: seçim/adet değişimini yeniden çizmeden yansıt (odak korunur) ---- */
  function syncQtyCell(row, active, key, q, autoV, unit, step, label, typing) {
    var cell = $(".bld-row-qty", row); if (!cell) return;
    row.classList.toggle("qbox", !!active); // mobilde adet kutusu kendi satırına iner
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

  function softSelect(typing) {
    if (state.step !== 4) return;
    var need = calc();
    ensureDefaults(need);
    var r = bom();
    var uAdet = L("adet", "pcs", "Stk.", "шт.");

    ["panel", "battery", "inverter"].forEach(function (type) {
      var head = $('[data-acc="' + type + '"] .bld-acc-sum', root);
      var p = pick(type, state.sel[type]);
      if (!head || !p) return;
      var q = qtyOf(type, need);
      var b = $("b", head), s = $("small", head);
      if (b) b.textContent = p.brand + " " + T(p.name);
      if (s) s.textContent = nf1(q) + " " + uAdet + " · " + money(p.price * q);
    });
    refreshExtras(r);

    $$(".bld-row-pick", root).forEach(function (row) {
      var type = row.getAttribute("data-rowid");
      var inp = $("input[data-sel]", row); if (!inp) return;
      var p = pick(type, inp.value); if (!p) return;
      var autoV = autoQtyFor(type, p, need);
      var q = inp.checked ? qtyOf(type, need) : autoV;
      syncQtyCell(row, inp.checked, type, q, autoV, uAdet, 1, p.brand + " " + T(p.name), typing);
      var sm = $(".bld-row-sum", row); if (sm) sm.textContent = money(p.price * q);
    });
    $$(".bld-row-check", root).forEach(function (row) {
      var x = extraById((row.getAttribute("data-rowid") || "").slice(2)); if (!x) return;
      var on = extraOn(x);
      var autoV = extraAutoQty(x, r.panelQty, r.instKwp);
      var q = on ? extraQtyOf(x, r.panelQty, r.instKwp) : autoV;
      syncQtyCell(row, on, "x:" + x.id, q, autoV, T(x.unit), extraStep(x), T(x.name), typing);
      var sm = $(".bld-row-sum", row); if (sm) sm.textContent = money(x.price * q);
    });

    var cart = $("#bldCart", root); if (cart) cart.innerHTML = cartInner(r);
    $$(".bld-acc.open .bld-acc-body", root).forEach(function (el) { el.style.maxHeight = el.scrollHeight + "px"; });
    save();
  }

  // Ek malzeme başlığındaki "N kalem seçili / toplam" özeti
  function refreshExtras(r) {
    var head = $('[data-acc="extras"]', root);
    if (!head) return;
    var on = 0, sum = 0;
    (r || bom()).lines.forEach(function (l) { if (l.type === "extra") { on++; sum += l.sum; } });
    var b = $(".bld-acc-sum b", head), s = $(".bld-acc-sum small", head);
    if (b) b.textContent = on + " " + L("kalem seçili", "items selected", "Positionen gewählt", "позиций выбрано");
    if (s) s.textContent = money(sum);
  }

  root.addEventListener("change", function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute("data-sel")) {
      var ty = el.getAttribute("data-sel");
      state.sel[ty] = el.value; state.qty[ty] = null;
      $$('.bld-row-pick[data-rowid="' + ty + '"]', root).forEach(function (row) {
        row.classList.toggle("sel", $("input[data-sel]", row) === el);
      });
      softSelect(); return;
    }
    if (el.hasAttribute && el.hasAttribute("data-extra")) {
      state.extras[el.getAttribute("data-extra")] = el.checked;
      var row2 = el.closest(".bld-row"); if (row2) row2.classList.toggle("sel", el.checked);
      softSelect(); return;
    }
    // Odak çıkınca değeri normalle — yeniden ÇİZME: aynı tıklamada basılan butonu yok eder
    if (el.hasAttribute && el.hasAttribute("data-qset")) {
      var key = el.getAttribute("data-qset");
      var v = parseQ(el.value);
      if (!isFinite(v) || v <= 0) clearQtyKey(key); // boş/geçersiz → otomatik adede dön
      else setQtyKey(key, Math.max(stepOfKey(key), Math.round(v * 10) / 10));
      softSelect(); return;
    }
    if (el.id === "bldAuto") { state.autonomy = parseInt(el.value, 10) || 1; state.qty = {}; render(); return; }
  });

  doc.addEventListener("gespa:lang", render);

  // URL ile ön seçim: sistem-kur.html?tip=bagevi
  var m = /[?&]tip=([a-z0-9_-]+)/i.exec(location.search);
  if (m) {
    var pid = m[1].toLowerCase();
    // Kayıtlı bir oturum aynı senaryodaysa ilerlemeyi koru (yenilemede başa dönme)
    var samePreset = state.preset === pid && Object.keys(state.items || {}).length;
    if (!samePreset && (B.presets || []).some(function (p) { return p.id === pid; })) { applyPreset(pid); state.step = 2; }
  }
  render();
})();
