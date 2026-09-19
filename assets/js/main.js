(function () {
  const WA_BASE = 'https://wa.me/917457905011';
  const WA_MESSAGE = 'Hello Tour Varanasi, I am planning a private journey to Varanasi. Please help me with an itinerary and quotation.';
  const WA = WA_BASE + '?text=' + encodeURIComponent(WA_MESSAGE);
  const EMAIL = 'mailto:tours@tourvaranasi.com';
  const PMJ = '/plan-my-journey/';
  const TRIPADVISOR = 'https://www.tripadvisor.in/Attraction_Review-g297685-d10366118-Reviews-Tour_Varanasi-Varanasi_Varanasi_District_Uttar_Pradesh.html';
  const FACEBOOK = 'https://www.facebook.com/TourVaranasi';
  const INSTAGRAM = 'https://www.instagram.com/tourvaranasi_?stkn=d3EwbjMwdmx3NjIx';
  const LOGO = '/tour-varanasi-logo.png';
  const ABOUT_LOGO = LOGO;
  const ABOUT_HERO = '/assets/images/guest_joyful_boat.webp';

  function trackEvent(name, params) {
    const payload = Object.assign({
      page_path: window.location.pathname || '/',
      page_title: document.title || ''
    }, params || {});

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, payload));
    }
  }

  function whatsappLocation(link) {
    if (link.closest('.tv-top-contact-bar, .top-contact-bar, .topbar')) return 'top_bar';
    if (link.closest('.tv-footer, .footer, .site-footer')) return 'footer';
    if (link.closest('.tv-whatsapp-float')) return 'floating_button';
    if (link.closest('.hero, .page-hero, .journey-hero')) return 'hero';
    return 'page_content';
  }

  function ensureConversionStyles() {
    if (document.getElementById('tv-conversion-styles')) return;
    const style = document.createElement('style');
    style.id = 'tv-conversion-styles';
    style.textContent = `
      .tv-whatsapp-float{
        position:fixed;
        right:20px;
        bottom:20px;
        z-index:95;
        display:inline-flex;
        align-items:center;
        gap:9px;
        min-height:48px;
        padding:12px 16px;
        background:#1f5f4a;
        color:#fff!important;
        border:1px solid rgba(255,255,255,.22);
        text-decoration:none!important;
        font:600 13px/1.2 'Inter',Arial,sans-serif;
        letter-spacing:.01em;
        box-shadow:0 10px 28px rgba(0,0,0,.18);
        transition:transform .2s ease,box-shadow .2s ease,background .2s ease;
      }
      .tv-whatsapp-float:hover{
        transform:translateY(-2px);
        box-shadow:0 14px 34px rgba(0,0,0,.22);
        background:#194d3d;
      }
      .tv-whatsapp-float svg{width:18px;height:18px;display:block;fill:currentColor}
      .tv-language-switcher{position:relative;display:inline-flex;align-items:center}
      .tv-language-switcher summary{cursor:pointer;list-style:none;font-size:12px;font-weight:700;letter-spacing:.04em;color:#3f433f;padding:8px 3px}
      .tv-language-switcher summary::-webkit-details-marker{display:none}
      .tv-language-switcher summary:after{content:"▾";font-size:9px;margin-left:5px;color:#777}
      .tv-language-menu{position:absolute;right:0;top:100%;z-index:120;min-width:170px;background:#fffdf9;border:1px solid #ddd8cf;box-shadow:0 12px 30px rgba(30,30,30,.12);padding:8px}
      .tv-language-menu a{display:block!important;margin:0!important;padding:8px 10px!important;font-size:12px!important;color:#303430!important;white-space:nowrap}
      .tv-language-menu a:hover{background:#f3eee6;color:#8d4f3d!important}
      .tv-language-menu a[aria-current="page"]{font-weight:700;background:#edf1ec}
      .tv-language-footer{max-width:1180px;margin:32px auto 0;padding:18px 28px 0;border-top:1px solid rgba(255,255,255,.14);display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,.7)}
      .tv-language-footer strong{font-weight:600;color:#fff}
      .tv-language-footer a{color:rgba(255,255,255,.78);text-decoration:none}
      .tv-language-footer a:hover,.tv-language-footer a[aria-current="page"]{color:#fff}
      @media(max-width:980px){
        .tv-language-switcher{width:100%}
        .tv-language-menu{position:static;box-shadow:none;border:0;background:transparent;padding:4px 0 0;min-width:0}
        .tv-language-menu a{padding:7px 0!important}
      }
      @media(max-width:680px){
        .tv-whatsapp-float{
          right:14px;
          bottom:14px;
          min-height:46px;
          padding:11px 14px;
          font-size:12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePhotoContrastStyles() {
    if (document.getElementById('tv-photo-contrast-styles')) return;

    const style = document.createElement('style');
    style.id = 'tv-photo-contrast-styles';
    style.textContent = `
      /*
       * Readability safeguard for text rendered directly over photographs.
       * Keep normal light-background sections untouched.
       */
      .hero,
      .page-hero .frame,
      .journey-hero,
      .journey-closing,
      .destination-index-hero,
      .destination-detail-hero,
      .tour-detail-hero,
      .lang-hero,
      .tours-hero,
      .experiences-hero,
      .journey-card .journey-overlay {
        color:#fff!important;
      }

      .hero h1,.hero h2,.hero h3,.hero p,.hero .eyebrow,.hero .kicker,
      .page-hero .frame h1,.page-hero .frame h2,.page-hero .frame h3,.page-hero .frame p,.page-hero .frame .eyebrow,.page-hero .frame .kicker,
      .journey-hero h1,.journey-hero h2,.journey-hero h3,.journey-hero p,.journey-hero .eyebrow,.journey-hero .kicker,
      .journey-closing h1,.journey-closing h2,.journey-closing h3,.journey-closing p,.journey-closing .eyebrow,.journey-closing .kicker,
      .destination-index-hero h1,.destination-index-hero h2,.destination-index-hero h3,.destination-index-hero p,.destination-index-hero .eyebrow,.destination-index-hero .kicker,
      .destination-detail-hero h1,.destination-detail-hero h2,.destination-detail-hero h3,.destination-detail-hero p,.destination-detail-hero .eyebrow,.destination-detail-hero .kicker,
      .tour-detail-hero h1,.tour-detail-hero h2,.tour-detail-hero h3,.tour-detail-hero p,.tour-detail-hero .eyebrow,.tour-detail-hero .kicker,
      .lang-hero h1,.lang-hero h2,.lang-hero h3,.lang-hero p,.lang-hero .eyebrow,.lang-hero .kicker,.lang-hero .lang-kicker,
      .tours-hero h1,.tours-hero h2,.tours-hero h3,.tours-hero p,.tours-hero .eyebrow,.tours-hero .kicker,
      .experiences-hero h1,.experiences-hero h2,.experiences-hero h3,.experiences-hero p,.experiences-hero .eyebrow,.experiences-hero .kicker,
      .journey-card .journey-overlay h1,.journey-card .journey-overlay h2,.journey-card .journey-overlay h3,.journey-card .journey-overlay p,.journey-card .journey-overlay span {
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        text-shadow:0 2px 12px rgba(0,0,0,.48)!important;
      }

      .hero .eyebrow,.hero .kicker,
      .page-hero .frame .eyebrow,.page-hero .frame .kicker,
      .journey-hero .eyebrow,.journey-hero .kicker,
      .journey-closing .eyebrow,.journey-closing .kicker,
      .destination-index-hero .eyebrow,.destination-index-hero .kicker,
      .destination-detail-hero .eyebrow,.destination-detail-hero .kicker,
      .tour-detail-hero .eyebrow,.tour-detail-hero .kicker,
      .lang-hero .eyebrow,.lang-hero .kicker,.lang-hero .lang-kicker,
      .tours-hero .eyebrow,.tours-hero .kicker,
      .experiences-hero .eyebrow,.experiences-hero .kicker {
        color:#fff1e9!important;
        -webkit-text-fill-color:#fff1e9!important;
      }

      .page-hero .frame:before {
        background:linear-gradient(0deg,rgba(16,19,17,.80),rgba(16,19,17,.16) 72%)!important;
      }
      .journey-hero-overlay {
        background:linear-gradient(90deg,rgba(18,18,20,.84),rgba(18,18,20,.38) 66%,rgba(18,18,20,.12)),
                   linear-gradient(0deg,rgba(18,18,20,.58),transparent 62%)!important;
      }
      .journey-closing:before {
        background:linear-gradient(0deg,rgba(18,18,20,.82),rgba(18,18,20,.18))!important;
      }
      .destination-index-hero:before,
      .destination-detail-hero:before,
      .tour-detail-hero:before {
        background:linear-gradient(90deg,rgba(15,20,18,.80),rgba(15,20,18,.36) 60%,rgba(15,20,18,.12)),
                   linear-gradient(0deg,rgba(15,20,18,.52),transparent 64%)!important;
      }
      .tours-hero:after,
      .experiences-hero:after {
        background:linear-gradient(90deg,rgba(18,22,20,.76) 0%,rgba(18,22,20,.46) 48%,rgba(18,22,20,.16) 78%,rgba(18,22,20,.06) 100%)!important;
      }
      .hero-shade {
        background:linear-gradient(90deg,rgba(20,23,21,.80) 0%,rgba(20,23,21,.55) 44%,rgba(20,23,21,.24) 74%,rgba(20,23,21,.08) 100%),
                   linear-gradient(0deg,rgba(20,23,21,.28),rgba(20,23,21,0) 60%)!important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureFloatingWhatsApp() {
    if (document.querySelector('.tv-whatsapp-float')) return;
    const link = document.createElement('a');
    link.className = 'tv-whatsapp-float';
    link.href = WA;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'Chat with Tour Varanasi on WhatsApp');
    link.innerHTML = `
      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M19.11 17.38c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74.59.25 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.3zM16.03 3.2c-7.05 0-12.78 5.71-12.78 12.75 0 2.25.59 4.45 1.71 6.38L3.14 28.8l6.63-1.74a12.8 12.8 0 0 0 6.25 1.59h.01c7.04 0 12.77-5.72 12.77-12.76C28.8 8.86 23.08 3.2 16.03 3.2zm0 23.29h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.94 1.03 1.05-3.84-.25-.4a10.55 10.55 0 0 1-1.62-5.62c0-5.83 4.75-10.58 10.59-10.58 5.83 0 10.57 4.75 10.57 10.58 0 5.84-4.74 10.58-10.6 10.58z"/></svg>
      <span>Chat on WhatsApp</span>
    `;
    document.body.appendChild(link);
  }

  function bindConversionTracking(root = document) {
    if (root.documentElement && root.documentElement.dataset.tvTrackingBound === '1') return;
    if (root.documentElement) root.documentElement.dataset.tvTrackingBound = '1';

    root.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';

      if (href.includes('wa.me/917457905011')) {
        trackEvent('whatsapp_click', {
          link_location: whatsappLocation(link),
          link_text: (link.textContent || '').trim().slice(0, 120)
        });
      }

      if (href === '/plan-my-journey/' || href === '/plan-my-journey') {
        trackEvent('plan_my_journey_click', {
          link_location: whatsappLocation(link),
          link_text: (link.textContent || '').trim().slice(0, 120)
        });
      }
    });

    root.addEventListener('submit', function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const name = form.getAttribute('name') || form.id || 'form';
      if (name === 'journey-enquiry' || form.closest('.quote-wrap, .journey-form-wrap')) {
        trackEvent('journey_enquiry_submit', { form_name: name });
      }
    });
  }

  function currentPath() {
    return (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function isHomepage() {
    const path = currentPath();
    return path === '/' || path === '/index.html';
  }

  function isAboutPage() {
    return currentPath() === '/about-us' || currentPath() === '/about-tour-varanasi';
  }


  function isLocalizedLanding() {
    return /^\/(de|fr|es|it|ja|zh)(\/|$)/.test(currentPath());
  }

  function currentLanguageCode() {
    const match = currentPath().match(/^\/(de|fr|es|it|ja|zh)(\/|$)/);
    return match ? match[1] : 'en';
  }

  function ensureLanguageSwitcher() {
    const languages = [
      ['en', 'EN', '/'],
      ['de', 'Deutsch', '/de/'],
      ['fr', 'Français', '/fr/'],
      ['es', 'Español', '/es/'],
      ['it', 'Italiano', '/it/'],
      ['ja', '日本語', '/ja/'],
      ['zh', '中文', '/zh/']
    ];
    const current = currentLanguageCode();
    const active = languages.find(function (item) { return item[0] === current; }) || languages[0];

    const nav = document.querySelector('.tv-navlinks, .navlinks');
    if (nav && !nav.querySelector('.tv-language-switcher')) {
      const switcher = document.createElement('details');
      switcher.className = 'tv-language-switcher';
      switcher.innerHTML =
        '<summary aria-label="Choose language">' + active[1] + '</summary>' +
        '<div class="tv-language-menu">' +
        languages.map(function (item) {
          return '<a href="' + item[2] + '"' + (item[0] === current ? ' aria-current="page"' : '') + '>' + item[1] + '</a>';
        }).join('') +
        '</div>';
      const cta = nav.querySelector('.tv-nav-cta, .nav-cta');
      if (cta) nav.insertBefore(switcher, cta);
      else nav.appendChild(switcher);
    }

    const footer = document.querySelector('footer.tv-footer, footer.footer, footer.site-footer');
    if (footer && !footer.querySelector('.tv-language-footer')) {
      const line = document.createElement('div');
      line.className = 'tv-language-footer';
      line.innerHTML =
        '<strong>Languages</strong>' +
        languages.map(function (item) {
          return '<a href="' + item[2] + '"' + (item[0] === current ? ' aria-current="page"' : '') + '>' + item[1] + '</a>';
        }).join('');
      const bottom = footer.querySelector('.tv-footer-bottom, .footer-bottom, .copyright');
      if (bottom) footer.insertBefore(line, bottom);
      else footer.appendChild(line);
    }
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
    root.querySelectorAll('a[href^="tel:+917457905011"], a[href^="tel:917457905011"], a[href*="wa.me/917457905011"]').forEach(function (link) {
      link.href = WA;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'WhatsApp Tour Varanasi at +91 74579 05011');
    });

    root.querySelectorAll('a[href="/tour-varanasi-contact/"], a[href="/tour-varanasi-contact"], a[href="/contact/"], a[href="/contact"], a[href="/contact-us/"], a[href="/contact-us"]').forEach(function (link) {
      link.href = PMJ;
    });

    root.querySelectorAll('a').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      if ((link.textContent || '').trim().toLowerCase() === 'tours@tourvaranasi.com' && !href.startsWith('mailto:')) {
        link.href = EMAIL;
      }
    });
  }

  function tidyHomepageNavigation() {
    if (!isHomepage()) return;

    const nav = document.querySelector('.navlinks');
    if (!nav) return;

    nav.querySelectorAll('a').forEach(function (link) {
      const text = (link.textContent || '').trim().toLowerCase();
      if (text === 'contact' || text === 'contact us') {
        link.remove();
      }
    });
  }

  function ensureHomepageFooterContact() {
    if (!isHomepage()) return;

    const footer = document.querySelector('footer.footer');
    if (!footer) return;

    const alreadyThere = Array.from(footer.querySelectorAll('a')).some(function (link) {
      const text = (link.textContent || '').trim().toLowerCase();
      return text === 'contact' || text === 'contact us';
    });

    if (alreadyThere) return;

    const columns = footer.querySelectorAll('.footer-grid > div');
    const target = columns.length ? columns[columns.length - 1] : footer;
    const link = document.createElement('a');
    link.href = PMJ;
    link.textContent = 'Contact Us';
    link.setAttribute('data-tv-footer-contact', '1');

    const contactLine = target.querySelector('.contact-line');
    if (contactLine) {
      target.insertBefore(link, contactLine);
    } else {
      target.appendChild(link);
    }
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
      .about-form .form-reassurance{font-size:11px;color:#756d73;margin:9px 0 0;}
      @media(max-width:620px){
        .about-choice-row{flex-direction:column;}
        .about-choice{width:100%;}
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
      <div><label for="about-dates">Travel dates</label><input id="about-dates" name="travel-dates" placeholder="Approximate dates are fine"/></div>
      <div><label for="about-travellers">Number of travellers</label><input id="about-travellers" name="travellers" placeholder="e.g. 2 adults"/></div>
      <div class="full"><label for="about-route">Where would you like to travel?</label><input id="about-route" name="journey-interest" placeholder="e.g. Varanasi + Ayodhya, Buddhist Circuit, or a multi-city journey"/></div>

      <fieldset>
        <legend>Accommodation</legend>
        <div class="about-choice-row">
          <label class="about-choice"><input type="radio" name="accommodation-required" value="Yes, include accommodation"/> Include hotels</label>
          <label class="about-choice"><input type="radio" name="accommodation-required" value="No, quote without accommodation"/> No hotels</label>
          <label class="about-choice"><input type="radio" name="accommodation-required" value="Not decided yet"/> Not decided yet</label>
        </div>
      </fieldset>

      <div class="full"><label for="about-wish">Anything you’d like us to know?</label><textarea id="about-wish" name="special-requirements" placeholder="Tell us anything important for the journey, such as places you do not want to miss, senior citizens, children or mobility considerations."></textarea></div>
      <div class="full"><button type="submit">Plan My Journey</button><p class="form-reassurance">No obligation to book. We use these details only to prepare and discuss your private journey.</p></div>
    `;
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

          <a class="tv-nav-cta" href="${PMJ}">
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
          <div class="tv-footer-social" aria-label="Tour Varanasi reviews and social media">
            <p class="tv-footer-social-label">Reviews &amp; social</p>
            <div class="tv-footer-social-links">
              <a class="tv-social-link tv-ta" href="${TRIPADVISOR}" target="_blank" rel="noopener" aria-label="Read Tour Varanasi reviews on Tripadvisor">
                <img class="tv-social-logo" src="https://cdn.simpleicons.org/tripadvisor/34E0A1" alt="Tripadvisor" width="28" height="28" loading="lazy" decoding="async"/>
                <span>Tripadvisor</span>
              </a>
              <a class="tv-social-link" href="${INSTAGRAM}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Instagram">
                <img class="tv-social-logo" src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" loading="lazy" decoding="async"/>
                <span>Instagram</span>
              </a>
              <a class="tv-social-link" href="${FACEBOOK}" target="_blank" rel="noopener" aria-label="Tour Varanasi on Facebook">
                <img class="tv-social-logo" src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" loading="lazy" decoding="async"/>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4>Destinations</h4>

          <a href="/tours/">Varanasi</a>
          <a href="/tours/5-days-varanasi-ayodhya-tour-1/">Ayodhya</a>
          <a href="/tours/6-days-varanasi-prayagraj-ayodhya-tour-2/">Prayagraj</a>
          <a href="/journeys-beyond-varanasi/">Buddhist Heartlands</a>
        </div>

        <div>
          <h4>Plan</h4>

          <a href="/experiences/">Experiences</a>
          <a href="${PMJ}">Plan My Journey</a>
          <a href="/service-standards/">Service Standards</a>
          <a href="/reviews/">Guest Reviews</a>
          <a href="/blogs/">Travel Guide</a>
        </div>

        <div>
          <h4>Tour Varanasi</h4>

          <a href="/about-tour-varanasi/">About Us</a>
          <a href="${PMJ}">Contact Us</a>
          <a href="/legal/">Legal</a>
          <a href="/privacy-policy/">Privacy Policy</a>
          <a href="/sitemap.xml">Sitemap</a>

          <div class="tv-footer-contact-links">
            <a href="${WA}" target="_blank" rel="noopener">+91 74579 05011 · WhatsApp</a>
            <a href="${EMAIL}">tours@tourvaranasi.com</a>
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
      .querySelectorAll('.topbar, .top-contact-bar, .tv-top-contact-bar')
      .forEach(function (el) {
        el.remove();
      });

    document
      .querySelectorAll('header.header, header.site-header, header.tv-site-header')
      .forEach(function (el) {
        el.remove();
      });

    document
      .querySelectorAll('footer.footer, footer.site-footer, footer.tv-footer')
      .forEach(function (el) {
        el.remove();
      });
  }

  function applySharedShell() {
    ensureConversionStyles();
    ensurePhotoContrastStyles();
    bindConversionTracking(document);

    if (isLocalizedLanding()) {
      normalizeContactLinks(document);
      ensureLanguageSwitcher();
      bindMenu(document);
      ensureFloatingWhatsApp();
      return;
    }

    if (isHomepage()) {
      normalizeContactLinks(document);
      tidyHomepageNavigation();
      ensureHomepageFooterContact();
      ensureLanguageSwitcher();
      bindMenu(document);
      ensureFloatingWhatsApp();
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
    ensureLanguageSwitcher();
    bindMenu(document);
    ensureFloatingWhatsApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySharedShell);
  } else {
    applySharedShell();
  }
})();