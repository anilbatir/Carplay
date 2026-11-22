#!/usr/bin/env node
/*
 * Yeni siteyi (ve istenirse referansı) tarayıcıda açar, aynı kaydırma noktalarında
 * ekran görüntüsü alır, konsol hatalarını ve yatay taşmayı raporlar.
 *
 * Kullanım:
 *   node kontrol.js <site-klasoru|url> <cikti-klasoru> [--referans <url|klasor>] [--bekle 4500]
 *
 * --referans verilirse <cikti>/karsilastirma.html dosyası iki siteyi masaüstü ve telefonda
 * yan yana gösterir.
 *
 * CDN'lere ağ izni olmayan ortamlarda: sayfanın cdnjs / unpkg / jsdelivr betikleri npm'den
 * (~/.cache/site-uyarla-cdn) indirilip yerelden servis edilir.
 */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const refTarget = opt('--referans', null);
const wait = +opt('--bekle', 4500);
const [target, outDir] = args;
if (!target || !outDir) { console.error('Kullanım: node kontrol.js <site-klasoru|url> <cikti-klasoru> [--referans <url|klasor>]'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

const toUrl = t => /^https?:\/\//.test(t) ? t
  : 'file://' + path.resolve(fs.statSync(t).isDirectory() ? path.join(t, 'index.html') : t);

/* ---- CDN yedeği: npm paketinden servis ---- */
const CACHE = path.join(process.env.HOME || '/tmp', '.cache', 'site-uyarla-cdn');
const parseCdn = u => {
  let m;
  if ((m = u.match(/cdnjs\.cloudflare\.com\/ajax\/libs\/([^/]+)\/([^/]+)\/(.+)$/))) return { pkg: m[1], ver: m[2], file: m[3], cdnjs: true };
  if ((m = u.match(/unpkg\.com\/((?:@[^/]+\/)?[^/@]+)@([^/]+)\/(.+)$/))) return { pkg: m[1], ver: m[2], file: m[3] };
  if ((m = u.match(/cdn\.jsdelivr\.net\/npm\/((?:@[^/]+\/)?[^/@]+)@([^/]+)\/(.+)$/))) return { pkg: m[1], ver: m[2], file: m[3] };
  return null;
};
const localFor = c => {
  const dir = path.join(CACHE, `${c.pkg.replace('/', '__')}@${c.ver}`);
  const root = path.join(dir, 'node_modules', c.pkg);
  if (!fs.existsSync(root)) {
    fs.mkdirSync(dir, { recursive: true });
    try { execFileSync('npm', ['i', '--silent', '--no-audit', '--no-fund', '--prefix', dir, `${c.pkg}@${c.ver}`], { stdio: 'ignore' }); }
    catch { return null; }
  }
  const base = path.basename(c.file);
  const cands = [path.join(root, c.file), path.join(root, 'dist', c.file), path.join(root, 'dist', base), path.join(root, base)];
  if (c.cdnjs) cands.push(...['dist', 'build', 'umd', 'lib'].map(d => path.join(root, d, base)));
  return cands.find(p => fs.existsSync(p)) || null;
};
async function routeCdn(ctx, log) {
  await ctx.route(/(cdnjs\.cloudflare\.com|unpkg\.com|cdn\.jsdelivr\.net)/, async route => {
    const url = route.request().url();
    try { const r = await route.fetch(); if (r.ok()) return route.fulfill({ response: r }); } catch {}
    const c = parseCdn(url), p = c && localFor(c);
    if (p) { log.push(`CDN yerelden: ${url}`); return route.fulfill({ path: p, contentType: 'application/javascript' }); }
    log.push(`CDN yüklenemedi: ${url}`); return route.abort();
  });
}

const STOPS = [0, 17, 33, 50, 67, 83, 100];
async function shoot(browser, url, label, profile, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts);
  const log = [];
  await routeCdn(ctx, log);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push('JS hatası: ' + e.message));
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(e => errors.push('Açılamadı: ' + e.message));
  await page.waitForTimeout(wait);
  const shots = [];
  for (const pct of STOPS) {
    await page.evaluate(p => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p / 100), pct);
    await page.waitForTimeout(1600);
    const f = `${label}-${profile}-${String(pct).padStart(3, '0')}.png`;
    await page.screenshot({ path: path.join(outDir, f) });
    shots.push(f);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await ctx.close();
  return { errors, overflow, shots, log };
}

(async () => {
  const browser = await chromium.launch();
  const profiles = { masaustu: { viewport: { width: 1440, height: 900 } }, telefon: devices['iPhone 13'] };
  const targets = [['yeni', toUrl(target)]];
  if (refTarget) targets.push(['referans', toUrl(refTarget)]);
  const res = {};
  let problems = 0;
  for (const [label, url] of targets) for (const [prof, o] of Object.entries(profiles)) {
    const r = await shoot(browser, url, label, prof, o);
    res[`${label}-${prof}`] = r;
    console.log(`\n[${label} · ${prof}] ${url}`);
    console.log(`  konsol hatası: ${r.errors.length}${r.errors.length ? '\n    - ' + r.errors.join('\n    - ') : ''}`);
    console.log(`  yatay taşma: ${r.overflow > 0 ? r.overflow + ' px  ← düzelt' : 'yok'}`);
    r.log.forEach(l => console.log('  ' + l));
    if (label === 'yeni') problems += r.errors.length + (r.overflow > 0 ? 1 : 0);
  }
  await browser.close();

  if (refTarget) {
    const rows = Object.keys(profiles).map(prof => STOPS.map((pct, i) => `
      <h3>${prof} · %${pct}</h3><div class="row">
        <figure><img src="${res[`referans-${prof}`].shots[i]}"><figcaption>referans</figcaption></figure>
        <figure><img src="${res[`yeni-${prof}`].shots[i]}"><figcaption>yeni</figcaption></figure></div>`).join('')).join('');
    fs.writeFileSync(path.join(outDir, 'karsilastirma.html'), `<!doctype html><meta charset="utf-8"><title>Karşılaştırma</title>
<style>body{font:15px system-ui;margin:0;padding:16px;background:#111;color:#eee}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
figure{margin:0}img{width:100%;border:1px solid #333}figcaption{opacity:.7;padding:4px 0 18px}h3{margin:24px 0 8px}</style>
<h1>Referans ↔ yeni</h1>${rows}`);
    console.log(`\nKarşılaştırma: ${path.join(outDir, 'karsilastirma.html')}`);
  }
  console.log(`\nEkran görüntüleri: ${outDir}`);
  process.exit(problems ? 2 : 0);
})();
