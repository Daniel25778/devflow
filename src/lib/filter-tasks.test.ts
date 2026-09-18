import { describe, expect, it } from 'vitest';
import { filterTasks, type TaskDTO } from './filter-tasks';

const tasks: TaskDTO[] = [
  {
    id: '1',
    title: 'Ship dashboard',
    description: '',
    priority: 'HIGH',
    tags: ['Frontend', 'release'],
    columnId: 'todo',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Write API notes',
    description: '',
    priority: 'MEDIUM',
    tags: ['backend'],
    columnId: 'progress',
    updatedAt: '2026-09-17T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Review release checklist',
    description: '',
    priority: 'HIGH',
    tags: ['Docs'],
    columnId: 'done',
    updatedAt: '2026-09-16T10:00:00.000Z',
  },
];

describe('filterTasks', () => {
  it('returns all tasks when filters are empty', () => {
    expect(filterTasks(tasks, {})).toEqual(tasks);
  });

  it('filters by exact priority', () => {
    expect(filterTasks(tasks, { priority: 'HIGH' }).map((task) => task.id)).toEqual(['1', '3']);
  });

  it('filters tags case-insensitively', () => {
    expect(filterTasks(tasks, { tag: 'frontend' }).map((task) => task.id)).toEqual(['1']);
  });

  it('filters title by case-insensitive substring', () => {
    expect(filterTasks(tasks, { title: 'RELEASE' }).map((task) => task.id)).toEqual(['3']);
  });

  it('applies active filters with AND semantics', () => {
    expect(
      filterTasks(tasks, { priority: 'HIGH', tag: 'docs', title: 'release' }).map((task) => task.id),
    ).toEqual(['3']);
  });

  it('returns no tasks when active filters have no matches', () => {
    expect(filterTasks(tasks, { tag: 'mobile' })).toEqual([]);
  });

  it('clears all filters by accepting an empty filter object', () => {
    expect(filterTasks(tasks, { priority: '', tag: '', title: '' })).toEqual(tasks);
  });
});
