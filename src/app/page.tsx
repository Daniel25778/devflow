import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1eb] text-zinc-950">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link className="text-xl font-semibold tracking-tight" href="/">
          DevFlow<span className="text-orange-600">.</span>
        </Link>
        <Link
          className="text-sm font-medium text-zinc-700 underline decoration-zinc-400 underline-offset-4 transition hover:text-orange-700"
          href="/login"
        >
          Entrar
        </Link>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-14 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-24">
        <div className="max-w-2xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
            Seu fluxo, em foco
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl">
            Menos abas.
            <br />
            Mais avanço.
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-600">
            DevFlow é o board pessoal para transformar ideias soltas em trabalho que realmente anda.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-zinc-950 px-6 py-3 font-medium text-white transition hover:bg-orange-700"
              href="/register"
            >
              Criar meu workspace
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white/60 px-6 py-3 font-medium text-zinc-800 transition hover:border-zinc-950"
              href="/login"
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="relative rotate-2 rounded-2xl border border-zinc-900/10 bg-zinc-950 p-4 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Meu Workspace</p>
                <p className="mt-1 text-xl font-medium text-white">Board Principal</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">3 colunas</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {['To Do', 'In Progress', 'Done'].map((column, index) => (
                <div className="min-h-52 rounded-xl bg-white/[0.07] p-3" key={column}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">{column}</span>
                    <span className="text-xs text-zinc-500">{index + 1}</span>
                  </div>
                  <div className="space-y-2">
                    {index < 2 ? (
                      <div className="rounded-lg bg-white p-3 text-xs text-zinc-800 shadow-sm">
                        {index === 0 ? 'Mapear próxima entrega' : 'Revisar detalhes do fluxo'}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/20 p-3 text-xs text-zinc-500">
                        Tudo em dia
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
