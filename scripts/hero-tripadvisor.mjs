import fs from 'node:fs';

const TA='https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html';
const CSS='/assets/css/hero-tripadvisor.css';

const targets=[
  ['index.html','home'],
  ['journeys-beyond-varanasi/index.html','page'],
  ['tours/index.html','tours'],
  ['blogs/index.html','page'],
  ['experiences/index.html','experiences']
];

const badge=`<!-- TV_HERO_TRIPADVISOR_START -->
<a class="tv-hero-tripadvisor" href="${TA}" target="_blank" rel="noopener" aria-label="Read Tour Varanasi reviews on Tripadvisor">
  <span class="tv-hero-tripadvisor-logo"><img src="/tripadvisor-logo.png" alt="Tripadvisor" width="104" height="27" loading="eager" decoding="async"/></span>
  <span class="tv-hero-tripadvisor-copy"><strong>Traveller reviews on Tripadvisor</strong><small>Independent guest feedback ↗</small></span>
</a>
<!-- TV_HERO_TRIPADVISOR_END -->`;

function clean(html){
  html=html.replace(/<!-- TV_HERO_TRIPADVISOR_START -->[\s\S]*?<!-- TV_HERO_TRIPADVISOR_END -->/g,'');
  html=html.replace(/<a\b[^>]*class=["'][^"']*tv-nav-tripadvisor[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
  return html;
}

function ensureCss(html){
  if(html.includes(CSS)) return html;
  return html.replace(/<\/head>/i,`<link rel="stylesheet" href="${CSS}">\n</head>`);
}

function addHome(html){
  const re=/(<div class="hero-actions">[\s\S]*?<\/div>)/i;
  if(!re.test(html)) throw new Error('Homepage hero-actions not found');
  return html.replace(re,`$1\n    ${badge}`);
}
function addPageHero(html){
  const re=/(<div class="page-hero">[\s\S]*?<div class="copy">[\s\S]*?<p>[\s\S]*?<\/p>)(<\/div><\/div><\/div>)/i;
  if(!re.test(html)) throw new Error('page-hero copy not found');
  return html.replace(re,`$1\n${badge}$2`);
}
function addTours(html){
  const re=/(<section class="tours-hero"[^>]*>[\s\S]*?<div class="tours-hero-copy">[\s\S]*?<p>[\s\S]*?<\/p>)(<\/div><\/section>)/i;
  if(!re.test(html)) throw new Error('Tours hero copy not found');
  return html.replace(re,`$1\n${badge}$2`);
}
function addExperiences(html){
  const re=/(<section class="experiences-hero"[^>]*>[\s\S]*?<div class="hero-copy">[\s\S]*?<p>[\s\S]*?<\/p>)(<\/div><\/section>)/i;
  if(!re.test(html)) throw new Error('Experiences hero copy not found');
  return html.replace(re,`$1\n${badge}$2`);
}

let changed=0;
for(const [file,type] of targets){
  let html=fs.readFileSync(file,'utf8');
  const original=html;
  html=clean(html);
  html=ensureCss(html);
  if(type==='home') html=addHome(html);
  else if(type==='page') html=addPageHero(html);
  else if(type==='tours') html=addTours(html);
  else if(type==='experiences') html=addExperiences(html);
  fs.writeFileSync(file,html);
  if(html!==original) changed++;
}
console.log(`Tripadvisor hero badge applied to ${changed} landing pages.`);
