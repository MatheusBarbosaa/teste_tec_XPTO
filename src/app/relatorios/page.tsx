import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { formatCurrency } from '@/services/balance-service';
import { calculateBilling } from '@/services/billing-service';

function getDocument(client: { cpf?: string | null; cnpj?: string | null; type: string }): string {
  if (client.type === 'PF' && client.cpf) return client.cpf;
  if (client.type === 'PJ' && client.cnpj) return client.cnpj;
  return '-';
}

function parseDateParam(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function validateDates(dataInicio?: string, dataFim?: string): string | null {
  if (!dataInicio && !dataFim) return null;

  const inicio = dataInicio ? new Date(dataInicio) : null;
  const fim = dataFim ? new Date(dataFim) : null;

  if (inicio && isNaN(inicio.getTime())) return 'Data inicial inválida.';
  if (fim && isNaN(fim.getTime())) return 'Data final inválida.';

  if (inicio && fim && inicio > fim) {
    return 'Data inicial não pode ser maior que data final.';
  }

  return null;
}

function buildDateFilter(dataInicio?: string, dataFim?: string): Record<string, unknown> {
  if (!dataInicio && !dataFim) return {};
  const filter: Record<string, Date> = {};
  if (dataInicio) filter.gte = new Date(dataInicio + 'T00:00:00.000Z');
  if (dataFim) filter.lte = new Date(dataFim + 'T23:59:59.999Z');
  return { transactionDate: filter };
}

export default async function GeneralReportPage({
  searchParams,
}: {
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>;
}) {
  const { dataInicio, dataFim } = await searchParams;

  const inicio = parseDateParam(dataInicio);
  const fim = parseDateParam(dataFim);
  const validationError = validateDates(inicio, fim);

  const clients = await prisma.client.findMany({
    where: { active: true },
    include: {
      accounts: {
        where: { active: true },
        include: {
          transactions: {
            where: validationError ? { id: -1 } : buildDateFilter(inicio, fim) as any,
            orderBy: { transactionDate: 'desc' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Relatório Geral</p>
            <h1 className="text-3xl font-semibold">Todos os Clientes</h1>
            <p className="mt-1 text-sm text-slate-400">Resumo financeiro de todos os clientes ativos.</p>
          </div>
          <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Voltar
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Filtrar por Período</h2>
          <form action="" method="GET" className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Data inicial</label>
              <input
                type="date"
                name="dataInicio"
                defaultValue={inicio ?? ''}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Data final</label>
              <input
                type="date"
                name="dataFim"
                defaultValue={fim ?? ''}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold hover:bg-cyan-500"
            >
              Filtrar
            </button>
            {(inicio || fim) && (
              <Link
                href="/relatorios"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Limpar filtro
              </Link>
            )}
          </form>
        </div>

        {validationError && (
          <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-200">
            {validationError}
          </div>
        )}

        {clients.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">Nenhum cliente ativo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Documento</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Contas</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Mov.</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Créditos</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Débitos</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Saldo</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Devido XPTO</th>
                  <th className="text-right p-4 text-slate-400 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const accounts = client.accounts;
                  const accountCount = accounts.length;

                  let totalCredits = new Decimal(0);
                  let totalDebits = new Decimal(0);
                  let totalInitialBalance = new Decimal(0);
                  let movementCount = 0;

                  for (const account of accounts) {
                    totalInitialBalance = totalInitialBalance.plus(new Decimal(account.initialBalance));

                    for (const tx of account.transactions) {
                      movementCount++;
                      if (tx.type === 'CREDIT') {
                        totalCredits = totalCredits.plus(new Decimal(tx.amount));
                      } else {
                        totalDebits = totalDebits.plus(new Decimal(tx.amount));
                      }
                    }
                  }

                  const totalBalance = totalInitialBalance.plus(totalCredits).minus(totalDebits);
                  const billing = calculateBilling(movementCount);

                  return (
                    <tr key={client.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium">{client.name}</td>
                      <td className="p-4 text-slate-400">{getDocument(client)}</td>
                      <td className="p-4 text-right">{accountCount}</td>
                      <td className="p-4 text-right">{movementCount}</td>
                      <td className="p-4 text-right text-green-400">{formatCurrency(totalCredits)}</td>
                      <td className="p-4 text-right text-red-400">{formatCurrency(totalDebits)}</td>
                      <td className="p-4 text-right text-cyan-400 font-semibold">{formatCurrency(totalBalance)}</td>
                      <td className="p-4 text-right text-yellow-400 font-semibold">{formatCurrency(billing)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/clientes/${client.id}/relatorio${inicio || fim ? `?dataInicio=${inicio ?? ''}&dataFim=${fim ?? ''}` : ''}`}
                          className="text-cyan-400 hover:text-cyan-300 text-xs"
                        >
                          Detalhar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
