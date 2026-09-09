import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SKIP = new Set(['.git', '.netlify', 'node_modules']);
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap';
const REMOTE_IMAGE_HOSTS = new Set(['images.unsplash.com', 'commons.wikimedia.org', 'upload.wikimedia.org']);

async function walk(dir='.') {
  const out=[];
  for (const e of await readdir(dir,{withFileTypes:true})) {
    if (SKIP.has(e.name)) continue;
    const p=join(dir,e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile() && e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function attrs(tag){
  const map=new Map();
  const re=/([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let m; while((m=re.exec(tag))) map.set(m[1].toLowerCase(),m[3]);
  return map;
}
function decodeHtml(v){return v.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");}
function esc(v){return v.replaceAll('&','&amp;').replaceAll('"','&quot;');}
function ensureHead(html, test, tag){return test(html)?html:html.replace(/<\/head>/i,`${tag}\n</head>`);}

function usesSharedStyle(html){return /href=["']\/(?:assets\/css\/)?style\.css["']/i.test(html);}
function addFontHints(html){
  if (!usesSharedStyle(html)) return html;
  html=ensureHead(html,h=>/rel=["']preconnect["'][^>]*fonts\.googleapis\.com|fonts\.googleapis\.com[^>]*rel=["']preconnect["']/i.test(h),'<link rel="preconnect" href="https://fonts.googleapis.com"/>');
  html=ensureHead(html,h=>/rel=["']preconnect["'][^>]*fonts\.gstatic\.com|fonts\.gstatic\.com[^>]*rel=["']preconnect["']/i.test(h),'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>');
  html=ensureHead(html,h=>/fonts\.googleapis\.com\/css2\?family=Cormorant/i.test(h),`<link rel="stylesheet" href="${esc(FONT_URL)}"/>`);
  return html;
}

function canCdn(src){
  if (src.startsWith('/')) return true;
  try { return REMOTE_IMAGE_HOSTS.has(new URL(src).hostname); } catch { return false; }
}
function cdn(src,width=1920,q=78){
  const clean=decodeHtml(src);
  if (!canCdn(clean)) return clean;
  return `/.netlify/images?url=${encodeURIComponent(clean)}&w=${width}&fm=webp&q=${q}`;
}
function removeImagePreloads(html){
  return html.replace(/<link\b[^>]*\/?\s*>/gi,tag=>{
    const a=attrs(tag);
    const rel=(a.get('rel')||'').toLowerCase().split(/\s+/);
    return rel.includes('preload') && (a.get('as')||'').toLowerCase()==='image' ? '' : tag;
  });
}
function optimizeInlineHero(html){
  const bodyPos=html.search(/<body\b/i);
  if (bodyPos<0) return html;
  let before=html.slice(0,bodyPos), body=html.slice(bodyPos), hero=null;
  body=body.replace(/<[^>]+\bstyle=(["'])(.*?)\1[^>]*>/gis,tag=>{
    if (hero) return tag;
    const sm=tag.match(/\bstyle=(["'])(.*?)\1/is);
    if (!sm) return tag;
    const bg=sm[2].match(/background(?:-image)?\s*:\s*url\(\s*(['"]?)(.*?)\1\s*\)/i);
    if (!bg) return tag;
    const raw=decodeHtml(bg[2].trim());
    if (!raw || raw.startsWith('data:')) return tag;
    const optimized=cdn(raw);
    hero={raw,optimized};
    const newStyle=sm[2].replace(bg[2],esc(optimized));
    return tag.replace(sm[0],`style=${sm[1]}${newStyle}${sm[1]}`);
  });
  if (!hero) return html;
  html=before+body;
  html=removeImagePreloads(html);
  html=ensureHead(html,()=>false,`<link rel="preload" as="image" href="${esc(hero.optimized)}" fetchpriority="high"/>`);
  if (!hero.optimized.startsWith('/') && /^https?:/i.test(hero.optimized)) {
    try {
      const origin=new URL(hero.optimized).origin;
      html=ensureHead(html,h=>h.includes(`href="${origin}"`)&&/rel=["']preconnect["']/i.test(h),`<link rel="preconnect" href="${origin}"/>`);
    } catch {}
  }
  return html;
}

async function stripNestedFontImport(path){
  try {
    const before=await readFile(path,'utf8');
    const after=before.replace(/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?[^'"]*Cormorant[^'"]*['"]\);\s*/i,'');
    if (after!==before) await writeFile(path,after);
  } catch {}
}

await stripNestedFontImport('assets/css/style.css');
await stripNestedFontImport('style.css');

let changed=0, heroes=0;
for (const file of await walk()) {
  const before=await readFile(file,'utf8');
  let html=addFontHints(before);
  const optimized=optimizeInlineHero(html);
  if (optimized!==html) heroes++;
  html=optimized;
  if (html!==before) { await writeFile(file,html); changed++; }
}
console.log(`CWV hardening changed ${changed} HTML files and optimized ${heroes} inline hero backgrounds.`);
