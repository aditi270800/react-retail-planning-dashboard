import { useMemo, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ColGroupDef, CellValueChangedEvent, GridReadyEvent } from 'ag-grid-community'
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Download, RotateCcw, Database, AlertTriangle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { upsertEntry, resetPlanning, setEntries } from '../../store/slices/planningSlice'
import { setStores } from '../../store/slices/storeSlice'
import { setSKUs } from '../../store/slices/skuSlice'
import { selectStores, selectSKUs, selectPlanningRows } from '../../store/selectors'
import { PLANNING_WEEKS } from '../../utils/calendarUtils'
import {
  calculateSales,
  calculateGMDollars,
  calculateGMPercent,
  getGMPercentBgColor,
  getGMPercentTextColor,
  formatCurrency,
  formatPercent,
} from '../../utils/planningCalculations'
import { sampleStores, sampleSKUs, generateSamplePlanningEntries } from '../../data/sampleData'
import { Button } from '../ui'

ModuleRegistry.registerModules([ClientSideRowModelModule])

// Group weeks by month
const monthGroups = PLANNING_WEEKS.reduce((acc, wd) => {
  if (!acc[wd.monthKey]) acc[wd.monthKey] = { month: wd.month, weeks: [] }
  acc[wd.monthKey].weeks.push(wd)
  return acc
}, {} as Record<string, { month: string; weeks: typeof PLANNING_WEEKS }>)

export function PlanningPage() {
  const dispatch = useAppDispatch()
  const stores = useAppSelector(selectStores)
  const skus = useAppSelector(selectSKUs)
  const rows = useAppSelector(selectPlanningRows)
  const gridRef = useRef<AgGridReact>(null)

  const isEmpty = stores.length === 0 || skus.length === 0

  // Build flat row data for AG Grid
  const rowData = useMemo(() => rows.map(row => {
    const data: Record<string, unknown> = {
      rowId: row.rowId,
      storeName: row.storeName,
      skuName: row.skuName,
      price: row.price,
      cost: row.cost,
      storeId: row.storeId,
      skuId: row.skuId,
    }
    for (const wd of PLANNING_WEEKS) {
      data[`u_${wd.week}`] = row.weeks[wd.week] ?? 0
    }
    return data
  }), [rows])

  // Column definitions — fixed + month/week groups
  const columnDefs = useMemo((): (ColDef | ColGroupDef)[] => {
    const pinned: ColDef[] = [
      {
        field: 'storeName',
        headerName: 'Store',
        width: 155,
        pinned: 'left',
        cellStyle: { fontWeight: '600', color: '#f1f5f9' },
      },
      {
        field: 'skuName',
        headerName: 'SKU',
        width: 175,
        pinned: 'left',
        cellStyle: { color: '#94a3b8' },
      },
    ]

    const weekCols: ColGroupDef[] = Object.values(monthGroups).map(({ month, weeks }) => ({
      headerName: month,
      marryChildren: true,
      children: weeks.map(wd => ({
        headerName: wd.label,
        marryChildren: true,
        children: [
          {
            headerName: 'Units',
            field: `u_${wd.week}`,
            width: 72,
            editable: true,
            cellClass: 'editable-cell',
            valueParser: (p: { newValue: string }) => {
              const n = parseInt(p.newValue, 10)
              return isNaN(n) || n < 0 ? 0 : n
            },
            cellStyle: {
              color: '#c7d2fe',
              backgroundColor: 'rgba(99,102,241,0.07)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
            },
          },
          {
            headerName: 'Sales $',
            width: 82,
            valueGetter: (p: { data: Record<string, unknown> }) => {
              const u = (p.data[`u_${wd.week}`] as number) || 0
              return calculateSales(u, p.data.price as number)
            },
            valueFormatter: (p: { value: number }) => formatCurrency(p.value),
            cellStyle: { color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' },
          },
          {
            headerName: 'GM $',
            width: 78,
            valueGetter: (p: { data: Record<string, unknown> }) => {
              const u = (p.data[`u_${wd.week}`] as number) || 0
              return calculateGMDollars(u, p.data.price as number, p.data.cost as number)
            },
            valueFormatter: (p: { value: number }) => formatCurrency(p.value),
            cellStyle: { color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' },
          },
          {
            headerName: 'GM%',
            width: 65,
            valueGetter: (p: { data: Record<string, unknown> }) => {
              const u = (p.data[`u_${wd.week}`] as number) || 0
              const sales = calculateSales(u, p.data.price as number)
              const gm = calculateGMDollars(u, p.data.price as number, p.data.cost as number)
              return calculateGMPercent(gm, sales)
            },
            valueFormatter: (p: { value: number }) => formatPercent(p.value),
            cellStyle: (p: { value: number }) => ({
              backgroundColor: getGMPercentBgColor(p.value),
              color: getGMPercentTextColor(p.value),
              fontWeight: '700',
              textAlign: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
            }),
          },
        ] as ColDef[],
      })),
    }))

    return [...pinned, ...weekCols]
  }, [])

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: false,
    resizable: true,
    suppressMovable: true,
  }), [])

  const onCellValueChanged = useCallback((e: CellValueChangedEvent) => {
    const field = e.colDef.field as string
    if (!field?.startsWith('u_')) return
    const week = field.replace('u_', '')
    dispatch(upsertEntry({
      storeId: e.data.storeId as string,
      skuId: e.data.skuId as string,
      week,
      units: Number(e.newValue) || 0,
    }))
  }, [dispatch])

  const importSample = useCallback(() => {
    dispatch(setStores(sampleStores))
    dispatch(setSKUs(sampleSKUs))
    dispatch(setEntries(generateSamplePlanningEntries(sampleStores, sampleSKUs)))
  }, [dispatch])

  const resetData = useCallback(() => {
    if (confirm('Reset all planning units? Store and SKU definitions are kept.')) dispatch(resetPlanning())
  }, [dispatch])

  const exportCSV = useCallback(() => {
    gridRef.current?.api?.exportDataAsCsv({ fileName: 'retail-plan.csv' })
  }, [])

  const onGridReady = useCallback((_p: GridReadyEvent) => {}, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border bg-surface-1 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-lg font-bold text-white">Planning Grid</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {rows.length.toLocaleString()} rows &middot; {stores.length} stores &times; {skus.length} SKUs &middot; {PLANNING_WEEKS.length} weeks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={importSample}>
            <Database size={13} /> Load Sample Data
          </Button>
          <Button variant="ghost" size="sm" onClick={resetData} disabled={isEmpty}>
            <RotateCcw size={13} /> Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCSV} disabled={isEmpty}>
            <Download size={13} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-yellow-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-yellow-500" />
            </div>
            <h2 className="text-white font-semibold text-lg">Grid is empty</h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              You need at least one Store and one SKU before the planning matrix can be built.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Button variant="primary" onClick={importSample}>
                <Database size={14} /> Load Sample Data
              </Button>
            </div>
            <p className="text-gray-700 text-xs mt-4">
              Or add Stores &amp; SKUs manually from the sidebar
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden ag-theme-alpine-dark planning-grid">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onCellValueChanged={onCellValueChanged}
            onGridReady={onGridReady}
            rowHeight={34}
            headerHeight={30}
            groupHeaderHeight={26}
            suppressRowClickSelection
            enableCellTextSelection
            animateRows={false}
            rowBuffer={30}
          />
        </div>
      )}
    </div>
  )
}
