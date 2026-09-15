/**
 * Input validation and brand safety.
 *
 * The badge carries the Chapter's logo, so user text is length-limited, restricted to a
 * sane character set, and screened against a blocklist. Since ADR-008 removed the server
 * there is no route an attacker can post to, so this is a quality and brand-safety
 * measure rather than a security boundary — it stops accidental and casual misuse, not a
 * determined person editing their own browser.
 */

import { z } from 'zod';
import { COPY } from './content';

/**
 * Letters, combining marks, digits, spaces and light punctuation.
 * \p{L}\p{M} accepts Arabic, accented Latin, CJK and more, while excluding emoji,
 * symbols and control characters.
 */
const TEXT = /^[\p{L}\p{M}\p{N} .,'’&()/-]+$/u;

/**
 * Seed blocklist. Deliberately short and non-exhaustive: for *names*, a false positive
 * (rejecting a real person's name) is worse than a false negative, so matching is on
 * whole words after normalisation rather than substrings.
 *
 * TODO(Marketing): extend from a maintained source before launch. A curated list such as
 * the `obscenity` package covers far more, including Arabic, than is sensible to inline.
 */
const BLOCKED = new Set([
  'fuck', 'shit', 'bitch', 'cunt', 'bastard', 'dick', 'piss', 'wank', 'slut', 'whore',
  'porn', 'nazi', 'rape',
  // Arabic
  'كس', 'زب', 'شرموط', 'شرموطة', 'عاهرة', 'خول',
]);

/** Terms blocked anywhere in a token, not only as whole words. Keep very small. */
const BLOCKED_SUBSTRING = ['fuck', 'porn'];

/**
 * Fold away the usual evasions: case, diacritics, leetspeak, repeated characters and
 * punctuation used as spacing ("f.u.c.k", "fuuuck", "fu＿ck").
 */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/(.)\1{2,}/g, '$1')
    .replace(/[^\p{L}\p{N} ]/gu, '');
}

export function isBlocked(input: string): boolean {
  const normalised = normalise(input);
  const collapsed = normalised.replace(/ /g, '');

  if (BLOCKED_SUBSTRING.some((term) => collapsed.includes(term))) return true;

  return normalised
    .split(' ')
    .filter(Boolean)
    .some((token) => BLOCKED.has(token));
}

const notBlocked = (value: string) => !isBlocked(value);

/** An optional field: empty string and undefined both mean "not provided". */
const optionalText = z
  .string()
  .trim()
  .max(40, COPY.errors.nameLong)
  .refine((v) => v === '' || TEXT.test(v), COPY.errors.charset)
  .refine(notBlocked, COPY.errors.blocked)
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const badgeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, COPY.errors.nameRequired)
    .min(2, COPY.errors.nameShort)
    .max(40, COPY.errors.nameLong)
    .regex(TEXT, COPY.errors.charset)
    .refine(notBlocked, COPY.errors.blocked),
  role: optionalText,
  company: optionalText,
});

export type BadgeFields = z.infer<typeof badgeSchema>;

export type FieldErrors = Partial<Record<keyof BadgeFields, string>>;

/** Validate a single field so the form can show errors as the attendee types. */
export function validateField(field: keyof BadgeFields, value: string): string | undefined {
  const result = badgeSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** Initials for the monogram shown when no photo is attached. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return [...words[0]][0].toUpperCase();
  const first = [...words[0]][0] ?? '';
  const last = [...words[words.length - 1]][0] ?? '';
  return (first + last).toUpperCase();
}
