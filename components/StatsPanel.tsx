'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { BadgeEvent } from '@/lib/analytics';

type Stats = {
  totals: Record<BadgeEvent, number>;
  byDay: Record<BadgeEvent, Record<string, number>>;
  /** Counting from this date onwards, if the URL asked for one. */
  from: string | null;
  generatedAt: string;
};

const ROWS: { event: BadgeEvent; label: string; note?: string }[] = [
  { event: 'badge_completed', label: 'Badges created', note: 'The headline number' },
  { event: 'download_image', label: 'Badges downloaded' },
  { event: 'copy_caption', label: 'Captions copied' },
  { event: 'share_native', label: 'Shared from a phone' },
  { event: 'photo_added', label: 'Added a photo' },
  { event: 'badge_started', label: 'Started typing' },
];

/**
 * Private totals for the Chapter, shown only when the site is opened with the right
 * ?stats=<key>. Attendees never see any of this, and the endpoint returns 404 to anyone
 * without the key, so an incorrect one is indistinguishable from the feature being off.
 */
const subscribeNever = () => () => {};
const readKey = () => new URLSearchParams(window.location.search).get('stats');
const readFrom = () => new URLSearchParams(window.location.search).get('from');

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats>();
  const [failure, setFailure] = useState<{ status: number; detail?: string }>();

  // Read after hydration so the static page and the client agree on the first render.
  const key = useSyncExternalStore(subscribeNever, readKey, () => null);
  const from = useSyncExternalStore(subscribeNever, readFrom, () => null);

  useEffect(() => {
    if (!key) return;
    let live = true;

    const query = new URLSearchParams({ key });
    if (from) query.set('from', from);

    fetch(`/api/stats?${query}`)
      .then(async (response) => {
        if (response.ok) return (await response.json()) as Stats;
        const body = await response.json().catch(() => null);
        throw { status: response.status, detail: (body as { detail?: string })?.detail };
      })
      .then((data) => live && setStats(data))
      .catch((cause: { status?: number; detail?: string }) => {
        if (live) setFailure({ status: cause?.status ?? 0, detail: cause?.detail });
      });

    return () => {
      live = false;
    };
  }, [key, from]);

  if (!key) return null;

  const completionRate =
    stats && stats.totals.badge_started > 0
      ? Math.round((stats.totals.badge_completed / stats.totals.badge_started) * 100)
      : null;

  const recent = stats
    ? Object.entries(stats.byDay.badge_completed ?? {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 14)
    : [];

  return (
    <section className="mb-10 rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-display text-lg font-semibold">Campaign numbers</h2>
      <p className="mt-1 text-xs text-muted">
        Only visible with the stats key. Attendees never see this.
        {stats?.from
          ? ` Counting from ${stats.from} onwards.`
          : ' Counting everything ever recorded, including test runs.'}
      </p>

      {failure && (
        <div className="mt-4 text-sm text-danger">
          {failure.status === 404 ? (
            <>
              <p className="font-medium">That key was not accepted.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-normal">
                <li>
                  Check <code>STATS_KEY</code> in Netlify matches the key in this URL exactly.
                </li>
                <li>
                  <strong>Redeploy after setting it.</strong> Netlify does not push a new
                  environment variable into functions that are already deployed.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-medium">
                Could not read the counts{failure.status ? ` (HTTP ${failure.status})` : ''}.
              </p>
              {failure.detail && (
                <p className="mt-1 font-mono text-xs break-words">{failure.detail}</p>
              )}
            </>
          )}
        </div>
      )}

      {!stats && !failure && <p className="mt-4 text-sm text-muted">Loading…</p>}

      {stats && (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {ROWS.map(({ event, label, note }) => (
              <div key={event} className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-display text-2xl font-bold text-primary">
                  {stats.totals[event] ?? 0}
                </dd>
                {note && <p className="text-xs text-muted">{note}</p>}
              </div>
            ))}
          </dl>

          {completionRate !== null && (
            <p className="mt-4 text-sm text-muted">
              <span className="font-medium text-ink">{completionRate}%</span> of people who started
              typing went on to finish a badge.
            </p>
          )}

          {recent.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-medium">Badges created per day</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {recent.map(([day, count]) => (
                  <li key={day} className="flex items-center gap-3">
                    <span className="w-24 tabular-nums">{day}</span>
                    <span
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, count * 6)}%` }}
                      aria-hidden
                    />
                    <span className="tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-5 text-xs text-muted">
            Counts are of browser sessions, not verified people, and contain nothing personal.
            Updated {new Date(stats.generatedAt).toLocaleString('en-GB')}.
          </p>
        </>
      )}
    </section>
  );
}
