import { describe, expect, it } from 'vitest';
import { badgeSchema, initials, isBlocked, normalise, validateField } from './validation';

describe('accepted names', () => {
  // Rejecting a real person's name is worse than letting a rude one through, so the
  // accept list is the more important half of this table.
  it.each([
    'Ali Khan',
    'Aysha Al Maktoum',
    'José Müller-Sánchez',
    'Sara O’Brien',
    "Sara O'Brien",
    'عائشة عبد الرحمن المكتوم',
    'Xu Li',
    'Mohammed Abdul Rahman Al Maktoum',
    'Anne-Marie de la Cruz',
    'J. R. Patel',
  ])('accepts %s', (name) => {
    expect(badgeSchema.safeParse({ name }).success).toBe(true);
  });
});

describe('rejected input', () => {
  it.each([
    ['empty', ''],
    ['single character', 'A'],
    ['over 40 characters', 'A'.repeat(41)],
    ['emoji', 'Ali 🎉'],
    ['url', 'visit example.com/promo?x=1'],
    ['angle brackets', '<script>alert(1)</script>'],
  ])('rejects %s', (_label, name) => {
    expect(badgeSchema.safeParse({ name }).success).toBe(false);
  });
});

describe('blocklist', () => {
  it('blocks profanity as a whole word', () => {
    expect(isBlocked('fuck')).toBe(true);
    expect(isBlocked('Ali shit Khan')).toBe(true);
  });

  it('survives simple evasion', () => {
    expect(isBlocked('f.u.c.k')).toBe(true);
    expect(isBlocked('fuuuuck')).toBe(true);
    expect(isBlocked('sh1t')).toBe(true);
    expect(isBlocked('5hit')).toBe(true);
  });

  it('blocks Arabic profanity', () => {
    expect(isBlocked('شرموط')).toBe(true);
  });

  it('does not block innocent names containing blocked substrings', () => {
    // The Scunthorpe problem: word-boundary matching is what prevents these.
    expect(isBlocked('Dickson')).toBe(false);
    expect(isBlocked('Scunthorpe')).toBe(false);
    expect(isBlocked('Shitole')).toBe(false);
    expect(isBlocked('Aysha')).toBe(false);
  });

  it('normalises diacritics and case', () => {
    expect(normalise('FÜCK')).toBe('fuck');
  });
});

describe('optional fields', () => {
  it('treats empty strings as absent', () => {
    const parsed = badgeSchema.parse({ name: 'Ali Khan', role: '', company: '' });
    expect(parsed.role).toBeUndefined();
    expect(parsed.company).toBeUndefined();
  });

  it('accepts a valid role and company', () => {
    const parsed = badgeSchema.parse({ name: 'Ali Khan', role: 'PMO Lead', company: 'Emirates Group' });
    expect(parsed.role).toBe('PMO Lead');
    expect(parsed.company).toBe('Emirates Group');
  });

  it('reports a specific message per failure', () => {
    expect(validateField('name', '')).toBeTruthy();
    expect(validateField('name', 'A')).toBeTruthy();
    expect(validateField('name', 'Ali Khan')).toBeUndefined();
  });
});

describe('initials', () => {
  it.each([
    ['Aysha Al Maktoum', 'AM'],
    ['Ali Khan', 'AK'],
    ['Xu', 'X'],
    ['  Sara   O’Brien  ', 'SO'],
    ['عائشة المكتوم', 'عا'],
  ])('derives %s -> %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });

  it('returns empty for empty input', () => {
    expect(initials('   ')).toBe('');
  });
});
