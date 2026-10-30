---
title: "Solar Sulama Pompası Seçimi: Debi, Yükseklik, Panel | GESPA"
description: "Güneş enerjili sulama pompası nasıl seçilir? Günlük su ve basma yüksekliğinden pompa gücü ile panel kWp hesabı, örnek ve dikkat edilecekler."
canonical: https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html
lang: tr
dateModified: 2026-10-30
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Rehberler](https://www.gespaenerji.com/rehberler.html) / Solar sulama pompası seçimi

# Güneş Enerjili Sulama Pompası Nasıl Seçilir? Debi, Basma Yüksekliği ve Panel Gücü

Solar sulamada doğru pompa üç sayıyla belirlenir: günlük su ihtiyacı, pompanın çalışacağı güneşli saat sayısı ve suyun yükseleceği toplam yükseklik. Bu rehberde bu üç sayıdan pompa gücüne ve panel gücüne nasıl gidildiğini örnekle anlatıyoruz.

Yayın: 30 Ekim 2026 · GESPA Enerji

**Kısaca:** Debi = günlük su ÷ pompalama saati. Hidrolik güç (kW) = debi (m³/saat) × toplam yükseklik (m) × 0,002725. Pompanın elektrik gücü hidrolik gücün toplam verime bölünmesiyle, panel gücü ise pompa gücünün yaklaşık 1,3 katı alınarak bulunur. Aynı hesabı [Solar Sulama Pompası Seçimi aracı](https://www.gespaenerji.com/tarimsal-sulama.html#pompa-secimi) da yapar.

## 1. Debi: günlük suyu güneşli saate bölün

Debi (m³/saat) = günlük su ihtiyacı (m³) ÷ pompalama süresi (saat)

Güneş pompası yalnızca güneşli saatlerde çalışır; bu yüzden günlük suyun hepsini bu saatlere yaymanız gerekir. Aracımız varsayılan olarak 7 saat kullanır. Işığın az olduğu sabah ve akşam saatlerinde pompa tam debide çalışmaz; bölgenize ve sezona göre daha kısa bir süre de alabilirsiniz.

## 2. Toplam basma yüksekliği (TDH)

Pompanın karşılaması gereken yükseklik yalnızca kuyu derinliği değildir. Dört bileşenin toplamıdır:

- **Statik seviye:** suyun kuyudaki seviyesinden çıkış noktasına kadar olan yükseklik.
- **Çekim (dinamik düşüm):** pompalama sırasında su seviyesinin düşmesi.
- **Boru sürtünme kaybı:** boru çapı, uzunluk ve debiye göre artar; ince boru yüksekliği ciddi biçimde artırır.
- **Çıkış basıncı:** basınçlı sulamada (damla, yağmurlama) sistemin istediği basınç. 1 bar yaklaşık 10 metre su sütununa eşittir.

Yalnızca kuyu derinliğini yazmak pompanın küçük seçilmesine yol açar.

## 3. Pompa gücü

Hidrolik güç (kW) = debi (m³/saat) × yükseklik (m) × 0,002725 Pompa elektrik gücü (kW) = hidrolik güç ÷ toplam verim

0,002725 katsayısı, su yoğunluğu ile yerçekiminin 3,6 milyona bölünmesinden gelir. Toplam verim pompa, motor ve sürücünün birleşik verimidir; aracımız %40 varsayar. Gerçek verim pompanın eğrisine ve çalışma noktasına bağlıdır, kesin değer için pompa üreticisinin verisi esas alınır. 1 kW ≈ 1,341 HP.

## 4. Panel gücü

Panel gücü (kWp) ≈ pompa elektrik gücü × 1,3

Işınım gün içinde değiştiği, panel ısındığında gücü düştüğü ve yüzeyler kirlendiği için panel gücü pompa gücünün üstünde seçilir; aracımız 1,3 kat kullanır. Panelleri seri bağlarken sürücünün giriş gerilimi aralığını kontrol edin: Voc toplamı × 1,1 sürücünün sınırını aşmamalıdır ([aynı kural](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html#uc-hesap)).

## Örnek hesap

Günlük 50 m³ su, toplam 40 m yükseklik, 7 güneşli saat:

| Adım | Hesap | Sonuç |
| --- | --- | --- |
| Debi | 50 ÷ 7 | ≈ 7,14 m³/saat |
| Hidrolik güç | 7,14 × 40 × 0,002725 | ≈ 0,78 kW |
| Pompa elektrik gücü | 0,78 ÷ 0,40 | ≈ 1,95 kW (≈ 2,6 HP) |
| Panel gücü | 1,95 × 1,3 | ≈ 2,5 kWp |

Bu sayılar ön boyutlandırmadır. Pompa modeli, üreticinin debi–yükseklik eğrisi üzerinde çalışma noktanıza göre seçilir.

## Aküsüz tasarım: suyu depolayın

Güneş pompasında panel doğrudan sürücüye bağlanır; akü ve inverter gerekmez. Gündüz pompalanan suyu bir depo ya da havuzda biriktirip sulamayı depodan yapmak, enerjiyi aküde depolamaktan çok daha basit ve ucuzdur. Sabah ve akşam sulama gerekiyorsa su deposu bu ihtiyacı karşılar.

**Şebekeden de besleniyor mu?** Gündüz güneş, gece şebeke gibi şebekeden de beslenen kurgular şebeke bağlantı başvurusu ve kabul gerektirir; kabulsüz kurulum yaptırım riski taşır. Ayrıntı için [güneş paneli mevzuat rehberimize](https://www.gespaenerji.com/gunes-paneli-kacak-elektrik-cezasi.html#off-grid) bakın. Şebekeye hiç bağlanmayan sistemler bu sürecin dışındadır.

## Dalgıç mı yüzey pompası mı?

Su derindeyse (kuyu, sondaj) **dalgıç pompa** gerekir. **Yüzey pompaları** göl, dere, depo ve sığ su için uygundur; atmosfer basıncı nedeniyle emme yüksekliği teorik olarak yaklaşık 10 metreyle sınırlıdır ve pratikte çok daha azdır. Derin kuyuda yüzey pompası kullanılamaz.

## Sık yapılan hatalar

- Toplam yüksekliğe boru kaybını ve çıkış basıncını eklememek.
- Panel gücünü pompa gücüne eşit seçmek: pratikte yetersiz kalır.
- Boru çapını küçük seçmek: sürtünme kaybı pompa ihtiyacını büyütür.
- Kuru çalışma korumasını atlamak: kuyu çekilirse pompa zarar görür; seviye sensörü veya benzeri koruma kullanılmalıdır.
- Panelleri gölgeli ya da yönü kötü bir noktaya koymak.

## Sık sorulan sorular

### Bulutlu havada pompa ne yapar?

Güneş pompası sürücüleri ışığa göre çalışır: ışık azaldığında debi düşer, çok azaldığında pompa durur ve ışık geri gelince yeniden çalışır. Bu nedenle akü gerekmez; günlük su hedefi tutturulurken kullanılabilir güneşli saat sayısı hesaba katılır.

### Mevcut AC pompamı güneşle çalıştırabilir miyim?

Çoğu zaman evet: uygun bir güneş pompası sürücüsü ile AC pompa panellerden çalıştırılabilir. Pompa ve motorun gerilimi, gücü ve sürücü uyumu kontrol edilir. Pompa etiketini ve kuyu bilgisini bize yazın, birlikte değerlendirelim.

### kW ile HP arasındaki çevrim nedir?

1 kW yaklaşık 1,341 HP'dir. Örneğin 1,95 kW yaklaşık 2,6 HP eder.

Sulama sistemlerimiz hakkında [Tarımsal Sulama sayfasına](https://www.gespaenerji.com/tarimsal-sulama.html), genel sistem boyutlandırma için [off-grid rehberine](https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html) bakabilirsiniz.

*Bu yazı genel bilgilendirme amaçlıdır. Örnek hesaplar ideal koşulları ve belirtilen varsayımları kullanır; gerçek değerler ışınım, sıcaklık, kablo, gölgelenme ve ekipmana göre değişir. Kesin seçim ve kurulum için ürün künyesine, üretici talimatına ve yerel mevzuata uyunuz.*

## Sulama sisteminizi birlikte hesaplayalım

Günlük su ihtiyacınızı, kuyu derinliğinizi ve konumunuzu WhatsApp'tan yazın, pompa ve panel gücünü hesaplayalım.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
