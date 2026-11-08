# DailyDesk
Frontend-only Next.js (App Router) + TypeScript + Tailwind tools site. All processing runs in the browser.

## Status
Live tools: word/character counter, case converter, remove extra spaces, text reverser, percentage, age, EMI, GST, discount, BMI, password generator. AI Writer shows "Coming soon".

## Run
```
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```
## Deploy
Push to GitHub (`git init && git add . && git commit -m init && git remote add origin <url> && git push -u origin main`), then import the repo at vercel.com/new. No env vars needed (optional `NEXT_PUBLIC_SITE_URL` for sitemap/canonical).

PDF tools use pdf-lib and pdfjs-dist; `npm install` copies the PDF.js worker into `public/` via a postinstall script.
