# Aicorebots Revamp Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Implement tasks in order; each task ends with a verifiable check.

**Goal:** Restore aicorebots.com to production with the approved redesign: real brand, real contact data, two new landing sections, legal/FAQ/404 pages, hardened SEO and nginx, deployed via GitHub + Dokploy.

**Architecture:** Purely static site (HTML/CSS/JS, no build). nginx:1.27-alpine serves it. Changes are additive to the existing hand-crafted files listed in each task; the visual design is preserved.

**Tech Stack:** Plain HTML5/CSS3/JS, SVG, nginx, Docker, Dokploy (Docker Swarm + Traefik file provider), GitHub (git credential manager, no gh CLI).

## Global Constraints

- Preserve the design tokens and layout classes from `assets/site.css` (--navy/--abyss/--teal family, Bricolage Grotesque/Instrument Sans/JetBrains Mono, `.wrap`, `.sheet`, `.btn.p/.btn.g`, details.row accordions). Do NOT restyle existing sections.
- All copy in Spanish (CL), neutral-professional register. Code/docs/commits in English.
- Real contact data ONLY: WhatsApp `+56 9 75680702` → `https://wa.me/56975680702` (keep existing `?text=` params), email `contacto@aicorebots.com`. Never emit `56900000000` or `hola@aicorebots.com`.
- Legal identity: Aicore Agency, 1 Oriente 714, Viña del Mar, Chile; `contacto@aicorebots.com`; `+56 9 51805423`; NO RUT, NO razón social.
- No blog section on aicorebots; `/blog/*` → 301 to `https://iapo.cl`.
- No analytics, no cookie banner.
- Every committed file must be valid: JSON-LD parses, links resolve relative (from `/productos/` use `../`), no dead refs.
- Conventional commits only. No AI attribution in commits.

---

### Task 1: Brand assets (logo.svg, favicon.svg, og.png)

**Files:**
- Create: `assets/logo.svg` (downloaded + recolored wordmark)
- Overwrite: `assets/favicon.svg` (ECG glyph crop)
- Create: `assets/og.png` (1200×630 Open Graph image)

- [ ] **Step 1: Download `https://aicorebots.com/wp-content/uploads/2025/09/LOGO-5.svg` → `assets/logo.svg`** (PowerShell `Invoke-WebRequest`).
- [ ] **Step 2: Recolor wordmark**: replace dark fills `#003886` and `#044A8A` with `#21C2E8` (mid gradient tone) so it contrasts on `--navy #0A2342`; keep `#009DFD`, `#2EC3E3`→`#54F8FF` gradients and letter fill `#FDFCFD`. Result must stay valid SVG.
- [ ] **Step 3: favicon.svg** = standalone SVG 64×64: navy rounded rect `#0A2342` + white/teal ECG polyline glyph cropped from the wordmark's left third (recolor glyph to the light blue family).
- [ ] **Step 4: og.png 1200×630**: render once with Edge headless (`msedge --headless --screenshot`) against a small branded HTML file (navy bg, wordmark logo, "Tu negocio, con pulso propio.") or with a Python PIL draw; commit the PNG.
- [ ] **Step 5: Verify**: `assets/logo.svg` parses as XML; favicon renders; og.png is 1200×630.

### Task 2: index.html — brand, data, sections, SEO, footer

**Files:**
- Modify: `index.html` (multiple lines: 15-16 favicon dup, 21-23 JSON-LD, 31-34 brand, 274-275 CTA, 286-298 footer)

