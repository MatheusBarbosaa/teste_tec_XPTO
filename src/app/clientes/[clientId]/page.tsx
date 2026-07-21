import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { listAccountsByClient } from '@/services/account-service';

export default async function ClientDetailsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const clientIdNumber = Number(clientId);

  const client = await prisma.client.findUnique({
    where: { id: clientIdNumber },
  });

  if (!client) {
    return <div className="p-8">Cliente não encontrado.</div>;
  }

  if (!client.active) {
    return <div className="p-8 text-yellow-400">Cliente inativo.</div>;
  }

  const accounts = await listAccountsByClient(clientIdNumber);

  const isoToDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cliente</p>
            <h1 className="text-3xl font-semibold">{client.name}</h1>
            <p className="mt-2 text-slate-400">
              {client.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clientes/${client.id}/relatorio`} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Relatório
            </Link>
            <Link href={`/clientes/${client.id}/editar`} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Editar
            </Link>
            <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Voltar
            </Link>
          </div>
        </div>

        {/* Informações do Cliente */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold">Informações do Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400">Nome</p>
              <p className="font-medium">{client.name}</p>
            </div>

            {client.type === 'PF' ? (
              <>
                <div>
                  <p className="text-sm text-slate-400">CPF</p>
                  <p className="font-medium">{client.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data de Nascimento</p>
                  <p className="font-medium">{isoToDate(client.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Gênero</p>
                  <p className="font-medium">{client.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-slate-400">CNPJ</p>
                  <p className="font-medium">{client.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Razão Social</p>
                  <p className="font-medium">{client.legalName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data de Fundação</p>
                  <p className="font-medium">{isoToDate(client.foundedDate)}</p>
                </div>
              </>
            )}

            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Telefone</p>
              <p className="font-medium">{client.phone}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Saldo Inicial</p>
              <p className="font-medium">R$ {client.initialBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="font-semibold mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Rua</p>
                <p>{client.addressStreet}, {client.addressNumber}</p>
              </div>
              {client.addressComplement && (
                <div>
                  <p className="text-slate-400">Complemento</p>
                  <p>{client.addressComplement}</p>
                </div>
              )}
              <div>
                <p className="text-slate-400">Cidade</p>
                <p>{client.addressCity}, {client.addressState}</p>
              </div>
              <div>
                <p className="text-slate-400">CEP</p>
                <p>{client.addressZip}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contas Bancárias */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Contas Bancárias</h2>
              <p className="text-sm text-slate-400">Gerencie as contas vinculadas a este cliente.</p>
            </div>
            <Link
              href={`/clientes/${client.id}/contas/nova`}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              + Adicionar conta
            </Link>
          </div>

          {accounts.length === 0 ? (
            <p className="text-slate-400">Nenhuma conta cadastrada para este cliente.</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{account.bankName}</p>
                      <p className="text-sm text-slate-400">
                        {account.bankCode} • Agência {account.branch} • Conta {account.accountNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/clientes/${client.id}/contas/${account.id}`}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                      >
                        Visualizar
                      </Link>
                      <Link
                        href={`/clientes/${client.id}/contas/${account.id}/editar`}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/clientes/${client.id}/contas/${account.id}/desativar`}
                        className="rounded-lg border border-red-700 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                      >
                        Desativar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
