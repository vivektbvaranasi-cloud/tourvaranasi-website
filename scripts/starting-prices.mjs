import fs from 'node:fs';
import path from 'node:path';

const catalogue = JSON.parse(fs.readFileSync('scripts/tour-pricing.json', 'utf8'));
const prices = new Map(catalogue.items.map(item => [item.url, item]));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const amount = item => item.price.toLocaleString('en-IN');
const label = item => item.price === null ? 'Request a quote' : `From ₹${amount(item)}`;
const basis = item => item.price === null ? 'Tailored to your dates and group' : [item.unit, item.duration, item.minimumGuests === 2 ? 'minimum 2 guests' : null, 'GST included'].filter(Boolean).join(' · ');
const marker = (name, content) => `<!-- TV_${name}_START -->${content}<!-- TV_${name}_END -->`;
const cardPrice = item => marker('CARD_PRICE', `<span class="tv-card-price"><strong>${label(item)}</strong><small>${esc(basis(item))}</small></span>`);

function htmlFiles(dir = '.') {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    if (entry.name.startsWith('.') || ['node_modules', 'scripts'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

let pageCount = 0, cardCount = 0;
for (const file of htmlFiles()) {
  let html = fs.readFileSync(file, 'utf8');
  // Generated fragments are removed first so full and partial rebuilds agree.
  html = html.replace(/<!-- TV_(?:STARTING_PRICE|PRICE_SUMMARY|CARD_PRICE)_START -->[\s\S]*?<!-- TV_(?:STARTING_PRICE|PRICE_SUMMARY|CARD_PRICE)_END -->/g, '');
  html = html.replace(/<link\b[^>]*href=["']\/assets\/css\/starting-prices\.css[^"']*["'][^>]*>\s*/g, '');

  const url = '/' + file.replace(/index\.html$/, '').replaceAll(path.sep, '/');
  const item = prices.get(url);
  if (item) {
    html = html.replace(/<!-- TV_RATE_START -->[\s\S]*?<!-- TV_RATE_END -->/g, '');
    html = html.replace(/<section\b[^>]*class="[^"]*experience-price-note[^"]*"[^>]*>[\s\S]*?<\/section>/g, '');
    const summary = marker('PRICE_SUMMARY', `<div class="tv-price-summary"><strong>${label(item)}</strong><span>${esc(basis(item))}</span><a href="#tour-price">${item.price === null ? 'Quotation details' : 'View price details'}</a></div>`);
    html = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/, '$1' + summary);
    const terms = item.price === null ? '' : '<p class="tv-price-terms">Indicative starting price for the listed services on regular dates. Your final quotation depends on travel dates, group size and confirmed arrangements. Festival and peak-date supplements may apply.</p>';
    const panel = marker('STARTING_PRICE', `<section class="section tv-price-panel" id="tour-price" aria-labelledby="tour-price-title"><div class="eyebrow">${item.price === null ? 'Your private journey' : 'Plan your budget'}</div><h2 id="tour-price-title">${item.price === null ? 'Request a quote' : `Starting from ₹${amount(item)}`}</h2><p class="tv-price-basis">${esc(basis(item))}</p><p><strong>${item.price === null ? 'Your programme: ' : 'Included: '}</strong>${esc(item.includes)}</p><p>${esc(item.extras)}</p>${terms}<a class="btn primary" href="/plan-my-journey/?tour=${encodeURIComponent(item.url.split('/').filter(Boolean).at(-1))}">Request my quotation</a></section>`);
    const enquiry = /<section\b[^>]*class="[^"]*quote-wrap[^"]*"/;
    if (enquiry.test(html)) html = html.replace(enquiry, match => panel + match);
    else if (html.includes('</main>')) html = html.replace('</main>', panel + '</main>');
    else throw new Error(`No price panel location: ${file}`);
    pageCount++;
  }

  if (file === 'tours/index.html') html = html.replace(/<div class="compact-grid">[\s\S]*?<\/div>/g, grid => grid.replace(/<a\b([^>]*)>/g, (tag, attrs) => attrs.includes('data-tv-price-card') ? tag : `<a${attrs} data-tv-price-card="true">`));
  // Price descriptive journey cards, including compact destination lists.
  // Ordinary navigation, prose links and footer links stay untouched.
  html = html.replace(/<a\b([^>]*\bhref="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g, (block, attrs, href, body) => {
    const target = prices.get(href.replace(/^https:\/\/(?:www\.)?tourvaranasi\.com/, '').split(/[?#]/)[0]);
    if (!target || !(/<h[23]\b/.test(body) || attrs.includes('data-tv-price-card="true"') || (/<strong\b/.test(body) && /<(?:span|small)\b/.test(body)))) return block;
    body = body.replace(/<(span|strong)\b[^>]*class="(?:tour-card-price|compact-tour-price|experience-price|price|quiet-price)"[^>]*>[\s\S]*?<\/\1>/g, '');
    const price = cardPrice(target);
    if (/<span class="experience-link"/.test(body)) body = body.replace(/<span class="experience-link"/, price + '<span class="experience-link"');
    else if (/<div class="(?:card-body|experience-copy)"/.test(body)) body = body.replace(/<\/div>\s*$/, price + '</div>');
    else body += price;
    cardCount++;
    return `<a${attrs}${attrs.includes('data-tv-price-card="true"') ? '' : ' data-tv-price-card="true"'}>${body}</a>`;
  });
  if (file === 'tours/index.html') {
    html = html.replace(/<article class="day-item">[\s\S]*?<\/article>/g, block => {
      const href = block.match(/href="([^"]+)"/)?.[1];
      const target = prices.get(href);
      if (!target) return block;
      cardCount++;
      return block.replace(/(<a\b)/, cardPrice(target) + '$1');
    });
  }
  if (html.includes('tv-price-') || html.includes('tv-card-price')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/starting-prices.css">\n</head>');
  fs.writeFileSync(file, html);
}
if (pageCount !== catalogue.items.length) throw new Error(`Only ${pageCount} of ${catalogue.items.length} price pages found`);
console.log(`Starting prices: ${pageCount} detail pages and ${cardCount} cards; ${catalogue.items.filter(item => item.price === null).length} tailored quotations.`);
