# Product Requirements — Annual Gathering 2026 Attendee Badge

**Status:** Approved for build · **Version:** 1.0 · **Last updated:** 15 September 2026
**Owner:** PMI UAE Chapter Marketing · **Launch target:** 28 September 2026

---

## 1. Background

The PMI UAE Chapter Annual Gathering is the Chapter's flagship event. The 2026 edition runs on
Saturday 10 October at Le Méridien Dubai under the theme *"Growing in Unity: Leading AI-Driven and
Sustainable Projects for Tomorrow"*, is open to Chapter members only, and carries 6 PDUs.

Registration has opened and response is strong. When a member registers they receive a
confirmation email containing a QR code for check-in. After that email, nothing happens until the
event — the Chapter has the member's attention and does nothing with it.

Meanwhile the Chapter's reach depends almost entirely on its own channels (21k+ LinkedIn
followers). The most credible promotion for a professional event is a peer saying "I'll be there" —
and there is currently no easy way for a registrant to say that.

## 2. Opportunity

Give every registrant a one-tap way to announce their attendance with a branded, personalised card.

- **For the attendee:** professional visibility, a reason to post, and a way to find peers who are
  also attending.
- **For the Chapter:** organic reach into the networks of exactly the right audience, at zero media
  cost, plus a visual identity for the event that compounds each time it is posted.
- **For the event:** a clickable path from each post back to the registration page, while seats
  remain.

## 3. Goals and non-goals

### Goals

| # | Goal |
|---|---|
| G1 | Let any attendee produce a share-ready badge in under 30 seconds on a phone |
| G2 | Make sharing to LinkedIn genuinely one-tap on mobile, with the caption pre-filled |
| G3 | Make every shared badge a clickable route back to the event registration page |
| G4 | Protect the Chapter's brand: correct logo use, clean inputs, no credential confusion |
| G5 | Collect no personal data we do not need — ideally none at all |

### Non-goals

- Not a check-in system. The QR code in the confirmation email already does that.
- Not a credential, certificate, or PDU record.
- Not a CRM. We are not building a list of who made a badge.
- Not a general-purpose badge tool for all Chapter events (that is a post-launch consideration).

## 4. Success metrics

Measured from launch (28 Sep) to the day after the event (11 Oct), using aggregate, non-identifying
counters only.

| Metric | Definition | Target | Stretch |
|---|---|---|---|
| **M1 Activation** | Badges generated ÷ registrations | 35% | 50% |
| **M2 Share rate** | Share/download actions ÷ badges generated | 60% | 75% |
| **M3 Referral clicks** | Clicks on the event link carried in share captions | 150 | 400 |
| **M4 Attributed registrations** | Registrations with the badge UTM source | 25 | 60 |
| **M5 Completion** | Badge creations completed ÷ page visits | 55% | 70% |
| **M6 Photo attach rate** | Badges including a photo | 40% | — |

M1 is the headline number. If it lands under 20%, the problem is almost certainly distribution (the
email placement), not the product — check M5 before changing the app.

## 5. Users

| Persona | Context | What they need |
|---|---|---|
| **Registered member** (primary) | Opens the confirmation email on a phone, between other things. Mid-career project professional. Active on LinkedIn. | Speed. No signup. A badge that looks credible enough to put on a professional profile. |
| **Chapter board member / speaker** | Wants to promote their session and the event. Higher visibility, more scrutiny of how they appear. | The same flow, but the output must look polished enough for a senior profile. |
| **Curious non-registrant** | Sees a colleague's badge and clicks the link. Not yet registered. | To understand what the event is and how to register, within one screen. |
| **Chapter marketing lead** | Needs the campaign to work and the brand to be safe. | Confidence in brand handling, plus numbers to report to the board. |

## 6. User stories

Priority uses MoSCoW. Every story has acceptance criteria that QA can verify.

### Must have

**US-01 — Create a badge with my name**
*As a registered attendee, I want to enter my name and see my badge, so that I can share it.*
- Name is the only required field.
- The badge preview updates as I type, with no "generate" step needed to see it.
- Names of 2–40 characters are accepted, including Arabic script, accented Latin characters,
  hyphens and apostrophes.
