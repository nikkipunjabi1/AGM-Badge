import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy — Annual Gathering badge',
  description: 'How the Annual Gathering badge tool handles your details. In short: it does not.',
};

/** Mirrors docs/PRIVACY.md §1–6. Change both together. */
export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm text-primary underline underline-offset-4">
        ← Back to the badge
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold">Privacy</h1>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p className="rounded-xl border border-line bg-surface p-5 font-medium">
          We do not collect, store, or transmit your personal details. Your badge is built in your
          browser, and your photo never leaves your device.
        </p>

        <section>
          <h2 className="font-display text-xl font-semibold">What happens to what you enter</h2>
          <p className="mt-3 text-muted">
            Your name, role and company are used to draw your badge inside your browser. They are
            never sent to us and never stored. Your photo is read and processed entirely on your
            device — it is never uploaded, and it exists only on your device and in the image you
            choose to save.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">What this means in practice</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
            <li>
              There is no database, and no server that receives your details at all. The page runs
              entirely in your browser.
            </li>
            <li>We keep no list of who created a badge.</li>
            <li>
              Your badge exists only as the image file you download. Once you close the page,
              nothing remains.
            </li>
            <li>
              What happens to the badge afterwards is entirely up to you — it becomes public only
              when you choose to post it.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Analytics</h2>
          <p className="mt-3 text-muted">
            We count how many badges are created and shared, so the Chapter can see whether this was
            worthwhile. Those counts are anonymous totals containing no names, no photos and nothing
            identifying you or your device. We do not use advertising cookies, tracking pixels or
            session recording.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">What this badge is not</h2>
          <p className="mt-3 text-muted">
            This badge is a promotional card for sharing on social media. It is not a certification,
            not proof of registration, and not a record of PDUs. Your registration confirmation
            email and its QR code remain what you need for entry to the event.
          </p>
        </section>
      </div>
    </main>
  );
}
