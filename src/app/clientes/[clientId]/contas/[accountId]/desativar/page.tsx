import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deactivateAccount } from '@/services/account-service';

export default function DeactivateAccountPage({ params }: { params: Promise<{ clientId: string; accountId: string }> }) {
  async function handleDeactivate() {
    'use server';

    const { clientId, accountId } = await params;
    await deactivateAccount(Number(accountId), Number(clientId));
    redirect(`/clientes/${clientId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Desativar conta</h1>
        <p className="mt-3 text-slate-400">Esta ação marcará a conta como inativa sem remover seu histórico.</p>

        <form action={handleDeactivate} className="mt-6 flex gap-3">
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500">
            Confirmar desativação
          </button>
          <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Cancelar
          </Link>
        </form>
      </div>
    </main>
  );
}
