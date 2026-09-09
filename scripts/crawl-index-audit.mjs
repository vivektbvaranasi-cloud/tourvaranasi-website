import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE='https://www.tourvaranasi.com';
const SKIP=new Set(['.git','.netlify','node_modules']);
const errors=[];
const warnings=[];

async function walk(dir='.'){
  const out=[];
  for(const e of await readdir(dir,{withFileTypes:true})){
    if(SKIP.has(e.name)) continue;
    const p=join(dir,e.name);
    if(e.isDirectory()) out.push(...await walk(p));
    else if(e.isFile()&&e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function posix(p){return p.split(sep).join('/');}
function pagePath(file){
  const p=posix(relative('.',file));
  if(p==='index.html') return '/';
  if(p.endsWith('/index.html')) return `/${p.slice(0,-'index.html'.length)}`;
  return `/${p}`;
}
function attrs(tag){
  const m=new Map(), re=/([:\w-]+)\s*=\s*(["'])(.*?)\2/g; let x;
  while((x=re.exec(tag))) m.set(x[1].toLowerCase(),x[3]);
  return m;
}
function meta(html,name){
  for(const x of html.matchAll(/<meta\b[^>]*>/gi)){
    const a=attrs(x[0]);
    if((a.get('name')||'').toLowerCase()===name.toLowerCase()) return a.get('content')||'';
  }
  return '';
}
function canonical(html){
  for(const x of html.matchAll(/<link\b[^>]*>/gi)){
    const a=attrs(x[0]);
    if((a.get('rel')||'').toLowerCase().split(/\s+/).includes('canonical')) return a.get('href')||'';
  }
  return '';
}
function normalize(url){
  try{
    const u=new URL(url,SITE);
    u.hash=''; u.search='';
    if(u.pathname!=='/'&&!u.pathname.endsWith('/')&&!/\.[a-z0-9]{2,6}$/i.test(u.pathname)) u.pathname+='/';
    return u.href;
  }catch{return '';}
}
async function existsPath(url){
  try{
    const u=new URL(url);
    let p=decodeURIComponent(u.pathname);
    if(p==='/') p='/index.html';
    let f=`.${p}`;
    const s=await stat(f);
    if(s.isDirectory()) f=join(f,'index.html');
    await stat(f); return true;
  }catch{
    try{
      const u=new URL(url); let p=decodeURIComponent(u.pathname);
      if(!p.endsWith('/')) p+='/';
      await stat(`.${p}index.html`); return true;
    }catch{return false;}
  }
}

const files=await walk();
const pages=[];
for(const file of files){
  const html=await readFile(file,'utf8');
  const path=pagePath(file);
  if(/^\/google[a-z0-9]+\.html$/i.test(path)) continue;
  const robots=meta(html,'robots').toLowerCase();
  const refresh=/<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)||/<meta\b[^>]*content=["'][^"']*url=[^"']*["'][^>]*http-equiv=["']refresh["']/i.test(html);
  const indexable=path!=='/404.html'&&!robots.includes('noindex')&&!refresh;
  const canon=normalize(canonical(html)||`${SITE}${path}`);
  pages.push({file,path,html,indexable,canon});
}

const sitemap=await readFile('sitemap.xml','utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>normalize(m[1])).filter(Boolean);
const sitemapSet=new Set(sitemapUrls);
if(sitemapSet.size!==sitemapUrls.length) errors.push('Sitemap contains duplicate canonical URLs.');

const indexable=pages.filter(p=>p.indexable);
const canonMap=new Map(indexable.map(p=>[p.canon,p]));
for(const p of indexable){
  if(!p.canon.startsWith(SITE)) errors.push(`${p.path}: canonical points outside ${SITE}`);
  if(!sitemapSet.has(p.canon)) errors.push(`${p.path}: indexable canonical missing from sitemap (${p.canon})`);
}
for(const loc of sitemapSet){
  if(!loc.startsWith(SITE)) { errors.push(`Sitemap contains external URL ${loc}`); continue; }
  if(!(await existsPath(loc))) errors.push(`Sitemap URL has no local page: ${loc}`);
  const p=canonMap.get(loc);
  if(!p) errors.push(`Sitemap URL is not a canonical indexable page: ${loc}`);
}

const inbound=new Map([...sitemapSet].map(u=>[u,0]));
for(const p of indexable){
  for(const m of p.html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)){
    const href=m[2].replaceAll('&amp;','&');
    if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:')) continue;
    const resolved=normalize(href);
    if(resolved.startsWith(SITE)&&inbound.has(resolved)) inbound.set(resolved,inbound.get(resolved)+1);
  }
}
for(const [url,count] of inbound){
  if(url===`${SITE}/`) continue;
  if(count===0) warnings.push(`Orphan candidate: ${url} has no internal links from other indexable pages.`);
}

console.log(`Crawl/index audit: ${indexable.length} canonical indexable pages; ${sitemapSet.size} sitemap URLs.`);
if(warnings.length){
  console.log(`Crawl warnings (${warnings.length}):`);
  for(const w of warnings.slice(0,30)) console.log(`  - ${w}`);
  if(warnings.length>30) console.log(`  ... ${warnings.length-30} more`);
}
if(errors.length){
  console.error(`Crawl/index errors (${errors.length}):`);
  for(const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Crawl/index audit passed with no blocking errors.');
