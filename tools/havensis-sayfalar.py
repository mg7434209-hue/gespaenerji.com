#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Havensis ürün sayfaları (7 sayfa) ve çevirileri — TEK KAYNAK.

Kullanım:
  python3 tools/havensis-sayfalar.py            DRY-RUN: üretir, denetler, yazmaz
  python3 tools/havensis-sayfalar.py --uygula   sayfaları ve assets/i18n.js
                                                HAVENSIS:DICT bloğunu yazar
Ardından: node build.js && npm test

KURALLAR
- Teknik değerler YALNIZ Havensis 02/2026 genel fiyat listesindeki maddelerdir
  (özeti config.js Havensis bloğunda). Listede olmayan değer (garanti, ağırlık,
  IP sınıfı, akü kimyası uyumu, kutu içeriği) YAZILMAZ; soran müşteriye
  "bize yazın, üreticiden teyit edelim" denir.
- Bağlantı önerileri üreticinin şemalarından gelir (alternatör → marş aküsü →
  DC-DC → yaşam aküsü). Panel dizilimi yalnız elimizdeki künyelerle yazılır:
  Lexron 285 W Voc 42,84 V, Lexron 655 W Voc 50,34 V. Arçelik 540 W'ın künyesi
  yok, bu yüzden önerilmez.
- Sayfa iskeleti (head/nav/footer) şablon ürün sayfasından alınır, <main> bu
  betikte üretilir. Fiyat, stok, JSON-LD, SSS şeması ve tarihler build.js'indir.
- Her metin t(tr, en, de, ru) ile yazılır; sayı ve birimli değerler u() ile
  (EN ondalık nokta ve "98%", DE/RU "98 %", RU birimleri В/А/Вт/мм).
  Sözlükte zaten olan anahtar yeniden yazılmaz, mevcut çeviri korunur.
- Sayfaları ELLE DÜZENLEME: değişikliği burada yap, betiği çalıştır.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = "aku-lifepo4-72v-30ah.html"      # head/nav/footer iskeleti
I18N = os.path.join(ROOT, "assets", "i18n.js")
ORIGIN = "https://www.gespaenerji.com"

# ---------------------------------------------------------------- çeviri kaydı
REG = {}   # tr -> (en, de, ru), eklenme sırasıyla


def t(tr, en, de, ru):
    old = REG.get(tr)
    if old and old != (en, de, ru):
        sys.exit("ÇELİŞEN ÇEVİRİ: %r\n  önce : %r\n  şimdi: %r" % (tr, old, (en, de, ru)))
    REG[tr] = (en, de, ru)
    return tr


def k(s):
    """Çevrilmeyen metin: model adı, marka, yalnız sayı."""
    return t(s, s, s, s)


def _en(s):
    s = re.sub(r"(\d),(\d)", r"\1.\2", s)
    return re.sub(r"%(\d+(?:\.\d+)?)", r"\1%", s)


def _de(s):
    return re.sub(r"%(\d+(?:,\d+)?)", r"\1 %", s)


def _ru(s):
    s = re.sub(r"%(\d+(?:,\d+)?)", r"\1 %", s)
    s = re.sub(r"(?<=\d) mm\b", " мм", s)
    s = re.sub(r"(?<=\d) Ah\b", " А·ч", s)
    s = re.sub(r"(?<=\d) V\b", " В", s)
    s = re.sub(r"(?<=\d) A\b", " А", s)
    s = re.sub(r"(?<=\d) W\b", " Вт", s)
    return s


def u(s):
    """Sayılı/birimli değer: dil biçimi kuralla üretilir."""
    return t(s, _en(s), _de(s), _ru(s))


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def attr(s):
    return esc(s).replace('"', "&quot;")


# ------------------------------------------------------------ ortak metinler
# (Sözlükte olanlar aynen yazılır; betik mevcut çeviriyi korur.)
TXT_BUY = {
    "sku": "Ürün kodu:", "stock": "Stokta / tedarikte", "vat": "KDV dahil fiyattır.",
    "havale": "Havale/EFT ile:", "dec": "Adet azalt", "qty": "Adet", "inc": "Adet artır",
    "add": "🛒 Sepete ekle", "buy": "⚡ Hemen satın al", "wa": "💬 WhatsApp'tan sor",
    "ship": "Türkiye'nin her yerine kargo ile gönderilir.",
    "eta": "Sipariş onayından sonra tahmini teslim:", "days": "iş günü.",
    "ret": "Cayma hakkı (mesafeli satış):", "retd": "gün — iade kargosu alıcıya aittir.",
}
KARGO = [
    "Ürünler Türkiye'nin her iline anlaşmalı kargo ile gönderilir; teslimat için Antalya şartı yoktur.",
    "Sipariş onayından sonra tahmini teslim süresi 2–5 iş günüdür; kargo takip numarası WhatsApp'tan iletilir.",
    "Kargo ücreti alıcıya aittir ve sipariş onayında net olarak bildirilir. Fiyatlara KDV dahildir.",
    "Mesafeli satış mevzuatı gereği teslim tarihinden itibaren 14 gün içinde cayma hakkınız vardır; sorunsuz teslim edilen üründe iade kargo ücreti alıcıya aittir.",
    "Hasarlı veya ayıplı üründe tüm masraflar bize aittir — kargoyu teslim alırken paketi görevli önünde kontrol edin.",
    "Antalya bölgesinde isteğe bağlı yerinde kurulum ve kullanım eğitimi sunulur.",
]
CTA_P = "Stok ve teslimat için WhatsApp'tan yazın; aynı gün dönüş yapıyoruz."
CTA_BTN = "🛒 Sepete ekle ve siparişi tamamla"
URUNU_INCELE = "Ürünü İncele →"

SEPETE_EKLE = t("Sepete ekle →", "Add to cart →", "In den Warenkorb →", "В корзину →")
BU_URUN = t("Bu ürün", "This product", "Dieses Produkt", "Этот товар")
YERLI = t("Yerli üretim · Havensis", "Made in Türkiye · Havensis",
          "Hergestellt in der Türkei · Havensis", "Произведено в Турции · Havensis")
CHIP_YERLI = t("🏭 Yerli üretim", "🏭 Made in Türkiye", "🏭 Hergestellt in der Türkei", "🏭 Сделано в Турции")
KAYNAK = t("Değerler üreticinin (Havensis) ürün listesinden alınmıştır. Listede olmayan bir değeri merak ediyorsanız bize yazın; üreticiden teyit edelim.",
           "Values are taken from the manufacturer's (Havensis) product list. If you need a value that isn't listed, write to us and we'll confirm it with the manufacturer.",
           "Die Werte stammen aus der Produktliste des Herstellers (Havensis). Wenn Sie einen hier nicht aufgeführten Wert benötigen, schreiben Sie uns; wir klären ihn mit dem Hersteller.",
           "Значения взяты из списка продукции производителя (Havensis). Если нужного значения здесь нет, напишите нам — уточним у производителя.")
KAPANIS = t("Cihaz, Havensis tarafından Türkiye'de üretilir. Türkiye'nin her yerine kargo ile gönderiyoruz; Antalya bölgesinde isteğe bağlı yerinde kurulum yapıyoruz.",
            "The unit is made in Türkiye by Havensis. We ship it anywhere in Türkiye and offer optional on-site installation in the Antalya region.",
            "Das Gerät wird von Havensis in der Türkei hergestellt. Wir versenden es in die ganze Türkei und bieten in der Region Antalya optional die Montage vor Ort an.",
            "Устройство производится компанией Havensis в Турции. Отправляем по всей Турции, в регионе Анталии возможен монтаж на месте.")
SEC = {
    "use_k": t("Kullanım alanları", "Applications", "Einsatzbereiche", "Области применения"),
    "use_h": t("Nerelerde kullanılır?", "Where is it used?", "Wo wird es eingesetzt?", "Где применяется?"),
    "how_k": "Kurulum",
    "how_h": t("Nasıl bağlanır?", "How is it connected?", "Wie wird es angeschlossen?", "Как подключить?"),
    "tips": t("Kurulum ipuçları", "Installation tips", "Installationstipps", "Советы по монтажу"),
    "cmp_k": t("Model seçimi", "Choosing a model", "Modellwahl", "Выбор модели"),
    "cmp_h": t("Hangi modeli seçmeliyim?", "Which model should I choose?", "Welches Modell soll ich wählen?", "Какую модель выбрать?"),
    "x_k": t("Tamamlayıcı ürünler", "Complementary products", "Passendes Zubehör", "Сопутствующие товары"),
    "x_h": t("Sistemi tamamlayın", "Complete your system", "Vervollständigen Sie Ihr System", "Дополните систему"),
    "x_p": t("Aynı siparişte alın; hepsi aynı kargoyla gelsin.",
             "Order them together and everything arrives in one shipment.",
             "Zusammen bestellen, alles kommt in einer Sendung.",
             "Закажите вместе, и всё придёт одной посылкой."),
    "faq_k": "Sıkça Sorulan Sorular", "faq_h": "Merak edilenler",
}
# Teknik tablo anahtarları
S = {
    "marka": "Marka",
    "model": t("Model", "Model", "Modell", "Модель"),
    "aku": t("Akü gerilimi", "Battery voltage", "Batteriespannung", "Напряжение АКБ"),
    "sarj": t("Şarj akımı", "Charging current", "Ladestrom", "Ток заряда"),
    "yuk": t("Yük çıkış akımı", "Load output current", "Lastausgangsstrom", "Ток выхода нагрузки"),
    "pvv": t("Maks. panel giriş gerilimi", "Max. panel input voltage", "Max. Moduleingangsspannung", "Макс. входное напряжение панелей"),
    "pvw": t("Maks. panel gücü", "Max. panel power", "Max. Modulleistung", "Макс. мощность панелей"),
    "yontem": t("Şarj yöntemi", "Charging method", "Ladeverfahren", "Метод заряда"),
    "verim": t("Dönüştürücü verimi", "Conversion efficiency", "Wandlungswirkungsgrad", "КПД преобразования"),
    "mpp": t("MPP izleme verimi", "MPP tracking efficiency", "MPP-Tracking-Wirkungsgrad", "Эффективность отслеживания MPP"),
    "gosterge": t("Gösterge", "Indicators", "Anzeigen", "Индикация"),
    "ayar": t("Ayarlar", "Settings", "Einstellungen", "Настройки"),
    "yukk": t("Yük kontrolü", "Load control", "Laststeuerung", "Управление нагрузкой"),
    "besleme": t("Besleme", "Power supply", "Versorgung", "Питание"),
    "boyut": t("Cihaz boyutu", "Dimensions", "Abmessungen", "Габариты"),
    "uretim": t("Üretim", "Origin", "Herkunft", "Производство"),
    "tip": "Tip",
    "komb": t("Şarj kombinasyonları", "Charging combinations", "Ladekombinationen", "Схемы заряда"),
    "takviye": t("Takviye şarj akımı", "Boost charging current", "Boost-Ladestrom", "Ток подпитки"),
    "giris": t("Giriş gerilimi", "Input voltage", "Eingangsspannung", "Входное напряжение"),
    "cikis": t("Çıkış gerilimi", "Output voltage", "Ausgangsspannung", "Выходное напряжение"),
    "kaynak": t("Şarj kaynağı", "Charging source", "Ladequelle", "Источник заряда"),
    "ekran": t("Ekran", "Display", "Display", "Дисплей"),
    "koruma": "Koruma",
    "tasarim": t("Tasarım", "Design", "Auslegung", "Назначение"),
    "sakü": t("Şarj edilen akü", "Battery charged", "Geladene Batterie", "Заряжаемая АКБ"),
    "maxin": t("Maks. giriş akımı", "Max. input current", "Max. Eingangsstrom", "Макс. входной ток"),
    "maxch": t("Maks. şarj akımı", "Max. charging current", "Max. Ladestrom", "Макс. ток заряда"),
    "bt": k("Bluetooth"),
}
V = {
    "havensis": k("Havensis"),
    "mppt": t("Gelişmiş MPPT algoritması", "Advanced MPPT algorithm", "Fortschrittlicher MPPT-Algorithmus", "Усовершенствованный алгоритм MPPT"),
    "lcd": t("LCD ekran ve LED durum göstergesi", "LCD display and LED status indicator", "LCD-Display und LED-Statusanzeige", "ЖК-дисплей и светодиодный индикатор состояния"),
    "tum": t("Tüm parametreler ayarlanabilir", "All parameters adjustable", "Alle Parameter einstellbar", "Все параметры настраиваются"),
    "gece": t("Gece-gündüz ve zaman ayar fonksiyonu", "Dusk-to-dawn and timer function", "Dämmerungs- und Zeitfunktion", "Функции «день-ночь» и таймера"),
    "panelbes": t("Panelden beslenir, aküsüz çalışabilir", "Powered from the panel, can run without a battery", "Versorgung aus dem Modul, läuft auch ohne Batterie", "Питание от панели, может работать без АКБ"),
    "yerli": t("Yerli üretim (Türkiye)", "Made in Türkiye", "Hergestellt in der Türkei", "Сделано в Турции"),
    "tek": t("Tek yönlü", "One-way", "Unidirektional", "Однонаправленное"),
    "cift": t("Çift yönlü", "Bidirectional", "Bidirektional", "Двунаправленное"),
    "ciftm": t("Çift yönlü (takviye modu)", "Bidirectional (boost mode)", "Bidirektional (Boost-Modus)", "Двунаправленное (режим подпитки)"),
    "alt": t("Alternatör (marş aküsü üzerinden)", "Alternator (via the starter battery)", "Lichtmaschine (über die Starterbatterie)", "Генератор (через стартерный аккумулятор)"),
    "ekranp": t("Tüm parametreler ekran ile programlanabilir", "All parameters programmable via the display", "Alle Parameter über das Display programmierbar", "Все параметры программируются с дисплея"),
    "led": t("LED durum göstergesi", "LED status indicator", "LED-Statusanzeige", "Светодиодный индикатор состояния"),
    "dij": t("Dijital ekran bağlantısı, 5 m uzatma kablosu", "Digital display connection, 5 m extension cable", "Anschluss für Digitaldisplay, 5-m-Verlängerungskabel", "Подключение цифрового дисплея, удлинительный кабель 5 м"),
    "ters": t("Ters akım koruması (motor kapalı tanıma)", "Reverse-current protection (engine-off detection)", "Rückstromschutz (Motor-aus-Erkennung)", "Защита от обратного тока (распознавание выключенного двигателя)"),
    "karavan": t("Karavanlar için özel tasarım", "Designed especially for caravans", "Speziell für Wohnmobile entwickelt", "Разработано специально для автодомов"),
    "karatek": t("Karavan ve tekneler için özel tasarım", "Designed especially for caravans and boats", "Speziell für Wohnmobile und Boote entwickelt", "Разработано специально для автодомов и лодок"),
    "gelismis": t("Gelişmiş koruma devreleri", "Advanced protection circuits", "Fortschrittliche Schutzschaltungen", "Усовершенствованные схемы защиты"),
    "btops": t("Dahili, isteğe bağlı (siparişte belirtilir)", "Built-in, optional (specify when ordering)", "Integriert, optional (bei Bestellung angeben)", "Встроенный, опционально (указывается при заказе)"),
    "giris1232": t("12–32 V (12/24 V sistemler)", "12–32 V (12/24 V systems)", "12–32 V (12/24-V-Systeme)", "12–32 В (системы 12/24 В)"),
}

