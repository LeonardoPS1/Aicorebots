# Aicorebots SEO & AI-Citability — Design — 2026-09-30

## 1. Context

`aicorebots.com` is a fully static, hand-crafted site (nginx + Docker, no build step, no framework) for Aicore Agency: AI agents that answer, book and follow up over WhatsApp for clinics and service businesses in Chile. Language `es-CL`.

The site shipped and is live. A prior revamp (see `2026-09-30-aicorebots-revamp-design.md`) established the visual language, the legal pages, the FAQ and the initial structured data. That spec also fixed a decision that still governs this work: **no blog section**. `/blog/` 301s to `iapo.cl`, which owns the content side of the business. That decision is not revisited here.

**Current state is better than a typical static site.** Titles, descriptions, canonicals, OG/Twitter tags, `Organization` + `WebSite` + 5×`Service` + `FAQPage` + `ItemList` JSON-LD, `robots.txt`, `sitemap.xml`, gzip, security headers and legacy 301s are all already in place. This is a preservation-first change: the existing language and design tokens survive untouched.

## 2. Goals

1. Make the five products independently indexable, so each can rank for its own query instead of all competing on one URL.
2. Make the site unambiguous and extractable for answer engines (ChatGPT, Perplexity, Gemini, Copilot).
3. Make the H1s and titles carry the terms people actually search.
4. Establish measurement, so every subsequent change is verifiable rather than guessed.
5. Raise FAQ coverage to the full set of objections that close or kill a sale.

## 3. Non-goals

- **No blog.** Owner decision, reinforced by prior spec §3. `iapo.cl` owns content.
- **No framework migration.** No Astro, 11ty, or build system. The site stays hand-written HTML.
- **No analytics scripts, no cookie banner.** Search Console is server-side and cookie-free, so measurement needs neither. Any client-side analytics remains a separate future decision.
- **No pricing page with public prices.** No public price list exists and none will be invented. The product pages state pricing *criteria*, not figures.
- **No RUT, no razón social** in structured data (prior owner decision).

## 4. Verified facts (do not re-derive; use these)

Entity data, confirmed present in `privacidad/index.html` and `aviso-legal/index.html`:

| Field | Value | Source |
| --- | --- | --- |
| Name | Aicore Agency | `privacidad/index.html:63` |
| Street | 1 Oriente 714 | `privacidad/index.html:63`, `aviso-legal/index.html:61` |
| Locality | Viña del Mar, Región de Valparaíso, Chile | same |
| Email | contacto@aicorebots.com | `privacidad/index.html:179` |
| WhatsApp / telephone | +56 9 7568 0702 (`wa.me/56975680702`) | `privacidad/index.html:180` — confirmed by owner this session |
| Site | https://aicorebots.com | `index.html:12` |
| `sameAs` | https://iapo.cl | `index.html:26` |

**The landline `+56 9 51805423` from the prior spec §5.6.2 does not appear anywhere in the current site. It is not used in this work.** The owner confirmed the mobile number as the contact of record.

## 5. Findings that drive the design

1. **`/productos/` is a single page with five in-page anchors** (`#aicoremed`, `#captacion-360`, `#portal-paciente`, `#aicorelink`, `#iapo`). The five `<h2>`s sit on one URL. This is the single largest SEO liability: it tells search engines these are *sections*, not *products*, and forces five intents to compete for one page.
2. **The three H1s are brand phrases with no search term**: "Tu negocio, con pulso propio", "Cinco herramientas, un mismo pulso", "Lo que más nos preguntan". The real term — *agentes de IA para clínicas* — appears in `<title>` and `<meta description>` but never in an H1.
3. **No measurement exists.** No Search Console, no analytics. `privacidad/index.html` §12 describes cookies, but no measurement script is present. Every prior SEO decision was unverifiable.
4. **`404.html` has a canonical pointing to an unreachable URL.** `nginx.conf:26` marks `/404.html` as `internal`, so the canonical at `404.html:11` names a URL that can never be fetched.
5. **`sitemap.xml` has six identical `lastmod` values** (all `2026-09-30`) plus `changefreq` and `priority`, which Google has ignored since 2015.
6. **FAQPage is present and correct** (8 Q&A, real prose in the HTML at `faq/index.html:71-171`), so it must be *extended*, not rebuilt. Google no longer shows FAQ rich results for non-government/health sites, but the schema remains valuable for answer engines — so it is kept, and kept **in strict sync with the visible HTML**. Schema that contradicts the page is a liability.
7. **No `llms.txt`.** The cheapest, most explicit AI-citability lever available.
8. **Performance is a non-issue.** Total site weight is roughly 150 KB: `site.css` 21.7 KB, `site.js` 9.4 KB, `productos.css` 5.6 KB, `productos.js` 1.5 KB, `og.png` 44.9 KB, no heavy libraries, no third-party embeds. The WebGL hero canvas is self-contained and `aria-hidden`. Core Web Vitals work is limited to font loading and the inline `<head>` script.

