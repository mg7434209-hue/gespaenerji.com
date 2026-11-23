---
title: "Trifaze Akım ve Güç Hesabı (Formül ve Araç) | GESPA"
description: "Trifaze akım hesaplama: I = P/(√3·V·cosφ). Üç fazlı yükün akımını, gücünü ve hat gerilim düşümünü formül ve örnekle hesaplayan ücretsiz araç."
canonical: https://www.gespaenerji.com/trifaze-akim-hesaplama.html
lang: tr
dateModified: 2026-11-23
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Trifaze Akım Hesabı

# Trifaze Akım ve Güç Hesabı

Üç fazlı (trifaze) dengeli bir yükün akımını güçten, gücünü akımdan hesaplayın; aynı sayfada hattın gerilim düşümüne de bakın. Araçlar bu sayfada üç faz seçili açılır.

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

**Kısa cevap:** Üç fazlı dengeli yükte I = P ÷ (√3 × V × cosφ); V faz-faz gerilimidir. Örnek: 3.000 W yük, 400 V ve cosφ 0,9 için 4,81 A. Güç ise P = √3 × V × I × cosφ ile bulunur.

## Hesaplama aracı

### Akım hesabı: güçten akıma (DC, tek faz, üç faz) ve kW–kVA

Yükün çektiği akım, gücün gerilime bölünmesiyle bulunur. Doğru akımda I = P ÷ V; tek fazda I = P ÷ (V × cosφ); üç fazda I = P ÷ (√3 × V × cosφ), burada V faz-faz gerilimidir. Görünür güç ile aktif güç arasındaki ilişki kVA = kW ÷ cosφ şeklindedir.

Örnek: 3.000 W yük, cosφ 0,9 Tek faz 230 V: 3.000 ÷ (230 × 0,9) = 14,49 A · üç faz 400 V: 3.000 ÷ (√3 × 400 × 0,9) = 4,81 A · DC 48 V: 3.000 ÷ 48 = 62,5 A 3 kW ÷ 0,9 = 3,33 kVA

cosφ (güç katsayısı) cihazın etiketinde yazar; bilinmiyorsa varsayım olduğunu unutmayın. Motorlarda kalkış akımı bu değerin üstündedir ve bu hesaba dahil değildir.

#### Güçten akıma

Sistem

Güç (W)

Gerilim (V)

cosφ

Akım —

#### kW ↔ kVA

cosφ

Aktif güç (kW)

Görünür güç (kVA)

kW ya da kVA alanından hangisini yazarsanız diğeri hesaplanır.

**Formül:** DC: I = P ÷ V · tek faz: I = P ÷ (V × cosφ) · üç faz: I = P ÷ (√3 × V × cosφ) · kVA = kW ÷ cosφ

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

