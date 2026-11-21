# Satış motoru — yapay zekâ asistanı, talepler, iletişim hunisi

> CLAUDE.md "Satış motoru" bölümünden `@` ile içe aktarılır.
> Sunucu `server.js` ("YAPAY ZEKÂ SATIŞ ASİSTANI" ve "lead" bölümleri) ·
> pencere `assets/chatbot.js` · yönetim `admin.html` (`#leadcard`, `#chatcard`).

Neden yapıldı (21 Kas 2026): günde 150–300 ziyaret var, mesaj atan yok. Sohbet
penceresi anahtar kelime botuydu, numara bırakan ziyaretçinin numarası sunucuya
HİÇ yazılmıyordu (yalnız WhatsApp bağlantısı üretiliyordu) ve hangi düğmeye
basıldığı ölçülmüyordu.

## Yapay zekâ asistanı — `/api/chat`
- `ANTHROPIC_API_KEY` YALNIZ Railway ortam değişkenidir. Yoksa (ya da
  `@anthropic-ai/sdk` yüklenemezse) asistan KAPALIDIR: `GET /api/chat` →
  `{enabled:false}`, pencere eski anahtar-kelime botuyla (`ruleAnswer`) çalışır.
  SDK `try/catch` içinde yüklenir; yokluğu sunucuyu düşürmez.
- `CHAT_MODEL` (varsayılan `claude-opus-5-5`), `CHAT_DAILY_MAX` (varsayılan 400
  mesaj/gün, harcama tavanı). Kişi başı sınır: IP başına saatte 30, günde 80.
  Bot kullanıcı aracısı 403. Tavan dolunca 429 `{fallback:true}`.
- TEK BİLGİ KAYNAĞI `llms-full.txt`'tir (build.js üretir): kurallar + bu dosya
  tek sistem bloğudur ve önbelleğe alınır (`cache_control`). Asistanın bildiği
  fiyat/ürün bilgisi budur; ürün ya da fiyat değişince `node build.js` yeter,
  asistana ayrıca bilgi YAZILMAZ. Sayfa ve dil bilgisi sistem bloğuna DEĞİL
  son kullanıcı mesajına eklenir (önbellek bozulmasın).
- Kurallar `CHAT_RULES`: yalnız BİLGİ'deki değerleri söyler, fiyat/stok/garanti/
  teslim süresi UYDURMAZ, keşif gerektiren işe fiyat vermez, hassas veri
  istemez, ziyaretçinin dilinde kısa düz metin yazar, bir sonraki adımı önerir
  (numara bırak / WhatsApp). Kuralı gevşetme: uydurma bilgi satış kaybından
  pahalıdır.
- İstek biçimi (test denetler): `output_config.effort:"low"`, `thinking` ve
  `temperature` YOK, reddetme yedeği `fallbacks:"default"` + beta başlığı.
- Her hata (anahtar, sınır, ağ) 502 `{fallback:true}` döner; pencere kural
  botuna düşer, ziyaretçi hata görmez.
- Anahtar tarayıcıya ASLA gitmez; `/data/chats.json` ve `/data/leads.json`
  dışarıdan 404'tür (test).

## Talepler (lead) — `/api/lead` · `leads.json`
- Kaynaklar `LEAD_SOURCES`: `hesaplayici` (ad zorunlu), `geri-arama`,
  `asistan`, `urun` (yalnız telefon ≥10 rakam yeter). `urun` = config ürün
  kimliği → ürün adı; `not` = sohbet dökümü (en çok son 12 mesaj).
- Tek kayıt yolu `saveLead()`: dosyaya yazar, `act.lead` sayacını artırır,
  SMTP hazırsa işletmeye e-posta atar. SMTP yoksa talep YALNIZ yönetim
  panelinde görünür (kart uyarır).
- Sohbette telefon numarası yazan ziyaretçi için talep KENDİLİĞİNDEN açılır
  (sohbet başına bir kez).
- Yönetim: `POST /api/leads` `{pass, done?}` (listele / "arandı" işaretle),
  `POST /api/chats` (sohbet dökümleri: son 200 sohbet, sohbet başına 60 mesaj).
- Dağıtım devri: `seedLeadsFromLive()` açılışta eski sürümden
  `/api/handoff/export` ile talepleri ve sohbetleri alır (Volume yokken de
  dağıtımda kaybolmasın). Kalıcılık için yine de Railway Volume gerekir.
- KVKK: telefon ve sohbet metni loglara YAZILMAZ. Sohbet içeriği yurt
  dışındaki yapay zekâ sağlayıcısına gider; `kvkk.html` ve `gizlilik.html`
  bunu söyler, pencere açılışında not gösterilir. Akış değişirse bu metinleri
  BİRLİKTE güncelle.

## Pencere — `assets/chatbot.js`
- Yanıt önce asistandan istenir, olmazsa `ruleAnswer()`.
- "📞 Beni arayın": yalnız telefon ister (`geri-arama`).
- Davet balonu (`.gchat-nudge`): oturumda bir kez, 25 sn ya da %50 kaydırma
  sonrası; sepet/ödeme/admin sayfalarında ve çerez çubuğu açıkken ÇIKMAZ.
- Bağlantılar `linkify()` ile yalnız kendi alan adımız ve wa.me için DOM
  düğümü olarak kurulur; `innerHTML` KULLANILMAZ (asistan metni güvenilmez
  girdidir).

## İletişim hunisi — `stats.act`
`/api/ev` `{t:"act", id}` beyaz listesi: `wa`, `tel`, `chat_open`, `nudge`,
`cb_open`. Sunucu ayrıca `chat_msg` ve `lead` sayar. Yönetim panelinde
"İletişim hunisi" kutuları bunları gösterir. Yeni düğme ölçülecekse beyaz
listeye ve admin kutularına birlikte ekle.
