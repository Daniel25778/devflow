import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';

export default function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-semibold tracking-tight text-zinc-950" href="/board">
          DevFlow
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-zinc-600">
          <Link className="transition hover:text-zinc-950" href="/board">
            Board
          </Link>
          <Link className="transition hover:text-zinc-950" href="/dashboard">
            Dashboard
          </Link>
          <form action={logoutAction}>
            <button className="transition hover:text-zinc-950" type="submit">
              Sair
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
