import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SKIP=new Set(['.git','.netlify','node_modules']);
const errors=[];
const warnings=[];

async function walk(dir='.'){
  const out=[];
  for(const e of await readdir(dir,{withFileTypes:true})){
    if(SKIP.has(e.name)) continue;
    const p=join(dir,e.name);
    if(e.isDirectory()) out.push(...await walk(p));
    else if(e.isFile()) out.push(p);
  }
  return out;
}
function posix(p){return p.split(sep).join('/');}
function pagePath(file){
  const p=posix(relative('.',file));
  if(p==='index.html') return '/';
  if(p.endsWith('/index.html')) return '/'+p.slice(0,-'index.html'.length);
  return '/'+p;
}
function hrefs(html){
  return [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>|<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi)]
    .map(m=>m[1]||m[2]).filter(Boolean);
}

const files=await walk();
const htmlFiles=files.filter(f=>f.endsWith('.html'));
let checked=0;

for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const url=pagePath(file);
  if(/^\/google[a-z0-9]+\.html$/i.test(url)) continue;
  checked++;

  if(!/<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html) &&
     !/<meta\b[^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*name=["']viewport["']/i.test(html)){
    errors.push(url+': missing responsive viewport');
  }

  const css=hrefs(html);
  const white=css.filter(x=>x.startsWith('/assets/css/white-theme.css'));
  if(white.length!==1) errors.push(url+': expected exactly one final white-theme stylesheet, found '+white.length);
  if(css.length && !css.at(-1)?.startsWith('/assets/css/white-theme.css')){
    errors.push(url+': white-theme.css is not the final stylesheet');
  }

  // Catch accidental fixed-width inline desktop canvases.
  for(const m of html.matchAll(/style=(["'])(.*?)\1/gi)){
    const style=m[2];
    const w=style.match(/(?:^|;)\s*(?:min-)?width\s*:\s*(\d{4,})px/i);
    if(w) errors.push(url+': suspicious inline fixed width '+w[1]+'px');
    if(/width\s*:\s*[^;]*100vw[^;]*\+|width\s*:\s*calc\([^)]*100vw[^)]*\+/i.test(style)){
      errors.push(url+': inline width can exceed viewport');
    }
  }

  if(url==='/'){
    if(!html.includes('class="hero-video"')) errors.push('/: homepage hero video missing');
    if(!html.includes("matchMedia('(min-width:901px)')")) warnings.push('/: desktop-only hero video breakpoint not found');
  }
}


// No black or near-black solid UI backgrounds anywhere in CSS.
// Dark tones are allowed for text and transparent photo overlays only.
const cssFiles=files.filter(f=>f.endsWith('.css'));
for(const file of cssFiles){
  const css=await readFile(file,'utf8');
  const darkBg=/background(?:-color)?\s*:\s*#(?:000(?:000)?|111(?:111)?|181b19|1d211f|22211f|252a27|292c29|302d33|3e3934)\b/ig;
  const matches=[...css.matchAll(darkBg)];
  if(matches.length){
    errors.push(posix(file)+': black/near-black solid background detected ('+matches[0][0]+')');
  }
}

const theme=await readFile('assets/css/white-theme.css','utf8');

for(const required of [
  '--tv-white:#ffffff',
  '--tv-ink:#3e3934',
  '--tv-accent:#9a8265',
  'background:#6b625a!important',
  'background:#25D366!important'
]){
  if(!theme.includes(required)) errors.push('white-theme.css missing required token/rule: '+required);
}

if(/(?:\.btn|\.button|\.nav-cta)[^{]*\{[^}]*background\s*:\s*(?:#000(?:000)?|#111(?:111)?|#22211f)/is.test(theme)){
  errors.push('white-theme.css: black primary action detected');
}
if(/(?:tvf-footer|footer\.footer|\.footer)[^{]*\{[^}]*background\s*:\s*(?:#000(?:000)?|#111(?:111)?|#22211f)/is.test(theme)){
  errors.push('white-theme.css: black footer detected');
}
if(/^\s*section\s*,/m.test(theme)){
  errors.push('white-theme.css: blanket section selector detected; this can break photo heroes/layouts');
}

console.log('Visual consistency audit checked '+checked+' HTML pages.');
if(warnings.length){
  console.log('Visual warnings ('+warnings.length+'):');
  for(const w of warnings) console.log('  - '+w);
}
if(errors.length){
  console.error('Visual consistency errors ('+errors.length+'):');
  for(const e of errors) console.error('  - '+e);
  process.exit(1);
}
console.log('Visual consistency audit passed.');
