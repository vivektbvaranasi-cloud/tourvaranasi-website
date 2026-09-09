import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE = 'https://www.tourvaranasi.com';
const SKIP = new Set(['.git', '.netlify', 'node_modules']);
const HOME_CSS = '/assets/css/home-refresh.css';
const DEFAULT_IMAGE = `${SITE}/assets/images/user/sunrise-ganges.jpg`;

async function walk(dir = '.') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

function sitePath(file) {
  const p = relative('.', file).split(sep).join('/');
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) return `/${p.slice(0, -'index.html'.length)}`;
  return `/${p}`;
}

function attrs(tag) {
  const map = new Map();
  const re = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let m;
  while ((m = re.exec(tag))) map.set(m[1].toLowerCase(), m[3]);
  return map;
}

function metaValue(html, key, type = 'name') {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if ((a.get(type) || '').toLowerCase() === key.toLowerCase()) return a.get('content') || '';
  }
  return '';
}

function ensureHeadTag(html, test, tag) {
  if (test(html)) return html;
  return html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function ensureMeta(html, attrName, key, content) {
  if (!content) return html;
  return ensureHeadTag(
    html,
    (h) => new RegExp(`<meta\\b[^>]*\\b${attrName}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(h),
    `<meta ${attrName}="${key}" content="${String(content).replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"/>`
  );
}

function ensureLink(html, rel, href, extra = '') {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return ensureHeadTag(
    html,
    (h) => new RegExp(`<link\\b[^>]*\\brel=["'][^"']*${rel}[^"']*["'][^>]*\\bhref=["']${escaped}["']|<link\\b[^>]*\\bhref=["']${escaped}["'][^>]*\\brel=["'][^"']*${rel}`, 'i').test(h),
    `<link rel="${rel}" href="${href}"${extra}/>`
  );
}

function canonicalFor(file) {
  return `${SITE}${sitePath(file)}`;
}

function replaceEmbeddedImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const a = attrs(tag);
    const src = a.get('src') || '';
    if (!src.startsWith('data:image/')) return tag;
    const cls = a.get('class') || '';
    const alt = a.get('alt') || '';
    let replacement = '';
    if (/\bta-logo\b/i.test(cls) || /tripadvisor/i.test(alt)) replacement = '/tripadvisor-logo.png';
    else if (/tour varanasi/i.test(alt) || /\bbrand/i.test(cls) || /logo/i.test(cls)) replacement = '/tour-varanasi-logo.png';
    if (!replacement) return tag;
    return tag.replace(/\bsrc=(["'])data:image\/[^"']+\1/i, `src="${replacement}"`);
  });
}

function normalizeImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let out = tag;
    if (!/\bdecoding\s*=/.test(out)) out = out.replace(/<img\b/i, '<img decoding="async"');
    return out;
  });
}

