'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ClientType = 'PF' | 'PJ';

export default function NovoClientePage() {
  const router = useRouter();
  const [type, setType] = useState<ClientType>('PF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    cnpj: '',
    legalName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'M',
    foundedDate: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    initialBalance: '0',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        addressStreet: formData.addressStreet,
        addressNumber: formData.addressNumber,
        addressComplement: formData.addressComplement || undefined,
        addressCity: formData.addressCity,
        addressState: formData.addressState,
        addressZip: formData.addressZip,
        initialBalance: formData.initialBalance,
        ...(type === 'PF' && {
          cpf: formData.cpf,
          birthDate: formData.birthDate,
          gender: formData.gender,
        }),
        ...(type === 'PJ' && {
          cnpj: formData.cnpj,
          legalName: formData.legalName,
          foundedDate: formData.foundedDate,
        }),
      };

      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar cliente');
      }

      const client = await response.json();
      router.push(`/clientes/${client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
            ← Voltar
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Novo Cliente</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seleção de Tipo */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Tipo de Cliente</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="PF"
                  checked={type === 'PF'}
                  onChange={(e) => setType(e.target.value as ClientType)}
                  className="w-4 h-4"
                />
                <span>Pessoa Física (PF)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="PJ"
                  checked={type === 'PJ'}
                  onChange={(e) => setType(e.target.value as ClientType)}
                  className="w-4 h-4"
                />
                <span>Pessoa Jurídica (PJ)</span>
              </label>
            </div>
          </div>

          {/* Dados Básicos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Dados Básicos</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {type === 'PF' ? 'Nome Completo' : 'Nome/Fantasia'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {type === 'PF' ? (
              <div>
                <label className="block text-sm font-medium mb-2">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="00000000000"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">CNPJ</label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="00000000000000"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Razão Social</label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Dados Específicos PF */}
          {type === 'PF' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Dados Pessoais</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gênero</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>
          )}

          {/* Dados Específicos PJ */}
          {type === 'PJ' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Dados da Empresa</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data de Fundação</label>
                <input
                  type="date"
                  name="foundedDate"
                  value={formData.foundedDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Endereço */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Endereço</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rua</label>
              <input
                type="text"
                name="addressStreet"
                value={formData.addressStreet}
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
                  value={formData.addressNumber}
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
                  value={formData.addressComplement}
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
                  value={formData.addressCity}
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
                  value={formData.addressState}
                  onChange={handleInputChange}
                  placeholder="SP"
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
                value={formData.addressZip}
                onChange={handleInputChange}
                placeholder="00000-000"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Movimentação Inicial */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Movimentação Inicial</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Saldo Inicial (R$)</label>
              <input
                type="number"
                name="initialBalance"
                value={formData.initialBalance}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-xs text-slate-400 mt-2">Este será o saldo inicial do cliente no sistema.</p>
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
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 rounded-lg px-6 py-3 font-semibold transition"
            >
              {loading ? 'Criando...' : 'Criar Cliente'}
            </button>
            <Link
              href="/"
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
