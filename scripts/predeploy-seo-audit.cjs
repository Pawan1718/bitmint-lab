/* Run from repository root: node scripts/predeploy-seo-audit.cjs
 * Read-only source checks. Does not deploy, build, crawl the web, or modify files.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://bitmintlab.in';
const errors = [];
const warnings = [];
function exists(local) { return fs.existsSync(path.join(root, local)); }
function read(local) { return fs.readFileSync(path.join(root, local), 'utf8'); }
function attr(html, regex) { const match = html.match(regex); return match ? match[1] : ''; }
function localFromUrl(raw, base) {
  try {
    const url = new URL(raw.replace(/&amp;/g, '&'), base);
    if (url.origin !== origin || url.pathname === '/') return url.origin === origin ? 'index.html' : null;
    return url.pathname.endsWith('/') ? url.pathname.slice(1) + 'index.html' : url.pathname.slice(1);
  } catch (_) { return null; }
}
if (!exists('sitemap.xml') || !exists('robots.txt')) {
  console.error('Missing sitemap.xml or robots.txt');
  process.exitCode = 1;
} else {
  const sitemap = read('sitemap.xml');
  const robots = read('robots.txt');
  if (!robots.includes(origin + '/sitemap.xml')) errors.push('robots.txt does not advertise the current sitemap');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const unique = new Set(urls);
  if (urls.length !== unique.size) errors.push('Duplicate sitemap locations');
  if (!urls.length) errors.push('Sitemap has no URL entries');
  for (const url of urls) {
    const local = localFromUrl(url, origin + '/');
    if (!local || !exists(local)) { errors.push('Sitemap page missing: ' + url); continue; }
    const html = read(local);
    const canonical = attr(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (canonical !== url) errors.push(local + ': canonical mismatch (' + canonical + ')');
    if (!/<title\b[^>]*>\s*[^<]+<\/title>/i.test(html)) errors.push(local + ': missing title');
    if (!/name=["']description["']/i.test(html)) warnings.push(local + ': missing meta description');
    const og = attr(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (!og) errors.push(local + ': missing og:image');
    else {
      const img = localFromUrl(og, origin + '/');
      if (img && !exists(img)) errors.push(local + ': OG image missing: ' + img);
    }
    const twitter = attr(html, /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (!twitter) warnings.push(local + ': missing twitter:image');
    for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(match[1]); } catch (err) { errors.push(local + ': invalid JSON-LD: ' + err.message); }
    }
    for (const match of html.matchAll(/<(?:img|script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
      const raw = match[1];
      const ref = localFromUrl(raw, url);
      if (ref && !exists(ref)) errors.push(local + ': referenced asset missing: ' + ref);
    }
  }
  console.log('Sitemap pages checked:', urls.length);
}
if (!exists('assets/js/analytics-config.js') || !/G-[A-Z0-9]{6,20}/.test(read('assets/js/analytics-config.js'))) {
  warnings.push('GA4 measurement ID not configured; optional tracking will stay off');
}
for (const message of [...new Set(errors)]) console.error('ERROR:', message);
for (const message of [...new Set(warnings)]) console.warn('WARN:', message);
console.log(errors.length ? 'Pre-deployment SEO audit: FAILED' : 'Pre-deployment SEO audit: source checks PASSED (live checks still required)');
if (errors.length) process.exitCode = 1;
