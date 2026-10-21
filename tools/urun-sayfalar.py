#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paneller, TitanX akü, solar kablo, MC4 ve Hero LED aydınlatma ürün sayfaları (15 sayfa) — TEK KAYNAK.

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
 # Hero LED ampul
 ("💡 10 W · 850 lm", "💡 10 W · 850 lm", "💡 10 W · 850 lm", "💡 10 Вт · 850 лм"),
 ("⚡ 12–60 V AC/DC", "⚡ 12–60 V AC/DC", "⚡ 12–60 V AC/DC", "⚡ 12–60 В AC/DC"),
 ("⚪ 6500 K beyaz", "⚪ 6500 K white", "⚪ 6500 K weiß", "⚪ 6500 K белый"),
 ("Karavan, tekne, bağ evi ve akülü güneş sistemleri", "Caravans, boats, country houses and solar battery systems", "Wohnmobile, Boote, Ferienhäuser und solare Batterieanlagen", "Автодома, лодки, дачи и солнечные системы с АКБ"),
 ("Hero LED 10 W 12 V DC LED Ampul (12–60 V AC/DC)", "Hero LED 10 W 12 V DC LED Bulb (12–60 V AC/DC)", "Hero LED 10 W 12 V DC LED-Lampe (12–60 V AC/DC)", "Светодиодная лампа Hero LED 10 Вт 12 В DC (12–60 В AC/DC)"),
 ("12–60 V AC/DC geniş gerilim aralığında çalışan 10 W LED ampul: 850 lümen, 6500 K beyaz ışık. 12 V ve 24 V akülü güneş sistemlerinde, karavanda, teknede ve bağ evinde doğrudan aküden çalışır. Ölçü 60 × 118 mm, çalışma sıcaklığı −20 ~ +55 °C, enerji sınıfı F (10 kWh/1000 saat); ultraviyole ışın içermez.",
  "10 W LED bulb working over a wide 12–60 V AC/DC range: 850 lumens, 6500 K white light. Runs straight from the battery in 12 V and 24 V solar battery systems, caravans, boats and country houses. Size 60 × 118 mm, operating temperature −20 ~ +55 °C, energy class F (10 kWh/1000 h); contains no ultraviolet radiation.",
  "10-W-LED-Lampe für den weiten Bereich 12–60 V AC/DC: 850 Lumen, 6500 K weißes Licht. Läuft direkt an der Batterie in solaren 12-V- und 24-V-Batterieanlagen, Wohnmobilen, Booten und Ferienhäusern. Maße 60 × 118 mm, Betriebstemperatur −20 ~ +55 °C, Energieklasse F (10 kWh/1000 h); ohne UV-Strahlung.",
  "Светодиодная лампа 10 Вт для широкого диапазона 12–60 В AC/DC: 850 люмен, белый свет 6500 K. Работает напрямую от аккумулятора в солнечных системах 12 В и 24 В, автодомах, лодках и на дачах. Размер 60 × 118 мм, рабочая температура −20 ~ +55 °C, класс энергоэффективности F (10 кВт·ч/1000 ч); без ультрафиолета."),
 ("10 W · 850 lümen · 6500 K beyaz ışık", "10 W · 850 lumens · 6500 K white light", "10 W · 850 Lumen · 6500 K weißes Licht", "10 Вт · 850 люмен · белый свет 6500 K"),
 ("12–60 V AC/DC geniş gerilim aralığı", "Wide 12–60 V AC/DC voltage range", "Weiter Spannungsbereich 12–60 V AC/DC", "Широкий диапазон напряжения 12–60 В AC/DC"),
 ("12 V / 24 V akü sistemlerinde doğrudan kullanım", "Direct use on 12 V / 24 V battery systems", "Direkt an 12-V-/24-V-Batteriesystemen nutzbar", "Прямое подключение к системам АКБ 12 В / 24 В"),
 ("60 × 118 mm · −20 ~ +55 °C", "60 × 118 mm · −20 ~ +55 °C", "60 × 118 mm · −20 ~ +55 °C", "60 × 118 мм · −20 ~ +55 °C"),
 ("Enerji sınıfı F · 10 kWh/1000 saat · UV içermez", "Energy class F · 10 kWh/1000 h · no UV", "Energieklasse F · 10 kWh/1000 h · ohne UV", "Класс F · 10 кВт·ч/1000 ч · без УФ"),
 # Hero LED solar sokak
 ("☀️ Güneş panelli", "☀️ Solar panel included", "☀️ Mit Solarmodul", "☀️ С солнечной панелью"),
 ("🚶 Hareket sensörü", "🚶 Motion sensor", "🚶 Bewegungssensor", "🚶 Датчик движения"),
 ("💧 IP65", "💧 IP65", "💧 IP65", "💧 IP65"),
 ("Bahçe, sokak, site, otopark ve fabrika aydınlatması", "Garden, street, estate, car park and factory lighting", "Garten-, Straßen-, Wohnanlagen-, Parkplatz- und Fabrikbeleuchtung", "Освещение садов, улиц, жилых комплексов, парковок и заводов"),
 ("Hero LED 100 W Solar Sokak Armatürü (Sensörlü, Kumandalı)", "Hero LED 100 W Solar Street Light (Sensor, Remote)", "Hero LED 100 W Solar-Straßenleuchte (Sensor, Fernbedienung)", "Солнечный уличный светильник Hero LED 100 Вт (датчик, пульт)"),
 ("Güneş paneliyle şarj olup gece çalışan 100 W solar sokak armatürü (HL-5151): elektrik hattı çekmeden aydınlatma sağlar. SMD LED, 6500 K beyaz ışık, hareket sensörüyle otomatik yanma, uzaktan kumanda, IP65 suya dayanıklılık ve 30.000 saat ömür. Bahçe, sokak, site, otopark ve fabrika aydınlatması için.",
  "100 W solar street light (HL-5151) that charges from its solar panel and works at night: light without running a power line. SMD LEDs, 6500 K white light, automatic switch-on by motion sensor, remote control, IP65 water resistance and a 30,000-hour lifetime. For gardens, streets, estates, car parks and factories.",
  "100-W-Solar-Straßenleuchte (HL-5151), die sich über ihr Solarmodul lädt und nachts leuchtet: Licht ohne Stromleitung. SMD-LEDs, 6500 K weißes Licht, automatisches Einschalten per Bewegungssensor, Fernbedienung, IP65-Wasserschutz und 30.000 Stunden Lebensdauer. Für Gärten, Straßen, Wohnanlagen, Parkplätze und Fabriken.",
  "Солнечный уличный светильник 100 Вт (HL-5151): заряжается от солнечной панели и светит ночью, без прокладки электролинии. SMD-светодиоды, белый свет 6500 K, автоматическое включение по датчику движения, пульт ДУ, защита от воды IP65 и ресурс 30 000 часов. Для садов, улиц, жилых комплексов, парковок и заводов."),
 ("Güneş panelli — elektrik hattı gerektirmez", "Solar panel — no power line needed", "Mit Solarmodul — keine Stromleitung nötig", "С солнечной панелью — электролиния не нужна"),
 ("SMD LED · 6500 K beyaz ışık", "SMD LEDs · 6500 K white light", "SMD-LEDs · 6500 K weißes Licht", "SMD-светодиоды · белый свет 6500 K"),
 ("Hareket sensörüyle otomatik yanma", "Automatic switch-on by motion sensor", "Automatisches Einschalten per Bewegungssensor", "Автоматическое включение по датчику движения"),
 ("Uzaktan kumanda", "Remote control", "Fernbedienung", "Пульт ДУ"),
 ("IP65 suya dayanıklı · 30.000 saat ömür", "IP65 water-resistant · 30,000-hour lifetime", "IP65 wassergeschützt · 30.000 Stunden Lebensdauer", "Защита IP65 · ресурс 30 000 часов"),
]
for row in CFG:
    t(*row)

