#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Elektrikçi Çantası: merkez sayfa + araç başına iniş sayfaları — TEK KAYNAK.

Kullanım:
  python3 tools/usta-sayfalar.py            DRY-RUN: üretir, denetler, yazmaz
  python3 tools/usta-sayfalar.py --uygula   elektrikci-cantasi.html ve PAGES'teki sayfaları yazar
Ardından: node build.js && npm test

NASIL ÇALIŞIR
- Araç kartları (girdi/sonuç işaretlemesi) burada BİR KEZ tanımlanır (tool()/part()); merkez sayfa
  hepsini kategorilerle basar, iniş sayfaları PAGES'te adı geçen kartların AYNI işaretlemesini alır.
  Hesap mantığı yalnız assets/usta.js'tedir (kopyalanmaz); sayfalar eleman kimliğiyle bağlanır.
- Örnek sayılar ELLE YAZILMAZ: metinde {anahtar} yazılır, değer `GESPA.usta.examples(config)`'ten
  (node ile) okunur ve <data data-ex> olarak basılır; test aynı işlevle karşılaştırır.
- Kabuk (head/menü/alt bilgi) pwm-mppt-sarj-kontrol-farki.html'den alınır; JSON-LD, footer ve
  tarihler build.js'e aittir (LD:STATIC bloğu boş yazılır, build doldurur).
- Yeni iniş sayfası: PAGES'e sözlük + build.js USTA_PAGES listesine slug. Sayfaları ELLE DÜZENLEME.

KURALLAR (CLAUDE.md "Elektrikçi Çantası")
- Standart tablosu, yönetmelik iddiası, izin verilen gerilim düşümü, akım taşıma kapasitesi,
  sigorta değeri, akü tipine göre DoD YAZILMAZ. Yalnız tanım/fizik formülü + etiketten girilen değer.