## 6. Design — Phase 1: measurement and technical foundations

Roughly half a day. Additive, low risk, and a precondition for trusting Phases 2 and 3.

### 6.1 Measurement

- Register the property in **Google Search Console** and verify via DNS TXT. Server-side, no cookies, no banner, no impact on the privacy page's accuracy.
- Baseline capture before any change: current impressions, clicks, average position, indexed-page count. This is the "before" that makes the rest of this work measurable.
- - `index.html` has no `X-Robots-Tag` anywhere and no `noindex`; `nginx.conf:11-13` sets `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options` only. Confirm the deployed build matches this repo before trusting any baseline.

### 6.2 AI-citability files (new, root)

- **`llms.txt`** — per the llmstxt.org convention: `# Aicore Agency`, a one-line summary, then an H2 section of markdown links, one per product route and FAQ, each with a one-line description.
- **`llms-full.txt`** — the full content of the five product pages and the FAQ as clean markdown, so a model can ingest the substance without parsing navigation, CSS class names or the WebGL canvas.
- Both in English-header/Spanish-content form matching the site: the file is read by machines, but the audience and the entities are Chilean. Headings in `es-CL`.

### 6.3 `robots.txt`

Keep `User-agent: * / Allow: /` and the sitemap line. Add explicit allow blocks for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot` and `Google-Extended`, so the intent to be cited is documented rather than implicit. No `Disallow` anywhere — this site wants to be read.

### 6.4 Structured data corrections and additions

Applied to `index.html` and each product page:

- **`Organization`** — add `contactPoint` (type `ContactPoint`, `telephone` `+56 9 7568 0702`, `contactType` `customer service`, `email`, `availableLanguage` `Spanish`), `email`, `telephone`, `foundingDate`, `logo` as an `ImageObject` with real pixel dimensions, and `areaServed`.
- **`LocalBusiness`** — added to the `@graph`, pointing at the same `@id` as `Organization`, carrying `address`, `geo` (Viña del Mar), `openingHours`, `telephone`, `priceRange` (`"$$"`, consistent with the B2B positioning) and `sameAs`. This is the entity type Google associates with local and service-area results.
- **`WebPage`** — per page, with `name`, `description`, `url`, `inLanguage: es-CL`, `isPartOf` → `#website`, `about` → the relevant `Service`, and `breadcrumb` → `#breadcrumb`.
- **`BreadcrumbList`** — per page. Home → Productos → current product.
- **`speakable`** (`schema:speakable` Web Speech) — on the FAQ questions and on any product H1 phrased as a question. Only where the visible text genuinely matches the spoken text.
- **`FAQPage`** — kept as-is structurally, extended in Phase 3. The `Question` `name` must stay byte-identical to the visible `<summary>` text, and `acceptedAnswer.text` must be a faithful condensation of the visible answer. No invented content.

Deliberately **not** added: `AggregateRating` and `Review`. There are no real reviews. Fabricated rating markup is a manual-action risk and is not worth any upside.

### 6.5 On-page corrections

- **H1s.** `index.html` → "Agentes de IA para clínicas y negocios que atienden por WhatsApp", with the existing brand line "Tu negocio, con pulso propio" demoted to a subtitle immediately below, `data-wave` attribute preserved so the animation still works. `productos/index.html` → "Productos de Aicore Agency: agentes de IA, gestión clínica y captación de pacientes". `faq/index.html` → "Preguntas frecuentes sobre agentes de IA y automatización" with "Lo que más nos preguntan" as the eyebrow/subtitle. This is the one intentional trade of brand voice for discoverability, and it is the point of the exercise.
- **OG completeness.** `og:site_name`, `og:locale` (`es_CL`), `twitter:site`, and `og:title`/`og:description` aligned with the new H1-led titles. Per-route `og:image` is Phase 2 work; the global `assets/og.png` stays as the fallback on all other routes.
- **`<meta name="robots">`** on every page: `content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"`.
- **`404.html`** — remove the unreachable canonical; add `<meta name="robots" content="noindex, follow">`. Add a `WebPage`-free, no-schema 404 as is correct; a 404 carries no entity meaning.

### 6.6 `sitemap.xml`

- `lastmod` set to the real last-modification date per URL, taken from git, not hand-written.
- `changefreq` and `priority` removed. They are ignored and they add noise that suggests an unmaintained file.
- URLs added in Phase 2 as the routes are created.