# Hero LED 5'li alım fiyatlı ürünler (aplik, bahçe, 200 W, 600 W)
CFG2 = [
 ("☀️ Güneş enerjili", "☀️ Solar powered", "☀️ Solarbetrieben", "☀️ На солнечной энергии"),
 ("🌈 3 renk + RGB", "🌈 3 colours + RGB", "🌈 3 Farben + RGB", "🌈 3 цвета + RGB"),
 ("📡 Radar sensör", "📡 Radar sensor", "📡 Radarsensor", "📡 Радарный датчик"),
 ("Duvar, giriş kapısı, bahçe duvarı ve teras aydınlatması", "Wall, entrance, garden wall and terrace lighting", "Wand-, Eingangs-, Gartenmauer- und Terrassenbeleuchtung", "Освещение стен, входа, садовой ограды и террасы"),
 ("Bahçe duvarı, set, kolon başı ve giriş aydınlatması", "Garden wall, ledge, pillar-top and entrance lighting", "Beleuchtung für Gartenmauer, Sockel, Pfeilerkopf und Eingang", "Освещение садовой ограды, бордюра, верха колонн и входа"),
 ("Geniş bahçe, sokak, site, otopark ve fabrika sahası", "Large gardens, streets, estates, car parks and factory yards", "Große Gärten, Straßen, Wohnanlagen, Parkplätze und Fabrikgelände", "Большие сады, улицы, жилые комплексы, парковки и территории заводов"),
 ("Hero LED 50 W Solar LED Aplik (Kumandalı, 3 Renk + RGB)", "Hero LED 50 W Solar LED Wall Light (Remote, 3 Colours + RGB)", "Hero LED 50 W Solar-LED-Wandleuchte (Fernbedienung, 3 Farben + RGB)", "Солнечный настенный светильник Hero LED 50 Вт (пульт, 3 цвета + RGB)"),
 ("Hero LED 50 W Solar Set Üstü Bahçe Armatürü (Kumandalı, 3 Renk + RGB)", "Hero LED 50 W Solar Pillar-Top Garden Light (Remote, 3 Colours + RGB)", "Hero LED 50 W Solar-Pfeilerleuchte für den Garten (Fernbedienung, 3 Farben + RGB)", "Солнечный садовый светильник на столб Hero LED 50 Вт (пульт, 3 цвета + RGB)"),
 ("Hero LED 200 W Solar Sokak Armatürü (Sensörlü, Kumandalı)", "Hero LED 200 W Solar Street Light (Sensor, Remote)", "Hero LED 200 W Solar-Straßenleuchte (Sensor, Fernbedienung)", "Солнечный уличный светильник Hero LED 200 Вт (датчик, пульт)"),
 ("Hero LED 600 W Solar Sokak Armatürü (Radar Sensörlü, Kumandalı)", "Hero LED 600 W Solar Street Light (Radar Sensor, Remote)", "Hero LED 600 W Solar-Straßenleuchte (Radarsensor, Fernbedienung)", "Солнечный уличный светильник Hero LED 600 Вт (радарный датчик, пульт)"),
 ("Üstündeki güneş paneliyle gündüz şarj olup gece çalışan 50 W solar duvar apliği (HL-5181): elektrik hattı gerektirmez. 4000 lümen, 3200 K / 4000 K / 6500 K ve RGB ışık seçeneği, 60° ışık açısı, uzaktan kumanda, IP65 suya dayanıklılık ve 15.000 saat ömür. Şarj süresi 6 saat, çalışma süresi 8 saat; ölçü 160 × 160 × 213 mm.",
  "50 W solar wall light (HL-5181) that charges by day from the solar panel on top and works at night: no power line needed. 4000 lumens, 3200 K / 4000 K / 6500 K and RGB light options, 60° beam angle, remote control, IP65 water resistance and a 15,000-hour lifetime. Charging time 6 hours, run time 8 hours; size 160 × 160 × 213 mm.",
  "50-W-Solar-Wandleuchte (HL-5181), die sich tagsüber über das Solarmodul auf der Oberseite lädt und nachts leuchtet: keine Stromleitung nötig. 4000 Lumen, Lichtoptionen 3200 K / 4000 K / 6500 K und RGB, 60° Abstrahlwinkel, Fernbedienung, IP65-Wasserschutz und 15.000 Stunden Lebensdauer. Ladezeit 6 Stunden, Leuchtdauer 8 Stunden; Maße 160 × 160 × 213 mm.",
  "Солнечный настенный светильник 50 Вт (HL-5181): днём заряжается от панели сверху, ночью светит, электролиния не нужна. 4000 люмен, свет 3200 K / 4000 K / 6500 K и RGB, угол 60°, пульт ДУ, защита от воды IP65 и ресурс 15 000 часов. Зарядка 6 часов, работа 8 часов; размер 160 × 160 × 213 мм."),
 ("Bahçe duvarı, set ve kolon başına takılan 50 W solar bahçe armatürü (HL-5180); duvara da monte edilebilir. Üstündeki güneş paneliyle şarj olur, elektrik hattı gerektirmez. 4000 lümen, 3200 K / 4000 K / 6500 K ve RGB ışık seçeneği, 60° ışık açısı, uzaktan kumanda, IP65 suya dayanıklılık ve 15.000 saat ömür. Şarj süresi 6 saat, çalışma süresi 8 saat; ölçü 160 × 160 × 213 mm.",
  "50 W solar garden light (HL-5180) for garden walls, ledges and pillar tops; it can also be wall-mounted. It charges from the solar panel on top, so no power line is needed. 4000 lumens, 3200 K / 4000 K / 6500 K and RGB light options, 60° beam angle, remote control, IP65 water resistance and a 15,000-hour lifetime. Charging time 6 hours, run time 8 hours; size 160 × 160 × 213 mm.",
  "50-W-Solar-Gartenleuchte (HL-5180) für Gartenmauern, Sockel und Pfeilerköpfe; auch zur Wandmontage. Sie lädt über das Solarmodul auf der Oberseite, eine Stromleitung ist nicht nötig. 4000 Lumen, Lichtoptionen 3200 K / 4000 K / 6500 K und RGB, 60° Abstrahlwinkel, Fernbedienung, IP65-Wasserschutz und 15.000 Stunden Lebensdauer. Ladezeit 6 Stunden, Leuchtdauer 8 Stunden; Maße 160 × 160 × 213 mm.",
  "Солнечный садовый светильник 50 Вт (HL-5180) для садовых оград, бордюров и верха колонн; можно крепить и на стену. Заряжается от панели сверху, электролиния не нужна. 4000 люмен, свет 3200 K / 4000 K / 6500 K и RGB, угол 60°, пульт ДУ, защита от воды IP65 и ресурс 15 000 часов. Зарядка 6 часов, работа 8 часов; размер 160 × 160 × 213 мм."),
 ("Güneş paneliyle şarj olup gece çalışan 200 W solar sokak armatürü (HL-5153): elektrik hattı çekmeden aydınlatma sağlar. SMD LED, 6500 K beyaz ışık, hareket sensörüyle otomatik yanma, sabit yanma zaman ayarı, uzaktan kumanda, IP65 suya dayanıklılık ve 30.000 saat ömür. Armatür ölçüsü 188 × 586 mm. Bahçe, sokak, site, otopark ve fabrika aydınlatması için.",
  "200 W solar street light (HL-5153) that charges from its solar panel and works at night: light without running a power line. SMD LEDs, 6500 K white light, automatic switch-on by motion sensor, fixed-on timer, remote control, IP65 water resistance and a 30,000-hour lifetime. Luminaire size 188 × 586 mm. For gardens, streets, estates, car parks and factories.",
  "200-W-Solar-Straßenleuchte (HL-5153), die sich über ihr Solarmodul lädt und nachts leuchtet: Licht ohne Stromleitung. SMD-LEDs, 6500 K weißes Licht, automatisches Einschalten per Bewegungssensor, Zeitschaltung für Dauerlicht, Fernbedienung, IP65-Wasserschutz und 30.000 Stunden Lebensdauer. Leuchtenmaß 188 × 586 mm. Für Gärten, Straßen, Wohnanlagen, Parkplätze und Fabriken.",
  "Солнечный уличный светильник 200 Вт (HL-5153): заряжается от солнечной панели и светит ночью, без прокладки электролинии. SMD-светодиоды, белый свет 6500 K, автоматическое включение по датчику движения, таймер постоянного свечения, пульт ДУ, защита от воды IP65 и ресурс 30 000 часов. Размер светильника 188 × 586 мм. Для садов, улиц, жилых комплексов, парковок и заводов."),
 ("Geniş alanlar için 600 W solar sokak armatürü (HL-5157): ayrı güneş paneliyle şarj olur, elektrik hattı ve elektrik faturası gerektirmez. SMD LED, 6500 K beyaz ışık, radar hareket sensörü, sabit yanma zaman ayarı, uzaktan kumanda, IP65 suya dayanıklılık ve 30.000 saat ömür. Kutu bilgisine göre sensör modunda 24–36 saat, sabit yanmada 6–8 saat çalışır. Armatür ölçüsü 29,8 × 46,5 cm.",
  "600 W solar street light for large areas (HL-5157): it charges from a separate solar panel, so no power line and no electricity bill. SMD LEDs, 6500 K white light, radar motion sensor, fixed-on timer, remote control, IP65 water resistance and a 30,000-hour lifetime. According to the box it runs 24–36 hours in sensor mode and 6–8 hours in fixed-on mode. Luminaire size 29.8 × 46.5 cm.",
  "600-W-Solar-Straßenleuchte für große Flächen (HL-5157): lädt über ein separates Solarmodul, ohne Stromleitung und ohne Stromrechnung. SMD-LEDs, 6500 K weißes Licht, Radar-Bewegungssensor, Zeitschaltung für Dauerlicht, Fernbedienung, IP65-Wasserschutz und 30.000 Stunden Lebensdauer. Laut Verpackung 24–36 Stunden im Sensormodus und 6–8 Stunden im Dauerlicht. Leuchtenmaß 29,8 × 46,5 cm.",
  "Солнечный уличный светильник 600 Вт для больших территорий (HL-5157): заряжается от отдельной солнечной панели, без электролинии и счетов за электричество. SMD-светодиоды, белый свет 6500 K, радарный датчик движения, таймер постоянного свечения, пульт ДУ, защита от воды IP65 и ресурс 30 000 часов. По данным упаковки — 24–36 часов в режиме датчика и 6–8 часов при постоянном свечении. Размер светильника 29,8 × 46,5 см."),
 ("Güneş enerjili — elektrik hattı gerektirmez", "Solar powered — no power line needed", "Solarbetrieben — keine Stromleitung nötig", "На солнечной энергии — электролиния не нужна"),
 ("50 W · 4000 lümen · 60° ışık açısı", "50 W · 4000 lumens · 60° beam angle", "50 W · 4000 Lumen · 60° Abstrahlwinkel", "50 Вт · 4000 люмен · угол 60°"),
 ("3200 K / 4000 K / 6500 K + RGB ışık seçeneği", "3200 K / 4000 K / 6500 K + RGB light options", "Lichtoptionen 3200 K / 4000 K / 6500 K + RGB", "Свет 3200 K / 4000 K / 6500 K + RGB"),
 ("Uzaktan kumanda · duvar tipi montaj", "Remote control · wall mounting", "Fernbedienung · Wandmontage", "Пульт ДУ · настенный монтаж"),
 ("Uzaktan kumanda · set üstü / duvar tipi montaj", "Remote control · pillar-top / wall mounting", "Fernbedienung · Pfeiler- / Wandmontage", "Пульт ДУ · монтаж на столб / стену"),
 ("IP65 suya dayanıklı · 15.000 saat ömür", "IP65 water-resistant · 15,000-hour lifetime", "IP65 wassergeschützt · 15.000 Stunden Lebensdauer", "Защита IP65 · ресурс 15 000 часов"),
 ("Şarj 6 saat · çalışma 8 saat", "Charging 6 h · run time 8 h", "Laden 6 h · Leuchtdauer 8 h", "Зарядка 6 ч · работа 8 ч"),
 ("Hareket sensörü · sabit yanma zaman ayarı", "Motion sensor · fixed-on timer", "Bewegungssensor · Zeitschaltung für Dauerlicht", "Датчик движения · таймер постоянного свечения"),
 ("Armatür 188 × 586 mm", "Luminaire 188 × 586 mm", "Leuchte 188 × 586 mm", "Светильник 188 × 586 мм"),
 ("Ayrı güneş paneli — elektrik hattı gerektirmez", "Separate solar panel — no power line needed", "Separates Solarmodul — keine Stromleitung nötig", "Отдельная солнечная панель — электролиния не нужна"),
 ("Radar hareket sensörü · sabit yanma zaman ayarı", "Radar motion sensor · fixed-on timer", "Radar-Bewegungssensor · Zeitschaltung für Dauerlicht", "Радарный датчик движения · таймер постоянного свечения"),
 ("Sensör modunda 24–36 saat · sabit yanmada 6–8 saat", "24–36 h in sensor mode · 6–8 h fixed-on", "24–36 h im Sensormodus · 6–8 h Dauerlicht", "24–36 ч в режиме датчика · 6–8 ч постоянно"),
 ("Uzaktan kumanda · IP65 · 30.000 saat ömür", "Remote control · IP65 · 30,000-hour lifetime", "Fernbedienung · IP65 · 30.000 Stunden Lebensdauer", "Пульт ДУ · IP65 · ресурс 30 000 часов"),
 ("Armatür 29,8 × 46,5 cm", "Luminaire 29.8 × 46.5 cm", "Leuchte 29,8 × 46,5 cm", "Светильник 29,8 × 46,5 см"),
]
for row in CFG2:
    t(*row)

