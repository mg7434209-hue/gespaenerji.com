// GESPA Enerji — küçük etkileşimler
(function () {
  "use strict";

  // Footer yılını güncelle
  var yil = document.getElementById("yil");
  if (yil) yil.textContent = new Date().getFullYear();

  // İletişim formu (demo — backend bağlanana kadar istemci tarafı geri bildirim)
  window.GESPA = {
    submit: function (e) {
      e.preventDefault();
      var form = e.target;
      var note = document.getElementById("form-note");
      var ad = form.ad.value.trim();
      var tel = form.tel.value.trim();
      if (!ad || !tel) {
        if (note) {
          note.style.color = "#c0392b";
          note.textContent = "Lütfen ad ve telefon alanlarını doldurun.";
        }
        return false;
      }
      if (note) {
        note.style.color = "";
        note.textContent =
          "Teşekkürler " + ad + "! Talebiniz alındı, ekibimiz en kısa sürede sizi arayacak.";
      }
      form.reset();
      return false;
    },
  };

  // Sayfa içi bağlantılarda yumuşak kaydırma (eski tarayıcı uyumu)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
})();
