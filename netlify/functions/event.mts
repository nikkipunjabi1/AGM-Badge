import { getStore } from '@netlify/blobs';

/**
 * Records that something happened, with no idea who it happened to.
 *
 * Counts only: no name, role, company or photo ever reaches this endpoint, which is what
 * keeps the promise in /privacy true and keeps the Chapter out of scope for personal
 * data entirely (ADR-010).
 *
 * Each event is stored as an empty blob keyed `<event>/<date>/<session>`. Writing a key
 * is idempotent, so a session that downloads twice still counts once, and counting is
 * just counting keys — no read-modify-write, so concurrent visitors cannot lose each
 * other's increments the way a single shared counter would.
 */

const EVENTS = new Set([
  'badge_started',
  'badge_completed',
  'photo_added',
  'download_image',
  'share_native',
  'copy_caption',
]);

/** A session id is a random string used only to avoid double counting. */
const SESSION = /^[A-Za-z0-9_-]{8,64}$/;

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const { event, session } = (body ?? {}) as { event?: unknown; session?: unknown };

  if (typeof event !== 'string' || !EVENTS.has(event)) {
    return new Response('Unknown event', { status: 400 });
  }
  if (typeof session !== 'string' || !SESSION.test(session)) {
    return new Response('Bad session', { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);

  try {
    const store = getStore('badge-counts');
    await store.set(`${event}/${day}/${session}`, '');
  } catch (cause) {
    // Report the failure rather than hiding it: a silently swallowed write would show up
    // as counts that are simply always zero, with nothing to debug. Badge creation is
    // unaffected either way — the client fires this and ignores the response entirely.
    return new Response(String(cause), { status: 500 });
  }

  return new Response(null, { status: 204 });
};

export default handler;

export const config = { path: '/api/event' };
