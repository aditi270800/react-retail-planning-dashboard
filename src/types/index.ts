export interface Store {
  id: string
  name: string
  order: number
}

export interface SKU {
  id: string
  name: string
  price: number
  cost: number
}

export interface PlanningEntry {
  storeId: string
  skuId: string
  week: string
  units: number
}

export interface PlanningRow {
  rowId: string
  storeId: string
  storeName: string
  skuId: string
  skuName: string
  price: number
  cost: number
  weeks: Record<string, number>
}

export interface ChartDataPoint {
  week: string
  gmDollars: number
  gmPercent: number
  salesDollars: number
}

export type NavPage = 'stores' | 'skus' | 'planning' | 'charts'

export interface StoreState {
  stores: Store[]
}

export interface SKUState {
  skus: SKU[]
}

export interface PlanningState {
  entries: PlanningEntry[]
}

export interface RootState {
  stores: StoreState
  skus: SKUState
  planning: PlanningState
}

export interface WeekDefinition {
  week: string
  label: string
  month: string
  monthKey: string
}