# 700 W bifacial panel (21 Eki 2026)
CFG3 = [
 ("🔆 700 W bifacial", "🔆 700 W bifacial", "🔆 700 W bifazial", "🔆 700 Вт двусторонняя"),
 ("☀️ Ön yüz 610 Wp", "☀️ Front side 610 Wp", "☀️ Vorderseite 610 Wp", "☀️ Лицевая сторона 610 Вт"),
 ("✂️ 144 yarım hücre", "✂️ 144 half-cut cells", "✂️ 144 Halbzellen", "✂️ 144 половинчатые ячейки"),
 ("Kargo kasalı elektrikli araçlar, çatı ve arazi sistemleri", "Cargo-bed electric vehicles, rooftop and ground systems", "Elektrofahrzeuge mit Ladefläche, Dach- und Freiflächenanlagen", "Электротранспорт с кузовом, крышные и наземные системы"),
 ("700 W Bifacial TOPCon Güneş Paneli", "700 W Bifacial TOPCon Solar Panel", "700 W Bifaziales TOPCon-Solarmodul", "Двусторонняя солнечная панель TOPCon 700 Вт"),
 ("144 yarım hücreli, N-type TOPCon teknolojili çift yüzlü (bifacial) güneş paneli. Ön yüz STC gücü 610 Wp; arka yüzden %15 ek kazançla 701,5 W'a ulaşır (%10'da 671 W, %20'de 732 W). Ön yüzde Voc 53,27 V · Vmp 44,51 V · Isc 14,34 A · Imp 13,71 A, modül verimi %23,62. Ölçü 2278 × 1133 × 30 mm; 1500 V sistem gerilimi, 0~+5 W güç toleransı. Kargo kasalı motor güneş paketimizin panelidir; tek başına da satılır.",
  "Bifacial (double-sided) solar panel with 144 half-cut cells and N-type TOPCon technology. Front-side STC power is 610 Wp; with a 15% rear-side gain it reaches 701.5 W (671 W at 10%, 732 W at 20%). Front side: Voc 53.27 V · Vmp 44.51 V · Isc 14.34 A · Imp 13.71 A, module efficiency 23.62%. Size 2278 × 1133 × 30 mm; 1500 V system voltage, 0~+5 W power tolerance. It is the panel of our cargo-bed EV solar set and is also sold on its own.",
  "Bifaziales (beidseitiges) Solarmodul mit 144 Halbzellen und N-Type-TOPCon-Technologie. Vorderseitige STC-Leistung 610 Wp; mit 15 % Rückseitengewinn erreicht es 701,5 W (671 W bei 10 %, 732 W bei 20 %). Vorderseite: Voc 53,27 V · Vmp 44,51 V · Isc 14,34 A · Imp 13,71 A, Modulwirkungsgrad 23,62 %. Maße 2278 × 1133 × 30 mm; 1500 V Systemspannung, 0~+5 W Leistungstoleranz. Modul unseres Solar-Sets für Lasten-Dreiräder, auch einzeln erhältlich.",
  "Двусторонняя (bifacial) солнечная панель со 144 половинчатыми ячейками по технологии N-type TOPCon. Мощность лицевой стороны по STC — 610 Вт; с приростом 15 % от тыльной стороны достигает 701,5 Вт (671 Вт при 10 %, 732 Вт при 20 %). Лицевая сторона: Voc 53,27 В · Vmp 44,51 В · Isc 14,34 А · Imp 13,71 А, КПД модуля 23,62 %. Размер 2278 × 1133 × 30 мм; напряжение системы 1500 В, допуск мощности 0~+5 Вт. Панель нашего комплекта для грузовых трициклов, продаётся и отдельно."),
 ("700 W bifacial · ön yüz 610 Wp + %15 arka yüz kazancı", "700 W bifacial · 610 Wp front + 15% rear-side gain", "700 W bifazial · 610 Wp Vorderseite + 15 % Rückseitengewinn", "700 Вт двусторонняя · 610 Вт лицевая + 15 % тыльная"),
 ("N-type TOPCon · 144 yarım hücre · modül verimi %23,62", "N-type TOPCon · 144 half-cut cells · module efficiency 23.62%", "N-Type-TOPCon · 144 Halbzellen · Modulwirkungsgrad 23,62 %", "N-type TOPCon · 144 половинчатые ячейки · КПД 23,62 %"),
 ("Voc 53,27 V · Vmp 44,51 V · Isc 14,34 A · Imp 13,71 A", "Voc 53.27 V · Vmp 44.51 V · Isc 14.34 A · Imp 13.71 A", "Voc 53,27 V · Vmp 44,51 V · Isc 14,34 A · Imp 13,71 A", "Voc 53,27 В · Vmp 44,51 В · Isc 14,34 А · Imp 13,71 А"),
 ("2278 × 1133 × 30 mm · 1500 V · 0~+5 W tolerans", "2278 × 1133 × 30 mm · 1500 V · 0~+5 W tolerance", "2278 × 1133 × 30 mm · 1500 V · 0~+5 W Toleranz", "2278 × 1133 × 30 мм · 1500 В · допуск 0~+5 Вт"),
 ("Sıcaklık katsayısı Pmax −0,29 %/°C · çalışma −40…+85 °C", "Temperature coefficient Pmax −0.29 %/°C · operating −40…+85 °C", "Temperaturkoeffizient Pmax −0,29 %/°C · Betrieb −40…+85 °C", "Температурный коэффициент Pmax −0,29 %/°C · работа −40…+85 °C"),
 # kargo paketi
 ("🔆 700 W bifacial TOPCon panel", "🔆 700 W bifacial TOPCon panel", "🔆 700-W-Bifazial-TOPCon-Modul", "🔆 Двусторонняя панель TOPCon 700 Вт"),
 ("Kargo Kasalı Motor Güneş Paketi — 700 W", "Cargo-Bed E-Trike Solar Set — 700 W", "Solar-Set für Dreirad mit Ladefläche — 700 W", "Солнечный комплект для грузового трицикла — 700 Вт"),
]
for row in CFG3:
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
    "onguc": t("Ön yüz gücü (STC)", "Front-side power (STC)", "Vorderseitenleistung (STC)", "Мощность лицевой стороны (STC)"),
    "bifaz": t("Arka yüz kazancıyla güç", "Power with rear-side gain", "Leistung mit Rückseitengewinn", "Мощность с приростом от тыльной стороны"),
    "tolerans": t("Güç toleransı", "Power tolerance", "Leistungstoleranz", "Допуск мощности"),
    "sigorta": t("Maks. seri sigorta", "Max. series fuse", "Max. Reihensicherung", "Макс. последовательный предохранитель"),
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
    ("panel-700w", "panel-700w.html", 700, 53.27, "2278 × 1133 × 30 mm", None),   # Voc: ön yüz (610 Wp)
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
    # 700 W: künyenin 610 W satırı (ön yüz STC) + bifacial kazanç satırları.
    "panel-700w": [("guc", "700bif"), ("onguc", "610 Wp"), ("bifaz", "bifaz"), ("hucre", "144 yarım TOPCon bif"),
                   ("voc", "53,27 V"), ("vmp", "44,51 V"), ("isc", "14,34 A"), ("imp", "13,71 A"),
                   ("verim", "%23,62"), ("tolerans", "0~+5 W"), ("sistem", "1500 V"), ("sigorta", "30 A"),
                   ("olcu", "2278 × 1133 × 30 mm"), ("sicaklik", "−0,29/700"), ("belge", "IEC 61215 · IEC 61730"),
                   ("garanti", "30y87"), ("agirlik", None)],
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
    "700bif": t("700 W (bifacial, %15 arka yüz kazancıyla)", "700 W (bifacial, with 15% rear-side gain)", "700 W (bifazial, mit 15 % Rückseitengewinn)", "700 Вт (двусторонняя, с приростом 15 % от тыльной стороны)"),
    "bifaz": t("%10: 671 W · %15: 701,5 W · %20: 732 W", "10%: 671 W · 15%: 701.5 W · 20%: 732 W", "10 %: 671 W · 15 %: 701,5 W · 20 %: 732 W", "10 %: 671 Вт · 15 %: 701,5 Вт · 20 %: 732 Вт"),
    "144 yarım TOPCon bif": t("144 yarım hücre, N-type TOPCon, çift yüzlü", "144 half-cut cells, N-type TOPCon, bifacial", "144 Halbzellen, N-Type-TOPCon, bifazial", "144 половинчатые ячейки, N-type TOPCon, двусторонняя"),
    "−0,29/700": t("Pmax −0,29 %/°C · Voc −0,25 %/°C · Isc +0,046 %/°C · NOCT 42 ± 2 °C · çalışma −40…+85 °C", "Pmax −0.29 %/°C · Voc −0.25 %/°C · Isc +0.046 %/°C · NOCT 42 ± 2 °C · operating −40…+85 °C", "Pmax −0,29 %/°C · Voc −0,25 %/°C · Isc +0,046 %/°C · NOCT 42 ± 2 °C · Betrieb −40…+85 °C", "Pmax −0,29 %/°C · Voc −0,25 %/°C · Isc +0,046 %/°C · NOCT 42 ± 2 °C · работа −40…+85 °C"),
    "30y87": t("30 yıl güç garantisi (30. yılda %87,4)", "30-year power warranty (87.4% in year 30)", "30 Jahre Leistungsgarantie (87,4 % im 30. Jahr)", "30 лет гарантии мощности (87,4 % на 30-й год)"),
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


