/**
 * Aggregate, non-identifying event counts (FR-10, NFR-09).
 *
 * No event may ever carry the attendee's name, role, company or photo. The signature
 * takes no payload precisely so that it cannot.
 *
 * TODO(OQ-9): wire to the Chapter's analytics platform once chosen. Until then this is a
 * no-op, which is the correct default — shipping without analytics is better than
 * shipping the wrong one.
 */

export type BadgeEvent =
  | 'badge_started'
  | 'badge_completed'
  | 'photo_added'
  | 'download_image'
  | 'share_native'
  | 'copy_caption'
  | 'register_clicked';

export function track(event: BadgeEvent): void {
  if (process.env.NEXT_PUBLIC_ANALYTICS !== 'plausible') return;

  const plausible = (window as unknown as { plausible?: (name: string) => void }).plausible;
  plausible?.(event);
}
