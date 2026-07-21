import { z } from 'zod';

export const BankTransactionSchema = z.object({
  bankCode: z.string().min(1, 'Código do banco é obrigatório'),
  accountNumber: z.string().min(1, 'Número da conta é obrigatório'),
  type: z.enum(['CREDIT', 'DEBIT'], { message: 'Tipo deve ser CREDIT ou DEBIT' }),
  amount: z.string().transform((val) => parseFloat(val)).refine((val) => val > 0, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
});

export type BankTransactionInput = z.infer<typeof BankTransactionSchema>;

// Schemas para Clientes PF e PJ
export const CreateClientPFSchema = z.object({
  type: z.literal('PF'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de nascimento inválida'),
  gender: z.enum(['M', 'F'], { message: 'Gênero deve ser M ou F' }),
  addressStreet: z.string().min(3, 'Rua é obrigatória'),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  addressComplement: z.string().optional(),
  addressCity: z.string().min(2, 'Cidade é obrigatória'),
  addressState: z.string().length(2, 'Estado deve ter 2 letras'),
  addressZip: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  initialBalance: z.string().transform((val) => parseFloat(val)).refine((val) => val >= 0, 'Saldo inicial não pode ser negativo'),
});

export const CreateClientPJSchema = z.object({
  type: z.literal('PJ'),
  name: z.string().min(3, 'Nome/Fantasia deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  legalName: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  foundedDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data de fundação inválida'),
  addressStreet: z.string().min(3, 'Rua é obrigatória'),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  addressComplement: z.string().optional(),
  addressCity: z.string().min(2, 'Cidade é obrigatória'),
  addressState: z.string().length(2, 'Estado deve ter 2 letras'),
  addressZip: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  initialBalance: z.string().transform((val) => parseFloat(val)).refine((val) => val >= 0, 'Saldo inicial não pode ser negativo'),
});

export const CreateClientSchema = z.union([CreateClientPFSchema, CreateClientPJSchema]);

export type CreateClientPFInput = z.infer<typeof CreateClientPFSchema>;
export type CreateClientPJInput = z.infer<typeof CreateClientPJSchema>;
export type CreateClientFormInput = z.infer<typeof CreateClientSchema>;

