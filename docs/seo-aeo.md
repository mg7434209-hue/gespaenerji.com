# SEO / AEO — üretim haritası ve kurallar

> CLAUDE.md "SEO / AEO" bölümünden `@` ile içe aktarılır. Ölçüm, GA4 olayları
> ve hesap erişimi gerektiren işler: `docs/seo-ai-measurement.md`.

Arama motorları ve yanıt motorları (ChatGPT, Perplexity, Claude, Gemini,
Copilot) sayfayı JavaScript ÇALIŞTIRMADAN okur. Bu yüzden görünürlüğe giren
her şey `node build.js` ile statik üretilir. Kaynaklar:
`assets/config.js` (veri) · TR kök sayfalar (içerik) · `content/*.js`
(editoryal metin) · `assets/i18n.js` (çeviri). Aşağıdaki çıktılar ELLE
DÜZENLENMEZ; kaynağı değiştir → `node build.js` → `npm test` → çıktıyla
birlikte commit'le.

## Üretilen dosyalar

| Çıktı | Üreten (build.js) | Kaynak |
|---|---|---|
| `robots.txt` | `writeRobots()` | `NOINDEX_FILES` + `AI_BOTS` |
| `sitemap.xml` (görsel + video uzantılı) | `writeSitemap()` | PAGES + TR_ONLY, git tarihi, `<main>` görselleri, VideoObject |
| `llms.txt` | `writeLlms()` | `LLMS_GROUPS` + sayfa `<title>`/description + config |
| `llms-full.txt` | `writeLlmsFull()` | config (fiyat/havale/kargo/stok ayrıntısı; çelişkide esas) |
| `urunler.xml` | `writeProductFeed()` | `config.packages` (CLAUDE.md "Ürün akışı") |
| `md/*.md`, `md/<dil>/*.md` | `writeMarkdownFile()` + `htmlToMd()` | sayfanın `<main>`'i |
| `assets/i18n.{tr,en,de,ru}.js` | `writeI18nBundles()` | `assets/i18n.js` |
| JSON-LD (`data-gld`) | `injectStaticLd()`, dilde `transform()` | config + sayfa |
| `sss.html` FAQGEN/FAQHUB/FAQTOC | `hydrateHelp()` | `content/sss.js` + sayfaların `.faq-item`'ları |
| `sozluk.html` GLOSSARY | `hydrateHelp()` | `content/sozluk.js` |
| footer `HELP:STATIC` | `hydrateHelp()` | iki dosyanın `labels.title`'ı |
| head etiketleri | `hydrateHead()` | aşağıda |

## Head (`hydrateHead`)
- `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`
  sayfada robots etiketi YOKSA eklenir. Etiket yoksa Google ve AI özetleri kısa
  snippet ve küçük görsel varsayar. noindex sayfaların kendi etiketine dokunulmaz.
- `<link rel="alternate" type="text/markdown" href="/md/<sayfa>.md">` (noindex
  sayfada yok; dil kopyasında `/md/<dil>/…`).
- `og:locale:alternate` ×3 (TR_ONLY hariç; dil kopyasında "kendi dili hariç").
- i18n betiği `assets/i18n.tr.js` yapılır; dil kopyasında `i18n.<dil>.js` olur.

## robots.txt
- `User-agent: *` → `Allow: /`, noindex sayfalar `Disallow`, `Disallow: /md/`
  (Markdown kopyası arama motorunda yinelenen içerik sayılmasın).
- `AI_BOTS` tek grupta (RFC 9309, çok `User-agent` satırı) → `Allow: /md/` + `Allow: /`.
- `Content-Signal: search=yes, ai-input=yes, ai-train=yes` — içeriğin AI
  aramalarında görünmesi İSTENİYOR. Değiştirmek bir iş kararıdır, kod kararı değil.
- Yeni noindex sayfa: `NOINDEX_FILES`'a ekle VE sayfaya kendi
  `<meta name="robots" content="noindex…">` etiketini yaz. Liste robots.txt,
  robots meta, Markdown kopya ve llms.txt'ten çıkarmayı birlikte yönetir.
- Yeni AI botu: build.js `AI_BOTS` + server.js `AI_BOT_NAMES` (sayaç).
  `Google-Extended` yalnız robots.txt izin jetonudur, ayrı UA ile gezmez;
  bu yüzden sayaçta YOKTUR.

## sitemap.xml
- TR + dil URL'leri ayrı, hreflang'li. `lastmod` = `lastModOf(file)` (dosyanın son
  git commit tarihi). WebPage `dateModified` AYNI kaynağı okur; iki tarih çelişmez.
