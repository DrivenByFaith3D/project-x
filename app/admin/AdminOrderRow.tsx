'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_STYLES, formatOrderId } from '@/lib/constants'

type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'shipped'

const STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed', 'shipped']

interface Order {
  id: string
  status: string
  description: string
  createdAt: Date
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

export default function AdminOrderRow({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status as OrderStatus)
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

  return (
    <>
      <tr className="hover:bg-zinc-800/50 transition-colors">
        <td className="px-5 py-4">
          <Link href={`/orders/${order.id}`} className="text-zinc-300 hover:text-white font-mono">
            {formatOrderId(order.id)}
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
          <select value={status} onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            disabled={updating}
            className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 focus:outline-none disabled:opacity-50">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </td>
      </tr>
      {showShipModal && (
        <ShipModal orderId={order.id} onClose={() => setShowShipModal(false)}
          onShipped={() => { setStatus('shipped'); router.refresh() }} />
      )}
    </>
  )
}
