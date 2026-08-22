# Instructions for Claude

- Always use Context7 to fetch up-to-date documentation before writing code for external libraries.

## Project shape

Static React site (CRA) in `client/` — that is the whole project. There is no backend;
the Django app that used to live in `special_finishes/` was deleted because every endpoint
returned a hardcoded dict and no model or migration ever existed. Site copy lives in
`client/src/api.js`.

## Build / run

```sh
cd client && npm start                    # dev, :3000
cd client && CI=true npm run build        # production build -> client/build
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill                            # free the port
```

`NODE_OPTIONS=--openssl-legacy-provider` is baked into both npm scripts (CRA 5 webpack
dies on an OpenSSL hash error without it on Node 17+). Do not strip it from
`client/package.json`, and do not pass it manually — it is already there.

Delete `build/` after a verification build — it is gitignored but clutters the tree.

## Deploy

**Cloudflare Workers Static Assets** (not Pages — Cloudflare steers new projects to
Workers now, and the dashboard's Pages flow is on its way out). Git integration on
`main` via Workers Builds.

`client/wrangler.jsonc` is the source of truth for the Worker name and the asset
directory. Workers Builds settings that must match it:

| Field | Value |
|---|---|
| Root directory | `client/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |

Workers Builds runs **two** commands — build, then deploy. Pages ran only one. Putting
`npm run build` in the deploy field (an easy mistake, the fields are adjacent) builds
twice and never deploys.

Nothing needs configuring in the dashboard. `client/src/storage.js` hardcodes the
Supabase URL, bucket and anon key as defaults, with `REACT_APP_SUPABASE_*` still
overriding them if set. That is deliberate: those values ship inside the public bundle
regardless, so the env vars protected nothing while silently shipping a site with every
image 404ing whenever a build variable was forgotten — which happened on two
consecutive deploys. Do not "restore" them to required env vars.

`wrangler` is a pinned devDependency so a wrangler major bump cannot break a production
deploy on its own.

Domain: `specialfinisheshi.com`, registered at Hostinger (paid to 2028), served through
Cloudflare.

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

`client/src/storage.js` is the single source of truth for the Supabase URL, bucket and
anon key, and exports all three. `client/.env` still works as a local override but is no
longer required for a working build. The anon key is safe in frontend code and in the
repo — it ships in the bundle either way, and `contact_submissions` is insert-only RLS.

The `service_role` (or newer `sb_secret_…`) key is the real secret and must never enter
the repo or the chat. Uploading portfolio images does not need it at all — the Supabase
dashboard's Storage UI takes a drag-and-drop.

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
