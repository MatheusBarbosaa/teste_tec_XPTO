import { prisma } from '@/lib/prisma';
import {
  findAccountById,
  findAccountsByClient,
  findClientById,
  findDuplicateAccount,
} from '@/repositories/account-repository';
//chefe - gerenciamento de contas
export type AccountInput = {
  clientId: number;
  bankCode: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  initialBalance: string;
};

export async function listAccountsByClient(clientId: number) {
  const client = await findClientById(clientId);

  if (!client || !client.active) {
    throw new Error('Cliente não encontrado ou inativo.');
  }

  return findAccountsByClient(clientId);
}

export async function getAccountDetails(clientId: number, accountId: number) {
  const client = await findClientById(clientId);

  if (!client || !client.active) {
    throw new Error('Cliente não encontrado ou inativo.');
  }

  return findAccountById(clientId, accountId);
}

export async function createAccount(input: AccountInput) {
  const client = await findClientById(input.clientId);

  if (!client || !client.active) {
    throw new Error('Cliente não encontrado ou inativo.');
  }

  const duplicate = await findDuplicateAccount(input.bankCode, input.accountNumber);

  if (duplicate) {
    throw new Error('Já existe uma conta com este banco e número de conta.');
  }

  return prisma.account.create({
    data: {
      clientId: input.clientId,
      bankCode: input.bankCode,
      bankName: input.bankName,
      branch: input.branch,
      accountNumber: input.accountNumber,
      accountType: input.accountType,
      initialBalance: input.initialBalance,
      active: true,
    },
  });
}

export async function updateAccount(accountId: number, clientId: number, input: Partial<AccountInput>) {
  const account = await findAccountById(clientId, accountId);

  if (!account) {
    throw new Error('Conta não encontrada.');
  }

  if (input.bankCode && input.accountNumber) {
    const duplicate = await findDuplicateAccount(input.bankCode, input.accountNumber);

    if (duplicate && duplicate.id !== accountId) {
      throw new Error('Já existe uma conta com este banco e número de conta.');
    }
  }

  return prisma.account.update({
    where: { id: accountId },
    data: {
      bankCode: input.bankCode ?? account.bankCode,
      bankName: input.bankName ?? account.bankName,
      branch: input.branch ?? account.branch,
      accountNumber: input.accountNumber ?? account.accountNumber,
      accountType: input.accountType ?? account.accountType,
      initialBalance: input.initialBalance ?? account.initialBalance.toString(),
    },
  });
}

export async function deactivateAccount(accountId: number, clientId: number) {
  const account = await findAccountById(clientId, accountId);

  if (!account) {
    throw new Error('Conta não encontrada.');
  }

  return prisma.account.update({
    where: { id: accountId },
    data: { active: false },
  });
}
