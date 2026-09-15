# Privacy

**Version:** 1.0 · **Last updated:** 15 September 2026

This document is both an internal reference and the source text for the `/privacy` page.

---

## 1. The short version

We do not collect, store, or transmit your personal details. Your badge is built in your browser,
and your photo never leaves your device.

## 2. What happens to each thing you enter

| What you enter | What happens to it |
|---|---|
| **Your name** | Used to draw your badge inside your browser. Never sent to us, never stored |
| **Your role, company** | The same, and both are optional |
| **Your photo** | Read and processed entirely inside your browser. It is never uploaded, never sent to us, and never stored anywhere by us. It exists only on your device and in the image you choose to save or share |

## 3. What this means in practice

- There is **no database**, and in fact no server that receives your details at all. The page runs
  entirely in your browser.
- We keep no list of who created a badge.
- Your badge exists only as the image file you download. Once you close the page, nothing remains.
- What happens to the badge after you download it is entirely up to you — it becomes public only
  when you choose to post it.

## 4. Analytics

We count how many badges are created and shared, so the Chapter can see whether this was
worthwhile. Those counts are anonymous totals. They contain no names, no photos, no badge content,
and nothing that identifies you or your device. We do not use advertising cookies, tracking pixels,
or session recording.

## 5. Your rights

Because we hold no personal data about you, there is nothing for us to look up, correct, export, or
delete in response to a request. If you have a question about this, contact the PMI UAE Chapter
through the details on the Chapter website.

## 6. What this badge is not

This badge is a promotional card for sharing on social media. It is not a certification, not proof
of registration, and not a record of PDUs. Your registration confirmation email and its QR code
remain what you need for entry to the event.

---

## 7. Internal note — regulatory position

The UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) governs the processing of
personal data. The architecture here is deliberately arranged so that the Chapter performs
effectively no processing: names transit through the user's own browser and their own shared links,
and photographs are never received at all.

This is a design choice with a real compliance benefit, and it is the main reason ADR-004 (no photo
upload) should not be reversed casually. Adding photo upload would introduce storage of images of
identifiable people, which brings retention, access-request, and moderation obligations that this
project has no capacity to meet before 10 October.

ADR-008 strengthened this further: with per-badge URLs removed, the attendee's name no longer
travels in a shareable link, so the Chapter's processing footprint is now effectively nil.

Anything that would change this position — storing badge records, adding accounts, integrating the
registration list, or uploading photos — requires a new ADR and a review of this notice.
