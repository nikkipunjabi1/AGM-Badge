/**
 * Text layout for the badge canvas: auto-fit, wrapping and Arabic run detection.
 *
 * Long names are the most common way a generated badge breaks, and it is the failure
 * that ships to social media unnoticed — so this module is the most heavily tested part
 * of the renderer. Rules are in docs/DESIGN-SPEC.md §6.
 */

import { FONT, type TextFit } from '../badge-spec';

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function isArabic(text: string): boolean {
  return ARABIC.test(text);
}

/** Font family for a string, switching to the Arabic face for Arabic text runs. */
export function familyFor(text: string, latin: string): string {
  return isArabic(text) ? `${FONT.arabic}, ${latin}` : latin;
}

export type FittedText = {
  lines: string[];
  size: number;
  /** Extra vertical space consumed beyond a single line, so callers can shift what follows. */
  extraHeight: number;
};

type MeasureContext = Pick<CanvasRenderingContext2D, 'measureText'> & { font: string };

function widthOf(ctx: MeasureContext, text: string, font: string): number {
  ctx.font = font;
  return ctx.measureText(text).width;
}

function wrap(ctx: MeasureContext, text: string, font: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (widthOf(ctx, candidate, font) <= max || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function truncate(ctx: MeasureContext, text: string, font: string, max: number): string {
  let out = text;
  while (out.length > 1 && widthOf(ctx, `${out}…`, font) > max) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * Fit text into its envelope: step the size down, then wrap, then truncate.
 *
 * @param weight CSS font weight, e.g. 700
 */
export function fitText(
  ctx: MeasureContext,
  text: string,
  fit: TextFit,
  weight: number,
  family: string,
): FittedText {
  const resolved = familyFor(text, family);
  const fontAt = (size: number) => `${weight} ${size}px "${resolved}"`;

  // 1. Step down to the minimum looking for a single-line fit.
  for (let size = fit.max; size >= fit.min; size -= 2) {
    if (widthOf(ctx, text, fontAt(size)) <= fit.width) {
      return { lines: [text], size, extraHeight: 0 };
    }
  }

  // 2. At the minimum size, wrap.
  const font = fontAt(fit.min);
  const wrapped = wrap(ctx, text, font, fit.width);

  // 3. Clip anything still too wide. A single unbreakable word is kept whole by wrap(),
  //    so without this it would silently overflow the badge.
  const kept = wrapped.slice(0, fit.maxLines).map((line) =>
    widthOf(ctx, line, font) > fit.width ? truncate(ctx, line, font, fit.width) : line,
  );

  return {
    lines: kept,
    size: fit.min,
    extraHeight: (kept.length - 1) * fit.min * 1.15,
  };
}

/** Pull the pixel size out of a CSS font shorthand — parseFloat would return the weight. */
export function fontSizeOf(font: string): number {
  return Number(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 16);
}

/** Draw letter-spaced text centred on x. Canvas has no tracking, so space it by hand. */
export function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
): void {
  const size = fontSizeOf(ctx.font);
  const spacing = size * tracking;
  const chars = [...text];
  const total =
    chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);

  let cursor = x - total / 2;
  const previous = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const char of chars) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
  ctx.textAlign = previous;
}
