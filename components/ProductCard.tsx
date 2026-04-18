'use client'

import Image from 'next/image'
import { useState } from 'react'
import StarRating from './StarRating'
import ProductReviews from './ProductReviews'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
}

export default function ProductCard({ product, avgRating, reviewCount, isLoggedIn }: {
  product: Product
  avgRating?: number | null
  reviewCount?: number
  isLoggedIn?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [showReviews, setShowReviews] = useState(false)

  async function handleBuy() {
    setLoading(true)
    const res = await fetch('/api/stripe/product-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden hover:border-zinc-600 transition-colors flex flex-col">
      <div className="aspect-square bg-zinc-800 relative">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-zinc-400 mt-1 line-clamp-2 flex-1">{product.description}</p>
        )}
        {avgRating != null && reviewCount ? (
          <div className="flex items-center gap-1.5 mt-2">
            <StarRating value={Math.round(avgRating)} size="sm" />
            <span className="text-xs text-zinc-500">{avgRating.toFixed(1)} ({reviewCount})</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between mt-3 gap-3">
          <p className="text-white font-bold text-lg">${product.price.toFixed(2)}</p>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="btn-primary text-sm py-1.5 px-4 shrink-0 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Buy Now'}
          </button>
        </div>
        <button
          onClick={() => setShowReviews(v => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2 text-left"
        >
          {showReviews ? 'Hide reviews' : `${reviewCount ? `${reviewCount} review${reviewCount !== 1 ? 's' : ''}` : 'No reviews yet'} — ${isLoggedIn ? 'write one' : 'view'}`}
        </button>
        {showReviews && (
          <div className="border-t border-zinc-800 mt-3 pt-3">
            <ProductReviews productId={product.id} isLoggedIn={!!isLoggedIn} />
          </div>
        )}
      </div>
    </div>
  )
}