**İlgili:** [AC kablo gerilim düşümü](#ac-kablo) · [Ohm kanunu](https://www.gespaenerji.com/elektrikci-cantasi.html#ohm) · [Watt ↔ Amper çevirici](https://www.gespaenerji.com/elektrikci-cantasi.html#cevirici) · [Solar sulama pompası seçimi](https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

### AC kablo gerilim düşümü: tek faz ve üç faz

Alternatif akım hattında gerilim düşümü tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S ile hesaplanır (L tek yön uzunluk, bakır için ρ = 0,0175 Ω·mm²/m). Yüzde, tek fazda faz-nötr gerilimine (230 V), üç fazda faz-faz gerilimine (400 V) göre verilir.

Örnek: 16 A, tek yön 25 m, 2,5 mm² bakır, cosφ 0,9 Tek faz: 2 × 16 × 25 × 0,0175 × 0,9 ÷ 2,5 = 5,04 V → 5,04 ÷ 230 = %2,19 Üç faz: √3 × 16 × 25 × 0,0175 × 0,9 ÷ 2,5 = 4,36 V → 4,36 ÷ 400 = %1,09

**Sınırlar:** bu bir direnç yaklaşımıdır; kablonun reaktansı ihmal edilir. Uzun hatlarda ve büyük kesitli besleme kablolarında reaktans önem kazanır, hesabı tasarımcı yapar. Araç izin verilen gerilim düşümü sınırını ve kablonun akım taşıma kapasitesini **bilmez**: sınırı projenizden siz yazarsınız, akım kapasitesi için kablo üreticisinin tablosuna bakılır.

#### Hat bilgileri

Sistem

Gerilim (V)

Akım (A)

Uzunluk, tek yön (m)

Kesit (mm², bakır)

cosφ

Projenizdeki gerilim düşümü sınırı (%) isteğe bağlı

Gerilim düşümü (%) —

Gerilim düşümü —

Hat sonu gerilimi —

Sınırı karşılayan en küçük kesit —

**Formül:** tek faz ΔV = 2 × I × L × ρ × cosφ ÷ S · üç faz ΔV = √3 × I × L × ρ × cosφ ÷ S · % = ΔV ÷ V × 100 · ρ (bakır) = 0,0175 Ω·mm²/m · reaktans ihmal edilir

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

**İlgili:** [DC kablo kesiti ve güç kaybı](https://www.gespaenerji.com/elektrikci-cantasi.html#kablo) · [Yükten akım hesabı](#akim) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Çatı GES hizmeti](https://www.gespaenerji.com/cati-ges.html)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

## Girdiler ne anlama gelir?

- **Güç:** Üç fazın TOPLAM aktif gücü (W). Faz başına güç değil.
- **Gerilim:** Faz-faz (hat) gerilimi. Faz-nötr gerilimi ile karıştırılmamalıdır; ikisi arasındaki oran √3'tür.
- **cosφ:** Yükün güç katsayısı; motor ve cihaz etiketinde yazar.
- **Akım:** Sonuç her bir faz iletkeninden geçen hat akımıdır.

## Sık yapılan hatalar

- Toplam gücü üçe bölmeden tek faz formülüne koymak ya da faz başına gücü üç faz formülüne koymak.
- Faz-nötr gerilimini (tek faz değeri) üç faz formülünde kullanmak.
- Dengesiz yüklerde tek bir akım değeri beklemek: formül dengeli yük içindir.

## Bu hesabın sınırları

Formül dengeli, sinüzoidal üç fazlı yük içindir. Fazlar arasında dengesiz dağılmış tek fazlı yüklerde her fazın akımı ayrı hesaplanır ve nötr akımı oluşur; bu hesap tasarımcının işidir. Motorlarda kalkış akımı sonuçta yoktur.

## Sık sorulan sorular

### Trifaze akım formülü nedir?

I = P ÷ (√3 × V × cosφ). P toplam aktif güç (W), V faz-faz gerilimi, cosφ güç katsayısıdır. Örnek: 3.000 W, 400 V, cosφ 0,9 → 4,81 A.

### Trifaze 1 kW kaç amper çeker?

400 V'ta 1 kW yük cosφ 1 ile 1,44 A, cosφ 0,9 ile 1,6 A çeker. Aynı güç tek fazda (230 V) cosφ 1 ile 4,35 A eder.

### Trifaze güç nasıl hesaplanır?

Akım biliniyorsa P = √3 × V × I × cosφ. Görünür güç için cosφ çarpanı atılır: S = √3 × V × I (VA). Aktif güç ile görünür güç arasındaki ilişki kW = kVA × cosφ'dir.

### Trifaze hatta gerilim düşümü nasıl hesaplanır?

ΔV = √3 × I × L × ρ × cosφ ÷ S ve yüzde, faz-faz gerilimine göre verilir. Örnek: 16 A, 25 m, 2,5 mm² ve cosφ 0,9 için 4,36 V, yani %1,09.

## İlgili araçlar ve ürünler

- [kW Amper Hesaplama: 1 kW Kaç Amper?](https://www.gespaenerji.com/kw-amper-hesaplama.html)
- [Gerilim Düşümü Hesabı: Monofaze ve Trifaze](https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html)
- [kVA kW Çevirme: 1 kVA Kaç kW Eder?](https://www.gespaenerji.com/kva-kw-cevirme.html)
- [Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)](https://www.gespaenerji.com/kablo-kesiti-hesaplama.html)
- [Arazi tipi GES](https://www.gespaenerji.com/arazi-ges.html)
- [Çatı GES](https://www.gespaenerji.com/cati-ges.html)
- [Güneş enerjili tarımsal sulama](https://www.gespaenerji.com/tarimsal-sulama.html)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/trifaze-akim-hesaplama.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
