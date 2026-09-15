import { EVENT, registerUrl } from '@/lib/event';
import { COPY } from '@/lib/content';

const FACTS = [
  ['Date', `${EVENT.dateLong}, ${EVENT.time}`],
  ['Venue', `${EVENT.venue}, ${EVENT.city}`],
  ['Theme', EVENT.theme],
  ['PDUs', `${EVENT.pdus}`],
  ['Who can attend', EVENT.audience],
] as const;

export default function EventFacts() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="mb-4 font-display text-lg font-semibold">{EVENT.name}</h2>
      <dl className="space-y-3 text-sm">
        {FACTS.map(([term, value]) => (
          <div key={term} className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-muted">{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <a
        href={registerUrl('creator_footer')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-primary px-5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
      >
        {COPY.footer.event}
      </a>
    </section>
  );
}
