import { prisma } from '@/lib/prisma';

export async function findClientById(clientId: number) {
  return prisma.client.findUnique({
    where: { id: clientId },
  });
}

export async function findAccountsByClient(clientId: number) {
  return prisma.account.findMany({
    where: { clientId },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function findAccountById(clientId: number, accountId: number) {
  return prisma.account.findFirst({
    where: {
      id: accountId,
      clientId,
    },
  });
}

export async function findDuplicateAccount(bankCode: string, accountNumber: string) {
  return prisma.account.findFirst({
    where: {
      bankCode,
      accountNumber,
    },
  });
}
