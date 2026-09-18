import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth';

describe('auth validators', () => {
  it('accepts a valid register payload', () => {
    expect(
      registerSchema.safeParse({
        email: 'dev@example.com',
        password: 'strongpass',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid email for register', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'strongpass',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a short password for register', () => {
    const result = registerSchema.safeParse({
      email: 'dev@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('accepts a valid login payload', () => {
    expect(
      loginSchema.safeParse({
        email: 'dev@example.com',
        password: 'strongpass',
      }).success,
    ).toBe(true);
  });
});
