// Run after page generation/SEO edits, before form registration and asset versioning.
import fs from 'node:fs';
import { quote } from './verified-reviews.mjs';
const esc = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const twoDay = '/tours/varanasi-tour-in-two-days/';
const circuit = '/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/';
const guide = '/travel-guide/private-tour-guide-varanasi/';
const wa = text => 'https://wa.me/917457905011?text=' + encodeURIComponent(text);
const whatsapp = text => `<a class="tv-quote-button tv-quote-secondary" href="${wa(text)}" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>`;
const review = index => `<div class="tv-quote-review" aria-label="Verified Tour Varanasi guest review">${quote(index)}</div>`;
const marker = body => `<!-- TV_QUOTE_PATH_START -->${body}<!-- TV_QUOTE_PATH_END -->`;
function assets(html) {
  for (const file of ['page-enquiry.css','quote-path.css']) {
    html = html.replace(new RegExp(`<link\\b[^>]*href=["']/assets/css/${file.replace('.', '\\.')}[^"']*["'][^>]*>\\s*`,'g'),'');
    html = html.replace('</head>',`<link rel="stylesheet" href="/assets/css/${file}">\n</head>`);
  }
  return html;
}
function clean(html) { return html.replace(/<!-- TV_QUOTE_PATH_START -->[\s\S]*?<!-- TV_QUOTE_PATH_END -->/g,''); }
function form(route, interest, message, button, dates = '') {
  return `<form class="quote-form page-enquiry-form" name="journey-enquiry" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="company-website" data-page-enquiry="true" data-compact-enquiry="true">
<input type="hidden" name="form-name" value="journey-enquiry"><input type="hidden" name="source_page" value="${route}"><input type="hidden" name="email"><input type="hidden" name="phone">
<p class="hp" hidden><label>Leave this empty<input name="company-website" tabindex="-1" autocomplete="off"></label></p>
<div class="full page-enquiry-context"><label for="quick-interest">Your enquiry</label><input id="quick-interest" name="journey-interest" value="${esc(interest)}" required><p class="page-enquiry-hint">Selected for you; change anything to suit your trip.</p></div>
<div><label for="quick-dates">Travel dates <span>(if known)</span></label><input id="quick-dates" name="travel-dates" value="${dates}" placeholder="Dates or approximate month"></div>
<div><label for="quick-guests">Number of guests <span>(if known)</span></label><input id="quick-guests" name="travellers" placeholder="e.g. 4 adults and 1 child"></div>
<div><label for="quick-name">Your name</label><input id="quick-name" name="name" autocomplete="name" required></div>
<div><label for="quick-contact">Email or WhatsApp number</label><input id="quick-contact" name="contact" required placeholder="Email, or number with country code" aria-describedby="quick-contact-hint"><small id="quick-contact-hint" class="page-enquiry-hint">Just one way to reach you is enough.</small></div>
<div class="full"><label for="quick-message">Your message <span>— ready to send or edit</span></label><textarea id="quick-message" name="message" rows="4">${esc(message)}</textarea></div>
<div class="full"><button type="submit">${button}</button><p class="page-enquiry-hint">No obligation to book. Our local team will reply personally with availability and a quotation. <a href="/privacy-policy/">Privacy policy</a></p></div></form>`;
}
const articles = [
  {route:'/blogs/post/varanasi-in-december/', old:'DECEMBER', title:'Your December visit, planned around your dates', interest:'Private Varanasi tour in December', dates:'December', button:'Get my December itinerary and price',
   text:`<p>Start with our <a href="${twoDay}">two-day private Varanasi tour from ₹8,500 per person</a>, or allow <a href="/tours/varanasi-tour-in-three-days/">three days</a> for more time to rest. The two-day starting price includes GST, with a minimum charge for two guests; hotels are quoted separately.</p><p>Tell us your dates, group size and whether you have booked a hotel. We will suggest the sequence and price for your visit, keeping winter boat plans flexible around visibility and local permission.</p>`,
   message:'Please suggest a private December itinerary and itemised price for Varanasi. Please include a guide, car, Ganga Aarti and Sarnath, with a boat outing if conditions permit. Hotel booked / hotel required: '},
  {route:'/travel-guide/ayodhya-ram-mandir-wheelchair-assistance/', old:'WHEELCHAIR', title:'Plan an Ayodhya visit with assistance for your parents', interest:'Ayodhya visit with wheelchair assistance', button:'Request my assisted Ayodhya plan',
   text:`<p>Private sightseeing wheelchair support with an assistant is listed at <strong>₹3,000 per day, per wheelchair</strong>. Tell us how many chairs you need and what each guest can comfortably manage so we can confirm the arrangements and full quotation.</p><p>This is separate from temple-counter wheelchairs, which remain subject to the temple’s assessment and availability. No queue-free access is promised.</p><p>Choose <a href="/tours/ayodhya-tour-in-two-days/">two days in Ayodhya</a>, or combine it with our <a href="${circuit}">Varanasi–Prayagraj–Ayodhya journey</a>.</p>`,
   message:'Please plan an Ayodhya visit with wheelchair assistance. Number of wheelchairs required: . Walking and step assistance needed: . Arrival city / hotel: . Please confirm private sightseeing assistance, temple-counter procedures, vehicle arrangements and an itemised quotation.'},
  {route:guide, old:'PRIVATE_GUIDE', title:'Choose your private Varanasi guide arrangement', interest:'Private tour guide in Varanasi', button:'Check guide availability and price',
   text:`<p><strong>Guide only:</strong> an indicative ₹3,250–3,500 per day for a standard English-speaking guide, based on recent quotations. Confirm working hours, taxes and availability for your dates.</p><p><strong>Guide with car:</strong> ask for a quotation covering your route and transfers. <strong>Complete two-day tour:</strong> <a href="${twoDay}">from ₹8,500 per person</a>, including GST, with a minimum charge for two guests and hotels separate.</p><p>Boat rides, admissions, Aarti seating and transport are separate from the guide-only fee unless confirmed in writing.</p>`,
   message:'Please check a private English-speaking guide for my dates. Arrangement: guide only / guide with car / complete private tour. Hotel or meeting point: . Preferred visits and walking needs: . Please confirm hours, inclusions, taxes and price.', review:3}
];
for (const p of articles) {
  const file = '.' + p.route + 'index.html';
  let html = clean(fs.readFileSync(file,'utf8'));
  const block = marker(`<aside class="tv-quote-path" id="quick-enquiry" aria-label="${esc(p.title)}"><h2>${p.title}</h2>${p.text}<details><summary>${p.button}</summary>${form(p.route,p.interest,p.message,p.button,p.dates)}</details><div class="tv-quote-actions">${whatsapp(p.message)}</div><p class="tv-quote-note">Already booked your hotel? We can quote just the ground services you need.</p>${p.review !== undefined ? review(p.review) : ''}</aside>`);
  const old = new RegExp(`<!-- TV_SEO_OCT26_${p.old}_START -->[\\s\\S]*?<!-- TV_SEO_OCT26_${p.old}_END -->`);
  // Retain the SEO marker used by existing CI, replacing its generic prompt.
  const wrapper = `<!-- TV_SEO_OCT26_${p.old}_START -->${block}<!-- TV_SEO_OCT26_${p.old}_END -->`;
  if (!old.test(html)) throw new Error('Missing priority placement: ' + file);
  html = html.replace(old,wrapper);
  // Keep article-level quote links on this page and preserve the enquiry context.
  const start = html.indexOf('<section class="section narrow prose"');
  const end = html.indexOf('</section>',start);
  const article = html.slice(start,end).replaceAll('href="/plan-my-journey/"','href="#quick-enquiry"');
  html = html.slice(0,start) + article + html.slice(end);
  fs.writeFileSync(file,assets(html));
}
const sales = [
  {route:twoDay,title:'Two private days from ₹8,500 per person',review:0,
   text:`<p><strong>₹17,000 starting total for two guests, including GST.</strong> A minimum charge for two guests applies, including solo bookings. Hotels are quoted separately.</p><ul><li>Private car and local guide for the listed programme</li><li>Boat ride, listed entrance fees and Ganga Aarti seating</li><li>Old Varanasi, Kashi Vishwanath and Sarnath, adjusted around arrival and departure</li></ul><p class="tv-quote-note">Boating and temple arrangements depend on local conditions and permissions. Optional upgrades and additional experiences are quoted separately. Have your own hotel? We can arrange the ground services.</p><p>Prefer <a href="${guide}">a guide only</a>, or want to <a href="${circuit}">continue to Prayagraj and Ayodhya</a>?</p>`,button:'Get a quote for my two-day tour',message:'Please send availability and a quotation for the two-day private Varanasi tour. Dates: . Guests: . Arrival and departure: . Hotel booked / hotel required: '},
  {route:circuit,title:'One private plan for Varanasi, Prayagraj and Ayodhya',review:2,
   text:`<p><strong>Six days: two nights in Varanasi, one in Prayagraj and two in Ayodhya.</strong> Arrive in Varanasi and depart from Ayodhya, with the sequence adjusted to your travel times.</p><ul><li>Private air-conditioned vehicle for the planned road sectors</li><li>Local English-speaking guiding on sightseeing days</li><li>Varanasi river experience when operating, with local arrival and access support</li></ul><p><strong>Request a total price for your group.</strong> Share your dates, number of guests and hotel preference. Your quotation will specify the vehicle, guide services, hotels if requested, boats, local transfers, temple arrangements and applicable taxes.</p><p class="tv-quote-note">Travelling with parents? We can discuss shorter walks and rest breaks. <a href="/travel-guide/ayodhya-ram-mandir-wheelchair-assistance/">Wheelchair assistance</a> is arranged and priced separately; temple access remains subject to local procedures.</p>`,button:'Get my six-day itinerary and quote',message:'Please send an itemised quotation for six days through Varanasi, Prayagraj and Ayodhya. Dates: . Adults / children: . Arrival and departure: . Hotels booked / hotels required: . Walking or wheelchair assistance needed: '}
];
for (const p of sales) {
  const file = '.' + p.route + 'index.html';
  let html = clean(fs.readFileSync(file,'utf8'));
  if (p.route === twoDay) html = html.replace(/<!-- TV_RATE_START -->[\s\S]*?<!-- TV_RATE_END -->/g,'');
  const block = marker(`<section class="tv-quote-path" aria-label="Private tour overview and quotation"><h2>${p.title}</h2>${p.text}<div class="tv-quote-actions"><a class="tv-quote-button" href="#plan">${p.button}</a>${whatsapp(p.message)}</div><p class="tv-quote-note">No obligation to book. Tell us your dates and group size; our local team will reply personally.</p>${review(p.review)}</section>`);
  const pos = html.indexOf('<section',html.indexOf('</h1>'));
  if (pos < 0 || !html.includes('id="plan"')) throw new Error('Missing sales page anchor: ' + file);
  html = html.slice(0,pos) + block + html.slice(pos);
  html = html.replace('Tell us about your trip.',p.button + '.');
  html = html.replace(/(<textarea\b[^>]*name="message"[^>]*>)[\s\S]*?(<\/textarea>)/,'$1'+esc(p.message)+'$2');
  html = html.replace('Help plan my trip</button>',p.button + '</button>');
  fs.writeFileSync(file,assets(html));
}
console.log('Conversion updates: three sales pages and contextual December / wheelchair quote forms.');
