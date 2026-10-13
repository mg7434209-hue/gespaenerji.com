#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paneller, TitanX akü, solar kablo ve MC4 ürün sayfaları (9 sayfa) — TEK KAYNAK.

Kullanım:
  python3 tools/urun-sayfalar.py            DRY-RUN: üretir, denetler, yazmaz
  python3 tools/urun-sayfalar.py --uygula   sayfaları ve assets/i18n.js
                                            URUNPAGE:DICT bloğunu yazar
Ardından: node build.js && npm test

KURALLAR
- Teknik değerler config.packages'teki metinlerdendir; onların kaynağı:
  Lexron 285/655 W → kaynak/lexron-*.pdf künyeleri; 460 W ve 240 W →
  işletmenin gönderdiği künyeler (marka YAZILMAZ); TitanX → işletmenin
  gönderdiği ürün bilgisi (paneller.docx). Arçelik 540 W'ın künyesi YOK:
  güç/sınıf/marka dışında değer yazılmaz. 50 W panelin Voc'u yok.
- Seri bağlama önerisi Voc × 1,1 (soğuk payı) ile hesaplanır ve sayfada
  "kesin dizilimi bizimle kontrol edin" denir.
- Bu betik ayrıca katalog kartlarının (ad, kullanım, açıklama, çip, özellik)
  eksik EN/DE/RU çevirilerini de sözlüğe yazar (CFG listesi).
