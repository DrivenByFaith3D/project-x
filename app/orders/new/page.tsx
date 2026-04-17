'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type OrderType = 'stl' | 'image' | 'scratch' | null

const ORDER_TYPES = [
  {
    id: 'stl' as OrderType,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'I have an STL file',
    description: 'Upload your ready-to-print 3D model file',
    accept: '.stl',
    fileLabel: 'Upload STL File',
    placeholder: 'Describe material, color, quantity, finish, or any special requirements…',
  },
  {
    id: 'image' as OrderType,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'I have an image or reference',
    description: 'Share a photo or reference of what you want printed',
    accept: '.png,.jpg,.jpeg,.gif,.webp',
    fileLabel: 'Upload Image',
    placeholder: 'Describe what you want — dimensions, material, color, how it will be used…',
  },
  {
    id: 'scratch' as OrderType,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Starting from scratch',
    description: 'Have an idea but no files yet — describe your vision',
    accept: '',
    fileLabel: '',
    placeholder: 'Tell us your idea — what do you want to create? Include any details about size, function, style, or inspiration…',
  },
]

export default function NewOrderPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [orderType, setOrderType] = useState<OrderType>(null)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedType = ORDER_TYPES.find(t => t.id === orderType)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) { router.push('/login'); return }
    setError('')
    setLoading(true)

    // Create the order
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, orderType }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }

    // Upload file if provided
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', data.id)
      await fetch('/api/upload', { method: 'POST', body: formData })
    }

    router.push(`/orders/${data.id}`)
  }

  // Step 1 — choose type
  if (!orderType) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-white">Start a Custom Order</h1>
          <p className="text-zinc-400 text-sm mt-2">How would you like to get started?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ORDER_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setOrderType(type.id)}
              className="card p-6 text-left hover:border-zinc-500 transition-all group flex flex-col gap-4"
            >
              <div className="text-zinc-400 group-hover:text-white transition-colors">
                {type.icon}
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm mb-1">{type.title}</h2>
                <p className="text-zinc-500 text-xs leading-relaxed">{type.description}</p>
              </div>
              <div className="mt-auto">
                <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">Get started →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 2 — fill in details
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => { setOrderType(null); setFile(null); setDescription('') }}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-zinc-400">{selectedType?.icon}</span>
          <h1 className="text-2xl font-bold text-white">{selectedType?.title}</h1>
        </div>
        <p className="text-zinc-400 text-sm">{selectedType?.description}</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* File upload (not for scratch) */}
          {orderType !== 'scratch' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{selectedType?.fileLabel}</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  file ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-zinc-300 truncate max-w-xs">{file.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="text-zinc-500 hover:text-white text-xs ml-1">✕</button>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-zinc-400">Click to upload</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {orderType === 'stl' ? 'STL files up to 50MB' : 'PNG, JPG, GIF, WebP up to 50MB'}
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={selectedType?.accept}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-zinc-300">
                Description <span className="text-zinc-500">*</span>
              </label>
              <span className={`text-xs ${description.length > 900 ? description.length >= 1000 ? 'text-red-400' : 'text-amber-400' : 'text-zinc-600'}`}>
                {description.length}/1000
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              className="input resize-none"
              rows={5}
              placeholder={selectedType?.placeholder}
              maxLength={1000}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !description.trim()} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