# ------------------------------------------------------------ aile metinleri
# MPPT (Solar-MPS) — üç model
A = {
    "kicker": t("☀️ MPPT Şarj Kontrol", "☀️ MPPT Charge Controller", "☀️ MPPT-Laderegler", "☀️ MPPT-контроллер заряда"),
    "no_inc": t("Panel ve akü ürüne dahil değildir.", "Panels and batteries are not included.",
                "Module und Batterie sind nicht im Lieferumfang enthalten.", "Панели и аккумулятор в комплект не входят."),
    "mppt_p": t("MPPT (maksimum güç noktası izleme), panelin o anki ışıkta verebileceği en yüksek gücü bulur ve aküye aktarır. Panel gerilimi akü geriliminden yüksek olduğunda aradaki farkı ısıya harcamaz, şarj akımına çevirir. Bu yüzden MPPT'li cihaz, basit PWM cihazlara göre aynı panelden daha fazla enerji toplar.",
                "MPPT (maximum power point tracking) finds the highest power the panel can deliver in the current light and passes it to the battery. When the panel voltage is higher than the battery voltage, the difference is not wasted as heat but turned into charging current. That is why an MPPT controller collects more energy from the same panel than a simple PWM controller.",
                "MPPT (Maximum Power Point Tracking) findet die höchste Leistung, die das Modul bei der aktuellen Einstrahlung liefern kann, und gibt sie an die Batterie weiter. Liegt die Modulspannung über der Batteriespannung, wird die Differenz nicht als Wärme verschwendet, sondern in Ladestrom umgewandelt. Deshalb holt ein MPPT-Regler aus demselben Modul mehr Energie als ein einfacher PWM-Regler.",
                "MPPT (отслеживание точки максимальной мощности) находит наибольшую мощность, которую панель может отдать при текущем освещении, и передаёт её в аккумулятор. Когда напряжение панели выше напряжения АКБ, разница не теряется в тепло, а превращается в ток заряда. Поэтому MPPT-контроллер собирает с той же панели больше энергии, чем простой PWM-контроллер."),
    "ayar_p": t("LCD ekran ve LED göstergeler sistemin durumunu gösterir. Tüm parametreler ayarlanabilir: şarj değerlerini akünüze göre cihazın tuşlarından girersiniz. Cihaz panelden beslenebilir ve akü bağlı değilken de çalışabilir.",
                "The LCD display and LED indicators show the system status. All parameters are adjustable: you enter the charging values for your battery with the buttons on the unit. The controller can be powered from the panel and can also run without a battery connected.",
                "LCD-Display und LED-Anzeigen zeigen den Systemzustand. Alle Parameter sind einstellbar: Die Ladewerte für Ihre Batterie geben Sie über die Tasten am Gerät ein. Der Regler kann aus dem Modul versorgt werden und läuft auch ohne angeschlossene Batterie.",
                "ЖК-дисплей и светодиодные индикаторы показывают состояние системы. Все параметры настраиваются: значения заряда под ваш аккумулятор вводятся кнопками на корпусе. Контроллер может питаться от панели и работать без подключённого аккумулятора."),
    "yuk_p": t("Alt kısımda panel, akü ve yük için üç çift bağlantı klemensi vardır. 20 A yük çıkışına bağlanan aydınlatma ve DC cihazlar gece-gündüz fonksiyonuyla otomatik yönetilir: lambalar hava kararınca yanar, zaman ayarıyla ne kadar açık kalacaklarını belirlersiniz.",
               "At the bottom there are three pairs of terminals: panel, battery and load. Lights and DC devices on the 20 A load output are switched automatically by the dusk-to-dawn function: the lamps come on when it gets dark, and with the timer you decide how long they stay on.",
               "Unten befinden sich drei Klemmenpaare für Modul, Batterie und Last. Beleuchtung und DC-Geräte am 20-A-Lastausgang werden über die Dämmerungsfunktion automatisch geschaltet: Die Lampen gehen bei Dunkelheit an, und mit der Zeitfunktion legen Sie fest, wie lange sie brennen.",
               "Внизу расположены три пары клемм: панель, аккумулятор и нагрузка. Освещение и DC-устройства на выходе нагрузки 20 А управляются автоматически функцией «день-ночь»: лампы включаются с наступлением темноты, а таймером вы задаёте, сколько они будут гореть."),
    "use_p": t("Şebekenin olmadığı ya da istenmediği her yerde paneli aküye bağlayan cihazdır.",
               "Wherever there is no grid, or you don't want one, this is the unit that connects the panel to the battery.",
               "Überall, wo es kein Netz gibt oder keines gewünscht ist, verbindet dieses Gerät das Modul mit der Batterie.",
               "Везде, где нет сети или она не нужна, это устройство соединяет панель с аккумулятором."),
    "how_p": t("Güneş paneli cihaza, cihaz aküye bağlanır; ev cihazları aküden, inverter üzerinden çalışır.",
               "The solar panel connects to the controller and the controller to the battery; household appliances run from the battery through an inverter.",
               "Das Solarmodul wird an den Regler angeschlossen, der Regler an die Batterie; Haushaltsgeräte laufen über einen Wechselrichter aus der Batterie.",
               "Солнечная панель подключается к контроллеру, контроллер — к аккумулятору; бытовые приборы работают от АКБ через инвертор."),
    "node_panel": "Güneş paneli",
    "node_mppt": t("MPPT şarj kontrol", "MPPT controller", "MPPT-Regler", "MPPT-контроллер"),
    "node_aku": t("Akü", "Battery", "Batterie", "Аккумулятор"),
    "node_inv": "İnverter",
    "node_inv_s": t("220 V cihazlar", "220 V appliances", "220-V-Geräte", "Приборы 220 В"),
    "flow_yuk": t("💡 Yük çıkışı (20 A): DC aydınlatma ve küçük cihazlar doğrudan cihaza bağlanır, gece-gündüz fonksiyonuyla otomatik yanar.",
                  "💡 Load output (20 A): DC lighting and small devices connect straight to the controller and switch on automatically with the dusk-to-dawn function.",
                  "💡 Lastausgang (20 A): DC-Beleuchtung und kleine Geräte werden direkt am Regler angeschlossen und über die Dämmerungsfunktion automatisch eingeschaltet.",
                  "💡 Выход нагрузки (20 А): DC-освещение и небольшие устройства подключаются прямо к контроллеру и включаются автоматически функцией «день-ночь»."),
    "st1": (t("Aküyü bağlayın", "Connect the battery", "Batterie anschließen", "Подключите аккумулятор"),
            t("Cihazı önce aküye bağlayın ve arasına uygun bir sigorta koyun; kutupları (+ / −) doğru eşleştirin.",
              "Connect the controller to the battery first, with a suitable fuse in between, and match the poles (+ / −) correctly.",
              "Schließen Sie den Regler zuerst an die Batterie an, mit einer passenden Sicherung dazwischen, und achten Sie auf die richtige Polung (+ / −).",
              "Сначала подключите контроллер к аккумулятору через подходящий предохранитель и соблюдите полярность (+ / −).")),
    "st2": (t("Ayarları yapın", "Set it up", "Einstellungen vornehmen", "Выполните настройку"),
            t("Akünüzün tipine ve gerilimine göre şarj değerlerini LCD ekrandan, cihazın tuşlarıyla girin.",
              "Enter the charging values for your battery type and voltage on the LCD display using the buttons on the unit.",
              "Geben Sie die Ladewerte für Batterietyp und -spannung am LCD-Display über die Tasten des Geräts ein.",
              "Введите значения заряда для типа и напряжения вашего аккумулятора на ЖК-дисплее кнопками устройства.")),
    "st3h": t("Panelleri bağlayın", "Connect the panels", "Module anschließen", "Подключите панели"),
    "st3_100": t("Panel dizisinin açık devre gerilimi (Voc) 100 V'u aşmamalı; soğuk havada Voc yükseldiği için pay bırakın.",
                 "The open-circuit voltage (Voc) of the panel string must not exceed 100 V; leave a margin, because Voc rises in cold weather.",
                 "Die Leerlaufspannung (Voc) des Modulstrangs darf 100 V nicht überschreiten; lassen Sie Reserve, denn bei Kälte steigt Voc.",
                 "Напряжение холостого хода (Voc) цепочки панелей не должно превышать 100 В; оставьте запас, так как в холод Voc растёт."),
    "st3_150": t("Panel dizisinin açık devre gerilimi (Voc) 150 V'u aşmamalı; soğuk havada Voc yükseldiği için pay bırakın.",
                 "The open-circuit voltage (Voc) of the panel string must not exceed 150 V; leave a margin, because Voc rises in cold weather.",
                 "Die Leerlaufspannung (Voc) des Modulstrangs darf 150 V nicht überschreiten; lassen Sie Reserve, denn bei Kälte steigt Voc.",
                 "Напряжение холостого хода (Voc) цепочки панелей не должно превышать 150 В; оставьте запас, так как в холод Voc растёт."),
    "st4_yuk": (t("Yükleri bağlayın", "Connect the loads", "Verbraucher anschließen", "Подключите нагрузку"),
                t("DC aydınlatmayı 20 A yük çıkışına, inverteri doğrudan aküye bağlayın. Sökerken önce panelleri ayırın.",
                  "Connect DC lighting to the 20 A load output and the inverter directly to the battery. When removing, disconnect the panels first.",
                  "Schließen Sie DC-Beleuchtung am 20-A-Lastausgang an, den Wechselrichter direkt an der Batterie. Beim Abbau zuerst die Module trennen.",
                  "DC-освещение подключите к выходу нагрузки 20 А, инвертор — напрямую к аккумулятору. При демонтаже сначала отключите панели.")),
    "st4_inv": (t("İnverteri bağlayın", "Connect the inverter", "Wechselrichter anschließen", "Подключите инвертор"),
                t("İnverteri doğrudan akü grubuna bağlayın. Sökerken önce panelleri, sonra aküyü ayırın.",
                  "Connect the inverter directly to the battery bank. When removing, disconnect the panels first, then the battery.",
                  "Schließen Sie den Wechselrichter direkt an die Batteriebank an. Beim Abbau zuerst die Module, dann die Batterie trennen.",
                  "Подключите инвертор напрямую к батарейному блоку. При демонтаже сначала отключите панели, затем аккумулятор.")),
    "tips": [
        t("Cihazı dik, havadar ve doğrudan güneş almayan bir yere monte edin; çevresinde hava dolaşımı için boşluk bırakın.",
          "Mount the controller upright in a ventilated spot out of direct sun, leaving space around it for air to circulate.",
          "Montieren Sie den Regler senkrecht an einem belüfteten Ort ohne direkte Sonne und lassen Sie Platz für die Luftzirkulation.",
          "Устанавливайте контроллер вертикально в проветриваемом месте без прямого солнца, оставив вокруг место для циркуляции воздуха."),
        t("Akü kablosunu kısa ve yeterli kesitte tutun: yüksek şarj akımında ince ve uzun kablo ısınır, gerilim kaybettirir.",
          "Keep the battery cable short and thick enough: at high charging current a thin, long cable heats up and loses voltage.",
          "Halten Sie das Batteriekabel kurz und ausreichend dick: Bei hohem Ladestrom erwärmt sich ein dünnes, langes Kabel und verursacht Spannungsverlust.",
          "Кабель к аккумулятору должен быть коротким и достаточного сечения: при большом токе заряда тонкий длинный кабель греется и теряет напряжение."),
        t("Panel ile cihaz arasında solar kablo ve MC4 konnektör kullanın; bağlantıları sıkı ve güneşe dayanıklı yapın.",
          "Use solar cable and MC4 connectors between panel and controller, and make the connections tight and UV-resistant.",
          "Verwenden Sie zwischen Modul und Regler Solarkabel und MC4-Stecker; die Verbindungen fest und UV-beständig ausführen.",
          "Между панелью и контроллером используйте солнечный кабель и разъёмы MC4; соединения должны быть плотными и стойкими к солнцу."),
        t("Sistem şemanızı ya da panel künyenizi WhatsApp'tan gönderin; dizilimi ve kablo kesitini birlikte kontrol edelim.",
          "Send us your system diagram or panel datasheet on WhatsApp and we'll check the string layout and cable size together.",
          "Schicken Sie uns Ihren Systemplan oder das Moduldatenblatt per WhatsApp; wir prüfen Strangaufbau und Kabelquerschnitt gemeinsam.",
          "Пришлите схему системы или паспорт панели в WhatsApp — вместе проверим схему соединения и сечение кабеля."),
    ],
    "fit_k": t("Panel seçimi", "Choosing panels", "Modulauswahl", "Выбор панелей"),
    "fit_h": t("Mağazamızdaki panellerle uyum", "Compatibility with our panels", "Kompatibilität mit unseren Modulen", "Совместимость с нашими панелями"),
    "fit_p": t("Seri bağlanan panellerin açık devre gerilimleri (Voc) toplanır; toplam, cihazın panel giriş sınırının altında kalmalıdır.",
               "The open-circuit voltages (Voc) of panels wired in series add up; the total must stay below the controller's panel input limit.",
               "Die Leerlaufspannungen (Voc) in Reihe geschalteter Module addieren sich; die Summe muss unter der Eingangsgrenze des Reglers bleiben.",
               "Напряжения холостого хода (Voc) последовательно соединённых панелей складываются; сумма должна оставаться ниже предела входа контроллера."),
    "fit_heads": ["Panel",
                  t("Voc (künye)", "Voc (datasheet)", "Voc (Datenblatt)", "Voc (паспорт)"),
                  t("Bu cihazda en fazla seri", "Max. in series on this controller", "Max. in Reihe an diesem Regler", "Макс. последовательно на этом контроллере")],
    "cmp_p": t("Seçimi akü geriliminiz ve bağlayacağınız panel gücü belirler.",
               "Your choice depends on your battery voltage and the panel power you plan to connect.",
               "Die Wahl hängt von Ihrer Batteriespannung und der geplanten Modulleistung ab.",
               "Выбор зависит от напряжения аккумулятора и мощности панелей, которые вы подключите."),
    "cmp_heads": [S["model"], t("Akü", "Battery", "Batterie", "Аккумулятор"), S["sarj"],
                  t("Panel girişi", "Panel input", "Moduleingang", "Вход панелей"),
                  t("Panel gücü", "Panel power", "Modulleistung", "Мощность панелей"),
                  t("Verim", "Efficiency", "Wirkungsgrad", "КПД"),
                  t("Boyut", "Size", "Größe", "Размер")],
    "cmp_tips": [
        t("1200 W'a kadar panel ve 12/24 V akü: Solar-30AMPS.", "Up to 1200 W of panels and a 12/24 V battery: Solar-30AMPS.",
          "Bis 1200 W Modulleistung und 12/24-V-Batterie: Solar-30AMPS.", "До 1200 Вт панелей и АКБ 12/24 В: Solar-30AMPS."),
        t("1200–2500 W panel ve 12/24 V akü: Solar-60AMPS-100.", "1200–2500 W of panels and a 12/24 V battery: Solar-60AMPS-100.",
          "1200–2500 W Modulleistung und 12/24-V-Batterie: Solar-60AMPS-100.", "1200–2500 Вт панелей и АКБ 12/24 В: Solar-60AMPS-100."),
        t("36 ya da 48 V akü grubu, 2500 W üstü panel ya da 100 V'u aşan panel dizisi: Solar-60AMPS 150|60.",
          "A 36 or 48 V battery bank, more than 2500 W of panels or a panel string above 100 V: Solar-60AMPS 150|60.",
          "36- oder 48-V-Batteriebank, über 2500 W Modulleistung oder ein Modulstrang über 100 V: Solar-60AMPS 150|60.",
          "Батарейный блок 36 или 48 В, более 2500 Вт панелей или цепочка панелей выше 100 В: Solar-60AMPS 150|60."),
        t("Aydınlatmayı yük çıkışından gece-gündüz fonksiyonuyla yönetmek istiyorsanız: Solar-30AMPS ya da Solar-60AMPS-100 (20 A yük çıkışı).",
          "If you want to control lighting from the load output with the dusk-to-dawn function: Solar-30AMPS or Solar-60AMPS-100 (20 A load output).",
          "Wenn Sie die Beleuchtung über den Lastausgang mit Dämmerungsfunktion steuern möchten: Solar-30AMPS oder Solar-60AMPS-100 (20-A-Lastausgang).",
          "Если нужно управлять освещением с выхода нагрузки функцией «день-ночь»: Solar-30AMPS или Solar-60AMPS-100 (выход нагрузки 20 А)."),
    ],
    "gloss": t("MPPT ve panel dizisi (seri bağlama) nedir?", "What are MPPT and a panel string (series connection)?",
               "Was sind MPPT und ein Modulstrang (Reihenschaltung)?", "Что такое MPPT и цепочка панелей (последовательное соединение)?"),
    "cta": t("Şarj kontrol cihazınızı bugün sipariş edin", "Order your charge controller today",
             "Bestellen Sie Ihren Laderegler noch heute", "Закажите контроллер заряда сегодня"),
    "note_h": t("Karavanınızı yolda da şarj etmek ister misiniz?", "Want to charge your caravan on the road too?",
                "Möchten Sie Ihr Wohnmobil auch unterwegs laden?", "Хотите заряжать автодом и в дороге?"),
    "note_p": t("Alternatörden yaşam aküsüne şarj için DC-DC akü şarj cihazlarımıza bakın.",
                "For charging the house battery from the alternator, see our DC-DC battery chargers.",
                "Zum Laden der Aufbaubatterie über die Lichtmaschine sehen Sie sich unsere DC-DC-Ladegeräte an.",
                "Для зарядки бытового аккумулятора от генератора посмотрите наши зарядные устройства DC-DC."),
}
LINK_DCDC = t("DC-DC akü şarj cihazları →", "DC-DC battery chargers →", "DC-DC-Batterieladegeräte →", "Зарядные устройства DC-DC →")

# Ortak SSS (MPPT + DC-DC)
Q_TEL = (t("Telefondan izleyebilir miyim?", "Can I monitor it from my phone?", "Kann ich es per Smartphone überwachen?", "Можно ли следить за ним с телефона?"),
         t("Havensis'in Bluetooth ve Wi-Fi izleme modülleri bu cihaza takılabilir; cihazdaki tüm değerleri telefonunuzdan izlersiniz. Modül ürüne dahil değildir; fiyat için bize yazın.",
           "Havensis Bluetooth and Wi-Fi monitoring modules can be fitted to this unit, letting you follow all its values on your phone. The module is not included; ask us for the price.",
           "An dieses Gerät lassen sich die Bluetooth- und WLAN-Überwachungsmodule von Havensis anschließen; so verfolgen Sie alle Werte auf dem Smartphone. Das Modul ist nicht im Lieferumfang; fragen Sie uns nach dem Preis.",
           "К этому устройству подключаются модули мониторинга Havensis по Bluetooth и Wi-Fi — все значения можно отслеживать с телефона. Модуль в комплект не входит; цену уточняйте у нас."))
Q_KUR_H = t("Kurulumu kim yapar, Antalya dışına gönderiyor musunuz?", "Who installs it, and do you ship outside Antalya?",
            "Wer installiert es, und liefern Sie auch außerhalb von Antalya?", "Кто выполняет монтаж и отправляете ли вы за пределы Анталии?")
Q_KUR_A = (Q_KUR_H,
           t("Türkiye'nin her yerine kargo ile gönderiyoruz; cihazı bir elektrikçi bağlayabilir. Antalya bölgesinde isteğe bağlı yerinde kurulum yapıyoruz.",
             "We ship anywhere in Türkiye; any electrician can connect the unit. In the Antalya region we offer optional on-site installation.",
             "Wir versenden in die ganze Türkei; jeder Elektriker kann das Gerät anschließen. In der Region Antalya bieten wir optional die Montage vor Ort an.",
             "Отправляем по всей Турции; подключить устройство может любой электрик. В регионе Анталии возможен монтаж на месте."))
Q_KUR_OTO = (Q_KUR_H,
             t("Türkiye'nin her yerine kargo ile gönderiyoruz; kurulumu bir oto elektrikçisi yapabilir. Antalya bölgesinde isteğe bağlı yerinde kurulum yapıyoruz.",
               "We ship anywhere in Türkiye; an auto electrician can do the installation. In the Antalya region we offer optional on-site installation.",
               "Wir versenden in die ganze Türkei; die Montage kann eine Kfz-Elektrikwerkstatt übernehmen. In der Region Antalya bieten wir optional die Montage vor Ort an.",
               "Отправляем по всей Турции; установку может выполнить автоэлектрик. В регионе Анталии возможен монтаж на месте."))

Q_AKUSUZ = (t("Akü olmadan çalışır mı?", "Does it work without a battery?", "Funktioniert es ohne Batterie?", "Работает ли без аккумулятора?"),
            t("Cihaz panelden beslenebilir ve akü bağlı değilken de çalışabilir. Güneş enerjisini depolayıp akşam ve gece kullanmak için ise akü gerekir.",
              "The controller can be powered from the panel and can run without a battery connected. To store solar energy and use it in the evening and at night, you need a battery.",
              "Der Regler kann aus dem Modul versorgt werden und läuft auch ohne angeschlossene Batterie. Um Solarenergie zu speichern und abends und nachts zu nutzen, brauchen Sie eine Batterie.",
              "Контроллер может питаться от панели и работать без подключённого аккумулятора. Чтобы запасать солнечную энергию и пользоваться ею вечером и ночью, нужен аккумулятор."))
Q_AKU_H = t("Hangi akülerle çalışır?", "Which batteries does it work with?", "Mit welchen Batterien arbeitet es?", "С какими аккумуляторами работает?")
Q_SERI_H = t("Kaç panel seri bağlayabilirim?", "How many panels can I wire in series?", "Wie viele Module kann ich in Reihe schalten?", "Сколько панелей можно соединить последовательно?")
Q_GECE = (t("Gece-gündüz fonksiyonu ne işe yarar?", "What does the dusk-to-dawn function do?", "Was macht die Dämmerungsfunktion?", "Для чего нужна функция «день-ночь»?"),
          t("Yük çıkışına bağlı aydınlatmayı hava kararınca açar; zaman ayarıyla ne kadar açık kalacağını belirlersiniz. Bahçe, depo, tabela ve sokak aydınlatmasında ayrıca sensör ya da zaman saati gerekmez.",
            "It switches on the lighting connected to the load output when it gets dark; with the timer you decide how long it stays on. For garden, storage, sign and street lighting you need no separate sensor or time switch.",
            "Sie schaltet die Beleuchtung am Lastausgang bei Dunkelheit ein; mit der Zeitfunktion legen Sie fest, wie lange sie brennt. Für Garten-, Lager-, Schilder- und Straßenbeleuchtung brauchen Sie keinen separaten Sensor und keine Zeitschaltuhr.",
            "Она включает освещение на выходе нагрузки с наступлением темноты, а таймером вы задаёте, сколько оно будет гореть. Для освещения сада, склада, вывесок и улиц не нужны отдельный датчик и реле времени."))
Q_INV_YUK = (t("İnverteri yük çıkışına bağlayabilir miyim?", "Can I connect an inverter to the load output?",
               "Kann ich einen Wechselrichter an den Lastausgang anschließen?", "Можно ли подключить инвертор к выходу нагрузки?"),
             t("Hayır. İnverter yüksek akım çektiği için doğrudan aküye bağlanır. Yük çıkışı 20 A'e kadar DC aydınlatma ve küçük cihazlar içindir.",
               "No. An inverter draws a high current, so it is connected directly to the battery. The load output is for DC lighting and small devices up to 20 A.",
               "Nein. Ein Wechselrichter zieht hohe Ströme und wird deshalb direkt an die Batterie angeschlossen. Der Lastausgang ist für DC-Beleuchtung und kleine Geräte bis 20 A gedacht.",
               "Нет. Инвертор потребляет большой ток, поэтому подключается напрямую к аккумулятору. Выход нагрузки предназначен для DC-освещения и небольших устройств до 20 А."))
Q_INV_150 = (t("İnverteri nereye bağlarım?", "Where do I connect the inverter?", "Wo schließe ich den Wechselrichter an?", "Куда подключать инвертор?"),
             t("İnverter doğrudan akü grubuna bağlanır; şarj kontrol cihazı yalnız panelden gelen enerjiyle aküyü doldurur.",
               "The inverter is connected directly to the battery bank; the charge controller only fills the battery with energy from the panels.",
               "Der Wechselrichter wird direkt an die Batteriebank angeschlossen; der Laderegler lädt die Batterie nur mit der Energie aus den Modulen.",
               "Инвертор подключается напрямую к батарейному блоку; контроллер заряда лишь заряжает аккумулятор энергией от панелей."))

A_USE_SMALL = [
    ("🏡", t("Bağ evi ve yayla evi", "Country and mountain houses", "Garten- und Berghäuser", "Дачи и горные дома"),
     t("Paneli aküye bağlar; aydınlatma ve ev cihazları aküden, inverter üzerinden çalışır. Şebeke hattı çekmeden elektrik.",
       "Connects the panel to the battery; lights and household appliances run from the battery through an inverter. Electricity without running a grid line.",
       "Verbindet das Modul mit der Batterie; Beleuchtung und Haushaltsgeräte laufen über einen Wechselrichter aus der Batterie. Strom ohne Netzanschluss.",
       "Соединяет панель с аккумулятором; освещение и бытовые приборы работают от АКБ через инвертор. Электричество без прокладки сетевой линии.")),
    ("🚐", t("Karavan ve tekne", "Caravans and boats", "Wohnmobile und Boote", "Автодома и лодки"),
     t("Tavandaki panellerle 12/24 V yaşam aküsünü kampta ve yolda doldurur; kompakt gövdesi dar alanlara sığar.",
       "Charges the 12/24 V house battery from roof panels at camp and on the road; its compact body fits tight spaces.",
       "Lädt die 12/24-V-Aufbaubatterie über Dachmodule auf dem Stellplatz und unterwegs; das kompakte Gehäuse passt in enge Einbauräume.",
       "Заряжает бытовой аккумулятор 12/24 В от панелей на крыше на стоянке и в пути; компактный корпус помещается в тесных местах.")),
    ("💡", t("Bahçe, tabela ve sokak aydınlatması", "Garden, sign and street lighting", "Garten-, Schilder- und Straßenbeleuchtung", "Освещение сада, вывесок и улиц"),
     t("Gece-gündüz fonksiyonu yük çıkışındaki lambaları hava kararınca yakar, zaman ayarıyla söndürür; ayrıca sensör ya da zaman saati gerekmez.",
       "The dusk-to-dawn function switches on the lamps on the load output when it gets dark and the timer switches them off; no separate sensor or time switch needed.",
       "Die Dämmerungsfunktion schaltet die Lampen am Lastausgang bei Dunkelheit ein, die Zeitfunktion wieder aus; ein separater Sensor oder eine Zeitschaltuhr ist nicht nötig.",
       "Функция «день-ночь» включает лампы на выходе нагрузки с наступлением темноты, а таймер выключает их; отдельный датчик или реле времени не нужны.")),
    ("📹", t("Kamera, modem ve sensörler", "Cameras, modems and sensors", "Kameras, Modems und Sensoren", "Камеры, модемы и датчики"),
     t("Tarla, şantiye ve depo gibi uzak noktalardaki güvenlik kamerası, modem ve ölçüm cihazlarını şebekeden bağımsız besler.",
       "Powers security cameras, modems and measuring devices at remote spots such as fields, building sites and warehouses, independent of the grid.",
       "Versorgt Überwachungskameras, Modems und Messgeräte an abgelegenen Orten wie Feldern, Baustellen und Lagern netzunabhängig.",
       "Питает камеры видеонаблюдения, модемы и измерительные приборы в удалённых местах — на полях, стройках и складах — независимо от сети.")),
]
A_USE_BIG = [
    ("🏡", t("48 V off-grid evler", "48 V off-grid homes", "48-V-Inselhäuser", "Автономные дома на 48 В"),
     t("48 V akü grubu ve inverterle kurulan bağ ve yayla evlerinde panelleri tek cihazla aküye bağlar.",
       "In country and mountain houses built around a 48 V battery bank and an inverter, it connects the panels to the battery with a single unit.",
       "In Garten- und Berghäusern mit 48-V-Batteriebank und Wechselrichter verbindet er die Module mit einem einzigen Gerät mit der Batterie.",
       "В дачах и горных домах с батарейным блоком 48 В и инвертором подключает панели к аккумулятору одним устройством.")),
    ("🏭", t("Çiftlik, ahır ve iş yeri", "Farms, barns and businesses", "Höfe, Ställe und Betriebe", "Фермы, коровники и предприятия"),
     t("Aydınlatma, soğutma ve otomasyon gibi büyük yükleri besleyen akü gruplarını 60 A ile doldurur.",
       "Charges the battery banks that feed large loads such as lighting, cooling and automation at 60 A.",
       "Lädt die Batteriebänke für große Verbraucher wie Beleuchtung, Kühlung und Automatisierung mit 60 A.",
       "Заряжает током 60 А батарейные блоки, питающие крупные нагрузки: освещение, охлаждение и автоматику.")),
    ("🚐", t("Büyük karavan ve tekne", "Large caravans and boats", "Große Wohnmobile und Boote", "Большие автодома и лодки"),
     t("150 V girişi sayesinde panelleri seri bağlayıp enerjiyi daha düşük akımla, daha ince kabloyla taşırsınız.",
       "Thanks to the 150 V input you can wire panels in series and carry the energy at lower current through thinner cable.",
       "Dank des 150-V-Eingangs schalten Sie Module in Reihe und übertragen die Energie mit geringerem Strom über dünnere Kabel.",
       "Благодаря входу 150 В панели можно соединять последовательно и передавать энергию меньшим током по более тонкому кабелю.")),
    ("🔌", t("Sistemi büyütme", "Expanding the system", "System erweitern", "Расширение системы"),
     t("Panel sayısını artırdığınızda 5000 W'a kadar tek cihazla devam edersiniz; 100 V'luk cihazlarda gereken fazla paralel hattan kurtulursunuz.",
       "When you add panels you can go up to 5000 W with one unit and avoid the extra parallel strings that 100 V controllers need.",
       "Wenn Sie Module hinzufügen, kommen Sie mit einem Gerät bis 5000 W und sparen sich die zusätzlichen Parallelstränge, die 100-V-Regler brauchen.",
       "Добавляя панели, можно дойти до 5000 Вт одним устройством и обойтись без лишних параллельных цепочек, которые нужны контроллерам на 100 В.")),
]

