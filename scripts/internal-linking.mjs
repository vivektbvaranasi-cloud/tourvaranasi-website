import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const MARKER_START = '<!-- TV_INTERNAL_LINKS_START -->';
const MARKER_END = '<!-- TV_INTERNAL_LINKS_END -->';

const link = (href, title, text, type='guide') => ({ href, title, text, type });

const L = {
  twoDay: link('/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'A practical first-visit itinerary combining the Ganges, old city, Kashi Vishwanath and Sarnath.', 'tour'),
  threeDay: link('/tours/varanasi-tour-in-three-days/', '3 Days Varanasi Tour', 'A slower Varanasi programme with more time for neighbourhoods, food, craft and culture.', 'tour'),
  fourDay: link('/tours/4-days-varanasi-tour/', '4 Days Varanasi Tour', 'Allow more time for the city’s riverfront, temples, Sarnath and local cultural experiences.', 'tour'),
  oneDay: link('/tours/varanasi-tour-in-one-day/', 'Varanasi in One Day', 'A compact private programme for travellers with only one full day in the city.', 'tour'),
  boatTour: link('/tours/varanasi-boat-ride/', 'Private Varanasi Boat Ride', 'Plan a private Ganges boat experience with realistic timing and river-operation considerations.', 'tour'),
  sarnathTour: link('/tours/varanasi-sarnath-tour/', 'Varanasi & Sarnath Tour', 'Combine the living city with Sarnath’s principal Buddhist monuments in one private programme.', 'tour'),
  walkingTour: link('/tours/varanasi-walking-tour/', 'Varanasi Walking Tour', 'Explore the old-city lanes, bazaars and riverfront on foot with a local guide.', 'tour'),
  ayodhyaTour: link('/tours/5-days-varanasi-ayodhya-tour-1/', 'Varanasi & Ayodhya Journey', 'Connect Kashi and Ayodhya with enough time for both cities rather than rushing either one.', 'tour'),
  sacredTour: link('/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/', 'Varanasi, Prayagraj & Ayodhya', 'Link Kashi, Triveni Sangam and Ayodhya in a practical private overland journey.', 'tour'),
  bodhgayaTour: link('/tours/5-days-varanasi-bodhgaya-tour/', 'Varanasi & Bodh Gaya Journey', 'Connect Sarnath and Varanasi with Bodh Gaya and the Mahabodhi Temple.', 'tour'),
  buddhistTour: link('/tours/6-days-varanasi-bodhgaya-rajgir-nalanda-patna-tour-1/', 'Bodh Gaya, Rajgir, Nalanda & Patna', 'Continue deeper into Bihar’s major Buddhist and historic sites.', 'tour'),

  daysGuide: link('/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare one, two, three and longer stays before deciding how much time to allow.', 'guide'),
  sunriseGuide: link('/blogs/post/sunrise-boat-ride-varanasi-guide/', 'Sunrise Boat Ride Guide', 'Read practical advice on timing, route, river conditions and what to expect on the Ganges.', 'guide'),
  aartiGuide: link('/blogs/post/ganga-aarti-varanasi-guide/', 'Ganga Aarti Guide', 'Compare balcony, Sankalp seating and river-viewing options before choosing the right experience.', 'guide'),
  sarnathGuide: link('/blogs/post/sarnath-from-varanasi/', 'Sarnath from Varanasi', 'Plan Sarnath with realistic travel time, monument sequence and museum-opening considerations.', 'guide'),
  buddhistGuide: link('/blogs/post/buddhist-circuit-from-varanasi/', 'Buddhist Circuit from Varanasi', 'Use Varanasi as a gateway to Bodh Gaya, Rajgir, Nalanda and the wider Buddhist circuit.', 'guide'),
  sacredGuide: link('/blogs/post/varanasi-prayagraj-ayodhya-itinerary/', 'Varanasi–Prayagraj–Ayodhya Planning Guide', 'Compare route order, pacing and realistic stay lengths for this sacred North India circuit.', 'guide'),
  foreignGuide: link('/blogs/post/Varanasi-for-Foreigners/', 'Varanasi for International Travellers', 'Practical advice on local customs, movement, temples, river experiences and private touring.', 'guide'),
  stayGuide: link('/blogs/post/where-to-stay-in-varanasi/', 'Where to Stay in Varanasi', 'Compare riverfront, old-city and more accessible hotel locations before choosing a base.', 'guide'),
  bestTimeGuide: link('/blogs/post/best-time-to-visit-varanasi/', 'Best Time to Visit Varanasi', 'Understand weather, festivals, river conditions and seasonal trade-offs before fixing dates.', 'guide'),

  food: link('/experiences/varanasi-food-walk/', 'Varanasi Food Walk', 'Explore selected local flavours on a guided route through the old-city food lanes.', 'experience'),
  weaving: link('/experiences/banarasi-silk-weaving/', 'Banarasi Silk Weaving', 'Meet the craft tradition behind one of Varanasi’s best-known cultural legacies.', 'experience'),
  deathWalk: link('/experiences/death-rebirth-walk/', 'Death & Rebirth Walk', 'Understand beliefs, rituals and living traditions around Varanasi’s sacred riverfront.', 'experience'),
  music: link('/experiences/classical-music-varanasi/', 'Classical Music in Varanasi', 'Add a more intimate cultural layer to a longer stay in the city.', 'experience'),

  about: link('/about-us/', 'About Tour Varanasi', 'Meet the locally based team planning and operating private journeys since 2016.', 'trust'),
  reviews: link('/reviews/', 'Guest Reviews', 'Read what previous travellers say about guides, planning and on-ground support.', 'trust'),
  standards: link('/service-standards/', 'Our Service Standards', 'See how we approach private guiding, vehicles, local access and journey support.', 'trust'),
};

function pageUrl(rel) {
  const normalized = rel.replaceAll('\\', '/');
  if (normalized === 'index.html') return '/';
  return '/' + normalized.replace(/index\.html$/, '');
}

function dedupe(items, currentUrl, limit=3) {
  const seenHref = new Set();
  const seenType = new Set();
  const result = [];
  for (const item of items) {
    if (!item || item.href === currentUrl || seenHref.has(item.href)) continue;
    if (seenType.has(item.type) && item.type !== 'guide') continue;
    seenHref.add(item.href);
    seenType.add(item.type);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

function topicFor(rel, html) {
  const lower = `${rel} ${html.slice(0, 18000)}`.toLowerCase();
  if (/bodhgaya|bodh gaya|rajgir|nalanda|kushinagar|lumbini|buddhist circuit/.test(lower)) return 'buddhist';
  if (/prayagraj|allahabad|ayodhya|chitrakoot|naimish|lucknow/.test(lower)) return 'sacred';
  if (/sarnath/.test(lower)) return 'sarnath';
  if (/ganga aarti|ganga-aarti|prayer ceremony|dev diwali/.test(lower)) return 'aarti';
  if (/sunrise|boat ride|motor-boat|ganges boat/.test(lower)) return 'river';
  if (/food walk|varanasi food|street food/.test(lower)) return 'food';
  if (/silk|weaving|banarasi/.test(lower)) return 'craft';
  if (/walking tour|old city|death & rebirth|death-rebirth/.test(lower)) return 'walk';
  return 'varanasi';
}

function choose(rel, html) {
  const url = pageUrl(rel);
  const topic = topicFor(rel, html);
  const isBlog = rel.startsWith('blogs/post/');
  const isTour = rel.startsWith('tours/');
  const isExperience = rel.startsWith('experiences/');

  let heading = 'Continue planning your Varanasi journey';
  let intro = 'These pages are the most useful next step for planning this part of your trip.';
  let items = [];

  if (topic === 'river') {
    heading = 'Plan the Ganges experience in context';
    intro = 'Pair the river with the right itinerary and practical guidance rather than treating it as a standalone activity.';
    items = isTour ? [L.sunriseGuide, L.twoDay, L.deathWalk, L.standards] : [L.boatTour, L.twoDay, L.deathWalk, L.standards];
  } else if (topic === 'aarti') {
    heading = 'Plan the evening Aarti properly';
    intro = 'Compare the viewing options, then place the Aarti within a practical Varanasi itinerary.';
    items = isBlog ? [L.twoDay, L.boatTour, L.deathWalk, L.standards] : [L.aartiGuide, L.twoDay, L.deathWalk, L.standards];
  } else if (topic === 'sarnath') {
    heading = 'Combine Sarnath with Varanasi';
    intro = 'Sarnath works best when its visit is planned around realistic city movement and the rest of your Varanasi stay.';
    items = isTour ? [L.sarnathGuide, L.twoDay, L.buddhistGuide, L.standards] : [L.sarnathTour, L.twoDay, L.buddhistGuide, L.standards];
  } else if (topic === 'buddhist') {
    heading = 'Continue into the Buddhist circuit';
    intro = 'Use Varanasi and Sarnath as the natural starting point for the major Buddhist sites of Bihar and beyond.';
    items = isTour ? [L.buddhistGuide, L.sarnathTour, L.standards, L.reviews] : [L.bodhgayaTour, L.buddhistTour, L.sarnathTour, L.standards];
  } else if (topic === 'sacred') {
    heading = 'Plan the sacred North India route';
    intro = 'Choose a route that gives Varanasi, Prayagraj and Ayodhya enough time instead of turning them into rushed transit stops.';
    items = isTour ? [L.sacredGuide, L.twoDay, L.standards, L.reviews] : [L.ayodhyaTour, L.sacredTour, L.twoDay, L.standards];
  } else if (topic === 'food') {
    heading = 'Add local flavour to the stay';
    intro = 'Food is best experienced as part of a well-paced old-city programme rather than squeezed between major sightseeing stops.';
    items = isExperience ? [L.threeDay, L.walkingTour, L.standards, L.reviews] : [L.food, L.threeDay, L.walkingTour, L.standards];
  } else if (topic === 'craft') {
    heading = 'Add Banarasi craft and culture';
    intro = 'A longer stay creates room for weaving, neighbourhoods and culture beyond the headline monuments.';
    items = isExperience ? [L.threeDay, L.food, L.standards, L.reviews] : [L.weaving, L.threeDay, L.food, L.standards];
  } else if (topic === 'walk') {
    heading = 'Go deeper into the old city';
    intro = 'The lanes make more sense when walking, river time and the wider itinerary are planned together.';
    items = isTour ? [L.deathWalk, L.threeDay, L.food, L.standards] : [L.walkingTour, L.threeDay, L.food, L.standards];
  } else {
    heading = 'Choose the right Varanasi itinerary';
    intro = 'Start with the amount of time you have, then add the river, old city and cultural experiences that fit naturally.';
    if (rel === 'tours/varanasi-tour-in-one-day/index.html') items = [L.daysGuide, L.twoDay, L.aartiGuide, L.standards];
    else if (rel === 'tours/varanasi-tour-in-two-days/index.html') items = [L.daysGuide, L.threeDay, L.aartiGuide, L.food];
    else if (rel === 'tours/varanasi-tour-in-three-days/index.html' || rel === 'tours/4-days-varanasi-tour/index.html') items = [L.daysGuide, L.food, L.weaving, L.standards];
    else if (isBlog) items = [L.twoDay, L.aartiGuide, L.food, L.standards];
    else if (isExperience) items = [L.threeDay, L.daysGuide, L.standards, L.reviews];
    else items = [L.twoDay, L.daysGuide, L.aartiGuide, L.standards];
  }

  if (rel === 'about-us/index.html') {
    heading = 'Plan with confidence';
    intro = 'See how we work, what guests say and which first-time itinerary is most useful as a starting point.';
    items = [L.reviews, L.standards, L.twoDay];
  } else if (rel === 'reviews/index.html') {
    heading = 'From reviews to trip planning';
    intro = 'See how our service approach translates into a practical first Varanasi itinerary.';
    items = [L.standards, L.twoDay, L.about];
  } else if (rel === 'service-standards/index.html') {
    heading = 'See the service in context';
    intro = 'Explore our team, guest feedback and a practical first-time Varanasi journey.';
    items = [L.about, L.reviews, L.twoDay];
  } else if (rel === 'tours/index.html') {
    heading = 'Start with the right journey';
    intro = 'Choose by trip length first, then compare longer sacred and Buddhist circuits.';
    items = [L.twoDay, L.sacredTour, L.bodhgayaTour];
  } else if (rel === 'blogs/index.html') {
    heading = 'Turn the guides into a practical trip';
    intro = 'Use our planning guides alongside a realistic first-time itinerary and the key river experience.';
    items = [L.twoDay, L.aartiGuide, L.sunriseGuide];
  } else if (rel === 'experiences/index.html') {
    heading = 'Build experiences into the itinerary';
    intro = 'Local experiences work best when the core Varanasi programme has enough time and the right pacing.';
    items = [L.threeDay, L.food, L.weaving];
  } else if (rel === 'journeys-beyond-varanasi/index.html') {
    heading = 'Continue beyond Varanasi';
    intro = 'Compare the two strongest extensions: the sacred route through Prayagraj and Ayodhya, or the Buddhist circuit into Bihar.';
    items = [L.sacredTour, L.bodhgayaTour, L.buddhistGuide];
  }

  return { heading, intro, items: dedupe(items, url, 3) };
}

function planningLabel(type) {
  if (type === 'tour') return 'Private itinerary';
  if (type === 'experience') return 'Local experience';
  if (type === 'trust') return 'Plan with confidence';
  return 'Planning guide';
}

function ensurePlanningStylesheet(html) {
  const href = '/assets/css/continue-planning.css';
  if (html.includes(href)) return html;
  return html.replace('</head>', `<link rel="stylesheet" href="${href}"/>\n</head>`);
}

function render(selection) {
  if (!selection.items.length) return '';
  const cards = selection.items.map((item) =>
    `<a class="tv-planning-card" href="${item.href}"><span class="tv-planning-meta">${planningLabel(item.type)}</span><h3>${item.title}</h3><p>${item.text}</p><span class="tv-planning-link">Explore <span aria-hidden="true">→</span></span></a>`
  ).join('');
  return `${MARKER_START}\n<section class="tv-planning" aria-labelledby="continue-planning"><div class="tv-planning-shell"><div class="tv-planning-head"><div class="tv-planning-kicker">Continue planning</div><h2 id="continue-planning">${selection.heading}</h2><p>${selection.intro}</p></div><div class="tv-planning-grid">${cards}</div></div></section>\n${MARKER_END}`;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', '.netlify', 'node_modules'].includes(entry.name)) continue;
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

  const selection = choose(rel, html);
  if (!selection.items.length) continue;
  const block = render(selection);

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

  html = ensurePlanningStylesheet(html);
  fs.writeFileSync(file, html);
  changed += 1;
}

console.log(`Internal linking: updated ${changed} pages with balanced semantic related links.`);
