import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function requireUser(): Promise<{ id: string; email: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
  };
}

export async function getOwnedTaskOr404(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      board: {
        workspace: {
          userId,
        },
      },
    },
    include: {
      board: true,
      column: true,
    },
  });

  if (!task) {
    notFound();
  }

  return task;
}
