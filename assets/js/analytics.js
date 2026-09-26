(function () {
  'use strict';
  if (window.TVAnalytics) return;
  const config = window.TV_ANALYTICS_CONFIG || {};
  const measurementId = /^G-[A-Z0-9]+$/.test(config.measurementId || '') ? config.measurementId : '';
  const CONSENT_KEY = 'tv.analytics-consent.v1';
  const SESSION_KEY = 'tv.enquiry-source.v1';
  const FORM_NAMES = new Set(['journey-enquiry', 'plan-my-journey', 'destination-enquiry', 'sacred-tour-enquiry', 'service-standards-enquiry']);
  let enabled = false;
  let consent = '';
  let context;
  function read(storage, key) { try { return window[storage].getItem(key); } catch (_) { return null; } }
  function write(storage, key, value) { try { window[storage].setItem(key, value); } catch (_) {} }
  function path(value) {
    try { const url = new URL(value, window.location.origin); return url.origin === window.location.origin ? url.pathname : ''; }
    catch (_) { return ''; }
  }
  function domain(value) { try { return new URL(value).hostname; } catch (_) { return ''; } }
  function campaign(value) { return /^[a-zA-Z0-9 _.-]{1,100}$/.test(value || '') ? value : ''; }
  function getContext() {
    const current = window.location.pathname;
    const now = Date.now();
    let saved;
    try { saved = JSON.parse(read('sessionStorage', SESSION_KEY) || 'null'); } catch (_) {}
    if (!saved || !saved.updated || now - saved.updated > 30 * 60 * 1000) {
      const params = new URLSearchParams(window.location.search);
      saved = { landing_page: current, referring_domain: domain(document.referrer),
        utm_source: campaign(params.get('utm_source')), utm_medium: campaign(params.get('utm_medium')),
        utm_campaign: campaign(params.get('utm_campaign')), previous_page: '' };
    } else {
      saved.previous_page = saved.last_page !== current ? path(saved.last_page) : saved.previous_page;
    }
    saved.updated = now;
    saved.last_page = current;
    write('sessionStorage', SESSION_KEY, JSON.stringify(saved));
    return saved;
  }
  function attribution() {
    return {
      source_page: window.location.pathname,
      landing_page: path(context.landing_page),
      enquiry_origin_page: window.location.pathname === '/plan-my-journey/' ? path(context.previous_page) || path(context.landing_page) : window.location.pathname,
      referring_domain: context.referring_domain || '',
      utm_source: campaign(context.utm_source), utm_medium: campaign(context.utm_medium), utm_campaign: campaign(context.utm_campaign)
    };
  }
  function activate() {
    if (enabled || !measurementId || consent !== 'granted') return;
    enabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: window.location.origin + window.location.pathname,
      page_referrer: domain(document.referrer) ? 'https://' + domain(document.referrer) + '/' : ''
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
    emit('page_view');
  }
  function emit(name, details) {
    // Never pass form answers, contact information or full query strings to GA.
    if (!enabled || consent !== 'granted') return;
    window.gtag('event', name, Object.assign({
      send_to: measurementId, transport_type: 'beacon', page_path: window.location.pathname,
      page_location: window.location.origin + window.location.pathname
    }, attribution(), details || {}));
  }
  function consentControls() {
    if (!measurementId) return;
    const panel = document.createElement('aside');
    panel.setAttribute('aria-label', 'Analytics preferences');
    panel.style.cssText = 'position:fixed;bottom:80px;left:16px;right:16px;max-width:460px;z-index:200;background:#fff;color:#222;padding:20px;border:1px solid #999;box-shadow:0 4px 20px #0002;font:16px/1.5 Arial,sans-serif;';
    const message = document.createElement('p');
    message.textContent = 'May we use Google Analytics to understand page visits and enquiry actions? This is optional. Your enquiry details are not sent to Google Analytics.';
    panel.appendChild(message);
    function choice(label, value) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label;
      button.style.cssText = 'margin:4px;padding:10px 14px;font:inherit;cursor:pointer;';
      button.addEventListener('click', function () {
        consent = value; write('localStorage', CONSENT_KEY, value);
        panel.hidden = true;
        if (value === 'granted') activate();
        else if (enabled) { window['ga-disable-' + measurementId] = true; window.location.reload(); }
      });
      panel.appendChild(button);
    }
    choice('Allow analytics', 'granted'); choice('Decline analytics', 'denied');
    const privacy = document.createElement('a'); privacy.href = '/privacy-policy/'; privacy.textContent = 'Privacy policy';
    privacy.style.cssText = 'display:block;margin-top:10px;'; panel.appendChild(privacy);
    panel.hidden = !!consent;
    document.body.appendChild(panel);
    const settings = document.createElement('button');
    settings.type = 'button'; settings.textContent = 'Analytics preferences';
    settings.style.cssText = 'display:block;margin:16px auto;padding:8px;font:14px Arial,sans-serif;';
    settings.addEventListener('click', function () { panel.hidden = false; panel.querySelector('button').focus(); });
    (document.querySelector('footer') || document.body).appendChild(settings);
  }
  function fillSource(form) {
    const values = attribution();
    Object.keys(values).forEach(function (key) {
      let input = form.querySelector('input[name="' + key + '"]');
      if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = key; form.appendChild(input); }
      input.value = values[key];
    });
  }
  function locationOf(link) {
    if (link.closest('.tv-whatsapp-float')) return 'floating_button';
    if (link.closest('footer, .tv-footer, .tvf-footer')) return 'footer';
    if (link.closest('.tv-top-contact-bar, .topbar')) return 'top_bar';
    if (link.closest('.hero, .page-hero, .journey-hero, .pmj-hero, .lang-hero')) return 'hero';
    return 'page_content';
  }
  function status(form, text) {
    let message = form.querySelector('[data-tv-form-status]');
    if (!message) {
      message = document.createElement('p'); message.setAttribute('data-tv-form-status', '');
      message.setAttribute('role', 'status'); message.setAttribute('aria-live', 'polite');
      message.style.gridColumn = '1 / -1'; form.appendChild(message);
    }
    message.textContent = text;
  }
  const pending = new WeakSet();
  const completed = new WeakSet();
  async function submit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !FORM_NAMES.has(form.getAttribute('name')) || event.defaultPrevented) return;
    event.preventDefault();
    if (pending.has(form) || completed.has(form) || !form.reportValidity()) return;
    const honeypot = form.querySelector('[name="company-website"]');
    if (honeypot && honeypot.value) return;
    fillSource(form);
    const data = new FormData(form);
    data.set('form-name', form.getAttribute('name'));
    const buttons = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]'));
    pending.add(form); buttons.forEach(b => { b.disabled = true; });
    status(form, 'Sending your enquiry…');
    let accepted = false;
    try {
      const response = await window.fetch('/', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });
      if (!response.ok) throw new Error('Form service rejected the submission');
      accepted = true; completed.add(form);
      status(form, 'Your enquiry has been sent. Thank you.');
      try { emit('generate_lead', { form_name: form.getAttribute('name'), lead_method: 'website_form' }); } catch (_) {}
      // No conversion on thank-you page load: direct visits and refreshes cannot count again.
      window.location.assign('/thank-you/');
    } catch (_) {
      if (!accepted) status(form, 'We could not confirm delivery. Please try again, or contact tours@tourvaranasi.com.');
    } finally {
      pending.delete(form);
      if (!accepted) buttons.forEach(b => { b.disabled = false; });
    }
  }
  function init() {
    context = getContext();
    consent = read('localStorage', CONSENT_KEY) || '';
    consentControls(); activate();
    document.querySelectorAll('form').forEach(function (form) {
      if (FORM_NAMES.has(form.getAttribute('name'))) fillSource(form);
    });
    document.addEventListener('click', function (event) {
      const link = event.target.closest && event.target.closest('a');
      if (!link) return;
      let url;
      try { url = new URL(link.href, window.location.origin); } catch (_) { return; }
      if (url.hostname === 'wa.me' && url.pathname === '/917457905011') {
        // Include only the public page path, never URL query parameters or form values.
        const base = url.searchParams.get('text') || 'Hello Tour Varanasi, please help me plan my journey.';
        if (!base.includes('\nPage: ')) {
          url.searchParams.set('text', base + '\nPage: ' + window.location.origin + window.location.pathname);
          link.href = url.href;
        }
        emit('whatsapp_click', { link_location: locationOf(link), contact_method: 'whatsapp' });
      }
    });
    document.addEventListener('submit', submit);
  }
  window.TVAnalytics = { version: '1', status: function () { return { configured: !!measurementId, enabled: enabled && consent === 'granted' }; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
