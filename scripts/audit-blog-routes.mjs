import { readFile, stat } from 'node:fs/promises';

const hub=await readFile('blogs/index.html','utf8');
const hrefs=[...hub.matchAll(/href=["']((?:\/blogs\/post\/|\/travel-guide\/)[^"'?#]+)["']/gi)].map(m=>m[1]);
const urls=[...new Set(hrefs.map(u=>u.endsWith('/')?u:u+'/'))].sort();

const errors=[];
if(urls.length!==24) errors.push(`Blog hub exposes ${urls.length} unique article routes; expected 24.`);

async function exists(file){
  try{ const s=await stat(file); return s.isFile(); }catch{return false;}
}

for(const url of urls){
  const file='.'+url+'index.html';
  if(!(await exists(file))){
    errors.push(`${url}: generated file missing (${file})`);
    continue;
  }
  const html=await readFile(file,'utf8');
  const canonical='https://www.tourvaranasi.com'+url;

  if(!/<title>[\s\S]*?<\/title>/i.test(html)) errors.push(`${url}: missing title`);
  if(!/<meta\b[^>]*name=["']description["'][^>]*>/i.test(html) && !/<meta\b[^>]*content=["'][^"']+["'][^>]*name=["']description["']/i.test(html)) errors.push(`${url}: missing meta description`);
  if(!html.includes(canonical)) errors.push(`${url}: canonical URL missing or mismatched`);
  if(!html.includes('section class="section narrow prose"') && !html.includes("section class='section narrow prose'")) errors.push(`${url}: article prose section missing`);
  if(!html.includes('/assets/js/main.js')) errors.push(`${url}: shared main.js missing`);
  if(!html.includes('tvf-footer')) errors.push(`${url}: canonical footer missing`);
  if(!html.includes('/assets/css/unified-footer.css')) errors.push(`${url}: unified footer stylesheet missing`);
}

console.log(`Blog route audit checked ${urls.length} article routes.`);
if(errors.length){
  console.error(`Blog route errors (${errors.length}):`);
  for(const e of errors) console.error('  - '+e);
  process.exit(1);
}
console.log('All blog hub article routes resolve to generated HTML with required shell assets.');
