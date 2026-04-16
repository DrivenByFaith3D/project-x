'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-300',
  in_progress: 'bg-zinc-700 text-white',
  completed: 'bg-white text-black',
  shipped: 'bg-zinc-300 text-black',
}

const STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed', 'shipped']

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
    setLoading(true)
    setError('')

    const res = await fetch('/api/shippo/create-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, ...form }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to create label'); setLoading(false); return }

    onShipped()
    onClose()
  }

  const inp = 'input text-xs py-1.5'

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Create Shipping Label</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">From Address</h4>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Name" className={inp} value={form.fromName} onChange={set('fromName')} required />
              <input placeholder="Street" className={inp} value={form.fromStreet} onChange={set('fromStreet')} required />
              <input placeholder="City" className={inp} value={form.fromCity} onChange={set('fromCity')} required />
              <input placeholder="State (e.g. CA)" className={inp} value={form.fromState} onChange={set('fromState')} required />
              <input placeholder="ZIP" className={inp} value={form.fromZip} onChange={set('fromZip')} required />
              <input placeholder="Country (e.g. US)" className={inp} value={form.fromCountry} onChange={set('fromCountry')} required />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">To Address</h4>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Name" className={inp} value={form.toName} onChange={set('toName')} required />
              <input placeholder="Street" className={inp} value={form.toStreet} onChange={set('toStreet')} required />
              <input placeholder="City" className={inp} value={form.toCity} onChange={set('toCity')} required />
              <input placeholder="State (e.g. CA)" className={inp} value={form.toState} onChange={set('toState')} required />
              <input placeholder="ZIP" className={inp} value={form.toZip} onChange={set('toZip')} required />
              <input placeholder="Country (e.g. US)" className={inp} value={form.toCountry} onChange={set('toCountry')} required />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Parcel (inches / lbs)</h4>
            <div className="grid grid-cols-4 gap-2">
              <input placeholder="Length" className={inp} value={form.length} onChange={set('length')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Width" className={inp} value={form.width} onChange={set('width')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Height" className={inp} value={form.height} onChange={set('height')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Weight" className={inp} value={form.weight} onChange={set('weight')} type="number" min="0.1" step="0.1" required />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating label…' : 'Create & Mark Shipped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminOrderRow({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [showShipModal, setShowShipModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function updateStatus(newStatus: OrderStatus) {
    if (newStatus === 'shipped') { setShowShipModal(true); return }
    setUpdating(true)
    await fetch('/api/orders/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: newStatus }),
    })
    setStatus(newStatus)
    setUpdating(false)
  }

  function handleShipped() { setStatus('shipped'); router.refresh() }

  return (
    <>
      <tr className="hover:bg-zinc-800/50 transition-colors">
        <td className="px-5 py-4">
          <Link href={`/orders/${order.id}`} className="text-zinc-300 hover:text-white font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </Link>
        </td>
        <td className="px-5 py-4 text-zinc-400">
          {(order as Order & { profiles?: { email: string } }).profiles?.email || '—'}
        </td>
        <td className="px-5 py-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-5 py-4 text-zinc-500">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-5 py-4">
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            disabled={updating}
            className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/30 disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </td>
      </tr>
      {showShipModal && (
        <ShipModal orderId={order.id} onClose={() => setShowShipModal(false)} onShipped={handleShipped} />
      )}
    </>
  )
}
