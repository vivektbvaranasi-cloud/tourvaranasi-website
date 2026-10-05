const introduction = `<!-- TV_HOME_INTRO_START -->
<section class="home-welcome" aria-labelledby="home-welcome-title">
  <div class="home-welcome-inner">
    <h2 id="home-welcome-title">Begin in Varanasi. Discover more of India with us.</h2>
    <p>Some journeys stay with you long after you return home—the first light on the Ganges, a quiet moment in a temple courtyard, or a conversation over chai in an old Banarasi lane. Based in Varanasi, we help you discover the places, people and everyday traditions that make this city special, with time to pause and enjoy what draws you in.</p>
    <p>Your journey can take you further: to the sacred temples of Ayodhya, the rivers meeting at Prayagraj, and the gracious architecture and welcoming tables of Lucknow. Follow the Buddha’s footsteps through Sarnath, Bodh Gaya, Rajgir, Nalanda, Kushinagar and Lumbini, or explore Delhi, the beauty of Agra and the devotional heart of Mathura and Vrindavan.</p>
    <p>Whether you join us for a day or travel with us for longer, we take care of the details—from local guides and private transport to helping you choose the right places to stay. Share what brings you here, and we’ll help shape a journey that feels personal to you.</p>
  </div>
</section>
<section class="home-reviews-strip" aria-labelledby="home-reviews-title">
  <div class="home-reviews-inner">
    <h2 id="home-reviews-title">Reviews &amp; travel features</h2>
    <div class="home-review-brands">
      <a href="https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html" target="_blank" rel="noopener noreferrer" aria-label="Tour Varanasi guest reviews on Tripadvisor (opens in a new tab)"><span class="review-brand-name">Tripadvisor</span><span class="review-brand-caption">Guest reviews ↗</span></a>
      <a href="https://www.trustpilot.com/review/tourvaranasi.com" target="_blank" rel="noopener noreferrer" aria-label="Tour Varanasi guest reviews on Trustpilot (opens in a new tab)"><span class="review-brand-name">Trustpilot</span><span class="review-brand-caption">Guest reviews ↗</span></a>
      <a href="https://www.tourradar.com/o/tour-varanasi" target="_blank" rel="noopener noreferrer" aria-label="Tour Varanasi tours and reviews on TourRadar (opens in a new tab)"><span class="review-brand-name">TourRadar</span><span class="review-brand-caption">Tours &amp; reviews ↗</span></a>
      <a href="https://bazartravels.com/3-days-in-varanasi-first-time-guide/" target="_blank" rel="noopener noreferrer" aria-label="Read the Varanasi travel feature on Bazar Travels (opens in a new tab)"><span class="review-brand-name">Bazar Travels</span><span class="review-brand-caption">Travel feature ↗</span></a>
    </div>
  </div>
</section>
<!-- TV_HOME_INTRO_END -->`;

export function refreshHomeIntroduction(html) {
  html=html.replace(/<!-- TV_HOME_INTRO_START -->[\s\S]*?<!-- TV_HOME_INTRO_END -->\s*/g,'');
  html=html.replace(/<section\b[^>]*class="intro section-white"[^>]*>[\s\S]*?<\/section>\s*/g,'');
  const hero=/<section\b[^>]*class="hero"[^>]*>[\s\S]*?<\/section>/;
  if(!hero.test(html))throw new Error('Homepage hero missing: cannot place introduction.');
  return html.replace(hero,match=>match+'\n'+introduction+'\n');
}
