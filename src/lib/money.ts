// ─── Money utilities ────────────────────────────────────
// All amounts in the database are integers in paise (1 INR = 100 paise).
// Never perform arithmetic on floating-point rupee values.

/**
 * Convert rupees (as a number or string) to paise.
 * Accepts values like 250, 250.50, "250.50"
 * Rounds to nearest integer to avoid floating point issues.
 */
export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  return Math.round(num * 100);
}

/**
 * Convert paise to rupees as a number (for computation display only).
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format paise as Indian currency string.
 * Example: 50000 → "₹500.00", 167 → "₹1.67"
 */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format paise as a compact string without the currency symbol.
 * Example: 50000 → "500.00"
 */
export function formatAmount(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Compute equal split amounts in paise.
 * Handles remainder by giving extra paise to the first person.
 *
 * Example: 500 paise split among 3 → [167, 167, 166]
 * Wait, let me fix: 500 / 3 = 166.66, floor = 166, remainder = 500 - 166*3 = 2
 * So first person gets 166 + 2 = 168, others get 166.
 * Actually spec says: remainder goes to splits[0].amountPaise += totalPaise - perPersonPaise * n
 */
export function computeEqualSplit(totalPaise: number, count: number): number[] {
  if (count <= 0) return [];
  const perPerson = Math.floor(totalPaise / count);
  const remainder = totalPaise - perPerson * count;

  return Array.from({ length: count }, (_, i) =>
    i === 0 ? perPerson + remainder : perPerson
  );
}

/**
 * Compute percentage-based split amounts in paise.
 * Each percentage is applied to the total and floored.
 * Remainder goes to the first person.
 *
 * @param totalPaise - Total amount in paise
 * @param percentages - Array of percentages (must sum to 100)
 * @returns Array of amounts in paise
 */
export function computePercentageSplit(totalPaise: number, percentages: number[]): number[] {
  const amounts = percentages.map(pct => Math.floor(totalPaise * pct / 100));
  const sum = amounts.reduce((a, b) => a + b, 0);
  const remainder = totalPaise - sum;

  if (remainder > 0) {
    amounts[0] += remainder;
  }

  return amounts;
}

/**
 * Compute shares-based split amounts in paise.
 * Each person's share = floor(total * theirShares / totalShares)
 * Remainder goes to the first person.
 */
export function computeSharesSplit(totalPaise: number, shares: number[]): number[] {
  const totalShares = shares.reduce((a, b) => a + b, 0);
  if (totalShares <= 0) return shares.map(() => 0);

  const amounts = shares.map(s => Math.floor(totalPaise * s / totalShares));
  const sum = amounts.reduce((a, b) => a + b, 0);
  const remainder = totalPaise - sum;

  if (remainder > 0) {
    amounts[0] += remainder;
  }

  return amounts;
}
