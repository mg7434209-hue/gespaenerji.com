# SEO / AI görünürlüğü: ölçüm ve bakım

## Yayın kapsamı
- Dört hizmet rehberi ve mevcut portföyden üç proje özeti; TR/EN/DE/RU.
- Proje kapasiteleri ve fotoğrafları mevcut portföyden alınmıştır. Yeni müşteri adı, üretim sonucu veya devreye alma tarihi eklenmemiştir.
- Canonical, hreflang, yerelleştirilmiş iç bağlantılar, Service/WebPage ve Breadcrumb verileri.
- İki LLM dosyası da (`llms.txt`, `llms-full.txt`) build'de config'ten üretilir. Özet dosyadaki liste fiyatları llms-full.txt ile aynı yardımcılardan hesaplandığı için çelişmez. Üretim kuralları: `docs/seo-aeo.md`.
- Kaynağı belirtilmeyen müşteri alıntıları ve %98 memnuniyet göstergesi yerine portföy ve referans talebi sunulur.

## GA4 olayları
Mevcut GA4 kimliği kullanılır. Olaylar yalnız ziyaretçi analitik çerezlerini kabul ettiğinde çalışır. Olaylar tıklama/ziyarettir; tamamlanmış satış veya müşteri talebi değildir.

| Olay | Parametreler | Anlam |
|---|---|---|
| ai_referral | ai_source, landing_path | Gözlemlenen AI alan adından giriş |
| contact_click | contact_method, page_path | Telefon, e-posta, WhatsApp tıklaması |
| quote_cta_click | page_path | Teklif/iletişim sayfasına yönelen tıklama |

AI kaynakları (`ai_source`): chatgpt, perplexity, claude, copilot, gemini, you, poe, grok, brave-ai (search.brave.com), duckduckgo. Son ikisi klasik arama sonucundan gelen ziyareti de kapsar; yalnız AI yanıtı sayılmamalıdır. Referrer göndermeyen uygulamalar ölçülemez; Google AI Overviews ayrılamaz. Yeni olay parametreleri form içeriği, mesaj metni, telefon numarası veya tam referrer URL içermez.

## Sunucu tarafı: AI tarayıcı ziyaretleri
GA4 yalnız insan ziyaretçiyi ve çerez onayı vereni görür. AI botları (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot…) JavaScript çalıştırmadığı için GA4'te hiç görünmez. Bu yüzden server.js her isteğin tarayıcı kimliğini (User-Agent) bot listesiyle eşler ve sayar. Karşılaştırma için klasik arama botları (Googlebot, bingbot…) ayrı türde tutulur.

- Görüntüleme: admin.html → "🤖 AI tarayıcı ziyaretleri" kartı (bot, sayı, son görülme, en çok çekilen sayfalar).
- Kayıt `DATA_DIR/aibots.json` dosyasındadır. Railway'de Volume bağlı değilse her dağıtımda sıfırlanır.
- Yorum: bir botun sayfayı çekmesi, o sayfanın bir yanıtta kaynak gösterildiği anlamına gelmez. Gerçek anılma için aşağıdaki haftalık yanıt kaydı gerekir.
- User-Agent taklit edilebilir. Sayaç bilgi amaçlıdır, güvenlik kararı için kullanılmaz.

## Hesap erişimiyle tamamlanacak işler
- Bing Webmaster Tools'a siteyi ekleyin ve sitemap'i gönderin. Bing indeksi Copilot ve ChatGPT aramasını besler. IndexNow bildirimleri (GitHub → Actions → "IndexNow" iş akışı) Bing panelinde "IndexNow" altında görünmelidir. İş akışı günlüğü anahtar dosyasının canlıdaki HTTP durumunu yazar; "anahtar dosyası canlıda yok" uyarısı, canlı sitenin (Railway) bu dalı yayınlamadığını gösterir.
- Railway'de `DATA_DIR`'i bir Volume'a bağlayın. Sipariş kayıtları, ziyaretçi sayacı ve AI tarayıcı sayacı ancak böyle kalıcı olur.
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
`npm run build && npm test`: sitemap URL'leri, canonical, H1, JSON-LD sözdizimi, yerel hedefler, dil bağlantıları ve sunucu 200/404 yanıtları. Google Rich Results ve Core Web Vitals ayrıca ölçülmelidir. Görsel QA bulut ortamında yerel Chromium ve Playwright ile yapılabilir; sunucu açılışta build çalıştırdığı için hazır olmasını bekleyin.

Yayın dalı `claude/determined-albattani-ol20qb`: Railway otomatik dağıtımı ve GitHub Pages workflow'u aynı daldan çalışır. İkisi ayrı dağıtımdır. Geri dönüş için ilgili değişikliği revert ederek yayın dalına gönderin; force push kullanmayın.
