# Graph Report - Project-Special  (2026-10-10)

## Corpus Check
- 30 files · ~11,204 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .css 13, (none) 3, .ico 2)

## Summary
- 147 nodes · 225 edges · 13 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c219c0ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- client/package.json
- ContactUs.js
- App.js
- OurWork.js
- dependencies
- manifest.json
- index.js
- upload-portfolio-images.mjs
- Instructions for Claude
- package.json
- Reviews.js
- Special Finishes
- Special Finishes — React Frontend

## God Nodes (most connected - your core abstractions)
1. `react` - 15 edges
2. `App()` - 13 edges
3. `Instructions for Claude` - 11 edges
4. `storageUrl()` - 9 edges
5. `Special Finishes` - 8 edges
6. `Reviews()` - 7 edges
7. `scripts` - 5 edges
8. `MeetOwner()` - 5 edges
9. `OurWork()` - 5 edges
10. `About()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `OurWork()`  [EXTRACTED]
  client/src/App.js → client/src/components/OurWork.js
- `App()` --calls--> `Reviews()`  [EXTRACTED]
  client/src/App.js → client/src/components/Reviews.js
- `App()` --calls--> `WhatsAppButton()`  [EXTRACTED]
  client/src/App.js → client/src/components/WhatsAppButton.js
- `Hero()` --calls--> `storageUrl()`  [EXTRACTED]
  client/src/components/Hero.js → client/src/storage.js
- `MeetOwner()` --calls--> `storageUrl()`  [EXTRACTED]
  client/src/components/MeetOwner.js → client/src/storage.js

## Import Cycles
- None detected.

## Communities (13 total, 0 thin omitted)

### Community 0 - "client/package.json"
Cohesion: 0.08
Nodes (22): browserslist, development, production, devDependencies, wrangler, eslintConfig, extends, homepage (+14 more)

### Community 1 - "ContactUs.js"
Cohesion: 0.15
Nodes (12): ICONS, initialForm, MailIcon(), SmsIcon(), stroke, WhatsAppIcon(), WhatsAppButton(), SUPABASE_ANON_KEY (+4 more)

### Community 2 - "App.js"
Cohesion: 0.17
Nodes (14): fetchAboutCompany(), fetchMeetOwner(), services, staticData, App(), About(), ContactUs(), Footer() (+6 more)

### Community 3 - "OurWork.js"
Cohesion: 0.43
Nodes (6): Lightbox(), galleryImages, OurWork(), pairImages, pairs, storageUrl()

### Community 4 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, react, react-dom, react-scripts, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, web-vitals

### Community 5 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 6 - "index.js"
Cohesion: 0.33
Nodes (4): root, reportWebVitals(), react-dom, web-vitals

### Community 7 - "upload-portfolio-images.mjs"
Cohesion: 0.40
Nodes (3): contentType(), FILES, upload()

### Community 8 - "Instructions for Claude"
Cohesion: 0.17
Nodes (11): Accessibility invariants — do not regress, Analytics, Build / run, Contact form, Deploy, Google reviews, Images, Instructions for Claude (+3 more)

### Community 9 - "package.json"
Cohesion: 0.50
Nodes (3): dependencies, supabase, supabase

### Community 10 - "Reviews.js"
Cohesion: 0.32
Nodes (9): ReviewCard(), Reviews(), Stars(), long, GOOGLE_MAPS_KEY, loadReviews(), MAPS_FALLBACK_URL, PLACE_ID (+1 more)

### Community 11 - "Special Finishes"
Cohesion: 0.22
Nodes (8): Analytics, Contact form, Deploy, Develop, Notes for contributors, Photographs, Project structure, Special Finishes

### Community 12 - "Special Finishes — React Frontend"
Cohesion: 0.50
Nodes (3): Scripts, Special Finishes — React Frontend, Structure

## Knowledge Gaps
- **7 isolated node(s):** `@testing-library/user-event`, `react-scripts`, `react-app`, `react-app/jest`, `wrangler` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 73 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.js` to `client/package.json`, `ContactUs.js`, `OurWork.js`, `index.js`, `Reviews.js`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **What connects `@testing-library/user-event`, `react-scripts`, `react-app` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `client/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `client/package.json`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._