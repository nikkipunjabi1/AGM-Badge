import { getStore } from '@netlify/blobs';

/**
 * Private totals for the Chapter: open /?stats=<key> on the live site.
 *
 * Gated on the STATS_KEY environment variable. With no key configured the endpoint
 * reports nothing at all, so it is off until someone deliberately turns it on.
 *
 * A key in a query string is obscurity rather than real security. That is proportionate
 * here — these are anonymous totals, not personal data — but it is not a login, and the
 * key will sit in browser history, so do not reuse a password for it (ADR-010).
 */

const EVENTS = [
  'badge_started',
  'badge_completed',
  'photo_added',
  'download_image',
  'share_native',
  'copy_caption',
] as const;

/** Constant-time-ish comparison, so the key cannot be guessed a character at a time. */
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const handler = async (req: Request): Promise<Response> => {
  const params = new URL(req.url).searchParams;

  // Trimmed on both sides: a key copied from a terminal very often arrives with a
  // trailing newline, and an invisible character is a miserable thing to debug.
  const expected = process.env.STATS_KEY?.trim();
  const supplied = params.get('key')?.trim();

  /**
   * Unauthenticated health check, so it is possible to tell "the key is wrong" from
   * "the environment variable never reached the function" — which are the same 404 to
   * anyone probing, and were previously indistinguishable when debugging too.
   *
   * It reveals only that a stats feature exists and whether a key is configured. Never
   * the key, and never a single count. That is a fair trade for anonymous totals; it
   * would not be for anything personal.
   */
  if (params.get('health')) {
    return json({ ok: true, keyConfigured: Boolean(expected) }, 200);
  }

  // Behave identically whether the key is absent, wrong, or unconfigured.
  if (!expected || !supplied || !matches(supplied, expected)) {
    return new Response('Not found', { status: 404 });
  }

  // Optional ?from=YYYY-MM-DD, so testing before launch does not muddy the campaign
  // numbers. Filtering beats a reset endpoint: nothing is destroyed, the figures stay
  // reproducible, and there is no way to wipe the counts by accident or by guessing.
  const fromParam = new URL(req.url).searchParams.get('from');
  const from = fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam) ? fromParam : null;

  const totals: Record<string, number> = {};
  const byDay: Record<string, Record<string, number>> = {};

  try {
    const store = getStore('badge-counts');

    for (const event of EVENTS) {
      let total = 0;
      const days: Record<string, number> = {};

      for await (const page of store.list({ prefix: `${event}/`, paginate: true })) {
        for (const blob of page.blobs) {
          // key is `<event>/<YYYY-MM-DD>/<session>`
          const day = blob.key.split('/')[1];
          if (!day) continue;
          // Dates are ISO, so a string comparison is a date comparison.
          if (from && day < from) continue;
          days[day] = (days[day] ?? 0) + 1;
          total += 1;
        }
      }

      totals[event] = total;
      byDay[event] = days;
    }
  } catch (cause) {
    // The caller holds the key, so a real reason is more use to them than a blank 500.
    return json({ error: 'Could not read the counts', detail: String(cause) }, 500);
  }

  return json({ totals, byDay, from, generatedAt: new Date().toISOString() }, 200);
};

export default handler;

export const config = { path: '/api/stats' };
