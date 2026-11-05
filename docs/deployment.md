# Deploying DailyDesk (GitHub, Vercel, custom domain)

Do the steps in order. Everything here uses free accounts to start.

## 0. Before you deploy
Run these on your computer and fix anything that fails:
```
npm install
npm run typecheck
npm run lint
npm test
npm run build
```
`npm run check` runs all four. Also finish `docs/supabase-setup.md` (including the second migration `20261102000000_ai_usage.sql`) and `docs/gemini-setup.md`.

## 1. Put the code on GitHub
1. Create a free account at https://github.com and click **New repository**. Name it `dailydesk`. A private repository is fine.
2. In your project folder run (replace `YOUR-USER`):
```
git init
git add .
git commit -m "DailyDesk first version"
git branch -M main
git remote add origin https://github.com/YOUR-USER/dailydesk.git
git push -u origin main
```
3. Check on github.com that `.env.local` is NOT in the repository. It is listed in `.gitignore`, so it should not be. If a secret key was ever committed, treat it as leaked: delete the key in Supabase or Google and create a new one.

## 2. Import the repository into Vercel
1. Sign in at https://vercel.com with your GitHub account.
2. **Add New** > **Project** > pick `dailydesk` > **Import**.
3. Framework Preset should say **Next.js**. Leave build and output settings unchanged.
4. Open **Environment Variables** and add the values from the table below **before** the first deploy.
5. Click **Deploy**. The first build takes a few minutes.

> **Plan note:** Vercel's free Hobby plan is meant for personal, non-commercial use. Check Vercel's current terms. Once you add ads, payments or business use, you will probably need a paid plan.

## 3. Environment variables
| Name | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Your final address, for example `https://dailydesk.com`. Until you have a domain use the `https://your-project.vercel.app` address. |
| `NEXT_PUBLIC_SUPABASE_URL` | For accounts | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For accounts | Supabase > Project Settings > API Keys (older projects: the `anon` key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Only for the "Delete account" button. Secret. Never `NEXT_PUBLIC_`. |
| `GEMINI_API_KEY` | For AI tools | Google AI Studio. Secret. |
| `GEMINI_MODEL` | Optional | A model id from Google's docs. |
| `AI_RATE_LIMIT_PER_MINUTE`, `AI_RATE_LIMIT_PER_DAY` | Optional | Override the visitor limits. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Recommended | The address shown on the Contact page. It will be public. |
| `NEXT_PUBLIC_ADS_ENABLED` | Optional | Leave `false` until you connect an ad network. |
| `CSP_MODE` | Optional | `enforce` (default), `report-only` or `off`. |

Values starting with `NEXT_PUBLIC_` are built into the site, so after changing one you must **Redeploy** (Deployments > the three dots > Redeploy).

## 4. Tell Supabase about your live address
In Supabase > Authentication > URL Configuration:
- **Site URL**: your live address.
- **Redirect URLs**: add `https://YOUR-ADDRESS/auth/callback`.
Without this, confirmation and password-reset links will not work on the live site.

## 5. Check the live site
Work through `docs/testing-checklist.md` on the live address, on your phone as well.

## 6. Connect a custom domain
1. Buy a domain from any registrar.
2. Vercel > your project > **Settings** > **Domains** > **Add**. Enter `yourdomain.com`.
3. Vercel shows the DNS records to create (usually an `A` record for the bare domain and a `CNAME` for `www`). Copy exactly what Vercel shows into your registrar's DNS settings.
4. Wait until Vercel shows a green check. HTTPS is set up automatically. DNS can take from a few minutes to a day.
5. Set `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`, update the two Supabase URL settings from step 4, and **Redeploy**.

## 7. Help Google find the site
1. Open Google Search Console (https://search.google.com/search-console) and add your domain. Verification uses a DNS record.
2. Submit `https://yourdomain.com/sitemap.xml`.
3. Be patient. Indexing and rankings take weeks or months and cannot be guaranteed. Good, original content and a fast site help most.

## Troubleshooting
| Problem | What to check |
|---|---|
| Build fails on Vercel | Open the build log, copy the first error and send it to me. Make sure `npm run build` also fails locally. |
| Login emails link to localhost | Supabase Site URL and Redirect URLs (step 4). |
| Something works locally but not live | `CSP_MODE=report-only`, redeploy, then open the browser console and look for "Refused to...". |
| AI says "not set up yet" | `GEMINI_API_KEY` missing in Vercel, or you added it but did not redeploy. |
| Sitemap shows `localhost` | `NEXT_PUBLIC_SITE_URL` not set, then redeploy. |
