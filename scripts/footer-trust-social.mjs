import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const skip=new Set(['.git','.netlify','node_modules']);
const cssHref='/assets/css/footer-social.css';
const taLogo='/tripadvisor-logo.png';
const cssTag=`<link rel="stylesheet" href="${cssHref}">`;
const TA='https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html';
const FB='https://www.facebook.com/TourVaranasi';
const IG='https://www.instagram.com/tourvaranasi_?stkn=d3EwbjMwdmx3NjIx';

const block=`<!-- TV_FOOTER_TRUST_SOCIAL_START -->
<div class="tv-footer-social" aria-label="Tour Varanasi reviews and social media">
  <p class="tv-footer-social-label">Reviews &amp; social</p>
  <div class="tv-footer-social-links">
    <a class="tv-social-link tv-ta" href="${TA}" target="_blank" rel="noopener" aria-label="Read Tour Varanasi reviews on Tripadvisor">
      <img class="tv-social-logo" src="https://cdn.simpleicons.org/tripadvisor/34E0A1" alt="Tripadvisor" width="28" height="28" loading="lazy" decoding="async"/>
      <span>Tripadvisor</span>
    </a>
    <a class="tv-social-link" href="${IG}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Instagram">
      <img class="tv-social-logo" src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" loading="lazy" decoding="async"/>
      <span>Instagram</span>
    </a>
    <a class="tv-social-link" href="${FB}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Facebook">
      <img class="tv-social-logo" src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" loading="lazy" decoding="async"/>
      <span>Facebook</span>
    </a>
  </div>
</div>
<!-- TV_FOOTER_TRUST_SOCIAL_END -->`;

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...walk(full));
    else if(entry.isFile()&&entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function injectTripadvisorIntoNav(html){
  // Keep a single clickable Tripadvisor brand mark beside the primary navigation on every page.
  html=html.replace(/<a\b[^>]*class=["'][^"']*tv-nav-tripadvisor[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
  return html.replace(/(<div\b[^>]*class=["'][^"']*(?:tv-navlinks|navlinks)[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i,(all,open,inside,close)=>{
    const link=`<a class="tv-nav-tripadvisor" href="${TA}" target="_blank" rel="noopener" aria-label="Read Tour Varanasi reviews on Tripadvisor"><img src="${taLogo}" alt="Tripadvisor" width="92" height="27" loading="eager" decoding="async"/></a>`;
    const ctaMatch=inside.match(/<a\b[^>]*class=["'][^"']*(?:tv-nav-cta|nav-cta)[^"']*["'][^>]*>[\s\S]*?<\/a>/i);
    if(ctaMatch){
      const at=inside.indexOf(ctaMatch[0])+ctaMatch[0].length;
      inside=inside.slice(0,at)+link+inside.slice(at);
    }else{
      inside+=link;
    }
    return open+inside+close;
  });
}

function stripExisting(html){
  html=html.replace(/<!-- TV_FOOTER_TRUST_SOCIAL_START -->[\s\S]*?<!-- TV_FOOTER_TRUST_SOCIAL_END -->/g,'');
  html=html.replace(/<a\b[^>]*class=["'][^"']*footer-tripadvisor[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');
  return html;
}

function injectIntoFooter(html){
  const footerAt=html.lastIndexOf('<footer');
  if(footerAt<0) return html;
  const before=html.slice(0,footerAt);
  let footer=html.slice(footerAt);

  // Standard and localized footers have a dedicated footer-brand block.
  const brandStart=footer.search(/<div\b[^>]*class=["'][^"']*footer-brand[^"']*["'][^>]*>/i);
  if(brandStart>=0){
    const openEnd=footer.indexOf('>',brandStart)+1;
    const pStart=footer.indexOf('<p',openEnd);
    if(pStart>=0){
      const pEnd=footer.indexOf('</p>',pStart);
      if(pEnd>=0){
        const at=pEnd+4;
        footer=footer.slice(0,at)+'\n'+block+footer.slice(at);
        return before+footer;
      }
    }
  }

  // Fallback for alternate footer structures: put the trust block just inside the footer.
  const firstOpenEnd=footer.indexOf('>')+1;
  footer=footer.slice(0,firstOpenEnd)+'\n'+block+footer.slice(firstOpenEnd);
  return before+footer;
}

let changed=0;
for(const file of walk(root)){
  let html=fs.readFileSync(file,'utf8');
  const original=html;
  html=stripExisting(html);
  html=injectTripadvisorIntoNav(html);

  if(!html.includes(cssHref) && /<\/head>/i.test(html)){
    html=html.replace(/<\/head>/i,`${cssTag}\n</head>`);
  }

  html=injectIntoFooter(html);
  if(html!==original){
    fs.writeFileSync(file,html);
    changed++;
  }
}
console.log(`Footer reviews/social block standardised across ${changed} HTML files.`);
