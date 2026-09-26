# Enquiry measurement

The shared script captures source information in Netlify form records even when optional analytics is declined or no GA4 property is configured. WhatsApp links add the current page to their editable suggested message. Neither action proves that a WhatsApp message was sent or a booking was made.

## Activate GA4

Set the site's Netlify build environment variable `GA4_MEASUREMENT_ID` to the owner's `G-...` web-stream ID, then rebuild. Do not add a second GTM or gtag loader. An empty ID leaves Google Analytics disabled. The script loads Google Analytics only after the visitor allows optional analytics.

In the GA4 web stream, disable enhanced measurement **Form interactions**, to avoid confusing automatic submit attempts with accepted enquiries. Disable automatic page changes based on browser history if enabled; this static site explicitly sends page views. Review any existing GTM tags before using this implementation.

| Event | Meaning | Key event? |
| --- | --- | --- |
| `generate_lead` | Netlify accepted a website form POST with a successful HTTP response | Yes, as an enquiry; not a qualified lead or booking |
| `whatsapp_click` | A visitor clicked the business WhatsApp link | No |
| `page_view` | Consented page visit | No |

No `purchase` or booking event is emitted. Count confirmed bookings from the booking system or a separately verified offline process. Spam filtering, ad blockers, declined consent and network interruptions mean GA4 and Netlify totals can differ. Use the form service as the operational source of received enquiries.

Register event-scoped custom dimensions for `source_page`, `landing_page`, `enquiry_origin_page`, `form_name` and `link_location` for useful reporting. Events also carry `referring_domain`, `utm_source`, `utm_medium` and `utm_campaign`. Source page is the submitted form's page; enquiry origin is the preceding page for Plan My Journey when available. Landing page is the first page in the browser-tab session, reset after 30 minutes without a page load. This is attribution context, not proof of a single page causing a conversion.

Form answers, contact details and full URL queries are never deliberately included in event payloads. Keep campaign labels free of personal information. Source fields contain page paths, a referring domain and campaign labels, not arbitrary query strings. Analytics preferences can be changed in the footer when GA4 is configured.

## Verification

Run `node --test tests/analytics.test.mjs`. These tests mock form delivery and never create a live enquiry. The production build runs `scripts/enquiry-tracking.mjs` after page generation and before cache busting. It registers a union of each named form's fields so Netlify recognizes attribution and dynamically enhanced About form fields.

After setting the real ID, check GA4 DebugView/Realtime with analytics allowed: one accepted form should produce one `generate_lead`; a rejected request and a direct/reloaded thank-you page should produce none. A WhatsApp click should produce only `whatsapp_click`. A real end-to-end form test creates an operational enquiry and should be clearly labelled and coordinated by the owner.
