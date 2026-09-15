import { describe, expect, it } from 'vitest';
import { fitText, fontSizeOf, isArabic } from './text';
import { SQUARE, type TextFit } from '../badge-spec';

/**
 * Canvas is unavailable in Node, so measurement is modelled as a fixed ratio of font
 * size to character count. That is enough to exercise the fit → wrap → truncate ladder,
 * which is what actually breaks badges in production.
 */
const RATIO = 0.55;

function measurer() {
  const ctx = {
    font: '',
    measureText(text: string) {
      const size = parseFloat(ctx.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '16');
      return { width: text.length * size * RATIO } as TextMetrics;
    },
  };
  return ctx;
}

/** A deliberately narrow envelope, to exercise the wrap and truncate rungs of the ladder. */
const NARROW: TextFit = { max: 40, min: 30, width: 120, maxLines: 2 };

describe('fitText — the real badge envelope', () => {
  it('keeps a short name at the maximum size on one line', () => {
    const result = fitText(measurer(), 'Ali Khan', SQUARE.name, 700, 'Poppins');
    expect(result.size).toBe(SQUARE.name.max);
    expect(result.lines).toEqual(['Ali Khan']);
    expect(result.extraHeight).toBe(0);
  });

  it('steps the size down rather than overflowing', () => {
    const result = fitText(
      measurer(), 'Mohammed Abdul Rahman Al Maktoum', SQUARE.name, 700, 'Poppins',
    );
    expect(result.size).toBeLessThan(SQUARE.name.max);
    expect(result.size).toBeGreaterThanOrEqual(SQUARE.name.min);
    expect(result.lines).toHaveLength(1);
  });

  it('fits every name the validator allows without wrapping or truncating', () => {
    // Names are capped at 40 characters, so within this envelope step-down alone is
    // always enough. Wrapping is a safety net, not an expected path.
    for (const text of ['Ali', 'A'.repeat(40), 'Mohammed Abdul Rahman Al Maktoum']) {
      const result = fitText(measurer(), text, SQUARE.name, 700, 'Poppins');
      expect(result.size).toBeGreaterThanOrEqual(SQUARE.name.min);
      expect(result.lines).toHaveLength(1);
      expect(result.lines.at(-1)).not.toMatch(/…$/);
    }
  });

  it('holds single-line fields to one line', () => {
    const result = fitText(
      measurer(), 'Senior Programme Delivery Manager', SQUARE.role, 500, 'Inter',
    );
    expect(result.lines).toHaveLength(1);
  });
});

describe('fitText — wrap and truncate ladder', () => {
  it('wraps once the minimum size still does not fit', () => {
    const result = fitText(measurer(), 'Mohammed Abdul Rahman', NARROW, 700, 'Poppins');
    expect(result.size).toBe(NARROW.min);
    expect(result.lines.length).toBeGreaterThan(1);
    expect(result.extraHeight).toBeGreaterThan(0);
  });

  it('never exceeds the maximum line count', () => {
    const result = fitText(measurer(), 'A B '.repeat(12).trim(), NARROW, 700, 'Poppins');
    expect(result.lines.length).toBeLessThanOrEqual(NARROW.maxLines);
  });

  it('truncates an unbreakable string instead of overflowing', () => {
    const result = fitText(measurer(), 'A'.repeat(60), NARROW, 700, 'Poppins');
    expect(result.lines.length).toBeLessThanOrEqual(NARROW.maxLines);
    expect(result.lines.at(-1)).toMatch(/…$/);
  });

  it('never returns a size below the field minimum', () => {
    for (const text of ['Ali', 'A'.repeat(60), 'Mohammed Abdul Rahman Al Maktoum']) {
      expect(fitText(measurer(), text, NARROW, 700, 'Poppins').size)
        .toBeGreaterThanOrEqual(NARROW.min);
    }
  });
});

describe('fontSizeOf', () => {
  it('reads the pixel size, not the weight', () => {
    // parseFloat('600 30px "Poppins"') returns 600, which made letter-spacing ~20x too
    // wide and pushed the eyebrow off both edges of the badge.
    expect(fontSizeOf('600 30px "Poppins"')).toBe(30);
    expect(fontSizeOf('700 72px "Poppins"')).toBe(72);
    expect(fontSizeOf('400 26.5px "Inter"')).toBe(26.5);
  });

  it('falls back to a sane default', () => {
    expect(fontSizeOf('')).toBe(16);
  });
});

describe('isArabic', () => {
  it('detects Arabic script', () => {
    expect(isArabic('عائشة')).toBe(true);
    expect(isArabic('Aysha')).toBe(false);
    expect(isArabic('Aysha عائشة')).toBe(true);
  });
});
