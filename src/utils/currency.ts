const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Used only to migrate prices saved by the previous USD-based demo.
export const LEGACY_USD_TO_INR_RATE = 83;

export function formatInr(amount: number): string {
  return inrFormatter.format(amount);
}

export function convertLegacyUsdToInr(amount: number): number {
  return Math.round(amount * LEGACY_USD_TO_INR_RATE * 100) / 100;
}
