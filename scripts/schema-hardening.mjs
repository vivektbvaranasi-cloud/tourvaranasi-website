import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE = 'https://www.tourvaranasi.com';
const ORG_ID = SITE + '/#organization';
const WEBSITE_ID = SITE + '/#website';
const LOGO = SITE + '/tour-varanasi-logo.png';
const DEFAULT_IMAGE = SITE + '/assets/images/user/sunrise-ganges.jpg';
const SKIP_DIRS = new Set(['.git', '.netlify', 'node_modules']);

const BUSINESS = {
  '@type': 'TravelAgency',
  '@id': ORG_ID,
  name: 'Tour Varanasi',
  alternateName: 'TourVaranasi.com',
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: LOGO },
  image: DEFAULT_IMAGE,
  description: 'Independent Varanasi-based private travel specialist established in 2016, arranging private tours, guides, river experiences and tailor-made journeys through Varanasi and surrounding cultural and Buddhist regions.',
  foundingDate: '2016',
  email: 'tours@tourvaranasi.com',
  telephone: '+91-7457905011',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'S 19/131, A-S-D, Abhilasha Colony, Varuna Bridge',
    addressLocality: 'Varanasi',
    addressRegion: 'Uttar Pradesh',
    postalCode: '221002',
    addressCountry: 'IN'
  },
  areaServed: [
    { '@type': 'City', name: 'Varanasi' },
    { '@type': 'City', name: 'Ayodhya' },
    { '@type': 'City', name: 'Prayagraj' },
    { '@type': 'City', name: 'Bodh Gaya' },
    { '@type': 'AdministrativeArea', name: 'Uttar Pradesh' },
    { '@type': 'AdministrativeArea', name: 'Bihar' }
  ],
  sameAs: [
    'https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html'
  ]
};

const LABELS = new Map([
  ['about-us', 'About Us'],
  ['blogs', 'Travel Guide'],
  ['experiences', 'Experiences'],
  ['gallery', 'Gallery'],
  ['journeys-beyond-varanasi', 'Journeys Beyond Varanasi'],
  ['legal', 'Legal'],
  ['plan-my-journey', 'Plan My Journey'],
  ['privacy-policy', 'Privacy Policy'],
  ['reviews', 'Reviews'],
  ['service-standards', 'Service Standards'],
  ['terms-conditions', 'Terms & Conditions'],
  ['tour-varanasi-contact', 'Contact'],
  ['tours', 'Varanasi Tours'],
  ['travel-guide', 'Travel Guide']
]);

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

function sitePath(file) {
  const p=relative('.',file).split(sep).join('/');
  if (p==='index.html') return '/';
  if (p.endsWith('/index.html')) return '/' + p.slice(0,-'index.html'.length);
  return '/' + p;
}

function canonicalFor(file) {
  return SITE + sitePath(file);
}

function stripTags(s='') {
  return decodeEntities(s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
}

function decodeEntities(s='') {
  return s
    .replaceAll('&amp;','&')
    .replaceAll('&quot;','"')
    .replaceAll('&#39;',"'")
    .replaceAll('&apos;',"'")
    .replaceAll('&nbsp;',' ')
    .replaceAll('&ndash;','–')
    .replaceAll('&mdash;','—')
    .replaceAll('&rsquo;','’')
    .replaceAll('&lsquo;','‘')
    .replaceAll('&ldquo;','“')
    .replaceAll('&rdquo;','”')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
}

function attrValue(tag,name) {
  const re=new RegExp('\\b'+name+'\\s*=\\s*(["\\\'])(.*?)\\1','i');
  return (tag.match(re)||[])[2]||'';
}

function meta(html,key,type='name') {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((attrValue(m[0],type)||'').toLowerCase()===key.toLowerCase()) {
      return decodeEntities(attrValue(m[0],'content')||'');
    }
  }
  return '';
}

function linkRel(html,rel) {
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const r=(attrValue(m[0],'rel')||'').toLowerCase().split(/\s+/);
    if (r.includes(rel.toLowerCase())) return attrValue(m[0],'href')||'';
  }
  return '';
}

function pageTitle(html) {
  return stripTags((html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]||'');
}

function h1(html) {
  return stripTags((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]||'');
}

