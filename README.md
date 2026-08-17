# Special Finishes

Showcase website for Special Finishes HI, a specialty interior and exterior finishing company founded by Ruiter Fernandes.

## Project Structure

```text
Project-Special/
└── client/               # React frontend (CRA) — the entire project
    ├── public/            # Static assets (images, favicon)
    └── src/
        ├── components/    # Header, ParallaxSection, About, OurWork, MeetOwner, ContactUs
        ├── api.js         # Static content (no backend)
        └── App.js
```

There is no backend. The Django project that used to live at `special_finishes/` was
removed — it had no models, no database usage, and every endpoint returned a hardcoded
dict. All site content now lives directly in `client/src/api.js`.

## Tech Stack

React 18, React Slick, React Parallax, React Intersection Observer. Pure static site —
deployable to any static host (S3, Netlify, Vercel, etc.).

## Running Locally

```sh
cd client
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Building for Production

```sh
cd client
npm run build
```

The `build/` folder is self-contained and can be served from any static host.

> **Note:** `NODE_OPTIONS=--openssl-legacy-provider` is required on Node 17+ due to the
> CRA 4/5 webpack version.

## Images

Portfolio photos are hosted in a public Supabase Storage bucket, not committed to git.
`client/src/storage.js` builds the public CDN URL from `REACT_APP_SUPABASE_URL` and
`REACT_APP_SUPABASE_BUCKET` (see `client/.env.example`). To add or replace a photo:
compress it (see `scripts/upload-portfolio-images.mjs` for the pattern), upload it via
the Supabase dashboard's Storage UI or the script, and reference it with
`storageUrl('filename.jpg')` in the component.

## Author

Developed by [Ouroboros Studios](https://github.com/DahVincis) — Pedro Fernandes & Kelvyn Luciano.
