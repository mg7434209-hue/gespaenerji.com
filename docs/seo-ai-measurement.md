# SEO / AI görünürlüğü: ölçüm ve bakım

## Yayın kapsamı
- Dört hizmet rehberi ve mevcut portföyden üç proje özeti; TR/EN/DE/RU.
- Proje kapasiteleri ve fotoğrafları mevcut portföyden alınmıştır. Yeni müşteri adı, üretim sonucu veya devreye alma tarihi eklenmemiştir.
- Canonical, hreflang, yerelleştirilmiş iç bağlantılar, Service/WebPage ve Breadcrumb verileri.
- Firma künyesi iki LLM dosyasına config'ten üretilir; özet dosyada fiyat tekrarı yoktur.
- Kaynağı belirtilmeyen müşteri alıntıları ve %98 memnuniyet göstergesi yerine portföy ve referans talebi sunulur.

## GA4 olayları
Mevcut GA4 kimliği kullanılır. Olaylar yalnız ziyaretçi analitik çerezlerini kabul ettiğinde çalışır. Olaylar tıklama/ziyarettir; tamamlanmış satış veya müşteri talebi değildir.

| Olay | Parametreler | Anlam |
|---|---|---|
| ai_referral | ai_source, landing_path | Gözlemlenen AI alan adından giriş |
| contact_click | contact_method, page_path | Telefon, e-posta, WhatsApp tıklaması |
| quote_cta_click | page_path | Teklif/iletişim sayfasına yönelen tıklama |

AI kaynakları: ChatGPT, Perplexity, Claude, Copilot, Gemini. Referrer göndermeyen uygulamalar ölçülemez; Google AI Overviews ayrılamaz. Yeni olay parametreleri form içeriği, mesaj metni, telefon numarası veya tam referrer URL içermez.

### Hesap erişimiyle tamamlanacak işler
- GA4 DebugView/Gerçek Zamanlı ile izinli test oturumunun olaylarını kontrol edin. `ai_source` ve `contact_method` için olay kapsamlı özel boyutlar oluşturun.
- Search Console'da https://www.gespaenerji.com/sitemap.xml gönderimini/son okunmasını ve yeni URL'lerin indeks/canonical durumunu kontrol edin.
- En az 28 günlük karşılaştırmada marka/marka dışı sorguları, ülke, cihaz ve sayfa gruplarını ayırın. İndekslenme ve sıralama artışı garanti değildir.
- Google İşletme Profili ve firma rehberlerinde unvan/adres/telefonu config.company ile eşleştirin. Dış kayıtlar bu commit ile değiştirilmez.
- `sameAs` yalnız doğrulanmış kurumsal profil URL'leriyle doldurulmalı. İsim benzerliğine dayanarak profil seçilmemeli.
- Mevcut 500+ proje ve 15 MW toplamları için portföy dökümü; detaylar için paylaşılabilir ekipman, tarih ve üretim kayıtları sağlanmalı. Toplamlar bu çalışmada bağımsız doğrulanmadı.
- Müşteri yorumları kaynak ve yayın izni doğrulanınca eklenmeli. Memnuniyet oranı ölçüm yöntemi ve örneklem olmadan yayınlanmamalı.

### Gerçek AI görünürlüğü
Aynı dil/ülke/sorgu setiyle ChatGPT Search, Perplexity ve Google AI yanıtlarında haftalık marka anılması ve kaynak URL'lerini kaydedin. Örnekler: Manavgat çatı GES firması; Antalya güneş enerjili sulama; bağ evi için bataryalı güneş sistemi; Antalya GES bakım firması. Bot izni ve llms.txt varlığı gerçek önerilme oranı değildir.

## Doğrulama ve yayın
`npm run build && npm test`: sitemap URL'leri, canonical, H1, JSON-LD sözdizimi, yerel hedefler, dil bağlantıları ve sunucu 200/404 yanıtları. Google Rich Results ve Core Web Vitals ayrıca ölçülmelidir. Bu ortamın tarayıcısı yerel önizlemeye erişemediğinden görsel QA tamamlanamadı.

Yayın dalı `claude/determined-albattani-ol20qb`: Railway otomatik dağıtımı ve GitHub Pages workflow'u aynı daldan çalışır. İkisi ayrı dağıtımdır. Geri dönüş için ilgili değişikliği revert ederek yayın dalına gönderin; force push kullanmayın.
