# Hesaplayıcı Spesifikasyonu — GES Tasarruf Hesaplayıcı

Sayfa: `hesaplayici.html` · Mantık: `assets/main.js` (calc IIFE) · Katsayılar: `assets/config.js` → `GESPA.config.calc`

> KURAL: Hesaplayıcıya hiçbir sayı (fiyat, katsayı, güç) hardcode edilmez.
> Tüm katsayılar yalnızca `assets/config.js` içindeki `calc` nesnesinden okunur.

## Katsayılar (config.calc)

| Anahtar | Açıklama | Varsayılan |
|--------|----------|-----------|
| `panelW` | Tek panel gücü (Wp) | 550 |
| `areaPerKwp` | kWp başına yaklaşık alan (m²) | 6 |
| `costPerKwp` | Tahmini kurulum maliyeti (₺/kWp) | 28.000 |
| `co2PerKwh` | Şebeke emisyon faktörü (kg CO₂/kWh) | 0,45 |
| `treeKg` | Ağaç başına yıllık CO₂ yutumu (kg) | 22 |
| `years` | Ekonomik ömür (yıl) | 25 |
| `defaultUnitPrice` | Varsayılan elektrik fiyatı (₺/kWh) | 2,5 |
| `degradation` | Yıllık panel verim kaybı (%) | 0,5 |
| `defaultInflation` | Varsayılan yıllık elektrik zammı (%) — temkinli; kullanıcı senaryo girebilir | 0 |
| `co2PerCarKm` | Ortalama binek araç emisyonu (kg CO₂/km) | 0,12 |
| `regions[]` | `{ label, yield }` — yıllık özgül üretim (kWh/kWp/yıl) | 1300–1750 |
| `orientations[]` | `{ label, factor }` — çatı yönü/eğim verim çarpanı | 0,65–1,0 |

## Giriş yöntemleri

Kullanıcı üç yöntemden birini seçer; her biri **kurulu güç (kWp)** değerini üretir:

1. **Faturaya göre** — `aylıkFatura (₺)`
   `yıllıkTüketim = (aylıkFatura / birimFiyat) × 12`
   `kWp = yıllıkTüketim / bölgeVerim`
2. **Tüketime göre** — `aylıkTüketim (kWh)`
   `kWp = (aylıkTüketim × 12) / bölgeVerim`
3. **Çatı alanına göre** — `alan (m²)`
   `kWp = alan / areaPerKwp`
4. **Tarımsal sulama** — `pompaGücü (kW)`, `günlükSaat`, `sezonAy`
   `yıllıkTüketim = pompaGücü × günlükSaat × sezonAy × 30`
   `kWp = yıllıkTüketim / (bölgeVerim × yön)` · varsayılanlar `config.calc.irrigation`

Çatı yönü çarpanı `yön` (orientations.factor) bölge verimine uygulanır:
`yıllıkÜretim(1.yıl) = kWp × bölgeVerim × yön`. Yöntem 2 ve 3'te kWp hesabına da `yön` dahildir.

## Çıktı formülleri

```
yıllıkÜretim   = kWp × bölgeVerim × yön           (kWh/yıl, 1. yıl)
panelSayısı    = ceil(kWp × 1000 / panelW)        (adet)
gerekliAlan    = kWp × areaPerKwp                 (m²)
aylıkÜretim    = yıllıkÜretim / 12                (kWh)
yıllıkTasarruf = yıllıkÜretim × birimFiyat        (₺, 1. yıl)
aylıkTasarruf  = yıllıkTasarruf / 12              (₺)
yatırım        = kWp × costPerKwp                 (₺)
```

### 25 yıllık projeksiyon (degradasyon + elektrik zammı)
Her yıl `y = 0..years-1` için:
```
üretim_y   = yıllıkÜretim × (1 − degradation)^y
fiyat_y    = birimFiyat × (1 + zam)^y
tasarruf_y = üretim_y × fiyat_y
```
```
ömürÜretim   = Σ üretim_y
25YılKazanç  = Σ tasarruf_y                        (₺)
geriÖdeme    = kümülatif tasarrufun yatırımı aştığı yıl (kesirli interpolasyon)
25YılNet     = 25YılKazanç − yatırım               (₺)
ROI          = 25YılNet / yatırım × 100            (%)
yıllıkCO2    = yıllıkÜretim × co2PerKwh / 1000      (ton)
25YılCO2     = ömürÜretim × co2PerKwh / 1000        (ton)
ağaçEşdeğeri = yıllıkÜretim × co2PerKwh / treeKg    (adet/yıl)
araçKm       = ömürÜretim × co2PerKwh / co2PerCarKm (km)
```
Grafik: yıllık **kümülatif tasarruf** çubukları + yatırım çizgisi; geri ödeme yılı renkle vurgulanır.

## Notlar / iyileştirme alanları

- Değerler **tahminidir**; kesin sonuç saha keşfiyle belirlenir (UI'da belirtilir).
- İleride eklenebilir: panel verim kaybı (yıllık ~%0,5 degradasyon), elektrik fiyat
  enflasyonu, öz tüketim/mahsuplaşma oranı, eğim/yön kayıp faktörü.
- Bu iyileştirmeler de katsayı olarak `config.calc` içine eklenmeli, koda gömülmemeli.

## Ek araç — Solar Sulama Pompası Seçimi (`tarimsal-sulama.html`)

Katsayılar: `config.calc.pump` · Mantık: `assets/main.js` (pump IIFE)

```
gerekliDebi(Q)   = günlükSu / pompalamaSaati            (m³/saat)
hidrolikGüç      = Q × yükseklik × 0,002725             (kW)   ; 0,002725 = ρ·g/3.6e6
pompaGücü        = hidrolikGüç / pumpEfficiency          (kW)
pompaGücü(HP)    = pompaGücü × hpPerKw
panelGücü        = pompaGücü × pvOversize                (kWp)
panelSayısı      = ceil(panelGücü × 1000 / panelW)
yatırım          = panelGücü × costPerKwp
```
Katsayılar: `pumpEfficiency` (telden suya verim), `pvOversize` (panel/pompa oranı),
`hpPerKw`, varsayılan girdiler (`defaultWater/Head/Sun`).