# DC-DC (DCDC-1224 / DCDC-1224B)
B = {
    "kicker": t("🚐 Karavan · DC-DC Şarj", "🚐 Caravan · DC-DC Charging", "🚐 Wohnmobil · DC-DC-Laden", "🚐 Автодом · зарядка DC-DC"),
    "no_inc": t("Akü ürüne dahil değildir.", "Batteries are not included.", "Batterien sind nicht im Lieferumfang enthalten.", "Аккумуляторы в комплект не входят."),
    "p2": t("Araç çalışırken alternatör marş aküsünü doldurur; karavanın buzdolabı, aydınlatma ve su pompası ise ikinci bir aküden, yaşam aküsünden beslenir. İki aküyü doğrudan birbirine bağlamak park hâlinde marş aküsünü de boşaltır; basit bir röle ise yaşam aküsünü çoğu zaman tam dolduramaz, uzun kablolarda da gerilim kaybı yaşanır.",
            "While the vehicle runs, the alternator charges the starter battery; the caravan's fridge, lights and water pump run from a second battery, the house battery. Linking the two batteries directly also drains the starter battery when parked; a simple relay often cannot charge the house battery fully, and long cables lose voltage.",
            "Während der Fahrt lädt die Lichtmaschine die Starterbatterie; Kühlschrank, Beleuchtung und Wasserpumpe des Wohnmobils laufen aus einer zweiten Batterie, der Aufbaubatterie. Werden beide Batterien direkt verbunden, entlädt sich im Stand auch die Starterbatterie; ein einfaches Trennrelais lädt die Aufbaubatterie oft nicht voll, und lange Kabel verlieren Spannung.",
            "Пока машина едет, генератор заряжает стартерный аккумулятор; холодильник, свет и водяной насос автодома питаются от второго аккумулятора — бытового. Если соединить аккумуляторы напрямую, на стоянке разряжается и стартерный; простое реле часто не заряжает бытовой аккумулятор полностью, а на длинных кабелях теряется напряжение."),
    "p3": t("DC-DC akü şarj cihazı iki akünün arasına girer: alternatörden gelen enerjiyi alır ve yaşam aküsüne kontrollü biçimde aktarır. 12-12, 12-24, 24-12 ve 24-24 V şarj yapabildiği için aracınız 12 V ya da 24 V olsun, yaşam aküsünü 12 V ya da 24 V kurabilirsiniz.",
            "A DC-DC battery charger sits between the two batteries: it takes the energy from the alternator and passes it to the house battery in a controlled way. Because it can charge 12-12, 12-24, 24-12 and 24-24 V, your house battery can be 12 V or 24 V whether your vehicle is 12 V or 24 V.",
            "Ein DC-DC-Ladegerät sitzt zwischen den beiden Batterien: Es nimmt die Energie der Lichtmaschine auf und gibt sie kontrolliert an die Aufbaubatterie weiter. Da es 12-12, 12-24, 24-12 und 24-24 V laden kann, darf Ihre Aufbaubatterie 12 V oder 24 V haben, egal ob das Fahrzeug 12 V oder 24 V hat.",
            "Зарядное устройство DC-DC устанавливается между двумя аккумуляторами: берёт энергию генератора и контролируемо передаёт её бытовому аккумулятору. Оно заряжает по схемам 12-12, 12-24, 24-12 и 24-24 В, поэтому бытовой аккумулятор может быть на 12 или 24 В — независимо от того, 12 В у машины или 24 В."),
    "p4": t("Motor kapalı tanıma özelliği aracın durduğunu algılar ve ters akımı engeller; park hâlinde marş aküsü yaşam aküsü için boşaltılmaz. Tüm parametreler ekrandan programlanır; dijital ekran 5 m uzatma kablosuyla bağlandığı için cihaz akülerin yanında dururken ekranı karavanın içine alabilirsiniz.",
            "Engine-off detection recognises when the vehicle stops and blocks reverse current, so the starter battery is not drained for the house battery while parked. All parameters are programmed from the display; because the digital display connects with a 5 m extension cable, you can mount it inside the caravan while the unit sits next to the batteries.",
            "Die Motor-aus-Erkennung merkt, wenn das Fahrzeug steht, und sperrt den Rückstrom; im Stand wird die Starterbatterie nicht für die Aufbaubatterie entladen. Alle Parameter werden über das Display programmiert; da das Digitaldisplay mit einem 5-m-Verlängerungskabel angeschlossen wird, können Sie es im Wohnraum anbringen, während das Gerät bei den Batterien sitzt.",
            "Функция распознавания выключенного двигателя определяет остановку машины и блокирует обратный ток, поэтому на стоянке стартерный аккумулятор не разряжается ради бытового. Все параметры программируются с дисплея; цифровой дисплей подключается 5-метровым удлинительным кабелем, так что его можно вынести в салон, а само устройство оставить рядом с аккумуляторами."),
    "p_takviye": t("Takviye modu, uzun süre park eden araçlarda zayıflayan marş aküsünü destekler: cihaz ters yönde çalışır ve yaşam aküsünden marş aküsüne 10 A'e kadar şarj yapar. Yaşam aküsü güneş paneliyle doluyorsa marş aküsü de böylece dolu kalır.",
                   "Boost mode supports a starter battery that weakens when the vehicle is parked for a long time: the unit works in reverse and charges the starter battery from the house battery at up to 10 A. If the house battery is charged by a solar panel, the starter battery stays topped up too.",
                   "Der Boost-Modus hilft einer Starterbatterie, die bei langen Standzeiten schwächer wird: Das Gerät arbeitet in Gegenrichtung und lädt die Starterbatterie aus der Aufbaubatterie mit bis zu 10 A. Wird die Aufbaubatterie per Solarmodul geladen, bleibt so auch die Starterbatterie voll.",
                   "Режим подпитки поддерживает стартерный аккумулятор, который слабеет при долгой стоянке: устройство работает в обратном направлении и заряжает стартерный аккумулятор от бытового током до 10 А. Если бытовой аккумулятор заряжается от солнечной панели, стартерный тоже остаётся заряженным."),
    "use_p": t("Motorlu bir araçta ikinci aküyü yolda, alternatörden doldurmak gereken her yerde.",
               "Anywhere a second battery in a vehicle needs charging from the alternator on the road.",
               "Überall dort, wo eine Zweitbatterie im Fahrzeug unterwegs über die Lichtmaschine geladen werden muss.",
               "Везде, где второй аккумулятор в машине нужно заряжать в пути от генератора."),
    "how_p": t("Cihaz marş aküsü ile yaşam aküsünün arasına bağlanır; dijital ekran 5 m kabloyla karavanın içine alınabilir.",
               "The unit is connected between the starter battery and the house battery; the digital display can be placed inside the caravan with its 5 m cable.",
               "Das Gerät wird zwischen Starter- und Aufbaubatterie angeschlossen; das Digitaldisplay kann mit dem 5-m-Kabel im Wohnraum sitzen.",
               "Устройство подключается между стартерным и бытовым аккумулятором; цифровой дисплей на 5-метровом кабеле можно вынести в салон."),
    "node_alt": t("Alternatör", "Alternator", "Lichtmaschine", "Генератор"),
    "node_alt_s": t("Motor çalışırken", "While the engine runs", "Bei laufendem Motor", "При работающем двигателе"),
    "node_mars": t("Marş aküsü", "Starter battery", "Starterbatterie", "Стартерный аккумулятор"),
    "node_dcdc": t("DC-DC şarj cihazı", "DC-DC charger", "DC-DC-Ladegerät", "Зарядное DC-DC"),
    "node_yasam": t("Yaşam aküsü", "House battery", "Aufbaubatterie", "Бытовой аккумулятор"),
    "node_cihaz": t("Karavan cihazları", "Caravan devices", "Bordgeräte", "Приборы автодома"),
    "node_cihaz_s": t("Buzdolabı, aydınlatma, pompa", "Fridge, lights, pump", "Kühlschrank, Licht, Pumpe", "Холодильник, свет, насос"),
    "flow_ekran": t("📟 Dijital ekran 5 m uzatma kablosuyla cihaza bağlanır; şarj karavanın içinden izlenir ve programlanır.",
                    "📟 The digital display connects to the unit with a 5 m extension cable, so charging is monitored and programmed from inside the caravan.",
                    "📟 Das Digitaldisplay wird mit einem 5-m-Verlängerungskabel angeschlossen; so wird das Laden aus dem Wohnraum überwacht und programmiert.",
                    "📟 Цифровой дисплей подключается 5-метровым удлинительным кабелем, поэтому заряд контролируется и настраивается из салона."),
    "flow_takviye": t("🔁 Takviye modunda akış ters döner: yaşam aküsünden marş aküsüne, 10 A'e kadar.",
                      "🔁 In boost mode the flow reverses: from the house battery to the starter battery, up to 10 A.",
                      "🔁 Im Boost-Modus kehrt sich der Fluss um: von der Aufbau- zur Starterbatterie, bis 10 A.",
                      "🔁 В режиме подпитки поток меняет направление: от бытового аккумулятора к стартерному, до 10 А."),
    "st_in": (t("Girişi bağlayın", "Connect the input", "Eingang anschließen", "Подключите вход"),
              t("Cihazın girişini marş aküsüne bağlayın; akünün yakınına uygun bir sigorta koyun.",
                "Connect the unit's input to the starter battery, with a suitable fuse close to the battery.",
                "Schließen Sie den Eingang an die Starterbatterie an, mit einer passenden Sicherung nahe der Batterie.",
                "Подключите вход устройства к стартерному аккумулятору, установив подходящий предохранитель рядом с АКБ.")),
    "st_out": (t("Çıkışı bağlayın", "Connect the output", "Ausgang anschließen", "Подключите выход"),
               t("Çıkışı yaşam aküsüne bağlayın; bu hatta da akünün yakınına sigorta koyun.",
                 "Connect the output to the house battery, again with a fuse close to the battery.",
                 "Schließen Sie den Ausgang an die Aufbaubatterie an, auch hier mit Sicherung nahe der Batterie.",
                 "Подключите выход к бытовому аккумулятору, также с предохранителем рядом с АКБ.")),
    "st_ekran": (t("Ekranı yerleştirin", "Place the display", "Display anbringen", "Установите дисплей"),
                 t("Dijital ekranı 5 m kabloyla görebileceğiniz yere alın; şarj değerlerini yaşam akünüze göre programlayın.",
                   "Put the digital display where you can see it using the 5 m cable, and program the charging values for your house battery.",
                   "Bringen Sie das Digitaldisplay mit dem 5-m-Kabel gut sichtbar an und programmieren Sie die Ladewerte für Ihre Aufbaubatterie.",
                   "Разместите цифровой дисплей на 5-метровом кабеле там, где его видно, и задайте значения заряда для бытового аккумулятора.")),
    "st_motor": (t("Motoru çalıştırın", "Start the engine", "Motor starten", "Запустите двигатель"),
                 t("Şarj motor çalışırken yapılır; motor durunca cihaz bunu algılar ve marş aküsünü korur.",
                   "Charging happens while the engine runs; when the engine stops, the unit detects it and protects the starter battery.",
                   "Geladen wird bei laufendem Motor; steht der Motor, erkennt das Gerät dies und schützt die Starterbatterie.",
                   "Заряд идёт при работающем двигателе; когда двигатель останавливается, устройство это распознаёт и защищает стартерный аккумулятор.")),
    "tip_yer": t("Cihazı akülere yakın, havadar ve kuru bir yere monte edin; kablo yolunu kısa tutun.",
                 "Mount the unit close to the batteries in a ventilated, dry place and keep cable runs short.",
                 "Montieren Sie das Gerät nahe den Batterien an einem belüfteten, trockenen Ort und halten Sie die Kabelwege kurz.",
                 "Устанавливайте устройство рядом с аккумуляторами в проветриваемом сухом месте и делайте кабельные трассы короткими."),
    "tip_kesit": t("Kablo kesitini ve sigortayı modelin akımına göre seçin; giriş hattı, kayıplar nedeniyle çıkıştan biraz daha fazla akım taşır.",
                   "Choose cable size and fuses to match the model's current; because of losses, the input line carries slightly more current than the output.",
                   "Wählen Sie Kabelquerschnitt und Sicherungen passend zum Strom des Modells; wegen der Verluste führt die Eingangsleitung etwas mehr Strom als der Ausgang.",
                   "Сечение кабеля и предохранители подбирайте по току модели; из-за потерь входная линия несёт чуть больший ток, чем выход."),
    "tip_alt": t("Alternatörünüzün bu ek yükü karşılayabildiğini kontrol edin; akıllı alternatörlü yeni araçlar için bize danışın.",
                 "Check that your alternator can handle the extra load; for newer vehicles with smart alternators, ask us.",
                 "Prüfen Sie, ob Ihre Lichtmaschine die zusätzliche Last verkraftet; bei neueren Fahrzeugen mit intelligenter Lichtmaschine fragen Sie uns.",
                 "Убедитесь, что генератор выдержит дополнительную нагрузку; для новых машин с «умным» генератором проконсультируйтесь с нами."),
    "tip_oto": t("Kurulumu bir oto elektrikçisine yaptırmanızı öneririz; sistem şemanızı WhatsApp'tan gönderin, birlikte kontrol edelim.",
                 "We recommend having an auto electrician install it; send us your system diagram on WhatsApp and we'll check it together.",
                 "Wir empfehlen den Einbau durch eine Kfz-Elektrikwerkstatt; schicken Sie uns Ihren Systemplan per WhatsApp, wir prüfen ihn gemeinsam.",
                 "Рекомендуем доверить установку автоэлектрику; пришлите схему системы в WhatsApp — проверим вместе."),
    "cmp_p": t("Seçimi yaşam akünüzün kapasitesi ve marş aküsünü takviye etme ihtiyacınız belirler.",
               "Your choice depends on your house battery capacity and whether you need to support the starter battery.",
               "Die Wahl hängt von der Kapazität Ihrer Aufbaubatterie ab und davon, ob die Starterbatterie gestützt werden soll.",
               "Выбор зависит от ёмкости бытового аккумулятора и от того, нужна ли подпитка стартерного."),
    "cmp_heads": [S["model"], "Tip", S["sarj"], t("Takviye", "Boost", "Boost", "Подпитка"),
                  t("Giriş", "Input", "Eingang", "Вход"), t("Çıkış", "Output", "Ausgang", "Выход"),
                  "Verim", "Boyut"],
    "cmp_tips": [
        t("Yaşam aküsünü yolda doldurmak yeterliyse ve sürüşleriniz uzunsa: DCDC-1224 30 A.",
          "If charging the house battery on the road is enough and your drives are long: DCDC-1224 30 A.",
          "Wenn das Laden der Aufbaubatterie unterwegs genügt und Ihre Fahrten lang sind: DCDC-1224 30 A.",
          "Если достаточно заряжать бытовой аккумулятор в пути и поездки длинные: DCDC-1224 30 А."),
        t("Büyük yaşam aküsü ya da kısa sürüşlerde daha hızlı dolum için: DCDC-1224 40 A.",
          "For a large house battery or faster charging on short drives: DCDC-1224 40 A.",
          "Für eine große Aufbaubatterie oder schnelleres Laden auf kurzen Fahrten: DCDC-1224 40 A.",
          "Для большого бытового аккумулятора или более быстрого заряда в коротких поездках: DCDC-1224 40 А."),
        t("Uzun süre park eden, marş aküsü zayıflayan araçlar ya da güneşle dolan yaşam aküsünün marş aküsünü de desteklemesi için: çift yönlü DCDC-1224B.",
          "For vehicles parked for long periods with a weakening starter battery, or to let a solar-charged house battery support the starter battery: the bidirectional DCDC-1224B.",
          "Für Fahrzeuge mit langen Standzeiten und schwächelnder Starterbatterie oder wenn eine solargeladene Aufbaubatterie die Starterbatterie stützen soll: der bidirektionale DCDC-1224B.",
          "Для машин с долгими стоянками и слабеющим стартером или чтобы заряжаемый от солнца бытовой аккумулятор подпитывал стартерный: двунаправленный DCDC-1224B."),
    ],
    "gloss": t("DC-DC akü şarj cihazı nedir?", "What is a DC-DC battery charger?", "Was ist ein DC-DC-Ladegerät?", "Что такое зарядное устройство DC-DC?"),
    "cta": t("Yaşam akünüzü yolda doldurun", "Charge your house battery on the road", "Laden Sie Ihre Aufbaubatterie unterwegs", "Заряжайте бытовой аккумулятор в пути"),
    "note_h": t("Akü grubunuz 36–72 V mu?", "Is your battery bank 36–72 V?", "Hat Ihre Batteriebank 36–72 V?", "Ваш батарейный блок на 36–72 В?"),
    "note_p": t("12/24 V araç aküsünden yüksek gerilimli akü grubunu şarj etmek için BOOST DC-DC şarj cihazımıza bakın.",
                "To charge a high-voltage battery bank from a 12/24 V vehicle battery, see our BOOST DC-DC charger.",
                "Um eine Hochvolt-Batteriebank aus einer 12/24-V-Fahrzeugbatterie zu laden, sehen Sie sich unser BOOST-DC-DC-Ladegerät an.",
                "Чтобы заряжать высоковольтный батарейный блок от автомобильного аккумулятора 12/24 В, посмотрите наше повышающее зарядное BOOST DC-DC."),
    "note_link": t("BOOST DC-DC şarj cihazı →", "BOOST DC-DC charger →", "BOOST-DC-DC-Ladegerät →", "Зарядное BOOST DC-DC →"),
}
B_USE = [
    ("🚐", t("Karavan ve motokaravan", "Caravans and motorhomes", "Wohnwagen und Wohnmobile", "Караваны и автодома"),
     t("Yolda alternatörden yaşam aküsünü doldurur; kampa vardığınızda buzdolabı, aydınlatma ve su pompası için akü hazırdır.",
       "Fills the house battery from the alternator on the road; when you reach camp, the battery is ready for the fridge, lights and water pump.",
       "Lädt die Aufbaubatterie unterwegs über die Lichtmaschine; am Stellplatz ist sie bereit für Kühlschrank, Licht und Wasserpumpe.",
       "В пути заряжает бытовой аккумулятор от генератора; на стоянке аккумулятор готов для холодильника, света и насоса.")),
    ("⛵", t("Tekne ve yat", "Boats and yachts", "Boote und Yachten", "Лодки и яхты"),
     t("Motor çalışırken servis aküsünü şarj eder; marş aküsü motoru çalıştırmaya hazır kalır.",
       "Charges the service battery while the engine runs; the starter battery stays ready to start the engine.",
       "Lädt die Verbraucherbatterie, während der Motor läuft; die Starterbatterie bleibt startbereit.",
       "Заряжает сервисный аккумулятор при работающем двигателе; стартерный остаётся готовым к пуску.")),
    ("🚑", t("Servis ve iş araçları", "Service and work vehicles", "Service- und Arbeitsfahrzeuge", "Служебные и рабочие машины"),
     t("Ambulans, seyyar satış, kamp ve atölye araçlarında ikinci aküyü motor çalışırken doldurur.",
       "Charges the second battery while the engine runs in ambulances, mobile sales, camper and workshop vehicles.",
       "Lädt die Zweitbatterie bei laufendem Motor in Kranken-, Verkaufs-, Camping- und Werkstattfahrzeugen.",
       "Заряжает второй аккумулятор при работающем двигателе в машинах скорой помощи, автолавках, кемперах и мастерских на колёсах.")),
]
B_USE_24 = ("🚚", t("24 V kamyon ve otobüs", "24 V trucks and buses", "24-V-Lkw und -Busse", "Грузовики и автобусы 24 В"),
            t("24 V araçta 12 V (24-12) ya da 24 V (24-24) yaşam aküsünü şarj eder; 12 V cihazlarınız için ayrı dönüştürücüye gerek kalmaz.",
              "Charges a 12 V (24-12) or 24 V (24-24) house battery in a 24 V vehicle, so your 12 V devices need no separate converter.",
              "Lädt im 24-V-Fahrzeug eine 12-V- (24-12) oder 24-V-Aufbaubatterie (24-24); für 12-V-Geräte ist kein separater Wandler nötig.",
              "В машине на 24 В заряжает бытовой аккумулятор 12 В (24-12) или 24 В (24-24); для устройств на 12 В не нужен отдельный преобразователь."))
B_USE_TAK = ("🔁", t("Marş aküsü takviyesi", "Starter battery support", "Stützung der Starterbatterie", "Подпитка стартерного аккумулятора"),
             t("Uzun beklemede zayıflayan marş aküsünü, takviye modunda yaşam aküsünden 10 A'e kadar şarj ederek destekler.",
               "In boost mode it supports a starter battery that weakens during long standstills by charging it from the house battery at up to 10 A.",
               "Im Boost-Modus hilft es einer Starterbatterie, die bei langen Standzeiten schwächer wird, indem es sie aus der Aufbaubatterie mit bis zu 10 A lädt.",
               "В режиме подпитки поддерживает стартерный аккумулятор, слабеющий при долгой стоянке, заряжая его от бытового током до 10 А."))
