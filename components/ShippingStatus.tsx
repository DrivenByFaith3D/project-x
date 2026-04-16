'use client'

import { useEffect, useState } from 'react'
import type { Order, TrackingInfo } from '@/types'

export default function ShippingStatus({ order }: { order: Order }) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTracking() {
      if (!order.tracking_number || !order.carrier) { setLoading(false); return }
      try {
        const res = await fetch(
          `/api/shippo/track?carrier=${encodeURIComponent(order.carrier)}&tracking_number=${encodeURIComponent(order.tracking_number)}`
        )
        const data = await res.json()
        if (res.ok) setTracking(data)
        else setError(data.error || 'Unable to fetch tracking')
      } catch {
        setError('Failed to load tracking info')
      } finally {
        setLoading(false)
      }
    }
    fetchTracking()
  }, [order.tracking_number, order.carrier])

  return (
    <div className="card p-5">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Shipping Status</h2>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading tracking…
        </div>
      )}

      {!loading && error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && !tracking && (
        <div className="text-sm text-zinc-400 space-y-1">
          <p><span className="text-zinc-500">Carrier:</span> {order.carrier}</p>
          <p><span className="text-zinc-500">Tracking #:</span> {order.tracking_number}</p>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
              className="text-white hover:underline inline-block mt-1">Track on carrier site →</a>
          )}
        </div>
      )}

      {tracking && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Carrier', value: tracking.carrier },
              { label: 'Tracking #', value: tracking.tracking_number },
              { label: 'Status', value: tracking.status?.replace(/_/g, ' ') },
              ...(tracking.eta ? [{ label: 'Est. Delivery', value: new Date(tracking.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }] : []),
            ].map((item) => (
              <div key={item.label} className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="font-medium text-sm text-white capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          {tracking.tracking_history?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">History</p>
              <div className="space-y-3">
                {tracking.tracking_history.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-white' : 'bg-zinc-600'}`} />
                      {i < tracking.tracking_history.length - 1 && <div className="w-0.5 bg-zinc-700 flex-1 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="font-medium text-white">{event.description || event.status}</p>
                      {event.location && <p className="text-zinc-500 text-xs">{event.location}</p>}
                      <p className="text-zinc-600 text-xs">
                        {new Date(event.status_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tracking.tracking_url && (
            <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white transition-colors">
              View full tracking on carrier site →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
