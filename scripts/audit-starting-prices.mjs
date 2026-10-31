import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const catalogue = JSON.parse(fs.readFileSync('scripts/tour-pricing.json', 'utf8'));
assert.equal(catalogue.items.length, 48);
assert.equal(catalogue.items.filter(item => item.price !== null).length, 45);
assert.equal(new Set(catalogue.items.map(item => item.url)).size, 48);
const priceLabel = item => item.price === null ? 'Request a quote' : `From ₹${item.price.toLocaleString('en-IN')}`;
let cards = 0;
for (const item of catalogue.items) {
  const file = path.join('.', item.url, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  assert.equal((html.match(/id="tour-price"/g) || []).length, 1, `${file}: one price panel`);
  assert.equal((html.match(/class="tv-price-summary"/g) || []).length, 1, `${file}: one summary`);
  assert.ok(html.includes('starting-prices.css'), `${file}: stylesheet`);
  const summary = html.match(/<!-- TV_PRICE_SUMMARY_START -->([\s\S]*?)<!-- TV_PRICE_SUMMARY_END -->/)[1];
  assert.ok(summary.includes(priceLabel(item)), `${file}: expected price`);
  if (item.price !== null) {
    assert.ok(summary.includes(item.unit) && summary.includes('GST included'), `${file}: unit and GST`);
    if (item.minimumGuests === 2) assert.ok(summary.includes('minimum 2 guests'), `${file}: guest minimum`);
  } else assert.ok(!summary.includes('₹'), `${file}: no fabricated price`);
  if (item.unit === 'per private session') assert.ok(!summary.includes('per person'), `${file}: performance unit`);
  assert.ok(!/TV_RATE_START|experience-price-note/.test(html), `${file}: no stale pricing panel`);
}
function walk(dir = '.') {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.') || ['node_modules', 'scripts'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*data-tv-price-card="true"[^>]*>([\s\S]*?)<\/a>/g)) {
      const url = match[1].replace(/^https:\/\/(?:www\.)?tourvaranasi\.com/, '').split(/[?#]/)[0];
      const item = catalogue.items.find(item => item.url === url);
      assert.ok(item, `${file}: known card destination`);
      assert.ok(match[2].includes(priceLabel(item)), `${file}: matching card price for ${url}`);
      assert.equal((match[2].match(/class="tv-card-price"/g) || []).length, 1, `${file}: no duplicate card price`);
      cards++;
    }
  }
}
walk();
assert.ok(cards >= 48, `Expected catalogue and related cards; found ${cards}`);
assert.ok(!fs.readFileSync('index.html', 'utf8').includes('From INR 2,500'), 'Remove outdated homepage boat price');
assert.ok(fs.readFileSync('tours/solo-tour-for-women-1/index.html', 'utf8').includes('Two-day programme'), 'Solo scope');
console.log(`Pricing audit passed: 45 starting prices, 3 tailored quotes, ${cards} consistent cards.`);
