/**
 * Every user-visible string. Mirrors docs/CONTENT.md — change both together.
 *
 * Copy rules: never use certificate / credential / verified / earned / awarded / PDU
 * in relation to the badge. It is an attendee card, not a credential.
 */

import { EVENT, EVENT_URL } from './event';

export const COPY = {
  page: {
    title: 'Create your Annual Gathering badge',
    metaDescription:
      "Make your PMI UAE Chapter Annual Gathering 2026 attendee badge and share that you'll be there on 10 October.",
  },

  hero: {
    eyebrow: 'PMI UAE Chapter',
    heading: "You're in. Now let people know.",
    sub: 'Create your attendee badge for the Annual Gathering on 10 October, download it, and post it to LinkedIn. It takes about thirty seconds.',
  },

  countdown: {
    label: 'until the Annual Gathering',
    today: 'The Annual Gathering is today',
  },

  form: {
    optional: 'Optional',
    name: {
      label: 'Your name',
      placeholder: 'e.g. Aysha Al Maktoum',
      hint: 'This appears on your badge',
    },
    photo: {
      label: 'Your photo',
      cta: 'Add a photo',
      change: 'Change photo',
      remove: 'Remove',
      privacy: 'Your photo stays on your device. It is never uploaded to us.',
      zoom: 'Zoom',
      recentre: 'Recentre',
      adjust: 'Drag the photo on your badge to position it.',
      adjustLocked: 'Zoom in to be able to move the photo around.',
    },
    role: { label: 'Your role', placeholder: 'e.g. PMO Lead' },
    company: { label: 'Your company', placeholder: 'e.g. Emirates Group' },
  },

  preview: {
    label: 'Your badge',
    empty: 'Enter your name to see your badge',
    dragHint: 'Drag your photo on the badge to move it. Zoom in first if it will not budge.',
  },

  actions: {
    download: 'Download your badge',
    share: 'Share to an app',
    copyCaption: 'Copy caption',
    copied: 'Copied',
  },

  howto: {
    heading: 'How to post it',
    step1: 'Download your badge',
    step2: 'Copy the caption below',
    step3: 'Open LinkedIn, start a post, attach the image and paste the caption',
  },

  disclaimer:
    'This is an attendee card to share on social media. It is not a certification, and it is not proof of registration or PDUs.',

  footer: {
    privacy: 'How we handle your details',
    event: 'View the event page',
  },

  errors: {
    nameRequired: 'Please enter your name so we can put it on the badge',
    nameShort: 'That looks a little short. Please enter at least two characters',
    nameLong: 'Please keep this to 40 characters so it fits on the badge',
    charset: 'Please use letters, numbers and basic punctuation only',
    blocked: 'Please choose different wording for your badge',
    photoSize: 'That image is larger than 10 MB. Please choose a smaller one',
    photoFormat: "We couldn't read that image on this browser. Please try a JPG or PNG",
    photoGeneric: 'Something went wrong loading that photo. Please try another one',
    shareFailed: "Sharing didn't open. Your badge has been downloaded instead",
    clipboard: "We couldn't copy automatically. Select the caption and copy it manually",
    downloadFailed: "The download didn't start. Try pressing and holding the badge to save it",
    generic: 'Something went wrong. Please refresh and try again',
  },

  status: {
    rendering: 'Creating your badge…',
    downloaded: 'Badge saved. Open LinkedIn, start a post, and attach it along with the caption.',
  },
} as const;

/** Badge artwork strings (docs/CONTENT.md §4). Nothing else appears on the badge. */
export const BADGE_TEXT = {
  eyebrow: "I'M ATTENDING",
  datePill: EVENT.dateBadge,
  eventName: EVENT.name,
  eventDetail: `${EVENT.dateShort} · ${EVENT.venue}`,
  theme: EVENT.theme,
} as const;

const HASHTAGS = '#PMIUAE #PMIUAEChapter #AnnualGathering2026 #GrowingInUnity #ProjectManagement';

/**
 * The suggested LinkedIn caption. Pre-filled but fully editable, because people post
 * better copy when it sounds like them. Carries the event link, which since ADR-008 is
 * the only route from a shared badge back to registration.
 *
 * No em dashes anywhere in share copy: it is a house style rule for this campaign.
 */
export function linkedInCaption(role?: string, company?: string): string {
  const opener =
    role && company
      ? `As ${role} at ${company}, I'm looking forward to a day on how AI and sustainability are reshaping how we deliver projects.\n\n`
      : '';

  return (
    `I'll be at the ${EVENT.name} on ${EVENT.dateLong.replace('Saturday, ', 'Saturday ')} at ${EVENT.venue}.\n\n` +
    opener +
    `This year's theme is ${EVENT.theme}. It is a full day of keynotes, a panel on where AI and sustainability actually meet in delivery, and specialist tracks in the afternoon.\n\n` +
    `If you're going too, let's connect on the day. Registration is open to Chapter members here: ${EVENT_URL}\n\n` +
    HASHTAGS
  );
}

export function shortCaption(): string {
  return `I'll be at the ${EVENT.name} on ${EVENT.dateShort} at ${EVENT.venue}. AI, sustainability, and a room full of project people. Come along: ${EVENT_URL}`;
}

/** Composer links. The attendee still attaches the downloaded image themselves (ADR-008). */
export function composerUrls(caption: string) {
  const text = encodeURIComponent(caption);
  return {
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${text}`,
    whatsapp: `https://wa.me/?text=${text}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(shortCaption())}`,
  };
}
