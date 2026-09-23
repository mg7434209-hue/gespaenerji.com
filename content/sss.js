// SSS merkezi (sss.html) — editoryal kaynak. Tuple: [Türkçe, English, Deutsch, Русский].
//
// build.js bu dosyadan üç bölge doldurur:
//  · FAQGEN:STATIC — `general`: yalnız bu sayfaya ait genel sorular. Sayfanın
//    FAQPage şemasına bunlar GİRER.
//  · FAQTOC:STATIC — konu bağlantıları (Genel + `groups` sırası).
//  · FAQHUB:STATIC — `groups`: diğer sayfaların görünen SSS'leri, kaynak
//    sayfasındaki HTML'den her build'de toplanır. Kaynak sayfada zaten
//    işaretli oldukları için buradaki FAQPage şemasına GİRMEZ (Google aynı
//    soru-cevabın sitede tek yerde işaretlenmesini ister).
// Yeni sayfa SSS'i eklemek = o sayfaya .faq-item yazmak + buraya grup satırı.
// Çeviriler build'de sözlüğe eklenir; sözlükte ZATEN olan anahtar ezilmez.
module.exports = {
  labels: {
    title: ["Sıkça Sorulan Sorular", "Frequently Asked Questions", "Häufige Fragen", "Частые вопросы"],
    lead: [
      "Güneş enerjisi, ürünlerimiz, sipariş ve kurulum hakkında merak edilenlerin tamamı tek sayfada. Aradığınızı bulamazsanız bize yazın.",
      "Everything people ask about solar power, our products, ordering and installation, on one page. If you cannot find your answer, write to us.",
      "Alles, was man über Solarenergie, unsere Produkte, Bestellung und Montage wissen möchte, auf einer Seite. Wenn Sie Ihre Antwort nicht finden, schreiben Sie uns.",
      "Все ответы о солнечной энергии, наших товарах, заказе и монтаже на одной странице. Если не нашли ответ, напишите нам."
    ],
    toc: ["Konular", "Topics", "Themen", "Темы"],
    generalKicker: ["Genel", "General", "Allgemein", "Общее"],
    generalTitle: ["Güneş enerjisi hakkında temel sorular", "Basic questions about solar power", "Grundfragen zur Solarenergie", "Основные вопросы о солнечной энергии"],
    source: ["Sayfaya git →", "Go to page →", "Zur Seite →", "Перейти на страницу →"],
    ctaTitle: ["Sorunuzun cevabını bulamadınız mı?", "Didn't find your answer?", "Keine Antwort gefunden?", "Не нашли ответ?"],
    ctaText: [
      "Sorunuzu iletin, ekibimiz size dönüş yapsın.",
      "Send us your question and our team will get back to you.",
      "Senden Sie uns Ihre Frage, unser Team meldet sich bei Ihnen.",
      "Задайте вопрос, и наша команда свяжется с вами."
    ],
    allQuestions: ["Tüm sorular →", "All questions →", "Alle Fragen →", "Все вопросы →"]
  },

  // [soru, cevap, isteğe bağlı bağlantı {href, text}] — bağlantı KENDİ
  // paragrafında durur (cümlenin ortasındaki <a> gövde çevirisini böler)
  // ve şemadaki cevap metnine girmez.
  general: [
    [
      ["Şebeke bağlantılı (on-grid), şebekesiz (off-grid) ve hibrit sistem arasındaki fark nedir?",
       "What is the difference between on-grid, off-grid and hybrid systems?",
       "Was ist der Unterschied zwischen netzgekoppelten, netzunabhängigen und hybriden Anlagen?",
       "Чем отличаются сетевая (on-grid), автономная (off-grid) и гибридная системы?"],
      ["On-grid sistem şebekeye bağlı çalışır: üretilen elektrik önce binada tüketilir, fazlası şebekeye verilir. Off-grid sistem şebekeden bağımsızdır; panel, akü ve inverterle kendi elektriğini üretip depolar ve bağ evi, karavan ya da tarla gibi şebekenin olmadığı yerlerde kullanılır. Hibrit sistem ikisini birleştirir: şebekeye bağlıdır, aynı zamanda akü kullanır ve kesintide seçilen yükleri beslemeye devam eder.",
       "An on-grid system works connected to the grid: the electricity it produces is used in the building first and the surplus is fed into the grid. An off-grid system is independent of the grid; it generates and stores its own electricity with panels, a battery and an inverter, and is used where there is no grid, such as cabins, caravans or fields. A hybrid system combines the two: it is grid-connected but also uses a battery and keeps selected loads running during an outage.",
       "Eine netzgekoppelte Anlage arbeitet am Stromnetz: Der erzeugte Strom wird zuerst im Gebäude verbraucht, der Überschuss ins Netz eingespeist. Eine netzunabhängige Anlage erzeugt und speichert ihren Strom selbst mit Modulen, Akku und Wechselrichter und wird dort eingesetzt, wo es kein Netz gibt, etwa im Gartenhaus, im Wohnmobil oder auf dem Feld. Eine Hybridanlage verbindet beides: Sie ist ans Netz angeschlossen, nutzt aber auch einen Akku und versorgt bei einem Stromausfall ausgewählte Verbraucher weiter.",
       "Сетевая (on-grid) система работает с подключением к сети: выработанная энергия сначала потребляется в здании, а излишек отдаётся в сеть. Автономная (off-grid) система не зависит от сети: она сама вырабатывает и накапливает энергию с помощью панелей, аккумулятора и инвертора и применяется там, где сети нет, например на даче, в караване или в поле. Гибридная система объединяет оба варианта: она подключена к сети, но использует и аккумулятор, продолжая питать выбранные потребители при отключении."]
    ],
    [
      ["Elektrik kesintisinde güneş enerjisi sistemi çalışır mı?",
       "Does a solar system keep working during a power cut?",
       "Funktioniert eine Solaranlage bei einem Stromausfall?",
       "Работает ли солнечная система при отключении электричества?"],
      ["Aküsüz şebeke bağlantılı (on-grid) sistemler, şebekede çalışan ekipleri korumak için kesintide otomatik olarak durur. Kesintide de elektrik istiyorsanız akülü hibrit ya da off-grid bir sistem gerekir; hangi cihazların besleneceği tasarımda belirlenir.",
       "Grid-connected systems without a battery shut down automatically during an outage to protect crews working on the grid. If you want power during outages too, you need a hybrid or off-grid system with a battery; which appliances are backed up is defined in the design.",
       "Netzgekoppelte Anlagen ohne Akku schalten sich bei einem Stromausfall automatisch ab, um die Monteure am Netz zu schützen. Wer auch bei Ausfällen Strom möchte, braucht eine Hybrid- oder Inselanlage mit Akku; welche Geräte versorgt werden, wird bei der Planung festgelegt.",
       "Сетевые системы без аккумулятора при отключении автоматически останавливаются, чтобы защитить бригады, работающие на сети. Если электричество нужно и во время отключений, требуется гибридная или автономная система с аккумулятором; какие приборы будут резервироваться, определяется при проектировании."]
    ],
    [
      ["Bulutlu havada ve kışın paneller elektrik üretir mi?",
       "Do panels produce electricity on cloudy days and in winter?",
       "Erzeugen die Module auch bei Bewölkung und im Winter Strom?",
       "Вырабатывают ли панели электричество в пасмурную погоду и зимой?"],
      ["Evet. Paneller yalnız doğrudan güneşten değil dağınık ışıktan da üretir; bulutlu havada ve kısa kış günlerinde üretim düşer ama durmaz. Tasarruf hesapları yıllık üretime göre yapıldığı için mevsim farkları hesaba katılmış olur.",
       "Yes. Panels generate from diffuse light as well as direct sunshine; output drops on cloudy days and short winter days but does not stop. Savings estimates are based on annual yield, so seasonal differences are already taken into account.",
       "Ja. Module erzeugen nicht nur bei direkter Sonne, sondern auch bei diffusem Licht Strom; bei Bewölkung und an kurzen Wintertagen sinkt der Ertrag, er fällt aber nicht aus. Einsparungen werden auf Basis des Jahresertrags berechnet, jahreszeitliche Unterschiede sind also bereits berücksichtigt.",
       "Да. Панели вырабатывают энергию не только от прямого солнца, но и от рассеянного света; в пасмурную погоду и короткие зимние дни выработка снижается, но не прекращается. Расчёт экономии ведётся по годовой выработке, поэтому сезонные различия уже учтены."]
    ],
    [
      ["Güneş panelleri kaç yıl kullanılır?",
       "How many years do solar panels last?",
       "Wie viele Jahre halten Solarmodule?",
       "Сколько лет служат солнечные панели?"],
      ["Kaliteli paneller onlarca yıl elektrik üretir; üreticiler genellikle 25–30 yıllık güç (performans) garantisi verir. Panel verimi yıllar içinde yavaşça azalır; yıllık kayıp oranı ve garanti süresi her panelin üretici künyesinde yazılır.",
       "Quality panels generate electricity for decades; manufacturers usually give a 25–30-year power (performance) warranty. Panel efficiency declines slowly over the years; the annual loss rate and the warranty period are stated in each panel's manufacturer data sheet.",
       "Hochwertige Module erzeugen jahrzehntelang Strom; Hersteller geben in der Regel eine Leistungsgarantie von 25–30 Jahren. Der Wirkungsgrad sinkt über die Jahre langsam; die jährliche Degradation und die Garantiedauer stehen im Datenblatt jedes Moduls.",
       "Качественные панели вырабатывают электроэнергию десятилетиями; производители обычно дают гарантию мощности 25–30 лет. КПД панели со временем медленно снижается; годовая потеря и срок гарантии указаны в паспорте каждой панели."]
    ],
    [
      ["Paneller dolu ve fırtınaya dayanıklı mı?",
       "Are the panels resistant to hail and storms?",
       "Sind die Module hagel- und sturmfest?",
       "Выдерживают ли панели град и штормовой ветер?"],
      ["Sertifikalı paneller IEC 61215 standardının dolu ve mekanik yük testlerinden geçer. Rüzgâr ve kar yükü dayanımı her panelin künyesinde yazılır; montaj sisteminin de bölgenin rüzgâr koşullarına uygun seçilmesi gerekir.",
       "Certified panels pass the hail and mechanical load tests of the IEC 61215 standard. Wind and snow load ratings are stated in each panel's data sheet, and the mounting system must also be chosen for the local wind conditions.",
       "Zertifizierte Module bestehen die Hagel- und mechanischen Lasttests der Norm IEC 61215. Die zulässige Wind- und Schneelast steht im Datenblatt jedes Moduls; auch das Montagesystem muss für die örtlichen Windverhältnisse ausgelegt sein.",
       "Сертифицированные панели проходят испытания на град и механическую нагрузку по стандарту IEC 61215. Стойкость к ветровой и снеговой нагрузке указана в паспорте каждой панели; крепёжную систему также нужно подбирать под ветровые условия региона."]
    ],
    [
      ["Online aldığım ürünü kendim kurabilir miyim?",
       "Can I install a product I bought online myself?",
       "Kann ich ein online gekauftes Produkt selbst installieren?",
       "Могу ли я сам установить товар, купленный онлайн?"],
      ["Tak-çalıştır paketler teknik bilgi gerektirmez: paneli gölgesiz bir yere koyup renk kodlu kabloları takmanız yeterlidir. Şebekeye ya da elektrik panosuna yapılan bağlantıları yetkin bir elektrikçi yapmalıdır; Antalya bölgesinde isteğe bağlı yerinde kurulum sunuyoruz.",
       "Plug-and-play kits need no technical knowledge: place the panel in a shade-free spot and connect the colour-coded cables. Connections to the grid or to an electrical panel must be made by a qualified electrician; in the Antalya region we offer optional on-site installation.",
       "Plug-and-Play-Sets erfordern kein Fachwissen: Modul schattenfrei aufstellen und die farbcodierten Kabel anschließen. Anschlüsse ans Netz oder an einen Verteiler muss eine Elektrofachkraft ausführen; in der Region Antalya bieten wir optional die Montage vor Ort an.",
       "Комплекты «включи и работай» не требуют технических знаний: поставьте панель в место без тени и подключите кабели с цветовой маркировкой. Подключение к сети или к электрощиту должен выполнять квалифицированный электрик; в регионе Анталья мы по желанию выполняем монтаж на месте."]
    ],
    [
      ["Ürünleri nasıl satın alabilirim?",
       "How can I buy the products?",
       "Wie kann ich die Produkte kaufen?",
       "Как купить товары?"],
      ["Online Satış sayfasında ürünü sepete ekleyip kredi kartıyla ya da havale/EFT ile ödeyebilirsiniz; ürün sayfalarındaki “Hemen satın al” düğmesi ürünü sepete ekleyip sizi doğrudan sepete götürür. Toptan alımlar için Toptan Satış sayfasından teklif isteyebilirsiniz.",
       "Add the product to your cart on the Online Store page and pay by credit card or bank transfer; the “Buy it now” button on product pages adds the item and takes you straight to the cart. For wholesale purchases you can request a quote on the Wholesale page.",
       "Legen Sie das Produkt im Onlineshop in den Warenkorb und bezahlen Sie per Kreditkarte oder Überweisung; der Button „Jetzt kaufen“ auf den Produktseiten legt den Artikel in den Warenkorb und führt Sie direkt dorthin. Für Großmengen können Sie auf der Großhandelsseite ein Angebot anfordern.",
       "Добавьте товар в корзину на странице интернет-магазина и оплатите картой или банковским переводом; кнопка «Купить сейчас» на страницах товаров добавляет товар и сразу открывает корзину. Для оптовых закупок запросите предложение на странице оптовых продаж."],
      { href: "online-satis.html", text: ["Online Satış →", "Online store →", "Zum Onlineshop →", "Интернет-магазин →"] }
    ]
  ],

  // Diğer sayfaların SSS'leri — hub'daki sıra ve grup başlıkları
  groups: [
    { file: "index.html", title: ["Güneş enerjisine başlarken", "Getting started with solar", "Einstieg in die Solarenergie", "С чего начать"] },
    { file: "hizmetler.html", title: ["Hizmetler, garanti ve finansman", "Services, warranty and financing", "Leistungen, Garantie und Finanzierung", "Услуги, гарантия и финансирование"] },
    { file: "cati-ges.html", title: ["Çatı GES kurulumu", "Rooftop solar installation", "Montage von Aufdachanlagen", "Монтаж солнечных станций на крыше"] },
    { file: "arazi-ges.html", title: ["Arazi tipi GES", "Ground-mounted solar", "Freiflächen-PV", "Наземные солнечные станции"] },
    { file: "enerji-depolama.html", title: ["Enerji depolama ve batarya", "Energy storage and batteries", "Energiespeicher und Batterien", "Накопители энергии и аккумуляторы"] },
    { file: "bakim-izleme.html", title: ["Bakım ve izleme", "Maintenance and monitoring", "Wartung und Monitoring", "Обслуживание и мониторинг"] },
    { file: "tarimsal-sulama.html", title: ["Tarımsal sulama", "Agricultural irrigation", "Landwirtschaftliche Bewässerung", "Аграрный полив"] },
    { file: "hesaplayici.html", title: ["Maliyet ve hesaplayıcı", "Cost and calculator", "Kosten und Rechner", "Стоимость и калькулятор"] },
    { file: "sistem-kur.html", title: ["Off-grid sistem kurma", "Building an off-grid system", "Inselanlage zusammenstellen", "Сборка автономной системы"] },
    { file: "online-satis.html", title: ["Sipariş, kargo ve ödeme", "Orders, shipping and payment", "Bestellung, Versand und Zahlung", "Заказ, доставка и оплата"] },
    { file: "urunler.html", title: ["Hazır solar paketler", "Ready-made solar kits", "Fertige Solarsets", "Готовые солнечные комплекты"] },
    { file: "paket-285w.html", title: ["Tak-çalıştır 285 W paket", "Plug-and-play 285 W kit", "Plug-and-Play-Set 285 W", "Комплект 285 Вт «включи и работай»"] },
    { file: "paket-2x540w.html", title: ["2×540 W LiFePO₄ bataryalı sistem", "2×540 W system with LiFePO₄ battery", "2×540-W-System mit LiFePO₄-Akku", "Система 2×540 Вт с аккумулятором LiFePO₄"] },
    { file: "unv-trek-pro-2500.html", title: ["Taşınabilir güç istasyonu (UNV Trek Pro 2500)", "Portable power station (UNV Trek Pro 2500)", "Tragbare Powerstation (UNV Trek Pro 2500)", "Портативная электростанция (UNV Trek Pro 2500)"] },
    { file: "su-isitici.html", title: ["PV güneş enerjili su ısıtıcı", "PV solar water heater", "PV-Solar-Warmwasserbereiter", "Фотоэлектрический водонагреватель"] },
    { file: "elektrikli-arac-donusum.html", title: ["Elektrikli araç güneş dönüşümü (BOOST MPPT)", "EV solar conversion (BOOST MPPT)", "Solarumrüstung für E-Fahrzeuge (BOOST MPPT)", "Солнечное переоснащение электротранспорта (BOOST MPPT)"] },
    { file: "paket-motor-yolcu.html", title: ["Yolcu kabinli motor paketi (285 W)", "Passenger-cab e-trike set (285 W)", "Solar-Set für Fahrgast-Dreirad (285 W)", "Комплект для пассажирского трицикла (285 Вт)"] },
    { file: "paket-motor-kargo.html", title: ["Kargo kasalı motor paketi (655 W)", "Cargo-bed e-trike set (655 W)", "Solar-Set für Lasten-Dreirad (655 W)", "Комплект для грузового трицикла (655 Вт)"] },
    { file: "aku-lifepo4-72v-30ah.html", title: ["72 V LiFePO₄ çekiş aküsü", "72 V LiFePO₄ traction battery", "72-V-LiFePO₄-Traktionsakku", "Тяговый аккумулятор LiFePO₄ 72 В"] },
    { file: "ai-cankurtaran-destek-sistemi.html", title: ["Havuz güvenliği — AI Cankurtaran", "Pool safety — AI Lifeguard", "Poolsicherheit — KI-Rettungsschwimmer-Assistenz", "Безопасность бассейна — ИИ-поддержка спасателей"] },
    { file: "toptan.html", title: ["Toptan satış (B2B)", "Wholesale (B2B)", "Großhandel (B2B)", "Оптовые продажи (B2B)"] },
    { file: "iletisim.html", title: ["İletişim ve keşif", "Contact and site survey", "Kontakt und Vor-Ort-Termin", "Контакты и выезд на объект"] }
  ]
};
