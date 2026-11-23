---
title: "Kablo Kesiti Hesaplama: Güç ve Mesafeye Göre | GESPA"
description: "Kablo kesiti hesaplama aracı: akım ve mesafeye göre gerilim düşümü, DC ve AC (monofaze, trifaze) hatlar için formül, örnek hesap ve sigorta–kablo kontrolü."
canonical: https://www.gespaenerji.com/kablo-kesiti-hesaplama.html
lang: tr
dateModified: 2026-11-23
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Kablo Kesiti Hesaplama

# Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)

Akımı, tek yön uzunluğu ve gerilimi yazın; araç gerilim düşümünü ve hedefi karşılayan en küçük bakır kesiti verir. DC hatlar, tek faz ve üç faz AC hatlar aynı sayfada.

Yayın: 23 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

**Kısa cevap:** Kablo kesiti iki ayrı kontrolle seçilir: gerilim düşümü ve akım taşıma kapasitesi. Gerilim düşümü formülle hesaplanır (DC ve tek fazda 2 × I × L × ρ ÷ S). Örnek: 48 V, 15 A, tek yön 5 m hatta 4 mm² kablo %1,37 düşüm verir; %1 hedefini 6 mm² karşılar. Akım taşıma kapasitesi ise kablo üreticisinin tablosundan okunur.

## Hesaplama aracı

### DC kablo kesiti, gerilim düşümü ve güç kaybı

Kablo bir dirençtir: üzerinden akım geçtikçe gerilim düşer ve aradaki fark ısıya dönüşür. Hattın direnci R = 2 × L × ρ ÷ S ile bulunur (L tek yön uzunluk, 2 çarpanı gidiş-dönüş içindir; bakır için ρ = 0,0175 Ω·mm²/m). Gerilim düşümü I × R, ısıya giden güç I² × R olur. Bu araç gerilim düşümünü %1 altında tutan en küçük kesiti de gösterir.

Örnek: 48 V, 15 A, tek yön 5 m, 4 mm² · R = 2 × 5 × 0,0175 ÷ 4 = 0,04375 Ω Gerilim düşümü = 15 × 0,04375 = 0,66 V (%1,37) · ısı kaybı = 15² × 0,04375 = 9,8 W · %1 hedefi için en küçük kesit: 6 mm²

**Önemli:** bu hesap yalnızca gerilim düşümüne bakar. Kablonun taşıyabileceği akım (döşeme şekli, ortam sıcaklığı, demet sayısı) ayrı bir kontroldür; onun için kablo üreticisinin akım taşıma tablosuna bakılır ve tasarımı yetkili elektrikçi ya da mühendis yapar.

#### Hat bilgileri

Sistem gerilimi (V)

Akım (A)

Kablo uzunluğu, tek yön (m)

Kesit (mm²)

Hedefi karşılayan en küçük kesit —

Gerilim düşümü —

Gerilim düşümü (%) —

Isıya giden güç —

**Formül:** R = 2 × L × ρ ÷ S · gerilim düşümü = I × R · % = düşüm ÷ V × 100 · ısı kaybı = I² × R · ρ (bakır) = 0,0175 Ω·mm²/m · hedef ≤ %1

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

