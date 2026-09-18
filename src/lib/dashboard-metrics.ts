import type { Priority } from './filter-tasks';

export type DashboardTask = {
  priority: Priority;
  updatedAt: string;
  columnName: string;
};

export type DashboardMetrics = {
  byStatus: { columnName: string; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  completedLast7Days: number;
};

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
const statuses = ['To Do', 'In Progress', 'Done'];

export function calculateDashboardMetrics(
  tasks: DashboardTask[],
  now: Date = new Date(),
): DashboardMetrics {
  const statusCounts = new Map<string, number>(statuses.map((status) => [status, 0]));
  const priorityCounts = new Map<Priority, number>(priorities.map((priority) => [priority, 0]));
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const task of tasks) {
    statusCounts.set(task.columnName, (statusCounts.get(task.columnName) ?? 0) + 1);
    priorityCounts.set(task.priority, (priorityCounts.get(task.priority) ?? 0) + 1);
  }

  const completedLast7Days = tasks.filter(
    (task) => task.columnName === 'Done' && new Date(task.updatedAt) >= sevenDaysAgo,
  ).length;

  return {
    byStatus: statuses.map((columnName) => ({
      columnName,
      count: statusCounts.get(columnName) ?? 0,
    })),
    byPriority: priorities.map((priority) => ({
      priority,
      count: priorityCounts.get(priority) ?? 0,
    })),
    completedLast7Days,
  };
}