# ------------------------------------------------------------ aydınlatma
GALLERY = {
    "hero-led-ampul-10w": [("assets/img/products/hero-led-ampul-10w-afis.webp", t("Hero LED 12 V DC LED ampul — tanıtım", "Hero LED 12 V DC LED bulb — overview", "Hero LED 12 V DC LED-Lampe — Übersicht", "Лампа Hero LED 12 В DC — обзор")),
                           ("assets/img/products/hero-led-ampul-10w-kullanim.webp", t("12–60 V AC/DC kullanım alanları", "12–60 V AC/DC applications", "12–60 V AC/DC Einsatzbereiche", "Применение 12–60 В AC/DC")),
                           ("assets/img/products/hero-led-ampul-10w-teknik.webp", t("Teknik özellikler ve enerji etiketi", "Technical data and energy label", "Technische Daten und Energielabel", "Технические характеристики и энергоэтикетка"))],
    "hero-led-solar-sokak-100w": [("assets/img/products/hero-led-solar-sokak-100w-afis.webp", t("Hero LED 100 W solar sokak armatürü — tanıtım", "Hero LED 100 W solar street light — overview", "Hero LED 100 W Solar-Straßenleuchte — Übersicht", "Солнечный светильник Hero LED 100 Вт — обзор")),
                                  ("assets/img/products/hero-led-solar-sokak-100w-detay.webp", t("Güneş paneli, SMD LED ve kullanım alanları", "Solar panel, SMD LEDs and applications", "Solarmodul, SMD-LEDs und Einsatzbereiche", "Солнечная панель, SMD-светодиоды и применение"))],
    "hero-led-aplik-50w": [("assets/img/products/hero-led-aplik-50w-afis.webp", t("Hero LED 50 W solar LED aplik — tanıtım ve ışık renkleri", "Hero LED 50 W solar LED wall light — overview and light colours", "Hero LED 50 W Solar-LED-Wandleuchte — Übersicht und Lichtfarben", "Солнечный настенный светильник Hero LED 50 Вт — обзор и цвета света")),
                           ("assets/img/products/hero-led-aplik-50w-teknik.webp", t("Teknik özellikler, ölçüler ve kutu içeriği", "Technical data, dimensions and box contents", "Technische Daten, Maße und Lieferumfang", "Технические характеристики, размеры и комплектация"))],
    "hero-led-bahce-50w": [("assets/img/products/hero-led-bahce-50w-afis.webp", t("Hero LED 50 W solar set üstü bahçe armatürü — tanıtım", "Hero LED 50 W solar pillar-top garden light — overview", "Hero LED 50 W Solar-Pfeilerleuchte — Übersicht", "Садовый солнечный светильник Hero LED 50 Вт — обзор")),
                           ("assets/img/products/hero-led-bahce-50w-renk.webp", t("3 renk + RGB ışık seçenekleri", "3 colours + RGB light options", "3 Farben + RGB Lichtoptionen", "3 цвета + RGB: варианты света")),
                           ("assets/img/products/hero-led-bahce-50w-teknik.webp", t("Teknik özellikler, ölçüler ve kutu içeriği", "Technical data, dimensions and box contents", "Technische Daten, Maße und Lieferumfang", "Технические характеристики, размеры и комплектация"))],
    "hero-led-solar-sokak-200w": [("assets/img/products/hero-led-solar-sokak-200w-afis.webp", t("Hero LED 200 W solar sokak armatürü — tanıtım", "Hero LED 200 W solar street light — overview", "Hero LED 200 W Solar-Straßenleuchte — Übersicht", "Солнечный светильник Hero LED 200 Вт — обзор")),
                                  ("assets/img/products/hero-led-solar-sokak-200w-detay.webp", t("Ölçüler, SMD LED, kullanım alanları ve kutu", "Dimensions, SMD LEDs, applications and box", "Maße, SMD-LEDs, Einsatzbereiche und Verpackung", "Размеры, SMD-светодиоды, применение и упаковка"))],
    "hero-led-solar-sokak-600w": [("assets/img/products/hero-led-solar-sokak-600w-afis.webp", t("Hero LED 600 W solar sokak armatürü — tanıtım", "Hero LED 600 W solar street light — overview", "Hero LED 600 W Solar-Straßenleuchte — Übersicht", "Солнечный светильник Hero LED 600 Вт — обзор")),
                                  ("assets/img/products/hero-led-solar-sokak-600w-detay.webp", t("Geniş alan aydınlatması, ölçüler, güneş paneli ve kutu", "Large-area lighting, dimensions, solar panel and box", "Großflächenbeleuchtung, Maße, Solarmodul und Verpackung", "Освещение больших площадей, размеры, панель и упаковка"))],
}

# 5'li (bulk) fiyatlı ürün: fiyat kutusuna adet fiyatı satırı (main.js doldurur).
def add_bulk(html, P, pk):
    if not pk[P["id"]].get("bulk"):
        return html
    a = html.index('<p class="pd-vat" data-pkg-vat>')
    b = html.index("</p>", a) + len("</p>")
    return html[:b] + '\n              <p class="pd-bulk" data-pkg-bulk hidden></p>' + html[b:]


def add_gallery(html, P, pk):
    imgs = GALLERY.get(P["id"])
    if not imgs:
        return html
    main_img = pk[P["id"]]["img"]
    w, h = H.img_size(main_img)
    th = ['<a class="prod-thumb is-on" href="%s"><img src="%s" alt="%s" loading="lazy" decoding="async" width="%d" height="%d" /></a>'
          % (main_img, main_img, H.attr(P["alt"]), w, h)]
    for src, alt in imgs:
        iw, ih = H.img_size(src)
        th.append('<a class="prod-thumb" href="%s"><img src="%s" alt="%s" loading="lazy" decoding="async" width="%d" height="%d" /></a>'
                  % (src, src, H.attr(alt), iw, ih))
    a = html.index('<figure class="prod-main">')
    b = html.index("</figure>", a) + len("</figure>")
    return html[:b] + '\n            <div class="prod-thumbs">' + "".join(th) + "</div>" + html[b:]


