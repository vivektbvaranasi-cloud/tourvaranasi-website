(function () {
  const WA_BASE = 'https://wa.me/917457905011';
  const WA = WA_BASE + '?text=Hello%20Tour%20Varanasi%2C%20I%20would%20like%20to%20plan%20a%20journey.';
  const EMAIL = 'mailto:tours@tourvaranasi.com';
  const LOGO = '/tour-varanasi-logo.png';
  const ABOUT_LOGO = LOGO;
  const ABOUT_HERO = '/assets/images/guest_joyful_boat.webp';

  function currentPath() {
    return (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function isHomepage() {
    const path = currentPath();
    return path === '/' || path === '/index.html';
  }

  function isAboutPage() {
    return currentPath() === '/about-us';
  }

  function bindMenu(root = document) {
    const button = root.querySelector('.tv-menu-btn, .menu-btn');
    const nav = root.querySelector('.tv-navlinks, .navlinks');

    if (!button || !nav || button.dataset.bound === '1') return;

    button.dataset.bound = '1';

    function setOpen(open) {
      nav.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    button.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        button.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && nav.classList.contains('open')) {
        setOpen(false);
      }
    });
  }

  function normalizeContactLinks(root = document) {
    root.querySelectorAll('a[href^="tel:+917457905011"], a[href^="tel:917457905011"]').forEach(function (link) {
      link.href = WA;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'WhatsApp Tour Varanasi at +91 74579 05011');
    });

    root.querySelectorAll('a').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      if ((link.textContent || '').trim().toLowerCase() === 'tours@tourvaranasi.com' && !href.startsWith('mailto:')) {
        link.href = EMAIL;
      }
    });
  }

  function optimizeAboutPage() {
    if (!isAboutPage()) return;

    const hero = document.querySelector('.page-hero .frame');
    if (hero) {
      hero.style.backgroundImage = `url('${ABOUT_HERO}')`;
    }
  }

  function applyAboutHomeHeaderStyles() {
    if (!isAboutPage() || document.getElementById('tv-about-home-header-styles')) return;

    const style = document.createElement('style');
    style.id = 'tv-about-home-header-styles';
    style.textContent = `
      .tv-site-header{
        position:sticky;
        top:0;
        z-index:50;
        background:rgba(255,253,249,.96);
        -webkit-backdrop-filter:blur(10px);
        backdrop-filter:blur(10px);
        border-bottom:1px solid rgba(221,216,207,.72);
      }
      .tv-nav-wrap{gap:0;}
      .about-direct-contact a{color:inherit;text-decoration:none;border-bottom:1px solid rgba(49,45,50,.35);}
      .about-direct-contact a:hover{border-bottom-color:currentColor;}
      .about-form fieldset{grid-column:1/-1;border:0;padding:0;margin:2px 0 4px;}
      .about-form legend{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6f656d;margin-bottom:7px;}
      .about-choice-row{display:flex;gap:10px;flex-wrap:wrap;}
      .about-choice{background:#fffdf9;border:1px solid #c9bfc2;padding:10px 12px;display:flex!important;gap:8px;align-items:center;font-size:13px!important;text-transform:none!important;letter-spacing:0!important;color:#3d383d!important;margin:0!important;}
      .about-choice input{width:auto!important;margin:0!important;}
      .about-checks{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
      .about-checks label{background:#fffdf9;border:1px solid #c9bfc2;padding:10px 12px;margin:0!important;text-transform:none!important;letter-spacing:0!important;font-size:13px!important;color:#3d383d!important;display:flex!important;align-items:center;gap:8px;}
      .about-checks input{width:auto!important;margin:0!important;}
      .about-hotel-hidden{display:none!important;}
      .about-form .form-reassurance{font-size:11px;color:#756d73;margin:9px 0 0;}
      @media(max-width:620px){
        .about-choice-row{flex-direction:column;}
        .about-choice{width:100%;}
        .about-checks{grid-template-columns:1fr;}
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceAboutContactBlock() {
    if (!isAboutPage()) return;

    const intro = document.querySelector('.quote-wrap .section > div:first-child');
    if (!intro) return;

    intro.querySelectorAll('p').forEach(function (p) {
      const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.includes('+91-7457905011') && text.includes('tours@tourvaranasi.com')) {
        p.classList.add('about-direct-contact');
        p.innerHTML = `<a href="${WA}" target="_blank" rel="noopener"><strong>+91-7457905011</strong></a><br/><a href="${EMAIL}">tours@tourvaranasi.com</a>`;
      }
    });
  }

  function upgradeAboutForm() {
    if (!isAboutPage()) return;

    const form = document.querySelector('form[name="journey-enquiry"]');
    if (!form || form.dataset.agreedForm === '1') return;

    form.dataset.agreedForm = '1';
    form.classList.add('about-form');
    form.innerHTML = `
      <input name="form-name" type="hidden" value="journey-enquiry"/>
      <p class="hp"><label>Do not fill this out <input name="company-website"/></label></p>
      <div><label for="about-name">Name</label><input autocomplete="name" id="about-name" name="name" required/></div>
      <div><label for="about-email">Email</label><input autocomplete="email" id="about-email" name="email" required type="email"/></div>
      <div><label for="about-phone">WhatsApp / Phone <span class="optional">Optional</span></label><input autocomplete="tel" id="about-phone" name="phone"/></div>
      <div><label for="about-country">Country of residence</label><input autocomplete="country-name" id="about-country" name="country" required/></div>
      <div><label for="about-dates">Travel dates</label><input id="about-dates" name="travel-dates" placeholder="Approximate dates are fine"/></div>
      <div><label for="about-travellers">Number of travellers</label><input id="about-travellers" name="travellers" placeholder="e.g. 2 adults"/></div>
      <div class="full"><label for="about-route">Where would you like to travel?</label><input id="about-route" name="journey-interest" placeholder="e.g. Varanasi + Ayodhya, Buddhist Circuit, or a multi-city journey"/></div>

      <fieldset>
        <legend>Would you like us to include hotels?</legend>
        <div class="about-choice-row">
          <label class="about-choice"><input type="radio" name="accommodation-required" value="Yes, include accommodation"/> Yes, include accommodation</label>
          <label class="about-choice"><input type="radio" name="accommodation-required" value="No, quote without accommodation"/> No, quote without accommodation</label>
          <label class="about-choice"><input type="radio" name="accommodation-required" value="Not decided yet"/> Not decided yet</label>
        </div>
      </fieldset>

      <div class="full about-hotel-hidden" id="about-hotel-field"><label for="about-hotel">Preferred hotel category</label><select id="about-hotel" name="hotel-preference"><option value="">Please select</option><option>Comfortable 3-star</option><option>Comfortable 4-star</option><option>Luxury / 5-star</option><option>Heritage / character hotel</option><option>Riverfront where practical</option><option>Please recommend</option></select></div>

      <div class="full"><label for="about-pace">Preferred pace</label><select id="about-pace" name="preferred-pace"><option value="">Please advise</option><option>Relaxed</option><option>Balanced</option><option>Full sightseeing</option></select></div>

      <fieldset>
        <legend>What interests you?</legend>
        <div class="about-checks">
          <label><input type="checkbox" name="interests-list" value="Temples & spirituality"/> Temples &amp; spirituality</label>
          <label><input type="checkbox" name="interests-list" value="History & heritage"/> History &amp; heritage</label>
          <label><input type="checkbox" name="interests-list" value="River experiences"/> River experiences</label>
          <label><input type="checkbox" name="interests-list" value="Local walks & food"/> Local walks &amp; food</label>
          <label><input type="checkbox" name="interests-list" value="Buddhism"/> Buddhism</label>
          <label><input type="checkbox" name="interests-list" value="Crafts & local culture"/> Crafts &amp; local culture</label>
        </div>
      </fieldset>

      <div class="full"><label for="about-wish">Anything particularly important to you?</label><textarea id="about-wish" name="special-requirements" placeholder="Tell us about places you do not want to miss, senior citizens, children, mobility considerations or any other requirements."></textarea></div>
      <div class="full"><button type="submit">Plan My Journey</button><p class="form-reassurance">No obligation to book. We use these details only to prepare and discuss your private journey.</p></div>
    `;

    const hotelField = form.querySelector('#about-hotel-field');
    const radios = form.querySelectorAll('input[name="accommodation-required"]');

    function syncHotel() {
      const selected = form.querySelector('input[name="accommodation-required"]:checked');
      const show = selected && selected.value === 'Yes, include accommodation';
      if (hotelField) hotelField.classList.toggle('about-hotel-hidden', !show);
    }

    radios.forEach(function (radio) {
      radio.addEventListener('change', syncHotel);
    });

    syncHotel();
  }

  function buildTopBar() {
    const bar = document.createElement('div');
    bar.className = 'tv-top-contact-bar';

    bar.innerHTML = `
      <div class="tv-top-contact-inner">
        <span class="tv-top-contact-note">
          Private journeys · locally planned in Varanasi
        </span>

        <div class="tv-top-contact-links">
          <a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp Tour Varanasi at +91 74579 05011">
            +91 74579 05011
          </a>

          <a href="${EMAIL}">
            tours@tourvaranasi.com
          </a>
        </div>
      </div>
    `;

    return bar;
  }

  function buildHeader() {
    const header = document.createElement('header');
    header.className = 'tv-site-header';
    const logo = isAboutPage() ? ABOUT_LOGO : LOGO;

    header.innerHTML = `
      <nav class="tv-nav-wrap" aria-label="Primary">

        <a class="tv-brand-logo" href="/" aria-label="Tour Varanasi home">
          <img src="${logo}" alt="Tour Varanasi">
        </a>

        <button
          class="tv-menu-btn"
          aria-label="Open menu"
          aria-expanded="false"
        >
          ☰
        </button>

        <div class="tv-navlinks">

          <a href="/journeys-beyond-varanasi/">
            Destinations
          </a>

          <a href="/tours/">
            Tours
          </a>

          <a href="/experiences/">
            Experiences
          </a>

          <a href="/about-us/">
            About
          </a>

          <a href="/plan-my-journey/">
            Contact
          </a>

          <a class="tv-nav-cta" href="/plan-my-journey/">
            Plan My Journey
          </a>

        </div>

      </nav>
    `;

    return header;
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    footer.className = 'tv-footer';

    footer.innerHTML = `
      <div class="tv-container tv-footer-grid">

        <div class="tv-footer-brand">

          <a href="/" class="tv-footer-logo-link">
            <span class="tv-footer-logo-plate">
              <img src="${LOGO}" alt="Tour Varanasi">
            </span>
          </a>

          <p>
            A Varanasi-based specialist for thoughtful private journeys
            through the sacred city and the cultural and Buddhist
            landscapes around it.
          </p>

        </div>


        <div>
          <h4>Destinations</h4>

          <a href="/tours/">
            Varanasi
          </a>

          <a href="/tours/5-days-varanasi-ayodhya-tour-1/">
            Ayodhya
          </a>

          <a href="/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/">
            Prayagraj
          </a>

          <a href="/journeys-beyond-varanasi/">
            Buddhist Heartlands
          </a>
        </div>


        <div>
          <h4>Plan</h4>

          <a href="/experiences/">
            Experiences
          </a>

          <a href="/plan-my-journey/">
            Plan My Journey
          </a>

          <a href="/service-standards/">
            Service Standards
          </a>

          <a href="/reviews/">
            Guest Reviews
          </a>

          <a href="/blogs/">
            Travel Guide
          </a>
        </div>


        <div>
          <h4>Tour Varanasi</h4>

          <a href="/about-us/">
            About Us
          </a>

          <a href="/plan-my-journey/">
            Contact
          </a>

          <a href="/legal/">
            Legal
          </a>

          <a href="/privacy-policy/">
            Privacy Policy
          </a>

          <a href="/sitemap.xml">
            Sitemap
          </a>

          <div class="tv-footer-contact-links">

            <a href="${WA}" target="_blank" rel="noopener">
              +91 74579 05011 · WhatsApp
            </a>

            <a href="${EMAIL}">
              tours@tourvaranasi.com
            </a>

          </div>
        </div>

      </div>

      <div class="tv-footer-bottom">
        © 2026 Tour Varanasi. All rights reserved.
      </div>
    `;

    return footer;
  }

  function removeOldShell() {

    document
      .querySelectorAll(
        '.topbar, .top-contact-bar, .tv-top-contact-bar'
      )
      .forEach(function (el) {
        el.remove();
      });

    document
      .querySelectorAll(
        'header.header, header.site-header, header.tv-site-header'
      )
      .forEach(function (el) {
        el.remove();
      });

    document
      .querySelectorAll(
        'footer.footer, footer.site-footer, footer.tv-footer'
      )
      .forEach(function (el) {
        el.remove();
      });
  }

  function applySharedShell() {

    if (isHomepage()) {
      normalizeContactLinks(document);
      bindMenu(document);
      return;
    }

    optimizeAboutPage();
    applyAboutHomeHeaderStyles();
    enhanceAboutContactBlock();
    upgradeAboutForm();
    removeOldShell();

    const topBar = buildTopBar();
    const header = buildHeader();
    const footer = buildFooter();

    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(topBar, header);
    document.body.appendChild(footer);

    normalizeContactLinks(document);
    bindMenu(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      applySharedShell
    );
  } else {
    applySharedShell();
  }

})();