- [ ] **Step 1: Replace `.brand` markup** (lines ~31-34): drop inline SVG + `<span>Ai core</span>`; use `<img src="assets/logo.svg" alt="Aicore Agency" class="brand-img">`.
- [ ] **Step 2: Fix data** — `https://wa.me/56900000000` → `https://wa.me/56975680702` (CTA + footer); `mailto:hola@aicorebots.com` → `mailto:contacto@aicorebots.com` (CTA + footer).
- [ ] **Step 3: Remove duplicate favicon data-URI link** (line 16); keep single `assets/favicon.svg`.
- [ ] **Step 4: Add og:image/twitter:image metas** (`https://aicorebots.com/assets/og.png`, width 1200, height 630).
- [ ] **Step 5: Extend JSON-LD** — keep `Organization`; add `WebSite` (name/url) + 5 `Service` entries (AiCoreMed, Captación 360, Portal del Paciente, AicoreLink, iapo.cl) each with `provider`→Organization, `serviceType`, `areaServed` `CL`, `url`.
- [ ] **Step 6: Insert DOLORES section** between HERO `</section>` (line ~68) and `<section class="sec eco"`: section `.sec.dol.sheet`-style navy with eyebrow `Lo que ya está pasando`, H2 `Seis formas en que tu negocio pierde clientes sin darte cuenta`, 6 pain cards with approved copy (68% fuera de horario / 5 minutos / 300 consultas / 15-20 min ficha / 80% olvida + -30% ingresos / herramientas que no se hablan). Grid reusing `.prin` patterns.
- [ ] **Step 7: Insert SOBRE AICORE section** between MÉTODO and INFRAESTRUCTURA: eyebrow `Quiénes somos`, H2 `No instalamos software. Lo operamos.`, sub statement + 3 principles (Infraestructura propia / IA local primero / Sistemas que se hablan) with approved copy.
- [ ] **Step 8: Footer legal links** — add column/list linking `/privacidad/`, `/terminos/`, `/aviso-legal/`; keep © 2026.
- [ ] **Step 9: Verify**: open locally; all links resolve; no `56900000000`/`hola@` remain; JSON-LD parses (paste into validator mentally / node check).

### Task 3: productos/index.html — brand, data, SEO, footer

**Files:**
- Modify: `productos/index.html` (brand ~36-39, links 22-29 JSON-LD, 224/278-279 data, footer 290/301-302)

- [ ] **Step 1: Brand** → `<img src="../assets/logo.svg" alt="Aicore Agency" class="brand-img">`.
- [ ] **Step 2: Data** — `wa.me/56900000000` → `56975680702` (AicoreLink "Avísenme", CTA); `hola@aicorebots.com` → `contacto@aicorebots.com` (CTA, footer).
- [ ] **Step 3: og:image/twitter:image** (`https://aicorebots.com/assets/og.png`).
- [ ] **Step 4: JSON-LD** — keep ItemList; add `WebSite` + the 5 `Service` entries (same block as home; easier: same JSON as Task 2 Step 5).
- [ ] **Step 5: Footer legal links** (`../privacidad/`, `../terminos/`, `../aviso-legal/`).
- [ ] **Step 6: Verify** — no fake data, relative links correct from `/productos/`.

### Task 4: New pages (faq, privacidad, terminos, aviso-legal, 404)

**Files:**
- Create: `faq/index.html`, `privacidad/index.html`, `terminos/index.html`, `aviso-legal/index.html`, `404.html`

- [ ] **Step 1: `faq/index.html`** — shared head boilerplate (fonts, favicon, theme-color, title "Preguntas frecuentes — Aicore Agency"), nav with Productos + Hablemos, 8-question accordion (details.row pattern): Qué es Aicore Agency / ¿Necesito saber programar? / ¿Cuánto tarda? (2 min WhatsApp, 5 días) / ¿Datos seguros? (IA local, Ley 19.628, ARCO) / ¿Solo clínicas? / ¿Qué es Portal del Paciente? / ¿AiCoreMed vs Captación 360? / ¿Cómo arranco? (WhatsApp 56975680702). JSON-LD `FAQPage` + `WebSite`. CTA WhatsApp real. Footer + legal links.
- [ ] **Step 2: `privacidad/index.html`** — adapted from med.aicorebots.com/privacidad: keep structure (responsible party, data collected, purposes, legal basis, ARCO/Ley 19.628 rights, retention, security AES-256/local AI, contact); entity = Aicore Agency, 1 Oriente 714, Viña del Mar; `contacto@aicorebots.com`; `+56 9 51805423`; no RUT. Same shell/head/footer.
- [ ] **Step 3: `terminos/index.html`** — adapted from med.aicorebots.com/terminos with the same entity swap; same shell.
- [ ] **Step 4: `aviso-legal/index.html`** — adapted from captacion360 aviso-legal structure (identifying data, object, access conditions, intellectual property) with entity fill-ins; no RUT; same shell.
- [ ] **Step 5: `404.html`** — design-matching (navy, display font, ECG motif), links to `/` and `/productos/`; no fake content.
- [ ] **Step 6: Verify** — each page loads locally at its route, links work, no fake data, each has title + meta description.

