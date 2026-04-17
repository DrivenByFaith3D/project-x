'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function PayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { orderId } = useParams<{ orderId: string }>()
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/pay/${orderId}`)
      return
    }
    if (status !== 'authenticated') return

    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url
        } else {
          setError(data.error || 'Something went wrong')
        }
      })
      .catch(() => setError('Failed to start checkout'))
  }, [status, orderId, router])

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm text-center space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <Link href={`/orders/${orderId}`} className="btn-secondary w-full inline-block text-center">
            View Order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm text-center space-y-4">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Redirecting to checkout…</p>
      </div>
    </div>
  )
}
