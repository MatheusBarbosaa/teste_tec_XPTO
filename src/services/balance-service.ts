import { Decimal } from '@prisma/client/runtime/library';
//calcula todo o saldo
export interface BalanceCalculation {
  initialBalance: Decimal;
  totalCredits: Decimal;
  totalDebits: Decimal;
  currentBalance: Decimal;
}

export function calculateBalance(
  initialBalance: Decimal | number | string,
  credits: (Decimal | number | string)[],
  debits: (Decimal | number | string)[]
): BalanceCalculation {
  const initial = new Decimal(initialBalance);
  
  const totalCreditsAmount = credits.reduce((sum: Decimal, credit) => {
    return sum.plus(new Decimal(credit));
  }, new Decimal(0));

  const totalDebitsAmount = debits.reduce((sum: Decimal, debit) => {
    return sum.plus(new Decimal(debit));
  }, new Decimal(0));

  const current = initial.plus(totalCreditsAmount).minus(totalDebitsAmount);

  return {
    initialBalance: initial,
    totalCredits: totalCreditsAmount,
    totalDebits: totalDebitsAmount,
    currentBalance: current,
  };
}

export function formatCurrency(value: Decimal | number | string): string {
  const decimal = new Decimal(value);
  return 'R$ ' + decimal.toFixed(2).toString();
}
