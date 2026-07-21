import Link from 'next/link';
import { getAccountDetails } from '@/services/account-service';

export default async function AccountDetailsPage({ params }: { params: Promise<{ clientId: string; accountId: string }> }) {
  const { clientId, accountId } = await params;
  const account = await getAccountDetails(Number(clientId), Number(accountId));

  if (!account) {
    return <div className="p-8 text-slate-100">Conta não encontrada.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Detalhes da conta</p>
            <h1 className="text-2xl font-semibold">{account.bankName}</h1>
          </div>
          <Link href={`/clientes/${clientId}`} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Voltar
          </Link>
        </div>

        <div className="space-y-3 text-sm text-slate-300">
          <p><span className="text-slate-500">Código do banco:</span> {account.bankCode}</p>
          <p><span className="text-slate-500">Nome do banco:</span> {account.bankName}</p>
          <p><span className="text-slate-500">Agência:</span> {account.branch}</p>
          <p><span className="text-slate-500">Número da conta:</span> {account.accountNumber}</p>
          <p><span className="text-slate-500">Tipo:</span> {account.accountType}</p>
          <p><span className="text-slate-500">Saldo inicial:</span> {account.initialBalance.toString()}</p>
          <p><span className="text-slate-500">Status:</span> {account.active ? 'Ativa' : 'Desativada'}</p>
        </div>
      </div>
    </main>
  );
}
