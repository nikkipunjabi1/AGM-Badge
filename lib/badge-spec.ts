/**
 * Badge specification — the single source of truth for the artwork.
 *
 * Transcribed from docs/DESIGN-SPEC.md. The renderer reads every colour, size and
 * position from here; nothing visual is hard-coded in lib/render/canvas.ts.
 * When a value changes, change it here and in the design doc, nowhere else.
 */

/** PMI core palette — extracted from the official logo SVG. Authoritative. */
export const PMI = {
  purple: '#4F17A8',
  cyan: '#05BFE0',
  orange: '#FF610F',
} as const;

/**
 * Annual Gathering 2026 event palette, sampled from the key visual.
 * TODO(OQ-4): confirm against the source artwork when Marketing supplies it.
 */
export const COLOR = {
  deepGreen: '#07281B',
  forest: '#0F3D2A',
  emerald: '#1B7A4B',
  mint: '#6EE7A8',
  glow: '#A7F3C6',
  ink: '#FFFFFF',
  inkMuted: 'rgba(255,255,255,0.82)',
  scrim: 'rgba(4,20,13,0.72)',
} as const;

export const FONT = {
  display: 'Poppins',
  body: 'Inter',
  arabic: 'IBM Plex Sans Arabic',
} as const;

/** A text field's auto-fit envelope (docs/DESIGN-SPEC.md §6). */
export type TextFit = {
  max: number;
  min: number;
  width: number;
  maxLines: number;
};

export type BadgeFormat = {
  /** Canvas dimensions in pixels. */
  w: number;
  h: number;
  safe: number;
  logoH: number;
  logo: { x: number; y: number };
  datePill: { right: number; y: number; h: number; size: number; padX: number };
  photo: { cx: number; cy: number; d: number; ring: number };
  monogramSize: number;
  eyebrow: { y: number; size: number; tracking: number };
  name: TextFit & { y: number };
  role: TextFit & { y: number };
  company: TextFit & { y: number };
  rule: { x1: number; x2: number; y: number; h: number };
  eventName: { y: number; size: number };
  eventDetail: { y: number; size: number };
  /** The full event theme. Wraps, and is anchored from its LAST baseline so it always
   *  respects the bottom safe area whether it takes one line or two. */
  theme: TextFit & { bottom: number };
  /** Applied when role and company are both empty, to keep the composition centred. */
  rebalance: { photo: number; block: number };
};

export const SQUARE: BadgeFormat = {
  w: 1200,
  h: 1200,
  safe: 80,
  logoH: 68,
  logo: { x: 80, y: 72 },
  datePill: { right: 1120, y: 76, h: 56, size: 26, padX: 28 },
  photo: { cx: 600, cy: 440, d: 300, ring: 4 },
  monogramSize: 120,
  eyebrow: { y: 676, size: 30, tracking: 0.18 },
  name: { y: 772, max: 72, min: 40, width: 1000, maxLines: 2 },
  role: { y: 830, max: 34, min: 26, width: 900, maxLines: 1 },
  company: { y: 880, max: 34, min: 26, width: 900, maxLines: 1 },
  rule: { x1: 200, x2: 1000, y: 914, h: 2 },
  eventName: { y: 970, size: 40 },
  eventDetail: { y: 1014, size: 30 },
  theme: { bottom: 1108, max: 30, min: 21, width: 720, maxLines: 2 },
  rebalance: { photo: 20, block: 40 },
};

/** Story format (US-09). Same vertical order, scaled ×1.25, clear of platform UI. */
export const STORY: BadgeFormat = {
  w: 1080,
  h: 1920,
  safe: 96,
  logoH: 76,
  logo: { x: 96, y: 150 },
  datePill: { right: 984, y: 154, h: 64, size: 30, padX: 32 },
  photo: { cx: 540, cy: 720, d: 420, ring: 5 },
  monogramSize: 170,
  eyebrow: { y: 1030, size: 36, tracking: 0.18 },
  name: { y: 1140, max: 92, min: 50, width: 888, maxLines: 2 },
  role: { y: 1212, max: 42, min: 32, width: 820, maxLines: 1 },
  company: { y: 1274, max: 42, min: 32, width: 820, maxLines: 1 },
  rule: { x1: 200, x2: 880, y: 1490, h: 2 },
  eventName: { y: 1556, size: 48 },
  eventDetail: { y: 1612, size: 36 },
  theme: { bottom: 1740, max: 36, min: 26, width: 800, maxLines: 3 },
  rebalance: { photo: 24, block: 48 },
};

export const FORMATS = { square: SQUARE, story: STORY } as const;
export type FormatName = keyof typeof FORMATS;