- A name too long for one line is auto-fitted down to the minimum size in the design spec, then
  wrapped to a second line — never clipped or overflowing.

**US-02 — Add my role and company**
*As an attendee, I want to optionally add my job title and employer, so that the badge reads
professionally.*
- Both fields are clearly marked optional and may be left blank.
- With both blank, the badge layout stays balanced — it must not leave an obvious gap.
- Each field accepts up to 40 characters.

**US-03 — Add my photo**
*As an attendee, I want to attach a photo of myself, so that the badge is recognisably mine.*
- Accepts JPG, PNG, WebP and (where the browser can decode it) HEIC.
- The photo is cropped to the badge's portrait shape automatically, centred, without distortion.
- I can reposition or zoom the crop, and I can remove the photo.
- Photos up to 10 MB are accepted; larger files produce a clear error, not a hang.
- The photo is processed entirely in my browser and is never uploaded. The UI says so.
- If no photo is added, the badge shows a monogram of my initials, and still looks finished.

**US-04 — Download my badge**
*As an attendee, I want to save the badge image, so that I can post it wherever I like.*
- Downloads a JPEG at 1200×1200 (square).
- The filename is meaningful, e.g. `pmi-uae-annual-gathering-2026-badge.jpg`.
- Works on desktop Chrome, Safari, Edge and Firefox, and on mobile Safari and Chrome.

**US-05 — Share to social directly**
*As an attendee on my phone, I want to share the badge straight to LinkedIn or WhatsApp, so that I
don't have to download it and re-attach it.*
- Where the browser supports sharing files, a single "Share" button opens the native share sheet
  with the image attached and the caption pre-filled.
- Where it does not, the fallback is: download the image, copy the caption to the clipboard, and
  open the LinkedIn composer — with on-screen instructions saying what to do.
- Dedicated LinkedIn, WhatsApp and X buttons are available as well as the generic share.

**US-07 — Understand the event and register**
*As someone creating a badge, I want the event details and a way to reach registration.*
- The creator page states the event name, theme, date, venue, PDU count, and that it is open to
  Chapter members.
- A Register link points to the official event page with campaign tracking.
- The page makes clear the badge is an attendee card, not a certification.
- The pre-filled share caption includes the event link, so a shared badge still routes the
  attendee's network to registration.

**US-08 — Brand-safe inputs**
*As the Chapter, I want to prevent misuse, so that our logo never appears next to offensive text.*
- Inputs are length-limited and restricted to letters, marks, digits, spaces and a small set of
  punctuation. Emoji, URLs and control characters are rejected.
- A profanity and slur blocklist covering English and Arabic is applied on both the client and the
  image-rendering route.
- Rejected input produces a specific, human error message, not a silent failure.
- Validation runs on the OG image route too — that route is publicly reachable with any input.

### Should have

**US-09 — Story format** — A 1080×1920 version for Instagram/WhatsApp Stories, selectable before
download.
**US-10 — Choose my track** — Optionally show "AI" or "Sustainability" on the badge, matching the
track chosen at registration.
**US-11 — Countdown** — The creator page shows days remaining until the event, reinforcing urgency.
**US-12 — Copy caption** — A one-tap "Copy caption" button with the suggested post text and
hashtags, independent of the share buttons.

### Could have

**US-13 — Badge variants** — Distinct styling for Speaker, Volunteer and Board Member.
**US-14 — Arabic UI** — The interface itself (not just name input) available in Arabic.
**US-15 — "I attended" variant** — After the event, the badge flips to past tense for post-event
posts.

### Won't have (this release)

Per-badge shareable URLs (US-06, cut by ADR-008) · uploading photos to a server · accounts or
login · verifying the person actually registered · an admin dashboard · storing any badge record ·
sponsor logos · PDU claims on the badge.

## 7. Scope boundary

In scope for v1: **US-01 through US-05, US-07 through US-12.** Everything under *Could have* and *Won't have* is
explicitly out, and stays out until after launch, regardless of how small it looks mid-sprint.

