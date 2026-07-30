# Yapılacaklar (Backlog) — gespaenerji.com

> Ara ara buradan seçip yapıyoruz. Tamamlananları işaretleyip commit'leyin.
> Kaynak: uçtan uca denetim turları (Temmuz 2026, toplam 123 bulgu — uygulananlar hariç).

## Sizden veri bekleyenler (kod hazır, bilgi gelince dakikalar sürer)
- [ ] **Sistem Kurucu ürün fiyatları**: `config.builder.catalog` içindeki panel/akü/
      inverter/kablo/pano/işçilik fiyatları tahmini liste fiyatıdır — güncel alış+marj
      fiyatlarınızı verin, tek dosyada güncelleyeyim (admin panelinden de override edilebilir)
- [ ] **Sistem Kurucu ürün kataloğu**: satmak istediğiniz gerçek marka/model listesi
      (ör. TitanX kapasiteleri, Lexron/Tescom inverter modelleri) — ekleyip çıkaralım
- [ ] **Google Business Profile** açılması + işyeri koordinatı → `assets/config.js` `company.geo.lat/lng`
      (girilince JSON-LD'ye otomatik girer; iletisim.html'e harita/yol tarifi bloğu eklenecek)
- [ ] **Gerçek müşteri yorumları** (izinli; ad/ilçe/sistem gücü/yıl) → ana sayfadaki yer tutucu
      yorumlarla değiştirilecek ("Sanayi A.Ş." AI motorları için güven riski)
- [ ] **Sosyal profiller** (LinkedIn şirket + Instagram işletme) → `config.company.sameAs`
      (footer + JSON-LD otomatik canlanır; AI varlık doğrulaması için önemli)
- [ ] **GA4 ölçüm kimliği** → `config.analytics.ga4` (onay bariyeri hazır; dönüşüm
      olayları — WhatsApp/tel/form — için track() eklenecek)
- [ ] **Ekip bilgisi** (kurucu + teknik sorumlu: ad, unvan, deneyim, fotoğraf) →
      hakkimizda'ya "Ekibimiz" bölümü + Person şeması (E-E-A-T)
- [ ] **Marka logoları** (tedarikçi/üretici kaynaklı dosyalar) → güven şeridi metin
      yerine logolu olacak (`assets/img/brands/`)
- [ ] **Gerçek kurulum fotoğrafları** (cankurtaran) → illüstrasyonların yerine/yanına

## İçerik üretimi (AI aramada alıntılanma için en yüksek etki)
- [ ] Rehber: "Antalya'da GES Teşvikleri ve Destekler (2026)" — hedef: 'GES teşvikleri 2026'
- [ ] Rehber: "Çatı GES Ruhsat/Bağlantı Süreci Adım Adım" — hedef: 'çatı GES izin süreci'
- [ ] Rehber: "Havuz Güvenliğinde ISO 20380 Nedir?" — cankurtaran sayfasını besler
- [ ] Karşılaştırma: "PV Su Isıtıcı vs Güneş Kolektörlü Termosifon" (tablolu)
- [ ] Karşılaştırma: "Dizel Pompa vs Solar Pompa — 5 Yıllık Maliyet"
- [ ] 2-3 amiral proje için vaka çalışması (sorun→çözüm→sonuç + rakamlar);
      projeler.html kartlarına yıl + yıllık üretim + marka bilgisi
- [ ] Bültene gerçek içerik akışı ya da bülten bloğunun kaldırılması

## Teknik (orta boy işler)
- [ ] i18n.js'i böl: çekirdek + dil başına sözlük (dict-en/de/ru.js) — TR sayfalarda
      ~78KB gz tasarruf; build'de üretilebilir
- [ ] Google Fonts self-host (latin-ext woff2, assets/fonts/) — KVKK metni sadeleşir,
      CSP'den Google alanları çıkar (yerel ortamdan font dosyaları gerekiyor; bulut egress kapalı)
- [ ] Dil sayfalarında JSON-LD description alanlarının çevirisi (LocalBusiness/Product)
- [ ] llms.txt/llms-full.txt için EN sürüm (/en/llms.txt) build üretimi
- [ ] admin.html: aktif localStorage override'ı varken "yayınlanan fiyatlardan farklı"
      rozeti + config'e yapıştırılacak JSON çıktısı
- [ ] server.js: /healthz endpoint'i (buildOk durumu) + atomik dosya yazımı
- [ ] Chatbot'u ilk tıklamada yükle (sayfa başına ~12KB gz tasarruf)
- [ ] hakkimizda zaman çizelgesi ↔ config.stats tutarlılık kontrolü build'de uyarı olarak

## Dış dünya (site dışı görünürlük)
- [ ] GBP yorumları toplamaya başlayın (QR kart/link); 5+ yorum sonrası config
      rating alanları doldurulup aggregateRating şeması açılır
- [ ] Yerel dizinler (Yandex Haritalar, sektörel B2B dizinler) NAP tutarlı kayıt
- [ ] Üretici/distribütör sayfalarından backlink (bayilik netleşince cankurtaran
      üretici logosu + karşılıklı link)

## AI Cankurtaran — brief v2 (Temmuz 2026) kalan maddeler
Brief'in "hemen yayınlanacak" bölümleri (1-4, 7) işlendi: belge numaraları, Türkiye
vaka verisi, teknoloji kartları, aylık hizmet modeli, lansman şeridi, 2 yeni SSS,
meta/anahtar kelime güncellemesi. Aşağıdakiler KİLİTLİ ya da veri bekliyor.

- [ ] **KİLİTLİ — referans içerikleri (brief bölüm 5).** Açılma koşulu: üretici
      işbirliği sözleşmesi imzalanacak **ve** yazılı görsel kullanım izni e-postası
      gelecek. İkisi tamam olmadan hiçbir marka adı, otel adı veya görsel siteye
      KONMAYACAK — bu yüzden adlar repoda da tutulmuyor, brief PDF'inde duruyor.
      Geldiğinde: referans bölümüne "Kurulu tesislerden bazıları:" satırı, izinli
      görsellerden foto galerisi, footer + "Neden GESPA" bölümüne resmî bayilik
      unvanı. Müşteri projesi yerleşim çizimleri yayınlanmaz.
- [ ] **Pilot sonrası (brief bölüm 6).** Türkiye kurulum galerisi (6-8 kare: kamera
      montajı, izleme ekranı, saat alarmı yakın çekim, gece görüntüsü), otel onaylı
      vaka çalışması bloğu, referans sayaçlarına "Türkiye: 1. kurulum canlı" kutusu.
- [ ] Belge PDF'leri siteye YÜKLENMEYECEK; yalnızca numara yayında, kopya talep
      üzerine e-postayla verilir (brief kuralı).
- [ ] Tam fiyat listesi siteye konmayacak; yalnızca aylık çapa rakam
      (`config.pool.monthlyFrom`) yayında kalacak.
