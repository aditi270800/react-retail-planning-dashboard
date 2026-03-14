import { createSelector } from '@reduxjs/toolkit'
import type { RootState, PlanningRow, ChartDataPoint } from '../types'
import { PLANNING_WEEKS } from '../utils/calendarUtils'
import {
  calculateSales,
  calculateGMDollars,
  calculateGMPercent,
} from '../utils/planningCalculations'

export const selectStores = (state: RootState) => state.stores.stores
export const selectSKUs = (state: RootState) => state.skus.skus
export const selectEntries = (state: RootState) => state.planning.entries

/** Build a lookup map: "storeId|skuId|week" -> units */
export const selectEntriesMap = createSelector(selectEntries, entries => {
  const map = new Map<string, number>()
  for (const e of entries) {
    map.set(`${e.storeId}|${e.skuId}|${e.week}`, e.units)
  }
  return map
})

/** Build planning rows (Store × SKU cross join) */
export const selectPlanningRows = createSelector(
  selectStores,
  selectSKUs,
  selectEntriesMap,
  (stores, skus, entriesMap): PlanningRow[] => {
    const rows: PlanningRow[] = []

    for (const store of stores) {
      for (const sku of skus) {
        const weeks: Record<string, number> = {}
        for (const wd of PLANNING_WEEKS) {
          const key = `${store.id}|${sku.id}|${wd.week}`
          weeks[wd.week] = entriesMap.get(key) ?? 0
        }
        rows.push({
          rowId: `${store.id}|${sku.id}`,
          storeId: store.id,
          storeName: store.name,
          skuId: sku.id,
          skuName: sku.name,
          price: sku.price,
          cost: sku.cost,
          weeks,
        })
      }
    }

    return rows
  }
)

/** Chart data for a specific store — aggregate across all SKUs */
export const selectChartDataForStore = createSelector(
  selectStores,
  selectSKUs,
  selectEntriesMap,
  (_state: RootState, storeId: string) => storeId,
  (stores, skus, entriesMap, storeId): ChartDataPoint[] => {
    const store = stores.find(s => s.id === storeId)
    if (!store) return []

    return PLANNING_WEEKS.map(wd => {
      let totalSales = 0
      let totalGM = 0

      for (const sku of skus) {
        const key = `${storeId}|${sku.id}|${wd.week}`
        const units = entriesMap.get(key) ?? 0
        totalSales += calculateSales(units, sku.price)
        totalGM += calculateGMDollars(units, sku.price, sku.cost)
      }

      return {
        week: `${wd.month.slice(0, 3)} ${wd.label}`,
        gmDollars: Math.round(totalGM),
        gmPercent: parseFloat((calculateGMPercent(totalGM, totalSales) * 100).toFixed(1)),
        salesDollars: Math.round(totalSales),
      }
    })
  }
)
