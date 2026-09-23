import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const skip=new Set(['.git','.netlify','node_modules']);
const CSS='/assets/css/unified-footer.css';
const cssTag=`<link rel="stylesheet" href="${CSS}">`;

const TA='https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html';
const IG='https://www.instagram.com/tourvaranasi_?stkn=d3EwbjMwdmx3NjIx';
const FB='https://www.facebook.com/TourVaranasi';

const footer=`<!-- TV_UNIFIED_FOOTER_START -->
<footer class="tvf-footer" id="site-footer">
  <div class="tvf-shell">
    <div class="tvf-grid">
      <div class="tvf-brand">
        <a class="tvf-logo-link" href="/" aria-label="Tour Varanasi home">
          <span class="tvf-logo-plate"><img src="/tour-varanasi-logo.png" alt="Tour Varanasi" width="205" height="48" loading="lazy" decoding="async"></span>
        </a>
        <p>A Varanasi-based specialist for thoughtful private journeys through the sacred city and the cultural and Buddhist landscapes around it.</p>
      </div>
      <div class="tvf-col">
        <h4>Destinations</h4>
        <a href="/tours/">Varanasi</a>
        <a href="/tours/5-days-varanasi-ayodhya-tour-1/">Ayodhya</a>
        <a href="/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/">Prayagraj</a>
        <a href="/journeys-beyond-varanasi/">Buddhist Heartlands</a>
      </div>
      <div class="tvf-col">
        <h4>Plan</h4>
        <a href="/experiences/">Experiences</a>
        <a href="/plan-my-journey/">Plan My Journey</a>
        <a href="/service-standards/">Service Standards</a>
        <a href="/reviews/">Guest Reviews</a>
        <a href="/blogs/">Travel Guide</a>
      </div>
      <div class="tvf-col">
        <h4>Tour Varanasi</h4>
        <a href="/about-us/">About Us</a>
        <a href="/tour-varanasi-contact/">Contact</a>
        <a href="/legal/">Legal</a>
        <a href="/editorial-policy/">Editorial &amp; Verification</a>
        <a href="/privacy-policy/">Privacy Policy</a>
        <a href="/sitemap.xml">Sitemap</a>
        <div class="tvf-contact">
          <a href="https://wa.me/917457905011?text=Hello%20Tour%20Varanasi%2C%20I%20would%20like%20to%20plan%20a%20journey." target="_blank" rel="noopener">+91 74579 05011 · WhatsApp</a>
          <a href="mailto:tours@tourvaranasi.com">tours@tourvaranasi.com</a>
        </div>
      </div>
    </div>
    <nav class="tvf-language-row" aria-label="Language versions"><span>Languages</span><a href="/">English</a><a href="/de/">Deutsch</a><a href="/fr/">Français</a><a href="/es/">Español</a><a href="/it/">Italiano</a><a href="/ja/">日本語</a><a href="/zh/">中文</a></nav>
    <div class="tvf-social-row">
      <p class="tvf-social-label">Reviews &amp; social</p>
      <div class="tvf-social-links">
        <a class="tvf-tripadvisor" href="${TA}" target="_blank" rel="noopener" aria-label="Read Tour Varanasi reviews on Tripadvisor">
          <img src="https://cdn.simpleicons.org/tripadvisor/34E0A1" alt="" width="22" height="22" loading="lazy" decoding="async"><span>Tripadvisor reviews</span>
        </a>
        <a href="${IG}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Instagram">
          <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="" width="20" height="20" loading="lazy" decoding="async"><span>Instagram</span>
        </a>
        <a href="${FB}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Facebook">
          <img src="https://cdn.simpleicons.org/facebook/1877F2" alt="" width="20" height="20" loading="lazy" decoding="async"><span>Facebook</span>
        </a>
      </div>
    </div>
  </div>
  <div class="tvf-bottom">© 2026 Tour Varanasi. All rights reserved.</div>
</footer>
<!-- TV_UNIFIED_FOOTER_END -->`;

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...walk(full));
    else if(entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function replaceFooter(html){
  html=html.replace(/<!-- TV_FOOTER_TRUST_SOCIAL_START -->[\s\S]*?<!-- TV_FOOTER_TRUST_SOCIAL_END -->/g,'');
  html=html.replace(/<!-- TV_UNIFIED_FOOTER_START -->[\s\S]*?<!-- TV_UNIFIED_FOOTER_END -->/g,'');
  const matches=[...html.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi)];
  if(matches.length){
    const last=matches[matches.length-1];
    return html.slice(0,last.index)+footer+html.slice(last.index+last[0].length);
  }
  if(/<\/body>/i.test(html)) return html.replace(/<\/body>/i,footer+'\n</body>');
  return html+'\n'+footer;
}

let changed=0;
for(const file of walk(root)){
  let html=fs.readFileSync(file,'utf8');
  const original=html;
  html=replaceFooter(html);
  if(html.includes('tvf-footer') && !html.includes(CSS) && /<\/head>/i.test(html)){
    html=html.replace(/<\/head>/i,`${cssTag}\n</head>`);
  }
  if(html!==original){
    fs.writeFileSync(file,html);
    changed++;
  }
}
console.log(`Unified footer applied across ${changed} HTML files.`);
