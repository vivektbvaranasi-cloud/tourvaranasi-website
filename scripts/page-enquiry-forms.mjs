import fs from 'node:fs';
import path from 'node:path';
const {experiences}=JSON.parse(fs.readFileSync('scripts/refresh-content.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&nbsp;',' ');
const generic={
 'about-tour-varanasi/index.html':['A private journey with Tour Varanasi','Please help me plan a private journey with your local team.'],
 'about-us/index.html':['A private journey with Tour Varanasi','Please help me plan a private journey with your local team.'],
 'tour-varanasi-contact/index.html':['A private journey with Tour Varanasi','Please help me plan a private journey with your local team.'],
 'reviews/index.html':['A private journey with Tour Varanasi','I have been reading your guest reviews and would like help planning a private journey.'],
 'gallery/index.html':['A journey inspired by your gallery','I would like to include some of the places and experiences in your gallery. Please help me plan.'],
 'blogs/index.html':['A trip inspired by your travel guides','I have been reading your travel guides and would like help planning my visit.'],
 'service-standards/index.html':['Private travel with your local team','Please help me plan a private journey. I would like to discuss the arrangements with your local team.'],
 'journeys-beyond-varanasi/index.html':['A journey beyond Varanasi','Please help me choose a route beyond Varanasi and prepare a quotation.']
};
function walk(dir='.') {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||['node_modules','scripts','tests'].includes(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.html')?[path.join(dir,e.name)]:[])}
let total=0;
for(const file of walk()) {
 if(file==='plan-my-journey/index.html')continue;
 let html=fs.readFileSync(file,'utf8');let index=0;
 const title=plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'A private journey');
 const route='/'+file.replace(/index\.html$/,'');
 const experience=experiences.find(e=>e.url===route);
 const isDestination=file.startsWith('destinations/');
 const interest=generic[file]?.[0]||(isDestination?`${title} private visit`:title);
 const draft=generic[file]?.[1]||(isDestination?`Please help me plan a private visit to ${title} and share a quotation.`:`Please share availability and a quotation for this ${experience?'experience':'tour'}.`);
 const duration=experience?.duration||title.match(/\b\d+\s+Days?\b/i)?.[0]||(/\bone day\b|same.day/i.test(title)?'1 day':'');
 html=html.replace(/<form\b([^>]*)>[\s\S]*?<\/form>/gi,(whole,attrs)=>{
  if(!/\b(?:data-)?netlify(?:=|\s)/i.test(attrs))return whole;
  if(/data-compact-enquiry="true"/.test(attrs))return whole;
  const name=attrs.match(/\bname=["']([^"']+)["']/i)?.[1];if(!name||name==='plan-my-journey')return whole;
  const id=`page-enquiry-${++index}`;total++;
  return `<form class="quote-form page-enquiry-form" name="${esc(name)}" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="company-website" data-page-enquiry="true">
<input type="hidden" name="form-name" value="${esc(name)}"><input type="hidden" name="source_page" value="${esc(route)}"><input type="hidden" name="email"><input type="hidden" name="phone">
<p class="hp" hidden><label>Leave this empty<input name="company-website" tabindex="-1" autocomplete="off"></label></p>
<div class="full page-enquiry-context"><label for="${id}-interest">${isDestination?'Your destination':experience?'Your experience':generic[file]?'Your enquiry':'Your tour'}${duration?` <span class="page-enquiry-duration">${esc(duration)}</span>`:''}</label><input id="${id}-interest" name="journey-interest" value="${esc(interest)}" required aria-describedby="${id}-hint"><p id="${id}-hint" class="page-enquiry-hint">Already selected for you. You can change it here.</p></div>
<div><label for="${id}-dates">Travel dates <span>(if known)</span></label><input id="${id}-dates" name="travel-dates" placeholder="Dates or approximate month"></div>
<div><label for="${id}-guests">Number of guests <span>(if known)</span></label><input id="${id}-guests" name="travellers" placeholder="e.g. 2 adults and 1 child"></div>
<div><label for="${id}-name">Your name</label><input id="${id}-name" name="name" autocomplete="name" required></div>
<div><label for="${id}-contact">Email or WhatsApp number</label><input id="${id}-contact" name="contact" required placeholder="Email, or number with country code" aria-describedby="${id}-contact-hint"><small id="${id}-contact-hint" class="page-enquiry-hint">Just one way to reach you is enough.</small></div>
<div class="full"><label for="${id}-message">Your message <span>— ready to send or edit</span></label><textarea id="${id}-message" name="message" rows="3">${esc(draft)}</textarea></div>
<div class="full"><button type="submit">${experience?'Plan my experience':isDestination?'Plan my visit':'Help plan my trip'}</button><p class="page-enquiry-hint">No obligation to book. Our local team will reply personally. <a href="/privacy-policy/">Privacy policy</a></p></div>
</form>`;
 });
 if(!index)continue;
 html=html.replace(/<link\b[^>]*href=["']\/assets\/css\/page-enquiry\.css[^"']*["'][^>]*>\s*/g,'').replace('</head>','<link rel="stylesheet" href="/assets/css/page-enquiry.css">\n</head>');
 fs.writeFileSync(file,html);
}
console.log(`Page-specific enquiry forms: ${total}; Plan My Journey unchanged.`);
