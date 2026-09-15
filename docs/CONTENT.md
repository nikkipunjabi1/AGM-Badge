# Content and Copy

**Version:** 1.0 · **Last updated:** 15 September 2026

Every user-visible string in the product. This document and `lib/content.ts` are mirrors — change
both together. Event facts live in `lib/event.ts`.

**Copy rules.** Never use *certificate, credential, verified, earned, awarded, official proof* or
*PDU* in relation to the badge. Write "attendee card", "badge", "I'm attending". British spelling
throughout. Sentence case for everything except the badge eyebrow. **No em dashes anywhere in
attendee-facing copy** — use a full stop or a comma instead. This is a house style rule for the
campaign; check it before shipping any new string.

---

## 1. Event facts — `lib/event.ts`

| Key | Value |
|---|---|
| `name` | PMI UAE Chapter Annual Gathering 2026 |
| `nameFull` | PMI UAE Chapter Annual Gathering Meeting 2026 |
| `theme` | Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow |
| `themeShort` | Growing in Unity |
| `tagline` | Community · AI · Sustainability |
| `dateISO` | 2026-10-10T08:00:00+04:00 |
| `dateLong` | Saturday, 10 October 2026 |
| `dateShort` | 10 October 2026 |
| `dateBadge` | 10 OCT 2026 |
| `time` | 08:00 – 17:00 |
| `venue` | Le Méridien Dubai |
| `city` | Dubai, UAE |
| `pdus` | 6 |
| `audience` | PMI UAE Chapter members only |
| `eventUrl` | `https://pmiuae.org/events/upcoming-events/general-events/pmi-uae-chapter-annual-gathering-meeting-2026` |
| `chapterUrl` | *TBC — Chapter homepage* |

## 2. Creator page — `/`

| Key | Copy |
|---|---|
| `page.title` | Create your Annual Gathering badge |
| `page.metaDescription` | Make your PMI UAE Chapter Annual Gathering 2026 attendee badge and share that you'll be there on 10 October. |
| `hero.eyebrow` | PMI UAE Chapter |
| `hero.heading` | You're in. Now let people know. |
| `hero.sub` | Create your attendee badge for the Annual Gathering on 10 October, download it, and post it to LinkedIn. It takes about thirty seconds. |
| `countdown.label` | until the Annual Gathering |
| `countdown.today` | The Annual Gathering is today |
| `form.name.label` | Your name |
| `form.name.placeholder` | e.g. Aysha Al Maktoum |
| `form.name.hint` | This appears on your badge |
| `form.photo.label` | Your photo |
| `form.photo.optional` | Optional |
| `form.photo.cta` | Add a photo |
| `form.photo.change` | Change photo |
| `form.photo.remove` | Remove |
| `form.photo.privacy` | Your photo stays on your device. It is never uploaded to us. |
| `form.photo.adjust` | Drag to reposition, pinch or use the slider to zoom |
| `form.role.label` | Your role |
| `form.role.placeholder` | e.g. PMO Lead |
| `form.company.label` | Your company |
| `form.company.placeholder` | e.g. Emirates Group |
| `form.optional` | Optional |
| `preview.label` | Your badge |
| `preview.empty` | Enter your name to see your badge |
| `preview.dragHint` | Drag your photo on the badge to move it. Zoom in first if it will not budge. |
| `actions.download` | Download your badge |
| `actions.share` | Share to an app |
| `actions.copyCaption` | Copy caption |
| `actions.copied` | Copied |
| `howto.heading` | How to post it |
| `howto.step1` | Download your badge |
| `howto.step2` | Copy the caption below |
| `howto.step3` | Open LinkedIn, start a post, attach the image and paste the caption |
| `howto.step4` | Don't forget to tag PMI UAE Chapter. |
| `howto.step4Note` | Type the @ yourself and pick the Chapter from the list, or it won't link. |
| `disclaimer` | This is an attendee card to share on social media. It is not a certification, and it is not proof of registration or PDUs. |
| `footer.privacy` | How we handle your details |
| `footer.event` | View the event page |

## 4. Badge artwork strings

| Element | Content |
|---|---|
| Eyebrow | `I'M ATTENDING` |
| Date pill | `10 OCT 2026` |
| Event line | `PMI UAE Chapter Annual Gathering 2026` |
| Detail line | `10 October 2026 · Le Méridien Dubai` |
| Theme line | `Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow` (wraps to two lines) |
| Chapter URL | `pmiuae.org` |
| Track chip | `AI` or `SUSTAINABILITY` |

Nothing else appears on the badge. In particular: no PDU count, no "verified", no QR code.

## 5. Share captions

The caption is pre-filled but fully editable — people post better copy when it sounds like them.

### 5.1 LinkedIn

One caption for everyone. See §5.2 for why there is no personalised variant.

```
I'll be at the PMI UAE Chapter Annual Gathering 2026 on Saturday 10 October at Le Méridien Dubai.

This year's theme is Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow. It is a full day of keynotes, a panel on where AI and sustainability actually meet in delivery, and specialist tracks in the afternoon.

If you're going too, let's connect on the day. Registration is open to Chapter members here: {EVENT_URL}

See you there, @PMI UAE Chapter.

#PMIUAE #PMIUAEChapter #AnnualGathering2026 #GrowingInUnity #ProjectManagement #AI #Sustainability
```

### 5.2 Why the caption is not personalised

