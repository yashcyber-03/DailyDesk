# Deploying DailyDesk as a static website

DailyDesk is configured for a static export. It has no production API server, database, account system or paid-plan service.

## 1. Build the site

Use Node.js 20.16 or newer:

```bash
npm install
npm run check
npm run build
```

The static website is generated in `out/`. Deploy the contents of that folder to a static website host. Vercel supports this Next.js static export automatically; other hosts should publish `out/` and support the generated HTML routes.

## 2. Configure build-time values

No environment variables are required for the tools. Optionally set these before building:

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production site URL used for canonical links and the sitemap. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact address shown on the Contact page. |
| `NEXT_PUBLIC_ADS_ENABLED` | Set to `true` only if you later add an ad network. |

These values are compiled into the exported files, so rebuild and redeploy after changing them.

## 3. Add a custom domain

In your hosting provider's domain settings, connect your domain and configure the DNS records it provides. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` address and rebuild.

## 4. Set response headers at the host

Because the site is exported as static files, configure security headers in your hosting provider's settings rather than in a Next.js server. At minimum, configure `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, and an appropriate Content-Security-Policy for your host.

## 5. Verify the live site

- Work through `docs/testing-checklist.md`.
- Open `/sitemap.xml` and `/robots.txt` and confirm they use the production domain.
- Test direct loading of several tool URLs, not only navigation from the home page.
- If you use Google Search Console, submit `https://YOUR-DOMAIN/sitemap.xml`.

## Notes

- Productivity data is kept in each visitor's browser and is not backed up or synced.
- Files selected in PDF and image tools are processed locally in the browser.
- Do not add a secret API key to a `NEXT_PUBLIC_` variable; static-site values are visible in generated files.
