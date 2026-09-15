# Design Specification

**Version:** 1.0 · **Last updated:** 15 September 2026

This document is the source for `lib/badge-spec.ts`. When a value changes here, change it there —
and nowhere else. Neither renderer may hard-code a colour, size or position.

---

## 1. Brand colours

### 1.1 PMI core palette — authoritative

These are extracted directly from the official full-colour logo SVG in the Chapter asset pack.
They are correct; do not substitute approximations.

| Token | Hex | Use |
|---|---|---|
| `pmiPurple` | `#4F17A8` | Primary brand colour. App chrome, buttons, links |
| `pmiCyan` | `#05BFE0` | Accent. Focus rings, secondary highlights |
| `pmiOrange` | `#FF610F` | Accent. Use sparingly — high attention only |

### 1.2 Annual Gathering 2026 event palette — derived, TBC

The 2026 key visual is a green AI/sustainability composition. These values are sampled from the
event artwork and must be confirmed against the source file before launch (see DECISIONS.md OQ-4).

| Token | Hex | Use |
|---|---|---|
| `deepGreen` | `#07281B` | Badge background base, darkest point |
| `forest` | `#0F3D2A` | Background gradient mid |
| `emerald` | `#1B7A4B` | Background gradient light, chip fills |
| `mint` | `#6EE7A8` | Eyebrow text, company line, accent rules |
| `glow` | `#A7F3C6` | Thin highlight lines echoing the key visual |
| `ink` | `#FFFFFF` | Primary text on the badge |
| `inkMuted` | `rgba(255,255,255,0.82)` | Role line, secondary text |
| `scrim` | `rgba(4,20,13,0.72)` | Gradient over artwork so text stays legible |

**Contrast.** All badge text must clear 4.5:1 against its actual backdrop *after* the scrim is
applied. `mint` on `deepGreen` is ~9:1 and safe. `emerald` on `forest` is **not** safe for text and
is fill-only.

### 1.3 App interface palette

The interface around the badge is light and neutral so the badge is the hero.

| Token | Hex |
|---|---|
| `bg` | `#FBFAFD` |
| `surface` | `#FFFFFF` |
| `border` | `#E7E3EF` |
| `text` | `#1A1523` |
| `textMuted` | `#5B5566` |
| `primary` | `#4F17A8` |
| `primaryHover` | `#3E1286` |
| `danger` | `#C0362C` |

## 2. Typography

> **TBC:** The Chapter's licensed brand typeface has not been confirmed. The stack below uses an
> open-licence substitute chosen for close tone and full Arabic coverage. Swap the family names in
> `badge-spec.ts` once confirmed — no other change is needed. See DECISIONS.md OQ-5.

| Role | Family | Weights |
|---|---|---|
| Display / headings | Poppins | 600, 700 |
| Body / UI | Inter | 400, 500, 600 |
| Arabic (all roles) | IBM Plex Sans Arabic | 400, 600 |

Self-host as `woff2` in `public/fonts/`, registered through the `FontFace` API so the canvas can use
them. Keep to the weights listed above; each one is bytes on the critical path.

**Arabic handling.** When the name contains characters in `؀–ۿ`, switch that text run to
the Arabic family and set the canvas `direction` to `rtl`. Do not mirror the whole layout — the
badge stays LTR; only the text run changes.

## 3. Square badge — 1200 × 1200

The primary artefact. Used for the LinkedIn feed, the download, and the native share.

```
┌────────────────────────────────────────────────┐  0
│  [PMI UAE Chapter logo]        ( 10 OCT 2026 ) │  header band, 0–260
│                                                │
│                    ╭──────╮                    │
│                    │ photo│                    │  photo zone, 260–620
│                    ╰──────╯                    │
│                                                │
│               I'M  ATTENDING                   │  eyebrow, 640–700
│                                                │
│              Aysha Al Maktoum                  │  name, 700–800
│                 PMO Lead                       │  role, 800–850
│              Emirates Group                    │  company, 850–900
│                                                │
│  ────────────────────────────────────────────  │  rule, y=940
│      PMI UAE Chapter Annual Gathering 2026     │  event, 960–1010
│   10 October 2026  ·  Le Méridien Dubai        │  detail, 1010–1055
│        Growing in Unity  ·  [ AI ]             │  theme + track, 1085–1130
└────────────────────────────────────────────────┘  1200
```

| Element | Position | Type | Notes |
|---|---|---|---|
| Safe margin | 80 px all sides | — | Nothing but background crosses this |
| Background | full bleed | Event key visual, WebP | Plus `scrim` vertical gradient, transparent at 0.35 → `scrim` at 1.0 |
| Logo | x 80, y 72, height 68 (→ 189 px wide, clears the 180 px minimum) | `pmi_uae_chapter_horizontal_logo_inverted_rgb.svg` | White/inverted version. Never recolour |
| Date pill | right-aligned to x 1120, y 76, h 56 | Poppins 600, 26 px, `ink` on `rgba(255,255,255,0.14)`, radius 28 | Content: `10 OCT 2026` |
| Photo circle | centre (600, 440), Ø 300 | — | 4 px `mint` ring, 12 px outer glow at 30% |
| Monogram fallback | same circle | Poppins 700, 120 px, `deepGreen` on `mint` | Up to 2 initials from the name |
| Eyebrow | centre, baseline y 676 | Poppins 600, 30 px, letter-spacing 0.18em, `mint` | `I'M ATTENDING` |
| **Name** | centre, baseline y 772 | Poppins 700, **72 px** | Auto-fit: see §6 |
| Role | centre, baseline y 830 | Inter 500, 34 px, `inkMuted` | Omitted if blank |
| Company | centre, baseline y 880 | Inter 400, 34 px, `mint` | Omitted if blank |
| Rule | x 200→1000, y 940, 2 px | `rgba(255,255,255,0.22)` | — |
| Event name | centre, baseline y 998 | Poppins 600, 40 px, `ink` | — |
| Event detail | centre, baseline y 1046 | Inter 400, 30 px, `inkMuted` | `10 October 2026 · Le Méridien Dubai` |
| Theme + track | centre, baseline y 1114 | Inter 500, 26 px, `mint` | Track chip only when set |