An earlier version wove the attendee's role and company into a sentence about what they were
looking forward to. It was cut: of every line in the caption, it was the one most likely to read as
words put in someone's mouth, and a caption that does not quite sound like you is a caption you
rewrite or do not post. The same generic copy for everyone is the safer default, and anyone who
wants it personal can type it themselves.

### 5.3 WhatsApp / short

```
I'll be at the PMI UAE Chapter Annual Gathering on 10 October at Le Méridien Dubai. AI, sustainability, and a room full of project people. Come along: {EVENT_URL}
```

### 5.4 X

```
I'll be at the PMI UAE Chapter Annual Gathering 2026 — 10 October, Le Méridien Dubai. Theme: Growing in Unity, leading AI-driven and sustainable projects. {EVENT_URL} #PMIUAE #AnnualGathering2026
```

### 5.5 Hashtags

Primary: `#PMIUAE` `#PMIUAEChapter` `#AnnualGathering2026` `#GrowingInUnity`
Secondary: `#ProjectManagement` `#AI` `#Sustainability` `#Dubai` `#PMO`

Keep to six or fewer on LinkedIn; beyond that, reach drops.

### 5.6 Tagging the Chapter

The caption closes on `See you there, @PMI UAE Chapter.`, with the `@` already written so tagging
costs the attendee one keystroke rather than typing the whole name.

It stays deliberately plain. A line playing on the event theme was drafted and dropped: the caption
already quotes the theme in full two paragraphs earlier, so echoing it at the close only repeats
itself. "Hosted by" was dropped too, for reading like a footer credit rather than something a
person attending would actually write. But **LinkedIn only creates a real mention when
the `@` is typed and the Chapter is chosen from its dropdown.** Pasted text stays grey and links
nowhere, which is why `howto.step4` is a plain reminder with the mechanics as a quiet note beneath
it, rather than a lecture about how LinkedIn works.

This is worth the extra step: a genuine tag puts the post in the Chapter page's mentions and
notifies whoever runs it, which a hashtag alone does not do.

## 6. Confirmation email snippet

To be added to the registration confirmation email (AGB-062). Place it **above** the QR code —
the QR code is the point at which people stop reading.

> **Let your network know you're coming**
>
> Create your Annual Gathering attendee badge with your name and photo, and share it on LinkedIn in
> one tap. It takes about thirty seconds.
>
> **[ Create my badge ]** → `{APP_URL}?utm_source=confirmation_email&utm_medium=email&utm_campaign=ag2026_badge`
>
> Your badge is a social media card, not a check-in pass. Please keep the QR code below for entry.

That last line is not optional. Without it, a meaningful number of attendees will arrive holding
the badge instead of the QR code.

## 7. Chapter announcement post

For the Chapter LinkedIn page at launch (AGB-063):

```
Registered for the Annual Gathering? Tell the room before you get there.

We've built a quick way to create your own Annual Gathering 2026 attendee badge — add your name, your photo, and your role, and share it with your network in about thirty seconds.

Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow
Saturday 10 October · Le Méridien Dubai · 6 PDUs · Members only

Make yours: {APP_URL}
Not registered yet? Seats are limited: {EVENT_URL}

#PMIUAE #AnnualGathering2026 #GrowingInUnity #ProjectManagement
```

## 8. Errors and system messages

| Key | Copy |
|---|---|
| `errors.nameRequired` | Please enter your name so we can put it on the badge |
| `errors.nameShort` | That looks a little short. Please enter at least two characters |
| `errors.nameLong` | Please keep this to 40 characters so it fits on the badge |
| `errors.charset` | Please use letters, numbers and basic punctuation only |
| `errors.blocked` | Please choose different wording for your badge |
| `errors.photoSize` | That image is larger than 10 MB. Please choose a smaller one |
| `errors.photoFormat` | We couldn't read that image on this browser. Please try a JPG or PNG |
| `errors.photoGeneric` | Something went wrong loading that photo. Please try another one |
| `errors.shareFailed` | Sharing didn't open. Your badge has been downloaded instead |
| `errors.clipboard` | We couldn't copy automatically. Select the caption and copy it manually |
| `errors.downloadFailed` | The download didn't start. Try pressing and holding the badge to save it |
| `errors.generic` | Something went wrong. Please refresh and try again |
| `status.rendering` | Creating your badge… |
| `status.downloaded` | Badge saved. Open LinkedIn, start a post, and attach it along with the caption. |

Error copy tells the person what to do next. No error message should end at describing the problem.

## 9. Composer links

Convenience links that open a composer with the caption pre-filled. The attendee still attaches the
downloaded image themselves — see ADR-008.

| Platform | Pattern |
|---|---|
| LinkedIn | `https://www.linkedin.com/feed/?shareActive=true&text={encoded caption}` |
| WhatsApp | `https://wa.me/?text={encoded caption}` |
| X | `https://x.com/intent/tweet?text={encoded caption}` |

No web page can attach an image to a LinkedIn post on the user's behalf — LinkedIn's share
endpoints accept a URL, not a file. The download-then-attach step is a platform limitation, so the
interface should state it plainly rather than implying one-tap posting.

## 10. UTM convention

All outbound links to the event page:

```
{EVENT_URL}?utm_source=badge&utm_medium=social&utm_campaign=ag2026_badge&utm_content={placement}
```

`placement` is one of `badge_page`, `creator_footer`, `confirmation_email`.
