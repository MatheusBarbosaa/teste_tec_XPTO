import { prisma } from '@/lib/prisma';

export async function findAccountByBankCodeAndNumber(bankCode: string, accountNumber: string) {
  return prisma.account.findFirst({
    where: {
      bankCode,
      accountNumber,
    },
    include: {
      client: true,
    },
  });
}

export async function createTransaction(accountId: number, type: 'CREDIT' | 'DEBIT', amount: string, description: string, transactionDate: string) {
  return prisma.transaction.create({
    data: {
      accountId,
      type,
      amount,
      description,
      transactionDate: new Date(transactionDate),
    },
  });
}

export async function findTransactionsByAccountId(accountId: number) {
  return prisma.transaction.findMany({
    where: { accountId },
    orderBy: { transactionDate: 'desc' },
  });
}
