/**
 * Focused SEO conversion/internal-link improvements — 17 October 2026.
 * Run AFTER all page builders and styling passes, BEFORE site audits.
 * Works on generated HTML; deterministic and safe to rerun.
 */
import { readFile, writeFile } from 'node:fs/promises';

const P = {
  wheelchair: 'travel-guide/ayodhya-ram-mandir-wheelchair-assistance/index.html',
  december: 'blogs/post/varanasi-in-december/index.html',
  sarnath: 'blogs/post/sarnath-from-varanasi/index.html',
  guide: 'travel-guide/private-tour-guide-varanasi/index.html',
  days: 'blogs/post/how-many-days-in-varanasi/index.html'
};

const STYLES = `<style id="tv-seo-oct26-style">
.tv-seo-oct26{box-sizing:border-box;max-width:980px;margin:24px auto;padding:21px 25px;background:#fcfbff;border:1px solid #e5dbf2;border-radius:14px;color:#302a38;font-size:15px;line-height:1.75}
.tv-seo-oct26 strong{color:#3e2d56}
.tv-seo-oct26 p{margin:0 0 7px}
.tv-seo-oct26 p:last-child{margin-bottom:0}
.tv-seo-oct26 a{color:#6a3a88;text-decoration:underline;text-underline-offset:3px;font-weight:650}
.tv-seo-oct26 a:focus-visible{outline:2px solid #6a3a88;outline-offset:3px}
@media(max-width:700px){.tv-seo-oct26{margin:20px 16px;padding:17px 18px;font-size:14px}}
</style>`;

const esc = s => s.replaceAll('&', '&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function metadata(html, title, description) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  for (const [attr, key, value] of [
    ['name','description',description],
    ['property','og:title',title],
    ['property','og:description',description],
    ['name','twitter:title',title],
    ['name','twitter:description',description]
  ]) {
    let replaced = false;
    html = html.replace(/<meta\b[^>]*>/gi, tag => {
      if (replaced || !new RegExp(`\\b${attr}=["']${key}["']`, 'i').test(tag)) return tag;
      replaced = true;
      return `<meta ${attr}="${key}" content="${esc(value)}"/>`;
    });
    if (!replaced) throw new Error(`Missing meta ${key} on priority page`);
  }
  return html;
}

function ensureStyle(html) {
  return html.includes('id="tv-seo-oct26-style"') ? html : html.replace('</head>', STYLES + '\n</head>');
}
function box(aria, body) {
  return `<aside class="tv-seo-oct26" aria-label="${esc(aria)}">${body}</aside>`;
}
function addNearArticleStart(html, slug, block) {
  const marker = `<!-- TV_SEO_OCT26_${slug}_START -->`;
  if (html.includes(marker)) return html;
  const section = html.indexOf('<section class="section narrow prose"');
  if (section < 0) throw new Error(`Missing prose section on ${slug}`);
  const h2 = html.indexOf('<h2', section);
  if (h2 < 0 || h2 > html.indexOf('</section>', section)) throw new Error(`Missing article H2 on ${slug}`);
  return html.slice(0,h2) + marker + '\n' + block + `\n<!-- TV_SEO_OCT26_${slug}_END -->\n` + html.slice(h2);
}

