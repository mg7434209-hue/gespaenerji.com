/* Soru & Cevap — makale altındaki onaylı soru-cevap bölümü (docs/soru-cevap.md).
   Yayındaki gönderileri SUNUCU sayfaya basar (server.js serveQaPage); bu betik
   yalnız soru/cevap formlarını çalıştırır. Gönderiler onaydan sonra görünür. */
(function () {
  "use strict";
  var sec = document.querySelector("[data-qa-page]");
  if (!sec) return;
  var page = sec.getAttribute("data-qa-page");
  var opened = Date.now();              // sunucu 3 sn'den hızlı gönderiyi bot sayar
  var NAME_KEY = "gespa-qa-name";

  function cfg() { return (window.GESPA && GESPA.config) || {}; }
  function savedName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } }
  function rememberName(v) { try { localStorage.setItem(NAME_KEY, v); } catch (e) {} }

  // Mesaj satırı. waText verilirse sona WhatsApp bağlantısı olarak eklenir
  // (numara config'ten); numara yoksa aynı metin düz yazı kalır.
  function say(form, text, isErr, waText) {
    var m = form.querySelector(".qa-msg");
    if (!m) return;
    m.hidden = false;
    m.className = "qa-msg" + (isErr ? " err" : " ok");
    m.textContent = text;
    if (!waText) return;
    var wa = cfg().company && cfg().company.phone && cfg().company.phone.wa;
    m.appendChild(document.createTextNode(" "));
    if (!wa) { m.appendChild(document.createTextNode(waText)); return; }
    var a = document.createElement("a");
    a.href = "https://wa.me/" + wa;
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = waText;
    m.appendChild(a);
  }

  function send(url, form, extra, onOk) {
    var btn = form.querySelector("button[type=submit]");
    if (!form.checkValidity()) { form.reportValidity(); say(form, "Eksik alan var: işaretli alanı doldurun.", true); return; }
    var body = {
      page: page,
      name: form.elements.name.value,
      text: form.elements.text.value,
      website: form.elements.website.value,
      ok: form.elements.ok.checked,
      ms: Date.now() - opened
    };
    for (var k in extra) body[k] = extra[k];
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = "Gönderiliyor…";
    var done = function () { btn.disabled = false; btn.textContent = label; };
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }, function () { return { ok: false, j: {} }; }); })
      .then(function (out) {
        done();
        if (out.ok && out.j && out.j.ok) { rememberName(body.name.trim()); onOk(); return; }
        if (out.j && out.j.error) say(form, out.j.error, true);
        else say(form, "Gönderilemedi. Biraz sonra tekrar deneyin ya da bize", true, "WhatsApp'tan yazın");
      })
      .catch(function () { done(); say(form, "Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin ya da bize", true, "WhatsApp'tan yazın"); });
  }

  // Rozet metni config'ten (config.qa.expertName)
  var ex = cfg().qa && cfg().qa.expertName;
  if (ex) Array.prototype.forEach.call(sec.querySelectorAll("[data-qa-expert]"), function (el) { el.textContent = "✔ " + ex; });

  // Soru formu
  var ask = document.getElementById("qaAskForm");
  if (ask) {
    if (!ask.elements.name.value) ask.elements.name.value = savedName();
    ask.addEventListener("submit", function (e) {
      e.preventDefault();
      send("/api/qa/ask", ask, {}, function () {
        ask.elements.text.value = "";
        ask.elements.ok.checked = false;
        say(ask, "Teşekkürler, sorunuz bize ulaştı. Onaylandıktan sonra bu sayfada yayınlanacak. Acil durumlarda", false, "WhatsApp'tan yazın");
      });
    });
  }

  // Cevap formları: şablondan kopyalanır; kimlikler konuya göre tekilleşir.
  var tpl = document.getElementById("qaReplyTpl");
  Array.prototype.forEach.call(sec.querySelectorAll("[data-qa-reply]"), function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var tid = btn.getAttribute("data-qa-reply");
      var box = btn.parentNode;
      var open = box.parentNode.querySelector(".qa-reply-form");
      if (open) { open.elements.text.focus(); return; }
      if (!tpl) return;
      var form = tpl.content.firstElementChild.cloneNode(true);
      Array.prototype.forEach.call(form.querySelectorAll("[data-id]"), function (el) { el.id = "qaR-" + tid + "-" + el.getAttribute("data-id"); });
      Array.prototype.forEach.call(form.querySelectorAll("[data-for]"), function (el) { el.htmlFor = "qaR-" + tid + "-" + el.getAttribute("data-for"); });
      form.elements.name.value = savedName();
      box.parentNode.insertBefore(form, box.nextSibling);
      btn.hidden = true;
      form.querySelector(".qa-cancel").addEventListener("click", function () { form.remove(); btn.hidden = false; btn.focus(); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        send("/api/qa/reply", form, { parent: tid }, function () {
          var m = document.createElement("p");
          m.className = "qa-msg ok";
          m.setAttribute("role", "status");
          m.textContent = "Teşekkürler, cevabınız bize ulaştı. Onaylandıktan sonra burada yayınlanacak.";
          form.replaceWith(m);
        });
      });
      (form.elements.name.value ? form.elements.text : form.elements.name).focus();
    });
  });
})();
