/**
 * Photo handling — entirely in the browser.
 *
 * The photo is never uploaded, never stored, and never leaves the device (ADR-004).
 * There is no upload endpoint in this project; if one appears, something has gone wrong.
 */

import { COPY } from './content';

export const MAX_BYTES = 10 * 1024 * 1024;

/** Longest edge after downscaling. A 4000px phone photo redrawn per keystroke janks. */
const MAX_EDGE = 600;

export class PhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhotoError';
  }
}

/**
 * Decode a user-selected file into a downscaled ImageBitmap.
 *
 * `imageOrientation: 'from-image'` applies EXIF rotation — without it, portrait photos
 * from an iPhone arrive sideways.
 */
export async function loadPhoto(file: File): Promise<ImageBitmap> {
  if (file.size > MAX_BYTES) {
    throw new PhotoError(COPY.errors.photoSize);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Most commonly HEIC in Chrome, which cannot decode it. Safari can.
    throw new PhotoError(COPY.errors.photoFormat);
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= MAX_EDGE) return bitmap;

  const scale = MAX_EDGE / longest;
  try {
    const resized = await createImageBitmap(bitmap, {
      resizeWidth: Math.round(bitmap.width * scale),
      resizeHeight: Math.round(bitmap.height * scale),
      resizeQuality: 'high',
    });
    bitmap.close();
    return resized;
  } catch {
    // resize options are not universally supported; the full-size bitmap still works.
    return bitmap;
  }
}
