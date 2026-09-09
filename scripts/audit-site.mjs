import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT='.';
const SITE='https://www.tourvaranasi.com';
const SKIP=new Set(['.git','.netlify','node_modules']);
const errors=[];
const warnings=[];

async function walk(dir='.'){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(SKIP.has(entry.name)) continue;
    const p=join(dir,entry.name);
    if(entry.isDirectory()) out.push(...await walk(p));
    else if(entry.isFile()) out.push(p);
  }
  return out;
}

function posix(p){return p.split(sep).join('/');}
function pageUrl(file){
  const p=posix(relative(ROOT,file));
  if(p==='index.html') return '/';
  if(p.endsWith('/index.html')) return `/${p.slice(0,-'index.html'.length)}`;
  return `/${p}`;
}
function attrs(tag){
  const map=new Map();
  const re=/([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let m; while((m=re.exec(tag))) map.set(m[1].toLowerCase(),m[3]);
  return map;
}
function metas(html){return [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));}
function metaValue(html,type,key){
  const a=metas(html).find(x=>(x.get(type)||'').toLowerCase()===key.toLowerCase());
  return a?.get('content')||'';
}
function hasMeta(html,type,key){return Boolean(metaValue(html,type,key).trim());}
function countMeta(html,type,key){return metas(html).filter(a=>(a.get(type)||'').toLowerCase()===key.toLowerCase()).length;}
function decodeHtml(value){return value.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");}
function localSourceFromCdn(src){
  const decoded=decodeHtml(src);
  if(!decoded.startsWith('/.netlify/images?')) return null;
  const q=decoded.slice(decoded.indexOf('?')+1);
  const params=new URLSearchParams(q);
  return params.get('url');
}
async function existsLocal(url){
  if(!url || !url.startsWith('/')) return true;
  let clean=decodeURIComponent(url.split('#')[0].split('?')[0]);
  if(clean==='/') clean='/index.html';
  let path=`.${clean}`;
  try{
    const s=await stat(path);
    if(s.isDirectory()) path=join(path,'index.html');
    await stat(path); return true;
  }catch{
    if(!clean.endsWith('/') && !/\.[a-z0-9]{2,6}$/i.test(clean)){
      try{await stat(`.${clean}/index.html`);return true;}catch{}
    }
    return false;
  }
}

const files=await walk();
const htmlFiles=files.filter(f=>f.endsWith('.html'));
const cssFiles=files.filter(f=>f.endsWith('.css'));
const redirectText=await readFile('_redirects','utf8');
const redirectSources=new Set(redirectText.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>l.split(/\s+/)[0]));

for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const url=pageUrl(file);
  const isVerification=/^\/google[a-z0-9]+\.html$/i.test(url);
  if(isVerification) continue;

  const is404=url==='/404.html';
  const robotsContent=metaValue(html,'name','robots').toLowerCase();
  const isNoindex=robotsContent.includes('noindex');
  const title=(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'').trim();
  if(!title) errors.push(`${url}: missing <title>`);
  if(!/<meta\b[^>]*name=["']viewport["']|<meta\b[^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*name=["']viewport["']/i.test(html)) errors.push(`${url}: missing viewport meta`);

  if(is404){
    if(!isNoindex) errors.push('/404.html: must be noindex');
  }else if(isNoindex){
    const canon=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    if(canon.length>1) errors.push(`${url}: multiple canonicals on noindex page`);
  }else{
    for(const [type,key] of [['name','description'],['name','robots'],['property','og:type'],['property','og:title'],['property','og:description'],['property','og:url'],['property','og:image'],['name','twitter:card'],['name','twitter:title'],['name','twitter:description'],['name','twitter:image']]){
      if(!hasMeta(html,type,key)) errors.push(`${url}: missing ${key}`);
    }
    const canon=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    if(canon.length!==1) errors.push(`${url}: expected 1 canonical, found ${canon.length}`);
  }

  for(const [type,key] of [['name','description'],['property','og:title'],['property','og:description'],['property','og:url'],['property','og:image'],['name','twitter:card']]){
    if(countMeta(html,type,key)>1) warnings.push(`${url}: duplicate ${key} metadata`);
  }
  if(/data:image\//i.test(html)) errors.push(`${url}: embedded data-image still present`);
  if(/http:\/\//i.test(html.replaceAll('http://www.w3.org',''))) warnings.push(`${url}: contains non-HTTPS URL`);
  const ids=[...html.matchAll(/\bid=(["'])(.*?)\1/gi)].map(m=>m[2]);
  const dupIds=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(dupIds.length) warnings.push(`${url}: duplicate ids ${dupIds.join(', ')}`);
  for(const m of html.matchAll(/<img\b[^>]*>/gi)){
    const a=attrs(m[0]);
    const src=a.get('src')||'';
    if(!a.has('alt')) warnings.push(`${url}: image missing alt (${src.slice(0,80)})`);
    if(!a.has('decoding')) warnings.push(`${url}: image missing decoding=async (${src.slice(0,80)})`);
    const local=localSourceFromCdn(src)||src;
    if(local.startsWith('/') && !(await existsLocal(local))) errors.push(`${url}: missing image ${local}`);
  }
  for(const m of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)){
    const href=decodeHtml(m[2]);
    if(!href.startsWith('/') || href.startsWith('//')) continue;
    if(href.startsWith('/.netlify/')) continue;
    const clean=href.split('#')[0].split('?')[0];
    if(!clean) continue;
    if(!(await existsLocal(clean)) && !redirectSources.has(clean) && !redirectSources.has(clean.endsWith('/')?clean.slice(0,-1):`${clean}/`)){
      errors.push(`${url}: broken internal link ${href}`);
    }
  }
  const mainScripts=[...html.matchAll(/<script\b[^>]*src=(["'])\/assets\/js\/main\.js\1[^>]*><\/script>/gi)];
  if(mainScripts.length>1) errors.push(`${url}: duplicate main.js scripts`);
  if(mainScripts.some(m=>!/\bdefer\b/i.test(m[0]))) errors.push(`${url}: main.js must be deferred`);
}

for(const file of cssFiles){
  const css=await readFile(file,'utf8');
  for(const m of css.matchAll(/url\((['"]?)(\/[^)'"?#]+)(?:\?[^)'"#]*)?\1\)/gi)){
    const src=m[2];
    if(src.startsWith('/.netlify/')) continue;
    if(!(await existsLocal(src))) errors.push(`${posix(file)}: missing CSS asset ${src}`);
  }
}

const homeSize=(await stat('index.html')).size;
if(homeSize>100000) errors.push(`Homepage HTML too large after hardening: ${homeSize} bytes`);

const sitemap=await readFile('sitemap.xml','utf8');
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const duplicateLocs=[...new Set(locs.filter((v,i)=>locs.indexOf(v)!==i))];
if(duplicateLocs.length) errors.push(`Duplicate sitemap URLs: ${duplicateLocs.join(', ')}`);
if(!sitemap.includes(`${SITE}/blogs/`)) warnings.push('Sitemap does not contain blog hub URL');
const robots=await readFile('robots.txt','utf8');
if(!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) errors.push('robots.txt sitemap declaration is missing or incorrect');

console.log(`Technical audit checked ${htmlFiles.length} HTML files and ${cssFiles.length} CSS files.`);
console.log(`Homepage HTML: ${homeSize} bytes.`);
if(warnings.length){
  console.log(`Warnings (${warnings.length}):`);
  for(const w of warnings.slice(0,40)) console.log(`  - ${w}`);
  if(warnings.length>40) console.log(`  ... ${warnings.length-40} more warnings`);
}
if(errors.length){
  console.error(`Errors (${errors.length}):`);
  for(const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Technical audit passed with no blocking errors.');
