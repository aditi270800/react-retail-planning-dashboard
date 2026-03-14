import type { Store, SKU, PlanningEntry } from '../types'
import { PLANNING_WEEKS } from '../utils/calendarUtils'

export const sampleStores: Store[] = [
  { id: 'ST001', name: 'Manhattan Flagship', order: 0 },
  { id: 'ST002', name: 'Brooklyn Heights', order: 1 },
  { id: 'ST003', name: 'Queens Plaza', order: 2 },
  { id: 'ST004', name: 'Bronx Center', order: 3 },
  { id: 'ST005', name: 'Staten Island Mall', order: 4 },
]

export const sampleSKUs: SKU[] = [
  { id: 'SKU001', name: 'Premium Denim Jacket', price: 149.99, cost: 52.00 },
  { id: 'SKU002', name: 'Classic White Tee', price: 34.99, cost: 8.50 },
  { id: 'SKU003', name: 'Running Sneakers Pro', price: 119.99, cost: 48.00 },
  { id: 'SKU004', name: 'Wool Blend Scarf', price: 59.99, cost: 14.00 },
  { id: 'SKU005', name: 'Leather Crossbody Bag', price: 89.99, cost: 31.00 },
  { id: 'SKU006', name: 'Slim Fit Chinos', price: 74.99, cost: 22.00 },
]

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateSamplePlanningEntries(
  stores: Store[],
  skus: SKU[],
): PlanningEntry[] {
  const entries: PlanningEntry[] = []
  let seed = 42

  for (const store of stores) {
    for (const sku of skus) {
      for (const weekDef of PLANNING_WEEKS) {
        seed++
        const baseUnits = Math.floor(seededRandom(seed) * 80) + 10
        const units = Math.round(baseUnits * (0.8 + seededRandom(seed + 1000) * 0.4))

        entries.push({
          storeId: store.id,
          skuId: sku.id,
          week: weekDef.week,
          units,
        })
      }
    }
  }

  return entries
}
