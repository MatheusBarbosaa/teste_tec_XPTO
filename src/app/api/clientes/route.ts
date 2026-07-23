import { NextRequest, NextResponse } from 'next/server';
import * as clientService from '@/services/client-service';
import { CreateClientSchema } from '@/utils/validation';
import { ZodError } from 'zod';
//serve todos os cientes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados com Zod
    const validatedData = CreateClientSchema.parse(body);
    
    // Converter birthDate/foundedDate para Date se forem strings
    const input = {
      ...validatedData,
      ...(validatedData.type === 'PF' && {
        birthDate: new Date(validatedData.birthDate as string),
      }),
      ...(validatedData.type === 'PJ' && {
        foundedDate: new Date(validatedData.foundedDate as string),
      }),
    } as any;
    
    // Criar cliente
    const client = await clientService.createClient(input);
    
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados de entrada inválidos',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clients = await clientService.listClients();
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    );
  }
}
