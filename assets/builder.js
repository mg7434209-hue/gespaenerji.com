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

  /* ---- Durum (localStorage'da saklanır; yenilemede kaybolmaz) ---- */
  var LSKEY = "gespa-builder";
  var state = { step: 1, preset: "", items: {}, hours: {}, sel: {}, extras: {}, qty: {}, open: { panel: true }, autonomy: SZ.autonomyDays || 1 };
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
      var on = state.extras[x.id] != null ? state.extras[x.id] : !!x.on;
      if (!on) return;
      var q = 1;
      if (x.qty === "perPanel") q = panelQty;
      else if (x.qty === "perCableMeter") q = panelQty * (SZ.cableMetersPerPanel || 4);
      else if (x.qty === "perKwp") q = Math.max(1, Math.round(instKwp * 10) / 10);
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

  function cardList(type, need) {
    var arr = B.catalog[type] || [];
    var auto = recommend(type, need);
    var uAdet = L("adet", "pcs", "Stk.", "шт.");
    return arr.map(function (p) {
      var sel = state.sel[type] === p.id;
      var spec = type === "panel" ? p.w + " W"
        : type === "battery" ? nf2(p.kwh) + " kWh · " + p.chem + " · " + L("kullanılabilir", "usable", "nutzbar", "полезно") + " %" + Math.round((p.dod || SZ.dod || 0.9) * 100) + (p.cycles ? " · " + nf(p.cycles) + " " + L("çevrim", "cycles", "Zyklen", "циклов") : "")
        : p.kw + " kW · " + p.type;
      var q = sel ? qtyOf(type, need) : autoQtyFor(type, p, need);
      return '<label class="bld-row' + (sel ? " sel" : "") + '">' +
        '<input type="radio" name="bld-' + type + '" value="' + p.id + '"' + (sel ? " checked" : "") + ' data-sel="' + type + '" />' +
        '<span class="bld-row-mark" aria-hidden="true"></span>' +
        '<span class="bld-row-main"><span class="bld-row-title"><strong>' + p.brand + "</strong> " + T(p.name) +
          (p.id === auto ? ' <em class="bld-rec">' + L("Önerilen", "Recommended", "Empfohlen", "Рекомендуем") + "</em>" : "") + "</span>" +
          '<span class="bld-row-spec">' + spec + "</span></span>" +
        '<span class="bld-row-unit"><b>' + money(p.price) + "</b><small>/ " + uAdet + "</small></span>" +
        '<span class="bld-row-qty">' + q + " " + uAdet + "</span>" +
        '<span class="bld-row-sum">' + money(p.price * q) + "</span></label>";
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
      var sum = p ? '<b>' + p.brand + " " + T(p.name) + "</b><small>" + q + " " + uAdet + " · " + money(p.price * q) + "</small>" : "";
      var body =
        '<div class="bld-sec-head"><span class="bld-qty-label">' + L("Adet", "Quantity", "Anzahl", "Количество") + "</span>" +
        '<div class="bld-qty bld-qty-lg"><button type="button" data-qdec="' + type + '" aria-label="−">−</button>' +
        '<input type="number" min="1" value="' + q + '" data-qset="' + type + '" aria-label="' + meta[type].title + " " + L("adet", "quantity", "Anzahl", "количество") + '" />' +
        '<button type="button" data-qinc="' + type + '" aria-label="+">+</button></div></div>' +
        '<div class="bld-list"><div class="bld-row bld-row-head" aria-hidden="true">' +
          '<span></span><span class="bld-row-main">' + L("Marka / model", "Brand / model", "Marke / Modell", "Бренд / модель") + "</span>" +
          '<span class="bld-row-unit">' + L("Birim", "Unit price", "Einzelpreis", "Цена") + "</span>" +
          '<span class="bld-row-qty">' + L("Gereken", "Needed", "Benötigt", "Нужно") + "</span>" +
          '<span class="bld-row-sum">' + L("Tutar", "Total", "Summe", "Сумма") + "</span></div>" +
          cardList(type, need) + "</div>";
      out += acc(type, meta[type].icon, meta[type].title, sum, body);
    });

    // Kablo, pano ve işçilik — seçili kalem sayısı ve tutarı başlıkta
    var exOn = 0, exSum = 0;
    var r = bom();
    r.lines.forEach(function (l) { if (l.type === "extra") { exOn++; exSum += l.sum; } });
    var exBody = '<div class="bld-extras">' + (B.catalog.extras || []).map(function (x) {
      var on = state.extras[x.id] != null ? state.extras[x.id] : !!x.on;
      return '<label class="bld-extra"><input type="checkbox" data-extra="' + x.id + '"' + (on ? " checked" : "") + " />" +
        "<span>" + T(x.name) + '</span><b>' + money(x.price) + " <small>/ " + T(x.unit) + "</small></b></label>";
    }).join("") + "</div>";
    out += acc("extras", "🧰", L("Kablo, pano ve işçilik", "Cabling, panel box and labour", "Verkabelung, Verteiler und Montage", "Кабели, щит и монтаж"),
      "<b>" + exOn + " " + L("kalem seçili", "items selected", "Positionen gewählt", "позиций выбрано") + "</b><small>" + money(exSum) + "</small>", exBody);

    return out + "</div>";
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
      '<p class="bld-note">' + L("Fiyatlar tahmini liste fiyatlarıdır (KDV dahil); stok ve kur durumuna göre değişebilir. Kesin teklif ücretsiz keşif sonrası verilir.",
        "Prices are estimated list prices (VAT included) and may change with stock and exchange rates. A binding quote follows the free site survey.",
        "Preise sind geschätzte Listenpreise (inkl. MwSt.) und können sich ändern. Ein verbindliches Angebot folgt nach der Vor-Ort-Analyse.",
        "Цены ориентировочные (с НДС) и могут меняться. Точное предложение — после бесплатного выезда.") + "</p>" +
      '<div class="bld-actions"><a class="btn btn-lg" id="bldWa" href="#" target="_blank" rel="noopener">📲 ' +
        L("Siparişi WhatsApp'tan gönder", "Send order via WhatsApp", "Bestellung per WhatsApp senden", "Отправить заказ в WhatsApp") + "</a>" +
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
    if (state.step === 5) {
      var wa = $("#bldWa");
      if (wa && WA) wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(waText());
      else if (wa) { wa.href = "iletisim.html"; wa.removeAttribute("target"); }
    }
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
      return;
    }
    var t = e.target.closest("[data-preset],[data-goto],[data-inc],[data-dec],[data-qinc],[data-qdec],#bldNext,#bldPrev,#bldPrint,#bldReset");
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
      var ty = t.getAttribute("data-qinc") || t.getAttribute("data-qdec");
      var dd = t.hasAttribute("data-qinc") ? 1 : -1;
      state.qty[ty] = Math.max(1, qtyOf(ty, calc()) + dd);
      render(); return;
    }
    if (t.id === "bldNext") { state.step = Math.min(5, state.step + 1); render(); window.scrollTo({ top: root.offsetTop - 90, behavior: "smooth" }); return; }
    if (t.id === "bldPrev") { state.step = Math.max(1, state.step - 1); render(); window.scrollTo({ top: root.offsetTop - 90, behavior: "smooth" }); return; }
    if (t.id === "bldPrint") { window.print(); return; }
    if (t.id === "bldReset") {
      state = { step: 1, preset: "", items: {}, hours: {}, sel: {}, extras: {}, qty: {}, open: { panel: true }, autonomy: SZ.autonomyDays || 1 };
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
      state.qty[el.getAttribute("data-qset")] = Math.max(1, parseInt(el.value, 10) || 1);
      save(); return;
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

  root.addEventListener("change", function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute("data-sel")) { state.sel[el.getAttribute("data-sel")] = el.value; state.qty[el.getAttribute("data-sel")] = null; render(); return; }
    if (el.hasAttribute && el.hasAttribute("data-extra")) { state.extras[el.getAttribute("data-extra")] = el.checked; save(); return; }
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
