'use client'

import { useState } from 'react'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minQuantity: number | null
  minOrderValue: number | null
}

export default function CouponInput({ price, quantity = 1, onApply }: {
  price: number
  quantity?: number
  onApply: (coupon: Coupon | null, discountedPrice: number) => void
}) {
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<Coupon | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function apply() {
    if (!code.trim()) return
    setLoading(true); setError('')
    const res = await fetch(`/api/coupons?code=${encodeURIComponent(code.trim())}`)
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (data.minQuantity && quantity < data.minQuantity) {
      setError(`This coupon requires a minimum of ${data.minQuantity} items`)
      return
    }
    if (data.minOrderValue && price < data.minOrderValue) {
      setError(`This coupon requires a minimum order of $${data.minOrderValue.toFixed(2)}`)
      return
    }
    const discounted = data.type === 'percent'
      ? price * (1 - data.value / 100)
      : Math.max(0, price - data.value)
    setApplied(data)
    onApply(data, Math.round(discounted * 100) / 100)
  }

  function remove() {
    setApplied(null)
    setCode('')
    setError('')
    onApply(null, price)
  }

  return (
    <div className="space-y-2">
      {applied ? (
        <div className="flex items-center justify-between bg-green-950/30 border border-green-800/40 rounded-lg px-3 py-2">
          <div>
            <span className="text-green-400 text-sm font-semibold">{applied.code}</span>
            <span className="text-green-300 text-xs ml-2">
              {applied.type === 'percent' ? `${applied.value}% off` : `$${applied.value.toFixed(2)} off`}
              {(applied.minQuantity || applied.minOrderValue) && (
                <span className="text-green-600 ml-1">
                  {applied.minQuantity ? `· ${applied.minQuantity}+ items` : ''}
                  {applied.minOrderValue ? `· $${applied.minOrderValue.toFixed(2)}+ order` : ''}
                </span>
              )}
            </span>
          </div>
          <button onClick={remove} className="text-xs text-zinc-500 hover:text-white transition-colors">Remove</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="input flex-1 text-sm"
            onKeyDown={e => e.key === 'Enter' && apply()}
          />
          <button onClick={apply} disabled={loading} className="btn-secondary text-sm px-3">
            {loading ? '…' : 'Apply'}
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
