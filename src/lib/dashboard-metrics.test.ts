import { describe, expect, it } from 'vitest';
import { calculateDashboardMetrics } from './dashboard-metrics';

const now = new Date('2026-09-18T12:00:00.000Z');

describe('calculateDashboardMetrics', () => {
  it('returns zero counts for an empty board', () => {
    expect(calculateDashboardMetrics([], now)).toEqual({
      byStatus: [],
      byPriority: [
        { priority: 'LOW', count: 0 },
        { priority: 'MEDIUM', count: 0 },
        { priority: 'HIGH', count: 0 },
      ],
      completedLast7Days: 0,
    });
  });

  it('counts tasks by column status and priority', () => {
    expect(
      calculateDashboardMetrics(
        [
          { columnName: 'To Do', priority: 'HIGH', updatedAt: '2026-09-18T09:00:00.000Z' },
          { columnName: 'In Progress', priority: 'MEDIUM', updatedAt: '2026-09-17T09:00:00.000Z' },
          { columnName: 'Done', priority: 'HIGH', updatedAt: '2026-09-16T09:00:00.000Z' },
        ],
        now,
      ),
    ).toEqual({
      byStatus: [
        { columnName: 'To Do', count: 1 },
        { columnName: 'In Progress', count: 1 },
        { columnName: 'Done', count: 1 },
      ],
      byPriority: [
        { priority: 'LOW', count: 0 },
        { priority: 'MEDIUM', count: 1 },
        { priority: 'HIGH', count: 2 },
      ],
      completedLast7Days: 1,
    });
  });

  it('includes Done tasks exactly at the seven-day boundary', () => {
    expect(
      calculateDashboardMetrics(
        [{ columnName: 'Done', priority: 'LOW', updatedAt: '2026-09-11T12:00:00.000Z' }],
        now,
      ).completedLast7Days,
    ).toBe(1);
  });

  it('excludes old Done tasks and recent tasks in other columns', () => {
    expect(
      calculateDashboardMetrics(
        [
          { columnName: 'Done', priority: 'LOW', updatedAt: '2026-09-11T11:59:59.999Z' },
          { columnName: 'To Do', priority: 'LOW', updatedAt: '2026-09-18T11:00:00.000Z' },
        ],
        now,
      ).completedLast7Days,
    ).toBe(0);
  });
});
