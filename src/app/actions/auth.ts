'use server';

import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { signIn, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/validators/auth';

type RegisterActionResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]> };

type LoginActionResult =
  | { ok: true }
  | { ok: false; formError: string };

function isUniqueEmailError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export async function registerAction(formData: FormData): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;
  const passwordHash = await hash(password, 12);

  try {
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const user = await transaction.user.create({
        data: { email, passwordHash },
      });
      const workspace = await transaction.workspace.create({
        data: {
          name: 'Meu Workspace',
          userId: user.id,
        },
      });
      const board = await transaction.board.create({
        data: {
          name: 'Board Principal',
          workspaceId: workspace.id,
        },
      });

      await transaction.column.createMany({
        data: [
          { name: 'To Do', position: 0, boardId: board.id },
          { name: 'In Progress', position: 1, boardId: board.id },
          { name: 'Done', position: 2, boardId: board.id },
        ],
      });
    });
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return {
        ok: false,
        fieldErrors: { email: ['Este email já está cadastrado'] },
      };
    }

    throw error;
  }

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/board',
  });

  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { ok: false, formError: 'Email ou senha incorretos' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/board',
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { ok: false, formError: 'Email ou senha incorretos' };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
