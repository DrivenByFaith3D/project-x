'use client'

import { useState } from 'react'

export default function PayButton({ orderId, amount }: { orderId: string; amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Error ${res.status}`)
        setLoading(false)
        return
      }
      if (!data.url) {
        setError('No redirect URL returned')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="shrink-0">
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary whitespace-nowrap"
      >
        {loading ? 'Redirecting…' : `Pay $${amount.toFixed(2)}`}
      </button>
    </div>
  )
}
