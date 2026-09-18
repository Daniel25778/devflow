import type { TaskDTO } from '@/lib/filter-tasks';

type TaskCardProps = {
  task: TaskDTO;
};

const priorityLabels: Record<TaskDTO['priority'], string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const priorityStyles: Record<TaskDTO['priority'], string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-6 text-zinc-950">{task.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
