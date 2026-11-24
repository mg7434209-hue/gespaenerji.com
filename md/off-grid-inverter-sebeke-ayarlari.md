---
title: "Off-Grid İnverter Şebeke Ayarları: Öncelik ve Dönüş | GESPA"
description: "Off-grid inverter şebeke bağlıyken: çıkış ve şarj önceliği, şebekeye ve aküye dönüş noktaları, AC giriş aralığı ve program tabloları; üç kılavuza göre."
canonical: https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html
lang: tr
dateModified: 2026-11-24
publisher: "GESPA Enerji"
---

[Ana Sayfa](https://www.gespaenerji.com/) / [Elektrikçi Çantası](https://www.gespaenerji.com/elektrikci-cantasi.html) / Şebeke Ayarları

# Off-Grid İnverter Şebeke Bağlıyken Nasıl Ayarlanır?

Kılavuzu seçin; çıkış önceliği, şarj önceliği ve dönüş noktalarının o kılavuzda ne yaptığını görün.

## Arama aracı

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

**İlgili:** [Lityum akü ayarı (üç kılavuz)](https://www.gespaenerji.com/off-grid-inverter-lityum-aku-ayarlari.html) · [Şebeke bağlıyken ayarlar](https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html) · [İnverter hata kodları](https://www.gespaenerji.com/elektrikci-cantasi.html#inverter-kodlari) · [Akü bankası bağlama](https://www.gespaenerji.com/elektrikci-cantasi.html#aku)

Usta / toplu alım fiyatı için: [WhatsApp'tan yazın](https://wa.me/905437434209)

**Önce şunu bilin:** Bu sayfa üç kullanım kılavuzunda yazanları yan yana verir; genel bir ayar önerisi değildir. Aynı adlı ayar iki cihazda farklı davranabilir. Akü şarj gerilimi gibi değerlerde akü üreticisinin değeri esastır. Kılavuzda okunamayan ya da kendi içinde çelişen satırlar yayınlanmamıştır.

**Kod anlamı markaya ve modele göre değişir; cihazınızın kendi kılavuzu esastır.**

## 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5): Şebeke bağlıyken

Kaynak: Akıllı İnvertör Kullanım Kılavuzu — 3.6KW / 6.5KW / 7.2KW Solar Inverter / Şarj Cihazı (Sürüm 1.5) — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Çıkış kaynağı önceliği (program 01)

- USb — Önce şebeke (varsayılan): şebeke yükleri birinci öncelikle besler; güneş ve akü yalnızca şebeke yokken besler.
- SUb — Önce güneş: güneş yükleri birinci öncelikle besler; yetmezse ŞEBEKE aynı anda yükleri besler.
- SbU — SBU: güneş birinci öncelik; yetmezse AKÜ aynı anda besler; şebeke yalnızca akü voltajı düşük seviye uyarı voltajına veya program 12 ayar noktasına düşünce besler.
- Çizgi [=Hat/Şebeke] modu (s.45): 'SUB' (önce güneş) seçiliyse ve güneş enerjisi yükü sağlamaya yetmiyorsa, yükleri güneş enerjisi ve şebeke birlikte sağlar ve aynı anda pili şarj eder. 'SUB' veya 'SBU' seçiliyse ve batarya bağlı değilse, yükleri güneş enerjisi ve şebeke sağlar.

s.22, 45

Şebekeye dönüş noktası (program 12)

SBU seçiliyken şebeke kaynağına geri dönüş voltaj noktası. 24V: 22–25,5V (vars. 23,0V, adım 0,5V); 48V: 44–51V (vars. 46V, adım 1V).

s.26

Aküye dönüş noktası (program 13)

SBU seçiliyken pil moduna geri dönüş voltaj noktası. 24V: 'Pil tam şarjlı' (FUL) veya 24–31V (vars. 27V, adım 0,5V); 48V: FUL veya 48–62V (vars. 54V, adım 1V).

s.26-27

Şarj kaynağı önceliği (program 16)

- CSO — Önce güneş: güneş aküyü öncelikle şarj eder; şebeke yalnızca güneş enerjisi mevcut olmadığında şarj eder.
- SNU — Güneş ve şebeke (varsayılan): ikisi aynı anda şarj eder.
- OSO — Sadece güneş: şebeke olsun olmasın tek şarj kaynağı güneş.
- Hat, Bekleme veya Arıza modunda geçerli; akü modunda yalnızca güneş şarj edebilir.

s.27

AC giriş voltajı aralığı (program 03)

- APL — 90-280VAC (3.6/7.2KW); 80-140VAC (6.5KW) — varsayılan
- UPS — 170-280VAC (3.6/7.2KW); 90-140VAC (6.5KW)
- Tablo 1 (s.51): Düşük kayıp voltajı 170Vac±7V (UPS) / 90Vac±7V (Cihazlar) [6.5KW: 90 / 80]; geri dönüş 180Vac±7V (UPS) / 100Vac±7V (Cihazlar) [6.5KW: 100 / 90]; yüksek kayıp 280Vac±7V [6.5KW 140]; yüksek kayıp geri dönüş 270Vac±7V [135]; maks. AC giriş voltajı 300Vac [150]; maks. AC giriş akımı 40A (3.6KW) / 60A (7.2KW, 6.5KW); frekans kaybı 40±1Hz / 65±1Hz, geri dönüş 42±1Hz / 63±1Hz; transfer süresi 10ms tipik (UPS), 20ms tipik (Cihazlar).

s.23, 51

Şarj akımı (program 02 ve 11)

- Program 02 (toplam) — 10–80A (3.6/7.2KW), 10–120A (6.5KW), vars. 60A
- Program 11 (şebeke) — 2A, sonra 10–80A (3.6/7.2KW) / 10–120A (6.5KW), adım 10A, vars. 30A. Program 02 değeri 11'den küçükse şebeke şarjı için program 02 değeri uygulanır.

s.23, 26

Aşırı yükte şebekeye geçiş (program 23)

byd (varsayılan) / byE. Etkinleştirildiğinde, pil modunda aşırı yüklenme olursa ünite hat [şebeke] moduna aktarılır.

s.28

En yüksek deşarj akımı (program 41)

Deşarj akımı ayar değerini aşarsa akü deşarjı durur; şebeke varsa invertör bypass modunda çalışır; şebeke yoksa akü modunda 5 dakika çalıştıktan sonra kapanır. (yalnızca 6.5/7.2KW)

s.31-32

Şebeke varken düşük DC kesme (program 29)

PV enerjisi, akü gücü ve şebeke mevcutsa, [düşük DC kesmede] invertör hat moduna geçer ve yüklere çıkış gücü sağlar.

s.30

Şebekeye besleme (satış)

Kılavuzda şebekeye satış/besleme (export) ayarı yok. Paralel arıza kodu 60 'Güç geri besleme koruması' olarak tanımlı (s.71).

s.71

Çıkış voltajı ve frekansı

Program 09 (50/60Hz) ve program 10 (220/230/240V veya 110/120/127V).

Zamanlayıcılar

Çıkış kaynağı ve şarj kaynağı önceliği için günlük zamanlayıcılar , s.36-38

Şebeke var ama cihaz akü modunda (sorun giderme)

Şebeke var ancak ünite pil modunda çalışıyor (s.55): (a) Giriş voltajı LCD'de 0, yeşil LED yanıp sönüyor → giriş koruyucusu atmış → AC kesiciyi ve AC kablolarını kontrol edin. (b) Yeşil LED yanıp sönüyor → AC gücünün kalitesi yetersiz (şebeke veya jeneratör) → AC kabloları çok ince/uzun mu, jeneratör iyi çalışıyor mu, giriş voltaj aralığı ayarı (UPS→Cihaz) doğru mu kontrol edin. (c) Çıkış kaynağı önceliği 'Solar First' ayarlı → önceliği 'Utility first' olarak değiştirin.

Kuru kontak

Kuru kontak (3A/250VAC), s.16: Program 01 USB veya SUB iken akü voltajı < düşük DC uyarı voltajı → NC&C açık, NO&C kapalı; akü voltajı > program 13 ayarı veya float aşaması → NC&C kapalı, NO&C açık. Program 01 SBU iken akü voltajı < program 12 ayarı → NC&C açık, NO&C kapalı; akü voltajı > program 13 ayarı veya float → NC&C kapalı, NO&C açık.

Paralel çalışma

- Tek fazda en çok 6 ünite paralel (7.2KW: 43.2KW/43.2KVA; 6.5KW: 39KW/39KVA). Üç fazlı: en çok 6 ünite, bir fazda en çok dört. Bölünmüş faz yalnızca 6.5KW. Tablo 5 (s.54): maksimum paralel sayı 6; 'Not: Yalnızca PV gücü kullanılabilir olduğunda paralel özellik devre dışı bırakılır'.
- Program 28: SIG / PAL / 3P1 / 3P2 / 3P3 / 2P1 / 2P2(120°/180°); yalnızca açma/kapama düğmesi KAPALI iken ayarlanır.

s.54, 57-74

## MEXX-P12KW (kılavuz V1.1): Şebeke bağlıyken

Kaynak: MEXX-P12KW Tam Sinüs Akıllı Inverter Kullanım Kılavuzu (Off-Grid İnverter V1.1) — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Güç kaynak önceliği

- SOL — PV güç öncelik modu (s.23): yüke güç sağlamak için PV gücüne öncelik verir. PV gücü kullanılamadığında, şebeke ve akü tarafından güç sağlanır. Nispeten istikrarlı elektrik şebekesi olan bölgeler için uygundur. Öncelik: PV gücü -> Şebeke -> akü.
- UTI — Şebeke öncelik modu (s.24): yüke güç sağlamak için şebekeye öncelik verir. Akü güç kaynağı yalnızca şebeke mevcut olmadığında uygulanır; şebeke mevcut olduğunda şebeke şarja başlar ve güç kaynağı olarak şebeke uygulanır. Fotovoltaik güç varsa önce aküyü şarj eder ve fazla enerji şebekenin tamamlayıcı olduğu bir şekilde yüke aktarılır. Dengesiz elektrik şebekesi olan bölgeler için uygundur. Öncelik: Şebeke -> Fotovoltaik güç -> akü.
- SBU — İnverter öncelik modu (s.25): şebeke yalnızca akü voltajı ayar noktasından düşük olduğunda güç beslemesi için kullanılır; akü şarj voltajı ayar noktasından yüksek olduğunda akü deşarj modu uygulanır, böylece akü şarj ve deşarj döngüsü tekrarlanır. Kararlı elektrik şebekesi olan bölgelerde kullanılır. Öncelik: PV gücü -> akü -> şebeke.

s.23-25, 40

Şarj kaynak önceliği

- CSO — PV şarj önceliği (s.25): fotovoltaik güç aküyü şarj etmeye öncelik verir; şebeke şarjı yalnızca fotovoltaik güç çalışma koşullarını karşılamadığında başlar.
- SNU — PV ve şebeke şarjı (s.26; başlık kılavuzda yalnızca 'Şarj:' olarak basılmış): PV şarjı tercih edilir, PV yetersizse şebekeyle birlikte takviye edilir; en hızlı şarj. Ayar tablosu notu (s.40): yalnızca şebeke bypass çıkışı yüklendiğinde PV ve şebeke şarjı aynı anda uygulanabilir; invertör çalışırken PV gücü aküyü şarj etmek için kullanılır.
- OSO — Sadece PV şarj modu (s.26): aküyü şarj etmek için şebekeye ihtiyaç duyulmadan yalnızca fotovoltaik enerji kullanılır.

s.25-26, 40

Şebekeye dönüş noktası

- Kurşun-asit — Aküden Şebekeye Geçiş Voltajı: varsayılan 46V, 44~52V (SBU iken; yalnız kurşun asit) (s.45)
- Lityum (BMS) — Şebeke içi deşarj kesme SOC: varsayılan 50, 10~90 (s.46)

Aküye dönüş noktası

- Kurşun-asit — Şebekeden Aküye Geçiş Voltajı: varsayılan 54V, 48~58V (SBU iken; yalnız kurşun asit) (s.45)
- Lityum (BMS) — Şebeke var iken deşarj yeniden başlama SOC: varsayılan 90, 20~100 (s.46)

AC giriş aralığı (AC Modu)

- APL — 90~280VAC (ev aletleri)
- UPS — 170~265VAC (bilgisayarlar vb.) — varsayılan
- Teknik tablo (s.57): Giriş voltaj aralığı 90~280Vac; frekans 50/60 Hz (otomatik algılama); maks. giriş akımı Şebeke 70A / Jeneratör 60A; transfer süresi 10ms.

s.48, 57

Bypass durumu

Ana ekran durumu 'Bypass': İnverter şebeke bypass modundadır. Bu gösterge, PV girişi olmadığında ve akü kullanılamadığında şebekeden alınan güç esnasında görünür. 'OnGrid': elektrik şebekesine bağlıyken çalışma modu; 'OffGrid': şebekeye bağlı değilken. Arıza 105: 'Bypass AC çıkışı aşırı yüklendi'. Akü modunda aşırı yükte şebekeye (bypass'a) aktarma ayarı kılavuzda YOK.

s.31, 55

Aşırı yük

Aşırı Yük Otomatik Yeniden Başlatma (s.41): etkinse çıkış kapanır; ilk ve ikinci geri yükleme 30 saniye, üçüncü 1 saat. Aşırı yük koruması (s.57): 30 saniye @ %102-%110 yük; 10 saniye @ %110-%130 yük; 5 saniye @ %130-%200 yük.

s.41, 57

Jeneratör girişi

Dizel jeneratör için bağımsız giriş portu (s.4). Jeneratör portu işlevi etkinken şebeke kesilir ve akü voltajı düşük voltaj bağlantı kesme eşiğine ulaşırsa kuru kontak jeneratörü çalıştırır; şebeke gelince güç kaynağı jeneratörden şebekeye aktarılır (s.49). Jeneratör giriş gücü ayarı 1–13 kW, varsayılan 12 (s.49). Kuru kontak (s.53-54): normalde NC-N kapalı, NO-N açık; akü voltajı düşük voltaj bağlantı kesme eşiğine ulaşınca NO-N kapalı, NC-N açık; NO-N dirençli yük: 125VAC/1A, 230VAC/1A, 30VDC/1A. Alarm 106/107/108 jeneratörle ilgili.

s.4, 49-50, 53-54

Paralel çalışma

- İnverter 9'a kadar paralel bağlantıyı destekler; paralellenen inverterler arasında 500 mm boşluk (s.14). Tek fazlı ve üç fazlı (3P1/3P2/3P3) paralel.
- Paralel mod seçimi: SIG (varsayılan) / PAL / 3P1 / 3P2 / 3P3
- Cihaz haberleşme adresi: 0~9 (varsayılan 0)
- Cihazın paralel sistem rolü: MAS (varsayılan) / SAL — 3P1 ise otomatik ana; 3P2 veya 3P3 ise ana ünite olarak ayarlanamaz
- s.19: Inverter 1 = PAL / adres 0 / MAS; Inverter 2 = PAL / adres 1 / SAL; Inverter 3 = PAL / adres 2 / SAL.

s.14-23, 32, 51

## 1–5 kVA akıllı inverter: Şebeke bağlıyken

Kaynak: 1KVA-5KVA Inverter / Charger — Akıllı İnvertör Kullanım Klavuzu — işletmenin sağladığı kullanım kılavuzu. **GESPA bu cihazın üreticisi değildir**; aşağıdakiler yalnız bu kılavuzda yazanlardır.

Çıkış kaynağı önceliği (program 01)

- SOL — Önce Güneş: güneş öncelikli; yetmezse aynı zamanda AKÜ de besler; şebeke yalnızca güneş yoksa veya akü voltajı uyarı voltaj seviyesine düşünce besler.
- UtI — Önce Şebeke (varsayılan): şebeke öncelikli; güneş ve akü yalnızca şebeke yokken besler.
- SbU — Güneş, Akü, Şebeke: güneş öncelikli; yetmezse akü de besler; şebeke yalnızca akü voltajı uyarı voltajına veya program 12 ayar noktasına düşünce besler.

s.17

Şebekeye dönüş noktası (program 12)

SBU modunda şebekeye geçmeden önceki akü voltajı set değeri. 1K: 11.0–12.8V (vars. 11.5V); 2K/3K: 22.0–25.5V (vars. 23.0V); 4K/5K: 44–51V (vars. 46V).

s.20-21

Aküye dönüş noktası (program 13)

Program 01'de solar veya SBU seçiliyken batarya moduna geri dönüş voltaj noktası. 'Batarya full şarjda' (FUL) veya 1K: 12.0–14.5V (vars. 13.5V); 2K/3K: 24–29V (vars. 27V); 4K/5K: 48–58V (vars. 54V).

s.22-23

Şarj kaynağı önceliği (program 16)

- CSO — Önce Güneş: güneş öncelikli şarj; şebeke yalnızca güneş enerjisi yeterli olmadığı zaman şarj eder.
- CUt — Önce Şebeke: şebeke öncelikli şarj; güneş yalnızca şebeke yokken şarj eder.
- SNU — Güneş ve Şebeke (varsayılan): aynı anda şarj.
- OSO — Sadece Güneş: şebeke olsun olmasın yalnız güneş şarj eder.
- Şebeke, bekleme veya hata modunda geçerli; akü modunda/güç tasarrufu modunda yalnız güneş şarj edebilir.

s.24

AC giriş voltaj aralığı (program 03)

- APL — 90-280VAC (varsayılan)
- UPS — 170-280VAC
- Tablo 1 (s.33-34): Şebeke düşük voltajı 170Vac±7V (UPS) / 90Vac±7V (Appliances); şebeke start voltajı 180Vac±7V (UPS) / 100Vac±7V (Appliances); şebeke aşırı yüksek 280Vac±7V; 'Şebeke Max Ac Voltajı' 270Vac±7V; Max AC giriş voltajı 300Vac; frekans 40±1Hz / 65±1Hz (dönüş 42±1Hz / 63±1Hz); transfer zamanı 10ms typical (UPS), 20ms typical (Appliances). Çıkış güç azalması: AC giriş voltajı 170V'a düştüğü zaman çıkış gücü azaltılmış olacak.

s.18, 33-34

Şarj akımı (program 02 ve 11)

- Program 02 (toplam) — 1K: 10–50A; 2K/3K: 20–50A; 4K/5K: 60–110A (10A adımlı liste)
- Program 11 (şebeke) — 1K: 10A / 20A (vars.); 2K/3K: 20A / 30A (vars.); 4K/5K: 2A, 10A, 20A, 30A (vars.), 40A, 50A, 60A. Program 02 değeri 11'den küçükse şebeke şarjı için program 02 değeri geçerli olur.
- Tablo 3 (s.35): AC Şarj Akımı 10/20Amp (1KVA), 20/30Amp (@V I/P=230Vac) diğerleri.

s.17-20, 35

Aşırı yükte şebekeye geçiş (program 23)

byd (varsayılan) / byE. Devreye alındığında, akü modunda aşırı yüklenme olursa cihaz şebeke moduna aktarılır.

s.25

Güç tasarrufu modu (program 04)

SdS (varsayılan) / SEN: yük çok düşük veya yok ise tasarruf moduna geçer.

s.18-19

Şebekeye besleme (satış)

Kılavuzda şebekeye satış/besleme (export) ile ilgili hiçbir ayar veya ifade yok.

Aküsüz çalışma

Hata modu tablosu (s.31): 'Cihaz aküsüz çalışmaya başladığı zaman, şebeke yükleri besleyebilir. (Sadece 4K/5K'nın tek çalışan modelleri için uygundur. 4K/5K'nın paralellenen modeli için uygun değildir.)'

Şebeke var ama cihaz akü modunda (sorun giderme)

Şebeke mevcut fakat cihaz akü modunda çalışıyor (s.37): (a) Giriş voltajı ekranda 0, yeşil LED yanıp sönüyor → giriş koruyucusu devreye girmiş → AC kesiciyi ve AC kablolamayı kontrol ediniz. (b) Yeşil LED yanıp sönüyor → AC gücünün yetersiz kalitesi (şebeke yada jeneratör) → AC kabloların çok ince/uzun olup olmadığını; jeneratörün iyi çalıştığını ve giriş voltaj aralığı ayarının doğru olduğunu kontrol ediniz. (c) Çıkış kaynak önceliği 'Önce Güneş' belirlenmiş → 'Önce Şebeke' olarak değiştir.

Kuru kontak

Kuru kontakt (3A/250VDC), s.13-14: Program 01 şebeke olarak ayarlıyken akü voltajı < düşük DC uyarı voltajı → NC&C açık, NO&C kapalı; akü voltajı > program 13 ayarı veya batarya şarjı 'değişken' [float] duruma ulaşınca → NC&C kapalı, NO&C açık. Program 01 SBU veya öncelik Solar iken akü voltajı < program 12 ayarı → NC&C açık, NO&C kapalı; akü voltajı > program 13 ayarı veya float → NC&C kapalı, NO&C açık.

## 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5): program tablosu

Kaynak: Akıllı İnvertör Kullanım Kılavuzu — 3.6KW / 6.5KW / 7.2KW Solar Inverter / Şarj Cihazı (Sürüm 1.5) — işletmenin sağladığı kullanım kılavuzu. Kılavuzda okunamayan ya da kendi içinde çelişen satırlar bu tabloya alınmamıştır.

| No | Ayar | Seçenekler (ekran kodu) | Varsayılan / aralık / not | Sayfa |
| --- | --- | --- | --- | --- |
| 00 | Ayar modundan çıkma | ESC — Kaçmak [=Çıkış/Escape] | — | s.22 |
| 01 | Çıkış kaynağı önceliği: Yük güç kaynağı önceliğini yapılandırmak için | USb — Önce yardımcı program (varsayılan) [=Önce şebeke/Utility first]: Yardımcı program [şebeke], yüklere birinci öncelik olarak güç sağlayacaktır. Güneş ve akü enerjisi, yalnızca şebeke gücü mevcut olmadığında yüklere güç sağlayacaktır.SUb — Önce güneş: Güneş enerjisi yüklere birinci öncelik olarak güç sağlar. Güneş enerjisi bağlı tüm yüklere güç sağlamak için yeterli değilse, Şebeke enerjisi aynı anda yüklere güç sağlayacaktır.SbU — SBU önceliği: Güneş enerjisi yüklere birinci öncelik olarak güç sağlar. Güneş enerjisi bağlı tüm yüklere güç sağlamak için yeterli değilse, batarya enerjisi aynı anda yüklere güç sağlayacaktır. Yardımcı program [şebeke], yüklere yalnızca akü voltajı düşük seviyeli uyarı voltajına düştüğünde veya program 12'deki ayar noktası[na düştüğünde güç sağlar]. | Varsayılan: USb · 'Yardımcı program' ifadesi makine çevirisidir (İng. 'Utility' = şebeke). Çıkış kaynağı önceliği ayrıca günlük zamanlayıcı ile de ayarlanabilir (s.36-37). | s.22 |
| 02 | Maksimum şarj akımı: Güneş enerjisi ve yardımcı şarj cihazları için toplam şarj akımını yapılandırmak için. (Maks. şarj akımı = yardımcı [şebeke] şarj akımı + güneş şarj akımı) | 60A — 60A (varsayılan) | Varsayılan: 60A · Aralık: 6.5KW model için 10A ila 120A; 3.6KW / 7.2KW model için 10A ila 80A. Her tıklamanın artışı 10A'dır. | s.23 |
| 03 | AC giriş voltajı aralığı | APL — Aletler (varsayılan) [=Appliances]: Seçilirse, kabul edilebilir AC giriş voltajı aralığı 3.6KW / 7.2KW modeli için 90-280VAC ve 6.5KW modeli için 80-140VAC.UPS — UPS: Seçilirse, kabul edilebilir AC giriş voltajı aralığı 3,6KW / 7,2KW modeli için 170-280VAC arasında olacaktır ve 6.5KW modeli için 90-140VAC. | Varsayılan: APL | s.23 |
| 05 | Pil türü | AGn — AGM (varsayılan)FLd — Sular altında [=Flooded / sulu akü]USE — Kullanıcı Tanımlı: 'Kullanıcı Tanımlı' seçilirse, program 26, 27 ve 29'da akü şarj voltajı ve düşük DC kesme voltajı ayarlanabilir.PYL — Pylontech pil: Seçilirse, 02, 26, 27 ve 29'luk programlar otomatik olarak kurulacaktır. Daha fazla ayara gerek yok.WEC — WECO pil (sadece 48V model için): Seçilirse, 02, 12, 26, 27 ve 29 olacak pil tedarikçisi başına otomatik yapılandırma önerilir. Daha fazla ayarlamaya gerek yok.SOL — Soltaro pil (sadece 48V modeli için): Seçilirse, 02, 26, 27 ve 29'luk programlar otomatik olarak kurulacaktır. Daha fazla ayara gerek yok.LIb — LIb protokolü uyumlu pil: Lib protokolüyle uyumlu Lityum pil kullanıyorsanız 'LIb' seçeneğini seçin. Seçilirse, 02, 26, 27 ve 29'luk programlar otomatik olarak kurulacaktır. Daha fazla ayara gerek yok.LIC — 3. parti Lityum pil: Seçilirse, 02, 26, 27 ve 29'luk programlar otomatik olarak kurulacaktır. Daha fazla ayara gerek yok. Kurulum prosedürü için lütfen akü tedarikçisine başvurun. | Varsayılan: AGn · 'Sular altında' / 'Su Basmış' makine çevirisidir (Flooded = sulu akü). WECO ekran kodu 7 segmentte 'uEC' gibi görünür. | s.23-25 |
| 09 | Çıkış frekansı | 50 — 50Hz (3,6KW/7,2KW modeller için varsayılan)60 — 60Hz (6.5KW için varsayılan) | Varsayılan: 50Hz (3,6KW/7,2KW); 60Hz (6.5KW) | s.25 |
| 10 | Çıkış voltajı | 220 — 220V (3.6KW/7.2KW)230 — 230V (varsayılan, 3.6KW/7.2KW)240 — 240V (3.6KW/7.2KW)110 — 110V (6.5KW)120 — 120V (varsayılan, 6.5KW)127 — 127V (6.5KW) | Varsayılan: 230V (3.6KW/7.2KW); 120V (6.5KW) | s.25-26 |
| 11 | Maksimum yardımcı program [=şebeke] şarj akımı | UtI 30A — 30A (varsayılan) | Varsayılan: 30A · Aralık: Ayar aralığı 2A, daha sonra 6.5KW model için 10A'dan 120A'ya ve 3.6KW / 7.2KW model için 10A'dan 80A'ya. Her tıklamanın artışı 10A'dır. · Not: Program 02'deki ayar değeri 11'deki programdan daha küçükse, invertör yardımcı [şebeke] şarj cihazı [için] program 02'den şarj akımı uygulayacaktır. | s.26 |
| 12 | Program 01'de 'SBU' (SBU önceliği) seçildiğinde voltaj noktasının tekrar şebeke kaynağına ayarlanması. | 23.0 — 24V model: 23,0V (varsayılan)46 — 48V model: 46V (varsayılan) | Varsayılan: 24V model: 23,0V; 48V model: 46V · Aralık: 24V model: 22V ila 25,5V, her tıklama 0,5 V. 48V model: 44V ila 51V, her tıklama 1V. | s.26 |
| 13 | Program 01'de 'SBU' (SBU önceliği) seçildiğinde voltaj noktasının pil moduna geri ayarlanması. | FUL — Pil tam şarjlı27.0 — 24V model: 27V (varsayılan)54 — 48V model: 54V (varsayılan) | Varsayılan: 24V model: 27V; 48V model: 54V · Aralık: 24V model: 24V ila 31V, her tıklama 0,5 V. 48V model: 48V ila 62V, her tıklama 1V. | s.26-27 |
| 16 | Şarj cihazı kaynağı önceliği: Şarj cihazı kaynağı önceliğini yapılandırmak için | CSO — Önce güneş: Güneş enerjisi ilk öncelik olarak bataryayı şarj edecektir. Yardımcı program [şebeke], pili yalnızca güneş enerjisi mevcut olmadığında şarj edecektir.SNU — Güneş ve Kamu Hizmetleri (varsayılan) [=Güneş ve Şebeke]: Güneş enerjisi ve yardımcı program [şebeke] aynı anda pili şarj edecektir.OSO — Sadece Güneş: Güneş enerjisi, şebeke mevcut olsun ya da olmasın tek şarj kaynağı olacaktır. | Varsayılan: SNU · Bu invertör/şarj cihazı Hat, Bekleme veya Arıza modunda çalışıyorsa şarj cihazı kaynağı yukarıdaki gibi programlanabilir. Akü modunda çalışıyorsa yalnızca güneş enerjisi pili şarj edebilir; güneş enerjisi mevcut ve yeterli olduğunda pili şarj edecektir. A kılavuzunda 'Önce Şebeke' (CUt) seçeneği YOK. Şarj kaynağı önceliği ayrıca günlük zamanlayıcı ile de ayarlanabilir (s.37-38). | s.27 |
| 18 | Alarm kontrolü | bON — Alarm açık (varsayılan)bOF — Alarm kapalı | Varsayılan: bON | s.27 |
| 20 | Arka ışık kontrolü | LON — Arka ışık açık (varsayılan)LOF — Arka ışık kapalı | Varsayılan: LON | s.28 |
| 22 | Birincil kaynak kesintiye uğrarken bip sesleri | AON — Alarm açık (varsayılan)AOF — Alarm kapalı | Varsayılan: AON | s.28 |
| 23 | Aşırı yük atlama [=bypass]: Etkinleştirildiğinde, pil modunda aşırı yüklenme meydana gelirse ünite hat moduna aktarılır. | byd — Bypass devre dışı bırakma (varsayılan)byE — Bypass etkinleştirme | Varsayılan: byd | s.28 |
| 25 | Kayıt Hatası kodu [=Hata kodunu kaydet] | FEN — Kayıt etkinleştirme (varsayılan)FdS — Kayıt devre dışı bırakma | Varsayılan: FEN · C kılavuzunda aynı programın varsayılanı 'Kayıt devre dışı' (FdS) olarak yazıyor. | s.28 |
| 26 | Toplu şarj voltajı (C.V voltajı) [=Bulk] | CV 28.2 — 24V model varsayılanı: 28,2VCV 56.4 — 48V model varsayılanı: 56,4V | Varsayılan: 24V: 28,2V; 48V: 56,4V · Aralık: 24V model için 25.0V ila 31.0V; 48V model için 48.0V ila 62.0V. Her tıklamanın artışı 0,1 V'dir. · Program 5'te kendi kendini tanımlayan [=Kullanıcı Tanımlı/USE] seçilirse, bu program ayarlanabilir. | s.29 |
| 27 | Yüzer şarj voltajı [=Float] | FLv 27.0 — 24V model varsayılanı: 27,0VFLv 54.0 — 48V model varsayılanı: 54,0V | Varsayılan: 24V: 27,0V; 48V: 54,0V · Aralık: 24V model için 25.0V ila 31.0V; 48V model için 48.0V ila 62.0V. Her tıklamanın artışı 0,1 V'dir. · Program 5'te kendi kendini tanımlayan [=Kullanıcı Tanımlı/USE] seçilirse, bu program ayarlanabilir. | s.29 |
| 28 | AC çıkış modu (sadece 6.5KW / 7.2KW modeli için) *Bu ayar yalnızca invertör bekleme modundayken kullanılabilir (Kapat). | SIG — Tekli: Bu invertör tek fazlı uygulamada kullanılır. (Ek I: Ünite tek başına çalıştırıldığında program 28'de 'SIG' seçin.)PAL — Paralel: Bu invertör paralel sistemde çalıştırılır. (Ek I: Üniteler tek fazlı uygulama için paralel kullanıldığında 'PAL' seçin.)3P1 — L1 fazı (3 fazlı uygulama)3P2 — L2 fazı (3 fazlı uygulama)3P3 — L3 fazı (3 fazlı uygulama)2P1 — Bölünmüş faz için L12P2 (120) — Bölünmüş faz için L2 (120° faz farkı)2P2 (180) — Bölünmüş faz için L2 (180° faz farkı) | Ek I (s.69-70): 3 fazlı uygulamada her invertörü tanımlamak için '3PX' seçin; üç fazlı ekipmanı desteklemek için en az 3, en fazla 6 invertör gerekir; her fazda en az bir invertör, bir fazda en çok dört invertör. L1 fazına bağlı invertörlerde '3P1', L2'de '3P2', L3'te '3P3'. Bölünmüş faz ('2PX') yalnızca 6.5KW: en az 2, en fazla 6 invertör; bir fazda en fazla üç invertör (s.57 girişinde '5 ünite maksimum bir fazı destekler' yazıyor – çelişki). Paylaşımlı akım kablosunu aynı fazdaki birimlere bağlayın; farklı fazlardaki birimler arasında BAĞLAMAYIN. Açma/kapama düğmesi 'KAPALI' olmalı; aksi halde ayar programlanamaz. Varsayılan belirtilmemiş. | s.29-30 (ayrıca Ek I: 69-70) |
| 29 | Düşük DC kesme voltajı: • Akü gücü yalnızca güç kaynağı mevcutsa, invertör kapanır. • PV enerjisi ve akü gücü varsa, invertör AC çıkışı olmadan aküyü şarj edecektir. • PV enerjisi, akü gücü ve şebeke mevcutsa, invertör hat moduna geçecek ve yüklere çıkış gücü sağlayacaktır. | COv 22.0 — 24V model varsayılanı: 22,0VCOv 44.0 — 48V model varsayılanı: 44,0V | Varsayılan: 24V: 22,0V; 48V: 44,0V · Aralık: 24V model için 21.0V ila 24.0V; 48V model için 42.0V ila 48.0V. Her tıklamanın artışı 0,1 V'dir. · Program 5'te kendi kendini tanımlayan [=Kullanıcı Tanımlı/USE] seçilirse, bu program ayarlanabilir. Düşük DC kesme voltajı, bağlı yük yüzdesi ne olursa olsun ayar değerine sabitlenecektir. | s.30 |
| 30 | Pil dengeleme [=akü eşitleme] | EEN — Pil dengeleme [etkin]EdS — Pil eşitlemeyi devre dışı bırakma (varsayılan) | Varsayılan: EdS · Program 05'te 'Su Basmış' [=Sulu/FLd] veya 'Kullanıcı Tanımlı' seçiliyse, program kurulabilir. | s.30 |
| 33 | Pil eşitleme süresi | 60 — 60 dk (varsayılan) | Varsayılan: 60 dk · Aralık: 5 dakika ile 900 dakika; her tıklama 5 dakika. | s.31 |
| 34 | Pil eşitlenmiş zaman aşımı | 120 — 120 dk (varsayılan) | Varsayılan: 120 dk · Aralık: 5 dakika ile 900 dakika; her tıklama 5 dakika. | s.31 |
| 35 | Eşitleme aralığı | 30d — 30 gün (varsayılan) | Varsayılan: 30 gün · Aralık: 0 ile 90 gün; her tıklama 1 gün. | s.31 |
| 36 | Ekolayzır hemen etkinleştirilir [=Eşitlemeyi hemen etkinleştir] | AEN — EtkinleştirmekAdS — Devre dışı bırak (varsayılan) | Varsayılan: AdS · Program 30'da eşitleme işlevi etkinleştirilmişse, bu program ayarlanabilir. 'Etkinleştir' seçilirse pil eşitleme hemen etkinleşir ve LCD ana sayfasında 'Eq' gösterilir. 'Devre Dışı Bırak' seçilirse, program 35 ayarına bağlı bir sonraki eşitleme zamanı gelene kadar eşitleme işlevini iptal eder; bu sırada LCD ana sayfasında 'Eq' gösterilmez. | s.31 |
| 41 | Maksimum deşarj akımı (sadece 6.5KW / 7.2KW modeli için) | ddS — Devre Dışı Bırak (Varsayılan): Seçilirse, pil deşarj koruması devre dışı bırakılır.30 — 30A150 — 150A | Varsayılan: ddS · Aralık: 30 A ile 150 A · Boşaltma akımı ayar değerinden yüksekse, pilin boşalması durur. Şu anda [=bu durumda], yardımcı program [şebeke] mevcutsa, invertör bypass modunda çalışacaktır. Herhangi bir yardımcı program [şebeke] yoksa, invertör akü modunda 5 dakikalık çalışmadan sonra kapanacaktır. | s.31-32 |
| 51 | RGB LED için Açma/Kapama kontrolü *RGB LED aydınlatma işlevini etkinleştirmek için bu ayarın etkinleştirilmesi gerekir. | LEN — Etkin (varsayılan)LdS — Devre dışı bırakmak | Varsayılan: LEN | s.32 |
| 52 | RGB LED'in parlaklığı | LO — AlçakNOr — Normal (varsayılan)HI — Yüksek | Varsayılan: NOr | s.32 |
| 53 | RGB LED'in aydınlatma hızı | LO — AlçakNOr — Normal (varsayılan)HI — Yüksek | Varsayılan: NOr | s.32 |
| 54 | RGB LED efektleri | SCr — KaydırmabrE — NefesSOL — Katı açık (Varsayılan) [=sürekli açık] | Varsayılan: SOL | s.33 |
| 55 | Enerji kaynağını ve pil şarj/deşarj durumunu göstermek için RGB LED'in renk kombinasyonu: • Izgara[=Şebeke]-PV-Akü • Pil şarj/deşarj durumu | C01 — C01 (Varsayılan): Menekşe-Beyaz-Gök mavisi ; Pembe-BalC02 — C02: Beyaz-Sarı-Yeşil ; Kraliyet mavisi-Kireç sarısı | Varsayılan: C01 | s.34 |
| 92 | 12V DC çıkış için Açma/Kapama kontrolü | dCE — Etkinleştir (varsayılan)dCd — Devre dışı bırakmak | Varsayılan: dCE | s.34 |
| 94 | Veri günlüğü kaydedilen aralık *Maksimum veri günlüğü numarası 1440'tır. 1440'ın üzerindeyse, ilk günlüğü yeniden yazar. | 3 — 3 dakika5 — 5 dakika10 — 10 dakika (varsayılan)20 — 20 dakika30 — 30 dakika60 — 60 dakika | Varsayılan: 10 dakika | s.34 |
| 95 | Zaman ayarı – Dakika | nIN — Dakika | Aralık: 0 ile 59 | s.34 |
| 96 | Zaman ayarı – Saat | HOU — Saat | Aralık: 0 ile 23 | s.35 |
| 97 | Zaman ayarı – Gün | dAY — Gün | Aralık: 1 ile 31 | s.35 |
| 98 | Zaman ayarı – Ay | nON — Ay | Aralık: 1 ile 12 | s.35 |
| 99 | Zaman ayarı – Yıl | YEA — Yıl | Aralık: 17 ila 99 | s.35 |

## MEXX-P12KW (kılavuz V1.1): program tablosu

Kaynak: MEXX-P12KW Tam Sinüs Akıllı Inverter Kullanım Kılavuzu (Off-Grid İnverter V1.1) — işletmenin sağladığı kullanım kılavuzu. Kılavuzda okunamayan ya da kendi içinde çelişen satırlar bu tabloya alınmamıştır.

| No | Ayar | Seçenekler (ekran kodu) | Varsayılan / aralık / not | Sayfa |
| --- | --- | --- | --- | --- |
| Çalışma Modu / 1 | Güç kaynak önceliği | SOL — PV güç öncelik modunu gösterir.UTI — Şebeke öncelikli modunu gösterir. Şebeke girişi olmadığında yalnızca akü güç kaynağına geçer.SBU — İnverter güç önceliği modunu gösterir. Akü voltajı ayarlanan voltajdan düşük olduğunda şebekeye geçer; akü tamamen şarj olduğunda veya ayarlanan değere ulaştığında tekrar aküye geçer. | Varsayılan metinde belirtilmemiş (ekran görüntüsünde SOL seçili). Mod açıklamaları için bkz. “Şebeke bağlıyken” sekmesi (Bölüm 3.1, s.23-25). | s.40 |
| Çalışma Modu / 2 | Şarj kaynak önceliği | CSO — PV öncelikli şarj: Şebeke, yalnızca PV gücü mevcut değilse şarj için kullanılır.SNU — PV ve şebeke gücünün şarjı: PV güç şarjı PV enerjisi yetersiz olduğunda, şebeke gücüyle birlikte takviye olarak tercih edilir. PV enerjisi yeterli olduğunda, şebeke şarjı durur. Not: Yalnızca şebeke bypass çıkışı yüklendiğinde, PV ve şebeke şarjı aynı anda uygulanabilir. İnvertör çalışırken, PV gücü aküyü şarj etmek için kullanılır.OSO — Sadece PV şarjı, şebeke kullanılmaz. | Varsayılan metinde belirtilmemiş (ekran görüntüsünde CSO seçili). | s.40 |
| Çalışma Modu / 3 | CT Seçeneği | Etkinleştir — Harici bir CT bağlanması gerekir ve kablodaki akım harici CT tarafından ölçülür.Devre dışı — Cihazın yerleşik sensörleri kullanılarak akım ölçülür. | Ekran görüntüsünde 'Devre Dışı' seçili. Ürün görünümünde (s.6): 'CT bağlantı portu (2000'e 1 Oranı)'. | s.40 |
| Çalışma Modu / 4 | Şebeke Besleme etkinleştirme (ekranda: 'Şebekeye Besleme Etkinleştirme') | Devre Dışı Bırak — Fonksiyonu kapatmaEtkinleştirme — Giriş gücü önceliği şebeke önceliği modunda olduğunda, invertör şebekeye güç sağlamak üzere etkinleştirilir ve ters çevirme işleminden sonra fazla fotovoltaik enerji şebekeye beslenebilir. Bu öğenin ayarlanmasına izin vermek için parola (618) doğrulaması gerekir. | Ekran görüntüsünde 'Devre Dışı' seçili. | s.40 |
| Çalışma Modu / 5 | Maksimum Şebeke Besleme Gücü (ekranda: 'Maks. Şebekeye Besleme Gücü (kW)') | — | Aralık: 0- 12 kW · İzin Verilen Maksimum Besleme Gücünü Ayarla. Ekran görüntüsünde değer 12. | s.40 |
| Genel Ayarlar / 1 | Açma/Kapatma Ayarları | KAPALI — Bekleme modu.AÇIK — Normal çalışma modu. | Ekran görüntüsünde 'KAPAT'. | s.41 |
| Genel Ayarlar / 2 | Enerji tasarrufu modu | Devre dışı bırak — Enerji tasarrufu modu devre dışı.Etkinleştir — Mod etkinleştirildikten sonra, invertör çıkış yükü boşsa veya 50W'tan azsa, invertör çıkışı bir süre geciktirildikten sonra çıkışı kapatır. Yük 50W'tan fazla olduğunda, invertör otomatik olarak başlar. | — | s.41 |
| Genel Ayarlar / 3 | Aşırı Yük Otomatik Yeniden Başlatma | Devre Dışı Bırak — Aşırı yük durumunda çıkış kapanır ve cihaz yeniden başlamaz.Etkinleştir — Aşırı yük otomatik yeniden başlatma etkinleştirildiğinde, aşırı yük oluşursa, çıkışı kapatır ve ilk geri yükleme 30 saniye, ikinci geri yükleme 30 saniye ve üçüncü geri yükleme 1 saat sürer. | — | s.41 |
| Genel Ayarlar / 4 | Aşırı sıcaklık yeniden başlatma | Devre Dışı Bırak — Aşırı sıcaklık otomatik yeniden başlatma devre dışı olduğunda, aşırı sıcaklık meydana gelirse, çıkış kapanır ve invertör çıkışı yeniden başlatılmayacaktır.Etkinleştir — Aşırı sıcaklık otomatik yeniden başlatma etkinleştirildiğinde, aşırı sıcaklık meydana gelirse, çıkış kapanır ve sıcaklık düştükten sonra AC invertör çıkışı yeniden başlatılacaktır. | — | s.42 |
| Genel Ayarlar / 5 | Uyarı sesi | Devre dışı bırak — Buzzer alarmı kapalı, sessiz modda.Etkinleştir — Buzzer alarmı etkinleştirilir. | — | s.42 |
| Genel Ayarlar / 6 | Bluetooth | Devre Dışı Bırak — Bluetooth kapalı.Etkinleştir — Bluetooth açık. (Varsayılan) | Varsayılan: Etkinleştir | s.42 |
| Genel Ayarlar / 7 | Diller | — | Sistem dili ayarlanır. | s.42 |
| Akü Ayarları / 1 | Akü tipi ayarları | Kurşun-asit — Kurşun-asit akü.Lityum — Lityum akü. (Varsayılan)Lityum İletişimsiz — BMS iletişimi olmayan lityum piller. | Varsayılan: Lityum · Ekran görüntüsünde 'Kurşun Asit' seçili. | s.43 |
| Akü Ayarları / 2 | Maksimum şarj akımı (ekranda: 'Maksimum Akü Şarj Akımı (A)') | — | Varsayılan: 60A · Aralık: 1~ 250 A · Akünün varsayılan maksimum şarj akımı 60A olup, ayar aralığı 1~250 A'dir. | s.43 |
| Akü Ayarları (Kurşun Asit) (2/3) / 2 | Akü şarj CV voltajı | — | Varsayılan: 56,8V · Aralık: 48~59,2 V · Akü tipinin USE ve lityum akü olması durumunda geçerlidir. | s.44 |
| Akü Ayarları (Kurşun Asit) (2/3) / 4 | Float şarj voltajı | — | Varsayılan: 55,2 V · Aralık: 48~58,4 V · Kılavuz 'yüzdürme şarj voltajı' ifadesini kullanıyor. | s.44 |
| Akü Ayarları (Kurşun Asit) (2/3) / 5 | Akü düşük voltaj alarm eşiği | — | Varsayılan: 44V · Aralık: 40-50 V · Yük, nominal gücün %50'sinden az olduğunda, akü voltajı bu eşiğin altına düşerse, düşük voltaj alarmı tetiklenir. Yük, nominal gücün %50'sini aştığında, düşük voltaj alarm noktası ayarlanan değerden 2 V düşükse, invertör çıkışı kapatılmaz. | s.44 |
| Akü Ayarları (Kurşun Asit) (3/3) / 1 | Düşük Voltaj Koruması Yeniden Başlama (V) | — | Varsayılan: 52V · Aralık: 50~58 V · Düşük voltajlı bağlantı kesilmesi durumunda akü voltajı için kurtarma eşiği. İnverter çıkışı, akünün düşük voltajı nedeniyle kesildiğinde, akü voltajı bu ayar değerinden yüksek olduğunda invertör AC çıkışı kurtarılabilir. | s.45 |
| Akü Ayarları (Kurşun Asit) (3/3) / 2 | Akü Şarjı Yeniden Başlama Voltajı (V) | — | Varsayılan: 52 V · Aralık: 50~56 V · Akü tamamen şarj olduktan sonra, invertör şarj cihazı durur ve akü şarjı bu voltaj değerinden düşük olduğunda yeniden başlar. | s.45 |
| Akü Ayarları (Kurşun Asit) (3/3) / 3 | Akü Düşük Voltaj Kapatma Voltajı (V) | — | Varsayılan: 40V · Aralık: 40~48V · Akü voltajı eşik değerinin altına düştüğünde invertör çıkışı kapatır. Akü tipinin USE ve lityum akü olması durumunda geçerlidir. | s.45 |
| Akü Ayarları (Kurşun Asit) (3/3) / 4 | Aküden Şebekeye Geçiş Voltajı (V) | — | Varsayılan: 46 V · Aralık: 44 V~52 V · Güç kaynağı önceliği SBU ise, akü voltajı ayarlanan değerden düşük olduğunda çıkış invertörden şebeke beslemesine aktarılır. Bu ayar öğesi yalnızca kurşun asitli aküler için geçerlidir. BMS lityum akü ayarları için lütfen Şebekede deşarj bölümüne bakın. | s.45 |
| Akü Ayarları (Kurşun Asit) (3/3) / 5 | Şebekeden Aküye Geçiş Voltajı (V) | — | Varsayılan: 54V · Aralık: 48~58V · Güç kaynağı önceliği SBU ise, akü voltajı ayarlanan değerden yüksek olduğunda çıkış şebekeden invertör güç kaynağına aktarılır. Bu ayar öğesi yalnızca kurşun asitli aküler için geçerlidir. BMS lityum akü ayarları için lütfen Şebeke İçi Deşarj Sonu Kurtarma SOC'sine bakın. | s.45 |
| Akü Ayarları (Lityum) (2/3) / 1 | BMS Haberleşme Modu | Etkin değil — BMS iletişimini seçilmez. (ekranda: 'Devre Dışı')CAN — BMS iletişimi olarak CAN'ı seçin. (Varsayılan)485 — BMS iletişimi olarak RS485'i seçin. | Varsayılan: CAN · Ekran görüntüsünde 'Devre Dışı' seçili. | s.46 |
| Akü Ayarları (Lityum) (2/3) / 2 | BMS Haberleşme Protokolü | PYLON — PYLON=PYLONTECH (Varsayılan) | Varsayılan: PYLON · İletişim gereksinimlerine (CAN veya 485) göre uygun lityum akü üreticisini/markasını seçmek gerekir. Kılavuzda PYLON dışında protokol listelenmemiş. | s.46 |
| Akü Ayarları (Lityum) (2/3) / 3 | Şebeke içi deşarj kesme SOC (ekranda: 'Şebeke var iken deşarj durdurma SOC (%)') | — | Varsayılan: 50 · Aralık: 10~90 · Şebeke ve akü kullanımda akü ömrünü uzatmak için aküden deşarjı durdurma SOC ayarıdır. Sadece BMS haberleşmeli lityum bataryalar için geçerlidir. | s.46 |
| Akü Ayarları (Lityum) (2/3) / 4 | Şebeke var iken deşarj yeniden başlama SOC (%) (ekranda: 'On-Grid Deşarj Yeniden Başlatma SOC (%)') | — | Varsayılan: 90 · Aralık: 20~100 · Lityum akü bu değere kadar şarj olduktan sonra yeniden deşarj olmaya başlar. Sadece BMS haberleşme lityum bataryaları için geçerlidir. | s.46 |
| Akü Ayarları (Lityum) (3/3) / 1 | Şebeke yok iken deşarj yeniden başlama SOC (%) | — | Varsayılan: 30 · Aralık: 10~100 · Deşarjı durdurulan akü bu değere kadar şarj olduktan sonra yeniden deşarj başlar. Sadece BMS haberleşmeli lityum akülerde geçerlidir. | s.47 |
| Akü Ayarları (Lityum) (3/3) / 2 | Şarj kesme SOC | — | Varsayılan: 100 · Lityum akü şarj sırasında ayarlanan SOC değerine ulaştığında şarj işlemi durur ve sadece BMS haberleşmeli lityum pil için etkilidir. Ayar aralığı belirtilmemiş. | s.47 |
| Şebeke ayarları / 1 | AC Modu (ekranda: 'AC Giriş Modu') | APL — 230V cihaz için geniş şebeke giriş voltaj aralığı: 90~280VAC, ev aletleri için uygundur.UPS — 230V cihaz için dar şebeke giriş voltaj aralığı: 170~265VAC, bilgisayarlar vb. için geçerlidir. (Varsayılan) | Varsayılan: UPS · Menüye 'Genel Ayarları' adlı düğmeden girilir (Sistem Ayarları ekranında hem 'Genel Ayarlar' hem 'Genel Ayarları' düğmesi var). | s.48 |
| Şebeke ayarları / 2 | Şebeke yok iken çıkış frekansı | 50HZ — 50HZ (Varsayılan)60HZ — 60HZ | Varsayılan: 50HZ · Baypas uyarlamalı işlevi: şebeke olduğunda, ilk şebekeye bağlanma frekansına otomatik olarak uyum sağlar; şebeke olmadığında, çıkış frekansı menüden ayarlanabilir ve 230V AC invertörün varsayılan çıkışı 50 Hz'dir. | s.48 |
| Jeneratör Arayüzü / 2 | Jeneratör giriş gücü ayarı (kW) | — | Varsayılan: 12 · Aralık: 1 - 13kw, 1kw'lik adım · Jeneratörün maksimum giriş gücünü ayarlayın. | s.49 |
| Jeneratör Arayüzü / 3 | Kritik olmayan yük bağlantısının kesilmesi BAT SOC (%) (ekranda: 'Kritik olmayan yük kesme akü SOC (%)') | — | Varsayılan: 50 · Aralık: 10~100 · Varsayılan kritik olmayan yük bağlantı kesme akü SOC'si %50'dir. | s.49 |
| Jeneratör Arayüzü / 4 | Kritik olmayan yük kesme bat volt (ekranda: 'Kritik olmayan yük kesme akü voltajı (V)') | — | Varsayılan: 46V · Aralık: 42~54 V · Varsayılan kritik olmayan yük kesme akü voltajı 46 V'dur. | s.49 |
| Jeneratör Arayüzü / 5 | Kritik olmayan yük periyot ayarları | Zaman1 — Kritik olmayan yük operasyonu bu zaman dilimi içerisinde planlanabilir.Zaman2 — Yukarıdakiyle aynıZaman3 — Yukarıdakiyle aynı | Etkinleştirildiğinde, zaman ayarı sayfasına yönlendirileceksiniz. Sol taraf açma zamanı ayarı, sağ taraf ise kapatma zamanı ayarıdır. | s.49-50 |
| Gelişmiş Ayarlar / 1 | Paralel mod seçimi | SIG — Cihazın tek başına kullanımına yönelik ayarla. (Varsayılan)PAL — Cihazın tek fazlı paralel kullanımına yönelik ayar.3P1/3P2/3P3 — Üç fazlı paralel kullanım için ayar. | Varsayılan: SIG · P1'e bağlı tüm makine ekranları "3P1", P2'ye bağlı tüm makine ekranları "3P2", P3'e bağlı tüm makine ekranları "3P3" olarak ayarlanmalıdır. Çıkış voltajı 230V AC varsayılırsa (P1-P2, P1-P3, P2-P3) arasındaki gerilim fazları 120 derece farklıdır; L1-L2, L1-L3, L2-L3 arası 230*1,732=398V AC; L1-N, L2-N, L3-N arası 230V AC. | s.18, 51 |
| Gelişmiş Ayarlar / 2 | Cihaz haberleşme adresi | — | Varsayılan: 0 · Aralık: 0~9 · Cihazın paralel modda ise bu adres ayarlanmalıdır. | s.18, 51 |
| Gelişmiş Ayarlar / 3 | Cihazın paralel sistem rolü | MAS — Ana inverter olarak mevcut cihazı seçilir. Paralel mod ayarı 3P1 ise, bu öğe otomatik olarak ana bilgisayar tipi olarak seçilecektir. Paralel mod ayarı 3P2 veya 3P3 ise, bu öğe ana ünite olarak ayarlanamaz, varsayılan olarak slave ünite olarak ayarlanır. (Varsayılan)SAL — Geçerli cihazı slave olarak seçin. | Varsayılan: MAS | s.18, 51 |
| Gelişmiş Ayarlar / 4 | Fabrika ayarlarına sıfırlama | Sıfırla — Bu seçeneği ayarladıktan sonra, doğrulama için bir parola (618) girmeniz gerekir. Doğrulama tamamlandıktan sonra, sistem ayar parametreleri fabrika varsayılan değerlerine geri yüklenecektir. Geri yükleme tamamlandıktan sonra sistem yeniden başlatılacaktır. | — | s.18, 51 |

## 1–5 kVA akıllı inverter: program tablosu

Kaynak: 1KVA-5KVA Inverter / Charger — Akıllı İnvertör Kullanım Klavuzu — işletmenin sağladığı kullanım kılavuzu. Kılavuzda okunamayan ya da kendi içinde çelişen satırlar bu tabloya alınmamıştır.

| No | Ayar | Seçenekler (ekran kodu) | Varsayılan / aralık / not | Sayfa |
| --- | --- | --- | --- | --- |
| 00 | Ayar modundan çıkma | ESC — Escape | — | s.17 |
| 01 | Çıkış kaynağı önceliği : Yük güç kaynağı önceliğini yapılandırmak için | SOL — Önce Güneş: Öncelik olarak güneş yükleri besler. Eğer güneş tüm bağlı yükleri beslemek için yeterli enerjiye sahip değil ise, aynı zamanda aküde yüklere enerji verir. Şebeke sadece aşağıdaki durumlarda yükleri besler: -Güneş enerjisi yoksa -Akü voltajı, uyarı voltaj seviyesi düştüğü zamanUtI — Önce Şebeke (varsayılan): Öncelik olarak şebeke yükleri besler. Güneş ve akü sadece, şebekenin mevcut olmadığı zamanlarda yükleri besler.SbU — Güneş, Akü, Şebeke önceliği: Öncelik olarak güneş yükleri besler. Eğer güneş tüm bağlı yükleri beslemek için yeterli enerjiye sahip değil ise, aynı zamanda aküde yüklere enerji verir. Şebeke sadece, akü voltajı uyarı voltajı seviyesine düştüğü zaman yada 12 inci programdaki ayar noktasına düştüğü zaman yükleri besler. | Varsayılan: UtI | s.17 |
| 02 | Maksimum şarj akımı: Güneş ve şebeke şarjları için toplam şarj akımını yapılandırmak (Max. şarj akımı = şebeke şarj akımı + güneş şarj akımı) | 10A — 10A (Sadece 1K modeli için uygun)20A — 20A30A — 30A40A — 40A50A — 50A (Standart)60A — 60A (4K/5K)70A — 70A (4K/5K)80A — 80A (4K/5K)90A — 90A (4K/5K)100A — 100A (4K/5K)110A — 110A (4K/5K) | Varsayılan: 1K/2K/3K: 50A (Standart). 4K/5K için ayar tablosunda varsayılan işaretlenmemiş; teknik özellikler tablosunda (s.36) 'Varsayılan Şarj Akımı' 4KVA/5KVA için 110 Amp. · Aralık: Sadece 1K/2K/3K modelleri için: 10A (yalnız 1K), 20A, 30A, 40A, 50A. 4K/5K modeli için: 60A, 70A, 80A, 90A, 100A, 110A. | s.17-18 |
| 03 | AC giriş voltaj aralığı | APL — Appliances (varsayılan): Şebeke Voltaj aralığı 90-280VAC. Aralığında ise seçilebilinir.UPS — UPS: Eğer seçilmiş ise Şebeke voltajı 170-280VAC aralığında olmalıdır. | Varsayılan: APL | s.18 |
| 04 | Güç tasarrufu modu | SdS — Tasarruf devredışı (varsayılan): Eğer seçilmemiş ise yük ne olursa olsun tasarruf moduna geçmez.SEN — Tasarruf devrede: Yük çok düşük veya yok ise tasarruf moduna geçer. | Varsayılan: SdS | s.18-19 |
| 05 | Akü tipi | AGn — AGM Kuru- (varsayılan)FLd — SuluUSE — Kullanıcı-tanımlı (Sadece 4K/5K modelleri için uygun): Eğer 'kullanıcı tanımlı' seçilirse, akü şarj voltajı ve düşük DC kapanma voltajı program 26, 27 ve 29 da set up edilebilir. | Varsayılan: AGn · Lityum seçeneği yok. | s.19 |
| 09 | Çıkış frekansı | 50 — 50Hz (varsayılan)60 — 60Hz | Varsayılan: 50Hz | s.19 |
| 11 | Maksimum şebeke şarj akımı | 10A — 1K: 10A20A — 1K: 20A (varsayılan)20A — 2K/3K: 20A30A — 2K/3K: 30A (varsayılan)2A — 4K/5K: 2A10A — 4K/5K: 10A20A — 4K/5K: 20A30A — 4K/5K: 30A (varsayılan)40A — 4K/5K: 40A50A — 4K/5K: 50A60A — 4K/5K: 60A | Varsayılan: 1K: 20A; 2K/3K: 30A; 4K/5K: 30A · Aralık: 1K: 10A, 20A. 2K/3K: 20A, 30A. 4K/5K: 2A, 10A, 20A, 30A, 40A, 50A, 60A. · Not: Eğer program (02) deki ayar değeri bu programdaki (11) değerden küçük ise, inverter şebeke şarjı için program(2) deki şarj akımını sürdürür. | s.19-20 |
| 12 | SBU (01) modunda iken Şebeke ile şarja geçmeden önceki akü voltajı set değeri | 11.0…12.8 — 1K: 11.0V, 11.3V, 11.5V (varsayılan), 11.8V, 12.0V, 12.3V, 12.5V, 12.8V22.0…25.5 — 2K/3K: 22.0V, 22.5V, 23.0V (varsayılan), 23.5V, 24.0V, 24.5V, 25.0V, 25.5V44…51 — 4K/5K: 44V, 45V, 46V (varsayılan), 47V, 48V, 49V, 50V, 51V | Varsayılan: 1K: 11.5V; 2K/3K: 23.0V; 4K/5K: 46V · Aralık: 1K: 11.0–12.8V; 2K/3K: 22.0–25.5V; 4K/5K: 44–51V (yalnız listelenen değerler) | s.20-21 |
| 13 | Program 01 de öncelik olarak solar yada SBU seçildiğinde batarya modunda geri voltaj noktasını ayarlama | FUL — Batarya full şarjda (her model grubunda mevcut)12.0…14.5 — 1K: 12.0V, 12.3V, 12.5V, 12.8V, 13.0V, 13.3V, 13.5V (varsayılan), 13.8V, 14.0V, 14.3V, 14.5V24.0…29.0 — 2K/3K: 24V, 24.5V, 25V, 25.5V, 26V, 26.5V, 27V (varsayılan), 27.5V, 28V, 28.5V, 29V48.0…58.0 — 4K/5K: 48V, 49V, 50V, 51V, 52V, 53V, 54V (varsayılan), 55V, 56V, 57V, 58V | Varsayılan: 1K: 13.5V; 2K/3K: 27V; 4K/5K: 54V · Aralık: FUL veya 1K: 12.0–14.5V; 2K/3K: 24–29V; 4K/5K: 48–58V (yalnız listelenen değerler) | s.22-23 |
| 16 | Şarj kaynağı önceliği : Şarj kaynağı önceliğini yapılandırmak için | CSO — Önce Güneş: Öncelik olarak güneş enerjisi aküyü şarj edecek. Şebeke sadece, güneş enerjisi yeterli olmadığı zaman aküyü şarj edecek.CUt — Önce Şebeke: Öncelik olarak şebeke aküyü şarj edecek. Güneş enerjisi sadece, şebeke olmadığı zaman aküyü şarj edecek.SNU — Güneş ve Şebeke (varsayılan): Güneş enerjisi ve şebeke aküyü aynı anda şarj edecek.OSO — Sadece Güneş: Şebeke olsun yada olmasın şarj kaynağı sadece güneş enerjisi olacak. | Varsayılan: SNU · Eğer bu inverter şebeke, bekleme yada hata modunda çalışıyorsa, şarj kaynağı yukarıdaki gibi programlanabilir. Eğer bu inverter akü modunda yada güç tasarrufu modunda çalışıyorsa, sadece güneş enerjisi aküyü şarj edebilir. Güneş enerjisi mevcut ve yeterli ise aküyü şarj eder. | s.24 |
| 18 | Alarm kontrol | bON — Alarm açık (varsayılan)bOF — Alarm kapalı | Varsayılan: bON | s.24 |
| 20 | Arka ışık kontrol | LON — Arka ışık açık (varsayılan)LOF — Arka ışık kapalı | Varsayılan: LON | s.24 |
| 22 | Birincil kaynak kesildiğinde bip sesi | AON — Alarm açık (varsayılan)AOF — Alarm kapalı | Varsayılan: AON | s.25 |
| 23 | Aşırı yük geçişi : Devreye alındığı zaman, eğer akü modunda aşırı yüklenme gerçekleşirse cihaz şebeke moduna aktarılır. | byd — Geçiş devre dışı (varsayılan)byE — Geçiş devrede | Varsayılan: byd | s.25 |
| 25 | Hata kodu kaydetme | FEN — Kayıt devredeFdS — Kayıt devre dışı (varsayılan) | Varsayılan: FdS · A kılavuzunda aynı programın varsayılanı 'Kayıt etkinleştirme' (FEN) olarak yazıyor. | s.25 |
| 31 | Solar Güç Dengesi: Etkinleştirildiğinde, solar giriş gücü bağlı yük gücüne göre otomatik olarak ayarlanacaktır. (Sadece 4KVA/5KVA için mümkün) | SbE — Solar güç dengesi etkin (varsayılan): Eğer seçilirse, solar giriş gücü otamatik olarak aşağıdaki formulü takip edecektir. Max. Giriş solar gücü = max. Batarya şarj gücü + bağlı yük gücü.Sbd — Solar güç dengesi etkin değil: Eğer seçilirse, bağlı yük gücü ne kadar olursa olsun batarya şarj gücü solar giriş gücü ile aynı olacaktır. Max. Batarya şarj gücü için program 02 baz alınabilir. (Max. Solar gücü = Max. Batarya şarj gücü) | Varsayılan: SbE | s.27 |

## Sık sorulan sorular

### “Önce güneş” seçilince güneş yetmezse şebeke mi akü mü devreye girer?

Kılavuza göre değişir. 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5) kılavuzunda: “SUb — Önce güneş: güneş yükleri birinci öncelikle besler; yetmezse ŞEBEKE aynı anda yükleri besler.” 1–5 kVA akıllı inverter kılavuzunda: “SOL — Önce Güneş: güneş öncelikli; yetmezse aynı zamanda AKÜ de besler; şebeke yalnızca güneş yoksa veya akü voltajı uyarı voltaj seviyesine düşünce besler.” Aynı ad, iki cihazda farklı davranış anlamına gelir; ayarı kendi kılavuzunuza göre seçin.

### Şebekeye dönüş ve aküye dönüş noktası ne demek?

SBU önceliğinde akü belirli bir seviyeye düşünce cihaz şebekeye, akü yeniden dolunca aküye döner. 3,6 / 6,5 / 7,2 kW akıllı inverter (kılavuz Sürüm 1.5) kılavuzu: SBU seçiliyken şebeke kaynağına geri dönüş voltaj noktası. 24V: 22–25,5V (vars. 23,0V, adım 0,5V); 48V: 44–51V (vars. 46V, adım 1V). SBU seçiliyken pil moduna geri dönüş voltaj noktası. 24V: 'Pil tam şarjlı' (FUL) veya 24–31V (vars. 27V, adım 0,5V); 48V: FUL veya 48–62V (vars. 54V, adım 1V).

### Bu ayarlar başka marka invertere uygulanabilir mi?

Hayır. Program numaraları, seçenek kodları ve davranışlar markadan markaya değişir; buradaki satırlar yalnız adı yazan kılavuzlar içindir. Akü şarj gerilimi gibi değerlerde akü üreticisinin değeri esastır.

Arıza devam ederse cihazı kapatın ve yetkili servise ya da satıcıya başvurun; cihazın içine yalnız yetkili kişi müdahale eder.

*Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.*

Yayın: 24 Kasım 2026 · GESPA Enerji · [Tüm hesaplama araçları](https://www.gespaenerji.com/elektrikci-cantasi.html)

## Malzeme listenizi yazın, fiyatını çıkaralım

Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp'tan isteyin.

[WhatsApp'tan yazın](https://wa.me/905437434209)

---
Kaynak sayfa: https://www.gespaenerji.com/off-grid-inverter-sebeke-ayarlari.html · GESPA Enerji · 0543 743 42 09 · info@gespaenerji.com · Örnek Mah. 1551 Sok. Yaşar Apt. No:10 İç Kapı No: Z01, Manavgat / Antalya
Tüm sayfalar ve ürünler: https://www.gespaenerji.com/llms.txt · Ayrıntı: https://www.gespaenerji.com/llms-full.txt