The one decision to revisit only if it blocks launch: US-09 (story format) may drop to post-launch
without harming the core loop.

## 8. Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | The app is a public web page requiring no authentication |
| FR-02 | Name is required; role, company and photo are optional |
| FR-03 | Badge preview renders client-side and updates within 150 ms of a keystroke |
| FR-04 | Downloadable badge is JPEG (quality 0.98), 1200×1200, typically under 300 KB |
| FR-05 | Badge state lives only in the browser; no server-side record is created |
| FR-06 | The app page returns valid Open Graph and Twitter Card tags |
| FR-07 | All user input is validated against a Zod schema on every entry point |
| FR-08 | Photos are read, resized and composited entirely in the browser |
| FR-09 | Outbound links to the event page carry UTM parameters for attribution |
| FR-10 | Analytics events are aggregate counts with no personal data attached |

## 9. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Largest Contentful Paint on 4G mobile | < 2.0 s |
| NFR-02 | Badge image generation (client) | < 800 ms |
| NFR-04 | Accessibility | WCAG 2.1 AA |
| NFR-05 | Mobile-first — designed at 375 px, works to 320 px | No horizontal scroll |
| NFR-06 | Browser support | iOS Safari 16+, Chrome/Edge last 2, Firefox last 2, Samsung Internet |
| NFR-07 | Works in in-app browsers (LinkedIn, Instagram, Gmail) | Core flow functional |
| NFR-08 | Total JS transferred | < 250 KB gzipped |
| NFR-09 | No personal data stored at rest, anywhere | Zero |
| NFR-10 | Availability through the campaign window | 99.9% |

NFR-07 matters more than it looks: a large share of traffic arrives from a link tapped inside the
Gmail or LinkedIn app, whose embedded browsers have known gaps around downloads and the Share API.

## 10. Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Badge mistaken for a PMI credential | High | Medium | Copy rules in CLAUDE.md; "attendee card" framing; no certificate vocabulary |
| Offensive text rendered beside the logo | High | Low | Blocklist + charset restriction + length caps, enforced on the render route |
| Non-registrants generate badges | Low | High | Accepted. The badge claims intent to attend, not entitlement. Revisit only if abused |
| Low adoption because the email buries the link | High | Medium | Place the CTA above the fold in the confirmation email; also post from Chapter channels |
| HEIC photos fail on Android/Chrome | Medium | Medium | Feature-detect, clear error copy, suggest JPG/PNG |
| In-app browser blocks download | Medium | Medium | Web Share API primary; "open in browser" hint as fallback |
| Brand approval arrives late | High | Medium | Design sign-off is a Sprint 1 gate, not a launch-day task |
| Traffic spike after the email blast | Low | Medium | Static/edge rendering, no database to saturate |

## 11. Dependencies

- **Chapter brand approval** of the badge artwork before launch (owner: Marketing).
- **Confirmation email edit** to add the badge CTA — requires whoever administers the registration
  platform. This is on the critical path for M1; the app can launch without it, but will
  underperform.
- **Domain / subdomain** decision and DNS access — see DECISIONS.md OQ-2.
- **Event key visual** source files (the green AI/sustainability artwork) at print resolution.
- **Logo assets** — already in hand, at `../PMI UAE Chapter Logo/`.

## 12. Launch plan

| Date | Milestone |
|---|---|
| Tue 15 Sep | Requirements complete |
| Wed 23 Sep | Feature complete, internal preview link |
| Thu 24–Fri 25 Sep | QA, accessibility pass, brand sign-off |
| Mon 28 Sep | Soft launch — Chapter board and volunteers post first |
| Tue 29 Sep | Confirmation email updated; announcement from Chapter LinkedIn |
| Sat 10 Oct | Event day — badge link in on-screen holding slides |
| Sun 11 Oct | Post-event review against §4 metrics |

## 13. Open questions

Tracked with owners in [DECISIONS.md](DECISIONS.md) §Open questions. The three that affect build
order are the hosting choice, the domain, and whether the confirmation email can be edited in time.
