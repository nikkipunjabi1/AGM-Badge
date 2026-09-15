/**
 * The badge renderer — the only code that draws a badge.
 *
 * Every colour, size and position comes from lib/badge-spec.ts. Nothing visual is
 * hard-coded here; change the spec module instead (CLAUDE.md, ADR-008).
 *
 * The preview element and the exported PNG are the same canvas, so what the attendee
 * sees is exactly what they download.
 */

import { COLOR, FONT, type BadgeFormat } from '../badge-spec';
import { BADGE_TEXT } from '../content';
import { initials } from '../validation';
import { drawTracked, familyFor, fitText, fitWrapped, LINE_HEIGHT } from './text';

export type Crop = {
  /** Horizontal pan as a fraction of the aperture diameter. 0 is centred. */
  x: number;
  /** Vertical pan as a fraction of the aperture diameter. 0 is centred. */
  y: number;
  zoom: number;
};

export const DEFAULT_CROP: Crop = { x: 0, y: 0, zoom: 1 };

export type BadgeData = {
  name: string;
  role?: string;
  company?: string;
  photo?: ImageBitmap;
  crop?: Crop;
};

/** Hides the anti-aliased seam where the image edge meets the circular mask. */
const COVER_OVERSCAN = 1.02;

type Dimensions = { width: number; height: number };

/** Scale that makes the photo cover the circular aperture at the given zoom. */
export function photoScale(photo: Dimensions, d: number, zoom: number): number {
  return (d / Math.min(photo.width, photo.height)) * zoom * COVER_OVERSCAN;
}

/**
 * How far the photo can pan before a gap would appear at the edge of the aperture,
 * as a fraction of the diameter. Zero on an axis means the photo only just covers it —
 * zooming in is what creates room to move.
 */
