import Link from 'next/link';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { calculateDashboardMetrics } from '@/lib/dashboard-metrics';

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
} as const;

export default async function DashboardPage() {
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
            select: {
              priority: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  const metrics = calculateDashboardMetrics(
    board?.columns.flatMap((column) =>
      column.tasks.map((task) => ({
        priority: task.priority,
        updatedAt: task.updatedAt.toISOString(),
        columnName: column.name,
      })),
    ) ?? [],
  );
  const hasTasks = metrics.byStatus.some((status) => status.count > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Visão geral</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">Acompanhe o ritmo do seu trabalho.</p>
        </div>
        <Link className="font-medium text-orange-700 hover:text-orange-800" href="/board">
          Ir para o board
        </Link>
      </div>

      {!hasTasks ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Ainda não há tarefas</h2>
          <p className="mt-2 text-sm text-zinc-600">Crie uma tarefa no board para acompanhar suas métricas.</p>
          <Link className="mt-5 inline-block font-medium text-orange-700 hover:text-orange-800" href="/board">
            Criar primeira tarefa
          </Link>
        </div>
      ) : null}

      <section aria-label="Métricas principais" className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Concluídas nos últimos 7 dias</p>
          <p className="mt-3 text-4xl font-semibold text-zinc-950">{metrics.completedLast7Days}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total de tarefas</p>
          <p className="mt-3 text-4xl font-semibold text-zinc-950">
            {metrics.byStatus.reduce((total, status) => total + status.count, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Prioridade alta</p>
          <p className="mt-3 text-4xl font-semibold text-zinc-950">
            {metrics.byPriority.find((priority) => priority.priority === 'HIGH')?.count ?? 0}
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6" aria-labelledby="status-title">
          <h2 className="text-lg font-semibold text-zinc-950" id="status-title">Por status</h2>
          <ul className="mt-5 space-y-3">
            {metrics.byStatus.map((status) => (
              <li className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm" key={status.columnName}>
                <span className="text-zinc-600">{status.columnName}</span>
                <span className="font-semibold text-zinc-950">{status.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6" aria-labelledby="priority-title">
          <h2 className="text-lg font-semibold text-zinc-950" id="priority-title">Por prioridade</h2>
          <ul className="mt-5 space-y-3">
            {metrics.byPriority.map((priority) => (
              <li className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm" key={priority.priority}>
                <span className="text-zinc-600">{priorityLabels[priority.priority]}</span>
                <span className="font-semibold text-zinc-950">{priority.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
