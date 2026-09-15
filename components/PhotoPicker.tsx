'use client';

import { useId, useRef, useState } from 'react';
import { SQUARE } from '@/lib/badge-spec';
import { COPY } from '@/lib/content';
import { loadPhoto, PhotoError } from '@/lib/photo';
import { clampCrop, DEFAULT_CROP, panLimits, type Crop } from '@/lib/render/canvas';

type Props = {
  photo?: ImageBitmap;
  crop: Crop;
  onPhoto: (photo: ImageBitmap | undefined) => void;
  onCrop: (crop: Crop) => void;
};

/**
 * Photo input. Everything happens in the browser — there is no upload endpoint in this
 * project, and the reassurance below the control says so (ADR-004).
 *
 * Positioning is done by dragging on the badge itself (see BadgeCanvas); this panel
 * carries only zoom and a way back to centre.
 */
export default function PhotoPicker({ photo, crop, onPhoto, onCrop }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const zoomId = useId();

  // At zoom 1 a square photo only just covers the circle, so there is nothing to drag.
  // Saying so is better than letting the attendee wonder why nothing moves.
  const limits = photo ? panLimits(photo, SQUARE.photo.d, crop.zoom) : { x: 0, y: 0 };
  const canPan = limits.x > 0.001 || limits.y > 0.001;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(undefined);
    try {
      onPhoto(await loadPhoto(file));
      onCrop(DEFAULT_CROP);
    } catch (cause) {
      setError(cause instanceof PhotoError ? cause.message : COPY.errors.photoGeneric);
      onPhoto(undefined);
    } finally {
      setBusy(false);
      // Allow re-selecting the same file after a failure.
      event.target.value = '';
    }
  }

  function handleZoom(zoom: number) {
    // Zooming out shrinks the pan limits, so the existing offset must be re-clamped or
    // a gap would open at the edge of the circle.
    onCrop(photo ? clampCrop(photo, SQUARE.photo.d, { ...crop, zoom }) : { ...crop, zoom });
  }

  const centred = crop.x === 0 && crop.y === 0 && crop.zoom === 1;

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
            onClick={() => {
              onPhoto(undefined);
              onCrop(DEFAULT_CROP);
            }}
            className="min-h-12 px-2 text-sm text-muted underline underline-offset-4 hover:text-danger"
          >
            {COPY.form.photo.remove}
          </button>
        )}
      </div>

      {photo && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label htmlFor={zoomId} className="text-sm font-medium">
              {COPY.form.photo.zoom}
            </label>
            {!centred && (
              <button
                type="button"
                onClick={() => onCrop(DEFAULT_CROP)}
                className="text-xs text-primary underline underline-offset-4"
              >
                {COPY.form.photo.recentre}
              </button>
            )}
          </div>

          <input
            id={zoomId}
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={crop.zoom}
            onChange={(e) => handleZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />

          <p className="mt-2 text-xs text-muted">
            {canPan ? COPY.form.photo.adjust : COPY.form.photo.adjustLocked}
          </p>
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
