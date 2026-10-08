// tami (Garanti BBVA) kart ödemesi — uçtan uca test. Gerçek server.js, sahte
// bir tami sunucusuna bağlanır (ağ gerekmez). Denetlenenler: sağlayıcı anahtarı
// (CARD_PROVIDER), imzalar (PG-Auth-Token, securityHash JWS HS512), sepet ve
// link ödemesi, tek kullanımlık 3D sayfası, hashedData doğrulaması (sahte
// dönüş reddi), complete-3ds tutar denetimi, dekont, taksit/vade farkı ve kart
// verisinin diske düşmemesi.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const http = require('node:http'), crypto = require('node:crypto'), vm = require('node:vm');
const { spawn } = require('node:child_process');
const root = path.join(__dirname, '..');

const M = '77000001', T = '84000001', SEC = 'tami-test-secret', KID = 'kid-test';
const K = crypto.randomBytes(64).toString('base64url');
const CARD = '4824910501747014';
const seen = {};
let completeAmount = null;

const cfgCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/config.js'), 'utf8'), cfgCtx);
const C = cfgCtx.window.GESPA.config;
const pkg = C.packages.find((p) => p.price != null && !p.priceOnRequest && p.stock !== 0);
assert.ok(pkg, 'fiyatlı ürün var');

const mock = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => b += c); req.on('end', () => {
    const j = JSON.parse(b);
    (seen[req.url] = seen[req.url] || []).push({ headers: req.headers, body: j });
    assert.equal(req.headers['pg-auth-token'], M + ':' + T + ':' + crypto.createHash('sha256').update(M + T + SEC).digest('base64'), 'PG-Auth-Token');
    assert.equal(req.headers['pg-api-version'], 'v3');
    const { securityHash, ...rest } = j;
    const [h, p, s] = securityHash.split('.');
    assert.equal(JSON.parse(Buffer.from(h, 'base64url')).kid, KID);
    assert.equal(Buffer.from(p, 'base64url').toString(), JSON.stringify(rest), 'JWS payload = gövde');
    assert.equal(s, crypto.createHmac('sha512', Buffer.from(K, 'base64url')).update(h + '.' + p).digest('base64url'), 'JWS imzası');
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/installment/installment-info') {
      return res.end(JSON.stringify({ success: true, bankName: 'GARANTI BBVA', cardType: 'CREDIT', rewardType: 'Bonus', isInstallment: j.binNumber.startsWith('4824') }));
    }
    if (req.url === '/payment/auth') {
      return res.end(JSON.stringify({ success: true, orderId: j.orderId, amount: j.amount,
        card: { maskedNumber: '4824-9105-xxxx-xx14', cardBrand: 'GARANTI', cardOrganization: 'VISA', cardType: 'CREDIT' },
        threeDSHtmlContent: Buffer.from('<html><body>BANKA-3D ' + j.orderId + '</body></html>').toString('base64') }));
    }
    if (req.url === '/payment/complete-3ds') {
      return res.end(JSON.stringify({ success: true, orderId: j.orderId, amount: completeAmount, currency: 'TRY',
        installmentCount: 1, bankAuthCode: '471000', bankReferenceNumber: 'REF' + j.orderId }));
    }
    res.statusCode = 404; res.end('{}');
  });
});

const hashed = (f, amount, n) => crypto.createHmac('sha256', SEC).update(
  f.cardOrganization + f.cardBrand + f.cardType + f.maskedNumber + n + 'TRY' + amount + f.orderId + f.systemTime + 'true').digest('base64');