const priority = [
  {
    path:P.wheelchair, key:'WHEELCHAIR',
    title:'Ram Mandir Wheelchair Assistance: Booking & Fees | Tour Varanasi',
    description:'Visiting Ayodhya Ram Mandir with elderly parents? Learn about offline wheelchair assistance, ID requirements, temple access and private mobility support.',
    body:box('Plan wheelchair-friendly Ayodhya sightseeing',
      '<p><strong>Travelling with parents or a guest who has difficulty walking?</strong> Compare our <a href="/tours/ayodhya-tour-in-two-days/">private two-day Ayodhya itinerary</a> and <a href="/plan-my-journey/">ask for a mobility-aware plan</a>. Temple wheelchairs are allocated through the temple counter, subject to its assessment and arrangements; they cannot be guaranteed in advance.</p>')
  },
  {
    path:P.december,key:'DECEMBER',
    body:box('Choose your December Varanasi itinerary',
      '<p><strong>Planning a December visit?</strong> Compare our <a href="/tours/varanasi-tour-in-two-days/">two-day private Varanasi tour</a>, <a href="/tours/varanasi-tour-in-three-days/">three-day private tour</a> and <a href="/tours/4-days-varanasi-tour/">four-day itinerary</a> before fixing your dates.</p><p>We can arrange a private guide, car, suitable Ganga Aarti seating and Sarnath. Winter river outings depend on permission, visibility and local conditions. <a href="/plan-my-journey/">Request a tailored December itinerary</a>.</p>')
  },
  {
    path:P.sarnath,key:'SARNATH',
    body:box('Private Sarnath visit options',
      '<p><strong>Want to visit Sarnath with a knowledgeable local guide?</strong> Explore our <a href="/tours/varanasi-sarnath-tour/">private Sarnath half-day experience</a>, or include Sarnath in a <a href="/tours/varanasi-tour-in-two-days/">two-day Varanasi itinerary</a>. Museum visits remain subject to opening days and hours.</p>')
  },
  {
    path:P.guide,key:'PRIVATE_GUIDE',
    title:'Private Tour Guide in Varanasi | Fees & Guided Tours',
    description:'Book an English-speaking private tour guide in Varanasi. Compare guide-only visits, private car tours, Sarnath, Ganga Aarti and custom 2–3 day itineraries.',
    body:box('Private Varanasi tour options',
      '<p><strong>Need a complete private Varanasi tour rather than guide-only services?</strong> See our <a href="/tours/">private Varanasi tours</a>, including <a href="/tours/varanasi-tour-in-two-days/">two-day</a> and <a href="/tours/varanasi-tour-in-three-days/">three-day guided itineraries</a>. We quote guides, transport, boats and Ganga Aarti arrangements transparently for your dates.</p>')
  },
  {
    path:P.days,key:'DAYS',
    body:box('Compare private Varanasi itineraries',
      '<p><strong>Ready to choose your stay length?</strong> Compare our <a href="/tours/varanasi-tour-in-one-day/">one-day Varanasi tour</a>, <a href="/tours/varanasi-tour-in-two-days/">two-day itinerary</a>, <a href="/tours/varanasi-tour-in-three-days/">three-day itinerary</a> and <a href="/tours/4-days-varanasi-tour/">four-day private visit</a>. The programme can be adjusted to your flight times, walking comfort and interests.</p>')
  }
];

