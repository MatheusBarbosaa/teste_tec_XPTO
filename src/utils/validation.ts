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
