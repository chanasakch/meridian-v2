const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, precise = false): string {
  return precise ? currencyFormatterPrecise.format(value) : currencyFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatSignedPoints(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

/** Deterministic pseudo week-over-week delta for a KPI trend badge, keyed by a stable seed string. */
export function mockTrend(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const normalized = ((hash % 1000) / 1000) * 2 - 1;
  return Math.round(normalized * 85) / 10;
}
