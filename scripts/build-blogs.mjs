import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { coreDestinations } from './destination-data-core.mjs';
import { buddhistDestinations } from './destination-data-buddhist.mjs';
import { westDestinations, destinationMediaOverrides } from './destination-data-west.mjs';

const SITE = 'https://www.tourvaranasi.com';
const TODAY = '2026-09-09';
const BLOG_CSS = '/assets/css/blog-enhancements.css';

const bySlug = new Map(
  [...coreDestinations, ...buddhistDestinations, ...westDestinations].map((d) => [
    d.slug,
    { ...d, ...(destinationMediaOverrides[d.slug] || {}) }
  ])
);

function destination(slug) {
  const item = bySlug.get(slug);
  if (!item) throw new Error(`Missing destination data for ${slug}`);
  return item;
}

const existingArticles = [
  {
    n: 1,
    path: 'travel-guide/first-time-in-varanasi/index.html',
    url: '/travel-guide/first-time-in-varanasi/',
    title: 'First Time in Varanasi: A Local Guide to Planning Your Visit',
    description: 'A practical local guide for first-time visitors to Varanasi: how many days, where to stay, walking, boats, Ganga Aarti, temples and Sarnath.',
    group: 'Varanasi essentials',
    hero: '/assets/images/guest_joyful_boat.webp',
    photos: [
      ['/assets/images/user/kashi-corridor.jpg', 'Kashi Vishwanath Corridor in Varanasi', 'Temple visits work best when security, lockers and the final walking approach are planned in advance.'],
      ['/assets/images/user/sunrise-ganges.jpg', 'Sunrise on the River Ganges in Varanasi', 'An early private boat gives first-time visitors the clearest introduction to the ghats and riverfront.']
    ]
  },
  {
    n: 2,
    path: 'blogs/post/Varanasi-for-Foreigners/index.html',
    url: '/blogs/post/Varanasi-for-Foreigners/',
    title: 'Varanasi Etiquette & Practical Tips for International Travellers',
    description: 'Practical advice on walking, clothing, temple etiquette, river experiences, photography and respectful behaviour in Varanasi.',
    group: 'Varanasi essentials',
    hero: '/assets/images/user/guest-w02.jpeg',
    photos: [['/assets/images/user/old-city-bazaar.jpg', 'Old city bazaar lanes in Varanasi', 'The lanes are part of the experience, but they also explain why comfortable footwear and a realistic walking plan matter.']]
  },
  {
    n: 3,
    path: 'blogs/post/how-many-days-in-varanasi/index.html',
    url: '/blogs/post/how-many-days-in-varanasi/',
    title: 'How Many Days Do You Need in Varanasi?',
    description: 'What you can realistically experience in one, two, three or four days in Varanasi without turning the city into a rushed checklist.',
    group: 'Varanasi essentials',
    hero: '/assets/images/guest_sunrise_diya_couple.webp',
    photos: [['/assets/images/user/dawn-1.JPG', 'Early morning on the Varanasi riverfront', 'Keeping sunrise, temples, Sarnath and the evening river ceremony in separate outings makes a short stay much more comfortable.']]
  },
  {
    n: 4,
    path: 'blogs/post/best-time-to-visit-varanasi/index.html',
    url: '/blogs/post/best-time-to-visit-varanasi/',
    title: 'Best Time to Visit Varanasi: Month-by-Month Guide',
    description: 'A practical month-by-month guide to Varanasi weather, crowds, festivals, heat, winter mornings and monsoon river conditions.',
    group: 'Varanasi essentials',
    hero: '/assets/images/user/sunrise-ganges.jpg',
    photos: [['/assets/images/user/dawn-3.JPG', 'Dawn over the River Ganges in Varanasi', 'Winter mornings can be atmospheric and cool, while summer and monsoon need a different daily rhythm.']]
  },
  {
    n: 5,
    path: 'blogs/post/where-to-stay-in-varanasi/index.html',
    url: '/blogs/post/where-to-stay-in-varanasi/',
    title: 'Where to Stay in Varanasi: Ghats, Assi, Nadesar or Cantonment?',
    description: 'How to choose a Varanasi hotel area by river access, vehicle access, walking, atmosphere, room comfort and your preferred pace.',
    group: 'Varanasi essentials',
    hero: '/assets/images/user/legal-varanasi-ghats-evening.jpg',
    photos: [['/assets/images/user/service-standards-varanasi-overview.jpg', 'Varanasi riverfront and old city overview', 'The best hotel area depends on whether you value river atmosphere or easier private-vehicle access.']]
  },
  {
    n: 6,
    path: 'blogs/post/sunrise-boat-ride-varanasi-guide/index.html',
    url: '/blogs/post/sunrise-boat-ride-varanasi-guide/',
    title: 'Sunrise Boat Ride in Varanasi: What to Expect',
    description: 'What a private sunrise boat ride in Varanasi is really like, what you see, how early to start and when river conditions can change plans.',
    group: 'Varanasi experiences',
    hero: '/assets/images/user/sunrise-ganges.jpg',
    photos: [['/assets/images/user/dawn-4.jpg', 'Boats at dawn on the Ganges in Varanasi', 'The river is most revealing before the day becomes hot and traffic builds around the old city.']]
  },
  {
    n: 7,
    path: 'blogs/post/ganga-aarti-varanasi-guide/index.html',
    url: '/blogs/post/ganga-aarti-varanasi-guide/',
    title: 'Ganga Aarti in Varanasi: Boat, Ghat, Chair or Balcony?',
    description: 'A practical guide to choosing the right Ganga Aarti viewpoint in Varanasi according to mobility, crowds, river conditions and season.',
    group: 'Varanasi experiences',
    hero: '/assets/images/user/ganga-aarti-varanasi.png',
    photos: [['/assets/images/user/aarti-2.JPG', 'Evening Ganga Aarti in Varanasi', 'A fixed seat can be more comfortable than a boat for many senior travellers and families.']]
  },
  {
    n: 8,
    path: 'blogs/post/sarnath-from-varanasi/index.html',
    url: '/blogs/post/sarnath-from-varanasi/',
    title: 'Sarnath from Varanasi: How to Plan the Visit',
    description: 'How to visit Sarnath from Varanasi, what to see, how much time to allow and why good interpretation matters more than rushing the monuments.',
    group: 'Varanasi experiences',
    hero: '/assets/images/user/sarnath-dhamek.jpg',
    photos: [['/assets/images/user/sarnath-1.jpg', 'Dhamek Stupa and the archaeological precinct at Sarnath', 'Sarnath is best given a proper half day rather than squeezed between unrelated city stops.']]
  },
  {
    n: 9,
    path: 'blogs/post/varanasi-food-guide/index.html',
    url: '/blogs/post/varanasi-food-guide/',
    title: 'What to Eat in Varanasi: A Practical Food Guide',
    description: 'A practical food guide to kachori-sabzi, chaat, lassi, sweets, malaiyo and Banarasi paan, with sensible advice for first-time visitors.',
    group: 'Varanasi experiences',
    hero: '/assets/images/user/varanasi-food.jpg',
    photos: [['/assets/images/guest_blue_lassi.webp', 'A guided lassi stop in old Varanasi', 'A private food walk is about choosing a few good stops, not tasting everything in one evening.']]
  },
  {
    n: 10,
    path: 'blogs/post/top-things-to-do/index.html',
    url: '/blogs/post/top-things-to-do/',
    title: 'Top Things to Do in Varanasi — What We Would Actually Prioritise',
    description: 'The Varanasi experiences we would actually prioritise on a first trip, from the river and old city to Sarnath, food, weaving and music.',
    group: 'Varanasi experiences',
    hero: '/assets/images/guest_market_blessing.webp',
    photos: [['/assets/images/user/banarasi-silk.jpg', 'Banarasi silk weaving and craft tradition', 'Leaving room for one craft, food or music experience often adds more than another rushed monument.']]
  },
  {
    n: 11,
    path: 'blogs/post/dev-diwali-in-varanasi-in-2025/index.html',
    url: '/blogs/post/dev-diwali-in-varanasi-in-2025/',
    title: 'Dev Deepawali in Varanasi: Practical Travel Guide',
    description: 'How to plan Dev Deepawali in Varanasi when crowd controls, road closures, river rules and viewing arrangements operate differently from a normal day.',
    group: 'Varanasi experiences',
    hero: '/assets/images/user/aarti-1.JPG',
    photos: [['/assets/images/user/aarti-3.jpg', 'Aarti lamps and festival atmosphere on the Varanasi ghats', 'Festival evenings need earlier starts, lighter daytime sightseeing and a clear return plan.']]
  },
  {
    n: 12,
    path: 'blogs/post/brijrama-palace-varanasi/index.html',
    url: '/blogs/post/brijrama-palace-varanasi/',
    title: 'BrijRama Palace & Staying on the Ghats: What Riverfront Hotels Change',
    description: 'What a riverfront hotel changes in Varanasi: atmosphere, walking, luggage movement, boat transfers and the trade-off between romance and vehicle access.',
    group: 'Varanasi essentials',
    hero: '/assets/images/guest_riverside_ritual.webp',
    photos: [['/assets/images/user/legal-varanasi-ghats-evening.jpg', 'Historic riverfront buildings along the Varanasi ghats', 'A ghat hotel can be magical, but arrival and departure logistics must be understood before booking.']]
  },
  {
    n: 15,
    path: 'blogs/post/varanasi-prayagraj-ayodhya-itinerary/index.html',
    url: '/blogs/post/varanasi-prayagraj-ayodhya-itinerary/',
    title: 'How to Combine Varanasi, Prayagraj & Ayodhya',
    description: 'A practical private route through Varanasi, Prayagraj and Ayodhya with sensible nights, road sectors, temple access and river experiences.',
    group: 'Sacred North India',
    hero: '/assets/images/user/prayagraj-sangam.jpg',
    photos: [['/assets/images/user/ayodhya-ram-mandir.jpg', 'Shri Ram Janmabhoomi Mandir in Ayodhya', 'The route works best when Prayagraj is used as a proper stop rather than a hurried roadside detour.']]
  },
  {
    n: 21,
    path: 'blogs/post/buddhist-circuit-from-varanasi/index.html',
    url: '/blogs/post/buddhist-circuit-from-varanasi/',
    title: 'Buddhist Circuit from Varanasi: The Practical India–Nepal Route',
    description: 'How to plan the Buddhist circuit from Varanasi through Sarnath, Bodh Gaya, Rajgir, Nalanda, Kushinagar and Lumbini at a realistic overland pace.',
    group: 'Buddhist circuit',
    hero: '/assets/images/user/circuit-w09.jpeg',
    photos: [['/assets/images/user/circuit-w11.jpeg', 'Buddhist pilgrimage landscape in Bihar', 'The strongest circuit is built around realistic driving days and meaningful time at the principal sacred sites.']]
  }
];

