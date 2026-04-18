'use client'

import { useState } from 'react'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  maxUses: number | null
  uses: number
  expiresAt: Date | string | null
  active: boolean
  createdAt: Date | string
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, type, value, maxUses: maxUses || null, expiresAt: expiresAt || null }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setCoupons(c => [data, ...c])
    setCode(''); setValue(''); setMaxUses(''); setExpiresAt(''); setShowForm(false)
  }

  async function toggle(id: string, active: boolean) {
    const res = await fetch('/api/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    })
    const data = await res.json()
    if (res.ok) setCoupons(c => c.map(x => x.id === id ? data : x))
  }

  async function remove(id: string) {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' })
    setCoupons(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
        {showForm ? 'Cancel' : '+ New Coupon'}
      </button>

      {showForm && (
        <form onSubmit={create} className="card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Code</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SAVE10" className="input w-full" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value as 'percent' | 'fixed')} className="input w-full">
                <option value="percent">Percent off (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                {type === 'percent' ? 'Discount (%)' : 'Discount ($)'}
              </label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} min="0.01" step="0.01" placeholder={type === 'percent' ? '10' : '5.00'} className="input w-full" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Max Uses (optional)</label>
              <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Unlimited" className="input w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Expiry Date (optional)</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="input w-full" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Creating…' : 'Create Coupon'}</button>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Code</th>
              <th className="px-5 py-3 text-left">Discount</th>
              <th className="px-5 py-3 text-left">Uses</th>
              <th className="px-5 py-3 text-left">Expires</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-600">No coupons yet</td></tr>
            )}
            {coupons.map(c => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-mono font-semibold text-white">{c.code}</td>
                <td className="px-5 py-3 text-zinc-300">
                  {c.type === 'percent' ? `${c.value}% off` : `$${c.value.toFixed(2)} off`}
                </td>
                <td className="px-5 py-3 text-zinc-400">
                  {c.uses}{c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td className="px-5 py-3 text-zinc-400">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-900/40 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(c.id, !c.active)} className="text-xs text-zinc-400 hover:text-white transition-colors">
                      {c.active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
