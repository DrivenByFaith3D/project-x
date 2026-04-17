'use client'

import { useState } from 'react'

interface Props {
  orderId: string
  initialDescription: string
  canEdit: boolean // only when status === 'pending' and user is owner
}

export default function OrderDescription({ orderId, initialDescription, canEdit }: Props) {
  const [description, setDescription] = useState(initialDescription)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialDescription)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!draft.trim() || draft.trim() === description) { setEditing(false); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/orders/description', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, description: draft.trim() }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Failed to save'); return }
    setDescription(data.description)
    setEditing(false)
  }

  function cancel() {
    setDraft(description)
    setEditing(false)
    setError('')
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Description</h2>
        {canEdit && !editing && (
          <button onClick={() => { setDraft(description); setEditing(true) }}
            className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800">
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <div className="flex justify-end mb-1">
              <span className={`text-xs ${draft.length > 900 ? draft.length >= 1000 ? 'text-red-400' : 'text-amber-400' : 'text-zinc-600'}`}>
                {draft.length}/1000
              </span>
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value.slice(0, 1000))}
              className="input resize-none w-full"
              rows={5}
              maxLength={1000}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button onClick={cancel} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
            <button onClick={save} disabled={saving || !draft.trim()} className="btn-primary text-sm px-3 py-1.5">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-zinc-200 whitespace-pre-wrap">{description}</p>
      )}
    </div>
  )
}
