#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lexron şarj kontrol cihazı ürün sayfaları (8 sayfa) ve çevirileri — TEK KAYNAK.

Kullanım:
  python3 tools/lexron-sayfalar.py            DRY-RUN: üretir, denetler, yazmaz
  python3 tools/lexron-sayfalar.py --uygula   sayfaları ve assets/i18n.js
                                              LEXRONPAGE:DICT bloğunu yazar
Ardından: node build.js && npm test

KURALLAR
- Ürünler GES Marketim kataloğundan gelir (config.js Lexron bloğu). Elimizde
  ÜRETİCİ KÜNYESİ YOK: yalnız ürün adı ve ürün fotoğrafındaki etiket var
  (tür, şarj akımı, akü gerilimi; 80 A modelde adındaki "HV (15~230 V)").
  Panel giriş gerilimi, yük çıkışı, koruma, akü tipi ayarları, verim, ölçü,
  garanti YAZILMAZ; "bize yazın, üreticiden teyit edelim" denir.
- "Yaklaşık panel gücü" künye değeri DEĞİLDİR, genel hesaptır (şarj akımı ×
  akü gerilimi) ve sayfada böyle söylenir. PWM için panel önerisi Isc kuralıyla
  (%25 pay) verilir. Bağlantı adımları genel kuraldır (önce akü, sonra panel).
- HTML iskeleti ve bloklar tools/havensis-sayfalar.py'den gelir (aynı düzen);
  bu betik yalnız içeriği ve kendi sözlük bloğunu üretir.
