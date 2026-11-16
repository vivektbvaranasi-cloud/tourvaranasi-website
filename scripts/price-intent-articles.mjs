import { readFileSync } from 'node:fs';

// One source of truth for published starting rates. The guides are regenerated
// from the same catalogue used by the tour cards and price panels.
const catalogue = JSON.parse(readFileSync(new URL('./tour-pricing.json', import.meta.url), 'utf8'));
const rates = new Map(catalogue.items.map(item => [item.url, item]));

function formatPrice(url, guests = 1) {
  const rate = rates.get(url);
  if (!rate || !Number.isFinite(rate.price) || rate.minimumGuests !== 2 || !catalogue.gstIncluded) {
    throw new Error(`Missing or incompatible published tour price: ${url}`);
  }
  return `Rs. ${(rate.price * guests).toLocaleString('en-IN')}`;
}

function content(name) {
  return readFileSync(new URL(`./article-content/${name}.html.inc`, import.meta.url), 'utf8')
    .replace(/\{\{(price|two-guests):([^}]+)\}\}/g, (match, type, url) =>
      formatPrice(url, type === 'two-guests' ? 2 : 1));
}

function enquiry(title, lead) {
  return `<section class="price-intent-enquiry" aria-label="Request a private tour quotation">
    <h2>Get an exact price for your travel dates</h2>
    <p>${lead} We will confirm the route, services, total cost and any optional supplements before you book.</p>
    <form name="journey-enquiry" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="company-website">
      <input type="hidden" name="form-name" value="journey-enquiry">
      <p hidden><label>Leave this empty <input name="company-website"></label></p>
      <label>Your name <input name="name" required></label>
      <label>Email or WhatsApp <input name="contact" required></label>
      <input type="hidden" name="journey-interest" value="${title}">
      <button type="submit">Request my private quotation</button>
    </form>
    <p><a href="/plan-my-journey/">Or tell us more about your journey</a></p>
  </section>`;
}

export const priceIntentArticles = [
  {
    n: 61, kind: 'custom', editorial: true, published: '2026-11-16', publicationOrder: 4,
    group: 'Ayodhya pilgrimage',
    url: '/blogs/post/ayodhya-private-tour-cost/',
    path: 'blogs/post/ayodhya-private-tour-cost/index.html',
    title: 'Ayodhya Tour Cost 2026–2027: Private 1, 2 & 3 Day Packages',
    seoTitle: 'Ayodhya Tour Package Cost 2026–27 | 1, 2 & 3 Days',
    description: 'Compare Ayodhya private tour prices for one, two or three days, including local transport, guide, temple planning and exclusions. GST-inclusive rates from Rs. 6,500 per person.',
    hero: '/assets/images/user/ayodhya-ram-mandir.jpg',
    heroAlt: 'Shri Ram Janmabhoomi Mandir in Ayodhya',
    content: content('ayodhya-private-tour-cost'),
    ctaHtml: enquiry('Ayodhya Tour Cost 2026–2027: Private 1, 2 & 3 Day Packages', 'Share your arrival city, group size, dates and any senior-citizen requirements.')
  },
  {
    n: 62, kind: 'custom', editorial: true, published: '2026-11-16', publicationOrder: 3,
    group: 'Lucknow heritage',
    url: '/blogs/post/lucknow-private-tour-cost/',
    path: 'blogs/post/lucknow-private-tour-cost/index.html',
    title: 'Lucknow Tour Cost 2026–2027: Private 1, 2 & 3 Day Packages',
    seoTitle: 'Lucknow Tour Package Cost 2026–27 | 1, 2 & 3 Days',
    description: 'Lucknow tour package prices for private one-, two- and three-day heritage tours, with car, guide and included monument tickets. GST-inclusive rates from Rs. 6,500 per person.',
    hero: '/assets/images/featured/lucknow-bara-imambara.webp',
    heroAlt: 'Bara Imambara complex in Lucknow',
    content: content('lucknow-private-tour-cost'),
    ctaHtml: enquiry('Lucknow Tour Cost 2026–2027: Private 1, 2 & 3 Day Packages', 'Tell us whether you prefer heritage sightseeing, an Awadhi food walk or a slower private visit.')
  },
  {
    n: 63, kind: 'custom', editorial: true, published: '2026-11-16', publicationOrder: 2,
    group: 'Prayagraj pilgrimage',
    url: '/blogs/post/varanasi-to-prayagraj-day-tour-cost/',
    path: 'blogs/post/varanasi-to-prayagraj-day-tour-cost/index.html',
    title: 'Varanasi to Prayagraj Day Tour Cost: Private Sangam Boat, Car & Guide',
    seoTitle: 'Varanasi to Prayagraj Day Tour Price | Sangam Boat & Car',
    description: 'A private Varanasi–Prayagraj day trip starts from Rs. 8,000 per person for two guests, including return sedan, local guide and private Sangam boat. See the itinerary and exclusions.',
    hero: '/assets/images/user/prayagraj-sangam.jpg',
    heroAlt: 'Boats at Triveni Sangam in Prayagraj',
    content: content('varanasi-to-prayagraj-day-tour-cost'),
    ctaHtml: enquiry('Varanasi to Prayagraj Day Tour Cost', 'Let us know your Varanasi hotel, passenger count and whether Sangam is your main priority.')
  },
  {
    n: 64, kind: 'custom', editorial: true, published: '2026-11-16', publicationOrder: 1,
    group: 'Buddhist circuit',
    url: '/blogs/post/varanasi-to-bodhgaya-day-trip-cost/',
    path: 'blogs/post/varanasi-to-bodhgaya-day-trip-cost/index.html',
    title: 'Varanasi to Bodhgaya Day Trip Cost: Private Car, Guide & Itinerary',
    seoTitle: 'Varanasi to Bodhgaya Day Trip Price | Private Car & Guide',
    description: 'Plan a same-day private trip from Varanasi to Bodhgaya from Rs. 8,000 per person for two guests, including return sedan and local guide. Know the long road day, inclusions and options.',
    hero: '/assets/images/user/circuit-w06.jpeg',
    heroAlt: 'Pilgrims beneath the sacred Bodhi Tree at the Mahabodhi Temple complex in Bodhgaya',
    content: content('varanasi-to-bodhgaya-day-trip-cost'),
    ctaHtml: enquiry('Varanasi to Bodhgaya Day Trip Cost', 'Share your dates, hotel, interests in Buddhist history and preferred daily pace.')
  }
];