### 6.7 Font loading

Google Fonts CSS is render-blocking (`index.html:22`) across three families. Add `<link rel="preload" as="style">` for the primary family, and `<link rel="preconnect">` for both origins (already present at lines 20-21). Low impact at this site size, done because it is cheap. No self-hosting: at 150 KB total, the added complexity is not justified.

## 7. Design — Phase 2: five product routes

The core of the work. Three to four days.

### 7.1 Routes

```
/productos/aicoremed/
/productos/captacion-360/
/productos/portal-paciente/
/productos/aicorelink/
/productos/iapo/
```

Each is a real directory with an `index.html`, matching the existing route convention (as `/faq/`, `/privacidad/` already do). Existing anchors on `/productos/` keep working and additionally link to the new routes.

### 7.2 Per-page template

- `<title>` — `Producto: <Name> — <benefit clause> | Aicore Agency`, benefit clause carrying the search term.
- `<meta description>` — 150-160 characters, specific to the product, no boilerplate.
- Canonical — absolute `https://aicorebots.com/productos/<slug>/`.
- `H1` — the product name plus its category in search terms.
- JSON-LD — `Service` for the product (already drafted in `index.html:28-32`, promoted to its own page with `provider` → `#org`, `areaServed`, and a `mainEntity` reference to the page itself), plus `WebPage` and `BreadcrumbList`.
- `og:image` — page-specific. Generated once, committed as a static asset, exactly like the existing `og.png`. No runtime generation.
- Body — 800-1200 words of original prose.
- Nav, footer, and `assets/site.css` — reused verbatim. New pages get `../` relative asset paths, as `productos/index.html` already does.

### 7.3 Copy methodology

The copy is the deliverable that actually ranks. It is written by the assistant, from the product knowledge already present in `/productos/`, `/faq/` and the home page, extended rather than paraphrased.

Two rules govern it:

- **Lead with the objection, not the feature.** "Funciona con WhatsApp" is not a claim any buyer weighs. "Tu agenda se llena sola mientras dormís, y el paciente que no responde a los cinco minutos ya se fue a otro lado" is. The first paragraph of every page must be the reason a skeptical clinic owner keeps reading.
- **Answer the questions that kill the deal, in the order they are asked.** Not the features in the order engineers built them.

Required structure per page:

1. **Opening** — the problem in the reader's own words, and why it costs them money or patients.
2. **Who it is for** — specific profession and clinic size. Naming who it is *not* for builds more trust than any claim.
3. **How it works** — concrete steps, with the real integration names already used on the site (WhatsApp Business via Twilio, Meta Cloud API, n8n, local models, Meta Ads, Click-to-WhatsApp). Specificity is what makes a page citable by an AI.
4. **What it includes** — features, as a scannable list.
5. **What it does not include** — the honest limits. This is the highest-trust section on the page and the one most often omitted.
6. **Which one should I pick** — cross-links to the sibling product, stating plainly when the sibling is the right answer instead.
7. **Pricing criteria** — what determines the price, and what changes it. No invented figures.
8. **Main objection** — the single hardest question for that product, answered head-on. (Cost? Migration? What if the agent is wrong? Who owns the data? Staff adoption? What about shifts and after-hours?)
9. **CTA** — WhatsApp with a prefilled, product-specific message, matching the existing `wa.me` pattern.