**Vertical rebalancing.** When role *and* company are both blank, shift the name block down by
40 px and the photo down by 20 px so the composition stays centred (US-02). Do not leave the gap.

## 4. App share card — 1200 × 630

**Static, one image, no attendee data.** Per-badge link previews were removed by ADR-008, so this is
a single fixed asset at `public/art/share-card.png`, used in the app's own Open Graph tags for when
the Chapter posts the *app link*.

| Element | Position | Type |
|---|---|---|
| Safe margin | 64 px | — |
| Background | full bleed | Same gradient treatment as the badge |
| Logo | x 64, y 56, height 56 | Inverted horizontal logo |
| Headline | x 64, baseline y 330 | Poppins 700, 64 px, `ink` — "Create your attendee badge" |
| Sub | x 64, baseline y 396 | Inter 400, 32 px, `inkMuted` — event name and date |
| Badge mock | right side, ~420 px wide, rotated 6° | A sample badge, so the card shows what the tool makes |

Blocked on the event key visual (OQ-4). The app ships without an OG image until then; it is a
launch-checklist item, not a build blocker.

## 5. Story format — 1080 × 1920 *(US-09, should-have)*

Same vertical order as the square badge with generous spacing. Key deltas: safe margin 96 px; photo
Ø 420 centred at y 720; name 92 px; all supporting type scaled ×1.25; the event lockup sits at
y 1560–1760 so it clears Instagram's UI overlays. Keep the bottom 250 px free of text.

## 6. Text auto-fit

Long names are the most common way a generated badge breaks. The rule, applied identically in both
renderers:

1. Measure at the maximum size for the field.
2. While the measured width exceeds the available width, reduce by 2 px, to the field minimum.
3. If still too wide at the minimum, wrap to **two lines maximum** at the last word boundary, and
   shift the block below it down by the added line height.
4. If it still does not fit — only possible with a 40-character unbroken string — truncate with an
   ellipsis.

| Field | Max | Min | Available width (square) | Max lines |
|---|---|---|---|---|
| Name | 72 px | 40 px | 1000 px | 2 |
| Role | 34 px | 26 px | 900 px | 1 |
| Company | 34 px | 26 px | 900 px | 1 |

Test fixtures must include `Mohammed Abdul Rahman Al Maktoum` (32 chars), a 40-character single
word, and `عائشة عبد الرحمن المكتوم`.

## 7. Logo rules

Assets live in `public/brand/`, copied from the Chapter pack. **Never** edit, recolour, stretch,
rotate, add effects to, or redraw these in code.

| Context | File |
|---|---|
| Badge artwork (dark background) | `pmi_uae_chapter_horizontal_logo_inverted_rgb.svg` |
| App header (light background) | `..._horizontal_logo_full_color_rgb.svg` |
| Tight spaces / favicon | `..._logo_mark_inverted_rgb.svg` |

- **Clear space:** minimum equal to the height of the "PMI" mark on all four sides.
- **Minimum size:** 180 px wide on the badge; 120 px in the app header.
- Place only on `deepGreen`/`forest` areas of the artwork, never over the busy part of the key
  visual, and never over the attendee photo.

The asset pack also contains "United Arab Emirates Khaleeji Chapter" variants. Use the **UAE
Chapter** files unless Marketing directs otherwise (DECISIONS.md OQ-6).

## 8. Interface design

Mobile-first at 375 px. Single column, ~560 px max width on desktop, centred.

Order on mobile — preview first, because seeing the badge is what motivates completing the form:

1. Header: logo, "Annual Gathering 2026", countdown (US-11)
2. Live badge preview, full-width, 1:1
3. Name field (required, autofocus)
4. Photo picker with "Your photo stays on your device" reassurance
5. Role and company, marked *Optional*
6. Primary **Download image** button, secondary **Share** (mobile only, shown when the browser
   supports sharing files), tertiary **Copy caption**
7. Footnote: attendee card, not a certification; privacy link

**Controls:** 48 px minimum touch target, 12 px radius, `primary` fill with white text, visible
focus ring in `pmiCyan` at 3 px offset. Inline validation messages appear below the field, in
`danger`, announced via `aria-live="polite"`.

**Accessibility (NFR-04).** Every input labelled; the canvas carries a descriptive `aria-label`
rebuilt on change ("Badge preview for Aysha Al Maktoum, PMO Lead"); the flow is completable by
keyboard alone; no colour-only error signalling; respect `prefers-reduced-motion` by disabling the
countdown tick animation.

## 9. Motion

Restrained. Badge preview cross-fades at 180 ms on change. Buttons lift 1 px on hover. The share
sheet trigger gets no animation — it must feel instant. Nothing animates on the badge artwork
itself; it is a still image and must export identically to what is on screen.