function normalizeBlankLinks(html) {
  return html.replace(/<a\b[^>]*target=["']_blank["'][^>]*>/gi, (tag) => {
    const a = attrs(tag);
    const rel = (a.get('rel') || '').split(/\s+/).filter(Boolean);
    if (!rel.includes('noopener')) rel.push('noopener');
    if (!rel.includes('noreferrer')) rel.push('noreferrer');
    if (/\brel\s*=/.test(tag)) return tag.replace(/\brel=(["'])[^"']*\1/i, `rel="${rel.join(' ')}"`);
    return tag.replace(/>$/, ` rel="${rel.join(' ')}">`);
  });
}

function ensureDeferredMainScript(html) {
  let seen = false;
  return html.replace(/<script\b[^>]*\bsrc=(["'])\/assets\/js\/main\.js\1[^>]*><\/script>/gi, () => {
    if (seen) return '';
    seen = true;
    return '<script defer src="/assets/js/main.js"></script>';
  });
}

function cdn(src, width, quality = 78, html = true) {
  const value = `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp&q=${quality}`;
  return html ? value.replaceAll('&', '&amp;') : value;
}

function optimizePlanMyJourney(html) {
  const hero = '/assets/images/pmj-hero-boat-guide.webp';
  const heroCss = cdn(hero, 1920, 78, false);
  const heroHtml = cdn(hero, 1920, 78, true);
  html = html.replaceAll(`background:url('${hero}')`, `background:url('${heroCss}')`);
  html = html.replaceAll(`href="${hero}"`, `href="${heroHtml}"`);
  html = html.replace(/<link\b([^>]*href=["'][^"']*pmj-hero-boat-guide[^>]*?)\/>/i, (tag) => {
    if (/fetchpriority=/.test(tag)) return tag;
    return tag.replace(/\/>$/, ' fetchpriority="high"/>');
  });

  const images = new Map([
    ['/assets/images/pmj-temple-blessing.webp', 1200],
    ['/assets/images/pmj-street-food-guide.webp', 720],
    ['/assets/images/pmj-banarasi-weaving.webp', 720],
    ['/assets/images/pmj-chai-lanes.webp', 720]
  ]);
  for (const [src, width] of images) {
    html = html.replaceAll(`src="${src}"`, `src="${cdn(src, width)}"`);
  }
  return html;
}

function hardenHomepage(html) {
  html = replaceEmbeddedImages(html);
  if (!html.includes(`href="${HOME_CSS}"`)) {
    html = html.replace(/<style>[\s\S]*?<\/style>/i, `<link rel="stylesheet" href="${HOME_CSS}"/>`);
  } else {
    html = html.replace(/<style>[\s\S]*?<\/style>/i, '');
  }
  html = ensureLink(html, 'preload', '/assets/images/user/sunrise-ganges.jpg', ' as="image" fetchpriority="high"');
  return html;
}

function ensureSeo(html, file) {
  const is404 = sitePath(file) === '/404.html';
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]+>/g, '').trim();
  const description = metaValue(html, 'description') || metaValue(html, 'og:description', 'property');
  const canonical = metaValue(html, 'og:url', 'property') || canonicalFor(file);
  const ogTitle = metaValue(html, 'og:title', 'property') || title;
  const ogDescription = metaValue(html, 'og:description', 'property') || description;
  let ogImage = metaValue(html, 'og:image', 'property') || DEFAULT_IMAGE;
  if (ogImage.startsWith('/')) ogImage = `${SITE}${ogImage}`;

  if (is404) {
    if (/<meta\b[^>]*\bname=["']robots["']/i.test(html)) {
      html = html.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow"/>');
    } else {
      html = ensureMeta(html, 'name', 'robots', 'noindex,follow');
    }
    return html;
  }

  if (!/<link\b[^>]*\brel=["']canonical["']/i.test(html)) {
    html = ensureHeadTag(html, () => false, `<link rel="canonical" href="${canonicalFor(file)}"/>`);
  }
  html = ensureMeta(html, 'name', 'robots', 'index,follow');
  html = ensureMeta(html, 'property', 'og:type', sitePath(file).includes('/blogs/') || sitePath(file).includes('/travel-guide/') ? 'article' : 'website');
  html = ensureMeta(html, 'property', 'og:title', ogTitle);
  html = ensureMeta(html, 'property', 'og:description', ogDescription);
  html = ensureMeta(html, 'property', 'og:url', canonical);
  html = ensureMeta(html, 'property', 'og:image', ogImage);
  html = ensureMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = ensureMeta(html, 'name', 'twitter:title', ogTitle);
  html = ensureMeta(html, 'name', 'twitter:description', ogDescription);
  html = ensureMeta(html, 'name', 'twitter:image', ogImage);
  return html;
}

let changed = 0;
let beforeBytes = 0;
let afterBytes = 0;
const files = await walk();
for (const file of files) {
  const before = await readFile(file, 'utf8');
  let html = before;
  beforeBytes += Buffer.byteLength(before);

  if (sitePath(file) === '/') html = hardenHomepage(html);
  if (sitePath(file) === '/plan-my-journey/') html = optimizePlanMyJourney(html);
  html = replaceEmbeddedImages(html);
  html = normalizeImages(html);
  html = normalizeBlankLinks(html);
  html = ensureDeferredMainScript(html);
  html = ensureSeo(html, file);

  afterBytes += Buffer.byteLength(html);
  if (html !== before) {
    await writeFile(file, html);
    changed++;
  }
}

const homeStats = await stat('index.html');
console.log(`Technical hardening processed ${files.length} HTML files; changed ${changed}.`);
console.log(`HTML payload: ${beforeBytes} -> ${afterBytes} bytes.`);
console.log(`Homepage HTML after hardening: ${homeStats.size} bytes.`);