B_Q = {
    "neden": (t("DC-DC şarj cihazı neden gerekli, aküleri doğrudan bağlasam olmaz mı?", "Why do I need a DC-DC charger; can't I just link the batteries directly?",
                "Wozu ein DC-DC-Ladegerät, kann ich die Batterien nicht direkt verbinden?", "Зачем нужно зарядное DC-DC, нельзя ли соединить аккумуляторы напрямую?"),
              t("Doğrudan bağlantı park hâlinde marş aküsünü de boşaltır; basit röleler ise yaşam aküsünü çoğu zaman tam dolduramaz ve uzun kablolarda gerilim kaybı yaşanır. DC-DC şarj cihazı iki aküyü ayırır ve yaşam aküsünü kontrollü biçimde doldurur.",
                "A direct link also drains the starter battery when parked; simple relays often cannot charge the house battery fully, and long cables lose voltage. A DC-DC charger separates the two batteries and charges the house battery in a controlled way.",
                "Eine direkte Verbindung entlädt im Stand auch die Starterbatterie; einfache Relais laden die Aufbaubatterie oft nicht voll, und lange Kabel verlieren Spannung. Ein DC-DC-Ladegerät trennt die Batterien und lädt die Aufbaubatterie kontrolliert.",
                "Прямое соединение на стоянке разряжает и стартерный аккумулятор; простые реле часто не заряжают бытовой полностью, а на длинных кабелях теряется напряжение. Зарядное DC-DC разделяет аккумуляторы и заряжает бытовой контролируемо.")),
    "arac": (t("Hangi araçlarda kullanılır?", "Which vehicles is it for?", "Für welche Fahrzeuge ist es geeignet?", "Для каких машин подходит?"),
             t("12 V ve 24 V sistemli araçlarda. Cihaz 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir: örneğin 24 V bir kamyonda 12 V yaşam aküsünü şarj edebilir.",
               "Vehicles with 12 V and 24 V systems. The unit can charge 12-12, 12-24, 24-12 and 24-24 V: for example, it can charge a 12 V house battery in a 24 V truck.",
               "Fahrzeuge mit 12-V- und 24-V-Bordnetz. Das Gerät lädt 12-12, 12-24, 24-12 und 24-24 V: zum Beispiel eine 12-V-Aufbaubatterie in einem 24-V-Lkw.",
               "Машины с бортовой сетью 12 В и 24 В. Устройство заряжает по схемам 12-12, 12-24, 24-12 и 24-24 В: например, бытовой аккумулятор 12 В в грузовике на 24 В.")),
    "bosalir_h": t("Motor durunca marş aküsü boşalır mı?", "Does the starter battery drain when the engine stops?",
                   "Entlädt sich die Starterbatterie, wenn der Motor steht?", "Разряжается ли стартерный аккумулятор, когда двигатель остановлен?"),
    "bosalir_a": t("Hayır. Motor kapalı tanıma özelliği aracın durduğunu algılar ve ters akımı engeller; marş aküsü yaşam aküsü için kullanılmaz.",
                   "No. Engine-off detection recognises that the vehicle has stopped and blocks reverse current; the starter battery is not used for the house battery.",
                   "Nein. Die Motor-aus-Erkennung merkt, dass das Fahrzeug steht, und sperrt den Rückstrom; die Starterbatterie wird nicht für die Aufbaubatterie genutzt.",
                   "Нет. Функция распознавания выключенного двигателя определяет остановку машины и блокирует обратный ток; стартерный аккумулятор не расходуется на бытовой."),
    "bosalir_b": t("Hayır. Motor kapalı tanıma özelliği aracın durduğunu algılar ve ters akımı engeller. Takviye modunda ise cihaz bilinçli olarak ters yönde çalışır ve marş aküsünü yaşam aküsünden besler.",
                   "No. Engine-off detection recognises that the vehicle has stopped and blocks reverse current. In boost mode, on the other hand, the unit deliberately works in reverse and feeds the starter battery from the house battery.",
                   "Nein. Die Motor-aus-Erkennung merkt, dass das Fahrzeug steht, und sperrt den Rückstrom. Im Boost-Modus arbeitet das Gerät dagegen bewusst in Gegenrichtung und versorgt die Starterbatterie aus der Aufbaubatterie.",
                   "Нет. Функция распознавания выключенного двигателя определяет остановку машины и блокирует обратный ток. В режиме подпитки устройство, наоборот, намеренно работает в обратном направлении и питает стартерный аккумулятор от бытового."),
    "sure_h": t("Yaşam akümü ne kadar sürede doldurur?", "How long does it take to charge my house battery?",
                "Wie lange dauert das Laden meiner Aufbaubatterie?", "Сколько времени заряжается бытовой аккумулятор?"),
    "sure30": t("Kabaca akü kapasitesi ÷ şarj akımı: 100 Ah'lik boş bir akü 30 A ile yaklaşık 3–4 saatlik sürüşte büyük ölçüde dolar. Son kısım akü tipine göre daha yavaş dolar.",
                "Roughly battery capacity ÷ charging current: an empty 100 Ah battery is largely charged after about 3–4 hours of driving at 30 A. The last part charges more slowly depending on the battery type.",
                "Grob Batteriekapazität ÷ Ladestrom: Eine leere 100-Ah-Batterie ist mit 30 A nach etwa 3–4 Stunden Fahrt weitgehend geladen. Der letzte Teil lädt je nach Batterietyp langsamer.",
                "Примерно ёмкость аккумулятора ÷ ток заряда: пустой аккумулятор 100 А·ч током 30 А в основном заряжается примерно за 3–4 часа езды. Последняя часть заряжается медленнее — в зависимости от типа АКБ."),
    "sure40": t("Kabaca akü kapasitesi ÷ şarj akımı: 100 Ah'lik boş bir akü 40 A ile yaklaşık 2,5–3 saatlik sürüşte büyük ölçüde dolar. Son kısım akü tipine göre daha yavaş dolar.",
                "Roughly battery capacity ÷ charging current: an empty 100 Ah battery is largely charged after about 2.5–3 hours of driving at 40 A. The last part charges more slowly depending on the battery type.",
                "Grob Batteriekapazität ÷ Ladestrom: Eine leere 100-Ah-Batterie ist mit 40 A nach etwa 2,5–3 Stunden Fahrt weitgehend geladen. Der letzte Teil lädt je nach Batterietyp langsamer.",
                "Примерно ёмкость аккумулятора ÷ ток заряда: пустой аккумулятор 100 А·ч током 40 А в основном заряжается примерно за 2,5–3 часа езды. Последняя часть заряжается медленнее — в зависимости от типа АКБ."),
    "tip": (t("Hangi akü tipleriyle çalışır?", "Which battery types does it work with?", "Mit welchen Batterietypen arbeitet es?", "С какими типами аккумуляторов работает?"),
            t("Tüm parametreler ekrandan programlandığı için şarj değerleri yaşam akünüze göre girilir. Akünüzün tipini ve şarj değerlerini bize yazın; sipariş öncesi uygunluğunu birlikte kontrol edelim.",
              "Since all parameters are programmed from the display, the charging values are set for your house battery. Send us your battery type and charging values and we'll check compatibility together before you order.",
              "Da alle Parameter über das Display programmiert werden, stellen Sie die Ladewerte passend zu Ihrer Aufbaubatterie ein. Schicken Sie uns Batterietyp und Ladewerte; wir prüfen die Eignung vor der Bestellung gemeinsam.",
              "Все параметры программируются с дисплея, поэтому значения заряда задаются под ваш бытовой аккумулятор. Пришлите тип и параметры заряда вашей АКБ — проверим совместимость вместе до заказа.")),
    "ekran": (t("Ekran nereye takılır?", "Where does the display go?", "Wo wird das Display angebracht?", "Где устанавливается дисплей?"),
              t("Dijital ekran cihaza 5 m uzatma kablosuyla bağlanır. Cihaz akülerin yanında dururken ekranı karavanın içinde, görebileceğiniz bir yere alırsınız; şarjı buradan izler ve programlarsınız.",
                "The digital display connects to the unit with a 5 m extension cable. While the unit sits next to the batteries, you place the display inside the caravan where you can see it, and monitor and program the charging from there.",
                "Das Digitaldisplay wird mit einem 5-m-Verlängerungskabel am Gerät angeschlossen. Während das Gerät bei den Batterien sitzt, bringen Sie das Display gut sichtbar im Wohnraum an und überwachen und programmieren das Laden von dort.",
                "Цифровой дисплей подключается к устройству 5-метровым удлинительным кабелем. Устройство остаётся рядом с аккумуляторами, а дисплей вы размещаете в салоне на виду — оттуда контролируете и настраиваете заряд.")),
    "amper": (t("30 A mı 40 A mı seçmeliyim?", "Should I choose 30 A or 40 A?", "Soll ich 30 A oder 40 A wählen?", "Что выбрать: 30 А или 40 А?"),
              t("Yaşam aküsü kapasiteniz büyükse ya da sürüşleriniz kısaysa 40 A modeli aküyü daha kısa sürede doldurur. Seçerken alternatörünüzün ek yükü karşılayabildiğini ve kablo kesitini de göz önüne alın.",
                "If your house battery is large or your drives are short, the 40 A model fills the battery faster. When choosing, also consider whether your alternator can handle the extra load and the cable size.",
                "Bei großer Aufbaubatterie oder kurzen Fahrten lädt das 40-A-Modell schneller. Berücksichtigen Sie bei der Wahl auch, ob die Lichtmaschine die Zusatzlast verkraftet, und den Kabelquerschnitt.",
                "Если бытовой аккумулятор большой или поездки короткие, модель на 40 А зарядит его быстрее. При выборе учитывайте также, выдержит ли генератор дополнительную нагрузку, и сечение кабеля.")),
    "takviye": (t("Takviye modu ne işe yarar?", "What is boost mode for?", "Wozu dient der Boost-Modus?", "Для чего нужен режим подпитки?"),
                t("Uzun süre park eden araçta marş aküsü zayıflayabilir. Takviye modunda cihaz ters yönde çalışır ve yaşam aküsünden marş aküsüne 10 A'e kadar şarj yapar; yaşam aküsü güneş paneliyle doluyorsa marş aküsü de desteklenmiş olur.",
                  "A vehicle parked for a long time can end up with a weak starter battery. In boost mode the unit works in reverse and charges the starter battery from the house battery at up to 10 A; if the house battery is charged by a solar panel, the starter battery is supported too.",
                  "Bei langen Standzeiten kann die Starterbatterie schwach werden. Im Boost-Modus arbeitet das Gerät in Gegenrichtung und lädt die Starterbatterie aus der Aufbaubatterie mit bis zu 10 A; wird die Aufbaubatterie per Solarmodul geladen, ist so auch die Starterbatterie gestützt.",
                  "Если машина долго стоит, стартерный аккумулятор может ослабнуть. В режиме подпитки устройство работает в обратном направлении и заряжает стартерный аккумулятор от бытового током до 10 А; если бытовой заряжается от солнечной панели, стартерный тоже получает поддержку.")),
    "yon": (t("Tek yönlü mü çift yönlü mü almalıyım?", "Should I get the one-way or the bidirectional model?",
              "Soll ich das unidirektionale oder das bidirektionale Modell nehmen?", "Какую модель брать: однонаправленную или двунаправленную?"),
            t("Yalnız yaşam aküsünü yolda doldurmak istiyorsanız tek yönlü DCDC-1224 yeterlidir. Aracınız uzun süre park ediyorsa ya da güneşle dolan yaşam aküsünün marş aküsünü de desteklemesini istiyorsanız çift yönlü DCDC-1224B'yi seçin.",
              "If you only want to charge the house battery on the road, the one-way DCDC-1224 is enough. If your vehicle is often parked for long periods, or you want a solar-charged house battery to support the starter battery too, choose the bidirectional DCDC-1224B.",
              "Wenn Sie nur die Aufbaubatterie unterwegs laden möchten, genügt der unidirektionale DCDC-1224. Steht Ihr Fahrzeug oft lange oder soll eine solargeladene Aufbaubatterie auch die Starterbatterie stützen, wählen Sie den bidirektionalen DCDC-1224B.",
              "Если нужно только заряжать бытовой аккумулятор в пути, достаточно однонаправленного DCDC-1224. Если машина часто долго стоит или вы хотите, чтобы заряжаемый от солнца бытовой аккумулятор подпитывал и стартерный, выбирайте двунаправленный DCDC-1224B.")),
}

# BOOST DC-DC (DCDC-2448)
C = {
    "kicker": t("⬆️ BOOST DC-DC Şarj", "⬆️ BOOST DC-DC Charger", "⬆️ BOOST-DC-DC-Ladegerät", "⬆️ Повышающее зарядное DC-DC"),
    "use_p": t("Aracın 12/24 V sisteminden 36–72 V akü grubunu doldurmanız gereken her yerde.",
               "Anywhere you need to charge a 36–72 V battery bank from a vehicle's 12/24 V system.",
               "Überall, wo eine 36–72-V-Batteriebank aus dem 12/24-V-Bordnetz geladen werden muss.",
               "Везде, где батарейный блок 36–72 В нужно заряжать от бортовой сети 12/24 В."),
    "how_p": t("Cihaz 12/24 V marş aküsü ile 36–72 V akü grubunun arasına bağlanır.",
               "The unit is connected between the 12/24 V starter battery and the 36–72 V battery bank.",
               "Das Gerät wird zwischen 12/24-V-Starterbatterie und 36–72-V-Batteriebank angeschlossen.",
               "Устройство подключается между стартерным аккумулятором 12/24 В и батарейным блоком 36–72 В."),
    "node_grup": t("Akü grubu", "Battery bank", "Batteriebank", "Батарейный блок"),
    "flow_ekran": t("📟 Dijital ekran 5 m uzatma kablosuyla cihaza bağlanır; şarj görebileceğiniz bir yerden izlenir.",
                    "📟 The digital display connects with a 5 m extension cable, so you can follow the charging from where you can see it.",
                    "📟 Das Digitaldisplay wird mit einem 5-m-Verlängerungskabel angeschlossen; so verfolgen Sie das Laden von einem gut sichtbaren Platz.",
                    "📟 Цифровой дисплей подключается 5-метровым удлинительным кабелем — заряд видно с удобного места."),
    "st_in": (B["st_in"][0],
              t("Cihazın girişini 12/24 V marş aküsüne bağlayın. Giriş akımı 20 A'e çıkabildiği için kabloyu ve sigortayı buna göre seçin.",
                "Connect the unit's input to the 12/24 V starter battery. The input current can reach 20 A, so choose the cable and fuse accordingly.",
                "Schließen Sie den Eingang an die 12/24-V-Starterbatterie an. Der Eingangsstrom kann 20 A erreichen; Kabel und Sicherung entsprechend wählen.",
                "Подключите вход устройства к стартерному аккумулятору 12/24 В. Входной ток может достигать 20 А — подберите кабель и предохранитель соответственно.")),
    "st_out": (B["st_out"][0],
               t("Çıkışı 36–72 V akü grubuna bağlayın ve akünün yakınına uygun bir sigorta koyun.",
                 "Connect the output to the 36–72 V battery bank with a suitable fuse close to the battery.",
                 "Schließen Sie den Ausgang an die 36–72-V-Batteriebank an, mit passender Sicherung nahe der Batterie.",
                 "Подключите выход к батарейному блоку 36–72 В с подходящим предохранителем рядом с АКБ.")),
    "st_ekran": (B["st_ekran"][0],
                 t("Dijital ekranı 5 m kabloyla görebileceğiniz yere alın; şarjı buradan izleyin.",
                   "Put the digital display where you can see it using the 5 m cable and follow the charging from there.",
                   "Bringen Sie das Digitaldisplay mit dem 5-m-Kabel gut sichtbar an und verfolgen Sie das Laden von dort.",
                   "Разместите цифровой дисплей на 5-метровом кабеле на виду и следите за зарядом оттуда.")),
    "tip_giris": t("Giriş tarafında akım çıkıştan çok daha yüksektir: 12 V girişte 20 A çekildiğinde 48 V aküye yaklaşık 4–5 A gider. Giriş kablosunu kalın seçin.",
                   "The current on the input side is much higher than on the output: drawing 20 A at a 12 V input sends about 4–5 A to a 48 V battery. Choose a thick input cable.",
                   "Auf der Eingangsseite fließt deutlich mehr Strom als am Ausgang: Werden bei 12 V Eingang 20 A gezogen, gehen etwa 4–5 A in eine 48-V-Batterie. Wählen Sie ein dickes Eingangskabel.",
                   "На входе ток гораздо больше, чем на выходе: при 20 А на входе 12 В в аккумулятор 48 В идёт около 4–5 А. Входной кабель выбирайте толстым."),
    "cta": t("Yüksek gerilimli akünüzü yolda doldurun", "Charge your high-voltage battery on the road",
             "Laden Sie Ihre Hochvolt-Batterie unterwegs", "Заряжайте высоковольтный аккумулятор в пути"),
    "note_h": t("Yaşam aküsü 12 ya da 24 V mu?", "Is your house battery 12 or 24 V?", "Hat Ihre Aufbaubatterie 12 oder 24 V?", "Бытовой аккумулятор на 12 или 24 В?"),
    "note_p": t("12/24 V yaşam aküsünü alternatörden şarj etmek için DCDC-1224 akü şarj cihazlarımıza bakın.",
                "To charge a 12/24 V house battery from the alternator, see our DCDC-1224 battery chargers.",
                "Um eine 12/24-V-Aufbaubatterie über die Lichtmaschine zu laden, sehen Sie sich unsere DCDC-1224-Ladegeräte an.",
                "Чтобы заряжать бытовой аккумулятор 12/24 В от генератора, посмотрите наши зарядные устройства DCDC-1224."),
}
C_USE = [
    ("🚐", t("48 V karavan sistemleri", "48 V caravan systems", "48-V-Wohnmobilsysteme", "Системы автодомов на 48 В"),
     t("Aracın 12/24 V alternatöründen 48 V yaşam aküsü grubunu yolda doldurur; yüksek güçlü inverter yükleri için enerji hazır olur.",
       "Fills the 48 V house battery bank from the vehicle's 12/24 V alternator on the road, so energy is ready for high-power inverter loads.",
       "Lädt die 48-V-Aufbaubatteriebank unterwegs über die 12/24-V-Lichtmaschine; so steht Energie für leistungsstarke Wechselrichterlasten bereit.",
       "В пути заряжает бытовой батарейный блок 48 В от генератора 12/24 В — энергия готова для мощных нагрузок инвертора.")),
    ("⛵", t("Tekneler", "Boats", "Boote", "Лодки"),
     t("Motor çalışırken 36–72 V akü grubunu, örneğin elektrikli tekne motorunun ya da ev sisteminin aküsünü şarj eder.",
       "Charges a 36–72 V battery bank, such as an electric boat motor's or the house system's battery, while the engine runs.",
       "Lädt bei laufendem Motor eine 36–72-V-Batteriebank, etwa die eines Elektro-Bootsmotors oder des Bordsystems.",
       "При работающем двигателе заряжает батарейный блок 36–72 В — например, аккумулятор электромотора лодки или бытовой системы.")),
    ("🔋", t("Yüksek gerilimli akü grupları", "High-voltage battery banks", "Hochvolt-Batteriebänke", "Высоковольтные батарейные блоки"),
     t("Seri bağlı 36, 48, 60 ve 72 V akü gruplarını 12/24 V kaynaktan tek cihazla şarj eder.",
       "Charges series-connected 36, 48, 60 and 72 V battery banks from a 12/24 V source with a single unit.",
       "Lädt in Reihe geschaltete 36-, 48-, 60- und 72-V-Batteriebänke mit einem Gerät aus einer 12/24-V-Quelle.",
       "Заряжает последовательно соединённые блоки 36, 48, 60 и 72 В от источника 12/24 В одним устройством.")),
]
C_Q = [
    (t("15 A şarj akımı her durumda alınır mı?", "Do I always get 15 A of charging current?", "Bekomme ich immer 15 A Ladestrom?", "Всегда ли ток заряда равен 15 А?"),
     t("Hayır. Cihaz girişten en fazla 20 A çeker; aküye giden akım giriş gerilimine ve akü gerilimine bağlıdır. Örnek: 24 V girişte 24 V × 20 A = 480 W çekilir; %95 verimle 48 V aküye yaklaşık 8–9 A gider. 12 V girişte aynı akü için yaklaşık 4–5 A'dir. En yüksek akım 24 V girişte ve 36 V akü grubunda elde edilir.",
       "No. The unit draws at most 20 A from the input; the current going into the battery depends on the input voltage and the battery voltage. Example: at a 24 V input it draws 24 V × 20 A = 480 W; at 95% efficiency about 8–9 A goes into a 48 V battery. At a 12 V input it is about 4–5 A for the same battery. The highest current is reached with a 24 V input and a 36 V battery bank.",
       "Nein. Das Gerät zieht am Eingang höchstens 20 A; der Strom in die Batterie hängt von Eingangs- und Batteriespannung ab. Beispiel: Bei 24 V Eingang werden 24 V × 20 A = 480 W aufgenommen; bei 95 % Wirkungsgrad fließen etwa 8–9 A in eine 48-V-Batterie. Bei 12 V Eingang sind es für dieselbe Batterie etwa 4–5 A. Den höchsten Strom erreichen Sie mit 24 V Eingang und einer 36-V-Batteriebank.",
       "Нет. Устройство потребляет со входа не более 20 А; ток в аккумулятор зависит от входного напряжения и напряжения АКБ. Пример: при входе 24 В потребляется 24 В × 20 А = 480 Вт; при КПД 95 % в аккумулятор 48 В идёт около 8–9 А. При входе 12 В для того же аккумулятора — около 4–5 А. Наибольший ток получается при входе 24 В и батарейном блоке 36 В.")),
    (t("Hangi akülerle kullanılır?", "Which batteries is it used with?", "Mit welchen Batterien wird es verwendet?", "С какими аккумуляторами используется?"),
     t("36, 48, 60 ve 72 V akü gruplarıyla. Akü grubunuzun gerilimini, tipini ve şarj değerlerini siparişte bize yazın; uygunluğunu birlikte kontrol edelim.",
       "With 36, 48, 60 and 72 V battery banks. Send us your battery bank's voltage, type and charging values with your order and we'll check compatibility together.",
       "Mit 36-, 48-, 60- und 72-V-Batteriebänken. Schicken Sie uns Spannung, Typ und Ladewerte Ihrer Batteriebank mit der Bestellung; wir prüfen die Eignung gemeinsam.",
       "С батарейными блоками 36, 48, 60 и 72 В. Укажите при заказе напряжение, тип и параметры заряда вашего блока — проверим совместимость вместе.")),
    (B_Q["arac"][0],
     t("12 ya da 24 V elektrik sistemi olan karavan, motokaravan ve teknelerde; cihazın girişi 12–32 V'u kabul eder.",
       "Caravans, motorhomes and boats with a 12 or 24 V electrical system; the unit's input accepts 12–32 V.",
       "Wohnwagen, Wohnmobile und Boote mit 12- oder 24-V-Bordnetz; der Eingang akzeptiert 12–32 V.",
       "Караваны, автодома и лодки с бортовой сетью 12 или 24 В; вход устройства принимает 12–32 В.")),
    (t("Güneş panelini doğrudan bağlayabilir miyim?", "Can I connect a solar panel directly?", "Kann ich ein Solarmodul direkt anschließen?", "Можно ли подключить солнечную панель напрямую?"),
     [t("Bu cihaz akü ve alternatör girişi için tasarlanmıştır. Panelden 24–72 V akü grubunu şarj etmek için MPPT'li bir cihaz gerekir: BOOST MPPT şarj kontrol cihazımıza bakın.",
        "This unit is designed for a battery and alternator input. To charge a 24–72 V battery bank from panels you need an MPPT device: see our BOOST MPPT charge controller.",
        "Dieses Gerät ist für einen Batterie- und Lichtmaschineneingang ausgelegt. Um eine 24–72-V-Batteriebank aus Modulen zu laden, brauchen Sie ein MPPT-Gerät: Sehen Sie sich unseren BOOST-MPPT-Laderegler an.",
        "Это устройство рассчитано на вход от аккумулятора и генератора. Чтобы заряжать блок 24–72 В от панелей, нужен MPPT-контроллер: посмотрите наш контроллер заряда BOOST MPPT."),
      '<p><a href="elektrikli-arac-donusum.html">%s</a></p>' % esc(t("BOOST MPPT şarj kontrol cihazı →", "BOOST MPPT charge controller →", "BOOST-MPPT-Laderegler →", "Контроллер заряда BOOST MPPT →"))]),
    (t("Bluetooth var mı?", "Does it have Bluetooth?", "Hat es Bluetooth?", "Есть ли Bluetooth?"),
     t("Dahili Bluetooth isteğe bağlıdır ve siparişte belirtilir. Bu seçenek için siparişten önce bize yazın.",
       "Built-in Bluetooth is optional and specified when ordering. Write to us before ordering if you want this option.",
       "Integriertes Bluetooth ist optional und wird bei der Bestellung angegeben. Schreiben Sie uns vor der Bestellung, wenn Sie diese Option wünschen.",
       "Встроенный Bluetooth — опция, её указывают при заказе. Если она нужна, напишите нам до оформления заказа.")),
    Q_KUR_OTO,
]

