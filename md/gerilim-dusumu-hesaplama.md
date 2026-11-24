---
title: "Gerilim Düşümü Hesabı: Monofaze ve Trifaze | GESPA"
description: "Gerilim düşümü hesaplama: monofaze 2·I·L·ρ·cosφ/S, trifaze √3·I·L·ρ·cosφ/S. Akım, mesafe ve kesitten volt ve yüzde düşümü veren ücretsiz araç."
canonical: https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Gerilim Düşümü Hesabı

# Gerilim Düşümü Hesabı: Monofaze ve Trifaze

Tek faz ve üç faz hatlarda gerilim düşümünü volt ve yüzde olarak hesaplayın.

## Hesaplama aracı

### AC kablo gerilim düşümü: tek faz ve üç faz

Tek faz ve üç faz AC hatta gerilim düşümü: volt ve yüzde.

#### Hat bilgileri

Sistem

Gerilim

V

Akım

A

Uzunluk, tek yön

m

Kesit (mm², bakır)

cosφ

Projenizdeki gerilim düşümü sınırı isteğe bağlı

%

Gerilim düşümü (%) —

Gerilim düşümü —

Hat sonu gerilimi —

Sınırı karşılayan en küçük kesit —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Alternatif akım hattında gerilim düşümü tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S ile hesaplanır (L tek yön uzunluk, bakır için ρ = 0,0175 Ω·mm²/m). Yüzde, tek fazda faz-nötr gerilimine (230 V), üç fazda faz-faz gerilimine (400 V) göre verilir.

Örnek: 16 A, tek yön 25 m, 2,5 mm² bakır, cosφ 0,9 Tek faz: 2 × 16 × 25 × 0,0175 × 0,9 ÷ 2,5 = 5,04 V → 5,04 ÷ 230 = %2,19 Üç faz: √3 × 16 × 25 × 0,0175 × 0,9 ÷ 2,5 = 4,36 V → 4,36 ÷ 400 = %1,09

**Sınırlar:** bu bir direnç yaklaşımıdır; kablonun reaktansı ihmal edilir. Uzun hatlarda ve büyük kesitli besleme kablolarında reaktans önem kazanır, hesabı tasarımcı yapar. Araç izin verilen gerilim düşümü sınırını ve kablonun akım taşıma kapasitesini **bilmez**: sınırı projenizden siz yazarsınız, akım kapasitesi için kablo üreticisinin tablosuna bakılır.

**Formül:** tek faz ΔV = 2 × I × L × ρ × cosφ ÷ S · üç faz ΔV = √3 × I × L × ρ × cosφ ÷ S · % = ΔV ÷ V × 100 · ρ (bakır) = 0,0175 Ω·mm²/m · reaktans ihmal edilir

**İlgili:** [DC kablo kesiti ve güç kaybı](#kablo) · [Yükten akım hesabı](https://www.gespaenerji.com/elektrikci-cantasi.html#akim) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Çatı GES hizmeti](https://www.gespaenerji.com/cati-ges.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

**Kısa cevap:** Tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S. Örnek: 16 A, 25 m, 2,5 mm² bakır ve cosφ 0,9 için tek fazda 5,04 V (%2,19), üç fazda 4,36 V (%1,09) düşüm oluşur.

Kendi projenizdeki sınırı yazarsanız araç o sınırı karşılayan en küçük kesiti de gösterir.

## Girdiler ne anlama gelir?

- **Sistem:** Tek faz (monofaze) hatta yüzde faz-nötr gerilimine, üç faz (trifaze) hatta faz-faz gerilimine göre hesaplanır; seçince gerilim alanı kendiliğinden değişir.
- **cosφ:** Yükün güç katsayısı; cihazın etiketinde yazar. Bilinmiyorsa yazdığınız değer bir varsayımdır.
- **Uzunluk:** Tek yön kablo boyu. Tek fazdaki 2 çarpanı gidiş ve dönüş iletkenini, üç fazdaki √3 çarpanı faz farkını temsil eder.
- **Sınır (%):** İsteğe bağlıdır. Projenizin ya da şartnamenizin izin verdiği düşümü siz yazarsınız; araç bir sınır önermez.

## Sık yapılan hatalar

- Üç faz hatta tek faz formülünü (2 çarpanı) kullanmak ya da yüzdeyi faz-nötr gerilimine bölmek.
- Motorlarda yalnızca çalışma akımına bakmak: kalkışta akım yükselir ve anlık düşüm daha büyük olur.
- Uzun ve büyük kesitli besleme hatlarında yalnız dirençle yetinmek.

## Bu hesabın sınırları

Bu bir direnç yaklaşımıdır; kablonun reaktansı ihmal edilir. Kısa ve küçük kesitli hatlarda sonuç yeterince yakındır; uzun hatlarda ve büyük kesitli kablolarda reaktans önem kazanır ve hesabı tasarımcı yapar. İzin verilen gerilim düşümü sınırı tesisin türüne ve projeye göre belirlenir; bu sayfa bir sınır değeri vermez.

## Sık sorulan sorular

### Gerilim düşümü formülü nedir?

Tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S. I akım (A), L tek yön uzunluk (m), S kesit (mm²), bakır için ρ = 0,0175 Ω·mm²/m. Yüzde düşüm, ΔV'nin hat gerilimine bölünmesiyle bulunur.

### Monofaze ve trifaze gerilim düşümü arasındaki fark nedir?

Aynı akım, uzunluk ve kesitte tek fazda çarpan 2, üç fazda √3'tür ve yüzde farklı gerilimlere göre hesaplanır. Örnek değerlerle tek fazda 5,04 V, 230 V'un %2,19'idir; üç fazda 4,36 V, 400 V'un %1,09'idir.

### Gerilim düşümü yüzde kaç olmalı?

Bu sayfa bir sınır değeri vermez. İzin verilen düşüm tesisin türüne, hattın görevine ve projeye göre değişir; değeri projenizden ya da tasarımı yapan yetkili kişiden alıp araçtaki sınır alanına yazabilirsiniz.

### Gerilim düşümünü azaltmak için ne yapılır?

Formüle göre üç yol vardır: kesiti büyütmek, hattı kısaltmak ya da aynı gücü daha yüksek gerilimde taşıyarak akımı düşürmek. Güneş sistemlerinde panelleri seri bağlayıp dizi gerilimini yükseltmek bu yüzden kablo kaybını azaltır.

## İlgili araçlar ve ürünler

- [Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)](https://www.gespaenerji.com/kablo-kesiti-hesaplama.html)
- [Trifaze Akım ve Güç Hesabı](https://www.gespaenerji.com/trifaze-akim-hesaplama.html)
- [kW Amper Hesaplama: 1 kW Kaç Amper?](https://www.gespaenerji.com/kw-amper-hesaplama.html)
- [Solar (DC) Kablo Kesiti Hesaplama](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)
- [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html)
- [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html)
- [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
