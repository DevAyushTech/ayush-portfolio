# Ayush Kumar Singh — Digital System

A premium, editorial personal identity hub for **Ayush Kumar Singh, also known as Ayush Singh**: B.Tech CSE student specializing in Artificial Intelligence & Machine Learning, student developer, AI/ML builder, full-stack developer, and hackathon project maker.

The current design, animations, projects, and layout are retained. The real social profiles and intentionally public professional email are configured in `src/data.ts`. The supplied PDF at `public/resume.pdf` is served unchanged; no resume content is generated. Missing project-specific URLs remain unconfigured.

## Stack

- React 19 + TypeScript 7
- Vite 8
- Semantic React UI with lightweight `lucide-react` icons
- Static SSR/prerendered HTML for crawlable routes
- Plain CSS design system with responsive breakpoints, focus states, and `prefers-reduced-motion`
- GitHub public API integration with loading, error, empty, rate-limit, and no-configuration states
- Static-host friendly for Vercel, Netlify, or any HTTPS web server

## Local development

```bash
npm install
npm run dev
```

Production build, static prerender, sitemap, robots file, and asset checks:

```bash
npm run build
npm run check
npm run preview
```

**Production launch:** set `VITE_SITE_URL` to the actual deployed HTTPS origin and run `npm run build:production && npm run check`. The production command refuses a missing or invalid domain rather than silently deploying a noindex site. A confirmed deployed URL has not been supplied yet; no domain is invented. Plain `npm run build` without a domain is explicitly a local preview (relative metadata, noindex). Both the HTML and sitemap/robots use the same Vite-resolved value, including values from `.env.local`.

## Folder structure

```text
.
├── public/
│   ├── _headers              # security headers for Netlify-style hosts
│   ├── _redirects            # known static fallback behavior
│   ├── avatar.svg
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── og-image.svg / og-image.png
│   ├── robots.txt             # generated during build
│   └── sitemap.xml            # generated during build
├── scripts/
│   ├── check-site.mjs         # production artifact audit
│   └── prerender.mjs          # static HTML + SEO asset generation
├── src/
│   ├── App.tsx                # routes, sections, case studies, Ayush OS
│   ├── data.ts                # single editable content/config file
│   ├── entry-server.tsx       # route list + SSR render entry
│   ├── seo.ts                 # page titles, descriptions, JSON-LD, canonical tags
│   ├── components/
│   │   ├── GitHubSection.tsx  # honest public GitHub integration
│   │   └── github.css
│   ├── main.tsx
│   └── styles.css
├── index.html                 # Vite HTML shell
├── vite.config.ts
├── tsconfig*.json
└── README.md
```

## Routes

- `/` — identity hub homepage
- `/about` — profile, biography, current explorations, skills
- `/projects` — project index
- `/projects/auto-escrow`
- `/projects/satquery-ai`
- `/projects/orbitrakshak`
- `/projects/ghostaudit-ai`
- `/projects/verifyx`
- `/projects/bloomlink`
- `/journey`
- `/hackathons`
- `/writing`
- `/contact`
- `/resume`

Every route is emitted as crawlable HTML during `npm run build`. Each page has a unique title, description, canonical URL, robots directive, Open Graph/Twitter metadata, and JSON-LD. Project pages add `CreativeWork`; the site adds `Person`, `WebSite`, `ProfilePage`-appropriate identity data, and `BreadcrumbList`.

## Owner configuration: `src/data.ts`

Update only verified values in `src/data.ts`:

- `SITE_URL` via `VITE_SITE_URL`
- `profile.name`: Ayush Kumar Singh
- `profile.alternateName`: Ayush Singh
- role, bio, location, education, and email
- `profile.githubUsername`
- `profile.socials.github`, `linkedin`, and `instagram`
- `profile.resumeUrl`
- project GitHub/live URLs, screenshots, role, status, and outcome
- journey milestones, skills, and articles

Configured public identity (exact owner-provided values):

- GitHub: https://github.com/DevAyushTech
- LinkedIn: https://www.linkedin.com/in/connect-ayushsingh/
- Instagram: https://www.instagram.com/be.aayushh/
- Email: `connect.ayushkumarsingh@gmail.com`
- Email link: `mailto:connect.ayushkumarsingh@gmail.com`
- Resume: `/resume.pdf`

`Person` JSON-LD uses the primary `name`, `alternateName`, and the exact three `sameAs` URLs. These same values drive navbar, hero, contact, footer, social and profile links. No extra identity pages or hidden search keywords are added.

### Replacing the real resume

1. Replace **`public/resume.pdf`** with your actual PDF, retaining the filename.
2. Run `npm run build:production` (with the real site origin configured) and redeploy.
3. `/resume.pdf`, **View Resume**, **Download Resume**, and the footer link all use that same file. No website code change is necessary.
4. The build rejects a file without a PDF signature. Tests compare the served and downloaded bytes with the owner-supplied file.

If this file is absent, `/resume.pdf` is a **documented placeholder**, not a generated resume. The resume page and build output explicitly say that an upload is required. Never replace it with invented content. For an externally hosted PDF, change only `profile.resumeUrl`; cross-origin `download` behavior depends on that host’s Content-Disposition header. Same-origin `/resume.pdf` is recommended.

Review the real PDF for any private information before publishing it. The application does not extract its contents into HTML or JSON-LD. No API keys, tokens, IDs or financial information belong in this repository.

