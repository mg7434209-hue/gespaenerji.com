/**
 * Döviz kuru ve ₺ fiyat kuralı — server.js ve build.js ortak kullanır.
 *
 * Katalogdaki TÜM ürünler USD tutulur; ₺ fiyat = USD × kur, tutara göre
 * kademeli yuvarlanır. assets/main.js `tlRound` BİREBİR aynısıdır (tarayıcı
 * bu modülü yükleyemez); test üçünün aynı sonucu verdiğini denetler.
 *
 * Canlı kur: TCMB günlük bülteni (https://www.tcmb.gov.tr/kurlar/today.xml),
 * USD "döviz satış" (ForexSelling). TCMB iş günlerinde 15.30 civarı yayımlar;
 * hafta sonu ve tatilde son iş gününün kuru döner.
 */
"use strict";

// ₺ yuvarlama: 10.000 ₺ ve üstü 100'e, 1.000 ₺ ve üstü 50'ye, altı 10'a.
// Eskiden hepsi 100'e yuvarlanıyordu; ₺100'lük MC4 takımı kur biraz
// oynayınca ₺200'e sıçrardı.
function tlRound(v) {
  const s = v >= 10000 ? 100 : v >= 1000 ? 50 : 10;
  return Math.round(v / s) * s;
}

function usdToTl(usd, rate) {
  return tlRound((+usd || 0) * (+rate || 0));
}

// TCMB today.xml → { rate, date } (rate = 1 USD'nin ₺ karşılığı). Biçim
// beklenmedikse null: çağıran eski kurla devam eder, fiyatlar bozulmaz.
function parseTcmb(xml, field) {
  const f = /^[A-Za-z]+$/.test(field || "") ? field : "ForexSelling";
  const cur = /<Currency\b[^>]*\bKod="USD"[^>]*>([\s\S]*?)<\/Currency>/.exec(String(xml || ""));
  if (!cur) return null;
  const val = new RegExp("<" + f + ">\\s*([0-9]+(?:[.,][0-9]+)?)\\s*</" + f + ">").exec(cur[1]);
  if (!val) return null;
  const unitM = /<Unit>\s*(\d+)\s*<\/Unit>/.exec(cur[1]);
  const unit = unitM ? +unitM[1] : 1;
  const rate = parseFloat(val[1].replace(",", ".")) / (unit || 1);
  if (!(rate > 1 && rate < 1000)) return null;
  const d = /<Tarih_Date\b[^>]*\bTarih="([0-9.]+)"/.exec(String(xml));
  return { rate: Math.round(rate * 10000) / 10000, date: d ? d[1] : "" };
}

// Uygulanan kur: TCMB × (1 + marj%) — ama ASGARİ kurun (config.usdTry)
// altına inmez. Asgari kur işletmenin elle verdiği son kurdur; TCMB onun
// üstüne çıkınca fiyatlar kendiliğinden yükselir.
function effectiveRate(tcmb, floor, marginPct) {
  const live = tcmb > 0 ? tcmb * (1 + (+marginPct || 0) / 100) : 0;
  return Math.round(Math.max(+floor || 0, live) * 10000) / 10000;
}

// Veri hatasına karşı sıçrama sınırı: yeni kur öncekinden %25'ten fazla
// farklıysa uygulanmaz (TCMB yanıtı bozuk ya da yanlış alan okunmuş olabilir).
function saneJump(prev, next, maxPct) {
  if (!(prev > 0)) return true;
  return Math.abs(next - prev) / prev <= (maxPct || 25) / 100;
}

module.exports = { tlRound, usdToTl, parseTcmb, effectiveRate, saneJump };
