import fs from 'node:fs';

const file = 'index.html';
const start = '<!-- TV_INTERNAL_LINKS_START -->';
const end = '<!-- TV_INTERNAL_LINKS_END -->';

if (!fs.existsSync(file)) {
  console.log('Homepage related links: index.html not found.');
  process.exit(0);
}

let html = fs.readFileSync(file, 'utf8');

const block = `${start}
<section class="home-explore-next" aria-labelledby="home-explore-next-title">
  <div class="container home-explore-next-inner">
    <div class="home-explore-next-head">
      <div class="kicker">Continue exploring</div>
      <h2 id="home-explore-next-title">Where would you like to go next?</h2>
      <p>Start with Varanasi, explore its local experiences, or continue through North India’s sacred and Buddhist landscapes.</p>
    </div>
    <div class="home-explore-next-grid">
      <a class="home-explore-next-card" href="/tours/">
        <span class="home-explore-next-number">01</span>
        <h3>Explore Varanasi</h3>
        <p>Private journeys built around the ghats, temples, Sarnath and the living city, with realistic pacing from one day onward.</p>
        <span class="home-explore-next-link">View Varanasi tours <span aria-hidden="true">→</span></span>
      </a>
      <a class="home-explore-next-card" href="/experiences/">
        <span class="home-explore-next-number">02</span>
        <h3>Experiences in Varanasi</h3>
        <p>Add sunrise boat rides, old-city walks, local food, music and Banarasi craft to a thoughtfully paced stay.</p>
        <span class="home-explore-next-link">Explore experiences <span aria-hidden="true">→</span></span>
      </a>
      <a class="home-explore-next-card" href="/journeys-beyond-varanasi/">
        <span class="home-explore-next-number">03</span>
        <h3>Journeys Beyond Varanasi</h3>
        <p>Continue naturally to Ayodhya, Prayagraj, Bodh Gaya and the wider sacred and Buddhist circuits.</p>
        <span class="home-explore-next-link">Explore journeys beyond <span aria-hidden="true">→</span></span>
      </a>
    </div>
  </div>
</section>
${end}`;

const markerPattern = new RegExp(`${start}[\\s\\S]*?${end}`);
if (markerPattern.test(html)) {
  html = html.replace(markerPattern, block);
} else {
  const footerIndex = html.indexOf('<footer');
  if (footerIndex !== -1) html = html.slice(0, footerIndex) + block + '\n' + html.slice(footerIndex);
}

const cssMarker = '/* TV_HOMEPAGE_EXPLORE_NEXT */';
if (!html.includes(cssMarker)) {
  const css = `
<style>
${cssMarker}
.home-explore-next{background:#fffdf9;padding:82px 0 88px;border-top:1px solid rgba(221,216,207,.72)}
.home-explore-next-inner{max-width:1180px;margin:0 auto}
.home-explore-next-head{max-width:760px;margin:0 0 42px}
.home-explore-next-head .kicker{margin-bottom:10px}
.home-explore-next-head h2{font-family:var(--heading);font-size:38px;line-height:1.15;font-weight:500;letter-spacing:-.02em;margin:0 0 14px;color:var(--ink)}
.home-explore-next-head p{font-size:15px;line-height:1.7;color:var(--muted);margin:0;max-width:720px}
.home-explore-next-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.home-explore-next-card{display:flex;flex-direction:column;min-height:260px;padding:30px 30px 28px;border-right:1px solid var(--line);transition:background .2s ease,transform .2s ease}
.home-explore-next-card:first-child{padding-left:0;padding-right:36px}
.home-explore-next-card:last-child{border-right:0;padding-right:0;padding-left:36px}
.home-explore-next-card:hover{background:rgba(237,241,236,.45)}
.home-explore-next-number{font-size:10px;letter-spacing:.14em;color:var(--terracotta-dark);font-weight:600;margin-bottom:28px}
.home-explore-next-card h3{font-family:var(--heading);font-size:25px;line-height:1.2;font-weight:600;margin:0 0 12px;color:var(--ink)}
.home-explore-next-card p{font-size:13px;line-height:1.65;color:var(--muted);margin:0 0 22px;max-width:320px}
.home-explore-next-link{margin-top:auto;font-size:12px;font-weight:600;color:var(--river);display:inline-flex;gap:8px;align-items:center}
.home-explore-next-link span{transition:transform .2s ease}.home-explore-next-card:hover .home-explore-next-link span{transform:translateX(3px)}
@media(max-width:820px){.home-explore-next{padding:66px 0 70px}.home-explore-next-grid{grid-template-columns:1fr}.home-explore-next-card,.home-explore-next-card:first-child,.home-explore-next-card:last-child{min-height:0;padding:26px 0;border-right:0;border-bottom:1px solid var(--line)}.home-explore-next-card:last-child{border-bottom:0}.home-explore-next-number{margin-bottom:14px}.home-explore-next-head{margin-bottom:30px}.home-explore-next-head h2{font-size:32px}}
</style>`;
  html = html.replace('</head>', `${css}\n</head>`);
}

fs.writeFileSync(file, html);
console.log('Homepage related links: replaced generic SEO block with centred visitor-focused navigation.');
