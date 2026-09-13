import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const MARKER_START = '<!-- TV_INTERNAL_LINKS_START -->';
const MARKER_END = '<!-- TV_INTERNAL_LINKS_END -->';

const link = (href, title, text) => ({ href, title, text });

const coreVaranasi = [
  link('/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'A practical first-visit itinerary combining the river, old city, Kashi Vishwanath and Sarnath.'),
  link('/tours/varanasi-tour-in-three-days/', '3 Days Varanasi Tour', 'Choose a slower Varanasi programme with more room for local experiences and cultural depth.'),
  link('/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare one, two and three-day stays before deciding how much time to allow.'),
];

const riverLinks = [
  link('/tours/varanasi-boat-ride/', 'Private Varanasi Boat Ride', 'See how we plan a private sunrise or river experience on the Ganges.'),
  link('/blogs/post/sunrise-boat-ride-varanasi-guide/', 'Sunrise Boat Ride Guide', 'Read practical advice on timing, route, river conditions and what to expect.'),
  link('/blogs/post/ganga-aarti-varanasi-guide/', 'Ganga Aarti Guide', 'Understand the main viewing choices, including balcony, Sankalp seating and river perspectives.'),
];

const sarnathLinks = [
  link('/tours/varanasi-sarnath-tour/', 'Varanasi & Sarnath Tour', 'Combine Varanasi with the principal Buddhist sites at Sarnath in a practical private programme.'),
  link('/blogs/post/sarnath-from-varanasi/', 'Sarnath from Varanasi', 'Plan the visit with realistic travel time, monument sequence and museum opening considerations.'),
  link('/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'See how Sarnath fits naturally into a first-time two-day Varanasi itinerary.'),
];

const buddhistLinks = [
  link('/blogs/post/buddhist-circuit-from-varanasi/', 'Buddhist Circuit from Varanasi', 'Use Varanasi as a gateway to Bodh Gaya, Rajgir, Nalanda and the wider Buddhist circuit.'),
  link('/tours/5-days-varanasi-bodhgaya-tour/', 'Varanasi & Bodh Gaya Journey', 'A private journey connecting the Ganges with Bodh Gaya and the Mahabodhi Temple.'),
  link('/tours/6-days-varanasi-bodhgaya-rajgir-nalanda-patna-tour-1/', 'Bodh Gaya, Rajgir, Nalanda & Patna', 'Continue deeper into the Buddhist circuit with the major Bihar sites.'),
];

const sacredNorthLinks = [
  link('/tours/5-days-varanasi-ayodhya-tour-1/', 'Varanasi & Ayodhya Journey', 'Connect Kashi and Ayodhya with enough time for both cities rather than treating either as a rushed stop.'),
  link('/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/', 'Varanasi, Prayagraj & Ayodhya', 'A private sacred journey linking the Ganges, Triveni Sangam and Ayodhya.'),
  link('/blogs/post/varanasi-prayagraj-ayodhya-itinerary/', 'Varanasi–Prayagraj–Ayodhya Planning Guide', 'Read the practical route, pacing and stay-length advice before choosing an itinerary.'),
];

const experienceLinks = [
  link('/experiences/varanasi-food-walk/', 'Varanasi Food Walk', 'Explore selected local flavours with a guided route through the old-city food lanes.'),
  link('/experiences/banarasi-silk-weaving/', 'Banarasi Silk Weaving', 'Meet the craft tradition behind one of Varanasi’s most recognised cultural legacies.'),
  link('/experiences/death-rebirth-walk/', 'Death & Rebirth Walk', 'Understand the beliefs, rituals and living traditions around Varanasi’s sacred riverfront.'),
];

const trustLinks = [
  link('/about-us/', 'About Tour Varanasi', 'Meet the locally based team planning and operating private journeys since 2016.'),
  link('/reviews/', 'Guest Reviews', 'See what previous travellers say about guides, planning and on-ground support.'),
  link('/service-standards/', 'Our Service Standards', 'Read how we approach private guiding, vehicles, local access and journey support.'),
];

const unique = (items, currentUrl) => {
  const seen = new Set();
  return items.filter((item) => {
    if (item.href === currentUrl || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  }).slice(0, 4);
};

function pageUrl(rel) {
  const normalized = rel.replaceAll('\\', '/');
  if (normalized === 'index.html') return '/';
  return '/' + normalized.replace(/index\.html$/, '');
}

function chooseLinks(rel, html) {
  const url = pageUrl(rel);
  const lower = `${rel} ${html.slice(0, 12000)}`.toLowerCase();
  let items = [];

  if (rel.startsWith('blogs/post/')) {
    if (lower.includes('sunrise-boat') || lower.includes('boat ride')) items.push(...riverLinks, ...coreVaranasi);
    else if (lower.includes('ganga-aarti') || lower.includes('dev-diwali')) items.push(...riverLinks, ...coreVaranasi);
    else if (lower.includes('sarnath')) items.push(...sarnathLinks, ...buddhistLinks);
    else if (lower.includes('buddhist-circuit')) items.push(...buddhistLinks, ...sarnathLinks);
    else if (lower.includes('prayagraj-ayodhya')) items.push(...sacredNorthLinks, ...coreVaranasi);
    else if (lower.includes('food')) items.push(...experienceLinks, ...coreVaranasi);
    else items.push(...coreVaranasi, ...riverLinks, ...experienceLinks);
  } else if (rel.startsWith('tours/')) {
    if (lower.includes('bodhgaya') || lower.includes('buddha') || lower.includes('nalanda') || lower.includes('rajgir') || lower.includes('kushinagar') || lower.includes('lumbini')) {
      items.push(...buddhistLinks, ...sarnathLinks);
    } else if (lower.includes('ayodhya') || lower.includes('prayagraj') || lower.includes('allahabad') || lower.includes('chitrakoot') || lower.includes('lucknow') || lower.includes('naimish')) {
      items.push(...sacredNorthLinks, ...coreVaranasi);
    } else if (lower.includes('sarnath')) {
      items.push(...sarnathLinks, ...buddhistLinks);
    } else if (lower.includes('boat') || lower.includes('aarti') || lower.includes('prayer ceremony')) {
      items.push(...riverLinks, ...coreVaranasi);
    } else {
      items.push(...coreVaranasi, ...riverLinks, ...experienceLinks);
    }
  } else if (rel.startsWith('experiences/')) {
    items.push(...coreVaranasi, ...experienceLinks, ...riverLinks);
  } else if (rel.startsWith('travel-guide/')) {
    items.push(...coreVaranasi, ...riverLinks, ...experienceLinks);
  } else if (rel === 'tours/index.html') {
    items.push(...coreVaranasi, ...sacredNorthLinks, ...buddhistLinks);
  } else if (rel === 'blogs/index.html') {
    items.push(...coreVaranasi, ...riverLinks, ...sarnathLinks);
  } else if (rel === 'experiences/index.html') {
    items.push(...experienceLinks, ...coreVaranasi);
  } else if (rel === 'journeys-beyond-varanasi/index.html') {
    items.push(...sacredNorthLinks, ...buddhistLinks);
  } else if (rel === 'about-us/index.html' || rel === 'reviews/index.html' || rel === 'service-standards/index.html') {
    items.push(...trustLinks, ...coreVaranasi);
  } else {
    return [];
  }

  return unique(items, url);
}

function render(items) {
  if (!items.length) return '';
  return `${MARKER_START}\n<section class="section soft tv-related-links" aria-labelledby="continue-planning"><div class="inner"><div class="eyebrow">Continue planning</div><h2 id="continue-planning">Useful next pages</h2><p class="lede">Explore the most relevant journeys and practical guides for this part of your trip.</p><div class="grid grid-2">${items.map((item) => `<div class="feature"><h3><a href="${item.href}">${item.title}</a></h3><p>${item.text}</p></div>`).join('')}</div></div></section>\n${MARKER_END}`;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name === 'index.html') out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(root)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, 'g'), '');
  const items = chooseLinks(rel, html);
  if (!items.length) continue;
  const block = render(items);
  const insertionPoints = ['<section class="quote-wrap"', '<footer', '</body>'];
  let inserted = false;
  for (const point of insertionPoints) {
    const index = html.indexOf(point);
    if (index !== -1) {
      html = html.slice(0, index) + block + '\n' + html.slice(index);
      inserted = true;
      break;
    }
  }
  if (!inserted) continue;
  fs.writeFileSync(file, html);
  changed += 1;
}

console.log(`Internal linking: updated ${changed} pages with contextual related links.`);