# Çapraz satış gerekçeleri
X = {
    "p285_2": t("Kompakt TOPCon panel; bu cihaza en fazla 2 tanesi seri bağlanır.", "Compact TOPCon panel; up to 2 can be wired in series on this controller.",
                "Kompaktes TOPCon-Modul; an diesem Regler bis zu 2 in Reihe.", "Компактная панель TOPCon; к этому контроллеру — до 2 последовательно."),
    "p655_1": t("Yüksek güçlü TOPCon panel; bu cihaza tek ya da paralel bağlanır.", "High-power TOPCon panel; connects to this controller singly or in parallel.",
                "Leistungsstarkes TOPCon-Modul; an diesem Regler einzeln oder parallel.", "Мощная панель TOPCon; к этому контроллеру — одна или параллельно."),
    "p655_2": t("Yüksek güçlü TOPCon panel; bu cihaza en fazla 2 tanesi seri bağlanır.", "High-power TOPCon panel; up to 2 can be wired in series on this controller.",
                "Leistungsstarkes TOPCon-Modul; an diesem Regler bis zu 2 in Reihe.", "Мощная панель TOPCon; к этому контроллеру — до 2 последовательно."),
    "titanx": t("48 V sistem için 5,22 kWh LiFePO₄ akü.", "5.22 kWh LiFePO₄ battery for a 48 V system.",
                "5,22-kWh-LiFePO₄-Akku für ein 48-V-System.", "Аккумулятор LiFePO₄ 5,22 кВт·ч для системы 48 В."),
    "kablo": t("Panel ile cihaz arası: 5 m siyah + 5 m kırmızı.", "Panel to controller: 5 m black + 5 m red.",
               "Modul zum Regler: 5 m schwarz + 5 m rot.", "От панели к контроллеру: 5 м чёрного + 5 м красного."),
    "mc4": t("Panel kablosunu solar kabloya bağlar.", "Joins the panel lead to the solar cable.",
             "Verbindet das Modulkabel mit dem Solarkabel.", "Соединяет кабель панели с солнечным кабелем."),
    "mppt30": t("Karavan tavanına panel eklerseniz yaşam aküsü park hâlinde de güneşle dolar.",
                "Add a panel to the caravan roof and the house battery keeps charging from the sun while parked.",
                "Mit einem Modul auf dem Dach lädt die Aufbaubatterie auch im Stand mit Sonnenenergie.",
                "Добавьте панель на крышу автодома — бытовой аккумулятор будет заряжаться от солнца и на стоянке."),
    "p285_rv": t("780 × 1536 mm, 8,5 kg: tavana taşınması kolay kompakt TOPCon panel.",
                 "780 × 1536 mm, 8.5 kg: a compact TOPCon panel that is easy to lift onto the roof.",
                 "780 × 1536 mm, 8,5 kg: kompaktes TOPCon-Modul, leicht aufs Dach zu bringen.",
                 "780 × 1536 мм, 8,5 кг: компактная панель TOPCon, которую легко поднять на крышу."),
    "mppt150": t("48 V akü grubunu güneşten de şarj etmek için 150 V girişli MPPT.",
                 "A 150 V input MPPT to charge the 48 V battery bank from the sun as well.",
                 "MPPT mit 150-V-Eingang, um die 48-V-Batteriebank auch mit Sonnenenergie zu laden.",
                 "MPPT со входом 150 В, чтобы заряжать блок 48 В и от солнца."),
    "boost": t("Düşük gerilimli panelden 24–72 V akü grubuna doğrudan şarj.",
               "Direct charging of a 24–72 V battery bank from low-voltage panels.",
               "Direktes Laden einer 24–72-V-Batteriebank aus Niedervolt-Modulen.",
               "Прямой заряд блока 24–72 В от низковольтных панелей."),
}

# ------------------------------------------------------------ ürünler
def spec(*rows):
    return list(rows)


MPPT_ROWS = [
    ("havensis-s30amps", "havensis-mppt-30a.html",
     [k("Solar-30AMPS (100|30)"), u("12/24 V"), u("30 A"), u("100 V"), u("1200 W"), u("%98"), u("159 × 210 × 70 mm")]),
    ("havensis-s60amps100", "havensis-mppt-60a.html",
     [k("Solar-60AMPS-100 (100|60)"), u("12/24 V"), u("60 A"), u("100 V"), u("2500 W"), u("%98"), u("197,2 × 224 × 80 mm")]),
    ("havensis-s60amps150", "havensis-mppt-60a-150v.html",
     [k("Solar-60AMPS 150|60"), u("12/24/36/48 V"), u("60 A"), u("150 V"), u("5000 W"), u("%97,5"), u("280 × 235 × 100 mm")]),
]
DCDC_ROWS = [
    ("havensis-dcdc-1224-30", "havensis-dcdc-30a.html",
     [k("DCDC-1224-30"), V["tek"], u("30 A"), k("—"), u("10–35 V"), u("12–32 V"), u("%96,4"), u("158 × 210 × 60 mm")]),
    ("havensis-dcdc-1224-40", "havensis-dcdc-40a.html",
     [k("DCDC-1224-40"), V["tek"], u("40 A"), k("—"), u("10–35 V"), u("12–32 V"), u("%96,4"), u("162 × 210 × 70 mm")]),
    ("havensis-dcdc-1224b-40", "havensis-dcdc-40a-cift-yonlu.html",
     [k("DCDC-1224B-40"), V["cift"], u("40 A"), u("10 A"), u("10–35 V"), u("12–32 V"), u("%96,4"), u("162 × 210 × 70 mm")]),
]


def mppt_fit(big):
    hi = "150" if big else "100"
    rows = [
        ["Lexron 285 W Güneş Paneli", u("42,84 V"),
         t("3 panel (128,52 V)", "3 panels (128.52 V)", "3 Module (128,52 V)", "3 панели (128,52 В)") if big else
         t("2 panel (85,68 V)", "2 panels (85.68 V)", "2 Module (85,68 V)", "2 панели (85,68 В)")],
        ["Lexron 655 W TOPCon Güneş Paneli", u("50,34 V"),
         t("2 panel (100,68 V)", "2 panels (100.68 V)", "2 Module (100,68 V)", "2 панели (100,68 В)") if big else
         t("Seri bağlanmaz: tek ya da paralel", "No series: single or parallel", "Keine Reihenschaltung: einzeln oder parallel",
           "Без последовательного соединения: одна или параллельно")],
    ]
    return hi, rows


def fit_note(w):
    return t("Voc soğukta yükselir; kışın −10 °C'nin altına düşen bölgelerde dizilimi bizimle kontrol edin. Toplam panel gücü %s W'ı aşmamalıdır." % w,
             "Voc rises in the cold; in areas that drop below −10 °C in winter, check the layout with us. Total panel power must not exceed %s W." % w,
             "Voc steigt bei Kälte; in Gegenden, in denen es im Winter unter −10 °C geht, prüfen Sie den Aufbau mit uns. Die gesamte Modulleistung darf %s W nicht überschreiten." % w,
             "В холод Voc растёт; в районах, где зимой ниже −10 °C, согласуйте схему с нами. Общая мощность панелей не должна превышать %s Вт." % w)


def q_watt(w, amp, big):
    q = t("%s W panel bağlarsam cihaz %s W şarj eder mi?" % (w, w),
          "If I connect %s W of panels, will it charge at %s W?" % (w, w),
          "Lädt der Regler mit %s W, wenn ich %s W Module anschließe?" % (w, w),
          "Если подключить %s Вт панелей, будет ли заряд %s Вт?" % (w, w))
    if big:
        a = t("Hayır, şarj gücünü akü gerilimi ve 60 A şarj akımı belirler: 12 V sistemde yaklaşık 840 W, 24 V'ta 1680 W, 36 V'ta 2520 W, 48 V'ta yaklaşık 3360 W. 5000 W'a kadar panel bağlanabilir; panel gücü bunu aştığında cihaz akımı 60 A'de sınırlar, fazla panel ise sabah, akşam ve bulutlu havada şarjı artırır.",
              "No, the charging power is set by the battery voltage and the 60 A charging current: about 840 W in a 12 V system, 1680 W at 24 V, 2520 W at 36 V and about 3360 W at 48 V. You can connect up to 5000 W of panels; when the panel power exceeds this, the controller limits the current to 60 A, and the extra panels raise charging in the morning, in the evening and on cloudy days.",
              "Nein, die Ladeleistung ergibt sich aus Batteriespannung und 60 A Ladestrom: etwa 840 W im 12-V-System, 1680 W bei 24 V, 2520 W bei 36 V und etwa 3360 W bei 48 V. Sie können bis zu 5000 W Module anschließen; liegt die Modulleistung darüber, begrenzt der Regler den Strom auf 60 A, und die zusätzlichen Module steigern die Ladung morgens, abends und bei Bewölkung.",
              "Нет, мощность заряда определяют напряжение аккумулятора и ток заряда 60 А: около 840 Вт в системе 12 В, 1680 Вт при 24 В, 2520 Вт при 36 В и около 3360 Вт при 48 В. Можно подключить до 5000 Вт панелей; когда мощность панелей выше, контроллер ограничивает ток на 60 А, а лишние панели увеличивают заряд утром, вечером и в облачную погоду.")
    else:
        p12, p24 = amp * 14, amp * 28
        a = t("Hayır, şarj gücünü akü gerilimi ve %d A şarj akımı belirler. 12 V akü sisteminde yaklaşık %d A × 14 V ≈ %d W, 24 V sistemde yaklaşık %d W şarj gücü elde edilir. %s W'a kadar panel bağlanabilir; panel gücü bunu aştığında cihaz akımı %d A'de sınırlar, fazla panel ise sabah, akşam ve bulutlu havada şarjı artırır." % (amp, amp, p12, p24, w, amp),
              "No, the charging power is set by the battery voltage and the %d A charging current. A 12 V battery system gets about %d A × 14 V ≈ %d W, a 24 V system about %d W. You can connect up to %s W of panels; when the panel power exceeds this, the controller limits the current to %d A, and the extra panels raise charging in the morning, in the evening and on cloudy days." % (amp, amp, p12, p24, w, amp),
              "Nein, die Ladeleistung ergibt sich aus Batteriespannung und %d A Ladestrom. Ein 12-V-System erreicht etwa %d A × 14 V ≈ %d W, ein 24-V-System etwa %d W. Sie können bis zu %s W Module anschließen; liegt die Modulleistung darüber, begrenzt der Regler den Strom auf %d A, und die zusätzlichen Module steigern die Ladung morgens, abends und bei Bewölkung." % (amp, amp, p12, p24, w, amp),
              "Нет, мощность заряда определяют напряжение аккумулятора и ток заряда %d А. В системе 12 В получается около %d А × 14 В ≈ %d Вт, в системе 24 В — около %d Вт. Можно подключить до %s Вт панелей; когда мощность панелей выше, контроллер ограничивает ток на %d А, а лишние панели увеличивают заряд утром, вечером и в облачную погоду." % (amp, amp, p12, p24, w, amp))
    return (q, a)


Q_AKU_SMALL = (Q_AKU_H, t("12 V ve 24 V akülerle. Tüm parametreler ayarlanabildiği için şarj değerleri akünüzün üreticisinin verdiği değerlere göre girilir. Lityum akü kullanıyorsanız akünüzün şarj değerlerini bize yazın; sipariş öncesi birlikte kontrol edelim.",
                          "With 12 V and 24 V batteries. Since all parameters are adjustable, you enter the charging values given by your battery's manufacturer. If you use a lithium battery, send us its charging values and we'll check them together before you order.",
                          "Mit 12-V- und 24-V-Batterien. Da alle Parameter einstellbar sind, geben Sie die Ladewerte des Batterieherstellers ein. Bei einer Lithiumbatterie schicken Sie uns deren Ladewerte; wir prüfen sie vor der Bestellung gemeinsam.",
                          "С аккумуляторами 12 В и 24 В. Поскольку все параметры настраиваются, вводятся значения заряда от производителя вашего аккумулятора. Если у вас литиевая АКБ, пришлите нам её параметры заряда — проверим вместе до заказа."))
Q_AKU_BIG = (Q_AKU_H, t("12, 24, 36 ve 48 V akülerle. Tüm parametreler ayarlanabildiği için şarj değerleri akünüzün üreticisinin verdiği değerlere göre girilir. 48 V sistem için mağazamızda TitanX 51,2 V 102 Ah LiFePO₄ akü de var; şarj değerlerini akünün künyesine göre ayarlayın.",
                        "With 12, 24, 36 and 48 V batteries. Since all parameters are adjustable, you enter the charging values given by your battery's manufacturer. For a 48 V system we also sell the TitanX 51.2 V 102 Ah LiFePO₄ battery; set the charging values according to its datasheet.",
                        "Mit 12-, 24-, 36- und 48-V-Batterien. Da alle Parameter einstellbar sind, geben Sie die Ladewerte des Batterieherstellers ein. Für ein 48-V-System führen wir auch den TitanX 51,2 V 102 Ah LiFePO₄-Akku; stellen Sie die Ladewerte nach dessen Datenblatt ein.",
                        "С аккумуляторами 12, 24, 36 и 48 В. Поскольку все параметры настраиваются, вводятся значения заряда от производителя вашего аккумулятора. Для системы 48 В у нас есть аккумулятор TitanX 51,2 В 102 А·ч LiFePO₄; настройте заряд по его паспорту."))
Q_SERI_SMALL = (Q_SERI_H, t("Seri bağlı panellerin açık devre gerilimi (Voc) toplamı 100 V'u aşmamalıdır. Mağazamızdaki Lexron 285 W panelden (Voc 42,84 V) en fazla 2 tanesi seri bağlanır; Lexron 655 W panel (Voc 50,34 V) bu cihaza seri bağlanmaz, tek ya da paralel bağlanır. Voc soğukta yükseldiği için kışın −10 °C'nin altına düşen bölgelerde dizilimi bizimle kontrol edin.",
                            "The sum of the open-circuit voltages (Voc) of panels in series must not exceed 100 V. Of our Lexron 285 W panels (Voc 42.84 V) up to 2 can go in series; the Lexron 655 W panel (Voc 50.34 V) is not wired in series on this controller but connected singly or in parallel. Because Voc rises in the cold, check the layout with us if your area drops below −10 °C in winter.",
                            "Die Summe der Leerlaufspannungen (Voc) der Module in Reihe darf 100 V nicht überschreiten. Von unseren Lexron-285-W-Modulen (Voc 42,84 V) passen bis zu 2 in Reihe; das Lexron-655-W-Modul (Voc 50,34 V) wird an diesem Regler nicht in Reihe, sondern einzeln oder parallel angeschlossen. Da Voc bei Kälte steigt, prüfen Sie den Aufbau mit uns, wenn es bei Ihnen im Winter unter −10 °C geht.",
                            "Сумма напряжений холостого хода (Voc) панелей в цепочке не должна превышать 100 В. Из наших панелей Lexron 285 Вт (Voc 42,84 В) последовательно можно соединить не более 2; панель Lexron 655 Вт (Voc 50,34 В) к этому контроллеру последовательно не подключается — только одна или параллельно. Поскольку в холод Voc растёт, в районах, где зимой ниже −10 °C, согласуйте схему с нами."))
Q_SERI_BIG = (Q_SERI_H, t("Seri bağlı panellerin açık devre gerilimi (Voc) toplamı 150 V'u aşmamalıdır. Mağazamızdaki Lexron 285 W panelden (Voc 42,84 V) en fazla 3, Lexron 655 W panelden (Voc 50,34 V) en fazla 2 tanesi seri bağlanır. Voc soğukta yükseldiği için kışın −10 °C'nin altına düşen bölgelerde dizilimi bizimle kontrol edin.",
                          "The sum of the open-circuit voltages (Voc) of panels in series must not exceed 150 V. Of our Lexron 285 W panels (Voc 42.84 V) up to 3 can go in series, of the Lexron 655 W panels (Voc 50.34 V) up to 2. Because Voc rises in the cold, check the layout with us if your area drops below −10 °C in winter.",
                          "Die Summe der Leerlaufspannungen (Voc) der Module in Reihe darf 150 V nicht überschreiten. Von unseren Lexron-285-W-Modulen (Voc 42,84 V) passen bis zu 3 in Reihe, von den Lexron-655-W-Modulen (Voc 50,34 V) bis zu 2. Da Voc bei Kälte steigt, prüfen Sie den Aufbau mit uns, wenn es bei Ihnen im Winter unter −10 °C geht.",
                          "Сумма напряжений холостого хода (Voc) панелей в цепочке не должна превышать 150 В. Из наших панелей Lexron 285 Вт (Voc 42,84 В) последовательно можно соединить до 3, из Lexron 655 Вт (Voc 50,34 В) — до 2. Поскольку в холод Voc растёт, в районах, где зимой ниже −10 °C, согласуйте схему с нами."))


def mppt_product(pid, file, model, amp, watt, dims, eff, big, title, desc, alt, lead, intro, lead_extra_chip):
    specs = [
        (S["marka"], V["havensis"]), (S["model"], k(model)),
        (S["aku"], u("12/24/36/48 V" if big else "12/24 V")), (S["sarj"], u("%d A" % amp)),
    ]
    if not big:
        specs.append((S["yuk"], u("20 A")))
    specs += [
        (S["pvv"], u("150 V" if big else "100 V")), (S["pvw"], u("%s W" % watt)),
        (S["yontem"], V["mppt"]), (S["verim"], u(eff)), (S["mpp"], u("%99,6")),
        (S["gosterge"], V["lcd"]), (S["ayar"], V["tum"]),
    ]
    if not big:
        specs.append((S["yukk"], V["gece"]))
    specs += [(S["besleme"], V["panelbes"]), (S["boyut"], u(dims)), (S["uretim"], V["yerli"])]
    verim_p = (t("Üreticinin verilerine göre cihaz %98 dönüştürücü verimi ve %99,6 MPP izleme verimiyle çalışır: panelden gelen enerjinin yalnızca küçük bir kısmı ısıya dönüşür.",
                 "According to the manufacturer, the controller runs at 98% conversion efficiency and 99.6% MPP tracking efficiency: only a small share of the energy coming from the panel is lost as heat.",
                 "Laut Hersteller arbeitet der Regler mit 98 % Wandlungswirkungsgrad und 99,6 % MPP-Tracking-Wirkungsgrad: Nur ein kleiner Teil der Modulenergie geht als Wärme verloren.",
                 "По данным производителя, КПД преобразования составляет 98 %, а эффективность отслеживания MPP — 99,6 %: лишь малая часть энергии панели уходит в тепло.") if not big else
               t("Üreticinin verilerine göre cihaz %97,5 dönüştürücü verimi ve %99,6 MPP izleme verimiyle çalışır: panelden gelen enerjinin yalnızca küçük bir kısmı ısıya dönüşür.",
                 "According to the manufacturer, the controller runs at 97.5% conversion efficiency and 99.6% MPP tracking efficiency: only a small share of the energy coming from the panel is lost as heat.",
                 "Laut Hersteller arbeitet der Regler mit 97,5 % Wandlungswirkungsgrad und 99,6 % MPP-Tracking-Wirkungsgrad: Nur ein kleiner Teil der Modulenergie geht als Wärme verloren.",
                 "По данным производителя, КПД преобразования составляет 97,5 %, а эффективность отслеживания MPP — 99,6 %: лишь малая часть энергии панели уходит в тепло."))
    big_p = t("Geniş akü aralığı ve 150 V panel girişi onu büyük off-grid sistemler için uygun kılar: 48 V akü grubu ve inverterle kurulan bağ evleri, çiftlikler ve iş yerleri. İnverter doğrudan akü grubuna bağlanır.",
              "Its wide battery range and 150 V panel input make it suitable for large off-grid systems: country houses, farms and businesses built around a 48 V battery bank and an inverter. The inverter is connected directly to the battery bank.",
              "Der breite Batteriebereich und der 150-V-Moduleingang machen ihn geeignet für große Inselanlagen: Ferienhäuser, Höfe und Betriebe mit 48-V-Batteriebank und Wechselrichter. Der Wechselrichter wird direkt an die Batteriebank angeschlossen.",
              "Широкий диапазон АКБ и вход панелей 150 В делают его подходящим для больших автономных систем: дачи, фермы и предприятия с батарейным блоком 48 В и инвертором. Инвертор подключается напрямую к батарейному блоку.")
    hi, fit_rows = mppt_fit(big)
    chips = [u("⚡ %s · %d A" % ("12/24/36/48 V" if big else "12/24 V", amp)),
             t("☀️ %s V · %s W panel" % (hi, watt), "☀️ %s V · %s W of panels" % (hi, watt),
               "☀️ %s V · %s W Module" % (hi, watt), "☀️ %s В · %s Вт панелей" % (hi, watt)),
             lead_extra_chip,
             t("📟 LCD ekran", "📟 LCD display", "📟 LCD-Display", "📟 ЖК-дисплей"),
             CHIP_YERLI]
    faq = [q_watt(watt, amp, big), Q_AKU_BIG if big else Q_AKU_SMALL, Q_SERI_BIG if big else Q_SERI_SMALL]
    if not big:
        faq += [Q_GECE, Q_INV_YUK]
    else:
        faq += [Q_INV_150]
    faq += [Q_AKUSUZ, Q_TEL, Q_KUR_A]
    xs = ([("panel-lexron-655w", X["p655_2"]), ("aku-titanx-51v-102ah", X["titanx"]), ("kablo-solar-5m", X["kablo"]), ("mc4-set", X["mc4"])] if big else
          [("panel-lexron-285w", X["p285_2"]), ("panel-lexron-655w", X["p655_1"]), ("kablo-solar-5m", X["kablo"]), ("mc4-set", X["mc4"])])
    return {
        "id": pid, "file": file, "fam": "mppt", "title": title, "desc": desc, "alt": alt,
        "kicker": A["kicker"], "lead": lead,
        "info": [("☀️", A["no_inc"]), ("🏭", YERLI)],
        "chips": chips,
        "about": [intro, A["mppt_p"], verim_p, A["ayar_p"], (big_p if big else A["yuk_p"]), KAPANIS],
        "specs": specs, "gloss": (A["gloss"], "sozluk.html#mppt"),
        "use": (A_USE_BIG if big else A_USE_SMALL),
        "use_p": (t("12'den 48 V'a kadar akü desteği ve 150 V panel girişiyle büyük off-grid sistemlerin şarj merkezidir.",
                    "With battery support from 12 to 48 V and a 150 V panel input, it is the charging hub of large off-grid systems.",
                    "Mit Batterieunterstützung von 12 bis 48 V und 150-V-Moduleingang ist er die Ladezentrale großer Inselanlagen.",
                    "Поддержка АКБ от 12 до 48 В и вход панелей 150 В делают его центром зарядки больших автономных систем.") if big else A["use_p"]),
        "how_p": A["how_p"],
        "flow": [("☀️", A["node_panel"], t("%s V'a kadar" % hi, "up to %s V" % hi, "bis %s V" % hi, "до %s В" % hi)),
                 ("📟", A["node_mppt"], k(model.split(" (")[0])),
                 ("🔋", A["node_aku"], u("12–48 V" if big else "12/24 V")),
                 ("🔌", A["node_inv"], A["node_inv_s"])],
        "flow_here": 1,
        "flow_notes": ([] if big else [A["flow_yuk"]]),
        "steps": [A["st1"], A["st2"], (A["st3h"], A["st3_150"] if big else A["st3_100"]), (A["st4_inv"] if big else A["st4_yuk"])],
        "tips": A["tips"],
        "fit": {"k": A["fit_k"], "h": A["fit_h"], "p": A["fit_p"], "heads": A["fit_heads"], "rows": fit_rows, "note": fit_note(watt)},
        "cmp": {"p": A["cmp_p"], "heads": A["cmp_heads"], "rows": MPPT_ROWS, "tips": A["cmp_tips"]},
        "xsell": xs, "faq": faq,
        "note": (A["note_h"], A["note_p"], "havensis-dcdc-30a.html", LINK_DCDC),
        "cta": A["cta"],
    }


