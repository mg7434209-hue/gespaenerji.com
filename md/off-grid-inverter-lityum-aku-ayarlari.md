---
title: "Off-Grid İnverter Lityum Akü Ayarı: Kılavuza Göre | GESPA"
description: "Off-grid inverterde lityum akü ayarı: üç kullanım kılavuzunun akü tipi seçenekleri, BMS haberleşmesi varken ve yokken yapılacaklar, sayfa numarasıyla."
canonical: https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Lityum Akü Ayarı

# Off-Grid İnverterde Lityum Akü Ayarı: Kılavuzlar Ne Diyor?

Kılavuzu seçin; lityum akü için hangi ayarın yapılacağını, BMS haberleşmesi varken ve yokken ne dendiğini görün.

## Arama aracı

### Off-grid inverter ayar rehberi

Üç kullanım kılavuzunun program tablosu, lityum akü ve şebeke ayarları; kılavuz sayfasıyla.

Kullanım kılavuzu

Bölüm

Program tablosunda ara

Bu araç için JavaScript gerekir; içeriğin tamamı araç sayfalarında yer alır.

Arıza devam ederse cihazı kapatın ve yetkili servise ya da satıcıya başvurun; cihazın içine yalnız yetkili kişi müdahale eder.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Üç kullanım kılavuzunda yazan ayarlar: 3,6 / 6,5 / 7,2 kW akıllı inverter (Sürüm 1.5), MEXX-P12KW (V1.1) ve 1–5 kVA akıllı inverter. “Program tablosu” ayarın numarasını, seçeneklerini ve ekran kodlarını; “Lityum akü ayarı” kılavuzun lityum akü için söylediklerini; “Şebeke bağlıyken” çıkış ve şarj önceliklerinin o cihazda ne yaptığını verir. Aynı adlı ayar iki cihazda farklı davranabilir; satırlar başka marka ya da modele uygulanmaz.

Kılavuzda okunamayan ya da kendi içinde çelişen satırlar yayınlanmamıştır. Akü şarj gerilimi gibi değerlerde akü üreticisinin değeri esastır. Statik tablolar: [lityum akü ayarı](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html) · [şebeke bağlıyken ayarlar ve program tabloları](https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html).

