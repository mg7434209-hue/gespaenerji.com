'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const origin='https://www.gespaenerji.com';
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const files=urls.map(u=>new URL(u).pathname.replace(/^\//,'').replace(/\/$/,'/index.html')||'index.html');
assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URLs');
let schemas=0;
for(let i=0;i<files.length;i++){
 const file=files[i],html=fs.readFileSync(path.join(root,file),'utf8');
 assert.equal([...html.matchAll(/<h1\b/g)].length,1,file+': exactly one h1');
 assert.ok(html.includes('rel="canonical" href="'+urls[i]+'"'),file+': canonical');
 assert.ok(!/name="robots" content="[^"]*noindex/.test(html),file+': noindex in sitemap');
 assert.ok(html.includes('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />'),file+': robots meta (max-image-preview)');
 // Machine-readable mirror: every indexable page links its Markdown copy and the file exists.
 {const mdHref=(html.match(/<link rel="alternate" type="text\/markdown" href="([^"]+)"/)||[])[1];
  assert.ok(mdHref,file+': markdown alternate link');
  const expect='/md/'+file.replace(/\.html$/,'.md');
  assert.equal(mdHref,expect,file+': markdown link path');
  assert.ok(fs.existsSync(path.join(root,mdHref)),file+': markdown mirror exists');
  const md=fs.readFileSync(path.join(root,mdHref),'utf8');
  assert.ok(md.startsWith('---\ntitle: ')&&md.includes('canonical: '+urls[i])&&/^# /m.test(md),file+': markdown front matter + h1');}
 const lds=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));schemas+=lds.length;
 // Every page is an entity: WebPage family with freshness + site/organization links.
 const page=lds.find(x=>/^(WebPage|CollectionPage|ItemPage|AboutPage|ContactPage)$/.test(x['@type']));
 assert.ok(page,file+': WebPage schema');
 assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(page.dateModified)&&/^\d{4}-\d{2}-\d{2}$/.test(page.datePublished),file+': WebPage dates');
 assert.ok(page.datePublished<=page.dateModified,file+': datePublished <= dateModified');
 // Sitemap lastmod and the page's dateModified come from one source.
 {const lm=(sitemap.split('<loc>'+urls[i]+'</loc>')[1]||'').match(/<lastmod>([^<]+)<\/lastmod>/);
  assert.ok(lm&&lm[1]===page.dateModified,file+': sitemap lastmod = WebPage dateModified');}
 assert.equal(page.isPartOf['@id'],origin+'/#website',file+': WebPage isPartOf');
 assert.ok(page.speakable&&page.speakable.cssSelector.includes('h1'),file+': speakable');
 assert.ok(lds.some(x=>x['@type']==='WebSite'&&x['@id']===origin+'/#website'),file+': WebSite entity');
 const lb=lds.find(x=>x['@type']==='LocalBusiness');
 assert.ok(lb&&lb.contactPoint&&lb.hasMap&&lb.paymentAccepted&&lb.foundingDate==='2005',file+': LocalBusiness enrichment');
 if(html.includes('data-pkg-detail="')){
  const pr=lds.find(x=>x['@type']==='Product');
  assert.ok(pr&&pr.itemCondition&&pr.image&&pr.offers&&/^\d{4}-\d{2}-\d{2}$/.test(pr.offers.priceValidUntil),file+': Product enrichment');
  assert.equal(page['@type'],'ItemPage',file+': product page is ItemPage');
 }
 if(page['@type']==='ItemPage')assert.ok(lds.some(x=>x['@type']==='Product'&&x['@id']===page.mainEntity['@id']),file+': ItemPage.mainEntity resolves');
 // FAQ schema is generated from the visible questions: same count, same text, in every language.
 {const body=html.replace(/<!-- FAQHUB:STATIC -->[\s\S]*?<!-- \/FAQHUB:STATIC -->/,'');
  const vis=[...body.matchAll(/<div class="faq-item[^"]*"><button class="faq-q"[^>]*>([\s\S]*?)<\/button>/g)].map(m=>m[1].replace(/<span class="faq-ico"[^>]*>[\s\S]*?<\/span>/,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim());
  const faqs=lds.filter(x=>x['@type']==='FAQPage');
  if(vis.length){assert.equal(faqs.length,1,file+': one FAQPage');assert.deepEqual(faqs[0].mainEntity.map(q=>q.name),vis,file+': FAQPage = visible questions');}
  else assert.equal(faqs.length,0,file+': FAQPage without visible questions');
  assert.ok(![...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].some(m=>/"FAQPage"/.test(m[1])),file+': no hand-written FAQPage block');}
 for(const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g))assert.ok(urls.includes(m[1]),file+': missing alternate '+m[1]);
 // Local assets and content links; query strings and fragments are intentionally excluded.
 for(const m of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
  const val=m[1];if(/^(?:https?:|mailto:|tel:|data:|#)/.test(val))continue;
  let p=val.split(/[?#]/)[0];if(!p)continue;
  const dest=p.startsWith('/')?path.join(root,p):path.resolve(path.dirname(path.join(root,file)),p);
  assert.ok(fs.existsSync(dest),file+': missing local target '+val);
 }
}
for(const lang of ['en','de','ru']){
 const html=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 assert.ok(!html.includes('>21 yıl<'),lang+': translated count');
 assert.ok(!html.includes('>Sadece faturanızı girin;'),lang+': calculator translation');
 const detail=fs.readFileSync(path.join(root,lang,'cati-ges.html'),'utf8');
 assert.ok(detail.includes('href="/'+lang+'/proje-kemer-villa.html"'),lang+': localized related link');
 const schemas=[...detail.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const service=schemas.find(x=>x['@type']==='Service');
 assert.equal(service.url,origin+'/'+lang+'/cati-ges.html');
 assert.equal(service.provider['@id'],origin+'/#organization');
 assert.ok(service.serviceType&&service.serviceType!=='Manavgat ve Antalya Çatı GES Kurulumu',lang+': serviceType translated');
 assert.ok(Array.isArray(service.areaServed)&&service.areaServed[0]['@type'],lang+': areaServed as City objects');
 const enPage=schemas.find(x=>x['@type']==='WebPage');
 assert.ok(enPage&&enPage.inLanguage===lang&&enPage.url===origin+'/'+lang+'/cati-ges.html',lang+': WebPage localized');
}
// Image/video sitemap extensions and the generated robots.txt (AI crawlers explicitly invited).
assert.ok((sitemap.match(/<image:image>/g)||[]).length>50,'image sitemap entries');
assert.equal((sitemap.match(/<video:video>/g)||[]).length,4,'video sitemap entries (tr+en+de+ru)');
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
for(const bot of ['GPTBot','ClaudeBot','PerplexityBot','Google-Extended','Bytespider'])assert.ok(new RegExp('^User-agent: '+bot+'$','m').test(robots),'robots.txt: '+bot);
assert.ok(/^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m.test(robots),'robots.txt: Content-Signal');
assert.ok(/^Disallow: \/admin\.html$/m.test(robots)&&/^Disallow: \/en\/sepet\.html$/m.test(robots),'robots.txt: noindex pages');
assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'),'robots.txt: sitemap');
// llms.txt is generated: every indexable page and product page is listed, plus the markdown mirrors.
const llms=fs.readFileSync(path.join(root,'llms.txt'),'utf8');
for(const f of files.filter(f=>!/^(en|de|ru)\//.test(f)))assert.ok(llms.includes('('+origin+'/'+(f==='index.html'?'':f)+')'),'llms.txt: '+f);
assert.ok(llms.includes(origin+'/md/online-satis.md')&&llms.includes(origin+'/llms-full.txt'),'llms.txt: mirrors + full');
assert.ok(fs.readdirSync(root).some(f=>/^[a-f0-9]{32}\.txt$/.test(f)),'IndexNow key file');
// Markdown converter: a literal "<" in text ("&lt; 80 mA") must not swallow the rest of the page.
{const ev=fs.readFileSync(path.join(root,'md/elektrikli-arac-donusum.md'),'utf8');
 assert.ok(ev.includes('| Yüksüz giriş akımı | < 80 mA |')&&ev.includes('| Garanti | 2 yıl |')&&ev.includes('| 72 V | 1080 W | %98 |'),'markdown: spec table survives "<" in a cell');
 for(const d of ['md','md/en','md/de','md/ru'])for(const f of fs.readdirSync(path.join(root,d)).filter(f=>f.endsWith('.md')))
  assert.ok(!/[]/.test(fs.readFileSync(path.join(root,d,f),'utf8')),d+'/'+f+': no placeholder left');}
for(const lang of ['en','de','ru']){
 const html=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 assert.ok(html.includes('<meta property="og:locale:alternate" content="tr_TR" />'),lang+': og:locale:alternate tr');
 assert.ok(!html.includes('<meta property="og:locale:alternate" content="'+{en:'en_US',de:'de_DE',ru:'ru_RU'}[lang]+'" />'),lang+': own locale is not an alternate');
}
// Help pages: FAQ hub (own questions marked up, collected ones not) and the glossary.
const help=require(path.join(root,'content/sss.js')),glossary=require(path.join(root,'content/sozluk.js'));
for(const pre of ['','en/','de/','ru/']){
 const hub=fs.readFileSync(path.join(root,pre+'sss.html'),'utf8');
 const hubLd=[...hub.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert.equal(hubLd.find(x=>x['@type']==='FAQPage').mainEntity.length,help.general.length,pre+'sss.html: only hub-own questions in FAQPage');
 const collected=(hub.match(/<!-- FAQHUB:STATIC -->([\s\S]*?)<!-- \/FAQHUB:STATIC -->/)||[])[1]||'';
 assert.ok((collected.match(/class="faq-q"/g)||[]).length>=80,pre+'sss.html: collected questions');
 const ids=new Set([...hub.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
 for(const m of hub.matchAll(/<nav class="faqhub-toc"[^>]*>([\s\S]*?)<\/nav>/g))for(const a of m[1].matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(a[1]),pre+'sss.html: toc anchor #'+a[1]);
 const gl=fs.readFileSync(path.join(root,pre+'sozluk.html'),'utf8');
 const set=[...gl.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='DefinedTermSet');
 assert.equal(set.hasDefinedTerm.length,glossary.terms.length,pre+'sozluk.html: DefinedTermSet');
 for(const t of glossary.terms){assert.ok(gl.includes('<section class="gl-term" id="'+t.id+'">'),pre+'sozluk.html: #'+t.id);}
 assert.ok(set.hasDefinedTerm.every(t=>t.url===origin+'/'+pre+'sozluk.html#'+t.url.split('#')[1]),pre+'sozluk.html: localized term urls');
 if(pre){assert.notEqual(set.name,glossary.labels.title[0],pre+'sozluk.html: translated set name');}
 // Footer help links on every page that has the corporate column.
 const home=fs.readFileSync(path.join(root,pre+'index.html'),'utf8');
 assert.ok(home.includes('<!-- HELP:STATIC --><a href="'+(pre?'/'+pre:'')+'sss.html">')&&home.includes('sozluk.html">'),pre+'index.html: footer help links');
}
for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const h=fs.readFileSync(path.join(root,f),'utf8');
 if(h.includes('<!-- /SISTER:STATIC -->'))assert.ok(/<!-- HELP:STATIC --><a href="sss.html">[^<]+<\/a><a href="sozluk.html">[^<]+<\/a><!-- TR:ONLY --><a href="gunes-paneli-kacak-elektrik-cezasi.html">[^<]+<\/a><!-- \/TR:ONLY --><!-- \/HELP:STATIC -->/.test(h),f+': footer help links');
}
// TR-only blocks (links to the Turkish-only regulation guide) never reach a language copy or its Markdown mirror.
for(const d of ['en','de','ru','md/en','md/de','md/ru'])for(const f of fs.readdirSync(path.join(root,d)).filter(f=>/\.(html|md)$/.test(f))){
 const t=fs.readFileSync(path.join(root,d,f),'utf8');
 assert.ok(!t.includes('TR:ONLY')&&!t.includes('gunes-paneli-kacak-elektrik-cezasi'),d+'/'+f+': TR-only content leaked');
}
// Guide page: Article schema mirrors the visible page (headline = h1, same dates as WebPage, citations = sources list).
{const g=fs.readFileSync(path.join(root,'gunes-paneli-kacak-elektrik-cezasi.html'),'utf8');
 const lds=[...g.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const art=lds.find(x=>x['@type']==='Article'),wp=lds.find(x=>x['@type']==='WebPage');
 const h1=(g.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1].replace(/<[^>]+>/g,'').trim();
 assert.ok(art&&art.headline===h1,'guide: Article headline = h1');
 assert.ok(art.datePublished===wp.datePublished&&art.dateModified===wp.dateModified,'guide: Article dates = WebPage dates');
 assert.equal(wp.mainEntity['@id'],art['@id'],'guide: WebPage.mainEntity -> Article');
 const src=((g.match(/<ul class="art-src">([\s\S]*?)<\/ul>/)||[])[1]||'').match(/<a\b/g)||[];
 assert.ok(src.length>0&&art.citation.length===src.length,'guide: citations = visible sources');
 assert.ok(/<link rel="alternate" hreflang="tr"/.test(g)&&!/hreflang="en"/.test(g),'guide: Turkish only');}
// In-text glossary links (product pages, calculator) must point at an existing term anchor:
// a renamed term id would silently break them. Checked in every language copy.
const termIds=new Set(glossary.terms.map(t=>t.id));let glossLinks=0;
for(const pre of ['','en/','de/','ru/'])for(const f of fs.readdirSync(path.join(root,pre||'.')).filter(f=>f.endsWith('.html'))){
 for(const m of fs.readFileSync(path.join(root,pre,f),'utf8').matchAll(/href="[^"]*sozluk\.html#([^"]+)"/g)){glossLinks++;assert.ok(termIds.has(m[1]),pre+f+': glossary anchor #'+m[1]);}
}
assert.ok(glossLinks>=7*4,'in-text glossary links present in all languages');
// About page tells one continuous story since 2005 (no company/sole-trader split).
const aboutPage=fs.readFileSync(path.join(root,'hakkimizda.html'),'utf8'),contactPage=fs.readFileSync(path.join(root,'iletisim.html'),'utf8');
assert.ok(!aboutPage.includes('01.11.2022')&&!aboutPage.includes('Kurumsallaşma')&&!contactPage.includes('kurumsal yapılanma'),'unified company story');
// Per-language i18n bundles: a page loads only its own language's dictionary; the runtime and the
// data for that language are identical to the source assets/i18n.js.
{const vm=require('node:vm');
 const loadI18n=file=>{const noop=()=>{};const sb={document:{readyState:'loading',addEventListener:noop,dispatchEvent:noop,querySelectorAll:()=>[],querySelector:()=>null,head:{appendChild:noop,querySelectorAll:()=>[]},documentElement:{setAttribute:noop},createElement:()=>({setAttribute:noop})},localStorage:{getItem:()=>null,setItem:noop},location:{pathname:'/',origin},CustomEvent:function(){}};sb.window=sb;
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sb);return {data:sb.GESPA.i18nData,units:sb.GESPA.units,api:typeof sb.GESPA.applyLang};};
 const srcSize=fs.statSync(path.join(root,'assets/i18n.js')).size,full=loadI18n('assets/i18n.js');
 for(const l of ['tr','en','de','ru']){
  const f='assets/i18n.'+l+'.js',b=loadI18n(f);
  assert.equal(b.api,'function',f+': runtime present');
  assert.deepEqual(Object.keys(b.data.DICT),l==='tr'?[]:[l],f+': only its own dictionary');
  if(l!=='tr'){assert.equal(JSON.stringify(b.data.DICT[l]),JSON.stringify(full.data.DICT[l]),f+': dictionary identical to source');
   assert.equal(JSON.stringify(b.data.PH[l]),JSON.stringify(full.data.PH[l]),f+': placeholders identical');}
  assert.deepEqual(Object.keys(b.data.HTMLMAP),Object.keys(full.data.HTMLMAP),f+': rich-text selectors');
  assert.equal(b.units[l].yil,full.units[l].yil,f+': units');
  assert.ok(fs.statSync(path.join(root,f)).size<(l==='tr'?20000:srcSize*0.45),f+': bundle size');
 }
 for(const file of files){
  const html=fs.readFileSync(path.join(root,file),'utf8'),lang=(file.match(/^(en|de|ru)\//)||[])[1]||'tr';
  if(!html.includes('i18n'))continue;
  assert.ok(html.includes(lang==='tr'?'<script defer src="assets/i18n.tr.js">':'<script defer src="/assets/i18n.'+lang+'.js">'),file+': loads its language bundle');
  assert.ok(!/src="\/?assets\/i18n\.js"/.test(html),file+': does not load the full dictionary');
 }}
// System Builder prices come from the shop: a catalog item linked to a package (`pkg`)
// must not carry its own price, and battery/inverter voltages must be able to pair up.
{const vm=require('node:vm');const sb={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sb);
 const C=sb.window.GESPA.config,cat=C.builder.catalog,pk=id=>C.packages.find(p=>p.id===id);
 for(const type of Object.keys(cat))for(const it of cat[type]){
  if(it.pkg){assert.ok(pk(it.pkg),'builder '+it.id+': package '+it.pkg+' exists');
   assert.ok(pk(it.pkg).price!=null,'builder '+it.id+': linked package has a price');
   assert.equal(it.price,undefined,'builder '+it.id+': no second price next to pkg');}
  else assert.ok(it.price>0&&it.name,'builder '+it.id+': quote item has name and price');
  // firm: the business's own list price for a quote item (not an estimate); never on shop items
  if(it.firm)assert.ok(!it.pkg,'builder '+it.id+': firm only on quote items');}
 const volts=new Set(cat.battery.map(b=>b.v));
 assert.ok(cat.battery.every(b=>b.v)&&cat.inverter.every(i=>i.v),'builder: battery/inverter voltage (v) set');
 assert.ok(cat.inverter.every(i=>volts.has(i.v)),'builder: every inverter matches a battery voltage');
 for(const p of C.builder.presets)for(const t of Object.keys(p.prefer||{}))assert.ok(cat[t].some(x=>x.id===p.prefer[t]),'builder preset '+p.id+': prefer '+p.prefer[t]+' exists');}
// Link payment (odeme.html) does not ask for a Turkish ID or tax number (business decision,
// 28 Sep 2026); the receipt page reads its encrypted token from the #k= fragment.
const linkPay=fs.readFileSync(path.join(root,'odeme.html'),'utf8');
assert.ok(!/name="(tckn|vd|firma)"/.test(linkPay),'odeme.html must not ask for TCKN/VKN');
assert.ok(/location\.hash/.test(fs.readFileSync(path.join(root,'odeme-sonuc.html'),'utf8')),'receipt page reads #k= token');
// Google review requests: ONE link from config.company.googleReview, filled into every data-c-review anchor
// (TR + language copies). Reviews are asked for WITHOUT incentives: Google treats a discount or gift for a
// review as fake engagement, so no review box may promise one.
{const sbr={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbr);
 const gr=sbr.window.GESPA.config.company.googleReview;assert.ok(/^https:\/\/g\.page\/r\/[\w-]+\/review$/.test(gr),'config.company.googleReview');
 for(const f of ['iletisim.html','en/iletisim.html','de/iletisim.html','ru/iletisim.html','odeme-sonuc.html']){const h=fs.readFileSync(path.join(root,f),'utf8');
  const a=[...h.matchAll(/<a\b[^>]*\bdata-c-review\b[^>]*>/g)].map(m=>m[0]);assert.ok(a.length&&a.every(t=>t.includes('href="'+gr+'"')),f+': review link from config');
  for(const m of h.matchAll(/<(li|div)\b[^>]*data-review-box[^>]*>([\s\S]*?)<\/\1>/g))assert.ok(!/indirim|hediye|kupon|çekiliş|ödül|discount|gift|coupon|rabatt|скидк/i.test(m[2]),f+': review request must not offer an incentive');}}
// Q&A section: every configured page carries the markers the server fills and loads qa.js; the committed
// HTML (what the Pages mirror serves) never holds visitor content.
{const sbq={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbq);
 assert.ok(sbq.window.GESPA.config.qa.pages.length>0,'config.qa.pages');
 for(const pg of sbq.window.GESPA.config.qa.pages){const h=fs.readFileSync(path.join(root,pg+'.html'),'utf8');
  assert.ok(/<!-- QA:STATIC -->[\s\S]*?<!-- \/QA:STATIC -->/.test(h)&&h.includes('data-qa-page="'+pg+'"')&&h.includes('src="assets/qa.js"'),pg+': Q&A markers and script');
  assert.ok(!/qa-thread/.test(h),pg+': no visitor content committed to the page');}}
// Top menu (30 Sep 2026): "Solar Sistemler" was removed (the home page presents solar), "Yapay Zekâ
// Ürünleri" is a plain link to the hub, Araçlar is the only dropdown (tools/menu-uret.py writes every
// page). The services hub keeps a link from every page through the footer "Hizmetler" column.
// The AI hub lists its products from the visible cards (ItemList of Service, not Product: no price) and
// keeps the safety notes on fire and fall detection.
{let navs=0;
 for(const f of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){const h=fs.readFileSync(path.join(root,f),'utf8'),m=h.match(/<nav class="menu" id="menu"[\s\S]*?<\/nav>/);if(!m)continue;navs++;
  assert.ok(!m[0].includes('Solar Sistemler'),f+': no Solar Sistemler item in the menu');
  assert.ok(/<a href="yapay-zeka-urunleri\.html"( class="active")?>Yapay Zekâ Ürünleri<\/a>/.test(m[0]),f+': AI products link to the hub');
  assert.equal((m[0].match(/class="menu-group/g)||[]).length,1,f+': only Araçlar is a dropdown');
  assert.ok(/<div class="footer-col"><h4>Hizmetler<\/h4>(?:(?!<\/div>)[\s\S])*href="hizmetler\.html"/.test(h),f+': footer links the services hub');}
 assert.ok(navs>=40,'menus checked: '+navs);
 assert.ok(/<nav class="menu"[\s\S]*?<a href="projeler\.html" class="active">/.test(fs.readFileSync(path.join(root,'proje-kemer-villa.html'),'utf8')),'project pages mark Projeler active');
 const hub=fs.readFileSync(path.join(root,'yapay-zeka-urunleri.html'),'utf8');
 const art=id=>(hub.match(new RegExp('<article[^>]*\\bid="'+id+'"[\\s\\S]*?<\\/article>'))||[''])[0];
 const cards=(hub.match(/<article class="ai-(?:feature|card)[^"]*"[^>]*\bid="/g)||[]).length+(hub.includes('id="yazilim"')?1:0);
 const il=[...hub.matchAll(/data-gld="itemlist">([^<]+)</g)].map(m=>JSON.parse(m[1]))[0];
 assert.ok(il&&il.numberOfItems===cards&&il.itemListElement.every(x=>x.item['@type']==='Service'&&x.item.name&&x.item.description),'AI hub ItemList = visible cards (Service)');
 assert.ok(/yerine geçmez/.test(art('yangin')),'fire detection note: not a replacement for the mandatory fire alarm system');
 assert.ok(/Tıbbi cihaz değildir/.test(art('dusme')),'fall detection note: not a medical device');
 const opts=new Set([...contactPage.matchAll(/<option data-k="([a-z0-9-]+)"/g)].map(m=>m[1]));
 for(const m of hub.matchAll(/href="iletisim\.html\?tip=([a-z0-9-]+)"/g))assert.ok(opts.has(m[1]),'iletisim.html has an option for ?tip='+m[1]);
 // Narrow header: language + cart + theme + menu button need 448 px; at <=560 px the language switch
 // moves into the drawer (main.js copy), otherwise the menu button is pushed off a 390 px phone screen.
 const css=fs.readFileSync(path.join(root,'assets/style.css'),'utf8'),mjs=fs.readFileSync(path.join(root,'assets/main.js'),'utf8');
 assert.ok(/@media\(max-width:560px\)\{\s*\.nav-actions \.lang-switch\{display:none\}/.test(css)&&mjs.includes('classList.add("menu-lang")'),'narrow header: language switch moves into the drawer');}
// Cart (main.js): the header badge, the cart list and checkout read ONE filter. A browser could keep an
// old product id (removed packages, the former "set:<id>" key); the list hid it but the badge counted
// it, so a cart with one product showed "2". Unknown, unpriced or non-positive entries are dropped and
// the stored cart is cleaned on load.
{const src=fs.readFileSync(path.join(root,'assets/main.js'),'utf8');
 const a=src.indexOf('    var cart = (function () {'),b=src.indexOf('\n    })();',a);assert.ok(a>0&&b>a,'main.js cart module');
 const run=(stored)=>{const mem=stored===undefined?{}:{'gespa-cart':JSON.stringify(stored)},badges=[{textContent:'',hidden:true}],io={writes:0};
  const pk=[{id:'kit-2x540w',price:2200},{id:'boost-mppt',price:146},{id:'teklif-urun',price:null}];
  const sb={localStorage:{getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{io.writes++;mem[k]=v;}},$$:()=>badges,
   rawPkgOf:id=>pk.find(p=>p.id===id)||null};
  const cart=require('node:vm').runInNewContext(src.slice(a,b+'\n    })();'.length)+';cart',sb);
  return {cart,mem,badges,io};};
 const t=run({'kit-2x540w':1,'set:yolcu':1,'konut-baslangic':2,'teklif-urun':1,'boost-mppt':0});
 assert.equal(t.cart.count(),1,'badge counts only sellable products');
 assert.deepEqual(Object.keys(t.cart.read()),['kit-2x540w'],'cart list keeps only sellable products');
 assert.deepEqual(JSON.parse(t.mem['gespa-cart']),{'kit-2x540w':1},'stored cart is cleaned on load');
 t.cart.add('konut-baslangic',1);t.cart.add('teklif-urun',1);t.cart.setQty('set:kargo',2);
 assert.equal(t.cart.count(),1,'unknown or unpriced products are never added');
 t.cart.add('boost-mppt',2);t.cart.badge();assert.equal(t.cart.count(),3);assert.equal(t.badges[0].textContent,3,'badge shows the total quantity');
 for(const e of [run({}),run(undefined),run({'kit-2x540w':2})])assert.equal(e.io.writes,0,'a clean or missing cart is not rewritten on load');}
// Payment link amounts: Turkish writing wins ("120.000" is 120 thousand, not 120 TL), link t= values
// are plain JS numbers. The link generator (admin.html) and the payment page share ONE rule.
{const grab=(src,f)=>{const m=src.match(/function parseTL\(v\) \{[\s\S]*?\n\s*\}\n/);assert.ok(m,f+' parseTL');return m[0].replace(/\s+/g,' ').trim();};
 const pOde=grab(linkPay,'odeme.html'),pAdm=grab(fs.readFileSync(path.join(root,'admin.html'),'utf8'),'admin.html');
 assert.equal(pOde,pAdm,'admin.html and odeme.html parse amounts the same way');
 const parseTL=require('node:vm').runInNewContext('('+pOde+')');
 for(const [inp,out] of [['50',50],['120.000',120000],['4.500',4500],['1.250.000',1250000],['1.250,50',1250.5],['19.906,62',19906.62],['19906,62',19906.62],['19906.62',19906.62],['4500',4500],['₺ 4.500',4500],['1,250.50',1250.5],['12.5',12.5],['4,5',4.5],['',0],['abc',0]])
  assert.equal(parseTL(inp),out,'parseTL('+JSON.stringify(inp)+')');
 for(const v of [50,4500,120000,19906.62,1250.5,350000])assert.equal(parseTL(new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2}).format(v)),v,'prefilled '+v+' reads back');}
// Exchange rate (kur.js): TCMB parsing, floor + margin, jump guard, and ONE rounding rule shared by
// the browser (main.js), the server and the build. Every catalog product is USD so all prices follow the rate.
const kur=require(path.join(root,'kur.js')),vmk=require('node:vm');
const tcmbXml='<?xml version="1.0" encoding="UTF-8"?><Tarih_Date Tarih="29.09.2026" Date="09/29/2026"><Currency CrossOrder="0" Kod="USD" CurrencyCode="USD"><Unit>1</Unit><Isim>ABD DOLARI</Isim><ForexBuying>49.1123</ForexBuying><ForexSelling>49.2008</ForexSelling></Currency><Currency Kod="JPY"><Unit>100</Unit><ForexSelling>33.1</ForexSelling></Currency></Tarih_Date>';
assert.deepEqual(kur.parseTcmb(tcmbXml,'ForexSelling'),{rate:49.2008,date:'29.09.2026'},'TCMB USD selling rate');
assert.equal(kur.parseTcmb('<html>bakım</html>','ForexSelling'),null,'unexpected TCMB body is ignored');
assert.equal(kur.effectiveRate(48.5,49.2,0),49.2,'rate never drops below the floor');
assert.equal(kur.effectiveRate(50,49.2,0),50,'rate follows TCMB above the floor');
assert.equal(kur.effectiveRate(50,49.2,2),51,'optional margin on TCMB');
assert.ok(kur.saneJump(49.2,50.1,25)&&!kur.saneJump(49.2,4.92,25),'jump guard');
const mainSrc=fs.readFileSync(path.join(root,'assets/main.js'),'utf8');
const tlSrc=(mainSrc.match(/function tlRound\(v\) \{[^\n]*\}/)||[])[0];assert.ok(tlSrc,'main.js tlRound');
const tlMain=vmk.runInNewContext('('+tlSrc+')');
for(const v of [4.9,95,99.876,104.9,999,1000.2,1024,6376.32,9741.6,9999.9,10000,24999.996,73371.96,108240,122754])assert.equal(tlMain(v),kur.tlRound(v),'browser and server round '+v+' the same');
{const sbx={window:{}};vmk.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbx);const C=sbx.window.GESPA.config;
 const tl=C.packages.filter(p=>p.price!=null&&p.currency!=='USD').map(p=>p.id);
 assert.equal(tl.length,0,'every catalog product is USD so its price follows the exchange rate: '+tl.join(', '));
 assert.ok(C.usdTry>1&&C.fx&&C.fx.auto===true,'floor rate and live rate switch');}
console.log('Static SEO: '+urls.length+' sitemap pages, '+schemas+' JSON-LD blocks; links and translations passed.');
// Exercise the actual consent branch without loading analytics or contacting third parties.
const main=fs.readFileSync(path.join(root,'assets/main.js'),'utf8');
const analytics=main.slice(main.indexOf('    var gaLoaded = false;'),main.indexOf('    // Henüz seçim yapılmadı'));
const vm=require('node:vm');
function consentRun(choice,referrer){
 const listeners={};const sandbox={id:'G-TEST',KEY:'gespa-consent',URL,Date,encodeURIComponent,
   location:{pathname:'/en/cati-ges.html'},localStorage:{getItem:()=>choice},window:{},
   doc:{referrer,createElement:()=>({}),head:{appendChild:()=>{}},addEventListener:(name,fn)=>{listeners[name]=fn;}}};
 vm.runInNewContext('(function(){'+analytics+'})();',sandbox);
 return {events:sandbox.window.dataLayer||[],listeners};
}
const denied=consentRun('denied','https://chatgpt.com/c/private');assert.equal(denied.events.length,0);assert.ok(!denied.listeners.click);
const granted=consentRun('granted','https://chatgpt.com/c/private');
assert.equal(granted.events.filter(e=>e[1]==='ai_referral').length,1);
granted.listeners.click({target:{closest:()=>({getAttribute:()=> 'https://wa.me/905000000000?text=private-message'})}});
const contact=granted.events.find(e=>e[1]==='contact_click');assert.equal(contact[2].contact_method,'whatsapp');
assert.ok(!JSON.stringify(granted.events).includes('private'));
const unrelated=consentRun('granted','https://notchatgpt.com/');assert.ok(!unrelated.events.some(e=>e[1]==='ai_referral'));
console.log('Analytics: consent gate, exact AI source attribution and contact payload checks passed.');
// The production server runs in this process tree so HTTP tests share its network context.
const RECEIPT_TEST_SECRET='test-dekont-anahtari';
// ADMIN_PASS is set as on Railway: the public config password must then be rejected. Runtime data goes to
// a temporary folder so test questions never appear on a locally served page.
// The old password was public (config.js + public repo). It must be gone from the config and rejected.
const LEAKED_PASS='gespa2026';
{const vm=require('node:vm');const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),c);const C=c.window.GESPA.config;assert.ok(!(C.admin&&C.admin.pass),'config.js carries no admin password');}
assert.ok(!fs.readFileSync(path.join(root,'assets/config.js'),'utf8').includes(LEAKED_PASS),'leaked password removed from config.js');
const ADMIN_TEST_PASS='test-yonetici-sifresi',TEST_DATA=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'gespa-test-'));
// Gespa OS summary: a stored order carries buyer PII; the summary must expose the order but never the buyer.
const OS_TEST_TOKEN='os-test-belirteci-0123456789abcdefghij';
fs.writeFileSync(path.join(TEST_DATA,'orders.json'),JSON.stringify({tok1:{conversationId:'GSP-TEST-1',status:'paid',createdAt:new Date().toISOString(),totalTL:1234,items:[{id:'boost-mppt',qty:2,unitTL:7200}],buyer:{ad:'Ayşe Gizli',tel:'05551112233',eposta:'ayse@example.com',tckn:'12345678901',il:'Antalya',adres:'Gizli Sok. 1'}}}));
const port=4317,server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),IYZIPAY_API_KEY:'',IYZICO_API_KEY:'',IYZIPAY_SECRET_KEY:RECEIPT_TEST_SECRET,FX_AUTO:'0',ADMIN_PASS:ADMIN_TEST_PASS,DATA_DIR:TEST_DATA,OS_TOKEN:OS_TEST_TOKEN}});
let logs='',started=false;
const timeout=setTimeout(()=>{server.kill();console.error(logs);process.exitCode=1;},25000);
server.stderr.on('data',d=>logs+=d);
server.stdout.on('data',async d=>{
 logs+=d;if(started||!logs.includes('adresinde yayında'))return;started=true;
 try{
  for(const u of ['/','/en/','/cati-ges.html','/de/bakim-izleme.html','/ru/proje-manavgat-fabrika.html','/robots.txt','/sitemap.xml','/llms.txt']){
   const res=await fetch('http://127.0.0.1:'+port+u);assert.equal(res.status,200,u);await res.text();
  }
  const missing=await fetch('http://127.0.0.1:'+port+'/missing-seo-test.html');assert.equal(missing.status,404);
  // Markdown mirrors: served as text/markdown with a canonical Link; Accept negotiation returns the mirror.
  const md=await fetch('http://127.0.0.1:'+port+'/md/en/paket-285w.md');assert.equal(md.status,200);
  assert.ok(/text\/markdown/.test(md.headers.get('content-type')),'md content-type');
  assert.equal(md.headers.get('link'),'<'+origin+'/en/paket-285w.html>; rel="canonical"','md canonical link');
  assert.ok((await md.text()).includes('canonical: '+origin+'/en/paket-285w.html'),'md body');
  const neg=await fetch('http://127.0.0.1:'+port+'/paket-285w.html',{headers:{Accept:'text/markdown'}});
  assert.ok(/text\/markdown/.test(neg.headers.get('content-type'))&&/Accept/.test(neg.headers.get('vary')||''),'Accept: text/markdown negotiation');
  assert.equal(neg.headers.get('content-location'),'/md/paket-285w.md');await neg.text();
  const plain=await fetch('http://127.0.0.1:'+port+'/paket-285w.html');assert.ok(/text\/html/.test(plain.headers.get('content-type')),'html default');await plain.text();
  // Gespa OS summary: token-gated, read-only, no buyer PII; admin password is NOT accepted.
  {const u='http://127.0.0.1:'+port+'/api/os/summary';
   let r=await fetch(u);assert.equal(r.status,403,'os summary needs token');await r.text();
   r=await fetch(u,{headers:{'X-OS-Token':ADMIN_TEST_PASS}});assert.equal(r.status,403,'admin password is not an OS token');await r.text();
   r=await fetch(u,{method:'POST',headers:{'X-OS-Token':OS_TEST_TOKEN}});assert.equal(r.status,405,'os summary is read-only');await r.text();
   r=await fetch(u,{headers:{'X-OS-Token':OS_TEST_TOKEN}});assert.equal(r.status,200,'os summary with token');
   const raw=await r.text(),j=JSON.parse(raw);
   assert.equal(j.orders.count,1);assert.equal(j.orders.items[0].ref,'GSP-TEST-1');
   assert.deepEqual(j.orders.items[0].items.map(x=>x.qty),[2]);
   for(const leak of ['Ayşe Gizli','05551112233','ayse@example.com','12345678901','Gizli Sok','buyer'])assert.ok(!raw.includes(leak),'os summary leaks '+leak);
   assert.ok(j.catalog.count>0&&Array.isArray(j.catalog.alerts)&&j.catalog.products.every(p=>'priceTL' in p),'catalog section');
   assert.ok('pending' in j.qa&&'total' in j.visitors&&'rate' in j.fx&&'card' in j.pay,'summary sections');}
  // AI crawler counter: a GPTBot request is counted and readable with the admin password only.
  const ua=await fetch('http://127.0.0.1:'+port+'/llms.txt',{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)'}});assert.equal(ua.status,200);await ua.text();
  const bad=await fetch('http://127.0.0.1:'+port+'/api/aibots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pass:'yanlis'})});assert.equal(bad.status,403);await bad.text();
  const cfgSrc=fs.readFileSync(path.join(root,'assets/config.js'),'utf8');const sb={window:{}};vm.runInNewContext(cfgSrc,sb);
  const pub=await fetch('http://127.0.0.1:'+port+'/api/aibots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pass:LEAKED_PASS})});
  assert.equal(pub.status,403,'public config password is rejected once ADMIN_PASS is set');await pub.text();
  const ok=await fetch('http://127.0.0.1:'+port+'/api/aibots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pass:ADMIN_TEST_PASS})});
  assert.equal(ok.status,200);const bots=(await ok.json()).bots;const gpt=bots.find(b=>b.name==='GPTBot');
  assert.ok(gpt&&gpt.kind==='ai'&&gpt.count>=1&&gpt.top.some(t=>t.path==='/llms.txt'),'GPTBot counted');
  // Visitor counter: Railway healthcheck, 24 h figure key, and the password-protected handoff export
  // a new deployment reads from the old one (so a redeploy does not reset the badge).
  const hc=await fetch('http://127.0.0.1:'+port+'/api/health');assert.equal(hc.status,200,'healthcheck');await hc.text();
  const rj=JSON.parse(fs.readFileSync(path.join(root,'railway.json'),'utf8'));assert.equal(rj.deploy.healthcheckPath,'/api/health','railway healthcheck path');
  const vis=await (await fetch('http://127.0.0.1:'+port+'/api/visitors')).json();
  assert.ok(Number.isFinite(vis.total)&&'day' in vis&&(vis.day===null||Number.isFinite(vis.day)),'visitors api: total + day');
  const ex403=await fetch('http://127.0.0.1:'+port+'/api/visitors/export',{method:'POST',body:JSON.stringify({pass:'yanlis'})});assert.equal(ex403.status,403);await ex403.text();
  const ex=await fetch('http://127.0.0.1:'+port+'/api/visitors/export',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})});
  assert.equal(ex.status,200);const exj=await ex.json();assert.ok(exj.total===vis.total&&exj.hours&&exj.hoursSince>0,'visitors export for redeploy handoff');
  // Payment receipt token: the receipt opens WITHOUT a server-side order record (Railway without a
  // Volume wipes orders.json on every deploy). Format must match server.js receiptSeal():
  // 0x01 + iv(12) + GCM tag(16) + AES-256-GCM(deflateRaw(JSON)), key = HMAC(iyzico secret, label).
  const crypto=require('node:crypto'),zlib=require('node:zlib');
  const rkKey=crypto.createHmac('sha256',RECEIPT_TEST_SECRET).update('gespa-dekont-v1').digest();
  const seal=o=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',rkKey,iv);const b=Buffer.concat([c.update(zlib.deflateRawSync(Buffer.from(JSON.stringify(o)))),c.final()]);return Buffer.concat([Buffer.from([1]),iv,c.getAuthTag(),b]).toString('base64url');};
  const rcPost=body=>fetch('http://127.0.0.1:'+port+'/api/order/receipt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const tok=seal({no:'GMKTEST1',date:'2026-09-28T09:47:09.000Z',amount:20000,paymentId:'P1',desc:'GES Marketim siparişi',buyer:{ad:'Ad',il:'Il',firma:''},items:[]});
  const rc=await rcPost({r:'00112233445566778899aabb',k:tok});assert.equal(rc.status,200,'receipt from token');
  const rcj=await rc.json();assert.equal(rcj.no,'GMKTEST1');assert.equal(rcj.amount,20000);
  const forged=tok.slice(0,40)+(tok[40]==='A'?'B':'A')+tok.slice(41);
  const rf=await rcPost({k:forged});assert.equal(rf.status,404,'tampered receipt token rejected');await rf.text();
  const r0=await rcPost({});assert.equal(r0.status,400);await r0.text();
  const rg=await fetch('http://127.0.0.1:'+port+'/api/order/receipt?r=00112233445566778899aabb');assert.equal(rg.status,404,'old rid-only link without record');await rg.text();
  // Only published files are served: server code, docs, tests, supplier source documents and the
  // runtime data folder (orders with Turkish ID numbers when no Volume is attached) must 404.
  for(const u of ['/data/visitors.json','/data/orders.json','/server.js','/build.js','/package.json','/railway.json','/CLAUDE.md','/docs/odeme.md','/tools/foto-hazirla.py','/content/sss.js','/tests/seo.test.js','/.gitignore','/.github/workflows/indexnow.yml','/assets/img/products/kaynak/mc4-set.png','/assets/../data/visitors.json']){
   const r=await fetch('http://127.0.0.1:'+port+u);assert.equal(r.status,404,'private path must not be served: '+u);await r.text();
  }
  for(const u of ['/b725d1a9c07cf60e8cb21fed369d7db3.txt','/urunler.xml','/md/index.md','/assets/config.js']){
   const r=await fetch('http://127.0.0.1:'+port+u);assert.equal(r.status,200,'public path: '+u);await r.text();
  }
  const fx=await (await fetch('http://127.0.0.1:'+port+'/api/fx')).json();
  {const sbx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbx);
   assert.ok(fx.auto===false&&fx.rate===sbx.window.GESPA.config.usdTry&&fx.floor===fx.rate,'/api/fx: live rate off in tests, manual rate applies');}
  const langDir=await fetch('http://127.0.0.1:'+port+'/en',{redirect:'manual'});assert.equal(langDir.status,301,'/en redirects to /en/');await langDir.text();
  // Q&A under the regulation guide: posts wait for approval; visitor text is escaped in the HTML and in the
  // Article JSON-LD; moderation needs ADMIN_PASS; live threads are printed into the served page (bots run no JS).
  {const api=(u,b)=>fetch('http://127.0.0.1:'+port+u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
   const pg='gunes-paneli-kacak-elektrik-cezasi';
   const getPage=async()=>{const x=await fetch('http://127.0.0.1:'+port+'/'+pg+'.html');assert.equal(x.status,200);return x.text();};
   const evil='Çatımda 3 kW </script><script>alert(1)</script> $& var, başvuru gerekir mi?';
   let r=await api('/api/qa/ask',{page:pg,name:'Ayşe',text:evil,ok:true,ms:500});assert.equal(r.status,400,'Q&A: too fast is a bot');await r.text();
   r=await api('/api/qa/ask',{page:pg,name:'Bot',text:'spam spam spam spam',ok:true,ms:5000,website:'x'});assert.equal(r.status,200,'Q&A: honeypot answers ok');await r.text();
   r=await api('/api/qa/ask',{page:pg,name:'GESPA Uzmanı',text:'Uzman taklidi deneme metni',ok:true,ms:5000});assert.equal(r.status,400,'Q&A: reserved name');await r.text();
   r=await api('/api/qa/ask',{page:'index',name:'Ayşe',text:evil,ok:true,ms:5000});assert.equal(r.status,404,'Q&A: configured pages only');await r.text();
   r=await api('/api/qa/ask',{page:pg,name:'Ayşe <b>K</b>',text:evil,ok:true,ms:5000});assert.equal(r.status,200);assert.ok((await r.json()).pending);
   assert.ok(!(await getPage()).includes('alert(1)'),'Q&A: pending question is not published');
   r=await api('/api/qa/admin',{pass:LEAKED_PASS,op:'list'});assert.equal(r.status,403,'Q&A: moderation rejects the old public password');await r.text();
   const list=async()=>{const x=await api('/api/qa/admin',{pass:ADMIN_TEST_PASS,op:'list'});assert.equal(x.status,200);return (await x.json()).items;};
   let items=await list();assert.equal(items.length,1,'Q&A: honeypot post was not stored');const q=items[0];assert.equal(q.status,'pending');
   r=await api('/api/qa/reply',{page:pg,parent:q.id,name:'Mehmet',text:'Başvurun.',ok:true,ms:5000});assert.equal(r.status,404,'Q&A: no replies to unpublished questions');await r.text();
   r=await api('/api/qa/admin',{pass:ADMIN_TEST_PASS,op:'answer',parent:q.id,text:'Önce dağıtım şirketine başvurun.'});assert.equal(r.status,200);await r.text();
   r=await api('/api/qa/reply',{page:pg,parent:q.id,name:'Mehmet',text:'Ben de başvurdum.',ok:true,ms:5000});assert.equal(r.status,200);await r.text();
   let html=await getPage();const block=(html.match(/<!-- QA:STATIC -->([\s\S]*?)<!-- \/QA:STATIC -->/)||[])[1]||'';
   assert.ok(block.includes('&lt;/script&gt;&lt;script&gt;alert(1)')&&!html.includes('<script>alert(1)'),'Q&A: visitor text is escaped');
   assert.ok(block.includes('$&amp;'),'Q&A: "$&" in visitor text is not a replacement pattern');
   assert.ok(block.includes('Ayşe &lt;b&gt;K&lt;/b&gt;')&&/qa-expert/.test(block),'Q&A: name escaped, expert answer published');
   assert.ok(!block.includes('Ben de başvurdum'),'Q&A: visitor reply waits for approval');
   const lds=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   const art=lds.find(x=>x['@type']==='Article');
   assert.ok(art&&art.commentCount===2&&art.comment[0].comment[0].author['@type']==='Organization','Q&A: Article comments match the page');
   items=await list();const rep=items.find(x=>x.kind==='a'&&!x.expert);
   r=await api('/api/qa/admin',{pass:ADMIN_TEST_PASS,op:'approve',id:rep.id});assert.equal(r.status,200);await r.text();
   assert.ok((await getPage()).includes('Ben de başvurdum'),'Q&A: approved reply is published');
   r=await api('/api/qa/export',{pass:ADMIN_TEST_PASS});assert.equal(r.status,200);assert.equal((await r.json()).items.length,3,'Q&A: redeploy handoff export');
   r=await api('/api/qa/admin',{pass:ADMIN_TEST_PASS,op:'delete',id:q.id});assert.equal(r.status,200);await r.text();
   assert.equal((await list()).length,0,'Q&A: deleting a question removes its answers');
   html=await getPage();assert.ok(!html.includes('alert(1)')&&html.includes('qa-empty'),'Q&A: deleted thread leaves the page');
   r=await api('/api/admin/login',{pass:'yanlis'});assert.equal(r.status,403);await r.text();
   r=await api('/api/admin/login',{pass:ADMIN_TEST_PASS});assert.deepEqual(await r.json(),{ok:true,secure:true},'admin login is verified by the server');}
  console.log('HTTP: key pages and bot files return 200; missing page returns 404; markdown mirrors, Accept negotiation, AI crawler counter, visitor handoff, receipt tokens, the public-file allowlist and the moderated Q&A work.');
 }catch(e){console.error(e);process.exitCode=1;}finally{clearTimeout(timeout);server.kill();fs.rmSync(TEST_DATA,{recursive:true,force:true});}
});
server.on('error',e=>{clearTimeout(timeout);console.error(e);process.exitCode=1;});
