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
for(const lang of ['en','de','ru']){
 const html=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 assert.ok(html.includes('<meta property="og:locale:alternate" content="tr_TR" />'),lang+': og:locale:alternate tr');
 assert.ok(!html.includes('<meta property="og:locale:alternate" content="'+{en:'en_US',de:'de_DE',ru:'ru_RU'}[lang]+'" />'),lang+': own locale is not an alternate');
}
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
