# Testing checklist

Automated checks cannot replace trying the real site. Do this on your computer **and** on a phone.

## Automated (run on your computer)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes

## Tools (use real files from your own computer)
- [ ] Calculators: EMI (10,00,000 at 10% for 10 years is about 13,215), GST, discount, percentage, BMI, age, unit converter show correct values and reject bad input
- [ ] Merge, split, extract, rotate and compress a real PDF. Open the downloaded results in a PDF viewer
- [ ] PDF to images, and images to PDF with phone photos (check they are the right way up)
- [ ] Image compressor, resizer, cropper, JPG to PNG, PNG to JPG with real photos
- [ ] QR code: create one, scan it with your phone, download PNG and SVG
- [ ] Colour palette: copy a colour
- [ ] Password generator, Pomodoro (let one session finish), to-do, notes, planner, habits
- [ ] Reload the page: guest data is still there
- [ ] Try a wrong file type, a corrupt file and a password-protected PDF: you get a clear message, no crash

## Accounts and data
- [ ] Sign up, confirm the email, log in, log out
- [ ] Forgot password: the email arrives and the reset works
- [ ] Add a task and a note while logged in, then check the same account in a private window on another device
- [ ] Create a second account. Confirm it cannot see the first account's data
- [ ] Visit `/dashboard` while logged out: you are sent to the login page
- [ ] Guest tasks: log in and use "Move them to my account"
- [ ] Favourites and "Recently used" appear on the dashboard
- [ ] Change display name, theme and password. Clear activity history
- [ ] Delete a test account (needs `SUPABASE_SERVICE_ROLE_KEY`). Check its data is gone in Supabase

## AI
- [ ] Every AI tool returns a result, and Copy and Clear work
- [ ] AI Assistant: several messages in a row, change mode, clear the conversation
- [ ] Remove the key temporarily: you see the "not set up" message, not a crash
- [ ] Send many requests quickly: you see the limit message
- [ ] In the browser's developer tools (Network and Sources) search for your key. It must not appear anywhere

## SEO and sharing
- [ ] `/sitemap.xml` and `/robots.txt` open and use your real domain
- [ ] View source of a tool page: title, description, canonical link and JSON-LD are present
- [ ] Paste a tool page link into a chat app or a social preview tester and check the preview
- [ ] Google Rich Results Test and Lighthouse (Chrome DevTools) on the home page and one tool page. Fix anything flagged as an error

## Security
- [ ] Check headers on https://securityheaders.com
- [ ] Nothing secret appears in the repository on GitHub
- [ ] The site works with the Content-Security-Policy on (no "Refused to..." messages in the console)

## Usability and accessibility
- [ ] Phone: menu, search, every tool page fits the screen without sideways scrolling
- [ ] Keyboard only: you can reach and use search, menus, buttons and form fields, and always see where the focus is
- [ ] Light and dark theme both look right
- [ ] Browser zoom at 200% is still usable
