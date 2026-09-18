'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { moveTaskAction } from '@/app/actions/tasks';
import BoardFilters from './BoardFilters';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import { filterTasks, type TaskDTO, type TaskFilters } from '@/lib/filter-tasks';

type BoardColumn = {
  id: string;
  name: string;
  position: number;
  tasks: TaskDTO[];
};

type KanbanBoardProps = {
  boardName: string;
  columns: BoardColumn[];
};

function DraggableTask({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskDTO;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-40' : undefined}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
      <div className="mt-2 flex gap-3 px-1 text-xs font-medium">
        <button className="text-zinc-500 hover:text-zinc-950" onClick={onEdit} type="button">
          Editar
        </button>
        <button className="text-red-600 hover:text-red-700" onClick={onDelete} type="button">
          Excluir
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onEdit,
  onDelete,
}: {
  column: BoardColumn;
  tasks: TaskDTO[];
  onEdit: (task: TaskDTO) => void;
  onDelete: (task: TaskDTO) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `column:${column.id}` });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-96 rounded-xl border p-4 transition ${
        isOver ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 bg-zinc-100/70'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">{column.name}</h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
      </div>
    </section>
  );
}

export default function KanbanBoard({ boardName, columns }: KanbanBoardProps) {
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [filters, setFilters] = useState<TaskFilters>({});
  const [editingTask, setEditingTask] = useState<TaskDTO>();
  const [deletingTask, setDeletingTask] = useState<TaskDTO>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskDTO>();

  const allTasks = useMemo(() => columns.flatMap((column) => column.tasks), [columns]);
  const filteredTaskIds = useMemo(
    () => new Set(filterTasks(allTasks, filters).map((task) => task.id)),
    [allTasks, filters],
  );
  const availableTags = useMemo(
    () => Array.from(new Set(allTasks.flatMap((task) => task.tags))).sort(),
    [allTasks],
  );
  const hasActiveFilters = Boolean(filters.priority || filters.tag || filters.title?.trim());

  function handleDragStart({ active }: { active: { id: string | number } }) {
    setActiveTask(allTasks.find((task) => task.id === String(active.id)));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(undefined);

    if (!over) {
      return;
    }

    const columnId = String(over.id).replace('column:', '');
    const task = allTasks.find((candidate) => candidate.id === String(active.id));

    if (!task || task.columnId === columnId) {
      return;
    }

    await moveTaskAction(task.id, columnId);
    router.refresh();
  }

  function openCreate() {
    setEditingTask(undefined);
    setIsFormOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{boardName}</h1>
        </div>
        <button
          className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          onClick={openCreate}
          type="button"
        >
          Nova tarefa
        </button>
      </div>

      <div className="mt-8">
        <BoardFilters
          availableTags={availableTags}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters({})}
        />
      </div>

      {allTasks.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Seu board está vazio</h2>
          <p className="mt-2 text-sm text-zinc-600">Crie sua primeira tarefa para começar.</p>
          <button className="mt-5 font-medium text-orange-700 hover:text-orange-800" onClick={openCreate} type="button">
            Criar primeira tarefa
          </button>
        </div>
      ) : filteredTaskIds.size === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Nenhuma tarefa encontrada</h2>
          <button className="mt-4 font-medium text-orange-700 hover:text-orange-800" onClick={() => setFilters({})} type="button">
            Limpar filtros
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragCancel={() => setActiveTask(undefined)}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {columns
              .slice()
              .sort((first, second) => first.position - second.position)
              .map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={column.tasks.filter((task) => filteredTaskIds.has(task.id))}
                  onEdit={openEdit}
                  onDelete={setDeletingTask}
                />
              ))}
          </div>
          <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      )}

      <TaskFormModal
        columns={columns.map(({ id, name }) => ({ id, name }))}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => router.refresh()}
        open={isFormOpen}
        task={editingTask}
      />
      {deletingTask ? (
        <ConfirmDeleteModal
          open
          onClose={() => setDeletingTask(undefined)}
          onDeleted={() => router.refresh()}
          taskId={deletingTask.id}
          taskTitle={deletingTask.title}
        />
      ) : null}
    </div>
  );
}
