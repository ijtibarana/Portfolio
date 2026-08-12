# Ijtiba Rana — Premium 3D Portfolio

Static, dependency-free portfolio site. No build step: upload the folder to any host
(Netlify, Vercel, cPanel, GitHub Pages) and it runs.

---

## ⚠️ First thing to do: add your photo

The hero, About section and OG image all read **one file**:

```
assets/img/ijtiba-rana.jpg
```

Right now that file is a **clearly-marked placeholder** (it literally says "ADD YOUR PHOTO HERE").
No fictional person was generated for it.

1. Replace it with your real photo, same filename.
   Best results: portrait orientation, roughly **824 × 1030**, face in the upper third.
2. Regenerate the social-share image so it uses your real photo:

```bash
python3 tools/make_og.py
```

That's it — hero, About card and `og-image.png` all update.

---

## Project structure

```
index.html                  the whole site (semantic HTML + JSON-LD)
robots.txt                  crawlable, points at the sitemap
sitemap.xml                 all sections listed
.htaccess                   gzip, 1-year asset caching, HTTPS redirect
assets/
  css/style.css             design system + all components
  js/main.js                tilt, parallax, particles, live embeds, reveals
  img/ijtiba-rana.jpg       ← YOUR PHOTO GOES HERE
  img/og-image.png          1200×630 social card (generated)
  img/favicon.svg
  projects/*.webp           real screenshots, 3 sizes each (responsive srcset)
tools/
  make_og.py                rebuild the OG image from the portrait
  shots.py / shots2.py      re-capture project screenshots
```

---

## How the project previews work (important)

The brief said: never fake a website mock-up. Here's exactly what's on the page.

**Five projects show a real screenshot**, captured by loading the actual live site in a real
Chromium browser at 1440×900 — Growintek, Study in AUS, MDKAT, Pak Exporters, Zamanalytics.
Each is badged **PREVIEW** while showing the image.

**Two projects show no image at all** — Daroodi and Kishaa International. Their servers block
automated capture (Daroodi returns HTTP 403 to datacenter IPs; Kishaa serves an anti-bot
challenge and rate-limits assets). Rather than invent a mock-up, those frames carry an honest
note explaining the block and a button to load the real thing. They render fine in a normal
visitor's browser.

**Every project can embed the genuine live website.** Hover any frame → **Load live site**
injects a real `<iframe>` of the actual URL, scaled so the desktop layout fits the frame.
Verified working: all seven sites send no `X-Frame-Options` and no CSP `frame-ancestors`,
so nothing is bypassed. The badge only flips **PREVIEW → LIVE** after the iframe's `load`
event actually fires; if a site refuses, it falls back to the screenshot and says so.

Iframes are never loaded on page load — only on click. That keeps the page at ~107 KB.

---

## Performance

Measured locally on the finished page:

| Metric | Result |
|---|---|
| Initial transfer | ~107 KB |
| DOMContentLoaded | ~183 ms |
| Requests on load | 4 |
| Horizontal overflow | 0 px at 360/390/768/1024/1440/1920 |
| Console errors | none |

How it stays fast: screenshots are WebP at three widths behind `srcset`, everything below the
fold is `loading="lazy"`, the particle canvas is capped at 30 fps and pauses on tab-hide,
tilt/parallax run through `requestAnimationFrame` and are disabled on touch devices,
CSS/JS are plain files with no framework.

---

## Accessibility

- Skip-to-content link is the first tab stop
- 15 landmarks, every section labelled via `aria-labelledby`
- All 7 images have descriptive alt text; no unnamed buttons
- Every `target="_blank"` carries `rel="noopener noreferrer"`
- Visible `:focus-visible` rings throughout
- `prefers-reduced-motion` verified: animations off, particle canvas `display:none`,
  all revealed content stays visible

---

## SEO

Title, meta description, canonical, Open Graph, Twitter card, robots.txt and sitemap.xml
are all in place. Structured data is a single validated `@graph` with **Person**, **WebSite**,
**ProfessionalService** (11-service offer catalog), **BreadcrumbList** and **ItemList**
(the 7 projects). One `<h1>`, clean H2/H3 hierarchy, internal links to every section.

### Before you go live

Search and replace the placeholder domain — it appears in the canonical tag, OG/Twitter URLs,
JSON-LD and sitemap:

```bash
grep -rl 'ijtibarana.com' . --include='*.html' --include='*.xml' --include='*.txt' \
  | xargs sed -i 's|ijtibarana.com|YOURDOMAIN.com|g'
```

Then submit `sitemap.xml` in Google Search Console.

---

## Content honesty

Per the brief, the site contains **no invented** testimonials, statistics, client names,
awards, degrees or certifications. The SEO dashboard bars are explicitly labelled
"self-assessed strengths" with a note stating they are not rankings, traffic or client
results. The AI chat console is labelled **Demo** and marked `aria-hidden` with a
screen-reader note describing it as illustrative. Hero figures state only verifiable
counts (7 projects shown, 11 service areas).

All contact details and social links are exactly as supplied.

## Local preview

```bash
python3 -m http.server 8080
# http://localhost:8080
```
