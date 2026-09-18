export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  columnId: string;
  updatedAt: string;
};

export type TaskFilters = {
  priority?: Priority | '';
  tag?: string;
  title?: string;
};

export function filterTasks(tasks: TaskDTO[], filters: TaskFilters): TaskDTO[] {
  const searchTitle = filters.title?.trim().toLocaleLowerCase() ?? '';
  const searchTag = filters.tag?.trim().toLocaleLowerCase() ?? '';

  return tasks.filter((task) => {
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesTag =
      !searchTag || task.tags.some((tag) => tag.toLocaleLowerCase() === searchTag);
    const matchesTitle = !searchTitle || task.title.toLocaleLowerCase().includes(searchTitle);

    return matchesPriority && matchesTag && matchesTitle;
  });
}