const newArticles = [
  {
    n: 13,
    url: '/blogs/post/first-time-in-ayodhya/',
    path: 'blogs/post/first-time-in-ayodhya/index.html',
    title: 'First Time in Ayodhya: Ram Mandir, Walking & Practical Planning',
    description: 'A first-time Ayodhya guide covering Ram Mandir, Hanuman Garhi, Kanak Bhawan, Ram Ki Paidi, walking, e-rickshaws and realistic temple access.',
    group: 'Sacred North India',
    kind: 'single', dests: ['ayodhya'],
    hero: '/assets/images/user/ayodhya-ram-mandir.jpg',
    photos: [['/assets/images/user/ayodhya-ram-mandir.jpg', 'Shri Ram Janmabhoomi Mandir in Ayodhya', 'The main temple is the anchor of the visit, but the city makes more sense when the Sarayu and older sacred sites are included.']],
    quick: 'For most first-time visitors, one full day is the minimum and two nights is more comfortable. Expect walking or local e-rickshaw movement near the sacred core because private vehicles cannot simply drive to every temple entrance.',
    intro: 'Ayodhya has changed quickly around the new Ram Mandir, and that makes practical planning more important than ever. The best visit balances the principal darshan with older temples, the Sarayu riverfront and enough time for security and pedestrian movement.'
  },
  {
    n: 14,
    url: '/blogs/post/prayagraj-one-day-guide/',
    path: 'blogs/post/prayagraj-one-day-guide/index.html',
    title: 'Prayagraj in One Day: Sangam, Temples & Practical Route',
    description: 'A realistic one-day Prayagraj plan with Triveni Sangam, boat logistics, Bade Hanuman Ji, Alopi Devi, Anand Bhavan and practical timing.',
    group: 'Sacred North India',
    kind: 'single', dests: ['prayagraj'],
    hero: '/assets/images/user/prayagraj-sangam.jpg',
    photos: [['/assets/images/user/prayagraj-sangam.jpg', 'Boats at Triveni Sangam in Prayagraj', 'The Sangam should be the anchor of the day, with the remaining visits arranged around river and crowd conditions.']],
    quick: 'A useful one-day Prayagraj visit starts at Triveni Sangam, then adds selected temples and one heritage stop. On major bathing dates the same route can take far longer because barricades and vehicle restrictions change completely.',
    intro: 'Prayagraj is often treated as a quick stop between Varanasi and Ayodhya, but the city deserves a properly sequenced half or full day. The key is to begin with the Sangam while energy is high and keep the rest of the programme flexible.'
  },
  {
    n: 16,
    url: '/blogs/post/mathura-vrindavan-two-days/',
    path: 'blogs/post/mathura-vrindavan-two-days/index.html',
    title: 'Mathura & Vrindavan in 2 Days: A Practical First-Time Itinerary',
    description: 'How to divide two days between Mathura and Vrindavan without racing through temples, with practical advice on crowds, walking and evening visits.',
    group: 'Sacred North India',
    kind: 'combo', dests: ['mathura', 'vrindavan'],
    hero: '/assets/images/destinations/vrindavan-prem-mandir.jpg',
    photos: [
      ['/assets/images/destinations/mathura-janmabhoomi.jpg', 'Shri Krishna Janmasthan in Mathura', 'Mathura is best treated as its own pilgrimage city rather than a brief stop before Vrindavan.'],
      ['/assets/images/destinations/vrindavan-iskcon.jpg', 'ISKCON Krishna Balaram Mandir in Vrindavan', 'Two days gives enough room to separate Mathura from the more concentrated temple rhythm of Vrindavan.']
    ],
    quick: 'Use one day for Mathura and one for Vrindavan. Trying to cover both cities, Govardhan, Barsana and Nandgaon in the same two days usually creates more road and queue time than meaningful temple time.',
    intro: 'Mathura and Vrindavan are close on the map but they do not feel like the same destination. A two-day first visit works because it gives each place a distinct block of time and leaves room for temple queues, short walks and an evening atmosphere.'
  },
  {
    n: 17,
    url: '/blogs/post/banke-bihari-vrindavan-temples/',
    path: 'blogs/post/banke-bihari-vrindavan-temples/index.html',
    title: 'Banke Bihari & Vrindavan Temples: What Visitors Should Know',
    description: 'A practical guide to Banke Bihari and the main Vrindavan temples, including crowds, walking, local transport, temple rhythm and sensible sequencing.',
    group: 'Sacred North India',
    kind: 'single', dests: ['vrindavan'],
    hero: '/assets/images/destinations/vrindavan-radhavallabh.jpg',
    photos: [['/assets/images/destinations/vrindavan-prem-mandir.jpg', 'Prem Mandir in Vrindavan', 'A calmer evening visit can balance the intensity of old Vrindavan and Banke Bihari earlier in the day.']],
    quick: 'Banke Bihari is an active pilgrimage temple in a dense pedestrian area, not a monument with predictable sightseeing flow. Start early, carry very little, and use a guide who can adjust the sequence when crowd controls change.',
    intro: 'Vrindavan rewards travellers who understand that the temples operate according to worship, not tourist convenience. The most famous shrines are spread between dense old lanes and newer temple districts, so the route matters as much as the list of names.'
  },
  {
    n: 18,
    url: '/blogs/post/agra-one-day/',
    path: 'blogs/post/agra-one-day/index.html',
    title: 'Agra in One Day: Taj Mahal, Agra Fort & What Is Realistically Possible',
    description: 'A realistic one-day Agra itinerary focused on the Taj Mahal and Agra Fort, with advice on Friday closure, security, walking and optional additions.',
    group: 'Sacred North India',
    kind: 'single', dests: ['agra'],
    hero: '/assets/images/destinations/agra-taj-mahal.jpg',
    photos: [['/assets/images/destinations/agra-fort.jpg', 'Agra Fort in Agra', 'Agra Fort gives the political and architectural context that a Taj-only visit misses.']],
    quick: 'For one day in Agra, prioritise the Taj Mahal and Agra Fort. Add Mehtab Bagh or Itmad-ud-Daulah only if arrival time, season and your pace genuinely allow it. The Taj Mahal is closed to general visitors on Fridays.',
    intro: 'Agra can be done well in one day, but only if the day is built around two major monuments rather than a long checklist. The Taj Mahal deserves the freshest part of the day; Agra Fort then explains the imperial city around it.'
  },
  {
    n: 19,
    url: '/blogs/post/delhi-gateway-sacred-north-india/',
    path: 'blogs/post/delhi-gateway-sacred-north-india/index.html',
    title: 'Delhi as the Gateway to Agra, Mathura, Vrindavan & Sacred North India',
    description: 'How to use Delhi intelligently as the arrival gateway for Agra, Braj, Ayodhya, Prayagraj and Varanasi without forcing unnecessary sightseeing.',
    group: 'Sacred North India',
    kind: 'single', dests: ['delhi'],
    hero: '/assets/images/destinations/delhi-india-gate.jpg',
    photos: [['/assets/images/destinations/delhi-red-fort.jpg', 'Red Fort in Old Delhi', 'Delhi deserves a focused sightseeing day only when the capital itself is part of your travel priorities.']],
    quick: 'Delhi is often the best international gateway even when it is not the main destination. If your priorities are Agra, Mathura, Vrindavan and the sacred cities farther east, it can be smarter to use Delhi for arrival, rest and onward movement rather than forcing a full city tour.',
    intro: 'Many North India journeys begin at Delhi Airport, but that does not mean every itinerary needs the same standard Delhi sightseeing day. The right choice depends on flight timing, jet lag, onward road distance and whether the capital itself is important to you.'
  },
  {
    n: 20,
    url: '/blogs/post/lucknow-one-day-guide/',
    path: 'blogs/post/lucknow-one-day-guide/index.html',
    title: 'One Day in Lucknow: A Practical Heritage & Food Itinerary',
    description: 'A practical one-day Lucknow route through Bara Imambara, Rumi Darwaza, Chhota Imambara, the Residency and an optional evening food experience.',
    group: 'Sacred North India',
    kind: 'single', dests: ['lucknow'],
    hero: '/assets/images/user/circuit-w10.jpeg',
    photos: [['/assets/images/user/circuit-w10.jpeg', 'A heritage stop during a private North India journey', 'Lucknow works best when the major Awadhi monuments are grouped geographically and the evening is left for food rather than more driving.']],
    quick: 'A good Lucknow day focuses on the old-city Imambara complex, the Residency and one or two carefully chosen additions. Leave the evening for food if that interests you instead of trying to add another distant monument after dark.',
    intro: 'Lucknow is much easier to enjoy when the day follows the geography of the city. The architecture of the Nawabs, the story of 1857 and the city’s food traditions belong together, but they should not be squeezed into an unrealistic hour-by-hour checklist.'
  },
  {
    n: 22,
    url: '/blogs/post/bodh-gaya-travel-guide/',
    path: 'blogs/post/bodh-gaya-travel-guide/index.html',
    title: 'Bodh Gaya: How to Plan a Meaningful Visit',
    description: 'How to plan Bodh Gaya around the Mahabodhi Temple, Bodhi Tree, monasteries, Sujata and Dungeshwari without turning pilgrimage into a rushed checklist.',
    group: 'Buddhist circuit',
    kind: 'single', dests: ['bodh-gaya'],
    hero: '/assets/images/user/circuit-w09.jpeg',
    photos: [['/assets/images/user/circuit-w08.jpeg', 'Buddhist pilgrimage visit in Bodh Gaya', 'Bodh Gaya becomes more meaningful when there is time to return to the Mahabodhi complex rather than seeing it only once.']],
    quick: 'Two nights is our preferred minimum for Bodh Gaya. It allows an arrival evening, one full day for the Mahabodhi complex and wider sacred landscape, and a quieter morning before continuing to Rajgir and Nalanda.',
    intro: 'Bodh Gaya is the spiritual centre of the Buddhist circuit, and its value is not measured by how many monasteries can be photographed in one afternoon. A meaningful visit needs time at the Mahabodhi Temple and Bodhi Tree, plus a small number of wider sites that explain the Buddha’s journey toward enlightenment.'
  },
  {
    n: 23,
    url: '/blogs/post/rajgir-nalanda-guide/',
    path: 'blogs/post/rajgir-nalanda-guide/index.html',
    title: 'Rajgir & Nalanda: A Practical Buddhist Heritage Day',
    description: 'How to combine Rajgir and Nalanda realistically, including Vulture’s Peak, the Peace Pagoda, Venu Van, Nalanda ruins and museum planning.',
    group: 'Buddhist circuit',
    kind: 'combo', dests: ['rajgir', 'nalanda'],
    hero: '/assets/images/user/circuit-w11.jpeg',
    photos: [
      ['/assets/images/user/circuit-w11.jpeg', 'Rajgir on the Buddhist circuit', 'Rajgir needs time for its hill landscape; the ropeway should never be the only plan for the day.'],
      ['/assets/images/user/circuit-w12.jpeg', 'Nalanda archaeological landscape', 'At Nalanda, good interpretation turns brick foundations into the story of a major monastic university.']
    ],
    quick: 'Rajgir and Nalanda can share one day, but only with sensible priorities. If Vulture’s Peak, the Peace Pagoda and a detailed Nalanda visit all matter, an overnight near Rajgir produces a better pace than racing onward to Patna the same evening.',
    intro: 'Rajgir and Nalanda are close enough to combine, yet they offer very different experiences. Rajgir is a sacred hill landscape tied to the Buddha’s teaching life; Nalanda is an archaeological and intellectual landscape that needs careful interpretation.'
  },
  {
    n: 24,
    url: '/blogs/post/kushinagar-lumbini-guide/',
    path: 'blogs/post/kushinagar-lumbini-guide/index.html',
    title: 'Kushinagar to Lumbini: Border Crossing & Pilgrimage Planning',
    description: 'A practical guide to linking Kushinagar and Lumbini, with realistic road timing, India–Nepal border formalities, pilgrimage pacing and key sacred sites.',
    group: 'Buddhist circuit',
    kind: 'combo', dests: ['kushinagar', 'lumbini'],
    hero: '/assets/images/user/lumbini-1.jpg',
    photos: [
      ['/assets/images/user/kushinagar-temple.jpg', 'Mahaparinirvana pilgrimage area in Kushinagar', 'Kushinagar deserves quiet time at the Mahaparinirvana Temple and Ramabhar Stupa before the onward road journey.'],
      ['/assets/images/user/lumbini-monastic.jpg', 'International monastic zone in Lumbini', 'Lumbini is spread out; the Maya Devi sacred garden should be the anchor rather than trying to race through every monastery.']
    ],
    quick: 'Treat Kushinagar–Lumbini as an international road sector, not just another intercity transfer. Border procedures, vehicle arrangements and passport formalities can add time, so keep the day light and avoid placing a fixed flight connection immediately after the crossing.',
    intro: 'Kushinagar and Lumbini form one of the most important transitions on the Buddhist circuit: from the place associated with the Buddha’s Mahaparinirvana in India to his birthplace in Nepal. The route is straightforward when planned properly, but the international border makes timing less predictable than an ordinary domestic drive.'
  }
];