// Place relevant links in editorial/itinerary contexts, not the global navigation or footer.
// A source already linking to a target is left alone: avoid repetition and link stuffing.
const donors = [
  ['tours/ayodhya-tour-in-one-day/index.html', P.wheelchair, 'Ayodhya Ram Mandir wheelchair assistance', 'Travelling with a guest who cannot comfortably walk the temple approach? Read our practical wheelchair and assistance guide before planning darshan.'],
  ['tours/ayodhya-tour-in-two-days/index.html', P.wheelchair, 'wheelchair assistance for Ayodhya temple visits', 'Plan a comfortable private visit for parents or guests with limited mobility.'],
  ['tours/ayodhya-tour-in-three-days/index.html', P.wheelchair, 'Ayodhya wheelchair arrangements', 'Check how temple-counter assistance differs from full-day sightseeing support.'],
  ['tours/5-days-varanasi-ayodhya-tour-1/index.html', P.wheelchair, 'Ram Mandir wheelchair access advice', 'If anyone in your group has reduced mobility, plan the Ayodhya temple approach early.'],
  ['blogs/post/varanasi-prayagraj-ayodhya-itinerary/index.html', P.wheelchair, 'Ayodhya wheelchair assistance guide', 'Consider temple wheelchair procedures and comfortable walking distances when travelling with parents.'],

  ['blogs/post/best-time-to-visit-varanasi/index.html', P.december, 'Varanasi in December travel guide', 'See winter fog, sunrise and private itinerary planning before booking.'],
  ['blogs/post/where-to-stay-in-varanasi/index.html', P.december, 'Varanasi in December planning guide', 'Use practical winter advice when choosing riverfront or road-access hotels.'],
  ['blogs/post/sunrise-boat-ride-varanasi-guide/index.html', P.december, 'December boat and weather planning', 'In winter, morning visibility can affect the best start time and river plan.'],

  ['tours/5-days-varanasi-bodhgaya-tour/index.html', P.sarnath, 'Sarnath from Varanasi visit guide', 'Give the place of the Buddha’s first sermon time before travelling to Bodh Gaya.'],
  ['tours/6-days-varanasi-bodhgaya-rajgir-nalanda-patna-tour-1/index.html', P.sarnath, 'planning a Sarnath visit', 'Read about the archaeological site, museum closure and a realistic half-day visit.'],
  ['tours/varanasi-tour-in-three-days/index.html', P.sarnath, 'Sarnath half-day visit guide', 'Read how to fit Sarnath into a relaxed three-day Varanasi tour.'],
  ['travel-guide/first-time-in-varanasi/index.html', P.sarnath, 'Sarnath excursion guide', 'Understand the Sarnath visit before fitting it into your Varanasi stay.'],

  ['tours/index.html', P.guide, 'private tour guide in Varanasi', 'Compare guide-only services with full private tours, costs and inclusions.'],
  ['blogs/post/top-things-to-do/index.html', P.guide, 'private local guide in Varanasi', 'Learn what a guided city day can include, and what it costs.'],
  ['blogs/post/Varanasi-for-Foreigners/index.html', P.guide, 'booking a private guide in Varanasi', 'Compare guide-only help with a complete guided tour.'],
  ['tours/varanasi-tour-in-one-day/index.html', P.guide, 'local guide options in Varanasi', 'See the difference between a guide-only booking and a private guided itinerary.'],

  ['blogs/post/best-time-to-visit-varanasi/index.html', P.days, 'how many days to stay in Varanasi', 'Compare practical one-, two-, three- and four-day stays.'],
  ['blogs/post/where-to-stay-in-varanasi/index.html', P.days, 'how long to stay in Varanasi', 'Match your hotel location to a practical sightseeing schedule.'],
  ['blogs/post/varanasi-in-december/index.html', P.days, 'how many days to spend in Varanasi', 'Compare stay lengths before choosing a winter programme.'],
  ['tours/4-days-varanasi-tour/index.html', P.days, 'Varanasi stay-length comparison', 'Understand the trade-offs between shorter visits and four relaxed days.']
];

const hrefFor = path => '/' + path.replace(/index\.html$/,'');
const changed = [];
for (const page of priority) {
  let html = await readFile(page.path, 'utf8'); // hard failure if main priority page wasn't generated
  const before = html;
  if (page.title) html = metadata(html, page.title, page.description);
  html = addNearArticleStart(html, page.key, page.body);
  html = ensureStyle(html);
  if (html !== before) { await writeFile(page.path, html); changed.push(page.path); }
}

const grouped = new Map();
for (const [source,target,label,reason] of donors) {
  if (!grouped.has(source)) grouped.set(source, []);
  grouped.get(source).push({ target, label, reason });
}
for (const [source, links] of grouped) {
  let html = await readFile(source,'utf8');
  const marker = '<!-- TV_SEO_OCT26_INBOUND_START -->';
  if (html.includes(marker)) continue;
  const bodyBeforeFooter = html.split(/<footer\b/i)[0];
  const needed = links.filter(link => !bodyBeforeFooter.includes(`href="${hrefFor(link.target)}"`));
  if (!needed.length) continue;
  const copy = needed.map(({target,label,reason})=>`<p><a href="${hrefFor(target)}">${label}</a> — ${reason}</p>`).join('');
  const block = marker+'\n'+box('Related practical travel advice',copy)+'\n<!-- TV_SEO_OCT26_INBOUND_END -->\n';
  if (html.includes('<!-- TV_INTERNAL_LINKS_START -->')) {
    html = html.replace('<!-- TV_INTERNAL_LINKS_START -->',block+'<!-- TV_INTERNAL_LINKS_START -->');
  } else if (/<footer\b/i.test(html)) {
    html = html.replace(/<footer\b/i,block+'<footer');
  } else throw new Error('Cannot find link placement for '+source);
  html = ensureStyle(html);
  await writeFile(source,html);
  changed.push(source);
}
console.log('17 Oct targeted SEO: updated '+changed.length+' files; priority pages and contextual links: '+changed.join(', '));
