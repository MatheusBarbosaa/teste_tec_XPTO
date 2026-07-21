import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const clients = await prisma.client.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">XPTO Financial Management</p>
          <h1 className="mt-2 text-3xl font-semibold">Clientes</h1>
          <p className="mt-3 text-slate-400">Selecione um cliente para visualizar e gerenciar suas contas bancárias.</p>
          <Link href="/bank-simulator" className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300">
            → Acessar simulador bancário
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-slate-400">{client.document} • {client.type}</p>
                </div>
                <Link
                  href={`/clientes/${client.id}`}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
