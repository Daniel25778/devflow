import type { TaskDTO } from '@/lib/filter-tasks';

type BoardColumn = {
  id: string;
  name: string;
  position: number;
  tasks: TaskDTO[];
};

type MoveOptimisticInput = {
  taskId: string;
  columnId: string;
};

export function moveTaskOptimistically(
  columns: BoardColumn[],
  { taskId, columnId }: MoveOptimisticInput,
): BoardColumn[] {
  let movedTask: TaskDTO | undefined;

  const remainingColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      if (task.id === taskId) {
        movedTask = { ...task, columnId };
        return false;
      }

      return true;
    }),
  }));

  if (!movedTask) {
    return columns;
  }

  return remainingColumns.map((column) =>
    column.id === columnId
      ? { ...column, tasks: [movedTask as TaskDTO, ...column.tasks] }
      : column,
  );
}
