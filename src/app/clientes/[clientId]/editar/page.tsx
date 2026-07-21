'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ClientData {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ClientData | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clientes/${clientId}`);
        if (!response.ok) throw new Error('Erro ao buscar cliente');
        const client = await response.json();
        setFormData(client);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/clientes/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar cliente');
      }

      router.push(`/clientes/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-2xl">
          <p>Carregando...</p>
        </div>
      </main>
    );
  }

  if (!formData) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-2xl">
          <p className="text-red-400">Cliente não encontrado</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href={`/clientes/${clientId}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
            ← Voltar
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Editar Cliente</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Básicos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Dados Básicos</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.type === 'PF' ? 'Nome Completo' : 'Nome/Fantasia'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name ?? ''}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email ?? ''}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone ?? ''}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Endereço</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rua</label>
              <input
                type="text"
                name="addressStreet"
                value={formData.addressStreet ?? ''}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número</label>
                <input
                  type="text"
                  name="addressNumber"
                  value={formData.addressNumber ?? ''}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Complemento</label>
                <input
                  type="text"
                  name="addressComplement"
                  value={formData.addressComplement || ''}
                  onChange={handleInputChange}
                  placeholder="Apto, sala, etc"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  name="addressCity"
                  value={formData.addressCity ?? ''}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado (UF)</label>
                <input
                  type="text"
                  name="addressState"
                  value={formData.addressState ?? ''}
                  onChange={handleInputChange}
                  maxLength={2}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CEP</label>
              <input
                type="text"
                name="addressZip"
                value={formData.addressZip ?? ''}
                onChange={handleInputChange}
                placeholder="00000-000"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 rounded-lg px-6 py-3 font-semibold transition"
            >
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link
              href={`/clientes/${clientId}`}
              className="flex-1 bg-slate-800 hover:bg-slate-700 rounded-lg px-6 py-3 font-semibold text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
