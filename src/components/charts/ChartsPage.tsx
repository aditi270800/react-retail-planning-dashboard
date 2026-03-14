import { useState, useMemo } from 'react'
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { BarChart2, TrendingUp, DollarSign } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectStores, selectChartDataForStore } from '../../store/selectors'
import type { RootState, ChartDataPoint } from '../../types'
import { formatCurrency, formatPercent } from '../../utils/planningCalculations'
import { PageHeader, StatCard } from '../ui'

/* ─── Custom tooltip ─────────────────────────────────────────────────── */
interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-3 shadow-2xl text-xs">
      <div className="font-semibold text-white mb-2 pb-2 border-b border-border">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-400">{p.name}</span>
          </div>
          <span className="font-mono font-bold text-white">
            {p.dataKey === 'gmDollars' ? formatCurrency(p.value) : `${p.value.toFixed(1)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Axis tick ──────────────────────────────────────────────────────── */
function AxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text x={x} y={y} dy={12} textAnchor="middle" fill="#475569" fontSize={10} fontFamily="JetBrains Mono, monospace">
      {payload?.value}
    </text>
  )
}

export function ChartsPage() {
  const stores = useAppSelector(selectStores)
  const [storeId, setStoreId] = useState<string>(() => stores[0]?.id ?? '')

  const chartData: ChartDataPoint[] = useAppSelector(
    (state: RootState) => selectChartDataForStore(state, storeId)
  )

  const kpis = useMemo(() => {
    const totalSales = chartData.reduce((s, d) => s + d.salesDollars, 0)
    const totalGM = chartData.reduce((s, d) => s + d.gmDollars, 0)
    const avgGMPct = totalSales > 0 ? (totalGM / totalSales) * 100 : 0
    return { totalSales, totalGM, avgGMPct }
  }, [chartData])

  const selectedStore = stores.find(s => s.id === storeId)

  const gmColor = (pct: number) =>
    pct >= 40 ? '#4ade80' : pct >= 10 ? '#facc15' : '#f87171'

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl">
        <PageHeader
          title="Charts"
          subtitle="Weekly GM performance aggregated across all SKUs"
          actions={
            stores.length > 0 ? (
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
                className="bg-surface-2 border border-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : undefined
          }
        />

        {stores.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-20 text-center">
            <div className="w-16 h-16 bg-surface-3 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-300 font-semibold">No data to chart</p>
            <p className="text-gray-600 text-sm mt-1">
              Add stores, SKUs, and planning data to see performance charts
            </p>
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Total Sales"
                value={formatCurrency(kpis.totalSales)}
                sub={selectedStore?.name ?? ''}
              />
              <StatCard
                label="Total GM $"
                value={formatCurrency(kpis.totalGM)}
                sub="Gross margin dollars"
              />
              <div className="bg-surface-2 border border-border rounded-xl p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-mono mb-2">Avg GM %</div>
                <div
                  className="text-2xl font-display font-bold"
                  style={{ color: gmColor(kpis.avgGMPct) }}
                >
                  {kpis.avgGMPct.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {kpis.avgGMPct >= 40
                    ? '✓ Healthy margin'
                    : kpis.avgGMPct >= 10
                    ? '⚠ Moderate margin'
                    : '✗ Low margin'}
                </div>
              </div>
            </div>

            {/* Main chart */}
            <div className="bg-surface-1 border border-border rounded-2xl p-5">
              <div className="mb-5">
                <h2 className="text-sm font-display font-bold text-white">
                  Weekly GM Performance — {selectedStore?.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  GM Dollars (bars, left axis) &nbsp;·&nbsp; GM % (line, right axis)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
                  <defs>
                    <linearGradient id="gmBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="week"
                    tick={<AxisTick />}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                    interval={0}
                    height={30}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${(v as number / 1000).toFixed(0)}k`}
                    width={52}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                    domain={[0, 80]}
                    width={42}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      color: '#64748b',
                      fontFamily: 'DM Sans',
                      paddingTop: '16px',
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="gmDollars"
                    name="GM Dollars"
                    fill="url(#gmBar)"
                    stroke="#6366f1"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="gmPercent"
                    name="GM %"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={{ fill: '#4ade80', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: '#4ade80', strokeWidth: 2, fill: '#0f1117' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly breakdown table */}
            <div className="mt-5 bg-surface-1 border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface-2">
                <h3 className="text-sm font-semibold text-white">Weekly Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {['Week', 'Sales $', 'GM $', 'GM %'].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, i) => {
                      const pct = row.gmPercent / 100
                      const bg = pct >= 0.4
                        ? 'rgba(74,222,128,0.15)'
                        : pct >= 0.1
                        ? 'rgba(250,204,21,0.1)'
                        : pct >= 0.05
                        ? 'rgba(251,146,60,0.1)'
                        : 'rgba(248,113,113,0.1)'
                      const tc = pct >= 0.4 ? '#4ade80' : pct >= 0.1 ? '#facc15' : pct >= 0.05 ? '#fb923c' : '#f87171'
                      return (
                        <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-surface-2 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-gray-400">{row.week}</td>
                          <td className="px-4 py-2.5 font-mono text-white">{formatCurrency(row.salesDollars)}</td>
                          <td className="px-4 py-2.5 font-mono text-white">{formatCurrency(row.gmDollars)}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs"
                              style={{ backgroundColor: bg, color: tc }}
                            >
                              {row.gmPercent.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
