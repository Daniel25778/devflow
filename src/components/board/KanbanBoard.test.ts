import { describe, expect, it } from 'vitest';
import { moveTaskOptimistically } from './move-task-optimistic';

const columns = [
  {
    id: 'todo',
    name: 'To Do',
    position: 0,
    tasks: [
      {
        id: 'task-1',
        title: 'Move me',
        description: '',
        priority: 'MEDIUM' as const,
        tags: [],
        columnId: 'todo',
        updatedAt: '2026-09-18T10:00:00.000Z',
      },
    ],
  },
  { id: 'done', name: 'Done', position: 2, tasks: [] },
];

describe('moveTaskOptimistically', () => {
  it('moves the task immediately to the top of the destination column', () => {
    const result = moveTaskOptimistically(columns, { taskId: 'task-1', columnId: 'done' });

    expect(result[0].tasks).toEqual([]);
    expect(result[1].tasks[0]).toMatchObject({ id: 'task-1', columnId: 'done' });
  });

  it('preserves the board when the task is not found', () => {
    const result = moveTaskOptimistically(columns, { taskId: 'missing', columnId: 'done' });

    expect(result).toBe(columns);
  });
});