Voice: match the existing site. Chilean Spanish, `tú` form where the site already uses it (`index.html:309` — "sin que lo decidas vos" is the site's own voice), short declarative sentences, no hype adjectives, no "revolutionary", no "cutting-edge", no English marketing terms. Concrete over aspirational.

**Known limitation, stated plainly:** this copy is derived from the existing content, not from direct product experience. It ranks because it is specific, not because it is original insight. It will need a factual review pass by the owner before Phase 2 ships. The spec will not claim otherwise.

### 7.4 `/productos/` as hub

Keeps its `ItemList` JSON-LD, with `url` values updated from anchors to the new routes. Gains a short intro paragraph per product linking to its page. The anchors remain as jump targets so nothing that already works breaks.

## 8. Design — Phase 3: FAQ and comparison

One to two days.

### 8.1 FAQ expansion: 8 → 25

Existing 8 questions stay. Add 17 covering the objections that surface late in a purchase cycle, not the ones a visitor has in the first minute. Examples of the class: what does it cost, is there a contract term, what happens to the data if I leave, can it be integrated with my current agenda or clinical record, what happens when the agent gets something wrong, do I need staff to change how they work, how is the agent trained on my business, what happens outside business hours, is there a way to take over manually, what does "operamos nosotros" actually include, how fast is the response, what happens to the conversation history, can I use my own WhatsApp number, what happens with sensitive data, who owns the conversation logs, what support do I get after launch.

Each new question is added in three places, in this order: visible `<details>` markup, then `FAQPage` JSON-LD, then (if it belongs) `llms-full.txt`. The JSON-LD `name` must be character-identical to the `<summary>` text.

### 8.2 Comparison table

`AiCoreMed` vs `Captación 360` currently exists as prose in `faq/index.html:151-157` and is implicit across `/productos/`. It becomes a real `<table>` on both product pages and on the FAQ page: dimensions, what each one does, and — critically — the "if you already have a full agenda / if you have empty hours" split that the existing copy already articulates. A comparison table is the single most extractable structure on a site, for both featured snippets and for direct answer-engine quoting.

### 8.3 Sync guarantee

Because `FAQPage` and visible text can drift, the Phase 3 task includes an explicit verification step: every `Question.name` matches its `<summary>` exactly, and every `acceptedAnswer.text` is derivable from the visible answer. This is checked before the commit, not assumed.

## 9. Files touched

New: `llms.txt`, `llms-full.txt`, `productos/{aicoremed,captacion-360,portal-paciente,aicorelink,iapo}/index.html`, per-product OG images under `assets/`.

Modified: `index.html`, `productos/index.html`, `faq/index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `Dockerfile`.

`Dockerfile:4` is already `COPY productos/ /usr/share/nginx/html/productos/`, which copies recursively — the five new subdirectories are picked up with no change. `Dockerfile:3` lists root files explicitly, so it becomes `COPY index.html 404.html robots.txt sitemap.xml llms.txt llms-full.txt /usr/share/nginx/html/`. Without that edit the new root files silently ship missing.

Unchanged by design: `assets/site.css`, `assets/site.js`, `assets/productos.css`, `assets/productos.js`, `assets/logo.svg`, `assets/favicon.svg`, `privacidad/`, `terminos/`, `aviso-legal/`, `nginx.conf`. The legal pages are already accurate and their content is not this design's business.

## 10. Delivery

Conventional commits, one per phase, no AI attribution:

- `feat(seo): add measurement, llms.txt and AI-citability schema foundations`
- `feat(productos): split into five indexable product routes with original copy`
- `feat(faq): expand FAQ to 25 objections and add comparison table`

Each commit is a self-contained, independently shippable unit. No framework migration, no bundler, no build step introduced.

## 11. Verification

**Per phase, before commit:**

- Every route returns 200 locally (`python -m http.server`), and the new directories resolve through nginx's `try_files $uri $uri/`.
- All JSON-LD blocks parse as valid JSON and validate against the referenced schema.org types. Mismatched or unresolvable `@id` references fail the check.
- `FAQPage` question text is character-identical to the visible `<summary>` (Phase 3 only).
- No client-side injection: every indexable claim is present in the raw HTML response, not added by `site.js`. The site is already fully server-rendered; this asserts it stays that way.
- `docker build` succeeds and the container serves the new routes with 200.
- `sitemap.xml` lists exactly the set of routes that exist, and every `lastmod` matches the real git date for that file.

**After deploy:**

- Search Console URL Inspection on all 11 routes (6 existing + 5 new): indexable, Google-selected canonical matches the declared one.
- Coverage report shows no soft-404, no duplicate canonical, no blocked resources.
- `curl -I` on `/404.html` returns 404; `/blog/` still 301s to `iapo.cl`.
- Base performance on mobile: no regression against the pre-change baseline.

**Measurement window:** 2-4 weeks post-deploy before any conclusion. SEO on a site this new is a lagging indicator; anything faster is noise, and no phase should be judged earlier than that.

## 12. Risks

- **Derived copy is the main risk.** Phase 2 copy is written from existing material, not product experience. Mitigation: the owner does a factual review pass before ship. This is stated in §7.3 rather than buried.
- **H1 change costs brand voice.** The three brand-phrase H1s become subtitles. Intentional, and reversible per page if the owner disagrees.
- **No public prices** is a real conversion limitation that no amount of SEO fixes. Out of scope by decision (§3), flagged as a follow-up.
- **New routes need a re-crawl window.** Deep in a small site, this is days, not months. Do not conclude a route failed before the window closes.
- **Answer-engine citation is not measurable with precision.** Search Console does not report it. The honest proxy is manual: periodically query the relevant questions in ChatGPT, Perplexity and Gemini and record whether Aicore is cited. Treated as a qualitative signal, never as a metric.
- **No client-side analytics** means no traffic-level attribution beyond Search Console. Accepted (§3).
