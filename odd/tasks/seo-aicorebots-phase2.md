# SEO Aicorebots Phase 2

- **ID**: `seo-aicorebots-phase2`
- **Project**: `aicorebots`
- **Created**: 2026-10-01
- **Spec**: `docs/superpowers/specs/2026-09-30-seo-aicorebots-design.md` §7
- **Delivery**: work-unit commits to `main` (repo's established pattern; Dokploy auto-deploys). No PR flow in this repo, so chain strategy is not applicable.
- **TDD**: n/a — static site, no test runner. Verification is static parsers + link checks + container check after push.

## Problem

Phase 1 shipped enriched structured data, `llms.txt`, a real sitemap and legacy 301s on a single-route site. The five products exist only as anchors inside `/productos/`, so none of them can rank or be cited on their own terms. Phase 2 gives each product a real route with its own copy, canonical, schema and social image.

Side task already closed in this feature: the `duplicate MIME type "text/html"` nginx warning (commit `cc58d0c`).

## Objective

Five crawlable, citable product pages that answer the objections a skeptical clinic owner actually has, plus an updated `/productos/` hub that routes to them without breaking a single existing anchor.

## Scope

**In scope**

- `productos/aicoremed/index.html`
- `productos/captacion-360/index.html`
- `productos/portal-paciente/index.html`
- `productos/aicorelink/index.html`
- `productos/iapo/index.html`
- Five page-specific OG images in `assets/`, 1200x630, generated once with PIL and committed. **No runtime generation.**
- `productos/index.html` — `ItemList` `url` values repointed from anchors to the new routes, one intro paragraph per product linking to its page, existing anchors preserved as jump targets.
- `sitemap.xml` — the five new URLs.
- `llms.txt` / `llms-full.txt` — new routes registered so AI crawlers see them.

**Out of scope**

- Spec phases 3, 4 and 5.
- `Dockerfile` — `COPY productos/ ...` is already recursive, so the new subdirectories ship without a change.
- `nginx.conf` — already fixed and committed.
- Runtime changes of any kind.

## Constraints

- **Voice**: Chilean Spanish, `tú` form (matches `index.html:309`), short declarative sentences, no hype adjectives, no "revolutionario", no "cutting-edge", no English marketing terms. Concrete over aspirational.
- **Governing rule**: lead with the objection, not the feature. The opening section of every page is why a skeptical reader keeps going.
- **Nine required sections per page**, in order: apertura, para quién es, cómo funciona, qué incluye, qué no incluye, cuál elegir, qué define el precio, objeción principal, CTA.
- Section 5 (what it does NOT include) is mandatory and must stay honest.
- No invented prices, no invented certifications, no invented client counts.
- Nav, footer and `assets/site.css` reused **verbatim**. New markup-specific rules go in a new stylesheet, never by editing `site.css`.
- New pages load `../../assets/site.css` first, then any additional stylesheet. Never the reverse.
- Products style classes (`.feat`, `.facts2`, `.st`, `.phero`) live in `productos.css`; document rules (`.phead`, `.doc`, `.prose`) live in `site.css`. Both are loadable together.
- `Service.provider` references `#org` — the Organization node already published on the home page, reused by `@id` reference.

## Known limitation (carried from the spec, must survive to the pages)

This copy is derived from existing site content, not from direct hands-on product experience. It ranks because it is specific, not because it contains original insight. It needs a factual review pass by the owner before Phase 2 is considered done. Nothing on the pages may imply otherwise.

## Tasks

- [x] **T01** Generate the five page-specific OG images with PIL and verify dimensions.
- [x] **T02** Add the new stylesheet for product subpages.
- [x] **T03** `productos/aicoremed/index.html`
- [x] **T04** `productos/captacion-360/index.html`
- [x] **T05** `productos/portal-paciente/index.html`
- [x] **T06** `productos/aicorelink/index.html`
- [x] **T07** `productos/iapo/index.html`
- [x] **T08** `productos/index.html` - `ItemList` repointed, intros added, anchors preserved.
- [x] **T09** `sitemap.xml` - five new URLs with real `lastmod`.
- [x] **T10** `llms.txt` / `llms-full.txt` - register the new routes.
- [ ] **T11** Static verification pass.
- [ ] **T12** Commit and push.

## Acceptance criteria

1. Each of the five routes exists at `/productos/<slug>/index.html` and returns HTTP 200 in the container.
2. Each page has: a `<title>` carrying the search term, a 150-160 character product-specific `<meta description>`, an absolute canonical, an `H1` with the product name plus its category.
3. Each page carries valid JSON-LD with `Service` (promoted from the draft already on the site, `provider` → `#org`, plus `areaServed` and a `mainEntity` self-reference), `WebPage` and `BreadcrumbList`.
4. Each page's `og:image` is its own committed asset, not the shared `og.png`.
5. Each page body is 800-1200 words of original prose covering all nine sections in order.
6. Every relative asset path resolves from the page's actual depth (`../../assets/...`).
7. `/productos/` still renders identically, still has all five anchors, and now also links each product to its own route.
8. `sitemap.xml` lists the five new URLs.
9. No broken internal link anywhere in the new or edited files.
10. `nginx -t` on the deployed container emits no warnings.

## Verification evidence

`check_phase2.py` — ALL CHECKS PASSED across the five routes. Covers canonical, description length, JSON-LD shape, breadcrumb depth, prose word count, in-page anchors, foreign-character hygiene, glued words and relative-path resolution.

`llms-full.txt` structure re-verified after insertion — 13 route headings (8 original + 5 new), all 22 separators exactly 80 chars, every section `SEP / URL / SEP`, the two pre-existing inline URL references preserved, no CJK/Cyrillic, `¿` intact.

## Progress log

- 2026-10-01 — nginx warning fixed and pushed as `cc58d0c` (`fix(nginx): drop duplicate text/html from gzip_types`). Awaiting container re-verify.
- 2026-10-01 — Feature document created. Directories for the five routes created. No source written yet.
- 2026-10-01 — T01-T07 closed. Five pages written (1129-1152 prose words each, descriptions 152-158 chars) plus the shared subpage stylesheet. Page prose needed a corruption sweep: the first drafts carried CJK/Cyrillic fragments and glued words, caught by two checks added to the validator (foreign-character hygiene, glued-word pattern).
- 2026-10-01 — Title form decided: `<Name>: <benefit clause> | Aicore Agency`, no literal `Producto:` prefix, applied identically to all five.
- 2026-10-01 — T08-T10 closed in `53105a4`, `eab58af`, `6d26005`. Hub `ItemList` repointed to canonical routes, five `Ver página completa` actions added, sitemap lists all five with `lastmod` 2026-10-01, `llms.txt` already carried the five routes and needed no change, `llms-full.txt` gained all five page bodies (552 lines) and its stale "routes not published" header note was corrected.

## Next step

T11 — static verification pass, then T12 push and container re-verify.