- Sayfaları ELLE DÜZENLEME: değişikliği burada yap, betiği çalıştır.
"""
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("hv", os.path.join(ROOT, "tools", "havensis-sayfalar.py"))
H = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(H)

k, u, esc = H.k, H.u, H.esc
HAVENSIS_KEYS = set(H.REG)          # bu betiğin sözlüğüne yazılmaz


def t(tr, en, de, ru):
    """Havensis betiğinde zaten çevrilmiş metin onun çevirisiyle kalır."""
    if tr in HAVENSIS_KEYS:
        return tr
    return H.t(tr, en, de, ru)

# ------------------------------------------------------------ ortak metinler
H.KAYNAK = t("Değerler ürün adından ve ürünün üzerindeki etiketten alınmıştır. Panel giriş gerilimi, yük çıkışı, korumalar ve akü tipi ayarları gibi değerler için bize yazın; üreticiden teyit edelim.",
             "Values are taken from the product name and the label on the unit. For values such as panel input voltage, load output, protections and battery-type settings, write to us and we'll confirm them with the manufacturer.",
             "Die Werte stammen aus dem Produktnamen und dem Etikett am Gerät. Für Werte wie Moduleingangsspannung, Lastausgang, Schutzfunktionen und Batterietyp-Einstellungen schreiben Sie uns; wir klären sie mit dem Hersteller.",
             "Значения взяты из названия изделия и этикетки на корпусе. Входное напряжение панелей, выход нагрузки, защиты и настройки типа АКБ уточните у нас — мы сверим их с производителем.")
NO_INC = "Panel ve akü ürüne dahil değildir."          # Havensis sözlüğünde var
BRAND = t("Marka: Lexron", "Brand: Lexron", "Marke: Lexron", "Марка: Lexron")
YAKLASIK = t("Yaklaşık panel gücü", "Approx. panel power", "Ca. Modulleistung", "Ориент. мощность панелей")
PWM_ISC = t("Panellerin toplam Isc'si (en fazla)", "Total panel Isc (max.)", "Gesamt-Isc der Module (max.)", "Суммарный Isc панелей (макс.)")
TUR = t("Tür", "Type", "Typ", "Тип")
FIYAT = t("Fiyat", "Price", "Preis", "Цена")

S = {
    "marka": "Marka", "model": "Model",
    "tur": t("Şarj yöntemi", "Charging method", "Ladeverfahren", "Метод заряда"),
    "akim": t("Şarj akımı", "Charging current", "Ladestrom", "Ток заряда"),
    "aku": t("Akü gerilimi", "Battery voltage", "Batteriespannung", "Напряжение АКБ"),
    "etiket": t("Model etiketindeki aralık", "Range on the model label", "Bereich auf dem Modelletikett", "Диапазон на этикетке модели"),
    "diger": t("Diğer teknik değerler", "Other technical values", "Weitere technische Werte", "Другие технические параметры"),
}
DIGER_V = t("Üretici künyesinden teyit edilir — bize yazın", "Confirmed from the manufacturer's datasheet — write to us",
            "Werden anhand des Herstellerdatenblatts bestätigt — schreiben Sie uns", "Уточняются по паспорту производителя — напишите нам")
V_PWM = t("PWM (darbe genişlik modülasyonu)", "PWM (pulse-width modulation)", "PWM (Pulsweitenmodulation)", "ШИМ (PWM)")
V_MPPT = t("MPPT (maksimum güç noktası izleme)", "MPPT (maximum power point tracking)", "MPPT (Maximum Power Point Tracking)", "MPPT (отслеживание точки максимальной мощности)")

# ------------------------------------------------------------ aile metinleri
F = {
 "pwm": {
  "kicker": t("☀️ PWM Şarj Kontrol", "☀️ PWM Charge Controller", "☀️ PWM-Laderegler", "☀️ ШИМ-контроллер заряда"),
  "fam_p": t("PWM şarj kontrol cihazı, panelden aküye giden şarjı açıp kapatarak düzenler ve aküyü aşırı şarja karşı korur. Panel gerilimini akü gerilimine indirir; aradaki fark şarja dönüşmez. Bu yüzden PWM, panel gerilimi akü gerilimine yakın olan küçük ve ekonomik sistemler için doğru seçimdir.",
             "A PWM charge controller regulates charging from the panel to the battery by switching it on and off, and protects the battery from overcharging. It pulls the panel voltage down to the battery voltage; the difference does not become charge. That is why PWM is the right choice for small, economical systems where the panel voltage is close to the battery voltage.",
             "Ein PWM-Laderegler steuert die Ladung vom Modul zur Batterie durch Ein- und Ausschalten und schützt die Batterie vor Überladung. Er zieht die Modulspannung auf die Batteriespannung herunter; die Differenz wird nicht zu Ladung. Deshalb ist PWM die richtige Wahl für kleine, günstige Anlagen, in denen die Modulspannung nahe an der Batteriespannung liegt.",
             "ШИМ-контроллер регулирует заряд от панели к аккумулятору, включая и выключая его, и защищает аккумулятор от перезаряда. Он снижает напряжение панели до напряжения АКБ; разница в заряд не превращается. Поэтому ШИМ — правильный выбор для небольших экономичных систем, где напряжение панели близко к напряжению АКБ."),
  "use_p": t("Küçük, akülü güneş sistemlerinin ekonomik şarj kontrol çözümüdür.",
             "The economical charge-control solution for small solar systems with batteries.",
             "Die günstige Ladesteuerung für kleine Solaranlagen mit Batterie.",
             "Экономичное решение для контроля заряда в небольших солнечных системах с АКБ."),
  "use": [
   ("🏡", t("Bağ evi ve kulübe", "Country houses and cabins", "Ferienhäuser und Hütten", "Дачи и домики"),
    t("Aydınlatma ve küçük cihazlar için akülü güneş sistemi.", "Solar system with battery for lighting and small devices.", "Solaranlage mit Batterie für Licht und Kleingeräte.", "Солнечная система с АКБ для освещения и мелких приборов.")),
   ("📹", t("Kamera ve güvenlik", "Cameras and security", "Kameras und Sicherheit", "Камеры и охрана"),
    t("Şebekenin olmadığı noktada kamerayı ve modemi besleyen sistem.", "A system that powers cameras and a modem where there is no grid.", "Eine Anlage, die Kameras und Router dort versorgt, wo es kein Netz gibt.", "Система, питающая камеры и модем там, где нет сети.")),
   ("🚐", t("Karavan ve tekne", "Caravans and boats", "Wohnmobile und Boote", "Автодома и лодки"),
    t("12 V yaşam aküsünü güneşle şarj etmek için.", "To charge the 12 V leisure battery from the sun.", "Um die 12-V-Bordbatterie mit Sonnenenergie zu laden.", "Для зарядки бытового аккумулятора 12 В от солнца.")),
   ("🌱", t("Tarla ve bahçe", "Fields and gardens", "Felder und Gärten", "Поля и сады"),
    t("Bekçi kulübesi, elektrikli çit ve küçük DC yükler.", "Guard huts, electric fences and small DC loads.", "Wachhütten, Elektrozäune und kleine DC-Verbraucher.", "Сторожки, электроизгороди и небольшие нагрузки постоянного тока.")),
  ],
  "faq_tip": (t("PWM mi, MPPT mi seçmeliyim?", "Should I choose PWM or MPPT?", "Soll ich PWM oder MPPT wählen?", "Что выбрать: ШИМ или MPPT?"),
              t("Panel gerilimi akü gerilimine yakınsa (örneğin 12 V aküye 12 V sınıfı panel) PWM ekonomik ve yeterlidir. Panel gerilimi akünün çok üstündeyse (mağazamızdaki 285 W ve 655 W paneller gibi) MPPT aynı panelden daha fazla enerji toplar; o durumda MPPT modellerimize bakın.",
                "If the panel voltage is close to the battery voltage (for example a 12 V-class panel on a 12 V battery), PWM is economical and sufficient. If the panel voltage is well above the battery voltage (like the 285 W and 655 W panels in our shop), MPPT collects more energy from the same panel; in that case look at our MPPT models.",
                "Liegt die Modulspannung nahe an der Batteriespannung (z. B. ein 12-V-Modul an einer 12-V-Batterie), ist PWM günstig und ausreichend. Liegt sie deutlich darüber (wie bei den 285-W- und 655-W-Modulen in unserem Shop), holt MPPT aus demselben Modul mehr Energie; dann sehen Sie sich unsere MPPT-Modelle an.",
                "Если напряжение панели близко к напряжению АКБ (например, панель класса 12 В на АКБ 12 В), ШИМ экономичен и достаточен. Если напряжение панели намного выше (как у панелей 285 Вт и 655 Вт в нашем магазине), MPPT соберёт больше энергии с той же панели — тогда посмотрите наши модели MPPT.")),
  "note": (t("Daha yüksek verim mi istiyorsunuz?", "Want higher efficiency?", "Mehr Wirkungsgrad gewünscht?", "Нужна более высокая эффективность?"),
           t("Panel gerilimi akü geriliminden yüksekse MPPT modelleri aynı panelden daha fazla enerji toplar.",
             "If the panel voltage is higher than the battery voltage, MPPT models collect more energy from the same panel.",
             "Ist die Modulspannung höher als die Batteriespannung, holen MPPT-Modelle mehr Energie aus demselben Modul.",
             "Если напряжение панели выше напряжения АКБ, модели MPPT собирают больше энергии с той же панели."),
           "lexron-mppt-30a.html",
           t("Lexron MPPT şarj kontrol cihazları →", "Lexron MPPT charge controllers →", "Lexron MPPT-Laderegler →", "MPPT-контроллеры Lexron →")),
  "cta": t("PWM şarj kontrol cihazını bugün sipariş edin", "Order the PWM charge controller today", "Bestellen Sie den PWM-Laderegler noch heute", "Закажите ШИМ-контроллер сегодня"),
 },
 "mppt": {
  "kicker": t("☀️ MPPT Şarj Kontrol", "☀️ MPPT Charge Controller", "☀️ MPPT-Laderegler", "☀️ MPPT-контроллер заряда"),
  "fam_p": t("MPPT (maksimum güç noktası izleme), panelin o anki ışıkta verebileceği en yüksek gücü bulur ve aküye aktarır. Panel gerilimi akü geriliminden yüksek olduğunda aradaki farkı boşa harcamaz, şarj akımına çevirir. Bu yüzden MPPT'li cihaz, PWM cihazlara göre aynı panelden daha fazla enerji toplar.",
             "MPPT (maximum power point tracking) finds the highest power the panel can deliver in the current light and passes it to the battery. When the panel voltage is higher than the battery voltage, the difference is not wasted but turned into charging current. That is why an MPPT controller collects more energy from the same panel than a PWM controller.",
             "MPPT (Maximum Power Point Tracking) ermittelt die höchste Leistung, die das Modul beim aktuellen Licht liefern kann, und gibt sie an die Batterie weiter. Liegt die Modulspannung über der Batteriespannung, geht die Differenz nicht verloren, sondern wird zu Ladestrom. Deshalb holt ein MPPT-Regler aus demselben Modul mehr Energie als ein PWM-Regler.",
             "MPPT (отслеживание точки максимальной мощности) находит наибольшую мощность, которую панель может отдать при текущем освещении, и передаёт её аккумулятору. Когда напряжение панели выше напряжения АКБ, разница не теряется, а превращается в ток заряда. Поэтому MPPT-контроллер собирает с той же панели больше энергии, чем ШИМ."),
  "use_p": t("Yüksek gerilimli panellerden en fazla enerjiyi aküye aktarmak için.",
             "To get the most energy from high-voltage panels into the battery.",
             "Um aus Hochspannungsmodulen die meiste Energie in die Batterie zu bringen.",
             "Чтобы передать в аккумулятор максимум энергии от высоковольтных панелей."),
  "use": [
   ("🏡", t("Off-grid ev ve bağ evi", "Off-grid homes and country houses", "Netzunabhängige Häuser und Ferienhäuser", "Автономные дома и дачи"),
    t("Akü ve inverterle kurulan şebekeden bağımsız sistem.", "An off-grid system built with batteries and an inverter.", "Eine Inselanlage mit Batterie und Wechselrichter.", "Автономная система с аккумулятором и инвертором.")),
   ("🚐", t("Karavan ve tekne", "Caravans and boats", "Wohnmobile und Boote", "Автодома и лодки"),
    t("Çatıdaki panelden yaşam aküsüne verimli şarj.", "Efficient charging from the roof panel to the leisure battery.", "Effiziente Ladung vom Dachmodul in die Bordbatterie.", "Эффективная зарядка бытового аккумулятора от панели на крыше.")),
   ("📡", t("Kamera ve iletişim direkleri", "Camera and telecom masts", "Kamera- und Funkmasten", "Мачты камер и связи"),
    t("Uzak noktada kesintisiz enerji gereken cihazlar.", "Devices that need uninterrupted power at remote sites.", "Geräte, die an abgelegenen Orten durchgehend Strom brauchen.", "Устройства, которым нужно бесперебойное питание в удалённых местах.")),
   ("🌱", t("Tarım ve bahçe", "Farms and gardens", "Landwirtschaft und Garten", "Сельское хозяйство и сад"),
    t("Akülü sulama, aydınlatma ve küçük iş yerleri.", "Battery-backed irrigation, lighting and small workplaces.", "Batteriegestützte Bewässerung, Beleuchtung und kleine Betriebe.", "Полив, освещение и небольшие хозяйства с аккумулятором.")),
  ],
  "faq_tip": (t("PWM mi, MPPT mi seçmeliyim?", "Should I choose PWM or MPPT?", "Soll ich PWM oder MPPT wählen?", "Что выбрать: ШИМ или MPPT?"),
              t("Panel gerilimi akünün çok üstündeyse (mağazamızdaki 285 W ve 655 W paneller gibi) MPPT aynı panelden daha fazla enerji toplar ve doğru seçimdir. Panel gerilimi akü gerilimine yakın küçük, bütçe öncelikli sistemlerde PWM modeller yeterlidir.",
                "If the panel voltage is well above the battery voltage (like the 285 W and 655 W panels in our shop), MPPT collects more energy from the same panel and is the right choice. For small, budget-first systems where the panel voltage is close to the battery voltage, PWM models are enough.",
                "Liegt die Modulspannung deutlich über der Batteriespannung (wie bei den 285-W- und 655-W-Modulen in unserem Shop), holt MPPT mehr Energie aus demselben Modul und ist die richtige Wahl. Für kleine, preisorientierte Anlagen mit Modulspannung nahe der Batteriespannung genügen PWM-Modelle.",
                "Если напряжение панели намного выше напряжения АКБ (как у панелей 285 Вт и 655 Вт в нашем магазине), MPPT соберёт больше энергии с той же панели и будет правильным выбором. Для небольших бюджетных систем, где напряжение панели близко к напряжению АКБ, достаточно моделей ШИМ.")),
  "note": (t("Bütçe öncelikli küçük bir sistem mi?", "A small, budget-first system?", "Eine kleine, preisorientierte Anlage?", "Небольшая бюджетная система?"),
           t("Panel gerilimi akü gerilimine yakın küçük sistemlerde PWM modeller ekonomik bir çözümdür.",
             "In small systems where the panel voltage is close to the battery voltage, PWM models are an economical solution.",
             "In kleinen Anlagen mit Modulspannung nahe der Batteriespannung sind PWM-Modelle eine günstige Lösung.",
             "В небольших системах, где напряжение панели близко к напряжению АКБ, модели ШИМ — экономичное решение."),
           "lexron-pwm-20a.html",
           t("Lexron PWM şarj kontrol cihazları →", "Lexron PWM charge controllers →", "Lexron PWM-Laderegler →", "ШИМ-контроллеры Lexron →")),
  "cta": t("MPPT şarj kontrol cihazını bugün sipariş edin", "Order the MPPT charge controller today", "Bestellen Sie den MPPT-Laderegler noch heute", "Закажите MPPT-контроллер сегодня"),
 },
}

HOW_P = t("Panel şarj kontrol cihazına, cihaz aküye bağlanır; inverter ve büyük yükler doğrudan aküden beslenir.",
          "The panel connects to the charge controller and the controller to the battery; the inverter and large loads are fed directly from the battery.",
          "Das Modul wird an den Laderegler angeschlossen, der Regler an die Batterie; Wechselrichter und große Verbraucher werden direkt aus der Batterie versorgt.",
          "Панель подключается к контроллеру, контроллер — к аккумулятору; инвертор и мощные нагрузки питаются напрямую от аккумулятора.")
NODE = {
    "panel": t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"),
    "aku": t("Akü", "Battery", "Batterie", "Аккумулятор"),
    "inv": t("İnverter / DC yük", "Inverter / DC load", "Wechselrichter / DC-Last", "Инвертор / нагрузка DC"),
    "inv_s": t("doğrudan aküye", "straight to the battery", "direkt an die Batterie", "напрямую к АКБ"),
    "dc": t("DC gerilim", "DC voltage", "DC-Spannung", "напряжение DC"),
}
STEPS = [
    (t("Önce aküyü bağlayın", "Connect the battery first", "Zuerst die Batterie anschließen", "Сначала подключите аккумулятор"),
     t("Genel kural: cihaz önce aküye bağlanır, panel en son bağlanır. Akü kablosunun üzerine uygun bir sigorta koyun.",
       "General rule: the controller is connected to the battery first and the panel last. Put a suitable fuse on the battery cable.",
       "Grundregel: Der Regler wird zuerst an die Batterie angeschlossen, das Modul zuletzt. Setzen Sie eine passende Sicherung in das Batteriekabel.",
       "Общее правило: контроллер сначала подключают к аккумулятору, панель — в последнюю очередь. Установите подходящий предохранитель на кабель АКБ.")),
    (t("Paneli bağlayın", "Connect the panel", "Das Modul anschließen", "Подключите панель"),
     t("Panel kablolarını MC4 konnektörlerle uzatın; artı ve eksi kutupları cihazın panel girişine doğru yönde bağlayın.",
       "Extend the panel cables with MC4 connectors; connect plus and minus to the controller's panel input the right way round.",
       "Verlängern Sie die Modulkabel mit MC4-Steckern; schließen Sie Plus und Minus richtig herum an den Moduleingang des Reglers an.",
       "Удлините кабели панели разъёмами MC4; подключите плюс и минус ко входу панели контроллера с соблюдением полярности.")),
    (t("Yükleri bağlayın", "Connect the loads", "Die Verbraucher anschließen", "Подключите нагрузки"),
     t("İnverteri doğrudan aküye bağlayın. Cihazda yük çıkışı varsa yalnız küçük DC yükler (aydınlatma gibi) için kullanın.",
       "Connect the inverter directly to the battery. If the controller has a load output, use it only for small DC loads such as lighting.",
       "Schließen Sie den Wechselrichter direkt an die Batterie an. Hat der Regler einen Lastausgang, nutzen Sie ihn nur für kleine DC-Verbraucher wie Beleuchtung.",
       "Инвертор подключайте напрямую к аккумулятору. Если у контроллера есть выход нагрузки, используйте его только для небольших нагрузок DC, например освещения.")),
]
TIPS = [
    t("Cihazı aküye yakın, havadar ve kuru bir yere monte edin.", "Mount the controller close to the battery in a ventilated, dry place.",
      "Montieren Sie den Regler nahe der Batterie an einem belüfteten, trockenen Ort.", "Устанавливайте контроллер рядом с аккумулятором в проветриваемом сухом месте."),
    t("Akü kablosunu kısa ve kalın tutun; uzun ince kablo gerilim kaybına yol açar.", "Keep the battery cable short and thick; long thin cable causes voltage loss.",
      "Halten Sie das Batteriekabel kurz und dick; lange dünne Kabel verursachen Spannungsverlust.", "Кабель АКБ должен быть коротким и толстым: длинный тонкий кабель даёт потери напряжения."),
    t("Lityum akü kullanacaksanız akünün şarj değerlerini sipariş öncesi bize gönderin.", "If you will use a lithium battery, send us its charging values before ordering.",
      "Wenn Sie eine Lithiumbatterie verwenden, schicken Sie uns vor der Bestellung deren Ladewerte.", "Если будете использовать литиевую АКБ, пришлите нам её параметры заряда до заказа."),
]
XS = {
    "p285": t("Yüksek gerilimli panel; MPPT ile en verimli kullanılır.", "A high-voltage panel; used most efficiently with MPPT.",
              "Ein Hochspannungsmodul; am effizientesten mit MPPT.", "Высоковольтная панель; эффективнее всего с MPPT."),
    "p655": t("Büyük sistemler için yüksek güçlü panel.", "A high-power panel for large systems.", "Ein leistungsstarkes Modul für große Anlagen.", "Мощная панель для больших систем."),
    "p50": t("Küçük 12 V sistemler için kompakt panel.", "A compact panel for small 12 V systems.", "Ein kompaktes Modul für kleine 12-V-Anlagen.", "Компактная панель для небольших систем 12 В."),
    "titanx": t("48 V sistem için LiFePO₄ akü.", "A LiFePO₄ battery for a 48 V system.", "Ein LiFePO₄-Akku für ein 48-V-System.", "Аккумулятор LiFePO₄ для системы 48 В."),
    "kablo": t("Panel ile cihaz arasındaki bağlantı için.", "For the connection between panel and controller.", "Für die Verbindung zwischen Modul und Regler.", "Для соединения панели с контроллером."),
    "mc4": t("Panel kablosunu solar kabloya bağlamak için.", "To join the panel cable to the solar cable.", "Um das Modulkabel mit dem Solarkabel zu verbinden.", "Чтобы соединить кабель панели с солнечным кабелем."),
}
Q_LIT = (t("Lityum akü ile kullanabilir miyim?", "Can I use it with a lithium battery?", "Kann ich ihn mit einer Lithiumbatterie verwenden?", "Можно ли использовать с литиевой АКБ?"),
         t("Akü tipi ayarları üreticinin künyesinde yer alır; elimizdeki ürün bilgisinde yazmıyor. Akünüzün tipini ve şarj değerlerini bize gönderin, sipariş öncesi üreticiden teyit edelim.",
           "Battery-type settings are in the manufacturer's datasheet and are not in the product information we have. Send us your battery type and charging values and we'll confirm with the manufacturer before you order.",
           "Die Einstellungen für den Batterietyp stehen im Herstellerdatenblatt, nicht in unseren Produktinformationen. Schicken Sie uns Batterietyp und Ladewerte; wir klären es vor der Bestellung mit dem Hersteller.",
           "Настройки типа АКБ указаны в паспорте производителя, в наших данных их нет. Пришлите тип аккумулятора и параметры заряда — уточним у производителя до заказа."))
Q_SERI = (t("Kaç panel seri bağlayabilirim?", "How many panels can I wire in series?", "Wie viele Module kann ich in Reihe schalten?", "Сколько панелей можно соединить последовательно?"),
          t("Seri bağlamada sınırı cihazın en yüksek panel giriş gerilimi belirler; bu değer elimizdeki ürün bilgisinde yok. Kullanacağınız panelin Voc değerini bize yazın, dizilimi sipariş öncesi birlikte kontrol edelim.",
            "In series wiring the limit is set by the controller's maximum panel input voltage, which is not in the product information we have. Send us the Voc of the panel you will use and we'll check the layout together before you order.",
            "Bei Reihenschaltung bestimmt die maximale Moduleingangsspannung des Reglers die Grenze; dieser Wert fehlt in unseren Produktinformationen. Schicken Sie uns die Voc Ihres Moduls; wir prüfen den Aufbau vor der Bestellung gemeinsam.",
            "При последовательном соединении предел задаёт максимальное входное напряжение панелей контроллера; в наших данных его нет. Пришлите Voc вашей панели — проверим схему вместе до заказа."))
Q_SERI_HV = (Q_SERI[0],
             t("Seri bağlamada sınırı cihazın en yüksek panel giriş gerilimi belirler. Bu modelin adında HV (15~230 V) aralığı yazar; kesin sınır üreticinin künyesindedir. Panellerin Voc değerini bize gönderin, soğukta Voc'un yükseldiğini de hesaba katarak dizilimi birlikte kontrol edelim.",
               "In series wiring the limit is set by the controller's maximum panel input voltage. This model's name carries the HV (15~230 V) range; the exact limit is in the manufacturer's datasheet. Send us your panels' Voc and we'll check the layout together, allowing for Voc rising in the cold.",
               "Bei Reihenschaltung bestimmt die maximale Moduleingangsspannung des Reglers die Grenze. Im Namen dieses Modells steht der Bereich HV (15~230 V); die genaue Grenze steht im Herstellerdatenblatt. Schicken Sie uns die Voc Ihrer Module; wir prüfen den Aufbau gemeinsam und berücksichtigen, dass Voc bei Kälte steigt.",
               "При последовательном соединении предел задаёт максимальное входное напряжение панелей контроллера. В названии этой модели указан диапазон HV (15~230 В); точный предел — в паспорте производителя. Пришлите Voc ваших панелей — проверим схему вместе с учётом роста Voc в холод."))
Q_KUR = (t("Kurulumu kim yapar, Antalya dışına gönderiyor musunuz?", "Who installs it, and do you ship outside Antalya?",
           "Wer installiert ihn, und liefern Sie auch außerhalb von Antalya?", "Кто выполняет монтаж и отправляете ли вы за пределы Анталии?"),
         t("Türkiye'nin her yerine kargo ile gönderiyoruz. Antalya bölgesinde isteğe bağlı yerinde kurulum yapıyoruz; diğer illerde bağlantıyı telefonla birlikte planlıyoruz.",
           "We ship anywhere in Türkiye. In the Antalya region we offer optional on-site installation; elsewhere we plan the wiring with you by phone.",
           "Wir versenden in die ganze Türkei. In der Region Antalya bieten wir optional die Montage vor Ort an; anderswo planen wir den Anschluss telefonisch mit Ihnen.",
           "Отправляем по всей Турции. В регионе Анталии возможен монтаж на месте; в других регионах планируем подключение вместе с вами по телефону."))


def q_amp_mppt(amp, volts):
    vs = [int(v) for v in volts.split("/")]
    tr_w = ", ".join("%d V'ta yaklaşık %d W" % (v, amp * v) for v in vs)
    en_w = ", ".join("about %d W at %d V" % (amp * v, v) for v in vs)
    de_w = ", ".join("etwa %d W bei %d V" % (amp * v, v) for v in vs)
    ru_w = ", ".join("около %d Вт при %d В" % (amp * v, v) for v in vs)
    return (t("Bu cihaza ne kadar panel bağlayabilirim?", "How much panel power can I connect?", "Wie viel Modulleistung kann ich anschließen?", "Какую мощность панелей можно подключить?"),
            t("Genel hesap: şarj akımı × akü gerilimi. %d A için %s eder. Bu yaklaşık değerdir, künye değeri değildir; üreticinin izin verdiği en yüksek panel gücü ve gerilimi için bize yazın." % (amp, tr_w),
              "Rule of thumb: charging current × battery voltage. For %d A that is %s. This is an estimate, not a datasheet value; write to us for the maximum panel power and voltage the manufacturer allows." % (amp, en_w),
              "Faustregel: Ladestrom × Batteriespannung. Für %d A ergibt das %s. Das ist ein Richtwert, kein Datenblattwert; schreiben Sie uns für die vom Hersteller zugelassene maximale Modulleistung und -spannung." % (amp, de_w),
              "Общее правило: ток заряда × напряжение АКБ. Для %d А это %s. Это ориентировочное значение, а не паспортное; максимальную мощность и напряжение панелей, допустимые производителем, уточните у нас." % (amp, ru_w)))


def q_amp_pwm(amp):
    isc = amp * 0.8
    isc_s = ("%g" % isc).replace(".", ",")
    return (t("Bu cihaza ne kadar panel bağlayabilirim?", "How much panel power can I connect?", "Wie viel Modulleistung kann ich anschließen?", "Какую мощность панелей можно подключить?"),
            t("PWM'de sınırı panellerin kısa devre akımı (Isc) belirler. Genel kural %%25 pay bırakmaktır: %d A cihazda panellerin toplam Isc'si en fazla yaklaşık %s A olmalı. Panel gerilimi akü gerilimine yakın olmalıdır; yüksek gerilimli panellerde MPPT seçin." % (amp, isc_s),
              "With PWM the limit is the panels' short-circuit current (Isc). The general rule is to leave 25%% headroom: on a %d A controller the panels' total Isc should be at most about %s A. The panel voltage should be close to the battery voltage; for high-voltage panels choose MPPT." % (amp, ("%g" % isc)),
              "Bei PWM begrenzt der Kurzschlussstrom (Isc) der Module. Die Grundregel ist 25 %% Reserve: Bei einem %d-A-Regler sollte die Gesamt-Isc der Module höchstens etwa %s A betragen. Die Modulspannung sollte nahe an der Batteriespannung liegen; bei Hochspannungsmodulen wählen Sie MPPT." % (amp, isc_s),
              "У ШИМ предел задаёт ток короткого замыкания панелей (Isc). Общее правило — запас 25 %%: для контроллера %d А суммарный Isc панелей должен быть не более примерно %s А. Напряжение панели должно быть близко к напряжению АКБ; для высоковольтных панелей выбирайте MPPT." % (amp, isc_s)))


# ------------------------------------------------------------ ürünler
MODELS = [
    # id, dosya, tür, akım, akü gerilimi, ek etiket
    ("lexron-pwm-20a", "lexron-pwm-20a.html", "pwm", 20, "12/24", None),
    ("lexron-pwm-30a", "lexron-pwm-30a.html", "pwm", 30, "12/24", None),
    ("lexron-pwm-40a", "lexron-pwm-40a.html", "pwm", 40, "12/24", None),
    ("lexron-pwm-60a", "lexron-pwm-60a.html", "pwm", 60, "12/24/48", None),
    ("lexron-mppt-20a", "lexron-mppt-20a.html", "mppt", 20, "12/24", None),
    ("lexron-mppt-30a", "lexron-mppt-30a.html", "mppt", 30, "12/24", None),
    ("lexron-mppt-40a", "lexron-mppt-40a.html", "mppt", 40, "12/24", None),
    ("lexron-mppt-80a-hv", "lexron-mppt-80a-hv.html", "mppt", 80, "12/24/36/48", "HV (15~230 V)"),
]


def cmp_rows(fam):
    rows = []
    for pid, file, f, amp, volts, extra in MODELS:
        if f != fam:
            continue
        name = k("Lexron %d A %s%s" % (amp, f.upper(), " HV" if extra else ""))
        if fam == "mppt":
            vs = [int(v) for v in volts.split("/")]
            est = u(" / ".join("%d W" % (amp * v) for v in vs))
        else:
            est = u(("≤ %g A" % (amp * 0.8)).replace(".", ","))
        rows.append((pid, file, [name, u(volts + " V"), u("%d A" % amp), est]))
    return rows


def product(pk, pid, file, fam, amp, volts, extra):
    p = pk[pid]
    Fm = F[fam]
    name = p["name"]
    vtxt = volts + " V"
    big = "48" in volts
    lead = t("Lexron %d A %s şarj kontrol cihazı: %s akülü güneş sistemlerinde panelden aküye şarjı yönetir. %s" % (
                 amp, fam.upper(), vtxt,
                 "Panel gerilimi akü gerilimine yakın küçük sistemler için ekonomik çözüm." if fam == "pwm" else
                 "Yüksek gerilimli panellerden aküye en fazla enerjiyi aktarır."),
             "Lexron %d A %s charge controller: manages charging from panel to battery in %s battery solar systems. %s" % (
                 amp, fam.upper(), vtxt,
                 "An economical solution for small systems where the panel voltage is close to the battery voltage." if fam == "pwm" else
                 "Transfers the most energy from high-voltage panels to the battery."),
             "Lexron %d-A-%s-Laderegler: steuert in Solaranlagen mit %s-Batterie die Ladung vom Modul zur Batterie. %s" % (
                 amp, fam.upper(), vtxt,
                 "Eine günstige Lösung für kleine Anlagen mit Modulspannung nahe der Batteriespannung." if fam == "pwm" else
                 "Bringt aus Hochspannungsmodulen die meiste Energie in die Batterie."),
             "Контроллер заряда Lexron %d А %s: управляет зарядом от панели к аккумулятору в солнечных системах с АКБ %s. %s" % (
                 amp, "ШИМ" if fam == "pwm" else "MPPT", vtxt.replace(" V", " В"),
                 "Экономичное решение для небольших систем, где напряжение панели близко к напряжению АКБ." if fam == "pwm" else
                 "Передаёт в аккумулятор максимум энергии от высоковольтных панелей."))
    short = "Lexron %d A %s%s" % (amp, fam.upper(), " HV" if extra else "")
    intro = t("%s, %s akü sistemleri için %d A şarj akımına sahiptir. Model ve akü gerilimleri ürünün üzerindeki etikette yazılıdır." % (short, vtxt, amp),
              "%s has a %d A charging current for %s battery systems. The model and battery voltages are printed on the label on the unit." % (short, amp, vtxt),
              "%s hat einen Ladestrom von %d A für %s-Batteriesysteme. Modell und Batteriespannungen stehen auf dem Etikett am Gerät." % (short, amp, vtxt),
              "%s имеет ток заряда %d А для систем с АКБ %s. Модель и напряжения АКБ указаны на этикетке устройства." % (short, amp, vtxt.replace(" V", " В")))
    about = [intro, Fm["fam_p"], NO_INC]
    if extra:
        about.insert(2, t("Model adında yer alan HV (15~230 V) ibaresi bu cihazın yüksek gerilimli panel dizilerine yönelik olduğunu gösterir; kesin panel giriş sınırını sipariş öncesi üreticiden teyit ediyoruz.",
                          "The HV (15~230 V) in the model name shows that the unit is meant for high-voltage panel strings; we confirm the exact panel input limit with the manufacturer before you order.",
                          "Das HV (15~230 V) im Modellnamen zeigt, dass das Gerät für Hochspannungs-Modulstränge gedacht ist; die genaue Eingangsgrenze klären wir vor der Bestellung mit dem Hersteller.",
                          "Обозначение HV (15~230 В) в названии модели говорит о том, что устройство рассчитано на высоковольтные цепочки панелей; точный предел входа уточняем у производителя до заказа."))
    specs = [(S["marka"], k("Lexron")), (S["model"], k(name)),
             (S["tur"], V_PWM if fam == "pwm" else V_MPPT),
             (S["akim"], u("%d A" % amp)), (S["aku"], u(vtxt))]
    if extra:
        specs.append((S["etiket"], u(extra)))
    specs.append((S["diger"], DIGER_V))
    chips = [u("⚡ %s · %d A" % (vtxt, amp)), k("🔆 %s" % fam.upper())]
    if fam == "mppt":
        vs = [int(v) for v in volts.split("/")]
        chips.append(t("☀️ ≈ %d–%d W panel" % (amp * vs[0], amp * vs[-1]), "☀️ ≈ %d–%d W of panels" % (amp * vs[0], amp * vs[-1]),
                       "☀️ ≈ %d–%d W Module" % (amp * vs[0], amp * vs[-1]), "☀️ ≈ %d–%d Вт панелей" % (amp * vs[0], amp * vs[-1])))
    faq = [Fm["faq_tip"], (q_amp_mppt(amp, volts) if fam == "mppt" else q_amp_pwm(amp)),
           (Q_SERI_HV if extra else Q_SERI), Q_LIT, Q_KUR]
    if big:
        xs = [("panel-lexron-655w", XS["p655"]), ("aku-titanx-51v-102ah", XS["titanx"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])]
    elif fam == "pwm":
        xs = [("panel-50w", XS["p50"]), ("panel-lexron-285w", XS["p285"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])]
    else:
        xs = [("panel-lexron-285w", XS["p285"]), ("panel-lexron-655w", XS["p655"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])]
    cmp_heads = [t("Model", "Model", "Modell", "Модель"), t("Akü gerilimi", "Battery voltage", "Batteriespannung", "Напряжение АКБ"),
                 t("Şarj akımı", "Charging current", "Ladestrom", "Ток заряда"), (YAKLASIK if fam == "mppt" else PWM_ISC)]
    cmp_p = (t("Yaklaşık panel gücü = şarj akımı × akü gerilimi (genel hesap, künye değeri değildir).",
               "Approx. panel power = charging current × battery voltage (rule of thumb, not a datasheet value).",
               "Ca. Modulleistung = Ladestrom × Batteriespannung (Faustregel, kein Datenblattwert).",
               "Ориентировочная мощность панелей = ток заряда × напряжение АКБ (общее правило, не паспортное значение).") if fam == "mppt" else
             t("PWM'de panellerin toplam kısa devre akımı (Isc), %25 pay bırakılarak cihaz akımının altında kalmalıdır.",
               "With PWM the panels' total short-circuit current (Isc) must stay below the controller current with 25% headroom.",
               "Bei PWM muss der Gesamt-Kurzschlussstrom (Isc) der Module mit 25 % Reserve unter dem Reglerstrom bleiben.",
               "У ШИМ суммарный ток короткого замыкания панелей (Isc) должен оставаться ниже тока контроллера с запасом 25 %."))
    cmp_tips = [t("Akü grubunuz 48 V ise yalnız 48 V destekleyen modeli seçin.", "If your battery bank is 48 V, choose only a model that supports 48 V.",
                  "Bei einer 48-V-Batteriebank wählen Sie nur ein Modell mit 48-V-Unterstützung.", "Если батарейный блок 48 В, выбирайте только модель с поддержкой 48 В."),
                t("Sistemi büyütmeyi düşünüyorsanız bir üst akım değerini seçin.", "If you plan to grow the system, choose the next current rating up.",
                  "Wenn Sie die Anlage erweitern wollen, wählen Sie die nächsthöhere Stromstärke.", "Если планируете расширять систему, берите модель на ступень выше по току.")]
    title = "%s | GESPA Enerji" % name
    desc = ("%s: %s akülü güneş sistemleri için %s şarj kontrol cihazı, %d A şarj akımı. Türkiye'nin her yerine kargo." %
            (name, vtxt, fam.upper(), amp))
    return {
        "id": pid, "file": file, "title": title, "desc": desc,
        "alt": t("%s — ürün fotoğrafı" % name, "%s — product photo" % name, "%s — Produktfoto" % name, "%s — фото товара" % name),
        "kicker": Fm["kicker"], "lead": lead,
        "info": [("☀️", NO_INC), ("🏷️", BRAND)],
        "chips": chips, "about": about, "specs": specs,
        "gloss": ((t("PWM ve MPPT nedir?", "What are PWM and MPPT?", "Was sind PWM und MPPT?", "Что такое ШИМ и MPPT?")),
                  "sozluk.html#mppt"),
        "use": Fm["use"], "use_p": Fm["use_p"], "how_p": HOW_P,
        "flow": [("☀️", NODE["panel"], NODE["dc"]), ("📟", k("Lexron %d A %s" % (amp, fam.upper())), u(vtxt)),
                 ("🔋", NODE["aku"], u(vtxt)), ("🔌", NODE["inv"], NODE["inv_s"])],
        "flow_here": 1, "flow_notes": [], "steps": STEPS, "tips": TIPS,
        "cmp": {"p": cmp_p, "heads": cmp_heads, "rows": cmp_rows(fam), "tips": cmp_tips},
        "xsell": xs, "faq": faq, "note": Fm["note"], "cta": Fm["cta"],
    }


# ------------------------------------------------------------ yazım
MARK_A = "  // LEXRONPAGE:DICT"
MARK_B = "  // /LEXRONPAGE:DICT"


def load_base():
    js = r"""
