---
title: "MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı? | GESPA"
description: "MPPT şarj kontrol cihazı kaç amper olmalı: akım = panel gücü ÷ akü gerilimi. Panel giriş gerilimi sınırı için kaç panel seri bağlanır hesabıyla birlikte."
canonical: https://www.gespaenerji.com/mppt-kac-amper-olmali.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / MPPT Kaç Amper Olmalı

# MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı?

Panel dizinizin toplam gücünü ve akü gerilimini yazın; şarj kontrol cihazının en az kaç amper olması gerektiğini görün.

## Hesaplama aracı

### Şarj kontrol cihazı kaç amper olmalı?

Panel gücü ve akü geriliminden şarj kontrol cihazının en az çıkış akımı.

#### Sistem

Panel dizisi gücü

W

Akü sistem gerilimi

V

En az çıkış akımı (pay hariç) —

Aynı dizi daha yüksek akü geriliminde daha düşük akım ister: 12 V yerine 24 V akımı yarıya indirir.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

MPPT şarj kontrol cihazının aküye vereceği akım, panel dizisinin gücünün akü sistem gerilimine bölünmesiyle bulunur: I = panel gücü ÷ akü gerilimi. Bu, cihazın çıkış akımı için **en az** değerdir; üretici pay bırakılmasını ya da panel gücü sınırını belirtiyorsa o esas alınır.

Örnek: 1.440 W panel dizisi, 24 V akü → 1.440 ÷ 24 = 60 A

Akımın yanında cihazın en yüksek PV giriş gerilimi de kontrol edilir: bunun için [dizi hesabını](#dizi) kullanın. PWM cihazlarda akım, bağlanan panellerin toplam Isc değerine göre seçilir.

**Formül:** şarj akımı = panel dizisi gücü (W) ÷ akü sistem gerilimi (V)

**İlgili:** [PWM mi MPPT mi? Seçim rehberi](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) · [Şarj kontrol cihazları](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol) · [Lexron 40 A MPPT](https://www.gespaenerji.com/lexron-mppt-40a.html) · [Havensis 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a.html) · [150 V girişli 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a-150v.html)

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

**Kısa cevap:** En az çıkış akımı = toplam panel gücü ÷ akü sistem gerilimi. Örnek: 1.440 W panel ve 24 V akü için 1.440 ÷ 24 = 60 A. Üretici pay ya da panel gücü sınırı veriyorsa o esas alınır; ayrıca dizinin soğuktaki Voc değeri cihazın giriş gerilimi sınırını aşmamalıdır.

İkinci araç, cihazın PV giriş gerilimi sınırına göre en çok kaç paneli seri bağlayabileceğinizi hesaplar.

## Girdiler ne anlama gelir?

- **Panel dizisi gücü (W):** Cihaza bağlanacak bütün panellerin etiket gücü toplamı.
- **Akü sistem gerilimi:** 12, 24 ya da 48 V gibi akü bankasının anma gerilimi; panel gerilimi değil.
- **En yüksek PV giriş gerilimi:** Cihazın etiketindeki sınır. Dizinin en soğuk havadaki Voc toplamı bunun altında kalmalıdır.
- **MPPT alt gerilimi:** Cihazın izleme yapabildiği en düşük panel gerilimi; etiketinde ya da kılavuzunda yazar.

## Sık yapılan hatalar

- Cihazı yalnızca akıma göre seçip panel giriş gerilimi sınırını kontrol etmemek.
- Akımı panel gerilimine bölerek hesaplamak: MPPT çıkış akımı akü gerilimine göre bulunur.
- PWM cihazı MPPT gibi hesaplamak; PWM'de akım, panellerin toplam Isc değerine göre seçilir.
- Akü gerilimini yükseltince aynı cihazın daha çok panel gücü taşıyabileceğini gözden kaçırmak.

## Bu hesabın sınırları

Sonuç, pay eklenmemiş en küçük değerdir. Cihaz üreticisi akü gerilimine göre bağlanabilecek en yüksek panel gücünü ayrıca belirtebilir; künyedeki sınır her zaman önce gelir. Mağazamızdaki bazı cihazların künyesinde yalnız akım ve akü gerilimi yazar; diğer değerler için bize yazın. PWM ile MPPT farkı için [seçim rehberine](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) bakın.

## Sık sorulan sorular

### Şarj kontrol cihazı akımı nasıl hesaplanır?

MPPT için toplam panel gücü akü gerilimine bölünür: 1.440 W ÷ 24 V = 60 A. Çıkan değerin üstündeki ilk cihaz seçilir; üreticinin belirttiği pay ya da panel gücü sınırı varsa ona uyulur.

### Aynı panellerle 12 V yerine 24 V akü kullanırsam ne değişir?

Akü gerilimi iki katına çıkınca aynı panel gücü için akım yarıya iner; aynı amperdeki cihaz iki kat panel gücü taşıyabilir ve akü tarafı kabloları incelir.

### MPPT cihazına kaç panel seri bağlanır?

Cihazın en yüksek PV giriş gerilimi ÷ panelin soğuktaki Voc değeri, aşağı yuvarlanır. Örnek değerlerle soğuk Voc 44,2 V ve 150 V giriş için en çok 3 panel; MPPT alt gerilimi 60 V ise en az 2 panel.

### Panel gücü cihazın akımını aşarsa ne olur?

Üreticiye göre değişir: bazı cihazlar akımı kendi sınırında tutar ve fazla enerjiyi kullanmaz, bazıları için izin verilen en yüksek panel gücü kesin sınırdır. Cihazın kılavuzundaki değere uyun.

## İlgili araçlar ve ürünler

- [Güneş Paneli Seri mi Paralel mi Bağlanır?](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)
- [Akü Seri-Paralel Bağlantı Şeması (24 V / 48 V)](https://www.gespaenerji.com/aku-seri-paralel-baglanti.html)
- [Solar (DC) Kablo Kesiti Hesaplama](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)
- [İnvertör Aküden Kaç Amper Çeker?](https://www.gespaenerji.com/invertor-akuden-kac-amper-ceker.html)
- [Şarj kontrol cihazları](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol)
- [Lexron 40 A MPPT](https://www.gespaenerji.com/lexron-mppt-40a.html)
- [Havensis 60 A MPPT (150 V giriş)](https://www.gespaenerji.com/havensis-mppt-60a-150v.html)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/mppt-kac-amper-olmali.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
