import { Decimal } from '@prisma/client/runtime/library';

export function calculateBilling(transactionCount: number): Decimal {
  let rate: Decimal;

  if (transactionCount <= 10) {
    rate = new Decimal('1.00');
  } else if (transactionCount <= 20) {
    rate = new Decimal('0.75');
  } else {
    rate = new Decimal('0.50');
  }

  return rate.mul(transactionCount);
}
