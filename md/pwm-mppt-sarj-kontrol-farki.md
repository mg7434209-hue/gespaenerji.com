---
title: "PWM mi MPPT mi? Şarj Kontrol Cihazı Nasıl Seçilir | GESPA"
description: "PWM ve MPPT şarj kontrol cihazı farkı, hangisi ne zaman seçilir, panel gerilimi ve akım hesabı, adım adım örnek. Lexron ve Havensis modelleriyle."
canonical: https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html
lang: tr
dateModified: 2026-10-30
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Rehberler](https://www.gespaenerji.com/rehberler.html) / PWM mi MPPT mi?

# PWM mi MPPT mi? Güneş Paneli Şarj Kontrol Cihazı Seçim Rehberi

Aynı panel, aynı akü: yalnızca şarj kontrol cihazı değişince aküye giren enerji değişir. Bu rehberde PWM ve MPPT'nin farkını, hangisinin ne zaman mantıklı olduğunu ve cihaz seçerken yapılacak üç hesabı örnekle anlatıyoruz.

Yayın: 30 Ekim 2026 · GESPA Enerji

**Kısaca:** PWM, panelin gerilimini akü gerilimine "çeker"; panel gerilimi akü geriliminden ne kadar yüksekse o kadar enerji kullanılamaz. MPPT ise paneli en verimli noktasında çalıştırır ve fazla gerilimi akıma çevirerek aküye aktarır. Panel gerilimi akü gerilimine zaten yakınsa (küçük, nominal 12 V'luk panel ve 12 V akü) PWM yeterlidir; 60/72 hücreli büyük paneller, 24/48 V akü grupları ve seri bağlı diziler için MPPT seçilir.

## Şarj kontrol cihazı ne işe yarar?

Panelin verdiği değişken gerilim ve akımı, akünün istediği şarj profiline çevirir: kademeli şarj, gerilim sınırı ve akım sınırı. Aküyü aşırı şarjdan korur, geceleri akımın panele geri akmasını engeller. Güneş paneli aküye doğrudan bağlanmaz; arada mutlaka bir şarj kontrol cihazı bulunur.

## PWM nasıl çalışır?

PWM (darbe genişlik modülasyonu) cihazı, panel ile akü arasında hızlı bir anahtar gibi çalışır. Şarj sırasında panel, akünün gerilimine yakın bir gerilimde çalışır. Panelin gücü gerilim × akım olduğundan, panel kendi en verimli geriliminde (Vmp) değil çok daha düşük bir gerilimde çalışıyorsa potansiyelinin bir bölümü kullanılmadan kalır. PWM'in avantajı basit, ucuz ve dayanıklı olmasıdır; panel gerilimi akü gerilimine uygunsa kayıp küçüktür.

## MPPT nasıl çalışır?

MPPT (maksimum güç noktası izleme) cihazının içinde bir DC-DC dönüştürücü bulunur. Panelin o anki ışık ve sıcaklıkta en çok güç verdiği noktayı (Vmp ve Imp) sürekli arar, panelin bu noktada çalışmasını sağlar ve gerilim farkını akıma çevirerek aküye verir. Yüksek gerilimli panelden gelen enerji, daha düşük gerilimli ama daha yüksek akımlı şarj olarak aküye ulaşır. Üretici verilerinde dönüştürücü verimi yüzde 97 civarındadır; örneğin Havensis Solar-60AMPS 150|60 için üretici %97,5 verim belirtir. [MPPT nedir? GES Sözlüğü →](https://www.gespaenerji.com/sozluk.html#mppt)

## Aynı panelle bir örnek

Lexron 285 W panelin künye değerleri: Vmp 35,85 V, Imp 7,95 A, Isc 8,19 A ([ürün sayfası](https://www.gespaenerji.com/panel-lexron-285w.html)). Bu panelin 12 V'luk bir aküyü (şarj sırasında yaklaşık 13 V) şarj ettiğini düşünelim:

| | PWM | MPPT |
| --- | --- | --- |
| Panelin çalıştığı gerilim | ≈ 13 V (akü gerilimine çekilir) | ≈ 35,85 V (Vmp) |
| Aküye giden akım | ≈ 8 A (panel akımı, Isc civarı) | ≈ 21 A (285 W × %97 ÷ 13 V) |
| Aküye giden güç | ≈ 105 W (8 A × 13 V) | ≈ 275 W |

Bu uç bir örnektir: büyük bir panel ile 12 V akü ve PWM nadiren doğru eşleşmedir. PWM için doğru eşleşme, Vmp'si akü gerilimine yakın küçük panellerdir; orada kayıp daha küçüktür. Ancak gösterdiği ilke geneldir: **panel gerilimi akü geriliminden ne kadar yüksekse PWM'de kayıp o kadar büyür.** Gerçek değerler ışınım, sıcaklık, kablo ve akü gerilimine göre değişir; örnek ideal koşulları varsayar.

## Hangi durumda PWM, hangisinde MPPT?

| Kriter | PWM | MPPT |
| --- | --- | --- |
| Panel gerilimi | Akü gerilimine yakın olmalı (ör. nominal 12 V'luk küçük panel + 12 V akü) | Akü geriliminden yüksek olabilir (60/72 hücreli paneller, seri diziler) |
| Aynı panelden toplanan enerji | Panel ile akü gerilimi arasındaki fark büyüdükçe azalır | Panelin o anki en verimli noktasına yakın enerji toplar |
| Panel tarafı kablo | Panel gerilimi akü gerilimine yakın tutulur, akım yüksek olabilir | Seri dizide yüksek gerilim, düşük akım: daha ince kablo mümkün |
| Fiyat | Daha ucuz | Daha pahalı |
| Tipik kullanım | Küçük aydınlatma, kamera, kamp ve karavan setleri | Off-grid ev ve bağ evi, 24/48 V akü grupları, seri panel dizileri |

Sistem büyüdükçe ve panel gerilimi akü geriliminden yükseldikçe MPPT'nin sağladığı fark parasal olarak da büyür. Soğuk havada panel gerilimi yükselir; MPPT bu yüksek gerilimi de değerlendirir, ancak cihazın giriş gerilimi sınırı aşılmamalıdır.

## Cihaz seçerken yapılacak 3 hesap

- **Akü gerilimi ve tipi.** Cihaz 12, 24 veya 48 V akü grubunu desteklemeli; AGM, jel ve LiFePO₄ gibi akü tipi için uygun şarj profili ayarlanabilmelidir. Yanlış profil akü ömrünü kısaltır; akü üreticisinin şarj gerilimlerini esas alın.
- **Maksimum panel giriş gerilimi.** Seri bağlı panellerin Voc toplamı × 1,1, cihazın giriş sınırının altında kalmalıdır. 1,1 payı, soğukta Voc'un yükselmesi içindir; sitemizdeki ürün sayfalarında da bu pratik kural kullanılır.
- **Akım.** MPPT için toplam panel gücü ÷ akü gerilimi, cihazın şarj akımının altında kalmalıdır. PWM için bağlanan panellerin toplam Isc değeri cihazın akımını aşmamalıdır.

### Örnek: 2 × Lexron 655 W seri, 48 V akü

Künye: Voc 50,34 V, Imp 15,48 A ([Lexron 655 W](https://www.gespaenerji.com/panel-lexron-655w.html)).

Voc toplamı = 2 × 50,34 = 100,68 V · × 1,1 ≈ 110,7 V Panel gücü = 2 × 655 = 1.310 W · ÷ 48 V ≈ 27 A

110,7 V, [Havensis Solar-60AMPS 150|60](https://www.gespaenerji.com/havensis-mppt-60a-150v.html) gibi 150 V girişli bir cihaz için uygundur; 27 A, 60 A'lik cihazın rahatça altındadır. **Üç panel seri bağlansaydı** Voc toplamı 151 V, × 1,1 ise yaklaşık 166 V olurdu ve 150 V sınırı aşılırdı: bu dizi uygun değildir. 24 V akü grubunda ise aynı 1.310 W için akım ≈ 55 A çıkar; 60 A'lik cihazda marj çok azdır, daha büyük cihaz ya da 48 V sistem düşünülür.

## Sık yapılan hatalar

- Seri dizinin Voc toplamını soğuk hava payı olmadan hesaplamak: sabah ve kışın gerilim yükselir.
- Cihazı yalnızca akıma göre seçip panel giriş gerilimi sınırını kontrol etmemek.
- Akü tipine uygun olmayan şarj profili kullanmak.
- Şarj kontrol cihazını şebekeye bağlı (on-grid) inverterle birlikte düşünmek: şarj kontrol cihazı aküyü şarj eder; şebeke bağlantılı inverterlerde MPPT inverterin içindedir ([on-grid nedir?](https://www.gespaenerji.com/sozluk.html#on-grid)).
- Panel ile cihaz arasındaki kablo kesitini küçük seçmek: gerilim düşümü kaybı artırır. [Hesaplayıcıdaki DC kablo aracı](https://www.gespaenerji.com/hesaplayici.html) kesiti hesaplar.

## Mağazamızdaki şarj kontrol cihazları

PWM tarafında Lexron 20, 30, 40 ve 60 A modelleri ([örnek: Lexron 30 A PWM](https://www.gespaenerji.com/lexron-pwm-30a.html)); MPPT tarafında Lexron 20, 30, 40 A modelleri ([örnek: Lexron 30 A MPPT](https://www.gespaenerji.com/lexron-mppt-30a.html)), [Lexron 80 A HV MPPT](https://www.gespaenerji.com/lexron-mppt-80a-hv.html) ve Havensis Solar-30AMPS ile Solar-60AMPS serisi ([150 V girişli 60 A model](https://www.gespaenerji.com/havensis-mppt-60a-150v.html)) bulunur. Tüm şarj kontrol ürünlerini [mağazada](https://www.gespaenerji.com/online-satis.html?kategori=sarj-kontrol) görebilirsiniz.

Panelinizin künyesini (Voc, Imp) ve akü gerilimini bize yazın; uygun cihazı birlikte hesaplayalım.

## Sık sorulan sorular

### MPPT, PWM'den yüzde kaç daha fazla enerji toplar?

Sabit bir yüzde yoktur. Fark; panel geriliminin akü gerilimine oranına, sıcaklığa ve ışınıma bağlıdır. Gerilimler birbirine yakınsa fark küçüktür, aradaki gerilim farkı büyüdükçe belirgin hale gelir. Yukarıdaki örnekte 12 V akü ile büyük bir panelde fark çok büyüktür; küçük 12 V'luk panellerde çok daha azdır. Kendi panel ve akü bilgilerinizle hesap için bize yazabilirsiniz.

### 60 veya 72 hücreli panel PWM cihazla çalışır mı?

Yalnızca panelin Voc değeri cihazın giriş gerilimi sınırının altındaysa ve akü gerilimi uygunsa bağlanabilir; ancak panelin gücünün önemli bölümü kullanılamaz. Bu tür paneller için MPPT önerilir. Giriş gerilimi sınırını cihazın etiketinden veya üreticiden teyit edin.

### MPPT cihazın akımını nasıl seçerim?

Toplam panel gücünü akü gerilimine bölün; çıkan değer cihazın şarj akımının altında kalmalıdır (örneğin 1.310 W ÷ 48 V ≈ 27 A). Üretici panel gücü sınırı belirtmişse onu da aşmayın.

### Şarj kontrol cihazını şebekeye bağlı inverterle kullanabilir miyim?

Hayır. Şarj kontrol cihazı aküyü şarj eder; şebekeye bağlı (on-grid) sistemlerde MPPT işlevi inverterin içindedir. Şebeke bağlantılı çatı sistemi için çatı GES hizmetimizi inceleyebilirsiniz.

Sistemin tamamını hesaplamak için [off-grid sistem boyutlandırma rehberine](https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html) ve [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html)'ya bakabilirsiniz.

*Bu yazı genel bilgilendirme amaçlıdır. Örnek hesaplar ideal koşulları ve belirtilen varsayımları kullanır; gerçek değerler ışınım, sıcaklık, kablo, gölgelenme ve ekipmana göre değişir. Kesin seçim ve kurulum için ürün künyesine, üretici talimatına ve yerel mevzuata uyunuz.*

## Panelinize ve akünüze uygun cihazı birlikte seçelim

Panel künyesini ve akü gerilimini WhatsApp'tan yazın, uygun şarj kontrol cihazını hesaplayalım.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
