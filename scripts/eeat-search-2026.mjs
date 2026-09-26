import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE = 'https://www.tourvaranasi.com';
const LOCAL_CHECK = 'September 2026';
const UPDATED = '2026-09-23';
const SKIP_DIRS = new Set(['.git', '.netlify', 'node_modules']);
const START = '<!-- TV_EEAT_START -->';
const END = '<!-- TV_EEAT_END -->';

const URL_RENAMES = new Map([
  ['/tours/4-days-delhi-agra-mathura-vrindavan-tour/', '/tours/5-days-delhi-agra-mathura-vrindavan-tour/'],
  ['/tours/6-days-delhi-agra-mathura-vrindavan-ayodhya-tour/', '/tours/7-days-delhi-agra-mathura-vrindavan-ayodhya-tour/'],
  ['/tours/7-days-delhi-mathura-vrindavan-ayodhya-prayagraj-varanasi-tour/', '/tours/8-days-delhi-mathura-vrindavan-ayodhya-prayagraj-varanasi-tour/'],
  ['/tours/8-days-delhi-mathura-vrindavan-agra-ayodhya-prayagraj-varanasi-tour/', '/tours/9-days-delhi-mathura-vrindavan-agra-ayodhya-prayagraj-varanasi-tour/'],
  ['/tours/8-days-varanasi-prayagraj-ayodhya-agra-vrindavan-mathura-delhi-tour/', '/tours/9-days-varanasi-prayagraj-ayodhya-agra-vrindavan-mathura-delhi-tour/']
]);

const HREFLANG = [
  ['en', '/'], ['de', '/de/'], ['fr', '/fr/'], ['es', '/es/'], ['it', '/it/'], ['ja', '/ja/'], ['zh-CN', '/zh/'], ['x-default', '/']
];

const languageFooters = {
  de: { desc:'Ein in Varanasi ansässiges Team für private, sorgfältig geplante Reisen in Varanasi und den umliegenden Kultur-, Pilger- und buddhistischen Regionen.', destinations:'Reiseziele', tours:'Touren', experiences:'Erlebnisse', about:'Über uns', reviews:'Gästebewertungen', guide:'Reiseführer', standards:'Servicestandards', privacy:'Datenschutz', sitemap:'Sitemap', contact:'Kontakt' },
  fr: { desc:'Une équipe basée à Varanasi pour des voyages privés, bien rythmés et organisés sur place dans la ville sainte et les régions culturelles et bouddhistes voisines.', destinations:'Destinations', tours:'Circuits', experiences:'Expériences', about:'À propos', reviews:'Avis voyageurs', guide:'Guide de voyage', standards:'Nos standards de service', privacy:'Confidentialité', sitemap:'Plan du site', contact:'Contact' },
  es: { desc:'Un equipo con base en Varanasi para viajes privados y bien planificados por Varanasi y las regiones culturales, sagradas y budistas cercanas.', destinations:'Destinos', tours:'Circuitos', experiences:'Experiencias', about:'Quiénes somos', reviews:'Opiniones de viajeros', guide:'Guía de viaje', standards:'Estándares de servicio', privacy:'Privacidad', sitemap:'Mapa del sitio', contact:'Contacto' },
  it: { desc:'Un team con base a Varanasi per viaggi privati e ben organizzati a Varanasi e nelle vicine regioni culturali, sacre e buddhiste.', destinations:'Destinazioni', tours:'Tour', experiences:'Esperienze', about:'Chi siamo', reviews:'Recensioni degli ospiti', guide:'Guida di viaggio', standards:'Standard di servizio', privacy:'Privacy', sitemap:'Mappa del sito', contact:'Contatti' },
  ja: { desc:'バラナシを拠点に、バラナシと周辺の聖地・文化・仏教地域を丁寧に手配するプライベート旅行チームです。', destinations:'目的地', tours:'ツアー', experiences:'体験', about:'私たちについて', reviews:'旅行者の声', guide:'旅行ガイド', standards:'サービス基準', privacy:'プライバシー', sitemap:'サイトマップ', contact:'お問い合わせ' },
  zh: { desc:'我们常驻瓦拉纳西，为瓦拉纳西及周边文化、朝圣与佛教地区提供节奏合理的私人旅行安排。', destinations:'目的地', tours:'行程', experiences:'体验', about:'关于我们', reviews:'旅客评价', guide:'旅行指南', standards:'服务标准', privacy:'隐私政策', sitemap:'网站地图', contact:'联系我们' }
};

