import { describe, expect, it } from 'vitest';
import { dedupeTags } from './tags';

describe('dedupeTags', () => {
  it('returns an empty list when input is empty', () => {
    expect(dedupeTags([])).toEqual([]);
  });

  it('keeps the first-seen casing for duplicates regardless of case', () => {
    expect(dedupeTags(['React', 'react', 'REACT', 'Next.js', 'next.js'])).toEqual([
      'React',
      'Next.js',
    ]);
  });

  it('preserves non-duplicate values and trims spaces', () => {
    expect(dedupeTags([' ui ', 'UI', 'backend', ' backend '])).toEqual(['ui', 'backend']);
  });
});
