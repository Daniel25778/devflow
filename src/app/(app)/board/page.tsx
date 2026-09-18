import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import KanbanBoard from '@/components/board/KanbanBoard';

export default async function BoardPage() {
  const user = await requireUser();
  const board = await prisma.board.findFirst({
    where: {
      workspace: {
        userId: user.id,
      },
    },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            orderBy: { updatedAt: 'desc' },
          },
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <KanbanBoard
      boardName={board.name}
      columns={board.columns.map((column) => ({
        id: column.id,
        name: column.name,
        position: column.position,
        tasks: column.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          tags: task.tags,
          columnId: task.columnId,
          updatedAt: task.updatedAt.toISOString(),
        })),
      }))}
    />
  );
}
