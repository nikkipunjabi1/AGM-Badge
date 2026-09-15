# PMI UAE Chapter — Annual Gathering 2026 Attendee Badge

A lightweight web app that lets a registered attendee of the **PMI UAE Chapter Annual Gathering
Meeting 2026** create a personalised "I'm attending" card in under 30 seconds and share it to
LinkedIn, WhatsApp, Instagram or X.

> **This is not a credential.** It is a promotional attendee card. It does not certify membership,
> attendance, or PDUs. See [Positioning](#positioning) below — this constraint drives several
> design decisions.

---

## The problem it solves

Today the registration confirmation email is a dead end. The member registers, gets a QR code, and
nothing else happens until the day of the event. Every one of those registrations is a project
professional with a LinkedIn audience of peers — precisely the audience the Chapter wants to reach.

This app turns the confirmation email into a distribution channel: one tap, a badge with the
member's name and photo, and a pre-written caption pointing back at the event page.

## What it does

1. Attendee opens the link from their confirmation email (or a Chapter social post).
2. They enter their **name** (required), and optionally **role**, **company**, and a **photo**.
3. A badge renders live as they type, on the Annual Gathering key visual.
4. They download the image and upload it to LinkedIn with the pre-written caption, which they can
   copy in one tap.
5. On mobile, they can skip the download entirely — the native share sheet hands the image straight
   to LinkedIn or WhatsApp.

The share caption carries the event registration link, so every post routes the attendee's network
back to registration.

## Event at a glance

| | |
|---|---|
| **Event** | PMI UAE Chapter Annual Gathering Meeting 2026 |
| **Theme** | Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow |
| **Date** | Saturday, 10 October 2026, 08:00–17:00 GST |
| **Venue** | Le Méridien Dubai |
| **Audience** | PMI UAE Chapter members only, registration required |
| **PDUs** | 6 |
| **Tracks** | AI *or* Sustainability (attendee picks one at registration) |

## Positioning

PMI issues genuine digital badges through Credly for certifications such as PMP. If this artefact
looks or reads like one of those, it creates brand confusion the Chapter has to clean up later.

**Therefore, everywhere in the product and this repo:**

- Call it an **attendee card** or **badge for attendees**, framed as "I'm attending".
- Never use the words *certificate*, *credential*, *verified*, *earned*, *awarded*, or *PDU* on the
  artwork or in share copy.
- The artwork carries the Chapter logo, so input validation and profanity filtering are a
  brand-safety requirement, not a nice-to-have.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript, static export | Familiar tooling; ships as plain static files |
| Styling | Tailwind CSS | Fast, and the badge tokens live in one config |
| Badge rendering | Canvas 2D in the browser | Full control, supports the attendee photo, never uploads it |
| Storage | **None** | Nothing is persisted anywhere; photos never leave the device |
| Hosting | Vercel (recommended) or Netlify | See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

There is no database, no login and no server runtime — the whole thing is static files. That is a
deliberate design decision; see [docs/DECISIONS.md](docs/DECISIONS.md) ADR-002 and ADR-008.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

### Other commands

```bash
npm run build && npm run start
```

```bash
npm run lint && npm run typecheck && npm run test
```

## Documentation map

Read these in order if you are new to the project:

| Document | What's in it |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Goals, success metrics, user stories, scope boundaries |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Routes, the canvas renderer, photo pipeline, validation |
| [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) | Brand tokens, badge layouts, typography, logo rules |
| [docs/CONTENT.md](docs/CONTENT.md) | Every string in the product, plus share captions and the email snippet |
| [docs/PRIVACY.md](docs/PRIVACY.md) | What we collect (almost nothing) and the notice text |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel and Netlify paths, env vars, domain |
| [docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md) | Device matrix and the pre-launch gate |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision records and open questions |
| [SPRINT.md](SPRINT.md) | The delivery plan and ticket backlog |
| [CLAUDE.md](CLAUDE.md) | Conventions for AI-assisted work in this repo |

## Status

Working application. Sprint 0 complete and most of Sprint 1 landed — an attendee can create a badge
with a name, photo, role and company, and download it. See [SPRINT.md](SPRINT.md) for exactly what
is done and what is outstanding.

Target launch: **Monday 28 September 2026** — 12 days before the event.

## Licence and assets

Chapter-internal project. The PMI and PMI UAE Chapter marks in `public/brand/` are the property of
Project Management Institute and are used here under Chapter authorisation for Chapter
communications. Do not reuse them outside this project.
