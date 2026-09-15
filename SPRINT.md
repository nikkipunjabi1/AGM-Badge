# Delivery Plan

**Launch target:** Monday 28 September 2026 · **Event:** Saturday 10 October 2026
**Working week:** Monday–Friday · **Today:** Tuesday 15 September 2026

Thirteen working days to launch, twelve days of promotion after it. The schedule is tight but not
heroic, provided scope holds. The single biggest risk to this plan is scope creep from the
*Could have* list in [docs/PRD.md](docs/PRD.md) §6 — those items are not negotiable mid-sprint.

## Status — 15 September 2026

Sprint 0 is complete and a large part of Sprint 1 landed with it. What works today, verified in the
browser rather than inferred from the code:

**Done**
- AGB-001 – AGB-007: scaffold, repo, brand assets, self-hosted fonts, `event.ts`, `content.ts`,
  `badge-spec.ts`
- AGB-010 – AGB-014: canvas renderer, text auto-fit, Arabic shaping and RTL, monogram fallback,
  sparse-layout rebalancing
- AGB-020 – AGB-024: Zod schema and blocklist, live form, photo decode/orient/downscale/crop,
  drag-to-reposition with zoom and recentre, HEIC failure path
- AGB-034 – AGB-037: download (primary), native share on mobile only, copy caption, composer links,
  event facts and Register link
- AGB-043: privacy page

**Verified in browser:** long names auto-fit to one line; Arabic renders correctly shaped and RTL;
photos land upright and centre-cropped; export is 1200×1200 JPEG at ~240 KB; mobile layout keeps the
form reachable; no console errors.

**Two bugs found and fixed during verification**
- `parseFloat(ctx.font)` returned the font *weight* rather than the pixel size, making the
  "I'M ATTENDING" letter-spacing roughly twenty times too wide and pushing it off both edges of the
  badge. Regression test added.
- `fitText` returned a single unbreakable word un-truncated, which would have overflowed the badge.
  Caught by a unit test, fixed in the renderer.

**Still open**
- AGB-042 analytics is a no-op pending OQ-9
- AGB-056 story format: spec'd in `badge-spec.ts` as `STORY`, not yet wired to the UI
- The app share card (`public/art/share-card.png`) is blocked on OQ-4
- All of Sprint 2

---

## Schedule

| Sprint | Dates | Working days | Outcome |
|---|---|---|---|
| **Sprint 0 — Foundations** | Tue 15 – Wed 16 Sep | 2 | Repo, stack, assets, deploys on every push |
| **Sprint 1 — Badge engine** | Thu 17 – Wed 23 Sep | 5 | Feature complete: create, photo, share, link |
| **Sprint 2 — Polish & QA** | Thu 24 – Fri 25 Sep | 2 | Accessibility, device matrix, brand sign-off |
| **Launch** | Mon 28 – Tue 29 Sep | 2 | Soft launch, then email + Chapter announcement |
| **Run** | Wed 30 Sep – Sat 10 Oct | — | Monitor, hotfix only |
| **Review** | Sun 11 Oct | — | Metrics against PRD §4 |

### Gates

Each gate must pass before the next sprint starts. A gate that slips is escalated the same day, not
absorbed quietly.

- **End of Sprint 0:** a deployed URL exists and renders a hard-coded badge.
- **End of Sprint 1:** an attendee can complete the full flow on a real phone.
- **End of Sprint 2:** brand sign-off received in writing; QA checklist green.

---

## Sprint 0 — Foundations (Tue 15 – Wed 16 Sep)

**Goal:** everything that is not the badge itself, out of the way.

| ID | Task | Est | Acceptance |
|---|---|---|---|
| AGB-001 | Next.js + TypeScript + Tailwind scaffold; strict mode on | 2 | `npm run dev`, `build`, `typecheck`, `lint` all clean |
| AGB-002 | Git repo, `.gitignore`, first commit, remote pushed | 1 | Repo exists with docs committed |
| AGB-003 | Vercel project connected; preview deploy on every push | 2 | Pushing a branch produces a preview URL |
| AGB-004 | Copy logo SVGs into `public/brand/`; export event key visual to `public/art/` at 1200² / 1200×630 / 1080×1920 | 2 | Assets load locally, correct dimensions, WebP under 300 KB each |
| AGB-005 | Self-host Poppins, Inter, IBM Plex Sans Arabic (woff2) | 2 | Fonts render; no fallback-font flash in the exported PNG |
| AGB-006 | `lib/event.ts` and `lib/content.ts` from docs/CONTENT.md | 1 | No event fact or UI string literal anywhere else |
| AGB-007 | `lib/badge-spec.ts` from docs/DESIGN-SPEC.md | 2 | Every token in the spec present and typed `as const` |

**Total: 12 points.**

---

## Sprint 1 — Badge engine (Thu 17 – Wed 23 Sep)

**Goal:** the whole loop works end to end on a phone.

### Core rendering

| ID | Task | Est | Acceptance | Story |
|---|---|---|---|---|
| AGB-010 | Canvas renderer: background, scrim, logo, event lockup | 5 | 1200² PNG matches the spec layout | US-01 |
| AGB-011 | Text rendering with auto-fit + two-line wrap | 5 | All §6 fixtures render without overflow or clipping | US-01 |
| AGB-012 | Arabic text run detection, font switch, RTL | 3 | `عائشة عبد الرحمن المكتوم` renders correctly shaped | US-01 |
| AGB-013 | Monogram fallback medallion | 2 | Initials derived correctly incl. single-word names | US-03 |
| AGB-014 | Rebalance layout when role/company are blank | 2 | Name-only badge is visually centred | US-02 |

