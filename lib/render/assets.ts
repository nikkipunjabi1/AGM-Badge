/**
 * Asset loading for the canvas renderer: fonts and the Chapter logo.
 *
 * Both must be resolved before the first draw. Drawing before fonts are ready produces a
 * fallback-font flash that appears in the exported PNG but not on screen — easy to ship,
 * hard to notice.
 */

import { FONT } from '../badge-spec';

const LOGO_SRC = '/brand/chapter-horizontal-inverted.svg';

let logoPromise: Promise<HTMLImageElement> | null = null;
let fontsPromise: Promise<void> | null = null;

/**
 * Load the logo SVG as an image sized for the canvas.
 *
 * The source SVG carries a viewBox but no width/height, which some browsers rasterise at
 * zero size. Injecting explicit dimensions before creating the blob URL avoids that
 * without touching the original asset (which must never be edited — see CLAUDE.md).
 */
export function loadLogo(): Promise<HTMLImageElement> {
  if (logoPromise) return logoPromise;

  logoPromise = (async () => {
    const response = await fetch(LOGO_SRC);
    if (!response.ok) throw new Error(`Logo failed to load: ${response.status}`);
    let svg = await response.text();

    if (!/<svg[^>]*\swidth=/.test(svg)) {
      const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      if (viewBox) {
        svg = svg.replace('<svg', `<svg width="${viewBox[1]}" height="${viewBox[2]}"`);
      }
    }

    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    } finally {
      // The decoded image keeps its own copy; releasing the URL avoids a leak.
      URL.revokeObjectURL(url);
    }
  })();

  return logoPromise;
}

/** Resolve once every face the badge uses is available to the canvas. */
export function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;

  fontsPromise = (async () => {
    const faces = [
      `600 16px "${FONT.display}"`,
      `700 16px "${FONT.display}"`,
      `400 16px "${FONT.body}"`,
      `500 16px "${FONT.body}"`,
      `400 16px "${FONT.arabic}"`,
      `600 16px "${FONT.arabic}"`,
    ];

    // Ask for each face explicitly: document.fonts.ready alone resolves before
    // lazily-subsetted faces have actually been fetched.
    await Promise.all(
      faces.map((font) => document.fonts.load(font).catch(() => undefined)),
    );
    await document.fonts.ready;
  })();

  return fontsPromise;
}

export function preloadAssets(): Promise<[HTMLImageElement, void]> {
  return Promise.all([loadLogo(), loadFonts()]);
}