const topicCopy = {
  varanasi: {
    kicker:'From our Varanasi operations team',
    text:'We plan and operate private travel in Varanasi throughout the year. River conditions, traffic barriers, temple procedures and old-city access can change, so practical details on this page reflect our on-ground operating experience and are reconfirmed close to travel.'
  },
  ayodhya: {
    kicker:'From our Ayodhya operations team',
    text:'Ayodhya access changes with security, crowd levels and religious dates. Our practical guidance is based on current guest operations, including realistic vehicle stopping points, walking or e-rickshaw movement and the time needed for darshan.'
  },
  lucknow: {
    kicker:'From our Lucknow operations team',
    text:'Our Lucknow planning is built around realistic monument timings, city traffic, guide coordination and the pace that works for private travellers rather than a rushed sightseeing checklist.'
  },
  buddhist: {
    kicker:'From our Buddhist Circuit operations team',
    text:'We operate journeys linking Sarnath with Bodh Gaya, Rajgir, Nalanda, Vaishali, Kushinagar, Lumbini and other Buddhist centres. Road time, local opening days and pilgrimage priorities are checked as operating details, not copied from a generic route map.'
  },
  sacred: {
    kicker:'From our North India operations team',
    text:'This route is checked as a real overland journey, with attention to road time, temple access, local transport restrictions and a practical pace between sacred cities.'
  }
};