const allArticles = [...existingArticles, ...newArticles].sort((a, b) => a.n - b.n);

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function absoluteImage(src) {
  return src.startsWith('http') ? src : `${SITE}${src}`;
}

function cssLink(html) {
  if (html.includes(BLOG_CSS)) return html;
  return html.replace('</head>', `<link href="${BLOG_CSS}" rel="stylesheet"/></head>`);
}

function figure([src, alt, caption], marker) {
  return `<figure class="article-photo" data-blog-photo="${marker}"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async"/><figcaption>${esc(caption)}</figcaption></figure>`;
}

function proseWordCount(html) {
  const section = html.match(/<section class="section narrow prose">([\s\S]*?)<\/section>/i)?.[1] || html;
  return section
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function enhanceExisting(article) {
  let html = await readFile(article.path, 'utf8');
  html = cssLink(html);

  html = html.replace(/background-image:url\('[^']+'\)/, `background-image:url('${article.hero}')`);
  html = html.replace(/<meta content="[^"]+" property="og:image"\/>/, `<meta content="${absoluteImage(article.hero)}" property="og:image"/>`);
  html = html.replace(/<meta content="[^"]+" name="twitter:image"\/>/, `<meta content="${absoluteImage(article.hero)}" name="twitter:image"/>`);
  html = html.replace(/<link as="image" href="[^"]+" rel="preload"\/>/, `<link as="image" href="${article.hero}" rel="preload"/>`);

  if (!html.includes('data-blog-photo="primary"') && article.photos?.length) {
    const qaStart = html.indexOf('<div class="quick-answer">');
    const qaEnd = qaStart >= 0 ? html.indexOf('</div>', qaStart) : -1;
    if (qaEnd >= 0) {
      const insertAt = qaEnd + 6;
      html = `${html.slice(0, insertAt)}${figure(article.photos[0], 'primary')}${html.slice(insertAt)}`;
    }
  }

  if (!html.includes('data-blog-photo="secondary"') && article.photos?.[1]) {
    const anchor = html.indexOf('<div class="related-links"');
    const fallback = html.indexOf('<div class="pillar-cta"');
    const insertAt = anchor >= 0 ? anchor : fallback;
    if (insertAt >= 0) html = `${html.slice(0, insertAt)}${figure(article.photos[1], 'secondary')}${html.slice(insertAt)}`;
  }

  const count = proseWordCount(html);
  if (count < 450) throw new Error(`${article.path} has only ${count} prose words`);
  await writeFile(article.path, html);
  return count;
}

function relatedLinks(article, dests) {
  const custom = [];
  for (const d of dests) {
    for (const t of (d.tours || []).slice(0, 2)) {
      if (!custom.some((x) => x[1] === t[1])) custom.push(t);
    }
  }
  return custom.slice(0, 4);
}

function singleSections(article) {
  const d = destination(article.dests[0]);
  const sections = [
    [`Why ${d.name} needs realistic planning`, d.about[0]],
    [`How we would structure the visit`, d.about[1]],
    ...d.sights.slice(0, 3).map(([h, p]) => [h, p])
  ];
  return { dests: [d], sections };
}

function comboSections(article) {
  const [a, b] = article.dests.map(destination);
  const sections = [
    [`Start with ${a.name}`, a.about[0]],
    [`Continue with ${b.name}`, b.about[0]],
    ...a.sights.slice(0, 2).map(([h, p]) => [`${a.name}: ${h}`, p]),
    ...b.sights.slice(0, 2).map(([h, p]) => [`${b.name}: ${h}`, p])
  ];
  return { dests: [a, b], sections };
}

function renderNewArticle(article, header, footer) {
  const { dests, sections } = article.kind === 'combo' ? comboSections(article) : singleSections(article);
  const related = relatedLinks(article, dests);
  const canonical = `${SITE}${article.url}`;
  const photos = article.photos || [];

  let body = `<div class="breadcrumbs"><a href="/">Home</a> / <a href="/blogs/">Travel Guide</a> / ${esc(article.title)}</div>`;
  body += `<div class="page-hero"><div aria-label="${esc(article.title)}" class="frame" role="img" style="background-image:url('${article.hero}')"><div class="copy"><div class="eyebrow">Tour Varanasi Travel Guide</div><h1>${esc(article.title)}</h1><p>${esc(article.description)}</p></div></div></div>`;
  body += `<section class="section narrow prose"><div class="quick-answer"><strong>Quick answer</strong><p>${esc(article.quick)}</p></div><p class="article-intro">${esc(article.intro)}</p>`;

  sections.forEach(([heading, paragraph], index) => {
    body += `<h2>${esc(heading)}</h2><p>${esc(paragraph)}</p>`;
    if (index === 0 && photos[0]) body += figure(photos[0], 'primary');
    if (index === 2 && photos[1]) body += figure(photos[1], 'secondary');
  });

  body += `<h2>Practical planning notes</h2><p>We do not build this journey around fixed internet timings copied months in advance. Temple procedures, monument openings, traffic controls, road conditions and local access can change. The sensible approach is to confirm the important operating details close to travel, keep enough buffer around the most important visit, and avoid adding another major stop simply because it appears close on a map.</p><p>For senior travellers or anyone with limited mobility, tell us before travel rather than after arrival. We can shorten walking sections, choose more practical hotel locations, place rest time between outings and avoid combining several physically demanding visits in one block. Private transport is valuable, but in India’s sacred and heritage districts the final approach is often still pedestrian-controlled.</p>`;

  if (related.length) {
    body += '<div class="related-links"><h2>Related private journeys</h2>';
    for (const [name, href, summary] of related) body += `<p><a href="${href}">${esc(name)}</a> — ${esc(summary)}</p>`;
    body += '</div>';
  }
  body += `<div class="pillar-cta"><h2>Plan this journey privately</h2><p>Share your dates, interests and preferred pace. We will suggest a practical private programme rather than a generic sightseeing checklist.</p><p><a class="btn primary" href="/plan-my-journey/">Plan My Journey</a></p></div></section>`;

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    dateModified: TODAY,
    author: { '@type': 'Organization', name: 'Tour Varanasi' },
    publisher: { '@type': 'Organization', name: 'Tour Varanasi', url: SITE },
    image: absoluteImage(article.hero),
    mainEntityOfPage: canonical
  });
  const breadcrumbs = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Travel Guide', item: `${SITE}/blogs/` },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
    ]
  });

  const head = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><title>${esc(article.title)} | Tour Varanasi Travel Guide</title><meta content="${esc(article.description)}" name="description"/><meta content="index,follow" name="robots"/><link href="${canonical}" rel="canonical"/><meta content="article" property="og:type"/><meta content="${esc(article.title)}" property="og:title"/><meta content="${esc(article.description)}" property="og:description"/><meta content="${canonical}" property="og:url"/><meta content="${absoluteImage(article.hero)}" property="og:image"/><meta content="summary_large_image" name="twitter:card"/><meta content="${esc(article.title)}" name="twitter:title"/><meta content="${esc(article.description)}" name="twitter:description"/><meta content="${absoluteImage(article.hero)}" name="twitter:image"/><link as="image" href="${article.hero}" rel="preload"/><link href="/assets/favicon.svg" rel="icon" type="image/svg+xml"/><link href="/assets/css/style.css" rel="stylesheet"/><link href="${BLOG_CSS}" rel="stylesheet"/><script type="application/ld+json">${schema}</script><script type="application/ld+json">${breadcrumbs}</script></head>`;

  return `${head}<body>${header}${body}${footer}`;
}

function card(article) {
  return `<article class="blog-hub-card"><a class="blog-hub-image" href="${article.url}"><img src="${article.hero}" alt="${esc(article.title)}" loading="lazy" decoding="async"/></a><div class="blog-hub-body"><div class="eyebrow">Guide ${String(article.n).padStart(2, '0')}</div><h3><a href="${article.url}">${esc(article.title)}</a></h3><p>${esc(article.description)}</p><a class="blog-read" href="${article.url}">Read guide →</a></div></article>`;
}

function renderBlogIndexSection() {
  const groups = ['Varanasi essentials', 'Varanasi experiences', 'Sacred North India', 'Buddhist circuit'];
  let html = '<section class="section blog-hub"><div class="eyebrow">Tour Varanasi Travel Guide</div><h2>24 practical guides built from on-ground experience.</h2><p class="lede">Useful planning advice for Varanasi and the journeys around it — access, walking, realistic timings, river conditions, temple logistics, road sectors and what we would actually prioritise for a private traveller.</p>';
  for (const group of groups) {
    const items = allArticles.filter((a) => a.group === group);
    html += `<div class="blog-cluster"><div class="blog-cluster-heading"><div class="eyebrow">${esc(group)}</div><h2>${group === 'Buddhist circuit' ? 'Buddhist India & Nepal' : esc(group)}</h2></div><div class="blog-hub-grid">${items.map(card).join('')}</div></div>`;
  }
  html += '</section>';
  return html;
}

async function updateIndex() {
  let html = await readFile('blogs/index.html', 'utf8');
  html = cssLink(html);
  html = html.replace(/background-image:url\('[^']+'\)/, "background-image:url('/assets/images/user/sunrise-ganges.jpg')");
  html = html.replace(/<meta content="[^"]+" property="og:image"\/>/, `<meta content="${SITE}/assets/images/user/sunrise-ganges.jpg" property="og:image"/>`);
  html = html.replace(/<meta content="[^"]+" name="twitter:image"\/>/, `<meta content="${SITE}/assets/images/user/sunrise-ganges.jpg" name="twitter:image"/>`);
  html = html.replace(/<link as="image" href="[^"]+" rel="preload"\/>/, '<link as="image" href="/assets/images/user/sunrise-ganges.jpg" rel="preload"/>');
  const start = html.indexOf('<section class="section narrow">');
  const quote = html.indexOf('<section class="quote-wrap"', start);
  if (start < 0 || quote < 0) throw new Error('Could not locate blog index content section');
  html = `${html.slice(0, start)}${renderBlogIndexSection()}${html.slice(quote)}`;
  await writeFile('blogs/index.html', html);
}

async function updateSitemap() {
  let xml = await readFile('sitemap.xml', 'utf8');
  for (const article of allArticles) {
    const loc = `${SITE}${article.url}`;
    if (xml.includes(`<loc>${loc}</loc>`)) continue;
    const entry = `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod></url>\n`;
    xml = xml.replace('</urlset>', `${entry}</urlset>`);
  }
  await writeFile('sitemap.xml', xml);
}

const template = await readFile('blogs/post/ganga-aarti-varanasi-guide/index.html', 'utf8');
const bodyStart = template.indexOf('<body>') + 6;
const headerEnd = template.indexOf('</header>', bodyStart) + 9;
const footerStart = template.indexOf('<footer class="footer"');
if (bodyStart < 6 || headerEnd < 9 || footerStart < 0) throw new Error('Could not extract blog template shell');
const sharedHeader = template.slice(bodyStart, headerEnd);
const sharedFooter = template.slice(footerStart);

const results = [];
for (const article of existingArticles) {
  const words = await enhanceExisting(article);
  results.push([article.n, words, 'enhanced']);
}

for (const article of newArticles) {
  const html = renderNewArticle(article, sharedHeader, sharedFooter);
  const words = proseWordCount(html);
  if (words < 500) throw new Error(`${article.path} generated only ${words} prose words`);
  await mkdir(dirname(article.path), { recursive: true });
  await writeFile(article.path, html);
  results.push([article.n, words, 'created']);
}

await updateIndex();
await updateSitemap();

results.sort((a, b) => a[0] - b[0]);
console.log(`Prepared ${results.length} Tour Varanasi travel guides.`);
for (const [n, words, action] of results) console.log(`${String(n).padStart(2, '0')}: ${words} prose words — ${action}`);
console.log('Updated blogs/index.html and sitemap.xml.');
