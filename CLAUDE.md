# Instructions for Claude

- Always use Context7 to fetch up-to-date documentation before writing code for external libraries.

## Project shape

Static React site (CRA) in `client/` — that is the whole project. There is no backend;
the Django app that used to live in `special_finishes/` was deleted because every endpoint
returned a hardcoded dict and no model or migration ever existed. Site copy lives in
`client/src/api.js`.

## Build / run

`NODE_OPTIONS=--openssl-legacy-provider` is **required** on every build and dev run
(CRA 5 webpack on Node 24), otherwise it dies on an OpenSSL hash error:

```sh
cd client && NODE_OPTIONS=--openssl-legacy-provider npm start          # dev, :3000
cd client && NODE_OPTIONS=--openssl-legacy-provider CI=true npm run build
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill                            # free the port
```

Delete `build/` after a verification build — it is gitignored but clutters the tree.

## Images

Portfolio photos live in a **public Supabase Storage bucket** (`Special`), never in git.
Reference them through `storageUrl('name.jpg')` from `client/src/storage.js`; only app
chrome (favicon, app icons) belongs in `client/public`.

**Verify an image visually before wiring it in.** A file called `bathroom3.jpg` turned out
to be the company logo on a white background and shipped to production in the portfolio
carousel because the name was trusted. Read the image, look at it, then use it.

Also check photos for people's faces and identifying details before publishing — one
driveway shot had workers' faces and a neighbour's kid's graduation banner, and had to be
pulled.

To upload: `scripts/upload-portfolio-images.mjs` (Node 18+, zero deps). The **user** runs it
with their own key — never ask for, echo, or handle a `service_role`/secret key.

## Secrets

`client/.env` is gitignored and holds `REACT_APP_SUPABASE_URL`,
`REACT_APP_SUPABASE_BUCKET`, `REACT_APP_SUPABASE_ANON_KEY`; `client/.env.example` documents
them. The anon key is safe in frontend code. The `service_role` key must never enter the
repo or the chat.

## Contact form

Submitting opens WhatsApp prefilled (`client/src/whatsapp.js`) **and** inserts a backup row
into the Supabase `contact_submissions` table. Two constraints:

- Open the WhatsApp window **synchronously** in the submit handler. After an `await` the
  user-gesture context is gone and the popup gets blocked.
- The table has insert-only RLS: the anon key can write leads but never read them back.
  Do not expect to query submissions from the client, and don't leave test rows behind —
  the anon key cannot delete them, so cleanup falls on the user.

## Accessibility invariants — do not regress

Already in place, keep them working when restyling: `<main>` + skip link in `App.js`;
`:focus-visible` and a `prefers-reduced-motion` block in `index.css`; `role="dialog"`,
focus trap and focus-return in `Lightbox.js`; gallery triggers are real `<button>`s (a
`<div onClick>` is not keyboard reachable); hamburger nav below 640px.

Check contrast numerically rather than by eye — white on the `#e95517` accent is only
3.64:1 and fails AA for small text, so filled accent buttons use dark text instead.
