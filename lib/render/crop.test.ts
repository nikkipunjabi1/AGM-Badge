import { describe, expect, it } from 'vitest';
import { clampCrop, DEFAULT_CROP, panLimits, photoScale } from './canvas';
import { SQUARE } from '../badge-spec';

const D = SQUARE.photo.d;
const portrait = { width: 400, height: 600 };
const landscape = { width: 900, height: 500 };
const square = { width: 500, height: 500 };

describe('photoScale', () => {
  it('covers the aperture on the short edge', () => {
    // The short edge must reach the diameter, plus the overscan that hides the seam.
    expect(portrait.width * photoScale(portrait, D, 1)).toBeGreaterThanOrEqual(D);
    expect(landscape.height * photoScale(landscape, D, 1)).toBeGreaterThanOrEqual(D);
  });

  it('scales with zoom', () => {
    expect(photoScale(square, D, 2)).toBeCloseTo(photoScale(square, D, 1) * 2);
  });
});

describe('panLimits', () => {
  it('allows vertical movement on a portrait photo', () => {
    const limits = panLimits(portrait, D, 1);
    expect(limits.y).toBeGreaterThan(0.2);
  });

  it('allows horizontal movement on a landscape photo', () => {
    const limits = panLimits(landscape, D, 1);
    expect(limits.x).toBeGreaterThan(0.2);
  });

  it('leaves a square photo with almost no room at zoom 1', () => {
    // This is exactly the case where dragging appears to do nothing, which is why the
    // UI tells the attendee to zoom in first rather than leaving them guessing.
    const limits = panLimits(square, D, 1);
    expect(limits.x).toBeLessThan(0.02);
    expect(limits.y).toBeLessThan(0.02);
  });

  it('opens up room as the attendee zooms in', () => {
    expect(panLimits(square, D, 2).x).toBeGreaterThan(panLimits(square, D, 1).x);
  });

  it('never returns a negative limit', () => {
    for (const photo of [portrait, landscape, square]) {
      const limits = panLimits(photo, D, 1);
      expect(limits.x).toBeGreaterThanOrEqual(0);
      expect(limits.y).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('clampCrop', () => {
  it('leaves a crop inside the limits untouched', () => {
    // A portrait photo has plenty of vertical room and almost none horizontally, so the
    // offsets here are picked from inside each axis's own limit.
    const limits = panLimits(portrait, D, 1);
    const crop = { x: limits.x / 2, y: limits.y / 2, zoom: 1 };
    expect(clampCrop(portrait, D, crop)).toEqual(crop);
  });

  it('clamps a pan that would expose the edge of the aperture', () => {
    const clamped = clampCrop(portrait, D, { x: 0, y: 99, zoom: 1 });
    expect(clamped.y).toBeCloseTo(panLimits(portrait, D, 1).y);
  });

  it('clamps in both directions', () => {
    const limit = panLimits(landscape, D, 1).x;
    expect(clampCrop(landscape, D, { x: -99, y: 0, zoom: 1 }).x).toBeCloseTo(-limit);
    expect(clampCrop(landscape, D, { x: 99, y: 0, zoom: 1 }).x).toBeCloseTo(limit);
  });

  it('re-clamps an existing pan when zooming back out', () => {
    // Pan hard at high zoom, then zoom out: the old offset is now out of bounds and
    // would leave a gap at the edge of the circle.
    const panned = clampCrop(square, D, { x: 0.5, y: 0.5, zoom: 2 });
    const zoomedOut = clampCrop(square, D, { ...panned, zoom: 1 });
    const limit = panLimits(square, D, 1);
    expect(Math.abs(zoomedOut.x)).toBeLessThanOrEqual(limit.x + 1e-9);
    expect(Math.abs(zoomedOut.y)).toBeLessThanOrEqual(limit.y + 1e-9);
  });

  it('preserves zoom', () => {
    expect(clampCrop(square, D, { x: 9, y: 9, zoom: 1.75 }).zoom).toBe(1.75);
  });

  it('treats the default crop as centred and valid', () => {
    expect(clampCrop(portrait, D, DEFAULT_CROP)).toEqual(DEFAULT_CROP);
  });
});