def dcdc_product(pid, file, model, amp, dims, bidir, title, desc, alt, lead, intro):
    specs = [(S["marka"], V["havensis"]), (S["model"], k(model)), (S["tip"], V["ciftm"] if bidir else V["tek"]),
             (S["aku"], u("12/24 V")), (S["komb"], u("12-12, 12-24, 24-12, 24-24 V")), (S["sarj"], u("%d A" % amp))]
    if bidir:
        specs.append((S["takviye"], u("10 A")))
    specs += [(S["giris"], u("10–35 V")), (S["cikis"], u("12–32 V")), (S["verim"], u("%96,4")),
              (S["kaynak"], V["alt"]), (S["ayar"], V["ekranp"])]
    if not bidir:
        specs.append((S["gosterge"], V["led"]))
    specs += [(S["ekran"], V["dij"]), (S["koruma"], V["ters"]), (S["tasarim"], V["karavan"]),
              (S["boyut"], u(dims)), (S["uretim"], V["yerli"])]
    chips = [u("🔋 12/24 V · %d A" % amp)]
    if bidir:
        chips.append(t("🔁 Çift yönlü · 10 A takviye", "🔁 Bidirectional · 10 A boost", "🔁 Bidirektional · 10 A Boost", "🔁 Двунаправленное · подпитка 10 А"))
    chips += [t("🚐 Alternatörden şarj", "🚐 Charging from the alternator", "🚐 Laden über die Lichtmaschine", "🚐 Зарядка от генератора")]
    if not bidir:
        chips.append(u("🔁 12-12 · 12-24 · 24-12 · 24-24 V"))
    chips += [t("⚙️ %96,4 verim", "⚙️ 96.4% efficiency", "⚙️ 96,4 % Wirkungsgrad", "⚙️ КПД 96,4 %"), CHIP_YERLI]
    about = [intro, B["p2"], B["p3"], B["p4"]] + ([B["p_takviye"]] if bidir else []) + [KAPANIS]
    use = B_USE + [B_USE_TAK if bidir else B_USE_24]
    model_short = "DCDC-1224B" if bidir else "DCDC-1224"
    faq = [B_Q["neden"], B_Q["arac"], (B_Q["bosalir_h"], B_Q["bosalir_b"] if bidir else B_Q["bosalir_a"]),
           (B_Q["sure_h"], B_Q["sure40"] if amp == 40 else B_Q["sure30"]), B_Q["tip"], B_Q["ekran"],
           (B_Q["takviye"] if bidir else B_Q["amper"]), B_Q["yon"], Q_TEL, Q_KUR_OTO]
    return {
        "id": pid, "file": file, "fam": "dcdc", "title": title, "desc": desc, "alt": alt,
        "kicker": B["kicker"], "lead": lead,
        "info": [("🔋", B["no_inc"]), ("🏭", YERLI)],
        "chips": chips, "about": about, "specs": specs,
        "gloss": (B["gloss"], "sozluk.html#dc-dc-sarj"),
        "use": use, "use_p": B["use_p"], "how_p": B["how_p"],
        "flow": [("⚙️", B["node_alt"], B["node_alt_s"]), ("🔋", B["node_mars"], u("12/24 V")),
                 ("🔁", B["node_dcdc"], k(model_short)), ("🔋", B["node_yasam"], u("12/24 V")),
                 ("🏕️", B["node_cihaz"], B["node_cihaz_s"])],
        "flow_here": 2,
        "flow_notes": [B["flow_ekran"]] + ([B["flow_takviye"]] if bidir else []),
        "steps": [B["st_in"], B["st_out"], B["st_ekran"], B["st_motor"]],
        "tips": [B["tip_yer"], B["tip_kesit"], B["tip_alt"], B["tip_oto"]],
        "fit": None,
        "cmp": {"p": B["cmp_p"], "heads": B["cmp_heads"], "rows": DCDC_ROWS, "tips": B["cmp_tips"]},
        "xsell": [("havensis-s30amps", X["mppt30"]), ("panel-lexron-285w", X["p285_rv"]),
                  ("kablo-solar-5m", X["kablo"]), ("mc4-set", X["mc4"])],
        "faq": faq,
        "note": (B["note_h"], B["note_p"], "havensis-boost-dcdc-2448.html", B["note_link"]),
        "cta": B["cta"],
    }


def boost_product():
    specs = [(S["marka"], V["havensis"]), (S["model"], k("BOOST DCDC-2448")),
             (S["giris"], V["giris1232"]), (S["sakü"], u("36/48/60/72 V")),
             (S["maxin"], u("20 A")), (S["maxch"], u("15 A")), (S["verim"], u("%95")),
             (S["ekran"], V["dij"]), (S["koruma"], V["gelismis"]), (S["bt"], V["btops"]),
             (S["tasarim"], V["karatek"]), (S["boyut"], u("162 × 210 × 70 mm")), (S["uretim"], V["yerli"])]
    return {
        "id": "havensis-dcdc-2448", "file": "havensis-boost-dcdc-2448.html", "fam": "boost",
        "title": "Havensis BOOST DC-DC Şarj Cihazı — 12/24V'tan 36–72V Aküye | GESPA Enerji",
        "desc": "Havensis BOOST DCDC-2448: 12/24 V araç aküsünden 36, 48, 60 ve 72 V akü grubunu şarj eden DC-DC cihaz. 20 A giriş, 15 A şarj, %95 verim. Karavan ve tekneler için.",
        "alt": t("Havensis BOOST DCDC-2448 DC-DC akü şarj cihazı", "Havensis BOOST DCDC-2448 DC-DC battery charger",
                 "Havensis BOOST DCDC-2448 DC-DC-Ladegerät", "Зарядное устройство DC-DC Havensis BOOST DCDC-2448"),
        "kicker": C["kicker"],
        "lead": t("12/24 V araç aküsünden 36, 48, 60 ya da 72 V akü grubunu şarj eden yükseltici (BOOST) DC-DC şarj cihazı. Karavan ve tekneler için tasarlandı: yolda alternatörden yüksek gerilimli akü sistemini de doldurur.",
                  "Step-up (BOOST) DC-DC charger that charges a 36, 48, 60 or 72 V battery bank from a 12/24 V vehicle battery. Designed for caravans and boats: it also fills your high-voltage battery system from the alternator on the road.",
                  "Aufwärtswandelndes (BOOST) DC-DC-Ladegerät, das eine 36-, 48-, 60- oder 72-V-Batteriebank aus einer 12/24-V-Fahrzeugbatterie lädt. Für Wohnmobile und Boote entwickelt: Es lädt Ihr Hochvolt-Batteriesystem unterwegs auch über die Lichtmaschine.",
                  "Повышающее (BOOST) зарядное устройство DC-DC, которое заряжает батарейный блок 36, 48, 60 или 72 В от автомобильного аккумулятора 12/24 В. Создано для автодомов и лодок: в пути заряжает и высоковольтную систему АКБ от генератора."),
        "info": [("🔋", B["no_inc"]), ("🏭", YERLI)],
        "chips": [t("🔋 36/48/60/72 V akü", "🔋 36/48/60/72 V battery", "🔋 36/48/60/72-V-Batterie", "🔋 АКБ 36/48/60/72 В"),
                  t("⚡ 12/24 V giriş", "⚡ 12/24 V input", "⚡ 12/24 V Eingang", "⚡ Вход 12/24 В"),
                  t("⬆️ 20 A giriş · 15 A şarj", "⬆️ 20 A input · 15 A charge", "⬆️ 20 A Eingang · 15 A Laden", "⬆️ Вход 20 А · заряд 15 А"),
                  t("⚙️ %95 verim", "⚙️ 95% efficiency", "⚙️ 95 % Wirkungsgrad", "⚙️ КПД 95 %"), CHIP_YERLI],
        "about": [
            t("Havensis BOOST DCDC-2448, 12–32 V girişi yükselterek 36, 48, 60 ya da 72 V akü grubuna şarj akımı olarak aktaran yükseltici DC-DC şarj cihazıdır. Karavan ve tekneler için özel tasarlanmıştır.",
              "The Havensis BOOST DCDC-2448 is a step-up DC-DC charger that raises a 12–32 V input and delivers it as charging current to a 36, 48, 60 or 72 V battery bank. It is designed especially for caravans and boats.",
              "Der Havensis BOOST DCDC-2448 ist ein aufwärtswandelndes DC-DC-Ladegerät, das 12–32 V am Eingang anhebt und als Ladestrom an eine 36-, 48-, 60- oder 72-V-Batteriebank abgibt. Es ist speziell für Wohnmobile und Boote entwickelt.",
              "Havensis BOOST DCDC-2448 — повышающее зарядное устройство DC-DC: поднимает входное напряжение 12–32 В и отдаёт его как ток заряда в батарейный блок 36, 48, 60 или 72 В. Разработано специально для автодомов и лодок."),
            t("Yüksek güçlü inverter kullanan karavan ve tekne sistemleri sıklıkla 48 V akü grubuyla kurulur; elektrikli tekne motorları ve bazı taşıtların akü grupları da 36–72 V aralığındadır. Aracın alternatörü ise 12 ya da 24 V'tur. BOOST DCDC-2448 bu farkı kapatır: motor çalışırken yüksek gerilimli akü grubunu da doldurur.",
              "Caravan and boat systems with high-power inverters are often built on a 48 V battery bank, and electric boat motors and some vehicles' battery packs are also in the 36–72 V range. The vehicle's alternator, however, is 12 or 24 V. The BOOST DCDC-2448 bridges this gap: it also charges the high-voltage battery bank while the engine runs.",
              "Wohnmobil- und Bootssysteme mit leistungsstarken Wechselrichtern werden oft mit einer 48-V-Batteriebank aufgebaut; auch Elektro-Bootsmotoren und die Akkupacks mancher Fahrzeuge liegen im Bereich 36–72 V. Die Lichtmaschine des Fahrzeugs hat dagegen 12 oder 24 V. Der BOOST DCDC-2448 schließt diese Lücke: Er lädt bei laufendem Motor auch die Hochvolt-Batteriebank.",
              "Системы автодомов и лодок с мощными инверторами часто строятся на батарейном блоке 48 В; электромоторы лодок и батареи некоторых машин тоже работают в диапазоне 36–72 В. А генератор автомобиля выдаёт 12 или 24 В. BOOST DCDC-2448 устраняет этот разрыв: при работающем двигателе заряжает и высоковольтный батарейный блок."),
            t("Girişten en fazla 20 A çeker ve aküye en fazla 15 A şarj akımı verir; dönüştürücü verimi %95'tir. Dijital ekran bağlantısı, 5 m uzatma kablosu ve gelişmiş koruma devreleri vardır.",
              "It draws at most 20 A from the input and delivers at most 15 A of charging current to the battery; conversion efficiency is 95%. It has a digital display connection, a 5 m extension cable and advanced protection circuits.",
              "Er zieht am Eingang höchstens 20 A und liefert höchstens 15 A Ladestrom an die Batterie; der Wandlungswirkungsgrad beträgt 95 %. Er verfügt über einen Anschluss für ein Digitaldisplay, ein 5-m-Verlängerungskabel und fortschrittliche Schutzschaltungen.",
              "Потребляет со входа не более 20 А и отдаёт в аккумулятор не более 15 А тока заряда; КПД преобразования — 95 %. Есть подключение цифрового дисплея, удлинительный кабель 5 м и усовершенствованные схемы защиты."),
            t("Dahili Bluetooth isteğe bağlıdır ve siparişte belirtilir; bu seçenek için siparişten önce bize yazın.",
              "Built-in Bluetooth is optional and must be specified when ordering; write to us before you order if you want this option.",
              "Integriertes Bluetooth ist optional und wird bei der Bestellung angegeben; schreiben Sie uns vor der Bestellung, wenn Sie diese Option wünschen.",
              "Встроенный Bluetooth — опция, которую указывают при заказе; если она нужна, напишите нам до оформления заказа."),
            KAPANIS],
        "specs": specs, "gloss": (B["gloss"], "sozluk.html#dc-dc-sarj"),
        "use": C_USE, "use_p": C["use_p"], "how_p": C["how_p"],
        "flow": [("⚙️", B["node_alt"], B["node_alt_s"]), ("🔋", B["node_mars"], u("12/24 V")),
                 ("⬆️", k("BOOST DC-DC"), k("DCDC-2448")), ("🔋", C["node_grup"], u("36–72 V"))],
        "flow_here": 2, "flow_notes": [C["flow_ekran"]],
        "steps": [C["st_in"], C["st_out"], C["st_ekran"]],
        "tips": [B["tip_yer"], C["tip_giris"], B["tip_alt"], B["tip_oto"]],
        "fit": None, "cmp": None,
        "xsell": [("havensis-s60amps150", X["mppt150"]), ("boost-mppt", X["boost"]),
                  ("aku-titanx-51v-102ah", X["titanx"])],
        "faq": C_Q,
        "note": (C["note_h"], C["note_p"], "havensis-dcdc-30a.html", LINK_DCDC),
        "cta": C["cta"],
    }


