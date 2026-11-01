# Special Finishes — React Frontend

React frontend for the Special Finishes HI showcase website. Built with Create React App.

## Scripts

```sh
npm start        # dev server at localhost:3000
npm run build    # production build → build/
```

> On Node 17+, prefix with `NODE_OPTIONS=--openssl-legacy-provider` due to CRA 4/webpack 4 crypto compatibility.

## Structure

```text
src/
├── components/
│   ├── Header          # Glass navbar with anchor nav
│   ├── ParallaxSection # Full-height hero with text overlay
│   ├── About           # Company intro + stats
│   ├── Services        # Services list
│   ├── OurWork         # Interior/exterior grid, before/after, portfolio gallery
│   ├── Reviews         # Google reviews, loaded on demand
│   ├── MeetOwner       # Founder bio (Ruiter Fernandes)
│   └── ContactUs       # Contact form
├── api.js              # Static data — no backend required
├── googleReviews.js    # Fetches GET /api/reviews for the Reviews section
└── App.js
```

## Weekly report

The Worker sends a branded analytics email at 8:00 AM America/New_York every Monday.
Cloudflare cron triggers are UTC, and Eastern is UTC−5 in winter and UTC−4 in summer,
so `wrangler.jsonc` registers both `0 12 * * 1` and `0 13 * * 1`. `scheduled()` sends
only when the current Eastern hour is 8, and the other firing does nothing. The date
range is the seven full Eastern days ending yesterday.

Preview a made-up layout, or a live report, from this directory:

```sh
node scripts/send-report.mjs --example --dry-run --out report.html
node scripts/send-report.mjs --sa /path/sa.json --dry-run --out report.html
node scripts/send-report.mjs --sa /path/sa.json --resend-key-file /path/key.txt --to a@b.com
```

`--dry-run` writes the HTML and does not call Resend. `--example` refuses to send.
Each real run of the script uses a new Resend idempotency key, so a second test
send is delivered. The Monday cron keeps one key per week and recipient list,
so the two UTC triggers cannot send the report twice.

Recipients come from the `REPORT_TO` var (comma-separated):
`specialfinisheshi@gmail.com` and `ruiterfernandes77@gmail.com`. A one-off test
send uses `--to` on the script instead of that var. The mail is from
`Special Finishes Reports <reports@specialfinisheshi.com>` with reply-to
`specialfinisheshi@gmail.com`, sent through the Resend API.

Two Worker secrets are read at runtime and are **not** listed in `secrets.required`:

- `GA4_SA_KEY` — the raw JSON of a Google service account with Viewer access on GA4 property `551164486`. The Worker signs an RS256 JWT and exchanges it for an `analytics.readonly` token. Confirm the property timezone is America/New_York; the API applies these calendar dates in the property's own timezone.
- `RESEND_API_KEY` — a Resend API key that can send from `specialfinisheshi.com`.

`secrets.required` makes `wrangler deploy` refuse to publish while a listed secret is unset, which would leave the previous production version in place. Add the secrets with `npx wrangler secret put` before relying on the email. Until then the cron logs the missing names and returns; `GET /api/reviews` is unchanged.

The page records four events when visitors tap a real link or submit the quote form: `click_to_call` (tel:), `whatsapp_click` (wa.me, including the floating button and the form's WhatsApp button), `email_click` (mailto:), and `generate_lead` (the quote form). Each event includes `link_location` (header, footer, hero, contact, and so on). The "Customer actions" section lists those four, with the week before, once any of them has been recorded in the property. A zero this week still shows. If last week was all zeros, the email says tracking just started.

Resend sending needs the domain verified (SPF and DKIM). Add those records beside the existing mail records. Do not replace the MX records; the company mailbox is not hosted at Resend.
