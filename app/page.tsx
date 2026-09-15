import BadgeCreator from '@/components/BadgeCreator';
import Countdown from '@/components/Countdown';
import EventFacts from '@/components/EventFacts';
import { COPY } from '@/lib/content';

export default function Home() {
  return (
    <>
      {/* The UAE Chapter lockup ships only in its inverted form, so the header band is dark. */}
      <header className="bg-deep-green">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/chapter-horizontal-inverted.svg"
            alt="PMI UAE Chapter"
            width={200}
            height={72}
            className="h-9 w-auto sm:h-11"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {COPY.hero.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl">
            {COPY.hero.heading}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{COPY.hero.sub}</p>
          <div className="mt-4">
            <Countdown />
          </div>
        </div>

        <BadgeCreator />

        <div className="mt-14">
          <EventFacts />
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted">
        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
          {COPY.footer.privacy}
        </a>
      </footer>
    </>
  );
}
