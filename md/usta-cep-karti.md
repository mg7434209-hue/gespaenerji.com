---
title: "Güneş Paneli Formülleri: Solar Usta Cep Kartı (PDF) | GESPA"
description: "Güneş paneli ve solar hesaplama formülleri iki sayfada: kablo, akım, dizi, akü formülleri, bağlantı şemaları, kontrol listesi. Yazdırın ya da PDF kaydedin."
canonical: https://www.gespaenerji.com/usta-cep-karti.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Cep Kartı

# Solar Usta Cep Kartı: Güneş Paneli Hesaplama Formülleri

Elektrikçi Çantası'ndaki bütün formüller, bağlantı şemaları ve montaj kontrol listesi iki A4 sayfada. Ücretsizdir; kayıt ya da e-posta istemez.

[Hesaplama araçlarını aç](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Solar Usta Cep Kartı ön yüz · formüller ve örnekler

Örnek sayılar formülün kendisinden hesaplanmıştır; kendi değerlerinizi etiketten alın.

### Kablo

DC kablo kesiti

R = 2 × L × ρ ÷ S · gerilim düşümü = I × R · % = düşüm ÷ V × 100 · ısı kaybı = I² × R · ρ (bakır) = 0,0175 Ω·mm²/m · hedef ≤ %1

Örnek: 48 V, 15 A, tek yön 5 m, 4 mm² · R = 2 × 5 × 0,0175 ÷ 4 = 0,04375 Ω · Gerilim düşümü = 15 × 0,04375 = 0,66 V (%1,37) · ısı kaybı = 15² × 0,04375 = 9,8 W · %1 hedefi için en küçük kesit: 6 mm²

AC gerilim düşümü

tek faz ΔV = 2 × I × L × ρ × cosφ ÷ S · üç faz ΔV = √3 × I × L × ρ × cosφ ÷ S · % = ΔV ÷ V × 100 · ρ (bakır) = 0,0175 Ω·mm²/m · reaktans ihmal edilir

Örnek: 16 A, tek yön 25 m, 2,5 mm² bakır, cosφ 0,9 · Tek faz: 2 × 16 × 25 × 0,0175 × 0,9 ÷ 2,5 = 5,04 V → 5,04 ÷ 230 = %2,19

Sigorta–kablo uyumu

Ib ≤ In ≤ Iz · Ib: tasarım akımı · In: sigorta/şalter anma akımı · Iz: kablonun akım taşıma kapasitesi (üretici tablosu)

Örnek (örnek sayılar): Ib 18 A, In 20 A, Iz 24 A → 18 ≤ 20 ≤ 24: koşul sağlanır · aynı sigortayla Iz 18 A olsaydı 20 ≤ 18 olmadığı için koşul sağlanmaz

### Akım ve güç

Akım hesabı

DC: I = P ÷ V · tek faz: I = P ÷ (V × cosφ) · üç faz: I = P ÷ (√3 × V × cosφ) · kVA = kW ÷ cosφ

Örnek: 3.000 W yük, cosφ 0,9 · Tek faz 230 V: 3.000 ÷ (230 × 0,9) = 14,49 A · üç faz 400 V: 3.000 ÷ (√3 × 400 × 0,9) = 4,81 A · DC 48 V: 3.000 ÷ 48 = 62,5 A

HP → amper

kW (mil) = HP ÷ 1,341 · elektrik gücü = mil gücü ÷ verim · tek faz I = P ÷ (V × cosφ) · üç faz I = P ÷ (√3 × V × cosφ)

Örnek (örnek etiket değerleri): 2 HP, verim 0,85, cosφ 0,85 · Mil gücü = 2 ÷ 1,341 = 1,491 kW · elektrik gücü = 1,491 ÷ 0,85 = 1,755 kW

Ohm kanunu

V = I × R · P = V × I · buradan P = I² × R = V² ÷ R, I = P ÷ V, R = V ÷ I

Örnek: 12 V ve 5 A → R = 12 ÷ 5 = 2,4 Ω · P = 12 × 5 = 60 W

### Panel ve dizi

Eğim açısı

öğle güneş yüksekliği = 90 − enlem ± deklinasyon (yaz +, kış −, ekinoks 0) · pratik kural eğimi: yıl boyu ≈ enlem, yaz ≈ enlem − 15°, kış ≈ enlem + 15°

Örnek, enlem 37°: yaz 90 − 37 + 23,45 = 76,45° · ekinoks 90 − 37 = 53° · kış 90 − 37 − 23,45 = 29,55° · Pratik eğim: yıl boyu ≈ 37° · yaz ≈ 22° · kış ≈ 52°

Gölge uzunluğu

gölge uzunluğu = engel yüksekliği ÷ tan(öğle güneş yüksekliği) · öğle güneş yüksekliği = 90 − enlem ± deklinasyon

Örnek: 1 m engel, enlem 37° · kış gündönümü (güneş 29,55°): 1 ÷ tan(29,55°) = 1,76 m · ekinoks: 0,75 m · yaz gündönümü: 0,24 m

Çatı eğimi

% eğim = tan(derece) × 100 · derece = arctan(% ÷ 100) · 100 cm yatayda yükselme (cm) = % eğim

Örnek: 30° → tan(30°) × 100 = %57,74 (100 cm yatayda 57,74 cm) · %50 eğim → arctan(50 ÷ 100) = 26,57°

Günlük üretim

kWh/gün = kWp × güneş saati × sistem verimi · kWp = toplam panel gücü (W) ÷ 1000 · çalıştırma süresi (saat) = kWh × 1000 ÷ yük (W)

Örnek: 1.440 W panel = 1,44 kWp → 1,44 × 4,5 × 0,75 = 4,86 kWh/gün · Bu enerji 100 W'lık bir yükü 4,86 × 1000 ÷ 100 = 48,6 saat çalıştırır

Sıcaklıkta güç

P = Pmax × (1 + γ ÷ 100 × (Thücre − 25)) · Thücre = Tortam + (NOCT − 20) ÷ 800 × ışınım

Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Pmax 400 W, γ -0,35 %/°C, hücre 60 °C · P = 400 × (1 + (-0,35) ÷ 100 × (60 − 25)) = 351 W

Dizi hesabı

soğuk Voc = Voc × (1 + β ÷ 100 × (Tmin − 25)) · en çok seri = ⌊Vmaks giriş ÷ soğuk Voc⌋ · en az seri = ⌈VMPPT alt ÷ Vmp⌉ · dizi gerilimi = panel sayısı × panel gerilimi

Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Voc 40 V, Vmp 33 V, β -0,3 %/°C, en düşük sıcaklık -10 °C, giriş sınırı 150 V, MPPT alt sınırı 60 V · Soğuk Voc = 40 × (1 + (-0,3) ÷ 100 × (-10 − 25)) = 44,2 V · en çok ⌊150 ÷ 44,2⌋ = 3 panel · en az ⌈60 ÷ 33⌉ = 2 panel

Seri–paralel şema

toplam gerilim = panel gerilimi × seri sayısı · toplam akım = panel akımı × paralel dizi sayısı · toplam güç = toplam gerilim × toplam akım

Örnek: Vmp 34,98 V, Imp 10,3 A panel (360 W panel künyesi), 2 seri × 2 paralel · Gerilim = 34,98 × 2 = 69,96 V · akım = 10,3 × 2 = 20,6 A · güç = 69,96 × 20,6 = 1.441 W

Dizi sigortası

ters akım = (N − 1) × Isc · ters akım > etiketteki en yüksek seri sigorta değeri ise dizi sigortası gerekir

Örnek: Isc 11,37 A, etikette en yüksek seri sigorta 30 A (360 W panel künyesi) · 4 paralel dizi: (4 − 1) × 11,37 = 34,11 A → dizi sigortası gerekir

Şarj kontrol akımı

şarj akımı = panel dizisi gücü (W) ÷ akü sistem gerilimi (V)

Örnek: 1.440 W panel dizisi, 24 V akü → 1.440 ÷ 24 = 60 A

### Akü ve tüketim

Akü bankası

banka gerilimi = akü gerilimi × seri sayısı · kapasite (Ah) = akü Ah × paralel kol sayısı · enerji (kWh) = banka gerilimi × kapasite ÷ 1000

Örnek: 12 V 100 Ah akü, 2 seri × 2 paralel · Banka gerilimi = 12 × 2 = 24 V · kapasite = 100 × 2 = 200 Ah · enerji = 24 × 200 ÷ 1000 = 4,8 kWh

Akü süresi

süre (saat) = akü gerilimi × Ah × DoD × inverter verimi ÷ yük (W)

Örnek: 12 V 100 Ah akü, DoD 0,9, inverter verimi 0,92, yük 200 W · Kullanılabilir enerji = 12 × 100 × 0,9 × 0,92 = 993,6 Wh · süre = 993,6 ÷ 200 = 4,97 saat

Akü dolum süresi

şarj akımı = panel gücü (W) ÷ akü gerilimi (V) · güneşli saat = doldurulacak Ah ÷ şarj akımı · gün = güneşli saat ÷ günlük güneşli saat

Örnek: 100 Ah doldurulacak, 360 W panel, 12 V akü · Şarj akımı = 360 ÷ 12 = 30 A · süre = 100 ÷ 30 = 3,33 güneşli saat · günde 4,5 güneşli saatle 3,33 ÷ 4,5 = 0,74 gün

C oranı

akım (A) = C × kapasite (Ah) · C = akım ÷ kapasite · süre (saat) = 1 ÷ C

Örnek: 100 Ah akü, 0,5C → 0,5 × 100 = 50 A · süre = 1 ÷ 0,5 = 2 saat

İnverter akü akımı

akü akımı = yük gücü (W) ÷ (akü gerilimi (V) × inverter verimi)

Örnek: 1.000 W yük, 12 V akü, verim %92 (varsayım) → 1.000 ÷ (12 × 0,92) = 90,58 A

Cihaz listesi

Wh/gün = Σ (W × adet × saat) · panel W = Wh ÷ (güneş saati × sistem verimi) · akü Ah = Wh × gün ÷ (V × DoD × inverter verimi) · inverter W ≥ Σ (W × adet)

Toplam 1.030 Wh/gün · panel = 1.030 ÷ (4,5 × 0,75) ≈ 305 W · akü (12 V, 1 gün) = 1.030 × 1 ÷ (12 × 0,9 × 0,92) ≈ 103,7 Ah · inverter ≥ 195 W

Tüketim ve maliyet

kWh = güç (W) × saat/gün × gün ÷ 1000 · tutar = kWh × birim fiyat

Örnek: 1.000 W cihaz, günde 2 saat, 30 gün → 1.000 × 2 × 30 ÷ 1000 = 60 kWh · birim fiyat 2,5 TL/kWh (örnek) ile 60 × 2,5 = 150 TL

### Çeviriciler

Çeviriciler

A = W ÷ V · Wh = Ah × V · kW = HP ÷ 1,341 · AWG çapı (mm) = 0,127 × 92(36 − n) ÷ 39 · kesit = π × d² ÷ 4

1.000 W ÷ 12 V = 83,33 A · 100 Ah × 12 V = 1.200 Wh = 1,2 kWh · 1 HP ÷ 1,341 = 0,746 kW · AWG 10: çap = 0,127 × 92(36 − 10) ÷ 39 = 2,588 mm, kesit = π × çap² ÷ 4 = 5,26 mm²

**GESPA Enerji · Elektrikçi Çantası** · www.gespaenerji.com/elektrikci-cantasi.html · Değerler yaklaşıktır; tasarım ve kurulum yetkili kişi tarafından yapılır. Akım taşıma kapasitesi, sigorta değeri ve yönetmelik sınırları bu kartta yoktur: kablo ve cihaz üreticisinin verisine bakılır. · Üretim: 24 Kasım 2026

## Solar Usta Cep Kartı arka yüz · şemalar, tablolar, kontrol listesi

### AWG → mm² tanımdan hesaplanmıştır

| AWG | Çap (mm) | mm² |
| --- | --- | --- |
| 18 | 1,02 | 0,82 |
| 16 | 1,29 | 1,31 |
| 14 | 1,63 | 2,08 |
| 12 | 2,05 | 3,31 |
| 10 | 2,59 | 5,26 |
| 8 | 3,26 | 8,37 |
| 6 | 4,12 | 13,3 |
| 4 | 5,19 | 21,15 |
| 2 | 6,54 | 33,63 |
| 1 | 7,35 | 42,41 |
| 1/0 | 8,25 | 53,48 |
| 2/0 | 9,27 | 67,43 |
| 3/0 | 10,4 | 85,03 |
| 4/0 | 11,68 | 107,22 |

### 100 Ah → kWh tanımdan hesaplanmıştır

| Akü gerilimi | Enerji |
| --- | --- |
| 12 V | 1,2 kWh |
| 24 V | 2,4 kWh |
| 48 V | 4,8 kWh |

### kW → A tanımdan hesaplanmıştır · cosφ 0,9

| Güç | Tek faz 230 V | Üç faz 400 V |
| --- | --- | --- |
| 1 kW | 4,8 A | 1,6 A |
| 2 kW | 9,7 A | 3,2 A |
| 3 kW | 14,5 A | 4,8 A |
| 5 kW | 24,2 A | 8 A |
| 10 kW | 48,3 A | 16 A |

Tablolar yalnız tanım formüllerinden hesaplanmıştır; akım taşıma kapasitesi ya da sigorta değeri değildir.

### Montaj öncesi kontrol listesi

- DC ayırıcı ve akü sigortası açık (devre kesik); çalışma bitene kadar kapatılmayacak.
- Bağlantı yapılırken paneller örtülü ya da ışık almıyor: güneş gören panel gerilim üretir.
- Her dizinin artı ve eksi ucu, cihaza bağlanmadan önce ölçü aletiyle kontrol edildi.
- Dizinin açık devre gerilimi ölçüldü; panel sayısı × Voc ile uyumlu ve cihazın giriş sınırının altında.
- MC4 konnektörler sonuna kadar oturdu (klik sesi), hafifçe çekilerek denendi.
- Yalnızca aynı tip ve aynı üreticinin konnektörleri birbirine takıldı; farklı tipler karıştırılmadı.
- Konnektör pimleri uygun sıkma pensesiyle sıkıldı; kablo pimden çekilince çıkmıyor.
- Kablolar gergin değil; keskin kenara sürtünmüyor, kelepçeyle sabitlendi.
- Konnektörler su birikebilecek yerde durmuyor; boşta kalan uçlar kapaklı.
- Klemens, pabuç ve akü kutup başı sıkılıkları üreticinin tork değerine göre yeniden kontrol edildi.
- Bağlantı sırası cihazın kullanım kılavuzundaki sıraya göre yapıldı.
- Akü tipi ve gerilimi cihazın ayarıyla aynı; şarj profili akü üreticisinin değerlerine göre seçildi.
- Panel ve cihaz etiketlerinin fotoğrafı çekildi (seri no, Voc, Isc, giriş sınırı).
- Bağlantılar devreye almadan önce şemayla bir kez daha karşılaştırıldı.

**GESPA Enerji · Elektrikçi Çantası** · www.gespaenerji.com/elektrikci-cantasi.html · Değerler yaklaşıktır; tasarım ve kurulum yetkili kişi tarafından yapılır. Akım taşıma kapasitesi, sigorta değeri ve yönetmelik sınırları bu kartta yoktur: kablo ve cihaz üreticisinin verisine bakılır. · Üretim: 24 Kasım 2026

## Kartta ne var?

Ön yüzde güneş paneli ve elektrik hesaplarında kullanılan formüller beş grupta yer alır: kablo ve gerilim düşümü, akım ve güç, panel ve dizi, akü ve tüketim, birim çeviriciler. Her formülün yanında, sitedeki araçla aynı sonucu veren bir örnek vardır. Arka yüzde panellerin seri ve paralel bağlantısı, akü bankasının 12 V akülerle 24 V ve 48 V kurulması, öğle güneşinin yüksekliği ve panel eğimi şemaları; AWG, Ah ve kW için hesaplanmış küçük tablolar ve 14 maddelik montaj öncesi kontrol listesi bulunur.

Kart bilerek sade tutulmuştur: akım taşıma kapasitesi, sigorta değeri, izin verilen gerilim düşümü gibi tablo ve yönetmelik değerleri içermez. Bunlar döşeme şekline, ürüne ve projeye göre değişir; kablo ve cihaz üreticisinin verisinden alınır ve tasarımı yetkili kişi yapar. Kendi değerlerinizle hesap için [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html)'ndaki araçları, inverter ekranındaki kodlar için [inverter hata kodları](https://www.gespaenerji.com/inverter-hata-kodlari.html) sayfasını kullanın.

## Nasıl yazdırılır?

“Yazdır / PDF olarak kaydet” düğmesine basın. Kâğıt boyutu A4, yön dikey, ölçek %100 olmalıdır; kart iki sayfaya sığacak biçimde hazırlanmıştır. PDF almak için yazıcı olarak “PDF olarak kaydet” seçeneğini seçin. Ön ve arka yüzü tek kâğıdın iki yüzüne basıp sahada yanınızda taşıyabilirsiniz. Toplu alım yapan elektrikçi ve montajcılar [usta kaydı](https://www.gespaenerji.com/usta-kaydi.html) bırakabilir.

## Sık sorulan sorular

### Güneş paneli hesaplama formülleri nelerdir?

En çok kullanılanlar: gerilim düşümü = 2 × I × L × ρ ÷ S; tek fazda akım I = P ÷ (V × cosφ), üç fazda I = P ÷ (√3 × V × cosφ); soğukta Voc = Voc × (1 + β ÷ 100 × (en düşük sıcaklık − 25)); en çok seri panel = giriş sınırı ÷ soğuk Voc; akü süresi = V × Ah × DoD × verim ÷ yük; şarj kontrol akımı = panel gücü ÷ akü gerilimi. Kartta hepsi örneğiyle yer alır.

### Cep kartı ücretli mi, kayıt gerekiyor mu?

Hayır. Kart ücretsizdir; indirmek ya da yazdırmak için kayıt, e-posta ya da telefon istenmez.

### Kartta neden kablo akım taşıma tablosu yok?

Bir kablonun taşıyabileceği akım yalıtım tipine, döşeme şekline, ortam sıcaklığına ve yan yana kablo sayısına bağlıdır; tek bir tabloyla verilemez. Bu değer kablo üreticisinin tablosundan okunur ve tasarımı yetkili elektrikçi ya da mühendis yapar. Kart yalnız tanım ve fizik formüllerini içerir.

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/usta-cep-karti.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