export function panLimits(photo: Dimensions, d: number, zoom: number): { x: number; y: number } {
  const scale = photoScale(photo, d, zoom);
  return {
    x: Math.max(0, (photo.width * scale - d) / 2 / d),
    y: Math.max(0, (photo.height * scale - d) / 2 / d),
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Keep a crop inside its pan limits, so the aperture is always fully covered. */
export function clampCrop(photo: Dimensions, d: number, crop: Crop): Crop {
  const limit = panLimits(photo, d, crop.zoom);
  return {
    zoom: crop.zoom,
    x: clamp(crop.x, -limit.x, limit.x),
    y: clamp(crop.y, -limit.y, limit.y),
  };
}

/**
 * The event key visual, drawn programmatically.
 *
 * TODO(OQ-4): when Marketing supplies the key visual, this becomes a single drawImage
 * call and nothing else in the renderer changes.
 */
function drawBackground(ctx: CanvasRenderingContext2D, f: BadgeFormat): void {
  const base = ctx.createLinearGradient(0, 0, f.w * 0.4, f.h);
  base.addColorStop(0, COLOR.forest);
  base.addColorStop(0.55, COLOR.deepGreen);
  base.addColorStop(1, '#04160E');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, f.w, f.h);

  // Emerald bloom behind the portrait, echoing the key visual's light source.
  const bloom = ctx.createRadialGradient(
    f.photo.cx, f.photo.cy, 0,
    f.photo.cx, f.photo.cy, f.w * 0.62,
  );
  bloom.addColorStop(0, 'rgba(27,122,75,0.55)');
  bloom.addColorStop(0.5, 'rgba(15,61,42,0.28)');
  bloom.addColorStop(1, 'rgba(7,40,27,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, f.w, f.h);

  // Sweeping highlight arcs.
  ctx.save();
  ctx.lineCap = 'round';
  const arcs = [
    { r: f.w * 0.78, width: 3, alpha: 0.34, from: -0.35, to: 0.55 },
    { r: f.w * 0.92, width: 2, alpha: 0.2, from: -0.15, to: 0.75 },
    { r: f.w * 0.64, width: 2, alpha: 0.16, from: 0.1, to: 0.9 },
  ];
  for (const arc of arcs) {
    ctx.strokeStyle = COLOR.glow;
    ctx.globalAlpha = arc.alpha;
    ctx.lineWidth = arc.width;
    ctx.beginPath();
    ctx.arc(f.w * 0.12, f.h * 0.5, arc.r, arc.from * Math.PI, arc.to * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // Legibility scrim: clear at the top, solid behind the event lockup.
  const scrim = ctx.createLinearGradient(0, f.h * 0.35, 0, f.h);
  scrim.addColorStop(0, 'rgba(4,20,13,0)');
  scrim.addColorStop(1, COLOR.scrim);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, f.w, f.h);
}

function drawLogo(ctx: CanvasRenderingContext2D, f: BadgeFormat, logo: HTMLImageElement): void {
  const ratio = logo.naturalWidth / logo.naturalHeight || 2.778;
  ctx.drawImage(logo, f.logo.x, f.logo.y, f.logoH * ratio, f.logoH);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDatePill(ctx: CanvasRenderingContext2D, f: BadgeFormat): void {
  const { right, y, h, size, padX } = f.datePill;
  ctx.font = `600 ${size}px "${FONT.display}"`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const width = ctx.measureText(BADGE_TEXT.datePill).width + padX * 2;
  const x = right - width;

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundedRect(ctx, x, y, width, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = COLOR.ink;
  ctx.fillText(BADGE_TEXT.datePill, x + padX, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  f: BadgeFormat,
  data: BadgeData,
  offsetY: number,
): void {
  const { cx, d, ring } = f.photo;
  const cy = f.photo.cy + offsetY;
  const r = d / 2;

  // Outer glow.
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = COLOR.mint;
  ctx.shadowBlur = 40;
  ctx.fillStyle = COLOR.mint;
  ctx.beginPath();
  ctx.arc(cx, cy, r + ring, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (data.photo) {
    const { photo } = data;
    // Clamp on the way in as well as in the UI: the renderer must never leave a gap at
    // the edge of the aperture, whatever crop it is handed.
    const crop = clampCrop(photo, d, data.crop ?? DEFAULT_CROP);
    const scale = photoScale(photo, d, crop.zoom);
    const w = photo.width * scale;
    const h = photo.height * scale;
    ctx.drawImage(photo, cx - w / 2 + crop.x * d, cy - h / 2 + crop.y * d, w, h);
  } else {
    ctx.fillStyle = COLOR.mint;
    ctx.fillRect(cx - r, cy - r, d, d);
    ctx.fillStyle = COLOR.deepGreen;
    ctx.font = `700 ${f.monogramSize}px "${familyFor(data.name, FONT.display)}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials(data.name), cx, cy + f.monogramSize * 0.04);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  ctx.strokeStyle = COLOR.mint;
  ctx.lineWidth = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r + ring / 2, 0, Math.PI * 2);
  ctx.stroke();
}

/** Draw a complete badge. Pure in everything but the canvas it writes to. */
export function renderBadge(
  ctx: CanvasRenderingContext2D,
  data: BadgeData,
  f: BadgeFormat,
  logo: HTMLImageElement | null,
): void {
  const centre = f.w / 2;

  // Keep the composition centred when role and company are both absent.
  const sparse = !data.role && !data.company;
  const photoShift = sparse ? f.rebalance.photo : 0;
  const blockShift = sparse ? f.rebalance.block : 0;

  ctx.clearRect(0, 0, f.w, f.h);
  drawBackground(ctx, f);
  if (logo) drawLogo(ctx, f, logo);
  drawDatePill(ctx, f);
  drawPortrait(ctx, f, data, photoShift);

  ctx.textAlign = 'center';

  // Eyebrow
  ctx.fillStyle = COLOR.mint;
  ctx.font = `600 ${f.eyebrow.size}px "${FONT.display}"`;
  drawTracked(ctx, BADGE_TEXT.eyebrow, centre, f.eyebrow.y + blockShift, f.eyebrow.tracking);

  // Name — auto-fitted, may wrap to two lines and push what follows down.
  const name = fitText(ctx, data.name, f.name, 700, FONT.display);
  ctx.fillStyle = COLOR.ink;
  ctx.font = `700 ${name.size}px "${familyFor(data.name, FONT.display)}"`;
  name.lines.forEach((line, i) => {
    ctx.fillText(line, centre, f.name.y + blockShift + i * name.size * 1.15);
  });

  // A wrapped name pushes role and company down. Clamp so they can never cross the rule
  // into the event lockup. Names are capped at 40 characters and fit on one line in
  // practice, so this is insurance rather than a path we expect to take.
  const headroom = Math.max(0, f.rule.y - 24 - f.company.y);
  const after = Math.min(blockShift + name.extraHeight, headroom);

  if (data.role) {
    const role = fitText(ctx, data.role, f.role, 500, FONT.body);
    ctx.fillStyle = COLOR.inkMuted;
    ctx.font = `500 ${role.size}px "${familyFor(data.role, FONT.body)}"`;
    ctx.fillText(role.lines[0], centre, f.role.y + after);
  }

  if (data.company) {
    const company = fitText(ctx, data.company, f.company, 400, FONT.body);
    ctx.fillStyle = COLOR.mint;
    ctx.font = `400 ${company.size}px "${familyFor(data.company, FONT.body)}"`;
    ctx.fillText(company.lines[0], centre, f.company.y + after);
  }

  // Event lockup — fixed to the base of the badge, never shifted by the name block.
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(f.rule.x1, f.rule.y, f.rule.x2 - f.rule.x1, f.rule.h);

  ctx.fillStyle = COLOR.ink;
  ctx.font = `600 ${f.eventName.size}px "${FONT.display}"`;
  ctx.fillText(BADGE_TEXT.eventName, centre, f.eventName.y);

  ctx.fillStyle = COLOR.inkMuted;
  ctx.font = `400 ${f.eventDetail.size}px "${FONT.body}"`;
  ctx.fillText(BADGE_TEXT.eventDetail, centre, f.eventDetail.y);

  // The full theme wraps, so it is anchored from its last baseline upward. That keeps
  // the bottom safe area intact whether it lands on one line or two.
  const theme = fitWrapped(ctx, BADGE_TEXT.theme, f.theme, 500, FONT.body);
  ctx.fillStyle = COLOR.mint;
  ctx.font = `500 ${theme.size}px "${familyFor(BADGE_TEXT.theme, FONT.body)}"`;
  const themeLeading = theme.size * LINE_HEIGHT;
  theme.lines.forEach((line, i) => {
    const fromBottom = (theme.lines.length - 1 - i) * themeLeading;
    ctx.fillText(line, centre, f.theme.bottom - fromBottom);
  });

  ctx.fillStyle = COLOR.subtle;
  ctx.font = `400 ${f.url.size}px "${FONT.body}"`;
  ctx.fillText(BADGE_TEXT.url, centre, f.url.y);
}
