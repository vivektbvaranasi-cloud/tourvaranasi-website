import fs from 'node:fs';

// Add useful next steps inside the article, after generation and content refinements.
export const luxuryGuideLinks = [
  ['travel-guide/first-time-in-varanasi/index.html', 'Suggested first-time itineraries', '<p>Prefer to explore with someone who can explain the rituals and adjust the walking? Read about <a href="/travel-guide/private-tour-guide-varanasi/">private guide costs and booking options in Varanasi</a>, including guide-only arrangements and what to include. For a complete stay, see our <a href="/blogs/post/luxury-varanasi-tour/">two-night luxury Varanasi itinerary</a>, with Sankalp Aarti, a private sunrise boat with flute music and Sarnath.</p>'],
  ['blogs/post/kashi-vishwanath-temple-darshan-guide/index.html', 'Continue planning', '<p>To place the temple visit within a complete stay, explore our <a href="/blogs/post/luxury-varanasi-tour/">luxury Varanasi tour with Kashi Vishwanath darshan</a>, Sankalp Aarti and a private sunrise boat experience. If you only need local guiding, read about <a href="/travel-guide/private-tour-guide-varanasi/">private guide costs and booking in Varanasi</a>. Temple services and their availability are confirmed separately in your quotation.</p>'],
  ['blogs/post/ganga-aarti-varanasi-guide/index.html', 'Related private journeys', '<p>If participating in Sankalp Aarti is a priority, our <a href="/blogs/post/luxury-varanasi-tour/">luxury Varanasi itinerary with Sankalp Aarti</a> combines the evening ceremony with a decorated private sunrise boat, flute music, temple visits and Sarnath. The itinerary explains the included arrangements and separately quoted services.</p>'],
  ['blogs/post/sunrise-boat-ride-varanasi-guide/index.html', 'Related private journeys', '<p>For a morning with live flute music on a decorated private boat, see our <a href="/blogs/post/luxury-varanasi-tour/">luxury Varanasi tour with a private sunrise boat</a>. The two-night programme also includes an old-city walk, temple visits, Sankalp Aarti and Sarnath. Boat operations remain subject to river conditions and local permission.</p>'],
  ['blogs/post/brijrama-palace-varanasi/index.html', 'Our booking advice', '<p>Already chosen a riverfront hotel? Our <a href="/blogs/post/luxury-varanasi-tour/">luxury Varanasi itinerary</a> can be arranged around accommodation you have booked. It brings together private guiding, Sankalp Aarti, a sunrise boat with flute music and Sarnath, with the final approach to your hotel planned around its access.</p>'],
  ['blogs/post/where-to-stay-in-varanasi/index.html', 'Our usual recommendation process', '<p>Once you have chosen between riverfront atmosphere and easier road access, use our <a href="/blogs/post/luxury-varanasi-tour/">luxury Varanasi tour</a> to plan the experiences around your hotel. We can quote the private ground arrangements alone or discuss accommodation as part of your stay.</p>'],
  ['blogs/post/first-time-in-ayodhya/index.html', 'Practical planning notes', '<p>For a complete two-night stay, see our <a href="/blogs/post/luxury-ayodhya-tour/">luxury Ayodhya tour with Ram Mandir and Saryu Aarti</a>. It combines a Ram Ki Paidi walk, Kaleram and Nageshwar Nath temples, reserved Aarti seating and deep daan, followed by the principal temples the next morning. Read the itinerary for the darshan arrangements, hotel options, inclusions and exclusions.</p>'],
  ['travel-guide/ayodhya-ram-mandir-wheelchair-assistance/index.html', 'Frequently Asked Questions', '<p>Families planning more than the temple visit can use our <a href="/blogs/post/luxury-ayodhya-tour/">two-night luxury Ayodhya itinerary</a> as a starting point. Tell us about walking limits and wheelchair needs before booking so we can adapt the temple visits, riverfront time and hotel choice. Wheelchair assistance and access arrangements must be confirmed specifically for your party.</p>'],
  ['blogs/post/lucknow-one-day-guide/index.html', 'Practical planning notes', '<p>If you can stay two nights, our <a href="/blogs/post/luxury-lucknow-tour/">luxury Lucknow tour with an evening food walk</a> gives the city more time. The following day covers the Imambaras, Rumi Darwaza, the art gallery, the British Residency and a Dilkusha Kothi photo stop. The article also explains the optional hosted meal, hotel arrangements and what is included.</p>'],
];

export function enquiryActions(label, route, includeForm = false) {
  const message = `Namaskar, I would like a quotation for ${label}. Travel dates: ; Guests: ; Hotel or arrival point: ; Interests and walking needs: . Article: https://www.tourvaranasi.com${route}`;
  return `<div class="guide-enquiry-actions"><a class="btn primary" href="https://wa.me/917457905011?text=${encodeURIComponent(message)}">Enquire on WhatsApp</a><a class="btn" href="mailto:tours@tourvaranasi.com?subject=${encodeURIComponent(label + ' enquiry')}&amp;body=${encodeURIComponent(message)}">Enquire by email</a>${includeForm ? '<a class="btn" href="/plan-my-journey/">Request a tailored quotation</a>' : ''}</div>`;
}

export function applyLuxuryGuideLinks() {
  let guides = 0;
  for (const [file, heading, paragraph] of luxuryGuideLinks) {
    // Some guides exist only after build-blogs runs in the production build.
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<!-- TV_LUXURY_GUIDE_START -->[\s\S]*?<!-- TV_LUXURY_GUIDE_END -->\s*/g, '');
    const match = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].find(m => m[1].replace(/<[^>]*>/g, '').trim() === heading);
    if (!match) throw new Error(`Luxury guide link placement missing: ${file}: ${heading}`);
    const block = `<!-- TV_LUXURY_GUIDE_START -->${paragraph}<!-- TV_LUXURY_GUIDE_END -->`;
    html = html.slice(0, match.index) + block + html.slice(match.index);
    fs.writeFileSync(file, html);
    guides++;
  }
  for (const city of ['varanasi', 'ayodhya', 'lucknow']) {
    const slug = `luxury-${city}-tour`;
    const route = `/blogs/post/${slug}/`;
    const file = `blogs/post/${slug}/index.html`;
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8').replace(/<!-- TV_LUXURY_CONTACT_START -->[\s\S]*?<!-- TV_LUXURY_CONTACT_END -->/g, '');
    const heading = new RegExp(`(<h2 id="enquiry-${slug}">[\\s\\S]*?<\\/h2>)`);
    if (!heading.test(html)) throw new Error(`Luxury enquiry heading missing: ${file}`);
    const label = `the luxury ${city[0].toUpperCase() + city.slice(1)} tour`;
    html = html.replace(heading, (_, h2) => h2 + `<!-- TV_LUXURY_CONTACT_START --><p>Send your dates, number of guests and hotel preference on WhatsApp or email, or use the enquiry form below.</p>${enquiryActions(label, route)}<!-- TV_LUXURY_CONTACT_END -->`);
    fs.writeFileSync(file, html);
  }
  console.log(`Luxury itinerary links added to ${guides} relevant guides; direct enquiry options added to luxury articles.`);
}
