# Graph Report - Project-Special  (2026-10-10)

## Corpus Check
- Corpus is ~9,459 words - fits in a single context window. You may not need a graph.

## Summary
- 107 nodes · 170 edges · 10 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Client Package Config
- Contact Form & Icons
- API Client & App Shell
- Hero, Gallery & Testimonials
- Client Dependencies
- PWA Manifest
- React Entry & Web Vitals
- Portfolio Image Uploader
- NPM Scripts
- Root Package (Supabase)

## God Nodes (most connected - your core abstractions)
1. `react` - 13 edges
2. `App()` - 11 edges
3. `storageUrl()` - 9 edges
4. `OurWork()` - 6 edges
5. `scripts` - 5 edges
6. `MeetOwner()` - 5 edges
7. `About()` - 4 edges
8. `Hero()` - 4 edges
9. `WhatsAppIcon()` - 4 edges
10. `WhatsAppButton()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `Hero()`  [EXTRACTED]
  client/src/App.js → client/src/components/Hero.js
- `App()` --calls--> `OurWork()`  [EXTRACTED]
  client/src/App.js → client/src/components/OurWork.js
- `App()` --calls--> `WhatsAppButton()`  [EXTRACTED]
  client/src/App.js → client/src/components/WhatsAppButton.js
- `MeetOwner()` --calls--> `storageUrl()`  [EXTRACTED]
  client/src/components/MeetOwner.js → client/src/storage.js
- `galleryImages` --calls--> `storageUrl()`  [EXTRACTED]
  client/src/components/OurWork.js → client/src/storage.js

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "Client Package Config"
Cohesion: 0.10
Nodes (18): browserslist, development, production, devDependencies, wrangler, eslintConfig, extends, homepage (+10 more)

### Community 1 - "Contact Form & Icons"
Cohesion: 0.15
Nodes (12): ICONS, initialForm, MailIcon(), SmsIcon(), stroke, WhatsAppIcon(), WhatsAppButton(), SUPABASE_ANON_KEY (+4 more)

### Community 2 - "API Client & App Shell"
Cohesion: 0.24
Nodes (10): fetchAboutCompany(), fetchMeetOwner(), staticData, App(), About(), ContactUs(), Footer(), Header() (+2 more)

### Community 3 - "Hero, Gallery & Testimonials"
Cohesion: 0.31
Nodes (8): fetchTestimonials(), Hero(), Lightbox(), galleryImages, OurWork(), pairImages, pairs, storageUrl()

### Community 4 - "Client Dependencies"
Cohesion: 0.25
Nodes (8): dependencies, react, react-dom, react-scripts, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, web-vitals

### Community 5 - "PWA Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 6 - "React Entry & Web Vitals"
Cohesion: 0.33
Nodes (4): root, reportWebVitals(), react-dom, web-vitals

### Community 7 - "Portfolio Image Uploader"
Cohesion: 0.40
Nodes (3): contentType(), FILES, upload()

### Community 8 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, eject, start, test

### Community 9 - "Root Package (Supabase)"
Cohesion: 0.50
Nodes (3): dependencies, supabase, supabase

## Knowledge Gaps
- **7 isolated node(s):** `@testing-library/user-event`, `react-scripts`, `react-app`, `react-app/jest`, `wrangler` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 47 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `API Client & App Shell` to `Client Package Config`, `Contact Form & Icons`, `Hero, Gallery & Testimonials`, `React Entry & Web Vitals`?**
  _High betweenness centrality (0.345) - this node is a cross-community bridge._
- **What connects `@testing-library/user-event`, `react-scripts`, `react-app` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Client Dependencies` to `Client Package Config`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `scripts` connect `NPM Scripts` to `Client Package Config`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._