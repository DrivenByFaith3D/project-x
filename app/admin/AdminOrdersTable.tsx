'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_STYLES, formatOrderId } from '@/lib/constants'

type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'shipped'
const STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed', 'shipped']

interface Order {
  id: string
  orderNumber?: string | null
  status: string
  description: string
  createdAt: Date
  archivedAt?: Date | null
  deletedAt?: Date | null
  userEmail: string
}

function ShipModal({ orderId, onClose, onShipped }: { orderId: string; onClose: () => void; onShipped: () => void }) {
  const [form, setForm] = useState({
    fromName: '', fromStreet: '', fromCity: '', fromState: '', fromZip: '', fromCountry: 'US',
    toName: '', toStreet: '', toCity: '', toState: '', toZip: '', toCountry: 'US',
    length: '6', width: '4', height: '3', weight: '1',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/shippo/create-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    onShipped(); onClose()
  }

  const inp = 'input text-xs py-1.5'

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Create Shipping Label</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">From Address</h4>
            <div className="grid grid-cols-2 gap-2">
              {(['fromName','fromStreet','fromCity','fromState','fromZip','fromCountry'] as const).map((f) => (
                <input key={f} placeholder={f.replace('from','')} className={inp} value={form[f]} onChange={set(f)} required />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">To Address</h4>
            <div className="grid grid-cols-2 gap-2">
              {(['toName','toStreet','toCity','toState','toZip','toCountry'] as const).map((f) => (
                <input key={f} placeholder={f.replace('to','')} className={inp} value={form[f]} onChange={set(f)} required />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Parcel (in / lb)</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['length','width','height','weight'] as const).map((f) => (
                <input key={f} placeholder={f} className={inp} value={form[f]} onChange={set(f)} type="number" min="0.1" step="0.1" required />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create & Mark Shipped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderRow({ order, tab, onAction }: { order: Order; tab: string; onAction: () => void }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status as OrderStatus)
  const [showShipModal, setShowShipModal] = useState(false)
  const [busy, setBusy] = useState(false)

  async function updateStatus(newStatus: OrderStatus) {
    if (newStatus === 'shipped') { setShowShipModal(true); return }
    setBusy(true)
    await fetch('/api/orders/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: newStatus }),
    })
    setStatus(newStatus)
    setBusy(false)
  }

  async function doAction(action: 'archive' | 'delete' | 'restore') {
    if (action === 'delete' && !confirm('Move this order to trash? It will be permanently deleted after 30 days.')) return
    setBusy(true)
    await fetch('/api/orders/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, action }),
    })
    onAction()
  }

  const daysLeft = order.deletedAt
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(order.deletedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <>
      <tr className="hover:bg-zinc-800/50 transition-colors">
        <td className="px-5 py-4">
          <Link href={`/orders/${order.id}`} className="text-zinc-300 hover:text-white font-mono">
            {formatOrderId(order)}
          </Link>
        </td>
        <td className="px-5 py-4 text-zinc-400">{order.userEmail}</td>
        <td className="px-5 py-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-5 py-4 text-zinc-500">
          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-5 py-4">
          {tab === 'active' && (
            <div className="flex items-center gap-2">
              <select value={status} onChange={(e) => updateStatus(e.target.value as OrderStatus)}
                disabled={busy}
                className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 focus:outline-none disabled:opacity-50">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <button onClick={() => doAction('archive')} disabled={busy}
                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors px-1.5 py-1 rounded hover:bg-amber-400/10 disabled:opacity-40"
                title="Archive">
                Archive
              </button>
              <button onClick={() => doAction('delete')} disabled={busy}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-1.5 py-1 rounded hover:bg-red-400/10 disabled:opacity-40"
                title="Move to trash">
                Delete
              </button>
            </div>
          )}
          {tab === 'archived' && (
            <button onClick={() => doAction('restore')} disabled={busy}
              className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-40">
              Restore
            </button>
          )}
          {tab === 'trash' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-600">
                {daysLeft === 0 ? 'Deletes today' : `${daysLeft}d left`}
              </span>
              <button onClick={() => doAction('restore')} disabled={busy}
                className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 disabled:opacity-40">
                Restore
              </button>
            </div>
          )}
        </td>
      </tr>
      {showShipModal && (
        <ShipModal orderId={order.id} onClose={() => setShowShipModal(false)}
          onShipped={() => { setStatus('shipped'); router.refresh() }} />
      )}
    </>
  )
}

type Tab = 'active' | 'archived' | 'trash'

export default function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('active')

  const active   = initialOrders.filter(o => !o.archivedAt && !o.deletedAt)
  const archived = initialOrders.filter(o => !!o.archivedAt && !o.deletedAt)
  const trash    = initialOrders.filter(o => !!o.deletedAt)

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'active',   label: 'Active',   count: active.length },
    { id: 'archived', label: 'Archived', count: archived.length },
    { id: 'trash',    label: 'Trash',    count: trash.length },
  ]

  const rows = tab === 'active' ? active : tab === 'archived' ? archived : trash

  return (
    <div className="card overflow-hidden">
      {/* Header with tabs */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
        <h2 className="font-semibold text-white">All Orders</h2>
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                tab === t.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-zinc-600 text-zinc-200' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'trash' && trash.length > 0 && (
        <div className="px-5 py-2.5 bg-red-950/30 border-b border-red-900/40 text-xs text-red-400">
          Orders in trash are permanently deleted after 30 days.
        </div>
      )}

      {tab === 'archived' && (
        <div className="px-5 py-2.5 bg-amber-950/30 border-b border-amber-900/40 text-xs text-amber-400">
          Archived orders are kept permanently and can be restored at any time.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Order ID</th>
              <th className="px-5 py-3 text-left">Customer</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((order) => (
              <OrderRow key={order.id} order={order} tab={tab} onAction={() => router.refresh()} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-600">
                  {tab === 'active' ? 'No active orders' : tab === 'archived' ? 'No archived orders' : 'Trash is empty'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
