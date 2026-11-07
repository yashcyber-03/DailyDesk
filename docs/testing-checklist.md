# Testing checklist

Automated checks cannot replace trying the real site. Test on a computer and a phone.

## Automated
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes and creates `out/`

## Tools
- [ ] Calculators: EMI (10,00,000 at 10% for 10 years is about 13,215), GST, discount, percentage, BMI, age and unit conversion show correct values and reject bad input
- [ ] Merge, split, extract, rotate and compress a real PDF; open the downloaded results in a PDF viewer
- [ ] PDF to images and images to PDF with phone photos (check orientation)
- [ ] Image compressor, resizer, cropper, JPG to PNG and PNG to JPG with real photos
- [ ] QR code: create one, scan it with a phone, download PNG and SVG
- [ ] Colour palette: copy a colour
- [ ] Password generator, Pomodoro (let one session finish), to-do, notes, planner and habits
- [ ] Reload the page: browser-local data is still there
- [ ] Clear site storage: verify browser-local data is removed
- [ ] Try a wrong file type, a corrupt file and a password-protected PDF: get a clear message without a crash
- [ ] Open a tool URL directly in a fresh tab without visiting the home page first

## Static deployment
- [ ] `/sitemap.xml` and `/robots.txt` open and use the production domain
- [ ] View source of a tool page: title, description, canonical link and JSON-LD are present
- [ ] Check the host's configured security headers
- [ ] No login, account, AI or paid-plan pages are linked or available

## Usability and accessibility
- [ ] Phone: menu, search and every tool page fit without sideways scrolling
- [ ] Keyboard only: search, menus, buttons and form fields are reachable, with visible focus
- [ ] Light and dark themes both look right
- [ ] Browser zoom at 200% is still usable