## GitHub integration

The homepage includes `GitHubSection`. It makes no request until both `profile.githubUsername` and `profile.socials.github` are valid. Once configured, it reads public GitHub repositories and recent public events using unauthenticated API requests only. It displays actual repository language, stars, forks, and updated date. It does not fake a contribution heatmap: GitHub’s unauthenticated API does not reliably expose contribution counts or pinned repositories.

To configure:

1. Set `profile.githubUsername` to the real username.
2. Set `profile.socials.github` to the matching HTTPS profile URL.
3. Run `npm run build && npm run check`.
4. Deploy with an HTTPS site URL.

No GitHub token is required. If rate limited, the UI retains the profile link and shows a retry state.

## Adding projects

1. Add a typed project object to `projects` in `src/data.ts`.
2. Use a unique `id`, truthful status, problem, solution, stack, architecture, role, and outcome.
3. Add verified `githubUrl`, `liveUrl`, and screenshot paths only when they exist.
4. Add the project to `src/entry-server.tsx` only if the list is not derived from `projects` in your branch.
5. Run `npm run build` to regenerate the project HTML, sitemap, and metadata.

Project pages contain Problem, Why it matters, Approach, Architecture, Technology, Implementation/outcome, Screenshots, GitHub, and Live Demo states. Missing URLs show an explicit configuration action rather than a dead or fabricated link.

## Adding articles

The `journal` list currently contains clearly labeled unpublished topics. For a real article:

1. Add a verified `slug`, title, ISO `date`, reading time, description, and author content to `journal`.
2. Add a route and article body in `App.tsx` (or move articles to a markdown/content pipeline).
3. Add `Article` JSON-LD with `headline`, `author` pointing to Ayush’s `Person` entity, `datePublished`, `dateModified`, `description`, `timeRequired`, and `mainEntityOfPage`.
4. Add its canonical path to the generated route list and sitemap.
5. Publish only genuine notes; do not imply expertise, outcomes, or experience that is not documented.

## Contact security

The existing contact form now validates input and opens a URL-encoded email draft addressed to `profile.email`. It **does not send or store a message**, and its confirmation says to review and send in the email app. Direct `mailto:` links work without a backend; mail-client configuration is the visitor’s responsibility. If you later replace this with a serverless/FastAPI sending endpoint, add:

- server-side validation and length limits
- CSRF/origin checks as appropriate
- honeypot or rate limit / CAPTCHA protection
- content-type and payload limits
- no secrets in `VITE_*` variables
- safe error messages and logs without personal data

## SEO and Google Search Console

1. Deploy to a final HTTPS domain.
2. Set `VITE_SITE_URL=https://your-real-domain.example` in the hosting environment. Do not leave the example value.
3. Review the configured identity links and the real PDF at `public/resume.pdf`.
4. Run `npm run build:production && npm run check && npm test`.
5. Submit `https://your-real-domain.example/sitemap.xml` to Google Search Console.
6. Inspect the homepage, About, Projects, and one case-study URL; request indexing after the real links are live.
7. Validate JSON-LD with Schema.org Validator / Google Rich Results Test.
8. Validate Open Graph previews after deployment.

Configured production pages use `index, follow`; only the 404 is noindex. `robots.txt` allows crawling and advertises the generated sitemap. Canonical, Open Graph URL/image, Person URL, WebSite, ProfilePage and breadcrumbs share the configured origin. Client navigation updates metadata and JSON-LD as well as the title. Unpublished writing topics do **not** emit Article schema. Actual articles can use the existing Article metadata support when published. These identity signals do not guarantee a ranking.

## Deployment

### Vercel

Set:

```text
Build command: npm run build:production
Output directory: dist
Environment variable: VITE_SITE_URL=https://your-real-domain.example
```

The included `vercel.json` uses clean URLs and serves prerendered route files. Add the custom domain and HTTPS.

### Netlify

Set:

```text
Build command: npm run build:production
Publish directory: dist
Environment variable: VITE_SITE_URL=https://your-real-domain.example
```

`public/_headers` provides basic security headers. The generated static route directories work without a catch-all rewrite. If you later add client-only routes, update the host rules intentionally rather than rewriting unknown URLs to the homepage.

## Environment variables

Copy `.env.example` to `.env.local` for local configuration:

```bash
VITE_SITE_URL=https://your-real-domain.example
```

Only public configuration belongs in `VITE_*`. Never expose GitHub tokens, database credentials, email-provider keys, secret keys, or private API keys in browser code.

## Verification

- `npm run typecheck`: TypeScript validation.
- `npm run check`: checks all 14 generated routes, unique titles, primary/alternate identity, exact `sameAs`, canonical/OG URLs, email/profile links, sitemap/robots consistency and PDF signature. Explicit warnings are emitted for a missing domain or missing owner PDF.
- `npm test`: browser checks at 360, 390, 768 and 1440px, real link targets across surfaces, client-side metadata transitions, console/page errors, and byte-identical PDF downloads. It uses installed Edge on Windows; otherwise run `npx playwright install chromium` or set `BROWSER_PATH`.

Browser tests mock the public GitHub API with empty responses to avoid depending on third-party rate limits; the website itself uses the live API. Successful profile-link wiring is not a promise that LinkedIn/Instagram will allow automated requests or unauthenticated access.
