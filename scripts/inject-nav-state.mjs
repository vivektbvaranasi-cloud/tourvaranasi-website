import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const skip=new Set(['.git','.netlify','node_modules']);
async function walk(dir='.'){
  const out=[];
  for(const ent of await readdir(dir,{withFileTypes:true})){
    if(skip.has(ent.name)) continue;
    const p=join(dir,ent.name);
    if(ent.isDirectory()) out.push(...await walk(p));
    else if(ent.isFile()&&ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const tag='<script defer src="/assets/js/nav-state.js"></script>';
let changed=0;
for(const file of await walk()){
  let html=await readFile(file,'utf8');
  if(html.includes('/assets/js/nav-state.js')) continue;
  if(html.includes('</body>')) html=html.replace('</body>',`${tag}</body>`);
  else html+=tag;
  await writeFile(file,html);
  changed++;
}
console.log(`Navigation state script injected into ${changed} HTML files.`);
