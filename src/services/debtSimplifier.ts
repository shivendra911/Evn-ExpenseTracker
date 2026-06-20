// ─── Debt Simplifier ────────────────────────────────────
// Computes the minimum number of transactions to settle all debts.
// Pure function — no database or HTTP dependencies.
//
// Algorithm:
// 1. Compute each person's net position
// 2. Repeatedly pair the largest creditor with the largest debtor
// 3. Settle the smaller of the two amounts
// 4. Repeat until all balances are zero

export interface DebtEdge {
  fromId: string;
  toId: string;
  amountPaise: number;
}

/**
 * Given net balances (positive = owed money, negative = owes money),
 * compute the minimum set of transactions to clear all debts.
 *
 * @param balances - Map of userId → netPaise (positive = creditor, negative = debtor)
 * @returns Minimum transactions to settle all debts
 */
export function simplifyDebts(balances: Map<string, number>): DebtEdge[] {
  // Build arrays of creditors and debtors
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, amount] of balances) {
    if (amount > 0) {
      creditors.push({ id, amount });
    } else if (amount < 0) {
      debtors.push({ id, amount: -amount }); // make positive for easier math
    }
  }

  // Sort by amount descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: DebtEdge[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0) {
      settlements.push({
        fromId: debtor.id,
        toId: creditor.id,
        amountPaise: settleAmount,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return settlements;
}
