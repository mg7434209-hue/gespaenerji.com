# CLAUDE.md — Gespa Enerji Kurumsal Site

> Repo kök dizinindedir; Claude Code her oturum başında otomatik okur.
> 200 satırı geçirme; uzayan içerikleri `@dosya/yolu.md` ile import et.

## Proje
Gespa Enerji kurumsal sitesi (gespaenerji.com). Antalya/Manavgat'ta anahtar
teslim güneş enerjisi (GES) hizmetleri. **Çok sayfalı statik site** (build adımı yok).
Saf HTML + CSS + Vanilla JS. Railway'de küçük Node statik sunucu (`server.js`),
GitHub Pages ayna sürüm.

Sayfalar (her biri kök dizinde, `.html` uzantılı):
`index.html` · `hizmetler.html` · `hesaplayici.html` · `projeler.html` ·
`hakkimizda.html` · `iletisim.html` · `tarimsal-sulama.html`
Her sayfa: ortak header/footer, aktif menü vurgusu, breadcrumb, sayfaya özel
SEO başlığı/açıklaması/canonical/Open Graph içerir.

## TEK DOĞRU KAYNAK — `assets/config.js`
İletişim bilgileri, markalar ve hesaplayıcı katsayıları **yalnızca** burada tutulur.
`assets/main.js` bu değerleri DOM'a enjekte eder (`data-c-text`, `data-c-tel`,
`data-c-wa`, `data-c-mailto` öznitelikleri + bölge/varsayım/JSON-LD üretimi).

- KURAL: İletişim bilgisini, markayı veya herhangi bir katsayıyı sayfalara/JS'e
  ASLA elle gömme. Değişiklik = sadece `assets/config.js` düzenlenir.

### İletişim (config.company)
- Unvan: Gespa Enerji Ltd. Şti.  ·  Görünen marka: GESPA Enerji
- Telefon / WhatsApp: 0543 743 42 09  ·  +90 543 743 42 09  ·  wa.me/905437434209
- E-posta: gesmarketim@gmail.com
- Adres: Örnek Mah. 1551 Sok. No:10/1, Manavgat / Antalya

### Markalar (config.brands)
- Panel: Arçelik, Lexron, Bakırlar
- İnverter: Tescom, Mexxsun, Lexron, Arçelik

## Hesaplayıcı (`hesaplayici.html`)
- Tüm formüller ve katsayılar: @docs/hesaplayici-spec.md
- Katsayılar tek config dosyasında (`config.calc`) ve koddan ayarlanabilir.
- KURAL: Hesaplayıcı bileşenine hiçbir sayı (fiyat, katsayı, güç) hardcode ETME.

## Konvansiyonlar
- Sayfa linkleri `.html` uzantılı (GitHub Pages uyumu için).
- Her sayfada LocalBusiness JSON-LD bulunur (config'ten enjekte edilir).
- Görseller repoda `assets/img/` altında durur; dış siteden hotlink YAPMA.
- Açık/koyu tema, mobil menü, scroll animasyonları `assets/main.js` ile yönetilir;
  yeni DOM'lar `.reveal` ve `data-count` desenlerini kullanabilir.
- Çok dil (TR/EN/DE/RU): `assets/i18n.js` metinleri TR kaynağına göre çevirir; yeni metin
  eklerken DE/RU karşılığını `DICT`'e ekle, yoksa zarifçe TR kalır. Marka/iletişim
  (`data-c-text`) ve dinamik sayılar çeviriden hariç tutulur.

## Ağ Kısıtı (ÖNEMLİ)
- Buluttaki Claude Code dış sitelere (ör. solaranaliz.tr, gespaenerji.com)
  ERİŞEMEZ — egress izin listesi kısıtı. "Git şu siteyi taklit et / kazı" çalışmaz.
- Dış veri gerekiyorsa: içeriği DOSYA olarak repoya ekle, ya da yerel Claude Code kullan.

## Yerel çalıştırma & Yayın
- Geliştirme: `npm start` → `node server.js` (http://localhost:3000).
- Railway: `package.json` + `railway.json`; `npm start` ile yayınlanır (canlı site).
- GitHub Pages: `.github/workflows/deploy-pages.yml` ile ayna sürüm.

## Test (commit öncesi)
- `node -c assets/main.js && node -c server.js` (söz dizimi).
- Sunucuyu başlatıp ana sayfaların 200 döndüğünü doğrula.
