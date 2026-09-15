'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { SQUARE } from '@/lib/badge-spec';
import { COPY } from '@/lib/content';
import { renderBadge, type BadgeData } from '@/lib/render/canvas';
import { preloadAssets } from '@/lib/render/assets';

type Props = {
  data: BadgeData;
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

/**
 * The live preview — and the thing that gets exported.
 *
 * The canvas is drawn at full 1200×1200 and CSS-scaled down, so the attendee sees
 * exactly the pixels they will download. There is no second export path to drift.
 */
export default function BadgeCanvas({ data, canvasRef }: Props) {
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const frame = useRef<number | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

    // Debounce keystrokes, then draw inside a frame.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      cancelAnimationFrame(frame.current!);
      frame.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        renderBadge(ctx, data, SQUARE, logo);
      });
    }, 100);

    return () => clearTimeout(timer.current);
  }, [data, ready, logo, canvasRef]);

  const described = [data.name, data.role, data.company].filter(Boolean).join(', ');

  return (
    // max-w in viewport-height units caps a square element's HEIGHT, so on a phone the
    // form stays reachable instead of sitting two screens below an empty badge.
    <div className="relative mx-auto w-full max-w-[46vh] overflow-hidden rounded-2xl border border-line bg-deep-green shadow-sm lg:max-w-none">
      <canvas
        ref={canvasRef}
        width={SQUARE.w}
        height={SQUARE.h}
        className="block h-auto w-full"
        role="img"
        aria-label={described ? `Badge preview for ${described}` : COPY.preview.empty}
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-deep-green text-sm text-white/70">
          {COPY.status.rendering}
        </div>
      )}
    </div>
  );
}
