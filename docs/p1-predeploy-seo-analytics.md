# Bitmint Lab — P1 pre-deployment technical SEO and GA4

Scope: **bitmintlab.in only**. This checklist does not deploy the site and does not change NOTIQ application analytics.

## 1. Configure GA4 (not yet configured)

1. In Google Analytics, create/open the **Bitmint Lab web data stream** for https://bitmintlab.in.
2. Copy the real **Measurement ID** (format `G-XXXXXXXXXX`).
3. In `assets/js/analytics-config.js`, replace the empty string:
   `window.BITMINT_GA4_ID = 'G-YOUR_REAL_ID';`
4. Do not invent an ID or reuse a NOTIQ property without deliberately choosing shared reporting.
5. The shared navigation loads the config and the analytics loader on all HTML pages. Google Analytics is **not loaded until visitors grant optional analytics consent**. Visitors who decline are not tracked by this loader.
6. For consent retesting, visit the Privacy Policy and use **Change analytics preference**; reload after resetting.

### Available GA4 events

- `page_view`: automatically after consent
- `notiq_cta_click`: outbound NOTIQ links
- `demo_click`: NOTIQ demo link
- `blog_signup_click`: blog NOTIQ email handoff (click intent, not confirmed signup)
- `contact_whatsapp_click`: WhatsApp links and contact form handoff (not confirmed lead)
- `contact_email_click` and `contact_phone_click`: contact link taps

No names, phone numbers, email addresses or enquiry messages are passed as event parameters. **Do not mark `contact_whatsapp_click` as a confirmed `generate_lead` conversion**. Site currently redirects the enquiry to WhatsApp without server-side acknowledgement. Actual conversions need downstream confirmation.

## 2. Source validation before deploy

Run at the repo root:

```powershell
node scripts/predeploy-seo-audit.cjs
```

It checks sitemap URLs, canonical tags, titles, metadata, referenced local assets and JSON-LD syntax. A warning about an unset GA4 ID means GA4 will remain disabled. This audit is read-only and does not send network requests.

## 3. Post-deployment checks

- Check homepage, `/products/`, `/blog/`, 8 articles and legal pages on mobile and desktop.
- Verify all image and script requests return HTTP 200.
- Verify HTTPS and primary-domain redirects; avoid duplicate `www` canonical URLs.
- Confirm robots and sitemap:
  - https://bitmintlab.in/robots.txt
  - https://bitmintlab.in/sitemap.xml
- Since the Google Search Console domain has already been verified, inspect/update its sitemap submission. Verify indexing via URL Inspection, not merely by checking code.
- Open a representative link in WhatsApp and LinkedIn and confirm the large preview image actually loads. Social bots may cache earlier previews.
- In GA4 Realtime/DebugView, after **Allow analytics**, inspect `page_view`, outbound NOTIQ click, demo link, and WhatsApp handoff events. Test the **No thanks** path separately.
- Review published Privacy Policy statements and verify any third-party integrations have the required disclosures.

## 4. Explicit release limitations

- GA4 property ID requires owner input before tracking can operate.
- Search Console verified domain does not prove pages are indexed or sitemap accepted.
- Social tags reference real first-party WebP illustrations already in the repository; custom dedicated brand-wide 1200×630 banner can be substituted later.
- Link clicks, redirects and demo interest are *intent* metrics, not proof of registrations or confirmed leads.
- No CI/build, live deployment or live-browser QA has been run for this change set.
