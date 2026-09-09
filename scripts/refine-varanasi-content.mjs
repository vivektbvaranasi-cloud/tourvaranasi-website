import { readFile, writeFile } from 'node:fs/promises';

// Use the real guest photographs already stored in the repository. The older
// guest-*-may-2026 webp files are placeholder-sized assets and must not be used
// for the primary Aarti / Sankalp / sunrise experience imagery.
const BALCONY='/assets/images/user/aarti-4.jpg';
const SANKALP='/assets/images/guest_aarti_participation.webp';
const SUNRISE='/assets/images/user/dawn-4.jpg';

const aartiBlock=`<section class="section narrow prose" data-varanasi-refinement="aarti-viewing"><div class="eyebrow">Our on-ground recommendation</div><h2>For Ganga Aarti, we usually prefer a balcony to a boat.</h2><p>A boat sounds atmospheric, but on a normal busy evening guest boats may be held several rows away from the riverfront ceremony at Dashashwamedh Ghat. There can be several boats between your boat and the priests, and once passengers stand up the view can become partly or completely obstructed. From farther out on the river, the chanting, mantras, bells and rhythm of the ceremony also do not reach guests as clearly. For most first-time visitors we therefore prefer a pre-arranged elevated balcony position close to the Aarti, where the view is fixed, the ceremony is easier to hear and guests do not have to depend on where a boat is allowed to stop.</p><p><strong>Sankalp Aarti is another option.</strong> For guests who want a closer and more devotional experience, we can arrange Sankalp Aarti tickets in advance, subject to availability and the operating arrangements on the travel date. Reserved land seating can also be considered for guests who prefer not to use a balcony.</p><div class="grid grid-2"><div class="card"><img src="${BALCONY}" alt="Guests viewing evening Ganga Aarti from an elevated balcony in Varanasi" loading="lazy" decoding="async"/><div class="body"><div class="meta">Balcony viewing</div><p>An elevated, fixed position usually gives a clearer view than being several boats deep on the river.</p></div></div><div class="card"><img src="${SANKALP}" alt="Guests participating in a Sankalp Aarti experience in Varanasi" loading="lazy" decoding="async"/><div class="body"><div class="meta">Sankalp Aarti</div><p>A more involved option for guests who would like to experience the ritual from closer range.</p></div></div></div></section>`;

const sunriseBlock=`<section class="section narrow prose" data-varanasi-refinement="sunrise-old-city"><div class="eyebrow">How we normally plan the morning</div><h2>The sunrise boat is only the first part of the experience.</h2><p>After the private sunrise boat ride, we normally continue directly into an old-city walking tour rather than simply returning by boat to the starting point. Guests usually disembark at <strong>Manikarnika Ghat</strong>, where the guide sensitively explains the cremation rituals, the significance of the ghat and the Hindu understanding of death and liberation. We avoid this section completely for guests who do not wish to see or discuss a cremation ghat, and we discourage intrusive photography.</p><p>From there the walk continues through the old lanes towards the <strong>flower market at Chowk</strong>, the traditional <strong>perfume market</strong>, <strong>Kachori Gali</strong> — one of the old city's food streets — and the <strong>Kashi Vishwanath area and corridor</strong>. Guests who wish to enter Kashi Vishwanath Temple can ask us to arrange a <strong>skip-the-line darshan</strong> option in advance, wherever the official facility is operating; temple entry remains optional and is planned around the rules for the travel date. The guide then continues with the guests to the practical vehicle meeting point for the return to the hotel for breakfast and rest.</p><div class="card"><img src="${SUNRISE}" alt="Guests on a private sunrise boat experience on the Ganges in Varanasi" loading="lazy" decoding="async"/><div class="body"><div class="meta">Private sunrise experience</div><p>We use the river as the beginning of the morning, then connect it naturally with the lanes, markets and sacred geography behind the ghats.</p></div></div></section>`;

const combinedBlock=`${sunriseBlock}${aartiBlock}`;

async function patch(path, transform){
  try{
    const before=await readFile(path,'utf8');
    const after=transform(before);
    if(after!==before){await writeFile(path,after); return 1;}
  }catch(err){
    if(err?.code!=='ENOENT') throw err;
  }
  return 0;
}

