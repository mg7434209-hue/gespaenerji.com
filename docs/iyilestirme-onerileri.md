# GESPA Enerji — İyileştirme Önerileri (Yol Haritası)

> Site şu an içerik ve teknik olarak yayına hazırdır. Bu belge, sıradaki
> iyileştirmeleri **öncelik** ve **tahmini efor** ile listeler. Her madde
> bağımsızdır; istediğin sırayla ele alınabilir.

Öncelik: 🔴 Yüksek · 🟡 Orta · 🟢 Düşük/Kozmetik
Efor: S (küçük) · M (orta) · L (büyük)

---

## 1) Yayın & Altyapı
- 🔴 **Railway'de canlıya alma** · S — Repo hazır (`server.js`, `package.json`, `railway.json`). GitHub'tan deploy + domain bağlama.
- 🔴 **Özel alan adı `gespaenerji.com`** · S — Railway Custom Domain + DNS (CNAME). `www` → kök yönlendirmesi. HTTPS otomatik.
- 🟡 **`gespaenerji.com.tr` → `.com` 301 yönlendirme** · S — İki alan adı da sizdeyse SEO için tek kanonik adreste birleştir.
- 🟢 **Uptime izleme** · S — UptimeRobot vb. ile kesinti bildirimi.

## 2) SEO
- 🔴 **Google Search Console + Bing Webmaster** · S — Site doğrulama + `sitemap.xml` gönderimi.
- 🟡 **Çok dilli SEO (ayrı URL + hreflang)** · L — DE/RU için `/de/`, `/ru/` sayfaları; şu anki JS çevirisi kullanıcı için iyi ama Google ayrı URL ister. Meta başlık/açıklamalar da dile göre indekslenir.
- 🟡 **Dile göre meta başlık/açıklama** · M — (Ayrı URL çalışmasıyla birlikte) her dilde özgün `<title>`/`description`.
- 🟡 **BreadcrumbList JSON-LD** · S — Alt sayfalara kırıntı yapısal verisi (arama sonuçlarında yol görünümü).
- 🟢 **Görsel SEO** · S — Proje görsellerine açıklayıcı dosya adı + `width/height` (CLS azaltır).

## 3) Ölçümleme & Dönüşüm
- 🔴 **Analytics** · S — Google Analytics 4 veya gizlilik dostu Plausible/Umami; KVKK için çerez bilgilendirmesi.
- 🔴 **Form → kalıcı kanal** · M — Şu an form WhatsApp'a iletiyor (lead kaybı yok). Ek olarak e-posta/CRM'e düşmesi için Formspree / Web3Forms / kendi API. Otomatik "teşekkürler" e-postası.
- 🟡 **Dönüşüm takibi** · S — "Teklif İste" ve WhatsApp tıklamalarını olay olarak ölç.
- 🟡 **Çerez/KVKK banner'ı** · S — Analytics eklenince yasal gereklilik.

## 3.5) Bütünlük / Tutarlılık
- 🟡 **Hesaplayıcı katsayılarını gerçek fiyatlarla güncelle** · S — `config.calc` (₺/kWp maliyet, panel gücü, batarya ₺/kWh) güncel piyasaya çekilmeli.
- 🟡 **Gerçek müşteri/marka logoları** · S — Ana sayfadaki "güven şeridi" şu an jenerik isimler; gerçek referans logoları eklenebilir.
- 🟢 **Sosyal medya bağlantıları** · S — Footer/iletişimdeki `#` linkleri gerçek LinkedIn/Instagram adresleriyle değiştir.

## 4) İçerik
- 🟡 **Blog/haberler** · L — `blog/` altında gerçek yazılar (lisanssız GES, teşvikler, geri ödeme). Organik trafik için güçlü.
- 🟡 **Proje detay sayfaları** · M — Her projeye özel sayfa (daha fazla foto, teknik detay, sonuç) + galeri.
- 🟢 **Müşteri videoları / referans mektupları** · M — Pakteki video kullanılabilir.
- 🟢 **SSS genişletme** · S — Daha fazla soru (KDV, bakım maliyeti, sigorta).

## 5) Performans
- 🟡 **Görsel formatı WebP/AVIF** · M — JPEG'leri WebP'ye çevir (~%30-50 daha küçük); `<picture>` ile fallback.
- 🟡 **Fontları yerelleştir** · S — Google Fonts'u self-host et (gizlilik + hız) veya `font-display:swap` zaten var.
- 🟢 **Kritik CSS / ölü kod temizliği** · S — Kullanılmayan `panel-card` stilleri kaldırılabilir.

## 6) Erişilebilirlik (A11y)
- 🟡 **Form `autocomplete` + hata erişilebilirliği** · S — `autocomplete="name/tel/email"`, hata mesajlarına `aria-live`.
- 🟢 **"İçeriğe atla" linki** · S — Klavye kullanıcıları için skip-link.
- 🟢 **Dil butonlarına `aria-pressed`** · S — Seçili dil durumunu ekran okuyuculara bildir.
- 🟢 **Renk kontrastı denetimi** · S — Açık temada `--muted` metinlerin AA kontrastı doğrulansın.

## 7) Güvenlik & Bakım
- 🟢 **Güvenlik başlıkları** · S — `server.js`'e CSP, Referrer-Policy, X-Frame-Options ekle.
- 🟢 **`Cache-Control` ince ayarı** · S — Görsellere uzun, HTML'e kısa cache (kısmen mevcut).
- 🟢 **Yedek/versiyon** · S — Etiketli sürümler (`v1.0`) ve değişiklik günlüğü.

---

## Önerilen ilk 5 adım (en yüksek getiri)
1. 🔴 Railway + `gespaenerji.com` alan adı (canlıya çık).
2. 🔴 Google Search Console + Analytics (ölç & indeksle).
3. 🔴 Formu kalıcı bir e-posta/servis kanalına da bağla.
4. 🟡 Hesaplayıcı katsayılarını gerçek fiyatlarla güncelle.
5. 🟡 Çok dilli SEO için `/de/` `/ru/` + hreflang.
