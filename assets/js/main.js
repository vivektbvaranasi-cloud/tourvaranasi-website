(function () {
  const WA = 'https://wa.me/917457905011?text=Hello%20Tour%20Varanasi%2C%20I%20would%20like%20to%20plan%20a%20journey.';
  const EMAIL = 'mailto:tours@tourvaranasi.com';
  const LOGO = '/assets/images/tour-varanasi-logo.png';

  function isHomepage() {
    const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    return path === '/' || path === '/index.html';
  }

  function bindMenu(root = document) {
    const button = root.querySelector('.tv-menu-btn');
    const nav = root.querySelector('.tv-navlinks');

    if (!button || !nav || button.dataset.bound === '1') return;

    button.dataset.bound = '1';

    button.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
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
          <a href="${WA}" target="_blank" rel="noopener">
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

    header.innerHTML = `
      <nav class="tv-nav-wrap">

        <a class="tv-brand-logo" href="/">
          <img src="${LOGO}" alt="Tour Varanasi">
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

          <a href="/tour-varanasi-contact/">
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

          <a href="/tour-varanasi-contact/">
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
      bindMenu(document);
      return;
    }

    removeOldShell();

    const topBar = buildTopBar();
    const header = buildHeader();
    const footer = buildFooter();

    document.body.insertBefore(header, document.body.firstChild);
    document.body.insertBefore(topBar, header);
    document.body.appendChild(footer);

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
