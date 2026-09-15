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

const handler = async (req: Request): Promise<Response> => {
  const expected = process.env.STATS_KEY;
  const supplied = new URL(req.url).searchParams.get('key');

  // Behave identically whether the key is absent, wrong, or unconfigured.
  if (!expected || !supplied || !matches(supplied, expected)) {
    return new Response('Not found', { status: 404 });
  }

  const store = getStore('badge-counts');
  const totals: Record<string, number> = {};
  const byDay: Record<string, Record<string, number>> = {};

  for (const event of EVENTS) {
    let total = 0;
    const days: Record<string, number> = {};

    for await (const page of store.list({ prefix: `${event}/`, paginate: true })) {
      for (const blob of page.blobs) {
        // key is `<event>/<YYYY-MM-DD>/<session>`
        const day = blob.key.split('/')[1];
        if (!day) continue;
        days[day] = (days[day] ?? 0) + 1;
        total += 1;
      }
    }

    totals[event] = total;
    byDay[event] = days;
  }

  return new Response(
    JSON.stringify({ totals, byDay, generatedAt: new Date().toISOString() }, null, 2),
    {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    },
  );
};

export default handler;

export const config = { path: '/api/stats' };
