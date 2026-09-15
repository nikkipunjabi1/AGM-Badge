# CLAUDE.md

Working instructions for AI-assisted development in this repository. Read this before making
changes. If something here conflicts with a request, say so rather than silently picking one.

## What this project is

A single-purpose web app: an attendee of the PMI UAE Chapter Annual Gathering 2026 enters their
name (plus optional role, company and photo) and gets a shareable "I'm attending" card.

No database of attendees. No login. The app is a static export and everything the attendee does
happens in their browser. The only server-side code is two Netlify Functions that keep anonymous
counts (ADR-010); they receive an event name and a random session id, never anything personal.

If a proposed change adds authentication, a record of *who* made a badge, or any identifier
attached to an event, stop and raise it. Attaching names to the counter is not an extension of
ADR-010 — it is the thing ADR-010 explicitly rejected, and it would make the privacy notice false.

## Non-negotiables

These are brand and legal constraints. Do not relax them to make a feature easier.

1. **Never call the badge a credential.** Banned words in UI copy, share captions, artwork, meta
   tags and filenames: *certificate, credential, verified, validated, earned, awarded, official
   proof, PDU*. Use "attendee card", "badge", "I'm attending". Rationale: PMI issues real Credly
   badges for certifications; confusing the two is a brand risk for the Chapter.
2. **The attendee photo never leaves the device.** Process with `createImageBitmap` + Canvas in the
   browser. No upload endpoint, no blob storage. If a feature seems to require uploading the photo,
   it is out of scope until ADR-004 is revisited.
3. **The artwork carries the PMI logo,** so every user-supplied string is validated and profanity-
   screened before it can render. See `lib/validation.ts`.
4. **Logo files in `public/brand/` are authoritative and must not be edited, recoloured, stretched,
   rotated, or reconstructed in code.** Use the supplied SVGs. Respect clear space (see
   docs/DESIGN-SPEC.md).
5. **No cookies and no third-party trackers at all.** No Google Analytics, no Meta pixel, no
   session recording. Counting is first-party, anonymous and aggregate (ADR-010).
6. **`track()` takes an event name and nothing else.** Do not widen that signature. It is the
   guardrail that stops personal data reaching the counter by accident.

## Commands

```bash
npm run dev          # local dev server on :3000
npm run build        # production build — must pass before any deploy
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit, zero errors required
npm run test         # Vitest unit tests
```

Definition of done for any ticket: `lint`, `typecheck`, `test` and `build` all pass, and the change
is verified on a real mobile viewport (375×812), not just desktop.

## Architecture in one paragraph

Next.js App Router, exported as a static site. `/` is the badge creator: a client component with a
live `<canvas>` preview. The attendee fills in their details, the canvas draws the badge, and they
download it as a PNG and upload it to LinkedIn themselves. On mobile, the Web Share API can hand the
file straight to LinkedIn or WhatsApp instead. There are no dynamic routes, no per-badge URLs and no
server runtime — see ADR-008. Full detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### One renderer

`lib/render/canvas.ts` is the only thing that draws a badge, and it reads every colour, size and
position from **`lib/badge-spec.ts`**. Never hard-code a visual value in the renderer; change the
spec module instead. The preview element and the exported PNG are the same canvas, so what the
attendee sees is exactly what they download.

## Code conventions

- TypeScript strict. No `any`; use `unknown` and narrow.
- Validate all external input with Zod at the boundary (`lib/validation.ts`). Types flow from the
  schema via `z.infer` — do not hand-write a duplicate interface.
- Server components by default; add `"use client"` only where interactivity genuinely requires it
  (the form and the canvas preview do; the badge page shell does not).
- Tailwind for layout and app chrome. The badge artwork itself is drawn from `badge-spec.ts`, not
  Tailwind classes — the canvas cannot read them.
- Keep `lib/` pure and framework-free where possible so it is unit-testable without a DOM.
- File naming: `kebab-case.ts` for modules, `PascalCase.tsx` for components.
- Comments explain *why*, not *what*. Match the density of surrounding code.

## Things that are easy to get wrong here

- **iOS HEIC photos.** iPhone photos are often HEIC. Chrome cannot decode them; Safari can. Wrap
  `createImageBitmap` in try/catch and show the copy in docs/CONTENT.md (`errors.photoFormat`)
  rather than failing silently.
- **EXIF rotation.** Use `createImageBitmap(file, { imageOrientation: 'from-image' })` or portrait
  photos arrive sideways.
- **Fonts and canvas.** Draw only after `document.fonts.ready` resolves, or the exported PNG gets a
  flash of fallback type that the on-screen preview does not show.
- **Arabic names.** Many attendees will enter Arabic. The font stack must include an Arabic face
  and the canvas renderer must handle RTL. Test with a real Arabic string, not Lorem Ipsum.
- **Long names and company names.** "Mohammed Abdul Rahman Al Maktoum" at a fixed font size will
  overflow. Auto-fit by stepping the size down; the spec defines min sizes.
- **Web Share API.** `navigator.share` with `files` works on iOS Safari and Android Chrome but not
  most desktop browsers. Always feature-detect with `navigator.canShare({ files })` and fall back
  to download + copy-caption.

## Content changes

Every user-visible string lives in [docs/CONTENT.md](docs/CONTENT.md) and is mirrored in
`lib/content.ts`. Change the doc and the module together. Event facts (date, venue, theme, PDU
count) live in `lib/event.ts` — one place, because they appear in a dozen others.

## Verifying visual work

Do not declare a badge change done from code alone. Render it and look at it:
run the dev server, generate a badge with a long name, a short name, an Arabic name, with a photo
and without, and check the OG card with a link-preview debugger (see docs/QA-CHECKLIST.md).

## Scope discipline

The event is on **10 October 2026** and the launch target is **28 September 2026**. Ideas that are
good but not v1 go to the backlog in [SPRINT.md](SPRINT.md) under "Post-launch", not into the
current sprint. When in doubt about whether something is in scope, check docs/PRD.md §7.