- Katsayı ve açılış değeri config.calc.usta'dadır; cihaz güçleri yalnız config.builder.appliances'tan.
"""
import json, os, re, subprocess, sys
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+os.sep
APPLY='--uygula' in sys.argv
MARK='<!-- USTA:GEN — tools/usta-sayfalar.py üretir; elle düzenlemeyin -->'
PUB=('2026-11-23','23 Kasım 2026')
SHELL=open(ROOT+'pwm-mppt-sarj-kontrol-farki.html',encoding='utf8').read()
def shell(slug,title,desc,ogt,ogd):
    assert len(title)<=60,(slug,len(title),title)
    assert len(desc)<=160,(slug,len(desc),desc)
    head=SHELL[:SHELL.index('<main id="main" data-article>')]; foot=SHELL[SHELL.index('  </main>'):]
    head=re.sub(r'<title>.*?</title>',lambda m:'<title>'+title+'</title>',head)
    head=re.sub(r'<meta name="description" content="[^"]*"',lambda m:'<meta name="description" content="'+desc+'"',head)
    head=re.sub(r'<meta property="og:title" content="[^"]*"',lambda m:'<meta property="og:title" content="'+ogt+'"',head)
    head=re.sub(r'<meta property="og:description" content="[^"]*"',lambda m:'<meta property="og:description" content="'+ogd+'"',head)
    head=head.replace('pwm-mppt-sarj-kontrol-farki',slug)
    head=re.sub(r'<meta property="article:published_time" content="[^"]*"','<meta property="article:published_time" content="'+PUB[0]+'"',head)
    ld='  <!-- LD:STATIC — build.js config\'ten üretir; elle düzenlemeyin -->\n  <!-- /LD:STATIC -->\n'
    if os.path.exists(ROOT+slug+'.html'):   # var olan şema bloğu korunur: build tarihleri oradan okur, değişmeyen sayfa aynı kalır
        m=re.search(r'[ \t]*<!-- LD:STATIC[\s\S]*?/LD:STATIC -->\n?',open(ROOT+slug+'.html',encoding='utf8').read())
        if m: ld=m.group(0)
    head=re.sub(r'[ \t]*<!-- LD:STATIC[\s\S]*?/LD:STATIC -->\n?',lambda m:ld,head)
    foot=foot.replace('  <script defer src="assets/main.js"></script>','  <script defer src="assets/main.js"></script>\n  <script defer src="assets/usta.js"></script>')
    return head,foot
def cta(h,p): return '<section class="cta-band"><div class="container cta-inner reveal"><div><h2>'+h+'</h2><p>'+p+'</p></div><a class="btn btn-lg btn-light" data-c-wa href="https://wa.me/905437434209" target="_blank" rel="noopener">WhatsApp\'tan yazın</a></div></section>\n'
CTA=cta('Malzeme listenizi yazın, fiyatını çıkaralım','Panel, şarj kontrol cihazı, kablo ve konnektör için usta ve toplu alım fiyatını WhatsApp\'tan isteyin.')
def ex(k): return '<data data-ex="%s" value="%s">%s</data>'%(k,EX[k],EX[k])
EX=json.loads(subprocess.check_output(['node','-e',"const vm=require('vm'),fs=require('fs');const sb={window:{}};vm.runInNewContext(fs.readFileSync('assets/config.js','utf8'),sb);vm.runInNewContext(fs.readFileSync('assets/usta.js','utf8'),sb);console.log(JSON.stringify(sb.window.GESPA.usta.examples(sb.window.GESPA.config)))"],cwd=ROOT).decode('utf8'))
def X(t): return re.sub(r'\{([a-zA-Z0-9./]+)\}',lambda m:ex(m.group(1)),t)

DISC='<p class="usta-disc">Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili elektrikçi ya da mühendis tarafından yapılır.</p>'
def tail(tool,formula,rel):
    return ('<p class="usta-formula"><strong>Formül:</strong> '+formula+'</p>\n'+DISC+'\n'
      '<p class="usta-rel"><strong>İlgili:</strong> '+rel+'</p>\n'
      '<p class="usta-pro"><span>Usta / toplu alım fiyatı için:</span> <a class="usta-link" data-usta-pro data-c-wa href="https://wa.me/905437434209" target="_blank" rel="noopener">WhatsApp\'tan yazın</a> <button type="button" class="usta-link" data-usta-cb hidden>📞 Beni arayın</button> <a class="usta-link" data-usta-wa="'+tool+'" href="#" target="_blank" rel="noopener" hidden>📲 Bu sonucu WhatsApp\'tan gönder</a></p>')
def fld(id,label,attrs='',small=''):
    return '<div class="field"><label for="%s">%s%s</label><input id="%s" type="number" inputmode="decimal" step="any" %s/></div>'%(id,label,(' <small>'+small+'</small>') if small else '',id,attrs)
def res(id,label,hi=False,boxid=''):
    return '<div class="result%s"%s><span class="r-label">%s</span><span class="r-value" id="%s">—</span></div>'%(' highlight' if hi else '',(' id="'+boxid+'"') if boxid else '',label,id)
def row(*a): return '<div class="row">'+''.join(a)+'</div>'
TOOLS={}; NAMES={}
KW={'egim':'panel açısı eğim derece güneş yüksekliği enlem yaz kış tilt','kablo':'dc kablo kesiti gerilim düşümü güç kaybı mm2 solar kablo','dizi':'string seri panel sayısı voc soğuk mppt giriş gerilimi',
 'seri-paralel':'seri paralel bağlantı şema panel volt amper watt','aku':'akü bankası seri paralel bağlama ah kwh batarya','sigorta':'dizi sigortası string fuse ters akım isc',
 'cevirici':'çevirici watt amper ah wh kwh hp beygir kw awg mm2','kontrol':'kontrol listesi montaj checklist mc4 polarite yazdır pdf',
 'ac-kablo':'ac kablo gerilim düşümü tek faz üç faz trifaze monofaze 230 400 cos','akim':'akım hesabı amper yük trifaze monofaze dc kw kva güç cos','ohm':'ohm kanunu direnç volt amper watt güç',
 'sarj-kontrol':'şarj kontrol cihazı regülatör mppt pwm kaç amper','aku-sure':'akü kaç saat dayanır süre yük dod inverter batarya','aku-sarj':'akü kaç saatte dolar şarj süresi panel güneşli saat',
 'c-orani':'c oranı c rate şarj deşarj akımı 0.5c 1c lityum','gunluk-uretim':'panel günde kaç kwh üretir günlük üretim güneş saati kwp','sicaklik-gucu':'sıcaklık panel gücü güç kaybı sıcaklık katsayısı noct hücre',
 'golge':'gölge uzunluğu engel baca direk parapet gölgelenme','cati-egimi':'çatı eğimi derece yüzde oran meyil','yuk-listesi':'cihaz listesi yük listesi günlük tüketim wh panel akü inverter kaç watt karavan bağ evi',
 'inverter-aku-akimi':'inverter invertör aküden kaç amper çeker akü akımı','sigorta-kablo-uyumu':'sigorta kablo uyumu ib in iz şalter otomat koruma','hp-kw-amper':'hp beygir kw amper motor akımı pompa','cihaz-tuketimi':'cihaz kaç kwh harcar elektrik tüketimi fatura tl maliyet'}
def tool(id,h2,intro,left,right,formula,rel,store=None,kw=None):
    """Araç bölümü. right=None → tek kart. store=PARTS → merkezde olmayan parça (iniş sayfası için)."""
    name=re.sub(r'^\d+\.\s*','',h2); NAMES[id]=name
    cards='<div class="calc-card usta-card">%s</div>\n'%left+('<div class="calc-card usta-card">%s</div>\n'%right if right else '')
    owner=id if store is None else 'cevirici'
    html=('<section class="usta-tool" id="%s" data-usta-tool="%s" data-kw="%s">\n<h3>%s</h3>\n%s\n<!--OWN:%s-->\n<div class="usta-grid%s">\n%s</div>\n%s\n</section>\n'
            %(id,owner,kw or KW[id],name,X(intro),id,'' if right else ' one',cards,tail(owner,formula,rel)))
    (TOOLS if store is None else store)[id]=html
    return html
PARTS={}
def svg(id): return '<div class="usta-svg" id="%s" aria-live="off"></div>'%id
def msg(id): return '<p class="usta-msg" id="%s" hidden></p>'%id

T=[]
T.append(tool('egim','1. Panel eğim açısı ve öğle güneşi yüksekliği',
 '<p>Güneşin öğle vakti ufuktan yüksekliği enleme ve mevsime bağlıdır: yüksekliği 90 − enlem alın, yaz gündönümünde deklinasyonu ({egim.dec}°) ekleyin, kış gündönümünde çıkarın. Panel eğimi için sahada kullanılan <strong>pratik kural</strong> ise şudur: yıl boyu kullanım için eğim ≈ enlem, yaz ağırlıklı kullanım için enlem − {egim.delta}°, kış ağırlıklı kullanım için enlem + {egim.delta}°.</p>\n'
 '<p class="art-formula">Örnek, enlem {egim.lat}°: yaz 90 − {egim.lat} + {egim.dec} = {egim.summer}° · ekinoks 90 − {egim.lat} = {egim.equinox}° · kış 90 − {egim.lat} − {egim.dec} = {egim.winter}°<br />Pratik eğim: yıl boyu ≈ {egim.tiltYear}° · yaz ≈ {egim.tiltSummer}° · kış ≈ {egim.tiltWinter}°</p>',
 '<h3 class="tool-title">Enlem</h3>'+row(fld('ugLat','Enlem (° kuzey)','min="0" max="90"'),
   '<div class="field"><label for="ugCity">Şehirden seç</label><select id="ugCity"><option value="">Elle giriyorum</option></select></div>')
 +'<div class="field"><span class="usta-lbl" id="ugSeasonLbl">Şemadaki mevsim</span><div class="usta-seg" role="group" aria-labelledby="ugSeasonLbl"><button type="button" data-season="summer" aria-pressed="false">☀️ Yaz</button><button type="button" class="active" data-season="equinox" aria-pressed="true">🌤️ İlkbahar / Sonbahar</button><button type="button" data-season="winter" aria-pressed="false">❄️ Kış</button></div></div>'
 +'<p class="tool-hint">Eğim, panelin yatayla yaptığı açıdır; panel güneye bakar. Pratik kural bir başlangıç değeridir: çatı eğimi, gölge ve kullanım mevsimi sonucu değiştirir.</p>'+msg('ugWarn'),
 '<div class="calc-results usta-res3">'+res('ugSummer','Yaz gündönümü')+res('ugEquinox','Ekinoks')+res('ugWinter','Kış gündönümü')+'</div>'
 +'<p class="usta-sub">Pratik kural eğimleri</p><div class="calc-results usta-res3">'+res('ugTiltYear','Yıl boyu')+res('ugTiltSummer','Yaz')+res('ugTiltWinter','Kış')+'</div>'+svg('ugSvg'),
 'öğle güneş yüksekliği = 90 − enlem ± deklinasyon (yaz +, kış −, ekinoks 0) · pratik kural eğimi: yıl boyu ≈ enlem, yaz ≈ enlem − '+ex('egim.delta')+'°, kış ≈ enlem + '+ex('egim.delta')+'°',
 '<a href="hesaplayici.html#alet-cantasi">Sıra aralığı ve gölgelenme aracı</a> · <a href="hesaplayici.html#alet-cantasi">Panel yerleşim planlayıcı</a> · <a href="sozluk.html#golgelenme">Gölgelenme nedir?</a> · <a href="online-satis.html?kategori=panel">Güneş panelleri</a>'))

T.append(tool('kablo','2. DC kablo kesiti, gerilim düşümü ve güç kaybı',
 '<p>Kablo bir dirençtir: üzerinden akım geçtikçe gerilim düşer ve aradaki fark ısıya dönüşür. Hattın direnci R = 2 × L × ρ ÷ S ile bulunur (L tek yön uzunluk, 2 çarpanı gidiş-dönüş içindir; bakır için ρ = {kablo.rho} Ω·mm²/m). Gerilim düşümü I × R, ısıya giden güç I² × R olur. Bu araç gerilim düşümünü %{kablo.target} altında tutan en küçük kesiti de gösterir.</p>\n'
 '<p class="art-formula">Örnek: {kablo.v} V, {kablo.i} A, tek yön {kablo.len} m, {kablo.s} mm² · R = 2 × {kablo.len} × {kablo.rho} ÷ {kablo.s} = {kablo.r} Ω<br />Gerilim düşümü = {kablo.i} × {kablo.r} = {kablo.drop} V (%{kablo.pct}) · ısı kaybı = {kablo.i}² × {kablo.r} = {kablo.loss} W · %{kablo.target} hedefi için en küçük kesit: {kablo.rec} mm²</p>\n'
 '<p><strong>Önemli:</strong> bu hesap yalnızca gerilim düşümüne bakar. Kablonun taşıyabileceği akım (döşeme şekli, ortam sıcaklığı, demet sayısı) ayrı bir kontroldür; onun için kablo üreticisinin akım taşıma tablosuna bakılır ve tasarımı yetkili elektrikçi ya da mühendis yapar.</p>',
 '<h3 class="tool-title">Hat bilgileri</h3>'+row(fld('ukV','Sistem gerilimi (V)','min="0"'),fld('ukI','Akım (A)','min="0"'))
 +row(fld('ukLen','Kablo uzunluğu, tek yön (m)','min="0"'),'<div class="field"><label for="ukS">Kesit (mm²)</label><select id="ukS"></select></div>')+msg('ukMsg'),
 '<div class="calc-results">'+res('ukRec','Hedefi karşılayan en küçük kesit',True)+res('ukDrop','Gerilim düşümü')+res('ukPct','Gerilim düşümü (%)')+res('ukLoss','Isıya giden güç')+'</div>'+svg('ukSvg'),
 'R = 2 × L × ρ ÷ S · gerilim düşümü = I × R · % = düşüm ÷ V × 100 · ısı kaybı = I² × R · ρ (bakır) = '+ex('kablo.rho')+' Ω·mm²/m · hedef ≤ %'+ex('kablo.target'),
 '<a href="hesaplayici.html#alet-cantasi">DC kablo kesiti aracı (tüm kesitlerin tablosu)</a> · <a href="kablo-solar-5m.html">Solar kablo takımı 5 m + 5 m</a> · <a href="mc4-set.html">MC4 konnektör takımı</a> · <a href="online-satis.html?kategori=kablo">Kablo ve konnektörler</a>'))

T.append(tool('dizi','3. Dizi (string) hesabı: kaç panel seri bağlanır?',
 '<p>Panel soğudukça açık devre gerilimi (Voc) yükselir. Seri dizinin en soğuk havadaki Voc toplamı, şarj kontrol cihazının ya da inverterin en yüksek PV giriş gerilimini <strong>hiçbir zaman</strong> aşmamalıdır. Soğuk Voc, etiketteki Voc ile Voc sıcaklık katsayısından (β, %/°C, eksi işaretli) hesaplanır; etiket değerleri {dizi.stc} °C içindir. En az panel sayısı ise dizinin Vmp toplamının MPPT alt geriliminin üstünde kalmasına göre bulunur.</p>\n'
 '<p class="art-formula">Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Voc {dizi.voc} V, Vmp {dizi.vmp} V, β {dizi.beta} %/°C, en düşük sıcaklık {dizi.tmin} °C, giriş sınırı {dizi.vmax} V, MPPT alt sınırı {dizi.mpptMin} V<br />Soğuk Voc = {dizi.voc} × (1 + ({dizi.beta}) ÷ 100 × ({dizi.tmin} − {dizi.stc})) = {dizi.cold} V · en çok ⌊{dizi.vmax} ÷ {dizi.cold}⌋ = {dizi.max} panel · en az ⌈{dizi.mpptMin} ÷ {dizi.vmp}⌉ = {dizi.min} panel<br />{dizi.max} panel seri: soğuk Voc {dizi.strVoc} V, Vmp {dizi.strVmp} V · {dizi.maxPlus} panel olsaydı {dizi.over} V ile sınır aşılırdı</p>\n'
 '<p>Sıcak havada Vmp etiket değerinin altına düşer; en az panel sayısını belirlerken panelin künyesindeki Vmp sıcaklık katsayısına ve cihazın çalışma aralığına ayrıca bakın. Değerleri her zaman kendi panelinizin ve cihazınızın etiketinden girin.</p>',
 '<h3 class="tool-title">Panel etiketi</h3>'+row(fld('udVoc','Voc (V)','min="0"'),fld('udVmp','Vmp (V)','min="0"'))
 +row(fld('udIsc','Isc (A)','min="0"'),fld('udBeta','Voc sıcaklık katsayısı (%/°C)','max="0"','eksi'))
 +fld('udTmin','Beklenen en düşük hava sıcaklığı (°C)')
 +'<h3 class="tool-title">Şarj kontrol cihazı / inverter etiketi</h3>'+row(fld('udVmax','En yüksek PV giriş gerilimi (V)','min="0"'),fld('udMppt','MPPT alt gerilimi (V)','min="0"'))
 +fld('udN','Seri bağlanacak panel sayısı','min="1" step="1"','boşsa en çok sayı')
 +'<p class="tool-hint"><button type="button" class="usta-link" id="udFill">Örnek değerleri doldur</button> Örnek değerler yuvarlak sayılardır, bir ürüne ait değildir.</p>',
 '<div class="calc-results">'+res('udMax','En çok seri panel',True)+res('udCold','Soğuk Voc (panel başı)')+res('udMin','En az seri panel')+res('udStrVoc','Dizi soğuk Voc')+res('udStrVmp','Dizi Vmp (etiket)')+'</div>'+msg('udWarn')+svg('udSvg'),
 'soğuk Voc = Voc × (1 + β ÷ 100 × (T<sub>min</sub> − '+ex('dizi.stc')+')) · en çok seri = ⌊V<sub>maks giriş</sub> ÷ soğuk Voc⌋ · en az seri = ⌈V<sub>MPPT alt</sub> ÷ Vmp⌉ · dizi gerilimi = panel sayısı × panel gerilimi',
 '<a href="pwm-mppt-sarj-kontrol-farki.html">PWM mi MPPT mi? Cihaz seçim rehberi</a> · <a href="online-satis.html?kategori=sarj-kontrol">Şarj kontrol cihazları</a> · <a href="havensis-mppt-60a-150v.html">150 V girişli 60 A MPPT</a> · <a href="sozluk.html#voc-isc">Voc ve Isc nedir?</a>'))

T.append(tool('seri-paralel','4. Seri–paralel panel bağlantı şeması',
 '<p>Seri bağlamada gerilimler toplanır, akım aynı kalır; paralel bağlamada akımlar toplanır, gerilim aynı kalır. Önce paneller seri bağlanarak dizi (string) kurulur, sonra eş diziler paralellenir. Toplam güç, toplam gerilim ile toplam akımın çarpımıdır.</p>\n'
 '<p class="art-formula">Örnek: Vmp {seri.v} V, Imp {seri.a} A panel (<a href="panel-360w.html">360 W panel künyesi</a>), {seri.s} seri × {seri.p} paralel<br />Gerilim = {seri.v} × {seri.s} = {seri.totV} V · akım = {seri.a} × {seri.p} = {seri.totA} A · güç = {seri.totV} × {seri.totA} = {seri.totW} W</p>',
 '<h3 class="tool-title">Panel ve dizilim</h3>'+row(fld('usV','Panel gerilimi (V)','min="0"','Vmp'),fld('usA','Panel akımı (A)','min="0"','Imp'))
 +row(fld('usS','Dizideki seri panel sayısı','min="1" step="1"'),fld('usP','Paralel dizi sayısı','min="1" step="1"'))
 +'<p class="tool-hint">Paralellenen dizilerde panel sayısı ve panel tipi aynı olmalıdır. Dizi geriliminin cihaza uygunluğu için <a href="#dizi">dizi hesabına</a>, paralel dizilerde sigorta için <a href="#sigorta">sigorta kontrolüne</a> bakın.</p>',
 '<div class="calc-results usta-res3">'+res('usTotV','Toplam gerilim')+res('usTotA','Toplam akım')+res('usTotW','Toplam güç')+'</div>'+svg('usSvg')+msg('usNote'),
 'toplam gerilim = panel gerilimi × seri sayısı · toplam akım = panel akımı × paralel dizi sayısı · toplam güç = toplam gerilim × toplam akım',
 '<a href="mc4-set.html">MC4 konnektör takımı</a> · <a href="kablo-solar-5m.html">Solar kablo takımı</a> · <a href="sozluk.html#dizi">Dizi (string) nedir?</a> · <a href="sistem-kur.html">Sistem Kurucu</a>'))

T.append(tool('aku','5. Akü bankası: seri ve paralel akü bağlama',
 '<p>Aküler seri bağlanınca gerilim toplanır, kapasite (Ah) aynı kalır; paralel bağlanınca kapasite toplanır, gerilim aynı kalır. Depolanan enerji kWh = banka gerilimi × banka Ah ÷ 1000 ile bulunur ve bağlantı şekline göre değişmez.</p>\n'
 '<p class="art-formula">Örnek: {aku.v} V {aku.ah} Ah akü, {aku.s} seri × {aku.p} paralel<br />Banka gerilimi = {aku.v} × {aku.s} = {aku.totV} V · kapasite = {aku.ah} × {aku.p} = {aku.totAh} Ah · enerji = {aku.totV} × {aku.totAh} ÷ 1000 = {aku.kwh} kWh</p>\n'
 '<p><strong>Güvenlik:</strong> aynı bankada yalnızca aynı tip, aynı yaşta ve aynı kapasitede aküler kullanılır; farklı aküler karıştırılmaz. Lityum akülerin seri ya da paralel bağlanıp bağlanamayacağını akü üreticisinin talimatından teyit edin.</p>',
 '<h3 class="tool-title">Akü ve dizilim</h3>'+row(fld('uaV','Tek akü gerilimi (V)','min="0"'),fld('uaAh','Tek akü kapasitesi (Ah)','min="0"'))
 +row(fld('uaS','Seri akü sayısı','min="1" step="1"'),fld('uaP','Paralel kol sayısı','min="1" step="1"'))
 +'<p class="tool-hint">Kullanılabilir enerji, akü tipinin izin verdiği deşarj derinliğine göre daha azdır; akü boyutlandırma için <a href="hesaplayici.html#alet-cantasi">batarya aracına</a> bakın.</p>',
 '<div class="calc-results usta-res3">'+res('uaTotV','Banka gerilimi')+res('uaTotAh','Kapasite')+res('uaKwh','Enerji')+'</div>'+svg('uaSvg')+msg('uaNote'),
 'banka gerilimi = akü gerilimi × seri sayısı · kapasite (Ah) = akü Ah × paralel kol sayısı · enerji (kWh) = banka gerilimi × kapasite ÷ 1000',
 '<a href="hesaplayici.html#alet-cantasi">Batarya boyutlandırma aracı</a> · <a href="aku-titanx-51v-102ah.html">51,2 V 102 Ah LiFePO₄ akü</a> · <a href="off-grid-gunes-sistemi-boyutlandirma.html">Off-grid boyutlandırma rehberi</a> · <a href="sozluk.html#dod">DoD nedir?</a>'))

T.append(tool('sigorta','6. Dizi sigortası gerekir mi?',
 '<p>Paralel bağlı dizilerden biri arızalanırsa (örneğin kısa devre), diğer sağlam diziler akımlarını o diziye doğru verebilir. Arızalı diziye akabilecek ters akım en çok (N − 1) × Isc kadardır (N paralel dizi sayısı). Bu değer, panel etiketinde yazan <strong>en yüksek seri sigorta</strong> değerini aşıyorsa her diziye sigorta gerekir.</p>\n'
 '<p class="art-formula">Örnek: Isc {sigorta.isc} A, etikette en yüksek seri sigorta {sigorta.max} A (<a href="panel-360w.html">360 W panel künyesi</a>)<br />{sigorta.n} paralel dizi: ({sigorta.n} − 1) × {sigorta.isc} = {sigorta.rev} A → dizi sigortası {sigorta.verdict}<br />{sigorta.n1} paralel dizi: ({sigorta.n1} − 1) × {sigorta.isc} = {sigorta.revLess} A → {sigorta.verdictLess}</p>\n'
 '<p>Bu araç <strong>yalnızca bu tek kontrolü</strong> yapar. Sigortanın akım değeri, tipi ve diğer koruma elemanları panel ve cihaz üreticisinin talimatına göre, tasarımı yapan yetkili kişi tarafından seçilir.</p>',
 '<h3 class="tool-title">Dizi bilgileri</h3>'+fld('ufN','Paralel dizi sayısı (N)','min="1" step="1"')+row(fld('ufIsc','Panel Isc (A)','min="0"'),fld('ufMax','Etiketteki maks. seri sigorta (A)','min="0"'))
 +'<p class="tool-hint">"Maksimum seri sigorta" (maximum series fuse rating) değeri panelin arka etiketinde ve künyesinde yazar.</p>',
 '<div class="calc-results">'+res('ufVerdict','Sonuç',True,'ufVerdictBox')+res('ufRev','Arızalı diziye akabilecek ters akım')+'</div>'+msg('ufMsg')+svg('ufSvg'),
 'ters akım = (N − 1) × Isc · ters akım &gt; etiketteki en yüksek seri sigorta değeri ise dizi sigortası gerekir',
 '<a href="#seri-paralel">Seri–paralel şema</a> · <a href="mc4-set.html">MC4 konnektör takımı</a> · <a href="sozluk.html#voc-isc">Isc nedir?</a> · <a href="toptan.html">Toptan satış</a>'))

CEV_WA='<h3 class="tool-title">Watt ↔ Amper</h3><div class="usta-row3">'+fld('ucV1','Gerilim (V)','min="0"')+fld('ucW','Güç (W)','min="0"')+fld('ucA','Akım (A)','min="0"')+'</div>'
CEV_AH='<h3 class="tool-title">Ah ↔ Wh</h3><div class="usta-row3">'+fld('ucV2','Gerilim (V)','min="0"')+fld('ucAh','Kapasite (Ah)','min="0"')+fld('ucWh','Enerji (Wh)','min="0"')+'</div><p class="usta-out" id="ucKwh"></p>'
CEV_HP='<h3 class="tool-title">HP ↔ kW</h3>'+row(fld('ucHp','Beygir gücü (HP)','min="0"'),fld('ucKw','Kilovat (kW)','min="0"'))
CEV_AWG=('<h3 class="tool-title">AWG ↔ mm²</h3>'+row('<div class="field"><label for="ucAwg">AWG numarası</label><select id="ucAwg"></select></div>',fld('ucMm2','Kesit (mm²)','min="0"'))
 +'<p class="usta-out" id="ucAwgOut">—</p><p class="usta-out" id="ucMmOut">—</p>'+svg('ucSvg'))
F_AWG='AWG çapı (mm) = 0,127 × 92<sup>(36 − n) ÷ 39</sup> · kesit = π × d² ÷ 4'
T=[]
T.append(tool('cevirici','Hızlı çeviriciler: W–A, Ah–Wh, HP–kW, AWG–mm²',
 '<p>Sahada en çok sorulan dört çevirme. Hepsi tanım formülüdür; iki yönlü alanlarda hangisini yazarsanız diğeri hesaplanır.</p>\n'
 '<p class="art-formula">{cev.w} W ÷ {cev.v} V = {cev.a} A · {cev.ah} Ah × {cev.v} V = {cev.wh} Wh = {cev.kwhAh} kWh · {cev.hp} HP ÷ {cev.hpPerKw} = {cev.kw} kW<br />AWG {cev.awg}: çap = 0,127 × 92<sup>(36 − {cev.awg}) ÷ 39</sup> = {cev.awgD} mm, kesit = π × çap² ÷ 4 = {cev.awgA} mm²</p>\n'
 '<p>AWG ile metrik kesitler birebir örtüşmez; metrik kablo seçerken hesaplanan mm² değerinin altına inilmez.</p>',
 CEV_WA+CEV_AH+CEV_HP,CEV_AWG,
 'A = W ÷ V · Wh = Ah × V · kW = HP ÷ '+ex('cev.hpPerKw')+' · '+F_AWG,
 '<a href="#kablo">Kablo kesiti ve güç kaybı</a> · <a href="#inverter-aku-akimi">İnverterin akü akımı</a> · <a href="#hp-kw-amper">HP → kW → amper</a> · <a href="sozluk.html#kwh">kWh nedir?</a>'))
# İniş sayfaları için tek kartlık parçalar (merkezde #cevirici içinde aynı kartlar durur)
tool('awg-mm2','AWG ↔ mm² çevirici',
 '<p class="art-formula">AWG {cev.awg}: çap = 0,127 × 92<sup>(36 − {cev.awg}) ÷ 39</sup> = {cev.awgD} mm · kesit = π × çap² ÷ 4 = {cev.awgA} mm²</p>',
 CEV_AWG,None,F_AWG,'<a href="#kablo">Kablo kesiti ve güç kaybı</a> · <a href="#cevirici">Diğer çeviriciler</a> · <a href="kablo-solar-5m.html">Solar kablo takımı</a>',store=PARTS,kw='awg mm2')
tool('ah-wh','Ah ↔ Wh / kWh çevirici',
 '<p class="art-formula">{cev.ah} Ah × {cev.v} V = {cev.wh} Wh = {cev.kwhAh} kWh</p>',
 CEV_AH,None,'Wh = Ah × V · kWh = Wh ÷ 1000 · Ah = Wh ÷ V','<a href="#aku-sure">Akü kaç saat dayanır?</a> · <a href="#aku">Akü bankası bağlama</a> · <a href="#cevirici">Diğer çeviriciler</a>',store=PARTS,kw='ah wh kwh')

tool('inverter-aku-akimi','İnverter aküden kaç amper çeker?',
 '<p>İnverter, AC yükün gücünü aküden DC olarak çeker; akü gerilimi düşük olduğu için akım yüksektir: I = yük gücü ÷ (akü gerilimi × inverter verimi). Verim bir varsayımdır ve inverterin künyesinden alınır.</p>\n'
 '<p class="art-formula">Örnek: {cev.w} W yük, {cev.v} V akü, verim %{cev.eta} (varsayım) → {cev.w} ÷ ({cev.v} × {cev.etaDec}) = {cev.inv} A</p>\n'
 '<p>Bu akım akü ile inverter arasındaki kablodan geçer; kabloyu kısa tutun ve hesaplanan akımı <a href="#kablo">DC kablo aracına</a> aktarıp gerilim düşümüne bakın. Kablonun akım taşıma kapasitesi ve sigorta değeri için inverter ve kablo üreticisinin verisi esastır; bu araç sigorta değeri önermez. Motorlu yüklerin kalkış akımı hesaba dahil değildir.</p>',
 '<h3 class="tool-title">Yük ve akü</h3><div class="usta-row3">'+fld('ucP','Yük (W)','min="0"')+fld('ucVb','Akü gerilimi (V)','min="0"')+fld('ucEta','İnverter verimi (%)','min="1" max="100"','varsayım')+'</div>',
 '<div class="calc-results">'+res('ucIb','Akü tarafı akımı',True)+'</div><p class="tool-hint"><button type="button" class="usta-link" id="ucToCable" hidden>Bu akımı DC kablo aracına aktar →</button></p><p class="tool-hint">Verim bir varsayımdır; inverterinizin künyesindeki değeri yazın.</p>',
 'akü akımı = yük gücü (W) ÷ (akü gerilimi (V) × inverter verimi)',
 '<a href="#kablo">DC kablo kesiti ve gerilim düşümü</a> · <a href="#aku-sure">Akü kaç saat dayanır?</a> · <a href="hesaplayici.html#alet-cantasi">İnverter boyutlandırma aracı</a> · <a href="lexron-guc-istasyonu-1200w.html">1200 W güç istasyonu</a>')

CHK=[('ayirici','DC ayırıcı ve akü sigortası açık (devre kesik); çalışma bitene kadar kapatılmayacak.'),
('ortu','Bağlantı yapılırken paneller örtülü ya da ışık almıyor: güneş gören panel gerilim üretir.'),
('polarite','Her dizinin artı ve eksi ucu, cihaza bağlanmadan önce ölçü aletiyle kontrol edildi.'),
('voc','Dizinin açık devre gerilimi ölçüldü; panel sayısı × Voc ile uyumlu ve cihazın giriş sınırının altında.'),
('mc4','MC4 konnektörler sonuna kadar oturdu (klik sesi), hafifçe çekilerek denendi.'),
('tip','Yalnızca aynı tip ve aynı üreticinin konnektörleri birbirine takıldı; farklı tipler karıştırılmadı.'),
('pense','Konnektör pimleri uygun sıkma pensesiyle sıkıldı; kablo pimden çekilince çıkmıyor.'),
('gergi','Kablolar gergin değil; keskin kenara sürtünmüyor, kelepçeyle sabitlendi.'),
('su','Konnektörler su birikebilecek yerde durmuyor; boşta kalan uçlar kapaklı.'),
('tork','Klemens, pabuç ve akü kutup başı sıkılıkları üreticinin tork değerine göre yeniden kontrol edildi.'),
('sira','Bağlantı sırası cihazın kullanım kılavuzundaki sıraya göre yapıldı.'),
('aku','Akü tipi ve gerilimi cihazın ayarıyla aynı; şarj profili akü üreticisinin değerlerine göre seçildi.'),
('etiket','Panel ve cihaz etiketlerinin fotoğrafı çekildi (seri no, Voc, Isc, giriş sınırı).'),
('sema','Bağlantılar devreye almadan önce şemayla bir kez daha karşılaştırıldı.')]
chk_html='<ul class="usta-check">'+''.join('<li><label><input type="checkbox" data-chk="%s" /> <span>%s</span></label></li>'%c for c in CHK)+'</ul>'
NAMES['kontrol']='Montaj öncesi kontrol listesi'
T.append('<section class="usta-tool" id="kontrol" data-usta-tool="kontrol" data-kw="'+KW['kontrol']+'">\n<h3>Montaj öncesi kontrol listesi</h3>\n'
 '<p>Devreye almadan önce sahada tek tek işaretlenecek '+str(len(CHK))+' pratik kontrol. İşaretler bu cihazda saklanır; liste yazdırılabilir ya da PDF olarak kaydedilebilir. Liste pratik saha alışkanlıklarını toplar; yürürlükteki yönetmeliklerin ve üretici talimatlarının yerine geçmez.</p>\n'
 '<div class="usta-grid usta-grid-chk">\n<div class="calc-card usta-card">'+chk_html+'</div>\n'
 '<div class="calc-card usta-card usta-chk-side">'+svg('ukcSvg')+'<p class="usta-out" id="ukcState"></p>'
 '<div class="usta-actions"><button class="btn btn-ghost btn-sm" id="ustaPrint" type="button">🖨️ Yazdır / PDF</button><a class="btn btn-ghost btn-sm" id="ustaWa" data-usta-wa="" href="#" target="_blank" rel="noopener" hidden>📲 Son kullandığınız aracın sonucunu gönder</a><button class="usta-link" id="ukcReset" type="button">İşaretleri temizle</button></div>'
 '<p class="tool-hint">Yazdırınca bütün araçların o anki girdi ve sonuçları da kâğıda çıkar.</p></div>\n</div>\n'
 +DISC+'\n<p class="usta-rel"><strong>İlgili:</strong> <a href="mc4-set.html">MC4 konnektör takımı</a> · <a href="kablo-solar-5m.html">Solar kablo takımı</a> · <a href="sistem-kur.html">Sistem Kurucu</a> · <a href="rehberler.html">Tüm rehberler</a></p>\n'
 '<p class="usta-pro"><span>Usta / toplu alım fiyatı için:</span> <a class="usta-link" data-usta-pro data-c-wa href="https://wa.me/905437434209" target="_blank" rel="noopener">WhatsApp\'tan yazın</a> <button type="button" class="usta-link" data-usta-cb hidden>📞 Beni arayın</button></p>\n</section>\n')

TOOLS['kontrol']=T[-1].replace('<h3>Montaj öncesi kontrol listesi</h3>\n','<h3>Montaj öncesi kontrol listesi</h3>\n<!--OWN:kontrol-->\n')

def sel(id,label,opts): return '<div class="field"><label for="%s">%s</label><select id="%s">%s</select></div>'%(id,label,id,''.join('<option value="%s">%s</option>'%o for o in opts))
SHOP_CC='<a href="online-satis.html?kategori=sarj-kontrol">Şarj kontrol cihazları</a>'

tool('ac-kablo','AC kablo gerilim düşümü: tek faz ve üç faz',
 '<p>Alternatif akım hattında gerilim düşümü tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S ile hesaplanır (L tek yön uzunluk, bakır için ρ = {ac.rho} Ω·mm²/m). Yüzde, tek fazda faz-nötr gerilimine ({ac.v1} V), üç fazda faz-faz gerilimine ({ac.v3} V) göre verilir.</p>\n'
 '<p class="art-formula">Örnek: {ac.i} A, tek yön {ac.len} m, {ac.s} mm² bakır, cosφ {ac.cos}<br />Tek faz: 2 × {ac.i} × {ac.len} × {ac.rho} × {ac.cos} ÷ {ac.s} = {ac.drop1} V → {ac.drop1} ÷ {ac.v1} = %{ac.pct1}<br />Üç faz: √3 × {ac.i} × {ac.len} × {ac.rho} × {ac.cos} ÷ {ac.s} = {ac.drop3} V → {ac.drop3} ÷ {ac.v3} = %{ac.pct3}</p>\n'
 '<p><strong>Sınırlar:</strong> bu bir direnç yaklaşımıdır; kablonun reaktansı ihmal edilir. Uzun hatlarda ve büyük kesitli besleme kablolarında reaktans önem kazanır, hesabı tasarımcı yapar. Araç izin verilen gerilim düşümü sınırını ve kablonun akım taşıma kapasitesini <strong>bilmez</strong>: sınırı projenizden siz yazarsınız, akım kapasitesi için kablo üreticisinin tablosuna bakılır.</p>',
 '<h3 class="tool-title">Hat bilgileri</h3>'+row(sel('xaPhase','Sistem',[('1','Tek faz'),('3','Üç faz')]),fld('xaV','Gerilim (V)','min="0"'))
 +row(fld('xaI','Akım (A)','min="0"'),fld('xaLen','Uzunluk, tek yön (m)','min="0"'))
 +row('<div class="field"><label for="xaS">Kesit (mm², bakır)</label><select id="xaS"></select></div>',fld('xaCos','cosφ','min="0" max="1"'))
 +fld('xaTarget','Projenizdeki gerilim düşümü sınırı (%)','min="0"','isteğe bağlı'),
 '<div class="calc-results">'+res('xaPct','Gerilim düşümü (%)',True)+res('xaDrop','Gerilim düşümü')+res('xaEnd','Hat sonu gerilimi')+res('xaRec','Sınırı karşılayan en küçük kesit')+'</div>'+msg('xaMsg'),
 'tek faz ΔV = 2 × I × L × ρ × cosφ ÷ S · üç faz ΔV = √3 × I × L × ρ × cosφ ÷ S · % = ΔV ÷ V × 100 · ρ (bakır) = '+ex('ac.rho')+' Ω·mm²/m · reaktans ihmal edilir',
 '<a href="#kablo">DC kablo kesiti ve güç kaybı</a> · <a href="#akim">Yükten akım hesabı</a> · <a href="hesaplayici.html#alet-cantasi">İnverter boyutlandırma aracı</a> · <a href="cati-ges.html">Çatı GES hizmeti</a>')

tool('akim','Akım hesabı: güçten akıma (DC, tek faz, üç faz) ve kW–kVA',
 '<p>Yükün çektiği akım, gücün gerilime bölünmesiyle bulunur. Doğru akımda I = P ÷ V; tek fazda I = P ÷ (V × cosφ); üç fazda I = P ÷ (√3 × V × cosφ), burada V faz-faz gerilimidir. Görünür güç ile aktif güç arasındaki ilişki kVA = kW ÷ cosφ şeklindedir.</p>\n'
 '<p class="art-formula">Örnek: {akim.p} W yük, cosφ {akim.cos}<br />Tek faz {ac.v1} V: {akim.p} ÷ ({ac.v1} × {akim.cos}) = {akim.i1} A · üç faz {ac.v3} V: {akim.p} ÷ (√3 × {ac.v3} × {akim.cos}) = {akim.i3} A · DC {akim.dcV} V: {akim.p} ÷ {akim.dcV} = {akim.idc} A<br />{akim.kw} kW ÷ {akim.cos} = {akim.kva} kVA</p>\n'
 '<p>cosφ (güç katsayısı) cihazın etiketinde yazar; bilinmiyorsa varsayım olduğunu unutmayın. Motorlarda kalkış akımı bu değerin üstündedir ve bu hesaba dahil değildir.</p>',
 '<h3 class="tool-title">Güçten akıma</h3>'+row(sel('xbKind','Sistem',[('1','Tek faz AC'),('3','Üç faz AC'),('dc','DC')]),fld('xbP','Güç (W)','min="0"'))
 +row(fld('xbV','Gerilim (V)','min="0"'),fld('xbCos','cosφ','min="0" max="1"'))
 +'<div class="calc-results">'+res('xbI','Akım',True)+'</div>',
 '<h3 class="tool-title">kW ↔ kVA</h3><div class="usta-row3">'+fld('xbCos2','cosφ','min="0" max="1"')+fld('xbKw','Aktif güç (kW)','min="0"')+fld('xbKva','Görünür güç (kVA)','min="0"')+'</div>'
 +'<p class="tool-hint">kW ya da kVA alanından hangisini yazarsanız diğeri hesaplanır.</p>',
 'DC: I = P ÷ V · tek faz: I = P ÷ (V × cosφ) · üç faz: I = P ÷ (√3 × V × cosφ) · kVA = kW ÷ cosφ',
 '<a href="#ac-kablo">AC kablo gerilim düşümü</a> · <a href="#ohm">Ohm kanunu</a> · <a href="#cevirici">Watt ↔ Amper çevirici</a> · <a href="solar-sulama-pompasi-secimi.html">Solar sulama pompası seçimi</a>')

tool('ohm','Ohm kanunu ve güç hesaplayıcı',
 '<p>Gerilim (V), akım (I), direnç (R) ve güç (P) arasındaki iki temel bağıntı V = I × R ve P = V × I\'dir. Dört büyüklükten herhangi ikisi bilinince diğer ikisi bulunur.</p>\n'
 '<p class="art-formula">Örnek: {ohm.v} V ve {ohm.i} A → R = {ohm.v} ÷ {ohm.i} = {ohm.r} Ω · P = {ohm.v} × {ohm.i} = {ohm.p} W</p>',
 '<h3 class="tool-title">Bildiğiniz iki değeri yazın</h3>'+row(fld('xoV','Gerilim V (V)','min="0"'),fld('xoI','Akım I (A)','min="0"'))+row(fld('xoR','Direnç R (Ω)','min="0"'),fld('xoP','Güç P (W)','min="0"'))
 +'<p class="tool-hint"><button type="button" class="usta-link" id="xoClear">Alanları temizle</button></p>'+msg('xoMsg'),
 '<div class="calc-results">'+res('xoOutV','Gerilim')+res('xoOutI','Akım')+res('xoOutR','Direnç')+res('xoOutP','Güç')+'</div>',
 'V = I × R · P = V × I · buradan P = I² × R = V² ÷ R, I = P ÷ V, R = V ÷ I',
 '<a href="#akim">Akım hesabı</a> · <a href="#kablo">Kablo kesiti ve güç kaybı</a> · <a href="#cevirici">Hızlı çeviriciler</a> · <a href="sozluk.html">GES Sözlüğü</a>')

tool('sarj-kontrol','Şarj kontrol cihazı kaç amper olmalı?',
 '<p>MPPT şarj kontrol cihazının aküye vereceği akım, panel dizisinin gücünün akü sistem gerilimine bölünmesiyle bulunur: I = panel gücü ÷ akü gerilimi. Bu, cihazın çıkış akımı için <strong>en az</strong> değerdir; üretici pay bırakılmasını ya da panel gücü sınırını belirtiyorsa o esas alınır.</p>\n'
 '<p class="art-formula">Örnek: {sk.w} W panel dizisi, {sk.v} V akü → {sk.w} ÷ {sk.v} = {sk.i} A</p>\n'
 '<p>Akımın yanında cihazın en yüksek PV giriş gerilimi de kontrol edilir: bunun için <a href="#dizi">dizi hesabını</a> kullanın. PWM cihazlarda akım, bağlanan panellerin toplam Isc değerine göre seçilir.</p>',
 '<h3 class="tool-title">Sistem</h3>'+row(fld('xdW','Panel dizisi gücü (W)','min="0"'),fld('xdV','Akü sistem gerilimi (V)','min="0"')),
 '<div class="calc-results">'+res('xdI','En az çıkış akımı (pay hariç)',True)+'</div><p class="tool-hint">Aynı dizi daha yüksek akü geriliminde daha düşük akım ister: 12 V yerine 24 V akımı yarıya indirir.</p>',
 'şarj akımı = panel dizisi gücü (W) ÷ akü sistem gerilimi (V)',
 '<a href="pwm-mppt-sarj-kontrol-farki.html">PWM mi MPPT mi? Seçim rehberi</a> · '+SHOP_CC+' · <a href="lexron-mppt-40a.html">Lexron 40 A MPPT</a> · <a href="havensis-mppt-60a.html">Havensis 60 A MPPT</a> · <a href="havensis-mppt-60a-150v.html">150 V girişli 60 A MPPT</a>')

tool('aku-sure','Akü kaç saat dayanır?',
 '<p>Akünün bir yükü besleyebileceği süre: saat = (akü gerilimi × Ah × kullanılabilir oran (DoD) × inverter verimi) ÷ yük gücü. DoD, akünün kapasitesinin ne kadarının kullanılabileceğini gösterir ve akü tipine göre değişir; değeri akünün künyesinden alın.</p>\n'
 '<p class="art-formula">Örnek: {sure.v} V {sure.ah} Ah akü, DoD {sure.dod}, inverter verimi {sure.eta}, yük {sure.load} W<br />Kullanılabilir enerji = {sure.v} × {sure.ah} × {sure.dod} × {sure.eta} = {sure.wh} Wh · süre = {sure.wh} ÷ {sure.load} = {sure.h} saat</p>\n'
 '<p>Açılıştaki DoD ve verim, <a href="sistem-kur.html">Sistem Kurucu</a>\'nun lityum akü ve inverter için kullandığı varsayımlardır; kurşun-asit, jel ve AGM akülerde üreticinin önerdiği DoD daha düşüktür. Yük doğrudan DC ise verimi %100 yazın.</p>',
 '<h3 class="tool-title">Akü ve yük</h3>'+row(fld('xeV','Akü gerilimi (V)','min="0"'),fld('xeAh','Kapasite (Ah)','min="0"'))
 +row(fld('xeDod','Kullanılabilir oran, DoD (%)','min="1" max="100"','varsayım'),fld('xeEta','İnverter verimi (%)','min="1" max="100"','varsayım'))
 +fld('xeLoad','Yük gücü (W)','min="0"'),
 '<div class="calc-results">'+res('xeH','Yaklaşık süre',True)+res('xeWh','Kullanılabilir enerji')+'</div><p class="usta-out" id="xeHm"></p><p class="tool-hint">Akü yaşlandıkça ve soğukta kapasite düşer; yüksek akımda kurşun-asit akülerin verdiği kapasite azalır. Sonuç bir üst sınırdır.</p>',
 'süre (saat) = akü gerilimi × Ah × DoD × inverter verimi ÷ yük (W)',
 '<a href="#aku">Akü bankası bağlama</a> · <a href="hesaplayici.html#alet-cantasi">Batarya boyutlandırma aracı</a> · <a href="aku-titanx-51v-102ah.html">51,2 V 102 Ah LiFePO₄ akü</a> · <a href="sozluk.html#dod">DoD nedir?</a>')

tool('aku-sarj','Panel aküyü kaç saatte doldurur?',
 '<p>İdeal durumda şarj akımı = panel dizisi gücü ÷ akü gerilimi; doldurulacak Ah bu akıma bölününce gereken güneşli saat bulunur. Gün sayısı, bulunduğunuz yerde günde kaç güneşli saat aldığınıza bağlıdır; bu değeri siz yazarsınız.</p>\n'
 '<p class="art-formula">Örnek: {sarj.ah} Ah doldurulacak, {sarj.w} W panel, {sarj.v} V akü<br />Şarj akımı = {sarj.w} ÷ {sarj.v} = {sarj.i} A · süre = {sarj.ah} ÷ {sarj.i} = {sarj.h} güneşli saat · günde {sarj.sun} güneşli saatle {sarj.h} ÷ {sarj.sun} = {sarj.days} gün</p>\n'
 '<p><strong>İdeal hesaptır:</strong> panel sıcaklığı, açı, bulut, kablo ve şarj kontrol cihazı kayıpları ile akünün şarj sonuna doğru akımı azaltması hesaba katılmaz; gerçek süre daha uzundur. Açılıştaki güneşli saat, Sistem Kurucu\'nun tasarım günü değeridir.</p>',
 '<h3 class="tool-title">Akü ve panel</h3>'+row(fld('xfAh','Doldurulacak kapasite (Ah)','min="0"'),fld('xfV','Akü gerilimi (V)','min="0"'))
 +row(fld('xfW','Panel dizisi gücü (W)','min="0"'),fld('xfSun','Günlük güneşli saat','min="0"','sizin girdiniz')),
 '<div class="calc-results">'+res('xfH','Gereken süre',True)+res('xfI','Şarj akımı (ideal)')+res('xfDays','Gün sayısı')+'</div>',
 'şarj akımı = panel gücü (W) ÷ akü gerilimi (V) · güneşli saat = doldurulacak Ah ÷ şarj akımı · gün = güneşli saat ÷ günlük güneşli saat',
 '<a href="#sarj-kontrol">Şarj kontrol cihazı akımı</a> · <a href="#gunluk-uretim">Günlük üretim tahmini</a> · <a href="online-satis.html?kategori=panel">Güneş panelleri</a> · <a href="off-grid-gunes-sistemi-boyutlandirma.html">Off-grid boyutlandırma rehberi</a>')

tool('c-orani','C oranı: akü şarj ve deşarj akımı',
 '<p>C oranı, akımı akü kapasitesine oranlar: I = C × Ah. 1C, aküyü bir saatte boşaltan (ya da dolduran) akımdır; süre = 1 ÷ C saattir. Akünün izin verdiği en yüksek şarj ve deşarj C oranı künyesinde yazar.</p>\n'
 '<p class="art-formula">Örnek: {c.ah} Ah akü, {c.c}C → {c.c} × {c.ah} = {c.i} A · süre = 1 ÷ {c.c} = {c.h} saat</p>',
 '<h3 class="tool-title">Akü</h3><div class="usta-row3">'+fld('xgAh','Kapasite (Ah)','min="0"')+fld('xgC','C oranı','min="0"')+fld('xgI','Akım (A)','min="0"')+'</div><p class="tool-hint">C oranı ya da akım alanından hangisini yazarsanız diğeri hesaplanır.</p>',
 '<div class="calc-results">'+res('xgT','Bu akımda tam kapasitenin süresi',True)+'</div>',
 'akım (A) = C × kapasite (Ah) · C = akım ÷ kapasite · süre (saat) = 1 ÷ C',
 '<a href="#aku-sure">Akü kaç saat dayanır?</a> · <a href="#aku">Akü bankası bağlama</a> · <a href="aku-titanx-51v-102ah.html">51,2 V 102 Ah LiFePO₄ akü</a> · <a href="sozluk.html#bms">BMS nedir?</a>')

tool('gunluk-uretim','Panel günde kaç kWh üretir? (tasarım günü tahmini)',
 '<p>Günlük üretim tahmini: kWh/gün = kurulu güç (kWp) × güneş saati × sistem verimi. Bu araç <a href="sistem-kur.html">Sistem Kurucu</a> ile aynı katsayılarla açılır: tasarım günü için {uretim.sun} güneş saati ve {uretim.eff} sistem verimi (off-grid, panelden yüke toplam). Bu bir <strong>tasarım günü</strong> tahminidir: yazın üretim daha yüksek, kapalı kış gününde daha düşüktür.</p>\n'
 '<p class="art-formula">Örnek: {uretim.w} W panel = {uretim.kwp} kWp → {uretim.kwp} × {uretim.sun} × {uretim.eff} = {uretim.kwh} kWh/gün<br />Bu enerji {uretim.load} W\'lık bir yükü {uretim.kwh} × 1000 ÷ {uretim.load} = {uretim.hours} saat çalıştırır</p>\n'
 '<p>Yıllık üretim, tasarruf ve geri ödeme için bölge verimini kullanan <a href="hesaplayici.html">tasarruf hesaplayıcıya</a> bakın.</p>',
 '<h3 class="tool-title">Sistem</h3>'+fld('xhW','Toplam panel gücü (W)','min="0"')+row(fld('xhSun','Güneş saati (saat/gün)','min="0"','varsayım'),fld('xhEff','Sistem verimi (%)','min="1" max="100"','varsayım'))
 +fld('xhLoad','Bu enerjiyle çalıştırılacak yük (W)','min="0"','isteğe bağlı'),
 '<div class="calc-results">'+res('xhKwh','Tasarım günü üretimi',True)+res('xhKwp','Kurulu güç')+res('xhRun','Yazdığınız yükü çalıştırma süresi')+'</div><p class="tool-hint">Güneş saati ve verim varsayımdır; bölgenize ve sisteminize göre değiştirin. Süre, günlük üretimin tamamının o yüke gittiği varsayımıyla hesaplanır; gece kullanım için akü gerekir.</p>',
 'kWh/gün = kWp × güneş saati × sistem verimi · kWp = toplam panel gücü (W) ÷ 1000 · çalıştırma süresi (saat) = kWh × 1000 ÷ yük (W)',
 '<a href="hesaplayici.html">Yıllık üretim ve tasarruf hesaplayıcı</a> · <a href="sistem-kur.html">Sistem Kurucu</a> · <a href="#yuk-listesi">Cihaz listesinden sistem</a> · <a href="sozluk.html#kwp">kWp nedir?</a>')

tool('sicaklik-gucu','Sıcaklıkta panel gücü',
 '<p>Panelin etiketindeki güç {sic.stc} °C hücre sıcaklığı içindir. Hücre ısındıkça güç, künyedeki güç sıcaklık katsayısı (γ, %/°C, eksi işaretli) kadar azalır: P = Pmax × (1 + γ ÷ 100 × (hücre sıcaklığı − {sic.stc})). Hücre sıcaklığı hava sıcaklığı değildir; güneş altındaki panel havadan belirgin biçimde sıcaktır.</p>\n'
 '<p class="art-formula">Örnek (yuvarlak örnek değerler, bir ürünün künyesi değildir): Pmax {sic.pmax} W, γ {sic.gamma} %/°C, hücre {sic.tcell} °C<br />P = {sic.pmax} × (1 + ({sic.gamma}) ÷ 100 × ({sic.tcell} − {sic.stc})) = {sic.p} W</p>\n'
 '<p>Hücre sıcaklığını bilmiyorsanız künyedeki NOCT değeriyle ders kitabı yaklaşımı kullanılabilir: hücre = ortam + (NOCT − {sic.nAmb}) ÷ {sic.nIrr} × ışınım (W/m²). Örnek: ortam {sic.tamb} °C, NOCT {sic.noct} °C, ışınım {sic.g} W/m² → {sic.tamb} + ({sic.noct} − {sic.nAmb}) ÷ {sic.nIrr} × {sic.g} = {sic.tc} °C. NOCT ve γ değerlerini panelinizin künyesinden alın.</p>',
 '<h3 class="tool-title">Panel etiketi ve sıcaklık</h3>'+row(fld('xiP','Pmax (W)','min="0"'),fld('xiG','Güç sıcaklık katsayısı γ (%/°C)','max="0"','eksi'))
 +fld('xiT','Hücre sıcaklığı (°C)','','varsayım')
 +'<p class="tool-hint">Açılış değerleri yuvarlak örnektir; kendi panelinizin etiketindeki değerleri yazın.</p>'
 +'<h3 class="tool-title">Hücre sıcaklığını NOCT ile tahmin et (isteğe bağlı)</h3><div class="usta-row3">'+fld('xiTa','Ortam (°C)')+fld('xiNoct','NOCT (°C)','min="0"','künye')+fld('xiIrr','Işınım (W/m²)','min="0"')+'</div>'
 +'<p class="usta-out">Tahmini hücre sıcaklığı: <span id="xiTc">—</span> <button type="button" class="usta-link" id="xiUse" hidden>Bu değeri kullan</button></p>',
 '<div class="calc-results">'+res('xiOut','Bu sıcaklıkta güç',True)+res('xiLoss','Etiket gücüne göre fark')+'</div><p class="tool-hint">Yalnız sıcaklık etkisi hesaplanır; ışınım, açı, kirlenme ve kablo kayıpları ayrıdır.</p>',
 'P = Pmax × (1 + γ ÷ 100 × (T<sub>hücre</sub> − '+ex('sic.stc')+')) · T<sub>hücre</sub> = T<sub>ortam</sub> + (NOCT − '+ex('sic.nAmb')+') ÷ '+ex('sic.nIrr')+' × ışınım',
 '<a href="#dizi">Dizi hesabı (soğukta Voc)</a> · <a href="#gunluk-uretim">Günlük üretim tahmini</a> · <a href="online-satis.html?kategori=panel">Güneş panelleri</a> · <a href="sozluk.html#stc">STC nedir?</a>')

tool('golge','Engel gölge uzunluğu',
 '<p>Baca, parapet, direk ya da öndeki panel sırası gibi bir engelin öğle vaktindeki gölge uzunluğu: gölge = engel yüksekliği ÷ tan(öğle güneş yüksekliği). Güneş yüksekliği <a href="#egim">eğim aracındaki</a> formülle bulunur; gölge en uzun kış gündönümünde olur.</p>\n'
 '<p class="art-formula">Örnek: {golge.h} m engel, enlem {golge.lat}° · kış gündönümü (güneş {golge.elevWinter}°): {golge.h} ÷ tan({golge.elevWinter}°) = {golge.winter} m · ekinoks: {golge.equinox} m · yaz gündönümü: {golge.summer} m</p>\n'
 '<p>Hesap yalnız öğle vakti ve tam güney yönü içindir; sabah ve akşam gölge daha uzundur ve yana düşer. Yükseklik, engelin tepesi ile panelin alt kenarı arasındaki farktır.</p>',
 '<h3 class="tool-title">Engel ve konum</h3>'+row(fld('xjH','Engel yüksekliği (m)','min="0"'),fld('xjLat','Enlem (° kuzey)','min="0" max="90"'))
 +sel('xjSeason','Mevsim (öğle vakti)',[('winter','Kış gündönümü (en uzun gölge)'),('equinox','Ekinoks'),('summer','Yaz gündönümü')])+msg('xjMsg'),
 '<div class="calc-results">'+res('xjLen','Gölge uzunluğu',True)+res('xjElev','Öğle güneş yüksekliği')+'</div>'+svg('xjSvg'),
 'gölge uzunluğu = engel yüksekliği ÷ tan(öğle güneş yüksekliği) · öğle güneş yüksekliği = 90 − enlem ± deklinasyon',
 '<a href="hesaplayici.html#alet-cantasi">Sıra aralığı ve gölgelenme aracı</a> · <a href="#egim">Eğim açısı ve güneş yüksekliği</a> · <a href="sozluk.html#golgelenme">Gölgelenme nedir?</a> · <a href="cati-ges.html">Çatı GES keşfi</a>')

tool('cati-egimi','Çatı eğimi çevirici: derece, yüzde ve oran',
 '<p>Çatı eğimi üç biçimde söylenir: derece, yüzde ve 100 cm yatayda kaç cm yükseldiği. Aralarındaki bağ tanjanttır: % eğim = tan(derece) × 100; 100 cm yatayda yükselme (cm) yüzdeyle aynı sayıdır.</p>\n'
 '<p class="art-formula">Örnek: {cati.deg}° → tan({cati.deg}°) × 100 = %{cati.pct} (100 cm yatayda {cati.pct} cm) · %{cati.pct2} eğim → arctan({cati.pct2} ÷ 100) = {cati.deg2}°</p>',
 '<h3 class="tool-title">Eğim</h3>'+row(fld('xkDeg','Derece (°)','min="0" max="89"'),fld('xkPct','Yüzde eğim (%)','min="0"'))+'<p class="tool-hint">Derece ya da yüzde alanından hangisini yazarsanız diğeri hesaplanır. Çatıda ölçmek için: 100 cm yatay mesafede kaç cm yükseldiğini ölçün, yüzde alanına yazın.</p>',
 '<div class="calc-results">'+res('xkRise','100 cm yatayda yükselme')+res('xkRatio','Oran (yükselme : yatay)')+'</div>'+svg('xkSvg'),
 '% eğim = tan(derece) × 100 · derece = arctan(% ÷ 100) · 100 cm yatayda yükselme (cm) = % eğim',
 '<a href="#egim">Panel eğim açısı</a> · <a href="hesaplayici.html#alet-cantasi">Panel yerleşim planlayıcı</a> · <a href="cati-ges.html">Çatı GES hizmeti</a> · <a href="hesaplayici.html">Tasarruf hesaplayıcı</a>')

ROWS=''.join('<tr><td>%s</td><td>%s W</td><td>%s</td><td>%s saat</td><td>%s Wh</td></tr>'%tuple(ex('liste.r%d.%s'%(i,k)) for k in ('name','w','n','h','wh')) for i in range(int(EX['liste.n'])))
tool('yuk-listesi','Cihaz listesinden günlük tüketim, panel, akü ve inverter',
 '<p>Sistemin boyutu günlük enerji ihtiyacından çıkar. Her cihaz için Wh = güç (W) × adet × günlük çalışma saati; toplam günlük tüketimdir. Buradan panel gücü = Wh ÷ (güneş saati × sistem verimi), akü kapasitesi Ah = Wh × özerklik günü ÷ (akü gerilimi × DoD × inverter verimi), inverter gücü ise aynı anda çalışan cihazların toplam gücünden büyük olmalıdır.</p>\n'
 '<div class="art-table-wrap"><table class="art-table"><thead><tr><th>Örnek: {liste.preset}</th><th>Güç</th><th>Adet</th><th>Saat/gün</th><th>Wh/gün</th></tr></thead><tbody>'+ROWS+'</tbody></table></div>\n'
 '<p class="art-formula">Toplam {liste.wh} Wh/gün · panel = {liste.wh} ÷ ({liste.sun} × {liste.eff}) ≈ {liste.panelW} W · akü ({liste.v} V, {liste.days} gün) = {liste.wh} × {liste.days} ÷ ({liste.v} × {liste.dod} × {liste.eta}) ≈ {liste.ah} Ah · inverter ≥ {liste.inv} W</p>\n'
 '<p>Cihaz güçleri ve saatleri <a href="sistem-kur.html">Sistem Kurucu</a>\'daki varsayılan değerlerdir; kendi cihazınızın etiketindeki watt değerini yazın. Katsayılar da Sistem Kurucu ile aynıdır (tasarım günü güneş saati, sistem verimi, lityum akü DoD\'u, inverter verimi). İnverter satırı yalnızca çalışma güçlerinin toplamıdır: buzdolabı, pompa ve klima gibi motorlu cihazların <strong>kalkış akımı dahil değildir</strong>. Eşzamanlılık, kalkış payı ve ürün seçimiyle tam hesap için Sistem Kurucu\'yu kullanın.</p>',
 '<h3 class="tool-title">Cihazlar</h3><div class="usta-lhead" aria-hidden="true"><span>Cihaz</span><span>W</span><span>Adet</span><span>Saat/gün</span><span></span></div><div id="xlRows"></div>'
 +'<div class="usta-ladd"><button type="button" class="usta-link" id="xlAdd">+ Satır ekle</button><select id="xlPreset" aria-label="Hazır cihaz ekle"><option value="">Hazır cihaz ekle…</option></select></div>'
 +'<p class="usta-sub">Senaryo yükle (Sistem Kurucu senaryoları)</p><div class="usta-ladd" id="xlScen"></div>',
 '<div class="calc-results">'+res('xlWh','Günlük tüketim',True)+res('xlPanel','Gerekli panel gücü')+res('xlAh','Akü kapasitesi')+res('xlInv','İnverter gücü (kalkış hariç)')+'</div>'
 +'<h3 class="tool-title">Varsayımlar</h3><div class="usta-row3">'+fld('xlV','Akü gerilimi (V)','min="0"')+fld('xlDays','Özerklik (gün)','min="0"')+fld('xlSun','Güneş saati','min="0"')+'</div>'
 +'<div class="usta-row3">'+fld('xlEff','Sistem verimi (%)','min="1" max="100"')+fld('xlDod','DoD (%)','min="1" max="100"')+fld('xlEta','İnverter verimi (%)','min="1" max="100"')+'</div>',
 'Wh/gün = Σ (W × adet × saat) · panel W = Wh ÷ (güneş saati × sistem verimi) · akü Ah = Wh × gün ÷ (V × DoD × inverter verimi) · inverter W ≥ Σ (W × adet)',
 '<a href="sistem-kur.html">Sistem Kurucu (tam sihirbaz)</a> · <a href="off-grid-gunes-sistemi-boyutlandirma.html">Off-grid boyutlandırma rehberi</a> · <a href="#aku-sure">Akü kaç saat dayanır?</a> · <a href="tarimsal-sulama.html#pompa-secimi">Solar sulama pompası seçimi</a>')

tool('cihaz-tuketimi','Cihaz kaç kWh harcar, kaç TL yakar?',
 '<p>Bir cihazın tüketimi kWh = güç (W) × günlük çalışma saati × gün sayısı ÷ 1000 ile bulunur; tutar = kWh × birim fiyat. Birim fiyatı faturanızdan siz yazarsınız; açılıştaki değer yalnızca düzenlenebilir bir örnektir.</p>\n'
 '<p class="art-formula">Örnek: {tuk.w} W cihaz, günde {tuk.h} saat, {tuk.days} gün → {tuk.w} × {tuk.h} × {tuk.days} ÷ 1000 = {tuk.kwh} kWh · birim fiyat {tuk.price} TL/kWh (örnek) ile {tuk.kwh} × {tuk.price} = {tuk.cost} TL</p>\n'
 '<p>Etiketteki güç en yüksek değerdir; buzdolabı, klima ve termostatlı ısıtıcılar sürekli tam güçte çalışmaz, gerçek tüketim daha düşük olabilir. Kesin değer için priz tipi bir enerji ölçer kullanılır.</p>',
 '<h3 class="tool-title">Cihaz</h3>'+row(fld('xuW','Güç (W)','min="0"'),fld('xuH','Günlük çalışma (saat)','min="0" max="24"'))+row(fld('xuDays','Gün sayısı','min="0"'),fld('xuPrice','Birim fiyat (TL/kWh)','min="0"','örnek, faturanızdan yazın')),
 '<div class="calc-results">'+res('xuKwh','Tüketim',True)+res('xuCost','Tutar')+'</div><p class="tool-hint">Birim fiyat tarifeye ve vergilere göre değişir; faturanızdaki toplam tutarı toplam kWh\'e bölerek kendi değerinizi bulabilirsiniz.</p>',
 'kWh = güç (W) × saat/gün × gün ÷ 1000 · tutar = kWh × birim fiyat',
 '<a href="#yuk-listesi">Cihaz listesinden sistem</a> · <a href="hesaplayici.html">Faturadan GES tasarruf hesabı</a> · <a href="sistem-kur.html">Sistem Kurucu</a> · <a href="#gunluk-uretim">Panel günde kaç kWh üretir?</a>')

tool('hp-kw-amper','HP → kW → amper: motor akımı',
 '<p>Motor etiketindeki beygir gücü mil (çıkış) gücüdür: kW = HP ÷ {cev.hpPerKw}. Şebekeden çekilen elektrik gücü mil gücünün verime bölünmesiyle bulunur; akım ise tek fazda I = P ÷ (V × cosφ), üç fazda I = P ÷ (√3 × V × cosφ) formülüyle hesaplanır. Verim ve cosφ motorun etiketinden girilir.</p>\n'
 '<p class="art-formula">Örnek (örnek etiket değerleri): {motor.hp} HP, verim {motor.eff}, cosφ {motor.cos}<br />Mil gücü = {motor.hp} ÷ {cev.hpPerKw} = {motor.shaft} kW · elektrik gücü = {motor.shaft} ÷ {motor.eff} = {motor.in} kW<br />Tek faz {ac.v1} V: {motor.i1} A · üç faz {ac.v3} V: {motor.i3} A</p>\n'
 '<p>Sonuç tam yükteki çalışma akımıdır. <strong>Kalkış akımı dahil değildir</strong>; kalkışta motor bunun birkaç katını çeker ve değeri motor üreticisi verir. Etikette anma akımı yazıyorsa o esas alınır.</p>',
 '<h3 class="tool-title">Motor etiketi</h3>'+row(fld('xmHp','Güç (HP)','min="0"'),sel('xmKind','Besleme',[('1','Tek faz'),('3','Üç faz')]))
 +row(fld('xmV','Gerilim (V)','min="0"'),fld('xmEff','Verim (%)','min="1" max="100"','etiket'))+fld('xmCos','cosφ','min="0" max="1"','etiket'),
 '<div class="calc-results">'+res('xmI','Çalışma akımı (kalkış hariç)',True)+res('xmShaft','Mil gücü')+res('xmIn','Çekilen elektrik gücü')+'</div><p class="tool-hint">Açılıştaki verim ve cosφ yalnızca örnektir; motorunuzun etiketindeki değerleri yazın.</p>',
 'kW (mil) = HP ÷ '+ex('cev.hpPerKw')+' · elektrik gücü = mil gücü ÷ verim · tek faz I = P ÷ (V × cosφ) · üç faz I = P ÷ (√3 × V × cosφ)',
 '<a href="#akim">Güçten akım hesabı</a> · <a href="#ac-kablo">AC gerilim düşümü</a> · <a href="solar-sulama-pompasi-secimi.html">Solar sulama pompası seçimi</a> · <a href="tarimsal-sulama.html#pompa-secimi">Pompa ve panel gücü aracı</a>')

tool('sigorta-kablo-uyumu','Sigorta–kablo uyum kontrolü (Ib ≤ In ≤ Iz)',
 '<p>Bir hattın koruması için temel koşul: tasarım akımı (Ib) ≤ sigorta ya da şalterin anma akımı (In) ≤ kablonun akım taşıma kapasitesi (Iz). İlk eşitsizlik sağlanmazsa sigorta normal yükte açar; ikincisi sağlanmazsa sigorta kabloyu korumaz.</p>\n'
 '<p class="art-formula">Örnek (örnek sayılar): Ib {uyum.ib} A, In {uyum.in} A, Iz {uyum.iz} A → {uyum.ib} ≤ {uyum.in} ≤ {uyum.iz}: {uyum.verdict} · aynı sigortayla Iz {uyum.izBad} A olsaydı {uyum.in} ≤ {uyum.izBad} olmadığı için {uyum.verdictBad}</p>\n'
 '<p><strong>Iz bu sayfada yoktur ve olmayacaktır:</strong> kablonun akım taşıma kapasitesi döşeme şekline, ortam sıcaklığına, yan yana kablo sayısına ve yalıtım tipine göre değişir; kablo üreticisinin tablosundan okunur ve tasarımı yapan yetkili kişi belirler. Bu araç yalnızca yazdığınız üç sayıyı karşılaştırır; sigortanın açma karakteristiği, kısa devre dayanımı ve diğer koşullar tasarımcının işidir.</p>',
 '<h3 class="tool-title">Üç akım değeri</h3>'+fld('xsIb','Tasarım (yük) akımı Ib (A)','min="0"')+fld('xsIn','Sigorta / şalter anma akımı In (A)','min="0"')+fld('xsIz','Kablonun akım taşıma kapasitesi Iz (A)','min="0"','üretici tablosundan')
 +'<p class="tool-hint"><button type="button" class="usta-link" id="xsFill">Örnek değerleri doldur</button> Örnek değerler rastgele sayılardır; bir kabloya ait değildir.</p>',
 '<div class="calc-results">'+res('xsVerdict','Sonuç',True,'xsBox')+'</div>'+msg('xsMsg'),
 'Ib ≤ In ≤ Iz · Ib: tasarım akımı · In: sigorta/şalter anma akımı · Iz: kablonun akım taşıma kapasitesi (üretici tablosu)',
 '<a href="#akim">Güçten akım hesabı (Ib)</a> · <a href="#ac-kablo">AC gerilim düşümü</a> · <a href="#kablo">DC kablo kesiti</a> · <a href="#sigorta">Dizi sigortası kontrolü</a>')

CATS=[('grup-gunes','☀️ Güneş ve konum','Güneşin yüksekliği, eğim, gölge ve üretim tahmini.',['egim','golge','cati-egimi','gunluk-uretim','sicaklik-gucu']),
 ('grup-kablo','🔻 Kablo ve akım','DC ve AC hatlarda gerilim düşümü, güçten akım, motor akımı, Ohm kanunu ve sigorta–kablo uyumu.',['kablo','ac-kablo','akim','hp-kw-amper','ohm','sigorta-kablo-uyumu']),
 ('grup-dizi','🔗 Dizi ve bağlantı','Kaç panel seri bağlanır, seri–paralel şema ve dizi sigortası kontrolü.',['dizi','seri-paralel','sigorta']),
 ('grup-aku','🔋 Akü','Akü bankası, süre, dolum ve C oranı.',['aku','aku-sure','aku-sarj','c-orani']),
 ('grup-cihaz','🎛️ Cihaz seçimi','Cihaz listesinden sistem, şarj kontrol cihazı ve inverter akımı, tüketim ve maliyet.',['yuk-listesi','sarj-kontrol','inverter-aku-akimi','cihaz-tuketimi']),
 ('grup-cevirici','🔁 Çeviriciler','Watt–amper, Ah–Wh, HP–kW ve AWG–mm².',['cevirici']),
 ('grup-kontrol','✅ Kontrol listesi','Devreye almadan önce sahada işaretlenecek kontroller.',['kontrol'])]
NTOOLS=sum(len(c[3]) for c in CATS); assert NTOOLS==len(TOOLS)==len(KW), (NTOOLS,len(TOOLS),len(KW))
SHORT={'egim':'Eğim açısı','golge':'Gölge uzunluğu','cati-egimi':'Çatı eğimi','gunluk-uretim':'Günlük üretim','sicaklik-gucu':'Sıcaklıkta güç','kablo':'DC kablo kesiti','ac-kablo':'AC gerilim düşümü','akim':'Akım hesabı','ohm':'Ohm kanunu',
 'dizi':'Dizi hesabı','seri-paralel':'Seri–paralel şema','sigorta':'Dizi sigortası','aku':'Akü bankası','aku-sure':'Akü süresi','aku-sarj':'Akü dolum süresi','c-orani':'C oranı','sarj-kontrol':'Şarj kontrol akımı','yuk-listesi':'Cihaz listesi','cevirici':'Çeviriciler','kontrol':'Kontrol listesi',
 'inverter-aku-akimi':'İnverter akü akımı','sigorta-kablo-uyumu':'Sigorta–kablo uyumu','hp-kw-amper':'HP → amper','cihaz-tuketimi':'Tüketim ve maliyet'}
def cat(c):
    idx=' · '.join('<a href="#%s">%s</a>'%(t,SHORT[t]) for t in c[3])
    return '<section class="usta-cat" id="%s">\n<h2>%s</h2>\n<p class="usta-cat-lead">%s <span class="usta-idx">%s</span></p>\n%s</section>\n'%(c[0],c[1],c[2],idx,''.join(TOOLS[t] for t in c[3]))
BODY='\n'.join(cat(c) for c in CATS)

def faq(q,a): return '<div class="faq-item reveal"><button class="faq-q"><span>%s</span><span class="faq-ico">+</span></button><div class="faq-a"><p>%s</p></div></div>'%(q,X(a))
FAQ=[
('Güneş paneli eğim açısı kaç derece olmalı?','Sahada kullanılan pratik kurala göre yıl boyu kullanım için eğim yaklaşık olarak bulunduğunuz enleme eşit alınır; yaz ağırlıklı kullanımda enlem − {egim.delta}°, kış ağırlıklı kullanımda enlem + {egim.delta}° seçilir. {egim.lat}° enlemi için bu, yıl boyu ≈ {egim.tiltYear}°, yaz ≈ {egim.tiltSummer}°, kış ≈ {egim.tiltWinter}° demektir. Bu bir başlangıç değeridir; çatı eğimi, gölge ve kullanım mevsimi sonucu değiştirir.'),
('Kaç panel seri bağlanır?','En çok seri panel sayısı = cihazın en yüksek PV giriş gerilimi ÷ panelin soğuk havadaki Voc değeri, aşağı yuvarlanır. Soğuk Voc = Voc × (1 + β ÷ 100 × (en düşük sıcaklık − {dizi.stc})). Örnek değerlerle: Voc {dizi.voc} V, β {dizi.beta} %/°C ve {dizi.tmin} °C için soğuk Voc {dizi.cold} V olur; {dizi.vmax} V girişli cihaza en çok {dizi.max} panel seri bağlanır. Değerleri kendi panel ve cihaz etiketinizden alın.'),
('Solar kablo kesiti nasıl hesaplanır?','Gerilim düşümü = 2 × akım × tek yön uzunluk × ρ ÷ kesit formülüyle bulunur (bakır için ρ = {kablo.rho} Ω·mm²/m) ve sistem geriliminin belirli bir yüzdesinin altında tutulur; bu sayfadaki araç %{kablo.target} hedefini kullanır. Örnek: {kablo.v} V, {kablo.i} A, {kablo.len} m hatta {kablo.s} mm² kabloda düşüm {kablo.drop} V (%{kablo.pct}) çıkar, hedefi {kablo.rec} mm² karşılar. Kablonun akım taşıma kapasitesi ayrı bir kontroldür; kablo üreticisinin tablosuna bakılır.'),
('Paneller seri mi paralel mi bağlanmalı?','Seri bağlamada gerilim toplanır, akım aynı kalır; paralel bağlamada akım toplanır, gerilim aynı kalır. Hangisinin seçileceğini cihazın giriş gerilimi aralığı ve akım sınırı belirler: MPPT cihazlarda dizi gerilimi giriş sınırını aşmayacak ve MPPT alt geriliminin üstünde kalacak şekilde seri bağlanır, gerekirse eş diziler paralellenir. Yüksek gerilim ve düşük akım, kabloda daha az kayıp demektir.'),
('AWG kaç mm² eder?','AWG numarası n olan telin çapı d = 0,127 × 92^((36 − n) ÷ 39) mm, kesiti π × d² ÷ 4 formülüyle bulunur. Örneğin AWG {cev.awg} = {cev.awgD} mm çap = {cev.awgA} mm². AWG küçüldükçe tel kalınlaşır. AWG ile metrik kesitler birebir örtüşmez; metrik kablo seçerken hesaplanan değerin altına inilmez.'),
('Dizi sigortası ne zaman gerekir?','Paralel bağlı dizilerde, arızalı bir diziye diğerlerinden akabilecek ters akım (N − 1) × Isc kadardır. Bu değer panel etiketindeki en yüksek seri sigorta değerini aşıyorsa her diziye sigorta gerekir. Örnek: Isc {sigorta.isc} A ve etiket değeri {sigorta.max} A olan panelde {sigorta.n} paralel dizi {sigorta.rev} A eder ve sigorta {sigorta.verdict}. Sigortanın değeri ve tipi üretici talimatına göre tasarımı yapan yetkili kişi tarafından seçilir.'),
('Aküler seri ve paralel bağlanınca gerilim ve Ah nasıl değişir?','Seri bağlamada gerilim toplanır, Ah aynı kalır; paralel bağlamada Ah toplanır, gerilim aynı kalır. {aku.s} seri × {aku.p} paralel bağlanan {aku.v} V {aku.ah} Ah aküler {aku.totV} V {aku.totAh} Ah, yani {aku.kwh} kWh eder. Aynı bankada yalnızca aynı tip, yaş ve kapasitede aküler kullanılır.'),
('1000 W inverter aküden kaç amper çeker?','Akü tarafı akımı = yük ÷ (akü gerilimi × inverter verimi). {cev.w} W yük, {cev.v} V akü ve %{cev.eta} verim varsayımıyla {cev.inv} A eder. Aynı yük 24 V aküde yaklaşık yarısı, 48 V aküde dörtte biri kadar akım çeker; verim için inverterin künyesindeki değer kullanılır.')]
FAQ+=[
('Trifaze (üç faz) akım nasıl hesaplanır?','Üç fazlı dengeli yükte akım I = P ÷ (√3 × V × cosφ) formülüyle bulunur; V faz-faz gerilimidir. Örnek: {akim.p} W yük, {ac.v3} V ve cosφ {akim.cos} için {akim.i3} A eder. Aynı yük tek fazda ({ac.v1} V) I = P ÷ (V × cosφ) ile {akim.i1} A çeker. cosφ cihazın etiketinden alınır.'),
('kW ile kVA arasındaki fark nedir?','kW aktif güçtür (işe dönüşen güç), kVA görünür güçtür (gerilim × akım). Aralarındaki bağ güç katsayısıdır: kVA = kW ÷ cosφ. Örnek: {akim.kw} kW yük cosφ {akim.cos} ile {akim.kva} kVA eder. cosφ 1 ise ikisi eşittir.'),
('Akü kaç saat dayanır, nasıl hesaplanır?','Süre (saat) = akü gerilimi × Ah × kullanılabilir oran (DoD) × inverter verimi ÷ yük gücü. Örnek: {sure.v} V {sure.ah} Ah akü, DoD {sure.dod}, verim {sure.eta} ve {sure.load} W yük için {sure.wh} Wh ÷ {sure.load} W = {sure.h} saat. DoD akü tipine göre değişir; akünüzün künyesindeki değeri kullanın.'),
('Çatı eğimi yüzde kaç derece eder?','Yüzde eğim = tan(derece) × 100, derece = arctan(yüzde ÷ 100). Örnek: {cati.deg}° eğim %{cati.pct} eder; %{cati.pct2} eğim {cati.deg2}° eder. Yüzde eğim, 100 cm yatay mesafede kaç cm yükselindiğini gösterir.'),
('Kaç amper şarj kontrol cihazı gerekir?','MPPT cihazlar için en az çıkış akımı = toplam panel gücü ÷ akü sistem gerilimi. Örnek: {sk.w} W panel ve {sk.v} V akü için {sk.w} ÷ {sk.v} = {sk.i} A. Üreticinin belirttiği pay ya da panel gücü sınırı varsa o esas alınır; cihazın PV giriş gerilimi sınırı ayrıca kontrol edilir.'),
('Güneş paneli günde kaç kWh üretir?','Tasarım günü tahmini kWh/gün = kurulu güç (kWp) × güneş saati × sistem verimi ile yapılır. Sitemizdeki Sistem Kurucu ile aynı varsayımlarla ({uretim.sun} güneş saati, {uretim.eff} sistem verimi) {uretim.kwp} kWp panel yaklaşık {uretim.kwh} kWh/gün üretir. Gerçek üretim mevsime, konuma, eğime ve gölgeye göre değişir.')]
faq_html='<div class="faq">'+''.join(faq(q,a) for q,a in FAQ)+'</div>'

nav='<nav class="usta-nav" aria-label="Araç grupları"><div class="container usta-nav-in">'+''.join('<a href="#%s">%s</a>'%(c[0],c[1]) for c in CATS)+'</div></nav>'
FIND='<div class="usta-find" hidden><label for="ustaFind">Araç ara</label><input id="ustaFind" type="search" inputmode="search" autocomplete="off" placeholder="ör. gerilim düşümü, akü, AWG, eğim" /><p class="usta-find-state" id="ustaFindState" aria-live="polite"></p></div>'
CNT='<data data-ex="meta.count" value="%d">%d</data>'%(NTOOLS,NTOOLS)
DISC_PAGE='<p class="art-disc"><em>Bu sayfa genel bilgilendirme ve ön hesap amaçlıdır. Sonuçlar girdiğiniz değerlere ve belirtilen formüllere dayanır; gerçek değerler sıcaklık, ışınım, kablo, bağlantı kalitesi ve ekipmana göre değişir. Kesin tasarım, malzeme seçimi ve kurulum için ürün künyesine, üretici talimatına ve yürürlükteki mevzuata uyunuz; işi yetkili elektrikçi ya da mühendis yapar.</em></p>'

# ============================================================
# İNİŞ SAYFALARI — her biri kendi arama sorgusuna; kartlar yukarıdaki TEK kaynaktan
# ============================================================
P_CABLE=[('kablo-solar-5m.html','Solar kablo takımı 5 m + 5 m'),('mc4-set.html','MC4 konnektör takımı'),('online-satis.html?kategori=kablo','Kablo ve konnektörler')]
P_CC=[('online-satis.html?kategori=sarj-kontrol','Şarj kontrol cihazları'),('lexron-mppt-40a.html','Lexron 40 A MPPT'),('havensis-mppt-60a-150v.html','Havensis 60 A MPPT (150 V giriş)')]
P_PANEL=[('online-satis.html?kategori=panel','Güneş panelleri'),('panel-360w.html','360 W güneş paneli'),('panel-lexron-655w.html','Lexron 655 W panel')]
P_BAT=[('aku-titanx-51v-102ah.html','51,2 V 102 Ah LiFePO₄ akü'),('online-satis.html?kategori=enerji-depolama','Enerji depolama ürünleri'),('lexron-guc-istasyonu-1200w.html','1200 W güç istasyonu')]
P_SYS=[('sistem-kur.html','Sistem Kurucu'),('urunler.html','Hazır güneş paketleri'),('online-satis.html','Mağaza')]
AWG_ROWS=''.join('<tr><td>AWG %s</td><td>%s mm</td><td>%s mm²</td></tr>'%tuple(ex('awg.t%d.%s'%(i,k)) for k in ('l','d','a')) for i in range(int(EX['awg.n'])))
PAGES=[
dict(slug='kablo-kesiti-hesaplama',crumb='Kablo Kesiti Hesaplama',
 title='Kablo Kesiti Hesaplama: Güç ve Mesafeye Göre | GESPA',
 desc='Kablo kesiti hesaplama aracı: akım ve mesafeye göre gerilim düşümü, DC ve AC (monofaze, trifaze) hatlar için formül, örnek hesap ve sigorta–kablo kontrolü.',
 h1='Kablo Kesiti Hesaplama (Güç ve Mesafeye Göre)',
 lead='Akımı, tek yön uzunluğu ve gerilimi yazın; araç gerilim düşümünü ve hedefi karşılayan en küçük bakır kesiti verir. DC hatlar, tek faz ve üç faz AC hatlar aynı sayfada.',
 short='Kablo kesiti iki ayrı kontrolle seçilir: gerilim düşümü ve akım taşıma kapasitesi. Gerilim düşümü formülle hesaplanır (DC ve tek fazda 2 × I × L × ρ ÷ S). Örnek: {kablo.v} V, {kablo.i} A, tek yön {kablo.len} m hatta {kablo.s} mm² kablo %{kablo.pct} düşüm verir; %{kablo.target} hedefini {kablo.rec} mm² karşılar. Akım taşıma kapasitesi ise kablo üreticisinin tablosundan okunur.',
 tools=['kablo','ac-kablo','sigorta-kablo-uyumu'],
 inputs=[('Akım (A)','Hattan geçecek en yüksek sürekli akım. Elinizde güç (W ya da kW) varsa önce <a href="kw-amper-hesaplama.html">kW amper hesaplama</a> ile akıma çevirin.'),
  ('Uzunluk (m)','Kaynaktan yüke TEK YÖN kablo boyu. Gidiş ve dönüş iletkeni formüldeki 2 çarpanıyla (üç fazda √3) hesaba girer; uzunluğu ikiyle çarpıp yazmayın.'),
  ('Gerilim (V)','Yüzde düşüm bu değere göre hesaplanır. Aynı akım ve uzunlukta volt cinsinden düşüm aynıdır, ama düşük gerilimli sistemde yüzdesi büyür.'),
  ('Kesit (mm²)','Bakır iletkenin kesit alanı. Araç yalnızca bakır için hesap yapar.')],
 mistakes=['Uzunluğu gidiş-dönüş toplamı olarak yazıp düşümü iki kat hesaplamak.','Kesiti yalnızca gerilim düşümüne göre seçip akım taşıma kapasitesine bakmamak ya da tersini yapmak: ikisi de sağlanmalıdır.','12 V ve 24 V sistemlerde şebeke alışkanlığıyla ince kablo seçmek: düşük gerilimde aynı güç çok daha yüksek akım demektir.','Sigortayı kablonun taşıyabileceği akımdan büyük seçmek.'],
 limits='Araç gerilim düşümünü direnç üzerinden hesaplar; AC tarafta reaktans ihmal edilir. Akım taşıma kapasitesi, izin verilen gerilim düşümü sınırı ve sigorta seçimi bu sayfada verilmez: bunlar döşeme şekline, sıcaklığa ve projeye bağlıdır, kablo üreticisinin tablosundan ve tasarımı yapan yetkili kişiden alınır.',
 faq=[('Kablo kesiti neye göre seçilir?','İki koşula göre: hat sonundaki gerilim düşümü kabul ettiğiniz sınırın altında kalmalı ve kablonun akım taşıma kapasitesi hattın akımından büyük olmalıdır. Gerilim düşümü akım, uzunluk ve kesitten formülle hesaplanır; akım taşıma kapasitesi kablo üreticisinin tablosundan okunur.'),
  ('Mesafe arttıkça kablo kesiti neden büyür?','Kablonun direnci uzunlukla doğru orantılıdır (R = 2 × L × ρ ÷ S). Uzunluk iki katına çıkınca aynı kesitte gerilim düşümü de iki katına çıkar; aynı düşümü korumak için kesit de iki katına çıkarılır.'),
  ('12 V sistemde kablo neden daha kalın olur?','Aynı güç düşük gerilimde daha yüksek akım demektir ve volt cinsinden aynı düşüm, düşük gerilimde daha büyük bir yüzde eder. Örnek hatta {kablo.i} A ve {kablo.len} m için {kablo.s} mm² kabloda düşüm {kablo.drop} V\'tur; bu, {kablo.v} V sistemde %{kablo.pct} eder.'),
  ('Bu araç kablonun kaç amper taşıyacağını söyler mi?','Hayır. Akım taşıma kapasitesi döşeme şekline, ortam sıcaklığına ve yan yana kablo sayısına bağlıdır; kablo üreticisinin tablosundan okunur. Sayfadaki uyum kontrolü, tablodan okuduğunuz değeri sigorta ve yük akımıyla karşılaştırır.')],
 sib=['gerilim-dusumu-hesaplama','solar-kablo-kesiti-hesaplama','kw-amper-hesaplama','awg-mm2-cevirme'],prod=P_CABLE),

dict(slug='gerilim-dusumu-hesaplama',crumb='Gerilim Düşümü Hesabı',
 title='Gerilim Düşümü Hesabı: Monofaze ve Trifaze | GESPA',
 desc='Gerilim düşümü hesaplama: monofaze 2·I·L·ρ·cosφ/S, trifaze √3·I·L·ρ·cosφ/S. Akım, mesafe ve kesitten volt ve yüzde düşümü veren ücretsiz araç.',
 h1='Gerilim Düşümü Hesabı: Monofaze ve Trifaze',
 lead='Tek faz ve üç faz hatlarda gerilim düşümünü volt ve yüzde olarak hesaplayın. Kendi projenizdeki sınırı yazarsanız araç o sınırı karşılayan en küçük kesiti de gösterir.',
 short='Tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S. Örnek: {ac.i} A, {ac.len} m, {ac.s} mm² bakır ve cosφ {ac.cos} için tek fazda {ac.drop1} V (%{ac.pct1}), üç fazda {ac.drop3} V (%{ac.pct3}) düşüm oluşur.',
 tools=['ac-kablo','kablo'],
 inputs=[('Sistem','Tek faz (monofaze) hatta yüzde faz-nötr gerilimine, üç faz (trifaze) hatta faz-faz gerilimine göre hesaplanır; seçince gerilim alanı kendiliğinden değişir.'),
  ('cosφ','Yükün güç katsayısı; cihazın etiketinde yazar. Bilinmiyorsa yazdığınız değer bir varsayımdır.'),
  ('Uzunluk','Tek yön kablo boyu. Tek fazdaki 2 çarpanı gidiş ve dönüş iletkenini, üç fazdaki √3 çarpanı faz farkını temsil eder.'),
  ('Sınır (%)','İsteğe bağlıdır. Projenizin ya da şartnamenizin izin verdiği düşümü siz yazarsınız; araç bir sınır önermez.')],
 mistakes=['Üç faz hatta tek faz formülünü (2 çarpanı) kullanmak ya da yüzdeyi faz-nötr gerilimine bölmek.','Motorlarda yalnızca çalışma akımına bakmak: kalkışta akım yükselir ve anlık düşüm daha büyük olur.','Uzun ve büyük kesitli besleme hatlarında yalnız dirençle yetinmek.'],
 limits='Bu bir direnç yaklaşımıdır; kablonun reaktansı ihmal edilir. Kısa ve küçük kesitli hatlarda sonuç yeterince yakındır; uzun hatlarda ve büyük kesitli kablolarda reaktans önem kazanır ve hesabı tasarımcı yapar. İzin verilen gerilim düşümü sınırı tesisin türüne ve projeye göre belirlenir; bu sayfa bir sınır değeri vermez.',
 faq=[('Gerilim düşümü formülü nedir?','Tek fazda ΔV = 2 × I × L × ρ × cosφ ÷ S, üç fazda ΔV = √3 × I × L × ρ × cosφ ÷ S. I akım (A), L tek yön uzunluk (m), S kesit (mm²), bakır için ρ = {ac.rho} Ω·mm²/m. Yüzde düşüm, ΔV\'nin hat gerilimine bölünmesiyle bulunur.'),
  ('Monofaze ve trifaze gerilim düşümü arasındaki fark nedir?','Aynı akım, uzunluk ve kesitte tek fazda çarpan 2, üç fazda √3\'tür ve yüzde farklı gerilimlere göre hesaplanır. Örnek değerlerle tek fazda {ac.drop1} V, {ac.v1} V\'un %{ac.pct1}\'idir; üç fazda {ac.drop3} V, {ac.v3} V\'un %{ac.pct3}\'idir.'),
  ('Gerilim düşümü yüzde kaç olmalı?','Bu sayfa bir sınır değeri vermez. İzin verilen düşüm tesisin türüne, hattın görevine ve projeye göre değişir; değeri projenizden ya da tasarımı yapan yetkili kişiden alıp araçtaki sınır alanına yazabilirsiniz.'),
  ('Gerilim düşümünü azaltmak için ne yapılır?','Formüle göre üç yol vardır: kesiti büyütmek, hattı kısaltmak ya da aynı gücü daha yüksek gerilimde taşıyarak akımı düşürmek. Güneş sistemlerinde panelleri seri bağlayıp dizi gerilimini yükseltmek bu yüzden kablo kaybını azaltır.')],
 sib=['kablo-kesiti-hesaplama','trifaze-akim-hesaplama','kw-amper-hesaplama','solar-kablo-kesiti-hesaplama'],prod=P_CABLE),

dict(slug='solar-kablo-kesiti-hesaplama',crumb='Solar Kablo Kesiti',
 title='Solar Kablo Kesiti Hesaplama (DC) | GESPA Enerji',
 desc='Solar kablo kesiti hesaplama: panel–şarj kontrol ve akü–inverter hatlarında DC gerilim düşümü, ısıya giden güç ve hedefi karşılayan en küçük kesit.',
 h1='Solar (DC) Kablo Kesiti Hesaplama',
 lead='Panel ile şarj kontrol cihazı ya da akü ile inverter arasındaki DC hat için gerilim düşümünü, kabloda ısıya giden gücü ve hedefi karşılayan en küçük kesiti hesaplayın.',
 short='DC hatta R = 2 × L × ρ ÷ S, gerilim düşümü I × R, ısı kaybı I² × R\'dir. Örnek: {kablo.v} V, {kablo.i} A, tek yön {kablo.len} m, {kablo.s} mm² → {kablo.drop} V (%{kablo.pct}) düşüm ve {kablo.loss} W ısı kaybı; %{kablo.target} hedefini {kablo.rec} mm² karşılar.',
 tools=['kablo','inverter-aku-akimi'],
 inputs=[('Sistem gerilimi','Panel tarafında dizinin çalışma gerilimi (Vmp toplamı), akü tarafında akü gerilimi.'),
  ('Akım','Panel tarafında dizinin akımı (Imp, güvenli tarafta kalmak için Isc), akü–inverter hattında inverterin aküden çektiği akım. İkincisini sayfadaki inverter aracı hesaplar ve tek tıkla kablo aracına aktarır.'),
  ('Uzunluk','Tek yön kablo boyu; artı ve eksi iletken formüldeki 2 çarpanıyla hesaba girer.'),
  ('Kesit','Solar kablolarda yaygın kesitler listelenir; şemadaki daireler iletken kesitlerini aynı ölçekte gösterir.')],
 mistakes=['Akü–inverter kablosunu panel kablosuyla aynı kesitte seçmek: akü tarafında gerilim düşük, akım çok yüksektir.','Panelleri paralel bağlayıp akımı büyütmek ve uzun hattı ince kabloyla çekmek; seri bağlamak aynı güçte akımı düşürür.','MC4 konnektörü kablo kesitine uygun olmayan pimle sıkmak.','Yalnız gerilim düşümüne bakıp kablonun akım taşıma kapasitesini üretici tablosundan kontrol etmemek.'],
 limits='Hesap bakır iletken ve sabit akım içindir. Güneşte ısınan çatıda kablonun taşıyabileceği akım azalır; bu değer kablo üreticisinin tablosundan okunur. Mağazamızdaki <a href="kablo-solar-5m.html">solar kablo takımının</a> kesiti stoğa göre değişir; hesabınız için gereken kesiti siparişten önce bize yazın.',
 faq=[('Güneş paneli için kaç mm² kablo kullanılır?','Tek bir cevap yoktur: kesit, dizinin akımına, gerilimine ve kablo boyuna bağlıdır. Aracı kendi değerlerinizle çalıştırın; örnek hatta {kablo.v} V, {kablo.i} A ve {kablo.len} m için %{kablo.target} hedefini {kablo.rec} mm² karşılar. Akım taşıma kapasitesini kablo üreticisinin tablosundan ayrıca kontrol edin.'),
  ('Panel kablosu uzarsa ne olur?','Gerilim düşümü ve ısıya giden güç uzunlukla doğru orantılı artar; üretilen enerjinin bir bölümü kabloda kaybolur. Hattı kısaltmak, kesiti büyütmek ya da panelleri seri bağlayıp gerilimi yükseltmek kaybı azaltır.'),
  ('Akü ile inverter arası kablo nasıl hesaplanır?','Önce inverterin aküden çektiği akım bulunur: I = yük ÷ (akü gerilimi × verim). Örnek: {cev.w} W yük, {cev.v} V akü ve %{cev.eta} verim varsayımıyla {cev.inv} A. Bu akım kablo aracına aktarılır ve gerilim düşümüne bakılır; kablo olabildiğince kısa tutulur.')],
 sib=['kablo-kesiti-hesaplama','invertor-akuden-kac-amper-ceker','gunes-paneli-seri-paralel-baglanti','awg-mm2-cevirme'],prod=P_CABLE),

dict(slug='kw-amper-hesaplama',crumb='kW Amper Hesaplama',
 title='kW Amper Hesaplama: 1 kW Kaç Amper? | GESPA',
 desc='kW amper hesaplama: monofaze I = P/(V·cosφ), trifaze I = P/(√3·V·cosφ), DC I = P/V. 1 kW kaç amper eder, HP kaç amper çeker: formül ve ücretsiz araç.',
 h1='kW Amper Hesaplama: 1 kW Kaç Amper?',
 lead='Gücü, gerilimi ve güç katsayısını yazın; tek faz, üç faz ya da DC için akımı hemen görün. Motor etiketinde yalnız HP yazıyorsa ikinci araç beygir gücünden akıma gider.',
 short='{ref.kw} kW ({ref.kwW} W) yük, tek fazda {ac.v1} V ve cosφ {akim.cos} ile {ref.kwI1} A, cosφ 1 ile {ref.kwI1c1} A çeker. Üç fazda {ac.v3} V\'ta aynı yük cosφ {akim.cos} ile {ref.kwI3} A, cosφ 1 ile {ref.kwI3c1} A eder. Formül: tek faz I = P ÷ (V × cosφ), üç faz I = P ÷ (√3 × V × cosφ), DC I = P ÷ V.',
 tools=['akim','hp-kw-amper'],
 inputs=[('Güç (W)','Cihazın etiketindeki aktif güç. kW değerini 1000 ile çarparak watt\'a çevirin.'),
  ('Gerilim (V)','Tek fazda faz-nötr, üç fazda faz-faz gerilimi; DC\'de akü ya da dizi gerilimi.'),
  ('cosφ','Güç katsayısı. Isıtıcı gibi saf dirençli yüklerde 1\'dir; motorlu ve elektronik yüklerde etikette yazar.'),
  ('Verim (motor aracı)','Motor etiketindeki HP mil gücüdür; şebekeden çekilen güç bunun verime bölünmüş hâlidir.')],
 mistakes=['Üç faz hesabında √3 çarpanını unutmak ya da faz-nötr gerilimini kullanmak.','cosφ\'yi 1 kabul edip motorun akımını olduğundan düşük bulmak.','Motorlarda kalkış akımını hesaba katmadan sigorta ve inverter seçmek.','kW ile kVA\'yı aynı şey saymak: aradaki fark cosφ\'dir.'],
 limits='Hesap dengeli yük ve sabit gerilim varsayar. Motorlarda sonuç tam yükteki çalışma akımıdır; kalkış akımı bunun üstündedir ve motor üreticisi verir. Etikette anma akımı yazıyorsa o değer esas alınır.',
 faq=[('1 kW kaç amper eder?','Gerilime ve güç katsayısına bağlıdır. Tek fazda {ac.v1} V\'ta cosφ 1 ile {ref.kwI1c1} A, cosφ {akim.cos} ile {ref.kwI1} A; üç fazda {ac.v3} V\'ta cosφ 1 ile {ref.kwI3c1} A, cosφ {akim.cos} ile {ref.kwI3} A eder.'),
  ('{akim.p} W cihaz kaç amper çeker?','cosφ {akim.cos} varsayımıyla tek fazda ({ac.v1} V) {akim.i1} A, üç fazda ({ac.v3} V) {akim.i3} A çeker. Aynı güç {akim.dcV} V DC sistemde {akim.idc} A eder; düşük gerilimde akımın neden büyüdüğü buradan görülür.'),
  ('{motor.hp} HP motor kaç amper çeker?','Mil gücü {motor.hp} ÷ {cev.hpPerKw} = {motor.shaft} kW\'tır. Örnek etiket değerleriyle (verim {motor.eff}, cosφ {motor.cos}) çekilen güç {motor.in} kW, akım tek fazda {motor.i1} A, üç fazda {motor.i3} A olur. Kendi motorunuzun etiketindeki verim ve cosφ ile yeniden hesaplayın; kalkış akımı dahil değildir.'),
  ('Amperden kW nasıl hesaplanır?','Formül tersine çevrilir: tek fazda P = V × I × cosφ, üç fazda P = √3 × V × I × cosφ, DC\'de P = V × I. Sonucu 1000\'e bölerek kW bulunur.')],
 sib=['trifaze-akim-hesaplama','kva-kw-cevirme','kablo-kesiti-hesaplama','ohm-kanunu-hesaplama'],prod=[('solar-sulama-pompasi-secimi.html','Solar sulama pompası seçim rehberi'),('tarimsal-sulama.html','Güneş enerjili tarımsal sulama'),('sistem-kur.html','Sistem Kurucu')]),

dict(slug='trifaze-akim-hesaplama',crumb='Trifaze Akım Hesabı',init='xbKind=3;xaPhase=3',
 title='Trifaze Akım ve Güç Hesabı (Formül ve Araç) | GESPA',
 desc='Trifaze akım hesaplama: I = P/(√3·V·cosφ). Üç fazlı yükün akımını, gücünü ve hat gerilim düşümünü formül ve örnekle hesaplayan ücretsiz araç.',
 h1='Trifaze Akım ve Güç Hesabı',
 lead='Üç fazlı (trifaze) dengeli bir yükün akımını güçten, gücünü akımdan hesaplayın; aynı sayfada hattın gerilim düşümüne de bakın. Araçlar bu sayfada üç faz seçili açılır.',
 short='Üç fazlı dengeli yükte I = P ÷ (√3 × V × cosφ); V faz-faz gerilimidir. Örnek: {akim.p} W yük, {ac.v3} V ve cosφ {akim.cos} için {akim.i3} A. Güç ise P = √3 × V × I × cosφ ile bulunur.',
 tools=['akim','ac-kablo'],
 inputs=[('Güç','Üç fazın TOPLAM aktif gücü (W). Faz başına güç değil.'),
  ('Gerilim','Faz-faz (hat) gerilimi. Faz-nötr gerilimi ile karıştırılmamalıdır; ikisi arasındaki oran √3\'tür.'),
  ('cosφ','Yükün güç katsayısı; motor ve cihaz etiketinde yazar.'),
  ('Akım','Sonuç her bir faz iletkeninden geçen hat akımıdır.')],
 mistakes=['Toplam gücü üçe bölmeden tek faz formülüne koymak ya da faz başına gücü üç faz formülüne koymak.','Faz-nötr gerilimini (tek faz değeri) üç faz formülünde kullanmak.','Dengesiz yüklerde tek bir akım değeri beklemek: formül dengeli yük içindir.'],
 limits='Formül dengeli, sinüzoidal üç fazlı yük içindir. Fazlar arasında dengesiz dağılmış tek fazlı yüklerde her fazın akımı ayrı hesaplanır ve nötr akımı oluşur; bu hesap tasarımcının işidir. Motorlarda kalkış akımı sonuçta yoktur.',
 faq=[('Trifaze akım formülü nedir?','I = P ÷ (√3 × V × cosφ). P toplam aktif güç (W), V faz-faz gerilimi, cosφ güç katsayısıdır. Örnek: {akim.p} W, {ac.v3} V, cosφ {akim.cos} → {akim.i3} A.'),
  ('Trifaze 1 kW kaç amper çeker?','{ac.v3} V\'ta {ref.kw} kW yük cosφ 1 ile {ref.kwI3c1} A, cosφ {akim.cos} ile {ref.kwI3} A çeker. Aynı güç tek fazda ({ac.v1} V) cosφ 1 ile {ref.kwI1c1} A eder.'),
  ('Trifaze güç nasıl hesaplanır?','Akım biliniyorsa P = √3 × V × I × cosφ. Görünür güç için cosφ çarpanı atılır: S = √3 × V × I (VA). Aktif güç ile görünür güç arasındaki ilişki kW = kVA × cosφ\'dir.'),
  ('Trifaze hatta gerilim düşümü nasıl hesaplanır?','ΔV = √3 × I × L × ρ × cosφ ÷ S ve yüzde, faz-faz gerilimine göre verilir. Örnek: {ac.i} A, {ac.len} m, {ac.s} mm² ve cosφ {ac.cos} için {ac.drop3} V, yani %{ac.pct3}.')],
 sib=['kw-amper-hesaplama','gerilim-dusumu-hesaplama','kva-kw-cevirme','kablo-kesiti-hesaplama'],prod=[('arazi-ges.html','Arazi tipi GES'),('cati-ges.html','Çatı GES'),('tarimsal-sulama.html','Güneş enerjili tarımsal sulama')]),

dict(slug='kva-kw-cevirme',crumb='kVA kW Çevirme',
 title='kVA kW Çevirme: 1 kVA Kaç kW Eder? | GESPA',
 desc='kVA kW çevirme: kW = kVA × cosφ, kVA = kW ÷ cosφ. 1 kVA kaç kW eder, jeneratör ve inverter etiketindeki kVA nasıl okunur: formül ve ücretsiz çevirici.',
 h1='kVA kW Çevirme: 1 kVA Kaç kW Eder?',
 lead='kW ile kVA arasındaki tek bağ güç katsayısıdır (cosφ). Sağdaki çeviricide cosφ\'yi yazın, kW ya da kVA alanından birini doldurun; diğeri hesaplanır.',
 short='kW = kVA × cosφ ve kVA = kW ÷ cosφ. cosφ {akim.cos} için {ref.kva} kVA = {ref.kvaKw} kW; {akim.kw} kW ise {akim.kva} kVA eder. cosφ 1 olduğunda kVA ile kW eşittir.',
 tools=['akim'],
 inputs=[('kW (aktif güç)','İşe dönüşen güç: ısı, ışık, mekanik iş. Elektrik faturası bu güçten üretilen enerjiye (kWh) göre kesilir.'),
  ('kVA (görünür güç)','Gerilim × akım. Jeneratör, trafo, UPS ve birçok inverterin kapasitesi kVA ile verilir, çünkü cihazı sınırlayan akımdır.'),
  ('cosφ','Güç katsayısı; aktif gücün görünür güce oranıdır. Yükün etiketinde yazar; cihazın kVA–kW ilişkisi için kendi künyesindeki değer kullanılır.')],
 mistakes=['kVA değerini doğrudan kW saymak: cosφ 1\'den küçükse kullanılabilir aktif güç daha azdır.','Yükün cosφ\'si yerine kaynağın (jeneratör, inverter) anma cosφ\'sini kullanmak ya da tersini yapmak.','kVA ile kVAr\'ı (reaktif güç) karıştırmak.'],
 limits='Çevirici yalnızca tanım formülünü uygular. Bir jeneratör ya da inverterin gerçekte kaç kW verebileceği kendi künyesinde yazar; bu sayfa cihaz türlerine göre tipik cosφ değeri vermez. Motorlu yüklerin kalkış gücü ayrıca değerlendirilir.',
 faq=[('1 kVA kaç kW eder?','cosφ ile çarpılır: kW = kVA × cosφ. cosφ {akim.cos} için {ref.kva} kVA = {ref.kvaKw} kW. cosφ 1 ise {ref.kva} kVA tam {ref.kva} kW eder.'),
  ('kW kVA\'ya nasıl çevrilir?','cosφ\'ye bölünür: kVA = kW ÷ cosφ. Örnek: {akim.kw} kW yük, cosφ {akim.cos} ile {akim.kva} kVA eder.'),
  ('kVA ile kW arasındaki fark nedir?','kW aktif güçtür, işe dönüşür. kVA görünür güçtür, gerilim ile akımın çarpımıdır ve kabloları, trafoyu, jeneratörü yükleyen değerdir. Aradaki oran güç katsayısıdır (cosφ).'),
  ('kVA\'dan amper nasıl hesaplanır?','Tek fazda I = VA ÷ V, üç fazda I = VA ÷ (√3 × V). Görünür güç zaten gerilim × akım olduğu için bu hesapta cosφ kullanılmaz.')],
 sib=['kw-amper-hesaplama','trifaze-akim-hesaplama','invertor-akuden-kac-amper-ceker','ohm-kanunu-hesaplama'],prod=[('hesaplayici.html#alet-cantasi','İnverter boyutlandırma aracı'),('sistem-kur.html','Sistem Kurucu'),('enerji-depolama.html','Enerji depolama')]),

dict(slug='gunes-paneli-acisi-hesaplama',crumb='Güneş Paneli Açısı',
 title='Güneş Paneli Açısı Kaç Derece Olmalı? Hesaplama | GESPA',
 desc='Güneş paneli açısı hesaplama: enleme göre yıl boyu, yaz ve kış eğimi (pratik kural), öğle güneş yüksekliği ve çatı eğimi derece–yüzde çevirici.',
 h1='Güneş Paneli Açısı Kaç Derece Olmalı?',
 lead='Enleminizi yazın ya da şehir seçin; yıl boyu, yaz ve kış için pratik kural eğimlerini ve öğle güneşinin yüksekliğini görün. Çatınızın eğimini yüzde olarak biliyorsanız ikinci araç dereceye çevirir.',
 short='Pratik kurala göre yıl boyu kullanım için eğim yaklaşık enleme eşittir; yaz ağırlıklı kullanımda enlem − {egim.delta}°, kış ağırlıklı kullanımda enlem + {egim.delta}°. {egim.lat}° enlemi için: yıl boyu ≈ {egim.tiltYear}°, yaz ≈ {egim.tiltSummer}°, kış ≈ {egim.tiltWinter}°. Bu bir başlangıç değeridir.',
 tools=['egim','cati-egimi'],
 inputs=[('Enlem','Bulunduğunuz yerin kuzey enlemi (derece). Listede olmayan yerler için harita uygulamasındaki ilk koordinat değeridir.'),
  ('Eğim','Panelin yatayla yaptığı açı. 0° yere paralel, 90° dik demektir. Panel güneye bakar.'),
  ('Mevsim','Şema, seçtiğiniz mevsimde öğle güneşinin yüksekliğini ve o mevsimin pratik eğimini gösterir.')],
 mistakes=['Eğimi çatı eğiminden bağımsız düşünmek: eğimli çatıda panel çoğunlukla çatı eğiminde kalır, ayrı konstrüksiyon rüzgâr yükünü artırır.','Eğimi doğru verip yönü ihmal etmek: güneyden sapma üretimi düşürür.','Sıra arası gölgeyi hesaba katmadan dik eğim seçmek; eğim arttıkça arka sıraya düşen gölge uzar.'],
 limits='Enlem ± {egim.delta}° sahada kullanılan bir pratik kuraldır, optimizasyon sonucu değildir. Gerçek en iyi açı yerel iklime, gölgeye, çatıya ve enerjiyi hangi mevsimde kullandığınıza göre değişir. Yönün üretime etkisi için <a href="hesaplayici.html">tasarruf hesaplayıcıdaki</a> çatı yönü seçeneğine, sıra aralığı için <a href="hesaplayici.html#alet-cantasi">sıra aralığı aracına</a> bakın.',
 faq=[('Güneş paneli kaç derece açıyla konur?','Pratik kural: yıl boyu kullanım için eğim ≈ enlem. {egim.lat}° enleminde bu yaklaşık {egim.tiltYear}° demektir. Yalnız yazın kullanılan sistemlerde ≈ {egim.tiltSummer}°, kış ağırlıklı kullanımda ≈ {egim.tiltWinter}° alınır.'),
  ('Kışın panel açısı neden daha dik olmalı?','Kışın öğle güneşi alçaktır: {egim.lat}° enleminde kış gündönümünde {egim.winter}°, yaz gündönümünde {egim.summer}° yüksekliktedir. Panel güneşe ne kadar dik bakarsa o kadar çok ışık alır; alçak güneş için panel dikleştirilir.'),
  ('Öğle güneşinin yüksekliği nasıl hesaplanır?','90 − enlem, ekinokslardaki değerdir; yaz gündönümünde {egim.dec}° eklenir, kış gündönümünde çıkarılır. {egim.lat}° enlemi için ekinoksta {egim.equinox}° eder.'),
  ('Çatı eğimi yüzde olarak verilmişse dereceye nasıl çevrilir?','derece = arctan(yüzde ÷ 100). Örnek: %{cati.pct2} eğim {cati.deg2}° eder; {cati.deg}° eğim ise %{cati.pct} demektir.')],
 sib=['golge-uzunlugu-hesaplama','cati-egimi-hesaplama','gunes-paneli-gunluk-uretim-hesaplama','gunes-paneli-seri-paralel-baglanti'],prod=P_PANEL),

dict(slug='gunes-paneli-gunluk-uretim-hesaplama',crumb='Panel Günlük Üretim',
 title='1 Güneş Paneli Günde Kaç kWh Üretir? Hesaplama | GESPA',
 desc='Güneş paneli günlük üretim hesaplama: kWh = kWp × güneş saati × sistem verimi. Panelin günde kaç kWh ürettiğini ve bir yükü kaç saat çalıştırdığını hesaplayın.',
 h1='1 Güneş Paneli Günde Kaç kWh Üretir?',
 lead='Panel gücünü yazın; tasarım günü için günlük üretimi ve bu enerjinin yazdığınız yükü kaç saat çalıştıracağını görün. Araç, sitemizdeki Sistem Kurucu ile aynı varsayımlarla açılır.',
 short='Tasarım günü tahmini: kWh/gün = kWp × güneş saati × sistem verimi. {uretim.p1} W\'lık tek panel ({uretim.p1kwp} kWp), {uretim.sun} güneş saati ve {uretim.eff} sistem verimiyle yaklaşık {uretim.p1kwh} kWh/gün üretir; bu, {uretim.load} W\'lık bir yükü {uretim.p1hours} saat çalıştıracak enerjidir.',
 tools=['gunluk-uretim'],
 inputs=[('Panel gücü (W)','Etiketteki Wp değeri; birden çok panel varsa toplamı. Bu güç standart test koşulları içindir, sahada sürekli elde edilmez.'),
  ('Güneş saati','Panelin tam güçte çalışmış sayılacağı eşdeğer saat (gün içindeki ışınımın toplamı). Gün uzunluğu değildir; mevsime ve konuma göre değişir.'),
  ('Sistem verimi','Panelden yüke kadar toplam kayıplar: sıcaklık, kablo, şarj kontrol cihazı, akü ve inverter.'),
  ('Yük (W)','İsteğe bağlıdır; üretilen enerjinin o yükü kaç saat besleyeceğini gösterir.')],
 mistakes=['Panel gücünü gün ışığı saatiyle çarpmak: 12 saat aydınlık, 12 saat tam güç demek değildir.','Yaz üretimine göre sistem kurmak; off-grid sistemlerde belirleyici olan kötü mevsimdir.','Üretilen enerjiyi gece kullanmak isteyip akü kapasitesini hesaba katmamak.'],
 limits='Sonuç bir tasarım günü tahminidir; ölçüm değildir. Açılıştaki güneş saati ve verim, Sistem Kurucu\'nun off-grid tasarım varsayımlarıdır; yazın üretim daha yüksek, kapalı günlerde daha düşüktür. Şebekeye bağlı çatı sistemlerinin yıllık üretimi için bölge verimini kullanan <a href="hesaplayici.html">tasarruf hesaplayıcıya</a> bakın.',
 faq=[('{uretim.p1} W panel günde kaç kWh üretir?','Sistem Kurucu varsayımlarıyla ({uretim.sun} güneş saati, {uretim.eff} sistem verimi) {uretim.p1kwp} × {uretim.sun} × {uretim.eff} = {uretim.p1kwh} kWh/gün. Güneş saatini kendi bölgenize göre değiştirerek aracı yeniden çalıştırın.'),
  ('{uretim.w} W güneş paneli neleri çalıştırır?','Aynı varsayımlarla günde yaklaşık {uretim.kwh} kWh üretir. Bu enerji {uretim.load} W\'lık bir yükü {uretim.hours} saat çalıştırır. Cihazlarınızın toplam günlük tüketimini <a href="cihaz-elektrik-tuketimi-hesaplama.html">cihaz tüketimi sayfasındaki</a> listeyle çıkarıp üretimle karşılaştırın.'),
  ('Güneş saati (peak sun hours) nedir?','Bir gün içinde panele düşen toplam ışınımın, 1000 W/m² ışınımda kaç saate eşit olduğunu gösterir. Panelin etiket gücü de bu ışınımda verildiği için kWp × güneş saati günlük ideal üretimi verir.'),
  ('Kışın üretim ne kadar düşer?','Güneş alçaldığı ve günler kısaldığı için düşer; oran konuma ve eğime bağlıdır, bu sayfa sabit bir yüzde vermez. Off-grid sistemler bu yüzden kış tasarım gününe göre boyutlandırılır.')],
 sib=['cihaz-elektrik-tuketimi-hesaplama','gunes-paneli-acisi-hesaplama','aku-kac-saat-dayanir','panel-sicaklik-guc-kaybi'],prod=P_PANEL),

dict(slug='gunes-paneli-seri-paralel-baglanti',crumb='Panel Seri–Paralel Bağlantı',
 title='Güneş Paneli Seri mi Paralel mi Bağlanır? Şema | GESPA',
 desc='Güneş paneli seri paralel bağlantı şeması: seri bağlamada gerilim, paralelde akım toplanır. Kaç panel seri bağlanır hesabı ve dizi sigortası kontrolü.',
 h1='Güneş Paneli Seri mi Paralel mi Bağlanır?',
 lead='Panel gerilimini, akımını ve dizilimi yazın; şema yeniden çizilir, toplam gerilim, akım ve güç hesaplanır. Altındaki araçlar bir diziye en çok kaç panel bağlanabileceğini ve paralel dizilerde sigorta gerekip gerekmediğini söyler.',
 short='Seri bağlamada gerilimler toplanır, akım aynı kalır; paralel bağlamada akımlar toplanır, gerilim aynı kalır. Örnek: Vmp {seri.v} V, Imp {seri.a} A panelle {seri.s} seri × {seri.p} paralel → {seri.totV} V, {seri.totA} A, {seri.totW} W. Hangisinin seçileceğini şarj kontrol cihazının ya da inverterin giriş gerilimi aralığı belirler.',
 tools=['seri-paralel','dizi','sigorta'],
 inputs=[('Panel gerilimi ve akımı','Çalışma noktası için Vmp ve Imp; cihazın giriş sınırı kontrolünde Voc, sigorta kontrolünde Isc kullanılır. Hepsi panelin arka etiketinde yazar.'),
  ('Seri panel sayısı','Bir dizideki panel sayısı; dizi gerilimini belirler.'),
  ('Paralel dizi sayısı','Birbirine paralel bağlanan eş dizilerin sayısı; toplam akımı belirler.'),
  ('Voc sıcaklık katsayısı','Soğukta gerilimin ne kadar yükseleceğini gösterir (%/°C, eksi işaretli); en çok seri panel sayısı bununla hesaplanır.')],
 mistakes=['Dizi gerilimini soğuk hava payı olmadan hesaplamak: kış sabahında Voc etiket değerinin üstüne çıkar ve cihazın giriş sınırını aşabilir.','Farklı güçte ya da farklı sayıda panel içeren dizileri paralellemek.','Paralel dizi sayısını artırıp dizi sigortası kontrolünü yapmamak.','PWM cihaza yüksek gerilimli seri dizi bağlamak.'],
 limits='Şema bağlantı mantığını gösterir, montaj projesi değildir. Araçlar ideal, eş paneller varsayar; gölge, kirlenme ve panel toleransı sonucu değiştirir. Sigorta kontrolü yalnızca (N − 1) × Isc karşılaştırmasıdır; sigortanın değeri ve tipi üretici talimatına göre tasarımcı tarafından seçilir.',
 faq=[('Güneş panelleri seri mi paralel mi bağlanmalı?','MPPT şarj kontrol cihazı ve inverterlerde genellikle seri: gerilim yükselir, akım düşer, kablo kaybı azalır. Sınır, cihazın en yüksek PV giriş gerilimidir. PWM cihazlarda panel gerilimi akü gerilimine yakın olmalıdır; bu yüzden paneller paralel bağlanır.'),
  ('Kaç panel seri bağlanır?','En çok panel sayısı = cihazın giriş sınırı ÷ panelin soğuktaki Voc değeri, aşağı yuvarlanır. Örnek değerlerle: Voc {dizi.voc} V, katsayı {dizi.beta} %/°C ve {dizi.tmin} °C için soğuk Voc {dizi.cold} V; {dizi.vmax} V girişli cihaza en çok {dizi.max} panel.'),
  ('Paralel bağlı panellere sigorta gerekir mi?','Arızalı bir diziye diğerlerinden akabilecek ters akım (N − 1) × Isc kadardır. Bu, panel etiketindeki en yüksek seri sigorta değerini aşıyorsa gerekir. Örnek: Isc {sigorta.isc} A, etiket {sigorta.max} A ve {sigorta.n} paralel dizi → {sigorta.rev} A, sigorta {sigorta.verdict}.'),
  ('Seri bağlı panellerden biri gölgede kalırsa ne olur?','Seri dizide akım ortaktır; gölgedeki panel bütün dizinin akımını sınırlar. Panellerin içindeki baypas diyotları etkiyi azaltır ama kayıp sürer. Gölge alan paneller ayrı bir diziye alınmaya çalışılır.')],
 sib=['mppt-kac-amper-olmali','solar-kablo-kesiti-hesaplama','gunes-paneli-acisi-hesaplama','aku-seri-paralel-baglanti'],prod=P_PANEL+[('mc4-set.html','MC4 konnektör takımı')]),

dict(slug='aku-kac-saat-dayanir',crumb='Akü Kaç Saat Dayanır',
 title='Akü Kaç Saat Dayanır? Hesaplama Aracı | GESPA',
 desc='Akü kaç saat dayanır hesaplama: saat = V × Ah × DoD × verim ÷ yük. 100 Ah akü kaç saat gider, C oranı nedir: formül, örnek ve ücretsiz araç.',
 h1='Akü Kaç Saat Dayanır?',
 lead='Akünün gerilimini, kapasitesini ve yükün gücünü yazın; yaklaşık çalışma süresini saat ve dakika olarak görün. Kullanılabilir oran (DoD) ve inverter verimi düzenlenebilir varsayımlardır.',
 short='Süre (saat) = akü gerilimi × Ah × DoD × inverter verimi ÷ yük gücü. Örnek: {sure.v} V {sure.ah} Ah akü, DoD {sure.dod}, verim {sure.eta} ve {sure.load} W yük için kullanılabilir enerji {sure.wh} Wh, süre {sure.h} saattir.',
 tools=['aku-sure','c-orani'],
 inputs=[('Akü gerilimi ve Ah','Etiketteki anma değerleri. İkisinin çarpımı akünün toplam enerjisini (Wh) verir.'),
  ('DoD (deşarj derinliği)','Kapasitenin ne kadarının kullanılacağı. Akü tipine göre değişir; değeri akü üreticisinin künyesinden alın.'),
  ('İnverter verimi','Yük 220 V AC ise aküden çekilen enerjinin bir bölümü inverterde kaybolur. Yük doğrudan DC ise %100 yazın.'),
  ('Yük (W)','Aynı anda çalışan cihazların toplam gücü.')],
 mistakes=['Ah değerini doğrudan saat sanmak: 100 Ah, 100 saat demek değildir; süre yükün çektiği akıma bağlıdır.','Akünün tamamını kullanılabilir saymak ve DoD\'yi hesaba katmamak.','Buzdolabı gibi aralıklı çalışan cihazların etiket gücünü sürekli yük gibi yazmak.','12 V aküyle yüksek güçlü inverter çalıştırıp aküden çekilen akımı hesaplamamak.'],
 limits='Sonuç bir üst sınırdır. Akü yaşlandıkça ve soğukta kapasite düşer; kurşun-asit akülerde yüksek akımla deşarjda alınabilen kapasite azalır. Açılıştaki DoD, Sistem Kurucu\'nun lityum akü varsayımıdır; bu sayfa akü tiplerine göre DoD tablosu vermez.',
 faq=[('{sure.ah} Ah akü kaç saat dayanır?','Yüke bağlıdır. {sure.v} V {sure.ah} Ah akü, DoD {sure.dod} ve inverter verimi {sure.eta} ile {sure.wh} Wh kullanılabilir enerji verir; {sure.load} W yükte bu {sure.h} saat eder. Yük yarıya inerse süre iki katına çıkar.'),
  ('Akü süresi nasıl hesaplanır?','Önce kullanılabilir enerji bulunur: V × Ah × DoD × verim. Sonra yükün gücüne bölünür. Birim kontrolü: V × Ah = Wh, Wh ÷ W = saat.'),
  ('C oranı süreyi nasıl etkiler?','C oranı akımın kapasiteye oranıdır: I = C × Ah, süre = 1 ÷ C saat. {c.ah} Ah aküde {c.c}C, {c.i} A demektir ve tam kapasite {c.h} saatte biter. Akünün izin verdiği en yüksek deşarj C oranı künyesinde yazar.'),
  ('Aynı Ah değerinde 12 V ve 24 V akü aynı süre mi dayanır?','Hayır. Enerji V × Ah olduğundan {ref.ah} Ah akü {ref.ahV12} V\'ta {ref.ahKwh12} kWh, {ref.ahV24} V\'ta {ref.ahKwh24} kWh depolar; aynı yükü iki kat süre besler.')],
 sib=['ah-kwh-cevirme','aku-seri-paralel-baglanti','invertor-akuden-kac-amper-ceker','cihaz-elektrik-tuketimi-hesaplama'],prod=P_BAT),

dict(slug='aku-seri-paralel-baglanti',crumb='Akü Seri–Paralel Bağlantı',
 title='Akü Seri Paralel Bağlantı Şeması (24 V / 48 V) | GESPA',
 desc='Akü seri paralel bağlantı şeması: seri bağlamada volt, paralelde Ah toplanır. 12 V akülerle 24 V ve 48 V banka nasıl kurulur, kWh nasıl hesaplanır.',
 h1='Akü Seri-Paralel Bağlantı Şeması (24 V / 48 V)',
 lead='Tek akünün gerilimini ve kapasitesini, seri ve paralel sayısını yazın; bağlantı şeması çizilir, bankanın gerilimi, Ah değeri ve kWh enerjisi hesaplanır.',
 short='Seri bağlamada gerilim toplanır, Ah aynı kalır; paralel bağlamada Ah toplanır, gerilim aynı kalır. {aku.v} V akülerle {ref.bankV24} V için {ref.bankN24}, {ref.bankV48} V için {ref.bankN48} akü seri bağlanır. Örnek: {aku.s} seri × {aku.p} paralel {aku.v} V {aku.ah} Ah akü = {aku.totV} V, {aku.totAh} Ah, {aku.kwh} kWh.',
 tools=['aku'],
 inputs=[('Tek akü gerilimi','Etiketteki anma gerilimi.'),
  ('Tek akü kapasitesi (Ah)','Etiketteki anma kapasitesi.'),
  ('Seri sayısı','Art arda (artı ucu sonraki akünün eksi ucuna) bağlanan akü sayısı; banka gerilimini belirler.'),
  ('Paralel kol sayısı','Yan yana bağlanan eş seri kolların sayısı; banka kapasitesini belirler.')],
 mistakes=['Farklı yaşta, tipte ya da kapasitede aküleri aynı bankaya koymak: zayıf akü bütün bankayı sınırlar.','Paralel kollarda farklı uzunlukta bağlantı kabloları kullanmak; akım kollara eşit dağılmaz.','Seri bağlı akülerde kutupları karıştırmak: bağlamadan önce ölçü aletiyle toplam gerilimi kontrol edin.','Bankanın gerilimini inverter ve şarj kontrol cihazının akü gerilimiyle eşleştirmemek.'],
 limits='Araç yalnızca toplam gerilimi, kapasiteyi ve enerjiyi hesaplar. Lityum akülerin (dahili BMS\'li) seri ya da paralel bağlanıp bağlanamayacağı ve en çok kaç adet bağlanabileceği akü üreticisinin talimatında yazar; teyit etmeden bağlamayın. Kablo kesiti, sigorta ve dengeleme tasarımcının işidir.',
 faq=[('12 V aküler 24 V için nasıl bağlanır?','İki akü seri bağlanır: birinin artı ucu diğerinin eksi ucuna; boşta kalan iki uç bankanın çıkışıdır. Gerilim {aku.v} × {ref.bankN24} = {ref.bankV24} V olur, Ah değişmez. {ref.bankV48} V için {ref.bankN48} akü seri bağlanır.'),
  ('Aküler paralel bağlanınca ne değişir?','Gerilim aynı kalır, kapasiteler toplanır. İki adet {aku.v} V {aku.ah} Ah akü paralel bağlanınca {aku.v} V {aku.totAh} Ah eder; süre uzar, gerilim değişmez.'),
  ('Seri mi paralel mi bağlamak daha iyi?','Depolanan enerji aynıdır: kWh = V × Ah ÷ 1000 bağlantı şekline göre değişmez. Fark akımdadır: aynı güç yüksek gerilimde daha düşük akımla taşınır, kablo ve inverter tarafında kayıp azalır. Gerilimi inverterinizin akü gerilimi belirler.'),
  ('Akü bankası kaç kWh eder?','kWh = banka gerilimi × banka Ah ÷ 1000. Örnek: {aku.totV} V × {aku.totAh} Ah ÷ 1000 = {aku.kwh} kWh. Kullanılabilir enerji, akünün izin verdiği deşarj derinliği kadar daha azdır.')],
 sib=['aku-kac-saat-dayanir','ah-kwh-cevirme','mppt-kac-amper-olmali','invertor-akuden-kac-amper-ceker'],prod=P_BAT),

dict(slug='mppt-kac-amper-olmali',crumb='MPPT Kaç Amper Olmalı',
 title='MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı? | GESPA',
 desc='MPPT şarj kontrol cihazı kaç amper olmalı: akım = panel gücü ÷ akü gerilimi. Panel giriş gerilimi sınırı için kaç panel seri bağlanır hesabıyla birlikte.',
 h1='MPPT Şarj Kontrol Cihazı Kaç Amper Olmalı?',
 lead='Panel dizinizin toplam gücünü ve akü gerilimini yazın; şarj kontrol cihazının en az kaç amper olması gerektiğini görün. İkinci araç, cihazın PV giriş gerilimi sınırına göre en çok kaç paneli seri bağlayabileceğinizi hesaplar.',
 short='En az çıkış akımı = toplam panel gücü ÷ akü sistem gerilimi. Örnek: {sk.w} W panel ve {sk.v} V akü için {sk.w} ÷ {sk.v} = {sk.i} A. Üretici pay ya da panel gücü sınırı veriyorsa o esas alınır; ayrıca dizinin soğuktaki Voc değeri cihazın giriş gerilimi sınırını aşmamalıdır.',
 tools=['sarj-kontrol','dizi'],
 inputs=[('Panel dizisi gücü (W)','Cihaza bağlanacak bütün panellerin etiket gücü toplamı.'),
  ('Akü sistem gerilimi','12, 24 ya da 48 V gibi akü bankasının anma gerilimi; panel gerilimi değil.'),
  ('En yüksek PV giriş gerilimi','Cihazın etiketindeki sınır. Dizinin en soğuk havadaki Voc toplamı bunun altında kalmalıdır.'),
  ('MPPT alt gerilimi','Cihazın izleme yapabildiği en düşük panel gerilimi; etiketinde ya da kılavuzunda yazar.')],
 mistakes=['Cihazı yalnızca akıma göre seçip panel giriş gerilimi sınırını kontrol etmemek.','Akımı panel gerilimine bölerek hesaplamak: MPPT çıkış akımı akü gerilimine göre bulunur.','PWM cihazı MPPT gibi hesaplamak; PWM\'de akım, panellerin toplam Isc değerine göre seçilir.','Akü gerilimini yükseltince aynı cihazın daha çok panel gücü taşıyabileceğini gözden kaçırmak.'],
 limits='Sonuç, pay eklenmemiş en küçük değerdir. Cihaz üreticisi akü gerilimine göre bağlanabilecek en yüksek panel gücünü ayrıca belirtebilir; künyedeki sınır her zaman önce gelir. Mağazamızdaki bazı cihazların künyesinde yalnız akım ve akü gerilimi yazar; diğer değerler için bize yazın. PWM ile MPPT farkı için <a href="pwm-mppt-sarj-kontrol-farki.html">seçim rehberine</a> bakın.',
 faq=[('Şarj kontrol cihazı akımı nasıl hesaplanır?','MPPT için toplam panel gücü akü gerilimine bölünür: {sk.w} W ÷ {sk.v} V = {sk.i} A. Çıkan değerin üstündeki ilk cihaz seçilir; üreticinin belirttiği pay ya da panel gücü sınırı varsa ona uyulur.'),
  ('Aynı panellerle 12 V yerine 24 V akü kullanırsam ne değişir?','Akü gerilimi iki katına çıkınca aynı panel gücü için akım yarıya iner; aynı amperdeki cihaz iki kat panel gücü taşıyabilir ve akü tarafı kabloları incelir.'),
  ('MPPT cihazına kaç panel seri bağlanır?','Cihazın en yüksek PV giriş gerilimi ÷ panelin soğuktaki Voc değeri, aşağı yuvarlanır. Örnek değerlerle soğuk Voc {dizi.cold} V ve {dizi.vmax} V giriş için en çok {dizi.max} panel; MPPT alt gerilimi {dizi.mpptMin} V ise en az {dizi.min} panel.'),
  ('Panel gücü cihazın akımını aşarsa ne olur?','Üreticiye göre değişir: bazı cihazlar akımı kendi sınırında tutar ve fazla enerjiyi kullanmaz, bazıları için izin verilen en yüksek panel gücü kesin sınırdır. Cihazın kılavuzundaki değere uyun.')],
 sib=['gunes-paneli-seri-paralel-baglanti','aku-seri-paralel-baglanti','solar-kablo-kesiti-hesaplama','invertor-akuden-kac-amper-ceker'],prod=P_CC),

dict(slug='invertor-akuden-kac-amper-ceker',crumb='İnvertör Akü Akımı',
 title='İnvertör Aküden Kaç Amper Çeker? Hesaplama | GESPA',
 desc='İnvertör aküden kaç amper çeker: I = yük ÷ (akü gerilimi × verim). 1000 W inverter 12 V aküden kaç amper çeker, akü kablosu nasıl hesaplanır: ücretsiz araç.',
 h1='İnvertör Aküden Kaç Amper Çeker?',
 lead='Yükün gücünü, akü gerilimini ve inverter verimini yazın; aküden çekilen akımı görün. Tek tıkla bu akımı alttaki DC kablo aracına aktarıp akü–inverter kablosundaki gerilim düşümüne bakın.',
 short='Akü akımı = yük gücü ÷ (akü gerilimi × inverter verimi). Örnek: {cev.w} W yük, {cev.v} V akü ve %{cev.eta} verim varsayımıyla {cev.inv} A. Aynı yük daha yüksek akü geriliminde orantılı olarak daha az akım çeker.',
 tools=['inverter-aku-akimi','kablo'],
 inputs=[('Yük (W)','İnverterin o anda beslediği cihazların toplam gücü; inverterin etiket gücü değil. En kötü durumu görmek için inverterin anma gücünü yazabilirsiniz.'),
  ('Akü gerilimi','Akü bankasının anma gerilimi. Akü boşaldıkça gerilim düşer ve aynı güç için akım biraz artar.'),
  ('İnverter verimi','İnverterin künyesindeki verim. Açılıştaki değer Sistem Kurucu\'nun varsayımıdır.')],
 mistakes=['12 V aküyle yüksek güçlü inverter kullanmak: akım çok yükselir, kablo ve bağlantılar ısınır.','Akü–inverter kablosunu uzun tutmak; bu hat sistemin en yüksek akımlı hattıdır.','Motorlu cihazların kalkış akımını hesaba katmamak.','Akünün izin verdiği en yüksek deşarj akımını (C oranı) kontrol etmemek.'],
 limits='Sonuç sürekli çalışma akımıdır; kalkış akımı ve inverterin boşta tüketimi dahil değildir. Bu sayfa sigorta değeri ve kablo akım kapasitesi vermez: ikisi için inverter ve kablo üreticisinin verisi esastır. Akünün bu akımı verip veremeyeceği künyesindeki en yüksek deşarj akımına bağlıdır.',
 faq=[('{cev.w} W inverter {cev.v} V aküden kaç amper çeker?','Tam yükte {cev.w} ÷ ({cev.v} × {cev.etaDec}) = {cev.inv} A (verim %{cev.eta} varsayımıyla). Yük daha azsa akım da orantılı olarak azalır.'),
  ('Akü gerilimi yükselince akım neden düşer?','Güç = gerilim × akım olduğundan aynı güç iki kat gerilimde yarı akımla taşınır. Bu yüzden güç büyüdükçe 24 V ve 48 V akü bankaları tercih edilir.'),
  ('İnverter akü kablosu kaç mm² olmalı?','Önce bu sayfada akımı bulun, sonra kablo aracına aktarıp gerilim düşümüne bakın. Kablonun bu akımı taşıyıp taşıyamayacağını kablo üreticisinin tablosundan, önerilen kesiti inverterin kılavuzundan kontrol edin.'),
  ('İnverter boştayken aküden akım çeker mi?','Evet, her inverterin künyesinde yazan bir boşta tüketimi vardır. Bu araç yalnızca yüke giden akımı hesaplar; boşta tüketim için cihazın künyesine bakın.')],
 sib=['aku-kac-saat-dayanir','solar-kablo-kesiti-hesaplama','aku-seri-paralel-baglanti','kva-kw-cevirme'],prod=P_BAT),

dict(slug='awg-mm2-cevirme',crumb='AWG mm² Çevirme',
 title='AWG mm² Çevirme: AWG Kablo Kesiti Tablosu | GESPA',
 desc='AWG mm² çevirme aracı ve hesaplanmış tablo: AWG numarasından çap ve kesit (mm²), mm² değerinden en yakın AWG. Formül: d = 0,127 × 92^((36−n)/39).',
 h1='AWG mm² Çevirme',
 lead='AWG numarasını seçin, çapını ve mm² kesitini görün; ya da mm² değerini yazın, hangi iki AWG numarasının arasına düştüğünü öğrenin. Şema iki kesiti aynı ölçekte gösterir.',
 short='AWG numarası n olan dolu telin çapı d = 0,127 × 92^((36 − n) ÷ 39) mm, kesiti π × d² ÷ 4 mm²\'dir. Örnek: AWG {cev.awg} = {cev.awgD} mm çap = {cev.awgA} mm². Numara küçüldükçe tel kalınlaşır.',
 tools=['awg-mm2'],
 extra='<h2 id="tablo">AWG – mm² tablosu (formülden hesaplanmıştır)</h2>\n<p>Aşağıdaki değerler tanım formülünden hesaplanmış çap ve kesitlerdir; dolu (tek telli) iletken içindir. <strong>Akım taşıma kapasitesi değildir</strong>; o değer için kablo üreticisinin tablosuna bakılır.</p>\n<div class="art-table-wrap"><table class="art-table"><thead><tr><th>AWG</th><th>Çap</th><th>Kesit</th></tr></thead><tbody>'+AWG_ROWS+'</tbody></table></div>',
 inputs=[('AWG numarası','Amerikan tel ölçüsü. 1/0, 2/0, 3/0 ve 4/0 (0, 00, 000, 0000) sıfırdan kalın tellerdir.'),
  ('Kesit (mm²)','Metrik iletken kesit alanı. Araç bu değerin hangi iki AWG arasında kaldığını ve o AWG\'lerin kesitlerini gösterir.')],
 mistakes=['AWG ile mm² değerlerini birebir eşleştirmek: iki sistemin basamakları örtüşmez.','AWG kablonun yerine daha küçük kesitli metrik kablo kullanmak; hesaplanan mm² değerinin altına inilmez.','Çok telli kablonun dış çapını dolu tel çapıyla karşılaştırmak: çok telli iletken aynı kesitte biraz daha kalındır.','Tablodaki kesiti akım kapasitesi sanmak.'],
 limits='Formül tek telli (dolu) yuvarlak iletkenin anma ölçüsünü verir. Çok telli kabloların dış çapı ve yalıtım kalınlığı üreticiye göre değişir. Bir cihazın kılavuzu AWG ile kablo istiyorsa, metrik karşılığı seçerken kesit olarak eşit ya da büyük olanı alın ve akım kapasitesini üretici tablosundan doğrulayın.',
 faq=[('AWG {cev.awg} kaç mm² eder?','Çap 0,127 × 92^((36 − {cev.awg}) ÷ 39) = {cev.awgD} mm, kesit π × d² ÷ 4 = {cev.awgA} mm². Metrik basamaklarda tam karşılığı yoktur; eşit ya da büyük kesit seçilir.'),
  ('AWG numarası büyüdükçe kablo kalınlaşır mı?','Hayır, incelir. AWG numarası telin çekme işlemindeki adım sayısından gelir: numara büyüdükçe çap küçülür. Her 6 numara azalışta çap yaklaşık iki katına, her 3 numara azalışta kesit yaklaşık iki katına çıkar.'),
  ('mm² AWG\'ye nasıl çevrilir?','Önce çap bulunur: d = √(4 × S ÷ π). Sonra n = 36 − 39 × log₉₂(d ÷ 0,127). Sonuç çoğunlukla tam sayı çıkmaz; araç iki komşu AWG numarasını ve kesitlerini gösterir.'),
  ('AWG tablosundan akım okunur mu?','Bu sayfadaki tablodan hayır: yalnızca çap ve kesit hesaplanmıştır. Bir kablonun taşıyabileceği akım yalıtıma, döşeme şekline ve sıcaklığa bağlıdır ve kablo üreticisinin tablosunda yer alır.')],
 sib=['kablo-kesiti-hesaplama','solar-kablo-kesiti-hesaplama','gerilim-dusumu-hesaplama','ohm-kanunu-hesaplama'],prod=P_CABLE),

dict(slug='ah-kwh-cevirme',crumb='Ah kWh Çevirme',
 title='100 Ah Akü Kaç kWh Eder? Ah kWh Çevirme | GESPA',
 desc='Ah kWh çevirme: kWh = Ah × V ÷ 1000. 100 Ah akü 12 V, 24 V ve 48 V sistemde kaç kWh eder, Wh amper saate nasıl çevrilir: formül ve ücretsiz çevirici.',
 h1='100 Ah Akü Kaç kWh Eder?',
 lead='Amper saat (Ah) tek başına enerji değildir; gerilimle çarpılınca watt saat (Wh) olur. Gerilimi ve Ah ya da Wh değerinden birini yazın, diğeri hesaplansın.',
 short='kWh = Ah × V ÷ 1000. {ref.ah} Ah akü {ref.ahV12} V\'ta {ref.ahKwh12} kWh, {ref.ahV24} V\'ta {ref.ahKwh24} kWh, {ref.ahV48} V\'ta {ref.ahKwh48} kWh eder. Aynı Ah değeri, gerilim arttıkça daha çok enerji demektir.',
 tools=['ah-wh'],
 extra='<h2 id="tablo">{ref.ah} Ah kaç kWh? (hesaplanmış)</h2>\n<div class="art-table-wrap"><table class="art-table"><thead><tr><th>Akü gerilimi</th><th>Hesap</th><th>Enerji</th></tr></thead><tbody><tr><td>{ref.ahV12} V</td><td>{ref.ah} × {ref.ahV12} ÷ 1000</td><td>{ref.ahKwh12} kWh</td></tr><tr><td>{ref.ahV24} V</td><td>{ref.ah} × {ref.ahV24} ÷ 1000</td><td>{ref.ahKwh24} kWh</td></tr><tr><td>{ref.ahV48} V</td><td>{ref.ah} × {ref.ahV48} ÷ 1000</td><td>{ref.ahKwh48} kWh</td></tr></tbody></table></div>\n<p>Tablo anma gerilimiyle hesaplanmış toplam enerjidir; kullanılabilir enerji akünün izin verdiği deşarj derinliği kadar daha azdır.</p>',
 inputs=[('Gerilim (V)','Akünün ya da akü bankasının anma gerilimi. Lityum akülerde etikette 51,2 V gibi küsuratlı değerler yazabilir; etiketteki değeri kullanın.'),
  ('Kapasite (Ah)','Etiketteki amper saat değeri.'),
  ('Enerji (Wh)','1000 Wh = 1 kWh. Elektrik faturasındaki birim kWh\'tir.')],
 mistakes=['Farklı gerilimdeki aküleri yalnız Ah değeriyle karşılaştırmak.','Toplam enerjiyi kullanılabilir enerji saymak.','Güç istasyonlarında Wh yerine telefon bataryası alışkanlığıyla mAh değerine bakmak: mAh, gerilim bilinmeden enerjiyi göstermez.'],
 limits='Çevirici yalnızca tanım formülünü uygular: Wh = Ah × V. Akünün gerilimi şarj durumuna göre değişir; hesap anma gerilimiyle yapılır. Kullanılabilir enerji ve çalışma süresi için <a href="aku-kac-saat-dayanir.html">akü kaç saat dayanır</a> sayfasına bakın.',
 faq=[('{ref.ah} Ah akü kaç kWh eder?','Gerilime bağlıdır: {ref.ahV12} V\'ta {ref.ahKwh12} kWh, {ref.ahV24} V\'ta {ref.ahKwh24} kWh, {ref.ahV48} V\'ta {ref.ahKwh48} kWh. Formül: kWh = Ah × V ÷ 1000.'),
  ('kWh amper saate nasıl çevrilir?','Ah = Wh ÷ V. Önce kWh 1000 ile çarpılarak Wh\'e çevrilir, sonra akü gerilimine bölünür. Örnek: {cev.wh} Wh ÷ {cev.v} V = {cev.ah} Ah.'),
  ('Ah ile Wh arasındaki fark nedir?','Ah yük miktarıdır (akım × süre), Wh enerjidir (güç × süre). İkisini birbirine gerilim bağlar. Cihazların tüketimi watt ile verildiği için süre hesabında Wh kullanılır.'),
  ('İki aküyü bağlayınca Ah mi artar kWh mi?','kWh her iki bağlantıda da toplanır. Paralel bağlamada Ah toplanır, gerilim aynı kalır; seri bağlamada gerilim toplanır, Ah aynı kalır. Örnek: {aku.s} seri × {aku.p} paralel {aku.v} V {aku.ah} Ah akü {aku.kwh} kWh eder.')],
 sib=['aku-kac-saat-dayanir','aku-seri-paralel-baglanti','invertor-akuden-kac-amper-ceker','cihaz-elektrik-tuketimi-hesaplama'],prod=P_BAT),

dict(slug='cihaz-elektrik-tuketimi-hesaplama',crumb='Cihaz Elektrik Tüketimi',
 title='Cihaz Elektrik Tüketimi Hesaplama: Kaç kWh, Kaç TL? | GESPA',
 desc='Cihaz elektrik tüketimi hesaplama: kWh = W × saat × gün ÷ 1000. Cihaz kaç kWh harcar, kaç TL yakar; cihaz listesinden panel, akü ve inverter gücü.',
 h1='Cihaz Elektrik Tüketimi Hesaplama: Kaç kWh, Kaç TL?',
 lead='Tek bir cihazın aylık tüketimini ve tutarını hesaplayın; ya da cihazlarınızı listeye ekleyip günlük toplam tüketimi, buna göre gereken panel gücünü, akü kapasitesini ve inverter gücünü görün.',
 short='kWh = güç (W) × günlük saat × gün ÷ 1000; tutar = kWh × birim fiyat. Örnek: {tuk.w} W cihaz günde {tuk.h} saat, {tuk.days} gün çalışırsa {tuk.kwh} kWh harcar; {tuk.price} TL/kWh örnek birim fiyatla {tuk.cost} TL eder. Birim fiyatı kendi faturanızdan yazın.',
 tools=['cihaz-tuketimi','yuk-listesi'],
 inputs=[('Güç (W)','Cihazın etiketindeki watt değeri. Etikette yalnız amper yazıyorsa watt ≈ volt × amper × cosφ.'),
  ('Saat/gün','Cihazın günde fiilen çalıştığı süre. Buzdolabı gibi termostatlı cihazlar prizde 24 saat dursa da kompresör bu sürenin yalnız bir bölümünde çalışır.'),
  ('Birim fiyat','Tarifeye, tüketim kademesine ve vergilere göre değişir. Faturanızdaki toplam tutarı toplam kWh\'e bölerek kendi değerinizi bulun.'),
  ('Cihaz listesi','Hazır cihazlar ve senaryolar Sistem Kurucu\'daki varsayılan güç ve sürelerle gelir; her satırı kendi cihazınıza göre düzeltin.')],
 mistakes=['Etiket gücünü sürekli tüketim saymak: klima, buzdolabı ve termosifon aralıklı çalışır.','Bekleme (stand-by) tüketimini ve küçük ama 24 saat çalışan cihazları (modem, kamera) unutmak.','Güneş sistemi boyutlandırırken yalnız toplam kWh\'e bakıp aynı anda çalışan cihazların gücünü (inverter) hesaba katmamak.'],
 limits='Sonuçlar etiket gücüne ve yazdığınız sürelere dayanır; ölçüm değildir. Kesin tüketim priz tipi enerji ölçerle ya da faturadan bulunur. Listedeki inverter gücü kalkış akımını içermez; eşzamanlılık, kalkış payı ve ürün seçimiyle tam hesap için <a href="sistem-kur.html">Sistem Kurucu</a>\'yu kullanın.',
 faq=[('Bir cihazın kaç kWh harcadığı nasıl hesaplanır?','Güç (W) × çalışma saati ÷ 1000 = kWh. Örnek: {tuk.w} W cihaz günde {tuk.h} saat çalışırsa {tuk.days} günde {tuk.w} × {tuk.h} × {tuk.days} ÷ 1000 = {tuk.kwh} kWh harcar.'),
  ('Cihaz ayda kaç TL elektrik yakar?','Aylık kWh, birim fiyatla çarpılır. {tuk.kwh} kWh, {tuk.price} TL/kWh örnek birim fiyatla {tuk.cost} TL eder. Birim fiyat tarifeye göre değiştiği için kendi faturanızdaki değeri yazın.'),
  ('Günlük tüketimden kaç watt panel gerektiği nasıl bulunur?','Panel gücü = günlük Wh ÷ (güneş saati × sistem verimi). Örnek liste günde {liste.wh} Wh tüketir; {liste.sun} güneş saati ve {liste.eff} sistem verimiyle yaklaşık {liste.panelW} W panel gerekir.'),
  ('Aynı tüketim için kaç Ah akü gerekir?','Ah = günlük Wh × özerklik günü ÷ (akü gerilimi × DoD × inverter verimi). Örnek listede {liste.v} V akü ve {liste.days} gün için yaklaşık {liste.ah} Ah; aynı anda çalışan cihazlar için inverter en az {liste.inv} W olmalıdır (kalkış akımı hariç).')],
 sib=['gunes-paneli-gunluk-uretim-hesaplama','aku-kac-saat-dayanir','kw-amper-hesaplama','invertor-akuden-kac-amper-ceker'],prod=P_SYS),

dict(slug='golge-uzunlugu-hesaplama',crumb='Gölge Uzunluğu Hesaplama',
 title='Gölge Uzunluğu Hesaplama: Panel Gölgesi Kaç Metre? | GESPA',
 desc='Gölge uzunluğu hesaplama: gölge = yükseklik ÷ tan(güneş yüksekliği). Baca, parapet ya da panel sırasının kış öğlesinde düşürdüğü gölgeyi enleme göre hesaplayın.',
 h1='Gölge Uzunluğu Hesaplama',
 lead='Engelin yüksekliğini ve enleminizi yazın; öğle vaktindeki gölge uzunluğunu kış gündönümü, ekinoks ve yaz gündönümü için görün. Şema engeli, güneş ışınını ve gölgeyi ölçekli çizer.',
 short='Gölge uzunluğu = engel yüksekliği ÷ tan(öğle güneş yüksekliği). {golge.lat}° enleminde {golge.h} m yüksekliğindeki engelin öğle gölgesi kış gündönümünde {golge.winter} m, ekinoksta {golge.equinox} m, yaz gündönümünde {golge.summer} m\'dir.',
 tools=['golge','egim'],
 inputs=[('Engel yüksekliği','Engelin tepesi ile panelin alt kenarı arasındaki yükseklik FARKI. Panel yüksekteyse fark küçülür.'),
  ('Enlem','Öğle güneşinin yüksekliğini belirler: 90 − enlem, mevsime göre deklinasyon eklenir ya da çıkarılır.'),
  ('Mevsim','Gölge en uzun kış gündönümünde olur; yıl boyu gölgesiz yerleşim için kış değeri esas alınır.')],
 mistakes=['Yaz gölgesine bakıp yerleşim yapmak: kışın aynı engel birkaç kat uzun gölge düşürür.','Yalnızca öğle gölgesini hesaba katmak; sabah ve akşam gölge daha uzundur ve doğuya ya da batıya düşer.','Engelin güneyde değil yanda olduğu durumlarda aynı formülü kullanmak.'],
 limits='Formül yalnız öğle vakti ve engelin tam güneyde olduğu durum içindir. Gün boyu gölge analizi için güneşin saatlik konumu gerekir; bu, keşifte yapılır. Panel sıraları arasındaki mesafe için eğimi de hesaba katan <a href="hesaplayici.html#alet-cantasi">sıra aralığı aracını</a> kullanın.',
 faq=[('Gölge uzunluğu nasıl hesaplanır?','Engel yüksekliği, güneş yükseklik açısının tanjantına bölünür. {golge.h} m engel ve {golge.elevWinter}° güneş yüksekliği için {golge.h} ÷ tan({golge.elevWinter}°) = {golge.winter} m.'),
  ('Kışın gölge neden daha uzun olur?','Güneş alçaktır. {golge.lat}° enleminde öğle güneşi kış gündönümünde {egim.winter}°, yaz gündönümünde {egim.summer}° yüksekliktedir; açı küçüldükçe tanjant küçülür ve gölge uzar.'),
  ('Paneller bacadan ne kadar uzağa konmalı?','Yıl boyu öğle gölgesinden kaçınmak için en az kış gündönümü gölgesi kadar: {golge.lat}° enleminde her {golge.h} m yükseklik farkı için {golge.winter} m. Sabah ve akşam gölgesi için keşifte ayrıca bakılır.')],
 sib=['gunes-paneli-acisi-hesaplama','cati-egimi-hesaplama','gunes-paneli-gunluk-uretim-hesaplama','gunes-paneli-seri-paralel-baglanti'],prod=[('cati-ges.html','Çatı GES keşfi ve kurulumu'),('hesaplayici.html#alet-cantasi','Sıra aralığı aracı')]+P_PANEL[:1]),

dict(slug='cati-egimi-hesaplama',crumb='Çatı Eğimi Hesaplama',
 title='Çatı Eğimi Hesaplama: Derece – Yüzde Çevirme | GESPA',
 desc='Çatı eğimi hesaplama: yüzde eğim = tan(derece) × 100. Çatı eğimi yüzde kaç derece eder, 100 cm yatayda kaç cm yükselir: ücretsiz çevirici ve şema.',
 h1='Çatı Eğimi Hesaplama: Derece, Yüzde ve Oran',
 lead='Çatı eğimini derece ya da yüzde olarak yazın; diğerini, 100 cm yatayda kaç cm yükseldiğini ve oranı görün. Şema eğim üçgenini çizer.',
 short='Yüzde eğim = tan(derece) × 100; derece = arctan(yüzde ÷ 100). {cati.deg}° eğim %{cati.pct} eder, yani 100 cm yatayda {cati.pct} cm yükselir. %{cati.pct2} eğim ise {cati.deg2}° demektir.',
 tools=['cati-egimi','egim'],
 inputs=[('Derece','Çatı yüzeyinin yatayla yaptığı açı.'),
  ('Yüzde eğim','100 birim yatay mesafede kaç birim yükselindiği. %100 eğim 45° demektir, 90° değil.'),
  ('Oran','Yükselmenin yataya oranı; 1 : x biçiminde gösterilir.')],
 mistakes=['Yüzde ile dereceyi aynı sanmak: %30 eğim 30° değildir.','Yükselmeyi çatı yüzeyi boyunca ölçülen mesafeye bölmek; yüzde eğimde payda yatay mesafedir.','Ölçümü kısa bir mesafede yapıp hatayı büyütmek; olabildiğince uzun bir yatay mesafede ölçün.'],
 limits='Çevirici yalnızca tanjant bağıntısını uygular. Çatınızın panel taşımaya uygunluğu, kaplama tipi ve taşıyıcı sistem eğimden bağımsız olarak keşifte değerlendirilir. Çatı eğiminin panel üretimine etkisi için <a href="gunes-paneli-acisi-hesaplama.html">panel açısı sayfasına</a> bakın.',
 faq=[('Çatı eğimi yüzde kaç derece eder?','derece = arctan(yüzde ÷ 100). %{cati.pct2} eğim {cati.deg2}° eder. Tersine, {cati.deg}° eğim %{cati.pct} demektir.'),
  ('Çatı eğimi nasıl ölçülür?','Su terazisiyle yatay bir çizgi alın, 100 cm yatay mesafenin sonunda çatı yüzeyine olan düşey mesafeyi ölçün. Bulduğunuz santimetre değeri yüzde eğimdir; araç dereceye çevirir.'),
  ('%100 eğim kaç derecedir?','45°. Yükselme yatay mesafeye eşit olduğunda tanjant 1 olur. Dik (90°) bir yüzeyin yüzde eğimi tanımsızdır.'),
  ('Güneş paneli için çatı eğimi neden önemlidir?','Eğimli çatılarda paneller çoğunlukla çatı yüzeyine paralel monte edilir; panelin eğimi çatının eğimi olur. Bu değeri pratik kural eğimiyle karşılaştırabilirsiniz: {egim.lat}° enleminde yıl boyu kullanım için yaklaşık {egim.tiltYear}°. Çatı eğimi bundan farklıysa üretim bir miktar değişir; sistem yine çalışır.'),
  ('Eğim oranı 1 : x ne demektir?','Yükselmenin yatay mesafeye oranıdır: 1 birim yükselmek için x birim yatay gidilir. Yüzde eğimle ilişkisi x = 100 ÷ yüzde biçimindedir; %{cati.pct2} eğim 1 : {cati.ratio2} oranına karşılık gelir.')],
 sib=['gunes-paneli-acisi-hesaplama','golge-uzunlugu-hesaplama','gunes-paneli-gunluk-uretim-hesaplama','kablo-kesiti-hesaplama'],prod=[('cati-ges.html','Çatı GES keşfi ve kurulumu'),('hesaplayici.html','Çatı GES tasarruf hesaplayıcı')]+P_PANEL[:1]),

dict(slug='ohm-kanunu-hesaplama',crumb='Ohm Kanunu Hesaplama',
 title='Ohm Kanunu Hesaplama: Volt, Amper, Ohm, Watt | GESPA',
 desc='Ohm kanunu hesaplama aracı: V = I × R ve P = V × I. Volt, amper, ohm ve watt değerlerinden herhangi ikisini yazın, diğer ikisi formülle hesaplansın.',
 h1='Ohm Kanunu Hesaplama: Volt, Amper, Ohm, Watt',
 lead='Gerilim, akım, direnç ve güçten bildiğiniz iki değeri yazın; diğer ikisi hesaplanır. Altı olası kombinasyonun hepsi desteklenir.',
 short='V = I × R ve P = V × I. Örnek: {ohm.v} V ve {ohm.i} A için direnç {ohm.v} ÷ {ohm.i} = {ohm.r} Ω, güç {ohm.v} × {ohm.i} = {ohm.p} W. Bu iki bağıntıdan P = I² × R ve P = V² ÷ R de çıkar.',
 tools=['ohm','akim'],
 inputs=[('Gerilim (V)','İki nokta arasındaki potansiyel farkı; volt.'),
  ('Akım (I)','İletkenden geçen akım; amper.'),
  ('Direnç (R)','Akıma karşı gösterilen zorluk; ohm (Ω).'),
  ('Güç (P)','Birim zamanda harcanan enerji; watt.')],
 mistakes=['Dörtten fazla ya da ikiden az alan doldurmak: araç tam olarak iki değer ister.','Alternatif akımda motorlu ve bobinli yükleri saf direnç gibi hesaplamak; orada güç katsayısı (cosφ) devreye girer.','mA, kΩ gibi birimleri çevirmeden yazmak.'],
 limits='Ohm kanunu doğru akım ve saf dirençli AC yükler için bu basit hâliyle geçerlidir. Motor, trafo ve elektronik yüklerde akım-güç ilişkisi için <a href="kw-amper-hesaplama.html">kW amper hesaplama</a> sayfasındaki cosφ\'li formüller kullanılır.',
 faq=[('Ohm kanunu formülü nedir?','V = I × R. Buradan I = V ÷ R ve R = V ÷ I çıkar. Güç için P = V × I kullanılır; ikisi birleşince P = I² × R ve P = V² ÷ R elde edilir.'),
  ('Watt, volt ve amperden nasıl hesaplanır?','Doğru akımda ve dirençli yükte P = V × I. Örnek: {ohm.v} V × {ohm.i} A = {ohm.p} W.'),
  ('Kabloda ısıya giden güç neden akımın karesiyle artar?','P = I² × R olduğu için. Akım iki katına çıkınca aynı kabloda ısı kaybı dört katına çıkar; bu yüzden güç sistemlerinde gerilim yükseltilerek akım düşürülür.'),
  ('Aynı güç için gerilim artarsa akım nasıl değişir?','I = P ÷ V olduğundan gerilim iki katına çıkınca akım yarıya iner. {ohm.p} W yük {ohm.v} V\'ta {ohm.i} A çeker; aynı güç iki kat gerilimde bunun yarısı kadar akım ister. Akü sistemlerinde 12 V yerine 24 V ya da 48 V seçilmesinin nedeni budur.'),
  ('Direnç nasıl ölçülür ve hesapla neden farklı çıkabilir?','Direnç, devre enerjisizken ölçü aletinin ohm kademesiyle ölçülür. Hesaplanan değer ile ölçülen değer arasındaki fark çoğunlukla sıcaklıktan kaynaklanır: iletkenlerin direnci ısındıkça artar; ampul ve ısıtıcı gibi yüklerde soğuk direnç çalışma direncinden belirgin biçimde düşüktür.')],
 sib=['kw-amper-hesaplama','gerilim-dusumu-hesaplama','kva-kw-cevirme','kablo-kesiti-hesaplama'],prod=P_SYS),

dict(slug='panel-sicaklik-guc-kaybi',crumb='Panel Sıcaklık Güç Kaybı',
 title='Güneş Paneli Sıcakta Ne Kadar Güç Kaybeder? | GESPA',
 desc='Güneş paneli sıcaklık güç kaybı hesaplama: P = Pmax × (1 + γ/100 × (hücre sıcaklığı − 25)). Sıcaklık katsayısı ve NOCT ile panel gücünü hesaplayın.',
 h1='Güneş Paneli Sıcakta Ne Kadar Güç Kaybeder?',
 lead='Panelin etiket gücünü, güç sıcaklık katsayısını ve hücre sıcaklığını yazın; o sıcaklıktaki gücü ve etikete göre farkı görün. Hücre sıcaklığını bilmiyorsanız NOCT değeriyle tahmin edebilirsiniz.',
 short='P = Pmax × (1 + γ ÷ 100 × (hücre sıcaklığı − {sic.stc})). Yuvarlak örnek değerlerle: {sic.pmax} W panel, γ {sic.gamma} %/°C ve {sic.tcell} °C hücre sıcaklığında {sic.p} W verir. Hücre sıcaklığı hava sıcaklığından yüksektir.',
 tools=['sicaklik-gucu'],
 inputs=[('Pmax','Panelin etiketindeki güç; {sic.stc} °C hücre sıcaklığı içindir.'),
  ('Güç sıcaklık katsayısı (γ)','Künyede "Pmax sıcaklık katsayısı" olarak %/°C biriminde ve eksi işaretle yazar. Voc ve Isc katsayılarıyla karıştırılmamalıdır.'),
  ('Hücre sıcaklığı','Panelin içindeki hücrenin sıcaklığı; hava sıcaklığı değildir.'),
  ('NOCT','Künyedeki nominal çalışma hücre sıcaklığı; isteğe bağlı tahmin için kullanılır.')],
 mistakes=['Formüle hava sıcaklığını yazmak: güneş altındaki panel havadan belirgin biçimde sıcaktır.','Voc sıcaklık katsayısını güç katsayısı yerine kullanmak.','Katsayının eksi işaretini yazmamak; sonuç gücü artmış gösterir.','Yalnızca sıcaklık etkisini toplam sistem kaybı sanmak.'],
 limits='Araç yalnız sıcaklığın güce etkisini hesaplar; ışınım, açı, kirlenme, kablo ve cihaz kayıpları ayrıdır. NOCT ile hücre sıcaklığı tahmini bir ders kitabı yaklaşımıdır; rüzgâr ve montaj şekli gerçek sıcaklığı değiştirir. γ ve NOCT değerleri ürüne özeldir, bu sayfa tipik değer vermez; panelinizin künyesinden alın.',
 faq=[('Güneş paneli sıcakta neden daha az üretir?','Hücre ısındıkça gerilimi düşer ve güç, künyedeki sıcaklık katsayısı kadar azalır. Yuvarlak örnekte γ {sic.gamma} %/°C ve {sic.tcell} °C hücre sıcaklığı için fark {sic.dt} °C × {sic.gamma} %/°C kadardır; {sic.pmax} W panel {sic.p} W verir.'),
  ('Hücre sıcaklığı nasıl tahmin edilir?','Künyedeki NOCT ile: hücre = ortam + (NOCT − {sic.nAmb}) ÷ {sic.nIrr} × ışınım. Örnek: ortam {sic.tamb} °C, NOCT {sic.noct} °C ve {sic.g} W/m² için {sic.tc} °C.'),
  ('Soğukta panel gücü artar mı?','Evet, aynı formül ters yönde çalışır: hücre {sic.stc} °C\'nin altındaysa güç etiket değerinin üstüne çıkabilir. Asıl dikkat edilecek nokta gerilimdir; soğukta Voc yükselir ve seri dizinin gerilimi cihazın giriş sınırını aşmamalıdır.')],
 sib=['gunes-paneli-gunluk-uretim-hesaplama','gunes-paneli-seri-paralel-baglanti','gunes-paneli-acisi-hesaplama','mppt-kac-amper-olmali'],prod=P_PANEL),
]
SLUGS=[p['slug'] for p in PAGES]; BY={p['slug']:p for p in PAGES}
assert len(set(SLUGS))==len(SLUGS)
for attr in ('title','desc','h1'): assert len(set(p[attr] for p in PAGES))==len(PAGES),attr
# Merkezdeki her aracın kendi sayfası (aynı kart birden çok sayfada olabilir; burada ASIL sayfası yazılır)
OWN={'kablo':'solar-kablo-kesiti-hesaplama','ac-kablo':'gerilim-dusumu-hesaplama','akim':'kw-amper-hesaplama','hp-kw-amper':'kw-amper-hesaplama','ohm':'ohm-kanunu-hesaplama',
 'sigorta-kablo-uyumu':'kablo-kesiti-hesaplama','egim':'gunes-paneli-acisi-hesaplama','golge':'golge-uzunlugu-hesaplama','cati-egimi':'cati-egimi-hesaplama','gunluk-uretim':'gunes-paneli-gunluk-uretim-hesaplama',
 'sicaklik-gucu':'panel-sicaklik-guc-kaybi','dizi':'gunes-paneli-seri-paralel-baglanti','seri-paralel':'gunes-paneli-seri-paralel-baglanti','sigorta':'gunes-paneli-seri-paralel-baglanti','aku':'aku-seri-paralel-baglanti',
 'aku-sure':'aku-kac-saat-dayanir','c-orani':'aku-kac-saat-dayanir','aku-sarj':None,'sarj-kontrol':'mppt-kac-amper-olmali','inverter-aku-akimi':'invertor-akuden-kac-amper-ceker',
 'yuk-listesi':'cihaz-elektrik-tuketimi-hesaplama','cihaz-tuketimi':'cihaz-elektrik-tuketimi-hesaplama','cevirici':'awg-mm2-cevirme','kontrol':None}
assert set(OWN)==set(TOOLS),set(OWN)^set(TOOLS)
def own_line(t):
    sl=OWN.get(t)
    if not sl: return ''
    more=' · <a href="ah-kwh-cevirme.html">Ah kWh Çevirme</a>' if t=='cevirici' else ''
    return '<p class="usta-own">Ayrıntılı anlatım, sık yapılan hatalar ve sorular: <a href="%s.html">%s</a>%s</p>'%(sl,BY[sl]['crumb'],more)
def finish(html,page_ids):
    html=re.sub(r'<!--OWN:([a-z0-9-]+)-->\n?',lambda m:(own_line(m.group(1))+'\n') if page_ids is None and own_line(m.group(1)) else '',html)
    if page_ids is not None:   # iniş sayfası: sayfada olmayan araç çapaları merkez sayfaya gider
        html=re.sub(r'href="#([a-z0-9-]+)"',lambda m:m.group(0) if m.group(1) in page_ids else 'href="elektrikci-cantasi.html#%s"'%m.group(1),html)
    html=re.sub(r'<h3 class="tool-title">(.*?)</h3>',r'<h4 class="tool-title">\1</h4>',html)
    html=html.replace(' hidden>',' hidden="">'); assert ' hidden>' not in html
    return html

# ---- merkez sayfa
H_TITLE='Elektrik ve Solar Hesaplama Araçları | Elektrikçi Çantası'
H_DESC='Ücretsiz hesaplama araçları: kablo kesiti, gerilim düşümü, kW amper, trifaze akım, panel açısı, akü kaç saat dayanır, MPPT kaç amper, AWG mm² çevirme.'
head,foot=shell('elektrikci-cantasi',H_TITLE,H_DESC,'Elektrikçi Çantası: Ücretsiz Elektrik ve Solar Hesaplama Araçları','Kablo kesiti, gerilim düşümü, kW amper, panel açısı, dizi hesabı, akü süresi ve çeviriciler: formülü görünen ücretsiz araçlar.')
PAGE_LIST='<ul class="usta-sib">'+''.join('<li><a href="%s.html">%s</a></li>'%(p['slug'],p['h1']) for p in PAGES)+'</ul>'
hub=head+('''<main id="main" data-article data-usta>
    '''+MARK+'''
    <section class="page-hero">
      <div class="container reveal">
        <div class="crumbs"><a href="index.html">Ana Sayfa</a> <span>/</span> <a href="rehberler.html">Rehberler</a> <span>/</span> Elektrikçi Çantası</div>
        <h1>Elektrikçi Çantası: Ücretsiz Elektrik ve Solar Hesaplama Araçları</h1>
        '''+FIND+'''
        <p class="lead">Elektrikçiler, güneş paneli montaj ekipleri ve kendi sistemini kuranlar için '''+CNT+''' ücretsiz hesaplama aracı: kablo kesiti ve gerilim düşümü, kW–amper, panel açısı, dizi hesabı, akü süresi, şarj kontrol cihazı akımı ve çeviriciler. Her araç formülünü gösterir; değerleri etiketten siz girersiniz.</p>
        <p class="art-meta">Yayın: <time datetime="'''+PUB[0]+'''">'''+PUB[1]+'''</time> · GESPA Enerji</p>
      </div>
    </section>

    '''+nav+'''

    <section class="section usta-sec">
      <div class="container">
        <article class="art usta">
          <div class="art-note"><p><strong>Kısaca:</strong> Bu araçlar yalnızca tanım ve fizik formüllerini kullanır; standart tablosu (akım taşıma kapasitesi, sigorta katsayısı, izin verilen gerilim düşümü) içermez. Tablo gereken yerde kablo ve cihaz üreticisinin verisine bakılır, tasarımı yetkili elektrikçi ya da mühendis yapar. Çatı yerleşimi, inverter gücü, akü boyutu ve sıra aralığı için <a href="hesaplayici.html#alet-cantasi">GES Alet Çantası</a>'na bakın.</p></div>

'''+BODY+'''
          <h2 id="sayfalar">Araç sayfaları</h2>
          <p>Her hesabın kendi sayfasında girdilerin anlamı, sık yapılan hatalar ve o konuya özel sorular yer alır:</p>
          '''+PAGE_LIST+'''

          <h2 id="sss">Sık sorulan sorular</h2>
          '''+faq_html+'''

          '''+DISC_PAGE+'''
        </article>
      </div>
    </section>

    ''')+CTA+foot
OUT={'elektrikci-cantasi.html':finish(hub,None)}

# ---- iniş sayfaları
def render(p):
    head,foot=shell(p['slug'],p['title'],p['desc'],p['h1'],p['desc'])
    secs=[(TOOLS.get(t) or PARTS[t]) for t in p['tools']]
    ids=set(p['tools'])|{'arac','sss','ilgili','tablo','girdiler','hatalar','sinirlar'}
    own=('<h2 id="girdiler">Girdiler ne anlama gelir?</h2>\n<ul>'+''.join('<li><strong>%s:</strong> %s</li>'%i for i in p['inputs'])+'</ul>\n'
      +(X(p['extra'])+'\n' if p.get('extra') else '')
      +'<h2 id="hatalar">Sık yapılan hatalar</h2>\n<ul>'+''.join('<li>%s</li>'%m for m in p['mistakes'])+'</ul>\n'
      +'<h2 id="sinirlar">Bu hesabın sınırları</h2>\n<p>'+X(p['limits'])+'</p>\n')
    sib=''.join('<li><a href="%s.html">%s</a></li>'%(s,BY[s]['h1']) for s in p['sib'])+''.join('<li><a href="%s">%s</a></li>'%x for x in p['prod'])
    init=(' data-usta-init="%s"'%p['init']) if p.get('init') else ''
    main=('''<main id="main" data-article data-usta'''+init+'''>
    '''+MARK+'''
    <section class="page-hero">
      <div class="container reveal">
        <div class="crumbs"><a href="index.html">Ana Sayfa</a> <span>/</span> <a href="elektrikci-cantasi.html">Elektrikçi Çantası</a> <span>/</span> '''+p['crumb']+'''</div>
        <h1>'''+p['h1']+'''</h1>
        <p class="lead">'''+p['lead']+'''</p>
        <p class="art-meta">Yayın: <time datetime="'''+PUB[0]+'''">'''+PUB[1]+'''</time> · GESPA Enerji · <a href="elektrikci-cantasi.html">Tüm hesaplama araçları</a></p>
      </div>
    </section>

    <section class="section usta-sec">
      <div class="container">
        <article class="art usta usta-page">
          <!-- OWN:START --><div class="art-note"><p><strong>Kısa cevap:</strong> '''+X(p['short'])+'''</p></div><!-- OWN:END -->

          <h2 id="arac">Hesaplama aracı</h2>
'''+''.join(secs)+'''
          <!-- OWN:START -->'''+own+'''
          <h2 id="sss">Sık sorulan sorular</h2>
          <div class="faq">'''+''.join(faq(q,a) for q,a in p['faq'])+'''</div><!-- OWN:END -->

          <h2 id="ilgili">İlgili araçlar ve ürünler</h2>
          <ul class="usta-sib">'''+sib+'''</ul>

          '''+DISC_PAGE+'''
        </article>
      </div>
    </section>

    ''')
    return finish(head+main+CTA+foot,ids)
def faq(q,a): return '<div class="faq-item reveal"><button class="faq-q"><span>%s</span><span class="faq-ico">+</span></button><div class="faq-a"><p>%s</p></div></div>'%(X(q),X(a))
for p in PAGES:
    assert 3<=len(p['faq'])<=5,p['slug']
    for s in p['sib']: assert s in BY and s!=p['slug'],(p['slug'],s)
    OUT[p['slug']+'.html']=render(p)

# ---- denetim + yazma
def words(html): return len(re.findall(r'\w+',re.sub(r'<[^>]+>',' ',html)))
bad=0
for name,html in OUT.items():
    path=ROOT+name
    if os.path.exists(path) and MARK not in open(path,encoding='utf8').read() and name!='elektrikci-cantasi.html':
        print('ÇAKIŞMA: %s zaten var ve bu betiğin değil'%name); bad+=1
    for h in set(re.findall(r'href="([^"#?:]+\.html)',html)):
        if not os.path.exists(ROOT+h.lstrip('/')) and h not in OUT: print('KIRIK BAĞLANTI %s → %s'%(name,h)); bad+=1
    for a in set(re.findall(r'href="#([^"]+)"',html)):
        if 'id="%s"'%a not in html: print('KIRIK ÇAPA %s → #%s'%(name,a)); bad+=1
    if name!='elektrikci-cantasi.html':
        ownw=sum(words(x) for x in re.findall(r'<!-- OWN:START -->([\s\S]*?)<!-- OWN:END -->',html))
        if ownw<250: print('KISA METİN %s: %d sözcük'%(name,ownw)); bad+=1
        print('%-44s başlık %2d · açıklama %3d · özgün metin %d sözcük'%(name,len(BY[name[:-5]]['title']),len(BY[name[:-5]]['desc']),ownw))
print('merkez: %d araç, %d iniş sayfası'%(NTOOLS,len(PAGES)))
if bad: sys.exit('HATA: %d sorun'%bad)
if APPLY:
    for name,html in OUT.items(): open(ROOT+name,'w',encoding='utf8').write(html)
    print('YAZILDI: %d sayfa. Şimdi: node build.js && npm test'%len(OUT))
else: print('DRY-RUN: yazılmadı (--uygula ile yaz)')
