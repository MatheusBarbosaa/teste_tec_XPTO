import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function findClientById(id: number) {
  return prisma.client.findUnique({
    where: { id },
  });
}

export async function findClientByIdWithAccounts(id: number) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      accounts: {
        where: { active: true },
        orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });
}

export async function findClientByCpf(cpf: string) {
  return prisma.client.findUnique({
    where: { cpf },
  });
}

export async function findClientByCnpj(cnpj: string) {
  return prisma.client.findUnique({
    where: { cnpj },
  });
}

export async function findAllClients() {
  return prisma.client.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createClient(data: Prisma.ClientCreateInput) {
  return prisma.client.create({
    data,
  });
}

export async function updateClient(id: number, data: Prisma.ClientUpdateInput) {
  return prisma.client.update({
    where: { id },
    data,
  });
}

export async function deactivateClient(id: number) {
  return prisma.client.update({
    where: { id },
    data: { active: false },
  });
}
