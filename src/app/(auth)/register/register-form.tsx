'use client';

import { useActionState } from 'react';
import { registerAction } from '@/app/actions/auth';

type RegisterState = Awaited<ReturnType<typeof registerAction>> | undefined;

async function submitRegister(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  return registerAction(formData);
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(submitRegister, undefined);
  const emailErrors = state?.ok === false ? state.fieldErrors.email : undefined;
  const passwordErrors = state?.ok === false ? state.fieldErrors.password : undefined;

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-800" htmlFor="email">
          Email
        </label>
        <input
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {emailErrors?.map((error) => (
          <p className="mt-1 text-sm text-red-600" key={error}>
            {error}
          </p>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-800" htmlFor="password">
          Senha
        </label>
        <input
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {passwordErrors?.map((error) => (
          <p className="mt-1 text-sm text-red-600" key={error}>
            {error}
          </p>
        ))}
      </div>

      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  );
}
