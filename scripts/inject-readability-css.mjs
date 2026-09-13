import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const href = '/assets/css/readability.css';
const tag = `<link rel="stylesheet" href="${href}">`;
const skip = new Set(['.git','.netlify','node_modules']);

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...walk(full));
    else if(entry.isFile()&&entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let changed=0;
for(const file of walk(root)){
  let html=fs.readFileSync(file,'utf8');
  if(html.includes(href)) continue;
  const original=html;

  const styleLink=/<link\b[^>]*href=["']\/assets\/css\/style\.css["'][^>]*>/i;
  if(styleLink.test(html)) html=html.replace(styleLink,(m)=>`${m}\n${tag}`);
  else if(/<\/head>/i.test(html)) html=html.replace(/<\/head>/i,`${tag}\n</head>`);

  if(html!==original){
    fs.writeFileSync(file,html);
    changed+=1;
  }
}

console.log(`Readability stylesheet injected into ${changed} HTML files.`);
