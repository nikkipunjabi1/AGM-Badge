# Deployment

**Version:** 1.0 · **Last updated:** 15 September 2026

Since ADR-008 the app is a **static export** — `npm run build` produces plain files with no server
runtime. Vercel and Netlify are now equally straightforward, as is any static host. Vercel remains
the default recommendation only because it needs no configuration at all.

---

## 1. Environment variables

There are no secrets in this project. Everything is public configuration, which is a consequence of
having no database and no accounts.

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://badge.pmiuae.org` | Absolute base for the app's own Open Graph tags |
| `NEXT_PUBLIC_EVENT_URL` | *TBC (OQ-1)* | Register CTA destination |
| `NEXT_PUBLIC_ANALYTICS` | `vercel` \| `plausible` \| `none` | Which analytics to load |

Set all three in every environment. `NEXT_PUBLIC_EVENT_URL` is the one that matters most — it is the
only route from a shared badge back to registration (OQ-1).

## 2. Vercel

### First deploy

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project**, import the repo. The framework is detected automatically.
3. Add the environment variables above for Production, Preview and Development.
4. Deploy.

Every branch push then produces a preview URL, which is how AGB-003 is satisfied and how Marketing
reviews the artwork before launch.

### Configuration notes

- `next.config.ts` sets `output: 'export'`. There are no server routes to configure.
- Node 20+ (the project is developed against Node 26; either is fine).
- No `vercel.json` is required.

### Caching

Everything is static and content-hashed, so the platform defaults are correct. There is no origin to
saturate on the day the confirmation email goes out.

## 3. Custom domain

Recommended: `badge.pmiuae.org`.

1. Add the domain in Vercel → Project → Settings → Domains.
2. Create the DNS record Vercel shows — a `CNAME` to `cname.vercel-dns.com` for a subdomain.
3. Wait for the certificate to issue (usually minutes).
4. Update `NEXT_PUBLIC_APP_URL` and redeploy.
5. Re-run the upload dry run in QA-CHECKLIST §4 on the new domain.

Moving domains never breaks an already-downloaded badge, but it does break the CTA in any email or
post already sent — so settle the domain before launch, not after.

## 4. Netlify alternative

Equally simple now that the build is a static export — no plugin and no edge functions required.

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"
```

Set the same environment variables in Netlify's UI. Drag-and-drop deployment of the `out/` folder
also works if the Chapter would rather not connect a repository.

## 5. Pre-launch checklist

Run in order on the production URL, not a preview.

- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- [ ] `NEXT_PUBLIC_APP_URL` exactly matches the live host, including `https://` and no trailing slash
- [ ] `NEXT_PUBLIC_EVENT_URL` points at the real event page (OQ-1) — check the link, do not assume
- [ ] A badge downloaded from production posts cleanly to LinkedIn (QA-CHECKLIST §4)
- [ ] The Register link reaches the live event page with UTM parameters intact
- [ ] Lighthouse mobile: performance ≥ 90, accessibility 100
- [ ] `/privacy` reachable and matches PRIVACY.md
- [ ] Analytics recording, and carrying no personal data
- [ ] Brand sign-off received in writing (AGB-055)
- [ ] The confirmation email CTA points at the production URL with the right UTM (AGB-062)

## 6. Rollback

Vercel keeps every deployment. To roll back: Deployments → the last good one → **Promote to
Production**. It takes seconds and needs no rebuild.

Badges already downloaded are unaffected by any deployment — they are just image files on the
attendee's device.

## 7. During the campaign

The window that matters is 29 September to 10 October.

- Watch the badge-created count daily against PRD §4 M1. A flat line after the email goes out means
  the CTA placement, not the app.
- Keep one person able to deploy a hotfix on event day (Saturday 10 October), when traffic peaks
  and nobody is at a desk.
