import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(120, 'O título deve ter no máximo 120 caracteres'),
  description: z.string().max(2000, 'A descrição deve ter no máximo 2000 caracteres').default(''),
  priority: priorityEnum,
  tags: z.array(z.string().trim().max(30, 'Cada tag deve ter no máximo 30 caracteres')).max(10, 'Você pode adicionar até 10 tags').default([]),
  columnId: z.string().min(1, 'A coluna é obrigatória'),
});

export type TaskFormInput = z.infer<typeof taskSchema>;
