# Aicorebots Revamp Design — 2026-09-30

## 1. Context

`aicorebots.com` is the central agency site for Aicore Agency (Viña del Mar, Chile). A fully hand-crafted static redesign already exists locally in `D:\OPENCODE\aicorebots` (2 pages: `index.html`, `productos/index.html`, shared `assets/`, nginx + Dockerfile) but it was **never deployed**: production still runs the old WordPress site. On 2026-09-30 the DNS cutover was executed (`@` and `www` A records → `51.222.207.250`), so **production is currently returning HTTP 404** from Traefik because no Dokploy application exists yet for this host.

This spec finalizes the redesign: finish the two approved landing sections, correct all fake contact data, add the new legal/FAQ/404 pages, harden SEO and nginx, then ship it to GitHub and Dokploy.

Design is locked and approved by the owner. **This is a preservation-first change**: the existing visual language (palette, typography, layout tokens, animations) must survive byte-for-byte where not explicitly listed below.

## 2. Goals

1. Restore `aicorebots.com` to a live site (currently 404) as fast as possible.
2. Ship the existing design with the real brand and real contact data.
3. Add the approved content sections and pages.
4. Fix the SEO and security gaps found in the audit.
5. Establish GitHub repo + Dokploy app so future deploys are push-triggered.

## 3. Non-goals (explicitly out of scope)

- **No blog section** on aicorebots (owner decision: iapo.cl already owns content; /blog/ → iapo.cl 301s).
- **No analytics, no cookie banner** this round (owner decision: analytics deferred to stage 2; without non-essential cookies no banner is required by current law interpretation).
- **No RUT or razón social** in legal pages (owner decision: brand + domicile only).
- **No framework migration** (no Astro/11ty/build system): redesign must not rewrite the existing HTML/CSS.
- **No email hosting on the VPS** (owner decision: Zoho Mail Free via Cloudflare MX/SPF, handled separately, not blocking this deploy).

## 4. Design tokens (preserve)

From `assets/site.css:2-12`:

```
--navy:#0A2342; --abyss:#06152B; --teal:#33E1C5; --teal-ink:#087A6B; --blue:#3B82F6;
--clinic:#F3F7FA; --steel:#9FB4CE; --slate:#4A5F7A; --hair:rgba(159,180,206,.18)
```

Fonts: Bricolage Grotesque (display), Instrument Sans (body), JetBrains Mono (mono). `color-scheme:dark`, `interpolate-size:allow-keywords`. Section layering via `.sheet` (negative margin + radius), `.wrap` = `min(1180px,100% - clamp(40px,8vw,96px))`, eyebrow/sub in `--steel`, animated `details` accordions, `prefers-reduced-motion` full block.

## 5. Changes by area

### 5.1 Brand — real logo replaces invented mark

**Current state (both pages)**: `.brand` renders an invented teal rounded-square SVG with an ECG polyline plus text `Ai core` (index.html:31-34, 286; productos:36-39, 290). `assets/favicon.svg` is likewise the invented teal square.

**Required**:
- Download the real wordmark `LOGO-5.svg` (currently at `https://aicorebots.com/wp-content/uploads/2025/09/LOGO-5.svg`, 1514×778, white letters + blue gradients `#009DFD #003886 #044A8A` and gradient pairs `#003886→#21C2E8`, `#2EC3E3→#54F8FF`) into `assets/logo.svg`.
- Recolor pass for dark backgrounds (`--navy`/`--abyss`): lift dark blues (`#003886`, `#044A8A`) into the light family (`#009DFD`, `#21C2E8`, `#2EC3E3`, `#54F8FF`) so the wordmark stays legible on navy. Keep the letter fill `#FDFCFD`.
- Replace `.brand` markup on both pages: drop the `<span>Ai core</span>` text and inline SVG; use `<img src="assets/logo.svg" alt="Aicore Agency" class="brand-img">` (relative path `../assets/logo.svg` from `/productos/`). Set `.brand-img` sizing in CSS (height ~22-24px, width auto).
- New `assets/favicon.svg`: crop only the ECG glyph (left third of the wordmark viewBox), recolored in the same light blues/teal. Replaces both the file and the duplicate data-URI icon link (see 5.3).

### 5.2 Real contact data (bugfix — 9 occurrences)

Replace on **both pages** (verified line refs):
- `https://wa.me/56900000000` (index: 274, 297; productos: 224, 278, 301 — plus prefilled `?text=` variants) → `https://wa.me/56975680702` keeping the same `?text=` params where present.
- `mailto:hola@aicorebots.com` and `hola@aicorebots.com` (index: 275, 298; productos: 279, 302) → `mailto:contacto@aicorebots.com` / `contacto@aicorebots.com`.

### 5.3 SEO & structured data

