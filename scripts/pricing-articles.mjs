import { readFileSync } from 'node:fs';

const content = name => readFileSync(new URL(`./article-content/${name}.html.inc`, import.meta.url), 'utf8');
export const pricingArticles = [
  {
    n: 51, kind: 'custom', editorial: true, published: '2026-10-31', publicationOrder: 2,
    group: 'Varanasi essentials',
    url: '/blogs/post/varanasi-experience-prices/',
    path: 'blogs/post/varanasi-experience-prices/index.html',
    title: 'Varanasi Experience Prices: Boat Rides, Heritage Walks, Food & Culture',
    seoTitle: 'Varanasi Experience Prices: Boat Rides, Walks & Food Tours',
    description: 'Explore Varanasi experience prices for private boat rides, heritage walks, food tours, cooking, yoga and cultural performances, with clear inclusions.',
    hero: '/assets/images/guest_joyful_boat.webp',
    heroAlt: 'Guests enjoying a private boat experience on the Ganges in Varanasi',
    content: content('varanasi-experience-prices')
  },
  {
    n: 52, kind: 'custom', editorial: true, published: '2026-10-31', publicationOrder: 1,
    group: 'Sacred North India',
    url: '/blogs/post/varanasi-ayodhya-prayagraj-tour-cost/',
    path: 'blogs/post/varanasi-ayodhya-prayagraj-tour-cost/index.html',
    title: 'Varanasi, Ayodhya & Prayagraj Tour Package Cost: A Private Journey Budget Guide',
    seoTitle: 'Varanasi, Ayodhya & Prayagraj Tour Cost | Private Packages',
    description: 'Plan your Varanasi, Ayodhya and Prayagraj private tour with starting prices, clear inclusions, hotel exclusions and practical advice for your pilgrimage.',
    hero: '/assets/images/user/prayagraj-sangam.jpg',
    heroAlt: 'Boats at the sacred Sangam in Prayagraj',
    content: content('varanasi-ayodhya-prayagraj-tour-cost')
  }
];