- HTML bloklarını tools/havensis-sayfalar.py verir; sayfaları ELLE DÜZENLEME.
"""
import importlib.util
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("hv", os.path.join(ROOT, "tools", "havensis-sayfalar.py"))
H = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(H)
k, u = H.k, H.u
HAVENSIS_KEYS = set(H.REG)
BASE = {}


def t(tr, en, de, ru):
    if tr in HAVENSIS_KEYS:
        return tr
    return H.t(tr, en, de, ru)


# ------------------------------------------------------------ katalog metinleri
# config.packages'teki metinlerin eksik çevirileri (kart + Product şeması).
CFG = [
 # Lexron 285 W
 ("Lexron 210R PowerLite TOPCon serisi 285 W monokristal güneş paneli. Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A. Ölçü 780 × 1536 × 30 mm, ağırlık 8,5 kg. IEC 61215 / 61730 / 61701 belgeli; 12 yıl ürün ve işçilik, 30 yıl güç garantisi.",
  "Lexron 210R PowerLite TOPCon series 285 W monocrystalline solar panel. Voc 42.84 V · Isc 8.19 A · Vmp 35.85 V · Imp 7.95 A. Dimensions 780 × 1536 × 30 mm, weight 8.5 kg. IEC 61215 / 61730 / 61701 certified; 12-year product and workmanship, 30-year power warranty.",
  "Lexron 210R PowerLite TOPCon-Serie, 285-W-Monokristallin-Solarmodul. Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A. Maße 780 × 1536 × 30 mm, Gewicht 8,5 kg. Zertifiziert nach IEC 61215 / 61730 / 61701; 12 Jahre Produkt- und Verarbeitungs-, 30 Jahre Leistungsgarantie.",
  "Монокристаллическая солнечная панель 285 Вт серии Lexron 210R PowerLite TOPCon. Voc 42,84 В · Isc 8,19 А · Vmp 35,85 В · Imp 7,95 А. Размеры 780 × 1536 × 30 мм, вес 8,5 кг. Сертификаты IEC 61215 / 61730 / 61701; 12 лет гарантии на изделие и работу, 30 лет на мощность."),
 ("🔆 285 W TOPCon", "🔆 285 W TOPCon", "🔆 285 W TOPCon", "🔆 285 Вт TOPCon"),
 ("⚡ 42,84 V Voc", "⚡ 42.84 V Voc", "⚡ 42,84 V Voc", "⚡ Voc 42,84 В"),
 ("⚖️ 8,5 kg", "⚖️ 8.5 kg", "⚖️ 8,5 kg", "⚖️ 8,5 кг"),
 ("285 W · TOPCon monokristal hücre", "285 W · TOPCon monocrystalline cells", "285 W · TOPCon-Monokristallinzellen", "285 Вт · монокристаллические ячейки TOPCon"),
 ("Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A", "Voc 42.84 V · Isc 8.19 A · Vmp 35.85 V · Imp 7.95 A", "Voc 42,84 V · Isc 8,19 A · Vmp 35,85 V · Imp 7,95 A", "Voc 42,84 В · Isc 8,19 А · Vmp 35,85 В · Imp 7,95 А"),
 ("780 × 1536 × 30 mm · 8,5 kg", "780 × 1536 × 30 mm · 8.5 kg", "780 × 1536 × 30 mm · 8,5 kg", "780 × 1536 × 30 мм · 8,5 кг"),
 ("12 yıl ürün · 30 yıl güç garantisi", "12-year product · 30-year power warranty", "12 Jahre Produkt · 30 Jahre Leistungsgarantie", "12 лет на изделие · 30 лет на мощность"),
 # Lexron 655 W
 ("132 yarım kesim hücreli, N-type TOPCon teknolojili monokristal güneş paneli. 655 W güçte Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A, modül verimi %24,25. Ölçü 2382 × 1134 × 35 mm, ağırlık 31 kg; 3,2 mm AR kaplamalı ısıl güçlendirilmiş cam, 35 mm anotlu alüminyum çerçeve, IP68 bağlantı kutusu. 1500 V sistem gerilimi, 2400 Pa rüzgâr ve 5400 Pa kar yükü dayanımı.",
  "Monocrystalline solar panel with 132 half-cut cells and N-type TOPCon technology. At 655 W: Voc 50.34 V · Vmp 42.32 V · Isc 16.53 A · Imp 15.48 A, module efficiency 24.25%. Dimensions 2382 × 1134 × 35 mm, weight 31 kg; 3.2 mm AR-coated heat-strengthened glass, 35 mm anodised aluminium frame, IP68 junction box. 1500 V system voltage, rated for 2400 Pa wind and 5400 Pa snow load.",
  "Monokristallin-Solarmodul mit 132 Halbzellen und N-Type-TOPCon-Technologie. Bei 655 W: Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A, Modulwirkungsgrad 24,25 %. Maße 2382 × 1134 × 35 mm, Gewicht 31 kg; 3,2 mm AR-beschichtetes, wärmeverstärktes Glas, 35 mm eloxierter Aluminiumrahmen, IP68-Anschlussdose. 1500 V Systemspannung, 2400 Pa Wind- und 5400 Pa Schneelast.",
  "Монокристаллическая солнечная панель со 132 половинчатыми ячейками и технологией N-type TOPCon. При 655 Вт: Voc 50,34 В · Vmp 42,32 В · Isc 16,53 А · Imp 15,48 А, КПД модуля 24,25 %. Размеры 2382 × 1134 × 35 мм, вес 31 кг; термоупрочнённое стекло 3,2 мм с AR-покрытием, анодированная алюминиевая рама 35 мм, распределительная коробка IP68. Напряжение системы 1500 В, ветровая нагрузка 2400 Па, снеговая 5400 Па."),
 ("🔆 655 W N-type TOPCon", "🔆 655 W N-type TOPCon", "🔆 655 W N-Type-TOPCon", "🔆 655 Вт N-type TOPCon"),
 ("📈 %24,25 verim", "📈 24.25% efficiency", "📈 24,25 % Wirkungsgrad", "📈 КПД 24,25 %"),
 ("🛡️ 30 yıl güç garantisi", "🛡️ 30-year power warranty", "🛡️ 30 Jahre Leistungsgarantie", "🛡️ 30 лет гарантии на мощность"),
 ("655 W · N-type TOPCon · 132 yarım kesim hücre", "655 W · N-type TOPCon · 132 half-cut cells", "655 W · N-Type-TOPCon · 132 Halbzellen", "655 Вт · N-type TOPCon · 132 половинчатые ячейки"),
 ("Modül verimi %24,25 · 16 busbar · 0~+5 W tolerans", "Module efficiency 24.25% · 16 busbars · 0~+5 W tolerance", "Modulwirkungsgrad 24,25 % · 16 Busbars · 0~+5 W Toleranz", "КПД модуля 24,25 % · 16 шин · допуск 0~+5 Вт"),
 ("Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A", "Voc 50.34 V · Vmp 42.32 V · Isc 16.53 A · Imp 15.48 A", "Voc 50,34 V · Vmp 42,32 V · Isc 16,53 A · Imp 15,48 A", "Voc 50,34 В · Vmp 42,32 В · Isc 16,53 А · Imp 15,48 А"),
 ("2382 × 1134 × 35 mm · 31 kg · IP68 · 1500 V", "2382 × 1134 × 35 mm · 31 kg · IP68 · 1500 V", "2382 × 1134 × 35 mm · 31 kg · IP68 · 1500 V", "2382 × 1134 × 35 мм · 31 кг · IP68 · 1500 В"),
 ("2400 Pa rüzgâr · 5400 Pa kar yükü dayanımı", "Rated for 2400 Pa wind · 5400 Pa snow load", "2400 Pa Wind- · 5400 Pa Schneelast", "Ветер 2400 Па · снег 5400 Па"),
 ("12 yıl ürün · 30 yıl güç garantisi (yıllık %0,45 kayıp)", "12-year product · 30-year power warranty (0.45% annual loss)", "12 Jahre Produkt · 30 Jahre Leistungsgarantie (0,45 % jährlicher Verlust)", "12 лет на изделие · 30 лет на мощность (потеря 0,45 % в год)"),
 # 460 / 240 çipleri
 ("⚖️ 25 kg", "⚖️ 25 kg", "⚖️ 25 kg", "⚖️ 25 кг"),
 ("🔆 240 W", "🔆 240 W", "🔆 240 W", "🔆 240 Вт"),
 ("⚖️ 8 kg", "⚖️ 8 kg", "⚖️ 8 kg", "⚖️ 8 кг"),
 # Arçelik 540 W
 ("Arçelik marka 540 W A sınıf monokristal güneş paneli. Yetkili tedarik, orijinal ürün; çatı ve arazi tipi kurulumlar için uygundur. Ayrıntılı teknik künye ve palet bazında toptan sevkiyat için bize ulaşın.",
  "Arçelik 540 W grade-A monocrystalline solar panel. Authorised supply, original product; suitable for rooftop and ground-mounted installations. Contact us for the detailed datasheet and wholesale shipment by the pallet.",
  "Arçelik 540-W-Monokristallin-Solarmodul der Klasse A. Autorisierte Beschaffung, Originalprodukt; geeignet für Dach- und Freiflächenanlagen. Für das ausführliche Datenblatt und Großhandelslieferungen palettenweise kontaktieren Sie uns.",
  "Монокристаллическая солнечная панель Arçelik 540 Вт класса A. Официальные поставки, оригинальный товар; подходит для крышных и наземных установок. За подробным паспортом и оптовыми поставками паллетами обращайтесь к нам."),
 ("🔆 540 W", "🔆 540 W", "🔆 540 W", "🔆 540 Вт"),
 ("🏷️ A sınıf", "🏷️ Grade A", "🏷️ Klasse A", "🏷️ Класс A"),
 ("🇹🇷 Arçelik", "🇹🇷 Arçelik", "🇹🇷 Arçelik", "🇹🇷 Arçelik"),
 ("540 W · A sınıf monokristal", "540 W · grade-A monocrystalline", "540 W · Monokristallin Klasse A", "540 Вт · монокристалл класса A"),
 ("Arçelik — yetkili tedarik, orijinal ürün", "Arçelik — authorised supply, original product", "Arçelik — autorisierte Beschaffung, Originalprodukt", "Arçelik — официальные поставки, оригинальный товар"),
 ("Çatı ve arazi tipi kurulumlara uygun", "Suitable for rooftop and ground-mounted installations", "Geeignet für Dach- und Freiflächenanlagen", "Подходит для крышных и наземных установок"),
 ("Palet bazında toptan sevkiyat mümkün", "Wholesale shipment by the pallet possible", "Großhandelslieferung palettenweise möglich", "Возможны оптовые поставки паллетами"),
 # TitanX
 ("51,2 V 102 Ah (5,22 kWh) LiFePO₄ enerji depolama aküsü. 16S1P prizmatik hücre yapısı, dahili akıllı BMS ile aşırı şarj/deşarj, aşırı akım, kısa devre ve sıcaklık koruması. 100 A sürekli deşarj, 150 A tepe (5 sn); 6000+ çevrim ömrü (%80 DoD). CAN/RS485 ve Bluetooth veya WiFi haberleşme; 16 adede kadar paralel bağlanabilir. Ağırlık 37 kg, ölçü 560 × 150 × 380 mm, IP20, M8 terminal, 2 yıl garanti.",
  "51.2 V 102 Ah (5.22 kWh) LiFePO₄ energy storage battery. 16S1P prismatic cell layout, built-in smart BMS with overcharge/over-discharge, overcurrent, short-circuit and temperature protection. 100 A continuous discharge, 150 A peak (5 s); 6000+ cycle life (80% DoD). CAN/RS485 and Bluetooth or WiFi communication; up to 16 units in parallel. Weight 37 kg, dimensions 560 × 150 × 380 mm, IP20, M8 terminals, 2-year warranty.",
  "LiFePO₄-Energiespeicherakku 51,2 V 102 Ah (5,22 kWh). Prismatischer 16S1P-Zellaufbau, integriertes intelligentes BMS mit Schutz vor Über-/Tiefentladung, Überstrom, Kurzschluss und Temperatur. 100 A Dauerentladung, 150 A Spitze (5 s); über 6000 Zyklen (80 % DoD). CAN/RS485 und Bluetooth oder WLAN; bis zu 16 Einheiten parallel. Gewicht 37 kg, Maße 560 × 150 × 380 mm, IP20, M8-Anschlüsse, 2 Jahre Garantie.",
  "Аккумулятор для хранения энергии LiFePO₄ 51,2 В 102 А·ч (5,22 кВт·ч). Призматические ячейки по схеме 16S1P, встроенная умная BMS с защитой от перезаряда/переразряда, перегрузки по току, короткого замыкания и перегрева. Длительный разряд 100 А, пиковый 150 А (5 с); ресурс 6000+ циклов (80 % DoD). Связь CAN/RS485 и Bluetooth или WiFi; до 16 модулей параллельно. Вес 37 кг, размеры 560 × 150 × 380 мм, IP20, клеммы M8, гарантия 2 года."),
 ("🔋 5,22 kWh", "🔋 5.22 kWh", "🔋 5,22 kWh", "🔋 5,22 кВт·ч"),
 ("⚡ 51,2 V · 102 Ah", "⚡ 51.2 V · 102 Ah", "⚡ 51,2 V · 102 Ah", "⚡ 51,2 В · 102 А·ч"),
 ("♻️ 6000+ çevrim", "♻️ 6000+ cycles", "♻️ 6000+ Zyklen", "♻️ 6000+ циклов"),
 ("51,2 V · 102 Ah · 5,22 kWh · LiFePO₄ (16S1P prizmatik)", "51.2 V · 102 Ah · 5.22 kWh · LiFePO₄ (16S1P prismatic)", "51,2 V · 102 Ah · 5,22 kWh · LiFePO₄ (16S1P prismatisch)", "51,2 В · 102 А·ч · 5,22 кВт·ч · LiFePO₄ (16S1P, призматические)"),
 ("Dahili akıllı BMS — aşırı şarj/deşarj, kısa devre, sıcaklık koruması", "Built-in smart BMS — overcharge/over-discharge, short-circuit and temperature protection", "Integriertes intelligentes BMS — Schutz vor Über-/Tiefentladung, Kurzschluss und Temperatur", "Встроенная умная BMS — защита от перезаряда/переразряда, КЗ и перегрева"),
 ("100 A sürekli deşarj · 150 A tepe (5 sn) · 100 A şarj", "100 A continuous discharge · 150 A peak (5 s) · 100 A charge", "100 A Dauerentladung · 150 A Spitze (5 s) · 100 A Ladung", "Разряд 100 А длительно · 150 А пик (5 с) · заряд 100 А"),
 ("6000+ çevrim ömrü (%80 DoD, 25 °C) · 2 yıl garanti", "6000+ cycle life (80% DoD, 25 °C) · 2-year warranty", "Über 6000 Zyklen (80 % DoD, 25 °C) · 2 Jahre Garantie", "Ресурс 6000+ циклов (80 % DoD, 25 °C) · гарантия 2 года"),
 ("CAN / RS485 · Bluetooth veya WiFi · 16 adede kadar paralel", "CAN / RS485 · Bluetooth or WiFi · up to 16 in parallel", "CAN / RS485 · Bluetooth oder WLAN · bis zu 16 parallel", "CAN / RS485 · Bluetooth или WiFi · до 16 параллельно"),
 ("37 kg · 560 × 150 × 380 mm · IP20 · M8 terminal", "37 kg · 560 × 150 × 380 mm · IP20 · M8 terminals", "37 kg · 560 × 150 × 380 mm · IP20 · M8-Anschlüsse", "37 кг · 560 × 150 × 380 мм · IP20 · клеммы M8"),
 # Kablo
 ("Güneş paneli ile şarj kontrol cihazı arasındaki bağlantı için 5 metre siyah + 5 metre kırmızı solar kablo takımı. Kesit stok durumuna göre 4 mm2 veya 6 mm2 gelir; bu sistemlerde ikisi de uygundur. Elektrikli motor güneş paketlerinin standart kalemidir.",
  "Solar cable set of 5 metres black + 5 metres red for connecting the solar panel to the charge controller. The cross-section is 4 mm2 or 6 mm2 depending on stock; both suit these systems. A standard item in our EV solar sets.",
  "Solarkabelset aus 5 m schwarzem + 5 m rotem Kabel für die Verbindung zwischen Solarmodul und Laderegler. Der Querschnitt ist je nach Lager 4 mm2 oder 6 mm2; beide eignen sich für diese Anlagen. Standardbestandteil unserer Solar-Sets für Elektrofahrzeuge.",
  "Комплект солнечного кабеля 5 м чёрного + 5 м красного для соединения солнечной панели с контроллером заряда. Сечение 4 мм2 или 6 мм2 в зависимости от наличия; для этих систем подходят оба. Стандартный элемент наших солнечных комплектов для электротранспорта."),
 ("📏 5 m + 5 m", "📏 5 m + 5 m", "📏 5 m + 5 m", "📏 5 м + 5 м"),
 ("⚫🔴 Siyah + kırmızı", "⚫🔴 Black + red", "⚫🔴 Schwarz + Rot", "⚫🔴 Чёрный + красный"),
 ("☀️ Solar kablo", "☀️ Solar cable", "☀️ Solarkabel", "☀️ Солнечный кабель"),
 ("Panel – şarj kontrol cihazı bağlantısı", "Panel – charge controller connection", "Verbindung Modul – Laderegler", "Соединение панель – контроллер заряда"),
 ("Elektrikli motor güneş paketlerine dahildir", "Included in our EV solar sets", "In unseren Solar-Sets für Elektrofahrzeuge enthalten", "Входит в наши солнечные комплекты для электротранспорта"),
 # MC4
 ("Güneş paneli çıkış kablosu ile solar kabloyu birleştiren erkek-dişi MC4 konnektör takımı. Elektrikli motor güneş paketlerine 1 takım dahildir.",
  "Male-female MC4 connector set that joins the solar panel's output cable to the solar cable. One set is included in our EV solar sets.",
  "MC4-Steckerset (Stecker + Buchse), das das Ausgangskabel des Solarmoduls mit dem Solarkabel verbindet. In unseren Solar-Sets für Elektrofahrzeuge ist ein Set enthalten.",
  "Набор разъёмов MC4 (папа-мама) для соединения выходного кабеля солнечной панели с солнечным кабелем. Один набор входит в наши солнечные комплекты для электротранспорта."),
 ("🔗 1 takım", "🔗 1 set", "🔗 1 Set", "🔗 1 комплект"),
 ("⚡ Erkek + dişi", "⚡ Male + female", "⚡ Stecker + Buchse", "⚡ Папа + мама"),
 ("☀️ Panel bağlantısı", "☀️ Panel connection", "☀️ Modulanschluss", "☀️ Подключение панели"),
 ("1 takım erkek + dişi MC4 konnektör", "1 set of male + female MC4 connectors", "1 Set MC4-Stecker + -Buchse", "1 комплект разъёмов MC4 папа + мама"),
 ("Panel kablosu – solar kablo bağlantısı", "Panel cable – solar cable connection", "Verbindung Modulkabel – Solarkabel", "Соединение кабель панели – солнечный кабель"),
]
for row in CFG:
    t(*row)

# ------------------------------------------------------------ ortak metinler
KAYNAK = {
 "kunye": t("Değerler üreticinin teknik künyesinden alınmıştır. Künyede olmayan bir değeri merak ediyorsanız bize yazın; üreticiden teyit edelim.",
            "Values are taken from the manufacturer's datasheet. If you need a value that isn't listed, write to us and we'll confirm it with the manufacturer.",
            "Die Werte stammen aus dem Datenblatt des Herstellers. Wenn Sie einen hier nicht aufgeführten Wert benötigen, schreiben Sie uns; wir klären ihn mit dem Hersteller.",
            "Значения взяты из паспорта производителя. Если нужного значения нет, напишите нам — уточним у производителя."),
 "yok": t("Bu ürünün üretici künyesi elimizde yok; güç, sınıf ve marka dışındaki değerler için bize yazın, üreticiden teyit edelim.",
          "We do not have the manufacturer's datasheet for this product; for values other than power, grade and brand, write to us and we'll confirm with the manufacturer.",
          "Das Herstellerdatenblatt liegt uns für dieses Produkt nicht vor; für Werte außer Leistung, Klasse und Marke schreiben Sie uns, wir klären sie mit dem Hersteller.",
          "Паспорта производителя на этот товар у нас нет; кроме мощности, класса и марки, значения уточните у нас — мы сверим их с производителем."),
 "aku": t("Değerler ürünün teknik bilgi sayfasından alınmıştır. Listede olmayan bir değer için bize yazın.",
          "Values are taken from the product's technical information sheet. For any value not listed, write to us.",
          "Die Werte stammen aus dem technischen Informationsblatt des Produkts. Für nicht aufgeführte Werte schreiben Sie uns.",
          "Значения взяты из технического описания изделия. Если нужного значения нет, напишите нам."),
 "aks": t("Kablo kesiti stok durumuna göre 4 mm² veya 6 mm² gönderilir; bu sistemlerde ikisi de uygundur.",
          "The cable cross-section is 4 mm² or 6 mm² depending on stock; both suit these systems.",
          "Der Kabelquerschnitt ist je nach Lager 4 mm² oder 6 mm²; beide eignen sich für diese Anlagen.",
          "Сечение кабеля 4 мм² или 6 мм² в зависимости от наличия; для этих систем подходят оба."),
}
ROW = {
    "marka": "Marka", "model": "Model",
    "guc": t("Güç", "Power", "Leistung", "Мощность"),
    "hucre": t("Hücre", "Cells", "Zellen", "Ячейки"),
    "voc": k("Voc"), "vmp": k("Vmp"), "isc": k("Isc"), "imp": k("Imp"),
    "verim": t("Modül verimi", "Module efficiency", "Modulwirkungsgrad", "КПД модуля"),
    "olcu": t("Ölçü", "Dimensions", "Maße", "Размеры"),
    "agirlik": t("Ağırlık", "Weight", "Gewicht", "Вес"),
    "sistem": t("Maks. sistem gerilimi", "Max. system voltage", "Max. Systemspannung", "Макс. напряжение системы"),
    "dayanim": t("Mekanik dayanım", "Mechanical load", "Mechanische Belastbarkeit", "Механическая нагрузка"),
    "kutu": t("Bağlantı kutusu", "Junction box", "Anschlussdose", "Распределительная коробка"),
    "cam": t("Cam ve çerçeve", "Glass and frame", "Glas und Rahmen", "Стекло и рама"),
    "belge": t("Belgeler", "Certificates", "Zertifikate", "Сертификаты"),
    "garanti": t("Garanti", "Warranty", "Garantie", "Гарантия"),
    "sicaklik": t("Sıcaklık", "Temperature", "Temperatur", "Температура"),
    "sinif": t("Sınıf", "Grade", "Klasse", "Класс"),
    "sistemv": t("Kullanım", "Use", "Verwendung", "Применение"),
    "diger": t("Diğer teknik değerler", "Other technical values", "Weitere technische Werte", "Другие технические параметры"),
}
SOR = t("Üretici künyesinden teyit edilir — bize yazın", "Confirmed from the manufacturer's datasheet — write to us",
        "Werden anhand des Herstellerdatenblatts bestätigt — schreiben Sie uns", "Уточняются по паспорту производителя — напишите нам")
DASH = k("—")
Q_KUR = (t("Kurulumu kim yapar, Antalya dışına gönderiyor musunuz?", "Who installs it, and do you ship outside Antalya?",
           "Wer installiert ihn, und liefern Sie auch außerhalb von Antalya?", "Кто выполняет монтаж и отправляете ли вы за пределы Анталии?"),
         t("Türkiye'nin her yerine kargo ile gönderiyoruz. Antalya bölgesinde isteğe bağlı yerinde kurulum yapıyoruz; diğer illerde bağlantıyı telefonla birlikte planlıyoruz.",
           "We ship anywhere in Türkiye. In the Antalya region we offer optional on-site installation; elsewhere we plan the wiring with you by phone.",
           "Wir versenden in die ganze Türkei. In der Region Antalya bieten wir optional die Montage vor Ort an; anderswo planen wir den Anschluss telefonisch mit Ihnen.",
           "Отправляем по всей Турции. В регионе Анталии возможен монтаж на месте; в других регионах планируем подключение вместе с вами по телефону."))
XS = {
    "kablo": t("Panel ile cihaz arasındaki bağlantı için.", "For the connection between panel and controller.", "Für die Verbindung zwischen Modul und Regler.", "Для соединения панели с контроллером."),
    "mc4": t("Panel kablosunu solar kabloya bağlamak için.", "To join the panel cable to the solar cable.", "Um das Modulkabel mit dem Solarkabel zu verbinden.", "Чтобы соединить кабель панели с солнечным кабелем."),
    "mppt100": t("100 V panel girişli MPPT; küçük ve orta sistemler.", "MPPT with 100 V panel input; small and medium systems.", "MPPT mit 100-V-Moduleingang; kleine und mittlere Anlagen.", "MPPT со входом панелей 100 В; малые и средние системы."),
    "mppt150": t("150 V panel girişli MPPT; 48 V'a kadar akü.", "MPPT with 150 V panel input; batteries up to 48 V.", "MPPT mit 150-V-Moduleingang; Batterien bis 48 V.", "MPPT со входом панелей 150 В; АКБ до 48 В."),
    "boost": t("Elektrikli araçlar için 24–72 V BOOST MPPT.", "24–72 V BOOST MPPT for electric vehicles.", "24–72-V-BOOST-MPPT für Elektrofahrzeuge.", "BOOST MPPT 24–72 В для электротранспорта."),
    "pwm": t("Küçük 12/24 V sistemler için ekonomik PWM.", "Economical PWM for small 12/24 V systems.", "Günstiger PWM für kleine 12/24-V-Anlagen.", "Экономичный ШИМ для небольших систем 12/24 В."),
    "titanx": t("48 V sistem için 5,22 kWh LiFePO₄ akü.", "5.22 kWh LiFePO₄ battery for a 48 V system.", "5,22-kWh-LiFePO₄-Akku für ein 48-V-System.", "Аккумулятор LiFePO₄ 5,22 кВт·ч для системы 48 В."),
    "p655": t("Büyük sistemler için yüksek güçlü panel.", "A high-power panel for large systems.", "Ein leistungsstarkes Modul für große Anlagen.", "Мощная панель для больших систем."),
    "p285": t("Dar alanlar için kompakt TOPCon panel.", "A compact TOPCon panel for tight spaces.", "Ein kompaktes TOPCon-Modul für wenig Platz.", "Компактная панель TOPCon для ограниченного места."),
    "mppt80": t("12–48 V akülerle 80 A MPPT.", "80 A MPPT for 12–48 V batteries.", "80-A-MPPT für 12–48-V-Batterien.", "MPPT 80 А для АКБ 12–48 В."),
}

# ------------------------------------------------------------ paneller
PANELS = [
    # id, dosya, güç, Voc (None = künye yok), ölçü, ağırlık
    ("panel-50w", "panel-50w.html", 50, None, None, None),
    ("panel-240w", "panel-240w.html", 240, 36.12, "1320 × 776 × 30 mm", "8 kg"),
    ("panel-lexron-285w", "panel-lexron-285w.html", 285, 42.84, "780 × 1536 × 30 mm", "8,5 kg"),
    ("panel-460w", "panel-460w.html", 460, 51.90, "2095 × 1039 × 30 mm", "25 kg"),
    ("panel-arcelik-540w", "panel-arcelik-540w.html", 540, None, None, None),
    ("panel-lexron-655w", "panel-lexron-655w.html", 655, 50.34, "2382 × 1134 × 35 mm", "31 kg"),
]
PANEL_SPECS = {
    "panel-50w": [("guc", "50 W"), ("hucre", "monokristal"), ("sistemv", "12 V"), ("diger", None)],
    "panel-240w": [("guc", "240 W"), ("hucre", "48"), ("voc", "36,12 V"), ("vmp", "30,23 V"), ("isc", "8,15 A"), ("imp", "7,94 A"),
                   ("sistem", "1500 V"), ("olcu", "1320 × 776 × 30 mm"), ("agirlik", "8 kg"), ("belge", "CE · IEC")],
    "panel-lexron-285w": [("guc", "285 W"), ("hucre", "TOPCon monokristal"), ("voc", "42,84 V"), ("vmp", "35,85 V"), ("isc", "8,19 A"), ("imp", "7,95 A"),
                          ("olcu", "780 × 1536 × 30 mm"), ("agirlik", "8,5 kg"), ("belge", "IEC 61215 / 61730 / 61701"), ("garanti", "12y/30y")],
    "panel-460w": [("guc", "460 W"), ("hucre", "144 yarım"), ("voc", "51,90 V"), ("vmp", "43,50 V"), ("isc", "10,84 A"), ("imp", "10,58 A"),
                   ("verim", "%23,42"), ("sistem", "1500 V"), ("olcu", "2095 × 1039 × 30 mm"), ("agirlik", "25 kg"),
                   ("kutu", "IP68"), ("dayanim", "2400/5400/dolu"), ("sicaklik", "−0,29")],
    "panel-arcelik-540w": [("guc", "540 W"), ("sinif", "A"), ("hucre", "monokristal"), ("diger", None)],
    "panel-lexron-655w": [("guc", "655 W"), ("hucre", "132 yarım TOPCon"), ("voc", "50,34 V"), ("vmp", "42,32 V"), ("isc", "16,53 A"), ("imp", "15,48 A"),
                          ("verim", "%24,25"), ("sistem", "1500 V"), ("olcu", "2382 × 1134 × 35 mm"), ("agirlik", "31 kg"),
                          ("kutu", "IP68"), ("cam", "3,2 mm"), ("dayanim", "2400/5400"), ("garanti", "12y/30y")],
}
VAL = {
    "monokristal": t("Monokristal", "Monocrystalline", "Monokristallin", "Монокристалл"),
    "48": t("48 hücre", "48 cells", "48 Zellen", "48 ячеек"),
    "TOPCon monokristal": t("TOPCon monokristal", "TOPCon monocrystalline", "TOPCon monokristallin", "Монокристалл TOPCon"),
    "144 yarım": t("144 yarım hücre (half-cut), çoklu busbar", "144 half-cut cells, multi-busbar", "144 Halbzellen (Half-Cut), Multi-Busbar", "144 половинчатые ячейки (half-cut), multi-busbar"),
    "132 yarım TOPCon": t("132 yarım hücre, N-type TOPCon, 16 busbar", "132 half-cut cells, N-type TOPCon, 16 busbars", "132 Halbzellen, N-Type-TOPCon, 16 Busbars", "132 половинчатые ячейки, N-type TOPCon, 16 шин"),
    "12 V": t("12 V akü şarjı", "12 V battery charging", "12-V-Batterieladung", "Зарядка АКБ 12 В"),
    "A": t("A sınıf", "Grade A", "Klasse A", "Класс A"),
    "12y/30y": t("12 yıl ürün · 30 yıl güç", "12-year product · 30-year power", "12 Jahre Produkt · 30 Jahre Leistung", "12 лет на изделие · 30 лет на мощность"),
    "IP68": t("IP68, 3 bypass diyot", "IP68, 3 bypass diodes", "IP68, 3 Bypass-Dioden", "IP68, 3 байпасных диода"),
    "2400/5400/dolu": t("2400 Pa rüzgâr · 5400 Pa kar · 25 mm dolu", "2400 Pa wind · 5400 Pa snow · 25 mm hail", "2400 Pa Wind · 5400 Pa Schnee · 25 mm Hagel", "Ветер 2400 Па · снег 5400 Па · град 25 мм"),
    "2400/5400": t("2400 Pa rüzgâr · 5400 Pa kar", "2400 Pa wind · 5400 Pa snow", "2400 Pa Wind · 5400 Pa Schnee", "Ветер 2400 Па · снег 5400 Па"),
    "3,2 mm": t("3,2 mm AR kaplamalı cam · 35 mm anotlu alüminyum", "3.2 mm AR-coated glass · 35 mm anodised aluminium", "3,2 mm AR-beschichtetes Glas · 35 mm eloxiertes Aluminium", "Стекло 3,2 мм с AR-покрытием · анодированный алюминий 35 мм"),
    "−0,29": t("Pmax −0,29 %/°C · çalışma −40…+85 °C", "Pmax −0.29 %/°C · operating −40…+85 °C", "Pmax −0,29 %/°C · Betrieb −40…+85 °C", "Pmax −0,29 %/°C · работа −40…+85 °C"),
}


def pval(key, v):
    if v is None:
        return SOR
    if v in VAL:
        return VAL[v]
    return u(v)


def series(voc, limit):
    return max(0, math.floor(limit / (voc * 1.1)))


def panel_product(pk, pid, file, w, voc, olcu, kg):
    p = pk[pid]
    name = p["name"]
    lexron = pid.startswith("panel-lexron")
    big = w >= 400
    specs = [(ROW["marka"], k(p["brand"])) if p.get("brand") else None]
    specs = [s for s in specs if s]
    specs += [(ROW[a], pval(a, v)) for a, v in PANEL_SPECS[pid]]
    fr = p["for"]
    tr_ = lambda lang: BASE[lang].get(fr) or (H.REG[fr][["en", "de", "ru"].index(lang)] if fr in H.REG else fr)
    lead = t("%d W güneş paneli — %s." % (w, fr),
             "%d W solar panel — %s." % (w, tr_("en")),
             "%d-W-Solarmodul — %s." % (w, tr_("de")),
             "Солнечная панель %d Вт — %s." % (w, tr_("ru")))
    about = [p["desc"],
             t("Panel tek başına doğrudan aküye bağlanmaz: arada bir şarj kontrol cihazı (akülü sistem) ya da inverter (şebeke bağlantılı sistem) bulunur. Aşağıda bu panele uygun cihazları ve seri bağlama sınırlarını bulabilirsiniz.",
               "A panel is never connected straight to a battery: a charge controller (battery system) or an inverter (grid-tied system) sits in between. Below you'll find suitable devices for this panel and its series-wiring limits.",
               "Ein Modul wird nie direkt an eine Batterie angeschlossen: Dazwischen sitzt ein Laderegler (Batteriesystem) oder ein Wechselrichter (Netzanlage). Unten finden Sie passende Geräte für dieses Modul und die Grenzen der Reihenschaltung.",
               "Панель никогда не подключают напрямую к аккумулятору: между ними стоит контроллер заряда (система с АКБ) или инвертор (сетевая система). Ниже — подходящие устройства для этой панели и пределы последовательного соединения.")]
    # SSS
    faq = []
    if voc:
        n100, n150 = series(voc, 100), series(voc, 150)
        fit60 = voc * 1.1 < 60
        vs = ("%g" % voc).replace(".", ",")
        tr = "Panelin Voc değeri %s V. Soğukta Voc yükseldiği için %%10 pay bırakarak hesaplarsak: 100 V panel girişli MPPT cihazlara (ör. Havensis Solar-30AMPS) en fazla %d, 150 V girişli cihazlara (ör. Havensis Solar-60AMPS 150|60) en fazla %d panel seri bağlanır.%s Kesin dizilimi sipariş öncesi bizimle kontrol edin." % (
            vs, n100, n150, " Tek panel, elektrikli araç paketlerimizdeki BOOST MPPT'nin 15–60 V girişine de uyar." if fit60 else "")
        en = "The panel's Voc is %s V. Allowing 10%% for the rise of Voc in the cold: up to %d panels in series on MPPT controllers with a 100 V panel input (e.g. Havensis Solar-30AMPS), up to %d on 150 V inputs (e.g. Havensis Solar-60AMPS 150|60).%s Check the exact layout with us before ordering." % (
            ("%g" % voc), n100, n150, " A single panel also fits the 15–60 V input of the BOOST MPPT in our EV solar sets." if fit60 else "")
        de = "Die Voc des Moduls beträgt %s V. Mit 10 %% Reserve für den Anstieg der Voc bei Kälte: an MPPT-Reglern mit 100-V-Moduleingang (z. B. Havensis Solar-30AMPS) höchstens %d, an 150-V-Eingängen (z. B. Havensis Solar-60AMPS 150|60) höchstens %d Module in Reihe.%s Prüfen Sie den genauen Aufbau vor der Bestellung mit uns." % (
            vs, n100, n150, " Ein einzelnes Modul passt auch an den 15–60-V-Eingang des BOOST MPPT aus unseren E-Fahrzeug-Sets." if fit60 else "")
        ru = "Voc панели — %s В. С запасом 10 %% на рост Voc в холод: к MPPT-контроллерам со входом 100 В (например, Havensis Solar-30AMPS) последовательно не более %d, ко входам 150 В (например, Havensis Solar-60AMPS 150|60) — не более %d панелей.%s Точную схему согласуйте с нами до заказа." % (
            vs, n100, n150, " Одна панель подходит и ко входу 15–60 В контроллера BOOST MPPT из наших комплектов для электротранспорта." if fit60 else "")
        faq.append((t("Kaç panel seri bağlayabilirim?", "How many panels can I wire in series?", "Wie viele Module kann ich in Reihe schalten?", "Сколько панелей можно соединить последовательно?"),
                    t(tr, en, de, ru)))
    else:
        faq.append((t("Teknik künyesini alabilir miyim?", "Can I get the datasheet?", "Kann ich das Datenblatt bekommen?", "Можно получить паспорт?"),
                    t("Bu panelin ayrıntılı künyesi sitede yok. WhatsApp'tan yazın; Voc, Isc, ölçü ve ağırlık gibi değerleri üreticiden teyit edip iletelim.",
                      "This panel's detailed datasheet is not on the site. Write to us on WhatsApp and we'll confirm values such as Voc, Isc, dimensions and weight with the manufacturer.",
                      "Das ausführliche Datenblatt dieses Moduls steht nicht auf der Website. Schreiben Sie uns per WhatsApp; wir klären Werte wie Voc, Isc, Maße und Gewicht mit dem Hersteller.",
                      "Подробного паспорта этой панели на сайте нет. Напишите нам в WhatsApp — уточним у производителя Voc, Isc, размеры и вес.")))
    faq.append((t("Paneli doğrudan aküye bağlayabilir miyim?", "Can I connect the panel straight to a battery?", "Kann ich das Modul direkt an eine Batterie anschließen?", "Можно ли подключить панель прямо к аккумулятору?"),
                t("Hayır. Panel ile akü arasında mutlaka bir şarj kontrol cihazı bulunur; aksi hâlde akü aşırı şarj olur. Panel gerilimi akü geriliminin çok üstündeyse MPPT, yakınsa PWM cihaz seçin.",
                  "No. There must always be a charge controller between the panel and the battery; otherwise the battery gets overcharged. If the panel voltage is well above the battery voltage choose MPPT, if it is close choose PWM.",
                  "Nein. Zwischen Modul und Batterie gehört immer ein Laderegler, sonst wird die Batterie überladen. Liegt die Modulspannung deutlich über der Batteriespannung, wählen Sie MPPT, liegt sie nahe daran, PWM.",
                  "Нет. Между панелью и аккумулятором обязательно ставится контроллер заряда, иначе аккумулятор перезарядится. Если напряжение панели намного выше напряжения АКБ — выбирайте MPPT, если близко — ШИМ.")))
    if big:
        faq.append((t("Büyük paneller nasıl gönderiliyor?", "How are large panels shipped?", "Wie werden große Module versandt?", "Как отправляются большие панели?"),
                    t("Büyük paneller kırılmaya karşı korumalı paketle kargo ya da ambarla gönderilir. Teslim alırken paketi görevli önünde kontrol edin; hasarlı üründe tüm masraflar bize aittir. Palet bazında toptan sevkiyat için bize yazın.",
                      "Large panels are shipped by courier or freight in breakage-protected packaging. Check the package in front of the courier on delivery; for damaged goods all costs are ours. For wholesale shipment by the pallet, write to us.",
                      "Große Module werden bruchsicher verpackt per Paketdienst oder Spedition versandt. Prüfen Sie das Paket bei der Übergabe vor dem Zusteller; bei beschädigter Ware tragen wir alle Kosten. Für palettenweise Großhandelslieferungen schreiben Sie uns.",
                      "Большие панели отправляются курьером или грузовой службой в упаковке, защищающей от поломки. При получении проверьте посылку при курьере; при повреждении все расходы несём мы. Об оптовых поставках паллетами — напишите нам.")))
    faq.append(Q_KUR)
    others = [x for x in PANELS]
    rows = []
    for oid, ofile, ow, ovoc, oolcu, okg in others:
        rows.append((oid, ofile, [pk[oid]["name"], u("%d W" % ow),
                                  u(("%g V" % ovoc).replace(".", ",")) if ovoc else DASH, u(oolcu) if oolcu else DASH, u(okg) if okg else DASH]))
    xs = ([("havensis-s60amps150", XS["mppt150"]), ("lexron-mppt-80a-hv", XS["mppt80"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])] if big else
          ([("lexron-pwm-20a", XS["pwm"]), ("lexron-mppt-20a", XS["mppt100"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])] if w <= 50 else
           [("havensis-s30amps", XS["mppt100"]), ("boost-mppt", XS["boost"]), ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])]))
    return {
        "id": pid, "file": file, "kaynak": KAYNAK["kunye" if voc else "yok"],
        "title": "%s | GESPA Enerji" % name,
        "desc": "%s: %s Türkiye'nin her yerine kargo." % (name, p["for"]),
        "alt": t("%s — ürün fotoğrafı" % name, "%s — product photo" % name, "%s — Produktfoto" % name, "%s — фото товара" % name),
        "kicker": t("🔆 Güneş Paneli", "🔆 Solar Panel", "🔆 Solarmodul", "🔆 Солнечная панель"),
        "lead": lead,
        "info": [("🔌", t("Şarj kontrol cihazı ve kablo ürüne dahil değildir.", "Charge controller and cables are not included.",
                          "Laderegler und Kabel sind nicht im Lieferumfang enthalten.", "Контроллер заряда и кабели в комплект не входят."))],
        "chips": p["chips"], "about": about, "specs": specs,
        "gloss": (t("Voc, Isc ve monokristal nedir?", "What do Voc, Isc and monocrystalline mean?", "Was bedeuten Voc, Isc und monokristallin?", "Что такое Voc, Isc и монокристалл?"), "sozluk.html#voc-isc"),
        "use": [
            ("🏡", t("Akülü (off-grid) sistemler", "Battery (off-grid) systems", "Batteriesysteme (Insel)", "Системы с АКБ (автономные)"),
             t("Şarj kontrol cihazı ve aküyle bağ evi, karavan ve kulübe.", "Country houses, caravans and cabins with a charge controller and battery.", "Ferienhäuser, Wohnmobile und Hütten mit Laderegler und Batterie.", "Дачи, автодома и домики с контроллером заряда и АКБ.")),
            ("🏭", t("Çatı ve arazi GES", "Rooftop and ground PV", "Dach- und Freiflächen-PV", "Крышные и наземные СЭС"),
             t("İnverterle şebekeye bağlı sistemler.", "Grid-tied systems with an inverter.", "Netzgekoppelte Anlagen mit Wechselrichter.", "Сетевые системы с инвертором.")),
            ("🛺", t("Elektrikli araçlar", "Electric vehicles", "Elektrofahrzeuge", "Электротранспорт"),
             t("BOOST MPPT ile triportör ve golf aracı şarjı.", "Charging e-trikes and golf carts with BOOST MPPT.", "Laden von E-Dreirädern und Golfcarts mit BOOST MPPT.", "Зарядка трициклов и гольф-каров через BOOST MPPT.")),
            ("🌱", t("Tarım ve sulama", "Farming and irrigation", "Landwirtschaft und Bewässerung", "Сельское хозяйство и полив"),
             t("Pompa ve tarla sistemleri.", "Pumps and field systems.", "Pumpen und Feldanlagen.", "Насосы и полевые системы.")),
        ],
        "use_p": t("Panel; akülü, şebeke bağlantılı ve araç üstü sistemlerin enerji kaynağıdır.",
                   "The panel is the energy source of battery, grid-tied and vehicle-mounted systems.",
                   "Das Modul ist die Energiequelle von Batterie-, Netz- und Fahrzeuganlagen.",
                   "Панель — источник энергии для систем с АКБ, сетевых и установленных на транспорте."),
        "how_p": t("Panel şarj kontrol cihazına (akülü sistem) ya da inverterin panel girişine (şebeke bağlantılı sistem) bağlanır.",
                   "The panel connects to a charge controller (battery system) or to an inverter's panel input (grid-tied system).",
                   "Das Modul wird an einen Laderegler (Batteriesystem) oder an den Moduleingang eines Wechselrichters (Netzanlage) angeschlossen.",
                   "Панель подключается к контроллеру заряда (система с АКБ) или ко входу панелей инвертора (сетевая система)."),
        "flow": [("☀️", t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"), u("%d W" % w)),
                 ("🔗", k("MC4"), t("solar kablo", "solar cable", "Solarkabel", "солнечный кабель")),
                 ("📟", t("Şarj kontrol / inverter", "Charge controller / inverter", "Laderegler / Wechselrichter", "Контроллер / инвертор"), t("MPPT · PWM", "MPPT · PWM", "MPPT · PWM", "MPPT · ШИМ")),
                 ("🔋", t("Akü / şebeke", "Battery / grid", "Batterie / Netz", "АКБ / сеть"), t("sisteme göre", "by system", "je nach Anlage", "по системе"))],
        "flow_here": 0, "flow_notes": [],
        "steps": [
            (t("Konum seçin", "Choose the spot", "Den Standort wählen", "Выберите место"),
             t("Güneye bakan, gün boyu gölge düşmeyen bir yer seçin; kısmi gölge bile üretimi belirgin düşürür.",
               "Choose a south-facing spot without shade all day; even partial shade noticeably cuts output.",
               "Wählen Sie einen nach Süden ausgerichteten, ganztägig schattenfreien Ort; schon Teilschatten senkt den Ertrag deutlich.",
               "Выберите место с южной ориентацией без тени в течение дня; даже частичная тень заметно снижает выработку.")),
            (t("Sabitleyin", "Fix it in place", "Befestigen", "Закрепите"),
             t("Paneli çerçevesindeki montaj deliklerinden uygun bir konstrüksiyona sabitleyin; camdan ya da bağlantı kutusundan yük bindirmeyin.",
               "Fix the panel to a suitable mounting structure through the holes in its frame; never put load on the glass or the junction box.",
               "Befestigen Sie das Modul über die Montagelöcher im Rahmen an einer geeigneten Unterkonstruktion; belasten Sie nie das Glas oder die Anschlussdose.",
               "Крепите панель к подходящей конструкции через монтажные отверстия рамы; не нагружайте стекло и распределительную коробку.")),
            (t("Bağlayın", "Connect it", "Anschließen", "Подключите"),
             t("MC4 konnektörlerle solar kabloya bağlayın; seri bağlarken panellerin Voc toplamı cihazın panel giriş sınırını aşmasın.",
               "Connect to the solar cable with MC4 connectors; in series wiring, the sum of the panels' Voc must not exceed the device's panel input limit.",
               "Schließen Sie es mit MC4-Steckern an das Solarkabel an; bei Reihenschaltung darf die Summe der Voc die Eingangsgrenze des Geräts nicht überschreiten.",
               "Подключите к солнечному кабелю разъёмами MC4; при последовательном соединении сумма Voc панелей не должна превышать предел входа устройства.")),
        ],
        "tips": [
            t("Paneli tozdan ve yapraktan arındırın; kirli cam üretimi düşürür.", "Keep the panel free of dust and leaves; dirty glass lowers output.",
              "Halten Sie das Modul frei von Staub und Laub; verschmutztes Glas senkt den Ertrag.", "Очищайте панель от пыли и листьев: грязное стекло снижает выработку."),
            t("Kışın −10 °C'nin altına düşen bölgelerde seri dizilimi bizimle kontrol edin; Voc soğukta yükselir.", "In areas that drop below −10 °C in winter, check the series layout with us; Voc rises in the cold.",
              "In Gegenden, in denen es im Winter unter −10 °C geht, prüfen Sie den Reihenaufbau mit uns; Voc steigt bei Kälte.", "В районах, где зимой ниже −10 °C, согласуйте последовательную схему с нами: в холод Voc растёт."),
        ],
        "cmp": {"p": t("Mağazamızdaki tüm paneller; tire (—) olan değerin künyesi elimizde yok.",
                       "All panels in our shop; a dash (—) means we do not have that value's datasheet.",
                       "Alle Module in unserem Shop; ein Strich (—) bedeutet, dass uns der Wert nicht vorliegt.",
                       "Все панели нашего магазина; прочерк (—) означает, что паспорта этого значения у нас нет."),
                "heads": [t("Model", "Model", "Modell", "Модель"), t("Güç", "Power", "Leistung", "Мощность"), k("Voc"),
                          t("Ölçü", "Dimensions", "Maße", "Размеры"), t("Ağırlık", "Weight", "Gewicht", "Вес")],
                "rows": rows,
                "tips": [t("Araç çatısı ve dar alan için 240–460 W panellere bakın.", "For vehicle roofs and tight spaces, look at the 240–460 W panels.",
                           "Für Fahrzeugdächer und wenig Platz sehen Sie sich die 240–460-W-Module an.", "Для крыш транспорта и ограниченного места — панели 240–460 Вт."),
                         t("Çatı ve arazi sistemlerinde 540–655 W paneller watt başına daha ekonomiktir.", "For rooftop and ground systems the 540–655 W panels are more economical per watt.",
                           "Für Dach- und Freiflächenanlagen sind die 540–655-W-Module pro Watt günstiger.", "Для крышных и наземных систем панели 540–655 Вт выгоднее в пересчёте на ватт.")]},
        "xsell": xs, "faq": faq,
        "note": (t("Sisteminizi birlikte kuralım", "Let's build your system together", "Lassen Sie uns Ihre Anlage gemeinsam planen", "Соберём систему вместе"),
                 t("Kaç panel, hangi akü ve inverter gerektiğini Sistem Kurucu ile birkaç adımda görün.",
                   "See how many panels, which battery and which inverter you need in a few steps with the System Builder.",
                   "Sehen Sie mit dem System-Konfigurator in wenigen Schritten, wie viele Module und welche Batterie und welcher Wechselrichter nötig sind.",
                   "Узнайте за несколько шагов в конструкторе систем, сколько панелей, какой аккумулятор и инвертор нужны."),
                 "sistem-kur.html",
                 t("Sistem Kurucu'yu açın →", "Open the System Builder →", "System-Konfigurator öffnen →", "Открыть конструктор систем →")),
        "cta": t("Paneli bugün sipariş edin", "Order the panel today", "Bestellen Sie das Modul noch heute", "Закажите панель сегодня"),
    }


# ------------------------------------------------------------ TitanX akü
def titanx(pk):
    pid = "aku-titanx-51v-102ah"
    p = pk[pid]
    sp = [
        (ROW["marka"], k("TitanX")),
        (t("Nominal gerilim", "Nominal voltage", "Nennspannung", "Номинальное напряжение"), u("51,2 V")),
        (t("Kapasite", "Capacity", "Kapazität", "Ёмкость"), u("102 Ah")),
        (t("Enerji", "Energy", "Energie", "Энергия"), t("5,22 kWh", "5.22 kWh", "5,22 kWh", "5,22 кВт·ч")),
        (t("Kimya / hücre", "Chemistry / cells", "Chemie / Zellen", "Химия / ячейки"), t("LiFePO₄ · 16S1P prizmatik", "LiFePO₄ · 16S1P prismatic", "LiFePO₄ · 16S1P prismatisch", "LiFePO₄ · 16S1P призматические")),
        (t("Maks. şarj gerilimi", "Max. charging voltage", "Max. Ladespannung", "Макс. напряжение заряда"), u("58,4 V")),
        (t("Deşarj kesme gerilimi", "Discharge cut-off voltage", "Entladeschlussspannung", "Напряжение отсечки разряда"), u("40 V")),
        (t("Sürekli / tepe deşarj", "Continuous / peak discharge", "Dauer- / Spitzenentladung", "Длительный / пиковый разряд"), t("100 A / 150 A (5 sn)", "100 A / 150 A (5 s)", "100 A / 150 A (5 s)", "100 А / 150 А (5 с)")),
        (t("Maks. şarj akımı", "Max. charging current", "Max. Ladestrom", "Макс. ток заряда"), u("100 A")),
        (t("Çevrim ömrü", "Cycle life", "Zyklenlebensdauer", "Ресурс циклов"), t("6000+ (%80 DoD, 25 °C)", "6000+ (80% DoD, 25 °C)", "6000+ (80 % DoD, 25 °C)", "6000+ (80 % DoD, 25 °C)")),
        (k("BMS"), t("Dahili akıllı BMS", "Built-in smart BMS", "Integriertes intelligentes BMS", "Встроенная умная BMS")),
        (t("Haberleşme", "Communication", "Kommunikation", "Связь"), t("CAN / RS485 · Bluetooth veya WiFi", "CAN / RS485 · Bluetooth or WiFi", "CAN / RS485 · Bluetooth oder WLAN", "CAN / RS485 · Bluetooth или WiFi")),
        (t("Paralel bağlantı", "Parallel connection", "Parallelschaltung", "Параллельное подключение"), t("16 adede kadar", "Up to 16 units", "Bis zu 16 Einheiten", "До 16 модулей")),
        (t("Çalışma sıcaklığı", "Operating temperature", "Betriebstemperatur", "Рабочая температура"), t("Şarj 0~50 °C · deşarj −20~60 °C", "Charge 0~50 °C · discharge −20~60 °C", "Laden 0~50 °C · Entladen −20~60 °C", "Заряд 0~50 °C · разряд −20~60 °C")),
        (ROW["olcu"], u("560 × 150 × 380 mm")), (ROW["agirlik"], u("37 kg")),
        (t("Koruma sınıfı / terminal", "Protection / terminals", "Schutzart / Anschlüsse", "Защита / клеммы"), t("IP20 · M8 terminal", "IP20 · M8 terminals", "IP20 · M8-Anschlüsse", "IP20 · клеммы M8")),
        (ROW["garanti"], t("2 yıl", "2 years", "2 Jahre", "2 года")),
    ]
    faq = [
        (t("Hangi inverterle çalışır?", "Which inverters does it work with?", "Mit welchen Wechselrichtern arbeitet er?", "С какими инверторами работает?"),
         t("48 V akü girişli inverterlerle çalışır. CAN / RS485 haberleşmesi olan inverterlerde akü bilgisi inverterle paylaşılır; inverterinizin modelini bize yazın, uyumu sipariş öncesi kontrol edelim.",
           "It works with inverters that have a 48 V battery input. With inverters that support CAN / RS485, battery data is shared with the inverter; send us your inverter model and we'll check compatibility before you order.",
           "Er arbeitet mit Wechselrichtern mit 48-V-Batterieeingang. Bei Wechselrichtern mit CAN / RS485 werden die Batteriedaten geteilt; schicken Sie uns Ihr Wechselrichtermodell, wir prüfen die Kompatibilität vor der Bestellung.",
           "Работает с инверторами с входом АКБ 48 В. Если инвертор поддерживает CAN / RS485, данные аккумулятора передаются инвертору; пришлите модель инвертора — проверим совместимость до заказа.")),
        (t("Kapasiteyi artırabilir miyim?", "Can I add capacity later?", "Kann ich die Kapazität erweitern?", "Можно ли увеличить ёмкость?"),
         t("Evet, 16 adede kadar paralel bağlanabilir. Her akü 5,22 kWh eklediği için örneğin 2 akü yaklaşık 10,4 kWh, 4 akü yaklaşık 20,9 kWh depolar.",
           "Yes, up to 16 units can be connected in parallel. Each battery adds 5.22 kWh, so for example 2 batteries store about 10.4 kWh and 4 batteries about 20.9 kWh.",
           "Ja, bis zu 16 Einheiten lassen sich parallel schalten. Jede Batterie bringt 5,22 kWh, also speichern z. B. 2 Batterien etwa 10,4 kWh und 4 Batterien etwa 20,9 kWh.",
           "Да, параллельно можно подключить до 16 модулей. Каждый добавляет 5,22 кВт·ч: например, 2 аккумулятора — около 10,4 кВт·ч, 4 — около 20,9 кВт·ч.")),
        (t("Şarj cihazımı nasıl ayarlamalıyım?", "How should I set my charger?", "Wie stelle ich mein Ladegerät ein?", "Как настроить зарядное устройство?"),
         t("Maksimum şarj gerilimi 58,4 V, deşarj kesme gerilimi 40 V, maksimum şarj akımı 100 A'dir. Şarj kontrol cihazınızı ya da inverterinizi bu değerlerin içinde kalacak şekilde ayarlayın.",
           "The maximum charging voltage is 58.4 V, the discharge cut-off voltage 40 V and the maximum charging current 100 A. Set your charge controller or inverter to stay within these values.",
           "Die maximale Ladespannung beträgt 58,4 V, die Entladeschlussspannung 40 V und der maximale Ladestrom 100 A. Stellen Sie Laderegler oder Wechselrichter so ein, dass diese Werte eingehalten werden.",
           "Максимальное напряжение заряда — 58,4 В, напряжение отсечки разряда — 40 В, максимальный ток заряда — 100 А. Настройте контроллер или инвертор в этих пределах.")),
        (t("Nereye yerleştirilmeli?", "Where should it be installed?", "Wo sollte er aufgestellt werden?", "Где его устанавливать?"),
         t("Kuru, havadar ve kapalı bir yere yerleştirin; koruma sınıfı IP20'dir, açık havaya uygun değildir. Şarj 0~50 °C aralığında yapılmalıdır.",
           "Install it in a dry, ventilated indoor place; its protection class is IP20, so it is not suitable for outdoors. Charging must take place between 0 and 50 °C.",
           "Stellen Sie ihn an einem trockenen, belüfteten Ort im Innenbereich auf; die Schutzart ist IP20, für draußen ist er nicht geeignet. Geladen werden darf zwischen 0 und 50 °C.",
           "Устанавливайте в сухом проветриваемом помещении: класс защиты IP20, на улице использовать нельзя. Заряжать — при 0~50 °C.")),
        Q_KUR,
    ]
    return {
        "id": pid, "file": "aku-titanx-51v-102ah.html", "kaynak": KAYNAK["aku"],
        "title": "%s | GESPA Enerji" % p["name"],
        "desc": "TitanX 51,2 V 102 Ah (5,22 kWh) LiFePO₄ enerji depolama aküsü: dahili BMS, 6000+ çevrim, CAN/RS485, 16 adede kadar paralel. Türkiye'nin her yerine kargo.",
        "alt": t("%s — ürün fotoğrafı" % p["name"], "%s — product photo" % p["name"], "%s — Produktfoto" % p["name"], "%s — фото товара" % p["name"]),
        "kicker": t("🔋 Enerji Depolama", "🔋 Energy Storage", "🔋 Energiespeicher", "🔋 Накопитель энергии"),
        "lead": t("51,2 V 102 Ah LiFePO₄ akü: ev ve iş yerinde güneş enerjisini depolar, kesintide yedek güç sağlar. 16 adede kadar paralel bağlanarak büyütülebilir.",
                  "51.2 V 102 Ah LiFePO₄ battery: stores solar energy at home and at work and provides backup power during outages. Expandable with up to 16 units in parallel.",
                  "51,2 V 102 Ah LiFePO₄-Akku: speichert Solarenergie zu Hause und im Betrieb und liefert bei Ausfällen Notstrom. Erweiterbar mit bis zu 16 Einheiten parallel.",
                  "Аккумулятор LiFePO₄ 51,2 В 102 А·ч: накапливает солнечную энергию дома и на работе, даёт резервное питание при отключениях. Расширяется до 16 модулей параллельно."),
        "info": [("🏷️", t("Marka: TitanX", "Brand: TitanX", "Marke: TitanX", "Марка: TitanX")), ("🛡️", t("2 yıl garanti", "2-year warranty", "2 Jahre Garantie", "Гарантия 2 года"))],
        "chips": p["chips"],
        "about": [p["desc"],
                  t("LiFePO₄ (lityum demir fosfat) kimyası uzun çevrim ömrü ve yüksek güvenlik sunar; dahili BMS hücreleri dengeler ve aküyü aşırı şarj, aşırı deşarj, aşırı akım, kısa devre ve sıcaklığa karşı korur.",
                    "LiFePO₄ (lithium iron phosphate) chemistry offers long cycle life and high safety; the built-in BMS balances the cells and protects the battery against overcharge, over-discharge, overcurrent, short circuit and temperature.",
                    "Die LiFePO₄-Chemie (Lithium-Eisenphosphat) bietet lange Zyklenlebensdauer und hohe Sicherheit; das integrierte BMS gleicht die Zellen aus und schützt vor Über- und Tiefentladung, Überstrom, Kurzschluss und Temperatur.",
                    "Химия LiFePO₄ (литий-железо-фосфат) даёт большой ресурс и высокую безопасность; встроенная BMS балансирует ячейки и защищает от перезаряда, переразряда, перегрузки по току, КЗ и перегрева.")],
        "specs": sp,
        "gloss": (t("LiFePO₄, BMS ve DoD nedir?", "What do LiFePO₄, BMS and DoD mean?", "Was bedeuten LiFePO₄, BMS und DoD?", "Что такое LiFePO₄, BMS и DoD?"), "sozluk.html#lifepo4"),
        "use": [
            ("🏠", t("Ev enerji depolama", "Home energy storage", "Heimspeicher", "Домашнее хранение энергии"),
             t("Gündüz üretilen güneş enerjisini akşam kullanmak için.", "To use daytime solar energy in the evening.", "Um tagsüber erzeugte Solarenergie abends zu nutzen.", "Чтобы использовать дневную солнечную энергию вечером.")),
            ("🏢", t("İş yeri ve UPS", "Business and UPS", "Betrieb und USV", "Бизнес и ИБП"),
             t("Kesintide kesintisiz güç ve yedek enerji.", "Uninterrupted and backup power during outages.", "Unterbrechungsfreie und Notstromversorgung bei Ausfällen.", "Бесперебойное и резервное питание при отключениях.")),
            ("🏡", t("Off-grid sistemler", "Off-grid systems", "Inselanlagen", "Автономные системы"),
             t("Şebekenin olmadığı bağ evi, çiftlik ve tesis.", "Country houses, farms and sites without grid.", "Ferienhäuser, Höfe und Anlagen ohne Netz.", "Дачи, фермы и объекты без сети.")),
            ("🚐", t("Karavan ve tekne", "Caravans and boats", "Wohnmobile und Boote", "Автодома и лодки"),
             t("48 V sistemli karavan, tekne ve iş makineleri.", "Caravans, boats and machines with a 48 V system.", "Wohnmobile, Boote und Maschinen mit 48-V-System.", "Автодома, лодки и техника с системой 48 В.")),
        ],
        "use_p": t("Güneş sisteminin enerjisini depolar, ihtiyaç anında geri verir.", "Stores the solar system's energy and returns it when needed.",
                   "Speichert die Energie der Solaranlage und gibt sie bei Bedarf zurück.", "Накапливает энергию солнечной системы и отдаёт её по необходимости."),
        "how_p": t("Akü, şarj kontrol cihazı ya da hibrit inverter üzerinden şarj olur; inverter yükleri doğrudan aküden besler.",
                   "The battery is charged via a charge controller or a hybrid inverter; the inverter feeds the loads directly from the battery.",
                   "Der Akku wird über einen Laderegler oder Hybridwechselrichter geladen; der Wechselrichter versorgt die Verbraucher direkt aus dem Akku.",
                   "Аккумулятор заряжается через контроллер заряда или гибридный инвертор; инвертор питает нагрузки напрямую от аккумулятора."),
        "flow": [("☀️", t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"), t("DC gerilim", "DC voltage", "DC-Spannung", "напряжение DC")),
                 ("📟", t("Şarj kontrol / hibrit inverter", "Charge controller / hybrid inverter", "Laderegler / Hybridwechselrichter", "Контроллер / гибридный инвертор"), u("48 V")),
                 ("🔋", k("TitanX"), u("51,2 V")),
                 ("🔌", t("Ev ve iş yeri yükleri", "Home and business loads", "Verbraucher in Haus und Betrieb", "Нагрузки дома и на работе"), u("230 V AC"))],
        "flow_here": 2, "flow_notes": [],
        "steps": [
            (t("Yerleştirin", "Place it", "Aufstellen", "Установите"),
             t("Kuru, havadar ve kapalı bir alana, inverterin yakınına yerleştirin.", "Place it in a dry, ventilated indoor area near the inverter.",
               "Stellen Sie ihn an einem trockenen, belüfteten Innenort nahe dem Wechselrichter auf.", "Разместите в сухом проветриваемом помещении рядом с инвертором.")),
            (t("Bağlayın", "Connect it", "Anschließen", "Подключите"),
             t("M8 terminallere uygun kesitte kablo ve sigorta ile inverteri bağlayın; kutupları kontrol edin.",
               "Connect the inverter to the M8 terminals with cable of the right cross-section and a fuse; check the polarity.",
               "Schließen Sie den Wechselrichter mit Kabel passenden Querschnitts und Sicherung an die M8-Anschlüsse an; prüfen Sie die Polarität.",
               "Подключите инвертор к клеммам M8 кабелем нужного сечения через предохранитель; проверьте полярность.")),
            (t("Ayarlayın", "Configure it", "Einstellen", "Настройте"),
             t("İnverterde akü tipini LiFePO₄ seçin, 58,4 V / 40 V sınırlarını girin; destekliyorsa CAN / RS485 haberleşmesini bağlayın.",
               "Set the battery type to LiFePO₄ on the inverter, enter the 58.4 V / 40 V limits and, if supported, connect CAN / RS485 communication.",
               "Wählen Sie im Wechselrichter den Batterietyp LiFePO₄, geben Sie die Grenzen 58,4 V / 40 V ein und verbinden Sie, falls unterstützt, CAN / RS485.",
               "Выберите в инверторе тип АКБ LiFePO₄, задайте пределы 58,4 В / 40 В и, если поддерживается, подключите связь CAN / RS485.")),
        ],
        "tips": [
            t("Paralel bağlantıda aynı model aküleri kullanın.", "Use batteries of the same model in parallel.", "Verwenden Sie bei Parallelschaltung Akkus desselben Modells.", "При параллельном подключении используйте аккумуляторы одной модели."),
            t("Ağırlığı 37 kg'dır; taşırken iki kişi olun.", "It weighs 37 kg; carry it with two people.", "Er wiegt 37 kg; tragen Sie ihn zu zweit.", "Вес 37 кг — переносите вдвоём."),
        ],
        "xsell": [("havensis-s60amps150", XS["mppt150"]), ("lexron-mppt-80a-hv", XS["mppt80"]), ("panel-lexron-655w", XS["p655"]), ("panel-arcelik-540w", XS["p655"])],
        "faq": faq,
        "note": (t("Sisteminizi birlikte kuralım", "Let's build your system together", "Lassen Sie uns Ihre Anlage gemeinsam planen", "Соберём систему вместе"),
                 t("Kaç akü, hangi panel ve inverter gerektiğini Sistem Kurucu ile birkaç adımda görün.",
                   "See how many batteries, which panels and which inverter you need in a few steps with the System Builder.",
                   "Sehen Sie mit dem System-Konfigurator in wenigen Schritten, wie viele Akkus, welche Module und welcher Wechselrichter nötig sind.",
                   "Узнайте за несколько шагов в конструкторе систем, сколько аккумуляторов, какие панели и инвертор нужны."),
                 "sistem-kur.html",
                 t("Sistem Kurucu'yu açın →", "Open the System Builder →", "System-Konfigurator öffnen →", "Открыть конструктор систем →")),
        "cta": t("Aküyü bugün sipariş edin", "Order the battery today", "Bestellen Sie den Akku noch heute", "Закажите аккумулятор сегодня"),
    }


# ------------------------------------------------------------ kablo ve MC4
def accessory(pk, pid):
    p = pk[pid]
    kablo = pid == "kablo-solar-5m"
    if kablo:
        sp = [(t("İçerik", "Contents", "Inhalt", "Комплектация"), t("5 m siyah + 5 m kırmızı solar kablo", "5 m black + 5 m red solar cable", "5 m schwarzes + 5 m rotes Solarkabel", "5 м чёрного + 5 м красного солнечного кабеля")),
              (t("Kesit", "Cross-section", "Querschnitt", "Сечение"), t("4 mm² veya 6 mm² (stoğa göre)", "4 mm² or 6 mm² (depending on stock)", "4 mm² oder 6 mm² (je nach Lager)", "4 мм² или 6 мм² (по наличию)")),
              (ROW["sistemv"], t("Panel – şarj kontrol cihazı bağlantısı", "Panel – charge controller connection", "Verbindung Modul – Laderegler", "Соединение панель – контроллер заряда"))]
        faq = [
            (t("Kablo kesiti kaç mm²?", "What is the cable cross-section?", "Welchen Querschnitt hat das Kabel?", "Какое сечение кабеля?"),
             t("Stok durumuna göre 4 mm² veya 6 mm² gönderilir; elektrikli araç ve küçük akülü sistemlerde ikisi de uygundur. Belirli bir kesit gerekiyorsa sipariş öncesi yazın.",
               "Depending on stock we ship 4 mm² or 6 mm²; both suit EV and small battery systems. If you need a particular cross-section, write to us before ordering.",
               "Je nach Lager liefern wir 4 mm² oder 6 mm²; beide eignen sich für E-Fahrzeuge und kleine Batterieanlagen. Brauchen Sie einen bestimmten Querschnitt, schreiben Sie uns vor der Bestellung.",
               "В зависимости от наличия отправляем 4 мм² или 6 мм²; для электротранспорта и небольших систем с АКБ подходят оба. Если нужно конкретное сечение — напишите до заказа.")),
            (t("MC4 konnektör dahil mi?", "Are MC4 connectors included?", "Sind MC4-Stecker enthalten?", "Входят ли разъёмы MC4?"),
             t("Hayır, MC4 konnektör takımı ayrı üründür; elektrikli araç güneş paketlerimizde ikisi birlikte gelir.",
               "No, the MC4 connector set is a separate product; in our EV solar sets both come together.",
               "Nein, das MC4-Steckerset ist ein eigenes Produkt; in unseren E-Fahrzeug-Solar-Sets kommen beide zusammen.",
               "Нет, набор разъёмов MC4 — отдельный товар; в наших солнечных комплектах для электротранспорта они идут вместе.")),
            Q_KUR]
        name_key = "kablo"
        kicker = t("🔌 Solar Kablo", "🔌 Solar Cable", "🔌 Solarkabel", "🔌 Солнечный кабель")
        lead = t("Panel ile şarj kontrol cihazı arasındaki hat için 5 m siyah + 5 m kırmızı solar kablo takımı.",
                 "A 5 m black + 5 m red solar cable set for the line between panel and charge controller.",
                 "Ein Solarkabelset aus 5 m Schwarz + 5 m Rot für die Leitung zwischen Modul und Laderegler.",
                 "Комплект солнечного кабеля 5 м чёрного + 5 м красного для линии между панелью и контроллером заряда.")
        xs = [("mc4-set", XS["mc4"]), ("boost-mppt", XS["boost"]), ("panel-lexron-285w", XS["p285"]), ("lexron-mppt-30a", XS["mppt100"])]
    else:
        sp = [(t("İçerik", "Contents", "Inhalt", "Комплектация"), t("1 erkek + 1 dişi MC4 konnektör", "1 male + 1 female MC4 connector", "1 MC4-Stecker + 1 MC4-Buchse", "1 разъём MC4 папа + 1 мама")),
              (ROW["sistemv"], t("Panel kablosu – solar kablo bağlantısı", "Panel cable – solar cable connection", "Verbindung Modulkabel – Solarkabel", "Соединение кабель панели – солнечный кабель"))]
        faq = [
            (t("Kaç takım gerekir?", "How many sets do I need?", "Wie viele Sets brauche ich?", "Сколько комплектов нужно?"),
             t("Solar kablonun panele bağlanan her ucu için bir takım (artı ve eksi hat için bir erkek ve bir dişi) yeterlidir. Elektrikli araç güneş paketlerimizde 1 takım gelir.",
               "One set (one male and one female for the plus and minus lines) is enough for each end of solar cable that joins a panel. Our EV solar sets come with 1 set.",
               "Für jedes Solarkabelende, das an ein Modul geht, genügt ein Set (ein Stecker und eine Buchse für Plus- und Minusleitung). Unsere E-Fahrzeug-Sets enthalten 1 Set.",
               "На каждый конец солнечного кабеля, подключаемый к панели, достаточно одного комплекта (папа и мама для плюса и минуса). В наших комплектах для электротранспорта — 1 комплект.")),
            (t("Takmak için alet gerekir mi?", "Do I need a tool to fit them?", "Brauche ich Werkzeug zur Montage?", "Нужен ли инструмент для монтажа?"),
             t("Sağlam ve su geçirmez bir bağlantı için MC4 sıkma pensesi önerilir. Antalya bölgesinde kurulumu biz yapabiliriz.",
               "An MC4 crimping tool is recommended for a solid, watertight connection. In the Antalya region we can do the installation.",
               "Für eine feste, wasserdichte Verbindung empfehlen wir eine MC4-Crimpzange. In der Region Antalya können wir die Montage übernehmen.",
               "Для надёжного влагозащищённого соединения рекомендуется обжимной инструмент для MC4. В регионе Анталии можем выполнить монтаж сами.")),
            Q_KUR]
        name_key = "mc4"
        kicker = t("🔗 Konnektör", "🔗 Connector", "🔗 Stecker", "🔗 Разъём")
        lead = t("Panel çıkış kablosunu solar kabloya bağlayan erkek + dişi MC4 konnektör takımı.",
                 "A male + female MC4 connector set that joins the panel's output cable to the solar cable.",
                 "Ein MC4-Steckerset (Stecker + Buchse), das das Modulausgangskabel mit dem Solarkabel verbindet.",
                 "Набор разъёмов MC4 папа + мама для соединения выходного кабеля панели с солнечным кабелем.")
        xs = [("kablo-solar-5m", XS["kablo"]), ("boost-mppt", XS["boost"]), ("panel-lexron-285w", XS["p285"]), ("lexron-mppt-30a", XS["mppt100"])]
    return {
        "id": pid, "file": pid + ".html", "kaynak": KAYNAK["aks"] if kablo else KAYNAK["aku"],
        "title": "%s | GESPA Enerji" % p["name"], "desc": p["desc"],
        "alt": t("%s — ürün fotoğrafı" % p["name"], "%s — product photo" % p["name"], "%s — Produktfoto" % p["name"], "%s — фото товара" % p["name"]),
        "kicker": kicker, "lead": lead, "info": [], "chips": p["chips"], "about": [p["desc"]], "specs": sp,
        "gloss": (t("MC4 ve dizi nedir?", "What are MC4 and a string?", "Was sind MC4 und ein Strang?", "Что такое MC4 и цепочка?"), "sozluk.html#mc4"),
        "use": [
            ("🛺", t("Elektrikli araç paketleri", "EV solar sets", "E-Fahrzeug-Solar-Sets", "Комплекты для электротранспорта"),
             t("Çatıdaki panelden BOOST MPPT'ye giden hat.", "The line from the roof panel to the BOOST MPPT.", "Die Leitung vom Dachmodul zum BOOST MPPT.", "Линия от панели на крыше к BOOST MPPT.")),
            ("🏡", t("Akülü sistemler", "Battery systems", "Batteriesysteme", "Системы с АКБ"),
             t("Bağ evi, karavan ve kulübe kurulumları.", "Country house, caravan and cabin installations.", "Anlagen in Ferienhaus, Wohnmobil und Hütte.", "Установки на даче, в автодоме и домике.")),
        ],
        "use_p": t("Panel ile cihaz arasındaki bağlantının standart kalemidir.", "A standard item for the connection between panel and device.",
                   "Ein Standardteil für die Verbindung zwischen Modul und Gerät.", "Стандартный элемент для соединения панели с устройством."),
        "how_p": t("Panel kablosu MC4 ile solar kabloya, solar kablo şarj kontrol cihazına bağlanır.",
                   "The panel cable joins the solar cable via MC4, and the solar cable connects to the charge controller.",
                   "Das Modulkabel wird per MC4 mit dem Solarkabel verbunden, das Solarkabel mit dem Laderegler.",
                   "Кабель панели соединяется с солнечным кабелем через MC4, солнечный кабель — с контроллером заряда."),
        "flow": [("☀️", t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"), t("panel kablosu", "panel cable", "Modulkabel", "кабель панели")),
                 ("🔗", k("MC4"), t("erkek + dişi", "male + female", "Stecker + Buchse", "папа + мама")),
                 ("〰️", t("Solar kablo", "Solar cable", "Solarkabel", "Солнечный кабель"), t("siyah − · kırmızı +", "black − · red +", "schwarz − · rot +", "чёрный − · красный +")),
                 ("📟", t("Şarj kontrol cihazı", "Charge controller", "Laderegler", "Контроллер заряда"), t("panel girişi", "panel input", "Moduleingang", "вход панели"))],
        "flow_here": 1 if not kablo else 2, "flow_notes": [],
        "steps": [
            (t("Ölçün", "Measure", "Messen", "Измерьте"),
             t("Panel ile cihaz arasındaki mesafeyi ölçün; kabloyu gereksiz uzun bırakmayın.", "Measure the distance between panel and device; do not leave the cable needlessly long.",
               "Messen Sie den Abstand zwischen Modul und Gerät; lassen Sie das Kabel nicht unnötig lang.", "Измерьте расстояние между панелью и устройством; не оставляйте кабель лишне длинным.")),
            (t("Konnektörü takın", "Fit the connector", "Stecker montieren", "Установите разъём"),
             t("MC4 konnektörü kablo ucuna sıkma pensesiyle takın; artı hatta kırmızı, eksi hatta siyah kablo kullanın.",
               "Crimp the MC4 connector onto the cable end; use red for the plus line and black for the minus line.",
               "Crimpen Sie den MC4-Stecker auf das Kabelende; nehmen Sie Rot für Plus und Schwarz für Minus.",
               "Обожмите разъём MC4 на конце кабеля; для плюса — красный, для минуса — чёрный кабель.")),
            (t("Bağlayın", "Connect it", "Anschließen", "Подключите"),
             t("Önce cihazı aküye, sonra paneli cihaza bağlayın; kutupları kontrol edin.", "Connect the device to the battery first, then the panel to the device; check the polarity.",
               "Schließen Sie zuerst das Gerät an die Batterie und dann das Modul an das Gerät an; prüfen Sie die Polarität.", "Сначала подключите устройство к АКБ, затем панель к устройству; проверьте полярность.")),
        ],
        "tips": [t("Kabloyu keskin kenarlardan ve sıcak yüzeylerden uzak geçirin.", "Route the cable away from sharp edges and hot surfaces.",
                   "Führen Sie das Kabel fern von scharfen Kanten und heißen Flächen.", "Прокладывайте кабель вдали от острых кромок и горячих поверхностей.")],
        "xsell": xs, "faq": faq,
        "note": (t("Hepsi bir arada ister misiniz?", "Want everything in one box?", "Lieber alles in einem Paket?", "Хотите всё в одном комплекте?"),
                 t("Elektrikli araç güneş paketlerimizde panel, BOOST MPPT, kablo ve MC4 birlikte gelir.",
                   "Our EV solar sets bring the panel, BOOST MPPT, cable and MC4 together.",
                   "Unsere E-Fahrzeug-Solar-Sets enthalten Modul, BOOST MPPT, Kabel und MC4 zusammen.",
                   "В наших солнечных комплектах для электротранспорта — панель, BOOST MPPT, кабель и MC4 вместе."),
                 "elektrikli-arac-donusum.html#paketler",
                 t("Motor güneş paketlerine bakın →", "See the EV solar sets →", "Zu den E-Fahrzeug-Solar-Sets →", "Смотреть комплекты для электротранспорта →")),
        "cta": t("Bugün sipariş edin", "Order today", "Heute bestellen", "Закажите сегодня"),
    }


# ------------------------------------------------------------ yazım
def load_base():
    js = r"""
