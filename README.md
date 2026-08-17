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

Portfolio photos currently live in `client/public/` as compressed JPEGs. This works but
means new/updated photos still get committed to git. Once a Supabase project exists,
migrate these to Supabase Storage (S3-compatible + CDN) and reference the Storage CDN
URLs from the components instead — see `client/src/components/OurWork.js` and
`MeetOwner.js` for the current image references.

## Author

Developed by [Ouroboros Studios](https://github.com/DahVincis) — Pedro Fernandes & Kelvyn Luciano.