### Task 5: nginx.conf, sitemap.xml, Dockerfile

**Files:**
- Modify: `nginx.conf` (remove soft-404, add 404.html, 301 map, asset cache 1d)
- Modify: `sitemap.xml` (7 URLs + lastmod 2026-09-30)
- Modify: `Dockerfile` (copy new dirs + 404.html)

- [ ] **Step 1: nginx** — remove `error_page 404 /index.html;`; add `error_page 404 /404.html;` + `location = /404.html { internal; }`; keep gzip + 3 headers; bump `/assets/` cache to `max-age=86400`; add 301 locations: `=/servicios/`→`/#productos`, `=/contacto/`→`/#contacto`, `=/politica-de-privacidad/`→`/privacidad/`, `=/preguntas-frecuentes-ia-automatizacion/`→`/faq/`, `^~ /blog/`→`https://iapo.cl`.
- [ ] **Step 2: sitemap.xml** — 7 `<url>` entries with `<lastmod>2026-09-30</lastmod>`: `/`, `/productos/`, `/faq/`, `/privacidad/`, `/terminos/`, `/aviso-legal/`.
- [ ] **Step 3: Dockerfile** — add `COPY faq/ privacidad/ terminos/ aviso-legal/ /usr/share/nginx/html/` equivalents (one per dir) and `COPY 404.html` next to index.html.
- [ ] **Step 4: Verify** — `docker build -t aicorebots:local .` succeeds; `docker run -p 8080:80 -d aicorebots:local`; curl checks: `/`→200, `/blog/`→301 iapo.cl, `/servicios/`→301 /#productos, `/missing`→404, `/assets/site.css`→200+cache.

### Task 6: Git init, commit, push

**Files:** whole repo

- [ ] **Step 1**: `git init`, `git add -A`, inspect `git status`/`git diff --cached --stat`.
- [ ] **Step 2**: initial meaningful commit (e.g. `feat: complete aicorebots redesign with legal pages and seo`).
- [ ] **Step 3**: `git remote add origin https://github.com/LeonardoPS1/Aicorebots.git`, `git branch -M main`, `git push -u origin main` (credential manager auth).
- [ ] **Step 4: Verify** — `git ls-remote origin` shows new HEAD; `git log --oneline -3`.

### Task 7: Dokploy app + verify production

**Files:** none (Dokploy UI/API via SSH context)

- [ ] **Step 1**: Create Application in project `9BLFmYtERMq4ZCkFhlcw7`: GitHub `LeonardoPS1/Aicorebots`, branch `main`, Build `Dockerfile` (context root), domains `aicorebots.com` + `www.aicorebots.com`, container port 80, Auto Deploy ON. (If API/UI access unavailable, document exact manual steps for Leonardo.)
- [ ] **Step 2**: Wait for Traefik + Let's Encrypt; curl `https://aicorebots.com` and `https://www.aicorebots.com` → 200 + valid cert.
- [ ] **Step 3**: Spot-check 301s, assets (logo.svg, og.png, favicon.svg), legal pages, WhatsApp links contain `56975680702`.
- [ ] **Step 4**: Update README "Pendientes" section (remove done items, note Zoho mail as separate step; keep dev/deploy instructions).
- [ ] **Step 5: Verify** — final report with live URLs + status codes.

## Self-Review (completed during writing)

- Spec coverage: 5.1→T1/T2/T3; 5.2→T2/T3; 5.3→T2/T3/T4/T5; 5.4→T5; 5.5→T2; 5.6→T4; 5.7→T5; §6→T6/T7; §7→each task verify step. No gaps.
- Placeholders: none — all copy sourced from approved spec.
- Consistency: `56975680702`, `contacto@aicorebots.com`, relative paths (`../` from productos) consistent across tasks.