CHIP_YUK = t("💡 20 A yük çıkışı", "💡 20 A load output", "💡 20-A-Lastausgang", "💡 Выход нагрузки 20 А")
PRODUCTS = [
    mppt_product(
        "havensis-s30amps", "havensis-mppt-30a.html", "Solar-30AMPS (100|30)", 30, "1200", "159 × 210 × 70 mm", "%98", False,
        "Havensis 30A MPPT Şarj Kontrol Cihazı 12/24V — 1200W Panel | GESPA Enerji",
        "12/24 V akülü güneş sistemleri için Havensis Solar-30AMPS MPPT şarj kontrol cihazı: 30 A şarj, 20 A yük çıkışı, 100 V panel girişi, 1200 W'a kadar panel, LCD ekran. Yerli üretim.",
        t("Havensis Solar-30AMPS MPPT şarj kontrol cihazı", "Havensis Solar-30AMPS MPPT charge controller",
          "Havensis Solar-30AMPS MPPT-Laderegler", "MPPT-контроллер заряда Havensis Solar-30AMPS"),
        t("12/24 V akülü güneş sistemleri için MPPT şarj kontrol cihazı: 1200 W'a kadar panel bağlanır, aküyü 30 A ile şarj eder. 20 A yük çıkışı, gece-gündüz ve zaman ayarıyla aydınlatmayı kendi yönetir.",
          "MPPT charge controller for 12/24 V battery solar systems: connect up to 1200 W of panels and charge the battery at up to 30 A. The 20 A load output runs your lighting by itself with its dusk-to-dawn and timer functions.",
          "MPPT-Laderegler für Solaranlagen mit 12/24-V-Batterie: bis 1200 W Modulleistung anschließbar, lädt die Batterie mit bis zu 30 A. Der 20-A-Lastausgang steuert die Beleuchtung dank Dämmerungs- und Zeitfunktion selbstständig.",
          "MPPT-контроллер заряда для солнечных систем с АКБ 12/24 В: подключается до 1200 Вт панелей, заряжает аккумулятор током до 30 А. Выход нагрузки 20 А сам управляет освещением благодаря функциям «день-ночь» и таймера."),
        t("Havensis Solar-30AMPS, MPPT serisinin (MPS) 30 A'lik şarj kontrol cihazıdır. Model kodundaki 100|30, cihazın en fazla 100 V panel girişi ve 30 A şarj akımıyla çalıştığını anlatır. 12 V ve 24 V akülerle kullanılır; 1200 W'a kadar güneş paneli bağlanabilir.",
          "The Havensis Solar-30AMPS is the 30 A charge controller of the MPPT series (MPS). The 100|30 in the model code means it takes up to 100 V of panel input and charges at up to 30 A. It works with 12 V and 24 V batteries, and up to 1200 W of solar panels can be connected.",
          "Der Havensis Solar-30AMPS ist der 30-A-Laderegler der MPPT-Serie (MPS). Die Angabe 100|30 im Modellcode steht für bis zu 100 V Moduleingang und bis zu 30 A Ladestrom. Er arbeitet mit 12-V- und 24-V-Batterien; bis zu 1200 W Solarmodule lassen sich anschließen.",
          "Havensis Solar-30AMPS — контроллер заряда на 30 А серии MPPT (MPS). Обозначение 100|30 в коде модели означает вход панелей до 100 В и ток заряда до 30 А. Работает с аккумуляторами 12 В и 24 В; можно подключить до 1200 Вт солнечных панелей."),
        CHIP_YUK),
    mppt_product(
        "havensis-s60amps100", "havensis-mppt-60a.html", "Solar-60AMPS-100 (100|60)", 60, "2500", "197,2 × 224 × 80 mm", "%98", False,
        "Havensis 60A MPPT Şarj Kontrol Cihazı 12/24V — 2500W Panel | GESPA Enerji",
        "Havensis Solar-60AMPS-100 MPPT şarj kontrol cihazı: 12/24 V akü, 60 A şarj, 20 A yük çıkışı, 100 V panel girişi, 2500 W'a kadar panel, LCD ekran. Bağ evi ve karavan için.",
        t("Havensis Solar-60AMPS-100 MPPT şarj kontrol cihazı", "Havensis Solar-60AMPS-100 MPPT charge controller",
          "Havensis Solar-60AMPS-100 MPPT-Laderegler", "MPPT-контроллер заряда Havensis Solar-60AMPS-100"),
        t("12/24 V akülü güneş sistemleri için 60 A MPPT şarj kontrol cihazı: 2500 W'a kadar panel bağlanır, aküyü 60 A ile şarj eder. 20 A yük çıkışı, gece-gündüz ve zaman ayarıyla aydınlatmayı kendi yönetir.",
          "60 A MPPT charge controller for 12/24 V battery solar systems: connect up to 2500 W of panels and charge the battery at up to 60 A. The 20 A load output runs your lighting by itself with its dusk-to-dawn and timer functions.",
          "60-A-MPPT-Laderegler für Solaranlagen mit 12/24-V-Batterie: bis 2500 W Modulleistung anschließbar, lädt die Batterie mit bis zu 60 A. Der 20-A-Lastausgang steuert die Beleuchtung dank Dämmerungs- und Zeitfunktion selbstständig.",
          "MPPT-контроллер заряда 60 А для солнечных систем с АКБ 12/24 В: подключается до 2500 Вт панелей, заряжает аккумулятор током до 60 А. Выход нагрузки 20 А сам управляет освещением благодаря функциям «день-ночь» и таймера."),
        t("Havensis Solar-60AMPS-100, MPPT serisinin (MPS) 60 A'lik şarj kontrol cihazıdır. Model kodundaki 100|60, cihazın en fazla 100 V panel girişi ve 60 A şarj akımıyla çalıştığını anlatır. 12 V ve 24 V akülerle kullanılır; 2500 W'a kadar güneş paneli bağlanabilir.",
          "The Havensis Solar-60AMPS-100 is the 60 A charge controller of the MPPT series (MPS). The 100|60 in the model code means it takes up to 100 V of panel input and charges at up to 60 A. It works with 12 V and 24 V batteries, and up to 2500 W of solar panels can be connected.",
          "Der Havensis Solar-60AMPS-100 ist der 60-A-Laderegler der MPPT-Serie (MPS). Die Angabe 100|60 im Modellcode steht für bis zu 100 V Moduleingang und bis zu 60 A Ladestrom. Er arbeitet mit 12-V- und 24-V-Batterien; bis zu 2500 W Solarmodule lassen sich anschließen.",
          "Havensis Solar-60AMPS-100 — контроллер заряда на 60 А серии MPPT (MPS). Обозначение 100|60 в коде модели означает вход панелей до 100 В и ток заряда до 60 А. Работает с аккумуляторами 12 В и 24 В; можно подключить до 2500 Вт солнечных панелей."),
        CHIP_YUK),
    mppt_product(
        "havensis-s60amps150", "havensis-mppt-60a-150v.html", "Solar-60AMPS 150|60", 60, "5000", "280 × 235 × 100 mm", "%97,5", True,
        "Havensis 60A MPPT Şarj Kontrol 12–48V, 150V — 5000W Panel | GESPA Enerji",
        "Havensis Solar-60AMPS 150|60 MPPT şarj kontrol cihazı: 12/24/36/48 V akü, 60 A şarj, 150 V panel girişi, 5000 W'a kadar panel. 48 V off-grid sistemler için yerli üretim.",
        t("Havensis Solar-60AMPS 150|60 MPPT şarj kontrol cihazı", "Havensis Solar-60AMPS 150|60 MPPT charge controller",
          "Havensis Solar-60AMPS 150|60 MPPT-Laderegler", "MPPT-контроллер заряда Havensis Solar-60AMPS 150|60"),
        t("12, 24, 36 ve 48 V akü sistemleri için 60 A MPPT şarj kontrol cihazı: 150 V'a kadar panel girişi ve 5000 W'a kadar panel gücüyle büyük off-grid sistemlerin şarj merkezi.",
          "60 A MPPT charge controller for 12, 24, 36 and 48 V battery systems: with up to 150 V panel input and up to 5000 W of panels, it is the charging hub of large off-grid systems.",
          "60-A-MPPT-Laderegler für 12-, 24-, 36- und 48-V-Batteriesysteme: Mit bis zu 150 V Moduleingang und bis zu 5000 W Modulleistung ist er die Ladezentrale großer Inselanlagen.",
          "MPPT-контроллер заряда 60 А для систем с АКБ 12, 24, 36 и 48 В: вход панелей до 150 В и до 5000 Вт панелей — центр зарядки больших автономных систем."),
        t("Havensis Solar-60AMPS 150|60, MPPT serisinin (MPS) 12–48 V akülerle çalışan 60 A'lik modelidir. Model kodundaki 150|60, cihazın en fazla 150 V panel girişi ve 60 A şarj akımıyla çalıştığını anlatır. 12, 24, 36 ve 48 V akülerle kullanılır; 5000 W'a kadar güneş paneli bağlanabilir.",
          "The Havensis Solar-60AMPS 150|60 is the 60 A model of the MPPT series (MPS) for 12–48 V batteries. The 150|60 in the model code means it takes up to 150 V of panel input and charges at up to 60 A. It works with 12, 24, 36 and 48 V batteries, and up to 5000 W of solar panels can be connected.",
          "Der Havensis Solar-60AMPS 150|60 ist das 60-A-Modell der MPPT-Serie (MPS) für 12–48-V-Batterien. Die Angabe 150|60 im Modellcode steht für bis zu 150 V Moduleingang und bis zu 60 A Ladestrom. Er arbeitet mit 12-, 24-, 36- und 48-V-Batterien; bis zu 5000 W Solarmodule lassen sich anschließen.",
          "Havensis Solar-60AMPS 150|60 — модель на 60 А серии MPPT (MPS) для аккумуляторов 12–48 В. Обозначение 150|60 в коде модели означает вход панелей до 150 В и ток заряда до 60 А. Работает с аккумуляторами 12, 24, 36 и 48 В; можно подключить до 5000 Вт солнечных панелей."),
        t("📈 %99,6 MPP izleme", "📈 99.6% MPP tracking", "📈 99,6 % MPP-Tracking", "📈 Отслеживание MPP 99,6 %")),
    dcdc_product(
        "havensis-dcdc-1224-30", "havensis-dcdc-30a.html", "DCDC-1224", 30, "158 × 210 × 60 mm", False,
        "Havensis DC-DC Akü Şarj Cihazı 30A — Karavan Alternatör Şarjı | GESPA Enerji",
        "Karavanda yaşam aküsünü yolda alternatörden şarj eden Havensis DCDC-1224 DC-DC akü şarj cihazı: 30 A, 12/24 V, %96,4 verim, motor kapalı tanıma, 5 m kablolu ekran.",
        t("Havensis DCDC-1224 DC-DC akü şarj cihazı", "Havensis DCDC-1224 DC-DC battery charger",
          "Havensis DCDC-1224 DC-DC-Ladegerät", "Зарядное устройство DC-DC Havensis DCDC-1224"),
        t("Karavanın yaşam aküsünü yolda, alternatörden şarj eden tek yönlü DC-DC akü şarj cihazı: 30 A şarj akımı, 12 ve 24 V araç ile akülerin her kombinasyonu. Motor durunca bunu algılar ve marş aküsünü korur.",
          "One-way DC-DC battery charger that charges the caravan's house battery from the alternator while you drive: 30 A charging current and every combination of 12 and 24 V vehicles and batteries. It detects when the engine stops and protects the starter battery.",
          "Unidirektionales DC-DC-Ladegerät, das die Aufbaubatterie des Wohnmobils während der Fahrt über die Lichtmaschine lädt: 30 A Ladestrom und jede Kombination aus 12- und 24-V-Fahrzeug und -Batterie. Es erkennt, wenn der Motor steht, und schützt die Starterbatterie.",
          "Однонаправленное зарядное устройство DC-DC, которое в пути заряжает бытовой аккумулятор автодома от генератора: ток заряда 30 А и любые сочетания автомобиля и АКБ на 12 и 24 В. Распознаёт остановку двигателя и защищает стартерный аккумулятор."),
        t("Havensis DCDC-1224, karavanlar için özel tasarlanmış tek yönlü DC-DC akü şarj cihazıdır. Bu model 30 A şarj akımıyla çalışır; 10–35 V girişi kabul eder, 12–32 V çıkış verir ve %96,4 dönüştürücü verimine sahiptir.",
          "The Havensis DCDC-1224 is a one-way DC-DC battery charger designed especially for caravans. This model works with a 30 A charging current; it accepts a 10–35 V input, delivers a 12–32 V output and has a conversion efficiency of 96.4%.",
          "Der Havensis DCDC-1224 ist ein speziell für Wohnmobile entwickeltes unidirektionales DC-DC-Ladegerät. Dieses Modell arbeitet mit 30 A Ladestrom; es akzeptiert 10–35 V am Eingang, liefert 12–32 V am Ausgang und hat einen Wandlungswirkungsgrad von 96,4 %.",
          "Havensis DCDC-1224 — однонаправленное зарядное устройство DC-DC, разработанное специально для автодомов. Эта модель работает с током заряда 30 А; принимает на вход 10–35 В, выдаёт 12–32 В и имеет КПД преобразования 96,4 %.")),
    dcdc_product(
        "havensis-dcdc-1224-40", "havensis-dcdc-40a.html", "DCDC-1224", 40, "162 × 210 × 70 mm", False,
        "Havensis DC-DC Akü Şarj Cihazı 40A — Karavan Alternatör Şarjı | GESPA Enerji",
        "Havensis DCDC-1224 40 A DC-DC akü şarj cihazı: karavan yaşam aküsünü alternatörden hızlı şarj eder. 12-12, 12-24, 24-12, 24-24 V, %96,4 verim, motor kapalı tanıma.",
        t("Havensis DCDC-1224 DC-DC akü şarj cihazı", "Havensis DCDC-1224 DC-DC battery charger",
          "Havensis DCDC-1224 DC-DC-Ladegerät", "Зарядное устройство DC-DC Havensis DCDC-1224"),
        t("Karavanın yaşam aküsünü yolda, alternatörden hızla şarj eden tek yönlü DC-DC akü şarj cihazı: 40 A şarj akımı, 12 ve 24 V araç ile akülerin her kombinasyonu. Motor durunca bunu algılar ve marş aküsünü korur.",
          "One-way DC-DC battery charger that quickly charges the caravan's house battery from the alternator while you drive: 40 A charging current and every combination of 12 and 24 V vehicles and batteries. It detects when the engine stops and protects the starter battery.",
          "Unidirektionales DC-DC-Ladegerät, das die Aufbaubatterie des Wohnmobils während der Fahrt schnell über die Lichtmaschine lädt: 40 A Ladestrom und jede Kombination aus 12- und 24-V-Fahrzeug und -Batterie. Es erkennt, wenn der Motor steht, und schützt die Starterbatterie.",
          "Однонаправленное зарядное устройство DC-DC, которое в пути быстро заряжает бытовой аккумулятор автодома от генератора: ток заряда 40 А и любые сочетания автомобиля и АКБ на 12 и 24 В. Распознаёт остановку двигателя и защищает стартерный аккумулятор."),
        t("Havensis DCDC-1224, karavanlar için özel tasarlanmış tek yönlü DC-DC akü şarj cihazıdır. Bu model 40 A şarj akımıyla çalışır; 10–35 V girişi kabul eder, 12–32 V çıkış verir ve %96,4 dönüştürücü verimine sahiptir.",
          "The Havensis DCDC-1224 is a one-way DC-DC battery charger designed especially for caravans. This model works with a 40 A charging current; it accepts a 10–35 V input, delivers a 12–32 V output and has a conversion efficiency of 96.4%.",
          "Der Havensis DCDC-1224 ist ein speziell für Wohnmobile entwickeltes unidirektionales DC-DC-Ladegerät. Dieses Modell arbeitet mit 40 A Ladestrom; es akzeptiert 10–35 V am Eingang, liefert 12–32 V am Ausgang und hat einen Wandlungswirkungsgrad von 96,4 %.",
          "Havensis DCDC-1224 — однонаправленное зарядное устройство DC-DC, разработанное специально для автодомов. Эта модель работает с током заряда 40 А; принимает на вход 10–35 В, выдаёт 12–32 В и имеет КПД преобразования 96,4 %.")),
    dcdc_product(
        "havensis-dcdc-1224b-40", "havensis-dcdc-40a-cift-yonlu.html", "DCDC-1224B", 40, "162 × 210 × 70 mm", True,
        "Havensis Çift Yönlü DC-DC Akü Şarj Cihazı 40A — Takviye Modlu | GESPA Enerji",
        "Havensis DCDC-1224B çift yönlü DC-DC akü şarj cihazı: yaşam aküsüne 40 A şarj, takviye modunda marş aküsüne 10 A. Karavanlar için 12/24 V, %96,4 verim, yerli üretim.",
        t("Havensis DCDC-1224B çift yönlü DC-DC akü şarj cihazı", "Havensis DCDC-1224B bidirectional DC-DC battery charger",
          "Havensis DCDC-1224B bidirektionales DC-DC-Ladegerät", "Двунаправленное зарядное DC-DC Havensis DCDC-1224B"),
        t("Çift yönlü DC-DC akü şarj cihazı: yolda alternatörden yaşam aküsünü 40 A ile doldurur; takviye modunda yaşam aküsünden marş aküsüne 10 A'e kadar şarj yaparak zayıflayan marş aküsünü destekler.",
          "Bidirectional DC-DC battery charger: on the road it fills the house battery from the alternator at 40 A; in boost mode it charges the starter battery from the house battery at up to 10 A to support a weakening starter battery.",
          "Bidirektionales DC-DC-Ladegerät: Unterwegs lädt es die Aufbaubatterie über die Lichtmaschine mit 40 A; im Boost-Modus lädt es die Starterbatterie aus der Aufbaubatterie mit bis zu 10 A und stützt so eine schwächelnde Starterbatterie.",
          "Двунаправленное зарядное устройство DC-DC: в пути заряжает бытовой аккумулятор от генератора током 40 А, а в режиме подпитки заряжает стартерный аккумулятор от бытового током до 10 А, поддерживая ослабевший стартер."),
        t("Havensis DCDC-1224B, karavanlar için özel tasarlanmış çift yönlü DC-DC akü şarj cihazıdır. Yaşam aküsünü 40 A ile şarj eder, takviye modunda ters yönde 10 A verir; 10–35 V girişi kabul eder, 12–32 V çıkış verir ve %96,4 dönüştürücü verimine sahiptir.",
          "The Havensis DCDC-1224B is a bidirectional DC-DC battery charger designed especially for caravans. It charges the house battery at 40 A and delivers 10 A in the reverse direction in boost mode; it accepts a 10–35 V input, delivers a 12–32 V output and has a conversion efficiency of 96.4%.",
          "Der Havensis DCDC-1224B ist ein speziell für Wohnmobile entwickeltes bidirektionales DC-DC-Ladegerät. Er lädt die Aufbaubatterie mit 40 A und liefert im Boost-Modus 10 A in Gegenrichtung; er akzeptiert 10–35 V am Eingang, liefert 12–32 V am Ausgang und hat einen Wandlungswirkungsgrad von 96,4 %.",
          "Havensis DCDC-1224B — двунаправленное зарядное устройство DC-DC, разработанное специально для автодомов. Заряжает бытовой аккумулятор током 40 А, а в режиме подпитки отдаёт 10 А в обратном направлении; принимает на вход 10–35 В, выдаёт 12–32 В и имеет КПД преобразования 96,4 %.")),
    boost_product(),
]

# config.packages[].desc çevirileri — Product şemasının açıklaması dil
# sayfalarında bunlardan gelir. config'teki metin değişirse main() DURUR:
# o zaman buradaki TR metni ve çevirileri birlikte güncelle.
DESC = [
    t("Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-30AMPS – 100|30). 12/24 V akü şarjı, 30 A şarj akımı ve 20 A yük çıkışı. Gelişmiş MPPT algoritmasıyla %98 dönüştürücü ve %99,6 MPP izleme verimi; 100 V'a kadar panel girişi, 1200 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir, gece-gündüz ve zaman ayarı fonksiyonu; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 159 × 210 × 70 mm. Yerli üretim.",
      "Havensis Solar-MPS series MPPT charge controller (Solar-30AMPS – 100|30). 12/24 V battery charging, 30 A charging current and 20 A load output. Advanced MPPT algorithm with 98% conversion and 99.6% MPP tracking efficiency; panel input up to 100 V, up to 1200 W of panels. LCD display and LED status indicator, all parameters adjustable, dusk-to-dawn and timer function; powered from the panel, it can also run without a battery. Dimensions 159 × 210 × 70 mm. Made in Türkiye.",
      "MPPT-Laderegler der Havensis Solar-MPS-Serie (Solar-30AMPS – 100|30). Laden von 12/24-V-Batterien, 30 A Ladestrom und 20-A-Lastausgang. Fortschrittlicher MPPT-Algorithmus mit 98 % Wandlungs- und 99,6 % MPP-Tracking-Wirkungsgrad; Moduleingang bis 100 V, bis 1200 W Module. LCD-Display und LED-Statusanzeige, alle Parameter einstellbar, Dämmerungs- und Zeitfunktion; aus dem Modul versorgt, läuft er auch ohne Batterie. Abmessungen 159 × 210 × 70 mm. Hergestellt in der Türkei.",
      "MPPT-контроллер заряда серии Havensis Solar-MPS (Solar-30AMPS – 100|30). Заряд АКБ 12/24 В, ток заряда 30 А и выход нагрузки 20 А. Усовершенствованный алгоритм MPPT: КПД преобразования 98 % и эффективность отслеживания MPP 99,6 %; вход панелей до 100 В, до 1200 Вт панелей. ЖК-дисплей и светодиодный индикатор состояния, все параметры настраиваются, функции «день-ночь» и таймера; питаясь от панели, может работать и без АКБ. Габариты 159 × 210 × 70 мм. Сделано в Турции."),
    t("Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-60AMPS-100 – 100|60). 12/24 V akü şarjı, 60 A şarj akımı ve 20 A yük çıkışı. Gelişmiş MPPT algoritmasıyla %98 dönüştürücü ve %99,6 MPP izleme verimi; 100 V'a kadar panel girişi, 2500 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir, gece-gündüz ve zaman ayarı fonksiyonu; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 197,2 × 224 × 80 mm. Yerli üretim.",
      "Havensis Solar-MPS series MPPT charge controller (Solar-60AMPS-100 – 100|60). 12/24 V battery charging, 60 A charging current and 20 A load output. Advanced MPPT algorithm with 98% conversion and 99.6% MPP tracking efficiency; panel input up to 100 V, up to 2500 W of panels. LCD display and LED status indicator, all parameters adjustable, dusk-to-dawn and timer function; powered from the panel, it can also run without a battery. Dimensions 197.2 × 224 × 80 mm. Made in Türkiye.",
      "MPPT-Laderegler der Havensis Solar-MPS-Serie (Solar-60AMPS-100 – 100|60). Laden von 12/24-V-Batterien, 60 A Ladestrom und 20-A-Lastausgang. Fortschrittlicher MPPT-Algorithmus mit 98 % Wandlungs- und 99,6 % MPP-Tracking-Wirkungsgrad; Moduleingang bis 100 V, bis 2500 W Module. LCD-Display und LED-Statusanzeige, alle Parameter einstellbar, Dämmerungs- und Zeitfunktion; aus dem Modul versorgt, läuft er auch ohne Batterie. Abmessungen 197,2 × 224 × 80 mm. Hergestellt in der Türkei.",
      "MPPT-контроллер заряда серии Havensis Solar-MPS (Solar-60AMPS-100 – 100|60). Заряд АКБ 12/24 В, ток заряда 60 А и выход нагрузки 20 А. Усовершенствованный алгоритм MPPT: КПД преобразования 98 % и эффективность отслеживания MPP 99,6 %; вход панелей до 100 В, до 2500 Вт панелей. ЖК-дисплей и светодиодный индикатор состояния, все параметры настраиваются, функции «день-ночь» и таймера; питаясь от панели, может работать и без АКБ. Габариты 197,2 × 224 × 80 мм. Сделано в Турции."),
    t("Havensis Solar-MPS serisi MPPT şarj kontrol cihazı (Solar-60AMPS – 150|60). 12/24/36/48 V akü şarjı ve 60 A şarj akımı. Gelişmiş MPPT algoritmasıyla %97,5 dönüştürücü ve %99,6 MPP izleme verimi; 150 V'a kadar panel girişi, 5000 W'a kadar panel bağlantısı. LCD ekran ve LED durum göstergesi, tüm parametreler ayarlanabilir; panelden beslenerek aküsüz de çalışabilir. Cihaz boyutu 280 × 235 × 100 mm. Yerli üretim.",
      "Havensis Solar-MPS series MPPT charge controller (Solar-60AMPS – 150|60). 12/24/36/48 V battery charging and 60 A charging current. Advanced MPPT algorithm with 97.5% conversion and 99.6% MPP tracking efficiency; panel input up to 150 V, up to 5000 W of panels. LCD display and LED status indicator, all parameters adjustable; powered from the panel, it can also run without a battery. Dimensions 280 × 235 × 100 mm. Made in Türkiye.",
      "MPPT-Laderegler der Havensis Solar-MPS-Serie (Solar-60AMPS – 150|60). Laden von 12/24/36/48-V-Batterien und 60 A Ladestrom. Fortschrittlicher MPPT-Algorithmus mit 97,5 % Wandlungs- und 99,6 % MPP-Tracking-Wirkungsgrad; Moduleingang bis 150 V, bis 5000 W Module. LCD-Display und LED-Statusanzeige, alle Parameter einstellbar; aus dem Modul versorgt, läuft er auch ohne Batterie. Abmessungen 280 × 235 × 100 mm. Hergestellt in der Türkei.",
      "MPPT-контроллер заряда серии Havensis Solar-MPS (Solar-60AMPS – 150|60). Заряд АКБ 12/24/36/48 В и ток заряда 60 А. Усовершенствованный алгоритм MPPT: КПД преобразования 97,5 % и эффективность отслеживания MPP 99,6 %; вход панелей до 150 В, до 5000 Вт панелей. ЖК-дисплей и светодиодный индикатор состояния, все параметры настраиваются; питаясь от панели, может работать и без АКБ. Габариты 280 × 235 × 100 мм. Сделано в Турции."),
    t("Havensis tek yönlü DC-DC akü şarj cihazı (DCDC-1224, 30 A). Alternatörden akü şarj cihazıdır; 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir. Karavanlar için özel tasarlanmıştır. 30 A şarj akımı, %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; LED durum göstergesi, dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 158 × 210 × 60 mm. Yerli üretim.",
      "Havensis one-way DC-DC battery charger (DCDC-1224, 30 A). A battery charger fed by the alternator; it can charge 12-12, 12-24, 24-12 and 24-24 V. Designed especially for caravans. 30 A charging current, 96.4% conversion efficiency, 10–35 V input and 12–32 V output voltage. All parameters programmable via the display; LED status indicator, digital display connection and 5 m extension cable, reverse-current protection (engine-off detection). Dimensions 158 × 210 × 60 mm. Made in Türkiye.",
      "Unidirektionales Havensis DC-DC-Ladegerät (DCDC-1224, 30 A). Ladegerät, das aus der Lichtmaschine gespeist wird; es lädt 12-12, 12-24, 24-12 und 24-24 V. Speziell für Wohnmobile entwickelt. 30 A Ladestrom, 96,4 % Wandlungswirkungsgrad, 10–35 V Eingangs- und 12–32 V Ausgangsspannung. Alle Parameter über das Display programmierbar; LED-Statusanzeige, Anschluss für Digitaldisplay und 5-m-Verlängerungskabel, Rückstromschutz (Motor-aus-Erkennung). Abmessungen 158 × 210 × 60 mm. Hergestellt in der Türkei.",
      "Однонаправленное зарядное устройство DC-DC Havensis (DCDC-1224, 30 А). Зарядное устройство с питанием от генератора; заряжает по схемам 12-12, 12-24, 24-12 и 24-24 В. Разработано специально для автодомов. Ток заряда 30 А, КПД преобразования 96,4 %, входное напряжение 10–35 В, выходное 12–32 В. Все параметры программируются с дисплея; светодиодный индикатор состояния, подключение цифрового дисплея и удлинительный кабель 5 м, защита от обратного тока (распознавание выключенного двигателя). Габариты 158 × 210 × 60 мм. Сделано в Турции."),
    t("Havensis tek yönlü DC-DC akü şarj cihazı (DCDC-1224, 40 A). Alternatörden akü şarj cihazıdır; 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir. Karavanlar için özel tasarlanmıştır. 40 A şarj akımı, %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; LED durum göstergesi, dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      "Havensis one-way DC-DC battery charger (DCDC-1224, 40 A). A battery charger fed by the alternator; it can charge 12-12, 12-24, 24-12 and 24-24 V. Designed especially for caravans. 40 A charging current, 96.4% conversion efficiency, 10–35 V input and 12–32 V output voltage. All parameters programmable via the display; LED status indicator, digital display connection and 5 m extension cable, reverse-current protection (engine-off detection). Dimensions 162 × 210 × 70 mm. Made in Türkiye.",
      "Unidirektionales Havensis DC-DC-Ladegerät (DCDC-1224, 40 A). Ladegerät, das aus der Lichtmaschine gespeist wird; es lädt 12-12, 12-24, 24-12 und 24-24 V. Speziell für Wohnmobile entwickelt. 40 A Ladestrom, 96,4 % Wandlungswirkungsgrad, 10–35 V Eingangs- und 12–32 V Ausgangsspannung. Alle Parameter über das Display programmierbar; LED-Statusanzeige, Anschluss für Digitaldisplay und 5-m-Verlängerungskabel, Rückstromschutz (Motor-aus-Erkennung). Abmessungen 162 × 210 × 70 mm. Hergestellt in der Türkei.",
      "Однонаправленное зарядное устройство DC-DC Havensis (DCDC-1224, 40 А). Зарядное устройство с питанием от генератора; заряжает по схемам 12-12, 12-24, 24-12 и 24-24 В. Разработано специально для автодомов. Ток заряда 40 А, КПД преобразования 96,4 %, входное напряжение 10–35 В, выходное 12–32 В. Все параметры программируются с дисплея; светодиодный индикатор состояния, подключение цифрового дисплея и удлинительный кабель 5 м, защита от обратного тока (распознавание выключенного двигателя). Габариты 162 × 210 × 70 мм. Сделано в Турции."),
    t("Havensis çift yönlü DC-DC akü şarj cihazı (DCDC-1224B, 40 A). Çift yönlü akü şarjı yapabilir (takviye modu): 40 A şarj akımı ve 10 A takviye şarj akımı. 12-12, 12-24, 24-12 ve 24-24 V şarj yapabilir; karavanlar için özel tasarlanmıştır. %96,4 dönüştürücü verimi, 10–35 V giriş ve 12–32 V çıkış gerilimi. Tüm parametreler ekranla programlanabilir; dijital ekran bağlantısı ve 5 m uzatma kablosu, ters akım koruması (motor kapalı tanıma). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      "Havensis bidirectional DC-DC battery charger (DCDC-1224B, 40 A). It can charge in both directions (boost mode): 40 A charging current and 10 A boost charging current. It can charge 12-12, 12-24, 24-12 and 24-24 V and is designed especially for caravans. 96.4% conversion efficiency, 10–35 V input and 12–32 V output voltage. All parameters programmable via the display; digital display connection and 5 m extension cable, reverse-current protection (engine-off detection). Dimensions 162 × 210 × 70 mm. Made in Türkiye.",
      "Bidirektionales Havensis DC-DC-Ladegerät (DCDC-1224B, 40 A). Es lädt in beide Richtungen (Boost-Modus): 40 A Ladestrom und 10 A Boost-Ladestrom. Es lädt 12-12, 12-24, 24-12 und 24-24 V und ist speziell für Wohnmobile entwickelt. 96,4 % Wandlungswirkungsgrad, 10–35 V Eingangs- und 12–32 V Ausgangsspannung. Alle Parameter über das Display programmierbar; Anschluss für Digitaldisplay und 5-m-Verlängerungskabel, Rückstromschutz (Motor-aus-Erkennung). Abmessungen 162 × 210 × 70 mm. Hergestellt in der Türkei.",
      "Двунаправленное зарядное устройство DC-DC Havensis (DCDC-1224B, 40 А). Заряжает в обоих направлениях (режим подпитки): ток заряда 40 А и ток подпитки 10 А. Заряжает по схемам 12-12, 12-24, 24-12 и 24-24 В; разработано специально для автодомов. КПД преобразования 96,4 %, входное напряжение 10–35 В, выходное 12–32 В. Все параметры программируются с дисплея; подключение цифрового дисплея и удлинительный кабель 5 м, защита от обратного тока (распознавание выключенного двигателя). Габариты 162 × 210 × 70 мм. Сделано в Турции."),
    t("Havensis BOOST DCDC-2448 yükseltici DC-DC akü şarj cihazı. 12/24 V girişle 36/48/60/72 V akü şarjı yapar: 12–32 V giriş gerilimi, en fazla 20 A giriş ve 15 A şarj akımı, %95 dönüştürücü verimi. Karavan ve tekneler için özel tasarlanmıştır. Dijital ekran bağlantısı ve 5 m uzatma kablosu, gelişmiş koruma devreleri; dahili Bluetooth desteği isteğe bağlıdır (siparişte belirtin). Cihaz boyutu 162 × 210 × 70 mm. Yerli üretim.",
      "Havensis BOOST DCDC-2448 step-up DC-DC battery charger. It charges 36/48/60/72 V batteries from a 12/24 V input: 12–32 V input voltage, up to 20 A input and 15 A charging current, 95% conversion efficiency. Designed especially for caravans and boats. Digital display connection and 5 m extension cable, advanced protection circuits; built-in Bluetooth is optional (specify when ordering). Dimensions 162 × 210 × 70 mm. Made in Türkiye.",
      "Havensis BOOST DCDC-2448, aufwärtswandelndes DC-DC-Ladegerät. Es lädt 36/48/60/72-V-Batterien aus einem 12/24-V-Eingang: 12–32 V Eingangsspannung, bis 20 A Eingangs- und 15 A Ladestrom, 95 % Wandlungswirkungsgrad. Speziell für Wohnmobile und Boote entwickelt. Anschluss für Digitaldisplay und 5-m-Verlängerungskabel, fortschrittliche Schutzschaltungen; integriertes Bluetooth optional (bei Bestellung angeben). Abmessungen 162 × 210 × 70 mm. Hergestellt in der Türkei.",
      "Повышающее зарядное устройство DC-DC Havensis BOOST DCDC-2448. Заряжает АКБ 36/48/60/72 В от входа 12/24 В: входное напряжение 12–32 В, входной ток до 20 А и ток заряда до 15 А, КПД преобразования 95 %. Разработано специально для автодомов и лодок. Подключение цифрового дисплея и удлинительный кабель 5 м, усовершенствованные схемы защиты; встроенный Bluetooth — опционально (указывается при заказе). Габариты 162 × 210 × 70 мм. Сделано в Турции."),
]


