// ─── Balance Engine ─────────────────────────────────────
// Pure service function that computes group balances.
// No database or HTTP dependencies — takes raw data as input.
//
// Input: all non-deleted GroupExpenses (with contributors and splits)
//        plus all Settlements for the group
//
// Output:
//   memberBalances: net balance per member (positive = owed, negative = owes)
//   pairwiseDebts:  raw debts before simplification
//   settledPlan:    minimum transactions to clear all debts

import { simplifyDebts, type DebtEdge } from './debtSimplifier';

// ─── Input Types ────────────────────────────────────────

export interface ExpenseData {
  id: string;
  totalPaise: number;
  contributors: { userId: string; amountPaise: number }[];
  splits: { userId: string; amountPaise: number }[];
}

export interface SettlementData {
  fromUserId: string;
  toUserId: string;
  amountPaise: number;
}

// ─── Output Types ───────────────────────────────────────

export interface MemberBalanceResult {
  userId: string;
  netPaise: number; // positive = owed to them, negative = they owe
}

export interface BalanceResult {
  memberBalances: MemberBalanceResult[];
  pairwiseDebts: DebtEdge[];
  settledPlan: DebtEdge[];
}

// ─── Engine ─────────────────────────────────────────────

/**
 * Compute all balances for a group.
 *
 * For each expense:
 *   - Contributors (payers) gain credit (their net goes positive)
 *   - Split members (owers) gain debt (their net goes negative)
 *
 * For each settlement:
 *   - fromUser's net goes more positive (they paid off debt)
 *   - toUser's net goes more negative (they received payment)
 *
 * @param expenses - All non-deleted group expenses with their contributors and splits
 * @param settlements - All settlements for the group
 * @param memberIds - All member IDs in the group (ensures everyone appears in results)
 * @returns BalanceResult with net balances, pairwise debts, and simplified settlement plan
 */
export function computeBalances(
  expenses: ExpenseData[],
  settlements: SettlementData[],
  memberIds: string[]
): BalanceResult {
  // Initialize net balances for all members
  const netBalances = new Map<string, number>();
  for (const id of memberIds) {
    netBalances.set(id, 0);
  }

  // Track pairwise debts: Map<"fromId:toId", amount>
  const pairwise = new Map<string, number>();

  // Process expenses
  for (const expense of expenses) {
    // Each contributor gains credit for what they paid
    for (const contributor of expense.contributors) {
      const current = netBalances.get(contributor.userId) ?? 0;
      netBalances.set(contributor.userId, current + contributor.amountPaise);
    }

    // Each split member gains debt for what they owe
    for (const split of expense.splits) {
      const current = netBalances.get(split.userId) ?? 0;
      netBalances.set(split.userId, current - split.amountPaise);

      // Track pairwise: each split member owes each contributor proportionally
      // For simplicity, compute pairwise from net balances after all expenses
    }
  }

  // Process settlements: fromUser paid toUser
  for (const settlement of settlements) {
    const fromCurrent = netBalances.get(settlement.fromUserId) ?? 0;
    const toCurrent = netBalances.get(settlement.toUserId) ?? 0;

    // fromUser's net position improves (less debt / more credit)
    netBalances.set(settlement.fromUserId, fromCurrent + settlement.amountPaise);
    // toUser's net position worsens (less credit / more debt)
    netBalances.set(settlement.toUserId, toCurrent - settlement.amountPaise);
  }

  // Build member balances array
  const memberBalances: MemberBalanceResult[] = [];
  for (const [userId, netPaise] of netBalances) {
    memberBalances.push({ userId, netPaise });
  }

  // Sort by net balance descending (creditors first)
  memberBalances.sort((a, b) => b.netPaise - a.netPaise);

  // Compute pairwise debts from expenses (before settlements)
  const rawPairwise = computeRawPairwiseDebts(expenses);

  // Apply settlements to pairwise debts
  for (const settlement of settlements) {
    const key = `${settlement.fromUserId}:${settlement.toUserId}`;
    const reverseKey = `${settlement.toUserId}:${settlement.fromUserId}`;

    if (rawPairwise.has(key)) {
      const current = rawPairwise.get(key)!;
      const newAmount = current - settlement.amountPaise;
      if (newAmount > 0) {
        rawPairwise.set(key, newAmount);
      } else if (newAmount < 0) {
        rawPairwise.delete(key);
        rawPairwise.set(reverseKey, (rawPairwise.get(reverseKey) ?? 0) + Math.abs(newAmount));
      } else {
        rawPairwise.delete(key);
      }
    } else if (rawPairwise.has(reverseKey)) {
      rawPairwise.set(reverseKey, (rawPairwise.get(reverseKey) ?? 0) + settlement.amountPaise);
    }
  }

  // Convert pairwise map to array
  const pairwiseDebts: DebtEdge[] = [];
  for (const [key, amount] of rawPairwise) {
    if (amount > 0) {
      const [fromId, toId] = key.split(':');
      pairwiseDebts.push({ fromId, toId, amountPaise: amount });
    }
  }

  // Compute simplified settlement plan
  const settledPlan = simplifyDebts(netBalances);

  return {
    memberBalances,
    pairwiseDebts,
    settledPlan,
  };
}

/**
 * Compute raw pairwise debts from expenses (ignoring settlements).
 * For each expense, each split member owes each contributor proportionally.
 */
function computeRawPairwiseDebts(expenses: ExpenseData[]): Map<string, number> {
  const debts = new Map<string, number>();

  for (const expense of expenses) {
    const totalPaid = expense.contributors.reduce((s, c) => s + c.amountPaise, 0);

    for (const split of expense.splits) {
      for (const contributor of expense.contributors) {
        // Skip if the split member is the same as the contributor
        if (split.userId === contributor.userId) continue;

        // How much of this split member's debt goes to this contributor?
        // Proportional to how much the contributor paid
        const debtAmount = Math.floor(
          (split.amountPaise * contributor.amountPaise) / totalPaid
        );

        if (debtAmount <= 0) continue;

        const key = `${split.userId}:${contributor.userId}`;
        const reverseKey = `${contributor.userId}:${split.userId}`;

        // Net the debts
        if (debts.has(reverseKey)) {
          const existing = debts.get(reverseKey)!;
          if (existing > debtAmount) {
            debts.set(reverseKey, existing - debtAmount);
          } else if (existing < debtAmount) {
            debts.delete(reverseKey);
            debts.set(key, (debts.get(key) ?? 0) + (debtAmount - existing));
          } else {
            debts.delete(reverseKey);
          }
        } else {
          debts.set(key, (debts.get(key) ?? 0) + debtAmount);
        }
      }
    }
  }

  return debts;
}
