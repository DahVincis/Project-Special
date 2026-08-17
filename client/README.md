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
│   ├── OurWork         # Interior/exterior grid, before/after, portfolio gallery, testimonials
│   ├── MeetOwner       # Founder bio (Ruiter Fernandes)
│   └── ContactUs       # Contact form
├── api.js              # Static data — no backend required
└── App.js
```
