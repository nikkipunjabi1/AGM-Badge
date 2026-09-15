# Architecture

**Version:** 2.0 · **Last updated:** 15 September 2026
**Supersedes v1.0**, which included per-badge URLs and a server-rendered Open Graph image. See
DECISIONS.md ADR-008 for why that was removed.

---

## 1. Shape of the system

The app is a Next.js project exported to static files, where a single client page draws the badge
on a `<canvas>` and hands the attendee an image.

No accounts. No database of attendees. **Nothing an attendee types or attaches is persisted
anywhere.** The one exception is deliberately narrow: two Netlify Functions keep anonymous counts
of how many badges are made, so the Chapter can report on the campaign (ADR-010). They receive an
event name and a random session id, and nothing else.

```
  confirmation     ┌─────────────────────────────────────┐
  email /   ──────>│  /   Badge creator (client only)    │
  social post      │  ─────────────────────────────────  │
                   │  name · role · company · photo      │
                   │            │                        │
                   │            v                        │
                   │  <canvas> live preview @ 1200x1200  │
                   └────────────┬────────────────────────┘
                                │
              ┌─────────────────┼──────────────────┐
              v                 v                  v
        Download PNG     Web Share (mobile)   Copy caption
              │                 │                  │
              v                 v                  v
        upload to        image handed to      paste into
        LinkedIn         LinkedIn/WhatsApp    the post
        by hand          by the OS sheet
```

The caption carries the event registration URL, so a shared badge still routes people to
registration even though the badge image itself is not clickable.

## 2. Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static shell + client island | The creator. Form, live preview, download and share controls |
| `/privacy` | Static | Privacy notice (see PRIVACY.md) |
| `/api/event` | Netlify Function | Records an anonymous event. Accepts an event name and a random session id. Never receives anything personal |
| `/api/stats` | Netlify Function | Private totals for the Chapter, gated on `STATS_KEY`. Returns 404 without it |

`next.config.ts` sets `output: 'export'`, so `npm run build` produces a folder of static files.
The two functions live in `netlify/functions/` and deploy alongside them — which is why the
counter needed no change to the app's architecture.

### Open Graph for the app itself

The app has one static share card (`public/art/share-card.png`) used in its own OG tags, so that
when the Chapter posts the *app link*, it looks considered. This is a single fixed image — it does
not vary per badge, because per-badge cards were removed by ADR-008.

> **Outstanding:** `share-card.png` depends on the event key visual arriving (OQ-4). Until then the
> app ships without an OG image. It is a launch-checklist item, not a build blocker.

## 3. Rendering

`lib/render/canvas.ts` is the only code that draws a badge. It is a pure function of
`(BadgeData, Format, Assets)` and knows nothing about React.

```ts
renderBadge(ctx, { name, role, company, photo }, SPEC.square)
```

Key properties:

- **The preview and the export are the same canvas.** The preview is that canvas CSS-scaled down,
  so the attendee sees the exact pixels they will download. There is no second "export" code path
  that can drift.
- Drawn at full size (1200×1200) and scaled for display, never the reverse.
- Fonts are registered with the `FontFace` API and the first draw waits on `document.fonts.ready`.
  Drawing earlier produces a fallback-font flash that appears in the exported PNG but not on screen
  — a bug that is very easy to ship and very hard to notice.
- Exported with `canvas.toBlob(cb, 'image/jpeg', 0.98)` — see ADR-009.

All geometry, colour and type come from **`lib/badge-spec.ts`**, transcribed from DESIGN-SPEC.md.
Nothing visual is hard-coded in the renderer.

### Background artwork

The badge background is drawn programmatically — a vertical gradient through `deepGreen` → `forest`
→ `emerald` with the key visual's highlight arcs in `glow`, plus the legibility scrim. This is the
OQ-4 fallback: when Marketing supplies the real key visual, it becomes a single `drawImage` call in
`drawBackground()` and nothing else changes.

## 4. Data flow

`BadgeData` exists only in React state for the life of the page. It is never serialised to a URL,
never written to `localStorage`, and never sent anywhere.

```ts
type BadgeData = {
  name: string;
  role?: string;
  company?: string;
  photo?: ImageBitmap;   // decoded in-browser, never uploaded
  crop?: { x: number; y: number; zoom: number };
};
```

Refreshing the page loses the badge. That is acceptable: creation takes under thirty seconds, and
persisting anything would undermine the privacy position in ADR-004.

## 5. Input validation

One Zod schema in `lib/validation.ts`, applied as the attendee types.

```ts
const TEXT = /^[\p{L}\p{M}\p{N} .,'’&()\/-]+$/u;   // letters, marks, digits, light punctuation

export const badgeSchema = z.object({
  name:    z.string().trim().min(2).max(40).regex(TEXT).refine(notBlocked),
  role:    z.string().trim().max(40).regex(TEXT).refine(notBlocked).optional(),
  company: z.string().trim().max(40).regex(TEXT).refine(notBlocked).optional(),
});
```

`\p{L}\p{M}` accepts Arabic, accented Latin and other scripts while excluding emoji, symbols and
control characters. `notBlocked` applies a profanity and slur list for English and Arabic after
normalising diacritics and common leetspeak substitutions.

