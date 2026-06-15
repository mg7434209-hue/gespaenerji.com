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
| `regions[]` | `{ label, yield }` — yıllık özgül üretim (kWh/kWp/yıl) | 1300–1750 |

## Giriş yöntemleri

Kullanıcı üç yöntemden birini seçer; her biri **kurulu güç (kWp)** değerini üretir:

1. **Faturaya göre** — `aylıkFatura (₺)`
   `yıllıkTüketim = (aylıkFatura / birimFiyat) × 12`
   `kWp = yıllıkTüketim / bölgeVerim`
2. **Tüketime göre** — `aylıkTüketim (kWh)`
   `kWp = (aylıkTüketim × 12) / bölgeVerim`
3. **Çatı alanına göre** — `alan (m²)`
   `kWp = alan / areaPerKwp`

## Çıktı formülleri

```
yıllıkÜretim   = kWp × bölgeVerim                 (kWh/yıl)
panelSayısı    = ceil(kWp × 1000 / panelW)        (adet)
gerekliAlan    = kWp × areaPerKwp                 (m²)
aylıkÜretim    = yıllıkÜretim / 12                (kWh)
yıllıkTasarruf = yıllıkÜretim × birimFiyat        (₺)
yatırım        = kWp × costPerKwp                 (₺)
geriÖdeme      = yatırım / yıllıkTasarruf         (yıl)
25YılKazanç    = yıllıkTasarruf × years           (₺)
yıllıkCO2      = yıllıkÜretim × co2PerKwh / 1000   (ton)
25YılCO2       = yıllıkCO2 × years                (ton)
ağaçEşdeğeri   = yıllıkÜretim × co2PerKwh / treeKg (adet/yıl)
```

## Notlar / iyileştirme alanları

- Değerler **tahminidir**; kesin sonuç saha keşfiyle belirlenir (UI'da belirtilir).
- İleride eklenebilir: panel verim kaybı (yıllık ~%0,5 degradasyon), elektrik fiyat
  enflasyonu, öz tüketim/mahsuplaşma oranı, eğim/yön kayıp faktörü.
- Bu iyileştirmeler de katsayı olarak `config.calc` içine eklenmeli, koda gömülmemeli.
