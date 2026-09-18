import { describe, expect, it } from 'vitest';
import { taskSchema } from './task';

describe('taskSchema', () => {
  it('accepts a valid task payload', () => {
    const result = taskSchema.safeParse({
      title: 'Ship landing page',
      description: 'Finalize first version',
      priority: 'MEDIUM',
      tags: ['ui', 'frontend'],
      columnId: 'col_123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = taskSchema.safeParse({
      title: '',
      description: 'Invalid',
      priority: 'MEDIUM',
      tags: [],
      columnId: 'col_123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a title longer than 120 characters', () => {
    const result = taskSchema.safeParse({
      title: 'a'.repeat(121),
      description: 'Invalid',
      priority: 'MEDIUM',
      tags: [],
      columnId: 'col_123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a description longer than 2000 characters', () => {
    const result = taskSchema.safeParse({
      title: 'Task',
      description: 'a'.repeat(2001),
      priority: 'MEDIUM',
      tags: [],
      columnId: 'col_123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const result = taskSchema.safeParse({
      title: 'Task',
      description: 'desc',
      priority: 'MEDIUM',
      tags: Array.from({ length: 11 }, (_, index) => `tag-${index}`),
      columnId: 'col_123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a tag longer than 30 characters', () => {
    const result = taskSchema.safeParse({
      title: 'Task',
      description: 'desc',
      priority: 'MEDIUM',
      tags: ['a'.repeat(31)],
      columnId: 'col_123',
    });

    expect(result.success).toBe(false);
  });
});
