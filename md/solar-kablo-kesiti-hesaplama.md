---
title: "Solar Kablo Kesiti Hesaplama (DC) | GESPA Enerji"
description: "Solar kablo kesiti hesaplama: panel–şarj kontrol ve akü–inverter hatlarında DC gerilim düşümü, ısıya giden güç ve hedefi karşılayan en küçük kesit."
canonical: https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Solar Kablo Kesiti

# Solar (DC) Kablo Kesiti Hesaplama

Panel ile şarj kontrol cihazı ya da akü ile inverter arasındaki DC hat için gerilim düşümünü, kabloda ısıya giden gücü ve hedefi karşılayan en küçük kesiti hesaplayın.

## Hesaplama aracı

### DC kablo kesiti, gerilim düşümü ve güç kaybı

DC hatta gerilim düşümü, ısıya giden güç ve hedefi karşılayan en küçük kesit.

#### Hat bilgileri

Sistem gerilimi

V

Akım

A

Kablo uzunluğu, tek yön

m

Kesit (mm²)

Hedefi karşılayan en küçük kesit —

Gerilim düşümü —

Gerilim düşümü (%) —

Isıya giden güç —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Kablo bir dirençtir: üzerinden akım geçtikçe gerilim düşer ve aradaki fark ısıya dönüşür. Hattın direnci R = 2 × L × ρ ÷ S ile bulunur (L tek yön uzunluk, 2 çarpanı gidiş-dönüş içindir; bakır için ρ = 0,0175 Ω·mm²/m). Gerilim düşümü I × R, ısıya giden güç I² × R olur. Bu araç gerilim düşümünü %1 altında tutan en küçük kesiti de gösterir.

Örnek: 48 V, 15 A, tek yön 5 m, 4 mm² · R = 2 × 5 × 0,0175 ÷ 4 = 0,04375 Ω Gerilim düşümü = 15 × 0,04375 = 0,66 V (%1,37) · ısı kaybı = 15² × 0,04375 = 9,8 W · %1 hedefi için en küçük kesit: 6 mm²

**Önemli:** bu hesap yalnızca gerilim düşümüne bakar. Kablonun taşıyabileceği akım (döşeme şekli, ortam sıcaklığı, demet sayısı) ayrı bir kontroldür; onun için kablo üreticisinin akım taşıma tablosuna bakılır ve tasarımı yetkili elektrikçi ya da mühendis yapar.

**Formül:** R = 2 × L × ρ ÷ S · gerilim düşümü = I × R · % = düşüm ÷ V × 100 · ısı kaybı = I² × R · ρ (bakır) = 0,0175 Ω·mm²/m · hedef ≤ %1