**İlgili:** [Lityum akü ayarı (üç kılavuz)](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html) · [Şebeke bağlıyken ayarlar](https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html) · [İnverter hata kodları](https://www.gespaenerji.com/elektrikci-cantasi.html#inverter-kodlari) · [Akü bankası bağlama](https://www.gespaenerji.com/elektrikci-cantasi.html#aku)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

**Önce şunu bilin:** Bu sayfa üç kullanım kılavuzunda yazanları yan yana verir; genel bir ayar önerisi değildir. Aynı adlı ayar iki cihazda farklı davranabilir. Akü şarj gerilimi gibi değerlerde akü üreticisinin değeri esastır. Kılavuzda okunamayan ya da kendi içinde çelişen satırlar yayınlanmamıştır.

**Kod anlamı markaya ve modele göre değişir; cihazınızın kendi kılavuzu esastır.**

## 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5): Lityum akü ayarı

Kaynak: Akıllı İnvertör Kullanım Kılavuzu — 3.6KW / 6.5KW / 7.2KW Solar Inverter / Şarj Cihazı (Sürüm 1.5) — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Akü tipi seçenekleri (program 05)

- PYL — Pylontech pil — 02, 26, 27, 29 programları otomatik kurulur (s.23)
- WEC — WECO pil (sadece 48V model) — 02, 12, 26, 27, 29 otomatik yapılandırılır (s.23)
- SOL — Soltaro pil (sadece 48V model) — 02, 26, 27, 29 otomatik kurulur (s.24)
- LIb — LIb protokolü uyumlu pil — 02, 26, 27, 29 otomatik kurulur (s.25)
- LIC — 3. parti Lityum pil — 02, 26, 27, 29 otomatik kurulur; kurulum prosedürü için akü tedarikçisine başvurun (s.25)

BMS haberleşmesi varken

Program 05 = PYL / WEC / SOL / LIb / LIC. Seçildiğinde 02, 26, 27 ve 29 (WECO'da ayrıca 12) otomatik ayarlanır; 'Daha fazla ayara gerek yok.' (s.23-25)

BMS haberleşmesi yokken

Kılavuz BMS haberleşmesiz lityum için ayrı bir prosedür vermiyor. 'Kullanıcı Tanımlı' (USE) seçilirse 26, 27 ve 29 elle ayarlanabilir (s.23) — bunu lityum için kullanın diye bir ifade kılavuzda yok.

İlgili programların aralıkları

- Program 02 — Maks. şarj akımı: 10–120A (6.5KW), 10–80A (3.6/7.2KW), adım 10A, varsayılan 60A
- Program 12 — Şebekeye dönüş voltajı (SBU): 24V 22–25,5V (vars. 23,0V); 48V 44–51V (vars. 46V)
- Program 13 — Akü moduna dönüş voltajı (SBU): 24V 24–31V veya FUL (vars. 27V); 48V 48–62V veya FUL (vars. 54V)
- Program 26 — Toplu (CV) şarj voltajı: 24V 25,0–31,0V (vars. 28,2V); 48V 48,0–62,0V (vars. 56,4V), adım 0,1V — yalnızca USE seçiliyken
- Program 27 — Yüzer (float) şarj voltajı: 24V 25,0–31,0V (vars. 27,0V); 48V 48,0–62,0V (vars. 54,0V), adım 0,1V — yalnızca USE seçiliyken
- Program 29 — Düşük DC kesme voltajı: 24V 21,0–24,0V (vars. 22,0V); 48V 42,0–48,0V (vars. 44,0V), adım 0,1V — yalnızca USE seçiliyken
- Program 41 — Maks. deşarj akımı (6.5/7.2KW): ddS (vars.) veya 30–150A

Haberleşme portu ve kablo

- BMS iletişim portu: CAN, RS-485 veya RS-232 (s.6, madde 16). Özellikler (s.5): 'BMS için çoklu iletişim portlarına sahip çıkarılabilir LCD kontrol modülü (RS485, CAN-BUS, RS232)'.
- Lityum pile bağlanıyorsanız, özel yapım bir RJ45 iletişim kablosu satın almanız önerilir. Ayrıntılar için bayinize veya entegratörünüze danışın. (s.17, 75)
- Kablo şu bilgileri taşır: şarj voltajını, şarj akımını ve akü deşarj kesme voltajını lityum pil parametrelerine göre yeniden yapılandırır; invertörün lityum pilin durumuna göre şarjı başlatmasını/durdurmasını sağlar. (s.75)
- Pylontech: 4 Dip anahtarı. Dip 1 'AÇIK' = RS485 baud hızı 9600. Dip 2,3,4 pil grubu adresi (ana bataryada): 000 = yalnızca tek grup; 100 = birinci grup; 010 = ikinci grup; 110 = üçüncü grup; 001 = dördüncü grup; 101 = beşinci grup. '1' üst konum, '0' alt konum. Maksimum lityum pil grubu 5. (s.76)
- LIO-4805 / LIO-4810-150A / ESS LIO-I 4810: her pil modülüne ID Switch ile 0–9 arası benzersiz kimlik atanır; en fazla 10 akü modülü paralel. (s.75)

Kurulum adımları: LIO-4810-150A / ESS LIO-I 4810 (program 05 = LIb)

- Adım 1: Uzatma portuna (P1 veya P2) bağlanmak için birlikte verilen RJ11 sinyal kablosunu kullanın. (s.76)
- Adım 2: İnvertör ve Lityum pili bağlamak için birlikte verilen RJ45 kablosunu (pil modülü paketinden) kullanın. (s.77)
- 3. Adım: Kesici anahtarını 'AÇIK' duruma getirin.
- 4. Adım: Pil modülündeki Güç açma/kapama düğmesine 5 saniye boyunca basın. (Düğmeye ulaşılamıyorsa sadece invertör modülünü açın; pil modülü otomatik açılır.)
- Adım 5: İnvertörü açın.
- 6. Adım: LCD program 5'te pil türünü 'LIB' olarak seçtiğinizden emin olun. İletişim başarılıysa LCD'deki pil simgesi yanıp söner; iletişim kurmak genellikle 1 dakikadan uzun sürer. (s.77-78)

Kurulum adımları: PYLONTECH (program 05 = PYL)

- 1. Adım: İnvertör ve Lityum pili bağlamak için özel yapım RJ45 kablosu kullanın. (s.78)
- 2. Adım: Lityum pili açın. (s.78)
- 3. Adım: Güç çıkışı hazır olan Lityum pili başlatmak için üç saniyeden fazla basın. (bu adım s.80'in başında basılmış; s.79'da yalnızca resim var)
- 4. Adım: İnvertörü açın. (s.79)
- 5. Adım: LCD program 5'te pil türünü 'PYL' olarak seçtiğinizden emin olun. İletişim başarılıysa pil simgesi yanıp söner. (s.79)

Paralel sistemde

Paralel sistem için not: Yalnızca yaygın [=ortak] pil kurulumunu destekler. RJ45 kablosunu herhangi bir invertöre bağlayın; LCD program 5'te bu invertörün akü tipini 'LIB' (veya Pylontech için 'PYL') olarak ayarlamanız yeterlidir. Diğerleri 'KULLANIM' [=USE] olmalıdır. (s.77-78)

Lityum akü uyarı kodları

Uyarı/bilgi kodları 60, 61, 62, 69, 70, 71 — s.80

Akü aktivasyon işlevi

Aktif İşlev (s.79): Bu işlev, devreye alma sırasında lityum pili otomatik olarak etkinleştirmektir. Akü kablolaması ve devreye alma başarılı bir şekilde yapıldıktan sonra, akü algılanmazsa, invertör açıksa invertör aküyü otomatik olarak etkinleştirir.

Güvenlik

Güvenlik talimatı 2 (s.4): 'yalnızca derin çevrimli kurşun asit tipi şarj edilebilir aküleri şarj edin. Diğer pil türleri patlayarak kişisel yaralanmalara ve hasara neden olabilir.' — kılavuzun lityum bölümüyle birlikte okunmalı (kılavuzun kendi içindeki genel uyarı).

## MEXX-P12KW (kılavuz V1.1): Lityum akü ayarı

Kaynak: MEXX-P12KW Tam Sinüs Akıllı Inverter Kullanım Kılavuzu (Off-Grid İnverter V1.1) — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Akü tipi seçenekleri

- Lityum (Varsayılan) — Lityum akü — BMS haberleşmeli; BMS Haberleşme Modu (CAN / 485) ve protokol (PYLON) seçilir. (s.43, 46)
- Lityum İletişimsiz — BMS iletişimi olmayan lityum piller. (s.43)

BMS haberleşmesi varken

- Akü tipi ayarları = Lityum (s.43)
- BMS Haberleşme Modu = CAN (varsayılan) veya 485; 'Etkin değil' = BMS iletişimi seçilmez (s.46)
- BMS Haberleşme Protokolü = PYLON (PYLONTECH) (s.46)
- Şebeke içi deşarj kesme SOC: varsayılan 50, aralık 10~90 (s.46)
- Şebeke var iken deşarj yeniden başlama SOC: varsayılan 90, aralık 20~100 (s.46)
- Şebeke yok iken deşarj yeniden başlama SOC: varsayılan 30, aralık 10~100 (s.47)
- Şarj kesme SOC: varsayılan 100 (s.47)

BMS haberleşmesi yokken

- Akü tipi ayarları = Lityum İletişimsiz (s.43)
- Alt tür: L14 / L15 / L16 (LiFePO4), N13 / N14 (üçlü lityum) veya LIT (kullanıcı parametreleri) (s.44)
- Akü şarj CV voltajı: varsayılan 56,8V, 48~59,2V — 'USE ve lityum akü olması durumunda geçerlidir' (s.44)
- Float şarj voltajı: varsayılan 55,2V, 48~58,4V (s.44)
- Akü Düşük Voltaj Kapatma Voltajı: varsayılan 40V, 40~48V — 'USE ve lityum akü olması durumunda geçerlidir' (s.45)
- LIT için uyarı: 'Kullanıcıların akü bilgilerine karşılık gelen şarj ve deşarj parametrelerini girmeleri gerekir, aksi takdirde akü hasar görür.' (s.44)

Haberleşme portu

- 5.1 RS485 Haberleşme Fonksiyonu (s.52): Bu port RS485 ve CAN'ı entegre eder: RS485 lityum akü BMS ile haberleşir (özelleştirilmiş); CAN, lityum akü BMS ile haberleşir (özelleştirilmiş). Port: 'BMS iletişim portu' (s.6, madde 8).
- Ana ekranda 'Lityum Akü İletişimi Başarılı' simgesi (s.32); SOC yüzdesi gösterilir; 'Kurşun-Asit: Gösterilmiyor SOC' (s.38).

BMS portu RJ45 pinleri

- Pin 1 — 485-B
- Pin 2 — 485-A
- Pin 3 — GND
- Pin 4 — CANH
- Pin 5 — CANL
- Pin 6 — NC
- Pin 7 — GND
- Pin 8 — BAT_NTC

s.52

Geçiş voltajları hakkında

'Aküden Şebekeye Geçiş Voltajı' ve 'Şebekeden Aküye Geçiş Voltajı' yalnızca kurşun asitli aküler için geçerlidir; BMS'li lityumda SOC ayarları kullanılır (s.45).

Lityumla ilgili arıza ve alarm kodları

- 307 Akü haberleşme hatası
- 308 BMS hatası (çözüm: BMS arıza bilgilerini kontrol edin)
- 304 Anormal BMS bilgisi

s.55-56

Akü aktivasyon (uyandırma) işlevi

Teknik tablo (s.57): 'Li-Ion Akü Uyandırma: Evet'. LIT seçeneği tanımında 'invertörün lityum akü aktivasyon fonksiyonuna sahip olması' geçiyor (s.44). Nasıl tetiklendiği anlatılmıyor.

Devreye alma adımları

Kılavuzda adım adım lityum devreye alma prosedürü yok; yalnızca menü öğeleri tanımlanmış (s.43-47).

## 1–5 kVA akıllı inverter: Lityum akü ayarı

Kaynak: 1KVA-5KVA Inverter / Charger — Akıllı İnvertör Kullanım Klavuzu — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Lityum akü desteği

Kılavuzda lityum akü bölümü, lityum akü tipi seçeneği, BMS haberleşmesi veya akü aktivasyon işlevi YOK. Program 05 seçenekleri yalnızca AGM (AGn), Sulu (FLd) ve Kullanıcı-tanımlı (USE, yalnız 4K/5K).

Kılavuzun akü uyarıları

- DİKKAT – Sakatlık riskini azaltmak için sadece derin döngülü, kurşun asit tipli ve tekrar şarj edilebilir özelliklere sahip olan aküleri şarj edin. Diğer akü türleri patlayabilir, yaralanma ve hasara sebep olabilir. (s.3)
- NOT: Sadece sızdırmaz kurşun-asit akü yada mühürlü GEL / AGM kurşun-asit akü kullanın. (s.8)

## Sık sorulan sorular

### Off-grid inverterde lityum akü ayarı her modelde aynı mıdır?

Hayır. Üç kılavuz üç ayrı şey söyler: 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5) kılavuzunda Program 05 = PYL / WEC / SOL / LIb / LIC. Seçildiğinde 02, 26, 27 ve 29 (WECO'da ayrıca 12) otomatik ayarlanır; 'Daha fazla ayara gerek yok.' (s.23-25) MEXX-P12KW (kılavuz V1.1) kılavuzunda Akü tipi ayarları = Lityum (s.43) BMS Haberleşme Modu = CAN (varsayılan) veya 485; 'Etkin değil' = BMS iletişimi seçilmez (s.46) BMS Haberleşme Protokolü = PYLON (PYLONTECH) (s.46). 1–5 kVA akıllı inverter kılavuzunda ise: Kılavuzda lityum akü bölümü, lityum akü tipi seçeneği, BMS haberleşmesi veya akü aktivasyon işlevi YOK. Program 05 seçenekleri yalnızca AGM (AGn), Sulu (FLd) ve Kullanıcı-tanımlı (USE, yalnız 4K/5K). Bu yüzden ayar yalnız cihazın kendi kılavuzuna göre yapılır.

### BMS haberleşmesi olmayan lityum akü nasıl ayarlanır?

3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5) kılavuzu: Kılavuz BMS haberleşmesiz lityum için ayrı bir prosedür vermiyor. 'Kullanıcı Tanımlı' (USE) seçilirse 26, 27 ve 29 elle ayarlanabilir (s.23) — bunu lityum için kullanın diye bir ifade kılavuzda yok. MEXX-P12KW (kılavuz V1.1) kılavuzu: Akü tipi ayarları = Lityum İletişimsiz (s.43) Alt tür: L14 / L15 / L16 (LiFePO4), N13 / N14 (üçlü lityum) veya LIT (kullanıcı parametreleri) (s.44) Akü şarj CV voltajı: varsayılan 56,8V, 48~59,2V — 'USE ve lityum akü olması durumunda geçerlidir' (s.44) Float şarj voltajı: varsayılan 55,2V, 48~58,4V (s.44) Akü Düşük Voltaj Kapatma Voltajı: varsayılan 40V, 40~48V — 'USE ve lityum akü olması durumunda geçerlidir' (s.45) LIT için uyarı: 'Kullanıcıların akü bilgilerine karşılık gelen şarj ve deşarj parametrelerini girmeleri gerekir, aksi takdirde akü hasar görür.' (s.44) Akü şarj gerilimi gibi değerlerde akü üreticisinin verdiği değer esastır.

### Bu ayarlar başka marka invertere uygulanabilir mi?

Hayır. Buradaki her satır yalnız adı yazan kılavuzdan alınmıştır; program numaraları, seçenek kodları ve aralıklar markadan markaya, hatta aynı ailenin modelleri arasında değişir. Cihazınızın kendi kılavuzu ve akü üreticisinin değerleri esastır.

Arıza devam ederse cihazı kapatın ve yetkili servise ya da satıcıya başvurun; cihazın içine yalnız yetkili kişi müdahale eder.

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 24 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
