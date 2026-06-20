// ─── Split Computer ─────────────────────────────────────
// Pure functions that compute how much each person owes for an expense
// based on the split type. All computations in paise (integers).
// No database or HTTP dependencies.

import {
  computeEqualSplit,
  computePercentageSplit,
  computeSharesSplit,
} from '@/lib/money';

export interface SplitInput {
  userId: string;
  amountPaise?: number; // for EXACT
  percentage?: number;  // for PERCENTAGE
  shares?: number;      // for SHARES
}

export interface ComputedSplit {
  userId: string;
  amountPaise: number;
  percentage?: number;
  shares?: number;
}

/**
 * Compute split amounts for each person based on the split type.
 *
 * @param splitType - EQUAL, EXACT, PERCENTAGE, or SHARES
 * @param totalPaise - Total expense amount in paise
 * @param splits - Array of split inputs (user selections)
 * @returns Array of computed splits with exact paise amounts
 */
export function computeSplits(
  splitType: string,
  totalPaise: number,
  splits: SplitInput[]
): ComputedSplit[] {
  switch (splitType) {
    case 'EQUAL':
      return computeEqualSplits(totalPaise, splits);
    case 'EXACT':
      return computeExactSplits(totalPaise, splits);
    case 'PERCENTAGE':
      return computePercentageSplits(totalPaise, splits);
    case 'SHARES':
      return computeSharesSplits(totalPaise, splits);
    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }
}

function computeEqualSplits(totalPaise: number, splits: SplitInput[]): ComputedSplit[] {
  const amounts = computeEqualSplit(totalPaise, splits.length);
  return splits.map((split, i) => ({
    userId: split.userId,
    amountPaise: amounts[i],
  }));
}

function computeExactSplits(totalPaise: number, splits: SplitInput[]): ComputedSplit[] {
  const sumSplits = splits.reduce((sum, s) => sum + (s.amountPaise ?? 0), 0);

  if (sumSplits !== totalPaise) {
    throw new Error(
      `Split amounts sum to ${sumSplits}, expected ${totalPaise}`
    );
  }

  return splits.map(split => ({
    userId: split.userId,
    amountPaise: split.amountPaise ?? 0,
  }));
}

function computePercentageSplits(totalPaise: number, splits: SplitInput[]): ComputedSplit[] {
  const percentages = splits.map(s => s.percentage ?? 0);
  const sumPct = percentages.reduce((a, b) => a + b, 0);

  // Allow ±0.01 tolerance
  if (Math.abs(sumPct - 100) > 0.01) {
    throw new Error(
      `Percentages sum to ${sumPct}, expected 100`
    );
  }

  const amounts = computePercentageSplit(totalPaise, percentages);

  return splits.map((split, i) => ({
    userId: split.userId,
    amountPaise: amounts[i],
    percentage: split.percentage,
  }));
}

function computeSharesSplits(totalPaise: number, splits: SplitInput[]): ComputedSplit[] {
  const shares = splits.map(s => s.shares ?? 1);
  const amounts = computeSharesSplit(totalPaise, shares);

  return splits.map((split, i) => ({
    userId: split.userId,
    amountPaise: amounts[i],
    shares: split.shares,
  }));
}

/**
 * Validate that contributor amounts sum to the expense total.
 */
export function validateContributors(
  totalPaise: number,
  contributors: { userId: string; amountPaise: number }[]
): void {
  const sumContributed = contributors.reduce((sum, c) => sum + c.amountPaise, 0);

  if (sumContributed !== totalPaise) {
    throw new Error(
      `Contributor amounts sum to ${sumContributed}, expected ${totalPaise}`
    );
  }
}
