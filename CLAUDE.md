# Instructions for Claude

- Always use Context7 to fetch up-to-date documentation before writing code for external libraries.

## Project shape

Static React site (CRA) in `client/` — that is the whole project. There is no backend;
the Django app that used to live in `special_finishes/` was deleted because every endpoint
returned a hardcoded dict and no model or migration ever existed. Site copy lives in
`client/src/api.js`, except section headings and the case-study text, which are inline in
their components alongside the markup they title.

Page order is Hero, About, Services, OurWork (selected work + case study), Reviews (live
from Google Places, see `googleReviews.js`), MeetOwner, ContactUs. Sections carry
`data-num` for the ghosted numeral; keep them sequential when adding or reordering.

Deleted and not coming back: `react-slick`, `slick-carousel`, `react-scroll`,
`react-parallax`, `react-intersection-observer`. The editorial rebuild made all five
unused and cut the bundle by a third. Do not reintroduce a carousel library for a gallery
that CSS grid already handles.

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

Supabase needs nothing in the dashboard. `client/src/storage.js` hardcodes the
Supabase URL, bucket and anon key as defaults, with `REACT_APP_SUPABASE_*` still
overriding them if set. That is deliberate: those values ship inside the public bundle
regardless, so the env vars protected nothing while silently shipping a site with every
image 404ing whenever a build variable was forgotten — which happened on two
consecutive deploys. Do not "restore" them to required build variables.

The Google reviews key is the exception, and it is not a build variable. It is the
Worker secret `GOOGLE_MAPS_KEY`, read at runtime by `client/worker/index.mjs`.
`secrets.required` in `wrangler.jsonc` makes `wrangler deploy` refuse to publish
while that secret is unset, which leaves the previous production version in place.
Set the secret before merging a change that introduces it. See Google reviews.

`wrangler` is a pinned devDependency so a wrangler major bump cannot break a production
deploy on its own.

Domain: `specialfinisheshi.com`, registered at Hostinger (paid to 2028), served through
Cloudflare.

## Google reviews

`client/src/googleReviews.js` fetches `GET /api/reviews` when the Reviews section nears
the viewport. The Worker in `client/worker/index.mjs` calls Place Details (New) with the
secret `GOOGLE_MAPS_KEY` and returns only rating, rating count, the maps link, and up to
five reviews (text, stars, author, author URL, relative time). Place ID
`ChIJk0gR5uMP6IkRsc_qKOkMSEk`, verified on 2026-10-10 (Maps URL and the API's `displayName`
on the live site) to resolve to "Special Finishes Home Improvement". Review text renders
as returned, with the "Google Maps" text attribution. `App.test.js` mocks `loadReviews()`,
so tests do not call the endpoint.

The key must not ship in the bundle. Do not put it back in client source, and do not add
`REACT_APP_GOOGLE_MAPS_KEY`: CRA inlines that into the public JavaScript. The Cloudflare
build-variable form is the wrong place too (it also refused to save a key once). The
Worker reads `env.GOOGLE_MAPS_KEY`. If the request fails for any reason the section shows
only its heading and the two Google links.

Workers Caching is on. A successful response is `Cache-Control: public, max-age=3600,
s-maxage=21600` (browser one hour, edge six hours), so scrolling to the section is not a
Place Details call for every visitor. The route rejects query strings and any method other
than GET or HEAD, and the place id is fixed in the Worker.

In Google Cloud the key has to be a server key:

- Restrict it to **Places API (New)** only. The Maps JavaScript API is no longer used.
- Application restriction: **None**. An HTTP-referrer restriction rejects the Worker,
  which does not send a browser referrer. Workers egress IPs are not stable, so an IP
  restriction does not fit this deploy.
- Keep a low daily quota cap on Places requests. The edge cache should make that a
  handful of calls a day rather than one per visitor.

Locally, `npm start` proxies `/api/reviews` to `127.0.0.1:8787`. From `client/`, build
once so `./build` exists, copy `.dev.vars.example` to `.dev.vars`, then `npx wrangler dev`.
Without the Worker running, the section falls back to the two links. `.dev.vars` is
gitignored.

## Analytics

Google Analytics 4 (`G-GWN3YMGKKH`), tag inline in `client/public/index.html`. A weekly
visitor report is scheduled out of Looker Studio to the company address.

Cloudflare Web Analytics was tried first and rejected: it is cookieless and needs no
consent banner, but its only location dimension is **country**, and city-level was the
requirement. A Cloudflare-native digest Worker was written and then dropped — Email
Sending is a paid feature, and the free alternative (Email Routing) seizes the root MX
records, which would break the client's UENI mail. Do not revisit that path without
solving both.

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

Three channels — email (default, filled accent), WhatsApp, SMS — defined in
`client/src/whatsapp.js` as `CHANNELS`. Every one builds the same prefilled message and
every submit also inserts a backup row into the Supabase `contact_submissions` table, so
the lead survives whichever the visitor picks. Constraints:

- Open the channel **synchronously** in the submit handler. After an `await` the
  user-gesture context is gone and the popup gets blocked.
- WhatsApp opens in a new tab; `mailto:` and `sms:` navigate in place, because a new tab
  for those is left blank once the native app takes over.
- Every button is `type="submit"` so the browser's required-field validation runs for all
  three; `e.nativeEvent.submitter.value` says which one was used.
- The table has insert-only RLS: the anon key can write leads but never read them back.
  Do not expect to query submissions from the client, and don't leave test rows behind —
  the anon key cannot delete them, so cleanup falls on the user.

## Repo hygiene

The GitHub repo is **public**. Photographs never belong in git — partly for size, mostly
because history is permanent and public: `client/public/driveway.jpg` was pulled for
showing workers' faces and a neighbour's kid's graduation banner, and it is still
retrievable from history. Git history keeps its own copy of every mistake.

## Accessibility invariants — do not regress

Already in place, keep them working when restyling: `<main>` + skip link in `App.js`;
`:focus-visible` and a `prefers-reduced-motion` block in `index.css`; `role="dialog"`,
focus trap and focus-return in `Lightbox.js`; gallery triggers are real `<button>`s (a
`<div onClick>` is not keyboard reachable); hamburger nav at 1240px and below (six links do not fit beside the phone and CTA under that).

Check contrast numerically rather than by eye — white on the `#e95517` accent is only
3.64:1 and fails AA for small text, so filled accent buttons use dark text instead.
