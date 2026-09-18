'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createTaskAction, updateTaskAction } from '@/app/actions/tasks';
import Modal from '@/components/ui/Modal';
import type { Priority, TaskDTO } from '@/lib/filter-tasks';

type BoardColumn = {
  id: string;
  name: string;
};

type TaskFormModalProps = {
  open: boolean;
  task?: TaskDTO;
  columns: BoardColumn[];
  onClose: () => void;
  onSaved?: () => void;
};

type FormErrors = Record<string, string[] | undefined>;

const emptyForm = {
  title: '',
  description: '',
  priority: 'MEDIUM' as Priority,
  tags: '',
  columnId: '',
};

export default function TaskFormModal({
  open,
  task,
  columns,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'MEDIUM',
      tags: task?.tags.join(', ') ?? '',
      columnId: task?.columnId ?? columns[0]?.id ?? '',
    });
    setErrors({});
  }, [columns, open, task]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const input = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      columnId: form.columnId,
    };

    const result = task
      ? await updateTaskAction(task.id, input)
      : await createTaskAction(input);

    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      return;
    }

    onSaved?.();
    onClose();
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Modal open={open} title={task ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="task-title">
            Título
          </label>
          <input
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
            id="task-title"
            maxLength={120}
            required
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
          />
          {errors.title?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="task-description">
            Descrição
          </label>
          <textarea
            className="mt-1 block min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
            id="task-description"
            maxLength={2000}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
          {errors.description?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700">
            Prioridade
            <select
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none focus:border-zinc-900"
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value)}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-zinc-700">
            Coluna
            <select
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none focus:border-zinc-900"
              required
              value={form.columnId}
              onChange={(event) => updateField('columnId', event.target.value)}
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>{column.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="task-tags">
            Tags
          </label>
          <input
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
            id="task-tags"
            placeholder="frontend, release"
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
          />
          {errors.tags?.map((error) => (
            <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-950"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Salvando...' : 'Salvar tarefa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
