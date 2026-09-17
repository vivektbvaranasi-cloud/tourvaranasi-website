import { readFile, writeFile } from 'node:fs/promises';

const pages = [
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
      ['/tours/varanasi-tour-in-two-days/', '2 Day Varanasi Itinerary', 'Choose the two-day plan when you want the same essentials with more breathing space.'],
      ['/blogs/post/ganga-aarti-varanasi-guide/', 'Ganga Aarti Guide', 'Compare balcony, Sankalp seating and river-viewing options before the evening ceremony.']
    ]
  },
  {
    path: 'tours/varanasi-tour-in-two-days/index.html',
    oldNames: ['2 Days Varanasi Tour', '2 Days Varanasi Tour | Practical Private Itinerary | Tour Varanasi', '2 Days Varanasi Tour | Practical Private Itinerary'],
    title: '2 Day Varanasi Itinerary | Ghats, Temples & Sarnath',
    name: '2 Day Varanasi Itinerary',
    description: 'A practical two-day Varanasi itinerary for a first visit, with Ganga Aarti, sunrise boat ride, old-city walk, Kashi Vishwanath and Sarnath without compressing everything into one day.',
    relatedHeading: 'Two days is our practical first-visit itinerary.',
    relatedIntro: 'Use this page when you have two days in Varanasi. The one-day tour is deliberately more compact, while the three-day itinerary adds time for culture and local experiences.',
    relatedItems: [
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare the trade-offs between one, two, three and longer stays.'],
      ['/tours/varanasi-tour-in-three-days/', '3 Day Varanasi Itinerary', 'Add a third day when you want a slower pace and more cultural depth.'],
      ['/blogs/post/where-to-stay-in-varanasi/', 'Where to Stay in Varanasi', 'Choose the right hotel area for river access, old-city sightseeing and vehicle movement.']
    ]
  },
  {
    path: 'tours/varanasi-tour-in-three-days/index.html',
    oldNames: ['3 Days Varanasi Tour', '3 Days Varanasi Tour | Private Practical Itinerary | Tour Varanasi'],
    title: '3 Day Varanasi Itinerary | Culture, Ghats & Sarnath',
    name: '3 Day Varanasi Itinerary',
    description: 'A relaxed three-day Varanasi itinerary combining the Ganges, old city, Kashi Vishwanath and Sarnath with extra time for food, craft, neighbourhoods and cultural experiences.',
    relatedHeading: 'Use the third day to go deeper into Varanasi.',
    relatedIntro: 'This three-day itinerary is for travellers who want more than the headline sights, with room for culture, craft and neighbourhood experiences at a slower pace.',
    relatedItems: [
      ['/blogs/post/how-many-days-in-varanasi/', 'How Many Days in Varanasi?', 'Compare stay lengths and decide how much time suits your travel style.'],
      ['/experiences/varanasi-food-walk/', 'Varanasi Food Walk', 'Use the extra time for a guided introduction to selected old-city flavours.'],
      ['/experiences/banarasi-silk-weaving/', 'Banarasi Silk Weaving', 'Add a craft-focused experience around Varanasi’s weaving traditions.']
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

function relatedBlock(config) {
  const cards = config.relatedItems.map(([href, title, text]) => `<div class="feature"><h3><a href="${href}">${title}</a></h3><p>${text}</p></div>`).join('');
  return `<!-- TV_INTERNAL_LINKS_START -->\n<section class="section soft tv-related-links" aria-labelledby="continue-planning"><div class="inner"><div class="eyebrow">Continue planning</div><h2 id="continue-planning">${config.relatedHeading}</h2><p class="lede">${config.relatedIntro}</p><div class="grid grid-3">${cards}</div></div></section>\n<!-- TV_INTERNAL_LINKS_END -->`;
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
  if (html !== before) {
    await writeFile(config.path, html);
    changed++;
  }
}

console.log(`SEO intent hardening applied to ${changed} itinerary pages.`);
