'use client'

import { useState, useEffect } from 'react'

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

const empty = { label: '', street: '', city: '', state: '', zip: '', country: 'US', isDefault: false }

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null) // id or 'new'
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/addresses')
    if (res.ok) setAddresses(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setForm(empty)
    setEditing('new')
    setError('')
  }

  function startEdit(addr: Address) {
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, isDefault: addr.isDefault })
    setEditing(addr.id)
    setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const isNew = editing === 'new'
    const res = await fetch('/api/addresses', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isNew ? form : { id: editing, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setEditing(null)
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this address?')) return
    await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' })
    load()
  }

  async function setDefault(id: string) {
    await fetch('/api/addresses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDefault: true }),
    })
    load()
  }

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Saved Addresses</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Up to 3 addresses. Used for shipping your orders.</p>
        </div>
        {addresses.length < 3 && editing !== 'new' && (
          <button onClick={startNew} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors">
            + Add Address
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id}>
              {editing === addr.id ? (
                <AddressForm
                  form={form}
                  setForm={setForm}
                  onSave={handleSave}
                  onCancel={() => setEditing(null)}
                  saving={saving}
                  error={error}
                />
              ) : (
                <div className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${addr.isDefault ? 'border-zinc-500 bg-zinc-800/60' : 'border-zinc-800 bg-zinc-800/30'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-300">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{addr.street}</p>
                    <p className="text-xs text-zinc-400">{addr.city}, {addr.state} {addr.zip} · {addr.country}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)} className="text-xs text-zinc-500 hover:text-white transition-colors">
                        Set default
                      </button>
                    )}
                    <button onClick={() => startEdit(addr)} className="text-xs text-zinc-500 hover:text-white transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addresses.length === 0 && editing !== 'new' && (
            <p className="text-sm text-zinc-500 py-2">No saved addresses yet.</p>
          )}

          {editing === 'new' && (
            <AddressForm
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              saving={saving}
              error={error}
            />
          )}
        </div>
      )}
    </div>
  )
}

function AddressForm({ form, setForm, onSave, onCancel, saving, error }: {
  form: typeof empty
  setForm: (f: typeof empty) => void
  onSave: (e: React.FormEvent) => void
  onCancel: () => void
  saving: boolean
  error: string
}) {
  const field = (label: string, key: keyof typeof form, opts?: { placeholder?: string; maxLength?: number }) => (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      <input
        type="text"
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="input text-sm"
        placeholder={opts?.placeholder}
        maxLength={opts?.maxLength}
        required={key !== 'country'}
      />
    </div>
  )

  return (
    <form onSubmit={onSave} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
      {field('Label (e.g. "Home", "Work")', 'label', { placeholder: 'Home' })}
      {field('Street Address', 'street', { placeholder: '123 Main St' })}
      <div className="grid grid-cols-2 gap-3">
        {field('City', 'city', { placeholder: 'Springfield' })}
        {field('State', 'state', { placeholder: 'NJ', maxLength: 2 })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field('ZIP', 'zip', { placeholder: '07081' })}
        {field('Country', 'country', { placeholder: 'US', maxLength: 2 })}
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          className="accent-blue-600"
        />
        <span className="text-xs text-zinc-400">Set as default address</span>
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm py-1.5 px-4">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-1.5 px-4">
          Cancel
        </button>
      </div>
    </form>
  )
}
