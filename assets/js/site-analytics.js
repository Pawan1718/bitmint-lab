/* Bitmint Lab analytics foundation. No identifiers or personal form fields are sent. */
(function () {
  'use strict';
  var measurementId = window.BITMINT_GA4_ID || (document.querySelector('meta[name="bitmint-ga4-id"]') || {}).content || '';
  var gaId = /^G-[A-Z0-9]{6,20}$/.test(measurementId) ? measurementId : '';
  var consentKey = 'bitmint_analytics_consent_v1';
  var consent = 'unknown';
  try { consent = localStorage.getItem(consentKey) || 'unknown'; } catch (_) {}
  var loaded = false;
  var queue = [];
  function send(event, parameters) {
    if (!gaId || consent !== 'granted') return;
    if (!loaded || typeof window.gtag !== 'function') { queue.push([event, parameters]); return; }
    window.gtag('event', event, parameters || {});
  }
  function load() {
    if (!gaId || loaded || consent !== 'granted') return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: true, anonymize_ip: true });
    var tag = document.createElement('script');
    tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(tag);
    while (queue.length) { var item = queue.shift(); window.gtag('event', item[0], item[1]); }
  }
  function setConsent(value) {
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_) {}
    if (value === 'granted') load();
    var ui = document.getElementById('bitmint-analytics-consent');
    if (ui) ui.remove();
  }
  function showConsent() {
    if (!gaId || consent !== 'unknown' || document.getElementById('bitmint-analytics-consent')) return;
    var ui = document.createElement('div');
    ui.id = 'bitmint-analytics-consent';
    ui.setAttribute('role', 'region'); ui.setAttribute('aria-label', 'Optional analytics consent');
    ui.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:20000;max-width:390px;background:#14283d;color:#fff;padding:17px 18px;border-radius:12px;box-shadow:0 12px 32px #0003;font:14px/1.5 Arial,sans-serif';
    var content = document.createElement('p');
    content.textContent = 'May we use optional Google Analytics to understand which pages and links are helpful?';
    content.style.margin = '0 0 12px';
    var choices = document.createElement('div'); choices.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
    [['Allow analytics', 'granted'], ['No thanks', 'denied']].forEach(function (entry) {
      var button = document.createElement('button'); button.type = 'button'; button.textContent = entry[0];
      button.style.cssText = 'border:1px solid #a7b5cc;border-radius:7px;background:' + (entry[1] === 'granted' ? '#514bfa' : 'transparent') + ';color:white;padding:8px 12px;cursor:pointer;font:700 13px Arial,sans-serif';
      button.addEventListener('click', function () { setConsent(entry[1]); }); choices.appendChild(button);
    });
    ui.append(content, choices); document.body.appendChild(ui);
  }
  window.BitmintAnalytics = Object.freeze({
    track: function (event, parameters) {
      if (!/^(contact_whatsapp_click|notiq_cta_click|demo_click|blog_signup_click|contact_email_click|contact_phone_click)$/.test(event)) return;
      // Do not include names, phone numbers, emails, free text, or URLs containing user data.
      send(event, parameters || {});
    },
    consent: function (value) { if (value === 'granted' || value === 'denied') setConsent(value); }
  });
  function init() {
    if (consent === 'granted') load(); else showConsent();
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]'); if (!link) return;
      var raw = link.getAttribute('href') || '';
      var href; try { href = new URL(raw, location.href); } catch (_) { return; }
      if (href.hostname === 'notiq.bitmintlab.in') {
        send(/book-demo/.test(href.pathname) ? 'demo_click' : /register/.test(href.pathname) ? 'blog_signup_click' : 'notiq_cta_click',
          { location: document.querySelector('.na-blog, .na-article') ? 'blog' : 'website' });
      } else if (href.hostname === 'wa.me') {
        send('contact_whatsapp_click', { source: 'link' });
      } else if (href.protocol === 'mailto:') {
        send('contact_email_click', {});
      } else if (href.protocol === 'tel:') {
        send('contact_phone_click', {});
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();