### Form and photo

| ID | Task | Est | Acceptance | Story |
|---|---|---|---|---|
| AGB-020 | Zod schema + blocklist; inline field errors | 3 | Accept/reject table in tests passes fully | US-08 |
| AGB-021 | Form UI with live preview, debounced redraw | 3 | Preview updates within 150 ms of typing | US-01 |
| AGB-022 | Photo picker: decode, EXIF orient, downscale, circular crop | 5 | Portrait iPhone photo lands upright and centred | US-03 |
| AGB-023 | Photo reposition: drag on the badge, zoom slider, recentre, remove | 3 | Crop adjustable by drag, keyboard and slider; pan clamped so the aperture is always covered; remove restores monogram | US-03 |
| AGB-024 | HEIC failure path with the specific error message | 2 | Chrome + HEIC shows `errors.photoFormat`, never hangs | US-03 |

### Share and download

| ID | Task | Est | Acceptance | Story |
|---|---|---|---|---|
| AGB-035 | Download image with meaningful filename — **the primary action** | 3 | Works on all NFR-06 browsers incl. in-app browsers | US-04 |
| AGB-034 | Web Share API with file on mobile; button hidden where unsupported | 4 | iOS + Android hand the image to LinkedIn; never renders an inert button | US-05 |
| AGB-036 | Copy caption, and LinkedIn / WhatsApp / X composer links | 3 | Caption copies reliably; each composer opens with the right text and event link | US-05, US-12 |
| AGB-037 | Event facts + Register link on the creator page | 2 | Link carries UTM; copy matches CONTENT.md | US-07 |

### Supporting

| ID | Task | Est | Acceptance | Story |
|---|---|---|---|---|
| AGB-040 | Countdown to the event on the creator page | 2 | Correct in GST; respects `prefers-reduced-motion` | US-11 |
| AGB-042 | Analytics events, aggregate only | 2 | All seven events fire; no PII in any event | FR-10 |
| AGB-043 | Privacy page + footnote disclaimer | 1 | Matches docs/PRIVACY.md verbatim | G5 |

**Total: 48 points.** *(AGB-041 cut by OQ-7; AGB-030–033 cut by ADR-008.)* This is the sprint that decides the launch date.

---

## Sprint 2 — Polish and QA (Thu 24 – Fri 25 Sep)

| ID | Task | Est | Acceptance |
|---|---|---|---|
| AGB-050 | Accessibility pass to WCAG 2.1 AA | 3 | Keyboard-only completion; contrast verified; canvas `aria-label` live |
| AGB-051 | Device matrix testing | 5 | QA-CHECKLIST §3 fully green, including in-app browsers |
| AGB-052 | Upload-to-LinkedIn dry run: download on each platform, then post | 2 | Image uploads cleanly and renders sharp in the LinkedIn feed |
| AGB-053 | Performance pass against NFR-01/02/08 | 3 | Lighthouse mobile ≥ 90 performance, 100 accessibility |
| AGB-054 | Error and empty states; offline behaviour | 2 | No dead ends; every failure has readable copy |
| AGB-055 | Brand sign-off from Marketing | — | Written approval of artwork and logo use |
| AGB-056 | Story format 1080×1920 *(drop first if time is short)* | 3 | Renders per spec §5 |

**Total: 18 points.**

---

## Launch (Mon 28 – Tue 29 Sep)

| ID | Task | Owner | Acceptance |
|---|---|---|---|
| AGB-060 | Production domain + DNS | Chapter / IT | Final URL live over HTTPS |
| AGB-061 | Soft launch to board and volunteers | Marketing | ≥ 10 badges created, feedback gathered |
| AGB-062 | Confirmation email updated with the badge CTA | Registration platform admin | CTA above the fold, UTM tagged |
| AGB-063 | Chapter LinkedIn announcement | Marketing | Published, using docs/CONTENT.md §5 |
| AGB-064 | Monitoring on, dashboard shared | Dev | PRD §4 metrics visible to Marketing |

AGB-062 is the highest-leverage task in the entire project and depends on someone outside the build
team. Confirm the owner **now**, not on 28 September.

---

## Backlog — post-launch

Not in v1. Listed so good ideas are captured rather than absorbed.

| Item | Story | Notes |
|---|---|---|
| "I attended" past-tense variant | US-15 | Highest value of these — flip on 11 Oct while the event is fresh |
| Speaker / Volunteer / Board variants | US-13 | Needs a way to authorise who gets one |
| Arabic interface | US-14 | Name input already supports Arabic; this is the UI chrome |
| Per-badge shareable URLs | US-06 | Cut by ADR-008; would restore the one-tap desktop share |
| Photo on a link-preview card | — | Requires both ADR-008 and ADR-004 to be revisited |
| Reusable generator for all Chapter events | — | Generalise `event.ts` and the artwork layer |
| Sponsor-branded variants | — | Commercial conversation first |
| Track chip on the badge | US-10 | Cut from v1 by OQ-7 |

---

## Estimation note

Points are relative, roughly one point ≈ half a day for one developer. Sprint 1 at 62 points is
full for a single developer across five days and assumes no significant rework in the canvas
renderer. If AGB-010/011 slip past Friday 19 September, drop AGB-056 before
touching the launch date — the crop adjuster is the most droppable feature that still leaves the
photo working.
