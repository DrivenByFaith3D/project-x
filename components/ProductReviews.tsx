'use client'

import { useState, useEffect } from 'react'
import StarRating from './StarRating'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  userName: string
}

export default function ProductReviews({ productId, isLoggedIn }: { productId: string; isLoggedIn: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(data => { setReviews(data); setLoading(false) })
  }, [productId])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Please select a rating'); return }
    setSubmitting(true); setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, comment }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to submit'); setSubmitting(false); return }
    setSubmitted(true); setSubmitting(false)
    // Refresh reviews
    fetch(`/api/reviews?productId=${productId}`).then(r => r.json()).then(setReviews)
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-white">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} size="sm" />
            <span className="text-sm text-zinc-400">{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {isLoggedIn && !submitted && (
        <form onSubmit={submitReview} className="card p-5 mb-6 space-y-3">
          <p className="text-sm font-medium text-zinc-300">Leave a review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            className="input w-full resize-none"
            rows={3}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary text-sm">
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}
      {submitted && (
        <div className="card p-4 mb-6 border border-green-800/40 bg-green-950/10 text-green-400 text-sm">
          Thanks for your review!
        </div>
      )}

      {loading ? (
        <p className="text-zinc-600 text-sm">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-zinc-600 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="card p-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{r.userName}</span>
                  <StarRating value={r.rating} size="sm" />
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {r.comment && <p className="text-sm text-zinc-300">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