- **og:image / twitter:image**: add `<meta property="og:image" content="https://aicorebots.com/assets/og.png">` + `<meta property="og:image:width" content="1200">`, height 630, and `twitter:image` to both pages. Commit a real `assets/og.png` (1200×630) generated once (headless Chrome screenshot of a branded canvas) — no runtime build.
- **Favicon dedupe**: remove the inline data-URI `<link rel="icon">` (index.html:16); keep only `assets/favicon.svg` (productos page has no duplicate).
- **JSON-LD**:
  - index.html: keep `Organization`; add `WebSite` (url, potentialAction SearchAction optional — skip search since no search; keep name+url) and one `Service` per product (AiCoreMed, Captación 360, Portal del Paciente, AicoreLink, iapo.cl) with `provider` → Organization, `areaServed` CL, `serviceType`, `url`.
  - productos/index.html: keep `ItemList`; add the same `WebSite` + `Service` set (or reference).
  - /faq/index.html: `FAQPage` + `WebSite`.
- **sitemap.xml**: 7 URLs with `lastmod` (2026-09-30): `/`, `/productos/`, `/faq/`, `/privacidad/`, `/terminos/`, `/aviso-legal/`.
- **Footer (both pages)**: add a Legal column linking `/privacidad/`, `/terminos/`, `/aviso-legal/` (relative paths; from `/productos/` use `../privacidad/` etc.).

### 5.4 nginx hardening

Current `nginx.conf` (29 lines) has: gzip, 3 security headers, `/assets/` 1h cache, `/` no-cache, and **`error_page 404 /index.html` (soft-404 — serves 200 to everything, ~57k scanner requests observed)**.

Required changes:
- Remove `error_page 404 /index.html`; add `error_page 404 /404.html;` and a `location = /404.html { internal; }` — real 404 status.
- Add `location = /robots.txt`, `= /sitemap.xml`, `= /favicon.ico` passthroughs if needed (defaults fine) and `add_header Cache-Control "public, max-age=86400"` on `/assets/` (1h → 1d is safe, assets are content-hashed mentally but not build-hashed; 1d acceptable).
- **301 map** (WordPress cutover):
  - `location = /servicios/` / `location = /servicios` → `return 301 /#productos;`
  - `location = /contacto/` → `return 301 /#contacto;`
  - `location = /politica-de-privacidad/` → `return 301 /privacidad/;`
  - `location = /preguntas-frecuentes-ia-automatizacion/` → `return 301 /faq/;`
  - `location = /blog/` → `return 301 https://iapo.cl;`
  - 5 old post slugs (`/blog/ia-que-revoluciona-los-negocios-en-2025/`, `/blog/seo-tendencias-2025/`, `/blog/marketing-digital-2025/`, `/blog/diseño-web-7-tendencias-2025/`, `/blog/guia-landing-pages/`) → `return 301 https://iapo.cl;` (slugs must be re-verified from the live WP menu during implementation; use a regex prefix `location ^~ /blog/` → iapo.cl if slugs are unreliable).
  - Simplest robust rule: `location ^~ /blog/ { return 301 https://iapo.cl; }` covers all posts; keep explicit ones only if slug precision matters.
- Keep gzip + the 3 security headers. No X-Robots-Tag needed on 404s: the status code already implies noindex.

### 5.5 New landing sections (index.html only)

**5.5.1 `DOLORES`** — insert between HERO (`</section>` at line 68) and PRODUCTOS (`<section class="sec eco"` at line 71). Same section pattern as `.eco` (background `--navy`, `.wrap`, `h2` + `.sub`), eyebrow style.

