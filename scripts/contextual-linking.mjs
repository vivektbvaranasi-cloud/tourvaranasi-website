import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const rules = {
  'blogs/post/how-many-days-in-varanasi/index.html': [
    ['sunrise on the Ganges', '/tours/varanasi-boat-ride/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['evening Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['Banarasi weaving', '/experiences/banarasi-silk-weaving/'],
    ['food walk', '/experiences/varanasi-food-walk/'],
  ],
  'blogs/post/ganga-aarti-varanasi-guide/index.html': [
    ['private guide', '/service-standards/'],
    ['old-city or bazaar walk', '/tours/varanasi-walking-tour/'],
    ['boat viewing', '/tours/varanasi-boat-ride/'],
    ['2-day stay', '/tours/varanasi-tour-in-two-days/'],
  ],
  'blogs/post/sunrise-boat-ride-varanasi-guide/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['old city', '/tours/varanasi-walking-tour/'],
    ['two days', '/tours/varanasi-tour-in-two-days/'],
  ],
  'blogs/post/sarnath-from-varanasi/index.html': [
    ['Buddhist circuit', '/blogs/post/buddhist-circuit-from-varanasi/'],
    ['Varanasi and Sarnath', '/tours/varanasi-sarnath-tour/'],
    ['two-day', '/tours/varanasi-tour-in-two-days/'],
  ],
  'blogs/post/top-things-to-do/index.html': [
    ['sunrise boat', '/tours/varanasi-boat-ride/'],
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['food walk', '/experiences/varanasi-food-walk/'],
  ],
  'blogs/post/varanasi-food-guide/index.html': [
    ['food walk', '/experiences/varanasi-food-walk/'],
    ['old city', '/tours/varanasi-walking-tour/'],
  ],
  'blogs/post/best-time-to-visit-varanasi/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['boat ride', '/blogs/post/sunrise-boat-ride-varanasi-guide/'],
    ['Dev Diwali', '/blogs/post/dev-diwali-in-varanasi-in-2025/'],
  ],
  'blogs/post/where-to-stay-in-varanasi/index.html': [
    ['BrijRama Palace', '/blogs/post/brijrama-palace-varanasi/'],
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['old city', '/tours/varanasi-walking-tour/'],
  ],
  'blogs/post/Varanasi-for-Foreigners/index.html': [
    ['first-time', '/travel-guide/first-time-in-varanasi/'],
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['service standards', '/service-standards/'],
  ],
  'blogs/post/buddhist-circuit-from-varanasi/index.html': [
    ['Bodh Gaya', '/tours/5-days-varanasi-bodhgaya-tour/'],
    ['Rajgir', '/tours/6-days-varanasi-bodhgaya-rajgir-nalanda-patna-tour-1/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
  ],
  'blogs/post/varanasi-prayagraj-ayodhya-itinerary/index.html': [
    ['Ayodhya', '/tours/5-days-varanasi-ayodhya-tour-1/'],
    ['Prayagraj', '/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/'],
    ['Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/varanasi-tour-in-one-day/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['boat', '/tours/varanasi-boat-ride/'],
  ],
  'tours/varanasi-tour-in-two-days/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['private motor-boat ride', '/tours/varanasi-boat-ride/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['three days', '/tours/varanasi-tour-in-three-days/'],
  ],
  'tours/varanasi-tour-in-three-days/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['sunrise', '/blogs/post/sunrise-boat-ride-varanasi-guide/'],
    ['food walk', '/experiences/varanasi-food-walk/'],
    ['silk weaving', '/experiences/banarasi-silk-weaving/'],
  ],
  'tours/4-days-varanasi-tour/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['food walk', '/experiences/varanasi-food-walk/'],
    ['Banarasi', '/experiences/banarasi-silk-weaving/'],
  ],
  'tours/varanasi-boat-ride/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['old city', '/tours/varanasi-walking-tour/'],
    ['2 Days Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/evening-prayer-ceremony/index.html': [
    ['boat', '/tours/varanasi-boat-ride/'],
    ['old city', '/tours/varanasi-walking-tour/'],
    ['2-day', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/varanasi-sarnath-tour/index.html': [
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['Buddhist circuit', '/blogs/post/buddhist-circuit-from-varanasi/'],
    ['2 Days Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/varanasi-walking-tour/index.html': [
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
    ['food', '/experiences/varanasi-food-walk/'],
    ['Death', '/experiences/death-rebirth-walk/'],
  ],
  'tours/5-days-varanasi-ayodhya-tour-1/index.html': [
    ['Ayodhya', '/blogs/post/varanasi-prayagraj-ayodhya-itinerary/'],
    ['Varanasi', '/tours/varanasi-tour-in-two-days/'],
    ['Ganga Aarti', '/blogs/post/ganga-aarti-varanasi-guide/'],
  ],
  'tours/6-days-varanasi-prayagraj-ayodhya-tour-2/index.html': [
    ['Prayagraj', '/blogs/post/varanasi-prayagraj-ayodhya-itinerary/'],
    ['Ayodhya', '/tours/5-days-varanasi-ayodhya-tour-1/'],
    ['Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/5-days-varanasi-bodhgaya-tour/index.html': [
    ['Bodh Gaya', '/blogs/post/buddhist-circuit-from-varanasi/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
  'tours/6-days-varanasi-bodhgaya-rajgir-nalanda-patna-tour-1/index.html': [
    ['Bodh Gaya', '/blogs/post/buddhist-circuit-from-varanasi/'],
    ['Sarnath', '/blogs/post/sarnath-from-varanasi/'],
    ['Varanasi', '/tours/varanasi-tour-in-two-days/'],
  ],
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function linkTextNode(html, phrase, href) {
  const bodyAt = html.indexOf('<body');
  if (bodyAt === -1) return html;
  const head = html.slice(0, bodyAt);
  const body = html.slice(bodyAt);
  const tokens = body.split(/(<[^>]+>)/g);
  const re = new RegExp(escapeRegExp(phrase), 'i');
  let inAnchor = false;
  let blocked = 0;
  let done = false;

  for (let i = 0; i < tokens.length && !done; i += 1) {
    const token = tokens[i];
    if (token.startsWith('<')) {
      if (/^<a\b/i.test(token)) inAnchor = true;
      else if (/^<\/a\b/i.test(token)) inAnchor = false;
      if (/^<(script|style|nav|header|footer)\b/i.test(token)) blocked += 1;
      else if (/^<\/(script|style|nav|header|footer)\b/i.test(token)) blocked = Math.max(0, blocked - 1);
      continue;
    }
    if (inAnchor || blocked || !re.test(token)) continue;
    tokens[i] = token.replace(re, (match) => `<a href="${href}">${match}</a>`);
    done = true;
  }
  return head + tokens.join('');
}

function linkStrong(html, phrase, href) {
  const re = new RegExp(`<strong>\\s*(${escapeRegExp(phrase)})\\s*</strong>`, 'i');
  return html.replace(re, (match) => `<a href="${href}">${match}</a>`);
}

let changedFiles = 0;
let linksAdded = 0;

for (const [rel, pageRules] of Object.entries(rules)) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  for (const [phrase, href] of pageRules) {
    if (html.includes(`href="${href}"`) && html.toLowerCase().includes(`>${phrase.toLowerCase()}<`)) continue;
    const before = html;
    html = linkTextNode(html, phrase, href);
    if (html === before) html = linkStrong(html, phrase, href);
    if (html !== before) linksAdded += 1;
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    changedFiles += 1;
  }
}

console.log(`Contextual linking: added ${linksAdded} inline links across ${changedFiles} priority pages.`);
