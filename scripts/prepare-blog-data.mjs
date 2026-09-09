import { readFile, writeFile } from 'node:fs/promises';

const file = 'scripts/destination-data-core.mjs';
let source = await readFile(file, 'utf8');

if (source.includes("slug:'prayagraj'")) {
  console.log('Prayagraj blog data already present.');
  process.exit(0);
}

const prayagraj = `,
{
slug:'prayagraj',name:'Prayagraj',region:'Uttar Pradesh · Sangam',tagline:'The sacred confluence of the Ganga and Yamuna, best planned around the river before city traffic and crowds build.',hero:'/assets/images/user/prayagraj-sangam.jpg',card:'/assets/images/user/prayagraj-sangam.jpg',bestFor:'Sangam · pilgrimage · modern history',stay:'Day visit or 1 night',pace:'River first + flexible city touring',
about:[
\`Prayagraj is most meaningful when the Triveni Sangam is treated as the centre of the visit rather than one stop in a long city checklist. The confluence of the Ganga and Yamuna, together with the sacred tradition of the Saraswati, has made Prayagraj one of India’s great pilgrimage places. For a first-time visitor we normally begin with the river while the day is still relatively cool and movement is easier. The exact boarding point, boat arrangement and amount of walking can vary with river level, local controls and the religious calendar. On major snan dates the entire traffic pattern can change, so a route that takes a few hours on an ordinary day may require a very different plan during a large bathing event.\`,
\`A private boat to the Sangam point gives the clearest experience of the confluence and allows time for prayer, a simple ritual or quiet observation according to the traveller’s interest. We do not rush every guest into a ceremony; some visitors want a priest and a formal sankalp, while others simply want to understand the geography and significance of the place. Life jackets, boarding assistance and a realistic assessment of the steps or temporary riverbank approach matter, particularly for senior travellers. The boat should therefore be arranged according to the day’s conditions rather than treated as a fixed sightseeing ticket.\`,
\`After the river, Bade Hanuman Ji and Alopi Devi can be included in a practical sacred circuit. Anand Bhavan adds a completely different layer, connecting Prayagraj with the Nehru family and India’s independence movement, while Khusro Bagh introduces Mughal-period funerary architecture. Trying to include all of these with a late arrival from another city often makes the day unnecessarily rushed. We prefer to choose the river, the principal temple visits and one heritage stop, then use the remaining time according to traffic and the guest’s pace.\`,
\`Prayagraj sits naturally between Varanasi and Ayodhya, which is why it works so well in a longer private journey. A same-day stop while driving between the two cities is possible when departure is early, but an overnight creates a much calmer programme for senior travellers or anyone who wants a proper Sangam experience. During Kumbh, Magh Mela, major bathing dates and other large religious gatherings, hotel demand, parking zones, barricades and walking distances can be completely different from an ordinary travel day. Those dates should be planned as event travel, not by copying a standard city itinerary.\`
],
sights:[
['Triveni Sangam',\`The Sangam is the anchor of a Prayagraj visit. A local boat normally takes visitors from the practical boarding area towards the confluence, but boarding points can move with river level and administrative arrangements. The experience is strongest when enough time is left for the boat journey and for whatever form of prayer or observation the guest wants at the confluence. On major bathing dates, vehicle restrictions and pedestrian controls may begin far from the river, so the same programme requires substantially more time. We recommend a morning visit whenever the wider itinerary allows.\`],
['Bade Hanuman Ji',\`Bade Hanuman Ji, close to the Sangam area, is one of Prayagraj’s best-known active temples and is famous for the reclining form of Hanuman. It can become crowded on Tuesdays, Saturdays and major religious dates. Because the temple lies in the broader Sangam movement zone, it is sensible to combine it with the river rather than leave and return later through traffic. Footwear, queues and local security arrangements should be treated as part of the visit, particularly for travellers who need a slower pace.\`],
['Alopi Devi Temple',\`Alopi Devi is an important local Shakti shrine and adds a different devotional tradition to the Sangam-focused day. The temple is active and the experience depends more on worship and local belief than on monumental architecture. We include it when the guest is interested in Prayagraj’s sacred circuit and when traffic allows a coherent route. It should not be added merely to increase the number of temple names on an itinerary.\`],
['Anand Bhavan',\`Anand Bhavan provides the strongest modern-historical counterpoint to the pilgrimage sites. The former Nehru family residence is associated with major figures of India’s independence movement and helps visitors understand why Prayagraj has an important political and intellectual history as well as a sacred identity. Museum opening rules and weekly closures should be reconfirmed close to travel. When open, it is usually the heritage stop we prioritise for first-time visitors.\`],
['Khusro Bagh',\`Khusro Bagh is a walled Mughal garden containing significant sandstone tombs and offers a quieter architectural visit away from the river. It works best for travellers with a full day or an overnight in Prayagraj rather than as an automatic addition to a tight Varanasi–Ayodhya road day. The open garden setting also makes midday heat relevant, so season and timing should be considered before placing it in the programme.\`]
],
tours:[
['6 Days Varanasi, Prayagraj & Ayodhya','/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/','A practical three-city sacred journey with enough time for the Sangam.'],
['7 Days Delhi to Varanasi Sacred Journey','/tours/7-days-delhi-mathura-vrindavan-ayodhya-prayagraj-varanasi-tour/','A west-to-east route using Prayagraj naturally between Ayodhya and Varanasi.'],
['8 Days Varanasi to Delhi via Ayodhya & Braj','/tours/8-days-varanasi-prayagraj-ayodhya-agra-vrindavan-mathura-delhi-tour/','The longer sacred and heritage journey beginning in Varanasi.']]
}`;

const end = source.lastIndexOf('];');
if (end < 0) throw new Error('Could not locate end of coreDestinations array');
source = `${source.slice(0, end)}${prayagraj}\n${source.slice(end)}`;
await writeFile(file, source);
console.log('Prepared dedicated Prayagraj data for blog generation.');
