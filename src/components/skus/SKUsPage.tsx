import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tag, TrendingUp } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { addSKU, updateSKU, deleteSKU } from '../../store/slices/skuSlice'
import { selectSKUs } from '../../store/selectors'
import type { SKU } from '../../types'
import { Modal, Button, Input, PageHeader, Badge } from '../ui'
import { formatCurrency } from '../../utils/planningCalculations'

function genId() { return 'SKU' + Date.now().toString().slice(-6) }

interface Form { name: string; price: string; cost: string }

export function SKUsPage() {
  const dispatch = useAppDispatch()
  const skus = useAppSelector(selectSKUs)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SKU | null>(null)
  const [form, setForm] = useState<Form>({ name: '', price: '', cost: '' })
  const [errors, setErrors] = useState<Partial<Form>>({})

  const openAdd = useCallback(() => {
    setEditing(null); setForm({ name: '', price: '', cost: '' }); setErrors({}); setShowModal(true)
  }, [])

  const openEdit = useCallback((sku: SKU) => {
    setEditing(sku)
    setForm({ name: sku.name, price: String(sku.price), cost: String(sku.cost) })
    setErrors({}); setShowModal(true)
  }, [])

  const setField = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = (): boolean => {
    const errs: Partial<Form> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.price || isNaN(+form.price) || +form.price <= 0) errs.price = 'Must be > 0'
    if (form.cost === '' || isNaN(+form.cost) || +form.cost < 0) errs.cost = 'Must be ≥ 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = useCallback(() => {
    if (!validate()) return
    const payload = { name: form.name.trim(), price: +form.price, cost: +form.cost }
    if (editing) dispatch(updateSKU({ ...editing, ...payload }))
    else dispatch(addSKU({ id: genId(), ...payload }))
    setShowModal(false)
  }, [dispatch, editing, form])

  const del = useCallback((id: string) => {
    if (confirm('Delete this SKU? Its planning data will also be removed.')) dispatch(deleteSKU(id))
  }, [dispatch])

  const margin = (price: number, cost: number) =>
    price > 0 ? ((price - cost) / price) * 100 : 0

  const marginColor = (m: number) =>
    m >= 40 ? 'green' : m >= 10 ? 'yellow' : 'red'

  const liveMargin = form.price && form.cost ? margin(+form.price, +form.cost) : null

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl">
        <PageHeader
          title="SKUs"
          subtitle={`${skus.length} product${skus.length !== 1 ? 's' : ''} configured`}
          actions={
            <Button variant="primary" onClick={openAdd}>
              <Plus size={14} /> Add SKU
            </Button>
          }
        />

        {skus.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-surface-3 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Tag size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-300 font-semibold">No SKUs yet</p>
            <p className="text-gray-600 text-sm mt-1">Add products with price and cost to enable planning</p>
            <Button variant="primary" size="sm" onClick={openAdd} className="mt-5">
              <Plus size={13} /> Add SKU
            </Button>
          </div>
        ) : (
          <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-3 px-4 py-2.5 border-b border-border bg-surface-2">
              {['Product', 'Price', 'Cost', 'Margin', 'Actions'].map(h => (
                <div key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${h !== 'Product' ? 'text-right' : ''}`}>{h}</div>
              ))}
            </div>
            {skus.map(sku => {
              const m = margin(sku.price, sku.cost)
              return (
                <div
                  key={sku.id}
                  className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-3 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{sku.name}</div>
                    <div className="text-xs text-gray-600 font-mono mt-0.5">{sku.id}</div>
                  </div>
                  <div className="text-sm text-white font-mono text-right">{formatCurrency(sku.price)}</div>
                  <div className="text-sm text-gray-400 font-mono text-right">{formatCurrency(sku.cost)}</div>
                  <div className="text-right">
                    <Badge color={marginColor(m) as 'green' | 'yellow' | 'red'}>
                      {m.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(sku)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-300 hover:bg-brand-900/30 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => del(sku.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit SKU' : 'Add SKU'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Input label="SKU ID" value={editing?.id ?? genId()} disabled className="opacity-50 cursor-not-allowed" />
            <Input
              label="SKU Name"
              placeholder="e.g. Premium Denim Jacket"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              error={errors.name}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Selling Price ($)"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={e => setField('price', e.target.value)}
                error={errors.price}
                min={0} step={0.01}
              />
              <Input
                label="Unit Cost ($)"
                type="number"
                placeholder="0.00"
                value={form.cost}
                onChange={e => setField('cost', e.target.value)}
                error={errors.cost}
                min={0} step={0.01}
              />
            </div>
            {liveMargin !== null && !errors.price && !errors.cost && (
              <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2.5">
                <TrendingUp size={13} className="text-gray-500" />
                <span className="text-xs text-gray-500">Gross Margin:</span>
                <span className={`text-xs font-bold font-mono ${
                  liveMargin >= 40 ? 'text-green-400' : liveMargin >= 10 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {liveMargin.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-600 ml-1">
                  ({formatCurrency(+form.price - +form.cost)} / unit)
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={submit}>
                {editing ? 'Save Changes' : 'Add SKU'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
