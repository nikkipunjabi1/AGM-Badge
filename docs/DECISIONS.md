# Decisions and Open Questions

**Last updated:** 15 September 2026

---

## Architecture decision records

### ADR-001 — The badge link is the primary share mechanism, not the image

**Status:** ~~Accepted~~ **Superseded by ADR-008** · **Date:** 15 Sep 2026

**Context.** The obvious build is "generate a PNG, let people download it". On mobile that works
well. On desktop it means download → open LinkedIn → write a caption → attach the file, and most
people abandon somewhere in that chain.

**Decision.** Every badge gets its own URL whose Open Graph image *is* the badge. Sharing the link
produces a visual post in one action, and the destination page carries a Register CTA.

**Consequences.** We need a server-rendered OG image route, which is why this is a Next.js app and
not a static page. The badge page also becomes a genuine acquisition surface — the only part of
this project that converts non-registrants. The image download remains, because on mobile the
native share sheet with a real file is still the better experience.

---

### ADR-002 — No database, no accounts; state lives in the URL

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** A badge needs name, optional role, optional company. That is about 100 bytes.

**Decision.** Encode it into a base64url path segment. No storage of any kind.

**Consequences.** Links never expire. There is no attendee list to secure, leak, or handle under
UAE PDPL. Hosting is effectively free and cannot be saturated by a traffic spike. In exchange we
cannot report *who* made badges — only how many — and anyone can hand-craft a payload, which makes
strict validation on the render route mandatory (ADR-003).

---

### ADR-003 — Validate identically on the form and on the image route

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** The OG image route is publicly reachable with arbitrary input, and it draws that input
next to the PMI logo.

**Decision.** One Zod schema, enforced at both entry points, plus a normalised profanity/slur
blocklist for English and Arabic. Invalid input renders a neutral event-only card and returns 200.

**Consequences.** Someone probing the route gets a plausible card rather than an error, which
reveals nothing. A 500 would both look broken to legitimate sharers and confirm to an abuser that
their input reached the renderer.

---

### ADR-004 — Photos are processed in the browser and never uploaded

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** Attendees want their face on the badge. The conventional approach uploads the photo to
object storage so the server can composite it.

**Decision.** Decode, orient, crop and composite entirely client-side. No upload endpoint exists.

**Consequences.** We store no biometric-adjacent personal data, need no moderation pipeline for
images, and can say plainly in the UI that the photo never leaves the device — which measurably
increases the number of people who attach one. The cost: the link-preview card cannot show the
photo, because the server has never seen it, so it shows an initials monogram instead. We judged
that a good trade. Revisiting this means revisiting the privacy notice, storage, moderation and
cost all at once — it is not a small change.

---

### ADR-005 — Two renderers, one specification

**Status:** ~~Accepted~~ **Superseded by ADR-008** (there is now only one renderer) · **Date:** 15 Sep 2026

**Context.** ADR-004 means the client has the photo and the server does not, so a single renderer
is impossible.

**Decision.** A canvas renderer on the client and a Satori renderer at the edge, both importing all
geometry and colour from `lib/badge-spec.ts`.

**Consequences.** Visual drift between the two is the most likely class of bug in this codebase.
Mitigated by the shared spec module and by a review rule: a visual change touching only one
renderer is presumed to be a bug.

---

### ADR-006 — Open to anyone; no registration check

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** Only members can attend, so in principle only registrants should get a badge. Gating
would require integrating with the registration platform.

**Decision.** Anyone can make a badge. The badge asserts intent to attend, not entitlement.

**Consequences.** A non-registrant could post one. The realistic downside is negligible — the badge
promotes the event either way, and the page it links to sells registration. Gating, by contrast,
would cost integration work we do not have time for and would add friction to the main flow.
Revisit only if actual misuse appears.

---

### ADR-007 — Next.js on Vercel

