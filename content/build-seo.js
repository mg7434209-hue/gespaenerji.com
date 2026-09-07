'use strict';
const fs = require('fs');
const path = require('path');
const pages = require('./seo-pages');
const labels = {
  related:['İlgili hizmetler ve projeler','Related services and projects','Weitere Leistungen und Projekte','Связанные услуги и проекты'],
  quote:['Projeniz için keşif isteyin','Request a site assessment','Standortprüfung anfragen','Запросить обследование'],
  calculate:['Tasarrufunuzu hesaplayın','Estimate your savings','Einsparung schätzen','Оценить экономию'],
  scope:['Keşif ve teklif','Assessment and quotation','Prüfung und Angebot','Обследование и предложение']
};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function translations(i18n) {
  const add=t=>['en','de','ru'].forEach((l,i)=>{i18n.DICT[l][t[0]]=t[i+1];});
  Object.values(labels).forEach(add);
  require("./translation-fixes.json").forEach(add);
  pages.forEach(p=>{add(p.title);add(p.intro);p.sections.forEach(s=>s.forEach(add));});
}
function generate(root) {
  // One editable source for extra translations; browser and static build stay in sync.
  const dictionaryPath = path.join(root, 'assets/i18n.js');
  const rows = require('./translation-fixes.json');
  const addition = '  // Additional static and runtime product/tool translations.\n' +
    ['en','de','ru'].map((l,i) => '  Object.assign(DICT.'+l+', '+JSON.stringify(Object.fromEntries(rows.map(r=>[r[0],r[i+1]])),null,2)+');\n').join('');
  const dictionary = fs.readFileSync(dictionaryPath, 'utf8');
  fs.writeFileSync(dictionaryPath, dictionary.replace(/  \/\/ Additional static and runtime product\/tool translations\.[\s\S]*?(?=  var SKIP = )/, () => addition));
  let template=fs.readFileSync(path.join(root,'hizmetler.html'),'utf8');
  template=template.replace(/\s*<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'').replace(/\s*<!-- LD:STATIC[\s\S]*?\/LD:STATIC -->/g,'');
  const names=Object.fromEntries(pages.map(p=>[p.file,p.title[0]]));
  Object.assign(names,{'tarimsal-sulama.html':'Tarımsal Sulama','projeler.html':'Referans Projeler','sistem-kur.html':'Sistem Kurucu','paket-2x540w.html':'Tam Kapsamlı Güneş Enerjisi Sistemi'});
  for(const p of pages){
    let html=template.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(p.title[0])+' | GESPA Enerji</title>');
    html=html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/g,(_,a)=>a+esc(p.intro[0]));
    html=html.replace(/(<meta property="og:title" content=")[^"]*/g,(_,a)=>a+esc(p.title[0]));
    html=html.replace(/https:\/\/www.gespaenerji.com\/hizmetler.html/g,'https://www.gespaenerji.com/'+p.file);
    html=html.replace(/\s*<link rel="alternate"[^>]*>/g,'');
    if(p.image)html=html.replace(/(<meta property="og:image" content=")[^"]*/,'$1https://www.gespaenerji.com/'+p.image).replace(/(<meta name="twitter:image" content=")[^"]*/,'$1https://www.gespaenerji.com/'+p.image);
    let body='<main id="main"><section class="page-hero"><div class="container"><div class="crumbs"><a href="index.html">Ana Sayfa</a> <span>/</span> <a href="'+(p.kind==='Service'?'hizmetler.html':'projeler.html')+'">'+(p.kind==='Service'?'Hizmetlerimiz':'Referans Projeler')+'</a> <span>/</span> '+esc(p.title[0])+'</div><h1>'+esc(p.title[0])+'</h1><p class="lead">'+esc(p.intro[0])+'</p></div></section><section class="section"><div class="container seo-article">';
    const photoSource = fs.readFileSync(path.join(root,'projeler.html'),'utf8');
    const photoTag = p.image && photoSource.match(new RegExp('<img[^>]*src="'+p.image+'"[^>]*>'));
    const imageWidth = photoTag && (photoTag[0].match(/width="(\d+)"/)||[])[1] || '800';
    const imageHeight = photoTag && (photoTag[0].match(/height="(\d+)"/)||[])[1] || '600';
    if(p.image)body+='<img class="seo-project-photo" src="'+p.image+'" alt="'+esc(p.title[0])+'" width="'+imageWidth+'" height="'+imageHeight+'" fetchpriority="high" />';
    body+=p.sections.map(s=>'<section class="seo-section"><h2>'+esc(s[0][0])+'</h2><p>'+esc(s[1][0])+'</p></section>').join('');
    body+='<aside class="seo-related"><h2>'+labels.related[0]+'</h2><ul>'+p.related.map(f=>'<li><a href="'+f+'">'+esc(names[f])+'</a></li>').join('')+'</ul></aside><section class="seo-section"><h2>'+labels.scope[0]+'</h2><div class="seo-actions"><a class="btn" href="iletisim.html">'+labels.quote[0]+'</a><a class="btn btn-ghost" href="hesaplayici.html">'+labels.calculate[0]+'</a></div></section></div></section></main>';
    html=html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,body);
    fs.writeFileSync(path.join(root,p.file),html);
  }
}
function schema(file,cfg){
  const p=pages.find(p=>p.file===file);if(!p)return null;
  return {'@context':'https://schema.org','@type':p.kind,'@id':cfg.company.web+'/'+file+'#'+(p.kind==='Service'?'service':'page'),name:p.title[0],description:p.intro[0],url:cfg.company.web+'/'+file,...(p.kind==='Service'?{provider:{'@id':cfg.company.web+'/#organization'},areaServed:cfg.company.areaServed}:{inLanguage:'tr',...(p.image?{image:cfg.company.web+'/'+p.image}:{})})};
}
module.exports={pages,translations,generate,schema};
