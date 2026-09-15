/**
 * Aggregate, non-identifying event counts (FR-10, NFR-09, ADR-010).
 *
 * Counts only. The signature takes no payload beyond the event name precisely so that a
 * name, role, company or photo cannot be attached to one, even by accident. See
 * netlify/functions/event.mts for the other end.
 */

export type BadgeEvent =
  | 'badge_started'
  | 'badge_completed'
  | 'photo_added'
  | 'download_image'
  | 'share_native'
  | 'copy_caption';

const SESSION_KEY = 'agm-badge-session';

/**
 * A random id used only to avoid counting the same visit twice. It is not linked to the
 * attendee or anything they typed, and it is gone when the tab closes.
 */
function sessionId(): string {
  const fresh = crypto.randomUUID();
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    sessionStorage.setItem(SESSION_KEY, fresh);
  } catch {
    // Private browsing or blocked storage: a per-load id still counts, just less exactly.
  }
  return fresh;
}

export function track(event: BadgeEvent): void {
  if (typeof window === 'undefined') return;

  // Fire and forget. Counting must never interrupt, slow, or break badge creation, so
  // every failure here is swallowed: no retry, no error surfaced to the attendee.
  try {
    void fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event, session: sessionId() }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Ignore.
  }
}
