/* ============================================================
   GESPA Enerji — Akıllı Asistan (sohbet botu)
   API'siz, tamamen istemci tarafı. Sık soruları yanıtlar, lead toplar;
   sohbet geçmişini WhatsApp veya e-posta ile işletmeye iletir.
   Katsayı/iletişim: window.GESPA.config. main.js tarafından yüklenir.
   Çok dilli: aktif dil GESPA.lang'dan okunur (TR/EN/DE/RU);
   yanıt metinleri [tr,en,de,ru] dizisi olarak tutulur.
   ============================================================ */
(function () {
  "use strict";
  if (window.__gchatLoaded) return; window.__gchatLoaded = true;
  var doc = document;
  var CFG = (window.GESPA && window.GESPA.config) || {};
  var C = CFG.company || {};
  var WA = (C.phone && C.phone.wa) || "";
  var MAIL = C.email || "";

  function lang() { var l = (window.GESPA && GESPA.lang) || "tr"; return ({ tr: 1, en: 1, de: 1, ru: 1 })[l] ? l : "tr"; }
  // [tr,en,de,ru] dizisinden aktif dili seç (eksikse TR'ye düşer)
  function pick(v) {
    if (!v) return "";
    if (typeof v === "string") return v;
    var i = { tr: 0, en: 1, de: 2, ru: 3 }[lang()] || 0;
    return v[i] || v[0] || "";
  }
  function L(tr, en, de, ru) { return pick([tr, en, de, ru]); }

  function norm(s) {
    return (s || "").toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/ä/g, "a").replace(/ß/g, "ss");
  }

  // Bilgi tabanı — anahtar kelime (çok dilli) → yanıt [tr,en,de,ru] (+ opsiyonel link)
  var KB = [
    {
      k: ["tarim", "sulama", "pompa", "dalgic", "mazot", "tarla", "sera", "irrigation", "pump", "farm", "bewasserung", "landwirtschaft", "pumpe", "полив", "орошени", "насос", "поле"],
      a: ["🌾 Güneş enerjili tarımsal sulama ile mazot/elektrik maliyetini sıfıra yaklaştırırsınız; şebekeden uzak tarlalarda bile çalışır. Tipik geri ödeme 2–4 yıl.",
          "🌾 With solar-powered irrigation you cut diesel/electricity costs to near zero — it works even on fields far from the grid. Typical payback 2–4 years.",
          "🌾 Mit solarer Bewässerung senken Sie Diesel-/Stromkosten auf nahezu null — auch fernab vom Netz. Amortisation typisch 2–4 Jahre.",
          "🌾 Солнечное орошение сводит расходы на дизель и электричество почти к нулю — работает даже вдали от сети. Окупаемость обычно 2–4 года."],
      link: { t: ["Tarımsal sulama sayfası", "Solar irrigation page", "Seite Solarbewässerung", "Страница о солнечном орошении"], u: "tarimsal-sulama.html" }
    },
    {
      k: ["cati", "konut", "ev", "mesken", "roof", "home", "house", "dach", "haus", "крыша", "дом"],
      a: ["🏠 Çatı GES: konut, ticari ve sanayi çatılarına özel tasarlanan sistemlerle elektrik faturanızı %30+ düşürebilirsiniz.",
          "🏠 Rooftop solar: systems designed for residential, commercial and industrial roofs can cut your electricity bill by 30%+.",
          "🏠 Aufdach-PV: Systeme für Wohn-, Gewerbe- und Industriedächer senken Ihre Stromrechnung um 30 %+.",
          "🏠 Крышные СЭС: системы для жилых, коммерческих и промышленных крыш снижают счёт за электричество на 30%+."],
      link: { t: ["Hizmetler", "Services", "Leistungen", "Услуги"], u: "hizmetler.html" }
    },
    {
      k: ["arazi", "lisans", "tarla santral", "ground", "land plant", "freiflache", "freilandanlage", "наземн", "лицензи"],
      a: ["🌄 Arazi tipi GES: lisanslı/lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısını anahtar teslim yapıyoruz.",
          "🌄 Ground-mounted solar: feasibility, installation and grid connection for licensed/unlicensed plants — delivered turnkey.",
          "🌄 Freiflächen-PV: Machbarkeit, Installation und Netzanschluss für Anlagen — schlüsselfertig aus einer Hand.",
          "🌄 Наземные СЭС: ТЭО, монтаж и подключение к сети — под ключ."],
      link: { t: ["Hizmetler", "Services", "Leistungen", "Услуги"], u: "hizmetler.html" }
    },
    {
      k: ["fiyat", "maliyet", "ne kadar", "teklif", "ucret", "butce", "price", "cost", "quote", "how much", "preis", "kosten", "angebot", "цена", "стоимост", "сколько"],
      a: ["💰 Fiyat; çatı/arazi, tüketim ve sisteme göre değişir. Ücretsiz keşif + net teklif veriyoruz. İsterseniz birkaç bilginizi alıp talebinizi hemen iletebilirim.",
          "💰 Price depends on the roof/land, consumption and system size. We offer a free survey + a clear quote. If you like, I can take a few details and forward your request right away.",
          "💰 Der Preis hängt von Dach/Fläche, Verbrauch und Anlagengröße ab. Kostenlose Vor-Ort-Analyse + klares Angebot. Gern nehme ich ein paar Angaben auf und leite Ihre Anfrage weiter.",
          "💰 Цена зависит от крыши/участка, потребления и мощности. Бесплатный выезд + понятное КП. Могу записать пару данных и сразу передать вашу заявку."],
      lead: true
    },
    {
      k: ["hesap", "tasarruf", "geri odeme", "amorti", "kac yil", "roi", "calculat", "saving", "payback", "rechner", "ersparnis", "amortisation", "калькулятор", "экономи", "окупаемост"],
      a: ["🧮 Ücretsiz hesaplayıcımızla sistem gücü, yıllık tasarruf ve geri ödeme sürenizi saniyeler içinde görebilirsiniz. GES yatırımı tipik olarak 3–6 yılda amorti olur.",
          "🧮 With our free calculator you can see system size, annual savings and payback in seconds. Solar typically pays back in 3–6 years.",
          "🧮 Mit unserem kostenlosen Rechner sehen Sie Anlagengröße, jährliche Ersparnis und Amortisation in Sekunden. Typisch: 3–6 Jahre.",
          "🧮 Наш бесплатный калькулятор за секунды покажет мощность, годовую экономию и срок окупаемости. Обычно это 3–6 лет."],
      link: { t: ["Hesaplayıcıyı aç", "Open the calculator", "Rechner öffnen", "Открыть калькулятор"], u: "hesaplayici.html" }
    },
    {
      k: ["garanti", "omur", "bakim", "warranty", "maintenance", "garantie", "wartung", "гаранти", "обслуживани"],
      a: ["🛡️ Panellerde 25 yıla varan garanti sunulur; bakım (O&M) hizmetimizle sistem performansını sürekli izleriz.",
          "🛡️ Panels come with up to 25-year warranty; with our maintenance (O&M) service we continuously monitor system performance.",
          "🛡️ Module mit bis zu 25 Jahren Garantie; mit unserem Wartungsservice (O&M) überwachen wir die Anlagenleistung laufend.",
          "🛡️ Гарантия на панели до 25 лет; сервис O&M постоянно контролирует работу системы."]
    },
    {
      k: ["finans", "kredi", "leasing", "taksit", "pesin", "financ", "credit", "kredit", "finanzierung", "кредит", "лизинг", "рассрочк"],
      a: ["💳 Finansman & leasing seçenekleriyle peşin sermaye gerekmeden başlayabilirsiniz. Detayları keşif sırasında netleştiririz.",
          "💳 With financing & leasing options you can start without upfront capital. We'll clarify the details during the survey.",
          "💳 Mit Finanzierungs- & Leasingoptionen starten Sie ohne Eigenkapital. Details klären wir bei der Vor-Ort-Analyse.",
          "💳 Финансирование и лизинг позволяют начать без первоначального капитала. Детали уточним при выезде."],
      lead: true
    },
    {
      k: ["batarya", "depolama", "gece", "aku", "battery", "storage", "batterie", "speicher", "аккумулятор", "батаре", "накопител"],
      a: ["🔋 Enerji depolama (batarya) ile öz tüketiminizi artırıp gece de kullanabilirsiniz. İhtiyacınıza göre boyutlandırırız.",
          "🔋 With energy storage (battery) you increase self-consumption and use solar power at night too. We size it to your needs.",
          "🔋 Mit Energiespeicher (Batterie) erhöhen Sie den Eigenverbrauch und nutzen Solarstrom auch nachts. Wir dimensionieren nach Bedarf.",
          "🔋 Накопитель (аккумулятор) повышает собственное потребление — солнечная энергия доступна и ночью. Подберём по вашим нуждам."]
    },
    {
      k: ["nerede", "bolge", "manavgat", "antalya", "alanya", "side", "serik", "hizmet bolge", "where", "region", "area", "standort", "регион", "где", "район"],
      a: ["📍 Manavgat merkezli olarak Side, Antalya, Alanya, Serik, Gazipaşa ve çevresinde; talebe göre tüm Türkiye'de hizmet veriyoruz.",
          "📍 Based in Manavgat, we serve Side, Antalya, Alanya, Serik, Gazipaşa and the region; across Türkiye on request.",
          "📍 Mit Sitz in Manavgat bedienen wir Side, Antalya, Alanya, Serik, Gazipaşa und Umgebung; auf Anfrage die ganze Türkei.",
          "📍 Мы из Манавгата: работаем в Сиде, Анталье, Алании, Серике, Газипаше и окрестностях; по запросу — по всей Турции."]
    },
    {
      k: ["iletisim", "telefon", "ara", "adres", "ulas", "whatsapp", "contact", "phone", "address", "kontakt", "adresse", "контакт", "телефон", "адрес", "связ"],
      a: null, // dinamik — aşağıda contactAnswer()
      link: { t: ["İletişim sayfası", "Contact page", "Kontaktseite", "Страница контактов"], u: "iletisim.html" }
    },
    {
      k: ["proje", "referans", "ornek", "project", "reference", "projekt", "referenz", "проект", "референс", "пример"],
      a: ["📷 Sanayi, tarım ve konut projelerimizden örnekleri inceleyebilirsiniz.",
          "📷 Browse examples of our industrial, agricultural and residential projects.",
          "📷 Sehen Sie Beispiele unserer Industrie-, Landwirtschafts- und Wohnprojekte.",
          "📷 Примеры наших промышленных, аграрных и жилых проектов."],
      link: { t: ["Projeler", "Projects", "Projekte", "Проекты"], u: "projeler.html" }
    },
    {
      k: ["su isitici", "isitici", "isitma", "sicak su", "termosifon", "boyler", "fotovoltaik su", "pv su", "water heater", "hot water", "warmwasser", "boiler", "водонагревател", "горячая вода", "бойлер"],
      a: ["🔆 PV güneş su ısıtıcımız suyu güneş enerjisiyle ısıtır; bulutlu havada otomatik şebeke desteğine geçer. 60–200 L emaye tank, akıllı GF-20 kontrol. Sıcak su faturanızı düşürür.",
          "🔆 Our PV solar water heater heats water directly with solar energy and switches to automatic grid backup on cloudy days. 60–200 L enamel tank, smart GF-20 controller.",
          "🔆 Unser PV-Warmwasserbereiter erwärmt Wasser direkt mit Solarenergie; bei Bewölkung automatische Netz-Reserve. 60–200-L-Emailtank, smarter GF-20-Regler.",
          "🔆 PV-водонагреватель греет воду солнечной энергией; в пасмурную погоду автоматически подключается сеть. Эмалевый бак 60–200 л, умный контроллер GF-20."],
      link: { t: ["Solar Su Isıtıcı", "Solar Water Heater", "Solar-Warmwasserbereiter", "Солнечный водонагреватель"], u: "su-isitici.html" }
    },
    {
      k: ["havuz", "cankurtaran", "bogulma", "aquapark", "havuz guvenlik", "lifeguard", "drowning", "pool safety", "pool", "ertrinken", "rettungsschwimmer", "бассейн", "утоплен", "спасател", "аквапарк"],
      a: ["🏊 AI Cankurtaran Destek Sistemi: yapay zekâ destekli kameralar havuzu 7/24 tarar, risk algılanınca cankurtaranın akıllı saatine saniyeler içinde konumlu alarm gönderir. Otel, aquapark, belediye ve site havuzları için; ISO 20380 uyumlu, KVKK uyumlu yerel veri işleme. Ücretsiz keşif ve pilot teklifi sunuyoruz.",
          "🏊 AI Lifeguard Support System: AI-powered cameras scan the pool 24/7 and alert lifeguards within seconds with the swimmer's location. For hotels, water parks, municipal and residential pools; ISO 20380-aligned, privacy-compliant local processing. Free site survey and pilot offer available.",
          "🏊 KI-Rettungsschwimmer-Assistenzsystem: KI-Kameras überwachen das Becken 24/7 und alarmieren Rettungsschwimmer in Sekunden mit Positionsangabe. Für Hotels, Aquaparks, kommunale und Wohnanlagen-Pools; ISO-20380-konform, lokale Datenverarbeitung. Kostenlose Vor-Ort-Analyse möglich.",
          "🏊 ИИ-система поддержки спасателей: камеры с ИИ сканируют бассейн 24/7 и за секунды оповещают спасателей с координатами. Для отелей, аквапарков, муниципальных бассейнов и ЖК; по ISO 20380, локальная обработка данных. Бесплатный выезд и пилот."],
      link: { t: ["AI Cankurtaran Destek Sistemi", "AI Lifeguard Support System", "KI-Assistenzsystem", "ИИ-система поддержки спасателей"], u: "ai-cankurtaran-destek-sistemi.html" }
    },
    {
      k: ["paket", "urun", "hazir", "kac kwp", "kwp", "off grid", "offgrid", "tasinabilir", "karavan", "jel aku", "lityum", "lifepo", "sulama paket", "package", "kit", "portable", "caravan", "bausatz", "tragbar", "комплект", "пакет", "караван"],
      a: ["📦 Hazır paketlerimiz: 285W tak-çalıştır kit (TV/ışık/şarj) ve 2×540W LiFePO₄ bataryalı Tam Kapsamlı sistem (buzdolabı/çamaşır/bulaşık). Detay sayfalarında fiyat, galeri ve özellikler var. (Daha büyük sistemler proje bazlı: Sistem Kurucu'yu deneyin.)",
          "📦 Ready packages: portable off-grid lithium-battery kits (285 W – 8 kW; cabins/caravans/huts) and agricultural irrigation packages — each with clear power, panel count and approx. price. (Rooftop/on-grid systems are quoted per project.)",
          "📦 Fertige Pakete: das 285-W-Plug-and-Play-Set (TV/Licht/Laden) und das Komplettsystem 2×540 W mit LiFePO₄-Batterie (Kühlschrank/Wasch-/Spülmaschine). Detailseiten mit Preis, Galerie und Daten. (Größere Anlagen projektbezogen: System-Builder testen.)",
          "📦 Готовые комплекты: 285 Вт подключи-и-работай (ТВ/свет/зарядка) и полная система 2×540 Вт с батареей LiFePO₄ (холодильник/стиральная/посудомоечная). На страницах товаров — цены, галерея и характеристики."],
      link: { t: ["Paket ürünler", "Solar packages", "Solar-Pakete", "Солнечные пакеты"], u: "urunler.html" }
    }
  ];

  function contactAnswer() {
    var tel = (C.phone && C.phone.display) || "";
    // Dilden bağımsız saat gösterimi config'ten (Mo-Fr 09:00-18:00); TR'de okunur biçim
    var hrsTr = C.hours || "Hafta içi 09:00 – 18:00";
    var hrsIntl = C.openingHours || "Mo-Fr 09:00-18:00";
    return L("📞 Bize " + (tel || "telefon") + " numarasından veya WhatsApp'tan ulaşabilirsiniz. Çalışma saatleri: " + hrsTr + ".",
             "📞 You can reach us at " + (tel || "our phone") + " or on WhatsApp. Working hours: " + hrsIntl + ".",
             "📞 Sie erreichen uns unter " + (tel || "Telefon") + " oder per WhatsApp. Erreichbar: " + hrsIntl + ".",
             "📞 Свяжитесь с нами по номеру " + (tel || "телефона") + " или в WhatsApp. Часы работы: " + hrsIntl + ".");
  }

  // Hızlı seçim çipleri — etiket çok dilli, sorgu TR (anahtar kelimeler TR içerir)
  function quickItems() {
    return [
      { t: L("📲 WhatsApp'tan görüş", "📲 Chat on WhatsApp", "📲 Per WhatsApp", "📲 Написать в WhatsApp"), q: "__wa__" },
      { t: L("🌾 Tarımsal sulama", "🌾 Solar irrigation", "🌾 Solarbewässerung", "🌾 Солнечный полив"), q: "tarımsal sulama" },
      { t: L("🏠 Çatı GES", "🏠 Rooftop solar", "🏠 Aufdach-PV", "🏠 Крышная СЭС"), q: "çatı ges" },
      { t: L("🔆 Solar Su Isıtıcı", "🔆 Water heater", "🔆 Warmwasser", "🔆 Водонагреватель"), q: "su ısıtıcı" },
      { t: L("📦 Paketler", "📦 Packages", "📦 Pakete", "📦 Пакеты"), q: "paket ürün" },
      { t: L("💰 Teklif / Fiyat", "💰 Quote / Price", "💰 Angebot / Preis", "💰 КП / Цена"), q: "teklif fiyat" },
      { t: L("🧮 Hesaplama", "🧮 Calculator", "🧮 Rechner", "🧮 Калькулятор"), q: "hesaplama tasarruf" }
    ];
  }

  var transcript = [];       // {who, text}
  var lead = { name: "", phone: "", note: "" };
  var mode = "chat";         // chat | askName | askPhone | askNote | done
  var panel, body, input, launcher;

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
      var a = doc.createElement("a"); a.className = "gchat-link"; a.href = link.u; a.textContent = "→ " + pick(link.t);
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

  function startLead() {
    mode = "askName";
    add("bot", L("Memnuniyetle! Talebinizi uzman ekibimize iletelim. 🙂", "Gladly! Let's forward your request to our expert team. 🙂", "Sehr gern! Wir leiten Ihre Anfrage an unser Expertenteam weiter. 🙂", "С удовольствием! Передадим вашу заявку нашим специалистам. 🙂"));
    add("bot", L("Adınız soyadınız nedir?", "What is your full name?", "Wie ist Ihr Vor- und Nachname?", "Как вас зовут (имя и фамилия)?"));
    consentLine();
  }

  function consentLine() {
    var w = doc.createElement("div"); w.className = "gchat-consent";
    w.innerHTML = L('Devam ederek <a href="/kvkk.html" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>\'ni kabul etmiş olursunuz.',
                    'By continuing you accept the <a href="/kvkk.html" target="_blank" rel="noopener">privacy notice (KVKK)</a>.',
                    'Mit dem Fortfahren akzeptieren Sie die <a href="/kvkk.html" target="_blank" rel="noopener">Datenschutzhinweise (KVKK)</a>.',
                    'Продолжая, вы принимаете <a href="/kvkk.html" target="_blank" rel="noopener">уведомление о персональных данных (KVKK)</a>.');
    body.appendChild(w);
  }

  // Tüm sohbet + iletişim bilgisini tek mesaj olarak derle (işletmeye gider — TR başlık)
  function buildMsg() {
    var lines = [];
    lines.push("Yeni site asistanı talebi:");
    if (lead.name) lines.push("Ad: " + lead.name);
    if (lead.phone) lines.push("Tel: " + lead.phone);
    if (lead.note) lines.push("Not: " + lead.note);
    lines.push("");
    lines.push("— Sohbet —");
    transcript.forEach(function (m) { lines.push((m.who === "user" ? "👤 " : "🤖 ") + m.text); });
    return lines.join("\n");
  }

  function sendButtons(waLabel) {
    var msg = buildMsg();
    var w = doc.createElement("div"); w.className = "gchat-actions";
    if (WA) {
      var wa = doc.createElement("a"); wa.className = "gchat-send wa";
      wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
      wa.target = "_blank"; wa.rel = "noopener";
      wa.textContent = waLabel || L("📲 WhatsApp'tan devam et", "📲 Continue on WhatsApp", "📲 Weiter per WhatsApp", "📲 Продолжить в WhatsApp");
      w.appendChild(wa);
    }
    if (MAIL) {
      var em = doc.createElement("a"); em.className = "gchat-send mail";
      em.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Site asistanı talebi — " + (lead.name || "Ziyaretçi")) + "&body=" + encodeURIComponent(msg);
      em.textContent = L("✉️ E-posta ile gönder", "✉️ Send by e-mail", "✉️ Per E-Mail senden", "✉️ Отправить по e-mail");
      w.appendChild(em);
    }
    body.appendChild(w); body.scrollTop = body.scrollHeight;
  }

  // Hibrit devir: sohbeti olduğu gibi WhatsApp'a taşı
  function waHandoff() {
    if (!WA) { add("bot", L("Bizi " + ((C.phone && C.phone.display) || "telefondan") + " arayabilirsiniz.", "You can call us at " + ((C.phone && C.phone.display) || "our phone") + ".", "Rufen Sie uns an: " + ((C.phone && C.phone.display) || "Telefon") + ".", "Позвоните нам: " + ((C.phone && C.phone.display) || "телефон") + ".")); return; }
    add("bot", L("Harika! 👇 Butona dokunun; sohbetin tamamı ve bilgileriniz hazır şekilde WhatsApp'ta açılacak, oradan canlı devam edebiliriz.",
                 "Great! 👇 Tap the button — the whole chat and your details will open ready in WhatsApp, and we can continue live from there.",
                 "Super! 👇 Tippen Sie auf die Schaltfläche — der gesamte Chat öffnet sich fertig in WhatsApp, dort geht es live weiter.",
                 "Отлично! 👇 Нажмите кнопку — весь чат и ваши данные откроются в WhatsApp, продолжим там."));
    sendButtons(L("📲 WhatsApp'tan devam et", "📲 Continue on WhatsApp", "📲 Weiter per WhatsApp", "📲 Продолжить в WhatsApp"));
  }

  function finishLead() {
    mode = "done";
    add("bot", L("Teşekkürler " + lead.name + "! 🙌 WhatsApp'tan hemen devam edelim mi? Tüm konuşma ve bilgileriniz otomatik aktarılacak.",
                 "Thank you, " + lead.name + "! 🙌 Shall we continue on WhatsApp? The whole conversation and your details will be transferred automatically.",
                 "Danke, " + lead.name + "! 🙌 Machen wir per WhatsApp weiter? Das Gespräch und Ihre Angaben werden automatisch übernommen.",
                 "Спасибо, " + lead.name + "! 🙌 Продолжим в WhatsApp? Вся переписка и ваши данные передадутся автоматически."));
    sendButtons(L("📲 WhatsApp'tan gönder ve devam et", "📲 Send via WhatsApp & continue", "📲 Per WhatsApp senden & weiter", "📲 Отправить в WhatsApp и продолжить"));
  }

  function handleUser(text, label) {
    add("user", label || text);
    if (text === "__wa__") { waHandoff(); return; }   // WhatsApp'a hibrit devir
    if (mode === "askName") {
      lead.name = text.trim();
      mode = "askPhone";
      add("bot", L("Teşekkürler. Size ulaşabileceğimiz telefon numaranız?", "Thanks. What phone number can we reach you at?", "Danke. Unter welcher Telefonnummer erreichen wir Sie?", "Спасибо. По какому номеру телефона с вами связаться?"));
      return;
    }
    if (mode === "askPhone") {
      lead.phone = text.trim();
      mode = "askNote";
      add("bot", L("Son olarak, kısaca ihtiyacınız nedir? (Örn. çatı GES, tarımsal sulama, tüketim) — yazabilir veya 'geç' diyebilirsiniz.",
                   "Lastly, what do you need in short? (e.g. rooftop solar, irrigation, consumption) — or type 'skip'.",
                   "Zum Schluss: Was benötigen Sie kurz gesagt? (z. B. Aufdach-PV, Bewässerung, Verbrauch) — oder 'überspringen' schreiben.",
                   "И последнее: что вам нужно, вкратце? (напр. крышная СЭС, полив, потребление) — или напишите «пропустить»."));
      return;
    }
    if (mode === "askNote") {
      var n = norm(text);
      var isSkip = n.indexOf("gec") >= 0 || n.indexOf("skip") >= 0 || n.indexOf("uberspringen") >= 0 || n.indexOf("пропустить") >= 0;
      if (!isSkip) lead.note = text.trim();
      finishLead();
      return;
    }
    // Normal sohbet
    var hit = match(text);
    if (hit) {
      botAnswer(hit.a ? pick(hit.a) : contactAnswer(), hit.link);
      if (hit.lead) { setTimeout(function () { startLead(); }, 300); }
      else {
        setTimeout(function () {
          add("bot", L("Başka bir konuda yardımcı olayım mı, yoksa ücretsiz teklif mi istersiniz?", "Can I help with anything else, or would you like a free quote?", "Kann ich sonst noch helfen, oder möchten Sie ein kostenloses Angebot?", "Помочь с чем-то ещё или хотите бесплатное КП?"));
          quickRow([{ t: L("💬 Ücretsiz teklif iste", "💬 Request a free quote", "💬 Kostenloses Angebot", "💬 Запросить КП"), q: "teklif" }].concat(quickItems().slice(0, 3)));
        }, 300);
      }
    } else {
      add("bot", L("Bunu en doğru şekilde uzmanımız yanıtlasın istiyorum. İsterseniz birkaç bilginizi alıp talebinizi ileteyim, ya da aşağıdaki başlıklardan seçin:",
                   "I'd like our expert to answer that properly. I can take a few details and forward your request, or choose a topic below:",
                   "Das soll am besten unser Experte beantworten. Ich kann Ihre Anfrage aufnehmen und weiterleiten, oder wählen Sie ein Thema:",
                   "Лучше на это ответит наш специалист. Могу записать данные и передать вашу заявку — или выберите тему ниже:"));
      quickRow([{ t: L("💬 Teklif iste", "💬 Request a quote", "💬 Angebot anfordern", "💬 Запросить КП"), q: "teklif" }].concat(quickItems()));
    }
  }

  function greet() {
    if (body.dataset.greeted) return; body.dataset.greeted = "1";
    add("bot", L("Merhaba! 👋 GESPA Enerji asistanıyım. Güneş enerjisi, tarımsal sulama, fiyat/teklif veya hesaplama hakkında sorabilirsiniz.",
                 "Hi! 👋 I'm the GESPA Energy assistant. Ask me about solar energy, irrigation, prices/quotes or the calculator.",
                 "Hallo! 👋 Ich bin der GESPA-Energy-Assistent. Fragen Sie zu Solarenergie, Bewässerung, Preisen/Angeboten oder dem Rechner.",
                 "Здравствуйте! 👋 Я ассистент GESPA Energy. Спрашивайте о солнечной энергии, поливе, ценах/КП или калькуляторе."));
    quickRow(quickItems());
  }

  // Statik arayüz metinlerini aktif dile göre güncelle (dil değişiminde de çağrılır)
  function applyUiLang() {
    if (launcher) {
      launcher.setAttribute("aria-label", L("Asistan ile sohbet", "Chat with the assistant", "Mit dem Assistenten chatten", "Чат с ассистентом"));
      var tx = launcher.querySelector(".gchat-fab-tx");
      if (tx) tx.textContent = L("Asistan", "Assistant", "Assistent", "Ассистент");
    }
    if (panel) {
      var small = panel.querySelector(".gchat-head small");
      if (small) small.textContent = L("Genelde birkaç dakikada yanıt", "Usually replies in minutes", "Antwortet meist in Minuten", "Обычно отвечает за несколько минут");
      if (input) {
        input.setAttribute("placeholder", L("Mesajınızı yazın...", "Type your message...", "Nachricht schreiben...", "Введите сообщение..."));
        input.setAttribute("aria-label", L("Mesaj", "Message", "Nachricht", "Сообщение"));
      }
    }
  }

  function build() {
    // Tek sohbet butonu (sağ alt) — tıklayınca doğrudan asistan açılır
    launcher = doc.createElement("button");
    launcher.className = "gchat-fab"; launcher.type = "button";
    launcher.innerHTML = '<span class="gchat-fab-ic">🤖</span><span class="gchat-fab-tx">Asistan</span>';
    doc.body.appendChild(launcher);

    panel = doc.createElement("div"); panel.className = "gchat"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "GESPA Asistan sohbeti");
    panel.innerHTML =
      '<div class="gchat-head"><span class="gchat-ava">🤖</span><div><strong>GESPA Asistan</strong><small></small></div><button class="gchat-close" type="button" aria-label="Kapat">×</button></div>' +
      '<div class="gchat-body" id="gchatBody" aria-live="polite"></div>' +
      '<form class="gchat-foot" id="gchatForm"><input id="gchatInput" type="text" autocomplete="off" placeholder="" aria-label="Mesaj" /><button type="submit" aria-label="Gönder">➤</button></form>';
    doc.body.appendChild(panel);

    body = panel.querySelector("#gchatBody");
    input = panel.querySelector("#gchatInput");
    applyUiLang();
    doc.addEventListener("gespa:lang", applyUiLang);

    function openChat() { panel.classList.add("open"); launcher.classList.add("hide"); greet(); setTimeout(function () { input.focus(); }, 100); }
    function closeChat() { panel.classList.remove("open"); launcher.classList.remove("hide"); launcher.focus(); }

    launcher.addEventListener("click", openChat);
    panel.querySelector(".gchat-close").addEventListener("click", closeChat);
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) closeChat(); });
    panel.querySelector("#gchatForm").addEventListener("submit", function (e) {
      e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ""; handleUser(v);
    });
  }

  if (doc.readyState !== "loading") build(); else doc.addEventListener("DOMContentLoaded", build);
})();
