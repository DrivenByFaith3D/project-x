'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewOrderPage() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({ user_id: user.id, description, status: 'pending' })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Custom Order</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe what you need and upload your files in the order chat.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={5}
              placeholder="Describe your project: material preferences, dimensions, quantity, intended use, any special requirements…"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !description.trim()} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-brand-50 border border-brand-200 rounded-lg p-4 text-sm text-brand-700">
        <strong>What happens next?</strong> Once you create your order, you'll be taken to a dedicated
        chat where you can upload STL files, share reference images, and communicate directly with our team.
      </div>
    </div>
  )
}