Validation is now purely a brand-safety and quality measure rather than a security boundary: with no
server, there is no route an attacker can hand-crafted input at. Someone determined can still edit
the canvas in their own browser — that is true of any client-side tool and is not worth engineering
against. The blocklist exists to stop *accidental* and casual misuse next to the Chapter's logo.

## 6. Sharing

| Context | Mechanism |
|---|---|
| **Desktop (primary)** | Download the image, copy the caption, open the LinkedIn composer. The attendee attaches the image and pastes the caption |
| **Mobile (convenience)** | `navigator.share({ files: [png], text: caption })` — the OS sheet passes the real image file to LinkedIn, WhatsApp or Instagram |
| Any | Copy caption independently, for people who prefer to post in their own words |

Feature-detect with `navigator.canShare?.({ files: [file] })`, never a user-agent string. Where it
is unsupported, the Share button is not rendered at all — an inert button is worse than no button.

> **Known constraint:** no web page can attach an image to a LinkedIn post on the attendee's behalf.
> LinkedIn's share endpoints accept a URL, not a file. This is a platform limitation, not a gap in
> the implementation, and it is the reason the desktop flow ends with a manual upload.

## 7. Photo pipeline (client only)

```
File input
  -> size guard (<=10 MB)
  -> createImageBitmap(file, { imageOrientation: 'from-image' })      // EXIF-correct
     └─ throws on HEIC in Chrome -> show errors.photoFormat
  -> downscale so the longest edge is <= 600 px
  -> user pan/zoom into the circular aperture
  -> drawImage under a circular clip on the badge canvas
  -> (never leaves the page — no fetch, no FormData, no storage)
```

Downscaling before compositing is what keeps the preview responsive: a modern phone photo is
~4000 px wide and redrawing it on every keystroke is the main cause of jank on mid-range Android.

## 8. Performance

- One client island; no server round-trips after the initial load.
- Fonts: 2 Latin weights + 1 Arabic, `woff2`, self-hosted, preloaded.
- Redraw is debounced to ~100 ms on keystroke and executed inside `requestAnimationFrame`.
- The decoded, downscaled `ImageBitmap` is held in state so the photo is decoded once, not per draw.
- Static export means the whole app is CDN-cacheable with no origin to saturate on the day the
  confirmation email goes out.

## 9. Counting

Aggregate counts only, no cookies, no third-party analytics (NFR-09, FR-10, ADR-010):
`badge_started`, `badge_completed`, `photo_added`, `download_image`, `share_native`,
`copy_caption`.

`track()` in `lib/analytics.ts` takes an event name and nothing else — the signature is narrow on
purpose, so a name or company cannot be attached to one even by accident. Calls are fire and
forget: badge creation never waits on the counter and never fails because of it.

Each event is stored as an empty blob keyed `<event>/<date>/<session>`, so totals are a count of
keys. That avoids the read-modify-write race a single shared integer would have when the
confirmation email goes out and many people arrive at once, dedupes repeat actions within a
session for free, and yields a per-day breakdown with no extra storage.

**Reading the numbers:** open the live site with `?stats=<key>`, where the key matches the
`STATS_KEY` environment variable in Netlify. Attendees see nothing; a wrong key is
indistinguishable from the feature being switched off.

Add `&from=YYYY-MM-DD` to exclude anything recorded before that date, which is how pre-launch
testing is kept out of the campaign figures. Filtering was chosen over a reset endpoint
deliberately: nothing is destructive, the numbers stay reproducible, and there is no route that
could wipe the counts by accident or by guessing.

## 10. Project layout

```
app/
  layout.tsx
  page.tsx                      # creator (server shell)
  privacy/page.tsx
  globals.css
components/
  BadgeForm.tsx                 # client — inputs + validation messages
  BadgeCanvas.tsx               # client — live preview, owns the canvas ref
  PhotoPicker.tsx               # client — file input, crop, remove
  ShareBar.tsx                  # client — download, share, copy caption
  EventFacts.tsx                # server — date, venue, PDUs
lib/
  badge-spec.ts                 # SINGLE SOURCE OF TRUTH for the artwork
  render/canvas.ts              # the renderer
  render/text.ts                # auto-fit, wrapping, Arabic run detection
  validation.ts                 # Zod schema + blocklist
  content.ts                    # every user-visible string
  event.ts                      # event facts, one place
  share.ts                      # Web Share API, download, clipboard
  photo.ts                      # decode, orient, downscale, crop
public/
  brand/                        # official logo SVGs — do not edit
  art/                          # share card, key visual when supplied
  fonts/
```

## 11. Testing

- **Unit (Vitest):** validation accept/reject tables; text auto-fit and wrapping maths; blocklist
  normalisation; initials derivation for the monogram.
- **Visual:** the fixture set in QA-CHECKLIST.md §2, compared against approved renders.
- **Manual:** the device matrix in QA-CHECKLIST.md §3 — especially the in-app browsers, where
  downloads and the Share API are least reliable.

The text auto-fit tests are the highest-value in the suite: long names are the most common way a
generated badge breaks, and it is the one failure that ships to social media unnoticed.
