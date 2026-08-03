/* ============================================================
   GESPA Enerji — Etkileşimler
   ============================================================ */
(function () {
  "use strict";
  var doc = document;
  var REDUCED = false;
  try { REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  function L(tr, en, de, ru) { var l = (window.GESPA && GESPA.lang) || "tr"; return l === "en" ? en : (l === "de" ? de : (l === "ru" ? ru : tr)); }

  /* ---- Yıl ---- */
  var yil = $("#yil");
  if (yil) yil.textContent = new Date().getFullYear();

  /* ---- Breadcrumb JSON-LD (kırıntıdan üretilir; build statik gömdüyse atla) ---- */
  (function () {
    var c = $(".crumbs"); if (!c) return;
    if ($('script[data-gld="breadcrumblist"]')) return; // build.js statik BreadcrumbList üretti
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
      // Sosyal medya: config.sameAs'ten üretilir; boşsa blok gizlenir (ölü "#" linki kalmaz)
      $$(".socials").forEach(function (w) {
        var links = (c.sameAs || []).filter(Boolean);
        if (!links.length) { if (w.parentNode) w.parentNode.removeChild(w); return; }
        w.innerHTML = "";
        links.forEach(function (u) {
          var t = /linkedin\./i.test(u) ? ["in", "LinkedIn"]
            : /instagram\./i.test(u) ? ["ig", "Instagram"]
            : /(twitter\.|(^|\/\/)(www\.)?x\.com)/i.test(u) ? ["X", "X"]
            : /facebook\./i.test(u) ? ["f", "Facebook"]
            : /(youtube\.|youtu\.be)/i.test(u) ? ["yt", "YouTube"] : ["🌐", "Web"];
          var a = doc.createElement("a");
          a.href = u; a.target = "_blank"; a.rel = "noopener";
          a.textContent = t[0]; a.setAttribute("aria-label", t[1]);
          w.appendChild(a);
        });
      });
      // LocalBusiness JSON-LD (her sayfada) — build.js statik gömdüyse (data-gld)
      // yeniden enjekte etme (AI botları için statik sürüm esastır)
      if (!$('script[data-gld="localbusiness"]')) try {
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
      var fill = function (sel, arr) { var w = $(sel); if (!w || !arr || w.children.length) return; arr.forEach(function (n) { var sp = doc.createElement("span"); sp.textContent = n; w.appendChild(sp); }); };
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
    // ---- Paket detay sayfası (paket-*.html) — fiyat, sipariş akışı, Product LD ----
    (function () {
      var host = document.querySelector("[data-pkg-detail]");
      if (!host || !CFG.packages) return;
      var p = null;
      CFG.packages.forEach(function (x) { if (x.id === host.getAttribute("data-pkg-detail")) p = x; });
      if (!p || p.price == null) return;
      var nf = new Intl.NumberFormat("tr-TR");
      var RATE = CFG.usdTry || 0;
      var pct = CFG.cartDiscountPct || 0;
      var tlOf = function (v) { return p.currency === "USD" ? Math.round(v * RATE / 100) * 100 : v; };
      var usdOf = function (v) { return p.currency === "USD" ? v : (RATE ? Math.round(v / RATE) : 0); };
      var both = function (v) { return "₺" + nf.format(tlOf(v)) + (usdOf(v) ? " (≈ $" + nf.format(usdOf(v)) + ")" : ""); };
      var listTL = tlOf(p.price);
      var cartTL = Math.round(listTL * (100 - pct) / 100 / 50) * 50;   // havale/EFT fiyatı
      var downTL = Math.round(listTL * 0.30 / 50) * 50;               // kapıda: %30 peşin
      var restTL = listTL - downTL;                                    // kapıda: kalan %70
      var set = function (sel, txt) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = txt; }); };
      set("[data-pkg-price]", "₺" + nf.format(listTL));
      if (usdOf(p.price)) set("[data-pkg-alt]", "≈ $" + nf.format(usdOf(p.price)));
      if (pct) set("[data-pkg-cart]", "🛒 " + L("Sepette %" + pct + " indirim", pct + "% off in cart", pct + " % Rabatt im Warenkorb", "−" + pct + " % в корзине"));
      // WhatsApp bilgi linkleri
      var wa = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      var waHref = function (msg) { return "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg); };
      if (wa) {
        document.querySelectorAll("[data-pkg-wa]").forEach(function (el) {
          el.href = waHref(L("Merhaba, \"" + p.name + "\" paketi hakkında bilgi almak istiyorum.",
            "Hello, I would like information about the \"" + p.name + "\" package.",
            "Hallo, ich interessiere mich für das Paket \"" + p.name + "\".",
            "Здравствуйте, интересует пакет «" + p.name + "»."));
          el.target = "_blank"; el.rel = "noopener";
        });
      }
      // Sipariş formu — özet + ödeme planı + WhatsApp'a gönderim
      var form = document.getElementById("ordForm");
      if (form) {
        var planEl = form.querySelector("[data-ord-plan]");
        var render = function () {
          var method = (form.odeme && form.odeme.value) || "havale";
          set("[data-ord-list]", both(p.price));
          if (method === "havale") {
            set("[data-ord-disc]", "−₺" + nf.format(listTL - cartTL) + " (%" + pct + ")");
            set("[data-ord-total]", "₺" + nf.format(cartTL));
            if (planEl) planEl.hidden = true;
          } else {
            set("[data-ord-disc]", L("Kapıda ödemede uygulanmaz", "Not applied for pay-on-delivery", "Bei Nachnahme nicht anwendbar", "При оплате при получении не применяется"));
            set("[data-ord-total]", "₺" + nf.format(listTL));
            if (planEl) {
              planEl.hidden = false;
              planEl.textContent = L("Peşin (%30 havale): ", "Deposit (30% transfer): ", "Anzahlung (30 %): ", "Аванс (30 %): ") + "₺" + nf.format(downTL) +
                L(" · Teslimatta: ", " · On delivery: ", " · Bei Lieferung: ", " · При доставке: ") + "₺" + nf.format(restTL);
            }
          }
        };
        Array.prototype.forEach.call(form.querySelectorAll('input[name="odeme"]'), function (r) { r.addEventListener("change", render); });
        render();
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var v = function (n) { return (form[n] && form[n].value.trim()) || ""; };
          if (!v("ad") || !v("tel") || !v("il") || !v("adres")) return;
          var method = form.odeme.value;
          var lines = ["🛒 YENİ SİPARİŞ — " + p.name, "Liste fiyatı: " + both(p.price)];
          if (method === "havale") {
            lines.push("Ödeme: Havale/EFT (sepette %" + pct + " indirim)");
            lines.push("Ödenecek: ₺" + nf.format(cartTL));
          } else {
            lines.push("Ödeme: Kapıda ödeme (%30 peşin + %70 teslimatta)");
            lines.push("Peşin havale: ₺" + nf.format(downTL) + " · Teslimatta: ₺" + nf.format(restTL));
          }
          lines.push("— Teslimat —", "Ad: " + v("ad"), "Tel: " + v("tel"));
          if (v("eposta")) lines.push("E-posta: " + v("eposta"));
          lines.push("İl/İlçe: " + v("il"), "Adres: " + v("adres"));
          if (v("not")) lines.push("Not: " + v("not"));
          if (wa) window.open(waHref(lines.join("\n")), "_blank");
          var done = document.getElementById("ordDone");
          if (done) {
            done.hidden = false;
            done.textContent = L("Teşekkürler " + v("ad") + "! Siparişiniz WhatsApp üzerinden iletiliyor; onay ve ödeme bilgisi için aynı gün dönüş yapacağız.",
              "Thank you " + v("ad") + "! Your order is being sent via WhatsApp.",
              "Danke " + v("ad") + "! Ihre Bestellung wird per WhatsApp übermittelt.",
              "Спасибо, " + v("ad") + "! Заказ отправляется через WhatsApp.");
          }
        });
      }
      // Product JSON-LD (liste fiyatı, orijinal para birimi)
      if (!document.querySelector('script[data-gld="product"]')) {
        var web = (CFG.company && CFG.company.web) || "";
        var ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc,
          image: p.img ? web + "/" + p.img : undefined,
          brand: { "@type": "Brand", name: "GESPA Enerji" }, url: web + "/" + (p.url || "") };
        ld.offers = { "@type": "Offer", price: p.price, priceCurrency: p.currency || "TRY", availability: "https://schema.org/InStock" };
        var sc = document.createElement("script"); sc.type = "application/ld+json"; sc.textContent = JSON.stringify(ld);
        document.head.appendChild(sc);
      }
    })();

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
      // Kompakt özellik çipleri — kart başına en fazla 3 (taranabilirlik)
      function chipsOf(p) {
        var pw = p.panelW || PANEL_W;
        var panels = p.panelCount || Math.ceil((p.kwp * 1000) / pw);
        var panelChip = p.panelCount
          ? "🔆 " + p.panelCount + "× " + pw + " W " + L("panel", "panel", "Modul", "панель")
          : "🔆 ~" + nf.format(panels) + " " + L("panel", "panels", "Module", "панелей");
        var arr = ["⚡ " + nf1.format(p.kwp) + " kWp", panelChip];
        if (p.group === "irrigation" && p.pumpKw) {
          arr.push("💧 " + L("Pompa", "Pump", "Pumpe", "Насос") + " ~" + nf1.format(p.pumpKw) + " kW");
        } else if (p.battery) {
          arr.push("🔋 " + nf.format(p.battery) + " kWh " + L("batarya", "battery", "Batterie", "аккумулятор"));
        } else {
          var dk = p.dailyKwh != null ? p.dailyKwh : Math.round(p.kwp * defYield / 365);
          arr.push("☀️ ~" + nf1.format(dk) + " kWh/" + L("gün", "day", "Tag", "день"));
        }
        return arr;
      }
      // Ürün görseli — e-ticaret tarzı şematik çizim (panel ×adet, inverter, batarya/pompa)
      function mediaSvg(p, panels) {
        var s = '<svg viewBox="0 0 300 200" role="img" aria-label="' + p.name + '">';
        // podyum
        s += '<ellipse cx="150" cy="178" rx="108" ry="12" fill="var(--line)" opacity=".65"/>';
        // güneş paneli + hücre çizgileri
        s += '<rect x="54" y="24" width="112" height="124" rx="8" fill="#0d2b47" stroke="#1d4a75" stroke-width="2.5"/>';
        var gx, gy;
        for (gx = 1; gx < 3; gx++) s += '<line x1="' + (54 + gx * 37.3).toFixed(1) + '" y1="26" x2="' + (54 + gx * 37.3).toFixed(1) + '" y2="146" stroke="#29527e" stroke-width="2"/>';
        for (gy = 1; gy < 5; gy++) s += '<line x1="56" y1="' + (24 + gy * 24.8).toFixed(1) + '" x2="164" y2="' + (24 + gy * 24.8).toFixed(1) + '" stroke="#29527e" stroke-width="2"/>';
        // panel adedi rozeti
        s += '<circle cx="57" cy="30" r="17" fill="#13211c"/><text x="57" y="35" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff" font-family="inherit">×' + panels + "</text>";
        // inverter (kit'lerde yerine güç kutusu çizilir)
        if (!p.kit) {
          s += '<rect x="176" y="62" width="60" height="86" rx="9" fill="#f6f8f7" stroke="#c9d6cf" stroke-width="2.5"/>' +
               '<rect x="186" y="75" width="40" height="13" rx="3" fill="#0a6e4f"/>' +
               '<circle cx="192" cy="102" r="3.5" fill="#9fb2aa"/><circle cx="206" cy="102" r="3.5" fill="#9fb2aa"/>' +
               '<line x1="186" y1="126" x2="226" y2="126" stroke="#c9d6cf" stroke-width="3"/><line x1="186" y1="134" x2="226" y2="134" stroke="#c9d6cf" stroke-width="3"/>';
        }
        if (p.kit) {
          // komple sistem kiti: güç kutusu (ekran + priz + fan) + kablo rulosu
          s += '<rect x="176" y="52" width="62" height="96" rx="8" fill="#eef1ef" stroke="#c9d6cf" stroke-width="2.5"/>' +
               '<rect x="186" y="64" width="30" height="12" rx="3" fill="#0a6e4f"/>' +
               '<circle cx="228" cy="70" r="6" fill="#2c6db3"/>' +
               '<circle cx="192" cy="90" r="4" fill="#13211c"/><rect x="204" y="86" width="26" height="8" rx="2" fill="#c9d6cf"/>' +
               '<circle cx="207" cy="124" r="12" fill="none" stroke="#9fb2aa" stroke-width="2.5"/>' +
               '<line x1="199" y1="124" x2="215" y2="124" stroke="#9fb2aa" stroke-width="2"/>' +
               '<line x1="207" y1="116" x2="207" y2="132" stroke="#9fb2aa" stroke-width="2"/>' +
               '<ellipse cx="118" cy="158" rx="34" ry="13" fill="none" stroke="#c0392b" stroke-width="5"/>' +
               '<ellipse cx="118" cy="152" rx="34" ry="13" fill="none" stroke="#d94f3d" stroke-width="5"/>' +
               '<ellipse cx="118" cy="146" rx="34" ry="13" fill="none" stroke="#13211c" stroke-width="3" opacity=".55"/>';
          return s + "</svg>";
        }
        if (p.group === "irrigation") {
          // dalgıç pompa + sola çıkan boru + damlalar (açık zeminde görünür)
          s += '<rect x="88" y="138" width="62" height="30" rx="15" fill="#2c6db3" stroke="#245a94" stroke-width="2.5"/>' +
               '<rect x="46" y="148" width="44" height="9" rx="4" fill="#2c6db3"/>' +
               '<rect x="42" y="138" width="9" height="19" rx="3" fill="#2c6db3"/>' +
               '<circle cx="46" cy="128" r="5" fill="#4aa3e0"/><circle cx="37" cy="117" r="3.5" fill="#4aa3e0" opacity=".85"/>';
        } else {
          // lityum batarya + şimşek
          s += '<rect x="82" y="128" width="88" height="42" rx="8" fill="#e8f1fb" stroke="#b9d2ec" stroke-width="2.5"/>' +
               '<rect x="170" y="140" width="6" height="16" rx="2" fill="#b9d2ec"/>' +
               '<polygon points="130,134 118,152 126,152 122,164 136,146 128,146" fill="#f7b500"/>';
        }
        return s + "</svg>";
      }
      function card(p) {
        // priceOnRequest: fiyat girilmediyse "Teklif alın"; admin/config fiyat girerse gösterilir
        var price = (p.priceOnRequest && p.price == null) ? null : priceOf(p);
        var pw = p.panelW || PANEL_W;
        var panels = p.panelCount || Math.ceil((p.kwp * 1000) / pw);
        var chips = chipsOf(p).map(function (s) { return "<span>" + s + "</span>"; }).join("");
        var feat = (p.features || []).map(function (f) { return "<li>" + f + "</li>"; }).join("");
        // Açık fiyat = net paket fiyatı; türetilen = yaklaşık başlangıç
        var priceLbl = p.price != null
          ? L("Paket fiyatı", "Package price", "Paketpreis", "Цена пакета")
          : L("Yaklaşık başlangıç", "Approx. from", "Ca. ab", "Прибл. от");
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
        var ldItem = { "@type": "Product", name: p.name, category: p.tag, description: p.desc };
        if (price != null) ldItem.offers = { "@type": "Offer", price: price, priceCurrency: p.currency || "TRY", availability: "https://schema.org/InStock" };
        ld.push(ldItem);
        // TEK FORMAT: ana fiyat TL (USD ürünlerde kurla), yanında yaklaşık USD.
        var RATE = CFG.usdTry || 0;
        var tlOf = function (v) { return p.currency === "USD" ? Math.round(v * RATE / 100) * 100 : v; };
        var usdOf = function (v) { return p.currency === "USD" ? v : (RATE ? Math.round(v / RATE) : 0); };
        // vitrin LISTE fiyati gosterir; indirim sepette (cartDiscountPct)
        var cartPct = CFG.cartDiscountPct || 0;
        var priceHtml = price != null
          ? '<div class="pkg-price"><span class="pkg-price-lbl">' + priceLbl +
            (cartPct ? ' <em class="pkg-disc">🛒 ' + L("Sepette %" + cartPct + " indirim", cartPct + "% off in cart", cartPct + " % Rabatt im Warenkorb", "−" + cartPct + " % в корзине") + "</em>" : "") + "</span>" +
            '<span class="pkg-price-row"><strong>₺' + nf.format(tlOf(price)) + "</strong>" +
            (usdOf(price) ? '<span class="pkg-alt">≈ $' + nf.format(usdOf(price)) + "</span>" : "") + "</span></div>"
          : '<div class="pkg-price"><span class="pkg-price-lbl">' + L("Fiyat", "Price", "Preis", "Цена") + '</span><strong class="pkg-poa">' + L("Teklif alın", "Get a quote", "Angebot", "По запросу") + "</strong></div>";
        return '<article class="pkg-card reveal' + (p.popular ? " popular" : "") + '" id="pkg-' + p.id + '">' +
          (p.url ? '<a class="pkg-media-link" href="' + p.url + '">' : "") +
          '<div class="pkg-media' + (p.img ? " has-img" : "") + '">' +
            (p.popular ? '<span class="pkg-badge">' + L("En Popüler", "Most Popular", "Beliebt", "Популярный") + "</span>" : "") +
            '<span class="pkg-cat">' + p.tag + "</span>" +
            (p.img ? '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" decoding="async" />' : mediaSvg(p, panels)) +
          "</div>" +
          (p.url ? "</a>" : "") +
          '<div class="pkg-body">' +
            '<h3 class="pkg-name">' + (p.url ? '<a href="' + p.url + '">' + p.name + "</a>" : p.name) + "</h3>" +
            (p.for ? '<p class="pkg-for">👤 <span>Kimin için:</span> <span>' + p.for + "</span></p>" : "") +
            '<div class="pkg-chips">' + chips + "</div>" +
            '<ul class="pkg-features ticks">' + feat + "</ul>" +
            '<div class="pkg-buy">' +
              priceHtml +
              (p.url ? '<a class="btn btn-ghost btn-block" style="margin-bottom:8px" href="' + p.url + '">' + L("Detayları gör →", "View details →", "Details ansehen →", "Подробнее →") + "</a>" : "") +
              '<a class="btn btn-block" href="' + href + '"' + (WA ? ' target="_blank" rel="noopener"' : "") + ">" + L("Bu paket için teklif al", "Get a quote", "Angebot anfordern", "Запросить КП") + "</a>" +
            "</div>" +
          "</div>" +
          "</article>";
      }
      var GROUPS = [
        { id: "ongrid", title: L("Çatı / On-Grid Paketler", "Rooftop / On-Grid Packages", "Aufdach- / On-Grid-Pakete", "Крышные / On-grid пакеты"), desc: L("Şebeke bağlantılı konut, villa ve ticari sistemler.", "Grid-tied residential, villa and commercial systems.", "Netzgekoppelte Wohn-, Villa- und Gewerbesysteme.", "Сетевые системы для домов, вилл и бизнеса.") },
        { id: "offgrid", title: L("Taşınabilir & Off-Grid Paketler", "Portable & Off-Grid Packages", "Tragbare & Off-Grid-Pakete", "Портативные и off-grid пакеты"), desc: L("Lityum bataryalı, şebekeden bağımsız; bağ evi, karavan ve kulübe için hazır kitler.", "Lithium-battery, off-grid ready kits for cabins, caravans and huts.", "Lithium-Batterie, netzunabhängige Fertigsets für Gartenhäuser, Wohnmobile und Hütten.", "Готовые автономные комплекты с литиевым аккумулятором для дач, караванов и хижин.") },
        { id: "irrigation", title: L("Tarımsal Sulama Paketleri", "Agricultural Irrigation Packages", "Pakete für landwirtschaftliche Bewässerung", "Пакеты для аграрного полива"), desc: L("Mazotsuz, şebekesiz güneş enerjili sulama pompa sistemleri.", "Diesel-free, off-grid solar irrigation pump systems.", "Dieselfreie, netzunabhängige solare Bewässerungspumpensysteme.", "Солнечные насосные системы полива без дизеля и без сети.") }
      ];
      // "Hangisi size uygun?" rehberi — kullanım yeri çipi -> ilgili karta kaydır + vurgula
      var out = "";
      if (CFG.packageGuide && CFG.packageGuide.length) {
        out += '<div class="pkg-guide reveal"><h3>Hangisi size uygun?</h3><p>Kullanım yerinizi seçin, sizi doğru pakete götürelim:</p><div class="pkg-guide-chips">' +
          CFG.packageGuide.map(function (g) {
            return '<a class="pkg-jump" href="#pkg-' + g.target + '" data-target="pkg-' + g.target + '"><em aria-hidden="true">' + (g.icon || "☀️") + "</em><span>" + g.label + "</span></a>";
          }).join("") + "</div></div>";
      }
      GROUPS.forEach(function (g) {
        var items = CFG.packages.filter(function (p) { return (p.group || "ongrid") === g.id; });
        if (!items.length) return;
        out += '<div class="pkg-group" id="grp-' + g.id + '">' +
          '<div class="pkg-group-head reveal"><h2>' + g.title + "</h2><p>" + g.desc + "</p></div>" +
          '<div class="pkg-grid">' + items.map(card).join("") + "</div></div>";
      });
      grid.innerHTML = out;
      // Rehber çipi: hedef kartı kısa süre vurgula (kaydırmayı genel smooth-scroll yapar)
      $$(".pkg-jump", grid).forEach(function (a) {
        a.addEventListener("click", function () {
          var t = doc.getElementById(a.getAttribute("data-target"));
          if (!t) return;
          $$(".pkg-card.hl", grid).forEach(function (c) { c.classList.remove("hl"); });
          t.classList.add("hl");
          setTimeout(function () { t.classList.remove("hl"); }, 2600);
        });
      });
      if (!$('script[data-gld="itemlist"]')) try {
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
      var showPrice = CFG.heater.showPrices !== false; // config kapalıysa fiyat yerine "Teklif alın"
      tb.innerHTML = CFG.heater.models.map(function (m) {
        var tank = L("Emaye", "Enamel", "Email", "Эмаль");
        var mount = m.mount === "Dikey" ? L("Dikey", "Vertical", "Vertikal", "Вертик.") : L("Yatay", "Horizontal", "Horizontal", "Горизонт.");
        var price = showPrice && m.price ? '<span class="spec-price">₺' + nf.format(m.price) + "</span>"
          : '<a href="iletisim.html" class="spec-quote">' + L("Teklif alın", "Get a quote", "Angebot", "По запросу") + "</a>";
        return "<tr><td>" + m.cap + " L</td><td>" + mount + "</td><td>" + (m.pv != null ? m.pv + " W" : "—") + "</td><td>" + (m.dim || "—") + "</td><td>" + (m.ac != null ? m.ac + " kW" : "—") + "</td><td>" + tank + "</td><td>" + price + "</td></tr>";
      }).join("");
      var prices = showPrice ? CFG.heater.models.map(function (m) { return m.price; }).filter(Boolean) : [];
      var fromEl = $("#heaterFrom");
      if (fromEl) {
        if (prices.length) {
          var mn = "₺" + nf.format(Math.min.apply(null, prices));
          fromEl.textContent = L(mn + "'dan başlayan fiyatlarla", "from " + mn, "ab " + mn, "от " + mn);
        } else {
          fromEl.textContent = L("Güncel fiyat için bize ulaşın", "Contact us for current pricing",
            "Aktuelle Preise auf Anfrage", "Актуальные цены — по запросу");
        }
      }
      // Product JSON-LD — fiyat aralığı config'ten (tek kaynak);
      // build.js statik gömdüyse yeniden enjekte etme
      if (!$('script[data-gld="product"]')) try {
        var web = (CFG.company && CFG.company.web) || "";
        var d = {
          "@context": "https://schema.org", "@type": "Product",
          name: (CFG.heater.name || "Solar Su Isıtma Sistemi") + " — Fotovoltaik Güneş Enerjili Su Isıtıcı",
          image: web + "/assets/img/products/pv-su-isitici.jpg",
          description: "Monokristal güneş panelleriyle suyu doğrudan güneş enerjisiyle ısıtan fotovoltaik su ısıtıcı. Akıllı GF-20 kontrol, bulutlu havada otomatik şebeke (AC) desteği, emaye iç tank. 60–200 L kapasite seçenekleri (yatay/dikey).",
          brand: { "@type": "Brand", name: (CFG.company && CFG.company.brandName) || "GESPA Enerji" },
          category: "Solar Water Heater"
        };
        if (prices.length) {
          d.offers = {
            "@type": "AggregateOffer", priceCurrency: "TRY",
            lowPrice: Math.min.apply(null, prices), highPrice: Math.max.apply(null, prices),
            offerCount: prices.length, availability: "https://schema.org/InStock"
          };
        }
        var s = doc.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(d); doc.head.appendChild(s);
      } catch (e) {}
    })();
    if (window.GESPA && GESPA.applyLang) GESPA.applyLang(GESPA.lang || "tr");
  })();

  /* ---- Analitik (yalnızca config'te ID varsa — GA4) + KVKK çerez onayı ----
     Analitik, ziyaretçi çerez bildiriminde "Kabul et" demeden YÜKLENMEZ.
     Tercih localStorage 'gespa-consent' anahtarında tutulur (granted/denied);
     cerez-politikasi.html'deki #cookieReset düğmesi tercihi sıfırlar. ---- */
  (function () {
    var KEY = "gespa-consent";
    var id = CFG.analytics && CFG.analytics.ga4;

    // Çerez politikası sayfası: tercihi sıfırlama düğmesi
    var reset = $("#cookieReset");
    if (reset) reset.addEventListener("click", function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      var n = $("#cookieResetNote");
      if (n) n.textContent = L("Tercihiniz sıfırlandı; bir sonraki sayfada yeniden sorulacak.", "Your choice was reset; you'll be asked again on the next page.", "Ihre Auswahl wurde zurückgesetzt; Sie werden erneut gefragt.", "Ваш выбор сброшен; вопрос появится снова на следующей странице.");
    });

    if (!id) return; // ID yoksa hiçbir analitik script yüklenmez, bildirim de gösterilmez

    function loadGA() {
      var s = doc.createElement("script"); s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
      doc.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", id, { anonymize_ip: true });
    }

    var choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) {}
    if (choice === "granted") { loadGA(); return; }
    if (choice === "denied") return;

    // Henüz seçim yapılmadı: çerez bildirimi göster
    var bar = doc.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", L("Çerez bildirimi", "Cookie notice", "Cookie-Hinweis", "Уведомление о cookie"));
    bar.innerHTML =
      "<p>" + L("Deneyiminizi iyileştirmek için isteğe bağlı analitik çerezler kullanmak istiyoruz. Ayrıntı: ",
                "We'd like to use optional analytics cookies to improve your experience. Details: ",
                "Wir möchten optionale Analyse-Cookies verwenden, um Ihr Erlebnis zu verbessern. Details: ",
                "Мы хотели бы использовать необязательные аналитические cookie. Подробнее: ") +
      '<a href="/cerez-politikasi.html">' + L("Çerez Politikası", "Cookie Policy", "Cookie-Richtlinie", "Политика cookie") + "</a></p>" +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-sm" data-consent="granted">' + L("Kabul et", "Accept", "Akzeptieren", "Принять") + "</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-consent="denied">' + L("Reddet", "Reject", "Ablehnen", "Отклонить") + "</button>" +
      "</div>";
    doc.body.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-consent]");
      if (!b) return;
      var v = b.getAttribute("data-consent");
      try { localStorage.setItem(KEY, v); } catch (err) {}
      bar.remove();
      if (v === "granted") loadGA();
    });
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
  function syncThemeBtn() { if (themeToggle) themeToggle.setAttribute("aria-pressed", doc.documentElement.getAttribute("data-theme") === "dark" ? "true" : "false"); }
  syncThemeBtn();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var cur = doc.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      doc.documentElement.setAttribute("data-theme", cur);
      try { localStorage.setItem("gespa-theme", cur); } catch (e) {}
      syncThemeBtn();
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

  /* ---- Nav açılır grubu (Havuz Teknolojileri) ---- */
  $$(".menu-group").forEach(function (mg) {
    var mp = $(".menu-parent", mg);
    if (!mp) return;
    mp.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = mg.classList.toggle("open");
      mp.setAttribute("aria-expanded", open ? "true" : "false");
    });
    doc.addEventListener("click", function (e) {
      if (!mg.contains(e.target)) { mg.classList.remove("open"); mp.setAttribute("aria-expanded", "false"); }
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (mg.contains(doc.activeElement)) mp.focus(); // focus-within kuralı da kapansın
      mg.classList.remove("open"); mp.setAttribute("aria-expanded", "false");
    });
  });

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
        if (t) { ev.preventDefault(); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" }); }
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
    if (REDUCED) { el.textContent = prefix + target + suffix; return; }
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
      s += '<text x="' + (W - 4) + '" y="' + (cy - 5).toFixed(1) + '" text-anchor="end" font-size="11" font-weight="700" fill="var(--muted)">' + L("Yatırım", "Investment", "Investition", "Инвестиция") + '</text>';
      var yrLbl = L(". yıl", "y", ". J.", " г.");
      for (var j = 5; j <= n; j += 5) { var lx = (j - 1) * (bw + pad) + bw / 2; s += '<text x="' + lx.toFixed(1) + '" y="' + (H - 5) + '" text-anchor="middle" font-size="10" fill="var(--muted)">' + j + yrLbl + '</text>'; }
      chartEl.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="25 yıllık kümülatif tasarruf grafiği">' + s + '</svg>';
    }

    function calc() {
      var unit = parseFloat(price && price.value) || k.defaultUnitPrice || 2.5;
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
      // 0 geçerli bir öz tüketim değeridir; yalnız boş/geçersiz girişte varsayılana dön
      var selfVal = parseFloat(selfEl && selfEl.value);
      var selfPct = hasBattery ? BAT_SELF : (isFinite(selfVal) ? selfVal : (k.defaultSelfConsumption != null ? k.defaultSelfConsumption : 100));
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
  var galleries = $$(".gallery");
  var zoomables = $$("img[data-zoom]");
  if (galleries.length || zoomables.length) {
    var lb = doc.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", L("Görsel büyütme", "Image zoom", "Bildvergrößerung", "Просмотр изображения"));
    lb.innerHTML = '<button class="lightbox-close" aria-label="' + L("Kapat", "Close", "Schließen", "Закрыть") + '">×</button><img alt="" />';
    doc.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbClose = lb.querySelector(".lightbox-close");
    var lbOpener = null;
    function openLb(img) {
      lbOpener = img;
      lbImg.src = img.getAttribute("data-full") || img.src; // küçük resim yerine tam boyut
      lbImg.alt = img.alt || "";
      lb.classList.add("open");
      lbClose.focus();
    }
    function closeLb() {
      if (!lb.classList.contains("open")) return;
      lb.classList.remove("open");
      if (lbOpener) { lbOpener.focus(); lbOpener = null; }
    }
    function bindZoom(img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(img); }
      });
    }
    galleries.forEach(function (g) {
      $$("img", g).forEach(bindZoom);
      g.addEventListener("click", function (e) { if (e.target.tagName === "IMG") openLb(e.target); });
    });
    // Galeri dışındaki tekil büyütülebilir görseller (ör. ürün galerisi ana görseli)
    zoomables.forEach(function (img) {
      if (img.closest(".gallery")) return;
      bindZoom(img);
      img.addEventListener("click", function () { openLb(img); });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLb(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---- Ürün galerisi (küçük resim → ana görsel) ---- */
  var pgMain = $("#pgMain"), pgThumbs = $(".prod-thumbs");
  if (pgMain && pgThumbs) {
    var pgCap = $("#pgCap");
    pgThumbs.addEventListener("click", function (e) {
      var a = e.target.closest(".prod-thumb");
      if (!a) return;
      e.preventDefault(); // JS yokken bağlantı görseli açar; varken yerinde değiştir
      var thumbImg = $("img", a);
      pgMain.src = a.getAttribute("href");
      pgMain.alt = (thumbImg && thumbImg.alt) || pgMain.alt;
      if (pgCap) pgCap.textContent = a.getAttribute("data-cap") || "";
      $$(".prod-thumb", pgThumbs).forEach(function (t) { t.classList.toggle("is-on", t === a); });
    });
  }

  /* ---- Müşteri yorumları slider ---- */
  var track = $("#testiTrack");
  var dotsWrap = $("#testiDots");
  if (track && dotsWrap) {
    var slides = $$(".testi", track);
    var idx = 0, timer;
    slides.forEach(function (_, i) {
      var d = doc.createElement("button");
      d.setAttribute("aria-label", L("Yorum ", "Review ", "Bewertung ", "Отзыв ") + (i + 1));
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
    function reset() { clearInterval(timer); if (!REDUCED) timer = setInterval(next, 5000); }
    var wrap = track.parentNode;
    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    wrap.addEventListener("mouseleave", reset);
    wrap.addEventListener("focusin", function () { clearInterval(timer); });
    wrap.addEventListener("focusout", reset);
    reset();
  }

  /* ---- SSS akordeon ---- */
  $$(".faq-item").forEach(function (item, fi) {
    var q = $(".faq-q", item);
    var a = $(".faq-a", item);
    if (!q || !a) return;
    if (!a.id) a.id = "faq-a-" + fi;
    q.setAttribute("aria-expanded", "false");
    q.setAttribute("aria-controls", a.id);
    a.setAttribute("aria-hidden", "true");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.setAttribute("aria-hidden", open ? "false" : "true");
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
        if (note) { note.setAttribute("role", "alert"); note.style.color = "#c0392b"; note.textContent = L("Lütfen ad ve telefon alanlarını doldurun.", "Please fill in your name and phone.", "Bitte Name und Telefon ausfüllen.", "Пожалуйста, заполните имя и телефон."); }
        var bad = !ad ? form.ad : form.tel;
        bad.setAttribute("aria-invalid", "true"); bad.focus();
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
        if (note) { note.setAttribute("role", "alert"); note.style.color = "#c0392b"; note.textContent = L("Lütfen ad ve telefon alanlarını doldurun.", "Please fill in your name and phone.", "Bitte Name und Telefon ausfüllen.", "Пожалуйста, заполните имя и телефон."); }
        var bad2 = !ad ? irrForm.ad : irrForm.tel;
        bad2.setAttribute("aria-invalid", "true"); bad2.focus();
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

  /* ---- AI Cankurtaran keşif/pilot teklif formu ---- */
  var poolForm = $("#poolForm");
  if (poolForm) {
    poolForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $("#pool-note");
      var val = function (n) { return poolForm[n] && poolForm[n].value ? poolForm[n].value.trim() : ""; };
      if (!val("ad") || !val("tesis") || !val("tel")) {
        if (note) { note.style.color = "#ffb3a6"; note.textContent = L("Lütfen zorunlu (*) alanları doldurun.", "Please fill in the required (*) fields.", "Bitte Pflichtfelder (*) ausfüllen.", "Пожалуйста, заполните обязательные поля (*)."); }
        return;
      }
      if (poolForm.kvkkOnay && !poolForm.kvkkOnay.checked) {
        if (note) { note.style.color = "#ffb3a6"; note.textContent = L("Devam etmek için KVKK aydınlatma metnini onaylayın.", "Please accept the privacy notice to continue.", "Bitte akzeptieren Sie die Datenschutzerklärung.", "Подтвердите согласие на обработку данных."); }
        return;
      }
      var wa = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      if (wa) {
        var m = "🏊 " + L("AI Cankurtaran — ücretsiz keşif ve pilot teklifi talebi", "AI Lifeguard — free site survey & pilot request", "AI-Rettungsschwimmer — Anfrage Vor-Ort-Analyse & Pilot", "AI-спасатель — заявка на выезд и пилот") + ":\n"
          + "Ad: " + val("ad") + "\nTesis: " + val("tesis")
          + (val("gorev") ? "\nGörev: " + val("gorev") : "")
          + "\nTel: " + val("tel") + "\nE-posta: " + val("eposta") + "\nŞehir: " + val("sehir")
          + "\nHavuz sayısı: " + val("havuzSayisi") + "\nHavuz tipi: " + val("havuzTipi")
          + (val("mesaj") ? "\n" + val("mesaj") : "");
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(m), "_blank");
      }
      if (note) {
        note.style.color = "#7fd6e8";
        note.textContent = L("Talebiniz alındı. Ekibimiz 1 iş günü içinde belirttiğiniz telefondan size ulaşacak.",
          "Your request has been received. Our team will call you within 1 business day.",
          "Ihre Anfrage ist eingegangen. Unser Team ruft Sie innerhalb von 1 Werktag an.",
          "Ваша заявка получена. Наша команда свяжется с вами в течение 1 рабочего дня.");
      }
      poolForm.reset();
    });
  }

  /* ---- Bülten formu ---- */
  var news = $("#newsForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#newsNote");
      // Statik sitede backend yok: abonelik talebi WhatsApp lead kanalından işletmeye iletilir
      var email = (news.querySelector('input[type="email"]') || {}).value || "";
      var wa = (CFG.company && CFG.company.phone && CFG.company.phone.wa) || "";
      if (wa && email.trim()) {
        var m = L("Bülten aboneliği talebi", "Newsletter subscription request", "Newsletter-Anmeldung", "Заявка на рассылку") + ": " + email.trim();
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(m), "_blank");
      }
      if (n) n.textContent = L("Aboneliğiniz alındı, teşekkürler!", "You're subscribed, thank you!", "Anmeldung erhalten, danke!", "Подписка оформлена, спасибо!");
      news.reset();
    });
  }
})();
