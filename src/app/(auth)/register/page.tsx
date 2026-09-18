import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import RegisterForm from './register-form';

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/board');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">DevFlow</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Crie sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Organize seu trabalho em um board pessoal.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-zinc-600">
          Já tem uma conta?{' '}
          <Link className="font-medium text-zinc-950 underline underline-offset-4" href="/login">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