**Status:** ~~Accepted~~ **Overtaken by events** — the site is deployed on Netlify (see ADR-010
and DEPLOYMENT.md). The reasoning below still holds; the static export made the host a smaller
decision than it first appeared. · **Date:** 15 Sep 2026

**Context.** The brief allows Netlify or Vercel. The one genuinely server-side requirement is the
OG image.

**Decision.** Next.js App Router, deployed to Vercel, using `next/og` for image generation.

**Consequences.** `next/og` is first-party on Vercel with no extra configuration. Netlify remains
viable via `og_edge` in an edge function — documented in DEPLOYMENT.md §4 — so this is reversible
in roughly half a day if the Chapter's hosting arrangements require it.

---

### ADR-008 — No per-badge URLs; the app is a static client-side tool

**Status:** Accepted · **Date:** 15 Sep 2026 · **Supersedes:** ADR-001, ADR-005

**Context.** ADR-001 gave every badge its own URL so that pasting the link into LinkedIn would
unfurl the artwork. Reviewing scope, the Chapter judged the per-badge link unnecessary complexity
for the value it returns.

**Decision.** Drop the `/b/<payload>` route and its Open Graph image route. The app is a single
client-side page that renders a badge and hands the attendee the image. Sharing is by image, not by
link.

**Consequences.**

*Gained:* no edge functions, no Satori renderer, no payload encoding, and no risk of visual drift
between two renderers — the single largest source of bugs in the previous design is gone entirely.
The app becomes a static export that deploys to Netlify or Vercel with no configuration, and the
hand-crafted-payload attack surface disappears with it. Roughly 12 story points leave Sprint 1.

*Lost:* the desktop share path is weaker. On desktop the attendee must download the PNG and attach
it to their post by hand, because no web page can attach an image to a LinkedIn composer and there
is now no link for LinkedIn to unfurl into a visual card. Mobile is unaffected — the native share
sheet passes the real image file to LinkedIn or WhatsApp directly, which is the better experience
and the majority of expected traffic.

*Mitigation:* the share caption now carries the event registration URL, so a shared badge still
routes people to registration even without a badge page. PRD metrics M3 and M4 are measured from
that caption link instead of from a badge page.

**Reversible?** Yes, but not cheaply — reinstating it means restoring the payload format, a server
runtime, and a second renderer. Treat it as a v2 decision, not a mid-sprint one.

---

### ADR-009 — The downloaded badge is JPEG, not PNG

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** PNG was the obvious default. Measured on a finished badge at 1200×1200, the formats
came out at: PNG 1,174 KB · JPEG q0.98 262 KB · JPEG q0.95 175 KB · WebP q0.95 73 KB. The badge is a
smooth gradient composition containing a photograph, which is close to the worst case for PNG.

**Decision.** Export JPEG at quality 0.98.

**Consequences.** The file is 4.5× smaller with no loss visible on text edges, which matters most on
mobile data where the attendee is uploading it straight to LinkedIn. JPEG is accepted everywhere
without question. WebP would be smaller again, but LinkedIn's uploader has been inconsistent with
it, and a file the attendee cannot post is worth far less than the bytes saved. The badge is fully
opaque, so losing PNG's alpha channel costs nothing.


---

### ADR-010 — Count badges with Netlify Functions and Blobs; never record who

**Status:** Accepted · **Date:** 15 Sep 2026

**Context.** The Chapter needs to report how many badges were created (PRD M1) and had
nowhere storing that number. A static site cannot keep a shared counter: the code runs in each
attendee's browser, and `localStorage` only ever knows about one device.

Recording attendees' *names* to a spreadsheet was considered and deliberately rejected. It would
have made the promise on /privacy false, and would have put the Chapter in scope for the UAE PDPL:
a lawful basis, a retention period, and handling access and deletion requests, all inside three
weeks and with no one owning it after the event.

