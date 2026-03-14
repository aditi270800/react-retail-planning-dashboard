/**
 * Core business logic calculations for the retail planning tool.
 * All functions are pure — no side effects.
 */

/**
 * Sales Dollars = Units × Price
 */
export function calculateSales(units: number, price: number): number {
  return units * price
}

/**
 * GM Dollars = Sales Dollars − (Units × Cost)
 */
export function calculateGMDollars(units: number, price: number, cost: number): number {
  const sales = calculateSales(units, price)
  return sales - units * cost
}

/**
 * GM % = GM Dollars / Sales Dollars
 * Returns 0 if sales is 0 to avoid division by zero.
 */
export function calculateGMPercent(gmDollars: number, salesDollars: number): number {
  if (salesDollars === 0) return 0
  return gmDollars / salesDollars
}

/**
 * Returns a Tailwind background class based on GM%.
 * >= 40%  → green
 * 10–40%  → yellow
 * 5–10%   → orange
 * <= 5%   → red
 */
export function getGMPercentColor(gmPercent: number): string {
  if (gmPercent >= 0.4) return 'gm-green'
  if (gmPercent >= 0.1) return 'gm-yellow'
  if (gmPercent >= 0.05) return 'gm-orange'
  return 'gm-red'
}

/**
 * Returns CSS background color string for AG Grid cell styling.
 */
export function getGMPercentBgColor(gmPercent: number): string {
  if (gmPercent >= 0.4) return 'rgba(34, 197, 94, 0.25)'
  if (gmPercent >= 0.1) return 'rgba(234, 179, 8, 0.25)'
  if (gmPercent >= 0.05) return 'rgba(249, 115, 22, 0.25)'
  return 'rgba(239, 68, 68, 0.25)'
}

export function getGMPercentTextColor(gmPercent: number): string {
  if (gmPercent >= 0.4) return '#4ade80'
  if (gmPercent >= 0.1) return '#facc15'
  if (gmPercent >= 0.05) return '#fb923c'
  return '#f87171'
}

/**
 * Format a number as currency string.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a ratio as percentage string.
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
