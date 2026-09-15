/**
 * Download, share and clipboard.
 *
 * Since ADR-008 the primary action is download-then-upload: the attendee saves the PNG
 * and attaches it to a LinkedIn post themselves. No web page can attach an image to a
 * LinkedIn post on a user's behalf — LinkedIn's share endpoints take a URL, not a file.
 * The Web Share API is a mobile convenience on top of that, not the main path.
 */

export const FILENAME = 'pmi-uae-annual-gathering-2026-badge.jpg';
export const MIME = 'image/jpeg';

/**
 * Near-lossless. At 1200×1200 this badge is ~260 KB as JPEG against ~1.2 MB as PNG,
 * with no visible loss on text edges. WebP is smaller again, but LinkedIn's uploader has
 * been inconsistent with it — not a risk worth taking during a campaign.
 */
const QUALITY = 0.98;

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas produced no image'))),
      MIME,
      QUALITY,
    );
  });
}

export function downloadBlob(blob: Blob, filename = FILENAME): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick — revoking synchronously cancels the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Whether this browser can share an actual image file.
 *
 * Feature-detected, never sniffed from the user agent. Where this is false the Share
 * button is not rendered at all: an inert button is worse than no button.
 */
export function canShareFiles(blob?: Blob): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false;
  const file = new File([blob ?? new Blob([], { type: MIME })], FILENAME, { type: MIME });
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported';

export async function shareImage(blob: Blob, text: string): Promise<ShareOutcome> {
  const file = new File([blob], FILENAME, { type: MIME });
  if (!canShareFiles(blob)) return 'unsupported';

  try {
    await navigator.share({ files: [file], text });
    return 'shared';
  } catch (error) {
    // AbortError means the attendee dismissed the sheet — not a failure worth reporting.
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
