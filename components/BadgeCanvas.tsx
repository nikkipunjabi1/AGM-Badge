'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { SQUARE } from '@/lib/badge-spec';
import { COPY } from '@/lib/content';
import { clampCrop, renderBadge, type BadgeData, type Crop } from '@/lib/render/canvas';
import { preloadAssets } from '@/lib/render/assets';

type Props = {
  data: BadgeData;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onCropChange?: (crop: Crop) => void;
};

/** Arrow-key nudge, as a fraction of the aperture diameter. */
const NUDGE = 0.02;

/**
 * The live preview, and the thing that gets exported.
 *
 * The canvas is drawn at full 1200×1200 and CSS-scaled down, so the attendee sees
 * exactly the pixels they will download. When a photo is present the canvas is also the
 * control surface for positioning it: dragging here is far more direct than a pair of
 * offset sliders, which is what the attendee reaches for first anyway.
 */
export default function BadgeCanvas({ data, canvasRef, onCropChange }: Props) {
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const frame = useRef<number | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gesture = useRef<{ pointerId: number; clientX: number; clientY: number; crop: Crop } | null>(null);

  const draggable = Boolean(data.photo && onCropChange);

  useEffect(() => {
    let live = true;
    preloadAssets()
      .then(([image]) => {
        if (!live) return;
        setLogo(image);
        setReady(true);
      })
      .catch(() => {
        // A missing logo must not block the badge — draw without it rather than nothing.
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    // Debounce keystrokes, then draw inside a frame. Dragging skips the debounce so the
    // photo tracks the finger instead of lagging behind it.
    const paint = () => {
      cancelAnimationFrame(frame.current!);
      frame.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        renderBadge(ctx, data, SQUARE, logo);
      });
    };

    if (dragging) {
      paint();
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(paint, 100);
    return () => clearTimeout(timer.current);
  }, [data, ready, logo, canvasRef, dragging]);

  /** Convert a CSS-pixel delta into a crop fraction, accounting for the preview scale. */
  const toCropDelta = useCallback((deltaCss: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return (deltaCss * (SQUARE.w / rect.width)) / SQUARE.photo.d;
  }, [canvasRef]);

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!draggable || !data.crop) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      crop: data.crop,
    };
    setDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId || !data.photo) return;

    onCropChange?.(
      clampCrop(data.photo, SQUARE.photo.d, {
        zoom: start.crop.zoom,
        x: start.crop.x + toCropDelta(event.clientX - start.clientX),
        y: start.crop.y + toCropDelta(event.clientY - start.clientY),
      }),
    );
  }

  function endGesture(event: React.PointerEvent<HTMLCanvasElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLCanvasElement>) {
    if (!draggable || !data.crop || !data.photo) return;
    const step: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const move = step[event.key];
    if (!move) return;

    event.preventDefault();
    onCropChange?.(
      clampCrop(data.photo, SQUARE.photo.d, {
        zoom: data.crop.zoom,
        x: data.crop.x + move[0],
        y: data.crop.y + move[1],
      }),
    );
  }

  const described = [data.name, data.role, data.company].filter(Boolean).join(', ');

  return (
    <>
      {/* max-w in viewport-height units caps a square element's HEIGHT, so on a phone the
          form stays reachable instead of sitting two screens below an empty badge. */}
      <div className="relative mx-auto w-full max-w-[46vh] overflow-hidden rounded-2xl border border-line bg-deep-green shadow-sm lg:max-w-none">
        <canvas
          ref={canvasRef}
          width={SQUARE.w}
          height={SQUARE.h}
          className={`block h-auto w-full ${
            draggable ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          style={draggable ? { touchAction: 'none' } : undefined}
          role="img"
          aria-label={described ? `Badge preview for ${described}` : COPY.preview.empty}
          tabIndex={draggable ? 0 : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onKeyDown={handleKeyDown}
        />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-deep-green text-sm text-white/70">
            {COPY.status.rendering}
          </div>
        )}
      </div>

      {draggable && (
        <p className="mt-2 text-center text-xs text-muted lg:text-left">{COPY.preview.dragHint}</p>
      )}
    </>
  );
}