function alreadyRefined(html,marker){
  if(html.includes(`data-varanasi-refinement="${marker}"`)) return true;
  if(marker==='aarti-viewing'){
    return html.includes(BALCONY) && html.includes('Sankalp') && html.toLowerCase().includes('balcony');
  }
  if(marker==='sunrise-old-city'){
    return html.includes('Manikarnika Ghat') && html.includes('Kachori Gali') && html.includes('Kashi Vishwanath');
  }
  return false;
}

function insertBefore(html, anchor, marker, block){
  if(alreadyRefined(html,marker)) return html;
  const i=html.indexOf(anchor);
  if(i<0) return html;
  return html.slice(0,i)+block+html.slice(i);
}

function insertBeforeAny(html, anchors, marker, block){
  if(alreadyRefined(html,marker)) return html;
  let best=-1;
  for(const a of anchors){const i=html.indexOf(a); if(i>=0&&(best<0||i<best)) best=i;}
  if(best<0) return html;
  return html.slice(0,best)+block+html.slice(best);
}

let changed=0;

// Generated Varanasi destination page: add the on-ground sequence and viewing recommendation.
changed+=await patch('destinations/varanasi/index.html',html=>insertBefore(html,'<section class="sightseeing-section">','sunrise-old-city',combinedBlock));

// Practical guides. Keep the exact balcony wording used by the validation workflow,
// but do not add a second copy of the section when the manually refined guide already has it.
changed+=await patch('blogs/post/sunrise-boat-ride-varanasi-guide/index.html',html=>insertBeforeAny(html,['<div class="related-links"','<div class="pillar-cta"','</section>'],'sunrise-old-city',sunriseBlock));
changed+=await patch('blogs/post/ganga-aarti-varanasi-guide/index.html',html=>{
  if(alreadyRefined(html,'aarti-viewing')){
    if(!html.toLowerCase().includes('we usually prefer a balcony to a boat')){
      html=html.replace('Our first choice: balcony viewing','Why we usually prefer a balcony to a boat');
      html=html.replace('The best way to experience it','Why we usually prefer a balcony to a boat');
    }
    return html;
  }
  return insertBeforeAny(html,['<div class="related-links"','<div class="pillar-cta"','</section>'],'aarti-viewing',aartiBlock);
});
changed+=await patch('travel-guide/first-time-in-varanasi/index.html',html=>insertBeforeAny(html,['<div class="related-links"','<div class="pillar-cta"','</section>'],'sunrise-old-city',combinedBlock));

// The flagship 2-day page has already been rewritten around the real operating sequence.
// Preserve that copy on future builds and only normalize the explicit CI wording.
changed+=await patch('tours/varanasi-tour-in-two-days/index.html',html=>{
  html=html.replace('Optional assisted priority / Sugam-style darshan can be arranged','Optional official skip-the-line darshan / Sugam-style assistance can be arranged');
  html=html.replace('Optional assisted priority / Sugam-style darshan is arranged','Optional official skip-the-line darshan / Sugam-style assistance is arranged');
  if(alreadyRefined(html,'sunrise-old-city') && alreadyRefined(html,'aarti-viewing')) return html;
  return insertBeforeAny(html,['<section class="section soft">','<section class="section faq-section">'],'sunrise-old-city',combinedBlock);
});

// Keep the same practical morning advice visible wherever guests are likely to book it.
for(const path of [
  'tours/varanasi-boat-ride/index.html',
  'tours/varanasi-walking-tour/index.html',
  'experiences/death-rebirth-walk/index.html'
]) changed+=await patch(path,html=>insertBeforeAny(html,['<section class="section soft">','<section class="section faq-section">','<footer'],'sunrise-old-city',sunriseBlock));

// The dedicated Aarti page and longer Varanasi-only itineraries may already contain
// the refined balcony/Sankalp copy. Do not duplicate it during deployment builds.
for(const path of [
  'tours/evening-prayer-ceremony/index.html',
  'tours/varanasi-tour-in-three-days/index.html',
  'tours/4-days-varanasi-tour/index.html'
]) changed+=await patch(path,html=>insertBeforeAny(html,['<section class="section soft">','<section class="section faq-section">','<footer'],'aarti-viewing',aartiBlock));

console.log(`Varanasi practical refinements applied to ${changed} HTML files.`);
