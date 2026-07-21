import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { formatCurrency } from '@/services/balance-service';
import { calculateBilling } from '@/services/billing-service';

function getDocument(client: { cpf?: string | null; cnpj?: string | null; type: string }): string {
  if (client.type === 'PF' && client.cpf) return `CPF: ${client.cpf}`;
  if (client.type === 'PJ' && client.cnpj) return `CNPJ: ${client.cnpj}`;
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

export default async function ClientReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>;
}) {
  const { clientId } = await params;
  const { dataInicio, dataFim } = await searchParams;

  const inicio = parseDateParam(dataInicio);
  const fim = parseDateParam(dataFim);
  const validationError = validateDates(inicio, fim);

  const clientIdNumber = Number(clientId);

  const client = await prisma.client.findUnique({
    where: { id: clientIdNumber },
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
  });

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-400">Cliente não encontrado.</p>
          <Link href="/" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">Voltar</Link>
        </div>
      </main>
    );
  }

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
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Relatório Individual</p>
            <h1 className="text-3xl font-semibold">{client.name}</h1>
            <p className="mt-1 text-slate-400">{getDocument(client)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clientes/${client.id}`} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Voltar ao cliente
            </Link>
            <Link href="/relatorios" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Relatório Geral
            </Link>
          </div>
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
                href={`/clientes/${client.id}/relatorio`}
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Contas</p>
            <p className="mt-1 text-2xl font-bold">{accountCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Movimentações</p>
            <p className="mt-1 text-2xl font-bold">{movementCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Créditos</p>
            <p className="mt-1 text-2xl font-bold text-green-400">{formatCurrency(totalCredits)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Débitos</p>
            <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(totalDebits)}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Saldo Total</p>
            <p className="mt-1 text-3xl font-bold text-cyan-400">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="rounded-2xl border border-yellow-800 bg-yellow-950/20 p-6">
            <p className="text-sm text-slate-400">Valor Devido à XPTO</p>
            <p className="mt-1 text-3xl font-bold text-yellow-400">{formatCurrency(billing)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {movementCount} movimentação(ões) processada(s)
              {movementCount <= 10 ? ' a R$ 1,00 cada' : movementCount <= 20 ? ' a R$ 0,75 cada' : ' a R$ 0,50 cada'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
