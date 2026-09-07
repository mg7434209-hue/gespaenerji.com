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
 for(const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){JSON.parse(m[1]);schemas++;}
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
  console.log('HTTP: key pages and bot files return 200; missing page returns 404.');
 }catch(e){console.error(e);process.exitCode=1;}finally{clearTimeout(timeout);server.kill();}
});
server.on('error',e=>{clearTimeout(timeout);console.error(e);process.exitCode=1;});