**İlgili:** [DC kablo kesiti aracı (tüm kesitlerin tablosu)](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

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

**İlgili:** [DC kablo kesiti ve güç kaybı](#kablo) · [Yükten akım hesabı](https://www.gespaenerji.com/elektrikci-cantasi.html#akim) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Çatı GES hizmeti](https://www.gespaenerji.com/cati-ges.html)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

### Sigorta–kablo uyum kontrolü (Ib ≤ In ≤ Iz)

Bir hattın koruması için temel koşul: tasarım akımı (Ib) ≤ sigorta ya da şalterin anma akımı (In) ≤ kablonun akım taşıma kapasitesi (Iz). İlk eşitsizlik sağlanmazsa sigorta normal yükte açar; ikincisi sağlanmazsa sigorta kabloyu korumaz.

Örnek (örnek sayılar): Ib 18 A, In 20 A, Iz 24 A → 18 ≤ 20 ≤ 24: koşul sağlanır · aynı sigortayla Iz 18 A olsaydı 20 ≤ 18 olmadığı için koşul sağlanmaz

**Iz bu sayfada yoktur ve olmayacaktır:** kablonun akım taşıma kapasitesi döşeme şekline, ortam sıcaklığına, yan yana kablo sayısına ve yalıtım tipine göre değişir; kablo üreticisinin tablosundan okunur ve tasarımı yapan yetkili kişi belirler. Bu araç yalnızca yazdığınız üç sayıyı karşılaştırır; sigortanın açma karakteristiği, kısa devre dayanımı ve diğer koşullar tasarımcının işidir.

#### Üç akım değeri

Tasarım (yük) akımı Ib (A)

Sigorta / şalter anma akımı In (A)

Kablonun akım taşıma kapasitesi Iz (A) üretici tablosundan

Örnek değerler rastgele sayılardır; bir kabloya ait değildir.

Sonuç —

**Formül:** Ib ≤ In ≤ Iz · Ib: tasarım akımı · In: sigorta/şalter anma akımı · Iz: kablonun akım taşıma kapasitesi (üretici tablosu)

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

**İlgili:** [Güçten akım hesabı (Ib)](https://www.gespaenerji.com/elektrikci-cantasi.html#akim) · [AC gerilim düşümü](#ac-kablo) · [DC kablo kesiti](#kablo) · [Dizi sigortası kontrolü](https://www.gespaenerji.com/elektrikci-cantasi.html#sigorta)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

## Girdiler ne anlama gelir?

- **Akım (A):** Hattan geçecek en yüksek sürekli akım. Elinizde güç (W ya da kW) varsa önce [kW amper hesaplama](https://www.gespaenerji.com/kw-amper-hesaplama.html) ile akıma çevirin.
- **Uzunluk (m):** Kaynaktan yüke TEK YÖN kablo boyu. Gidiş ve dönüş iletkeni formüldeki 2 çarpanıyla (üç fazda √3) hesaba girer; uzunluğu ikiyle çarpıp yazmayın.
- **Gerilim (V):** Yüzde düşüm bu değere göre hesaplanır. Aynı akım ve uzunlukta volt cinsinden düşüm aynıdır, ama düşük gerilimli sistemde yüzdesi büyür.
- **Kesit (mm²):** Bakır iletkenin kesit alanı. Araç yalnızca bakır için hesap yapar.

## Sık yapılan hatalar

- Uzunluğu gidiş-dönüş toplamı olarak yazıp düşümü iki kat hesaplamak.
- Kesiti yalnızca gerilim düşümüne göre seçip akım taşıma kapasitesine bakmamak ya da tersini yapmak: ikisi de sağlanmalıdır.
- 12 V ve 24 V sistemlerde şebeke alışkanlığıyla ince kablo seçmek: düşük gerilimde aynı güç çok daha yüksek akım demektir.
- Sigortayı kablonun taşıyabileceği akımdan büyük seçmek.

## Bu hesabın sınırları

Araç gerilim düşümünü direnç üzerinden hesaplar; AC tarafta reaktans ihmal edilir. Akım taşıma kapasitesi, izin verilen gerilim düşümü sınırı ve sigorta seçimi bu sayfada verilmez: bunlar döşeme şekline, sıcaklığa ve projeye bağlıdır, kablo üreticisinin tablosundan ve tasarımı yapan yetkili kişiden alınır.

## Sık sorulan sorular

### Kablo kesiti neye göre seçilir?

İki koşula göre: hat sonundaki gerilim düşümü kabul ettiğiniz sınırın altında kalmalı ve kablonun akım taşıma kapasitesi hattın akımından büyük olmalıdır. Gerilim düşümü akım, uzunluk ve kesitten formülle hesaplanır; akım taşıma kapasitesi kablo üreticisinin tablosundan okunur.

### Mesafe arttıkça kablo kesiti neden büyür?

Kablonun direnci uzunlukla doğru orantılıdır (R = 2 × L × ρ ÷ S). Uzunluk iki katına çıkınca aynı kesitte gerilim düşümü de iki katına çıkar; aynı düşümü korumak için kesit de iki katına çıkarılır.

### 12 V sistemde kablo neden daha kalın olur?

Aynı güç düşük gerilimde daha yüksek akım demektir ve volt cinsinden aynı düşüm, düşük gerilimde daha büyük bir yüzde eder. Örnek hatta 15 A ve 5 m için 4 mm² kabloda düşüm 0,66 V'tur; bu, 48 V sistemde %1,37 eder.

### Bu araç kablonun kaç amper taşıyacağını söyler mi?

Hayır. Akım taşıma kapasitesi döşeme şekline, ortam sıcaklığına ve yan yana kablo sayısına bağlıdır; kablo üreticisinin tablosundan okunur. Sayfadaki uyum kontrolü, tablodan okuduğunuz değeri sigorta ve yük akımıyla karşılaştırır.

## İlgili araçlar ve ürünler

- [Gerilim Düşümü Hesabı: Monofaze ve Trifaze](https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html)
- [Solar (DC) Kablo Kesiti Hesaplama](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)
- [kW Amper Hesaplama: 1 kW Kaç Amper?](https://www.gespaenerji.com/kw-amper-hesaplama.html)
- [AWG mm² Çevirme](https://www.gespaenerji.com/awg-mm2-cevirme.html)
- [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html)
- [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html)
- [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/kablo-kesiti-hesaplama.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
