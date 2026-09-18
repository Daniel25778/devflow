'use client';

import type { Priority, TaskFilters } from '@/lib/filter-tasks';

type BoardFiltersProps = {
  filters: TaskFilters;
  availableTags: string[];
  onChange: (filters: TaskFilters) => void;
  onClear: () => void;
};

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
];

export default function BoardFilters({
  filters,
  availableTags,
  onChange,
  onClear,
}: BoardFiltersProps) {
  return (
    <section aria-label="Filtros de tarefas" className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto] md:items-end">
        <label className="text-sm font-medium text-zinc-700">
          Prioridade
          <select
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-900"
            value={filters.priority ?? ''}
            onChange={(event) =>
              onChange({ ...filters, priority: event.target.value as Priority | '' })
            }
          >
            <option value="">Todas</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Tag
          <select
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900 outline-none focus:border-zinc-900"
            value={filters.tag ?? ''}
            onChange={(event) => onChange({ ...filters, tag: event.target.value })}
          >
            <option value="">Todas</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Buscar por título
          <input
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            type="search"
            value={filters.title ?? ''}
            placeholder="Ex.: release"
            onChange={(event) => onChange({ ...filters, title: event.target.value })}
          />
        </label>

        <button
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
          onClick={onClear}
          type="button"
        >
          Limpar filtros
        </button>
      </div>
    </section>
  );
}