- `<image:image>`: `<main>` içindeki `assets/` görselleri (svg/ikon hariç, tekrarsız,
  en çok 30). Başlık = `alt`. Alt metnini anlamlı yaz, görsel aramada başlık olur.
- `<video:video>`: sayfadaki statik VideoObject JSON-LD'den (şu an AI Cankurtaran).
- `/md/` ve noindex sayfalar sitemap'e GİRMEZ.

## Sayfa tarihleri (lastmod · dateModified · datePublished)
- Tek kaynak `lastModOf()` / `firstModOf()`: sitemap lastmod = WebPage
  dateModified = Markdown front-matter (test denetler). Tarihleri ELLE DÜZELTME.
- Öncelik: git (tam geçmiş) > sayfada commit'lenmiş WebPage tarihi > dosya zamanı.
- Git'e güvenilmeyen yerler: Railway (imajda `.git` yok, sunucu açılışta build
  çalıştırır) ve sığ klonlar (GitHub Actions, bulut oturumu). Sığ klonun sınır
  commit'i geçmişi kesik olduğu için HER dosyayı "ekler" görünür; o commit'e
  düşen tarih kullanılmaz, sayfada commit'lenmiş tarih korunur. Eskiden bu
  yüzden her dağıtım bütün sayfaları "bugün değişti" gösteriyordu.
- Commit'lenmemiş sayfa ya da BU build'de değişen sayfa = bugün. "Değişti mi"
  kararı build öncesi hâlle karşılaştırılarak verilir (tarih alanları hariç).
  Build başında bu hâl dondurulur, çünkü `seo.generate()` hizmet/proje
  sayfalarını şemasız yeniden yazar.
- Sığ klonda eski sayfaların yayın tarihi hesaplanamaz, commit'lenmiş değer
  korunur. Düzeltmek gerekirse önce `git fetch --unshallow origin`, sonra build.

