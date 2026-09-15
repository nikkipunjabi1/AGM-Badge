'use client';

import { useState, useSyncExternalStore, type RefObject } from 'react';
import { COPY, composerUrls, linkedInCaption } from '@/lib/content';
import { canShareFiles, canvasToBlob, copyText, downloadBlob, shareImage } from '@/lib/share';

/** Share support never changes for the life of the page, so there is nothing to subscribe to. */
const subscribeNever = () => () => {};

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  disabled: boolean;
  onEvent?: (name: string) => void;
};

/**
 * Download is the primary action: the attendee saves the PNG and uploads it to LinkedIn
 * themselves (ADR-008). Native share is a mobile convenience and is not rendered at all
 * where the browser cannot share files — an inert button is worse than no button.
 */
export default function ShareBar({ canvasRef, disabled, onEvent }: Props) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  const caption = linkedInCaption();
  const composers = composerUrls(caption);

  // Browser-only capability, read after hydration so the server and client agree.
  const shareable = useSyncExternalStore(subscribeNever, () => canShareFiles(), () => false);

  async function withBlob(action: (blob: Blob) => Promise<void> | void) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setError(undefined);
    try {
      await action(await canvasToBlob(canvas));
    } catch {
      setError(COPY.errors.downloadFailed);
    }
  }

  const handleDownload = () =>
    withBlob((blob) => {
      downloadBlob(blob);
      setStatus(COPY.status.downloaded);
      onEvent?.('download_image');
    });

  const handleShare = () =>
    withBlob(async (blob) => {
      const outcome = await shareImage(blob, caption);
      if (outcome === 'shared') {
        onEvent?.('share_native');
      } else if (outcome === 'unsupported') {
        downloadBlob(blob);
        setError(COPY.errors.shareFailed);
      }
    });

  async function handleCopy() {
    const ok = await copyText(caption);
    setError(ok ? undefined : COPY.errors.clipboard);
    if (!ok) return;
    setCopied(true);
    onEvent?.('copy_caption');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          disabled={disabled}
          className="min-h-12 flex-1 rounded-xl bg-primary px-5 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {COPY.actions.download}
        </button>

        {shareable && (
          <button
            type="button"
            onClick={handleShare}
            disabled={disabled}
            className="min-h-12 rounded-xl border border-line bg-surface px-5 font-medium transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            {COPY.actions.share}
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled}
          className="min-h-12 rounded-xl border border-line bg-surface px-5 font-medium transition hover:border-primary hover:text-primary disabled:opacity-40"
        >
          {copied ? COPY.actions.copied : COPY.actions.copyCaption}
        </button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {error ? <span className="text-danger">{error}</span> : status}
      </p>

      <ol className="mt-4 space-y-2 rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <li className="font-medium text-ink">{COPY.howto.heading}</li>
        <li>1. {COPY.howto.step1}</li>
        <li>2. {COPY.howto.step2}</li>
        <li>
          3. {COPY.howto.step3}{' '}
          <a
            href={composers.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Open LinkedIn
          </a>
        </li>
        <li className="text-ink">
          4. <span className="font-medium">{COPY.howto.step4}</span>{' '}
          <span className="text-muted">{COPY.howto.step4Note}</span>
        </li>
      </ol>
    </div>
  );
}
