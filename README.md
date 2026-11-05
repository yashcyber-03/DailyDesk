# DailyDesk

**Everything You Need, All in One Desk.** A free online toolkit with 33 tools: PDF, image, AI, calculators and productivity, plus accounts, a dashboard and an AI assistant. Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase and the Gemini API, ready for Vercel.

## Quick start
```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm run dev                    # http://localhost:3000
```
Every tool works without any keys. Accounts need Supabase and the AI tools need a Gemini key (both optional while developing).

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Automated tests (Node 22.6 or newer) |
| `npm run check` | All of the above |

## Set-up guides
1. `docs/supabase-setup.md`: accounts, database tables and Row Level Security (two SQL files in `supabase/migrations/`)
2. `docs/gemini-setup.md`: AI features and limits
3. `docs/deployment.md`: GitHub, Vercel, environment variables, custom domain, Search Console
4. `docs/testing-checklist.md`: what to try before you launch
Environment variables are listed in `.env.example`.

## Project structure
```
src/app            pages, layouts, API routes, sitemap, robots, error pages
src/components     ui/ (design system), layout/, tools/ (+ implementations/ = one file per tool), ai/, auth/, account/, legal/, ads/
src/config         site, categories, tool registry, AI tools and limits, plans, flags
src/content        written content for tool pages, categories and legal pages
src/lib            calculators, PDF/image logic, AI server code, Supabase clients, repositories, SEO and security helpers
src/hooks          data and UI hooks
supabase/migrations  database schema
tests              automated tests
```
Add a new tool: register it in `src/config/tools.ts`, create `src/components/tools/implementations/<slug>.tsx`, add it to `src/config/implemented.ts` and `tool-renderer.tsx`, and write its entry in `src/content/tool-content.ts`.

## How it works
- **Files stay in your browser.** PDF and image tools use `pdf-lib`, `pdfjs-dist` and the Canvas API. Limits are in `src/config/limits.ts`.
- **AI.** The browser calls `/api/ai/tool` and `/api/ai/chat`. The key stays on the server. Visitors are limited per minute and day, signed-in users have a daily quota stored in the database, and input size is capped. Text goes to Google (disclosed on the pages and in the privacy policy).
- **Accounts.** Supabase Auth. Guests keep data in the browser and can move it to their account after logging in. Every table uses Row Level Security so users only see their own rows.
- **SEO.** Sitemap, robots, canonical URLs, social tags and structured data are generated. Rankings cannot be guaranteed.
- **Security.** Server-side secrets, validation on every API route, file type and size checks, rate limits, security headers and a Content-Security-Policy (`CSP_MODE`).
- **Monetization groundwork.** Free plan only. Plans and premium flags are in `src/config/plans.ts`, ad slots are hidden unless enabled, and the payment hook (`src/lib/billing/provider.ts`) is empty. Nothing can be bought.

## What has been verified
Checked automatically during development (offline sandbox):
- 49 unit tests (calculators, PDF/ZIP logic, page ranges, AI handlers with a fake Gemini server, limiter, validation, repositories, SQL structure, SEO, CSP).
- 57 browser tests in headless Chrome using the real tool components with real PDF and image files and a stubbed backend: all calculators, PDF merge/split/extract/rotate/compress, PDF to images, images to PDF, image compress/resize/convert/crop, colour palette, productivity tools in guest and account mode, auth forms, favourites, and the AI tools and assistant against mocked API responses.
- 775 server-rendering checks across every page and all 33 tool pages (headings, links, metadata, structured data, unique titles and descriptions, sitemap, robots, accessibility heuristics).

**Not yet verified, and the first things to check on your machine:** `npm install` and `npm run build` with the real packages, the real Supabase project (SQL, sign-up emails, session handling, Row Level Security), the real Gemini API and model name, the QR code library, the generated social preview image and icon, the middleware and auth callback, the account-deletion route, and the Content-Security-Policy in production.

## Legal
The privacy policy and terms in `src/content/legal.ts` are general drafts that describe what the site does today. They are not legal advice. Have them reviewed for your country and update them before adding analytics, ads or payments.
