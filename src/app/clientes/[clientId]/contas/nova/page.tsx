import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAccount } from '@/services/account-service';

export default async function NewAccountPage({ params, searchParams }: { params: Promise<{ clientId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { error: errorMessage } = await searchParams;
  async function handleSubmit(formData: FormData) {
    'use server';

    const { clientId } = await params;
    const clientIdNumber = Number(clientId);

    const bankCode = formData.get('bankCode')?.toString() ?? '';
    const bankName = formData.get('bankName')?.toString() ?? '';
    const branch = formData.get('branch')?.toString() ?? '';
    const accountNumber = formData.get('accountNumber')?.toString() ?? '';
    const accountType = formData.get('accountType')?.toString() ?? '';
    const initialBalance = formData.get('initialBalance')?.toString() ?? '0';

    try {
      await createAccount({
        clientId: clientIdNumber,
        bankCode,
        bankName,
        branch,
        accountNumber,
        accountType,
        initialBalance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      redirect(`/clientes/${clientIdNumber}/contas/nova?error=${encodeURIComponent(message)}`);
    }

    redirect(`/clientes/${clientIdNumber}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Nova conta</p>
            <h1 className="text-2xl font-semibold">Adicionar conta bancária</h1>
          </div>
          <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Voltar
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-200">
            {errorMessage}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Código do banco</span>
              <input name="bankCode" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Nome do banco</span>
              <input name="bankName" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Agência</span>
              <input name="branch" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Número da conta</span>
              <input name="accountNumber" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Tipo da conta</span>
              <input name="accountType" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Saldo inicial</span>
              <input name="initialBalance" required type="number" step="0.01" defaultValue="0" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
          </div>

          <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
            Salvar conta
          </button>
        </form>
      </div>
    </main>
  );
}
