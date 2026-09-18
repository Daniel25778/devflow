import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  getOwnedTaskOr404: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    board: { findFirst: vi.fn() },
    column: { findFirst: vi.fn() },
    task: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-guards', () => ({
  requireUser: mocks.requireUser,
  getOwnedTaskOr404: mocks.getOwnedTaskOr404,
}));
vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }) }));

import {
  createTaskAction,
  deleteTaskAction,
  moveTaskAction,
  updateTaskAction,
} from './tasks';

const user = { id: 'user-1', email: 'dev@example.com' };
const board = {
  id: 'board-1',
  columns: [
    { id: 'todo-1', name: 'To Do' },
    { id: 'progress-1', name: 'In Progress' },
  ],
};
const ownedTask = {
  id: 'task-1',
  boardId: 'board-1',
  columnId: 'todo-1',
  priority: 'MEDIUM',
  tags: ['existing'],
  board,
  column: board.columns[0],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireUser.mockResolvedValue(user);
  mocks.getOwnedTaskOr404.mockResolvedValue(ownedTask);
  mocks.prisma.board.findFirst.mockResolvedValue(board);
  mocks.prisma.column.findFirst.mockResolvedValue(board.columns[1]);
  mocks.prisma.task.create.mockResolvedValue({ id: 'task-1' });
  mocks.prisma.task.update.mockResolvedValue({ id: 'task-1', columnId: 'progress-1' });
  mocks.prisma.task.delete.mockResolvedValue({ id: 'task-1' });
});

describe('task server actions', () => {
  it('creates a medium-priority task in To Do by default and refreshes views', async () => {
    const result = await createTaskAction({ title: 'Plan release' });

    expect(result.ok).toBe(true);
    expect(mocks.prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Plan release',
        description: '',
        priority: 'MEDIUM',
        tags: [],
        boardId: 'board-1',
        columnId: 'todo-1',
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/board');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('creates a task in the requested owned column and deduplicates tags', async () => {
    await createTaskAction({
      title: 'Review UI',
      columnId: 'progress-1',
      priority: 'HIGH',
      tags: ['UI', 'ui'],
    });

    expect(mocks.prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        columnId: 'progress-1',
        priority: 'HIGH',
        tags: ['UI'],
      }),
    });
  });

  it('returns validation errors without creating an invalid task', async () => {
    const result = await createTaskAction({ title: '' });

    expect(result).toEqual({
      ok: false,
      fieldErrors: { title: ['O título é obrigatório'] },
    });
    expect(mocks.prisma.task.create).not.toHaveBeenCalled();
  });

  it('updates an owned task and verifies the destination column belongs to its board', async () => {
    const result = await updateTaskAction('task-1', {
      title: 'Updated task',
      columnId: 'progress-1',
      priority: 'LOW',
      tags: ['planning'],
    });

    expect(result.ok).toBe(true);
    expect(mocks.prisma.column.findFirst).toHaveBeenCalledWith({
      where: { id: 'progress-1', boardId: 'board-1' },
    });
    expect(mocks.prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {
        title: 'Updated task',
        description: '',
        priority: 'LOW',
        tags: ['planning'],
        columnId: 'progress-1',
      },
    });
  });

  it('returns validation errors without updating an invalid task', async () => {
    const result = await updateTaskAction('task-1', { title: 'x'.repeat(121) });

    expect(result.ok).toBe(false);
    expect(mocks.prisma.task.update).not.toHaveBeenCalled();
  });

  it('hard-deletes an owned task and refreshes both views', async () => {
    const result = await deleteTaskAction('task-1');

    expect(result).toEqual({ ok: true });
    expect(mocks.prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/board');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('moves an owned task and explicitly bumps updatedAt', async () => {
    const before = Date.now();
    const result = await moveTaskAction('task-1', 'progress-1');
    const after = Date.now();
    const updateCall = mocks.prisma.task.update.mock.calls[0][0];

    expect(result.ok).toBe(true);
    expect(updateCall).toMatchObject({
      where: { id: 'task-1' },
      data: { columnId: 'progress-1' },
    });
    expect(updateCall.data.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(updateCall.data.updatedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it('uses the ownership guard before deleting a task', async () => {
    mocks.getOwnedTaskOr404.mockRejectedValue(new Error('NEXT_NOT_FOUND'));

    await expect(deleteTaskAction('foreign-task')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.prisma.task.delete).not.toHaveBeenCalled();
  });

  it('uses the ownership guard before moving a task', async () => {
    mocks.getOwnedTaskOr404.mockRejectedValue(new Error('NEXT_NOT_FOUND'));

    await expect(moveTaskAction('foreign-task', 'progress-1')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.prisma.task.update).not.toHaveBeenCalled();
  });
});