function absoluteUrl(value='') {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replaceAll('&amp;','&');
  if (value.startsWith('/')) return SITE + value;
  return SITE + '/' + value.replace(/^\.\//,'');
}

function pageInfo(html,file) {
  const path=sitePath(file);
  const canonical=absoluteUrl(linkRel(html,'canonical')) || canonicalFor(file);
  const title=pageTitle(html);
  const name=h1(html) || title.replace(/\s*\|\s*Tour Varanasi\s*$/i,'');
  const description=meta(html,'description') || meta(html,'og:description','property');
  const image=absoluteUrl(meta(html,'og:image','property')) || DEFAULT_IMAGE;
  const robots=meta(html,'robots').toLowerCase();
  return {path,canonical,title,name,description,image,robots};
}

function crumbLabel(seg) {
  if (LABELS.has(seg)) return LABELS.get(seg);
  return decodeURIComponent(seg)
    .replace(/-\d+$/,'')
    .replace(/-/g,' ')
    .replace(/\b\w/g,c=>c.toUpperCase());
}

function breadcrumbs(info) {
  if (info.path==='/') return null;
  const segs=info.path.split('/').filter(Boolean);
  const items=[{
    '@type':'ListItem',
    position:1,
    name:'Home',
    item:SITE + '/'
  }];
  let built='';
  for (let i=0;i<segs.length;i++) {
    built += '/' + segs[i];
    const isLast=i===segs.length-1;
    let name=isLast ? info.name : crumbLabel(segs[i]);
    if (segs[0]==='blogs' && i===0) name='Travel Guide';
    if (segs[0]==='travel-guide' && i===0) name='Travel Guide';
    if (segs[0]==='tours' && i===0) name='Varanasi Tours';
    items.push({
      '@type':'ListItem',
      position:items.length+1,
      name,
      item:SITE + built + '/'
    });
  }
  return {'@type':'BreadcrumbList','@id':info.canonical+'#breadcrumb','itemListElement':items};
}

function extractLinks(html,prefix,currentPath) {
  const seen=new Set();
  const items=[];
  for (const m of html.matchAll(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    let href=decodeEntities(m[2]||'');
    if (!href.startsWith(prefix) || href===currentPath || href.includes('#')) continue;
    href=href.split('?')[0];
    if (!href.endsWith('/')) href += '/';
    if (seen.has(href)) continue;
    const name=stripTags(m[3]);
    if (!name || name.length<3 || name.length>140) continue;
    seen.add(href);
    items.push({'@type':'ListItem',position:items.length+1,name,item:SITE+href});
    if (items.length>=50) break;
  }
  return items;
}

function extractDayItems(html) {
  const items=[];
  for (const m of html.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/gi)) {
    const name=stripTags(m[1]);
    if (!/^day\s*\d+/i.test(name)) continue;
    items.push({'@type':'ListItem',position:items.length+1,name});
  }
  return items;
}

function minimalProvider() {
  return {'@type':'TravelAgency','@id':ORG_ID,'name':'Tour Varanasi','url':SITE+'/'};
}

function webpage(info,type='WebPage',extra={}) {
  return {
    '@type':type,
    '@id':info.canonical+'#webpage',
    url:info.canonical,
    name:info.name,
    description:info.description || undefined,
    primaryImageOfPage:info.image ? {'@type':'ImageObject','url':info.image} : undefined,
    isPartOf:{'@id':WEBSITE_ID},
    breadcrumb:{'@id':info.canonical+'#breadcrumb'},
    ...extra
  };
}

function collectionSchema(html,info,prefix,label) {
  const list=extractLinks(html,prefix,info.path);
  const out=[webpage(info,'CollectionPage')];
  if (list.length) {
    out.push({
      '@type':'ItemList',
      '@id':info.canonical+'#items',
      name:label,
      numberOfItems:list.length,
      itemListElement:list
    });
    out[0].mainEntity={'@id':info.canonical+'#items'};
  }
  return out;
}

function buildGraph(html,file) {
  const info=pageInfo(html,file);
  if (info.path==='/404.html' || /^\/google[a-z0-9]+\.html$/i.test(info.path) || info.robots.includes('noindex')) {
    return [];
  }

  const graph=[];

  if (info.path==='/') {
    graph.push({...BUSINESS});
    graph.push({
      '@type':'WebSite',
      '@id':WEBSITE_ID,
      url:SITE+'/',
      name:'Tour Varanasi',
      alternateName:'TourVaranasi.com',
      publisher:{'@id':ORG_ID}
    });
    graph.push({
      '@type':'WebPage',
      '@id':SITE+'/#webpage',
      url:SITE+'/',
      name:info.name,
      description:info.description || undefined,
      primaryImageOfPage:{'@type':'ImageObject','url':info.image},
      isPartOf:{'@id':WEBSITE_ID},
      about:{'@id':ORG_ID}
    });
    return graph;
  }

  const crumb=breadcrumbs(info);
  if (crumb) graph.push(crumb);

  if (info.path==='/about-us/') {
    graph.push({...BUSINESS});
    graph.push(webpage(info,'AboutPage',{about:{'@id':ORG_ID},mainEntity:{'@id':ORG_ID}}));
    return graph;
  }

  if (info.path==='/tour-varanasi-contact/') {
    graph.push({...BUSINESS});
    graph.push(webpage(info,'ContactPage',{about:{'@id':ORG_ID},mainEntity:{'@id':ORG_ID}}));
    return graph;
  }

  if (info.path==='/plan-my-journey/') {
    graph.push(webpage(info,'ContactPage',{about:{'@id':ORG_ID}}));
    return graph;
  }

  if (info.path==='/tours/') {
    graph.push(...collectionSchema(html,info,'/tours/','Tour Varanasi private tours'));
    return graph;
  }

  if (info.path.startsWith('/tours/')) {
    const id=info.canonical+'#tour';
    const trip={
      '@type':'TouristTrip',
      '@id':id,
      name:info.name,
      description:info.description || undefined,
      url:info.canonical,
      image:info.image || undefined,
      provider:minimalProvider()
    };
    const days=extractDayItems(html);
    if (days.length) trip.itinerary={'@type':'ItemList','itemListElement':days};
    graph.push(trip);
    graph.push(webpage(info,'WebPage',{mainEntity:{'@id':id},about:{'@id':id}}));
    return graph;
  }

  if (info.path==='/experiences/') {
    graph.push(...collectionSchema(html,info,'/experiences/','Varanasi private experiences'));
    return graph;
  }

  if (info.path.startsWith('/experiences/')) {
    const id=info.canonical+'#service';
    graph.push({
      '@type':'Service',
      '@id':id,
      name:info.name,
      description:info.description || undefined,
      url:info.canonical,
      image:info.image || undefined,
      serviceType:info.name,
      provider:minimalProvider(),
      areaServed:{'@type':'City','name':'Varanasi'}
    });
    graph.push(webpage(info,'WebPage',{mainEntity:{'@id':id},about:{'@id':id}}));
    return graph;
  }

  if (info.path==='/blogs/') {
    graph.push(...collectionSchema(html,info,'/blogs/','Tour Varanasi travel guides'));
    return graph;
  }

  if (info.path.startsWith('/blogs/post/') || info.path.startsWith('/travel-guide/')) {
    const id=info.canonical+'#article';
    graph.push({
      '@type':'BlogPosting',
      '@id':id,
      headline:info.name,
      description:info.description || undefined,
      image:info.image || undefined,
      url:info.canonical,
      mainEntityOfPage:{'@id':info.canonical+'#webpage'},
      publisher:minimalProvider(),
      isPartOf:{'@type':'Blog','@id':SITE+'/blogs/#blog','name':'Tour Varanasi Travel Guide','url':SITE+'/blogs/'}
    });
    graph.push(webpage(info,'WebPage',{mainEntity:{'@id':id}}));
    return graph;
  }

  if (info.path==='/journeys-beyond-varanasi/') {
    graph.push(...collectionSchema(html,info,'/tours/','Journeys beyond Varanasi'));
    return graph;
  }

  if (info.path==='/gallery/') {
    graph.push(webpage(info,'ImageGallery'));
    return graph;
  }

  if (info.path==='/reviews/') {
    // Deliberately no AggregateRating / Review rich-result markup for self-serving business reviews.
    graph.push(webpage(info,'CollectionPage',{about:{'@id':ORG_ID}}));
    return graph;
  }

  if (['/legal/','/privacy-policy/','/terms-conditions/','/service-standards/'].includes(info.path)) {
    graph.push(webpage(info,'WebPage',{about:{'@id':ORG_ID}}));
    return graph;
  }

  graph.push(webpage(info,'WebPage',{about:{'@id':ORG_ID}}));
  return graph;
}

function cleanObject(value) {
  if (Array.isArray(value)) return value.map(cleanObject).filter(v=>v!==undefined);
  if (value && typeof value==='object') {
    const out={};
    for (const [k,v] of Object.entries(value)) {
      if (v===undefined || v===null || v==='') continue;
      out[k]=cleanObject(v);
    }
    return out;
  }
  return value;
}

function removeExistingJsonLd(html) {
  return html.replace(/\s*<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>[\s\S]*?<\/script>\s*/gi,'');
}

function inject(html,graph) {
  html=removeExistingJsonLd(html);
  html=html.replace(/\s*<!--\s*TV_SCHEMA_START\s*-->[\s\S]*?<!--\s*TV_SCHEMA_END\s*-->\s*/gi,'');
  if (!graph.length) return html;
  const json=JSON.stringify(cleanObject({'@context':'https://schema.org','@graph':graph}),null,2)
    .replace(/<\//g,'<\\/');
  JSON.parse(json.replace(/<\\\//g,'</'));
  const block='\n<!-- TV_SCHEMA_START: page-specific structured data -->\n<script type="application/ld+json">\n'+json+'\n</script>\n<!-- TV_SCHEMA_END -->\n';
  return html.replace(/<\/head>/i,block+'</head>');
}

const files=await walk();
let changed=0;
const coverage=[];
for (const file of files) {
  const before=await readFile(file,'utf8');
  const graph=buildGraph(before,file);
  const after=inject(before,graph);
  if (after!==before) {
    await writeFile(file,after);
    changed++;
  }
  coverage.push({path:sitePath(file),types:graph.map(x=>x['@type']).flat().filter(Boolean)});
}

for (const file of files) {
  const html=await readFile(file,'utf8');
  for (const m of html.matchAll(/<script\b[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    JSON.parse(m[2]);
  }
}

console.log('Structured data processed '+files.length+' HTML files; changed '+changed+'.');
for (const row of coverage) {
  if (row.types.length) console.log(row.path+' => '+row.types.join(', '));
}
