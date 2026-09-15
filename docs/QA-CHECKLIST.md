# QA Checklist

**Version:** 1.0 · **Last updated:** 15 September 2026

The gate for AGB-051 and the pre-launch sign-off. Everything here is verified by hand on real
devices — the failure modes in this product (share sheets, in-app browsers, HEIC photos, Arabic
shaping) are precisely the ones automated tests do not catch.

---

## 1. Functional

### Badge creation
- [ ] Preview appears as soon as a valid name is typed, with no explicit generate step
- [ ] Preview updates within about 150 ms of a keystroke, with no flicker
- [ ] Role and company are clearly optional and can be left blank
- [ ] A name-only badge is visually balanced — no obvious gap where role and company would be
- [ ] Leading and trailing whitespace is trimmed and does not shift the layout
- [ ] Clearing the name returns the empty state, not a broken badge

### Photo
- [ ] JPG, PNG and WebP all load
- [ ] A portrait photo taken on an iPhone appears upright (EXIF handled)
- [ ] A landscape photo is centre-cropped without distortion
- [ ] A HEIC photo works in Safari, and in Chrome shows `errors.photoFormat` rather than hanging
- [ ] A file over 10 MB shows `errors.photoSize`
- [ ] Dragging the photo on the badge moves it, and the cursor shows a grab handle
- [ ] Dragging stops at the edge of the photo — no gap ever appears inside the circle
- [ ] Zooming out after panning re-clamps the position rather than leaving a gap
- [ ] Recentre appears once the photo has been moved, and restores the default framing
- [ ] Arrow keys nudge the photo when the preview has focus
- [ ] On a square photo at zoom 1 the copy explains that zooming is needed before it will move
- [ ] Dragging the photo on a phone does not scroll the page
- [ ] The adjusted crop is reflected in the exported image
- [ ] Remove restores the monogram, and the monogram shows correct initials
- [ ] A single-word name produces a one-letter monogram, not a crash
- [ ] The "stays on your device" reassurance is visible before the file picker is opened
- [ ] Network tab confirms **no request carries image data** at any point

### Validation
- [ ] Empty name blocks submission with `errors.nameRequired`
- [ ] A one-character name is rejected; two characters accepted
- [ ] A 41-character entry is rejected or capped, with the reason shown
- [ ] Emoji are rejected with `errors.charset`
- [ ] A URL pasted into the name is rejected
- [ ] Blocklisted words are rejected in English **and** Arabic
- [ ] Blocklist survives simple evasion: spacing, diacritics, leetspeak substitutions
- [ ] Accented Latin (`José Müller`) and Arabic (`عائشة`) names are **accepted**
- [ ] Every rejection produces a specific message, never a silent no-op

### Download and share
- [ ] Download produces a 1200×1200 JPEG (~260 KB) with the expected `.jpg` filename
- [ ] The downloaded image is identical to the preview, fonts included — no fallback-font flash
- [ ] The downloaded image uploads cleanly to LinkedIn and renders sharp in the feed
- [ ] The three-step "how to post it" instructions are visible without scrolling past the buttons
- [ ] Copy caption works and confirms visually; the caption contains the event link
- [ ] Where the clipboard is unavailable, the caption is selectable and `errors.clipboard` shows
- [ ] On iOS Safari, Share opens the native sheet with the image attached
- [ ] On Android Chrome, the same
- [ ] Sharing to LinkedIn from the sheet carries the image through
- [ ] On desktop, the Share button is **not rendered** — no inert control
- [ ] Composer links open with the caption pre-filled
- [ ] Event facts on the page match `lib/event.ts`
- [ ] Register link reaches the event page with UTM parameters intact

## 2. Visual fixtures

Generate each and compare against the approved renders. These are the cases that break layouts.

| # | Name | Role | Company | Photo | Checking |
|---|---|---|---|---|---|
| 1 | `Ali Khan` | — | — | No | Shortest case; monogram; rebalanced layout |
| 2 | `Aysha Al Maktoum` | `PMO Lead` | `Emirates Group` | Yes | The typical case |
| 3 | `Mohammed Abdul Rahman Al Maktoum` | `Senior Programme Delivery Manager` | `Dubai Electricity and Water Authority` | Yes | Everything at maximum length |
| 4 | `عائشة عبد الرحمن المكتوم` | `مدير مشروع` | — | Yes | Arabic shaping and RTL run |
| 5 | `José Müller-Sánchez` | `Head of PMO` | `Siemens Energy` | No | Diacritics and hyphenation |
| 6 | `Xu Li` | `PM` | `CSCEC` | Yes | Very short values, no awkward spacing |
| 7 | 40-character single word | — | — | No | Truncation path |
| 8 | `Sara O'Brien` | `Consultant` | `PwC` | Yes | Apostrophe renders, not an escape artefact |

