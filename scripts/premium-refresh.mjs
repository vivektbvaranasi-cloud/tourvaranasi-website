import fs from 'node:fs';
import path from 'node:path';
const data=JSON.parse(fs.readFileSync('scripts/refresh-content.json','utf8'));
const css='/assets/css/premium-refresh.css';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const plain=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const rates={one:'6,500',two:'8,500',three:'10,500'};
const terms='Prices are per person and include GST and the ground arrangements listed in the itinerary. A minimum charge for two guests applies, including solo bookings. Hotels are quoted separately according to your choice.';
function files(dir='.') {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||['node_modules','scripts'].includes(e.name)?[]:e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}
let count=0;
for(const file of files()) {
 let html=fs.readFileSync(file,'utf8');
 // Final shared stylesheet follows all generated styles and stays idempotent.
 html=html.replace(/<link\b[^>]*href=["']\/assets\/css\/premium-refresh\.css[^"']*["'][^>]*>\s*/g,'');
 html=html.replace('</head>',`<link rel="stylesheet" href="${css}">\n</head>`);
 if(file==='index.html') html=html.replace(/<!-- TV_INTERNAL_LINKS_START -->[\s\S]*?<!-- TV_INTERNAL_LINKS_END -->/g,'').replace(/<section\b[^>]*class="home-explore-next"[\s\S]*?<\/section>/g,'');
 if(file==='experiences/index.html') { const hero=html.match(/<section class="experiences-hero"[\s\S]*?<\/section>/)?.[0]||''; html=html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,`<main>${hero}${data.catalogue}</main>`); }
 if(file==='tours/index.html') {
  html=html.replace(/<style id="tv-tours-hero">[\s\S]*?<\/style>/g,'');
  // Use the supplied sunrise photograph as the catalogue's welcome image.
  html=html.replace('</head>',`<style id="tv-tours-hero">.tours-hero{background-image:linear-gradient(90deg,rgba(30,24,35,.62),rgba(30,24,35,.12)),url('/assets/images/user/varanasi-sunrise-boat-homepage.jpg')!important;background-position:center!important}</style></head>`);
 }
 const city=file.match(/^tours\/(varanasi|ayodhya|lucknow)-tour-in-(one|two|three)-days?\/index.html$/);
 if(data.cityItineraries[file]) {
  html=html.replace(/<section\b[^>]*class="[^"]*\b(?:itinerary-section|one-day-itinerary)\b[^"]*"[^>]*>[\s\S]*?<\/section>/,data.cityItineraries[file]);
 }
 // Keep all long-form itinerary details, but put a short overview first.
 if(!city && file.startsWith('tours/')) html=html.replace(/<article\b[^>]*class="itinerary-day"[^>]*>[\s\S]*?<\/article>/g,block=>{
  if(block.includes('day-details')) return block;
  const match=block.match(/(<div class="itinerary-copy">[\s\S]*?<\/h3>)([\s\S]*)(<\/div>\s*<\/article>)$/);
  if(!match)return block;
  const paragraphs=[...match[2].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)];
  if(!paragraphs.length)return block;
  const words=plain(match[2]).split(' ').length;
  if(words<95)return block;
  const text=plain(paragraphs[0][1]);const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];
  let summary='';for(const sentence of sentences){if(summary && (summary+sentence).split(' ').length>65)break;summary+=sentence;}
  return block.replace(match[0],match[1]+`<p>${summary.trim()}</p><details class="day-details"><summary>View day details</summary>${match[2]}</details>`+match[3]);
 });
 if(city) {
  // Remove old pricing panel on reruns, then place the confirmed rate beside enquiry.
  html=html.replace(/<!-- TV_RATE_START -->[\s\S]*?<!-- TV_RATE_END -->/g,'');
  const inclusion=city[1]==='lucknow'?'Private car, local guide and entrance fees for the listed sightseeing.':city[1]==='ayodhya'?'Private transport, local guide and the listed local transport, entrance and darshan arrangements.':'Private car, local guide, boat ride, entrance fees and Aarti seating for the listed programme. Boat operation is subject to river conditions.';
  const panel=`<!-- TV_RATE_START --><section class="section tour-price-panel" aria-label="Tour price"><div class="eyebrow">Your private tour</div><h2>Starting from ₹${rates[city[2]]} <span>per person</span></h2><p class="price-inclusions">${inclusion}</p><p class="price-terms">${terms}</p><p class="price-terms">Optional upgrades and additional experiences are quoted separately.</p><a class="btn primary" href="/plan-my-journey/?tour=${city[1]}-tour-in-${city[2]}-days">Enquire about this tour</a></section><!-- TV_RATE_END -->`;
  const enquiry=/<section\b[^>]*class="[^"]*quote-wrap[^"]*"/;
  if(enquiry.test(html)) html=html.replace(enquiry,m=>panel+m);
  else html=html.replace(/(<section\b[^>]*class="section narrow"[^>]*>\s*<h2>What we can arrange)/,panel+'$1');
  // Old template exclusions conflict with the approved ground-only package.
  html=html.replace(/<p>Hotel accommodation, entrance tickets, meals, local e-rickshaws, special darshan arrangements and optional experiences are quoted separately unless expressly included in your proposal\. Personal expenses and tips are additional\.<\/p>/g,'<p>Hotels are quoted separately according to your choice. Meals, personal expenses, tips and optional upgrades are additional unless included in your confirmed quotation. GST is included.</p>');
 }
 // Add rates only to descriptive cards, never navigation links.
 html=html.replace(/<a\b[^>]*href="\/tours\/(varanasi|ayodhya|lucknow)-tour-in-(one|two|three)-days?\/"[^>]*>[\s\S]*?<\/a>/g,(block,city,days)=>{
  if(!/<h[23]\b/.test(block)||block.includes('tour-card-price'))return block;
  return block.replace('</a>',`<span class="tour-card-price">From ₹${rates[days]} <small>per person · GST included</small></span></a>`);
 });
 if(file==='tours/index.html') html=html.replace(/<a\b[^>]*href="\/tours\/(varanasi|ayodhya|lucknow)-tour-in-(one|two|three)-days?\/"[^>]*>[\s\S]*?<\/a>/g,(block,city,days)=>{
  if(block.includes('tour-card-price')||block.includes('compact-tour-price')||!block.includes('<span>'))return block;
  return block.replace(/<span>[\s\S]*?<\/span>/,`<span class="compact-tour-price">From ₹${rates[days]} per person · GST included</span>`);
 });
 const exp=data.experiences.find(e=>e.url+'index.html'==='/'+file);
 if(exp) {
  // Related tour photographs interrupt the experience narrative; keep these links as text cards.
  html=html.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g,section=>section.includes('experiences-hero')?section:section.replace(/<img\b[^>]*>/g,''));
  if(!html.includes('experience-price-note'))html=html.replace(/(<section\b[^>]*class="[^"]*quote-wrap[^"]*")/,'<section class="section experience-price-note"><h2>Plan your private experience</h2><p>Enquire for pricing. Share your dates and group size for a tailored quotation.</p></section>$1');
 }
 fs.writeFileSync(file,html);count++;
}
console.log(`Premium refresh: ${count} pages, 18 experiences and 9 city tour prices.`);
