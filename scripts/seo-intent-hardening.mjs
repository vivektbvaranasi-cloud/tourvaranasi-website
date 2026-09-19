import { readFile, writeFile } from 'node:fs/promises';

const pages = [
  {
    path: 'tours/index.html',
    oldNames: ['Varanasi, at your own pace.', 'Private Varanasi Tours & Sacred Journeys'],
    title: 'Private Varanasi Tours | Local Guides & Custom Itineraries',
    name: 'Private Varanasi Tours',
    description: 'Private Varanasi tours with local guides, sunrise Ganges boat rides, Kashi Vishwanath, Ganga Aarti, Sarnath and thoughtfully paced custom itineraries.',
    relatedHeading: 'Start with the right private Varanasi itinerary.',
    relatedIntro: 'Choose the stay length first, then add the river, old-city, temple and Sarnath experiences that matter most to you.',
    relatedItems: [
      ['/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'A practical first visit with Ganga Aarti, sunrise on the Ganges, Kashi Vishwanath and Sarnath.'],
      ['/tours/varanasi-tour-in-three-days/', '3 Days Varanasi Tour', 'A more relaxed private itinerary with extra time for food, craft and neighbourhood experiences.'],
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare one, two, three and longer stays before deciding your pace.']
    ]
  },
  {
    path: 'tours/varanasi-tour-in-one-day/index.html',
    oldNames: ['1 Day Varanasi Tour'],
    title: 'Varanasi One Day Tour | Private Full-Day Itinerary',
    name: 'Varanasi One Day Tour',
    description: 'A private one-day Varanasi tour covering the sunrise Ganges boat ride, old city and Kashi Vishwanath area, Sarnath and evening Ganga Aarti in one practical full-day plan.',
    relatedHeading: 'Only one day in Varanasi? Keep the plan focused.',
    relatedIntro: 'This page is the compact full-day option. If you have more time, compare the longer itineraries rather than stretching this one-day programme.',
    relatedItems: [
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare one, two and three-day stays before choosing the right pace.'],
      ['/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'Choose the two-day plan when you want the same essentials with more breathing space.'],
      ['/tours/evening-prayer-ceremony/', 'Ganga Aarti in Varanasi', 'Compare premium Sankalp, balcony and reserved-chair options for the evening ceremony.']
    ]
  },
  {
    path: 'tours/varanasi-tour-in-two-days/index.html',
    oldNames: ['2 Day Varanasi Itinerary', '2 Days Varanasi Tour', '2 Days Varanasi Tour | Practical Private Itinerary | Tour Varanasi', '2 Days Varanasi Tour | Practical Private Itinerary'],
    title: '2 Days Varanasi Tour | Private Varanasi Itinerary',
    name: '2 Days Varanasi Tour',
    description: 'A private 2 days Varanasi tour with Ganga Aarti, sunrise boat ride, Kashi Vishwanath, old-city walk and Sarnath, planned at a comfortable pace.',
    relatedHeading: 'Two days is our practical first-visit itinerary.',
    relatedIntro: 'Use this page when you have two days in Varanasi. The one-day tour is deliberately more compact, while the three-day itinerary adds time for culture and local experiences.',
    relatedItems: [
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare the trade-offs between one, two, three and longer stays.'],
      ['/tours/varanasi-tour-in-three-days/', '3 Days Varanasi Tour', 'Add a third day when you want a slower pace and more cultural depth.'],
      ['/tours/varanasi-sarnath-tour/', 'Sarnath Tour from Varanasi', 'See how to plan Sarnath as a private half-day excursion from Varanasi.']
    ]
  },
  {
    path: 'tours/varanasi-tour-in-three-days/index.html',
    oldNames: ['3 Day Varanasi Itinerary', '3 Days Varanasi Tour', '3 Days Varanasi Tour | Private Practical Itinerary | Tour Varanasi'],
    title: '3 Days Varanasi Tour | Private Varanasi Itinerary',
    name: '3 Days Varanasi Tour',
    description: 'A relaxed 3 days Varanasi tour with the Ganges, Kashi Vishwanath, Sarnath, old-city walks, food, craft and cultural experiences.',
    relatedHeading: 'Use the third day to go deeper into Varanasi.',
    relatedIntro: 'This three-day itinerary is for travellers who want more than the headline sights, with room for culture, craft and neighbourhood experiences at a slower pace.',
    relatedItems: [
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare stay lengths and decide how much time suits your travel style.'],
      ['/experiences/varanasi-food-walk/', 'Varanasi Food Walk', 'Use the extra time for a guided introduction to selected old-city flavours.'],
      ['/experiences/banarasi-silk-weaving/', 'Banarasi Silk Weaving', 'Add a craft-focused experience around Varanasi’s weaving traditions.']
    ]
  },
  {
    path: 'tours/varanasi-boat-ride/index.html',
    oldNames: ['Sunrise Boat Ride in Varanasi'],
    title: 'Sunrise Boat Ride Varanasi | Private Ganges Boat Tour',
    name: 'Sunrise Boat Ride in Varanasi',
    description: 'Private sunrise boat ride in Varanasi on the Ganges, with practical timing, ghat route, river-condition guidance and optional old-city walk.',
    relatedHeading: 'Build the sunrise boat into a practical Varanasi morning.',
    relatedIntro: 'The river is best treated as the beginning of the morning, then connected naturally with the ghats, old city and temple area.',
    relatedItems: [
      ['/blogs/post/sunrise-boat-ride-varanasi-guide/', 'Sunrise Boat Ride Guide', 'Read practical advice on timing, route, river conditions and what to expect.'],
      ['/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'Combine the sunrise boat with the old city, Kashi Vishwanath, Ganga Aarti and Sarnath.'],
      ['/tours/varanasi-walking-tour/', 'Old City Walking Tour', 'Continue from the ghats into Varanasi’s lanes, bazaars and sacred geography.']
    ]
  },
  {
    path: 'tours/evening-prayer-ceremony/index.html',
    oldNames: ['Evening Ganga Aarti in Varanasi', 'Ganga Aarti in Varanasi'],
    title: 'Ganga Aarti Varanasi | Premium Sankalp & Balcony Viewing',
    name: 'Ganga Aarti in Varanasi',
    description: 'Experience Ganga Aarti in Varanasi with premium Sankalp seating, balcony viewing or reserved chairs, arranged with a private local guide.',
    relatedHeading: 'Choose the right way to experience Ganga Aarti.',
    relatedIntro: 'We explain the trade-offs between Sankalp participation, balcony viewing, reserved chairs and river viewing before recommending a position.',
    relatedItems: [
      ['/blogs/post/ganga-aarti-varanasi-guide/', 'Ganga Aarti Guide', 'Compare the main viewing options and understand what each experience actually feels like.'],
      ['/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'Place the evening Aarti inside a practical first-time Varanasi itinerary.'],
      ['/tours/varanasi-boat-ride/', 'Sunrise Boat Ride Varanasi', 'Pair the evening ceremony with a private sunrise experience on the Ganges.']
    ]
  },
  {
    path: 'tours/varanasi-sarnath-tour/index.html',
    oldNames: ['Private Sarnath Tour from Varanasi'],
    title: 'Sarnath Tour from Varanasi | Private Half-Day Tour',
    name: 'Private Sarnath Tour from Varanasi',
    description: 'Private Sarnath tour from Varanasi with Dhamek Stupa, Buddhist ruins, Mulagandha Kuti Vihara and museum planning, with an expert local guide.',
    relatedHeading: 'Give Sarnath enough time to make sense.',
    relatedIntro: 'A private half day allows the archaeological landscape and Buddhist meaning to be understood together rather than treated as a quick photo stop.',
    relatedItems: [
      ['/blogs/post/sarnath-from-varanasi/', 'Sarnath from Varanasi Guide', 'Plan realistic timing, monument order and the Friday museum closure.'],
      ['/tours/varanasi-tour-in-two-days/', '2 Days Varanasi Tour', 'Combine Sarnath with the Ganges, old city, Kashi Vishwanath and Ganga Aarti.'],
      ['/blogs/post/buddhist-circuit-from-varanasi/', 'Buddhist Circuit from Varanasi', 'Continue from Sarnath to Bodh Gaya, Rajgir, Nalanda and the wider Buddhist circuit.']
    ]
  }
];

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function setMeta(html, attr, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}=["']${escapedKey}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}"/>`;
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `${tag}\n</head>`);
}

function setH1(html, value) {
  return html.replace(/<h1>[^<]*<\/h1>/i, `<h1>${value}</h1>`);
}

function replaceExactNames(html, names, replacement) {
  for (const name of names) html = html.replaceAll(name, replacement);
  return html;
}

function relatedItemLabel(href) {
  if (href.startsWith('/tours/')) return 'Private itinerary';
  if (href.startsWith('/experiences/')) return 'Local experience';
  if (href.startsWith('/blogs/')) return 'Planning guide';
  return 'Continue planning';
}

function relatedBlock(config) {
  const cards = config.relatedItems.map(([href, title, text]) =>
    `<a class="tv-planning-card" href="${href}"><span class="tv-planning-meta">${relatedItemLabel(href)}</span><h3>${title}</h3><p>${text}</p><span class="tv-planning-link">Explore <span aria-hidden="true">→</span></span></a>`
  ).join('');
  return `<!-- TV_INTERNAL_LINKS_START -->\n<section class="tv-planning" aria-labelledby="continue-planning"><div class="tv-planning-shell"><div class="tv-planning-head"><div class="tv-planning-kicker">Continue planning</div><h2 id="continue-planning">${config.relatedHeading}</h2><p>${config.relatedIntro}</p></div><div class="tv-planning-grid">${cards}</div></div></section>\n<!-- TV_INTERNAL_LINKS_END -->`;
}

function ensurePlanningStylesheet(html) {
  const href = '/assets/css/continue-planning.css';
  if (html.includes(href)) return html;
  return html.replace('</head>', `<link rel="stylesheet" href="${href}"/>\n</head>`);
}

function ensureToursPlanningStyles(html, config) {
  if (config.path !== 'tours/index.html' || html.includes('/* TV_TOURS_PLANNING */')) return html;
  const css = `
<style>
/* TV_TOURS_PLANNING */
.tours-planning{background:#f3eee6;padding:84px 0 90px;border-top:1px solid rgba(221,216,207,.8)}
.tours-planning-head{max-width:780px;margin:0 auto 42px;text-align:center}
.tours-planning-head .kicker{margin-bottom:12px;font-size:14px;line-height:1.25;font-weight:700;letter-spacing:.11em}
.tours-planning-head h2{font-family:var(--heading);font-size:40px;line-height:1.12;font-weight:500;letter-spacing:-.02em;color:var(--ink);margin:0 0 14px}
.tours-planning-head p{max-width:690px;margin:0 auto;font-size:15px;line-height:1.7;color:var(--muted)}
.tours-planning-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.tours-planning-card{display:flex;flex-direction:column;min-height:255px;background:#fffdf9;border:1px solid var(--line);padding:28px 28px 26px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.tours-planning-card:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(54,49,43,.08);border-color:#cfc6bb}
.tours-planning-meta{font-size:9px;line-height:1.2;letter-spacing:.14em;text-transform:uppercase;color:var(--terracotta-dark);font-weight:600;margin-bottom:24px}
.tours-planning-card h3{font-family:var(--heading);font-size:27px;line-height:1.16;font-weight:600;color:var(--ink);margin:0 0 12px}
.tours-planning-card p{font-size:13px;line-height:1.7;color:var(--muted);margin:0 0 24px}
.tours-planning-link{display:inline-flex;align-items:center;gap:8px;margin-top:auto;font-size:12px;font-weight:600;color:var(--river)}
.tours-planning-link span{transition:transform .2s ease}
.tours-planning-card:hover .tours-planning-link span{transform:translateX(4px)}
@media(max-width:820px){
  .tours-planning{padding:66px 0 72px}
  .tours-planning-head{margin-bottom:30px;text-align:left}
  .tours-planning-head h2{font-size:33px}
  .tours-planning-head p{margin-left:0}
  .tours-planning-grid{grid-template-columns:1fr;gap:14px}
  .tours-planning-card{min-height:0;padding:24px 22px}
  .tours-planning-meta{margin-bottom:14px}
  .tours-planning-card h3{font-size:24px}
}
</style>`;
  return html.replace('</head>', css + '\n</head>');
}

let changed = 0;
for (const config of pages) {
  const before = await readFile(config.path, 'utf8');
  let html = before;
  html = replaceExactNames(html, config.oldNames, config.name);
  html = setTitle(html, config.title);
  html = setMeta(html, 'name', 'description', config.description);
  html = setMeta(html, 'property', 'og:title', config.title);
  html = setMeta(html, 'property', 'og:description', config.description);
  html = setMeta(html, 'name', 'twitter:title', config.title);
  html = setMeta(html, 'name', 'twitter:description', config.description);
  html = setH1(html, config.name);
  html = html.replace(/<!-- TV_INTERNAL_LINKS_START -->[\s\S]*?<!-- TV_INTERNAL_LINKS_END -->/i, relatedBlock(config));
  html = ensurePlanningStylesheet(html);
  if (html !== before) {
    await writeFile(config.path, html);
    changed++;
  }
}

console.log(`SEO intent hardening applied to ${changed} itinerary pages.`);