For each: the square JPEG, and the story format if AGB-056 shipped.

## 3. Device matrix

| Device / browser | Priority | Create | Photo | Share sheet | Download |
|---|---|---|---|---|---|
| iPhone, Safari (iOS 17+) | **Critical** | | | | |
| iPhone, Safari (iOS 16) | High | | | | |
| Android, Chrome | **Critical** | | | | |
| Android, Samsung Internet | Medium | | | | |
| **LinkedIn in-app browser (iOS)** | **Critical** | | | | |
| **LinkedIn in-app browser (Android)** | **Critical** | | | | |
| Gmail in-app browser (iOS) | High | | | | |
| Instagram in-app browser | Medium | | | | |
| macOS Safari | High | | | | |
| Windows Chrome | High | | | | |
| Windows Edge | Medium | | | | |
| Firefox (desktop) | Medium | | | | |
| iPad Safari | Low | | | | |

The in-app browsers are marked critical for a reason: most attendees will tap the link inside the
Gmail or LinkedIn app, and those embedded browsers have real gaps around downloads and
`navigator.share`. If the core flow fails there, it fails for the majority of real traffic.

## 4. Upload dry run

Per-badge link previews were removed by ADR-008, so what matters now is that the downloaded file
actually posts well. On each critical platform in §3: create a badge, download it, and post it to a
private or draft LinkedIn post.

- [ ] The file downloads without a browser warning
- [ ] LinkedIn accepts it without complaint about dimensions or size
- [ ] The badge renders sharp in the feed, not visibly recompressed
- [ ] Text is legible at LinkedIn's feed thumbnail size, not only when opened full-screen
- [ ] The same, posted from the LinkedIn mobile app after a mobile download

The legibility check is the one that matters most: a badge that reads well at 1200 px and turns to
mush in a feed thumbnail has failed at its only job.

## 5. Accessibility (NFR-04)

- [ ] The whole flow is completable with keyboard only
- [ ] Visible focus indicator on every interactive element
- [ ] Every input has a programmatically associated label
- [ ] Errors are announced via `aria-live="polite"`
- [ ] The preview canvas carries a descriptive `aria-label` that updates with the content
- [ ] Text contrast ≥ 4.5:1 throughout the interface **and** on the badge artwork
- [ ] Nothing is signalled by colour alone
- [ ] Touch targets ≥ 48 px
- [ ] `prefers-reduced-motion` suppresses the countdown animation and preview cross-fade
- [ ] Page zoom to 200% produces no loss of content or function
- [ ] Automated axe scan: zero violations

## 6. Performance (NFR-01, 02, 08)

- [ ] Lighthouse mobile: performance ≥ 90, accessibility 100, best practices ≥ 95
- [ ] LCP under 2.0 s on simulated 4G
- [ ] Badge render under 800 ms on a mid-range Android
- [ ] JS under 250 KB gzipped
- [ ] Fonts preloaded; no layout shift as they load

## 7. Content and brand

- [ ] No instance anywhere of *certificate, credential, verified, earned, awarded, PDU* referring to the badge
- [ ] The disclaimer is visible on the creator page
- [ ] Logo uses the approved inverted file, with correct clear space, never recoloured or stretched
- [ ] All event facts match the event page: date, venue, times, theme, PDU count, members-only
- [ ] Every string matches docs/CONTENT.md
- [ ] Marketing sign-off received in writing (AGB-055)

## 8. Counting and privacy

- [ ] No cookies are set at all
- [ ] No request anywhere carries a photo
- [ ] **Inspect every `/api/event` request body: it must contain only an event name and a random
      session id.** No name, role or company, in any field
- [ ] Counting failing (block `/api/event` in devtools) does not break or slow badge creation
- [ ] `/?stats=<key>` shows the numbers; a wrong key shows nothing, same as no key
- [ ] `/api/stats` returns 404 without the key
- [ ] Attendees see no trace of the counts anywhere in the normal flow
- [ ] `/privacy` matches docs/PRIVACY.md and is linked from the creator page
