'use client'

import { useState } from 'react'

export default function PayButton({ orderId, amount }: { orderId: string; amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }
    window.location.href = data.url
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
