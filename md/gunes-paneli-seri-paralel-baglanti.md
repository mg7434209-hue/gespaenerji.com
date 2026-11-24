---
title: "Güneş Paneli Seri mi Paralel mi Bağlanır? Şema | GESPA"
description: "Güneş paneli seri paralel bağlantı şeması: seri bağlamada gerilim, paralelde akım toplanır. Kaç panel seri bağlanır hesabı ve dizi sigortası kontrolü."
canonical: https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Panel Seri–Paralel Bağlantı

# Güneş Paneli Seri mi Paralel mi Bağlanır?

Panel gerilimini, akımını ve dizilimi yazın; şema yeniden çizilir, toplam gerilim, akım ve güç hesaplanır.

## Hesaplama aracı

### Seri–paralel panel bağlantı şeması

Seri–paralel dizilimde toplam gerilim, akım ve güç; bağlantı şemasıyla.

#### Panel ve dizilim

Panel gerilimi Vmp

V

Panel akımı Imp

A

Dizideki seri panel sayısı

Paralel dizi sayısı

Paralellenen dizilerde panel sayısı ve panel tipi aynı olmalıdır. Dizi geriliminin cihaza uygunluğu için [dizi hesabına](#dizi), paralel dizilerde sigorta için [sigorta kontrolüne](#sigorta) bakın.

Toplam gerilim —

Toplam akım —

Toplam güç —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Seri bağlamada gerilimler toplanır, akım aynı kalır; paralel bağlamada akımlar toplanır, gerilim aynı kalır. Önce paneller seri bağlanarak dizi (string) kurulur, sonra eş diziler paralellenir. Toplam güç, toplam gerilim ile toplam akımın çarpımıdır.

Örnek: Vmp 34,98 V, Imp 10,3 A panel ([360 W panel künyesi](https://www.gespaenerji.com/panel-360w.html)), 2 seri × 2 paralel Gerilim = 34,98 × 2 = 69,96 V · akım = 10,3 × 2 = 20,6 A · güç = 69,96 × 20,6 = 1.441 W

**Formül:** toplam gerilim = panel gerilimi × seri sayısı · toplam akım = panel akımı × paralel dizi sayısı · toplam güç = toplam gerilim × toplam akım

**İlgili:** [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Solar kablo takımı](https://www.gespaenerji.com/kablo-solar-5m.html) · [Dizi (string) nedir?](https://www.gespaenerji.com/sozluk.html#dizi) · [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

### Dizi (string) hesabı: kaç panel seri bağlanır?

Bir diziye en çok ve en az kaç panelin seri bağlanabileceğini etiket değerlerinden hesaplar.

#### Panel etiketi

Voc

V

Vmp

V

Isc

A

Voc sıcaklık katsayısı eksi

%/°C

Beklenen en düşük hava sıcaklığı

°C

#### Şarj kontrol cihazı / inverter etiketi

En yüksek PV giriş gerilimi

V

MPPT alt gerilimi

V

Seri bağlanacak panel sayısı boşsa en çok sayı

Alanlar boş açılır; "Örnek değerler" düğmesi yuvarlak örnek sayıları doldurur (bir ürüne ait değildir).

En çok seri panel —

Soğuk Voc (panel başı) —

En az seri panel —

Dizi soğuk Voc —

Dizi Vmp (etiket) —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Panel soğudukça açık devre gerilimi (Voc) yükselir. Seri dizinin en soğuk havadaki Voc toplamı, şarj kontrol cihazının ya da inverterin en yüksek PV giriş gerilimini **hiçbir zaman** aşmamalıdır. Soğuk Voc, etiketteki Voc ile Voc sıcaklık katsayısından (β, %/°C, eksi işaretli) hesaplanır; etiket değerleri 25 °C içindir. En az panel sayısı ise dizinin Vmp toplamının MPPT alt geriliminin üstünde kalmasına göre bulunur.

Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Voc 40 V, Vmp 33 V, β -0,3 %/°C, en düşük sıcaklık -10 °C, giriş sınırı 150 V, MPPT alt sınırı 60 V Soğuk Voc = 40 × (1 + (-0,3) ÷ 100 × (-10 − 25)) = 44,2 V · en çok ⌊150 ÷ 44,2⌋ = 3 panel · en az ⌈60 ÷ 33⌉ = 2 panel 3 panel seri: soğuk Voc 132,6 V, Vmp 99 V · 4 panel olsaydı 176,8 V ile sınır aşılırdı

Sıcak havada Vmp etiket değerinin altına düşer; en az panel sayısını belirlerken panelin künyesindeki Vmp sıcaklık katsayısına ve cihazın çalışma aralığına ayrıca bakın. Değerleri her zaman kendi panelinizin ve cihazınızın etiketinden girin.

**Formül:** soğuk Voc = Voc × (1 + β ÷ 100 × (Tmin − 25)) · en çok seri = ⌊Vmaks giriş ÷ soğuk Voc⌋ · en az seri = ⌈VMPPT alt ÷ Vmp⌉ · dizi gerilimi = panel sayısı × panel gerilimi

**İlgili:** [PWM mi MPPT mi? Cihaz seçim rehberi](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) · [Şarj kontrol cihazları](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol) · [150 V girişli 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a-150v.html) · [Voc ve Isc nedir?](https://www.gespaenerji.com/sozluk.html#voc-isc)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

### Dizi sigortası gerekir mi?

Paralel dizilerde ters akımı etiketteki en yüksek seri sigorta değeriyle karşılaştırır.

#### Dizi bilgileri

Paralel dizi sayısı

N

Panel Isc

A

Etiketteki maks. seri sigorta

A

"Maksimum seri sigorta" (maximum series fuse rating) değeri panelin arka etiketinde ve künyesinde yazar.

Sonuç —

Arızalı diziye akabilecek ters akım —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Paralel bağlı dizilerden biri arızalanırsa (örneğin kısa devre), diğer sağlam diziler akımlarını o diziye doğru verebilir. Arızalı diziye akabilecek ters akım en çok (N − 1) × Isc kadardır (N paralel dizi sayısı). Bu değer, panel etiketinde yazan **en yüksek seri sigorta** değerini aşıyorsa her diziye sigorta gerekir.

Örnek: Isc 11,37 A, etikette en yüksek seri sigorta 30 A ([360 W panel künyesi](https://www.gespaenerji.com/panel-360w.html)) 4 paralel dizi: (4 − 1) × 11,37 = 34,11 A → dizi sigortası gerekir 3 paralel dizi: (3 − 1) × 11,37 = 22,74 A → bu kontrole göre gerekmez

Bu araç **yalnızca bu tek kontrolü** yapar. Sigortanın akım değeri, tipi ve diğer koruma elemanları panel ve cihaz üreticisinin talimatına göre, tasarımı yapan yetkili kişi tarafından seçilir.

**Formül:** ters akım = (N − 1) × Isc · ters akım > etiketteki en yüksek seri sigorta değeri ise dizi sigortası gerekir

**İlgili:** [Seri–paralel şema](#seri-paralel) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Isc nedir?](https://www.gespaenerji.com/sozluk.html#voc-isc) · [Toptan satış](https://www.gespaenerji.com/toptan.html)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

**Kısa cevap:** Seri bağlamada gerilimler toplanır, akım aynı kalır; paralel bağlamada akımlar toplanır, gerilim aynı kalır. Örnek: Vmp 34,98 V, Imp 10,3 A panelle 2 seri × 2 paralel → 69,96 V, 20,6 A, 1.441 W. Hangisinin seçileceğini şarj kontrol cihazının ya da inverterin giriş gerilimi aralığı belirler.

Altındaki araçlar bir diziye en çok kaç panel bağlanabileceğini ve paralel dizilerde sigorta gerekip gerekmediğini söyler.

## Girdiler ne anlama gelir?

- **Panel gerilimi ve akımı:** Çalışma noktası için Vmp ve Imp; cihazın giriş sınırı kontrolünde Voc, sigorta kontrolünde Isc kullanılır. Hepsi panelin arka etiketinde yazar.
- **Seri panel sayısı:** Bir dizideki panel sayısı; dizi gerilimini belirler.
- **Paralel dizi sayısı:** Birbirine paralel bağlanan eş dizilerin sayısı; toplam akımı belirler.
- **Voc sıcaklık katsayısı:** Soğukta gerilimin ne kadar yükseleceğini gösterir (%/°C, eksi işaretli); en çok seri panel sayısı bununla hesaplanır.

## Sık yapılan hatalar

- Dizi gerilimini soğuk hava payı olmadan hesaplamak: kış sabahında Voc etiket değerinin üstüne çıkar ve cihazın giriş sınırını aşabilir.
- Farklı güçte ya da farklı sayıda panel içeren dizileri paralellemek.
- Paralel dizi sayısını artırıp dizi sigortası kontrolünü yapmamak.
- PWM cihaza yüksek gerilimli seri dizi bağlamak.

## Bu hesabın sınırları

Şema bağlantı mantığını gösterir, montaj projesi değildir. Araçlar ideal, eş paneller varsayar; gölge, kirlenme ve panel toleransı sonucu değiştirir. Sigorta kontrolü yalnızca (N − 1) × Isc karşılaştırmasıdır; sigortanın değeri ve tipi üretici talimatına göre tasarımcı tarafından seçilir.

## Sık sorulan sorular

### Güneş panelleri seri mi paralel mi bağlanmalı?

MPPT şarj kontrol cihazı ve inverterlerde genellikle seri: gerilim yükselir, akım düşer, kablo kaybı azalır. Sınır, cihazın en yüksek PV giriş gerilimidir. PWM cihazlarda panel gerilimi akü gerilimine yakın olmalıdır; bu yüzden paneller paralel bağlanır.

### Kaç panel seri bağlanır?

En çok panel sayısı = cihazın giriş sınırı ÷ panelin soğuktaki Voc değeri, aşağı yuvarlanır. Örnek değerlerle: Voc 40 V, katsayı -0,3 %/°C ve -10 °C için soğuk Voc 44,2 V; 150 V girişli cihaza en çok 3 panel.

### Paralel bağlı panellere sigorta gerekir mi?

Arızalı bir diziye diğerlerinden akabilecek ters akım (N − 1) × Isc kadardır. Bu, panel etiketindeki en yüksek seri sigorta değerini aşıyorsa gerekir. Örnek: Isc 11,37 A, etiket 30 A ve 4 paralel dizi → 34,11 A, sigorta gerekir.

### Seri bağlı panellerden biri gölgede kalırsa ne olur?

Seri dizide akım ortaktır; gölgedeki panel bütün dizinin akımını sınırlar. Panellerin içindeki baypas diyotları etkiyi azaltır ama kayıp sürer. Gölge alan paneller ayrı bir diziye alınmaya çalışılır.

## İlgili araçlar ve ürünler

- [MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı?](https://www.gespaenerji.com/mppt-kac-amper-olmali.html)
- [Solar (DC) Kablo Kesiti Hesaplama](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)
- [Güneş Paneli Açısı Kaç Derece Olmalı?](https://www.gespaenerji.com/gunes-paneli-acisi-hesaplama.html)
- [Akü Seri-Paralel Bağlantı Şeması (24 V / 48 V)](https://www.gespaenerji.com/aku-seri-paralel-baglanti.html)
- [Güneş panelleri](https://www.gespaenerji.com/online-satis.html?kategori=panel)
- [360 W güneş paneli](https://www.gespaenerji.com/panel-360w.html)
- [Lexron 655 W panel](https://www.gespaenerji.com/panel-lexron-655w.html)
- [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
