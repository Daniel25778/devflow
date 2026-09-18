'use client';

import { useState } from 'react';
import { deleteTaskAction } from '@/app/actions/tasks';
import Modal from '@/components/ui/Modal';

type ConfirmDeleteModalProps = {
  open: boolean;
  taskId: string;
  taskTitle?: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function ConfirmDeleteModal({
  open,
  taskId,
  taskTitle,
  onClose,
  onDeleted,
}: ConfirmDeleteModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleConfirm() {
    setPending(true);
    setError(undefined);

    try {
      await deleteTaskAction(taskId);
      onDeleted?.();
      onClose();
    } catch {
      setError('Não foi possível excluir a tarefa. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal open={open} title="Excluir tarefa?" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-6 text-zinc-600">
          Esta ação removerá permanentemente
          {taskTitle ? <strong className="text-zinc-900"> {taskTitle}</strong> : ' esta tarefa'}.
        </p>

        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-950"
            disabled={pending}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            onClick={handleConfirm}
            type="button"
          >
            {pending ? 'Excluindo...' : 'Excluir tarefa'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
