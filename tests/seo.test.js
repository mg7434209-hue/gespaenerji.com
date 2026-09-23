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
 if(h.includes('<!-- /SISTER:STATIC -->'))assert.ok(/<!-- HELP:STATIC --><a href="sss.html">[^<]+<\/a><a href="sozluk.html">[^<]+<\/a><!-- \/HELP:STATIC -->/.test(h),f+': footer help links');
}
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
const port=4317,server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port)}});
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
  // AI crawler counter: a GPTBot request is counted and readable with the admin password only.
  const ua=await fetch('http://127.0.0.1:'+port+'/llms.txt',{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)'}});assert.equal(ua.status,200);await ua.text();
  const bad=await fetch('http://127.0.0.1:'+port+'/api/aibots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pass:'yanlis'})});assert.equal(bad.status,403);await bad.text();
  const cfgSrc=fs.readFileSync(path.join(root,'assets/config.js'),'utf8');const sb={window:{}};vm.runInNewContext(cfgSrc,sb);
  const ok=await fetch('http://127.0.0.1:'+port+'/api/aibots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pass:sb.window.GESPA.config.admin.pass})});
  assert.equal(ok.status,200);const bots=(await ok.json()).bots;const gpt=bots.find(b=>b.name==='GPTBot');
  assert.ok(gpt&&gpt.kind==='ai'&&gpt.count>=1&&gpt.top.some(t=>t.path==='/llms.txt'),'GPTBot counted');
  console.log('HTTP: key pages and bot files return 200; missing page returns 404; markdown mirrors, Accept negotiation and AI crawler counter work.');
 }catch(e){console.error(e);process.exitCode=1;}finally{clearTimeout(timeout);server.kill();}
});
server.on('error',e=>{clearTimeout(timeout);console.error(e);process.exitCode=1;});