mock.listen(0, () => {
  const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'gespa-tami-'));
  const port = 4319, B = 'http://127.0.0.1:' + port;
  const server = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port),
    IYZIPAY_API_KEY: '', IYZICO_API_KEY: '', IYZIPAY_SECRET_KEY: '', IYZICO_SECRET_KEY: '', FX_AUTO: '0', DATA_DIR: DATA,
    CARD_PROVIDER: 'tami', TAMI_MERCHANT_NUMBER: M, TAMI_TERMINAL_NUMBER: T, TAMI_SECRET_KEY: SEC, TAMI_KID: KID, TAMI_K: K,
    TAMI_BASE_URL: 'http://127.0.0.1:' + mock.address().port } });
  let logs = '', started = false;
  const fin = (code) => { server.kill(); mock.close(); if (code) { console.error(logs); process.exitCode = 1; } };
  const timer = setTimeout(() => { console.error('zaman aşımı'); fin(1); }, 60000);
  server.stderr.on('data', (d) => logs += d);
  server.stdout.on('data', async (d) => {
    logs += d; if (started || !logs.includes('adresinde yayında')) return; started = true;
    try {
      const J = (u, body) => fetch(B + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(async (r) => ({ status: r.status, j: await r.json() }));
      const st = await (await fetch(B + '/api/pay/status')).json();
      assert.equal(st.enabled, true); assert.equal(st.provider, 'tami', 'CARD_PROVIDER=tami');
      assert.equal(st.taksit.farkPct[3], 5.55, 'vade farkı komisyondan türetilir');
      assert.ok(!JSON.stringify(st).includes('komisyon'), 'komisyon oranı dışarı verilmez');

      // --- Sepet ödemesi (tek çekim) ---
      const kart = { holderName: 'Ali Veli', number: CARD, expireMonth: 4, expireYear: 2031, cvv: '123' };
      const buyer = { ad: 'Ali Veli Test', tel: '0543 111 22 33', eposta: 'a@b.co', il: 'Antalya / Manavgat', adres: 'Örnek Mah.', tckn: '12345678901' };
      let r = await J('/api/pay/checkout', { items: [{ id: pkg.id, qty: 2 }], expectTL: 0, buyer, card: { ...kart, number: '4824910501747015' } });
      assert.equal(r.status, 400, 'geçersiz kart (Luhn)');
      r = await J('/api/pay/checkout', { items: [{ id: pkg.id, qty: 2 }], expectTL: 0, buyer, card: kart, tkTaksit: 1 });
      assert.equal(r.status, 200, JSON.stringify(r.j)); assert.match(r.j.url, /^\/api\/pay\/tami\/3d\/[a-f0-9]{36}$/);
      const auth = seen['/payment/auth'].at(-1).body;
      assert.equal(auth.installmentCount, 1);
      assert.equal(Math.round(auth.basket.basketItems.reduce((a, i) => a + i.totalPrice, 0) * 100) / 100, auth.amount, 'kalemler = tutar');
      for (const it of auth.basket.basketItems) assert.ok(it.name.length <= 50 && Math.round(it.unitPrice * it.numberOfProducts * 100) === Math.round(it.totalPrice * 100));
      assert.ok(auth.callbackUrl.endsWith('/api/pay/tami/callback'));
      // 3D sayfası: tek kullanımlık, CSP'siz, önbelleğe alınmaz
      let p3 = await fetch(B + r.j.url, { redirect: 'manual' });
      assert.equal(p3.status, 200); assert.ok(!p3.headers.get('content-security-policy'), '3D sayfasında CSP yok');
      assert.equal(p3.headers.get('cache-control'), 'no-store'); assert.ok((await p3.text()).includes('BANKA-3D'));
      p3 = await fetch(B + r.j.url, { redirect: 'manual' }); assert.equal(p3.status, 302, '3D sayfası ikinci kez açılmaz');
      const disk = () => fs.readFileSync(path.join(DATA, 'orders.json'), 'utf8');
      assert.ok(!disk().includes(CARD) && !disk().includes('"cvv"'), 'kart verisi diske yazılmaz');

      // --- Dönüş: sahte hash reddedilir, tami'ye gidilmez ---
      const cb = { cardOrganization: 'VISA', cardBrand: 'GARANTI', cardType: 'CREDIT', maskedNumber: '4824-9105-xxxx-xx14',
        installmentCount: '1', currencyCode: 'TRY', txnAmount: String(auth.amount), orderId: auth.orderId, systemTime: '2026-10-08T10:00:00.1', success: 'true', mdStatus: '1' };
      const post = (f) => fetch(B + '/api/pay/tami/callback', { method: 'POST', redirect: 'manual',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(f).toString() });
      r = await post({ ...cb, hashedData: 'AAAA' });
      assert.match(r.headers.get('location'), /d=hata/); assert.ok(!seen['/payment/complete-3ds'], 'sahte dönüşte complete yok');

      // --- Geçerli dönüş → complete-3ds → ödendi + dekont ---
      // 2. sepet (önceki kayıt "failed" oldu)
      r = await J('/api/pay/checkout', { items: [{ id: pkg.id, qty: 2 }], expectTL: 0, buyer, card: kart, tkTaksit: 1 });
      const auth2 = seen['/payment/auth'].at(-1).body;
      completeAmount = auth2.amount;
      const cb2 = { ...cb, orderId: auth2.orderId, txnAmount: auth2.amount.toFixed(2) };
      r = await post({ ...cb2, hashedData: hashed(cb2, auth2.amount.toFixed(2), 1) });
      const loc = r.headers.get('location');
      assert.match(loc, /^\/odeme-sonuc\.html\?d=ok&r=[a-f0-9]{24}#k=/, 'başarılı yönlendirme + dekont belirteci');
      const ord = JSON.parse(disk())[auth2.orderId];
      assert.equal(ord.status, 'paid'); assert.equal(ord.provider, 'tami'); assert.equal(ord.paymentId, 'REF' + auth2.orderId);
      assert.equal(ord.tami.maskedNumber, '4824-9105-xxxx-xx14'); assert.equal(ord.tami.bankAuthCode, '471000');
      const rid = /r=([a-f0-9]+)/.exec(loc)[1], rk = /#k=(.+)$/.exec(loc)[1];
      const rc = await J('/api/order/receipt', { r: rid, k: rk });
      assert.equal(rc.status, 200); assert.equal(rc.j.amount, auth2.amount); assert.equal(rc.j.taksit, 1);
      // tekrar gelen dönüş: zaten ödendi → ok
      r = await post({ ...cb2, hashedData: hashed(cb2, auth2.amount.toFixed(2), 1) });
      assert.match(r.headers.get('location'), /d=ok/);

      // --- Tutar uyuşmazlığı: ödendi sayılmaz ---
      r = await J('/api/pay/checkout', { items: [{ id: pkg.id, qty: 1 }], expectTL: 0, buyer, card: kart, tkTaksit: 1 });
      const auth3 = seen['/payment/auth'].at(-1).body;
      completeAmount = auth3.amount + 5;
      const cb3 = { ...cb, orderId: auth3.orderId, txnAmount: String(auth3.amount) };
      r = await post({ ...cb3, hashedData: hashed(cb3, String(auth3.amount), 1) });
      assert.match(r.headers.get('location'), /d=hata/);
      assert.equal(JSON.parse(disk())[auth3.orderId].status, 'failed');

      // --- Link ödemesi (odeme.html): tek=1 / tks=N ve vade farkı ---
      const lb = { amountTL: 1000, desc: 'GES Marketim — test', ref: 'GM1', buyer: { ad: 'Ayşe Kaya', tel: '05431112233', eposta: 'a@b.co', il: 'Antalya', adres: 'X' } };
      r = await J('/api/pay/custom', { ...lb, tek: true, card: kart, tkTaksit: 3 });
      assert.equal(r.status, 400, 'tek=1 iken taksit reddedilir');
      r = await J('/api/pay/custom', { ...lb, taksit: 3, card: kart, tkTaksit: 3 });
      assert.equal(r.status, 200, JSON.stringify(r.j));
      const la = seen['/payment/auth'].at(-1).body;
      assert.equal(la.installmentCount, 3); assert.equal(la.amount, 1055.5, '1000 ₺ × %5,55 vade farkı');
      assert.ok(la.basket.basketItems.some((i) => i.itemId === 'vade-farki' && i.itemType === 'VIRTUAL'));
      r = await J('/api/pay/custom', { ...lb, taksit: 3, card: kart, tkTaksit: 6 });
      assert.equal(r.status, 400, 'tks=3 bağlantısında 6 taksit reddedilir');
      r = await J('/api/pay/custom', { ...lb, card: { ...kart, number: '5421190122944522' }, tkTaksit: 1 });
      assert.equal(r.status, 200, 'taksitsiz link: tek çekim');
      r = await J('/api/pay/custom', { amountTL: 1000, desc: 'x', buyer: lb.buyer, card: { ...kart, number: '5421190122944522' }, tkTaksit: 3 });
      assert.equal(r.status, 400, 'taksit yapamayan kart');
      r = await J('/api/pay/tami/taksit', { bin: '48249105' });
      assert.equal(r.status, 200); assert.equal(r.j.taksit, true); assert.equal(r.j.program, 'Bonus');
      assert.ok(seen['/installment/installment-info'].every((x) => /^GM/.test(x.headers.correlationid)), 'correlationId');

      clearTimeout(timer);
      console.log('tami: sepet + link ödemesi, 3D sayfası, dönüş doğrulaması, dekont, taksit/vade farkı geçti.');
      fin(0);
    } catch (e) { clearTimeout(timer); console.error(e); fin(1); }
  });
});
