'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  createdAt: Date
  reviewCount?: number
  avgRating?: number
}

const EMPTY_FORM = { name: '', description: '', price: '', imageUrl: '' }

export default function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  function openEdit(p: Product) {
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), imageUrl: p.imageUrl ?? '' })
    setEditingId(p.id)
    setShowForm(true)
    setError('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) { setError('Name and price are required'); return }
    setLoading(true)
    setError('')

    const method = editingId ? 'PATCH' : 'POST'
    const body = editingId
      ? { id: editingId, ...form }
      : form

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Something went wrong'); return }

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...data } : p))
    } else {
      setProducts([data, ...products])
    }
    cancelForm()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setLoading(true)
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setProducts(products.filter(p => p.id !== id))
    setLoading(false)
  }

  return (
    <div>
      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-base font-semibold text-white mb-5">{editingId ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name <span className="text-zinc-500">*</span></label>
                <input className="input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Custom Phone Stand" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Price (USD) <span className="text-zinc-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <input className="input w-full pl-7" type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" required />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
              <textarea className="input resize-none w-full" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the product…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Image URL</label>
              <input className="input w-full" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
              {form.imageUrl && (
                <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                  <Image src={form.imageUrl} alt="Preview" width={96} height={96} className="object-cover w-full h-full" unoptimized />
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      {!showForm && (
        <div className="flex justify-end mb-4">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Product
          </button>
        </div>
      )}

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="card p-12 text-center text-zinc-600">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-zinc-400 font-medium">No products yet</p>
          <p className="text-sm mt-1">Create your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="card overflow-hidden flex flex-col">
              {product.imageUrl ? (
                <div className="aspect-video bg-zinc-800 overflow-hidden">
                  <Image src={product.imageUrl} alt={product.name} width={400} height={225} className="object-cover w-full h-full" unoptimized />
                </div>
              ) : (
                <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm leading-snug">{product.name}</h3>
                  <span className="text-white font-bold text-sm shrink-0">${product.price.toFixed(2)}</span>
                </div>
                {product.description && (
                  <p className="text-zinc-500 text-xs leading-relaxed mb-3 flex-1">{product.description}</p>
                )}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-zinc-800">
                  <button onClick={() => openEdit(product)} disabled={loading}
                    className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-40">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} disabled={loading}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10 disabled:opacity-40">
                    Delete
                  </button>
                  <span className="ml-auto text-xs text-zinc-700">
                    {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
