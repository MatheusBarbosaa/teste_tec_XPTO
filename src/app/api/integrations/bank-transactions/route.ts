import { NextRequest, NextResponse } from 'next/server';
import { BankTransactionSchema } from '@/utils/validation';
import { processBankTransaction } from '@/services/bank-integration-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = BankTransactionSchema.parse(body);

    const result = await processBankTransaction(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Movimentação processada com sucesso.',
        data: {
          transactionId: result.transaction.id,
          clientName: result.client.name,
          accountNumber: result.account.accountNumber,
          type: result.transaction.type,
          amount: result.transaction.amount.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar movimentação.',
      },
      { status: 500 }
    );
  }
}
