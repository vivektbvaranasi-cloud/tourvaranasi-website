import fs from 'node:fs';
import path from 'node:path';

const measurementId = process.env.GA4_MEASUREMENT_ID || '';
if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) throw new Error('Invalid GA4_MEASUREMENT_ID');
const names = ['journey-enquiry','plan-my-journey','destination-enquiry','sacred-tour-enquiry','service-standards-enquiry'];
const sourceFields = ['source_page','landing_page','enquiry_origin_page','referring_domain','utm_source','utm_medium','utm_campaign'];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (['.git','.netlify','node_modules','tests'].includes(entry.name)) continue;
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) files.push(file);
  }
}
walk('.');
const fieldNames = html => [...html.matchAll(/<(?:input|select|textarea)\b[^>]*\bname=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
const formName = tag => tag.match(/\bname=["']([^"']+)["']/i)?.[1];
const union = Object.fromEntries(names.map(n=>[n,new Set(sourceFields)]));
for (const file of files) {
  for (const match of fs.readFileSync(file,'utf8').matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const name = formName(match[1]);
    if (union[name]) fieldNames(match[2]).forEach(f=>union[name].add(f));
  }
}
// main.js enhances the About form after load; register those fields too.
['accommodation-required','special-requirements'].forEach(f=>union['journey-enquiry'].add(f));
let pages=0, forms=0;
for (const file of files) {
  let html=fs.readFileSync(file,'utf8');
  if (!/<body\b/i.test(html) || !html.includes('/assets/js/main.js')) continue;
  html=html.replace(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi,(whole,attrs,body)=>{
    const name=formName(attrs); if (!union[name]) return whole;
    const present=new Set(fieldNames(body));
    const route='/' + file.replaceAll(path.sep,'/').replace(/index\.html$/,'');
    const hidden=[...union[name]].filter(f=>!present.has(f)).map(f=>`<input type="hidden" name="${f}" value="${f==='source_page'?route:''}"/>`).join('');
    forms++; return `<form${attrs}>${body}${hidden}</form>`;
  });
  html=html.replace(/<script[^>]*\bid="tv-analytics-config"[^>]*>[\s\S]*?<\/script>\s*/gi,'')
    .replace(/<script[^>]*src=["']\/assets\/js\/analytics\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
  const scripts=`<script id="tv-analytics-config">window.TV_ANALYTICS_CONFIG=${JSON.stringify({measurementId})};</script>\n<script defer src="/assets/js/analytics.js"></script>\n`;
  html=html.replace(/<\/body>/i,scripts+'</body>');
  fs.writeFileSync(file,html); pages++;
}
console.log(`Enquiry attribution registered on ${forms} forms; tracking included on ${pages} pages. GA4 ${measurementId?'configured':'awaiting measurement ID'}.`);