def lighting(pk, pid):
    p = pk[pid]
    bulb = pid == "hero-led-ampul-10w"
    BR = (ROW["marka"], k("Hero LED"))
    if bulb:
        sp = [BR, (ROW["model"], k("HL-7020 · HL-7021")), (ROW["guc"], u("10 W")),
              (t("Işık akısı", "Luminous flux", "Lichtstrom", "Световой поток"), t("850 lm", "850 lm", "850 lm", "850 лм")),
              (t("Renk sıcaklığı", "Colour temperature", "Farbtemperatur", "Цветовая температура"), t("6500 K (beyaz ışık)", "6500 K (white light)", "6500 K (weißes Licht)", "6500 K (белый свет)")),
              (t("Çalışma gerilimi", "Operating voltage", "Betriebsspannung", "Рабочее напряжение"), t("12–60 V AC/DC", "12–60 V AC/DC", "12–60 V AC/DC", "12–60 В AC/DC")),
              (t("Frekans", "Frequency", "Frequenz", "Частота"), t("50–60 Hz", "50–60 Hz", "50–60 Hz", "50–60 Гц")),
              (ROW["olcu"], u("60 × 118 mm")),
              (t("Çalışma sıcaklığı", "Operating temperature", "Betriebstemperatur", "Рабочая температура"), k("−20 ~ +55 °C")),
              (t("Enerji sınıfı", "Energy class", "Energieklasse", "Класс энергоэффективности"), t("F · 10 kWh/1000 saat", "F · 10 kWh/1000 h", "F · 10 kWh/1000 h", "F · 10 кВт·ч/1000 ч")),
              (ROW["belge"], t("CE · AEEE yönetmeliğine uygun · UV içermez", "CE · WEEE compliant · no UV", "CE · WEEE-konform · ohne UV", "CE · соответствует WEEE · без УФ"))]
        faq = [
            (t("12 V aküye doğrudan bağlanır mı?", "Can it be connected straight to a 12 V battery?", "Kann sie direkt an eine 12-V-Batterie?", "Можно ли подключить прямо к АКБ 12 В?"),
             t("Evet. Ampul 12–60 V AC/DC aralığında çalışır; 12 V ve 24 V akülü sistemlerde inverter gerekmeden doğrudan aküden beslenir.",
               "Yes. The bulb works on 12–60 V AC/DC; in 12 V and 24 V battery systems it runs straight from the battery without an inverter.",
               "Ja. Die Lampe arbeitet mit 12–60 V AC/DC; in 12-V- und 24-V-Batterieanlagen läuft sie ohne Wechselrichter direkt an der Batterie.",
               "Да. Лампа работает от 12–60 В AC/DC; в системах с АКБ 12 В и 24 В питается прямо от аккумулятора без инвертора.")),
            (t("Ev elektriğinde (220 V) kullanılır mı?", "Can it be used on mains power (230 V)?", "Kann sie am Hausstrom (230 V) betrieben werden?", "Можно ли использовать от сети 220 В?"),
             t("Hayır. Çalışma aralığı 12–60 V'tur; 220 V şebekeye takılmamalıdır.",
               "No. Its operating range is 12–60 V; it must not be plugged into 230 V mains.",
               "Nein. Der Betriebsbereich ist 12–60 V; sie darf nicht an 230-V-Netzstrom.",
               "Нет. Рабочий диапазон 12–60 В; к сети 220 В подключать нельзя.")),
            (t("Bir aküyle kaç saat yanar?", "How long does it run on a battery?", "Wie lange leuchtet sie an einer Batterie?", "Сколько она проработает от аккумулятора?"),
             t("Ampul 10 W çeker. Yaklaşık hesap: 12 V 100 Ah akünün kullanılabilir enerjisi (≈ 600 Wh, %50 deşarj) tek ampulü yaklaşık 60 saat yakar. Gerçek süre akü tipine ve durumuna göre değişir.",
               "The bulb draws 10 W. Rough estimate: the usable energy of a 12 V 100 Ah battery (≈ 600 Wh at 50% discharge) runs one bulb for about 60 hours. The actual time depends on battery type and condition.",
               "Die Lampe nimmt 10 W auf. Grobe Rechnung: Die nutzbare Energie einer 12-V-100-Ah-Batterie (≈ 600 Wh bei 50 % Entladung) reicht für eine Lampe etwa 60 Stunden. Die tatsächliche Dauer hängt von Batterietyp und Zustand ab.",
               "Лампа потребляет 10 Вт. Ориентировочно: полезной энергии АКБ 12 В 100 А·ч (≈ 600 Вт·ч при разряде 50 %) хватит одной лампе примерно на 60 часов. Реальное время зависит от типа и состояния аккумулятора.")),
            Q_KUR]
        use = [("🚐", t("Karavan", "Caravans", "Wohnmobile", "Автодома"), t("12 V yaşam aküsünden aydınlatma.", "Lighting from the 12 V leisure battery.", "Licht aus der 12-V-Bordbatterie.", "Освещение от бытового аккумулятора 12 В.")),
               ("⛵", t("Tekne", "Boats", "Boote", "Лодки"), t("Kabin ve güverte aydınlatması.", "Cabin and deck lighting.", "Kabinen- und Deckbeleuchtung.", "Освещение каюты и палубы.")),
               ("🏡", t("Bağ evi ve kulübe", "Country houses and cabins", "Ferienhäuser und Hütten", "Дачи и домики"), t("Şebekesiz evlerde akülü aydınlatma.", "Battery lighting in off-grid homes.", "Batteriebeleuchtung in netzfernen Häusern.", "Освещение от АКБ в домах без сети.")),
               ("☀️", t("Güneş enerjisi sistemleri", "Solar systems", "Solaranlagen", "Солнечные системы"), t("12/24 V akülü sistemlere doğrudan.", "Directly on 12/24 V battery systems.", "Direkt an 12/24-V-Batterieanlagen.", "Напрямую к системам АКБ 12/24 В."))]
        flow = [("☀️", t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"), t("DC gerilim", "DC voltage", "DC-Spannung", "напряжение DC")),
                ("📟", t("Şarj kontrol cihazı", "Charge controller", "Laderegler", "Контроллер заряда"), t("PWM · MPPT", "PWM · MPPT", "PWM · MPPT", "ШИМ · MPPT")),
                ("🔋", t("Akü", "Battery", "Batterie", "Аккумулятор"), u("12 V / 24 V")),
                ("💡", k("Hero LED"), u("10 W"))]
        steps = [(t("Duy ve kablo", "Socket and cable", "Fassung und Kabel", "Патрон и кабель"),
                  t("Ampulü uygun bir duya takın; duy kablosunu sigorta üzerinden aküye ya da şarj kontrol cihazının yük çıkışına bağlayın.",
                    "Fit the bulb into a suitable socket; connect the socket cable to the battery through a fuse or to the charge controller's load output.",
                    "Setzen Sie die Lampe in eine passende Fassung; schließen Sie das Fassungskabel über eine Sicherung an die Batterie oder an den Lastausgang des Ladereglers an.",
                    "Вкрутите лампу в подходящий патрон; подключите кабель патрона к аккумулятору через предохранитель или к выходу нагрузки контроллера.")),
                 (t("Kutupları kontrol edin", "Check polarity", "Polarität prüfen", "Проверьте полярность"),
                  t("DC bağlantıda artı ve eksi uçları doğru bağlayın.", "On DC, connect plus and minus the right way round.", "Bei DC Plus und Minus richtig anschließen.", "При DC соблюдайте полярность плюса и минуса.")),
                 (t("Anahtarla kumanda edin", "Use a switch", "Mit Schalter bedienen", "Управляйте выключателем"),
                  t("Hatta bir anahtar koyun; ampulü gereksiz yakmak aküyü boşaltır.", "Put a switch on the line; leaving the bulb on drains the battery.", "Bauen Sie einen Schalter ein; unnötiges Leuchten entleert die Batterie.", "Поставьте выключатель: лишнее горение разряжает аккумулятор."))]
        xs = [("lexron-pwm-20a", XS["pwm"]), ("panel-50w", t("Küçük 12 V sistemler için kompakt panel.", "A compact panel for small 12 V systems.", "Ein kompaktes Modul für kleine 12-V-Anlagen.", "Компактная панель для небольших систем 12 В.")),
              ("kablo-solar-5m", XS["kablo"]), ("mc4-set", XS["mc4"])]
        kicker = t("💡 LED Ampul", "💡 LED Bulb", "💡 LED-Lampe", "💡 Светодиодная лампа")
        lead = t("Hero LED 10 W 12 V DC LED ampul: 12–60 V AC/DC aralığında çalışır, 850 lümen beyaz ışık verir; karavan, tekne ve akülü güneş sistemlerinde doğrudan aküden yanar.",
                 "Hero LED 10 W 12 V DC LED bulb: works on 12–60 V AC/DC and gives 850 lumens of white light; runs straight from the battery in caravans, boats and solar battery systems.",
                 "Hero LED 10 W 12 V DC LED-Lampe: arbeitet mit 12–60 V AC/DC und liefert 850 Lumen weißes Licht; läuft direkt an der Batterie in Wohnmobilen, Booten und solaren Batterieanlagen.",
                 "Светодиодная лампа Hero LED 10 Вт 12 В DC: работает от 12–60 В AC/DC, даёт 850 люмен белого света; питается прямо от аккумулятора в автодомах, лодках и солнечных системах.")
        cta = t("Ampulü bugün sipariş edin", "Order the bulb today", "Bestellen Sie die Lampe noch heute", "Закажите лампу сегодня")
        how_p = t("Ampul akülü sistemde aküden ya da şarj kontrol cihazının yük çıkışından beslenir.",
                  "In a battery system the bulb is fed from the battery or from the charge controller's load output.",
                  "In einer Batterieanlage wird die Lampe aus der Batterie oder vom Lastausgang des Ladereglers versorgt.",
                  "В системе с АКБ лампа питается от аккумулятора или от выхода нагрузки контроллера.")
    else:
        sp = [BR, (ROW["model"], k("HL-5151")), (ROW["guc"], u("100 W")),
              (t("Işık kaynağı", "Light source", "Lichtquelle", "Источник света"), k("SMD LED")),
              (t("Renk sıcaklığı", "Colour temperature", "Farbtemperatur", "Цветовая температура"), t("6500 K (beyaz ışık)", "6500 K (white light)", "6500 K (weißes Licht)", "6500 K (белый свет)")),
              (t("Enerji kaynağı", "Power source", "Energiequelle", "Источник питания"), t("Güneş paneli (ürünle birlikte)", "Solar panel (supplied)", "Solarmodul (im Lieferumfang)", "Солнечная панель (в комплекте)")),
              (t("Sensör", "Sensor", "Sensor", "Датчик"), t("Hareket sensörü — otomatik yanma", "Motion sensor — automatic switch-on", "Bewegungssensor — automatisches Einschalten", "Датчик движения — автовключение")),
              (t("Kumanda", "Control", "Bedienung", "Управление"), t("Uzaktan kumanda", "Remote control", "Fernbedienung", "Пульт ДУ")),
              (t("Koruma sınıfı", "Protection class", "Schutzart", "Класс защиты"), k("IP65")),
              (t("Ömür", "Lifetime", "Lebensdauer", "Ресурс"), t("30.000 saat", "30,000 hours", "30.000 Stunden", "30 000 часов")),
              (ROW["diger"], SOR)]
        faq = [
            (t("Elektrik bağlantısı gerekir mi?", "Does it need a mains connection?", "Braucht sie einen Stromanschluss?", "Нужно ли подключение к сети?"),
             t("Hayır. Armatür gündüz güneş paneliyle şarj olur, gece kendi kendine çalışır; elektrik hattı çekmeye gerek yoktur.",
               "No. The light charges from its solar panel during the day and works on its own at night; no power line is needed.",
               "Nein. Die Leuchte lädt tagsüber über ihr Solarmodul und arbeitet nachts selbstständig; eine Stromleitung ist nicht nötig.",
               "Нет. Днём светильник заряжается от солнечной панели, ночью работает сам; прокладывать электролинию не нужно.")),
            (t("Hareket sensörü nasıl çalışır?", "How does the motion sensor work?", "Wie funktioniert der Bewegungssensor?", "Как работает датчик движения?"),
             t("Sensör hareket algıladığında armatür otomatik yanar; çalışma modlarını uzaktan kumandayla seçebilirsiniz.",
               "When the sensor detects motion the light switches on automatically; you can choose the operating modes with the remote control.",
               "Erkennt der Sensor Bewegung, schaltet sich die Leuchte automatisch ein; die Betriebsarten wählen Sie mit der Fernbedienung.",
               "При обнаружении движения светильник включается автоматически; режимы работы выбираются с пульта.")),
            (t("Kaç saat yanar, akü kapasitesi nedir?", "How long does it run, and what is the battery capacity?", "Wie lange leuchtet sie, welche Akkukapazität hat sie?", "Сколько светит и какая ёмкость аккумулятора?"),
             t("Yanma süresi güneşlenmeye ve seçilen moda göre değişir. Akü kapasitesi ve şarj süresi tanıtım bilgisinde yer almıyor; sipariş öncesi bize yazın, üreticiden teyit edelim.",
               "Run time depends on sunlight and the selected mode. Battery capacity and charging time are not in the product information; write to us before ordering and we'll confirm with the manufacturer.",
               "Die Leuchtdauer hängt von Sonneneinstrahlung und gewähltem Modus ab. Akkukapazität und Ladezeit stehen nicht in den Produktinformationen; schreiben Sie uns vor der Bestellung, wir klären es mit dem Hersteller.",
               "Время работы зависит от солнца и выбранного режима. Ёмкость аккумулятора и время зарядки в описании не указаны; напишите нам до заказа — уточним у производителя.")),
            (t("Nereye monte edilir?", "Where is it mounted?", "Wo wird sie montiert?", "Куда монтируется?"),
             t("Direğe, duvara ya da bahçe ayağına monte edilir; güneş panelinin gün boyu gölgesiz bir yönde, tercihen güneye bakması gerekir.",
               "On a pole, a wall or a garden post; the solar panel should face a shade-free direction all day, preferably south.",
               "An Mast, Wand oder Gartenpfosten; das Solarmodul sollte ganztägig schattenfrei, möglichst nach Süden ausgerichtet sein.",
               "На столб, стену или садовую стойку; солнечная панель должна весь день быть без тени, желательно на юг.")),
            Q_KUR]
        use = [("🏡", t("Bahçe", "Gardens", "Gärten", "Сады"), t("Elektrik hattı çekmeden bahçe aydınlatması.", "Garden lighting without running a power line.", "Gartenbeleuchtung ohne Stromleitung.", "Освещение сада без прокладки линии.")),
               ("🛣️", t("Sokak ve site yolu", "Streets and estate roads", "Straßen und Wohnanlagen", "Улицы и дороги в комплексах"), t("Yol ve geçiş aydınlatması.", "Road and path lighting.", "Weg- und Durchgangsbeleuchtung.", "Освещение дорог и проходов.")),
               ("🅿️", t("Otopark", "Car parks", "Parkplätze", "Парковки"), t("Hareketle yanan otopark aydınlatması.", "Car park lighting that switches on with motion.", "Parkplatzbeleuchtung mit Bewegungsschaltung.", "Освещение парковки с включением по движению.")),
               ("🏭", t("Fabrika ve depo", "Factories and depots", "Fabriken und Lager", "Заводы и склады"), t("Saha ve çevre aydınlatması.", "Yard and perimeter lighting.", "Hof- und Umfeldbeleuchtung.", "Освещение территории и периметра."))]
        flow = [("☀️", t("Güneş paneli", "Solar panel", "Solarmodul", "Солнечная панель"), t("gündüz şarj", "charges by day", "lädt tagsüber", "заряд днём")),
                ("🔋", t("Dahili depolama", "Built-in storage", "Integrierter Speicher", "Встроенный накопитель"), t("armatürde", "in the luminaire", "in der Leuchte", "в светильнике")),
                ("🚶", t("Hareket sensörü", "Motion sensor", "Bewegungssensor", "Датчик движения"), t("otomatik yanma", "auto switch-on", "autom. Einschalten", "автовключение")),
                ("💡", t("Gece aydınlatma", "Night lighting", "Nachtbeleuchtung", "Ночное освещение"), u("100 W"))]
        steps = [(t("Yer seçin", "Choose the spot", "Den Standort wählen", "Выберите место"),
                  t("Panelin gün boyu güneş alacağı, gölgesiz bir yer seçin.", "Choose a spot where the panel gets sun all day without shade.", "Wählen Sie einen Ort, an dem das Modul ganztägig schattenfrei Sonne bekommt.", "Выберите место, где панель весь день на солнце без тени.")),
                 (t("Monte edin", "Mount it", "Montieren", "Смонтируйте"),
                  t("Armatürü direğe ya da duvara sabitleyin, paneli güneye yönlendirin.", "Fix the luminaire to a pole or wall and point the panel south.", "Befestigen Sie die Leuchte an Mast oder Wand und richten Sie das Modul nach Süden aus.", "Закрепите светильник на столбе или стене, направьте панель на юг.")),
                 (t("Modu seçin", "Choose the mode", "Modus wählen", "Выберите режим"),
                  t("Uzaktan kumandayla çalışma modunu seçin; ilk kullanımdan önce paneli güneşte şarj olmaya bırakın.", "Choose the operating mode with the remote; let the panel charge in the sun before first use.", "Wählen Sie den Betriebsmodus per Fernbedienung; lassen Sie das Modul vor dem ersten Einsatz in der Sonne laden.", "Выберите режим пультом; перед первым использованием дайте панели зарядиться на солнце."))]
        xs = [(x, XL[x]) for x in ("hero-led-solar-sokak-200w", "hero-led-solar-sokak-600w", "hero-led-bahce-50w", "hero-led-aplik-50w")]
        kicker = t("🌙 Solar Aydınlatma", "🌙 Solar Lighting", "🌙 Solarbeleuchtung", "🌙 Солнечное освещение")
        lead = t("Hero LED 100 W solar sokak armatürü: güneş paneliyle gündüz şarj olur, gece hareket sensörüyle yanar; elektrik hattı gerektirmez.",
                 "Hero LED 100 W solar street light: charges from its solar panel by day and lights up at night with a motion sensor; no power line needed.",
                 "Hero LED 100 W Solar-Straßenleuchte: lädt tagsüber über ihr Solarmodul und leuchtet nachts per Bewegungssensor; keine Stromleitung nötig.",
                 "Солнечный уличный светильник Hero LED 100 Вт: днём заряжается от панели, ночью светит по датчику движения; электролиния не нужна.")
        cta = t("Solar armatürü bugün sipariş edin", "Order the solar street light today", "Bestellen Sie die Solarleuchte noch heute", "Закажите солнечный светильник сегодня")
        how_p = t("Gündüz panel enerji toplar, gece armatür bu enerjiyle yanar; sensör ve kumanda çalışma şeklini belirler.",
                  "By day the panel collects energy, at night the light runs on it; the sensor and remote set how it operates.",
                  "Tagsüber sammelt das Modul Energie, nachts leuchtet die Leuchte damit; Sensor und Fernbedienung bestimmen den Betrieb.",
                  "Днём панель накапливает энергию, ночью светильник работает на ней; режим задают датчик и пульт.")
    return {
        "id": pid, "file": pid + ".html",
        "kaynak": t("Değerler üreticinin ürün tanıtım bilgisinden alınmıştır. Listede olmayan bir değer için bize yazın; üreticiden teyit edelim.",
                    "Values are taken from the manufacturer's product information. For any value not listed, write to us and we'll confirm it with the manufacturer.",
                    "Die Werte stammen aus den Produktinformationen des Herstellers. Für nicht aufgeführte Werte schreiben Sie uns; wir klären sie mit dem Hersteller.",
                    "Значения взяты из информации производителя. Если нужного значения нет, напишите нам — уточним у производителя."),
        "title": "%s | GESPA Enerji" % p["name"], "desc": p["desc"],
        "alt": t("%s — ürün fotoğrafı" % p["name"], "%s — product photo" % H.REG[p["name"]][0], "%s — Produktfoto" % H.REG[p["name"]][1], "%s — фото товара" % H.REG[p["name"]][2]),
        "kicker": kicker, "lead": lead,
        "info": [("🏷️", t("Marka: Hero LED", "Brand: Hero LED", "Marke: Hero LED", "Марка: Hero LED"))],
        "chips": p["chips"], "about": [p["desc"]], "specs": sp,
        "gloss": (t("Akülü güneş sistemi nedir?", "What is an off-grid solar system?", "Was ist eine Solar-Inselanlage?", "Что такое автономная солнечная система?"), "sozluk.html#off-grid"),
        "use": use,
        "use_p": t("Elektriğin olmadığı ya da akülü sistemle çalışılan yerlerde aydınlatma.",
                   "Lighting where there is no mains or where a battery system is used.",
                   "Beleuchtung dort, wo es keinen Netzstrom gibt oder ein Batteriesystem läuft.",
                   "Освещение там, где нет сети или используется система с АКБ."),
        "how_p": how_p, "flow": flow, "flow_here": 3, "flow_notes": [], "steps": steps,
        "tips": [t("Bağlantı ve montajda gerilim değerlerini kontrol edin; şüphede bize yazın.",
                   "Check the voltage values when wiring and mounting; if in doubt, write to us.",
                   "Prüfen Sie bei Anschluss und Montage die Spannungswerte; im Zweifel schreiben Sie uns.",
                   "При подключении и монтаже проверяйте напряжения; если сомневаетесь — напишите нам.")],
        "xsell": xs, "faq": faq,
        "note": (t("Sisteminizi birlikte kuralım", "Let's build your system together", "Lassen Sie uns Ihre Anlage gemeinsam planen", "Соберём систему вместе"),
                 t("Aydınlatmanızı besleyecek panel, akü ve şarj kontrol cihazını Sistem Kurucu ile birkaç adımda görün.",
                   "See the panel, battery and charge controller to power your lighting in a few steps with the System Builder.",
                   "Sehen Sie mit dem System-Konfigurator in wenigen Schritten Modul, Batterie und Laderegler für Ihre Beleuchtung.",
                   "Подберите панель, аккумулятор и контроллер для освещения за несколько шагов в конструкторе систем."),
                 "sistem-kur.html",
                 t("Sistem Kurucu'yu açın →", "Open the System Builder →", "System-Konfigurator öffnen →", "Открыть конструктор систем →")),
        "cta": cta,
    }


# ------------------------------------------------------------ 5'li alımlı Hero LED
XL = {
    "hero-led-aplik-50w": t("Duvara monte 50 W solar aplik, 3 renk + RGB.", "50 W solar wall light, 3 colours + RGB.", "50-W-Solar-Wandleuchte, 3 Farben + RGB.", "Солнечный настенный светильник 50 Вт, 3 цвета + RGB."),
    "hero-led-bahce-50w": t("Set ve kolon üstü 50 W solar bahçe armatürü.", "50 W solar light for ledges and pillar tops.", "50-W-Solarleuchte für Sockel und Pfeilerköpfe.", "Солнечный светильник 50 Вт на бордюр и столб."),
    "hero-led-solar-sokak-100w": t("Sensörlü 100 W solar sokak armatürü.", "100 W solar street light with sensor.", "100-W-Solar-Straßenleuchte mit Sensor.", "Солнечный уличный светильник 100 Вт с датчиком."),
    "hero-led-solar-sokak-200w": t("Sensörlü 200 W solar sokak armatürü.", "200 W solar street light with sensor.", "200-W-Solar-Straßenleuchte mit Sensor.", "Солнечный уличный светильник 200 Вт с датчиком."),
    "hero-led-solar-sokak-600w": t("Geniş alanlar için radar sensörlü 600 W solar armatür.", "600 W solar light with radar sensor for large areas.", "600-W-Solarleuchte mit Radarsensor für große Flächen.", "Солнечный светильник 600 Вт с радаром для больших площадей."),
}
Q_BULK = (t("5 adet ve üzeri alımda fiyat değişiyor mu?", "Is there a price for 5 or more?", "Gibt es einen Preis ab 5 Stück?", "Есть ли цена от 5 штук?"),
          t("Evet. 5 adet ve üzeri alımda daha düşük adet fiyatı uygulanır; bu fiyat ürün fiyatının altında yazar. Sepette adet 5'e ulaşınca adet fiyatı kendiliğinden düşer, ayrıca bir kod girmeniz gerekmez.",
            "Yes. Buying 5 or more gets a lower unit price, shown under the product price. When the quantity in the cart reaches 5 the unit price drops automatically; no code is needed.",
            "Ja. Ab 5 Stück gilt ein niedrigerer Stückpreis, er steht unter dem Produktpreis. Erreicht die Menge im Warenkorb 5, sinkt der Stückpreis automatisch; ein Code ist nicht nötig.",
            "Да. При покупке от 5 штук действует более низкая цена за штуку, она указана под ценой товара. Когда в корзине 5 штук, цена за штуку снижается автоматически; код не нужен."))


def r(tr):
    """Daha önce kayıtlı (çevirisi olan) metni aynen kullan."""
    if tr not in H.REG:
        sys.exit("KAYITSIZ METİN: %r" % tr)
    return tr


def lighting2(pk, pid):
    p = pk[pid]
    BR = (ROW["marka"], k("Hero LED"))
    SICAK = t("Renk sıcaklığı", "Colour temperature", "Farbtemperatur", "Цветовая температура")
    KUM = (t("Kumanda", "Control", "Bedienung", "Управление"), t("Uzaktan kumanda", "Remote control", "Fernbedienung", "Пульт ДУ"))
    IP = t("Koruma sınıfı", "Protection class", "Schutzart", "Класс защиты")
    OMUR = t("Ömür", "Lifetime", "Lebensdauer", "Ресурс")
    KAYNAKR = t("Enerji kaynağı", "Power source", "Energiequelle", "Источник питания")
    Q_ELK = (r("Elektrik bağlantısı gerekir mi?"), r("Hayır. Armatür gündüz güneş paneliyle şarj olur, gece kendi kendine çalışır; elektrik hattı çekmeye gerek yoktur."))
    STEP_YER = (r("Yer seçin"), r("Panelin gün boyu güneş alacağı, gölgesiz bir yer seçin."))
    STEP_MOD = (r("Modu seçin"), r("Uzaktan kumandayla çalışma modunu seçin; ilk kullanımdan önce paneli güneşte şarj olmaya bırakın."))
    FLOW_PV = ("☀️", r("Güneş paneli"), r("gündüz şarj"))
    FLOW_DEP = ("🔋", r("Dahili depolama"), r("armatürde"))
    small = pid in ("hero-led-aplik-50w", "hero-led-bahce-50w")
    if small:
        aplik = pid == "hero-led-aplik-50w"
        sp = [BR, (ROW["model"], k("HL-5181" if aplik else "HL-5180")), (ROW["guc"], u("50 W")),
              (r("Işık akısı"), t("4000 lm", "4000 lm", "4000 lm", "4000 лм")),
              (SICAK, t("3200 K / 4000 K / 6500 K + RGB", "3200 K / 4000 K / 6500 K + RGB", "3200 K / 4000 K / 6500 K + RGB", "3200 K / 4000 K / 6500 K + RGB")),
              (t("Işık açısı", "Beam angle", "Abstrahlwinkel", "Угол освещения"), k("60°")),
              (KAYNAKR, t("Güneş paneli (armatürün üstünde)", "Solar panel (on top of the light)", "Solarmodul (oben auf der Leuchte)", "Солнечная панель (сверху светильника)")),
              (t("Şarj süresi", "Charging time", "Ladezeit", "Время зарядки"), t("6 saat", "6 hours", "6 Stunden", "6 часов")),
              (t("Çalışma süresi", "Run time", "Leuchtdauer", "Время работы"), t("8 saat", "8 hours", "8 Stunden", "8 часов")),
              KUM,
              (IP, t("IP65 · Class I", "IP65 · Class I", "IP65 · Schutzklasse I", "IP65 · класс I")),
              (r("Çalışma sıcaklığı"), k("−10 ~ +45 °C")),
              (OMUR, t("15.000 saat", "15,000 hours", "15.000 Stunden", "15 000 часов")),
              (r("Frekans"), r("50–60 Hz")),
              (ROW["olcu"], u("160 × 160 × 213 mm")),
              (t("Montaj", "Mounting", "Montage", "Монтаж"),
               t("Duvar tipi", "Wall mounting", "Wandmontage", "Настенный") if aplik else
               t("Set üstü / duvar tipi", "Pillar top / wall", "Pfeilerkopf / Wand", "На столб / на стену")),
              (t("Kutu içeriği", "Box contents", "Lieferumfang", "Комплектация"),
               t("Armatür, uzaktan kumanda, montaj aparatları, kullanım kılavuzu", "Light, remote control, mounting kit, user manual", "Leuchte, Fernbedienung, Montageset, Bedienungsanleitung", "Светильник, пульт ДУ, крепёж, инструкция")),
              (ROW["belge"], k("CE · RoHS"))]
        faq = [Q_ELK,
               (t("Işık rengini nasıl değiştiririm?", "How do I change the light colour?", "Wie ändere ich die Lichtfarbe?", "Как сменить цвет света?"),
                t("Uzaktan kumandayla 6500 K beyaz, 4000 K ılık beyaz ve 3200 K sıcak beyaz ışık ile RGB renkler arasında geçiş yapabilirsiniz.",
                  "With the remote you can switch between 6500 K white, 4000 K neutral white, 3200 K warm white and RGB colours.",
                  "Mit der Fernbedienung wechseln Sie zwischen 6500 K Weiß, 4000 K Neutralweiß, 3200 K Warmweiß und RGB-Farben.",
                  "С пульта можно переключать белый 6500 K, нейтральный 4000 K, тёплый 3200 K и цвета RGB.")),
               (t("Kaç saat yanar?", "How long does it run?", "Wie lange leuchtet sie?", "Сколько она светит?"),
                t("Üretici bilgisine göre güneşte yaklaşık 6 saatte şarj olur ve 8 saat çalışır. Gerçek süre güneşlenmeye, mevsime ve seçilen ışık moduna göre değişir.",
                  "According to the manufacturer it charges in about 6 hours of sun and runs for 8 hours. The actual time depends on sunlight, season and the selected light mode.",
                  "Laut Hersteller lädt sie in etwa 6 Sonnenstunden und leuchtet 8 Stunden. Die tatsächliche Dauer hängt von Sonne, Jahreszeit und gewähltem Lichtmodus ab.",
                  "По данным производителя заряжается примерно за 6 часов солнца и работает 8 часов. Реальное время зависит от солнца, сезона и режима света.")),
               Q_BULK, Q_KUR]
        if aplik:
            use = [("🚪", t("Giriş ve kapı", "Entrances and doors", "Eingänge und Türen", "Входы и двери"), t("Kapı yanı ve giriş aydınlatması.", "Lighting beside doors and at entrances.", "Licht neben Türen und am Eingang.", "Освещение у дверей и входа.")),
                   ("🧱", t("Bahçe duvarı", "Garden walls", "Gartenmauern", "Садовые ограды"), t("Kablo çekmeden duvar aydınlatması.", "Wall lighting without running cable.", "Wandbeleuchtung ohne Kabel.", "Освещение стен без прокладки кабеля.")),
                   ("🌿", t("Teras ve balkon", "Terraces and balconies", "Terrassen und Balkone", "Террасы и балконы"), t("Renkli ve beyaz ışık seçeneği.", "Coloured or white light.", "Farbiges oder weißes Licht.", "Цветной или белый свет.")),
                   ("🏡", t("Bağ evi", "Country houses", "Ferienhäuser", "Дачи"), t("Şebekesiz evlerde dış aydınlatma.", "Outdoor lighting for off-grid homes.", "Außenlicht für netzferne Häuser.", "Наружный свет для домов без сети."))]
            mount = t("Armatürü montaj aparatlarıyla duvara sabitleyin; üstteki panelin gün boyu güneş görmesine dikkat edin.",
                      "Fix the light to the wall with the mounting kit; make sure the panel on top sees the sun all day.",
                      "Befestigen Sie die Leuchte mit dem Montageset an der Wand; das Modul oben sollte ganztägig Sonne bekommen.",
                      "Закрепите светильник на стене крепежом; панель сверху должна весь день видеть солнце.")
            lead = t("Hero LED 50 W solar LED aplik: üstündeki güneş paneliyle şarj olur, gece 4000 lümen beyaz ya da RGB ışık verir; elektrik hattı gerektirmez.",
                     "Hero LED 50 W solar LED wall light: charges from the panel on top and gives 4000 lumens of white or RGB light at night; no power line needed.",
                     "Hero LED 50 W Solar-LED-Wandleuchte: lädt über das Modul auf der Oberseite und gibt nachts 4000 Lumen weißes oder RGB-Licht; keine Stromleitung nötig.",
                     "Солнечный настенный светильник Hero LED 50 Вт: заряжается от панели сверху, ночью даёт 4000 люмен белого или RGB-света; электролиния не нужна.")
            xs_ids = ("hero-led-bahce-50w", "hero-led-solar-sokak-100w", "hero-led-solar-sokak-200w", "hero-led-solar-sokak-600w")
        else:
            use = [("🏛️", t("Kolon ve set başı", "Pillar and ledge tops", "Pfeiler- und Sockelköpfe", "Верх колонн и бордюров"), t("Bahçe duvarı ve kolon üstü aydınlatma.", "Lighting on garden walls and pillar tops.", "Licht auf Gartenmauern und Pfeilern.", "Освещение на оградах и колоннах.")),
                   ("🚶", t("Bahçe yolu", "Garden paths", "Gartenwege", "Садовые дорожки"), t("Yol kenarı ve geçiş aydınlatması.", "Path-side and walkway lighting.", "Weg- und Durchgangsbeleuchtung.", "Освещение дорожек и проходов.")),
                   ("🚪", t("Giriş ve kapı", "Entrances and doors", "Eingänge und Türen", "Входы и двери"), t("Bahçe kapısı ve giriş aydınlatması.", "Garden gate and entrance lighting.", "Licht an Gartentor und Eingang.", "Освещение калитки и входа.")),
                   ("🌿", t("Teras ve balkon", "Terraces and balconies", "Terrassen und Balkone", "Террасы и балконы"), t("Renkli ve beyaz ışık seçeneği.", "Coloured or white light.", "Farbiges oder weißes Licht.", "Цветной или белый свет."))]
            mount = t("Armatürü montaj aparatlarıyla set, kolon başı ya da duvara sabitleyin; üstteki panelin gün boyu güneş görmesine dikkat edin.",
                      "Fix the light to a ledge, pillar top or wall with the mounting kit; make sure the panel on top sees the sun all day.",
                      "Befestigen Sie die Leuchte mit dem Montageset auf Sockel, Pfeilerkopf oder Wand; das Modul oben sollte ganztägig Sonne bekommen.",
                      "Закрепите светильник на бордюре, столбе или стене крепежом; панель сверху должна весь день видеть солнце.")
            lead = t("Hero LED 50 W solar set üstü bahçe armatürü: kolon, set ya da duvara takılır, üstündeki güneş paneliyle şarj olur ve gece 4000 lümen beyaz ya da RGB ışık verir.",
                     "Hero LED 50 W solar pillar-top garden light: fits on pillars, ledges or walls, charges from the panel on top and gives 4000 lumens of white or RGB light at night.",
                     "Hero LED 50 W Solar-Pfeilerleuchte: für Pfeiler, Sockel oder Wand, lädt über das Modul auf der Oberseite und gibt nachts 4000 Lumen weißes oder RGB-Licht.",
                     "Садовый солнечный светильник Hero LED 50 Вт: ставится на колонну, бордюр или стену, заряжается от панели сверху и ночью даёт 4000 люмен белого или RGB-света.")
            xs_ids = ("hero-led-aplik-50w", "hero-led-solar-sokak-100w", "hero-led-solar-sokak-200w", "hero-led-solar-sokak-600w")
        flow = [FLOW_PV, FLOW_DEP,
                ("🎛️", r("Uzaktan kumanda"), t("3 renk + RGB", "3 colours + RGB", "3 Farben + RGB", "3 цвета + RGB")),
                ("💡", r("Gece aydınlatma"), u("50 W"))]
        steps = [STEP_YER, (r("Monte edin"), mount), STEP_MOD]
        cta = t("Solar aydınlatmayı bugün sipariş edin", "Order the solar light today", "Bestellen Sie die Solarleuchte noch heute", "Закажите солнечный светильник сегодня")
    else:
        big = pid == "hero-led-solar-sokak-600w"
        W = "600 W" if big else "200 W"
        sp = [BR, (ROW["model"], k("HL-5157" if big else "HL-5153")), (ROW["guc"], u(W)),
              (r("Işık kaynağı"), k("SMD LED")),
              (SICAK, r("6500 K (beyaz ışık)")),
              (KAYNAKR, r("Güneş paneli (ürünle birlikte)")),
              (r("Sensör"), t("Radar hareket sensörü", "Radar motion sensor", "Radar-Bewegungssensor", "Радарный датчик движения") if big else r("Hareket sensörü — otomatik yanma")),
              (t("Çalışma modu", "Operating mode", "Betriebsart", "Режим работы"),
               t("Sensör modu · sabit yanma zaman ayarı", "Sensor mode · fixed-on timer", "Sensormodus · Zeitschaltung für Dauerlicht", "Режим датчика · таймер постоянного свечения"))]
        if big:
            sp.append((r("Çalışma süresi"), t("Sensör modunda 24–36 saat · sabit yanmada 6–8 saat (kutu bilgisi)", "24–36 h in sensor mode · 6–8 h fixed-on (box information)", "24–36 h im Sensormodus · 6–8 h Dauerlicht (Angabe auf der Verpackung)", "24–36 ч в режиме датчика · 6–8 ч постоянно (данные упаковки)")))
        sp += [KUM, (IP, k("IP65")), (OMUR, r("30.000 saat")),
               (ROW["olcu"], t("29,8 × 46,5 cm (armatür)", "29.8 × 46.5 cm (luminaire)", "29,8 × 46,5 cm (Leuchte)", "29,8 × 46,5 см (светильник)") if big else
                t("188 × 586 mm (armatür)", "188 × 586 mm (luminaire)", "188 × 586 mm (Leuchte)", "188 × 586 мм (светильник)")),
               (ROW["diger"], SOR)]
        if big:
            q_sure = (r("Kaç saat yanar?"),
                      t("Kutu bilgisine göre sensör modunda 24–36 saat, sabit yanma modunda 6–8 saat çalışır; süre güneşlenmeye ve mevsime göre değişir. Akü kapasitesi tanıtım bilgisinde yer almıyor; sipariş öncesi bize yazın, üreticiden teyit edelim.",
                        "According to the box it runs 24–36 hours in sensor mode and 6–8 hours in fixed-on mode; the time depends on sunlight and season. Battery capacity is not in the product information; write to us before ordering and we'll confirm with the manufacturer.",
                        "Laut Verpackung leuchtet sie 24–36 Stunden im Sensormodus und 6–8 Stunden im Dauerlicht; die Dauer hängt von Sonne und Jahreszeit ab. Die Akkukapazität steht nicht in den Produktinformationen; schreiben Sie uns vor der Bestellung, wir klären es mit dem Hersteller.",
                        "По данным упаковки — 24–36 часов в режиме датчика и 6–8 часов при постоянном свечении; время зависит от солнца и сезона. Ёмкость аккумулятора в описании не указана; напишите нам до заказа — уточним у производителя."))
        else:
            q_sure = (r("Kaç saat yanar, akü kapasitesi nedir?"), r("Yanma süresi güneşlenmeye ve seçilen moda göre değişir. Akü kapasitesi ve şarj süresi tanıtım bilgisinde yer almıyor; sipariş öncesi bize yazın, üreticiden teyit edelim."))
        faq = [Q_ELK,
               (r("Hareket sensörü nasıl çalışır?"), r("Sensör hareket algıladığında armatür otomatik yanar; çalışma modlarını uzaktan kumandayla seçebilirsiniz.")),
               q_sure,
               (r("Nereye monte edilir?"), r("Direğe, duvara ya da bahçe ayağına monte edilir; güneş panelinin gün boyu gölgesiz bir yönde, tercihen güneye bakması gerekir.")),
               Q_BULK, Q_KUR]
        use = [("🏡", r("Bahçe"), r("Elektrik hattı çekmeden bahçe aydınlatması.")),
               ("🛣️", r("Sokak ve site yolu"), r("Yol ve geçiş aydınlatması.")),
               ("🅿️", r("Otopark"), r("Hareketle yanan otopark aydınlatması.")),
               ("🏭", r("Fabrika ve depo"), r("Saha ve çevre aydınlatması."))]
        flow = [FLOW_PV, FLOW_DEP,
                ("📡", t("Radar sensör", "Radar sensor", "Radarsensor", "Радарный датчик"), r("otomatik yanma")) if big else ("🚶", r("Hareket sensörü"), r("otomatik yanma")),
                ("💡", r("Gece aydınlatma"), u(W))]
        steps = [STEP_YER, (r("Monte edin"), r("Armatürü direğe ya da duvara sabitleyin, paneli güneye yönlendirin.")), STEP_MOD]
        if big:
            lead = t("Hero LED 600 W solar sokak armatürü: geniş alanlar için; ayrı güneş paneliyle şarj olur, radar sensörüyle yanar, elektrik hattı ve faturası gerektirmez.",
                     "Hero LED 600 W solar street light for large areas: charges from a separate solar panel and switches on with a radar sensor; no power line, no electricity bill.",
                     "Hero LED 600 W Solar-Straßenleuchte für große Flächen: lädt über ein separates Solarmodul und schaltet per Radarsensor; ohne Stromleitung und Stromrechnung.",
                     "Солнечный уличный светильник Hero LED 600 Вт для больших площадей: заряжается от отдельной панели, включается по радару; без электролинии и счетов.")
            xs_ids = ("hero-led-solar-sokak-200w", "hero-led-solar-sokak-100w", "hero-led-bahce-50w", "hero-led-aplik-50w")
        else:
            lead = t("Hero LED 200 W solar sokak armatürü: güneş paneliyle gündüz şarj olur, gece hareket sensörüyle ya da sabit yanma modunda çalışır; elektrik hattı gerektirmez.",
                     "Hero LED 200 W solar street light: charges from its solar panel by day and works at night by motion sensor or in fixed-on mode; no power line needed.",
                     "Hero LED 200 W Solar-Straßenleuchte: lädt tagsüber über ihr Solarmodul und leuchtet nachts per Bewegungssensor oder als Dauerlicht; keine Stromleitung nötig.",
                     "Солнечный уличный светильник Hero LED 200 Вт: днём заряжается от панели, ночью работает по датчику движения или постоянно; электролиния не нужна.")
            xs_ids = ("hero-led-solar-sokak-600w", "hero-led-solar-sokak-100w", "hero-led-bahce-50w", "hero-led-aplik-50w")
        cta = r("Solar armatürü bugün sipariş edin")
    P = lighting(pk, "hero-led-solar-sokak-100w")
    P.update({
        "id": pid, "file": pid + ".html",
        "title": "%s | GESPA Enerji" % p["name"], "desc": p["desc"],
        "alt": t("%s — ürün fotoğrafı" % p["name"], "%s — product photo" % H.REG[p["name"]][0], "%s — Produktfoto" % H.REG[p["name"]][1], "%s — фото товара" % H.REG[p["name"]][2]),
        "lead": lead, "chips": p["chips"], "about": [p["desc"]], "specs": sp,
        "use": use, "use_p": t("Elektrik hattının olmadığı ya da kablo çekmenin zor olduğu dış alanlarda aydınlatma.",
                               "Outdoor lighting where there is no power line or running cable is difficult.",
                               "Außenbeleuchtung dort, wo es keine Stromleitung gibt oder Kabel schwer zu verlegen sind.",
                               "Наружное освещение там, где нет линии или сложно проложить кабель."),
        "how_p": r("Gündüz panel enerji toplar, gece armatür bu enerjiyle yanar; sensör ve kumanda çalışma şeklini belirler."),
        "flow": flow, "steps": steps, "faq": faq, "cta": cta,
        "xsell": [(x, XL[x]) for x in xs_ids],
    })
    return P


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
    prods = [panel_product(pk, *row) for row in PANELS] + [titanx(pk), accessory(pk, "kablo-solar-5m"), accessory(pk, "mc4-set"),
                                                     lighting(pk, "hero-led-ampul-10w"), lighting(pk, "hero-led-solar-sokak-100w")] + \
            [lighting2(pk, x) for x in ("hero-led-aplik-50w", "hero-led-bahce-50w", "hero-led-solar-sokak-200w", "hero-led-solar-sokak-600w")]
    pages, problems = {}, 0
    for P in prods:
        if pk[P["id"]].get("url") != P["file"]:
            sys.exit("config url uyuşmuyor (%s): %r ≠ %r" % (P["id"], pk[P["id"]].get("url"), P["file"]))
        H.KAYNAK = P["kaynak"]
        html = add_bulk(add_gallery(H.build_page(tpl, P, pk, H.main_html(P, pk)), P, pk), P, pk)
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
