# Special Finishes

Website for Special Finishes HI, a specialty interior and exterior finishing company in
Connecticut, founded by Ruiter Fernandes.

**Live:** [specialfinisheshi.com](https://specialfinisheshi.com)

## Project structure

```text
Project-Special/
├── client/                    # React frontend (CRA) — the entire project
│   ├── public/                # index.html, favicon, PWA icons. No photographs.
│   ├── src/
│   │   ├── components/        # Header, Hero, About, OurWork, MeetOwner,
│   │   │                      #   ContactUs, Footer, Lightbox, WhatsAppButton, Icons
│   │   ├── api.js             # Site copy (no backend)
│   │   ├── storage.js         # Supabase config + storageUrl() helper
│   │   └── whatsapp.js        # Contact channel definitions
│   └── wrangler.jsonc         # Cloudflare Workers deploy config
└── scripts/
    └── upload-portfolio-images.mjs
```

There is no backend. The Django project that used to live at `special_finishes/` was
removed — it had no models, no database usage, and every endpoint returned a hardcoded
dict.

## Develop

```sh
cd client
npm install
npm start                    # dev server on :3000
CI=true npm run build        # production build -> client/build
```

`NODE_OPTIONS=--openssl-legacy-provider` is baked into both npm scripts; CRA 5's webpack
fails on an OpenSSL hash error without it on Node 17+. Don't pass it manually and don't
strip it.

## Photographs

Portfolio images live in a **public Supabase Storage bucket**, never in this repo.
Reference them with `storageUrl('name.jpg')` from `client/src/storage.js`.

To add images, either drag them into the bucket from the Supabase dashboard, or:

```sh
SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-portfolio-images.mjs path/to/*.jpg
```

Two rules learned the hard way, both in `CLAUDE.md`: **look at an image before wiring it
in** (a file named `bathroom3.jpg` turned out to be the company logo and shipped to
production), and **check for faces and identifying details** before publishing.

## Deploy

Cloudflare Workers static assets, built and deployed automatically from `main` — roughly
80 seconds from push to live. `client/wrangler.jsonc` is the source of truth. No
environment variables need to be configured anywhere; see `CLAUDE.md` for why.

## Contact form

Three channels — email, WhatsApp, SMS — each opening the visitor's own app with a
prefilled message. Every submission also writes a backup row to the Supabase
`contact_submissions` table, which has insert-only RLS.

## Analytics

Google Analytics 4, with a weekly visitor report scheduled out of Looker Studio to the
company address.

## Notes for contributors

`CLAUDE.md` holds the working conventions — build quirks, deploy configuration,
accessibility invariants that must not regress, and a record of which approaches were
tried and rejected, with reasons. Read it before changing build or deploy setup.
