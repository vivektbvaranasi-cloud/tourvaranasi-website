import { readFileSync } from 'node:fs';

const guides = [
  {
    n: 79,
    slug: "ayodhya-ram-mandir-darshan-guide",
    title: "Ayodhya Ram Mandir Darshan Guide for First-Time Visitors",
    description: "Plan Ram Lalla darshan in Ayodhya, from choosing a pass and reaching the entrance to arranging a wheelchair, a family meeting point and time for aarti.",
    hero: "/assets/images/user/ayodhya-ram-mandir.jpg",
    heroAlt: "Shri Ram Mandir in Ayodhya",
    group: "Ayodhya pilgrimage",
    enquiry: "Tell us your dates, the size of your family and whether anyone needs help with the approach to the temple.",
  },
  {
    n: 80,
    slug: "lucknow-food-walk-chowk-aminabad",
    title: "A Lucknow Food Walk Through Chowk and Aminabad",
    description: "What to order at Tunday Kababi, Raheem’s, Idris and Prakash Kulfi, plus a vegetarian breakfast alternative and a practical route between the two markets.",
    hero: "/assets/images/regional-luxury/lucknow-food.webp",
    heroAlt: "Kebabs served with onions and accompaniments in Lucknow",
    group: "Lucknow food",
    enquiry: "Tell us which dishes you want to try, any dietary requirements and whether you would like a breakfast walk or an evening in the markets.",
  },
  {
    n: 81,
    slug: "bodh-gaya-meet-a-monk-mahabodhi-temple",
    title: "Can You Meet a Monk at Mahabodhi Temple in Bodh Gaya?",
    description: "How to request a conversation with a Buddhist monk, choose a suitable place inside the Mahabodhi complex and plan around prayer, language and consent.",
    hero: "/assets/images/user/circuit-w09.jpeg",
    heroAlt: "Bodh Gaya on the Buddhist pilgrimage circuit",
    group: "Bodh Gaya pilgrimage",
    enquiry: "Share your dates, language and interests so our team can enquire about a suitable introduction.",
  },
  {
    n: 82,
    slug: "lumbini-one-day-itinerary-maya-devi-temple",
    title: "One Day in Lumbini from Maya Devi Temple to the Monastic Zone",
    description: "A one-day Lumbini itinerary for the Buddha’s birthplace in Nepal, with Maya Devi Temple, the Ashoka Pillar, the sacred pond and a choice of monasteries.",
    hero: "/assets/images/user/lumbini-1.jpg",
    heroAlt: "Lumbini on the Buddhist pilgrimage circuit in Nepal",
    group: "Lumbini itinerary",
    enquiry: "Tell us your arrival point, onward plans and which monasteries or pilgrimage sites you would like to see.",
  },
];

export const pilgrimageFoodArticles = guides.map(({ slug, enquiry, ...guide }) => {
  const url = `/blogs/post/${slug}/`;
  return {
    ...guide,
    url,
    path: `blogs/post/${slug}/index.html`,
    kind: 'custom',
    editorial: true,
    published: '2026-11-26',
    seoTitle: guide.title,
    content: readFileSync(new URL(`./article-content/${slug}.html.inc`, import.meta.url), 'utf8'),
    ctaHtml: `<aside class="tv-editorial"><div class="enquiry"><p>${enquiry}</p><p><a href="/plan-my-journey/">Ask Tour Varanasi about your visit</a></p></div></aside>`,
  };
});
