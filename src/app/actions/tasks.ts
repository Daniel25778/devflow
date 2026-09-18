'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { requireUser, getOwnedTaskOr404 } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { dedupeTags } from '@/lib/tags';
import { taskSchema } from '@/lib/validators/task';

type TaskPayload = {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  tags?: string[];
  columnId?: string;
};

function refreshTaskViews() {
  revalidatePath('/board');
  revalidatePath('/dashboard');
}

export async function createTaskAction(input: TaskPayload) {
  const user = await requireUser();
  const board = await prisma.board.findFirst({
    where: { workspace: { userId: user.id } },
    include: { columns: true },
  });

  if (!board) {
    notFound();
  }

  const defaultColumn = board.columns.find((column) => column.name === 'To Do');
  const parsed = taskSchema.safeParse({
    ...input,
    priority: input.priority ?? 'MEDIUM',
    tags: dedupeTags(input.tags ?? []),
    columnId: input.columnId ?? defaultColumn?.id,
  });

  if (!parsed.success) {
    return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const column = board.columns.find((candidate) => candidate.id === parsed.data.columnId);

  if (!column) {
    notFound();
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      boardId: board.id,
      columnId: column.id,
    },
  });

  refreshTaskViews();
  return { ok: true as const, task };
}

export async function updateTaskAction(taskId: string, input: TaskPayload) {
  const user = await requireUser();
  const task = await getOwnedTaskOr404(taskId, user.id);
  const parsed = taskSchema.safeParse({
    ...input,
    priority: input.priority ?? task.priority,
    tags: dedupeTags(input.tags ?? task.tags),
    columnId: input.columnId ?? task.columnId,
  });

  if (!parsed.success) {
    return { ok: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const column = await prisma.column.findFirst({
    where: { id: parsed.data.columnId, boardId: task.boardId },
  });

  if (!column) {
    notFound();
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      columnId: column.id,
    },
  });

  refreshTaskViews();
  return { ok: true as const, task: updatedTask };
}

export async function deleteTaskAction(taskId: string) {
  const user = await requireUser();
  await getOwnedTaskOr404(taskId, user.id);
  await prisma.task.delete({ where: { id: taskId } });
  refreshTaskViews();
  return { ok: true as const };
}

export async function moveTaskAction(taskId: string, columnId: string) {
  const user = await requireUser();
  const task = await getOwnedTaskOr404(taskId, user.id);
  const column = await prisma.column.findFirst({
    where: { id: columnId, boardId: task.boardId },
  });

  if (!column) {
    notFound();
  }

  const movedTask = await prisma.task.update({
    where: { id: taskId },
    data: { columnId: column.id, updatedAt: new Date() },
  });

  refreshTaskViews();
  return { ok: true as const, task: movedTask };
}
