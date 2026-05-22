# Special Finishes

A full-stack showcase website for Special Finishes HI, a specialty interior and exterior finishing company founded by Ruiter Fernandes.

## Project Structure

```text
Project-Special/
├── client/               # React frontend (CRA)
│   ├── public/           # Static assets (images, favicon)
│   └── src/
│       ├── components/   # Header, ParallaxSection, About, OurWork,
│       │                 # MeetOwner, ContactUs
│       ├── api.js        # Static data (no backend required for demo)
│       └── App.js
└── special_finishes/     # Django backend (legacy, not required for demo)
    ├── api/              # REST endpoints
    └── special_finishes/ # Django settings
```

## Tech Stack

- **Frontend**: React 18, React Slick, React Parallax, React Intersection Observer
- **Backend**: Django (legacy — frontend now uses static data for demo mode)

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

The `build/` folder is self-contained and can be served from any static host or dropped into a parent project's `public/demos/` directory.

> **Note:** `NODE_OPTIONS=--openssl-legacy-provider` is required on Node 17+ due to the CRA 4/5 webpack version.

## Author

Developed by [Ouroboros Studios](https://github.com/DahVincis) — Pedro Fernandes & Kelvyn Luciano.
