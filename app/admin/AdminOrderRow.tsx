'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
}

const STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed', 'shipped']

interface ShipModalProps {
  orderId: string
  onClose: () => void
  onShipped: () => void
}

function ShipModal({ orderId, onClose, onShipped }: ShipModalProps) {
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
    if (!res.ok) {
      setError(data.error || 'Failed to create label')
      setLoading(false)
      return
    }

    onShipped()
    onClose()
  }

  const inputClass = 'input text-xs py-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Create Shipping Label</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">From Address</h4>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Name" className={inputClass} value={form.fromName} onChange={set('fromName')} required />
              <input placeholder="Street" className={inputClass} value={form.fromStreet} onChange={set('fromStreet')} required />
              <input placeholder="City" className={inputClass} value={form.fromCity} onChange={set('fromCity')} required />
              <input placeholder="State (e.g. CA)" className={inputClass} value={form.fromState} onChange={set('fromState')} required />
              <input placeholder="ZIP" className={inputClass} value={form.fromZip} onChange={set('fromZip')} required />
              <input placeholder="Country (e.g. US)" className={inputClass} value={form.fromCountry} onChange={set('fromCountry')} required />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">To Address</h4>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Name" className={inputClass} value={form.toName} onChange={set('toName')} required />
              <input placeholder="Street" className={inputClass} value={form.toStreet} onChange={set('toStreet')} required />
              <input placeholder="City" className={inputClass} value={form.toCity} onChange={set('toCity')} required />
              <input placeholder="State (e.g. CA)" className={inputClass} value={form.toState} onChange={set('toState')} required />
              <input placeholder="ZIP" className={inputClass} value={form.toZip} onChange={set('toZip')} required />
              <input placeholder="Country (e.g. US)" className={inputClass} value={form.toCountry} onChange={set('toCountry')} required />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Parcel (inches / lbs)</h4>
            <div className="grid grid-cols-4 gap-2">
              <input placeholder="Length (in)" className={inputClass} value={form.length} onChange={set('length')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Width (in)" className={inputClass} value={form.width} onChange={set('width')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Height (in)" className={inputClass} value={form.height} onChange={set('height')} type="number" min="0.1" step="0.1" required />
              <input placeholder="Weight (lb)" className={inputClass} value={form.weight} onChange={set('weight')} type="number" min="0.1" step="0.1" required />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

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
    if (newStatus === 'shipped') {
      setShowShipModal(true)
      return
    }
    setUpdating(true)
    await fetch('/api/orders/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, status: newStatus }),
    })
    setStatus(newStatus)
    setUpdating(false)
  }

  function handleShipped() {
    setStatus('shipped')
    router.refresh()
  }

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-5 py-4">
          <Link href={`/orders/${order.id}`} className="text-brand-600 hover:underline font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </Link>
        </td>
        <td className="px-5 py-4 text-gray-600">
          {(order as Order & { profiles?: { email: string } }).profiles?.email || '—'}
        </td>
        <td className="px-5 py-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-5 py-4 text-gray-500">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-5 py-4">
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            disabled={updating}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </td>
      </tr>

      {showShipModal && (
        <ShipModal
          orderId={order.id}
          onClose={() => setShowShipModal(false)}
          onShipped={handleShipped}
        />
      )}
    </>
  )
}
