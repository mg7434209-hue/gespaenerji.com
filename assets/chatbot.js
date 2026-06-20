/* ============================================================
   GESPA Enerji — Akıllı Asistan (sohbet botu)
   API'siz, tamamen istemci tarafı. Sık soruları yanıtlar, lead toplar;
   sohbet geçmişini WhatsApp veya e-posta ile işletmeye iletir.
   Katsayı/iletişim: window.GESPA.config. main.js tarafından yüklenir.
   ============================================================ */
(function () {
  "use strict";
  if (window.__gchatLoaded) return; window.__gchatLoaded = true;
  var doc = document;
  var CFG = (window.GESPA && window.GESPA.config) || {};
  var C = CFG.company || {};
  var WA = (C.phone && C.phone.wa) || "";
  var TEL = (C.phone && C.phone.tel) || "";
  var MAIL = C.email || "";

  function norm(s) {
    return (s || "").toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");
  }

  // Bilgi tabanı — anahtar kelime → yanıt (+ opsiyonel link)
  var KB = [
    { k: ["tarim", "sulama", "pompa", "dalgic", "mazot", "tarla", "sera"], a: "🌾 Güneş enerjili tarımsal sulama ile mazot/elektrik maliyetini sıfıra yaklaştırırsınız; şebekeden uzak tarlalarda bile çalışır. Tipik geri ödeme 2–4 yıl.", link: { t: "Tarımsal sulama sayfası", u: "tarimsal-sulama.html" } },
    { k: ["cati", "konut", "ev", "mesken"], a: "🏠 Çatı GES: konut, ticari ve sanayi çatılarına özel tasarlanan sistemlerle elektrik faturanızı %30+ düşürebilirsiniz.", link: { t: "Hizmetler", u: "hizmetler.html" } },
    { k: ["arazi", "lisans", "tarla santral"], a: "🌄 Arazi tipi GES: lisanslı/lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısını anahtar teslim yapıyoruz.", link: { t: "Hizmetler", u: "hizmetler.html" } },
    { k: ["fiyat", "maliyet", "ne kadar", "teklif", "ucret", "butce"], a: "💰 Fiyat; çatı/arazi, tüketim ve sisteme göre değişir. Ücretsiz keşif + net teklif veriyoruz. İsterseniz birkaç bilginizi alıp talebinizi hemen iletebilirim.", lead: true },
    { k: ["hesap", "tasarruf", "geri odeme", "amorti", "kac yil", "roi"], a: "🧮 Ücretsiz hesaplayıcımızla sistem gücü, yıllık tasarruf ve geri ödeme sürenizi saniyeler içinde görebilirsiniz. GES yatırımı tipik olarak 3–6 yılda amorti olur.", link: { t: "Hesaplayıcıyı aç", u: "hesaplayici.html" } },
    { k: ["garanti", "omur", "bakim"], a: "🛡️ Panellerde 25 yıla varan garanti sunulur; bakım (O&M) hizmetimizle sistem performansını sürekli izleriz." },
    { k: ["finans", "kredi", "leasing", "taksit", "pesin"], a: "💳 Finansman & leasing seçenekleriyle peşin sermaye gerekmeden başlayabilirsiniz. Detayları keşif sırasında netleştiririz.", lead: true },
    { k: ["batarya", "depolama", "gece", "aku"], a: "🔋 Enerji depolama (batarya) ile öz tüketiminizi artırıp gece de kullanabilirsiniz. İhtiyacınıza göre boyutlandırırız." },
    { k: ["nerede", "bolge", "manavgat", "antalya", "alanya", "side", "serik", "hizmet bolge"], a: "📍 Manavgat merkezli olarak Side, Antalya, Alanya, Serik, Gazipaşa ve çevresinde; talebe göre tüm Türkiye'de hizmet veriyoruz." },
    { k: ["iletisim", "telefon", "ara", "adres", "ulas", "whatsapp"], a: "📞 Bize " + (C.phone && C.phone.display ? C.phone.display : "telefon") + " numarasından veya WhatsApp'tan ulaşabilirsiniz. Çalışma saatleri: " + (C.hours || "Hafta içi 09:00–18:00") + ".", link: { t: "İletişim sayfası", u: "iletisim.html" } },
    { k: ["proje", "referans", "ornek"], a: "📷 Sanayi, tarım ve konut projelerimizden örnekleri inceleyebilirsiniz.", link: { t: "Projeler", u: "projeler.html" } }
  ];

  var QUICK = [
    { t: "🌾 Tarımsal sulama", q: "tarımsal sulama" },
    { t: "🏠 Çatı GES", q: "çatı ges" },
    { t: "💰 Teklif / Fiyat", q: "teklif fiyat" },
    { t: "🧮 Hesaplama", q: "hesaplama tasarruf" },
    { t: "📞 İletişim", q: "iletişim" }
  ];

  var transcript = [];       // {who, text}
  var lead = { name: "", phone: "", note: "" };
  var mode = "chat";         // chat | askName | askPhone | askNote | done
  var panel, body, input, launcher;

  function L(tr) { return tr; } // şimdilik TR (i18n ileride eklenebilir)

  function add(who, text, isHtml) {
    transcript.push({ who: who, text: text });
    var m = doc.createElement("div");
    m.className = "gchat-msg " + (who === "user" ? "user" : "bot");
    if (isHtml) m.innerHTML = text; else m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function quickRow(items) {
    var row = doc.createElement("div"); row.className = "gchat-quick";
    items.forEach(function (it) {
      var b = doc.createElement("button"); b.type = "button"; b.textContent = it.t;
      b.addEventListener("click", function () { row.remove(); handleUser(it.q, it.t); });
      row.appendChild(b);
    });
    body.appendChild(row); body.scrollTop = body.scrollHeight;
  }

  function botAnswer(text, link) {
    add("bot", text);
    if (link) {
      var a = doc.createElement("a"); a.className = "gchat-link"; a.href = link.u; a.textContent = "→ " + link.t;
      var w = doc.createElement("div"); w.className = "gchat-msg bot"; w.appendChild(a); body.appendChild(w);
    }
  }

  function match(q) {
    var n = norm(q);
    var best = null, score = 0;
    KB.forEach(function (item) {
      var s = 0; item.k.forEach(function (kw) { if (n.indexOf(norm(kw)) >= 0) s++; });
      if (s > score) { score = s; best = item; }
    });
    return score > 0 ? best : null;
  }

  function startLead(reason) {
    mode = "askName";
    add("bot", "Memnuniyetle! Talebinizi uzman ekibimize iletelim. 🙂");
    add("bot", "Adınız soyadınız nedir?");
    consentLine();
  }

  function consentLine() {
    var w = doc.createElement("div"); w.className = "gchat-consent";
    w.innerHTML = 'Devam ederek <a href="/kvkk.html" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>\'ni kabul etmiş olursunuz.';
    body.appendChild(w);
  }

  function finishLead() {
    mode = "done";
    add("bot", "Teşekkürler " + lead.name + "! Talebinizi aşağıdaki butonla bize iletebilirsiniz. 👇");
    var lines = [];
    lines.push("Yeni site asistanı talebi:");
    lines.push("Ad: " + lead.name);
    lines.push("Tel: " + lead.phone);
    if (lead.note) lines.push("Not: " + lead.note);
    lines.push("");
    lines.push("— Sohbet —");
    transcript.forEach(function (m) { lines.push((m.who === "user" ? "👤 " : "🤖 ") + m.text); });
    var msg = lines.join("\n");

    var w = doc.createElement("div"); w.className = "gchat-actions";
    if (WA) {
      var wa = doc.createElement("a"); wa.className = "gchat-send wa";
      wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
      wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = "📲 WhatsApp'tan gönder";
      w.appendChild(wa);
    }
    if (MAIL) {
      var em = doc.createElement("a"); em.className = "gchat-send mail";
      em.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Site asistanı talebi — " + lead.name) + "&body=" + encodeURIComponent(msg);
      em.textContent = "✉️ E-posta ile gönder";
      w.appendChild(em);
    }
    body.appendChild(w); body.scrollTop = body.scrollHeight;
  }

  function handleUser(text, label) {
    add("user", label || text);
    if (mode === "askName") {
      lead.name = text.trim();
      mode = "askPhone";
      add("bot", "Teşekkürler. Size ulaşabileceğimiz telefon numaranız?");
      return;
    }
    if (mode === "askPhone") {
      lead.phone = text.trim();
      mode = "askNote";
      add("bot", "Son olarak, kısaca ihtiyacınız nedir? (Örn. çatı GES, tarımsal sulama, tüketim) — yazabilir veya 'geç' diyebilirsiniz.");
      return;
    }
    if (mode === "askNote") {
      if (norm(text).indexOf("gec") < 0) lead.note = text.trim();
      finishLead();
      return;
    }
    // Normal sohbet
    var hit = match(text);
    if (hit) {
      botAnswer(hit.a, hit.link);
      if (hit.lead) { setTimeout(function () { startLead(); }, 300); }
      else { setTimeout(function () { add("bot", "Başka bir konuda yardımcı olayım mı, yoksa ücretsiz teklif mi istersiniz?"); quickRow([{ t: "💬 Ücretsiz teklif iste", q: "teklif" }].concat(QUICK.slice(0, 3))); }, 300); }
    } else {
      add("bot", "Bunu en doğru şekilde uzmanımız yanıtlasın istiyorum. İsterseniz birkaç bilginizi alıp talebinizi ileteyim, ya da aşağıdaki başlıklardan seçin:");
      quickRow([{ t: "💬 Teklif iste", q: "teklif" }].concat(QUICK));
    }
  }

  function greet() {
    if (body.dataset.greeted) return; body.dataset.greeted = "1";
    add("bot", "Merhaba! 👋 GESPA Enerji asistanıyım. Güneş enerjisi, tarımsal sulama, fiyat/teklif veya hesaplama hakkında sorabilirsiniz.");
    quickRow(QUICK);
  }

  function build() {
    // Tek sohbet butonu (sağ alt) — tıklayınca doğrudan asistan açılır
    launcher = doc.createElement("button");
    launcher.className = "gchat-fab"; launcher.type = "button";
    launcher.setAttribute("aria-label", "Asistan ile sohbet");
    launcher.innerHTML = '<span class="gchat-fab-ic">💬</span>';
    doc.body.appendChild(launcher);

    panel = doc.createElement("div"); panel.className = "gchat"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "GESPA Enerji asistanı");
    panel.innerHTML =
      '<div class="gchat-head"><span class="gchat-ava">☀️</span><div><strong>GESPA Asistan</strong><small>Genelde birkaç dakikada yanıt</small></div><button class="gchat-close" type="button" aria-label="Kapat">×</button></div>' +
      '<div class="gchat-body" id="gchatBody"></div>' +
      '<form class="gchat-foot" id="gchatForm"><input id="gchatInput" type="text" autocomplete="off" placeholder="Mesajınızı yazın..." aria-label="Mesaj" /><button type="submit" aria-label="Gönder">➤</button></form>';
    doc.body.appendChild(panel);

    body = panel.querySelector("#gchatBody");
    input = panel.querySelector("#gchatInput");

    function openChat() { panel.classList.add("open"); launcher.classList.add("hide"); greet(); setTimeout(function () { input.focus(); }, 100); }
    function closeChat() { panel.classList.remove("open"); launcher.classList.remove("hide"); }

    launcher.addEventListener("click", openChat);
    panel.querySelector(".gchat-close").addEventListener("click", closeChat);
    panel.querySelector("#gchatForm").addEventListener("submit", function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ""; handleUser(v);
    });
  }

  if (doc.readyState !== "loading") build(); else doc.addEventListener("DOMContentLoaded", build);
})();