# ------------------------------------------------------------ HTML üretimi
def img_size(rel):
    try:
        from PIL import Image
        with Image.open(os.path.join(ROOT, rel)) as im:
            return im.size
    except Exception:
        return (880, 660)


def buy_section(P, pk):
    p = pk[P["id"]]
    info = "".join('\n              <li>%s <span>%s</span></li>' % (ico, esc(txt)) for ico, txt in P["info"])
    chips = "".join("<span>%s</span>" % esc(c) for c in P["chips"])
    w, h = img_size(p["img"])
    return """    <section class="section prod-sec">
      <div class="container">
        <div class="crumbs"><a href="index.html">Ana Sayfa</a> <span>/</span> <a href="online-satis.html">Online Satış</a> <span>/</span> {name}</div>
        <div class="prod-top">
          <div class="prod-media reveal">
            <figure class="prod-main"><img id="pgMain" src="{img}" alt="{alt}" width="{w}" height="{h}" data-zoom /></figure>
          </div>
          <div class="prod-buy reveal">
            <span class="prod-kicker">{kicker}</span>
            <h1>{name}</h1>
            <p class="prod-meta"><span class="prod-sku">{b_sku} <b id="pkgSku" data-pkg-sku>{sku}</b></span> <span class="prod-stock" id="pkgStock" data-pkg-stock>{b_stock}</span></p>
            <p class="prod-lead">{lead}</p>
            <div class="buy-box">
              <p class="pd-price"><strong id="pkgPrice" data-pkg-price>₺</strong> <span class="pd-alt" id="pkgAlt" data-pkg-alt></span> <em class="pd-disc" data-pkg-cart></em></p>
              <p class="pd-vat" data-pkg-vat>{b_vat}</p>
              <p class="pd-havale">💰 <span>{b_havale}</span> <b id="pkgHavale" data-pkg-havale>₺</b></p>
              <div class="buy-row">
                <div class="qbox qbox-lg">
                  <button type="button" data-q="-1" aria-label="{b_dec}">−</button>
                  <input type="text" inputmode="numeric" value="1" aria-label="{b_qty}" data-qty-input />
                  <button type="button" data-q="1" aria-label="{b_inc}">+</button>
                </div>
                <a class="btn btn-buy" href="sepet.html" data-pkg-cta data-add-cart>{b_add}</a>
              </div>
              <div class="buy-row2">
                <a class="btn btn-ghost" href="sepet.html" data-add-cart-go>{b_buy}</a>
                <a class="btn btn-ghost" href="iletisim.html" data-pkg-wa>{b_wa}</a>
              </div>
            </div>
            <ul class="buy-info">
              <li>🚚 <span data-pkg-ship>{b_ship}</span></li>
              <li>⏱️ <span>{b_eta} <b id="shipDays">2–5</b> {b_days}</span></li>
              <li>🔄 <span>{b_ret} <b id="returnDays">14</b> {b_retd}</span></li>{info}
            </ul>
            <div class="prod-chips">{chips}</div>
          </div>
        </div>
      </div>
    </section>
""".format(name=esc(p["name"]), img=p["img"], alt=attr(P["alt"]), w=w, h=h, kicker=esc(P["kicker"]),
           sku=esc(k(p.get("sku", ""))), lead=esc(P["lead"]), info=info, chips=chips,
           **{"b_" + key: esc(val) for key, val in TXT_BUY.items()})


def tabs_section(P):
    about = "".join("<p>%s</p>" % esc(x) for x in P["about"])
    rows = "".join("<tr><td>%s</td><td>%s</td></tr>" % (esc(a), esc(b)) for a, b in P["specs"])
    gq, gl = P["gloss"]
    kargo = "".join("\n              <li>%s</li>" % esc(x) for x in KARGO)
    return """    <section class="section prod-tabs-sec">
      <div class="container">
        <div class="ptabs reveal" role="tablist" aria-label="Ürün bilgileri">
          <button type="button" class="active" role="tab" aria-selected="true" data-ptab="acik">Açıklama</button>
          <button type="button" role="tab" aria-selected="false" data-ptab="teknik">Teknik Özellikler</button>
          <button type="button" role="tab" aria-selected="false" data-ptab="kargo">Kargo ve İade</button>
        </div>
        <div class="ptab-wrap reveal">
          <div class="ptab-panel active" role="tabpanel" data-ptabpanel="acik">%s</div>
          <div class="ptab-panel" role="tabpanel" data-ptabpanel="teknik">
            <table class="spec-table"><tbody>%s</tbody></table>
            <p class="ptab-note">%s</p>
            <p class="ptab-note">%s <a href="%s">GES Sözlüğü →</a></p>
          </div>
          <div class="ptab-panel" role="tabpanel" data-ptabpanel="kargo">
            <ul class="ticks">%s
            </ul>
          </div>
        </div>
      </div>
    </section>
""" % (about, rows, esc(KAYNAK), esc(gq), gl, kargo)


def head_block(kicker, h2, p=None):
    return ('<div class="section-head reveal"><span class="kicker">%s</span><h2>%s</h2>%s</div>'
            % (esc(kicker), esc(h2), ("<p>%s</p>" % esc(p)) if p else ""))


def sec(inner, narrow=False):
    return ('    <section class="section{alt}">\n      <div class="container%s">\n        %s\n      </div>\n    </section>\n'
            % (" narrow" if narrow else "", inner))


def use_block(P):
    cls = "cards cards-4" if len(P["use"]) == 4 else "cards"
    cards = "".join('<article class="card reveal"><div class="card-icon">%s</div><h3>%s</h3><p>%s</p></article>'
                    % (ico, esc(h), esc(p)) for ico, h, p in P["use"])
    return head_block(SEC["use_k"], SEC["use_h"], P["use_p"]) + '<div class="%s">%s</div>' % (cls, cards)


def how_block(P):
    lis = []
    for i, (ico, title, sub) in enumerate(P["flow"]):
        cls = ' class="is-here"' if i == P["flow_here"] else ""
        lis.append('<li%s><span class="flow-ico" aria-hidden="true">%s</span><b>%s</b><small>%s</small></li>'
                   % (cls, ico, esc(title), esc(sub)))
    flow = '<ol class="flow reveal">' + "".join(lis) + "</ol>"
    notes = "".join('<p class="flow-note reveal">%s</p>' % esc(n) for n in P["flow_notes"])
    st = P["steps"]
    steps = ('<ol class="steps%s">' % (" steps-3" if len(st) == 3 else "") +
             "".join('<li class="reveal"><span class="step-no">%d</span><h3>%s</h3><p>%s</p></li>' % (i + 1, esc(h), esc(p))
                     for i, (h, p) in enumerate(st)) + "</ol>")
    tips = ('<div class="how-note reveal"><strong>%s</strong><ul class="ticks">%s</ul></div>'
            % (esc(SEC["tips"]), "".join("<li>%s</li>" % esc(x) for x in P["tips"])))
    return head_block(SEC["how_k"], SEC["how_h"], P["how_p"]) + flow + notes + steps + tips


def fit_block(P):
    f = P["fit"]
    th = "".join("<th>%s</th>" % esc(x) for x in f["heads"])
    rows = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % esc(c) for c in r) for r in f["rows"])
    return (head_block(f["k"], f["h"], f["p"]) +
            '<div class="spec-wrap reveal"><table class="spec-table fit-table"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, rows) +
            '<p class="flow-note reveal">%s</p>' % esc(f["note"]))


def cmp_block(P):
    c = P["cmp"]
    th = "".join("<th>%s</th>" % esc(x) for x in c["heads"])
    trs = []
    for pid, url, cells in c["rows"]:
        if pid == P["id"]:
            first = '%s <span class="cmp-cur">%s</span>' % (esc(cells[0]), esc(BU_URUN))
            cls = ' class="is-cur"'
        else:
            first = '<a href="%s">%s</a>' % (url, esc(cells[0]))
            cls = ""
        trs.append("<tr%s><td>%s</td>%s</tr>" % (cls, first, "".join("<td>%s</td>" % esc(x) for x in cells[1:])))
    return (head_block(SEC["cmp_k"], SEC["cmp_h"], c["p"]) +
            '<div class="spec-wrap reveal"><table class="spec-table cmp-table"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, "".join(trs)) +
            '<ul class="ticks cmp-tips reveal">%s</ul>' % "".join("<li>%s</li>" % esc(x) for x in c["tips"]))


def xsell_block(P, pk):
    cards = []
    for pid, reason in P["xsell"]:
        p = pk[pid]
        url = p.get("url")
        href = url if url else "sepet.html?ekle=" + pid
        rel = "" if url else ' rel="nofollow"'
        w, h = img_size(p["img"])
        cards.append(
            '<a class="card shop-card reveal" href="%s"%s><div class="shop-media"><img src="%s" alt="%s" width="%d" height="%d" loading="lazy" decoding="async" /></div>'
            '<div class="shop-body"><h3 data-pkg-name="%s">%s</h3><p>%s</p><span class="shop-price" data-pkg-list="%s"></span><span class="shop-link">%s</span></div></a>'
            % (href, rel, p["img"], attr(p["name"]), w, h, pid, esc(p["name"]), esc(reason), pid,
               esc(URUNU_INCELE if url else SEPETE_EKLE)))
    return head_block(SEC["x_k"], SEC["x_h"], SEC["x_p"]) + '<div class="shop-grid xsell">%s</div>' % "".join(cards)


def faq_block(P):
    items = []
    for q, a in P["faq"]:
        paras = a if isinstance(a, list) else [a]
        body = "".join(x if x.startswith("<p>") else "<p>%s</p>" % esc(x) for x in paras)
        items.append('<div class="faq-item reveal"><button class="faq-q"><span>%s</span><span class="faq-ico">+</span></button><div class="faq-a">%s</div></div>'
                     % (esc(q), body))
    return head_block(SEC["faq_k"], SEC["faq_h"]) + '<div class="faq">%s</div>' % "".join(items)


def main_html(P, pk):
    parts = [buy_section(P, pk), tabs_section(P)]
    blocks = [(use_block(P), False), (how_block(P), False)]
    if P.get("cmp"):
        blocks.append((cmp_block(P), False))
    if P.get("fit"):
        blocks.append((fit_block(P), True))
    blocks.append((xsell_block(P, pk), False))
    blocks.append((faq_block(P), True))
    for i, (inner, narrow) in enumerate(blocks):
        parts.append(sec(inner, narrow).replace("{alt}", " section-alt" if i % 2 == 0 else ""))
    nh, np_, nl, nt = P["note"]
    parts.append('    <section class="section"><div class="container"><div class="how-note reveal" style="max-width:720px"><strong>%s</strong><p>%s</p>'
                 '<p><a href="%s" style="color:var(--green);font-weight:700">%s</a></p></div></div></section>\n' % (esc(nh), esc(np_), nl, esc(nt)))
    parts.append('\n    <section class="cta-band"><div class="container cta-inner reveal"><div><h2>%s</h2><p>%s</p></div>'
                 '<a class="btn btn-lg btn-light" href="sepet.html" data-add-cart-go>%s</a></div></section>\n' % (esc(P["cta"]), esc(CTA_P), esc(CTA_BTN)))
    return '  <main id="main" data-pkg-detail="%s">\n%s  </main>\n' % (P["id"], "\n".join(parts))


def build_page(tpl, P, pk, main):
    cut = tpl.index("</head>")
    head, body = tpl[:cut], tpl[cut:]
    head = re.sub(r"[ \t]*<!-- LD:STATIC[\s\S]*?/LD:STATIC -->\n?", "", head)
    head = head.replace(TEMPLATE[:-5], P["file"][:-5])   # .html + /md/…md
    img = ORIGIN + "/" + pk[P["id"]]["img"]

    def setattr_(h, pat, val):
        new, n = re.subn(pat, lambda m: m.group(1) + attr(val) + m.group(2), h)
        if n != 1:
            sys.exit("şablonda bulunamadı (%d): %s" % (n, pat))
        return new

    new, n = re.subn(r"<title>[\s\S]*?</title>", lambda m: "<title>%s</title>" % esc(P["title"]), head)
    if n != 1:
        sys.exit("şablonda <title> yok")
    head = new
    head = setattr_(head, r'(<meta name="description" content=")[^"]*(")', P["desc"])
    head = setattr_(head, r'(<meta property="og:title" content=")[^"]*(")', P["title"])
    head = setattr_(head, r'(<meta property="og:description" content=")[^"]*(")', P["desc"])
    head = setattr_(head, r'(<meta property="og:image" content=")[^"]*(")', img)
    head = setattr_(head, r'(<meta property="og:image:alt" content=")[^"]*(")', P["alt"])
    head = setattr_(head, r'(<meta name="twitter:image" content=")[^"]*(")', img)
    a = body.index('  <main id="main"')
    b = body.index("  </main>\n") + len("  </main>\n")
    return head + body[:a] + main + body[b:]


# ------------------------------------------------------------ yardımcılar
def node_json(js):
    out = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(out.stderr)
    return json.loads(out.stdout)


def load_packages():
    pk = node_json("const fs=require('fs'),vm=require('vm');const sb={window:{}};"
                   "vm.runInNewContext(fs.readFileSync('assets/config.js','utf8'),sb);"
                   "process.stdout.write(JSON.stringify(sb.window.GESPA.config.packages));")
    return {p["id"]: p for p in pk}


def load_base():
    js = r"""
const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('assets/i18n.js','utf8');
src=src.replace(/\n  \/\/ HAVENSIS:DICT[\s\S]*?\/\/ \/HAVENSIS:DICT\n/,'\n');
const a=src.indexOf('var LS = "gespa-lang";'), b=src.indexOf('var SKIP = ');
if(a<0||b<0) throw new Error('i18n.js çapaları bulunamadı');
const o=vm.runInNewContext(src.slice(a,b)+';({DICT:DICT})',{});
const fx=JSON.parse(fs.readFileSync('content/translation-fixes.json','utf8'));
process.stdout.write(JSON.stringify({DICT:o.DICT,FIX:fx.map(r=>r[0])}));
"""
    d = node_json(js)
    return d["DICT"], set(d["FIX"])


def dict_block(base):
    lines = ["  // HAVENSIS:DICT — Havensis ürün sayfaları; tools/havensis-sayfalar.py ÜRETİR.",
             "  // Elle düzenleme: metni betikte değiştir, betiği --uygula ile çalıştır."]
    for li, lang in enumerate(["en", "de", "ru"]):
        rows = []
        for tr, trs in REG.items():
            v = trs[li]
            if v == tr or tr in base[lang]:
                continue
            rows.append("    %s: %s," % (json.dumps(tr, ensure_ascii=False), json.dumps(v, ensure_ascii=False)))
        lines.append("  Object.assign(DICT.%s, {" % lang)
        lines += rows
        lines.append("  });")
    lines.append("  // /HAVENSIS:DICT")
    return "\n".join(lines) + "\n"


LETTER = re.compile(r"[A-Za-zÀ-ÿĞğİıŞşА-Яа-яЁё]")


def check_translations(html, base):
    """Üretilen <main>'deki her metin düğümü ve alt/aria-label değeri 3 dilde
    karşılık bulmalı (betik kaydı ya da mevcut sözlük)."""
    m = html[html.index('<main id="main"'):html.index("</main>")]
    texts = [x.strip() for x in re.findall(r">([^<>]+)<", m)]
    texts += re.findall(r'(?:alt|aria-label)="([^"]+)"', m)
    miss = []
    for x in texts:
        x = x.replace("&amp;", "&").replace("&quot;", '"')
        if not x or not LETTER.search(x):
            continue
        for li, lang in enumerate(["en", "de", "ru"]):
            if x in REG or x in base[lang]:
                continue
            miss.append((lang, x))
    return miss


def main():
    apply = "--uygula" in sys.argv
    pk = load_packages()
    base, fix = load_base()
    tpl = open(os.path.join(ROOT, TEMPLATE), encoding="utf-8").read()
    pages = {}
    problems = 0
    for P in PRODUCTS:
        if P["id"] not in pk:
            sys.exit("config.packages'te yok: " + P["id"])
        if pk[P["id"]].get("desc") not in DESC:
            sys.exit("config desc değişti (%s): betikteki DESC metnini ve çevirilerini güncelle" % P["id"])
        if pk[P["id"]].get("url") != P["file"]:
            sys.exit("config url uyuşmuyor (%s): %r ≠ %r" % (P["id"], pk[P["id"]].get("url"), P["file"]))
        html = build_page(tpl, P, pk, main_html(P, pk))
        miss = check_translations(html, base)
        for lang, x in miss:
            print("ÇEVİRİ EKSİK [%s] %s: %s" % (lang, P["file"], x[:90]))
        problems += len(miss)
        pages[P["file"]] = html
    diff = [(tr, lang) for tr, trs in REG.items() for li, lang in enumerate(["en", "de", "ru"])
            if tr in base[lang] and trs[li] != tr and base[lang][tr] != trs[li]]
    for tr, lang in diff:
        print("not: sözlükte farklı çeviri var, mevcut korunur [%s] %s" % (lang, tr[:70]))
    for tr in REG:
        if tr in fix:
            print("not: translation-fixes.json bu anahtarı eziyor: %s" % tr[:70])
    block = dict_block(base)
    n_keys = sum(1 for ln in block.split("\n") if ln.startswith("    \""))
    print("%d sayfa, %d kayıtlı metin, sözlüğe %d yeni satır" % (len(pages), len(REG), n_keys))
    if problems:
        sys.exit("DUR: %d eksik çeviri" % problems)
    if not apply:
        print("DRY-RUN: yazılmadı (--uygula ile yaz)")
        return
    for f, html in pages.items():
        with open(os.path.join(ROOT, f), "w", encoding="utf-8", newline="") as fh:
            fh.write(html)
    src = open(I18N, encoding="utf-8").read()
    src = re.sub(r"\n  // HAVENSIS:DICT[\s\S]*?// /HAVENSIS:DICT\n", "\n", src)
    i = src.index("  var SKIP = ")
    src = src[:i] + block + src[i:]
    with open(I18N, "w", encoding="utf-8", newline="") as fh:
        fh.write(src)
    print("yazıldı: " + ", ".join(pages) + " + assets/i18n.js")


if __name__ == "__main__":
    main()
