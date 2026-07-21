import { prisma } from '@/lib/prisma';
import * as clientRepository from '@/repositories/client-repository';
import { ClientType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateClientPFInput {
  type: 'PF';
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  initialBalance: number | string | Decimal;
}

export interface CreateClientPJInput {
  type: 'PJ';
  name: string;
  cnpj: string;
  legalName: string;
  email: string;
  phone: string;
  foundedDate: Date;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  initialBalance: number | string | Decimal;
}

export type CreateClientInput = CreateClientPFInput | CreateClientPJInput;

function formatCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function formatCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

function validateCpf(cpf: string): boolean {
  const cleanCpf = formatCpf(cpf);
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  
  return true;
}

function validateCnpj(cnpj: string): boolean {
  const cleanCnpj = formatCnpj(cnpj);
  
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;
  
  let size = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, size);
  let digits = cleanCnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cleanCnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

export async function createClient(input: CreateClientInput) {
  try {
    // Validar dados básicos
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!input.email || input.email.trim().length === 0) {
      throw new Error('Email é obrigatório');
    }
    
    if (!input.phone || input.phone.trim().length === 0) {
      throw new Error('Telefone é obrigatório');
    }
    
    // Validar dados de endereço
    if (!input.addressStreet || !input.addressCity || !input.addressState || !input.addressZip) {
      throw new Error('Dados de endereço incompletos');
    }
    
    // Validações específicas por tipo
    if (input.type === 'PF') {
      if (!validateCpf(input.cpf)) {
        throw new Error('CPF inválido');
      }
      
      const existingPF = await clientRepository.findClientByCpf(formatCpf(input.cpf));
      if (existingPF) {
        throw new Error('CPF já cadastrado');
      }
      
      if (!input.birthDate) {
        throw new Error('Data de nascimento é obrigatória para Pessoa Física');
      }
      
      if (!input.gender || !['M', 'F'].includes(input.gender)) {
        throw new Error('Gênero inválido (deve ser M ou F)');
      }
    } else if (input.type === 'PJ') {
      if (!validateCnpj(input.cnpj)) {
        throw new Error('CNPJ inválido');
      }
      
      const existingPJ = await clientRepository.findClientByCnpj(formatCnpj(input.cnpj));
      if (existingPJ) {
        throw new Error('CNPJ já cadastrado');
      }
      
      if (!input.legalName || input.legalName.trim().length === 0) {
        throw new Error('Razão social é obrigatória para Pessoa Jurídica');
      }
      
      if (!input.foundedDate) {
        throw new Error('Data de fundação é obrigatória para Pessoa Jurídica');
      }
    }
    
    // Converter initialBalance para Decimal
    const initialBalance = new Decimal(input.initialBalance || 0);
    
    // Criar cliente com movimentação inicial
    const client = await prisma.client.create({
      data: {
        name: input.name.trim(),
        type: input.type,
        email: input.email.trim(),
        phone: input.phone.trim(),
        cpf: input.type === 'PF' ? formatCpf(input.cpf) : null,
        cnpj: input.type === 'PJ' ? formatCnpj(input.cnpj) : null,
        legalName: input.type === 'PJ' ? input.legalName : null,
        birthDate: input.type === 'PF' ? input.birthDate : null,
        gender: input.type === 'PF' ? input.gender : null,
        foundedDate: input.type === 'PJ' ? input.foundedDate : null,
        addressStreet: input.addressStreet.trim(),
        addressNumber: input.addressNumber.trim(),
        addressComplement: input.addressComplement?.trim(),
        addressCity: input.addressCity.trim(),
        addressState: input.addressState.trim(),
        addressZip: input.addressZip.trim(),
        initialBalance,
        active: true,
      },
    });
    
    return client;
  } catch (error) {
    throw error;
  }
}

export async function listClients() {
  return clientRepository.findAllClients();
}

export async function getClientDetails(id: number) {
  const client = await clientRepository.findClientByIdWithAccounts(id);
  if (!client) {
    throw new Error('Cliente não encontrado');
  }
  if (!client.active) {
    throw new Error('Cliente está inativo');
  }
  return client;
}

export async function updateClient(id: number, data: Partial<CreateClientInput>) {
  const client = await clientRepository.findClientById(id);
  if (!client) {
    throw new Error('Cliente não encontrado');
  }
  if (!client.active) {
    throw new Error('Cliente está inativo');
  }
  
  // Construir dados para atualização
  const updateData: any = {
    name: data.name?.trim(),
    email: data.email?.trim(),
    phone: data.phone?.trim(),
    addressStreet: data.addressStreet?.trim(),
    addressNumber: data.addressNumber?.trim(),
    addressComplement: data.addressComplement?.trim(),
    addressCity: data.addressCity?.trim(),
    addressState: data.addressState?.trim(),
    addressZip: data.addressZip?.trim(),
  };
  
  // Remover valores undefined
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
  
  return clientRepository.updateClient(id, updateData);
}

export async function deactivateClient(id: number) {
  const client = await clientRepository.findClientById(id);
  if (!client) {
    throw new Error('Cliente não encontrado');
  }
  if (!client.active) {
    throw new Error('Cliente já está inativo');
  }
  
  return clientRepository.deactivateClient(id);
}
