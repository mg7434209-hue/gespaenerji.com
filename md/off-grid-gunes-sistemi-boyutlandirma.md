---
title: "Off-Grid Güneş Sistemi Nasıl Boyutlandırılır? | GESPA"
description: "Günlük tüketimden panel, akü ve inverter gücünü hesaplayın: adım adım formüller, örnek hesap ve sık yapılan hatalar. Sistem Kurucu ile aynı mantık."
canonical: https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html
lang: tr
dateModified: 2026-10-30
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Rehberler](https://www.gespaenerji.com/rehberler.html) / Off-grid boyutlandırma

# Off-Grid Güneş Enerjisi Sistemi Nasıl Boyutlandırılır? Panel, Akü ve İnverter Hesabı

Şebekeden bağımsız bir güneş sisteminin boyutu tek bir sorudan başlar: günde kaç watt-saat enerji kullanıyorsunuz? Bu rehberde cihaz listesinden panel, akü ve inverter gücüne dört adımda ulaşıyoruz. Örnek hesap, sitedeki Sistem Kurucu'nun varsayımlarıyla aynıdır.

Yayın: 30 Ekim 2026 · GESPA Enerji

**Kısaca:** Off-grid sistemin boyutu günlük enerji ihtiyacından (Wh) çıkar. Panel gücü, günlük ihtiyaç ÷ (kış güneşlenme saati × sistem verimi); akü kapasitesi, günlük ihtiyaç × özerklik günü ÷ (kullanılabilir derinlik × inverter verimi); inverter gücü ise eş zamanlı yük ile en büyük kalkış payına güvenlik çarpanı uygulanarak bulunur. Aşağıdaki örnek hesap, sitemizdeki [Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html) ile aynı varsayımları kullanır.

## Adım 1: Günlük enerji ihtiyacını çıkarın

Her cihazın gücünü (W) günde çalıştığı saatle çarpın; sonuç watt-saattir (Wh). Hepsini toplayın. Örnek bir bağ evi:

| Cihaz | Güç | Süre | Günlük enerji |
| --- | --- | --- | --- |
| LED aydınlatma (5 × 10 W) | 50 W | 5 saat | 250 Wh |
| Küçük buzdolabı | 80 W | 8 saat (fiili çalışma) | 640 Wh |
| Televizyon ve uydu alıcısı | 100 W | 4 saat | 400 Wh |
| Telefon ve dizüstü şarjı | 60 W | 3 saat | 180 Wh |
| Hidrofor | 300 W | 1 saat | 300 Wh |
| Toplam | 590 W | | 1.770 Wh ≈ 1,77 kWh |

Bunlar örnek değerlerdir; kendi cihazlarınızın etiket gücünü ve gerçek kullanım sürelerini yazın. Termostatlı cihazlar (buzdolabı) gün boyu sürekli çalışmaz, fiili çalışma süresi alınır.

## Adım 2: Panel gücü

Panel gücü (kWp) = günlük Wh ÷ (güneşlenme saati × sistem verimi × 1.000)

**Güneşlenme saati**, panelin tam güneşte çalışmış gibi sayılan eşdeğer saatidir. Sistem Kurucu tasarım günü olarak Akdeniz kış ortalamasını, yani 4,5 saati kullanır; sistemi kışa göre kurarsanız yazın fazla üretirsiniz. **Sistem verimi** (0,75), panelden aküye, inverterden yüke kadar zincirdeki kayıpları, sıcaklık ve kirlenmeyi karşılar. Gölgelenme ve yön/eğim ek kayıp yaratır ([gölgelenme](https://www.gespaenerji.com/sozluk.html#golgelenme), [performans oranı](https://www.gespaenerji.com/sozluk.html#performans-orani)).

1.770 ÷ (4,5 × 0,75 × 1.000) = 0,52 kWp

Yaklaşık 0,52 kWp gerekir; 285 W'lık 2 panel (570 Wp) bu ihtiyacı karşılar.

## Adım 3: Akü kapasitesi

Akü (kWh) = günlük Wh × özerklik günü ÷ (DoD × inverter verimi × 1.000)

**Özerklik**, güneşsiz günlerde sistemin kaç gün ayakta kalacağıdır; 1 gün başlangıç için yaygın bir seçimdir. **DoD** (kullanılabilir deşarj derinliği) lityum aküde 0,9 alınır; kurşun-asit, AGM ve jel akülerde kullanılabilir derinlik çok daha düşüktür, üretici verisine bakın ([DoD nedir?](https://www.gespaenerji.com/sozluk.html#dod)). Inverter verimi 0,92'dir.

1.770 × 1 ÷ (0,9 × 0,92 × 1.000) = 2,14 kWh 2 gün özerklik için: 1.770 × 2 ÷ 828 = 4,28 kWh

Örneğin [TitanX 51,2 V 102 Ah LiFePO₄ akü](https://www.gespaenerji.com/aku-titanx-51v-102ah.html) nominal 5,2 kWh (51,2 × 102) kapasitelidir: bu örnekte 2 günlük özerklik için bile yeterli kalır.

## Adım 4: İnverter gücü

İnverter (kW) = (toplam güç × eş zamanlılık + en büyük kalkış payı) × 1,3 ÷ 1.000

Tüm cihazlar aynı anda çalışmaz; Sistem Kurucu eş zamanlılık için 0,7 kullanır. Buzdolabı ve pompa gibi motorlu yükler çalışmaya başlarken anlık olarak çok daha fazla güç çeker (kalkış). Sonuca 1,3 güvenlik çarpanı uygulanır.

590 W × 0,7 = 413 W · + 600 W (hidrofor kalkışı, örnek kabul) = 1.013 W · × 1,3 ≈ 1,32 kW

Pratikte 1,5 kW sınıfı bir inverter seçilir. Motorlu yükler için saf sinüs çıkışlı inverter tercih edilir.

## Sistem gerilimi: 12, 24 mü 48 V mu?

Aynı güçte gerilimi iki katına çıkarmak akımı yarıya indirir: 3 kW'lık bir yük 12 V'ta yaklaşık 250 A, 48 V'ta yaklaşık 62,5 A çeker. Akım düştükçe kablo kesiti, sigorta ve kayıplar da küçülür. Bu yüzden küçük sistemler genellikle 12 V, orta sistemler 24 V, büyük ev sistemleri 48 V ile kurulur. Akü, inverter ve şarj kontrol cihazı **aynı gerilimde** olmalıdır. Şarj kontrol cihazı seçimi için [PWM mi MPPT mi rehberine](https://www.gespaenerji.com/pwm-mppt-sarj-kontrol-farki.html) bakın.

## Sık yapılan hatalar

- Yaz güneşine göre tasarlayıp kışın yetersiz kalmak: tasarımı kış değerine göre yapın.
- Kalkış gücünü hesaba katmamak: buzdolabı ve pompa inverteri aşırı yükler.
- Akü kapasitesini kullanılabilir kapasite sanmak: DoD ile çarpmak gerekir.
- Akü, inverter ve şarj kontrol gerilimlerini uyumsuz seçmek (ör. 48 V akü ile 24 V inverter).
- Kablo ve sigortayı atlamak: [DC kablo aracı](https://www.gespaenerji.com/hesaplayici.html) gerilim düşümünü hesaplar.

## Hesabı sizin için yapalım

[Sistem Kurucu](https://www.gespaenerji.com/sistem-kur.html), kullanım yerinizi ve cihazlarınızı seçmenizle yukarıdaki dört adımı otomatik yapar; mağazada satılan ürünleri sepete ekler. Çatı üzerindeki panel yerleşimi ve tasarruf hesabı için [tasarruf hesaplayıcıya](https://www.gespaenerji.com/hesaplayici.html) bakabilirsiniz.

## Sık sorulan sorular

### Kışın üretim gerçekten günde 4,5 saat mi?

4,5, Akdeniz kış ayları ortalaması olarak kullanılan bir tasarım değeridir; bölgeye, panel eğimine ve gölgeye göre değişir. Daha serin ve bulutlu bölgelerde daha düşük kabul edin. Yaz daha yüksek olduğundan, kışa göre tasarlanan sistem yazın fazla üretir.

### Akü olmadan off-grid sistem kurulabilir mi?

Güneş doğrudan yükü besleyecekse, örneğin gündüz çalışan bir sulama pompası, akü gerekmez. Gece veya bulutlu havada çalışma gerekiyorsa akü şarttır. Pompa için [solar sulama pompası rehberine](https://www.gespaenerji.com/solar-sulama-pompasi-secimi.html) bakın.

### Kaç gün özerklik seçmeliyim?

Bağ evi gibi hafta sonu kullanımda 1 gün başlangıç için yeterli olabilir; art arda güneşsiz günlerin görüldüğü bölgelerde veya kesintisiz çalışması gereken yüklerde 2–3 gün düşünülür. Her ek gün akü maliyetini artırır.

*Bu yazı genel bilgilendirme amaçlıdır. Örnek hesaplar ideal koşulları ve belirtilen varsayımları kullanır; gerçek değerler ışınım, sıcaklık, kablo, gölgelenme ve ekipmana göre değişir. Kesin seçim ve kurulum için ürün künyesine, üretici talimatına ve yerel mevzuata uyunuz.*

## Sisteminizi birlikte boyutlandıralım

Cihaz listenizi WhatsApp'tan yazın, panel, akü ve inverter ihtiyacını hesaplayalım.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/off-grid-gunes-sistemi-boyutlandirma.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
