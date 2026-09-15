'use client';

import { useSyncExternalStore } from 'react';
import { COPY } from '@/lib/content';
import { daysUntilEvent } from '@/lib/event';

/**
 * Days until the event. Rendered only after mount — a server-rendered value would be
 * baked into the static export at build time and go stale immediately.
 */
const subscribeNever = () => () => {};

export default function Countdown() {
  const days = useSyncExternalStore(subscribeNever, daysUntilEvent, () => null);

  if (days === null) return null;

  return (
    <p className="text-sm text-muted">
      {days === 0 ? (
        COPY.countdown.today
      ) : (
        <>
          <span className="font-display text-base font-semibold text-primary">{days}</span>{' '}
          {days === 1 ? 'day' : 'days'} {COPY.countdown.label}
        </>
      )}
    </p>
  );
}
