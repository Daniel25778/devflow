import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});