**İlgili:** [DC kablo kesiti aracı (tüm kesitlerin tablosu)](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### İnverter aküden kaç amper çeker?

İnverterin yük altında aküden çektiği akım.

#### Yük ve akü

Yük

W

Akü gerilimi

V

İnverter verimi varsayım

%

Akü tarafı akımı —

Verim bir varsayımdır; inverterinizin künyesindeki değeri yazın.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

İnverter, AC yükün gücünü aküden DC olarak çeker; akü gerilimi düşük olduğu için akım yüksektir: I = yük gücü ÷ (akü gerilimi × inverter verimi). Verim bir varsayımdır ve inverterin künyesinden alınır.

Örnek: 1.000 W yük, 12 V akü, verim %92 (varsayım) → 1.000 ÷ (12 × 0,92) = 90,58 A

Bu akım akü ile inverter arasındaki kablodan geçer; kabloyu kısa tutun ve hesaplanan akımı [DC kablo aracına](#kablo) aktarıp gerilim düşümüne bakın. Kablonun akım taşıma kapasitesi ve sigorta değeri için inverter ve kablo üreticisinin verisi esastır; bu araç sigorta değeri önermez. Motorlu yüklerin kalkış akımı hesaba dahil değildir.

**Formül:** akü akımı = yük gücü (W) ÷ (akü gerilimi (V) × inverter verimi)

**İlgili:** [DC kablo kesiti ve gerilim düşümü](#kablo) · [Akü kaç saat dayanır?](https://www.gespaenerji.com/elektrikci-cantasi.html#aku-sure) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [1200 W güç istasyonu](https://www.gespaenerji.com/lexron-guc-istasyonu-1200w.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

**Kısa cevap:** DC hatta R = 2 × L × ρ ÷ S, gerilim düşümü I × R, ısı kaybı I² × R'dir. Örnek: 48 V, 15 A, tek yön 5 m, 4 mm² → 0,66 V (%1,37) düşüm ve 9,8 W ısı kaybı; %1 hedefini 6 mm² karşılar.

## Girdiler ne anlama gelir?

- **Sistem gerilimi:** Panel tarafında dizinin çalışma gerilimi (Vmp toplamı), akü tarafında akü gerilimi.
- **Akım:** Panel tarafında dizinin akımı (Imp, güvenli tarafta kalmak için Isc), akü–inverter hattında inverterin aküden çektiği akım. İkincisini sayfadaki inverter aracı hesaplar ve tek tıkla kablo aracına aktarır.
- **Uzunluk:** Tek yön kablo boyu; artı ve eksi iletken formüldeki 2 çarpanıyla hesaba girer.
- **Kesit:** Solar kablolarda yaygın kesitler listelenir; şemadaki daireler iletken kesitlerini aynı ölçekte gösterir.

## Sık yapılan hatalar

- Akü–inverter kablosunu panel kablosuyla aynı kesitte seçmek: akü tarafında gerilim düşük, akım çok yüksektir.
- Panelleri paralel bağlayıp akımı büyütmek ve uzun hattı ince kabloyla çekmek; seri bağlamak aynı güçte akımı düşürür.
- MC4 konnektörü kablo kesitine uygun olmayan pimle sıkmak.
- Yalnız gerilim düşümüne bakıp kablonun akım taşıma kapasitesini üretici tablosundan kontrol etmemek.

## Bu hesabın sınırları

Hesap bakır iletken ve sabit akım içindir. Güneşte ısınan çatıda kablonun taşıyabileceği akım azalır; bu değer kablo üreticisinin tablosundan okunur. Mağazamızdaki [solar kablo takımının](https://www.gespaenerji.com/kablo-solar-5m.html) kesiti stoğa göre değişir; hesabınız için gereken kesiti siparişten önce bize yazın.

## Sık sorulan sorular

### Güneş paneli için kaç mm² kablo kullanılır?

Tek bir cevap yoktur: kesit, dizinin akımına, gerilimine ve kablo boyuna bağlıdır. Aracı kendi değerlerinizle çalıştırın; örnek hatta 48 V, 15 A ve 5 m için %1 hedefini 6 mm² karşılar. Akım taşıma kapasitesini kablo üreticisinin tablosundan ayrıca kontrol edin.

### Panel kablosu uzarsa ne olur?

Gerilim düşümü ve ısıya giden güç uzunlukla doğru orantılı artar; üretilen enerjinin bir bölümü kabloda kaybolur. Hattı kısaltmak, kesiti büyütmek ya da panelleri seri bağlayıp gerilimi yükseltmek kaybı azaltır.

### Akü ile inverter arası kablo nasıl hesaplanır?

Önce inverterin aküden çektiği akım bulunur: I = yük ÷ (akü gerilimi × verim). Örnek: 1.000 W yük, 12 V akü ve %92 verim varsayımıyla 90,58 A. Bu akım kablo aracına aktarılır ve gerilim düşümüne bakılır; kablo olabildiğince kısa tutulur.

## İlgili araçlar ve ürünler

- [Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)](https://www.gespaenerji.com/kablo-kesiti-hesaplama.html)
- [İnvertör Aküden Kaç Amper Çeker?](https://www.gespaenerji.com/invertor-akuden-kac-amper-ceker.html)
- [Güneş Paneli Seri mi Paralel mi Bağlanır?](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)
- [AWG mm² Çevirme](https://www.gespaenerji.com/awg-mm2-cevirme.html)
- [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html)
- [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html)
- [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