const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('assets/i18n.js','utf8');
src=src.replace(/\n  \/\/ LEXRONPAGE:DICT[\s\S]*?\/\/ \/LEXRONPAGE:DICT\n/,'\n');
const a=src.indexOf('var LS = "gespa-lang";'), b=src.indexOf('var SKIP = ');
const o=vm.runInNewContext(src.slice(a,b)+';({DICT:DICT})',{});
process.stdout.write(JSON.stringify(o.DICT));
"""
    return H.node_json(js)


def dict_block(base):
    lines = [MARK_A + " — Lexron şarj kontrol sayfaları; tools/lexron-sayfalar.py ÜRETİR.",
             "  // Elle düzenleme: metni betikte değiştir, betiği --uygula ile çalıştır."]
    for li, lang in enumerate(["en", "de", "ru"]):
        rows = []
        for tr, trs in H.REG.items():
            if tr in HAVENSIS_KEYS:
                continue
            v = trs[li]
            if v == tr or tr in base[lang]:
                continue
            rows.append("    %s: %s," % (json.dumps(tr, ensure_ascii=False), json.dumps(v, ensure_ascii=False)))
        lines.append("  Object.assign(DICT.%s, {" % lang)
        lines += rows
        lines.append("  });")
    lines.append(MARK_B)
    return "\n".join(lines) + "\n"


def main():
    apply = "--uygula" in sys.argv
    pk = H.load_packages()
    base = load_base()
    tpl = open(os.path.join(ROOT, H.TEMPLATE), encoding="utf-8").read()
    pages, problems = {}, 0
    for pid, file, fam, amp, volts, extra in MODELS:
        if pid not in pk:
            sys.exit("config.packages'te yok: " + pid)
        if pk[pid].get("url") != file:
            sys.exit("config url uyuşmuyor (%s): %r ≠ %r" % (pid, pk[pid].get("url"), file))
        P = product(pk, pid, file, fam, amp, volts, extra)
        html = H.build_page(tpl, P, pk, H.main_html(P, pk))
        for lang, x in H.check_translations(html, base):
            print("ÇEVİRİ EKSİK [%s] %s: %s" % (lang, file, x[:90]))
            problems += 1
        pages[file] = html
    block = dict_block(base)
    n_keys = sum(1 for ln in block.split("\n") if ln.startswith("    \""))
    print("%d sayfa, sözlüğe %d yeni satır" % (len(pages), n_keys))
    if problems:
        sys.exit("DUR: %d eksik çeviri" % problems)
    if not apply:
        print("DRY-RUN: yazılmadı (--uygula ile yaz)")
        return
    for f, html in pages.items():
        with open(os.path.join(ROOT, f), "w", encoding="utf-8", newline="") as fh:
            fh.write(html)
    src = open(H.I18N, encoding="utf-8").read()
    src = re.sub(r"\n  // LEXRONPAGE:DICT[\s\S]*?// /LEXRONPAGE:DICT\n", "\n", src)
    i = src.index("  var SKIP = ")
    src = src[:i] + block + src[i:]
    with open(H.I18N, "w", encoding="utf-8", newline="") as fh:
        fh.write(src)
    print("yazıldı: " + ", ".join(pages) + " + assets/i18n.js")


if __name__ == "__main__":
    main()