async function walk(dir='.') {
  const out=[];
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const p=join(dir,entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function relPath(file) { return relative('.',file).split(sep).join('/'); }
function sitePath(file) {
  const p=relPath(file);
  if (p==='index.html') return '/';
  if (p.endsWith('/index.html')) return '/' + p.slice(0,-'index.html'.length);
  return '/' + p;
}

function rewriteUrls(html) {
  for (const [oldPath,newPath] of URL_RENAMES) {
    html=html.split(oldPath).join(newPath);
    html=html.split(SITE+oldPath).join(SITE+newPath);
  }
  return html;
}

function ensureStylesheet(html) {
  if (html.includes('/assets/css/eeat-search-2026.css')) return html;
  return html.replace(/<\/head>/i,'<link rel="stylesheet" href="/assets/css/eeat-search-2026.css"/>\n</head>');
}

function ensureAuthorMeta(html, isArticle) {
  if (!isArticle) return html;
  const existingPublished=(html.match(/<meta\b[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)||[])[1] || (html.match(/"datePublished"\s*:\s*"([^"]+)"/i)||[])[1] || '';
  html=html.replace(/\s*<meta\b[^>]*name=["']author["'][^>]*>\s*/gi,'');
  html=html.replace(/\s*<meta\b[^>]*property=["']article:modified_time["'][^>]*>\s*/gi,'');
  html=html.replace(/\s*<meta\b[^>]*property=["']article:published_time["'][^>]*>\s*/gi,'');
  const published=existingPublished ? `<meta property="article:published_time" content="${existingPublished}"/>` : '';
  const tags=`<meta name="author" content="Tour Varanasi Operations Team"/>${published}<meta property="article:modified_time" content="${UPDATED}"/>`;
  return html.replace(/<\/head>/i,tags+'\n</head>');
}

function applyHreflang(html, path) {
  if (!['/','/de/','/fr/','/es/','/it/','/ja/','/zh/'].includes(path)) return html;
  html=html.replace(/\s*<link\b[^>]*hreflang=["'][^"']+["'][^>]*>\s*/gi,'');
  const links=HREFLANG.map(([lang,p])=>`<link rel="alternate" hreflang="${lang}" href="${SITE}${p}"/>`).join('');
  return html.replace(/<\/head>/i,links+'\n</head>');
}

function socialRel(html) {
  return html.replace(/<a\b([^>]*href=["']https?:\/\/(?:www\.)?(?:facebook\.com|instagram\.com|tripadvisor\.[^\/]+)[^"']*["'][^>]*)>/gi,(m,attrs)=>{
    if (/\brel=["'][^"']*\bme\b/i.test(attrs)) return m;
    if (/\brel=["']([^"']*)["']/i.test(attrs)) return '<a'+attrs.replace(/\brel=["']([^"']*)["']/i,(x,v)=>`rel="me ${v}"`)+'>';
    return `<a${attrs} rel="me noopener noreferrer">`;
  });
}

function detectTopic(rel, html) {
  const r=rel.toLowerCase();
  if (/buddhist|bodh.?gaya|rajgir|nalanda|kushinagar|lumbini|shravasti|vaishali|sarnath/.test(r)) return 'buddhist';
  if (/lucknow|naimish/.test(r)) return 'lucknow';
  if (/ayodhya|ram-mandir|ram-janmabhoomi/.test(r)) return 'ayodhya';
  if (/prayagraj|allahabad|chitrakoot|chhapaiya/.test(r)) return 'sacred';
  if (/varanasi|kashi|ganga|ganges|boat|banarasi|ghat/.test(r)) return 'varanasi';
  const s=html.slice(0,12000).toLowerCase();
  if (/bodh\s*gaya|rajgir|nalanda|kushinagar|lumbini|buddhist circuit/.test(s)) return 'buddhist';
  if (/lucknow|bara imambara|chhota imambara|naimish/.test(s)) return 'lucknow';
  if (/ayodhya|ram janmabhoomi|ram mandir|hanuman garhi|sarayu/.test(s)) return 'ayodhya';
  if (/prayagraj|allahabad|triveni sangam|chitrakoot|chhapaiya/.test(s)) return 'sacred';
  if (/varanasi|kashi|ganga aarti|ganges|banarasi|ghat/.test(s)) return 'varanasi';
  return null;
}

function isPriorityContent(rel) {
  if (rel==='index.html') return false;
  if (/^(?:de|fr|es|it|ja|zh)\/index\.html$/.test(rel)) return false;
  if (/^(?:legal|privacy-policy|terms-conditions|thank-you|gallery)\//.test(rel)) return false;
  return rel.startsWith('blogs/post/') || rel.startsWith('travel-guide/') || rel.startsWith('tours/') || rel.startsWith('experiences/');
}

function eeatBlock(topic, isArticle) {
  const c=topicCopy[topic];
  if (!c) return '';
  const author=isArticle ? '<div class="tv-local-byline">Written &amp; reviewed by <a href="/about-us/">Tour Varanasi Operations Team</a> · <a href="/editorial-policy/">How we verify our travel guides</a></div>' : '<div class="tv-local-byline"><a href="/editorial-policy/">How we verify our travel information</a></div>';
  return `\n${START}\n<aside class="tv-local-check" aria-label="Local operating experience"><div class="tv-local-kicker">${c.kicker}</div><div class="tv-local-date">Last locally checked: ${LOCAL_CHECK}</div><p>${c.text}</p>${author}</aside>\n${END}\n`;
}

function injectEeat(html, rel) {
  html=html.replace(new RegExp(`\\s*${START}[\\s\\S]*?${END}\\s*`,'g'),'\n');
  if (!isPriorityContent(rel)) return html;
  const topic=detectTopic(rel,html);
  if (!topic) return html;
  const westHeavy=/delhi|agra|mathura|vrindavan/.test(rel.toLowerCase());
  if (westHeavy && !/varanasi|ayodhya/.test(rel.toLowerCase())) return html;
  const isArticle=rel.startsWith('blogs/post/') || rel.startsWith('travel-guide/');
  const block=eeatBlock(topic,isArticle);
  const sectionRe=/<section\b[^>]*class=["'][^"']*(?:section narrow prose|section narrow)[^"']*["'][^>]*>/i;
  if (sectionRe.test(html)) return html.replace(sectionRe,m=>m+block);
  if (/<main\b[^>]*>/i.test(html)) return html.replace(/<main\b[^>]*>/i,m=>m+block);
  return html.replace(/<footer\b/i,block+'<footer');
}

function localizedFooter(lang) {
  const t=languageFooters[lang];
  if (!t) return '';
  return `<!-- TV_UNIFIED_FOOTER_START -->
<footer class="tvf-footer" id="site-footer">
  <div class="tvf-shell">
    <div class="tvf-grid">
      <div class="tvf-brand">
        <a class="tvf-logo-link" href="/" aria-label="Tour Varanasi home"><span class="tvf-logo-plate"><img src="/tour-varanasi-logo.png" alt="Tour Varanasi" width="205" height="48" loading="lazy" decoding="async"></span></a>
        <p>${t.desc}</p>
      </div>
      <div class="tvf-col"><h4>${t.destinations}</h4><a href="/tours/">Varanasi</a><a href="/tours/5-days-varanasi-ayodhya-tour-1/">Ayodhya</a><a href="/tours/lucknow-tour-in-one-day/">Lucknow</a><a href="/journeys-beyond-varanasi/">Buddhist Heartlands</a></div>
      <div class="tvf-col"><h4>${t.tours}</h4><a href="/experiences/">${t.experiences}</a><a href="/reviews/">${t.reviews}</a><a href="/blogs/">${t.guide}</a><a href="/about-us/">${t.about}</a></div>
      <div class="tvf-col"><h4>${t.contact}</h4><a href="/service-standards/">${t.standards}</a><a href="/editorial-policy/">Editorial</a><a href="/privacy-policy/">${t.privacy}</a><a href="/sitemap.xml">${t.sitemap}</a><div class="tvf-contact"><a href="https://wa.me/917457905011" target="_blank" rel="noopener">+91 74579 05011 · WhatsApp</a><a href="mailto:tours@tourvaranasi.com">tours@tourvaranasi.com</a></div></div>
    </div>
    <nav class="tvf-language-row" aria-label="Language versions"><span>Languages</span><a href="/">English</a><a href="/de/">Deutsch</a><a href="/fr/">Français</a><a href="/es/">Español</a><a href="/it/">Italiano</a><a href="/ja/">日本語</a><a href="/zh/">中文</a></nav>
    <div class="tvf-social-row"><p class="tvf-social-label">Reviews &amp; social</p><div class="tvf-social-links"><a class="tvf-tripadvisor" href="https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html" target="_blank" rel="noopener"><span>Tripadvisor</span></a><a href="https://www.instagram.com/tourvaranasi_/" target="_blank" rel="noopener"><span>Instagram</span></a><a href="https://www.facebook.com/TourVaranasi" target="_blank" rel="noopener"><span>Facebook</span></a></div></div>
  </div>
  <div class="tvf-bottom">© 2026 Tour Varanasi.</div>
</footer>
<!-- TV_UNIFIED_FOOTER_END -->`;
}

function cleanLanguagePage(html, rel) {
  const m=rel.match(/^(de|fr|es|it|ja|zh)\/index\.html$/);
  if (!m) return html;
  const lang=m[1];
  html=html.replace(/\s*<!--\s*TV_INTERNAL_LINKS_START\s*-->[\s\S]*?<!--\s*TV_INTERNAL_LINKS_END\s*-->\s*/gi,'\n');
  html=html.replace(/<footer\b[\s\S]*?<\/footer>/i,localizedFooter(lang));
  return html;
}

const files=await walk();
let changed=0, eeatCount=0, langCount=0;
for (const file of files) {
  const rel=relPath(file);
  let html=await readFile(file,'utf8');
  const before=html;
  html=rewriteUrls(html);
  html=cleanLanguagePage(html,rel);
  html=applyHreflang(html,sitePath(file));
  html=socialRel(html);
  const article=rel.startsWith('blogs/post/') || rel.startsWith('travel-guide/');
  html=ensureAuthorMeta(html,article);
  const hadMarker=html.includes(START);
  html=injectEeat(html,rel);
  if (!hadMarker && html.includes(START)) eeatCount++;
  if (/^(de|fr|es|it|ja|zh)\/index\.html$/.test(rel) && html!==before) langCount++;
  html=ensureStylesheet(html);
  if (html!==before) { await writeFile(file,html); changed++; }
}
console.log(`E-E-A-T / AI-search pass: changed ${changed} HTML files; added local experience blocks to ${eeatCount}; cleaned ${langCount} language homepages.`);
