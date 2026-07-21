import Link from 'next/link';
import { getAccountDetails } from '@/services/account-service';
import { findTransactionsByAccountId } from '@/repositories/transaction-repository';
import { calculateBalance, formatCurrency } from '@/services/balance-service';

export default async function AccountDetailsPage({ params }: { params: Promise<{ clientId: string; accountId: string }> }) {
  const { clientId, accountId } = await params;
  const account = await getAccountDetails(Number(clientId), Number(accountId));

  if (!account) {
    return <div className="p-8 text-slate-100">Conta não encontrada.</div>;
  }

  const transactions = await findTransactionsByAccountId(Number(accountId));

  const credits = transactions
    .filter((t) => t.type === 'CREDIT')
    .map((t) => t.amount);

  const debits = transactions
    .filter((t) => t.type === 'DEBIT')
    .map((t) => t.amount);

  const balance = calculateBalance(account.initialBalance, credits, debits);

  const creditTransactions = transactions.filter((t) => t.type === 'CREDIT');
  const debitTransactions = transactions.filter((t) => t.type === 'DEBIT');

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Detalhes da conta</p>
              <h1 className="text-2xl font-semibold">{account.bankName}</h1>
            </div>
            <Link href={`/clientes/${clientId}`} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Voltar
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <span className="text-slate-500">Código do banco:</span> {account.bankCode}
              </p>
              <p>
                <span className="text-slate-500">Nome do banco:</span> {account.bankName}
              </p>
              <p>
                <span className="text-slate-500">Agência:</span> {account.branch}
              </p>
              <p>
                <span className="text-slate-500">Número da conta:</span> {account.accountNumber}
              </p>
              <p>
                <span className="text-slate-500">Tipo:</span> {account.accountType}
              </p>
              <p>
                <span className="text-slate-500">Status:</span> {account.active ? 'Ativa' : 'Desativada'}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm">
              <h3 className="font-semibold text-cyan-400">Resumo Financeiro</h3>
              <p>
                <span className="text-slate-500">Saldo inicial:</span>{' '}
                <span className="font-semibold">{formatCurrency(balance.initialBalance)}</span>
              </p>
              <p>
                <span className="text-slate-500">Total de créditos:</span>{' '}
                <span className="font-semibold text-green-400">+{formatCurrency(balance.totalCredits)}</span>
              </p>
              <p>
                <span className="text-slate-500">Total de débitos:</span>{' '}
                <span className="font-semibold text-red-400">-{formatCurrency(balance.totalDebits)}</span>
              </p>
              <div className="border-t border-slate-700 pt-2">
                <p>
                  <span className="text-slate-500">Saldo atual:</span>{' '}
                  <span className="text-lg font-bold text-cyan-400">{formatCurrency(balance.currentBalance)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-6 text-xl font-semibold">Histórico de movimentações</h2>

          {transactions.length === 0 ? (
            <p className="text-slate-400">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="space-y-6">
              {creditTransactions.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-green-400">Créditos</h3>
                  <div className="space-y-2">
                    {creditTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-lg border border-green-900/30 bg-green-950/20 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{tx.description}</p>
                          <p className="text-xs text-slate-400">{new Date(tx.transactionDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="text-sm font-bold text-green-400">+{formatCurrency(tx.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debitTransactions.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-red-400">Débitos</h3>
                  <div className="space-y-2">
                    {debitTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between rounded-lg border border-red-900/30 bg-red-950/20 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{tx.description}</p>
                          <p className="text-xs text-slate-400">{new Date(tx.transactionDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="text-sm font-bold text-red-400">-{formatCurrency(tx.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
