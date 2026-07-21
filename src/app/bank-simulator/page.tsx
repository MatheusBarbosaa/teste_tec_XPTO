'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BankSimulatorPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/integrations/bank-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankCode: formData.get('bankCode'),
          accountNumber: formData.get('accountNumber'),
          type: formData.get('type'),
          amount: formData.get('amount'),
          description: formData.get('description'),
          transactionDate: formData.get('transactionDate'),
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(data.message || 'Erro ao enviar movimentação.');
      }
    } catch (err) {
      setError('Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Simulador</p>
            <h1 className="text-2xl font-semibold">Integração Bancária</h1>
            <p className="mt-2 text-sm text-slate-400">Simule uma movimentação de uma instituição financeira.</p>
          </div>
          <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Voltar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Código do banco</span>
              <input
                name="bankCode"
                required
                placeholder="Ex: 001"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Número da conta</span>
              <input
                name="accountNumber"
                required
                placeholder="Ex: 123456"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Tipo da movimentação</span>
              <select name="type" required className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                <option value="CREDIT">Crédito</option>
                <option value="DEBIT">Débito</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span>Valor</span>
              <input
                name="amount"
                required
                type="number"
                step="0.01"
                placeholder="Ex: 1000.00"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span>Descrição</span>
              <input
                name="description"
                required
                placeholder="Ex: Depósito via transferência"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span>Data da movimentação</span>
              <input
                name="transactionDate"
                required
                type="datetime-local"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50 hover:bg-cyan-400"
          >
            {loading ? 'Enviando...' : 'Enviar movimentação para XPTO'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-700 bg-red-950/40 p-4 text-red-300">
            <p className="font-semibold">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {response?.success && (
          <div className="mt-6 rounded-lg border border-green-700 bg-green-950/40 p-4 text-green-300">
            <p className="font-semibold">Sucesso</p>
            <p className="text-sm">{response.message}</p>
            {response.data && (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-green-400">ID da transação:</span> {response.data.transactionId}
                </p>
                <p>
                  <span className="text-green-400">Cliente:</span> {response.data.clientName}
                </p>
                <p>
                  <span className="text-green-400">Conta:</span> {response.data.accountNumber}
                </p>
                <p>
                  <span className="text-green-400">Tipo:</span> {response.data.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                </p>
                <p>
                  <span className="text-green-400">Valor:</span> R$ {response.data.amount}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
