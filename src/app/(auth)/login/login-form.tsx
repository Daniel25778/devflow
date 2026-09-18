'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

type LoginState = Awaited<ReturnType<typeof loginAction>> | undefined;

async function submitLogin(_state: LoginState, formData: FormData): Promise<LoginState> {
  return loginAction(formData);
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(submitLogin, undefined);
  const formError = state?.ok === false ? state.formError : undefined;

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
          autoComplete="current-password"
          required
        />
      </div>

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
