/* ============================================================
   GESPA Enerji — Çok dilli destek (TR varsayılan · DE · RU)
   Metinler TR kaynağına göre çevrilir; eşleşmeyen string TR kalır.
   Yeni çeviri eklemek için yalnızca DICT/PH/UNITS'e satır ekleyin.
   ============================================================ */
(function () {
  "use strict";
  window.GESPA = window.GESPA || {};
  var LS = "gespa-lang";

  // Birim kelimeleri (hesaplayıcı sonuçları için)
  var UNITS = {
    tr: { yil: "yıl", yilPlus: "25+ yıl", ay: "ay", adet: "adet", agac: "ağaç", ton: "ton", km: "km", year: "yıl", added: "Eklenmedi" },
    de: { yil: "Jahre", yilPlus: "25+ Jahre", ay: "Monat", adet: "Stk.", agac: "Bäume", ton: "t", km: "km", year: "Jahr", added: "Nicht hinzugefügt" },
    ru: { yil: "лет", yilPlus: "25+ лет", ay: "мес", adet: "шт.", agac: "деревьев", ton: "т", km: "км", year: "год", added: "Не добавлено" }
  };

  // Zengin (iç HTML) çeviriler — yalnızca [data-i18n-html] elemanları
  var HTMLMAP = {
    "#heroTitle": {
      tr: 'Güneşten <span class="hl">kazanca</span> dönüşen enerji.',
      de: 'Energie, die aus Sonne <span class="hl">Gewinn</span> macht.',
      ru: 'Энергия солнца, превращённая в <span class="hl">прибыль</span>.'
    }
  };

  // Input placeholder çevirileri
  var PH = {
    de: {
      "Adınız Soyadınız": "Vor- und Nachname", "05xx xxx xx xx": "05xx xxx xx xx",
      "ornek@mail.com": "beispiel@mail.com", "İl": "Stadt",
      "Aylık elektrik tüketiminiz, lokasyon vb.": "Monatlicher Stromverbrauch, Standort usw.",
      "E-posta adresiniz": "Ihre E-Mail-Adresse"
    },
    ru: {
      "Adınız Soyadınız": "Имя и фамилия", "05xx xxx xx xx": "05xx xxx xx xx",
      "ornek@mail.com": "primer@mail.com", "İl": "Город",
      "Aylık elektrik tüketiminiz, lokasyon vb.": "Месячное потребление, локация и т.д.",
      "E-posta adresiniz": "Ваш e-mail"
    }
  };

  var DICT = {
    de: {
      // Navigasyon
      "Ana Sayfa": "Startseite", "Hizmetler": "Leistungen", "Hesaplayıcı": "Rechner",
      "Projeler": "Projekte", "Hakkımızda": "Über uns", "İletişim": "Kontakt", "Teklif Al": "Angebot",
      // Topbar
      "☀️ 2026 GES teşvikleri açıklandı — yatırımınız için doğru zaman!": "☀️ Solarförderungen 2026 sind da — der richtige Zeitpunkt zu investieren!",
      "Tasarrufunu hesapla →": "Ersparnis berechnen →",
      "☀️ Hesaplama sonuçları tahminidir — kesin değer ücretsiz keşifle belirlenir.": "☀️ Ergebnisse sind Schätzungen — der genaue Wert wird vor Ort ermittelt.",
      "Keşif talep et →": "Vor-Ort-Termin →",
      "☀️ Hafta içi 09:00–18:00 · Hızlı dönüş için WhatsApp": "☀️ Mo–Fr 09:00–18:00 · Schnell per WhatsApp",
      "WhatsApp →": "WhatsApp →",
      // Hero
      "Anahtar Teslim Güneş Enerjisi Santralleri": "Schlüsselfertige Solarkraftwerke",
      "Çatı ve arazi tipi GES projelerinizde mühendislikten kuruluma, finansmandan bakıma kadar tüm süreci tek elden yönetiyoruz. Enerji maliyetlerinizi düşürün, karbon ayak izinizi azaltın.": "Von der Planung bis zur Installation, von der Finanzierung bis zur Wartung — wir managen Ihr Dach- oder Freiflächen-Solarprojekt aus einer Hand. Senken Sie Ihre Energiekosten und Ihren CO₂-Fußabdruck.",
      "Tasarrufumu Hesapla": "Ersparnis berechnen", "Ücretsiz Keşif": "Kostenlose Beratung",
      "Tamamlanan Proje": "Abgeschlossene Projekte", "Bölgede Kurulu Güç": "Installierte Leistung", "Sektör Deneyimi": "Branchenerfahrung",
      "⚡ Anahtar teslim kurulum": "⚡ Schlüsselfertig", "🌱 25 yıla varan garanti": "🌱 Bis zu 25 Jahre Garantie",
      "Güvendikleri kurumlar:": "Vertraut von:",
      // Hizmetler bölümü
      "Hizmetlerimiz": "Unsere Leistungen",
      "Projenizin her aşamasında yanınızdayız": "An Ihrer Seite in jeder Projektphase",
      "Fizibiliteden devreye almaya, bakımdan finansmana kadar uçtan uca çözüm.": "End-to-End-Lösung von der Machbarkeit bis zur Inbetriebnahme, von Wartung bis Finanzierung.",
      "Çatı GES": "Aufdach-Solar", "Arazi Tipi GES": "Freiflächen-Solar", "Enerji Depolama": "Energiespeicher",
      "Tarımsal Sulama": "Solar-Bewässerung", "Güneş enerjili pompalarla tarla ve sera sulaması; şebekeden bağımsız, mazotsuz çözüm.": "Feld- und Gewächshausbewässerung mit Solarpumpen — netzunabhängig und ohne Diesel.",
      "Tarımsal sulama": "Landw. Bewässerung", "Sulama pompası gücü (kW)": "Pumpenleistung (kW)", "Günlük çalışma (saat)": "Betrieb/Tag (Std.)", "Sulama sezonu (ay)": "Bewässerungssaison (Monate)",
      "🌾 Öne Çıkan Çözüm": "🌾 Hervorgehobene Lösung", "Tarımsal Sulama GES": "Solar-Bewässerung (GES)",
      "Mazot ve elektrik maliyetlerini sıfıra yaklaştırın. Güneş enerjili sulama pompası sistemleriyle tarlanızı/seranızı bağımsız ve sürdürülebilir şekilde sulayın — şebekeden uzak araziler için ideal.": "Senken Sie Diesel- und Stromkosten gegen null. Bewässern Sie Feld/Gewächshaus mit solaren Pumpensystemen — ideal für netzferne Flächen.",
      "Dalgıç ve yüzey pompalarına uygun": "Für Tauch- und Oberflächenpumpen", "Şebekeden bağımsız (off-grid) veya hibrit": "Netzunabhängig (Off-Grid) oder hybrid", "Sezonluk üretim profiline göre boyutlandırma": "Auslegung nach saisonalem Ertragsprofil",
      "Sulama hesaplaması yap": "Bewässerung berechnen",
      "Mühendislik & Tasarım": "Engineering & Design", "Finansman Desteği": "Finanzierung", "Bakım & İzleme (O&M)": "Wartung & Monitoring (O&M)",
      "Konut, ticari ve sanayi çatılarına özel tasarlanan, alanı verimli kullanan sistemler.": "Maßgeschneiderte, flächeneffiziente Systeme für Wohn-, Gewerbe- und Industriedächer.",
      "Lisanslı ve lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısı.": "Machbarkeit, Installation und Netzanschluss für lizenzierte und lizenzfreie Freiflächenanlagen.",
      "Batarya sistemleri ile üretilen enerjiyi depolayın, kesintide bile üretin.": "Speichern Sie erzeugte Energie mit Batteriesystemen — auch bei Ausfällen.",
      "Tüm hizmetleri gör →": "Alle Leistungen →",
      // Hesaplayıcı CTA (ana sayfa)
      "Tasarruf Hesaplayıcı": "Ersparnisrechner", "Çatınız ne kadar kazandırır?": "Wie viel bringt Ihr Dach?",
      "Faturanızı girin; sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancı saniyeler içinde görün.": "Geben Sie Ihre Rechnung ein und sehen Sie in Sekunden Anlagengröße, jährliche Ersparnis, Amortisation und 25-Jahres-Gewinn.",
      "Hesaplamayı Başlat": "Rechner starten",
      // Projeler önizleme
      "Referans Projeler": "Referenzprojekte", "Sahadan örnekler": "Beispiele aus der Praxis",
      "Tüm projeleri gör →": "Alle Projekte →",
      // Yorumlar
      "Müşteri Yorumları": "Kundenstimmen", "Yatırımcılarımız ne diyor?": "Was unsere Kunden sagen",
      "\"Faturalarımız ilk yıl %40 düştü. Süreç baştan sona şeffaftı.\"": "„Unsere Rechnungen sanken im ersten Jahr um 40%. Der Prozess war durchweg transparent.“",
      "— Üretim Müdürü, Sanayi A.Ş.": "— Produktionsleiter, Industrie AG",
      "\"Kurulum söz verilen sürede bitti, izleme paneli çok pratik.\"": "„Die Installation war pünktlich fertig, das Monitoring-Panel ist sehr praktisch.“",
      "— Çiftlik Sahibi, Konya": "— Landwirt, Konya",
      "\"Finansman desteğiyle peşin ödemeden başladık. Tavsiye ederim.\"": "„Dank Finanzierung ohne Vorauszahlung gestartet. Sehr empfehlenswert.“",
      "— Otel İşletmecisi, Antalya": "— Hotelbetreiber, Antalya",
      // CTA bantları
      "Güneşe geçmeye hazır mısınız?": "Bereit für den Wechsel zur Sonne?",
      "Ücretsiz keşif ve tasarruf analizi için bizimle iletişime geçin.": "Kontaktieren Sie uns für eine kostenlose Vor-Ort- und Ersparnisanalyse.",
      "Hemen Teklif Al": "Jetzt Angebot",
      "Projeniz için ücretsiz keşif": "Kostenlose Beratung für Ihr Projekt",
      "Size en uygun çözümü birlikte belirleyelim.": "Finden wir gemeinsam die beste Lösung für Sie.",
      "Sıradaki proje sizinki olsun": "Ihr Projekt könnte das nächste sein",
      "Çatınız veya araziniz için ücretsiz fizibilite çıkaralım.": "Wir erstellen eine kostenlose Machbarkeitsstudie für Ihr Dach oder Grundstück.",
      "Net rakamlar için ücretsiz keşif": "Genaue Zahlen mit kostenloser Beratung",
      "Saha ekibimiz çatınızı/arazinizi inceleyip kesin teklifi hazırlasın.": "Unser Team prüft Dach/Grundstück und erstellt ein verbindliches Angebot.",
      "Keşif Talep Et": "Termin anfragen",
      "Bizimle çalışmaya başlayın": "Starten Sie mit uns",
      "Ücretsiz keşif ve şeffaf teklif için hemen ulaşın.": "Kontaktieren Sie uns für eine kostenlose Beratung und ein transparentes Angebot.",
      "İletişime Geç": "Kontakt aufnehmen",
      // Süreç
      "Nasıl Çalışıyoruz?": "Wie wir arbeiten", "4 adımda anahtar teslim GES": "Schlüsselfertige Solaranlage in 4 Schritten",
      "Keşif & Analiz": "Beratung & Analyse", "Tasarım & Teklif": "Design & Angebot", "Kurulum": "Installation", "Devreye Alma & İzleme": "Inbetriebnahme & Monitoring",
      "Saha incelemesi, tüketim analizi ve güneşlenme verisi.": "Vor-Ort-Begehung, Verbrauchsanalyse und Einstrahlungsdaten.",
      "Üretim simülasyonu ve geri ödeme süresiyle net teklif.": "Klares Angebot mit Ertragssimulation und Amortisationszeit.",
      "Sertifikalı ekiplerle hızlı ve güvenli montaj.": "Schnelle, sichere Montage durch zertifizierte Teams.",
      "Şebeke bağlantısı ve sürekli performans takibi.": "Netzanschluss und laufende Leistungsüberwachung.",
      // Markalar
      "Kullandığımız Markalar": "Verwendete Marken", "Güvenilir ekipman": "Zuverlässige Komponenten",
      "Projelerimizde tercih ettiğimiz panel ve inverter markaları.": "Von uns bevorzugte Panel- und Wechselrichter-Marken.",
      "Güneş Panelleri": "Solarmodule", "İnverterler": "Wechselrichter",
      // SSS
      "Sıkça Sorulan Sorular": "Häufige Fragen", "Merak edilenler": "Wissenswertes",
      // Hesaplayıcı sayfası
      "Güneş Enerjisi Tasarruf Hesaplayıcı": "Solar-Ersparnisrechner",
      "Faturanıza, tüketiminize veya çatı alanınıza göre sisteminizin gücünü, yıllık tasarrufunuzu, geri ödeme sürenizi ve 25 yıllık kazancınızı saniyeler içinde öğrenin.": "Ermitteln Sie anhand Ihrer Rechnung, Ihres Verbrauchs oder Ihrer Dachfläche in Sekunden Anlagengröße, jährliche Ersparnis, Amortisation und 25-Jahres-Gewinn.",
      "Faturaya göre": "Nach Rechnung", "Tüketime göre": "Nach Verbrauch", "Çatı alanına göre": "Nach Dachfläche",
      "Aylık elektrik faturanız (₺)": "Monatliche Stromrechnung (₺)", "Aylık tüketiminiz (kWh)": "Monatlicher Verbrauch (kWh)",
      "Kullanılabilir çatı alanı (m²)": "Nutzbare Dachfläche (m²)", "Bölge (güneşlenme verimi)": "Region (Einstrahlung)",
      "Akdeniz / GAP (çok yüksek)": "Mittelmeer / GAP (sehr hoch)", "İç Anadolu / Ege (yüksek)": "Zentralanatolien / Ägäis (hoch)",
      "Marmara (orta)": "Marmara (mittel)", "Karadeniz (düşük)": "Schwarzmeer (niedrig)",
      "Güney (ideal)": "Süden (ideal)", "Güneydoğu / Güneybatı": "Südost / Südwest", "Doğu / Batı": "Ost / West", "Kuzey": "Norden",
      "Elektrik birim fiyatı (₺/kWh)": "Strompreis (₺/kWh)", "Çatı yönü / eğim": "Dachausrichtung / Neigung",
      "Yıllık elektrik zammı (%)": "Jährliche Strompreissteigerung (%)",
      "— anlık kullanım, kalanı şebekeye": "— Eigenverbrauch, Rest ins Netz",
      "Batarya / depolama ekle (öz tüketimi artırır)": "Batterie / Speicher hinzufügen (erhöht Eigenverbrauch)",
      "Varsayımlar": "Annahmen", "Sonuçlar tahminidir; kesin değer saha keşfiyle belirlenir.": "Ergebnisse sind Schätzungen; der genaue Wert wird vor Ort ermittelt.",
      "Tahmini Sonuçlar": "Geschätzte Ergebnisse", "Değerler girdilerinizle anlık olarak güncellenir.": "Die Werte aktualisieren sich live mit Ihren Eingaben.",
      "Önerilen sistem": "Empfohlene Anlage", "Panel sayısı (550 W)": "Modulanzahl (550 W)", "Gerekli çatı alanı": "Benötigte Dachfläche",
      "Yıllık üretim": "Jahresertrag", "Aylık ort. üretim": "Ø Monatsertrag", "Geri ödeme süresi": "Amortisationszeit",
      "Yıllık tasarruf (1. yıl)": "Jährliche Ersparnis (1. Jahr)", "Aylık tasarruf": "Monatliche Ersparnis",
      "Tahmini yatırım": "Geschätzte Investition", "25 yıllık kazanç": "25-Jahres-Gewinn",
      "25 yıl net (kazanç − yatırım)": "25-Jahre netto (Gewinn − Investition)", "Yatırım getirisi (ROI)": "Kapitalrendite (ROI)",
      "Yıllık CO₂ azaltımı": "CO₂-Einsparung/Jahr", "25 yıllık CO₂": "CO₂ über 25 Jahre",
      "Ağaç eşdeğeri / yıl": "Baum-Äquivalent / Jahr", "Araç-km eşdeğeri (25 yıl)": "Auto-km-Äquivalent (25 J.)",
      "Batarya (opsiyonel)": "Batterie (optional)",
      "Bu sonuçlarla ücretsiz teklif iste": "Mit diesen Ergebnissen Angebot anfordern",
      "📲 Sonuçları WhatsApp'tan gönder": "📲 Ergebnisse per WhatsApp senden",
      "🖨️ Yazdır / PDF olarak kaydet": "🖨️ Drucken / als PDF speichern",
      // Projeler sayfası
      "Sanayiden tarıma, otelden soğuk hava depolarına kadar farklı sektörlerde devreye aldığımız güneş enerjisi santrallerinden bir seçki.": "Eine Auswahl unserer Solarkraftwerke aus verschiedensten Branchen — von Industrie und Landwirtschaft bis Hotels und Kühlhäusern.",
      "Tümü": "Alle", "Konut": "Wohngebäude", "Ticari": "Gewerbe", "Endüstriyel": "Industrie", "Tarımsal": "Landwirtschaft",
      "Daha fazla referans ve detaylı proje dosyaları için": "Für weitere Referenzen und detaillierte Projektunterlagen",
      "bizimle iletişime geçin": "kontaktieren Sie uns",
      "Sahadan Kareler": "Eindrücke vor Ort", "Uygulama galerisi": "Projektgalerie",
      "Kurulum ve mühendislik çalışmalarımızdan kareler. Büyütmek için tıklayın.": "Aufnahmen unserer Installations- und Engineering-Arbeiten. Zum Vergrößern klicken.",
      // Proje açıklamaları
      "Kemer'de çift eğimli kiremit çatılı villaya kurulan şebeke bağlantılı konut sistemi.": "Netzgekoppelte Wohnanlage auf einem Ziegel-Satteldach einer Villa in Kemer.",
      "Sera ve tarla sulaması için sera çatısına kurulan güneş enerji santrali.": "Solaranlage auf einem Gewächshausdach für Gewächshaus- und Feldbewässerung.",
      "Büyük çaplı sanayi tesisi çatısına kurulan on-grid güneş enerji santrali.": "Netzgekoppelte Solaranlage auf dem Dach einer großen Industrieanlage.",
      "Manavgat'ta büyük çaplı fabrika çatısına kurulan 1.2 MW kapasiteli güneş enerji santrali.": "1,2-MW-Solaranlage auf einem großen Fabrikdach in Manavgat.",
      "Toroslar manzaralı konumda vinç ekipmanıyla gerçekleştirilen profesyonel kurulum.": "Professionelle Kraninstallation mit Blick auf das Taurusgebirge.",
      "Şehir merkezinde ticari bina çatısına kurulan şebeke bağlantılı güneş sistemi.": "Netzgekoppelte Solaranlage auf einem Geschäftsgebäude im Stadtzentrum.",
      "Alanya'da büyük sanayi tesisinin çatısını kaplayan yüksek verimli GES kurulumu.": "Hocheffiziente Solaranlage auf dem Dach einer großen Industrieanlage in Alanya.",
      "Depo ve üretim tesisi çatısında çift taraflı panel uygulaması.": "Bifaziale Module auf dem Dach einer Lager- und Produktionsstätte.",
      "Zemine bağlı arazi tipi kurulum ile tarımsal sulama pompası için güneş enerji sistemi.": "Bodenmontiertes Solarsystem für eine landwirtschaftliche Bewässerungspumpe.",
      // Hakkımızda
      "Gespa Enerji Ltd. Şti., Türkiye'nin güneş potansiyelini ekonomik değere dönüştüren bir mühendislik ve EPC firmasıdır.": "Gespa Enerji Ltd. Şti. ist ein Engineering- und EPC-Unternehmen, das das Solarpotenzial der Türkei in wirtschaftlichen Wert verwandelt.",
      "Neden GESPA Enerji?": "Warum GESPA Enerji?", "Mühendislik disiplini, şeffaf süreç": "Ingenieurdisziplin, transparenter Prozess",
      "Sadece kurulum yapmıyor; projelendirmeden TEDAŞ onay süreçlerine, bakım ve izlemeye kadar tam kapsamlı mühendislik hizmeti sunuyoruz. Bizim için bir proje, panel kurulduğunda değil, sisteminiz 25 yıl boyunca sorunsuz çalıştığında başarıya ulaşmış demektir.": "Wir installieren nicht nur — von der Planung über die behördliche Genehmigung bis zu Wartung und Monitoring bieten wir umfassendes Engineering. Für uns ist ein Projekt nicht mit der Montage erfolgreich, sondern wenn Ihre Anlage 25 Jahre störungsfrei läuft.",
      "Akredite, A-marka ekipman": "Akkreditierte A-Marken-Komponenten", "Şeffaf fizibilite ve geri ödeme": "Transparente Machbarkeit & Amortisation",
      "Performans + işçilik garantisi": "Leistungs- + Verarbeitungsgarantie", "Türkiye geneli servis ağı": "Servicenetz türkeiweit",
      "25 yıla varan panel garantisi": "Bis zu 25 Jahre Modulgarantie", "7/24 uzaktan izleme": "24/7-Fernüberwachung",
      "\"Temiz enerji bir tercih değil, geleceğin temel ihtiyacıdır. Biz bu geçişi karlı ve sorunsuz hale getiriyoruz.\"": "„Saubere Energie ist keine Option, sondern ein Grundbedürfnis der Zukunft. Wir machen diesen Wandel profitabel und reibungslos.“",
      "Garanti": "Garantie", "İzleme": "Monitoring", "Memnuniyet": "Zufriedenheit",
      "Değerlerimiz": "Unsere Werte", "Çalışma ilkelerimiz": "Unsere Prinzipien",
      "Kalite Odaklılık": "Qualitätsfokus", "Şeffaf İletişim": "Transparente Kommunikation", "Sürekli İnovasyon": "Ständige Innovation", "Sürdürülebilirlik": "Nachhaltigkeit",
      "A-marka ekipman ve standartlara uygun işçilikle uzun ömürlü sistemler kurarız.": "Langlebige Systeme mit A-Marken-Komponenten und normgerechter Verarbeitung.",
      "Fizibilite, maliyet ve geri ödeme analizini açık ve anlaşılır şekilde paylaşırız.": "Wir teilen Machbarkeit, Kosten und Amortisation klar und verständlich.",
      "Yeni panel, inverter ve depolama teknolojilerini projelerimize entegre ederiz.": "Wir integrieren neue Modul-, Wechselrichter- und Speichertechnologien.",
      "Temiz enerjiyle karbon ayak izini azaltır, geleceğe yatırım yaparız.": "Mit sauberer Energie senken wir den CO₂-Fußabdruck und investieren in die Zukunft.",
      "Kilometre Taşlarımız": "Unsere Meilensteine", "Yıllar içinde GESPA": "GESPA im Laufe der Jahre",
      "Manavgat'ta kuruluş ve ilk güneş paneli satışı.": "Gründung in Manavgat und erster Solarmodul-Verkauf.",
      "100. bağımsız ev kurulumunun tamamlanması.": "Abschluss der 100. Eigenheim-Installation.",
      "Endüstriyel çatı projelerine geçiş.": "Einstieg in industrielle Aufdach-Projekte.",
      "Bölgede 15 MW kurulu güce ulaşılması.": "15 MW installierte Leistung in der Region erreicht.",
      "500+ proje ile Antalya'nın lideri.": "Marktführer in Antalya mit 500+ Projekten.",
      "GESPA Enerji": "GESPA Enerji", "Saha montaj uygulaması": "Montage vor Ort",
      // İletişim
      "Ücretsiz Keşif & Teklif": "Kostenlose Beratung & Angebot", "Bize ulaşın": "Kontaktieren Sie uns",
      "Çatınız veya araziniz için tasarruf potansiyelinizi öğrenin. Formu doldurun, mühendis ekibimiz sizi en kısa sürede arasın.": "Erfahren Sie Ihr Sparpotenzial für Dach oder Grundstück. Füllen Sie das Formular aus — unser Team meldet sich umgehend.",
      "WhatsApp ile yazın": "Per WhatsApp schreiben", "Hafta içi 09:00 – 18:00": "Mo–Fr 09:00 – 18:00",
      "Resmi unvan:": "Firmenname:",
      "Ad Soyad *": "Vor- und Nachname *", "Telefon *": "Telefon *", "E-posta": "E-Mail", "Proje Tipi": "Projekttyp",
      "Diğer": "Sonstige", "Şehir": "Stadt", "Mesajınız": "Ihre Nachricht", "Teklif İste": "Angebot anfordern",
      // Footer
      "Anahtar teslim güneş enerjisi santralleri. Mühendislik, kurulum, finansman ve bakım.": "Schlüsselfertige Solarkraftwerke. Engineering, Installation, Finanzierung und Wartung.",
      "Kurumsal": "Unternehmen", "Bülten": "Newsletter", "Güneş enerjisi haberleri ve teşvikler.": "Solar-News und Förderungen.",
      "Abone ol": "Abonnieren", "Bakım (O&M)": "Wartung (O&M)",
      "Tüm hakları saklıdır.": "Alle Rechte vorbehalten.", "Gizlilik": "Datenschutz", "Çerez Politikası": "Cookie-Richtlinie",
      "Aboneliğiniz alındı, teşekkürler!": "Anmeldung erhalten, danke!"
    },
    ru: {
      "Ana Sayfa": "Главная", "Hizmetler": "Услуги", "Hesaplayıcı": "Калькулятор",
      "Projeler": "Проекты", "Hakkımızda": "О нас", "İletişim": "Контакты", "Teklif Al": "Заявка",
      "☀️ 2026 GES teşvikleri açıklandı — yatırımınız için doğru zaman!": "☀️ Льготы на солнечную энергию 2026 объявлены — самое время инвестировать!",
      "Tasarrufunu hesapla →": "Рассчитать экономию →",
      "☀️ Hesaplama sonuçları tahminidir — kesin değer ücretsiz keşifle belirlenir.": "☀️ Результаты ориентировочны — точное значение определяется при выезде.",
      "Keşif talep et →": "Запросить выезд →",
      "☀️ Hafta içi 09:00–18:00 · Hızlı dönüş için WhatsApp": "☀️ Пн–Пт 09:00–18:00 · Быстро через WhatsApp",
      "WhatsApp →": "WhatsApp →",
      "Anahtar Teslim Güneş Enerjisi Santralleri": "Солнечные электростанции под ключ",
      "Çatı ve arazi tipi GES projelerinizde mühendislikten kuruluma, finansmandan bakıma kadar tüm süreci tek elden yönetiyoruz. Enerji maliyetlerinizi düşürün, karbon ayak izinizi azaltın.": "От проектирования до монтажа, от финансирования до обслуживания — мы ведём ваш проект на крыше или участке под ключ. Снизьте затраты на энергию и углеродный след.",
      "Tasarrufumu Hesapla": "Рассчитать экономию", "Ücretsiz Keşif": "Бесплатный выезд",
      "Tamamlanan Proje": "Завершённых проектов", "Bölgede Kurulu Güç": "Установленная мощность", "Sektör Deneyimi": "Опыт в отрасли",
      "⚡ Anahtar teslim kurulum": "⚡ Монтаж под ключ", "🌱 25 yıla varan garanti": "🌱 Гарантия до 25 лет",
      "Güvendikleri kurumlar:": "Нам доверяют:",
      "Hizmetlerimiz": "Наши услуги",
      "Projenizin her aşamasında yanınızdayız": "Рядом на каждом этапе проекта",
      "Fizibiliteden devreye almaya, bakımdan finansmana kadar uçtan uca çözüm.": "Комплексное решение: от ТЭО до ввода в эксплуатацию, от обслуживания до финансирования.",
      "Çatı GES": "Солнечные на крыше", "Arazi Tipi GES": "Наземные станции", "Enerji Depolama": "Накопители энергии",
      "Tarımsal Sulama": "Солнечный полив", "Güneş enerjili pompalarla tarla ve sera sulaması; şebekeden bağımsız, mazotsuz çözüm.": "Полив полей и теплиц солнечными насосами — без сети и дизеля.",
      "Tarımsal sulama": "Аграрный полив", "Sulama pompası gücü (kW)": "Мощность насоса (кВт)", "Günlük çalışma (saat)": "Работа в день (ч)", "Sulama sezonu (ay)": "Сезон полива (мес.)",
      "🌾 Öne Çıkan Çözüm": "🌾 Ключевое решение", "Tarımsal Sulama GES": "Солнечный полив (GES)",
      "Mazot ve elektrik maliyetlerini sıfıra yaklaştırın. Güneş enerjili sulama pompası sistemleriyle tarlanızı/seranızı bağımsız ve sürdürülebilir şekilde sulayın — şebekeden uzak araziler için ideal.": "Сократите расходы на дизель и электричество почти до нуля. Поливайте поле/теплицу солнечными насосами — идеально для участков без сети.",
      "Dalgıç ve yüzey pompalarına uygun": "Для погружных и поверхностных насосов", "Şebekeden bağımsız (off-grid) veya hibrit": "Автономно (off-grid) или гибрид", "Sezonluk üretim profiline göre boyutlandırma": "Расчёт по сезонному профилю выработки",
      "Sulama hesaplaması yap": "Рассчитать полив",
      "Mühendislik & Tasarım": "Инжиниринг и проект", "Finansman Desteği": "Финансирование", "Bakım & İzleme (O&M)": "Обслуживание и мониторинг (O&M)",
      "Konut, ticari ve sanayi çatılarına özel tasarlanan, alanı verimli kullanan sistemler.": "Индивидуальные энергоэффективные системы для жилых, коммерческих и промышленных крыш.",
      "Lisanslı ve lisanssız arazi santralleri için fizibilite, kurulum ve şebeke bağlantısı.": "ТЭО, монтаж и подключение к сети для лицензируемых и безлицензионных станций.",
      "Batarya sistemleri ile üretilen enerjiyi depolayın, kesintide bile üretin.": "Храните выработанную энергию в аккумуляторах — энергия даже при отключениях.",
      "Tüm hizmetleri gör →": "Все услуги →",
      "Tasarruf Hesaplayıcı": "Калькулятор экономии", "Çatınız ne kadar kazandırır?": "Сколько принесёт ваша крыша?",
      "Faturanızı girin; sistem gücü, yıllık tasarruf, geri ödeme süresi ve 25 yıllık kazancı saniyeler içinde görün.": "Введите счёт и за секунды узнайте мощность, годовую экономию, срок окупаемости и доход за 25 лет.",
      "Hesaplamayı Başlat": "Открыть калькулятор",
      "Referans Projeler": "Референс-проекты", "Sahadan örnekler": "Примеры с объектов",
      "Tüm projeleri gör →": "Все проекты →",
      "Müşteri Yorumları": "Отзывы клиентов", "Yatırımcılarımız ne diyor?": "Что говорят клиенты",
      "\"Faturalarımız ilk yıl %40 düştü. Süreç baştan sona şeffaftı.\"": "«Счета упали на 40% в первый год. Процесс был прозрачным от начала до конца.»",
      "— Üretim Müdürü, Sanayi A.Ş.": "— Директор производства, Промышленная компания",
      "\"Kurulum söz verilen sürede bitti, izleme paneli çok pratik.\"": "«Монтаж завершён в срок, панель мониторинга очень удобна.»",
      "— Çiftlik Sahibi, Konya": "— Фермер, Конья",
      "\"Finansman desteğiyle peşin ödemeden başladık. Tavsiye ederim.\"": "«Начали без предоплаты благодаря финансированию. Рекомендую.»",
      "— Otel İşletmecisi, Antalya": "— Владелец отеля, Анталья",
      "Güneşe geçmeye hazır mısınız?": "Готовы перейти на солнце?",
      "Ücretsiz keşif ve tasarruf analizi için bizimle iletişime geçin.": "Свяжитесь с нами для бесплатного выезда и анализа экономии.",
      "Hemen Teklif Al": "Получить заявку",
      "Projeniz için ücretsiz keşif": "Бесплатный выезд для вашего проекта",
      "Size en uygun çözümü birlikte belirleyelim.": "Вместе подберём оптимальное решение.",
      "Sıradaki proje sizinki olsun": "Пусть следующий проект будет вашим",
      "Çatınız veya araziniz için ücretsiz fizibilite çıkaralım.": "Сделаем бесплатное ТЭО для вашей крыши или участка.",
      "Net rakamlar için ücretsiz keşif": "Точные цифры — бесплатный выезд",
      "Saha ekibimiz çatınızı/arazinizi inceleyip kesin teklifi hazırlasın.": "Наша команда осмотрит объект и подготовит точное предложение.",
      "Keşif Talep Et": "Запросить выезд",
      "Bizimle çalışmaya başlayın": "Начните работать с нами",
      "Ücretsiz keşif ve şeffaf teklif için hemen ulaşın.": "Свяжитесь для бесплатного выезда и прозрачного предложения.",
      "İletişime Geç": "Связаться",
      "Nasıl Çalışıyoruz?": "Как мы работаем", "4 adımda anahtar teslim GES": "Станция под ключ за 4 шага",
      "Keşif & Analiz": "Выезд и анализ", "Tasarım & Teklif": "Проект и КП", "Kurulum": "Монтаж", "Devreye Alma & İzleme": "Ввод и мониторинг",
      "Saha incelemesi, tüketim analizi ve güneşlenme verisi.": "Осмотр объекта, анализ потребления и данные инсоляции.",
      "Üretim simülasyonu ve geri ödeme süresiyle net teklif.": "Чёткое КП с симуляцией выработки и сроком окупаемости.",
      "Sertifikalı ekiplerle hızlı ve güvenli montaj.": "Быстрый и безопасный монтаж сертифицированными бригадами.",
      "Şebeke bağlantısı ve sürekli performans takibi.": "Подключение к сети и постоянный контроль производительности.",
      "Kullandığımız Markalar": "Используемые бренды", "Güvenilir ekipman": "Надёжное оборудование",
      "Projelerimizde tercih ettiğimiz panel ve inverter markaları.": "Бренды панелей и инверторов, которые мы используем.",
      "Güneş Panelleri": "Солнечные панели", "İnverterler": "Инверторы",
      "Sıkça Sorulan Sorular": "Частые вопросы", "Merak edilenler": "Полезно знать",
      "Güneş Enerjisi Tasarruf Hesaplayıcı": "Калькулятор экономии на солнце",
      "Faturanıza, tüketiminize veya çatı alanınıza göre sisteminizin gücünü, yıllık tasarrufunuzu, geri ödeme sürenizi ve 25 yıllık kazancınızı saniyeler içinde öğrenin.": "По счёту, потреблению или площади крыши за секунды узнайте мощность, годовую экономию, окупаемость и доход за 25 лет.",
      "Faturaya göre": "По счёту", "Tüketime göre": "По потреблению", "Çatı alanına göre": "По площади крыши",
      "Aylık elektrik faturanız (₺)": "Месячный счёт за свет (₺)", "Aylık tüketiminiz (kWh)": "Месячное потребление (кВт·ч)",
      "Kullanılabilir çatı alanı (m²)": "Полезная площадь крыши (м²)", "Bölge (güneşlenme verimi)": "Регион (инсоляция)",
      "Akdeniz / GAP (çok yüksek)": "Средиземноморье / ЮВА (очень высокая)", "İç Anadolu / Ege (yüksek)": "Центр. Анатолия / Эгейское (высокая)",
      "Marmara (orta)": "Мармара (средняя)", "Karadeniz (düşük)": "Чёрное море (низкая)",
      "Güney (ideal)": "Юг (идеально)", "Güneydoğu / Güneybatı": "Юго-восток / Юго-запад", "Doğu / Batı": "Восток / Запад", "Kuzey": "Север",
      "Elektrik birim fiyatı (₺/kWh)": "Цена э/э (₺/кВт·ч)", "Çatı yönü / eğim": "Ориентация / наклон крыши",
      "Yıllık elektrik zammı (%)": "Годовой рост цен (%)",
      "— anlık kullanım, kalanı şebekeye": "— самопотребление, остаток в сеть",
      "Batarya / depolama ekle (öz tüketimi artırır)": "Добавить аккумулятор (повышает самопотребление)",
      "Varsayımlar": "Допущения", "Sonuçlar tahminidir; kesin değer saha keşfiyle belirlenir.": "Результаты ориентировочны; точное значение — при выезде.",
      "Tahmini Sonuçlar": "Ориентировочные результаты", "Değerler girdilerinizle anlık olarak güncellenir.": "Значения обновляются мгновенно при вводе.",
      "Önerilen sistem": "Рекомендуемая мощность", "Panel sayısı (550 W)": "Кол-во панелей (550 Вт)", "Gerekli çatı alanı": "Нужная площадь крыши",
      "Yıllık üretim": "Годовая выработка", "Aylık ort. üretim": "Ср. выработка/мес", "Geri ödeme süresi": "Срок окупаемости",
      "Yıllık tasarruf (1. yıl)": "Экономия (1-й год)", "Aylık tasarruf": "Экономия/мес",
      "Tahmini yatırım": "Ориент. инвестиция", "25 yıllık kazanç": "Доход за 25 лет",
      "25 yıl net (kazanç − yatırım)": "Нетто за 25 лет (доход − инвестиция)", "Yatırım getirisi (ROI)": "Рентабельность (ROI)",
      "Yıllık CO₂ azaltımı": "Сокращение CO₂/год", "25 yıllık CO₂": "CO₂ за 25 лет",
      "Ağaç eşdeğeri / yıl": "Эквивалент деревьев/год", "Araç-km eşdeğeri (25 yıl)": "Эквивалент авто-км (25 л.)",
      "Batarya (opsiyonel)": "Аккумулятор (опц.)",
      "Bu sonuçlarla ücretsiz teklif iste": "Запросить КП по этим результатам",
      "📲 Sonuçları WhatsApp'tan gönder": "📲 Отправить результаты в WhatsApp",
      "🖨️ Yazdır / PDF olarak kaydet": "🖨️ Печать / сохранить в PDF",
      "Sanayiden tarıma, otelden soğuk hava depolarına kadar farklı sektörlerde devreye aldığımız güneş enerjisi santrallerinden bir seçki.": "Подборка наших солнечных станций в разных отраслях — от промышленности и сельского хозяйства до отелей и холодильных складов.",
      "Tümü": "Все", "Konut": "Жильё", "Ticari": "Коммерция", "Endüstriyel": "Промышленность", "Tarımsal": "Сельское хоз-во",
      "Daha fazla referans ve detaylı proje dosyaları için": "Для других референсов и подробных материалов",
      "bizimle iletişime geçin": "свяжитесь с нами",
      "Sahadan Kareler": "Кадры с объектов", "Uygulama galerisi": "Галерея работ",
      "Kurulum ve mühendislik çalışmalarımızdan kareler. Büyütmek için tıklayın.": "Снимки наших монтажных и инженерных работ. Нажмите, чтобы увеличить.",
      "Kemer'de çift eğimli kiremit çatılı villaya kurulan şebeke bağlantılı konut sistemi.": "Сетевая система на двускатной черепичной крыше виллы в Кемере.",
      "Sera ve tarla sulaması için sera çatısına kurulan güneş enerji santrali.": "Солнечная станция на крыше теплицы для полива теплиц и полей.",
      "Büyük çaplı sanayi tesisi çatısına kurulan on-grid güneş enerji santrali.": "Сетевая солнечная станция на крыше крупного промышленного объекта.",
      "Manavgat'ta büyük çaplı fabrika çatısına kurulan 1.2 MW kapasiteli güneş enerji santrali.": "Станция мощностью 1,2 МВт на крыше крупной фабрики в Манавгате.",
      "Toroslar manzaralı konumda vinç ekipmanıyla gerçekleştirilen profesyonel kurulum.": "Профессиональный монтаж краном с видом на горы Тавр.",
      "Şehir merkezinde ticari bina çatısına kurulan şebeke bağlantılı güneş sistemi.": "Сетевая солнечная система на крыше коммерческого здания в центре города.",
      "Alanya'da büyük sanayi tesisinin çatısını kaplayan yüksek verimli GES kurulumu.": "Высокоэффективная станция, покрывающая крышу крупного завода в Аланье.",
      "Depo ve üretim tesisi çatısında çift taraflı panel uygulaması.": "Двусторонние панели на крыше склада и производственного цеха.",
      "Zemine bağlı arazi tipi kurulum ile tarımsal sulama pompası için güneş enerji sistemi.": "Наземная система для насоса сельхозполива.",
      "Gespa Enerji Ltd. Şti., Türkiye'nin güneş potansiyelini ekonomik değere dönüştüren bir mühendislik ve EPC firmasıdır.": "Gespa Enerji Ltd. Şti. — инжиниринговая и EPC-компания, превращающая солнечный потенциал Турции в экономическую ценность.",
      "Neden GESPA Enerji?": "Почему GESPA Enerji?", "Mühendislik disiplini, şeffaf süreç": "Инженерная дисциплина, прозрачный процесс",
      "Sadece kurulum yapmıyor; projelendirmeden TEDAŞ onay süreçlerine, bakım ve izlemeye kadar tam kapsamlı mühendislik hizmeti sunuyoruz. Bizim için bir proje, panel kurulduğunda değil, sisteminiz 25 yıl boyunca sorunsuz çalıştığında başarıya ulaşmış demektir.": "Мы не только монтируем — от проектирования и согласований до обслуживания и мониторинга предоставляем полный инжиниринг. Для нас проект успешен не когда установлены панели, а когда система безотказно работает 25 лет.",
      "Akredite, A-marka ekipman": "Аккредитованное оборудование A-брендов", "Şeffaf fizibilite ve geri ödeme": "Прозрачное ТЭО и окупаемость",
      "Performans + işçilik garantisi": "Гарантия выработки и монтажа", "Türkiye geneli servis ağı": "Сервис по всей Турции",
      "25 yıla varan panel garantisi": "Гарантия на панели до 25 лет", "7/24 uzaktan izleme": "Удалённый мониторинг 24/7",
      "\"Temiz enerji bir tercih değil, geleceğin temel ihtiyacıdır. Biz bu geçişi karlı ve sorunsuz hale getiriyoruz.\"": "«Чистая энергия — не выбор, а базовая потребность будущего. Мы делаем этот переход выгодным и беспроблемным.»",
      "Garanti": "Гарантия", "İzleme": "Мониторинг", "Memnuniyet": "Довольных клиентов",
      "Değerlerimiz": "Наши ценности", "Çalışma ilkelerimiz": "Наши принципы",
      "Kalite Odaklılık": "Фокус на качестве", "Şeffaf İletişim": "Прозрачная коммуникация", "Sürekli İnovasyon": "Постоянные инновации", "Sürdürülebilirlik": "Устойчивость",
      "A-marka ekipman ve standartlara uygun işçilikle uzun ömürlü sistemler kurarız.": "Строим долговечные системы с оборудованием A-брендов и монтажом по стандартам.",
      "Fizibilite, maliyet ve geri ödeme analizini açık ve anlaşılır şekilde paylaşırız.": "Понятно и открыто делимся ТЭО, затратами и расчётом окупаемости.",
      "Yeni panel, inverter ve depolama teknolojilerini projelerimize entegre ederiz.": "Внедряем новые технологии панелей, инверторов и накопителей.",
      "Temiz enerjiyle karbon ayak izini azaltır, geleceğe yatırım yaparız.": "Чистой энергией снижаем углеродный след и инвестируем в будущее.",
      "Kilometre Taşlarımız": "Наши вехи", "Yıllar içinde GESPA": "GESPA сквозь годы",
      "Manavgat'ta kuruluş ve ilk güneş paneli satışı.": "Основание в Манавгате и первая продажа панели.",
      "100. bağımsız ev kurulumunun tamamlanması.": "Завершён 100-й монтаж в частном доме.",
      "Endüstriyel çatı projelerine geçiş.": "Переход к промышленным проектам на крышах.",
      "Bölgede 15 MW kurulu güce ulaşılması.": "Достигнуто 15 МВт установленной мощности в регионе.",
      "500+ proje ile Antalya'nın lideri.": "Лидер в Анталье с 500+ проектами.",
      "GESPA Enerji": "GESPA Enerji", "Saha montaj uygulaması": "Монтаж на объекте",
      "Ücretsiz Keşif & Teklif": "Бесплатный выезд и КП", "Bize ulaşın": "Свяжитесь с нами",
      "Çatınız veya araziniz için tasarruf potansiyelinizi öğrenin. Formu doldurun, mühendis ekibimiz sizi en kısa sürede arasın.": "Узнайте потенциал экономии для вашей крыши или участка. Заполните форму — наша команда свяжется с вами в ближайшее время.",
      "WhatsApp ile yazın": "Написать в WhatsApp", "Hafta içi 09:00 – 18:00": "Пн–Пт 09:00 – 18:00",
      "Resmi unvan:": "Юр. лицо:",
      "Ad Soyad *": "Имя и фамилия *", "Telefon *": "Телефон *", "E-posta": "E-mail", "Proje Tipi": "Тип проекта",
      "Diğer": "Другое", "Şehir": "Город", "Mesajınız": "Сообщение", "Teklif İste": "Запросить КП",
      "Anahtar teslim güneş enerjisi santralleri. Mühendislik, kurulum, finansman ve bakım.": "Солнечные электростанции под ключ. Инжиниринг, монтаж, финансирование и обслуживание.",
      "Kurumsal": "Компания", "Bülten": "Рассылка", "Güneş enerjisi haberleri ve teşvikler.": "Новости солнечной энергетики и льготы.",
      "Abone ol": "Подписаться", "Bakım (O&M)": "Обслуживание (O&M)",
      "Tüm hakları saklıdır.": "Все права защищены.", "Gizlilik": "Конфиденциальность", "Çerez Politikası": "Политика cookie",
      "Aboneliğiniz alındı, teşekkürler!": "Подписка оформлена, спасибо!"
    }
  };

  var SKIP = "[data-c-text],[data-count],.r-value,#yil,.brand,.footer-brand,.logo,.lang-switch,[data-i18n-html]";
  function skipped(el) { return el.closest && el.closest(SKIP); }
  function leaves() {
    var out = [];
    document.querySelectorAll("header *, main *, footer *, .topbar *").forEach(function (el) {
      if (el.children.length === 0 && el.textContent.trim() && !skipped(el)) out.push(el);
    });
    return out;
  }

  function apply(lang) {
    lang = (lang === "de" || lang === "ru") ? lang : "tr";
    document.documentElement.setAttribute("lang", lang);
    var d = DICT[lang] || {};
    leaves().forEach(function (el) {
      var o = el.getAttribute("data-i18n-o");
      if (o === null) { o = el.textContent.trim(); el.setAttribute("data-i18n-o", o); }
      el.textContent = (lang === "tr") ? o : (d[o] || o);
    });
    Object.keys(HTMLMAP).forEach(function (sel) {
      var el = document.querySelector(sel); if (!el) return;
      var m = HTMLMAP[sel]; el.innerHTML = m[lang] || m.tr;
    });
    var ph = PH[lang] || {};
    document.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(function (el) {
      var o = el.getAttribute("data-ph-o");
      if (o === null) { o = el.getAttribute("placeholder") || ""; el.setAttribute("data-ph-o", o); }
      el.setAttribute("placeholder", (lang === "tr") ? o : (ph[o] || o));
    });
    GESPA.lang = lang;
    try { localStorage.setItem(LS, lang); } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
    document.dispatchEvent(new CustomEvent("gespa:lang", { detail: lang }));
  }

  GESPA.units = UNITS;
  GESPA.applyLang = apply;

  function init() {
    var saved = "tr"; try { saved = localStorage.getItem(LS) || "tr"; } catch (e) {}
    apply(saved);
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".lang-switch button");
      if (b) apply(b.getAttribute("data-lang"));
    });
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
