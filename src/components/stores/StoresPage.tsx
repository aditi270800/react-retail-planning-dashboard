import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Store } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { addStore, updateStore, deleteStore, reorderStores } from '../../store/slices/storeSlice'
import { selectStores } from '../../store/selectors'
import type { Store as StoreType } from '../../types'
import { Modal, Button, Input, PageHeader, Badge } from '../ui'

function genId() { return 'ST' + Date.now().toString().slice(-6) }

export function StoresPage() {
  const dispatch = useAppDispatch()
  const stores = useAppSelector(selectStores)
  const sorted = [...stores].sort((a, b) => a.order - b.order)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<StoreType | null>(null)
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const openAdd = useCallback(() => {
    setEditing(null); setName(''); setNameErr(''); setShowModal(true)
  }, [])

  const openEdit = useCallback((s: StoreType) => {
    setEditing(s); setName(s.name); setNameErr(''); setShowModal(true)
  }, [])

  const submit = useCallback(() => {
    if (!name.trim()) { setNameErr('Store name is required'); return }
    if (editing) {
      dispatch(updateStore({ ...editing, name: name.trim() }))
    } else {
      dispatch(addStore({ id: genId(), name: name.trim(), order: stores.length }))
    }
    setShowModal(false)
  }, [dispatch, editing, name, stores.length])

  const handleDelete = useCallback((id: string) => {
    if (confirm('Delete this store? Its planning data will also be removed.')) dispatch(deleteStore(id))
  }, [dispatch])

  const onDragStart = (i: number) => setDragIdx(i)
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const arr = [...sorted]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(i, 0, moved)
    dispatch(reorderStores(arr.map((s, idx) => ({ ...s, order: idx }))))
    setDragIdx(i)
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl">
        <PageHeader
          title="Stores"
          subtitle={`${stores.length} store${stores.length !== 1 ? 's' : ''} configured`}
          actions={
            <Button variant="primary" onClick={openAdd}>
              <Plus size={14} /> Add Store
            </Button>
          }
        />

        {sorted.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
            <div className="w-14 h-14 bg-surface-3 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Store size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-300 font-semibold">No stores yet</p>
            <p className="text-gray-600 text-sm mt-1">Add your first store to get started with planning</p>
            <Button variant="primary" size="sm" onClick={openAdd} className="mt-5">
              <Plus size={13} /> Add Store
            </Button>
          </div>
        ) : (
          <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-2">
              <div />
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">Order</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-right">Actions</div>
            </div>
            {sorted.map((store, i) => (
              <div
                key={store.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDragEnd={() => setDragIdx(null)}
                className={`grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors select-none ${
                  dragIdx === i ? 'bg-brand-900/20 border-brand-700/40' : 'hover:bg-surface-2'
                }`}
              >
                <div className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{store.name}</div>
                  <div className="text-xs text-gray-600 font-mono mt-0.5">{store.id}</div>
                </div>
                <div className="w-16 flex justify-center">
                  <Badge color="gray">#{i + 1}</Badge>
                </div>
                <div className="w-20 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(store)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-300 hover:bg-brand-900/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Store' : 'Add Store'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Input label="Store ID" value={editing?.id ?? genId()} disabled className="opacity-50 cursor-not-allowed" />
            <Input
              label="Store Name"
              placeholder="e.g. Manhattan Flagship"
              value={name}
              onChange={e => { setName(e.target.value); setNameErr('') }}
              error={nameErr}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={submit}>
                {editing ? 'Save Changes' : 'Add Store'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
