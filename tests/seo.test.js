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
 if(h.includes('<!-- /SISTER:STATIC -->'))assert.ok(/<!-- HELP:STATIC --><a href="sss.html">[^<]+<\/a><a href="sozluk.html">[^<]+<\/a><!-- TR:ONLY --><a href="rehberler.html">[^<]+<\/a><a href="elektrikci-cantasi.html">[^<]+<\/a><a href="gunes-paneli-kacak-elektrik-cezasi.html">[^<]+<\/a><!-- \/TR:ONLY --><!-- \/HELP:STATIC -->/.test(h),f+': footer help links');
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
// Top menu (26 Oct 2026, CRO decision): Mağaza · Çatı & Arazi GES · Tarımsal Sulama · Elektrikli Araç ·
// Referanslar · Hakkımızda · "Ücretsiz Keşif" WhatsApp button (data-wa-kesif). No dropdown, no AI-products
// item: the AI hub and the tools stay reachable from the footer "Kurumsal" column (tools/menu-uret.py
// writes every page). The services hub keeps a link from every page through the footer "Hizmetler" column.
// The AI hub lists its products from the visible cards (ItemList of Service, not Product: no price) and
// keeps the safety notes on fire and fall detection.
{let navs=0;
 for(const f of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){const h=fs.readFileSync(path.join(root,f),'utf8'),m=h.match(/<nav class="menu" id="menu"[\s\S]*?<\/nav>/);if(!m)continue;navs++;
  assert.ok(!m[0].includes('Solar Sistemler')&&!m[0].includes('Yapay Zekâ Ürünleri'),f+': no Solar Sistemler / AI item in the menu');
  assert.ok(/^<nav[^>]*>\s*<a href="online-satis\.html"( class="active")?>Mağaza<\/a>/.test(m[0]),f+': Mağaza is the first menu item');
  assert.ok(/<a href="hizmetler\.html"( class="active")?>Çatı &amp; Arazi GES<\/a>/.test(m[0]),f+': services hub in the menu');
  assert.ok(/<a href="https:\/\/wa\.me\/\d+\?text=[^"]+" class="btn btn-sm" data-wa-kesif target="_blank" rel="noopener">Ücretsiz Keşif<\/a>/.test(m[0]),f+': free-survey WhatsApp button');
  assert.equal((m[0].match(/class="menu-group/g)||[]).length,0,f+': no dropdown in the menu');
  assert.ok(/<a href="yapay-zeka-urunleri\.html">Yapay Zekâ Ürünleri<\/a>/.test(h),f+': footer links the AI hub');
  assert.ok(/<div class="footer-col"><h4>Hizmetler<\/h4>(?:(?!<\/div>)[\s\S])*href="hizmetler\.html"/.test(h),f+': footer links the services hub');}
 assert.ok(navs>=40,'menus checked: '+navs);
 assert.ok(/<nav class="menu"[\s\S]*?<a href="projeler\.html" class="active">/.test(fs.readFileSync(path.join(root,'proje-kemer-villa.html'),'utf8')),'project pages mark Referanslar active');
 assert.ok(/<nav class="menu"[\s\S]*?<a href="online-satis\.html" class="active">/.test(fs.readFileSync(path.join(root,'panel-700w.html'),'utf8')),'product pages mark Mağaza active');
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
// Elektrikçi Çantası (elektrikci-cantasi.html, assets/usta.js): the pure calculators are checked against values worked out by
// hand, the static worked examples on the page (what crawlers read without JS) must equal what the same functions return for the
// config defaults, and no coefficient may live outside config.calc.
{const vm=require('node:vm');const sbu={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbu);
 const ustaSrc=fs.readFileSync(path.join(root,'assets/usta.js'),'utf8');vm.runInNewContext(ustaSrc,sbu);
 const C=sbu.window.GESPA.config,U=sbu.window.GESPA.usta,k=U.k(C),near=(a,b,m)=>assert.ok(Math.abs(a-b)<1e-6,m+': '+a+' != '+b);
 assert.ok(C.calc.usta&&k.rho===C.calc.cable.rhoCu&&k.dec===C.calc.shading.declination&&k.hpPerKw===C.calc.pump.hpPerKw&&k.invEff===C.builder.sizing.invEff,'usta reuses shared config');
 {const s=U.sun(37,23.45);near(s.summer,76.45,'sun summer');near(s.equinox,53,'sun equinox');near(s.winter,29.55,'sun winter');near(U.sun(41,23.45).winter,25.55,'sun winter 41');
  assert.ok(s.valid&&!U.sun(10,23.45).valid&&!U.sun(70,23.45).valid,'sun formula validity range');
  const t=U.tilts(37,15);assert.deepEqual([t.year,t.summer,t.winter],[37,22,52],'rule-of-thumb tilts');assert.equal(U.tilts(10,15).summer,0,'tilt clamps at 0');}
 {const c=U.cable(48,15,5,4,0.0175);near(c.r,0.04375,'cable R');near(c.drop,0.65625,'cable drop');near(c.pct,1.3671875,'cable pct');near(c.loss,9.84375,'cable loss');
  near(U.cable(600,11,30,4,0.0175).drop,2.8875,'cable drop 600 V');
  assert.equal(U.cableRec(48,15,5,[4,6,10,16,25],0.0175,1),6,'smallest section');assert.equal(U.cableRec(12,30,10,[4,6,10,16,25],0.0175,1),null,'no listed section fits');
  near(U.diaOf(4),2.2567583,'4 mm2 diameter');}
 {near(U.coldVoc(40,-0.3,-10,25),44.2,'cold Voc');const r=U.string({voc:40,vmp:33,beta:-0.3,tmin:-10,vmax:150,mpptMin:60},25);assert.deepEqual([r.max,r.min],[3,2],'string max/min');
  const e=U.string({voc:50,vmp:50,beta:0,tmin:25,vmax:150,mpptMin:100},25);assert.deepEqual([e.max,e.min],[3,2],'exact divisions do not round the wrong way');
  assert.equal(U.string({voc:42.56,vmp:34.98,beta:-0.25,tmin:-15,vmax:100,mpptMin:0},25).max,2,'42.56 V x1.10 cold -> 2 in series on 100 V');}
 {const a=U.array(34.98,10.3,2,2);near(a.v,69.96,'array V');near(a.a,20.6,'array A');near(a.w,1441.176,'array W');near(U.array(40,10,3,1).w,1200,'3s1p W');}
 {const b=U.bank(12,100,2,2);assert.deepEqual([b.v,b.ah],[24,200],'bank V/Ah');near(b.kwh,4.8,'bank kWh');near(U.bank(12.8,100,4,1).kwh,5.12,'4s LiFePO4 kWh');}
 {const f4=U.fuse(4,11.37,30),f3=U.fuse(3,11.37,30);near(f4.rev,34.11,'fuse rev 4');near(f3.rev,22.74,'fuse rev 3');assert.ok(f4.needed&&!f3.needed,'fuse verdict');
  assert.ok(!U.fuse(3,15,30).needed&&!U.fuse(1,11.37,30).needed&&U.fuse(2,31,30).needed,'fuse boundary: equal is not exceeding');}
 {near(U.wToA(1000,12),83.3333333,'W->A');near(U.aToW(20,48),960,'A->W');near(U.ahToWh(100,12),1200,'Ah->Wh');near(U.whToAh(5120,51.2),100,'Wh->Ah');
  near(U.hpToKw(1,1.341),0.7457122,'HP->kW');near(U.kwToHp(7.5,1.341),10.0575,'kW->HP');
  const A=C.calc.usta.awg;near(U.awgDia(36,A),0.127,'AWG 36');near(U.awgDia(-3,A),11.684,'AWG 4/0 = 0.46 in');assert.ok(Math.abs(U.awgDia(10,A)-2.588)<5e-4&&Math.abs(U.awgArea(10,A)-5.261)<1e-3,'AWG 10');
  near(U.mm2ToAwg(U.awgArea(10,A),A),10,'mm2 -> AWG round trip');assert.equal(U.awgLabel(-3),'4/0');assert.equal(U.awgLabel(0),'1/0');
  near(U.invCurrent(1000,12,0.92),90.5797101,'inverter battery current');}
 // Round 2 tools: AC drop, load current, Ohm, controller current, runtime, refill, C rate, daily yield, temperature, shadow, slope, load.
 assert.ok(k.dod===C.builder.sizing.dod&&k.sunHours===C.builder.sizing.sunHours&&k.sysEff===C.builder.sizing.systemEff,'usta reuses the Sistem Kurucu coefficients');
 {const a1=U.acDrop(1,16,25,2.5,0.0175,0.9,230),a3=U.acDrop(3,16,25,2.5,0.0175,0.9,400);near(a1.drop,5.04,'AC 1ph drop');near(a1.pct,5.04/230*100,'AC 1ph pct');
  near(a3.drop,2.52*Math.sqrt(3),'AC 3ph drop');assert.ok(Math.abs(a3.pct-1.0912)<1e-4,'AC 3ph pct');near(U.acDrop(1,10,10,1.5,0.0175,1,230).drop,2.3333333,'AC 1ph cos 1');
  assert.equal(U.acRec(1,16,25,[1.5,2.5,4,6],0.0175,0.9,230,2),4,'AC smallest section for a user limit');assert.equal(U.acRec(1,16,25,[1.5,2.5],0.0175,0.9,230,1),null,'AC no section fits');}
 {near(U.current('1',3000,230,0.9),14.4927536,'1ph current');assert.ok(Math.abs(U.current('3',3000,400,0.9)-4.811252)<1e-5,'3ph current');near(U.current('dc',3000,48,1),62.5,'DC current');
  near(U.current('3',11000,400,1),11000/(Math.sqrt(3)*400),'3ph 11 kW');near(U.kwToKva(3,0.9),3.3333333,'kW->kVA');near(U.kvaToKw(5,0.8),4,'kVA->kW');}
 {const eq=(o,e,m)=>{const r=U.ohm(o);near(r.v,e[0],m+' V');near(r.i,e[1],m+' I');near(r.r,e[2],m+' R');near(r.p,e[3],m+' P');};
  eq({v:12,i:5},[12,5,2.4,60],'ohm VI');eq({v:12,r:4},[12,3,4,36],'ohm VR');eq({v:230,p:2300},[230,10,23,2300],'ohm VP');eq({i:2,r:6},[12,2,6,24],'ohm IR');
  eq({i:5,p:60},[12,5,2.4,60],'ohm IP');eq({r:10,p:1000},[100,10,10,1000],'ohm RP');assert.equal(U.ohm({v:12}),null,'ohm needs two values');assert.equal(U.ohm({v:0,i:5}),null,'ohm rejects zero');}
 {near(U.controllerA(1440,24),60,'controller A');near(U.controllerA(655,12),54.5833333,'controller A 12 V');
  const r=U.runtime(12,100,0.9,0.92,200);near(r.wh,993.6,'usable Wh');near(r.hours,4.968,'runtime h');near(U.runtime(51.2,102,0.9,1,1000).hours,4.70016,'runtime 51.2 V');
  const q=U.refill(100,360,12,4.5);near(q.i,30,'refill A');near(q.hours,3.3333333,'refill h');near(q.days,0.7407407,'refill days');
  const c=U.cRate(0.5,100);assert.deepEqual([c.i,c.hours],[50,2],'C rate');near(U.cRate(0.2,280).i,56,'0.2C of 280 Ah');near(U.cOf(50,100),0.5,'C of');}
 {near(U.dailyKwh(1.44,4.5,0.75),4.86,'daily kWh');near(U.dailyKwh(1.44,C.builder.sizing.sunHours,C.builder.sizing.systemEff),4.86,'daily kWh uses builder coefficients');
  near(U.tempPower(400,-0.35,60,25),351,'power at 60 C');near(U.tempPower(400,-0.35,25,25),400,'power at STC');near(U.tempPower(400,-0.35,5,25),428,'power when cold');
  near(U.cellTemp(30,45,1000,C.calc.usta.noct),61.25,'NOCT cell temperature');near(U.cellTemp(20,45,800,C.calc.usta.noct),45,'NOCT definition point');}
 {near(U.shadow(1,45),1,'shadow at 45');near(U.shadow(2,45),2,'shadow scales with height');assert.ok(Math.abs(U.shadow(1,29.55)-1.7639)<1e-3&&Math.abs(U.shadow(1,30)-Math.sqrt(3))<1e-9,'winter shadow');
  near(U.slopePct(45),100,'45 deg = 100%');assert.ok(Math.abs(U.slopePct(30)-57.7350269)<1e-6&&Math.abs(U.slopeDeg(50)-26.5650512)<1e-6,'slope conversions');near(U.slopeDeg(U.slopePct(17)),17,'slope round trip');
  near(U.loadWh(100,5,1),500,'load Wh');near(U.loadWh(60,4,3),720,'load Wh x3');}
 // Round 3: appliance list, fuse/cable coordination, motor current, usage cost, run hours.
 {const rows=U.presetRows(k,'karavan');assert.equal(rows.length,Object.keys(C.builder.presets.find(x=>x.id==='karavan').items).length,'preset rows come from config.builder');
  for(const r of rows)assert.ok(C.builder.appliances.some(a=>a.name===r.name&&a.w===r.w&&a.h===r.h),'appliance wattage is the Sistem Kurucu value: '+r.name);
  const lp=U.loadPlan([{w:60,n:1,h:8},{w:10,n:4,h:5},{w:15,n:2,h:3},{w:65,n:1,h:4}],{sun:4.5,eff:0.75,days:1,v:12,dod:0.9,eta:0.92});
  near(lp.wh,1030,'list Wh');near(lp.sumW,195,'list inverter W');near(lp.panelW,1030/3.375,'list panel W');assert.ok(Math.abs(lp.panelW-305.185)<1e-3&&Math.abs(lp.ah-103.6634)<1e-3,'list panel/battery');
  near(U.loadPlan([{w:100,n:2,h:5}],{sun:5,eff:0.8,days:2,v:24,dod:0.5,eta:1}).ah,2000/12,'list Ah, 2 days 24 V');
  assert.deepEqual([U.coord(18,20,24).ok,U.coord(18,20,18).cable,U.coord(25,20,24).load,U.coord(20,20,20).ok],[true,false,false,true],'Ib <= In <= Iz');
  const m=U.motor(2,1.341,0.85,0.85,230,'1');near(m.shaftKw,2/1.341,'motor shaft kW');near(m.inKw,2/1.341/0.85,'motor input kW');assert.ok(Math.abs(m.i-8.9751)<1e-3&&Math.abs(U.motor(2,1.341,0.85,0.85,400,'3').i-2.9795)<1e-3,'motor current');
  const u=U.usage(1000,2,30,2.5);assert.deepEqual([u.kwh,u.cost],[60,150],'usage kWh and cost');near(U.usage(60,8,365,3).kwh,175.2,'usage per year');
  near(U.runHours(4.86,100),48.6,'run hours');near(U.runHours(1.2,600),2,'run hours 600 W');}
 const pg=fs.readFileSync(path.join(root,'elektrikci-cantasi.html'),'utf8'),EX=U.examples(C);
 const toolIds=[...pg.matchAll(/<section class="usta-tool" id="([^"]+)" data-usta-tool="\1" data-kw="[^"]+">/g)].map(m=>m[1]);EX['meta.count']=String(toolIds.length);
 assert.equal(toolIds.length,26,'tool count');assert.equal(new Set(toolIds).size,toolIds.length,'tool ids unique');
 for(const m of pg.replace(/<[^>]+>/g,'').matchAll(/(\d+) ücretsiz (?:saha |hesaplama )?ara[cç]/g))assert.equal(+m[1],toolIds.length,'stale tool count in page text');
 const tags=[...pg.matchAll(/<data data-ex="([^"]+)" value="([^"]*)">([^<]*)<\/data>/g)];
 assert.equal(tags.length,(pg.match(/data-ex=/g)||[]).length,'every worked-example value uses the <data data-ex value> form');
 assert.ok(tags.length>=200,'page carries the static worked examples');
 for(const m of tags){assert.ok(m[1] in EX,'unknown example key '+m[1]);assert.equal(m[3],EX[m[1]],'static example '+m[1]+' matches the calculator');assert.equal(m[2],m[3],'data value '+m[1]);}
 for(const p of ['egim','kablo','dizi','seri','aku','sigorta','cev','ac','akim','ohm','sk','sure','sarj','c','uretim','sic','golge','cati','liste','motor','uyum','tuk'])assert.ok(tags.some(m=>m[1].startsWith(p+'.')),'worked example for '+p);
 assert.equal(EX['sigorta.verdict'],'gerekir');assert.equal(EX['kablo.rec'],'6');assert.equal(EX['dizi.max'],'3');
 for(const id of ['egim','kablo','dizi','seri-paralel','aku','sigorta','cevirici','kontrol','ac-kablo','akim','ohm','sarj-kontrol','aku-sure','aku-sarj','c-orani','gunluk-uretim','sicaklik-gucu','golge','cati-egimi','yuk-listesi','inverter-aku-akimi','sigorta-kablo-uyumu','hp-kw-amper','cihaz-tuketimi','inverter-kodlari','inverter-ayarlari'])
  assert.ok(toolIds.includes(id)&&pg.includes('href="#'+id+'"'),'tool anchor #'+id);
 // App layout (progressive enhancement): sidebar lists every tool once in category order, the workspace holds all tools in the HTML (JS shows one),
 // explanations sit in closed <details>, and no content-bearing element is hidden from non-JS readers.
 {const cats=[...pg.matchAll(/<section class="usta-cat" id="([^"]+)">/g)].map(m=>m[1]),side=(pg.match(/<nav class="usta-side"[\s\S]*?<\/nav>/)||[''])[0];
  assert.equal(cats.length,8,'eight tool categories');assert.equal(cats[0],'grup-kablo','cable and current category comes first');assert.equal((side.match(/class="usta-sg"/g)||[]).length,8,'sidebar groups');
  assert.deepEqual([...side.matchAll(/<a href="#([^"]+)" data-t="\1">/g)].map(m=>m[1]),toolIds,'sidebar lists every tool once, in page order');
  assert.ok(/<div class="usta-find usta-js">[\s\S]*id="ustaFind"/.test(side),'search box lives in the sidebar and is a JS-only control');
  const def=(pg.match(/<main id="main" data-article data-usta data-usta-app="([^"]+)">/)||[])[1];assert.equal(def,'kablo','default tool is the cable tool');
  assert.ok(pg.indexOf('<nav class="usta-side"')<pg.indexOf('<section class="usta-tool"')&&pg.indexOf('id="ustaMenu"')>0&&pg.indexOf('id="ustaPrev"')>0,'sidebar before workspace; mobile bar present');
  for(const m of pg.matchAll(/<([a-z0-9]+)\b([^>]*)\shidden=""[^>]*>/g))assert.ok((m[1]==='p'&&/class="usta-msg"/.test(m[2]))||((m[1]==='a'||m[1]==='button')&&/data-usta-(wa|cb)|id="(ucToCable|xiUse)"/.test(m[0])),'static hidden only on empty message lines and JS-only controls: '+m[0].slice(0,80));
  assert.ok(!/<(section|details|div|article|h[1-6]|table|ul)\b[^>]*\shidden/.test(pg),'no hidden content blocks');
  const tools=[...pg.matchAll(/<section class="usta-tool" id="([^"]+)"[\s\S]*?<\/section>/g)];assert.equal(tools.length,toolIds.length,'tool sections parse');
  for(const t of tools){const one=(t[0].match(/<p class="usta-one">([^<]*)<\/p>/)||[])[1];assert.ok(one&&one.length<=120,t[1]+': one short sentence');
   assert.ok(/<details class="usta-more"><summary>Formül, örnek ve sınırlar<\/summary>/.test(t[0])&&!/<details[^>]*\sopen/.test(t[0]),t[1]+': explanation collapsed by default');
   assert.ok(t[0].indexOf('class="usta-grid')<t[0].indexOf('<details class="usta-more"')&&t[0].indexOf('usta-disc')<t[0].indexOf('<details class="usta-more"'),t[1]+': inputs/result and safety note come before the explanation');
   for(const k of ['data-usta-reset','data-usta-print','data-usta-copy','data-usta-wa='])assert.ok(t[0].includes(k),t[1]+': action '+k);}
  assert.ok(/body:has\(main\[data-usta\]\) \.mobile-cta\{display:none !important\}/.test(fs.readFileSync(path.join(root,'assets/style.css'),'utf8')),'fixed mobile contact bar is hidden on the tool pages only');
  assert.ok(pg.indexOf('<details class="usta-about">')>pg.indexOf('</nav>')&&pg.indexOf('id="sss"')>pg.lastIndexOf('<section class="usta-tool"'),'about box and FAQ sit below the app');
  const md=fs.readFileSync(path.join(root,'md/elektrikci-cantasi.md'),'utf8');
  assert.ok((md.match(/\*\*Formül:\*\*/g)||[]).length===toolIds.length-3&&md.includes('### AC kablo gerilim düşümü')&&md.includes('## Sık sorulan sorular'),'markdown mirror keeps every tool, formula and the FAQ');}
 assert.ok(/reaktans/.test(pg)&&!/izin verilen (en yüksek )?gerilim düşümü\s*(sınırı\s*)?%\s*\d/.test(pg),'AC tool states its limit and claims no permitted drop');
 assert.ok(/<main id="main" data-article data-usta[ >]/.test(pg)&&pg.includes('<script defer src="assets/usta.js"></script>'),'page shell + deferred usta.js');
 assert.equal((pg.match(/Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili/g)||[]).length,toolIds.length,'every tool carries the approximate-values line');
 assert.equal((pg.match(/class="usta-formula"/g)||[]).length,toolIds.length-3,'every calculator shows its formula (checklist and the two inverter reference tools have none)');
 {const n=(pg.match(/data-chk="/g)||[]).length;assert.ok(n>=10&&n<=14,'checklist size');}
 assert.ok(!/innerHTML|insertAdjacentHTML|document\.write|https?:\/\/(?!wa\.me\/|www\.w3\.org\/2000\/svg)/.test(ustaSrc),'usta.js: no HTML injection, no external resources');
 assert.ok(!/\b(23\.45|0\.0175|1\.341|0\.92|0\.127|0\.75|4\.5|230|400|800)\b/.test(ustaSrc),'usta.js holds no coefficients (config.calc only)');
 assert.ok(!/ampasite|akım taşıma kapasitesi\s*[:=]\s*\d|TS HD|IEC 6\d{4}|NEC \d/i.test(pg+ustaSrc),'no standards tables or clause citations');
 // Inverter fault codes and settings guide (assets/inverter-veri.json, tools/inverter-veri.py). Safety policy: families are never merged,
 // every row carries type + meaning + source page, uncertain settings are not published, the lookup never guesses.
 const INVD=JSON.parse(fs.readFileSync(path.join(root,'assets/inverter-veri.json'),'utf8'));
 {const want={'deye-sg05lp1':19,'deye-sg05lp3':25,'mexx-p4kw':34,'mexx-p6kw':35,'mexx-p12kw':34,'sunon-iv-8kw':40,'axpert-vm2-pf1':26,'axpert-mks':25,'victron-mppt':73,'solis-grid-tied':57,'akilli-36-72kw':53,'akilli-1-5kva':22};
  assert.deepEqual(Object.fromEntries(INVD.families.map(f=>[f.id,f.codes.length])),want,'inverter families and row counts');
  for(const f of INVD.families){assert.ok(f.brand&&f.name&&f.src&&f.src.t&&(f.src.k==='web'?/^https:\/\//.test(f.src.url):f.src.k==='owner'),f.id+': provenance');
   const seen=new Set();for(const r of f.codes){assert.ok(r.c&&['fault','alarm','warning','info'].includes(r.t)&&r.m&&r.p,f.id+' '+r.c+': code, type, meaning, page');
    const key=r.t+'|'+r.c;assert.ok(!seen.has(key),f.id+': duplicate '+key+' (same code may repeat only across types)');seen.add(key);
    if(f.lang!=='tr')assert.ok(r.o,f.id+' '+r.c+': translated row keeps the manufacturer wording');
    if(r.u)assert.ok(r.n,f.id+' '+r.c+': uncertain code row carries the reason');}}
  const raw=JSON.stringify(INVD);assert.ok(!/"uncertain"|atakale|425 2200|tommatech|abax|watchpower/i.test(raw),'no raw uncertainty flags, publisher contacts or brands read from a PDF cover photo');
  assert.deepEqual(INVD.settings.map(x=>[x.id,x.programs.length,x.lithium.length>0,x.grid.length>0]),[['A',38,true,true],['B',38,true,true],['C',17,true,true]],'settings: three manuals, published program rows');
  const nos=id=>INVD.settings.find(x=>x.id===id).programs.map(r=>r.no);
  for(const [id,drop] of [['A',['06','07','19','31','37','93']],['C',['06','07','19','26','27','28','29','30']]])for(const n of drop)assert.ok(!nos(id).includes(n),'uncertain program '+id+'/'+n+' is not published');
  assert.ok(!nos('B').some(n=>/Çalışma Modu \/ 6|Akü Ayarları \/ 3$|Jeneratör Arayüzü \/ 1/.test(n)),'uncertain manual B settings are not published');
  assert.ok(!/ÇORBA|cesaret/.test(raw)&&!/"Pin 6 — ÇORBA"/.test(raw),'garbled pinout of manual A is not published');
  const F=id=>U.invFamily(INVD,id),L=(id,q,t)=>U.invFind(F(id),q,t||'').map(r=>r.t+':'+r.m);
  assert.deepEqual(L('akilli-36-72kw','11','fault'),['fault:PV aşırı gerilim'],'manual A fault 11');assert.deepEqual(L('akilli-1-5kva','11','fault'),['fault:Şebeke Röle hatası'],'manual C fault 11 means something else');
  assert.deepEqual(L('mexx-p12kw','103','fault'),['fault:İnverter DC offset çok yüksek'],'Mexx-P 103 as fault');assert.deepEqual(L('mexx-p12kw','103','alarm'),['alarm:Şebeke kullanılamıyor'],'Mexx-P 103 as alarm');
  assert.equal(L('mexx-p12kw','103').length,2,'without a type both rows are returned, never one picked silently');
  for(const q of ['F13','13','f 13','Fault 13','hata kodu 013','F-13'])assert.deepEqual(U.invFind(F('deye-sg05lp1'),q).map(r=>r.c+'|'+r.o),['F13|Working mode change'],'Deye input variant '+q);
  assert.deepEqual(L('deye-sg05lp3','F01'),['fault:DC giriş ters polarite arızası']);assert.deepEqual(U.invFind(F('victron-mppt'),'err 2').map(r=>r.o),['Battery voltage too high']);
  assert.deepEqual(U.invFind(F('axpert-mks'),'11','fault').map(r=>r.o),['Main relay failed']);assert.deepEqual(U.invFind(F('sunon-iv-8kw'),'bP').map(r=>r.t),['warning']);
  assert.deepEqual(U.invFind(F('solis-grid-tied'),'OV-G-V01').map(r=>r.c),['OV-G-V 01 (1010)']);assert.ok(U.invFind(F('solis-grid-tied'),'1010').length>=2,'shared Solis alarm number returns every message');
  assert.deepEqual(U.invFind(F('mexx-p6kw'),'202','fault').map(r=>r.m),['Off-grid çıkışta kısa devre']);
  for(const [id,q] of [['mexx-p4kw','999'],['deye-sg05lp1','F99'],['akilli-1-5kva','13'],['mexx-p12kw',''],['victron-mppt','abc']])assert.equal(U.invFind(F(id),q).length,0,'unknown code returns nothing: '+id+' '+q);
  assert.equal(U.invFind(null,'13').length,0,'no family, no result');assert.ok(INVD.families.every(f=>f.codes.every(r=>U.invFind(f,r.c,r.t).includes(r))),'every published row is reachable by its own code');
  assert.ok(/Bu ailede böyle bir kod yok/.test(ustaSrc)&&/Tahmin yürütülmez/.test(ustaSrc)&&/fetch\("assets\/inverter-veri\.json"\)/.test(ustaSrc)&&!/inverter-veri/.test(pg.replace(/assets\/usta\.js/g,'')),'unknown-code message; data is fetched lazily, not embedded or preloaded');
  const invPages=[...fs.readFileSync(path.join(root,'build.js'),'utf8').match(/const INV_PAGES = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+\.html)"/g)].map(m=>m[1]);assert.equal(invPages.length,9,'inverter page count');
  const seenT=new Set(),txt=x=>x.replace(/<[^>]+>/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
  const pageFams={'mexxsun-inverter-hata-kodlari.html':['mexx-p4kw','mexx-p6kw','mexx-p12kw','sunon-iv-8kw'],'deye-inverter-hata-kodlari.html':['deye-sg05lp1','deye-sg05lp3'],'voltronic-axpert-hata-kodlari.html':['axpert-vm2-pf1','axpert-mks'],
   'victron-mppt-hata-kodlari.html':['victron-mppt'],'solis-inverter-hata-kodlari.html':['solis-grid-tied'],'akilli-inverter-hata-kodlari.html':['akilli-36-72kw','akilli-1-5kva']};
  assert.deepEqual(Object.values(pageFams).flat().sort(),INVD.families.map(f=>f.id).sort(),'every family has exactly one static table page');
  for(const f of invPages){const h=fs.readFileSync(path.join(root,f),'utf8'),url=origin+'/'+f;
   assert.ok(h.includes('USTA:GEN')&&h.includes('<script defer src="assets/usta.js"></script>')&&urls.includes(url)&&h.includes('rel="canonical" href="'+url+'"'),f+': generated, in sitemap, canonical');
   const t=(h.match(/<title>([^<]*)<\/title>/)||[])[1],d=(h.match(/<meta name="description" content="([^"]*)"/)||[])[1],h1=txt((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]);
   assert.ok(t.length<=60&&d.length<=160,f+': title/description length');for(const v of [t,d,h1]){assert.ok(!seenT.has(v),f+': duplicate title/description/H1');seenT.add(v);}
   assert.ok(/<div class="crumbs"><a href="index\.html">Ana Sayfa<\/a> <span>\/<\/span> <a href="elektrikci-cantasi\.html">Elektrikçi Çantası<\/a>/.test(h),f+': breadcrumb through the hub');
   assert.ok(h.indexOf('</h1>')<h.indexOf('<section class="usta-tool"')&&h.indexOf('<section class="usta-tool"')<h.indexOf('<!-- OWN:START -->'),f+': tool first');
   const ids=[...h.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,f+': duplicate element id');for(const m of h.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]),f+': dead anchor #'+m[1]);
   const fq=(h.match(/<button class="faq-q"/g)||[]).length,ld=[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   assert.ok(fq>=3&&fq<=5&&(ld.find(x=>x['@type']==='FAQPage')||{mainEntity:[]}).mainEntity.length===fq&&ld.some(x=>x['@type']==='Article')&&ld.some(x=>x['@type']==='BreadcrumbList'),f+': FAQ + schemas');
   assert.ok(h.includes('Kod anlamı markaya ve modele göre değişir; cihazınızın kendi kılavuzu esastır.')&&h.includes('yetkili servise ya da satıcıya başvurun; cihazın içine yalnız yetkili kişi müdahale eder.'),f+': standing warning and service line');
   assert.ok(!/atakale|<(section|details|div|article|h[1-6]|table|ul)\b[^>]*\shidden/i.test(h),f+': no publisher contact, no hidden content');
   for(const a of h.matchAll(/<a href="(https?:\/\/[^"]+)"([^>]*)>/g))if(INVD.families.some(x=>x.src.url===a[1].replace(/&amp;/g,'&')))assert.ok(/target="_blank"/.test(a[2])&&/rel="nofollow noopener"/.test(a[2]),f+': source link attributes');
   for(const fid of pageFams[f]||[]){const fam=F(fid),sec=(h.split('<h2 id="fam-'+fid+'">')[1]||'').split('</table>')[0];assert.ok(sec,f+': section for '+fid);
    assert.ok(/GESPA bu cihazın üreticisi değildir/.test(sec)&&txt(sec).includes(fam.src.t),f+' '+fid+': not-the-manufacturer line and manual name');
    const rows=[...sec.matchAll(/<tr data-c="([^"]*)" data-t="([^"]*)">([\s\S]*?)<\/tr>/g)];assert.equal(rows.length,fam.codes.length,f+' '+fid+': every code row is rendered statically');
    fam.codes.forEach((r,i)=>{const tx=txt(rows[i][3]);assert.ok(rows[i][2]===r.t&&tx.includes(r.m)&&tx.includes(r.p)&&(!r.o||tx.includes(r.o))&&(!r.u||tx.includes('kılavuzda belirsiz')),f+' '+fid+' '+r.c+': static row matches the data');});}
   if(pageFams[f])for(const q of [...h.matchAll(/<button class="faq-q"><span>([^<]*)<\/span>[\s\S]*?<div class="faq-a"><p>([\s\S]*?)<\/p>/g)])if(/kodu ne demek|hatası ne demek/.test(q[1]))assert.ok(/kılavuz/.test(q[2])&&pageFams[f].some(id=>txt(q[2]).includes(F(id).name.split(' (')[0])||txt(q[2]).includes('MEXX-P12KW')),f+': code FAQ names the family: '+q[1]);
   for(const d2 of ['en','de','ru'])assert.ok(!fs.existsSync(path.join(root,d2,f)),d2+'/'+f+': TR-only');
   assert.ok(pg.includes('href="'+f+'"'),f+': linked from the hub');}
  for(const f of ['off-grid-inverter-lityum-aku-ayarlari.html','off-grid-inverter-sebeke-ayarlari.html']){const h=fs.readFileSync(path.join(root,f),'utf8');
   assert.ok(h.includes('akü üreticisinin değeri esastır')&&['A','B','C'].every(id=>h.includes(INVD.settings.find(x=>x.id===id).src.t.replace(/&/g,'&amp;')))&&!/ÇORBA|cesaret/.test(h),f+': battery-maker note, three manuals named, no uncertain pinout');}
  {const h=fs.readFileSync(path.join(root,'off-grid-inverter-sebeke-ayarlari.html'),'utf8');for(const m of INVD.settings)assert.equal(((h.split('<h2 id="prog-'+m.id.toLowerCase()+'">')[1]||'').split('</table>')[0].match(/<tr data-no=/g)||[]).length,m.programs.length,'program table '+m.id+' rendered in full');}
  assert.ok(/gespa-inv-family/.test(fs.readFileSync(path.join(root,'cerez-politikasi.html'),'utf8'))&&/gespa-usta-last/.test(fs.readFileSync(path.join(root,'cerez-politikasi.html'),'utf8')),'browser storage keys are listed in the cookie policy');
  globalThis.__invPages=invPages;}
 // Pocket card and installer sign-up (generated; numbers come from GESPA.usta.examples, the form posts to /api/lead with source "usta").
 {const extra=[...fs.readFileSync(path.join(root,'build.js'),'utf8').match(/const USTA_EXTRA = \[([^\]]*)\]/)[1].matchAll(/"([^"]+\.html)"/g)].map(m=>m[1]);assert.deepEqual(extra,['usta-cep-karti.html','usta-kaydi.html']);globalThis.__ustaExtra=extra;
  const kc=fs.readFileSync(path.join(root,'usta-cep-karti.html'),'utf8'),uk=fs.readFileSync(path.join(root,'usta-kaydi.html'),'utf8'),seen=new Set();
  for(const [f,h] of [['usta-cep-karti.html',kc],['usta-kaydi.html',uk]]){const url=origin+'/'+f;
   assert.ok(h.includes('USTA:GEN')&&urls.includes(url)&&h.includes('rel="canonical" href="'+url+'"')&&h.includes('<script defer src="assets/usta.js"></script>'),f+': generated, in sitemap, canonical');
   const t=(h.match(/<title>([^<]*)<\/title>/)||[])[1],d=(h.match(/<meta name="description" content="([^"]*)"/)||[])[1];assert.ok(t.length<=60&&d.length<=160&&!seen.has(t),f+': title/description');seen.add(t);
   assert.ok(/<a href="elektrikci-cantasi\.html">Elektrikçi Çantası<\/a> <span>\/<\/span>/.test(h)&&pg.includes('href="'+f+'"'),f+': breadcrumb through the hub and linked from it');
   const tx=h.replace(/<[^>]+>/g,' ');assert.ok(!/%\s?\d+\s*(?:'?e varan\s*)?indirim|indirim oran|bayilik garanti|garantili (?:fiyat|kazanç)|\d[\d.]*\s*(?:usta|elektrikçi|montajcı|üye)\s*(?:kayıtlı|kullanıyor|aramızda)|\d+\s*saat içinde ar|aynı gün ar|en ucuz|en düşük fiyat garanti/i.test(tx),f+': no invented discounts, guarantees, member counts or response-time promises');
   const fq=(h.match(/<button class="faq-q"/g)||[]).length,ld=[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   assert.ok(fq===3&&(ld.find(x=>x['@type']==='FAQPage')||{mainEntity:[]}).mainEntity.length===3&&ld.some(x=>x['@type']==='BreadcrumbList'),f+': FAQ + schemas');
   for(const d2 of ['en','de','ru'])assert.ok(!fs.existsSync(path.join(root,d2,f)),d2+'/'+f+': TR-only');}
  const tg=[...kc.matchAll(/<data data-ex="([^"]+)" value="([^"]*)">([^<]*)<\/data>/g)];assert.equal(tg.length,(kc.match(/data-ex=/g)||[]).length,'card: example tag form');assert.ok(tg.length>=250,'card carries the worked examples');
  for(const m of tg){assert.ok(m[1] in EX,'card: unknown example key '+m[1]);assert.equal(m[3],EX[m[1]],'card number '+m[1]+' matches GESPA.usta.examples');}
  const formulas=[...pg.matchAll(/<p class="usta-formula"><strong>Formül:<\/strong> ([\s\S]*?)<\/p>/g)].map(m=>m[1]),cardF=[...kc.matchAll(/<p class="kc-ff">([\s\S]*?)<\/p>/g)].map(m=>m[1]);
  assert.equal(cardF.length,formulas.length,'card lists every tool formula');for(const x of formulas)assert.ok(cardF.includes(x),'card formula is the tool formula verbatim: '+x.slice(0,50));
  assert.equal((kc.match(/<div class="kc-page"/g)||[]).length,2,'two sheets (front, back)');assert.equal((kc.match(/class="kc-box"/g)||[]).length,(pg.match(/data-chk="/g)||[]).length,'card checklist = tool checklist');
  for(const id of ['kcSeri','kcPar','kcB0','kcB1','kcBP','ugSvg'])assert.ok(kc.includes('id="'+id+'"'),'card diagram slot '+id);
  assert.ok((kc.match(/tanımdan hesaplanmıştır/g)||[]).length>=3&&/Değerler yaklaşıktır; tasarım ve kurulum yetkili kişi tarafından yapılır/.test(kc)&&/Üretim: <time datetime="\d{4}-\d\d-\d\d">/.test(kc)&&/data-usta-print/.test(kc),'card: computed-table labels, safety footer, generation date, print button');
  assert.ok(!/<form|type="email"|e-posta adresiniz/i.test((kc.split('<main')[1]||'').split('</main>')[0])&&!/https?:\/\/(?!www\.gespaenerji\.com|wa\.me)/.test((kc.split('<main')[1]||'').split('</main>')[0]),'card: no gate, no external assets');
  const css=fs.readFileSync(path.join(root,'assets/style.css'),'utf8');assert.ok(/@page kc\{size:A4 portrait/.test(css)&&/\.kc-page\{page:kc;[^}]*break-after:page/.test(css),'card print rules: A4, one sheet per page');
  for(const n of ['ad','tel','ilce','meslek','firma','ilgi','not','website','kvkkOnay'])assert.ok(new RegExp('name="'+n+'"').test(uk),'sign-up field '+n);
  assert.equal((uk.match(/name="ilgi"/g)||[]).length,6,'six product interests');assert.equal((uk.match(/<option value="/g)||[]).length,5,'five professions');
  assert.ok(uk.includes('<a href="/kvkk.html" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>')&&/toplu alım fiyat listesi ve stok bilgisi için sizi arayalım/.test(uk)&&uk.includes('href="usta-cep-karti.html"'),'sign-up: consent line, the only promise, link to the card');
  const srv=fs.readFileSync(path.join(root,'server.js'),'utf8');for(const k of [...uk.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]).concat([...uk.matchAll(/name="ilgi" value="([^"]+)"/g)].map(m=>m[1])))assert.ok(new RegExp('"'+k+'": "').test(srv),'server accepts form value '+k);
  assert.ok(/kaynak: "usta"/.test(ustaSrc)&&/usta_open/.test(ustaSrc)&&/usta_open\)\$/.test(srv)&&/usta_open/.test(fs.readFileSync(path.join(root,'admin.html'),'utf8')),'form posts as source usta; usta_open is tracked, whitelisted and shown in admin');
  assert.equal((pg.match(/<a class="usta-link" href="usta-kaydi\.html">/g)||[]).length,toolIds.length,'every tool line links to the sign-up page');}
 // Per-tool landing pages (tools/usta-sayfalar.py): same cards and usta.js as the hub, own title/description/H1/text/FAQ, examples tied to GESPA.usta.
 const ustaPages=[...fs.readFileSync(path.join(root,'build.js'),'utf8').match(/const USTA_PAGES = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+\.html)"/g)].map(m=>m[1]);
 assert.equal(ustaPages.length,20,'landing page count');
 {const seen={title:new Set(),desc:new Set(),h1:new Set()},txt=x=>x.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  for(const f of ustaPages){const h=fs.readFileSync(path.join(root,f),'utf8'),url=origin+'/'+f;
   assert.ok(h.includes('USTA:GEN')&&h.includes('<script defer src="assets/usta.js"></script>')&&/<main id="main" data-article data-usta[ >]/.test(h),f+': generated shell');
   assert.ok(urls.includes(url)&&h.includes('rel="canonical" href="'+url+'"'),f+': in sitemap, canonical to itself');
   const t=(h.match(/<title>([^<]*)<\/title>/)||[])[1],d=(h.match(/<meta name="description" content="([^"]*)"/)||[])[1],h1=txt((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]);
   assert.ok(t&&t.length<=60&&d&&d.length<=160,f+': title/description length');
   for(const [key,v] of [['title',t],['desc',d],['h1',h1]]){assert.ok(!seen[key].has(v),f+': duplicate '+key);seen[key].add(v);}
   assert.ok(t!==(pg.match(/<title>([^<]*)<\/title>/)||[])[1],f+': title differs from hub');
   assert.ok(/<div class="crumbs"><a href="index\.html">Ana Sayfa<\/a> <span>\/<\/span> <a href="elektrikci-cantasi\.html">Elektrikçi Çantası<\/a> <span>\/<\/span> [^<]+<\/div>/.test(h),f+': breadcrumb');
   const secs=[...h.matchAll(/<section class="usta-tool" id="([^"]+)" data-usta-tool="([^"]+)"/g)];assert.ok(secs.length>=1,f+': carries at least one tool card');
   assert.ok(h.indexOf('</h1>')<h.indexOf('<section class="usta-tool"')&&h.indexOf('<section class="usta-tool"')<h.indexOf('<!-- OWN:START -->')&&!h.includes('data-usta-app'),f+': tool first, own text below, no app shell');
   assert.ok(/<nav class="usta-strip"[^>]*>[\s\S]*?href="elektrikci-cantasi\.html#[a-z0-9-]+"[\s\S]*?<\/nav>/.test(h)&&!/<(section|details|div|article|h[1-6]|table|ul)\b[^>]*\shidden/.test(h),f+': other-tools strip into the hub app; no hidden content');
   for(const m of secs)assert.ok(toolIds.includes(m[2]),f+': card '+m[1]+' belongs to a hub tool');
   const ids=[...h.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,f+': duplicate element id '+ids.filter((x,i)=>ids.indexOf(x)!==i)[0]);
   for(const m of h.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(m[1]),f+': dead in-page anchor #'+m[1]);
   const tg=[...h.matchAll(/<data data-ex="([^"]+)" value="([^"]*)">([^<]*)<\/data>/g)];assert.equal(tg.length,(h.match(/data-ex=/g)||[]).length,f+': example tag form');assert.ok(tg.length>=8,f+': worked example present');
   for(const m of tg){assert.ok(m[1] in EX,f+': unknown example key '+m[1]);assert.equal(m[3],EX[m[1]],f+': static example '+m[1]+' matches the calculator');}
   const own=[...h.matchAll(/<!-- OWN:START -->([\s\S]*?)<!-- OWN:END -->/g)].map(m=>txt(m[1])).join(' '),nw=(own.match(/[\p{L}\p{N}]+/gu)||[]).length;
   assert.ok(nw>=250,f+': own text too thin ('+nw+' words)');
   const fq=(h.match(/<button class="faq-q"/g)||[]).length;assert.ok(fq>=3&&fq<=5,f+': 3-5 FAQ items');
   const ld=[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
   assert.equal((ld.find(x=>x['@type']==='FAQPage')||{mainEntity:[]}).mainEntity.length,fq,f+': FAQPage = visible questions');
   const bc=ld.find(x=>x['@type']==='BreadcrumbList');assert.ok(bc&&bc.itemListElement.length===3&&bc.itemListElement[1].item===origin+'/elektrikci-cantasi.html',f+': BreadcrumbList via the hub');
   assert.ok(ld.some(x=>x['@type']==='Article'),f+': Article schema');
   assert.ok((h.match(/Değerler yaklaşıktır; kurulum ve nihai tasarım yetkili/g)||[]).length===secs.length&&h.includes('class="usta-formula"'),f+': formula + approximate-values line per card');
   assert.ok(!/ampasite|TS HD|IEC 6\d{4}|NEC \d|izin verilen (en yüksek )?gerilim düşümü\s*(sınırı\s*)?%\s*\d/i.test(h),f+': no standards citations');
   assert.ok(pg.includes('href="'+f+'"'),f+': linked from the hub');
   for(const d of ['en','de','ru'])assert.ok(!fs.existsSync(path.join(root,d,f)),d+'/'+f+': TR-only');}
  for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.html')&&f!=='elektrikci-cantasi.html'&&!ustaPages.includes(f)&&!globalThis.__invPages.includes(f)&&!globalThis.__ustaExtra.includes(f)))assert.ok(!fs.readFileSync(path.join(root,f),'utf8').includes('assets/usta.js'),f+': usta.js is loaded only by the tool pages');}
 for(const d of ['en','de','ru'])assert.ok(!fs.readFileSync(path.join(root,d,'hesaplayici.html'),'utf8').includes('elektrikci-cantasi')&&!fs.existsSync(path.join(root,d,'elektrikci-cantasi.html')),d+': TR-only tool page not linked or generated');
 assert.ok(fs.readFileSync(path.join(root,'hesaplayici.html'),'utf8').includes('<a href="elektrikci-cantasi.html">')&&fs.readFileSync(path.join(root,'rehberler.html'),'utf8').includes('href="elektrikci-cantasi.html"')&&/<section class="section" id="rehberler">[\s\S]*?href="elektrikci-cantasi\.html"[\s\S]*?<\/section>\s*<!-- \/TR:ONLY -->/.test(fs.readFileSync(path.join(root,'index.html'),'utf8')),'tool page linked from calculator, guide hub and home (TR only)');
 {const fq=[...pg.matchAll(/<button class="faq-q"/g)].length;assert.ok(fq>=12&&fq<=14,'FAQ size');}
 const lds=[...pg.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 for(const t of ['Article','FAQPage','BreadcrumbList'])assert.ok(lds.some(x=>x['@type']===t),'elektrikci-cantasi: '+t+' schema');
 {const t=(pg.match(/<title>([^<]*)<\/title>/)||[])[1],d=(pg.match(/<meta name="description" content="([^"]*)"/)||[])[1];assert.ok(t.length<=60&&d.length<=160,'title/description length');}}
// The production server runs in this process tree so HTTP tests share its network context.
const RECEIPT_TEST_SECRET='test-dekont-anahtari';
// ADMIN_PASS is set as on Railway: the public config password must then be rejected. Runtime data goes to
// a temporary folder so test questions never appear on a locally served page.
// Shipping: one rule (config.js shipCalc) for cart, server and build. Every sold product has a class; the business rules hold.
{const sbk={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sbk);const C=sbk.window.GESPA.config,S=C.commerce.shipping,calc=C.shipCalc;
 assert.equal(typeof calc,'function','shipCalc rides on the config object');assert.ok(!Object.keys(C).includes('shipCalc'),'shipCalc is not enumerable');
 for(const p of C.packages)assert.ok(p.freeShipping||S.classes[p.ship],p.id+': shipping class missing');
 const one=(id,q,o)=>calc([{id,qty:q}],o||{});
 assert.deepEqual([1,2,3,4].map(q=>one('panel-700w',q).total),[700,1000,1700,2000],'large panels ship in pairs');
 assert.deepEqual([1,2,3,4].map(q=>one('panel-240w',q).total),[500,750,1250,1500],'small panels ship in pairs');
 assert.equal(one('lexron-mppt-40a',1).total,250);assert.equal(one('aku-lifepo4-72v',1).total,500);assert.equal(one('kit-285w',1).total,1200);
 assert.equal(one('hero-led-ampul-10w',5).total,250,'1-5 small items share one fee');assert.equal(one('hero-led-ampul-10w',6).total,500);
 const two=calc([{id:'panel-700w',qty:1},{id:'lexron-mppt-40a',qty:1}],{listTL:12000});assert.equal(two.base,950);assert.equal(two.total,760,'20% off shipping with two different products');
 assert.equal(one('panel-700w',1,{pickup:true}).total,0,'pick-up has no shipping');assert.equal(one('panel-700w',1,{pickup:true}).free,'pickup');
 assert.equal(one('panel-700w',6,{listTL:S.freeOverTL}).free,'esik','free shipping from the threshold');assert.equal(one('panel-700w',6,{listTL:S.freeOverTL-1}).total,3000);
 assert.equal(one('boost-mppt',1).free,'dahil','freeShipping products stay free');
 // static output carries the same numbers
 const p700=fs.readFileSync(path.join(root,'panel-700w.html'),'utf8');assert.ok(/data-pkg-shiprow[^>]*>🚚 <span>Kargo<\/span>: <b>₺700<\/b> · <span>2 adet<\/span>: <b>₺1\.000<\/b> · <span>Ürün \+ kargo<\/span>/.test(p700),'product page shows product + shipping');
 assert.ok(/"shippingRate":\{"@type":"MonetaryAmount","value":700,"currency":"TRY"\}/.test(p700.replace(/\s+/g,'')),'Product schema carries the shipping fee');
 assert.ok(/<g:id>panel-700w<\/g:id>[\s\S]*?<g:price>700\.00 TRY<\/g:price>/.test(fs.readFileSync(path.join(root,'urunler.xml'),'utf8')),'feed carries the shipping fee');
 const cartPage=fs.readFileSync(path.join(root,'sepet.html'),'utf8');assert.ok(/name="teslim" value="isyeri"/.test(cartPage)&&!/kargoOnay/.test(cartPage),'cart offers pick-up; pay-on-delivery checkbox is gone');
 for(const f of ['sepet.html','iade-teslimat.html','sss.html','llms-full.txt'])assert.ok(!/alıcı ödemeli|teslim alırken kargo firmasına öde/.test(fs.readFileSync(path.join(root,f),'utf8')),f+': old pay-on-delivery wording remains');}
// The old password was public (config.js + public repo). It must be gone from the config and rejected.
const LEAKED_PASS='gespa2026';
{const vm=require('node:vm');const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),c);const C=c.window.GESPA.config;assert.ok(!(C.admin&&C.admin.pass),'config.js carries no admin password');}
assert.ok(!fs.readFileSync(path.join(root,'assets/config.js'),'utf8').includes(LEAKED_PASS),'leaked password removed from config.js');
const ADMIN_TEST_PASS='test-yonetici-sifresi',TEST_DATA=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'gespa-test-'));
// Gespa OS summary: a stored order carries buyer PII; the summary must expose the order but never the buyer.
const OS_TEST_TOKEN='os-test-belirteci-0123456789abcdefghij';
fs.writeFileSync(path.join(TEST_DATA,'orders.json'),JSON.stringify({tok1:{conversationId:'GSP-TEST-1',status:'paid',createdAt:new Date().toISOString(),totalTL:1234,items:[{id:'boost-mppt',qty:2,unitTL:7200}],buyer:{ad:'Ayşe Gizli',tel:'05551112233',eposta:'ayse@example.com',tckn:'12345678901',il:'Antalya',adres:'Gizli Sok. 1'}}}));
// Fake Gespa OS ledger: rejects the first delivery (retry path), accepts the rest.
const INGEST_TOKEN='ingest-test-belirteci-0123456789abcdefgh',ingestHits=[];
const ingest=require('node:http').createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{ingestHits.push({token:q.headers['x-ingest-token'],path:q.url,body:b});r.writeHead(ingestHits.length===1?500:200,{'Content-Type':'application/json'});r.end('{"ok":true}');});});
ingest.listen(4318,'127.0.0.1');
// Fake Claude API for the site assistant (/api/chat): the SDK is pointed at it with ANTHROPIC_BASE_URL.
// It records the request so the test can check model, caching, grounding and that no secret leaks to the browser.
const aiCalls=[];const aiFake=require('node:http').createServer((q,r)=>{let d='';q.on('data',c=>d+=c);q.on('end',()=>{let j={};try{j=JSON.parse(d)}catch(e){}
 aiCalls.push({url:q.url,key:String(q.headers['x-api-key']||q.headers.authorization||''),beta:q.headers['anthropic-beta'],body:j});
 r.writeHead(200,{'content-type':'application/json'});
 r.end(JSON.stringify({id:'msg_test',type:'message',role:'assistant',model:j.model,stop_reason:'end_turn',stop_sequence:null,
  content:[{type:'thinking',thinking:'',signature:'x'},{type:'text',text:'360 W panel 7.200 TL. Sayfa: https://www.gespaenerji.com/panel-360w.html'}],
  usage:{input_tokens:10,output_tokens:10,cache_creation_input_tokens:0,cache_read_input_tokens:0}}));});}).listen(4319,'127.0.0.1');
const port=4317,server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),ANTHROPIC_API_KEY:'sk-ant-test-gizli',ANTHROPIC_BASE_URL:'http://127.0.0.1:4319',CHAT_DAILY_MAX:'3',IYZIPAY_API_KEY:'',IYZICO_API_KEY:'',IYZIPAY_SECRET_KEY:RECEIPT_TEST_SECRET,FX_AUTO:'0',ADMIN_PASS:ADMIN_TEST_PASS,DATA_DIR:TEST_DATA,OS_TOKEN:OS_TEST_TOKEN,OS_INGEST_URL:'http://127.0.0.1:4318',OS_INGEST_TOKEN:INGEST_TOKEN,OS_SYNC_EVERY_MS:'400'}});
let logs='',started=false;
// Sunucu dinlemeden önce build çalıştırır; 238 sayfada bu ~25 s sürüyor (railway.json healthcheckTimeout 300 s).
const timeout=setTimeout(()=>{server.kill();console.error(logs);process.exitCode=1;},90000);
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
  // Gespa OS order ledger: the stored order is delivered without PII, retried after a 500, then marked sent.
  {for(let i=0;i<40&&ingestHits.length<2;i++)await new Promise(r=>setTimeout(r,250));
   assert.ok(ingestHits.length>=2,'ledger retried after a failed delivery ('+ingestHits.length+' hits)');
   const h=ingestHits[ingestHits.length-1];assert.equal(h.path,'/api/ingest/orders');assert.equal(h.token,INGEST_TOKEN);
   const j=JSON.parse(h.body);assert.equal(j.site,'gespaenerji');assert.equal(j.orders.length,1);
   assert.equal(j.orders[0].ref,'GSP-TEST-1');assert.equal(j.orders[0].status,'paid');assert.deepEqual(j.orders[0].items.map(x=>[x.id,x.qty]),[['boost-mppt',2]]);
   for(const leak of ['Ayşe Gizli','05551112233','ayse@example.com','12345678901','Gizli Sok','Antalya','buyer'])assert.ok(!h.body.includes(leak),'ledger leaks '+leak);
   for(let i=0;i<20;i++){const o=JSON.parse(fs.readFileSync(path.join(TEST_DATA,'orders.json'),'utf8')).tok1;if(o.osSent)break;await new Promise(r=>setTimeout(r,100));}
   assert.equal(JSON.parse(fs.readFileSync(path.join(TEST_DATA,'orders.json'),'utf8')).tok1.osSent,'paid|0','delivered order marked');
   const n=ingestHits.length;await new Promise(r=>setTimeout(r,900));assert.equal(ingestHits.length,n,'no resend once marked');
   ingest.close();}
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
  if(vis.day===null)assert.ok(Number.isFinite(vis.recent)&&vis.recentHours>=1&&vis.recentHours<=24,'visitors api: partial window states its hours');
  const ex403=await fetch('http://127.0.0.1:'+port+'/api/visitors/export',{method:'POST',body:JSON.stringify({pass:'yanlis'})});assert.equal(ex403.status,403);await ex403.text();
  const ex=await fetch('http://127.0.0.1:'+port+'/api/visitors/export',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})});
  assert.equal(ex.status,200);const exj=await ex.json();assert.ok(exj.total===vis.total&&exj.hours&&exj.hoursSince>0,'visitors export for redeploy handoff');
  // Anonymous product-interest / traffic counters: /api/ev (public, bots and bad ids ignored) -> /api/stats (admin).
  const EV_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/604.1',evPost=async(o,ua)=>{const r=await fetch('http://127.0.0.1:'+port+'/api/ev',{method:'POST',headers:{'User-Agent':ua||EV_UA,'Content-Type':'text/plain'},body:JSON.stringify(o)});assert.equal(r.status,204,'event accepted');await r.text();};
  await evPost({t:'pv',path:'/index.html',s:1,ref:'www.google.com'});
  await evPost({t:'pv',path:'/en/paket-285w.html'});
  await evPost({t:'view',id:'kit-285w'});
  await evPost({t:'cart',id:'kit-285w'});
  await evPost({t:'view',id:'bu-urun-yok'});                       // unknown product id
  await evPost({t:'pv',path:'/../server.js',s:1});                 // not a public page
  await evPost({t:'view',id:'kit-285w'},'curl/8.0');               // bot user agent
  const st403=await fetch('http://127.0.0.1:'+port+'/api/stats',{method:'POST',body:JSON.stringify({pass:'yanlis'})});assert.equal(st403.status,403);await st403.text();
  const stj=await (await fetch('http://127.0.0.1:'+port+'/api/stats',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();
  const stDay=stj.days[stj.today];
  assert.ok(stDay&&stDay.v===1&&stDay.src['Google']===1&&stDay.dev['Telefon']===1,'stats: one visit, source Google, device phone');
  assert.equal(stDay.pv['/index.html'],1,'stats: page views');assert.equal(stDay.pv['/paket-285w.html'],1,'stats: language copy counts as the same page');
  assert.equal(stDay.view['kit-285w'],1,'stats: product view (bot ignored)');assert.equal(stDay.cart['kit-285w'],1,'stats: add to cart');
  assert.ok(!stDay.view['bu-urun-yok']&&!Object.keys(stDay.pv).some(k=>/server/.test(k)),'stats: unknown ids and non-public paths rejected');
  const ex2=await (await fetch('http://127.0.0.1:'+port+'/api/visitors/export',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();
  // Sales assistant: grounded in llms-full.txt, key never reaches the browser, phone numbers become leads,
  // daily cap falls back to the keyword bot, leads/chats are admin-only.
  const B='http://127.0.0.1:'+port,UA={'User-Agent':EV_UA,'Content-Type':'application/json'};
  assert.equal((await (await fetch(B+'/api/chat')).json()).enabled,true,'assistant enabled when the key is set');
  // KVKK: nothing reaches the provider until the visitor agrees in the widget (ok:true)
  const noOk=await fetch(B+'/api/chat',{method:'POST',headers:UA,body:JSON.stringify({messages:[{role:'user',content:'360 watt panel kaç lira?'}],sid:'testsid0'})});
  assert.equal(noOk.status,403);assert.equal((await noOk.json()).consent,true,'chat needs consent');assert.equal(aiCalls.length,0,'no provider call without consent');
  const c1=await fetch(B+'/api/chat',{method:'POST',headers:UA,body:JSON.stringify({ok:true,messages:[{role:'user',content:'360 watt panel kaç lira?'}],lang:'tr',page:'/panel-360w.html',sid:'testsid1'})});
  const c1j=await c1.json();assert.equal(c1.status,200);assert.ok(/7\.200/.test(c1j.reply)&&!c1j.lead,'assistant reply');
  const call=aiCalls[0];assert.ok(call.key.includes('sk-ant-test-gizli'),'server sends the key');assert.ok(!JSON.stringify(c1j).includes('sk-ant'),'key not in browser reply');
  assert.equal(call.body.model,'claude-opus-5-5');assert.equal(call.body.fallbacks,'default');assert.ok(/server-side-fallback-2026-07-01/.test(call.beta||''),'refusal fallback beta');
  assert.equal(call.body.output_config.effort,'low');assert.ok(!('thinking' in call.body)&&!('temperature' in call.body),'no removed params');
  const sys=call.body.system;assert.ok(Array.isArray(sys)&&sys.length===1&&sys[0].cache_control&&sys[0].cache_control.type==='ephemeral','one cached system block');
  assert.ok(sys[0].text.includes('360 W Güneş Paneli')&&sys[0].text.includes(fs.readFileSync(path.join(root,'llms-full.txt'),'utf8').slice(0,200)),'grounded in llms-full.txt');
  assert.ok(!/\d{4}-\d{2}-\d{2}T|Date\.now/.test(sys[0].text.slice(0,3000)),'no volatile text at the head of the cached prefix');
  assert.ok(call.body.messages[call.body.messages.length-1].content.includes('/panel-360w.html'),'page context rides in the user turn');
  const c2=await (await fetch(B+'/api/chat',{method:'POST',headers:UA,body:JSON.stringify({messages:[{role:'user',content:'360 watt panel kaç lira?'},{role:'assistant',content:c1j.reply},{role:'user',content:'Beni arayın 0532 111 22 33, e-posta ali@ornek.com, TC 12345678901'}],lang:'tr',page:'/panel-360w.html',sid:'testsid1',ok:true})})).json();
  assert.equal(c2.lead,true,'phone number in chat becomes a lead');
  // KVKK: phone, e-mail and long numbers are masked before the text leaves for the provider; no IP or session id is sent
  const sent=JSON.stringify(aiCalls[1].body.messages);
  assert.ok(!/0532|111 22 33|ali@ornek|12345678901|testsid1/.test(sent),'personal data masked before leaving');
  assert.ok(sent.includes('[telefon numarası gizlendi]')&&sent.includes('[e-posta gizlendi]')&&sent.includes('[numara gizlendi]'),'placeholders tell the model what was hidden');
  assert.ok(sent.includes('360 watt panel')&&sent.includes('7.200'),'prices and product text are not masked');
  assert.ok(!('metadata' in aiCalls[1].body),'no visitor identifier is attached to the provider request');
  const botChat=await fetch(B+'/api/chat',{method:'POST',headers:{'User-Agent':'curl/8','Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'x'}]})});assert.equal(botChat.status,403);await botChat.text();
  await (await fetch(B+'/api/chat',{method:'POST',headers:UA,body:JSON.stringify({ok:true,messages:[{role:'user',content:'merhaba'}],sid:'testsid2'})})).text();
  const capped=await fetch(B+'/api/chat',{method:'POST',headers:UA,body:JSON.stringify({ok:true,messages:[{role:'user',content:'bir daha'}],sid:'testsid2'})});
  assert.equal(capped.status,429,'daily cap');assert.equal((await capped.json()).fallback,true,'cap tells the widget to fall back');
  const cb=await fetch(B+'/api/lead',{method:'POST',headers:UA,body:JSON.stringify({kaynak:'geri-arama',tel:'0533 444 55 66',urun:'panel-360w',path:'/panel-360w.html',ms:5000})});assert.equal(cb.status,200,'callback lead needs only a phone');await cb.text();
  const cbBad=await fetch(B+'/api/lead',{method:'POST',headers:UA,body:JSON.stringify({kaynak:'geri-arama',tel:'123',ms:5000})});assert.equal(cbBad.status,400);await cbBad.text();
  const calcBad=await fetch(B+'/api/lead',{method:'POST',headers:UA,body:JSON.stringify({tel:'0533 444 55 66',ms:5000})});assert.equal(calcBad.status,400,'calculator lead still needs a name');await calcBad.text();
  for(const u of ['/api/leads','/api/chats','/api/handoff/export']){const r=await fetch(B+u,{method:'POST',body:JSON.stringify({pass:'yanlis'})});assert.equal(r.status,403,u+' is admin-only');await r.text();}
  const lj=await (await fetch(B+'/api/leads',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();
  assert.equal(lj.leads.length,2);assert.equal(lj.leads[0].src,'Beni arayın');assert.equal(lj.leads[0].urun,'360 W Güneş Paneli');assert.equal(lj.leads[0].wa,'905334445566');
  assert.equal(lj.leads[1].src,'Site asistanı');assert.ok(/05321112233/.test(lj.leads[1].tel)&&/360 watt panel/.test(lj.leads[1].not),'chat lead carries the conversation');
  assert.ok(!/0532|ali@ornek|12345678901/.test(lj.leads[1].not),'the lead note keeps the number only in its own field');
  const dn=await (await fetch(B+'/api/leads',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS,done:lj.leads[0].at})})).json();assert.equal(dn.leads[0].done,true,'mark lead as called');
  const cj=await (await fetch(B+'/api/chats',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();
  assert.ok(cj.enabled&&cj.chats.some(c=>c.sid==='testsid1'&&c.lead&&c.msgs.length===4),'conversation log');
  const t1=cj.chats.filter(c=>c.sid==='testsid1')[0];assert.ok(t1.riza&&!/0532|ali@ornek|12345678901/.test(JSON.stringify(t1.msgs)),'stored transcript is masked and records the consent time');
  const stj2=await (await fetch(B+'/api/stats',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();
  assert.ok(stj2.days[stj2.today].act.lead===2&&stj2.days[stj2.today].act.chat_msg===3,'funnel counters');
  // Installer sign-up (usta-kaydi.html): name + phone required, extra fields come only from the server's lists.
  {const H={...UA,'X-Forwarded-For':'203.0.113.77'},post=b=>fetch(B+'/api/lead',{method:'POST',headers:H,body:JSON.stringify(b)});
   const noName=await post({kaynak:'usta',tel:'0532 111 22 33',ms:5000});assert.equal(noName.status,400,'usta lead needs a name');await noName.text();
   const badTel=await post({kaynak:'usta',ad:'Ali Usta',tel:'12345',ms:5000});assert.equal(badTel.status,400,'usta lead rejects a bad phone');await badTel.text();
   const fast=await post({kaynak:'usta',ad:'Ali Usta',tel:'0532 111 22 33',ms:500});assert.equal(fast.status,400,'three-second rule still applies');await fast.text();
   const bot=await post({kaynak:'usta',ad:'Bot',tel:'0532 111 22 33',website:'http://spam',ms:5000});assert.equal(bot.status,200);await bot.text();
   const ok=await post({kaynak:'usta',ad:'Ali  Usta',tel:'0532 111 22 33',ilce:'Antalya / Manavgat',meslek:'montajci',firma:'Örnek Elektrik\nLtd',ilgi:['panel','aku','<script>','panel','sarj-kontrol'],not:'Aylık 20 panel',path:'/usta-kaydi.html',ms:5000,ekstra:'x'});assert.equal(ok.status,200,'usta lead accepted');await ok.text();
   const lu=(await (await fetch(B+'/api/leads',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json()).leads;assert.equal(lu.length,3,'honeypot submission is not stored; the real one is');
   const u=lu[0];assert.equal(u.src,'Usta / toplu alım');assert.equal(u.ad,'Ali Usta');assert.equal(u.meslek,'Güneş enerjisi montajcısı');assert.equal(u.firma,'Örnek Elektrik Ltd');
   assert.deepEqual(u.ilgi,['Panel','Akü','Şarj kontrol'],'interests: listed values only, no duplicates');assert.equal(u.ilce,'Antalya / Manavgat');assert.equal(u.wa,'905321112233');assert.ok(!('ekstra' in u)&&u.not==='Aylık 20 panel','no unlisted field is stored');
   const ev=await fetch(B+'/api/ev',{method:'POST',headers:UA,body:JSON.stringify({t:'act',id:'usta_open'})});await ev.text();
   const st=await (await fetch(B+'/api/stats',{method:'POST',body:JSON.stringify({pass:ADMIN_TEST_PASS})})).json();assert.ok(Object.values(st.days).some(d=>d.act&&d.act.usta_open>=1),'usta_open act event is counted');}
  for(const u of ['/data/leads.json','/data/chats.json'])assert.equal((await fetch(B+u)).status,404,u+' not public');
  assert.ok(ex2.stats&&ex2.stats.days[stj.today]&&ex2.stats.days[stj.today].v===1,'stats travel with the visitor counter on redeploy handoff');
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
 }catch(e){console.error(e);process.exitCode=1;}finally{clearTimeout(timeout);await new Promise(r=>{const t=setTimeout(r,4000);server.once('exit',()=>{clearTimeout(t);r();});server.kill();});aiFake.close();fs.rmSync(TEST_DATA,{recursive:true,force:true});}
});
server.on('error',e=>{clearTimeout(timeout);console.error(e);process.exitCode=1;});
