'use client';

import { useId, useRef, useState } from 'react';
import { COPY } from '@/lib/content';
import { loadPhoto, PhotoError } from '@/lib/photo';

type Props = {
  photo?: ImageBitmap;
  zoom: number;
  onPhoto: (photo: ImageBitmap | undefined) => void;
  onZoom: (zoom: number) => void;
};

/**
 * Photo input. Everything happens in the browser — there is no upload endpoint in this
 * project, and the reassurance below the control says so (ADR-004).
 */
export default function PhotoPicker({ photo, zoom, onPhoto, onZoom }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const zoomId = useId();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(undefined);
    try {
      onPhoto(await loadPhoto(file));
    } catch (cause) {
      setError(cause instanceof PhotoError ? cause.message : COPY.errors.photoGeneric);
      onPhoto(undefined);
    } finally {
      setBusy(false);
      // Allow re-selecting the same file after a failure.
      event.target.value = '';
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">{COPY.form.photo.label}</span>
        <span className="text-xs text-muted">{COPY.form.optional}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        aria-label={COPY.form.photo.label}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="min-h-12 rounded-xl border border-line bg-surface px-4 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {photo ? COPY.form.photo.change : COPY.form.photo.cta}
        </button>

        {photo && (
          <button
            type="button"
            onClick={() => onPhoto(undefined)}
            className="min-h-12 px-2 text-sm text-muted underline underline-offset-4 hover:text-danger"
          >
            {COPY.form.photo.remove}
          </button>
        )}
      </div>

      {photo && (
        <div className="mt-3">
          <label htmlFor={zoomId} className="mb-1 block text-xs text-muted">
            {COPY.form.photo.adjust}
          </label>
          <input
            id={zoomId}
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={zoom}
            onChange={(e) => onZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      )}

      <p className="mt-2 text-xs text-muted">{COPY.form.photo.privacy}</p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