Copy (approved, data from their live sites):
- Eyebrow: `Lo que ya está pasando`
- H2: `Seis formas en que tu negocio pierde clientes sin darte cuenta`
- Sub: numbers from real products (Captación 360 / AiCoreMed).
- 6 pain cards (grid, matching `.prin`-style layout or a new `.pains` grid; entries keep the design's hairline dividers, `--teal` markers):
  1. **El mensaje que nadie responde** — `68% de las consultas llegan fuera del horario laboral. ¿Las estás perdiendo todas?` (WP /servicios/)
  2. **Los cinco minutos que lo deciden todo** — `El cliente que no recibe respuesta en 5 minutos busca otra opción.` (WP /servicios/)
  3. **La tarea que se repite todos los días** — `Atender 300 consultas simultáneas sin contratar un solo empleado más es posible. Hoy no lo estás haciendo.` (WP /servicios/)
  4. **El dato que vive en un papel** — `15 a 20 minutos por ficha clínica en papel. Sin historial, sin métricas, sin continuidad.` (med.aicorebots.com)
  5. **El paciente que se olvidó** — `80% olvida su hora sin recordatorio. El ausentismo puede restar hasta 30% de tus ingresos.` (med.aicorebots.com)
  6. **Las herramientas que nunca se hablan** — `Agenda, fichas y cobros en sistemas separados. El seguimiento se pierde entre uno y otro.` (captacion360 doctrine)

**5.5.2 `SOBRE AICORE`** — insert between MÉTODO (`</section>` at line 248) and INFRAESTRUCTURA (`<section class="sec infra sheet"` at line 251). Dark section (`.infra`-style, `--abyss` or `--navy`). Content:
- Eyebrow: `Quiénes somos`
- H2: `No instalamos software. Lo operamos.`
- Sub: agency statement (draft approved): `Aicore Agency es una agencia chilena que construye y opera agentes de IA para clínicas y negocios. No revendemos cajas negras: corre en servidores nuestros, con nuestros propios modelos y nuestro equipo al otro lado.`
- 3 principle blocks (reuse `.prin` grid patterns; copy approved):
  1. **Infraestructura propia** — `Todo corre en servidores administrados por nosotros: contenedores, certificados y respaldos bajo nuestro control.`
  2. **IA local primero** — `Los datos sensibles se procesan con modelos locales (Ollama) en infraestructura propia. Nada sale de tu servidor sin que lo decidas vos.`
  3. **Sistemas que se hablan** — `Captación, gestión y retención comparten los mismos datos. Cada conversación deja un rastro medible, no una planilla que se pierde.`

### 5.6 New pages

All new pages share: same `head` boilerplate (fonts, favicon, theme-color), nav (`productos/` link + `Hablemos`), footer (with legal links), `assets/site.css`; dark `--navy` background with `.wrap`. Content language: Spanish (CL). Titles/meta descriptions per page.

1. **`faq/index.html`** — 8 questions (approved list), accordion using the existing `details.row` pattern or a simple Q&A list, `FAQPage` JSON-LD + `WebSite`. Nav: Home + Productos links. CTA at bottom (WhatsApp real number).
2. **`privacidad/index.html`** — adapted from `med.aicorebots.com/privacidad` (6637 chars, published 27 May 2026): replace AiCoreMed/the Platform references with Aicore Agency / the Site; business identity: **Aicore Agency**, 1 Oriente 714, Viña del Mar, Chile; `contacto@aicorebots.com`; `+56 9 51805423`. No RUT. Keep structure: responsible party, data collected, purposes, legal basis, rights (ARCO, Ley 19.628), retention, security (AES-256, local AI), contact.
3. **`terminos/index.html`** — adapted from `med.aicorebots.com/terminos` (4932 chars) with the same entity swap.
4. **`aviso-legal/index.html`** — adapted from `captacion360.aicorebots.com/aviso-legal.html` (structure: identifying data, object, access conditions, intellectual property), entity fill-ins as above (no RUT).
5. **`404.html`** — matches design (navy, display font, ECG line motif), links home + productos, reflects real 404 (do not build on soft-404).

New directories: `docs/` already exists for specs; `faq/`, `privacidad/`, `terminos/`, `aviso-legal/` under root. Dockerfile must copy them (see 5.7). `robots.txt` unchanged; `sitemap.xml` updated.

### 5.7 Dockerfile

Current Dockerfile copies only `index.html robots.txt sitemap.xml` + `productos/` + `assets/`. Add copies for `faq/`, `privacidad/`, `terminos/`, `aviso-legal/`, and `404.html`.

## 6. Git & deployment

- `git init` in `D:\OPENCODE\aicorebots`; add all; single meaningful commit(s) per work unit (conventional commits: `feat:`, `fix:`, `docs:`, `chore:`); push to `https://github.com/LeonardoPS1/Aicorebots.git` (private, exists, upstream `main`, HEAD `1d0f7dd...`; auth via git credential manager; no `gh` CLI available).
- Dokploy: create Application in project `9BLFmYtERMq4ZCkFhlcw7`, provider GitHub `LeonardoPS1/Aicorebots`, branch `main`, Build `Dockerfile` (context `.`), domains `aicorebots.com` + `www.aicorebots.com`, container port 80, Let's Encrypt. Dokploy auto-writes the Traefik file-provider YAML (pattern verified from `captacion360-cap360-86ynna.yml`). Enable Auto Deploy.
- Because the A records already point to the VPS, the app goes live as soon as Dokploy serves it; the 301s live inside this nginx.conf.

## 7. Verification

- Local: `python -m http.server` spot check of every route (/, /productos/, /faq/, legal pages, /404.html) and validate JSON-LD parses.
- Docker: `docker build` succeeds; `docker run -p 8080:80` curl checks: `/` → 200, `/blog/` → 301 to iapo.cl, `/servicios/` → 301 /#productos, `/nonexistent` → 404 (real status), `/assets/site.css` → 200 + cache header.
- Production post-deploy: curl `https://aicorebots.com` → 200 + TLS; check Let's Encrypt cert; spot-check 301s; verify pages render (title, logo image loads, WhatsApp links are `56975680702`).

## 8. Risks

- **DNS already cut**: window of 404 exists until deploy completes — deploy ASAP, keep changes atomic.
- **Wordmark recolor**: dark blue lifting is a judgment call; verify contrast on navy visually before pushing; fallback = keep original fills if it passes.
- **WP slugs**: exact post slugs may differ from audit; the `^~ /blog/` catch-all avoids fragility.
- **Zoho MX/SPF**: separate task, must not block this deploy; email currently still resolving via WP hosting (external) until MX moves.