const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('assets/i18n.js','utf8');
src=src.replace(/\n  \/\/ URUNPAGE:DICT[\s\S]*?\/\/ \/URUNPAGE:DICT\n/,'\n');
const a=src.indexOf('var LS = "gespa-lang";'), b=src.indexOf('var SKIP = ');
const o=vm.runInNewContext(src.slice(a,b)+';({DICT:DICT})',{});
process.stdout.write(JSON.stringify(o.DICT));
"""
    return H.node_json(js)


def dict_block(base):
    lines = ["  // URUNPAGE:DICT — panel/akü/kablo/MC4 sayfaları + katalog metinleri; tools/urun-sayfalar.py ÜRETİR.",
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
    lines.append("  // /URUNPAGE:DICT")
    return "\n".join(lines) + "\n"


def main():
    apply = "--uygula" in sys.argv
    global BASE
    pk = H.load_packages()
    base = BASE = load_base()
    tpl = open(os.path.join(ROOT, H.TEMPLATE), encoding="utf-8").read()
    prods = [panel_product(pk, *row) for row in PANELS] + [titanx(pk), accessory(pk, "kablo-solar-5m"), accessory(pk, "mc4-set")]
    pages, problems = {}, 0
    for P in prods:
        if pk[P["id"]].get("url") != P["file"]:
            sys.exit("config url uyuşmuyor (%s): %r ≠ %r" % (P["id"], pk[P["id"]].get("url"), P["file"]))
        H.KAYNAK = P["kaynak"]
        html = H.build_page(tpl, P, pk, H.main_html(P, pk))
        for lang, x in H.check_translations(html, base):
            print("ÇEVİRİ EKSİK [%s] %s: %s" % (lang, P["file"], x[:90]))
            problems += 1
        pages[P["file"]] = html
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
    src = re.sub(r"\n  // URUNPAGE:DICT[\s\S]*?// /URUNPAGE:DICT\n", "\n", src)
    i = src.index("  var SKIP = ")
    src = src[:i] + block + src[i:]
    with open(H.I18N, "w", encoding="utf-8", newline="") as fh:
        fh.write(src)
    print("yazıldı: " + ", ".join(pages) + " + assets/i18n.js")


if __name__ == "__main__":
    main()
