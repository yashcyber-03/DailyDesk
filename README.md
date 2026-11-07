# DailyDesk

**Everything You Need, All in One Desk.** A free, static online toolkit with PDF, image, calculator and productivity tools. No sign-in, user accounts, paid plans, database or API server is required.

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:3000. No environment keys or external services are needed for the tools.

| Command | What it does |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build and export the static website to `out/` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Automated tests (Node 22.6 or newer) |
| `npm run check` | Run typecheck, lint, tests and static build |

## Deploy
Run `npm run build` and deploy the generated `out/` directory to a static website host. Deployment instructions are in `docs/deployment.md`. `NEXT_PUBLIC_SITE_URL` is optional for local use and can be set at build time for production canonical URLs and the sitemap.

## Project structure
```
src/app            static pages, sitemap, robots, error pages
src/components     UI, layout and browser-based tool implementations
src/config         site, categories, tool registry and feature flags
src/content        tool descriptions, categories and legal pages
src/lib            browser-side PDF/image operations, calculators, local repositories, SEO
src/hooks          browser-local data and UI hooks
tests              automated tests
```
Add a new tool: register it in `src/config/tools.ts`, create `src/components/tools/implementations/<slug>.tsx`, add it to `src/config/implemented.ts` and `tool-renderer.tsx`, and write its entry in `src/content/tool-content.ts`.

## How it works
- **Static website.** Next.js exports pages to plain files in `out/`; production does not need a Next.js server, API routes or database.
- **Local processing.** PDF and image tools use `pdf-lib`, `pdfjs-dist` and the Canvas API in the browser.
- **Local data.** Notes, tasks, favourites, habits, planner entries and recent tools stay in this browser's local storage. They do not sync across devices and can be removed by clearing site data.
- **No accounts or paid tiers.** Visitors can open and use the website without logging in; there are no Pro plans or subscriptions.
- **SEO.** Sitemap, robots, canonical URLs, social tags and structured data are generated at build time. Rankings cannot be guaranteed.

## Legal
The privacy policy and terms in `src/content/legal.ts` are general drafts, not legal advice. Have them reviewed for your country.