## JSON-LD
- **LocalBusiness** (`@id` `/#organization`, `localBusinessLd`): contactPoint,
  hasMap (geo'dan), `paymentAccepted` (`config.commerce.payment`),
  currenciesAccepted, knowsLanguage, `foundingDate` = `config.company.foundingYear`.
- **WebSite** (`@id` `/#website`) her sayfada.
- **WebPage ailesi** (`pageLd`, tür `PAGE_TYPE`'tan): CollectionPage (urunler,
  online-satis, projeler), ItemPage (`data-pkg-detail` olan sayfalar + su-isitici
  + AI Cankurtaran; `mainEntity` = `url#product`), AboutPage, ContactPage,
  diğerleri WebPage. `@id` `url#page`, isPartOf, about,
  primaryImageOfPage (og:image), datePublished/dateModified (git), breadcrumb,
  speakable (`h1`, `.lead`, `.prod-lead`). Proje sayfalarında `seo.schema()`
  WebPage'iyle birleşir.
- **Product** (`packageProductLd`): `@id`, itemCondition, image DİZİSİ (ana foto +
  `.prod-thumbs`), additionalProperty (sayfanın ilk `.spec-table`'ı; parts-table
  ve fiyat içeren satır hariç, en çok 24 satır — tablo yoksa alan da yok),
  offers TRY (tahsil edilen para birimi), priceValidUntil (canlı kampanyada
  `endsAt`, yoksa yıl sonu), shippingDetails.deliveryTime (`commerce.shipDays`;
  elleçleme süresi uydurulmaz), shippingRate 0 YALNIZ `freeShipping`,
  hasMerchantReturnPolicy (`commerce.returnDays`), availability `stock`'tan,
  isRelatedTo (set → içindeki kalemler; kalem → içinde bulunduğu setler).
  `brand` = ürünün markası (UNV, europlus…).
- **aggregateRating / Review EKLENMEZ.** Doğrulanmış, kaynaklı yorum yok;
  uydurma puan yapısal veri ihlalidir ve ceza sebebidir.
- **Service** (`content/build-seo.js`): serviceType, areaServed = City nesneleri
  (containedInPlace Antalya). **ItemList** numberOfItems. **BreadcrumbList** `@id`.
- **DefinedTermSet** (sozluk.html): terim başına DefinedTerm, `url` = `sozluk.html#id`.
- Dil kopyasında `transform()` url, inLanguage ve metinleri yerelleştirir.

## SSS ve FAQPage
- TEK KAYNAK görünen `.faq-item`'dır. İşaretleme:
  `<div class="faq-item reveal"><button class="faq-q"><span>Soru</span><span class="faq-ico">+</span></button><div class="faq-a"><p>Yanıt</p></div></div>`.
  `<details>` KULLANMA: CSS'i yoktur, yanıt gizli kalır.
- FAQPage'i ELLE YAZMA. Build elle yazılmış FAQPage bloğunu SİLER ve görünen
  sorulardan üretir; dil kopyasında çevrilmiş gövdeden yeniden üretir. Böylece
  şema her dilde sayfayla birebir aynıdır (test denetler).
- Yalnız bağlantıdan oluşan yanıt paragrafı (`<p><a>…</a></p>`) şemaya girmez.
  Bağlantıyı kendi paragrafına koy; çeviri tuzağı da böyle çözülür.
- `sss.html` üç bölgeden oluşur. FAQGEN = `content/sss.js` `general` sorularıdır
  ve şemaya GİRER. FAQHUB = `groups` sırasıyla diğer sayfaların `.faq-item`'larıdır,
  "Kaynak sayfa →" bağlantısı taşır ve şemaya GİRMEZ (aynı soru-cevap tek
  yerde işaretlenir). FAQTOC = içindekiler.
  Yeni SSS'li sayfa hub'a girsin: `groups`a `{file, title:[tr,en,de,ru]}` ekle.
- Hizmet sayfalarının SSS'i `content/seo-pages.js` `faq` alanındadır (4 dil).

## GES sözlüğü (`sozluk.html`)
- Kaynak `content/sozluk.js`: `{id, term[4], def[4], link?}`. `id` sayfada çapadır
  (`sozluk.html#kwp`). AI motorları ve sayfalar bu adresle alıntılar; id'yi
  DEĞİŞTİRME. Test, sitedeki her `sozluk.html#…` bağlantısının var olan bir
  terime gittiğini denetler.
- Tanım genel bilgidir. Ürüne özel sayı (verim, fiyat, katsayı) yazılmaz.
- Metin içi bağlantı deseni: hesaplayıcı ve ürün sayfalarında kendi cümlesinde
  `… nedir? <a href="sozluk.html#terim">GES Sözlüğü →</a>`. Soru metni DICT'e
  3 dilde girer. Yeni ürün sayfasında deseni sürdür.
- Footer `HELP:STATIC` (SSS + Sözlük) "Kurumsal" sütununda `SISTER:STATIC`'in
  ardındadır. Üst menüye EKLENMEZ (menü genişlik kuralı).

## llms.txt, llms-full.txt ve Markdown kopyalar
- `llms.txt` sırası: firma künyesi (config.company), hizmet bölgesi, `LLMS_GROUPS`
  sırasıyla sayfalar (başlık, description, md bağlantısı), yasal sayfalar,
  satıştaki ürünler (liste fiyatı TRY; USD `usdTry` ile), diller.
  Yeni sayfa `LLMS_GROUPS`'a yazılmazsa "Diğer" altına düşer. Fiyatlar
  llms-full.txt ile aynı yardımcılardan gelir; elle güncelleme GEREKMEZ.
- `md/`: indekslenen her sayfanın (TR_ONLY dahil, noindex hariç) `<main>`'i
  Markdown'a çevrilir. Front-matter: title, description, canonical, lang,
  dateModified, publisher. `htmlToMd()` bu sitenin işaretlemesine göre yazıldı:
  nav/form/düğme/svg/gizli öğeler ve `.prod-thumbs`/`.qbox`/`.share-row` atılır,
  SSS sorusu `###` başlık olur, tablolar Markdown tablosuna döner.
  TUZAK: metindeki `&lt;`/`&gt;` erken çözülürse etiket silici `<`'i etiket başı
  sanıp sonraki `>`'ye kadar her şeyi yutar. Çözülen ayraçlar sona kadar yer
  tutucuda bekler (test BOOST künyesiyle denetler).
- server.js: `/md/` yanıtında `Link: <HTML adresi>; rel="canonical"`. HTML
  adresine `Accept: text/markdown` ile gelen isteğe md kopyası döner
  (`Content-Location`, `Vary: Accept`).

## IndexNow
- Kök dizindeki `<32 hex>.txt` anahtar dosyasıdır. Anahtar tasarım gereği
  HERKESE AÇIKTIR, sır değildir. Dosya adı = anahtar; değiştirmek için yeni dosya
  koy, eskisini sil.
- `tools/indexnow.js` son commit'te değişen HTML'leri (TR + dil URL'leri)
  api.indexnow.org'a bildirir; o da Bing, Yandex, Seznam, Naver ve Yep'e dağıtır.
  Bing indeksi Copilot ve ChatGPT aramasını besler. `--all` tüm sitemap'i,
  `--dry-run` ağsız önizlemeyi verir. Komut: `npm run indexnow`.
- Kendi iş akışında çalışır (`.github/workflows/indexnow.yml`), Pages
  yayınından ayrıdır; onun `cancel-in-progress` iptali bildirimi düşürmez.
  Push öncesi commit `--base=<github.event.before>` ile verilir, tek push'taki
  TÜM commit'lerin sayfaları bildirilir. Base yoksa `HEAD~1`'e düşer.
- `--wait-live`: canlı site Railway'dedir ve Pages'ten ayrı dağıtılır. Betik,
  anahtar dosyası canlıda VE değişen ilk sayfanın canlı içeriği repodakiyle
  BİREBİR aynı olana dek bekler (en çok 10 dk; build her ortamda aynı çıktıyı
  üretir, sunucu dosyayı değiştirmeden servis eder). Anahtar dosyası canlıda
  yoksa bildirim GÖNDERİLMEZ ve günlüğe HTTP durumu yazılır.
- NEDEN: ilk kurulumda bildirim, Railway anahtar dosyasını yayına almadan
  gitti ve IndexNow 403 "UserForbiddedToAccessSite" döndü. IndexNow başarısız
  doğrulamayı bir süre önbellekte tutar.
- Elle tam gönderim: GitHub → Actions → IndexNow → Run workflow → "all".
- Google IndexNow kullanmaz; onun için sitemap + Search Console.

## AI tarayıcı sayacı (sunucu)
- server.js `botOf()`/`countBot()`: `AI_BOT_NAMES` (AI) ve `SEARCH_BOT_NAMES`
  (karşılaştırma için arama botları) UA eşleşmesi. Bot başına sayı, son görülme,
  en çok çekilen 30 yol tutulur.
- Kalıcı veri `DATA_DIR/aibots.json`. Railway Volume bağlı değilse her
  dağıtımda sıfırlanır.
- `/api/aibots` POST `{pass}` (config.admin.pass) → admin.html "🤖 AI tarayıcı
  ziyaretleri" kartı. GA4 `ai_referral` İNSAN trafiğini, bu sayaç BOTLARI ölçer.

## i18n demetleri
- Sayfalar `assets/i18n.js`'i DEĞİL, dil demetini yükler: TR sayfa
  `i18n.tr.js` (sözlüksüz, ~2 KB br), dil kopyası kendi dilininkini
  (~61–68 KB br). Kaynak i18n.js 138 KB br idi ve her sayfada 4 dilin tamamı
  iniyordu.
- DICT/PH/HTMLMAP/UNITS yine `assets/i18n.js`'te düzenlenir; demetleri elle
  düzenleme. `GESPA.i18nData.DICT[dil]` şekli korunur, main.js ve builder.js
  değişmez.
- Build `var LS = "gespa-lang";` ve `var SKIP = ` çapalarını arar; bulamazsa
  HATA verir. Aradaki veri bölgesine yalnız veri ve `Object.assign` yaz;
  fonksiyon yazılırsa demete girmez.
- Demetler `loadI18nRaw()` ile üretilir: `content/translation-fixes.json`
  demete GİRMEZ. CLAUDE.md'deki "BİLİNEN EKSİK" aynen geçerlidir. Kapatmak
  için `writeI18nBundles` `loadI18n()` kullanabilir; bu çalışma zamanı
  çevirisini değiştirir, ayrı iş olarak test edilmelidir.

## Mevzuat rehberleri (yalnız Türkçe)
- İlk rehber: `gunes-paneli-kacak-elektrik-cezasi.html` (Eyl 2026; 2 Nisan 2026
  yönetmelik değişikliği, 7584 sayılı Kanun, saatlik mahsuplaşma, off-grid
  ayrımı). `build.js` `TR_ONLY`'dedir: dil kopyası yok, hreflang yalnız
  `tr` + `x-default`, sitemap'e tek URL.
- İşaretleme: `<main id="main" data-article>` → `article.art`. Build bu
  işareti görünce `articleLd()` ile **Article** şeması basar: headline = h1,
  açıklama = meta description, tarihler WebPage ile aynı kaynaktan,
  `citation` = görünen `ul.art-src` bağlantıları, yazar/yayıncı = firma
  (Person YOK). WebPage'in `mainEntity`'si Article'dır. Test başlığın, tarihlerin
  ve kaynak sayısının sayfayla eşit olduğunu denetler.
- İÇERİK KURALI: hukuki/mevzuat iddiası yalnız doğrulanmış kaynakla yazılır
  (Resmî Gazete, bakanlık, EPDK, hukuk bürosu, haber). Doğrulanamayan ifade
  (ör. "EPDK uyumlu invertör listesi") çıkarılır ya da doğrulanabilir
  biçimde yeniden yazılır. Sonda sorumluluk reddi (`p.art-disc`) KALIR.
  Görünen yayın tarihi (`<time>`) ve `article:published_time` yayın günüdür.
- ÖZET ÖNCE: makale `article.art`'ın ilk öğesi olan `.art-cases` ile başlar
  (`h2#ozet` + üç `.art-case`; `.ok` yeşil, `.warn` sarı kenar; her kartta
  `h3` → `p.art-case-tag` hüküm → açıklama). Kart içinde `<li>` yerine `<div>`
  kullanılır: `htmlToMd()` `<li>` içeriğini tek satıra ezer, h3 kaybolurdu.
  Yanıt motorları ilk ekrandaki bu özeti alıntılar; ayrıntı bölümleri ve SSS
  özetle aynı hükmü verir.
- Stiller: `.art`, `.art-meta`, `.art-note` (+ `.crit`), `.art-cases`/
  `.art-case` (+ `.ok`/`.warn`, `.art-case-tag`), `.art-fig`, `.art-src`,
  `.art-disc` — hepsi tema değişkeniyle, koyu temada da doğru.
- `TR:ONLY` bağlantıları: footer `HELP:STATIC` (`GUIDE` sabiti), SSS merkezi
  grubu (`content/sss.js` → `trOnly: true`), sözlük terimi (`content/sozluk.js`
  → `trLink`), tarımsal sulama duyurusu ve SSS cevabı. `transform()` bu blokları
  dil kopyasından siler; `llms.txt`'te "Rehberler ve güncel mevzuat" grubu.
- Yeni rehber: `TR_ONLY` + `LLMS_GROUPS` + `PRIORITY` + gerekirse `GUIDE`
  benzeri bağlantı; sayfa şablonu mevcut rehberden kopyalanır.

## Kurumsal hikâye
- Hakkımızda TEK SÜREGELEN HİKÂYE anlatır: 2005'ten bu yana Manavgat'ta
  kesintisiz faaliyet. Şirket/şahıs ayrımı ve 2022 "kurumsallaşma"/sicil tarihi
  satırları kullanıcı kararıyla KALDIRILDI (test denetler). `foundingYear` 2005.
- Kurucu kişi ve Person şeması YOKTUR; site kurumsal kalır (kullanıcı kararı).
- Yasal unvan `config.company.legalName`'de kalır; fatura, sözleşme ve
  künye için gereklidir.

## Yeni sayfa kontrol listesi
1. TR sayfa: tek `<h1>`, title/description, canonical, og, `<main>`; görsellerde
   width/height ve anlamlı `alt`.
2. build.js: PAGES (ya da TR_ONLY), META (en/de/ru), PRIORITY, `LLMS_GROUPS`.
   noindex ise `NOINDEX_FILES` + sayfaya robots noindex etiketi.
3. SSS varsa `.faq-item` işaretlemesi (FAQPage kendiliğinden üretilir). Hub'da
   görünsün istiyorsan `content/sss.js` `groups`.
4. Görünen metinler için DICT'e 3 dil.
5. `node build.js` → `npm test` → çıktıyla birlikte commit. IndexNow yayından
   sonra kendiliğinden çalışır.

## Testler (`npm test` → `tests/seo.test.js`)
Her sitemap sayfasında: tek h1, canonical, robots meta, md bağlantısı ve dosyası,
WebPage + WebSite + LocalBusiness alanları, ürün sayfasında Product alanları ve
ItemPage, FAQPage = görünen sorular (her dilde), elle yazılmış FAQPage yok,
yerel hedefler var. Ayrıca: görsel/video sitemap, robots.txt içeriği,
llms.txt kapsamı, IndexNow anahtarı, og:locale:alternate, SSS merkezi ve
sözlük şeması, sözlük çapaları, Markdown tablo tuzağı, birleşik hikâye,
i18n demetleri. HTTP bölümü sunucuyu açıp md müzakeresini, `Link` başlığını
ve GPTBot sayacını dener.
