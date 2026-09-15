/**
 * Event facts. Single source of truth — these appear on the badge, the creator page,
 * the badge page, the OG card and every share caption. Never inline them elsewhere.
 *
 * Mirrors docs/CONTENT.md §1.
 */

export const EVENT = {
  name: 'PMI UAE Chapter Annual Gathering 2026',
  nameFull: 'PMI UAE Chapter Annual Gathering Meeting 2026',
  theme: 'Growing in Unity: Leading AI-Driven and Sustainable Projects for Tomorrow',
  themeShort: 'Growing in Unity',
  tagline: 'Community · AI · Sustainability',

  dateISO: '2026-10-10T08:00:00+04:00',
  dateLong: 'Saturday, 10 October 2026',
  dateShort: '10 October 2026',
  dateBadge: '10 OCT 2026',
  time: '08:00 – 17:00',

  venue: 'Le Méridien Dubai',
  city: 'Dubai, UAE',

  pdus: 6,
  audience: 'PMI UAE Chapter members only',
} as const;

/**
 * Absolute base URL. Required for Open Graph tags — relative URLs do not unfurl,
 * so a wrong value here silently breaks every link preview (see docs/DEPLOYMENT.md §1).
 */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

/** Registration page for the Register CTA. Confirmed by Marketing, 15 Sep 2026 (OQ-1). */
export const EVENT_URL =
  process.env.NEXT_PUBLIC_EVENT_URL ??
  'https://pmiuae.org/events/upcoming-events/general-events/pmi-uae-chapter-annual-gathering-meeting-2026';

type Placement = 'badge_page' | 'creator_footer' | 'confirmation_email';

/** Event URL with campaign tracking (docs/CONTENT.md §10). */
export function registerUrl(placement: Placement): string {
  const url = new URL(EVENT_URL);
  url.searchParams.set('utm_source', 'badge');
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'ag2026_badge');
  url.searchParams.set('utm_content', placement);
  return url.toString();
}

/** Whole days remaining until the event, floored at zero. */
export function daysUntilEvent(now: Date = new Date()): number {
  const diff = new Date(EVENT.dateISO).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}
