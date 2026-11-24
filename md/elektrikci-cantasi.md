---
title: "Elektrik ve Solar Hesaplama Araçları | Elektrikçi Çantası"
description: "Ücretsiz hesaplama araçları: kablo kesiti, gerilim düşümü, kW amper, trifaze akım, panel açısı, akü kaç saat dayanır, MPPT kaç amper, AWG mm² çevirme."
canonical: https://www.gespaenerji.com/elektrikci-cantasi.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Rehberler](https://www.gespaenerji.com/rehberler.html) / Elektrikçi Çantası

# Elektrikçi Çantası: Ücretsiz Elektrik ve Solar Hesaplama Araçları

26 ücretsiz hesaplama aracı: listeden aracı seçin, etiketteki değerleri yazın, sonucu anında görün.

## 🔻 Kablo ve akım

DC ve AC hatlarda gerilim düşümü, güçten akım, motor akımı, Ohm kanunu ve sigorta–kablo uyumu.

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Solar Kablo Kesiti](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)

**İlgili:** [DC kablo kesiti aracı (tüm kesitlerin tablosu)](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Solar kablo takımı 5 m + 5 m](https://www.gespaenerji.com/kablo-solar-5m.html) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Kablo ve konnektörler](https://www.gespaenerji.com/online-satis.html?kategori=kablo)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Gerilim Düşümü Hesabı](https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html)

**İlgili:** [DC kablo kesiti ve güç kaybı](#kablo) · [Yükten akım hesabı](#akim) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Çatı GES hizmeti](https://www.gespaenerji.com/cati-ges.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Akım hesabı: güçten akıma (DC, tek faz, üç faz) ve kW–kVA

Güçten akım: DC, tek faz ve üç faz; ayrıca kW ↔ kVA.

#### Güçten akıma

Sistem

Güç

W

Gerilim

V

cosφ

Akım —

#### kW ↔ kVA

cosφ

Aktif güç

kW

Görünür güç

kVA

kW ya da kVA alanından hangisini yazarsanız diğeri hesaplanır.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Yükün çektiği akım, gücün gerilime bölünmesiyle bulunur. Doğru akımda I = P ÷ V; tek fazda I = P ÷ (V × cosφ); üç fazda I = P ÷ (√3 × V × cosφ), burada V faz-faz gerilimidir. Görünür güç ile aktif güç arasındaki ilişki kVA = kW ÷ cosφ şeklindedir.

Örnek: 3.000 W yük, cosφ 0,9 Tek faz 230 V: 3.000 ÷ (230 × 0,9) = 14,49 A · üç faz 400 V: 3.000 ÷ (√3 × 400 × 0,9) = 4,81 A · DC 48 V: 3.000 ÷ 48 = 62,5 A 3 kW ÷ 0,9 = 3,33 kVA

cosφ (güç katsayısı) cihazın etiketinde yazar; bilinmiyorsa varsayım olduğunu unutmayın. Motorlarda kalkış akımı bu değerin üstündedir ve bu hesaba dahil değildir.

**Formül:** DC: I = P ÷ V · tek faz: I = P ÷ (V × cosφ) · üç faz: I = P ÷ (√3 × V × cosφ) · kVA = kW ÷ cosφ

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [kW Amper Hesaplama](https://www.gespaenerji.com/kw-amper-hesaplama.html)

**İlgili:** [AC kablo gerilim düşümü](#ac-kablo) · [Ohm kanunu](#ohm) · [Watt ↔ Amper çevirici](#cevirici) · [Solar sulama pompası seçimi](https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### HP → kW → amper: motor akımı

Motor etiketindeki HP değerinden kW ve çalışma akımı.

#### Motor etiketi

Güç

HP

Besleme

Gerilim

V

Verim etiket

%

cosφ etiket

Çalışma akımı (kalkış hariç) —

Mil gücü —

Çekilen elektrik gücü —

Açılıştaki verim ve cosφ yalnızca örnektir; motorunuzun etiketindeki değerleri yazın.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Motor etiketindeki beygir gücü mil (çıkış) gücüdür: kW = HP ÷ 1,341. Şebekeden çekilen elektrik gücü mil gücünün verime bölünmesiyle bulunur; akım ise tek fazda I = P ÷ (V × cosφ), üç fazda I = P ÷ (√3 × V × cosφ) formülüyle hesaplanır. Verim ve cosφ motorun etiketinden girilir.

Örnek (örnek etiket değerleri): 2 HP, verim 0,85, cosφ 0,85 Mil gücü = 2 ÷ 1,341 = 1,491 kW · elektrik gücü = 1,491 ÷ 0,85 = 1,755 kW Tek faz 230 V: 8,98 A · üç faz 400 V: 2,98 A

Sonuç tam yükteki çalışma akımıdır. **Kalkış akımı dahil değildir**; kalkışta motor bunun birkaç katını çeker ve değeri motor üreticisi verir. Etikette anma akımı yazıyorsa o esas alınır.

**Formül:** kW (mil) = HP ÷ 1,341 · elektrik gücü = mil gücü ÷ verim · tek faz I = P ÷ (V × cosφ) · üç faz I = P ÷ (√3 × V × cosφ)

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [kW Amper Hesaplama](https://www.gespaenerji.com/kw-amper-hesaplama.html)

**İlgili:** [Güçten akım hesabı](#akim) · [AC gerilim düşümü](#ac-kablo) · [Solar sulama pompası seçimi](https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html) · [Pompa ve panel gücü aracı](https://www.gespaenerji.com/tarimsal-sulama.html#pompa-secimi)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Ohm kanunu ve güç hesaplayıcı

Volt, amper, ohm ve watt: ikisini yazın, diğer ikisi hesaplansın.

#### Bildiğiniz iki değeri yazın

Gerilim V

V

Akım I

A

Direnç R

Ω

Güç P

W

Gerilim —

Akım —

Direnç —

Güç —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Gerilim (V), akım (I), direnç (R) ve güç (P) arasındaki iki temel bağıntı V = I × R ve P = V × I'dir. Dört büyüklükten herhangi ikisi bilinince diğer ikisi bulunur.

Örnek: 12 V ve 5 A → R = 12 ÷ 5 = 2,4 Ω · P = 12 × 5 = 60 W

**Formül:** V = I × R · P = V × I · buradan P = I² × R = V² ÷ R, I = P ÷ V, R = V ÷ I

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Ohm Kanunu Hesaplama](https://www.gespaenerji.com/ohm-kanunu-hesaplama.html)

**İlgili:** [Akım hesabı](#akim) · [Kablo kesiti ve güç kaybı](#kablo) · [Hızlı çeviriciler](#cevirici) · [GES Sözlüğü](https://www.gespaenerji.com/sozluk.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Sigorta–kablo uyum kontrolü (Ib ≤ In ≤ Iz)

Ib ≤ In ≤ Iz koşulunu yazdığınız üç değerle kontrol eder.

#### Üç akım değeri

Tasarım (yük) akımı Ib

A

Sigorta / şalter anma akımı In

A

Kablonun akım taşıma kapasitesi Iz üretici tablosundan

A

Alanlar boş açılır; "Örnek değerler" düğmesi rastgele örnek sayıları doldurur (bir kabloya ait değildir).

Sonuç —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Bir hattın koruması için temel koşul: tasarım akımı (Ib) ≤ sigorta ya da şalterin anma akımı (In) ≤ kablonun akım taşıma kapasitesi (Iz). İlk eşitsizlik sağlanmazsa sigorta normal yükte açar; ikincisi sağlanmazsa sigorta kabloyu korumaz.

Örnek (örnek sayılar): Ib 18 A, In 20 A, Iz 24 A → 18 ≤ 20 ≤ 24: koşul sağlanır · aynı sigortayla Iz 18 A olsaydı 20 ≤ 18 olmadığı için koşul sağlanmaz

**Iz bu sayfada yoktur ve olmayacaktır:** kablonun akım taşıma kapasitesi döşeme şekline, ortam sıcaklığına, yan yana kablo sayısına ve yalıtım tipine göre değişir; kablo üreticisinin tablosundan okunur ve tasarımı yapan yetkili kişi belirler. Bu araç yalnızca yazdığınız üç sayıyı karşılaştırır; sigortanın açma karakteristiği, kısa devre dayanımı ve diğer koşullar tasarımcının işidir.

**Formül:** Ib ≤ In ≤ Iz · Ib: tasarım akımı · In: sigorta/şalter anma akımı · Iz: kablonun akım taşıma kapasitesi (üretici tablosu)

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Kablo Kesiti Hesaplama](https://www.gespaenerji.com/kablo-kesiti-hesaplama.html)

**İlgili:** [Güçten akım hesabı (Ib)](#akim) · [AC gerilim düşümü](#ac-kablo) · [DC kablo kesiti](#kablo) · [Dizi sigortası kontrolü](#sigorta)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## ☀️ Güneş ve konum

Güneşin yüksekliği, eğim, gölge ve üretim tahmini.

### Panel eğim açısı ve öğle güneşi yüksekliği

Enleme göre öğle güneşinin yüksekliği ve yıl boyu, yaz, kış için pratik panel eğimi.

#### Enlem

Enlem

° kuzey

Şehirden seç

Şemadaki mevsim

Eğim, panelin yatayla yaptığı açıdır; panel güneye bakar. Pratik kural bir başlangıç değeridir: çatı eğimi, gölge ve kullanım mevsimi sonucu değiştirir.

Yaz gündönümü —

Ekinoks —

Kış gündönümü —

Pratik kural eğimleri

Yıl boyu —

Yaz —

Kış —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Güneşin öğle vakti ufuktan yüksekliği enleme ve mevsime bağlıdır: yüksekliği 90 − enlem alın, yaz gündönümünde deklinasyonu (23,45°) ekleyin, kış gündönümünde çıkarın. Panel eğimi için sahada kullanılan **pratik kural** ise şudur: yıl boyu kullanım için eğim ≈ enlem, yaz ağırlıklı kullanım için enlem − 15°, kış ağırlıklı kullanım için enlem + 15°.

Örnek, enlem 37°: yaz 90 − 37 + 23,45 = 76,45° · ekinoks 90 − 37 = 53° · kış 90 − 37 − 23,45 = 29,55° Pratik eğim: yıl boyu ≈ 37° · yaz ≈ 22° · kış ≈ 52°

**Formül:** öğle güneş yüksekliği = 90 − enlem ± deklinasyon (yaz +, kış −, ekinoks 0) · pratik kural eğimi: yıl boyu ≈ enlem, yaz ≈ enlem − 15°, kış ≈ enlem + 15°

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Güneş Paneli Açısı](https://www.gespaenerji.com/gunes-paneli-acisi-hesaplama.html)

**İlgili:** [Sıra aralığı ve gölgelenme aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Panel yerleşim planlayıcı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Gölgelenme nedir?](https://www.gespaenerji.com/sozluk.html#golgelenme) · [Güneş panelleri](https://www.gespaenerji.com/online-satis.html?kategori=panel)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Engel gölge uzunluğu

Baca, parapet ya da panel sırasının öğle vaktindeki gölge uzunluğu.

#### Engel ve konum

Engel yüksekliği

m

Enlem

° kuzey

Mevsim (öğle vakti)

Gölge uzunluğu —

Öğle güneş yüksekliği —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Baca, parapet, direk ya da öndeki panel sırası gibi bir engelin öğle vaktindeki gölge uzunluğu: gölge = engel yüksekliği ÷ tan(öğle güneş yüksekliği). Güneş yüksekliği [eğim aracındaki](#egim) formülle bulunur; gölge en uzun kış gündönümünde olur.

Örnek: 1 m engel, enlem 37° · kış gündönümü (güneş 29,55°): 1 ÷ tan(29,55°) = 1,76 m · ekinoks: 0,75 m · yaz gündönümü: 0,24 m

Hesap yalnız öğle vakti ve tam güney yönü içindir; sabah ve akşam gölge daha uzundur ve yana düşer. Yükseklik, engelin tepesi ile panelin alt kenarı arasındaki farktır.

**Formül:** gölge uzunluğu = engel yüksekliği ÷ tan(öğle güneş yüksekliği) · öğle güneş yüksekliği = 90 − enlem ± deklinasyon

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Gölge Uzunluğu Hesaplama](https://www.gespaenerji.com/golge-uzunlugu-hesaplama.html)

**İlgili:** [Sıra aralığı ve gölgelenme aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Eğim açısı ve güneş yüksekliği](#egim) · [Gölgelenme nedir?](https://www.gespaenerji.com/sozluk.html#golgelenme) · [Çatı GES keşfi](https://www.gespaenerji.com/cati-ges.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Çatı eğimi çevirici: derece, yüzde ve oran

Çatı eğimini derece, yüzde ve oran arasında çevirir.

#### Eğim

Derece

°

Yüzde eğim

%

Derece ya da yüzde alanından hangisini yazarsanız diğeri hesaplanır. Çatıda ölçmek için: 100 cm yatay mesafede kaç cm yükseldiğini ölçün, yüzde alanına yazın.

100 cm yatayda yükselme —

Oran (yükselme : yatay) —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Çatı eğimi üç biçimde söylenir: derece, yüzde ve 100 cm yatayda kaç cm yükseldiği. Aralarındaki bağ tanjanttır: % eğim = tan(derece) × 100; 100 cm yatayda yükselme (cm) yüzdeyle aynı sayıdır.

Örnek: 30° → tan(30°) × 100 = %57,74 (100 cm yatayda 57,74 cm) · %50 eğim → arctan(50 ÷ 100) = 26,57°

**Formül:** % eğim = tan(derece) × 100 · derece = arctan(% ÷ 100) · 100 cm yatayda yükselme (cm) = % eğim

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Çatı Eğimi Hesaplama](https://www.gespaenerji.com/cati-egimi-hesaplama.html)

**İlgili:** [Panel eğim açısı](#egim) · [Panel yerleşim planlayıcı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [Çatı GES hizmeti](https://www.gespaenerji.com/cati-ges.html) · [Tasarruf hesaplayıcı](https://www.gespaenerji.com/hesaplayici.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Panel günde kaç kWh üretir? (tasarım günü tahmini)

Panel gücünden tasarım günü üretimi (kWh) ve bir yükü kaç saat çalıştıracağı.

#### Sistem

Toplam panel gücü

W

Güneş saati varsayım

saat/gün

Sistem verimi varsayım

%

Bu enerjiyle çalıştırılacak yük isteğe bağlı

W

Tasarım günü üretimi —

Kurulu güç —

Yazdığınız yükü çalıştırma süresi —

Güneş saati ve verim varsayımdır; bölgenize ve sisteminize göre değiştirin. Süre, günlük üretimin tamamının o yüke gittiği varsayımıyla hesaplanır; gece kullanım için akü gerekir.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Günlük üretim tahmini: kWh/gün = kurulu güç (kWp) × güneş saati × sistem verimi. Bu araç [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html) ile aynı katsayılarla açılır: tasarım günü için 4,5 güneş saati ve 0,75 sistem verimi (off-grid, panelden yüke toplam). Bu bir **tasarım günü** tahminidir: yazın üretim daha yüksek, kapalı kış gününde daha düşüktür.

Örnek: 1.440 W panel = 1,44 kWp → 1,44 × 4,5 × 0,75 = 4,86 kWh/gün Bu enerji 100 W'lık bir yükü 4,86 × 1000 ÷ 100 = 48,6 saat çalıştırır

Yıllık üretim, tasarruf ve geri ödeme için bölge verimini kullanan [tasarruf hesaplayıcıya](https://www.gespaenerji.com/hesaplayici.html) bakın.

**Formül:** kWh/gün = kWp × güneş saati × sistem verimi · kWp = toplam panel gücü (W) ÷ 1000 · çalıştırma süresi (saat) = kWh × 1000 ÷ yük (W)

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Panel Günlük Üretim](https://www.gespaenerji.com/gunes-paneli-gunluk-uretim-hesaplama.html)

**İlgili:** [Yıllık üretim ve tasarruf hesaplayıcı](https://www.gespaenerji.com/hesaplayici.html) · [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html) · [Cihaz listesinden sistem](#yuk-listesi) · [kWp nedir?](https://www.gespaenerji.com/sozluk.html#kwp)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Sıcaklıkta panel gücü

Hücre sıcaklığına göre panelin vereceği güç.

#### Panel etiketi ve sıcaklık

Pmax

W

Güç sıcaklık katsayısı γ eksi

%/°C

Hücre sıcaklığı varsayım

°C

Açılış değerleri yuvarlak örnektir; kendi panelinizin etiketindeki değerleri yazın.

#### Hücre sıcaklığını NOCT ile tahmin et (isteğe bağlı)

Ortam

°C

NOCT künye

°C

Işınım

W/m²

Tahmini hücre sıcaklığı: —

Bu sıcaklıkta güç —

Etiket gücüne göre fark —

Yalnız sıcaklık etkisi hesaplanır; ışınım, açı, kirlenme ve kablo kayıpları ayrıdır.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Panelin etiketindeki güç 25 °C hücre sıcaklığı içindir. Hücre ısındıkça güç, künyedeki güç sıcaklık katsayısı (γ, %/°C, eksi işaretli) kadar azalır: P = Pmax × (1 + γ ÷ 100 × (hücre sıcaklığı − 25)). Hücre sıcaklığı hava sıcaklığı değildir; güneş altındaki panel havadan belirgin biçimde sıcaktır.

Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Pmax 400 W, γ -0,35 %/°C, hücre 60 °C P = 400 × (1 + (-0,35) ÷ 100 × (60 − 25)) = 351 W

Hücre sıcaklığını bilmiyorsanız künyedeki NOCT değeriyle ders kitabı yaklaşımı kullanılabilir: hücre = ortam + (NOCT − 20) ÷ 800 × ışınım (W/m²). Örnek: ortam 30 °C, NOCT 45 °C, ışınım 1.000 W/m² → 30 + (45 − 20) ÷ 800 × 1.000 = 61,25 °C. NOCT ve γ değerlerini panelinizin künyesinden alın.

**Formül:** P = Pmax × (1 + γ ÷ 100 × (Thücre − 25)) · Thücre = Tortam + (NOCT − 20) ÷ 800 × ışınım

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Panel Sıcaklık Güç Kaybı](https://www.gespaenerji.com/panel-sicaklik-guc-kaybi.html)

**İlgili:** [Dizi hesabı (soğukta Voc)](#dizi) · [Günlük üretim tahmini](#gunluk-uretim) · [Güneş panelleri](https://www.gespaenerji.com/online-satis.html?kategori=panel) · [STC nedir?](https://www.gespaenerji.com/sozluk.html#stc)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## 🔗 Dizi ve bağlantı

Kaç panel seri bağlanır, seri–paralel şema ve dizi sigortası kontrolü.

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Panel Seri–Paralel Bağlantı](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)

**İlgili:** [PWM mi MPPT mi? Cihaz seçim rehberi](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) · [Şarj kontrol cihazları](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol) · [150 V girişli 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a-150v.html) · [Voc ve Isc nedir?](https://www.gespaenerji.com/sozluk.html#voc-isc)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Panel Seri–Paralel Bağlantı](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)

**İlgili:** [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Solar kablo takımı](https://www.gespaenerji.com/kablo-solar-5m.html) · [Dizi (string) nedir?](https://www.gespaenerji.com/sozluk.html#dizi) · [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Panel Seri–Paralel Bağlantı](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)

**İlgili:** [Seri–paralel şema](#seri-paralel) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Isc nedir?](https://www.gespaenerji.com/sozluk.html#voc-isc) · [Toptan satış](https://www.gespaenerji.com/toptan.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## 🔋 Akü

Akü bankası, süre, dolum ve C oranı.

### Akü bankası: seri ve paralel akü bağlama

Akü bankasının gerilimi, kapasitesi ve enerjisi; bağlantı şemasıyla.

#### Akü ve dizilim

Tek akü gerilimi

V

Tek akü kapasitesi

Ah

Seri akü sayısı

Paralel kol sayısı

Kullanılabilir enerji, akü tipinin izin verdiği deşarj derinliğine göre daha azdır; akü boyutlandırma için [batarya aracına](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) bakın.

Banka gerilimi —

Kapasite —

Enerji —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Aküler seri bağlanınca gerilim toplanır, kapasite (Ah) aynı kalır; paralel bağlanınca kapasite toplanır, gerilim aynı kalır. Depolanan enerji kWh = banka gerilimi × banka Ah ÷ 1000 ile bulunur ve bağlantı şekline göre değişmez.

Örnek: 12 V 100 Ah akü, 2 seri × 2 paralel Banka gerilimi = 12 × 2 = 24 V · kapasite = 100 × 2 = 200 Ah · enerji = 24 × 200 ÷ 1000 = 4,8 kWh

**Güvenlik:** aynı bankada yalnızca aynı tip, aynı yaşta ve aynı kapasitede aküler kullanılır; farklı aküler karıştırılmaz. Lityum akülerin seri ya da paralel bağlanıp bağlanamayacağını akü üreticisinin talimatından teyit edin.

**Formül:** banka gerilimi = akü gerilimi × seri sayısı · kapasite (Ah) = akü Ah × paralel kol sayısı · enerji (kWh) = banka gerilimi × kapasite ÷ 1000

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Akü Seri–Paralel Bağlantı](https://www.gespaenerji.com/aku-seri-paralel-baglanti.html)

**İlgili:** [Batarya boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [51,2 V 102 Ah LiFePO₄ akü](https://www.gespaenerji.com/aku-titanx-51v-102ah.html) · [Off-grid boyutlandırma rehberi](https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html) · [DoD nedir?](https://www.gespaenerji.com/sozluk.html#dod)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Akü kaç saat dayanır?

Akünün bir yükü yaklaşık kaç saat besleyeceği.

#### Akü ve yük

Akü gerilimi

V

Kapasite

Ah

Kullanılabilir oran, DoD varsayım

%

İnverter verimi varsayım

%

Yük gücü

W

Yaklaşık süre —

Kullanılabilir enerji —

Akü yaşlandıkça ve soğukta kapasite düşer; yüksek akımda kurşun-asit akülerin verdiği kapasite azalır. Sonuç bir üst sınırdır.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Akünün bir yükü besleyebileceği süre: saat = (akü gerilimi × Ah × kullanılabilir oran (DoD) × inverter verimi) ÷ yük gücü. DoD, akünün kapasitesinin ne kadarının kullanılabileceğini gösterir ve akü tipine göre değişir; değeri akünün künyesinden alın.

Örnek: 12 V 100 Ah akü, DoD 0,9, inverter verimi 0,92, yük 200 W Kullanılabilir enerji = 12 × 100 × 0,9 × 0,92 = 993,6 Wh · süre = 993,6 ÷ 200 = 4,97 saat

Açılıştaki DoD ve verim, [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)'nun lityum akü ve inverter için kullandığı varsayımlardır; kurşun-asit, jel ve AGM akülerde üreticinin önerdiği DoD daha düşüktür. Yük doğrudan DC ise verimi %100 yazın.

**Formül:** süre (saat) = akü gerilimi × Ah × DoD × inverter verimi ÷ yük (W)

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Akü Kaç Saat Dayanır](https://www.gespaenerji.com/aku-kac-saat-dayanir.html)

**İlgili:** [Akü bankası bağlama](#aku) · [Batarya boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [51,2 V 102 Ah LiFePO₄ akü](https://www.gespaenerji.com/aku-titanx-51v-102ah.html) · [DoD nedir?](https://www.gespaenerji.com/sozluk.html#dod)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Panel aküyü kaç saatte doldurur?

Panelin aküyü kaç güneşli saatte ve kaç günde dolduracağı (ideal hesap).

#### Akü ve panel

Doldurulacak kapasite

Ah

Akü gerilimi

V

Panel dizisi gücü

W

Günlük güneşli saat sizin girdiniz

Gereken süre —

Şarj akımı (ideal) —

Gün sayısı —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

İdeal durumda şarj akımı = panel dizisi gücü ÷ akü gerilimi; doldurulacak Ah bu akıma bölününce gereken güneşli saat bulunur. Gün sayısı, bulunduğunuz yerde günde kaç güneşli saat aldığınıza bağlıdır; bu değeri siz yazarsınız.

Örnek: 100 Ah doldurulacak, 360 W panel, 12 V akü Şarj akımı = 360 ÷ 12 = 30 A · süre = 100 ÷ 30 = 3,33 güneşli saat · günde 4,5 güneşli saatle 3,33 ÷ 4,5 = 0,74 gün

**İdeal hesaptır:** panel sıcaklığı, açı, bulut, kablo ve şarj kontrol cihazı kayıpları ile akünün şarj sonuna doğru akımı azaltması hesaba katılmaz; gerçek süre daha uzundur. Açılıştaki güneşli saat, Sistem Kurucu'nun tasarım günü değeridir.

**Formül:** şarj akımı = panel gücü (W) ÷ akü gerilimi (V) · güneşli saat = doldurulacak Ah ÷ şarj akımı · gün = güneşli saat ÷ günlük güneşli saat

**İlgili:** [Şarj kontrol cihazı akımı](#sarj-kontrol) · [Günlük üretim tahmini](#gunluk-uretim) · [Güneş panelleri](https://www.gespaenerji.com/online-satis.html?kategori=panel) · [Off-grid boyutlandırma rehberi](https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### C oranı: akü şarj ve deşarj akımı

C oranı ile akım arasında çevirir, tam kapasitenin süresini verir.

#### Akü

Kapasite

Ah

C oranı

Akım

A

C oranı ya da akım alanından hangisini yazarsanız diğeri hesaplanır.

Bu akımda tam kapasitenin süresi —

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

C oranı, akımı akü kapasitesine oranlar: I = C × Ah. 1C, aküyü bir saatte boşaltan (ya da dolduran) akımdır; süre = 1 ÷ C saattir. Akünün izin verdiği en yüksek şarj ve deşarj C oranı künyesinde yazar.

Örnek: 100 Ah akü, 0,5C → 0,5 × 100 = 50 A · süre = 1 ÷ 0,5 = 2 saat

**Formül:** akım (A) = C × kapasite (Ah) · C = akım ÷ kapasite · süre (saat) = 1 ÷ C

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Akü Kaç Saat Dayanır](https://www.gespaenerji.com/aku-kac-saat-dayanir.html)

**İlgili:** [Akü kaç saat dayanır?](#aku-sure) · [Akü bankası bağlama](#aku) · [51,2 V 102 Ah LiFePO₄ akü](https://www.gespaenerji.com/aku-titanx-51v-102ah.html) · [BMS nedir?](https://www.gespaenerji.com/sozluk.html#bms)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## 🎛️ Cihaz seçimi

Cihaz listesinden sistem, şarj kontrol cihazı ve inverter akımı, tüketim ve maliyet.

### Cihaz listesinden günlük tüketim, panel, akü ve inverter

Cihaz listesinden günlük tüketim, gereken panel, akü ve inverter gücü.

#### Cihazlar

Cihaz W Adet Saat/gün

Senaryo yükle (Sistem Kurucu senaryoları)

Günlük tüketim —

Gerekli panel gücü —

Akü kapasitesi —

İnverter gücü (kalkış hariç) —

#### Varsayımlar

Akü gerilimi

V

Özerklik

gün

Güneş saati

Sistem verimi

%

DoD

%

İnverter verimi

%

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Sistemin boyutu günlük enerji ihtiyacından çıkar. Her cihaz için Wh = güç (W) × adet × günlük çalışma saati; toplam günlük tüketimdir. Buradan panel gücü = Wh ÷ (güneş saati × sistem verimi), akü kapasitesi Ah = Wh × özerklik günü ÷ (akü gerilimi × DoD × inverter verimi), inverter gücü ise aynı anda çalışan cihazların toplam gücünden büyük olmalıdır.

| Örnek: Karavan / Kamp | Güç | Adet | Saat/gün | Wh/gün |
| --- | --- | --- | --- | --- |
| Mini Buzdolabı | 60 W | 1 | 8 saat | 480 Wh |
| LED Lamba | 10 W | 4 | 5 saat | 200 Wh |
| Telefon Şarjı | 15 W | 2 | 3 saat | 90 Wh |
| Dizüstü Bilgisayar | 65 W | 1 | 4 saat | 260 Wh |

Toplam 1.030 Wh/gün · panel = 1.030 ÷ (4,5 × 0,75) ≈ 305 W · akü (12 V, 1 gün) = 1.030 × 1 ÷ (12 × 0,9 × 0,92) ≈ 103,7 Ah · inverter ≥ 195 W

Cihaz güçleri ve saatleri [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)'daki varsayılan değerlerdir; kendi cihazınızın etiketindeki watt değerini yazın. Katsayılar da Sistem Kurucu ile aynıdır (tasarım günü güneş saati, sistem verimi, lityum akü DoD'u, inverter verimi). İnverter satırı yalnızca çalışma güçlerinin toplamıdır: buzdolabı, pompa ve klima gibi motorlu cihazların **kalkış akımı dahil değildir**. Eşzamanlılık, kalkış payı ve ürün seçimiyle tam hesap için Sistem Kurucu'yu kullanın.

**Formül:** Wh/gün = Σ (W × adet × saat) · panel W = Wh ÷ (güneş saati × sistem verimi) · akü Ah = Wh × gün ÷ (V × DoD × inverter verimi) · inverter W ≥ Σ (W × adet)

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Cihaz Elektrik Tüketimi](https://www.gespaenerji.com/cihaz-elektrik-tuketimi-hesaplama.html)

**İlgili:** [Sistem Kurucu (tam sihirbaz)](https://www.gespaenerji.com/sistem-kur.html) · [Off-grid boyutlandırma rehberi](https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html) · [Akü kaç saat dayanır?](#aku-sure) · [Solar sulama pompası seçimi](https://www.gespaenerji.com/tarimsal-sulama.html#pompa-secimi)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [MPPT Kaç Amper Olmalı](https://www.gespaenerji.com/mppt-kac-amper-olmali.html)

**İlgili:** [PWM mi MPPT mi? Seçim rehberi](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) · [Şarj kontrol cihazları](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol) · [Lexron 40 A MPPT](https://www.gespaenerji.com/lexron-mppt-40a.html) · [Havensis 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a.html) · [150 V girişli 60 A MPPT](https://www.gespaenerji.com/havensis-mppt-60a-150v.html)

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

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [İnvertör Akü Akımı](https://www.gespaenerji.com/invertor-akuden-kac-amper-ceker.html)

**İlgili:** [DC kablo kesiti ve gerilim düşümü](#kablo) · [Akü kaç saat dayanır?](#aku-sure) · [İnverter boyutlandırma aracı](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi) · [1200 W güç istasyonu](https://www.gespaenerji.com/lexron-guc-istasyonu-1200w.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

### Cihaz kaç kWh harcar, kaç TL yakar?

Bir cihazın kWh tüketimi ve yazdığınız birim fiyatla tutarı.

#### Cihaz

Güç

W

Günlük çalışma

saat

Gün sayısı

Birim fiyat örnek, faturanızdan yazın

TL/kWh

Tüketim —

Tutar —

Birim fiyat tarifeye ve vergilere göre değişir; faturanızdaki toplam tutarı toplam kWh'e bölerek kendi değerinizi bulabilirsiniz.

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Bir cihazın tüketimi kWh = güç (W) × günlük çalışma saati × gün sayısı ÷ 1000 ile bulunur; tutar = kWh × birim fiyat. Birim fiyatı faturanızdan siz yazarsınız; açılıştaki değer yalnızca düzenlenebilir bir örnektir.

Örnek: 1.000 W cihaz, günde 2 saat, 30 gün → 1.000 × 2 × 30 ÷ 1000 = 60 kWh · birim fiyat 2,5 TL/kWh (örnek) ile 60 × 2,5 = 150 TL

Etiketteki güç en yüksek değerdir; buzdolabı, klima ve termostatlı ısıtıcılar sürekli tam güçte çalışmaz, gerçek tüketim daha düşük olabilir. Kesin değer için priz tipi bir enerji ölçer kullanılır.

**Formül:** kWh = güç (W) × saat/gün × gün ÷ 1000 · tutar = kWh × birim fiyat

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [Cihaz Elektrik Tüketimi](https://www.gespaenerji.com/cihaz-elektrik-tuketimi-hesaplama.html)

**İlgili:** [Cihaz listesinden sistem](#yuk-listesi) · [Faturadan GES tasarruf hesabı](https://www.gespaenerji.com/hesaplayici.html) · [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html) · [Panel günde kaç kWh üretir?](#gunluk-uretim)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## 🧰 İnverter

İnverter hata kodları (aile → tür → kod) ve üç kılavuzun ayar rehberi.

### İnverter hata kodları

Cihaz ailesini seçin, ekrandaki kodu yazın: kılavuzdaki anlamı ve kaynağı görün.

**Kod anlamı markaya ve modele göre değişir; cihazınızın kendi kılavuzu esastır.**

Marka / model süz

Cihaz ailesi kılavuzun kapağındaki modele göre

Tür

Ekrandaki kod

Arama için JavaScript gerekir; kod tablolarının tamamı araç sayfalarında yer alır.

Arıza devam ederse cihazı kapatın ve yetkili servise ya da satıcıya başvurun; cihazın içine yalnız yetkili kişi müdahale eder.

Bu ailedeki tüm kodlar

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

İnverter ekranındaki arıza, uyarı ve alarm kodlarının anlamı üreticiye ve modele göre değişir. Bu araç yalnızca adı yazan kılavuzlardaki tabloları içerir: 12 cihaz ailesi, 443 kod. Her satırda kılavuzdaki ifade, varsa kılavuzun önerdiği çözüm ve sayfa numarası yer alır; çeviri olan satırlarda üreticinin özgün ifadesi de gösterilir. Aileler birleştirilmez ve listede olmayan kod için tahmin yürütülmez.

Kod tablolarının tamamı: [Tüm aileler](https://www.gespaenerji.com/inverter-hata-kodlari.html) · [Mexxsun](https://www.gespaenerji.com/mexxsun-inverter-hata-kodlari.html) · [Deye](https://www.gespaenerji.com/deye-inverter-hata-kodlari.html) · [Voltronic Axpert](https://www.gespaenerji.com/voltronic-axpert-hata-kodlari.html) · [Victron MPPT](https://www.gespaenerji.com/victron-mppt-hata-kodlari.html) · [Solis](https://www.gespaenerji.com/solis-inverter-hata-kodlari.html) · [Akıllı inverter (3,6–7,2 kW ve 1–5 kVA)](https://www.gespaenerji.com/akilli-inverter-hata-kodlari.html).

Kod tablolarının ve ayarların tamamı: [İnverter Hata Kodları](https://www.gespaenerji.com/inverter-hata-kodlari.html)

**İlgili:** [İnverter hata kodları (tüm tablolar)](https://www.gespaenerji.com/inverter-hata-kodlari.html) · [Off-grid inverter ayar rehberi](#inverter-ayarlari) · [İnverterin akü akımı](#inverter-aku-akimi) · [İletişim](https://www.gespaenerji.com/iletisim.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

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

Kod tablolarının ve ayarların tamamı: [Off-Grid İnverter Lityum Akü Ayarı](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html)

**İlgili:** [Lityum akü ayarı (üç kılavuz)](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html) · [Şebeke bağlıyken ayarlar](https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html) · [İnverter hata kodları](#inverter-kodlari) · [Akü bankası bağlama](#aku)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## 🔁 Çeviriciler

Watt–amper, Ah–Wh, HP–kW ve AWG–mm².

### Hızlı çeviriciler: W–A, Ah–Wh, HP–kW, AWG–mm²

Watt–amper, Ah–Wh, HP–kW ve AWG–mm² çeviricileri.

#### Watt ↔ Amper

Gerilim

V

Güç

W

Akım

A

#### Ah ↔ Wh

Gerilim

V

Kapasite

Ah

Enerji

Wh

#### HP ↔ kW

Beygir gücü

HP

Kilovat

kW

#### AWG ↔ mm²

AWG numarası

Kesit

mm²

—

—

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Sahada en çok sorulan dört çevirme. Hepsi tanım formülüdür; iki yönlü alanlarda hangisini yazarsanız diğeri hesaplanır.

1.000 W ÷ 12 V = 83,33 A · 100 Ah × 12 V = 1.200 Wh = 1,2 kWh · 1 HP ÷ 1,341 = 0,746 kW AWG 10: çap = 0,127 × 92(36 − 10) ÷ 39 = 2,588 mm, kesit = π × çap² ÷ 4 = 5,26 mm²

AWG ile metrik kesitler birebir örtüşmez; metrik kablo seçerken hesaplanan mm² değerinin altına inilmez.

**Formül:** A = W ÷ V · Wh = Ah × V · kW = HP ÷ 1,341 · AWG çapı (mm) = 0,127 × 92(36 − n) ÷ 39 · kesit = π × d² ÷ 4

Ayrıntılı anlatım, sık yapılan hatalar ve sorular: [AWG mm² Çevirme](https://www.gespaenerji.com/awg-mm2-cevirme.html) · [Ah kWh Çevirme](https://www.gespaenerji.com/ah-kwh-cevirme.html)

**İlgili:** [Kablo kesiti ve güç kaybı](#kablo) · [İnverterin akü akımı](#inverter-aku-akimi) · [HP → kW → amper](#hp-kw-amper) · [kWh nedir?](https://www.gespaenerji.com/sozluk.html#kwh)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

## ✅ Kontrol listesi

Devreye almadan önce sahada işaretlenecek kontroller.

### Montaj öncesi kontrol listesi

Devreye almadan önce sahada işaretlenecek pratik kontroller.

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

Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.

Formül, örnek ve sınırlar

Devreye almadan önce sahada tek tek işaretlenecek 14 pratik kontrol. İşaretler bu cihazda saklanır; liste yazdırılabilir ya da PDF olarak kaydedilebilir. Liste pratik saha alışkanlıklarını toplar; yürürlükteki yönetmeliklerin ve üretici talimatlarının yerine geçmez.

**İlgili:** [🖨️ Solar Usta Cep Kartı (bu liste + formüller, iki sayfa)](https://www.gespaenerji.com/usta-cep-karti.html) · [MC4 konnektör takımı](https://www.gespaenerji.com/mc4-set.html) · [Solar kablo takımı](https://www.gespaenerji.com/kablo-solar-5m.html) · [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)

Usta / toplu alım fiyatı için: [Usta kaydı bırakın](https://www.gespaenerji.com/usta-kaydi.html) [WhatsApp'tan yazın](https://wa.me/905437434209)

Bu araçlar hakkında

Bu araçlar yalnızca tanım ve fizik formüllerini kullanır; standart tablosu (akım taşıma kapasitesi, sigorta katsayısı, izin verilen gerilim düşümü) içermez. Tablo gereken yerde kablo ve cihaz üreticisinin verisine bakılır, tasarımı yetkili elektrikçi ya da mühendis yapar. Elektrikçiler, güneş paneli montaj ekipleri ve kendi sistemini kuranlar içindir; üyelik gerekmez. Çatı yerleşimi, inverter gücü, akü boyutu ve sıra aralığı için [GES Alet Çantası](https://www.gespaenerji.com/hesaplayici.html#alet-cantasi)'na bakın.

## Araç sayfaları

Her hesabın kendi sayfasında girdilerin anlamı, sık yapılan hatalar ve o konuya özel sorular yer alır:

- [Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)](https://www.gespaenerji.com/kablo-kesiti-hesaplama.html)
- [Gerilim Düşümü Hesabı: Monofaze ve Trifaze](https://www.gespaenerji.com/gerilim-dusumu-hesaplama.html)
- [Solar (DC) Kablo Kesiti Hesaplama](https://www.gespaenerji.com/solar-kablo-kesiti-hesaplama.html)
- [kW Amper Hesaplama: 1 kW Kaç Amper?](https://www.gespaenerji.com/kw-amper-hesaplama.html)
- [Trifaze Akım ve Güç Hesabı](https://www.gespaenerji.com/trifaze-akim-hesaplama.html)
- [kVA kW Çevirme: 1 kVA Kaç kW Eder?](https://www.gespaenerji.com/kva-kw-cevirme.html)
- [Güneş Paneli Açısı Kaç Derece Olmalı?](https://www.gespaenerji.com/gunes-paneli-acisi-hesaplama.html)
- [1 Güneş Paneli Günde Kaç kWh Üretir?](https://www.gespaenerji.com/gunes-paneli-gunluk-uretim-hesaplama.html)
- [Güneş Paneli Seri mi Paralel mi Bağlanır?](https://www.gespaenerji.com/gunes-paneli-seri-paralel-baglanti.html)
- [Akü Kaç Saat Dayanır?](https://www.gespaenerji.com/aku-kac-saat-dayanir.html)
- [Akü Seri-Paralel Bağlantı Şeması (24 V / 48 V)](https://www.gespaenerji.com/aku-seri-paralel-baglanti.html)
- [MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı?](https://www.gespaenerji.com/mppt-kac-amper-olmali.html)
- [İnvertör Aküden Kaç Amper Çeker?](https://www.gespaenerji.com/invertor-akuden-kac-amper-ceker.html)
- [AWG mm² Çevirme](https://www.gespaenerji.com/awg-mm2-cevirme.html)
- [100 Ah Akü Kaç kWh Eder?](https://www.gespaenerji.com/ah-kwh-cevirme.html)
- [Cihaz Elektrik Tüketimi Hesaplama: Kaç kWh, Kaç TL?](https://www.gespaenerji.com/cihaz-elektrik-tuketimi-hesaplama.html)
- [Gölge Uzunluğu Hesaplama](https://www.gespaenerji.com/golge-uzunlugu-hesaplama.html)
- [Çatı Eğimi Hesaplama: Derece, Yüzde ve Oran](https://www.gespaenerji.com/cati-egimi-hesaplama.html)
- [Ohm Kanunu Hesaplama: Volt, Amper, Ohm, Watt](https://www.gespaenerji.com/ohm-kanunu-hesaplama.html)
- [Güneş Paneli Sıcakta Ne Kadar Güç Kaybeder?](https://www.gespaenerji.com/panel-sicaklik-guc-kaybi.html)
- [İnverter Hata Kodları (Marka ve Modele Göre)](https://www.gespaenerji.com/inverter-hata-kodlari.html)
- [Mexxsun İnverter Hata Kodları (MEXX-P4KW, P6KW, P12KW, SUNON IV)](https://www.gespaenerji.com/mexxsun-inverter-hata-kodlari.html)
- [Deye Hibrit İnverter Hata Kodları (SG05LP1 ve SG05LP3)](https://www.gespaenerji.com/deye-inverter-hata-kodlari.html)
- [Voltronic Axpert Hata ve Uyarı Kodları (VM II, MKS)](https://www.gespaenerji.com/voltronic-axpert-hata-kodlari.html)
- [Victron MPPT Şarj Cihazı Hata Kodları](https://www.gespaenerji.com/victron-mppt-hata-kodlari.html)
- [Solis İnverter Alarm Kodları (Şebeke Bağlantılı Modeller)](https://www.gespaenerji.com/solis-inverter-hata-kodlari.html)
- [Akıllı İnverter Hata Kodları (3,6 / 6,5 / 7,2 kW ve 1–5 kVA kılavuzları)](https://www.gespaenerji.com/akilli-inverter-hata-kodlari.html)
- [Off-Grid İnverterde Lityum Akü Ayarı: Kılavuzlar Ne Diyor?](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html)
- [Off-Grid İnverter Şebeke Bağlıyken Nasıl Ayarlanır?](https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html)

## Sık sorulan sorular

### Güneş paneli eğim açısı kaç derece olmalı?

Sahada kullanılan pratik kurala göre yıl boyu kullanım için eğim yaklaşık olarak bulunduğunuz enleme eşit alınır; yaz ağırlıklı kullanımda enlem − 15°, kış ağırlıklı kullanımda enlem + 15° seçilir. 37° enlemi için bu, yıl boyu ≈ 37°, yaz ≈ 22°, kış ≈ 52° demektir. Bu bir başlangıç değeridir; çatı eğimi, gölge ve kullanım mevsimi sonucu değiştirir.

### Kaç panel seri bağlanır?

En çok seri panel sayısı = cihazın en yüksek PV giriş gerilimi ÷ panelin soğuk havadaki Voc değeri, aşağı yuvarlanır. Soğuk Voc = Voc × (1 + β ÷ 100 × (en düşük sıcaklık − 25)). Örnek değerlerle: Voc 40 V, β -0,3 %/°C ve -10 °C için soğuk Voc 44,2 V olur; 150 V girişli cihaza en çok 3 panel seri bağlanır. Değerleri kendi panel ve cihaz etiketinizden alın.

### Solar kablo kesiti nasıl hesaplanır?

Gerilim düşümü = 2 × akım × tek yön uzunluk × ρ ÷ kesit formülüyle bulunur (bakır için ρ = 0,0175 Ω·mm²/m) ve sistem geriliminin belirli bir yüzdesinin altında tutulur; bu sayfadaki araç %1 hedefini kullanır. Örnek: 48 V, 15 A, 5 m hatta 4 mm² kabloda düşüm 0,66 V (%1,37) çıkar, hedefi 6 mm² karşılar. Kablonun akım taşıma kapasitesi ayrı bir kontroldür; kablo üreticisinin tablosuna bakılır.

### Paneller seri mi paralel mi bağlanmalı?

Seri bağlamada gerilim toplanır, akım aynı kalır; paralel bağlamada akım toplanır, gerilim aynı kalır. Hangisinin seçileceğini cihazın giriş gerilimi aralığı ve akım sınırı belirler: MPPT cihazlarda dizi gerilimi giriş sınırını aşmayacak ve MPPT alt geriliminin üstünde kalacak şekilde seri bağlanır, gerekirse eş diziler paralellenir. Yüksek gerilim ve düşük akım, kabloda daha az kayıp demektir.

### AWG kaç mm² eder?

AWG numarası n olan telin çapı d = 0,127 × 92^((36 − n) ÷ 39) mm, kesiti π × d² ÷ 4 formülüyle bulunur. Örneğin AWG 10 = 2,588 mm çap = 5,26 mm². AWG küçüldükçe tel kalınlaşır. AWG ile metrik kesitler birebir örtüşmez; metrik kablo seçerken hesaplanan değerin altına inilmez.

### Dizi sigortası ne zaman gerekir?

Paralel bağlı dizilerde, arızalı bir diziye diğerlerinden akabilecek ters akım (N − 1) × Isc kadardır. Bu değer panel etiketindeki en yüksek seri sigorta değerini aşıyorsa her diziye sigorta gerekir. Örnek: Isc 11,37 A ve etiket değeri 30 A olan panelde 4 paralel dizi 34,11 A eder ve sigorta gerekir. Sigortanın değeri ve tipi üretici talimatına göre tasarımı yapan yetkili kişi tarafından seçilir.

### Aküler seri ve paralel bağlanınca gerilim ve Ah nasıl değişir?

Seri bağlamada gerilim toplanır, Ah aynı kalır; paralel bağlamada Ah toplanır, gerilim aynı kalır. 2 seri × 2 paralel bağlanan 12 V 100 Ah aküler 24 V 200 Ah, yani 4,8 kWh eder. Aynı bankada yalnızca aynı tip, yaş ve kapasitede aküler kullanılır.

### 1000 W inverter aküden kaç amper çeker?

Akü tarafı akımı = yük ÷ (akü gerilimi × inverter verimi). 1.000 W yük, 12 V akü ve %92 verim varsayımıyla 90,58 A eder. Aynı yük 24 V aküde yaklaşık yarısı, 48 V aküde dörtte biri kadar akım çeker; verim için inverterin künyesindeki değer kullanılır.

### Trifaze (üç faz) akım nasıl hesaplanır?

Üç fazlı dengeli yükte akım I = P ÷ (√3 × V × cosφ) formülüyle bulunur; V faz-faz gerilimidir. Örnek: 3.000 W yük, 400 V ve cosφ 0,9 için 4,81 A eder. Aynı yük tek fazda (230 V) I = P ÷ (V × cosφ) ile 14,49 A çeker. cosφ cihazın etiketinden alınır.

### kW ile kVA arasındaki fark nedir?

kW aktif güçtür (işe dönüşen güç), kVA görünür güçtür (gerilim × akım). Aralarındaki bağ güç katsayısıdır: kVA = kW ÷ cosφ. Örnek: 3 kW yük cosφ 0,9 ile 3,33 kVA eder. cosφ 1 ise ikisi eşittir.

### Akü kaç saat dayanır, nasıl hesaplanır?

Süre (saat) = akü gerilimi × Ah × kullanılabilir oran (DoD) × inverter verimi ÷ yük gücü. Örnek: 12 V 100 Ah akü, DoD 0,9, verim 0,92 ve 200 W yük için 993,6 Wh ÷ 200 W = 4,97 saat. DoD akü tipine göre değişir; akünüzün künyesindeki değeri kullanın.

### Çatı eğimi yüzde kaç derece eder?

Yüzde eğim = tan(derece) × 100, derece = arctan(yüzde ÷ 100). Örnek: 30° eğim %57,74 eder; %50 eğim 26,57° eder. Yüzde eğim, 100 cm yatay mesafede kaç cm yükselindiğini gösterir.

### Kaç amper şarj kontrol cihazı gerekir?

MPPT cihazlar için en az çıkış akımı = toplam panel gücü ÷ akü sistem gerilimi. Örnek: 1.440 W panel ve 24 V akü için 1.440 ÷ 24 = 60 A. Üreticinin belirttiği pay ya da panel gücü sınırı varsa o esas alınır; cihazın PV giriş gerilimi sınırı ayrıca kontrol edilir.

### Güneş paneli günde kaç kWh üretir?

Tasarım günü tahmini kWh/gün = kurulu güç (kWp) × güneş saati × sistem verimi ile yapılır. Sitemizdeki Sistem Kurucu ile aynı varsayımlarla (4,5 güneş saati, 0,75 sistem verimi) 1,44 kWp panel yaklaşık 4,86 kWh/gün üretir. Gerçek üretim mevsime, konuma, eğime ve gölgeye göre değişir.

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 23 Kasım 2026 · GESPA Enerji

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/elektrikci-cantasi.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
