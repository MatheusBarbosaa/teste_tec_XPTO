import { BankTransactionInput } from '@/utils/validation';
import { findAccountByBankCodeAndNumber, createTransaction } from '@/repositories/transaction-repository';
//arquivo chefe - transações
export async function processBankTransaction(input: BankTransactionInput) {
  const account = await findAccountByBankCodeAndNumber(input.bankCode, input.accountNumber);

  if (!account) {
    throw new Error('Conta não encontrada.');
  }

  if (!account.active) {
    throw new Error('Conta está inativa.');
  }

  if (!account.client.active) {
    throw new Error('Cliente está inativo.');
  }

  if (input.amount <= 0) {
    throw new Error('Valor deve ser maior que zero.');
  }

  const transaction = await createTransaction(
    account.id,
    input.type,
    input.amount.toString(),
    input.description,
    input.transactionDate
  );

  return {
    success: true,
    transaction,
    account,
    client: account.client,
  };
}