**Decision.** Two Netlify Functions alongside the static export: `/api/event` records that
something happened, `/api/stats` reports the totals to whoever holds the key. State lives in
Netlify Blobs. **No name, role, company or photo is ever sent to either endpoint.**

**How counting works.** Each event is an empty blob keyed `<event>/<date>/<session>`, and totals
are a count of keys. Two properties fall out of that shape:

- *No lost counts.* A single shared integer would need read-modify-write, and simultaneous
  visitors — exactly what happens when the confirmation email goes out — would overwrite each
  other. Distinct keys cannot collide.
- *Free deduplication and a daily trend.* Writing a key is idempotent, so a session that downloads
  twice counts once, and the date sits in the key, so per-day figures need no extra storage.

The session id is a random value used only for that deduplication. It is not derived from anything
about the attendee, is never linked to what they typed, and is discarded when the tab closes.

**Consequences.** The app is no longer purely static, which is a real change to ADR-002 and
ADR-008 — but a narrow one: the endpoints handle counts and nothing else, and badge creation never
waits on them or fails because of them. Counts are of browser sessions rather than verified people,
so the number is an estimate and should be reported as one. `/api/stats` is gated on a key in the
query string, which is obscurity, not authentication; that is proportionate for anonymous totals
and would not be for anything personal.

**Excluding test runs.** `/api/stats` takes an optional `from=YYYY-MM-DD` and ignores earlier
dates, so pre-launch testing stays out of the campaign figures. That is why there is no reset: a
filter destroys nothing, keeps the numbers reproducible, and leaves no endpoint that could wipe
the counts by accident or by someone guessing the key.

**The boundary to hold.** If a future change wants to attach a name, an email, or any identifier to
an event, that is not an extension of this decision. It is the decision this ADR rejected, and it
needs the privacy notice rewritten first.


---

## Open questions

Each needs an owner and a date. The first three affect build order.

| ID | Question | Impact | Owner | Needed by |
|---|---|---|---|---|
| **OQ-3** | Can the registration confirmation email be edited, and by whom? | Highest-leverage item in the plan (PRD M1) | Registration platform admin | Wed 23 Sep |
| **OQ-4** | Can we get the Annual Gathering key visual as a layered source file, so the badge uses the real artwork rather than a sampled recreation? | Badge quality | Marketing / designer | Thu 17 Sep |
| **OQ-5** | What is the Chapter's licensed brand typeface? Current spec uses an open-licence substitute. | Cosmetic, swappable late | Marketing | Fri 25 Sep |
| **OQ-8** | Who owns the app after the event — is it archived, or generalised for future Chapter events? | Post-launch | Chapter board | Sun 11 Oct |

### Resolved

| ID | Question | Resolution | Date |
|---|---|---|---|
| **OQ-9** | Analytics platform? | Neither. Counts are kept in Netlify Blobs by the Chapter's own endpoints, so no third-party analytics and no cookies (ADR-010) | 15 Sep 2026 |
| **OQ-2** | Hosting and domain? | Deployed on Netlify at `pmiuae-agm2026.netlify.app`; `main` auto-deploys. A custom domain is still open | 15 Sep 2026 |
| **OQ-1** | Canonical event page URL for the Register CTA? | `https://pmiuae.org/events/upcoming-events/general-events/pmi-uae-chapter-annual-gathering-meeting-2026` | 15 Sep 2026 |
| **OQ-6** | Which Chapter logo lockup? | **UAE Chapter** horizontal lockup — matches the naming on the event page and the announcement | 15 Sep 2026 |
| **OQ-7** | Show the attendee's chosen track on the badge? | **No, not in v1.** The badge already carries name, role, company and photo; the track is self-declared here and could contradict the actual registration. The payload keeps its optional `t` field so it can be enabled later without breaking existing links | 15 Sep 2026 |

### Recommended defaults if an answer does not arrive

So that no question blocks the build:

- **OQ-4:** rebuild the background from the event artwork at the resolution we have, accepting some
  quality loss on the gradient.
