# BPMOVE
Költöztető cég landing page Vercel-re tervezve. Az árajánlatkérő űrlap egy **Vercel serverless function** (`api/quote.js`) segítségével küld e-mailt a megadott címre.

## Felépítés
- `index.html` – statikus landing page (SEO + AI SEO optimalizálva)
- `api/quote.js` – Vercel serverless function (POST `/api/quote`)
- `email-template.html` – brandelt HTML e-mail template `{{placeholder}}`-ekkel
- `vercel.json` – a functionhoz csatolja a template-et (`includeFiles`)
- `.env.example` – SMTP változók mintája
- `robots.txt`, `sitemap.xml` – SEO fájlok

## Lokális fejlesztés
Előkövetelmény: Node.js ≥ 18.17, pnpm.

```bash
pnpm install
cp .env.example .env.local   # a vercel dev automatikusan betölti
pnpm dev                     # = vercel dev  (http://localhost:3000)
```

A `vercel dev` lokálisan lefüttati az `api/quote.js` functiont is, így az űrlapküldés tesztelhető.

### SMTP beállítás (`.env.local` vagy Vercel dashboard)
Kötelező: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`. Ajánlott: `RECIPIENT_EMAIL`, `MAIL_FROM`, `SMTP_PORT`, `SMTP_SECURE`.

**Gmail**
1. 2FA bekapcsolása: https://myaccount.google.com/security
2. App Password generálása: https://myaccount.google.com/apppasswords
3. `SMTP_USER` = Gmail cím, `SMTP_PASS` = 16 karakteres app password

**Resend** (ajánlott produkcióra)
- Regisztrálj: https://resend.com → domain hozzáadása + DKIM/SPF beállítása
- `SMTP_HOST=smtp.resend.com`, `SMTP_USER=resend`, `SMTP_PASS=<API key>`

## Deploy Vercel-re
```bash
# első alkalommal összekötni a projektet (engedélyezés + project választás)
pnpm exec vercel link

# env változók feltöltése (vagy a dashboardon kézzel)
pnpm exec vercel env add SMTP_HOST
pnpm exec vercel env add SMTP_USER
pnpm exec vercel env add SMTP_PASS
pnpm exec vercel env add RECIPIENT_EMAIL
pnpm exec vercel env add MAIL_FROM

# deploy
pnpm deploy   # = vercel deploy --prod
```

Vagy egyszerűen push GitHub-ra és kösd össze a Vercel projekttel – az auto-deploy ezután működni fog.

## API
`POST /api/quote` – JSON body:
```json
{
  "name": "Kovács Anna",
  "phone": "+36 30 123 4567",
  "email": "anna@example.com",
  "from": "Budapest, XI.",
  "to": "Szentendre",
  "type": "Lakásköltöztetés",
  "date": "2026-05-15",
  "notes": "3. emelet, lift van"
}
```
Kötelező mezők: `name`, `phone`. A válaszok: `200 {ok:true}` / `400 {error}` / `500 {error}`.

## Template testreszabás
A `email-template.html` bármely HTML-e szerkeszthető. Támogatott placeholderek:
- `{{name}}`, `{{phone}}`, `{{email}}`
- `{{from}}`, `{{to}}`, `{{type}}`, `{{date}}`, `{{notes}}`
- `{{submittedAt}}` (szerver által generált, Europe/Budapest időzóna)

Üres mezők helyett `—` (em-dash) kerül behelyettesítésre, és minden érték HTML-escapelve van XSS ellen.
