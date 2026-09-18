import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hash: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({ hash: mocks.hash }));
vi.mock('@/auth', () => ({ signIn: mocks.signIn, signOut: mocks.signOut }));
vi.mock('@/lib/prisma', () => ({ prisma: mocks.prisma }));

import { loginAction, logoutAction, registerAction } from './auth';

function formData(values: Record<string, string>): FormData {
  const data = new FormData();

  for (const [key, value] of Object.entries(values)) {
    data.append(key, value);
  }

  return data;
}

describe('auth server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hash.mockResolvedValue('hashed-password');
    mocks.signIn.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it('registers a user and bootstraps the workspace graph atomically', async () => {
    const transaction = {
      user: { create: vi.fn().mockResolvedValue({ id: 'user-1' }) },
      workspace: { create: vi.fn().mockResolvedValue({ id: 'workspace-1' }) },
      board: { create: vi.fn().mockResolvedValue({ id: 'board-1' }) },
      column: { createMany: vi.fn().mockResolvedValue({ count: 3 }) },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(transaction));

    const result = await registerAction(
      formData({ email: 'dev@example.com', password: 'password123' }),
    );

    expect(result).toEqual({ ok: true });
    expect(transaction.user.create).toHaveBeenCalledWith({
      data: { email: 'dev@example.com', passwordHash: 'hashed-password' },
    });
    expect(transaction.workspace.create).toHaveBeenCalledWith({
      data: { name: 'Meu Workspace', userId: 'user-1' },
    });
    expect(transaction.board.create).toHaveBeenCalledWith({
      data: { name: 'Board Principal', workspaceId: 'workspace-1' },
    });
    expect(transaction.column.createMany).toHaveBeenCalledWith({
      data: [
        { name: 'To Do', position: 0, boardId: 'board-1' },
        { name: 'In Progress', position: 1, boardId: 'board-1' },
        { name: 'Done', position: 2, boardId: 'board-1' },
      ],
    });
    expect(mocks.signIn).toHaveBeenCalledWith('credentials', {
      email: 'dev@example.com',
      password: 'password123',
      redirectTo: '/board',
    });
  });

  it('returns a field error for a duplicate email without signing in', async () => {
    const transaction = {
      user: { create: vi.fn().mockRejectedValue({ code: 'P2002' }) },
      workspace: { create: vi.fn() },
      board: { create: vi.fn() },
      column: { createMany: vi.fn() },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(transaction));

    const result = await registerAction(
      formData({ email: 'dev@example.com', password: 'password123' }),
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: { email: ['Este email já está cadastrado'] },
    });
    expect(mocks.prisma.$transaction).toHaveBeenCalledOnce();
    expect(transaction.user.create).toHaveBeenCalledOnce();
    expect(transaction.workspace.create).not.toHaveBeenCalled();
    expect(transaction.board.create).not.toHaveBeenCalled();
    expect(transaction.column.createMany).not.toHaveBeenCalled();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('returns field errors and does not create an account for invalid registration data', async () => {
    const result = await registerAction(
      formData({ email: 'not-an-email', password: 'short' }),
    );

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        email: ['Email inválido'],
        password: ['A senha deve ter pelo menos 8 caracteres'],
      },
    });
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('logs in with valid credentials and redirects to the board', async () => {
    const result = await loginAction(
      formData({ email: 'dev@example.com', password: 'password123' }),
    );

    expect(result).toEqual({ ok: true });
    expect(mocks.signIn).toHaveBeenCalledWith('credentials', {
      email: 'dev@example.com',
      password: 'password123',
      redirectTo: '/board',
    });
  });

  it('returns the generic error when login credentials are invalid', async () => {
    mocks.signIn.mockRejectedValue(new Error('invalid credentials'));

    const result = await loginAction(
      formData({ email: 'dev@example.com', password: 'password123' }),
    );

    expect(result).toEqual({ ok: false, formError: 'Email ou senha incorretos' });
  });

  it('preserves the Auth.js redirect after a valid login', async () => {
    const redirectError = Object.assign(new Error('redirect'), {
      digest: 'NEXT_REDIRECT;push;/board;307;',
    });
    mocks.signIn.mockRejectedValue(redirectError);

    await expect(
      loginAction(formData({ email: 'dev@example.com', password: 'password123' })),
    ).rejects.toBe(redirectError);
  });

  it('ends the session and redirects to login on logout', async () => {
    await logoutAction();

    expect(mocks.signOut).toHaveBeenCalledWith({ redirectTo: '/login' });
  });
});
